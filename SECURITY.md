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
| Content-Security-Policy | `script-src 'self'`: no inline scripts and no third-party scripts. `connect-src` only allows Google Books and Open Library, and `img-src` only allows the cover hosts. `object-src 'none'`, `base-uri 'self'` and `form-action 'self'` are also set. |
| Supply chain | The only library (html5-qrcode 2.3.8, Apache-2.0) is **hosted in `vendor/`**, not loaded from a CDN. There is no build step and no npm dependency tree. |
| Photo privacy | Photos are redrawn on a canvas and re-encoded as JPEG before saving. This **removes EXIF metadata, including GPS location**, and caps the size at 800 px. |
| Data minimisation | Only a display name is asked for. No email, address or phone number is collected. |
| Referrer leakage | `<meta name="referrer" content="no-referrer">` is set, and lookups use `referrerPolicy: 'no-referrer'`. |
| Input limits | Every text field has a `maxlength`. Lookups time out after 8 seconds. |
| User control | Profile → *Download my data* (JSON) and *Delete account and data*. |

### Known limitations of the prototype

- `style-src` allows `'unsafe-inline'` because the scanner library and the topic colours use inline styles. Styles cannot run script, so the risk is low, but a production build should use classes or nonces.
- CSP is set with a `<meta>` tag, because GitHub Pages cannot set HTTP headers. Some directives (e.g. `frame-ancestors`) only work as real headers.
- Google Fonts is loaded from Google's servers, which shows visitors' IP addresses to Google. Hosting the font locally would avoid this.

## Security plan for the production version

The production version adds a backend (planned: Supabase with Postgres, auth, storage and realtime). Before real families use it, all of these must be in place:

### Accounts and access
- [ ] **Passwordless sign-in**: email magic link or passkeys. No passwords to leak or reuse.
- [ ] **Invite-only groups**: invite codes are random, stored hashed, expire, and can be revoked by the organiser.
- [ ] **Row-level security (RLS) on every table**, so members can only read their own group's books and their own requests and messages. See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md#row-level-security) for the policies.
- [ ] **Automated tests for RLS**: a user from group A must not be able to read group B's books or anyone else's messages.
- [ ] Status changes (accept, schedule handover, mark done) go through server-side functions that check who may do what. The client cannot simply set `status = 'done'`.
- [ ] The `service_role` key and other secrets are **never** shipped in client code and are kept only in server-side environment variables.

### Abuse and safety
- [ ] Report and block in chat, with reports going to the group organiser.
- [ ] Rate limits on messages, requests and sign-in emails.
- [ ] Links in chat are shown as text (or need an extra tap), to blunt phishing.
- [ ] The organiser can hide listings and remove members.

### Files
- [ ] The photo bucket is **private**, and photos are served only through short-lived signed URLs.
- [ ] Images are re-encoded on the client and again on the server: metadata removed, type checked, size limited.

### Platform
- [ ] HTTPS only, with HSTS and security headers (CSP, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy: camera=(self)`) set by the host.
- [ ] Two-factor authentication on every admin account: GitHub, Supabase, domain registrar and hosting.
- [ ] Dependabot alerts and secret scanning turned on in the GitHub repository.
- [ ] Daily database backups, with a restore that has actually been tested.
- [ ] Logs contain no message content or email addresses.

### Privacy (GDPR)
See [docs/PRIVACY.md](docs/PRIVACY.md).
