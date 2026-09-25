"""Yui Lines (YL) v0 parser for Python. Spec: spec/YL.md
Conformance: spec/conformance (python3 parsers/python/conformance.py)
A line-for-line port of the JS reference, site/lib/yl/yl.mjs.
Stdlib only, Python 3.9+.

One line in, one op out. Ops are dicts:
  {"op": "add",   "screen", "preset", "id", "props", "line"}
  {"op": "patch", "screen", "target", "props", "line"}
  {"op": "save",  "screen", "name", "line"}       save the screen under a name
  {"op": "show",  "screen", "name", "line"}       restore a saved screen
  {"op": "forget", "screen", "name", "line"}      take a saved screen off the shelf
  {"op": "clear", "screen", "line"}
  {"op": "focus", "screen", "line"}               bare ">2": later lines go to screen 2
  {"op": "end",   "screen", "target", "line"}     close the open group (deck, plan, narrate)
  {"op": "theme", "screen", "props", "line"}      restyle this agent's look
  {"op": "close", "screen": "full", "line"}       `close` or bare ">chat"
  {"op": "talk",  "screen", "props": {"on"}, "line"}  `>2 talk`: page 2 keeps the composer
  {"op": "error", "screen", "message", "line"}
`props` holds only what the line actually said. Defaults live in resolve().
An add that joins an open group (a page under a deck) also carries "in".
"""

from __future__ import annotations

import json
import math
import re

__all__ = [
    "PRESETS", "CORE", "GROUPS", "STAGE", "CHART_TYPES", "FIELD_TYPES",
    "tokenize", "seconds", "quantity", "calc_var", "parse_args",
    "Parser", "StreamParser", "parse", "on_stage", "is_workout", "page_of", "resolve",
]

PRESETS = [
    "timer", "ask", "choose", "pick", "slide", "form",
    "list", "table", "card", "image", "camera", "mic",
    "gallery", "video", "compare", "storyboard",
    "chart", "stat", "math", "step", "calc",
    "deck", "page", "plan", "project", "narrate",
    "timeline", "done", "now", "next",
    "sketch", "row", "after",
    "game",
]
# Not presets, but valid line heads.
CORE = ["say", "custom", "save", "show", "forget", "clear", "end", "theme", "close", "talk"]

# Groups: a group head collects the lines that follow it on the same screen,
# as long as each one is a member preset. Anything else ends the group, and
# so does `end`. Comments, blank lines and error lines do not.
GROUPS = {
    "deck": ["page", "ask", "choose", "pick"],
    "plan": ["page", "ask", "choose", "pick", "slide", "form", "mic", "camera"],
    "narrate": ["page", "compare", "image", "video", "card", "stat", "chart", "math", "storyboard", "gallery", "deck"],
    "timeline": ["done", "now", "next"],
    "sketch": ["row", "after"],
}

# ---------- JS compatibility ----------
# The reference is JavaScript, so whitespace, digits and "trim" follow JS
# rules: \d and \w are ASCII, \s is the JS whitespace set.

WS = "\t\n\v\f\r    -     　﻿"
_WS_CHARS = "\t\n\v\f\r       　﻿" + "".join(chr(c) for c in range(0x2000, 0x200B))
S = f"[{WS}]"
NS = f"[^{WS}]"
DOT = "[^\n\r  ]"  # JS "." without the s flag


def _re(p, flags=0):
    return re.compile(p, flags | re.ASCII)


def _is_ws(c):
    return c in _WS_CHARS


def _trim(s):
    return s.strip(_WS_CHARS)


def _num(s):
    """JS Number() of a numeric literal the regexes already vetted."""
    v = float(s)
    return int(v) if v.is_integer() and abs(v) < 2**53 else v


def _is_number(v):
    return isinstance(v, (int, float)) and not isinstance(v, bool)


def _js_str(v):
    """JS String(v) for the values props can hold."""
    if v is True:
        return "true"
    if v is False:
        return "false"
    if isinstance(v, float):
        if v.is_integer() and abs(v) < 1e21:
            return str(int(v))
        return repr(v)
    return str(v)


def _to_number(v):
    """JS ToNumber, for the comparisons in is_workout."""
    if v is None:
        return 0
    if isinstance(v, bool):
        return 1 if v else 0
    if _is_number(v):
        return v
    if isinstance(v, list):
        if not v:
            return 0
        return _to_number(_js_str(v[0])) if len(v) == 1 else math.nan
    s = _trim(str(v))
    if not s:
        return 0
    try:
        return float(s)
    except ValueError:
        return math.nan


IDENT = _re(r"[a-z_][\w-]*", re.I)

# ---------- tokenizer ----------


