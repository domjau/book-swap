// Run: npm i --no-save isbn3@2.0.13 && node supabase/functions/isbn-lookup/lnb_test.mjs
import ISBN from 'isbn3';
import { toIsbn13, candidates, plan, askLibrary, recordHasIsbn, bestRecord, mapRecord, mapAge, mapLang, cleanAuthor, queryUrl, rowsOf } from './lnb.js';

let pass = 0, fail = 0;
const eq = (name, got, want) => { const ok = JSON.stringify(got) === JSON.stringify(want); ok ? pass++ : fail++; console.log((ok ? '  ok   ' : '  FAIL ') + name + (ok ? '' : '  got ' + JSON.stringify(got) + ' want ' + JSON.stringify(want))); };

// Records shaped like the LNB open data (values as cataloguers typed them).
const R = {
  lt: { leidinio_isbn: '978-609-01-1060-7', leidinio_pavadinimas: 'Pavogtas Pilkutis', leidinio_autorius: 'Holly Webb', leidinio_kalba: 'lit', leidinio_auditorija: 'pradinėms klasėms, 5-10 metų', leidinio_tipas: 'Knyga', publikavimo_metai: '2013', leidinio_udk: '821.111-93-31' },
  two: { leidinio_isbn: '0-13-228914-8; 978-0-132-28914-6', leidinio_pavadinimas: 'Principles of Economics', leidinio_autorius: 'Karl E. Case, Ray C. Fair', leidinio_kalba: 'eng', leidinio_tipas: 'Knyga' },
  x: { leidinio_isbn: '0-86215-202-x', leidinio_pavadinimas: 'Dick Turnip and the Crazy Clowns', leidinio_autorius: 'written by Giles Reed', leidinio_kalba: 'eng', leidinio_tipas: 'Knyga', leidinio_udk: '821.111-93-1' },
  other: { leidinio_isbn: '978-609-01-1060-70', leidinio_pavadinimas: 'Not this one', leidinio_tipas: 'Knyga' }
};

echo('== normalising');
eq('hyphenated 13', toIsbn13('978-609-417-092-8'), '9786094170928');
eq('ISBN-10 with X → 13', toIsbn13('609-417-092-X'), '9786094170928');
eq('lower-case x and spaces', toIsbn13(' 0 86215 202 x '), '9780862152024');
eq('wrong check digit is rejected', toIsbn13('978-609-417-092-9'), '');
eq('junk is rejected', toIsbn13('MT 10879-527-4'), '');

echo('== what we search for');
eq('LT book: official hyphenation first', candidates('9786094170928', ISBN.parse), ['978-609-417-092-8', '609-417-092-X', '9786094170928', '609417092X', '609-417-092-x', '609417092x']);
eq('979 has no ISBN-10 form', candidates('9791220117104', ISBN.parse), ['979-12-201-1710-4', '9791220117104']);
eq('works without a parser', candidates('9786090110607', null), ['9786090110607', '6090110604']);
eq('query url', queryUrl('978-609-01-1060-7', 5).replace(/select\([^)]*\)/, 'select(…)'),
  'https://get.data.gov.lt/datasets/gov/lnb/bibliografiniai_irasai/Irasas/:format/json?leidinio_isbn.contains(%22978-609-01-1060-7%22)&select(…)&limit(5)');

eq('exact-match query url', queryUrl('978-609-01-1060-7', 5, 'exact').replace(/select\([^)]*\)/, 'select(…)'),
  'https://get.data.gov.lt/datasets/gov/lnb/bibliografiniai_irasai/Irasas/:format/json?leidinio_isbn=%22978-609-01-1060-7%22&select(…)&limit(5)');
eq('plan: first three run together', plan('9786094170928', ISBN.parse).slice(0, 3), [['978-609-417-092-8', 'exact'], ['978-609-417-092-8', 'contains'], ['609-417-092-X', 'contains']]);
eq('plan: at most 5 searches', plan('9786094170928', ISBN.parse).length, 5);
eq('plan: no parser still works', plan('9786090110607', null).map((x) => x[1]), ['exact', 'contains', 'contains']);

