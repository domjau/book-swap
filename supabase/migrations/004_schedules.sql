-- Book Swap – scheduled jobs (handover reminders + notification emails).
-- 1. Enable the extensions first: Database → Extensions → turn on "pg_cron" and "pg_net".
-- 2. Deploy the Edge Function "send-notifications" (see supabase/README.md).
-- 3. Replace YOUR_CRON_SECRET below with the same random value you saved as the CRON_SECRET secret, then run this file.

-- Handover reminders every morning at 07:00 UTC (in-app, and by email for people who want it)
select cron.schedule('handover-reminders', '0 7 * * *', $$ select public.send_handover_reminders(); $$);

-- "Right away" emails: every 5 minutes
select cron.schedule('email-instant', '*/5 * * * *', $$
  select net.http_post(
    url := 'https://dkypgyfbjtixyypsmais.supabase.co/functions/v1/send-notifications?mode=instant',
    headers := jsonb_build_object('Authorization', 'Bearer YOUR_CRON_SECRET', 'Content-Type', 'application/json'),
    body := '{}'::jsonb);
$$);

-- "Once a day" summary at 17:00 UTC
select cron.schedule('email-daily', '0 17 * * *', $$
  select net.http_post(
    url := 'https://dkypgyfbjtixyypsmais.supabase.co/functions/v1/send-notifications?mode=daily',
    headers := jsonb_build_object('Authorization', 'Bearer YOUR_CRON_SECRET', 'Content-Type', 'application/json'),
    body := '{}'::jsonb);
$$);

-- To see the jobs:   select * from cron.job;
-- To remove one:     select cron.unschedule('email-instant');