class Token:
    """A run of non-space characters in which double-quoted segments may
    contain spaces.
      raw     the exact source text
      text    the text with quotes removed
      quoted  true when the whole token was one quoted string
      parts   segments split on "|" outside quotes (None when there is no "|")
      key     set when the token is key=value (key must be an identifier)
      value   the unquoted text after "=", or its parts when it has "|"
      vquoted per value part, true when that part held a quoted string
    """

    __slots__ = ("raw", "text", "quoted", "parts", "key", "value", "vquoted")

    def __init__(self, raw, text, quoted, parts):
        self.raw, self.text, self.quoted, self.parts = raw, text, quoted, parts
        self.key = self.value = self.vquoted = None

    def __repr__(self):
        return f"Token({self.raw!r})"


def tokenize(line):
    tokens = []
    i = 0
    n = len(line)
    while i < n:
        while i < n and _is_ws(line[i]):
            i += 1
        if i >= n:
            break
        # Comment: a "#" that starts a token and is followed by space or EOL.
        if line[i] == "#" and (i + 1 >= n or _is_ws(line[i + 1])):
            break
        start = i
        segs = [""]
        seg_q = [False]  # per segment: held a quoted string
        any_quote = False
        whole_quoted = line[i] == '"'
        eq_at = -1  # index into segs[0] where "=" appeared, outside quotes
        while i < n and not _is_ws(line[i]):
            c = line[i]
            if c == '"':
                any_quote = True
                seg_q[-1] = True
                i += 1
                while i < n and line[i] != '"':
                    if line[i] == "\\" and i + 1 < n:
                        segs[-1] += line[i + 1]
                        i += 2
                        continue
                    segs[-1] += line[i]
                    i += 1
                i += 1  # closing quote (or EOL for an unterminated string)
                if i < n and not _is_ws(line[i]):
                    whole_quoted = False
                continue
            if c == "|":
                segs.append("")
                seg_q.append(False)
                whole_quoted = False
                i += 1
                continue
            if c == "=" and eq_at < 0 and len(segs) == 1 and not any_quote and IDENT.fullmatch(segs[0]):
                eq_at = len(segs[0])
            segs[-1] += c
            i += 1
        raw = line[start:i]
        t = Token(raw, "|".join(segs), whole_quoted and len(segs) == 1, segs if len(segs) > 1 else None)
        if eq_at >= 0:
            t.key = segs[0][:eq_at]
            first = segs[0][eq_at + 1:]
            vparts = [first, *segs[1:]]
            t.value = vparts if len(vparts) > 1 else first
            t.vquoted = seg_q
            t.parts = None
        tokens.append(t)
    return tokens


# ---------- value helpers ----------

NUM = _re(r"-?\d+(\.\d+)?")
RANGE = _re(r"(-?\d+(?:\.\d+)?)-(-?\d+(?:\.\d+)?)")
DUR = r"(\d+(?::\d{1,2})?(?:\.\d+)?[smh]?)"
TIMESPEC = _re(rf"{DUR}(?:/{DUR})?(?:x(\d+))?")
SECONDS = _re(r"(\d+)(?::(\d{1,2}))?(\.\d+)?([smh]?)")


def seconds(s):
    if s is None:
        return None
    m = SECONDS.fullmatch(_js_str(s))
    if not m:
        return None
    if m[2] is not None:
        return int(m[1]) * 60 + int(m[2])
    v = _num(m[1] + (m[3] or ""))
    return _num(str(v * 60)) if m[4] == "m" else _num(str(v * 3600)) if m[4] == "h" else v


def _coerce(v):
    if isinstance(v, list):
        return [_coerce(x) for x in v]
    if NUM.fullmatch(v):
        return _num(v)
    if v in ("on", "true"):
        return True
    if v in ("off", "false"):
        return False
    return v


# Keys whose values are never typed: a quiz answer is compared with option
# text, so answer=4 and answer=on stay "4" and "on".
TEXT_KEYS = {"answer"}
FLAG = _re(r"\+[a-z][\w-]*", re.I)


def _split(tokens):
    """Splits tokens into key/values, +flags and positionals."""
    kv, flags, pos = {}, {}, []
    for t in tokens:
        if t.key and t.key in TEXT_KEYS:
            kv[t.key] = t.value
        elif t.key:
            if isinstance(t.value, list):
                kv[t.key] = [v if t.vquoted[i] else _coerce(v) for i, v in enumerate(t.value)]
            else:
                kv[t.key] = t.value if t.vquoted[0] else _coerce(t.value)
        elif not t.quoted and not t.parts and FLAG.fullmatch(t.raw):
            flags[t.raw[1:]] = True
        else:
            pos.append(t)
    return kv, flags, pos


def _join(toks):
    return " ".join(t.text for t in toks)


# Media: a URL is a token starting http://, https://, / or data:.
URL_RE = _re(r"(https?://|/|data:)")


def _is_url(s):
    return bool(URL_RE.match(s))


