#!/usr/bin/env python3
"""The look pass (MOTION-2): one frame per scene, scored, with a contact sheet and a verdict under each frame.

  uv run --with playwright --with pillow python site/scripts/motion/look.py <film.json> [--out DIR] [--no-vision]

film.json = {scenes:[{name,dur,code}]} as written by film.py or look_set.py. For each scene it renders the middle
of the scene (and a second frame 0.6 s later) through the real player, then scores the first frame on plain checks:

  blank      almost nothing drawn
  clipped    a text box runs off the screen
  overlap    two different labels sit on top of each other
  flat       under 3 colours used
  still      nothing moved between the two frames
  throws     the scene threw (the player cut it short)

plus one vision-model look (claude, the `claude` CLI) that scores the frame 1 to 5 as a designed explainer frame and
names its worst problem. A frame passes when no plain check fails and the vision score is 3 or more.
Text boxes come from wrapping fillText in the page, so they are the real drawn labels, in screen pixels."""
import base64, io, json, os, subprocess, sys, concurrent.futures as cf
from PIL import Image, ImageDraw

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import check as K

W, H = 390, 844
WRAP = """() => {
  window.__texts = [];
  const P = CanvasRenderingContext2D.prototype;
  if (!P.__wrapped) {
    P.__wrapped = true;
    const orig = P.fillText;
    P.fillText = function (s, x, y, mw) {
      try {
        const a = this.globalAlpha;
        if (this.canvas && this.canvas.id === 'cv' && a > 0.15 && String(s).trim()) {  // not the player's scratch canvases (cue probes)
          const m = this.measureText(String(s)), fs = parseFloat((this.font.match(/([\\d.]+)px/) || [0, 14])[1]);
          let w = m.width; if (mw && mw < w) w = mw;
          const al = this.textAlign, x0 = al === 'center' ? x - w / 2 : (al === 'right' || al === 'end') ? x - w : x;
          const bl = this.textBaseline, y0 = bl === 'middle' ? y - fs / 2 : (bl === 'alphabetic' || bl === 'ideographic') ? y - fs * 0.8 : bl === 'bottom' ? y - fs : y;
          const M = this.getTransform(), pts = [[x0, y0], [x0 + w, y0], [x0, y0 + fs], [x0 + w, y0 + fs]].map(p => [M.a * p[0] + M.c * p[1] + M.e, M.b * p[0] + M.d * p[1] + M.f]);
          const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]), d = (window.devicePixelRatio || 1);
          window.__texts.push({ s: String(s), x0: Math.min(...xs) / d, x1: Math.max(...xs) / d, y0: Math.min(...ys) / d, y1: Math.max(...ys) / d, fs });
        }
      } catch (e) {}
      return orig.apply(this, arguments);
    };
  }
}"""


def _shot(pg, T):
    pg.evaluate("() => { window.__texts = []; }")
    data = pg.evaluate("T => { window.__motion.renderAt(T); return document.getElementById('cv').toDataURL('image/png'); }", T)
    return Image.open(io.BytesIO(base64.b64decode(data.split(",", 1)[1]))).convert("RGB"), pg.evaluate("() => window.__texts")


def render_scenes(film, theme=None):
    """[(scene, mid frame, later frame, texts)], errors. One browser, one player."""
    from playwright.sync_api import sync_playwright
    srv, port = K.serve()
    out = []
    with sync_playwright() as p:
        b = p.chromium.launch(args=["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"])
        ctx = b.new_context(viewport={"width": W, "height": H}, device_scale_factor=1)
        pg = ctx.new_page()
        pg.goto(f"http://127.0.0.1:{port}/player.html")
        pg.wait_for_function("window.__motion")
        if theme:
            pg.evaluate("t => window.__motion.theme(t)", theme)
        if any("api.three(" in s["code"] for s in film["scenes"]):
            pg.evaluate("src => window.__motion.loadThree(src)", open(os.path.join(K.MOTION, "three.min.js")).read())
        pg.evaluate(WRAP)
        for s in film["scenes"]:
            pg.evaluate("s => window.__motion.add(s)", {"name": s["name"], "dur": s["dur"], "code": s["code"]})
        pg.evaluate("window.__motion.end()")
        sc = pg.evaluate("window.__motion.scenes()")
        for s in sc:
            mid = s["start"] + s["dur"] * 0.5
            late = min(mid + 0.6, s["start"] + s["dur"] - 0.05)
            im1, texts = _shot(pg, mid)
            im2, _ = _shot(pg, late)
            out.append((s, im1, im2, texts))
        errors = pg.evaluate("window.__motion.errors()")
        ctx.close(); b.close()
    srv.shutdown()
    return out, errors


