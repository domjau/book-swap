// Run: sed -e "s#^import .*supabase-js.*#const createClient = null;#" -e "s#^import nodemailer.*#const nodemailer = null;#" index.ts > fn.mjs && node logic_test.mjs
import { pick, buildEmail, lineFor } from './fn.mjs';
let pass = 0, fail = 0;
const ok = (name, cond, extra) => { if (cond) { pass++; console.log('  ok  ', name); } else { fail++; console.log('  FAIL', name, extra || ''); } };
const now = Date.parse('2026-11-15T12:00:00Z');
const ago = (m) => new Date(now - m * 60000).toISOString();
const pending = [
  { id: 1, user_id: 'ana', type: 'request_new', data: { actor: 'ben', request_id: 'r1' }, created_at: ago(10) },
  { id: 2, user_id: 'ana', type: 'message', data: { actor: 'ben', request_id: 'r1', count: 3, snippet: 'Saturday?' }, created_at: ago(5) },
  { id: 3, user_id: 'ana', type: 'review', data: { actor: 'ben', rating: 5 }, created_at: ago(10) },             // not in Ana's email types
  { id: 4, user_id: 'ana', type: 'message', data: { actor: 'ben', request_id: 'r2' }, created_at: ago(1) },        // too fresh
  { id: 5, user_id: 'ben', type: 'announcement', data: { text: 'Swap day!' }, created_at: ago(30) },               // Ben: daily
  { id: 6, user_id: 'cleo', type: 'request_new', data: {}, created_at: ago(30) },                                  // Cleo: email off
  { id: 7, user_id: 'dan', type: 'request_answered', data: { actor: 'ana', status: 'declined' }, created_at: ago(30) }, // no prefs → defaults
  { id: 8, user_id: 'ana', type: 'wish_match', data: { actor: 'ben', title: 'Zog' }, created_at: ago(9), read_at: ago(8) } // already read in app
];
const prefs = new Map([
  ['ana', { email_types: ['request_new', 'message', 'wish_match'], email_mode: 'instant', lang: 'lt' }],
  ['ben', { email_types: ['announcement'], email_mode: 'daily', lang: 'es' }],
  ['cleo', { email_types: ['request_new'], email_mode: 'off', lang: 'en' }]
]);
const inst = pick(pending, prefs, 'instant', now);
ok('instant: Ana gets request + message (2 items)', JSON.stringify((inst.send.get('ana') || []).map((n) => n.id)) === '[1,2]', JSON.stringify([...inst.send]));
ok('instant: fresh message waits 2 minutes', !(inst.send.get('ana') || []).some((n) => n.id === 4));
ok('instant: Dan (no prefs) gets default request_answered', (inst.send.get('dan') || []).length === 1);
ok('instant: Ben (daily) not sent now', !inst.send.has('ben'));
ok('skipped: review not wanted, Cleo off, already-read wish match', JSON.stringify(inst.skip.sort()) === '[3,6,8]', JSON.stringify(inst.skip));
const daily = pick(pending, prefs, 'daily', now);
ok('daily: Ben gets the announcement', (daily.send.get('ben') || []).length === 1 && daily.send.size === 1);
const names = { ben: 'Ben', ana: 'Ana' };
const m = buildEmail(inst.send.get('ana'), 'lt', 'Ana', names, 'https://domjau.github.io/book-swap/');
ok('email in Lithuanian', m.subject === 'Knygų keitykla: 2 nauji pranešimai' && m.text.startsWith('Labas, Ana,'), m.subject);
ok('email links to the chat', m.text.includes('#/chat/r1'));
ok('collapsed message count shown', m.text.includes('3 naujos žinutės nuo Ben'));
const e2 = buildEmail(daily.send.get('ben'), 'es', 'Ben', names, 'https://x/');
ok('Spanish single-item subject', e2.subject === 'Intercambio de libros: De Intercambio de libros: Swap day!', e2.subject);
const xss = buildEmail([{ type: 'announcement', data: { text: '<script>alert(1)</script>' } }], 'en', 'A', {}, 'https://x/');
ok('HTML is escaped', !xss.html.includes('<script>') && xss.html.includes('&lt;script&gt;'));
ok('declined wording', lineFor({ type: 'request_answered', data: { actor: 'ana', status: 'declined' } }, 'en', names) === 'Ana declined your request');
console.log(`\nRESULT: ${pass} passed, ${fail} failed`);
