"""Built in public: the score. 92 BPM with swing, 23 bars (60 s), Yui's sound bank (kit/sound.py).

The taps and cuts come from the comp itself (window.SCORE in comp.html), so picture and sound
share one clock. Writes work/music.wav.
    python3 videos/06-built-in-public/music.py
"""
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent / "kit"))
from sound import Song, accent, bell, groove, dub, drop  # noqa: E402

from playwright.sync_api import sync_playwright  # noqa: E402

with sync_playwright() as p:
    br = p.chromium.launch(args=["--allow-file-access-from-files"])
    pg = br.new_page(viewport={"width": 1920, "height": 1080})
    pg.goto((HERE / "comp.html").as_uri())
    pg.evaluate("window.ready")
    S = pg.evaluate("window.SCORE")
    br.close()

song = Song(bpm=92, bars=23, swing=45)
b = lambda n: n * song.bar  # noqa: E731

# I vi IV V, bright and open. The motif sits over bars 6 to 13 (Fmaj7, G, C, Am7 in each 4-bar turn).
PROG = ["C", "Am7", "Fmaj7", "G"]
MOTIF = {
    0: [(0, 2, 81), (2, 2, 79), (4, 4, 77), (10, 2, 76), (12, 4, 72)],
    1: [(0, 3, 74), (4, 2, 79), (6, 2, 74), (8, 6, 71)],
    2: [(0, 2, 76), (2, 2, 79), (4, 4, 84), (10, 2, 79), (12, 4, 76)],
    3: [(0, 3, 76), (4, 2, 72), (6, 8, 69)],
}
# energy: the hook 2, the board 3, building and shipping 4, the timeline 3, contribute 2
dub(song, [(0, 2, 2), (2, 6, 3), (6, 14, 4), (14, 18, 3), (18, 20, 2)], PROG, MOTIF)
# the outro resolves: F, G, then home on C
dub(song, [(20, 23, 1)], ["Fmaj7", "G", "C", "C"])
song.strum(b(22), "C", 2.2, 0.6)
song.add("lead", bell(84, 2.4, 0.6), b(22), 0.5, pan=0.1)

# the big cuts: the note, building, the build, the timeline, the outro
for t in (b(2), b(6), b(10), b(14), b(20)):
    accent(song, t, "crash")
accent(song, b(6), "swell")
accent(song, b(10), "swell")

# the only sound effects: the taps you see (Send in the feedback sheet, the composer, the close button)
song.taps([S["send"], S["tapField"], S["close"]])

song.write(HERE / "work" / "music.wav")
print("taps at", [round(S[k], 3) for k in ("send", "tapField", "close")])
