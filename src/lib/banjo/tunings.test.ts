import { Note } from "tonal";
import { describe, expect, it } from "vitest";
import { OPEN_G_TUNING } from "./tuning";
import { DEFAULT_TUNING_ID, TUNINGS } from "./tunings";

describe("TUNINGS", () => {
  it("gives every tuning exactly 5 strings covering indices 0-4", () => {
    for (const tuning of TUNINGS) {
      expect(tuning.strings).toHaveLength(5);
      expect(tuning.strings.map((s) => s.index).sort()).toEqual([0, 1, 2, 3, 4]);
    }
  });

  it("gives every string a note tonal can parse", () => {
    for (const tuning of TUNINGS) {
      for (const s of tuning.strings) {
        expect(Note.midi(s.openNote)).not.toBeNull();
      }
    }
  });

  it("keeps the 5th string as a drone starting at fret 5", () => {
    for (const tuning of TUNINGS) {
      const fifth = tuning.strings.find((s) => s.index === 0)!;
      expect(fifth.minFret).toBe(5);
    }
  });

  it("includes the open-g entry matching OPEN_G_TUNING", () => {
    const openG = TUNINGS.find((t) => t.id === "open-g");
    expect(openG?.strings).toEqual(OPEN_G_TUNING);
  });
});

describe("DEFAULT_TUNING_ID", () => {
  it("resolves to an entry in TUNINGS", () => {
    expect(TUNINGS.some((t) => t.id === DEFAULT_TUNING_ID)).toBe(true);
  });
});
