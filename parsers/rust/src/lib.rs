//! Yui Lines (YL) v0 parser for Rust. Spec: spec/YL.md
//! Conformance: spec/conformance (parsers/rust/run.sh)
//! A line-for-line port of the JS reference, site/lib/yl/yl.mjs.
//! std only: no regex crate, no serde. Each JS regex is a small hand-written
//! matcher next to the code that uses it, with the regex in its comment.
//!
//! One line in, one op out. Ops are `Value::Obj` with the same keys as JS:
//!   {op: "add",   screen, preset, id, props, line}
//!   {op: "patch", screen, target, props, line}
//!   {op: "save",  screen, name, line}       save the screen under a name
//!   {op: "show",  screen, name, line}       restore a saved screen
//!   {op: "forget", screen, name, line}      take a saved screen off the shelf
//!   {op: "clear", screen, line}
//!   {op: "focus", screen, line}             bare ">2": later lines go to screen 2
//!   {op: "end",   screen, target, line}     close the open group (deck, plan, narrate)
//!   {op: "theme", screen, props, line}      restyle this agent's look
//!                                           `theme app ...`: props.scope "app", a restyle of Yui's own chrome
//!   {op: "close", screen: "full", line}     `close` or bare ">chat"
//!   {op: "talk",  screen, props: {on}, line}  `>2 talk`: page 2 keeps the composer
//!   {op: "error", screen, message, line}
//! `props` holds only what the line actually said. Defaults live in resolve().
//! An add that joins an open group (a page under a deck) also carries `in`.

pub mod json;
pub mod tables;

pub use json::{Map, Value};
use std::collections::HashMap;

pub const PRESETS: &[&str] = &[
    "timer", "ask", "choose", "pick", "slide", "form",
    "list", "table", "card", "image", "camera", "mic",
    "gallery", "video", "compare", "storyboard",
    "chart", "stat", "math", "step", "calc",
    "deck", "page", "plan", "project", "narrate",
    "timeline", "done", "now", "next",
    "sketch", "row", "after",
    "shapes", "shape",
    "game",
    "query",
];
/// A timeline's rows. A patch's `kind=` moves one to another of these.
pub const ROWS: &[&str] = &["done", "now", "next"];

/// Where the now marker sits among a timeline's row kinds, in line order:
/// before the first row that is not done, or after the last when all are done.
pub fn mark_at(kinds: &[&str]) -> usize {
    kinds.iter().position(|k| *k != "done").unwrap_or(kinds.len())
}

/// Not presets, but valid line heads.
pub const CORE: &[&str] = &["say", "custom", "save", "show", "forget", "clear", "end", "theme", "close", "talk", "menu", "put"];

/// Groups: a group head collects the lines that follow it on the same screen,
/// as long as each one is a member preset. Anything else ends the group, and
/// so does `end`. Comments, blank lines and error lines do not. A narrate
/// can hold another group (a deck), a deck or plan a sketch (a page's picture).
pub fn group_members(preset: &str) -> Option<&'static [&'static str]> {
    Some(match preset {
        "deck" => &["page", "ask", "choose", "pick", "sketch", "shapes", "math", "chart", "stat", "calc"],
        "plan" => &["page", "ask", "choose", "pick", "slide", "form", "mic", "camera", "sketch"],
        "narrate" => &["page", "compare", "image", "video", "card", "stat", "chart", "math", "storyboard", "gallery", "deck"],
        "timeline" => &["done", "now", "next"],
        "sketch" => &["row", "after"],
        "shapes" => &["shape"],
        _ => return None,
    })
}

pub const STAGE: &[&str] = &["timer", "camera", "mic", "deck", "plan", "game"];
pub const CHART_TYPES: &[&str] = &["line", "bar", "area", "scatter", "pie", "donut"];
/// Game kinds this renderer can play. Any other kind still parses.
pub const GAMES: &[&str] = &["tictactoe", "snake", "memory"];
/// Known form field types. Any other type is kept as written.
pub const FIELD_TYPES: &[&str] = &["text", "long", "voice", "number", "email", "phone", "date", "time", "yes", "photo", "url"];
pub const MAX_PAGE: u32 = 12;

// ---------- JS compatibility ----------
// The reference is JavaScript, so whitespace, digits and "trim" follow JS
// rules: \d and \w are ASCII, \s is the JS whitespace set, "." is anything
// but a line terminator.

fn is_ws(c: char) -> bool {
    matches!(c, '\t' | '\n' | '\u{b}' | '\u{c}' | '\r' | ' ' | '\u{a0}' | '\u{1680}' | '\u{2000}'..='\u{200a}'
        | '\u{2028}' | '\u{2029}' | '\u{202f}' | '\u{205f}' | '\u{3000}' | '\u{feff}')
}
fn is_line_end(c: char) -> bool {
    matches!(c, '\n' | '\r' | '\u{2028}' | '\u{2029}')
}
fn trim(s: &str) -> &str {
    s.trim_matches(is_ws)
}
fn is_word(c: char) -> bool {
    c.is_ascii_alphanumeric() || c == '_'
}
/// `^[\w-]+$`
fn is_word_run(s: &str) -> bool {
    !s.is_empty() && s.chars().all(|c| is_word(c) || c == '-')
}
/// `^[a-z_][\w-]*$` with the i flag
fn is_ident(s: &str) -> bool {
    let mut cs = s.chars();
    matches!(cs.next(), Some(c) if c.is_ascii_alphabetic() || c == '_') && cs.all(|c| is_word(c) || c == '-')
}
/// `^[a-z]+$` (no i flag)
fn is_lower(s: &str) -> bool {
    !s.is_empty() && s.bytes().all(|b| b.is_ascii_lowercase())
}
fn char_at(s: &str, i: usize) -> Option<char> {
    s.get(i..).and_then(|r| r.chars().next())
}
/// Past a run of whitespace at `i`.
fn skip_ws(s: &str, mut i: usize) -> usize {
    while let Some(c) = char_at(s, i).filter(|c| is_ws(*c)) {
        i += c.len_utf8();
    }
    i
}

/// JS `String(v)` for the values props can hold.
pub fn js_str(v: &Value) -> String {
    match v {
        Value::Null => "null".into(),
        Value::Bool(b) => b.to_string(),
        Value::Num(n) => json::number_string(*n),
        Value::Str(s) => s.clone(),
        Value::Arr(a) => a.iter().map(|x| if *x == Value::Null { String::new() } else { js_str(x) }).collect::<Vec<_>>().join(","),
        Value::Obj(_) => "[object Object]".into(),
    }
}

/// JS ToNumber.
pub fn js_number(v: &Value) -> f64 {
    match v {
        Value::Null => 0.0,
        Value::Bool(b) => *b as u8 as f64,
        Value::Num(n) => *n,
        Value::Arr(_) | Value::Obj(_) => str_to_number(&js_str(v)),
        Value::Str(s) => str_to_number(s),
    }
}

/// JS ToNumber of a string: decimal, 0x/0o/0b, Infinity, or NaN.
fn str_to_number(s: &str) -> f64 {
    let t = trim(s);
    if t.is_empty() {
        return 0.0;
    }
    for (p, radix) in [("0x", 16), ("0X", 16), ("0o", 8), ("0O", 8), ("0b", 2), ("0B", 2)] {
        if let Some(d) = t.strip_prefix(p) {
            if d.is_empty() || !d.chars().all(|c| c.is_digit(radix)) {
                return f64::NAN;
            }
            return d.chars().fold(0.0, |a, c| a * radix as f64 + c.to_digit(radix).unwrap() as f64);
        }
    }
    let (sign, u) = match t.as_bytes()[0] {
        b'-' => (-1.0, &t[1..]),
        b'+' => (1.0, &t[1..]),
        _ => (1.0, t),
    };
    if u == "Infinity" {
        return sign * f64::INFINITY;
    }
    // [digits][.digits][e[+-]digits], with at least one digit in the mantissa
    let b = u.as_bytes();
    let mut j = 0;
    let mut mant = 0;
    while j < b.len() && b[j].is_ascii_digit() {
        j += 1;
        mant += 1;
    }
    if j < b.len() && b[j] == b'.' {
        j += 1;
        while j < b.len() && b[j].is_ascii_digit() {
            j += 1;
            mant += 1;
        }
    }
    if mant == 0 {
        return f64::NAN;
    }
    if j < b.len() && (b[j] == b'e' || b[j] == b'E') {
        j += 1;
        if j < b.len() && (b[j] == b'+' || b[j] == b'-') {
            j += 1;
        }
        let k = j;
        while j < b.len() && b[j].is_ascii_digit() {
            j += 1;
        }
        if j == k {
            return f64::NAN;
        }
    }
    if j != b.len() {
        return f64::NAN;
    }
    sign * u.parse::<f64>().unwrap_or(f64::NAN)
}

/// JS truthiness.
fn truthy(v: Option<&Value>) -> bool {
    match v {
        None | Some(Value::Null) => false,
        Some(Value::Bool(b)) => *b,
        Some(Value::Num(n)) => *n != 0.0 && !n.is_nan(),
        Some(Value::Str(s)) => !s.is_empty(),
        Some(_) => true,
    }
}

/// JS `Number(s)` of a numeric literal a matcher already vetted.
fn num(s: &str) -> f64 {
    s.parse::<f64>().unwrap()
}

// ---------- number matchers ----------

/// End of `\d+` at `i`, or None when there is no digit.
fn digits(b: &[u8], i: usize) -> Option<usize> {
    let mut j = i;
    while j < b.len() && b[j].is_ascii_digit() {
        j += 1;
    }
    (j > i).then_some(j)
}

/// End of `-?\d+(?:\.\d+)?` at `i`, greedy (every regex here that uses it
/// is followed by something a digit or "." cannot start, so greedy is the
/// only way it can match).
fn number_end(b: &[u8], i: usize) -> Option<usize> {
    let mut j = i;
    if b.get(j) == Some(&b'-') {
        j += 1;
    }
    let mut j = digits(b, j)?;
    if b.get(j) == Some(&b'.') {
        if let Some(k) = digits(b, j + 1) {
            j = k;
        }
    }
    Some(j)
}

/// `^-?\d+(\.\d+)?$`
fn is_num(s: &str) -> bool {
    number_end(s.as_bytes(), 0) == Some(s.len())
}

/// `^(-?\d+(?:\.\d+)?)-(-?\d+(?:\.\d+)?)$`
fn range(s: &str) -> Option<(f64, f64)> {
    let b = s.as_bytes();
    let a = number_end(b, 0)?;
    if b.get(a) != Some(&b'-') {
        return None;
    }
    let e = number_end(b, a + 1)?;
    (e == b.len()).then(|| (num(&s[..a]), num(&s[a + 1..])))
}

/// End of DUR, `\d+(?::\d{1,2})?(?:\.\d+)?[smh]?`, at `i`.
fn dur_end(b: &[u8], i: usize) -> Option<usize> {
    let mut j = digits(b, i)?;
    if b.get(j) == Some(&b':') && b.get(j + 1).is_some_and(|c| c.is_ascii_digit()) {
        j += 2;
        if b.get(j).is_some_and(|c| c.is_ascii_digit()) {
            j += 1;
        }
    }
    if b.get(j) == Some(&b'.') {
        if let Some(k) = digits(b, j + 1) {
            j = k;
        }
    }
    if matches!(b.get(j), Some(b's' | b'm' | b'h')) {
        j += 1;
    }
    Some(j)
}

