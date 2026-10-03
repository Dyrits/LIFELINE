import { mulberry, TAU } from './math';

export const PIGMENTS = {
  blue: [92, 118, 152],
  sun: [236, 170, 60],
  rose: [222, 118, 118],
  red: [196, 56, 58],
  ochre: [214, 160, 96],
  window: [246, 188, 64],
  sky: [118, 160, 202],
  grey: [104, 110, 124],
  sage: [128, 156, 112],
  dawn: [244, 182, 108],
} as const satisfies Record<string, readonly [number, number, number]>;
export type Pigment = keyof typeof PIGMENTS;

type Pt = [number, number];
const gauss = (r: () => number): number => (r() + r() + r() + r() - 2) * 0.9;

function deform(pts: Pt[], depth: number, v: number, r: () => number): Pt[] {
  let out = pts;
  for (let d = 0; d < depth; d++) {
    const next: Pt[] = [];
    for (let i = 0; i < out.length; i++) {
      const a = out[i] as Pt;
      const b = out[(i + 1) % out.length] as Pt;
      const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
      const ang = r() * TAU;
      const g = gauss(r) * len * v;
      next.push(a, [(a[0] + b[0]) / 2 + Math.cos(ang) * g, (a[1] + b[1]) / 2 + Math.sin(ang) * g]);
    }
    out = next;
  }
  return out;
}

/** Layered, randomly deformed translucent polygons: the classic generative watercolour wash. */
export function watercolour(pigment: Pigment, seed: number): HTMLCanvasElement {
  const r = mulberry(seed);
  const s = 420;
  const c = document.createElement('canvas');
  c.width = c.height = s;
  const g = c.getContext('2d');
  if (!g) return c;
  const [cr, cg, cb] = PIGMENTS[pigment];
  let base: Pt[] = [];
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * TAU;
    const rr = 112 * (0.8 + r() * 0.4);
    base.push([s / 2 + Math.cos(a) * rr, s / 2 + Math.sin(a) * rr]);
  }
  base = deform(base, 3, 0.42, r);
  for (let l = 0; l < 48; l++) {
    const p = deform(base, 3, 0.4, r);
    g.fillStyle = `rgba(${cr},${cg},${cb},${l % 8 === 0 ? 0.026 : 0.012})`;
    g.beginPath();
    p.forEach(([x, y], i) => {
      if (i) g.lineTo(x, y);
      else g.moveTo(x, y);
    });
    g.closePath();
    g.fill();
  }
  return c;
}

/** A tile of paper grain and fibres, repeated under the drawing. */
export function paperGrain(): HTMLCanvasElement {
  const s = 256;
  const c = document.createElement('canvas');
  c.width = c.height = s;
  const g = c.getContext('2d');
  if (!g) return c;
  const id = g.createImageData(s, s);
  const r = mulberry(99);
  for (let i = 0; i < s * s; i++) {
    const v = r();
    const o = i * 4;
    if (v < 0.5) {
      id.data.set([90, 70, 50, v * 34], o);
    } else {
      id.data.set([255, 250, 240, (v - 0.5) * 30], o);
    }
  }
  g.putImageData(id, 0, 0);
  g.strokeStyle = 'rgba(120,95,70,0.07)';
  g.lineWidth = 0.7;
  for (let i = 0; i < 70; i++) {
    const x = r() * s;
    const y = r() * s;
    const a = r() * TAU;
    const l = 6 + r() * 22;
    g.beginPath();
    g.moveTo(x, y);
    g.quadraticCurveTo(
      x + Math.cos(a + 0.5) * l * 0.5,
      y + Math.sin(a + 0.5) * l * 0.5,
      x + Math.cos(a) * l,
      y + Math.sin(a) * l,
    );
    g.stroke();
  }
  return c;
}

export function vignette(w: number, h: number): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = Math.max(1, w);
  c.height = Math.max(1, h);
  const g = c.getContext('2d');
  if (!g) return c;
  const gr = g.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.3, w / 2, h / 2, Math.hypot(w, h) * 0.62);
  gr.addColorStop(0, 'rgba(90,60,30,0)');
  gr.addColorStop(1, 'rgba(90,60,30,0.26)');
  g.fillStyle = gr;
  g.fillRect(0, 0, w, h);
  return c;
}
