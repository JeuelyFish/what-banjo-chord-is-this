"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { RadioCards, Theme } from "@radix-ui/themes";
import "@radix-ui/themes/styles.css";
import type { PartialChordCompletion } from "@/lib/banjo/chord";
import { useHighlightStore } from "@/lib/store/highlightStore";

interface PartialChordDialogProps {
  completions: PartialChordCompletion[];
  notes: string[];
}

export function PartialChordDialog({ completions, notes }: PartialChordDialogProps) {
  const highlightedNote = useHighlightStore((s) => s.highlightedNote);
  const setHighlightedNote = useHighlightStore((s) => s.setHighlightedNote);
  const [open, setOpen] = useState(false);
  const [draftNote, setDraftNote] = useState<string | null>(highlightedNote);

  function handleTriggerClick() {
    setDraftNote(highlightedNote);
  }

  function handleFindNote() {
    if (!draftNote) return;
    setHighlightedNote(draftNote);
    setOpen(false);
  }

  const isDirty = draftNote !== null && draftNote !== highlightedNote;

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          type="button"
          onClick={handleTriggerClick}
          className="cursor-pointer text-accent underline underline-offset-2 hover:text-accent/70"
        >
          several possible chords
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-foreground/40 backdrop-blur-[1px]" />
        <Dialog.Content className="fixed top-1/2 left-1/2 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-foreground/10 bg-background p-6 shadow-2xl shadow-foreground/20">
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
          <Dialog.Title className="pr-6 text-lg font-bold">
            Possible Chords
          </Dialog.Title>
          <p className="mt-1 text-sm text-foreground/70">
            Current Notes: {notes.join(", ")}
          </p>
          <div className="mt-4 flex items-center justify-between text-xs font-semibold tracking-wide text-foreground/50 uppercase">
            <span>Add note</span>
            <span>Get chord</span>
          </div>

          <Theme accentColor="brown" hasBackground={false} radius="large" className="contents">
            <RadioCards.Root
              value={draftNote ?? undefined}
              onValueChange={setDraftNote}
              columns="1"
              size="1"
              className="mt-2"
            >
              {completions.map(({ note, chordName }) => (
                <RadioCards.Item key={note} value={note} className="w-full">
                  <span className="flex w-full items-center justify-between text-sm">
                    <span className="font-bold">{note}</span>
                    <span className="text-foreground/70">{chordName}</span>
                  </span>
                </RadioCards.Item>
              ))}
            </RadioCards.Root>
          </Theme>

          <button
            type="button"
            disabled={!isDirty}
            onClick={handleFindNote}
            className="mt-4 w-full cursor-pointer rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-background transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
          >
            Find Note For Chord
          </button>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
