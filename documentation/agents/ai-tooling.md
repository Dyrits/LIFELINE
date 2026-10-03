# AI tooling

Project: Lifeline (this repository). Set up 2026-10-04 with `setup-ai-tooling`, project scope only; no global
change was made. Client: Claude Code 2.1.288 (the only client in use).

## Tools

| Tool | Version | Scope | State in Claude Code |
| --- | --- | --- | --- |
| CodeGraph | 1.6.1 | Binary and MCP server already global; project index created here (`.codegraph/`, ignored by its own `.gitignore`) | MCP `codegraph` connected; `codegraph_explore` verified on this project |
| Context7 | MCP over HTTP (`https://mcp.context7.com/mcp`), free tier | Already connected, reused | Verified with a Vite 8.0.10 lookup (`/vitejs/vite/v8.0.10`) |
| ast-grep | 0.45.3 | Already global | Verified: `ast-grep run --lang ts -p "story.add('A', \$\$\$ARGS)" src/career/build.ts` finds the 8 calls; the same pattern with an unused thread name finds none. `sg` is deprecated: use `ast-grep` |
| Playwright | `@playwright/test` (project dependency) | Project | Used through `npm run e2e` and the scriptbooks; no browser MCP added |

Not installed, by choice: RTK (output rewriting, which would need diff and test-output protection this small solo
project doesn't need), Serena (CodeGraph already covers navigation), Chrome DevTools MCP (no diagnosis task yet).
`gh` / `glab` are absent; the tracker is local Markdown, so none is needed.

Known gap: a second Context7 server (`mcp-server-context7`) appears in the tool list besides `context7`; both work.
Left as found; remove one in the client configuration if the duplicate tool definitions are unwanted.

## Upkeep

- After large edits, refresh the index: `codegraph sync` (an existing index is kept; `codegraph init` only when
  `.codegraph/` is missing). Check with `codegraph status`.
- When CodeGraph's answer looks stale or a file isn't indexed, read the source.

## Baseline (2026-10-04)

Measured with deterministic commands, no model calls:

| Task | Correctness criterion | Duration | Output |
| --- | --- | --- | --- |
| `codegraph explore monthAt` | Shows `export function monthAt` at `src/career/build.ts:233`, as in the file | 356 ms | 13,579 bytes |
| ast-grep, `story.add('A', …)` in `build.ts` | 8 matches, as `grep` confirms | 11 ms | 1,184 bytes |

Index at setup: 21 files, 374 nodes, 1,250 edges (`codegraph status`). Token savings: unknown; no comparable
task baseline exists.

Measurement sources: `codegraph status` (index counts); Claude Code session transcripts, one JSONL file per
session under the client's per-project directory in `~/.claude/projects/` (local, not committed, kept as long
as the client retains them). For a report later, run `/monitor-ai-tooling`.

## Session recovery

- Claude Code: `claude --continue` resumes the latest session in this directory; `claude --resume <session-id>`
  a given one. Transcripts persist locally (three sessions present at setup), so recovery works without a new
  handoff even after plan allowance runs out.
- Checkpoints between sessions: handoffs in `.agents/handoffs/` and working state in
  `documentation/work-in-progress.md`.
