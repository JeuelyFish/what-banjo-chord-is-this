"use client";

import { PlayIcon } from "@radix-ui/react-icons";

interface StrumButtonProps {
  onStrum: () => void;
}

export function StrumButton({ onStrum }: StrumButtonProps) {
  return (
    <button
      type="button"
      onClick={onStrum}
      className="flex h-full w-full cursor-pointer items-center justify-center gap-1.5 rounded-b-full border border-accent px-3 text-sm font-medium text-accent transition-colors hover:bg-accent/10"
    >
      <PlayIcon aria-hidden="true" />
      Strum
    </button>
  );
}
