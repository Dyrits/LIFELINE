/** A full turn, in radians. */
export const TAU = Math.PI * 2;

/** A position on the drawing; y grows downwards. */
export type Point = readonly [x: number, y: number];

/** `value` held between `min` and `max`. */
export const clamp = (value: number, min: number, max: number): number =>
  value < min ? min : value > max ? max : value;

/** The value a fraction `time` of the way from `start` to `end`. */
export const lerp = (start: number, end: number, time: number): number => start + (end - start) * time;

/** Easing curves over [0, 1]. */
export const ease = {
  /** Slow at both ends. */
  inOut: (time: number): number => time * time * (3 - 2 * time),
  /** Fast at first, slowing down to arrive. */
  out: (time: number): number => 1 - (1 - time) * (1 - time),
};

const hash = (index: number): number => {
  const value = Math.sin(index * 127.1 + 311.7) * 43758.5453;
  return value - Math.floor(value);
};

/** Smooth 1D value noise in [-1, 1]. */
export const noise = (x: number): number => {
  const index = Math.floor(x);
  const fraction = x - index;
  return lerp(hash(index), hash(index + 1), fraction * fraction * (3 - 2 * fraction)) * 2 - 1;
};

/** Frequency of a MIDI note. */
export const midi = (note: number): number => 440 * 2 ** ((note - 69) / 12);

/** Seeded random generator in [0, 1). */
export const mulberry = (seed: number) => {
  let state = seed;
  return (): number => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let mixed = Math.imul(state ^ (state >>> 15), 1 | state);
    mixed = (mixed + Math.imul(mixed ^ (mixed >>> 7), 61 | mixed)) ^ mixed;
    return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296;
  };
};
