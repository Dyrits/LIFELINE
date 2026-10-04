import { bilingual, type ShapeKey, type Text } from '../data/types';
import { type Point, TAU } from '../engine/math';
import type { Pigment } from '../engine/pigment';

/** A stroke of the pen through its points. */
export type Stroke = readonly Point[];

/**
 * A shape drawn on the line, relative to where it touches it (y grows downwards, so shapes rise at negative y).
 * The outline is one unbroken stroke from the origin to where the line carries on; the details are lifted strokes, drawn by a second pen so the line itself never breaks.
 */
export type Shape = Readonly<{
  outline: Stroke;
  details: readonly Stroke[];
  pigment: Pigment;
  /** Centre and size of the watercolour wash under the shape. */
  wash: readonly [x: number, y: number, size: number];
  /** Small washes of another colour over parts of the shape, laid as the details finish. */
  spots?: readonly (readonly [x: number, y: number, size: number, pigment: Pigment])[];
  /** Words written on the shape, centred on (x, y), once its details are drawn. */
  words?: readonly (readonly [x: number, y: number, text: Text])[];
}>;

/** Points around a circle; angles in radians, y downwards (so -π/2 is the top). */
const arc = (x: number, y: number, radius: number, from: number, to: number, count = 20): Point[] =>
  Array.from({ length: count + 1 }, (_, index) => polar(x, y, radius, from + ((to - from) * index) / count));
const circle = (x: number, y: number, radius: number, count = 18): Point[] =>
  arc(x, y, radius, -Math.PI / 2, -Math.PI / 2 + TAU, count);
const rect = (x: number, y: number, width: number, height: number): Point[] => [
  [x, y],
  [x + width, y],
  [x + width, y + height],
  [x, y + height],
  [x, y],
];
/** The point at `radius` from (x, y), in the direction `angle`. */
const polar = (x: number, y: number, radius: number, angle: number): Point => [
  x + radius * Math.cos(angle),
  y + radius * Math.sin(angle),
];

/** Rounds the corners of an open polyline, keeping its ends (Chaikin's corner cutting). */
const smooth = (points: readonly Point[], iterations = 2): Point[] => {
  let result = [...points];
  for (let iteration = 0; iteration < iterations; iteration++) {
    const refined: Point[] = [result[0] as Point];
    for (let index = 0; index < result.length - 1; index++) {
      const [from, to] = [result[index] as Point, result[index + 1] as Point];
      refined.push(
        [0.75 * from[0] + 0.25 * to[0], 0.75 * from[1] + 0.25 * to[1]],
        [0.25 * from[0] + 0.75 * to[0], 0.25 * from[1] + 0.75 * to[1]],
      );
    }
    refined.push(result[result.length - 1] as Point);
    result = refined;
  }
  return result;
};

function define(outline: Stroke, details: readonly Stroke[], pigment: Pigment, wash: Shape['wash']): Shape {
  return { details, outline, pigment, wash };
}