/// TIMESPEC, `^DUR(?:\/DUR)?(?:x(\d+))?$`: (work, rest, rounds).
fn timespec(s: &str) -> Option<(&str, Option<&str>, Option<&str>)> {
    let b = s.as_bytes();
    let w = dur_end(b, 0)?;
    let mut j = w;
    let mut rest = None;
    if b.get(j) == Some(&b'/') {
        if let Some(e) = dur_end(b, j + 1) {
            rest = Some(&s[j + 1..e]);
            j = e;
        }
    }
    let mut rounds = None;
    if b.get(j) == Some(&b'x') {
        if let Some(e) = digits(b, j + 1) {
            rounds = Some(&s[j + 1..e]);
            j = e;
        }
    }
    (j == b.len()).then_some((&s[..w], rest, rounds))
}

/// `seconds("1:30") == 90`, `seconds("2m") == 120`, else None.
/// `^(\d+)(?::(\d{1,2}))?(\.\d+)?([smh]?)$` on `String(s)`.
pub fn seconds(v: &Value) -> Option<f64> {
    let s = js_str(v);
    let b = s.as_bytes();
    let a = digits(b, 0)?;
    let mut j = a;
    let mut mm = None;
    if b.get(j) == Some(&b':') && b.get(j + 1).is_some_and(|c| c.is_ascii_digit()) {
        let k = if b.get(j + 2).is_some_and(|c| c.is_ascii_digit()) { j + 3 } else { j + 2 };
        mm = Some(&s[j + 1..k]);
        j = k;
    }
    let f = j;
    if b.get(j) == Some(&b'.') {
        if let Some(k) = digits(b, j + 1) {
            j = k;
        }
    }
    let frac = &s[f..j];
    let unit = b.get(j).copied().filter(|c| matches!(c, b's' | b'm' | b'h'));
    if unit.is_some() {
        j += 1;
    }
    if j != b.len() {
        return None;
    }
    if let Some(mm) = mm {
        return Some(num(&s[..a]) * 60.0 + num(mm));
    }
    let v = num(&format!("{}{}", &s[..a], frac));
    Some(match unit {
        Some(b'm') => v * 60.0,
        Some(b'h') => v * 3600.0,
        _ => v,
    })
}

fn coerce(v: &str) -> Value {
    if is_num(v) {
        Value::Num(num(v))
    } else if v == "on" || v == "true" {
        Value::Bool(true)
    } else if v == "off" || v == "false" {
        Value::Bool(false)
    } else {
        Value::str(v)
    }
}

// ---------- tokenizer ----------

/// A token is a run of non-space characters in which double-quoted segments
/// may contain spaces.
#[derive(Clone, Debug, PartialEq)]
pub struct Token {
    /// the exact source text
    pub raw: String,
    /// the text with quotes removed
    pub text: String,
    /// true when the whole token was one quoted string
    pub quoted: bool,
    /// segments split on "|" outside quotes (None when there is no "|")
    pub parts: Option<Vec<String>>,
    /// set when the token is key=value (key must be an identifier)
    pub key: Option<String>,
    /// the unquoted text after "=", or its parts when it has "|"
    pub value: Vec<String>,
    /// per value part, true when that part held a quoted string
    /// (quoted values stay text: cta="5" is the string "5")
    pub vquoted: Vec<bool>,
}

pub fn tokenize(line: &str) -> Vec<Token> {
    let cs: Vec<char> = line.chars().collect();
    let n = cs.len();
    let mut tokens = Vec::new();
    let mut i = 0;
    while i < n {
        while i < n && is_ws(cs[i]) {
            i += 1;
        }
        if i >= n {
            break;
        }
        // Comment: a "#" that starts a token and is followed by space or EOL.
        if cs[i] == '#' && (i + 1 >= n || is_ws(cs[i + 1])) {
            break;
        }
        let start = i;
        let mut segs = vec![String::new()];
        let mut seg_q = vec![false]; // per segment: held a quoted string
        let mut any_quote = false;
        let mut whole_quoted = cs[i] == '"';
        let mut eq_at: Option<usize> = None; // byte index into segs[0] where "=" appeared, outside quotes
        while i < n && !is_ws(cs[i]) {
            let c = cs[i];
            if c == '"' {
                any_quote = true;
                *seg_q.last_mut().unwrap() = true;
                i += 1;
                while i < n && cs[i] != '"' {
                    if cs[i] == '\\' && i + 1 < n {
                        segs.last_mut().unwrap().push(cs[i + 1]);
                        i += 2;
                        continue;
                    }
                    segs.last_mut().unwrap().push(cs[i]);
                    i += 1;
                }
                i += 1; // closing quote (or EOL for an unterminated string)
                if i < n && !is_ws(cs[i]) {
                    whole_quoted = false;
                }
                continue;
            }
            if c == '|' {
                segs.push(String::new());
                seg_q.push(false);
                whole_quoted = false;
                i += 1;
                continue;
            }
            if c == '=' && eq_at.is_none() && segs.len() == 1 && !any_quote && is_ident(&segs[0]) {
                eq_at = Some(segs[0].len());
            }
            segs.last_mut().unwrap().push(c);
            i += 1;
        }
        let raw: String = cs[start..i.min(n)].iter().collect();
        let mut t = Token {
            raw,
            text: segs.join("|"),
            quoted: whole_quoted && segs.len() == 1,
            parts: (segs.len() > 1).then(|| segs.clone()),
            key: None,
            value: Vec::new(),
            vquoted: Vec::new(),
        };
        if let Some(at) = eq_at {
            t.key = Some(segs[0][..at].to_string());
            t.value = std::iter::once(segs[0][at + 1..].to_string()).chain(segs[1..].iter().cloned()).collect();
            t.vquoted = seg_q;
            t.parts = None;
        }
        tokens.push(t);
    }
    tokens
}

// ---------- value helpers ----------

/// Keys whose values are never typed: a quiz answer is compared with option
/// text, so answer=4 and answer=on stay "4" and "on".
const TEXT_KEYS: &[&str] = &["answer"];

/// `^\+[a-z][\w-]*$` with the i flag
fn is_flag(s: &str) -> bool {
    s.strip_prefix('+').is_some_and(|r| is_ident(r) && !r.starts_with('_'))
}

/// Splits tokens into key/values, +flags and positionals.
fn split(tokens: &[Token]) -> (Map, Map, Vec<&Token>) {
    let mut kv = Map::new();
    let mut flags = Map::new();
    let mut pos = Vec::new();
    for t in tokens {
        if let Some(key) = &t.key {
            // In JS, kv.__proto__ = x sets the prototype: the key never lands.
            if key == "__proto__" {
                continue;
            }
            let many = t.value.len() > 1;
            let v = if TEXT_KEYS.contains(&key.as_str()) {
                if many { Value::strs(&t.value) } else { Value::str(&t.value[0]) }
            } else if many {
                Value::Arr(t.value.iter().enumerate().map(|(i, v)| if t.vquoted[i] { Value::str(v) } else { coerce(v) }).collect())
            } else if t.vquoted[0] {
                Value::str(&t.value[0])
            } else {
                coerce(&t.value[0])
            };
            kv.set(key, v);
        } else if !t.quoted && t.parts.is_none() && is_flag(&t.raw) {
            flags.set(&t.raw[1..], Value::Bool(true));
        } else {
            pos.push(t);
        }
    }
    (kv, flags, pos)
}

fn join_text(toks: &[&Token]) -> String {
    toks.iter().map(|t| t.text.as_str()).collect::<Vec<_>>().join(" ")
}

/// Media: a URL is a token starting http://, https://, / or data:.
fn is_url(s: &str) -> bool {
    s.starts_with("http://") || s.starts_with("https://") || s.starts_with('/') || s.starts_with("data:")
}

/// A media token is a URL with an optional caption after the first "|":
/// /a.jpg, /a.jpg|Caption, "/a.jpg|Two words" or /a.jpg|"Two words".
fn media_token(t: &Token) -> Option<(String, String)> {
    let one = [t.text.clone()];
    let segs: &[String] = t.parts.as_deref().unwrap_or(&one);
    if !is_url(&segs[0]) {
        return None;
    }
    if let Some(i) = segs[0].find('|').filter(|i| *i > 0) {
        return Some((segs[0][..i].to_string(), segs[0][i + 1..].to_string()));
    }
    Some((segs[0].clone(), if segs.len() > 1 { segs[1..].join("|") } else { String::new() }))
}

/// Positionals of a media set: URLs become items, any other text is the title.
fn media_set(pos: &[&Token], items_key: &str, caps_key: &str) -> Map {
    let mut o = Map::new();
    let (mut items, mut caps, mut title) = (Vec::new(), Vec::new(), Vec::new());
    for t in pos {
        match media_token(t) {
            Some((src, cap)) => {
                items.push(src);
                caps.push(cap);
            }
            None => title.push(*t),
        }
    }
    if !title.is_empty() {
        o.set("title", Value::Str(join_text(&title)));
    }
    if !items.is_empty() {
        o.set(items_key, Value::strs(&items));
    }
    if caps.iter().any(|c| !c.is_empty()) {
        o.set(caps_key, Value::strs(&caps));
    }
    o
}

fn clean(mut o: Map) -> Map {
    o.0.retain(|(_, v)| !matches!(v, Value::Arr(a) if a.is_empty()));
    o
}

// ---------- presets ----------
// Each takes positionals and returns explicit props. Key/values and flags are
// merged on top by parse_args, so any prop can also be set as key=value.

fn timer(pos: &[&Token]) -> Map {
    let mut o = Map::new();
    let mut rest = Vec::new();
    for t in pos {
        let m = if !t.quoted && !o.has("work") { timespec(&t.text) } else { None };
        match m {
            Some((w, r, x)) => {
                o.set("work", Value::Num(seconds(&Value::str(w)).unwrap()));
                if let Some(r) = r {
                    o.set("rest", Value::Num(seconds(&Value::str(r)).unwrap()));
                }
                if let Some(x) = x {
                    o.set("rounds", Value::Num(num(x)));
                }
            }
            None => rest.push(*t),
        }
    }
    if !rest.is_empty() {
        o.set("label", Value::Str(join_text(&rest)));
    }
    o
}

fn ask(pos: &[&Token]) -> Map {
    let mut o = Map::new();
    let mut q: Vec<&Token> = Vec::new();
    for t in pos {
        match &t.parts {
            Some(p) if !o.has("options") => o.set("options", Value::strs(p)),
            _ => q.push(*t),
        }
    }
    // Loose options (section 4, ask): with no options token, two or more
    // quoted tokens at the end, after at least one question token, are the options.
    if !o.has("options") {
        let mut k = q.len();
        while k > 1 && q[k - 1].quoted {
            k -= 1;
        }
        if q.len() - k >= 2 {
            o.set("options", Value::Arr(q[k..].iter().map(|t| Value::str(&t.text)).collect()));
            q.truncate(k);
        }
    }
    if !q.is_empty() {
        o.set("q", Value::Str(join_text(&q)));
    }
    o
}

