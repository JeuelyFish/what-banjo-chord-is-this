import { Chord, Note } from "tonal";
import { OPEN_G_TUNING, type Fingering, type StringDef } from "./tuning";
import { noteAtFret, pitchClass } from "./notes";

/**
 * Why no chord name is showing, so the UI can say something more useful
 * than a bare dash. Computed from properties of the note set itself, not a
 * guess at what the player "meant" — no chord is invented or corrected.
 */
export type NoMatchReason = "too-few-notes" | "cluster" | "partial-chord" | "no-match";

export interface ChordResult {
  names: string[];
  primaryName: string; // friendly display name, or "—" if nothing matches
  pitchClasses: string[]; // fallback display when there's no chord match
  reason: NoMatchReason | null; // null once there's a match
  completions?: PartialChordCompletion[]; // set only when reason is "partial-chord"
}

/** A single note that would complete this fragment, and the chord it wins as. */
export interface PartialChordCompletion {
  note: string;
  chordName: string;
}

function rotations<T>(arr: T[]): T[][] {
  return arr.map((_, i) => [...arr.slice(i), ...arr.slice(0, i)]);
}

/** True if any two pitch classes sit a half-step apart, e.g. E and Eb. */
function hasHalfStepClash(pitchClasses: string[]): boolean {
  const chromas = pitchClasses.map((pc) => Note.chroma(pc)!);
  return chromas.some((a, i) =>
    chromas.some((b, j) => {
      if (j <= i) return false;
      const distance = Math.abs(a - b);
      return distance === 1 || distance === 11;
    })
  );
}

const CHROMATIC_PITCH_CLASSES = [
  "C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B",
];

/**
 * Every single note that, added to this set, would complete some known
 * chord — an exhaustive check found every real "no-match" 3-note fragment
 * has several unrelated single-note completions, not one obvious answer, so
 * the caller decides how many (or which) to show. Each completion's
 * `chordName` is whichever name `bestChordNames` ranks first — the same
 * name `detectChord` would show as `primaryName` once that note is
 * actually played.
 */
function partialChordCompletions(pitchClasses: string[]): PartialChordCompletion[] {
  return CHROMATIC_PITCH_CLASSES.filter((note) => !pitchClasses.includes(note))
    .map((note) => ({ note, chordName: bestChordNames([...pitchClasses, note])[0] }))
    .filter((completion): completion is PartialChordCompletion => completion.chordName !== undefined);
}

function noMatchReason(
  pitchClasses: string[],
  completions: PartialChordCompletion[]
): NoMatchReason {
  if (pitchClasses.length < 3) return "too-few-notes";
  if (hasHalfStepClash(pitchClasses)) return "cluster";
  if (completions.length > 0) return "partial-chord";
  return "no-match";
}

/**
 * tonal names plain major triads "GM"/"CM" and keeps slash/bass info in the
 * symbol (e.g. "CM/E"); a beginner just wants "G" or "C", so strip the bass
 * and drop the major-only "M" suffix. Every other quality (Em, D7, ...)
 * already reads naturally once the bass suffix is gone.
 */
function friendlyName(symbol: string): string {
  const base = symbol.split("/")[0];
  const chord = Chord.get(base);
  if (chord.empty) return base;
  return chord.type === "major" ? chord.tonic ?? base : base;
}

/**
 * tonal's Chord.detect treats whichever note comes first in the input as
 * the bass, so a single call is order-sensitive and can surface a
 * slash-chord or enharmonic reading (e.g. "Em#5") instead of the plain
 * chord a fretting shape is meant to sound like. Trying every rotation and
 * voting on the most-agreed-upon root (ignoring bass position) gives a
 * stable answer that matches how these shapes are actually taught.
 */
function bestChordNames(pitchClasses: string[]): string[] {
  const votes = new Map<string, number>();
  for (const rotation of rotations(pitchClasses)) {
    const top = Chord.detect(rotation)[0];
    if (!top) continue;
    const name = friendlyName(top);
    votes.set(name, (votes.get(name) ?? 0) + 1);
  }
  return [...votes.entries()].sort((a, b) => b[1] - a[1]).map(([name]) => name);
}

export function detectChord(fingering: Fingering, tuning: StringDef[] = OPEN_G_TUNING): ChordResult {
  // The 5th string is a drone: include it only when the player has
  // deliberately fretted it, since its open note can clash with shapes
  // played higher up the neck (e.g. it turns a D7 shape into a Gsus4add9).
  const soundingStrings = tuning.filter(
    (s) => s.index !== 0 || fingering[s.index] !== null
  );
  const notes = soundingStrings.map((s) => noteAtFret(s, fingering[s.index] ?? 0));
  const pitchClasses = Array.from(new Set(notes.map(pitchClass)));
  const names = bestChordNames(pitchClasses);

  if (names.length > 0) {
    return { names, primaryName: names[0], pitchClasses, reason: null };
  }

  const completions = partialChordCompletions(pitchClasses);
  const reason = noMatchReason(pitchClasses, completions);
  return {
    names,
    primaryName: "—",
    pitchClasses,
    reason,
    completions: reason === "partial-chord" ? completions : undefined,
  };
}
