import { trace } from './canvas';
import { mulberry, type Point, TAU } from './math';
import { PIGMENTS, type Pigment } from './pigment';

const gaussian = (random: () => number): number => (random() + random() + random() + random() - 2) * 0.9;

/** Splits every edge of a polygon at a randomly pushed midpoint, `depth` times over. */
function deform(points: readonly Point[], depth: number, variance: number, random: () => number): readonly Point[] {
  let result = points;
  for (let iteration = 0; iteration < depth; iteration++) {
    const refined: Point[] = [];
    for (let index = 0; index < result.length; index++) {
      const from = result[index] as Point;
      const to = result[(index + 1) % result.length] as Point;
      const length = Math.hypot(to[0] - from[0], to[1] - from[1]);
      const angle = random() * TAU;
      const offset = gaussian(random) * length * variance;
      refined.push(from, [
        (from[0] + to[0]) / 2 + Math.cos(angle) * offset,
        (from[1] + to[1]) / 2 + Math.sin(angle) * offset,
      ]);
    }
    result = refined;
  }
  return result;
}

/**
 * Layered, randomly deformed translucent polygons: the classic generative watercolour wash.
 * Like the other paper textures, it comes back blank when the browser refuses another canvas (phones cap canvas memory): a missing texture is better than no drawing.
 */
export function watercolour(pigment: Pigment, seed: number): HTMLCanvasElement {
  const random = mulberry(seed);
  const size = 420;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const context = canvas.getContext('2d');
  if (!context) return canvas;
  const [red, green, blue] = PIGMENTS[pigment];
  let base: Point[] = [];
  for (let index = 0; index < 10; index++) {
    const angle = (index / 10) * TAU;
    const distance = 112 * (0.8 + random() * 0.4);
    base.push([size / 2 + Math.cos(angle) * distance, size / 2 + Math.sin(angle) * distance]);
  }
  base = [...deform(base, 3, 0.42, random)];
  for (let layer = 0; layer < 48; layer++) {
    const polygon = deform(base, 3, 0.4, random);
    context.fillStyle = `rgba(${red},${green},${blue},${layer % 8 === 0 ? 0.026 : 0.012})`;
    context.beginPath();
    trace(context, polygon);
    context.closePath();
    context.fill();
  }
  return canvas;
}

/** A tile of paper grain and fibres, repeated under the drawing. */
export function paperGrain(): HTMLCanvasElement {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const context = canvas.getContext('2d');
  if (!context) return canvas;
  const image = context.createImageData(size, size);
  const random = mulberry(99);
  for (let index = 0; index < size * size; index++) {
    const value = random();
    const offset = index * 4;
    if (value < 0.5) {
      image.data.set([90, 70, 50, value * 34], offset);
    } else {
      image.data.set([255, 250, 240, (value - 0.5) * 30], offset);
    }
  }
  context.putImageData(image, 0, 0);
  context.strokeStyle = 'rgba(120,95,70,0.07)';
  context.lineWidth = 0.7;
  for (let index = 0; index < 70; index++) {
    const x = random() * size;
    const y = random() * size;
    const angle = random() * TAU;
    const length = 6 + random() * 22;
    context.beginPath();
    context.moveTo(x, y);
    context.quadraticCurveTo(
      x + Math.cos(angle + 0.5) * length * 0.5,
      y + Math.sin(angle + 0.5) * length * 0.5,
      x + Math.cos(angle) * length,
      y + Math.sin(angle) * length,
    );
    context.stroke();
  }
  return canvas;
}

/** A darkening towards the edges of a screen of the given size, laid over the drawing. */
export function vignette(width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, width);
  canvas.height = Math.max(1, height);
  const context = canvas.getContext('2d');
  if (!context) return canvas;
  const gradient = context.createRadialGradient(
    width / 2,
    height / 2,
    Math.min(width, height) * 0.3,
    width / 2,
    height / 2,
    Math.hypot(width, height) * 0.62,
  );
  gradient.addColorStop(0, 'rgba(90,60,30,0)');
  gradient.addColorStop(1, 'rgba(90,60,30,0.26)');
  context.fillStyle = gradient;
  context.fillRect(0, 0, width, height);
  return canvas;
}
