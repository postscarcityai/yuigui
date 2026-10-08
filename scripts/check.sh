#!/bin/bash
# The same checks CI runs (.github/workflows/checks.yml), fastest first, so a red one stops here and not on main.
#   scripts/check.sh          conformance (JS, Python, Rust), bench, share previews (og-check, live crawl), site build
#   scripts/check.sh --fast   everything but the site build (a few seconds)
# Exit 0 when green, 1 on the first red step. The pre-push hook (.githooks/pre-push) runs this.
set -uo pipefail
root="$(cd "$(dirname "$0")/.." && pwd)"
cd "$root"
fast=0; [ "${1:-}" = "--fast" ] && fast=1
t0=$(date +%s)
step() {
  local name="$1"; shift
  local s=$(date +%s)
  if "$@" >/tmp/yuigui-check.$$ 2>&1; then
    echo "ok   $name ($(( $(date +%s) - s ))s)"
  else
    echo "FAIL $name" >&2
    tail -40 /tmp/yuigui-check.$$ >&2
    rm -f /tmp/yuigui-check.$$
    echo "check: red on '$name'. Fix it, then push again. CI would fail the same way." >&2
    exit 1
  fi
}
trap 'rm -f /tmp/yuigui-check.$$' EXIT

step "conformance (JS)"     bash -c 'cd spec/conformance && node run.mjs'
step "conformance (Python)" python3 parsers/python/conformance.py spec/conformance
if command -v cargo >/dev/null 2>&1; then
  step "conformance (Rust)" parsers/rust/run.sh spec/conformance
else
  echo "skip conformance (Rust): no cargo here, CI runs it"
fi
step "bench"                bash -c 'cd bench && { [ -d node_modules ] || npm ci --no-audit --no-fund; } && npm test'
[ -d site/node_modules ] || step "site npm ci" bash -c 'cd site && npm ci --no-audit --no-fund'
step "motion kit"             bash -c 'cd site && node --test lib/motion/kit.test.mjs lib/motion/scene.test.mjs'
step "canvas events match the spec" node site/public/playground/canvas/test-spec.mjs
step "canvas undo (history, lines, words)" node site/public/playground/canvas/test-undo.mjs
step "proposal credits"       bash -c 'cd site && node scripts/proposals-check.mjs'
step "share previews (og-check)" bash -c 'cd site && node scripts/og-check.mjs'
step "share previews (retry test)" bash -c 'cd site && node scripts/share-previews-retry.test.mjs'
step "share previews (live crawl)" bash -c 'cd site && node scripts/share-previews.mjs'
if [ "$fast" = 0 ]; then
  step "site build"         bash -c 'cd site && npm run build'
fi
echo "check: green in $(( $(date +%s) - t0 ))s"