fn slide(pos: &[&Token]) -> Map {
    let mut o = Map::new();
    let mut label = Vec::new();
    for t in pos {
        let m = if !t.quoted && !o.has("min") { range(&t.text) } else { None };
        if let Some((lo, hi)) = m {
            o.set("min", Value::Num(lo));
            o.set("max", Value::Num(hi));
        } else if t.parts.as_ref().is_some_and(|p| p.len() == 2) && !truthy(o.get("lo")) {
            let p = t.parts.as_ref().unwrap();
            o.set("lo", Value::str(&p[0]));
            o.set("hi", Value::str(&p[1]));
        } else {
            label.push(*t);
        }
    }
    if !label.is_empty() {
        o.set("label", Value::Str(join_text(&label)));
    }
    o
}

fn form(pos: &[&Token]) -> Map {
    let mut fields = Vec::new();
    let mut title = Vec::new();
    for t in pos {
        match field(t) {
            Some(f) => fields.push(Value::Obj(f)),
            None => title.push(*t),
        }
    }
    let mut o = Map::new();
    o.set("fields", Value::Arr(fields));
    if !title.is_empty() {
        o.set("title", Value::Str(join_text(&title)));
    }
    o
}

fn list(pos: &[&Token]) -> Map {
    let mut title = None;
    let mut items: Vec<String> = Vec::new();
    for t in pos {
        if title.is_none() && items.is_empty() && !t.quoted && t.parts.is_none() {
            title = Some(t.text.clone());
            continue;
        }
        match &t.parts {
            Some(p) => items.extend(p.iter().cloned()),
            None => items.push(t.text.clone()),
        }
    }
    let mut o = Map::new();
    o.set("items", Value::strs(&items));
    if let Some(title) = title {
        o.set("title", Value::Str(title));
    }
    o
}

fn table(pos: &[&Token]) -> Map {
    let mut name = None;
    let mut cols: Option<Vec<String>> = None;
    let mut rows = Vec::new();
    for t in pos {
        if name.is_none() && cols.is_none() && t.parts.is_none() && !t.quoted {
            name = Some(t.text.clone());
            continue;
        }
        let cells: Vec<String> = match &t.parts {
            Some(p) => p.clone(),
            None => t.text.split('|').map(String::from).collect(),
        };
        if cols.is_none() {
            cols = Some(cells);
        } else {
            rows.push(Value::Arr(cells.iter().map(|c| coerce(c)).collect()));
        }
    }
    let mut o = Map::new();
    o.set("rows", Value::Arr(rows));
    if let Some(name) = name {
        o.set("name", Value::Str(name));
    }
    if let Some(cols) = cols {
        o.set("cols", Value::strs(&cols));
    }
    o
}

fn card(pos: &[&Token]) -> Map {
    let mut o = Map::new();
    if let Some(t) = pos.first() {
        o.set("title", Value::str(&t.text));
    }
    if pos.len() > 1 {
        o.set("body", Value::Str(join_text(&pos[1..])));
    }
    o
}

fn image(pos: &[&Token]) -> Map {
    let mut o = Map::new();
    let mut cap = Vec::new();
    for t in pos {
        if !o.has("src") && is_url(&t.text) {
            o.set("src", Value::str(&t.text));
        } else {
            cap.push(*t);
        }
    }
    if !cap.is_empty() {
        let k = if o.has("src") { "caption" } else { "prompt" };
        o.set(k, Value::Str(join_text(&cap)));
    }
    o
}

fn camera(pos: &[&Token]) -> Map {
    let mut o = Map::new();
    let mut q = Vec::new();
    for t in pos {
        if !t.quoted && (t.text == "front" || t.text == "back") {
            o.set("facing", Value::str(&t.text));
        } else {
            q.push(*t);
        }
    }
    if !q.is_empty() {
        o.set("prompt", Value::Str(join_text(&q)));
    }
    o
}

/// One key holding all the positional text, when there is any.
fn all_text(pos: &[&Token], key: &str) -> Map {
    let mut o = Map::new();
    if !pos.is_empty() {
        o.set(key, Value::Str(join_text(pos)));
    }
    o
}

fn compare(pos: &[&Token]) -> Map {
    let mut o = Map::new();
    let mut title = Vec::new();
    for t in pos {
        if !o.has("after") && t.parts.is_none() && is_url(&t.text) {
            let k = if o.has("before") { "after" } else { "before" };
            o.set(k, Value::str(&t.text));
        } else {
            title.push(*t);
        }
    }
    if !title.is_empty() {
        o.set("title", Value::Str(join_text(&title)));
    }
    o
}

/// chart [type] [title...]: the first bare chart type is the type, other
/// text is the title. Data rides on x=, y=, y2= ... or data=<table>.
fn chart(pos: &[&Token]) -> Map {
    let mut o = Map::new();
    let mut title = Vec::new();
    for t in pos {
        if !o.has("type") && !t.quoted && t.parts.is_none() && CHART_TYPES.contains(&t.text.as_str()) {
            o.set("type", Value::str(&t.text));
        } else {
            title.push(*t);
        }
    }
    if !title.is_empty() {
        o.set("title", Value::Str(join_text(&title)));
    }
    o
}

/// stat VALUE [label...]: the first quantity (72.5kg, 12%, $40, -3) is the
/// value and its unit; with no quantity the first token is the value as text.
fn stat(pos: &[&Token]) -> Map {
    let mut o = Map::new();
    let mut label: Vec<&Token> = Vec::new();
    for t in pos {
        let q = if !o.has("value") && !t.quoted && t.parts.is_none() { quantity_str(&t.text) } else { None };
        match q {
            Some((v, unit)) => {
                o.set("value", Value::Num(v));
                if let Some(u) = unit {
                    o.set("unit", Value::Str(u));
                }
            }
            None => label.push(*t),
        }
    }
    if !o.has("value") && !label.is_empty() {
        o.set("value", Value::str(&label.remove(0).text));
    }
    if !label.is_empty() {
        o.set("label", Value::Str(join_text(&label)));
    }
    o
}

/// step and page: the first URL (not a "|" token) is `img`.
fn split_img<'a>(pos: &[&'a Token], o: &mut Map) -> Vec<&'a Token> {
    let mut text = Vec::new();
    for t in pos {
        if !o.has("img") && t.parts.is_none() && is_url(&t.text) {
            o.set("img", Value::str(&t.text));
        } else {
            text.push(*t);
        }
    }
    text
}

/// step text... [$ TEX]: the TeX part is split off raw in step_args.
fn step(pos: &[&Token]) -> Map {
    let mut o = Map::new();
    let text = split_img(pos, &mut o);
    if !text.is_empty() {
        o.set("text", Value::Str(join_text(&text)));
    }
    o
}

/// page title [body...] [URL]: the first URL is img, the first text token
/// the title, the rest the body (as in card).
fn page(pos: &[&Token]) -> Map {
    let mut o = Map::new();
    let text = split_img(pos, &mut o);
    if let Some(t) = text.first() {
        o.set("title", Value::str(&t.text));
    }
    if text.len() > 1 {
        o.set("body", Value::Str(join_text(&text[1..])));
    }
    o
}

/// done / now / next text... [https://link]: the first https token is the
/// row's url, the rest its text.
fn timeline_row(pos: &[&Token]) -> Map {
    let mut o = Map::new();
    let mut text = Vec::new();
    for t in pos {
        if !o.has("url") && t.parts.is_none() && !t.quoted && t.text.starts_with("https://") {
            o.set("url", Value::str(&t.text));
        } else {
            text.push(*t);
        }
    }
    if !text.is_empty() {
        o.set("text", Value::Str(join_text(&text)));
    }
    o
}

/// `^[a-z][a-z0-9_-]*$` with the i flag
fn is_game_word(s: &str) -> bool {
    let mut cs = s.chars();
    matches!(cs.next(), Some(c) if c.is_ascii_alphabetic()) && cs.all(|c| c.is_ascii_alphanumeric() || c == '_' || c == '-')
}

/// game KIND [title...]: the first bare word (not quoted, not options) is
/// the kind, wherever it sits; the rest is the title.
/// shape KIND [label...] the same way, with `rest` "label".
fn game(pos: &[&Token], rest: &str) -> Map {
    let mut o = Map::new();
    let mut text = Vec::new();
    for t in pos {
        if !o.has("kind") && t.parts.is_none() && !t.quoted && is_game_word(&t.text) {
            o.set("kind", Value::str(&t.text));
        } else {
            text.push(*t);
        }
    }
    if !text.is_empty() {
        o.set(rest, Value::Str(join_text(&text)));
    }
    o
}

pub const QUERY_VIEWS: &[&str] = &["table", "list", "chart", "stat", "send"];

/// query <table> [as table|list|chart|stat|send] [chart type] [title...]
/// (spec/TABLES.md). The first bare word is the table, `as` picks the view.
fn query(pos: &[&Token]) -> Map {
    let mut o = Map::new();
    let mut rest = Vec::new();
    let bare = |t: Option<&&Token>| t.is_some_and(|t| !t.quoted && t.parts.is_none());
    let mut i = 0;
    while i < pos.len() {
        let t = pos[i];
        let nxt = pos.get(i + 1);
        if !o.has("table") && bare(Some(&t)) {
            o.set("table", Value::str(&t.text));
        } else if bare(Some(&t)) && t.text == "as" && bare(nxt) && QUERY_VIEWS.contains(&nxt.unwrap().text.as_str()) {
            i += 1;
            let view = pos[i].text.clone();
            let after = pos.get(i + 1);
            let chart = view == "chart";
            o.set("as", Value::Str(view));
            if chart && bare(after) && CHART_TYPES.contains(&after.unwrap().text.as_str()) {
                i += 1;
                o.set("type", Value::str(&pos[i].text));
            }
        } else {
            rest.push(t);
        }
        i += 1;
    }
    if !rest.is_empty() {
        o.set("title", Value::Str(join_text(&rest)));
    }
    o
}

fn preset_props(preset: &str, pos: &[&Token]) -> Map {
    match preset {
        "timer" => timer(pos),
        "ask" | "choose" | "pick" => ask(pos),
        "slide" => slide(pos),
        "form" => form(pos),
        "list" => list(pos),
        "table" => table(pos),
        "card" | "project" => card(pos),
        "image" | "video" => image(pos),
        "camera" => camera(pos),
        "mic" => all_text(pos, "prompt"),
        "say" => {
            let mut o = Map::new();
            o.set("text", Value::Str(join_text(pos)));
            o
        }
        // theme [named set] key=value...: the positional text is the set's name.
        "theme" => all_text(pos, "name"),
        "gallery" => media_set(pos, "items", "caps"),
        "compare" => compare(pos),
        "storyboard" => media_set(pos, "frames", "notes"),
        "chart" => chart(pos),
        "stat" => stat(pos),
        "step" => step(pos),
        "calc" | "deck" | "plan" | "narrate" | "timeline" | "sketch" | "shapes" => all_text(pos, "title"),
        "shape" => game(pos, "label"),
        "page" => page(pos),
        "done" | "now" | "next" => timeline_row(pos),
        "row" => all_text(pos, "text"),
        "after" => all_text(pos, "label"),
        "game" => game(pos, "title"),
        "query" => query(pos),
        _ => Map::new(),
    }
}

