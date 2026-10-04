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

## CHG-0005 · 2026-10-04 · Guidelines split into requirements, a decision record and agent notes

Type: Documentation
Event: Agreement
Scope: Project documents

Summary: `GUIDELINES.md` keeps only the portable rule "no user-facing string literals in rendering code". The unbroken line, the French and English pair, French typography and the caption voice move to `documentation/requirements.md`; building stories ahead without the DOM becomes ADR 0001; screenshot verification and confirming caption facts move to `AGENTS.md`. CHG-0002's pointer to `GUIDELINES.md` (Content) now resolves to `documentation/requirements.md` (Content).
References: `GUIDELINES.md`, `documentation/requirements.md`, `documentation/architecture-decision-record/0001-stories-built-ahead-without-the-dom.md`, `AGENTS.md`.
Validation: Audit of `GUIDELINES.md` shared by Dylan, 2026-10-04.

## CHG-0006 · 2026-10-04 · Flight to Australia over a world map

Type: Code
Event: Delivery
Scope: Career drawing

Summary: The line reaches Merredin by flying Dylan's route (Geneva, Moscow, Bangkok, Kuala Lumpur, Singapore, Jakarta, Perth) over a map printed on the page, a dot and a name at each place, the pen tip a plane. Replaces the globe.
References: `route` in `src/data/career.ts`, `flight()` in `src/career/motifs.ts`, `Print` / `Label` / `Plane` in `src/engine/story.ts`, `src/career/world.ts` (Natural Earth 110m land, public domain).
Validation: `npm run check` (54 tests), `npm run e2e` (7 tests); accepted by Dylan ("The map looks awesome"), 2026-10-04.
