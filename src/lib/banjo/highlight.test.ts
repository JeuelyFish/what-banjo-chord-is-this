import { describe, expect, it } from "vitest";
import { highlightedPositions } from "./highlight";
import { OPEN_G_TUNING, type Fingering } from "./tuning";

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

describe("highlightedPositions — fingering-aware filtering", () => {
  // 2nd string (index 3) fretted at fret 6: B3 + 6 semitones = F4. Open
  // strings sound D3, G3, D4, so the fragment is {D, G, F} — a partial
  // Csus24 (needs C, D, F, G) missing only "C".
  const B_STRING_FRET_6: Fingering = { 0: null, 1: null, 2: null, 3: 6, 4: null };

  it("drops a 'C' position that would overwrite the fragment's only 'G'", () => {
    // 3rd string (index 2), fret 5: G3 + 5 semitones = C4 — a real C, but
    // fretting it silences the open G3 that's the only source of "G".
    const positions = highlightedPositions(OPEN_G_TUNING, "C", B_STRING_FRET_6);
    expect(positions).not.toContainEqual({ stringIndex: 2, fret: 5 });
  });

  it("drops a 'C' position that would overwrite the fragment's only 'F'", () => {
    // 2nd string (index 3), fret 1: B3 + 1 semitone = C4 — replaces the F4
    // just fretted on that same string.
    const positions = highlightedPositions(OPEN_G_TUNING, "C", B_STRING_FRET_6);
    expect(positions).not.toContainEqual({ stringIndex: 3, fret: 1 });
  });

  it("keeps the drone string's 'C', which adds the note without displacing anything", () => {
    const positions = highlightedPositions(OPEN_G_TUNING, "C", B_STRING_FRET_6);
    expect(positions).toContainEqual({ stringIndex: 0, fret: 5 });
  });

  it("keeps a 'C' position that overwrites a redundant note (another string still covers it)", () => {
    // 4th and 1st strings are both open D; fretting one to C leaves the
    // other still supplying "D", so the fragment's D coverage survives.
    const positions = highlightedPositions(OPEN_G_TUNING, "C", B_STRING_FRET_6);
    expect(positions).toContainEqual({ stringIndex: 1, fret: 10 });
    expect(positions).toContainEqual({ stringIndex: 4, fret: 10 });
  });

  it("returns every matching position when no fingering is given", () => {
    const withFingering = highlightedPositions(OPEN_G_TUNING, "C", B_STRING_FRET_6);
    const withoutFingering = highlightedPositions(OPEN_G_TUNING, "C");
    expect(withoutFingering.length).toBeGreaterThan(withFingering.length);
  });
});
