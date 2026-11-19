// Pure helpers for the `isbn-lookup` Edge Function: no network, no Deno APIs, so they can be
// tested with Node (see lnb_test.mjs). The ISBN parser (npm isbn3) is passed in by the caller.

export const LNB_URL = 'https://get.data.gov.lt/datasets/gov/lnb/bibliografiniai_irasai/Irasas';
export const LNB_FIELDS = ['leidinio_isbn', 'leidinio_pavadinimas', 'leidinio_autorius', 'publikavimo_metai',
  'leidinio_kalba', 'leidinio_auditorija', 'leidinio_tipas', 'leidinio_dalykas', 'leidinio_udk'];

export const cleanIsbn = (s) => String(s || '').toUpperCase().replace(/[^0-9X]/g, '');

export function isbn10to13(isbn) {
  if (isbn.length !== 10) return isbn;
  const core = '978' + isbn.slice(0, 9); let sum = 0;
  for (let i = 0; i < 12; i++) sum += Number(core[i]) * (i % 2 ? 3 : 1);
  return core + String((10 - (sum % 10)) % 10);
}
export function isbn13to10(isbn) {
  if (isbn.length !== 13 || !isbn.startsWith('978')) return '';
  const core = isbn.slice(3, 12); let sum = 0;
  for (let i = 0; i < 9; i++) sum += (10 - i) * Number(core[i]);
  const c = (11 - (sum % 11)) % 11;
  return core + (c === 10 ? 'X' : String(c));
}
function validCheck(isbn) {
  if (isbn.length === 13) {
    if (!/^\d{13}$/.test(isbn)) return false;
    let s = 0; for (let i = 0; i < 13; i++) s += Number(isbn[i]) * (i % 2 ? 3 : 1);
    return s % 10 === 0;
  }
  if (isbn.length === 10) {
    if (!/^\d{9}[\dX]$/.test(isbn)) return false;
    let s = 0; for (let i = 0; i < 10; i++) s += (10 - i) * (isbn[i] === 'X' ? 10 : Number(isbn[i]));
    return s % 11 === 0;
  }
  return false;
}

// Any input (hyphens, spaces, ISBN-10 or -13) → the canonical ISBN-13, or '' if it is not a valid ISBN.
export function toIsbn13(raw) {
  const c = cleanIsbn(raw);
  if (!validCheck(c)) return '';
  return c.length === 10 ? isbn10to13(c) : c;
}

// The library stores ISBNs as typed by cataloguers: mostly with the official hyphenation
// (978-609-417-092-8 or 609-417-092-X), sometimes as bare digits, sometimes with a lower-case x,
// and several per record separated by "; ". These are the strings worth searching for, best first.
export function candidates(isbn13, parse) {
  const p = (parse && parse(isbn13)) || {};
  const isbn10 = isbn13to10(isbn13);
  const out = [p.isbn13h, p.isbn10h, isbn13, isbn10];
  if (p.isbn10h && p.isbn10h.endsWith('X')) out.push(p.isbn10h.slice(0, -1) + 'x');
  if (isbn10.endsWith('X')) out.push(isbn10.slice(0, -1) + 'x');
  return [...new Set(out.filter(Boolean))];
}

// A "contains" search can match a longer number, so only keep records where one of the
// ISBNs in the field really is ours.
export function recordHasIsbn(rec, isbn13) {
  return String((rec && rec.leidinio_isbn) || '').split(/[;,]/).some((part) => toIsbn13(part) === isbn13);
}

// MARC 3-letter language codes → the app's 2-letter codes.
const LANG = { lit: 'lt', spa: 'es', eng: 'en', dan: 'da', fre: 'fr', fra: 'fr', ger: 'de', deu: 'de', pol: 'pl', rus: 'ru',
  ukr: 'uk', lav: 'lv', swe: 'sv', nor: 'no', nob: 'no', ita: 'it', por: 'pt' };
export function mapLang(field) {
  const codes = String(field || '').split(/[;,\s]+/).filter(Boolean);
  return codes.length === 1 && LANG[codes[0].toLowerCase()] ? LANG[codes[0].toLowerCase()] : 'other';
}

// Library audience → the app's age bands (0–3, 3–6, 7–9, 10+). Adult books get no age.
export function mapAge(field) {
  const a = String(field || '').toLowerCase().split(';')[0];
  if (a.includes('ikimokykl')) return '3–6';
  if (a.includes('pradin')) return '7–9';
  if (a.includes('vaikams') || a.includes('jaunim')) return '10+';
  return '';
}
// UDK (UDC) "-93" marks literature for children.
export const isForChildren = (rec) => /-93\b/.test(String(rec.leidinio_udk || '')) || !!mapAge(rec.leidinio_auditorija);

