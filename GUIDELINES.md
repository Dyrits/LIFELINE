# Guidelines

## Drawing

- **The line never breaks**: a shape's outline is one unbroken stroke drawn by the ink line, from where it touches the line to where the line carries on; every lifted stroke goes to the detail pen. The site's premise is a life drawn in a single line, and a pen-up on it reads as a break in the story. Threads other than the line (gold training thread, apprentice threads, detail pens) may lift.
- **A story is built ahead, without the DOM**: a path is computed in full as timed ink before it plays, and building touches no DOM. Seeking, scrubbing backwards, the overview and the tests all depend on rendering any moment from that data; state that only exists while playing forward breaks them.

## Content

- **Visible text lives in data, in French and English**: every string a visitor reads is a `Text` with both languages, in `src/data/` or `src/i18n.ts`, never written inline in rendering code. French uses typographic apostrophes (’) and a non-breaking space before `:`, `;`, `?`, `!`. Both languages must stay in step, and the French is the source.
- **Captions speak as Dylan**: first person, present tense, plain words with one image each. Any fact a caption states beyond the card's content must be confirmed by Dylan before it ships. The voice was agreed; facts the agent inferred have been wrong before.

## Verification

- **Look at what changed**: a change to a shape, a card, a caption or the layout is checked by screenshots of the affected stops (see `.agents/scripts/INDEX.md`) before it goes to Dylan for review. Tests can't judge appearance, and layout collisions were caught this way, not by tests. Report what the screenshots showed, including what still looks wrong.
