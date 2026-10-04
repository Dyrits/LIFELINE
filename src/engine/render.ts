import type { Lang } from '../data/types';
import { clamp, eout, lerp, TAU } from './math';
import { PIGMENTS, paperGrain, vignette, watercolour } from './paper';
import type { Blot, InkPoint, Label, Plane, Print, Story, Thread } from './story';

export type Camera = { x: number; y: number; z: number };

/** The pen tip of a thread at time t; `done` is how long the thread has been resting there. */
export type Tip = Readonly<{ x: number; y: number; w: number; a: number; e: number; done: number; up: boolean }>;

const PAPER = '#efe6d4';

function lastBefore(pts: readonly InkPoint[], t: number): number {
  const first = pts[0];
  if (!first || first.t > t) return -1;
  let lo = 0;
  let hi = pts.length - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if ((pts[mid] as InkPoint).t <= t) lo = mid;
    else hi = mid - 1;
  }
  return lo;
}

export function tip(th: Thread, t: number): Tip | null {
  const e = lastBefore(th.pts, t);
  if (e < 0) return null;
  const p = th.pts[e] as InkPoint;
  const q = th.pts[e + 1];
  // At the end, or waiting to resume somewhere else: the pen rests.
  if (!q || (q.up && q.t - p.t > 0.5)) return { x: p.x, y: p.y, w: p.w, a: p.a, e, done: t - p.t, up: p.up };
  const f = clamp((t - p.t) / (q.t - p.t || 1), 0, 1);
  return { x: lerp(p.x, q.x, f), y: lerp(p.y, q.y, f), w: p.w, a: p.a, e, done: 0, up: q.up };
}

/** Draws a story onto a canvas at a given moment, from a given camera. */
export class Renderer {
  W = 0;
  H = 0;
  S = 1;
  /** Language of the names written on the drawing. */
  lang: Lang = 'fr';
  private readonly ctx: CanvasRenderingContext2D;
  private grain: CanvasPattern | null = null;
  private vign: HTMLCanvasElement | null = null;
  private readonly sprites = new Map<Blot, HTMLCanvasElement>();
  private dpr = 1;

  constructor(private readonly canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D is not available');
    this.ctx = ctx;
    this.grain = ctx.createPattern(paperGrain(), 'repeat');
  }

  resize(w: number, h: number, dpr: number): void {
    this.W = w;
    this.H = h;
    this.dpr = dpr;
    this.canvas.width = Math.round(w * dpr);
    this.canvas.height = Math.round(h * dpr);
    this.vign = vignette(w, h);
  }

  /** Scale at zoom 1 for the current viewport. */
  baseScale(): number {
    return Math.min(this.H / 900, this.W / 1150);
  }

  toScreen(cam: Camera, x: number, y: number): [number, number] {
    return [(x - cam.x) * this.S + this.W / 2, (y - cam.y) * this.S + this.H / 2];
  }

  draw(story: Story, cam: Camera, now: number, order: readonly string[]): void {
    const { ctx, W, H } = this;
    this.S = this.baseScale() * cam.z;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.globalAlpha = 1;
    ctx.fillStyle = PAPER;
    ctx.fillRect(0, 0, W, H);
    if (this.grain) {
      const ox = (((-cam.x * this.S) % 256) + 256) % 256;
      const oy = (((-cam.y * this.S) % 256) + 256) % 256;
      ctx.save();
      ctx.translate(ox - 256, oy - 256);
      ctx.fillStyle = this.grain;
      ctx.fillRect(0, 0, W + 512, H + 512);
      ctx.restore();
    }
    this.drawBlots(story.blots, cam, now);
    for (const p of story.prints) this.drawPrint(p, cam, now);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    for (const name of order) {
      const th = story.threads.get(name);
      if (th)
        this.drawThread(
          th,
          cam,
          now,
          story.planes.find(p => p.pen === name && now > p.t0 && now < p.t1),
        );
    }
    for (const l of story.labels) this.drawLabel(l, cam, now);
    if (this.vign) ctx.drawImage(this.vign, 0, 0, W, H);
  }

