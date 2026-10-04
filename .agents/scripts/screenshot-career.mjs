// Screenshots the Career path at given moments, 1440x900, with the dev server running.
// Usage: node .agents/scripts/screenshot-career.mjs OUT_PREFIX SEEK[+WAIT] ... [--lang fr|en] [--base URL]
// Each moment seeks to SEEK seconds, then waits WAIT seconds (default 0.6) while the story keeps playing.
import { chromium } from '@playwright/test';

const args = process.argv.slice(2);
const option = (name, fallback) => {
  const at = args.indexOf(name);
  return at < 0 ? fallback : args.splice(at, 2)[1];
};
const lang = option('--lang', 'fr');
const base = option('--base', 'http://localhost:5173');
const [out, ...moments] = args;
if (!out || moments.length === 0) throw new Error('Usage: screenshot-career.mjs OUT_PREFIX SEEK[+WAIT] ...');
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { height: 900, width: 1440 } });
for (const moment of moments) {
  const [seek, wait = '0.6'] = moment.split('+');
  await page.goto(`${base}/?path=career&lang=${lang}&t=${seek}`);
  await page.waitForTimeout(Number(wait) * 1000);
  await page.screenshot({ path: `${out}-${moment}.png` });
  console.log(`${out}-${moment}.png`);
}
await browser.close();
