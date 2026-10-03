import type { CareerStop, Text, YearMonth } from '../data/types';
import { ease, TAU } from '../engine/math';
import { type PathFn, poly, Story, strokes } from '../engine/story';
import { flight, hasShape, inkLength, type Stroke, shapeOf } from './motifs';

export const INK = '#1d1b26';
export const RED = '#b3262b';
export const GOLD = '#c98d17';
const APPRENTICE_COLOURS = [RED, GOLD, '#4f6b8a'] as const;

/** When a shape starts, and its top-right corner on the drawing. */
export type ShapeMark = Readonly<{ t: number; x: number; y: number }>;

/**
 * Where and when a stop is drawn, from t0 to t1, starting at (x, y); the pen ends it at `endX`.
 * `month` is when the stop began, counted in months since year 0; `shapes` follow the stop's motifs, in order.
 */
export type StopMark = Readonly<{
  index: number;
  t0: number;
  t1: number;
  x: number;
  y: number;
  endX: number;
  month: number;
  shapes: readonly ShapeMark[];
}>;

export type Timeline = Readonly<{ story: Story; stops: readonly StopMark[]; end: number; today: number }>;

/** Distance under the ink line at which the gold training thread rides. */
const RIDE = 14;
/** Each stop starts a little higher: the career climbs. */
const CLIMB = -28;
const LOOP_WIDTH = 64;
/** The detail pen sets off once the outline is this far along, and draws at least this fast. */
const DETAIL_LAG = 0.35;
const DETAIL_SPEED = 250;
/** A chapter line is told along the connector before its stop, which stretches to give time to read it. */
const CHAPTER_TIME = 4.5;

export const monthIndex = (ym: YearMonth): number => {
  const [y, m] = ym.split('-').map(Number);
  return (y ?? 0) * 12 + (m ?? 1) - 1;
};

const stopStart = (s: CareerStop): number => Math.min(...s.entries.map(e => monthIndex(e.from)));
const stopEnd = (s: CareerStop, today: number): number =>
  Math.max(...s.entries.map(e => (e.to ? monthIndex(e.to) : today)));

const words = (t: Text | undefined): number => (t ? t.fr.split(/\s+/).length : 0);
/** Seconds a reader needs for a stop's card and caption. */
const readingTime = (s: CareerStop): number =>
  2.5 +
  words(s.caption) / 5 +
  s.entries.reduce(
    (n, e) => n + 3 + words(e.role) + words(e.summary) + (e.bullets ?? []).reduce((b, x) => b + words(x), 0),
    0,
  ) /
    5;

/** Small pen loops, one per place worked from: the line travels. */
const loops =
  (n: number): PathFn =>
  u => {
    const th = TAU * n * u;
    const b = 17;
    return [((LOOP_WIDTH / TAU) * th - b * Math.sin(th)) * 1, -(b - b * Math.cos(th)) * 1.1];
  };

