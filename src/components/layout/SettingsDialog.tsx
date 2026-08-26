"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { GearIcon } from "@radix-ui/react-icons";
import { Select, Theme } from "@radix-ui/themes";
import "@radix-ui/themes/styles.css";
import { TUNINGS } from "@/lib/banjo/tunings";
import { pitchClass } from "@/lib/banjo/notes";
import type { StringDef } from "@/lib/banjo/tuning";
import { useSettingsStore } from "@/lib/store/settingsStore";

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

// Fixed trigger width, wide enough to fit the longest tuning name
// ("Open G (Standard) — gDGBD") without truncating, so the trigger doesn't
// change size as the user picks shorter options.
const SELECT_TRIGGER_WIDTH = 240;

export function SettingsDialog() {
  const tuningId = useSettingsStore((s) => s.tuningId);
  const setTuningId = useSettingsStore((s) => s.setTuningId);
  const [open, setOpen] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [selectedId, setSelectedId] = useState(tuningId);

  function handleGearClick() {
    setSpinning(true);
  }

  function handleSpinEnd() {
    setSpinning(false);
    setSelectedId(tuningId);
    setOpen(true);
  }

  function handleApply() {
    setTuningId(selectedId);
    setOpen(false);
  }

  const isDirty = selectedId !== tuningId;
  const previewStrings = TUNINGS.find((t) => t.id === selectedId)?.strings ?? [];

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <button
        type="button"
        aria-label="Settings"
        onClick={handleGearClick}
        className="cursor-pointer text-foreground/60 transition-colors hover:text-foreground"
      >
        <GearIcon
          width={28}
          height={28}
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
          <Dialog.Title className="pr-6 text-lg font-bold">Settings</Dialog.Title>

          <div className="mt-5 flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:justify-center">
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-semibold text-foreground/70">Tuning</span>
              <Theme accentColor="brown" hasBackground={false} radius="large" className="contents">
                <Select.Root value={selectedId} onValueChange={setSelectedId}>
                  <Select.Trigger style={{ height: 44, width: SELECT_TRIGGER_WIDTH }} />
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
                  </Select.Content>
                </Select.Root>
              </Theme>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-semibold text-foreground/70">Strings</span>
              <div className="flex gap-1.5">
                {previewStrings.map((s) => (
                  <div key={s.index} className="flex flex-col items-center gap-1">
                    <div className="flex h-11 w-9 items-center justify-center rounded-lg border-2 border-foreground/20 bg-background text-base font-bold">
                      {pitchClass(s.openNote)}
                    </div>
                    <span className="text-[11px] text-foreground/50">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

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
