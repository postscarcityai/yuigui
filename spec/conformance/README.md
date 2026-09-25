# YL conformance vectors

Platform-neutral test vectors for Yui Lines (spec: `../YL.md`, section 12). Every YL parser must pass all of them:

| Parser | Where | Runner |
|---|---|---|
| JavaScript (reference) | `site/lib/yl/yl.mjs` | `node run.mjs` (here) |
| Swift (the app) | `postscarcityai/yui`, `Packages/YuiLines` | `swift test` there |
| Python | `parsers/python/yuilines.py` | `python3 parsers/python/conformance.py` |
| Kotlin (JVM) | `parsers/kotlin/src/YuiLines.kt` | `parsers/kotlin/run.sh` |
| Rust | `parsers/rust/src/lib.rs` | `parsers/rust/run.sh` |

Run every language in this repo at once, with one pass count each:

```
spec/conformance/run-all.sh
```

Each runner reads these JSON files directly (no copies) and exits 1 on any failure. `run-all.sh` exits 1 if any parser fails and 2 if a toolchain is missing (that language shows as skipped).

## Format

One file per area, `NN-area.json`:

```json
{ "version": "YL v0", "area": "timer", "vectors": [
  { "name": "work/rest x rounds", "input": "timer 40/20x8 Tabata",
    "expected": [{ "op": "add", "screen": "1", "preset": "timer", "id": "n1",
                   "props": { "work": 40, "rest": 20, "rounds": 8, "label": "Tabata" } }] }
]}
```

- `input`: YL text, possibly many lines.
- `expected`: the ops for the whole input, in order, without each op's `line` and without an error's `message` (wording is up to each parser). Object key order does not matter; numbers compare by value.
- `error: true`: the vector expects at least one error op.
- `chunks` + `emits`: streaming. Push each chunk into a fresh stream parser, then flush. `emits[i]` is what push `i` returned; the last entry is what `flush()` returned.

- `stage` + `style`: the ids of the adds that open on the stage (YL.md section 5, The stage), when the agent's style profile is `style` (default `{}`). Checked against `onStage` in the JS parser, `YuiLines.opensOnStage` in Swift, `on_stage` in Python and Rust and `onStage` in Kotlin.

- `pages`: the page each add lands on, in order (YL.md section 5, Pages): `2` to `12` for those screens, `1` for every other (`13`, `02`, `chat`, `full` included). Checked against `pageOf` in JS and Kotlin, `YuiLines.page(of:)` in Swift and `page_of` in Python and Rust.

- `talk`: the pages whose composer is on after the whole input, in number order (YL.md section 5, Pages, chat with a screen). Checked against `talking` in JS, Python, Kotlin and Rust and `YuiLines.talking` in Swift.

- `typed`: `{screen, words, body}`, words typed on a screen (YL.md section 7). `typedBody(screen, words)` must give `body`, and `readTyped(body)` must give back `{screen, words}`, or nothing when the screen has no page. These vectors have an empty `input`.

A parser passes a vector when parsing `input` whole, and streaming it one character at a time, both give `expected`, and (with `chunks`) the per-chunk emits match.

## Changing the suite

The JSON files are the source of truth. `seed.mjs` bootstrapped them from the JS parser and was then reviewed by hand; do not re-seed to make a failing parser pass. To change behaviour: edit `YL.md`, edit or add vectors, fix the parsers (all of them: `run-all.sh` must stay green), then copy the vectors into the app repo with `Packages/YuiLines/scripts/sync-vectors.sh` there.
