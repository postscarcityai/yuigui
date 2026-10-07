#!/usr/bin/env python3
"""The parts call alone (MOTION-20): seconds to the noun, seconds to the whole reply, reply size, and whether build_parts accepts it.

  python3 site/scripts/motion/parts_time.py <plugin-dir> [<plugin-dir> ...] [--n 20] [--out file.json]

Twenty asks whose noun the kit lacks (the 10 of asks-heldout2.json plus 10 more). Each call gets a warm process that has
been started and left alone for 6 s, the way the adapter has one waiting. With several plugin dirs the asks alternate."""
import asyncio, importlib.util, json, os, statistics, sys, time

HERE = os.path.dirname(os.path.abspath(__file__))
ASKDIR = os.path.join(HERE, "..", "..", "public", "demo", "motion")
MORE = ["How a hot air balloon rises and how the pilot steers it.", "How a kangaroo hops so far with so little effort.",
        "How a telescope gathers faint light from far stars.", "How a trumpet turns breath into a note with three valves.",
        "How a snail moves on its single foot and carries its shell.", "How a dolphin swims fast: the fluke, the fins and the body.",
        "How a pyramid was built block by block with ramps.", "How a crane lifts a heavy load: the mast, the jib and the hook.",
        "How a spider builds a web from the centre out.", "How a camel stores energy in its hump and crosses the desert."]
ASKS = [a["ask"] for a in json.load(open(os.path.join(ASKDIR, "asks-heldout2.json")))] + MORE


def load(path, i):
    p = os.path.join(os.path.expanduser(path), "motion_hero.py")
    sys.path.insert(0, os.path.dirname(p))
    spec = importlib.util.spec_from_file_location(f"yui_hero_{i}", p)
    m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m)
    return m


async def one(H, ask):
    assert H.pick(ask) is None, ask
    w = H._warm()
    w.prime(H.THING_MODEL)
    await asyncio.sleep(6)
    t0, tn = time.time(), []
    text = await H._call_model(ask, lambda n: tn.append(time.time() - t0))
    dt = time.time() - t0
    hero = H.parse_reply(text)
    w.shutdown()
    return dict(ask=ask, noun_s=round(tn[0], 2) if tn else None, total_s=round(dt, 2), chars=len(text),
                tokens=round(len(text) / 3.2), parts=len((hero or {}).get("parts") or []),
                ok=bool(hero and hero.get("parts")), reply=text.strip())


if __name__ == "__main__":
    a = sys.argv[1:]
    n = int(a[a.index("--n") + 1]) if "--n" in a else 20
    out = a[a.index("--out") + 1] if "--out" in a else None
    dirs = [x for x in a if os.path.isdir(os.path.expanduser(x))]
    mods = [load(d, i) for i, d in enumerate(dirs)]
    res = {d: [] for d in dirs}
    for ask in ASKS[:n]:
        for d, H in zip(dirs, mods):
            try:
                res[d].append(asyncio.run(one(H, ask)))
            except Exception as e:
                res[d].append(dict(ask=ask, error=repr(e)))
    for d in dirs:
        r = [x for x in res[d] if "total_s" in x]
        med = lambda k: statistics.median([x[k] for x in r if x.get(k) is not None])
        print(d, "n", len(r), "total median", med("total_s"), "noun median", med("noun_s"), "tokens median", med("tokens"),
              "parts median", med("parts"), "ok", sum(x["ok"] for x in r), "/", len(r), "max", max(x["total_s"] for x in r))
    if out:
        json.dump(res, open(out, "w"), indent=1)
