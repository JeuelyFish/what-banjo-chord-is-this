import { AudioSettingsDialog } from "./AudioSettingsDialog";
import { TuningSettingsDialog } from "./TuningSettingsDialog";

export function Header() {
  return (
    <>
      <span className="fixed top-3 left-3 hidden text-lg font-semibold tracking-tight md:top-5 md:left-6 md:block">
        What Banjo Chord Is This?
      </span>
      <span
        className="fixed top-1/2 left-2 -translate-y-1/2 font-semibold tracking-tight whitespace-nowrap md:hidden"
        style={{ writingMode: "vertical-rl", lineHeight: "2.5rem", fontSize: "2.5rem" }}
      >
        What Banjo Chord Is This?
      </span>
      <div className="fixed top-3 right-3 flex flex-col items-center gap-2 sm:top-5 sm:right-6 sm:gap-3">
        <AudioSettingsDialog />
        <TuningSettingsDialog />
      </div>
    </>
  );
}
