/* UI translations. To add a language: copy the `en` block, translate the values,
   and add the code to UI_LANGS. Placeholders like {name} are filled in by t(). */
window.UI_LANGS = ['lt', 'es', 'en'];

window.STRINGS = {
  lt: {
    appName: 'Knygų keitykla',
    groupName: 'Šeštadieninė mokyklėlė',
    // onboarding
    welcomeTitle: 'Sveiki atvykę!',
    welcomeText: 'Dalinkitės vaikiškomis knygomis su kitomis bendruomenės šeimomis – mainykite, parduokite ar padovanokite.',
    invitedTo: 'Jus pakvietė į grupę',
    yourName: 'Jūsų vardas (matys kiti)',
    yourNamePh: 'Pvz. Rūta (Petraičių šeima)',
    appLanguage: 'Programėlės kalba',
    interestedLangs: 'Kokiomis kalbomis ieškote knygų?',
    join: 'Prisijungti',
    demoNote: 'Tai prototipas: duomenys saugomi tik šiame įrenginyje.',
    // nav
    navBrowse: 'Knygos', navAdd: 'Pridėti', navRequests: 'Prašymai', navMessages: 'Žinutės', navProfile: 'Profilis',
    // browse
    searchPh: 'Ieškoti pagal pavadinimą ar autorių',
    bookLang: 'Knygos kalba', all: 'Visos', topics: 'Temos', ages: 'Amžius',
    rowNew: 'Naujos šią savaitę', rowAll: 'Visos knygos', results: '{n} knygų', noResults: 'Nieko nerasta. Pabandykite kitą filtrą.',
    clearFilters: 'Išvalyti filtrus',
    // offers
    swap: 'Mainai', free: 'Dovanai', reserved: 'Rezervuota', gone: 'Jau išdalinta',
    // book
    back: 'Atgal', description: 'Aprašymas', noDescription: 'Aprašymo nėra.',
    language: 'Kalba', age: 'Amžius', condition: 'Būklė', owner: 'Savininkas', offerType: 'Pasiūlymas', isbn: 'ISBN',
    condNew: 'Kaip nauja', condGood: 'Gera', condWorn: 'Naudota',
    addToRequest: 'Pridėti į prašymą', inRequest: 'Jau prašyme', requestNow: 'Prašyti dabar', yourBook: 'Tai jūsų knyga',
    moreFrom: 'Daugiau iš {name}', years: '{a} m.',
    // cart / bundles
    requestsTitle: 'Mano prašymai', requestsEmpty: 'Dar nieko nepasirinkote. Pridėkite knygų iš sąrašo – knygos iš to paties žmogaus susijungs į vieną prašymą.',
    fromName: 'Iš: {name}', remove: 'Išimti', totalForSale: 'Perkamų knygų suma: €{sum}',
    offerInReturn: 'Pasiūlyti savo knygų mainais', pickYours: 'Pažymėkite, ką galite atnešti:',
    messagePh: 'Žinutė (nebūtina)', defaultMsg: 'Labas! Norėčiau šių knygų. Ar tiktų šeštadienį mokykloje?',
    sendRequest: 'Siųsti prašymą', sent: 'Prašymas išsiųstas!', browseMore: 'Naršyti knygas',
    // chats
    messagesTitle: 'Žinutės', messagesEmpty: 'Pokalbių dar nėra. Jie atsiras, kai išsiųsite ar gausite prašymą.',
    stPending: 'Laukia atsakymo', stAccepted: 'Priimta', stScheduled: 'Suplanuota', stDone: 'Atlikta', stDeclined: 'Atmesta',
    tabActive: 'Aktyvūs', tabDone: 'Baigti',
    youWant: 'Jūs prašote', theyWant: '{name} prašo', theyOffer: 'Siūlo mainais', youOffer: 'Jūs siūlote mainais',
    waitingFor: 'Laukiama {name} atsakymo', tickToAccept: 'Pažymėkite knygas, kurias galite atiduoti:',
    acceptSelected: 'Priimti pažymėtas', declineAll: 'Atmesti', accepted: 'Priimta',
    handover: 'Perdavimas', handoverPh: 'Šeštadienį mokykloje', confirmHandover: 'Patvirtinti perdavimą',
    handoverSet: '{when} · {where}', markDone: 'Pažymėti kaip perduota', doneMsg: 'Knygos perduotos. Ačiū, kad dalinatės!',
    reminderNote: 'Abu gausite priminimą dieną prieš.',
    typeMessage: 'Rašyti žinutę…', send: 'Siųsti', report: 'Pranešti', reported: 'Pranešta grupės organizatoriui.',
    qr1: 'Taip, šeštadienis tinka', qr2: 'Gal kitą savaitę?', qr3: 'Atsiprašau, jau atiduota',
    sysAccepted: '{name} priėmė prašymą', sysDeclined: '{name} atmetė prašymą', sysHandover: 'Perdavimas suplanuotas: {when}, {where}', sysDone: 'Pažymėta kaip perduota',
    autoReply: 'Labas! Taip, galiu atnešti šeštadienį 🙂',
    // add book
    addTitle: 'Pridėti knygą', scanTitle: 'Nuskenuokite ISBN brūkšninį kodą', scanHint: 'Jis yra knygos gale, virš brūkšninio kodo parašyta „ISBN“.',
    startCamera: 'Įjungti kamerą', stopCamera: 'Išjungti kamerą', cameraError: 'Nepavyko įjungti kameros. Įveskite ISBN ranka.',
    orTypeIsbn: 'arba įveskite ISBN', isbnPh: '978…', lookUp: 'Ieškoti',
    orSearchTitle: 'arba ieškokite pagal pavadinimą', titleSearchPh: 'Pavadinimas ar autorius', search: 'Ieškoti',
    searching: 'Ieškoma…', notFound: 'Šios knygos neradome – nieko tokio, įveskite kelias detales.',
    foundIn: 'Rasta: {src}. Patikrinkite ir papildykite.', foundLocal: 'Šią knygą jau buvo pridėjusi kita šeima – informacija nukopijuota.',
    enterManually: 'Įvesti ranka', invalidIsbn: 'ISBN turi būti 10 arba 13 skaitmenų.',
    review: 'Knygos informacija', title: 'Pavadinimas', author: 'Autorius',
    coverFromSource: 'Viršelis iš katalogo', addPhoto: 'Nufotografuoti savo egzempliorių', changePhoto: 'Keisti nuotrauką',
    photoClean: 'Iš nuotraukos pašalinta vietos informacija.',
    topicsSuggested: 'Temos (pasiūlytos pagal katalogą – galite keisti)',
    offerQ: 'Ką norite daryti?', oSwap: 'Mainyti', oSell: 'Parduoti', oGive: 'Dovanoti', price: 'Kaina (€)',
    save: 'Išsaugoti knygą', savedTitle: 'Knyga pridėta!', savedText: 'Kitos šeimos jau gali ją matyti.',
    addAnother: 'Pridėti dar vieną', viewBook: 'Peržiūrėti knygą', required: 'Įveskite pavadinimą.',
    // profile
    profileTitle: 'Mano profilis', memberOf: 'Grupė: {group}',
    statListed: 'Pridėta', statGiven: 'Rado naujus namus', statReceived: 'Gauta', statSaved: 'Sutaupyta',
    langMix: 'Knygų kalbos', topTopics: 'Mėgstamiausios temos', badges: 'Ženkleliai', myShelf: 'Mano lentyna',
    shelfEmpty: 'Lentyna tuščia – pridėkite pirmą knygą!',
    bFirst: 'Pirmieji mainai', bTen: '10 knygų pasidalinta', bPoly: 'Daugiakalbė lentyna', bGiver: 'Dosnus dovanotojas', bStarter: 'Pirmoji knyga',
    statsPrivate: 'Statistiką matote tik jūs.',
    settings: 'Nustatymai', exportData: 'Atsisiųsti mano duomenis', deleteAccount: 'Ištrinti paskyrą ir duomenis',
    confirmDelete: 'Tikrai ištrinti visus duomenis šiame įrenginyje?',
    privacy: 'Saugome tik vardą ir knygas. Jokių adresų ar telefonų – perdavimai vyksta mokykloje.',
    // misc
    langNames: { lt: 'lietuvių', es: 'ispanų', en: 'anglų', da: 'danų', fr: 'prancūzų', de: 'vokiečių', pl: 'lenkų', ru: 'rusų', uk: 'ukrainiečių', lv: 'latvių', sv: 'švedų', no: 'norvegų', it: 'italų', pt: 'portugalų', other: 'kita' },
    today: 'šiandien', nextSaturday: 'šeštadienį'
  },

  es: {
    appName: 'Intercambio de libros',
    groupName: 'Escuela de los sábados',
    welcomeTitle: '¡Bienvenidos!',
    welcomeText: 'Comparte libros infantiles con otras familias de tu comunidad: intercambia, vende o regala.',
    invitedTo: 'Te han invitado al grupo',
    yourName: 'Tu nombre (lo verán los demás)',
    yourNamePh: 'Ej. Ana (familia García)',
    appLanguage: 'Idioma de la aplicación',
    interestedLangs: '¿En qué idiomas buscas libros?',
    join: 'Unirme',
    demoNote: 'Esto es un prototipo: los datos se guardan solo en este dispositivo.',
    navBrowse: 'Libros', navAdd: 'Añadir', navRequests: 'Pedidos', navMessages: 'Mensajes', navProfile: 'Perfil',
    searchPh: 'Buscar por título o autor',
    bookLang: 'Idioma del libro', all: 'Todos', topics: 'Temas', ages: 'Edad',
    rowNew: 'Nuevos esta semana', rowAll: 'Todos los libros', results: '{n} libros', noResults: 'No hay resultados. Prueba otro filtro.',
    clearFilters: 'Quitar filtros',
    swap: 'Intercambio', free: 'Gratis', reserved: 'Reservado', gone: 'Ya entregado',
    back: 'Atrás', description: 'Descripción', noDescription: 'Sin descripción.',
    language: 'Idioma', age: 'Edad', condition: 'Estado', owner: 'Propietario', offerType: 'Oferta', isbn: 'ISBN',
    condNew: 'Como nuevo', condGood: 'Bueno', condWorn: 'Usado',
    addToRequest: 'Añadir al pedido', inRequest: 'Ya en el pedido', requestNow: 'Pedir ahora', yourBook: 'Es tu libro',
    moreFrom: 'Más de {name}', years: '{a} años',
    requestsTitle: 'Mis pedidos', requestsEmpty: 'Aún no has elegido nada. Añade libros: los de la misma persona se agrupan en un solo pedido.',
    fromName: 'De: {name}', remove: 'Quitar', totalForSale: 'Total de libros en venta: {sum} €',
    offerInReturn: 'Ofrecer libros míos a cambio', pickYours: 'Marca lo que puedes llevar:',
    messagePh: 'Mensaje (opcional)', defaultMsg: '¡Hola! Me gustarían estos libros. ¿Te va bien el sábado en la escuela?',
    sendRequest: 'Enviar pedido', sent: '¡Pedido enviado!', browseMore: 'Ver libros',
    messagesTitle: 'Mensajes', messagesEmpty: 'Aún no hay conversaciones. Aparecerán cuando envíes o recibas un pedido.',
    stPending: 'Esperando respuesta', stAccepted: 'Aceptado', stScheduled: 'Programado', stDone: 'Completado', stDeclined: 'Rechazado',
    tabActive: 'Activos', tabDone: 'Terminados',
    youWant: 'Tú pides', theyWant: '{name} pide', theyOffer: 'Ofrece a cambio', youOffer: 'Tú ofreces a cambio',
    waitingFor: 'Esperando la respuesta de {name}', tickToAccept: 'Marca los libros que puedes dar:',
    acceptSelected: 'Aceptar los marcados', declineAll: 'Rechazar', accepted: 'Aceptado',
    handover: 'Entrega', handoverPh: 'El sábado en la escuela', confirmHandover: 'Confirmar entrega',
    handoverSet: '{when} · {where}', markDone: 'Marcar como entregado', doneMsg: 'Libros entregados. ¡Gracias por compartir!',
    reminderNote: 'Ambos recibiréis un recordatorio el día antes.',
    typeMessage: 'Escribe un mensaje…', send: 'Enviar', report: 'Denunciar', reported: 'Se ha avisado al organizador del grupo.',
    qr1: 'Sí, el sábado me va bien', qr2: '¿Mejor la semana que viene?', qr3: 'Lo siento, ya no está',
    sysAccepted: '{name} ha aceptado el pedido', sysDeclined: '{name} ha rechazado el pedido', sysHandover: 'Entrega programada: {when}, {where}', sysDone: 'Marcado como entregado',
    autoReply: '¡Hola! Sí, puedo traerlos el sábado 🙂',
    addTitle: 'Añadir libro', scanTitle: 'Escanea el código ISBN', scanHint: 'Está en la contraportada, sobre el código de barras pone «ISBN».',
    startCamera: 'Abrir cámara', stopCamera: 'Cerrar cámara', cameraError: 'No se pudo abrir la cámara. Escribe el ISBN.',
    orTypeIsbn: 'o escribe el ISBN', isbnPh: '978…', lookUp: 'Buscar',
    orSearchTitle: 'o busca por título', titleSearchPh: 'Título o autor', search: 'Buscar',
    searching: 'Buscando…', notFound: 'No hemos encontrado este libro; no pasa nada, añade unos datos.',
    foundIn: 'Encontrado en {src}. Revisa y completa.', foundLocal: 'Otra familia ya añadió este libro: hemos copiado los datos.',
    enterManually: 'Introducir a mano', invalidIsbn: 'El ISBN debe tener 10 o 13 dígitos.',
    review: 'Datos del libro', title: 'Título', author: 'Autor',
    coverFromSource: 'Portada del catálogo', addPhoto: 'Hacer foto de tu ejemplar', changePhoto: 'Cambiar foto',
    photoClean: 'Hemos quitado la ubicación de la foto.',
    topicsSuggested: 'Temas (sugeridos por el catálogo; puedes cambiarlos)',
    offerQ: '¿Qué quieres hacer?', oSwap: 'Intercambiar', oSell: 'Vender', oGive: 'Regalar', price: 'Precio (€)',
    save: 'Guardar libro', savedTitle: '¡Libro añadido!', savedText: 'Otras familias ya pueden verlo.',
    addAnother: 'Añadir otro', viewBook: 'Ver libro', required: 'Escribe el título.',
    profileTitle: 'Mi perfil', memberOf: 'Grupo: {group}',
    statListed: 'Añadidos', statGiven: 'Con nuevo hogar', statReceived: 'Recibidos', statSaved: 'Ahorrado',
    langMix: 'Idiomas de los libros', topTopics: 'Temas favoritos', badges: 'Insignias', myShelf: 'Mi estantería',
    shelfEmpty: 'Tu estantería está vacía: ¡añade tu primer libro!',
    bFirst: 'Primer intercambio', bTen: '10 libros compartidos', bPoly: 'Estantería políglota', bGiver: 'Gran donante', bStarter: 'Primer libro',
    statsPrivate: 'Solo tú ves estas estadísticas.',
    settings: 'Ajustes', exportData: 'Descargar mis datos', deleteAccount: 'Borrar cuenta y datos',
    confirmDelete: '¿Seguro que quieres borrar todos los datos de este dispositivo?',
    privacy: 'Solo guardamos tu nombre y tus libros. Sin direcciones ni teléfonos: las entregas son en la escuela.',
    langNames: { lt: 'lituano', es: 'español', en: 'inglés', da: 'danés', fr: 'francés', de: 'alemán', pl: 'polaco', ru: 'ruso', uk: 'ucraniano', lv: 'letón', sv: 'sueco', no: 'noruego', it: 'italiano', pt: 'portugués', other: 'otro' },
    today: 'hoy', nextSaturday: 'el sábado'
  },

  en: {
    appName: 'Book Swap',
    groupName: 'Saturday School',
    welcomeTitle: 'Welcome!',
    welcomeText: "Share children's books with other families in your community – swap, sell or give them away.",
    invitedTo: "You've been invited to",
    yourName: 'Your name (others will see this)',
    yourNamePh: 'e.g. Ana (García family)',
    appLanguage: 'App language',
    interestedLangs: 'Which languages are you looking for?',
    join: 'Join',
    demoNote: 'This is a prototype: data is stored on this device only.',
    navBrowse: 'Books', navAdd: 'Add', navRequests: 'Requests', navMessages: 'Messages', navProfile: 'Profile',
    searchPh: 'Search by title or author',
    bookLang: 'Book language', all: 'All', topics: 'Topics', ages: 'Age',
    rowNew: 'New this week', rowAll: 'All books', results: '{n} books', noResults: 'Nothing found. Try another filter.',
    clearFilters: 'Clear filters',
    swap: 'Swap', free: 'Free', reserved: 'Reserved', gone: 'Already given',
    back: 'Back', description: 'Description', noDescription: 'No description.',
    language: 'Language', age: 'Age', condition: 'Condition', owner: 'Owner', offerType: 'Offer', isbn: 'ISBN',
    condNew: 'Like new', condGood: 'Good', condWorn: 'Well loved',
    addToRequest: 'Add to request', inRequest: 'In your request', requestNow: 'Request now', yourBook: 'This is your book',
    moreFrom: 'More from {name}', years: 'Ages {a}',
    requestsTitle: 'My requests', requestsEmpty: "You haven't picked anything yet. Add books – books from the same person are bundled into one request.",
    fromName: 'From: {name}', remove: 'Remove', totalForSale: 'Total for books on sale: €{sum}',
    offerInReturn: 'Offer some of my books in return', pickYours: 'Tick what you can bring:',
    messagePh: 'Message (optional)', defaultMsg: 'Hi! I would love these books. Would Saturday at school work?',
    sendRequest: 'Send request', sent: 'Request sent!', browseMore: 'Browse books',
    messagesTitle: 'Messages', messagesEmpty: 'No conversations yet. They appear when you send or receive a request.',
    stPending: 'Waiting for reply', stAccepted: 'Accepted', stScheduled: 'Scheduled', stDone: 'Done', stDeclined: 'Declined',
    tabActive: 'Active', tabDone: 'Done',
    youWant: 'You are asking for', theyWant: '{name} is asking for', theyOffer: 'Offering in return', youOffer: 'You offer in return',
    waitingFor: 'Waiting for {name} to reply', tickToAccept: 'Tick the books you can give:',
    acceptSelected: 'Accept ticked books', declineAll: 'Decline', accepted: 'Accepted',
    handover: 'Handover', handoverPh: 'Saturday at school', confirmHandover: 'Confirm handover',
    handoverSet: '{when} · {where}', markDone: 'Mark as handed over', doneMsg: 'Books handed over. Thanks for sharing!',
    reminderNote: "You'll both get a reminder the day before.",
    typeMessage: 'Type a message…', send: 'Send', report: 'Report', reported: 'Reported to the group organiser.',
    qr1: 'Yes, Saturday works', qr2: 'Maybe next week?', qr3: 'Sorry, already gone',
    sysAccepted: '{name} accepted the request', sysDeclined: '{name} declined the request', sysHandover: 'Handover scheduled: {when}, {where}', sysDone: 'Marked as handed over',
    autoReply: 'Hi! Yes, I can bring them on Saturday 🙂',
    addTitle: 'Add a book', scanTitle: 'Scan the ISBN barcode', scanHint: 'It is on the back cover – look for "ISBN" above the barcode.',
    startCamera: 'Open camera', stopCamera: 'Close camera', cameraError: "Couldn't open the camera. Type the ISBN instead.",
    orTypeIsbn: 'or type the ISBN', isbnPh: '978…', lookUp: 'Look up',
    orSearchTitle: 'or search by title', titleSearchPh: 'Title or author', search: 'Search',
    searching: 'Looking it up…', notFound: "We couldn't find this book – no problem, add a few details.",
    foundIn: 'Found on {src}. Check and complete the details.', foundLocal: 'Another family already added this book – details copied.',
    enterManually: 'Enter manually', invalidIsbn: 'An ISBN has 10 or 13 digits.',
    review: 'Book details', title: 'Title', author: 'Author',
    coverFromSource: 'Cover from catalogue', addPhoto: 'Take a photo of your copy', changePhoto: 'Change photo',
    photoClean: 'Location data was removed from the photo.',
    topicsSuggested: 'Topics (suggested from the catalogue – change if needed)',
    offerQ: 'What would you like to do?', oSwap: 'Swap', oSell: 'Sell', oGive: 'Give away', price: 'Price (€)',
    save: 'Save book', savedTitle: 'Book added!', savedText: 'Other families can see it now.',
    addAnother: 'Add another', viewBook: 'View book', required: 'Please enter a title.',
    profileTitle: 'My profile', memberOf: 'Group: {group}',
    statListed: 'Listed', statGiven: 'Found new homes', statReceived: 'Received', statSaved: 'Saved',
    langMix: 'Book languages', topTopics: 'Favourite topics', badges: 'Badges', myShelf: 'My shelf',
    shelfEmpty: 'Your shelf is empty – add your first book!',
    bFirst: 'First swap', bTen: '10 books shared', bPoly: 'Polyglot shelf', bGiver: 'Generous giver', bStarter: 'First book',
    statsPrivate: 'Only you can see these stats.',
    settings: 'Settings', exportData: 'Download my data', deleteAccount: 'Delete account and data',
    confirmDelete: 'Really delete all data on this device?',
    privacy: 'We only store your name and books. No addresses or phone numbers – handovers happen at school.',
    langNames: { lt: 'Lithuanian', es: 'Spanish', en: 'English', da: 'Danish', fr: 'French', de: 'German', pl: 'Polish', ru: 'Russian', uk: 'Ukrainian', lv: 'Latvian', sv: 'Swedish', no: 'Norwegian', it: 'Italian', pt: 'Portuguese', other: 'Other' },
    today: 'today', nextSaturday: 'Saturday'
  }
};