// ---------- quantities ----------

/// The tail of QTY and VAR_RANGE after the number: `\s*(UNIT)?$`, where a
/// unit is one char `first` accepts, then `[^\s]*`. Some(unit) on a match.
fn unit_tail(s: &str, first: fn(char) -> bool) -> Option<Option<String>> {
    let j = skip_ws(s, 0);
    let rest = &s[j..];
    let Some(c) = rest.chars().next() else { return Some(None) };
    (first(c) && !rest.chars().any(is_ws)).then(|| Some(rest.to_string()))
}

/// Quantity: a number with an optional unit stuck to it. 72.5kg, 9.81m/s^2,
/// 37.2degC, 12%, 3e8m/s, $40. A unit starts with a non-digit. The currency
/// signs $ € £ ¥ may lead instead.
/// `^([$€£¥])?(-?\d+(?:\.\d+)?(?:[eE]-?\d+)?)\s*([^\d\s.,+\-|=][^\s]*)?$`
pub fn quantity(v: &Value) -> Option<Map> {
    let (value, unit) = match v {
        Value::Num(n) => (*n, None),
        _ => quantity_str(&js_str(v))?,
    };
    let mut q = Map::new();
    q.set("value", Value::Num(value));
    if let Some(u) = unit {
        q.set("unit", Value::Str(u));
    }
    Some(q)
}

fn quantity_str(s: &str) -> Option<(f64, Option<String>)> {
    let cur = s.chars().next().filter(|c| matches!(c, '$' | '€' | '£' | '¥'));
    let i = cur.map_or(0, |c| c.len_utf8());
    let b = s.as_bytes();
    let mut j = i;
    if b.get(j) == Some(&b'-') {
        j += 1;
    }
    let mut j = digits(b, j)?;
    if b.get(j) == Some(&b'.') {
        if let Some(k) = digits(b, j + 1) {
            j = k;
        }
    }
    // The exponent is the one place a shorter match can win: 5e12.5 is 5
    // with the unit "e12.5".
    let mut ends = Vec::new();
    if matches!(b.get(j), Some(b'e' | b'E')) {
        let k = if b.get(j + 1) == Some(&b'-') { j + 2 } else { j + 1 };
        if let Some(e) = digits(b, k) {
            ends.push(e);
        }
    }
    ends.push(j);
    for end in ends {
        let unit_start = |c: char| !c.is_ascii_digit() && !is_ws(c) && !".,+-|=".contains(c);
        if let Some(unit) = unit_tail(&s[end..], unit_start) {
            if cur.is_some() && unit.is_some() {
                return None;
            }
            return Some((num(&s[i..end]), cur.map(String::from).or(unit)));
        }
    }
    None
}

/// calc variable: min-max[@value][unit] is a slider, a quantity is a constant.
/// `^(-?\d+(?:\.\d+)?)-(-?\d+(?:\.\d+)?)(?:@(-?\d+(?:\.\d+)?))?\s*([^\d\s][^\s]*)?$`
pub fn calc_var(v: &Value) -> Option<Map> {
    match v {
        Value::Num(n) => {
            let mut o = Map::new();
            o.set("value", Value::Num(*n));
            Some(o)
        }
        Value::Str(s) => var_range(trim(s)).or_else(|| quantity(&Value::str(trim(s)))),
        _ => None,
    }
}

fn var_range(s: &str) -> Option<Map> {
    let b = s.as_bytes();
    let a = number_end(b, 0)?;
    if b.get(a) != Some(&b'-') {
        return None;
    }
    let e = number_end(b, a + 1)?;
    let (min, max) = (num(&s[..a]), num(&s[a + 1..e]));
    let mut tries: Vec<(usize, Option<f64>)> = Vec::new();
    if b.get(e) == Some(&b'@') {
        if let Some(k) = number_end(b, e + 1) {
            tries.push((k, Some(num(&s[e + 1..k]))));
        }
    }
    tries.push((e, None));
    for (end, at) in tries {
        if let Some(unit) = unit_tail(&s[end..], |c| !c.is_ascii_digit() && !is_ws(c)) {
            let mut o = Map::new();
            o.set("min", Value::Num(min));
            o.set("max", Value::Num(max));
            o.set("value", Value::Num(at.unwrap_or((min + max) / 2.0)));
            if let Some(u) = unit {
                o.set("unit", Value::Str(u));
            }
            return Some(o);
        }
    }
    None
}

const CALC_PROPS: &[&str] = &["title", "f", "plot", "unit", "digits"];

/// A y value with an error: 12.5±0.4 or 12.5+-0.4.
/// `^(-?\d+(?:\.\d+)?)(?:±|\+-)(\d+(?:\.\d+)?)$`
fn plus_minus(s: &str) -> Option<(f64, f64)> {
    let b = s.as_bytes();
    let a = number_end(b, 0)?;
    let rest = &s[a..];
    let k = if rest.starts_with('±') {
        a + '±'.len_utf8()
    } else if rest.starts_with("+-") {
        a + 2
    } else {
        return None;
    };
    if b.get(k) == Some(&b'-') {
        return None;
    }
    let e = number_end(b, k)?;
    (e == b.len()).then(|| (num(&s[..a]), num(&s[k..])))
}

/// Props that are always lists. A plain value, quoted or not, is split on "|",
/// so notes="Hook|Problem|CTA" and notes=Hook|Problem|CTA are the same.
fn list_props(preset: &str) -> &'static [&'static str] {
    match preset {
        "gallery" => &["items", "caps"],
        "storyboard" => &["frames", "notes"],
        "compare" => &["notes", "labels"],
        "chart" => &["names", "color"],
        "table" => &["units"],
        "page" => &["points"],
        "project" => &["facts", "next"],
        "pick" => &["answer"],
        "game" => &["items"],
        "shape" => &["pts"],
        "query" => &["where", "sort", "cols", "y", "sum", "avg", "min", "max", "names", "color"],
        _ => &[],
    }
}

fn as_list(v: &Value) -> Value {
    match v {
        Value::Arr(a) => Value::Arr(a.iter().map(|x| Value::Str(js_str(x))).collect()),
        _ => Value::Arr(js_str(v).split('|').map(Value::str).collect()),
    }
}

/// Highlight boxes: hl=x,y,w,h|x,y,w,h in percent of the image. A box that is
/// not four numbers is dropped.
fn boxes(v: &Value) -> Value {
    let list: Vec<String> = match v {
        Value::Arr(a) => a.iter().map(js_str).collect(),
        _ => js_str(v).split('|').map(String::from).collect(),
    };
    let mut out = Vec::new();
    for b in list {
        let n: Vec<&str> = b.split(',').map(trim).collect();
        if n.len() == 4 && n.iter().all(|x| is_num(x)) {
            out.push(Value::Arr(n.iter().map(|x| Value::Num(num(x))).collect()));
        }
    }
    Value::Arr(out)
}

/// Tic-tac-toe cells: x=5|1 o=9. Always a list of numbers; a part that is
/// not a number is dropped, so x=5 is [5] and x= is dropped (empty lists are).
fn cell_list(v: &Value) -> Value {
    let one = [v.clone()];
    let list: &[Value] = match v {
        Value::Arr(a) => a,
        _ => &one,
    };
    Value::Arr(
        list.iter()
            .filter_map(|c| match c {
                Value::Num(n) => Some(Value::Num(*n)),
                Value::Str(s) if is_num(s) => Some(Value::Num(num(s))),
                _ => None,
            })
            .collect(),
    )
}

fn normalize(preset: &str, mut o: Map) -> Map {
    for k in list_props(preset) {
        if let Some(v) = o.get(k).filter(|v| **v != Value::Bool(true)) {
            let l = as_list(v);
            o.set(k, l);
        }
    }
    if preset == "compare" {
        if let Some(v) = o.get("hl") {
            let b = boxes(v);
            o.set("hl", b);
        }
    }
    if preset == "game" {
        for k in ["x", "o"] {
            if let Some(v) = o.get(k) {
                let c = cell_list(v);
                o.set(k, c);
            }
        }
    }
    if preset == "chart" {
        chart_series(&mut o);
    }
    if preset == "stat" {
        if let Some(v) = o.get("spark").filter(|v| !matches!(v, Value::Arr(_))) {
            let w = Value::Arr(vec![v.clone()]);
            o.set("spark", w);
        }
    }
    if preset == "step" {
        if let Some(t) = o.get("time").and_then(seconds) {
            o.set("time", Value::Num(t));
        }
    }
    if preset == "calc" {
        for k in o.keys() {
            if CALC_PROPS.contains(&k.as_str()) {
                continue;
            }
            if let Some(v) = calc_var(o.get(&k).unwrap()) {
                o.set(&k, Value::Obj(v));
            }
        }
    }
    o
}

/// Chart series: x is a list of labels or numbers. y, y2, y3 ... are lists;
/// a part written 12.5±0.4 (or 12.5+-0.4) becomes 12.5 with an error of 0.4,
/// collected into err, err2, ... unless the line set that err list itself.
fn chart_series(o: &mut Map) {
    // Values were already typed by the tokenizer (a quoted "2024" stays text),
    // so a lone value is only wrapped, never re-read.
    if let Some(x) = o.get("x").filter(|x| !matches!(x, Value::Arr(_))) {
        let w = Value::Arr(vec![x.clone()]);
        o.set("x", w);
    }
    for k in o.keys() {
        // `^(y|err)(\d*)$`
        let (is_err, n) = if let Some(n) = k.strip_prefix("err") {
            (true, n)
        } else if let Some(n) = k.strip_prefix('y') {
            (false, n)
        } else {
            continue;
        };
        if !n.bytes().all(|b| b.is_ascii_digit()) {
            continue;
        }
        let list = match o.get(&k).unwrap() {
            Value::Arr(a) => a.clone(),
            v => vec![v.clone()],
        };
        if is_err {
            o.set(&k, Value::Arr(list));
            continue;
        }
        let mut errs = Vec::new();
        let vals = list
            .into_iter()
            .map(|v| match v.as_str().and_then(plus_minus) {
                Some((y, e)) => {
                    errs.push(e);
                    Value::Num(y)
                }
                None => {
                    errs.push(0.0);
                    v
                }
            })
            .collect();
        o.set(&k, Value::Arr(vals));
        let ek = format!("err{}", n);
        if errs.iter().any(|e| *e != 0.0) && !o.has(&ek) {
            o.set(&ek, Value::Arr(errs.into_iter().map(Value::Num).collect()));
        }
    }
}

// ---------- raw-TeX presets ----------
// math: the rest of the line is TeX, verbatim, after any leading caption= /
// size= props; one wrapping pair of quotes is dropped. step: a lone "$" token
// starts the TeX part, which runs to the end of the line. Backslashes, quotes
// and "#" in TeX are never escapes or comments.

