import type { Lang } from '../data/types';
import { backdropSprite, type Sprite } from './backdrop';
import { context2d, trace } from './canvas';
import { clamp, ease, lerp, type Point, TAU } from './math';
import { paperGrain, vignette, watercolour } from './paper';
import { PIGMENTS } from './pigment';
import {
  type Blot,
  type InkPoint,
  type Label,
  labelAlpha,
  type MapPrint,
  type PicturePrint,
  type Plane,
  type Story,
  type Thread,
} from './story';

/** Where the camera looks and how close; it moves in place as it follows the pens. */
export type Camera = { x: number; y: number; zoom: number };

/** The pen tip of a thread at a moment; `done` is how long the thread has been resting there. */
export type Tip = Readonly<{
  x: number;
  y: number;
  width: number;
  alpha: number;
  index: number;
  done: number;
  up: boolean;
}>;

const PAPER = '#efe6d4';

/** How a label sits against its place, by side: text alignment and the direction of the gap. */
const LABEL_SIDES: Record<
  Label['side'],
  Readonly<{ align: CanvasTextAlign; baseline: CanvasTextBaseline; offset: Point }>
> = {
  Above: { align: 'center', baseline: 'bottom', offset: [0, -1] },
  Below: { align: 'center', baseline: 'top', offset: [0, 1] },
  Centre: { align: 'center', baseline: 'middle', offset: [0, 0] },
  Left: { align: 'right', baseline: 'middle', offset: [-1, 0] },
  Right: { align: 'left', baseline: 'middle', offset: [1, 0] },
};

function lastBefore(points: readonly InkPoint[], time: number): number {
  const first = points[0];
  if (!first || first.time > time) return -1;
  let low = 0;
  let high = points.length - 1;
  while (low < high) {
    const middle = (low + high + 1) >> 1;
    if ((points[middle] as InkPoint).time <= time) low = middle;
    else high = middle - 1;
  }
  return low;
}

/** The tip of a thread at a moment, or null before it starts. */
export function tip(thread: Thread, time: number): Tip | null {
  const index = lastBefore(thread.points, time);
  if (index < 0) return null;
  const point = thread.points[index] as InkPoint;
  const next = thread.points[index + 1];
  // At the end, or waiting to resume somewhere else: the pen rests.
  if (!next || (next.up && next.time - point.time > 0.5))
    return {
      alpha: point.alpha,
      done: time - point.time,
      index,
      up: point.up,
      width: point.width,
      x: point.x,
      y: point.y,
    };
  const fraction = clamp((time - point.time) / (next.time - point.time || 1), 0, 1);
  return {
    alpha: point.alpha,
    done: 0,
    index,
    up: next.up,
    width: point.width,
    x: lerp(point.x, next.x, fraction),
    y: lerp(point.y, next.y, fraction),
  };
}

/** Draws a story onto a canvas at a given moment, from a given camera. */
export class Renderer {
  width = 0;
  height = 0;
  scale = 1;
  /** Language of the names written on the drawing. */
  lang: Lang = 'fr';
  private readonly context: CanvasRenderingContext2D;
  private readonly grain: CanvasPattern | null;
  private vignette: HTMLCanvasElement | null = null;
  private readonly sprites = new Map<Blot, HTMLCanvasElement>();
  private readonly pictures = new Map<PicturePrint, Sprite>();
  private pixelRatio = 1;

  constructor(private readonly canvas: HTMLCanvasElement) {
    this.context = context2d(canvas);
    this.grain = this.context.createPattern(paperGrain(), 'repeat');
  }

  resize(width: number, height: number, pixelRatio: number): void {
    this.width = width;
    this.height = height;
    this.pixelRatio = pixelRatio;
    this.canvas.width = Math.round(width * pixelRatio);
    this.canvas.height = Math.round(height * pixelRatio);
    this.vignette = vignette(width, height);
  }

  /** Scale at zoom 1 for the current viewport. */
  baseScale(): number {
    return Math.min(this.height / 900, this.width / 1150);
  }

  /** Where a point of the drawing is on screen, seen from the camera. */
  toScreen(camera: Camera, x: number, y: number): [number, number] {
    return [(x - camera.x) * this.scale + this.width / 2, (y - camera.y) * this.scale + this.height / 2];
  }

