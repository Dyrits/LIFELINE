# Handoff: Lifeline, scriptbook added for visual review

Supersedes: `.agents/handoffs/2026-10-03-1945-career-review-feedback.md`. Everything in it still
holds (next focus: collect the user's feedback on batch 1); this adds one change.

## What changed

The visual review loop is now saved as scripts. Call the `scriptbook` skill before writing any
script or pipeline; both indexes are `~/.agents/scripts/INDEX.md` and `.agents/scripts/INDEX.md`.

Re-shooting every stop after a change (dev server running):

```sh
node .agents/scripts/print-career-stops.mjs --urls http://localhost:5173 --lang fr --end \
  | node ~/.agents/scripts/capture-page-screenshots.mjs --out /tmp/shots --wait 1500
~/.agents/scripts/tile-images.sh -o /tmp/sheet.png -c 2 /tmp/shots/*.png
```

## New source: LinkedIn profile

`documentation/sources/linkedin/linkedin-profile.md` is a Markdown transcription of the user's
LinkedIn PDF exports (the PDFs stay outside the repository). Both exports are the same French text; the profile has no
English version. It disagrees with the WAYPOINTS data behind `src/data/career.ts` (see the last
deferred item in `documentation/work-in-progress.md`): ask the user which source wins before
changing career content. It includes the user's phone and email, published in the public
repository with the user's agreement.

## Suggested skills

`scriptbook` first, then those listed in the superseded handoff (`iterate`, `webapp-testing`,
`frontend-design`, `grilling`, `unslop`).
