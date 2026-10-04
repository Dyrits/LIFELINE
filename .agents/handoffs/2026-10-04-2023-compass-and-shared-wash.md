# Handoff: Lifeline, compass and shared wash

Supersedes: `.agents/handoffs/2026-10-04-2009-overview-tags-and-compass.md`. Its code notes and "Working with Dylan" section are still current. Read it only if something below needs more context.

## State

- Branch `main`. Commits `5fb1166`, `d59b53e` and the one carrying this handoff (shared wash) are local and **not pushed**: a hook blocks `git push` for agents, so Dylan pushes. `origin/main` is at `c8e83d8`.
- `npm run check` (113 tests) and `npm run e2e` (15 tests) pass.
- Everything built this session is implemented and checked, and awaits Dylan's review of the look. It's recorded in `documentation/work-in-progress.md`, sections "Overview without place names" and "RGIS tag and compass". No `CHANGELOG.md` Delivery has been written yet: deliveries wait for Dylan's acceptance (`document` skill rules).

## Since the last handoff

- The compass dial is drawn anticlockwise, so the line keeps its forward way into the dial (`Compass` in `src/career/motifs.ts`). The dashed needle sweep still goes south → west. Dylan was offered the long way round (through east and north) and hasn't answered.
- A stop with several shapes that isn't split (only Ubud today) lays one wash in its first shape's colour, stretched under all of them: `drawStop()` in `src/career/build.ts`, and the optional `Blot.stretch` in `src/engine/story.ts`, drawn in `src/engine/render.ts`. Overlapping round washes were tried first and rejected, because multiply blending darkens the overlap. The gate's top-left corner and the gallery's title-bar end still sit just outside the wash. Dylan was offered a bigger wash; no answer.

## Open, waiting for Dylan

1. The `GUIDELINES.md` "throw" rule reworded to be project-agnostic (throw when the code can't work without it; fall back when it's optional or the browser may block it). Use `model-domain`.
2. The opening, overview and closing captions (`CAREER_CAPTIONS` in `src/data/ui.ts`) break the first-person, present-tense rule in `documentation/requirements.md`. Should they be rewritten, or the rule relaxed?
3. The last caption says "Aujourd'hui…", but the Freelance job ends 2026-06 in `src/data/career.ts`. Is it still running?
4. Keep or remove the unagreed extras (M toggles sound, Escape folds a reopened card, an iframe starts silently, hurrying skips the music, the hint is hidden at 640 px or less). The agent recommended keeping them.
5. "Off to Asia, backpack on." is the agent's translation of Dylan's "Vers l'Asie, sac au dos.", not confirmed.

Decided, not built: stop captions stay up until the next stop (today they end 1.4 s after the stop). Work out how they share the connector with chapter lines, test-first.

Ready to fix test-first: "J'atteris en l'Australie" should read "J'atterris en Australie"; the plain spaces before ":" in `src/data/career.ts` (lines ~371, 473, 505, 557) should be non-breaking; the meta description in `index.html` is English only.

Seen, not fixed: the Freelance (last) card runs behind its caption text, and the compass needle's red spot barely shows over its wash.

## Screenshots

Ad hoc Playwright at 1440x900: `/?path=career&lang=fr&t=<seconds>` with the dev server on :5173, then a wait. The story keeps playing after the seek, so the wait sets the frame. Stop times: `node .agents/scripts/print-career-stops.mjs [--end]`. Ubud is about 70.7–80.4 s; the compass is drawn about 66–69 s.

## Suggested skills

- `iterate` (Dylan invokes it as `/iterate`; also model-invocable): the batch workflow in use.
- `test-first` (model-invoked): every behaviour change.
- `document` (model-invoked): before editing `work-in-progress.md`, the backlog or `CHANGELOG.md`.
- `model-domain` (model-invoked): the `GUIDELINES.md` rewording.
- `webapp-testing` (model-invoked): screenshots of stops.
- `re-explain` (user-invoked): Dylan uses it when an answer doesn't land.
- `guide` (model-invoked): picks the next skill or workflow.
