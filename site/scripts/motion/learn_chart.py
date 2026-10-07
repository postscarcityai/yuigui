#!/usr/bin/env python3
"""Before/after chart for MOTION-25 from compare.json: first scene seconds per noun, ask 1 vs ask 2, with the seed-hit line.

  uv run --with matplotlib python site/scripts/motion/learn_chart.py <compare.json> <out.png>"""
import json, sys
import matplotlib; matplotlib.use("Agg")
import matplotlib.pyplot as plt

c = json.load(open(sys.argv[1])); per = c["per_noun"]; names = list(per)
fig, (ax, bx) = plt.subplots(1, 2, figsize=(11, 4.2), gridspec_kw={"width_ratios": [3, 1.2]})
x = range(len(names)); w = 0.38
a1 = [per[n]["ask1"]["first_scene_s"] for n in names]; a2 = [per[n]["ask2"]["first_scene_s"] for n in names]
ax.bar([i - w / 2 for i in x], a1, w, label="first ask", color="#9aa0b4")
ax.bar([i + w / 2 for i in x], a2, w, label="second ask", color=["#3aa76d" if c["learned"][n] else "#d9a441" for n in names])
ax.axhline(4.0, ls="--", c="#555", lw=1); ax.text(len(names) - 0.5, 4.1, "seed hit 4.0 s", ha="right", fontsize=8)
ax.set_xticks(list(x)); ax.set_xticklabels(names, rotation=40, ha="right", fontsize=8); ax.set_ylabel("seconds to first scene")
ax.set_title("First scene: green = second ask of a learned noun, amber = not learned"); ax.legend(frameon=False, fontsize=8)
labels = ["first ask", "second ask\nlearned", "seed hit\n(MOTION-24)"]
vals = [c["ask1_all"]["frame_pass_pct"], c["ask2_learned"]["frame_pass_pct"] if c["ask2_learned"]["frames"] else 0, 94.8]
bx.bar(labels, vals, color=["#9aa0b4", "#3aa76d", "#555"]); bx.axhline(90, ls="--", c="#555", lw=1); bx.set_ylim(0, 100)
for i, v in enumerate(vals): bx.text(i, v + 1, f"{v}%", ha="center", fontsize=8)
bx.set_title("Frame pass"); bx.tick_params(labelsize=8)
plt.tight_layout(); plt.savefig(sys.argv[2], dpi=140)