/// End of `"(?:[^"\\]|\\.)*"` at `i` (where s[i] is the opening quote).
fn quoted_end(s: &str, i: usize) -> Option<usize> {
    let mut j = i + 1;
    loop {
        let c = char_at(s, j)?;
        match c {
            '"' => return Some(j + 1),
            '\\' => {
                let e = char_at(s, j + 1).filter(|e| !is_line_end(*e))?;
                j += 1 + e.len_utf8();
            }
            _ => j += c.len_utf8(),
        }
    }
}

/// `s.replace(/\\(.)/g, "$1")`
fn unescape(s: &str) -> String {
    let mut out = String::new();
    let mut cs = s.chars().peekable();
    while let Some(c) = cs.next() {
        if c == '\\' {
            if let Some(&e) = cs.peek().filter(|e| !is_line_end(**e)) {
                out.push(e);
                cs.next();
                continue;
            }
        }
        out.push(c);
    }
    out
}

/// `^(caption|size)=("(?:[^"\\]|\\.)*"|\S*)(?:\s+|$)`: (name, value, length).
fn math_prop(r: &str) -> Option<(&str, &str, usize)> {
    let name = ["caption", "size"].into_iter().find(|n| r.starts_with(n) && r[n.len()..].starts_with('='))?;
    let p = name.len() + 1;
    // After the value: whitespace (all of it) or the end.
    let tail = |e: usize| -> Option<usize> {
        match char_at(r, e) {
            None => Some(e),
            Some(c) if is_ws(c) => Some(skip_ws(r, e)),
            _ => None,
        }
    };
    if r[p..].starts_with('"') {
        if let Some(e) = quoted_end(r, p) {
            if let Some(end) = tail(e) {
                return Some((name, &r[p..e], end));
            }
        }
    }
    let e = r[p..].find(is_ws).map_or(r.len(), |k| p + k);
    Some((name, &r[p..e], tail(e).unwrap()))
}

/// JS `s.slice(1, -1)`
fn inner(s: &str) -> &str {
    let mut cs = s.chars();
    cs.next();
    cs.next_back();
    cs.as_str()
}

fn math_args(rest: &str) -> Map {
    let mut o = Map::new();
    let mut r = trim(rest);
    while let Some((name, v, len)) = math_prop(r) {
        let v = if v.starts_with('"') { unescape(inner(v)) } else { v.to_string() };
        o.set(name, Value::Str(v));
        r = &r[len..];
    }
    let mut r = trim(r);
    // `^"[^"]*"$`
    if r.len() >= 2 && r.starts_with('"') && r.ends_with('"') && !r[1..r.len() - 1].contains('"') {
        r = &r[1..r.len() - 1];
    }
    if !r.is_empty() {
        o.set("tex", Value::str(r));
    }
    o
}

/// `/(^|\s)\$(\s|$)/`: (index, length) of the first match.
fn step_dollar(rest: &str) -> Option<(usize, usize)> {
    // A "$" at `at` followed by whitespace (one char, taken) or the end.
    let after = |at: usize| -> Option<usize> {
        if char_at(rest, at) != Some('$') {
            return None;
        }
        match char_at(rest, at + 1) {
            None => Some(1),
            Some(c) if is_ws(c) => Some(1 + c.len_utf8()),
            _ => None,
        }
    };
    let mut p = 0;
    loop {
        if p == 0 {
            if let Some(l) = after(0) {
                return Some((0, l));
            }
        }
        let c = char_at(rest, p)?;
        if is_ws(c) {
            if let Some(l) = after(p + c.len_utf8()) {
                return Some((p, c.len_utf8() + l));
            }
        }
        p += c.len_utf8();
    }
}

fn step_args(rest: &str) -> Map {
    let m = step_dollar(rest);
    let head = m.map_or(rest, |(i, _)| &rest[..i]);
    let mut o = parse_args("step", &tokenize(head));
    if let Some((i, l)) = m {
        let tex = trim(&rest[i + l..]);
        if !tex.is_empty() {
            o.set("tex", Value::str(tex));
        }
    }
    o
}

fn is_raw(preset: &str) -> bool {
    preset == "math" || preset == "step"
}

fn raw_args(preset: &str, rest: &str) -> Map {
    if preset == "math" { math_args(rest) } else { step_args(rest) }
}

// ---------- form fields ----------

/// Form field token: key:type, "Label":type, optional trailing "!" = required.
/// A bare identifier is a text field.
/// `^(?:"((?:[^"\\]|\\.)*)"|([a-z_][\w-]*))(?::(.+?))?(!)?$` with the i flag
fn field(t: &Token) -> Option<Map> {
    if t.quoted {
        return None; // a quoted token alone is the form title
    }
    let raw = t.raw.as_str();
    let (label, key, i) = if raw.starts_with('"') {
        let e = quoted_end(raw, 0)?;
        (Some(unescape(&raw[1..e - 1])), None, e)
    } else {
        let e = raw.find(|c: char| !(is_word(c) || c == '-')).unwrap_or(raw.len());
        if !is_ident(&raw[..e]) {
            return None;
        }
        (None, Some(raw[..e].to_string()), e)
    };
    let rest = &raw[i..];
    let (typ, required) = if let Some(ty) = rest.strip_prefix(':') {
        // .+? is lazy: it leaves a final "!" to (!)? when it can.
        if ty.is_empty() || ty.chars().any(is_line_end) {
            return None;
        }
        match ty.strip_suffix('!') {
            Some(t) if !t.is_empty() => (Some(t), true),
            _ => (Some(ty), false),
        }
    } else if rest.is_empty() {
        (None, false)
    } else if rest == "!" {
        (None, true)
    } else {
        return None;
    };
    if typ.is_none() && label.is_some() {
        return None; // "Title" without a type
    }
    let key = key.unwrap_or_else(|| slug(label.as_deref().unwrap()));
    let mut f = Map::new();
    f.set("key", Value::Str(key));
    if let Some(l) = label.filter(|l| !l.is_empty()) {
        f.set("label", Value::Str(l));
    }
    if let Some(ty) = typ {
        if let Some((lo, hi)) = range(ty) {
            f.set("type", Value::str("range"));
            f.set("min", Value::Num(lo));
            f.set("max", Value::Num(hi));
        } else if ty.contains('|') {
            f.set("type", Value::str("choice"));
            // `s.replace(/^"|"$/g, "")`
            let opts: Vec<&str> = ty.split('|').map(|s| {
                let s = s.strip_prefix('"').unwrap_or(s);
                s.strip_suffix('"').unwrap_or(s)
            }).collect();
            f.set("options", Value::strs(&opts));
        } else {
            f.set("type", Value::str(ty));
        }
    }
    if required {
        f.set("required", Value::Bool(true));
    }
    Some(f)
}

/// `String(s).toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "")`
fn slug(s: &str) -> String {
    let mut out = String::new();
    for c in s.to_lowercase().chars() {
        if c.is_ascii_lowercase() || c.is_ascii_digit() {
            out.push(c);
        } else if !out.ends_with('_') || out.is_empty() {
            out.push('_');
        }
    }
    let out = out.strip_prefix('_').unwrap_or(&out);
    out.strip_suffix('_').unwrap_or(out).to_string()
}

pub fn parse_args(preset: &str, tokens: &[Token]) -> Map {
    let (kv, flags, pos) = split(tokens);
    let mut o = preset_props(preset, &pos);
    o.merge(&flags);
    o.merge(&kv);
    clean(normalize(preset, o))
}

// ---------- line parser ----------

fn op(fields: Vec<(&str, Value)>) -> Value {
    Value::Obj(Map(fields.into_iter().map(|(k, v)| (k.to_string(), v)).collect()))
}

fn error(screen: &str, message: String, line: &str) -> Value {
    op(vec![("op", Value::str("error")), ("screen", Value::str(screen)), ("message", Value::Str(message)), ("line", Value::str(line))])
}

/// `^#(\s|$)`
fn is_comment(s: &str) -> bool {
    s.strip_prefix('#').is_some_and(|r| r.chars().next().is_none_or(is_ws))
}

/// `^>([\w-]+)(?:\s+|$)`: (screen, length of the match).
fn route(body: &str) -> Option<(&str, usize)> {
    let r = body.strip_prefix('>')?;
    let e = r.find(|c: char| !(is_word(c) || c == '-')).unwrap_or(r.len());
    if e == 0 {
        return None;
    }
    match r[e..].chars().next() {
        None => Some((&r[..e], 1 + e)),
        Some(c) if is_ws(c) => Some((&r[..e], 1 + skip_ws(r, e))),
        _ => None,
    }
}

/// `^custom(?:@([\w-]+))?\s+(.*)$`: (id, json).
fn custom_line(body: &str) -> Option<(Option<&str>, &str)> {
    let r = body.strip_prefix("custom")?;
    let (id, r) = match r.strip_prefix('@') {
        Some(a) => {
            let e = a.find(|c: char| !(is_word(c) || c == '-')).unwrap_or(a.len());
            if e == 0 {
                return None;
            }
            (Some(&a[..e]), &a[e..])
        }
        None => (None, r),
    };
    let j = skip_ws(r, 0);
    if j == 0 {
        return None;
    }
    let rest = &r[j..];
    (!rest.chars().any(is_line_end)).then_some((id, rest))
}

/// `^([a-z]+)(?:@([\w-]+))?$` (and without the optional group for patches).
// ---------- theme app (spec/YL.md, theme app; RESTYLE.md) ----------
// `theme app [set] key=value...`: a restyle of Yui's own chrome, not the
// agent's look. Stricter than an agent's theme: an unknown set, key or value
// is an error line, never quietly dropped. Same tables as site/lib/yl/look.mjs.

pub const APP_SETS: &[&str] = &[
    "yui", "candy", "berry", "cherry", "coral", "sunset", "peach", "autumn", "honey",
    "lemon", "lime", "matcha", "forest", "mint", "teal", "sky", "ocean", "midnight",
    "lavender", "grape", "slate", "mono", "wizard", "coach", "zen", "studio", "night", "counsel",
];
pub const APP_PAPERS: &[&str] = &["cream", "paper", "white", "mist", "sand", "blush"];
const APP_STYLE_KEYS: &[&str] = &["screen", "gallery", "chart", "buttons"];

/// `^#[0-9a-f]{6}$` with the i flag
fn is_hex6(v: &str) -> bool {
    v.strip_prefix('#').is_some_and(|h| h.len() == 6 && h.chars().all(|c| c.is_ascii_hexdigit()))
}

/// None for a key the app does not take, else whether it takes this value.
fn app_value_ok(key: &str, v: &str) -> Option<bool> {
    Some(match key {
        "accent" => is_hex6(v) || APP_SETS.contains(&v),
        "bg" => is_hex6(v) || APP_PAPERS.contains(&v),
        "radius" => ["round", "soft", "square"].contains(&v),
        "font" => ["rounded", "default", "serif", "mono"].contains(&v),
        "weight" => ["regular", "bold", "heavy"].contains(&v),
        "motion" => ["bouncy", "calm", "snappy"].contains(&v),
        _ => return None,
    })
}

