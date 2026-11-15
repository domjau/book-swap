/* Topics, sample members and sample books for the prototype. */
window.BOOK_LANGS = ['lt', 'es', 'en', 'da', 'fr', 'de', 'pl', 'ru', 'uk', 'lv', 'sv', 'no', 'it', 'pt', 'other'];
window.AGES = ['0–3', '3–6', '7–9', '10+'];

window.TOPICS = [
  { id: 'dinosaurs', color: '#C2410C', names: { lt: 'Dinozaurai', es: 'Dinosaurios', en: 'Dinosaurs' },
    icon: 'M3 18c2.5 0 3.5-1.5 4.5-3.5S10 11 13 11h2V7.5A2.5 2.5 0 0 1 17.5 5h1A2.5 2.5 0 0 1 21 7.5V9h-3v4c0 3-2 5-5 5H7M9 18v2M14 18v2M19 7h.01',
    keywords: ['dinosaur', 'dino'] },
  { id: 'fairies', color: '#7A3E9D', names: { lt: 'Fėjos ir magija', es: 'Hadas y magia', en: 'Fairies & magic' },
    icon: 'M15 2l1.3 2.7L19 6l-2.7 1.3L15 10l-1.3-2.7L11 6l2.7-1.3zM12 10L3 19M20 13v4M18 15h4M6 4v2M5 5h2',
    keywords: ['fairy', 'fairies', 'magic', 'witch', 'wizard', 'princess', 'dragon', 'fantasy'] },
  { id: 'animals', color: '#2F6B4F', names: { lt: 'Gyvūnai', es: 'Animales', en: 'Animals' },
    icon: 'M12 13c-3 0-5.5 3-5.5 5a2.5 2.5 0 0 0 3 2.3c1.6-.4 3.4-.4 5 0a2.5 2.5 0 0 0 3-2.3c0-2-2.5-5-5.5-5zM5.5 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM18.5 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM9 7.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM15 7.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
    keywords: ['animal', 'bear', 'cat', 'dog', 'mouse', 'pet', 'farm', 'zoo', 'bird', 'gorilla', 'nature'] },
  { id: 'space', color: '#4338CA', names: { lt: 'Kosmosas', es: 'Espacio', en: 'Space' },
    icon: 'M12 2c3.5 2.5 5 6.5 4 11.5L14.5 17h-5L8 13.5C7 8.5 8.5 4.5 12 2zM12 10.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM9.5 17L8 21l4-2 4 2-1.5-4',
    keywords: ['space', 'planet', 'star', 'moon', 'rocket', 'astronom'] },
  { id: 'monsters', color: '#0F766E', names: { lt: 'Pabaisos', es: 'Monstruos', en: 'Monsters' },
    icon: 'M5 21V11a7 7 0 0 1 14 0v10l-2.3-1.8L14.3 21 12 19.2 9.7 21l-2.4-1.8zM9.5 11h.01M14.5 11h.01',
    keywords: ['monster', 'ghost', 'troll'] },
  { id: 'funny', color: '#B45309', names: { lt: 'Linksmos', es: 'Divertidos', en: 'Funny' },
    icon: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM7.5 13.5s1.5 3 4.5 3 4.5-3 4.5-3M9 9.5h.01M15 9.5h.01',
    keywords: ['humor', 'humour', 'funny', 'comic'] },
  { id: 'bedtime', color: '#1D4E89', names: { lt: 'Prieš miegą', es: 'Para dormir', en: 'Bedtime' },
    icon: 'M20 14.5A8.5 8.5 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5zM17 3v3M15.5 4.5h3',
    keywords: ['bedtime', 'sleep', 'night', 'lullab'] },
  { id: 'feelings', color: '#9F1239', names: { lt: 'Jausmai', es: 'Emociones', en: 'Feelings' },
    icon: 'M12 20.5S3.5 15.5 3.5 9.5A4.5 4.5 0 0 1 12 7a4.5 4.5 0 0 1 8.5 2.5c0 6-8.5 11-8.5 11z',
    keywords: ['emotion', 'feeling', 'friendship', 'family', 'social'] },
  { id: 'learning', color: '#0E7490', names: { lt: 'Pažinimas', es: 'Aprender', en: 'Learning' },
    icon: 'M3 8l9-4 9 4-9 4zM7 10v5c0 1.5 2.2 3 5 3s5-1.5 5-3v-5M21 8v6',
    keywords: ['science', 'education', 'learn', 'nonfiction', 'juvenile nonfiction', 'history', 'alphabet', 'counting', 'language'] }
];

/* Sample members. Only a postal code is stored – never an address. */
window.MEMBERS = {
  ana: { name: 'Ana (García)', country: 'DK', postal: '2400' },
  jonas: { name: 'Jonas (Petraičiai)', country: 'DK', postal: '2700' },
  mette: { name: 'Mette (Jensen)', country: 'DK', postal: '2720' },
  ruta: { name: 'Rūta (Kazlauskai)', country: 'DK', postal: '2100' },
  sofia: { name: 'Sofía (Rodríguez)', country: 'DK', postal: '2650' }
};

