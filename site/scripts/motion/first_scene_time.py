#!/usr/bin/env python3
"""Seconds from the ask to a finished scene 1, one film at a time, for one or more plugin checkouts (MOTION-2).

  python3 site/scripts/motion/first_scene_time.py <plugin-dir> [<plugin-dir> ...] [--n 10]

Runs the plugin's own `split_film`, stops at scene 1. With several plugin dirs the asks alternate between them, so
host load hits every arm alike. Prints the median and mean per arm."""
import asyncio, importlib.util, json, os, statistics, sys, time

HERE = os.path.dirname(os.path.abspath(__file__))
ASKS = json.load(open(os.path.join(HERE, "..", "..", "public", "demo", "motion", "asks.json")))[:20]


def load(path, i):
    spec = importlib.util.spec_from_file_location(f"yui_motion_{i}", os.path.join(os.path.expanduser(path), "motion.py"))
    m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m)
    return m


async def first(M, ask):
    t0 = time.time(); agen = M.split_film(ask)
    try:
        async for _ in agen:
            return round(time.time() - t0, 2)
    finally:
        await agen.aclose()


if __name__ == "__main__":
    a = sys.argv[1:]
    n = int(a[a.index("--n") + 1]) if "--n" in a else 10
    dirs = [x for x in a if os.path.isdir(os.path.expanduser(x))]
    mods = [load(d, i) for i, d in enumerate(dirs)]
    res = {d: [] for d in dirs}
    for ask in ASKS[:n]:
        for d, M in zip(dirs, mods):
            res[d].append(asyncio.run(first(M, ask["ask"])))
    for d in dirs:
        r = res[d]
        print(d, "median", statistics.median(r), "mean", round(statistics.mean(r), 2), "max", max(r), r)
