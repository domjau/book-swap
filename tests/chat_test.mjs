// Automatic request message + quick replies. Run: node tests/chat_test.mjs
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const root = new URL('..', import.meta.url);
const ctx = { window: {} };
vm.createContext(ctx);
vm.runInContext(readFileSync(new URL('i18n.js', root), 'utf8'), ctx);
vm.runInContext(readFileSync(new URL('chat.js', root), 'utf8'), ctx);
const { STRINGS, UI_LANGS, SekuChat } = ctx.window;
const tFor = (lang) => (key, vars) => {
  let s = STRINGS[lang][key] != null ? STRINGS[lang][key] : STRINGS.en[key];
  assert.ok(s != null, `missing string ${key}`);
  if (vars) Object.keys(vars).forEach((k) => { s = s.split('{' + k + '}').join(vars[k]); });
  return s;
};
// Same copy-sharing pattern as app.js COPY_PATTERNS / looks_like_copy_sharing() in SQL.
const COPY = /\.(pdf|epub|mobi|azw3?|djvu|cbz|cbr|fb2)(\b|$)|drive\.google|docs\.google|dropbox|wetransfer|mega\.nz|mediafire|z-?lib|libgen|annas-archive|scribd|t\.me\//i;

let n = 0;
const ok = (name, fn) => { fn(); n++; console.log('ok', n, name); };
const en = tFor('en');

ok('one book: names it and asks about Saturday', () => {
  const m = SekuChat.requestMsg(en, { name: 'Rūta', titles: ['Gruffalo'], day: 'Sat 28 Nov' });
  assert.equal(m, 'Hi Rūta! I would love “Gruffalo”. Would this Saturday (Sat 28 Nov) work for you? If not, just suggest another day.');
});
ok('two books joined with "and"', () => {
  const m = SekuChat.requestMsg(en, { name: 'Ana', titles: ['A', 'B'], day: 'x' });
  assert.match(m, /these 2 books: “A” and “B”\./);
});
ok('many books: three listed, then "and N more"', () => {
  const m = SekuChat.requestMsg(en, { name: 'Ana', titles: ['A', 'B', 'C', 'D', 'E'], day: 'x' });
  assert.match(m, /these 5 books: “A”, “B”, “C” and 2 more\./);
});
ok('offered books and wish-list hint', () => {
  assert.match(SekuChat.requestMsg(en, { titles: ['A'], offeredTitles: ['Z'], day: 'x' }), /^Hi! .*In return I can give you “Z”\./);
  assert.match(SekuChat.requestMsg(en, { titles: ['A'], offeredTitles: ['Z'], offeredWished: true, day: 'x' }), /“Z” \(from your wish list\)/);
});
ok('sale sum only when > 0', () => {
  assert.match(SekuChat.requestMsg(en, { titles: ['A'], sellSum: 5, day: 'x' }), /€5 for the books on sale/);
  assert.doesNotMatch(SekuChat.requestMsg(en, { titles: ['A'], sellSum: 0, day: 'x' }), /€/);
});
ok('every language: all strings exist, no unfilled placeholders, passes copy filter', () => {
  for (const lang of UI_LANGS) {
    const t = tFor(lang);
    const m = SekuChat.requestMsg(t, { name: 'Ana', titles: ['A', 'B', 'C', 'D'], offeredTitles: ['Z'], offeredWished: true, sellSum: 3, day: 'šešt.' });
    assert.doesNotMatch(m, /\{\w+\}/, lang + ': ' + m);
    assert.ok(m.length <= 1000, 'fits the 1000-char message limit');
    assert.doesNotMatch(m, COPY);
    for (const k of SekuChat.ALL_QUICK) { assert.ok(STRINGS[lang][k], `${lang}.${k}`); assert.doesNotMatch(t(k), COPY); }
  }
});
ok('owner of a pending request gets answers to the Saturday question', () => {
  const keys = SekuChat.quickReplies(true, 'pending');
  assert.deepEqual([...keys], ['qrYesSat', 'qrOtherDay', 'qrGone']);
  for (const lang of UI_LANGS) assert.ok(STRINGS[lang].rqAsk.includes('{day}') && STRINGS[lang].qrYesSat, lang);
});
ok('requester and later stages get fitting replies; declined gets none', () => {
  assert.deepEqual([...SekuChat.quickReplies(false, "pending")], ['qrAnyDay', 'qrThanks']);
  assert.ok(SekuChat.quickReplies(true, 'scheduled').includes('qrSeeYou'));
  assert.equal(SekuChat.quickReplies(false, "declined").length, 0);
  for (const s of ['pending', 'accepted', 'scheduled', 'done']) for (const o of [true, false])
    for (const k of SekuChat.quickReplies(o, s)) assert.ok(SekuChat.ALL_QUICK.includes(k), k);
});
console.log(`${n} checks passed`);
