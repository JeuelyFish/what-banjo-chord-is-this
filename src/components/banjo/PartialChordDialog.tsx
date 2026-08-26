"use client";

import * as Dialog from "@radix-ui/react-dialog";
import type { PartialChordCompletion } from "@/lib/banjo/chord";

interface PartialChordDialogProps {
  completions: PartialChordCompletion[];
  notes: string[];
}

export function PartialChordDialog({ completions, notes }: PartialChordDialogProps) {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button
          type="button"
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
            Possible chords
          </Dialog.Title>
          <p className="mt-1 text-sm text-foreground/70">
            Current Notes: {notes.join(", ")}
          </p>
          <ul className="mt-4 flex flex-col divide-y divide-foreground/10">
            {completions.map(({ note, chordName }) => (
              <li
                key={note}
                className="flex items-center justify-between py-2 text-sm"
              >
                <span className="font-bold">+ {note}</span>
                <span className="text-foreground/70">{chordName}</span>
              </li>
            ))}
          </ul>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
