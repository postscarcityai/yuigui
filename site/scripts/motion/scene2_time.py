#!/usr/bin/env python3
"""Seconds to scene 1 and scene 2, and the gap past scene 1's end, per film (MOTION-22).

  python3 site/scripts/motion/scene2_time.py <plugin-dir> [--n 10] [--off]    (--off sets YUI_MOTION_REST_EARLY=off)

Runs the plugin's own `split_film` to scene 2. Prints one line per ask and the medians; ready = gap <= 0.05 s."""
import asyncio, importlib.util, json, os, statistics, sys, time

HERE = os.path.dirname(os.path.abspath(__file__))
ASKS = json.load(open(os.path.join(HERE, "..", "..", "public", "demo", "motion", "asks.json")))[:20]


def load(path, off):
    global _n
    _n = globals().get('_n', 0) + 1
    os.environ["YUI_MOTION_REST_EARLY"] = "off" if off else "on"
    spec = importlib.util.spec_from_file_location(f"yui_motion_t{_n}", os.path.join(os.path.expanduser(path), "motion.py"))
    m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m)
    return m


async def run(M, ask):
    t0 = time.time(); agen = M.split_film(ask); at = []; dur = 3.0
    try:
        async for s in agen:
            at.append(round(time.time() - t0, 2))
            if len(at) == 1: dur = s["dur"]
            if len(at) == 2: break
    finally:
        await agen.aclose()
    return at, dur


async def main(a):
    n = int(a[a.index("--n") + 1]) if "--n" in a else 10
    arms = {"off": load(a[0], True), "on": load(a[0], False)}
    for M in arms.values():
        M.prime()
    rows = {"off": [], "on": []}
    for i, ask in enumerate(ASKS[:n]):
        for k in (("off", "on") if i % 2 == 0 else ("on", "off")):
            at, dur = await run(arms[k], ask["ask"] if isinstance(ask, dict) else ask)
            if len(at) == 2:
                rows[k].append((at[0], at[1], max(0.0, round(at[1] - at[0] - dur, 2))))
            print(k, ask.get("id") if isinstance(ask, dict) else "", at, "dur", dur, flush=True)
    for k, r in rows.items():
        print(k, "first", statistics.median(x[0] for x in r), "second", statistics.median(x[1] for x in r),
              "gap", statistics.median(x[2] for x in r), "ready%", round(100 * sum(x[2] <= 0.05 for x in r) / len(r)), "n", len(r))

if __name__ == "__main__":
    asyncio.run(main(sys.argv[1:]))