def _media_token(t):
    """A URL with an optional caption after the first "|"."""
    segs = t.parts or [t.text]
    if not _is_url(segs[0]):
        return None
    i = segs[0].find("|")
    if i > 0:
        return segs[0][:i], segs[0][i + 1:]
    return segs[0], "|".join(segs[1:]) if len(segs) > 1 else ""


def _media_set(pos, items_key, caps_key):
    """Positionals of a media set: URLs become items, any other text is the title."""
    o, items, caps, title = {}, [], [], []
    for t in pos:
        m = _media_token(t)
        if m:
            items.append(m[0])
            caps.append(m[1])
        else:
            title.append(t)
    if title:
        o["title"] = _join(title)
    if items:
        o[items_key] = items
    if any(caps):
        o[caps_key] = caps
    return o


def _clean(o):
    for k in list(o):
        if o[k] is None or (isinstance(o[k], list) and not o[k]):
            del o[k]
    return o


# ---------- presets ----------
# Each takes positionals and returns explicit props. Key/values and flags are
# merged on top by parse_args, so any prop can also be set as key=value.


def _timer(pos):
    o, rest = {}, []
    for t in pos:
        m = not t.quoted and "work" not in o and TIMESPEC.fullmatch(t.text)
        if m:
            o["work"] = seconds(m[1])
            if m[2]:
                o["rest"] = seconds(m[2])
            if m[3]:
                o["rounds"] = int(m[3])
        else:
            rest.append(t)
    if rest:
        o["label"] = _join(rest)
    return o


def _ask(pos):
    o, q = {}, []
    for t in pos:
        if t.parts and "options" not in o:
            o["options"] = t.parts
        else:
            q.append(t)
    # Loose options: with no options token, two or more quoted tokens at the
    # end, after at least one question token, are the options.
    if "options" not in o:
        k = len(q)
        while k > 1 and q[k - 1].quoted:
            k -= 1
        if len(q) - k >= 2:
            o["options"] = [t.text for t in q[k:]]
            del q[k:]
    if q:
        o["q"] = _join(q)
    return o


def _slide(pos):
    o, label = {}, []
    for t in pos:
        m = not t.quoted and "min" not in o and RANGE.fullmatch(t.text)
        if m:
            o["min"], o["max"] = _num(m[1]), _num(m[2])
        elif t.parts and len(t.parts) == 2 and not o.get("lo"):
            o["lo"], o["hi"] = t.parts
        else:
            label.append(t)
    if label:
        o["label"] = _join(label)
    return o


def _form(pos):
    o, title = {"fields": []}, []
    for t in pos:
        f = _field(t)
        if f:
            o["fields"].append(f)
        else:
            title.append(t)
    if title:
        o["title"] = _join(title)
    return o


def _list(pos):
    o = {"items": []}
    for t in pos:
        if "title" not in o and not o["items"] and not t.quoted and not t.parts:
            o["title"] = t.text
            continue
        if t.parts:
            o["items"].extend(t.parts)
        else:
            o["items"].append(t.text)
    return o


def _table(pos):
    o = {"rows": []}
    for t in pos:
        if "name" not in o and "cols" not in o and not t.parts and not t.quoted:
            o["name"] = t.text
            continue
        cells = t.parts or (t.text.split("|") if "|" in t.text else [t.text])
        if "cols" not in o:
            o["cols"] = cells
        else:
            o["rows"].append([_coerce(c) for c in cells])
    return o


def _card(pos):
    o = {}
    if pos:
        o["title"] = pos[0].text
    if len(pos) > 1:
        o["body"] = _join(pos[1:])
    return o


def _row(pos):
    """done / now / next text... [https://link]: the first bare https token is url."""
    o, text = {}, []
    for t in pos:
        if "url" not in o and not t.parts and not t.quoted and t.text.startswith("https://"):
            o["url"] = t.text
        else:
            text.append(t)
    if text:
        o["text"] = _join(text)
    return o


GAME_WORD = _re(r"[A-Za-z][A-Za-z0-9_-]*")
# Game kinds this renderer can play. Any other kind still parses.
GAMES = ["tictactoe", "snake", "memory"]


def _game(pos):
    """game KIND [title...]: the first bare word is the kind, wherever it sits."""
    o, text = {}, []
    for t in pos:
        if "kind" not in o and not t.parts and not t.quoted and GAME_WORD.fullmatch(t.text):
            o["kind"] = t.text
        else:
            text.append(t)
    if text:
        o["title"] = _join(text)
    return o


def _image(pos):
    o, cap = {}, []
    for t in pos:
        if not o.get("src") and _is_url(t.text):
            o["src"] = t.text
        else:
            cap.append(t)
    if cap:
        o["caption" if o.get("src") else "prompt"] = _join(cap)
    return o


def _camera(pos):
    o, q = {}, []
    for t in pos:
        if not t.quoted and t.text in ("front", "back"):
            o["facing"] = t.text
        else:
            q.append(t)
    if q:
        o["prompt"] = _join(q)
    return o


