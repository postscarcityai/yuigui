#!/bin/bash
# Build public/demo/motion/three.min.js: three.js (MIT) tree-shaken to the names in three-entry.mjs, one IIFE
# exposing the global THREE. The player loads it only when a scene calls api.three() (lazy, offline).
#   bash site/scripts/motion/build_three.sh [dir-with-node_modules/three-and-esbuild]   (default ~/src/ext-apps)
set -euo pipefail
here="$(cd "$(dirname "$0")" && pwd)"; out="$here/../../public/demo/motion/three.min.js"
src="${1:-$HOME/src/ext-apps}"
ver=$(node -p "require('$src/node_modules/three/package.json').version")
cp "$here/three-entry.mjs" "$src/_yui_three_entry.mjs"
trap 'rm -f "$src/_yui_three_entry.mjs"' EXIT
(cd "$src" && node_modules/.bin/esbuild _yui_three_entry.mjs --bundle --minify --format=iife --global-name=THREE --target=es2020 \
  --legal-comments=none --banner:js="/* three.js v$ver, MIT, (c) three.js authors. Tree-shaken for Yui motion. */" --outfile="$out")
echo "$(wc -c < "$out") bytes, $(gzip -c "$out" | wc -c) gzipped"
