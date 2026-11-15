# Database (Supabase)

## Set up a new project

1. Create a Supabase project (EU region), with **automatic RLS on** and **"expose new tables" off**.
2. Open **SQL Editor → New query**, paste the whole of [`migrations/001_init.sql`](migrations/001_init.sql) and click **Run**. It should finish with "Success. No rows returned".
3. **Authentication → URL Configuration**: set **Site URL** to the app's address, e.g. `https://domjau.github.io/book-swap/`, and add the same under **Redirect URLs**.
4. **Authentication → Emails → SMTP Settings**: connect an email provider (e.g. Brevo, Resend or your domain's mailbox). Until then, sign-in emails only reach members of your Supabase team.
   Then, under **Authentication → Emails → Templates**, add the code to the **Magic Link** and **Confirm signup** templates, for example `<p>Your code: <strong>{{ .Token }}</strong></p>`. On phones, typing the code is more reliable than the link, because email apps often open links in a different browser.
5. Put the **Project URL** and the **publishable key** in `config.js`. **Never** put the secret / service_role key in the app.

## What the schema does

- Every table has row-level security, and logged-out visitors can read nothing.
- Members see only their own group. Requests and chat are visible only to the two people involved.
- All status changes (accept, schedule handover, done) go through `SECURITY DEFINER` functions that check the caller.
- Photos are stored in a private bucket at `book-photos/{group}/{user}/…`, as JPEG only, max 600 KB.
- Chat and request messages with e-book files or file-sharing links are refused by the database itself.

## Security tests

`tests/rls_test.sh` runs 44 checks against a local PostgreSQL with a small Supabase imitation (`tests/local_supabase_stub.sql`). It covers three users in two groups: reading, writing and status changes across groups, posting as someone else, and photo upload and read rules.

```bash
sudo -u postgres psql -f supabase/tests/local_supabase_stub.sql
sudo -u postgres psql -d bs -f supabase/migrations/001_init.sql
bash supabase/tests/rls_test.sh      # expects: 44 passed, 0 failed
```
