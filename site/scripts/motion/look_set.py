#!/usr/bin/env python3
"""Run the look pass on the 20-ask set, each ask twice, with films made by the plugin's own maker (MOTION-2).

  uv run --with playwright --with pillow python site/scripts/motion/look_set.py <out-dir> [--runs 2] [--jobs 2]
      [--plugin ~/dev/yui/hermes-plugin/yui] [--fresh-loop (one event loop per film, no warm process)] [--only id,id] [--set heldout] [--regen] [--no-vision] [--reuse-vision <old summary.json>]

The maker is hermes-plugin/yui/motion.py `split_film` (haiku writes scene 1, sonnet the rest, both started at once),
so the films and the first-scene seconds are what a phone gets. Films land in <out-dir>/films/<id>-r<n>.json and are
reused unless --regen (so "after" can re-judge the same films). Writes <out-dir>/summary.json, index sheets
<out-dir>/sheet-<n>.png (five films each) and prints the pass rates."""
import asyncio, importlib.util, json, os, sys, threading, time, concurrent.futures as cf

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import look as L

ASKDIR = os.path.join(HERE, "..", "..", "public", "demo", "motion")
# The 20 films of the set, then the 5 small asks (MOTION-7; asks-small.json). --only picks any of them by id.
ASKS = json.load(open(os.path.join(ASKDIR, "asks.json")))[:20] + json.load(open(os.path.join(ASKDIR, "asks-small.json")))
# MOTION-14: ten held-out asks with a body, written after the kit was built and never used to build it. --set heldout runs only these.
HELDOUT = json.load(open(os.path.join(ASKDIR, "asks-heldout.json")))
# MOTION-15: ten more held-out asks whose noun is not in the kit (and never used to build the fix). --set heldout2 runs only these.
HELDOUT2 = json.load(open(os.path.join(ASKDIR, "asks-heldout2.json")))
SETS = {"heldout": HELDOUT, "heldout2": HELDOUT2}


def load_plugin(path):
    spec = importlib.util.spec_from_file_location("yui_motion", os.path.join(path, "motion.py"))
    m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m)
    return m


async def make_film(M, ask):
    t0 = time.time(); scenes = []
    agen = M.split_film(ask)
    try:
        async for s in agen:
            scenes.append(dict(s, at=round(time.time() - t0, 1)))
            if len(scenes) >= M.MAX_SCENES:
                break
    finally:
        await agen.aclose()
    return {"ask": ask, "scenes": scenes, "stats": {"first_scene_s": scenes[0]["at"] if scenes else None, "total_s": round(time.time() - t0, 1),
                                                     "scenes": len(scenes), "film_s": sum(s["dur"] for s in scenes),
                                                     # MOTION-19: when scene 2 arrives, and how long the player sits on scene 1's last frame waiting for it
                                                     "second_scene_s": scenes[1]["at"] if len(scenes) > 1 else None,
                                                     "gap_s": round(max(0.0, scenes[1]["at"] - scenes[0]["at"] - scenes[0]["dur"]), 1) if len(scenes) > 1 else None}}


LOOP = None  # MOTION-18: one long-lived event loop for every film, like the gateway's, so a warm claude process lives between films


def start_loop(M):
    global LOOP
    LOOP = asyncio.new_event_loop()
    threading.Thread(target=LOOP.run_forever, daemon=True).start()
    if hasattr(M, "prime"):
        LOOP.call_soon_threadsafe(M.prime)
        time.sleep(5)  # the warm process is up before the first film, as it is on a gateway that has been running


def one(M, out, a, run, regen, vision, prior=None):
    name = f"{a['id']}-r{run}"
    fp = os.path.join(out, "films", name + ".json")
    if regen or not os.path.exists(fp):
        f = asyncio.run_coroutine_threadsafe(make_film(M, a["ask"]), LOOP).result() if LOOP else asyncio.run(make_film(M, a["ask"]))
        json.dump(f, open(fp, "w"), indent=1)
    f = json.load(open(fp))
    if not f["scenes"]:
        return name, f, []
    pv = [d.get("vision") for d in prior[name]["detail"]] if prior and name in prior else None
    return name, f, L.look(f, vision, ask=a["ask"], prior=pv)


def rate(rows):
    return round(100 * sum(r["pass"] for r in rows) / max(1, len(rows)), 1)


