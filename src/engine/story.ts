import type { Text } from '../data/types';
import { clamp, lerp, noise1 } from './math';
import type { Pigment } from './paper';

/** A position along a stroke; `up` marks pen-up travel that leaves no ink. */
export type PathPoint = readonly [x: number, y: number, up?: boolean | undefined];
export type PathFn = (u: number) => PathPoint;

export type InkPoint = Readonly<{ x: number; y: number; t: number; w: number; a: number; up: boolean }>;

export type Thread = {
  readonly colour: string;
  readonly width: number;
  readonly seed: number;
  readonly pts: InkPoint[];
  /** Where the pen rests after the last stroke. */
  x: number;
  y: number;
  n: number;
};

export type Cue = Readonly<
  | { t: number; kind: 'chord'; notes: readonly number[]; gap: number; vel: number; dur: number }
  | { t: number; kind: 'note'; note: number; vel: number; dur: number }
  | { t: number; kind: 'beat'; vel: number }
>;

export type Blot = Readonly<{
  x: number;
  y: number;
  size: number;
  pigment: Pigment;
  t: number;
  a: number;
  seed: number;
}>;
export type Caption = Readonly<{ t: number; text: Text; dur: number }>;
export type Ring = readonly (readonly [x: number, y: number])[];
/**
 * A map printed under the ink, fading in from t: land rings washed with `land` and outlined, the sea between them
 * washed with `sea`, all fading out towards the edge of a circle of radius r around (x, y).
 */
export type Print = Readonly<{
  rings: readonly Ring[];
  x: number;
  y: number;
  r: number;
  t: number;
  land: Pigment;
  sea: Pigment;
}>;
/** A name written beside (x, y) from t, on the given side, or centred on it. */
export type Label = Readonly<{
  x: number;
  y: number;
  text: Text;
  t: number;
  side: 'left' | 'right' | 'above' | 'below' | 'centre';
}>;
/** From t0 to t1, the tip of thread `pen` is a plane. */
export type Plane = Readonly<{ pen: string; t0: number; t1: number }>;
export type Bounds = { x0: number; y0: number; x1: number; y1: number };

export type AddOptions = {
  /** `fn` returns absolute positions instead of offsets from the pen. */
  abs?: boolean;
  /** Keep `fn`'s own timing instead of resampling at constant pen speed. */
  raw?: boolean;
  dur?: number;
  speed?: number;
  t0?: number;
  w?: (u: number) => number;
  a?: (u: number) => number;
};

/** Pen-up travel costs this fraction of its length in time: the hand moves faster in the air. */
const TRAVEL_WEIGHT = 0.3;
const SAMPLES = 900;
const POINTS_PER_SECOND = 72;
/** Longest stretch of stroke between two laid points. */
const MAX_STEP = 4;

/**
 * A story is built ahead of time as timed ink: every point of every thread knows when it is laid down.
 * Building touches no DOM, so it can be tested and replayed from any moment.
 */
export class Story {
  T = 0;
  readonly threads = new Map<string, Thread>();
  readonly cues: Cue[] = [];
  readonly blots: Blot[] = [];
  readonly captions: Caption[] = [];
  readonly prints: Print[] = [];
  readonly labels: Label[] = [];
  readonly planes: Plane[] = [];
  readonly zooms: [t: number, zoom: number][];
  private blotSeed = 7;

  constructor(initialZoom: number) {
    this.zooms = [[0, initialZoom]];
  }

  thread(name: string, colour: string, width: number, seed: number): Thread {
    const th: Thread = { colour, n: 0, pts: [], seed, width, x: 0, y: 0 };
    this.threads.set(name, th);
    return th;
  }

  get(name: string): Thread {
    const th = this.threads.get(name);
    if (!th) throw new Error(`Unknown thread ${name}`);
    return th;
  }

