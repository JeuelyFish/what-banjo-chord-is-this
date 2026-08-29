"use client";

import { useState, type ComponentProps } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  SpeakerLoudIcon,
  SpeakerModerateIcon,
  SpeakerOffIcon,
  SpeakerQuietIcon,
} from "@radix-ui/react-icons";
import { Slider, Switch, Theme } from "@radix-ui/themes";
import "@radix-ui/themes/styles.css";
import { useAudioSettingsStore } from "@/lib/store/audioSettingsStore";
import { useFingeringStore } from "@/lib/store/fingeringStore";
import { useTuning } from "@/lib/store/settingsStore";
import { allSoundingNotes } from "@/lib/banjo/notes";
import { playPreviewNote, playPreviewNotes } from "@/lib/audio/audioEngine";

function VolumeIcon({ volume, ...props }: { volume: number } & ComponentProps<typeof SpeakerLoudIcon>) {
  if (volume === 0) return <SpeakerOffIcon {...props} />;
  if (volume < 34) return <SpeakerQuietIcon {...props} />;
  if (volume < 67) return <SpeakerModerateIcon {...props} />;
  return <SpeakerLoudIcon {...props} />;
}

// Three note-onset ticks, close together or spread apart — directly depicts
// what the strum-speed slider controls (how far apart in time each string
// is triggered), which no stock icon set has a symbol for.
function TogetherIcon(props: ComponentProps<"svg">) {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M5 3.5V11.5M7.5 3.5V11.5M10 3.5V11.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function SpreadOutIcon(props: ComponentProps<"svg">) {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M2 3.5V11.5M7.5 3.5V11.5M13 3.5V11.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

export function AudioSettingsDialog() {
  const volume = useAudioSettingsStore((s) => s.volume);
  const fretClickSoundEnabled = useAudioSettingsStore((s) => s.fretClickSoundEnabled);
  const chordSoundEnabled = useAudioSettingsStore((s) => s.chordSoundEnabled);
  const strumSpreadMs = useAudioSettingsStore((s) => s.strumSpreadMs);
  const setVolume = useAudioSettingsStore((s) => s.setVolume);
  const setFretClickSoundEnabled = useAudioSettingsStore((s) => s.setFretClickSoundEnabled);
  const setChordSoundEnabled = useAudioSettingsStore((s) => s.setChordSoundEnabled);
  const setStrumSpreadMs = useAudioSettingsStore((s) => s.setStrumSpreadMs);
  const fingering = useFingeringStore((s) => s.fingering);
  const tuning = useTuning();
  const [open, setOpen] = useState(false);
  const [shaking, setShaking] = useState(false);

  const [draftVolume, setDraftVolume] = useState(volume);
  const [draftFretClickEnabled, setDraftFretClickEnabled] = useState(fretClickSoundEnabled);
  const [draftChordSoundEnabled, setDraftChordSoundEnabled] = useState(chordSoundEnabled);
  const [draftStrumSpreadMs, setDraftStrumSpreadMs] = useState(strumSpreadMs);

  function handleTriggerClick() {
    setShaking(true);
    setDraftVolume(volume);
    setDraftFretClickEnabled(fretClickSoundEnabled);
    setDraftChordSoundEnabled(chordSoundEnabled);
    setDraftStrumSpreadMs(strumSpreadMs);
  }

  const firstStringNote = tuning.find((s) => s.index === 4)!.openNote;

  // Sliders only preview on release (onValueCommit), not on every tick of a
  // drag (onValueChange) — otherwise scrubbing fires a burst of overlapping
  // plucks. The switches below preview immediately since they only ever
  // change in one discrete step.
  function handleVolumeCommit(v: number) {
    if (v > 0) playPreviewNote(firstStringNote, v / 100);
  }

  function handleFretClickToggle(enabled: boolean) {
    setDraftFretClickEnabled(enabled);
    if (enabled) playPreviewNote(firstStringNote, draftVolume / 100);
  }

  function handleChordSoundToggle(enabled: boolean) {
    setDraftChordSoundEnabled(enabled);
    if (enabled) playPreviewNotes(allSoundingNotes(fingering, tuning), draftStrumSpreadMs, draftVolume / 100);
  }

  function handleStrumSpreadCommit(ms: number) {
    playPreviewNotes(allSoundingNotes(fingering, tuning), ms, draftVolume / 100);
  }

  function handleApply() {
    setVolume(draftVolume);
    setFretClickSoundEnabled(draftFretClickEnabled);
    setChordSoundEnabled(draftChordSoundEnabled);
    setStrumSpreadMs(draftStrumSpreadMs);
    setOpen(false);
  }

  const isDirty =
    draftVolume !== volume ||
    draftFretClickEnabled !== fretClickSoundEnabled ||
    draftChordSoundEnabled !== chordSoundEnabled ||
    draftStrumSpreadMs !== strumSpreadMs;

  const subControlsDisabled = draftVolume === 0;
  const strumSliderDisabled = draftVolume === 0 || !draftChordSoundEnabled;

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          type="button"
          aria-label="Audio Settings"
          onClick={handleTriggerClick}
          className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-foreground/10 bg-background text-foreground/60 shadow-sm transition-colors hover:bg-foreground/5 hover:text-foreground"
        >
          <VolumeIcon
            volume={volume}
            width={20}
            height={20}
            aria-hidden="true"
            onAnimationEnd={() => setShaking(false)}
            className={shaking ? "animate-shake-once" : ""}
          />
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
              <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden="true">
                <path d="M5 5L15 15M15 5L5 15" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
              </svg>
            </button>
          </Dialog.Close>
          <Dialog.Title className="pr-6 text-lg font-bold">Audio Settings</Dialog.Title>

          <Theme accentColor="brown" hasBackground={false} radius="large" className="contents">
            <div className="mt-5 flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <span className="text-sm font-semibold text-foreground/70">Volume</span>
                <div className="flex items-center gap-3">
                  <SpeakerOffIcon aria-hidden="true" className="shrink-0 text-foreground/50" />
                  <Slider
                    size="2"
                    value={[draftVolume]}
                    onValueChange={([v]) => setDraftVolume(v)}
                    onValueCommit={([v]) => handleVolumeCommit(v)}
                    min={0}
                    max={100}
                    step={1}
                    className="flex-1"
                  />
                  <SpeakerLoudIcon aria-hidden="true" className="shrink-0 text-foreground/50" />
                </div>
                <div className="flex justify-between text-xs text-foreground/50">
                  <span>Mute</span>
                  <span>Max</span>
                </div>
              </div>

              <label
                className={`flex items-center justify-between gap-4 ${subControlsDisabled ? "opacity-40" : ""}`}
              >
                <span className="text-sm font-semibold text-foreground/70">Fret click sound</span>
                <Switch
                  size="2"
                  checked={draftFretClickEnabled}
                  onCheckedChange={handleFretClickToggle}
                  disabled={subControlsDisabled}
                />
              </label>

              <label
                className={`flex items-center justify-between gap-4 ${subControlsDisabled ? "opacity-40" : ""}`}
              >
                <span className="text-sm font-semibold text-foreground/70">Chord playback sound</span>
                <Switch
                  size="2"
                  checked={draftChordSoundEnabled}
                  onCheckedChange={handleChordSoundToggle}
                  disabled={subControlsDisabled}
                />
              </label>

              <div className={`flex flex-col gap-2 ${strumSliderDisabled ? "opacity-40" : ""}`}>
                <span className="text-sm font-semibold text-foreground/70">Strum speed</span>
                <div className="flex items-center gap-3">
                  <TogetherIcon aria-hidden="true" className="shrink-0 text-foreground/50" />
                  <Slider
                    size="2"
                    value={[draftStrumSpreadMs]}
                    onValueChange={([ms]) => setDraftStrumSpreadMs(ms)}
                    onValueCommit={([ms]) => handleStrumSpreadCommit(ms)}
                    min={0}
                    max={500}
                    step={10}
                    disabled={strumSliderDisabled}
                    className="flex-1"
                  />
                  <SpreadOutIcon aria-hidden="true" className="shrink-0 text-foreground/50" />
                </div>
                <div className="flex justify-between text-xs text-foreground/50">
                  <span>Together</span>
                  <span>Spread out</span>
                </div>
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
