import { SettingsDialog } from "./SettingsDialog";

export function Header() {
  return (
    <header className="flex items-center justify-between border-b border-black/10 px-6 py-4">
      <span className="text-lg font-semibold tracking-tight">
        What Banjo Chord Is This?
      </span>
      <SettingsDialog />
    </header>
  );
}
