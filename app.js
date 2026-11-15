/* Book Swap prototype – plain JavaScript, no build step.
   All data lives in localStorage on this device. Every piece of user text is
   escaped before it is put on the page (see esc()). */
(function () {
  'use strict';

  const KEY = 'bookswap-v1';
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
    return {
      v: 1, lang: detectLang(), me: null, interested: ['lt', 'es', 'en'],
      books: clone(SAMPLE_BOOKS).map((b) => Object.assign({ status: 'available', isbn: '' }, b)),
      cart: [], cartMeta: {}, threads: clone(SAMPLE_THREADS).map((t) => Object.assign({ unread: true }, t)),
      received: [], wishes: clone(SAMPLE_WISHES), agreed: null
    };
  }
  function migrate(s) {
    if (!s) return null;
    if (!s.wishes) s.wishes = clone(SAMPLE_WISHES);
    if (s.agreed === undefined) s.agreed = null;
    s.v = 2;
    return s;
  }
  function load() {
    try { const raw = localStorage.getItem(KEY); return raw ? JSON.parse(raw) : null; } catch (e) { return null; }
  }
  let S = migrate(load()) || fresh();
  const initCountry = () => { ui.onbCountry = (S.me && S.me.country) || guessCountry(); };
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { toast('Storage full – try removing a photo.'); }
  }

  const ui = {
    q: '', fLang: 'all', fTopic: null, fAge: null,
    draft: null, addStep: 'scan', addMsg: '', addMsgKind: '', searchResults: [], busy: false, lastSaved: null,
    ticks: {}, showOffer: {}, toast: '', onbName: '', onbPostal: '', onbCountry: '', onbAgree: false, fNear: false, ex: {}, addMode: 'shelf', lastWish: null, scanner: null, chatTab: 'active'
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
  const memberName = (id) => (id === MINE ? (S.me ? S.me.name : '') : (MEMBERS[id] ? MEMBERS[id].name : id));
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
      <div class="logo-big">${icon('logo', 44)}</div>
      <h1>${esc(t('welcomeTitle'))}</h1>
      ${S.me ? `<div class="notice warn">${esc(S.agreed && S.agreed.version === TERMS.version ? t('profileIncomplete') : t('termsUpdated'))}</div>` : ''}
      <p class="lead">${esc(t('welcomeText'))}</p>
      <div class="card invite"><div class="muted small">${esc(t('invitedTo'))}</div><div class="h3">${esc(t('groupName'))}</div></div>
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
      <div class="notice">${icon('shield', 20)} <span>${esc(t('p2pNote'))}</span></div>
      <label class="toggle agree"><input id="onb-agree" type="checkbox" data-action="toggleAgree" ${ui.onbAgree ? 'checked' : ''}>
        <span>${esc(t('acceptTerms'))} <a class="ulink" href="#/terms">${esc(t('termsLink'))}</a></span></label>
      ${ui.onbError ? `<div class="notice warn" role="alert">${esc(ui.onbError)}</div>` : ''}
      <button class="btn primary big" data-action="join">${esc(S.me ? t('continue') : t('join'))}</button>
      <p class="muted small center">${esc(t('demoNote'))}</p>
    </main>`;
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
    return `<header class="top"><a class="brand" href="#/">${'<span class="logo">' + icon('logo', 20) + '</span>'}
      <span><span class="brand-name">${esc(t('appName'))}</span><span class="brand-group">${esc(t('groupName'))}</span></span></a>
      <div class="langs">${langs}</div></header>`;
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
    const others = S.books.filter((b) => b.owner !== MINE && b.status !== 'gone');
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
          <span class="avatar sm">${esc(memberName(w.id).slice(0, 1))}</span><span class="grow"><span class="bold block">${esc(firstName(w.id))}</span>
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
    if (b.owner === MINE) actions = `<div class="notice">${esc(t('yourBook'))}</div>`;
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
        <dt>${esc(t('owner'))}</dt><dd>${b.owner === MINE ? esc(memberName(b.owner)) : memberLink(b.owner)}</dd>
        ${b.owner !== MINE ? `<dt>${esc(t('location'))}</dt><dd>${icon('pin', 14)} ${esc(near(b.owner).label)}</dd>` : ''}
        <dt>${esc(t('language'))}</dt><dd>${esc(langName(b.lang))}</dd>
        <dt>${esc(t('age'))}</dt><dd>${esc(t('years', { a: b.age }))}</dd>
        <dt>${esc(t('condition'))}</dt><dd>${esc(t(condKey))}</dd>
        ${b.isbn ? `<dt>${esc(t('isbn'))}</dt><dd>${esc(b.isbn)}</dd>` : ''}
      </dl>
      ${b.owner !== MINE ? `<a class="btn ghost big" href="#/member/${esc(b.owner)}">${icon('swapArrows')} ${esc(t('tailored'))}</a>` : ''}
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
      <div class="row-gap"><div class="avatar">${esc(memberName(id).slice(0, 1))}</div>
        <div><h1 class="h1 tight">${esc(memberName(id))}</h1><div class="muted bold">${icon('pin', 14)} ${esc(near(id).label)}</div></div></div>
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
      const meta = S.cartMeta[owner] || { offered: [], msg: t('defaultMsg') };
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
        <textarea id="msg-${esc(owner)}" class="input" rows="3" maxlength="500" placeholder="${esc(t('messagePh'))}" data-input="cartMsg" data-owner="${esc(owner)}">${esc(meta.msg)}</textarea>
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

  function viewChat(id) {
    const th = S.threads.find((x) => x.id === id);
    if (!th) return `<main class="pad">${esc(t('messagesEmpty'))}</main>`;
    if (th.unread) { th.unread = false; save(); }
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
      control = `<div class="notice ok">${icon('check')} ${esc(t('doneMsg'))}</div>`;
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
        <button class="icon-btn" data-action="report" aria-label="${esc(t('report'))}" title="${esc(t('report'))}">${icon('flag', 18)}</button></div>
      <section class="card bundle pinned">
        <div class="h3">${esc(isOwner ? t('theyWant', { name: other }) : t('youWant'))}</div>${bookLines}
        ${offered ? `<div class="h3">${esc(isOwner ? t('theyOffer') : t('youOffer'))}</div>${offered}` : ''}
        ${control}
        <div class="safety">${icon('shield', 16)} <span>${esc(t('p2pNote'))} <a class="ulink" href="#/terms">${esc(t('viewTerms'))}</a></span></div>
      </section>
      <div class="msgs">${msgs}</div>
      ${canChat ? `<div class="quick">${['qr1', 'qr2', 'qr3'].map((k) => `<button class="pill" data-action="quick" data-thread="${esc(th.id)}" data-v="${k}">${esc(t(k))}</button>`).join('')}</div>
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
      <div class="row-gap"><div class="avatar">${esc((S.me.name || '?').slice(0, 1).toUpperCase())}</div>
        <div><h1 class="h1 tight">${esc(S.me.name)}</h1><div class="muted bold">${esc(t('memberOf', { group: t('groupName') }))}</div><div class="muted small">${icon('pin', 12)} ${esc((S.me.postal || '') + ', ' + countryName(S.me.country))}</div></div></div>
      <div class="stats">${stat(mine.length, 'statListed')}${stat(given.length, 'statGiven')}${stat(S.received.length, 'statReceived')}${stat('€' + saved, 'statSaved')}</div>
      <div class="muted tiny">${esc(t('statsPrivate'))}</div>
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
      <h2 class="h2">${esc(t('myShelf'))}</h2>
      ${mine.length ? `<div class="grid">${mine.map((b) => bookCard(b, 'grid')).join('')}</div>` : `<div class="card pad-m empty">${esc(t('shelfEmpty'))}</div>`}
      <section class="card pad-m"><h2 class="h3">${esc(t('settings'))}</h2>
        <p class="muted small">${esc(t('privacy'))}</p>
        <a class="btn ghost" href="#/terms">${icon('doc', 20)} ${esc(t('viewTerms'))}</a>
        ${S.agreed ? `<p class="muted tiny center">${esc(t('acceptedOn', { date: fmtDate(new Date(S.agreed.at)) }))}</p>` : ''}
        <button class="btn ghost" data-action="exportData">${icon('download', 20)} ${esc(t('exportData'))}</button>
        <button class="btn danger" data-action="deleteAll">${icon('trash', 20)} ${esc(t('deleteAccount'))}</button></section>
    </main>`;
  }

  // ---------- render ----------
  function route() {
    const parts = (location.hash || '#/').slice(2).split('/');
    return { name: parts[0] || '', id: parts[1] ? decodeURIComponent(parts[1]) : null };
  }
  let lastRoute = null;
  function render() {
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
    if (needsOnboarding()) body = r.name === 'terms' ? viewTerms() : viewOnboarding();
    else {
      const v = { '': viewBrowse, book: () => viewBook(r.id), requests: viewRequests, messages: viewMessages,
        chat: () => viewChat(r.id), add: viewAdd, profile: viewProfile, member: () => viewMember(r.id), terms: viewTerms }[r.name] || viewBrowse;
      body = header() + v() + nav(r.name);
    }
    $app.innerHTML = body + (ui.toast ? `<div class="toast" role="status">${esc(ui.toast)}</div>` : '');
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
  function setStatus(ids, status) { ids.forEach((id) => { const b = book(id); if (b) b.status = status; }); }

  function sendRequest(owner) {
    const ids = S.cart.filter((id) => { const b = book(id); return b && b.owner === owner; });
    if (!ids.length) return;
    const meta = S.cartMeta[owner] || { offered: [], msg: t('defaultMsg') };
    const th = { id: uid('t'), with: owner, role: 'requester', books: ids, offered: meta.offered.slice(), accepted: [], status: 'pending',
      handover: null, unread: false, messages: [] };
    const text = (meta.msg || '').trim();
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
    out.source = a.source + ' + ' + b.source;
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
    const results = await Promise.all([googleByIsbn(isbn, isbn10).catch(() => null), openLibraryByIsbn(isbn, isbn10).catch(() => null)]);
    const found = await findDescription(mergeFound(results[0], results[1])).catch(() => mergeFound(results[0], results[1]));
    ui.busy = false; ui.busyIsbn = '';
    if (found && found.title) {
      found.isbn = isbn;
      startDraft(found);
      ui.addMsg = t('foundIsbn', { isbn: isbn, src: found.source }) + (found.description ? '' : ' ' + t('noDescFound')); ui.addMsgKind = 'ok';
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

  // ---------- actions ----------
  const A = {
    setLang: (el) => { S.lang = el.dataset.v; save(); render(); },
    toggleInterest: (el) => { const v = el.dataset.v; const i = S.interested.indexOf(v); if (i >= 0) S.interested.splice(i, 1); else S.interested.push(v); save(); render(); },
    toggleAgree: (el) => { ui.onbAgree = el.checked; },
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
      const titles = (ids) => ids.map((x) => (book(x) || {}).title).filter(Boolean).join(', ');
      S.cartMeta[id] = { offered: ex.give.slice(),
        msg: ex.give.length ? t('exchangeMsg', { give: titles(ex.give), get: titles(ex.get) }) : t('exchangeMsgPlain', { get: titles(ex.get) }) };
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
      const o = el.dataset.owner; const m = S.cartMeta[o] = S.cartMeta[o] || { offered: [], msg: t('defaultMsg') };
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
      th.messages.push({ from: MINE, text: t(el.dataset.v), at: Date.now() }); save(); render();
    },
    report: () => toast(t('reported')),
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
      th.messages.push({ from: MINE, text: text, at: Date.now() }); box.value = ''; save(); render();
    } else if (kind === 'lookupTyped') lookupIsbn(document.getElementById('isbn').value);
    else if (kind === 'titleSearch') titleSearch(document.getElementById('tsearch').value);
  });
  let qTimer;
  $app.addEventListener('input', (e) => {
    const el = e.target; const kind = el.dataset && el.dataset.input; if (!kind) return;
    if (kind === 'onbName') ui.onbName = el.value;
    else if (kind === 'onbPostal') ui.onbPostal = el.value;
    else if (kind === 'q') { ui.q = el.value; clearTimeout(qTimer); qTimer = setTimeout(render, 250); }
    else if (kind === 'draft') { ui.draft[el.dataset.field] = el.value; }
    else if (kind === 'cartMsg') { const o = el.dataset.owner; (S.cartMeta[o] = S.cartMeta[o] || { offered: [], msg: '' }).msg = el.value; save(); }
  });
  $app.addEventListener('change', (e) => {
    const el = e.target; if (!el.dataset) return;
    if (el.dataset.change === 'photo' && el.files && el.files[0]) handlePhoto(el.files[0]);
    else if (el.dataset.change === 'onbCountry') ui.onbCountry = el.value;
    else if (el.dataset.change === 'barcodePhoto' && el.files && el.files[0]) scanPhoto(el.files[0]);
  });

  initCountry();
  render();
})();
