# Automatic emails (seku seku brand)

Every automatic email (the three Supabase sign-in emails and the notification emails) is built
from two files:

| File | What to change there |
|---|---|
| [`theme.mjs`](theme.mjs) | **Colours, logo, site link, code size and all sign-in wording.** The one place to tweak. |
| [`shell.mjs`](shell.mjs) | The layout (logo, card with the three-colour strip, code box, button, small print). |

After editing either file run `node supabase/email-templates/build.mjs`. It rewrites the three
templates below, the generated frame inside `functions/send-notifications/index.ts`, and the
sample previews in `preview/` (open them in a browser). CI fails if you forget to run it.
Notification wording (per notification type and language) stays in `TEXT` in
`functions/send-notifications/index.ts`.

Design rules: tables and inline styles only (Gmail, Outlook, Apple Mail), max 520 px wide,
no scripts or web fonts that must load, light colour scheme. The sign-in code is the centrepiece:
it is also at the start of the subject and the inbox preview, so it can be read without opening.

## Paste the sign-in templates into Supabase

Supabase sends sign-in emails itself, so its templates are pasted by hand:
**Authentication → Emails → Templates**. For each row: open the tab, replace the subject,
replace the whole body with the file's contents, **Save**.

| Supabase tab | File | Subject |
|---|---|---|
| Magic Link | `magic-link.html` | `{{ .Token }} · seku seku` |
| Confirm signup | `confirm-signup.html` | `{{ .Token }} · seku seku` |
| Change Email Address | `change-email.html` | `seku seku: confirm your new email` |

Supabase sends **Confirm signup** to a new address and **Magic Link** to everyone else, so both
must be pasted. If an email arrives with only a link, Supabase is still using its default template.

Then **Authentication → Sign In / Providers → Email**: set **Email OTP Length** to `6`
(the app asks for the code; the field accepts up to 10 digits, but 6 is easiest to type).

The logo loads from `brand/email/seku-email-logo.png` on the live site, so it shows once
`main` is deployed.