  /** Draws the story as it stands at `time`, threads in `order`, back to front. */
  render<Name extends string>(story: Story<Name>, camera: Camera, time: number, order: readonly Name[]): void {
    const { context, width, height } = this;
    this.scale = this.baseScale() * camera.zoom;
    context.setTransform(this.pixelRatio, 0, 0, this.pixelRatio, 0, 0);
    context.globalAlpha = 1;
    context.fillStyle = PAPER;
    context.fillRect(0, 0, width, height);
    if (this.grain) {
      const offsetX = (((-camera.x * this.scale) % 256) + 256) % 256;
      const offsetY = (((-camera.y * this.scale) % 256) + 256) % 256;
      context.save();
      context.translate(offsetX - 256, offsetY - 256);
      context.fillStyle = this.grain;
      context.fillRect(0, 0, width + 512, height + 512);
      context.restore();
    }
    this.draw.blots(story.blots.items, camera, time);
    for (const print of story.prints.items)
      if (print.kind === 'Map') this.draw.map(print, camera, time);
      else this.draw.picture(print, camera, time);
    context.lineCap = 'round';
    context.lineJoin = 'round';
    for (const name of order) {
      this.draw.thread(
        story.threads.get(name),
        camera,
        time,
        story.planes.items.find(plane => plane.pen === name && time > plane.start && time < plane.end),
      );
    }
    for (const label of story.labels.items) this.draw.label(label, camera, time);
    if (this.vignette) context.drawImage(this.vignette, 0, 0, width, height);
  }

