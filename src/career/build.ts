import type { CareerStop, Text, YearMonth } from '../data/types';
import { CAREER_CAPTIONS } from '../data/ui';
import { ease, type Point, TAU } from '../engine/math';
import { poly, Story, strokes, type Thread } from '../engine/story';
import * as month from '../month';
import { flight } from './flight';
import { inkLength, type Shape, type Stroke, shape } from './motifs';

/** The inks of the career. */
const COLOUR = {
  apprentices: { Apprentice0: '#b3262b', Apprentice1: '#c98d17', Apprentice2: '#4f6b8a' },
  gold: '#c98d17',
  ink: '#1d1b26',
} as const;

/** The pens that draw a career, by role. */
export const THREAD = {
  /** Three threads branching off the line while Dylan teaches. */
  Apprentices: ['Apprentice0', 'Apprentice1', 'Apprentice2'],
  /** The training thread. */
  Gold: 'Gold',
  /** The second pen of the training thread, for the lifted strokes of its shapes. */
  GoldDetail: 'GoldDetail',
  /** The line itself. */
  Ink: 'Ink',
  /** The second pen of the line, for the lifted strokes of its shapes. */
  InkDetail: 'InkDetail',
} as const;
/** The name of a pen that draws the career. */
export type ThreadName =
  | typeof THREAD.Ink
  | typeof THREAD.Gold
  | typeof THREAD.InkDetail
  | typeof THREAD.GoldDetail
  | (typeof THREAD.Apprentices)[number];

/** When a shape starts, and its top-right corner on the drawing. */
/** A shape on the line: when it starts, where the line enters it (`start`), and its top-right corner (x, y). */
export type ShapeMark = Readonly<{ time: number; start: number; x: number; y: number }>;

/**
 * Where and when a stop is drawn: from the start's time and x to the end's, at height y.
 * `month` is when the stop began, counted in months since year 0; `shapes` follow the stop's motifs, in order.
 */
export type StopMark = Readonly<{
  index: number;
  start: Readonly<{ time: number; x: number }>;
  end: Readonly<{ time: number; x: number }>;
  y: number;
  month: number;
  shapes: readonly ShapeMark[];
}>;

/** A career built as a story, with where each stop lies, when the drawing ends and the month it ends on. */
export type Timeline = Readonly<{ story: Story<ThreadName>; stops: readonly StopMark[]; end: number; today: number }>;

/** Distance under the ink line at which the gold training thread rides. */
const RIDE = 14;
/** Each stop starts a little higher: the career climbs. */
const CLIMB = -28;
/** Room along the line for each map pin and the name written above it. */
const PIN_GAP = 118;
/** The detail pen sets off once the outline is this far along, and draws at least this fast. */
const DETAIL = { lag: 0.35, speed: 250 } as const;
/** Seconds some stretches of line last at least. */
const TIME = {
  /** A chapter line is told along the connector before its stop, which stretches to give time to read it. */
  chapter: 4.5,
  /** A signpost is passed slowly enough to read both boards. */
  signpost: 3,
} as const;

/** The months a stop spans, counted from year 0. */
const period = {
  end: (stop: CareerStop, today: number): number =>
    Math.max(...stop.entries.map(entry => (entry.to ? month.index(entry.to) : today))),
  start: (stop: CareerStop): number => Math.min(...stop.entries.map(entry => month.index(entry.from))),
};

const words = (text: Text | undefined): number => (text ? text.fr.split(/\s+/).length : 0);
/** Seconds a reader needs for a stop's card and caption. */
const readingTime = (stop: CareerStop): number =>
  2.5 +
  words(stop.caption) / 5 +
  stop.entries.reduce(
    (sum, entry) =>
      sum +
      3 +
      words(entry.role) +
      words(entry.summary) +
      (entry.bullets ?? []).reduce((bullets, bullet) => bullets + words(bullet), 0),
    0,
  ) /
    5;

/** What the steps of a career share while it is built. */
type Build = {
  readonly story: Story<ThreadName>;
  readonly ink: Thread;
  readonly gold: Thread;
  /** The current month, counted from year 0. */
  readonly today: number;
  /** Month at which the gold thread, riding under the line, rejoins it; null when it is not drawn. */
  rideUntil: number | null;
};

