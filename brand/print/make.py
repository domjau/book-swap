"""Builds the printable and social materials in the seku seku brand style.

    python3 brand/print/make.py            # writes the HTML files
    node brand/print/render.mjs            # renders them to PDF / PNG (needs Playwright)

Outputs: brand/print/poster-a4-{lt,en,pt}.(html|pdf|png), brand/print/friend-guide-{lt,en,pt}.(html|pdf),
brand/social/instagram/*.(html|png). The QR code points to APP_URL; keep that address forever.
"""
import pathlib, re
import qrcode  # pip install qrcode

ROOT = pathlib.Path(__file__).resolve().parents[2]
APP_URL = 'https://domjau.github.io/book-swap/'
APP_LABEL = 'domjau.github.io/book-swap'
PRINT = ROOT / 'brand' / 'print'
SOCIAL = ROOT / 'brand' / 'social' / 'instagram'

def qr_svg(url, color='#2E2E2A'):
    q = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_M, border=0)
    q.add_data(url); q.make(fit=True)
    m = q.get_matrix(); n = len(m)
    d = ''.join(f'M{x},{y}h1v1h-1z' for y, row in enumerate(m) for x, v in enumerate(row) if v)
    return f'<svg class="qr" viewBox="-2 -2 {n+4} {n+4}" shape-rendering="crispEdges" role="img" aria-label="QR code: {url}"><rect x="-2" y="-2" width="{n+4}" height="{n+4}" fill="#FFFFFF"/><path d="{d}" fill="{color}"/></svg>'

MARK = '<svg viewBox="14 52 172 114" aria-hidden="true"><path d="M18 162 L58 162 L58 62 Q58 56 64 56 L84 56 Q90 56 90 62 L90 162 L104 162 L124 74 Q125.5 68 131.5 69.5 L150 74 Q156 75.5 154.5 81.5 L135 162 L182 162" fill="none" stroke="#FFFFFF" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/></svg>'
app_js = (ROOT / 'app.js').read_text()
HERO = re.search(r'const HERO_SVG = `(<svg.*?</svg>)`', app_js, re.S).group(1).replace('class="hero-art"', 'class="hero"')
ICON = {
    'barcode': 'M4 6v12M7 6v12M10 6v12M14 6v12M17 6v12M20 6v12',
    'camera': 'M4 8h3l2-3h6l2 3h3v11H4zM12 16.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z',
    'swap': 'M7 7h12l-3-3M17 17H5l3 3',
    'check': 'M5 12.5l4.5 4.5L19 7.5',
    'heart': 'M12 20.5S3.5 15.5 3.5 9.5A4.5 4.5 0 0 1 12 7a4.5 4.5 0 0 1 8.5 2.5c0 6-8.5 11-8.5 11z',
    'shield': 'M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6z',
    'chat': 'M4 5h16v11H9l-5 4z', 'pin': 'M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21zM12 12a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z',
    'flag': 'M5 21V4h11l-1.5 4L16 12H5', 'books': 'M4 4h5v16H4zM10 4h5v16h-5zM16 5l3.5-.8 2 15.5-3.5.8z',
}
def icon(name, size=28, color='currentColor'):
    return f'<svg width="{size}" height="{size}" viewBox="0 0 24 24" fill="none" stroke="{color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="{ICON[name]}"/></svg>'

BASE_CSS = """
@import url('../../vendor/fonts/outfit.css');
:root{--ground:#F7F3E8;--card:#FFFDF8;--ink:#2E2E2A;--muted:#66625A;--line:#E6DFCF;--sage:#5C7A61;--sage-deep:#43604A;--sage-tint:#E4EBE2;
--honey:#E3C16F;--honey-tint:#F6EBCB;--honey-deep:#7A5B14;--rose:#C77B6A;--rose-tint:#F3E0DA;--rose-deep:#8E4A3D}
*{box-sizing:border-box}html,body{margin:0;background:var(--ground);color:var(--ink);font-family:Outfit,system-ui,sans-serif;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.mark{background:var(--sage);display:flex;align-items:center;justify-content:center}
.mark svg{width:62%}
.word{font-weight:600;letter-spacing:-.01em}
"""

