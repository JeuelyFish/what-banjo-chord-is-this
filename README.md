# What Banjo Chord Is This?

An interactive 5-string banjo fretboard (open-G tuning) that names the chord you're fretting, in real time.

Click frets on the fretboard to fret strings; the chord name updates live based on the pitch classes currently sounding. Chord detection is computed from the notes themselves (via [tonal](https://github.com/tonaljs/tonal)) rather than matched against a fixed lookup table, so it recognizes chord shapes it wasn't explicitly taught.

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

Unit tests cover the chord-detection logic in `src/lib/banjo/`.

## Tech stack

- [Next.js](https://nextjs.org) (App Router)
- [React](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [tonal](https://github.com/tonaljs/tonal) for music theory / chord detection
- [Vitest](https://vitest.dev) for tests

## License

MIT — see [LICENSE](LICENSE).
