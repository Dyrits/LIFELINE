import { clamp, eout, lerp, TAU } from './math';
import { paperGrain, vignette, watercolour } from './paper';
import type { Blot, InkPoint, Story, Thread } from './story';

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
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    for (const name of order) {
      const th = story.threads.get(name);
      if (th) this.drawThread(th, cam, now);
    }
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

  private drawThread(th: Thread, cam: Camera, now: number): void {
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
    // The nib: a wet bead of ink at the tip while the thread is still being drawn.
    if (tp.done < 0.6 && !tp.up) {
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
}
