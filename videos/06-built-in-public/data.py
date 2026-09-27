"""Fill the comp from the site's real JSON. Reads site/content/*.json (read only), writes
assets/data.js and copies the screenshots it needs into assets/img/ (resized).
Run from anywhere: python3 videos/06-built-in-public/data.py"""
import json
import re
from datetime import datetime, timedelta, timezone
from pathlib import Path

from PIL import Image

HERE = Path(__file__).resolve().parent
SITE = HERE.parent.parent / "site"
C = SITE / "content"
PUB = SITE / "public"
OUT = HERE / "assets"
IMG = OUT / "img"
IMG.mkdir(parents=True, exist_ok=True)

board = json.loads((C / "board.json").read_text())
builds = json.loads((C / "builds.json").read_text())
timeline = json.loads((C / "timeline.json").read_text())
progress = json.loads((C / "progress.json").read_text())
backlog = json.loads((C / "backlog.json").read_text())

ET = timezone(timedelta(hours=-4))  # September: EDT


def copy(src, h=None, name=None):
    """Copy /progress/x.webp into assets/img/, resized to height h."""
    p = PUB / src.lstrip("/")
    im = Image.open(p).convert("RGB")
    if h and im.height > h:
        im = im.resize((round(im.width * h / im.height), h), Image.LANCZOS)
    name = name or Path(src).stem + ".webp"
    im.save(IMG / name, "WEBP", quality=86)
    return f"assets/img/{name}", im.width, im.height


def clean(text):
    """Commit lines without feedback ids, dates in parentheses or yuigui shas."""
    text = re.sub(r"\s*\((feedback [^)]*|Chris, [^)]*)\)", "", text)
    text = re.sub(r"\s*Synced from yuigui \w+\.?", "", text)
    return text.strip().rstrip(".")


# ---------- board: real tiles, a subset of each column in board order ----------
cols = {c["key"]: c for c in board["columns"]}
pick = {
    "backlog": [("YUI-37", None), ("YUI-40", None), ("YUI-46", None), ("YUI-47", None), ("OSS-8", None)],
    "next": [("YUI-29", None), ("YUI-116", "Step 4"), ("YUI-116", "Step 5")],
    "building": [("INT-8", None), ("YUI-37", "Step 2"), ("YUI-116", "Step 3"), ("YUI-119", "Step 1")],
    "shipped": [("YUI-63", "Step 2"), ("YUI-107", None), ("YUI-14", None), ("YUI-104", None)],
}
tiles = {}
for col, keys in pick.items():
    out = []
    for key, step in keys:
        c = next(c for c in cols[col]["cards"] if c["key"] == key and c.get("step") == step)
        out.append({k: c[k] for k in ("key", "step", "title", "summary", "shipped", "mvp", "waiting", "agentReady") if k in c})
    tiles[col] = {"title": cols[col]["title"], "count": len(cols[col]["cards"]), "cards": out}

# the example: a note from the feedback button (ship log entry, card "Feedback")
entry = next(e for e in progress if e["title"] == "What you were typing stays put")
quote = re.search(r'"([^"]+)"', entry["body"]).group(1)
shots = [copy(i["src"], 1311) for i in entry["images"]]

# ---------- builds ----------
def build(n):
    b = next(b for b in builds["builds"] if b["build"] == n)
    ch = []
    for c in b["changes"]:
        if c.get("card"):
            e = next((e for e in progress if e.get("card") == c["card"]), None)
            if e:
                if any(x.get("key") == c["card"] for x in ch):
                    continue
                ch.append({"text": e["title"], "key": c["card"]})
                continue
        ch.append({"text": clean(c["text"])})
    return {"build": n, "date": b["date"], "changes": ch}

b176, b160, b155 = build(176), build(160), build(155)

# ---------- timeline: totals and a strip of shipped screenshots, oldest first ----------
frames = [m for d in timeline["days"] for m in d["moments"] if m["kind"] == "ship" and m["images"]][::-1]
portrait = [(i, m) for i, m in enumerate(frames) if 0.43 <= (lambda s: s[0] / s[1])(Image.open(PUB / m["images"][0]["src"].lstrip("/")).size) <= 0.62]
step = len(portrait) / 30
chosen = [portrait[int(k * step)] for k in range(30)]
if chosen[-1][1] is not portrait[-1][1]:
    chosen[-1] = portrait[-1]
strip = []
for i, m in chosen:
    idx = frames.index(m)
    src, w, h = copy(m["images"][0]["src"], 640, name=f"strip{len(strip):02d}.webp")
    at = datetime.fromisoformat(m["at"].replace("Z", "+00:00")).astimezone(ET)
    strip.append({"src": src, "w": w, "h": h, "title": m["title"], "card": m.get("card"),
                  "day": at.strftime("%a, %b %-d"), "totals": m["totals"], "n": idx + 1})

# ---------- contribute: the agent-ready card ----------
oss8 = next(c for c in backlog["cards"] if c["key"] == "OSS-8")

first = min(builds["builds"], key=lambda b: b["build"])
data = {
    "facts": {
        "commits": timeline["totals"]["app"] + timeline["totals"]["site"],
        "builds": len(builds["builds"]),
        "shiplog": len(progress),
        "firstBuild": {"build": first["build"], "date": first["date"]},
        "newest": {"build": builds["builds"][0]["build"], "version": board["release"]["version"], "date": builds["builds"][0]["date"]},
        "timelineTotals": timeline["totals"],
    },
    "board": tiles,
    "note": {"title": entry["title"], "quote": quote, "date": entry["date"], "shots": [s[0] for s in shots]},
    "builds": [b176, b160, b155],
    "strip": strip,
    "frames": len(frames),
    "oss8": {k: oss8[k] for k in ("key", "title", "size", "goal", "done", "test", "status", "claim")},
}
(OUT / "data.js").write_text("window.DATA = " + json.dumps(data, indent=1, ensure_ascii=False) + ";\n")
print(json.dumps(data["facts"], indent=1))
print("quote:", quote)
print("strip:", len(strip), [s["day"] for s in strip][::5])
for b in data["builds"]:
    print(b["build"], [c["text"][:70] for c in b["changes"]])
