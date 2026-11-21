-- seku seku – privacy and safety before inviting families (Phase 1).
-- Run after 006_isbn_lookup.sql, then run the Supabase security advisor.
--
--   Privacy:  delete_my_account(), export_my_data(), cleanup_old_data() (daily, with pg_cron)
--   Safety:   statement of reasons to the member when a listing is hidden or a member removed,
--             listings hidden automatically after 3 reports, daily limits (stricter for new accounts),
--             blocked words in listings, names, chat and reviews, names that pose as admins refused,
--             blocked members can't come back by deleting and re-creating their account.

begin;

-- ======================================================================= statement of reasons
alter table public.notifications drop constraint if exists notifications_type_check;
alter table public.notifications add constraint notifications_type_check check (type in ('request_new', 'message', 'request_answered',
  'handover_set', 'handover_reminder', 'exchange_done', 'wish_match', 'wanted', 'review', 'announcement', 'report_new', 'member_joined',
  'moderation'));

-- Tells a member what was done to their listing or account, why, and whether it was automatic (DSA art. 17).
-- Always delivered: it ignores notification settings.
create or replace function public._statement(p_user uuid, p_action text, p_target text, p_title text, p_reason text, p_auto boolean)
returns void language plpgsql security definer set search_path = public as $$
begin
  if p_user is null then return; end if;
  insert into public.notifications (user_id, group_id, type, data)
  values (p_user, public.network_id(), 'moderation', jsonb_build_object('action', p_action, 'target', coalesce(p_target, ''),
          'title', left(coalesce(p_title, ''), 150), 'reason', left(coalesce(p_reason, ''), 300), 'automatic', coalesce(p_auto, false)));
end $$;

create or replace function public.org_hide_book(p_book uuid, p_hidden boolean, p_reason text)
returns void language plpgsql security definer set search_path = public as $$
declare b record;
begin
  select id, group_id, owner_id, title into b from public.books where id = p_book;
  if b.id is null or not public.is_organiser(b.group_id) then raise exception 'only organisers'; end if;
  update public.books set hidden = coalesce(p_hidden, true) where id = p_book;
  perform public._log(b.group_id, case when p_hidden then 'hide_book' else 'unhide_book' end, p_book::text, p_reason);
  perform public._statement(b.owner_id, case when p_hidden then 'hide_book' else 'unhide_book' end, p_book::text, b.title, p_reason, false);
end $$;

create or replace function public.org_remove_member(p_group uuid, p_user uuid, p_reason text, p_ban boolean)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_organiser(p_group) then raise exception 'only organisers'; end if;
  if p_user = auth.uid() then raise exception 'use leave group to remove yourself'; end if;
  delete from public.members where group_id = p_group and user_id = p_user;
  if coalesce(p_ban, false) then
    insert into public.group_bans (group_id, user_id, reason, created_by) values (p_group, p_user, left(coalesce(p_reason, ''), 300), auth.uid())
    on conflict (group_id, user_id) do update set reason = excluded.reason;
  end if;
  perform public._log(p_group, case when p_ban then 'remove_and_ban' else 'remove' end, p_user::text, p_reason);
  perform public._statement(p_user, case when p_ban then 'remove_and_ban' else 'remove' end, p_user::text, '', p_reason, false);
end $$;

-- ======================================================================= auto-hide after 3 reports
-- Three different members reporting the same listing (open reports) hide it until an admin looks.
create or replace function public._trg_reports_autohide()
returns trigger language plpgsql security definer set search_path = public as $$
declare b record; n int;
begin
  if new.target_type <> 'book' then return new; end if;
  select id, group_id, owner_id, title, hidden into b from public.books where id::text = new.target_id;
  if b.id is null or b.hidden then return new; end if;
  select count(distinct reporter_id) into n from public.reports
   where target_type = 'book' and target_id = new.target_id and resolved_at is null and reporter_id <> b.owner_id;
  if n >= 3 then
    update public.books set hidden = true where id = b.id;
    perform public._log(b.group_id, 'auto_hide_book', b.id::text, n || ' reports');
    perform public._statement(b.owner_id, 'auto_hide_book', b.id::text, b.title, '', true);
  end if;
  return new;
end $$;
drop trigger if exists reports_autohide on public.reports;
create trigger reports_autohide after insert on public.reports for each row execute function public._trg_reports_autohide();

-- ======================================================================= daily limits
-- New accounts (first 7 days) get lower limits; admins and the server have none.
create index if not exists books_owner_created_idx on public.books (owner_id, created_at);
create index if not exists requests_requester_created_idx on public.requests (requester_id, created_at);
create index if not exists messages_sender_created_idx on public.messages (sender_id, created_at);

