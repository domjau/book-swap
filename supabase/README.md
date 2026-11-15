# Database (Supabase)

## Set up a new project

1. Create a Supabase project (EU region), with **automatic RLS on** and **"expose new tables" off**.
2. Open **SQL Editor → New query**, paste the whole of [`migrations/001_init.sql`](migrations/001_init.sql) and click **Run**. It should finish with "Success. No rows returned". Then do the same with [`002_reviews_avatars.sql`](migrations/002_reviews_avatars.sql) (reviews and profile pictures) and [`003_notifications_admin.sql`](migrations/003_notifications_admin.sql) (notifications, moderation tools), then [`005_open_network.sql`](migrations/005_open_network.sql) (one open network for everyone, moderated by admins). Always run the migrations in number order, each one once.
3. **Authentication → URL Configuration**: set **Site URL** to the app's address, e.g. `https://domjau.github.io/book-swap/`, and add the same under **Redirect URLs**.
4. **Authentication → Emails → SMTP Settings**: connect an email provider (e.g. Brevo, Resend or your domain's mailbox). Until then, sign-in emails only reach members of your Supabase team.
   Then, under **Authentication → Emails → Templates**, paste the branded templates from [`email-templates/`](email-templates/README.md) (they show the code, `{{ .Token }}`, in large type). On phones, typing the code is more reliable than the link, because email apps often open links in a different browser.
5. Put the **Project URL** and the **publishable key** in `config.js`. **Never** put the secret / service_role key in the app.

## Notification emails (optional, recommended)

In-app notifications (the bell) work as soon as migration 003 has run. To also send **emails**:

1. **Deploy the email function.** Go to Supabase → **Edge Functions → Deploy a new function → Via editor**. Name it `send-notifications`, paste [`functions/send-notifications/index.ts`](functions/send-notifications/index.ts), and deploy. Then open the function's settings and turn **Verify JWT** off; the function checks its own secret instead.
2. **Add secrets** under Edge Functions → **Secrets**:
   | Name | Value |
   |---|---|
   | `SMTP_HOST` | `smtp.gmail.com` |
   | `SMTP_PORT` | `465` |
   | `SMTP_USER` | `pasakabookswap@gmail.com` |
   | `SMTP_PASS` | the Gmail **app password** |
   | `SMTP_FROM` | `seku seku <pasakabookswap@gmail.com>` |
   | `APP_URL` | `https://domjau.github.io/book-swap/` |
   | `CRON_SECRET` | a long random text you make up (e.g. 40 letters and numbers) |
3. **Schedule it.** Under **Database → Extensions**, enable **pg_cron** and **pg_net**. Then open [`migrations/004_schedules.sql`](migrations/004_schedules.sql), replace `YOUR_CRON_SECRET` (twice) with your secret, and run it in the SQL editor. This sets up:
   - handover reminders at 07:00 UTC;
   - "right away" emails every 5 minutes;
   - a daily summary at 17:00 UTC.

Email logic tests: `functions/send-notifications/logic_test.mjs` (12 checks).

## Admins

There is **one open network**: anyone can sign up with their email, and everyone sees everyone's listings. There are no communities, invite codes or organisers. Moderation is done by **admins**.

- **The first admin (you)**: sign up in the app first, then run this once in the SQL editor with your own email:
  ```sql
  insert into public.platform_admins (user_id)
  select id from auth.users where email = 'you@example.com';
  ```
- **More admins**: ask the person to sign up in the app. Then open **Profile → Admin panel → Admins**, type their email and tap **Add admin**. You can remove admins there too; the last admin can't be removed.
- Admins see the tabs **Overview** (stats, announcement to everyone), **Members** (remove and block), **Reports** (read the reported conversation, hide a listing, resolve), **Admins** and **Log**. Every admin action is written to the moderation log.

## What the schema does

- Every table has row-level security, and logged-out visitors can read nothing.
- Only signed-in members can see listings and profiles. Requests and chat are visible only to the two people involved.
- All status changes (accept, schedule handover, done) go through `SECURITY DEFINER` functions that check the caller.
- Photos are stored in a private bucket at `book-photos/{group}/{user}/…`, as JPEG only, max 600 KB.
- Chat and request messages with e-book files or file-sharing links are refused by the database itself.

## Security tests

`tests/rls_test.sh` runs 107 checks for migrations 001–003, and `tests/network_test.sh` runs 46 checks for the open network and admins (001–005). against a local PostgreSQL with a small Supabase imitation (`tests/local_supabase_stub.sql`). The first covers three users in two groups: reading, writing and status changes across groups, posting as someone else, and photo upload and read rules.

```bash
sudo -u postgres psql -f supabase/tests/local_supabase_stub.sql
sudo -u postgres psql -d bs -f supabase/migrations/001_init.sql
sudo -u postgres psql -d bs -f supabase/migrations/002_reviews_avatars.sql
sudo -u postgres psql -d bs -f supabase/migrations/003_notifications_admin.sql
bash supabase/tests/rls_test.sh      # expects: 107 passed, 0 failed
bash supabase/tests/network_test.sh  # runs 001–005 on a fresh database; expects: 46 passed, 0 failed
```
