import { NUM_FRETS, type Fingering, type StringDef, type StringIndex } from "./tuning";
import { noteAtFret, pitchClass } from "./notes";
import { soundingPitchClasses } from "./chord";

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
 *
 * When `fingering` is given, positions on a string that's already sounding a
 * *different* note still needed by the current fragment are dropped: each
 * string can only sound one note at a time, so fretting that spot would
 * silently swap the new note in for one the target chord still depends on
 * (e.g. adding "C" to a D-G-F fragment by fretting the string currently
 * supplying the only "G" leaves C-D-F — still no chord).
 */
export function highlightedPositions(
  tuning: StringDef[],
  note: string,
  fingering?: Fingering
): HighlightedPosition[] {
  const target = pitchClass(note);
  const positions: HighlightedPosition[] = [];
  for (const stringDef of tuning) {
    if (pitchClass(stringDef.openNote) === target) {
      positions.push({ stringIndex: stringDef.index, fret: null });
    }
    for (let fret = Math.max(stringDef.minFret + 1, 1); fret <= NUM_FRETS; fret++) {
      if (pitchClass(noteAtFret(stringDef, fret)) === target) {
        positions.push({ stringIndex: stringDef.index, fret });
      }
    }
  }
  if (!fingering) return positions;

  const required = new Set(soundingPitchClasses(fingering, tuning));
  required.add(target);
  return positions.filter(({ stringIndex, fret }) => {
    const resulting = soundingPitchClasses({ ...fingering, [stringIndex]: fret }, tuning);
    return [...required].every((pc) => resulting.includes(pc));
  });
}
