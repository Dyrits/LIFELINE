# Handoff: Lifeline, guidelines split into their owners

Supersedes: `.agents/handoffs/2026-10-04-0135-feedback-batches-and-workspace-setup.md`. Its next steps
still apply; they are carried over below.

## What this session did

An audit found `GUIDELINES.md` held product rules, not code conventions. Each rule moved to its owner
(`model-domain` routing table); CHG-0005 in `CHANGELOG.md` records where everything went:

- `GUIDELINES.md`: only "no user-facing string literals in rendering code".
- `documentation/requirements.md` (new): unbroken line, French/English pair, French typography, caption voice.
- `documentation/architecture-decision-record/0001-stories-built-ahead-without-the-dom.md` (new, first ADR).
- `AGENTS.md`: screenshot verification and confirming caption facts with Dylan.

Read those files, plus `documentation/work-in-progress.md` and `documentation/backlog.md`, before working.

## Next steps

1. **Skeleton weed, second pass** (`skeletonWeed`, `src/career/motifs.ts`). The leaf tips at (58,-82) and
   (246,-78) are in the code; check whether the larger flower heads (disc r≈7, rays 11→21) and dropping
   the fifth head also landed, then screenshot stop 2 (Merredin) mid-draw and finished.
2. Ask Dylan to review batches 2 to 5 and the later requests together; record Deliveries in `CHANGELOG.md`
   for what he accepts and prune `documentation/work-in-progress.md`.
3. Open questions for Dylan (also in the backlog): touch scrubbing; V3 fonts; "running in parallel" on
   cards; Transmission card opening later; "30 millions" in the Accenture bullet; reusing the globe
   `flight` for the Asia and return chapters.

## Verification

`npm run check` (Vitest), `npm run e2e` (Playwright, port 5179). Visual checks through
`.agents/scripts/INDEX.md` and `~/.agents/scripts/INDEX.md`. The pre-commit hook runs Biome on staged
files, then `npm run build`. The git guardrail blocks `git push` for agents; Dylan pushes.

## Suggested skills

Model-invoked (Skill tool):

- `document`: before touching requirements, backlog, working state or the changelog.
- `model-domain`: for a new ADR, a glossary term, or a new guideline (portable rules only).
- `memorize`: before writing any probe or pipeline (check both scriptbooks).
- `debug`: for any bug Dylan reports, before editing.
- `test-first`: when adding tests.
- `unslop`: before showing captions, card text or a final report.
- `webapp-testing`, `frontend-design`: browser checks; look of cards and shapes.

User-only (recommend to Dylan, don't call): `/hand-off` at the next phase boundary.
