import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AudioSettingsState {
  volume: number; // 0-100, 0 = muted
  fretClickSoundEnabled: boolean;
  chordSoundEnabled: boolean;
  strumSpreadMs: number;
  setVolume: (value: number) => void;
  setFretClickSoundEnabled: (value: boolean) => void;
  setChordSoundEnabled: (value: boolean) => void;
  setStrumSpreadMs: (ms: number) => void;
}

export const useAudioSettingsStore = create<AudioSettingsState>()(
  persist(
    (set) => ({
      volume: 100,
      fretClickSoundEnabled: true,
      chordSoundEnabled: true,
      strumSpreadMs: 0,
      setVolume: (value) => set({ volume: value }),
      setFretClickSoundEnabled: (value) => set({ fretClickSoundEnabled: value }),
      setChordSoundEnabled: (value) => set({ chordSoundEnabled: value }),
      setStrumSpreadMs: (ms) => set({ strumSpreadMs: ms }),
    }),
    { name: "banjo-audio-settings" }
  )
);
