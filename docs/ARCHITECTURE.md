# Architecture

## 1. Prototype (this repository)

```
Browser (phone)
 ├─ index.html        page shell + Content-Security-Policy
 ├─ app.js            screens, routing (#/…), state, actions
 ├─ i18n.js           UI strings: lt / es / en
 ├─ data.js           topics, sample members and books
 ├─ vendor/zxing-reader.js + zxing_reader.wasm   barcode decoder (WebAssembly)
 └─ localStorage["bookswap-v1"]  all data, this device only
        │
        └── fetch (read-only, anonymous)
             ├─ Google Books API   /books/v1/volumes?q=isbn:…
             └─ Open Library API   /api/books?bibkeys=ISBN:…
```

- **No build step.** These are plain files that can be served by GitHub Pages or any static host.
- **Routing:** hash routes. `#/` browse, `#/book/:id`, `#/requests`, `#/messages`, `#/chat/:id`, `#/add`, `#/profile`.
- **Rendering:** each view is a function that returns an HTML string. All dynamic values go through `esc()`. Clicks are handled once on the root using `data-action` attributes, so no inline handlers are needed and the strict CSP is possible.
- **Simulation:** a sent request is "accepted" by the other member after about 2.5 s. One sample incoming request lets you try the owner's side.

### Barcode scanning

The camera is opened with `getUserMedia` at up to 1920×1080. Continuous autofocus and up to 2× zoom are applied where the phone supports them. About 6–7 times a second, the centre band of the full-resolution frame (the guide box on screen) is decoded:

1. by the browser's **BarcodeDetector** if it supports EAN-13 (Android Chrome), otherwise
2. by **ZXing C++ compiled to WebAssembly** (`tryHarder`). This also works in iPhone Safari.

We deliberately don't scale the frame down before decoding: thin barcode lines disappear when the image is shrunk to the size of the on-screen box. The backup is *Take a photo of the barcode*: the phone's own camera app focuses better close up, and the still photo is decoded the same way.

### Add-a-book lookup pipeline

```
scan barcode / type ISBN / search title
        │
        ▼
1. Own catalogue (books already in the app with this ISBN)
   → best for Lithuanian and other small-language books
        │ not found
        ▼
2. In parallel:
   Google Books   → isbn:<13 digits>, then isbn:<10 digits>, then a plain search
   Open Library   → books API (edition), search index (bigger coverage,
                    language, subjects), then the work record for a description
   → results are merged; missing fields are filled from the other source
   Description, if still missing: Google's full volume record (HTML → plain text,
   scripts removed), the Open Library edition and work records, then another
   edition of the same title and author (same language first)
   Covers are never fetched – only the owner's photos are used
        │ nothing
        ▼
4. Manual entry (title + photo is enough). The ISBN is still saved,
   so the next family with this book gets it pre-filled.
```

