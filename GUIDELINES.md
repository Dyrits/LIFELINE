# Guidelines

## Naming

- **Name things with whole words that say what they hold** (`thread`, `points`, `duration`, `context`), so a reader understands a name without tracing where it came from. A loop counter is `index` or `iteration`, a time is `time`. Coordinates keep `x` and `y`, which are already their names.
- **One word per level; nest to add precision**: when two or more names share a word, that word becomes an object or module holding the rest, so the shared context is written once and every name stays one word. `widthMin` and `widthMax` become `width.min` and `width.max`; `parseDate` and `formatDate` become `date.parse` and `date.format`. A compound with no siblings stays flat (`parseDate` alone), since a group of one adds a level without adding precision.
- **Options are PascalCase**: members of a string-literal union and of an `enum` read as names from a fixed set (`'SkeletonWeed'`, `'Chord'`), which sets them apart from free-form strings. Discriminants such as `kind` count as options.

## Size

- **Split by concern, not by length**: a file or function that handles two concerns becomes two, so each can be read and changed on its own. A long file of independent pieces sharing one concern, such as one function per motif, stays whole.

## Types

- **`type` for shapes, `interface` for contracts**: an `interface` declares a contract that other code implements or extends, so reaching for one signals that extension is expected. Data shapes, unions, tuples and `Readonly<…>` wrappers are a `type`.
- **Types are read-only by default**: mark fields and arrays `readonly`, so a mutable field signals state that deliberately changes in place, such as a pen's position as it draws.

## Control flow

- **Map cases to values with an object keyed by case**: `Record<Kind, …>` or a mapped type over a union's `kind`, holding values or handlers, rather than a `switch`. Adding a case becomes adding an entry, and the type checker reports any case left out. Keep a `switch` or `if` chain when the branches differ in control flow (an early return, a `break` out of a loop) rather than in what they produce.

## Side effects

- **Computing code takes every input as an argument**: the date, random seeds and sizes arrive as parameters, so the same arguments always give the same result and tests run without a browser. Only a thin outer layer touches the DOM, the clock, storage and audio. [ADR 0001](documentation/architecture-decision-record/0001-stories-built-ahead-without-the-dom.md) applies this to stories.

## Errors

- **Throw on a broken assumption**: a missing element, an unknown key or an unavailable canvas is a programming or setup error, so it fails loudly at the point it is found.
- **Fall back quietly where the browser may refuse**: storage, audio and other APIs a visitor's browser can block get a `try`/`catch` with a sensible default, since the visitor can do nothing about the failure. Those are the only places `try`/`catch` appears.

## Comments

- **Comments explain why**: a comment states the reason behind the code or an effect the code cannot show on its own, since the code already says what it does.
- **Every exported symbol has a one-line doc comment**: a `/** … */` saying what it is or returns, so the editor shows it on hover.
- **Comments are written as prose**: full sentences with capitals and punctuation, and a line ends only where a sentence ends, so a comment reads as one thought rather than text wrapped at an arbitrary width.

## Tests

- **A test reads as a specification**: alongside the changelog, the tests record how things should work, so a person without a technical background can read them. Name each test after the behaviour it protects, in the product's words, so a failure says what broke.
- **One behaviour per test**, with as many assertions as that behaviour needs.
- **Mocks start with `$`**: a test double that stands in for a dependency (a fake, stub or spy) is named `$` plus what it replaces (`$storage`, `$clock`), so the sigil marks it as a mock and the name carries no `mock` word. Datasets and fixtures are real inputs, not mocks, and take ordinary names.

## Dependencies

- **A runtime library earns its place**: add one only when building the feature ourselves would cost far more than learning, updating and shipping the library to every visitor, and state that reason in the change that adds it. Development tools are judged more loosely, since visitors never download them.

## Content

- **Rendering code reads every user-facing string from data**: each string a visitor reads is a `Text` in `src/data/` or `src/i18n.ts`, so it is translated and reviewed in one place. Strings a visitor never reads (class names, log messages, test labels) stay inline. The language and typography rules live in `documentation/requirements.md`.
