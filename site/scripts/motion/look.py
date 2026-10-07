#!/usr/bin/env python3
"""The look pass (MOTION-2): one frame per scene, scored, with a contact sheet and a verdict under each frame.

  uv run --with playwright --with pillow python site/scripts/motion/look.py <film.json> [--out DIR] [--no-vision]

film.json = {scenes:[{name,dur,code}]} as written by film.py or look_set.py. For each scene it renders the middle
of the scene (and a second frame 0.6 s later) through the real player, then scores the first frame on plain checks:

  blank      almost nothing drawn
  clipped    a text box runs off the screen
  overlap    two different labels sit on top of each other
  flat       under 3 colours used
  still      nothing moves anywhere in the scene (frames at 20, 35, 50, 65, 80% of it and 0.6 s after mid-scene all alike)
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


# Overlap rule (MOTION-8). Boxes are the labels the scene drew, read from the player at each sampled time (never from pixels,
# never from the vision model). Two different labels overlap when their boxes cross by more than OV_PX in both directions
# and the crossing covers more than OV_SHARE of the smaller box. A scene fails "overlap" only when that holds at
# OV_NEED or more of the OV_AT sample times, so a label passing through another mid-move does not count, a collision that stays does.
OV_PX, OV_SHARE = 2, 0.25
OV_AT, OV_NEED = (0.2, 0.35, 0.5, 0.65, 0.8), 2

# Still rule (MOTION-10). A scene is still only when nothing changes anywhere in it: no two of the frames at mid-scene, 0.6 s later,
# and 20, 35, 50, 65 and 80% of the scene differ by STILL_MOVE (share of pixels that changed). A scene that moves, then holds for a
# beat, is a hold beat and passes. The old rule compared two frames 0.6 s apart at mid-scene and called 43 of 277 frames still;
# all 43 were hold beats, none a scene that never moves.
STILL_MOVE = 0.002


def overlaps(texts):
    """Pairs of different labels that overlap, as 'a / b' strings. Pure function of the text records: same input, same answer."""
    ov = []
    for i, a in enumerate(texts):
        for b in texts[i + 1:]:
            if a["s"] == b["s"]:  # the same label drawn twice is a shadow or an outline, not a collision
                continue
            if a["s"] in b["s"] or b["s"] in a["s"]:
                if abs(a["x0"] - b["x0"]) < 6 and abs(a["y0"] - b["y0"]) < 6:
                    continue
            ix = min(a["x1"], b["x1"]) - max(a["x0"], b["x0"]); iy = min(a["y1"], b["y1"]) - max(a["y0"], b["y0"])
            if ix > OV_PX and iy > OV_PX:
                small = min((a["x1"] - a["x0"]) * (a["y1"] - a["y0"]), (b["x1"] - b["x0"]) * (b["y1"] - b["y0"]))
                if small > 0 and ix * iy / small > OV_SHARE:
                    ov.append(f"{a['s'][:14]} / {b['s'][:14]}")
    return ov


def _shot(pg, T):
    # Clear, draw, read in ONE call: the player's own animation loop can redraw between separate calls and
    # add stale text to the list, which made the same frames score differently (MOTION-8).
    data, texts = pg.evaluate("""T => { window.__texts = []; window.__motion.renderAt(T);
        const d = document.getElementById('cv').toDataURL('image/png'); return [d, window.__texts.slice()]; }""", T)
    return Image.open(io.BytesIO(base64.b64decode(data.split(",", 1)[1]))).convert("RGB"), texts


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
            shots = [_shot(pg, s["start"] + s["dur"] * f) for f in OV_AT]  # the overlap and still checks sample five times
            seen = [overlaps(t) for _, t in shots]
            frames = [im1, im2] + [im for im, _ in shots]
            moved = max(changed(a, b) for i, a in enumerate(frames) for b in frames[i + 1:])
            out.append((s, im1, moved, texts, seen))
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


def plain_checks(s, im1, moved, texts, errors, seen=None):
    fails = {}
    if s["name"] in errors:
        fails["throws"] = "scene threw"
    if K.coverage(im1) < 0.02:
        fails["blank"] = f"coverage {K.coverage(im1):.3f}"
    cut = [t["s"] for t in texts if t["x0"] < -4 or t["x1"] > W + 4 or t["y0"] < -4 or t["y1"] > H + 4]
    if cut:
        fails["clipped"] = "; ".join(c[:24] for c in cut[:3])
    seen = seen if seen is not None else [overlaps(texts)]
    hits = [o for o in seen if o]
    ov = max(hits, key=len) if len(hits) >= min(OV_NEED, len(seen)) else []
    if ov:
        fails["overlap"] = "; ".join(ov[:2])
    if colours(im1) < 3:
        fails["flat"] = f"{colours(im1)} colours"
    if moved < STILL_MOVE:
        fails["still"] = "nothing moves in the whole scene"
    return fails


# The subject rule (MOTION-9). Written first, labelled against by hand on 60 frames, then the prompt was fitted to it.
# One question the judge answers about the picture alone (captions and titles do not count): does the frame show the thing the ask
# names, or the part of it this scene is about, so that a visitor with no caption would recognise it?
#   drawn      yes. A clear icon or simple drawing counts (a heart for how a heart pumps, a house for buying a home, a cup for a coffee
#              mood, a stick figure for a workout, a tank for a water tank). A chart, grid or timeline counts when the ask is about
#              numbers, status or a plan and it holds those numbers or days. A set of the named parts joined by clean lines counts.
#              An icon alone is enough for a scene that only names the thing (an opener, a verdict); it is not a drawing of a step.
#   stand-in   a picture that tries to be a thing (animal, object, place) and is not recognisable: an oval or blob meant as a chicken or robot,
#              a flat polygon for a continent, or a picture that belongs to another ask.
#   none       no attempt at a picture: steps in boxes, a row of day boxes, a bare bar, a ring, a timer, a slider, bare circles or arcs
#              with a date or place name, empty slots, a list. Right topic, nothing drawn of it. A chart counts as drawn only when the ask is itself about numbers, status or a plan.
# Mapping: drawn -> pass on subject, stand-in -> look:offsubject, none -> look:plain. Other faults (small, cramped, clipped, empty, muddy)
# still come from the 1 to 5 score, and only when the score is under 3.
SUBJECT_FAIL = {"stand-in": "offsubject", "none": "plain"}

VISION = """You are the art director for short phone explainer films. This is ONE frame from the middle of a scene.
The film is for this ask: "{ask}". The scene is called "{name}".