create or replace function public._trg_limits()
returns trigger language plpgsql security definer set search_path = public as $$
declare me uuid := auth.uid(); joined timestamptz; is_new boolean; n int; lim int;
begin
  if me is null or public.is_platform_admin() then return new; end if;
  if tg_table_name = 'messages' then
    if new.kind <> 'user' then return new; end if;
  end if;
  select joined_at into joined from public.members where user_id = me and group_id = public.network_id();
  is_new := joined is null or joined > now() - interval '7 days';
  if tg_table_name = 'books' then
    select count(*) into n from public.books where owner_id = me and created_at > now() - interval '1 day';
    lim := case when is_new then 40 else 100 end;
  elsif tg_table_name = 'requests' then
    select count(*) into n from public.requests where requester_id = me and created_at > now() - interval '1 day';
    lim := case when is_new then 5 else 20 end;
  else
    select count(*) into n from public.messages where sender_id = me and created_at > now() - interval '1 day';
    lim := case when is_new then 100 else 300 end;
  end if;
  if n >= lim then raise exception 'daily limit reached'; end if;
  return new;
end $$;
drop trigger if exists books_limits on public.books;
create trigger books_limits before insert on public.books for each row execute function public._trg_limits();
drop trigger if exists requests_limits on public.requests;
create trigger requests_limits before insert on public.requests for each row execute function public._trg_limits();
drop trigger if exists messages_limits on public.messages;
create trigger messages_limits before insert on public.messages for each row execute function public._trg_limits();

-- ======================================================================= blocked words
-- Whole words (or word starts when prefix = true), compared after lower-casing and removing punctuation.
-- Admins add more in the SQL editor:  insert into public.blocked_terms (term, prefix) values ('word', false);
create table if not exists public.blocked_terms (
  term     text primary key check (term = lower(term) and char_length(term) between 3 and 40),
  prefix   boolean not null default false,
  added_at timestamptz not null default now()
);
alter table public.blocked_terms enable row level security;
revoke all on public.blocked_terms from anon, authenticated;

insert into public.blocked_terms (term, prefix) values
  -- English
  ('fuck', true), ('motherfuck', true), ('cunt', true), ('shit', false), ('shitty', false), ('bitch', true), ('whore', true),
  ('slut', true), ('nigger', true), ('nigga', true), ('faggot', true), ('retard', false), ('retarded', false), ('porn', true),
  ('wanker', true), ('dickhead', true),
  -- Lithuanian
  ('kurva', false), ('kurvos', false), ('kurvą', false), ('kurvom', false), ('blet', false), ('bliat', false), ('blyat', false),
  ('nachui', false), ('nahui', false), ('pizd', true), ('pyzd', true), ('chuj', true), ('pydar', true), ('pidar', true),
  ('pyder', true), ('pider', true), ('šūdas', false), ('šūdo', false), ('debilas', false), ('kekšė', false), ('kekše', false),
  -- Spanish
  ('puta', false), ('putas', false), ('puto', false), ('mierda', false), ('coño', false), ('cabron', false), ('cabrón', false),
  ('gilipollas', false), ('maricon', true), ('maricón', true), ('follar', false), ('joder', false), ('pendejo', true),
  ('zorra', false), ('polla', false)
on conflict (term) do nothing;

create or replace function public.has_blocked_term(t text)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.blocked_terms b, (select ' ' || lower(regexp_replace(coalesce(t, ''), '[[:punct:][:space:]]+', ' ', 'g')) || ' ' as s) x
     where (not b.prefix and position(' ' || b.term || ' ' in x.s) > 0)
        or (b.prefix and position(' ' || b.term in x.s) > 0));
$$;

create or replace function public._trg_blocked_words()
returns trigger language plpgsql security definer set search_path = public as $$
declare txt text;
begin
  if auth.uid() is null then return new; end if; -- server and SQL editor
  -- one branch per table: PL/pgSQL only resolves the fields of the branch that runs
  if tg_table_name = 'books' then txt := concat_ws(' ', new.title, new.author, new.description, new.notes);
  elsif tg_table_name = 'wishes' then txt := concat_ws(' ', new.title, new.author);
  elsif tg_table_name = 'messages' then
    if new.kind <> 'user' then return new; end if;
    txt := new.body;
  elsif tg_table_name = 'reviews' then txt := new.comment;
  elsif tg_table_name = 'members' then txt := new.display_name;
  end if;
  if public.has_blocked_term(txt) then raise exception 'text not allowed'; end if;
  return new;
