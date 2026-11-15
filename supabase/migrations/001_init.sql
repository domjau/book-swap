-- Book Swap – initial schema
-- Run once in the Supabase SQL editor (or via the Supabase CLI / connector).
-- Principles:
--   * Row-level security (RLS) on every table; nothing is visible to logged-out users (anon).
--   * Members only see their own group's books, wishes and members.
--   * Requests and messages are only visible to the two people involved.
--   * Every status change (accept, handover, done) goes through a SECURITY DEFINER function
--     that checks who is calling – clients cannot set statuses directly.

begin;

-- ---------------------------------------------------------------- tables

create table if not exists public.groups (
  id             uuid primary key default gen_random_uuid(),
  name           text not null check (char_length(name) between 2 and 80),
  handover_place text check (char_length(handover_place) <= 80),
  created_by     uuid references auth.users(id) on delete set null,
  created_at     timestamptz not null default now()
);

create table if not exists public.group_invites (
  id         uuid primary key default gen_random_uuid(),
  group_id   uuid not null references public.groups(id) on delete cascade,
  code_hash  text not null unique,              -- sha256 of the invite code, never the code itself
  expires_at timestamptz,
  revoked    boolean not null default false,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.members (
  group_id          uuid not null references public.groups(id) on delete cascade,
  user_id           uuid not null references auth.users(id) on delete cascade,
  role              text not null default 'member' check (role in ('member', 'organiser')),
  display_name      text not null check (char_length(display_name) between 1 and 40),
  country           text not null check (country ~ '^[A-Z]{2}$'),
  postal_code       text not null check (postal_code ~ '^[A-Z0-9][A-Z0-9 -]{1,9}$'),
  interested_langs  text[] not null default '{}' check (cardinality(interested_langs) <= 20),
  terms_version     text not null,
  terms_accepted_at timestamptz not null default now(),
  joined_at         timestamptz not null default now(),
  primary key (group_id, user_id)
);

create table if not exists public.books (
  id           uuid primary key default gen_random_uuid(),
  group_id     uuid not null,
  owner_id     uuid not null,
  isbn         text check (isbn ~ '^[0-9]{13}$'),
  title        text not null check (char_length(title) between 1 and 150),
  author       text not null default '' check (char_length(author) <= 120),
  description  text not null default '' check (char_length(description) <= 3000),
  notes        text not null default '' check (char_length(notes) <= 300),
  lang         text not null default 'other' check (lang ~ '^[a-z]{2,5}$'),
  topics       text[] not null default '{}' check (cardinality(topics) <= 9),
  age          text check (age in ('0–3', '3–6', '7–9', '10+')),
  condition    text not null default 'good' check (condition in ('new', 'good', 'worn')),
  offer        text not null check (offer in ('swap', 'sell', 'give')),
  price_cents  integer not null default 0 check (price_cents between 0 and 100000),
  status       text not null default 'available' check (status in ('available', 'reserved', 'gone')),
  photo_paths  text[] not null check (cardinality(photo_paths) between 1 and 4),
  created_at   timestamptz not null default now(),
  foreign key (group_id, owner_id) references public.members(group_id, user_id) on delete cascade
);
create index if not exists books_group_idx on public.books (group_id, status, created_at desc);
create index if not exists books_owner_idx on public.books (owner_id);
create index if not exists books_isbn_idx on public.books (isbn);

create table if not exists public.wishes (
  id         uuid primary key default gen_random_uuid(),
  group_id   uuid not null,
  owner_id   uuid not null,
  isbn       text check (isbn ~ '^[0-9]{13}$'),
  title      text not null check (char_length(title) between 1 and 150),
  author     text not null default '' check (char_length(author) <= 120),
  lang       text not null default 'other' check (lang ~ '^[a-z]{2,5}$'),
  created_at timestamptz not null default now(),
  foreign key (group_id, owner_id) references public.members(group_id, user_id) on delete cascade
);
create index if not exists wishes_group_idx on public.wishes (group_id);

create table if not exists public.requests (
  id                uuid primary key default gen_random_uuid(),
  group_id          uuid not null references public.groups(id) on delete cascade,
  requester_id      uuid not null references auth.users(id) on delete cascade,
  owner_id          uuid not null references auth.users(id) on delete cascade,
  status            text not null default 'pending'
                    check (status in ('pending', 'accepted', 'scheduled', 'done', 'declined')),
  handover_on       date,
  handover_place    text check (char_length(handover_place) <= 60),
  requester_read_at timestamptz not null default now(),
  owner_read_at     timestamptz not null default 'epoch',
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  check (requester_id <> owner_id)
);
create index if not exists requests_requester_idx on public.requests (requester_id);
create index if not exists requests_owner_idx on public.requests (owner_id);

create table if not exists public.request_items (
  request_id uuid not null references public.requests(id) on delete cascade,
  book_id    uuid not null references public.books(id) on delete cascade,
  side       text not null check (side in ('requested', 'offered')),
  accepted   boolean not null default false,
  primary key (request_id, book_id)
);

create table if not exists public.messages (
  id         bigint generated always as identity primary key,
  request_id uuid not null references public.requests(id) on delete cascade,
  sender_id  uuid references auth.users(id) on delete set null,   -- null for system messages
  kind       text not null default 'user' check (kind in ('user', 'system')),
  body       text not null default '' check (char_length(body) <= 1000),
  sys_key    text check (sys_key ~ '^[a-zA-Z]{1,40}$'),
  sys_vars   jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  check ((kind = 'user' and char_length(body) >= 1) or (kind = 'system' and sys_key is not null))
);
create index if not exists messages_request_idx on public.messages (request_id, created_at);

create table if not exists public.reports (
  id          bigint generated always as identity primary key,
  group_id    uuid not null references public.groups(id) on delete cascade,
  reporter_id uuid not null references auth.users(id) on delete cascade,
  target_type text not null check (target_type in ('book', 'message', 'member', 'request')),
  target_id   text not null check (char_length(target_id) <= 64),
  reason      text not null default '' check (char_length(reason) <= 500),
  created_at  timestamptz not null default now(),
  resolved_at timestamptz
);

-- ---------------------------------------------------------------- helper functions

create or replace function public.is_member(g uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.members where group_id = g and user_id = auth.uid());
$$;

create or replace function public.is_organiser(g uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.members where group_id = g and user_id = auth.uid() and role = 'organiser');
$$;

create or replace function public.is_party(r uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.requests where id = r and auth.uid() in (requester_id, owner_id));
$$;

-- Blocks e-book / document files and file-sharing links in chat (same list as the app).
create or replace function public.looks_like_copy_sharing(t text)
returns boolean language sql immutable as $$
  select t ~* '\.(pdf|epub|mobi|azw3?|djvu|cbz|cbr|fb2)(\M|$)|drive\.google|docs\.google|dropbox|wetransfer|mega\.nz|mediafire|z-?lib|libgen|annas-archive|scribd|t\.me/';
$$;

-- ---------------------------------------------------------------- privileges + RLS
-- Start from nothing, then grant exactly what the app needs.

revoke all on public.groups, public.group_invites, public.members, public.books, public.wishes,
              public.requests, public.request_items, public.messages, public.reports
  from anon, authenticated;

alter table public.groups        enable row level security;
alter table public.group_invites enable row level security;
alter table public.members       enable row level security;
alter table public.books         enable row level security;
alter table public.wishes        enable row level security;
alter table public.requests      enable row level security;
alter table public.request_items enable row level security;
alter table public.messages      enable row level security;
alter table public.reports       enable row level security;

-- groups: members can read their group; organisers can rename it / set the handover place
grant select on public.groups to authenticated;
grant update (name, handover_place) on public.groups to authenticated;
create policy groups_read on public.groups for select to authenticated using (public.is_member(id));
create policy groups_update on public.groups for update to authenticated
  using (public.is_organiser(id)) with check (public.is_organiser(id));

-- group_invites: no direct access at all (create_invite / join_group functions only)

-- members: see your group; edit your own profile fields; leave the group
grant select on public.members to authenticated;
grant update (display_name, country, postal_code, interested_langs) on public.members to authenticated;
grant delete on public.members to authenticated;
create policy members_read on public.members for select to authenticated using (public.is_member(group_id));
create policy members_update_self on public.members for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy members_leave on public.members for delete to authenticated using (user_id = auth.uid());

-- books: read your group's books; add/edit/delete only your own
grant select, delete on public.books to authenticated;
grant insert (group_id, owner_id, isbn, title, author, description, notes, lang, topics, age, condition, offer, price_cents, photo_paths)
  on public.books to authenticated;
grant update (title, author, description, notes, lang, topics, age, condition, offer, price_cents, photo_paths)
  on public.books to authenticated;
create policy books_read on public.books for select to authenticated using (public.is_member(group_id));
create policy books_insert on public.books for insert to authenticated
  with check (owner_id = auth.uid() and public.is_member(group_id));
create policy books_update on public.books for update to authenticated
  using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy books_delete on public.books for delete to authenticated
  using (owner_id = auth.uid() and status <> 'reserved');

-- wishes: read your group's wishes; add/delete only your own
grant select, delete on public.wishes to authenticated;
grant insert (group_id, owner_id, isbn, title, author, lang) on public.wishes to authenticated;
create policy wishes_read on public.wishes for select to authenticated using (public.is_member(group_id));
create policy wishes_insert on public.wishes for insert to authenticated
  with check (owner_id = auth.uid() and public.is_member(group_id));
create policy wishes_delete on public.wishes for delete to authenticated using (owner_id = auth.uid());

-- requests / items: only the two people involved can read; changes via functions only
grant select on public.requests, public.request_items to authenticated;
create policy requests_read on public.requests for select to authenticated
  using (auth.uid() in (requester_id, owner_id));
create policy items_read on public.request_items for select to authenticated using (public.is_party(request_id));

-- messages: only the two people involved; users may only write plain user messages as themselves
grant select on public.messages to authenticated;
grant insert (request_id, sender_id, kind, body) on public.messages to authenticated;
create policy messages_read on public.messages for select to authenticated using (public.is_party(request_id));
create policy messages_insert on public.messages for insert to authenticated
  with check (
    kind = 'user' and sender_id = auth.uid() and public.is_party(request_id)
    and not public.looks_like_copy_sharing(body)
    and exists (select 1 from public.requests r where r.id = request_id and r.status <> 'declined')
  );

-- reports: anyone in the group can report; organisers can read and resolve their group's reports
grant insert (group_id, reporter_id, target_type, target_id, reason) on public.reports to authenticated;
grant select on public.reports to authenticated;
grant update (resolved_at) on public.reports to authenticated;
create policy reports_insert on public.reports for insert to authenticated
  with check (reporter_id = auth.uid() and public.is_member(group_id));
create policy reports_read on public.reports for select to authenticated using (public.is_organiser(group_id));
create policy reports_resolve on public.reports for update to authenticated
  using (public.is_organiser(group_id)) with check (public.is_organiser(group_id));

-- ---------------------------------------------------------------- functions the app calls (RPC)

-- Random 8-character invite code without look-alike characters (no 0/O, 1/I).
create or replace function public._new_code()
returns text language plpgsql volatile set search_path = public as $$
declare
  alphabet constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  b bytea := uuid_send(gen_random_uuid());
  out text := '';
begin
  for i in 0..7 loop
    out := out || substr(alphabet, 1 + (get_byte(b, i) % 32), 1);
  end loop;
  return out;
end $$;

create or replace function public._hash_code(code text)
returns text language sql immutable as $$
  select encode(sha256(convert_to(upper(regexp_replace(code, '[^A-Za-z0-9]', '', 'g')), 'UTF8')), 'hex');
$$;

-- Create a new group; the caller becomes its organiser. Returns the group id and a first invite code.
create or replace function public.create_group(
  p_name text, p_display_name text, p_country text, p_postal text, p_langs text[], p_terms text)
returns table (group_id uuid, invite_code text)
language plpgsql security definer set search_path = public as $$
declare g uuid; code text;
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  insert into public.groups (name, created_by) values (trim(p_name), auth.uid()) returning id into g;
  insert into public.members (group_id, user_id, role, display_name, country, postal_code, interested_langs, terms_version)
    values (g, auth.uid(), 'organiser', trim(p_display_name), upper(p_country), upper(trim(p_postal)), coalesce(p_langs, '{}'), p_terms);
  code := public._new_code();
  insert into public.group_invites (group_id, code_hash, expires_at, created_by)
    values (g, public._hash_code(code), now() + interval '90 days', auth.uid());
  return query select g, code;
end $$;

-- Organisers can create more invite codes (valid for p_days days).
create or replace function public.create_invite(p_group uuid, p_days integer default 30)
returns text language plpgsql security definer set search_path = public as $$
declare code text;
begin
  if not public.is_organiser(p_group) then raise exception 'only organisers can invite'; end if;
  code := public._new_code();
  insert into public.group_invites (group_id, code_hash, expires_at, created_by)
    values (p_group, public._hash_code(code), now() + make_interval(days => greatest(1, least(p_days, 365))), auth.uid());
  return code;
end $$;

-- Join a group with an invite code.
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
  insert into public.members (group_id, user_id, display_name, country, postal_code, interested_langs, terms_version)
    values (g, auth.uid(), trim(p_display_name), upper(p_country), upper(trim(p_postal)), coalesce(p_langs, '{}'), p_terms)
  on conflict (group_id, user_id) do update
    set display_name = excluded.display_name, country = excluded.country, postal_code = excluded.postal_code,
        interested_langs = excluded.interested_langs, terms_version = excluded.terms_version, terms_accepted_at = now();
  return g;
end $$;

-- Record acceptance of a new terms version.
create or replace function public.accept_terms(p_group uuid, p_terms text)
returns void language sql security definer set search_path = public as $$
  update public.members set terms_version = p_terms, terms_accepted_at = now()
   where group_id = p_group and user_id = auth.uid();
$$;

create or replace function public._sys(p_request uuid, p_key text, p_vars jsonb default '{}'::jsonb)
returns void language sql security definer set search_path = public as $$
  insert into public.messages (request_id, kind, sys_key, sys_vars) values (p_request, 'system', p_key, coalesce(p_vars, '{}'::jsonb));
  update public.requests set updated_at = now() where id = p_request;
$$;

-- Send a (bundled) request: books from one owner, optionally offering some of your own in return.
create or replace function public.create_request(
  p_owner uuid, p_book_ids uuid[], p_offered_ids uuid[], p_message text)
returns uuid language plpgsql security definer set search_path = public as $$
declare g uuid; r uuid; n int;
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  if p_owner = auth.uid() then raise exception 'cannot request your own books'; end if;
  if coalesce(cardinality(p_book_ids), 0) = 0 or cardinality(p_book_ids) > 20 then raise exception 'pick 1–20 books'; end if;
  if coalesce(cardinality(p_offered_ids), 0) > 20 then raise exception 'too many offered books'; end if;
  -- all requested books: same owner, same group as the caller, available
  select min(b.group_id::text)::uuid, count(*) into g, n from public.books b
   where b.id = any(p_book_ids) and b.owner_id = p_owner and b.status = 'available' and public.is_member(b.group_id);
  if n <> cardinality(p_book_ids) then raise exception 'some books are not available'; end if;
  if (select count(distinct b.group_id) from public.books b where b.id = any(p_book_ids)) <> 1 then raise exception 'books from different groups'; end if;
  -- offered books: the caller's own, available, same group
  if coalesce(cardinality(p_offered_ids), 0) > 0 then
    select count(*) into n from public.books b
     where b.id = any(p_offered_ids) and b.owner_id = auth.uid() and b.status = 'available' and b.group_id = g;
    if n <> cardinality(p_offered_ids) then raise exception 'some offered books are not yours or not available'; end if;
  end if;
  if public.looks_like_copy_sharing(coalesce(p_message, '')) then raise exception 'sharing copies is not allowed'; end if;

  insert into public.requests (group_id, requester_id, owner_id) values (g, auth.uid(), p_owner) returning id into r;
  insert into public.request_items (request_id, book_id, side) select r, unnest(p_book_ids), 'requested';
  if coalesce(cardinality(p_offered_ids), 0) > 0 then
    insert into public.request_items (request_id, book_id, side) select r, unnest(p_offered_ids), 'offered';
  end if;
  if length(trim(coalesce(p_message, ''))) > 0 then
    insert into public.messages (request_id, sender_id, kind, body) values (r, auth.uid(), 'user', left(trim(p_message), 1000));
  else
    perform public._sys(r, 'sendRequest');
  end if;
  return r;
end $$;

-- Owner accepts some or all requested books (an empty list declines).
create or replace function public.respond_request(p_request uuid, p_accept_ids uuid[])
returns text language plpgsql security definer set search_path = public as $$
declare req public.requests; n int;
begin
  select * into req from public.requests where id = p_request for update;
  if req.id is null or req.owner_id <> auth.uid() then raise exception 'not allowed'; end if;
  if req.status <> 'pending' then raise exception 'request already answered'; end if;

  update public.request_items ri set accepted = true
   from public.books b
   where ri.request_id = p_request and ri.side = 'requested' and ri.book_id = any(coalesce(p_accept_ids, '{}'))
     and b.id = ri.book_id and b.status = 'available';
  get diagnostics n = row_count;

  if n = 0 then
    update public.requests set status = 'declined', updated_at = now() where id = p_request;
    perform public._sys(p_request, 'sysDeclined', jsonb_build_object('name', auth.uid()));
    return 'declined';
  end if;

  -- reserve the accepted books and any books offered in return
  update public.books set status = 'reserved'
   where id in (select book_id from public.request_items where request_id = p_request and (accepted or side = 'offered'))
     and status = 'available';
  update public.request_items set accepted = true where request_id = p_request and side = 'offered';
  update public.requests set status = 'accepted', updated_at = now() where id = p_request;
  perform public._sys(p_request, 'sysAccepted', jsonb_build_object('name', auth.uid()));
  return 'accepted';
end $$;

create or replace function public.decline_request(p_request uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  perform public.respond_request(p_request, '{}');
end $$;

-- Either side sets the handover date and place.
create or replace function public.schedule_handover(p_request uuid, p_on date, p_place text)
returns void language plpgsql security definer set search_path = public as $$
declare req public.requests;
begin
  select * into req from public.requests where id = p_request for update;
  if req.id is null or auth.uid() not in (req.requester_id, req.owner_id) then raise exception 'not allowed'; end if;
  if req.status not in ('accepted', 'scheduled') then raise exception 'request is not accepted'; end if;
  if p_on < current_date - 1 or p_on > current_date + 180 then raise exception 'date out of range'; end if;
  update public.requests set status = 'scheduled', handover_on = p_on, handover_place = left(trim(p_place), 60), updated_at = now()
   where id = p_request;
  perform public._sys(p_request, 'sysHandover', jsonb_build_object('when', p_on, 'where', left(trim(p_place), 60)));
end $$;

-- Either side marks the handover as done; the books leave their owners' shelves.
create or replace function public.complete_request(p_request uuid)
returns void language plpgsql security definer set search_path = public as $$
declare req public.requests;
begin
  select * into req from public.requests where id = p_request for update;
  if req.id is null or auth.uid() not in (req.requester_id, req.owner_id) then raise exception 'not allowed'; end if;
  if req.status not in ('accepted', 'scheduled') then raise exception 'request is not accepted'; end if;
  update public.books set status = 'gone'
   where id in (select book_id from public.request_items where request_id = p_request and accepted);
  update public.requests set status = 'done', updated_at = now() where id = p_request;
  perform public._sys(p_request, 'sysDone');
end $$;

-- Mark a conversation as read by the caller.
create or replace function public.mark_read(p_request uuid)
returns void language sql security definer set search_path = public as $$
  update public.requests set
    requester_read_at = case when requester_id = auth.uid() then now() else requester_read_at end,
    owner_read_at     = case when owner_id = auth.uid() then now() else owner_read_at end
  where id = p_request and auth.uid() in (requester_id, owner_id);
$$;

-- Only signed-in users may call these; internal helpers are not callable at all.
revoke all on function
  public.is_member(uuid), public.is_organiser(uuid), public.is_party(uuid), public.looks_like_copy_sharing(text),
  public._new_code(), public._hash_code(text), public._sys(uuid, text, jsonb),
  public.create_group(text, text, text, text, text[], text), public.create_invite(uuid, integer),
  public.join_group(text, text, text, text, text[], text), public.accept_terms(uuid, text),
  public.create_request(uuid, uuid[], uuid[], text), public.respond_request(uuid, uuid[]),
  public.decline_request(uuid), public.schedule_handover(uuid, date, text),
  public.complete_request(uuid), public.mark_read(uuid)
  from public, anon, authenticated;

grant execute on function
  public.create_group(text, text, text, text, text[], text), public.create_invite(uuid, integer),
  public.join_group(text, text, text, text, text[], text), public.accept_terms(uuid, text),
  public.create_request(uuid, uuid[], uuid[], text), public.respond_request(uuid, uuid[]),
  public.decline_request(uuid), public.schedule_handover(uuid, date, text),
  public.complete_request(uuid), public.mark_read(uuid)
  to authenticated;
-- RLS policies call these helpers as the querying user, so they must stay executable:
grant execute on function public.is_member(uuid), public.is_organiser(uuid), public.is_party(uuid),
  public.looks_like_copy_sharing(text) to authenticated;

-- ---------------------------------------------------------------- photo storage
-- Private bucket; files live at {group_id}/{user_id}/{random}.jpg, max 600 KB, JPEG only.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('book-photos', 'book-photos', false, 614400, array['image/jpeg'])
on conflict (id) do update set public = false, file_size_limit = 614400, allowed_mime_types = array['image/jpeg'];

create policy photos_read on storage.objects for select to authenticated
  using (bucket_id = 'book-photos' and exists (
    select 1 from public.members m where m.user_id = auth.uid() and m.group_id::text = (storage.foldername(name))[1]));

create policy photos_upload on storage.objects for insert to authenticated
  with check (bucket_id = 'book-photos'
    and (storage.foldername(name))[2] = auth.uid()::text
    and exists (select 1 from public.members m where m.user_id = auth.uid() and m.group_id::text = (storage.foldername(name))[1]));

create policy photos_delete on storage.objects for delete to authenticated
  using (bucket_id = 'book-photos' and (storage.foldername(name))[2] = auth.uid()::text);

-- ---------------------------------------------------------------- realtime (chat)
-- Realtime respects RLS, so people only receive changes to their own requests.
do $$ begin
  begin alter publication supabase_realtime add table public.messages; exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table public.requests; exception when duplicate_object then null; end;
end $$;

commit;
