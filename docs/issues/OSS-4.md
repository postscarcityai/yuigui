---
card: OSS-4
repo: postscarcityai/yuigui
title: Yui Lines parser in Rust
labels: good first issue, help wanted, area:parsers
---
Yui Lines has parsers in JavaScript (the reference), Swift, Python and Kotlin. Rust is the next one we want.

## Context

- The reference parser is `site/lib/yl/yl.mjs`. Port it line by line.
- `parsers/python/yuilines.py` and `parsers/kotlin/src/YuiLines.kt` are worked ports. They show the traps: JavaScript's idea of whitespace, and ASCII-only `\d` and `\w`.
- The spec is `spec/YL.md`. The test vectors are the JSON files in `spec/conformance/`.

## What to build

- `parsers/rust/`, a crate with no dependencies beyond `std`. Parse JSON by hand, like `parsers/kotlin/src/Json.kt` does. If you want `serde`, say so in the pull request and why.
- A runner that reads `spec/conformance/*.json` directly and prints pass and fail counts.
- Add it to `spec/conformance/run-all.sh`. Exit 2 with a clear message when `cargo` is missing.
- Add a row to the table in `parsers/README.md` and a line in `spec/conformance/README.md`.

## Done when

- Every vector in `spec/conformance/` passes.
- A short script parses a few hundred random documents with both the JavaScript parser and yours, and the output matches.
- `spec/conformance/run-all.sh` passes on a machine with `cargo`.

One parser per pull request. See CONTRIBUTING.md for setup.