/** Builds the whole career as a story: the line runs through every stop, in order, up to `today`. */
export function buildCareer(stops: readonly CareerStop[], today: YearMonth): Timeline {
  const story = new Story<ThreadName>(1.05);
  const ink = story.threads.add(THREAD.Ink, COLOUR.ink, 2.6, 3.1);
  const gold = story.threads.add(THREAD.Gold, COLOUR.gold, 2.0, 41.3);
  // Second pens for the lifted strokes of a shape, so the line and the gold thread never break.
  story.threads.add(THREAD.InkDetail, COLOUR.ink, 1.9, 17.9);
  story.threads.add(THREAD.GoldDetail, COLOUR.gold, 1.5, 29.2);
  THREAD.Apprentices.forEach((name, index) => {
    story.threads.add(name, COLOUR.apprentices[name], 1.2, 60 + index * 13);
  });
  const build: Build = { gold, ink, rideUntil: null, story, today: month.index(today) };
  const marks: StopMark[] = [];

  leadIn(build);
  let previousEnd: number | null = null;
  stops.forEach((stop, index) => {
    const startMonth = period.start(stop);
    const previous = stops[index - 1];
    if (previous && stop.route) fly(build, stop);
    else if (previous) connect(build, stop, previous, Math.max(0, startMonth - (previousEnd ?? startMonth)));
    marks.push(drawStop(build, stop, index, stops.length, startMonth));
    previousEnd = Math.max(previousEnd ?? 0, period.end(stop, build.today));
  });
  horizon(build);
  const end = story.time;
  ending(build, end);
  story.finish();
  return { end, stops: marks, story, today: build.today };
}

/** While training lasts, the gold thread runs under whatever the ink line draws. */
function ride(build: Build, width: number, rise: (progress: number) => number, duration: number): void {
  if (build.rideUntil === null) return;
  build.story.add(THREAD.Gold, progress => [width * progress, rise(progress)], { duration, raw: true });
}

/** The line sets off, thin at first, as the career is announced. */
function leadIn({ story }: Build): void {
  story.captions.add({ duration: 4.2, text: CAREER_CAPTIONS.opening, time: 0.6 });
  story.time = 0.9;
  story.cues.add({ duration: 4, gap: 0.4, kind: 'Chord', notes: [48, 55], time: 1, velocity: 0.1 });
  story.time += story.add(THREAD.Ink, progress => [620 * progress, 0], {
    speed: 140,
    width: progress => 0.2 + 0.8 * Math.min(1, progress * 5),
  });
}

/** To a stop far away, the line flies from place to place over a map, its tip a plane. */
function fly(build: Build, stop: CareerStop): void {
  const { story, ink } = build;
  const route = stop.route ?? [];
  const start = { x: ink.x, y: ink.y };
  const path = flight(
    route.map(place => place.at),
    CLIMB,
  );
  const shift = (point: Point) => [start.x + point[0], start.y + point[1]] as const;
  story.prints.add({
    land: 'Sage',
    radius: path.map.radius,
    rings: path.land.map(ring => ring.map(shift)),
    sea: 'Sky',
    time: story.time,
    x: start.x + path.map.x,
    y: start.y + path.map.y,
  });
  let duration = 0;
  const arrivals = path.legs.map((leg, index) => {
    const outer = index === 0 || index === path.legs.length - 1;
    duration += story.add(THREAD.Ink, poly(leg.map(shift)), {
      absolute: true,
      speed: outer ? 260 : 190,
      start: story.time + duration,
    });
    return story.time + duration;
  });
  route.forEach((place, index) => {
    const [x, y] = shift(path.places[index] ?? [0, 0]);
    const time = arrivals[index] ?? story.time;
    // A dot where the line reaches the place, drawn before it reaches the next one, then its name.
    story.add(THREAD.InkDetail, progress => [x + 3.5 * Math.cos(TAU * progress), y + 3.5 * Math.sin(TAU * progress)], {
      absolute: true,
      duration: Math.min(0.3, (arrivals[index + 1] ?? Infinity) - time - 0.02),
      raw: true,
      start: time,
    });
    story.labels.add({ side: place.side, text: place.name, time, x, y });
  });
  story.planes.add({
    end: arrivals[route.length - 1] ?? story.time + duration,
    pen: THREAD.Ink,
    start: arrivals[0] ?? story.time,
  });
  const landing = path.legs.at(-1)?.at(-1) ?? [0, 0];
  if (stop.chapter) story.captions.add({ duration: duration + 0.4, text: stop.chapter, time: story.time });
  ride(build, landing[0], progress => CLIMB * progress, duration);
  story.time += duration;
}