  private drawBlots(blots: readonly Blot[], cam: Camera, now: number): void {
    const { ctx, W, H } = this;
    ctx.globalCompositeOperation = 'multiply';
    for (const b of blots) {
      const age = now - b.t;
      if (age <= 0) continue;
      const k = eout(clamp(age / 3.2, 0, 1));
      const sz = b.size * this.S * (0.72 + 0.28 * k);
      const [x, y] = this.toScreen(cam, b.x, b.y);
      if (x + sz < 0 || x - sz > W || y + sz < 0 || y - sz > H) continue;
      let spr = this.sprites.get(b);
      if (!spr) {
        spr = watercolour(b.pigment, b.seed);
        this.sprites.set(b, spr);
      }
      ctx.globalAlpha = k * b.a;
      ctx.drawImage(spr, x - sz / 2, y - sz / 2, sz, sz);
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
  }

  /** A printed map: land washed and outlined, fading in, and fading out towards its edge so it has no border. */
  private drawPrint(p: Print, cam: Camera, now: number): void {
    const { ctx, S, W, H } = this;
    if (now <= p.t) return;
    const [x, y] = this.toScreen(cam, p.x, p.y);
    const r = p.r * S;
    if (x + r < 0 || x - r > W || y + r < 0 || y - r > H) return;
    const k = eout(clamp((now - p.t) / 1.6, 0, 1));
    const fade = (rgb: readonly number[], a: number) => {
      const g = ctx.createRadialGradient(x, y, r * 0.45, x, y, r);
      g.addColorStop(0, `rgba(${rgb.join(',')},${a})`);
      g.addColorStop(1, `rgba(${rgb.join(',')},0)`);
      return g;
    };
    const land = new Path2D();
    for (const ring of p.rings) {
      ring.forEach(([px, py], i) => {
        const sx = (px - cam.x) * S + W / 2;
        const sy = (py - cam.y) * S + H / 2;
        if (i) land.lineTo(sx, sy);
        else land.moveTo(sx, sy);
      });
      land.closePath();
    }
    // The sea: the square around the circle with the land left out, faded to nothing at the circle's edge.
    const sea = new Path2D(land);
    sea.rect(x - r, y - r, 2 * r, 2 * r);
    ctx.globalAlpha = k;
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = fade(PIGMENTS[p.sea], 0.24);
    ctx.fill(sea, 'evenodd');
    ctx.fillStyle = fade(PIGMENTS[p.land], 0.42);
    ctx.fill(land);
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = fade([58, 66, 84], 0.55);
    ctx.lineWidth = Math.max(0.6, 0.9 * S);
    ctx.lineJoin = 'round';
    ctx.stroke(land);
    ctx.globalAlpha = 1;
  }

  /** A name written in small italics beside its place, appearing when the line reaches it. */
  private drawLabel(l: Label, cam: Camera, now: number): void {
    const { ctx, S } = this;
    if (now <= l.t) return;
    const [x, y] = this.toScreen(cam, l.x, l.y);
    const gap = l.side === 'centre' ? 0 : 8 * S;
    ctx.globalAlpha = 0.8 * eout(clamp((now - l.t) / 0.6, 0, 1));
    ctx.fillStyle = '#1d1b26';
    ctx.font = `italic ${Math.max(10, 15 * S)}px "Iowan Old Style", "Palatino Linotype", Palatino, Georgia, serif`;
    ctx.textAlign = l.side === 'left' ? 'right' : l.side === 'right' ? 'left' : 'center';
    ctx.textBaseline = l.side === 'above' ? 'bottom' : l.side === 'below' ? 'top' : 'middle';
    const dx = l.side === 'left' ? -gap : l.side === 'right' ? gap : 0;
    const dy = l.side === 'above' ? -gap : l.side === 'below' ? gap : 0;
    ctx.fillText(l.text[this.lang], x + dx, y + dy);
    ctx.globalAlpha = 1;
  }

  private drawThread(th: Thread, cam: Camera, now: number, plane?: Plane): void {
    const { ctx, W, H, S } = this;
    const P = th.pts;
    const tp = tip(th, now);
    if (!tp) return;
    const end = tp.e;
    const CH = S < 0.35 ? 36 : 10;
    const mg = 160;
    const X = (x: number) => (x - cam.x) * S + W / 2;
    const Y = (y: number) => (y - cam.y) * S + H / 2;
    ctx.strokeStyle = th.colour;
    for (let i = 0; i < end || (i === 0 && end === 0); i += CH) {
      const j = Math.min(end, i + CH);
      const a = P[i] as InkPoint;
      const b = P[j] as InkPoint;
      const ax = X(a.x);
      const ay = Y(a.y);
      const bx = X(b.x);
      const by = Y(b.y);
      const off =
        (ax < -mg && bx < -mg) ||
        (ax > W + mg && bx > W + mg) ||
        (ay < -mg && by < -mg) ||
        (ay > H + mg && by > H + mg);
      if (!off) {
        ctx.globalAlpha = a.a;
        ctx.lineWidth = Math.max(0.9, a.w * S);
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        for (let k = i + 1; k <= j; k++) {
          const p = P[k] as InkPoint;
          if (p.up) ctx.moveTo(X(p.x), Y(p.y));
          else ctx.lineTo(X(p.x), Y(p.y));
        }
        if (j === end && !tp.up) ctx.lineTo(X(tp.x), Y(tp.y));
        ctx.stroke();
      }
      if (i >= end) break;
    }
    if (plane) {
      // In flight, the tip is a plane heading the way the pen goes.
      const back = tip(th, now - 0.05) ?? tp;
      const fade = Math.min(1, (now - plane.t0) / 0.3, (plane.t1 - now) / 0.3);
      this.drawPlane(X(tp.x), Y(tp.y), Math.atan2(tp.y - back.y, tp.x - back.x), fade);
    } else if (tp.done < 0.6 && !tp.up) {
      // The nib: a wet bead of ink at the tip while the thread is still being drawn.
      const k = 1 - tp.done / 0.6;
      const x = X(tp.x);
      const y = Y(tp.y);
      const r = Math.max(1.6, tp.w * S * 0.95);
      ctx.fillStyle = th.colour;
      ctx.globalAlpha = 0.14 * k * tp.a;
      ctx.beginPath();
      ctx.arc(x, y, r * 3.2 + Math.sin(now * 6) * 0.8, 0, TAU);
      ctx.fill();
      ctx.globalAlpha = 0.9 * k * tp.a;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, TAU);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  /** A small plane seen from above, nose towards `heading`, in the colour already set. */
  private drawPlane(x: number, y: number, heading: number, alpha: number): void {
    const { ctx } = this;
    const k = Math.max(0.6, this.S);
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(heading);
    ctx.scale(k, k);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = ctx.strokeStyle;
    const half: (readonly [number, number])[] = [
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
    ctx.beginPath();
    [
      ...half,
      ...half
        .slice(0, -1)
        .reverse()
        .map(([px, py]) => [px, -py] as const),
    ].forEach(([px, py], i) => {
      if (i) ctx.lineTo(px, py);
      else ctx.moveTo(px, py);
    });
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
}
