"""Music for 14-yui-on-the-web, "Yui is on the web". 100 BPM, 22 bars (52.8 s), swing 30. The times come from score.js."""
import json
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent / "kit"))
from sound import Song, dub, drop, accent, bell  # noqa: E402

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
dub(song, [(0, 1, 1)], ["Dm7"])                                   # the phone alone, thin
dub(song, [(1, 6, 3), (6, 11, 3), (11, 17, 4), (17, 21, 4)], PROG, MOTIF)  # laptop and phone, four scenes
dub(song, [(21, 22, 2)], ["Fmaj7"] * 21 + ["C"])
drop(song, S["slide"], bars_before=1.0)
for t in S["cuts"]:
    accent(song, t, "swell")
    accent(song, t, "crash")
accent(song, S["outro"], "swell")
song.add("fx", bell(89, 2.0, 0.5), S["outro"] + 0.05, 0.5)
song.taps(S["taps"])
song.write(HERE / "work" / "music.wav", fade=2.0)
