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

- `rows`: `{rows: [{id, kind}], mark}`, a timeline's rows after the whole input is applied to an empty screen (YL.md section 4, timeline, Moving a row): every `done`, `now` and `next` in line order with its kind, and `mark`, the index the now marker sits before. Checked against `apply` and `markAt` in JS, `timeline_rows` and `mark_at` in Python and Rust, `timelineRows` and `markAt` in Kotlin, and in Swift with `rowKind(of:patch:)` and `markAt` (YUI-111).

- `typed`: `{screen, words, body}`, words typed on a screen (YL.md section 7). `typedBody(screen, words)` must give `body`, and `readTyped(body)` must give back `{screen, words}`, or nothing when the screen has no page. These vectors have an empty `input`.

- `attach`: `{item, words, body}`, words about one Controls item (spec/TALK-ABOUT.md, section 3). `attachBody(item, words)` must give `body`, and `readAttach(body)` must give back `{section, id, rev, words}`, or nothing when `item` is not an item (`null`, an id with a space or `..`, no rev), in which case `body` is the words as they are. Checked against `attachBody`/`readAttach` in JS, `YuiLines.attachBody`/`readAttach` in Swift and `attach_body`/`read_attach` in Python; the Kotlin and Rust parsers skip them. These vectors have an empty `input`.

- `known`: ids that last from earlier replies (YL.md section 5, Ids that last), as `{id: preset}`. Every parse of the vector, whole, by character and by chunks, starts from a parser given these ids: `parse(input, known)` and `new StreamParser(known)` in JS, `YuiLines.parse(_:known:)` and `YLStreamParser(known:)` in Swift, `parse(text, known)` and `StreamParser(known)` in Python and Kotlin, `parse_with(text, &known)` and `StreamParser::with_known` in Rust. Missing means none.

- `doing`: the working row after the whole input (YL.md section 5, The working row): the newest `doing` line's props, `{text?, step?, of?}`, or `null` when there is none or the last was `doing off`. Checked against `doingOf` in JS and Kotlin and `doing_of` in Python and Rust. The Swift parser learns `doing` in the app half of YUI-63 step 2; until then `35-doing.json` is on its not-yet list (`notYetInApp` and `sync-vectors.sh` in the app repo).

- `menu`: `{review, backlog, shortcut}`, the drawer's items after the whole input, each newest first (YL.md section 5, The drawer): an item is `{id, label, sub?, say?, show?, url?}`, labels cut at 60 characters. Checked against `menuOf` in JS and `YuiLines.menu` in Swift; the Python, Kotlin and Rust parsers pass the parse side of these vectors.

- `route`: `{answers, path, open, event}`, a flow's runtime (FLOWS.md, section 4): for these answers, `flowPath` of the input's flow gives `{path, open}` and `flowEvent` gives `event`.

**JavaScript only for now: `js-NN-*.json`.** Flows (FLOWS.md) are parsed by the JavaScript parser only in step 1 (FLOW-1). Their vectors live in `js-26-flow.json`, which `run.mjs` reads and the Swift, Python, Kotlin and Rust runners skip (they read `NN-*.json`). When a parser learns flows, rename the file to `26-flow.json` and every runner picks it up.

- `tables`: `{today, now, failed?, results}`, agent tables (TABLES.md). Replay the input's `table create` and `put` ops onto an empty store, with `today` and `now` as the phone's date and time. `failed` is the `line` of every write the store refused (none when missing). `results` is, for each `query` add in order, what the query gives against the store the whole input left: `{cols: [{name, type, unit?}], rows, keys, count}`, `{missing: table}`, or `{error: true}` (wording is up to each store). Checked against `replay` and `query` in `site/lib/yl/tables.mjs` (JS) and in each port's own store: `replay` and `query` in `parsers/python/tables.py`, `Tables.replay` and `Tables.query` in Kotlin, `tables::replay` and `tables::query` in Rust. The app's store (Swift, SQLite) is YUI-89's app half.

**Agent tables: `30-tables.json`.** The JavaScript, Python, Kotlin and Rust parsers read `table create`, `put` and `query` and replay them onto their own store (YUI-89). The Swift parser learns them in the app half of that card.

- `look`: `{light, dark}`, for an app restyle: the colors the contrast guard had to move in each mode for the look the input's last `theme app` line asks for. Checked against `appLook` in `site/lib/yl/look.mjs`, which also fails the vector if any text, button or bubble pair is under WCAG AA. The app's own guard is `AgentLook.swift`. The Swift, Python, Kotlin and Rust parsers pass the parse side of these vectors (`31-theme-app.json`).

A parser passes a vector when parsing `input` whole, and streaming it one character at a time, both give `expected`, and (with `chunks`) the per-chunk emits match.

## Changing the suite

The JSON files are the source of truth. `seed.mjs` bootstrapped them from the JS parser and was then reviewed by hand; do not re-seed to make a failing parser pass. To change behaviour: edit `YL.md`, edit or add vectors, fix the parsers (all of them: `run-all.sh` must stay green), then copy the vectors into the app repo with `Packages/YuiLines/scripts/sync-vectors.sh` there.
