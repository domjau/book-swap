// Supabase Edge Function: emails notifications to members, respecting their settings.
//   ?mode=instant  – run every 5 minutes: sends notifications that are at least 2 minutes old and still unread
//   ?mode=daily    – run once a day: one summary email for people who chose "once a day"
// Secrets (Edge Functions → Secrets): SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM, APP_URL, CRON_SECRET
// SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are provided automatically by Supabase.
// Turn OFF "Verify JWT" for this function – it checks CRON_SECRET instead.
import { createClient } from 'npm:@supabase/supabase-js@2';
import nodemailer from 'npm:nodemailer@6';

const ALL_TYPES = ['request_new', 'message', 'request_answered', 'handover_set', 'handover_reminder', 'exchange_done',
  'wish_match', 'wanted', 'review', 'announcement', 'report_new', 'member_joined', 'moderation'];
// Moderation notices (statement of reasons) always go out right away, whatever the person's settings.
const ALWAYS = ['moderation'];
const DEFAULT_PREFS = { email_types: ['request_new', 'message', 'request_answered', 'handover_reminder', 'wish_match', 'announcement', 'report_new'], email_mode: 'instant', lang: 'en' };

export const TEXT = {
  en: {
    subjectOne: 'seku seku: {text}', subjectMany: 'seku seku: {n} new notifications', hello: 'Hi {name},', open: 'Open seku seku',
    footer: 'You get these emails because of your notification settings. Change them in seku seku → Profile → Notifications.',
    request_new: '{name} asks for your book(s)', message: 'New message from {name}', message_many: '{n} new messages from {name}',
    request_accepted: '{name} accepted your request', request_declined: '{name} declined your request',
    handover_set: 'Handover with {name}: {when}, {where}', handover_reminder: 'Reminder: handover with {name} tomorrow – {where}',
    exchange_done: 'Exchange with {name} is done – leave a review', wish_match: '"{title}" from your wish list was listed by {name}',
    wanted: '{name} is looking for "{title}" – you have it', review: '{name} gave you {n} of 5 books', announcement: 'From seku seku: {text}',
    report_new: 'New report on seku seku', member_joined: '{name} joined the group',
    mod_hide_book: 'An admin hid your listing "{title}"', mod_unhide_book: 'Your listing "{title}" is visible again',
    mod_auto_hide_book: 'Your listing "{title}" was hidden automatically after 3 reports; an admin will look at it',
    mod_remove: 'An admin removed your seku seku profile', mod_remove_and_ban: 'An admin removed and blocked your seku seku account',
    mod_reason: 'Reason: {reason}.', mod_appeal: 'If you think this is a mistake, reply to this email or write to us.'
  },
  lt: {
    subjectOne: 'seku seku: {text}', subjectMany: 'seku seku: {n} nauji pranešimai', hello: 'Labas, {name},', open: 'Atidaryti seku seku',
    footer: 'Šiuos laiškus gaunate pagal savo pranešimų nustatymus. Juos galite pakeisti: seku seku → Profilis → Pranešimai.',
    request_new: '{name} prašo jūsų knygos(-ų)', message: 'Nauja žinutė nuo {name}', message_many: '{n} naujos žinutės nuo {name}',
    request_accepted: '{name} priėmė jūsų prašymą', request_declined: '{name} atmetė jūsų prašymą',
    handover_set: 'Perdavimas su {name}: {when}, {where}', handover_reminder: 'Priminimas: rytoj perdavimas su {name} – {where}',
    exchange_done: 'Mainai su {name} baigti – įvertinkite', wish_match: '„{title}“ iš jūsų norų sąrašo pasiūlė {name}',
    wanted: '{name} ieško „{title}“ – jūs ją turite', review: '{name} jus įvertino {n} iš 5 knygelių', announcement: 'seku seku praneša: {text}',
    report_new: 'Naujas pranešimas apie problemą seku seku platformoje', member_joined: '{name} prisijungė prie grupės',
    mod_hide_book: 'Administratorius paslėpė jūsų skelbimą „{title}“', mod_unhide_book: 'Jūsų skelbimas „{title}“ vėl matomas',
    mod_auto_hide_book: 'Jūsų skelbimas „{title}“ automatiškai paslėptas po 3 pranešimų; administratorius jį peržiūrės',
    mod_remove: 'Administratorius pašalino jūsų seku seku profilį', mod_remove_and_ban: 'Administratorius pašalino ir užblokavo jūsų seku seku paskyrą',
    mod_reason: 'Priežastis: {reason}.', mod_appeal: 'Jei manote, kad tai klaida, atsakykite į šį laišką arba parašykite mums.'
  },
  es: {
    subjectOne: 'seku seku: {text}', subjectMany: 'seku seku: {n} notificaciones nuevas', hello: 'Hola, {name}:', open: 'Abrir seku seku',
    footer: 'Recibes estos correos por tus ajustes de notificaciones. Cámbialos en seku seku → Perfil → Notificaciones.',
    request_new: '{name} te pide libro(s)', message: 'Nuevo mensaje de {name}', message_many: '{n} mensajes nuevos de {name}',
    request_accepted: '{name} ha aceptado tu pedido', request_declined: '{name} ha rechazado tu pedido',
    handover_set: 'Entrega con {name}: {when}, {where}', handover_reminder: 'Recordatorio: mañana entrega con {name} – {where}',
    exchange_done: 'Intercambio con {name} completado: deja tu valoración', wish_match: '{name} ha anunciado «{title}», de tu lista de deseos',
    wanted: '{name} busca «{title}» y tú lo tienes', review: '{name} te ha dado {n} de 5 libritos', announcement: 'De seku seku: {text}',
    report_new: 'Nueva denuncia en seku seku', member_joined: '{name} se ha unido al grupo',
    mod_hide_book: 'Un administrador ha ocultado tu anuncio «{title}»', mod_unhide_book: 'Tu anuncio «{title}» vuelve a estar visible',
    mod_auto_hide_book: 'Tu anuncio «{title}» se ha ocultado automáticamente tras 3 denuncias; un administrador lo revisará',
    mod_remove: 'Un administrador ha eliminado tu perfil de seku seku', mod_remove_and_ban: 'Un administrador ha eliminado y bloqueado tu cuenta de seku seku',
    mod_reason: 'Motivo: {reason}.', mod_appeal: 'Si crees que es un error, responde a este correo o escríbenos.'
  },
  pt: {
    subjectOne: 'seku seku: {text}', subjectMany: 'seku seku: {n} notificações novas', hello: 'Olá, {name},', open: 'Abrir o seku seku',
    footer: 'Recebes estes emails por causa das tuas definições de notificações. Podes alterá-las em seku seku → Perfil → Notificações.',
    request_new: '{name} pede-te livro(s)', message: 'Nova mensagem de {name}', message_many: '{n} mensagens novas de {name}',
    request_accepted: '{name} aceitou o teu pedido', request_declined: '{name} recusou o teu pedido',
    handover_set: 'Entrega com {name}: {when}, {where}', handover_reminder: 'Lembrete: amanhã há entrega com {name} – {where}',
    exchange_done: 'Troca com {name} concluída: deixa a tua avaliação', wish_match: '{name} publicou «{title}», da tua lista de desejos',
    wanted: '{name} procura «{title}» e tu tens esse livro', review: '{name} deu-te {n} de 5 livrinhos', announcement: 'Do seku seku: {text}',
    report_new: 'Nova denúncia no seku seku', member_joined: '{name} juntou-se ao grupo',
    mod_hide_book: 'Um administrador ocultou o teu anúncio «{title}»', mod_unhide_book: 'O teu anúncio «{title}» voltou a estar visível',
    mod_auto_hide_book: 'O teu anúncio «{title}» foi ocultado automaticamente após 3 denúncias; um administrador vai analisá-lo',
    mod_remove: 'Um administrador removeu o teu perfil do seku seku', mod_remove_and_ban: 'Um administrador removeu e bloqueou a tua conta do seku seku',
    mod_reason: 'Motivo: {reason}.', mod_appeal: 'Se achas que é um erro, responde a este email ou escreve-nos.'
  }
};

