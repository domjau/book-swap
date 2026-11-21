# Record of processing activities (GDPR art. 30)

> Working document kept by the controller. Not legal advice. Last reviewed: 21 Nov 2026. Review it whenever a new feature stores new data or a new provider is added.

## Controller

| | |
|---|---|
| Controller | The person who runs seku seku (name, country and contact email: fill in `TERMS.operator` in `terms.js`; the same details go here) |
| Contact for data questions | see the privacy notice (`#/privacy`) |
| Data protection officer | Not required (small, non-commercial service, no large-scale special-category data) |
| EU representative | Not needed (controller is in the EU) |

## Processing activities

| # | Activity | Purpose | Legal basis | Data subjects | Personal data | Recipients | Retention |
|---|---|---|---|---|---|---|---|
| 1 | Accounts and sign-in | Let members sign in with a one-time code | 6(1)(b) contract | Members | Email address, sign-in times, session tokens | Supabase (auth), email provider (sign-in emails) | Until the account is deleted |
| 2 | Member profile | Show who is swapping and how near they are | 6(1)(b) | Members | Display name, country, postal code, book languages, optional profile picture, terms version and time accepted, join date | Other signed-in members (name, country, postal code, picture) | Until the account is deleted |
| 3 | Listings and wish lists | The book swap itself | 6(1)(b) | Members | Books with own photos (metadata stripped), descriptions, wish-list titles | Other signed-in members | Until removed by the member or the account is deleted; gone books after 12 months (to do) |
| 4 | Requests, chat and handovers | Arrange swaps | 6(1)(b) | Members | Requests, chosen books, chat messages, handover date and place | The two people in the request; admins only for a reported chat | Chats of finished or declined swaps 12 months; unanswered requests 6 months |
| 5 | Reviews | Trust between members | 6(1)(b) | Members | 1–5 rating and short comment, linked to a finished swap | Signed-in members | Until either account is deleted |
| 6 | Notifications | Tell members about requests, messages, reminders | 6(1)(b) | Members | Notification type and short snippet, settings, email address | Email provider for emails | Read: 90 days; all: 1 year |
| 7 | Reports and moderation | Keep the platform safe and legal (DSA) | 6(1)(f) safety; 6(1)(c) DSA duties | Members, reported members, people who report by email | Report category and text, moderation log (action, reason, time), statements of reasons, hashed emails of blocked members | Admins | Reports and log: kept while needed for safety and DSA (review yearly); blocked-email hash: as long as the block |
| 8 | Abuse limits | Stop spam and overuse | 6(1)(f) | Members | Counts of books, requests and messages per day; library-lookup log (member id and time) | Nobody outside the system | Library log 1 day; counts are computed from existing rows |
| 9 | Book lookups | Fill in book details from an ISBN | 6(1)(b) | Members | ISBN or search text only; the member's browser IP is seen by Google Books and Open Library | Google (US), Internet Archive (US), National Library of Lithuania (via our server, ISBN only) | Not stored with personal data; library results cached per ISBN, no user data |
| 10 | Hosting of the app | Deliver the web app | 6(1)(f) | Visitors | IP address and browser data in server logs | GitHub (Pages, US) | Provider's own log retention |

No special-category data, no data about children, no profiling, no automated decisions with legal effect (the automatic hide after 3 reports is reviewed by an admin and the member is told).

## Processors and transfers

| Processor | Role | Location | DPA | Transfer safeguard |
|---|---|---|---|---|
| Supabase Inc. | Database, auth, storage, Edge Functions | EU (Frankfurt, eu-central-1) | To sign in the Supabase dashboard (launch board task) | EU region; Supabase DPA with SCCs for support access |
| Brevo (Sendinblue SAS) | Sign-in and notification emails (planned) | EU (France) | Brevo DPA (part of their terms) | Stays in the EU |
| Google LLC (Gmail, if used for sending) | Emails | US/global | Google Workspace / Gmail terms | EU–US Data Privacy Framework |
| GitHub Inc. | Hosting of the static app | US | GitHub DPA | EU–US Data Privacy Framework |
| Google LLC (Google Books) | Book lookups | US | Independent controller | ISBN or search text only |
| Internet Archive (Open Library) | Book lookups | US | Independent controller | ISBN only |

## Security measures (art. 32)

- Row-level security on every table; state changes only through checked `SECURITY DEFINER` functions; Supabase security advisor run after each change.
- Private photo bucket with short-lived signed URLs; photos redrawn to strip metadata.
- Strict Content-Security-Policy; all user text escaped before display.
- No service-role key in the app; secrets only in Supabase.
- Two-step login on Supabase, GitHub and the email accounts (launch board task).
- Database and email-logic tests run on every change (GitHub Actions).
- Breach plan: [breach-plan.md](breach-plan.md).