/** A browser window standing on the line, with its content drawn inside. */
function browser(content: readonly Stroke[], pigment: Pigment): Shape {
  return define(
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

const SHAPES: Record<ShapeKey, () => Shape> = {
  // Ambulance dispatch: an ambulance, its light bar flashing.
  Ambulance: () => {
    const wheel = (x: number): Stroke[] => [circle(x, -18, 18, 16), circle(x, -18, 6, 10)];
    // The body's lower edge, rising over each wheel.
    const arch = (x: number): Point[] => arc(x, -18, 25, Math.PI, TAU, 10);
    return {
      ...define(
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
        'Red',
        [190, -85, 480],
      ),
      spots: [
        [131, -89, 70, 'Red'],
        [211, -164, 60, 'Sky'],
      ],
    };
  },

  // Inventory: a barcode.
  Barcode: () =>
    define(
      [
        [0, 0],
        [210, 0],
      ],
      [20, 26, 34, 38, 50, 58, 62, 74, 80, 92, 96, 104, 116, 122, 130, 138, 142, 154, 162, 170, 176, 188].map(x => [
        [x, -24],
        [x, -124],
      ]),
      'Grey',
      [105, -75, 380],
    ),

  // Budgeting app: a bar chart with a rising trend.
  Bars: () => {
    const heights = [70, 110, 90, 160, 130, 200];
    return define(
      [
        [0, 0],
        [320, 0],
      ],
      [
        [
          [30, 0],
          [30, -240],
        ],
        ...heights.map((height, index) => {
          const x = 45 + index * 44;
          return [
            [x, 0],
            [x, -height],
            [x + 26, -height],
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
      'Sage',
      [170, -110, 480],
    );
  },

  // Architecture: a building blueprint with its dimension line.
  Blueprint: () =>
    define(
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
      'Blue',
      [150, -130, 500],
    ),

  // Energy suppliers: a lightning bolt, sparking.
  Bolt: () =>
    define(
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
      'Sun',
      [150, -140, 440],
    ),

  // Courses: an open book.
  Book: () =>
    define(
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
          row =>
            [
              [
                [50, -125 + row * 25],
                [130, -112 + row * 25],
              ],
              [
                [170, -112 + row * 25],
                [250, -125 + row * 25],
              ],
            ] as Stroke[],
        ),
      ],
      'Dawn',
      [150, -90, 460],
    ),

  // Hotel bookings: an availability calendar, one day circled.
  BrowserCalendar: () => {
    const grid: Stroke[] = [rect(60, -165, 220, 145)];
    for (const y of [-135, -105, -75, -45])
      grid.push([
        [60, y],
        [280, y],
      ]);
    for (let column = 1; column < 7; column++) {
      const x = 60 + (column * 220) / 7;
      grid.push([
        [x, -135],
        [x, -20],
      ]);
    }
    grid.push(circle(186, -90, 14, 14));
    return browser(grid, 'Sky');
  },

  // Booking platform: code brackets.
  BrowserCode: () =>
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
      'Sky',
    ),

  // Carpenter's showcase: a gallery of his woodwork, a piece of furniture in each frame.
  BrowserGallery: () => {
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
          circle(x + 35, y + 22, 16, 16).map(
            ([pointX, pointY]) => [pointX, y + 22 + (pointY - y - 22) * 0.25] as const,
          ),
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
          (offset): Stroke => [
            [x + offset, y + 23],
            [x + offset + (offset === 40 ? 4 : 0), y + 12],
          ],
        ),
        ...[22, 28, 36, 42].map(
          (offset): Stroke => [
            [x + offset, y + 38],
            [x + offset, y + 28],
          ],
        ),
      ],
    ];
    const frames = [55, 135, 215].flatMap(x => [
      [x, -160],
      [x, -88],
    ]);
    return browser(
      frames.flatMap(([x = 0, y = 0], index) => [rect(x, y, 70, 60), ...(pieces[index]?.(x, y) ?? [])]),
      'Ochre',
    );
  },

  // Chatbot: a speech bubble, typing.
  Bubble: () =>
    define(
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
      'Blue',
      [165, -120, 480],
    ),

  // Bali: a candi bentar, the split gate before a temple. Two stepped towers cut clean down the middle; the line climbs one half, walks through the gap and climbs down the other.
  CandiBentar: () => {
    // The outer profile of the left half, from the ground up to its peak at the cut.
    const half: Point[] = [
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
    const mirror = (point: Point): Point => [300 - point[0], point[1]];
    // Ledges across each tier, from the outer edge to the cut, on both halves.
    const ledges = [-30, -100, -110, -136, -162, -188].flatMap((y): Stroke[] => {
      const x = (half.find(point => point[1] === y) ?? [20, y])[0];
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
      const carving = curl(x, y);
      return [carving, carving.map(mirror)];
    });
    const panel = (x: number): Stroke[] => [rect(x, -88, 46, 44), circle(x + 23, -66, 12, 12)];
    return {
      ...define(
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
        'Rose',
        [150, -120, 460],
      ),
      spots: [
        [20, -10, 80, 'Sage'],
        [280, -10, 80, 'Sage'],
      ],
    };
  },

  // Payments: a card with its chip and contactless waves.
  Card: () =>
    define(
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
        ...[12, 22, 32].map(radius => arc(200, -102, radius, -0.9, 0.9, 8)),
      ],
      'Red',
      [150, -80, 460],
    ),

  // Serverless in production: a cloud, deployed into.
  Cloud: () =>
    define(
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
      'Sky',
      [160, -100, 480],
    ),

  // Heading for Asia: a compass resting on the line, which the line goes round anticlockwise, keeping its way; its needle turned from south to north-west.
  Compass: () => {
    const [x, y, radius] = [150, -90, 90];
    // Angles on screen, y downwards: south is π/2, north-west 5π/4.
    const [south, northWest] = [Math.PI / 2, (5 * Math.PI) / 4];
    const needle = (length: number, angle: number): Point => polar(x, y, length, angle);
    const ticks = Array.from({ length: 16 }, (_, index): Stroke => {
      const angle = (index * TAU) / 16;
      return [polar(x, y, index % 4 ? 80 : 72, angle), polar(x, y, 86, angle)];
    });
    // The needle's sweep, dashed, from south round to just short of its north end, then an arrowhead along it.
    const sweep = Array.from({ length: 4 }, (_, index): Stroke => {
      const from = south + 0.4 + index * 0.38;
      return arc(x, y, 52, from, from + 0.16, 4);
    });
    const end = polar(x, y, 52, south + 0.4 + 3 * 0.38 + 0.16);
    const heading = south + 0.4 + 3 * 0.38 + 0.16 + Math.PI / 2;
    return {
      ...define(
        [[0, 0], [x, 0], ...arc(x, y, radius, south, south - TAU, 40).slice(1), [x, 0], [300, 0]],
        [
          ...ticks,
          // The needle: a long diamond, its north half split down the middle.
          [
            needle(62, northWest),
            needle(9, northWest + Math.PI / 2),
            needle(62, northWest + Math.PI),
            needle(9, northWest - Math.PI / 2),
            needle(62, northWest),
          ],
          [needle(62, northWest), needle(0, 0)],
          circle(x, y, 5, 10),
          ...sweep,
          [polar(end[0], end[1], 9, heading + Math.PI - 0.5), end, polar(end[0], end[1], 9, heading + Math.PI + 0.5)],
        ],
        'Sky',
        [x, y, 360],
      ),
      spots: [[...needle(32, northWest), 34, 'Red']],
      words: [
        [x, y - 66, bilingual('N', 'N')],
        [x + 66, y, bilingual('E', 'E')],
        [x, y + 66, bilingual('S', 'S')],
        [x - 66, y, bilingual('O', 'W')],
      ],
    };
  },

  // Art platform: a framed landscape hanging from a nail.
  Frame: () =>
    define(
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
      'Red',
      [150, -120, 500],
    ),

  // Training: a mortarboard, its tassel falling back into a thread under the line.
  Mortarboard: () =>
    define(
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
      'Window',
      [140, -150, 480],
    ),
  // Street distribution: a newspaper, its corner folded.
  Newspaper: () =>
    define(
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
      'Ochre',
      [135, -90, 420],
    ),

  // Bar kitchen: a cocktail glass on the bar, and a pan tossing food over a gas flame, steam curling up.
  Pan: () => {
    const steam = (x: number, y: number, turn: number): Stroke =>
      smooth(
        Array.from({ length: 11 }, (_, index) => [x + turn * 9 * Math.sin(index * 0.95), y - index * 10] as const),
      );
    // A gas flame: a small tongue rising from the burner.
    const flame = (x: number, height: number): Stroke =>
      smooth([
        [x - 5, -31],
        [x - 4, -31 - height * 0.5],
        [x, -31 - height],
        [x + 4, -31 - height * 0.5],
        [x + 5, -31],
      ]);
    const ellipse = (x: number, y: number, radius: Readonly<{ x: number; y: number }>, count = 20): Stroke =>
      Array.from({ length: count + 1 }, (_, index) => {
        const angle = Math.PI + (index / count) * TAU;
        return [x + radius.x * Math.cos(angle), y + radius.y * Math.sin(angle)] as const;
      });
    return {
      ...define(
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
          ...[176, 194, 212, 230, 248].map((x, index) => flame(x, index % 2 ? 9 : 13)),
          // Pan: body, rim, long handle.
          [
            [146, -78],
            [158, -48],
            [262, -48],
            [274, -78],
          ],
          ellipse(210, -78, { x: 64, y: 7 }),
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
        'Rose',
        [190, -95, 480],
      ),
      spots: [
        [212, -40, 56, 'Sun'],
        [50, -100, 70, 'Sun'],
      ],
    };
  },

  // Web and mobile with messaging: a phone, chatting.
  Phone: () =>
    define(
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
      'Sky',
      [135, -120, 460],
    ),

  // Cattle and sheep marking: a farm. A barn, a fence, a windmill pumping water, and a ewe with her lamb.
  Pickets: () => {
    // A sheep standing on the line: a woolly body, a dark face, four legs.
    const sheep = (x: number, scale: number): Stroke[] => {
      const wool = Array.from({ length: 37 }, (_, index): Point => {
        const angle = (index / 36) * TAU;
        const fluff = 1 + 0.1 * Math.abs(Math.sin(angle * 5));
        return [x + 22 * scale * fluff * Math.cos(angle), -27 * scale + 12 * scale * fluff * Math.sin(angle)];
      });
      const face = Array.from({ length: 13 }, (_, index): Point => {
        const angle = (index / 12) * TAU;
        return [
          x + 25 * scale + 7 * scale * Math.cos(angle),
          -34 * scale + 5 * scale * Math.sin(angle) + 2 * scale * Math.cos(angle),
        ];
      });
      return [
        wool,
        face,
        [
          [x + 22 * scale, -39 * scale],
          [x + 18 * scale, -44 * scale],
        ],
        ...[-14, -6, 6, 13].map(
          (offset): Stroke => [
            [x + offset * scale, -17 * scale],
            [x + offset * scale, 0],
          ],
        ),
      ];
    };
    // The hub of the windmill's wheel.
    const hub = { x: 266, y: -178 };
    return {
      ...define(
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
          [264, hub.y + 10],
          [268, hub.y + 10],
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
            const lean = (height: number) => (14 * height) / (hub.y + 10);
            return [
              [250 + lean(y), y],
              [282 - lean(y - 26), y - 26],
            ];
          }),
          circle(hub.x, hub.y, 30, 22),
          circle(hub.x, hub.y, 12, 12),
          ...Array.from(
            { length: 12 },
            (_, index): Stroke => [
              polar(hub.x, hub.y, 12, (index * TAU) / 12),
              polar(hub.x, hub.y, 30, (index * TAU) / 12 + 0.12),
            ],
          ),
          [
            [hub.x + 6, hub.y],
            [hub.x + 52, hub.y - 4],
            [hub.x + 60, hub.y - 16],
            [hub.x + 60, hub.y + 8],
            [hub.x + 52, hub.y - 4],
          ],
          ...sheep(316, 1),
          ...sheep(372, 0.62),
        ],
        'Ochre',
        [200, -90, 500],
      ),
      spots: [
        [340, -20, 110, 'Sage'],
        [hub.x, hub.y, 80, 'Sky'],
        [75, -60, 110, 'Red'],
      ],
    };
  },

  // Airport ramp: a runway and a plane taking off.
  Plane: () =>
    define(
      [
        [0, 0],
        [340, 0],
      ],
      [
        ...[0, 1, 2, 3].map(
          index =>
            [
              [24 + index * 12, -14 - index * 34],
              [30 + index * 12, -34 - index * 34],
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
      'Sky',
      [170, -150, 520],
    ),

  // Field scouting: a skeleton weed (Chondrilla juncea). Toothed rosette leaves at its foot, stiff bristles pointing down along the base of the stem, wiry branches with a few narrow leaves, yellow flower heads of notched strap-shaped petals, closed buds, and a seed head like a dandelion clock.
  SkeletonWeed: () => {
    const BASE: Point = [150, 0];
    // A runcinate leaf: its upper edge cut into lobes hooked back towards the base, its lower edge smooth, its corners rounded so it reads as a leaf rather than a saw.
    const leaf = (tip: Point, lobes = 4, width = 14): Point[] => {
      const delta = { x: tip[0] - BASE[0], y: tip[1] - BASE[1] };
      const length = Math.hypot(delta.x, delta.y);
      const normal = { x: delta.y / length, y: -delta.x / length };
      const side = normal.y < 0 ? 1 : -1;
      const pointAt = (progress: number, offset: number, back = 0): Point => [
        BASE[0] + delta.x * progress + normal.x * offset * side - (delta.x / length) * back,
        BASE[1] + delta.y * progress + normal.y * offset * side - (delta.y / length) * back,
      ];
      const steps = Array.from({ length: lobes }, (_, index) => 0.12 + (0.66 * index) / lobes);
      const upper = steps.flatMap(progress => {
        const lobeWidth = width * (1 - progress * 0.45);
        return [
          pointAt(progress, 2),
          pointAt(progress + 0.35 / lobes, lobeWidth * 0.55),
          pointAt(progress + 0.7 / lobes, lobeWidth, lobeWidth * 0.5),
        ];
      });
      const lower = [0.85, 0.6, 0.35, 0.12].map(progress => pointAt(progress, -5 - 3 * Math.sin(progress * Math.PI)));
      return smooth([BASE, ...upper, tip, ...lower, BASE]).slice(1);
    };
    // The midrib of a leaf, drawn by the detail pen.
    const rib = (tip: Point): Stroke => [
      [BASE[0] + (tip[0] - BASE[0]) * 0.08, BASE[1] + (tip[1] - BASE[1]) * 0.08],
      [BASE[0] + (tip[0] - BASE[0]) * 0.86, BASE[1] + (tip[1] - BASE[1]) * 0.86],
    ];
    // A flower head: a disc and its strap-shaped petals, broad enough to read through the pen's wobble.
    const head = (x: number, y: number, count = 9, length = 24, turn = 0): Stroke[] => [
      circle(x, y, 5.5, 12),
      ...Array.from({ length: count }, (_, index): Stroke => {
        const angle = turn + (index * TAU) / count;
        // A point of the petal at `radius`, `half` its width to one side of its middle.
        const petal = (radius: number, half: number): Point => polar(x, y, radius, angle + half / radius);
        return smooth(
          [
            petal(7, -2),
            petal(length * 0.55, -3.6),
            petal(length, -2.6),
            petal(length + 2, 0),
            petal(length, 2.6),
            petal(length * 0.55, 3.6),
            petal(7, 2),
          ],
          1,
        );
      }),
    ];
    // A closed bud: a narrow teardrop held in two sepals, pointing along `angle`.
    const bud = (x: number, y: number, angle: number): Stroke[] => {
      const at = (radius: number, turn: number): Point => polar(x, y, radius, angle + turn);
      return [
        [at(0, 0), at(7, -0.45), at(14, -0.2), at(17, 0), at(14, 0.2), at(7, 0.45), at(0, 0)],
        [at(0, 0), at(8, -0.9)],
        [at(0, 0), at(8, 0.9)],
      ];
    };
    // A seed head: fine rays, each ending in a small tuft.
    const clock = (x: number, y: number): Stroke[] =>
      Array.from({ length: 14 }, (_, index): Stroke[] => {
        const angle = (index * TAU) / 14;
        const at = (radius: number, turn = 0): Point => polar(x, y, radius, angle + turn);
        return [
          [at(2), at(13)],
          [at(13), at(17, -0.12)],
          [at(13), at(17, 0.12)],
        ];
      }).flat();
    const LEAVES: readonly [Point, Point, Point, Point] = [
      [40, -62],
      [96, -108],
      [206, -106],
      [262, -58],
    ];
    // Stiff bristles along the foot of the stem, pointing down.
    const bristles = Array.from({ length: 8 }, (_, index): Stroke => {
      const y = -12 - index * 6;
      const side = index % 2 ? 1 : -1;
      return [
        [150 + side, y],
        [150 + side * 10, y + 7],
      ];
    });
    // A narrow leaf on a branch: a thin blade from a joint.
    const blade = (x: number, y: number, angle: number, length = 16): Stroke => {
      const at = (radius: number, turn: number): Point => polar(x, y, radius, angle + turn);
      return [at(0, 0), at(length * 0.5, -0.12), at(length, 0), at(length * 0.5, 0.12), at(0, 0)];
    };
    return {
      ...define(
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
        'Sage',
        [150, -120, 440],
      ),
      spots: [
        [152, -270, 84, 'Sun'],
        [90, -226, 72, 'Sun'],
        [214, -244, 74, 'Sun'],
        [248, -118, 64, 'Sun'],
      ],
    };
  },
};

/** The shapes the pen can draw, by key. */
export const shape = {
  /** Every key, in the order the shapes are defined. */
  keys: Object.keys(SHAPES) as readonly ShapeKey[],
  /** A fresh shape, built from its key. */
  of: (key: ShapeKey): Shape => SHAPES[key](),
};

/** Inked length of strokes, leaving out the travel between them. */
export const inkLength = (list: readonly Stroke[]): number =>
  list.reduce(
    (total, stroke) =>
      total +
      stroke
        .slice(1)
        .reduce(
          (length, point, index) =>
            length + Math.hypot(point[0] - (stroke[index] as Point)[0], point[1] - (stroke[index] as Point)[1]),
          0,
        ),
    0,
  );
