import type { Timeline } from './career/build';
import type { Lang, YearMonth } from './data/types';
import { UI } from './data/ui';

/** A month counted from year 0, so months can be compared and subtracted. */
export const index = (yearMonth: YearMonth): number => {
  const [year, month] = yearMonth.split('-').map(Number);
  return (year ?? 0) * 12 + (month ?? 1) - 1;
};

/** The month a date falls in. */
export const of = (date: Date): YearMonth =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}` as YearMonth;

const formats: Record<Lang, Intl.DateTimeFormat> = {
  en: new Intl.DateTimeFormat('en-GB', { month: 'short', year: 'numeric' }),
  fr: new Intl.DateTimeFormat('fr-FR', { month: 'short', year: 'numeric' }),
};

/** A month written short, with its year: "mars 2011", "Mar 2011". */
export const format = (yearMonth: YearMonth, lang: Lang): string => {
  const [year, month] = yearMonth.split('-').map(Number);
  return formats[lang].format(new Date(year ?? 0, (month ?? 1) - 1, 1));
};

/** From one month to another, or up to today when the second is `null`. */
export const span = (from: YearMonth, to: YearMonth | null, lang: Lang): string =>
  `${format(from, lang)} – ${to ? format(to, lang) : UI.today[lang]}`;

/**
 * The month the pen has reached at a moment: a stop holds its start month, matching its card, and the months roll by along the connector to the next stop, then on to today.
 */
export function at({ stops, end, today }: Timeline, time: number): number {
  const first = stops[0];
  if (!first || time <= first.start.time) return first?.month ?? today;
  for (let position = 0; position < stops.length; position++) {
    const mark = stops[position] as (typeof stops)[number];
    const next = stops[position + 1];
    const [nextTime, nextMonth] = next ? [next.start.time, next.month] : [end, today];
    if (time < mark.end.time) return mark.month;
    if (time < nextTime)
      return mark.month + (nextMonth - mark.month) * ((time - mark.end.time) / (nextTime - mark.end.time));
  }
  return today;
}