const fill = (s, v) => Object.keys(v).reduce((acc, k) => acc.split('{' + k + '}').join(String(v[k] ?? '')), s);
const escHtml = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// One line of text for a notification, in the person's language.
export function lineFor(n, lang, names) {
  const T = TEXT[lang] || TEXT.en; const d = n.data || {};
  const name = (d.actor && names[d.actor]) || d.name || '';
  const when = d.when ? new Date(String(d.when).slice(0, 10) + 'T10:00:00Z').toLocaleDateString(lang, { weekday: 'short', day: 'numeric', month: 'short' }) : '';
  if (n.type === 'message') return fill(d.count > 1 ? T.message_many : T.message, { name, n: d.count }) + (d.snippet ? ': "' + d.snippet + '"' : '');
  if (n.type === 'request_answered') return fill(d.status === 'declined' ? T.request_declined : T.request_accepted, { name });
  if (n.type === 'moderation') return fill(T['mod_' + d.action] || T.mod_hide_book, { title: d.title || '' }) + '. '
    + (d.reason ? fill(T.mod_reason, { reason: d.reason }) + ' ' : '') + T.mod_appeal;
  return fill(T[n.type] || n.type, { name, title: d.title || '', n: d.rating || '', text: d.text || '', when, where: d.where || '' });
}

