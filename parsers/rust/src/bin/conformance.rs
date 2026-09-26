//! YL conformance runner for the Rust parser.
//!     parsers/rust/run.sh [path/to/spec/conformance]
//! Reads the shared vectors in spec/conformance (no copies). Exits 1 on any
//! failure. Same checks as spec/conformance/run.mjs; see its README.md.

use std::path::{Path, PathBuf};
use std::{env, fs, panic, process};
use std::collections::HashMap;
use yuilines::{json, mark_at, on_stage, page_of, parse_with, read_typed, talking, timeline_rows, typed_body, Map, StreamParser, Value};

/// Parser ops minus `line` and an error's `message`.
fn normalize(ops: Vec<Value>) -> Value {
    Value::Arr(
        ops.into_iter()
            .map(|o| match o {
                Value::Obj(m) => Value::Obj(Map(m.0.into_iter().filter(|(k, _)| k != "line" && k != "message").collect())),
                v => v,
            })
            .collect(),
    )
}

/// Deep equality with JSON semantics: key order does not matter, numbers
/// compare by value.
fn same(a: &Value, b: &Value) -> bool {
    match (a, b) {
        (Value::Obj(x), Value::Obj(y)) => x.len() == y.len() && x.0.iter().all(|(k, v)| y.get(k).is_some_and(|w| same(v, w))),
        (Value::Arr(x), Value::Arr(y)) => x.len() == y.len() && x.iter().zip(y).all(|(v, w)| same(v, w)),
        _ => a == b,
    }
}

fn by_char(text: &str, known: &HashMap<String, String>) -> Value {
    let mut s = StreamParser::with_known(known);
    let mut out = Vec::new();
    let mut buf = [0u8; 4];
    for ch in text.chars() {
        out.extend(s.push(ch.encode_utf8(&mut buf)));
    }
    out.extend(s.flush());
    normalize(out)
}

fn nums(list: Vec<u32>) -> Value {
    Value::Arr(list.into_iter().map(|n| Value::Num(n as f64)).collect())
}

fn check(v: &Value) -> Vec<(&'static str, Value)> {
    let mut fails = Vec::new();
    let input = v.get("input").and_then(Value::as_str).unwrap_or("");
    let expected = v.get("expected").cloned().unwrap_or(Value::Arr(vec![]));
    // `known`: ids that last from earlier replies (YL.md section 5), id -> preset.
    let known: HashMap<String, String> = match v.get("known").and_then(Value::as_obj) {
        Some(m) => m.0.iter().filter_map(|(k, v)| v.as_str().map(|s| (k.clone(), s.to_string()))).collect(),
        None => HashMap::new(),
    };
    let parse = |t: &str| parse_with(t, &known);
    let got = normalize(parse(input));
    if !same(&got, &expected) {
        fails.push(("parse", got));
    }
    let streamed = by_char(input, &known);
    if !same(&streamed, &expected) {
        fails.push(("stream (1 char per chunk)", streamed));
    }
    if let Some(chunks) = v.get("chunks").and_then(Value::as_arr) {
        let mut s = StreamParser::with_known(&known);
        let mut emits: Vec<Value> = chunks.iter().map(|c| normalize(s.push(c.as_str().unwrap_or("")))).collect();
        emits.push(normalize(s.flush()));
        let emits = Value::Arr(emits);
        if !same(&emits, v.get("emits").unwrap_or(&Value::Null)) {
            fails.push(("stream (chunks)", emits));
        }
    }
    if let Some(want) = v.get("stage") {
        let empty = Map::new();
        let style = v.get("style").and_then(Value::as_obj).unwrap_or(&empty);
        let staged = Value::Arr(parse(input).into_iter().filter(|o| on_stage(o, style)).map(|o| o.get("id").cloned().unwrap()).collect());
        if !same(&staged, want) {
            fails.push(("stage (ids that open on the stage)", staged));
        }
    }
    if let Some(want) = v.get("pages") {
        let pages = parse(input)
            .iter()
            .filter(|o| o.get("op") == Some(&Value::str("add")))
            .map(|o| page_of(o.get("screen").and_then(Value::as_str).unwrap()))
            .collect();
        let pages = nums(pages);
        if !same(&pages, want) {
            fails.push(("pages (page of each add)", pages));
        }
    }
    if let Some(want) = v.get("rows") {
        let rows = timeline_rows(&parse(input));
        let kinds: Vec<&str> = rows.iter().map(|r| r.1.as_str()).collect();
        let mut got = Map::new();
        got.set(
            "rows",
            Value::Arr(
                rows.iter()
                    .map(|(id, kind)| {
                        let mut r = Map::new();
                        r.set("id", Value::str(id));
                        r.set("kind", Value::str(kind));
                        Value::Obj(r)
                    })
                    .collect(),
            ),
        );
        got.set("mark", Value::Num(mark_at(&kinds) as f64));
        let got = Value::Obj(got);
        if !same(&got, want) {
            fails.push(("rows (timeline rows and the now marker)", got));
        }
    }
    if let Some(want) = v.get("talk") {
        let on = nums(talking(&parse(input)));
        if !same(&on, want) {
            fails.push(("talk (pages with the composer on)", on));
        }
    }
    if let Some(t) = v.get("typed") {
        let screen = t.get("screen").and_then(Value::as_str).unwrap_or("");
        let words = t.get("words").and_then(Value::as_str).unwrap_or("");
        let body = t.get("body").and_then(Value::as_str).unwrap_or("");
        let made = typed_body(screen, words);
        if made != body {
            fails.push(("typed (body for words typed on the screen)", Value::Str(made)));
        }
        let pair = |s: &str, w: &str| {
            let mut m = Map::new();
            m.set("screen", Value::str(s));
            m.set("words", Value::str(w));
            Value::Obj(m)
        };
        let read = read_typed(body).map_or(Value::Null, |(s, w)| pair(&s, &w));
        let want = if page_of(screen) == 1 { Value::Null } else { pair(screen, words) };
        if read != want {
            fails.push(("typed (read back)", read));
        }
    }
    let has_error = expected.as_arr().is_some_and(|a| a.iter().any(|o| o.get("op") == Some(&Value::str("error"))));
    if has_error != (v.get("error") == Some(&Value::Bool(true))) {
        fails.push(("vector: `error` flag does not match expected", v.get("error").cloned().unwrap_or(Value::Null)));
    }
    fails
}

