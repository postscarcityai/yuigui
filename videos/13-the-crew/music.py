"""Music for 13-the-crew, "Yui 0.5.0: the crew feels ready". 100 BPM, 50 bars (120 s), dub.

The times come from the comp (window.SCORE): the six badges, the drop, the hold on the shutter and
each word said into it, the flips between agents, Gouda's looper, the table's hop, the crew's cards,
the wall's words, every tap. D major, one chord a bar: Dmaj7 Bm7 Gmaj7 A, so every fourth bar
lands home. Writes work/music.wav.
    python3 videos/13-the-crew/music.py
"""
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent / "kit"))
from sound import Song, accent, bell, drop, dub, hat, kick, pluck, snare, swell, tick  # noqa: E402

from playwright.sync_api import sync_playwright  # noqa: E402

with sync_playwright() as p:
    br = p.chromium.launch(args=["--allow-file-access-from-files"])
    pg = br.new_page(viewport={"width": 1920, "height": 1080})
    pg.goto((HERE / "comp.html").as_uri())
    pg.evaluate("window.ready")
    S = pg.evaluate("window.SCORE")
    br.close()

song = Song(bpm=S["bpm"], bars=S["bars"], swing=0)
PROG = ["Dmaj7", "Bm7", "Gmaj7", "A"]

# The melodica: a 4-bar phrase over Dmaj7 Bm7 Gmaj7 A.
MOTIF = {
    0: [(0, 2, 78), (2, 2, 76), (4, 4, 74), (10, 2, 73), (12, 4, 74)],
    1: [(0, 4, 71), (6, 2, 74), (8, 6, 78)],
    2: [(0, 2, 79), (2, 2, 78), (4, 4, 74), (10, 2, 71), (12, 4, 74)],
    3: [(0, 6, 76), (8, 2, 73), (10, 2, 76), (12, 4, 81)],
}

# The cold open sits low and dark, then the siren drops into the app on bar 4. Energy follows the
# story: snap and the meal ride the groove, the melodica comes in for the picker, the hand-off and
# the tables, and stays through the crew and the wall. The outro walks Bm7 Gmaj7 A home to D.
dub(song, [(0, 2, 1), (2, 4, 2)], PROG)
dub(song, [(4, 16, 3), (16, 20, 4), (20, 28, 3), (28, 32, 4), (32, 36, 3), (36, 45, 4)], PROG, MOTIF)
dub(song, [(45, 48, 2), (48, 50, 1)], PROG * 12 + ["Dmaj7", "Bm7", "Gmaj7", "A", "Dmaj7", "Dmaj7"])

# The six badges: a bell each, climbing D major; the title rings the top.
UP = [69, 74, 78, 81, 86, 90]
for t, m in zip(S["badges"], UP):
    song.add("fx", bell(m, 1.2, 0.55), t, 0.45, pan=-0.3 + 0.12 * UP.index(m))
song.add("fx", bell(86, 2.0, 0.5), 4.2, 0.4)
song.add("fx", bell(93, 2.0, 0.4), 4.25, 0.25, pan=0.2)
drop(song, S["drop"], bars_before=1.5)

# Snap and say: the shutter, a soft pluck for each word as it lands, a swell as the photo flies.
song.add("fx", tick(0.9, 2400), S["hold"][0] + 0.05, 0.6)
song.add("drums", hat(1.0, True), S["hold"][0] + 0.05, 0.25, pan=0.2)
for i, t in enumerate(S["words"]):
    song.add("fx", pluck([74, 76, 78, 81, 78, 81, 86][i], 0.3, 0.5), t, 0.28, pan=-0.2 + 0.07 * i)
song.add("fx", swell(0.6, 0.5), S["hold"][1] - 0.1, 0.35)

# Cards landing: a bell.
for t in S["pops"]:
    song.add("fx", bell(86, 1.0, 0.45), t, 0.3, pan=0.15)

# The picker: a pluck on each agent the highlight walks.
for i, m in enumerate([62, 66, 69, 74, 78, 81]):
    song.add("fx", pluck(m, 0.4, 0.6), 39.6 + i * 0.6, 0.32, pan=-0.3 + 0.12 * i)

# An iris opening from a tap: a quick arpeggio.
for t0 in (S["chip"], S["ask"], S["openBasil"]):
    for k, m in enumerate([74, 78, 81, 86]):
        song.add("fx", bell(m, 1.0, 0.45), t0 + 0.12 + k * song.step, 0.32, pan=-0.2 + 0.13 * k)

# Gouda's looper plays its pattern on the song's eighths, on top of the groove.
loop0 = S["loop"]
for bar in range(4):
    for c in range(8):
        t = loop0 + bar * song.bar + c * 2 * song.step
        if S["pat"]["kick"][c] == "x":
            song.add("drums", kick(0.9), t, 0.5)
        if S["pat"]["snare"][c] == "x":
            song.add("drums", snare(0.9), t, 0.45)
        if S["pat"]["hat"][c] == "x":
            song.add("drums", hat(0.8), t, 0.3, pan=0.3)

# The table's hop: a rise under the flight, a bell where it lands, another when a row is added.
song.add("fx", swell(S["land"] - S["lift"], 0.6), S["lift"], 0.4)
for k, m in enumerate([81, 86, 90]):
    song.add("fx", bell(m, 1.4, 0.5), S["land"] + k * song.step, 0.42, pan=-0.15 + 0.15 * k)
song.add("fx", bell(78, 1.0, 0.45), S["add"] + 0.8, 0.35)

# The crew: a bell a card, climbing again; a pluck a chip; a bell a word on the wall.
for t, m in zip(S["cards"], UP):
    song.add("fx", bell(m, 1.2, 0.5), t, 0.42, pan=-0.3 + 0.12 * UP.index(m))
for i, t in enumerate(S["chips"]):
    song.add("fx", pluck([74, 76, 78, 81, 83, 86, 88, 90][i], 0.3, 0.5), t, 0.25, pan=-0.3 + 0.08 * i)
for t, m in zip(S["wall"], [78, 81, 83, 86, 90]):
    song.add("fx", bell(m, 1.2, 0.5), t, 0.4, pan=0.1)

# Flips and big cuts: a swell into each, a crash on it.
for t in S["flips"] + S["cuts"]:
    accent(song, t, "swell")
    accent(song, t, "crash")
accent(song, S["outro"], "swell")

# The last bar: one Dmaj7 strum and a bell on top, left to ring out.
end = song.at(48)
song.strum(end, "Dmaj7", 2.4, 0.6)
song.add("fx", bell(90, 2.4, 0.5), end + 0.05, 0.5)

# Every tap, on the same times as the finger.
song.taps(S["taps"])

song.write(HERE / "work" / "music.wav", fade=2.5)
