import type { MotifKey } from '../data/types';
import { TAU } from '../engine/math';
import type { Pigment } from '../engine/paper';
import { LAND } from './world';

export type Pt = readonly [x: number, y: number];
export type Stroke = readonly Pt[];

/**
 * A shape drawn on the line, relative to where it touches it (y grows downwards, so shapes rise at negative y).
 * The outline is one unbroken stroke from the origin to where the line carries on; the details are lifted strokes,
 * drawn by a second pen so the line itself never breaks.
 */
export type Shape = Readonly<{
  outline: Stroke;
  details: readonly Stroke[];
  pigment: Pigment;
  /** Centre and size of the watercolour wash under the shape. */
  wash: readonly [x: number, y: number, size: number];
  /** Small washes of another colour over parts of the shape, laid as the details finish. */
  spots?: readonly (readonly [x: number, y: number, size: number, pigment: Pigment])[];
}>;

/** Points around a circle; angles in radians, y downwards (so -π/2 is the top). */
const arc = (cx: number, cy: number, r: number, from: number, to: number, n = 20): Pt[] =>
  Array.from({ length: n + 1 }, (_, i) => {
    const a = from + ((to - from) * i) / n;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)] as const;
  });
const circle = (cx: number, cy: number, r: number, n = 18): Pt[] => arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + TAU, n);
const rect = (x: number, y: number, w: number, h: number): Pt[] => [
  [x, y],
  [x + w, y],
  [x + w, y + h],
  [x, y + h],
  [x, y],
];

/** Rounds the corners of an open polyline, keeping its ends (Chaikin's corner cutting). */
const smooth = (pts: readonly Pt[], times = 2): Pt[] => {
  let out = [...pts];
  for (let n = 0; n < times; n++) {
    const next: Pt[] = [out[0] as Pt];
    for (let i = 0; i < out.length - 1; i++) {
      const [a, b] = [out[i] as Pt, out[i + 1] as Pt];
      next.push(
        [0.75 * a[0] + 0.25 * b[0], 0.75 * a[1] + 0.25 * b[1]],
        [0.25 * a[0] + 0.75 * b[0], 0.25 * a[1] + 0.75 * b[1]],
      );
    }
    next.push(out[out.length - 1] as Pt);
    out = next;
  }
  return out;
};

function shape(outline: Stroke, details: readonly Stroke[], pigment: Pigment, wash: Shape['wash']): Shape {
  return { outline, details, pigment, wash };
}

/** A browser window standing on the line, with its content drawn inside. */
function browser(content: readonly Stroke[], pigment: Pigment): Shape {
  return shape(
    [
      [0, 0],
      [30, 0],
      [30, -210],
      [310, -210],
      [310, 0],
      [350, 0],
    ],
    [
      [
        [30, -180],
        [310, -180],
      ],
      circle(48, -195, 4, 10),
      circle(62, -195, 4, 10),
      circle(76, -195, 4, 10),
      ...content,
    ],
    pigment,
    [170, -110, 520],
  );
}

