/* Topics, sample members and sample books for the prototype. */
window.BOOK_LANGS = ['lt', 'es', 'en', 'da', 'other'];
window.AGES = ['0–3', '3–6', '7–9', '10+'];

window.TOPICS = [
  { id: 'dinosaurs', color: '#C2410C', names: { lt: 'Dinozaurai', es: 'Dinosaurios', en: 'Dinosaurs' },
    icon: 'M3 18c2.5 0 3.5-1.5 4.5-3.5S10 11 13 11h2V7.5A2.5 2.5 0 0 1 17.5 5h1A2.5 2.5 0 0 1 21 7.5V9h-3v4c0 3-2 5-5 5H7M9 18v2M14 18v2M19 7h.01',
    keywords: ['dinosaur', 'dino'] },
  { id: 'fairies', color: '#7A3E9D', names: { lt: 'Fėjos ir magija', es: 'Hadas y magia', en: 'Fairies & magic' },
    icon: 'M15 2l1.3 2.7L19 6l-2.7 1.3L15 10l-1.3-2.7L11 6l2.7-1.3zM12 10L3 19M20 13v4M18 15h4M6 4v2M5 5h2',
    keywords: ['fair', 'magic', 'witch', 'wizard', 'princess', 'dragon', 'fantasy'] },
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
  ana: { name: 'Ana (García)', postal: '2400' },
  jonas: { name: 'Jonas (Petraičiai)', postal: '2700' },
  mette: { name: 'Mette (Jensen)', postal: '2720' },
  ruta: { name: 'Rūta (Kazlauskai)', postal: '2100' },
  sofia: { name: 'Sofía (Rodríguez)', postal: '2650' }
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
