#!/usr/bin/env python3
"""Publish a checked test set (run_set.py output) to the site (MOTION-1): films + posters under
public/demo/motion/gallery, and the index the /motion page reads at lib/motion/gallery.json.

  python3 site/scripts/motion/publish_set.py <set-dir> [--serial <dir of a one-at-a-time run>]"""
import json, os, shutil, statistics, sys
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.join(HERE, "..", "..")
asks = json.load(open(os.path.join(ROOT, "public", "demo", "motion", "asks.json")))
src = sys.argv[1]
serial = sys.argv[sys.argv.index("--serial") + 1] if "--serial" in sys.argv else None
dst = os.path.join(ROOT, "public", "demo", "motion", "gallery")
os.makedirs(dst, exist_ok=True)
rows, firsts, costs, lens = [], [], [], []
for a in [x for x in asks if not x.get("extra")]:  # extras (hand-added, one run) are not republished
    runs = []
    for r in (1, 2):
        n = f"{a['id']}-r{r}"
        f = json.load(open(os.path.join(src, n + ".json")))
        f["scenes"] = [{k: s[k] for k in ("name", "dur", "code", "at")} for s in f["scenes"]]
        json.dump(f, open(os.path.join(dst, n + ".json"), "w"), separators=(",", ":"))
        im = Image.open(os.path.join(src, n + "-poster.png")).convert("RGB").resize((260, 563))
        im.save(os.path.join(dst, n + ".webp"), "WEBP", quality=74)
        s = f["stats"]
        runs.append({"run": r, "first_scene_s": s["first_scene_s"], "total_s": s["total_s"], "film_s": s["film_s"], "scenes": s["scenes"], "cost_usd": round(s["cost_usd"] or 0, 3), "model": s["model"]})
        firsts.append(s["first_scene_s"]); costs.append(s["cost_usd"] or 0); lens.append(s["film_s"])
    rows.append({"id": a["id"], "kind": a["kind"], "ask": a["ask"], "runs": runs})
out = {"asks": rows, "summary": {"films": len(firsts), "first_scene_median_s": statistics.median(firsts), "first_scene_max_s": max(firsts), "cost_median_usd": round(statistics.median(costs), 3), "film_median_s": statistics.median(lens)}}
if serial:  # one film at a time on an idle machine: what a person would wait
    ss = [r["stats"]["first_scene_s"] for r in json.load(open(os.path.join(serial, "index.json")))]
    out["summary"].update({"first_scene_serial_median_s": statistics.median(ss), "first_scene_serial_max_s": max(ss), "serial_films": len(ss)})
os.makedirs(os.path.join(ROOT, "lib", "motion"), exist_ok=True)
json.dump(out, open(os.path.join(ROOT, "lib", "motion", "gallery.json"), "w"), indent=1)
print(out["summary"])
