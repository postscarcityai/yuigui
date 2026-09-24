# Yui Lines for Python

A Yui Lines parser in one file, `yuilines.py`. Standard library only, Python 3.9 or newer. It is a port of the JS reference (`site/lib/yl/yl.mjs`) and passes every vector in `spec/conformance/`.

```python
from yuilines import parse, StreamParser, resolve
ops = parse("timer 40/20x8 Tabata\nask Ready? Yes|Not yet")
print(ops[0]["props"])                    # {'work': 40, 'rest': 20, 'rounds': 8, 'label': 'Tabata'}
s = StreamParser(); s.push("card Hi th"); ops = s.push("ere\n") + s.flush()   # one op per finished line
print(resolve(ops[0]["preset"], ops[0]["props"]))  # props over the preset's defaults
```

Ops are plain dicts with the same keys as the JS parser: `op`, `screen`, `preset`, `id`, `props`, `line` and, where they apply, `target`, `name`, `in`, `message`. `on_stage(op, style)` says whether an add opens on the full-screen stage.

Run the conformance vectors:

```sh
python3 parsers/python/conformance.py
```