# ------------------------------------------------------------------ poster
POSTER = {
    'lt': dict(lang='lt', h1='Vaikiškos knygos – iš šeimos į šeimą.', lead='Išaugtos knygos – kitiems vaikams.',
               steps=[('barcode', 'Nuskenuokite', 'knygos brūkšninį kodą'), ('camera', 'Nufotografuokite', 'savo knygą'), ('swap', 'Pasidalinkite', 'susikeiskite, parduokite ar padovanokite')],
               chips=['Nemokamai', 'Lietuvių ir kitomis kalbomis', 'Netoliese'], cta='Nuskenuokite QR kodą ir prisijunkite',
               small='Be slaptažodžių ir reklamų. Knygas perduokite šeštadienį mokykloje.'),
    'en': dict(lang='en', h1="Children's books, passed from family to family.", lead='Outgrown books, loved again.',
               steps=[('barcode', 'Scan', 'the barcode'), ('camera', 'Snap', 'a photo of your book'), ('swap', 'Share', 'swap, sell or give away')],
               chips=['Free', 'In your language', 'Nearby'], cta='Scan the QR code to join',
               small='No passwords, no ads. Hand books over at school on Saturday.'),
    'pt': dict(lang='pt', h1='Livros infantis, de família para família.', lead='Livros que já não servem, amados outra vez.',
               steps=[('barcode', 'Lê', 'o código de barras'), ('camera', 'Fotografa', 'o teu livro'), ('swap', 'Partilha', 'troca, vende ou oferece')],
               chips=['Grátis', 'Na tua língua', 'Perto de ti'], cta='Lê o código QR para entrar',
               small='Sem palavras-passe nem anúncios. Entrega os livros na escola, ao sábado.'),
}
POSTER_CSS = BASE_CSS + """
@page{size:A4;margin:0}
.page{width:210mm;height:297mm;padding:16mm 16mm 12mm;display:flex;flex-direction:column;overflow:hidden}
.top{display:flex;align-items:center;gap:5mm}.top .mark{width:16mm;height:16mm;border-radius:4.5mm}.top .word{font-size:11mm}
.top .desc{margin-left:auto;font-size:3.6mm;font-weight:600;letter-spacing:.16em;color:var(--muted)}
.hero{display:block;width:100%;height:62mm;margin:7mm 0 5mm;background:linear-gradient(180deg,var(--honey-tint),var(--ground));border-radius:8mm;padding:4mm 8mm 0}
h1{font-size:15.5mm;line-height:1.02;letter-spacing:-.025em;margin:0 0 4mm;font-weight:600}
.lead{font-size:7mm;color:var(--muted);margin:0 0 8mm;font-weight:500}
.steps{display:grid;grid-template-columns:repeat(3,1fr);gap:4mm;margin-bottom:7mm}
.step{background:var(--card);border-radius:6mm;padding:5mm}.step .ic{width:13mm;height:13mm;border-radius:4mm;display:flex;align-items:center;justify-content:center;margin-bottom:3mm}
.step:nth-child(1) .ic{background:var(--honey-tint);color:var(--honey-deep)}.step:nth-child(2) .ic{background:var(--rose-tint);color:var(--rose-deep)}.step:nth-child(3) .ic{background:var(--sage-tint);color:var(--sage-deep)}
.step b{display:block;font-size:6.4mm;font-weight:600}.step span{font-size:4.2mm;color:var(--muted)}
.bottom{margin-top:auto;display:flex;gap:7mm;align-items:stretch}
.qrcard{background:var(--card);border-radius:7mm;padding:5mm;width:68mm;flex:0 0 auto;text-align:center}
.qr{width:100%;display:block;border-radius:2mm}.qrcard small{display:block;margin-top:2.5mm;font-size:3.6mm;font-weight:600;color:var(--sage-deep)}
.side{display:flex;flex-direction:column;justify-content:center;gap:5mm}
.chips{display:flex;flex-wrap:wrap;gap:2.5mm}.chip{background:var(--sage-tint);color:var(--sage-deep);font-weight:600;font-size:4.6mm;border-radius:99px;padding:2mm 4.5mm;display:inline-flex;gap:1.5mm;align-items:center}
.cta{font-size:8.5mm;font-weight:600;line-height:1.1;letter-spacing:-.01em}
.cta .arrow{color:var(--rose)}
.side p{margin:0;font-size:4.4mm;color:var(--muted)}
"""
def poster(c):
    steps = ''.join(f'<div class="step"><div class="ic">{icon(i, 30)}</div><b>{a}</b><span>{b}</span></div>' for i, a, b in c['steps'])
    chips = ''.join(f'<span class="chip">{icon("check", 18)} {x}</span>' for x in c['chips'])
    return f"""<!doctype html><html lang="{c['lang']}"><head><meta charset="utf-8"><title>seku seku poster</title><style>{POSTER_CSS}</style></head><body>
<div class="page"><div class="top"><div class="mark">{MARK}</div><span class="word">seku seku</span><span class="desc">BOOK SWAP</span></div>
{HERO}<h1>{c['h1']}</h1><p class="lead">{c['lead']}</p><div class="steps">{steps}</div>
<div class="bottom"><div class="qrcard">{qr_svg(APP_URL)}<small>{APP_LABEL}</small></div>
<div class="side"><div class="chips">{chips}</div><div class="cta"><span class="arrow">←</span> {c['cta']}</div><p>{c['small']}</p></div></div></div></body></html>"""

