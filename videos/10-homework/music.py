"""Music for 10-homework, "Homework rescue". 100 BPM, 14 bars (33.6 s), swing 30, in C: Am7 Fmaj7 C G.

The times come from score.js, the same file the picture reads: the mic tap, the picture, the
matches, the ripple of flips, the right answer, the Send and the cuts.
"""
import json
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent / "kit"))
from sound import Song, dub, drop, accent, bell, pluck  # noqa: E402

src = (HERE / "score.js").read_text()
S = json.loads(src[src.index("{"): src.rindex("}") + 1])

song = Song(bpm=S["bpm"], bars=S["bars"], swing=30)
PROG = ["Am7", "Fmaj7", "C", "G"] * 3 + ["G", "C"]  # home on C

MOTIF = {
    0: [(0, 2, 69), (2, 2, 72), (4, 4, 76), (10, 2, 74), (12, 4, 72)],
    1: [(0, 4, 77), (6, 2, 76), (8, 6, 72)],
    2: [(0, 2, 72), (2, 2, 74), (4, 4, 76), (10, 2, 79), (12, 4, 76)],
}

dub(song, [tuple(s) for s in S["sections"]], PROG, MOTIF)

# The mic tap drops into the ask.
drop(song, S["drop"], bars_before=1.5)

# The picture lands: a bell.
song.add("fx", bell(84, 1.4, 0.55), S["picture"], 0.45, pan=0.15)

# Each match, the board clear and the right answer: a bright two-note bell.
for t in S["matches"] + [S["cleared"], S["right"]]:
    song.add("fx", bell(84, 1.0, 0.55), t, 0.4, pan=0.1)
    song.add("fx", bell(88, 1.2, 0.55), t + 0.1, 0.4, pan=0.2)

# The ripple of flips: soft plucks, climbing.
for k, (t, _) in enumerate(S["flips"]):
    song.add("fx", pluck([72, 74, 76, 79, 81, 84, 86, 88][k % 8], 0.35, 0.5), t, 0.28, pan=-0.3 + 0.08 * k)

# Big cuts: a swell into each, a crash on it.
for t in S["cuts"]:
    accent(song, t, "swell")
    accent(song, t, "crash")

# One Send: a quick C arpeggio.
for k, m in enumerate([72, 76, 79, 84]):
    song.add("fx", bell(m, 1.2, 0.5), S["sent"] + 0.05 + k * song.step, 0.42, pan=-0.2 + 0.13 * k)

accent(song, S["outro"], "swell")
end = song.at(13)
song.strum(end, "Cmaj7", 2.0, 0.6)
song.add("fx", bell(84, 2.0, 0.5), end + 0.05, 0.5)

song.taps([t for t, _ in S["taps"]])
song.write(HERE / "work" / "music.wav", fade=2.0)
