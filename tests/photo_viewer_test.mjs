// Photo viewer on a book page: a viewer can switch between several photos of one copy.
// Run: node tests/photo_viewer_test.mjs   (needs Playwright with Chromium; serves the repo itself)
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml',
  '.json': 'application/json', '.wasm': 'application/wasm', '.woff2': 'font/woff2', '.png': 'image/png' };

const server = http.createServer((req, res) => {
  const p = path.join(ROOT, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  const file = p.endsWith(path.sep) ? path.join(p, 'index.html') : p;
  if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}/`;

let pass = 0, fail = 0;
const check = (name, ok, extra) => {
  if (ok) { pass++; console.log('ok   ' + name); } else { fail++; console.log('FAIL ' + name + (extra !== undefined ? ' (' + extra + ')' : '')); }
};

// Distinct photos as data URLs (solid colours).
const svg = (c) => 'data:image/svg+xml;base64,' + Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="500" height="700"><rect width="500" height="700" fill="${c}"/></svg>`).toString('base64');
const PHOTOS = [svg('#d33'), svg('#3a3'), svg('#33d')];

async function openBook(context, photos) {
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto(base + '?demo=1');
  await page.evaluate((photos) => {
    const book = Object.assign({}, window.SAMPLE_BOOKS[0], { id: 'bx', status: 'available', isbn: '', photos: photos, photo: photos[0] });
    localStorage.setItem('bookswap-v1', JSON.stringify({ v: 2, lang: 'en', me: { name: 'Test', country: 'DK', postal: '2100' },
      agreed: { version: window.TERMS.version, at: Date.now() }, toured: true, interested: ['lt', 'es', 'en'], books: [book],
      cart: [], cartMeta: {}, threads: [], received: [], wishes: [], reviews: [] }));
  }, photos);
  await page.goto(base + '?demo=1#/book/bx');
  await page.reload(); // same-document hash change – reload so the app reads the seeded state
  await page.waitForSelector('.cover-l, .viewer');
  return { page, errors };
}
// Which photo fills the viewer right now (what is under its centre point).
const shown = (page) => page.evaluate(() => {
  const v = document.querySelector('.viewer').getBoundingClientRect();
  const el = document.elementsFromPoint(v.left + v.width / 2, v.top + v.height / 2).find((x) => x.tagName === 'IMG');
  return el ? el.getAttribute('alt') : null;
});
const settle = (page) => page.waitForTimeout(700);
const count = async (page) => (await page.textContent('.viewer-count')).trim();

const browser = await chromium.launch();
try {
  // Desktop: arrows, thumbnails, keyboard.
  {
    const ctx = await browser.newContext({ viewport: { width: 1200, height: 900 } });
    const { page, errors } = await openBook(ctx, PHOTOS);
    check('three slides rendered', (await page.$$('.viewer-slide')).length === 3);
    check('three thumbnails rendered', (await page.$$('.viewer-thumb')).length === 3);
    check('starts on photo 1', (await shown(page)) === 'Photo 1', await shown(page));
    check('counter 1 / 3', (await count(page)) === '1 / 3');
    check('prev arrow disabled on first photo', await page.isDisabled('.viewer-nav.prev'));
    await page.click('.viewer-nav.next'); await settle(page);
    check('next arrow shows photo 2', (await shown(page)) === 'Photo 2', await shown(page));
    check('counter 2 / 3', (await count(page)) === '2 / 3');
    check('thumbnail 2 marked current', (await page.getAttribute('.viewer-thumb:nth-child(2)', 'aria-current')) === 'true');
    await page.click('.viewer-nav.next'); await settle(page);
    check('next arrow shows photo 3', (await shown(page)) === 'Photo 3', await shown(page));
    check('next arrow disabled on last photo', await page.isDisabled('.viewer-nav.next'));
    await page.click('.viewer-nav.prev'); await settle(page);
    check('prev arrow goes back to photo 2', (await shown(page)) === 'Photo 2', await shown(page));
    await page.click('.viewer-thumb:nth-child(1)'); await settle(page);
    check('thumbnail jumps to photo 1', (await shown(page)) === 'Photo 1', await shown(page));
    await page.focus('.viewer-track'); await page.keyboard.press('ArrowRight'); await settle(page);
    check('ArrowRight key shows photo 2', (await shown(page)) === 'Photo 2', await shown(page));
    await page.keyboard.press('ArrowLeft'); await settle(page);
    check('ArrowLeft key shows photo 1', (await shown(page)) === 'Photo 1', await shown(page));
    await page.click('.viewer-thumb:nth-child(3)'); await settle(page);
    await page.evaluate(() => window.dispatchEvent(new HashChangeEvent('hashchange'))); await settle(page);
    check('photo kept after a re-render', (await shown(page)) === 'Photo 3', await shown(page));
    check('no page errors', errors.length === 0, errors.join('; '));
    await ctx.close();
  }
  // Phone: a real touch swipe on the photo.
  {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 1 });
    const { page, errors } = await openBook(ctx, PHOTOS);
    const cdp = await ctx.newCDPSession(page);
    const box = await (await page.$('.viewer')).boundingBox();
    const y = box.y + box.height / 2;
    // A finger swipe, sent as raw touch events.
    const swipe = async (from, to) => {
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: from, y }] });
      for (let k = 1; k <= 10; k++) {
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: from + (to - from) * k / 10, y }] });
        await page.waitForTimeout(16);
      }
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      await page.waitForTimeout(900);
    };
    const L = box.x + box.width * 0.25, R = box.x + box.width * 0.75; // clear of the arrow buttons
    await swipe(R, L);
    check('swipe left shows photo 2', (await shown(page)) === 'Photo 2', await shown(page));
    check('counter follows the swipe', (await count(page)) === '2 / 3', await count(page));
    await swipe(R, L);
    check('second swipe shows photo 3', (await shown(page)) === 'Photo 3', await shown(page));
    await swipe(L, R);
    check('swipe right goes back to photo 2', (await shown(page)) === 'Photo 2', await shown(page));
    await page.tap('.viewer-thumb:nth-child(1)'); await settle(page);
    check('tapping a thumbnail shows photo 1', (await shown(page)) === 'Photo 1', await shown(page));
    check('no page errors (phone)', errors.length === 0, errors.join('; '));
    await ctx.close();
  }
  // A single photo keeps the plain cover.
  {
    const ctx = await browser.newContext();
    const { page } = await openBook(ctx, [PHOTOS[0]]);
    check('one photo: plain cover, no viewer', (await page.$$('.viewer')).length === 0 && (await page.$$('.cover-l img')).length === 1);
    await ctx.close();
  }
} finally {
  await browser.close();
  server.close();
}
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
