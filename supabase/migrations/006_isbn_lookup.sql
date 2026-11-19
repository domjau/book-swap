-- seku seku – cache and fair-use limits for the `isbn-lookup` Edge Function
-- (Lithuanian national library open data via data.gov.lt). Run after 005_open_network.sql.
--
-- Only the Edge Function (service_role) touches these tables. Members never read or write them
-- directly: RLS is on with no policies, and anon/authenticated have no grants.

begin;

-- ---------------------------------------------------------------- cache (hits and misses)
create table if not exists public.isbn_lookup_cache (
  isbn13     text primary key check (isbn13 ~ '^97[89][0-9]{10}$'),
  source     text not null default 'lnb',
  found      boolean not null,
  data       jsonb,                       -- normalised book details, null for a miss
  fetched_at timestamptz not null default now()
);
alter table public.isbn_lookup_cache enable row level security;
revoke all on public.isbn_lookup_cache from anon, authenticated;
grant select, insert, update, delete on public.isbn_lookup_cache to service_role;

-- ---------------------------------------------------------------- fair-use log (one row per call to the library API)
create table if not exists public.isbn_lookup_log (
  id      bigint generated always as identity primary key,
  user_id uuid not null,
  at      timestamptz not null default now()
);
create index if not exists isbn_lookup_log_user_at on public.isbn_lookup_log (user_id, at);
create index if not exists isbn_lookup_log_at on public.isbn_lookup_log (at);
alter table public.isbn_lookup_log enable row level security;
revoke all on public.isbn_lookup_log from anon, authenticated;
grant select, insert, delete on public.isbn_lookup_log to service_role;

-- Takes one unit of quota for a call to the library API, or returns false when the person
-- (per hour) or the whole app (per hour) has used up its share. Old rows are pruned as it goes.
create or replace function public.isbn_lookup_take_quota(p_user uuid, p_user_per_hour int default 30, p_all_per_hour int default 300)
returns boolean language plpgsql security definer set search_path = public as $$
begin
  if p_user is null then return false; end if;
  -- one caller at a time, so two parallel calls can't both squeeze under the limit
  perform pg_advisory_xact_lock(hashtext('isbn_lookup_take_quota'));
  delete from public.isbn_lookup_log where at < now() - interval '1 day';
  if (select count(*) from public.isbn_lookup_log where user_id = p_user and at > now() - interval '1 hour') >= p_user_per_hour then
    return false;
  end if;
  if (select count(*) from public.isbn_lookup_log where at > now() - interval '1 hour') >= p_all_per_hour then
    return false;
  end if;
  insert into public.isbn_lookup_log (user_id) values (p_user);
  return true;
end $$;
revoke all on function public.isbn_lookup_take_quota(uuid, int, int) from public, anon, authenticated;
grant execute on function public.isbn_lookup_take_quota(uuid, int, int) to service_role;

commit;
