import type { Side, Text } from '../data/types';
import type { Picture } from './backdrop';
import { clamp, ease, lerp, noise, type Point } from './math';
import type { Pigment } from './pigment';

/** A position along a stroke; `up` marks pen-up travel that leaves no ink. */
export type PathPoint = readonly [x: number, y: number, up?: boolean | undefined];
/** A stroke as a function of progress along it, from 0 to 1. */
export type Path = (progress: number) => PathPoint;

/** A point of ink, laid at `time`. */
export type InkPoint = Readonly<{ x: number; y: number; time: number; width: number; alpha: number; up: boolean }>;

/** A pen of the story and the ink it lays. */
export type Thread = {
  readonly colour: string;
  readonly width: number;
  readonly seed: number;
  /** Grows while the story is built. */
  readonly points: InkPoint[];
  /** Where the pen rests after the last stroke. */
  x: number;
  y: number;
  /** Points laid so far, which moves the pen's tremor along. */
  laid: number;
};

/** A sound played at `time`. */
export type Cue = Readonly<
  | { time: number; kind: 'Chord'; notes: readonly number[]; gap: number; velocity: number; duration: number }
  | { time: number; kind: 'Note'; note: number; velocity: number; duration: number }
>;

/** A watercolour wash centred on (x, y), spreading from `time`. */
export type Blot = Readonly<{
  x: number;
  y: number;
  size: number;
  /** How many times wider than tall, for a wash spread under several shapes. */
  stretch?: number;
  pigment: Pigment;
  time: number;
  alpha: number;
  seed: number;
}>;
/** A line of story shown from `time`, for `duration` seconds. */
export type Caption = Readonly<{ time: number; text: Text; duration: number }>;
/** A closed outline of land on a printed map. */
export type Ring = readonly Point[];
/**
 * A map printed under the ink, fading in from `time`: land rings washed with `land` and outlined, the sea between them washed with `sea`, all fading out towards the edge of a circle of `radius` around (x, y).
 */
export type MapPrint = Readonly<{
  kind: 'Map';
  rings: readonly Ring[];
  x: number;
  y: number;
  radius: number;
  time: number;
  land: Pigment;
  sea: Pigment;
}>;
/** A picture printed under the ink as if seen through mist, fading in from `time`. */
export type PicturePrint = Readonly<{ kind: 'Picture'; time: number } & Picture>;
/** A background printed under the ink, for the line to run over. */
export type Print = MapPrint | PicturePrint;
/** A name written beside (x, y) from `time` until `until`, on the given side, or centred on it. */
export type Label = Readonly<{
  x: number;
  y: number;
  text: Text;
  time: number;
  until?: number;
  side: Side | 'Centre';
}>;
/** How visible a label is at `time`: it fades in once the line reaches its place, and out from `until`. */
export const labelAlpha = (label: Label, time: number): number =>
  ease.out(clamp((time - label.time) / 0.6, 0, 1)) *
  (1 - ease.out(clamp((time - (label.until ?? Infinity)) / 0.8, 0, 1)));
/** From `start` to `end`, the tip of thread `pen` is a plane. */
export type Plane<Name extends string = string> = Readonly<{ pen: Name; start: number; end: number }>;
/** How far the camera zooms in from `time`. */
export type Zoom = Readonly<{ time: number; zoom: number }>;
/** The box around every visible point of ink. */
export type Bounds = Readonly<{ min: Readonly<{ x: number; y: number }>; max: Readonly<{ x: number; y: number }> }>;

/** How `Story.add` lays a stroke. */
export type AddOptions = Readonly<{
  /** `path` returns absolute positions instead of offsets from the pen. */
  absolute?: boolean;
  /** Keep `path`'s own timing instead of resampling at constant pen speed. */
  raw?: boolean;
  duration?: number;
  speed?: number;
  start?: number;
  width?: (progress: number) => number;
  alpha?: (progress: number) => number;
}>;

/** Pen-up travel costs this fraction of its length in time: the hand moves faster in the air. */
const TRAVEL_WEIGHT = 0.3;
const SAMPLES = 900;
const POINTS_PER_SECOND = 72;
/** Longest stretch of stroke between two laid points. */
const MAX_STEP = 4;

