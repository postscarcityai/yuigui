//! Values and a minimal strict JSON (RFC 8259, as JS `JSON.parse` reads it),
//! so the parser needs nothing beyond std. Numbers are `f64` like JS numbers,
//! objects keep their key order, and a repeated key keeps its first place
//! with the last value (as in JS).

use std::fmt::Write as _;

#[derive(Clone, Debug, PartialEq)]
pub enum Value {
    Null,
    Bool(bool),
    Num(f64),
    Str(String),
    Arr(Vec<Value>),
    Obj(Map),
}

/// An object: keys in insertion order.
#[derive(Clone, Debug, Default, PartialEq)]
pub struct Map(pub Vec<(String, Value)>);

impl Map {
    pub fn new() -> Self {
        Map(Vec::new())
    }
    pub fn get(&self, k: &str) -> Option<&Value> {
        self.0.iter().find(|(key, _)| key == k).map(|(_, v)| v)
    }
    pub fn has(&self, k: &str) -> bool {
        self.get(k).is_some()
    }
    /// Sets `k`. A key already there keeps its place, as in JS.
    pub fn set(&mut self, k: &str, v: Value) {
        match self.0.iter_mut().find(|(key, _)| key == k) {
            Some(slot) => slot.1 = v,
            None => self.0.push((k.to_string(), v)),
        }
    }
    pub fn remove(&mut self, k: &str) -> Option<Value> {
        let i = self.0.iter().position(|(key, _)| key == k)?;
        Some(self.0.remove(i).1)
    }
    pub fn keys(&self) -> Vec<String> {
        self.0.iter().map(|(k, _)| k.clone()).collect()
    }
    pub fn len(&self) -> usize {
        self.0.len()
    }
    pub fn is_empty(&self) -> bool {
        self.0.is_empty()
    }
    /// `{ ...self, ...other }`
    pub fn merge(&mut self, other: &Map) {
        for (k, v) in &other.0 {
            self.set(k, v.clone());
        }
    }
}

impl Value {
    pub fn str(s: &str) -> Value {
        Value::Str(s.to_string())
    }
    pub fn strs<S: AsRef<str>>(list: &[S]) -> Value {
        Value::Arr(list.iter().map(|s| Value::str(s.as_ref())).collect())
    }
    pub fn get(&self, k: &str) -> Option<&Value> {
        match self {
            Value::Obj(m) => m.get(k),
            _ => None,
        }
    }
    pub fn as_str(&self) -> Option<&str> {
        match self {
            Value::Str(s) => Some(s),
            _ => None,
        }
    }
    pub fn as_obj(&self) -> Option<&Map> {
        match self {
            Value::Obj(m) => Some(m),
            _ => None,
        }
    }
    pub fn as_arr(&self) -> Option<&Vec<Value>> {
        match self {
            Value::Arr(a) => Some(a),
            _ => None,
        }
    }
}

// ---------- writing ----------

/// JS `JSON.stringify(v)`: compact, -0 as 0, non-finite numbers as null.
pub fn write(v: &Value) -> String {
    let mut out = String::new();
    write_to(v, &mut out);
    out
}

fn write_to(v: &Value, out: &mut String) {
    match v {
        Value::Null => out.push_str("null"),
        Value::Bool(b) => out.push_str(if *b { "true" } else { "false" }),
        Value::Num(n) => out.push_str(&if n.is_finite() { number_string(*n) } else { "null".into() }),
        Value::Str(s) => string(s, out),
        Value::Arr(a) => {
            out.push('[');
            for (i, x) in a.iter().enumerate() {
                if i > 0 {
                    out.push(',');
                }
                write_to(x, out);
            }
            out.push(']');
        }
        Value::Obj(m) => {
            out.push('{');
            for (i, (k, x)) in m.0.iter().enumerate() {
                if i > 0 {
                    out.push(',');
                }
                string(k, out);
                out.push(':');
                write_to(x, out);
            }
            out.push('}');
        }
    }
}

fn string(s: &str, out: &mut String) {
    out.push('"');
    for c in s.chars() {
        match c {
            '"' => out.push_str("\\\""),
            '\\' => out.push_str("\\\\"),
            '\n' => out.push_str("\\n"),
            '\r' => out.push_str("\\r"),
            '\t' => out.push_str("\\t"),
            '\u{8}' => out.push_str("\\b"),
            '\u{c}' => out.push_str("\\f"),
            c if (c as u32) < 0x20 => {
                let _ = write!(out, "\\u{:04x}", c as u32);
            }
            c => out.push(c),
        }
    }
    out.push('"');
}

