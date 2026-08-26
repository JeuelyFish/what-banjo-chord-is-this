import { Note } from "tonal";
import { describe, expect, it } from "vitest";
import { isValidNote, noteAtFret, NOTE_OPTIONS, noteOctave, OCTAVES, pitchClass, PITCH_CLASSES } from "./notes";
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

describe("noteOctave", () => {
  it("returns the octave of a note", () => {
    expect(noteOctave("E3")).toBe(3);
    expect(noteOctave("G#4")).toBe(4);
  });

  it("throws for a note with no octave", () => {
    expect(() => noteOctave("G")).toThrow();
  });
});

describe("isValidNote", () => {
  it("accepts real pitched notes", () => {
    expect(isValidNote("G4")).toBe(true);
    expect(isValidNote("F#3")).toBe(true);
  });

  it("rejects garbage input", () => {
    expect(isValidNote("not a note")).toBe(false);
    expect(isValidNote("H4")).toBe(false);
  });
});

describe("PITCH_CLASSES and OCTAVES", () => {
  it("every combination is a valid, round-trippable note", () => {
    for (const pc of PITCH_CLASSES) {
      for (const oct of OCTAVES) {
        const note = `${pc}${oct}`;
        expect(isValidNote(note)).toBe(true);
        expect(pitchClass(note)).toBe(pc);
        expect(noteOctave(note)).toBe(oct);
      }
    }
  });
});

describe("NOTE_OPTIONS", () => {
  it("covers every pitch class across every octave", () => {
    expect(NOTE_OPTIONS).toHaveLength(PITCH_CLASSES.length * OCTAVES.length);
    expect(new Set(NOTE_OPTIONS).size).toBe(NOTE_OPTIONS.length);
    expect(NOTE_OPTIONS.every(isValidNote)).toBe(true);
  });

  it("is ordered low to high", () => {
    const midiValues = NOTE_OPTIONS.map((n) => Note.midi(n));
    const sorted = [...midiValues].sort((a, b) => (a as number) - (b as number));
    expect(midiValues).toEqual(sorted);
  });
});
