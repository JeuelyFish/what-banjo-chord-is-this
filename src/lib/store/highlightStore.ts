import { create } from "zustand";

interface HighlightState {
  highlightedNote: string | null;
  setHighlightedNote: (note: string) => void;
  clearHighlight: () => void;
}

export const useHighlightStore = create<HighlightState>()((set) => ({
  highlightedNote: null,
  setHighlightedNote: (note) => set({ highlightedNote: note }),
  clearHighlight: () => set({ highlightedNote: null }),
}));
