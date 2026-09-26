#!/bin/bash
# Runs the YL conformance vectors against every parser in this repo and
# prints one pass count per language. No CI needed.
#   spec/conformance/run-all.sh
# Exits 1 if any parser fails a vector, 2 if a toolchain is missing
# (that parser is reported as skipped).
# The Swift parser lives in the app repo: Packages/YuiLines there.
here="$(cd "$(dirname "$0")" && pwd)"
root="$(cd "$here/../.." && pwd)"
status=0
summary=""

run() { # name, command...
  local name="$1"; shift
  local out code
  out="$("$@" 2>&1)"; code=$?
  local last; last="$(printf '%s\n' "$out" | grep -E '^[0-9]+ passed' | tail -1)"
  if [ $code -eq 0 ]; then
    summary+=$(printf '%-11s %s' "$name" "$last")$'\n'
  elif [ $code -eq 2 ] || [ -z "$last" ]; then
    summary+=$(printf '%-11s skipped: %s' "$name" "$(printf '%s\n' "$out" | tail -1)")$'\n'
    [ $status -eq 0 ] && status=2
  else
    printf '%s\n' "$out" | grep -A3 '^FAIL .* :: '
    summary+=$(printf '%-11s %s' "$name" "$last")$'\n'
    status=1
  fi
}

run JavaScript bash -c "command -v node >/dev/null || { echo 'node not found'; exit 2; }; cd '$here' && node run.mjs"
run Python     bash -c "command -v python3 >/dev/null || { echo 'python3 not found'; exit 2; }; python3 '$root/parsers/python/conformance.py' '$here'"
run Kotlin     "$root/parsers/kotlin/run.sh" "$here"
run Rust       "$root/parsers/rust/run.sh" "$here"
run Go         "$root/parsers/go/run.sh" "$here"

printf '\n%s' "$summary"
exit $status
