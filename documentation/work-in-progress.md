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

## Batch 2: first review feedback (implemented and checked, awaiting user review)

Feedback received 2026-10-04, all within batch 1's agreed behaviour:
- Pause: Pause / Play button and Space (Shift or a held click hurries; changed 2026-10-04 at the user's request, P and Space-to-hurry dropped); the bottom-left controls and hint stay visible
  for the whole drawing (the hint used to fade after 14 s). Open cards step aside from them.
- Year indicator: the year the pen has reached, bottom left. A stop holds its start year (the
  one on its card); the years roll by along the connector to the next stop; the overview shows
  the whole span (2011 – 2026).
- Detached strokes: a shape is now an unbroken outline (drawn by the line) plus details drawn
  by a second pen (`D` in ink, `CD` in gold for training), which sets off while the outline is
  drawn. The ink line never lifts (tested).
- Speed: details finish about when the outline does (at least 250 units/s), so dense shapes
  draw quickly (barcode ~11 s → ~3 s). Whole Career: ~4 min 48 s → ~4 min 03 s. Minimum card
  reading time raised by 1 s so short cards still last over 3 s.
- First stop: street distribution, so a newspaper replaces the door; English role is now
  "Street canvasser / Distributor" (French "Démarcheur / Distributeur" unchanged).

Evidence: `npm run check` (51 Vitest tests), `npm run e2e` (4 Playwright tests, new: pause
freezes the canvas, year and controls visible). Screenshots of every stop mid-drawing and at
its end, plus a 390 px phone view, reviewed by the agent.

The user's feedback stopped at "To not overload with feedback...": more is expected.

## Batch 3: story captions and split first stop (implemented and checked, awaiting user review)

Agreed 2026-10-04: the user wants a story told at nearly every stop, in the first person
("let's try first person"), and the first stop's two jobs on separate cards.
- Each stop carries a `caption` (`src/data/career.ts`), drafted by the agent from the card
  content, shown from the stop's start until the next stop. Captions sit at the bottom as in
  the reference page (user's choice); the line is held higher (camera offset 0.11 H) and open
  cards stop above the caption text, scrolling when too long. Opening line: "Ma carrière, d’un seul trait."
- `split: true` on a stop gives each later entry its own side card, pinned at the top right
  of the shape with the same index and opening when that shape starts (RGIS beside the
  barcode). Side cards have no overview tag; reopening the stop's tag opens them too.
- Reading time counts the caption's words.

Facts behind the drafted captions confirmed by the user (2026-10-04): student for the first jobs,
left Accenture by choice to travel, tarmac for the ramp agent job, the diploma made official
what the road taught.
- Chapter lines (approved): a stop's `chapter` is told along the connector leading to it,
  stretched to ~4.5 s. Three chapters: Australia (stop 2), Asia (stop 5), back in France
  (stop 10); captions of those stops reworded to avoid repeating them. Career now ~4 min 57 s.

Evidence: `npm run check` (53 Vitest tests, new: each stop's caption is shown during it, chapters are told before their stop),
`npm run e2e` (4 tests; first-stop test now checks the RGIS side card and the caption).
Screenshots of every stop reviewed by the agent.

## Batch 4: keys and scrubbing (implemented and checked, awaiting user review)

Requested 2026-10-04:
- Space pauses / resumes; Shift (or a held click) hurries. Mouse-clicked buttons drop focus so
  Space never re-presses them. Stop 0 English caption: "As a student, I hand out newspapers…".
- Scroll wheel / trackpad moves time both ways (about 0.02 s per pixel, a mouse notch ≈ 2 s),
  from the start to 12 s past the end; sounds scrolled over are skipped, the camera glides,
  a paused drawing stays paused. The camera now settles exactly once close, so a paused
  frame is perfectly still. Not on touch screens yet (a drag hurries there).

Evidence: `npm run check` (53 Vitest tests), `npm run e2e` (6 tests; new: Space pauses right
after clicking Career, Shift hurries, scrolling rewinds and skips ahead while paused).

## Fix: cards drifting along the line (implemented and checked, awaiting user review)

Reported 2026-10-04: INTERVALLES and Accenture cards slid right along the line as it moved.
Cause: a card stayed open until the next stop, across the connector, and was clamped at the left
edge once its stop's start scrolled off, so it stopped while the line moved on. Fix:
- A card is open only while its stop is drawn (t0 to t1), then folds into its tag; the
  connector and its chapter line have the screen to themselves.
- An open card is fixed to the line, with no left-edge clamp. On a stop wider than the
  screen it hangs further along (`cardAnchor` in `src/career/cards.ts`, computed from the
  viewport) so it is still on screen when the stop ends; its folded tag stays at the stop's start.
- Cards no longer step sideways for the controls or the caption: they end above them and scroll.
- Known limit: Transmission is wider than the screen, so its card waits at the right edge for
  its first seconds until the line reaches it.

Evidence: `npm run check` (54 Vitest tests), `npm run e2e` (7 tests; new: INTERVALLES keeps its
offset from the line until it folds, red before the fix at 48 px drift).
`node .agents/scripts/measure-card-positions.mjs --at end|start` at 1440x900 and 1280x720: every
card on screen at its stop's end (≥ 66 px from the left edge).

## Card style after WAYPOINTS V3 (implemented and checked, awaiting user review)

Requested 2026-10-04, reference https://github.com/Dyrits/WAYPOINTS/tree/V2/V3 (`style.css`, `app.js`
`cardHTML`). The card body is now a taped paper note (#fbf7ee, tilted 1°, tape strip, centre
crease, soft shadow) that unfolds from its top edge. Header row: place in red and the card's
years; remote route in blue (gold for training); each job by company (heading), role (italic),
dates with pill badges (remote in blue); red ✕ bullet markers. Kept from Lifeline: the folded
tag and the site's fonts (V3 loads Fraunces and JetBrains Mono from Google Fonts: offered to
the user, not adopted). Not taken: V3's "En parallèle" list of jobs still running.

Evidence: `npm run check` (54 tests), `npm run e2e` (7 tests); screenshots of four stops reviewed.

## Small requests, 2026-10-04 (implemented and checked, awaiting user review)

- Accenture caption: "des millions de comptes clients … une petite équipe" (no exact number). The card's
  bullet still says "30 millions" (WAYPOINTS text); offered, not changed.
- Flight to Australia over a world map: accepted, CHG-0006.
- Skeleton weed redrawn in detail: four lobed rosette leaves with midribs (rounded corners), bristles at the foot
  of the stem, branches with narrow leaves, four yellow flower heads (broad petals, `spots` washes in `sun`), two
  buds and a seed head. Strokes now lay a point at least every 4 units (`MAX_STEP` in `src/engine/story.ts`):
  fast detail pens were cutting small details into spikes, the cause of the earlier "squiggle" flower heads.
- Evidence: `npm run check` (54 tests), `npm run e2e` (7 tests); screenshots of the flight at eight moments, the
  weed close up, and every stop's end plus the overview (no change seen on other shapes).
- Bar kitchen (`pan` in `src/career/motifs.ts`) redrawn: the line draws a cocktail glass and a stove top; the
  detail pen adds an olive, knobs, flames (orange wash), a pan tossing food and two curls of steam.
- Lamb marking at Dubbo (`pickets` in `src/career/motifs.ts`, key unchanged) redrawn as a farm, at Dylan's request
  ("could look more like a farm overall"): the line draws a barn and a windmill tower; the detail pen adds the
  barn's braced door and hayloft, a fence, the windmill's braces, wheel and tail vane, and a ewe with her lamb.
- Ambulance dispatch (Kuala Lumpur, stop 8): the winding route to a cross is replaced by an ambulance, motif key
  `routeCross` renamed `ambulance`. The line draws the box, cab and bonnet; the detail pen adds the road under the
  wheels, wheel arches, wheels, a red cross, a stripe, the cab window and door, a headlight and a flashing light bar.
- Asia chapter: the stretch before Ubud draws a backpack (Dylan's choice among a backpack, a map Australia → Bali,
  and a preview map of the Asia stops): `way: 'backpack'` on the Ubud stop draws a shape on the connector while the
  chapter line is told, after a short lead-in; the connector shortens so the chapter still gets 4.5 s. Backpack:
  rolled sleeping mat on top, flap, two straps down the front, a squared front pocket, a bottle in the side pocket.
  Shape washes factored into `washes()` in `src/career/build.ts`.
- Ubud (stop 5) now draws two shapes: a candi bentar (Balinese split gate, `candiBentar`) whose halves the line
  climbs, walking through the gap between them, then the carpenter's gallery with a piece of furniture in each
  frame (chair, table, cabinet, stool, arched door, bookshelf).
- Working from several places: the travel loops are replaced by map pins (Dylan's choice among pins, passport
  stamps and luggage tags): the line rises into a pin per place in `remoteFrom` and comes back down, a red dot of
  wash and the town written above (the part before the comma of the place). Training stops draw their pins before
  the mortarboard too, instead of loops under it (`pins()` in `src/career/build.ts`, `PIN_GAP` 118 units per pin).
- Short trips: a stop with `signpost: true` (Dubbo) is reached past a signpost on the connector, the last stop's
  place on a board pointing back, this one's on a board pointing ahead (`signpost()` in `src/career/build.ts`);
  the connector lasts at least 3 s so both can be read. Proposed to Dylan, awaiting his answer: maps for changes
  of continent only (Asia: Dubbo → Ubud; France: Malacca → Bouguenais; routes needed from him), signposts for
  moves within a country, the plain line for remote work.
- Not mine, found staged in git: the Merredin chapter / caption rewording in `src/data/career.ts`; its French
  "J’atteris en l’Australie" should read "J’atterris en Australie" (flagged to Dylan, not changed).

## Notes

- Foldkit skill folders the user added to the workspace are not part of this app and are not committed.
- Handoffs in `.agents/handoffs/` are committed; latest: `.agents/handoffs/2026-10-04-0135-feedback-batches-and-workspace-setup.md`; saved scripts: `.agents/scripts/INDEX.md`.
- Deferred and offered work moved to `documentation/backlog.md` (2026-10-04).
- Next step: Dylan's review of the flight and the weed, then of batches 2 to 5 and the card restyle.
