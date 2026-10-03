# Agent notes

- Scripts: before writing a script or multi-step pipeline, read `.agents/scripts/INDEX.md` and `~/.agents/scripts/INDEX.md`; reuse or extend a match.
- Shell: the default shell is fish. Wrap bash syntax (`for … do`, `set --`, `$(…)` loops) in `bash -c '…'`.
- Handoffs: `.agents/handoffs/`.
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
