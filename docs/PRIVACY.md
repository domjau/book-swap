# Privacy & data protection

> This is the project's working approach, not legal advice. Check it with someone who knows GDPR before launching to real families.

## Principles

1. **Collect as little as possible.** We store a display name, an email for sign-in, books and messages. We never ask for addresses, phone numbers, children's names or birthdays.
2. **Meet in person at a known place.** Handovers happen at school or another group meeting place, so nobody needs to share where they live.
3. **Only your group sees you.** Listings and profiles are visible only to members of the same invite-only group.
4. **Users stay in control.** They can export their data or delete their account from the app.

## What is stored

| Data | Why | Visible to | Prototype | Production |
|---|---|---|---|---|
| Display name | So people know who they swap with | Group members | Device only | Server (EU region) |
| Email | Sign-in links, notifications | Nobody else | Not collected | Server, never shown |
| Interested book languages | Better browsing | Only you | Device only | Server |
| Books (title, details, photo) | The listing itself | Group members | Device only | Server |
| Requests & chat messages | Arranging the swap | The two people involved (+ organiser for a reported message) | Device only | Server |
| Profile stats | Fun | Only you | Calculated on device | Calculated from the above |

Book lookups send **only the ISBN or the search text** to Google Books / Open Library, with no user information.

## Photos

Phone photos often carry GPS coordinates in their EXIF metadata. The app redraws every photo on a canvas before saving, which removes all metadata. The production server will do the same again. Users are encouraged to photograph only the book.

## Children

The app is meant for adults (parents and guardians). Children's names and photos should not be posted. The organiser can remove listings that break this.

## Retention (production)

- Books marked *gone* are hidden right away and deleted after 12 months.
- Chats for finished or declined requests are deleted after 12 months.
- Deleting an account removes the profile, books, photos and messages within 30 days, including from backups as they rotate out.

## GDPR checklist before launch

- [ ] Choose an EU hosting region (e.g. Supabase eu-central / Frankfurt).
- [ ] Sign the data processing agreements (DPAs) with providers: database, email, hosting.
- [ ] Publish a short privacy notice in every app language: who runs it, what is stored, why, how long, and how to contact you.
- [ ] Make sure the export and delete functions work against the server data.
- [ ] Use no analytics or tracking cookies (or, if added later, privacy-friendly analytics only, with no cookies).
- [ ] Have a plan for a data breach: who decides, and how members are told within 72 hours.
