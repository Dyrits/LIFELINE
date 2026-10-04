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

## CHG-0007 · 2026-10-04 · Code conventions written into the guidelines

Type: Documentation
Event: Agreement
Scope: Project documents

Summary: `GUIDELINES.md` gains code conventions from a topic-by-topic interview: naming (whole words, nesting by shared word, PascalCase options), size, types, control flow, side effects, errors, comments, tests and dependencies. Existing code that predates them is not yet brought in line.
References: `GUIDELINES.md`.
Validation: Each rule confirmed by Dylan during the interview, 2026-10-04.

## CHG-0008 · 2026-10-04 · Biome sorts keys, properties and attributes; explicit any is an error

Type: Configuration
Event: Agreement
Scope: Tooling

Summary: `noExplicitAny` is raised from a warning to an error, and every applicable Biome sorting action is on (imports, object keys, CSS properties, HTML attributes, type fields, interface and enum members, `package.json`). The existing code is not yet sorted, so `npm run check` fails until `biome check --write` is applied.
References: `biome.json`.
Validation: Requested by Dylan ("Avoid as any"; "most of the sorting options it has should be on"), 2026-10-04.

## CHG-0009 · 2026-10-04 · Existing code sorted by Biome

Type: Configuration
Event: Delivery
Scope: Tooling

Summary: `biome check --write .` applied the sorting agreed in CHG-0008 across 15 files. `useSortedKeys` is off for `package.json` only: it fought `useSortedPackageJson` over the same keys and looped forever.
References: CHG-0008; `biome.json` (`overrides`).
Validation: `npm run check` (tsc, Biome, 58 Vitest tests) and `npm run e2e` (7 Playwright tests) pass. Screenshots of the intro and the 21 Career stops before and after match by eye. No CSS shorthand moved after its longhand; the two swapped pairs (`#again` `border`/`border-radius`, `.card .body` `transform`/`transform-origin`) don't override each other.

## CHG-0010 · 2026-10-04 · Code cleanup decisions; language codes exempt from PascalCase

Type: Code
Event: Agreement
Scope: Code conventions

Summary: For the cleanup that brings the code in line with `GUIDELINES.md`: language codes (`'fr'`, `'en'`) keep their lowercase form, an exemption now written under "Options are PascalCase". `Story`'s collections and the renderer's draw methods are nested. The unused heartbeat cue, `UI.close` and `PROFILE` are deleted. Pens are named by a typed `THREAD` map.
References: `GUIDELINES.md` (Naming); `documentation/work-in-progress.md` (Code cleanup).
Validation: Chosen by Dylan during the review, 2026-10-04.

## CHG-0011 · 2026-10-04 · Code brought in line with the guidelines

Type: Code
Event: Delivery
Scope: Code conventions

Summary: The whole codebase was reviewed against `GUIDELINES.md` and the agreed behaviour, then refactored, as decided in CHG-0010: whole-word and nested names, PascalCase options, `buildCareer` split into its steps, new modules for flight geometry, interface strings, language, months, pigments and canvas helpers, doc comments, and one behaviour per test. Behaviour is unchanged.
References: CHG-0010; `documentation/work-in-progress.md` (Code cleanup, with the open findings).
Validation: The built story serialises identically before and after. `npm run check` (108 Vitest tests) and `npm run e2e` (13 Playwright tests) pass. Screenshots of every stop match by eye. Both reviewers verified the result.
