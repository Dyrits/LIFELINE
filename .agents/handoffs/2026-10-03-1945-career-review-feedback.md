# Handoff: Lifeline, collect feedback on the Career path

Supersedes: none (first handoff).

## Where things stand

- Project: `/Volumes/APFS-G-DRIVE/Codelab/LIFELINE`, Vite + strict TypeScript, no UI framework.
- Batch 1 (intro with Life | Career, full Career path) is implemented, checked and committed,
  but **not yet accepted by the user**. Details, evidence and deferred items:
  `documentation/work-in-progress.md`. Run and edit instructions: `README.md`.
- Style reference: `/Volumes/APFS-G-DRIVE/Codelab/Dyrits/AI-XPERIENCE/pages/lifeline.html`.
  Career content source: https://github.com/Dyrits/WAYPOINTS/blob/main/data.js (already
  ported to `src/data/career.ts`, with English translations written by the agent).

## Next session focus

The user has feedback on batch 1 and will give it at the start of the next session.
Do not start new features before hearing it.

1. Collect the feedback. Sort it into: fixes within batch 1's agreed behaviour,
   new product choices (need approval), and ideas for later.
2. Turn the fixes into the next bounded batch, confirm it, implement, re-run checks and
   re-shoot screenshots (see "Verification" below).
3. Then ask for the Life path story beats (the next deferred batch).

Open questions already put to the user (answers pending):
- Shapes to rework, pacing (~4 min 45 s total).
- English translations, especially "Ramp agent", "Inventory clerk", "Teaching".
- Whether to make the final overview pannable / zoomable (shapes are small with 21 stops).
- Phone layout (drawing small at 390 px).
- Hosting target (undecided).

## Decisions worth knowing (not obvious from the code)

- Foldkit was considered and declined by the user after a pros/cons comparison: the canvas
  needs drawImage, multiply blending and patterns, which Foldkit's canvas view lacks.
  Don't reopen unless the user does.
- Job-shape mapping was approved "as a starting point, we'll rework it if needed".
- Handoffs in `.agents/handoffs/` are committed with the project (the user asked to amend
  this one into the batch commit).
- Commit only when the user asks; they asked to amend batch 1's commit with this handoff.

## Verification

- `npm run check` (tsc, Biome, Vitest) and `npm run e2e` (Playwright; starts its own server
  on port 5179).
- Visual review: render each stop with `?path=career&lang=fr&t=<seconds>`. Stop start times
  come from `buildCareer(CAREER, today).stops`. Python has no PIL here; tile screenshots
  with `ffmpeg … xstack` run under `bash -c` (the default shell is zsh/fish).

## Suggested skills

- `iterate`: resume the workflow from `documentation/work-in-progress.md`, settle the
  feedback batch, implement and validate.
- `grilling`: if the feedback opens several design questions (overview, phone layout).
- `webapp-testing`: browser checks and screenshots.
- `frontend-design`: if the feedback is about the look of cards, the intro or the overview.
- `unslop`: when rewriting card or caption text.
