// Renders the HTML made by make.py: posters and guides to PDF + PNG, Instagram posts to PNG (1080 x 1350).
//   python3 brand/print/make.py && node brand/print/render.mjs
import { createRequire } from 'node:module';
import { readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const { chromium } = createRequire(import.meta.url)('playwright');

const here = path.dirname(fileURLToPath(import.meta.url));
const social = path.join(here, '..', 'social', 'instagram');
const browser = await chromium.launch();
for (const f of readdirSync(here).filter((x) => x.endsWith('.html'))) {
  const page = await browser.newPage({ viewport: { width: 794, height: 1123 }, deviceScaleFactor: 2 });
  await page.goto('file://' + path.join(here, f)); await page.evaluate(() => document.fonts.ready); await page.waitForTimeout(300);
  const base = path.join(here, f.replace('.html', ''));
  await page.pdf({ path: base + '.pdf', format: 'A4', printBackground: true, margin: { top: 0, right: 0, bottom: 0, left: 0 } });
  await page.screenshot({ path: base + '.png' });
  await page.close(); console.log('  ', f);
}
for (const f of readdirSync(social).filter((x) => x.endsWith('.html'))) {
  const page = await browser.newPage({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 1 });
  await page.goto('file://' + path.join(social, f)); await page.evaluate(() => document.fonts.ready); await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(social, f.replace('.html', '.png')) });
  await page.close(); console.log('  ', f);
}
await browser.close();
