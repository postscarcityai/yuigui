#!/usr/bin/env python3
"""The first scene alone (MOTION-21): seconds until split_film yields scene 1, for 20 asks whose noun the kit lacks.

  python3 site/scripts/motion/inline_time.py <plugin-dir> [--n 20] [--out file.json]

Things cache is EMPTY (a temp file). One event loop for all asks, a warm claude primed first, as on a running gateway.
Each ask runs alone; the film is closed the moment scene 1 arrives. Prints the median, the max and how many came with a hero."""
import asyncio, importlib.util, json, os, statistics, sys, tempfile, time

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from parts_time import ASKS  # the 10 of asks-heldout2.json + 10 more nouns the kit lacks


def load(path):
    spec = importlib.util.spec_from_file_location("yui_motion", os.path.join(os.path.expanduser(path), "motion.py"))
    m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m)
    return m


async def one(M, ask):
    t0 = time.time()
    agen = M.split_film(ask)
    try:
        async for s in agen:
            return dict(ask=ask, first_s=round(time.time() - t0, 2), code=s["code"], hero="api.defineThing" in s["code"] or "api.thing(" in s["code"])
    finally:
        await agen.aclose()
    return dict(ask=ask, first_s=None, code="", hero=False)


async def main(M, n):
    if hasattr(M, "prime"):
        M.prime(); await asyncio.sleep(5)
    rows = []
    for ask in ASKS[:n]:
        rows.append(await one(M, ask))
        print(rows[-1]["first_s"], rows[-1]["hero"], ask[:60], flush=True)
    M.unprime()
    return rows


if __name__ == "__main__":
    a = sys.argv[1:]
    n = int(a[a.index("--n") + 1]) if "--n" in a else 20
    out = a[a.index("--out") + 1] if "--out" in a else None
    os.environ["YUI_MOTION_THINGS_CACHE"] = tempfile.mktemp(suffix=".json")
    M = load(a[0])
    rows = asyncio.run(main(M, n))
    t = [r["first_s"] for r in rows if r["first_s"]]
    print("n", len(t), "median", statistics.median(t), "max", max(t), "hero", sum(r["hero"] for r in rows), "/", len(rows))
    if out:
        json.dump(rows, open(out, "w"), indent=1)