end $$;
drop trigger if exists books_words on public.books;
create trigger books_words before insert or update of title, author, description, notes on public.books for each row execute function public._trg_blocked_words();
drop trigger if exists wishes_words on public.wishes;
create trigger wishes_words before insert or update of title, author on public.wishes for each row execute function public._trg_blocked_words();
drop trigger if exists messages_words on public.messages;
create trigger messages_words before insert on public.messages for each row execute function public._trg_blocked_words();
drop trigger if exists reviews_words on public.reviews;
create trigger reviews_words before insert or update of comment on public.reviews for each row execute function public._trg_blocked_words();
drop trigger if exists members_words on public.members;
create trigger members_words before insert or update of display_name on public.members for each row execute function public._trg_blocked_words();

-- ======================================================================= names that pose as admins
create or replace function public._trg_member_name()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null or public.is_platform_admin() then return new; end if;
  if regexp_replace(lower(new.display_name), '[^a-z]', '', 'g') ~ '(admin|moderat|sekuseku|support|official|oficial)' then
    raise exception 'name not allowed';
  end if;
  return new;
end $$;
drop trigger if exists members_name on public.members;
create trigger members_name before insert or update of display_name on public.members for each row execute function public._trg_member_name();

-- ======================================================================= delete my account
-- Blocked members are remembered by a hash of their email, so deleting the account doesn't lift the block.
create table if not exists public.banned_emails (
  email_hash text primary key check (email_hash ~ '^[0-9a-f]{64}$'),
  reason     text not null default '',
  created_at timestamptz not null default now()
);
alter table public.banned_emails enable row level security;
revoke all on public.banned_emails from anon, authenticated;

create or replace function public._email_hash(p_email text)
returns text language sql immutable as $$ select encode(sha256(convert_to(lower(trim(coalesce(p_email, ''))), 'UTF8')), 'hex') $$;

-- Deletes the caller's account and everything that belongs to it: profile, books, wish list, requests
-- and chats, reviews, reports, notifications and settings (all cascade from auth.users).
-- The app removes the person's photos from storage first (storage files can't be removed from SQL).
create or replace function public.delete_my_account()
returns void language plpgsql security definer set search_path = public as $$
declare me uuid := auth.uid(); em text;
begin
  if me is null then raise exception 'not signed in'; end if;
  if exists (select 1 from public.platform_admins where user_id = me) and (select count(*) from public.platform_admins) <= 1 then
    raise exception 'add another admin before deleting the last admin account';
  end if;
  select email into em from auth.users where id = me;
  if em is not null and exists (select 1 from public.group_bans where user_id = me) then
    insert into public.banned_emails (email_hash, reason)
      select public._email_hash(em), coalesce((select reason from public.group_bans where user_id = me limit 1), '')
    on conflict (email_hash) do nothing;
  end if;
  perform public._log(public.network_id(), 'account_deleted', '', '');
  delete from auth.users where id = me;
end $$;

-- join_network also refuses a blocked email that comes back with a new account.
create or replace function public.join_network(p_display_name text, p_country text, p_postal text, p_langs text[], p_terms text)
returns uuid language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  if exists (select 1 from public.group_bans where group_id = public.network_id() and user_id = auth.uid())
     or exists (select 1 from public.banned_emails be, auth.users u where u.id = auth.uid() and be.email_hash = public._email_hash(u.email)) then
    raise exception 'this account has been blocked';
  end if;
  insert into public.members (group_id, user_id, display_name, country, postal_code, interested_langs, terms_version)
    values (public.network_id(), auth.uid(), trim(p_display_name), upper(p_country), upper(trim(p_postal)), coalesce(p_langs, '{}'), p_terms)
  on conflict (group_id, user_id) do update
    set display_name = excluded.display_name, country = excluded.country, postal_code = excluded.postal_code,
        interested_langs = excluded.interested_langs, terms_version = excluded.terms_version, terms_accepted_at = now();
  return public.network_id();
end $$;

