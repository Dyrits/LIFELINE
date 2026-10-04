import { midi } from './math';
import type { Cue } from './story';

/** Generated sound: soft bell notes and the scratch of the nib. */
export class Audio {
  private context: AudioContext | null = null;
  private master: GainNode | null = null;
  private reverb: ConvolverNode | null = null;
  private scratchGain: GainNode | null = null;
  muted = false;

  /** Plays each kind of cue; the type checker reports a kind left out. */
  private readonly handlers: { readonly [Kind in Cue['kind']]: (cue: Extract<Cue, { kind: Kind }>) => void } = {
    Chord: cue => {
      cue.notes.forEach((note, index) => {
        this.note(midi(note), index * cue.gap, cue.velocity, cue.duration);
      });
    },
    Note: cue => {
      this.note(midi(cue.note), 0, cue.velocity, cue.duration);
    },
  };

  get ready(): boolean {
    return this.context !== null;
  }

  init(): void {
    if (this.context || typeof AudioContext === 'undefined') return;
    const context = new AudioContext();
    this.context = context;
    this.master = context.createGain();
    this.master.gain.value = this.muted ? 0 : 0.8;
    this.master.connect(context.destination);
    const length = context.sampleRate * 3;
    const impulse = context.createBuffer(2, length, context.sampleRate);
    for (let channel = 0; channel < 2; channel++) {
      const data = impulse.getChannelData(channel);
      for (let index = 0; index < length; index++) data[index] = (Math.random() * 2 - 1) * (1 - index / length) ** 3.2;
    }
    this.reverb = context.createConvolver();
    this.reverb.buffer = impulse;
    const wet = context.createGain();
    wet.gain.value = 0.55;
    this.reverb.connect(wet);
    wet.connect(this.master);
    // Pen scratch: looped noise through a band-pass, level follows the nib speed.
    const noise = context.createBuffer(1, context.sampleRate * 2, context.sampleRate);
    const samples = noise.getChannelData(0);
    for (let index = 0; index < samples.length; index++) samples[index] = Math.random() * 2 - 1;
    const source = context.createBufferSource();
    source.buffer = noise;
    source.loop = true;
    const bandpass = context.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.value = 2600;
    bandpass.Q.value = 0.7;
    this.scratchGain = context.createGain();
    this.scratchGain.gain.value = 0;
    source.connect(bandpass);
    bandpass.connect(this.scratchGain);
    this.scratchGain.connect(this.master);
    source.start();
  }

  play(cue: Cue): void {
    (this.handlers[cue.kind] as (cue: Cue) => void)(cue);
  }

  private note(frequency: number, when: number, velocity: number, duration: number): void {
    const context = this.context;
    if (!context || !this.master || !this.reverb) return;
    const time = context.currentTime + when;
    const oscillator = context.createOscillator();
    const overtone = context.createOscillator();
    const gain = context.createGain();
    const overtoneGain = context.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.value = frequency;
    overtone.type = 'triangle';
    overtone.frequency.value = frequency * 2;
    overtoneGain.gain.value = 0.22;
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(velocity, time + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0006, time + duration);
    oscillator.connect(gain);
    overtone.connect(overtoneGain);
    overtoneGain.connect(gain);
    gain.connect(this.master);
    gain.connect(this.reverb);
    oscillator.start(time);
    overtone.start(time);
    oscillator.stop(time + duration + 0.1);
    overtone.stop(time + duration + 0.1);
  }

  /** Sets the pen scratch's level, following the nib speed. */
  scratch(level: number): void {
    if (this.context && this.scratchGain) this.scratchGain.gain.setTargetAtTime(level, this.context.currentTime, 0.06);
  }

  toggle(): void {
    this.muted = !this.muted;
    if (this.context && this.master)
      this.master.gain.setTargetAtTime(this.muted ? 0 : 0.8, this.context.currentTime, 0.1);
  }
}
