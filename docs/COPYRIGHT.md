# Copyright & anti-piracy

> The project's approach, not legal advice. Have it reviewed before launch.

## Why swapping and selling physical books is fine

When a physical copy of a book has been sold in the EU/EEA with the rights holder's consent, the right to control *further distribution of that copy* is "exhausted" (EU Copyright Directive 2001/29/EC, art. 4(2)). In plain words: you may give away, swap or resell **your own physical copy**. That is all seku seku is for.

What is **not** allowed is copying the content: scanning or photographing pages, sharing PDFs or e-books, or sending files and links. That would infringe the author's and publisher's rights, so seku seku must not become a channel for it.

## How the app prevents it

| Measure | Where |
|---|---|
| **Physical books only**: every listing needs at least one photo of the user's own copy | Add book: you can't save without a photo |
| **Max 4 photos, downscaled to 720 px**: enough to show the cover and wear, not suited to reproducing pages | `MAX_PHOTOS`, `handlePhoto()` in `app.js` |
| Guidance next to the photo picker: "Photograph the cover and any wear. Do not photograph inside pages." | Add book screen |
| **No file uploads** anywhere except listing photos, and **no attachments in chat** | By design |
| Chat blocks messages with e-book or document files (`.pdf`, `.epub`, `.mobi`…) and file-sharing or shadow-library links (Google Drive, Dropbox, WeTransfer, MEGA, LibGen, Z-Library, Anna's Archive, Telegram…) | `looksLikeCopySharing()` in `app.js` |
| Links in chat are shown as plain text, never as clickable links | Chat rendering |
| Terms of use §6 (physical books, photos show cover and condition only), §6a (no copies) and §11 (copyright complaints) | `terms.js`, [TERMS.md](../TERMS.md) |
| **No official covers**: catalogue cover images are never fetched or shown. Every image in the app is the owner's own photo, and the CSP (`img-src 'self' data: blob:`) blocks outside images | Lookup, `index.html` |
| Book descriptions from catalogues are short publisher blurbs that identify the book, never its content | Lookup |

The chat filter is a speed bump, not a guarantee: people can still spell a link differently. The real safeguards are the reporting button and the organiser's moderation.

## Notice and takedown (production)

If the service runs in the EU, it is a hosting service under the **Digital Services Act**. It needs to:

1. Offer an easy way to report illegal content, including copyright infringement. That's the flag button and the contact in the terms.
2. Act on reports quickly: hide the listing, photo or message, and tell both sides.
3. Remove repeat infringers.
4. Keep a simple log of reports and actions.

Planned admin tools: a report queue for organisers, a "hide" action on listings, photos and messages, and the ability to suspend users.

## Book data from the National Library of Lithuania

Titles, authors, languages and age groups can come from the open data set *Bibliografiniai įrašai* of the Martynas Mažvydas National Library of Lithuania, published on data.gov.lt. Only bibliographic facts are used (no covers, no text from the book). When the library supplied the details, the add-book message shows the credit line "Data: Martynas Mažvydas National Library of Lithuania, data.gov.lt." (LT/ES/EN).

**Licence (checked by the owner, 19 Nov 2026):** use is allowed if the library is credited. The credit line above is the credit; keep it wherever library data is shown. If the licence page changes, update this section and the `lnbCredit` text in `i18n.js`.