# ------------------------------------------------------------------ Instagram (1080 x 1350)
IG_CSS = BASE_CSS + """
.post{width:1080px;height:1350px;padding:84px;display:flex;flex-direction:column;overflow:hidden;position:relative}
.brand{display:flex;align-items:center;gap:18px}.brand .mark{width:64px;height:64px;border-radius:18px}.brand .word{font-size:40px}
.tag{margin-left:auto;font-size:22px;font-weight:600;letter-spacing:.16em;color:var(--muted)}
h1{font-size:96px;line-height:1.02;letter-spacing:-.03em;margin:0 0 28px;font-weight:600}
.lead{font-size:38px;color:var(--muted);margin:0;line-height:1.3}
.hero{width:100%;height:auto;margin:40px 0;background:linear-gradient(180deg,var(--honey-tint),var(--ground));border-radius:40px;padding:30px 60px 0}
.foot{margin-top:auto;display:flex;align-items:center;justify-content:space-between;font-size:30px;font-weight:600;color:var(--sage-deep)}
.pill{background:var(--sage);color:#fff;border-radius:99px;padding:18px 34px;font-size:30px}
.num{font-size:200px;font-weight:600;line-height:.9;color:var(--honey);letter-spacing:-.04em}
.bigic{width:300px;height:300px;border-radius:72px;display:flex;align-items:center;justify-content:center;margin:60px 0 50px}
.photo{flex:1;border:4px dashed #C9BFA9;border-radius:40px;margin:36px 0;display:flex;align-items:center;justify-content:center;color:var(--muted);font-size:30px;text-align:center;background:var(--card)}
.label{font-size:26px;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:var(--rose-deep)}
"""
def ig_shell(body, lang):
    return f'<!doctype html><html lang="{lang}"><head><meta charset="utf-8"><title>seku seku post</title><style>{IG_CSS}</style></head><body><div class="post">{body}</div></body></html>'
def brand_row(tag): return f'<div class="brand"><div class="mark">{MARK}</div><span class="word">seku seku</span><span class="tag">{tag}</span></div>'

