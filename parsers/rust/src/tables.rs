//! Agent tables (spec/TABLES.md): the store behind `table create`, `put` and
//! `query`. A port of site/lib/yl/tables.mjs, the reference (and of
//! parsers/python/tables.py); the conformance vectors
//! (spec/conformance/30-tables.json) pin the semantics.
//!
//! A store holds one agent's tables. Cells are `Value`s: Str, Num, Bool, and
//! an empty cell is simply absent from its row. Every function returns a new
//! store and never changes the one it was given.

use crate::json::{Map, Value};
use crate::{is_word, is_ws, js_number, js_str, trim, truthy};
use std::cmp::Ordering;
use std::collections::HashMap;

pub const TYPES: &[&str] = &["text", "number", "date", "bool"];

pub mod limits {
    pub const TABLES: usize = 20; // per agent
    pub const COLS: usize = 12; // per table
    pub const ROWS: usize = 5000; // per table
    pub const TEXT: usize = 1000; // characters in one text cell
    pub const KEY: usize = 64; // characters in a row key
    pub const NAME: usize = 32; // characters in a table name
    pub const LIMIT: f64 = 50.0; // rows a query shows by default
    pub const MAX_LIMIT: f64 = 500.0; // rows a query can ask for
    pub const SEND: usize = 200; // rows a `send` view hands the agent
}

#[derive(Clone, Debug, PartialEq)]
pub struct Col {
    pub name: String,
    pub typ: String,
    pub unit: Option<String>,
}

impl Col {
    fn to_value(&self) -> Value {
        let mut m = Map::new();
        m.set("name", Value::str(&self.name));
        m.set("type", Value::str(&self.typ));
        if let Some(u) = &self.unit {
            m.set("unit", Value::str(u));
        }
        Value::Obj(m)
    }
}

#[derive(Clone, Debug, PartialEq)]
pub struct Table {
    pub name: String,
    pub cols: Vec<Col>,
    /// key -> row (column name -> value; an empty cell is not there)
    pub rows: HashMap<String, Map>,
    /// row keys in the order they were first written
    pub order: Vec<String>,
    /// the next automatic key is r<next>
    pub next: u64,
}

#[derive(Clone, Debug, Default, PartialEq)]
pub struct Store {
    pub tables: HashMap<String, Table>,
}

/// `today` (YYYY-MM-DD) and `now` (YYYY-MM-DDTHH:MM): the phone's local date
/// and time. When one is missing the UTC clock stands in.
#[derive(Clone, Debug, Default)]
pub struct Ctx {
    pub today: Option<String>,
    pub now: Option<String>,
}

pub fn empty_store() -> Store {
    Store::default()
}

/// The result of one write: the new store (unchanged on an error), the error,
/// and the key of the row written.
#[derive(Clone, Debug)]
pub struct Written {
    pub store: Store,
    pub error: Option<String>,
    pub key: Option<String>,
}

// ---------- dates ----------

fn days_from_civil(y: i64, m: i64, d: i64) -> i64 {
    let y = if m <= 2 { y - 1 } else { y };
    let era = if y >= 0 { y } else { y - 399 } / 400;
    let yoe = y - era * 400;
    let mp = (m + 9) % 12;
    let doy = (153 * mp + 2) / 5 + d - 1;
    let doe = yoe * 365 + yoe / 4 - yoe / 100 + doy;
    era * 146097 + doe - 719468
}

fn civil_from_days(z: i64) -> (i64, i64, i64) {
    let z = z + 719468;
    let era = if z >= 0 { z } else { z - 146096 } / 146097;
    let doe = z - era * 146097;
    let yoe = (doe - doe / 1460 + doe / 36524 - doe / 146096) / 365;
    let y = yoe + era * 400;
    let doy = doe - (365 * yoe + yoe / 4 - yoe / 100);
    let mp = (5 * doy + 2) / 153;
    let d = doy - (153 * mp + 2) / 5 + 1;
    let m = if mp < 10 { mp + 3 } else { mp - 9 };
    (if m <= 2 { y + 1 } else { y }, m, d)
}

