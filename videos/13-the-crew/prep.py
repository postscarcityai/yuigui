"""Clean plates for 13-the-crew: real screenshots with the parts that animate in taken out.

Each plate is a screenshot from site/public/progress with a region filled row by row from a pixel
at its left edge (the backgrounds are vertical gradients, so a row keeps its color). The comp puts
the plate under patches of the original screenshot and brings the patches in one by one.
Writes work/img/*.png (not tracked). Coordinates are in the phone's 393 x 852 points.
    python3 videos/13-the-crew/prep.py
"""
from pathlib import Path

from PIL import Image

HERE = Path(__file__).resolve().parent
SRC = HERE.parents[1] / "site" / "public" / "progress"
OUT = HERE / "work" / "img"
OUT.mkdir(parents=True, exist_ok=True)

# name: (screenshot, [(x0, y0, x1, y1, sample x)], ring) ; ring = (cx, cy, r0, r1, y max, sample x)
PLATES = {
    "answer-eggs": ("yui166-answer-light", [(160, 108, 392, 138, 150), (8, 312, 390, 590, 4)], None),
    "answer-lunch": ("yui103-answer-light", [(0, 458, 393, 740, 3)], None),
    "breakdown": ("yui103-breakdown-light", [(66, 116, 372, 318, 64)], (214, 597, 58, 110, 702, 64)),
    "hello": ("yui167-hello-light", [(8, 300, 392, 588, 4)], None),
    "home": ("yui168-app-arnold-home-light", [(4, 396, 390, 556, 2), (4, 684, 390, 752, 2)], None),
    "handoff": ("yui144-1-yui-hands-off-light", [(0, 428, 393, 726, 2)], None),
    "basil": ("yui144-2-basil-answers-light", [(0, 376, 393, 740, 3)], None),
}

for name, (shot, rects, ring) in PLATES.items():
    im = Image.open(SRC / f"{shot}.webp").convert("RGB")
    k = im.width / 393
    px = im.load()
    for x0, y0, x1, y1, sx in rects:
        for y in range(int(y0 * k), int(y1 * k)):
            c = px[int(sx * k), y]
            for x in range(int(x0 * k), min(im.width, int(x1 * k))):
                px[x, y] = c
    if ring:
        cx, cy, r0, r1, ymax, sx = ring
        for y in range(int((cy - r1) * k), int(min(cy + r1, ymax) * k)):
            c = px[int(sx * k), y]
            for x in range(int((cx - r1) * k), int((cx + r1) * k)):
                d = ((x / k - cx) ** 2 + (y / k - cy) ** 2) ** 0.5
                if r0 <= d <= r1:
                    px[x, y] = c
    im.save(OUT / f"{name}.png")
    print("wrote", OUT / f"{name}.png")
