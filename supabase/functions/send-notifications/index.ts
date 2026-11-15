// Supabase Edge Function: emails notifications to members, respecting their settings.
//   ?mode=instant  – run every 5 minutes: sends notifications that are at least 2 minutes old and still unread
//   ?mode=daily    – run once a day: one summary email for people who chose "once a day"
// Secrets (Edge Functions → Secrets): SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM, APP_URL, CRON_SECRET
// SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are provided automatically by Supabase.
// Turn OFF "Verify JWT" for this function – it checks CRON_SECRET instead.
import { createClient } from 'npm:@supabase/supabase-js@2';
import nodemailer from 'npm:nodemailer@6';

const ALL_TYPES = ['request_new', 'message', 'request_answered', 'handover_set', 'handover_reminder', 'exchange_done',
  'wish_match', 'wanted', 'review', 'announcement', 'report_new', 'member_joined'];
const DEFAULT_PREFS = { email_types: ['request_new', 'message', 'request_answered', 'handover_reminder', 'wish_match', 'announcement', 'report_new'], email_mode: 'instant', lang: 'en' };

export const TEXT = {
  en: {
    subjectOne: 'Book Swap: {text}', subjectMany: 'Book Swap: {n} new notifications', hello: 'Hi {name},', open: 'Open Book Swap',
    footer: 'You get these emails because of your notification settings. Change them in Book Swap → Profile → Notifications.',
    request_new: '{name} asks for your book(s)', message: 'New message from {name}', message_many: '{n} new messages from {name}',
    request_accepted: '{name} accepted your request', request_declined: '{name} declined your request',
    handover_set: 'Handover with {name}: {when}, {where}', handover_reminder: 'Reminder: handover with {name} tomorrow – {where}',
    exchange_done: 'Exchange with {name} is done – leave a review', wish_match: '"{title}" from your wish list was listed by {name}',
    wanted: '{name} is looking for "{title}" – you have it', review: '{name} gave you {n} of 5 books', announcement: 'From your organiser: {text}',
    report_new: 'New report in your group', member_joined: '{name} joined the group'
  },
  lt: {
    subjectOne: 'Knygų keitykla: {text}', subjectMany: 'Knygų keitykla: {n} nauji pranešimai', hello: 'Labas, {name},', open: 'Atidaryti Knygų keityklą',
    footer: 'Šiuos laiškus gaunate pagal savo pranešimų nustatymus. Juos galite pakeisti: Knygų keitykla → Profilis → Pranešimai.',
    request_new: '{name} prašo jūsų knygos(-ų)', message: 'Nauja žinutė nuo {name}', message_many: '{n} naujos žinutės nuo {name}',
    request_accepted: '{name} priėmė jūsų prašymą', request_declined: '{name} atmetė jūsų prašymą',
    handover_set: 'Perdavimas su {name}: {when}, {where}', handover_reminder: 'Priminimas: rytoj perdavimas su {name} – {where}',
    exchange_done: 'Mainai su {name} baigti – įvertinkite', wish_match: '„{title}“ iš jūsų norų sąrašo pasiūlė {name}',
    wanted: '{name} ieško „{title}“ – jūs ją turite', review: '{name} jus įvertino {n} iš 5 knygelių', announcement: 'Organizatorius praneša: {text}',
    report_new: 'Naujas pranešimas apie problemą jūsų grupėje', member_joined: '{name} prisijungė prie grupės'
  },
  es: {
    subjectOne: 'Intercambio de libros: {text}', subjectMany: 'Intercambio de libros: {n} notificaciones nuevas', hello: 'Hola, {name}:', open: 'Abrir Intercambio de libros',
    footer: 'Recibes estos correos por tus ajustes de notificaciones. Cámbialos en Intercambio de libros → Perfil → Notificaciones.',
    request_new: '{name} te pide libro(s)', message: 'Nuevo mensaje de {name}', message_many: '{n} mensajes nuevos de {name}',
    request_accepted: '{name} ha aceptado tu pedido', request_declined: '{name} ha rechazado tu pedido',
    handover_set: 'Entrega con {name}: {when}, {where}', handover_reminder: 'Recordatorio: mañana entrega con {name} – {where}',
    exchange_done: 'Intercambio con {name} completado: deja tu valoración', wish_match: '{name} ha anunciado «{title}», de tu lista de deseos',
    wanted: '{name} busca «{title}» y tú lo tienes', review: '{name} te ha dado {n} de 5 libritos', announcement: 'Del organizador: {text}',
    report_new: 'Nueva denuncia en tu grupo', member_joined: '{name} se ha unido al grupo'
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

// Build one email for one person from their pending notifications.
export function buildEmail(items, lang, recipientName, names, appUrl) {
  const T = TEXT[lang] || TEXT.en;
  const lines = items.map((n) => ({ text: lineFor(n, lang, names), link: linkFor(n, appUrl) }));
  const subject = lines.length === 1 ? fill(T.subjectOne, { text: lines[0].text }).slice(0, 140) : fill(T.subjectMany, { n: lines.length });
  const text = [fill(T.hello, { name: recipientName }), '', ...lines.map((l) => '• ' + l.text + '\n  ' + l.link), '', T.open + ': ' + appUrl, '', T.footer].join('\n');
  const html = `<div style="font-family:Arial,sans-serif;font-size:15px;color:#1F2A44;max-width:520px">
    <p>${escHtml(fill(T.hello, { name: recipientName }))}</p>
    <ul style="padding-left:18px">${lines.map((l) => `<li style="margin:8px 0"><a href="${escHtml(l.link)}" style="color:#1D4E89">${escHtml(l.text)}</a></li>`).join('')}</ul>
    <p><a href="${escHtml(appUrl)}" style="display:inline-block;background:#FF8A3D;color:#1F2A44;padding:10px 16px;border-radius:10px;text-decoration:none;font-weight:bold">${escHtml(T.open)}</a></p>
    <p style="color:#5B5446;font-size:12px">${escHtml(T.footer)}</p></div>`;
  return { subject, text, html };
}

// Decide which pending notifications go out in this run, grouped by person.
export function pick(pending, prefsByUser, mode, nowMs) {
  const send = new Map(); const skip = [];
  for (const n of pending) {
    const p = prefsByUser.get(n.user_id) || DEFAULT_PREFS;
    const wants = p.email_mode !== 'off' && (p.email_types || []).includes(n.type) && ALL_TYPES.includes(n.type);
    if (!wants || n.read_at) { skip.push(n.id); continue; }             // not wanted, or already seen in the app
    if (p.email_mode !== mode) continue;                                   // handled by the other run
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