STEP 1, subject. Look at the picture only. Captions, titles and labels do not count as drawing. The ask can name several things
(a window, rain, a cup); a clear drawing of any one of them, or of the part this scene is about, is enough. Would a visitor with no
caption recognise the subject?
- "drawn": yes. A clear icon or simple drawing counts (a heart for how a heart pumps, a house for buying, a cup, a window with rain, a
  stick figure for a workout, a tank, a globe for the world, a lit sphere for sunlight on a planet, a phone, an engine cylinder). A bar chart, line chart,
  grid or timeline counts ONLY when the ask itself is about numbers, status, money or a plan (tax, rent vs buy, people counts, launch
  status), and then it counts even if it is plain. The named parts of a system joined by lines count. An icon alone is enough for a scene
  that only names the thing (an opener, a verdict).
- "stand-in": the frame tries to draw a thing (an animal, an object, a place, a continent) but a visitor would not recognise it: a plain
  oval or blob meant as a chicken or a robot, a flat polygon meant as a continent, or a picture that belongs to another ask.
- "none": no attempt at a picture of the subject. Steps or times in plain boxes, a row of day boxes, a single bare bar, a ring, a timer, a
  slider, bare circles or arcs with a date or a place name, empty slots, a list. A timeline of cooking times is "none" for a roast, because a
  roast is not about numbers.
Decide this first and do not let layout, size or taste change it.

STEP 2, craft, separately. Score the frame 1 to 5 as a designed explainer frame (5 = beautiful, 3 = fine, 1 = broken or empty) and name the
worst craft fault: small = subject tiny or lost in empty space; cramped = crowded or labels collide; clipped = cut off by the screen edge;
empty = almost nothing drawn; muddy = low contrast or ugly colour; ok = nothing wrong. (The bottom 150 px is kept clear for a caption.)

Answer with ONE line of JSON, nothing else:
{{"subject": "<drawn|stand-in|none>", "score": <1 to 5>, "issue": "<ok|small|cramped|clipped|empty|muddy>", "note": "<at most 12 words>"}}"""


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
                    return {"subject": str(j.get("subject", "drawn")), "score": int(j["score"]), "issue": str(j.get("issue", "ok")), "note": str(j.get("note", ""))[:90]}
        except Exception:
            continue
    return None


def look(film, use_vision=True, theme=None, ask=None, prior=None):
    """Verdict per scene: [{scene, frame, plain, vision, pass, fail}]."""
    ask = ask or film.get("ask", "")
    rendered, errors = render_scenes(film, theme or film.get("theme"))
    rows = []
    for s, im1, im2, texts, seen in rendered:
        rows.append({"scene": s["name"], "frame": im1, "plain": plain_checks(s, im1, im2, texts, errors, seen)})
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
        if v and v.get("subject") in SUBJECT_FAIL:
            fail.append("look:" + SUBJECT_FAIL[v["subject"]])
        elif v and v["score"] < 3 and v["issue"] not in ("plain", "offsubject"):
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
