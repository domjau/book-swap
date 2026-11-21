/* UI translations. To add a language: copy the `en` block, translate the values,
   and add the code to UI_LANGS. Placeholders like {name} are filled in by t(). */
window.UI_LANGS = ['lt', 'es', 'en'];

window.STRINGS = {
  lt: {
    appName: 'seku seku',
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
    appName: 'seku seku',
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
    appName: 'seku seku',
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
  p2pNote: 'seku seku tik padeda susirasti. Sandoris yra tarp jūsų – patikrinkite knygą prieš mokėdami.',
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
  p2pNote: 'seku seku solo os pone en contacto. El trato es entre vosotros: revisa el libro antes de pagar.',
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
  p2pNote: 'seku seku only puts you in touch. The deal is between you – check the book before you pay.',
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
  photosHint: 'Photograph the cover and any wear and tear. Do not photograph the inside pages – seku seku is for physical books, not copies.',
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

/* Notifications, reports, organiser panel, platform admin */
Object.assign(window.STRINGS.en, {
  notifTitle: 'Notifications', notifEmpty: 'Nothing new yet.', markAllRead: 'Mark all as read', notifBell: 'Notifications',
  n_request_new: '{name} asks for your book(s)', n_message: 'New message from {name}', n_message_many: '{n} new messages from {name}',
  n_request_accepted: '{name} accepted your request', n_request_declined: '{name} declined your request',
  n_handover_set: 'Handover with {name}: {when}, {where}', n_handover_reminder: 'Reminder: handover with {name} tomorrow – {where}',
  n_exchange_done: 'Exchange with {name} is done – leave a review', n_wish_match: '"{title}" from your wish list was listed by {name}',
  n_wanted: '{name} is looking for "{title}" – you have it', n_review: '{name} gave you {n} of 5 books',
  n_announcement: 'From your organiser: {text}', n_report_new: 'New report: {category}', n_member_joined: '{name} joined the group',
  notifSettings: 'Notifications', notifSettingsHint: 'Choose what you hear about, in the app and by email.',
  chApp: 'App', chEmail: 'Email', emailMode: 'Emails', emailInstant: 'Right away', emailDaily: 'Once a day (summary)', emailOff: 'Never',
  tl_request_new: 'Someone asks for my books', tl_message: 'New chat messages', tl_request_answered: 'My request is accepted or declined',
  tl_handover_set: 'Handover date set or changed', tl_handover_reminder: 'Handover reminder (day before)', tl_exchange_done: 'Exchange done – review reminder',
  tl_wish_match: 'A book from my wish list is listed', tl_wanted: 'Someone looks for a book I have', tl_review: 'I got a review',
  tl_announcement: 'Messages from organisers', tl_report_new: 'New reports (organisers)', tl_member_joined: 'New members (organisers)',
  saveSettings: 'Save settings',
  reportTitle: 'Report a problem', reportWhat: 'What happened?', reportDetails: 'Details (optional)', sendReport: 'Send report', cancel: 'Cancel',
  rc_no_show: "Didn't show up", rc_inappropriate: 'Inappropriate content or behaviour', rc_copyright: 'Copies / piracy',
  rc_spam: 'Spam or commercial selling', rc_safety: 'Safety concern', rc_other: 'Other', reportMember: 'Report member', reportBook: 'Report listing',
  adminTitle: 'Organiser panel', openAdmin: 'Organiser panel', tabOverview: 'Overview', tabMembers: 'Members', tabReports: 'Reports', tabInvites: 'Invites', tabSettings: 'Settings',
  stMembers: 'Members', stAvailable: 'Books available', stGoneYear: 'Books passed on this year', stOpenRequests: 'Open requests', stOpenReports: 'Open reports', stHidden: 'Hidden listings',
  announceTitle: 'Send an announcement', announcePh: 'e.g. Book swap table at school next Saturday!', announceSend: 'Send to all members', announced: 'Sent to {n} members.',
  roleOrganiser: 'Organiser', roleMember: 'Member', makeOrganiser: 'Make organiser', makeMember: 'Make member', removeMember: 'Remove',
  removeReasonPrompt: 'Why are you removing {name}? (shown in the moderation log)', banConfirm: 'Also block {name} from re-joining with a new invite?',
  bannedTitle: 'Blocked from re-joining', unban: 'Unblock', noReports: 'No reports. 🎉', openReports: 'Open', resolvedReports: 'Resolved',
  reportedBy: 'Reported by {name}', viewConversation: 'Show conversation', resolve: 'Mark resolved', resolvePrompt: 'Short note on what you did (optional)',
  hideListing: 'Hide listing', unhideListing: 'Show listing again', hiddenBadge: 'Hidden by organiser', hiddenListings: 'Hidden listings',
  invitesTitle: 'Invite codes', inviteExpires: 'Valid until {date}', inviteRevoked: 'Revoked', inviteExpired: 'Expired', revoke: 'Revoke',
  groupSettings: 'Group settings', handoverPlace: 'Usual handover place', handoverDay: 'Usual handover day', anyDay: 'Any day',
  days: { mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday', thu: 'Thursday', fri: 'Friday', sat: 'Saturday', sun: 'Sunday' },
  modLog: 'Moderation log', noLog: 'No organiser actions yet.', saved2: 'Saved',
  platformTitle: 'Platform admin', openPlatform: 'Platform admin', groupsTitle: 'Groups', deleteGroup: 'Delete group', deleteGroupConfirm: 'Type the group name to delete "{name}" and all its data:',
  allReports: 'Open reports in all groups'
});
Object.assign(window.STRINGS.lt, {
  notifTitle: 'Pranešimai', notifEmpty: 'Kol kas nieko naujo.', markAllRead: 'Pažymėti viską kaip perskaitytą', notifBell: 'Pranešimai',
  n_request_new: '{name} prašo jūsų knygos(-ų)', n_message: 'Nauja žinutė nuo {name}', n_message_many: '{n} naujos žinutės nuo {name}',
  n_request_accepted: '{name} priėmė jūsų prašymą', n_request_declined: '{name} atmetė jūsų prašymą',
  n_handover_set: 'Perdavimas su {name}: {when}, {where}', n_handover_reminder: 'Priminimas: rytoj perdavimas su {name} – {where}',
  n_exchange_done: 'Mainai su {name} baigti – įvertinkite', n_wish_match: '„{title}“ iš jūsų norų sąrašo pasiūlė {name}',
  n_wanted: '{name} ieško „{title}“ – jūs ją turite', n_review: '{name} jus įvertino {n} iš 5 knygelių',
  n_announcement: 'Organizatorius praneša: {text}', n_report_new: 'Naujas pranešimas apie problemą: {category}', n_member_joined: '{name} prisijungė prie grupės',
  notifSettings: 'Pranešimai', notifSettingsHint: 'Pasirinkite, apie ką norite sužinoti programėlėje ir el. paštu.',
  chApp: 'Programėlė', chEmail: 'El. paštas', emailMode: 'Laiškai', emailInstant: 'Iškart', emailDaily: 'Kartą per dieną (santrauka)', emailOff: 'Niekada',
  tl_request_new: 'Kas nors prašo mano knygų', tl_message: 'Naujos žinutės', tl_request_answered: 'Mano prašymas priimtas ar atmestas',
  tl_handover_set: 'Nustatyta ar pakeista perdavimo data', tl_handover_reminder: 'Priminimas apie perdavimą (dieną prieš)', tl_exchange_done: 'Mainai baigti – priminimas įvertinti',
  tl_wish_match: 'Pasiūlyta knyga iš mano norų sąrašo', tl_wanted: 'Kas nors ieško mano turimos knygos', tl_review: 'Gavau įvertinimą',
  tl_announcement: 'Organizatorių pranešimai', tl_report_new: 'Nauji pranešimai apie problemas (organizatoriams)', tl_member_joined: 'Nauji nariai (organizatoriams)',
  saveSettings: 'Išsaugoti nustatymus',
  reportTitle: 'Pranešti apie problemą', reportWhat: 'Kas nutiko?', reportDetails: 'Detalės (nebūtina)', sendReport: 'Siųsti', cancel: 'Atšaukti',
  rc_no_show: 'Neatvyko', rc_inappropriate: 'Netinkamas turinys ar elgesys', rc_copyright: 'Kopijos / piratavimas',
  rc_spam: 'Šlamštas ar komercinė prekyba', rc_safety: 'Nerimas dėl saugumo', rc_other: 'Kita', reportMember: 'Pranešti apie narį', reportBook: 'Pranešti apie skelbimą',
  adminTitle: 'Organizatoriaus skydelis', openAdmin: 'Organizatoriaus skydelis', tabOverview: 'Apžvalga', tabMembers: 'Nariai', tabReports: 'Pranešimai', tabInvites: 'Kvietimai', tabSettings: 'Nustatymai',
  stMembers: 'Nariai', stAvailable: 'Galimos knygos', stGoneYear: 'Šiemet perduota knygų', stOpenRequests: 'Atviri prašymai', stOpenReports: 'Atviri pranešimai', stHidden: 'Paslėpti skelbimai',
  announceTitle: 'Siųsti pranešimą visiems', announcePh: 'Pvz. Kitą šeštadienį mokykloje – knygų mainų stalas!', announceSend: 'Siųsti visiems nariams', announced: 'Išsiųsta {n} nariams.',
  roleOrganiser: 'Organizatorius', roleMember: 'Narys', makeOrganiser: 'Padaryti organizatoriumi', makeMember: 'Padaryti nariu', removeMember: 'Pašalinti',
  removeReasonPrompt: 'Kodėl šalinate {name}? (bus įrašyta į moderavimo žurnalą)', banConfirm: 'Ar neleisti {name} vėl prisijungti su nauju kvietimu?',
  bannedTitle: 'Negali vėl prisijungti', unban: 'Leisti vėl', noReports: 'Pranešimų nėra. 🎉', openReports: 'Atviri', resolvedReports: 'Išspręsti',
  reportedBy: 'Pranešė {name}', viewConversation: 'Rodyti pokalbį', resolve: 'Pažymėti išspręstu', resolvePrompt: 'Trumpai, ką padarėte (nebūtina)',
  hideListing: 'Paslėpti skelbimą', unhideListing: 'Vėl rodyti skelbimą', hiddenBadge: 'Paslėpė organizatorius', hiddenListings: 'Paslėpti skelbimai',
  invitesTitle: 'Pakvietimo kodai', inviteExpires: 'Galioja iki {date}', inviteRevoked: 'Atšauktas', inviteExpired: 'Nebegalioja', revoke: 'Atšaukti',
  groupSettings: 'Grupės nustatymai', handoverPlace: 'Įprasta perdavimo vieta', handoverDay: 'Įprasta perdavimo diena', anyDay: 'Bet kuri diena',
  days: { mon: 'Pirmadienis', tue: 'Antradienis', wed: 'Trečiadienis', thu: 'Ketvirtadienis', fri: 'Penktadienis', sat: 'Šeštadienis', sun: 'Sekmadienis' },
  modLog: 'Moderavimo žurnalas', noLog: 'Organizatorių veiksmų dar nėra.', saved2: 'Išsaugota',
  platformTitle: 'Platformos administravimas', openPlatform: 'Platformos administravimas', groupsTitle: 'Grupės', deleteGroup: 'Ištrinti grupę', deleteGroupConfirm: 'Įrašykite grupės pavadinimą, kad ištrintumėte „{name}“ ir visus jos duomenis:',
  allReports: 'Atviri pranešimai visose grupėse'
});
Object.assign(window.STRINGS.es, {
  notifTitle: 'Notificaciones', notifEmpty: 'Nada nuevo por ahora.', markAllRead: 'Marcar todo como leído', notifBell: 'Notificaciones',
  n_request_new: '{name} te pide libro(s)', n_message: 'Nuevo mensaje de {name}', n_message_many: '{n} mensajes nuevos de {name}',
  n_request_accepted: '{name} ha aceptado tu pedido', n_request_declined: '{name} ha rechazado tu pedido',
  n_handover_set: 'Entrega con {name}: {when}, {where}', n_handover_reminder: 'Recordatorio: mañana entrega con {name} – {where}',
  n_exchange_done: 'Intercambio con {name} completado: deja tu valoración', n_wish_match: '{name} ha anunciado «{title}», de tu lista de deseos',
  n_wanted: '{name} busca «{title}» y tú lo tienes', n_review: '{name} te ha dado {n} de 5 libritos',
  n_announcement: 'Del organizador: {text}', n_report_new: 'Nueva denuncia: {category}', n_member_joined: '{name} se ha unido al grupo',
  notifSettings: 'Notificaciones', notifSettingsHint: 'Elige de qué quieres enterarte, en la app y por correo.',
  chApp: 'App', chEmail: 'Correo', emailMode: 'Correos', emailInstant: 'Al momento', emailDaily: 'Una vez al día (resumen)', emailOff: 'Nunca',
  tl_request_new: 'Alguien pide mis libros', tl_message: 'Mensajes nuevos', tl_request_answered: 'Mi pedido es aceptado o rechazado',
  tl_handover_set: 'Fecha de entrega fijada o cambiada', tl_handover_reminder: 'Recordatorio de entrega (el día antes)', tl_exchange_done: 'Intercambio completado: recordatorio para valorar',
  tl_wish_match: 'Se anuncia un libro de mi lista de deseos', tl_wanted: 'Alguien busca un libro que tengo', tl_review: 'He recibido una valoración',
  tl_announcement: 'Mensajes de los organizadores', tl_report_new: 'Nuevas denuncias (organizadores)', tl_member_joined: 'Nuevos miembros (organizadores)',
  saveSettings: 'Guardar ajustes',
  reportTitle: 'Denunciar un problema', reportWhat: '¿Qué ha pasado?', reportDetails: 'Detalles (opcional)', sendReport: 'Enviar', cancel: 'Cancelar',
  rc_no_show: 'No se presentó', rc_inappropriate: 'Contenido o comportamiento inapropiado', rc_copyright: 'Copias / piratería',
  rc_spam: 'Spam o venta comercial', rc_safety: 'Problema de seguridad', rc_other: 'Otro', reportMember: 'Denunciar miembro', reportBook: 'Denunciar anuncio',
  adminTitle: 'Panel del organizador', openAdmin: 'Panel del organizador', tabOverview: 'Resumen', tabMembers: 'Miembros', tabReports: 'Denuncias', tabInvites: 'Invitaciones', tabSettings: 'Ajustes',
  stMembers: 'Miembros', stAvailable: 'Libros disponibles', stGoneYear: 'Libros pasados este año', stOpenRequests: 'Pedidos abiertos', stOpenReports: 'Denuncias abiertas', stHidden: 'Anuncios ocultos',
  announceTitle: 'Enviar un aviso', announcePh: 'Ej. ¡El sábado que viene, mesa de intercambio en la escuela!', announceSend: 'Enviar a todos los miembros', announced: 'Enviado a {n} miembros.',
  roleOrganiser: 'Organizador', roleMember: 'Miembro', makeOrganiser: 'Hacer organizador', makeMember: 'Hacer miembro', removeMember: 'Eliminar',
  removeReasonPrompt: '¿Por qué eliminas a {name}? (queda en el registro de moderación)', banConfirm: '¿Impedir también que {name} vuelva a entrar con otra invitación?',
  bannedTitle: 'Bloqueados', unban: 'Desbloquear', noReports: 'No hay denuncias. 🎉', openReports: 'Abiertas', resolvedReports: 'Resueltas',
  reportedBy: 'Denunciado por {name}', viewConversation: 'Ver conversación', resolve: 'Marcar como resuelta', resolvePrompt: 'Nota breve de lo que hiciste (opcional)',
  hideListing: 'Ocultar anuncio', unhideListing: 'Volver a mostrar', hiddenBadge: 'Oculto por el organizador', hiddenListings: 'Anuncios ocultos',
  invitesTitle: 'Códigos de invitación', inviteExpires: 'Válido hasta {date}', inviteRevoked: 'Revocado', inviteExpired: 'Caducado', revoke: 'Revocar',
  groupSettings: 'Ajustes del grupo', handoverPlace: 'Lugar habitual de entrega', handoverDay: 'Día habitual de entrega', anyDay: 'Cualquier día',
  days: { mon: 'Lunes', tue: 'Martes', wed: 'Miércoles', thu: 'Jueves', fri: 'Viernes', sat: 'Sábado', sun: 'Domingo' },
  modLog: 'Registro de moderación', noLog: 'Aún no hay acciones de organizadores.', saved2: 'Guardado',
  platformTitle: 'Administración de la plataforma', openPlatform: 'Administración de la plataforma', groupsTitle: 'Grupos', deleteGroup: 'Eliminar grupo', deleteGroupConfirm: 'Escribe el nombre del grupo para eliminar «{name}» y todos sus datos:',
  allReports: 'Denuncias abiertas en todos los grupos'
});
Object.assign(window.STRINGS.en, { booksN: 'books' });
Object.assign(window.STRINGS.lt, { booksN: 'knygos' });
Object.assign(window.STRINGS.es, { booksN: 'libros' });

/* Open network: no communities or organisers; moderation by admins */
Object.assign(window.STRINGS.en, {
  tagline: "Children's books, family to family",
  welcomeText: "Share children's books with other families nearby – swap, sell or give them away.",
  adminTitle: 'Admin panel', openAdmin: 'Admin panel', tabAdmins: 'Admins', tabLog: 'Log',
  adminsTitle: 'Admins', adminsHint: 'Admins see reports and hidden listings, can remove or block members and send announcements to everyone. The person must have signed up first.',
  adminEmailPh: 'Email of the new admin', addAdmin: 'Add', adminAdded: 'Admin added.', removeAdmin: 'Remove', youLabel: '(you)',
  confirmRemoveAdmin: 'Remove admin rights from {name}?',
  errBlocked: 'This account has been blocked. Contact seku seku if you think this is a mistake.',
  errNoAccount: 'No account with that email yet – ask them to sign up first.', errLastAdmin: 'There must always be at least one admin.',
  tl_announcement: 'News from seku seku', n_announcement: 'From seku seku: {text}', tl_report_new: 'New reports (admins)', tl_member_joined: 'New members (admins)',
  reported: 'Reported to the seku seku admins.', handoverPh: 'Library or café nearby',
  defaultMsg: 'Hi! I would love these books. Where and when would suit you?',
  privacy: 'We only store your name, country, postal code and books. No addresses or phone numbers – you agree on a public place to meet.'
});
Object.assign(window.STRINGS.lt, {
  tagline: 'Vaikiškos knygos iš šeimos į šeimą',
  welcomeText: 'Dalinkitės vaikiškomis knygomis su šeimomis netoliese – mainykite, parduokite ar padovanokite.',
  adminTitle: 'Administravimas', openAdmin: 'Administravimas', tabAdmins: 'Administratoriai', tabLog: 'Žurnalas',
  adminsTitle: 'Administratoriai', adminsHint: 'Administratoriai mato pranešimus apie problemas ir paslėptus skelbimus, gali pašalinti ar užblokuoti narius ir siųsti pranešimus visiems. Žmogus pirmiausia turi užsiregistruoti.',
  adminEmailPh: 'Naujo administratoriaus el. paštas', addAdmin: 'Pridėti', adminAdded: 'Administratorius pridėtas.', removeAdmin: 'Pašalinti', youLabel: '(jūs)',
  confirmRemoveAdmin: 'Atimti administratoriaus teises iš {name}?',
  errBlocked: 'Ši paskyra užblokuota. Jei manote, kad tai klaida, susisiekite su seku seku.',
  errNoAccount: 'Su šiuo el. paštu paskyros dar nėra – paprašykite pirmiausia užsiregistruoti.', errLastAdmin: 'Visada turi likti bent vienas administratorius.',
  tl_announcement: 'seku seku naujienos', n_announcement: 'seku seku praneša: {text}', tl_report_new: 'Nauji pranešimai apie problemas (administratoriams)', tl_member_joined: 'Nauji nariai (administratoriams)',
  reported: 'Pranešta seku seku administratoriams.', handoverPh: 'Biblioteka ar kavinė netoliese',
  defaultMsg: 'Labas! Norėčiau šių knygų. Kur ir kada jums patogu?',
  privacy: 'Saugome tik vardą, šalį, pašto kodą ir knygas. Jokių adresų ar telefonų – susitariate susitikti viešoje vietoje.'
});
Object.assign(window.STRINGS.es, {
  tagline: 'Libros infantiles de familia en familia',
  welcomeText: 'Comparte libros infantiles con familias cercanas: intercambia, vende o regala.',
  adminTitle: 'Panel de administración', openAdmin: 'Panel de administración', tabAdmins: 'Administradores', tabLog: 'Registro',
  adminsTitle: 'Administradores', adminsHint: 'Los administradores ven las denuncias y los anuncios ocultos, pueden eliminar o bloquear miembros y enviar avisos a todos. La persona debe haberse registrado antes.',
  adminEmailPh: 'Correo del nuevo administrador', addAdmin: 'Añadir', adminAdded: 'Administrador añadido.', removeAdmin: 'Quitar', youLabel: '(tú)',
  confirmRemoveAdmin: '¿Quitar los permisos de administrador a {name}?',
  errBlocked: 'Esta cuenta está bloqueada. Contacta con seku seku si crees que es un error.',
  errNoAccount: 'Aún no hay ninguna cuenta con ese correo: pídele que se registre primero.', errLastAdmin: 'Siempre debe haber al menos un administrador.',
  tl_announcement: 'Novedades de seku seku', n_announcement: 'De seku seku: {text}', tl_report_new: 'Nuevas denuncias (administradores)', tl_member_joined: 'Nuevos miembros (administradores)',
  reported: 'Denunciado a los administradores de seku seku.', handoverPh: 'Biblioteca o cafetería cercana',
  defaultMsg: '¡Hola! Me gustarían estos libros. ¿Dónde y cuándo te viene bien?',
  privacy: 'Solo guardamos tu nombre, país, código postal y libros. Sin direcciones ni teléfonos: quedáis en un lugar público.'
});

// ---- intro (before sign-up) and the first-run tour (after sign-up)
Object.assign(window.STRINGS.en, {
  introTitle: 'Pass your books on. Find new ones nearby.',
  introLead: 'seku seku connects readers who live close to each other. Swap, sell or give away the books you have read – in any language.',
  freeChips: ['100% free', 'No ads', 'No password'],
  introCta: 'Create a free account',
  howTitle: 'How it works',
  how: [
    ['barcode', 'Scan the barcode', 'Point your camera at the ISBN on the back. Title, author and description fill in by themselves.'],
    ['camera', 'Snap a photo', 'Take a quick picture of your copy so others can see its condition. Done in under a minute.'],
    ['search', 'Find books near you', 'Browse by language, topic and distance. Ask for one book, or several from the same person at once.'],
    ['chat', 'Meet and swap', 'Agree on a time and a public place in the chat. Swap, sell or give away – it is up to you.']
  ],
  faqTitle: 'Good to know',
  faq: [
    ['Does it cost anything?', 'No. seku seku is free to use – no fees, no ads, no subscription. If you sell a book, the buyer pays you directly when you meet.'],
    ['Do I need a password?', 'No. Enter your email and we send you a 6-digit code. Next time, the same email signs you in.'],
    ['Who can see my details?', 'Only signed-in members, and only your name, country and postal code – never your address, email or phone number. You decide where to meet.'],
    ['Which books can I share?', 'Any physical book you own, in any language. Copies, scans and e-book files are not allowed.'],
    ['What if something goes wrong?', 'seku seku puts people in touch; the swap itself is between you and the other person. Meet in a public place, pay at the handover, and use the flag button to report anything odd – an admin checks every report.']
  ],
  signupTitle: 'Create your free account',
  signupHint: 'Already have one? Enter the same email to sign in.',
  step1of2: 'Step 1 of 2 · Your email',
  step2of2: 'Step 2 of 2 · Your profile',
  tryDemo: 'Just looking? Try the demo with sample books',
  tourHello: 'Welcome, {name}!',
  tourIntro: "You're in. Here's how to get going – four quick steps.",
  tour: [
    ['plus', 'Add your books', 'Tap + at the bottom, scan the barcode and take a photo. Then choose: swap, sell or give away.'],
    ['heart', 'Make a wish list', "In +, choose “I'm looking for it”. We tell you as soon as someone lists a book on your list."],
    ['bag', 'Ask for books', 'Open a book and tap “Add to request”. Books from the same person go into one request, so you can collect several at once.'],
    ['chat', 'Meet and rate', 'Agree on a time and a public place in the chat, and pay only when you meet. Afterwards tap “Mark as handed over” and rate each other.']
  ],
  tourNext: 'Next', tourBack: 'Back', tourSkip: 'Skip', tourAddFirst: 'Add my first book', tourLookAround: 'Look around first',
  howItWorks: 'How seku seku works', stepOf: '{n} of {total}'
});
Object.assign(window.STRINGS.lt, {
  introTitle: 'Perleiskite savo knygas. Raskite naujų netoliese.',
  introLead: 'seku seku suveda netoli vienas kito gyvenančius skaitytojus. Keiskitės, parduokite ar padovanokite perskaitytas knygas – bet kuria kalba.',
  freeChips: ['Visiškai nemokama', 'Be reklamų', 'Be slaptažodžių'],
  introCta: 'Susikurti nemokamą paskyrą',
  howTitle: 'Kaip tai veikia',
  how: [
    ['barcode', 'Nuskenuokite brūkšninį kodą', 'Nukreipkite kamerą į ISBN kodą ant galinio viršelio. Pavadinimas, autorius ir aprašymas užsipildys patys.'],
    ['camera', 'Nufotografuokite', 'Greitai nufotografuokite savo knygą, kad kiti matytų jos būklę. Užtrunka mažiau nei minutę.'],
    ['search', 'Raskite knygų netoliese', 'Ieškokite pagal kalbą, temą ir atstumą. Paprašykite vienos knygos arba iškart kelių iš to paties žmogaus.'],
    ['chat', 'Susitikite ir apsikeiskite', 'Pokalbyje susitarkite dėl laiko ir viešos vietos. Keiskitės, parduokite ar padovanokite – kaip norite.']
  ],
  faqTitle: 'Verta žinoti',
  faq: [
    ['Ar tai kainuoja?', 'Ne. seku seku naudotis nemokama – jokių mokesčių, reklamų ar prenumeratų. Jei parduodate knygą, pirkėjas sumoka jums tiesiogiai susitikus.'],
    ['Ar reikia slaptažodžio?', 'Ne. Įveskite el. paštą ir atsiųsime 6 skaitmenų kodą. Kitą kartą prisijungsite tuo pačiu el. paštu.'],
    ['Kas mato mano duomenis?', 'Tik prisijungę nariai ir tik jūsų vardą, šalį bei pašto kodą – niekada adreso, el. pašto ar telefono. Kur susitikti, sprendžiate jūs.'],
    ['Kokiomis knygomis galima dalintis?', 'Bet kokiomis savo popierinėmis knygomis, bet kuria kalba. Kopijos, skenuotos knygos ir el. knygų failai neleidžiami.'],
    ['O jei kas nors nepavyks?', 'seku seku tik suveda žmones – mainai vyksta tarp jūsų ir kito žmogaus. Susitikite viešoje vietoje, mokėkite perdavimo metu, o įtartiną elgesį praneškite vėliavėlės mygtuku – administratorius peržiūri kiekvieną pranešimą.']
  ],
  signupTitle: 'Susikurkite nemokamą paskyrą',
  signupHint: 'Jau turite? Įveskite tą patį el. paštą ir prisijungsite.',
  step1of2: '1 žingsnis iš 2 · El. paštas',
  step2of2: '2 žingsnis iš 2 · Jūsų profilis',
  tryDemo: 'Tik apsižvalgote? Išbandykite demonstracinę versiją su pavyzdinėmis knygomis',
  tourHello: 'Sveiki, {name}!',
  tourIntro: 'Viskas paruošta. Štai kaip pradėti – keturi trumpi žingsniai.',
  tour: [
    ['plus', 'Pridėkite savo knygų', 'Apačioje spustelėkite +, nuskenuokite brūkšninį kodą ir nufotografuokite. Tada pasirinkite: keistis, parduoti ar padovanoti.'],
    ['heart', 'Susikurkite norų sąrašą', 'Skiltyje + pasirinkite „Ieškau šios knygos“. Pranešime, kai tik kas nors įkels knygą iš jūsų sąrašo.'],
    ['bag', 'Prašykite knygų', 'Atidarykite knygą ir spustelėkite „Pridėti į prašymą“. To paties žmogaus knygos sujungiamos į vieną prašymą, tad galite pasiimti kelias iš karto.'],
    ['chat', 'Susitikite ir įvertinkite', 'Pokalbyje susitarkite dėl laiko ir viešos vietos, mokėkite tik susitikę. Po to spustelėkite „Pažymėti kaip perduota“ ir įvertinkite vienas kitą.']
  ],
  tourNext: 'Toliau', tourBack: 'Atgal', tourSkip: 'Praleisti', tourAddFirst: 'Pridėti pirmą knygą', tourLookAround: 'Pirma apsižvalgysiu',
  howItWorks: 'Kaip veikia seku seku', stepOf: '{n} iš {total}'
});
Object.assign(window.STRINGS.es, {
  introTitle: 'Pasa tus libros. Encuentra otros cerca.',
  introLead: 'seku seku pone en contacto a lectores que viven cerca. Intercambia, vende o regala los libros que ya has leído, en cualquier idioma.',
  freeChips: ['Totalmente gratis', 'Sin anuncios', 'Sin contraseñas'],
  introCta: 'Crear una cuenta gratis',
  howTitle: 'Cómo funciona',
  how: [
    ['barcode', 'Escanea el código de barras', 'Apunta la cámara al ISBN de la contraportada. El título, el autor y la descripción se rellenan solos.'],
    ['camera', 'Haz una foto', 'Una foto rápida de tu ejemplar para que se vea su estado. Listo en menos de un minuto.'],
    ['search', 'Encuentra libros cerca', 'Busca por idioma, tema y distancia. Pide un libro o varios a la misma persona a la vez.'],
    ['chat', 'Quedad e intercambiad', 'Acordad hora y un lugar público en el chat. Intercambia, vende o regala: tú decides.']
  ],
  faqTitle: 'Bueno saber',
  faq: [
    ['¿Cuesta algo?', 'No. Usar seku seku es gratis: sin comisiones, sin anuncios, sin suscripción. Si vendes un libro, te pagan directamente al quedar.'],
    ['¿Necesito contraseña?', 'No. Escribe tu correo y te enviamos un código de 6 cifras. La próxima vez entras con el mismo correo.'],
    ['¿Quién ve mis datos?', 'Solo los miembros registrados, y solo tu nombre, país y código postal; nunca tu dirección, correo ni teléfono. Tú decides dónde quedar.'],
    ['¿Qué libros puedo compartir?', 'Cualquier libro en papel que tengas, en cualquier idioma. No se permiten copias, escaneos ni archivos de libros electrónicos.'],
    ['¿Y si algo sale mal?', 'seku seku pone en contacto a personas; el intercambio es entre tú y la otra persona. Quedad en un lugar público, paga en la entrega y usa el botón de la bandera para denunciar algo raro: un administrador revisa cada denuncia.']
  ],
  signupTitle: 'Crea tu cuenta gratis',
  signupHint: '¿Ya tienes una? Escribe el mismo correo para entrar.',
  step1of2: 'Paso 1 de 2 · Tu correo',
  step2of2: 'Paso 2 de 2 · Tu perfil',
  tryDemo: '¿Solo mirando? Prueba la demo con libros de ejemplo',
  tourHello: '¡Hola, {name}!',
  tourIntro: 'Ya estás dentro. Así se empieza, en cuatro pasos rápidos.',
  tour: [
    ['plus', 'Añade tus libros', 'Toca + abajo, escanea el código de barras y haz una foto. Luego elige: intercambiar, vender o regalar.'],
    ['heart', 'Haz tu lista de deseos', 'En +, elige «Busco este libro». Te avisamos en cuanto alguien publique un libro de tu lista.'],
    ['bag', 'Pide libros', 'Abre un libro y toca «Añadir al pedido». Los libros de la misma persona van en un solo pedido, así recoges varios a la vez.'],
    ['chat', 'Quedad y valorad', 'Acordad hora y un lugar público en el chat, y paga solo al quedar. Después toca «Marcar como entregado» y valoraos.']
  ],
  tourNext: 'Siguiente', tourBack: 'Atrás', tourSkip: 'Saltar', tourAddFirst: 'Añadir mi primer libro', tourLookAround: 'Primero echo un vistazo',
  howItWorks: 'Cómo funciona seku seku', stepOf: '{n} de {total}'
});

// ---- intro, children's-books version (visual)
Object.assign(window.STRINGS.en, {
  introTitle: "Children's books, passed from family to family.",
  introLead: "The books your kids have outgrown are exactly what another family's kids are ready for. Swap, sell or give them away to families nearby – in your language.",
  flowTitle: 'Add a book in under a minute',
  flow: [['barcode', 'Scan', 'the ISBN on the back'], ['camera', 'Snap', 'a photo of your copy'], ['check', 'Done', 'details fill in by themselves']],
  howTitle: 'Then find your next favourites',
  how: [
    ['search', 'Find books nearby', 'Filter by language, age and topic – dinosaurs, fairies, bedtime and more.'],
    ['bag', 'Ask for a bundle', 'Pick several books from the same family and send one request.'],
    ['chat', 'Meet and swap', 'Agree on a time and place in the chat. Swap, sell or give away.']
  ],
  whyTitle: 'Why it matters',
  why: [
    ['heart', 'Every book is loved twice', 'Stories keep being read instead of gathering dust.'],
    ['books', 'Books in your own language', 'Hard-to-find Lithuanian, Spanish and other titles, right around the corner.'],
    ['swapArrows', 'Good for families and the planet', 'Save money and shelf space, and buy a little less new.']
  ]
});
Object.assign(window.STRINGS.lt, {
  introTitle: 'Vaikiškos knygos – iš šeimos į šeimą.',
  introLead: 'Knygos, iš kurių jūsų vaikai išaugo, kaip tik tinka kitos šeimos vaikams. Keiskitės, parduokite ar padovanokite jas šeimoms netoliese – savo kalba.',
  flowTitle: 'Knygą pridėsite per mažiau nei minutę',
  flow: [['barcode', 'Kodas', 'nuskenuokite ISBN ant nugarėlės'], ['camera', 'Nuotrauka', 'nufotografuokite savo knygą'], ['check', 'Paruošta', 'duomenys užsipildo patys']],
  howTitle: 'O tada raskite naujų mėgstamų',
  how: [
    ['search', 'Raskite knygų netoliese', 'Rinkitės pagal kalbą, amžių ir temą – dinozaurai, fėjos, pasakos prieš miegą ir kt.'],
    ['bag', 'Prašykite kelių iš karto', 'Išsirinkite kelias tos pačios šeimos knygas ir išsiųskite vieną prašymą.'],
    ['chat', 'Susitikite ir apsikeiskite', 'Pokalbyje susitarkite dėl laiko ir vietos. Keiskitės, parduokite ar padovanokite.']
  ],
  whyTitle: 'Kodėl tai svarbu',
  why: [
    ['heart', 'Kiekviena knyga mylima dukart', 'Istorijos skaitomos toliau, o ne dulka lentynoje.'],
    ['books', 'Knygos jūsų kalba', 'Sunkiai randamos lietuviškos, ispaniškos ir kitos knygos – visai šalia.'],
    ['swapArrows', 'Gera šeimai ir planetai', 'Sutaupote pinigų ir vietos lentynoje, o naujų perkate šiek tiek mažiau.']
  ]
});
Object.assign(window.STRINGS.es, {
  introTitle: 'Libros infantiles que pasan de familia en familia.',
  introLead: 'Los libros que tus hijos ya no leen son justo los que otros niños están listos para descubrir. Intercámbialos, véndelos o regálalos a familias cercanas, en tu idioma.',
  flowTitle: 'Añade un libro en menos de un minuto',
  flow: [['barcode', 'Escanea', 'el ISBN de la contraportada'], ['camera', 'Foto', 'de tu ejemplar'], ['check', 'Listo', 'los datos se rellenan solos']],
  howTitle: 'Y luego encuentra nuevos favoritos',
  how: [
    ['search', 'Busca libros cerca', 'Filtra por idioma, edad y tema: dinosaurios, hadas, cuentos para dormir y más.'],
    ['bag', 'Pide varios a la vez', 'Elige varios libros de la misma familia y envía una sola petición.'],
    ['chat', 'Quedad e intercambiad', 'Acordad hora y lugar en el chat. Intercambia, vende o regala.']
  ],
  whyTitle: 'Por qué importa',
  why: [
    ['heart', 'Cada libro se quiere dos veces', 'Las historias se siguen leyendo en vez de acumular polvo.'],
    ['books', 'Libros en tu idioma', 'Títulos en lituano, español y otros idiomas difíciles de encontrar, a la vuelta de la esquina.'],
    ['swapArrows', 'Bueno para tu familia y el planeta', 'Ahorras dinero y espacio, y compras un poco menos nuevo.']
  ]
});

// Lithuanian national library lookup (isbn-lookup Edge Function)
Object.assign(window.STRINGS.lt, {
  lnbName: 'Lietuvos nacionalinė biblioteka',
  lnbCredit: 'Duomenys: Lietuvos nacionalinė Martyno Mažvydo biblioteka, data.gov.lt.'
});
Object.assign(window.STRINGS.es, {
  lnbName: 'Biblioteca Nacional de Lituania',
  lnbCredit: 'Datos: Biblioteca Nacional Martynas Mažvydas de Lituania, data.gov.lt.'
});
Object.assign(window.STRINGS.en, {
  lnbName: 'National Library of Lithuania',
  lnbCredit: 'Data: Martynas Mažvydas National Library of Lithuania, data.gov.lt.'
});

// Privacy and safety: privacy notice, about page, report page, 18+, delete account, moderation notices, scam warnings
Object.assign(window.STRINGS.lt, {
  privacyLink: 'Privatumo pranešimas', aboutLink: 'Apie seku seku ir duomenų šaltinius', reportInfoLink: 'Pranešti apie neteisėtą turinį',
  updatedOn: 'Atnaujinta {date}', operatorUnnamed: 'savanoris, kuris prižiūri seku seku',
  confirmAdult: 'Man yra 18 metų ar daugiau', adultRequired: 'seku seku skirta tik suaugusiesiems (18+).',
  deleteAccount: 'Ištrinti mano paskyrą', confirmDeleteAccount: 'Tikrai ištrinti paskyrą? Jūsų profilis, knygos, nuotraukos, norai, pokalbiai ir įvertinimai bus ištrinti visam laikui.',
  accountDeleted: 'Paskyra ištrinta. Ačiū, kad buvote su mumis!',
  errNameNotAllowed: 'Toks vardas negalimas – jis gali atrodyti kaip administratoriaus. Pasirinkite kitą.',
  errTextNotAllowed: 'Tekste yra netinkamų žodžių. Pataisykite ir bandykite dar kartą.',
  errDailyLimit: 'Šiandien pasiekėte dienos limitą. Bandykite rytoj.',
  errLastAdminDelete: 'Prieš ištrindami paskutinę administratoriaus paskyrą, pridėkite kitą administratorių.',
  n_mod_hide_book: 'Jūsų skelbimą „{title}“ paslėpė administratorius.', n_mod_unhide_book: 'Jūsų skelbimas „{title}“ vėl matomas.',
  n_mod_auto_hide_book: 'Jūsų skelbimas „{title}“ automatiškai paslėptas, nes apie jį pranešė 3 nariai. Administratorius jį peržiūrės.',
  n_mod_remove: 'Administratorius pašalino jūsų profilį.', n_mod_remove_and_ban: 'Administratorius pašalino ir užblokavo jūsų paskyrą.',
  n_mod_reason: 'Priežastis: {reason}.', n_mod_auto: 'Tai padaryta automatiškai.',
  n_mod_appeal: 'Jei manote, kad tai klaida, parašykite mums (žr. sąlygų skyrių „Kontaktai“).',
  scamWarning: 'Būkite atsargūs: nemokėkite iš anksto, nesidalykite banko ar kortelės duomenimis ir susitikite viešoje vietoje.'
});
Object.assign(window.STRINGS.es, {
  privacyLink: 'Aviso de privacidad', aboutLink: 'Sobre seku seku y fuentes de datos', reportInfoLink: 'Denunciar contenido ilegal',
  updatedOn: 'Actualizado el {date}', operatorUnnamed: 'el voluntario que gestiona seku seku',
  confirmAdult: 'Tengo 18 años o más', adultRequired: 'seku seku es solo para adultos (18+).',
  deleteAccount: 'Borrar mi cuenta', confirmDeleteAccount: '¿Seguro que quieres borrar tu cuenta? Se borrarán para siempre tu perfil, libros, fotos, deseos, chats y valoraciones.',
  accountDeleted: 'Cuenta borrada. ¡Gracias por haber estado con nosotros!',
  errNameNotAllowed: 'Ese nombre no está permitido: podría parecer de un administrador. Elige otro.',
  errTextNotAllowed: 'El texto contiene palabras no permitidas. Corrígelo e inténtalo de nuevo.',
  errDailyLimit: 'Has llegado al límite de hoy. Inténtalo mañana.',
  errLastAdminDelete: 'Añade otro administrador antes de borrar la última cuenta de administrador.',
  n_mod_hide_book: 'Un administrador ha ocultado tu anuncio «{title}».', n_mod_unhide_book: 'Tu anuncio «{title}» vuelve a estar visible.',
  n_mod_auto_hide_book: 'Tu anuncio «{title}» se ha ocultado automáticamente porque 3 miembros lo han denunciado. Un administrador lo revisará.',
  n_mod_remove: 'Un administrador ha eliminado tu perfil.', n_mod_remove_and_ban: 'Un administrador ha eliminado y bloqueado tu cuenta.',
  n_mod_reason: 'Motivo: {reason}.', n_mod_auto: 'Se ha hecho automáticamente.',
  n_mod_appeal: 'Si crees que es un error, escríbenos (ver «Contacto» en las condiciones).',
  scamWarning: 'Cuidado: no pagues por adelantado, no compartas datos bancarios ni de tarjeta y quedad en un lugar público.'
});
Object.assign(window.STRINGS.en, {
  privacyLink: 'Privacy notice', aboutLink: 'About seku seku and data sources', reportInfoLink: 'Report illegal content',
  updatedOn: 'Updated {date}', operatorUnnamed: 'the volunteer who runs seku seku',
  confirmAdult: 'I am 18 or older', adultRequired: 'seku seku is for adults only (18+).',
  deleteAccount: 'Delete my account', confirmDeleteAccount: 'Really delete your account? Your profile, books, photos, wishes, chats and reviews will be deleted for good.',
  accountDeleted: 'Account deleted. Thank you for being part of seku seku!',
  errNameNotAllowed: 'That name isn\'t allowed – it could look like an admin. Please choose another.',
  errTextNotAllowed: 'The text contains words that aren\'t allowed. Please change it and try again.',
  errDailyLimit: 'You\'ve reached today\'s limit. Please try again tomorrow.',
  errLastAdminDelete: 'Add another admin before deleting the last admin account.',
  n_mod_hide_book: 'An admin hid your listing "{title}".', n_mod_unhide_book: 'Your listing "{title}" is visible again.',
  n_mod_auto_hide_book: 'Your listing "{title}" was hidden automatically because 3 members reported it. An admin will look at it.',
  n_mod_remove: 'An admin removed your profile.', n_mod_remove_and_ban: 'An admin removed and blocked your account.',
  n_mod_reason: 'Reason: {reason}.', n_mod_auto: 'This was done automatically.',
  n_mod_appeal: 'If you think this is a mistake, write to us (see "Contact" in the terms).',
  scamWarning: 'Be careful: don\'t pay in advance, never share bank or card details, and meet in a public place.'
});