fn clock() -> (String, String) {
    let secs = std::time::SystemTime::now().duration_since(std::time::UNIX_EPOCH).map_or(0, |d| d.as_secs() as i64);
    let (y, m, d) = civil_from_days(secs.div_euclid(86400));
    let s = secs.rem_euclid(86400);
    let day = format!("{:04}-{:02}-{:02}", y, m, d);
    let now = format!("{}T{:02}:{:02}", day, s / 3600, s % 3600 / 60);
    (day, now)
}

fn ymd(s: &str) -> (i64, i64, i64) {
    let n = |r: std::ops::Range<usize>| s.get(r).and_then(|x| x.parse::<i64>().ok()).unwrap_or(0);
    (n(0..4), n(5..7), n(8..10))
}

fn shift_day(day: &str, n: i64) -> String {
    let (y, m, d) = ymd(day);
    let (y, m, d) = civil_from_days(days_from_civil(y, m, d) + n);
    format!("{:04}-{:02}-{:02}", y, m, d)
}

fn real_date(s: &str) -> bool {
    let (y, m, d) = ymd(s);
    let leap = (y % 4 == 0 && y % 100 != 0) || y % 400 == 0;
    let days = match m {
        1 | 3 | 5 | 7 | 8 | 10 | 12 => 31,
        4 | 6 | 9 | 11 => 30,
        2 if leap => 29,
        2 => 28,
        _ => return false,
    };
    y >= 1 && d >= 1 && d <= days
}

/// `^\d+` run of exactly `n` digits at `i`.
fn digits_at(b: &[u8], i: usize, n: usize) -> bool {
    b.len() >= i + n && b[i..i + n].iter().all(u8::is_ascii_digit)
}

/// `^\d{4}-\d{2}-\d{2}$`
fn is_day(s: &str) -> bool {
    let b = s.as_bytes();
    b.len() == 10 && digits_at(b, 0, 4) && b[4] == b'-' && digits_at(b, 5, 2) && b[7] == b'-' && digits_at(b, 8, 2)
}

/// `^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$`
fn is_stamp(s: &str) -> bool {
    let b = s.as_bytes();
    b.len() == 16 && is_day(&s[..10]) && b[10] == b'T' && digits_at(b, 11, 2) && b[13] == b':' && digits_at(b, 14, 2)
}

/// `^today(?:([+-])(\d{1,4}))?$` with the i flag: Some(days to shift).
fn rel_day(s: &str) -> Option<i64> {
    if s.len() < 5 || !s.is_char_boundary(5) || !s[..5].eq_ignore_ascii_case("today") {
        return None;
    }
    let r = &s[5..];
    if r.is_empty() {
        return Some(0);
    }
    let sign = match r.as_bytes()[0] {
        b'+' => 1,
        b'-' => -1,
        _ => return None,
    };
    let n = &r[1..];
    (!n.is_empty() && n.len() <= 4 && n.bytes().all(|b| b.is_ascii_digit())).then(|| sign * n.parse::<i64>().unwrap())
}

/// `^-?\d+(\.\d+)?$`
fn is_number(s: &str) -> bool {
    let b = s.as_bytes();
    let mut j = usize::from(b.first() == Some(&b'-'));
    let k = j;
    while j < b.len() && b[j].is_ascii_digit() {
        j += 1;
    }
    if j == k {
        return false;
    }
    if j < b.len() && b[j] == b'.' {
        let k = j + 1;
        j = k;
        while j < b.len() && b[j].is_ascii_digit() {
            j += 1;
        }
        if j == k {
            return false;
        }
    }
    j == b.len()
}

// ---------- cells ----------

