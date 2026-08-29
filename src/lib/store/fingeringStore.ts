import { create } from "zustand";
import { OPEN_FINGERING, type Fingering } from "@/lib/banjo/tuning";

interface FingeringState {
  fingering: Fingering;
  setFingering: (fingering: Fingering) => void;
}

export const useFingeringStore = create<FingeringState>()((set) => ({
  fingering: OPEN_FINGERING,
  setFingering: (fingering) => set({ fingering }),
}));
