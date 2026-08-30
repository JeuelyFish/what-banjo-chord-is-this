# What Banjo Chord Is This?

An interactive 5-string banjo fretboard that names the chord you're fretting, in real time.

Click frets on the fretboard to fret strings; the chord name updates live based on the pitch classes currently sounding. Chord detection is computed from the notes themselves (via [tonal](https://github.com/tonaljs/tonal)) rather than matched against a fixed lookup table, so it recognizes chord shapes it wasn't explicitly taught.

## Features

- **Multiple tunings** — Open G, Double C, Sawmill/G Modal, Open D, and Double D are built in, plus a Custom tuning where each string's open note can be set individually.
- **Possible Chords helper** — when the fretted notes are one note short of a recognized chord, the app lists every note that would complete it into a chord; picking one highlights every place that note can be fretted on the board.
- **Strum playback** — a Strum button plays the currently-fretted notes as a chord (via a Karplus-Strong plucked-string synth), with adjustable volume, per-fret click sounds, and strum speed (all configurable from Audio Settings).
- Settings (tuning and audio) persist across sessions in the browser.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to try it.

## Testing

```bash
npm test
```

Unit tests cover the chord-detection, tuning, note, highlight, and audio-synthesis logic in `src/lib/`.

## Tech stack

- [Next.js](https://nextjs.org) (App Router)
- [React](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [tonal](https://github.com/tonaljs/tonal) for music theory / chord detection
- [Zustand](https://zustand-demo.pmnd.rs) for state (with `persist` for saved settings)
- [Radix UI](https://www.radix-ui.com) (Themes, Dialog, Icons) for the settings dialogs and controls
- [Vitest](https://vitest.dev) for tests

## License

MIT — see [LICENSE](LICENSE).