// "written by Giles Reed", "[Egidija Gritėnaitė]", "iš vokiečių k. vertė …]" → a plain author name or ''.
export function cleanAuthor(s) {
  let a = String(s || '').replace(/[[\]]/g, '').replace(/\s+/g, ' ').trim();
  if (/\b(vertė|translated|перевод|пер\.)/i.test(a) && !/,/.test(a)) return '';
  a = a.replace(/^(written by|text by|edited by|adapted [^,]*? by|retold by|by|von|parašė|sudarė|sud\.|сост\.|составитель)\s+/i, '');
  return a.slice(0, 120);
}
export function cleanTitle(s) {
  return String(s || '').replace(/\s*\[[^\]]*\]\s*/g, ' ').replace(/\s+;\s*/g, '; ').replace(/\s+/g, ' ').trim().replace(/[\s:;/.]+$/, '').slice(0, 150);
}

// One library record → the shape the app's add-book form uses.
export function mapRecord(rec, isbn13) {
  return {
    isbn: isbn13,
    title: cleanTitle(rec.leidinio_pavadinimas),
    author: cleanAuthor(rec.leidinio_autorius),
    lang: mapLang(rec.leidinio_kalba),
    age: mapAge(rec.leidinio_auditorija),
    year: (String(rec.publikavimo_metai || '').match(/\d{4}/) || [''])[0], // "[2013]" → "2013"
    subjects: String(rec.leidinio_dalykas || '').slice(0, 400),
    forChildren: isForChildren(rec),
    source: 'LNB'
  };
}

// If several records share the ISBN (reprints, parts), prefer a book with a title, for children.
export function bestRecord(recs, isbn13) {
  const ok = (recs || []).filter((r) => recordHasIsbn(r, isbn13) && cleanTitle(r.leidinio_pavadinimas));
  const score = (r) => (r.leidinio_tipas === 'Knyga' ? 2 : 0) + (isForChildren(r) ? 1 : 0) + (cleanAuthor(r.leidinio_autorius) ? 1 : 0);
  return ok.sort((a, b) => score(b) - score(a))[0] || null;
}

// Spinta query, JSON format. mode 'contains' → leidinio_isbn.contains("…") (also finds the ISBN inside a
// "; "-separated list); mode 'exact' → leidinio_isbn="…" (may be quicker, only matches a field that is exactly this ISBN).
export function queryUrl(candidate, limit = 5, mode = 'contains') {
  const v = encodeURIComponent(JSON.stringify(String(candidate)));
  const filter = mode === 'exact' ? 'leidinio_isbn=' + v : 'leidinio_isbn.contains(' + v + ')';
  return LNB_URL + '/:format/json?' + filter + '&select(' + LNB_FIELDS.join(',') + ')&limit(' + limit + ')';
}

// The searches worth running, best first: [candidate, mode]. The first three are started together.
export function plan(isbn13, parse) {
  const c = candidates(isbn13, parse);
  const out = [];
  if (c[0]) { out.push([c[0], 'exact']); out.push([c[0], 'contains']); }
  if (c[1]) out.push([c[1], 'contains']);
  for (const x of c.slice(2, 4)) out.push([x, 'contains']);
  return out;
}
// Spinta answers {"_data": [...]}; accept a bare array too.
export const rowsOf = (json) => (Array.isArray(json) ? json : (json && Array.isArray(json._data) ? json._data : []));

// Asks the library for one book. Resolves with the book, null for a clean miss, and throws only when the
// library could not be asked at all (every request failed). fetchJson(url, ms) is passed in so this can be tested.
export async function askLibrary(isbn13, { parse, fetchJson, perRequestMs, totalMs, log = () => {} }) {
  const started = Date.now();
  const steps = plan(isbn13, parse);
  let asked = 0; let errors = 0;
  // One search: the book it finds, or null. A failure is counted, not thrown.
  const run = async ([c, mode]) => {
    const left = totalMs - (Date.now() - started);
    if (left < 800) return null;
    asked++;
    const t0 = Date.now();
    try {
      const rec = bestRecord(rowsOf(await fetchJson(queryUrl(c, 5, mode), Math.min(perRequestMs, left))), isbn13);
      log('lnb search', mode, c, rec ? 'hit' : 'miss', (Date.now() - t0) + 'ms');
      return rec ? mapRecord(rec, isbn13) : null;
    } catch (e) { errors++; return null; }
  };
  // The first three at the same time; the first real hit wins without waiting for the others.
  const group = steps.slice(0, 3);
  const first = await new Promise((resolve) => {
    let pending = group.length;
    if (!pending) return resolve(null);
    for (const st of group) run(st).then((r) => { if (r) resolve(r); else if (--pending === 0) resolve(null); });
  });
  if (first) return first;
  for (const st of steps.slice(3)) { const r = await run(st); if (r) return r; }
  if (!asked || errors === asked) throw new Error('library unavailable');
  return null;
}