echo('== matching hits');
eq('exact', recordHasIsbn(R.lt, '9786090110607'), true);
eq('second ISBN in a "; " list', recordHasIsbn(R.two, '9780132289146'), true);
eq('lower-case x ISBN-10 in the record', recordHasIsbn(R.x, toIsbn13('086215202X')), true);
eq('longer number that merely contains ours', recordHasIsbn(R.other, '9786090110607'), false);
eq('best record skips false hits', bestRecord([R.other, R.lt], '9786090110607').leidinio_pavadinimas, 'Pavogtas Pilkutis');
eq('no real hit → null', bestRecord([R.other], '9786090110607'), null);
eq('Spinta _data wrapper', rowsOf({ _data: [R.lt] }).length, 1);

echo('== mapping');
eq('LT children\'s book', mapRecord(R.lt, '9786090110607'), { isbn: '9786090110607', title: 'Pavogtas Pilkutis', author: 'Holly Webb', lang: 'lt', age: '7–9', year: '2013', subjects: '', forChildren: true, source: 'LNB' });
eq('role words are dropped from author', cleanAuthor('written by Giles Reed'), 'Giles Reed');
eq('bracketed author', cleanAuthor('[Egidija Gritėnaitė]'), 'Egidija Gritėnaitė');
eq('translator only → no author', cleanAuthor('iš vokiečių k. vertė Jurga Šidiškytė]'), '');
eq('pre-school → 3–6', mapAge('ikimokykliniam amžiui, 0-5 metų'), '3–6');
eq('9-14 → 10+', mapAge('vaikams, 9-14 metų'), '10+');
eq('adults → no age', mapAge('suaugusiems, bendra'), '');
eq('two languages → other', mapLang('lit; eng'), 'other');
eq('rus → ru', mapLang('rus'), 'ru');

// ---- asking the library (stubbed fetch)
const rec = (isbn) => ({ leidinio_isbn: isbn, leidinio_pavadinimas: 'Pavogtas Pilkutis', leidinio_autorius: 'Holly Webb', leidinio_kalba: 'lit', leidinio_tipas: 'Knyga' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const opts = (fetchJson) => ({ parse: ISBN.parse, fetchJson, perRequestMs: 8000, totalMs: 24000 });
echo('== asking the library');
{
  const urls = [];
  const slowContainsFastExact = async (url) => { urls.push(url); if (url.includes('.contains(')) { await sleep(300); return { _data: [rec('978-609-01-1060-7')] }; } await sleep(20); return { _data: [rec('978-609-01-1060-7')] }; };
  const t0 = Date.now(); const book = await askLibrary('9786090110607', opts(slowContainsFastExact));
  eq('first real hit wins without waiting for the slower searches', [book && book.title, Date.now() - t0 < 200], ['Pavogtas Pilkutis', true]);
  eq('three searches started together', urls.length, 3);
}
{
  const n = []; const missEverywhere = async (url) => { n.push(url); return { _data: [] }; };
  eq('clean miss → null after at most 5 searches', [await askLibrary('9786090110607', opts(missEverywhere)), n.length <= 5], [null, true]);
}
{
  const down = async () => { throw new Error('timeout'); };
  let err = ''; try { await askLibrary('9786090110607', opts(down)); } catch (e) { err = e.message; }
  eq('every request failing → throws (not cached as a miss)', err, 'library unavailable');
}
{
  let calls = 0; const onlyLast = async (url) => { calls++; return calls >= 4 ? { _data: [rec('978-609-01-1060-7')] } : { _data: [] }; };
  const b = await askLibrary('9786090110607', opts(onlyLast));
  eq('later spellings are tried when the first three miss', [b && b.title, calls], ['Pavogtas Pilkutis', 4]);
}
{
  const one = async (url) => { if (url.includes('=%22')) throw new Error('400'); return { _data: [rec('978-609-01-1060-7')] }; };
  eq('one search failing does not stop the others', (await askLibrary('9786090110607', opts(one))).title, 'Pavogtas Pilkutis');
}
function echo(s) { console.log(s); }
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
