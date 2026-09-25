#!/bin/bash
# Builds the Rust YL parser and runs the shared conformance vectors.
#   parsers/rust/run.sh [path/to/spec/conformance]
# Needs cargo (macOS: brew install rust). Exits 2 when cargo is missing or
# the build fails, 1 when a vector fails.
set -euo pipefail
here="$(cd "$(dirname "$0")" && pwd)"
vectors="${1:-$here/../../spec/conformance}"
if ! command -v cargo >/dev/null 2>&1; then
  echo "cargo not found (brew install rust)" >&2
  exit 2
fi
cargo build --release --quiet --manifest-path "$here/Cargo.toml" --bin conformance >&2 || { echo "rust build failed" >&2; exit 2; }
exec "$here/target/release/conformance" "$vectors"
