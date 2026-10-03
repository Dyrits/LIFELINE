# Changelog

## CHG-0001 · 2026-10-03 · Foldkit declined for the drawing app

Type: Code
Event: Agreement
Scope: Technical approach

Summary: Lifeline stays Vite and strict TypeScript without a UI framework; Foldkit was compared and declined.
Reason: The ink engine needs canvas drawImage, multiply blending and patterns, which Foldkit's canvas view lacks; it would only have managed the small UI around the canvas.
References: `documentation/work-in-progress.md` (approved approach).
Validation: Declined by Dylan after a pros and cons comparison, 2026-10-03.

## CHG-0002 · 2026-10-04 · Career captions told in the first person

Type: Documentation
Event: Agreement
Scope: Career story

Summary: Every Career stop carries a caption in Dylan's voice: first person, present tense, plain words with one image each; chapter lines open Australia, Asia and the return to France. Facts beyond the card's content are confirmed by Dylan.
References: `src/data/career.ts` (`caption`, `chapter`); `GUIDELINES.md` (Content).
Validation: "Let's try first person" and the chapter lines approved by Dylan, 2026-10-04; the four inferred facts confirmed the same day.

## CHG-0003 · 2026-10-04 · Local Markdown task tracker

Type: Configuration
Event: Agreement
Scope: Project tracking

Summary: Tasks and backlog live in the repository: `documentation/backlog.md` and task bodies under `documentation/capabilities/<capability>/tasks/`, in the built-in taskify format, with the default triage roles. Nothing is published remotely.
References: `documentation/agents/issue-tracker.md`, `documentation/agents/triage-roles.md`.
Validation: Chosen by Dylan during workspace setup, 2026-10-04, over GitHub Issues.

## CHG-0004 · 2026-10-04 · Biome for all formatting, no Prettier

Type: Configuration
Event: Agreement
Scope: Tooling

Summary: The pre-commit hook runs Biome on staged files, with its HTML formatter enabled, then the build; Prettier is not used and Markdown is left unformatted (oxfmt is the candidate if that changes).
References: `.githooks/pre-commit`, `.lintstagedrc`, `biome.json`; commit eea5ff7.
Validation: Requested by Dylan ("I'd like to switch to Biome or oxc if possible"), 2026-10-04.
