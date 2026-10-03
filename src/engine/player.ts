import type { Audio } from './audio';
import { clamp, ease, lerp } from './math';
import { type Camera, type Renderer, tip } from './render';
import type { Bounds, Story } from './story';

export type PlayerOptions = Readonly<{
  /** Threads in drawing order, back to front. */
  order: readonly string[];
  /** Threads the camera follows while they draw, with their pull. */
  follow: readonly (readonly [name: string, weight: number])[];
  /** Thread whose tip leads the camera and the pen scratch. */
  lead: string;
  /** Height of the line at a moment; when given, the camera holds it steady instead of chasing the pen up and down. */
  baseline?: (t: number) => number;
}>;

const HURRY = 3.4;

/** Plays a built story: advances time, fires sound cues, moves the camera and draws each frame. */
export class Player {
  now = 0;
  hurry = false;
  readonly cam: Camera = { x: 0, y: 0, z: 1 };
  private spd = 1;
  private cueIdx = 0;
  private lastTipX: number | null = null;
  private readonly bounds: Bounds;

  constructor(
    private readonly renderer: Renderer,
    readonly story: Story,
    readonly end: number,
    private readonly audio: Audio,
    private readonly opts: PlayerOptions,
  ) {
    this.bounds = story.bounds();
    this.seek(0);
  }

  get revealed(): boolean {
    return this.now > this.end + 1;
  }

  get progress(): number {
    return clamp(this.now / this.end, 0, 1);
  }

  /** Jumps to a moment without replaying the sounds in between; the camera cuts there. */
  seek(t: number): void {
    this.now = Math.max(0, t);
    this.spd = 1;
    const cues = this.story.cues;
    this.cueIdx = cues.findIndex(c => c.t > this.now);
    if (this.cueIdx < 0) this.cueIdx = cues.length;
    const target = this.target();
    Object.assign(this.cam, target);
    this.lastTipX = null;
  }

  update(dt: number): void {
    const reveal = this.revealed;
    this.spd += ((this.hurry && !reveal ? HURRY : 1) - this.spd) * (1 - Math.exp(-dt * 4));
    this.now += dt * this.spd;
    const cues = this.story.cues;
    while (this.cueIdx < cues.length) {
      const c = cues[this.cueIdx];
      if (!c || c.t > this.now) break;
      // Hurrying skips the music rather than piling it up.
      if (this.spd < 2.5 || c.t > this.end) this.audio.play(c);
      this.cueIdx++;
    }
    const target = this.target();
    const k = reveal ? 1 - Math.exp(-dt * 0.7) : 1 - Math.exp(-dt * 2.2 * Math.sqrt(this.spd));
    this.cam.x += (target.x - this.cam.x) * k;
    this.cam.y += (target.y - this.cam.y) * k;
    this.cam.z += (target.z - this.cam.z) * k;

    const lead = tip(this.story.get(this.opts.lead), this.now);
    if (reveal || !lead) {
      this.audio.scratch(0);
    } else {
      if (this.lastTipX !== null && !this.audio.muted)
        this.audio.scratch(clamp((Math.abs(lead.x - this.lastTipX) / Math.max(dt, 1e-3)) * 0.00011, 0, 0.035));
      this.lastTipX = lead.x;
    }
  }

  draw(): void {
    this.renderer.draw(this.story, this.cam, this.now, this.opts.order);
  }

  private zoomAt(t: number): number {
    const zk = this.story.zooms;
    let z = zk[0]?.[1] ?? 1;
    for (let i = 1; i < zk.length; i++) {
      const [ti, zi] = zk[i] as [number, number];
      if (t < ti) break;
      z = lerp((zk[i - 1] as [number, number])[1], zi, ease(clamp((t - ti) / 3, 0, 1)));
    }
    return z;
  }

  /** Where the camera wants to be now: following the pens, or framing the whole drawing once it is done. */
  private target(): Camera {
    const r = this.renderer;
    const base = r.baseScale();
    if (this.revealed) {
      const b = this.bounds;
      const bw = Math.max(1, b.x1 - b.x0);
      const bh = Math.max(1, b.y1 - b.y0);
      return {
        x: (b.x0 + b.x1) / 2,
        y: (b.y0 + b.y1) / 2 + bh * 0.08,
        z: Math.min((r.W * 0.9) / bw, (r.H * 0.6) / bh) / base,
      };
    }
    const z = this.zoomAt(this.now);
    const S = base * z;
    let sx = 0;
    let sy = 0;
    let ws = 0;
    for (const [name, w] of this.opts.follow) {
      const p = tip(this.story.get(name), this.now);
      if (p && p.done < 0.8) {
        sx += p.x * w;
        sy += p.y * w;
        ws += w;
      }
    }
    const lead = tip(this.story.get(this.opts.lead), this.now);
    const ly = lead?.y ?? 0;
    const x = (ws ? sx / ws : (lead?.x ?? 0)) - (r.W * 0.12) / S;
    if (this.opts.baseline) {
      // Hold the line a little above centre, leaving the lower part of the screen to the cards.
      return { x, y: this.opts.baseline(this.now) + (r.H * 0.04) / S, z };
    }
    return { x, y: clamp(ws ? sy / ws : ly, ly - 300, ly + 300), z };
  }
}
