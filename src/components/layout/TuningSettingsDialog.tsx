"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { GearIcon } from "@radix-ui/react-icons";
import { Select, Theme } from "@radix-ui/themes";
import "@radix-ui/themes/styles.css";
import { TUNINGS } from "@/lib/banjo/tunings";
import { noteOctave, NOTE_OPTIONS, pitchClass } from "@/lib/banjo/notes";
import { buildCustomTuning, CUSTOM_TUNING_ID, OPEN_G_TUNING, type StringDef } from "@/lib/banjo/tuning";
import { useSettingsStore } from "@/lib/store/settingsStore";

type CustomNotes = [string, string, string, string, string];

function toDraftNotes(strings: StringDef[]): string[] {
  return strings.map((s) => s.openNote);
}

/** Renders a note like "G4" with the octave a size down, e.g. "G" + small "4". */
function NoteLabel({ note }: { note: string }) {
  return (
    <>
      <span className="font-bold">{pitchClass(note)}</span>
      <span className="text-[10px] font-medium text-foreground/50">{noteOctave(note)}</span>
    </>
  );
}

/** "Double C - gCGCD" -> "Double C" (the bold part of a tuning's Select label). */
function tuningLabel(name: string): string {
  const separator = " — ";
  const index = name.indexOf(separator);
  return index === -1 ? name : name.slice(0, index);
}

/** [G4, C3, G3, C4, D4] -> "g C G C D" (5th string lowercased, space-separated). */
function notationTokens(strings: StringDef[]): string {
  return strings
    .map((s, i) => {
      const pc = pitchClass(s.openNote);
      return i === 0 ? pc[0].toLowerCase() + pc.slice(1) : pc;
    })
    .join(" ");
}

// Deliberately roomy control heights so adjacent controls don't invite
// mis-taps, especially the five side-by-side per-string pickers.
const SELECT_TRIGGER_HEIGHT = "5rem";

// Each string picker is a square grid cell that scales between these two
// bounds — 5rem when there's room, shrinking in step with the viewport down
// to 3.5rem (still wide enough for a bold "F#" + small octave + the select's
// chevron) before falling back to horizontal scroll.
const NOTE_TRIGGER_MIN_SIZE = "3.5rem";
const NOTE_TRIGGER_MAX_SIZE = "5rem";

// Matches the combined width of the five string pickers at their largest
// (5 × 5rem boxes + 4 × gap-1.5 gaps) so the tuning select — and the strings
// row itself — line up edge-to-edge on wide screens; `min(100%, …)` lets
// both shrink to fit narrower ones instead of overflowing.
const TUNING_SELECT_WIDTH = "26.5rem";
const STRINGS_ROW_WIDTH = `min(100%, ${TUNING_SELECT_WIDTH})`;

// Caps the note picker's dropdown to roughly a dozen visible rows (scrolling
// for the rest) so the full 48-note list doesn't overwhelm on tall screens.
const NOTE_CONTENT_MAX_HEIGHT = "24rem";

