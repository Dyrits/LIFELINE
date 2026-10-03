# Handoff: Lifeline, feedback batches done, workspace set up

Supersedes: `.agents/handoffs/2026-10-03-2010-scriptbook-for-visual-review.md`.

## Where things stand

All work from the 2026-10-04 session is committed locally on `main` (see `git log`). **It is not pushed**:
the git guardrail blocks `git push` for agents, so Dylan pushes himself. If the next session starts with
"commit and push", check `git status` and `git log origin/main..main`, commit what's left, and ask Dylan to
push.

Read these first; they are the sources of truth, not this file:

- `documentation/work-in-progress.md`: every batch since batch 1, its agreed behaviour and evidence. All of
  them are **implemented and checked, not yet accepted by Dylan**.
- `documentation/backlog.md`: deferred work and offers awaiting Dylan's answer.
- `CHANGELOG.md`: four Agreements; no Delivery yet (none accepted).
- `GUIDELINES.md`: review rules (unbroken line, story built ahead, bilingual data, first-person captions,
  screenshot checks).
- `AGENTS.md`: scriptbooks, fish shell gotcha, agent-skill configuration (`documentation/agents/`).

## Next steps

1. **Skeleton weed, second pass** (in progress, interrupted). `skeletonWeed` in `src/career/motifs.ts`
   replaced the furrows at Dylan's request ("just do a plant like a Chondrilla juncea"). First version is in:
   flower heads read as squiggles at screen scale, the two rosette leaves read as a flat boat. Planned, not
   applied: flower heads about twice as big (disc r≈7, rays 11→21), leaf tips angled up (≈(58,-82) and
   (246,-78)) with deeper backward lobes, drop the crowded fifth head. Check with screenshots of stop 2
   (Merredin) mid-draw and finished.
2. Ask Dylan to review batches 2 to 5 and the later requests together, then record Deliveries in
   `CHANGELOG.md` for what he accepts and prune `documentation/work-in-progress.md`.
3. Open questions for Dylan (also in the backlog): touch scrubbing; V3 fonts; "running in parallel" on cards;
   Transmission card opening later; "30 millions" in the Accenture bullet; reuse the globe `flight` for the
   Asia and return chapters.

## Pending outside the code

- Skills retrospective: the approved issue for `Dyrits/SKILLS` could not be opened (no GitHub credential or
  MCP on this machine). It is saved at `.agents/feedbacks/2026-10-04-long-iterate-sessions-skip-skills.md`.
  Once `gh` is logged in or a GitHub MCP exists, Dylan runs `/improve-skills`, which offers to open it and
  deletes the record.
- Compaction gate: `.claude/hooks/precompact-handoff-gate.sh` blocks compaction until a handoff under 5 min
  old exists. `hand-off` is user-only, so the gate tells the agent to read
  `~/.claude/skills/hand-off/SKILL.md` and follow it (a local workaround, reported in the feedback record).

## Verification

`npm run check` (54 Vitest tests), `npm run e2e` (7 Playwright tests, port 5179). Visual checks:
`.agents/scripts/INDEX.md` (`print-career-stops.mjs`, `measure-card-positions.mjs`) and
`~/.agents/scripts/INDEX.md` (screenshots, contact sheets). The pre-commit hook runs Biome on staged files,
then `npm run build`.

## Suggested skills

Model-invoked (call through the Skill tool):

- `memorize`: before writing any probe or pipeline (check both scriptbooks), and after a repeated rebuild or
  a correction.
- `debug`: for any bug Dylan reports, before editing.
- `test-first`: when adding tests.
- `unslop`: before showing captions, card text or a final report.
- `document`: before touching backlog, working state or changelog.
- `webapp-testing`, `frontend-design`: browser checks; look of cards and shapes.

User-only (recommend to Dylan, don't call):

- `/iterate` to continue the feedback workflow, `/take-over` to resume from this file,
  `/improve-skills` to publish the pending feedback record, `/hand-off` at the next phase boundary.
