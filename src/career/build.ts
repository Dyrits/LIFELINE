import type { CareerStop, Text, YearMonth } from '../data/types';
import { ease, TAU } from '../engine/math';
import { poly, Story, strokes } from '../engine/story';
import { flight, hasShape, inkLength, type Shape, type Stroke, shapeOf } from './motifs';

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
/** Room along the line for each map pin and the name written above it. */
const PIN_GAP = 118;
/** The detail pen sets off once the outline is this far along, and draws at least this fast. */
const DETAIL_LAG = 0.35;
const DETAIL_SPEED = 250;
/** A chapter line is told along the connector before its stop, which stretches to give time to read it. */
const CHAPTER_TIME = 4.5;
/** A signpost is passed slowly enough to read both boards. */
const SIGNPOST_TIME = 3;

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

/**
 * Map pins, one per place worked from: the line rises into each pin and comes back down to its point. Returns the
 * path, `width` long, and how far along its length the pen reaches the top of each pin.
 */
function pins(n: number, width: number): { path: (readonly [number, number])[]; tops: number[] } {
  const [c, r] = [30, 11];
  // Where the sides of the pin meet its head, measured from straight down.
  const side = Math.acos(r / c);
  const start = Math.atan2(Math.cos(side), Math.sin(side));
  const path: (readonly [number, number])[] = [[0, 0]];
  const tops: number[] = [];
  let len = 0;
  const to = (p: readonly [number, number]) => {
    const q = path[path.length - 1] ?? p;
    len += Math.hypot(p[0] - q[0], p[1] - q[1]);
    path.push(p);
  };
  for (let i = 0; i < n; i++) {
    const x = (width * (i + 0.5)) / n;
    to([x, 0]);
    // Up the right side, over the head, down the left side.
    const sweep = TAU - (Math.PI - 2 * start);
    for (let k = 0; k <= 20; k++) {
      const a = start - (sweep * k) / 20;
      to([x + r * Math.cos(a), -c + r * Math.sin(a)]);
      if (k === 10) tops.push(len);
    }
    to([x, 0]);
  }
  to([width, 0]);
  return { path, tops: tops.map(t => t / len) };
}

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
    story.add('C', u => [width * u, dy(u)], { dur, raw: true });
  };

  // Lead-in.
  story.caption({ en: 'My career, in a single line.', fr: 'Ma carrière, d’un seul trait.' }, 0.6, 4.2);
  story.T = 0.9;
  story.cue({ dur: 4, gap: 0.4, kind: 'chord', notes: [48, 55], t: 1, vel: 0.1 });
  story.T += story.add('A', u => [620 * u, 0], { speed: 140, w: u => 0.2 + 0.8 * Math.min(1, u * 5) });

  let prevEnd: number | null = null;
  stops.forEach((stop, index) => {
    const from = stopStart(stop);

    // Flight: to a stop far away, the line flies from place to place over a map, its tip a plane.
    if (index > 0 && stop.route) {
      const route = stop.route;
      const x0 = A.x;
      const y0 = A.y;
      const fl = flight(
        route.map(p => p.at),
        CLIMB,
      );
      const at = (p: readonly [number, number]) => [x0 + p[0], y0 + p[1]] as const;
      const [mx, my, mr] = fl.map;
      story.print({
        land: 'sage',
        r: mr,
        rings: fl.land.map(r => r.map(at)),
        sea: 'sky',
        t: story.T,
        x: x0 + mx,
        y: y0 + my,
      });
      let d = 0;
      const arrivals = fl.legs.map((leg, i) => {
        const last = i === 0 || i === fl.legs.length - 1;
        d += story.add('A', poly(leg.map(at)), { abs: true, speed: last ? 260 : 190, t0: story.T + d });
        return story.T + d;
      });
      route.forEach((place, i) => {
        const [px, py] = at(fl.places[i] ?? [0, 0]);
        const t = arrivals[i] ?? story.T;
        // A dot where the line reaches the place, drawn before it reaches the next one, then its name.
        const dur = Math.min(0.3, (arrivals[i + 1] ?? Infinity) - t - 0.02);
        story.add('D', u => [px + 3.5 * Math.cos(TAU * u), py + 3.5 * Math.sin(TAU * u)], {
          abs: true,
          dur,
          raw: true,
          t0: t,
        });
        story.label({ side: place.side, t, text: place.name, x: px, y: py });
      });
      story.plane({ pen: 'A', t0: arrivals[0] ?? story.T, t1: arrivals[route.length - 1] ?? story.T + d });
      const end = fl.legs.at(-1)?.at(-1) ?? [0, 0];
      if (stop.chapter) story.caption(stop.chapter, story.T, d + 0.4);
      ride(end[0], u => CLIMB * u, d);
      story.T += d;
    } else if (index > 0) {
      const told = story.T;
      // An emblem on the way, drawn while the chapter starts being told.
      let emblem = 0;
      if (stop.way && hasShape(stop.way)) {
        const sh = shapeOf(stop.way);
        story.T += story.add('A', u => [110 * u, 0], { speed: 180 });
        const [sx, sy] = [A.x, A.y];
        const d = story.add('A', strokes([sh.outline]), { speed: 210 });
        ride(sh.outline.at(-1)?.[0] ?? 0, () => 0, d);
        emblem = Math.max(d, details(story, 'D', sh.details, sx, sy, d));
        washes(story, sh, sx, sy, emblem);
        story.T += emblem;
      }
      // Connector: longer and calmer across a gap in the CV.
      const gap = Math.max(0, from - (prevEnd ?? from));
      const speed = gap > 2 ? 150 : 210;
      const len = Math.max(
        170 + Math.min(gap, 12) * 30,
        stop.chapter ? (CHAPTER_TIME - emblem) * speed : 0,
        stop.signpost ? SIGNPOST_TIME * speed : 0,
      );
      const wave = gap > 2 || stop.chapter ? 7 : 0;
      const dy = (u: number) => CLIMB * ease(u) + wave * Math.sin(u * TAU * 2) * (1 - u);
      const [x0, y0] = [A.x, A.y];
      const d = story.add('A', u => [len * u, dy(u)], { speed });
      const last = stops[index - 1];
      if (stop.signpost && last) signpost(story, x0 + len / 2, y0 + dy(0.5), last.place, stop.place, d);
      if (stop.chapter) story.caption(stop.chapter, told, story.T - told + d + 0.4);
      if (rideUntil !== null && from >= rideUntil) {
        // Training is over: the gold thread rejoins the line and fades.
        story.add('C', u => [len * u, dy(u) - RIDE * ease(u)], { a: u => 1 - ease(u) * 0.9, dur: d, raw: true });
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
      dur: 3,
      gap: 0.2,
      kind: 'chord',
      notes: [root, root + 7, root + 12 + Math.round(t * 4)],
      t: t0 + 0.1,
      vel: 0.09,
    });

    const shapes: ShapeMark[] = [];
    const places = (stop.remoteFrom ?? []).filter((p): p is Text => p !== 'on-site');
    const training = stop.kind === 'training';

    // Working from several places: a map pin for each, its town written above it.
    if (places.length > 0) {
      const width = places.length * PIN_GAP;
      const { path, tops } = pins(places.length, width);
      const [x0, y0] = [A.x, A.y];
      const d = story.add('A', strokes([path]), { speed: 230 });
      places.forEach((place, i) => {
        const x = x0 + (width * (i + 0.5)) / places.length;
        const t = story.T + (tops[i] ?? 0) * d;
        story.blot(x, y0 - 30, 60, 'red', t, 0.6);
        story.add('D', u => [x + 4 * Math.cos(TAU * u), y0 - 30 + 4 * Math.sin(TAU * u)], {
          abs: true,
          dur: 0.2,
          raw: true,
          t0: t,
        });
        story.label({ side: 'above', t, text: town(place), x, y: y0 - 48 });
      });
      ride(width, () => 0, d);
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
        story.add('A', u => [width * u, 0], { dur: d, raw: true });
        const last = stop.entries[0];
        rideUntil = last.to ? monthIndex(last.to) : now;
      } else {
        d = story.add('A', strokes([sh.outline]), { speed: 210 });
        ride(exit[0], () => 0, d);
      }
      d = Math.max(d, details(story, training ? 'CD' : 'D', sh.details, startX, startY, d));
      washes(story, sh, startX, startY, d);
      story.T += d;
    }

    // Let the reader finish the card: the pen keeps going, slowly.
    const spent = story.T - t0;
    const need = readingTime(stop);
    if (need > spent) {
      const d = need - spent;
      const len = 26 * d;
      story.add('A', u => [len * u, 3 * Math.sin(u * TAU * Math.max(1, Math.round(d / 4)))], { dur: d, raw: true });
      ride(len, () => 0, d);
      story.T += d;
    }

    // The caption stays up until the next stop begins.
    story.caption(stop.caption, t0 + 0.4, story.T - t0 + 1);
    marks.push({ endX: A.x, index, month: from, shapes, t0, t1: story.T, x, y });
    prevEnd = Math.max(prevEnd ?? 0, stopEnd(stop, now));
  });

  // Horizon: the line goes on, softer, past the last stop.
  {
    const D = 7;
    const x0 = A.x;
    const y0 = A.y;
    story.add('A', u => [900 * u, -120 * ease(u)], {
      a: u => 1 - ease(u) * 0.95,
      dur: D,
      raw: true,
      w: u => 1 - 0.6 * u,
    });
    story.blot(x0 + 700, y0 - 160, 1300, 'dawn', story.T + 1, 0.7);
    story.cue({ dur: 5, gap: 0.45, kind: 'chord', notes: [48, 55, 64, 71, 76], t: story.T + 0.4, vel: 0.08 });
    story.T += D;
  }
  const end = story.T;
  story.caption({ en: 'Step back.', fr: 'Prendre du recul.' }, end + 1.4, 4.5);
  story.caption(
    { en: 'Every job left its shape on the line.', fr: 'Chaque poste a laissé sa forme sur la ligne.' },
    end + 6.5,
    Infinity,
  );
  story.cue({ dur: 6, gap: 0.22, kind: 'chord', notes: [48, 55, 60, 64, 67, 72], t: end + 1.2, vel: 0.1 });
  story.finish();
  return { end, stops: marks, story, today: now };
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

