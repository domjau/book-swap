# seku seku – notes for Claude Code

Children's book swap for families (started at a Lithuanian Saturday school in Copenhagen). Name is always lowercase **seku seku**. Owner: domjau (Dominykas, data controller). App runs under his own name, not the school's forening.

## Plans and context (moved here from the claude.ai Project "Knygų keitykla")
- `docs/plans/production-plan.md` – path to production, phases 0–3, who does what (**You** = owner, **Claude** = code/docs). Start here when asked "what's next".
- `docs/plans/launch-board.md` – task snapshot (15 Nov 2026). The live board is https://claude.ai/artifact/VEtXespjHQjm9UsacC8rTw; this file may be stale.
- `docs/plans/marketing-plan.md` – launch plan, message, ready-made LT/EN texts.
- `docs/plans/brand-guidelines.md` – name, logo, palette, type, shape. Assets in `brand/`.
- Existing product docs: `docs/FEATURES.md`, `docs/ARCHITECTURE.md`, `docs/USER_JOURNEYS.md`, `docs/PRIVACY.md`, `docs/TRANSLATIONS.md`.
- When a task in the plan is done, tick it in `docs/plans/production-plan.md` in the same commit.

## Product decisions (keep unless the owner changes them)
- For children's books; generic users (mostly parents), no separate kid accounts. Any diaspora, any language; book language is a filter. UI in LT, ES, EN.
- One open network, open sign-up, moderated by platform admins only (no organisers/communities).
- Add-book starts with an ISBN scan to prefill, plus the owner's own photos; fun topic categories.
- Users share a postal code, never an address, so swaps happen between neighbours.
- In-app chat, bundles (several books from one member), wish lists, "little books" ratings (1–5) after exchanges, profile pictures, notifications the user controls.
- Terms: it's a P2P network; the owner isn't responsible for scams between members.
- Intro before sign-up (free, scan + photo) and a short tour after sign-up.
- Supabase now; may move elsewhere later. Sign-in emails currently via the app's Gmail account.

## Stack
- Static app, no build step: `index.html`, `app.js` (hash routes, views return HTML strings), `i18n.js`, `data.js`, `terms.js`, `config.js`, `backend.js`, `styles.css`. Served from GitHub Pages.
- Supabase (EU): Postgres with RLS on every table, `SECURITY DEFINER` RPCs for state changes, private `book-photos` bucket, realtime, Edge Functions `send-notifications` and `isbn-lookup` (national library lookup, cached).
- One open network: a single group `network_id()`; admins are rows in `platform_admins`.
- Vendored libs in `vendor/` (supabase-js, zxing-wasm). Strict CSP in `index.html` – new external hosts must be added there.

## Rules
- Escape everything rendered with `esc()`; events via `data-action` delegation, never inline handlers.
- Every UI string in LT, ES and EN (`i18n.js`, append `Object.assign` blocks).
- Brand: `brand/tokens.css`, Outfit 400–600, palette "Summer meadow". No official book covers – only the owner's photos.
- Database changes: new numbered file in `supabase/migrations/`, never edit an applied one. Run the Supabase security advisor after applying.
- Never commit or paste secrets (service_role key, SMTP password, CRON_SECRET, DB password). The publishable key in `config.js` is public by design.
- Bump `TERMS.version` in `terms.js` when the terms change (users re-accept).

## Tests
- `bash supabase/tests/rls_test.sh` (001–003, 107 checks) and `bash supabase/tests/network_test.sh` (001–005, 46 checks) against local Postgres with `supabase/tests/local_supabase_stub.sql`.
- `bash supabase/tests/isbn_lookup_test.sh` (fresh DB with 001–003, 005, 006; 16 checks) and `node supabase/functions/isbn-lookup/lnb_test.mjs` (25 checks; needs `npm i --no-save isbn3@2.0.13`).
- Email logic: see the first line of `supabase/functions/send-notifications/logic_test.mjs`.
- Demo mode: open `?demo=1` (sample data, localStorage only).

## Commits
Small commits with a clear message; push to `main` (GitHub Pages deploys from it).