def _mic(pos):
    return {"prompt": _join(pos)} if pos else {}


def _compare(pos):
    o, title = {}, []
    for t in pos:
        if "after" not in o and not t.parts and _is_url(t.text):
            o["before" if "before" not in o else "after"] = t.text
        else:
            title.append(t)
    if title:
        o["title"] = _join(title)
    return o


CHART_TYPES = ["line", "bar", "area", "scatter", "pie", "donut"]


def _chart(pos):
    """chart [type] [title...]: the first bare chart type is the type."""
    o, title = {}, []
    for t in pos:
        if "type" not in o and not t.quoted and not t.parts and t.text in CHART_TYPES:
            o["type"] = t.text
        else:
            title.append(t)
    if title:
        o["title"] = _join(title)
    return o


def _stat(pos):
    """stat VALUE [label...]: the first quantity is the value and its unit."""
    o, label = {}, []
    for t in pos:
        q = "value" not in o and not t.quoted and not t.parts and quantity(t.text)
        if q:
            o["value"] = q["value"]
            if q.get("unit"):
                o["unit"] = q["unit"]
        else:
            label.append(t)
    if "value" not in o and label:
        o["value"] = label.pop(0).text
    if label:
        o["label"] = _join(label)
    return o


def _step(pos):
    o, text = {}, []
    for t in pos:
        if "img" not in o and not t.parts and _is_url(t.text):
            o["img"] = t.text
        else:
            text.append(t)
    if text:
        o["text"] = _join(text)
    return o


def _titled(pos):
    return {"title": _join(pos)} if pos else {}


def _page(pos):
    """page title [body...] [URL]: the first URL is img, as in card otherwise."""
    o, text = {}, []
    for t in pos:
        if "img" not in o and not t.parts and _is_url(t.text):
            o["img"] = t.text
        else:
            text.append(t)
    if text:
        o["title"] = text[0].text
    if len(text) > 1:
        o["body"] = _join(text[1:])
    return o


P = {
    "timer": _timer,
    "ask": _ask, "choose": _ask, "pick": _ask,
    "slide": _slide,
    "form": _form,
    "list": _list,
    "table": _table,
    "card": _card,
    "image": _image,
    "camera": _camera,
    "mic": _mic,
    "say": lambda pos: {"text": _join(pos)},
    # theme [named set] key=value...: the positional text is the set's name.
    "theme": lambda pos: {"name": _join(pos)} if pos else {},
    "gallery": lambda pos: _media_set(pos, "items", "caps"),
    "video": _image,
    "compare": _compare,
    "storyboard": lambda pos: _media_set(pos, "frames", "notes"),
    "chart": _chart,
    "stat": _stat,
    "step": _step,
    "calc": _titled, "deck": _titled, "plan": _titled, "narrate": _titled,
    "page": _page,
    "project": _card,
    "timeline": _titled,
    "done": _row, "now": _row, "next": _row,
    "sketch": _titled,
    "row": lambda pos: {"text": _join(pos)} if pos else {},
    "after": lambda pos: {"label": _join(pos)} if pos else {},
    "game": _game,
}

# Quantity: a number with an optional unit stuck to it. 72.5kg, 12%, $40.
QTY = _re(rf"([$€£¥])?(-?\d+(?:\.\d+)?(?:[eE]-?\d+)?){S}*([^\d{WS}.,+\-|=]{NS}*)?")


def quantity(s):
    if _is_number(s):
        return {"value": s}
    m = QTY.fullmatch(_js_str(s))
    if not m or (m[1] and m[3]):
        return None
    q = {"value": _num(m[2])}
    if m[1] or m[3]:
        q["unit"] = m[1] or m[3]
    return q


# calc variable: min-max[@value][unit] is a slider, a quantity is a constant.
VAR_RANGE = _re(rf"(-?\d+(?:\.\d+)?)-(-?\d+(?:\.\d+)?)(?:@(-?\d+(?:\.\d+)?))?{S}*([^\d{WS}]{NS}*)?")


def calc_var(v):
    if _is_number(v):
        return {"value": v}
    if not isinstance(v, str):
        return None
    r = VAR_RANGE.fullmatch(_trim(v))
    if r:
        lo, hi = _num(r[1]), _num(r[2])
        o = {"min": lo, "max": hi, "value": _num(r[3]) if r[3] is not None else _num(str((lo + hi) / 2))}
        if r[4]:
            o["unit"] = r[4]
        return o
    return quantity(_trim(v))


CALC_PROPS = {"title", "f", "plot", "unit", "digits"}
# A y value with an error: 12.5±0.4 or 12.5+-0.4.
PM = _re(r"(-?\d+(?:\.\d+)?)(?:±|\+-)(\d+(?:\.\d+)?)")

