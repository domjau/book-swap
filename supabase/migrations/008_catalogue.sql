-- seku seku – shared book catalogue: details members typed in, found again by the next scan.
-- Run after 007_privacy_safety.sql, then run the Supabase security advisor.
--
-- When a member lists a book with an ISBN, its title, author, description, language, topics and age are
-- saved per ISBN (no photos, no member id). The next person who scans the same ISBN gets them instantly,
-- even after the original listing is gone. Members can read it; only the trigger writes it.

begin;

create table if not exists public.catalogue (
  isbn13      text primary key check (isbn13 ~ '^97[89][0-9]{10}$'),
  title       text not null check (char_length(title) between 1 and 150),
  author      text not null default '' check (char_length(author) <= 120),
  description text not null default '' check (char_length(description) <= 3000),
  lang        text not null default 'other' check (lang ~ '^[a-z]{2,5}$'),
  topics      text[] not null default '{}' check (cardinality(topics) <= 9),
  age         text check (age in ('0–3', '3–6', '7–9', '10+')),
  listings    integer not null default 1,
  updated_at  timestamptz not null default now()
);
alter table public.catalogue enable row level security;
revoke all on public.catalogue from anon, authenticated;
grant select on public.catalogue to authenticated;
drop policy if exists catalogue_read on public.catalogue;
create policy catalogue_read on public.catalogue for select to authenticated using (public.is_member(public.network_id()));

-- Newest typed-in details win, but an empty field never wipes a filled one.
create or replace function public._trg_books_catalogue()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.isbn is null or new.isbn !~ '^97[89][0-9]{10}$' or new.hidden then return new; end if;
  insert into public.catalogue as c (isbn13, title, author, description, lang, topics, age)
  values (new.isbn, new.title, coalesce(new.author, ''), coalesce(new.description, ''), new.lang, coalesce(new.topics, '{}'), new.age)
  on conflict (isbn13) do update set
    title       = excluded.title,
    author      = case when excluded.author <> '' then excluded.author else c.author end,
    description = case when excluded.description <> '' then excluded.description else c.description end,
    lang        = case when excluded.lang <> 'other' then excluded.lang else c.lang end,
    topics      = case when cardinality(excluded.topics) > 0 then excluded.topics else c.topics end,
    age         = coalesce(excluded.age, c.age),
    listings    = c.listings + case when tg_op = 'INSERT' then 1 else 0 end,
    updated_at  = now();
  return new;
end $$;
drop trigger if exists books_catalogue on public.books;
create trigger books_catalogue after insert or update of isbn, title, author, description, lang, topics, age on public.books
  for each row execute function public._trg_books_catalogue();
revoke all on function public._trg_books_catalogue() from public, anon, authenticated;

-- Books already listed
insert into public.catalogue (isbn13, title, author, description, lang, topics, age, listings)
select distinct on (isbn) isbn, title, author, description, lang, topics, age, count(*) over (partition by isbn)
  from public.books where isbn ~ '^97[89][0-9]{10}$' and not hidden order by isbn, created_at desc
on conflict (isbn13) do nothing;

commit;
