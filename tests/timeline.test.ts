import { describe, expect, it } from 'vitest';
import { buildCareer, monthAt, monthIndex } from '../src/career/build';
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

  it('draws the ink line without ever lifting the pen', () => {
    const lifts = timeline.story.get('A').pts.filter(p => p.up);
    expect(lifts).toEqual([]);
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

  it('counts the years forward from the first job to today', () => {
    expect(Math.floor(monthAt(timeline, 0) / 12)).toBe(2011);
    expect(monthAt(timeline, timeline.end + 5)).toBe(monthIndex('2026-10'));
    let prev = -Infinity;
    for (let t = 0; t < timeline.end; t += 0.5) {
      const m = monthAt(timeline, t);
      expect(m).toBeGreaterThanOrEqual(prev);
      prev = m;
    }
  });

  it('tells each stop’s line of story while it is drawn', () => {
    timeline.stops.forEach((m, i) => {
      const t = (m.t0 + m.t1) / 2;
      const shown = timeline.story.captions.filter(c => c.t <= t && t < c.t + c.dur).at(-1);
      expect(shown?.text, `stop ${i}`).toBe(CAREER[i]?.caption);
    });
  });

  it('tells each chapter on the way to its stop, long enough to read', () => {
    timeline.stops.forEach((m, i) => {
      const chapter = CAREER[i]?.chapter;
      if (!chapter) return;
      const told = timeline.story.captions.find(c => c.text === chapter);
      expect(told?.t, `stop ${i}`).toBeLessThan(m.t0);
      expect(told?.dur, `stop ${i}`).toBeGreaterThan(4);
    });
    expect(CAREER.filter(s => s.chapter)).toHaveLength(3);
  });

  it('records where the pen ends each stop', () => {
    for (const m of timeline.stops) {
      const pen = timeline.story
        .get('A')
        .pts.filter(p => p.t <= m.t1)
        .at(-1);
      expect(m.endX).toBeCloseTo(pen?.x ?? Number.NaN, -1);
      expect(m.endX).toBeGreaterThan(m.x);
    }
  });

  it('lasts a few minutes', () => {
    expect(timeline.end).toBeGreaterThan(120);
    expect(timeline.end).toBeLessThan(600);
  });
});