-- ======================================================================= download my data
create or replace function public.export_my_data()
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare me uuid := auth.uid();
begin
  if me is null then raise exception 'not signed in'; end if;
  return jsonb_build_object(
    'exported_at', now(),
    'account', (select jsonb_build_object('id', u.id, 'email', u.email) from auth.users u where u.id = me),
    'profile', (select to_jsonb(m) from public.members m where m.user_id = me limit 1),
    'notification_settings', (select to_jsonb(p) from public.notification_prefs p where p.user_id = me),
    'books', coalesce((select jsonb_agg(to_jsonb(b) order by b.created_at) from public.books b where b.owner_id = me), '[]'::jsonb),
    'wish_list', coalesce((select jsonb_agg(to_jsonb(w) order by w.created_at) from public.wishes w where w.owner_id = me), '[]'::jsonb),
    'requests', coalesce((select jsonb_agg(to_jsonb(r) || jsonb_build_object(
        'items', coalesce((select jsonb_agg(to_jsonb(i)) from public.request_items i where i.request_id = r.id), '[]'::jsonb),
        'messages', coalesce((select jsonb_agg(jsonb_build_object('from_me', m.sender_id = me, 'kind', m.kind, 'body', m.body,
                    'sys_key', m.sys_key, 'created_at', m.created_at) order by m.created_at) from public.messages m where m.request_id = r.id), '[]'::jsonb))
        order by r.created_at) from public.requests r where me in (r.requester_id, r.owner_id)), '[]'::jsonb),
    'reviews_given', coalesce((select jsonb_agg(to_jsonb(v) order by v.created_at) from public.reviews v where v.reviewer_id = me), '[]'::jsonb),
    'reviews_received', coalesce((select jsonb_agg(to_jsonb(v) order by v.created_at) from public.reviews v where v.reviewee_id = me), '[]'::jsonb),
    'reports_made', coalesce((select jsonb_agg(jsonb_build_object('target_type', p.target_type, 'target_id', p.target_id, 'category', p.category,
                    'reason', p.reason, 'created_at', p.created_at, 'resolved_at', p.resolved_at) order by p.created_at)
                    from public.reports p where p.reporter_id = me), '[]'::jsonb),
    'notifications', coalesce((select jsonb_agg(to_jsonb(n) order by n.created_at) from public.notifications n where n.user_id = me), '[]'::jsonb)
  );
end $$;

-- ======================================================================= automatic clean-up
-- Retention (see docs/PRIVACY.md): read notifications 90 days, any notification 1 year, chats of finished or
-- declined requests 12 months (finished requests themselves stay, because reviews hang on them),
-- declined requests 12 months, unanswered requests 6 months, library fair-use log 1 day.
create or replace function public.cleanup_old_data()
returns jsonb language plpgsql security definer set search_path = public as $$
declare n_notif int; n_msgs int; n_req int; n_log int;
begin
  delete from public.notifications
   where (read_at is not null and created_at < now() - interval '90 days') or created_at < now() - interval '1 year';
  get diagnostics n_notif = row_count;
  delete from public.messages m using public.requests r
   where m.request_id = r.id and r.status in ('done', 'declined') and r.updated_at < now() - interval '12 months';
  get diagnostics n_msgs = row_count;
  delete from public.requests
   where (status = 'declined' and updated_at < now() - interval '12 months')
      or (status = 'pending' and updated_at < now() - interval '6 months');
  get diagnostics n_req = row_count;
  delete from public.isbn_lookup_log where at < now() - interval '1 day';
  get diagnostics n_log = row_count;
  return jsonb_build_object('notifications', n_notif, 'messages', n_msgs, 'requests', n_req, 'lookup_log', n_log);
end $$;

-- Daily at 03:30 UTC, once pg_cron is turned on (Database → Extensions). If it is off now,
-- run this line after turning it on:  select cron.schedule('cleanup-old-data', '30 3 * * *', $$ select public.cleanup_old_data(); $$);
do $do$ begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    perform cron.schedule('cleanup-old-data', '30 3 * * *', $$ select public.cleanup_old_data(); $$);
  end if;
end $do$;

-- ======================================================================= privileges
revoke all on function public._statement(uuid, text, text, text, text, boolean), public._trg_reports_autohide(), public._trg_limits(),
  public.has_blocked_term(text), public._trg_blocked_words(), public._trg_member_name(), public._email_hash(text),
  public.delete_my_account(), public.export_my_data(), public.cleanup_old_data(),
  public.org_hide_book(uuid, boolean, text), public.org_remove_member(uuid, uuid, text, boolean),
  public.join_network(text, text, text, text[], text)
  from public, anon, authenticated;
grant execute on function public.delete_my_account(), public.export_my_data(),
  public.org_hide_book(uuid, boolean, text), public.org_remove_member(uuid, uuid, text, boolean),
  public.join_network(text, text, text, text[], text)
  to authenticated;

commit;
