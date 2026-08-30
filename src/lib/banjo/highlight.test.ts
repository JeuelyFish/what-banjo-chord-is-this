import { describe, expect, it } from "vitest";
import { highlightedPositions } from "./highlight";
import { OPEN_G_TUNING } from "./tuning";

describe("highlightedPositions", () => {
  it("includes an open string whose pitch class matches", () => {
    // 3rd string (index 2) is open G.
    expect(highlightedPositions(OPEN_G_TUNING, "G")).toContainEqual({ stringIndex: 2, fret: null });
  });

  it("includes the octave duplicate a full lap up the neck", () => {
    expect(highlightedPositions(OPEN_G_TUNING, "G")).toContainEqual({ stringIndex: 2, fret: 12 });
  });

  it("includes a plain fretted match on a string with a different open note", () => {
    // 4th string (index 1) is open D3; D3 + 5 semitones = G3.
    expect(highlightedPositions(OPEN_G_TUNING, "G")).toContainEqual({ stringIndex: 1, fret: 5 });
  });

  it("respects the 5th string's minFret floor", () => {
    // 5th string (index 0) is open G4, minFret 5; G4 + 5 semitones = C5.
    const positions = highlightedPositions(OPEN_G_TUNING, "C");
    expect(positions).toContainEqual({ stringIndex: 0, fret: 5 });
    expect(positions.some((p) => p.stringIndex === 0 && p.fret !== null && p.fret < 5)).toBe(false);
  });
});