/** Timed items of one kind, appended while a story is built. */
export class Track<Item> {
  /** Grows while the story is built, and is ordered once it is finished. */
  readonly items: Item[] = [];

  add(item: Item): void {
    this.items.push(item);
  }
}

/** Blots, each given its own seed so that no two washes take the same shape. */
export class Blots extends Track<Blot> {
  override add(blot: Omit<Blot, 'seed'>): void {
    this.items.push({ ...blot, seed: 7 + 101 * (this.items.length + 1) });
  }
}

/** The pens of a story, by name. */
export class Threads<Name extends string> {
  private readonly byName = new Map<Name, Thread>();

  add(name: Name, colour: string, width: number, seed: number): Thread {
    const thread: Thread = { colour, laid: 0, points: [], seed, width, x: 0, y: 0 };
    this.byName.set(name, thread);
    return thread;
  }

  get(name: Name): Thread {
    const thread = this.byName.get(name);
    if (!thread) throw new Error(`Unknown thread ${name}`);
    return thread;
  }

  values(): IterableIterator<Thread> {
    return this.byName.values();
  }

  [Symbol.iterator](): IterableIterator<[Name, Thread]> {
    return this.byName.entries();
  }
}

/**
 * A story is built ahead of time as timed ink: every point of every thread knows when it is laid down.
 * Building touches no DOM, so it can be tested and replayed from any moment.
 */
export class Story<Name extends string = string> {
  /** Where the story being built has got to: the next step starts here. */
  time = 0;
  readonly threads = new Threads<Name>();
  readonly cues = new Track<Cue>();
  readonly blots = new Blots();
  readonly captions = new Track<Caption>();
  readonly prints = new Track<Print>();
  readonly labels = new Track<Label>();
  readonly planes = new Track<Plane<Name>>();
  readonly zooms = new Track<Zoom>();

  constructor(initialZoom: number) {
    this.zooms.add({ time: 0, zoom: initialZoom });
  }

  /** Appends a stroke to a thread and returns its duration. */
  add(name: Name, path: Path, options: AddOptions = {}): number {
    const thread = this.threads.get(name);
    const start = { x: thread.x, y: thread.y };
    const dense: PathPoint[] = new Array(SAMPLES + 1);
    const cumulative = new Float64Array(SAMPLES + 1);
    for (let index = 0; index <= SAMPLES; index++) {
      const point = path(index / SAMPLES);
      dense[index] = options.absolute ? point : [start.x + point[0], start.y + point[1], point[2]];
      if (index) {
        const from = dense[index - 1] as PathPoint;
        const to = dense[index] as PathPoint;
        cumulative[index] =
          (cumulative[index - 1] ?? 0) + Math.hypot(to[0] - from[0], to[1] - from[1]) * (to[2] ? TRAVEL_WEIGHT : 1);
      }
    }
    const length = cumulative[SAMPLES] ?? 0;
    const duration = options.duration ?? Math.max(0.2, length / (options.speed ?? 180));
    const startTime = options.start ?? this.time;
    // Enough points for the time it takes, and for its length: a fast pen must not cut corners off small details.
    const count = Math.max(2, Math.ceil(duration * POINTS_PER_SECOND), Math.ceil(length / MAX_STEP));
    // A thread that resumes elsewhere lifts the pen rather than inking the jump.
    const last = thread.points[thread.points.length - 1];
    const first = dense[0] as PathPoint;
    const jump = last !== undefined && Math.hypot(first[0] - last.x, first[1] - last.y) > 4;
    let sample = 0;
    let previousIndex = 0;
    let previousUp = jump;
    const jitter = (x: number, y: number) => {
      thread.laid++;
      return {
        x: x + noise(thread.laid * 0.045 + thread.seed) * 1.1,
        y: y + noise(thread.laid * 0.045 + thread.seed + 50) * 1.1,
      };
    };
    for (let iteration = last && !jump ? 1 : 0; iteration <= count; iteration++) {
      const progress = iteration / count;
      let index: number;
      let ratio: number;
      if (options.raw) {
        const position = progress * SAMPLES;
        index = Math.min(SAMPLES - 1, Math.floor(position));
        ratio = position - index;
      } else {
        const target = progress * length;
        while (sample < SAMPLES - 1 && (cumulative[sample + 1] ?? 0) < target) sample++;
        const segment = (cumulative[sample + 1] ?? 0) - (cumulative[sample] ?? 0);
        index = sample;
        ratio = segment > 0 ? clamp((target - (cumulative[sample] ?? 0)) / segment, 0, 1) : 0;
      }
      const from = dense[index] as PathPoint;
      const to = dense[index + 1] as PathPoint;
      const up = iteration === 0 ? jump : Boolean(to[2]);
      const time = startTime + progress * duration;
      const width = thread.width * (options.width ? options.width(progress) : 1);
      const alpha = options.alpha ? options.alpha(progress) : 1;
      // Between two samples the pen may touch down or lift off: add the exact point where it does, so no ink is laid in the air and no stroke loses its end.
      if (iteration > 0 && up !== previousUp) {
        let edgeIndex = previousIndex;
        while (edgeIndex < index && Boolean((dense[edgeIndex + 1] as PathPoint)[2]) === previousUp) edgeIndex++;
        const edge = dense[edgeIndex] as PathPoint;
        thread.points.push({ ...jitter(edge[0], edge[1]), alpha, time, up: previousUp, width });
      }
      thread.points.push({
        ...jitter(lerp(from[0], to[0], ratio), lerp(from[1], to[1], ratio)),
        alpha,
        time,
        up,
        width,
      });
      previousIndex = index;
      previousUp = up;
    }
    const end = dense[SAMPLES] as PathPoint;
    thread.x = end[0];
    thread.y = end[1];
    return duration;
  }

