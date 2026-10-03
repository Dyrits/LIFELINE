import { describe, expect, it } from 'vitest';
import { monthIndex } from '../src/career/build';
import { CAREER, PROFILE } from '../src/data/career';
import { LANGS, type Text } from '../src/data/types';

const texts = (v: unknown): Text[] => {
  if (Array.isArray(v)) return v.flatMap(texts);
  if (v && typeof v === 'object') {
    const keys = Object.keys(v);
    if (keys.length === LANGS.length && LANGS.every(l => keys.includes(l))) return [v as Text];
    return Object.values(v).flatMap(texts);
  }
  return [];
};

describe('career data', () => {
  it('writes every text in every language', () => {
    const all = texts([PROFILE, CAREER]);
    expect(all.length).toBeGreaterThan(100);
    for (const t of all) for (const l of LANGS) expect(t[l].trim(), JSON.stringify(t)).not.toBe('');
  });

  it('lists stops oldest first', () => {
    const starts = CAREER.map(s => Math.min(...s.entries.map(e => monthIndex(e.from))));
    expect(starts).toEqual([...starts].sort((a, b) => a - b));
  });

  it('uses valid months that never end before they start', () => {
    for (const s of CAREER)
      for (const e of s.entries) {
        expect(e.from).toMatch(/^\d{4}-(0[1-9]|1[0-2])$/);
        if (e.to) {
          expect(e.to).toMatch(/^\d{4}-(0[1-9]|1[0-2])$/);
          expect(monthIndex(e.to)).toBeGreaterThanOrEqual(monthIndex(e.from));
        }
      }
  });

  it('gives every stop at least one shape', () => {
    for (const s of CAREER) expect(s.motifs.length).toBeGreaterThan(0);
  });
});
