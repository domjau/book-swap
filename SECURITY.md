# Security Policy

## Reporting a vulnerability

Please **do not open a public issue** for security problems.

Report them privately through **GitHub → Security → Report a vulnerability** on this repository. We aim to reply within 7 days. Please include the steps to reproduce the problem and what an attacker could achieve with it.

## Current status: prototype

The app in this repository is a **front-end-only prototype**:

- It has no server, accounts or shared database.
- All data (profile, books, requests, chats, photos) is stored in the browser's `localStorage` **on the user's own device** and never leaves it.
- The only network calls are anonymous, read-only book lookups to **Google Books** and **Open Library**. They send only the ISBN or the search text.

The prototype is therefore not a place to put real personal data. Anyone with access to the device can read what is stored there.

## Protections already in the prototype

| Area | Protection |
|---|---|
| Cross-site scripting (XSS) | Every piece of user or API text is HTML-escaped (`esc()` in `app.js`) before it is put on the page. Chat messages are rendered as plain text, never as HTML. |
| Content-Security-Policy | `script-src 'self' 'wasm-unsafe-eval'`: no inline scripts and no third-party scripts. Only our own WebAssembly barcode decoder may be compiled, and `eval` stays blocked. `connect-src` only allows Google Books and Open Library. `img-src` allows only the app's own images and on-device photos, so no outside images are loaded. `object-src 'none'`, `base-uri 'self'` and `form-action 'self'` are also set. |
| Supply chain | The only library (zxing-wasm 3.1.6, MIT: barcode decoder) is **hosted in `vendor/`**, not loaded from a CDN. There is no build step and no npm dependency tree. |
| Photo privacy | Photos are redrawn on a canvas and re-encoded as JPEG before saving. This **removes EXIF metadata, including GPS location**, and caps the size at 800 px. |
| Data minimisation | Only a display name, country and postal code are asked for. No email, street address or phone number is collected. |
| Referrer leakage | `<meta name="referrer" content="no-referrer">` is set, and lookups use `referrerPolicy: 'no-referrer'`. |
| Catalogue HTML | Book descriptions arrive as HTML. They are converted to plain text with `DOMParser` (which never runs scripts), and `<script>`/`<style>` content is removed. |
| Input limits | Every text field has a `maxlength`. Lookups time out after 8 seconds. |
| User control | Profile → *Download my data* (JSON) and *Delete account and data*. |

### Known limitations of the prototype

- `style-src` allows `'unsafe-inline'` because the topic colours use inline styles. Styles cannot run script, so the risk is low, but a production build should use classes or nonces.
- CSP is set with a `<meta>` tag, because GitHub Pages cannot set HTTP headers. Some directives (e.g. `frame-ancestors`) only work as real headers.
- ~~Google Fonts is loaded from Google's servers.~~ Fixed: the font is hosted in `vendor/fonts/`.

## Live version (Supabase)

- `config.js` contains only the **publishable** key, which is designed to be public. All access control is in the database (see `supabase/migrations/001_init.sql`): RLS on every table, column-level grants, and status changes only through checked functions. The `service_role` / secret key is never used by the app.
- `supabase/tests/rls_test.sh` runs 107 cross-user and cross-group checks, `supabase/tests/network_test.sh` 46 checks for the open network and admin powers, and `supabase/tests/privacy_safety_test.sh` 50 checks for account deletion, data export, clean-up, limits and moderation; all pass and run on every change.
- Photos are in a private bucket and displayed via signed URLs that expire after 1 hour.
- Admin powers exist only as checked database functions (`is_platform_admin()`), and every admin action is written to a moderation log. Admins can read a conversation only after it has been reported. Admins are added only by another admin, and the last admin can't be removed.
- The email sender (Edge Function) uses the service-role key **on the server only**, is protected by its own secret, and HTML-escapes everything it puts in an email.
- Sign-in is passwordless (email OTP). The sign-in tokens are removed from the address bar right after login.

## Security plan for the production version

The production version adds a backend (planned: Supabase with Postgres, auth, storage and realtime). Before real families use it, all of these must be in place:

### Accounts and access
- [x] **Passwordless sign-in**: email magic link or passkeys. No passwords to leak or reuse.
- [x] **Open sign-up, signed-in only**: anyone can join with their email, but nothing is visible without signing in and accepting the terms. Blocked accounts can't rejoin.
- [x] **Row-level security (RLS) on every table**, so members can only read their own group's books and their own requests and messages. See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md#row-level-security) for the policies.
- [x] **Automated tests for RLS**: a user from group A must not be able to read group B's books or anyone else's messages.
- [x] Status changes (accept, schedule handover, mark done) go through server-side functions that check who may do what. The client cannot simply set `status = 'done'`.
- [x] The `service_role` key and other secrets are **never** shipped in client code and are kept only in server-side environment variables.

### Abuse and safety
- [x] Report and block in chat, with reports going to the admins.
- [x] Rate limits on messages, requests and new listings (migration 007; sign-in emails are limited by Supabase Auth).
- [x] Links in chat are shown as text, never as clickable links, and messages with links or pay-first wording get a scam warning.
- [x] Admins can hide listings and remove or block members.

### Files
- [x] The photo bucket is **private**, and photos are served only through short-lived signed URLs.
- [ ] Images are re-encoded on the client and again on the server: metadata removed, type checked, size limited.

### Platform
- [ ] HTTPS only, with HSTS and security headers (CSP, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy: camera=(self)`) set by the host.
- [ ] Two-factor authentication on every admin account: GitHub, Supabase, domain registrar and hosting.
- [ ] Dependabot alerts and secret scanning turned on in the GitHub repository.
- [x] Tests run on every push and pull request (`.github/workflows/tests.yml`), and an uptime check every 3 hours (`uptime.yml`).
- [x] `security.txt` at `/.well-known/security.txt` and an OWASP ASVS Level 1 checklist in [docs/compliance/asvs-level1.md](docs/compliance/asvs-level1.md).
- [ ] Daily database backups, with a restore that has actually been tested.
- [ ] Logs contain no message content or email addresses.

### Privacy (GDPR)
See [docs/PRIVACY.md](docs/PRIVACY.md).
