#!/bin/bash
# Builds the Go YL parser and runs the shared conformance vectors.
#   parsers/go/run.sh [path/to/spec/conformance]
# Needs go 1.23 or newer. Exits 2 when go is missing or the build fails,
# 1 when a vector fails.
set -euo pipefail
here="$(cd "$(dirname "$0")" && pwd)"
vectors="${1:-$here/../../spec/conformance}"
if ! command -v go >/dev/null 2>&1; then
  echo "go not found" >&2
  exit 2
fi
go build -C "$here" -o "$here/conformance" . >&2 || { echo "go build failed" >&2; exit 2; }
exec "$here/conformance" "$vectors"
