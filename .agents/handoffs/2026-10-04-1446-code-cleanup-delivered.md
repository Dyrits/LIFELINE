# Handoff: Lifeline, code cleanup delivered

Supersedes: `.agents/handoffs/2026-10-04-1041-code-conventions-and-biome-sorting.md`. The career work in `.agents/handoffs/2026-10-04-1027-shape-rework-and-travel-visuals.md` is unaffected, but its code names are out of date (see below).

## What this session did

- Applied the Biome sorting as its own commit (`d19aa71`, CHG-0009). `useSortedKeys` is off for `package.json` in `biome.json` `overrides`, because it fought `useSortedPackageJson` and made `biome check --write` loop forever.
- Ran `review-and-refactor` from the empty tree, with a Standards and a Specifications reviewer, and verified the result with both. Dylan's decisions are in CHG-0010; the delivery is CHG-0011. The open findings, which are behaviour or content changes and not refactors, are listed under "Code cleanup" in `documentation/work-in-progress.md`.
- Behaviour is unchanged. A JSON snapshot of `buildCareer(CAREER, '2026-10')` matched before and after, down to every float. `npm run check` (108 tests) and `npm run e2e` (13 tests) pass, and screenshots of every stop match.

## Code map after the refactor (older handoffs use the old names)

- `src/i18n.ts` is gone. Interface strings and the opening and closing captions live in `src/data/ui.ts` (`UI`, `CAREER_CAPTIONS`). Language detection is `src/language.ts` (`detect`, `save`, `is`), and months are `src/month.ts` (`index`, `of`, `format`, `span`, `at`). Import the last two as namespaces: `import * as month from './month'`.
- `Story` is generic over the thread name and nests its collections: `story.threads.add/get`, `story.cues.add`, `story.blots.add` (the seed is automatic), `story.captions.add`, and the same for `prints`, `labels`, `planes` and `zooms`, read through `.items`. `story.T` is now `story.time`.
- Pens: `THREAD.Ink`, `Gold`, `InkDetail`, `GoldDetail`, `Apprentices[0..2]`, all in `src/career/build.ts`.
- `StopMark` is `{ index, start: { time, x }, end: { time, x }, y, month, shapes }`, and `ShapeMark` is `{ time, x, y }`.
- Options are PascalCase: shape keys (`'Pickets'`, `'SkeletonWeed'`, …), `'Apprentices'`, kinds `'Job'`/`'Training'`, cue kinds `'Chord'`/`'Note'`, sides `'Left'`, `'Right'`, `'Above'`, `'Below'`, `'Centre'`, `'OnSite'`, and pigments (`'Sage'`, …). `Lang` keeps `'fr'`/`'en'`, an exemption written in `GUIDELINES.md`.
- `motifs.ts` exports `shape.keys`, `shape.of(key)` and `inkLength`. Flight geometry is in `src/career/flight.ts`, pigments in `src/engine/pigment.ts`, and `context2d`/`trace` in `src/engine/canvas.ts`.
- The renderer's public method is `render(...)`; `Player.draw()` calls it. The camera is `{ x, y, zoom }`, and the renderer's size is `width`, `height`, `scale`.
- `.agents/scripts/print-career-stops.mjs` and `measure-card-positions.mjs` are updated to these APIs.

## Next steps

1. Bring Dylan the decisions the review left open (list in `work-in-progress.md`, "Code cleanup"):
   - Caption length: stop captions end 1.4 s after their stop, but batch 3 says "until the next stop", and the card-drift fix gives the connector to the chapter line.
   - Paper textures: they fall back to a blank canvas, while `GUIDELINES.md` lists an unavailable canvas under "throw". Which rule wins?
   - Caption content: wording not in the first person, "Aujourd'hui" on a job whose data ends 2026-06, and "J'atteris en l'Australie".
   - Behaviours nobody agreed to: M toggles sound, Escape folds a reopened card, an iframe starts Career silently, hurrying skips the music; the hint is hidden at 640 px or less.
2. Fix test-first (`test-first`), once Dylan agrees: the four French plain spaces before ":" in `src/data/career.ts` (add a typography test over every French string first), and the English-only meta description in `index.html`.
3. The batches in `work-in-progress.md` still await Dylan's review of the look.

## Working with Dylan

- He asks for re-explanations in French with `/re-explain`; code and rules are in English.
- Caption facts beyond a card's content need his confirmation (`AGENTS.md`).
- Check shape, card, caption or layout changes with screenshots before handing them over (`AGENTS.md`). Capturing the same frame twice doesn't give identical bytes, so compare by eye or check the CSS cascade instead.

## Suggested skills

- `test-first` (model-invoked): the typography and meta-description fixes.
- `review-and-refactor` (model-invoked): after the next batch of behaviour changes.
- `document` (model-invoked): before touching `CHANGELOG.md`, the backlog or `work-in-progress.md`.
- `model-domain` (model-invoked): any change to `GUIDELINES.md`, for example the canvas rule.
- `webapp-testing` (model-invoked): screenshots of the stops.
- `publish-message` (user-only): if Dylan wants the review report published.