  private readonly draw = {
    blots: (blots: readonly Blot[], camera: Camera, time: number): void => {
      const { context, width, height } = this;
      context.globalCompositeOperation = 'multiply';
      for (const blot of blots) {
        const age = time - blot.time;
        if (age <= 0) continue;
        const progress = ease.out(clamp(age / 3.2, 0, 1));
        const size = blot.size * this.scale * (0.72 + 0.28 * progress);
        const [x, y] = this.toScreen(camera, blot.x, blot.y);
        const wide = size * (blot.stretch ?? 1);
        if (x + wide < 0 || x - wide > width || y + size < 0 || y - size > height) continue;
        let sprite = this.sprites.get(blot);
        if (!sprite) {
          sprite = watercolour(blot.pigment, blot.seed);
          this.sprites.set(blot, sprite);
        }
        context.globalAlpha = progress * blot.alpha;
        context.drawImage(sprite, x - wide / 2, y - size / 2, wide, size);
      }
      context.globalAlpha = 1;
      context.globalCompositeOperation = 'source-over';
    },

    /** A name written in small italics beside its place, appearing when the line reaches it and gone from the overview. */
    label: (label: Label, camera: Camera, time: number): void => {
      const { context, scale } = this;
      const alpha = labelAlpha(label, time);
      if (alpha <= 0) return;
      const [x, y] = this.toScreen(camera, label.x, label.y);
      const side = LABEL_SIDES[label.side];
      const gap = 8 * scale;
      context.globalAlpha = 0.8 * alpha;
      context.fillStyle = '#1d1b26';
      context.font = `italic ${Math.max(10, 15 * scale)}px "Iowan Old Style", "Palatino Linotype", Palatino, Georgia, serif`;
      context.textAlign = side.align;
      context.textBaseline = side.baseline;
      context.fillText(label.text[this.lang], x + side.offset[0] * gap, y + side.offset[1] * gap);
      context.globalAlpha = 1;
    },

    /** A printed map: land washed and outlined, fading in, and fading out towards its edge so it has no border. */
    map: (print: MapPrint, camera: Camera, time: number): void => {
      const { context, scale, width, height } = this;
      if (time <= print.time) return;
      const [x, y] = this.toScreen(camera, print.x, print.y);
      const radius = print.radius * scale;
      if (x + radius < 0 || x - radius > width || y + radius < 0 || y - radius > height) return;
      const progress = ease.out(clamp((time - print.time) / 1.6, 0, 1));
      const fade = (rgb: readonly number[], alpha: number) => {
        const gradient = context.createRadialGradient(x, y, radius * 0.45, x, y, radius);
        gradient.addColorStop(0, `rgba(${rgb.join(',')},${alpha})`);
        gradient.addColorStop(1, `rgba(${rgb.join(',')},0)`);
        return gradient;
      };
      const land = new Path2D();
      for (const ring of print.rings) {
        trace(
          land,
          ring.map(([ringX, ringY]) => this.toScreen(camera, ringX, ringY)),
        );
        land.closePath();
      }
      // The sea: the square around the circle with the land left out, faded to nothing at the circle's edge.
      const sea = new Path2D(land);
      sea.rect(x - radius, y - radius, 2 * radius, 2 * radius);
      context.globalAlpha = progress;
      context.globalCompositeOperation = 'multiply';
      context.fillStyle = fade(PIGMENTS[print.sea], 0.24);
      context.fill(sea, 'evenodd');
      context.fillStyle = fade(PIGMENTS[print.land], 0.42);
      context.fill(land);
      context.globalCompositeOperation = 'source-over';
      context.strokeStyle = fade([58, 66, 84], 0.55);
      context.lineWidth = Math.max(0.6, 0.9 * scale);
      context.lineJoin = 'round';
      context.stroke(land);
      context.globalAlpha = 1;
    },

    /** A printed picture, rendered once in its style, fading in. */
    picture: (picture: PicturePrint, camera: Camera, time: number): void => {
      const { context, width, height, scale } = this;
      if (time <= picture.time) return;
      let sprite = this.pictures.get(picture);
      if (!sprite) {
        sprite = backdropSprite(picture);
        this.pictures.set(picture, sprite);
      }
      const [x, y] = this.toScreen(camera, sprite.x, sprite.y);
      const [wide, tall] = [sprite.width * scale, sprite.height * scale];
      if (x + wide < 0 || x > width || y + tall < 0 || y > height) return;
      context.globalAlpha = ease.out(clamp((time - picture.time) / 1.6, 0, 1));
      context.globalCompositeOperation = 'multiply';
      context.drawImage(sprite.canvas, x, y, wide, tall);
      context.globalCompositeOperation = 'source-over';
      context.globalAlpha = 1;
    },

    /** A small plane seen from above, nose towards `heading`, in the colour already set. */
    plane: (x: number, y: number, heading: number, alpha: number): void => {
      const { context } = this;
      const size = Math.max(0.6, this.scale);
      context.save();
      context.translate(x, y);
      context.rotate(heading);
      context.scale(size, size);
      context.globalAlpha = alpha;
      context.fillStyle = context.strokeStyle;
      const half: Point[] = [
        [15, 0],
        [12, -2],
        [3, -2.2],
        [-4, -14],
        [-8, -14],
        [-4, -2.2],
        [-11, -2],
        [-15, -7],
        [-17.5, -7],
        [-15, 0],
      ];
      context.beginPath();
      trace(context, [
        ...half,
        ...half
          .slice(0, -1)
          .reverse()
          .map(([pointX, pointY]) => [pointX, -pointY] as const),
      ]);
      context.closePath();
      context.fill();
      context.restore();
    },

    thread: (thread: Thread, camera: Camera, time: number, plane?: Plane): void => {
      const { context, width, height, scale } = this;
      const points = thread.points;
      const current = tip(thread, time);
      if (!current) return;
      const end = current.index;
      const chunk = scale < 0.35 ? 36 : 10;
      const margin = 160;
      const screen = (point: Readonly<{ x: number; y: number }>) => this.toScreen(camera, point.x, point.y);
      context.strokeStyle = thread.colour;
      for (let start = 0; start < end || (start === 0 && end === 0); start += chunk) {
        const stop = Math.min(end, start + chunk);
        const first = points[start] as InkPoint;
        const [from, to] = [screen(first), screen(points[stop] as InkPoint)];
        const outside =
          (from[0] < -margin && to[0] < -margin) ||
          (from[0] > width + margin && to[0] > width + margin) ||
          (from[1] < -margin && to[1] < -margin) ||
          (from[1] > height + margin && to[1] > height + margin);
        if (!outside) {
          context.globalAlpha = first.alpha;
          context.lineWidth = Math.max(0.9, first.width * scale);
          context.beginPath();
          context.moveTo(...from);
          for (let index = start + 1; index <= stop; index++) {
            const point = points[index] as InkPoint;
            if (point.up) context.moveTo(...screen(point));
            else context.lineTo(...screen(point));
          }
          if (stop === end && !current.up) context.lineTo(...screen(current));
          context.stroke();
        }
        if (start >= end) break;
      }
      if (plane) {
        // In flight, the tip is a plane heading the way the pen goes.
        const back = tip(thread, time - 0.05) ?? current;
        const fade = Math.min(1, (time - plane.start) / 0.3, (plane.end - time) / 0.3);
        this.draw.plane(...screen(current), Math.atan2(current.y - back.y, current.x - back.x), fade);
      } else if (current.done < 0.6 && !current.up) {
        // The nib: a wet bead of ink at the tip while the thread is still being drawn.
        const wetness = 1 - current.done / 0.6;
        const [x, y] = screen(current);
        const radius = Math.max(1.6, current.width * scale * 0.95);
        context.fillStyle = thread.colour;
        context.globalAlpha = 0.14 * wetness * current.alpha;
        context.beginPath();
        context.arc(x, y, radius * 3.2 + Math.sin(time * 6) * 0.8, 0, TAU);
        context.fill();
        context.globalAlpha = 0.9 * wetness * current.alpha;
        context.beginPath();
        context.arc(x, y, radius, 0, TAU);
        context.fill();
      }
      context.globalAlpha = 1;
    },
  };
}
