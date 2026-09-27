"""Music for 05-agents, "Your agents, one app". 100 BPM, 25 bars (60 s), swing 30.

The times come from score.js, the same file the picture reads: taps, look changes, cuts.
Warm Eb major, arranged so every scene starts on the I chord: Abmaj7 Bb | Ebmaj7 Cm7 Abmaj7 Bb ...
"""
import json
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent / "kit"))
from sound import Song, groove, dub, drop, accent, bell, keys, pad  # noqa: E402

src = (HERE / "score.js").read_text()
S = json.loads(src[src.index("{"): src.rindex("}") + 1])

song = Song(bpm=S["bpm"], bars=S["bars"], swing=30)
PROG = ["Abmaj7", "Bb", "Ebmaj7", "Cm7"]  # bar 2, 6, 10, 14, 18 and 22 land on Ebmaj7

# The lead motif, a 4-bar phrase over Ebmaj7 Cm7 Abmaj7 Bb: {bar in the cycle: [(step, steps, midi)]}.
MOTIF = {
    0: [(0, 2, 70), (2, 2, 72), (4, 4, 75), (10, 2, 74), (12, 4, 70)],
    1: [(0, 4, 72), (6, 2, 70), (8, 6, 67)],
    2: [(0, 2, 68), (2, 2, 70), (4, 4, 72), (10, 2, 75), (12, 4, 72)],
    3: [(0, 6, 70), (8, 2, 74), (10, 2, 75), (12, 4, 77)],
}

# Sections follow the storyboard: the hook, the list and pairing, the threads, @mention, restyle, the chips, the outro.
dub(song, [(0, 2, 2), (2, 6, 3), (6, 10, 3), (10, 14, 4), (14, 18, 4), (18, 22, 4)], PROG, MOTIF)
dub(song, [(22, 23, 2), (23, 25, 1)], ["Ebmaj7", "Ebmaj7", "Ebmaj7", "Abmaj7"])  # Eb, Ab, Eb: a soft plagal close

# The hook: each look change rings a bell, climbing (over Abmaj7, then Bb).
for (t, _), m in zip(S["looks"], [75, 79, 77, 82, 86]):
    song.add("fx", bell(m, 1.2, 0.55), t, 0.55, pan=0.2)

# Big cuts: a swell into each, a crash on it.
for t in S["cuts"]:
    accent(song, t, "swell")
    accent(song, t, "crash")
accent(song, S["outro"], "swell")

# Paired: a two-note bell on the downbeat the agent connects.
song.add("fx", bell(79, 1.4, 0.5), S["connected"], 0.5, pan=-0.1)
song.add("fx", bell(84, 1.4, 0.5), S["connected"] + song.step * 2, 0.45, pan=0.1)

# Use autumn: a quick Eb arpeggio as the whole app changes.
for k, m in enumerate([75, 79, 82, 87]):
    song.add("fx", bell(m, 1.2, 0.5), S["applied"] + 0.05 + k * song.step, 0.42, pan=-0.2 + 0.13 * k)

# The chips: a soft pluck on each pop, walking up Eb major.
for i, m in enumerate([63, 67, 70, 72, 75, 77, 79, 82, 84]):
    song.add("fx", bell(m, 0.8, 0.35), S["chips"] + i * song.step * 2, 0.3, pan=-0.3 + 0.075 * i)

# The last bar: one Ebmaj7 strum and a bell on top, left to ring out.
end = song.at(24)
song.strum(end, "Ebmaj7", 2.0, 0.6)
song.add("fx", bell(87, 2.0, 0.5), end + 0.05, 0.5)

# Every UI tap, on the same times as the finger.
song.taps([t for t, _ in S["taps"]])

song.write(HERE / "work" / "music.wav", fade=2.0)