  /** Appends a stroke to a thread and returns its duration. */
  add(name: string, fn: PathFn, o: AddOptions = {}): number {
    const th = this.get(name);
    const sx = th.x;
    const sy = th.y;
    const dense: PathPoint[] = new Array(SAMPLES + 1);
    const cum = new Float64Array(SAMPLES + 1);
    for (let i = 0; i <= SAMPLES; i++) {
      const p = fn(i / SAMPLES);
      dense[i] = o.abs ? p : [sx + p[0], sy + p[1], p[2]];
      if (i) {
        const a = dense[i - 1] as PathPoint;
        const b = dense[i] as PathPoint;
        cum[i] = (cum[i - 1] ?? 0) + Math.hypot(b[0] - a[0], b[1] - a[1]) * (b[2] ? TRAVEL_WEIGHT : 1);
      }
    }
    const len = cum[SAMPLES] ?? 0;
    const dur = o.dur ?? Math.max(0.2, len / (o.speed ?? 180));
    const t0 = o.t0 ?? this.T;
    // Enough points for the time it takes, and for its length: a fast pen must not cut corners off small details.
    const n = Math.max(2, Math.ceil(dur * POINTS_PER_SECOND), Math.ceil(len / MAX_STEP));
    // A thread that resumes elsewhere lifts the pen rather than inking the jump.
    const last = th.pts[th.pts.length - 1];
    const first = dense[0] as PathPoint;
    const jump = last !== undefined && Math.hypot(first[0] - last.x, first[1] - last.y) > 4;
    let j = 0;
    let prevI = 0;
    let prevUp = jump;
    const jitter = (x: number, y: number) => {
      th.n++;
      return {
        x: x + noise1(th.n * 0.045 + th.seed) * 1.1,
        y: y + noise1(th.n * 0.045 + th.seed + 50) * 1.1,
      };
    };
    for (let k = last && !jump ? 1 : 0; k <= n; k++) {
      const u = k / n;
      let i: number;
      let r: number;
      if (o.raw) {
        const f = u * SAMPLES;
        i = Math.min(SAMPLES - 1, Math.floor(f));
        r = f - i;
      } else {
        const target = u * len;
        while (j < SAMPLES - 1 && (cum[j + 1] ?? 0) < target) j++;
        const sl = (cum[j + 1] ?? 0) - (cum[j] ?? 0);
        i = j;
        r = sl > 0 ? clamp((target - (cum[j] ?? 0)) / sl, 0, 1) : 0;
      }
      const a = dense[i] as PathPoint;
      const b = dense[i + 1] as PathPoint;
      const up = k === 0 ? jump : Boolean(b[2]);
      const t = t0 + u * dur;
      const w = th.width * (o.w ? o.w(u) : 1);
      const alpha = o.a ? o.a(u) : 1;
      // Between two samples the pen may touch down or lift off: add the exact point where it does,
      // so no ink is laid in the air and no stroke loses its end.
      if (k > 0 && up !== prevUp) {
        let e = prevI;
        while (e < i && Boolean((dense[e + 1] as PathPoint)[2]) === prevUp) e++;
        const edge = dense[e] as PathPoint;
        th.pts.push({ ...jitter(edge[0], edge[1]), a: alpha, t, up: prevUp, w });
      }
      th.pts.push({ ...jitter(lerp(a[0], b[0], r), lerp(a[1], b[1], r)), a: alpha, t, up, w });
      prevI = i;
      prevUp = up;
    }
    const end = dense[SAMPLES] as PathPoint;
    th.x = end[0];
    th.y = end[1];
    return dur;
  }

  cue(c: Cue): void {
    this.cues.push(c);
  }

  blot(x: number, y: number, size: number, pigment: Pigment, t: number, a = 1): void {
    this.blotSeed += 101;
    this.blots.push({ a, pigment, seed: this.blotSeed, size, t, x, y });
  }

  caption(text: Text, t = this.T, dur = 6.5): void {
    this.captions.push({ dur, t, text });
  }

  print(p: Print): void {
    this.prints.push(p);
  }

  label(l: Label): void {
    this.labels.push(l);
  }

  plane(p: Plane): void {
    this.planes.push(p);
  }

  zoom(z: number, t = this.T): void {
    this.zooms.push([t, z]);
  }

  bounds(): Bounds {
    const b: Bounds = { x0: Infinity, x1: -Infinity, y0: Infinity, y1: -Infinity };
    for (const th of this.threads.values()) {
      for (const p of th.pts) {
        if (p.a < 0.05) continue;
        b.x0 = Math.min(b.x0, p.x);
        b.x1 = Math.max(b.x1, p.x);
        b.y0 = Math.min(b.y0, p.y);
        b.y1 = Math.max(b.y1, p.y);
      }
    }
    return b;
  }

  /** Orders cues and captions by time once building is over. */
  finish(): void {
    this.cues.sort((a, b) => a.t - b.t);
    this.captions.sort((a, b) => a.t - b.t);
    this.zooms.sort((a, b) => a[0] - b[0]);
  }
}

/** A polyline path parametrised by its point index, for `Story.add` to resample. */
export const poly =
  (pts: readonly PathPoint[]): PathFn =>
  u => {
    const f = u * (pts.length - 1);
    const i = Math.min(pts.length - 2, Math.floor(f));
    const r = f - i;
    const a = pts[i] as PathPoint;
    const b = pts[i + 1] as PathPoint;
    return [lerp(a[0], b[0], r), lerp(a[1], b[1], r), b[2]];
  };

/**
 * Joins strokes into one path parametrised by length, so constant-speed resampling never cuts corners.
 * The pen lifts between strokes; points of a lifted stretch are flagged `up`.
 */
export function strokes(list: readonly (readonly (readonly [number, number])[])[]): PathFn {
  const pts: PathPoint[] = [];
  list.forEach((s, si) => {
    s.forEach((p, pi) => {
      pts.push([p[0], p[1], si > 0 && pi === 0]);
    });
  });
  const cum = [0];
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1] as PathPoint;
    const b = pts[i] as PathPoint;
    cum.push((cum[i - 1] ?? 0) + Math.max(1e-6, Math.hypot(b[0] - a[0], b[1] - a[1])));
  }
  const total = cum[cum.length - 1] ?? 0;
  return u => {
    const target = u * total;
    let i = 0;
    while (i < pts.length - 2 && (cum[i + 1] ?? 0) < target) i++;
    const a = pts[i] as PathPoint;
    const b = pts[i + 1] as PathPoint;
    const r = clamp((target - (cum[i] ?? 0)) / ((cum[i + 1] ?? 0) - (cum[i] ?? 0)), 0, 1);
    return [lerp(a[0], b[0], r), lerp(a[1], b[1], r), b[2]];
  };
}