/** The stretch of line from the last stop to this one: longer and calmer across a gap in the CV, of `gap` months. */
function connect(build: Build, stop: CareerStop, previous: CareerStop, gap: number): void {
  const { story, ink } = build;
  const told = story.time;
  // An emblem on the way, drawn while the chapter starts being told.
  let emblem = 0;
  if (stop.way) {
    const way = shape.of(stop.way);
    story.time += story.add(THREAD.Ink, progress => [110 * progress, 0], { speed: 180 });
    const [x, y] = [ink.x, ink.y];
    const duration = story.add(THREAD.Ink, strokes([way.outline]), { speed: 210 });
    // The pen flies as a plane while it is off the line, round the emblem.
    const aloft = ink.points.filter(point => point.time >= story.time && point.y < y - 3);
    const [takeOff, landing] = [aloft[0]?.time, aloft.at(-1)?.time];
    if (takeOff !== undefined && landing !== undefined)
      story.planes.add({ end: landing, pen: THREAD.Ink, start: takeOff });
    ride(build, exit(way), () => 0, duration);
    emblem = Math.max(duration, details(story, THREAD.InkDetail, way.details, x, y, duration));
    washes(story, way, x, y, emblem);
    for (const [wordX, wordY, text] of way.words ?? [])
      story.labels.add({ side: 'Centre', text, time: story.time + emblem, x: x + wordX, y: y + wordY });
    story.time += emblem;
  }
  const speed = gap > 2 ? 150 : 210;
  const length = Math.max(
    170 + Math.min(gap, 12) * 30,
    stop.chapter ? (TIME.chapter - emblem) * speed : 0,
    stop.signpost ? TIME.signpost * speed : 0,
  );
  const wave = gap > 2 || stop.chapter ? 7 : 0;
  const rise = (progress: number) =>
    CLIMB * ease.inOut(progress) + wave * Math.sin(progress * TAU * 2) * (1 - progress);
  const [x, y] = [ink.x, ink.y];
  const duration = story.add(THREAD.Ink, progress => [length * progress, rise(progress)], { speed });
  if (stop.signpost) signpost(story, x + length / 2, y + rise(0.5), previous.place, stop.place, duration);
  if (stop.chapter)
    story.captions.add({ duration: story.time - told + duration + 0.4, text: stop.chapter, time: told });
  if (build.rideUntil !== null && period.start(stop) >= build.rideUntil) {
    // Training is over: the gold thread rejoins the line and fades.
    story.add(THREAD.Gold, progress => [length * progress, rise(progress) - RIDE * ease.inOut(progress)], {
      alpha: progress => 1 - ease.inOut(progress) * 0.9,
      duration,
      raw: true,
    });
    build.rideUntil = null;
  } else {
    ride(build, length, rise, duration);
  }
  story.time += duration;
}

