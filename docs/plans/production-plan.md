# seku seku – path to production

Last updated: 2026-11-21. Owner: Dominykas (data controller). Tasks marked **You** need your accounts or decisions; **Claude** is code and docs.
Details on legal and safety items: "seku seku – EU compliance and safety plan" (Claude Docs). Marketing: `docs/plans/marketing-plan.md`.

**Live status board:** https://claude.ai/artifact/VEtXespjHQjm9UsacC8rTw – the source of truth for task status (timeline, board, list; 71 tasks, product + marketing). Readable snapshot: `docs/plans/launch-board.md`. This file is the readable plan; the board tracks progress.

Live app: https://domjau.github.io/book-swap/ · Repo: github.com/domjau/book-swap · Database: Supabase project `book-swap` (EU, Frankfurt)

## Done
- [x] App: scan ISBN + own photos, wish lists, bundles, chat, reviews (little books), profile pictures, notifications, admin panel
- [x] One open network, open sign-up, admins moderate (you are the first admin)
- [x] Brand: seku seku (lowercase), logo, palette, Outfit, branded emails
- [x] Intro before sign-up + four-step tour after sign-up (LT/ES/EN)
- [x] Database migrations 001, 002, 003, 005 applied to the live project; Supabase security findings fixed
- [x] Database security tests (107 + 46 checks) and browser tests passing

## Phase 0 – this week (You)
- [ ] Download the National Library's "Bibliografiniai įrašai" dataset from data.gov.lt and send it to Claude; note the licence shown on the page
- [ ] Gmail app password → Supabase **Authentication → Emails → SMTP**; add `{{ .Token }}` to the Magic Link and Confirm signup templates (files in `supabase/email-templates/`)
- [ ] Deploy the `send-notifications` Edge Function, add its secrets, then run `004_schedules.sql` (steps in `supabase/README.md`)
- [ ] Choose the public contact email for the terms and privacy notice; confirm your full name and country can be shown there
- [ ] Sign Supabase's Data Processing Agreement (dashboard)
- [ ] Turn on two-step login for Supabase, GitHub and Gmail
- [ ] Test sign-up → add a book → request → chat → handover on your phone, then with 2–3 parents

## Phase 1 – before inviting families
Catalogue
- [ ] **Claude** – `catalogue` table + Python import script for the national library data (runs on your PC) + scanner checks it first
- [x] **Claude** – Save manually typed books to the shared catalogue so the next scan finds them (migration 008)
- [x] **Claude** – Live lookup in the national library's open data (Edge Function `isbn-lookup`, cached) when Google Books / Open Library miss, and always for Lithuanian ISBNs. **You**: run migration 006 and deploy the function (`supabase/README.md`)
- [x] **Claude** – ISBNs starting 978-609 / 978-9955 / 978-9986 default to Lithuanian
- [x] **Claude** – "Book data: National Library of Lithuania" credit line (shown when the library supplied the details)

Privacy and law (GDPR, DSA)
- [x] **Claude** – Privacy notice page in the app (LT/ES/EN) – `#/privacy`, plus `#/about` with the data sources
- [ ] **Claude** – Terms: your name, country, contact email; 18+ checkbox at sign-up – 18+ checkbox and terms §1a done (21 Nov); name, country and email go in `TERMS.operator` once you choose them
- [x] **Claude** – Delete my account + Download my data in the live app (migration 007)
- [x] **Claude** – Automatic clean-up (old notifications, old chats) – migration 007; gone books and inactive accounts wait for email and an Edge Function
- [x] **Claude** – Report button on listings and profiles; report page for non-members (`#/report`)
- [x] **Claude** – Statement of reasons when an admin hides a listing or removes a member
- [x] **Claude** – Record of processing + one-page breach plan (`docs/compliance/`)

Safety and moderation
- [ ] **You** – OpenAI API account; key saved as a Supabase secret (never in the app)
- [ ] **Claude** – Automatic check of photos, titles, descriptions, names before publishing; "waiting for review" queue
- [x] **Claude** – Word lists (LT/ES/EN), auto-hide after 3 reports, new-account limits
- [x] **Claude** – Scam warnings in chat; display names can't impersonate admins
- [ ] **You** – Cloudflare account for Turnstile (free CAPTCHA); **Claude** adds it to sign-up

Security basics
- [ ] **You** – GitHub settings: Dependabot alerts, secret scanning, protect the main branch
- [x] **Claude** – GitHub Actions: run the database and browser tests on every change (`.github/workflows/tests.yml`)
- [x] **Claude** – `security.txt` and OWASP ASVS Level 1 checklist in the docs (`docs/compliance/asvs-level1.md`)
- [ ] **Claude** – Run the Supabase security check after every database change

## Phase 2 – production setup
- [ ] **You** – Buy a domain (e.g. sekuseku.lt or .com); **Claude** sets up DNS and hosting
- [ ] **You + Claude** – Move email from Gmail to a domain sender (Brevo or Resend) with SPF, DKIM and DMARC; Gmail has daily sending limits
- [ ] **You** – Decide Supabase plan: the free plan pauses inactive projects and has no downloadable backups – check current terms; Pro is the safe choice at launch
- [ ] **Claude** – Weekly backup export (if staying on free)
- [ ] **You + Claude** – Second Supabase project as "staging" for testing changes before they go live
- [ ] **Claude** – Error monitoring (e.g. Sentry free tier) and an uptime check – uptime check done (`uptime.yml`, every 3 h); Sentry needs an account
- [ ] **Claude** – Security headers via the new host (not possible on GitHub Pages)

## Phase 3 – launch
- [ ] **You** – Pilot with 10–20 Saturday-school families for 4 weeks; collect feedback
- [ ] **Claude** – Fix pilot feedback; accessibility and speed check on older phones
- [x] **Claude** – "Install the app" prompt (add to home screen), plus a service worker so updates reach phones without a hard refresh and the app opens offline
- [ ] **You** – Poster / QR code for the school, message for parent groups
- [ ] **You** – Open to other diaspora communities

## Ongoing
- [ ] **You** – Check reports in the Admin panel weekly; add a second admin
- [ ] **Claude** – Monthly dependency updates and security check
