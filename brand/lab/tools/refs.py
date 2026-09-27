"""Render the clean mark to PNGs, the reference images the fal mockups start from.

  python3 brand/lab/tools/refs.py      writes brand/lab/out/ref-mark.png and ref-y.png
"""
import json
import subprocess
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[3]
OUT = ROOT / "brand/lab/out"
OUT.mkdir(parents=True, exist_ok=True)
js = """
import { markSvg } from "%s";
console.log(JSON.stringify({
  mark: markSvg({ rough: 0, round: 0.5, fill: "#1D1B20", bg: "#FFFFFF", pad: 60 }),
  y: markSvg({ rough: 0, round: 0.5, fill: "#1D1B20", bg: "#FFFFFF", pad: 40, only: ["earL", "earR", "stem"] }),
}));
""" % (ROOT / "site/lib/brand/mark.mjs").as_uri()
svgs = json.loads(subprocess.run(["node", "--input-type=module", "-e", js], capture_output=True, text=True, check=True).stdout)
with sync_playwright() as p:
    b = p.chromium.launch()
    for name, (w, h) in (("mark", (1600, 1040)), ("y", (1024, 1024))):
        pg = b.new_page(viewport={"width": w, "height": h})
        pg.set_content(f'<body style="margin:0">{svgs[name].replace("<svg", f"<svg width={w} height={h}")}</body>')
        pg.screenshot(path=str(OUT / f"ref-{name}.png"))
    b.close()
print("refs written")