/// JS `String(n)` (Number::toString): the shortest digits that read back as
/// `n`, fixed between 1e-7 and 1e21, exponential outside.
pub fn number_string(n: f64) -> String {
    if n.is_nan() {
        return "NaN".into();
    }
    if n.is_infinite() {
        return if n > 0.0 { "Infinity" } else { "-Infinity" }.into();
    }
    if n == 0.0 {
        return "0".into();
    }
    let sign = if n < 0.0 { "-" } else { "" };
    // Rust's `{:e}` is the shortest round-trip form too: "1.2345e3".
    let e = format!("{:e}", n.abs());
    let (mant, exp) = e.split_once('e').unwrap();
    let digits: String = mant.chars().filter(|c| *c != '.').collect();
    let k = digits.len() as i64;
    let p = exp.parse::<i64>().unwrap() + 1; // n in the spec
    let body = if k <= p && p <= 21 {
        format!("{}{}", digits, "0".repeat((p - k) as usize))
    } else if 0 < p && p <= 21 {
        format!("{}.{}", &digits[..p as usize], &digits[p as usize..])
    } else if -6 < p && p <= 0 {
        format!("0.{}{}", "0".repeat((-p) as usize), digits)
    } else {
        let sgn = if p - 1 < 0 { "-" } else { "+" };
        if k == 1 {
            format!("{}e{}{}", digits, sgn, (p - 1).abs())
        } else {
            format!("{}.{}e{}{}", &digits[..1], &digits[1..], sgn, (p - 1).abs())
        }
    };
    format!("{}{}", sign, body)
}

// ---------- reading ----------

/// Nesting deeper than this is an error rather than a stack overflow.
const MAX_DEPTH: usize = 1000;

pub fn parse(text: &str) -> Result<Value, String> {
    let mut r = Reader { s: text.as_bytes(), i: 0, depth: 0 };
    r.ws();
    let v = r.value()?;
    r.ws();
    if r.i < r.s.len() {
        return Err(r.err("unexpected token"));
    }
    Ok(v)
}

struct Reader<'a> {
    s: &'a [u8],
    i: usize,
    depth: usize,
}

impl<'a> Reader<'a> {
    fn err(&self, m: &str) -> String {
        format!("{} at position {}", m, self.i)
    }

    fn peek(&self) -> Option<u8> {
        self.s.get(self.i).copied()
    }

    fn ws(&mut self) {
        while matches!(self.peek(), Some(b' ' | b'\t' | b'\n' | b'\r')) {
            self.i += 1;
        }
    }

    fn value(&mut self) -> Result<Value, String> {
        match self.peek() {
            None => Err(self.err("unexpected end")),
            Some(b'{') => self.nested(|r| r.obj()),
            Some(b'[') => self.nested(|r| r.arr()),
            Some(b'"') => Ok(Value::Str(self.str()?)),
            Some(b't') => self.lit("true", Value::Bool(true)),
            Some(b'f') => self.lit("false", Value::Bool(false)),
            Some(b'n') => self.lit("null", Value::Null),
            Some(_) => self.num(),
        }
    }

    fn nested(&mut self, f: impl FnOnce(&mut Self) -> Result<Value, String>) -> Result<Value, String> {
        self.depth += 1;
        if self.depth > MAX_DEPTH {
            return Err(self.err("too deep"));
        }
        let v = f(self);
        self.depth -= 1;
        v
    }

    fn lit(&mut self, word: &str, v: Value) -> Result<Value, String> {
        if !self.s[self.i..].starts_with(word.as_bytes()) {
            return Err(self.err("unexpected token"));
        }
        self.i += word.len();
        Ok(v)
    }

    fn expect(&mut self, c: u8) -> Result<(), String> {
        if self.peek() != Some(c) {
            return Err(self.err(&format!("expected \"{}\"", c as char)));
        }
        self.i += 1;
        Ok(())
    }

