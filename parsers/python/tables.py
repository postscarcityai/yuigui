"""Agent tables (spec/TABLES.md): the store behind `table create`, `put` and
`query`. A port of site/lib/yl/tables.mjs, the reference; the conformance
vectors (spec/conformance/30-tables.json) pin the semantics.

A store holds one agent's tables:
  {"tables": {name: {"name", "cols": [{"name", "type", "unit"?}], "rows": {key: {col: value}}, "order": [key], "next"}}}
Every function returns a new store and never changes the one it was given.
"""

import datetime
import functools
import json
import math
import re

TYPES = ["text", "number", "date", "bool"]

LIMITS = {
    "tables": 20,  # per agent
    "cols": 12,  # per table
    "rows": 5000,  # per table
    "text": 1000,  # characters in one text cell
    "key": 64,  # characters in a row key
    "name": 32,  # characters in a table name
    "limit": 50,  # rows a query shows by default
    "maxLimit": 500,  # rows a query can ask for
    "send": 200,  # rows a `send` view hands the agent
}

NAME = re.compile(r"[A-Za-z][\w-]*", re.A)
COL = re.compile(r"[A-Za-z_][\w-]*", re.A)
NUMBER = re.compile(r"-?\d+(\.\d+)?", re.A)
DAY = re.compile(r"\d{4}-\d{2}-\d{2}", re.A)
STAMP = re.compile(r"\d{4}-\d{2}-\d{2}T\d{2}:\d{2}", re.A)
REL = re.compile(r"today(?:([+-])(\d{1,4}))?", re.I | re.A)


def empty_store():
    return {"tables": {}}


def local_today(d=None):
    """`today` is the phone's local date, YYYY-MM-DD; `now` adds the time."""
    return (d or datetime.datetime.now()).strftime("%Y-%m-%d")


def local_now(d=None):
    return (d or datetime.datetime.now()).strftime("%Y-%m-%dT%H:%M")


def _shift_day(day, n):
    return (datetime.date.fromisoformat(day) + datetime.timedelta(days=n)).isoformat()


def _real_date(s):
    try:
        datetime.date(int(s[0:4]), int(s[5:7]), int(s[8:10]))
        return True
    except ValueError:
        return False


def _is_num(v):
    return isinstance(v, (int, float)) and not isinstance(v, bool)


def _num(s):
    f = float(s)
    return int(f) if f.is_integer() and "." not in s else f


def _js_str(v):
    if v is True:
        return "true"
    if v is False:
        return "false"
    if v is None:
        return "null"
    if isinstance(v, float) and v.is_integer():
        return str(int(v))
    return str(v)


def cell(type_, v, ctx=None):
    """One value into a column's type. Returns {"value"} or {"error"}.
    None means an empty cell. ctx["today"] / ctx["now"] resolve the date words."""
    ctx = ctx or {}
    if v == "" or v is None:
        return {"value": None}
    if isinstance(v, list):
        v = "|".join(_js_str(x) for x in v)
    if type_ == "text":
        s = _js_str(v)
        if len(s) > LIMITS["text"]:
            return {"error": f"text over {LIMITS['text']} characters"}
        return {"value": s}
    if type_ == "number":
        if _is_num(v):
            return {"value": v} if math.isfinite(v) else {"error": "not a number"}
        if isinstance(v, str) and NUMBER.fullmatch(v.strip()):
            return {"value": _num(v.strip())}
        return {"error": f'"{_js_str(v)}" is not a number'}
    if type_ == "date":
        s = _js_str(v).strip()
        today = ctx.get("today") or local_today()
        rel = REL.fullmatch(s)
        if rel:
            if rel[1]:
                return {"value": _shift_day(today, (-1 if rel[1] == "-" else 1) * int(rel[2]))}
            return {"value": today}
        if s.lower() == "now":
            return {"value": ctx.get("now") or local_now()}
        if (DAY.fullmatch(s) or STAMP.fullmatch(s)) and _real_date(s):
            return {"value": s}
        return {"error": f'"{s}" is not a date (YYYY-MM-DD, today, today-7, now)'}
    if type_ == "bool":
        if isinstance(v, bool):
            return {"value": v}
        s = _js_str(v).lower()
        if s in ("on", "true", "yes", "1"):
            return {"value": True}
        if s in ("off", "false", "no", "0"):
            return {"value": False}
        return {"error": f'"{_js_str(v)}" is not on or off'}
    return {"error": f"unknown type {type_}"}


