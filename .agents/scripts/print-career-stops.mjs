#!/usr/bin/env node
// Prints when each Career stop is drawn (index, start and end in seconds, tag), from the real timeline.
// With --urls BASE, prints instead one URL per stop that opens the page at that moment, ready for
// capture-page-screenshots.mjs. Read-only.
// Arguments: [--urls BASE] [--lang fr|en] [--offset SECONDS=6, capped to the stop's length] [--end] (adds the final overview)
// Example: node .agents/scripts/print-career-stops.mjs --urls http://localhost:5173 --lang en --end
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const root = fileURLToPath(new URL('../..', import.meta.url));
const args = process.argv.slice(2);
const opt = name => {
  const i = args.indexOf(`--${name}`);
  return i < 0 ? undefined : args[i + 1];
};
const server = await createServer({ root, logLevel: 'silent', server: { middlewareMode: true } });
try {
  const { buildCareer } = await server.ssrLoadModule('/src/career/build.ts');
  const { tagName } = await server.ssrLoadModule('/src/career/cards.ts');
  const { CAREER } = await server.ssrLoadModule('/src/data/career.ts');
  const month = await server.ssrLoadModule('/src/month.ts');
  const lang = opt('lang') ?? 'fr';
  const { stops, end } = buildCareer(CAREER, month.of(new Date()));
  const base = opt('urls');
  if (base) {
    const offset = Number(opt('offset') ?? 6);
    for (const m of stops) {
      const t = m.start.time + Math.max(0.5, Math.min(offset, m.end.time - m.start.time - 1.5));
      console.log(`${base}/?path=career&lang=${lang}&t=${t.toFixed(2)}`);
    }
    if (args.includes('--end')) console.log(`${base}/?path=career&lang=${lang}&t=${(end + 12).toFixed(2)}`);
  } else {
    for (const m of stops)
      console.log(`${m.index}\t${m.start.time.toFixed(1)}\t${m.end.time.toFixed(1)}\t${tagName(CAREER[m.index], lang)}`);
    console.log(`end\t${end.toFixed(1)}`);
  }
} finally {
  await server.close();
}