/* ISO 3166-1 country codes. Names are shown in the app language via Intl.DisplayNames. */
window.COUNTRIES = ('AD AE AF AG AI AL AM AO AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BW BY BZ ' +
  'CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR ' +
  'GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GT GU GW GY HK HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE JM JO JP ' +
  'KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS ' +
  'MT MU MV MW MX MY MZ NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS ' +
  'RU RW SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TG TH TJ TK TL TM TN TO TR TT TV TW TZ ' +
  'UA UG US UY UZ VA VC VE VG VI VN VU WF WS XK YE YT ZA ZM ZW').split(' ');

/* Postal-code formats for common countries (after removing spaces/prefixes like "LT-").
   Countries not listed accept 2–10 letters/digits. */
window.POSTAL_FORMATS = {
  DK: /^\d{4}$/, NO: /^\d{4}$/, BE: /^\d{4}$/, AT: /^\d{4}$/, CH: /^\d{4}$/, LV: /^\d{4}$/, AU: /^\d{4}$/, HU: /^\d{4}$/,
  LT: /^\d{5}$/, ES: /^\d{5}$/, DE: /^\d{5}$/, FR: /^\d{5}$/, IT: /^\d{5}$/, FI: /^\d{5}$/, EE: /^\d{5}$/, US: /^\d{5}$/,
  SE: /^\d{5}$/, PL: /^\d{5}$/, PT: /^\d{7}$/, IS: /^\d{3}$/,
  NL: /^\d{4}[A-Z]{2}$/, GB: /^[A-Z]{1,2}\d[A-Z\d]?\d[A-Z]{2}$/, IE: /^[A-Z]\d[\dW][A-Z\d]{4}$/, CA: /^[A-Z]\d[A-Z]\d[A-Z]\d$/
};

const D = (daysAgo) => Date.now() - daysAgo * 86400000;

window.SAMPLE_BOOKS = [
  { id: 'b1', title: 'The Gruffalo', author: 'Julia Donaldson', lang: 'en', topics: ['monsters', 'animals'], age: '3–6', offer: 'swap', price: 0, owner: 'ana', cond: 'good', added: D(2),
    description: 'A mouse takes a walk through the deep dark wood and invents a fearsome creature to scare off the animals who want to eat him.' },
  { id: 'b2', title: 'Dinosaurs Love Underpants', author: 'Claire Freedman', lang: 'en', topics: ['dinosaurs', 'funny'], age: '3–6', offer: 'sell', price: 3, owner: 'mette', cond: 'good', added: D(1),
    description: 'A silly rhyming picture book about why the dinosaurs really disappeared.' },
  { id: 'b3', title: 'El monstruo de colores', author: 'Anna Llenas', lang: 'es', topics: ['feelings', 'monsters'], age: '3–6', offer: 'give', price: 0, owner: 'ana', cond: 'new', added: D(9),
    description: 'Un monstruo que se ha hecho un lío con sus emociones aprende a ordenarlas por colores.' },
  { id: 'b4', title: 'Kakė Makė ir netvarkos nykštukas', author: 'Lina Žutautė', lang: 'lt', topics: ['funny', 'fairies'], age: '3–6', offer: 'swap', price: 0, owner: 'jonas', cond: 'good', added: D(3),
    description: '' },
  { id: 'b5', title: 'Mažasis princas', author: 'Antoine de Saint-Exupéry', lang: 'lt', topics: ['space', 'feelings'], age: '7–9', offer: 'sell', price: 4, owner: 'ruta', cond: 'new', added: D(12),
    description: 'Pasaka apie mažąjį princą, atkeliavusį iš mažytės planetos, ir apie draugystę.' },
  { id: 'b6', title: 'Donde viven los monstruos', author: 'Maurice Sendak', lang: 'es', topics: ['monsters'], age: '3–6', offer: 'swap', price: 0, owner: 'sofia', cond: 'good', added: D(4),
    description: 'Max se pone su traje de lobo y viaja al lugar donde viven los monstruos.' },
  { id: 'b7', title: 'Room on the Broom', author: 'Julia Donaldson', lang: 'en', topics: ['fairies', 'funny'], age: '3–6', offer: 'give', price: 0, owner: 'mette', cond: 'worn', added: D(15),
    description: 'A kind witch keeps making room on her broom for new animal friends.' },
  { id: 'b8', title: 'Didžioji dinozaurų knyga', author: 'Įvairūs autoriai', lang: 'lt', topics: ['dinosaurs', 'learning'], age: '7–9', offer: 'swap', price: 0, owner: 'jonas', cond: 'good', added: D(5),
    description: '' },
  { id: 'b9', title: 'Buenas noches, Gorila', author: 'Peggy Rathmann', lang: 'es', topics: ['bedtime', 'animals'], age: '0–3', offer: 'give', price: 0, owner: 'sofia', cond: 'new', added: D(20),
    description: 'Un gorila travieso libera a los animales del zoo y todos siguen al guarda hasta su casa.' },
  { id: 'b10', title: 'Mano pirmoji knyga apie kosmosą', author: 'Įvairūs autoriai', lang: 'lt', topics: ['space', 'learning'], age: '3–6', offer: 'sell', price: 2, owner: 'ruta', cond: 'good', added: D(1),
    description: '' },
  { id: 'b11', title: 'Zog', author: 'Julia Donaldson', lang: 'en', topics: ['fairies'], age: '3–6', offer: 'swap', price: 0, owner: 'me', cond: 'good', added: D(30),
    description: 'Zog is a keen young dragon who tries his best at dragon school, with a little help from a princess.' },
  { id: 'b12', title: 'El pollo Pepe', author: 'Nick Denchfield', lang: 'es', topics: ['animals', 'funny'], age: '0–3', offer: 'give', price: 0, owner: 'me', cond: 'good', added: D(30),
    description: 'Un libro pop-up sobre un pollito que come muchísimo.' },
  { id: 'b14', title: 'The Snail and the Whale', author: 'Julia Donaldson', lang: 'en', topics: ['animals'], age: '3–6', offer: 'sell', price: 3, owner: 'mette', cond: 'good', added: D(40), status: 'gone', description: '' },
  { id: 'b15', title: 'Labanakt, pelyte', author: '—', lang: 'lt', topics: ['bedtime'], age: '0–3', offer: 'give', price: 0, owner: 'ana', cond: 'good', added: D(50), status: 'gone', description: '' },
  { id: 'b16', title: 'Elmer', author: 'David McKee', lang: 'es', topics: ['animals', 'feelings'], age: '3–6', offer: 'swap', price: 0, owner: 'mette', cond: 'good', added: D(35), status: 'gone', description: '' },
  { id: 'b13', title: 'Bamse og venner', author: '—', lang: 'da', topics: ['animals'], age: '0–3', offer: 'give', price: 0, owner: 'mette', cond: 'worn', added: D(6),
    description: '' }
];