const SHAPES: Record<Exclude<MotifKey, 'apprentices'>, () => Shape> = {
  // Street distribution: a newspaper, its corner folded.
  newspaper: () =>
    shape(
      [
        [0, 0],
        [40, 0],
        [40, -170],
        [205, -170],
        [235, -140],
        [235, 0],
        [275, 0],
      ],
      [
        [
          [205, -170],
          [205, -140],
          [235, -140],
        ],
        [
          [60, -148],
          [190, -148],
        ],
        [
          [60, -124],
          [215, -124],
        ],
        rect(60, -106, 70, 52),
        ...[-104, -90, -76, -62].map(
          y =>
            [
              [146, y],
              [215, y],
            ] as Stroke,
        ),
        ...[-38, -24].map(
          y =>
            [
              [60, y],
              [215, y],
            ] as Stroke,
        ),
      ],
      'ochre',
      [135, -90, 420],
    ),

  // Inventory: a barcode.
  barcode: () =>
    shape(
      [
        [0, 0],
        [210, 0],
      ],
      [20, 26, 34, 38, 50, 58, 62, 74, 80, 92, 96, 104, 116, 122, 130, 138, 142, 154, 162, 170, 176, 188].map(x => [
        [x, -24],
        [x, -124],
      ]),
      'grey',
      [105, -75, 380],
    ),

  // Energy suppliers: a lightning bolt, sparking.
  bolt: () =>
    shape(
      [
        [0, 0],
        [100, 0],
        [132, -112],
        [80, -112],
        [124, -262],
        [196, -262],
        [158, -152],
        [212, -152],
        [100, 0],
        [290, 0],
      ],
      [
        [
          [214, -236],
          [240, -252],
        ],
        [
          [222, -202],
          [252, -202],
        ],
        [
          [98, -236],
          [72, -252],
        ],
      ],
      'sun',
      [150, -140, 440],
    ),

  // Field scouting: a skeleton weed (Chondrilla juncea). Toothed rosette leaves at its foot, stiff bristles pointing
  // down along the base of the stem, wiry branches with a few narrow leaves, yellow flower heads of notched
  // strap-shaped petals, closed buds, and a seed head like a dandelion clock.
  skeletonWeed: () => {
    const BASE: Pt = [150, 0];
    // A runcinate leaf: its upper edge cut into lobes hooked back towards the base, its lower edge smooth, its
    // corners rounded so it reads as a leaf rather than a saw.
    const leaf = (tip: Pt, lobes = 4, width = 14): Pt[] => {
      const [dx, dy] = [tip[0] - BASE[0], tip[1] - BASE[1]];
      const len = Math.hypot(dx, dy);
      const [nx, ny] = [dy / len, -dx / len];
      const up = ny < 0 ? 1 : -1;
      const at = (u: number, off: number, back = 0): Pt => [
        BASE[0] + dx * u + nx * off * up - (dx / len) * back,
        BASE[1] + dy * u + ny * off * up - (dy / len) * back,
      ];
      const steps = Array.from({ length: lobes }, (_, k) => 0.12 + (0.66 * k) / lobes);
      const upper = steps.flatMap(u => {
        const w = width * (1 - u * 0.45);
        return [at(u, 2), at(u + 0.35 / lobes, w * 0.55), at(u + 0.7 / lobes, w, w * 0.5)];
      });
      const lower = [0.85, 0.6, 0.35, 0.12].map(u => at(u, -5 - 3 * Math.sin(u * Math.PI)));
      return smooth([BASE, ...upper, tip, ...lower, BASE]).slice(1);
    };
    // The midrib of a leaf, drawn by the detail pen.
    const rib = (tip: Pt): Stroke => [
      [BASE[0] + (tip[0] - BASE[0]) * 0.08, BASE[1] + (tip[1] - BASE[1]) * 0.08],
      [BASE[0] + (tip[0] - BASE[0]) * 0.86, BASE[1] + (tip[1] - BASE[1]) * 0.86],
    ];
    // A flower head: a disc and its strap-shaped petals, broad enough to read through the pen's wobble.
    const head = (x: number, y: number, n = 9, len = 24, turn = 0): Stroke[] => [
      circle(x, y, 5.5, 12),
      ...Array.from({ length: n }, (_, k): Stroke => {
        const a = turn + (k * TAU) / n;
        const p = (r: number, half: number): Pt => [x + r * Math.cos(a + half / r), y + r * Math.sin(a + half / r)];
        return smooth(
          [p(7, -2), p(len * 0.55, -3.6), p(len, -2.6), p(len + 2, 0), p(len, 2.6), p(len * 0.55, 3.6), p(7, 2)],
          1,
        );
      }),
    ];
    // A closed bud: a narrow teardrop held in two sepals, pointing along `a`.
    const bud = (x: number, y: number, a: number): Stroke[] => {
      const p = (r: number, da: number): Pt => [x + r * Math.cos(a + da), y + r * Math.sin(a + da)];
      return [
        [p(0, 0), p(7, -0.45), p(14, -0.2), p(17, 0), p(14, 0.2), p(7, 0.45), p(0, 0)],
        [p(0, 0), p(8, -0.9)],
        [p(0, 0), p(8, 0.9)],
      ];
    };
    // A seed head: fine rays, each ending in a small tuft.
    const clock = (x: number, y: number): Stroke[] =>
      Array.from({ length: 14 }, (_, k): Stroke[] => {
        const a = (k * TAU) / 14;
        const p = (r: number, da = 0): Pt => [x + r * Math.cos(a + da), y + r * Math.sin(a + da)];
        return [
          [p(2), p(13)],
          [p(13), p(17, -0.12)],
          [p(13), p(17, 0.12)],
        ];
      }).flat();
    const LEAVES: readonly [Pt, Pt, Pt, Pt] = [
      [40, -62],
      [96, -108],
      [206, -106],
      [262, -58],
    ];
    // Stiff bristles along the foot of the stem, pointing down.
    const bristles = Array.from({ length: 8 }, (_, k): Stroke => {
      const y = -12 - k * 6;
      const side = k % 2 ? 1 : -1;
      return [
        [150 + side, y],
        [150 + side * 10, y + 7],
      ];
    });
    // A narrow leaf on a branch: a thin blade from a joint.
    const blade = (x: number, y: number, a: number, len = 16): Stroke => {
      const p = (r: number, da: number): Pt => [x + r * Math.cos(a + da), y + r * Math.sin(a + da)];
      return [p(0, 0), p(len * 0.5, -0.12), p(len, 0), p(len * 0.5, 0.12), p(0, 0)];
    };
    return {
      ...shape(
        [
          [0, 0],
          BASE,
          ...leaf(LEAVES[0]),
          ...leaf(LEAVES[1], 3, 11),
          ...leaf(LEAVES[2], 3, 11),
          ...leaf(LEAVES[3]),
          [300, 0],
        ],
        [
          ...LEAVES.map(rib),
          // Main stem, with its branches and twigs.
          smooth([
            [150, -2],
            [149, -70],
            [151, -140],
            [150, -200],
            [152, -264],
          ]),
          smooth([
            [150, -64],
            [192, -92],
            [242, -116],
          ]),
          smooth([
            [150, -100],
            [124, -138],
            [104, -170],
            [90, -220],
          ]),
          smooth([
            [104, -170],
            [80, -182],
            [64, -186],
          ]),
          smooth([
            [151, -134],
            [178, -166],
            [200, -194],
            [214, -238],
          ]),
          smooth([
            [200, -194],
            [222, -196],
            [236, -204],
          ]),
          smooth([
            [150, -186],
            [134, -214],
            [124, -240],
          ]),
          ...bristles,
          blade(150, -64, -2.6),
          blade(150, -100, -0.3, 14),
          blade(151, -134, -2.9, 13),
          blade(124, -138, -0.6, 11),
          blade(192, -92, -1.9, 12),
          ...head(152, -270, 10, 26),
          ...head(90, -226, 9, 22, 0.2),
          ...head(214, -244, 9, 23, 0.1),
          ...head(248, -118, 8, 20, 0.3),
          ...bud(124, -240, -1.9),
          ...bud(236, -204, -0.4),
          ...clock(54, -190),
        ],
        'sage',
        [150, -120, 440],
      ),
      spots: [
        [152, -270, 84, 'sun'],
        [90, -226, 72, 'sun'],
        [214, -244, 74, 'sun'],
        [248, -118, 64, 'sun'],
      ],
    };
  },

  // Bar kitchen: a cocktail glass on the bar, and a pan tossing food over a gas flame, steam curling up.
  pan: () => {
    const steam = (x0: number, y0: number, turn: number): Stroke =>
      smooth(Array.from({ length: 11 }, (_, i) => [x0 + turn * 9 * Math.sin(i * 0.95), y0 - i * 10] as const));
    // A gas flame: a small tongue rising from the burner.
    const flame = (x: number, h: number): Stroke =>
      smooth([
        [x - 5, -31],
        [x - 4, -31 - h * 0.5],
        [x, -31 - h],
        [x + 4, -31 - h * 0.5],
        [x + 5, -31],
      ]);
    const ellipse = (cx: number, cy: number, rx: number, ry: number, n = 20): Stroke =>
      Array.from({ length: n + 1 }, (_, i) => {
        const a = Math.PI + (i / n) * TAU;
        return [cx + rx * Math.cos(a), cy + ry * Math.sin(a)] as const;
      });
    return {
      ...shape(
        [
          [0, 0],
          [50, 0],
          // The glass: up the stem, round the bowl, back down.
          [50, -52],
          [12, -112],
          [88, -112],
          [50, -52],
          [50, 0],
          [104, 0],
          // The stove: its top carries the pan.
          [104, -30],
          [330, -30],
          [330, 0],
          [362, 0],
        ],
        [
          // Glass: foot, drink and an olive on a pick.
          [
            [36, -2],
            [64, -2],
          ],
          [
            [24, -98],
            [76, -98],
          ],
          circle(57, -88, 5, 10),
          [
            [38, -124],
            [62, -86],
          ],
          // Stove: oven door and knobs.
          [
            [118, -22],
            [316, -22],
          ],
          circle(134, -12, 4, 8),
          circle(150, -12, 4, 8),
          circle(300, -12, 4, 8),
          // Flames under the pan.
          ...[176, 194, 212, 230, 248].map((x, k) => flame(x, k % 2 ? 9 : 13)),
          // Pan: body, rim, long handle.
          [
            [146, -78],
            [158, -48],
            [262, -48],
            [274, -78],
          ],
          ellipse(210, -78, 64, 7),
          [
            [272, -72],
            [350, -88],
            [354, -82],
            [276, -64],
          ],
          // Food tossed above the pan, with the arc it flies along.
          circle(186, -118, 5, 10),
          circle(212, -134, 6, 10),
          circle(240, -116, 4.5, 10),
          smooth([
            [168, -96],
            [190, -138],
            [222, -150],
            [252, -132],
          ]),
          steam(176, -160, 1),
          steam(246, -150, -1),
        ],
        'rose',
        [190, -95, 480],
      ),
      spots: [
        [212, -40, 56, 'sun'],
        [50, -100, 70, 'sun'],
      ],
    };
  },

  // Cattle and sheep marking: a farm. A barn, a fence, a windmill pumping water, and a ewe with her lamb.
  pickets: () => {
    // A sheep standing on the line: a woolly body, a dark face, four legs.
    const sheep = (cx: number, k: number): Stroke[] => {
      const wool = Array.from({ length: 37 }, (_, i): Pt => {
        const a = (i / 36) * TAU;
        const r = 1 + 0.1 * Math.abs(Math.sin(a * 5));
        return [cx + 22 * k * r * Math.cos(a), -27 * k + 12 * k * r * Math.sin(a)];
      });
      const face = Array.from({ length: 13 }, (_, i): Pt => {
        const a = (i / 12) * TAU;
        return [cx + 25 * k + 7 * k * Math.cos(a), -34 * k + 5 * k * Math.sin(a) + 2 * k * Math.cos(a)];
      });
      return [
        wool,
        face,
        [
          [cx + 22 * k, -39 * k],
          [cx + 18 * k, -44 * k],
        ],
        ...[-14, -6, 6, 13].map(
          (dx): Stroke => [
            [cx + dx * k, -17 * k],
            [cx + dx * k, 0],
          ],
        ),
      ];
    };
    const [hx, hy] = [266, -178];
    return {
      ...shape(
        [
          [0, 0],
          // The barn, its roof.
          [30, 0],
          [30, -88],
          [75, -138],
          [120, -88],
          [120, 0],
          [250, 0],
          // The windmill tower: up one leg, down the other.
          [264, hy + 10],
          [268, hy + 10],
          [282, 0],
          [396, 0],
        ],
        [
          // Barn: eaves, hayloft, braced door.
          [
            [22, -80],
            [75, -138],
            [128, -80],
          ],
          rect(66, -82, 18, 16),
          rect(54, -54, 42, 54),
          [
            [54, -54],
            [96, 0],
          ],
          [
            [96, -54],
            [54, 0],
          ],
          // Fence: posts and two rails.
          ...[138, 160, 182, 204, 226].map(
            (x): Stroke => [
              [x, 0],
              [x, -46],
            ],
          ),
          [
            [132, -36],
            [234, -36],
          ],
          [
            [132, -18],
            [234, -18],
          ],
          // Windmill: braces across the tower, the wheel of blades, the tail vane.
          ...[-30, -78, -122].map((y): Stroke => {
            // The legs lean in from 250 and 282 at the ground to 264 and 268 under the wheel.
            const lean = (at: number) => (14 * at) / (hy + 10);
            return [
              [250 + lean(y), y],
              [282 - lean(y - 26), y - 26],
            ];
          }),
          circle(hx, hy, 30, 22),
          circle(hx, hy, 12, 12),
          ...Array.from(
            { length: 12 },
            (_, k): Stroke => [
              [hx + 12 * Math.cos((k * TAU) / 12), hy + 12 * Math.sin((k * TAU) / 12)],
              [hx + 30 * Math.cos((k * TAU) / 12 + 0.12), hy + 30 * Math.sin((k * TAU) / 12 + 0.12)],
            ],
          ),
          [
            [hx + 6, hy],
            [hx + 52, hy - 4],
            [hx + 60, hy - 16],
            [hx + 60, hy + 8],
            [hx + 52, hy - 4],
          ],
          ...sheep(316, 1),
          ...sheep(372, 0.62),
        ],
        'ochre',
        [200, -90, 500],
      ),
      spots: [
        [340, -20, 110, 'sage'],
        [hx, hy, 80, 'sky'],
        [75, -60, 110, 'red'],
      ],
    };
  },

  // Bali: a candi bentar, the split gate before a temple. Two stepped towers cut clean down the middle; the line
  // climbs one half, walks through the gap and climbs down the other.
  candiBentar: () => {
    // The outer profile of the left half, from the ground up to its peak at the cut.
    const half: Pt[] = [
      [20, 0],
      [20, -30],
      [28, -30],
      [28, -100],
      [20, -100],
      [20, -110],
      [34, -110],
      [34, -132],
      [44, -136],
      [44, -158],
      [54, -162],
      [54, -184],
      [64, -188],
      [64, -206],
      [96, -224],
      [130, -240],
    ];
    const mirror = (p: Pt): Pt => [300 - p[0], p[1]];
    // Ledges across each tier, from the outer edge to the cut, on both halves.
    const ledges = [-30, -100, -110, -136, -162, -188].flatMap((y): Stroke[] => {
      const x = (half.find(p => p[1] === y) ?? [20, y])[0];
      const left: Stroke = [
        [x, y],
        [130, y],
      ];
      return [left, left.map(mirror)];
    });
    // A curl of carving at the corner of each tier.
    const curl = (x: number, y: number): Stroke =>
      smooth([
        [x, y],
        [x - 8, y - 4],
        [x - 10, y - 12],
        [x - 4, y - 14],
        [x - 2, y - 9],
      ]);
    const curls = (
      [
        [34, -132],
        [44, -158],
        [54, -184],
        [64, -206],
      ] as const
    ).flatMap(([x, y]): Stroke[] => {
      const c = curl(x, y);
      return [c, c.map(mirror)];
    });
    const panel = (x: number): Stroke[] => [rect(x, -88, 46, 44), circle(x + 23, -66, 12, 12)];
    return {
      ...shape(
        [[0, 0], ...half, [130, 0], [170, 0], ...[...half].reverse().map(mirror), [320, 0]],
        [
          ...ledges,
          ...curls,
          ...panel(52),
          ...panel(202),
          // Steps through the gate.
          [
            [130, -7],
            [170, -7],
          ],
          [
            [134, -14],
            [166, -14],
          ],
        ],
        'rose',
        [150, -120, 460],
      ),
      spots: [
        [20, -10, 80, 'sage'],
        [280, -10, 80, 'sage'],
      ],
    };
  },

  // Carpenter's showcase: a gallery of his woodwork, a piece of furniture in each frame.
  browserGallery: () => {
    // Furniture drawn in a 70 × 60 frame whose top left corner is (x, y).
    const pieces: ((x: number, y: number) => Stroke[])[] = [
      // A chair, from the side.
      (x, y) => [
        [
          [x + 22, y + 10],
          [x + 22, y + 52],
        ],
        [
          [x + 22, y + 34],
          [x + 48, y + 34],
          [x + 48, y + 52],
        ],
        [
          [x + 22, y + 44],
          [x + 48, y + 44],
        ],
        [
          [x + 22, y + 16],
          [x + 28, y + 16],
        ],
      ],
      // A table.
      (x, y) => [
        rect(x + 10, y + 22, 50, 5),
        [
          [x + 15, y + 27],
          [x + 15, y + 52],
        ],
        [
          [x + 55, y + 27],
          [x + 55, y + 52],
        ],
        [
          [x + 15, y + 33],
          [x + 55, y + 33],
        ],
      ],
      // A cabinet with two doors.
      (x, y) => [
        rect(x + 20, y + 8, 30, 42),
        [
          [x + 35, y + 8],
          [x + 35, y + 50],
        ],
        circle(x + 32, y + 29, 1.5, 6),
        circle(x + 38, y + 29, 1.5, 6),
        [
          [x + 22, y + 50],
          [x + 22, y + 54],
        ],
        [
          [x + 48, y + 50],
          [x + 48, y + 54],
        ],
      ],
      // A stool.
      (x, y) =>
        [
          circle(x + 35, y + 22, 16, 16).map(([px, py]) => [px, y + 22 + (py - y - 22) * 0.25] as const),
          [
            [x + 22, y + 24],
            [x + 18, y + 52],
          ],
          [
            [x + 35, y + 26],
            [x + 35, y + 52],
          ],
          [
            [x + 48, y + 24],
            [x + 52, y + 52],
          ],
          [
            [x + 24, y + 40],
            [x + 46, y + 40],
          ],
        ] as Stroke[],
      // A carved door with an arched top.
      (x, y) => [
        [[x + 23, y + 54], ...arc(x + 35, y + 20, 12, Math.PI, TAU, 10), [x + 47, y + 54]],
        rect(x + 27, y + 24, 16, 10),
        rect(x + 27, y + 38, 16, 12),
        circle(x + 35, y + 16, 3, 8),
      ],
      // A bookshelf.
      (x, y) => [
        rect(x + 16, y + 8, 38, 46),
        [
          [x + 16, y + 23],
          [x + 54, y + 23],
        ],
        [
          [x + 16, y + 38],
          [x + 54, y + 38],
        ],
        ...[20, 25, 30, 40, 45].map(
          (dx): Stroke => [
            [x + dx, y + 23],
            [x + dx + (dx === 40 ? 4 : 0), y + 12],
          ],
        ),
        ...[22, 28, 36, 42].map(
          (dx): Stroke => [
            [x + dx, y + 38],
            [x + dx, y + 28],
          ],
        ),
      ],
    ];
    const frames = [55, 135, 215].flatMap(x => [
      [x, -160],
      [x, -88],
    ]);
    return browser(
      frames.flatMap(([x = 0, y = 0], k) => [rect(x, y, 70, 60), ...(pieces[k]?.(x, y) ?? [])]),
      'ochre',
    );
  },

  // Booking platform: code brackets.
  browserCode: () =>
    browser(
      [
        [
          [125, -135],
          [95, -100],
          [125, -65],
        ],
        [
          [150, -60],
          [180, -140],
        ],
        [
          [205, -135],
          [235, -100],
          [205, -65],
        ],
      ],
      'sky',
    ),

  // Hotel bookings: an availability calendar, one day circled.
  browserCalendar: () => {
    const grid: Stroke[] = [rect(60, -165, 220, 145)];
    for (const y of [-135, -105, -75, -45])
      grid.push([
        [60, y],
        [280, y],
      ]);
    for (let k = 1; k < 7; k++) {
      const x = 60 + (k * 220) / 7;
      grid.push([
        [x, -135],
        [x, -20],
      ]);
    }
    grid.push(circle(186, -90, 14, 14));
    return browser(grid, 'sky');
  },

  // Ambulance dispatch: an ambulance, its light bar flashing.
  ambulance: () => {
    const wheel = (x: number): Stroke[] => [circle(x, -18, 18, 16), circle(x, -18, 6, 10)];
    // The body's lower edge, rising over each wheel.
    const arch = (x: number): Pt[] => arc(x, -18, 25, Math.PI, TAU, 10);
    return {
      ...shape(
        [
          [0, 0],
          [34, 0],
          // Up the back, along the roof of the box, down over the cab and the bonnet to the bumper.
          [34, -150],
          [236, -150],
          [236, -112],
          [288, -112],
          [318, -70],
          [342, -62],
          [346, -30],
          [346, 0],
          [380, 0],
        ],
        [
          [[34, -22], ...arch(80), ...arch(270), [346, -22]],
          // The road under the wheels, where the line went over the top.
          [
            [34, 0],
            [346, 0],
          ],
          ...wheel(80),
          ...wheel(270),
          // The red cross on the side.
          [
            [122, -112],
            [140, -112],
            [140, -98],
            [154, -98],
            [154, -80],
            [140, -80],
            [140, -66],
            [122, -66],
            [122, -80],
            [108, -80],
            [108, -98],
            [122, -98],
            [122, -112],
          ],
          [
            [34, -46],
            [236, -46],
          ],
          // Cab: window, door, handle, headlight.
          [
            [246, -104],
            [284, -104],
            [306, -74],
            [246, -74],
            [246, -104],
          ],
          [
            [242, -74],
            [242, -24],
          ],
          [
            [252, -64],
            [264, -64],
          ],
          circle(336, -50, 4, 8),
          // Light bar and its flashes.
          rect(198, -162, 26, 12),
          [
            [211, -168],
            [211, -184],
          ],
          [
            [198, -166],
            [188, -178],
          ],
          [
            [224, -166],
            [234, -178],
          ],
        ],
        'red',
        [190, -85, 480],
      ),
      spots: [
        [131, -89, 70, 'red'],
        [211, -164, 60, 'sky'],
      ],
    };
  },

  // Backpacking: a big backpack standing on the line, a sleeping mat rolled on top.
  backpack: () => {
    // The top of the pack: a flattened arch over its two sides.
    const top = arc(130, -150, 74, Math.PI, TAU, 20).map(([x, y]) => [x, -150 + (y + 150) * 0.55] as const);
    const mat = (x: number): Stroke => circle(x, -218, 13, 12).map(([px, py]) => [x + (px - x) * 0.45, py] as const);
    return {
      ...shape(
        [[0, 0], [56, 0], [56, -150], ...top, [204, -150], [204, 0], [260, 0]],
        [
          // Where the pack rests, under the line that went over it.
          [
            [56, 0],
            [204, 0],
          ],
          // Shoulder strap showing at the side.
          smooth([
            [60, -168],
            [42, -128],
            [42, -70],
            [56, -40],
          ]),
          // Top flap, and two straps down the front with their buckles.
          smooth([
            [57, -134],
            [94, -110],
            [130, -104],
            [166, -110],
            [203, -134],
          ]),
          // Front pocket, squared, with its zip.
          smooth(
            [
              [76, -72],
              [184, -72],
              [184, -12],
              [76, -12],
              [76, -72],
            ],
            1,
          ),
          [
            [82, -62],
            [178, -62],
          ],
          // Two straps down the whole front, buckled over the pocket.
          ...[100, 160].flatMap((x): Stroke[] => [
            [
              [x, -108],
              [x, -4],
            ],
            rect(x - 6, -36, 12, 9),
          ]),
          // A bottle in the side pocket.
          [
            [204, -70],
            [214, -72],
            [216, -112],
            [210, -120],
            [210, -128],
            [204, -128],
          ],
          [
            [204, -40],
            [218, -44],
            [216, -78],
            [204, -78],
          ],
          // Compression straps on the sides.
          [
            [56, -100],
            [70, -94],
          ],
          [
            [204, -100],
            [190, -94],
          ],
          // Sleeping mat, rolled and tied on top.
          mat(70),
          [
            [70, -231],
            [190, -231],
          ],
          [
            [70, -205],
            [190, -205],
          ],
          mat(190),
          circle(70, -218, 5, 8).map(([px, py]) => [70 + (px - 70) * 0.45, py] as const),
          [
            [98, -233],
            [98, -186],
          ],
          [
            [162, -233],
            [162, -186],
          ],
        ],
        'blue',
        [130, -110, 440],
      ),
      spots: [[130, -218, 80, 'sun']],
    };
  },

  // Budgeting app: a bar chart with a rising trend.
  bars: () => {
    const heights = [70, 110, 90, 160, 130, 200];
    return shape(
      [
        [0, 0],
        [320, 0],
      ],
      [
        [
          [30, 0],
          [30, -240],
        ],
        ...heights.map((h, k) => {
          const x = 45 + k * 44;
          return [
            [x, 0],
            [x, -h],
            [x + 26, -h],
            [x + 26, 0],
          ] as Stroke;
        }),
        [
          [58, -92],
          [102, -134],
          [146, -116],
          [190, -186],
          [234, -156],
          [282, -228],
        ],
        [
          [266, -226],
          [282, -228],
          [280, -212],
        ],
      ],
      'sage',
      [170, -110, 480],
    );
  },

  // Airport ramp: a runway and a plane taking off.
  plane: () =>
    shape(
      [
        [0, 0],
        [340, 0],
      ],
      [
        ...[0, 1, 2, 3].map(
          k =>
            [
              [24 + k * 12, -14 - k * 34],
              [30 + k * 12, -34 - k * 34],
            ] as Stroke,
        ),
        [
          [70, -170],
          [250, -177],
          [274, -170],
          [250, -163],
          [70, -170],
        ],
        [
          [185, -173],
          [150, -250],
          [168, -250],
          [214, -173],
        ],
        [
          [185, -167],
          [150, -90],
          [168, -90],
          [214, -167],
        ],
        [
          [92, -171],
          [72, -206],
          [84, -206],
          [108, -171],
        ],
        [
          [92, -169],
          [72, -134],
          [84, -134],
          [108, -169],
        ],
      ],
      'sky',
      [170, -150, 520],
    ),

  // Chatbot: a speech bubble, typing.
  bubble: () =>
    shape(
      [
        [0, 0],
        [50, 0],
        [80, -50],
        [40, -50],
        [40, -190],
        [290, -190],
        [290, -50],
        [110, -50],
        [50, 0],
        [330, 0],
      ],
      [circle(120, -120, 7, 10), circle(165, -120, 7, 10), circle(210, -120, 7, 10)],
      'blue',
      [165, -120, 480],
    ),

  // Training: a mortarboard, its tassel falling back into a thread under the line.
  mortarboard: () =>
    shape(
      [
        [0, 0],
        [10, -170],
        [140, -215],
        [270, -170],
        [140, -125],
        [10, -170],
        [140, -170],
        [246, -160],
        [246, -104],
        [262, -40],
        [300, 14],
      ],
      [
        [
          [65, -150],
          [65, -98],
          ...arc(140, -98, 75, Math.PI, 0, 12).map(([x, y]) => [x, -98 + (y + 98) * 0.3] as const),
          [215, -150],
        ],
      ],
      'window',
      [140, -150, 480],
    ),

  // Courses: an open book.
  book: () =>
    shape(
      [
        [0, 0],
        [20, 0],
        [30, -30],
        [30, -160],
        [150, -140],
        [270, -160],
        [270, -30],
        [300, 0],
        [330, 0],
      ],
      [
        [
          [30, -30],
          [150, -10],
          [270, -30],
        ],
        [
          [150, -140],
          [150, -10],
        ],
        ...[0, 1, 2].flatMap(
          k =>
            [
              [
                [50, -125 + k * 25],
                [130, -112 + k * 25],
              ],
              [
                [170, -112 + k * 25],
                [250, -125 + k * 25],
              ],
            ] as Stroke[],
        ),
      ],
      'dawn',
      [150, -90, 460],
    ),

  // Art platform: a framed landscape hanging from a nail.
  frame: () =>
    shape(
      [
        [0, 0],
        [40, 0],
        [40, -200],
        [260, -200],
        [260, 0],
        [300, 0],
      ],
      [
        rect(58, -182, 184, 164),
        [
          [58, -60],
          [105, -120],
          [135, -88],
          [175, -145],
          [242, -66],
        ],
        circle(95, -150, 12, 14),
        [
          [60, -200],
          [150, -250],
          [240, -200],
        ],
      ],
      'red',
      [150, -120, 500],
    ),

  // Architecture: a building blueprint with its dimension line.
  blueprint: () =>
    shape(
      [
        [0, 0],
        [30, 0],
        [30, -150],
        [110, -150],
        [110, -230],
        [200, -230],
        [200, -110],
        [260, -110],
        [260, 0],
        [300, 0],
      ],
      [
        ...[
          [128, -208],
          [164, -208],
          [128, -172],
          [164, -172],
          [128, -136],
          [164, -136],
          [48, -126],
          [80, -126],
          [48, -90],
          [80, -90],
          [216, -86],
          [236, -86],
        ].map(([x, y]) => rect(x as number, y as number, 16, 18)),
        [
          [30, -265],
          [200, -265],
        ],
        [
          [42, -273],
          [30, -265],
          [42, -257],
        ],
        [
          [188, -273],
          [200, -265],
          [188, -257],
        ],
      ],
      'blue',
      [150, -130, 500],
    ),

  // Web and mobile with messaging: a phone, chatting.
  phone: () =>
    shape(
      [
        [0, 0],
        [70, 0],
        [70, -228],
        [82, -240],
        [188, -240],
        [200, -228],
        [200, 0],
        [250, 0],
      ],
      [
        rect(82, -215, 106, 175),
        circle(135, -20, 8, 12),
        [
          [118, -228],
          [152, -228],
        ],
        [
          [92, -198],
          [152, -198],
          [152, -172],
          [100, -172],
          [92, -162],
          [92, -198],
        ],
        [
          [178, -150],
          [118, -150],
          [118, -124],
          [170, -124],
          [178, -114],
          [178, -150],
        ],
      ],
      'sky',
      [135, -120, 460],
    ),

  // Payments: a card with its chip and contactless waves.
  card: () =>
    shape(
      [
        [0, 0],
        [30, 0],
        [30, -150],
        [270, -150],
        [270, 0],
        [300, 0],
      ],
      [
        rect(60, -118, 40, 32),
        [
          [60, -102],
          [100, -102],
        ],
        [
          [60, -48],
          [110, -48],
        ],
        [
          [125, -48],
          [175, -48],
        ],
        [
          [190, -48],
          [240, -48],
        ],
        ...[12, 22, 32].map(r => arc(200, -102, r, -0.9, 0.9, 8)),
      ],
      'red',
      [150, -80, 460],
    ),

  // Serverless in production: a cloud, deployed into.
  cloud: () =>
    shape(
      [
        [0, 0],
        [30, 0],
        [50, -75],
        ...arc(85, -105, 32, (5 * Math.PI) / 6, (5 * Math.PI) / 3, 10),
        ...arc(152, -138, 48, (7 * Math.PI) / 6, (17 * Math.PI) / 9, 14),
        ...arc(225, -108, 36, (4 * Math.PI) / 3, (13 * Math.PI) / 6, 10),
        [268, -75],
        [300, 0],
        [330, 0],
      ],
      [
        [
          [50, -75],
          [268, -75],
        ],
        [
          [160, -18],
          [160, -64],
        ],
        [
          [148, -52],
          [160, -66],
          [172, -52],
        ],
      ],
      'sky',
      [160, -100, 480],
    ),
};