/* Wish lists, location and terms */
Object.assign(window.STRINGS.lt, {
  postal: 'Pašto kodas', postalPh: 'Pvz. 2700',
  postalHint: 'Rodomas tik pašto kodas – niekada adresas. Taip rasite kaimynus ir išvengsite siuntimo.',
  postalRequired: 'Įveskite pašto kodą.', nameRequired: 'Įveskite vardą.',
  acceptTerms: 'Perskaičiau ir sutinku su', termsLink: 'naudojimosi sąlygomis', termsRequired: 'Norėdami tęsti, sutikite su sąlygomis.',
  termsUpdated: 'Atnaujinome naudojimosi sąlygas. Peržiūrėkite ir sutikite, kad galėtumėte tęsti.',
  p2pNote: 'Knygų keitykla tik padeda susirasti. Sandoris yra tarp jūsų – patikrinkite knygą prieš mokėdami.',
  continue: 'Tęsti', viewTerms: 'Naudojimosi sąlygos', acceptedOn: 'Sutikote {date}',
  nearMe: 'Netoli manęs', sameArea: 'jūsų rajone', nearby: 'netoliese', location: 'Vieta', savePostal: 'Išsaugoti', saved: 'Išsaugota',
  fromWishlist: 'Iš jūsų norų sąrašo', wantYourBooks: 'Nori jūsų knygų', wantsCount: 'Nori {n} iš jūsų lentynos',
  onYourWishlist: 'Jūsų norų sąraše!', wantedBy: 'Šios knygos ieško:', onTheirWishlist: 'Jų norų sąraše',
  viewProfile: 'Žiūrėti profilį', theirShelf: 'Jų lentyna', theirWishlist: 'Ko jie ieško',
  tailored: 'Pasiūlykite mainus', tailoredHint: 'Pažymėjome sutapimus – pakeiskite, jei norite.',
  youGet: 'Jūs gausite', youGive: 'Jūs duosite', proposeExchange: 'Siūlyti mainus', pickSomething: 'Pažymėkite bent vieną jų knygą.',
  exchangeMsg: 'Labas! Matau, kad ieškote: {give}. Gal mainytume į: {get}?', exchangeMsgPlain: 'Labas! Norėčiau: {get}. Ar tiktų susitikti netoliese?',
  noMatches: 'Kol kas sutapimų nėra.', nothingHere: 'Kol kas nieko.',
  myWishlist: 'Mano norų sąrašas', wishEmpty: 'Pridėkite knygų, kurių ieškote – pranešime, kai kas nors jų turės.', addWish: 'Pridėti norą',
  addModeShelf: 'Turiu šią knygą', addModeWish: 'Ieškau šios knygos', saveWish: 'Pridėti į norų sąrašą',
  wishSavedTitle: 'Įtraukta į norų sąrašą!', wishSavedText: 'Pranešime, kai kas nors ją pasiūlys.',
  alreadyAvailable: 'Jau galima gauti iš:', peopleWant: 'Šios knygos ieško {n} žm.!'
});
Object.assign(window.STRINGS.es, {
  postal: 'Código postal', postalPh: 'Ej. 2700',
  postalHint: 'Solo se muestra el código postal, nunca tu dirección. Así encontrarás vecinos y evitarás envíos.',
  postalRequired: 'Escribe tu código postal.', nameRequired: 'Escribe tu nombre.',
  acceptTerms: 'He leído y acepto las', termsLink: 'condiciones de uso', termsRequired: 'Para continuar, acepta las condiciones.',
  termsUpdated: 'Hemos actualizado las condiciones de uso. Revísalas y acéptalas para continuar.',
  p2pNote: 'Intercambio de libros solo os pone en contacto. El trato es entre vosotros: revisa el libro antes de pagar.',
  continue: 'Continuar', viewTerms: 'Condiciones de uso', acceptedOn: 'Aceptadas el {date}',
  nearMe: 'Cerca de mí', sameArea: 'tu zona', nearby: 'cerca', location: 'Ubicación', savePostal: 'Guardar', saved: 'Guardado',
  fromWishlist: 'De tu lista de deseos', wantYourBooks: 'Quieren tus libros', wantsCount: 'Quiere {n} de tu estantería',
  onYourWishlist: '¡Está en tu lista de deseos!', wantedBy: 'Buscan este libro:', onTheirWishlist: 'En su lista de deseos',
  viewProfile: 'Ver perfil', theirShelf: 'Su estantería', theirWishlist: 'Lo que buscan',
  tailored: 'Propón un intercambio', tailoredHint: 'Hemos marcado las coincidencias; cámbialas si quieres.',
  youGet: 'Tú recibes', youGive: 'Tú das', proposeExchange: 'Proponer intercambio', pickSomething: 'Marca al menos un libro suyo.',
  exchangeMsg: '¡Hola! Veo que buscas: {give}. ¿Lo cambiamos por: {get}?', exchangeMsgPlain: '¡Hola! Me gustaría: {get}. ¿Quedamos cerca?',
  noMatches: 'Aún no hay coincidencias.', nothingHere: 'Nada por ahora.',
  myWishlist: 'Mi lista de deseos', wishEmpty: 'Añade libros que buscas: te avisaremos cuando alguien los tenga.', addWish: 'Añadir deseo',
  addModeShelf: 'Tengo este libro', addModeWish: 'Busco este libro', saveWish: 'Añadir a mi lista de deseos',
  wishSavedTitle: '¡Añadido a tu lista!', wishSavedText: 'Te avisaremos cuando alguien lo ofrezca.',
  alreadyAvailable: 'Ya disponible de:', peopleWant: '¡{n} personas buscan este libro!'
});
Object.assign(window.STRINGS.en, {
  postal: 'Postal code', postalPh: 'e.g. 2700',
  postalHint: 'Only your postal code is shown – never your address. It helps you find neighbours and avoid shipping.',
  postalRequired: 'Please enter your postal code.', nameRequired: 'Please enter your name.',
  acceptTerms: 'I have read and accept the', termsLink: 'Terms of use', termsRequired: 'Please accept the terms to continue.',
  termsUpdated: 'We have updated the terms of use. Please review and accept them to continue.',
  p2pNote: 'Book Swap only puts you in touch. The deal is between you – check the book before you pay.',
  continue: 'Continue', viewTerms: 'Terms of use', acceptedOn: 'Accepted on {date}',
  nearMe: 'Near me', sameArea: 'your area', nearby: 'nearby', location: 'Location', savePostal: 'Save', saved: 'Saved',
  fromWishlist: 'From your wish list', wantYourBooks: 'They want your books', wantsCount: 'Wants {n} from your shelf',
  onYourWishlist: 'On your wish list!', wantedBy: 'Wanted by:', onTheirWishlist: 'On their wish list',
  viewProfile: 'View profile', theirShelf: 'Their shelf', theirWishlist: "What they're looking for",
  tailored: 'Make a tailored offer', tailoredHint: "We've ticked the matches – change them if you like.",
  youGet: 'You get', youGive: 'You give', proposeExchange: 'Propose exchange', pickSomething: 'Tick at least one of their books.',
  exchangeMsg: 'Hi! I saw you are looking for: {give}. Would you swap for: {get}?', exchangeMsgPlain: 'Hi! I would like: {get}. Could we meet nearby?',
  noMatches: 'No matches yet.', nothingHere: 'Nothing yet.',
  myWishlist: 'My wish list', wishEmpty: "Add books you're looking for – we'll tell you when someone has them.", addWish: 'Add a wish',
  addModeShelf: 'I have this book', addModeWish: "I'm looking for it", saveWish: 'Add to wish list',
  wishSavedTitle: 'Added to your wish list!', wishSavedText: "We'll let you know when someone offers it.",
  alreadyAvailable: 'Already available from:', peopleWant: '{n} people are looking for this book!'
});