export function TuningSettingsDialog() {
  const tuningId = useSettingsStore((s) => s.tuningId);
  const setTuningId = useSettingsStore((s) => s.setTuningId);
  const customStrings = useSettingsStore((s) => s.customStrings);
  const applyCustomTuning = useSettingsStore((s) => s.applyCustomTuning);
  const [open, setOpen] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [selectedId, setSelectedId] = useState(tuningId);
  const [customNotes, setCustomNotes] = useState(() => toDraftNotes(customStrings ?? OPEN_G_TUNING));

  function handleGearClick() {
    setSpinning(true);
    setSelectedId(tuningId);
    if (tuningId === CUSTOM_TUNING_ID) {
      setCustomNotes(toDraftNotes(customStrings ?? OPEN_G_TUNING));
    }
    setOpen(true);
  }

  function handleSpinEnd() {
    setSpinning(false);
  }

  function handleTuningSelect(id: string) {
    setSelectedId(id);
    if (id === CUSTOM_TUNING_ID) {
      // Prefill from the last-applied custom tuning, or else whatever
      // tuning is currently on the instrument, so switching to Custom
      // starts from an already-valid, familiar tuning.
      const base = customStrings ?? TUNINGS.find((t) => t.id === tuningId)?.strings ?? OPEN_G_TUNING;
      setCustomNotes(toDraftNotes(base));
    }
  }

  function updateCustomNote(i: number, note: string) {
    setCustomNotes((prev) => prev.map((v, idx) => (idx === i ? note : v)));
  }

  function handleApply() {
    if (selectedId === CUSTOM_TUNING_ID) {
      applyCustomTuning(buildCustomTuning(customNotes as CustomNotes));
    } else {
      setTuningId(selectedId);
    }
    setOpen(false);
  }

  const isCustomDraft = selectedId === CUSTOM_TUNING_ID;
  const committedCustomNotes = customStrings?.map((s) => s.openNote) ?? null;

  const isDirty = isCustomDraft
    ? tuningId !== CUSTOM_TUNING_ID ||
      committedCustomNotes === null ||
      customNotes.some((n, i) => n !== committedCustomNotes[i])
    : selectedId !== tuningId;

  const previewStrings = TUNINGS.find((t) => t.id === selectedId)?.strings ?? [];

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <button
        type="button"
        aria-label="Tuning Settings"
        onClick={handleGearClick}
        className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-foreground/10 bg-background text-foreground/60 shadow-sm transition-colors hover:bg-foreground/5 hover:text-foreground"
      >
        <GearIcon
          width={20}
          height={20}
          aria-hidden="true"
          onAnimationEnd={handleSpinEnd}
          className={spinning ? "animate-spin-once" : ""}
        />
      </button>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-foreground/40 backdrop-blur-[1px]" />
        <Dialog.Content className="fixed top-1/2 left-1/2 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-foreground/10 bg-background p-6 shadow-2xl shadow-foreground/20 sm:max-w-lg">
          <Dialog.Close asChild>
            <button
              type="button"
              aria-label="Close"
              className="absolute top-4 right-4 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full text-foreground/50 hover:bg-foreground/10 hover:text-foreground"
            >
              <svg
                viewBox="0 0 20 20"
                fill="none"
                className="h-4 w-4"
                aria-hidden="true"
              >
                <path
                  d="M5 5L15 15M15 5L5 15"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </Dialog.Close>
          <Dialog.Title className="pr-6 text-lg font-bold">Tuning Settings</Dialog.Title>

          <Theme accentColor="brown" hasBackground={false} radius="large" className="contents">
            <div className="mt-5 flex flex-col items-center gap-4">
              <div className="flex w-full flex-col gap-1.5">
                <span className="text-sm font-semibold text-foreground/70">Tuning</span>
                <div className="flex w-full justify-center">
                  <Select.Root size="3" value={selectedId} onValueChange={handleTuningSelect}>
                    <Select.Trigger
                      style={{ width: TUNING_SELECT_WIDTH, maxWidth: "100%", height: SELECT_TRIGGER_HEIGHT }}
                    />
                    <Select.Content>
                      {TUNINGS.map((t) => (
                        <Select.Item key={t.id} value={t.id}>
                          {tuningLabel(t.name)}
                          <span style={{ opacity: 0.55, fontSize: "0.75em" }}>
                            {" — "}
                            {notationTokens(t.strings)}
                          </span>
                        </Select.Item>
                      ))}
                      <Select.Item value={CUSTOM_TUNING_ID}>Custom</Select.Item>
                    </Select.Content>
                  </Select.Root>
                </div>
              </div>

              <div className="flex w-full flex-col gap-1.5">
                <span className="text-sm font-semibold text-foreground/70">Strings</span>
                {isCustomDraft ? (
                  <div
                    className="mx-auto grid gap-1.5 overflow-x-auto pb-1"
                    style={{
                      width: STRINGS_ROW_WIDTH,
                      gridTemplateColumns: `repeat(5, minmax(${NOTE_TRIGGER_MIN_SIZE}, ${NOTE_TRIGGER_MAX_SIZE}))`,
                    }}
                  >
                    {OPEN_G_TUNING.map((s, i) => (
                      <div key={s.index} className="flex min-w-0 flex-col items-center gap-1">
                        <Select.Root
                          size={{ initial: "1", xs: "2", sm: "3" }}
                          value={customNotes[i]}
                          onValueChange={(note) => updateCustomNote(i, note)}
                        >
                          <Select.Trigger
                            aria-label={`${s.label} string note`}
                            style={{ width: "100%", height: "auto", aspectRatio: "1", gap: 3 }}
                          >
                            <NoteLabel note={customNotes[i]} />
                          </Select.Trigger>
                          <Select.Content style={{ maxHeight: NOTE_CONTENT_MAX_HEIGHT }}>
                            {NOTE_OPTIONS.map((note) => (
                              <Select.Item key={note} value={note}>
                                <NoteLabel note={note} />
                              </Select.Item>
                            ))}
                          </Select.Content>
                        </Select.Root>
                        <span className="text-[11px] text-foreground/50">{s.label}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div
                    className="mx-auto grid gap-1.5 overflow-x-auto pb-1"
                    style={{
                      width: STRINGS_ROW_WIDTH,
                      gridTemplateColumns: `repeat(5, minmax(${NOTE_TRIGGER_MIN_SIZE}, ${NOTE_TRIGGER_MAX_SIZE}))`,
                    }}
                  >
                    {previewStrings.map((s) => (
                      <div key={s.index} className="flex min-w-0 flex-col items-center gap-1">
                        <div
                          className="flex items-center justify-center text-sm font-bold sm:text-base"
                          style={{
                            width: "100%",
                            aspectRatio: "1",
                            borderRadius: "var(--radius-3)",
                            backgroundColor: "var(--color-surface)",
                            boxShadow: "inset 0 0 0 1px var(--gray-a7)",
                          }}
                        >
                          {pitchClass(s.openNote)}
                        </div>
                        <span className="text-[11px] text-foreground/50">{s.label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Theme>

          <button
            type="button"
            disabled={!isDirty}
            onClick={handleApply}
            className="mt-6 w-full cursor-pointer rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-background transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
          >
            Apply
          </button>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