  /** The box around every point of ink that shows. */
  bounds(): Bounds {
    let [minX, minY, maxX, maxY] = [Infinity, Infinity, -Infinity, -Infinity];
    for (const thread of this.threads.values()) {
      for (const point of thread.points) {
        if (point.alpha < 0.05) continue;
        minX = Math.min(minX, point.x);
        maxX = Math.max(maxX, point.x);
        minY = Math.min(minY, point.y);
        maxY = Math.max(maxY, point.y);
      }
    }
    return { max: { x: maxX, y: maxY }, min: { x: minX, y: minY } };
  }

  /** Orders cues, captions and zooms by time once building is over. */
  finish(): void {
    this.cues.items.sort((from, to) => from.time - to.time);
    this.captions.items.sort((from, to) => from.time - to.time);
    this.zooms.items.sort((from, to) => from.time - to.time);
  }
}

/** A polyline path parametrised by its point index, for `Story.add` to resample. */
export const poly =
  (points: readonly PathPoint[]): Path =>
  progress => {
    const position = progress * (points.length - 1);
    const index = Math.min(points.length - 2, Math.floor(position));
    const ratio = position - index;
    const from = points[index] as PathPoint;
    const to = points[index + 1] as PathPoint;
    return [lerp(from[0], to[0], ratio), lerp(from[1], to[1], ratio), to[2]];
  };

/**
 * Joins strokes into one path parametrised by length, so constant-speed resampling never cuts corners.
 * The pen lifts between strokes; points of a lifted stretch are flagged `up`.
 */
export function strokes(list: readonly (readonly Point[])[]): Path {
  const points: PathPoint[] = [];
  list.forEach((stroke, strokeIndex) => {
    stroke.forEach((point, pointIndex) => {
      points.push([point[0], point[1], strokeIndex > 0 && pointIndex === 0]);
    });
  });
  const cumulative = [0];
  for (let index = 1; index < points.length; index++) {
    const from = points[index - 1] as PathPoint;
    const to = points[index] as PathPoint;
    cumulative.push((cumulative[index - 1] ?? 0) + Math.max(1e-6, Math.hypot(to[0] - from[0], to[1] - from[1])));
  }
  const total = cumulative[cumulative.length - 1] ?? 0;
  return progress => {
    const target = progress * total;
    let index = 0;
    while (index < points.length - 2 && (cumulative[index + 1] ?? 0) < target) index++;
    const from = points[index] as PathPoint;
    const to = points[index + 1] as PathPoint;
    const ratio = clamp(
      (target - (cumulative[index] ?? 0)) / ((cumulative[index + 1] ?? 0) - (cumulative[index] ?? 0)),
      0,
      1,
    );
    return [lerp(from[0], to[0], ratio), lerp(from[1], to[1], ratio), to[2]];
  };
}
