"""Music for a 13-brand sting: the sonic logo (six notes, one per piece, in the direction's voice)
on the comp's land times, a bar of the house groove under the settle, and a chord to close.
Called by each sting's music.py. Writes <sting>/work/music.wav."""
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent / "kit"))
from sound import Song, house, sonic_logo, rhodes, pad, crash, bell, accent, chord_notes  # noqa: E402

from playwright.sync_api import sync_playwright  # noqa: E402


def score(comp):
    with sync_playwright() as p:
        br = p.chromium.launch(args=["--allow-file-access-from-files", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"])
        pg = br.new_page(viewport={"width": 1920, "height": 1080})
        pg.goto(comp.as_uri())
        pg.evaluate("window.ready")
        S = pg.evaluate("window.SCORE")
        br.close()
    return S


def make(folder):
    folder = Path(folder)
    S = score(folder / "comp.html")
    bars = int(S["duration"] / (240 / S["bpm"])) + 1
    song = Song(bpm=S["bpm"], bars=bars)
    PROG = ["Em9", "Cmaj7", "Am9", "B7"]
    # under the landing: a soft pad; from the bar after the last piece, one bar of the groove
    song.add("pad", pad(52, song.bar * 1.0, 0.5), 0.0, 0.35)
    house(song, [(1, 2, 2)], PROG)
    sonic_logo(song, S["land"], S["voice"])
    end = S.get("icon", 2 * song.bar)
    for j, m in enumerate(chord_notes("Em9")[1:]):
        song.add("keys", rhodes(m, 2.6, 0.7), end + 0.012 * j, 0.55, pan=-0.2 + 0.1 * j)
    song.add("sub", __import__("sound").sub_note(40, 2.2, att=0.01, rel=0.8), end, 0.6)
    song.add("lead", bell(88, 2.4, 0.6), end + 0.05, 0.35, pan=0.15)
    accent(song, end, "crash")
    song.dur = S["duration"]
    song.N = int(round(song.dur * 48000))
    for k in song.stems:
        song.stems[k] = song.stems[k][:, : song.N]
    song.write(folder / "work/music.wav", fade=0.8)
