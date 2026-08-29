"use client";

import { useEffect, useMemo } from "react";
import { Fretboard, FRETBOARD_WIDTH, FRETBOARD_STRINGS_WIDTH, FRET_HEIGHT } from "./Fretboard";
import { ChordDisplay } from "./ChordDisplay";
import { StrumButton } from "./StrumButton";
import { detectChord } from "@/lib/banjo/chord";
import { allSoundingNotes, noteAtFret } from "@/lib/banjo/notes";
import { OPEN_FINGERING, type StringIndex } from "@/lib/banjo/tuning";
import { useSettingsStore, useTuning } from "@/lib/store/settingsStore";
import { useAudioSettingsStore } from "@/lib/store/audioSettingsStore";
import { useFingeringStore } from "@/lib/store/fingeringStore";
import { playNote, playNotes } from "@/lib/audio/audioEngine";

export function FretboardSection() {
  const tuning = useTuning();
  const tuningId = useSettingsStore((s) => s.tuningId);
  const volume = useAudioSettingsStore((s) => s.volume);
  const fretClickSoundEnabled = useAudioSettingsStore((s) => s.fretClickSoundEnabled);
  const chordSoundEnabled = useAudioSettingsStore((s) => s.chordSoundEnabled);
  const strumSpreadMs = useAudioSettingsStore((s) => s.strumSpreadMs);
  const fingering = useFingeringStore((s) => s.fingering);
  const setFingering = useFingeringStore((s) => s.setFingering);

  // Reset fingering when the tuning changes: fret positions from one tuning
  // don't carry meaningful chord shapes into another. This has to be an
  // effect (rather than an in-render state adjustment) because fingering now
  // lives in a store other components subscribe to — updating it during
  // FretboardSection's render would update those components mid-render too.
  useEffect(() => {
    setFingering(OPEN_FINGERING);
  }, [tuningId, setFingering]);

  const chordResult = useMemo(() => detectChord(fingering, tuning), [fingering, tuning]);

  function handleFret(stringIndex: StringIndex, fret: number) {
    const newFret = fingering[stringIndex] === fret ? null : fret;
    setFingering({ ...fingering, [stringIndex]: newFret });
    if (volume > 0 && fretClickSoundEnabled) {
      const stringDef = tuning.find((s) => s.index === stringIndex)!;
      playNote(noteAtFret(stringDef, newFret ?? 0), volume / 100);
    }
  }

  function handleOpen(stringIndex: StringIndex) {
    setFingering({ ...fingering, [stringIndex]: null });
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
      <div className="flex flex-col items-center" style={{ width: FRETBOARD_WIDTH }}>
        <Fretboard fingering={fingering} tuning={tuning} onFret={handleFret} onOpen={handleOpen} />
        {showStrumButton && (
          <div className="mb-[11px]" style={{ width: FRETBOARD_STRINGS_WIDTH, height: FRET_HEIGHT }}>
            <StrumButton onStrum={handleStrum} />
          </div>
        )}
      </div>
      <ChordDisplay result={chordResult} />
    </div>
  );
}