def _copy_table(t):
    return {**t, "cols": [dict(c) for c in t["cols"]], "rows": dict(t["rows"]), "order": list(t["order"])}


def _with(store, name, t):
    return {"tables": {**store["tables"], name: t}}


def _create(store, op, ctx):
    """`table create`: make a table, or change an existing one's columns.
    Columns are matched by name: kept columns keep their values (a new type
    converts them, and what does not fit becomes empty), removed columns lose
    theirs, new columns start empty. Rows are never dropped by a schema change."""
    name, cols = op.get("name") or "", op.get("cols") or []
    if not NAME.fullmatch(name) or len(name) > LIMITS["name"]:
        return {"store": store, "error": f'table: bad name "{name}"'}
    if not cols:
        return {"store": store, "error": "table create: needs at least one col:type"}
    if len(cols) > LIMITS["cols"]:
        return {"store": store, "error": f"table create: {LIMITS['cols']} columns at most"}
    seen = set()
    for c in cols:
        n = c.get("name") or ""
        if not COL.fullmatch(n):
            return {"store": store, "error": f'table create: bad column "{n}"'}
        if n.lower() == "key":
            return {"store": store, "error": "table create: key is the row key, not a column"}
        if n.lower() in seen:
            return {"store": store, "error": f'table create: column "{n}" twice'}
        if c.get("type") not in TYPES:
            return {"store": store, "error": f'table create: "{c.get("type")}" is not text, number, date or bool'}
        seen.add(n.lower())
    old = store["tables"].get(name)
    if not old and len(store["tables"]) >= LIMITS["tables"]:
        return {"store": store, "error": f"table: {LIMITS['tables']} tables per agent at most"}
    clean = [{"name": c["name"], "type": c["type"], **({"unit": c["unit"]} if c.get("unit") else {})} for c in cols]
    if not old:
        return {"store": _with(store, name, {"name": name, "cols": clean, "rows": {}, "order": [], "next": 1})}
    t = _copy_table(old)
    prev = {c["name"]: c for c in old["cols"]}
    for key in t["order"]:
        row = old["rows"][key]
        nxt = {}
        for c in clean:
            was = prev.get(c["name"])
            if not was or row.get(c["name"]) is None:
                continue
            v = {"value": row[c["name"]]} if was["type"] == c["type"] else cell(c["type"], row[c["name"]], ctx)
            if v.get("value") is not None and "error" not in v:
                nxt[c["name"]] = v["value"]
        t["rows"][key] = nxt
    t["cols"] = clean
    return {"store": _with(store, name, t)}


def _put(store, op, ctx):
    """`put`: upsert one row by key. With no key the store makes one (r1, r2 ...),
    so a log can just append. `delete` takes the row out. The whole put is
    refused when one value is wrong, so a row is never half written."""
    table = op.get("table")
    t0 = store["tables"].get(table)
    if not t0:
        return {"store": store, "error": f'put: no table "{table}"'}
    key = op.get("key")
    if key is not None:
        key = _js_str(key)
        if not key or len(key) > LIMITS["key"]:
            return {"store": store, "error": f"put: a key is 1 to {LIMITS['key']} characters"}
    t = _copy_table(t0)
    if op.get("delete"):
        if key is None:
            return {"store": store, "error": "put +delete: needs a key"}
        if key not in t["rows"]:
            return {"store": store}
        del t["rows"][key]
        t["order"] = [x for x in t["order"] if x != key]
        return {"store": _with(store, table, t), "key": key}
    by_name = {c["name"].lower(): c for c in t["cols"]}
    vals = {}
    for k, v in (op.get("values") or {}).items():
        c = by_name.get(k.lower())
        if not c:
            return {"store": store, "error": f'put: {table} has no column "{k}"'}
        r = cell(c["type"], v, ctx)
        if "error" in r:
            return {"store": store, "error": f"put: {c['name']}: {r['error']}"}
        vals[c["name"]] = r["value"]
    if key is None:
        while True:
            key = f"r{t['next']}"
            t["next"] += 1
            if key not in t["rows"]:
                break
    had = key in t["rows"]
    if not had and len(t["order"]) >= LIMITS["rows"]:
        return {"store": store, "error": f"put: {table} is full ({LIMITS['rows']} rows)"}
    row = dict(t["rows"][key]) if had else {}
    for k, v in vals.items():
        if v is None:
            row.pop(k, None)
        else:
            row[k] = v
    t["rows"][key] = row
    if not had:
        t["order"].append(key)
    return {"store": _with(store, table, t), "key": key}


