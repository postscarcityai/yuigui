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
                                                  `theme app ...`: props.scope "app", a restyle of Yui's own chrome
  {"op": "close", "screen": "full", "line"}       `close` or bare ">chat"
  {"op": "talk",  "screen", "props": {"on"}, "line"}  `>2 talk`: page 2 keeps the composer
  {"op": "doing", "screen", "props": {"text"?, "step"?, "of"?}, "line"}  what the agent is doing,
                                                  in the working row (`doing off`: props {"off": True})
  {"op": "visual", "screen", "props": {"look"?, "tone"?, "react"?}, "line"}  a live shader behind
                                                  the stage (`visual off`: props {"off": True})
  {"op": "menu",  "screen", "id", "props": {"bucket", "label", ...}, "line"}  an item in the drawer
  {"op": "error", "screen", "message", "line"}
`props` holds only what the line actually said. Defaults live in resolve().
An add that joins an open group (a page under a deck) also carries "in".
A `flow` head is an add; the Mermaid lines after it are buffered and its
`end` (or the end of the input) gives one patch on the flow with the graph
(spec/FLOWS.md). Call finish() after the last line (parse and flush do).
"""

from __future__ import annotations

import json
import math
import re

__all__ = [
    "PRESETS", "CORE", "GROUPS", "STAGE", "CHART_TYPES", "FIELD_TYPES", "KIT",
    "tokenize", "seconds", "quantity", "calc_var", "parse_args",
    "Parser", "StreamParser", "parse", "on_stage", "is_workout", "page_of", "resolve",
    "FLOW_STEPS", "flow_when", "flow_test", "flow_next", "flow_first", "flow_path", "flow_ahead", "flow_event",
    "flow_variant", "variant_name", "doing_of", "visual_of", "VISUAL_LOOKS", "VISUAL_REACT",
]

PRESETS = [
    "timer", "ask", "choose", "pick", "slide", "form",
    "list", "table", "card", "image", "camera", "mic",
    "gallery", "video", "compare", "storyboard",
    "chart", "stat", "math", "step", "calc",
    "deck", "page", "plan", "project", "narrate",
    "timeline", "done", "now", "next",
    "sketch", "row", "after",
    "shapes", "shape",
    "diagram", "mock", "part", "motion",
    "map", "area", "pin", "route",
    "game",
    "query", "flow",
    "loop", "drums", "keys", "chords", "tuner", "metronome",
]
# Not presets, but valid line heads.
CORE = ["say", "custom", "save", "show", "forget", "clear", "end", "theme", "close", "talk", "menu", "put", "doing", "visual"]

# Groups: a group head collects the lines that follow it on the same screen,
# as long as each one is a member preset. Anything else ends the group, and
# so does `end`. Comments, blank lines and error lines do not.
GROUPS = {
    "deck": ["page", "ask", "choose", "pick", "sketch", "shapes", "diagram", "mock", "map", "math", "chart", "stat", "calc"],
    "plan": ["page", "ask", "choose", "pick", "slide", "form", "mic", "camera", "sketch", "shapes", "diagram", "mock", "map"],
    "narrate": ["page", "compare", "image", "video", "card", "stat", "chart", "math", "storyboard", "gallery", "deck"],
    "timeline": ["done", "now", "next"],
    "sketch": ["row", "after"],
    "shapes": ["shape"],
    "mock": ["part"],
    "map": ["area", "pin", "route"],
}

# A timeline's rows. A patch's `kind=` moves one to another of these.
ROWS = GROUPS["timeline"]


def mark_at(kinds):
    """Where the now marker sits among a timeline's row kinds, in line order:
    before the first row that is not done, or after the last when all are done."""
    return next((i for i, k in enumerate(kinds) if k != "done"), len(kinds))


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


def _kinded(rest):
    """KIND [text...]: the first bare word is the kind, wherever it sits; the rest is `rest`."""
    def f(pos):
        o, text = {}, []
        for t in pos:
            if "kind" not in o and not t.parts and not t.quoted and GAME_WORD.fullmatch(t.text):
                o["kind"] = t.text
            else:
                text.append(t)
        if text:
            o[rest] = _join(text)
        return o
    return f


_game = _kinded("title")


# Music positionals: `specs` maps a prop to the test its bare token must
# pass; the first bare token that passes a still-empty prop's test fills it.
BPM = _re(r"(\d+(?:\.\d+)?)(?:bpm)?", re.I)
GRID = _re(r"[1-4]x[1-4]", re.I)
KEY = _re(r"[A-G][#b]?m?")
SCALE = _re(r"major|minor|pentatonic|blues|dorian|mixolydian|chromatic")
ROMAN = _re(r"[b#]?[ivIV]+[a-z0-9+]*(?:-[b#]?[ivIV]+[a-z0-9+]*)+")
INSTRUMENT = _re(r"guitar|ukulele|bass|chromatic")


def _music(specs, extra=None):
    """Each music preset takes its special positionals, wherever they sit; the rest is the title."""
    def f(pos):
        o, text = {}, []
        for t in pos:
            bare = not t.quoted and not t.parts
            k = next((k for k in specs if k not in o and specs[k].fullmatch(t.text)), None) if bare else None
            if k == "bpm":
                o["bpm"] = _num(BPM.fullmatch(t.text)[1])
            elif k:
                o[k] = t.text
            elif not (extra and extra(t, o)):
                text.append(t)
        if text:
            o["title"] = _join(text)
        return o
    return f


def _chord_list(t, o):
    """chords also takes the first options token C|G|Am|F as its chords."""
    if t.parts and "chords" not in o:
        o["chords"] = t.parts
        return True
    return False


def _chords(pos):
    o = _music({"key": KEY, "prog": ROMAN}, _chord_list)(pos)
    if isinstance(o.get("prog"), str):
        o["prog"] = o["prog"].split("-")
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


QUERY_VIEWS = ["table", "list", "chart", "stat", "send"]


def _query(pos):
    """query <table> [as table|list|chart|stat|send] [chart type] [title...]
    (spec/TABLES.md). The first bare word is the table, `as` picks the view."""
    o, rest = {}, []

    def bare(t):
        return t is not None and not t.quoted and not t.parts

    i = 0
    while i < len(pos):
        t = pos[i]
        nxt = pos[i + 1] if i + 1 < len(pos) else None
        if "table" not in o and bare(t):
            o["table"] = t.text
        elif bare(t) and t.text == "as" and bare(nxt) and nxt.text in QUERY_VIEWS:
            i += 1
            o["as"] = nxt.text
            after = pos[i + 1] if i + 1 < len(pos) else None
            if o["as"] == "chart" and bare(after) and after.text in CHART_TYPES:
                i += 1
                o["type"] = after.text
        else:
            rest.append(t)
        i += 1
    if rest:
        o["title"] = _join(rest)
    return o


# A country code (ISO 3166 alpha-2 or alpha-3) and a lat,lon place.
ISO = _re(r"[A-Z]{2,3}")
LATLON = _re(r"-?\d+(\.\d+)?,-?\d+(\.\d+)?")


def _area(pos):
    """area [label...] [CN|MN] [lat,lon|...]: codes and a drawn outline; the rest is the label."""
    o, text = {}, []
    for t in pos:
        if not t.quoted and not t.parts and ISO.fullmatch(t.text):
            o.setdefault("codes", []).append(t.text)
        elif not t.quoted and t.parts and all(ISO.fullmatch(x) for x in t.parts):
            o.setdefault("codes", []).extend(t.parts)
        elif "pts" not in o and not t.quoted and t.parts and all(LATLON.fullmatch(x) for x in t.parts):
            o["pts"] = list(t.parts)
        else:
            text.append(t)
    if text:
        o["label"] = _join(text)
    return o


def _pin(pos):
    """pin [label...] [lat,lon]: the first bare lat,lon is where it goes."""
    o, text = {}, []
    for t in pos:
        if "at" not in o and not t.quoted and not t.parts and LATLON.fullmatch(t.text):
            o["at"] = t.text
        else:
            text.append(t)
    if text:
        o["label"] = _join(text)
    return o


def _route(pos):
    """route [label...] [a|b|c]: the first options are its stops (lat,lon or a pin's id)."""
    o, text = {}, []
    for t in pos:
        if "pts" not in o and not t.quoted and t.parts:
            o["pts"] = list(t.parts)
        else:
            text.append(t)
    if text:
        o["label"] = _join(text)
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
    "calc": _titled, "deck": _titled, "plan": _titled, "flow": _titled, "narrate": _titled,
    "page": _page,
    "project": _card,
    "timeline": _titled,
    "done": _row, "now": _row, "next": _row,
    "sketch": _titled,
    "shapes": _titled,
    "shape": _kinded("label"),
    "diagram": _titled, "mock": _titled, "motion": _titled,
    "part": _kinded("text"),
    "map": _titled,
    "area": _area, "pin": _pin, "route": _route,
    "row": lambda pos: {"text": _join(pos)} if pos else {},
    "after": lambda pos: {"label": _join(pos)} if pos else {},
    "game": _game,
    "query": _query,
    "loop": _music({"bpm": BPM}),
    "metronome": _music({"bpm": BPM}),
    "drums": _music({"grid": GRID}),
    "keys": _music({"key": KEY, "scale": SCALE}),
    "chords": _chords,
    "tuner": _music({"instrument": INSTRUMENT}),
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
    "shape": ["pts"],
    "part": ["items"],
    "area": ["codes", "pts"],
    "route": ["pts"],
    "loop": ["rows", "p"],
    "drums": ["pads"],
    "chords": ["chords"],
    "tuner": ["strings"],
    "query": ["where", "sort", "cols", "y", "sum", "avg", "min", "max", "names", "color"],
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
    # prog=I-V-vi-IV and prog=I|V|vi|IV are the same list.
    if preset == "chords" and "prog" in o and o["prog"] is not True:
        o["prog"] = [c for x in _as_list(o["prog"]) for c in x.split("-") if c]
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


# ---------- flows (spec/FLOWS.md) ----------
# A flow is a Mermaid flowchart between `flow` and `end`. Each node can carry
# one step (a YL line), in a `%% node: <line>` comment or as its label; edge
# labels are conditions on earlier answers. Only the subset below is read;
# any other Mermaid line (style, classDef, click...) is kept in `source` and
# otherwise ignored, so the chart still renders anywhere Mermaid does.

# Presets a flow step can be.
FLOW_STEPS = ["page", "ask", "choose", "pick", "slide", "form", "mic", "camera"]
FLOW_HEADER = _re(rf"(flowchart|graph)({S}|\Z)")
FLOW_SKIP = _re(rf"(classDef|class|style|linkStyle|click|direction|accTitle|accDescr)({S}|:|\Z)")
STEP_LINE = _re(rf"({'|'.join(FLOW_STEPS)})(?={S}|\Z)")
NODE_ID = _re(r"\w+")
# Node shapes, longest opener first. Each opener lists its closers.
SHAPES = [
    ("(((", [")))"]), ("([", ["])"]), ("[[", ["]]"]), ("[(", [")]"]), ("((", ["))"]), ("{{", ["}}"]),
    ("[/", ["/]", "\\]"]), ("[\\", ["\\]", "/]"]), ("[", ["]"]), ("(", [")"]), ("{", ["}"]), (">", ["]"]),
]
# A node's shape by its opener, for a diagram (a plain [box] is the default).
NODE_SHAPE = {"(((": "double", "([": "stadium", "[[": "subroutine", "[(": "cylinder", "((": "circle", "{{": "hexagon",
              "[/": "slant", "[\\": "slant", "(": "round", "{": "diamond", ">": "flag"}
# Links: `-- text -->` first, then plain arrows with an optional |label|.
TEXT_LINK = _re(rf"{S}*<?(?:--|==|-\.)(?![->=.]){S}*({DOT}*?){S}*(?:-{{2,}}>|={{2,}}>|\.-+>|-{{3,}}|={{3,}}|\.-+)(?=[{WS}\w])")
LINK = _re(rf"{S}*(<?)(-{{2,}}>|-{{3,}}|={{2,}}>|={{3,}}|-\.+->|-\.+-|--[ox]|==[ox]|~{{3,}})")
PIPE = _re(rf"{S}*\|([^|]*)\|")
SUBGRAPH = _re(rf"subgraph({S}|\Z)")
STEP_COMMENT = _re(rf"%%{S}*(\w+){S}*:{S}*({DOT}*)")
STEP_HEAD = _re(rf"([a-z]+)(?={S}|\Z)")
FLOW_END = _re(rf"end{S}*;?")
_ENTITIES = {"quot": '"', "amp": "&", "lt": "<", "gt": ">", "nbsp": " ", "35": "#"}


def _new_flow(head, header):
    words = re.split(f"{S}+", _trim(header))
    return {"id": head["id"], "screen": head["screen"], "src": [*head["pre"], header], "depth": 0,
            "dir": (words[1] if len(words) > 1 and words[1] else "TD").upper(), "nodes": {}, "edges": [], "steps": {}}


def _unlabel(s):
    """Mermaid label text: quotes, markdown backticks, entity codes and <br> undone."""
    t = _trim(s)
    if re.fullmatch(r'".*"', t, re.S):
        t = t[1:-1]
    if re.fullmatch(r"`.*`", t, re.S):
        t = t[1:-1]
    t = re.sub(rf"<br{S}*/?>", " ", t, flags=re.I | re.ASCII)
    t = re.sub(r"#(quot|amp|lt|gt|nbsp|35);", lambda m: _ENTITIES[m[1]], t)
    t = re.sub(r"#(\d+);", lambda m: chr(int(float(m[1])) % 65536), t, flags=re.ASCII)
    return _trim(t)


def _step_of(text):
    """A step from a YL line, or None when the line is not a flow step."""
    m = STEP_LINE.match(text)
    if not m:
        return None
    return {"preset": m[1], "props": parse_args(m[1], tokenize(text[m.end():]))}


def _statements(line):
    """Splits a Mermaid line on ";" outside quotes and brackets."""
    out, cur, q, depth = [], "", False, 0
    for c in line:
        if c == '"':
            q = not q
        elif not q and c in "[({":
            depth += 1
        elif not q and c in "])}":
            depth = max(0, depth - 1)
        if c == ";" and not q and not depth:
            out.append(cur)
            cur = ""
        else:
            cur += c
    out.append(cur)
    return [x for x in (_trim(x) for x in out) if x]


def _read_node(s):
    """One node at the start of `s`: id, then an optional shape with a label."""
    m = NODE_ID.match(s)
    if not m:
        return None
    rest = s[m.end():]
    node = {"id": m[0]}
    shape = next((sh for sh in SHAPES if rest.startswith(sh[0])), None)
    if shape:
        opener, closers = shape
        if opener in NODE_SHAPE:
            node["shape"] = NODE_SHAPE[opener]
        body = rest[len(opener):]
        end, n = -1, 0
        start = body.find('"', body.find('"') + 1) + 1 if body.lstrip(_WS_CHARS).startswith('"') else 0
        for c in closers:
            i = body.find(c, max(0, start))
            if i >= 0 and (end < 0 or i < end):
                end, n = i, len(c)
        if end < 0:
            return None
        node["label"] = _unlabel(body[:end])
        rest = body[end + n:]
    rest = re.sub(r"^:::\w+", "", rest, flags=re.ASCII)
    return {**node, "rest": rest}


def _read_nodes(s):
    """A node, or several joined with "&"."""
    out = []
    rest = s.lstrip(_WS_CHARS)
    while True:
        n = _read_node(rest)
        if not n:
            return {"nodes": out, "rest": rest} if out else None
        out.append(n)
        rest = n["rest"]
        amp = re.match(rf"{S}*&{S}*", rest)
        if not amp:
            return {"nodes": out, "rest": rest}
        rest = rest[amp.end():]


def _add_node(f, n):
    had = f["nodes"].get(n["id"])
    shape = {"shape": n["shape"]} if f.get("drawn") and n.get("shape") else {}
    if not had:
        f["nodes"][n["id"]] = {"id": n["id"], **({"label": n["label"]} if "label" in n else {}), **shape, "order": len(f["nodes"])}
    else:
        if "label" in n:
            had["label"] = n["label"]
        had.update(shape)
    # A diagram's subgraph holds the nodes first written inside it.
    if f.get("stack") and not any(n["id"] in g["nodes"] for g in f["groups"]):
        f["stack"][-1]["nodes"].append(n["id"])


def _flow_statement(f, t):
    """One Mermaid line of an open flow. Returns an error message or None."""
    if not t:
        return None
    if t.startswith("%%"):
        if t.startswith("%%{"):
            return None  # a directive
        m = STEP_COMMENT.fullmatch(t)
        if not m:
            return None
        head = STEP_HEAD.match(m[2])
        if head and head[1] in PRESETS and head[1] not in FLOW_STEPS:
            return f"flow: a {head[1]} cannot be a step ({', '.join(FLOW_STEPS)})"
        step = _step_of(m[2])
        if step:
            f["steps"][m[1]] = step
        return None
    if SUBGRAPH.match(t):
        f["depth"] += 1
        if f.get("drawn"):
            m = re.fullmatch(rf"subgraph{S}+(\w+){S}*(?:\[({DOT}*)\])?{S}*", t, re.ASCII) or re.fullmatch(rf"subgraph{S}+({DOT}+?){S}*", t, re.ASCII)
            named = m.groups()[1] if m and m.re.groups > 1 else None
            label = _unlabel(named if named is not None else m[1]) if m else ""
            g = {"id": m[1] if m and re.fullmatch(r"\w+", m[1], re.ASCII) else f"g{len(f['groups']) + 1}", **({"label": label} if label else {}), "nodes": []}
            if f["stack"]:
                g["in"] = f["stack"][-1]["id"]
            f["groups"].append(g)
            f["stack"].append(g)
        return None
    if FLOW_SKIP.match(t) or FLOW_HEADER.match(t):
        return None
    for st in _statements(t):
        g = _read_nodes(st)
        if not g:
            continue
        for n in g["nodes"]:
            _add_node(f, n)
        while True:
            rest, label, hidden, how, both = g["rest"], None, False, "", False
            tl = TEXT_LINK.match(rest)
            if tl:
                label = tl[1]
                t0 = re.sub(r"^<", "", _trim(tl[0]))
                tail = re.search(r"\S+\Z", t0, re.ASCII)
                how = t0[:2] + (tail[0] if tail else "")
                both = _trim(tl[0]).startswith("<")
                rest = rest[tl.end():]
            else:
                lm = LINK.match(rest)
                if not lm:
                    break
                how = lm[2]
                both = lm[1] == "<"
                hidden = lm[2].startswith("~")
                rest = rest[lm.end():]
                p = PIPE.match(rest)
                if p:
                    label = p[1]
                    rest = rest[p.end():]
            to = _read_nodes(rest)
            if not to:
                break
            for n in to["nodes"]:
                _add_node(f, n)
            if not hidden:
                text = "" if label is None else _unlabel(label)
                for a in g["nodes"]:
                    for b in to["nodes"]:
                        e = {"from": a["id"], "to": b["id"]}
                        if text:
                            e["label"] = text
                        if f.get("drawn"):
                            if "=" in how:
                                e["line"] = "thick"
                            elif "." in how:
                                e["line"] = "dash"
                            if not how.endswith(">"):
                                e["plain"] = True
                            if both:
                                e["both"] = True
                        f["edges"].append(e)
            g = to
    return None


def _split_word(t, word):
    """Splits on a word (" or ") outside double quotes."""
    out, cur, q, i = [], "", False, 0
    sep = re.compile(rf"{S}+{word}{S}+", re.I | re.ASCII)
    while i < len(t):
        if t[i] == '"':
            q = not q
        m = not q and _is_ws(t[i]) and sep.match(t, i)
        if m:
            out.append(cur)
            cur = ""
            i = m.end()
            continue
        cur += t[i]
        i += 1
    out.append(cur)
    return out


# Edge label -> condition: a list of alternatives ("or"), each a list of
# clauses that must all hold ("and"). None for a default edge.
CLAUSE = _re(rf"([A-Za-z_]\w*(?:\.[\w-]+)*){S}*(>=|<=|!=|=|>|<|~){S}*({DOT}*)")
DEFAULT_EDGE = _re(r"else|default|otherwise", re.I)


def flow_when(label, frm=None):
    t = _trim(label or "")
    if not t or DEFAULT_EDGE.fullmatch(t):
        return None

    def clause(c):
        m = CLAUSE.fullmatch(_trim(c))
        raw = _trim(m[3]) if m else _trim(c)
        v = raw[1:-1] if re.fullmatch(rf'"{DOT}*"', raw) else _num(raw) if NUM.fullmatch(raw) else raw
        if m:
            return {"path": m[1], "op": m[2], "value": v}
        # A bare label ("Shop", "yes") is the answer of the step it leaves.
        return {"path": frm, "op": "=", "value": v} if frm else {"op": "=", "value": v}
    return [[clause(c) for c in _split_word(alt, "and")] for alt in _split_word(t, "or")]


def _flow_graph(f):
    """The graph a flow's end patches onto it."""
    nodes = []
    for node in f["nodes"].values():
        n = {k: v for k, v in node.items() if k != "order"}
        said = f["steps"].get(n["id"])
        step = said or (_step_of(n["label"]) if "label" in n else None)
        if not step:
            nodes.append(n)
            continue
        # A label that is the step's own line is not kept twice.
        base = n if said else {k: v for k, v in n.items() if k != "label"}
        nodes.append({**base, "preset": step["preset"], "props": step["props"]})
    is_step = {n["id"] for n in nodes if n.get("preset")}
    into = {e["to"] for e in f["edges"]}
    first = next((n for n in nodes if n["id"] not in into), nodes[0] if nodes else {})
    edges = []
    for e in f["edges"]:
        when = flow_when(e.get("label"), e["from"] if e["from"] in is_step else None)
        edges.append({**e, "when": when} if when else e)
    return _clean({"dir": f["dir"], "start": first.get("id"), "nodes": nodes, "edges": edges, "source": "\n".join(f["src"])})


# ---------- diagram (spec/YL.md, diagram) ----------
# A Mermaid block between `diagram` and `end`, drawn static. The first
# Mermaid line says which: a flowchart (read by the flow reader above, plus
# node shapes, link styles and subgraphs), a sequenceDiagram or a
# stateDiagram. Any other Mermaid type keeps only its `source`. The end gives
# one patch: {type, ...the drawing, source}.
DGM_HEADER = _re(rf"(flowchart|graph|sequenceDiagram|stateDiagram(?:-v2)?)(?={S}|;|\Z)")
DGM_OTHER = _re(rf"(classDiagram(?:-v2)?|erDiagram|journey|gantt|pie|mindmap|timeline|gitGraph|quadrantChart|requirementDiagram|C4\w+|sankey-beta|xychart-beta|block-beta)(?={S}|\Z)")
SEQ_MSG = _re(rf"([\w.]+){S}*(<<-->>|<<->>|-->>|->>|--\)|-\)|--x|-x|-->|->){S}*([+-]?){S}*([\w.]+){S}*(?::{S}*({DOT}*))?")
SEQ_HEAD = {">>": "arrow", ">": "none", ")": "async", "x": "cross"}
SEQ_PART = _re(rf"(participant|actor){S}+([\w.]+)(?:{S}+as{S}+({DOT}+))?")
SEQ_SKIP = _re(rf"(activate|deactivate|title|box|create|destroy|link|links|properties|details)({S}|\Z)")
SEQ_NOTE = _re(rf"Note{S}+(right of|left of|over){S}+([\w.]+)(?:{S}*,{S}*([\w.]+))?{S}*:{S}*({DOT}*)", re.I)
SEQ_OPEN = _re(rf"(loop|alt|opt|par|critical|break|rect)(?:{S}+({DOT}*))?")
SEQ_ELSE = _re(rf"(else|and|option)(?:{S}+({DOT}*))?")
STATE_SKIP = _re(rf"(direction|classDef|class|style|click|accTitle|accDescr|hide)({S}|\Z)")
STATE_DECL = _re(rf'state{S}+(?:"([^"]*)"{S}+as{S}+(\w+)|(\w+)){S}*(<<(?:choice|fork|join)>>)?{S}*(\{{)?')
STATE_EDGE = _re(rf"(\[\*\]|\w+){S}*(<?-->){S}*(\[\*\]|\w+){S}*(?::{S}*({DOT}*))?")
STATE_TEXT = _re(rf"(\w+){S}*:{S}*({DOT}+)")


def _new_diagram(head):
    return {"id": head["id"], "screen": head["screen"], "src": [], "kind": None, "depth": 0}


def _diagram_start(d, header):
    """Starts the reader once the header is known."""
    h = DGM_HEADER.match(header)
    if not h:
        d["kind"] = "other"
        return
    words = re.split(f"{S}+", header)
    d["dir"] = re.sub(";$", "", (words[1] if len(words) > 1 and words[1] else "TD")).upper()
    if h[1] in ("flowchart", "graph"):
        d["kind"] = "flow"
        d["f"] = {"nodes": {}, "edges": [], "steps": {}, "depth": 0, "drawn": True, "groups": [], "stack": []}
    elif h[1] == "sequenceDiagram":
        d["kind"] = "sequence"
        d["actors"] = {}
        d["steps"] = []
        d["open"] = 0
    else:
        d["kind"] = "state"
        d["nodes"] = {}
        d["edges"] = []
        d["groups"] = []
        d["stack"] = []
        d["note"] = False


def _seq_actor(d, id_, label="", actor=False):
    a = d["actors"].get(id_)
    if not a:
        d["actors"][id_] = {"id": id_, **({"label": label} if label else {}), **({"actor": True} if actor else {})}
    else:
        if label:
            a["label"] = label
        if actor:
            a["actor"] = True


def _seq_line(d, t):
    m = SEQ_PART.fullmatch(t)
    if m:
        _seq_actor(d, m[2], _unlabel(m[3]) if m[3] else "", m[1] == "actor")
        return
    if re.match(rf"autonumber({S}|\Z)", t, re.ASCII):
        d["numbered"] = True
        return
    if SEQ_SKIP.match(t):
        return
    m = SEQ_NOTE.fullmatch(t)
    if m:
        on = [m[2], *([m[3]] if m[3] else [])]
        for x in on:
            _seq_actor(d, x)
        d["steps"].append({"type": "note", "side": re.sub(" of$", "", m[1].lower()), "on": on, "text": _unlabel(m[4])})
        return
    m = SEQ_OPEN.fullmatch(t)
    if m:
        d["open"] += 1
        d["steps"].append({"type": "open", "block": m[1], **({"text": _unlabel(m[2])} if m[2] else {})})
        return
    m = SEQ_ELSE.fullmatch(t)
    if m:
        d["steps"].append({"type": "else", **({"text": _unlabel(m[2])} if m[2] else {})})
        return
    m = SEQ_MSG.fullmatch(t)
    if m:
        _seq_actor(d, m[1])
        _seq_actor(d, m[4])
        head = SEQ_HEAD.get(re.sub(r"^<*-+", "", m[2])) or "arrow"
        e = {"type": "msg", "from": m[1], "to": m[4], "text": _unlabel(m[5] or "")}
        if m[2].startswith("--") or m[2].startswith("<<--"):
            e["line"] = "dash"
        if head != "arrow":
            e["head"] = head
        if m[2].startswith("<<"):
            e["both"] = True
        d["steps"].append(e)


def _state_add(d, id_, patch=None):
    """[*] is the start when a transition leaves it and the end when one
    reaches it: _start and _end, with the composite state appended inside one."""
    had = d["nodes"].get(id_)
    if not had:
        d["nodes"][id_] = {"id": id_, **(patch or {})}
    else:
        had.update(patch or {})
    if d["stack"] and not any(id_ in g["nodes"] for g in d["groups"]):
        d["stack"][-1]["nodes"].append(id_)


def _state_line(d, t):
    if d["note"]:
        if re.fullmatch(rf"end{S}+note", t, re.I | re.ASCII):
            d["note"] = False
        return
    if re.match(rf"note{S}", t, re.I | re.ASCII):
        if ":" not in t:
            d["note"] = True
        return
    if STATE_SKIP.match(t):
        m = re.match(rf"direction{S}+(\w+)", t, re.ASCII)
        if m:
            d["dir"] = m[1].upper()
        return
    if t == "}":
        if d["stack"]:
            d["stack"].pop()
        return
    m = STATE_DECL.fullmatch(t)
    if m:
        id_ = m[2] or m[3]
        patch = {}
        if m[1]:
            patch["label"] = m[1]
        if m[4]:
            patch["shape"] = m[4][2:-2]
        _state_add(d, id_, patch)
        if m[5]:
            label = d["nodes"][id_].get("label")
            g = {"id": id_, **({"label": label} if label else {}), "nodes": []}
            if d["stack"]:
                g["in"] = d["stack"][-1]["id"]
            d["groups"].append(g)
            d["stack"].append(g)
        return
    m = STATE_EDGE.fullmatch(t)
    if m:
        scope = f"_{d['stack'][-1]['id']}" if d["stack"] else ""
        from_ = f"_start{scope}" if m[1] == "[*]" else m[1]
        to = f"_end{scope}" if m[3] == "[*]" else m[3]
        _state_add(d, from_, {"shape": "start"} if m[1] == "[*]" else None)
        _state_add(d, to, {"shape": "end"} if m[3] == "[*]" else None)
        e = {"from": from_, "to": to}
        if m[4]:
            e["label"] = _unlabel(m[4])
        d["edges"].append(e)
        return
    m = STATE_TEXT.fullmatch(t)
    if m:
        _state_add(d, m[1])
        n = d["nodes"][m[1]]
        if not n.get("label"):
            n["label"] = _unlabel(m[2])


def _diagram_graph(d):
    """The patch props a diagram's end gives."""
    src = "\n".join(d["src"])
    if d["kind"] == "flow":
        nodes = [{k: v for k, v in n.items() if k != "order"} for n in d["f"]["nodes"].values()]
        return _clean({"type": "flow", "dir": d["dir"], "nodes": nodes, "edges": d["f"]["edges"],
                       "groups": d["f"]["groups"] or None, "source": src})
    if d["kind"] == "sequence":
        return _clean({"type": "sequence", "actors": list(d["actors"].values()), "steps": d["steps"],
                       "numbered": d.get("numbered"), "source": src})
    if d["kind"] == "state":
        return _clean({"type": "state", "dir": d["dir"], "nodes": list(d["nodes"].values()), "edges": d["edges"],
                       "groups": d["groups"] or None, "source": src})
    return {"type": "other", "source": src}


# ---------- flow variants (spec/FLOWS.md, section 9) ----------
# `flow <base> as=<name>` makes a variant of a saved flow: the lines up to
# `end` say only what changes. `drop a b` takes steps out, `%% id: <step>`
# rewords one, `add new after id: <step>` puts a step in after another. The
# parser keeps them in order; flow_variant applies them to the base's graph.
VARIANT_DROP = _re(rf"drop((?:{S}+\w+)+){S}*")
VARIANT_ADD = _re(rf"add{S}+(\w+){S}+after{S}+(\w+){S}*:{S}*({DOT}*)")
VARIANT_BAD = "flow: a variant line is drop, add or a %% step"


def _new_variant(head):
    return {"id": head["id"], "screen": head["screen"], "src": [], "depth": 0, "variant": True, "changes": []}


def _variant_step(text):
    """A step for a variant line, or an error message, or None (not a step)."""
    head = STEP_HEAD.match(text)
    if head and head[1] in PRESETS and head[1] not in FLOW_STEPS:
        return f"flow: a {head[1]} cannot be a step ({', '.join(FLOW_STEPS)})"
    return _step_of(text)


def _variant_statement(v, t):
    """One line of an open variant. Returns an error message or None."""
    if not t or COMMENT.match(t):
        return None
    if t.startswith("%%"):
        m = STEP_COMMENT.fullmatch(t)
        if not m:
            return None
        s = _variant_step(m[2])
        if isinstance(s, str):
            return s
        if s:
            v["changes"].append({"op": "step", "id": m[1], "preset": s["preset"], "props": s["props"]})
        return None
    m = VARIANT_DROP.fullmatch(t)
    if m:
        for i in re.split(f"{S}+", _trim(m[1])):
            v["changes"].append({"op": "drop", "id": i})
        return None
    m = VARIANT_ADD.fullmatch(t)
    if m:
        s = _variant_step(m[3])
        if isinstance(s, str):
            return s
        if not s:
            return VARIANT_BAD
        v["changes"].append({"op": "add", "id": m[1], "after": m[2], "preset": s["preset"], "props": s["props"]})
        return None
    return VARIANT_BAD


def flow_variant(base, changes=None):
    """A base flow's graph with a variant's changes applied, in order. A change
    that names a step the base does not have (or adds one it already has) is
    skipped, so a variant survives its base being edited."""
    nodes = [dict(n) for n in base.get("nodes") or []]
    edges = [dict(e) for e in base.get("edges") or []]
    start = base.get("start")

    def has(i):
        return any(n["id"] == i for n in nodes)

    for c in changes or []:
        op = c.get("op")
        if op == "drop" and has(c["id"]):
            # Edges into the step go where it went: its default edge, else its first.
            out = [e for e in edges if e["from"] == c["id"]]
            pick = next((e for e in out if not e.get("when")), out[0] if out else None)
            on = pick["to"] if pick else None
            kept = []
            for e in edges:
                if e["from"] == c["id"]:
                    continue
                if e["to"] != c["id"]:
                    kept.append(e)
                elif on and on != e["from"]:
                    kept.append({**e, "to": on})
            edges = kept
            nodes = [n for n in nodes if n["id"] != c["id"]]
            if start == c["id"]:
                start = on if on and has(on) else (nodes[0]["id"] if nodes else None)
        elif op == "step" and has(c["id"]):
            nodes = [{**n, "preset": c["preset"], "props": c["props"]} if n["id"] == c["id"] else n for n in nodes]
        elif op == "add" and not has(c["id"]) and next((n for n in nodes if n["id"] == c["after"]), {}).get("preset"):
            # The new step takes over the edges out of `after`, and `after` goes to it.
            edges = [{**e, "from": c["id"]} if e["from"] == c["after"] else e for e in edges]
            edges.append({"from": c["after"], "to": c["id"]})
            at = next(i for i, n in enumerate(nodes) if n["id"] == c["after"])
            nodes.insert(at + 1, {"id": c["id"], "preset": c["preset"], "props": c["props"]})
    return _clean({"dir": base.get("dir"), "start": start, "nodes": nodes, "edges": edges})


def variant_name(as_):
    """A variant's name and title from its `as=`."""
    raw = "" if as_ is None else str(as_)
    name = re.sub(r"^-|-$", "", re.sub(r"[^a-z0-9]+", "-", raw.lower()))
    t = re.sub(r"[-_]+", " ", _trim(raw))
    return {"name": name, "title": t[:1].upper() + t[1:]}


# ---------- flow runtime ----------
# Pure helpers the renderers share: where Next goes, the path taken, and
# what goes in the event. `g` is a flow's props (resolve("flow", props)).
# An answer that is None (JSON null) is still an answer; a missing key is not.

_UNDEF = object()


def _is_question(n):
    return bool(n and n.get("preset") and n["preset"] != "page")


def _js_string(v):
    """JS String(v) for answer values: lists join, objects are [object Object]."""
    if isinstance(v, list):
        return ",".join("" if x is None else _js_string(x) for x in v)
    if isinstance(v, dict):
        return "[object Object]"
    if v is None:
        return "null"
    return _js_str(v)


def _low(v):
    if isinstance(v, bool):
        return "yes" if v else "no"
    return _trim(_js_string(v)).lower()


def _flow_num(v):
    if _is_number(v):
        return v
    if isinstance(v, str) and NUM.fullmatch(_trim(v)):
        return _num(_trim(v))
    return None


def _prop(v, k):
    """JS v[k] for an answer value, _UNDEF when it has no such key."""
    if isinstance(v, dict):
        return v.get(k, _UNDEF)
    if isinstance(v, list):
        if k == "length":
            return len(v)
        if re.fullmatch(r"0|[1-9]\d*", k, re.ASCII) and int(k) < len(v):
            return v[int(k)]
    return _UNDEF


def _clause_holds(c, answers, last):
    """One clause against the answers. `last` is the question answered before
    a step-less node, for bare labels on its edges."""
    parts = c["path"].split(".") if c.get("path") else [last]
    if parts[0] is None:
        return c["op"] == "!="
    v = answers.get(parts[0], _UNDEF)
    for k in parts[1:]:
        v = _prop(v, k) if v is not _UNDEF and v is not None else _UNDEF
    if v is _UNDEF or v is None:
        return c["op"] == "!="
    want = c["value"]
    if isinstance(v, list):
        has = any(_low(x) == _low(want) for x in v)
        if c["op"] in ("=", "~"):
            return has
        if c["op"] == "!=":
            return not has
        v = len(v)
    a, b = _flow_num(v), _flow_num(want)
    op = c["op"]
    if op == "=":
        return a == b if a is not None and b is not None else _low(v) == _low(want)
    if op == "!=":
        return a != b if a is not None and b is not None else _low(v) != _low(want)
    if op == "~":
        return _low(want) in _low(v)
    if a is None or b is None:
        return False
    return a > b if op == ">" else a >= b if op == ">=" else a < b if op == "<" else a <= b


def flow_test(when, answers, last=None):
    return not when or any(all(_clause_holds(c, answers, last) for c in alt) for alt in when)


def _node_of(g, id_):
    return next((n for n in g.get("nodes") or [] if n["id"] == id_), None)


def _edge_out(g, answers, frm, last, guess):
    """The edge taken out of `frm`: the first labelled edge that holds, else the
    first default edge. With `guess`, a question with no answer yet still takes
    a labelled edge that earlier answers already decide, else the default (or
    its first edge), to estimate what is left."""
    out = [e for e in g.get("edges") or [] if e["from"] == frm]
    unknown = guess and _is_question(_node_of(g, frm)) and frm not in answers
    hit = next((e for e in out if e.get("when") and flow_test(e["when"], answers, last)), None)
    if hit:
        return hit
    return next((e for e in out if not e.get("when")), None) or (out[0] if unknown and out else None)


def flow_next(g, answers, frm, guess=False):
    """The next step after `frm`, passing through nodes with no step. None:
    the flow ends (the review comes next)."""
    seen = {frm}
    last = frm if _is_question(_node_of(g, frm)) else None
    at = frm
    while True:
        e = _edge_out(g, answers, at, last, guess)
        if not e or e["to"] in seen:
            return None
        n = _node_of(g, e["to"])
        if not n:
            return None
        if n.get("preset"):
            return n["id"]
        seen.add(n["id"])
        at = n["id"]


def flow_first(g):
    """The first step: the start node, or the first step after it."""
    s = _node_of(g, g.get("start"))
    if not s:
        return None
    return s["id"] if s.get("preset") else flow_next(g, {}, s["id"])


def flow_path(g, answers):
    """The path the answers take from the start: step ids in order. It stops at
    the first question with no answer (`open`, not in the path) or at the end
    (`open` None). A step already on the path ends it: flows do not loop."""
    path = []
    at = flow_first(g)
    while at and at not in path:
        if _is_question(_node_of(g, at)) and at not in answers:
            return {"path": path, "open": at}
        path.append(at)
        at = flow_next(g, answers, at)
    return {"path": path, "open": None}


def flow_ahead(g, answers, frm):
    """The steps still ahead of `frm` (not counting it), guessing at branches
    not answered yet. For the progress bar."""
    out = []
    at = frm and flow_next(g, answers, frm, True)
    while at and at not in out and at != frm:
        out.append(at)
        at = flow_next(g, answers, at, True)
    return out


def flow_event(g, answers):
    """What a flow sends at submit: the answers of the questions on the path,
    keyed by step id, and the path itself (pages included)."""
    path = flow_path(g, answers)["path"]
    flow = {i: answers[i] for i in path if _is_question(_node_of(g, i)) and i in answers}
    return {"flow": flow, "path": path}


# ---------- line parser ----------

ROUTE = _re(rf">([\w-]+)(?:{S}+|\Z)")
COMMENT = _re(rf"#({S}|\Z)")
CUSTOM = _re(rf"custom(?:@([\w-]+))?{S}+({DOT}*)")
PATCH_AT = _re(r"([a-z]+)@([\w-]+)")
HEAD = _re(r"([a-z]+)(?:@([\w-]+))?")


def _no_constants(name):
    raise ValueError(f"bad JSON constant {name}")



# ---------- menu (spec section 5, The drawer) ----------

# ---------- theme app (spec/YL.md, theme app; RESTYLE.md) ----------
# `theme app [set] key=value...`: a restyle of Yui's own chrome, not the
# agent's look. Stricter than an agent's theme: an unknown set, key or value
# is an error line, never quietly dropped. Same tables as site/lib/yl/look.mjs.

APP_SETS = (
    "yui", "candy", "berry", "cherry", "coral", "sunset", "peach", "autumn", "honey",
    "lemon", "lime", "matcha", "forest", "mint", "teal", "sky", "ocean", "midnight",
    "lavender", "grape", "slate", "mono", "wizard", "coach", "zen", "studio", "night", "counsel",
)
APP_PAPERS = ("cream", "paper", "white", "mist", "sand", "blush")
APP_HEX = _re(r"#[0-9a-f]{6}", re.I)
APP_KEYS = {
    "accent": lambda v: bool(APP_HEX.fullmatch(v)) or v in APP_SETS,
    "bg": lambda v: bool(APP_HEX.fullmatch(v)) or v in APP_PAPERS,
    "radius": lambda v: v in ("round", "soft", "square"),
    "font": lambda v: v in ("rounded", "default", "serif", "mono"),
    "weight": lambda v: v in ("regular", "bold", "heavy"),
    "motion": lambda v: v in ("bouncy", "calm", "snappy"),
    "pace": lambda v: v in ("slow", "even", "quick"),
    "ease": lambda v: v in ("float", "spring", "sharp", "heavy"),
    "enter": lambda v: v in ("rise", "pop", "slide", "drop", "fade"),
    "pulse": lambda v: v in ("soft", "beat", "tick", "still"),
}
APP_STYLE_KEYS = ("screen", "gallery", "chart", "buttons")


def _app_theme(screen, tokens, line):
    def bad(message):
        return {"op": "error", "screen": screen, "message": f"theme app: {message}", "line": line}

    props = {"scope": "app"}
    words = []
    for t in tokens:
        if t.key:
            v = "|".join(t.value) if isinstance(t.value, list) else t.value
            if t.key in APP_STYLE_KEYS:
                return bad(f"{t.key}= is one agent's style, not the app's")
            if t.key not in APP_KEYS:
                return bad(f"unknown key {t.key}=")
            if not APP_KEYS[t.key](v):
                return bad(f"{t.key}={v} is not a value the app takes")
            props[t.key] = v
        elif not t.quoted and not t.parts and FLAG.fullmatch(t.raw):
            return bad(f"{t.raw} is not a flag here; the person always sees a preview first")
        else:
            words.append(t.text)
    if len(words) > 1:
        return bad(f'one set name, not "{" ".join(words)}"')
    if words:
        name = words[0]
        if name == "reset":
            if len(props) > 1:
                return bad("reset takes nothing else")
        elif name not in APP_SETS:
            return bad(f"no set named {name}")
        props["name"] = name
    if len(props) == 1:
        return bad("needs a set name, reset or keys")
    return {"op": "theme", "screen": screen, "props": props, "line": line}


MENU_BUCKETS = ("review", "backlog", "shortcut")
MENU_KEYS = ("sub", "say", "show", "url")
_MENU_HEAD = re.compile(r"([a-z]+)(?:@([A-Za-z0-9_-]+))?")
_MENU_WORD = re.compile(r"[A-Za-z0-9_-]+")


def menu_id(label):
    """An item with no @id is known by its label: lowercase, runs of anything else as one "-"."""
    return re.sub(r"[^a-z0-9]+", "-", label.lower()).strip("-") or "item"


STEP = _re(r"(\d+)/(\d+)")


def _doing_line(screen, tokens, line):
    """`doing "Reading your calendar" 2/5` (YL.md section 5, The working row):
    a few words on what the agent is doing, and a bar when a last bare `n/m`
    says how far along it is. `doing off` puts the working word back. Words
    and a step only: keys and flags are errors."""
    def bad(m):
        return {"op": "error", "screen": screen, "message": f"doing: {m}", "line": line}
    if len(tokens) == 1 and not tokens[0].quoted and tokens[0].raw == "off":
        return {"op": "doing", "screen": screen, "props": {"off": True}, "line": line}
    if any(t.key is not None or (not t.quoted and not t.parts and FLAG.fullmatch(t.raw)) for t in tokens):
        return bad("takes words and a step like 2/5, no keys or flags")
    last = tokens[-1] if tokens else None
    sm = STEP.fullmatch(last.raw) if last and not last.quoted and not last.parts else None
    words = tokens[:-1] if sm else tokens
    text = " ".join(t.text for t in words if t.text)
    if not text and not sm:
        return bad("needs words, a step like 2/5, or off")
    props = {"text": text} if text else {}
    if sm:
        props["step"], props["of"] = int(sm.group(1)), int(sm.group(2))
        if props["of"] < 1 or props["step"] > props["of"]:
            return bad("the step is n/m with n from 0 to m")
    return {"op": "doing", "screen": screen, "props": props, "line": line}


def doing_of(ops):
    """The working row after these ops: the newest doing, or None when there
    is none or the last one was `doing off`."""
    now = None
    for o in ops:
        if o and o["op"] == "doing":
            now = None if o["props"].get("off") else dict(o["props"])
    return now


# `visual aurora tone=mint react=voice` (YL.md section 5, The visual; spec
# VISUAL.md): a live shader behind the stage's chunks, or alone on it. One
# look at most; tone= is accent, a theme set name or #RRGGBB; react= is what
# it listens to. `visual off` takes it away. Anything else is an error.
VISUAL_LOOKS = ("orb", "aurora", "waves", "grain", "bloom")
VISUAL_REACT = ("voice", "music", "mic", "off")


def _visual_line(screen, tokens, line):
    def bad(m):
        return {"op": "error", "screen": screen, "message": f"visual: {m}", "line": line}
    if len(tokens) == 1 and not tokens[0].quoted and tokens[0].raw == "off":
        return {"op": "visual", "screen": screen, "props": {"off": True}, "line": line}
    props = {}
    for t in tokens:
        if t.key is not None:
            if t.key not in ("tone", "react"):
                return bad("takes a look, tone= and react=, nothing else")
            if t.vquoted and len(t.vquoted) > 1:
                return bad(f"{t.key}= takes one value")
            v = t.value
            if t.key == "tone" and not (v == "accent" or v in APP_SETS or APP_HEX.fullmatch(v)):
                return bad("tone= is accent, a theme set name or #RRGGBB")
            if t.key == "react" and v not in VISUAL_REACT:
                return bad("react= is voice, music, mic or off")
            props[t.key] = v
            continue
        if not t.quoted and not t.parts and FLAG.fullmatch(t.raw):
            return bad("takes no flags")
        if t.quoted or t.parts or t.raw not in VISUAL_LOOKS:
            return bad("the look is one of " + ", ".join(VISUAL_LOOKS))
        if "look" in props:
            return bad("one look at a time")
        props["look"] = t.raw
    return {"op": "visual", "screen": screen, "props": props, "line": line}


def visual_of(ops):
    """The stage's visual after these ops: the newest visual's props, or None
    when there is none or the last one was `visual off`."""
    now = None
    for o in ops:
        if o and o["op"] == "visual":
            now = None if o["props"].get("off") else dict(o["props"])
    return now


def _menu_line(screen, tokens, line):
    def bad(message):
        return {"op": "error", "screen": screen, "message": message, "line": line}
    if not tokens:
        return bad("menu: needs review, backlog, shortcut or done")
    hm = _MENU_HEAD.fullmatch(tokens[0].raw)
    if not hm or not (hm[1] in MENU_BUCKETS or (hm[1] == "done" and not hm[2])):
        return bad(f'menu: "{tokens[0].raw}" is not review, backlog, shortcut or done')
    rest = tokens[1:]
    if hm[1] == "done":
        name = " ".join(t.text for t in rest if t.text)
        if not name:
            return bad("menu done: needs an id")
        return {"op": "menu", "screen": screen, "id": name if _MENU_WORD.fullmatch(name) else menu_id(name),
                "props": {"done": True}, "line": line}
    props = {"bucket": hm[1]}
    words = []
    for t in rest:
        if t.key:
            if t.key in MENU_KEYS:
                props[t.key] = "|".join(t.value) if isinstance(t.value, list) else t.value
        elif not (not t.quoted and not t.parts and FLAG.fullmatch(t.raw)):
            words.append(t.text)
    label = " ".join(w for w in words if w)
    if not label:
        return bad("menu: needs a label")
    props["label"] = label
    return {"op": "menu", "screen": screen, "id": hm[2] or menu_id(label), "props": props, "line": line}


# ---------- agent tables (spec/TABLES.md) ----------

TABLE_TYPES = ["text", "number", "date", "bool"]
TABLE_NAME = _re(r"[A-Za-z][\w-]*")
TABLE_HEAD = _re(r"table(@.*)?")
COL_DEF = _re(r"([A-Za-z_][\w-]*):([a-z]+)(?::(\S+))?")


def _table_create(screen, tokens, line):
    """table create <name> col:type ... (number columns may carry a unit: Cal:number:kcal)"""
    def bad(message):
        return {"op": "error", "screen": screen, "message": f"table create: {message}", "line": line}

    if not tokens:
        return bad("needs a name, then col:type ...")
    name_tok, rest = tokens[0], tokens[1:]
    if name_tok.quoted or name_tok.parts or name_tok.key or not TABLE_NAME.fullmatch(name_tok.raw):
        return bad("needs a name, then col:type ...")
    if not rest:
        return bad("needs at least one col:type")
    cols = []
    for t in rest:
        m = None if t.quoted or t.key else COL_DEF.fullmatch(t.raw)
        if not m:
            return bad(f'"{t.raw}" is not col:type')
        if m[2] not in TABLE_TYPES:
            return bad(f'"{m[2]}" is not text, number, date or bool')
        if m[3] and m[2] != "number":
            return bad(f'only number columns take a unit ("{t.raw}")')
        cols.append({"name": m[1], "type": m[2], **({"unit": m[3]} if m[3] else {})})
    return {"op": "table", "screen": screen, "name": name_tok.raw, "cols": cols, "line": line}


def _put_line(screen, tokens, line):
    """put <table> [key] col=value ... [+delete]. Other flags set a bool column: +Done is Done=on."""
    kv, flags, pos = _split(tokens)

    def bad(message):
        return {"op": "error", "screen": screen, "message": f"put: {message}", "line": line}

    table_tok = pos[0] if pos else None
    key_tok = pos[1] if len(pos) > 1 else None
    if not table_tok or table_tok.quoted or table_tok.parts or not TABLE_NAME.fullmatch(table_tok.raw):
        return bad("needs a table name")
    if len(pos) > 2:
        return bad("one key, then col=value ...")
    if key_tok and key_tok.parts:
        return bad("a key has no |")
    delete = flags.pop("delete", False)
    values = {**flags, **kv}
    op = {"op": "put", "screen": screen, "table": table_tok.raw}
    if key_tok:
        op["key"] = key_tok.text
    if delete:
        if not key_tok:
            return bad("+delete needs a key")
        if values:
            return bad("+delete takes no values")
        return {**op, "values": {}, "delete": True, "line": line}
    if not values:
        return bad("needs at least one col=value")
    return {**op, "values": values, "line": line}


_NOT_DGM = object()


_NOT_MOTION = object()
MOTION_MAX_CHARS = 120000  # a film longer than this is cut, its `end` still closes it


class Parser:
    """Stateful: remembers the focused screen and which preset each id belongs
    to, so "~hiit rounds=10" knows to parse its args as a timer. `known` is the
    ids that last from earlier replies (YL.md section 5), id -> preset; this
    reply's own ids shadow them."""

    def __init__(self, known=None):
        self.screen = "1"
        self.ids = dict(known or {})  # id -> preset
        self.auto = 0
        self.open = []  # open groups, innermost last: {id, preset, screen}
        self.flow_head = None  # a flow head just added: {id, screen, pre}
        self.flow = None  # an open flow's Mermaid, being read
        self.dgm = None  # an open diagram's Mermaid, being read
        self.mot = None  # an open motion's scenes, being read

    def group(self, op):
        """Group bookkeeping for one parsed op. Errors (and None) leave groups open."""
        # theme restyles the app, menu fills the drawer, a data line (table
        # create, put) writes to the phone and doing sits in the working row,
        # not on the screen: they leave groups alone.
        if not op or op["op"] in ("error", "theme", "menu", "table", "put", "doing", "visual"):
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
        if self.mot:
            op = self.motion_line(src)
            if op is not _NOT_MOTION:
                return op
        if self.flow:
            return self.flow_line(src)
        if self.dgm:
            op = self.dgm_line(src)
            if op is not _NOT_DGM:
                return op
        if self.flow_head:
            # The line after a flow head decides: a Mermaid header starts the
            # chart (inline flow), anything else leaves it a saved flow by name.
            t = _trim(src)
            if not t or COMMENT.match(t):
                return None
            # Mermaid comments may come before the header.
            if t.startswith("%%"):
                self.flow_head["pre"].append(src[:-1] if src.endswith("\r") else src)
                return None
            h, self.flow_head = self.flow_head, None
            if FLOW_HEADER.match(t):
                self.flow = _new_flow(h, src[:-1] if src.endswith("\r") else src)
                return None
        op = self.group(self.parse_line(src))
        if op and op["op"] == "add" and op["preset"] == "diagram":
            self.dgm = _new_diagram(op)
        if op and op["op"] == "add" and op["preset"] == "motion":
            self.mot = {"id": op["id"], "screen": op["screen"], "src": [], "chars": 0}
        if op and op["op"] == "add" and op["preset"] == "flow":
            # `as=` makes it a variant of the saved flow it names: its lines follow.
            if "as" in op["props"]:
                self.flow = _new_variant(op)
            else:
                self.flow_head = {"id": op["id"], "screen": op["screen"], "pre": []}
        return op

    def finish(self):
        """Ends the input: an open flow gives its graph now."""
        self.flow_head = None
        if self.mot:
            return self.motion_done("")
        if self.dgm:
            return self.dgm_done("")
        return self.flow_done("") if self.flow else None

    def motion_line(self, src):
        """One line of an open motion: a scene header or JavaScript, not YL (spec/MOTION.md 0.5). _NOT_MOTION
        when the first line after the head is not a scene header (the agent's own one-line ask)."""
        m = self.mot
        line = src[:-1] if src.endswith("\r") else src
        t = line.strip()
        if t == "end":
            return self.motion_done(line)
        if not m["src"]:
            if not t:
                return None
            if not t.startswith("==="):
                self.mot = None
                return _NOT_MOTION
        if m["chars"] + len(line) <= MOTION_MAX_CHARS:
            m["src"].append(line)
            m["chars"] += len(line) + 1
        return None

    def motion_done(self, line):
        m, self.mot = self.mot, None
        if not m or not m["src"]:
            return None
        return {"op": "patch", "screen": m["screen"], "target": m["id"], "props": {"source": "\n".join(m["src"])}, "line": line}

    def dgm_line(self, src):
        """One line of an open diagram: Mermaid, not YL. _NOT_DGM means the line
        is not the diagram's (no Mermaid header came), so the caller reads it
        as YL. A nested block's `end` (subgraph, loop, alt...) closes that
        block first, then the diagram."""
        d = self.dgm
        line = src[:-1] if src.endswith("\r") else src
        t = _trim(line)
        if not d["kind"]:
            if not t or COMMENT.match(t):
                return None
            if t.startswith("%%"):
                d["src"].append(line)
                return None
            if not DGM_HEADER.match(t) and not DGM_OTHER.match(t):
                self.dgm = None
                return _NOT_DGM
            d["src"].append(line)
            _diagram_start(d, t)
            return None
        if FLOW_END.fullmatch(t) and d["kind"] != "state":
            nested = d["f"]["depth"] if d["kind"] == "flow" else d["open"] if d["kind"] == "sequence" else 0
            if nested > 0:
                d["src"].append(line)
                if d["kind"] == "flow":
                    d["f"]["depth"] -= 1
                    if d["f"]["stack"]:
                        d["f"]["stack"].pop()
                else:
                    d["open"] -= 1
                    d["steps"].append({"type": "close"})
                return None
            return self.dgm_done(line)
        if FLOW_END.fullmatch(t):
            if not d["note"]:
                return self.dgm_done(line)
        d["src"].append(line)
        if not t or d["kind"] == "other":
            return None
        if d["kind"] == "flow":
            _flow_statement(d["f"], t)
        elif d["kind"] == "sequence":
            _seq_line(d, t)
        else:
            _state_line(d, t)
        return None

    def dgm_done(self, line):
        d, self.dgm = self.dgm, None
        if not d["kind"]:
            return None
        return {"op": "patch", "screen": d["screen"], "target": d["id"], "props": _diagram_graph(d), "line": line}

    def flow_line(self, src):
        """One line of an open flow: Mermaid, not YL. `end` closes a subgraph
        first, then the flow."""
        f = self.flow
        line = src[:-1] if src.endswith("\r") else src
        t = _trim(line)
        if FLOW_END.fullmatch(t):
            if f["depth"] > 0:
                f["depth"] -= 1
                f["src"].append(line)
                return None
            return self.flow_done(line)
        f["src"].append(line)
        err = _variant_statement(f, t) if f.get("variant") else _flow_statement(f, t)
        return {"op": "error", "screen": f["screen"], "message": err, "line": line} if err else None

    def flow_done(self, line):
        f, self.flow = self.flow, None
        props = _clean({"changes": f["changes"], "source": "\n".join(f["src"])}) if f.get("variant") else _flow_graph(f)
        return {"op": "patch", "screen": f["screen"], "target": f["id"], "props": props, "line": line}

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
            # ~preset@id: the id when this reply made it or it lasts, else the preset name.
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
            # A timeline row moves with `kind=` (YUI-111): done, now or next. The
            # row keeps its id and place; from here on the id is that preset.
            if preset in ROWS and "kind" in props:
                if props["kind"] not in ROWS:
                    return {"op": "error", "screen": screen, "message": "patch: kind= is done, now or next", "line": line}
                if target not in ROWS:
                    self.ids[target] = props["kind"]
            return {"op": "patch", "screen": screen, "target": target, "props": props, "line": line}

        if head in ("save", "show", "forget"):
            # The name is the rest of the line: `save leg day` is "leg day".
            name = " ".join(t.text for t in tokens if t.text)
            if not name:
                return {"op": "error", "screen": screen, "message": f"{head}: needs a name", "line": line}
            return {"op": head, "screen": screen, "name": name, "line": line}
        if head == "menu":
            return _menu_line(screen, tokens, line)
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
        if head == "doing":
            return _doing_line(screen, tokens, line)
        if head == "visual":
            return _visual_line(screen, tokens, line)
        if head == "theme":
            t0 = tokens[0] if tokens else None
            if t0 and not t0.key and not t0.quoted and not t0.parts and t0.text == "app":
                return _app_theme(screen, tokens[1:], line)
            return {"op": "theme", "screen": screen, "props": parse_args("theme", tokens), "line": line}

        # Agent tables (spec/TABLES.md): `table create` and `put` write to the phone.
        if head == "put":
            return _put_line(screen, tokens, line)
        if TABLE_HEAD.fullmatch(head) and tokens and not tokens[0].quoted and not tokens[0].key and tokens[0].raw == "create":
            if head != "table":
                return {"op": "error", "screen": screen, "message": "table create: takes no @id", "line": line}
            return _table_create(screen, tokens[1:], line)

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


def parse(text, known=None):
    """Parse a whole document at once. `known`: ids that last (Parser)."""
    p = Parser(known)
    ops = [p.line(l) for l in text.split("\n")]
    ops.append(p.finish())
    return [op for op in ops if op]


class StreamParser:
    """Feed chunks as they arrive, get ops for every completed line.
    Lines render the moment their newline lands; flush() finishes the tail."""

    def __init__(self, known=None):
        self.buf = ""
        self.p = Parser(known)

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
        return [o for o in (op, self.p.finish()) if o]


# ---------- the stage ----------
# The stage is a full-screen layer over the chat (YL.md section 5).
# These presets open there unless they say +inline.
STAGE = ["timer", "camera", "mic", "deck", "plan", "game", "flow", "loop", "drums", "keys", "chords", "tuner"]


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

def timeline_rows(ops):
    """A timeline's rows after these ops land on an empty screen (YL.md
    section 4, timeline, Moving a row): [(id, kind)] in line order. A patch
    lands on the newest id or preset match; `kind=` re-kinds a row in place."""
    parts = []
    for o in ops:
        if o["op"] == "add":
            parts.append([o["id"], o["preset"]])
        elif o["op"] == "patch":
            hit = next((p for p in reversed(parts) if o["target"] in p), None)
            kind = o["props"].get("kind")
            if hit and hit[1] in ROWS and kind in ROWS:
                hit[1] = kind
    return [(i, k) for i, k in parts if k in ROWS]


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


_ATTACH_SECTION = re.compile(r"[a-z]{1,20}")
_ATTACH_ID = re.compile(r"[A-Za-z0-9][A-Za-z0-9._-]{0,99}")
_ATTACH_REV = re.compile(r"[A-Za-z0-9]{1,64}")
_ATTACH = re.compile(r"\[yui\] attach section=(\S+) id=(\S+) rev=(\S+)\r?\n")


def attach_body(item, words):
    """Talk about this (spec/TALK-ABOUT.md): a `[yui] attach section= id= rev=`
    line naming one Controls item, then the words. Not an item: the words as they are."""
    item = item or {}
    section, iid, rev = (str(item.get(k) or "") for k in ("section", "id", "rev"))
    if (not _ATTACH_SECTION.fullmatch(section) or not _ATTACH_ID.fullmatch(iid) or ".." in iid
            or not _ATTACH_REV.fullmatch(rev)):
        return words
    return f"[yui] attach section={section} id={iid} rev={rev}\n{words}"


def read_attach(body):
    """The other way: {"section", "id", "rev", "words"} for a message about an item, else None."""
    m = _ATTACH.match(body or "")
    if not m:
        return None
    item = {"section": m.group(1), "id": m.group(2), "rev": m.group(3)}
    if attach_body(item, "") == "":
        return None
    return {**item, "words": body[m.end():]}


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
    "flow": {"title": "", "submit": "Send", "review": True},
    "narrate": {"title": "", "voice": "agent", "rate": 1, "auto": False, "captions": True},
    "timeline": {"title": "", "mark": "Now", "fold": 5, "reorder": False},
    "done": {"text": ""}, "now": {"text": ""}, "next": {"text": ""},
    "sketch": {"title": "", "frame": "window", "before": "Before"},
    "row": {"text": ""}, "after": {"label": "After"},
    "query": {"table": "", "as": "table", "title": "", "where": [], "sort": []},
    "shapes": {"title": "", "caption": "", "w": 10, "h": 6},
    "shape": {"kind": "box", "label": ""},
    "diagram": {"title": "", "caption": ""},
    "motion": {"title": ""},
    "mock": {"title": "", "frame": "phone"},
    "map": {"title": "", "caption": "", "fit": "auto"},
    "area": {"label": "", "codes": [], "pts": []},
    "pin": {"label": ""},
    "route": {"label": "", "pts": []},
    "game": {"title": "", "you": "x", "first": "you", "speed": 2, "size": 15, "pairs": 6, "items": []},
    "tuner": {"title": "", "instrument": "guitar", "tuning": "standard", "a4": 440, "strings": []},
    "metronome": {"title": "", "bpm": 100, "beats": 4, "sub": 1, "play": False},
}

