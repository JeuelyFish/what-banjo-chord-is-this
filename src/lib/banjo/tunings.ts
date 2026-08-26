import { OPEN_G_TUNING, type StringDef } from "./tuning";

export interface Tuning {
  id: string;
  name: string;
  strings: StringDef[];
}

export const TUNINGS: Tuning[] = [
  { id: "open-g", name: "Open G (Standard) — gDGBD", strings: OPEN_G_TUNING },
  {
    id: "double-c",
    name: "Double C — gCGCD",
    strings: [
      { index: 0, openNote: "G4", label: "5th", minFret: 5 },
      { index: 1, openNote: "C3", label: "4th", minFret: 0 },
      { index: 2, openNote: "G3", label: "3rd", minFret: 0 },
      { index: 3, openNote: "C4", label: "2nd", minFret: 0 },
      { index: 4, openNote: "D4", label: "1st", minFret: 0 },
    ],
  },
  {
    id: "sawmill",
    name: "Sawmill / G Modal — gDGCD",
    strings: [
      { index: 0, openNote: "G4", label: "5th", minFret: 5 },
      { index: 1, openNote: "D3", label: "4th", minFret: 0 },
      { index: 2, openNote: "G3", label: "3rd", minFret: 0 },
      { index: 3, openNote: "C4", label: "2nd", minFret: 0 },
      { index: 4, openNote: "D4", label: "1st", minFret: 0 },
    ],
  },
  {
    id: "open-d",
    name: "Open D — f#DF#AD",
    strings: [
      { index: 0, openNote: "F#4", label: "5th", minFret: 5 },
      { index: 1, openNote: "D3", label: "4th", minFret: 0 },
      { index: 2, openNote: "F#3", label: "3rd", minFret: 0 },
      { index: 3, openNote: "A3", label: "2nd", minFret: 0 },
      { index: 4, openNote: "D4", label: "1st", minFret: 0 },
    ],
  },
  {
    id: "double-d",
    name: "Double D — aDF#AD",
    strings: [
      { index: 0, openNote: "A4", label: "5th", minFret: 5 },
      { index: 1, openNote: "D3", label: "4th", minFret: 0 },
      { index: 2, openNote: "F#3", label: "3rd", minFret: 0 },
      { index: 3, openNote: "A3", label: "2nd", minFret: 0 },
      { index: 4, openNote: "D4", label: "1st", minFret: 0 },
    ],
  },
];

export const DEFAULT_TUNING_ID = "open-g";