export function linkFor(n, appUrl) {
  const d = n.data || {};
  if (n.type === 'report_new') return appUrl + '#/admin/reports';
  if (n.type === 'review') return appUrl + '#/profile';
  if (d.request_id) return appUrl + '#/chat/' + d.request_id;
  if (d.book_id) return appUrl + '#/book/' + d.book_id;
  return appUrl + '#/notifications';
}

// Look and wording of the frame: supabase/email-templates/theme.mjs (one place for every email).
// >>> generated by supabase/email-templates/build.mjs from theme.mjs + shell.mjs. Do not edit between these lines.
export const EMAIL_THEME = {
  "siteUrl": "https://domjau.github.io/book-swap/",
  "logoUrl": "https://domjau.github.io/book-swap/brand/email/seku-email-logo.png",
  "logoWidth": 168,
  "logoHeight": 33,
  "colors": {
    "page": "#F7F3E8",
    "card": "#FFFDF8",
    "line": "#E6DFCF",
    "text": "#2E2E2A",
    "muted": "#66625A",
    "accent": "#5C7A61",
    "accentDeep": "#43604A",
    "accentTint": "#E4EBE2",
    "label": "#8E4A3D",
    "labelTint": "#F3E0DA",
    "rowTint": "#F7F3E8",
    "stripe": [
      "#5C7A61",
      "#E3C16F",
      "#C77B6A"
    ]
  },
  "font": "Outfit,'Segoe UI',Roboto,Helvetica,Arial,sans-serif",
  "radius": 18,
  "codeSize": 40,
  "tagline": "seku seku · vaikiškų knygų mainai · children’s book swap · intercambio de libros infantiles · troca de livros infantis",
  "langs": [
    "lt",
    "en",
    "es",
    "pt"
  ]
};
export const emailEsc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function emailFrame(T, { lang, title, preheader, inner, footer }) {
  const c = T.colors;
  const r = Math.max(0, T.radius - 1), last = c.stripe.length - 1;
  const strip = c.stripe.map((col, i) => `<td height="6" style="height:6px;line-height:6px;font-size:0;background:${col};border-radius:${i === 0 ? r : 0}px ${i === last ? r : 0}px 0 0">&nbsp;</td>`).join('');
  return `<!doctype html>
<html lang="${emailEsc(lang)}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="x-apple-disable-message-reformatting"><meta name="format-detection" content="telephone=no,date=no,address=no,email=no">
<meta name="color-scheme" content="light"><meta name="supported-color-schemes" content="light">
<title>${emailEsc(title)}</title>
<style>
  @media (max-width:480px) { .seku-pad { padding:24px 18px !important; } .seku-outer { padding:16px 8px !important; } .seku-code { font-size:${Math.round(T.codeSize * 0.85)}px !important; letter-spacing:6px !important; } }
  a[x-apple-data-detectors] { color:inherit !important; text-decoration:none !important; }
</style></head>
<body style="margin:0;padding:0;background:${c.page};-webkit-text-size-adjust:100%">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:${c.page};font-size:1px;line-height:1px">${preheader}${'&#847;&zwnj;&nbsp;'.repeat(40)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${c.page}"><tr><td align="center" class="seku-outer" style="padding:28px 12px">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:520px;font-family:${T.font};color:${c.text}">
    <tr><td align="center" style="padding:0 0 20px"><a href="${emailEsc(T.siteUrl)}" style="text-decoration:none"><img src="${emailEsc(T.logoUrl)}" width="${T.logoWidth}" height="${T.logoHeight}" alt="seku seku" style="display:block;border:0;outline:none;width:${T.logoWidth}px;height:auto;color:${c.accent};font-size:22px;font-weight:600"></a></td></tr>
    <tr><td style="background:${c.card};border:1px solid ${c.line};border-radius:${T.radius}px;overflow:hidden">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>${strip}</tr></table>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td class="seku-pad" style="padding:30px 28px 28px">${inner}
      </td></tr></table>
    </td></tr>
    <tr><td align="center" style="padding:20px 12px 0;font-family:${T.font};font-size:12px;line-height:1.55;color:${c.muted}">${footer}</td></tr>
    <tr><td align="center" style="padding:12px 12px 0;font-family:${T.font};font-size:11px;line-height:1.5;color:${c.muted}"><a href="${emailEsc(T.siteUrl)}" style="color:${c.muted};text-decoration:none">${emailEsc(T.tagline)}</a></td></tr>
  </table>
</td></tr></table>
</body></html>
`;
}

