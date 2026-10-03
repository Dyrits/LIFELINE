# Long iterate sessions skip memorize, document, debug and unslop; three setup-skill defects

## Context

- Harness: Claude Code 2.1.288, non-interactive session with a long context.
- Model: Claude Opus 5.5.
- Skills: installed from `Dyrits/SKILLS` on 2026-10-03. Folder hashes: iterate `df5c550e8a`, memorize `29326ecedd`, take-over `ff9248e96e`, hand-off `b0bd95baab`, unslop `86825db0ff`, model-domain `94901b3a1f`, setup-auto-handoff `1090da62b3`, setup-git-hooks `1d420b1dd1`.
- Project: a small personal static website (Vite, strict TypeScript, canvas animation) with one developer, built over about ten rounds of visual feedback.

## Expected and actual outcome

The user expected each round of feedback to become a verified change ready for review, with the project documents kept as the workflow describes.

The agent implemented and checked every request, and the user confirmed the result. One bug needed a second fix because the first diagnosis was wrong, and one drawing is still a rough first version. The project documents fell short. The project had no changelog, had no backlog until a later setup created one, and the agent saved reusable knowledge only after the user asked.

## Skills involved

| Skill | How reached | Behaved as intended? | Evidence |
| --- | --- | --- | --- |
| take-over | User | Mostly | It confirmed the brief and put the user's arguments ahead of the handoff. The handoff named two skills that no longer exist (`scriptbook`, `grilling`), so the agent had to guess their successors. |
| iterate | User, six times | Partly | It kept "implemented and checked" apart from "accepted by the user" and updated the working state after each batch. It never called `document`, never created the backlog or the changelog, and never sent a reported bug to `debug`. |
| memorize | User, after a reminder | Late | The agent rewrote a Playwright probe twice and hit the same shell error twice before saving anything. It skipped the scriptbook lookup before writing new probes. |
| debug | Never | No | For a bug the user reported, the agent fixed the wrong cause first and wrote a test that passed on the buggy code. It found the real cause only by probing afterwards. |
| test-first | Never | No | The agent added browser tests without it. The bug fix did go red then green, without the skill. |
| unslop | Never, until this retrospective | No | The skill says "Must always apply", but the agent never applied it to captions, chapter lines or reports. |
| model-domain (GUIDELINES interview) | setup-ai-workspace | Partly | The agent asked one multi-select question of drafted rules and wrote the reasons itself. The format asks for one question at a time and for the reason behind each rule. |
| setup-ai-workspace | User | Yes | It explored first, asked one decision at a time and showed the files before writing them. |
| setup-ai-tooling | setup-ai-workspace | Yes | It reused working integrations, checked each against the project and wrote the record. |
| setup-git-hooks | setup-ai-workspace | Partly | It installed Prettier although Biome covered the project, and the user wanted Biome or oxc only. Its commit step ignored unrelated uncommitted work on the default branch. |
| setup-git-guardrails | setup-ai-workspace | Yes | The hook blocked a live `git push --dry-run`. |
| setup-auto-handoff | setup-ai-workspace | No | The gate tells the agent to call the skill `"handoff"`. The skill is named `hand-off` and only the user can invoke it. |

## What went right

Keep these when fixing the rest:

- take-over confirmed the brief before starting and treated the user's arguments as the session's focus.
- iterate kept "implemented and checked" apart from "accepted by the user", and the agent updated the working state after each batch.
- The agent checked every visual change with screenshots before reporting it. This caught several layout collisions that the tests missed.
- The bug fix went red, then green.
- The setup skills asked one decision at a time and showed their files before writing them.

## What went wrong

### 1. memorize does not fire during long workflow runs

**Evidence.** The agent wrote a browser probe script twice and hit a shell syntax error twice (the default shell was fish). It saved both only after the user wrote "Don't forget /memorize when relevant". It never looked in the scriptbook before writing a new probe.

**Confirmed.** The skill was available and its triggers matched: "after a correction or a repeated rebuild" and "before writing any script".

