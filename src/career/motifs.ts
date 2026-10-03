import type { MotifKey } from '../data/types';
import { TAU } from '../engine/math';
import type { Pigment } from '../engine/paper';

export type Pt = readonly [x: number, y: number];
export type Stroke = readonly Pt[];

/**
 * A shape drawn by the pen, relative to where it touches the line (y grows downwards, so shapes rise at negative y).
 * The first stroke starts at the origin; the pen lifts between strokes and the last point is where the line carries on.
 */
export type Shape = Readonly<{
  strokes: readonly Stroke[];
  pigment: Pigment;
  /** Centre and size of the watercolour wash under the shape. */
  wash: readonly [x: number, y: number, size: number];
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

/** Builds a shape whose outline runs from the origin back to the line; details follow, then the pen returns. */
function shape(outline: Stroke, details: readonly Stroke[], pigment: Pigment, wash: Shape['wash']): Shape {
  const exit = outline[outline.length - 1] as Pt;
  return { strokes: [outline, ...details, [exit]], pigment, wash };
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
  // Door-to-door: a door, its knob and letterbox.
  door: () =>
    shape(
      [
        [0, 0],
        [40, 0],
        [40, -180],
        [150, -180],
        [150, 0],
        [200, 0],
      ],
      [
        circle(128, -92, 7, 12),
        [
          [70, -125],
          [120, -125],
        ],
      ],
      'ochre',
      [95, -95, 420],
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

  // Field scouting: rows running to the horizon, one weed circled.
  furrows: () => {
    const rows: Pt[] = [[0, 0]];
    const n = 8;
    for (let k = 0; k < n; k++) {
      const bottom: Pt = [30 + k * 40, 0];
      const top: Pt = [118 + (k * 104) / (n - 1), -150];
      // Ploughing back and forth: up one row, down the next.
      rows.push(...(k % 2 ? [top, bottom] : [bottom, top]));
    }
    rows.push([340, 0]);
    const sprout = (x: number, y: number): Stroke => [
      [x - 6, y - 10],
      [x, y],
      [x + 6, y - 12],
    ];
    return shape(
      rows,
      [
        [
          [80, -150],
          [262, -150],
        ],
        sprout(110, -60),
        sprout(170, -100),
        sprout(232, -40),
        circle(232, -45, 17, 16),
      ],
      'sage',
      [170, -70, 440],
    );
  },

  // Kitchen: a pan with rising steam.
  pan: () => {
    const steam = (x0: number): Stroke =>
      Array.from({ length: 13 }, (_, i) => [x0 + 8 * Math.sin(i * 0.9), -92 - i * 10] as const);
    return shape(
      [
        [0, 0],
        [30, 0],
        [45, -62],
        [115, -62],
        ...arc(185, -62, 70, Math.PI, 0, 18).map(([x, y]) => [x, -62 + (y + 62) * 0.72] as const),
        [285, 0],
        [320, 0],
      ],
      [
        [
          [110, -66],
          [260, -66],
        ],
        steam(155),
        steam(185),
        steam(215),
      ],
      'rose',
      [185, -110, 460],
    );
  },

  // Cattle and sheep: a picket fence.
  pickets: () => {
    const outline: Pt[] = [[0, 0]];
    for (let i = 0; i < 5; i++) {
      const x = 30 + i * 46;
      outline.push([x, 0], [x, -110], [x + 12, -128], [x + 24, -110], [x + 24, 0]);
    }
    outline.push([280, 0]);
    return shape(
      outline,
      [
        [
          [20, -42],
          [250, -42],
        ],
        [
          [20, -84],
          [250, -84],
        ],
      ],
      'ochre',
      [135, -70, 440],
    );
  },

  // Carpenter's showcase: a gallery of works.
  browserGallery: () =>
    browser(
      [55, 135, 215].flatMap(x => [rect(x, -160, 70, 60), rect(x, -88, 70, 60)]),
      'ochre',
    ),

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

  // Ambulance dispatch: a winding route to a pin marked with a cross.
  routeCross: () => {
    const [cx, cy, r] = [200, -175, 45];
    const tangent = Math.acos(r / 75);
    return shape(
      [
        [0, 0],
        [30, 0],
        [60, -12],
        [95, -40],
        [130, -50],
        [165, -64],
        [200, -100],
        ...arc(cx, cy, r, Math.PI / 2 + tangent, Math.PI / 2 - tangent + TAU, 26),
        [200, -100],
        [235, -45],
        [270, -10],
        [300, 0],
        [330, 0],
      ],
      [
        [
          [cx, cy - 22],
          [cx, cy + 22],
        ],
        [
          [cx - 22, cy],
          [cx + 22, cy],
        ],
      ],
      'red',
      [190, -130, 480],
    );
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
  mortarboard: () => ({
    strokes: [
      [
        [0, 0],
        [10, -170],
        [140, -215],
        [270, -170],
        [140, -125],
        [10, -170],
      ],
      [
        [65, -150],
        [65, -98],
        ...arc(140, -98, 75, Math.PI, 0, 12).map(([x, y]) => [x, -98 + (y + 98) * 0.3] as const),
        [215, -150],
      ],
      [
        [140, -170],
        [246, -160],
        [246, -104],
        [262, -40],
        [300, 14],
      ],
    ],
    pigment: 'window',
    wash: [140, -150, 480],
  }),

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

export const SHAPE_KEYS = Object.keys(SHAPES) as Exclude<MotifKey, 'apprentices'>[];
