"""Music for 12-new-face, "Yui 0.4.1, filmed in the app". 100 BPM, 28 bars (67.2 s), swing 30.

The times come from score.js, the same file the picture reads: the eight pages, the hold on the mic,
the parts, the taps (placed where the recorded app moved), the cuts. The hook sits low and thin
(the old way), then the siren drops into the real app at bar 3. F major: Fmaj7 Dm7 Bbmaj7 C,
indexed by bar so bars 3, 7, 11, 15, 19 and 23 land on Fmaj7.
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
PROG = ["Dm7", "Bbmaj7", "C", "Fmaj7"]

MOTIF = {
    0: [(0, 2, 72), (2, 2, 74), (4, 4, 77), (10, 2, 76), (12, 4, 72)],
    1: [(0, 4, 74), (6, 2, 72), (8, 6, 69)],
    2: [(0, 2, 70), (2, 2, 72), (4, 4, 74), (10, 2, 77), (12, 4, 74)],
    3: [(0, 6, 72), (8, 2, 76), (10, 2, 77), (12, 4, 79)],
}

# The hook: a held Dm7 and C, thin, eight pages piling up.
dub(song, [(0, 1, 1), (1, 3, 2)], ["Dm7", "Dm7", "C"])
# Talk, the parts, the questions, the record, two agents, the picture that listens.
dub(song, [(3, 7, 3), (7, 13, 3), (13, 17, 4), (17, 19, 3), (19, 23, 4), (23, 26, 4)], PROG, MOTIF)
dub(song, [(26, 27, 2), (27, 28, 1)], ["Fmaj7"] * 26 + ["C", "Fmaj7"])  # C, then home on F

for i, t in enumerate(S["pages"]):
    song.add("fx", pluck([62, 65, 69, 72, 74, 77, 81, 84][i], 0.5, 0.5), t, 0.35, pan=-0.3 + 0.08 * i)

# The real app slides up: a siren into the drop.
drop(song, S["stage"], bars_before=1.5)

# The one-screen answer and each part as it lands: a bell.
for t, m in zip([S["answer"]] + S["parts"], [84, 77, 81, 79]):
    song.add("fx", bell(m, 1.3, 0.55), t, 0.5, pan=0.15)

# One Send: a quick F arpeggio.
for k, m in enumerate([77, 81, 84, 89]):
    song.add("fx", bell(m, 1.2, 0.5), S["sent"] + 0.05 + k * song.step, 0.42, pan=-0.2 + 0.13 * k)

for t in S["cuts"]:
    accent(song, t, "swell")
    accent(song, t, "crash")
accent(song, S["outro"], "swell")

end = song.at(27)
song.strum(end, "Fmaj7", 2.0, 0.6)
song.add("fx", bell(89, 2.0, 0.5), end + 0.05, 0.5)

# Every tap, on the same times as the finger; the hold on the mic taps when it goes down.
song.taps([S["hold"][0]] + [t for t, _ in S["taps"]])

song.write(HERE / "work" / "music.wav", fade=2.0)