    fn obj(&mut self) -> Result<Value, String> {
        self.i += 1;
        let mut m = Map::new();
        self.ws();
        if self.peek() == Some(b'}') {
            self.i += 1;
            return Ok(Value::Obj(m));
        }
        loop {
            self.ws();
            if self.peek() != Some(b'"') {
                return Err(self.err("expected a key"));
            }
            let k = self.str()?;
            self.ws();
            self.expect(b':')?;
            self.ws();
            let v = self.value()?;
            m.set(&k, v);
            self.ws();
            if self.peek() == Some(b',') {
                self.i += 1;
                continue;
            }
            self.expect(b'}')?;
            return Ok(Value::Obj(m));
        }
    }

    fn arr(&mut self) -> Result<Value, String> {
        self.i += 1;
        let mut out = Vec::new();
        self.ws();
        if self.peek() == Some(b']') {
            self.i += 1;
            return Ok(Value::Arr(out));
        }
        loop {
            self.ws();
            out.push(self.value()?);
            self.ws();
            if self.peek() == Some(b',') {
                self.i += 1;
                continue;
            }
            self.expect(b']')?;
            return Ok(Value::Arr(out));
        }
    }

    fn hex4(&mut self) -> Result<u32, String> {
        let h = self.s.get(self.i..self.i + 4).ok_or_else(|| self.err("bad \\u escape"))?;
        if !h.iter().all(|b| b.is_ascii_hexdigit()) {
            return Err(self.err("bad \\u escape"));
        }
        self.i += 4;
        Ok(u32::from_str_radix(std::str::from_utf8(h).unwrap(), 16).unwrap())
    }

    fn str(&mut self) -> Result<String, String> {
        self.i += 1;
        let mut out: Vec<u8> = Vec::new();
        loop {
            let c = self.peek().ok_or_else(|| self.err("unterminated string"))?;
            self.i += 1;
            match c {
                b'"' => return Ok(String::from_utf8(out).unwrap()),
                c if c < 0x20 => return Err(self.err("control character in string")),
                b'\\' => {
                    let e = self.peek().ok_or_else(|| self.err("unterminated string"))?;
                    self.i += 1;
                    let ch = match e {
                        b'"' => '"',
                        b'\\' => '\\',
                        b'/' => '/',
                        b'b' => '\u{8}',
                        b'f' => '\u{c}',
                        b'n' => '\n',
                        b'r' => '\r',
                        b't' => '\t',
                        b'u' => {
                            let hi = self.hex4()?;
                            // A surrogate pair is one character. A lone
                            // surrogate cannot live in a Rust string: U+FFFD.
                            if (0xD800..0xDC00).contains(&hi) && self.s[self.i..].starts_with(b"\\u") {
                                let save = self.i;
                                self.i += 2;
                                let lo = self.hex4()?;
                                if (0xDC00..0xE000).contains(&lo) {
                                    char::from_u32(0x10000 + ((hi - 0xD800) << 10) + (lo - 0xDC00)).unwrap()
                                } else {
                                    self.i = save;
                                    '\u{FFFD}'
                                }
                            } else {
                                char::from_u32(hi).unwrap_or('\u{FFFD}')
                            }
                        }
                        _ => return Err(self.err("bad escape")),
                    };
                    let mut buf = [0u8; 4];
                    out.extend_from_slice(ch.encode_utf8(&mut buf).as_bytes());
                }
                c => out.push(c),
            }
        }
    }

    /// `-?(0|[1-9][0-9]*)(\.[0-9]+)?([eE][+-]?[0-9]+)?`
    fn num(&mut self) -> Result<Value, String> {
        let start = self.i;
        let s = self.s;
        let mut j = self.i;
        let digits = |mut j: usize| {
            let k = j;
            while j < s.len() && s[j].is_ascii_digit() {
                j += 1;
            }
            (j > k).then_some(j)
        };
        if s.get(j) == Some(&b'-') {
            j += 1;
        }
        j = match s.get(j) {
            Some(b'0') => j + 1,
            Some(b'1'..=b'9') => digits(j).unwrap(),
            _ => return Err(self.err("unexpected token")),
        };
        if s.get(j) == Some(&b'.') {
            j = digits(j + 1).ok_or_else(|| self.err("bad number"))?;
        }
        if matches!(s.get(j), Some(b'e' | b'E')) {
            let mut k = j + 1;
            if matches!(s.get(k), Some(b'+' | b'-')) {
                k += 1;
            }
            j = digits(k).ok_or_else(|| self.err("bad number"))?;
        }
        self.i = j;
        let text = std::str::from_utf8(&s[start..j]).unwrap();
        Ok(Value::Num(text.parse::<f64>().unwrap()))
    }
}
