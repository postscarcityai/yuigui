"""Music for 11-tune-up, "Tune up, keep time, send a take" (Yui 0.4.1). 90 BPM, 18 bars (48 s), dub.

The times come from the comp (window.SCORE): each string the tuner hears, the metronome's first
click, the loop's drop, Record and Stop and send, the notes the MIDI keyboard plays, every tap.
E minor, one chord a bar: Em C G D. Writes work/music.wav.
    python3 videos/11-tune-up/music.py
"""
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent / "kit"))
from sound import Song, accent, bell, dub, drop, keys, pluck, tick  # noqa: E402

from playwright.sync_api import sync_playwright  # noqa: E402

with sync_playwright() as p:
    br = p.chromium.launch(args=["--allow-file-access-from-files"])
    pg = br.new_page(viewport={"width": 1920, "height": 1080})
    pg.goto((HERE / "comp.html").as_uri())
    pg.evaluate("window.ready")
    S = pg.evaluate("window.SCORE")
    br.close()

song = Song(bpm=S["bpm"], bars=S["bars"], swing=0)
b = lambda n: n * song.bar  # noqa: E731
PROG = ["Em", "C", "G", "D"]

# Energy follows the story: the hook and the tuner stay low so every string rings through,
# the metronome brings the one drop, the loop drops the full groove, the keys ride on top.
dub(song, [(0, 7, 1), (7, 9, 2), (9, 14, 3), (14, 16, 3)], PROG)
dub(song, [(16, 18, 1)], ["C", "G", "C", "G"])  # C to G: a soft close
song.strum(b(17), "G", 2.4, 0.6)
song.add("lead", bell(79, 2.4, 0.55), b(17) + 0.04, 0.45, pan=0.1)

# The tuner: each open string plucked as it is heard, then a bell when all six are in.
for t, m in S["strings"]:
    song.add("keys", pluck(m, 1.6, 0.9), t, 1.0, pan=-0.1)
song.add("fx", bell(83, 1.6, 0.5), S["strings"][-1][0] + 1.05, 0.45, pan=0.2)

# The metronome: a click on every beat from its first bar until the keys, the one high.
t = S["met0"]
k = 0
while t < S["keys0"] - 0.01:
    song.add("fx", tick(0.7, 4000 if k % 4 == 0 else 3000), t, 0.55, pan=0.25)
    t += song.bar / 4
    k += 1

# The loop comes in on the drop.
drop(song, S["loop0"])
# Stop and send: a two-note bell as the take goes to the agent.
song.add("fx", bell(83, 1.2, 0.5), S["rec1"] + 0.4, 0.45, pan=-0.1)
song.add("fx", bell(88, 1.2, 0.5), S["rec1"] + 0.4 + song.step * 2, 0.4, pan=0.1)

# The MIDI keyboard: every lit key is a note on the keys sound.
for t, m in S["mel"]:
    song.add("keys", keys(m, 0.32, 0.9), t, 1.1, pan=0.05)

accent(song, S["outro"], "swell")
accent(song, S["outro"], "crash")
song.taps(S["taps"])
song.write(HERE / "work" / "music.wav", fade=2.0)
