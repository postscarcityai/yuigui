"""YL conformance runner for the Python parser.
    python3 parsers/python/conformance.py [path/to/spec/conformance]
Reads the shared vectors in spec/conformance (no copies). Exits 1 on any
failure. Same checks as spec/conformance/run.mjs; see its README.md.
"""

import json
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from tables import empty_store, query, replay  # noqa: E402
from yuilines import StreamParser, attach_body, doing_of, flow_event, flow_path, mark_at, on_stage, page_of, parse, read_attach, read_typed, resolve, talking, timeline_rows, typed_body  # noqa: E402

DEFAULT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "spec", "conformance")


def normalize(ops):
    """Parser ops minus `line` and an error's `message`."""
    return [{k: v for k, v in o.items() if k not in ("line", "message")} for o in ops]


def same(a, b):
    """Deep equality with JSON semantics: numbers compare by value, but a
    bool is never a number (Python's True == 1 is not what JS means)."""
    if isinstance(a, bool) or isinstance(b, bool):
        return isinstance(a, bool) and isinstance(b, bool) and a == b
    if isinstance(a, (int, float)) and isinstance(b, (int, float)):
        return a == b
    if isinstance(a, dict) and isinstance(b, dict):
        return a.keys() == b.keys() and all(same(a[k], b[k]) for k in a)
    if isinstance(a, list) and isinstance(b, list):
        return len(a) == len(b) and all(same(x, y) for x, y in zip(a, b))
    return type(a) is type(b) and a == b


def by_char(text, known):
    s = StreamParser(known)
    out = []
    for ch in text:
        out.extend(s.push(ch))
    out.extend(s.flush())
    return normalize(out)


def check(v):
    fails = []
    # `known`: ids that last from earlier replies (YL.md section 5), id -> preset.
    known = v.get("known") or {}
    got = normalize(parse(v["input"], known))
    if not same(got, v["expected"]):
        fails.append(("parse", got))
    streamed = by_char(v["input"], known)
    if not same(streamed, v["expected"]):
        fails.append(("stream (1 char per chunk)", streamed))
    if "chunks" in v:
        s = StreamParser(known)
        emits = [normalize(s.push(c)) for c in v["chunks"]]
        emits.append(normalize(s.flush()))
        if not same(emits, v["emits"]):
            fails.append(("stream (chunks)", emits))
    if v.get("stage") is not None:
        staged = [o["id"] for o in parse(v["input"], known) if on_stage(o, v.get("style") or {})]
        if not same(staged, v["stage"]):
            fails.append(("stage (ids that open on the stage)", staged))
    if v.get("pages") is not None:
        pages = [page_of(o["screen"]) for o in parse(v["input"], known) if o["op"] == "add"]
        if not same(pages, v["pages"]):
            fails.append(("pages (page of each add)", pages))
    if v.get("rows") is not None:
        rows = timeline_rows(parse(v["input"], known))
        got = {"rows": [{"id": i, "kind": k} for i, k in rows], "mark": mark_at([k for _, k in rows])}
        if not same(got, v["rows"]):
            fails.append(("rows (timeline rows and the now marker)", got))
    if v.get("talk") is not None:
        on = talking(parse(v["input"], known))
        if not same(on, v["talk"]):
            fails.append(("talk (pages with the composer on)", on))
    if v.get("resolved") is not None:
        got = [resolve(o["preset"], o.get("props", {})) for o in parse(v["input"], known) if o["op"] == "add"]
        if not same(got, v["resolved"]):
            fails.append(("resolved (each add over its defaults)", got))
    if "doing" in v:
        d = doing_of(parse(v["input"], known))
        if not same(d, v["doing"]):
            fails.append(("doing (the working row after the input)", d))
    if v.get("typed") is not None:
        t = v["typed"]
        made = typed_body(t["screen"], t["words"])
        if made != t["body"]:
            fails.append(("typed (body for words typed on the screen)", made))
        read = read_typed(t["body"])
        want = None if page_of(t["screen"]) == 1 else {"screen": t["screen"], "words": t["words"]}
        if read != want:
            fails.append(("typed (read back)", read))
    if v.get("attach") is not None:
        a = v["attach"]
        made = attach_body(a["item"], a["words"])
        if made != a["body"]:
            fails.append(("attach (body for words about an item)", made))
        read = read_attach(a["body"])
        want = None if made == a["words"] else {**a["item"], "words": a["words"]}
        if read != want:
            fails.append(("attach (read back)", read))
    if v.get("route") is not None:
        # A flow's route (FLOWS.md): the path the answers take, the first open
        # question, and the event at submit. Uses the input's first flow.
        r = v["route"]
        patch = next((o for o in parse(v["input"], known) if o["op"] == "patch"), None)
        g = resolve("flow", patch["props"] if patch else {})
        got = flow_path(g, r["answers"])
        if not same(got, {"path": r["path"], "open": r["open"]}):
            fails.append(("route (path, open)", got))
        ev = flow_event(g, r["answers"])
        if not same(ev, r["event"]):
            fails.append(("route (event)", ev))
    if v.get("tables") is not None:
        # Agent tables (TABLES.md): replay the input's `table create` and `put`
        # lines onto an empty store (dates resolve against `today`), then run
        # every query add against the store as the whole input left it.
        tv = v["tables"]
        ops = parse(v["input"], known)
        ctx = {"today": tv["today"], "now": tv["now"]}
        store, errors = replay(empty_store(), ops, ctx)
        failed = [e["line"] for e in errors]
        if not same(failed, tv.get("failed") or []):
            fails.append(("tables (write lines the store refused)", failed))
        # A query that cannot run gives {"error": true}: the wording is up to each store.
        results = [query(store, resolve("query", o["props"]), ctx) for o in ops if o["op"] == "add" and o["preset"] == "query"]
        results = [{"error": True} if "error" in r else r for r in results]
        if not same(results, tv.get("results") or []):
            fails.append(("tables (query results)", results))
    has_error = any(o["op"] == "error" for o in v["expected"])
    if has_error != (v.get("error") is True):
        fails.append(("vector: `error` flag does not match expected", v.get("error")))
    return fails


def dump(x):
    return json.dumps(x, ensure_ascii=False, separators=(",", ":"))


def main(argv):
    d = argv[1] if len(argv) > 1 else DEFAULT_DIR
    files = sorted(f for f in os.listdir(d) if re.fullmatch(r"\d\d-.*\.json", f))
    passed = failed = 0
    for f in files:
        with open(os.path.join(d, f), encoding="utf-8") as fh:
            vectors = json.load(fh)["vectors"]
        ok = 0
        for v in vectors:
            try:
                fails = check(v)
            except Exception as e:  # a crash is a failure, not an abort
                fails = [("crash", f"{type(e).__name__}: {e}")]
            if not fails:
                ok += 1
                continue
            failed += 1
            print(f"FAIL {f} :: {v['name']}")
            print(f"  input:    {dump(v['input'])}")
            print(f"  expected: {dump(v['emits'] if 'chunks' in v else v['expected'])}")
            for how, got in fails:
                print(f"  {how}: {dump(got)}")
        passed += ok
        print(f"{'ok  ' if ok == len(vectors) else 'FAIL'} {f:<34} {ok}/{len(vectors)}")
    print(f"\n{passed} passed, {failed} failed, {passed + failed} vectors in {len(files)} files")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
