import { Note } from "tonal";
import type { StringDef } from "./tuning";

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
