import { describe, expect, it } from 'vitest';
import { buildCareer } from '../src/career/build';
import { CAREER } from '../src/data/career';

const timeline = buildCareer(CAREER, '2026-10');

describe('career timeline', () => {
  it('marks one stop per career entry group, in time order', () => {
    expect(timeline.stops).toHaveLength(CAREER.length);
    timeline.stops.forEach((m, i) => {
      expect(m.t1).toBeGreaterThan(m.t0);
      const next = timeline.stops[i + 1];
      if (next) expect(next.t0).toBeGreaterThanOrEqual(m.t1);
    });
    expect(timeline.end).toBeGreaterThan(timeline.stops.at(-1)?.t1 ?? Infinity);
  });

  it('lays every thread down in time order', () => {
    for (const [name, th] of timeline.story.threads)
      th.pts.forEach((p, i) => {
        if (i) expect(p.t, `${name}[${i}]`).toBeGreaterThanOrEqual((th.pts[i - 1]?.t ?? 0) - 1e-9);
        expect(Number.isFinite(p.x) && Number.isFinite(p.y), `${name}[${i}]`).toBe(true);
      });
  });

  it('draws the gold thread only for training stops', () => {
    const gold = timeline.story.get('C').pts;
    expect(gold.length).toBeGreaterThan(0);
    const trainingStarts = timeline.stops.filter((_, i) => CAREER[i]?.kind === 'training').map(m => m.t0);
    expect(gold[0]?.t).toBeGreaterThanOrEqual(trainingStarts[0] ?? Infinity);
  });

  it('leaves time to read each card', () => {
    for (const m of timeline.stops) expect(m.t1 - m.t0).toBeGreaterThan(3);
  });

  it('lasts a few minutes', () => {
    expect(timeline.end).toBeGreaterThan(120);
    expect(timeline.end).toBeLessThan(600);
  });
});
