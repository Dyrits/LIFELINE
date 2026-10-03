# Lifeline

Dylan J. Gerrits's story, drawn as a single ink line. The intro offers two paths: **Life** (coming soon) and **Career**, where each job leaves its own shape on the line and a card pinned beside it.

## Run

```sh
npm install
npm run dev        # http://localhost:5173
```

`npm run build` writes a static site to `dist/`.

## Check

```sh
npm run check      # strict TypeScript, Biome, unit tests
npm run e2e        # browser smoke test (starts its own dev server)
```

## Edit the story

- Career content: `src/data/career.ts`. Every text is written `{ fr, en }`; stops are listed oldest first. The type checker and `tests/data.test.ts` catch missing translations, bad months and out-of-order stops.
- Shapes: each stop names its `motifs`; their drawings live in `src/career/motifs.ts`.

## URL shortcuts

- `?path=career` opens the career straight away, silently.
- `?t=120` jumps to that second of it.
- `?lang=en` or `?lang=fr` forces the language.

While it plays: hold Shift or the mouse to hurry, Space (or the Pause button) to pause, scroll to move back and forth in time, ← / → to jump between stops, M to toggle sound.
