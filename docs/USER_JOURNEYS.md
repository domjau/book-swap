# User journeys

There is one kind of user: a **member**. Any member can list, browse, request and chat. Everyone is in **one open network**: there are no communities or invite codes, and people find books near them by postal code and book language. A few **admins** (the people running the service) moderate.

## 1. Admin: look after the network

1. The first admin signs up like everyone else and is made admin once in the database (see `supabase/README.md`).
2. To add another admin, they ask the person to sign up, then go to **Profile → Admin panel → Admins** and add them by email. They can remove admins there too.
3. Day to day, admins step in only when needed: they get a notification for each new report, read the reported conversation, hide a listing, remove or block a member, and resolve the report. They can send an announcement to everyone. Every action goes into the moderation log.

## 2. Joining

1. Opens the app link (shared e.g. in the school's parents' chat or on a poster) and picks the app language.
2. Signs in with an emailed link (no password).
3. Enters a display name, e.g. "Ana (García family)", a **country and postal code** (never an address; the country is guessed from the phone and the postal code is checked against that country's format) and the book languages they're looking for.
4. Reads and **accepts the terms of use**. seku seku is a peer-to-peer noticeboard and is not responsible for the deals between members.
5. Gets prompted to **add a few books and a wish list**, so the shelves and matches fill up.

## 3. Listing a book: scan first

1. Taps **Add** and the camera opens. They scan the ISBN barcode on the back cover (or type the ISBN, or search by title).
2. The app fills in the details from the group's own catalogue, then Google Books, then Open Library: title, author, description, cover, language and suggested topics.
3. The member checks the details, takes a photo of their own copy (location data is removed automatically), and picks age group, condition and **swap / sell (price) / give away**.
4. Saves. The book appears in **New this week** for the whole group.
5. If nothing is found: enters the title and a photo. The ISBN is stored, so the next family with the same book gets everything pre-filled.

## 3b. Building a wish list

1. On **Add**, switches to **"I'm looking for it"**, then scans, searches or types the book they want.
2. If someone already has it, the app shows it straight away. Otherwise the wish waits, and the member is told when someone lists that book.
3. Their wish list is visible to the group, so others can see what would make a good swap.

## 3c. Tailored exchange (wish list ↔ shelf)

1. Home shows **"They want your books"**: members whose wish lists match books on your shelf, closest first.
2. Opening a member's page shows their shelf, their wish list and a **tailored offer**: their books that are on your wish list, and your books that are on theirs, already ticked.
3. Adjust the ticks and tap **Propose exchange**. A bundle is created with your books offered in return and a ready-written message ("I saw you are looking for Zog – would you swap for Room on the Broom?").

## 4. Finding books and making a bundle

1. Browses by **book language**, **topic** (dinosaurs, fairies & magic, animals, space…), **age**, **Near me**, or by search. Books are sorted with the nearest owners first, to avoid shipping.
2. Opens a book: photo, description, owner, offer type. Below it is "More from Ana".
3. Taps **Add to request**. Books from the same owner are grouped into **one bundle** automatically. Books from different owners make separate bundles.
4. In **Requests**, sees each bundle with the total for books on sale, optionally ticks some of their **own books to offer in return**, and writes a message.
5. Taps **Send request**, which opens a chat with the owner.

## 5. Agreeing the details in chat

1. **Owner** gets a notification "Ana wants 3 books" and opens the chat. The bundle is pinned at the top.
2. Owner ticks the books they can give (all or some) → **Accept**, or **Decline**. Accepted books show as *Reserved* to everyone else.
3. Both chat as needed. **Quick replies** are available ("Yes, Saturday works", "Maybe next week?").
4. Either person fills in the **handover card** (date and place, pre-filled from the group settings) and taps **Confirm**. Both get a reminder the day before.

## 6. Handover and afterwards

1. The books change hands at school. Money for sold books is paid by MobilePay / Bizum / cash, outside the app.
2. Either person taps **Mark as handed over**. The books leave the owner's shelf, and the receiver's profile counts them as received.
3. Profile stats update: books given away and received, money saved, book-language mix, favourite topics and badges.

## 7. Safety paths

- **Report** (flag icon in chat) sends the conversation to the admins.
- **Block** stops the other person from requesting your books or messaging you (production).
- **Delete account** removes profile, books and messages.
