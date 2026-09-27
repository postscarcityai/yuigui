"""Lessons: 96 BPM (a bar is 2.5 s), 24 bars, F major, calm and curious. Times follow comp.html."""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "kit"))
from sound import Song, groove, dub, drop, accent  # noqa: E402

s = Song(bpm=96, bars=24, swing=30)
PROG = ["Fmaj7", "Am7", "Bbmaj7", "C"]
A4, C5, D5, G4, F4 = 69, 72, 74, 67, 65
MOTIF = {
    0: [(0, 2, A4), (2, 2, C5), (4, 4, D5), (8, 4, C5), (12, 4, A4)],
    1: [(0, 6, C5), (6, 2, A4), (8, 8, G4)],
    2: [(0, 2, F4), (2, 2, G4), (4, 4, A4), (8, 4, D5), (12, 4, C5)],
    3: [(0, 8, G4), (8, 8, C5)],
}
dub(s, [(0, 2, 2), (2, 7, 3), (7, 10, 2), (10, 14, 4), (14, 16, 2), (16, 20, 4), (20, 22, 2), (22, 24, 1)], PROG, MOTIF)
for t in (5.0, 25.0, 40.0, 50.0):
    accent(s, t, "crash")
drop(s, 40.0)
accent(s, 50.0, "kick")
s.taps([9.85, 12.35, 14.85, 17.35, 20.0, 22.5, 24.85, 34.6])
s.write(Path(__file__).resolve().parent / "work" / "music.wav", levels={"bass": 0.6})
