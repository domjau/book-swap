# Privacy & data protection

> This is the project's working approach, not legal advice. Check it with someone who knows GDPR before launching to real families.

## Principles

1. **Collect as little as possible.** We store a display name, a **country and postal code**, an email for sign-in, books, wish lists and messages. We never ask for street addresses, phone numbers, children's names or birthdays.
2. **Neighbours, not addresses.** A country and postal code are enough to show who lives nearby and to avoid shipping. People agree on a public meeting place in the chat, so nobody needs to share their exact address.
3. **Only your group sees you.** Listings and profiles are visible only to members of the same invite-only group.
4. **Users stay in control.** They can export their data or delete their account from the app.

## What is stored

| Data | Why | Visible to | Prototype | Production |
|---|---|---|---|---|
| Display name | So people know who they swap with | Group members | Device only | Server (EU region) |
| Email | Sign-in links, notifications | Nobody else | Not collected | Server, never shown |
| Country + postal code | Show who is nearby, avoid shipping | Group members | Device only | Server |
| Interested book languages | Better browsing | Only you | Device only | Server |
| Profile picture (optional) | Recognise each other at handovers | Group members | Device only | Server (private bucket) |
| Reviews you give and receive (1–5 + short comment) | Trust between members | Group members | Device only | Server |
| Wish list (titles you're looking for) | Matching with other people's shelves | Group members | Device only | Server |
| Terms acceptance (version + time) | Proof that the user accepted the terms | Only you / admins | Device only | Server |
| Books (title, details, photo) | The listing itself | Group members | Device only | Server |
| Requests & chat messages | Arranging the swap | The two people involved (+ organiser for a reported message) | Device only | Server |
| Profile stats | Fun | Only you | Calculated on device | Calculated from the above |

Book lookups send **only the ISBN or the search text** to Google Books / Open Library, with no user information.

## Photos

Phone photos often carry GPS coordinates in their EXIF metadata. The app redraws every photo on a canvas before saving, which removes all metadata. The production server will do the same again. Users are asked to photograph only the book: its cover and its condition. At least one photo is required and at most 4 are allowed, each resized to 720 px. Another family's photos are never copied when the same ISBN is added again.

## Notifications

- Notifications are stored per person and visible only to that person. Everyone chooses per type whether they want them in the app, by email, or both, and whether emails come right away, once a day, or never. The choice is offered at sign-up and can be changed in Profile → Notifications.
- Emails are sent only for notifications not already read in the app. They contain a short snippet (max 80 characters) of chat messages.
- The email sender runs on the server with elevated rights and reads only what it needs: pending notifications, settings, display names and the recipient's email address.

## Organisers and moderation

- Organisers can see members' display names, postal codes, listings and reviews (the same as every member), plus reports and the moderation log.
- Organisers can read a chat **only if it has been reported**, through a checked function that returns the last 30 messages of that conversation.
- Every organiser action (role changes, removals, bans, hiding listings, resolving reports, announcements, revoking invites) is written to a moderation log that all organisers of the group can see.
- Platform admins (the people running the service) can see a list of groups with counts and all open reports, and can delete a group. They are added by hand in the database.

## Country and postal codes

- Only the country and postal code are stored, never the street or house number. In big cities a postal code covers thousands of households.
- In very small places a postal code can narrow things down to a few houses. Users can enter a nearby larger town's code if they prefer.
- People in a different country are never shown as "nearby".
- "Nearby" in the prototype is a rough guess based on postal codes in the same country. The production version should use the centre point of each postal area, and never the user's real position.

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