Topics are suggested by matching catalogue categories, subjects and description against keyword lists in `data.js` (short keywords must be whole words, so "pet" doesn't match "petit").

**Coverage limits.** Free catalogues miss many European and small-language editions. For production, a server-side lookup (Edge Function with caching) can add national library catalogues such as the BnF (France), DNB (Germany) and LIBIS (Lithuania), or a paid service like ISBNdb. The shared catalogue means every book only has to be typed in once.

## 2. Live version (Supabase) – implemented

`backend.js` wraps all Supabase calls: OTP sign-in, membership, group data, threads, RPCs, photo upload with signed URLs, and realtime. `app.js` keeps the same in-memory state shape in both modes. In live mode it fills that state from the server (`refreshAll()`) and sends every change through `Backend`, after which it reloads. Only device preferences (language, cart) are stored locally.

## 2b. Production target (original plan)

```
PWA (same UI, installable)  ──HTTPS──▶  Supabase
                                         ├─ Auth: magic link / passkeys
                                         ├─ Postgres + Row-Level Security
                                         ├─ Realtime: chat messages, request status
                                         ├─ Storage: private bucket "book-photos"
                                         └─ Edge Functions:
                                              ├─ book lookup proxy + cache (ISBN)
                                              ├─ request state changes
                                              └─ notifications (web push + email)
Static hosting: GitHub Pages / Netlify / Vercel + own domain
```

Why Supabase: a free tier that fits a few hundred families, Postgres with row-level security, built-in auth, realtime for chat, and EU hosting regions. Alternatives with similar features: Firebase, or Pocketbase on a small VPS.

### Data model

```sql
groups        (id uuid pk, name text, created_by uuid, handover_place text, created_at)
group_invites (id uuid pk, group_id fk, code_hash text, expires_at, revoked bool)
members       (group_id fk, user_id fk → auth.users, role text check (role in ('member','organiser')),
               display_name text, country char(2), postal_code text, interested_langs text[], joined_at, primary key (group_id, user_id))
terms_acceptances (user_id fk, version text, accepted_at timestamptz, primary key (user_id, version))
postcodes     (country text, postal_code text, lat numeric, lng numeric, primary key (country, postal_code))
               -- public reference data (area centre points) for "nearby"; never user positions

catalogue     (isbn text pk, title, author, description, lang, topics text[], cover_url, source, updated_at)
               -- shared, contains no personal data

books         (id uuid pk, group_id fk, owner_id fk, isbn text null, title, author, description,
               lang text, topics text[], age text, condition text,
               offer text check (offer in ('swap','sell','give')), price_cents int,
               status text check (status in ('available','reserved','gone')),
               photo_path text, created_at)

requests      (id uuid pk, group_id fk, requester_id fk, owner_id fk,
               status text check (status in ('pending','accepted','scheduled','done','declined','cancelled')),
               handover_at timestamptz, handover_place text, created_at)
request_items (request_id fk, book_id fk, side text check (side in ('requested','offered')),
               accepted bool default false, primary key (request_id, book_id))
messages      (id bigint pk, request_id fk, sender_id fk null, kind text check (kind in ('user','system')),
               body text check (length(body) <= 1000), created_at)

wishes        (id uuid pk, group_id fk, owner_id fk, isbn text null, title text, title_norm text,
               author text, lang text, created_at)
               -- match: same isbn, or same title_norm (lower-case, no accents/punctuation)

reports       (id pk, group_id, reporter_id, target_type, target_id, reason, created_at, resolved_at)
blocks        (blocker_id, blocked_id, primary key (blocker_id, blocked_id))
```

A *bundle* is simply one `requests` row with several `request_items`.

### Row-level security

RLS is turned on for every table. A helper function checks membership:

```sql
create or replace function public.is_member(g uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from members where group_id = g and user_id = auth.uid());
$$;

alter table books enable row level security;
create policy books_read   on books for select using (is_member(group_id));
create policy books_insert on books for insert with check (owner_id = auth.uid() and is_member(group_id));
create policy books_update on books for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy books_delete on books for delete using (owner_id = auth.uid());

alter table requests enable row level security;
create policy req_read   on requests for select using (auth.uid() in (requester_id, owner_id));
create policy req_insert on requests for insert
  with check (requester_id = auth.uid() and requester_id <> owner_id and is_member(group_id) and status = 'pending');
-- No update policy: status changes go through security-definer functions
-- (accept_request, schedule_handover, mark_done) that check the caller's role.

alter table messages enable row level security;
create policy msg_read on messages for select using (
  exists (select 1 from requests r where r.id = request_id and auth.uid() in (r.requester_id, r.owner_id)));
create policy msg_insert on messages for insert with check (
  kind = 'user' and sender_id = auth.uid() and
  exists (select 1 from requests r where r.id = request_id and auth.uid() in (r.requester_id, r.owner_id)
          and r.status <> 'declined'));
```

Storage paths are `book-photos/{group_id}/{user_id}/{uuid}.jpg`. Uploading is only allowed into the caller's own `{user_id}` folder, and reading only for members of `{group_id}`.

Wishes follow the same pattern as books: readable by group members (`is_member(group_id)`), and writable only by their owner.

### Wish-list matching

When a book is listed, the server looks for `wishes` in the same group with the same ISBN or the same normalised title, and notifies those members. When a wish is added, the member immediately sees matching available books. The member page's *tailored offer* is the intersection both ways: their available books ∩ my wishes, and my available books ∩ their wishes.

### Notifications

| Event | Who | Channel |
|---|---|---|
| New request | owner | push + email |
| New message | other participant | push (email digest if unread for more than 1 h) |
| Request accepted / declined | requester | push |
| Handover tomorrow | both | push + email |
| Book from wish list listed | wisher | push |

### Estimated running cost (small community)

Free-tier limits change over time, so check the providers' current pricing.

| Item | Cost |
|---|---|
| Domain | ~€10–15 / year |
| Supabase free tier (500 MB database, 1 GB storage) | €0 |
| Hosting (GitHub Pages / Netlify) | €0 |
| Email (e.g. Resend / Brevo free tier) | €0 |
