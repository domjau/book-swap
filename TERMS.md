# Terms of use

*Version 2026-11-15.5. The same text is shown in the app in Lithuanian, Spanish and English (`terms.js`), and every user must accept it before using the app.*

seku seku is a free, volunteer-run noticeboard that helps people find each other to swap, sell or give away books. By creating a profile you accept these terms.

## 1. What seku seku is
seku seku is a peer-to-peer (P2P) platform. We only provide a place to list books and talk to each other. We are not a shop, seller, buyer, agent or middleman, and we are never a party to any swap, sale or gift between users.

## 2. No checks, no guarantees
We do not verify users' identity, the books, their condition, descriptions, prices or payments. Everything is provided "as is". We do not guarantee that another user will turn up, pay or hand over a book, or that the app will always work or be free of errors.

## 3. Your responsibility
Any agreement is solely between the users involved. You decide whom to trust, you check the book before you pay, and you choose how to pay. Safety tips: meet in a public place, do not pay in advance to people you do not know, and never share bank log-ins or card details.

## 4. Limitation of liability
To the maximum extent permitted by law, the people who run seku seku are not liable for any loss or damage arising from the use of the platform or from dealings between users – including fraud, scams, books not handed over, lost money, damaged books or disputes. Nothing in these terms limits liability that cannot be limited by law.

## 5. Disputes between users
You must resolve disputes directly with the other user. The seku seku admins may – but are not obliged to – look at reports, hide listings or remove and block users. When a conversation is reported, the admins can read that conversation to handle the report; otherwise chats are private between the two people involved. Admin actions are logged.

## 6. Acceptable use
Only list physical books that you own and are allowed to give away or sell. Each listing needs at least one photo of your own copy; photos may show the cover and its condition only. No illegal, offensive or adult content, no spam, no large-scale commercial reselling and no harassment. Do not post children's names or photos of people.

## 6a. Copyright – no copies
seku seku is for passing on physical books, never their content. Do not upload, send or link to scans, photos of inside pages, PDFs, e-books, audiobooks or any other copies – not in listings, photos or chat. Copying and sharing a book's content without permission infringes the author's and publisher's copyright. We remove such content and may remove users who post it.

## 7. Your location
You share your country and postal code – never your address – so that neighbours can find each other and avoid shipping. Your country and postal code are visible to other signed-in users.

## 8. Privacy
We only store what is needed for swapping. You can download or delete your data at any time from your profile. See [docs/PRIVACY.md](docs/PRIVACY.md).

## 9. Changes and ending
We may change these terms; you will then be asked to accept the new version. We may suspend or end the service or your profile at any time. You can stop using seku seku and delete your profile at any time.

## 10. Contact
Questions and reports: https://github.com/domjau/book-swap/issues

## 11. Copyright complaints
If you believe something on seku seku infringes your copyright, report it with the flag button or via the contact above, saying what it is and where. We will remove infringing content promptly.

---

### For maintainers

- When you change the text, update **`terms.js` in all languages** and bump `TERMS.version`. Every user will then be asked to accept the new version the next time they open the app.
- **Before launching with real users, have these terms reviewed by a lawyer** in the country where the service is run. In particular:
  - Under EU and Danish consumer law, liability cannot be excluded for intent, gross negligence or personal injury. That is why the terms say "to the maximum extent permitted by law".
  - Decide who the operator is: a person, the school association, or a forening. Add the name and a contact email in section 10 and in the privacy notice.
  - Decide which country's law applies and where disputes are handled.
- The in-app acceptance is stored with the version and time (`S.agreed`). In production, store it on the server per user.