/** The town of a place written "Town, Country". */
const town = (place: Text): Text => ({
  en: place.en.split(', ')[0] ?? place.en,
  fr: place.fr.split(', ')[0] ?? place.fr,
});

/** Lays a shape's watercolour wash halfway through drawing it, and its small coloured spots once it is done. */
function washes(story: Story, sh: Shape, x: number, y: number, dur: number): void {
  story.blot(x + sh.wash[0], y + sh.wash[1], sh.wash[2] * 1.3, sh.pigment, story.T + dur * 0.5, 0.55);
  for (const [sx, sy, size, pigment] of sh.spots ?? []) story.blot(x + sx, y + sy, size, pigment, story.T + dur, 0.8);
}

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
  story.add(pen, strokes(list), { dur, t0: story.T + lag });
  return lag + dur;
}

/**
 * A short trip: a signpost standing on the line, one board pointing back to where the line comes from, the other
 * ahead to where it goes, drawn by the detail pen as the line passes it.
 */
function signpost(story: Story, x: number, y: number, from: Text, to: Text, dur: number): void {
  // A board from x0 to x1, its pointed end on the side it points to, centred at height cy.
  const board = (x0: number, x1: number, cy: number, left: boolean): Stroke => {
    const [h, tip] = [12, 14];
    return left
      ? [
          [x0, cy],
          [x0 + tip, cy - h],
          [x1, cy - h],
          [x1, cy + h],
          [x0 + tip, cy + h],
          [x0, cy],
        ]
      : [
          [x1, cy],
          [x1 - tip, cy - h],
          [x0, cy - h],
          [x0, cy + h],
          [x1 - tip, cy + h],
          [x1, cy],
        ];
  };
  // The post, two lines, hidden behind the boards.
  const post = ([y0, y1]: readonly [number, number]): Stroke[] => [
    [
      [-3, y0],
      [-3, y1],
    ],
    [
      [3, y1],
      [3, y0],
    ],
  ];
  const list: Stroke[] = [
    ...(
      [
        [0, -60],
        [-84, -96],
        [-120, -134],
      ] as const
    ).flatMap(post),
    board(-82, 34, -108, true),
    board(-34, 82, -72, false),
  ].map(s => s.map(([px, py]) => [x + px, y + py] as const));
  const t0 = story.T + dur * 0.15;
  const draw = Math.min(2.2, dur * 0.5);
  story.add('D', strokes(list), { abs: true, dur: draw, t0 });
  story.blot(x, y - 90, 200, 'ochre', t0 + draw * 0.6, 0.5);
  story.label({ side: 'centre', t: t0 + draw * 0.75, text: from, x: x - 36, y: y - 108 });
  story.label({ side: 'centre', t: t0 + draw, text: to, x: x + 36, y: y - 72 });
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
      { a: u => 1 - ease(u) * 0.8, dur: (1 - f) * D, raw: true, t0: story.T + f * D, w: u => Math.min(1, 0.2 + u * 6) },
    );
    story.cue({ dur: 2, kind: 'note', note: [79, 83, 86][k] ?? 79, t: story.T + f * D, vel: 0.07 });
  });
  story.blot(x0 + L * 0.55, y0 - 90, 900, 'dawn', story.T + D * 0.4, 0.7);
  return D;
}
