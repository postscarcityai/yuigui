#!/bin/bash
# Builds the Kotlin YL parser and runs the shared conformance vectors.
#   parsers/kotlin/run.sh [path/to/spec/conformance]
# Needs kotlinc and a JDK (macOS: brew install kotlin). The jar is rebuilt
# only when a source file is newer than it.
set -euo pipefail
here="$(cd "$(dirname "$0")" && pwd)"
jar="$here/build/yuilines.jar"
vectors="${1:-$here/../../spec/conformance}"
if ! command -v kotlinc >/dev/null 2>&1; then
  echo "kotlinc not found (brew install kotlin)" >&2
  exit 2
fi
if [ ! -f "$jar" ] || [ -n "$(find "$here/src" -name '*.kt' -newer "$jar")" ]; then
  mkdir -p "$here/build" && rm -f "$jar"
  kotlinc "$here"/src/*.kt -include-runtime -d "$jar" 2>&1 | grep -v '^warning:' >&2 || true
  [ -f "$jar" ] || { echo "kotlin build failed" >&2; exit 2; }
fi
# macOS ships a /usr/bin/java stub that fails without a JDK: fall back to Homebrew's.
java=java
if [ -n "${JAVA_HOME:-}" ]; then java="$JAVA_HOME/bin/java"
elif ! java -version >/dev/null 2>&1 && command -v brew >/dev/null 2>&1; then java="$(brew --prefix openjdk)/bin/java"
fi
exec "$java" -cp "$jar" yuilines.ConformanceKt "$vectors"