**Hypothesis.** A trigger that lives only in the skill description doesn't fire during a long task, as memorize's own "Pointers" section warns. The project had no pointer to the scriptbook in its always-loaded instructions.

**Proposed correction.** The user wants the fix in memorize, not in the workflow skills. Sharpen its description around the two moments: something *rebuilt twice*, or the user *corrected* a behavior. Have `setup-ai-workspace` write the scriptbook pointer into `AGENTS.md` or `CLAUDE.md`, as memorize's "Pointers" section asks.

### 2. iterate skips the `document` call and the changelog

**Evidence.** iterate says to call `document`, and that it "runs on `documentation/backlog.md`, `documentation/work-in-progress.md`, and the root `CHANGELOG.md`". In six runs the agent never called `document`. Deferred work stayed in the working-state file, and the agent recorded no Agreement for three consequential decisions: the narrative voice, the tracker and the formatter. At the end the user asked: "should I not have a CHANGELOG.md?"

**Hypothesis.** The instruction sits in the preamble, outside any numbered step with a completion criterion, so the agent treats it as background.

**Proposed correction.** Move the `document` call into step 1 with a checkable criterion: the backlog, working state and changelog exist, or the user confirmed they aren't needed. Make step 3 complete only when each consequential choice has an Agreement record.

### 3. iterate does not send a reported bug to `debug`

**Evidence.** The user reported a visual bug. The agent edited code on a guessed cause, wrote a test that passed on the buggy code, and compared against the wrong baseline. It found the real cause only by probing afterwards.

**Hypothesis.** iterate sends work to `debug` only for "a resistant failure", which reads as a failing check rather than a user's bug report. The agent never reached `debug`, even though its description covers a user who "reports something broken".

**Proposed correction.** In step 4, send any bug the user reports to `debug` before editing, and to `test-first` when the work adds tests.

### 4. unslop says "Must always apply" but names no moment

**Evidence.** The agent never called the skill for user-facing copy (captions, chapter lines) or for its reports during the session.

**Hypothesis.** "Always" gives no point in the work at which to apply it, so no step triggers it.

**Proposed correction.** Name the moments in the description: before showing user-facing copy, and before a final report.

### 5. The GUIDELINES interview drifts from its format

**Evidence.** `GUIDELINES-FORMAT.md` asks for one question at a time and says "for each rule, ask why it exists". The agent offered one multi-select question of drafted rules, with its own reasons attached.

**Hypothesis.** Drafting rules saves time, and the format doesn't say whether drafts are allowed, so the agent chose speed.

**Proposed correction.** Allow drafted candidate rules, but have the user confirm or give the reason for each one.

### 6. setup-auto-handoff's gate names a skill the agent cannot call

**Evidence.** The bundled `precompact-handoff-gate.sh` says `Call the Skill tool with "handoff"`. The skill is named `hand-off` and declares `disable-model-invocation: true`. At compaction the gate would block the agent with an instruction it cannot carry out.

**Workaround used.** The project's copy of the gate now tells the agent to read the hand-off skill's instructions and follow them.

**Proposed correction.** Fix the name, then either make `hand-off` invocable by the model or have the gate point to its instructions file.

### 7. setup-git-hooks imposes Prettier and commits regardless of other work

**Evidence.** The skill installs Prettier in every case. Here Biome 2.x already covered JS, TS, JSON and CSS, and formats HTML once its HTML formatter is enabled, so only Markdown was left; the user wanted no Prettier. The final step stages "all changed/created files" and commits, while the working tree held several unreviewed batches on the default branch.

**Proposed correction.** Check which languages Biome (or oxfmt) covers and offer Prettier as an option for the rest. In the commit step, stage only the hook files, and ask before committing on the default branch when unrelated changes are present.

### 8. hand-off can name skills that no longer exist

**Evidence.** An earlier handoff suggested `scriptbook` and `grilling`. At take-over neither was installed under that name.

**Proposed correction.** hand-off checks each suggested skill against the installed list and notes next to each whether the model or only the user can invoke it.
