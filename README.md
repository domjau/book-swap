# Book Swap – prototype

A small web app for diaspora communities (starting with a Lithuanian Saturday school) to **swap, sell or give away children's books**. Families browse each other's shelves by book language, topic and age, bundle several books from the same person into one request, agree on the details in a chat, and hand the books over at school.

There are two modes:

- **Live** (default): real accounts and shared data via [Supabase](https://supabase.com). Sign-in is by emailed link or 6-digit code (no passwords), and you join a group with an invite code or start a new one. Books, photos, wish lists, requests and chat are shared, and chat updates live. See [supabase/README.md](supabase/README.md) for setup.
- **Demo**: add `?demo=1` to the address (e.g. https://domjau.github.io/book-swap/?demo=1). This is an offline version with sample families, where everything is stored only on your device. It's good for showing the idea.

## Try it

**Live demo:** https://domjau.github.io/book-swap/

Open it on your phone and choose **Add to Home Screen** to use it like an app. Try scanning the barcode of a children's book you own.

To run it locally:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

The camera only works over HTTPS or on `localhost`.

## What's in it

- **Interface in Lithuanian, Spanish and English.** Switch any time with LT / ES / EN at the top.
- **Joining:** name, app language and the book languages you're interested in.
- **Browse:** search, book-language filter, topic tiles (dinosaurs, fairies & magic, animals, space, monsters, funny, bedtime, feelings, learning), age filter, and a "New this week" row.
- **Book page:** description, details, and "More from <owner>".
- **Bundled requests:** books from the same person become one request. You can offer some of your own books in return and add a message.
- **Chat for each request:** the books are pinned at the top. The owner ticks which books to accept, then the two people agree on a date and place for the handover and mark it as handed over. Includes quick replies and a report button.
  - The prototype simulates the other person accepting your request after about 2 seconds.
  - One sample incoming request (from Mette) lets you try the owner's side.
- **Add a book, scan first:** scan the ISBN barcode with the phone camera (full-resolution frames are decoded by the phone's built-in BarcodeDetector where available, otherwise by ZXing in WebAssembly; autofocus and 2× zoom where supported), take a photo of the barcode as a backup, type the ISBN, or search by title. Title, author, language, topics and a **description** are filled in. The official cover is never used, only your own photos. There's an optional *About this copy* note for wear and tear. Details are filled in from:
  1. books already in the app (the shared catalogue, which is the best source for Lithuanian books),
  2. Google Books (description, cover, language, categories),
  3. Open Library (fills in any gaps).

  Topics are suggested from the catalogue categories. If the book isn't found, it can be entered by hand.
- **Photos:** 1–4 photos of your own copy are **required** for every listing (cover and wear only). They are resized to 720 px on the phone and redrawn on a canvas, which removes EXIF and GPS data.
- **No piracy:** only physical books. The chat blocks e-book files and file-sharing links, and the terms forbid sharing copies. See [docs/COPYRIGHT.md](docs/COPYRIGHT.md).
- **Wish lists and tailored exchanges:** add books you're looking for (scan, search or type). See "From your wish list" and "They want your books" on the home screen. A member's page pre-ticks a fair swap: their books you want, and your books they want.
- **Neighbours first:** members give their country and postal code, never an address. The country list is shown in the app language, and postal codes are checked for common countries (DK, LT, ES, DE, UK, NL…). Books show the owner's area, a *Near me* filter is available, and lists are sorted nearest first to avoid shipping.
- **Terms of use:** must be accepted at sign-up, in LT/ES/EN. They make clear that Book Swap is a peer-to-peer noticeboard and is not responsible for deals between users. See [TERMS.md](TERMS.md).
- **Reviews with little books:** after a handover, each side rates the other 1–5 little books, with an optional comment. Ratings appear on profiles, member pages and book pages.
- **Profile pictures** and **sold / donated / exchanged** counts for every member.
- **Profile stats:** books listed, given away and received, money saved, a book-language mix, favourite topics and badges.
- **Settings:** export my data (JSON) and delete everything.

## Files

| File | What |
|---|---|
| `index.html` | Page shell and Content-Security-Policy |
| `app.js` | All screens and logic (plain JS, no build step) |
| `backend.js` | The only file that talks to Supabase (auth, data, photos, realtime), so the backend can be swapped later |
| `config.js` | Supabase project URL and **publishable** key (public by design; access is enforced by RLS) |
| `supabase/` | Database schema, row-level security, functions, storage rules and security tests |
| `vendor/supabase.js` | supabase-js 2.119.0 (MIT), hosted locally |
| `i18n.js` | Translations. To add a language, copy the `en` block and add its code to `UI_LANGS` |
| `data.js` | Topics, sample members (with postal codes), sample books and wish lists |
| `terms.js` | Terms of use in LT/ES/EN and the current version |
| `styles.css` | Styles |
| `vendor/zxing-reader.js`, `vendor/zxing_reader.wasm` | ZXing barcode decoder compiled to WebAssembly ([zxing-wasm](https://github.com/Sec-ant/zxing-wasm) 3.1.6, MIT), hosted locally |

## Documentation

| Doc | What's in it |
|---|---|
| [docs/USER_JOURNEYS.md](docs/USER_JOURNEYS.md) | How organisers and members use the app, step by step |
| [docs/FEATURES.md](docs/FEATURES.md) | What's built, what's next (MVP) and later ideas |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Prototype structure, book lookup pipeline, production design, data model, row-level security |
| [TERMS.md](TERMS.md) | Terms of use (P2P disclaimer, limitation of liability) and notes for maintainers |
| [docs/COPYRIGHT.md](docs/COPYRIGHT.md) | Why swapping physical books is fine, and how the app prevents sharing copies |
| [SECURITY.md](SECURITY.md) | How to report vulnerabilities, current protections, production security checklist |
| [docs/PRIVACY.md](docs/PRIVACY.md) | What data is stored and why, photo metadata, retention, GDPR checklist |
| [docs/TRANSLATIONS.md](docs/TRANSLATIONS.md) | Adding app languages and book languages |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Running locally and coding rules |

## Security notes (prototype)

- All user text is HTML-escaped before display. Chat messages are rendered as plain text only.
- A strict Content-Security-Policy: no inline scripts, no third-party scripts, and network access limited to Google Books and Open Library.
- No passwords, addresses or phone numbers are collected.
- Location data is removed from photos.

## Towards a real version

The full plan is in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) and [SECURITY.md](SECURITY.md). In short:

1. A backend (e.g. Supabase): email magic-link sign-in, Postgres with **row-level security** so members only see their own group, storage for photos, and realtime for chat.
2. Invite-only groups with an expiring invite link per school or community, plus organiser/admin tools.
3. Push and email notifications for requests, messages and the reminder the day before a handover.
4. Wish lists ("looking for"), "still available?" checks, and bulk adding books.
5. Privacy notice, data export and account deletion (GDPR).
