import { describe, expect, it } from 'vitest';
import { shape } from '../src/career/motifs';

describe('job shapes', () => {
  it.each(shape.keys)('%s starts on the line', key => {
    expect(shape.of(key).outline[0]).toEqual([0, 0]);
  });

  it.each(shape.keys)('%s hands the line on further along it', key => {
    const exit = shape.of(key).outline.at(-1);
    expect(exit?.[0]).toBeGreaterThan(150);
    // Training shapes hand over to the gold thread, which rides just under the line.
    expect([0, 14]).toContain(exit?.[1]);
  });

  it.each(shape.keys)('%s stays above the line', key => {
    const { outline, details } = shape.of(key);
    for (const stroke of [outline, ...details])
      for (const [, y] of stroke) {
        expect(y).toBeLessThanOrEqual(20);
        expect(y).toBeGreaterThan(-300);
      }
  });

  it.each(shape.keys)('%s fits within a screen width', key => {
    const { outline, details } = shape.of(key);
    for (const stroke of [outline, ...details])
      for (const [x] of stroke) {
        expect(x).toBeGreaterThanOrEqual(0);
        expect(x).toBeLessThan(400);
      }
  });
});
