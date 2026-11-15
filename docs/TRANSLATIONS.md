# Translations

There are two kinds of language in the app:

- **App (UI) language:** the language of the buttons and text. Currently `lt`, `es`, `en`.
- **Book language:** the language a book is written in, used as a filter. Currently `lt`, `es`, `en`, `da`, `other` (see `BOOK_LANGS` in `data.js`).

A Spanish-speaking family can use the app in Spanish and browse Lithuanian books.

## Add a new app language (e.g. Polish)

1. In `i18n.js`, copy the whole `en: { … }` block and rename it `pl: { … }`.
2. Translate the values, keeping the keys and the `{placeholders}` exactly as they are.
3. Translate `langNames` (the names of book languages, written in Polish).
4. Add `'pl'` to `window.UI_LANGS`.
5. In `data.js`, add `pl: '…'` to every topic's `names`.

Any key that is missing falls back to English, so a partly translated language still works.

## Add a new book language

Add the code to `BOOK_LANGS` in `data.js` and its name to `langNames` in every language in `i18n.js`.

## Tips

- Keep button text short, because phones are narrow.
- Lithuanian family names change form ("Petraičių šeima"), so display names are written by the users themselves rather than built by the app.
- Dates and times are formatted automatically with `Intl.DateTimeFormat` in the chosen app language.
