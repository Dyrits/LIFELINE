#!/bin/bash
# PreCompact gate: block compaction until a fresh handoff exists in .agents/handoffs/.
# Runs from the project root (Claude Code hooks run with cwd = project dir).

set -euo pipefail

FRESH_WINDOW_MINUTES=5
HANDOFF_DIR=".agents/handoffs"

input="$(cat)"
trigger="$(printf '%s' "$input" | jq -r '.trigger // "unknown"')"

if [ ! -d "$HANDOFF_DIR" ]; then
  mkdir -p "$HANDOFF_DIR"
fi

newest="$(find "$HANDOFF_DIR" -type f -name '*.md' -mmin -"$FRESH_WINDOW_MINUTES" | head -n 1)"

if [ -n "$newest" ]; then
  exit 0
fi

cat <<EOF
{
  "decision": "block",
  "reason": "Compaction is gated: write a handoff first. Read ~/.claude/skills/hand-off/SKILL.md and follow it to write a versioned handoff document to .agents/handoffs/ (the skill is user-invoked, so it cannot be called through the Skill tool), then let compaction proceed. Without it, the detail compaction discards is lost. (trigger: ${trigger})"
}
EOF