/* Country */
Object.assign(window.STRINGS.lt, {
  country: 'Šalis', chooseCountry: 'Pasirinkite šalį', countryRequired: 'Pasirinkite šalį.',
  postalInvalid: 'Patikrinkite pašto kodą – jis neatitinka šalies formato ({country}).',
  postalHint: 'Rodoma tik šalis ir pašto kodas – niekada adresas. Taip rasite kaimynus ir išvengsite siuntimo.',
  profileIncomplete: 'Papildykite profilį: nurodykite šalį ir pašto kodą.'
});
Object.assign(window.STRINGS.es, {
  country: 'País', chooseCountry: 'Elige un país', countryRequired: 'Elige un país.',
  postalInvalid: 'Revisa el código postal: no coincide con el formato del país ({country}).',
  postalHint: 'Solo se muestran el país y el código postal, nunca tu dirección. Así encontrarás vecinos y evitarás envíos.',
  profileIncomplete: 'Completa tu perfil: indica tu país y código postal.'
});
Object.assign(window.STRINGS.en, {
  country: 'Country', chooseCountry: 'Choose a country', countryRequired: 'Please choose a country.',
  postalInvalid: "Please check the postal code – it doesn't match the format for {country}.",
  postalHint: 'Only your country and postal code are shown – never your address. It helps you find neighbours and avoid shipping.',
  profileIncomplete: 'Please complete your profile: add your country and postal code.'
});