def colours(im):
    """How many colours take a real share of the frame (16 levels a channel, 0.3% or more)."""
    px = list(im.resize((195, 422)).getdata())
    n = {}
    for r, g, b in px:
        k = (r >> 4, g >> 4, b >> 4); n[k] = n.get(k, 0) + 1
    return sum(1 for v in n.values() if v / len(px) >= 0.003)


def changed(a, b):
    pa, pb = list(a.resize((97, 211)).getdata()), list(b.resize((97, 211)).getdata())
    n = sum(1 for x, y in zip(pa, pb) if abs(x[0] - y[0]) + abs(x[1] - y[1]) + abs(x[2] - y[2]) > 24)
    return n / len(pa)


def plain_checks(s, im1, im2, texts, errors):
    fails = {}
    if s["name"] in errors:
        fails["throws"] = "scene threw"
    if K.coverage(im1) < 0.02:
        fails["blank"] = f"coverage {K.coverage(im1):.3f}"
    cut = [t["s"] for t in texts if t["x0"] < -4 or t["x1"] > W + 4 or t["y0"] < -4 or t["y1"] > H + 4]
    if cut:
        fails["clipped"] = "; ".join(c[:24] for c in cut[:3])
    ov = []
    for i, a in enumerate(texts):
        for b in texts[i + 1:]:
            if a["s"] == b["s"]:  # the same label drawn twice is a shadow or an outline, not a collision
                continue
            if a["s"] in b["s"] or b["s"] in a["s"]:
                if abs(a["x0"] - b["x0"]) < 6 and abs(a["y0"] - b["y0"]) < 6:
                    continue
            ix = min(a["x1"], b["x1"]) - max(a["x0"], b["x0"]); iy = min(a["y1"], b["y1"]) - max(a["y0"], b["y0"])
            if ix > 2 and iy > 2:
                small = min((a["x1"] - a["x0"]) * (a["y1"] - a["y0"]), (b["x1"] - b["x0"]) * (b["y1"] - b["y0"]))
                if small > 0 and ix * iy / small > 0.25:
                    ov.append(f"{a['s'][:14]} / {b['s'][:14]}")
    if ov:
        fails["overlap"] = "; ".join(ov[:2])
    if colours(im1) < 3:
        fails["flat"] = f"{colours(im1)} colours"
    if changed(im1, im2) < 0.002:
        fails["still"] = "no change in 0.6 s"
    return fails


VISION = """You are the art director for short phone explainer films. This is ONE frame from the middle of a scene.
The film is for this ask: "{ask}". The scene is called "{name}".
Judge it as a frame of a professionally designed explainer: does it draw the real subject, is it large and clear, is it
composed with room to breathe, are the labels readable and not colliding, does it look designed and not like a slide
or a pile of boxes? (The bottom 150 px is kept clear for a caption, so empty there is fine.)
Answer with ONE line of JSON, nothing else:
{{"score": <1 to 5, 5 = beautiful, 3 = fine, 1 = broken or empty>, "issue": "<ok|plain|small|cramped|clipped|empty|offsubject|muddy>", "note": "<at most 12 words naming what is wrong or right>"}}
issue: plain = boxes and text, no drawn subject; small = subject tiny or lost in empty space; cramped = crowded or labels collide;
clipped = things cut off by the screen edge; empty = almost nothing drawn; offsubject = does not show the ask; muddy = low contrast or ugly colour; ok = nothing wrong."""


