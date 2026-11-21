# OWASP ASVS 4.0.3 – Level 1 checklist

> Self-assessment for seku seku (static app on GitHub Pages + Supabase). Reviewed 21 Nov 2026. ✅ met · 🟡 partly / with a known gap · ❌ not met · n/a not applicable. Re-check after each bigger feature.

| Chapter | Requirement (short) | Status | How / gap |
|---|---|---|---|
| **V1 Architecture** | Documented trust boundaries and components | ✅ | `docs/ARCHITECTURE.md`; all access control in the database, the browser is untrusted |
| **V2 Authentication** | No default or shared passwords; passwords hashed | ✅ | Passwordless email one-time code (Supabase Auth); no passwords exist |
| | Brute-force protection on sign-in | ✅ | Supabase Auth rate limits for OTP emails and verification |
| | Secure recovery, no security questions | ✅ | Recovery = a new one-time code to the same email |
| | Notify on account changes | 🟡 | Email changes are not offered in the app; sign-in emails show each attempt |
| **V3 Sessions** | Session tokens random, not in URLs, revoked on sign-out | 🟡 | Supabase JWT + refresh token; the magic-link token arrives in the URL hash and is removed right away; tokens live in localStorage (standard for SPAs, XSS is the main risk → strict CSP) |
| | Sessions expire / refresh tokens rotate | ✅ | 1 h access tokens, rotating refresh tokens |
| **V4 Access control** | Least privilege, deny by default | ✅ | `revoke all` then explicit grants; RLS on every table; column-level grants |
| | No IDOR: users can't reach others' records by changing ids | ✅ | RLS on `auth.uid()`; 203 automated checks across users (`supabase/tests/`) |
| | Admin functions protected | ✅ | `is_platform_admin()` checks in `SECURITY DEFINER` functions; moderation log |
| **V5 Validation and output** | Input validated server-side | ✅ | Check constraints (lengths, formats, enums), checked RPCs, blocked words, copy-sharing filter |
| | Output encoding against XSS | ✅ | Every value through `esc()`; no `innerHTML` with raw user text; events via `data-action` |
| | No dangerous deserialisation, SQL injection | ✅ | Parameterised PostgREST/RPC calls only; no dynamic SQL with user input |
| **V6 Cryptography** | Standard algorithms, no home-made crypto | ✅ | TLS everywhere; SHA-256 only for the blocked-email fingerprint |
| **V7 Errors and logging** | No sensitive data in logs; errors don't leak internals | 🟡 | Logs hold no message content or emails; the app shows a short raw error after a friendly text for unknown errors – fine for now, trim before public launch |
| **V8 Data protection** | Sensitive data not cached; user can export / delete | ✅ | Private photo bucket with 1 h signed URLs; Download my data and Delete my account (migration 007); service worker caches only the app's own static files |
| **V9 Communication** | TLS for all connections | ✅ | GitHub Pages and Supabase are HTTPS-only; HSTS on github.io |
| **V10 Malicious code** | No backdoors; dependencies from trusted sources, integrity | ✅ | Two vendored libraries in `vendor/`, no CDN scripts, no build chain; Dependabot to be switched on |
| **V11 Business logic** | Limits against automated abuse | ✅ | Daily limits on books, requests, messages; library quota; auto-hide after 3 reports |
| **V12 Files** | Upload size and type limited; files not executable; no path traversal | ✅ | Client re-encodes to JPEG (720 px, metadata gone); bucket limits size and MIME type; storage paths bound to the user's folder by policy |
| **V13 API** | Same auth on every API; no mass assignment | ✅ | PostgREST + RLS; column grants stop writes to fields like `status`, `hidden`, `role` |
| **V14 Configuration** | Security headers: CSP, nosniff, HSTS, frame-ancestors | 🟡 | Strict CSP via `<meta>` (no inline scripts); GitHub Pages can't set `frame-ancestors`, `X-Content-Type-Options` or `Permissions-Policy` headers → planned with an own domain and host (launch board "DNS + hosting with security headers") |
| | No secrets in the repository | ✅ | Only the publishable key in `config.js`; secret scanning to be switched on |
| | Third-party resources | ✅ | No third-party scripts, styles or fonts: Outfit is self-hosted in `vendor/fonts/` |

## Open items

1. Own host with real security headers (needs the domain).
2. GitHub: Dependabot alerts, secret scanning, branch protection (owner's settings).
3. Two-step login on Supabase, GitHub and email accounts (owner).
4. Trim raw error text in `friendlyError()` before public launch.