/* Scanner help */
Object.assign(window.STRINGS.lt, {
  scanTips: 'Laikykite 15–25 cm atstumu, brūkšninis kodas – horizontaliai per visą rėmelį. Gera šviesa padeda.',
  photoOfBarcode: 'Nufotografuoti brūkšninį kodą', photoScanFail: 'Nuotraukoje kodo neradome. Fotografuokite iš arčiau, kad kodas būtų ryškus, arba įveskite ISBN.'
});
Object.assign(window.STRINGS.es, {
  scanTips: 'Sujétalo a 15–25 cm, con el código de barras en horizontal ocupando el recuadro. Con buena luz funciona mejor.',
  photoOfBarcode: 'Hacer foto del código de barras', photoScanFail: 'No encontramos el código en la foto. Hazla más cerca y nítida, o escribe el ISBN.'
});
Object.assign(window.STRINGS.en, {
  scanTips: 'Hold it 15–25 cm away, with the barcode horizontal and filling the frame. Good light helps.',
  photoOfBarcode: 'Take a photo of the barcode', photoScanFail: "We couldn't find a barcode in the photo. Take it closer and in focus, or type the ISBN."
});

/* ISBN feedback and photos */
Object.assign(window.STRINGS.lt, {
  searchingIsbn: 'Ieškoma ISBN {isbn}…',
  foundIsbn: 'ISBN {isbn} rasta: {src}. Patikrinkite ir papildykite.',
  notFoundIsbn: 'ISBN {isbn} nerasta – nieko tokio, įveskite kelias detales.',
  foundLocalIsbn: 'ISBN {isbn}: šią knygą jau buvo pridėjusi kita šeima – informacija nukopijuota.',
  photosLabel: 'Jūsų egzemplioriaus nuotraukos (1–{max})', photoN: 'Nuotrauka {n}', removePhoto: 'Pašalinti nuotrauką',
  photosHint: 'Nufotografuokite viršelį ir nusidėvėjimą. Nefotografuokite vidinių puslapių – čia keičiamasi tik popierinėmis knygomis, ne kopijomis.',
  photoRequired: 'Pridėkite bent vieną savo egzemplioriaus nuotrauką.', maxPhotos: 'Daugiausia {max} nuotraukos.'
});
Object.assign(window.STRINGS.es, {
  searchingIsbn: 'Buscando ISBN {isbn}…',
  foundIsbn: 'ISBN {isbn} encontrado en {src}. Revisa y completa los datos.',
  notFoundIsbn: 'No se ha encontrado el ISBN {isbn}; no pasa nada, añade unos datos.',
  foundLocalIsbn: 'ISBN {isbn}: otra familia ya añadió este libro; hemos copiado los datos.',
  photosLabel: 'Fotos de tu ejemplar (1–{max})', photoN: 'Foto {n}', removePhoto: 'Quitar foto',
  photosHint: 'Fotografía la portada y el desgaste. No fotografíes las páginas interiores: aquí se intercambian libros en papel, no copias.',
  photoRequired: 'Añade al menos una foto de tu ejemplar.', maxPhotos: 'Máximo {max} fotos.'
});
Object.assign(window.STRINGS.en, {
  searchingIsbn: 'Looking up ISBN {isbn}…',
  foundIsbn: 'ISBN {isbn} found on {src}. Check and complete the details.',
  notFoundIsbn: 'ISBN {isbn} could not be found – no problem, add a few details.',
  foundLocalIsbn: 'ISBN {isbn}: another family already added this book – details copied.',
  photosLabel: 'Photos of your copy (1–{max})', photoN: 'Photo {n}', removePhoto: 'Remove photo',
  photosHint: 'Photograph the cover and any wear and tear. Do not photograph the inside pages – Book Swap is for physical books, not copies.',
  photoRequired: 'Please add at least one photo of your own copy.', maxPhotos: 'Up to {max} photos.'
});
Object.assign(window.STRINGS.lt, { copyBlocked: 'Knygų kopijomis ir failais dalintis negalima – tik popierinėmis knygomis.' });
Object.assign(window.STRINGS.es, { copyBlocked: 'No se pueden compartir copias ni archivos de libros, solo libros en papel.' });
Object.assign(window.STRINGS.en, { copyBlocked: "Sharing copies or files of books isn't allowed – only physical books." });
Object.assign(window.STRINGS.lt, { photoAdd: 'Pridėti nuotrauką' });
Object.assign(window.STRINGS.es, { photoAdd: 'Añadir foto' });
Object.assign(window.STRINGS.en, { photoAdd: 'Add photo' });

