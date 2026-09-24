"""Capture the phone screen of every share link (SITE-19) for its preview image.

The preview (app/s/[id]/opengraph-image.js) puts the lines next to the real screen they draw.
This script opens each /s/<id> page, waits for the live phone to draw, and saves the screen as
public/og/screens/<id>.jpg. A link with no capture falls back to a simpler drawn screen.

Run after adding See it entries or samples, against a local production server:
  cd site && npm run build && npx next start -p 3019
  uv run --with playwright python scripts/capture-og.py --base http://localhost:3019 [--only id,id] [--missing]
Then build again, so the previews pick the captures up.
"""
import argparse, re, urllib.request
from pathlib import Path

from playwright.sync_api import sync_playwright

OUT = Path(__file__).resolve().parent.parent / "public" / "og" / "screens"


def ids(base):
    xml = urllib.request.urlopen(f"{base}/sitemap.xml").read().decode()
    return [m for m in re.findall(r"/s/([A-Za-z0-9_-]+)</loc>", xml)]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--base", default="http://localhost:3019")
    ap.add_argument("--only", default="")
    ap.add_argument("--missing", action="store_true", help="skip ids that already have a capture")
    a = ap.parse_args()
    todo = a.only.split(",") if a.only else ids(a.base)
    if a.missing:
        todo = [i for i in todo if not (OUT / f"{i}.jpg").exists()]
    OUT.mkdir(parents=True, exist_ok=True)
    with sync_playwright() as p:
        b = p.chromium.launch()
        pg = b.new_page(viewport={"width": 1100, "height": 900}, device_scale_factor=1.5)
        for i in todo:
            pg.goto(f"{a.base}/s/{i}", wait_until="networkidle")
            el = pg.locator(".share-screen .screen").first
            if not el.count():
                print("skip (no screen)", i)
                continue
            pg.wait_for_timeout(700)  # charts and katex settle
            el.screenshot(path=str(OUT / f"{i}.jpg"), type="jpeg", quality=72)
            print("ok", i)
        b.close()


if __name__ == "__main__":
    main()