fn app_theme(sc: &str, tokens: &[Token], line: &str) -> Value {
    let bad = |m: String| error(sc, format!("theme app: {m}"), line);
    let mut props = Map::new();
    props.set("scope", Value::str("app"));
    let mut words: Vec<&str> = Vec::new();
    for t in tokens {
        if let Some(k) = &t.key {
            let v = t.value.join("|");
            if APP_STYLE_KEYS.contains(&k.as_str()) {
                return bad(format!("{k}= is one agent's style, not the app's"));
            }
            match app_value_ok(k, &v) {
                None => return bad(format!("unknown key {k}=")),
                Some(false) => return bad(format!("{k}={v} is not a value the app takes")),
                Some(true) => props.set(k, Value::Str(v)),
            }
        } else if !t.quoted && t.parts.is_none() && is_flag(&t.raw) {
            return bad(format!("{} is not a flag here; the person always sees a preview first", t.raw));
        } else {
            words.push(&t.text);
        }
    }
    if words.len() > 1 {
        return bad(format!("one set name, not \"{}\"", words.join(" ")));
    }
    if let Some(&name) = words.first() {
        if name == "reset" {
            if props.len() > 1 {
                return bad("reset takes nothing else".into());
            }
        } else if !APP_SETS.contains(&name) {
            return bad(format!("no set named {name}"));
        }
        props.set("name", Value::str(name));
    }
    if props.len() == 1 {
        return bad("needs a set name, reset or keys".into());
    }
    op(vec![("op", Value::str("theme")), ("screen", Value::str(sc)), ("props", Value::Obj(props)), ("line", Value::str(line))])
}

// ---------- menu (spec section 5, The drawer) ----------

pub const MENU_BUCKETS: &[&str] = &["review", "backlog", "shortcut"];
pub const MENU_KEYS: &[&str] = &["sub", "say", "show", "url"];

/// An item with no @id is known by its label: lowercase, runs of anything else as one "-".
pub fn menu_id(label: &str) -> String {
    let mut out = String::new();
    let mut dash = false;
    for c in label.to_lowercase().chars() {
        if c.is_ascii_lowercase() || c.is_ascii_digit() {
            if dash && !out.is_empty() {
                out.push('-');
            }
            dash = false;
            out.push(c);
        } else {
            dash = true;
        }
    }
    if out.is_empty() { "item".into() } else { out }
}

fn menu_line(sc: &str, tokens: &[Token], line: &str) -> Value {
    let Some(first) = tokens.first() else {
        return error(sc, "menu: needs review, backlog, shortcut or done".into(), line);
    };
    let head = head_parts(&first.raw, false).filter(|(b, id)| MENU_BUCKETS.contains(b) || (*b == "done" && id.is_none()));
    let Some((bucket, id)) = head else {
        return error(sc, format!("menu: \"{}\" is not review, backlog, shortcut or done", first.raw), line);
    };
    let rest = &tokens[1..];
    if bucket == "done" {
        let name = rest.iter().map(|t| t.text.as_str()).filter(|s| !s.is_empty()).collect::<Vec<_>>().join(" ");
        if name.is_empty() {
            return error(sc, "menu done: needs an id".into(), line);
        }
        let id = if is_word_run(&name) { name } else { menu_id(&name) };
        let mut props = Map::new();
        props.set("done", Value::Bool(true));
        return op(vec![("op", Value::str("menu")), ("screen", Value::str(sc)), ("id", Value::Str(id)), ("props", Value::Obj(props)), ("line", Value::str(line))]);
    }
    let mut props = Map::new();
    props.set("bucket", Value::str(bucket));
    let mut words: Vec<&str> = Vec::new();
    let mut extra: Vec<(String, String)> = Vec::new();
    for t in rest {
        if let Some(k) = &t.key {
            if MENU_KEYS.contains(&k.as_str()) {
                extra.retain(|(e, _)| e != k);
                extra.push((k.clone(), t.value.join("|")));
            }
        } else if !(!t.quoted && t.parts.is_none() && is_flag(&t.raw)) {
            words.push(&t.text);
        }
    }
    let label = words.into_iter().filter(|w| !w.is_empty()).collect::<Vec<_>>().join(" ");
    if label.is_empty() {
        return error(sc, "menu: needs a label".into(), line);
    }
    let id = id.map(str::to_string).unwrap_or_else(|| menu_id(&label));
    props.set("label", Value::Str(label));
    for (k, v) in extra {
        props.set(&k, Value::Str(v));
    }
    op(vec![("op", Value::str("menu")), ("screen", Value::str(sc)), ("id", Value::Str(id)), ("props", Value::Obj(props)), ("line", Value::str(line))])
}

fn head_parts(s: &str, need_id: bool) -> Option<(&str, Option<&str>)> {
    match s.split_once('@') {
        Some((p, id)) => (is_lower(p) && is_word_run(id)).then_some((p, Some(id))),
        None => (!need_id && is_lower(s)).then_some((s, None)),
    }
}

// ---------- agent tables (spec/TABLES.md) ----------

pub const TABLE_TYPES: &[&str] = &["text", "number", "date", "bool"];

/// `^[A-Za-z][\w-]*$`
fn is_table_name(s: &str) -> bool {
    let mut cs = s.chars();
    matches!(cs.next(), Some(c) if c.is_ascii_alphabetic()) && cs.all(|c| is_word(c) || c == '-')
}

/// `^([A-Za-z_][\w-]*):([a-z]+)(?::(\S+))?$`: (name, type, unit).
fn col_def(s: &str) -> Option<(&str, &str, Option<&str>)> {
    let e = s.find(|c: char| !(is_word(c) || c == '-')).unwrap_or(s.len());
    let name = &s[..e];
    if !is_ident(name) {
        return None;
    }
    let r = s[e..].strip_prefix(':')?;
    let t = r.find(|c: char| !c.is_ascii_lowercase()).unwrap_or(r.len());
    let ty = &r[..t];
    if ty.is_empty() {
        return None;
    }
    let r = &r[t..];
    if r.is_empty() {
        return Some((name, ty, None));
    }
    let unit = r.strip_prefix(':')?;
    (!unit.is_empty() && !unit.chars().any(is_ws)).then_some((name, ty, Some(unit)))
}

/// table create <name> col:type ... (number columns may carry a unit: Cal:number:kcal)
fn table_create(sc: &str, tokens: &[Token], line: &str) -> Value {
    let bad = |m: String| error(sc, format!("table create: {m}"), line);
    let Some(name_tok) = tokens.first() else {
        return bad("needs a name, then col:type ...".into());
    };
    if name_tok.quoted || name_tok.parts.is_some() || name_tok.key.is_some() || !is_table_name(&name_tok.raw) {
        return bad("needs a name, then col:type ...".into());
    }
    let rest = &tokens[1..];
    if rest.is_empty() {
        return bad("needs at least one col:type".into());
    }
    let mut cols = Vec::new();
    for t in rest {
        let m = if t.quoted || t.key.is_some() { None } else { col_def(&t.raw) };
        let Some((name, ty, unit)) = m else {
            return bad(format!("\"{}\" is not col:type", t.raw));
        };
        if !TABLE_TYPES.contains(&ty) {
            return bad(format!("\"{}\" is not text, number, date or bool", ty));
        }
        if unit.is_some() && ty != "number" {
            return bad(format!("only number columns take a unit (\"{}\")", t.raw));
        }
        let mut c = Map::new();
        c.set("name", Value::str(name));
        c.set("type", Value::str(ty));
        if let Some(u) = unit {
            c.set("unit", Value::str(u));
        }
        cols.push(Value::Obj(c));
    }
    op(vec![
        ("op", Value::str("table")),
        ("screen", Value::str(sc)),
        ("name", Value::str(&name_tok.raw)),
        ("cols", Value::Arr(cols)),
        ("line", Value::str(line)),
    ])
}

/// put <table> [key] col=value ... [+delete]. Other flags set a bool column: +Done is Done=on.
fn put_line(sc: &str, tokens: &[Token], line: &str) -> Value {
    let (kv, mut flags, pos) = split(tokens);
    let bad = |m: &str| error(sc, format!("put: {m}"), line);
    let table_tok = pos.first();
    let key_tok = pos.get(1);
    let Some(table_tok) = table_tok.filter(|t| !t.quoted && t.parts.is_none() && is_table_name(&t.raw)) else {
        return bad("needs a table name");
    };
    if pos.len() > 2 {
        return bad("one key, then col=value ...");
    }
    if key_tok.is_some_and(|k| k.parts.is_some()) {
        return bad("a key has no |");
    }
    let delete = flags.remove("delete").is_some_and(|v| v == Value::Bool(true));
    let mut values = flags;
    values.merge(&kv);
    let mut o = vec![("op", Value::str("put")), ("screen", Value::str(sc)), ("table", Value::str(&table_tok.raw))];
    if let Some(k) = key_tok {
        o.push(("key", Value::str(&k.text)));
    }
    if delete {
        if key_tok.is_none() {
            return bad("+delete needs a key");
        }
        if !values.is_empty() {
            return bad("+delete takes no values");
        }
        o.push(("values", Value::Obj(Map::new())));
        o.push(("delete", Value::Bool(true)));
        o.push(("line", Value::str(line)));
        return op(o);
    }
    if values.is_empty() {
        return bad("needs at least one col=value");
    }
    o.push(("values", Value::Obj(values)));
    o.push(("line", Value::str(line)));
    op(o)
}

struct Open {
    id: String,
    preset: String,
    screen: String,
}

/// Stateful: remembers the focused screen and which preset each id belongs to,
/// so "~hiit rounds=10" knows to parse its args as a timer. `with_known` starts
/// it with the ids that last from earlier replies (YL.md section 5), id -> preset;
/// this reply's own ids shadow them.
pub struct Parser {
    screen: String,
    ids: HashMap<String, String>, // id -> preset
    auto: u64,
    open: Vec<Open>, // open groups, innermost last
}

impl Default for Parser {
    fn default() -> Self {
        Self::new()
    }
}

impl Parser {
    pub fn new() -> Self {
        Parser { screen: "1".into(), ids: HashMap::new(), auto: 0, open: Vec::new() }
    }

    pub fn with_known(known: &HashMap<String, String>) -> Self {
        Parser { ids: known.clone(), ..Self::new() }
    }

