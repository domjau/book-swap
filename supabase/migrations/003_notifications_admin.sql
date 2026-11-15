-- Book Swap – notifications, organiser tools and platform admin.
-- Run after 002_reviews_avatars.sql, in the Supabase SQL editor.

begin;

-- ======================================================================= notifications

create table if not exists public.notifications (
  id         bigint generated always as identity primary key,
  user_id    uuid not null references auth.users(id) on delete cascade,
  group_id   uuid references public.groups(id) on delete cascade,
  type       text not null check (type in ('request_new', 'message', 'request_answered', 'handover_set', 'handover_reminder',
               'exchange_done', 'wish_match', 'wanted', 'review', 'announcement', 'report_new', 'member_joined')),
  data       jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  read_at    timestamptz,
  emailed_at timestamptz
);
create index if not exists notifications_user_idx on public.notifications (user_id, created_at desc);
create index if not exists notifications_unsent_idx on public.notifications (created_at) where emailed_at is null;

create table if not exists public.notification_prefs (
  user_id     uuid primary key references auth.users(id) on delete cascade,
  app_types   text[] not null default array['request_new', 'message', 'request_answered', 'handover_set', 'handover_reminder',
                'exchange_done', 'wish_match', 'wanted', 'review', 'announcement', 'report_new', 'member_joined'],
  email_types text[] not null default array['request_new', 'message', 'request_answered', 'handover_reminder', 'wish_match',
                'announcement', 'report_new'],
  email_mode  text not null default 'instant' check (email_mode in ('instant', 'daily', 'off')),
  lang        text not null default 'en' check (lang ~ '^[a-z]{2}$'),
  updated_at  timestamptz not null default now(),
  check (app_types <@ array['request_new', 'message', 'request_answered', 'handover_set', 'handover_reminder', 'exchange_done',
         'wish_match', 'wanted', 'review', 'announcement', 'report_new', 'member_joined']),
  check (email_types <@ array['request_new', 'message', 'request_answered', 'handover_set', 'handover_reminder', 'exchange_done',
         'wish_match', 'wanted', 'review', 'announcement', 'report_new', 'member_joined'])
);

revoke all on public.notifications, public.notification_prefs from anon, authenticated;
alter table public.notifications enable row level security;
alter table public.notification_prefs enable row level security;

grant select, delete on public.notifications to authenticated;
grant update (read_at) on public.notifications to authenticated;
create policy notifications_own_read on public.notifications for select to authenticated using (user_id = auth.uid());
create policy notifications_own_update on public.notifications for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy notifications_own_delete on public.notifications for delete to authenticated using (user_id = auth.uid());

grant select on public.notification_prefs to authenticated;
grant insert (user_id, app_types, email_types, email_mode, lang) on public.notification_prefs to authenticated;
grant update (app_types, email_types, email_mode, lang, updated_at) on public.notification_prefs to authenticated;
create policy prefs_own_read on public.notification_prefs for select to authenticated using (user_id = auth.uid());
create policy prefs_own_insert on public.notification_prefs for insert to authenticated with check (user_id = auth.uid());
create policy prefs_own_update on public.notification_prefs for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Normalised title for wish-list matching (same idea as the app: case and punctuation ignored).
create or replace function public._norm(t text)
returns text language sql immutable as $$
  select lower(trim(regexp_replace(coalesce(t, ''), '[^[:alnum:]]+', ' ', 'g')));
$$;

-- Create a notification, respecting the person's settings. Unread chat notifications are
-- collapsed into one per conversation so a busy chat doesn't flood the bell or the inbox.
create or replace function public._notify(p_user uuid, p_group uuid, p_type text, p_data jsonb)
returns void language plpgsql security definer set search_path = public as $$
begin
  if p_user is null then return; end if;
  if exists (select 1 from public.notification_prefs np where np.user_id = p_user
             and not (p_type = any (np.app_types)) and not (p_type = any (np.email_types))) then
    return; -- switched off completely
  end if;
  if p_type = 'message' then
    update public.notifications
       set created_at = now(),
           data = data || jsonb_build_object('count', coalesce((data ->> 'count')::int, 1) + 1, 'snippet', p_data -> 'snippet')
     where user_id = p_user and type = 'message' and read_at is null and data ->> 'request_id' = p_data ->> 'request_id';
    if found then return; end if;
  end if;
  insert into public.notifications (user_id, group_id, type, data) values (p_user, p_group, p_type, coalesce(p_data, '{}'::jsonb));
end $$;

-- ----------------------------------------------------------------- triggers that create notifications

