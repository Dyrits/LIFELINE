#!/usr/bin/env node
// Prints where each Career stop's card sits on screen (its left edge, in px, and whether it is open) at a moment of
// its stop, for one or more viewport sizes. Finds cards that leave the screen or drift. Read-only; needs the dev
// server running and Chromium installed for Playwright.
// Arguments: [--base URL=http://localhost:5173] [--at start|end=end] [--offset SECONDS=0.3, after the start or
//   before the end] [--sizes WxH,...=1440x900] [--lang fr|en=fr] [--stops 0,6,18 (default: all)]
// Example: node .agents/scripts/measure-card-positions.mjs --at end --sizes 1440x900,1280x720
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';
import { createServer } from 'vite';

const root = fileURLToPath(new URL('../..', import.meta.url));
const args = process.argv.slice(2);
const opt = name => {
  const i = args.indexOf(`--${name}`);
  return i < 0 ? undefined : args[i + 1];
};
const base = opt('base') ?? 'http://localhost:5173';
const atEnd = (opt('at') ?? 'end') === 'end';
const offset = Number(opt('offset') ?? 0.3);
const lang = opt('lang') ?? 'fr';
const sizes = (opt('sizes') ?? '1440x900').split(',').map(s => s.split('x').map(Number));
const only = opt('stops')?.split(',').map(Number);

const server = await createServer({ root, logLevel: 'silent', server: { middlewareMode: true } });
let stops;
try {
  const { buildCareer } = await server.ssrLoadModule('/src/career/build.ts');
  const { CAREER } = await server.ssrLoadModule('/src/data/career.ts');
  const { currentMonth } = await server.ssrLoadModule('/src/i18n.ts');
  stops = buildCareer(CAREER, currentMonth()).stops.filter(m => !only || only.includes(m.index));
} finally {
  await server.close();
}

const browser = await chromium.launch();
try {
  for (const [width, height] of sizes) {
    const page = await browser.newPage({ viewport: { width, height } });
    const out = [];
    for (const m of stops) {
      const t = atEnd ? m.t1 - offset : m.t0 + offset;
      await page.goto(`${base}/?path=career&lang=${lang}&t=${t.toFixed(2)}`);
      // Pause at once, so the moment measured is the one asked for; then let the card settle.
      await page.keyboard.press('Space');
      await page.waitForTimeout(600);
      const [x, open] = await page.evaluate(i => {
        const el = document.querySelector(`.card[data-stop="${i}"]`);
        return [Math.round(el?.getBoundingClientRect().x ?? Number.NaN), el?.classList.contains('open') ?? false];
      }, m.index);
      out.push(`${m.index}:${x}${open ? '' : '(closed)'}`);
    }
    console.log(`${width}x${height}\t${out.join(' ')}`);
    await page.close();
  }
} finally {
  await browser.close();
}
