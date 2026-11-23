// seku seku – look and wording of every automatic email. THIS IS THE ONE PLACE TO CHANGE THEM.
//
// After editing, run:   node supabase/email-templates/build.mjs
// It rewrites the three Supabase sign-in templates (*.html next to this file), the email frame
// inside supabase/functions/send-notifications/index.ts, and the previews in preview/.
// Then paste the changed templates into Supabase and redeploy send-notifications (see README.md).
//
// Colours come from brand/tokens.css (palette "Summer meadow"). Emails cannot load CSS files,
// so the values are copied here as plain hex codes.

export const THEME = {
  // Where the logo and links point. Change both if the site moves to its own domain.
  siteUrl: 'https://domjau.github.io/book-swap/',
  logoUrl: 'https://domjau.github.io/book-swap/brand/email/seku-email-logo.png',
  logoWidth: 168,            // px on screen; the PNG is 360 × 71, so it stays sharp on phones
  logoHeight: 33,

  colors: {
    page: '#F7F3E8',         // cream background around the card
    card: '#FFFDF8',         // paper card
    line: '#E6DFCF',         // thin borders and dividers
    text: '#2E2E2A',         // ink
    muted: '#66625A',        // small print
    accent: '#5C7A61',       // sage: button, code border
    accentDeep: '#43604A',   // links, arrows
    accentTint: '#E4EBE2',   // code box background
    label: '#8E4A3D',        // LT / EN / ES / PT labels
    labelTint: '#F3E0DA',
    rowTint: '#F7F3E8',      // background of each notification line
    // the three-colour strip at the top of the card (sage, honey, rosehip)
    stripe: ['#5C7A61', '#E3C16F', '#C77B6A'],
  },

  font: "Outfit,'Segoe UI',Roboto,Helvetica,Arial,sans-serif",
  radius: 18,                // card corners (Outlook on Windows shows square corners, that's fine)
  codeSize: 40,              // px, the 6-digit sign-in code

  // Small line under the card, in every email.
  tagline: 'seku seku · vaikiškų knygų mainai · children’s book swap · intercambio de libros infantiles · troca de livros infantis',

  // Languages shown in the sign-in emails, in this order. Supabase sends one email to everyone,
  // so the sign-in emails carry every language. Notification emails use the member's own language.
  langs: ['lt', 'en', 'es', 'pt'],

  // Wording of the three Supabase sign-in emails.
  auth: {
    'magic-link': {
      supabase: 'Magic Link',
      subject: '{{ .Token }} · seku seku',
      title: { lt: 'Prisijungimo kodas', en: 'Sign-in code', es: 'Código para entrar', pt: 'Código de acesso' },
      body: {
        lt: 'Įveskite šį kodą seku seku programėlėje.',
        en: 'Type this code in the seku seku app.',
        es: 'Escribe este código en la app de seku seku.',
        pt: 'Escreve este código na aplicação seku seku.',
      },
      showCode: true,
      button: null,          // no link: the code works in the installed app too, a link may open the wrong browser
    },
    'confirm-signup': {
      supabase: 'Confirm signup',
      subject: '{{ .Token }} · seku seku',
      title: { lt: 'Sveiki!', en: 'Welcome!', es: '¡Bienvenido!', pt: 'Boas-vindas!' },
      body: {
        lt: 'Įveskite šį kodą, kad patvirtintumėte el. paštą ir pradėtumėte keistis knygomis.',
        en: 'Type this code to confirm your email and start swapping books.',
        es: 'Escribe este código para confirmar tu correo y empezar a intercambiar libros.',
        pt: 'Escreve este código para confirmar o teu email e começar a trocar livros.',
      },
      showCode: true,
      button: null,
    },
    'change-email': {
      supabase: 'Change Email Address',
      subject: 'seku seku: confirm your new email',
      title: { lt: 'Naujas el. paštas', en: 'New email', es: 'Nuevo correo', pt: 'Novo email' },
      body: {
        lt: 'Patvirtinkite, kad {{ .NewEmail }} yra jūsų naujas adresas.',
        en: 'Confirm that {{ .NewEmail }} is your new address.',
        es: 'Confirma que {{ .NewEmail }} es tu nueva dirección.',
        pt: 'Confirma que {{ .NewEmail }} é o teu novo endereço.',
      },
      showCode: false,       // the app has no screen to type this code, so this one uses the button
      button: { label: 'Patvirtinti · Confirm · Confirmar', url: '{{ .ConfirmationURL }}' },
    },
  },

  // Small print at the bottom of every sign-in email.
  ignore: {
    lt: 'Jei to neprašėte, šį laišką galite ignoruoti.',
    en: 'If you didn’t ask for this, you can ignore this email.',
    es: 'Si no lo has pedido, ignora este correo.',
    pt: 'Se não pediste isto, podes ignorar este email.',
  },
};
