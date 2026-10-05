# Handoff: Lifeline, misty backdrop at Ubud

Supersedes: `.agents/handoffs/2026-10-04-2023-compass-and-shared-wash.md`. Its "Open, waiting for Dylan" list and the "Ready to fix test-first" items are still open and not repeated here; read it for them.

## State

- Branch `main`. Dylan committed and pushed the first, flat version of the backdrop (`bdf44d0`). The Mist style is committed on top in the commit carrying this handoff. Pushing may be blocked for agents by a hook; if so, Dylan pushes.
- `npm run check` (114 tests) and `npm run e2e` (15 tests) pass.
- Full record of this session's work: `documentation/work-in-progress.md`, section "Backgrounds under the line: Ubud's gate". No `CHANGELOG.md` Delivery yet: it waits for Dylan's acceptance.

## What happened

- Dylan likes the line running over a background, as over the flight map, and wants more backgrounds that are **not maps**.
- Crop rows under Merredin were built and rejected ("I don't like it", and they overlapped the Australia map). Removed.
- Ubud's candi bentar is no longer drawn by the pen: `backdrop: 'CandiBentar'` on the stop prints it behind the line (`backdrop()` in `src/career/build.ts`), and the line walks along the ground through it. Ubud now draws only the gallery, so the shared wash from the last session applies to no stop; its test passes vacuously.
- Style: Dylan rejected a flat filled print ("doesn't change much from before"; a background should look drawn or like aquarelle, and really sit behind). Of four candidates (aquarelle, pencil, mist, pencil sketch with a loose wash) he chose **Mist**: a pale blue-grey wash per part of the outline, details traced faintly, dissolving towards the ground (`src/engine/backdrop.ts`, rendered once per print as a sprite). The others were removed.

## Next

Dylan hasn't picked the next background. Offered: notebook paper under training stops, a street grid behind Lyon or Paris, a map for the flight home (Malacca → Bouguenais; stopovers needed from Dylan), all possibly in Mist. Mist is always blue-grey for now.

## Working notes

- Screenshots: `node .agents/scripts/screenshot-career.mjs OUT SEEK[+WAIT] ... --base URL` (see `.agents/scripts/INDEX.md`). Port 5173 may be taken by another project (Tidepool): start `npx vite --port 5199 --strictPort` and pass `--base http://localhost:5199`. Ubud is about 70.7–80.4 s.
- Dylan can't see screenshots the agent reads: give file paths or a live URL when asking him to judge a look.
- Biome sorts object keys (the renderer's `draw` methods are alphabetical): cut code by name, not by position.

## Suggested skills

- `iterate` (Dylan invokes it as `/iterate`): the batch workflow in use.
- `test-first` (model-invoked): every behaviour change.
- `document` (model-invoked): before editing `work-in-progress.md`, the backlog or `CHANGELOG.md`.
- `webapp-testing` (model-invoked): screenshots of stops.
- `re-explain` (user-invoked): when an answer doesn't land.