/** Draws a stop: its chord, its map pins, its shapes, and the line lingering while its card is read. */
function drawStop(build: Build, stop: CareerStop, index: number, count: number, startMonth: number): StopMark {
  const { story, ink } = build;
  const start = { time: story.time, x: ink.x };
  const y = ink.y;
  const root = [60, 62, 64, 65, 67, 69, 71, 72][index % 8] ?? 60;
  story.cues.add({
    duration: 3,
    gap: 0.2,
    kind: 'Chord',
    notes: [root, root + 7, root + 12 + Math.round(Math.min(1, index / (count - 1)) * 4)],
    time: start.time + 0.1,
    velocity: 0.09,
  });

  const places = (stop.remoteFrom ?? []).filter((place): place is Text => place !== 'OnSite');
  if (places.length > 0) pinPlaces(build, places);
  const shapes: ShapeMark[] = [];
  // The shapes of a stop told as one share a single wash, spread under them all; a split stop's jobs keep their own.
  const spread = !stop.split && stop.motifs.filter(key => key !== 'Apprentices').length > 1;
  const under: { pigment: Shape['pigment']; left: number; right: number; y: number; size: number }[] = [];
  for (const key of stop.motifs) {
    if (key === 'Apprentices') {
      story.time += apprentices(story);
      continue;
    }
    const drawn = shape.of(key);
    const size = drawn.wash[2] * 1.3;
    const centre = ink.x + drawn.wash[0];
    under.push({
      left: centre - size / 2,
      pigment: drawn.pigment,
      right: centre + size / 2,
      size,
      y: ink.y + drawn.wash[1],
    });
    shapes.push(drawShape(build, drawn, stop, !spread));
  }
  const [first] = under;
  if (spread && first) {
    const [left, right] = [first.left, Math.max(...under.map(wash => wash.right))];
    const size = Math.max(...under.map(wash => wash.size));
    story.blots.add({
      alpha: 0.55,
      pigment: first.pigment,
      size,
      // A little wider than the shapes' own washes: a watercolour never reaches the edges of its box.
      stretch: (1.15 * (right - left)) / size,
      time: (shapes[0]?.time ?? start.time) + 1,
      x: (left + right) / 2,
      y: under.reduce((sum, wash) => sum + wash.y, 0) / under.length,
    });
  }
  linger(build, stop, start.time);

  // The caption stays up while the stop is drawn, and a moment after.
  story.captions.add({ duration: story.time - start.time + 1, text: stop.caption, time: start.time + 0.4 });
  return { end: { time: story.time, x: ink.x }, index, month: startMonth, shapes, start, y };
}

/** Working from several places: the line rises into a map pin for each, its town written above it. */
function pinPlaces(build: Build, places: readonly Text[]): void {
  const { story, ink } = build;
  const width = places.length * PIN_GAP;
  const { path, tops } = pins(places.length, width);
  const [startX, y] = [ink.x, ink.y];
  const duration = story.add(THREAD.Ink, strokes([path]), { speed: 230 });
  places.forEach((place, index) => {
    const x = startX + (width * (index + 0.5)) / places.length;
    const time = story.time + (tops[index] ?? 0) * duration;
    story.blots.add({ alpha: 0.6, pigment: 'Red', size: 60, time, x, y: y - 30 });
    story.add(THREAD.InkDetail, progress => [x + 4 * Math.cos(TAU * progress), y - 30 + 4 * Math.sin(TAU * progress)], {
      absolute: true,
      duration: 0.2,
      raw: true,
      start: time,
    });
    story.labels.add({ side: 'Above', text: town(place), time, x, y: y - 48 });
  });
  ride(build, width, () => 0, duration);
  story.time += duration;
}

/** Draws a shape on the line: by the gold thread for a training, which then rides under the line until it ends. */
function drawShape(build: Build, drawn: Shape, stop: CareerStop, wash = true): ShapeMark {
  const { story, ink, gold } = build;
  const [x, y] = [ink.x, ink.y];
  const corner = [drawn.outline, ...drawn.details].flat();
  const mark = {
    start: x,
    time: story.time,
    x: x + Math.max(...corner.map(point => point[0])),
    y: y + Math.min(...corner.map(point => point[1])),
  };
  const training = stop.kind === 'Training';
  let duration: number;
  if (training) {
    gold.x = x;
    gold.y = y;
    duration = story.add(THREAD.Gold, strokes([drawn.outline]), { speed: 200 });
    const width = exit(drawn);
    story.add(THREAD.Ink, progress => [width * progress, 0], { duration, raw: true });
    const last = stop.entries[0];
    build.rideUntil = last.to ? month.index(last.to) : build.today;
  } else {
    duration = story.add(THREAD.Ink, strokes([drawn.outline]), { speed: 210 });
    ride(build, exit(drawn), () => 0, duration);
  }
  duration = Math.max(
    duration,
    details(story, training ? THREAD.GoldDetail : THREAD.InkDetail, drawn.details, x, y, duration),
  );
  washes(story, drawn, x, y, duration, wash);
  story.time += duration;
  return mark;
}

/** Lets the reader finish the card: the pen keeps going, slowly. */
function linger(build: Build, stop: CareerStop, start: number): void {
  const { story } = build;
  const spent = story.time - start;
  const needed = readingTime(stop);
  if (needed <= spent) return;
  const duration = needed - spent;
  const length = 26 * duration;
  story.add(
    THREAD.Ink,
    progress => [length * progress, 3 * Math.sin(progress * TAU * Math.max(1, Math.round(duration / 4)))],
    { duration, raw: true },
  );
  ride(build, length, () => 0, duration);
  story.time += duration;
}

