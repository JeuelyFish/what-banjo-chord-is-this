"use client";

import { useMemo, useState } from "react";
import { Fretboard } from "./Fretboard";
import { ChordDisplay } from "./ChordDisplay";
import { detectChord } from "@/lib/banjo/chord";
import { OPEN_FINGERING, type Fingering, type StringIndex } from "@/lib/banjo/tuning";

export function FretboardSection() {
  const [fingering, setFingering] = useState<Fingering>(OPEN_FINGERING);
  const chordResult = useMemo(() => detectChord(fingering), [fingering]);

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
    <div className="flex flex-col items-center gap-10 sm:flex-row sm:items-center sm:justify-center">
      <Fretboard fingering={fingering} onFret={handleFret} onOpen={handleOpen} />
      <ChordDisplay result={chordResult} />
    </div>
  );
}