/// One value into a column's type: Ok(Some(value)), Ok(None) for an empty
/// cell, or Err(message). ctx.today / ctx.now resolve the date words.
pub fn cell(typ: &str, v: &Value, ctx: &Ctx) -> Result<Option<Value>, String> {
    let joined;
    let v = match v {
        Value::Null => return Ok(None),
        Value::Str(s) if s.is_empty() => return Ok(None),
        Value::Arr(a) => {
            joined = Value::Str(a.iter().map(js_str).collect::<Vec<_>>().join("|"));
            &joined
        }
        v => v,
    };
    match typ {
        "text" => {
            let s = js_str(v);
            if s.chars().count() > limits::TEXT {
                return Err(format!("text over {} characters", limits::TEXT));
            }
            Ok(Some(Value::Str(s)))
        }
        "number" => match v {
            Value::Num(n) if n.is_finite() => Ok(Some(Value::Num(*n))),
            Value::Num(_) => Err("not a number".into()),
            Value::Str(s) if is_number(trim(s)) => Ok(Some(Value::Num(trim(s).parse::<f64>().unwrap()))),
            _ => Err(format!("\"{}\" is not a number", js_str(v))),
        },
        "date" => {
            let s = js_str(v);
            let s = trim(&s);
            if let Some(n) = rel_day(s) {
                let today = ctx.today.clone().unwrap_or_else(|| clock().0);
                return Ok(Some(Value::Str(if n == 0 { today } else { shift_day(&today, n) })));
            }
            if s.eq_ignore_ascii_case("now") && s.len() == 3 {
                return Ok(Some(Value::Str(ctx.now.clone().unwrap_or_else(|| clock().1))));
            }
            if (is_day(s) || is_stamp(s)) && real_date(s) {
                return Ok(Some(Value::str(s)));
            }
            Err(format!("\"{}\" is not a date (YYYY-MM-DD, today, today-7, now)", s))
        }
        "bool" => {
            if let Value::Bool(b) = v {
                return Ok(Some(Value::Bool(*b)));
            }
            match js_str(v).to_lowercase().as_str() {
                "on" | "true" | "yes" | "1" => Ok(Some(Value::Bool(true))),
                "off" | "false" | "no" | "0" => Ok(Some(Value::Bool(false))),
                _ => Err(format!("\"{}\" is not on or off", js_str(v))),
            }
        }
        _ => Err(format!("unknown type {}", typ)),
    }
}

// ---------- writes ----------

/// `^[A-Za-z][\w-]*$`
fn is_name(s: &str) -> bool {
    let mut cs = s.chars();
    matches!(cs.next(), Some(c) if c.is_ascii_alphabetic()) && cs.all(|c| is_word(c) || c == '-')
}

/// `^[A-Za-z_][\w-]*$`
fn is_col(s: &str) -> bool {
    let mut cs = s.chars();
    matches!(cs.next(), Some(c) if c.is_ascii_alphabetic() || c == '_') && cs.all(|c| is_word(c) || c == '-')
}

fn text(v: Option<&Value>) -> String {
    v.and_then(Value::as_str).unwrap_or("").to_string()
}

fn fail(store: &Store, e: String) -> Written {
    Written { store: store.clone(), error: Some(e), key: None }
}

fn with(store: &Store, t: Table) -> Store {
    let mut s = store.clone();
    s.tables.insert(t.name.clone(), t);
    s
}

/// `table create`: make a table, or change an existing one's columns.
/// Columns are matched by name: kept columns keep their values (a new type
/// converts them, and what does not fit becomes empty), removed columns lose
/// theirs, new columns start empty. Rows are never dropped by a schema change.
fn create(store: &Store, op: &Value, ctx: &Ctx) -> Written {
    let name = text(op.get("name"));
    let empty = Vec::new();
    let cols = op.get("cols").and_then(Value::as_arr).unwrap_or(&empty);
    if !is_name(&name) || name.chars().count() > limits::NAME {
        return fail(store, format!("table: bad name \"{}\"", name));
    }
    if cols.is_empty() {
        return fail(store, "table create: needs at least one col:type".into());
    }
    if cols.len() > limits::COLS {
        return fail(store, format!("table create: {} columns at most", limits::COLS));
    }
    let mut seen: Vec<String> = Vec::new();
    let mut clean = Vec::new();
    for c in cols {
        let n = text(c.get("name"));
        if !is_col(&n) {
            return fail(store, format!("table create: bad column \"{}\"", n));
        }
        if n.to_lowercase() == "key" {
            return fail(store, "table create: key is the row key, not a column".into());
        }
        if seen.contains(&n.to_lowercase()) {
            return fail(store, format!("table create: column \"{}\" twice", n));
        }
        let typ = c.get("type").map(js_str).unwrap_or_else(|| "undefined".into());
        if !TYPES.contains(&typ.as_str()) || !matches!(c.get("type"), Some(Value::Str(_))) {
            return fail(store, format!("table create: \"{}\" is not text, number, date or bool", typ));
        }
        seen.push(n.to_lowercase());
        let unit = c.get("unit").filter(|u| truthy(Some(u))).map(js_str);
        clean.push(Col { name: n, typ, unit });
    }
    let Some(old) = store.tables.get(&name) else {
        if store.tables.len() >= limits::TABLES {
            return fail(store, format!("table: {} tables per agent at most", limits::TABLES));
        }
        let t = Table { name, cols: clean, rows: HashMap::new(), order: Vec::new(), next: 1 };
        return Written { store: with(store, t), error: None, key: None };
    };
    let mut t = old.clone();
    for key in &old.order {
        let row = &old.rows[key];
        let mut nxt = Map::new();
        for c in &clean {
            let Some(was) = old.cols.iter().find(|p| p.name == c.name) else { continue };
            let Some(v) = row.get(&c.name) else { continue };
            let v = if was.typ == c.typ { Ok(Some(v.clone())) } else { cell(&c.typ, v, ctx) };
            if let Ok(Some(v)) = v {
                nxt.set(&c.name, v);
            }
        }
        t.rows.insert(key.clone(), nxt);
    }
    t.cols = clean;
    Written { store: with(store, t), error: None, key: None }
}

