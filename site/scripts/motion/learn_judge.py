#!/usr/bin/env python3
"""Judge one drawing for the plugin's background learner (MOTION-25). Same render and look as seed_build.py.

  uv run --with playwright --with pillow python site/scripts/motion/learn_judge.py <plugin-dir> <thing.json> [--sheet frame.png]

thing.json = {"name", "label", "parts"}. Prints one JSON line {"pass", "fail", "note", "score"}. The plugin (motion_hero._judge) runs it
after a film is over, never inside a turn."""
import importlib.util, json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import look as L


def main():
    a = sys.argv[1:]
    spec = importlib.util.spec_from_file_location("motion_hero", os.path.join(os.path.expanduser(a[0]), "motion_hero.py"))
    H = importlib.util.module_from_spec(spec); spec.loader.exec_module(H)
    th = json.load(open(a[1]))
    label = th["label"]
    code = (H.define_call(dict(name=th["name"], parts=th["parts"])) + "\n" + H.hero_call(th["name"], "api.seg(t, 0, 1.2)") + "\n" +
            "const k = api.seg(t, 0, 1.8);\n" + f"api.callout('{label.title()}', api.w/2 + 80, 200, api.w/2 + 140, 110, {{k}});\n" +
            "api.swarm(20, t, {mode:'rise', cx:api.w/2 + 100, cy:150, rx:40, ry:60, c:'accent', size:2, k});")
    an = "an" if label[:1] in "aeiou" else "a"
    film = {"ask": f"{an.title()} {label}, shown clearly.", "scenes": [{"name": "one", "dur": 3.0, "code": code}]}
    r = L.look(film, True, ask=film["ask"])[0]
    if "--sheet" in a:
        r["frame"].save(a[a.index("--sheet") + 1])
    v = r.get("vision") or {}
    print(json.dumps({"pass": r["pass"], "fail": r["fail"], "note": v.get("note"), "score": v.get("score")}))


main()