# The drum kit in pad order: a 2x2 gets the first four, a 4x4 all sixteen,
# a looper's rows the first eight (spec/MUSIC.md, section 4).
KIT = ["kick", "snare", "clap", "hat", "open", "rim", "tom", "shaker",
       "crash", "cow", "snap", "conga", "pop", "sweep", "tick", "bell"]


def _truthy(v):
    """JS truthiness for the values props can hold."""
    if isinstance(v, list):
        return True
    if _is_number(v):
        return v == v and v != 0
    return bool(v)


def _kit(n):
    """KIT.slice(0, n) with JS slice rules."""
    n = 0 if n != n else int(n) if abs(n) != math.inf else n
    if n < 0:
        n = max(len(KIT) + n, 0)
    return KIT[:int(min(n, len(KIT)))]



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
    if preset == "shape":
        # The kind is a word, matched without case (as in JS).
        r = {"label": "", **p}
        r["kind"] = _js_str("box" if p.get("kind") is None else p["kind"]).lower()
        return r
    if preset == "part":
        r = {"text": "", "items": [], **p}
        r["kind"] = _js_str("text" if p.get("kind") is None else p["kind"]).lower()
        return r
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
    # Music (spec/MUSIC.md). Sounds are words from the sound bank.
    if preset == "loop":
        return {"title": "", "bpm": 96, "swing": 0, "steps": 8, "rows": KIT[:8], "p": [],
                "sound": "pluck", "play": False, **p}
    if preset == "drums":
        r = {"title": "", "bpm": 96, "record": False, **p}
        r["grid"] = _js_str("2x2" if p.get("grid") is None else p["grid"]).lower()
        n = [_to_number(x) for x in r["grid"].split("x")] + [math.nan]
        if not _truthy(p.get("pads")):
            r["pads"] = _kit(n[0] * n[1])
        return r
    if preset == "keys":
        r = {"title": "", "key": "C", "sound": "keys", "octave": 4, "send": False, **p}
        if "scale" not in p:
            r["scale"] = "minor" if _js_str(r["key"]).endswith("m") else "major"
        return r
    if preset == "chords":
        r = {"title": "", "key": "C", "chords": [], "strum": "down", "sound": "pluck", "send": False, **p}
        if "prog" not in p:
            r["prog"] = [] if _truthy(p.get("chords")) else ["I", "V", "vi", "IV"]
        return r
    return {**json.loads(json.dumps(_DEFAULTS.get(preset, {}))), **p}
