#!/usr/bin/env python3
"""MOTION-30 demo media: a before/after contact sheet of first-ask frames and the variants chart.

  uv run --with playwright --with pillow --with matplotlib python site/scripts/motion/native30_media.py <runs-dir> <out-dir>

<runs-dir> holds one folder per variant, each with <noun>-ask1.json (yui runtime/scripts/live_motion30.ts) and compare.json (native_eval.py).
Needs A (the chat-model writer) and H (the strong route) for the sheet; every folder named in VARIANTS goes in the chart."""
import json, os, statistics, sys
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import look as L
from PIL import Image, ImageDraw

RUNS, OUT = os.path.abspath(sys.argv[1]), os.path.abspath(sys.argv[2])
os.makedirs(OUT, exist_ok=True)
NOUNS = ["hourglass", "drum", "skateboard", "catapult", "trumpet", "bagpipes"]
VARIANTS = [("A", "chat model\n(before)"), ("B", "+ guard"), ("C", "+ Sonnet\nhero"), ("E2", "+ Sonnet\nfilm"), ("H", "+ Haiku scene 1\n+ hero ahead")]


def first_frame(tag, noun):
    r = json.load(open(os.path.join(RUNS, tag, f"{noun}-ask1.json")))
    if not r["scenes"]:
        return None, r
    s = r["scenes"][0]
    film = {"ask": r.get("film_ask") or r["ask"], "scenes": [dict(s, code="\n".join(l for l in s["code"].split("\n") if l.strip() != "end"))]}
    rend, _ = L.render_scenes(film)
    return rend[0][1], r


def sheet():
    fw, fh, pad = 190, 330, 6
    S = Image.new("RGB", (len(NOUNS) * (fw + pad) + pad + 70, 2 * (fh + 24 + pad) + pad), (22, 20, 30)); d = ImageDraw.Draw(S)
    for row, (tag, name) in enumerate([("A", "before"), ("H", "after")]):
        d.text((6, pad + row * (fh + 24 + pad) + fh // 2), name, fill=(240, 240, 250))
        for i, n in enumerate(NOUNS):
            im, r = first_frame(tag, n)
            x, y = 70 + pad + i * (fw + pad), pad + row * (fh + 24 + pad)
            if im is not None:
                w, h = im.size; S.paste(im.crop((0, int(h * 0.1), w, int(h * 0.82))).resize((fw, fh)), (x, y))
            d.text((x + 4, y + fh + 6), f"{n}: hero {r.get('hero')}", fill=(200, 200, 215))
    S.save(os.path.join(OUT, "m30-sheet.jpg"), quality=88)


def chart():
    import matplotlib; matplotlib.use("Agg"); import matplotlib.pyplot as plt
    rows = []
    for tag, label in VARIANTS:
        p = os.path.join(RUNS, tag, "compare.json")
        if os.path.exists(p):
            a = json.load(open(p))["ask1_all"]; rows.append((label, a["frame_pass_pct"], a["first_scene_median_s"]))
    fig, (ax, bx) = plt.subplots(1, 2, figsize=(11, 4.4))
    cols = ["#9aa0b4"] * (len(rows) - 1) + ["#3aa76d"]
    ax.bar([r[0] for r in rows], [r[1] for r in rows], color=cols); ax.axhline(70, ls="--", c="#555", lw=1); ax.set_ylim(0, 100)
    for i, r in enumerate(rows): ax.text(i, r[1] + 1.5, f"{r[1]:.0f}%", ha="center", fontsize=9)
    ax.set_title("Frames that pass, first ask, 19 nouns (goal: 70%)", fontsize=10); ax.tick_params(axis="x", labelsize=7)
    bx.bar([r[0] for r in rows], [r[2] for r in rows], color=cols); bx.axhline(3.5, ls="--", c="#555", lw=1)
    for i, r in enumerate(rows): bx.text(i, r[2] + 0.08, f"{r[2]:.1f}s", ha="center", fontsize=9)
    bx.set_title("Median seconds to the first scene (goal: 3.5 s)", fontsize=10); bx.tick_params(axis="x", labelsize=7)
    plt.tight_layout(); plt.savefig(os.path.join(OUT, "m30-chart.jpg"), dpi=140)


chart(); sheet()