IG = {
  'lt': dict(launch=('Kiek knygų jūsų lentynoje laukia naujo skaitytojo?', 'Vaikiškos knygos – iš šeimos į šeimą. Nuskenuokite, nufotografuokite, pasidalinkite.', 'Nemokamai · be reklamų'),
             how=[('barcode', 'Nuskenuokite kodą', 'Knygos duomenys užsipildo patys.'), ('camera', 'Nufotografuokite knygą', 'Savo egzempliorių – viršelį ir būklę.'), ('swap', 'Susitikite ir apsikeiskite', 'Pavyzdžiui, šeštadienį mokykloje.')],
             howTitle='Kaip tai veikia', week=('Savaitės knyga', '[Pavadinimas]', 'Laukia naujų skaitytojų [mieste] – ieškokite seku seku.', 'Įklijuokite savo knygos nuotrauką'),
             thanks=('Ačiū, šeimos!', 'Šeštadienį mokykloje savo naujus namus surado [skaičius] knygų.')),
  'en': dict(launch=('How many books on your shelf are waiting for a new reader?', "Children's books, passed from family to family. Scan, snap, share.", 'Free · no ads'),
             how=[('barcode', 'Scan the barcode', 'The book details fill themselves in.'), ('camera', 'Snap a photo', 'Of your own copy – cover and condition.'), ('swap', 'Meet and swap', 'For example at school on Saturday.')],
             howTitle='How it works', week=('Book of the week', '[Title]', 'Waiting for new readers in [city] – find it on seku seku.', 'Place a photo of your book here'),
             thanks=('Thank you, families!', 'On Saturday [number] books found new homes at school.')),
  'pt': dict(launch=('Quantos livros da tua estante estão à espera de um novo leitor?', 'Livros infantis, de família para família. Lê, fotografa, partilha.', 'Grátis · sem anúncios'),
             how=[('barcode', 'Lê o código de barras', 'Os dados do livro preenchem-se sozinhos.'), ('camera', 'Tira uma foto', 'Do teu exemplar – a capa e o estado.'), ('swap', 'Encontra-te e troca', 'Por exemplo, na escola ao sábado.')],
             howTitle='Como funciona', week=('Livro da semana', '[Título]', 'À espera de novos leitores em [cidade] – procura-o no seku seku.', 'Coloca aqui uma foto do teu livro'),
             thanks=('Obrigado, famílias!', 'No sábado, [número] livros encontraram uma nova casa na escola.')),
}
def ig_posts(lang, c):
    out = {}
    h1, lead, chip = c['launch']
    out[f'{lang}-1-launch'] = ig_shell(f'{brand_row("BOOK SWAP")}{HERO}<h1>{h1}</h1><p class="lead">{lead}</p><div class="foot"><span>{APP_LABEL}</span><span class="pill">{chip}</span></div>', lang)
    colors = [('var(--honey-tint)', 'var(--honey-deep)'), ('var(--rose-tint)', 'var(--rose-deep)'), ('var(--sage-tint)', 'var(--sage-deep)')]
    for i, (ic, t, s) in enumerate(c['how']):
        bg, fg = colors[i]
        out[f'{lang}-2-how-{i+1}'] = ig_shell(f'{brand_row(c["howTitle"].upper())}<div class="bigic" style="background:{bg};color:{fg}">{icon(ic, 170)}</div><div class="num">{i+1}</div><h1 style="margin-top:20px">{t}</h1><p class="lead">{s}</p><div class="foot"><span>{APP_LABEL}</span><span>{i+1} / 3</span></div>', lang)
    lab, title, s, ph = c['week']
    out[f'{lang}-3-book-of-the-week'] = ig_shell(f'{brand_row("")}<div class="photo">{icon("books", 90)}<br>{ph}</div><div class="label">{lab}</div><h1 style="font-size:80px;margin:12px 0 18px">{title}</h1><p class="lead">{s}</p>', lang)
    h1, s = c['thanks']
    out[f'{lang}-4-thank-you'] = ig_shell(f'{brand_row("")}<div class="bigic" style="background:var(--rose-tint);color:var(--rose-deep)">{icon("heart", 170)}</div><h1>{h1}</h1><p class="lead">{s}</p><div class="foot"><span>{APP_LABEL}</span></div>', lang)
    return out

