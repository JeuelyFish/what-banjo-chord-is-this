"use client";

import { useMemo, useState } from "react";
import { Fretboard, FRETBOARD_WIDTH } from "./Fretboard";
import { ChordDisplay } from "./ChordDisplay";
import { StrumButton } from "./StrumButton";
import { detectChord } from "@/lib/banjo/chord";
import { allSoundingNotes, noteAtFret } from "@/lib/banjo/notes";
import { OPEN_FINGERING, type Fingering, type StringIndex } from "@/lib/banjo/tuning";
import { useSettingsStore, useTuning } from "@/lib/store/settingsStore";
import { useAudioSettingsStore } from "@/lib/store/audioSettingsStore";
import { playNote, playNotes } from "@/lib/audio/audioEngine";

export function FretboardSection() {
  const tuning = useTuning();
  const tuningId = useSettingsStore((s) => s.tuningId);
  const volume = useAudioSettingsStore((s) => s.volume);
  const fretClickSoundEnabled = useAudioSettingsStore((s) => s.fretClickSoundEnabled);
  const chordSoundEnabled = useAudioSettingsStore((s) => s.chordSoundEnabled);
  const strumSpreadMs = useAudioSettingsStore((s) => s.strumSpreadMs);
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
    const newFret = fingering[stringIndex] === fret ? null : fret;
    setFingering((prev) => ({ ...prev, [stringIndex]: newFret }));
    if (volume > 0 && fretClickSoundEnabled) {
      const stringDef = tuning.find((s) => s.index === stringIndex)!;
      playNote(noteAtFret(stringDef, newFret ?? 0), volume / 100);
    }
  }

  function handleOpen(stringIndex: StringIndex) {
    setFingering((prev) => ({ ...prev, [stringIndex]: null }));
    if (volume > 0 && fretClickSoundEnabled) {
      const stringDef = tuning.find((s) => s.index === stringIndex)!;
      playNote(noteAtFret(stringDef, 0), volume / 100);
    }
  }

  function handleStrum() {
    playNotes(allSoundingNotes(fingering, tuning), strumSpreadMs, volume / 100);
  }

  const showStrumButton = volume > 0 && chordSoundEnabled;

  return (
    <div className="flex flex-col items-center gap-1 sm:flex-row sm:items-center sm:justify-center">
      <div className="flex flex-col items-center gap-2" style={{ width: FRETBOARD_WIDTH }}>
        <Fretboard fingering={fingering} tuning={tuning} onFret={handleFret} onOpen={handleOpen} />
        {showStrumButton && <StrumButton onStrum={handleStrum} />}
      </div>
      <ChordDisplay result={chordResult} />
    </div>
  );
}
