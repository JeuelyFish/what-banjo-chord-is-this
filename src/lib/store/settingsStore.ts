import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CUSTOM_TUNING_ID, OPEN_G_TUNING, type StringDef } from "@/lib/banjo/tuning";
import { DEFAULT_TUNING_ID, TUNINGS } from "@/lib/banjo/tunings";

interface SettingsState {
  tuningId: string;
  // The user's last-applied custom tuning, kept even when `tuningId` is
  // switched away from "custom" so it's still there if they switch back.
  customStrings: StringDef[] | null;
  setTuningId: (id: string) => void;
  applyCustomTuning: (strings: StringDef[]) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      tuningId: DEFAULT_TUNING_ID,
      customStrings: null,
      setTuningId: (id) => set({ tuningId: id }),
      applyCustomTuning: (strings) => set({ tuningId: CUSTOM_TUNING_ID, customStrings: strings }),
    }),
    { name: "banjo-settings" }
  )
);

/** The full string definitions for the currently-applied tuning. */
export function useTuning(): StringDef[] {
  const tuningId = useSettingsStore((s) => s.tuningId);
  const customStrings = useSettingsStore((s) => s.customStrings);
  if (tuningId === CUSTOM_TUNING_ID) {
    return customStrings ?? OPEN_G_TUNING;
  }
  return TUNINGS.find((t) => t.id === tuningId)?.strings ?? OPEN_G_TUNING;
}