/* Description and notes about this copy */
Object.assign(window.STRINGS.lt, {
  copyNotes: 'Apie šį egzempliorių', copyNotesPh: 'Pvz. nuplėštas aplanko kampas, keli pieštuko brūkšniai',
  descPh: 'Apie ką ši knyga? (užpildoma automatiškai, jei randama)', noDescFound: 'Aprašymo neradome – galite parašyti trumpai patys.'
});
Object.assign(window.STRINGS.es, {
  copyNotes: 'Sobre este ejemplar', copyNotesPh: 'Ej. esquina de la cubierta doblada, algo de lápiz',
  descPh: '¿De qué trata el libro? (se rellena solo si lo encontramos)', noDescFound: 'No hemos encontrado descripción; puedes escribir una breve.'
});
Object.assign(window.STRINGS.en, {
  copyNotes: 'About this copy', copyNotesPh: 'e.g. torn corner on the cover, a few pencil marks',
  descPh: 'What is the book about? (filled in automatically when we find one)', noDescFound: "We didn't find a description – you can write a short one."
});

/* Accounts (live mode) */
Object.assign(window.STRINGS.lt, {
  emailLabel: 'El. paštas', emailPh: 'jusu@pastas.lt', sendCode: 'Gauti prisijungimo kodą', emailInvalid: 'Patikrinkite el. pašto adresą.',
  noPassword: 'Slaptažodžio nereikia – atsiųsime nuorodą ir 6 skaitmenų kodą.',
  checkEmail: 'Išsiuntėme laišką adresu {email}. Atidarykite nuorodą arba įveskite kodą žemiau.',
  codeLabel: 'Kodas iš laiško', verify: 'Prisijungti', otherEmail: 'Kitas el. paštas', resend: 'Siųsti dar kartą',
  codeInvalid: 'Kodas neteisingas arba nebegalioja. Paprašykite naujo.',
  joinWithCode: 'Turiu pakvietimo kodą', startGroup: 'Sukurti naują grupę', inviteCode: 'Pakvietimo kodas', inviteCodePh: 'Pvz. K7QM2WXA',
  groupNameLabel: 'Grupės pavadinimas', groupNamePh: 'Pvz. Kopenhagos lituanistinė mokyklėlė',
  groupNameRequired: 'Įveskite grupės pavadinimą.', inviteRequired: 'Įveskite pakvietimo kodą.',
  inviteTitle: 'Pakviesti šeimas', inviteHint: 'Sukurkite kodą ir pasidalinkite juo tėvų grupėje.', createInvite: 'Sukurti pakvietimo kodą',
  inviteShare: 'Kodas galioja 30 dienų. Pasidalinkite juo arba nuoroda.', copyLink: 'Dalintis pakvietimu', copied: 'Nukopijuota!',
  inviteMessage: 'Prisijunk prie „{group}“ knygų keityklos! Kodas: {code}\n{link}',
  signedInAs: 'Prisijungta kaip {email}', signOut: 'Atsijungti', leaveGroup: 'Palikti grupę ir ištrinti mano duomenis',
  confirmLeave: 'Tikrai palikti grupę? Jūsų knygos, norai ir nuotraukos bus ištrinti.',
  loading: 'Kraunama…', errGeneric: 'Kažkas nepavyko.', errInvite: 'Pakvietimo kodas neteisingas arba nebegalioja.',
  errNotAvailable: 'Kai kurios knygos jau nebegalimos. Atnaujinkite ir bandykite dar kartą.',
  errRateLimit: 'Per daug bandymų. Palaukite minutę ir bandykite dar kartą.',
  errEmailNotAllowed: 'Laiško šiuo adresu išsiųsti dar negalime – programėlės el. pašto paslauga dar nenustatyta.',
  errOffline: 'Nėra ryšio. Patikrinkite internetą.',
  removeListing: 'Pašalinti skelbimą', confirmRemove: 'Pašalinti šią knygą iš lentynos?'
});
Object.assign(window.STRINGS.es, {
  emailLabel: 'Correo electrónico', emailPh: 'tu@correo.es', sendCode: 'Recibir código de acceso', emailInvalid: 'Revisa el correo electrónico.',
  noPassword: 'Sin contraseña: te enviamos un enlace y un código de 6 dígitos.',
  checkEmail: 'Hemos enviado un correo a {email}. Abre el enlace o escribe el código abajo.',
  codeLabel: 'Código del correo', verify: 'Entrar', otherEmail: 'Usar otro correo', resend: 'Reenviar',
  codeInvalid: 'El código no es correcto o ha caducado. Pide uno nuevo.',
  joinWithCode: 'Tengo un código de invitación', startGroup: 'Crear un grupo nuevo', inviteCode: 'Código de invitación', inviteCodePh: 'Ej. K7QM2WXA',
  groupNameLabel: 'Nombre del grupo', groupNamePh: 'Ej. Escuela lituana de Copenhague',
  groupNameRequired: 'Escribe el nombre del grupo.', inviteRequired: 'Escribe el código de invitación.',
  inviteTitle: 'Invitar a familias', inviteHint: 'Crea un código y compártelo en el grupo de padres.', createInvite: 'Crear código de invitación',
  inviteShare: 'El código vale 30 días. Compártelo o comparte el enlace.', copyLink: 'Compartir invitación', copied: '¡Copiado!',
  inviteMessage: '¡Únete al intercambio de libros de «{group}»! Código: {code}\n{link}',
  signedInAs: 'Conectado como {email}', signOut: 'Cerrar sesión', leaveGroup: 'Salir del grupo y borrar mis datos',
  confirmLeave: '¿Seguro que quieres salir del grupo? Se borrarán tus libros, deseos y fotos.',
  loading: 'Cargando…', errGeneric: 'Algo ha fallado.', errInvite: 'El código de invitación no es válido o ha caducado.',
  errNotAvailable: 'Algunos libros ya no están disponibles. Actualiza e inténtalo de nuevo.',
  errRateLimit: 'Demasiados intentos. Espera un minuto e inténtalo de nuevo.',
  errEmailNotAllowed: 'Aún no podemos enviar correos a esta dirección: falta configurar el servicio de correo de la app.',
  errOffline: 'Sin conexión. Revisa internet.',
  removeListing: 'Retirar anuncio', confirmRemove: '¿Retirar este libro de tu estantería?'
});
Object.assign(window.STRINGS.en, {
  emailLabel: 'Email', emailPh: 'you@example.com', sendCode: 'Send me a sign-in code', emailInvalid: 'Please check the email address.',
  noPassword: "No password needed – we'll email you a link and a 6-digit code.",
  checkEmail: 'We sent an email to {email}. Open the link, or type the code below.',
  codeLabel: 'Code from the email', verify: 'Sign in', otherEmail: 'Use another email', resend: 'Send again',
  codeInvalid: 'That code is wrong or has expired. Ask for a new one.',
  joinWithCode: 'I have an invite code', startGroup: 'Start a new group', inviteCode: 'Invite code', inviteCodePh: 'e.g. K7QM2WXA',
  groupNameLabel: 'Group name', groupNamePh: 'e.g. Lithuanian Saturday School, Copenhagen',
  groupNameRequired: 'Please enter a group name.', inviteRequired: 'Please enter the invite code.',
  inviteTitle: 'Invite families', inviteHint: 'Create a code and share it in your parents’ group chat.', createInvite: 'Create invite code',
  inviteShare: 'The code is valid for 30 days. Share it or the link.', copyLink: 'Share invite', copied: 'Copied!',
  inviteMessage: 'Join the "{group}" book swap! Code: {code}\n{link}',
  signedInAs: 'Signed in as {email}', signOut: 'Sign out', leaveGroup: 'Leave group and delete my data',
  confirmLeave: 'Really leave the group? Your books, wishes and photos will be deleted.',
  loading: 'Loading…', errGeneric: 'Something went wrong.', errInvite: 'That invite code is wrong or has expired.',
  errNotAvailable: 'Some books are no longer available. Refresh and try again.',
  errRateLimit: 'Too many attempts. Wait a minute and try again.',
  errEmailNotAllowed: "We can't send email to this address yet – the app's email service isn't set up.",
  errOffline: 'No connection. Check your internet.',
  removeListing: 'Remove listing', confirmRemove: 'Remove this book from your shelf?'
});
Object.assign(window.STRINGS.lt, { linkExpired: 'Ši prisijungimo nuoroda nebegalioja arba jau buvo panaudota (kartais el. pašto programos ją atidaro automatiškai). Paprašykite naujos ir atidarykite ją iškart.', linkFailed: 'Prisijungti per nuorodą nepavyko.' });
Object.assign(window.STRINGS.es, { linkExpired: 'Este enlace ha caducado o ya se usó (a veces la app de correo lo abre automáticamente). Pide uno nuevo y ábrelo enseguida.', linkFailed: 'No se pudo entrar con el enlace.' });
Object.assign(window.STRINGS.en, { linkExpired: 'This sign-in link has expired or was already used (some email apps open links automatically). Ask for a new one and open it straight away.', linkFailed: "Signing in with the link didn't work." });

