// Browser smoke test of the demo mode (no server data). Needs a local web server on port 8080:
//   python3 -m http.server 8080 &   then   node tests/smoke.mjs
// Requires Playwright with Chromium (npx playwright install chromium).
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright'); // CommonJS lookup, so a global install works too

const BASE = process.env.APP_URL || 'http://localhost:8080/';
let pass = 0, fail = 0;
const ok = (name, cond, extra) => { if (cond) { pass++; console.log('  ok  ', name); } else { fail++; console.log('  FAIL', name, extra || ''); } };

const browser = await chromium.launch();
for (const lang of ['lt', 'es', 'en']) {
  const page = await browser.newPage({ locale: lang, viewport: { width: 390, height: 844 } });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  const go = async (hash) => { await page.goto(BASE + '?demo=1' + hash); await page.waitForTimeout(400); };
  console.log(`== ${lang}`);

  for (const r of ['#/terms', '#/privacy', '#/about', '#/report']) {
    await go(r);
    ok(`${r} opens before sign-up`, (await page.locator('main h1').count()) === 1);
  }
  await go('#/');
  await page.click('[data-action=startSignup]');
  await page.fill('#onb-name', 'Test');
  await page.selectOption('#onb-country', 'DK');
  await page.fill('#onb-postal', '2300');
  await page.check('#onb-agree');
  await page.click('[data-action=join]');
  ok('18+ is required', (await page.locator('[role=alert]').count()) === 1);
  await page.check('#onb-adult');
  await page.click('[data-action=join]');
  await page.waitForTimeout(300);
  ok('signed up and the tour shows', (await page.locator('.sheet.tour').count()) === 1);
  await page.click('[data-action=tourSkip]');
  ok('books are listed', (await page.locator('a[href^="#/book/"]').count()) > 0);
  await page.locator('a[href^="#/book/"]').first().click();
  await page.waitForTimeout(300);
  ok('a book opens', (await page.locator('main h1').count()) === 1);
  await go('#/profile');
  ok('profile links the privacy notice', (await page.locator('a[href="#/privacy"]').count()) === 1);
  await go('#/messages');
  ok('messages open', (await page.locator('main').count()) === 1);
  ok('no errors in the page', errors.length === 0, errors.join(' | '));
  await page.close();
}
await browser.close();
console.log(`\nRESULT: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
