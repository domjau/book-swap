# Email templates (seku seku brand)

Supabase sends sign-in emails itself, so its templates are pasted in by hand:
**Authentication → Emails → Templates**.

| Supabase template | File | Suggested subject |
|---|---|---|
| Magic Link | `magic-link.html` | `seku seku: {{ .Token }}` |
| Confirm signup | `confirm-signup.html` | `seku seku: {{ .Token }}` |
| Change Email Address | `change-email.html` | `seku seku: confirm your new email` |

The code is shown large, because typing it is more reliable on phones than the link.
Notification emails (requests, messages, wish-list matches…) are built by
`functions/send-notifications/index.ts` with the same frame (`emailShell`).

All emails load the logo from `brand/email/seku-email-logo.png` on the live site, so
deploy the `brand/` folder before switching templates.

Templates are in LT, EN, ES and PT. After changing a file here, paste it into Supabase again.
