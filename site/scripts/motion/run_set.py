#!/usr/bin/env python3
"""Run the 20-ask test set (MOTION-1): generate each ask N times, check every film, write sheets and an index.

  uv run --with playwright --with pillow python site/scripts/motion/run_set.py <out-dir> [--runs 2] [--only id,id] [--jobs 4]
      [--model claude-sonnet-5-5] [--effort low] [--regen]

Films land in <out-dir>/<id>-r<n>.json (reused unless --regen), sheets in <out-dir>/<id>-r<n>-sheet.png, summary in
<out-dir>/index.json."""
import json, os, sys, concurrent.futures as cf
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import film as F, check as K

HERE = os.path.dirname(os.path.abspath(__file__))
ASKS = json.load(open(os.path.join(HERE, "..", "..", "public", "demo", "motion", "asks.json")))

def one(out, a, run, model, effort, regen):
    name = f"{a['id']}-r{run}"
    fp = os.path.join(out, name + ".json")
    if regen or not os.path.exists(fp):
        F.film(a["ask"], fp, model, effort, theme=(K.DARK if run == 1 else K.LIGHT))
    f = json.load(open(fp))
    rep, imgs = K.check(f, out, name, dt=0.5)
    # a poster at 60% in, for the gallery
    im = imgs[int(len(imgs) * 0.6)][1]; im.save(os.path.join(out, name + "-poster.png"))
    return {"id": a["id"], "run": run, "ok": rep["ok"], "errors": rep["errors"], "blank": rep["blank_stretches"], "stats": f["stats"], "frames": rep["frames"]}

if __name__ == "__main__":
    a = sys.argv[1:]
    opt = lambda k, d: a[a.index(k) + 1] if k in a else d
    out = a[0]; os.makedirs(out, exist_ok=True)
    runs = int(opt("--runs", 2)); jobs = int(opt("--jobs", 4)); only = opt("--only", "").split(",") if "--only" in a else None
    sel = [x for x in ASKS if not only or x["id"] in only]
    res = []
    with cf.ThreadPoolExecutor(jobs) as ex:
        futs = [ex.submit(one, out, x, r + 1, opt("--model", "claude-sonnet-5-5"), opt("--effort", "low"), "--regen" in a) for x in sel for r in range(runs)]
        for f in cf.as_completed(futs):
            try:
                r = f.result(); res.append(r)
                s = r["stats"]; print(f"{r['id']}-r{r['run']}: ok={r['ok']} first={s['first_scene_s']}s total={s['total_s']}s scenes={s['scenes']} film={s['film_s']}s ${s['cost_usd']} err={r['errors']} blank={r['blank']}", flush=True)
            except Exception as e:
                print("FAILED", e, flush=True)
    res.sort(key=lambda r: (r["id"], r["run"]))
    json.dump(res, open(os.path.join(out, "index.json"), "w"), indent=1)
    print("ok" if all(r["ok"] for r in res) else "SOME FAILED", len(res))