/// `put`: upsert one row by key. With no key the store makes one (r1, r2 ...),
/// so a log can just append. `delete` takes the row out. The whole put is
/// refused when one value is wrong, so a row is never half written.
fn put(store: &Store, op: &Value, ctx: &Ctx) -> Written {
    let table = text(op.get("table"));
    let Some(t0) = store.tables.get(&table) else {
        return fail(store, format!("put: no table \"{}\"", table));
    };
    let mut key = match op.get("key") {
        None | Some(Value::Null) => None,
        Some(k) => {
            let k = js_str(k);
            if k.is_empty() || k.chars().count() > limits::KEY {
                return fail(store, format!("put: a key is 1 to {} characters", limits::KEY));
            }
            Some(k)
        }
    };
    let mut t = t0.clone();
    if truthy(op.get("delete")) {
        let Some(key) = key else {
            return fail(store, "put +delete: needs a key".into());
        };
        if !t.rows.contains_key(&key) {
            return Written { store: store.clone(), error: None, key: None };
        }
        t.rows.remove(&key);
        t.order.retain(|x| *x != key);
        return Written { store: with(store, t), error: None, key: Some(key) };
    }
    let mut vals: Vec<(String, Option<Value>)> = Vec::new();
    if let Some(values) = op.get("values").and_then(Value::as_obj) {
        for (k, v) in &values.0 {
            let Some(c) = t.cols.iter().find(|c| c.name.to_lowercase() == k.to_lowercase()) else {
                return fail(store, format!("put: {} has no column \"{}\"", table, k));
            };
            match cell(&c.typ, v, ctx) {
                Err(e) => return fail(store, format!("put: {}: {}", c.name, e)),
                Ok(v) => match vals.iter_mut().find(|(n, _)| *n == c.name) {
                    Some(slot) => slot.1 = v,
                    None => vals.push((c.name.clone(), v)),
                },
            }
        }
    }
    let key = match key.take() {
        Some(k) => k,
        None => loop {
            let k = format!("r{}", t.next);
            t.next += 1;
            if !t.rows.contains_key(&k) {
                break k;
            }
        },
    };
    let had = t.rows.contains_key(&key);
    if !had && t.order.len() >= limits::ROWS {
        return fail(store, format!("put: {} is full ({} rows)", table, limits::ROWS));
    }
    let mut row = t.rows.get(&key).cloned().unwrap_or_default();
    for (k, v) in vals {
        match v {
            None => {
                row.remove(&k);
            }
            Some(v) => row.set(&k, v),
        }
    }
    t.rows.insert(key.clone(), row);
    if !had {
        t.order.push(key.clone());
    }
    Written { store: with(store, t), error: None, key: Some(key) }
}

/// Apply one parser op (`table` or `put`) to a store. On an error the store
/// is unchanged.
pub fn write(store: &Store, op: &Value, ctx: &Ctx) -> Written {
    match op.get("op").and_then(Value::as_str) {
        Some("table") => create(store, op, ctx),
        Some("put") => put(store, op, ctx),
        _ => Written { store: store.clone(), error: None, key: None },
    }
}