/** The line goes on, softer, past the last stop. */
function horizon({ story, ink }: Build): void {
  const duration = 7;
  const [x, y] = [ink.x, ink.y];
  story.add(THREAD.Ink, progress => [900 * progress, -120 * ease.inOut(progress)], {
    alpha: progress => 1 - ease.inOut(progress) * 0.95,
    duration,
    raw: true,
    width: progress => 1 - 0.6 * progress,
  });
  story.blots.add({ alpha: 0.7, pigment: 'Dawn', size: 1300, time: story.time + 1, x: x + 700, y: y - 160 });
  story.cues.add({
    duration: 5,
    gap: 0.45,
    kind: 'Chord',
    notes: [48, 55, 64, 71, 76],
    time: story.time + 0.4,
    velocity: 0.08,
  });
  story.time += duration;
}

/** Once the line is drawn, the camera steps back over the whole career. */
function ending({ story }: Build, end: number): void {
  // Seen whole, the line is too small for its place names: they overlap, so they fade as the camera steps back.
  const labels = story.labels.items;
  labels.forEach((label, index) => {
    labels[index] = { ...label, until: end + 1 };
  });
  story.captions.add({ duration: 4.5, text: CAREER_CAPTIONS.stepBack, time: end + 1.4 });
  story.captions.add({ duration: Infinity, text: CAREER_CAPTIONS.overview, time: end + 6.5 });
  story.cues.add({
    duration: 6,
    gap: 0.22,
    kind: 'Chord',
    notes: [48, 55, 60, 64, 67, 72],
    time: end + 1.2,
    velocity: 0.1,
  });
}

/** How far along the line a shape's outline ends. */
const exit = (drawn: Shape): number => drawn.outline.at(-1)?.[0] ?? 0;

/**
 * Map pins, one per place worked from: the line rises into each pin and comes back down to its point. Returns the path, `width` long, and how far along its length the pen reaches the top of each pin.
 */
function pins(count: number, width: number): Readonly<{ path: readonly Point[]; tops: readonly number[] }> {
  const [height, radius] = [30, 11];
  // Where the sides of the pin meet its head, measured from straight down.
  const sideAngle = Math.acos(radius / height);
  const startAngle = Math.atan2(Math.cos(sideAngle), Math.sin(sideAngle));
  const path: Point[] = [[0, 0]];
  const tops: number[] = [];
  let length = 0;
  const extend = (point: Point) => {
    const last = path[path.length - 1] ?? point;
    length += Math.hypot(point[0] - last[0], point[1] - last[1]);
    path.push(point);
  };
  for (let index = 0; index < count; index++) {
    const x = (width * (index + 0.5)) / count;
    extend([x, 0]);
    // Up the right side, over the head, down the left side.
    const sweep = TAU - (Math.PI - 2 * startAngle);
    for (let step = 0; step <= 20; step++) {
      const angle = startAngle - (sweep * step) / 20;
      extend([x + radius * Math.cos(angle), -height + radius * Math.sin(angle)]);
      if (step === 10) tops.push(length);
    }
    extend([x, 0]);
  }
  extend([width, 0]);
  return { path, tops: tops.map(top => top / length) };
}

/** The town of a place written "Town, Country". */
const town = (place: Text): Text => ({
  en: place.en.split(', ')[0] ?? place.en,
  fr: place.fr.split(', ')[0] ?? place.fr,
});

/** Lays a shape's watercolour wash halfway through drawing it, unless its stop spreads one under all its shapes, and its small coloured spots once it is done. */
function washes(story: Story<ThreadName>, drawn: Shape, x: number, y: number, duration: number, wash = true): void {
  if (wash)
    story.blots.add({
      alpha: 0.55,
      pigment: drawn.pigment,
      size: drawn.wash[2] * 1.3,
      time: story.time + duration * 0.5,
      x: x + drawn.wash[0],
      y: y + drawn.wash[1],
    });
  for (const [spotX, spotY, size, pigment] of drawn.spots ?? [])
    story.blots.add({ alpha: 0.8, pigment, size, time: story.time + duration, x: x + spotX, y: y + spotY });
}

