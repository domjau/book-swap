// Supabase Edge Function: looks up a book by ISBN in the Lithuanian national library's open data
// (LNB bibliographic records on data.gov.lt). The app calls it only when Google Books and
// Open Library know nothing (or in parallel for Lithuanian ISBNs, 978-609 / 978-9955 / 978-9986).
//
//   POST { "isbn": "978-609-417-092-8" }  →  { found: true, book: {...}, cached: false } | { found: false }
//
// Smart about the library's API:
// - normalises the ISBN and searches the forms cataloguers actually use (hyphenated 13 and 10, bare digits);
// - checks every hit really carries this ISBN;
// - caches hits for 90 days and misses for 14 days in public.isbn_lookup_cache (migration 006);
// - at most 4 small requests per lookup, 8 s each, 24 s in total; never bulk-downloads;
// - fair use: 30 library calls per member per hour, 300 per hour for the whole app (cache hits are free);
// - any failure (timeout, API down, quota) answers { found: false } so the app just carries on.
//
// Signed-in members only. Turn OFF "Verify JWT" for this function: it checks the user's token itself
// (that also works with the new publishable keys). SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are provided by Supabase.
import { createClient } from 'npm:@supabase/supabase-js@2';
import ISBN from 'npm:isbn3@2.0.13';
import { toIsbn13, candidates, bestRecord, mapRecord, queryUrl, rowsOf } from './lnb.js';

const HIT_DAYS = 90;
const MISS_DAYS = 14;
const PER_REQUEST_MS = 8000;
const TOTAL_MS = 24000;
const USER_PER_HOUR = 30;
const ALL_PER_HOUR = 300;
const ALLOWED_ORIGINS = ['https://domjau.github.io', 'http://localhost:8000', 'http://127.0.0.1:8000'];

const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false } });

function cors(req: Request) {
  const origin = req.headers.get('origin') || '';
  return {
    'Access-Control-Allow-Origin': ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
    'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Vary': 'Origin'
  };
}
const reply = (req: Request, body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors(req), 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });

async function fetchJson(url: string, ms: number) {
  // Logs (Edge Functions → isbn-lookup → Logs) say how long the library took to answer and where it stalled.
  const t0 = Date.now(); let stage = 'connect';
  const ctl = new AbortController(); const timer = setTimeout(() => ctl.abort(), ms);
  try {
    const r = await fetch(url, { signal: ctl.signal, headers: { Accept: 'application/json' } });
    stage = 'body';
    const headersMs = Date.now() - t0;
    const text = await r.text();
    console.log('lnb', r.status, 'headers ' + headersMs + 'ms', 'total ' + (Date.now() - t0) + 'ms', text.length + ' bytes', text.slice(0, 160).replace(/\s+/g, ' '));
    if (!r.ok) throw new Error('LNB HTTP ' + r.status);
    return JSON.parse(text);
  } catch (e) {
    console.warn('lnb failed at ' + stage + ' after ' + (Date.now() - t0) + 'ms:', String(e), url.slice(url.indexOf('?')).slice(0, 120));
    throw e;
  } finally { clearTimeout(timer); }
}

// Returns the book, null for a clean miss, or throws if the library could not be asked properly.
async function askLibrary(isbn13: string) {
  const started = Date.now(); let errors = 0; let asked = 0;
  for (const c of candidates(isbn13, ISBN.parse).slice(0, 4)) {
    const left = TOTAL_MS - (Date.now() - started);
    if (left < 800) break;
    try {
      asked++;
      const rec = bestRecord(rowsOf(await fetchJson(queryUrl(c), Math.min(PER_REQUEST_MS, left))), isbn13);
      if (rec) return mapRecord(rec, isbn13);
    } catch (e) {
      errors++; console.warn('isbn-lookup', c, String(e));
    }
  }
  if (!asked || errors === asked) throw new Error('library unavailable');
  return null;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors(req) });
  if (req.method !== 'POST') return reply(req, { error: 'method' }, 405);

  // 1. Who is asking: a signed-in member of the network.
  const token = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  const { data: u } = token ? await admin.auth.getUser(token) : { data: null };
  const uid = u?.user?.id;
  if (!uid) return reply(req, { error: 'sign-in' }, 401);
  const { data: mem } = await admin.from('members').select('user_id').eq('user_id', uid).limit(1);
  if (!mem || !mem.length) return reply(req, { error: 'member' }, 403);

  // 2. Which book.
  let body: { isbn?: string } = {};
  try { body = await req.json(); } catch { /* empty */ }
  const isbn13 = toIsbn13(body.isbn || '');
  if (!isbn13) return reply(req, { error: 'isbn' }, 400);

  // 3. Cache (hits and misses).
  const { data: cached } = await admin.from('isbn_lookup_cache').select('found, data, fetched_at').eq('isbn13', isbn13).maybeSingle();
  if (cached) {
    const ageDays = (Date.now() - new Date(cached.fetched_at).getTime()) / 864e5;
    if (ageDays < (cached.found ? HIT_DAYS : MISS_DAYS)) return reply(req, cached.found ? { found: true, book: cached.data, cached: true } : { found: false, cached: true });
  }

  // 4. Fair use, then the library itself.
  const { data: allowed } = await admin.rpc('isbn_lookup_take_quota', { p_user: uid, p_user_per_hour: USER_PER_HOUR, p_all_per_hour: ALL_PER_HOUR });
  if (!allowed) return reply(req, { found: false, reason: 'busy' });
  let book = null;
  try { book = await askLibrary(isbn13); } catch {
    return reply(req, { found: false, reason: 'unavailable' }); // not cached: try again next time
  }
  await admin.from('isbn_lookup_cache').upsert({ isbn13, source: 'lnb', found: !!book, data: book, fetched_at: new Date().toISOString() });
  return reply(req, book ? { found: true, book, cached: false } : { found: false, cached: false });
});
