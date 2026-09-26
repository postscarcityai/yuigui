# Yui Lines for Rust

A Yui Lines parser for Rust. No dependencies, standard library only: no regex crate, no serde. It includes a small strict JSON reader for `custom` lines. It is a line-by-line port of the JS reference (`site/lib/yl/yl.mjs`). It passes every vector in `spec/conformance/`, and on random documents it gives the same output as the JS parser.

```rust
use yuilines::{parse, resolve, StreamParser, Value};

let ops = parse("timer 40/20x8 Tabata\nask Ready? Yes|Not yet");
println!("{}", yuilines::json::write(&ops[0]));
// {"op":"add","screen":"1","preset":"timer","id":"n1","props":{"work":40,"rest":20,"rounds":8,"label":"Tabata"},"line":"timer 40/20x8 Tabata"}

let mut s = StreamParser::new();
let mut more = s.push("card Hi th");      // nothing yet: the line is not finished
more.extend(s.push("ere\n"));             // one op per finished line
more.extend(s.flush());
let props = more[0].get("props").and_then(Value::as_obj).unwrap();
let full = resolve("card", props);        // props over the preset's defaults
```

Ops are `Value::Obj` with the same keys as the JS parser. `Value` is a JSON value: numbers are `f64`, objects keep their key order. `on_stage(op, style)` says whether an add opens on the full-screen stage, `page_of(screen)` gives its page, `talking(ops)` lists the pages with the composer on, `doing_of(ops)` gives the working row's words and step. A `flow` head followed by a Mermaid chart gives its graph as one patch at `end` (or at the end of the input: `parse` and `flush` call `Parser::finish`), and `flow_path(g, answers)`, `flow_next`, `flow_ahead` and `flow_event` walk it (spec/FLOWS.md).

The sources are in `src/`: `lib.rs` (the parser; each JS regex is a small matcher with the regex in its comment), `json.rs` (values and JSON), `bin/conformance.rs` (the runner) and `bin/yl.rs` (a CLI: YL on stdin, one JSON op per line on stdout).

Run the vectors (needs cargo; on a Mac, `brew install rust`):

```sh
parsers/rust/run.sh
```

Compare with the JS parser on random documents (whole parse, a stream in random chunks, the stage, the pages that talk, every add resolved):

```sh
node parsers/rust/diff.mjs 5000 1    # count, seed
```

Known gaps, all at the edges of Unicode or depth:

- A Rust string cannot hold half a UTF-16 surrogate pair. A `custom` line whose JSON escapes a lone surrogate (`"\ud800"`) reads it as U+FFFD, and a `math caption="...` that never closes its quote and ends in an emoji drops the whole emoji, where JS keeps half of it.
- `custom` JSON nested more than 1000 deep is an error here (JS reads it).