export function emailButton(T, label, url) {
  const c = T.colors;
  return `
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:26px auto 2px"><tr>
          <td align="center" style="border-radius:12px;background:${c.accent}"><a href="${url}" style="display:inline-block;padding:14px 26px;font-family:${T.font};font-size:16px;font-weight:600;line-height:1.2;color:#FFFFFF;text-decoration:none;border-radius:12px">${label}</a></td>
        </tr></table>`;
}

export function emailCode(T, code) {
  const c = T.colors;
  return `
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 22px"><tr>
          <td align="center" class="seku-code" style="background:${c.accentTint};border:2px dashed ${c.accent};border-radius:16px;padding:20px 8px 20px 18px;font-family:${T.font};font-size:${T.codeSize}px;font-weight:600;line-height:1.1;letter-spacing:10px;color:${c.text};font-variant-numeric:tabular-nums">${code}</td>
        </tr></table>`;
}

export function emailLangRows(T, texts, size) {
  const c = T.colors;
  return `
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${T.langs.map((l) => `
          <tr><td width="40" valign="top" style="width:40px;padding:3px 0 9px"><span style="display:inline-block;padding:2px 7px;border-radius:999px;background:${c.labelTint};font-family:${T.font};font-size:10px;font-weight:600;letter-spacing:1px;color:${c.label}">${l.toUpperCase()}</span></td>
          <td valign="top" lang="${l}" style="padding:0 0 9px;font-family:${T.font};font-size:${size}px;line-height:1.5;color:${c.text}">${texts[l]}</td></tr>`).join('')}
        </table>`;
}
// <<< end of generated email frame

// Branded frame shared by every notification email.
export function emailShell(lang, appUrl, inner, footer, preheader = '') {
  const T = { ...EMAIL_THEME, siteUrl: appUrl || EMAIL_THEME.siteUrl };
  return emailFrame(T, { lang, title: 'seku seku', preheader: escHtml(preheader), inner, footer: escHtml(footer) });
}

// Build one email for one person from their pending notifications.
export function buildEmail(items, lang, recipientName, names, appUrl) {
  const T = TEXT[lang] || TEXT.en; const C = EMAIL_THEME.colors, F = EMAIL_THEME.font;
  const lines = items.map((n) => ({ text: lineFor(n, lang, names), link: linkFor(n, appUrl) }));
  const subject = lines.length === 1 ? fill(T.subjectOne, { text: lines[0].text }).slice(0, 140) : fill(T.subjectMany, { n: lines.length });
  const text = [fill(T.hello, { name: recipientName }), '', ...lines.map((l) => '• ' + l.text + '\n  ' + l.link), '', T.open + ': ' + appUrl, '', T.footer].join('\n');
  const html = emailShell(lang, appUrl, `
        <p style="margin:0 0 18px;font-family:${F};font-size:20px;font-weight:600;line-height:1.3;color:${C.text}">${escHtml(fill(T.hello, { name: recipientName }))}</p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${lines.map((l) => `
          <tr><td style="padding:0 0 8px"><a href="${escHtml(l.link)}" style="display:block;text-decoration:none;color:${C.text}">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
              <td style="background:${C.rowTint};border-radius:12px 0 0 12px;padding:13px 4px 13px 14px;font-family:${F};font-size:15px;line-height:1.45;color:${C.text}">${escHtml(l.text)}</td>
              <td width="34" align="center" style="width:34px;background:${C.rowTint};border-radius:0 12px 12px 0;font-family:${F};font-size:18px;font-weight:600;color:${C.accentDeep}">&rsaquo;</td>
            </tr></table></a></td></tr>`).join('')}
        </table>${emailButton(EMAIL_THEME, escHtml(T.open), escHtml(appUrl))}`, T.footer, lines.map((l) => l.text).join(' · ').slice(0, 140));
  return { subject, text, html };
}

