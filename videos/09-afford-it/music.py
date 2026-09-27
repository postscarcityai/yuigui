"""Music for 09-afford-it, "Can I afford it?". 100 BPM, 14 bars (33.6 s), swing 30, in C.

The times come from score.js, the same file the picture reads. The drag's payment is computed
from the same formula and easing as comp.html: a pluck for every $10 it drops, climbing the
scale, and a bell chord the moment it slides under the budget.
"""
import json
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent / "kit"))
from sound import Song, dub, drop, accent, bell, pluck  # noqa: E402

src = (HERE / "score.js").read_text()
S = json.loads(src[src.index("{"): src.rindex("}") + 1])
LN, D = S["loan"], S["drag"]

song = Song(bpm=S["bpm"], bars=S["bars"], swing=30)
PROG = ["Am7", "Fmaj7"] + ["Cmaj7", "Am7", "Fmaj7", "G"] * 3  # the hook, then C on bars 2, 6 and 10
PROG[-1] = "Cmaj7"  # home

MOTIF = {
    0: [(0, 2, 72), (2, 2, 76), (4, 4, 79), (10, 2, 77), (12, 4, 76)],
    1: [(0, 4, 72), (6, 2, 74), (8, 6, 69)],
    2: [(0, 2, 69), (2, 2, 72), (4, 4, 77), (10, 2, 76), (12, 4, 74)],
    3: [(0, 6, 74), (8, 2, 76), (10, 2, 77), (12, 4, 79)],
}

dub(song, [(0, 1, 1), (1, 2, 2), (2, 6, 3), (6, 9, 4), (9, 12, 3), (12, 13, 2), (13, 14, 1)], PROG, MOTIF)

# The phone rises into the drop.
drop(song, S["drop"], bars_before=1.5)

# A bell on each part.
for t, m in zip(S["parts"], [84, 79, 81, 76]):
    song.add("fx", bell(m, 1.3, 0.55), t, 0.45, pan=0.15)

# The calc: a swell and a crash as it lands.
accent(song, S["parts"][1], "swell")
accent(song, S["parts"][1], "crash")

# The drag, exactly as the picture draws it.
r = LN["apr"] / 12
pay = lambda loan: loan * r / (1 - (1 + r) ** -LN["months"])  # noqa: E731
eio = lambda p: 4 * p ** 3 if p < 0.5 else 1 - (-2 * p + 2) ** 3 / 2  # noqa: E731
def down_at(t):
    p = min(1, max(0, (t - D["t0"]) / (D["t1"] - D["t0"])))
    return round((D["from"] + (D["to"] - D["from"]) * eio(p)) / D["snap"]) * D["snap"]

SCALE = [60, 62, 64, 67, 69, 72, 74, 76, 79, 81, 84, 86]
last = pay(LN["price"] - D["from"])
k, fit, t = 0, False, D["t0"]
while t <= D["t1"]:
    m = pay(LN["price"] - down_at(t))
    if last - m >= 10:
        song.add("fx", pluck(SCALE[min(k, len(SCALE) - 1)], 0.4, 0.5), t, 0.3, pan=-0.2 + 0.04 * k)
        k, last = k + 1, m
    if not fit and m <= LN["budget"]:
        fit = True
        for j, n in enumerate([72, 76, 79, 84]):
            song.add("fx", bell(n, 1.6, 0.55), t + j * 0.02, 0.35, pan=-0.15 + 0.1 * j)
    t += 1 / 120

# One Send: a quick C arpeggio.
for j, n in enumerate([72, 76, 79, 84]):
    song.add("fx", bell(n, 1.2, 0.5), S["sent"] + 0.05 + j * song.step, 0.42, pan=-0.2 + 0.13 * j)

accent(song, S["outro"], "swell")
accent(song, S["outro"], "crash")
end = song.at(13)
song.strum(end, "Cmaj7", 2.0, 0.6)
song.add("fx", bell(84, 2.0, 0.5), end + 0.05, 0.5)

song.taps([t for t, _ in S["taps"]])
song.write(HERE / "work" / "music.wav", fade=2.0)