export function buildCareer(stops: readonly CareerStop[], today: YearMonth): Timeline {
  const now = monthIndex(today);
  const story = new Story(1.05);
  story.thread('A', INK, 2.6, 3.1);
  story.thread('C', GOLD, 2.0, 41.3);
  // Second pens for the lifted strokes of a shape, so the line and the gold thread never break.
  story.thread('D', INK, 1.9, 17.9);
  story.thread('CD', GOLD, 1.5, 29.2);
  APPRENTICE_COLOURS.forEach((col, k) => {
    story.thread(`P${k}`, col, 1.2, 60 + k * 13);
  });
  const A = story.get('A');
  const C = story.get('C');
  const marks: StopMark[] = [];
  /** Month at which the gold thread, riding under the line, rejoins it; null when it is not drawn. */
  let rideUntil: number | null = null;

  /** While training lasts, the gold thread runs under whatever the ink line draws. */
  const ride = (width: number, dy: (u: number) => number, dur: number) => {
    if (rideUntil === null) return;
    story.add('C', u => [width * u, dy(u)], { raw: true, dur });
  };

  // Lead-in.
  story.caption({ fr: 'Ma carrière, d’un seul trait.', en: 'My career, in a single line.' }, 0.6, 4.2);
  story.T = 0.9;
  story.cue({ t: 1, kind: 'chord', notes: [48, 55], gap: 0.4, vel: 0.1, dur: 4 });
  story.T += story.add('A', u => [620 * u, 0], { speed: 140, w: u => 0.2 + 0.8 * Math.min(1, u * 5) });

  let prevEnd: number | null = null;
  stops.forEach((stop, index) => {
    const from = stopStart(stop);

    // Flight: to a stop far away, the line circles a globe on its way.
    if (index > 0 && stop.flight) {
      const x0 = A.x;
      const y0 = A.y;
      const fl = flight(CLIMB);
      const end = fl.path[fl.path.length - 1] as readonly [number, number];
      const d = story.add('A', poly(fl.path), { speed: 280 });
      details(story, 'D', fl.globe, x0, y0, Math.min(d, 4));
      story.blot(x0 + fl.wash[0], y0 + fl.wash[1], fl.wash[2] * 1.3, 'sky', story.T + 1, 0.55);
      if (stop.chapter) story.caption(stop.chapter, story.T, d + 0.4);
      ride(end[0], u => CLIMB * u, d);
      story.T += d;
    } else if (index > 0) {
      // Connector: longer and calmer across a gap in the CV.
      const gap = Math.max(0, from - (prevEnd ?? from));
      const speed = gap > 2 ? 150 : 210;
      const len = Math.max(170 + Math.min(gap, 12) * 30, stop.chapter ? CHAPTER_TIME * speed : 0);
      const wave = gap > 2 || stop.chapter ? 7 : 0;
      const dy = (u: number) => CLIMB * ease(u) + wave * Math.sin(u * TAU * 2) * (1 - u);
      const d = story.add('A', u => [len * u, dy(u)], { speed });
      if (stop.chapter) story.caption(stop.chapter, story.T, d + 0.4);
      if (rideUntil !== null && from >= rideUntil) {
        // Training is over: the gold thread rejoins the line and fades.
        story.add('C', u => [len * u, dy(u) - RIDE * ease(u)], { raw: true, dur: d, a: u => 1 - ease(u) * 0.9 });
        rideUntil = null;
      } else {
        ride(len, dy, d);
      }
      story.T += d;
    }

    const t0 = story.T;
    const x = A.x;
    const y = A.y;
    const t = Math.min(1, index / (stops.length - 1));
    const root = [60, 62, 64, 65, 67, 69, 71, 72][index % 8] ?? 60;
    story.cue({
      t: t0 + 0.1,
      kind: 'chord',
      notes: [root, root + 7, root + 12 + Math.round(t * 4)],
      gap: 0.2,
      vel: 0.09,
      dur: 3,
    });

    const shapes: ShapeMark[] = [];
    const places = (stop.remoteFrom ?? []).filter(p => p !== 'on-site').length;
    const training = stop.kind === 'training';

    // Travel loops, unless a training stop draws them under its mortarboard.
    if (places > 0 && !training) {
      const d = story.add('A', loops(places), { speed: 230 });
      ride(places * LOOP_WIDTH, () => 0, d);
      story.T += d;
    }

    for (const key of stop.motifs) {
      if (key === 'apprentices') {
        story.T += apprentices(story);
        continue;
      }
      if (!hasShape(key)) continue;
      const sh = shapeOf(key);
      const startX = A.x;
      const startY = A.y;
      const corner = [sh.outline, ...sh.details].flat();
      shapes.push({
        t: story.T,
        x: startX + Math.max(...corner.map(p => p[0])),
        y: startY + Math.min(...corner.map(p => p[1])),
      });
      const exit = sh.outline.at(-1) ?? [0, 0];
      let d: number;
      if (training) {
        C.x = startX;
        C.y = startY;
        d = story.add('C', strokes([sh.outline]), { speed: 200 });
        const width = exit[0];
        story.add('A', places > 0 ? scaleX(loops(places), width / (places * LOOP_WIDTH)) : u => [width * u, 0], {
          raw: true,
          dur: d,
        });
        const last = stop.entries[0];
        rideUntil = last.to ? monthIndex(last.to) : now;
      } else {
        d = story.add('A', strokes([sh.outline]), { speed: 210 });
        ride(exit[0], () => 0, d);
      }
      d = Math.max(d, details(story, training ? 'CD' : 'D', sh.details, startX, startY, d));
      story.blot(startX + sh.wash[0], startY + sh.wash[1], sh.wash[2] * 1.3, sh.pigment, story.T + d * 0.5, 0.55);
      story.T += d;
    }

    // Let the reader finish the card: the pen keeps going, slowly.
    const spent = story.T - t0;
    const need = readingTime(stop);
    if (need > spent) {
      const d = need - spent;
      const len = 26 * d;
      story.add('A', u => [len * u, 3 * Math.sin(u * TAU * Math.max(1, Math.round(d / 4)))], { raw: true, dur: d });
      ride(len, () => 0, d);
      story.T += d;
    }

    // The caption stays up until the next stop begins.
    story.caption(stop.caption, t0 + 0.4, story.T - t0 + 1);
    marks.push({ index, t0, t1: story.T, x, y, endX: A.x, month: from, shapes });
    prevEnd = Math.max(prevEnd ?? 0, stopEnd(stop, now));
  });

  // Horizon: the line goes on, softer, past the last stop.
  {
    const D = 7;
    const x0 = A.x;
    const y0 = A.y;
    story.add('A', u => [900 * u, -120 * ease(u)], {
      raw: true,
      dur: D,
      a: u => 1 - ease(u) * 0.95,
      w: u => 1 - 0.6 * u,
    });
    story.blot(x0 + 700, y0 - 160, 1300, 'dawn', story.T + 1, 0.7);
    story.cue({ t: story.T + 0.4, kind: 'chord', notes: [48, 55, 64, 71, 76], gap: 0.45, vel: 0.08, dur: 5 });
    story.T += D;
  }
  const end = story.T;
  story.caption({ fr: 'Prendre du recul.', en: 'Step back.' }, end + 1.4, 4.5);
  story.caption(
    { fr: 'Chaque poste a laissé sa forme sur la ligne.', en: 'Every job left its shape on the line.' },
    end + 6.5,
    Infinity,
  );
  story.cue({ t: end + 1.2, kind: 'chord', notes: [48, 55, 60, 64, 67, 72], gap: 0.22, vel: 0.1, dur: 6 });
  story.finish();
  return { story, stops: marks, end, today: now };
}

