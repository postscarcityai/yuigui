"""Music for 13-brand/journey, the brand lab film. 122 BPM, 30 bars (59 s), house with grime in it.

The picture's clock is journey/score.js; the land times and the wink come from the comp (window.SCORE).
Em9 Cmaj7 Am9 B7, one chord a bar. The groove follows the story: paper and the clean cut are quiet,
the kick drops on the ink, grime stabs and rolls under glaze and cloth, a half-time grime break on
the pop, a breakdown for the napkin, then the full groove with the K sparkle for the finale.
    python3 videos/13-brand/journey/music.py
"""
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent.parent / "kit"))
from sound import Song, accent, bell, chord_notes, crash, gayageum, house, rhodes, sonic_logo, sparkle, sub_note, swell  # noqa: E402

from playwright.sync_api import sync_playwright  # noqa: E402

with sync_playwright() as p:
    br = p.chromium.launch(args=["--allow-file-access-from-files", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"])
    pg = br.new_page(viewport={"width": 1920, "height": 1080})
    pg.goto((HERE / "comp.html").as_uri())
    pg.evaluate("window.ready")
    S = pg.evaluate("window.SCORE")
    br.close()

song = Song(bpm=S["bpm"], bars=30)
b = lambda n: n * song.bar  # noqa: E731
PROG = ["Em9", "Cmaj7", "Am9", "B7"]
HOOK = {0: [(0, 83), (3, 86), (6, 88)], 2: [(8, 86), (11, 83)]}

house(song, [(0, 7, 1), (7, 15, 2), (15, 19, 3), (19, 22, 4), (22, 25, 1), (25, 29, 3)], PROG, hook=HOOK)

# the sketch: paper lands on paper, one note per piece
sonic_logo(song, S["land"]["sketch"], "paper")
# the clean cut: a bell as the grid draws
song.add("lead", bell(83, 2.0, 0.6), b(5) + 0.4, 0.4, pan=0.2)
# into the ink: a swell, then the kick lands with a crash
accent(song, b(7), "swell"); accent(song, b(7), "crash")
# the ink blooms to a gayageum line, sprinkled
for i, (k, m) in enumerate([(0, 64), (6, 67), (10, 71), (16, 74), (22, 71)]):
    song.add("lead", gayageum(m, 1.4, 0.8), b(8) + k * song.step, 0.5, pan=-0.2 + 0.1 * i)
accent(song, b(15), "crash")
# the pop: stickers slap down to sparkles, then the grime break
sonic_logo(song, S["land"]["pop"], "sparkle")
accent(song, b(19), "kick")
# the napkin: the wink gets a two-note sparkle
song.add("lead", sparkle(88, 0.8), S["wink"], 0.5, pan=-0.2)
song.add("lead", sparkle(95, 0.7), S["wink"] + 0.4, 0.45, pan=0.2)
# the finale: swell, crash, and the logo in bells as the one mark lands
accent(song, b(25), "swell"); accent(song, b(25), "crash")
sonic_logo(song, S["land"]["final"], "bell", g=0.5)
# the close: Em9 rings out
for j, m in enumerate(chord_notes("Em9")[1:]):
    song.add("keys", rhodes(m, 3.2, 0.7), b(29) + 0.012 * j, 0.6, pan=-0.2 + 0.1 * j)
song.add("sub", sub_note(40, 1.8, att=0.01, rel=0.8), b(29), 0.6)
song.add("fx", crash(), b(29), 0.2, pan=0.1)

song.write(HERE / "work/music.wav", fade=1.2)
