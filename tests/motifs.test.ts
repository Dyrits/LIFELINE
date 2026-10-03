import { describe, expect, it } from 'vitest';
import { SHAPE_KEYS, shapeOf } from '../src/career/motifs';

describe('job shapes', () => {
  it.each(SHAPE_KEYS)('%s starts on the line and carries on along it', key => {
    const { outline } = shapeOf(key);
    expect(outline[0]).toEqual([0, 0]);
    const exit = outline.at(-1);
    expect(exit?.[0]).toBeGreaterThan(150);
    // Training shapes hand over to the gold thread, which rides just under the line.
    expect([0, 14]).toContain(exit?.[1]);
  });

  it.each(SHAPE_KEYS)('%s stays above the line and within a screen', key => {
    const { outline, details } = shapeOf(key);
    for (const s of [outline, ...details])
      for (const [x, y] of s) {
        expect(y).toBeLessThanOrEqual(20);
        expect(y).toBeGreaterThan(-300);
        expect(x).toBeGreaterThanOrEqual(0);
        expect(x).toBeLessThan(400);
      }
  });
});