def write(store, op, ctx=None):
    """Apply one parser op (`table` or `put`) to a store.
    Returns {"store", "error"?, "key"?}: on an error the store is unchanged."""
    ctx = ctx or {}
    if op.get("op") == "table":
        return _create(store, op, ctx)
    if op.get("op") == "put":
        return _put(store, op, ctx)
    return {"store": store}


# ---------- query ----------

CLAUSE = re.compile(r"([A-Za-z_][\w-]*)\s*(>=|<=|!=|=|>|<|~)\s*(.*)", re.A | re.S)
AGGS = ["sum", "avg", "min", "max"]


def _cmp(a, b):
    """Numbers by value, bools off before on, anything else as text without case."""
    if a is None and b is None:
        return 0
    if a is None:
        return 1
    if b is None:
        return -1
    if _is_num(a) and _is_num(b):
        return (a > b) - (a < b)
    if isinstance(a, bool) and isinstance(b, bool):
        return int(a) - int(b)
    x, y = _js_str(a).casefold(), _js_str(b).casefold()
    return (x > y) - (x < y)


def _as_list(v):
    """A flag (`+count`) is true, never a list: `sort` and the rest only take names."""
    if v is None or isinstance(v, bool):
        return []
    return [s for s in (_js_str(x) for x in (v if isinstance(v, list) else [v])) if s != ""]


def _round(n):
    r = math.floor(n * 1e6 + 0.5) / 1e6
    return int(r) if r.is_integer() else r


