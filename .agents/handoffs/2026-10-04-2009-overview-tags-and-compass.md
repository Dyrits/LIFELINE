# Handoff: Lifeline, overview labels, RGIS tag, compass

Supersedes: `.agents/handoffs/2026-10-04-1446-code-cleanup-delivered.md` (its code map is still current; its open review decisions are updated below).

## What this session did

All of it is implemented and checked, and awaits Dylan's review of the look. Details and evidence are in `documentation/work-in-progress.md`, under "Overview without place names" and "RGIS tag and compass". Commits: `c8e83d8` (Dylan's), plus the commit that follows this handoff (the plane round the compass).

- Canvas labels (pin towns, flight-map places, signposts) fade out as the camera steps back into the overview: `Label.until`, `labelAlpha` in `src/engine/story.ts`, set in `ending()` in `src/career/build.ts`.
- A split stop's later entries get their own tag that reopens only their card. It sits at the shape's top-right corner while drawing, and under the line with the other tags in the overview (`src/career/cards.ts`; `ShapeMark.start` added). This replaces batch 3's "side cards have no overview tag". The overview now has 22 tags.
- The backpack before Ubud became a `Compass` motif. Dylan turned down the passport first, and wants illustrations other than maps. Shapes can carry `words` (N/E/S/O in French, W in English). The ink pen flies as the plane while it is off the line round the dial, in `connect()`. The chapter line reads "Vers l'Asie, sac au dos." (Dylan's wording) / "Off to Asia, backpack on." (the agent's translation, not confirmed).
- `npm run check` (111 tests) and `npm run e2e` (15 tests) pass.

## Open, waiting for Dylan

Asked this session, still unanswered:
1. `GUIDELINES.md` must stay project-agnostic (Dylan's note). The proposed rewording of the "throw" rule: throw when the code can't work without the thing; fall back quietly when it is optional decoration or the browser may block it. It drops the "unavailable canvas" example. Paper textures keep their blank fallback (decided). Use `model-domain` to edit.
2. The opening, overview and closing captions (`CAREER_CAPTIONS` in `src/data/ui.ts`) aren't first person, present tense, as `documentation/requirements.md` requires. Should they be rewritten, or the rule relaxed for them?
3. The last caption says "Aujourd'hui…", but the Freelance job ends 2026-06 in `src/data/career.ts`. Is the job still running?
4. Unagreed extras (M toggles sound, Escape folds a reopened card, an iframe starts silently, hurrying skips the music, the hint is hidden at 640 px or less). Dylan didn't understand the question at first; it was re-explained as "keep or remove", with the agent recommending keeping them. No answer yet.

Decided but not built yet: stop captions stay up **until the next stop** (Dylan, 2026-10-04). Today they end 1.4 s after their stop. Work out how a caption shares the connector with a chapter line, test-first.

Ready to fix test-first without asking: "J'atteris en l'Australie" should read "J'atterris en Australie" (`src/data/career.ts`, Australia chapter); the four plain spaces before ":" (lines ~371, 473, 505, 557); the English-only meta description in `index.html`.

Seen on screenshots, not fixed: the last stop's (Freelance) card runs behind its caption text, and the needle's red spot barely shows over the compass wash. The other smaller items are in `work-in-progress.md`, "Code cleanup".

## Working with Dylan

- They review by screenshots and react visually. Offer 2–4 concrete options with a recommendation, and avoid options that need facts they haven't given (routes, dates).
- Facts a caption states beyond the card need their confirmation (`AGENTS.md`).
- The screenshot helper used this session was ad hoc: Playwright at 1440x900, `/?path=career&lang=fr&t=<s>`, then a wait (the story plays on after seeking). `node .agents/scripts/print-career-stops.mjs [--end]` gives stop times.
- Dylan may commit and push themself mid-session: check `git log` before committing.

## Suggested skills

- `iterate` (user-invoked by Dylan as `/iterate`; also model-invocable): the batch workflow this session ran under.
- `test-first` (model-invoked): every behaviour change above.
- `document` (model-invoked): before touching `work-in-progress.md`, the backlog or `CHANGELOG.md`. Deliveries go in the changelog only after Dylan accepts the look.
- `model-domain` (model-invoked): the `GUIDELINES.md` rewording.
- `webapp-testing` (model-invoked): screenshots of the stops.
- `re-explain` (user-invoked): Dylan uses it when an answer doesn't land.
- `guide` (model-invoked): Dylan typed `/guide` at the start of this session; it picks the next skill or workflow.
