# Handoff: Lifeline, shape rework and travel visuals

Supersedes: `.agents/handoffs/2026-10-04-0156-guidelines-split.md`. Its skeleton-weed step is done; its review and
open-question steps are carried over below.

## What this session did

Dylan steered by `/iterate` requests, one shape or visual at a time. Everything is recorded in
`documentation/work-in-progress.md` ("Small requests, 2026-10-04"), with the accepted map in `CHANGELOG.md` CHG-0006.
In short:

- **Flight to Australia**: an orbit around a globe, then a turning square with a globe (both rejected), then a
  world map (accepted, CHG-0006). The line flies Dylan's route (Geneva, Moscow, Bangkok, Kuala Lumpur,
  Singapore, Jakarta, Perth: his facts, given in chat) over Natural Earth land (`src/career/world.ts`, made by
  `.agents/scripts/generate-world-land.mjs`). Engine additions: `Print`, `Label`, `Plane` in `src/engine/story.ts`.
  The turning-square engine code was removed.
- **Shapes redrawn**: skeleton weed (Merredin), bar kitchen (`pan`, Perth), farm (`pickets`, Dubbo), ambulance
  (`ambulance`, formerly `routeCross`, Kuala Lumpur), Ubud now `candiBentar` + `browserGallery` with furniture.
  Shapes can carry `spots` (small coloured washes); `washes()` in `src/career/build.ts` lays them.
- **Travel visuals**: map pins replace the travel loops for `remoteFrom` places (Dylan's pick); a `signpost` on the
  Perth → Dubbo connector; a backpack (`way: 'backpack'`) drawn on the connector into the Asia chapter (Dylan's pick).
- **Engine fix**: `Story.add` lays a point at least every 4 units (`MAX_STEP`); fast detail pens were cutting small
  details into spikes.
- **Test change**: the overview e2e test jumps to `t=400` (the career grew to ~302 s, past the old `t=300`).

## Unverified or assumed

- Only the map is accepted. The weed, kitchen, farm, pins, signpost, ambulance, backpack and Ubud shapes are
  "implemented and checked, awaiting Dylan's review"; screenshots were judged by the agent only.
- `GUIDELINES.md` (naming, size, types) and `biome.json` (`noExplicitAny`) changed during the session, not by the
  agent; left out of the commit. The new naming rule (whole-word names) is not yet applied to this session's code,
  which follows the older short-name style of the file (`sh`, `d`, `th`).
- The Merredin chapter / caption rewording in `src/data/career.ts` was staged by someone else and is committed
  with this work; its French "J’atteris en l’Australie" should read "J’atterris en Australie" (asked, unanswered).

## Next steps

1. Ask Dylan to review the shapes listed above together; record Deliveries in `CHANGELOG.md` for what he accepts and
   prune `documentation/work-in-progress.md`.
2. Open questions for Dylan:
   - Maps only for changes of continent (Asia: Dubbo → Ubud is now the backpack, so likely only France: Malacca →
     Bouguenais), signposts for moves within a country, the plain line for remote work. Agreed?
   - His route for the return to France map; which other moves get a signpost (Merredin → Perth is the obvious one).
   - The "J’atteris" typo; whether `GUIDELINES.md` naming should be applied to existing code.
   - Older ones in `documentation/backlog.md` (touch scrubbing, V3 fonts, parallel jobs list, Transmission card).
3. Visual nits seen and not fixed: the plane briefly covers a city name; "Singapour" touches the line; the farm's
   sheep are small; wheel hubs wobble into teardrops.

## Verification

`npm run check` (58 Vitest tests), `npm run e2e` (7 Playwright tests, port 5179), both passing at handoff. Screenshots
through `~/.agents/scripts/capture-page-screenshots.mjs` and `tile-images.sh`; stop times from
`.agents/scripts/print-career-stops.mjs`. Close-ups: `--scale 2` then an ffmpeg crop. The page keeps playing after
load, so a screenshot lands about the `--wait` time after the requested `t`.

## Suggested skills

Model-invoked (Skill tool): `document` (before touching project documents), `memorize` (before any probe or
pipeline; check both scriptbooks), `debug` (any reported bug, before editing), `test-first` (when adding tests),
`unslop` (before showing captions or a final report), `webapp-testing` and `frontend-design` (browser checks, look
of shapes), `model-domain` (new ADR, glossary term or guideline).

User-only (recommend, don't call): `/iterate` for the next request, `/hand-off` at the next phase boundary.
