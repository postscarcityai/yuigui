# Yui Lines parsers

Ports of the Yui Lines parser. The spec is `spec/YL.md`. Every parser passes the same vectors in `spec/conformance/`, and nothing is copied from them.

| Language | Where | Run the vectors |
|---|---|---|
| JavaScript (reference) | `site/lib/yl/yl.mjs` | `cd spec/conformance && node run.mjs` |
| Swift (the app) | `Packages/YuiLines` in [postscarcityai/yui](https://github.com/postscarcityai/yui) | `swift test` there |
| Python | `parsers/python` | `python3 parsers/python/conformance.py` |
| Kotlin (JVM) | `parsers/kotlin` | `parsers/kotlin/run.sh` |
| Rust | `parsers/rust` | `parsers/rust/run.sh` |
| Go | `parsers/go` | `parsers/go/run.sh` |

`spec/conformance/run-all.sh` runs every language in this repo and prints one pass count per language.

A new language is a good first contribution. Port `site/lib/yl/yl.mjs` line by line, keep it free of dependencies, add a runner that reads `spec/conformance/*.json`, and add it to `run-all.sh`.
