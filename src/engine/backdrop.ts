import { trace } from './canvas';
import { mulberry, noise, type Point } from './math';
import { deform } from './paper';
import { PIGMENTS } from './pigment';

/** A picture to print: a closed outline and lifted strokes, in drawing units. */
export type Picture = Readonly<{
  outline: readonly Point[];
  strokes: readonly (readonly Point[])[];
  seed: number;
}>;

/** A picture rendered once onto its own canvas, and where that canvas sits on the drawing. */
export type Sprite = Readonly<{ canvas: HTMLCanvasElement; x: number; y: number; width: number; height: number }>;

/** Pixels per drawing unit on a sprite: sharp enough for the closest zoom. */
const RESOLUTION = 2;
/** Room around a picture for washes that bleed past its outline. */
const PADDING = 40;

/** Splits every edge of a polyline so no piece is longer than `step`, so washes wobble evenly along it. */
function subdivide(points: readonly Point[], step: number): Point[] {
  const result: Point[] = [];
  points.forEach((point, index) => {
    const next = points[index + 1];
    result.push(point);
    if (!next) return;
    const pieces = Math.ceil(Math.hypot(next[0] - point[0], next[1] - point[1]) / step);
    for (let piece = 1; piece < pieces; piece++)
      result.push([
        point[0] + ((next[0] - point[0]) * piece) / pieces,
        point[1] + ((next[1] - point[1]) * piece) / pieces,
      ]);
  });
  return result;
}

const rgba = (rgb: readonly number[], alpha: number) => `rgba(${rgb.join(',')},${alpha})`;

/** The parts of an outline that rise off the ground, each closed along it: a split gate has two. */
function parts(outline: readonly Point[]): Point[][] {
  const result: Point[][] = [];
  let part: Point[] = [];
  outline.forEach((point, index) => {
    const next = outline[index + 1];
    if (point[1] < 0 || (next && next[1] < 0)) part.push(point);
    else if (part.length) {
      result.push([...part, point]);
      part = [];
    }
  });
  if (part.length) result.push(part);
  return result;
}

/** Wet translucent layers over each part of an outline, bleeding past it, darker where the pigment pools at their edge. */
function wash(
  context: CanvasRenderingContext2D,
  outline: readonly Point[],
  rgb: readonly number[],
  random: () => number,
  strength: number,
) {
  for (const part of parts(outline)) layers(context, part, rgb, random, strength);
}

function layers(
  context: CanvasRenderingContext2D,
  outline: readonly Point[],
  rgb: readonly number[],
  random: () => number,
  strength: number,
) {
  const base = deform(subdivide([...outline, outline[0] as Point], 6), 2, 0.25, random);
  for (let layer = 0; layer < 40; layer++) {
    context.fillStyle = rgba(rgb, (layer % 8 === 0 ? 0.024 : 0.009) * strength);
    context.beginPath();
    trace(context, deform(base, 2, 0.3, random));
    context.closePath();
    context.fill();
  }
  context.strokeStyle = rgba(rgb, 0.07 * strength);
  context.lineWidth = 1.6;
  context.beginPath();
  trace(context, deform(base, 1, 0.2, random));
  context.closePath();
  context.stroke();
}

/** A stroke traced by hand: each point nudged a little. */
const wobble = (stroke: readonly Point[], seed: number, amount: number): Point[] =>
  subdivide(stroke, 8).map(([x, y], index) => [
    x + noise(seed + index * 0.21) * amount,
    y + noise(seed + 40 + index * 0.21) * amount,
  ]);

/** A picture seen through morning mist: a blue-grey wash with its details traced faintly, dissolving towards its foot. */
function mist(context: CanvasRenderingContext2D, picture: Picture, bottom: number) {
  const blue = PIGMENTS.Blue;
  wash(context, picture.outline, blue, mulberry(picture.seed), 0.7);
  context.lineCap = 'round';
  context.strokeStyle = rgba(blue, 0.12);
  context.lineWidth = 1.4;
  picture.strokes.forEach((stroke, index) => {
    context.beginPath();
    trace(context, wobble(stroke, index * 7.3, 1));
    context.stroke();
  });
  const top = Math.min(...picture.outline.map(point => point[1]));
  const fade = context.createLinearGradient(0, top, 0, bottom);
  fade.addColorStop(0, 'rgba(0,0,0,0)');
  fade.addColorStop(0.45, 'rgba(0,0,0,0.1)');
  fade.addColorStop(1, 'rgba(0,0,0,1)');
  context.globalCompositeOperation = 'destination-out';
  context.fillStyle = fade;
  context.fillRect(-1e4, top, 2e4, bottom - top + PADDING);
  context.globalCompositeOperation = 'source-over';
}

/**
 * Renders a picture once, in mist, onto a canvas of its own.
 * Like the paper textures, it comes back blank when the browser refuses another canvas: a missing background is better than no drawing.
 */
export function backdropSprite(picture: Picture): Sprite {
  const points = [picture.outline, ...picture.strokes].flat();
  const xs = points.map(point => point[0]);
  const ys = points.map(point => point[1]);
  const [x, y] = [Math.min(...xs) - PADDING, Math.min(...ys) - PADDING];
  const [width, height] = [Math.max(...xs) + PADDING - x, Math.max(...ys) + PADDING - y];
  const canvas = document.createElement('canvas');
  canvas.width = Math.ceil(width * RESOLUTION);
  canvas.height = Math.ceil(height * RESOLUTION);
  const context = canvas.getContext('2d');
  if (context) {
    context.scale(RESOLUTION, RESOLUTION);
    context.translate(-x, -y);
    context.lineJoin = 'round';
    mist(context, picture, Math.max(...ys));
  }
  return { canvas, height, width, x, y };
}
