# Privacy & data protection

> This is the project's working approach, not legal advice. Check it with someone who knows GDPR before launching to real families.

## Principles

1. **Collect as little as possible.** We store a display name, a **country and postal code**, an email for sign-in, books, wish lists and messages. We never ask for street addresses, phone numbers, children's names or birthdays.
2. **Neighbours, not addresses.** A country and postal code are enough to show who lives nearby and to avoid shipping. People agree on a public meeting place in the chat, so nobody needs to share their exact address.
3. **Only signed-in members see you.** Listings and profiles are visible only to people who have signed up and accepted the terms, never to the public web or search engines.
4. **Users stay in control.** They can export their data or delete their account from the app.

## What is stored

| Data | Why | Visible to | Prototype | Production |
|---|---|---|---|---|
| Display name | So people know who they swap with | Signed-in members | Device only | Server (EU region) |
| Email | Sign-in links, notifications | Nobody else | Not collected | Server, never shown |
| Country + postal code | Show who is nearby, avoid shipping | Signed-in members | Device only | Server |
| Interested book languages | Better browsing | Only you | Device only | Server |
| Profile picture (optional) | Recognise each other at handovers | Signed-in members | Device only | Server (private bucket) |
| Reviews you give and receive (1–5 + short comment) | Trust between members | Signed-in members | Device only | Server |
| Wish list (titles you're looking for) | Matching with other people's shelves | Signed-in members | Device only | Server |
| Terms acceptance (version + time) | Proof that the user accepted the terms | Only you / admins | Device only | Server |
| Books (title, details, photo) | The listing itself | Signed-in members | Device only | Server |
| Requests & chat messages | Arranging the swap | The two people involved (+ admins for a reported conversation) | Device only | Server |
| Profile stats | Fun | Only you | Calculated on device | Calculated from the above |

Book lookups send **only the ISBN or the search text** to Google Books / Open Library, with no user information. Lookups in the National Library of Lithuania go through our own server (Edge Function `isbn-lookup`), which sends only the ISBN to data.gov.lt. To stop overuse, the server notes which member made a library call and when (no ISBN), and deletes these notes after one day. Results are cached per ISBN, with no user information.

## Photos

Phone photos often carry GPS coordinates in their EXIF metadata. The app redraws every photo on a canvas before saving, which removes all metadata. The production server will do the same again. Users are asked to photograph only the book: its cover and its condition. At least one photo is required and at most 4 are allowed, each resized to 720 px. Another family's photos are never copied when the same ISBN is added again.

## Notifications

- Notifications are stored per person and visible only to that person. Everyone chooses per type whether they want them in the app, by email, or both, and whether emails come right away, once a day, or never. The choice is offered at sign-up and can be changed in Profile → Notifications.
- Emails are sent only for notifications not already read in the app. They contain a short snippet (max 80 characters) of chat messages.
- The email sender runs on the server with elevated rights and reads only what it needs: pending notifications, settings, display names and the recipient's email address.

## Admins and moderation

- Admins are the people running the service. The first one is added by hand in the database; further admins are added by an existing admin, by email, after that person has signed up.
- Admins see the same as every member (display names, postal codes, listings, reviews), plus reports, the list of admins (with their emails) and the moderation log.
- Admins can read a chat **only if it has been reported**, through a checked function that returns the last 30 messages of that conversation.
- Every admin action (removals, bans, hiding listings, resolving reports, announcements, adding or removing admins) is written to a moderation log that all admins can see.

## Country and postal codes

- Only the country and postal code are stored, never the street or house number. In big cities a postal code covers thousands of households.
- In very small places a postal code can narrow things down to a few houses. Users can enter a nearby larger town's code if they prefer.
- People in a different country are never shown as "nearby".
- "Nearby" in the prototype is a rough guess based on postal codes in the same country. The production version should use the centre point of each postal area, and never the user's real position.

## Children

The app is meant for adults (parents and guardians). Children's names and photos should not be posted. Admins can remove listings that break this.

## Retention (production)

Done by `cleanup_old_data()` (migration 007), daily once pg_cron is on:

- Read notifications are deleted after 90 days, all notifications after a year.
- Chats of finished or declined requests are deleted after 12 months. Finished requests stay (without chat), because reviews belong to them; declined requests go after 12 months, unanswered ones after 6 months.
- The library fair-use log is deleted after one day.
- Deleting an account (`delete_my_account()`) removes the profile, books, photos, wish list, requests and chats, reviews, reports, notifications and settings right away, and from backups as they rotate out. Only a SHA-256 hash of a **blocked** member's email is kept, so the block still works.
- Still to do: books marked *gone* (and their photos) after 12 months, and inactive accounts after 2 years with an email warning first. Both need an Edge Function (photos can only be removed through the Storage API) and working email.

The in-app privacy notice is `privacy.js` (LT/ES/EN, route `#/privacy`). The record of processing and the breach plan are in [`docs/compliance/`](compliance/).

## GDPR checklist before launch

- [x] Choose an EU hosting region (Supabase eu-central-1, Frankfurt).
- [ ] Sign the data processing agreements (DPAs) with providers: database, email, hosting.
- [x] Publish a short privacy notice in every app language: who runs it, what is stored, why, how long, and how to contact you. (Fill in `TERMS.operator` in `terms.js` with the controller's name, country and contact email.)
- [x] Make sure the export and delete functions work against the server data (migration 007).
- [ ] Use no analytics or tracking cookies (or, if added later, privacy-friendly analytics only, with no cookies).
- [x] Have a plan for a data breach: who decides, and how members are told within 72 hours ([breach plan](compliance/breach-plan.md)).
- [x] Self-host the Outfit font (`vendor/fonts/`), so Google Fonts no longer sees visitors' IP addresses.
