-- Book Swap – member reviews ("little books" 1–5) and profile pictures.
-- Run after 001_init.sql, in the Supabase SQL editor.

begin;

-- ---------------------------------------------------------------- profile picture
alter table public.members add column if not exists avatar_path text;
alter table public.members drop constraint if exists members_avatar_path_own_folder;
alter table public.members add constraint members_avatar_path_own_folder
  check (avatar_path is null or (char_length(avatar_path) <= 200 and avatar_path like (group_id::text || '/' || user_id::text || '/%')));
grant update (avatar_path) on public.members to authenticated;

-- ---------------------------------------------------------------- reviews
create table if not exists public.reviews (
  id          bigint generated always as identity primary key,
  request_id  uuid not null references public.requests(id) on delete cascade,
  group_id    uuid not null references public.groups(id) on delete cascade,
  reviewer_id uuid not null references auth.users(id) on delete cascade,
  reviewee_id uuid not null references auth.users(id) on delete cascade,
  rating      smallint not null check (rating between 1 and 5),
  comment     text not null default '' check (char_length(comment) <= 300),
  created_at  timestamptz not null default now(),
  unique (request_id, reviewer_id),
  check (reviewer_id <> reviewee_id)
);
create index if not exists reviews_reviewee_idx on public.reviews (reviewee_id);

revoke all on public.reviews from anon, authenticated;
alter table public.reviews enable row level security;
grant select on public.reviews to authenticated;
drop policy if exists reviews_read on public.reviews;
create policy reviews_read on public.reviews for select to authenticated using (public.is_member(group_id));
-- no insert/update policies: reviews are written only by submit_review()

-- Review the other person after a finished exchange (one review per person per exchange; can be edited).
create or replace function public.submit_review(p_request uuid, p_rating integer, p_comment text)
returns void language plpgsql security definer set search_path = public as $$
declare req public.requests; other uuid;
begin
  select * into req from public.requests where id = p_request;
  if req.id is null or auth.uid() not in (req.requester_id, req.owner_id) then raise exception 'not allowed'; end if;
  if req.status <> 'done' then raise exception 'you can review after the handover'; end if;
  if p_rating < 1 or p_rating > 5 then raise exception 'rating must be 1–5'; end if;
  if public.looks_like_copy_sharing(coalesce(p_comment, '')) then raise exception 'sharing copies is not allowed'; end if;
  other := case when auth.uid() = req.owner_id then req.requester_id else req.owner_id end;
  insert into public.reviews (request_id, group_id, reviewer_id, reviewee_id, rating, comment)
  values (p_request, req.group_id, auth.uid(), other, p_rating, left(trim(coalesce(p_comment, '')), 300))
  on conflict (request_id, reviewer_id) do update
    set rating = excluded.rating, comment = excluded.comment, created_at = now();
end $$;

revoke all on function public.submit_review(uuid, integer, text) from public, anon, authenticated;
grant execute on function public.submit_review(uuid, integer, text) to authenticated;

do $$ begin
  begin alter publication supabase_realtime add table public.reviews; exception when duplicate_object then null; end;
end $$;

commit;