create or replace function public._trg_requests()
returns trigger language plpgsql security definer set search_path = public as $$
declare other uuid;
begin
  if tg_op = 'INSERT' then
    perform public._notify(new.owner_id, new.group_id, 'request_new', jsonb_build_object('request_id', new.id, 'actor', new.requester_id));
    return new;
  end if;
  other := case when auth.uid() = new.owner_id then new.requester_id
                when auth.uid() = new.requester_id then new.owner_id else null end;
  if new.status is distinct from old.status then
    if new.status in ('accepted', 'declined') then
      perform public._notify(new.requester_id, new.group_id, 'request_answered', jsonb_build_object('request_id', new.id, 'actor', new.owner_id, 'status', new.status));
    elsif new.status = 'scheduled' then
      perform public._notify(other, new.group_id, 'handover_set', jsonb_build_object('request_id', new.id, 'actor', auth.uid(), 'when', new.handover_on, 'where', new.handover_place));
    elsif new.status = 'done' then
      perform public._notify(other, new.group_id, 'exchange_done', jsonb_build_object('request_id', new.id, 'actor', auth.uid()));
    end if;
  elsif new.status = 'scheduled' and (new.handover_on is distinct from old.handover_on or new.handover_place is distinct from old.handover_place) then
    perform public._notify(other, new.group_id, 'handover_set', jsonb_build_object('request_id', new.id, 'actor', auth.uid(), 'when', new.handover_on, 'where', new.handover_place));
  end if;
  return new;
end $$;
drop trigger if exists notify_requests on public.requests;
create trigger notify_requests after insert or update on public.requests for each row execute function public._trg_requests();

create or replace function public._trg_messages()
returns trigger language plpgsql security definer set search_path = public as $$
declare r public.requests;
begin
  if new.kind <> 'user' then return new; end if;
  select * into r from public.requests where id = new.request_id;
  perform public._notify(case when new.sender_id = r.owner_id then r.requester_id else r.owner_id end, r.group_id, 'message',
    jsonb_build_object('request_id', r.id, 'actor', new.sender_id, 'snippet', left(new.body, 80)));
  return new;
end $$;
drop trigger if exists notify_messages on public.messages;
create trigger notify_messages after insert on public.messages for each row execute function public._trg_messages();

create or replace function public._trg_reviews()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  perform public._notify(new.reviewee_id, new.group_id, 'review', jsonb_build_object('request_id', new.request_id, 'actor', new.reviewer_id, 'rating', new.rating));
  return new;
end $$;
drop trigger if exists notify_reviews on public.reviews;
create trigger notify_reviews after insert on public.reviews for each row execute function public._trg_reviews();

-- A new book: tell everyone in the group who has it on their wish list.
create or replace function public._trg_books()
returns trigger language plpgsql security definer set search_path = public as $$
declare w record;
begin
  for w in select distinct on (owner_id) owner_id from public.wishes
            where group_id = new.group_id and owner_id <> new.owner_id
              and ((isbn is not null and isbn = new.isbn) or public._norm(title) = public._norm(new.title))
  loop
    perform public._notify(w.owner_id, new.group_id, 'wish_match', jsonb_build_object('book_id', new.id, 'title', new.title, 'actor', new.owner_id));
  end loop;
  return new;
end $$;
drop trigger if exists notify_books on public.books;
create trigger notify_books after insert on public.books for each row execute function public._trg_books();

-- A new wish: tell owners who have that book available.
create or replace function public._trg_wishes()
returns trigger language plpgsql security definer set search_path = public as $$
declare b record;
begin
  for b in select distinct on (owner_id) owner_id, id, title from public.books
            where group_id = new.group_id and owner_id <> new.owner_id and status = 'available' and not hidden
              and ((new.isbn is not null and isbn = new.isbn) or public._norm(title) = public._norm(new.title))
  loop
    perform public._notify(b.owner_id, new.group_id, 'wanted', jsonb_build_object('book_id', b.id, 'title', b.title, 'actor', new.owner_id));
  end loop;
  return new;
end $$;

create or replace function public._trg_reports()
returns trigger language plpgsql security definer set search_path = public as $$
declare m record;
begin
  for m in select user_id from public.members where group_id = new.group_id and role = 'organiser' and user_id <> new.reporter_id loop
    perform public._notify(m.user_id, new.group_id, 'report_new', jsonb_build_object('report_id', new.id, 'category', new.category));
  end loop;
  return new;
end $$;

create or replace function public._trg_members()
returns trigger language plpgsql security definer set search_path = public as $$
declare m record;
begin
  for m in select user_id from public.members where group_id = new.group_id and role = 'organiser' and user_id <> new.user_id loop
    perform public._notify(m.user_id, new.group_id, 'member_joined', jsonb_build_object('actor', new.user_id, 'name', new.display_name));
  end loop;
  return new;