export const hasShape = (key: MotifKey): key is Exclude<MotifKey, 'apprentices'> => key !== 'apprentices';

export const shapeOf = (key: Exclude<MotifKey, 'apprentices'>): Shape => SHAPES[key]();

/** A cubic Bézier curve from a through control points c and d to b. */
const cubic = (a: Pt, c: Pt, d: Pt, b: Pt, n = 28): Pt[] =>
  Array.from({ length: n + 1 }, (_, i) => {
    const u = i / n;
    const v = 1 - u;
    const [k0, k1, k2, k3] = [v * v * v, 3 * u * v * v, 3 * u * u * v, u * u * u];
    return [k0 * a[0] + k1 * c[0] + k2 * d[0] + k3 * b[0], k0 * a[1] + k1 * c[1] + k2 * d[1] + k3 * b[1]] as const;
  });

/** A flight to a stop far away, over a map, in drawing units from where the line takes off. */
export type Flight = Readonly<{
  /** The line's legs: up to the first place, from place to place, then down from the last place to where it lands. */
  legs: readonly (readonly Pt[])[];
  /** Where each place lies on the map. */
  places: readonly Pt[];
  /** Land outlines around the route. */
  land: readonly (readonly Pt[])[];
  /** Centre and radius of the map, which fades out towards its edge. */
  map: readonly [x: number, y: number, r: number];
}>;

