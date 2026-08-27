"use client";

import { useMemo, useState } from "react";
import { Fretboard } from "./Fretboard";
import { ChordDisplay } from "./ChordDisplay";
import { detectChord } from "@/lib/banjo/chord";
import { OPEN_FINGERING, type Fingering, type StringIndex } from "@/lib/banjo/tuning";
import { useSettingsStore, useTuning } from "@/lib/store/settingsStore";

export function FretboardSection() {
  const tuning = useTuning();
  const tuningId = useSettingsStore((s) => s.tuningId);
  const [fingering, setFingering] = useState<Fingering>(OPEN_FINGERING);
  const [appliedTuningId, setAppliedTuningId] = useState(tuningId);

  // Reset fingering when the tuning changes: fret positions from one tuning
  // don't carry meaningful chord shapes into another. Adjusting state during
  // render (rather than in an effect) avoids an extra commit — see
  // https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
  if (tuningId !== appliedTuningId) {
    setAppliedTuningId(tuningId);
    setFingering(OPEN_FINGERING);
  }

  const chordResult = useMemo(() => detectChord(fingering, tuning), [fingering, tuning]);

  function handleFret(stringIndex: StringIndex, fret: number) {
    setFingering((prev) => ({
      ...prev,
      [stringIndex]: prev[stringIndex] === fret ? null : fret,
    }));
  }

  function handleOpen(stringIndex: StringIndex) {
    setFingering((prev) => ({ ...prev, [stringIndex]: null }));
  }

  return (
    <div className="flex flex-col items-center gap-1 sm:flex-row sm:items-center sm:justify-center">
      <Fretboard fingering={fingering} tuning={tuning} onFret={handleFret} onOpen={handleOpen} />
      <ChordDisplay result={chordResult} />
    </div>
  );
}
