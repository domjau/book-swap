-- 009: "Books I got" – a member's own list of books they received in finished exchanges
-- (bought, swapped or given to them).
--
-- Each row is a snapshot of the book taken when the handover is marked done, so the list stays
-- even if the previous owner later deletes the listing or their account. It holds only the book
-- itself (title, author, ISBN, language, topics, age, how it changed hands, price, date) and
-- who received it. Nothing about the other member is copied: no name, id, postal code, photo,
-- request or chat link. Only the member themselves can read their rows; they can delete rows,
-- and everything goes when their account is deleted.
--
-- Numbered 009 because 007/008 are in a separate pull request; it does not depend on them.

create table if not exists public.received_books (
  id          bigint generated always as identity primary key,
  user_id     uuid not null references auth.users(id) on delete cascade,
  isbn        text check (isbn ~ '^[0-9]{13}$'),
  title       text not null check (char_length(title) between 1 and 150),
  author      text not null default '' check (char_length(author) <= 120),
  lang        text not null default 'other' check (lang ~ '^[a-z]{2,5}$'),
  topics      text[] not null default '{}',
  age         text,
  how         text not null check (how in ('bought', 'swapped', 'gift')),
  price_cents integer not null default 0 check (price_cents between 0 and 100000),
  received_at timestamptz not null default now()
);
create index if not exists received_books_user_idx on public.received_books (user_id, received_at desc);

alter table public.received_books enable row level security;
revoke all on public.received_books from anon, authenticated;
grant select, delete on public.received_books to authenticated;
drop policy if exists received_read on public.received_books;
create policy received_read on public.received_books for select to authenticated using (user_id = auth.uid());
drop policy if exists received_delete on public.received_books;
create policy received_delete on public.received_books for delete to authenticated using (user_id = auth.uid());
-- No insert/update policy: rows are written only by the trigger below.

-- The books that change hands in one finished request, and who gets each one.
create or replace function public._received_rows(p_request uuid)
returns table (user_id uuid, isbn text, title text, author text, lang text, topics text[], age text,
               how text, price_cents integer)
language sql stable security definer set search_path = public as $$
  select case when ri.side = 'requested' then r.requester_id else r.owner_id end,
         b.isbn, b.title, b.author, b.lang, b.topics, b.age,
         -- books went both ways in this request -> a swap; otherwise what the listing said
         case when exists (select 1 from public.request_items o where o.request_id = r.id and o.accepted and o.side = 'offered')
              then 'swapped'
              else case b.offer when 'sell' then 'bought' when 'give' then 'gift' else 'swapped' end end,
         case when b.offer = 'sell' and not exists (select 1 from public.request_items o where o.request_id = r.id and o.accepted and o.side = 'offered')
              then b.price_cents else 0 end
    from public.requests r
    join public.request_items ri on ri.request_id = r.id and ri.accepted
    join public.books b on b.id = ri.book_id
   where r.id = p_request;
$$;

create or replace function public._trg_received_books()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.status = 'done' and old.status is distinct from 'done' then
    insert into public.received_books (user_id, isbn, title, author, lang, topics, age, how, price_cents, received_at)
    select x.user_id, x.isbn, x.title, x.author, x.lang, x.topics, x.age, x.how, x.price_cents, new.updated_at
      from public._received_rows(new.id) x;
  end if;
  return new;
end $$;

drop trigger if exists requests_received_books on public.requests;
create trigger requests_received_books after update of status on public.requests
  for each row execute function public._trg_received_books();

revoke all on function public._received_rows(uuid), public._trg_received_books() from public, anon, authenticated;

-- Backfill exchanges finished before this migration (only books whose listing still exists).
insert into public.received_books (user_id, isbn, title, author, lang, topics, age, how, price_cents, received_at)
select x.user_id, x.isbn, x.title, x.author, x.lang, x.topics, x.age, x.how, x.price_cents, r.updated_at
  from public.requests r, lateral public._received_rows(r.id) x
 where r.status = 'done'
   and not exists (select 1 from public.received_books);