/* One incoming request so the "owner" side of the chat can be tried. */
window.SAMPLE_THREADS = [
  { id: 't1', with: 'mette', role: 'owner', books: ['b11'], offered: ['b7'], accepted: [], status: 'pending', handover: null,
    messages: [{ from: 'mette', text: 'Hi! My son loves dragons – could we swap Zog for Room on the Broom? Saturday at school?', at: D(0.2) }] }
];

/* Wish lists. Matching is by ISBN, or by title when there is no ISBN.
   owner 'me' = the person using the app (a starting example they can remove). */
window.SAMPLE_WISHES = [
  { id: 'w1', owner: 'mette', title: 'Zog', author: 'Julia Donaldson', lang: 'en', isbn: '' },
  { id: 'w2', owner: 'ana', title: 'El pollo Pepe', author: 'Nick Denchfield', lang: 'es', isbn: '' },
  { id: 'w3', owner: 'ana', title: 'Mažasis princas', author: 'Antoine de Saint-Exupéry', lang: 'lt', isbn: '' },
  { id: 'w4', owner: 'sofia', title: 'Zog', author: 'Julia Donaldson', lang: 'en', isbn: '' },
  { id: 'w5', owner: 'jonas', title: 'The Gruffalo', author: 'Julia Donaldson', lang: 'en', isbn: '' },
  { id: 'w6', owner: 'ruta', title: 'El pollo Pepe', author: 'Nick Denchfield', lang: 'es', isbn: '' },
  { id: 'w7', owner: 'me', title: 'Room on the Broom', author: 'Julia Donaldson', lang: 'en', isbn: '' },
  { id: 'w8', owner: 'me', title: 'Didžioji dinozaurų knyga', author: '', lang: 'lt', isbn: '' }
];

/* Reviews: 1–5 "little books" after a finished exchange. */
window.SAMPLE_REVIEWS = [
  { id: 'r1', request: 'x1', from: 'ana', to: 'mette', rating: 5, comment: 'Super friendly, book like new!', at: D(30) },
  { id: 'r2', request: 'x2', from: 'jonas', to: 'mette', rating: 4, comment: 'Smooth swap at school.', at: D(20) },
  { id: 'r3', request: 'x3', from: 'mette', to: 'ana', rating: 5, comment: '', at: D(45) },
  { id: 'r4', request: 'x4', from: 'sofia', to: 'jonas', rating: 3, comment: 'Came a week late, but all good.', at: D(12) }
];