def vision(im, ask, name, model="claude-sonnet-5-5"):
    buf = io.BytesIO(); im.save(buf, "PNG")
    msg = {"type": "user", "message": {"role": "user", "content": [
        {"type": "image", "source": {"type": "base64", "media_type": "image/png", "data": base64.b64encode(buf.getvalue()).decode()}},
        {"type": "text", "text": VISION.format(ask=ask, name=name)}]}}
    env = dict(os.environ, USER=os.environ.get("USER") or "yui", MAX_THINKING_TOKENS="0")
    for _ in range(2):
        try:
            r = subprocess.run(["claude", "-p", "--model", model, "--tools", "", "--no-session-persistence", "--input-format", "stream-json",
                                "--output-format", "stream-json", "--verbose", "--strict-mcp-config", "--mcp-config", '{"mcpServers":{}}'],
                               input=json.dumps(msg) + "\n", capture_output=True, text=True, env=env, timeout=120)
            for ln in r.stdout.splitlines():
                ev = json.loads(ln)
                if ev.get("type") == "result":
                    txt = ev.get("result", "")
                    j = json.loads(txt[txt.index("{"):txt.rindex("}") + 1])
                    return {"score": int(j["score"]), "issue": str(j.get("issue", "ok")), "note": str(j.get("note", ""))[:90]}
        except Exception:
            continue
    return None


def look(film, use_vision=True, theme=None, ask=None, prior=None):
    """Verdict per scene: [{scene, frame, plain, vision, pass, fail}]."""
    ask = ask or film.get("ask", "")
    rendered, errors = render_scenes(film, theme or film.get("theme"))
    rows = []
    for s, im1, im2, texts in rendered:
        rows.append({"scene": s["name"], "frame": im1, "plain": plain_checks(s, im1, im2, texts, errors)})
    if prior:  # re-judge the plain checks only, keep the vision looks already paid for
        for r, v in zip(rows, prior):
            r["vision"] = v
    elif use_vision:
        with cf.ThreadPoolExecutor(6) as ex:
            vs = list(ex.map(lambda r: vision(r["frame"], ask, r["scene"]), rows))
        for r, v in zip(rows, vs):
            r["vision"] = v
    for r in rows:
        v = r.get("vision")
        fail = list(r["plain"])
        if v and v["score"] < 3:
            fail.append("look:" + v["issue"])
        r["fail"] = fail
        r["pass"] = not fail
    return rows


def sheet(films, path, fw=130, cols=8):
    """films = [(title, rows)]. One block per film: a row of frames, the verdict under each."""
    fh = int(fw * H / W); lab = 46; pad = 4
    blocks = []
    for title, rows in films:
        n = max(1, len(rows)); nrows = (n + cols - 1) // cols
        im = Image.new("RGB", (cols * (fw + pad) + pad, 16 + nrows * (fh + lab + pad)), (22, 20, 30))
        d = ImageDraw.Draw(im)
        ok = sum(r["pass"] for r in rows)
        d.text((pad, 3), f"{title}   {ok}/{len(rows)} pass", fill=(255, 255, 255))
        for i, r in enumerate(rows):
            x, y = pad + (i % cols) * (fw + pad), 16 + (i // cols) * (fh + lab + pad)
            im.paste(r["frame"].resize((fw, fh)), (x, y))
            col = (90, 220, 130) if r["pass"] else (255, 110, 110)
            d.rectangle([x, y + fh, x + fw - 1, y + fh + lab - 1], fill=(10, 9, 16), outline=col)
            v = r.get("vision")
            line = ("PASS " if r["pass"] else "FAIL ") + (f"v{v['score']}" if v else "")
            d.text((x + 3, y + fh + 2), line, fill=col)
            d.text((x + 3, y + fh + 14), ",".join(r["fail"])[:22] if r["fail"] else (v["issue"] if v else ""), fill=(220, 220, 230))
            d.text((x + 3, y + fh + 26), (v["note"] if v else "")[:24], fill=(150, 146, 170))
        blocks.append(im)
    S = Image.new("RGB", (max(b.width for b in blocks), sum(b.height for b in blocks)), (22, 20, 30))
    y = 0
    for b in blocks:
        S.paste(b, (0, y)); y += b.height
    S.save(path)


if __name__ == "__main__":
    a = sys.argv[1:]
    film = json.load(open(a[0]))
    out = a[a.index("--out") + 1] if "--out" in a else "."
    os.makedirs(out, exist_ok=True)
    rows = look(film, "--no-vision" not in a)
    name = os.path.splitext(os.path.basename(a[0]))[0]
    sheet([(name, rows)], os.path.join(out, name + "-look.png"), fw=180, cols=6)
    for r in rows:
        print(r["scene"], "PASS" if r["pass"] else "FAIL", r["fail"], r.get("vision"))
    sys.exit(0 if all(r["pass"] for r in rows) else 1)
