import { describe, expect, it } from "vitest";
import { NUM_FRETS, OPEN_FINGERING, OPEN_G_TUNING } from "./tuning";

describe("OPEN_G_TUNING", () => {
  it("has all 5 strings tuned to open G", () => {
    expect(OPEN_G_TUNING).toEqual([
      { index: 0, openNote: "G4", label: "5th", minFret: 5 },
      { index: 1, openNote: "D3", label: "4th", minFret: 0 },
      { index: 2, openNote: "G3", label: "3rd", minFret: 0 },
      { index: 3, openNote: "B3", label: "2nd", minFret: 0 },
      { index: 4, openNote: "D4", label: "1st", minFret: 0 },
    ]);
  });

  it("only restricts the 5th string's minimum fret", () => {
    const nonDrone = OPEN_G_TUNING.filter((s) => s.index !== 0);
    expect(nonDrone.every((s) => s.minFret === 0)).toBe(true);
  });
});

describe("NUM_FRETS", () => {
  it("is 12", () => {
    expect(NUM_FRETS).toBe(12);
  });
});

describe("OPEN_FINGERING", () => {
  it("has every string open", () => {
    expect(OPEN_FINGERING).toEqual({ 0: null, 1: null, 2: null, 3: null, 4: null });
  });
});