    /// Group bookkeeping for one parsed op. Errors (and None) leave groups open.
    fn group(&mut self, o: Option<Value>) -> Option<Value> {
        let o = o?;
        let m = o.as_obj().unwrap();
        let kind = m.get("op").and_then(Value::as_str).unwrap();
        // A theme line restyles the app, a menu line fills the drawer and a data
        // line (table create, put) writes to the phone, not the screen: they
        // leave groups alone.
        if matches!(kind, "error" | "theme" | "menu" | "table" | "put") {
            return Some(o);
        }
        // Closing the stage ends whatever group was open on it, like `>2` would.
        if kind == "close" {
            self.open.clear();
            return Some(o);
        }
        let screen = m.get("screen").and_then(Value::as_str).unwrap().to_string();
        if kind == "end" {
            let line = m.get("line").and_then(Value::as_str).unwrap();
            return Some(match self.open.pop() {
                None => error(&screen, "end: no open deck, plan, narrate, timeline or sketch".into(), line),
                Some(g) => {
                    let mut out = m.clone();
                    out.set("target", Value::Str(g.id));
                    Value::Obj(out)
                }
            });
        }
        let preset = m.get("preset").and_then(Value::as_str).unwrap_or("").to_string();
        let is_add = kind == "add";
        let joins = |g: &Open| is_add && screen == g.screen && group_members(&g.preset).unwrap().contains(&preset.as_str());
        while self.open.last().is_some_and(|g| !joins(g)) {
            self.open.pop();
        }
        let out = match self.open.last() {
            Some(g) => op(vec![
                ("op", m.get("op").unwrap().clone()),
                ("screen", m.get("screen").unwrap().clone()),
                ("preset", m.get("preset").unwrap().clone()),
                ("id", m.get("id").unwrap().clone()),
                ("in", Value::str(&g.id)),
                ("props", m.get("props").unwrap().clone()),
                ("line", m.get("line").unwrap().clone()),
            ]),
            None => o.clone(),
        };
        if is_add && group_members(&preset).is_some() {
            let id = m.get("id").and_then(Value::as_str).unwrap().to_string();
            self.open.push(Open { id, preset, screen });
        }
        Some(out)
    }

    /// One line in, at most one op out.
    pub fn line(&mut self, src: &str) -> Option<Value> {
        let o = self.parse_line(src);
        self.group(o)
    }

    fn next_id(&mut self, prefix: &str) -> String {
        self.auto += 1;
        format!("{}{}", prefix, self.auto)
    }

    fn parse_line(&mut self, src: &str) -> Option<Value> {
        let line = src.strip_suffix('\r').unwrap_or(src);
        let mut body = trim(line);
        if body.is_empty() || is_comment(body) {
            return None;
        }

        let mut screen = self.screen.clone();
        if let Some((name, len)) = route(body) {
            // `chat` is screen 1 (spec section 1); a bare ">chat" closes the stage.
            screen = if name == "chat" { "1".into() } else { name.to_string() };
            body = &body[len..];
            if body.is_empty() || is_comment(body) {
                self.screen = screen.clone();
                return Some(if name == "chat" {
                    op(vec![("op", Value::str("close")), ("screen", Value::str("full")), ("line", Value::str(line))])
                } else {
                    op(vec![("op", Value::str("focus")), ("screen", Value::Str(screen)), ("line", Value::str(line))])
                });
            }
        }
        let sc = screen.as_str();

        // custom {json}: the rest of the line is JSON, not YL tokens.
        if let Some((id, text)) = custom_line(body) {
            return Some(match json::parse(text) {
                Ok(spec) => {
                    let id = match id {
                        Some(id) => id.to_string(),
                        None => self.next_id("c"),
                    };
                    self.ids.insert(id.clone(), "custom".into());
                    let mut props = Map::new();
                    props.set("spec", spec);
                    op(vec![
                        ("op", Value::str("add")),
                        ("screen", Value::str(sc)),
                        ("preset", Value::str("custom")),
                        ("id", Value::Str(id)),
                        ("props", Value::Obj(props)),
                        ("line", Value::str(line)),
                    ])
                }
                Err(e) => error(sc, format!("custom: bad JSON ({})", e), line),
            });
        }

        let mut tokens = tokenize(body);
        if tokens.is_empty() {
            return None;
        }
        let head = tokens.remove(0).raw;

        if let Some(t) = head.strip_prefix('~') {
            let mut target = t.to_string();
            // ~preset@id (section 5): the id when this reply made it or it lasts, else the preset name.
            if let Some((p, Some(id))) = head_parts(t, true) {
                if !PRESETS.contains(&p) && p != "say" && p != "custom" {
                    return Some(error(sc, format!("patch: unknown preset \"{}\"", p), line));
                }
                let known = self.ids.get(id);
                if let Some(k) = known.filter(|k| *k != p) {
                    return Some(error(sc, format!("patch: \"{}\" is a {}, not a {}", id, k, p), line));
                }
                target = if known.is_some() { id } else { p }.to_string();
            }
            let preset = if PRESETS.contains(&target.as_str()) || target == "say" {
                Some(target.clone())
            } else {
                self.ids.get(&target).cloned()
            };
            let Some(preset) = preset else {
                return Some(error(sc, format!("patch: nothing called \"{}\"", target), line));
            };
            if preset == "custom" {
                return Some(error(sc, "patch: custom blocks are replaced, not patched".into(), line));
            }
            let props = if is_raw(&preset) { raw_args(&preset, &body[head.len()..]) } else { parse_args(&preset, &tokens) };
            // A timeline row moves with `kind=` (YUI-111): done, now or next. The
            // row keeps its id and place; from here on the id is that preset.
            if ROWS.contains(&preset.as_str()) {
                if let Some(kind) = props.get("kind") {
                    let Value::Str(k) = kind else {
                        return Some(error(sc, "patch: kind= is done, now or next".into(), line));
                    };
                    if !ROWS.contains(&k.as_str()) {
                        return Some(error(sc, "patch: kind= is done, now or next".into(), line));
                    }
                    if !ROWS.contains(&target.as_str()) {
                        self.ids.insert(target.clone(), k.clone());
                    }
                }
            }
            return Some(op(vec![
                ("op", Value::str("patch")),
                ("screen", Value::str(sc)),
                ("target", Value::Str(target)),
                ("props", Value::Obj(props)),
                ("line", Value::str(line)),
            ]));
        }

        let simple = |kind: &str| op(vec![("op", Value::str(kind)), ("screen", Value::str(sc)), ("line", Value::str(line))]);
        match head.as_str() {
            "save" | "show" | "forget" => {
                // The name is the rest of the line: `save leg day` is "leg day".
                let name = tokens.iter().map(|t| t.text.as_str()).filter(|s| !s.is_empty()).collect::<Vec<_>>().join(" ");
                if name.is_empty() {
                    return Some(error(sc, format!("{}: needs a name", head), line));
                }
                return Some(op(vec![("op", Value::str(&head)), ("screen", Value::str(sc)), ("name", Value::Str(name)), ("line", Value::str(line))]));
            }
            "menu" => return Some(menu_line(sc, &tokens, line)),
            "clear" => return Some(simple("clear")),
            "end" => return Some(simple("end")),
            "close" => {
                if !tokens.is_empty() {
                    return Some(error(sc, "close: takes nothing else".into(), line));
                }
                self.screen = "1".into();
                return Some(op(vec![("op", Value::str("close")), ("screen", Value::str("full")), ("line", Value::str(line))]));
            }
            "theme" => {
                if let Some(t0) = tokens.first() {
                    if t0.key.is_none() && !t0.quoted && t0.parts.is_none() && t0.text == "app" {
                        return Some(app_theme(sc, &tokens[1..], line));
                    }
                }
                let props = parse_args("theme", &tokens);
                return Some(op(vec![("op", Value::str("theme")), ("screen", Value::str(sc)), ("props", Value::Obj(props)), ("line", Value::str(line))]));
            }
            "talk" => {
                // `talk` or `talk on` turns the composer on for this page, `talk off` takes it away.
                let word = match tokens.len() {
                    0 => Some("on"),
                    1 => Some(tokens[0].text.as_str()),
                    _ => None,
                };
                if word != Some("on") && word != Some("off") {
                    return Some(error(sc, "talk: takes nothing, on or off".into(), line));
                }
                let mut props = Map::new();
                props.set("on", Value::Bool(word == Some("on")));
                return Some(op(vec![("op", Value::str("talk")), ("screen", Value::str(sc)), ("props", Value::Obj(props)), ("line", Value::str(line))]));
            }
            _ => {}
        }

        // Agent tables (spec/TABLES.md): `table create` and `put` write to the phone.
        if head == "put" {
            return Some(put_line(sc, &tokens, line));
        }
        if (head == "table" || head.starts_with("table@"))
            && tokens.first().is_some_and(|t| !t.quoted && t.key.is_none() && t.raw == "create")
        {
            if head != "table" {
                return Some(error(sc, "table create: takes no @id".into(), line));
            }
            return Some(table_create(sc, &tokens[1..], line));
        }

        let Some((preset, id)) = head_parts(&head, false).filter(|(p, _)| PRESETS.contains(p) || *p == "say") else {
            return Some(error(sc, format!("unknown preset \"{}\"", head), line));
        };
        let preset = preset.to_string();
        let id = match id {
            Some(id) => id.to_string(),
            None => self.next_id("n"),
        };
        self.ids.insert(id.clone(), preset.clone());
        let props = if is_raw(&preset) { raw_args(&preset, &body[head.len()..]) } else { parse_args(&preset, &tokens) };
        Some(op(vec![
            ("op", Value::str("add")),
            ("screen", Value::str(sc)),
            ("preset", Value::Str(preset)),
            ("id", Value::Str(id)),
            ("props", Value::Obj(props)),
            ("line", Value::str(line)),
        ]))
    }
}

/// Parse a whole document at once.
pub fn parse(text: &str) -> Vec<Value> {
    parse_with(text, &HashMap::new())
}

/// Parse a whole document, starting from the ids that last (Parser::with_known).
pub fn parse_with(text: &str, known: &HashMap<String, String>) -> Vec<Value> {
    let mut p = Parser::with_known(known);
    text.split('\n').filter_map(|l| p.line(l)).collect()
}

/// Streaming: feed chunks as they arrive, get ops for every completed line.
/// Lines render the moment their newline lands; flush() finishes the tail.
#[derive(Default)]
pub struct StreamParser {
    buf: String,
    p: Parser,
}

impl StreamParser {
    pub fn new() -> Self {
        Self::default()
    }

    pub fn with_known(known: &HashMap<String, String>) -> Self {
        StreamParser { buf: String::new(), p: Parser::with_known(known) }
    }

    pub fn push(&mut self, chunk: &str) -> Vec<Value> {
        self.buf.push_str(chunk);
        let mut out = Vec::new();
        while let Some(nl) = self.buf.find('\n') {
            let line: String = self.buf.drain(..=nl).collect();
            if let Some(o) = self.p.line(&line[..nl]) {
                out.push(o);
            }
        }
        out
    }

    pub fn flush(&mut self) -> Vec<Value> {
        let rest = std::mem::take(&mut self.buf);
        if trim(&rest).is_empty() {
            return Vec::new();
        }
        self.p.line(&rest).into_iter().collect()
    }
}

// ---------- the stage ----------
// The stage is a full-screen layer over the chat (spec section 5, The stage).

/// A timer with rounds or rest. Workouts always open on the stage.
pub fn is_workout(preset: &str, props: &Map) -> bool {
    preset == "timer"
        && props.get("up") != Some(&Value::Bool(true))
        && (props.get("rounds").map_or(1.0, js_number) > 1.0 || props.get("rest").map_or(0.0, js_number) > 0.0)
}

