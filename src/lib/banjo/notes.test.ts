import { describe, expect, it } from "vitest";
import { noteAtFret, pitchClass } from "./notes";
import { OPEN_G_TUNING } from "./tuning";

const fourthString = OPEN_G_TUNING[1]; // D3
const fifthString = OPEN_G_TUNING[0]; // G4, minFret 5

describe("noteAtFret", () => {
  it("returns the open note at fret 0", () => {
    expect(noteAtFret(fourthString, 0)).toBe("D3");
  });

  it("returns the correct note for a fretted position", () => {
    expect(noteAtFret(fourthString, 2)).toBe("E3");
  });

  it("works at the 5th string's minimum playable fret", () => {
    expect(noteAtFret(fifthString, fifthString.minFret)).toBe("C5");
  });
});

describe("pitchClass", () => {
  it("strips the octave from a note", () => {
    expect(pitchClass("E3")).toBe("E");
    expect(pitchClass("G4")).toBe("G");
  });
});
