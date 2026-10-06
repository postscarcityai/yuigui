#!/usr/bin/env python3
"""Headless check of a motion film (MOTION-1): render it frame by frame, fail on errors and blank stretches,
write a contact sheet and a report.

  uv run --with playwright --with pillow python site/scripts/motion/check.py <film.json> [--out DIR] [--dt 0.5]
      [--theme light|dark|<json palette>] [--shots N] [--scale 1]

film.json = {scenes:[{name,dur,code}], ...} as written by film.py. Writes DIR/<name>-sheet.png and
DIR/<name>-report.json. Exit 1 when a scene throws, does not parse, or a stretch of >= 1.2 s draws (almost)
nothing. Uses the same player.html and kit.js the site and the app load."""
import base64, io, json, os, sys, threading, http.server, socketserver, functools
from PIL import Image
from playwright.sync_api import sync_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
MOTION = os.path.join(HERE, "..", "..", "public", "demo", "motion")
LIGHT = {"ink": "#fbf7ef", "panel": "#ffffff", "fg": "#241f2e", "dim": "#7d7690", "line": "#ddd5ca", "accent": "#ff5a3c", "a2": "#1d8fb3", "a3": "#6a56d6", "good": "#23996a", "bad": "#d33a52", "warn": "#d99a14"}


class _Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass


def serve():
    srv = socketserver.TCPServer(("127.0.0.1", 0), functools.partial(_Quiet, directory=os.path.abspath(MOTION)))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    return srv, srv.server_address[1]


def frames(film, dt=0.5, theme=None, w=390, h=844, scale=1, shots=None):
    """Return (list of (T, PIL.Image), report)."""
    srv, port = serve()
    out, errs, console = [], [], []
    with sync_playwright() as p:
        b = p.chromium.launch(args=["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"])
        ctx = b.new_context(viewport={"width": w, "height": h}, device_scale_factor=scale)
        pg = ctx.new_page()
        pg.on("console", lambda m: console.append(m.text) if m.type == "error" else None)
        pg.on("pageerror", lambda e: errs.append(str(e)))
        pg.goto(f"http://127.0.0.1:{port}/player.html")
        pg.wait_for_function("window.__motion")
        if theme:
            pg.evaluate("t => window.__motion.theme(t)", theme)
        if any("api.three(" in s["code"] for s in film["scenes"]):  # the host's job: answer need-three
            pg.evaluate("src => window.__motion.loadThree(src)", open(os.path.join(MOTION, "three.min.js")).read())
        for s in film["scenes"]:
            pg.evaluate("s => window.__motion.add(s)", {"name": s["name"], "dur": s["dur"], "code": s["code"]})
        pg.evaluate("window.__motion.end()")
        total = pg.evaluate("window.__motion.total()")
        Ts = []
        t = 0.0
        while t < total:
            Ts.append(round(t, 3)); t += dt
        Ts.append(round(total - 0.01, 3))
        for T in Ts:
            data = pg.evaluate("T => { window.__motion.renderAt(T); return document.getElementById('cv').toDataURL('image/png'); }", T)
            out.append((T, Image.open(io.BytesIO(base64.b64decode(data.split(",", 1)[1]))).convert("RGB")))
        errors = pg.evaluate("window.__motion.errors()")
        cues = pg.evaluate("window.__motion.cues()")
        scenes = pg.evaluate("window.__motion.scenes()")
        ctx.close(); b.close()
    srv.shutdown()
    return out, {"errors": errors, "page_errors": errs, "console_errors": console[:5], "cues": cues, "scenes": scenes, "total": total}


def coverage(img, bg=None):
    """Fraction of pixels that differ visibly from the background (the corner pixel), sampled."""
    bg = img.getpixel((1, 1))
    px = list(img.resize((97, 211)).get_flattened_data()) if hasattr(img, "get_flattened_data") else list(img.resize((97, 211)).getdata())
    n = sum(1 for p in px if abs(p[0] - bg[0]) + abs(p[1] - bg[1]) + abs(p[2] - bg[2]) > 36)
    return n / len(px)


def sheet(imgs, cols=8, th=250, label=True):
    from PIL import ImageDraw
    tw = int(th * imgs[0][1].width / imgs[0][1].height)
    rows = (len(imgs) + cols - 1) // cols
    S = Image.new("RGB", (cols * (tw + 6) + 6, rows * (th + 6) + 6), (20, 18, 28))
    d = ImageDraw.Draw(S)
    for i, (T, im) in enumerate(imgs):
        x, y = 6 + (i % cols) * (tw + 6), 6 + (i // cols) * (th + 6)
        S.paste(im.resize((tw, th)), (x, y))
        if label:
            d.rectangle([x, y, x + 44, y + 14], fill=(0, 0, 0)); d.text((x + 3, y + 1), f"{T:.1f}s", fill=(255, 255, 255))
    return S


DARK = {"ink": "#0b0813", "panel": "#18132b", "fg": "#f6eef7", "dim": "#a095b8", "line": "#3d3460", "accent": "#ff6b4a", "a2": "#5fd3e0", "a3": "#8a7dff", "good": "#5fe0a0", "bad": "#ff5d73", "warn": "#ffc857"}


def check(film, out, name, dt=0.5, theme=None, scale=1, cols=8):
    theme = theme or film.get("theme")
    imgs, rep = frames(film, dt, theme, scale=scale)
    cov = [(T, coverage(im)) for T, im in imgs]
    blank, run = [], []
    for T, cv in cov:
        if T < 0.55:
            continue
        if cv < 0.006:
            run.append(T)
        else:
            if run and run[-1] - run[0] + dt >= 1.2: blank.append((run[0], run[-1]))
            run = []
    if run and run[-1] - run[0] + dt >= 1.2: blank.append((run[0], run[-1]))
    rep.update({"name": name, "frames": len(imgs), "min_coverage": round(min(c for _, c in cov), 4), "mean_coverage": round(sum(c for _, c in cov) / len(cov), 4), "blank_stretches": blank,
                "ok": not rep["errors"] and not rep["page_errors"] and not blank})
    os.makedirs(out, exist_ok=True)
    # contact sheet: at most 48 frames
    step = max(1, len(imgs) // 48)
    sheet([imgs[i] for i in range(0, len(imgs), step)], cols=cols).save(os.path.join(out, f"{name}-sheet.png"))
    json.dump(rep, open(os.path.join(out, f"{name}-report.json"), "w"), indent=1)
    return rep, imgs


if __name__ == "__main__":
    a = sys.argv[1:]
    film = json.load(open(a[0]))
    out = a[a.index("--out") + 1] if "--out" in a else "."
    dt = float(a[a.index("--dt") + 1]) if "--dt" in a else 0.5
    th = a[a.index("--theme") + 1] if "--theme" in a else None
    theme = LIGHT if th == "light" else json.loads(th) if th and th.startswith("{") else None
    scale = int(a[a.index("--scale") + 1]) if "--scale" in a else 1
    name = os.path.splitext(os.path.basename(a[0]))[0] + ("-light" if th == "light" else "")
    rep, _ = check(film, out, name, dt, theme, scale)
    print(json.dumps({k: v for k, v in rep.items() if k not in ("cues", "scenes")}))
    sys.exit(0 if rep["ok"] else 1)