# Props that are always lists. A plain value is split on "|".
LISTS = {
    "gallery": ["items", "caps"],
    "storyboard": ["frames", "notes"],
    "compare": ["notes", "labels"],
    "chart": ["names", "color"],
    "table": ["units"],
    "page": ["points"],
    "project": ["facts", "next"],
    "pick": ["answer"],
    "game": ["items"],
}


def _as_list(v):
    return [_js_str(x) for x in (v if isinstance(v, list) else _js_str(v).split("|"))]


def _boxes(v):
    """Highlight boxes: hl=x,y,w,h|x,y,w,h in percent. Bad boxes are dropped."""
    out = []
    for b in v if isinstance(v, list) else _js_str(v).split("|"):
        n = [_trim(x) for x in _js_str(b).split(",")]
        if len(n) == 4 and all(NUM.fullmatch(x) for x in n):
            out.append([_num(x) for x in n])
    return out


def _cell_list(v):
    """Tic-tac-toe cells: always a list of numbers; a part that is not a number is dropped."""
    out = []
    for c in v if isinstance(v, list) else [v]:
        if isinstance(c, (int, float)) and not isinstance(c, bool):
            out.append(c)
        elif isinstance(c, str) and NUM.fullmatch(c):
            out.append(_num(c))
    return out


def _normalize(preset, o):
    for k in LISTS.get(preset, []):
        if k in o and o[k] is not True:
            o[k] = _as_list(o[k])
    if preset == "compare" and "hl" in o:
        o["hl"] = _boxes(o["hl"])
    if preset == "game":
        for k in ("x", "o"):
            if k in o:
                o[k] = _cell_list(o[k])
    if preset == "chart":
        _chart_series(o)
    if preset == "stat" and "spark" in o and not isinstance(o["spark"], list):
        o["spark"] = [o["spark"]]
    if preset == "step" and "time" in o:
        t = seconds(o["time"])
        o["time"] = t if t is not None else o["time"]
    if preset == "calc":
        for k in list(o):
            if k in CALC_PROPS:
                continue
            v = calc_var(o[k])
            if v:
                o[k] = v
    return o


YERR = _re(r"(y|err)(\d*)")


def _chart_series(o):
    """y, y2 ... are lists; 12.5±0.4 becomes 12.5 with its error in err, err2 ..."""
    if "x" in o and not isinstance(o["x"], list):
        o["x"] = [o["x"]]
    for k in list(o):
        m = YERR.fullmatch(k)
        if not m:
            continue
        lst = o[k] if isinstance(o[k], list) else [o[k]]
        if m[1] == "err":
            o[k] = lst
            continue
        errs, vals = [], []
        for v in lst:
            pm = isinstance(v, str) and PM.fullmatch(v)
            if not pm:
                errs.append(0)
                vals.append(v)
            else:
                errs.append(_num(pm[2]))
                vals.append(_num(pm[1]))
        o[k] = vals
        ek = f"err{m[2]}"
        if any(errs) and ek not in o:
            o[ek] = errs


# Raw-TeX presets. math: the rest of the line is TeX, verbatim, after any
# leading caption= / size= props. step: a lone "$" token starts the TeX part.
MATH_PROP = _re(rf'(caption|size)=("(?:[^"\\]|\\{DOT})*"|{NS}*)(?:{S}+|\Z)')
UNESCAPE = _re(rf"\\({DOT})")
ONE_QUOTED = _re(r'"[^"]*"')
STEP_TEX = _re(rf"(^|{S})\$({S}|\Z)")


def _math_args(rest):
    o = {}
    r = _trim(rest)
    while True:
        m = MATH_PROP.match(r)
        if not m:
            break
        o[m[1]] = UNESCAPE.sub(r"\1", m[2][1:-1]) if m[2].startswith('"') else m[2]
        r = r[m.end():]
    r = _trim(r)
    if ONE_QUOTED.fullmatch(r):
        r = r[1:-1]
    if r:
        o["tex"] = r
    return o


def _step_args(rest):
    m = STEP_TEX.search(rest)
    head = rest[:m.start()] if m else rest
    o = parse_args("step", tokenize(head))
    if m:
        tex = _trim(rest[m.end():])
        if tex:
            o["tex"] = tex
    return o


def _raw_args(preset, rest):
    return _math_args(rest) if preset == "math" else _step_args(rest)


RAW = {"math", "step"}

# Form field token: key:type, "Label":type, optional trailing "!" = required.
FIELD = _re(rf'(?:"((?:[^"\\]|\\{DOT})*)"|([a-z_][\w-]*))(?::({DOT}+?))?(!)?', re.I)
FIELD_TYPES = {"text", "long", "voice", "number", "email", "phone", "date", "time", "yes", "photo", "url"}
EDGE_QUOTES = _re(r'^"|"$')
SLUG = _re(r"[^a-z0-9]+")