if __name__ == "__main__":
    a = sys.argv[1:]
    opt = lambda k, d: a[a.index(k) + 1] if k in a else d
    out = a[0]; os.makedirs(os.path.join(out, "films"), exist_ok=True)
    M = load_plugin(os.path.expanduser(opt("--plugin", "~/dev/yui/hermes-plugin/yui")))
    if "--fresh-loop" not in a:
        start_loop(M)
    only = opt("--only", "").split(",") if "--only" in a else None
    sel = [x for x in SETS.get(opt("--set", ""), ASKS) if not only or x["id"] in only]
    jobs = [(x, r + 1) for x in sel for r in range(int(opt("--runs", 2)))]
    prior = json.load(open(opt("--reuse-vision", "")))["per_film"] if "--reuse-vision" in a else None
    done = {}
    with cf.ThreadPoolExecutor(int(opt("--jobs", 2))) as ex:
        futs = {ex.submit(one, M, out, x, r, "--regen" in a, "--no-vision" not in a, prior): (x["id"], r) for x, r in jobs}
        for f in cf.as_completed(futs):
            try:
                name, film, rows = f.result()
            except Exception as e:
                print("FAILED", futs[f], e, flush=True); continue
            done[name] = (film, rows)
            print(f"{name}: first={film['stats']['first_scene_s']}s scenes={len(rows)} pass={sum(r['pass'] for r in rows)}/{len(rows)} "
                  + " ".join(sorted({x for r in rows for x in r['fail']})), flush=True)
    names = sorted(done)
    allrows = [r for n in names for r in done[n][1]]
    classes = {}
    for r in allrows:
        for c in r["fail"]:
            classes[c] = classes.get(c, 0) + 1
    firsts = sorted(done[n][0]["stats"]["first_scene_s"] for n in names if done[n][0]["stats"]["first_scene_s"] is not None)
    films_ok = [n for n in names if done[n][1] and all(r["pass"] for r in done[n][1])]
    med = lambda xs: sorted(xs)[len(xs) // 2] if xs else None
    seconds = [done[n][0]["stats"]["second_scene_s"] for n in names if done[n][0]["stats"].get("second_scene_s") is not None]
    gaps = [done[n][0]["stats"]["gap_s"] for n in names if done[n][0]["stats"].get("gap_s") is not None]
    summary = {"films": len(names),
               "second_scene_s": {"median": med(seconds)}, "scene_gap_s": {"median": med(gaps), "ready_pct": round(100 * sum(1 for g in gaps if g <= 0.05) / max(1, len(gaps)), 1)}, "frames": len(allrows), "frame_pass_pct": rate(allrows),
               "film_all_pass_pct": round(100 * len(films_ok) / max(1, len(names)), 1),
               "film_pass_80_pct": round(100 * sum(1 for n in names if done[n][1] and rate(done[n][1]) >= 80) / max(1, len(names)), 1),
               "fail_classes": dict(sorted(classes.items(), key=lambda kv: -kv[1])),
               "first_scene_s": {"median": firsts[len(firsts) // 2] if firsts else None, "mean": round(sum(firsts) / len(firsts), 1) if firsts else None, "max": firsts[-1] if firsts else None},
               "per_film": {n: {"pass": f"{sum(r['pass'] for r in rows)}/{len(rows)}", "first_scene_s": f["stats"]["first_scene_s"], "total_s": f["stats"]["total_s"],
                                "fails": [r["fail"] for r in rows], "detail": [{"scene": r["scene"], **r["plain"], **({"vision": r["vision"]} if r.get("vision") else {})} for r in rows]} for n, (f, rows) in done.items()}}
    small_ids = {x["id"] for x in ASKS if x.get("small")}
    def group(ns):
        rows = [r for n in ns for r in done[n][1]]
        st = [done[n][0]["stats"] for n in ns]
        avg = lambda k: round(sum((x.get(k) or 0) for x in st) / max(1, len(st)), 3)
        return {"films": len(ns), "frames": len(rows), "frame_pass_pct": rate(rows), "total_s_per_film": avg("total_s"), "first_scene_s": avg("first_scene_s"), "scenes_per_film": avg("scenes"), "film_s": avg("film_s")}
    summary["by_group"] = {"small": group([n for n in names if n.rsplit("-r", 1)[0] in small_ids]),
                           "full": group([n for n in names if n.rsplit("-r", 1)[0] not in small_ids])}
    for n in names:
        summary["per_film"][n].update({k: done[n][0]["stats"].get(k) for k in ("scenes", "film_s")})
    json.dump(summary, open(os.path.join(out, "summary.json"), "w"), indent=1)
    for i in range(0, len(names), 5):
        L.sheet([(n, done[n][1]) for n in names[i:i + 5] if done[n][1]], os.path.join(out, f"sheet-{i // 5 + 1}.png"))
    print(json.dumps({k: v for k, v in summary.items() if k != "per_film"}, indent=1))
