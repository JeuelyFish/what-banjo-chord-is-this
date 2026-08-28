import { Note } from "tonal";
import { describe, expect, it } from "vitest";
import { allSoundingNotes, isValidNote, noteAtFret, NOTE_OPTIONS, noteOctave, OCTAVES, pitchClass, PITCH_CLASSES } from "./notes";
import { detectChord } from "./chord";
import { TUNINGS } from "./tunings";
import { OPEN_FINGERING, OPEN_G_TUNING, type Fingering, type StringDef } from "./tuning";

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

describe("allSoundingNotes", () => {
  it("returns every string's open note, 5th string first", () => {
    expect(allSoundingNotes(OPEN_FINGERING, OPEN_G_TUNING)).toEqual(["G4", "D3", "G3", "B3", "D4"]);
  });

  it("includes the drone even when unfretted, unlike detectChord", () => {
    const d7WithOpenFifth: Fingering = { 0: null, 1: 4, 2: 2, 3: 1, 4: null };
    expect(allSoundingNotes(d7WithOpenFifth, OPEN_G_TUNING)).toHaveLength(5);
    // detectChord ignores that same open drone note for naming purposes.
    expect(detectChord(d7WithOpenFifth).primaryName).toBe("D7");
  });

  it("reflects fretted positions", () => {
    const cShape: Fingering = { 0: null, 1: 2, 2: null, 3: 1, 4: 2 };
    expect(allSoundingNotes(cShape, OPEN_G_TUNING)).toEqual(["G4", "E3", "G3", "C4", "E4"]);
  });

  it("works against a tuning other than Open G", () => {
    const doubleC = TUNINGS.find((t) => t.id === "double-c")!.strings;
    expect(allSoundingNotes(OPEN_FINGERING, doubleC)).toEqual(["G4", "C3", "G3", "C4", "D4"]);
  });

  it("orders output by string index regardless of input array order", () => {
    const shuffled: StringDef[] = [...OPEN_G_TUNING].reverse();
    expect(allSoundingNotes(OPEN_FINGERING, shuffled)).toEqual(["G4", "D3", "G3", "B3", "D4"]);
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
