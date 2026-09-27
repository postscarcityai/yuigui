"""Render a comp page. Every frame is window.render(t); the page sets DURATION and POSTER.

  python3 kit/render.py <folder>/comp.html stills 1.0 5.5 12.2   stills into <folder>/work/stills[-reel]/
  python3 kit/render.py <folder>/comp.html poster                  <folder>/work/poster[-reel].png, no finger
  python3 kit/render.py <folder>/comp.html video                   <folder>/work/silent[-reel].mp4
  add --reel for the 1080x1920 layout (the same page with ?reel).

Landscape bakes the poster in as frame 0, so every thumbnail shows it. Reels loop, so the reel does not.
"""
import subprocess
import sys
from pathlib import Path

from playwright.sync_api import sync_playwright

FPS = 30
args = sys.argv[1:]
REEL = "--reel" in args
if REEL:
    args.remove("--reel")
COMP = Path(args[0]).resolve()
MODE = args[1]
WORK = COMP.parent / "work"
WORK.mkdir(exist_ok=True)
SUF = "-reel" if REEL else ""
W, H = (1080, 1920) if REEL else (1920, 1080)


def open_page(p):
    browser = p.chromium.launch(args=["--allow-file-access-from-files", "--font-render-hinting=none", "--disable-lcd-text"])
    page = browser.new_page(viewport={"width": W, "height": H}, device_scale_factor=1)
    page.goto(COMP.as_uri() + ("?reel" if REEL else ""))
    if not page.evaluate("window.ready"):
        print("warning: the rounded font did not load", file=sys.stderr)
    return browser, page


def shot(page, t, finger=True):
    page.evaluate(f"window.noFinger = {'false' if finger else 'true'}")
    page.evaluate(f"render({t})")
    return page.screenshot(type="png")


with sync_playwright() as p:
    browser, page = open_page(p)
    poster_t = page.evaluate("window.POSTER || 0")
    if MODE == "stills":
        out = WORK / f"stills{SUF}"
        out.mkdir(exist_ok=True)
        for t in args[2:]:
            (out / f"t{float(t):05.2f}.png").write_bytes(shot(page, float(t)))
    elif MODE == "poster":
        (WORK / f"poster{SUF}.png").write_bytes(shot(page, poster_t, finger=False))
    elif MODE == "video":
        frames = int(round(page.evaluate("window.DURATION") * FPS))
        dest = WORK / f"silent{SUF}.mp4"
        ff = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "image2pipe", "-framerate", str(FPS), "-i", "-",
                               "-c:v", "libx264", "-preset", "slow", "-crf", "16", "-pix_fmt", "yuv420p", str(dest)], stdin=subprocess.PIPE)
        for i in range(frames):
            bake = i == 0 and not REEL
            ff.stdin.write(shot(page, poster_t if bake else i / FPS, finger=not bake))
            if i % 300 == 0:
                print(f"frame {i}/{frames}", flush=True)
        ff.stdin.close()
        ff.wait()
        print("wrote", dest)
    browser.close()
