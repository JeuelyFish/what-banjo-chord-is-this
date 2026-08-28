import { Note } from "tonal";
import type { Fingering, StringDef } from "./tuning";

/** Returns the sounding note (e.g. "E3") for an open string plus a fret offset. */
export function noteAtFret(stringDef: StringDef, fret: number): string {
  const openMidi = Note.midi(stringDef.openNote);
  if (openMidi == null) {
    throw new Error(`Invalid open note: ${stringDef.openNote}`);
  }
  return Note.fromMidi(openMidi + fret);
}

/** Strips the octave, e.g. "E3" -> "E". */
export function pitchClass(note: string): string {
  return Note.pitchClass(note);
}

/** The octave of a note, e.g. "E3" -> 3. */
export function noteOctave(note: string): number {
  const { oct } = Note.get(note);
  if (oct == null) {
    throw new Error(`Note has no octave: ${note}`);
  }
  return oct;
}

/** True if `note` is a real, pitched note tonal can parse (e.g. "G4"). */
export function isValidNote(note: string): boolean {
  return Note.midi(note) != null;
}

/**
 * Every string's currently sounding note, 5th string first — unlike chord
 * *detection*, which deliberately excludes an unfretted drone string (see
 * chord.ts), playback always sounds it: that's what a drone string does on
 * a real banjo.
 */
export function allSoundingNotes(fingering: Fingering, tuning: StringDef[]): string[] {
  return [...tuning]
    .sort((a, b) => a.index - b.index)
    .map((s) => noteAtFret(s, fingering[s.index] ?? 0));
}

// Chromatic pitch classes, used to populate custom-tuning note pickers.
export const PITCH_CLASSES = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
] as const;

// Octave range offered for custom-tuning note pickers, covering every open
// string across the built-in tunings (lowest is D3, highest is A4/G4).
export const OCTAVES = [2, 3, 4, 5] as const;

// Every valid note across that range, ascending — one combined pitch+octave
// choice per string in the custom-tuning picker (e.g. "G4"), rather than
// separate pitch-class and octave controls.
export const NOTE_OPTIONS: string[] = OCTAVES.flatMap((oct) =>
  PITCH_CLASSES.map((pc) => `${pc}${oct}`)
);
