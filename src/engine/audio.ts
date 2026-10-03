import { midi } from './math';
import type { Cue } from './story';

/** Generated sound: soft bell notes, a heartbeat and the scratch of the nib. */
export class Audio {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private reverb: ConvolverNode | null = null;
  private scratchGain: GainNode | null = null;
  muted = false;

  get ready(): boolean {
    return this.ctx !== null;
  }

  init(): void {
    if (this.ctx || typeof AudioContext === 'undefined') return;
    const c = new AudioContext();
    this.ctx = c;
    this.master = c.createGain();
    this.master.gain.value = this.muted ? 0 : 0.8;
    this.master.connect(c.destination);
    const len = c.sampleRate * 3;
    const ir = c.createBuffer(2, len, c.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = ir.getChannelData(ch);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len) ** 3.2;
    }
    this.reverb = c.createConvolver();
    this.reverb.buffer = ir;
    const wet = c.createGain();
    wet.gain.value = 0.55;
    this.reverb.connect(wet);
    wet.connect(this.master);
    // Pen scratch: looped noise through a band-pass, level follows the nib speed.
    const nb = c.createBuffer(1, c.sampleRate * 2, c.sampleRate);
    const nd = nb.getChannelData(0);
    for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
    const src = c.createBufferSource();
    src.buffer = nb;
    src.loop = true;
    const bp = c.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 2600;
    bp.Q.value = 0.7;
    this.scratchGain = c.createGain();
    this.scratchGain.gain.value = 0;
    src.connect(bp);
    bp.connect(this.scratchGain);
    this.scratchGain.connect(this.master);
    src.start();
  }

  play(cue: Cue): void {
    switch (cue.kind) {
      case 'chord':
        cue.notes.forEach((n, i) => {
          this.note(midi(n), i * cue.gap, cue.vel, cue.dur);
        });
        break;
      case 'note':
        this.note(midi(cue.note), 0, cue.vel, cue.dur);
        break;
      case 'beat':
        this.beat(cue.vel);
        break;
    }
  }

  private note(f: number, when: number, vel: number, dur: number): void {
    const c = this.ctx;
    if (!c || !this.master || !this.reverb) return;
    const t = c.currentTime + when;
    const o = c.createOscillator();
    const o2 = c.createOscillator();
    const g = c.createGain();
    const g2 = c.createGain();
    o.type = 'sine';
    o.frequency.value = f;
    o2.type = 'triangle';
    o2.frequency.value = f * 2;
    g2.gain.value = 0.22;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vel, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0006, t + dur);
    o.connect(g);
    o2.connect(g2);
    g2.connect(g);
    g.connect(this.master);
    g.connect(this.reverb);
    o.start(t);
    o2.start(t);
    o.stop(t + dur + 0.1);
    o2.stop(t + dur + 0.1);
  }

  private beat(v: number): void {
    const c = this.ctx;
    const master = this.master;
    if (!c || !master) return;
    const t = c.currentTime;
    [0, 0.19].forEach((d, i) => {
      const o = c.createOscillator();
      const g = c.createGain();
      const vv = v * (i ? 0.6 : 1);
      o.type = 'sine';
      o.frequency.setValueAtTime(95, t + d);
      o.frequency.exponentialRampToValueAtTime(38, t + d + 0.18);
      g.gain.setValueAtTime(0, t + d);
      g.gain.linearRampToValueAtTime(vv, t + d + 0.01);
      g.gain.exponentialRampToValueAtTime(0.001, t + d + 0.36);
      o.connect(g);
      g.connect(master);
      o.start(t + d);
      o.stop(t + d + 0.4);
    });
  }

  scratch(v: number): void {
    if (this.ctx && this.scratchGain) this.scratchGain.gain.setTargetAtTime(v, this.ctx.currentTime, 0.06);
  }

  toggle(): void {
    this.muted = !this.muted;
    if (this.ctx && this.master) this.master.gain.setTargetAtTime(this.muted ? 0 : 0.8, this.ctx.currentTime, 0.1);
  }
}
