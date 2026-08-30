import { isValidNote } from "./notes";

export type StringIndex = 0 | 1 | 2 | 3 | 4; // 0 = 5th string (drone), 4 = 1st string
export type Fret = number; // 0 = open
export type Fingering = Record<StringIndex, Fret | null>; // null = open

export interface StringDef {
  index: StringIndex;
  openNote: string; // scientific pitch notation, e.g. "G4"
  label: string; // "5th".."1st"
  // Neck position (in the shared, board-wide fret numbering) where this
  // string's own nut sits — 0 for the 4 main strings, whose nut is the
  // banjo's actual nut. The lowest fret that can actually be *pressed* is
  // one past this (see Fretboard's and highlight's fret loops), since you
  // can't fret a string at its own nut.
  minFret: number;
}

// Classic 5-string banjo, open G tuning (gDGBD). The 5th string is a short
// drone string whose own tuning peg — and thus its nut — sits at the 5th
// fret, physically anchored to the neck there rather than running back to
// the headstock like the other 4 strings.
export const OPEN_G_TUNING: StringDef[] = [
  { index: 0, openNote: "G4", label: "5th", minFret: 5 },
  { index: 1, openNote: "D3", label: "4th", minFret: 0 },
  { index: 2, openNote: "G3", label: "3rd", minFret: 0 },
  { index: 3, openNote: "B3", label: "2nd", minFret: 0 },
  { index: 4, openNote: "D4", label: "1st", minFret: 0 },
];

export const NUM_FRETS = 12;

export const OPEN_FINGERING: Fingering = { 0: null, 1: null, 2: null, 3: null, 4: null };

// Sentinel tuningId for a user-defined tuning (its StringDef[] is persisted
// separately, not looked up in the static TUNINGS list).
export const CUSTOM_TUNING_ID = "custom";

/**
 * Builds a custom StringDef[] from 5 user-chosen open notes, ordered 5th
 * string first (matching StringIndex order). Index/label/minFret stay fixed
 * to the standard banjo string roles — only the open notes are customizable.
 */
export function buildCustomTuning(notes: readonly [string, string, string, string, string]): StringDef[] {
  return OPEN_G_TUNING.map((s, i) => {
    const openNote = notes[i];
    if (!isValidNote(openNote)) {
      throw new Error(`Invalid note for custom tuning: ${openNote}`);
    }
    return { ...s, openNote };
  });
}
