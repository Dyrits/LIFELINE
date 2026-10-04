import { describe, expect, it } from 'vitest';
import { CAREER } from '../src/data/career';
import { LANGS, type Text } from '../src/data/types';
import { CAREER_CAPTIONS, UI } from '../src/data/ui';
import * as month from '../src/month';

const texts = (value: unknown): Text[] => {
  if (Array.isArray(value)) return value.flatMap(texts);
  if (value && typeof value === 'object') {
    const keys = Object.keys(value);
    if (keys.length === LANGS.length && LANGS.every(lang => keys.includes(lang))) return [value as Text];
    return Object.values(value).flatMap(texts);
  }
  return [];
};

const YEAR_MONTH = /^\d{4}-(0[1-9]|1[0-2])$/;

describe('career data', () => {
  it('writes every text in every language', () => {
    const all = texts([CAREER, UI, CAREER_CAPTIONS]);
    expect(all.length).toBeGreaterThan(100);
    for (const text of all) for (const lang of LANGS) expect(text[lang].trim(), JSON.stringify(text)).not.toBe('');
  });

  it('lists stops oldest first', () => {
    const starts = CAREER.map(stop => Math.min(...stop.entries.map(entry => month.index(entry.from))));
    expect(starts).toEqual([...starts].sort((earlier, later) => earlier - later));
  });

  it('writes every month as YYYY-MM', () => {
    for (const stop of CAREER)
      for (const entry of stop.entries) {
        expect(entry.from).toMatch(YEAR_MONTH);
        if (entry.to) expect(entry.to).toMatch(YEAR_MONTH);
      }
  });

  it('never ends a job before it starts', () => {
    for (const stop of CAREER)
      for (const entry of stop.entries)
        if (entry.to) expect(month.index(entry.to)).toBeGreaterThanOrEqual(month.index(entry.from));
  });

  it('gives every stop at least one shape', () => {
    for (const stop of CAREER) expect(stop.motifs.length).toBeGreaterThan(0);
  });

  it('opens three chapters: Australia, Asia and the return to France', () => {
    expect(CAREER.filter(stop => stop.chapter)).toHaveLength(3);
  });
});
