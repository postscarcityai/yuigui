#!/usr/bin/env python3
"""Build the things seed (MOTION-23): make parts once per noun with the plugin's own parts call, render each as a one-scene film, judge it.

  uv run --with playwright --with pillow python site/scripts/motion/seed_build.py <out-dir> [--plugin ~/dev/yui/hermes-plugin/yui] [--nouns a,b] [--jobs 3]

Writes <out-dir>/parts/<noun>.json (the drawing), <out-dir>/seed-sheet.png and <out-dir>/seed-judge.json. A thing passes when
the plain checks pass and the vision look calls it 'drawn' with score 3+."""
import asyncio, importlib.util, json, os, sys, concurrent.futures as cf
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import look as L

NOUNS = ["giraffe", "windmill", "volcano", "microscope", "tractor", "helicopter", "octopus", "cactus", "guitar", "piano", "elephant", "telescope",
         "submarine", "balloon", "kangaroo", "snail", "dolphin", "pyramid", "crane", "spider", "camel", "tree", "horse"]


def load(path):
    spec = importlib.util.spec_from_file_location("motion_hero", os.path.join(os.path.expanduser(path), "motion_hero.py"))
    m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m); return m


def ask_for(n):
    return f"How a {n} works." if n in ("windmill", "microscope", "tractor", "helicopter", "guitar", "piano", "telescope", "submarine", "crane") else f"A {n}, shown clearly."


def film_for(H, name, th):
    code = (H.define_call(dict(name=name, parts=th["parts"])) + "\n" + H.hero_call(name, "api.seg(t, 0, 1.2)") + "\n" +
            "const k = api.seg(t, 0, 1.8);\n" + f"api.callout('{th['label'].title()}', api.w/2 + 80, 200, api.w/2 + 140, 110, {{k}});\n" +
            "api.swarm(20, t, {mode:'rise', cx:api.w/2 + 100, cy:150, rx:40, ry:60, c:'accent', size:2, k});")
    return {"ask": ask_for(th["label"]), "scenes": [{"name": "one", "dur": 3.0, "code": code}]}


async def draw(H, n):
    return await H.draw_new(ask_for(n))


def main():
    a = sys.argv[1:]; out = a[0]; os.makedirs(os.path.join(out, "parts"), exist_ok=True)
    plug = a[a.index("--plugin") + 1] if "--plugin" in a else "~/dev/yui/hermes-plugin/yui"
    nouns = a[a.index("--nouns") + 1].split(",") if "--nouns" in a else NOUNS
    jobs = int(a[a.index("--jobs") + 1]) if "--jobs" in a else 3
    os.environ["YUI_MOTION_THINGS_CACHE"] = os.path.join(out, "build-cache.json")
    H = load(plug)
    todo = [n for n in nouns if not os.path.exists(os.path.join(out, "parts", n.replace(" ", "_") + ".json"))]
    async def run():
        sem = asyncio.Semaphore(jobs)
        async def one(n):
            async with sem:
                th = None
                for _ in range(2):
                    th = await H.draw_new(ask_for(n)) if not H.pick(ask_for(n)) else None
                    if th and th.get("parts"): break
                print(n, "parts" if th and th.get("parts") else "NONE", flush=True)
                if th and th.get("parts"):
                    json.dump(th, open(os.path.join(out, "parts", n.replace(" ", "_") + ".json"), "w"))
        await asyncio.gather(*[one(n) for n in todo])
    asyncio.run(run())
    rows = []
    def judge(n):
        fp = os.path.join(out, "parts", n.replace(" ", "_") + ".json")
        if not os.path.exists(fp): return n, None, None
        th = json.load(open(fp)); film = film_for(H, th["name"], th)
        return n, th, L.look(film, True, ask=film["ask"])
    with cf.ThreadPoolExecutor(3) as ex:
        res = list(ex.map(judge, nouns))
    verdict = {}; sheets = []
    for n, th, r in res:
        if not r: verdict[n] = {"pass": False, "why": "no parts"}; continue
        verdict[n] = {"pass": r[0]["pass"], "fail": r[0]["fail"], "vision": r[0].get("vision"), "name": th["name"], "label": th["label"]}
        sheets.append((n, r))
    json.dump(verdict, open(os.path.join(out, "seed-judge.json"), "w"), indent=1)
    L.sheet(sheets, os.path.join(out, "seed-sheet.png"), fw=130, cols=6)
    print(sum(v["pass"] for v in verdict.values()), "/", len(verdict), "pass")
    for n, v in verdict.items(): print(n, "PASS" if v["pass"] else "FAIL", v.get("fail"), (v.get("vision") or {}).get("note"))


main()