def query(store, props, ctx=None):
    """Runs a query's props against a store.
    Returns {"cols": [{"name", "type", "unit"?}], "rows": [[...]], "keys": [key|None], "count"}
    or {"missing": name} or {"error"}. `count` is the rows matched before `limit`."""
    ctx = ctx or {}
    name = props.get("table")
    t = store["tables"].get(name)
    if not t:
        return {"missing": name}

    def col_of(n):
        n = _js_str(n).lower()
        if n == "key":
            return {"name": "key", "type": "text"}
        return next((c for c in t["cols"] if c["name"].lower() == n), None)

    # where: every clause must hold.
    tests = []
    for w in _as_list(props.get("where")):
        m = CLAUSE.fullmatch(w)
        if not m:
            return {"error": f'where: cannot read "{w}"'}
        c = col_of(m[1])
        if not c:
            return {"error": f'where: no column "{m[1]}"'}
        op, raw = m[2], m[3].strip()
        if raw == "":
            if op not in ("=", "!="):
                return {"error": f'where: "{w}" needs a value'}
            tests.append(lambda row, c=c, op=op: (row.get(c["name"]) is None) == (op == "="))
            continue
        if op == "~":
            want = raw.lower()
        else:
            r = cell(c["type"], raw, ctx)
            if "error" in r:
                return {"error": f"where: {c['name']}: {r['error']}"}
            want = r["value"]
        # A date with no time compares by day, so Day=today holds for a stamp at 12:30 today.
        by_day = c["type"] == "date" and isinstance(want, str) and len(want) == 10

        def test(row, c=c, op=op, want=want, by_day=by_day):
            v = row.get(c["name"])
            if v is None:
                return op == "!="
            if by_day:
                v = _js_str(v)[:10]
            if op == "~":
                return want in _js_str(v).lower()
            d = _cmp(v, want)
            return {"=": d == 0, "!=": d != 0, ">": d > 0, "<": d < 0, ">=": d >= 0, "<=": d <= 0}[op]

        tests.append(test)
    rows = [{**t["rows"][k], "key": k} for k in t["order"]]
    rows = [r for r in rows if all(f(r) for f in tests)]

    # Aggregates: group=Col and sum/avg/min/max=Col|Col, +count.
    keyed = True
    aggs = [(a, n) for a in AGGS for n in _as_list(props.get(a))]
    group = props.get("group")
    if aggs or props.get("count") or group is not None:
        keyed = False
        has_group = group is not None and group != ""
        g = col_of(group) if has_group else None
        if has_group and not g:
            return {"error": f'group: no column "{_js_str(group)}"'}
        out = []
        if g:
            out.append({**g, "from": g["name"], "a": None})
        used = {c["name"].lower() for c in out}
        for a, n in aggs:
            c = col_of(n)
            if not c:
                return {"error": f'{a}: no column "{n}"'}
            if c["type"] != "number" and a in ("sum", "avg"):
                return {"error": f"{a}: {c['name']} is not a number column"}
            label = f"{a} {c['name']}" if c["name"].lower() in used else c["name"]
            used.add(label.lower())
            out.append({"name": label, "type": c["type"], **({"unit": c["unit"]} if c.get("unit") else {}), "from": c["name"], "a": a})
        if props.get("count"):
            out.append({"name": "Count", "type": "number", "from": None, "a": "count"})
        groups = {}
        for r in rows:
            gk = json.dumps(r.get(g["name"])) if g else ""
            groups.setdefault(gk, []).append(r)
        if not g and not groups:
            groups[""] = []
        agg_rows = []
        for lst in groups.values():
            row = {}
            for c in out:
                if c["a"] is None:
                    row[c["name"]] = lst[0].get(c["from"])
                elif c["a"] == "count":
                    row[c["name"]] = len(lst)
                else:
                    vs = [r[c["from"]] for r in lst if r.get(c["from"]) is not None]
                    if not vs:
                        row[c["name"]] = 0 if c["a"] == "sum" else None
                    elif c["a"] == "sum":
                        row[c["name"]] = _round(sum(vs))
                    elif c["a"] == "avg":
                        row[c["name"]] = _round(sum(vs) / len(vs))
                    else:
                        best = vs[0]
                        for v in vs[1:]:
                            if (_cmp(v, best) < 0) if c["a"] == "min" else (_cmp(v, best) > 0):
                                best = v
                        row[c["name"]] = best
            agg_rows.append(row)
        rows = agg_rows
        cols = [{k: v for k, v in c.items() if k not in ("from", "a")} for c in out]
    else:
        pick = _as_list(props.get("cols"))
        if pick:
            cols = [col_of(n) for n in pick]
            bad = next((n for n, c in zip(pick, cols) if not c), None)
            if bad is not None:
                return {"error": f'cols: no column "{bad}"'}
        else:
            cols = t["cols"]
        cols = [dict(c) for c in cols]

    # sort=Col|-Col: a minus sorts that column high to low. Empty cells go last.
    sorts = []
    for s in _as_list(props.get("sort")):
        desc = s.startswith("-")
        n = s[1:] if desc else s
        c = col_of(n) if keyed else next((x for x in cols if x["name"].lower() == n.lower()), None)
        if not c:
            return {"error": f'sort: no column "{n}"'}
        sorts.append((c["name"], desc))
    if sorts:
        def order(x, y):
            for n, desc in sorts:
                a, b = x[1].get(n), y[1].get(n)
                if a is None or b is None:
                    if a is None and b is None:
                        continue
                    return 1 if a is None else -1
                d = _cmp(a, b)
                if d:
                    return -d if desc else d
            return x[0] - y[0]

        rows = [r for _, r in sorted(enumerate(rows), key=functools.cmp_to_key(order))]
    count = len(rows)
    lim = props.get("limit")
    try:
        n = float(lim) if lim is not None and lim != "" and not isinstance(lim, (bool, list)) else None
    except ValueError:
        n = None
    lim = LIMITS["limit"] if n is None or not math.isfinite(n) else math.floor(n)
    rows = rows[: max(0, min(LIMITS["maxLimit"], lim))]
    return {
        "cols": cols,
        "rows": [[r.get(c["name"]) for c in cols] for r in rows],
        "keys": [r["key"] if keyed else None for r in rows],
        "count": count,
    }


def replay(store, ops, ctx=None):
    """Replays ops (anything the parser gives; only `table` and `put` count)
    onto a store. Returns (store, errors: [{"line", "message"}])."""
    errors = []
    for op in ops:
        if op.get("op") not in ("table", "put"):
            continue
        r = write(store, op, ctx)
        if "error" in r:
            errors.append({"line": op.get("line"), "message": r["error"]})
        store = r["store"]
    return store, errors