/** Drawing units per degree of latitude; degrees of longitude are shortened as they are around the route. */
const MAP_SCALE = 4.4;

/** A gentle arc from a to b, bowing to the left of the way it goes, like a flight path. */
const bow = (a: Pt, b: Pt): Pt[] => {
  const [dx, dy] = [b[0] - a[0], b[1] - a[1]];
  const k = 0.12;
  return cubic(
    a,
    [a[0] + dx / 3 + dy * k, a[1] + dy / 3 - dx * k],
    [a[0] + (2 * dx) / 3 + dy * k, a[1] + (2 * dy) / 3 - dx * k],
    b,
    16,
  );
};

/**
 * The line takes off to the first place of `route` ([longitude, latitude] pairs), flies from place to place over a
 * map, and lands `rise` below (or above) its take-off height after the last one.
 */
export function flight(route: readonly (readonly [lon: number, lat: number])[], rise: number): Flight {
  const lats = route.map(p => p[1]);
  const lons = route.map(p => p[0]);
  const [lat0, lon0] = [(Math.max(...lats) + Math.min(...lats)) / 2, lons[0] ?? 0];
  const shorten = Math.cos((lat0 * Math.PI) / 180);
  const project = ([lon, lat]: readonly [number, number]): Pt => [
    170 + (lon - lon0) * MAP_SCALE * shorten,
    -60 - (lat - lat0) * MAP_SCALE,
  ];
  const places = route.map(project);
  const first = places[0] ?? [170, -60];
  const last = places[places.length - 1] ?? first;
  const land: Pt = [last[0] + 330, rise];
  const xs = places.map(p => p[0]);
  const ys = places.map(p => p[1]);
  const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  return {
    legs: [
      cubic([0, 0], [80, 0], [first[0] - 70, first[1]], first),
      ...places.slice(1).map((p, i) => bow(places[i] ?? first, p)),
      cubic(last, [last[0] + 190, last[1]], [land[0] - 110, rise], land),
    ],
    places,
    land: LAND.map(ring => ring.map(project)),
    map: [(x0 + x1) / 2, (y0 + y1) / 2, Math.max(x1 - x0, y1 - y0) * 1.05],
  };
}

/** Inked length of strokes, leaving out the travel between them. */
export const inkLength = (list: readonly Stroke[]): number =>
  list.reduce(
    (n, s) => n + s.slice(1).reduce((m, p, i) => m + Math.hypot(p[0] - (s[i] as Pt)[0], p[1] - (s[i] as Pt)[1]), 0),
    0,
  );

export const SHAPE_KEYS = Object.keys(SHAPES) as Exclude<MotifKey, 'apprentices'>[];
