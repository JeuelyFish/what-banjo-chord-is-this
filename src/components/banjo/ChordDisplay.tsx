import type { ChordResult, NoMatchReason } from "@/lib/banjo/chord";

interface ChordDisplayProps {
  result: ChordResult;
}

const REASON_MESSAGE: Record<NoMatchReason, string> = {
  "too-few-notes": "Add another note to form a chord",
  cluster: "These notes clash — no standard chord has two notes a half-step apart",
  "partial-chord":
    "This looks like part of a chord — one different note could complete it into one of several possible chords",
  "no-match": "Not a recognized chord",
};

// A fixed-width box keeps the fretboard from shifting as the chord name's
// length changes (e.g. "C" vs "Gbmb6b9"); the font size scales down for
// longer names so they don't wrap or spill past the box.
function textSizeClass(name: string): string {
  if (name.length <= 2) return "text-6xl";
  if (name.length <= 4) return "text-5xl";
  if (name.length <= 6) return "text-4xl";
  return "text-3xl";
}

export function ChordDisplay({ result }: ChordDisplayProps) {
  const hasMatch = result.names.length > 0;

  return (
    <div className="flex w-56 flex-none flex-col items-center gap-2">
      <span className="text-sm uppercase tracking-wide text-foreground/50">
        Chord
      </span>
      <span
        className={`${textSizeClass(
          result.primaryName
        )} font-bold tabular-nums transition-all duration-150`}
      >
        {result.primaryName}
      </span>
      {!hasMatch && (
        <>
          <span className="text-center text-sm text-foreground/70">
            {REASON_MESSAGE[result.reason!]}
          </span>
          <span className="text-sm text-foreground/50">
            Notes: {result.pitchClasses.join(", ")}
          </span>
        </>
      )}
    </div>
  );
}
