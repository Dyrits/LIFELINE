export const TAU = Math.PI * 2;
export const clamp = (v: number, a: number, b: number): number => (v < a ? a : v > b ? b : v);
export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;
export const ease = (t: number): number => t * t * (3 - 2 * t);
export const eout = (t: number): number => 1 - (1 - t) * (1 - t);
const hash = (i: number): number => {
  const s = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};
/** Smooth 1D value noise in [-1, 1]. */
export const noise1 = (x: number): number => {
  const i = Math.floor(x);
  const f = x - i;
  return lerp(hash(i), hash(i + 1), f * f * (3 - 2 * f)) * 2 - 1;
};
/** Frequency of a MIDI note. */
export const midi = (n: number): number => 440 * 2 ** ((n - 69) / 12);
/** Seeded random generator in [0, 1). */
export const mulberry = (seed: number) => {
  let a = seed;
  return (): number => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};
