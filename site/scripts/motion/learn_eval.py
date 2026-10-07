#!/usr/bin/env python3
"""MOTION-25: ask 12 nouns twice (fresh words the second time) with an empty disk cache and the background learner on.

  uv run --with playwright --with pillow python site/scripts/motion/learn_eval.py <out-dir> [--plugin DIR] [--learn off] [--only noun,noun]

Phase 1 asks every noun once (a film each, one at a time); the learner queues a background drawing as each film ends. Phase 2 waits
until the learner is idle, then asks every noun again in other words. Both phases record first-scene seconds, then the look pass
judges every frame. Writes <out>/compare.json, <out>/learned-sheet.png (the drawings that were kept) and prints the table."""
import asyncio, json, os, statistics, sys, time
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import look as L
import look_set as S

ASKS = json.load(open(os.path.join(HERE, "..", "..", "public", "demo", "motion", "asks-learn.json")))


def main():
    a = sys.argv[1:]
    opt = lambda k, d: a[a.index(k) + 1] if k in a else d
    out = os.path.abspath(a[0]); os.makedirs(os.path.join(out, "films"), exist_ok=True)
    os.environ["YUI_MOTION_THINGS_CACHE"] = os.path.join(out, "cache.json")
    if os.path.exists(os.environ["YUI_MOTION_THINGS_CACHE"]) and "--keep-cache" not in a:
        os.remove(os.environ["YUI_MOTION_THINGS_CACHE"])
    os.environ["YUI_MOTION_LEARN_JUDGE"] = os.path.join(HERE, "learn_judge.py")
    os.environ["YUI_MOTION_LEARN"] = "off" if opt("--learn", "on") == "off" else "on"
    plug = os.path.expanduser(opt("--plugin", "~/dev/yui/hermes-plugin/yui"))
    M = S.load_plugin(plug)
    H = M.motion_hero
    S.start_loop(M)
    only = opt("--only", "").split(",") if "--only" in a else None
    asks = [x for x in ASKS if not only or x["noun"] in only]
    films = {}

    def run(tag, key):
        for x in asks:
            fp = os.path.join(out, "films", f"{x['noun']}-{tag}.json")
            if os.path.exists(fp):
                films[(x["noun"], tag)] = json.load(open(fp)); continue
            f = asyncio.run_coroutine_threadsafe(S.make_film(M, x[key]), S.LOOP).result()
            json.dump(f, open(fp, "w"), indent=1); films[(x["noun"], tag)] = f
            print(tag, x["noun"], "first", f["stats"]["first_scene_s"], "s", flush=True)

    run("ask1", "ask")
    t0 = time.time()
    while not H.learn_idle() and time.time() - t0 < 900:
        time.sleep(2)
    print("learner idle after", round(time.time() - t0), "s;", "log:", json.dumps(H._LEARN_LOG), flush=True)
    log = list(H._LEARN_LOG)
    json.dump(log, open(os.path.join(out, "learn-log.json"), "w"), indent=1)
    hit = {x["noun"]: (H.seeded(x["ask2"]) or {}).get("name") for x in asks}  # what the second ask finds in the cache, before it is asked
    print("second asks that hit a learned drawing:", json.dumps(hit), flush=True)
    H.learn_after = lambda *a, **k: False  # the second round must not learn, or it would change the cache the second asks are measured on
    run("ask2", "ask2")

    res = {}
    for (noun, tag), f in sorted(films.items()):
        rows = L.look(f, True, ask=f["ask"]) if f["scenes"] else []
        res[(noun, tag)] = (f, rows)
    per = {}
    for (noun, tag), (f, rows) in res.items():
        per.setdefault(noun, {})[tag] = {"first_scene_s": f["stats"]["first_scene_s"], "frames": len(rows), "frames_pass": sum(r["pass"] for r in rows),
                                         "fails": sorted({c for r in rows for c in r["fail"]})}
    learned = {n: hit[n] is not None for n in per}  # learned = the second ask found a kept drawing
    def agg(tag, sel=None):
        ns = [n for n in per if (sel is None or sel(n)) and tag in per[n]]
        fs = [per[n][tag]["first_scene_s"] for n in ns if per[n][tag]["first_scene_s"] is not None]
        fr = sum(per[n][tag]["frames"] for n in ns); ok = sum(per[n][tag]["frames_pass"] for n in ns)
        return {"nouns": len(ns), "first_scene_median_s": statistics.median(fs) if fs else None, "first_scene_mean_s": round(statistics.mean(fs), 2) if fs else None,
                "first_scene_max_s": max(fs) if fs else None, "frames": fr, "frame_pass_pct": round(100 * ok / max(1, fr), 1)}
    cmp = {"learner": os.environ["YUI_MOTION_LEARN"], "learn_log": log, "learned": learned, "second_ask_hit": hit, "per_noun": per,
           "ask1_all": agg("ask1"), "ask2_all": agg("ask2"),
           "ask1_learned": agg("ask1", lambda n: learned[n]), "ask2_learned": agg("ask2", lambda n: learned[n]),
           "ask1_not_learned": agg("ask1", lambda n: not learned[n]), "ask2_not_learned": agg("ask2", lambda n: not learned[n])}
    json.dump(cmp, open(os.path.join(out, "compare.json"), "w"), indent=1, default=str)
    sheets = [(f"{n} {t}", res[(n, t)][1]) for n in per for t in ("ask1", "ask2") if (n, t) in res and res[(n, t)][1]]
    for i in range(0, len(sheets), 6):
        L.sheet(sheets[i:i + 6], os.path.join(out, f"films-{i // 6 + 1}.png"), fw=90, cols=8)
    print(json.dumps({k: v for k, v in cmp.items() if k not in ("per_noun", "learn_log")}, indent=1))
    for n, p in per.items():
        print(n, "learned" if learned[n] else "-", p.get("ask1"), p.get("ask2"))
    sys.stdout.flush(); os._exit(0)


main()
