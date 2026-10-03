# Work in progress

## Goal

A personal site telling Dylan's story as a hand-drawn ink line, in the style of
`AI-XPERIENCE/pages/lifeline.html`, with two paths chosen on the intro screen:
**Life** and **Career**. Career is a lifeline whose stops carry cards describing
each job; career content comes from WAYPOINTS `data.js`.

## Approved approach

- Vite + strict TypeScript, no UI framework. Foldkit was considered and declined:
  the canvas engine needs drawImage, multiply blending and patterns, which
  Foldkit's canvas view lacks, so it would only manage the small UI around it.
- Static output; hosting not decided yet.
- FR / EN toggle: URL `?lang`, then saved choice, then browser language.

## Batch 1: shell + Career path (implemented and checked, awaiting user review)

Agreed behaviour:
- Intro: name, Life | Career choice (Life disabled, "coming soon"), FR/EN, sound.
- Career: one ink line through the 21 WAYPOINTS stops. Each stop draws a job
  shape (mapping approved as a starting point, "we'll rework it if needed");
  the pen lifts between a shape's strokes. Remote travel draws one loop per place.
  Training stops are drawn by the gold thread, which rides under the line until
  the training ends. Teaching spawns three apprentice threads.
- Card unfolds beside the line during its stop, folds into a tag afterwards;
  the final overview shows every stop; clicking a tag reopens its card.
- Plays on its own (~4 min 45 s), with time to read each card; hold to hurry,
  ← / → jump between stops.

Evidence:
- `npm run check`: tsc strict, Biome, 49 Vitest tests passing.
- `npm run e2e`: 3 Playwright tests passing (intro → Career, stepping, language
  switch and persistence, overview with 21 tags, reopening a card, no console errors).
- Screenshots of every stop, the overview and a 390 px phone viewport reviewed by
  the agent; fixes applied: bolt redrawn, furrows redrawn in perspective,
  lighter washes, ink no longer laid during pen-up travel, overview tags
  reduced to years (name on hover/focus).

Needs the user's judgment: overall look, each shape, pacing, card text and the
English translations.

## Deferred, in scope

- Life path content: needs Dylan's story beats.
- Overview is small on wide careers (21 stops across one screen): candidate
  improvement is a pannable / zoomable overview.
- Phone layout: drawing is small at 390 px wide.
- Hosting / deployment target.
- Reconcile career data with the LinkedIn profile (`documentation/sources/linkedin/linkedin-profile.md`),
  which differs from WAYPOINTS: EPSI and O'clock split into dated roles (EPSI did end in July 2025),
  Working in Lyon listed separately from Rubrash, extra Accenture and Lima bullets. Ask which source wins.

## Notes

- Foldkit skill folders the user added to the workspace are not part of this app and are not committed.
- Handoffs in `.agents/handoffs/` are committed; latest: `.agents/handoffs/2026-10-03-2010-scriptbook-for-visual-review.md`; saved scripts: `.agents/scripts/INDEX.md`.
- Next step: collect the user's feedback on batch 1 before anything else.
