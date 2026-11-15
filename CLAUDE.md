# seku seku – notes for Claude Code

Children's book swap for families (started at a Lithuanian Saturday school in Copenhagen). Name is always lowercase **seku seku**. Owner: domjau. Plan: `claude/production-plan.md` in the claude.ai Project.

## Stack
- Static app, no build step: `index.html`, `app.js` (hash routes, views return HTML strings), `i18n.js`, `data.js`, `terms.js`, `config.js`, `backend.js`, `styles.css`. Served from GitHub Pages.
- Supabase (EU): Postgres with RLS on every table, `SECURITY DEFINER` RPCs for state changes, private `book-photos` bucket, realtime, Edge Function `send-notifications`.
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
- Email logic: see the first line of `supabase/functions/send-notifications/logic_test.mjs`.
- Demo mode: open `?demo=1` (sample data, localStorage only).

## Commits
Small commits with a clear message; push to `main` (GitHub Pages deploys from it).