end $$;
drop trigger if exists notify_members on public.members;
create trigger notify_members after insert on public.members for each row execute function public._trg_members();

-- Handover reminders for tomorrow (run daily – see 004_schedules.sql).
create or replace function public.send_handover_reminders()
returns integer language plpgsql security definer set search_path = public as $$
declare r public.requests; n integer := 0; u uuid;
begin
  for r in select * from public.requests where status = 'scheduled' and handover_on = current_date + 1 loop
    foreach u in array array[r.owner_id, r.requester_id] loop
      if not exists (select 1 from public.notifications where user_id = u and type = 'handover_reminder' and data ->> 'request_id' = r.id::text) then
        perform public._notify(u, r.group_id, 'handover_reminder', jsonb_build_object('request_id', r.id, 'when', r.handover_on, 'where', r.handover_place,
          'actor', case when u = r.owner_id then r.requester_id else r.owner_id end));
        n := n + 1;
      end if;
    end loop;
  end loop;
  return n;
end $$;

-- ======================================================================= moderation

-- Organisers can hide a listing (owner and organisers still see it).
alter table public.books add column if not exists hidden boolean not null default false;
drop policy if exists books_read on public.books;
create policy books_read on public.books for select to authenticated
  using (public.is_member(group_id) and (not hidden or owner_id = auth.uid() or public.is_organiser(group_id)));

-- Now that books.hidden exists, the wish trigger can be attached.
drop trigger if exists notify_wishes on public.wishes;
create trigger notify_wishes after insert on public.wishes for each row execute function public._trg_wishes();

-- Report categories and resolution notes.
alter table public.reports add column if not exists category text not null default 'other'
  check (category in ('no_show', 'inappropriate', 'copyright', 'spam', 'safety', 'other'));
alter table public.reports add column if not exists resolution text not null default '' check (char_length(resolution) <= 300);
grant insert (category) on public.reports to authenticated;
revoke update (resolved_at) on public.reports from authenticated; -- resolve via org_resolve_report()
drop policy if exists reports_resolve on public.reports;
drop trigger if exists notify_reports on public.reports;
create trigger notify_reports after insert on public.reports for each row execute function public._trg_reports();

-- Group settings: usual handover day.
alter table public.groups add column if not exists handover_day text check (handover_day in ('mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'));
grant update (handover_day) on public.groups to authenticated;