/// Replays ops (anything the parser gives; only `table` and `put` count) onto
/// a store. Returns the store and the errors as (line, message).
pub fn replay(store: &Store, ops: &[Value], ctx: &Ctx) -> (Store, Vec<(Value, String)>) {
    let mut store = store.clone();
    let mut errors = Vec::new();
    for op in ops {
        if !matches!(op.get("op").and_then(Value::as_str), Some("table" | "put")) {
            continue;
        }
        let r = write(&store, op, ctx);
        if let Some(e) = r.error {
            errors.push((op.get("line").cloned().unwrap_or(Value::Null), e));
        }
        store = r.store;
    }
    (store, errors)
}

// ---------- query ----------

pub const AGGS: &[&str] = &["sum", "avg", "min", "max"];

/// Numbers by value, bools off before on, anything else as text without case.
/// Empty cells go last.
fn cmp(a: Option<&Value>, b: Option<&Value>) -> Ordering {
    let a = a.filter(|v| **v != Value::Null);
    let b = b.filter(|v| **v != Value::Null);
    match (a, b) {
        (None, None) => Ordering::Equal,
        (None, _) => Ordering::Greater,
        (_, None) => Ordering::Less,
        (Some(Value::Num(x)), Some(Value::Num(y))) => x.partial_cmp(y).unwrap_or(Ordering::Equal),
        (Some(Value::Bool(x)), Some(Value::Bool(y))) => x.cmp(y),
        (Some(x), Some(y)) => js_str(x).to_lowercase().cmp(&js_str(y).to_lowercase()),
    }
}

/// A flag (`+count`) is true, never a list: `sort` and the rest only take names.
fn as_list(v: Option<&Value>) -> Vec<String> {
    let items: Vec<String> = match v {
        None | Some(Value::Null) | Some(Value::Bool(_)) => return Vec::new(),
        Some(Value::Arr(a)) => a.iter().map(js_str).collect(),
        Some(v) => vec![js_str(v)],
    };
    items.into_iter().filter(|s| !s.is_empty()).collect()
}

fn round6(n: f64) -> f64 {
    (n * 1e6 + 0.5).floor() / 1e6
}

fn err(m: String) -> Value {
    let mut o = Map::new();
    o.set("error", Value::Str(m));
    Value::Obj(o)
}

/// `^([A-Za-z_][\w-]*)\s*(>=|<=|!=|=|>|<|~)\s*(.*)$` (dot matches all):
/// (column, op, raw value, not yet trimmed).
fn clause(w: &str) -> Option<(&str, &'static str, &str)> {
    let e = w.find(|c: char| !(is_word(c) || c == '-')).unwrap_or(w.len());
    let col = &w[..e];
    if !is_col(col) {
        return None;
    }
    let r = w[e..].trim_start_matches(is_ws);
    let op = [">=", "<=", "!=", "=", ">", "<", "~"].into_iter().find(|o| r.starts_with(o))?;
    Some((col, op, &r[op.len()..]))
}

struct Test {
    col: String,
    op: &'static str,
    /// None for an empty value (= and != test for an empty cell)
    want: Option<Value>,
    by_day: bool,
}

impl Test {
    fn holds(&self, row: &Map) -> bool {
        let v = row.get(&self.col).filter(|v| **v != Value::Null);
        let Some(want) = &self.want else {
            return v.is_none() == (self.op == "=");
        };
        let Some(v) = v else {
            return self.op == "!=";
        };
        let day;
        let v = if self.by_day {
            day = Value::Str(js_str(v).chars().take(10).collect());
            &day
        } else {
            v
        };
        if self.op == "~" {
            return js_str(v).to_lowercase().contains(want.as_str().unwrap_or(""));
        }
        let d = cmp(Some(v), Some(want));
        match self.op {
            "=" => d == Ordering::Equal,
            "!=" => d != Ordering::Equal,
            ">" => d == Ordering::Greater,
            "<" => d == Ordering::Less,
            ">=" => d != Ordering::Less,
            _ => d != Ordering::Greater,
        }
    }
}

/// An output column of an aggregate query: `from` the column it reads,
/// `agg` None for the group column.
struct Out {
    col: Col,
    from: Option<String>,
    agg: Option<&'static str>,
}

