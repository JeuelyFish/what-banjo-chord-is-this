import { NUM_FRETS, type StringDef, type StringIndex } from "./tuning";
import { noteAtFret, pitchClass } from "./notes";

/** One place on the fretboard where a given note (by pitch class) sounds. */
export interface HighlightedPosition {
  stringIndex: StringIndex;
  fret: number | null; // null = open string
}

/**
 * Every position where `note`'s pitch class sounds, across every string and
 * the full fret range — mirrors Fretboard's own open-string and fretted-dot
 * loops (including each string's minFret floor) so every result corresponds
 * to a real, clickable target. Matches across octaves too: an open string's
 * pitch class also reappears one octave up at fret 12.
 */
export function highlightedPositions(tuning: StringDef[], note: string): HighlightedPosition[] {
  const target = pitchClass(note);
  const positions: HighlightedPosition[] = [];
  for (const stringDef of tuning) {
    if (pitchClass(stringDef.openNote) === target) {
      positions.push({ stringIndex: stringDef.index, fret: null });
    }
    for (let fret = Math.max(stringDef.minFret, 1); fret <= NUM_FRETS; fret++) {
      if (pitchClass(noteAtFret(stringDef, fret)) === target) {
        positions.push({ stringIndex: stringDef.index, fret });
      }
    }
  }
  return positions;
}