/// `^\d\d-.*\.json$`
fn is_vector_file(name: &str) -> bool {
    let b = name.as_bytes();
    b.len() > 3 && b[0].is_ascii_digit() && b[1].is_ascii_digit() && b[2] == b'-' && name.ends_with(".json")
}

fn main() {
    let dir: PathBuf = env::args().nth(1).map(PathBuf::from).unwrap_or_else(|| Path::new(env!("CARGO_MANIFEST_DIR")).join("../../spec/conformance"));
    let mut files: Vec<String> = fs::read_dir(&dir)
        .unwrap_or_else(|e| {
            eprintln!("cannot read {}: {}", dir.display(), e);
            process::exit(2)
        })
        .filter_map(|e| e.ok()?.file_name().into_string().ok())
        .filter(|f| is_vector_file(f))
        .collect();
    files.sort();
    // A crash is a failure, not an abort.
    panic::set_hook(Box::new(|_| {}));
    let (mut passed, mut failed) = (0, 0);
    for f in &files {
        let text = fs::read_to_string(dir.join(f)).expect("read vector file");
        let doc = json::parse(&text).unwrap_or_else(|e| panic!("{}: {}", f, e));
        let vectors = doc.get("vectors").and_then(Value::as_arr).cloned().unwrap_or_default();
        let mut ok = 0;
        for v in &vectors {
            let fails = panic::catch_unwind(|| check(v)).unwrap_or_else(|e| {
                let msg = e.downcast_ref::<String>().cloned().or_else(|| e.downcast_ref::<&str>().map(|s| s.to_string()));
                vec![("crash", Value::Str(msg.unwrap_or_else(|| "panic".into())))]
            });
            if fails.is_empty() {
                ok += 1;
                continue;
            }
            failed += 1;
            println!("FAIL {} :: {}", f, v.get("name").and_then(Value::as_str).unwrap_or("?"));
            println!("  input:    {}", json::write(v.get("input").unwrap_or(&Value::Null)));
            let want = if v.get("chunks").is_some() { v.get("emits") } else { v.get("expected") };
            println!("  expected: {}", json::write(want.unwrap_or(&Value::Null)));
            for (how, got) in fails {
                println!("  {}: {}", how, json::write(&got));
            }
        }
        passed += ok;
        println!("{} {:<34} {}/{}", if ok == vectors.len() { "ok  " } else { "FAIL" }, f, ok, vectors.len());
    }
    println!("\n{} passed, {} failed, {} vectors in {} files", passed, failed, passed + failed, files.len());
    process::exit(if failed > 0 { 1 } else { 0 });
}
