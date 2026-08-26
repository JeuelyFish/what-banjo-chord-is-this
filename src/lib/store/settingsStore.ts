import { create } from "zustand";
import { persist } from "zustand/middleware";
import { OPEN_G_TUNING, type StringDef } from "@/lib/banjo/tuning";
import { DEFAULT_TUNING_ID, TUNINGS } from "@/lib/banjo/tunings";

interface SettingsState {
  tuningId: string;
  setTuningId: (id: string) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      tuningId: DEFAULT_TUNING_ID,
      setTuningId: (id) => set({ tuningId: id }),
    }),
    { name: "banjo-settings" }
  )
);

/** The full string definitions for the currently-applied tuning. */
export function useTuning(): StringDef[] {
  const tuningId = useSettingsStore((s) => s.tuningId);
  return TUNINGS.find((t) => t.id === tuningId)?.strings ?? OPEN_G_TUNING;
}
