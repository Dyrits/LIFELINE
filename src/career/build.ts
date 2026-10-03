import type { CareerStop, Text, YearMonth } from '../data/types';
import { ease, TAU } from '../engine/math';
import { type PathFn, Story, strokes } from '../engine/story';
import { hasShape, shapeOf } from './motifs';

export const INK = '#1d1b26';
export const RED = '#b3262b';
export const GOLD = '#c98d17';
const APPRENTICE_COLOURS = [RED, GOLD, '#4f6b8a'] as const;

/** Where and when a stop is drawn: the card is pinned at (x, y) and open from t0 until the next stop starts. */
export type StopMark = Readonly<{ index: number; t0: number; t1: number; x: number; y: number }>;

export type Timeline = Readonly<{ story: Story; stops: readonly StopMark[]; end: number }>;

/** Distance under the ink line at which the gold training thread rides. */
const RIDE = 14;
/** Each stop starts a little higher: the career climbs. */
const CLIMB = -28;
const LOOP_WIDTH = 64;

export const monthIndex = (ym: YearMonth): number => {
  const [y, m] = ym.split('-').map(Number);
  return (y ?? 0) * 12 + (m ?? 1) - 1;
};

const stopStart = (s: CareerStop): number => Math.min(...s.entries.map(e => monthIndex(e.from)));
const stopEnd = (s: CareerStop, today: number): number =>
  Math.max(...s.entries.map(e => (e.to ? monthIndex(e.to) : today)));

const words = (t: Text | undefined): number => (t ? t.fr.split(/\s+/).length : 0);
/** Seconds a reader needs for a stop's card. */
const readingTime = (s: CareerStop): number =>
  1.5 +
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
  story.caption({ fr: 'Une carrière, tracée d’un seul trait.', en: 'A career, drawn in a single line.' }, 0.6, 5);
  story.T = 0.9;
  story.cue({ t: 1, kind: 'chord', notes: [48, 55], gap: 0.4, vel: 0.1, dur: 4 });
  story.T += story.add('A', u => [620 * u, 0], { speed: 140, w: u => 0.2 + 0.8 * Math.min(1, u * 5) });

  let prevEnd: number | null = null;
  stops.forEach((stop, index) => {
    const from = stopStart(stop);

    // Connector: longer and calmer across a gap in the CV.
    if (index > 0) {
      const gap = Math.max(0, from - (prevEnd ?? from));
      const len = 170 + Math.min(gap, 12) * 30;
      const wave = gap > 2 ? 7 : 0;
      const dy = (u: number) => CLIMB * ease(u) + wave * Math.sin(u * TAU * 2) * (1 - u);
      const d = story.add('A', u => [len * u, dy(u)], { speed: gap > 2 ? 150 : 210 });
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
      const exit = sh.strokes[sh.strokes.length - 1]?.at(-1) ?? [0, 0];
      let d: number;
      if (training) {
        C.x = startX;
        C.y = startY;
        d = story.add('C', strokes(sh.strokes), { speed: 200 });
        const width = exit[0];
        story.add('A', places > 0 ? scaleX(loops(places), width / (places * LOOP_WIDTH)) : u => [width * u, 0], {
          raw: true,
          dur: d,
        });
        const last = stop.entries[0];
        rideUntil = last.to ? monthIndex(last.to) : now;
      } else {
        d = story.add('A', strokes(sh.strokes), { speed: 210 });
        ride(exit[0], () => 0, d);
      }
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

    marks.push({ index, t0, t1: story.T, x, y });
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
  return { story, stops: marks, end };
}

const scaleX =
  (fn: PathFn, k: number): PathFn =>
  u => {
    const [x, y] = fn(u);
    return [x * k, y];
  };

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