def _slug(s):
    return re.sub(r"^_|_$", "", SLUG.sub("_", s.lower()))


def _field(t):
    if t.quoted:
        return None  # a quoted token alone is the form title
    m = FIELD.fullmatch(t.raw)
    if not m:
        return None
    label = UNESCAPE.sub(r"\1", m[1]) if m[1] is not None else None
    key = m[2] or _slug(label)
    typ = m[3]
    if typ is None and label is not None:
        return None  # "Title" without a type
    f = {"key": key}
    if label:
        f["label"] = label
    if typ:
        r = RANGE.fullmatch(typ)
        if r:
            f.update(type="range", min=_num(r[1]), max=_num(r[2]))
        elif "|" in typ:
            f.update(type="choice", options=[EDGE_QUOTES.sub("", s) for s in typ.split("|")])
        else:
            f["type"] = typ
    if m[4]:
        f["required"] = True
    return f


def parse_args(preset, tokens):
    kv, flags, pos = _split(tokens)
    fn = P.get(preset)
    base = fn(pos) if fn else {}
    return _clean(_normalize(preset, {**base, **flags, **kv}))


# ---------- line parser ----------

ROUTE = _re(rf">([\w-]+)(?:{S}+|\Z)")
COMMENT = _re(rf"#({S}|\Z)")
CUSTOM = _re(rf"custom(?:@([\w-]+))?{S}+({DOT}*)")
PATCH_AT = _re(r"([a-z]+)@([\w-]+)")
HEAD = _re(r"([a-z]+)(?:@([\w-]+))?")


def _no_constants(name):
    raise ValueError(f"bad JSON constant {name}")


class Parser:
    """Stateful: remembers the focused screen and which preset each id belongs
    to, so "~hiit rounds=10" knows to parse its args as a timer."""

    def __init__(self):
        self.screen = "1"
        self.ids = {}  # id -> preset
        self.auto = 0
        self.open = []  # open groups, innermost last: {id, preset, screen}

    def group(self, op):
        """Group bookkeeping for one parsed op. Errors (and None) leave groups open."""
        if not op or op["op"] in ("error", "theme"):
            return op
        if op["op"] == "close":
            self.open = []
            return op
        if op["op"] == "end":
            if not self.open:
                return {"op": "error", "screen": op["screen"], "message": "end: no open deck, plan, narrate, timeline or sketch", "line": op["line"]}
            g = self.open.pop()
            return {**op, "target": g["id"]}

        def joins(g):
            return op["op"] == "add" and op["screen"] == g["screen"] and op["preset"] in GROUPS[g["preset"]]

        while self.open and not joins(self.open[-1]):
            self.open.pop()
        out = op
        if self.open:
            g = self.open[-1]
            out = {"op": op["op"], "screen": op["screen"], "preset": op["preset"], "id": op["id"], "in": g["id"], "props": op["props"], "line": op["line"]}
        if op["op"] == "add" and op["preset"] in GROUPS:
            self.open.append({"id": op["id"], "preset": op["preset"], "screen": op["screen"]})
        return out

    def line(self, src):
        return self.group(self.parse_line(src))

    def parse_line(self, src):
        line = src[:-1] if src.endswith("\r") else src
        body = _trim(line)
        if not body or COMMENT.match(body):
            return None

        screen = self.screen
        route = ROUTE.match(body)
        if route:
            # `chat` is screen 1; a bare ">chat" closes the stage.
            screen = "1" if route[1] == "chat" else route[1]
            body = body[route.end():]
            if not body or COMMENT.match(body):
                self.screen = screen
                if route[1] == "chat":
                    return {"op": "close", "screen": "full", "line": line}
                return {"op": "focus", "screen": screen, "line": line}

        # custom {json}: the rest of the line is JSON, not YL tokens.
        cm = CUSTOM.fullmatch(body)
        if cm:
            try:
                spec = json.loads(cm[2], parse_constant=_no_constants)
            except (ValueError, RecursionError) as e:
                return {"op": "error", "screen": screen, "message": f"custom: bad JSON ({e})", "line": line}
            if cm[1]:
                id_ = cm[1]
            else:
                self.auto += 1
                id_ = f"c{self.auto}"
            self.ids[id_] = "custom"
            return {"op": "add", "screen": screen, "preset": "custom", "id": id_, "props": {"spec": spec}, "line": line}

        tokens = tokenize(body)
        if not tokens:
            return None
        head = tokens.pop(0).raw

        if head.startswith("~"):
            target = head[1:]
            # ~preset@id: the id when this reply made it, else the preset name.
            pm = PATCH_AT.fullmatch(target)
            if pm:
                if pm[1] not in PRESETS and pm[1] not in ("say", "custom"):
                    return {"op": "error", "screen": screen, "message": f'patch: unknown preset "{pm[1]}"', "line": line}
                known = self.ids.get(pm[2])
                if known and known != pm[1]:
                    return {"op": "error", "screen": screen, "message": f'patch: "{pm[2]}" is a {known}, not a {pm[1]}', "line": line}
                target = pm[2] if known else pm[1]
            preset = target if target in PRESETS or target == "say" else self.ids.get(target)
            if not preset:
                return {"op": "error", "screen": screen, "message": f'patch: nothing called "{target}"', "line": line}
            if preset == "custom":
                return {"op": "error", "screen": screen, "message": "patch: custom blocks are replaced, not patched", "line": line}
            props = _raw_args(preset, body[len(head):]) if preset in RAW else parse_args(preset, tokens)
            return {"op": "patch", "screen": screen, "target": target, "props": props, "line": line}

        if head in ("save", "show", "forget"):
            # The name is the rest of the line: `save leg day` is "leg day".
            name = " ".join(t.text for t in tokens if t.text)
            if not name:
                return {"op": "error", "screen": screen, "message": f"{head}: needs a name", "line": line}
            return {"op": head, "screen": screen, "name": name, "line": line}
        if head == "clear":
            return {"op": "clear", "screen": screen, "line": line}
        if head == "end":
            return {"op": "end", "screen": screen, "line": line}
        if head == "close":
            if tokens:
                return {"op": "error", "screen": screen, "message": "close: takes nothing else", "line": line}
            self.screen = "1"
            return {"op": "close", "screen": "full", "line": line}
        if head == "talk":
            # `talk` or `talk on` turns the composer on for this page, `talk off` takes it away.
            word = "on" if not tokens else tokens[0].text if len(tokens) == 1 else None
            if word not in ("on", "off"):
                return {"op": "error", "screen": screen, "message": "talk: takes nothing, on or off", "line": line}
            return {"op": "talk", "screen": screen, "props": {"on": word == "on"}, "line": line}
        if head == "theme":
            return {"op": "theme", "screen": screen, "props": parse_args("theme", tokens), "line": line}

        hm = HEAD.fullmatch(head)
        if not hm or not (hm[1] in PRESETS or hm[1] == "say"):
            return {"op": "error", "screen": screen, "message": f'unknown preset "{head}"', "line": line}
        preset = hm[1]
        if hm[2]:
            id_ = hm[2]
        else:
            self.auto += 1
            id_ = f"n{self.auto}"
        self.ids[id_] = preset
        props = _raw_args(preset, body[len(head):]) if preset in RAW else parse_args(preset, tokens)
        return {"op": "add", "screen": screen, "preset": preset, "id": id_, "props": props, "line": line}


