import { isValidNote } from "./notes";

export type StringIndex = 0 | 1 | 2 | 3 | 4; // 0 = 5th string (drone), 4 = 1st string
export type Fret = number; // 0 = open
export type Fingering = Record<StringIndex, Fret | null>; // null = open

export interface StringDef {
  index: StringIndex;
  openNote: string; // scientific pitch notation, e.g. "G4"
  label: string; // "5th".."1st"
  minFret: number; // lowest fret the string can be pressed at
}

// Classic 5-string banjo, open G tuning (gDGBD). The 5th string is a short
// drone string that physically starts at the 5th fret, so it can't be
// pressed below that.
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