/* Ratings, profile picture, deal counts */
Object.assign(window.STRINGS.lt, {
  rateTitle: 'Kaip sekėsi mainai su {name}?', rateHint: 'Įvertinkite nuo 1 iki 5 knygelių.', reviewPh: 'Keli žodžiai (nebūtina)',
  submitReview: 'Siųsti įvertinimą', youRated: 'Jūsų įvertinimas – {name}:', editReview: 'Keisti', reviewThanks: 'Ačiū už įvertinimą!',
  pickRating: 'Pasirinkite nuo 1 iki 5 knygelių.', noRatings: 'Dar neįvertinta', reviewsTitle: 'Atsiliepimai', booksOutOf: '{n} iš 5 knygelių',
  statSold: 'Parduota', statDonated: 'Padovanota', statSwapped: 'Iškeista',
  changeAvatar: 'Keisti nuotrauką', avatarHint: 'Bakstelėkite raidę ir pridėkite nuotrauką – savo ar mėgstamo dalyko. Prašome nekelti vaikų nuotraukų.'
});
Object.assign(window.STRINGS.es, {
  rateTitle: '¿Qué tal el intercambio con {name}?', rateHint: 'Valora de 1 a 5 libritos.', reviewPh: 'Unas palabras (opcional)',
  submitReview: 'Enviar valoración', youRated: 'Tu valoración de {name}:', editReview: 'Cambiar', reviewThanks: '¡Gracias por tu valoración!',
  pickRating: 'Elige de 1 a 5 libritos.', noRatings: 'Aún sin valoraciones', reviewsTitle: 'Valoraciones', booksOutOf: '{n} de 5 libritos',
  statSold: 'Vendidos', statDonated: 'Regalados', statSwapped: 'Intercambiados',
  changeAvatar: 'Cambiar foto', avatarHint: 'Toca la letra para añadir una foto, tuya o de algo que te guste. Por favor, sin fotos de niños.'
});
Object.assign(window.STRINGS.en, {
  rateTitle: 'How was the exchange with {name}?', rateHint: 'Give 1 to 5 little books.', reviewPh: 'A few words (optional)',
  submitReview: 'Send review', youRated: 'Your review of {name}:', editReview: 'Edit', reviewThanks: 'Thanks for your review!',
  pickRating: 'Choose 1 to 5 little books.', noRatings: 'No reviews yet', reviewsTitle: 'Reviews', booksOutOf: '{n} of 5 books',
  statSold: 'Sold', statDonated: 'Donated', statSwapped: 'Exchanged',
  changeAvatar: 'Change picture', avatarHint: 'Tap the letter to add a picture – of yourself or something you like. Please no photos of children.'
});