/// Runs a query's props (resolved: `resolve("query", props)`) against a store.
/// Returns {cols: [{name, type, unit?}], rows: [[...]], keys: [key|null], count}
/// or {missing: name} or {error}. `count` is the rows matched before `limit`.
pub fn query(store: &Store, props: &Map, ctx: &Ctx) -> Value {
    let name = props.get("table").cloned().unwrap_or(Value::Null);
    let Some(t) = name.as_str().and_then(|n| store.tables.get(n)) else {
        let mut o = Map::new();
        o.set("missing", name);
        return Value::Obj(o);
    };
    let col_of = |n: &str| -> Option<Col> {
        let n = n.to_lowercase();
        if n == "key" {
            return Some(Col { name: "key".into(), typ: "text".into(), unit: None });
        }
        t.cols.iter().find(|c| c.name.to_lowercase() == n).cloned()
    };

    // where: every clause must hold.
    let mut tests = Vec::new();
    for w in as_list(props.get("where")) {
        let Some((cn, op, raw)) = clause(&w) else {
            return err(format!("where: cannot read \"{}\"", w));
        };
        let Some(c) = col_of(cn) else {
            return err(format!("where: no column \"{}\"", cn));
        };
        let raw = trim(raw);
        if raw.is_empty() {
            if op != "=" && op != "!=" {
                return err(format!("where: \"{}\" needs a value", w));
            }
            tests.push(Test { col: c.name, op, want: None, by_day: false });
            continue;
        }
        let want = if op == "~" {
            Value::Str(raw.to_lowercase())
        } else {
            match cell(&c.typ, &Value::str(raw), ctx) {
                Err(e) => return err(format!("where: {}: {}", c.name, e)),
                Ok(v) => v.unwrap_or(Value::Null),
            }
        };
        // A date with no time compares by day, so Day=today holds for a stamp at 12:30 today.
        let by_day = c.typ == "date" && matches!(&want, Value::Str(s) if s.chars().count() == 10);
        tests.push(Test { col: c.name, op, want: Some(want), by_day });
    }
    let mut rows: Vec<Map> = t
        .order
        .iter()
        .map(|k| {
            let mut r = t.rows[k].clone();
            r.set("key", Value::str(k));
            r
        })
        .filter(|r| tests.iter().all(|f| f.holds(r)))
        .collect();

    // Aggregates: group=Col and sum/avg/min/max=Col|Col, +count.
    let mut keyed = true;
    let mut aggs: Vec<(&'static str, String)> = Vec::new();
    for a in AGGS {
        for n in as_list(props.get(a)) {
            aggs.push((a, n));
        }
    }
    let group = props.get("group").filter(|g| **g != Value::Null);
    let count = truthy(props.get("count"));
    let cols: Vec<Col>;
    if !aggs.is_empty() || count || group.is_some() {
        keyed = false;
        let has_group = group.is_some_and(|g| *g != Value::str(""));
        let g = if has_group { col_of(&js_str(group.unwrap())) } else { None };
        if has_group && g.is_none() {
            return err(format!("group: no column \"{}\"", js_str(group.unwrap())));
        }
        let mut out: Vec<Out> = Vec::new();
        if let Some(g) = &g {
            out.push(Out { col: g.clone(), from: Some(g.name.clone()), agg: None });
        }
        let mut used: Vec<String> = out.iter().map(|o| o.col.name.to_lowercase()).collect();
        for (a, n) in &aggs {
            let Some(c) = col_of(n) else {
                return err(format!("{}: no column \"{}\"", a, n));
            };
            if c.typ != "number" && (*a == "sum" || *a == "avg") {
                return err(format!("{}: {} is not a number column", a, c.name));
            }
            let label = if used.contains(&c.name.to_lowercase()) { format!("{} {}", a, c.name) } else { c.name.clone() };
            used.push(label.to_lowercase());
            out.push(Out { col: Col { name: label, typ: c.typ.clone(), unit: c.unit.clone() }, from: Some(c.name), agg: Some(a) });
        }
        if count {
            out.push(Out { col: Col { name: "Count".into(), typ: "number".into(), unit: None }, from: None, agg: Some("count") });
        }
        let mut groups: Vec<(String, Vec<Map>)> = Vec::new();
        for r in rows {
            let gk = match &g {
                Some(g) => crate::json::write(r.get(&g.name).unwrap_or(&Value::Null)),
                None => String::new(),
            };
            match groups.iter_mut().find(|(k, _)| *k == gk) {
                Some(slot) => slot.1.push(r),
                None => groups.push((gk, vec![r])),
            }
        }
        if g.is_none() && groups.is_empty() {
            groups.push((String::new(), Vec::new()));
        }
        let mut agg_rows = Vec::new();
        for (_, list) in &groups {
            let mut row = Map::new();
            for o in &out {
                let v = match o.agg {
                    None => list[0].get(o.from.as_deref().unwrap()).cloned().unwrap_or(Value::Null),
                    Some("count") => Value::Num(list.len() as f64),
                    Some(a) => {
                        let from = o.from.as_deref().unwrap();
                        let vs: Vec<&Value> = list.iter().filter_map(|r| r.get(from)).filter(|v| **v != Value::Null).collect();
                        if vs.is_empty() {
                            if a == "sum" { Value::Num(0.0) } else { Value::Null }
                        } else if a == "sum" || a == "avg" {
                            let total = vs.iter().fold(0.0, |s, v| s + js_number(v));
                            Value::Num(round6(if a == "sum" { total } else { total / vs.len() as f64 }))
                        } else {
                            let mut best = vs[0];
                            for v in &vs[1..] {
                                let d = cmp(Some(v), Some(best));
                                if (a == "min" && d == Ordering::Less) || (a == "max" && d == Ordering::Greater) {
                                    best = v;
                                }
                            }
                            best.clone()
                        }
                    }
                };
                row.set(&o.col.name, v);
            }
            agg_rows.push(row);
        }
        rows = agg_rows;
        cols = out.into_iter().map(|o| o.col).collect();
    } else {
        let pick = as_list(props.get("cols"));
        if pick.is_empty() {
            cols = t.cols.clone();
        } else {
            let mut picked = Vec::new();
            for n in &pick {
                match col_of(n) {
                    Some(c) => picked.push(c),
                    None => return err(format!("cols: no column \"{}\"", n)),
                }
            }
            cols = picked;
        }
    }

    // sort=Col|-Col: a minus sorts that column high to low. Empty cells go last.
    let mut sorts: Vec<(String, bool)> = Vec::new();
    for s in as_list(props.get("sort")) {
        let (desc, n) = match s.strip_prefix('-') {
            Some(n) => (true, n.to_string()),
            None => (false, s.clone()),
        };
        let c = if keyed { col_of(&n) } else { cols.iter().find(|x| x.name.to_lowercase() == n.to_lowercase()).cloned() };
        let Some(c) = c else {
            return err(format!("sort: no column \"{}\"", n));
        };
        sorts.push((c.name, desc));
    }
    if !sorts.is_empty() {
        // sort_by is stable: rows that tie keep their order.
        rows.sort_by(|x, y| {
            for (n, desc) in &sorts {
                let a = x.get(n).filter(|v| **v != Value::Null);
                let b = y.get(n).filter(|v| **v != Value::Null);
                if a.is_none() || b.is_none() {
                    if a.is_none() && b.is_none() {
                        continue;
                    }
                    return if a.is_none() { Ordering::Greater } else { Ordering::Less };
                }
                let d = cmp(a, b);
                if d != Ordering::Equal {
                    return if *desc { d.reverse() } else { d };
                }
            }
            Ordering::Equal
        });
    }
    let total = rows.len();
    let lim = match props.get("limit") {
        Some(v @ (Value::Num(_) | Value::Str(_))) if *v != Value::str("") => js_number(v),
        _ => f64::NAN,
    };
    let lim = if lim.is_finite() { lim.floor() } else { limits::LIMIT };
    let take = lim.min(limits::MAX_LIMIT).max(0.0) as usize;
    rows.truncate(take);

    let mut o = Map::new();
    o.set("cols", Value::Arr(cols.iter().map(Col::to_value).collect()));
    o.set(
        "rows",
        Value::Arr(rows.iter().map(|r| Value::Arr(cols.iter().map(|c| r.get(&c.name).cloned().unwrap_or(Value::Null)).collect())).collect()),
    );
    o.set(
        "keys",
        Value::Arr(rows.iter().map(|r| if keyed { r.get("key").cloned().unwrap_or(Value::Null) } else { Value::Null }).collect()),
    );
    o.set("count", Value::Num(total as f64));
    Value::Obj(o)
}
