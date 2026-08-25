import { describe, expect, it } from "vitest";
import { detectChord } from "./chord";
import { OPEN_FINGERING, type Fingering } from "./tuning";

// String indices: 0 = 5th (drone), 1 = 4th, 2 = 3rd, 3 = 2nd, 4 = 1st.

const C_SHAPE: Fingering = { 0: null, 1: 2, 2: null, 3: 1, 4: 2 };
const D7_SHAPE: Fingering = { 0: null, 1: 4, 2: 2, 3: 1, 4: null };
const EM_SHAPE: Fingering = { 0: null, 1: 2, 2: null, 3: null, 4: 2 };

describe("detectChord — reference shapes", () => {
  it("names the all-open shape G", () => {
    const result = detectChord(OPEN_FINGERING);
    expect(result.primaryName).toBe("G");
    expect(result.reason).toBeNull();
  });

  it("names the C shape C", () => {
    const result = detectChord(C_SHAPE);
    expect(result.primaryName).toBe("C");
    expect(result.reason).toBeNull();
  });

  it("names the D7 shape D7", () => {
    const result = detectChord(D7_SHAPE);
    expect(result.primaryName).toBe("D7");
    expect(result.reason).toBeNull();
  });

  it("names the Em shape Em", () => {
    const result = detectChord(EM_SHAPE);
    expect(result.primaryName).toBe("Em");
    expect(result.reason).toBeNull();
  });
});

describe("detectChord — 5th string handling", () => {
  it("ignores the 5th string's open drone note", () => {
    // Leaving the 5th string open must not change any of the shapes above —
    // it's excluded from detection unless the player deliberately frets it.
    const withOpenFifth: Fingering = { ...D7_SHAPE, 0: null };
    expect(detectChord(withOpenFifth).primaryName).toBe("D7");
  });

  it("includes the 5th string's note once it's deliberately fretted", () => {
    // Fretting the 5th string at fret 6 sounds Db, which clashes a
    // half-step against the D7 shape's D — proof the note is actually fed
    // into detection once fretted, rather than always being excluded.
    const withFrettedFifth: Fingering = { ...D7_SHAPE, 0: 6 };
    const result = detectChord(withFrettedFifth);
    expect(result.primaryName).not.toBe("D7");
    expect(result.reason).toBe("cluster");
  });
});

describe("detectChord — no-match reasons", () => {
  it("reports too-few-notes when fewer than 3 distinct pitch classes sound", () => {
    // 4th string fret 5 and 1st string fret 5 both land on G, leaving only
    // {G, B} sounding across all four main strings.
    const fingering: Fingering = { 0: null, 1: 5, 2: null, 3: null, 4: 5 };
    const result = detectChord(fingering);
    expect(result.names).toEqual([]);
    expect(result.reason).toBe("too-few-notes");
    expect(result.pitchClasses.sort()).toEqual(["B", "G"]);
  });

  it("reports cluster when two sounding notes are a half-step apart", () => {
    // Produces {C, Eb, E, Gb, B} — E and Eb clash a half-step apart, which
    // isn't part of any standard chord.
    const fingering: Fingering = { 0: 5, 1: 1, 2: 4, 3: 5, 4: 4 };
    const result = detectChord(fingering);
    expect(result.names).toEqual([]);
    expect(result.reason).toBe("cluster");
  });
});