def parse(text):
    """Parse a whole document at once."""
    p = Parser()
    return [op for op in (p.line(l) for l in text.split("\n")) if op]


class StreamParser:
    """Feed chunks as they arrive, get ops for every completed line.
    Lines render the moment their newline lands; flush() finishes the tail."""

    def __init__(self):
        self.buf = ""
        self.p = Parser()

    def push(self, chunk):
        self.buf += chunk
        out = []
        while (nl := self.buf.find("\n")) >= 0:
            op = self.p.line(self.buf[:nl])
            self.buf = self.buf[nl + 1:]
            if op:
                out.append(op)
        return out

    def flush(self):
        rest, self.buf = self.buf, ""
        op = self.p.line(rest) if _trim(rest) else None
        return [op] if op else []


# ---------- the stage ----------
# The stage is a full-screen layer over the chat (YL.md section 5).
# These presets open there unless they say +inline.
STAGE = ["timer", "camera", "mic", "deck", "plan", "game"]


def is_workout(preset, props=None):
    """A timer with rounds or rest. Workouts always open on the stage."""
    p = props or {}
    if preset != "timer" or p.get("up") is True:
        return False
    rounds = p.get("rounds")
    rest = p.get("rest")
    return _to_number(1 if rounds is None else rounds) > 1 or _to_number(0 if rest is None else rest) > 0


MAX_PAGE = 12


def page_of(screen):
    """The page a screen lives on (YL.md section 5, Pages): 2 to 12 are pages
    beside the chat; every other screen renders in the chat, page 1."""
    if isinstance(screen, str) and screen.isdigit() and str(int(screen)) == screen and 2 <= int(screen) <= MAX_PAGE:
        return int(screen)
    return 1

def talking(ops):
    """Chat with a screen (YL.md section 5, Pages): the pages whose composer is
    on after these ops, in number order. `talk` turns it on, `talk off` and
    `clear` take it away; only pages 2 to 12 have one to turn on."""
    on = set()
    for o in ops:
        n = page_of(o.get("screen"))
        if n == 1:
            continue
        if o["op"] == "talk" and o["props"]["on"]:
            on.add(n)
        elif o["op"] in ("clear", "talk"):
            on.discard(n)
    return sorted(on)


