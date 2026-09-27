"""Capture the composition. `python3 render.py stills 1.0 2.5 ...` writes stills;
`python3 render.py video` pipes every frame at 30fps into ffmpeg (silent video)."""
import subprocess
import sys
from pathlib import Path

from playwright.sync_api import sync_playwright

HERE = Path(__file__).resolve().parent
# --reel: the 1080x1920 Instagram cut. Reels loop, so frame 0 is not replaced by the poster there;
# the cover is uploaded on its own.
REEL = "--reel" in sys.argv
if REEL:
    sys.argv.remove("--reel")
COMP, W, H = ("comp-reel.html", 1080, 1920) if REEL else ("comp.html", 1920, 1080)
SUFFIX = "-reel" if REEL else ""
FPS = 30
# The poster: the settled scene 2 frame. It replaces frame 0, so every thumbnail shows it.
POSTER_T = 13.9


def open_page(p):
    browser = p.chromium.launch(args=["--allow-file-access-from-files", "--font-render-hinting=none", "--disable-lcd-text"])
    page = browser.new_page(viewport={"width": W, "height": H}, device_scale_factor=1)
    page.goto((HERE / COMP).as_uri())
    ok = page.evaluate("window.ready")
    if not ok:
        print("warning: the rounded font did not load", file=sys.stderr)
    return browser, page


def shot(page, t):
    page.evaluate(f"render({t})")
    return page.screenshot(type="png")


def stills(times):
    out = HERE / ("stills" + SUFFIX)
    out.mkdir(exist_ok=True)
    with sync_playwright() as p:
        browser, page = open_page(p)
        for t in times:
            (out / f"t{float(t):05.2f}.png").write_bytes(shot(page, float(t)))
        browser.close()


def video():
    dest = HERE / f"silent{SUFFIX}.mp4"
    with sync_playwright() as p:
        browser, page = open_page(p)
        duration = page.evaluate("window.DURATION")
        frames = int(round(duration * FPS))
        ff = subprocess.Popen(
            ["ffmpeg", "-v", "error", "-y", "-f", "image2pipe", "-framerate", str(FPS), "-i", "-",
             "-c:v", "libx264", "-preset", "slow", "-crf", "16", "-pix_fmt", "yuv420p", str(dest)],
            stdin=subprocess.PIPE,
        )
        for i in range(frames):
            bake = i == 0 and not REEL
            page.evaluate(f"window.noFinger = {'true' if bake else 'false'}")
            ff.stdin.write(shot(page, POSTER_T if bake else i / FPS))
            if i % 60 == 0:
                print(f"frame {i}/{frames}", flush=True)
        ff.stdin.close()
        ff.wait()
        browser.close()
    print("wrote", dest)


if __name__ == "__main__":
    if sys.argv[1] == "poster":
        with sync_playwright() as p:
            browser, page = open_page(p)
            page.evaluate("window.noFinger = true")
            (HERE / f"poster{SUFFIX}.png").write_bytes(shot(page, POSTER_T))
            browser.close()
    elif sys.argv[1] == "stills":
        stills(sys.argv[2:])
    else:
        video()
