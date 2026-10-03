# Agent notes

- Scripts: before writing a script or multi-step pipeline, read `.agents/scripts/INDEX.md` and `~/.agents/scripts/INDEX.md`; reuse or extend a match.
- Shell: the default shell is fish. Wrap bash syntax (`for … do`, `set --`, `$(…)` loops) in `bash -c '…'`.
- Handoffs: `.agents/handoffs/`.
- Look at what changed: check a change to a shape, a card, a caption or the layout with screenshots of the affected stops (`.agents/scripts/INDEX.md`) before handing it to Dylan for review, and report what they showed, including what still looks wrong. Tests can't judge appearance; layout collisions were caught this way, not by tests.
- Caption facts: any fact a caption states beyond the card's content needs Dylan's confirmation before it ships. Facts the agent inferred have been wrong before.
- Reproducing a bug in uncommitted work: `git stash` returns to the last commit, which may predate the bug; re-apply the suspect code instead.

## Agent skills

### Task tracker

Local Markdown: backlog in `documentation/backlog.md`, task bodies under `documentation/capabilities/<capability>/tasks/`; nothing is published remotely. See `documentation/agents/issue-tracker.md`.

### Triage roles

Default strings: `bug`, `enhancement`; `to-evaluate`, `on-hold`, `ready`, `not-planned`. See `documentation/agents/triage-roles.md`.

### Domain documentation

Single context: root `GLOSSARY.md` and `documentation/architecture-decision-record/`, created when first needed. See `documentation/agents/domain.md`.

### Project documents

Call the Skill tool with "document" before creating or updating project documents, to apply the shared authority, requirements, publication, resumption, and changelog rules.