/**
 * Draws a shape's lifted strokes with a second pen, setting off while the outline is still being drawn and finishing about when it does, however dense the details. Returns when they end, from the start of the shape.
 */
function details(
  story: Story<ThreadName>,
  pen: ThreadName,
  list: readonly Stroke[],
  x: number,
  y: number,
  outlineDuration: number,
): number {
  if (!list.length) return 0;
  const thread = story.threads.get(pen);
  thread.x = x;
  thread.y = y;
  const lag = outlineDuration * DETAIL.lag;
  const duration = Math.min(inkLength(list) / DETAIL.speed, Math.max(outlineDuration * (1 - DETAIL.lag), 2.5));
  story.add(pen, strokes(list), { duration, start: story.time + lag });
  return lag + duration;
}

/**
 * A short trip: a signpost standing on the line, one board pointing back to where the line comes from, the other ahead to where it goes, drawn by the detail pen as the line passes it.
 */
function signpost(story: Story<ThreadName>, x: number, y: number, from: Text, to: Text, duration: number): void {
  // A board from `start` to `end`, its pointed end on the side it points to, centred at height `middle`.
  const board = (start: number, end: number, middle: number, left: boolean): Stroke => {
    const [height, point] = [12, 14];
    return left
      ? [
          [start, middle],
          [start + point, middle - height],
          [end, middle - height],
          [end, middle + height],
          [start + point, middle + height],
          [start, middle],
        ]
      : [
          [end, middle],
          [end - point, middle - height],
          [start, middle - height],
          [start, middle + height],
          [end - point, middle + height],
          [end, middle],
        ];
  };
  // The post, two lines, hidden behind the boards.
  const post = ([bottom, top]: readonly [number, number]): Stroke[] => [
    [
      [-3, bottom],
      [-3, top],
    ],
    [
      [3, top],
      [3, bottom],
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
  ].map(stroke => stroke.map(([pointX, pointY]) => [x + pointX, y + pointY] as const));
  const start = story.time + duration * 0.15;
  const drawing = Math.min(2.2, duration * 0.5);
  story.add(THREAD.InkDetail, strokes(list), { absolute: true, duration: drawing, start });
  story.blots.add({ alpha: 0.5, pigment: 'Ochre', size: 200, time: start + drawing * 0.6, x, y: y - 90 });
  story.labels.add({ side: 'Centre', text: from, time: start + drawing * 0.75, x: x - 36, y: y - 108 });
  story.labels.add({ side: 'Centre', text: to, time: start + drawing, x: x + 36, y: y - 72 });
}

/** Teaching: the line carries on while apprentice threads branch off it and go their own way. */
function apprentices(story: Story<ThreadName>): number {
  const ink = story.threads.get(THREAD.Ink);
  const length = 1100;
  const [x, y] = [ink.x, ink.y];
  const wave = (position: number) => -10 * Math.sin(position * TAU * 1.5);
  const duration = story.add(THREAD.Ink, progress => [length * progress, wave(progress)], { speed: 170 });
  THREAD.Apprentices.forEach((name, index) => {
    const position = [0.12, 0.32, 0.52][index] ?? 0;
    const apprentice = story.threads.get(name);
    apprentice.x = x + length * position;
    apprentice.y = y + wave(position);
    const reach = length * (1 - position) * 1.05;
    const lift = 50 + 34 * index;
    story.add(
      name,
      progress => [
        reach * progress,
        -lift * ease.inOut(Math.min(1, progress * 2.2)) +
          8 * Math.sin(progress * TAU * 2) -
          wave(position) +
          wave(position + (1 - position) * progress),
      ],
      {
        alpha: progress => 1 - ease.inOut(progress) * 0.8,
        duration: (1 - position) * duration,
        raw: true,
        start: story.time + position * duration,
        width: progress => Math.min(1, 0.2 + progress * 6),
      },
    );
    story.cues.add({
      duration: 2,
      kind: 'Note',
      note: [79, 83, 86][index] ?? 79,
      time: story.time + position * duration,
      velocity: 0.07,
    });
  });
  story.blots.add({
    alpha: 0.7,
    pigment: 'Dawn',
    size: 900,
    time: story.time + duration * 0.4,
    x: x + length * 0.55,
    y: y - 90,
  });
  return duration;
}
