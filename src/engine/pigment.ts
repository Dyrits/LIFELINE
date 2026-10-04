/** Watercolour pigments, as RGB. */
export const PIGMENTS = {
  Blue: [92, 118, 152],
  Dawn: [244, 182, 108],
  Grey: [104, 110, 124],
  Ochre: [214, 160, 96],
  Red: [196, 56, 58],
  Rose: [222, 118, 118],
  Sage: [128, 156, 112],
  Sky: [118, 160, 202],
  Sun: [236, 170, 60],
  Window: [246, 188, 64],
} as const satisfies Record<string, readonly [number, number, number]>;

/** The name of a watercolour pigment. */
export type Pigment = keyof typeof PIGMENTS;
