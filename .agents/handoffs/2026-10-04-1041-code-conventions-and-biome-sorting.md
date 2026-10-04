# Handoff: Lifeline, code conventions and Biome sorting

Supersedes: `.agents/handoffs/2026-10-04-0156-guidelines-split.md` for guidelines work only. The career work in `.agents/handoffs/2026-10-04-1027-shape-rework-and-travel-visuals.md` is unaffected.

## What this session did

- Interviewed Dylan topic by topic (`model-domain`, code focus) and wrote the agreed conventions into `GUIDELINES.md`. CHG-0007 records it. The interview is complete; every topic was asked once.
- `biome.json`: `noExplicitAny` raised to an error, and every applicable sorting action turned on. CHG-0008 records it.

Read `GUIDELINES.md` before writing code: it is short and every rule carries its reason.

## Next steps

1. **Apply the Biome sorting.** `npm run check` and the pre-commit hook fail until it is applied: about 170 places in 15 files (110 object keys, 43 CSS properties in `src/style.css`, 16 HTML attributes in `index.html`, `package.json`). Run `npx biome check --write .` as its own commit.
   - The only code that depends on key order is `SHAPE_KEYS` in `src/career/motifs.ts`, which only sets the order of the motif tests.
   - Reordering CSS properties can change the look. Take screenshots of the stops before and after (`print-career-stops.mjs --urls` in `.agents/scripts/INDEX.md`) and report what they show, per `AGENTS.md`.
   - Then run `npm run check` and `npm run e2e`.
2. **Ask Dylan whether the cleanup goes in the backlog** (`documentation/backlog.md`, local tracker). He has not answered yet. The cleanup brings existing code in line with `GUIDELINES.md`:
   - rename single-letter and abbreviated locals (`th`, `pts`, `dur`, `vel`, `ctx`, `i`, `t`; about 150, mostly `motifs.ts`, `build.ts`, `story.ts`), and nest names that share a word;
   - make string options PascalCase (`MotifKey` in `src/data/types.ts`, `Cue` `kind` in `src/engine/story.ts`);
   - rewrap comments that break mid-sentence (for example in `src/career/cards.ts`);
   - turn the `switch` in `src/engine/audio.ts` (`play`) into a handler object keyed by `kind`.

## Working with Dylan

- He asks for re-explanations in French with `/re-explain`; rules are written in English.
- He confirms a rule, then expects its wording improved rather than his words copied, and does not want his own examples quoted back in the file.
- A guideline needs his reason. When he leaves the reason to you ("as you see fit"), draft one and say so.

## Suggested skills

- `model-domain` (model-invoked): any further change to `GUIDELINES.md`, `GLOSSARY.md` or an ADR.
- `document` (model-invoked): before touching `CHANGELOG.md`, the backlog or work-in-progress.
- `write-for-agents` (model-invoked): when polishing `GUIDELINES.md` or `AGENTS.md`.
- `webapp-testing` (model-invoked): screenshots for the CSS sorting check.
- `review-and-refactor` (model-invoked): for the cleanup batch, if Dylan schedules it.
