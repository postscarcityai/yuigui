//! Parse Yui Lines from stdin and print the ops, one JSON object per line.
//!     echo 'timer 40/20x8 Tabata' | cargo run -q --bin yl
//! `--resolve` prints each add's props over its preset's defaults instead.
//! `--batch` is for parsers/rust/diff.mjs: stdin is a JSON array of
//! {doc, chunks, style}, stdout one JSON array with, per doc, the ops of a
//! whole parse and of a chunked stream, the ids on the stage, the pages with
//! the composer on and every add resolved.

use std::io::{self, Read};
use yuilines::{json, on_stage, parse, resolve, talking, Map, StreamParser, Value};

fn resolved(ops: &[Value]) -> Value {
    Value::Arr(
        ops.iter()
            .filter(|o| o.get("op") == Some(&Value::str("add")))
            .map(|o| {
                let preset = o.get("preset").and_then(Value::as_str).unwrap_or("");
                let props = o.get("props").and_then(Value::as_obj).cloned().unwrap_or_default();
                Value::Obj(resolve(preset, &props))
            })
            .collect(),
    )
}

fn batch(input: &str) -> Value {
    let docs = json::parse(input).expect("stdin: a JSON array");
    let empty = Map::new();
    let out = docs.as_arr().expect("stdin: a JSON array").iter().map(|d| {
        let doc = d.get("doc").and_then(Value::as_str).unwrap_or("");
        let style = d.get("style").and_then(Value::as_obj).unwrap_or(&empty);
        let ops = parse(doc);
        let mut s = StreamParser::new();
        let mut stream = Vec::new();
        for c in d.get("chunks").and_then(Value::as_arr).map(|a| a.as_slice()).unwrap_or(&[]) {
            stream.extend(s.push(c.as_str().unwrap_or("")));
        }
        stream.extend(s.flush());
        let mut r = Map::new();
        r.set("stage", Value::Arr(ops.iter().filter(|o| on_stage(o, style)).filter_map(|o| o.get("id").cloned()).collect()));
        r.set("talk", Value::Arr(talking(&ops).into_iter().map(|n| Value::Num(n as f64)).collect()));
        r.set("resolved", resolved(&ops));
        r.set("ops", Value::Arr(ops));
        r.set("stream", Value::Arr(stream));
        Value::Obj(r)
    });
    Value::Arr(out.collect())
}

fn main() {
    let mut input = String::new();
    io::stdin().read_to_string(&mut input).expect("read stdin");
    let args: Vec<String> = std::env::args().skip(1).collect();
    if args.iter().any(|a| a == "--batch") {
        println!("{}", json::write(&batch(&input)));
        return;
    }
    let ops = parse(&input);
    if args.iter().any(|a| a == "--resolve") {
        for r in resolved(&ops).as_arr().unwrap() {
            println!("{}", json::write(r));
        }
        return;
    }
    for o in &ops {
        println!("{}", json::write(o));
    }
}
