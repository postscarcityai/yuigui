"""Music for 08-hands-full, "Cook with your hands full". 100 BPM, 14 bars (33.6 s), swing 30, in G.

The times come from score.js, the same file the picture reads: the mic tap, the parts, the nexts,
the lock screen, the time jump and the ding. Gmaj7 lands on every big cut (bars 4, 8, 12).
"""
import json
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent / "kit"))
from sound import Song, dub, drop, accent, bell, pop, tick  # noqa: E402

src = (HERE / "score.js").read_text()
S = json.loads(src[src.index("{"): src.rindex("}") + 1])

song = Song(bpm=S["bpm"], bars=S["bars"], swing=30)
PROG = ["Gmaj7", "Em7", "Cmaj7", "D"] * 3 + ["D", "Gmaj7"]  # one chord a bar, home on G

# The melodica for the wow (the lock screen, bars 8 and 9): {bar in the cycle: [(step, steps, midi)]}.
MOTIF = {
    0: [(0, 2, 74), (2, 2, 76), (4, 4, 79), (10, 2, 78), (12, 4, 74)],
    1: [(0, 4, 76), (6, 2, 74), (8, 6, 71)],
}

dub(song, [(0, 1, 1), (1, 4, 2), (4, 8, 3), (8, 10, 4), (10, 12, 3), (12, 13, 2), (13, 14, 1)], PROG, MOTIF)

# The frittata lands on the drop.
drop(song, S["parts"][0], bars_before=1.5)

# A bell on each part.
for t, m in zip(S["parts"], [83, 79, 81, 86, 83]):
    song.add("fx", bell(m, 1.3, 0.55), t, 0.45, pan=0.15)

# Each heard "next": a soft pop.
for t in S["nexts"]:
    song.add("fx", pop(79, 0.7), t, 0.35, pan=-0.2)

# The spinach timer is done: a small bell.
song.add("fx", bell(91, 0.8, 0.4), S["spinachDone"], 0.3, pan=0.2)

# Into the lock screen: a swell and a crash.
accent(song, S["lock"], "swell")
accent(song, S["lock"], "crash")

# The time jump: clock ticks speeding up, then the timer's two-note ding.
a, z = S["jump"]
t, gap = a, 0.3
while t < z - 0.03:
    song.add("fx", tick(0.5, 2600 + 800 * (t - a) / (z - a)), t, 0.35, pan=0.25)
    t += gap
    gap = max(0.06, gap * 0.82)
song.add("fx", bell(88, 1.4, 0.6), S["ding"], 0.5)
song.add("fx", bell(84, 1.8, 0.6), S["ding"] + 0.3, 0.5)

# Unlock, dinner: a swell and a crash.
accent(song, S["unlock"], "swell")
accent(song, S["unlock"], "crash")

# One Send: a quick G arpeggio.
for k, m in enumerate([79, 83, 86, 91]):
    song.add("fx", bell(m, 1.2, 0.5), S["sent"] + 0.05 + k * song.step, 0.42, pan=-0.2 + 0.13 * k)

accent(song, S["outro"], "swell")
end = song.at(13)
song.strum(end, "Gmaj7", 2.0, 0.6)
song.add("fx", bell(91, 2.0, 0.5), end + 0.05, 0.5)

song.taps([t for t, _ in S["taps"]])
song.write(HERE / "work" / "music.wav", fade=2.0)