// Decide which pending notifications go out in this run, grouped by person.
export function pick(pending, prefsByUser, mode, nowMs) {
  const send = new Map(); const skip = [];
  for (const n of pending) {
    const p = prefsByUser.get(n.user_id) || DEFAULT_PREFS;
    const always = ALWAYS.includes(n.type);
    const wants = always || (p.email_mode !== 'off' && (p.email_types || []).includes(n.type) && ALL_TYPES.includes(n.type));
    if (!wants || (n.read_at && !always)) { skip.push(n.id); continue; } // not wanted, or already seen in the app
    if ((always ? 'instant' : p.email_mode) !== mode) continue;          // handled by the other run
    if (mode === 'instant' && nowMs - Date.parse(n.created_at) < 2 * 60 * 1000) continue; // give the app 2 minutes first
    if (!send.has(n.user_id)) send.set(n.user_id, []);
    send.get(n.user_id).push(n);
  }
  return { send, skip };
}

if (typeof Deno !== 'undefined') Deno.serve(async (req) => {
  const env = (k) => Deno.env.get(k) || '';
  if (req.headers.get('authorization') !== 'Bearer ' + env('CRON_SECRET') || !env('CRON_SECRET')) return new Response('forbidden', { status: 403 });
  const mode = new URL(req.url).searchParams.get('mode') === 'daily' ? 'daily' : 'instant';
  const appUrl = env('APP_URL') || 'https://domjau.github.io/book-swap/';
  const db = createClient(env('SUPABASE_URL'), env('SUPABASE_SERVICE_ROLE_KEY'), { auth: { persistSession: false } });

  const since = new Date(Date.now() - 2 * 864e5).toISOString();
  const { data: pending, error } = await db.from('notifications').select('*').is('emailed_at', null).gte('created_at', since).order('created_at').limit(1000);
  if (error) return new Response(error.message, { status: 500 });
  if (!pending.length) return Response.json({ sent: 0 });

  const userIds = [...new Set(pending.map((n) => n.user_id))];
  const { data: prefs } = await db.from('notification_prefs').select('*').in('user_id', userIds);
  const prefsByUser = new Map((prefs || []).map((p) => [p.user_id, p]));
  const { send, skip } = pick(pending, prefsByUser, mode, Date.now());
  if (skip.length) await db.from('notifications').update({ emailed_at: new Date().toISOString() }).in('id', skip); // never email these

  const actorIds = [...new Set(pending.map((n) => n.data && n.data.actor).filter(Boolean)).values()].concat(userIds);
  const { data: members } = await db.from('members').select('user_id, display_name').in('user_id', actorIds);
  const names = {}; (members || []).forEach((m) => { names[m.user_id] = String(m.display_name).split(' (')[0]; });

  const mailer = nodemailer.createTransport({ host: env('SMTP_HOST'), port: Number(env('SMTP_PORT') || 465), secure: Number(env('SMTP_PORT') || 465) === 465,
    auth: { user: env('SMTP_USER'), pass: env('SMTP_PASS') } });
  let sent = 0;
  for (const [userId, items] of send) {
    const { data: u } = await db.auth.admin.getUserById(userId);
    const email = u && u.user && u.user.email;
    if (!email) continue;
    const p = prefsByUser.get(userId) || DEFAULT_PREFS;
    const mail = buildEmail(items, p.lang || 'en', names[userId] || '', names, appUrl);
    try {
      await mailer.sendMail({ from: env('SMTP_FROM') || env('SMTP_USER'), to: email, subject: mail.subject, text: mail.text, html: mail.html });
      await db.from('notifications').update({ emailed_at: new Date().toISOString() }).in('id', items.map((n) => n.id));
      sent++;
    } catch (e) { console.error('send failed', userId, String(e)); }
  }
  return Response.json({ mode, sent, skipped: skip.length });
});