/// Whether an add op opens on the stage. `style` is the agent's style profile
/// (theme style: screen=chat|full, gallery=...). Group members follow their
/// head; screen state handles that, since the op alone cannot know.
pub fn on_stage(o: &Value, style: &Map) -> bool {
    if o.get("op").and_then(Value::as_str) != Some("add") {
        return false;
    }
    let screen = o.get("screen").and_then(Value::as_str).unwrap_or("");
    if screen == "full" {
        return true;
    }
    let empty = Map::new();
    let p = o.get("props").and_then(Value::as_obj).unwrap_or(&empty);
    let preset = o.get("preset").and_then(Value::as_str).unwrap_or("");
    if is_workout(preset, p) {
        return true;
    }
    if page_of(screen) != 1 {
        return false;
    }
    if p.get("inline") == Some(&Value::Bool(true)) {
        return false;
    }
    let style_screen = style.get("screen").and_then(Value::as_str);
    if style_screen == Some("chat") {
        return false;
    }
    if style_screen == Some("full") {
        return true;
    }
    if STAGE.contains(&preset) {
        return true;
    }
    let layout = match p.get("layout") {
        Some(Value::Null) | None => style.get("gallery"),
        l => l,
    };
    preset == "gallery" && layout == Some(&Value::str("row3d"))
}

// ---------- pages ----------
// The app shows the chat, then a page for each screen 2 to 12 with something
// on it (spec section 5, Pages). Every other screen name renders in the chat.

pub fn page_of(screen: &str) -> u32 {
    // Number(screen) is an integer that prints back as `screen`.
    match screen.parse::<u32>() {
        Ok(n) if n.to_string() == screen && (2..=MAX_PAGE).contains(&n) => n,
        _ => 1,
    }
}

/// Chat with a screen (spec section 5, Pages): the pages whose composer is on
/// after these ops, in number order. `talk` turns it on, `talk off` and `clear`
/// take it away; only pages 2 to 12 have one to turn on.
/// A timeline's rows after these ops land on an empty screen (YL.md section 4,
/// timeline, Moving a row): (id, kind) in line order. A patch lands on the
/// newest id or preset match; `kind=` re-kinds a row in place.
pub fn timeline_rows(ops: &[Value]) -> Vec<(String, String)> {
    let mut parts: Vec<(String, String)> = Vec::new();
    let text = |o: &Value, k: &str| o.get(k).and_then(Value::as_str).unwrap_or("").to_string();
    for o in ops {
        match o.get("op").and_then(Value::as_str) {
            Some("add") => parts.push((text(o, "id"), text(o, "preset"))),
            Some("patch") => {
                let t = text(o, "target");
                let kind = o.get("props").and_then(|p| p.get("kind")).and_then(Value::as_str);
                if let (Some(hit), Some(k)) = (parts.iter_mut().rev().find(|p| p.0 == t || p.1 == t), kind) {
                    if ROWS.contains(&hit.1.as_str()) && ROWS.contains(&k) {
                        hit.1 = k.to_string();
                    }
                }
            }
            _ => {}
        }
    }
    parts.into_iter().filter(|p| ROWS.contains(&p.1.as_str())).collect()
}

pub fn talking(ops: &[Value]) -> Vec<u32> {
    let mut on: Vec<u32> = Vec::new();
    for o in ops {
        let n = page_of(o.get("screen").and_then(Value::as_str).unwrap_or(""));
        if n == 1 {
            continue;
        }
        let kind = o.get("op").and_then(Value::as_str).unwrap_or("");
        let turn_on = kind == "talk" && o.get("props").and_then(|p| p.get("on")) == Some(&Value::Bool(true));
        if turn_on {
            if !on.contains(&n) {
                on.push(n);
            }
        } else if kind == "clear" || kind == "talk" {
            on.retain(|x| *x != n);
        }
    }
    on.sort();
    on
}

/// What the person typed on a page, as the agent reads it (spec section 7):
/// a `[yui] screen=2` line, then the words. Anywhere else the words go as they are.
pub fn typed_body(screen: &str, words: &str) -> String {
    if page_of(screen) == 1 { words.to_string() } else { format!("[yui] screen={}\n{}", screen, words) }
}

/// The other way: `(screen, words)` for a message typed on a page, else None.
/// `^\[yui\] screen=(\S+)\r?\n`
pub fn read_typed(body: &str) -> Option<(String, String)> {
    let r = body.strip_prefix("[yui] screen=")?;
    let e = r.find(is_ws).unwrap_or(r.len());
    if e == 0 {
        return None;
    }
    let screen = &r[..e];
    let rest = &r[e..];
    let words = rest.strip_prefix("\r\n").or_else(|| rest.strip_prefix('\n'))?;
    (page_of(screen) != 1).then(|| (screen.to_string(), words.to_string()))
}

// ---------- defaults ----------

fn defaults(preset: &str) -> Map {
    let (t, f) = (Value::Bool(true), Value::Bool(false));
    let s = Value::str;
    let n = Value::Num;
    let e = || Value::Arr(Vec::new());
    let d: Vec<(&str, Value)> = match preset {
        "timer" => vec![("work", n(60.0)), ("rest", n(0.0)), ("rounds", n(1.0)), ("label", s("")), ("up", f.clone()), ("auto", f), ("sound", t)],
        "ask" => vec![("q", s("Continue?")), ("options", Value::strs(&["Yes", "No"]))],
        "choose" => vec![("q", s("")), ("options", e()), ("other", f)],
        "pick" => vec![("q", s("")), ("options", e()), ("other", f), ("submit", s("Done"))],
        "slide" => vec![("label", s("")), ("min", n(1.0)), ("max", n(5.0)), ("step", n(1.0))],
        "form" => vec![("title", s("")), ("fields", e()), ("submit", s("Submit"))],
        "list" => vec![("title", s("")), ("items", e()), ("check", f.clone()), ("num", f)],
        "table" => vec![("name", s("")), ("cols", Value::Null), ("rows", e()), ("units", e()), ("sort", f)],
        "card" => vec![("title", s("")), ("body", s(""))],
        "image" => vec![("fit", s("cover")), ("edit", f)],
        "camera" => vec![("prompt", s("Take a photo")), ("facing", s("back")), ("scan", f)],
        "mic" => vec![("prompt", s("Tap and talk")), ("auto", f)],
        "gallery" => vec![("title", s("")), ("items", e()), ("caps", e()), ("layout", s("row")), ("pick", f), ("submit", s("Done"))],
        "video" => vec![("loop", f.clone()), ("auto", f.clone()), ("mute", f)],
        "compare" => vec![("title", s("")), ("mode", s("slider")), ("labels", Value::strs(&["Before", "After"])), ("notes", e()), ("hl", e()), ("pick", f)],
        "storyboard" => vec![("title", s("")), ("frames", e()), ("notes", e()), ("reorder", f), ("comment", t)],
        "chart" => vec![("type", s("line")), ("title", s("")), ("x", e()), ("names", e()), ("unit", s("")), ("stack", f)],
        "stat" => vec![("label", s("")), ("unit", s("")), ("good", s("up"))],
        "math" => vec![("tex", s("")), ("size", s("md"))],
        "step" => vec![("text", s("")), ("all", f)],
        "calc" => vec![("title", s("")), ("digits", n(3.0))],
        "deck" => vec![("title", s("")), ("layout", s("slides")), ("full", f.clone()), ("notes", f)],
        "page" => vec![("title", s("")), ("body", s("")), ("points", e()), ("notes", s(""))],
        "plan" => vec![("title", s("")), ("submit", s("Send")), ("review", t)],
        "project" => vec![("title", s("")), ("body", s("")), ("facts", e()), ("next", e()), ("status", s(""))],
        "narrate" => vec![("title", s("")), ("voice", s("agent")), ("rate", n(1.0)), ("auto", f), ("captions", t)],
        "timeline" => vec![("title", s("")), ("mark", s("Now")), ("fold", n(5.0)), ("reorder", f)],
        "done" | "now" | "next" | "row" => vec![("text", s(""))],
        "sketch" => vec![("title", s("")), ("frame", s("window")), ("before", s("Before"))],
        "after" => vec![("label", s("After"))],
        "query" => vec![("table", s("")), ("as", s("table")), ("title", s("")), ("where", e()), ("sort", e())],
        "shapes" => vec![("title", s("")), ("caption", s("")), ("w", n(10.0)), ("h", n(6.0))],
        "shape" => vec![("kind", s("box")), ("label", s(""))],
        "game" => vec![("title", s("")), ("you", s("x")), ("first", s("you")), ("speed", n(2.0)), ("size", n(15.0)), ("pairs", n(6.0)), ("items", e())],
        _ => vec![],
    };
    Map(d.into_iter().map(|(k, v)| (k.to_string(), v)).collect())
}

/// JS `a + b` for the values props can hold.
fn js_add(a: &Value, b: &Value) -> Value {
    let stringy = |v: &Value| matches!(v, Value::Str(_) | Value::Arr(_) | Value::Obj(_));
    if stringy(a) || stringy(b) {
        Value::Str(js_str(a) + &js_str(b))
    } else {
        Value::Num(js_number(a) + js_number(b))
    }
}

/// JS Math.round: halves go up.
fn js_round(x: f64) -> f64 {
    if !x.is_finite() {
        return x;
    }
    let f = x.floor();
    if x - f >= 0.5 { f + 1.0 } else { f }
}

/// Explicit props over the preset's defaults.
pub fn resolve(preset: &str, props: &Map) -> Map {
    let mut r = defaults(preset);
    r.merge(props);
    match preset {
        "slide" if !props.has("value") => {
            let sum = js_add(r.get("min").unwrap(), r.get("max").unwrap());
            r.set("value", Value::Num(js_round(js_number(&sum) / 2.0)));
        }
        "project" => {
            let cta = match props.get("cta") {
                Some(Value::Null) | None => Value::str(if truthy(props.get("open")) { "Open" } else { "" }),
                Some(c) => c.clone(),
            };
            r.set("cta", cta);
        }
        "game" => {
            // Cells outside 1-9 are ignored, and a cell both marks claim is x's.
            let cells = |v: Option<&Value>| -> Vec<f64> {
                let mut out: Vec<f64> = Vec::new();
                for c in v.and_then(Value::as_arr).map(|a| a.as_slice()).unwrap_or(&[]) {
                    if let Value::Num(n) = c {
                        if n.fract() == 0.0 && (1.0..=9.0).contains(n) && !out.contains(n) {
                            out.push(*n);
                        }
                    }
                }
                out
            };
            let kind = match props.get("kind") {
                Some(Value::Null) | None => String::new(),
                Some(k) => js_str(k).to_lowercase(),
            };
            r.set("kind", Value::Str(kind));
            let x = cells(props.get("x"));
            let o: Vec<f64> = cells(props.get("o")).into_iter().filter(|n| !x.contains(n)).collect();
            r.set("x", Value::Arr(x.into_iter().map(Value::Num).collect()));
            r.set("o", Value::Arr(o.into_iter().map(Value::Num).collect()));
        }
        _ => {}
    }
    r
}
