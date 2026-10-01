#!/bin/bash
# SITE-158: production deploy that can never roll the live board back.
# A worker deploying from its own worktree ships that worktree's board.json, which is older than the one
# yui-board-sync pushed a minute ago. So refresh the four exported files from origin/main right before vercel.
# Usage (any checkout or worktree of this repo): bash site/scripts/deploy-prod.sh
set -e
ROOT=$(git rev-parse --show-toplevel)
cd "$ROOT"
git fetch -q origin
for f in board mvp backlog builds; do
  git checkout -q origin/main -- "site/content/$f.json" 2>/dev/null || true
done
# The checkout stages the files; unstage so they never ride along in the worker's next commit.
git reset -q -- site/content/board.json site/content/mvp.json site/content/backlog.json site/content/builds.json 2>/dev/null || true
[ -f .vercel/project.json ] || { mkdir -p .vercel; cp /Users/urzas/dev/yuigui/.vercel/project.json .vercel/project.json; }
(cd site && node scripts/sync-content.mjs)
exec vercel --prod --yes