-- Removed members can be banned from re-joining with a new invite.
create table if not exists public.group_bans (
  group_id   uuid not null references public.groups(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  reason     text not null default '' check (char_length(reason) <= 300),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  primary key (group_id, user_id)
);
-- Every organiser action is logged (who did what, when, why).
create table if not exists public.moderation_log (
  id         bigint generated always as identity primary key,
  group_id   uuid references public.groups(id) on delete cascade,
  actor_id   uuid references auth.users(id) on delete set null,
  action     text not null,
  target     text not null default '',
  reason     text not null default '' check (char_length(reason) <= 300),
  created_at timestamptz not null default now()
);
revoke all on public.group_bans, public.moderation_log from anon, authenticated;
alter table public.group_bans enable row level security;
alter table public.moderation_log enable row level security;
grant select on public.moderation_log to authenticated;
create policy modlog_read on public.moderation_log for select to authenticated using (public.is_organiser(group_id));

create or replace function public._log(p_group uuid, p_action text, p_target text, p_reason text)
returns void language sql security definer set search_path = public as $$
  insert into public.moderation_log (group_id, actor_id, action, target, reason)
  values (p_group, auth.uid(), p_action, coalesce(p_target, ''), left(coalesce(p_reason, ''), 300));
$$;

-- join_group now refuses banned users.
create or replace function public.join_group(
  p_code text, p_display_name text, p_country text, p_postal text, p_langs text[], p_terms text)
returns uuid language plpgsql security definer set search_path = public as $$
declare g uuid;
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  select gi.group_id into g from public.group_invites gi
   where gi.code_hash = public._hash_code(p_code) and not gi.revoked
     and (gi.expires_at is null or gi.expires_at > now());
  if g is null then raise exception 'invalid or expired invite code'; end if;
  if exists (select 1 from public.group_bans where group_id = g and user_id = auth.uid()) then
    raise exception 'invalid or expired invite code';
  end if;
  insert into public.members (group_id, user_id, display_name, country, postal_code, interested_langs, terms_version)
    values (g, auth.uid(), trim(p_display_name), upper(p_country), upper(trim(p_postal)), coalesce(p_langs, '{}'), p_terms)
  on conflict (group_id, user_id) do update
    set display_name = excluded.display_name, country = excluded.country, postal_code = excluded.postal_code,
        interested_langs = excluded.interested_langs, terms_version = excluded.terms_version, terms_accepted_at = now();
  return g;
end $$;

-- ----------------------------------------------------------------- organiser functions

create or replace function public.org_set_role(p_group uuid, p_user uuid, p_role text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_organiser(p_group) then raise exception 'only organisers'; end if;
  if p_role not in ('member', 'organiser') then raise exception 'bad role'; end if;
  if p_role = 'member' and (select count(*) from public.members where group_id = p_group and role = 'organiser' and user_id <> p_user) = 0 then
    raise exception 'a group needs at least one organiser';
  end if;
  update public.members set role = p_role where group_id = p_group and user_id = p_user;
  perform public._log(p_group, 'set_role:' || p_role, p_user::text, '');
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
end $$;

create or replace function public.org_unban(p_group uuid, p_user uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_organiser(p_group) then raise exception 'only organisers'; end if;
  delete from public.group_bans where group_id = p_group and user_id = p_user;
  perform public._log(p_group, 'unban', p_user::text, '');
end $$;

create or replace function public.org_bans(p_group uuid)
returns table (user_id uuid, reason text, created_at timestamptz)
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.is_organiser(p_group) then raise exception 'only organisers'; end if;
  return query select b.user_id, b.reason, b.created_at from public.group_bans b where b.group_id = p_group order by b.created_at desc;
end $$;

create or replace function public.org_hide_book(p_book uuid, p_hidden boolean, p_reason text)
returns void language plpgsql security definer set search_path = public as $$
declare g uuid;
begin
  select group_id into g from public.books where id = p_book;
  if g is null or not public.is_organiser(g) then raise exception 'only organisers'; end if;
  update public.books set hidden = coalesce(p_hidden, true) where id = p_book;
  perform public._log(g, case when p_hidden then 'hide_book' else 'unhide_book' end, p_book::text, p_reason);
end $$;

create or replace function public.org_invites(p_group uuid)
returns table (id uuid, created_at timestamptz, expires_at timestamptz, revoked boolean)
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.is_organiser(p_group) then raise exception 'only organisers'; end if;
  return query select i.id, i.created_at, i.expires_at, i.revoked from public.group_invites i
                where i.group_id = p_group order by i.created_at desc limit 50;
end $$;

create or replace function public.org_revoke_invite(p_invite uuid)
returns void language plpgsql security definer set search_path = public as $$
declare g uuid;
begin
  select group_id into g from public.group_invites where id = p_invite;
  if g is null or not public.is_organiser(g) then raise exception 'only organisers'; end if;
  update public.group_invites set revoked = true where id = p_invite;
  perform public._log(g, 'revoke_invite', p_invite::text, '');
end $$;

create or replace function public.org_resolve_report(p_report bigint, p_resolution text)
returns void language plpgsql security definer set search_path = public as $$
declare g uuid;
begin
  select group_id into g from public.reports where id = p_report;
  if g is null or not public.is_organiser(g) then raise exception 'only organisers'; end if;
  update public.reports set resolved_at = now(), resolution = left(coalesce(p_resolution, ''), 300) where id = p_report;
  perform public._log(g, 'resolve_report', p_report::text, p_resolution);
end $$;

-- For a reported conversation, organisers may read its last 30 messages (and only then).
create or replace function public.org_report_context(p_report bigint)
returns table (sender_id uuid, kind text, body text, sys_key text, created_at timestamptz)
language plpgsql stable security definer set search_path = public as $$
declare rep public.reports;
begin
  select * into rep from public.reports where id = p_report;
  if rep.id is null or not public.is_organiser(rep.group_id) then raise exception 'only organisers'; end if;
  if rep.target_type <> 'request' then return; end if;
  return query select m.sender_id, m.kind, m.body, m.sys_key, m.created_at from public.messages m
                where m.request_id::text = rep.target_id order by m.created_at desc limit 30;
end $$;

create or replace function public.org_announce(p_group uuid, p_text text)
returns integer language plpgsql security definer set search_path = public as $$
declare m record; n integer := 0;
begin
  if not public.is_organiser(p_group) then raise exception 'only organisers'; end if;
  if char_length(trim(coalesce(p_text, ''))) < 2 or char_length(p_text) > 500 then raise exception 'announcement must be 2–500 characters'; end if;
  for m in select user_id from public.members where group_id = p_group loop
    perform public._notify(m.user_id, p_group, 'announcement', jsonb_build_object('text', trim(p_text), 'actor', auth.uid()));
    n := n + 1;
  end loop;
  perform public._log(p_group, 'announce', '', left(p_text, 300));
  return n;
end $$;

create or replace function public.org_stats(p_group uuid)
returns jsonb language plpgsql stable security definer set search_path = public as $$
begin
  if not public.is_organiser(p_group) then raise exception 'only organisers'; end if;
  return jsonb_build_object(
    'members', (select count(*) from public.members where group_id = p_group),
    'books_available', (select count(*) from public.books where group_id = p_group and status = 'available' and not hidden),
    'books_gone_year', (select count(*) from public.books b where b.group_id = p_group and b.status = 'gone'
                          and exists (select 1 from public.request_items ri join public.requests r on r.id = ri.request_id
                                      where ri.book_id = b.id and r.status = 'done' and r.updated_at > date_trunc('year', now()))),
    'requests_open', (select count(*) from public.requests where group_id = p_group and status in ('pending', 'accepted', 'scheduled')),
    'reports_open', (select count(*) from public.reports where group_id = p_group and resolved_at is null),
    'hidden_books', (select count(*) from public.books where group_id = p_group and hidden)
  );
end $$;

-- ----------------------------------------------------------------- platform admin (whole service)

create table if not exists public.platform_admins (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
revoke all on public.platform_admins from anon, authenticated;
alter table public.platform_admins enable row level security;

create or replace function public.is_platform_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.platform_admins where user_id = auth.uid());
$$;

create or replace function public.admin_overview()
returns table (group_id uuid, name text, created_at timestamptz, members bigint, books bigint, open_reports bigint, organisers text)
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.is_platform_admin() then raise exception 'only platform admins'; end if;
  return query
    select g.id, g.name, g.created_at,
      (select count(*) from public.members m where m.group_id = g.id),
      (select count(*) from public.books b where b.group_id = g.id),
      (select count(*) from public.reports r where r.group_id = g.id and r.resolved_at is null),
      (select string_agg(m.display_name, ', ') from public.members m where m.group_id = g.id and m.role = 'organiser')
    from public.groups g order by g.created_at desc;
end $$;

create or replace function public.admin_reports()
returns table (id bigint, group_id uuid, group_name text, category text, target_type text, reason text, created_at timestamptz)
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.is_platform_admin() then raise exception 'only platform admins'; end if;
  return query select r.id, r.group_id, g.name, r.category, r.target_type, r.reason, r.created_at
    from public.reports r join public.groups g on g.id = r.group_id where r.resolved_at is null order by r.created_at desc limit 200;
end $$;

create or replace function public.admin_delete_group(p_group uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_platform_admin() then raise exception 'only platform admins'; end if;
  delete from public.groups where id = p_group;
end $$;

-- ----------------------------------------------------------------- function permissions

revoke all on function public._norm(text), public._notify(uuid, uuid, text, jsonb), public._log(uuid, text, text, text),
  public._trg_requests(), public._trg_messages(), public._trg_reviews(), public._trg_books(), public._trg_wishes(),
  public._trg_reports(), public._trg_members(), public.send_handover_reminders(),
  public.org_set_role(uuid, uuid, text), public.org_remove_member(uuid, uuid, text, boolean), public.org_unban(uuid, uuid),
  public.org_bans(uuid), public.org_hide_book(uuid, boolean, text), public.org_invites(uuid), public.org_revoke_invite(uuid),
  public.org_resolve_report(bigint, text), public.org_report_context(bigint), public.org_announce(uuid, text), public.org_stats(uuid),
  public.is_platform_admin(), public.admin_overview(), public.admin_reports(), public.admin_delete_group(uuid),
  public.join_group(text, text, text, text, text[], text)
  from public, anon, authenticated;

grant execute on function
  public.org_set_role(uuid, uuid, text), public.org_remove_member(uuid, uuid, text, boolean), public.org_unban(uuid, uuid),
  public.org_bans(uuid), public.org_hide_book(uuid, boolean, text), public.org_invites(uuid), public.org_revoke_invite(uuid),
  public.org_resolve_report(bigint, text), public.org_report_context(bigint), public.org_announce(uuid, text), public.org_stats(uuid),
  public.is_platform_admin(), public.admin_overview(), public.admin_reports(), public.admin_delete_group(uuid),
  public.join_group(text, text, text, text, text[], text)
  to authenticated;

do $$ begin
  begin alter publication supabase_realtime add table public.notifications; exception when duplicate_object then null; end;
end $$;

commit;
