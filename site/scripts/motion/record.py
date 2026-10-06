#!/usr/bin/env python3
"""Record a motion demo as a phone-sized mp4 and report time to first frame (spec/MOTION.md).

  python3 site/scripts/motion/record.py <slug> <seconds> <out-dir> [--light] [--base http://localhost:3127]

Opens /playground?demo=<slug>, records the page, crops to the .pg-phone box, writes <slug>[-light].mp4
and a poster png of the last second, and prints first_frame_ms (page load to first drawn frame)."""
import os, re, subprocess, sys, tempfile, time
from playwright.sync_api import sync_playwright

slug, secs, out = sys.argv[1], float(sys.argv[2]), sys.argv[3]
light = "--light" in sys.argv
base = sys.argv[sys.argv.index("--base") + 1] if "--base" in sys.argv else "https://www.yuigui.com"
name = re.sub(r"[^A-Za-z0-9_-]+", "-", slug) + ("-light" if light else "")
os.makedirs(out, exist_ok=True)
tmp = tempfile.mkdtemp()
with sync_playwright() as p:
    b = p.chromium.launch()
    tc = time.time()
    ctx = b.new_context(viewport={"width": 1280, "height": 1200}, device_scale_factor=2, record_video_dir=tmp, record_video_size={"width": 1280, "height": 1200})
    pg = ctx.new_page()
    pg.goto(f"{base}/playground?demo={slug}" + ("&theme=light" if light else ""), wait_until="networkidle")
    # pin the phone to the corner so the crop is exact, then replay so the clip starts at t=0
    pg.add_style_tag(content=".pg-phone{position:fixed!important;left:0;top:0;margin:0!important;z-index:2147483647} header.nav,.topbar{display:none!important} body{background:#0e0a18!important}")
    pg.wait_for_timeout(600)
    box = pg.locator(".pg-phone").bounding_box()
    pg.locator("[aria-label=Replay]").first.click()
    ts = time.time() - tc
    pg.wait_for_timeout(int(secs * 1000))
    ff = pg.evaluate("window.__moFirst || null")
    pg.locator(".pg-phone").screenshot(path=os.path.join(out, f"{name}-last.png"))
    video = pg.video.path()
    ctx.close(); b.close()
x, y, w, h = [int(v) for v in (box["x"], box["y"], box["width"], box["height"])]
w -= w % 2; h -= h % 2
# the video is 1280x1200 CSS px; the page's own coordinates are the same scale
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-ss", f"{ts:.2f}", "-i", video, "-vf", f"crop={w}:{h}:{x}:{y}", "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "20", os.path.join(out, f"{name}.mp4")], check=True)
print({"slug": slug, "first_frame_ms": round(ff) if ff else None, "size": [w, h]})
