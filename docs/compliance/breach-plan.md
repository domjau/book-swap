# Data breach plan (one page)

> What to do if personal data on seku seku may have been seen, changed, lost or deleted by someone who shouldn't have. GDPR art. 33–34. Keep it short and follow it in order.

**Who decides:** the controller (the person who runs seku seku). If they can't be reached, any admin starts steps 1–3 and keeps trying to reach them.

## 1. Contain (first hour)

- If a key or password may be out: **rotate it now** – Supabase service_role / secret keys (Settings → API), the SMTP password or Brevo SMTP key, CRON_SECRET, the GitHub token, and the database password.
- If an account is misused: remove or block it in the admin panel; in Supabase → Authentication, sign the user out.
- If the app itself is the problem: revert the last commit on `main` (GitHub Pages redeploys in about a minute).
- If the database is being abused: pause the Supabase project (Settings → General → Pause) – the app stops, data stays.

## 2. Write it down (same day)

Start a note (private GitHub issue or a document) with: what happened, when it started and was found, which data and roughly how many members, what was done, and who knows. Keep adding to it. Every breach is recorded, even small ones that don't need to be reported.

## 3. Assess the risk (within 24 hours)

| Situation | Risk | Tell the authority? | Tell members? |
|---|---|---|---|
| Data only exposed to Supabase/GitHub staff, or encrypted and the key is safe | Low | No (record only) | No |
| Display names, postal codes or books seen by outsiders | Usually low–medium | Yes, unless clearly unlikely to harm anyone | Usually no |
| Email addresses leaked | Medium (phishing) | Yes | Yes |
| Chat messages leaked, or accounts taken over | High | Yes | Yes |

## 4. Report to the authority (within 72 hours of finding it)

Report to the data protection authority of the country where the controller is established, e.g. **Datatilsynet** (Denmark, datatilsynet.dk, online form) or the **State Data Protection Inspectorate** (Lithuania, vdai.lrv.lt). If some facts are still unknown, report what you know and add the rest later. Include: what happened, categories and rough numbers of people and records, likely consequences, measures taken, and the contact person.

## 5. Tell the members (without undue delay, if the risk is high)

Use an announcement in the admin panel and an email. Plain language, in LT, ES and EN:

> We found a problem on seku seku on [date]: [what happened]. It affected [what data] of [who]. We have [what we did]. Please [what members should do, e.g. be careful with emails that ask you to sign in]. Questions: [contact].

## 6. Afterwards

Fix the cause, add a test that would have caught it, run the Supabase security advisor, and note in the record what changed. Review this plan once a year.

## Useful places

- Supabase logs: dashboard → Logs (auth, API, Postgres, Edge Functions)
- Moderation log: admin panel → Log
- GitHub security tab: Dependabot and secret-scanning alerts