def typed_body(screen, words):
    """What the person typed on a page, as the agent reads it (YL.md section 7):
    a `[yui] screen=2` line, then the words. Anywhere else the words as they are."""
    return words if page_of(screen) == 1 else f"[yui] screen={screen}\n{words}"


_TYPED = re.compile(r"\[yui\] screen=(\S+)\r?\n")


def read_typed(body):
    """The other way: {"screen", "words"} for a message typed on a page, else None."""
    m = _TYPED.match(body)
    if not m or page_of(m.group(1)) == 1:
        return None
    return {"screen": m.group(1), "words": body[m.end():]}


def on_stage(op, style=None):
    """Whether an add op opens on the stage. `style` is the agent's style
    profile (theme style: screen=chat|full, gallery=...)."""
    style = style or {}
    if not op or op.get("op") != "add":
        return False
    if op.get("screen") == "full":
        return True
    p = op.get("props") or {}
    if is_workout(op.get("preset"), p):
        return True
    if page_of(op.get("screen")) != 1:
        return False
    if p.get("inline") is True:
        return False
    if style.get("screen") == "chat":
        return False
    if style.get("screen") == "full":
        return True
    if op.get("preset") in STAGE:
        return True
    layout = p.get("layout")
    return op.get("preset") == "gallery" and (layout if layout is not None else style.get("gallery")) == "row3d"


# ---------- defaults ----------

_DEFAULTS = {
    "timer": {"work": 60, "rest": 0, "rounds": 1, "label": "", "up": False, "auto": False, "sound": True},
    "ask": {"q": "Continue?", "options": ["Yes", "No"]},
    "choose": {"q": "", "options": [], "other": False},
    "pick": {"q": "", "options": [], "other": False, "submit": "Done"},
    "form": {"title": "", "fields": [], "submit": "Submit"},
    "list": {"title": "", "items": [], "check": False, "num": False},
    "table": {"name": "", "cols": None, "rows": [], "units": [], "sort": False},
    "card": {"title": "", "body": ""},
    "image": {"fit": "cover", "edit": False},
    "camera": {"prompt": "Take a photo", "facing": "back", "scan": False},
    "mic": {"prompt": "Tap and talk", "auto": False},
    "gallery": {"title": "", "items": [], "caps": [], "layout": "row", "pick": False, "submit": "Done"},
    "video": {"loop": False, "auto": False, "mute": False},
    "compare": {"title": "", "mode": "slider", "labels": ["Before", "After"], "notes": [], "hl": [], "pick": False},
    "storyboard": {"title": "", "frames": [], "notes": [], "reorder": False, "comment": True},
    "chart": {"type": "line", "title": "", "x": [], "names": [], "unit": "", "stack": False},
    "stat": {"label": "", "unit": "", "good": "up"},
    "math": {"tex": "", "size": "md"},
    "step": {"text": "", "all": False},
    "calc": {"title": "", "digits": 3},
    "deck": {"title": "", "layout": "slides", "full": False, "notes": False},
    "page": {"title": "", "body": "", "points": [], "notes": ""},
    "plan": {"title": "", "submit": "Send", "review": True},
    "narrate": {"title": "", "voice": "agent", "rate": 1, "auto": False, "captions": True},
    "timeline": {"title": "", "mark": "Now", "fold": 5, "reorder": False},
    "done": {"text": ""}, "now": {"text": ""}, "next": {"text": ""},
    "sketch": {"title": "", "frame": "window", "before": "Before"},
    "row": {"text": ""}, "after": {"label": "After"},
    "game": {"title": "", "you": "x", "first": "you", "speed": 2, "size": 15, "pairs": 6, "items": []},
}


def resolve(preset, props):
    """Explicit props over the preset's defaults."""
    p = dict(props)
    if preset == "slide":
        r = {"label": "", "min": 1, "max": 5, "step": 1, **p}
        if "value" not in r:
            r["value"] = math.floor((r["min"] + r["max"]) / 2 + 0.5)
        return r
    if preset == "project":
        cta = p.get("cta")
        return {"title": "", "body": "", "facts": [], "next": [], "status": "", **p,
                "cta": cta if cta is not None else ("Open" if p.get("open") else "")}
    if preset == "game":
        # Cells outside 1-9 are ignored, and a cell both marks claim is x's.
        def cells(v):
            out = []
            for n in v or []:
                if n == int(n) and 1 <= n <= 9 and int(n) not in out:
                    out.append(int(n))
            return out
        r = {**json.loads(json.dumps(_DEFAULTS["game"])), **p}
        r["kind"] = _js_str(p.get("kind", "")).lower()
        r["x"] = cells(p.get("x"))
        r["o"] = [n for n in cells(p.get("o")) if n not in r["x"]]
        return r
    return {**json.loads(json.dumps(_DEFAULTS.get(preset, {}))), **p}
