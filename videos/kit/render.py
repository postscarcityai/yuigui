"""Render a comp page. Every frame is window.render(t); the page sets DURATION and POSTER.

  python3 kit/render.py <folder>/comp.html stills 1.0 5.5 12.2   stills into <folder>/work/stills[-reel]/
  python3 kit/render.py <folder>/comp.html poster                  <folder>/work/poster[-reel].png, no finger
  python3 kit/render.py <folder>/comp.html video                   <folder>/work/silent[-reel].mp4
  add --reel for the 1080x1920 layout (the same page with ?reel).
  add --q key=val (repeatable) to pass more to the page (13-brand's chapter shorts: --q chapter=ink);
  the outputs get the values in their names so they don't overwrite the full cut.
  YUI_GL=1 in the environment is for comps that draw with WebGL shaders: Chromium gets the Mac's GPU
  (ANGLE on Metal; YUI_GL=swiftshader for software) and video frames come straight off the compositor
  as high-quality JPEG, about 25 times faster than software GL and PNG. Other comps are unchanged.

Landscape bakes the poster in as frame 0, so every thumbnail shows it. Reels loop, so the reel does not.
"""
import base64
import os
import subprocess
import sys
from pathlib import Path

from playwright.sync_api import sync_playwright

FPS = 30
args = sys.argv[1:]
REEL = "--reel" in args
if REEL:
    args.remove("--reel")
Q = []
while "--q" in args:
    i = args.index("--q")
    Q.append(args[i + 1])
    del args[i:i + 2]
COMP = Path(args[0]).resolve()
MODE = args[1]
WORK = COMP.parent / "work"
WORK.mkdir(exist_ok=True)
SUF = ("-reel" if REEL else "") + "".join("-" + q.split("=", 1)[-1] for q in Q)
QUERY = "&".join((["reel"] if REEL else []) + Q)
GLMODE = os.environ.get("YUI_GL", "")
GL = [] if not GLMODE else ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"] if GLMODE == "swiftshader" else ["--use-angle=metal", "--enable-gpu", "--ignore-gpu-blocklist"]
W, H = (1080, 1920) if REEL else (1920, 1080)


def open_page(p):
    browser = p.chromium.launch(args=["--allow-file-access-from-files", "--font-render-hinting=none", "--disable-lcd-text"] + GL)
    page = browser.new_page(viewport={"width": W, "height": H}, device_scale_factor=1)
    page.goto(COMP.as_uri() + ("?" + QUERY if QUERY else ""))
    if not page.evaluate("window.ready"):
        print("warning: the rounded font did not load", file=sys.stderr)
    return browser, page


def shot(page, t, finger=True):
    page.evaluate(f"window.noFinger = {'false' if finger else 'true'}")
    page.evaluate(f"render({t})")
    if FAST and MODE == "video":
        return base64.b64decode(FAST.send("Page.captureScreenshot", {"format": "jpeg", "quality": 96, "optimizeForSpeed": True})["data"])
    return page.screenshot(type="png")


with sync_playwright() as p:
    browser, page = open_page(p)
    FAST = page.context.new_cdp_session(page) if GLMODE else None
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
