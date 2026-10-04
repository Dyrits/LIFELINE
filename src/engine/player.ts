import type { Audio } from './audio';
import { clamp, ease, lerp } from './math';
import { type Camera, type Renderer, type Tip, tip } from './render';
import type { Bounds, Story } from './story';

/** Which threads a player draws, and which ones the camera follows. */
export type PlayerOptions<Name extends string> = Readonly<{
  /** Threads in drawing order, back to front. */
  order: readonly Name[];
  /** Threads the camera follows while they draw, with their pull. */
  follow: readonly (readonly [name: Name, weight: number])[];
  /** Thread whose tip leads the camera and the pen scratch. */
  lead: Name;
  /** Height of the line at a moment; when given, the camera holds it steady instead of chasing the pen up and down. */
  baseline?: (time: number) => number;
}>;

const HURRY = 3.4;
/** The camera keeps the pen this fraction of the screen width right of centre, leaving room behind it. */
export const PEN_AHEAD = 0.12;
/** How far past the end the drawing can be scrubbed: through the closing captions. */
const AFTER_END = 12;

/** Plays a built story: advances time, fires sound cues, moves the camera and draws each frame. */
export class Player<Name extends string> {
  now = 0;
  hurry = false;
  readonly camera: Camera = { x: 0, y: 0, zoom: 1 };
  private speed = 1;
  private cueIndex = 0;
  private lastTipX: number | null = null;
  private readonly bounds: Bounds;

  constructor(
    private readonly renderer: Renderer,
    readonly story: Story<Name>,
    readonly end: number,
    private readonly audio: Audio,
    private readonly options: PlayerOptions<Name>,
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
  seek(time: number): void {
    this.moveTo(time);
    this.speed = 1;
    Object.assign(this.camera, this.target());
  }

  /** Moves time by `elapsed` seconds, either way, without replaying sounds; the camera glides there. */
  scrub(elapsed: number): void {
    this.moveTo(clamp(this.now + elapsed, 0, this.end + AFTER_END));
  }

  private moveTo(time: number): void {
    this.now = Math.max(0, time);
    const cues = this.story.cues.items;
    this.cueIndex = cues.findIndex(cue => cue.time > this.now);
    if (this.cueIndex < 0) this.cueIndex = cues.length;
    this.lastTipX = null;
  }

  /** Advances time by `elapsed`, unless `advance` is false (paused), and lets the camera catch up either way. */
  update(elapsed: number, advance = true): void {
    const revealed = this.revealed;
    this.speed += ((this.hurry && !revealed ? HURRY : 1) - this.speed) * (1 - Math.exp(-elapsed * 4));
    if (advance) this.now += elapsed * this.speed;
    const cues = this.story.cues.items;
    while (this.cueIndex < cues.length) {
      const cue = cues[this.cueIndex];
      if (!cue || cue.time > this.now) break;
      // Hurrying skips the music rather than piling it up.
      if (this.speed < 2.5 || cue.time > this.end) this.audio.play(cue);
      this.cueIndex++;
    }
    const target = this.target();
    const rate = revealed ? 1 - Math.exp(-elapsed * 0.7) : 1 - Math.exp(-elapsed * 2.2 * Math.sqrt(this.speed));
    this.camera.x += (target.x - this.camera.x) * rate;
    this.camera.y += (target.y - this.camera.y) * rate;
    this.camera.zoom += (target.zoom - this.camera.zoom) * rate;
    // Easing never quite arrives: settle once close, so a paused drawing stands perfectly still.
    if (
      Math.abs(target.x - this.camera.x) < 0.05 &&
      Math.abs(target.y - this.camera.y) < 0.05 &&
      Math.abs(target.zoom - this.camera.zoom) < 1e-4
    )
      Object.assign(this.camera, target);

    const lead = this.tipOf(this.options.lead);
    if (revealed || !lead) {
      this.audio.scratch(0);
    } else {
      if (this.lastTipX !== null && !this.audio.muted)
        this.audio.scratch(clamp((Math.abs(lead.x - this.lastTipX) / Math.max(elapsed, 1e-3)) * 0.00011, 0, 0.035));
      this.lastTipX = lead.x;
    }
  }

  /** Draws the current frame. */
  draw(): void {
    this.renderer.render(this.story, this.camera, this.now, this.options.order);
  }

  private tipOf(name: Name): Tip | null {
    return tip(this.story.threads.get(name), this.now);
  }

  private zoomAt(time: number): number {
    const zooms = this.story.zooms.items;
    let zoom = zooms[0]?.zoom ?? 1;
    for (let index = 1; index < zooms.length; index++) {
      const step = zooms[index] as (typeof zooms)[number];
      if (time < step.time) break;
      zoom = lerp(
        (zooms[index - 1] as (typeof zooms)[number]).zoom,
        step.zoom,
        ease.inOut(clamp((time - step.time) / 3, 0, 1)),
      );
    }
    return zoom;
  }

  /** Where the camera wants to be now: following the pens, or framing the whole drawing once it is done. */
  private target(): Camera {
    const renderer = this.renderer;
    const baseScale = renderer.baseScale();
    if (this.revealed) {
      const { min, max } = this.bounds;
      const width = Math.max(1, max.x - min.x);
      const height = Math.max(1, max.y - min.y);
      return {
        x: (min.x + max.x) / 2,
        y: (min.y + max.y) / 2 + height * 0.08,
        zoom: Math.min((renderer.width * 0.9) / width, (renderer.height * 0.6) / height) / baseScale,
      };
    }
    const zoom = this.zoomAt(this.now);
    const scale = baseScale * zoom;
    const sum = { weight: 0, x: 0, y: 0 };
    for (const [name, weight] of this.options.follow) {
      const followed = this.tipOf(name);
      if (followed && followed.done < 0.8) {
        sum.x += followed.x * weight;
        sum.y += followed.y * weight;
        sum.weight += weight;
      }
    }
    const lead = this.tipOf(this.options.lead);
    const leadY = lead?.y ?? 0;
    const x = (sum.weight ? sum.x / sum.weight : (lead?.x ?? 0)) - (renderer.width * PEN_AHEAD) / scale;
    if (this.options.baseline) {
      // Hold the line well above centre, leaving the lower part of the screen to the cards and the caption.
      return { x, y: this.options.baseline(this.now) + (renderer.height * 0.11) / scale, zoom };
    }
    return { x, y: clamp(sum.weight ? sum.y / sum.weight : leadY, leadY - 300, leadY + 300), zoom };
  }
}
