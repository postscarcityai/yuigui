# YL conformance vectors

Platform-neutral test vectors for Yui Lines (spec: `../YL.md`, section 12). Every YL parser must pass all of them: the JS reference (`site/lib/yl/yl.mjs`), the Swift app parser (`postscarcityai/yui`, `Packages/YuiLines`), and any later port.

```
cd ~/dev/yuigui/spec/conformance && node run.mjs
```

Exits 1 on any failure.

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

- `stage` + `style`: the ids of the adds that open on the stage (YL.md section 5, The stage), when the agent's style profile is `style` (default `{}`). Checked against `onStage` in the JS parser and `YuiLines.opensOnStage` in Swift.

A parser passes a vector when parsing `input` whole, and streaming it one character at a time, both give `expected`, and (with `chunks`) the per-chunk emits match.

## Changing the suite

The JSON files are the source of truth. `seed.mjs` bootstrapped them from the JS parser and was then reviewed by hand; do not re-seed to make a failing parser pass. To change behaviour: edit `YL.md`, edit or add vectors, fix the parsers, then copy the vectors into the app repo with `Packages/YuiLines/scripts/sync-vectors.sh` there.