/**
 * The month the pen has reached at time t: a stop holds its start month, matching its card,
 * and the months roll by along the connector to the next stop, then on to today.
 */
export function monthAt({ stops, end, today }: Timeline, t: number): number {
  const first = stops[0];
  if (!first || t <= first.t0) return first?.month ?? today;
  for (let i = 0; i < stops.length; i++) {
    const m = stops[i] as StopMark;
    const next = stops[i + 1];
    const [t1, to] = next ? [next.t0, next.month] : [end, today];
    if (t < m.t1) return m.month;
    if (t < t1) return m.month + (to - m.month) * ((t - m.t1) / (t1 - m.t1));
  }
  return today;
}

const scaleX =
  (fn: PathFn, k: number): PathFn =>
  u => {
    const [x, y] = fn(u);
    return [x * k, y];
  };

/**
 * Draws a shape's lifted strokes with a second pen, setting off while the outline is still being drawn and
 * finishing about when it does, however dense the details. Returns when they end, from the start of the shape.
 */
function details(story: Story, pen: string, list: readonly Stroke[], x: number, y: number, outlineDur: number): number {
  if (!list.length) return 0;
  const th = story.get(pen);
  th.x = x;
  th.y = y;
  const lag = outlineDur * DETAIL_LAG;
  const dur = Math.min(inkLength(list) / DETAIL_SPEED, Math.max(outlineDur * (1 - DETAIL_LAG), 2.5));
  story.add(pen, strokes(list), { t0: story.T + lag, dur });
  return lag + dur;
}

/** Teaching: the line carries on while apprentice threads branch off it and go their own way. */
function apprentices(story: Story): number {
  const A = story.get('A');
  const L = 1100;
  const x0 = A.x;
  const y0 = A.y;
  const wave = (f: number) => -10 * Math.sin(f * TAU * 1.5);
  const D = story.add('A', u => [L * u, wave(u)], { speed: 170 });
  [0.12, 0.32, 0.52].forEach((f, k) => {
    const P = story.get(`P${k}`);
    P.x = x0 + L * f;
    P.y = y0 + wave(f);
    const len = L * (1 - f) * 1.05;
    const lift = 50 + 34 * k;
    story.add(
      `P${k}`,
      u => [len * u, -lift * ease(Math.min(1, u * 2.2)) + 8 * Math.sin(u * TAU * 2) - wave(f) + wave(f + (1 - f) * u)],
      { raw: true, t0: story.T + f * D, dur: (1 - f) * D, a: u => 1 - ease(u) * 0.8, w: u => Math.min(1, 0.2 + u * 6) },
    );
    story.cue({ t: story.T + f * D, kind: 'note', note: [79, 83, 86][k] ?? 79, vel: 0.07, dur: 2 });
  });
  story.blot(x0 + L * 0.55, y0 - 90, 900, 'dawn', story.T + D * 0.4, 0.7);
  return D;
}
