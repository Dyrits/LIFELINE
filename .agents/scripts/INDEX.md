# Project scriptbook

- `measure-card-positions.mjs`: prints each Career card's left edge on screen (and whether it is open) at a moment of its stop, for one or more viewport sizes, to find cards that leave the screen or drift. Usage: `node .agents/scripts/measure-card-positions.mjs [--base URL] [--at start|end] [--offset S] [--sizes WxH,...] [--lang fr|en] [--stops 0,6]`. Needs: node, dev server running, Playwright Chromium.
- `print-career-stops.mjs`: prints each Career stop's start/end time and tag, or with `--urls BASE` one page URL per stop for screenshots. Usage: `node .agents/scripts/print-career-stops.mjs [--urls BASE] [--lang fr|en] [--offset S] [--end]`. Needs: node, project dependencies (vite).
