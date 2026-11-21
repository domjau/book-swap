/* seku seku prototype – plain JavaScript, no build step.
   All data lives in localStorage on this device. Every piece of user text is
   escaped before it is put on the page (see esc()). */
(function () {
  'use strict';

  // LIVE = real accounts and shared data via Supabase (see backend.js / config.js); otherwise offline demo.
  const LIVE = !!(window.Backend && window.Backend.enabled);
  const KEY = LIVE ? 'bookswap-live-v1' : 'bookswap-v1';
  const $app = document.getElementById('app');
  const MINE = 'me';
  const MAX_PHOTOS = 4;

  // ---------- helpers ----------
  const esc = (v) => String(v == null ? '' : v)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  const clone = (o) => JSON.parse(JSON.stringify(o));
  const uid = (p) => p + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const TOPIC = {}; TOPICS.forEach((t) => { TOPIC[t.id] = t; });

  const ICON = {
    seku: 'M1.75 18.62 L6.75 18.62 L6.75 6.12 Q6.75 5.38 7.50 5.38 L10 5.38 Q10.75 5.38 10.75 6.12 L10.75 18.62 L12.50 18.62 L15 7.62 Q15.19 6.88 15.94 7.06 L18.25 7.62 Q19 7.81 18.81 8.56 L16.38 18.62 L22.25 18.62',
    logo: 'M4 5.5C6.5 4.5 9.5 4.5 12 6c2.5-1.5 5.5-1.5 8-.5V19c-2.5-1-5.5-1-8 .5-2.5-1.5-5.5-1.5-8-.5zM12 6v13.5',
    books: 'M4 4h5v16H4zM10 4h5v16h-5zM16 5l3.5-.8 2 15.5-3.5.8z',
    plus: 'M12 5v14M5 12h14',
    bag: 'M5 8h14l-1.2 12H6.2zM9 8V6a3 3 0 0 1 6 0v2',
    chat: 'M4 5h16v11H9l-5 4z',
    user: 'M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c0-4 3.5-7 8-7s8 3 8 7',
    back: 'M15 5l-7 7 7 7',
    search: 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM20 20l-4-4',
    camera: 'M4 8h3l2-3h6l2 3h3v11H4zM12 16.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z',
    check: 'M5 12.5l4.5 4.5L19 7.5',
    x: 'M6 6l12 12M18 6L6 18',
    send: 'M4 12l16-8-6 16-2.5-6.5z',
    flag: 'M5 21V4h11l-1.5 4L16 12H5',
    calendar: 'M4 6h16v14H4zM4 10h16M8 3v5M16 3v5',
    star: 'M12 3l2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.6 6.6 19.5l1.2-6L3.3 9.3l6.1-.7z',
    download: 'M12 4v11M7 10l5 5 5-5M5 20h14',
    trash: 'M5 7h14M10 7V4h4v3M7 7l1 13h8l1-13',
    barcode: 'M4 6v12M7 6v12M10 6v12M14 6v12M17 6v12M20 6v12',
    pin: 'M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21zM12 12a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z',
    heart: 'M12 20.5S3.5 15.5 3.5 9.5A4.5 4.5 0 0 1 12 7a4.5 4.5 0 0 1 8.5 2.5c0 6-8.5 11-8.5 11z',
    shield: 'M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6z',
    swapArrows: 'M7 7h12l-3-3M17 17H5l3 3',
    doc: 'M6 3h8l4 4v14H6zM14 3v4h4M9 12h6M9 16h6'
  };
  const icon = (name, size, extra) => `<svg class="i" width="${size || 22}" height="${size || 22}" viewBox="0 0 24 24" aria-hidden="true"${extra || ''}><path d="${ICON[name] || name}"></path></svg>`;

  // ---------- state ----------
  function detectLang() {
    const n = (navigator.language || 'en').slice(0, 2).toLowerCase();
    return UI_LANGS.indexOf(n) >= 0 ? n : 'en';
  }
  function fresh() {
    if (LIVE) {
      return { v: 2, lang: detectLang(), me: null, interested: ['lt', 'es', 'en'], books: [], cart: [], cartMeta: {},
        threads: [], received: [], wishes: [], agreed: null, reviews: [] };
    }
    return {
      v: 1, lang: detectLang(), me: null, interested: ['lt', 'es', 'en'],
      books: clone(SAMPLE_BOOKS).map((b) => Object.assign({ status: 'available', isbn: '' }, b)),
      cart: [], cartMeta: {}, threads: clone(SAMPLE_THREADS).map((t) => Object.assign({ unread: true }, t)),
      received: [], wishes: clone(SAMPLE_WISHES), agreed: null, reviews: clone(SAMPLE_REVIEWS)
    };
  }
  function migrate(s) {
    if (!s) return null;
    if (!s.wishes) s.wishes = clone(SAMPLE_WISHES);
    if (s.agreed === undefined) s.agreed = null;
    if (!s.reviews) s.reviews = clone(SAMPLE_REVIEWS);
    s.v = 2;
    return s;
  }
  function load() {
    try { const raw = localStorage.getItem(KEY); return raw ? JSON.parse(raw) : null; } catch (e) { return null; }
  }
  let S = LIVE ? Object.assign(fresh(), pickPrefs(load() || {})) : (migrate(load()) || fresh());
  function pickPrefs(o) {
    const out = {};
    ['lang', 'interested', 'cart', 'cartMeta', 'toured'].forEach((k) => { if (o[k] !== undefined) out[k] = o[k]; });
    return out;
  }
  if (LIVE) Object.keys(MEMBERS).forEach((k) => delete MEMBERS[k]); // members come from the server
  const initCountry = () => { ui.onbCountry = (S.me && S.me.country) || guessCountry(); };
  function save() {
    // In live mode only device preferences are stored locally; everything else is on the server.
    try { localStorage.setItem(KEY, JSON.stringify(LIVE ? pickPrefs(S) : S)); } catch (e) { toast('Storage full – try removing a photo.'); }
  }

  const ui = {
    q: '', fLang: 'all', fTopic: null, fAge: null,
    draft: null, addStep: 'scan', addMsg: '', addMsgKind: '', searchResults: [], busy: false, lastSaved: null,
    ticks: {}, showOffer: {}, rating: {}, editReview: {}, toast: '', onbName: '', onbPostal: '', onbCountry: '', onbAgree: false, fNear: false, ex: {}, addMode: 'shelf', lastWish: null, scanner: null, chatTab: 'active'
  };

  // ---------- i18n ----------
  function t(key, vars) {
    const pack = STRINGS[S.lang] || STRINGS.en;
    let s = pack[key] != null ? pack[key] : (STRINGS.en[key] != null ? STRINGS.en[key] : key);
    if (vars) Object.keys(vars).forEach((k) => { s = s.split('{' + k + '}').join(vars[k]); });
    return s;
  }
  const langName = (code) => (STRINGS[S.lang].langNames[code] || STRINGS[S.lang].langNames.other);
  const topicName = (id) => (TOPIC[id] ? (TOPIC[id].names[S.lang] || TOPIC[id].names.en) : id);
  const memberName = (id) => (id === MINE ? (S.me ? S.me.name : '') : (MEMBERS[id] ? MEMBERS[id].name : '—'));
  const groupLabel = () => t('tagline'); // one open network – no community names
  const firstName = (id) => memberName(id).split(' (')[0];
  const fmtDate = (d) => new Intl.DateTimeFormat(S.lang, { weekday: 'short', day: 'numeric', month: 'short' }).format(d);
  const fmtTime = (ms) => new Intl.DateTimeFormat(S.lang, { hour: '2-digit', minute: '2-digit' }).format(new Date(ms));
  function nextSaturdayISO() {
    const d = new Date(); const add = (6 - d.getDay() + 7) % 7 || 7; d.setDate(d.getDate() + add);
    return d.toISOString().slice(0, 10);
  }

  // ---------- book helpers ----------
  const book = (id) => S.books.find((b) => b.id === id);
  const needsOnboarding = () => !S.me || !S.me.postal || !S.me.country || !S.agreed || S.agreed.version !== TERMS.version;

  // Countries: names come from the browser in the current app language.
  const displayNames = {};
  function countryName(cc) {
    if (!cc) return '';
    try { displayNames[S.lang] = displayNames[S.lang] || new Intl.DisplayNames([S.lang], { type: 'region' }); return displayNames[S.lang].of(cc) || cc; }
    catch (e) { return cc; }
  }
  function countryOptions(sel) {
    const coll = new Intl.Collator(S.lang);
    return COUNTRIES.map((c) => [c, countryName(c)]).sort((x, y) => coll.compare(x[1], y[1]))
      .map((x) => `<option value="${x[0]}"${x[0] === sel ? ' selected' : ''}>${esc(x[1])}</option>`).join('');
  }
  function guessCountry() {
    const langs = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || ''];
    for (let i = 0; i < langs.length; i++) {
      const m = /-([A-Za-z]{2})$/.exec(langs[i]);
      if (m && COUNTRIES.indexOf(m[1].toUpperCase()) >= 0) return m[1].toUpperCase();
    }
    return '';
  }
  const compact = (p) => String(p || '').toUpperCase().replace(/[\s-]/g, '');
  function cleanPostal(cc, raw) {
    let v = String(raw || '').trim().toUpperCase().replace(/\s+/g, ' ');
    if (cc) v = v.replace(new RegExp('^' + cc + '[\\s-]?'), '');
    return v.slice(0, 10);
  }
  function validPostal(cc, v) {
    const c = compact(v); const re = POSTAL_FORMATS[cc];
    return re ? re.test(c) : /^[A-Z0-9]{2,10}$/.test(c);
  }

  // Wish-list matching: same ISBN, or the same title ignoring case, accents and punctuation.
  const norm = (x) => String(x || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
  const wishMatches = (w, b) => !!((w.isbn && b.isbn && w.isbn === b.isbn) || (norm(w.title) && norm(w.title) === norm(b.title)));
  function wishersOf(b) {
    const out = [];
    S.wishes.forEach((w) => { if (w.owner !== b.owner && wishMatches(w, b) && out.indexOf(w.owner) < 0) out.push(w.owner); });
    return out;
  }
  const iWant = (b) => b.owner !== MINE && S.wishes.some((w) => w.owner === MINE && wishMatches(w, b));
  const theyWant = (memberId, b) => S.wishes.some((w) => w.owner === memberId && wishMatches(w, b));
  function membersWantingMine() {
    const mine = S.books.filter((b) => b.owner === MINE && b.status === 'available');
    return Object.keys(MEMBERS).map((id) => ({ id: id, n: mine.filter((b) => theyWant(id, b)).length }))
      .filter((x) => x.n > 0).sort((a, b) => b.n - a.n || near(a.id).rank - near(b.id).rank);
  }

  // Location: country + postal code only. "Nearby" is a rough guess: same country, and postal
  // codes that are numerically close (or share the same district part, e.g. UK "SW1A").
  // The production version would use postcode centre points instead.
  const placeOf = (id) => (id === MINE ? (S.me || {}) : (MEMBERS[id] || {}));
  const postalOf = (id) => placeOf(id).postal || '';
  function near(id) {
    const me = placeOf(MINE); const o = placeOf(id);
    if (!o.postal) return { rank: 4, label: '' };
    const foreign = !!(o.country && me.country && o.country !== me.country);
    const label = o.postal + (foreign ? ', ' + countryName(o.country) : '');
    if (!me.postal || foreign) return { rank: 3, label: label };
    const a = compact(me.postal); const b = compact(o.postal);
    if (a === b) return { rank: 0, label: label + ' · ' + t('sameArea') };
    let d;
    if (/^\d+$/.test(a + b) && a.length === b.length) d = Math.abs(Number(a) - Number(b)) / (a.length <= 4 ? 50 : a.length === 5 ? 200 : 2000);
    else d = a.slice(0, Math.max(2, a.length - 3)) === b.slice(0, Math.max(2, b.length - 3)) ? 0.5 : 99;
    return d <= 1 ? { rank: 1 + d / 10, label: label + ' · ' + t('nearby') } : { rank: 2 + Math.min(d, 1e6) / 1e7, label: label };
  }
  const byNear = (a, b) => near(a.owner).rank - near(b.owner).rank || b.added - a.added;
  // Profile picture or initial
  function avatarHtml(id, size) {
    const m = id === MINE ? S.me : MEMBERS[id];
    const url = m && m.avatar;
    const cls = 'avatar' + (size === 'sm' ? ' sm' : size === 'xs' ? ' xs' : '');
    return url ? `<span class="${cls}"><img src="${esc(url)}" alt=""></span>` : `<span class="${cls}">${esc((memberName(id) || '?').slice(0, 1).toUpperCase())}</span>`;
  }
  // Ratings: 1–5 "little books"
  function ratingOf(id) {
    const rs = (S.reviews || []).filter((r) => r.to === id);
    return { n: rs.length, avg: rs.length ? rs.reduce((a, r) => a + r.rating, 0) / rs.length : 0, list: rs };
  }
  function booksRow(value, size) {
    const full = Math.round(value);
    let out = '';
    for (let i = 1; i <= 5; i++) out += `<span class="rb ${i <= full ? 'on' : ''}">${icon('logo', size || 16)}</span>`;
    return out;
  }
  function ratingHtml(id, size) {
    const r = ratingOf(id);
    if (!r.n) return `<span class="rating muted small">${esc(t('noRatings'))}</span>`;
    return `<span class="rating" role="img" aria-label="${esc(t('booksOutOf', { n: r.avg.toFixed(1) }))}">${booksRow(r.avg, size)}<span class="small bold">${r.avg.toFixed(1)}</span><span class="muted small">(${r.n})</span></span>`;
  }
  // Books that left a member's shelf, by kind of deal
  function dealCounts(id) {
    const gone = S.books.filter((b) => b.owner === id && b.status === 'gone');
    return { sold: gone.filter((b) => b.offer === 'sell').length, donated: gone.filter((b) => b.offer === 'give').length, swapped: gone.filter((b) => b.offer === 'swap').length };
  }
  function reviewsList(id) {
    const rs = ratingOf(id).list.slice().sort((a, b) => b.at - a.at).slice(0, 5);
    if (!rs.length) return `<p class="muted">${esc(t('noRatings'))}</p>`;
    return `<ul class="reviews">${rs.map((r) => `<li><div class="row-between"><span class="row-gap tight">${avatarHtml(r.from, 'xs')}<span class="bold small">${esc(firstName(r.from))}</span></span><span class="rating">${booksRow(r.rating, 14)}</span></div>
      ${r.comment ? `<p class="small">${esc(r.comment)}</p>` : ''}<div class="muted tiny">${esc(fmtDate(new Date(r.at)))}</div></li>`).join('')}</ul>`;
  }
  const countsHtml = (id) => {
    const c = dealCounts(id);
    return `<div class="deal-counts"><span><b>${c.sold}</b> ${esc(t('statSold'))}</span><span><b>${c.donated}</b> ${esc(t('statDonated'))}</span><span><b>${c.swapped}</b> ${esc(t('statSwapped'))}</span></div>`;
  };
  const memberLink = (id) => `<a class="ulink" href="#/member/${esc(id)}">${esc(memberName(id))}</a>`;
  function offerBadge(b) {
    if (b.status === 'reserved') return `<span class="badge b-res">${esc(t('reserved'))}</span>`;
    if (b.status === 'gone') return `<span class="badge b-res">${esc(t('gone'))}</span>`;
    if (b.offer === 'sell') return `<span class="badge b-sell">€${esc(b.price)}</span>`;
    if (b.offer === 'give') return `<span class="badge b-give">${esc(t('free'))}</span>`;
    return `<span class="badge b-swap">${esc(t('swap'))}</span>`;
  }
  function cover(b, size) {
    const tp = TOPIC[b.topics && b.topics[0]] || TOPICS[0];
    // Only the owner's own photos are shown – never a catalogue cover.
    const img = b.photo || (b.photos && b.photos[0]) || '';
    const lang = `<span class="lang-tag">${esc((b.lang || '').toUpperCase() || '·')}</span>`;
    if (img) {
      return `<div class="cover cover-${size}">${lang}<img src="${esc(img)}" alt="" loading="lazy"></div>`;
    }
    return `<div class="cover cover-${size}" style="background:${tp.color}">${lang}
      <div class="cover-icon">${icon(tp.icon, size === 'l' ? 84 : size === 'm' ? 52 : 40)}</div>
      <div class="cover-title">${esc(b.title)}</div></div>`;
  }
  function bookCard(b, size) {
    const loc = b.owner !== MINE && postalOf(b.owner) ? `<div class="book-loc">${icon('pin', 12)} ${esc(near(b.owner).label)}</div>` : '';
    const wish = iWant(b) ? `<span class="wish-dot" title="${esc(t('onYourWishlist'))}">${icon('heart', 14)}</span>` : '';
    return `<a class="book-card book-${size}" href="#/book/${esc(b.id)}" aria-label="${esc(b.title)}">
      ${cover(b, size === 'grid' ? 'm' : 's')}${wish}
      <div class="book-meta"><div class="book-title">${esc(b.title)}</div>
      <div class="book-author">${esc(b.author)}</div>${offerBadge(b)}${loc}</div></a>`;
  }

  // ---------- views ----------
  function viewOnboarding() {
    const langs = UI_LANGS.map((c) => `<button class="pill ${S.lang === c ? 'on' : ''}" data-action="setLang" data-v="${c}">${esc(STRINGS[c].langNames[c])}</button>`).join('');
    const interests = BOOK_LANGS.filter((c) => c !== 'other').map((c) => `<label class="check-pill ${S.interested.indexOf(c) >= 0 ? 'on' : ''}">
      <input type="checkbox" data-action="toggleInterest" data-v="${c}" ${S.interested.indexOf(c) >= 0 ? 'checked' : ''}> ${esc(langName(c))}</label>`).join('');
    return `<main class="onboard">
      <div class="lockup"><div class="logo-big">${icon('seku', 48)}</div><span class="wordmark">seku seku</span></div>
      ${LIVE && !S.me ? `<p class="step-label">${esc(t('step2of2'))}</p>` : ''}
      <h1>${esc(t('welcomeTitle'))}</h1>
      ${S.me ? `<div class="notice warn">${esc(S.agreed && S.agreed.version === TERMS.version ? t('profileIncomplete') : t('termsUpdated'))}</div>` : ''}
      <p class="lead">${esc(t('welcomeText'))}</p>

      <div class="field"><span class="label">${esc(t('appLanguage'))}</span><div class="row-wrap">${langs}</div></div>
      <div class="field"><span class="label">${esc(t('interestedLangs'))}</span><div class="row-wrap">${interests}</div></div>
      <label class="field"><span class="label">${esc(t('yourName'))}</span>
        <input id="onb-name" class="input" maxlength="40" autocomplete="nickname" value="${esc(ui.onbName || (S.me ? S.me.name : ''))}" data-input="onbName" placeholder="${esc(t('yourNamePh'))}"></label>
      <label class="field"><span class="label">${esc(t('country'))}</span>
        <select id="onb-country" class="input" autocomplete="country" data-change="onbCountry">
          <option value="">${esc(t('chooseCountry'))}</option>${countryOptions(ui.onbCountry)}</select></label>
      <label class="field"><span class="label">${esc(t('postal'))}</span>
        <input id="onb-postal" class="input" maxlength="10" autocomplete="postal-code" inputmode="text" value="${esc(ui.onbPostal || (S.me ? S.me.postal || '' : ''))}" data-input="onbPostal" placeholder="${esc(t('postalPh'))}"></label>
      <p class="muted small">${icon('pin', 14)} ${esc(t('postalHint'))}</p>
      <details class="card pad-m notif-setup" open><summary class="h3">${esc(t('notifSettings'))}</summary><p class="muted small">${esc(t('notifSettingsHint'))}</p>${prefsEditor(false)}</details>
      <div class="notice">${icon('shield', 20)} <span>${esc(t('p2pNote'))}</span></div>
      <label class="toggle agree"><input id="onb-agree" type="checkbox" data-action="toggleAgree" ${ui.onbAgree ? 'checked' : ''}>
        <span>${esc(t('acceptTerms'))} <a class="ulink" href="#/terms">${esc(t('termsLink'))}</a></span></label>
      ${ui.onbError ? `<div class="notice warn" role="alert">${esc(ui.onbError)}</div>` : ''}
      <button class="btn primary big" data-action="join" ${LIVE && live.busy ? 'disabled' : ''}>${esc(LIVE && live.busy ? t('loading') : (S.me ? t('continue') : t('join')))}</button>
      ${LIVE ? `<p class="muted small center">${esc(t('signedInAs', { email: live.email }))} · <button class="link small" data-action="signOut">${esc(t('signOut'))}</button></p>` : `<p class="muted small center">${esc(t('demoNote'))}</p>`}
    </main>`;
  }

  function onbGroupSection() {
    const mode = ui.onbMode || 'join';
    return `<div class="seg two" role="group">${[['join', 'joinWithCode'], ['start', 'startGroup']].map((m) =>
      `<button class="pill ${mode === m[0] ? 'on' : ''}" data-action="onbMode" data-v="${m[0]}" aria-pressed="${mode === m[0]}">${esc(t(m[1]))}</button>`).join('')}</div>
      ${mode === 'join'
        ? `<label class="field"><span class="label">${esc(t('inviteCode'))}</span>
            <input id="onb-code" class="input code-input" maxlength="12" autocomplete="off" autocapitalize="characters" value="${esc(live.invite || '')}" data-input="onbCode" placeholder="${esc(t('inviteCodePh'))}"></label>`
        : `<label class="field"><span class="label">${esc(t('groupNameLabel'))}</span>
            <input id="onb-group" class="input" maxlength="80" value="${esc(ui.onbGroup || '')}" data-input="onbGroup" placeholder="${esc(t('groupNamePh'))}"></label>`}`;
  }

  // What the platform is, before anyone signs up: free, scan + photo, how a swap works, and the usual questions.
  function langPills(cls) {
    return `<div class="row-wrap ${cls || ''}" role="group" aria-label="${esc(t('appLanguage'))}">${UI_LANGS.map((c) =>
      `<button class="pill small ${S.lang === c ? 'on' : ''}" data-action="setLang" data-v="${c}" aria-pressed="${S.lang === c}">${esc(STRINGS[c].langNames[c])}</button>`).join('')}</div>`;
  }
  // Hero: two homes, a book travelling between them along a dotted path (single-line style of the logo).
  const HERO_SVG = `<svg class="hero-art" viewBox="0 0 340 176" role="img" aria-hidden="true">
    <path d="M70 70 C 120 6, 220 6, 270 70" fill="none" stroke="#C9BFA9" stroke-width="2.5" stroke-linecap="round" stroke-dasharray="1 9"/>
    <g transform="translate(152 14) rotate(-14)"><rect x="0" y="0" width="34" height="42" rx="4" fill="#E3C16F"/><rect x="0" y="0" width="7" height="42" rx="3" fill="#C9A24C"/><path d="M13 13h14M13 20h10" stroke="#7A5B14" stroke-width="2.5" stroke-linecap="round"/></g>
    <path d="M196 30c3-4 9-1 6 4l-6 6-6-6c-3-5 3-8 6-4z" fill="#C77B6A"/>
    <path d="M128 36c2-3 7-1 5 3l-5 4-5-4c-2-4 3-6 5-3z" fill="#E3C16F"/>
    <g fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="3">
      <path d="M22 158V98l48-34 48 34v60" stroke="#5C7A61"/><path d="M222 158V98l48-34 48 34v60" stroke="#C77B6A"/>
    </g>
    <g><rect x="38" y="118" width="11" height="38" rx="2.5" fill="#A55A3F"/><rect x="52" y="112" width="11" height="44" rx="2.5" fill="#4E5B83"/><rect x="66" y="122" width="11" height="34" rx="2.5" fill="#E3C16F"/>
      <rect x="83" y="114" width="11" height="42" rx="2.5" fill="#4F7357" transform="rotate(12 88 156)"/></g>
    <g><rect x="240" y="116" width="11" height="40" rx="2.5" fill="#7D5A86"/><rect x="254" y="122" width="11" height="34" rx="2.5" fill="#3F716B"/>
      <rect x="268" y="112" width="11" height="44" rx="2.5" fill="#A0525B"/><rect x="284" y="120" width="11" height="36" rx="2.5" fill="#E3C16F" opacity=".35"/></g>
    <path d="M8 158h324" stroke="#2E2E2A" stroke-width="3" stroke-linecap="round"/>
  </svg>`;
  function introHtml(ctaAction) {
    const chips = t('freeChips').map((c) => `<span class="free-chip">${icon('check', 16)} ${esc(c)}</span>`).join('');
    const flow = t('flow').map((f, i) => `<li class="flow-step"><span class="flow-ic c${i}">${icon(f[0], 30)}</span><b>${esc(f[1])}</b><span>${esc(f[2])}</span></li>`).join('');
    const steps = t('how').map((h, i) => `<li class="how-step"><span class="how-ic c${i}">${icon(h[0], 24)}</span>
      <div><h3>${esc(h[1])}</h3><p>${esc(h[2])}</p></div></li>`).join('');
    const why = t('why').map((w) => `<li>${icon(w[0], 22)}<div><b>${esc(w[1])}</b><span>${esc(w[2])}</span></div></li>`).join('');
    const faq = t('faq').map((f) => `<details class="faq"><summary>${esc(f[0])}</summary><p>${esc(f[1])}</p></details>`).join('');
    const cta = `<button class="btn primary big" data-action="${ctaAction || 'toSignup'}">${esc(t('introCta'))}</button>`;
    return `<div class="intro-top"><div class="brand-row"><div class="logo">${icon('seku', 24)}</div><span class="wordmark small">seku seku</span></div>${langPills('langs-top')}</div>
      <div class="hero">${HERO_SVG}</div>
      <h1 class="intro-h">${esc(t('introTitle'))}</h1>
      <p class="lead">${esc(t('introLead'))}</p>
      <div class="free-chips">${chips}</div>
      ${cta}
      <section class="flow-sec" aria-labelledby="flow-h"><h2 id="flow-h">${esc(t('flowTitle'))}</h2><ol class="flow">${flow}</ol></section>
      <section aria-labelledby="how-h"><h2 id="how-h">${esc(t('howTitle'))}</h2><ol class="how-list">${steps}</ol></section>
      <section class="why" aria-labelledby="why-h"><h2 id="why-h">${esc(t('whyTitle'))}</h2><ul>${why}</ul></section>
      <section class="faqs" aria-labelledby="faq-h"><h2 id="faq-h">${esc(t('faqTitle'))}</h2>${faq}</section>`;
  }

  function viewIntro() { // demo mode: the same intro, then the profile form
    return `<main class="onboard intro">${introHtml('startSignup')}
      <button class="btn primary big" data-action="startSignup">${esc(t('introCta'))}</button></main>`;
  }

  function viewSignIn() {
    const step = live.authStep;
    if (step === 'email') {
      return `<main class="onboard intro">${introHtml()}
      <section id="signup" class="card pad-m signup">
        <p class="step-label">${esc(t('step1of2'))}</p>
        <h2>${esc(t('signupTitle'))}</h2>
        <p class="muted small">${esc(t('signupHint'))}</p>
        <form data-action-submit="sendCode">
          <label class="field"><span class="label">${esc(t('emailLabel'))}</span>
            <input id="si-email" class="input" type="email" required maxlength="200" autocomplete="email" inputmode="email" value="${esc(live.authEmail)}" placeholder="${esc(t('emailPh'))}"></label>
          <button class="btn primary big" type="submit" ${live.busy ? 'disabled' : ''}>${esc(live.busy ? t('loading') : t('sendCode'))}</button>
        </form>
        <p class="muted small">${esc(t('noPassword'))}</p>
        ${ui.onbError ? `<div class="notice warn" role="alert">${esc(ui.onbError)}</div>` : ''}
      </section>
      <p class="center"><a class="ulink" href="?demo=1">${esc(t('tryDemo'))}</a></p>
      <p class="muted small center"><a class="ulink" href="#/terms">${esc(t('viewTerms'))}</a></p>
    </main>`;
    }
    return `<main class="onboard">
      <div class="lockup"><div class="logo-big">${icon('seku', 48)}</div><span class="wordmark">seku seku</span></div>
      <p class="step-label">${esc(t('step1of2'))}</p>
      <h1>${esc(t('signupTitle'))}</h1>
      ${`
        <div class="notice ok">${icon('check', 20)} <span>${esc(t('checkEmail', { email: live.authEmail }))}</span></div>
        <form data-action-submit="verifyCode">
          <label class="field"><span class="label">${esc(t('codeLabel'))}</span>
            <input id="si-code" class="input code-input" inputmode="numeric" autocomplete="one-time-code" maxlength="10" placeholder="123456"></label>
          <button class="btn primary big" type="submit" ${live.busy ? 'disabled' : ''}>${esc(live.busy ? t('loading') : t('verify'))}</button>
        </form>
        <div class="row-between"><button class="link" data-action="otherEmail">${esc(t('otherEmail'))}</button><button class="link" data-action="resendCode">${esc(t('resend'))}</button></div>`}
      ${ui.onbError ? `<div class="notice warn" role="alert">${esc(ui.onbError)}</div>` : ''}
      <p class="muted small center"><a class="ulink" href="#/terms">${esc(t('viewTerms'))}</a></p>
    </main>`;
  }

  // First-run tour after sign-up: four short cards, shown once (replay from the profile).
  function tourSheet() {
    const steps = t('tour'); const n = steps.length; const i = Math.min(ui.tourStep || 0, n);
    const name = (S.me && S.me.name ? S.me.name.split(' ')[0] : '');
    const dots = `<div class="tour-dots" aria-hidden="true">${Array.from({ length: n + 1 }, (_, k) => `<span class="${k === i ? 'on' : ''}"></span>`).join('')}</div>`;
    let body;
    if (i === 0) {
      body = `<div class="tour-ic hello">${icon('seku', 44)}</div><h2 id="tour-h">${esc(t('tourHello', { name: name }))}</h2><p>${esc(t('tourIntro'))}</p>
        <ol class="tour-mini">${steps.map((st) => `<li>${icon(st[0], 18)} ${esc(st[1])}</li>`).join('')}</ol>`;
    } else {
      const st = steps[i - 1];
      body = `<p class="step-label">${esc(t('stepOf', { n: i, total: n }))}</p><div class="tour-ic">${icon(st[0], 40)}</div><h2 id="tour-h">${esc(st[1])}</h2><p>${esc(st[2])}</p>`;
    }
    const last = i === n;
    const buttons = last
      ? `<button class="btn primary big" data-action="tourAdd">${icon('barcode', 20)} ${esc(t('tourAddFirst'))}</button>
         <button class="btn ghost big" data-action="tourSkip">${esc(t('tourLookAround'))}</button>`
      : `<button class="btn primary big" data-action="tourNext">${esc(t('tourNext'))}</button>
         <div class="row-between">${i > 0 ? `<button class="link" data-action="tourBack">${esc(t('tourBack'))}</button>` : '<span></span>'}
         <button class="link" data-action="tourSkip">${esc(t('tourSkip'))}</button></div>`;
    return `<div class="sheet-bg"></div><div class="sheet tour" role="dialog" aria-modal="true" aria-labelledby="tour-h">${dots}<div class="tour-body">${body}</div>${buttons}</div>`;
  }

  function viewLoading() {
    return `<main class="onboard center-col"><div class="lockup"><div class="logo-big">${icon('seku', 48)}</div><span class="wordmark">seku seku</span></div><p class="muted bold">${esc(t('loading'))}</p></main>`;
  }

  function viewTerms() {
    const T = TERMS[S.lang] || TERMS.en;
    const contact = `<a class="ulink" href="${esc(TERMS.contact)}" target="_blank" rel="noopener noreferrer">${esc(TERMS.contact)}</a>`;
    return `<main class="pad terms">
      <button class="back" data-action="back">${icon('back', 20)} ${esc(t('back'))}</button>
      <h1 class="h1">${esc(T.title)}</h1>
      <p class="muted small">${esc(TERMS.version)}</p>
      <p class="lead">${esc(T.intro)}</p>
      ${T.sections.map((sec) => `<h2 class="h3">${esc(sec[0])}</h2><p>${esc(sec[1]).split('{contact}').join(contact)}</p>`).join('')}
    </main>`;
  }

  function header() {
    const langs = UI_LANGS.map((c) => `<button class="lang-btn ${S.lang === c ? 'on' : ''}" data-action="setLang" data-v="${c}" aria-label="${esc(STRINGS[c].langNames[c])}">${c.toUpperCase()}</button>`).join('');
    return `<header class="top"><a class="brand" href="#/">${'<span class="logo">' + icon('seku', 24) + '</span>'}
      <span><span class="brand-name">${esc(t('appName'))}</span><span class="brand-group">${esc(groupLabel())}</span></span></a>
      <div class="langs">${bellHtml()}${langs}</div></header>`;
  }

  function nav(route) {
    const unread = S.threads.filter((x) => x.unread).length;
    const items = [
      ['', 'navBrowse', 'books', 0], ['add', 'navAdd', 'plus', 0], ['requests', 'navRequests', 'bag', S.cart.length],
      ['messages', 'navMessages', 'chat', unread], ['profile', 'navProfile', 'user', 0]
    ];
    const active = (r) => (r === '' ? (route === '' || route === 'book') : (route === r || (r === 'messages' && route === 'chat')));
    return `<nav class="bottom">${items.map((it) => `<a href="#/${it[0]}" class="${active(it[0]) ? 'on' : ''}">
      <span class="nav-ic">${icon(it[2], 24)}${it[3] ? `<span class="count">${it[3]}</span>` : ''}</span>${esc(t(it[1]))}</a>`).join('')}</nav>`;
  }

  function viewBrowse() {
    const others = S.books.filter((b) => b.owner !== MINE && b.status !== 'gone' && !b.hidden);
    const q = ui.q.trim().toLowerCase();
    const filtered = others.filter((b) =>
      (ui.fLang === 'all' || b.lang === ui.fLang) &&
      (!ui.fTopic || b.topics.indexOf(ui.fTopic) >= 0) &&
      (!ui.fAge || b.age === ui.fAge) &&
      (!q || (b.title + ' ' + b.author).toLowerCase().indexOf(q) >= 0) &&
      (!ui.fNear || near(b.owner).rank < 2)).sort(byNear);
    const presentLangs = BOOK_LANGS.filter((c) => others.some((b) => b.lang === c));
    const langChips = ['all'].concat(presentLangs).map((c) => `<button class="pill ${ui.fLang === c ? 'on' : ''}" data-action="fLang" data-v="${c}">${esc(c === 'all' ? t('all') : langName(c))}</button>`).join('');
    const ageChips = AGES.map((a) => `<button class="pill ${ui.fAge === a ? 'on' : ''}" data-action="fAge" data-v="${a}">${esc(t('years', { a: a }))}</button>`).join('');
    const topics = TOPICS.map((tp) => `<button class="topic ${ui.fTopic === tp.id ? 'on' : ''}" data-action="fTopic" data-v="${tp.id}">
      <span class="topic-ic" style="background:${tp.color}">${icon(tp.icon, 32)}</span><span>${esc(topicName(tp.id))}</span></button>`).join('');
    const anyFilter = q || ui.fLang !== 'all' || ui.fTopic || ui.fAge || ui.fNear;
    let body;
    if (!anyFilter) {
      const recent = others.filter((b) => Date.now() - b.added < 7 * 86400000).sort((a, b) => b.added - a.added);
      const wishHits = others.filter((b) => b.status === 'available' && iWant(b)).sort(byNear);
      const wanters = membersWantingMine();
      body = (wishHits.length ? `<h2 class="h2 pad">${icon('heart', 20)} ${esc(t('fromWishlist'))}</h2><div class="hscroll">${wishHits.map((b) => bookCard(b, 'row')).join('')}</div>` : '') +
        (wanters.length ? `<h2 class="h2 pad">${icon('swapArrows', 20)} ${esc(t('wantYourBooks'))}</h2><div class="hscroll">${wanters.map((w) => `<a class="member-chip" href="#/member/${esc(w.id)}">
          ${avatarHtml(w.id, 'sm')}<span class="grow"><span class="bold block">${esc(firstName(w.id))}</span>
          <span class="small block">${esc(t('wantsCount', { n: w.n }))}</span><span class="tiny muted block">${icon('pin', 11)} ${esc(near(w.id).label)}</span></span></a>`).join('')}</div>` : '') +
        (recent.length ? `<h2 class="h2 pad">${esc(t('rowNew'))}</h2><div class="hscroll">${recent.map((b) => bookCard(b, 'row')).join('')}</div>` : '') +
        `<h2 class="h2 pad">${esc(t('rowAll'))}</h2><div class="grid pad">${others.slice().sort(byNear).map((b) => bookCard(b, 'grid')).join('')}</div>`;
    } else {
      body = `<div class="pad row-between"><span class="muted bold">${esc(t('results', { n: filtered.length }))}</span>
        <button class="link" data-action="clearFilters">${esc(t('clearFilters'))}</button></div>` +
        (filtered.length ? `<div class="grid pad">${filtered.map((b) => bookCard(b, 'grid')).join('')}</div>` : `<div class="card pad-m empty">${esc(t('noResults'))}</div>`);
    }
    return `<main>
      <div class="pad"><label class="search">${icon('search', 20)}<input id="q" type="search" value="${esc(ui.q)}" placeholder="${esc(t('searchPh'))}" aria-label="${esc(t('searchPh'))}" data-input="q"></label></div>
      <div class="pad near-row"><button class="pill ${ui.fNear ? 'on' : ''}" data-action="fNear" aria-pressed="${ui.fNear}">${icon('pin', 16)} ${esc(t('nearMe'))}${S.me.postal ? ' (' + esc(S.me.postal) + ')' : ''}</button></div>
      <div class="pad"><span class="label">${esc(t('bookLang'))}</span><div class="row-wrap">${langChips}</div></div>
      <div class="pad"><span class="label">${esc(t('topics'))}</span></div><div class="hscroll topics">${topics}</div>
      <div class="pad"><span class="label">${esc(t('ages'))}</span><div class="row-wrap">${ageChips}</div></div>
      ${body}</main>`;
  }

  function viewBook(id) {
    const b = book(id);
    if (!b) return `<main class="pad">${esc(t('noResults'))}</main>`;
    const inCart = S.cart.indexOf(b.id) >= 0;
    let actions;
    if (b.owner === MINE) actions = `<div class="notice">${esc(t('yourBook'))}</div>` + (b.status !== 'reserved' ? `<button class="btn ghost big" data-action="removeBook" data-v="${esc(b.id)}">${icon('trash', 20)} ${esc(t('removeListing'))}</button>` : '');
    else if (b.status !== 'available') actions = `<div class="notice">${offerBadge(b)}</div>`;
    else if (inCart) actions = `<a class="btn ok big" href="#/requests">${icon('check')} ${esc(t('inRequest'))}</a>`;
    else actions = `<button class="btn primary big" data-action="addCart" data-v="${esc(b.id)}">${icon('bag')} ${esc(t('addToRequest'))}</button>
      <button class="btn ghost big" data-action="requestNow" data-v="${esc(b.id)}">${esc(t('requestNow'))}</button>`;
    const more = S.books.filter((x) => x.owner === b.owner && x.id !== b.id && x.status === 'available');
    const topics = b.topics.map((id2) => `<span class="tchip" style="background:${TOPIC[id2] ? TOPIC[id2].color : '#555'}">${icon(TOPIC[id2] ? TOPIC[id2].icon : 'star', 16)} ${esc(topicName(id2))}</span>`).join('');
    const condKey = { new: 'condNew', good: 'condGood', worn: 'condWorn' }[b.cond] || 'condGood';
    return `<main class="pad">
      <button class="back" data-action="back">${icon('back', 20)} ${esc(t('back'))}</button>
      <div class="center-col">${cover(b, 'l')}</div>
      <h1 class="h1 center">${esc(b.title)}</h1>
      <div class="muted center bold">${esc(b.author)}</div>
      <div class="row-wrap center-row">${offerBadge(b)} ${topics}</div>
      ${(b.photos || []).length > 1 ? `<div class="gallery">${b.photos.map((ph, i) => `<img src="${esc(ph)}" alt="${esc(t('photoN', { n: i + 1 }))}" loading="lazy">`).join('')}</div>` : ''}
      ${iWant(b) ? `<div class="notice wish">${icon('heart', 20)} ${esc(t('onYourWishlist'))}</div>` : ''}
      ${b.owner === MINE && wishersOf(b).length ? `<div class="notice wish">${icon('heart', 20)} <span>${esc(t('wantedBy'))} ${wishersOf(b).map(memberLink).join(', ')}</span></div>` : ''}
      <div class="actions">${actions}</div>
      ${b.notes ? `<section class="card pad-m"><h2 class="h3">${esc(t('copyNotes'))}</h2><p class="desc">${esc(b.notes)}</p></section>` : ''}
      <section class="card pad-m"><h2 class="h3">${esc(t('description'))}</h2><p class="desc">${esc(b.description || t('noDescription'))}</p></section>
      <dl class="details card pad-m">
        <dt>${esc(t('owner'))}</dt><dd>${b.owner === MINE ? esc(memberName(b.owner)) : memberLink(b.owner) + '<br>' + ratingHtml(b.owner, 14)}</dd>
        ${b.owner !== MINE ? `<dt>${esc(t('location'))}</dt><dd>${icon('pin', 14)} ${esc(near(b.owner).label)}</dd>` : ''}
        <dt>${esc(t('language'))}</dt><dd>${esc(langName(b.lang))}</dd>
        <dt>${esc(t('age'))}</dt><dd>${esc(t('years', { a: b.age }))}</dd>
        <dt>${esc(t('condition'))}</dt><dd>${esc(t(condKey))}</dd>
        ${b.isbn ? `<dt>${esc(t('isbn'))}</dt><dd>${esc(b.isbn)}</dd>` : ''}
      </dl>
      ${b.owner !== MINE ? `<a class="btn ghost big" href="#/member/${esc(b.owner)}">${icon('swapArrows')} ${esc(t('tailored'))}</a>
        <div class="center"><button class="link small" data-action="openReport" data-type="book" data-v="${esc(b.id)}">${icon('flag', 14)} ${esc(t('reportBook'))}</button></div>` : ''}
      ${b.hidden ? `<div class="notice warn">${esc(t('hiddenBadge'))}</div>` : ''}
      ${isOrganiser() && b.owner !== MINE ? `<div class="center"><button class="link small" data-action="admHide" data-v="${esc(b.id)}" data-hide="${b.hidden ? '0' : '1'}">${esc(t(b.hidden ? 'unhideListing' : 'hideListing'))}</button></div>` : ''}
      ${more.length && b.owner !== MINE ? `<h2 class="h2">${esc(t('moreFrom', { name: firstName(b.owner) }))}</h2><div class="hscroll flush">${more.map((x) => bookCard(x, 'row')).join('')}</div>` : ''}
    </main>`;
  }

  function viewMember(id) {
    if (!MEMBERS[id]) return `<main class="pad">${esc(t('noResults'))}</main>`;
    const theirs = S.books.filter((b) => b.owner === id && b.status === 'available');
    const mine = S.books.filter((b) => b.owner === MINE && b.status === 'available');
    const wantFromMe = mine.filter((b) => theyWant(id, b));
    const iWantFromThem = theirs.filter(iWant);
    const ex = ui.ex[id] || (ui.ex[id] = { get: iWantFromThem.map((b) => b.id), give: wantFromMe.map((b) => b.id) });
    const sortFirst = (pred) => (a, b) => (pred(b) ? 1 : 0) - (pred(a) ? 1 : 0);
    const row = (b, side, flag) => `<label class="pick-row ${ex[side].indexOf(b.id) >= 0 ? 'on' : ''}">
        <input type="checkbox" data-action="exToggle" data-m="${esc(id)}" data-side="${side}" data-v="${esc(b.id)}" ${ex[side].indexOf(b.id) >= 0 ? 'checked' : ''}>
        ${cover(b, 'xs')}<span class="grow"><span class="bold block">${esc(b.title)}</span>${offerBadge(b)}
        ${flag ? `<span class="badge b-wish">${icon('heart', 12)} ${esc(flag)}</span>` : ''}</span></label>`;
    const theirWishes = S.wishes.filter((w) => w.owner === id);
    return `<main class="pad">
      <button class="back" data-action="back">${icon('back', 20)} ${esc(t('back'))}</button>
      <div class="row-gap">${avatarHtml(id)}
        <div><h1 class="h1 tight">${esc(memberName(id))}</h1><div class="muted bold">${icon('pin', 14)} ${esc(near(id).label)}</div>${ratingHtml(id)}</div></div>
      ${countsHtml(id)}
      <section class="card bundle">
        <div class="h3">${icon('swapArrows', 20)} ${esc(t('tailored'))}</div>
        <div class="muted small">${esc(t('tailoredHint'))}</div>
        <div class="label">${esc(t('youGet'))}</div>
        ${theirs.length ? theirs.slice().sort(sortFirst(iWant)).map((b) => row(b, 'get', iWant(b) ? t('onYourWishlist') : '')).join('') : `<div class="muted">${esc(t('nothingHere'))}</div>`}
        <div class="label">${esc(t('youGive'))}</div>
        ${mine.length ? mine.slice().sort(sortFirst((b) => theyWant(id, b))).map((b) => row(b, 'give', theyWant(id, b) ? t('onTheirWishlist') : '')).join('') : `<div class="muted">${esc(t('nothingHere'))}</div>`}
        <button class="btn primary big" data-action="propose" data-v="${esc(id)}">${icon('send')} ${esc(t('proposeExchange'))}</button>
      </section>
      <section class="card pad-m"><h2 class="h3">${icon('heart', 20)} ${esc(t('theirWishlist'))}</h2>
        ${theirWishes.length ? `<ul class="wish-list">${theirWishes.map((w) => {
          const have = mine.some((b) => wishMatches(w, b));
          return `<li><span class="grow"><span class="bold">${esc(w.title)}</span> <span class="muted small">${esc(w.author || '')}</span></span>${have ? `<span class="badge b-give">${icon('check', 12)} ${esc(t('yourBook'))}</span>` : ''}</li>`;
        }).join('')}</ul>` : `<div class="muted">${esc(t('nothingHere'))}</div>`}
      </section>
      <section class="card pad-m"><h2 class="h3">${esc(t('reviewsTitle'))}</h2>${reviewsList(id)}</section>
      <div class="center"><button class="link small" data-action="openReport" data-type="member" data-v="${esc(id)}">${icon('flag', 14)} ${esc(t('reportMember'))}</button></div>
      <h2 class="h2">${esc(t('theirShelf'))}</h2>
      ${theirs.length ? `<div class="grid">${theirs.map((b) => bookCard(b, 'grid')).join('')}</div>` : `<div class="card pad-m empty">${esc(t('nothingHere'))}</div>`}
    </main>`;
  }

  function viewRequests() {
    if (!S.cart.length) {
      return `<main class="pad"><h1 class="h1">${esc(t('requestsTitle'))}</h1>
        <div class="card pad-m empty">${esc(t('requestsEmpty'))}<br><a class="btn primary" href="#/">${esc(t('browseMore'))}</a></div></main>`;
    }
    const byOwner = {};
    S.cart.forEach((id) => { const b = book(id); if (b) (byOwner[b.owner] = byOwner[b.owner] || []).push(b); });
    const mine = S.books.filter((b) => b.owner === MINE && b.status === 'available');
    const bundles = Object.keys(byOwner).map((owner) => {
      const items = byOwner[owner];
      const meta = S.cartMeta[owner] || { offered: [], msg: null };
      const sum = items.filter((b) => b.offer === 'sell').reduce((a, b) => a + Number(b.price || 0), 0);
      const offerOpen = ui.showOffer[owner] || meta.offered.length > 0;
      return `<section class="card bundle">
        <div class="row-between"><a class="h3 ulink" href="#/member/${esc(owner)}">${esc(t('fromName', { name: memberName(owner) }))}</a><span class="muted small">${icon('pin', 12)} ${esc(near(owner).label)}</span></div>
        ${items.map((b) => `<div class="line-item">${cover(b, 'xs')}<div class="grow"><div class="bold">${esc(b.title)}</div>${offerBadge(b)}</div>
          <button class="icon-btn" data-action="removeCart" data-v="${esc(b.id)}" aria-label="${esc(t('remove'))}">${icon('x', 18)}</button></div>`).join('')}
        ${sum ? `<div class="bold">${esc(t('totalForSale', { sum: sum }))}</div>` : ''}
        ${mine.length ? `<label class="toggle"><input type="checkbox" data-action="toggleOffer" data-v="${esc(owner)}" ${offerOpen ? 'checked' : ''}> ${esc(t('offerInReturn'))}</label>` : ''}
        ${offerOpen ? `<div class="muted small">${esc(t('pickYours'))}</div><div class="row-wrap">${mine.slice().sort((a, b) => (theyWant(owner, b) ? 1 : 0) - (theyWant(owner, a) ? 1 : 0)).map((m) => `<label class="check-pill ${meta.offered.indexOf(m.id) >= 0 ? 'on' : ''}">
          <input type="checkbox" data-action="toggleOffered" data-owner="${esc(owner)}" data-v="${esc(m.id)}" ${meta.offered.indexOf(m.id) >= 0 ? 'checked' : ''}> ${esc(m.title)}${theyWant(owner, m) ? ` <span class="heart-inline" title="${esc(t('onTheirWishlist'))}">${icon('heart', 14)}</span>` : ''}</label>`).join('')}</div>` : ''}
        <label class="sr" for="msg-${esc(owner)}">${esc(t('messagePh'))}</label>
        <textarea id="msg-${esc(owner)}" class="input" rows="3" maxlength="500" placeholder="${esc(t('messagePh'))}" data-input="cartMsg" data-owner="${esc(owner)}">${esc(cartText(owner, items.map((b) => b.id), meta))}</textarea>
        <button class="btn primary big" data-action="sendRequest" data-v="${esc(owner)}">${icon('send')} ${esc(t('sendRequest'))}</button>
      </section>`;
    }).join('');
    return `<main class="pad"><h1 class="h1">${esc(t('requestsTitle'))}</h1>${bundles}</main>`;
  }

  const STATUS = { pending: 'stPending', accepted: 'stAccepted', scheduled: 'stScheduled', done: 'stDone', declined: 'stDeclined' };

  function viewMessages() {
    const isDone = (x) => x.status === 'done' || x.status === 'declined';
    const list = S.threads.filter((x) => (ui.chatTab === 'done') === isDone(x))
      .sort((a, b) => last(b).at - last(a).at);
    const tabs = ['active', 'done'].map((k) => `<button class="pill ${ui.chatTab === k ? 'on' : ''}" data-action="chatTab" data-v="${k}">${esc(t(k === 'active' ? 'tabActive' : 'tabDone'))}</button>`).join('');
    const items = list.map((th) => {
      const first = book(th.books[0]);
      const lm = last(th);
      return `<a class="thread ${th.unread ? 'unread' : ''}" href="#/chat/${esc(th.id)}">
        ${first ? cover(first, 'xs') : ''}
        <div class="grow"><div class="row-between"><span class="bold">${esc(memberName(th.with))}</span><span class="muted small">${esc(fmtTime(lm.at))}</span></div>
        <div class="muted small ellipsis">${esc(msgText(lm))}</div>
        <span class="status st-${th.status}">${esc(t(STATUS[th.status]))}</span></div></a>`;
    }).join('');
    return `<main class="pad"><h1 class="h1">${esc(t('messagesTitle'))}</h1><div class="row-wrap">${tabs}</div>
      ${items || `<div class="card pad-m empty">${esc(t('messagesEmpty'))}</div>`}</main>`;
  }
  const last = (th) => th.messages[th.messages.length - 1] || { at: 0, text: '' };

  function reviewBox(th) {
    const mine = (S.reviews || []).find((r) => r.request === th.id && r.from === MINE);
    const other = firstName(th.with);
    if (mine && !ui.editReview[th.id]) {
      return `<div class="review-box"><div class="small bold">${esc(t('youRated', { name: other }))}</div>
        <div class="row-between"><span class="rating">${booksRow(mine.rating, 20)}</span><button class="link small" data-action="editReview" data-v="${esc(th.id)}">${esc(t('editReview'))}</button></div>
        ${mine.comment ? `<p class="small">${esc(mine.comment)}</p>` : ''}</div>`;
    }
    const sel = ui.rating[th.id] || (mine ? mine.rating : 0);
    let picks = '';
    for (let i = 1; i <= 5; i++) picks += `<button class="rb-pick ${i <= sel ? 'on' : ''}" data-action="rateBooks" data-thread="${esc(th.id)}" data-v="${i}" aria-label="${esc(t('booksOutOf', { n: i }))}" aria-pressed="${i === sel}">${icon('logo', 30)}</button>`;
    return `<div class="review-box"><div class="h3">${esc(t('rateTitle', { name: other }))}</div>
      <div class="muted small">${esc(t('rateHint'))}</div>
      <div class="rb-picks" role="group">${picks}</div>
      <label class="sr" for="rv-${esc(th.id)}">${esc(t('reviewPh'))}</label>
      <textarea id="rv-${esc(th.id)}" class="input" rows="2" maxlength="300" placeholder="${esc(t('reviewPh'))}">${esc(mine ? mine.comment : '')}</textarea>
      <button class="btn primary" data-action="submitReview" data-v="${esc(th.id)}">${esc(t('submitReview'))}</button></div>`;
  }

  function viewChat(id) {
    const th = S.threads.find((x) => x.id === id);
    if (!th) return `<main class="pad">${esc(t('messagesEmpty'))}</main>`;
    if (th.unread) { th.unread = false; save(); if (LIVE) Backend.markRead(th.id); }
    const isOwner = th.role === 'owner';
    const other = firstName(th.with);
    const ticks = ui.ticks[th.id] || (ui.ticks[th.id] = th.books.slice());
    const bookLines = th.books.map((bid) => {
      const b = book(bid); if (!b) return '';
      const accepted = th.accepted.indexOf(bid) >= 0;
      const tick = isOwner && th.status === 'pending'
        ? `<input type="checkbox" class="tick" data-action="tick" data-thread="${esc(th.id)}" data-v="${esc(bid)}" ${ticks.indexOf(bid) >= 0 ? 'checked' : ''} aria-label="${esc(b.title)}">`
        : (accepted ? `<span class="ok-dot">${icon('check', 14)}</span>` : '');
      return `<div class="line-item">${tick}${cover(b, 'xs')}<div class="grow"><a class="bold" href="#/book/${esc(b.id)}">${esc(b.title)}</a><div>${offerBadge(b)}</div></div></div>`;
    }).join('');
    const offered = (th.offered || []).map((bid) => { const b = book(bid); return b ? `<div class="line-item">${cover(b, 'xs')}<div class="grow"><div class="bold">${esc(b.title)}</div></div></div>` : ''; }).join('');
    let control = '';
    if (th.status === 'pending') {
      control = isOwner
        ? `<div class="muted small">${esc(t('tickToAccept'))}</div><div class="row-gap">
            <button class="btn primary" data-action="acceptThread" data-v="${esc(th.id)}">${esc(t('acceptSelected'))}</button>
            <button class="btn ghost" data-action="declineThread" data-v="${esc(th.id)}">${esc(t('declineAll'))}</button></div>`
        : `<div class="notice">${esc(t('waitingFor', { name: other }))}</div>`;
    } else if (th.status === 'accepted') {
      control = `<div class="handover"><div class="h3">${icon('calendar', 20)} ${esc(t('handover'))}</div>
        <div class="row-gap"><label class="sr" for="hdate">${esc(t('handover'))}</label><input id="hdate" type="date" class="input" value="${nextSaturdayISO()}">
        <label class="sr" for="hwhere">${esc(t('handoverPh'))}</label><input id="hwhere" class="input grow" maxlength="60" value="${esc(t('handoverPh'))}"></div>
        <button class="btn primary" data-action="confirmHandover" data-v="${esc(th.id)}">${esc(t('confirmHandover'))}</button>
        <div class="muted small">${esc(t('reminderNote'))}</div></div>`;
    } else if (th.status === 'scheduled') {
      control = `<div class="handover"><div class="h3">${icon('calendar', 20)} ${esc(t('handoverSet', { when: fmtDate(new Date(th.handover.when)), where: th.handover.where }))}</div>
        <button class="btn primary" data-action="markDone" data-v="${esc(th.id)}">${icon('check')} ${esc(t('markDone'))}</button></div>`;
    } else if (th.status === 'done') {
      control = `<div class="notice ok">${icon('check')} ${esc(t('doneMsg'))}</div>` + reviewBox(th);
    } else {
      control = `<div class="notice">${esc(t('stDeclined'))}</div>`;
    }
    const msgs = th.messages.map((m) => m.from === 'system'
      ? `<div class="sys">${esc(msgText(m))}</div>`
      : `<div class="msg ${m.from === MINE ? 'mine' : ''}"><div class="bubble">${esc(m.text)}</div><div class="muted tiny">${esc(fmtTime(m.at))}</div></div>`).join('');
    const canChat = th.status !== 'declined';
    return `<main class="chat">
      <div class="chat-head pad"><button class="back" data-action="go" data-v="#/messages">${icon('back', 20)}</button>
        <div class="grow"><a class="bold ulink" href="#/member/${esc(th.with)}">${esc(memberName(th.with))}</a> <span class="muted small">${icon('pin', 12)} ${esc(near(th.with).label)}</span><br><span class="status st-${th.status}">${esc(t(STATUS[th.status]))}</span></div>
        <button class="icon-btn" data-action="openReport" data-type="request" data-v="${esc(th.id)}" aria-label="${esc(t('report'))}" title="${esc(t('report'))}">${icon('flag', 18)}</button></div>
      <section class="card bundle pinned">
        <div class="h3">${esc(isOwner ? t('theyWant', { name: other }) : t('youWant'))}</div>${bookLines}
        ${offered ? `<div class="h3">${esc(isOwner ? t('theyOffer') : t('youOffer'))}</div>${offered}` : ''}
        ${control}
        <div class="safety">${icon('shield', 16)} <span>${esc(t('p2pNote'))} <a class="ulink" href="#/terms">${esc(t('viewTerms'))}</a></span></div>
      </section>
      <div class="msgs">${msgs}</div>
      ${canChat ? `<div class="quick" role="group" aria-label="${esc(t('quickReplies'))}">${SekuChat.quickReplies(isOwner, th.status).map((k) => `<button class="pill" data-action="quick" data-thread="${esc(th.id)}" data-v="${k}">${esc(t(k))}</button>`).join('')}</div>
      <form class="composer" data-action-submit="sendMsg" data-v="${esc(th.id)}"><label class="sr" for="msgbox">${esc(t('typeMessage'))}</label>
        <input id="msgbox" class="input grow" maxlength="1000" autocomplete="off" placeholder="${esc(t('typeMessage'))}">
        <button class="btn primary" type="submit" aria-label="${esc(t('send'))}">${icon('send')}</button></form>` : ''}
    </main>`;
  }

  function viewAdd() {
    if (ui.addStep === 'done' && ui.lastWish) {
      const w = S.wishes.find((x) => x.id === ui.lastWish);
      const avail = w ? S.books.filter((b) => b.owner !== MINE && b.status === 'available' && wishMatches(w, b)).sort(byNear) : [];
      return `<main class="pad center-col"><div class="big-check wish">${icon('heart', 54)}</div>
        <h1 class="h1 center">${esc(t('wishSavedTitle'))}</h1><p class="muted bold center">${esc(t('wishSavedText'))}</p>
        ${avail.length ? `<div class="card pad-m full"><div class="h3">${esc(t('alreadyAvailable'))}</div><div class="grid">${avail.map((b) => bookCard(b, 'grid')).join('')}</div></div>` : ''}
        <button class="btn primary big" data-action="restartAdd">${esc(t('addAnother'))}</button>
        <a class="btn ghost big" href="#/profile">${esc(t('myWishlist'))}</a></main>`;
    }
    if (ui.addStep === 'done' && ui.lastSaved) {
      const nb = book(ui.lastSaved); const wishers = nb ? wishersOf(nb) : [];
      return `<main class="pad center-col"><div class="big-check">${icon('check', 58)}</div>
        <h1 class="h1">${esc(t('savedTitle'))}</h1><p class="muted bold">${esc(t('savedText'))}</p>
        ${wishers.length ? `<div class="notice wish full">${icon('heart', 20)} <span>${esc(t('wantedBy'))} ${wishers.map(memberLink).join(', ')}</span></div>` : ''}
        <button class="btn primary big" data-action="restartAdd">${esc(t('addAnother'))}</button>
        <a class="btn ghost big" href="#/book/${esc(ui.lastSaved)}">${esc(t('viewBook'))}</a></main>`;
    }
    if (ui.addStep === 'form' && ui.draft) return viewDraft();
    const msg = ui.addMsg ? `<div class="notice ${ui.addMsgKind}">${esc(ui.addMsg)}</div>` : '';
    const results = ui.searchResults.map((r, i) => `<button class="result" data-action="pickResult" data-v="${i}">
      <span class="ph">${icon('logo', 20)}</span>
      <span class="grow"><span class="bold block">${esc(r.title)}</span><span class="muted small block">${esc(r.author)}</span></span>
      <span class="lang-tag static">${esc((r.lang || '').toUpperCase())}</span></button>`).join('');
    return `<main class="pad">
      <h1 class="h1">${esc(t('addTitle'))}</h1>
      ${modeToggle()}
      <section class="card pad-m scan">
        <div class="h3">${icon('barcode', 22)} ${esc(t('scanTitle'))}</div>
        <p class="muted small">${esc(t('scanHint'))}</p>
        <div id="reader" class="reader ${ui.scanner ? 'live' : ''}"><div class="guide" aria-hidden="true"></div></div>
        ${ui.scanner ? `<p class="muted small center scan-tip">${esc(t('scanTips'))}</p>` : ''}
        ${ui.scanner
          ? `<button class="btn ghost big" data-action="stopCamera">${esc(t('stopCamera'))}</button>`
          : `<button class="btn primary big" data-action="startCamera">${icon('camera')} ${esc(t('startCamera'))}</button>`}
        <label class="btn ghost big file-btn">${icon('barcode', 20)} ${esc(t('photoOfBarcode'))}
          <input type="file" accept="image/*" capture="environment" class="sr" data-change="barcodePhoto"></label>
      </section>
      ${msg}
      ${ui.busy ? `<div class="notice">${esc(ui.busyIsbn ? t('searchingIsbn', { isbn: ui.busyIsbn }) : t('searching'))}</div>` : ''}
      <form class="row-gap" data-action-submit="lookupTyped"><label class="sr" for="isbn">${esc(t('orTypeIsbn'))}</label>
        <input id="isbn" class="input grow" inputmode="numeric" maxlength="17" placeholder="${esc(t('orTypeIsbn'))}: ${esc(t('isbnPh'))}">
        <button class="btn primary" type="submit">${esc(t('lookUp'))}</button></form>
      <form class="row-gap" data-action-submit="titleSearch"><label class="sr" for="tsearch">${esc(t('orSearchTitle'))}</label>
        <input id="tsearch" class="input grow" maxlength="80" placeholder="${esc(t('orSearchTitle'))}">
        <button class="btn ghost" type="submit">${icon('search', 20)}</button></form>
      <div class="results">${results}</div>
      <div class="center"><button class="link" data-action="manual">${esc(t('enterManually'))}</button></div>
    </main>`;
  }

  function modeToggle() {
    return `<div class="seg two" role="group">${[['shelf', 'addModeShelf', 'books'], ['wish', 'addModeWish', 'heart']].map((m) =>
      `<button class="pill ${ui.addMode === m[0] ? 'on' : ''}" data-action="addMode" data-v="${m[0]}" aria-pressed="${ui.addMode === m[0]}">${icon(m[2], 18)} ${esc(t(m[1]))}</button>`).join('')}</div>`;
  }

  function viewWishDraft() {
    const d = ui.draft;
    const msg = ui.addMsg ? `<div class="notice ${ui.addMsgKind}">${esc(ui.addMsg)}</div>` : '';
    return `<main class="pad">
      <button class="back" data-action="restartAdd">${icon('back', 20)} ${esc(t('back'))}</button>
      ${modeToggle()}${msg}
      <h1 class="h1">${esc(t('addModeWish'))}</h1>
      <div class="draft-top">
        <div class="grow col">
          <label class="label" for="d-title">${esc(t('title'))}</label><input id="d-title" class="input" maxlength="150" value="${esc(d.title)}" data-input="draft" data-field="title">
          <label class="label" for="d-author">${esc(t('author'))}</label><input id="d-author" class="input" maxlength="120" value="${esc(d.author)}" data-input="draft" data-field="author">
        </div>
      </div>
      ${d.isbn ? `<div class="muted small">ISBN ${esc(d.isbn)}</div>` : ''}
      <span class="label">${esc(t('language'))}</span>
      <div class="row-wrap">${BOOK_LANGS.map((c) => `<button class="pill ${d.lang === c ? 'on' : ''}" data-action="dLang" data-v="${c}">${esc(langName(c))}</button>`).join('')}</div>
      <button class="btn primary big" data-action="saveWish">${icon('heart')} ${esc(t('saveWish'))}</button>
    </main>`;
  }

  function viewDraft() {
    if (ui.addMode === 'wish') return viewWishDraft();
    const d = ui.draft;
    const chip = (on) => `pill ${on ? 'on' : ''}`;
    const msg = ui.addMsg ? `<div class="notice ${ui.addMsgKind}">${esc(ui.addMsg)}</div>` : '';
    const photoTiles = d.photos.map((ph, i) => `<div class="ph-tile"><img src="${esc(ph)}" alt="${esc(t('photoN', { n: i + 1 }))}">
        <button class="ph-x" data-action="removePhoto" data-v="${i}" aria-label="${esc(t('removePhoto'))}">${icon('x', 14)}</button></div>`).join('');
    const addTile = d.photos.length < MAX_PHOTOS ? `<label class="ph-tile ph-add">${icon('camera', 26)}<span>${esc(t('photoAdd'))}</span>
        <input type="file" accept="image/*" capture="environment" class="sr" data-change="photo"></label>` : '';
    return `<main class="pad">
      <button class="back" data-action="restartAdd">${icon('back', 20)} ${esc(t('back'))}</button>
      ${modeToggle()}${msg}
      <h1 class="h1">${esc(t('review'))}</h1>
      <div class="draft-top">
        <div class="grow col">
          <label class="label" for="d-title">${esc(t('title'))}</label><input id="d-title" class="input" maxlength="150" value="${esc(d.title)}" data-input="draft" data-field="title">
          <label class="label" for="d-author">${esc(t('author'))}</label><input id="d-author" class="input" maxlength="120" value="${esc(d.author)}" data-input="draft" data-field="author">
        </div>
      </div>
      <span class="label">${esc(t('photosLabel', { max: MAX_PHOTOS }))} *</span>
      <div class="ph-strip">${photoTiles}${addTile}</div>
      <p class="muted small ph-hint">${icon('shield', 14)} ${esc(t('photosHint'))}</p>
      ${d.photos.length ? `<div class="muted tiny">${icon('check', 12)} ${esc(t('photoClean'))}</div>` : ''}
      <label class="label" for="d-notes">${esc(t('copyNotes'))}</label>
      <textarea id="d-notes" class="input" rows="2" maxlength="300" placeholder="${esc(t('copyNotesPh'))}" data-input="draft" data-field="notes">${esc(d.notes || '')}</textarea>
      <label class="label" for="d-desc">${esc(t('description'))}</label>
      <textarea id="d-desc" class="input" rows="5" maxlength="3000" placeholder="${esc(t('descPh'))}" data-input="draft" data-field="description">${esc(d.description)}</textarea>
      ${d.isbn ? `<div class="muted small">ISBN ${esc(d.isbn)}</div>` : ''}
      <span class="label">${esc(t('language'))}</span>
      <div class="row-wrap">${BOOK_LANGS.map((c) => `<button class="${chip(d.lang === c)}" data-action="dLang" data-v="${c}">${esc(langName(c))}</button>`).join('')}</div>
      <span class="label">${esc(t('topicsSuggested'))}</span>
      <div class="row-wrap">${TOPICS.map((tp) => { const on = d.topics.indexOf(tp.id) >= 0; return `<button class="pill ${on ? 'on' : ''}" ${on ? `style="background:${tp.color};border-color:${tp.color}"` : ''} data-action="dTopic" data-v="${tp.id}">${icon(tp.icon, 16)} ${esc(topicName(tp.id))}</button>`; }).join('')}</div>
      <span class="label">${esc(t('age'))}</span>
      <div class="row-wrap">${AGES.map((a) => `<button class="${chip(d.age === a)}" data-action="dAge" data-v="${a}">${esc(t('years', { a: a }))}</button>`).join('')}</div>
      <span class="label">${esc(t('condition'))}</span>
      <div class="row-wrap">${[['new', 'condNew'], ['good', 'condGood'], ['worn', 'condWorn']].map((c) => `<button class="${chip(d.cond === c[0])}" data-action="dCond" data-v="${c[0]}">${esc(t(c[1]))}</button>`).join('')}</div>
      <span class="label">${esc(t('offerQ'))}</span>
      <div class="seg">${[['swap', 'oSwap'], ['sell', 'oSell'], ['give', 'oGive']].map((o) => `<button class="${chip(d.offer === o[0])}" data-action="dOffer" data-v="${o[0]}">${esc(t(o[1]))}</button>`).join('')}</div>
      ${d.offer === 'sell' ? `<label class="row-gap price"><span class="label">${esc(t('price'))}</span><input class="input" inputmode="decimal" maxlength="6" value="${esc(d.price)}" data-input="draft" data-field="price"></label>` : ''}
      <button class="btn primary big" data-action="saveDraft">${esc(t('save'))}</button>
    </main>`;
  }

  function viewProfile() {
    const mine = S.books.filter((b) => b.owner === MINE);
    const given = mine.filter((b) => b.status === 'gone');
    const freeGiven = given.filter((b) => b.offer === 'give').length;
    const saved = S.received.reduce((a, r) => a + (r.offer === 'sell' ? Number(r.price || 0) : 5), 0);
    const all = mine.concat(S.received);
    const langCount = {}; all.forEach((b) => { langCount[b.lang] = (langCount[b.lang] || 0) + 1; });
    const total = all.length || 1;
    const langBars = Object.keys(langCount).sort((a, b) => langCount[b] - langCount[a]).map((c) => {
      const pct = Math.round(langCount[c] * 100 / total);
      return `<div class="bar-row"><span class="bar-label">${esc(langName(c))}</span><span class="bar"><span style="width:${pct}%"></span></span><span class="bold small">${pct}%</span></div>`;
    }).join('');
    const topicCount = {}; all.forEach((b) => (b.topics || []).forEach((x) => { topicCount[x] = (topicCount[x] || 0) + 1; }));
    const top = Object.keys(topicCount).sort((a, b) => topicCount[b] - topicCount[a]).slice(0, 3)
      .map((x) => `<span class="tchip" style="background:${TOPIC[x] ? TOPIC[x].color : '#555'}">${icon(TOPIC[x] ? TOPIC[x].icon : 'star', 16)} ${esc(topicName(x))}</span>`).join('');
    const doneSwaps = S.threads.filter((x) => x.status === 'done').length;
    const badges = [
      ['bStarter', mine.length >= 1], ['bFirst', doneSwaps >= 1], ['bPoly', Object.keys(langCount).length >= 3],
      ['bGiver', freeGiven >= 3], ['bTen', given.length >= 10]
    ].map((b) => `<span class="badge-big ${b[1] ? 'earned' : ''}">${icon('star', 26)}<span>${esc(t(b[0]))}</span></span>`).join('');
    const myWishes = S.wishes.filter((w) => w.owner === MINE);
    const stat = (n, k) => `<div class="stat"><div class="stat-n">${esc(n)}</div><div class="stat-l">${esc(t(k))}</div></div>`;
    return `<main class="pad">
      <div class="row-gap"><label class="avatar-edit" title="${esc(t('changeAvatar'))}">${avatarHtml(MINE)}<span class="avatar-cam">${icon('camera', 14)}</span>
          <input type="file" accept="image/*" class="sr" data-change="avatar" aria-label="${esc(t('changeAvatar'))}"></label>
        <div><h1 class="h1 tight">${esc(S.me.name)}</h1><div class="muted small">${icon('pin', 12)} ${esc((S.me.postal || '') + ', ' + countryName(S.me.country))}</div></div></div>
      ${!S.me.avatar ? `<p class="muted small">${icon('camera', 14)} ${esc(t('avatarHint'))}</p>` : ''}
      <div class="my-rating">${ratingHtml(MINE, 18)}</div>
      <div class="stats six">${stat(mine.length, 'statListed')}${stat(dealCounts(MINE).sold, 'statSold')}${stat(dealCounts(MINE).donated, 'statDonated')}${stat(dealCounts(MINE).swapped, 'statSwapped')}${stat(S.received.length, 'statReceived')}${stat('€' + saved, 'statSaved')}</div>
      <div class="muted tiny">${esc(t('statsPrivate'))}</div>
      <section class="card pad-m"><h2 class="h3">${esc(t('reviewsTitle'))}</h2>${reviewsList(MINE)}</section>
      ${langBars ? `<section class="card pad-m"><h2 class="h3">${esc(t('langMix'))}</h2>${langBars}</section>` : ''}
      ${top ? `<section class="card pad-m"><h2 class="h3">${esc(t('topTopics'))}</h2><div class="row-wrap">${top}</div></section>` : ''}
      <section class="card pad-m"><h2 class="h3">${esc(t('badges'))}</h2><div class="badges">${badges}</div></section>
      <section class="card pad-m"><h2 class="h3">${icon('pin', 20)} ${esc(t('location'))}</h2>
        <label class="label" for="p-country">${esc(t('country'))}</label>
        <select id="p-country" class="input" autocomplete="country">${countryOptions(S.me.country)}</select>
        <label class="label" for="p-postal">${esc(t('postal'))}</label>
        <div class="row-gap tight-top"><input id="p-postal" class="input" maxlength="10" autocomplete="postal-code" value="${esc(S.me.postal || '')}">
          <button class="btn primary" data-action="savePostal">${esc(t('savePostal'))}</button></div>
        <div class="muted small">${esc(t('postalHint'))}</div></section>
      <section class="card pad-m"><h2 class="h3">${icon('heart', 20)} ${esc(t('myWishlist'))}</h2>
        ${myWishes.length ? `<ul class="wish-list">${myWishes.map((w) => {
          const avail = S.books.filter((b) => b.owner !== MINE && b.status === 'available' && wishMatches(w, b));
          return `<li><span class="grow"><span class="bold">${esc(w.title)}</span> <span class="muted small">${esc(w.author || '')}</span>
            ${avail.length ? `<a class="badge b-give" href="#/book/${esc(avail[0].id)}">${icon('check', 12)} ${esc(t('alreadyAvailable'))} ${esc(firstName(avail[0].owner))}</a>` : ''}</span>
            <button class="icon-btn" data-action="removeWish" data-v="${esc(w.id)}" aria-label="${esc(t('remove'))}">${icon('x', 16)}</button></li>`;
        }).join('')}</ul>` : `<p class="muted">${esc(t('wishEmpty'))}</p>`}
        <button class="btn ghost" data-action="addWish">${icon('plus', 20)} ${esc(t('addWish'))}</button></section>
      <section class="card pad-m" id="notif-settings"><h2 class="h3">${esc(t('notifSettings'))}</h2><p class="muted small">${esc(t('notifSettingsHint'))}</p>${prefsEditor(isOrganiser())}
        <button class="btn primary" data-action="savePrefs">${esc(t('saveSettings'))}</button></section>
      ${isOrganiser() ? `<a class="btn ghost big" href="#/admin">${icon('shield', 20)} ${esc(t('openAdmin'))}</a>` : ''}
      <h2 class="h2">${esc(t('myShelf'))}</h2>
      ${mine.length ? `<div class="grid">${mine.map((b) => bookCard(b, 'grid')).join('')}</div>` : `<div class="card pad-m empty">${esc(t('shelfEmpty'))}</div>`}
      <section class="card pad-m"><h2 class="h3">${esc(t('settings'))}</h2>
        <p class="muted small">${esc(t('privacy'))}</p>
        <a class="btn ghost" href="#/terms">${icon('doc', 20)} ${esc(t('viewTerms'))}</a>
        ${S.agreed ? `<p class="muted tiny center">${esc(t('acceptedOn', { date: fmtDate(new Date(S.agreed.at)) }))}</p>` : ''}
        <button class="btn ghost" data-action="tourReplay">${icon('doc', 20)} ${esc(t('howItWorks'))}</button>
        <button class="btn ghost" data-action="exportData">${icon('download', 20)} ${esc(t('exportData'))}</button>
        ${LIVE ? `<p class="muted small">${esc(t('signedInAs', { email: live.email }))}</p><button class="btn ghost" data-action="signOut">${esc(t('signOut'))}</button>` : ''}
        <button class="btn danger" data-action="deleteAll">${icon('trash', 20)} ${esc(LIVE ? t('leaveGroup') : t('deleteAccount'))}</button></section>
    </main>`;
  }

  // ---------- render ----------
  function route() {
    const h = location.hash || '#/';
    if (h.indexOf('#/') !== 0) return { name: '', id: null }; // e.g. sign-in tokens in the URL
    const parts = h.slice(2).split('/');
    return { name: parts[0] || '', id: parts[1] ? decodeURIComponent(parts[1]) : null };
  }
  let lastRoute = null;
  function render() {
    if (!S.notifPrefs) S.notifPrefs = DEFAULT_PREFS();
    if (!S.notifications) S.notifications = [];
    if (!S.reports) S.reports = [];
    document.documentElement.lang = S.lang;
    document.title = t('appName');
    const r = route();
    if (ui.scanner && r.name !== 'add') stopCamera();
    const routeChanged = lastRoute !== r.name + '/' + r.id;
    lastRoute = r.name + '/' + r.id;
    const active = document.activeElement;
    const focusId = active && active.id;
    const sel = focusId && active.setSelectionRange ? [active.selectionStart, active.selectionEnd] : null;
    let body;
    if (r.name === 'join' && r.id) { live.invite = r.id.toUpperCase().slice(0, 12); ui.onbMode = 'join'; }
    if (LIVE && !live.ready) body = viewLoading();
    else if (LIVE && !live.uid) body = r.name === 'terms' ? viewTerms() : viewSignIn();
    else if (needsOnboarding()) body = r.name === 'terms' ? viewTerms() : (!LIVE && !S.me && !ui.introDone ? viewIntro() : viewOnboarding());
    else {
      const v = { '': viewBrowse, book: () => viewBook(r.id), requests: viewRequests, messages: viewMessages,
        chat: () => viewChat(r.id), add: viewAdd, profile: viewProfile, member: () => viewMember(r.id), terms: viewTerms,
        notifications: viewNotifications, admin: () => viewAdmin(r.id), platform: () => viewAdmin('admins') }[r.name] || viewBrowse;
      body = header() + v() + nav(r.name);
      if (!S.toured && r.name === '') body += tourSheet();
    }
    $app.innerHTML = body + reportSheet() + (ui.toast ? `<div class="toast" role="status">${esc(ui.toast)}</div>` : '');
    if (routeChanged && r.name === 'profile' && r.id === 'notifications') { const el = document.getElementById('notif-settings'); if (el) el.scrollIntoView(); }
    if (focusId && !routeChanged) {
      const el = document.getElementById(focusId);
      if (el) { el.focus(); if (sel && el.setSelectionRange) try { el.setSelectionRange(sel[0], sel[1]); } catch (e) {} }
    }
    if (routeChanged) {
      window.scrollTo(0, 0);
      if (r.name === 'chat') { const m = document.querySelector('.msgs'); if (m) m.lastElementChild && m.lastElementChild.scrollIntoView({ block: 'end' }); }
    }
    if (scan.video && r.name === 'add') {
      const slot = document.getElementById('reader');
      if (slot) { slot.prepend(scan.video); scan.video.play().catch(() => {}); }
    }
  }
  window.addEventListener('hashchange', render);

  let toastTimer;
  function toast(msg) {
    ui.toast = msg; render();
    clearTimeout(toastTimer); toastTimer = setTimeout(() => { ui.toast = ''; render(); }, 2600);
  }
  const go = (hash) => { if (location.hash === hash) render(); else location.hash = hash; };

  // ---------- requests & chat logic ----------
  // Block obvious attempts to share copies of books in chat (files and file-sharing links).
  // A simple guard, not a guarantee – reports and moderation remain the main tool.
  const COPY_PATTERNS = /\.(pdf|epub|mobi|azw3?|djvu|cbz|cbr|fb2)(\b|$)|drive\.google|docs\.google|dropbox|wetransfer|mega\.nz|mediafire|z-?lib|libgen|annas-archive|scribd|t\.me\//i;
  const looksLikeCopySharing = (text) => COPY_PATTERNS.test(text);
  function sysMsg(th, key, vars) { th.messages.push({ from: 'system', key: key, vars: vars || {}, text: '', at: Date.now() }); }
  function msgText(m) {
    if (!m.key) return m.text || '';
    const v = Object.assign({}, m.vars);
    if (v.name === MINE) v.name = S.me ? S.me.name.split(' (')[0] : '';
    else if (v.name) v.name = firstName(v.name);
    if (v.when) v.when = fmtDate(new Date(v.when));
    return t(m.key, v);
  }
  // The automatic request message names the books and asks one question (does this Saturday work?),
  // which the owner's quick replies answer. meta.msg == null means "not edited, use the automatic text".
  function autoRequestMsg(owner, ids, offered) {
    const items = ids.map(book).filter(Boolean);
    const offeredBooks = (offered || []).map(book).filter(Boolean);
    return SekuChat.requestMsg(t, {
      name: firstName(owner),
      titles: items.map((b) => b.title),
      offeredTitles: offeredBooks.map((b) => b.title),
      offeredWished: offeredBooks.some((b) => theyWant(owner, b)),
      sellSum: items.filter((b) => b.offer === 'sell').reduce((a, b) => a + Number(b.price || 0), 0),
      day: new Intl.DateTimeFormat(S.lang, { day: 'numeric', month: 'long' }).format(new Date(nextSaturdayISO() + 'T12:00:00'))
    });
  }
  function cartText(owner, ids, meta) {
    // Older saved carts hold the old fixed default text; treat it as not edited.
    if (meta.msg == null || meta.msg === t('defaultMsg')) return autoRequestMsg(owner, ids, meta.offered);
    return meta.msg;
  }
  function setStatus(ids, status) { ids.forEach((id) => { const b = book(id); if (b) b.status = status; }); }

  function sendRequest(owner) {
    if (LIVE) return liveSendRequest(owner);
    const ids = S.cart.filter((id) => { const b = book(id); return b && b.owner === owner; });
    if (!ids.length) return;
    const meta = S.cartMeta[owner] || { offered: [], msg: null };
    const th = { id: uid('t'), with: owner, role: 'requester', books: ids, offered: meta.offered.slice(), accepted: [], status: 'pending',
      handover: null, unread: false, messages: [] };
    const text = cartText(owner, ids, meta).trim();
    if (text) th.messages.push({ from: MINE, text: text, at: Date.now() });
    else sysMsg(th, 'sendRequest');
    S.threads.push(th);
    S.cart = S.cart.filter((id) => ids.indexOf(id) < 0);
    delete S.cartMeta[owner];
    save();
    toast(t('sent'));
    go('#/chat/' + th.id);
    // Prototype only: simulate the owner accepting after a moment.
    setTimeout(() => {
      const cur = S.threads.find((x) => x.id === th.id);
      if (!cur || cur.status !== 'pending') return;
      cur.messages.push({ from: owner, text: t('autoReply'), at: Date.now() });
      cur.accepted = cur.books.slice();
      cur.status = 'accepted';
      setStatus(cur.accepted, 'reserved');
      setStatus(cur.offered, 'reserved');
      sysMsg(cur, 'sysAccepted', { name: owner });
      S.notifications.unshift({ id: uid('n'), type: 'request_answered', data: { request_id: cur.id, actor: owner, status: 'accepted' }, at: Date.now(), read: false });
      cur.unread = route().name !== 'chat' || route().id !== cur.id;
      save(); render();
    }, 2500);
  }

  function finishThread(th) {
    th.status = 'done';
    // Books that leave their owner's shelf
    const fromOwner = th.accepted; const fromRequester = th.offered || [];
    const iGive = th.role === 'owner' ? fromOwner : fromRequester;
    const iGet = th.role === 'owner' ? fromRequester : fromOwner;
    setStatus(iGive, 'gone');
    iGet.forEach((id) => {
      const b = book(id); if (!b) return;
      b.status = 'gone';
      S.received.push({ title: b.title, lang: b.lang, topics: b.topics, offer: b.offer, price: b.price, at: Date.now() });
    });
    sysMsg(th, 'sysDone');
  }

  // ---------- book lookup ----------
  function cleanIsbn(s) { return String(s || '').toUpperCase().replace(/[^0-9X]/g, ''); }
  function mapLang(code) { const c = (code || '').slice(0, 2).toLowerCase(); return BOOK_LANGS.indexOf(c) >= 0 ? c : 'other'; }
  function suggestTopics(text) {
    // Short keywords must be whole words ("pet" matches "pets", not "petit");
    // longer ones are word stems ("dinosaur" matches "dinosaurs").
    const s = ' ' + norm(text) + ' ';
    const hit = (k) => { k = norm(k); return k.length <= 4 ? new RegExp(' ' + k + '(s|es)? ').test(s) : s.indexOf(' ' + k) >= 0; };
    return TOPICS.filter((tp) => tp.keywords.some(hit)).slice(0, 3).map((tp) => tp.id);
  }
  function fromGoogle(item) {
    const v = item.volumeInfo || {};
    const ids = v.industryIdentifiers || [];
    const isbn = (ids.find((x) => x.type === 'ISBN_13') || ids.find((x) => x.type === 'ISBN_10') || {}).identifier || '';
    return {
      isbn: cleanIsbn(isbn), title: [v.title, v.subtitle].filter(Boolean).join(': '), author: (v.authors || []).join(', '),
      description: htmlToText(v.description || ''), lang: mapLang(v.language),
      topics: suggestTopics((v.categories || []).join(' ') + ' ' + (v.title || '') + ' ' + (v.description || '')),
      id: item.id || '', source: 'Google Books'
    };
  }
  async function fetchJson(url) {
    const ctl = new AbortController(); const timer = setTimeout(() => ctl.abort(), 8000);
    try { const r = await fetch(url, { signal: ctl.signal, referrerPolicy: 'no-referrer' }); if (!r.ok) throw new Error(r.status); return await r.json(); }
    finally { clearTimeout(timer); }
  }
  // ISBN-13 (978…) → ISBN-10, because some catalogues only index the old 10-digit form.
  function isbn13to10(isbn) {
    if (isbn.length !== 13 || isbn.indexOf('978') !== 0) return '';
    const core = isbn.slice(3, 12); let sum = 0;
    for (let i = 0; i < 9; i++) sum += (10 - i) * Number(core[i]);
    const c = (11 - (sum % 11)) % 11;
    return core + (c === 10 ? 'X' : String(c));
  }
  function isbn10to13(isbn) {
    if (isbn.length !== 10) return isbn;
    const core = '978' + isbn.slice(0, 9); let sum = 0;
    for (let i = 0; i < 12; i++) sum += Number(core[i]) * (i % 2 ? 3 : 1);
    return core + String((10 - (sum % 10)) % 10);
  }
  // Open Library uses 3-letter language codes.
  const OL_LANG = { lit: 'lt', spa: 'es', eng: 'en', dan: 'da', fre: 'fr', fra: 'fr', ger: 'de', deu: 'de', pol: 'pl', rus: 'ru', ukr: 'uk', swe: 'sv', nor: 'no', nob: 'no', ita: 'it', por: 'pt', lav: 'lv' };
  const tryJson = (url) => fetchJson(url).catch(() => null);

  async function googleByIsbn(isbn13, isbn10) {
    const pick = (g) => (g && g.items && g.items.length ? fromGoogle(g.items[0]) : null);
    return pick(await tryJson('https://www.googleapis.com/books/v1/volumes?q=isbn:' + isbn13))
      || (isbn10 && pick(await tryJson('https://www.googleapis.com/books/v1/volumes?q=isbn:' + isbn10)))
      || pick(await tryJson('https://www.googleapis.com/books/v1/volumes?q=' + isbn13));
  }
  async function openLibraryByIsbn(isbn13, isbn10) {
    // a) the "books" API (edition record)
    const keys = ['ISBN:' + isbn13].concat(isbn10 ? ['ISBN:' + isbn10] : []);
    const o = await tryJson('https://openlibrary.org/api/books?format=json&jscmd=data&bibkeys=' + keys.join(','));
    const d = o && (o[keys[0]] || o[keys[1]]);
    // b) the search index (much larger coverage, has languages and the work id for a description)
    const sr = await tryJson('https://openlibrary.org/search.json?limit=1&fields=key,title,subtitle,author_name,language,subject&q=isbn:' + isbn13);
    const doc = sr && sr.docs && sr.docs[0];
    if (!d && !doc) return null;
    const subjects = ((d && d.subjects) || []).map((x) => x.name).concat((doc && doc.subject) || []).slice(0, 40).join(' ');
    const title = (d && d.title) || (doc && [doc.title, doc.subtitle].filter(Boolean).join(': ')) || '';
    const author = (d && d.authors ? d.authors.map((a) => a.name).join(', ') : '') || (doc && doc.author_name ? doc.author_name.slice(0, 3).join(', ') : '');
    const langs = (doc && doc.language) || [];
    const lang = langs.length === 1 && OL_LANG[langs[0]] ? OL_LANG[langs[0]] : 'other';
    // Description: the edition record first, then the work record.
    let description = '';
    const ed = await tryJson('https://openlibrary.org/isbn/' + isbn13 + '.json');
    if (ed && ed.description) description = typeof ed.description === 'string' ? ed.description : (ed.description.value || '');
    if (!description && doc && doc.key && /^\/works\/OL\d+W$/.test(doc.key)) {
      const w = await tryJson('https://openlibrary.org' + doc.key + '.json');
      if (w && w.description) description = typeof w.description === 'string' ? w.description : (w.description.value || '');
    }
    return { title: title, author: author, description: description, lang: lang, topics: suggestTopics(subjects + ' ' + title), source: 'Open Library' };
  }
  // Google's full volume record often has a longer description (as HTML) than search results.
  // HTML is turned into plain text with DOMParser, which never runs scripts.
  function htmlToText(html) {
    if (!html || !/[<&]/.test(html)) return html || '';
    const doc = new DOMParser().parseFromString(String(html).replace(/<br\s*\/?>/gi, '\n').replace(/<\/p>/gi, '\n\n'), 'text/html');
    doc.querySelectorAll('script,style,noscript,template').forEach((n) => n.remove());
    return (doc.body.textContent || '').replace(/\n{3,}/g, '\n\n').trim();
  }
  async function findDescription(found) {
    if (!found || found.description) return found;
    // a) the full Google record for the same volume
    if (found.id) {
      const v = await tryJson('https://www.googleapis.com/books/v1/volumes/' + encodeURIComponent(found.id));
      const d = v && v.volumeInfo && v.volumeInfo.description;
      if (d) { found.description = htmlToText(d); return found; }
    }
    // b) another edition of the same title and author – same language first
    if (found.title) {
      const q = 'intitle:"' + found.title.split(':')[0].replace(/"/g, '') + '"' + (found.author ? '+inauthor:"' + found.author.split(',')[0].replace(/"/g, '') + '"' : '');
      const g = await tryJson('https://www.googleapis.com/books/v1/volumes?maxResults=10&printType=books&q=' + encodeURIComponent(q));
      const items = ((g && g.items) || []).filter((it) => it.volumeInfo && it.volumeInfo.description);
      const same = items.find((it) => mapLang(it.volumeInfo.language) === found.lang) || items[0];
      if (same) { found.description = htmlToText(same.volumeInfo.description); found.descFromOther = true; }
    }
    return found;
  }

  function mergeFound(a, b) {
    if (!a) return b; if (!b) return a;
    const out = Object.assign({}, a);
    ['title', 'author', 'description'].forEach((k) => { if (!out[k]) out[k] = b[k]; });
    if (out.lang === 'other' && b.lang !== 'other') out.lang = b.lang;
    if (!out.topics.length) out.topics = b.topics;
    if (!out.age && b.age) out.age = b.age;
    if (!out.id && b.id) out.id = b.id;
    out.lnb = !!(a.lnb || b.lnb);
    out.source = a.source + ' + ' + b.source;
    return out;
  }

  // Lithuanian national library (LNB open data on data.gov.lt), through our isbn-lookup Edge Function.
  async function lnbByIsbn(isbn13) {
    const b = window.Backend && await Backend.lookupLnb(isbn13);
    if (!b || !b.title) return null;
    const out = {
      isbn: isbn13, title: b.title, author: b.author || '', description: '', lang: mapLang(b.lang),
      topics: suggestTopics((b.subjects || '') + ' ' + b.title), source: t('lnbName'), lnb: true
    };
    if (AGES.indexOf(b.age) >= 0) out.age = b.age; // otherwise the form's default age stays
    return out;
  }

  async function lookupIsbn(raw) {
    let isbn = cleanIsbn(raw);
    if (isbn.length !== 10 && isbn.length !== 13) { ui.addMsg = t('invalidIsbn'); ui.addMsgKind = 'warn'; render(); return; }
    if (isbn.length === 10) isbn = isbn10to13(isbn);
    const isbn10 = isbn13to10(isbn);
    // 1. Our own catalogue – best for small-language books
    const local = S.books.find((b) => b.isbn && (b.isbn === isbn || b.isbn === isbn10));
    if (local) {
      // Copy the book details – never another family's own photos.
      startDraft({ isbn: isbn, title: local.title, author: local.author, description: local.description, lang: local.lang, topics: local.topics.slice(), age: local.age });
      ui.addMsg = t('foundLocalIsbn', { isbn: isbn }); ui.addMsgKind = 'ok'; render(); return;
    }
    ui.busy = true; ui.busyIsbn = isbn; ui.addMsg = ''; render();
    // 2. Google Books and Open Library at the same time; combine what they know.
    //    The Lithuanian national library is asked straight away for Lithuanian ISBNs (978-609, 978-9955, 978-9986),
    //    and for other books as soon as the big catalogues are slow (1.5 s) or have no title, so we never wait for them in turn.
    //    When Google/Open Library already have a title, the library's answer is not waited for.
    const ltIsbn = /^978(609|9955|9986)/.test(isbn);
    let lnbAsk = ltIsbn ? lnbByIsbn(isbn) : null;
    const baseAsk = Promise.all([googleByIsbn(isbn, isbn10).catch(() => null), openLibraryByIsbn(isbn, isbn10).catch(() => null)]);
    const slowTimer = ltIsbn ? null : setTimeout(() => { if (!lnbAsk) lnbAsk = lnbByIsbn(isbn); }, 1500);
    const results = await baseAsk;
    clearTimeout(slowTimer);
    let merged = mergeFound(results[0], results[1]);
    if (ltIsbn || !(merged && merged.title)) {
      const lnb = await (lnbAsk || (lnbAsk = lnbByIsbn(isbn)));
      // For Lithuanian books the library's title, author and language are the most reliable.
      merged = ltIsbn ? mergeFound(lnb, merged) : mergeFound(merged, lnb);
    }
    if (merged && ltIsbn && merged.lang === 'other') merged.lang = 'lt'; // Lithuanian ISBN ranges
    const found = await findDescription(merged).catch(() => merged);
    ui.busy = false; ui.busyIsbn = '';
    if (found && found.title) {
      found.isbn = isbn;
      startDraft(found);
      ui.addMsg = t('foundIsbn', { isbn: isbn, src: found.source }) + (found.description ? '' : ' ' + t('noDescFound')) + (found.lnb ? ' ' + t('lnbCredit') : ''); ui.addMsgKind = 'ok';
    } else {
      startDraft({ isbn: isbn });
      ui.addMsg = t('notFoundIsbn', { isbn: isbn }); ui.addMsgKind = 'warn';
    }
    render();
  }
  async function titleSearch(q) {
    q = (q || '').trim(); if (q.length < 2) return;
    ui.busy = true; ui.searchResults = []; ui.addMsg = ''; render();
    try {
      const g = await fetchJson('https://www.googleapis.com/books/v1/volumes?maxResults=8&printType=books&q=' + encodeURIComponent(q));
      ui.searchResults = (g.items || []).map(fromGoogle);
      const localHits = S.books.filter((b) => (b.title + ' ' + b.author).toLowerCase().indexOf(q.toLowerCase()) >= 0)
        .map((b) => ({ isbn: b.isbn, title: b.title, author: b.author, description: b.description, lang: b.lang, topics: b.topics.slice(), source: 'local' }));
      ui.searchResults = localHits.concat(ui.searchResults).slice(0, 10);
      if (!ui.searchResults.length) { ui.addMsg = t('notFound'); ui.addMsgKind = 'warn'; }
    } catch (e) { ui.addMsg = t('notFound'); ui.addMsgKind = 'warn'; }
    ui.busy = false; render();
  }
  function startDraft(p) {
    ui.draft = Object.assign({ isbn: '', title: '', author: '', description: '', lang: S.interested[0] || 'lt', topics: [], age: '3–6', cond: 'good', offer: 'swap', price: '3', notes: '', photos: [] }, p || {});
    delete ui.draft.cover;
    ui.draft.photos = [];
    if (ui.draft.lang === 'other' && !p.title) ui.draft.lang = S.interested[0] || 'lt';
    ui.addStep = 'form';
    stopCamera();
  }

  // ---------- camera barcode scanner ----------
  // Full-resolution frames from the camera are decoded by the phone's built-in BarcodeDetector
  // when available (Android Chrome), otherwise by ZXing compiled to WebAssembly (iPhone Safari etc.).
  const READER_OPTS = { formats: ['EAN13', 'EAN8', 'UPCA', 'UPCE'], tryHarder: true, maxNumberOfSymbols: 1 };
  const scan = { stream: null, video: null, timer: null, busy: false, detector: null, canvas: null, zxingReady: false };
  const isIsbnLike = (text) => { const c = cleanIsbn(text); return (c.length === 13 && /^97[89]/.test(c)) || c.length === 10; };

  function prepareZXing() {
    if (scan.zxingReady || !window.ZXingWASM) return;
    scan.zxingReady = true;
    window.ZXingWASM.prepareZXingModule({
      overrides: { locateFile: (path, prefix) => (path.endsWith('.wasm') ? new URL('vendor/zxing_reader.wasm', location.href).href : prefix + path) },
      fireImmediately: true
    });
  }
  async function setupDetector() {
    if (scan.detector !== null || !('BarcodeDetector' in window)) return;
    try {
      const fmts = await window.BarcodeDetector.getSupportedFormats();
      if (fmts.indexOf('ean_13') >= 0) scan.detector = new window.BarcodeDetector({ formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e'].filter((f) => fmts.indexOf(f) >= 0) });
    } catch (e) { /* fall back to ZXing */ }
  }
  async function decodeSource(source, w, h) {
    // source: canvas (live) or ImageBitmap / Blob (photo)
    if (scan.detector) {
      try { const r = await scan.detector.detect(source); if (r && r[0]) return r[0].rawValue; } catch (e) { /* try ZXing */ }
    }
    if (!window.ZXingWASM) return null;
    let input = source;
    if (source instanceof HTMLCanvasElement) input = source.getContext('2d', { willReadFrequently: true }).getImageData(0, 0, w, h);
    const res = await window.ZXingWASM.readBarcodes(input, READER_OPTS);
    return res && res[0] ? res[0].text : null;
  }
  async function startCamera() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) { ui.addMsg = t('cameraError'); ui.addMsgKind = 'warn'; render(); return; }
    prepareZXing(); setupDetector();
    ui.scanner = 'starting'; ui.addMsg = ''; render();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: false,
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1920 }, height: { ideal: 1080 } } });
      if (ui.scanner !== 'starting') { stream.getTracks().forEach((tr) => tr.stop()); return; }
      const v = document.createElement('video');
      v.setAttribute('playsinline', ''); v.setAttribute('muted', ''); v.muted = true; v.autoplay = true; v.srcObject = stream;
      scan.stream = stream; scan.video = v; ui.scanner = 'live';
      render();
      tuneTrack(stream.getVideoTracks()[0]);
      scanLoop();
    } catch (e) {
      ui.scanner = null; ui.addMsg = t('cameraError'); ui.addMsgKind = 'warn'; render();
    }
  }
  // Continuous autofocus, and a little zoom so the phone can be held further away
  // (many phones cannot focus closer than ~10–15 cm).
  function tuneTrack(track) {
    try {
      const caps = track && track.getCapabilities ? track.getCapabilities() : {};
      const adv = {};
      if (caps.focusMode && caps.focusMode.indexOf('continuous') >= 0) adv.focusMode = 'continuous';
      if (caps.zoom && caps.zoom.max >= 1.5) adv.zoom = Math.min(2, caps.zoom.max);
      if (Object.keys(adv).length) track.applyConstraints({ advanced: [adv] }).catch(() => {});
    } catch (e) { /* not supported – fine */ }
  }
  function grabFrame() {
    const v = scan.video;
    if (!v || !v.videoWidth) return null;
    // The centre band of the picture (matches the guide box on screen), at full resolution.
    const vw = v.videoWidth; const vh = v.videoHeight;
    const cw = Math.round(vw * 0.9); const ch = Math.round(vh * 0.6);
    const c = scan.canvas || (scan.canvas = document.createElement('canvas'));
    if (c.width !== cw) c.width = cw;
    if (c.height !== ch) c.height = ch;
    c.getContext('2d', { willReadFrequently: true }).drawImage(v, Math.round((vw - cw) / 2), Math.round((vh - ch) / 2), cw, ch, 0, 0, cw, ch);
    return c;
  }
  function scanLoop() {
    if (ui.scanner !== 'live') return;
    if (!scan.busy) {
      const frame = grabFrame();
      if (frame) {
        scan.busy = true;
        decodeSource(frame, frame.width, frame.height).then((text) => {
          scan.busy = false;
          if (text && isIsbnLike(text) && ui.scanner === 'live') {
            if (navigator.vibrate) navigator.vibrate(80);
            stopCamera(); lookupIsbn(text);
          }
        }).catch(() => { scan.busy = false; });
      }
    }
    scan.timer = setTimeout(scanLoop, 150);
  }
  function stopCamera() {
    clearTimeout(scan.timer);
    if (scan.stream) scan.stream.getTracks().forEach((tr) => tr.stop());
    if (scan.video) { scan.video.srcObject = null; scan.video.remove(); }
    scan.stream = null; scan.video = null; scan.busy = false; ui.scanner = null;
  }
  // Backup: decode a still photo of the barcode (the phone's own camera app focuses well).
  function scanPhoto(file) {
    if (!file) return;
    prepareZXing(); stopCamera();
    ui.busy = true; ui.addMsg = ''; render();
    setupDetector().then(() => shrinkImage(file, 2000)).then(async (img) => {
      let text = null;
      if (scan.detector) { try { const bmp = await createImageBitmap(img); text = await decodeSource(bmp); } catch (e) { text = null; } }
      if (!text && window.ZXingWASM) { const r = await window.ZXingWASM.readBarcodes(img, READER_OPTS); text = r && r[0] ? r[0].text : null; }
      ui.busy = false;
      if (text && isIsbnLike(text)) lookupIsbn(text);
      else { ui.addMsg = t('photoScanFail'); ui.addMsgKind = 'warn'; render(); }
    }).catch(() => { ui.busy = false; ui.addMsg = t('photoScanFail'); ui.addMsgKind = 'warn'; render(); });
  }
  function shrinkImage(file, max) {
    return new Promise((resolve) => {
      const url = URL.createObjectURL(file); const img = new Image();
      img.onload = () => {
        const sc = Math.min(1, max / Math.max(img.width, img.height));
        const c = document.createElement('canvas'); c.width = Math.round(img.width * sc); c.height = Math.round(img.height * sc);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(url);
        c.toBlob((b) => resolve(b || file), 'image/jpeg', 0.92);
      };
      img.onerror = () => { URL.revokeObjectURL(url); resolve(file); };
      img.src = url;
    });
  }

  // ---------- photo (resized + metadata stripped by redrawing on a canvas) ----------
  // Photos are for showing the copy and its condition – kept small on purpose (max 720 px),
  // and limited to MAX_PHOTOS, so the app can't be used to share the pages of a book.
  function handlePhoto(file) {
    if (!file || !/^image\//.test(file.type) || !ui.draft) return;
    if (ui.draft.photos.length >= MAX_PHOTOS) { toast(t('maxPhotos', { max: MAX_PHOTOS })); return; }
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const max = 720; const scale = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement('canvas'); c.width = Math.round(img.width * scale); c.height = Math.round(img.height * scale);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      if (ui.draft && ui.draft.photos.length < MAX_PHOTOS) ui.draft.photos.push(c.toDataURL('image/jpeg', 0.72));
      if (ui.addMsg === t('photoRequired')) ui.addMsg = '';
      URL.revokeObjectURL(url); render();
    };
    img.src = url;
  }

  function handleAvatar(file) {
    if (!file || !/^image\//.test(file.type)) return;
    const url = URL.createObjectURL(file); const img = new Image();
    img.onload = () => {
      const side = Math.min(img.width, img.height); const out = 256;
      const c = document.createElement('canvas'); c.width = out; c.height = out;
      c.getContext('2d').drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, out, out);
      URL.revokeObjectURL(url);
      const data = c.toDataURL('image/jpeg', 0.8);
      if (LIVE) liveAct(() => Backend.setAvatar(live.group.id, live.uid, data, S.me.avatarPath), t('saved'));
      else { S.me.avatar = data; save(); toast(t('saved')); }
    };
    img.src = url;
  }

  // ---------- actions ----------
  const A = {
    setLang: (el) => { S.lang = el.dataset.v; save(); render(); },
    toggleInterest: (el) => { const v = el.dataset.v; const i = S.interested.indexOf(v); if (i >= 0) S.interested.splice(i, 1); else S.interested.push(v); save(); render(); },
    toggleAgree: (el) => { ui.onbAgree = el.checked; },
    toSignup: () => { const f = document.getElementById('signup'); if (f) f.scrollIntoView({ behavior: 'smooth', block: 'start' }); const e = document.getElementById('si-email'); if (e) setTimeout(() => e.focus({ preventScroll: true }), 350); },
    startSignup: () => { ui.introDone = true; render(); window.scrollTo(0, 0); },
    tourNext: () => { ui.tourStep = (ui.tourStep || 0) + 1; render(); },
    tourBack: () => { ui.tourStep = Math.max(0, (ui.tourStep || 0) - 1); render(); },
    tourSkip: () => { S.toured = true; ui.tourStep = 0; save(); render(); },
    tourAdd: () => { S.toured = true; ui.tourStep = 0; ui.addMode = 'shelf'; save(); go('#/add'); },
    tourReplay: () => { S.toured = false; ui.tourStep = 0; save(); go('#/'); render(); },
    join: () => {
      const name = (document.getElementById('onb-name').value || '').trim().slice(0, 40);
      const country = document.getElementById('onb-country').value;
      const postal = cleanPostal(country, document.getElementById('onb-postal').value);
      const fail = (msg, id) => { ui.onbError = msg; render(); const f = document.getElementById(id); if (f) f.focus(); };
      if (!name) return fail(t('nameRequired'), 'onb-name');
      if (!country) return fail(t('countryRequired'), 'onb-country');
      if (!postal) return fail(t('postalRequired'), 'onb-postal');
      if (!validPostal(country, postal)) return fail(t('postalInvalid', { country: countryName(country) }), 'onb-postal');
      if (!document.getElementById('onb-agree').checked) return fail(t('termsRequired'), 'onb-agree');
      if (LIVE) return liveJoin(name, country, postal);
      S.me = { name: name, country: country, postal: postal };
      S.agreed = { version: TERMS.version, at: Date.now() };
      ui.onbError = ''; save(); go('#/');
    },
    go: (el) => go(el.dataset.v),
    back: () => { if (history.length > 1) history.back(); else go('#/'); },
    fLang: (el) => { ui.fLang = el.dataset.v; render(); },
    fNear: () => { ui.fNear = !ui.fNear; render(); },
    exToggle: (el) => {
      const ex = ui.ex[el.dataset.m]; const arr = ex[el.dataset.side]; const i = arr.indexOf(el.dataset.v);
      if (i >= 0) arr.splice(i, 1); else arr.push(el.dataset.v); render();
    },
    propose: (el) => {
      const id = el.dataset.v; const ex = ui.ex[id];
      if (!ex || !ex.get.length) { toast(t('pickSomething')); return; }
      ex.get.forEach((bid) => { if (S.cart.indexOf(bid) < 0) S.cart.push(bid); });
      S.cartMeta[id] = { offered: ex.give.slice(), msg: null }; // automatic message names both sides
      ui.showOffer[id] = ex.give.length > 0;
      delete ui.ex[id];
      save(); go('#/requests');
    },
    fTopic: (el) => { ui.fTopic = ui.fTopic === el.dataset.v ? null : el.dataset.v; render(); },
    fAge: (el) => { ui.fAge = ui.fAge === el.dataset.v ? null : el.dataset.v; render(); },
    clearFilters: () => { ui.q = ''; ui.fLang = 'all'; ui.fTopic = null; ui.fAge = null; render(); },
    addCart: (el) => { if (S.cart.indexOf(el.dataset.v) < 0) S.cart.push(el.dataset.v); save(); render(); },
    requestNow: (el) => { if (S.cart.indexOf(el.dataset.v) < 0) S.cart.push(el.dataset.v); save(); go('#/requests'); },
    removeCart: (el) => { S.cart = S.cart.filter((x) => x !== el.dataset.v); save(); render(); },
    toggleOffer: (el) => { ui.showOffer[el.dataset.v] = el.checked; if (!el.checked && S.cartMeta[el.dataset.v]) S.cartMeta[el.dataset.v].offered = []; save(); render(); },
    toggleOffered: (el) => {
      const o = el.dataset.owner; const m = S.cartMeta[o] = S.cartMeta[o] || { offered: [], msg: null };
      const i = m.offered.indexOf(el.dataset.v); if (i >= 0) m.offered.splice(i, 1); else m.offered.push(el.dataset.v); save(); render();
    },
    sendRequest: (el) => sendRequest(el.dataset.v),
    chatTab: (el) => { ui.chatTab = el.dataset.v; render(); },
    tick: (el) => {
      const arr = ui.ticks[el.dataset.thread] || []; const i = arr.indexOf(el.dataset.v);
      if (i >= 0) arr.splice(i, 1); else arr.push(el.dataset.v); ui.ticks[el.dataset.thread] = arr; render();
    },
    acceptThread: (el) => {
      const th = S.threads.find((x) => x.id === el.dataset.v);
      const ticked = (ui.ticks[th.id] || th.books).filter((id) => th.books.indexOf(id) >= 0 && book(id) && book(id).status === 'available');
      if (!ticked.length) return A.declineThread(el);
      th.accepted = ticked; th.status = 'accepted';
      setStatus(ticked, 'reserved'); setStatus(th.offered || [], 'reserved');
      sysMsg(th, 'sysAccepted', { name: MINE }); save(); render();
    },
    declineThread: (el) => {
      const th = S.threads.find((x) => x.id === el.dataset.v);
      th.status = 'declined'; sysMsg(th, 'sysDeclined', { name: MINE }); save(); render();
    },
    confirmHandover: (el) => {
      const th = S.threads.find((x) => x.id === el.dataset.v);
      const when = document.getElementById('hdate').value || nextSaturdayISO();
      const where = (document.getElementById('hwhere').value || t('handoverPh')).trim().slice(0, 60);
      th.handover = { when: when + 'T10:00:00', where: where }; th.status = 'scheduled';
      sysMsg(th, 'sysHandover', { when: th.handover.when, where: where }); save(); render();
    },
    markDone: (el) => { const th = S.threads.find((x) => x.id === el.dataset.v); finishThread(th); save(); render(); },
    quick: (el) => {
      const th = S.threads.find((x) => x.id === el.dataset.thread);
      if (!th || SekuChat.ALL_QUICK.indexOf(el.dataset.v) < 0) return;
      th.messages.push({ from: MINE, text: t(el.dataset.v), at: Date.now() }); save(); render();
    },
    report: () => toast(t('reported')),
    rateBooks: (el) => { ui.rating[el.dataset.thread] = Number(el.dataset.v); render(); },
    editReview: (el) => { ui.editReview[el.dataset.v] = true; render(); },
    submitReview: (el) => {
      const th = S.threads.find((x) => x.id === el.dataset.v);
      const prev = S.reviews.find((r) => r.request === th.id && r.from === MINE);
      const rating = ui.rating[th.id] || (prev ? prev.rating : 0);
      if (!rating) { toast(t('pickRating')); return; }
      const comment = (document.getElementById('rv-' + th.id).value || '').trim().slice(0, 300);
      if (looksLikeCopySharing(comment)) { toast(t('copyBlocked')); return; }
      S.reviews = S.reviews.filter((r) => !(r.request === th.id && r.from === MINE));
      S.reviews.push({ id: uid('r'), request: th.id, from: MINE, to: th.with, rating: rating, comment: comment, at: Date.now() });
      delete ui.editReview[th.id]; delete ui.rating[th.id]; save(); toast(t('reviewThanks'));
    },
    startCamera: () => { startCamera(); },
    stopCamera: () => { stopCamera(); render(); },
    manual: () => { startDraft({}); ui.addMsg = ''; render(); },
    pickResult: (el) => { const r = ui.searchResults[Number(el.dataset.v)]; if (r) { startDraft(r); ui.addMsg = r.source === 'local' ? t('foundLocal') : t('foundIn', { src: r.source }); ui.addMsgKind = 'ok'; render(); } },
    restartAdd: () => { ui.addStep = 'scan'; ui.draft = null; ui.addMsg = ''; ui.searchResults = []; go('#/add'); },
    dLang: (el) => { ui.draft.lang = el.dataset.v; render(); },
    removePhoto: (el) => { ui.draft.photos.splice(Number(el.dataset.v), 1); render(); },
    dTopic: (el) => { const a = ui.draft.topics; const i = a.indexOf(el.dataset.v); if (i >= 0) a.splice(i, 1); else a.push(el.dataset.v); render(); },
    dAge: (el) => { ui.draft.age = el.dataset.v; render(); },
    dCond: (el) => { ui.draft.cond = el.dataset.v; render(); },
    dOffer: (el) => { ui.draft.offer = el.dataset.v; render(); },
    saveDraft: () => {
      const d = ui.draft;
      if (!d.title.trim()) { ui.addMsg = t('required'); ui.addMsgKind = 'warn'; render(); return; }
      if (!d.photos.length) { ui.addMsg = t('photoRequired'); ui.addMsgKind = 'warn'; render(); window.scrollTo(0, 0); return; }
      const b = { id: uid('b'), isbn: d.isbn, title: d.title.trim(), author: d.author.trim() || '—', description: d.description.trim(),
        lang: d.lang, topics: d.topics.length ? d.topics.slice() : ['learning'], age: d.age, cond: d.cond, offer: d.offer,
        price: d.offer === 'sell' ? (Number(String(d.price).replace(',', '.')) || 0) : 0, owner: MINE, added: Date.now(),
        status: 'available', notes: (d.notes || '').trim(), photos: d.photos.slice(0, MAX_PHOTOS), photo: d.photos[0] };
      S.books.push(b); save();
      ui.lastSaved = b.id; ui.lastWish = null; ui.addStep = 'done'; ui.draft = null; ui.addMsg = ''; render();
    },
    addMode: (el) => { ui.addMode = el.dataset.v; render(); },
    saveWish: () => {
      const d = ui.draft;
      if (!d.title.trim()) { ui.addMsg = t('required'); ui.addMsgKind = 'warn'; render(); return; }
      const w = { id: uid('w'), owner: MINE, title: d.title.trim(), author: d.author.trim(), lang: d.lang, isbn: d.isbn || '' };
      S.wishes.push(w); save();
      ui.lastWish = w.id; ui.lastSaved = null; ui.addStep = 'done'; ui.draft = null; ui.addMsg = ''; render();
    },
    addWish: () => { ui.addMode = 'wish'; ui.addStep = 'scan'; ui.draft = null; ui.addMsg = ''; ui.searchResults = []; go('#/add'); },
    removeWish: (el) => { S.wishes = S.wishes.filter((w) => w.id !== el.dataset.v); save(); render(); },
    savePostal: () => {
      const cc = document.getElementById('p-country').value;
      const v = cleanPostal(cc, document.getElementById('p-postal').value);
      if (!v || !validPostal(cc, v)) { toast(t('postalInvalid', { country: countryName(cc) })); return; }
      S.me.country = cc; S.me.postal = v; save(); toast(t('saved'));
    },
    exportData: () => {
      const blob = new Blob([JSON.stringify({ me: S.me, books: S.books.filter((b) => b.owner === MINE), threads: S.threads, received: S.received }, null, 2)], { type: 'application/json' });
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'book-swap-my-data.json';
      document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
    },
    deleteAll: () => { if (window.confirm(t('confirmDelete'))) { localStorage.removeItem(KEY); S = fresh(); ui.draft = null; initCountry(); go('#/'); } }
  };

  // ===================== live mode (Supabase) =====================
  const live = { ready: !LIVE, uid: null, email: '', group: null, authStep: 'email', authEmail: '', busy: false, invite: '', newInvite: '' };

  function friendlyError(e) {
    const m = String((e && e.message) || e || '');
    if (/invalid or expired invite/i.test(m)) return t('errInvite');
    if (/not available|not yours/i.test(m)) return t('errNotAvailable');
    if (/sharing copies|row-level security.*messages/i.test(m)) return t('copyBlocked');
    if (/rate limit|only request this/i.test(m)) return t('errRateLimit');
    if (/token.*(expired|invalid)|otp/i.test(m)) return t('codeInvalid');
    if (/not authorized|not allowed for this/i.test(m)) return t('errEmailNotAllowed');
    if (/blocked/i.test(m)) return t('errBlocked');
    if (/sign up first/i.test(m)) return t('errNoAccount');
    if (/at least one admin/i.test(m)) return t('errLastAdmin');
    if (/failed to fetch|network/i.test(m)) return t('errOffline');
    if (m === 'groupNameRequired' || m === 'inviteRequired') return t(m);
    return t('errGeneric') + ' (' + m.slice(0, 120) + ')';
  }

  function mapBook(r, urls) {
    const paths = r.photo_paths || [];
    const photos = paths.map((p) => urls[p]).filter(Boolean);
    return { id: r.id, isbn: r.isbn || '', title: r.title, author: r.author || '—', description: r.description || '', notes: r.notes || '',
      lang: r.lang, topics: r.topics || [], age: r.age || '3–6', cond: r.condition, offer: r.offer, price: (r.price_cents || 0) / 100,
      owner: r.owner_id === live.uid ? MINE : r.owner_id, added: Date.parse(r.created_at), status: r.status, hidden: !!r.hidden,
      photoPaths: paths, photos: photos, photo: photos[0] || '' };
  }
  function mapThread(r) {
    const me = live.uid; const role = r.owner_id === me ? 'owner' : 'requester';
    const req = r.items.filter((i) => i.side === 'requested'); const off = r.items.filter((i) => i.side === 'offered');
    const readAt = Date.parse(role === 'owner' ? r.owner_read_at : r.requester_read_at);
    const fix = (v) => { const o = Object.assign({}, v || {}); if (o.name === me) o.name = MINE; return o; };
    const msgs = r.messages.map((m) => (m.kind === 'system'
      ? { from: 'system', key: m.sys_key, vars: fix(m.sys_vars), text: '', at: Date.parse(m.created_at) }
      : { from: m.sender_id === me ? MINE : m.sender_id, text: m.body, at: Date.parse(m.created_at) }));
    const lastOther = msgs.filter((m) => m.from !== MINE).pop();
    return { id: r.id, with: role === 'owner' ? r.requester_id : r.owner_id, role: role,
      books: req.map((i) => i.book_id), offered: off.map((i) => i.book_id), accepted: req.filter((i) => i.accepted).map((i) => i.book_id),
      status: r.status, handover: r.handover_on ? { when: r.handover_on + 'T10:00:00', where: r.handover_place || '' } : null,
      messages: msgs.length ? msgs : [{ from: 'system', key: 'sendRequest', vars: {}, text: '', at: Date.parse(r.created_at) }],
      unread: !!(lastOther && lastOther.at > readAt) };
  }
  function computeReceived() {
    const out = [];
    S.threads.filter((th) => th.status === 'done').forEach((th) => {
      (th.role === 'owner' ? th.offered : th.accepted).forEach((id) => {
        const b = book(id); if (b) out.push({ title: b.title, lang: b.lang, topics: b.topics, offer: b.offer, price: b.price });
      });
    });
    return out;
  }

  async function loadMembership() {
    const m = await Backend.myMembership(live.uid);
    if (m) {
      live.group = { id: m.group_id, name: m.groups ? m.groups.name : '', role: m.role, handover_place: m.groups ? m.groups.handover_place : '', handover_day: m.groups ? m.groups.handover_day : null };
      try {
        const pr = await Backend.getPrefs(live.uid);
        if (pr) S.notifPrefs = { app: pr.app_types, email: pr.email_types, mode: pr.email_mode };
        live.isAdmin = await Backend.isPlatformAdmin();
      } catch (e) { /* settings are optional */ }
      S.me = { name: m.display_name, country: m.country, postal: m.postal_code };
      if (m.interested_langs && m.interested_langs.length) S.interested = m.interested_langs;
      S.agreed = { version: m.terms_version, at: Date.now() };
      ui.onbCountry = m.country;
    } else { live.group = null; S.me = null; S.agreed = null; }
  }
  let refreshing = null;
  function refreshAll() {
    if (!LIVE || !live.group) return Promise.resolve();
    if (refreshing) return refreshing;
    refreshing = Promise.all([Backend.loadGroup(live.group.id), Backend.loadThreads(), Backend.loadNotifications().catch(() => [])]).then((res) => {
      S.notifications = res[2].map((n) => { const d = Object.assign({}, n.data); if (d.actor === live.uid) d.actor = MINE;
        return { id: n.id, type: n.type, data: d, at: Date.parse(n.created_at), read: !!n.read_at }; });
      const g = res[0];
      Object.keys(MEMBERS).forEach((k) => delete MEMBERS[k]);
      g.members.forEach((m) => {
        const avatar = m.avatar_path ? g.urls[m.avatar_path] || '' : '';
        if (m.user_id !== live.uid) MEMBERS[m.user_id] = { name: m.display_name, country: m.country, postal: m.postal_code, role: m.role, avatar: avatar };
        else if (S.me) { S.me.avatar = avatar; S.me.avatarPath = m.avatar_path || ''; }
      });
      const who = (u) => (u === live.uid ? MINE : u);
      S.reviews = (g.reviews || []).map((r) => ({ id: r.id, request: r.request_id, from: who(r.reviewer_id), to: who(r.reviewee_id), rating: r.rating, comment: r.comment, at: Date.parse(r.created_at) }));
      S.books = g.books.map((r) => mapBook(r, g.urls));
      S.wishes = g.wishes.map((w) => ({ id: w.id, owner: w.owner_id === live.uid ? MINE : w.owner_id, title: w.title, author: w.author, lang: w.lang, isbn: w.isbn || '' }));
      S.threads = res[1].map(mapThread);
      S.received = computeReceived();
      S.cart = S.cart.filter((id) => { const b = book(id); return b && b.status === 'available' && b.owner !== MINE; });
    }).finally(() => { refreshing = null; });
    return refreshing;
  }
  // Run a server action, then reload data and redraw; errors become a friendly message.
  async function liveAct(fn, okMsg) {
    live.busy = true;
    try {
      const r = await fn();
      await refreshAll();
      if (okMsg) toast(okMsg); else render();
      return r === undefined ? true : r;
    } catch (e) { toast(friendlyError(e)); return false; }
    finally { live.busy = false; }
  }

  async function boot() {
    // If we arrived from a sign-in link, the result (or the reason it failed) is in the address.
    const hp = new URLSearchParams((location.hash || '').replace(/^#\/?/, '') + '&' + location.search.slice(1));
    const linkError = hp.get('error_code') || hp.get('error_description') || hp.get('error');
    const cameFromLink = hp.has('access_token') || !!linkError;
    try {
      const s = await Backend.session();
      if (cameFromLink && !s) {
        ui.onbError = /expired|invalid|otp/i.test(linkError || '') ? t('linkExpired') : t('linkFailed') + (linkError ? ' (' + String(linkError).slice(0, 80) + ')' : '');
      }
      live.uid = s ? s.user.id : null; live.email = s ? s.user.email : '';
      if (live.uid) { await loadMembership(); await refreshAll(); }
    } catch (e) { ui.toast = friendlyError(e); }
    live.ready = true;
    if (location.hash && location.hash.indexOf('#/') !== 0) history.replaceState(null, '', location.pathname + location.search + '#/');
    render();
    Backend.subscribe(() => { clearTimeout(boot.t); boot.t = setTimeout(() => refreshAll().then(render).catch(() => {}), 400); });
    Backend.onAuthChange(async (sess) => {
      const uid = sess ? sess.user.id : null;
      if (uid === live.uid) return;
      live.uid = uid; live.email = sess ? sess.user.email : '';
      if (uid) { await loadMembership(); await refreshAll(); } else { live.group = null; S.me = null; S.agreed = null; }
      render();
    });
    // keep the shelves fresh when coming back to the app
    document.addEventListener('visibilitychange', () => { if (!document.hidden && live.group) refreshAll().then(render).catch(() => {}); });
  }

  async function liveSendCode(email) {
    email = String(email || '').trim();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { ui.onbError = t('emailInvalid'); render(); return; }
    live.busy = true; ui.onbError = ''; live.authEmail = email; render();
    try { await Backend.sendCode(email); live.authStep = 'code'; }
    catch (e) { ui.onbError = friendlyError(e); }
    finally { live.busy = false; render(); }
  }
  async function liveVerify(code) {
    code = String(code || '').replace(/\D/g, '');
    if (code.length < 6) { ui.onbError = t('codeInvalid'); render(); return; }
    live.busy = true; ui.onbError = ''; render();
    try { await Backend.verifyCode(live.authEmail, code); /* onAuthChange takes it from here */ }
    catch (e) { ui.onbError = friendlyError(e); }
    finally { live.busy = false; render(); }
  }
  async function liveJoin(name, country, postal) {
    live.busy = true; ui.onbError = ''; render();
    try {
      const p = { name: name, country: country, postal: postal, langs: S.interested, terms: TERMS.version };
      if (live.group) {
        await Backend.updateProfile(live.group.id, live.uid, { display_name: name, country: country, postal_code: postal, interested_langs: S.interested });
        await Backend.acceptTerms(live.group.id, TERMS.version);
      } else {
        await Backend.joinNetwork(p); // open sign-up: everyone joins the one network
      }
      await Backend.savePrefs(live.uid, Object.assign({ lang: S.lang }, S.notifPrefs)).catch(() => {});
      await loadMembership(); await refreshAll();
      location.hash = '#/';
    } catch (e) { ui.onbError = friendlyError(e); }
    finally { live.busy = false; render(); }
  }
  async function liveSendRequest(owner) {
    const ids = S.cart.filter((id) => { const b = book(id); return b && b.owner === owner; });
    if (!ids.length) return;
    const meta = S.cartMeta[owner] || { offered: [], msg: null };
    const offered = meta.offered.filter((id) => { const b = book(id); return b && b.owner === MINE && b.status === 'available'; });
    const id = await liveAct(() => Backend.createRequest(owner, ids, offered, cartText(owner, ids, Object.assign({}, meta, { offered: offered }))));
    if (id && id !== true) {
      S.cart = S.cart.filter((x) => ids.indexOf(x) < 0); delete S.cartMeta[owner]; save();
      toast(t('sent')); go('#/chat/' + id);
    }
  }

  if (LIVE) {
    const thread = (el) => S.threads.find((x) => x.id === el.dataset.v || x.id === el.dataset.thread);
    Object.assign(A, {
      acceptThread: (el) => {
        const th = thread(el);
        const ticked = (ui.ticks[th.id] || th.books).filter((id) => th.books.indexOf(id) >= 0);
        liveAct(() => Backend.respond(th.id, ticked));
      },
      declineThread: (el) => liveAct(() => Backend.decline(thread(el).id)),
      confirmHandover: (el) => {
        const when = document.getElementById('hdate').value || nextSaturdayISO();
        const where = (document.getElementById('hwhere').value || t('handoverPh')).trim().slice(0, 60);
        liveAct(() => Backend.schedule(thread(el).id, when, where));
      },
      markDone: (el) => liveAct(() => Backend.complete(thread(el).id)),
      quick: (el) => { if (SekuChat.ALL_QUICK.indexOf(el.dataset.v) >= 0) liveAct(() => Backend.sendMessage(thread(el).id, live.uid, t(el.dataset.v))); },
      report: () => { const id = route().id; liveAct(() => Backend.report(live.group.id, live.uid, 'request', id, ''), t('reported')); },
      saveDraft: async () => {
        const d = ui.draft;
        if (!d.title.trim()) { ui.addMsg = t('required'); ui.addMsgKind = 'warn'; render(); return; }
        if (!d.photos.length) { ui.addMsg = t('photoRequired'); ui.addMsgKind = 'warn'; render(); window.scrollTo(0, 0); return; }
        const row = { isbn: /^\d{13}$/.test(d.isbn || '') ? d.isbn : null, title: d.title.trim().slice(0, 150), author: (d.author || '').trim().slice(0, 120),
          description: (d.description || '').trim().slice(0, 3000), notes: (d.notes || '').trim().slice(0, 300), lang: d.lang,
          topics: d.topics.length ? d.topics.slice(0, 9) : ['learning'], age: d.age, condition: d.cond, offer: d.offer,
          price_cents: d.offer === 'sell' ? Math.round((Number(String(d.price).replace(',', '.')) || 0) * 100) : 0 };
        ui.busy = true; render();
        const id = await liveAct(() => Backend.addBook(live.group.id, live.uid, row, d.photos.slice(0, MAX_PHOTOS)));
        ui.busy = false;
        if (id && id !== true) { ui.lastSaved = id; ui.lastWish = null; ui.addStep = 'done'; ui.draft = null; ui.addMsg = ''; }
        render();
      },
      saveWish: async () => {
        const d = ui.draft;
        if (!d.title.trim()) { ui.addMsg = t('required'); ui.addMsgKind = 'warn'; render(); return; }
        const id = await liveAct(() => Backend.addWish(live.group.id, live.uid, { title: d.title.trim().slice(0, 150), author: (d.author || '').trim().slice(0, 120), lang: d.lang, isbn: /^\d{13}$/.test(d.isbn || '') ? d.isbn : null }));
        if (id && id !== true) { ui.lastWish = id; ui.lastSaved = null; ui.addStep = 'done'; ui.draft = null; ui.addMsg = ''; }
        render();
      },
      removeWish: (el) => liveAct(() => Backend.removeWish(el.dataset.v)),
      submitReview: async (el) => {
        const id = el.dataset.v;
        const prev = S.reviews.find((r) => r.request === id && r.from === MINE);
        const rating = ui.rating[id] || (prev ? prev.rating : 0);
        if (!rating) { toast(t('pickRating')); return; }
        const comment = (document.getElementById('rv-' + id).value || '').trim().slice(0, 300);
        if (looksLikeCopySharing(comment)) { toast(t('copyBlocked')); return; }
        const ok = await liveAct(() => Backend.submitReview(id, rating, comment), t('reviewThanks'));
        if (ok) { delete ui.editReview[id]; delete ui.rating[id]; render(); }
      },
      removeBook: (el) => {
        const b = book(el.dataset.v);
        if (!b || !window.confirm(t('confirmRemove'))) return;
        liveAct(() => Backend.deleteBook(b.id, b.photoPaths)).then((ok) => { if (ok) go('#/profile'); });
      },
      savePostal: () => {
        const cc = document.getElementById('p-country').value;
        const v = cleanPostal(cc, document.getElementById('p-postal').value);
        if (!v || !validPostal(cc, v)) { toast(t('postalInvalid', { country: countryName(cc) })); return; }
        liveAct(() => Backend.updateProfile(live.group.id, live.uid, { country: cc, postal_code: v }).then(() => { S.me.country = cc; S.me.postal = v; }), t('saved'));
      },
      deleteAll: async () => {
        if (!window.confirm(t('confirmLeave'))) return;
        const ok = await liveAct(() => Backend.leaveGroup(live.group.id, live.uid));
        if (ok) { await Backend.signOut(); live.group = null; S = fresh(); location.hash = '#/'; render(); }
      },
      createInvite: async () => {
        const code = await liveAct(() => Backend.createInvite(live.group.id));
        if (code && code !== true) { live.newInvite = code; render(); }
      },
      copyInvite: () => {
        const link = location.origin + location.pathname + '#/join/' + live.newInvite;
        const text = t('inviteMessage', { group: groupLabel(), code: live.newInvite, link: link });
        if (navigator.share) navigator.share({ text: text }).catch(() => {});
        else if (navigator.clipboard) navigator.clipboard.writeText(text).then(() => toast(t('copied')));
      }
    });
  }
  Object.assign(A, {
    onbMode: (el) => { ui.onbMode = el.dataset.v; ui.onbError = ''; render(); },
    otherEmail: () => { live.authStep = 'email'; ui.onbError = ''; render(); },
    resendCode: () => liveSendCode(live.authEmail),
    signOut: async () => { await Backend.signOut(); live.uid = null; live.group = null; S.me = null; S.agreed = null; live.authStep = 'email'; render(); }
  });
  if (!A.removeBook) {
    A.removeBook = (el) => {
      if (!window.confirm(t('confirmRemove'))) return;
      S.books = S.books.filter((b) => b.id !== el.dataset.v); save(); go('#/profile');
    };
  }

  // ===================== notifications, reports, organiser panel, platform admin =====================
  const NOTIF_TYPES = ['request_new', 'message', 'request_answered', 'handover_set', 'handover_reminder', 'exchange_done', 'wish_match', 'wanted', 'review', 'announcement'];
  const ORG_TYPES = ['report_new', 'member_joined'];
  const DEFAULT_PREFS = () => ({ app: NOTIF_TYPES.concat(ORG_TYPES), email: ['request_new', 'message', 'request_answered', 'handover_reminder', 'wish_match', 'announcement', 'report_new'], mode: 'instant' });
  const REPORT_CATS = ['no_show', 'inappropriate', 'copyright', 'spam', 'safety', 'other'];
  const N_ICON = { request_new: 'bag', message: 'chat', request_answered: 'check', handover_set: 'calendar', handover_reminder: 'calendar', exchange_done: 'star',
    wish_match: 'heart', wanted: 'swapArrows', review: 'star', announcement: 'logo', report_new: 'flag', member_joined: 'user' };
  if (!S.notifPrefs) S.notifPrefs = DEFAULT_PREFS();
  if (!S.notifications) S.notifications = LIVE ? [] : clone(window.SAMPLE_NOTIFS || []);
  if (!S.reports) S.reports = LIVE ? [] : clone(window.SAMPLE_REPORTS || []);
  const isOrganiser = () => (LIVE ? !!live.isAdmin : true); // moderation is done by platform admins

  function notifText(n) {
    const d = n.data || {};
    const name = d.actor ? firstName(d.actor) : (d.name || '');
    switch (n.type) {
      case 'message': return (d.count > 1 ? t('n_message_many', { n: d.count, name: name }) : t('n_message', { name: name })) + (d.snippet ? ': “' + d.snippet + '”' : '');
      case 'request_answered': return t(d.status === 'declined' ? 'n_request_declined' : 'n_request_accepted', { name: name });
      case 'handover_set': case 'handover_reminder':
        return t('n_' + n.type, { name: name, when: d.when ? fmtDate(new Date(String(d.when).slice(0, 10) + 'T10:00:00')) : '', where: d.where || '' });
      case 'wish_match': case 'wanted': return t('n_' + n.type, { name: name, title: d.title || '' });
      case 'review': return t('n_review', { name: name, n: d.rating });
      case 'announcement': return t('n_announcement', { text: d.text || '' });
      case 'report_new': return t('n_report_new', { category: t('rc_' + (d.category || 'other')) });
      case 'member_joined': return t('n_member_joined', { name: d.name || name });
      default: return t('n_' + n.type, { name: name });
    }
  }
  function notifLink(n) {
    const d = n.data || {};
    if (n.type === 'report_new') return '#/admin/reports';
    if (n.type === 'member_joined') return '#/admin/members';
    if (n.type === 'review') return '#/profile';
    if (d.request_id) return '#/chat/' + d.request_id;
    if (d.book_id) return '#/book/' + d.book_id;
    return '';
  }
  const visibleNotifs = () => S.notifications.filter((n) => S.notifPrefs.app.indexOf(n.type) >= 0).sort((a, b) => b.at - a.at);
  const unreadCount = () => visibleNotifs().filter((n) => !n.read).length;

  function bellHtml() {
    const n = unreadCount();
    return `<a class="bell" href="#/notifications" aria-label="${esc(t('notifBell'))}${n ? ' (' + n + ')' : ''}">${icon('M6 9a6 6 0 0 1 12 0c0 6 2.5 7.5 2.5 7.5h-17S6 15 6 9zM10 20a2.2 2.2 0 0 0 4 0', 22)}${n ? `<span class="count">${n > 9 ? '9+' : n}</span>` : ''}</a>`;
  }

  function viewNotifications() {
    const list = visibleNotifs();
    return `<main class="pad">
      <div class="row-between"><h1 class="h1">${esc(t('notifTitle'))}</h1>${unreadCount() ? `<button class="link" data-action="readAllNotifs">${esc(t('markAllRead'))}</button>` : ''}</div>
      ${list.length ? `<div class="notifs">${list.map((n) => `<button class="notif ${n.read ? '' : 'unread'}" data-action="openNotif" data-v="${esc(n.id)}">
          <span class="notif-ic">${icon(N_ICON[n.type] || 'logo', 20)}</span>
          <span class="grow"><span class="notif-text">${esc(notifText(n))}</span><span class="muted tiny block">${esc(fmtDate(new Date(n.at)))} · ${esc(fmtTime(n.at))}</span></span>
          ${n.read ? '' : '<span class="dot" aria-hidden="true"></span>'}</button>`).join('')}</div>`
      : `<div class="card pad-m empty">${esc(t('notifEmpty'))}</div>`}
      <a class="btn ghost big" href="#/profile/notifications">${icon('M4 6h16M4 12h10M4 18h6', 20)} ${esc(t('notifSettings'))}</a>
    </main>`;
  }

  function prefsEditor(withOrg) {
    const p = S.notifPrefs;
    const types = NOTIF_TYPES.concat(withOrg ? ORG_TYPES : []);
    const pill = (ch, type) => { const on = p[ch].indexOf(type) >= 0;
      return `<button class="ch-pill ${on ? 'on' : ''}" data-action="togglePref" data-ch="${ch}" data-v="${type}" aria-pressed="${on}">${icon(ch === 'app' ? 'M7 3h10v18H7zM11 18h2' : 'M3 6h18v12H3zM3 7l9 6 9-6', 16)} ${esc(t(ch === 'app' ? 'chApp' : 'chEmail'))}</button>`; };
    return `<div class="prefs">${types.map((tp) => `<div class="pref-row"><span class="grow small bold">${esc(t('tl_' + tp))}</span>${pill('app', tp)}${pill('email', tp)}</div>`).join('')}</div>
      <label class="field"><span class="label">${esc(t('emailMode'))}</span>
        <select class="input" data-change="prefMode">${['instant', 'daily', 'off'].map((m) => `<option value="${m}"${p.mode === m ? ' selected' : ''}>${esc(t('email' + m[0].toUpperCase() + m.slice(1)))}</option>`).join('')}</select></label>`;
  }

  // ----- report sheet (overlay) -----
  function reportSheet() {
    const r = ui.report; if (!r) return '';
    return `<div class="sheet-bg" data-action="closeReport"></div><section class="sheet" role="dialog" aria-modal="true" aria-label="${esc(t('reportTitle'))}">
      <h2 class="h2 tight">${icon('flag', 20)} ${esc(t('reportTitle'))}</h2>
      <span class="label">${esc(t('reportWhat'))}</span>
      <div class="row-wrap">${REPORT_CATS.map((c) => `<button class="pill ${r.cat === c ? 'on' : ''}" data-action="reportCat" data-v="${c}">${esc(t('rc_' + c))}</button>`).join('')}</div>
      <label class="label" for="rep-text">${esc(t('reportDetails'))}</label>
      <textarea id="rep-text" class="input" rows="3" maxlength="500"></textarea>
      <div class="row-gap"><button class="btn ghost grow" data-action="closeReport">${esc(t('cancel'))}</button><button class="btn primary grow" data-action="sendReport">${esc(t('sendReport'))}</button></div>
    </section>`;
  }

  // ----- organiser panel -----
  function demoAdmin() {
    const now = Date.now();
    return { loaded: true, ctx: (ui.adm && ui.adm.ctx) || {},
      stats: { members: Object.keys(MEMBERS).length + 1, books_available: S.books.filter((b) => b.status === 'available' && !b.hidden).length,
        books_gone_year: S.books.filter((b) => b.status === 'gone').length, requests_open: S.threads.filter((x) => ['pending', 'accepted', 'scheduled'].indexOf(x.status) >= 0).length,
        reports_open: S.reports.filter((r) => !r.resolved).length, hidden_books: S.books.filter((b) => b.hidden).length },
      admins: S.demoAdmins || (S.demoAdmins = [{ id: MINE, email: 'you@example.com', name: S.me ? S.me.name : '', self: true }]),
      reports: S.reports, log: S.modLog || (S.modLog = []), bans: S.demoBans || (S.demoBans = []) };
  }
  async function loadAdmin() {
    if (ui.adm && ui.adm.loading) return;
    ui.adm = Object.assign(ui.adm || {}, { loading: true });
    try {
      if (LIVE) {
        const g = live.group.id;
        const res = await Promise.all([Backend.orgStats(g), Backend.adminList(), Backend.orgReports(g), Backend.orgLog(g), Backend.orgBans(g)]);
        ui.adm = { loaded: true, ctx: ui.adm.ctx || {}, stats: res[0],
          admins: res[1].map((x) => ({ id: x.user_id, email: x.email, name: x.display_name, self: x.user_id === live.uid })),
          reports: res[2].map((r) => ({ id: r.id, from: r.reporter_id === live.uid ? MINE : r.reporter_id, type: r.target_type, target: r.target_id, cat: r.category, text: r.reason,
            at: Date.parse(r.created_at), resolved: !!r.resolved_at, resolution: r.resolution })),
          log: res[3].map((l) => ({ actor: l.actor_id === live.uid ? MINE : l.actor_id, action: l.action, target: l.target, reason: l.reason, at: Date.parse(l.created_at) })),
          bans: res[4].map((b) => ({ user: b.user_id, reason: b.reason, at: Date.parse(b.created_at) })) };
      } else ui.adm = demoAdmin();
    } catch (e) { ui.adm = { loaded: true, error: friendlyError(e), ctx: {} }; }
    render();
  }
  function reportTarget(r) {
    if (r.type === 'book') { const b = book(r.target); return b ? `<a class="ulink" href="#/book/${esc(b.id)}">${esc(b.title)}</a>${b.hidden ? ` <span class="badge b-res">${esc(t('hiddenBadge'))}</span>` : ''}` : esc(r.target); }
    if (r.type === 'member') return MEMBERS[r.target] ? memberLink(r.target) : '—';
    return `<button class="link small" data-action="admCtx" data-v="${esc(r.id)}">${esc(t('viewConversation'))}</button>`;
  }
  function viewAdmin(tab) {
    if (!isOrganiser()) return `<main class="pad">${esc(t('noResults'))}</main>`;
    if (!ui.adm || !ui.adm.loaded) { setTimeout(loadAdmin, 0); return `<main class="pad"><h1 class="h1">${esc(t('adminTitle'))}</h1><p class="muted">${esc(t('loading'))}</p></main>`; }
    const a = ui.adm; tab = tab || 'overview';
    const tabs = ['overview', 'members', 'reports', 'admins', 'log'].map((k) => `<a class="pill ${tab === k ? 'on' : ''}" href="#/admin/${k}">${esc(t('tab' + k[0].toUpperCase() + k.slice(1)))}${k === 'reports' && a.stats && a.stats.reports_open ? ` <span class="count-inline">${a.stats.reports_open}</span>` : ''}</a>`).join('');
    let body = '';
    if (a.error) body = `<div class="notice warn">${esc(a.error)}</div>`;
    else if (tab === 'overview') {
      const st = a.stats || {};
      const tile = (n, k) => `<div class="stat"><div class="stat-n">${esc(n == null ? '–' : n)}</div><div class="stat-l">${esc(t(k))}</div></div>`;
      body = `<div class="stats six">${tile(st.members, 'stMembers')}${tile(st.books_available, 'stAvailable')}${tile(st.books_gone_year, 'stGoneYear')}${tile(st.requests_open, 'stOpenRequests')}${tile(st.reports_open, 'stOpenReports')}${tile(st.hidden_books, 'stHidden')}</div>
        <section class="card pad-m"><h2 class="h3">${icon('logo', 20)} ${esc(t('announceTitle'))}</h2>
          <label class="sr" for="adm-ann">${esc(t('announceTitle'))}</label><textarea id="adm-ann" class="input" rows="3" maxlength="500" placeholder="${esc(t('announcePh'))}"></textarea>
          <button class="btn primary" data-action="admAnnounce">${icon('send', 20)} ${esc(t('announceSend'))}</button></section>`;
    } else if (tab === 'members') {
      const ids = [MINE].concat(Object.keys(MEMBERS));
      const role = () => 'member';
      body = `<div class="adm-list">${ids.map((id) => {
        const r = role(id); const listed = S.books.filter((b) => b.owner === id && b.status === 'available').length;
        return `<div class="adm-row">${avatarHtml(id, 'sm')}<div class="grow"><div class="bold">${id === MINE ? esc(memberName(id)) : memberLink(id)} ${r === 'organiser' ? `<span class="badge b-swap">${esc(t('roleOrganiser'))}</span>` : ''}</div>
          <div class="muted small">${icon('pin', 12)} ${esc(near(id).label || (S.me && S.me.postal) || '')} · ${listed} ${esc(t('booksN'))}</div>${ratingHtml(id, 12)}</div>
          ${id === MINE ? '' : `<div class="adm-actions"><button class="btn danger sm" data-action="admRemove" data-v="${esc(id)}">${esc(t('removeMember'))}</button></div>`}</div>`;
      }).join('')}</div>
      ${a.bans && a.bans.length ? `<h2 class="h3">${esc(t('bannedTitle'))}</h2><div class="adm-list">${a.bans.map((b) => `<div class="adm-row"><div class="grow"><div class="bold">${esc(b.name || b.user.slice(0, 8))}</div><div class="muted small">${esc(b.reason)}</div></div><button class="btn ghost sm" data-action="admUnban" data-v="${esc(b.user)}">${esc(t('unban'))}</button></div>`).join('')}</div>` : ''}`;
    } else if (tab === 'reports') {
      const open = (a.reports || []).filter((r) => !r.resolved); const done = (a.reports || []).filter((r) => r.resolved);
      const card = (r) => `<div class="card pad-m report">
        <div class="row-between"><span class="badge ${r.resolved ? 'b-give' : 'b-sell'}">${esc(t('rc_' + (r.cat || 'other')))}</span><span class="muted tiny">${esc(fmtDate(new Date(r.at)))}</span></div>
        <div class="small">${esc(t('reportedBy', { name: firstName(r.from) }))} · ${reportTarget(r)}</div>
        ${r.text ? `<p class="small">“${esc(r.text)}”</p>` : ''}
        ${a.ctx[r.id] ? `<div class="ctx">${a.ctx[r.id].map((m) => `<div class="small"><b>${esc(m.kind === 'system' ? '·' : firstName(m.from))}</b> ${esc(m.body || '')}</div>`).join('') || '—'}</div>` : ''}
        ${r.resolved ? `<div class="muted small">${icon('check', 14)} ${esc(r.resolution || '')}</div>` : `<div class="row-wrap">
          <button class="btn primary sm" data-action="admResolve" data-v="${esc(r.id)}">${esc(t('resolve'))}</button>
          ${r.type === 'book' && book(r.target) ? `<button class="btn ghost sm" data-action="admHide" data-v="${esc(r.target)}" data-hide="${book(r.target).hidden ? '0' : '1'}">${esc(t(book(r.target).hidden ? 'unhideListing' : 'hideListing'))}</button>` : ''}
          ${r.type === 'member' && MEMBERS[r.target] ? `<button class="btn danger sm" data-action="admRemove" data-v="${esc(r.target)}">${esc(t('removeMember'))}</button>` : ''}</div>`}
      </div>`;
      const hidden = S.books.filter((b) => b.hidden);
      body = (open.length ? `<h2 class="h3">${esc(t('openReports'))}</h2>${open.map(card).join('')}` : `<div class="card pad-m empty">${esc(t('noReports'))}</div>`) +
        (hidden.length ? `<h2 class="h3">${esc(t('hiddenListings'))}</h2><div class="adm-list">${hidden.map((b) => `<div class="adm-row">${cover(b, 'xs')}<div class="grow"><a class="bold ulink" href="#/book/${esc(b.id)}">${esc(b.title)}</a><div class="muted small">${esc(memberName(b.owner))}</div></div><button class="btn ghost sm" data-action="admHide" data-v="${esc(b.id)}" data-hide="0">${esc(t('unhideListing'))}</button></div>`).join('')}</div>` : '') +
        (done.length ? `<h2 class="h3">${esc(t('resolvedReports'))}</h2>${done.map(card).join('')}` : '');
    } else if (tab === 'admins') {
      const list = a.admins || [];
      body = `<section class="card pad-m"><h2 class="h3">${icon('shield', 20)} ${esc(t('adminsTitle'))}</h2><p class="muted small">${esc(t('adminsHint'))}</p>
          <div class="adm-list">${list.map((x) => `<div class="adm-row"><div class="grow"><div class="bold">${esc(x.name || '—')}${x.self ? ' ' + esc(t('youLabel')) : ''}</div><div class="muted small">${esc(x.email || '')}</div></div>
            ${list.length > 1 ? `<button class="btn ghost sm" data-action="admRemoveAdmin" data-v="${esc(x.id)}" data-name="${esc(x.name || x.email || '')}">${esc(t('removeAdmin'))}</button>` : ''}</div>`).join('')}</div>
          <form class="row-gap" data-action-submit="addAdmin"><label class="sr" for="adm-email">${esc(t('emailLabel'))}</label>
            <input id="adm-email" class="input grow" type="email" maxlength="200" placeholder="${esc(t('adminEmailPh'))}">
            <button class="btn primary" type="submit">${esc(t('addAdmin'))}</button></form></section>`;
    } else if (tab === 'log') {
      body = `<section class="card pad-m"><h2 class="h3">${esc(t('modLog'))}</h2>${(a.log || []).length ? `<ul class="reviews">${a.log.map((l) => `<li><div class="small"><b>${esc(firstName(l.actor))}</b> · ${esc(l.action)}${l.reason ? ' – ' + esc(l.reason) : ''}</div><div class="muted tiny">${esc(fmtDate(new Date(l.at)))}</div></li>`).join('')}</ul>` : `<p class="muted">${esc(t('noLog'))}</p>`}</section>`;
    }
    return `<main class="pad"><button class="back" data-action="go" data-v="#/profile">${icon('back', 20)} ${esc(t('back'))}</button>
      <h1 class="h1">${esc(t('adminTitle'))}</h1><div class="row-wrap tabs">${tabs}</div>${body}</main>`;
  }

  // ----- platform admin (all groups) -----
  async function loadPlatform() {
    if (ui.plat && ui.plat.loading) return;
    ui.plat = { loading: true };
    try {
      if (LIVE) { const r = await Promise.all([Backend.adminOverview(), Backend.adminReports()]); ui.plat = { loaded: true, groups: r[0], reports: r[1] }; }
      else ui.plat = { loaded: true, groups: [{ group_id: 'demo', name: t('groupName'), created_at: new Date().toISOString(), members: Object.keys(MEMBERS).length + 1, books: S.books.length, open_reports: S.reports.filter((x) => !x.resolved).length, organisers: S.me ? S.me.name : '' }], reports: [] };
    } catch (e) { ui.plat = { loaded: true, error: friendlyError(e), groups: [], reports: [] }; }
    render();
  }
  function viewPlatform() {
    if (LIVE && !live.isAdmin) return `<main class="pad">${esc(t('noResults'))}</main>`;
    if (!ui.plat || !ui.plat.loaded) { setTimeout(loadPlatform, 0); return `<main class="pad"><h1 class="h1">${esc(t('platformTitle'))}</h1><p class="muted">${esc(t('loading'))}</p></main>`; }
    const p = ui.plat;
    return `<main class="pad"><button class="back" data-action="go" data-v="#/profile">${icon('back', 20)} ${esc(t('back'))}</button>
      <h1 class="h1">${esc(t('platformTitle'))}</h1>${p.error ? `<div class="notice warn">${esc(p.error)}</div>` : ''}
      <h2 class="h3">${esc(t('groupsTitle'))}</h2><div class="adm-list">${p.groups.map((g) => `<div class="adm-row"><div class="grow"><div class="bold">${esc(g.name)}</div>
        <div class="muted small">${esc(String(g.members))} ${esc(t('stMembers').toLowerCase())} · ${esc(String(g.books))} ${esc(t('booksN'))} · ${esc(String(g.open_reports))} ${esc(t('stOpenReports').toLowerCase())}</div><div class="muted tiny">${esc(g.organisers || '')} · ${esc(fmtDate(new Date(g.created_at)))}</div></div>
        ${LIVE ? `<button class="btn danger sm" data-action="platDelete" data-v="${esc(g.group_id)}" data-name="${esc(g.name)}">${esc(t('deleteGroup'))}</button>` : ''}</div>`).join('')}</div>
      <h2 class="h3">${esc(t('allReports'))}</h2>${p.reports.length ? `<div class="adm-list">${p.reports.map((r) => `<div class="adm-row"><div class="grow"><span class="badge b-sell">${esc(t('rc_' + r.category))}</span> <span class="small bold">${esc(r.group_name)}</span><div class="small">${esc(r.reason || '')}</div><div class="muted tiny">${esc(fmtDate(new Date(r.created_at)))}</div></div></div>`).join('')}</div>` : `<p class="muted">${esc(t('noReports'))}</p>`}
    </main>`;
  }

  // ----- actions -----
  function markRead(ids) {
    S.notifications.forEach((n) => { if (!ids || ids.indexOf(n.id) >= 0) n.read = true; });
    if (LIVE) Backend.markNotificationsRead(live.uid, ids).catch(() => {}); else save();
  }
  function demoLog(action, target, reason) { (S.modLog = S.modLog || []).unshift({ actor: MINE, action: action, target: target || '', reason: reason || '', at: Date.now() }); save(); }
  async function admDo(fn, ok) {
    try { await fn(); if (ok) toast(ok); } catch (e) { toast(friendlyError(e)); }
    if (LIVE) await refreshAll().catch(() => {});
    ui.adm.loaded = false; loadAdmin();
  }
  Object.assign(A, {
    openNotif: (el) => {
      const n = S.notifications.find((x) => String(x.id) === el.dataset.v); if (!n) return;
      markRead([n.id]); const link = notifLink(n);
      if (link) go(link); else render();
    },
    readAllNotifs: () => { markRead(null); render(); },
    togglePref: (el) => {
      const arr = S.notifPrefs[el.dataset.ch]; const i = arr.indexOf(el.dataset.v);
      if (i >= 0) arr.splice(i, 1); else arr.push(el.dataset.v);
      if (!LIVE) save(); render();
    },
    savePrefs: async () => {
      if (LIVE) { try { await Backend.savePrefs(live.uid, Object.assign({ lang: S.lang }, S.notifPrefs)); toast(t('saved2')); } catch (e) { toast(friendlyError(e)); } }
      else { save(); toast(t('saved2')); }
    },
    openReport: (el) => { ui.report = { type: el.dataset.type, id: el.dataset.v, cat: 'other' }; render(); },
    reportCat: (el) => { const txt = document.getElementById('rep-text'); ui.reportText = txt ? txt.value : ''; ui.report.cat = el.dataset.v; render(); const t2 = document.getElementById('rep-text'); if (t2) t2.value = ui.reportText || ''; },
    closeReport: () => { ui.report = null; render(); },
    sendReport: async () => {
      const r = ui.report; const text = (document.getElementById('rep-text').value || '').trim().slice(0, 500);
      if (LIVE) { try { await Backend.report(live.group.id, live.uid, r.type, r.id, text, r.cat); } catch (e) { toast(friendlyError(e)); return; } }
      else { S.reports.unshift({ id: uid('rep'), from: MINE, type: r.type, target: r.id, cat: r.cat, text: text, at: Date.now(), resolved: false }); save(); }
      ui.report = null; toast(t('reported'));
    },
    admAnnounce: () => {
      const text = (document.getElementById('adm-ann').value || '').trim();
      if (text.length < 2) return;
      if (LIVE) admDo(async () => { const n = await Backend.orgAnnounce(live.group.id, text); toast(t('announced', { n: n })); });
      else { S.notifications.unshift({ id: uid('n'), type: 'announcement', data: { text: text, actor: MINE }, at: Date.now(), read: false }); demoLog('announce', '', text); admDo(() => {}, t('announced', { n: Object.keys(MEMBERS).length + 1 })); }
    },
    admRole: (el) => {
      const id = el.dataset.v; const role = el.dataset.role;
      if (LIVE) admDo(() => Backend.orgSetRole(live.group.id, id, role), t('saved2'));
      else { MEMBERS[id].role = role; demoLog('set_role:' + role, id); admDo(() => {}, t('saved2')); }
    },
    admRemove: (el) => {
      const id = el.dataset.v; const name = memberName(id);
      const reason = window.prompt(t('removeReasonPrompt', { name: name }));
      if (reason === null) return;
      const ban = window.confirm(t('banConfirm', { name: name }));
      if (LIVE) admDo(() => Backend.orgRemoveMember(live.group.id, id, reason, ban), t('saved2'));
      else {
        if (ban) S.demoBans.push({ user: id, name: name, reason: reason, at: Date.now() });
        delete MEMBERS[id]; S.books = S.books.filter((b) => b.owner !== id);
        demoLog(ban ? 'remove_and_ban' : 'remove', id, reason); admDo(() => {}, t('saved2'));
      }
    },
    admUnban: (el) => {
      if (LIVE) admDo(() => Backend.orgUnban(live.group.id, el.dataset.v), t('saved2'));
      else { S.demoBans = S.demoBans.filter((b) => b.user !== el.dataset.v); demoLog('unban', el.dataset.v); admDo(() => {}, t('saved2')); }
    },
    admHide: (el) => {
      const id = el.dataset.v; const hide = el.dataset.hide === '1';
      if (LIVE) admDo(() => Backend.orgHideBook(id, hide, ''), t('saved2'));
      else { const b = book(id); if (b) b.hidden = hide; demoLog(hide ? 'hide_book' : 'unhide_book', id); admDo(() => {}, t('saved2')); }
    },
    admResolve: (el) => {
      const note = window.prompt(t('resolvePrompt')); if (note === null) return;
      const id = el.dataset.v;
      if (LIVE) admDo(() => Backend.orgResolveReport(Number(id), note), t('saved2'));
      else { const r = S.reports.find((x) => String(x.id) === id); if (r) { r.resolved = true; r.resolution = note; } demoLog('resolve_report', id, note); admDo(() => {}, t('saved2')); }
    },
    admCtx: async (el) => {
      const id = el.dataset.v;
      try {
        if (LIVE) {
          const rows = await Backend.orgReportContext(Number(id));
          ui.adm.ctx[id] = rows.slice().reverse().map((m) => ({ from: m.sender_id === live.uid ? MINE : m.sender_id, kind: m.kind, body: m.kind === 'system' ? t(m.sys_key || '') : m.body }));
        } else {
          const r = S.reports.find((x) => String(x.id) === id); const th = r && S.threads.find((x) => x.id === r.target);
          ui.adm.ctx[id] = th ? th.messages.slice(-30).map((m) => ({ from: m.from, kind: m.from === 'system' ? 'system' : 'user', body: m.from === 'system' ? msgText(m) : m.text })) : [];
        }
      } catch (e) { toast(friendlyError(e)); }
      render();
    },
    admRemoveAdmin: (el) => {
      if (!window.confirm(t('confirmRemoveAdmin', { name: el.dataset.name }))) return;
      if (LIVE) admDo(async () => { await Backend.adminRemove(el.dataset.v); live.isAdmin = await Backend.isPlatformAdmin(); }, t('saved2'));
      else { S.demoAdmins = S.demoAdmins.filter((x) => x.id !== el.dataset.v); demoLog('remove_admin', el.dataset.v); admDo(() => {}, t('saved2')); }
    },
    admRevoke: (el) => {
      if (LIVE) admDo(() => Backend.orgRevokeInvite(el.dataset.v), t('saved2'));
      else { const i = S.demoInvites.find((x) => x.id === el.dataset.v); if (i) i.revoked = true; demoLog('revoke_invite', el.dataset.v); admDo(() => {}, t('saved2')); }
    },
    admSaveGroup: () => {
      const f = { name: document.getElementById('gs-name').value.trim().slice(0, 80), handover_place: document.getElementById('gs-place').value.trim().slice(0, 80), handover_day: document.getElementById('gs-day').value || null };
      if (f.name.length < 2) { toast(t('groupNameRequired')); return; }
      if (LIVE) admDo(async () => { await Backend.updateGroup(live.group.id, f); Object.assign(live.group, f); }, t('saved2'));
      else { S.groupSettings = f; save(); toast(t('saved2')); render(); }
    },
    platDelete: (el) => {
      const typed = window.prompt(t('deleteGroupConfirm', { name: el.dataset.name }));
      if (typed !== el.dataset.name) return;
      Backend.adminDeleteGroup(el.dataset.v).then(() => { ui.plat = null; render(); }).catch((e) => toast(friendlyError(e)));
    }
  });
  if (!LIVE) {
    // demo: invite codes work locally so the panel can be explored
    A.createInvite = () => { const c = Math.random().toString(36).slice(2, 10).toUpperCase(); live.newInvite = c; S.demoInvites.unshift({ id: uid('i'), created_at: Date.now(), expires_at: Date.now() + 30 * 864e5, revoked: false }); render(); };
    A.copyInvite = () => { if (navigator.clipboard) navigator.clipboard.writeText(live.newInvite).then(() => toast(t('copied'))); };
  }

  $app.addEventListener('click', (e) => {
    const el = e.target.closest('[data-action]');
    if (!el || !$app.contains(el)) return;
    const fn = A[el.dataset.action];
    if (!fn) return;
    if (el.tagName === 'INPUT' && el.type === 'checkbox') { fn(el); return; }
    e.preventDefault(); fn(el);
  });
  $app.addEventListener('submit', (e) => {
    const f = e.target.closest('[data-action-submit]'); if (!f) return;
    e.preventDefault();
    const kind = f.dataset.actionSubmit;
    if (kind === 'sendMsg') {
      const box = document.getElementById('msgbox'); const text = (box.value || '').trim().slice(0, 1000);
      if (!text) return;
      if (looksLikeCopySharing(text)) { toast(t('copyBlocked')); return; }
      const th = S.threads.find((x) => x.id === f.dataset.v);
      if (LIVE) { box.value = ''; liveAct(() => Backend.sendMessage(th.id, live.uid, text)); return; }
      th.messages.push({ from: MINE, text: text, at: Date.now() }); box.value = ''; save(); render();
    } else if (kind === 'addAdmin') {
      const email = (document.getElementById('adm-email').value || '').trim();
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { toast(t('emailInvalid')); return; }
      if (LIVE) admDo(() => Backend.adminAdd(email), t('adminAdded'));
      else { S.demoAdmins.push({ id: uid('a'), email: email, name: '', self: false }); demoLog('add_admin', email); admDo(() => {}, t('adminAdded')); }
    } else if (kind === 'sendCode') liveSendCode(document.getElementById('si-email').value);
    else if (kind === 'verifyCode') liveVerify(document.getElementById('si-code').value);
    else if (kind === 'lookupTyped') lookupIsbn(document.getElementById('isbn').value);
    else if (kind === 'titleSearch') titleSearch(document.getElementById('tsearch').value);
  });
  let qTimer;
  $app.addEventListener('input', (e) => {
    const el = e.target; const kind = el.dataset && el.dataset.input; if (!kind) return;
    if (kind === 'onbName') ui.onbName = el.value;
    else if (kind === 'onbCode') live.invite = el.value;
    else if (kind === 'onbGroup') ui.onbGroup = el.value;
    else if (kind === 'onbPostal') ui.onbPostal = el.value;
    else if (kind === 'q') { ui.q = el.value; clearTimeout(qTimer); qTimer = setTimeout(render, 250); }
    else if (kind === 'draft') { ui.draft[el.dataset.field] = el.value; }
    else if (kind === 'cartMsg') { const o = el.dataset.owner; (S.cartMeta[o] = S.cartMeta[o] || { offered: [], msg: '' }).msg = el.value; save(); }
  });
  $app.addEventListener('change', (e) => {
    const el = e.target; if (!el.dataset) return;
    if (el.dataset.change === 'photo' && el.files && el.files[0]) handlePhoto(el.files[0]);
    else if (el.dataset.change === 'onbCountry') ui.onbCountry = el.value;
    else if (el.dataset.change === 'prefMode') { S.notifPrefs.mode = el.value; if (!LIVE) save(); }
    else if (el.dataset.change === 'avatar' && el.files && el.files[0]) handleAvatar(el.files[0]);
    else if (el.dataset.change === 'barcodePhoto' && el.files && el.files[0]) scanPhoto(el.files[0]);
  });

  initCountry();
  render();
  if (LIVE) boot();
})();
