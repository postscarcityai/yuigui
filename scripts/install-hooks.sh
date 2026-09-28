#!/bin/bash
# One-time per clone: point git at the tracked hooks dir. Worktrees of this clone share the setting.
cd "$(dirname "$0")/.." && git config core.hooksPath .githooks && echo "hooks: core.hooksPath = .githooks (pre-push runs scripts/check.sh)"
