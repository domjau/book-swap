-- seku seku – one open network, moderated by platform admins (no communities, organisers or invite codes).
-- Run after 003_notifications_admin.sql.
--
-- How it works: the whole service is a single "network" group that everyone joins automatically at
-- sign-up. All row-level security from earlier migrations keeps working; organiser rights now belong
-- to platform admins. Existing test data from other groups is moved into the network.

begin;

-- ---------------------------------------------------------------- the network
create or replace function public.network_id()
returns uuid language sql immutable set search_path = public as $$ select '00000000-0000-0000-0000-000000000001'::uuid $$;

insert into public.groups (id, name) values (public.network_id(), 'seku seku') on conflict (id) do nothing;

-- ---------------------------------------------------------------- move existing data (no-op on a fresh database)
insert into public.members (group_id, user_id, role, display_name, country, postal_code, interested_langs, terms_version, terms_accepted_at, joined_at)
  select distinct on (user_id) public.network_id(), user_id, 'member', display_name, country, postal_code, interested_langs, terms_version, terms_accepted_at, joined_at
    from public.members where group_id <> public.network_id() order by user_id, joined_at
on conflict (group_id, user_id) do nothing;

update public.books         set group_id = public.network_id() where group_id <> public.network_id();
update public.wishes        set group_id = public.network_id() where group_id <> public.network_id();
update public.requests      set group_id = public.network_id() where group_id <> public.network_id();
update public.reviews       set group_id = public.network_id() where group_id <> public.network_id();
update public.reports       set group_id = public.network_id() where group_id <> public.network_id();
update public.notifications set group_id = public.network_id() where group_id <> public.network_id();
update public.moderation_log set group_id = public.network_id() where group_id <> public.network_id();
insert into public.group_bans (group_id, user_id, reason, created_by, created_at)
  select public.network_id(), user_id, reason, created_by, created_at from public.group_bans where group_id <> public.network_id()
on conflict (group_id, user_id) do nothing;
delete from public.members where group_id <> public.network_id();
delete from public.group_invites;
delete from public.groups where id <> public.network_id();
update public.members set role = 'member' where role <> 'member';

-- ---------------------------------------------------------------- organiser rights now belong to platform admins
create or replace function public.is_organiser(g uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select public.is_platform_admin();
$$;

-- ---------------------------------------------------------------- open sign-up
create or replace function public.join_network(p_display_name text, p_country text, p_postal text, p_langs text[], p_terms text)
returns uuid language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  if exists (select 1 from public.group_bans where group_id = public.network_id() and user_id = auth.uid()) then
    raise exception 'this account has been blocked';
  end if;
  insert into public.members (group_id, user_id, display_name, country, postal_code, interested_langs, terms_version)
    values (public.network_id(), auth.uid(), trim(p_display_name), upper(p_country), upper(trim(p_postal)), coalesce(p_langs, '{}'), p_terms)
  on conflict (group_id, user_id) do update
    set display_name = excluded.display_name, country = excluded.country, postal_code = excluded.postal_code,
        interested_langs = excluded.interested_langs, terms_version = excluded.terms_version, terms_accepted_at = now();
  return public.network_id();
end $$;

-- ---------------------------------------------------------------- notify admins (instead of organisers)
create or replace function public._trg_reports()
returns trigger language plpgsql security definer set search_path = public as $$
declare a record;
begin
  for a in select user_id from public.platform_admins where user_id <> new.reporter_id loop
    perform public._notify(a.user_id, new.group_id, 'report_new', jsonb_build_object('report_id', new.id, 'category', new.category));
  end loop;
  return new;
end $$;

create or replace function public._trg_members()
returns trigger language plpgsql security definer set search_path = public as $$
declare a record;
begin
  for a in select user_id from public.platform_admins where user_id <> new.user_id loop
    perform public._notify(a.user_id, new.group_id, 'member_joined', jsonb_build_object('actor', new.user_id, 'name', new.display_name));
  end loop;
  return new;
end $$;

-- ---------------------------------------------------------------- managing admins
create or replace function public.admin_list()
returns table (user_id uuid, email text, display_name text, created_at timestamptz)
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.is_platform_admin() then raise exception 'only platform admins'; end if;
  return query select pa.user_id, u.email::text, m.display_name, pa.created_at
    from public.platform_admins pa join auth.users u on u.id = pa.user_id
    left join public.members m on m.user_id = pa.user_id and m.group_id = public.network_id()
   order by pa.created_at;
end $$;

-- The new admin must already have an account (signed in once).
create or replace function public.admin_add(p_email text)
returns void language plpgsql security definer set search_path = public as $$
declare u uuid;
begin
  if not public.is_platform_admin() then raise exception 'only platform admins'; end if;
  select id into u from auth.users where lower(email) = lower(trim(p_email)) limit 1;
  if u is null then raise exception 'no account with that email – ask them to sign up first'; end if;
  insert into public.platform_admins (user_id) values (u) on conflict (user_id) do nothing;
  perform public._log(public.network_id(), 'add_admin', u::text, '');
end $$;

create or replace function public.admin_remove(p_user uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_platform_admin() then raise exception 'only platform admins'; end if;
  if (select count(*) from public.platform_admins where user_id <> p_user) = 0 then raise exception 'there must be at least one admin'; end if;
  delete from public.platform_admins where user_id = p_user;
  perform public._log(public.network_id(), 'remove_admin', p_user::text, '');
end $$;

-- ---------------------------------------------------------------- permissions
-- Communities, invite codes and organiser roles are switched off.
revoke all on function public.create_group(text, text, text, text, text[], text), public.join_group(text, text, text, text, text[], text),
  public.create_invite(uuid, integer), public.org_invites(uuid), public.org_revoke_invite(uuid), public.org_set_role(uuid, uuid, text),
  public.admin_delete_group(uuid)
  from public, anon, authenticated;

revoke all on function public.network_id(), public.join_network(text, text, text, text[], text), public.admin_list(),
  public.admin_add(text), public.admin_remove(uuid) from public, anon, authenticated;
grant execute on function public.network_id(), public.join_network(text, text, text, text[], text), public.admin_list(),
  public.admin_add(text), public.admin_remove(uuid) to authenticated;

-- ---------------------------------------------------------------- Supabase security advisor fixes
alter function public._hash_code(text) set search_path = public, extensions;
alter function public.looks_like_copy_sharing(text) set search_path = public;
-- Supabase's own "automatic RLS" helper (exists only on projects created with that option).
do $$ begin
  if to_regprocedure('public.rls_auto_enable()') is not null then
    revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
  end if;
end $$;

commit;