# ------------------------------------------------------------------ "seku seku friend" guide (A4, one page)
GUIDE = {
  'en': dict(title='You are the school\'s seku seku friend', intro='Thank you! You help families at your school swap children\'s books. It takes about an hour a month. Here is everything you need.',
    blocks=[('heart', 'Your job in one line', 'Be the friendly face who helps parents add their first book and answers questions.'),
            ('books', 'Before the first swap', 'Add 10–15 of your own books, so the shelf isn\'t empty. Ask 3–5 active parents to do the same. Put the poster with the QR code up at school.'),
            ('barcode', 'Helping a parent sign up (3 minutes)', 'Scan the QR code → enter email → type the 6-digit code from the email → name, country, postal code → tick the two boxes. Then: Add → scan the barcode → take a photo → save.'),
            ('swap', 'Swap table, once a term', 'A table at pick-up with the poster. Parents bring books, add them on the spot, and take others home. Take photos of the table and books – never of children.'),
            ('chat', 'Common questions', 'Is it free? Yes, no fees, no ads. Do I give my address? No, only a postal code – you meet at school. Book not found? Type the title; the next scan will find it.'),
            ('shield', 'Safety', 'Handovers happen in public places, ideally at school. Never pay in advance to strangers. Children don\'t get accounts. Report anything odd with the flag button – admins look at it.'),
            ('flag', 'Something wrong?', 'Write to the seku seku admins (contact in the app: Profile → Terms → Contact). Tell us what confused parents – we fix it.')],
    foot='seku seku – children\'s books, passed from family to family.'),
  'lt': dict(title='Jūs – mokyklos seku seku draugas', intro='Ačiū! Padedate savo mokyklos šeimoms keistis vaikiškomis knygomis. Tai užtrunka maždaug valandą per mėnesį. Štai viskas, ko reikia.',
    blocks=[('heart', 'Jūsų užduotis vienu sakiniu', 'Būti draugišku veidu, kuris padeda tėvams pridėti pirmąją knygą ir atsako į klausimus.'),
            ('books', 'Prieš pirmuosius mainus', 'Pridėkite 10–15 savo knygų, kad lentyna nebūtų tuščia. Paprašykite 3–5 aktyvių tėvų padaryti tą patį. Mokykloje pakabinkite plakatą su QR kodu.'),
            ('barcode', 'Kaip padėti tėvams užsiregistruoti (3 min.)', 'Nuskenuokite QR kodą → įveskite el. paštą → įrašykite 6 skaitmenų kodą iš laiško → vardas, šalis, pašto kodas → pažymėkite abu langelius. Tada: Pridėti → nuskenuokite brūkšninį kodą → nufotografuokite → išsaugokite.'),
            ('swap', 'Mainų stalas kartą per trimestrą', 'Stalas su plakatu, kai tėvai pasiima vaikus. Tėvai atsineša knygų, jas iš karto prideda ir pasiima kitų. Fotografuokite stalą ir knygas – niekada vaikų.'),
            ('chat', 'Dažni klausimai', 'Ar nemokama? Taip, jokių mokesčių ir reklamų. Ar reikia adreso? Ne, tik pašto kodo – susitinkate mokykloje. Knyga nerasta? Įrašykite pavadinimą – kitą kartą ją ras.'),
            ('shield', 'Saugumas', 'Perduokite viešose vietose, geriausia mokykloje. Niekada nemokėkite iš anksto nepažįstamiems. Vaikai paskyrų neturi. Apie keistus dalykus praneškite vėliavėle – administratoriai peržiūrės.'),
            ('flag', 'Kažkas negerai?', 'Parašykite seku seku administratoriams (kontaktai programėlėje: Profilis → Naudojimosi sąlygos → Kontaktai). Papasakokite, kas tėvams buvo neaišku – pataisysime.')],
    foot='seku seku – vaikiškos knygos iš šeimos į šeimą.'),
  'pt': dict(title='És o amigo seku seku da escola', intro='Obrigado! Ajudas as famílias da tua escola a trocar livros infantis. Leva cerca de uma hora por mês. Aqui está tudo o que precisas.',
    blocks=[('heart', 'A tua tarefa numa frase', 'Ser a cara simpática que ajuda os pais a adicionar o primeiro livro e responde às perguntas.'),
            ('books', 'Antes da primeira troca', 'Adiciona 10–15 livros teus, para a estante não ficar vazia. Pede a 3–5 pais ativos que façam o mesmo. Afixa na escola o cartaz com o código QR.'),
            ('barcode', 'Ajudar um pai ou mãe a registar-se (3 minutos)', 'Lê o código QR → escreve o email → escreve o código de 6 dígitos do email → nome, país, código postal → marca as duas caixas. Depois: Adicionar → lê o código de barras → tira uma foto → guarda.'),
            ('swap', 'Mesa de trocas, uma vez por período', 'Uma mesa com o cartaz à hora de saída. Os pais trazem livros, adicionam-nos logo ali e levam outros para casa. Fotografa a mesa e os livros – nunca as crianças.'),
            ('chat', 'Perguntas frequentes', 'É grátis? Sim, sem taxas nem anúncios. Tenho de dar a morada? Não, só o código postal – encontram-se na escola. Livro não encontrado? Escreve o título; da próxima vez vai ser encontrado.'),
            ('shield', 'Segurança', 'As entregas fazem-se em locais públicos, de preferência na escola. Nunca pagues adiantado a desconhecidos. As crianças não têm conta. Denuncia algo estranho com o botão da bandeira – os administradores analisam.'),
            ('flag', 'Algo correu mal?', 'Escreve aos administradores do seku seku (contacto na aplicação: Perfil → Termos de utilização → Contacto). Conta-nos o que confundiu os pais – nós corrigimos.')],
    foot='seku seku – livros infantis, de família para família.'),
}
GUIDE_CSS = BASE_CSS + """
@page{size:A4;margin:0}
.page{width:210mm;height:297mm;padding:14mm 15mm;display:flex;flex-direction:column;overflow:hidden}
.top{display:flex;align-items:center;gap:4mm;margin-bottom:6mm}.top .mark{width:12mm;height:12mm;border-radius:3.5mm}.top .word{font-size:7.5mm}
.top .qr{width:22mm;margin-left:auto;border-radius:1.5mm}
h1{font-size:10mm;line-height:1.05;letter-spacing:-.02em;margin:0 0 3mm;font-weight:600}
.intro{font-size:4.6mm;color:var(--muted);margin:0 0 6mm;line-height:1.35}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:4mm}
.b{background:var(--card);border-radius:5mm;padding:4.5mm 5mm;display:flex;gap:3.5mm}
.b .ic{flex:0 0 auto;width:10mm;height:10mm;border-radius:3mm;background:var(--sage-tint);color:var(--sage-deep);display:flex;align-items:center;justify-content:center}
.b:nth-child(3n+2) .ic{background:var(--honey-tint);color:var(--honey-deep)}.b:nth-child(3n) .ic{background:var(--rose-tint);color:var(--rose-deep)}
.b h2{font-size:4.6mm;margin:0 0 1.5mm;font-weight:600}.b p{font-size:3.75mm;line-height:1.4;margin:0;color:var(--ink)}
.b.wide{grid-column:1/-1}
.foot{margin-top:auto;font-size:3.8mm;color:var(--muted);display:flex;justify-content:space-between}
"""
def guide(lang, c):
    blocks = ''.join(f'<div class="b{" wide" if i in (2,) else ""}"><div class="ic">{icon(ic, 22)}</div><div><h2>{h}</h2><p>{p}</p></div></div>' for i, (ic, h, p) in enumerate(c['blocks']))
    return f"""<!doctype html><html lang="{lang}"><head><meta charset="utf-8"><title>seku seku friend guide</title><style>{GUIDE_CSS}</style></head><body>
<div class="page"><div class="top"><div class="mark">{MARK}</div><span class="word">seku seku</span>{qr_svg(APP_URL)}</div>
<h1>{c['title']}</h1><p class="intro">{c['intro']}</p><div class="grid">{blocks}</div>
<div class="foot"><span>{c['foot']}</span><span>{APP_LABEL}</span></div></div></body></html>"""

if __name__ == '__main__':
    PRINT.mkdir(parents=True, exist_ok=True); SOCIAL.mkdir(parents=True, exist_ok=True)
    for lang, c in POSTER.items(): (PRINT / f'poster-a4-{lang}.html').write_text(poster(c))
    for lang, c in GUIDE.items(): (PRINT / f'friend-guide-{lang}.html').write_text(guide(lang, c))
    for lang, c in IG.items():
        for name, html in ig_posts(lang, c).items():
            (SOCIAL / f'{name}.html').write_text(html.replace("../../vendor", "../../../vendor"))
    print('ok')
