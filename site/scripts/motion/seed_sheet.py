#!/usr/bin/env python3
"""Contact sheet of the seed drawings (MOTION-23): each thing drawn big on the player background, 6 per row.
  uv run --with playwright --with pillow python site/scripts/motion/seed_sheet.py <seed.json> <out.png> [--plugin dir]"""
import importlib.util, json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import look as L
from PIL import Image, ImageDraw
seed = json.load(open(sys.argv[1])); out = sys.argv[2]
plug = sys.argv[sys.argv.index("--plugin") + 1] if "--plugin" in sys.argv else "~/dev/yui/hermes-plugin/yui"
spec = importlib.util.spec_from_file_location("motion_hero", os.path.join(os.path.expanduser(plug), "motion_hero.py"))
H = importlib.util.module_from_spec(spec); spec.loader.exec_module(H)
things = seed["things"]; names = list(things)
code = lambda n: H.define_call(dict(name=n, parts=things[n]["parts"])) + "\n" + H.hero_call(n, "1") + "\n"
film = {"ask": "", "scenes": [{"name": n, "dur": 3.0, "code": code(n)} for n in names]}
rend, _ = L.render_scenes(film)
cols, fw = 6, 260; fh = int(fw * L.H / L.W * 0.62); pad = 6
rows = (len(names) + cols - 1) // cols
S = Image.new("RGB", (cols * (fw + pad) + pad, rows * (fh + 22 + pad) + pad), (22, 20, 30)); d = ImageDraw.Draw(S)
for i, (s, im, *_r) in enumerate(rend):
    w, h = im.size; crop = im.crop((0, int(h * 0.2), w, int(h * 0.74))).resize((fw, fh))
    x, y = pad + (i % cols) * (fw + pad), pad + (i // cols) * (fh + 22 + pad)
    S.paste(crop, (x, y)); d.text((x + 4, y + fh + 5), things[s["name"]]["label"], fill=(255, 255, 255))
S.save(out); print(out, S.size)
