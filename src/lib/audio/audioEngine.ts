import { Note } from "tonal";
import { generateKarplusStrongBuffer } from "./karplusStrong";

// Thin browser-only wrapper around Web Audio — not unit-tested. vitest runs
// in `environment: "node"` (no AudioContext), and jsdom doesn't implement
// Web Audio either, so this is verified manually via the running app
// instead. The actual synthesis math lives in karplusStrong.ts, which is
// pure and fully covered by karplusStrong.test.ts.

const PLUCK_DURATION_SECONDS = 1.5;

let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  if (audioContext.state === "suspended") {
    void audioContext.resume();
  }
  return audioContext;
}

// Karplus-Strong's raw two-tap averaging leaves a lot of harsh, bright
// high-frequency content in the signal, which reads as "metallic" — a
// lowpass tames that into something closer to a warm plucked-string tone.
const LOWPASS_HARMONIC_MULTIPLE = 6;
const LOWPASS_MAX_HZ = 6000;

// A floor for the gain envelope, not true silence — exponentialRamp can't
// target exactly 0. Low enough to be inaudible by the time the buffer ends.
const GAIN_FLOOR = 0.001;

function pluck(ctx: AudioContext, frequency: number, startTime: number, volume: number): void {
  if (volume <= 0) return;

  const samples = generateKarplusStrongBuffer({
    frequency,
    sampleRate: ctx.sampleRate,
    duration: PLUCK_DURATION_SECONDS,
  });

  const buffer = ctx.createBuffer(1, samples.length, ctx.sampleRate);
  buffer.copyToChannel(samples, 0);

  const source = ctx.createBufferSource();
  source.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = Math.min(frequency * LOWPASS_HARMONIC_MULTIPLE, LOWPASS_MAX_HZ);

  // The Karplus-Strong loop filter decays the signal on its own, but not
  // reliably down to silence within PLUCK_DURATION_SECONDS for every pitch —
  // this explicit envelope guarantees a smooth fade to near-nothing exactly
  // by the time playback stops, instead of an audible hard cutoff.
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(volume, startTime);
  gain.gain.exponentialRampToValueAtTime(GAIN_FLOOR, startTime + PLUCK_DURATION_SECONDS);

  source.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  source.onended = () => {
    source.disconnect();
    filter.disconnect();
    gain.disconnect();
  };
  source.start(startTime);
}

function frequencyOf(note: string): number {
  const { freq } = Note.get(note);
  if (freq == null) {
    throw new Error(`Invalid note: ${note}`);
  }
  return freq;
}

/** Plays a single plucked note immediately at the given volume (0-1). */
export function playNote(note: string, volume: number): void {
  const ctx = getAudioContext();
  if (!ctx) return;
  pluck(ctx, frequencyOf(note), ctx.currentTime, volume);
}

/** Plays each note in order, staggered by `spreadMs` milliseconds apart, at the given volume (0-1). */
export function playNotes(notes: string[], spreadMs: number, volume: number): void {
  const ctx = getAudioContext();
  if (!ctx) return;
  notes.forEach((note, i) => {
    pluck(ctx, frequencyOf(note), ctx.currentTime + (i * spreadMs) / 1000, volume);
  });
}
