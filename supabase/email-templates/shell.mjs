// seku seku – the email frame shared by the sign-in emails and the notification emails.
// Tables + inline styles only, so Gmail, Outlook, Apple Mail and phone apps show the same thing.
// build.mjs copies this file (and THEME) into supabase/functions/send-notifications/index.ts.
// Edit look and wording in theme.mjs; edit layout here; then run build.mjs.

export const emailEsc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Whole email: hidden preview line, logo, card with the colour strip, small print below.
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

// Big rounded button (bulletproof: the whole cell is the link colour, so Outlook shows it too).
export function emailButton(T, label, url) {
  const c = T.colors;
  return `
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:26px auto 2px"><tr>
          <td align="center" style="border-radius:12px;background:${c.accent}"><a href="${url}" style="display:inline-block;padding:14px 26px;font-family:${T.font};font-size:16px;font-weight:600;line-height:1.2;color:#FFFFFF;text-decoration:none;border-radius:12px">${label}</a></td>
        </tr></table>`;
}

// The sign-in code, large and easy to read and copy on a phone.
export function emailCode(T, code) {
  const c = T.colors;
  return `
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 22px"><tr>
          <td align="center" class="seku-code" style="background:${c.accentTint};border:2px dashed ${c.accent};border-radius:16px;padding:20px 8px 20px 18px;font-family:${T.font};font-size:${T.codeSize}px;font-weight:600;line-height:1.1;letter-spacing:10px;color:${c.text};font-variant-numeric:tabular-nums">${code}</td>
        </tr></table>`;
}

// One line per language: small coloured label, then the sentence.
export function emailLangRows(T, texts, size) {
  const c = T.colors;
  return `
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${T.langs.map((l) => `
          <tr><td width="40" valign="top" style="width:40px;padding:3px 0 9px"><span style="display:inline-block;padding:2px 7px;border-radius:999px;background:${c.labelTint};font-family:${T.font};font-size:10px;font-weight:600;letter-spacing:1px;color:${c.label}">${l.toUpperCase()}</span></td>
          <td valign="top" lang="${l}" style="padding:0 0 9px;font-family:${T.font};font-size:${size}px;line-height:1.5;color:${c.text}">${texts[l]}</td></tr>`).join('')}
        </table>`;
}
