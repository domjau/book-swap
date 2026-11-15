# Copyright & anti-piracy

> The project's approach, not legal advice. Have it reviewed before launch.

## Why swapping and selling physical books is fine

When a physical copy of a book has been sold in the EU/EEA with the rights holder's consent, the right to control *further distribution of that copy* is "exhausted" (EU Copyright Directive 2001/29/EC, art. 4(2)). In plain words: you may give away, swap or resell **your own physical copy**. That is all Book Swap is for.

What is **not** allowed is copying the content: scanning or photographing pages, sharing PDFs or e-books, or sending files and links. That would infringe the author's and publisher's rights, so Book Swap must not become a channel for it.

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
| Catalogue covers come from Google Books / Open Library and are only shown as a thumbnail to identify the edition | Lookup |

The chat filter is a speed bump, not a guarantee: people can still spell a link differently. The real safeguards are the reporting button and the organiser's moderation.

## Notice and takedown (production)

If the service runs in the EU, it is a hosting service under the **Digital Services Act**. It needs to:

1. Offer an easy way to report illegal content, including copyright infringement. That's the flag button and the contact in the terms.
2. Act on reports quickly: hide the listing, photo or message, and tell both sides.
3. Remove repeat infringers.
4. Keep a simple log of reports and actions.

Planned admin tools: a report queue for organisers, a "hide" action on listings, photos and messages, and the ability to suspend users.
