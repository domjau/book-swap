# Contributing

Thanks for helping! This project is run by volunteers from diaspora communities, so small, clear contributions are best.

## Run it

```bash
git clone https://github.com/domjau/book-swap
cd book-swap
python3 -m http.server 8000   # or any static server
# open http://localhost:8000
```

There is no build step and no npm install. To reset the demo, use Profile → *Delete account and data*, or clear the site's storage.

## Ground rules

- **Escape everything.** Any value that ends up in HTML must go through `esc()`. Never use `innerHTML` with unescaped data.
- **No inline scripts or handlers** (`onclick=""`). Use `data-action` and add the handler to the `A` object in `app.js`. The CSP blocks inline scripts.
- **No new third-party scripts or CDNs.** If a library is really needed, put it in `vendor/` with its licence, and explain why in the pull request.
- **Every new text goes in all languages** in `i18n.js` (English is fine as a placeholder, but mark it in the PR).
- Keep it accessible: real `<button>`s and `<label>`s, touch targets of at least 44 px, readable contrast.
- Don't commit real personal data or real family names in sample data.

## Good first issues

- Translate into a new language (see [docs/TRANSLATIONS.md](docs/TRANSLATIONS.md)).
- Add topic keywords in more languages to improve topic suggestions.
- Add a torch (flashlight) button to the scanner where `torch` is supported.
- Host the Outfit font locally instead of loading it from Google Fonts.
- Add a service worker for an offline app shell.

## Security

Found a security problem? Please follow [SECURITY.md](SECURITY.md) and don't open a public issue.
