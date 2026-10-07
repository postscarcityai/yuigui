#!/usr/bin/env python3
"""Judge calibration (MOTION-9): saved frames, hand labels, per-class agreement of the film judge.

  harvest <dir>              render the mid frame of every scene of the published gallery films into <dir>/frames, judge each once
  score <dir> <labels.json> [--tag name]   judge the labelled frames again (twice), print agreement per class and rescore agreement
labels.json = {"<frame id>": "offsubject|plain|pass"}. Frame id = <film>-<scene index>.
A judge verdict maps to a class: issue offsubject -> offsubject, issue plain -> plain, anything else that passes (score 3+ or ok) -> pass,
everything else (small, cramped, ...) -> other (never labelled here, only the three classes are)."""
import json, os, sys, glob, concurrent.futures as cf
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import look as L
from PIL import Image

GAL = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "public", "demo", "motion", "gallery")


def klass(v):
    if not v:
        return "none"
    if "subject" in v:
        return {"drawn": "pass", "stand-in": "offsubject", "none": "plain"}.get(v["subject"], "pass")
    if v["score"] < 3 and v["issue"] in ("offsubject", "plain"):
        return v["issue"]
    return "pass" if v["score"] >= 3 else "other"


def harvest(d):
    os.makedirs(os.path.join(d, "frames"), exist_ok=True)
    meta = {}
    for fp in sorted(glob.glob(os.path.join(GAL, "*-r?.json"))):
        name = os.path.basename(fp)[:-5]
        f = json.load(open(fp))
        if not f.get("scenes"):
            continue
        try:
            rendered, errors = L.render_scenes(f, f.get("theme"))
        except Exception as e:
            print("render failed", name, e, flush=True); continue
        for i, (s, im1, im2, texts, seen) in enumerate(rendered):
            fid = f"{name}-{i}"
            im1.save(os.path.join(d, "frames", fid + ".png"))
            meta[fid] = {"ask": f["ask"], "scene": s["name"]}
        print("rendered", name, len(rendered), flush=True)
    json.dump(meta, open(os.path.join(d, "meta.json"), "w"), indent=1)
    judge_all(d, meta, "base")


def judge_all(d, meta, tag, runs=1, only=None):
    ids = [i for i in meta if not only or i in only]
    res = {i: [] for i in ids}
    for r in range(runs):
        with cf.ThreadPoolExecutor(6) as ex:
            vs = list(ex.map(lambda i: L.vision(Image.open(os.path.join(d, "frames", i + ".png")).convert("RGB"), meta[i]["ask"], meta[i]["scene"]), ids))
        for i, v in zip(ids, vs):
            res[i].append(v)
    json.dump(res, open(os.path.join(d, f"verdicts-{tag}.json"), "w"), indent=1)
    return res


def score(d, labels, tag):
    meta = json.load(open(os.path.join(d, "meta.json")))
    lab = json.load(open(labels))
    res = judge_all(d, meta, tag, runs=2, only=set(lab))
    out = {}
    for c in ("offsubject", "plain", "pass"):
        ids = [i for i in lab if lab[i] == c]
        hit = sum(klass(res[i][0]) == c for i in ids)
        out[c] = (hit, len(ids))
    tot = sum(h for h, n in out.values()); n = sum(n for h, n in out.values())
    same = sum(klass(res[i][0]) == klass(res[i][1]) for i in res)
    print(tag, {c: f"{h}/{n} {100*h/max(n,1):.0f}%" for c, (h, n) in out.items()}, f"all {tot}/{n} {100*tot/max(n,1):.0f}%", f"rescore {same}/{len(res)} {100*same/max(len(res),1):.0f}%")
    miss = [(i, lab[i], klass(res[i][0]), (res[i][0] or {}).get("note")) for i in lab if klass(res[i][0]) != lab[i]]
    for m in miss:
        print("  miss", m)


if __name__ == "__main__":
    a = sys.argv[1:]
    if a[0] == "harvest":
        harvest(a[1])
    else:
        score(a[1], a[2], a[a.index("--tag") + 1] if "--tag" in a else "run")
