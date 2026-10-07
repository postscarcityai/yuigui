#!/usr/bin/env python3
"""MOTION-29: score the native runtime's two-ask run (yui runtime/scripts/live_motion29.ts) the way learn_eval.py scores the plugin's.

  uv run --with playwright --with pillow --with matplotlib python site/scripts/motion/native_eval.py <out-dir> <asks-native.json> [--sheet kept.jpg] [--chart chart.jpg]

Reads <out>/<noun>-ask1.json and -ask2.json (first-scene seconds, the scenes each film saved, the hero it used, whether the drawing call ran),
renders and looks at every scene (look.py: plain checks plus the vision look), and writes <out>/compare.json. A noun is `drawn` when its first
ask had to draw it (a defined hero, one drawing call), `kit word` when a word in the agent's own motion line picked a kit object instead
(a skateboard film that drew a truck), `none` when no hero was found. A second ask `hit`s when it used a defined hero and made no drawing call."""
import json, os, statistics, sys
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import look as L


def main():
    a = sys.argv[1:]
    opt = lambda k, d=None: a[a.index(k) + 1] if k in a else d
    out = os.path.abspath(a[0])
    nouns = [x["noun"] for x in json.load(open(a[1]))]
    recs, rows = {}, {}
    for n in ([] if "--sheet-only" in a else nouns):
        for ph in ("ask1", "ask2"):
            p = os.path.join(out, f"{n}-{ph}.json")
            if not os.path.exists(p):
                continue
            r = json.load(open(p)); recs[(n, ph)] = r
            if r["scenes"]:
                # a saved row closes each scene with a bare `end` line; the player strips it, the renderer here must too
                scenes = [dict(sc, code="\n".join(l for l in sc["code"].split("\n") if l.strip() != "end")) for sc in r["scenes"]]
                film = {"ask": r.get("film_ask") or r["ask"], "scenes": scenes}
                rows[(n, ph)] = L.look(film, True, ask=film["ask"])
    per = {}
    for (n, ph), r in recs.items():
        rs = rows.get((n, ph), [])
        hero, defined = r.get("hero"), r.get("defined")
        # the hero is the noun's own drawing when its name starts with the noun (violin_bow for violin); a seed or kept drawing of another thing
        # (a balloon for a windsock, a trumpet for a tuba) is a miss for this noun
        own = bool(hero) and (hero == n or hero.startswith(n + "_") or n.startswith(hero + "_"))
        kind = "drawn" if defined and r["drawing_calls"] >= 1 else "kept" if defined and own else "other" if defined else "kit word" if hero else "none"
        per.setdefault(n, {})[ph] = {"first_scene_s": r["first_scene_s"], "frames": len(rs), "frames_pass": sum(x["pass"] for x in rs), "hero": hero,
                                     "kind": kind, "drawing_calls": r["drawing_calls"], "learned": r.get("learned"), "film_ask": r.get("film_ask"),
                                     "fails": sorted({c for x in rs for c in x["fail"]})}
    if "--sheet-only" in a:
        per = {}
    drawn = [n for n in per if per[n].get("ask1", {}).get("kind") == "drawn"]
    hit = [n for n in drawn if per[n].get("ask2", {}).get("kind") == "kept"]

    def agg(tag, ns):
        ns = [n for n in ns if tag in per[n]]
        fs = [per[n][tag]["first_scene_s"] for n in ns if per[n][tag]["first_scene_s"] is not None]
        fr = sum(per[n][tag]["frames"] for n in ns); ok = sum(per[n][tag]["frames_pass"] for n in ns)
        return {"nouns": len(ns), "films": len(fs), "first_scene_median_s": statistics.median(fs) if fs else None,
                "first_scene_mean_s": round(statistics.mean(fs), 2) if fs else None, "first_scene_max_s": max(fs) if fs else None,
                "frames": fr, "frames_pass": ok, "frame_pass_pct": round(100 * ok / max(1, fr), 1)}

    cmp = {"nouns": len(per), "kinds_ask1": {k: sum(1 for n in per if per[n].get("ask1", {}).get("kind") == k) for k in ("drawn", "kit word", "none")},
           "drawn": drawn, "second_ask_hit": hit,
           "ask1_all": agg("ask1", list(per)), "ask2_all": agg("ask2", list(per)),
           "ask1_drawn": agg("ask1", drawn), "ask2_drawn": agg("ask2", drawn), "ask1_hit": agg("ask1", hit), "ask2_hit": agg("ask2", hit),
           "per_noun": per}
    json.dump(cmp, open(os.path.join(out, "compare.json"), "w"), indent=1)
    print(json.dumps({k: v for k, v in cmp.items() if k != "per_noun"}, indent=1))
    for n, p in per.items():
        print(n, {k: (v["kind"], v["hero"], v["first_scene_s"], f'{v["frames_pass"]}/{v["frames"]}') for k, v in p.items()})
    if opt("--chart"):
        import matplotlib; matplotlib.use("Agg"); import matplotlib.pyplot as plt
        names = [n for n in per if "ask1" in per[n]]
        fig, (ax, bx) = plt.subplots(1, 2, figsize=(11, 4.4), gridspec_kw={"width_ratios": [3, 1.3]})
        x = range(len(names)); w = 0.38
        f = lambda n, t: (per[n].get(t, {}).get("first_scene_s") or 0)
        ax.bar([i - w / 2 for i in x], [f(n, "ask1") for n in names], w, label="first ask", color=["#9aa0b4" if per[n]["ask1"]["kind"] == "drawn" else "#d9a441" for n in names])
        ax.bar([i + w / 2 for i in x], [f(n, "ask2") for n in names], w, label="second ask", color=["#3aa76d" if n in hit else "#c9c9d4" for n in names])
        ax.set_xticks(list(x)); ax.set_xticklabels(names, rotation=40, ha="right", fontsize=8); ax.set_ylabel("seconds to first scene")
        ax.set_title("Native first scene: grey/amber = first ask (amber: a kit word took the hero), green = second ask hit a kept drawing", fontsize=8)
        labels = ["first ask\n(drawn)", "second ask\n(hit)"]
        vals = [cmp["ask1_drawn"]["frame_pass_pct"], cmp["ask2_hit"]["frame_pass_pct"] if cmp["ask2_hit"]["frames"] else 0]
        bx.bar(labels, vals, color=["#9aa0b4", "#3aa76d"]); bx.set_ylim(0, 100); bx.axhline(90, ls="--", c="#555", lw=1)
        for i, v in enumerate(vals): bx.text(i, v + 1, f"{v}%", ha="center", fontsize=9)
        bx.set_title("Frame pass", fontsize=9)
        plt.tight_layout(); plt.savefig(opt("--chart"), dpi=140)
    if opt("--sheet"):  # the drawings the judge kept, drawn big on the player background
        import importlib.util, urllib.request
        from PIL import Image, ImageDraw
        sys.path.insert(0, HERE)
        spec = importlib.util.spec_from_file_location("jt", os.path.join(HERE, "judge_things.py"))
        src = open(os.path.join(HERE, "judge_things.py")).read().replace("\nmain()\n", "\n")
        ns = {"__name__": "jt", "__file__": os.path.join(HERE, "judge_things.py")}; exec(compile(src, "judge_things.py", "exec"), ns)
        plug = os.path.expanduser(opt("--plugin", "~/dev/yui/hermes-plugin/yui"))
        hs = importlib.util.spec_from_file_location("motion_hero", os.path.join(plug, "motion_hero.py")); H = importlib.util.module_from_spec(hs); hs.loader.exec_module(H)
        things = ns["sql"]("select name, label, parts, status from public.yui_motion_things where status in ('kept','failed','drawn') order by name")
        code = lambda t: H.define_call(dict(name=t["name"], parts=t["parts"])) + "\n" + H.hero_call(t["name"], "1") + "\n"
        film = {"ask": "", "scenes": [{"name": t["name"], "dur": 3.0, "code": code(t)} for t in things]}
        rend, _ = L.render_scenes(film)
        cols, fw = 5, 260; fh = int(fw * L.H / L.W * 0.62); pad = 6
        nr = (len(things) + cols - 1) // cols
        S = Image.new("RGB", (cols * (fw + pad) + pad, nr * (fh + 22 + pad) + pad), (22, 20, 30)); d = ImageDraw.Draw(S)
        for i, ((s, im, *_r), t) in enumerate(zip(rend, things)):
            w_, h_ = im.size; crop = im.crop((0, int(h_ * 0.2), w_, int(h_ * 0.74))).resize((fw, fh))
            xx, yy = pad + (i % cols) * (fw + pad), pad + (i // cols) * (fh + 22 + pad)
            S.paste(crop, (xx, yy)); d.text((xx + 4, yy + fh + 5), f"{t['label']}  [{t['status']}]", fill=(120, 230, 150) if t["status"] == "kept" else (255, 120, 120))
        S.convert("RGB").save(opt("--sheet"), quality=88); print(opt("--sheet"), S.size)
    os._exit(0)


main()
