"""The jam, written once. Picture (comp.html via score.js) and sound (synth.py
via score.json) both read this, so every cell you see light is a hit you hear.

90 BPM, 16 steps a bar, in G. Swing follows the looper's rule (theory.mjs
stepTime): odd 16ths land late by swing% of half a step."""
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
BPM = 90
STEP = 60 / BPM / 4          # a 16th
BAR = 16 * STEP              # 8/3 s
END = 24 * BAR               # 64 s


def step_time(k, swing):
    return k * STEP + ((swing / 100) * STEP * 0.5 if k % 2 else 0.0)


def at(bar, step=0, swing=0):
    return bar * BAR + step_time(step, swing)


# ---------------------------------------------------------------- the looper
ROWS = ["kick", "snare", "clap", "hat", "open", "rim"]
P0 = {"kick": "x.......x.x.....", "snare": "....x.......x...", "clap": "", "hat": "x.x.x.x.x.x.x.x.", "open": "", "rim": ""}
TAP_KICK = 14.2    # the person adds a kick on step 16
TAP_OPEN = 15.7    # and an open hat on step 15
PATCH = at(8)      # the agent's patch lands on the bar: swing, a clap, rims
LOOP_START, LOOP_END = at(3), at(23)

changes = []       # (time, patterns, swing)
p = dict(P0)
changes.append((0.0, dict(p), 0))
p["kick"] = "x.......x.x....x"
changes.append((TAP_KICK, dict(p), 0))
p["open"] = "..............x."
changes.append((TAP_OPEN, dict(p), 0))
p["clap"] = "............x..."
p["rim"] = "...x.......x...."
changes.append((PATCH, dict(p), 50))


def state_at(t):
    cur = changes[0]
    for c in changes:
        if c[0] <= t + 1e-9:
            cur = c
    return cur


drum_hits = []     # (time, row)
for b in range(3, 23):
    for k in range(16):
        t0 = at(b, k, 0)
        pats, swing = state_at(t0)[1], state_at(t0)[2]
        t = at(b, k, swing)
        for r in ROWS:
            if (pats[r] + "." * 16)[k] == "x":
                drum_hits.append((round(t, 5), r))

# ---------------------------------------------------------------- chords
# Voicings from theory.mjs chordNotes: a bass note E2 to D#3, the triad G3 to F#4.
VOICING = {"G": [43, 55, 59, 62], "D": [50, 62, 66, 69], "Em": [40, 64, 67, 71], "C": [48, 60, 64, 67]}
PROG = ["G", "D", "Em", "C"]
COMP = [(0, 1.1), (6, 0.6), (10, 1.3)]  # the person's strum rhythm: step, length in seconds
REC_TAP = 25.9
REC_START, REC_END = at(10), at(14)
strums = []        # (time, chord, dur, recorded)
for i, ch in enumerate(PROG):
    for k, d in COMP:
        strums.append((round(at(10 + i, k, 50), 5), ch, d, True))
for b in range(14, 23):
    ch = PROG[(b - 14) % 4]
    for k, d in COMP:
        strums.append((round(at(b, k, 50), 5), ch, d, False))
FINAL = at(23)
strums.append((round(FINAL, 5), "G", 3.2, False))

# ---------------------------------------------------------------- the solo, G major pentatonic
G4, A4, B4, D5, E5 = 67, 69, 71, 74, 76
SOLO = {
    15: [(0, 2, A4), (2, 2, B4), (4, 4, A4), (8, 6, D5)],
    16: [(0, 3, E5), (3, 3, D5), (6, 2, B4), (8, 4, G4), (12, 4, A4)],
    17: [(0, 2, G4), (2, 2, A4), (4, 4, G4), (8, 2, A4), (10, 2, B4), (12, 4, D5)],
    18: [(0, 2, D5), (2, 2, E5), (4, 4, D5), (8, 4, B4), (12, 4, G4)],
    19: [(0, 2, A4), (2, 2, B4), (4, 12, D5)],
}
lead = []          # (time, midi, dur)
for b, notes in SOLO.items():
    for k, n, m in notes:
        t0 = at(b, k, 50)
        t1 = b * BAR + step_time(k + n, 50) if k + n < 16 else (b + 1) * BAR
        lead.append((round(t0, 5), m, round(t1 - t0 - 0.03, 5)))
SEND_TAP = 53.7

# The cold open replays bars 18 and 19 (the solo over G and D), then a tape stop.
COLD_END = at(2)
COLD_SHIFT = at(18)

# ---------------------------------------------------------------- the finger
taps = [(TAP_KICK, "cell-0-15"), (TAP_OPEN, "cell-4-14"), (REC_TAP, "rec-btn")]
taps += [(t, "tgt-" + ch) for t, ch, d, rec in strums if rec]
taps += [(t, f"key-{m}") for t, m, d in lead]
taps.append((SEND_TAP, "send-btn"))

score = {
    "bpm": BPM, "step": STEP, "bar": BAR, "end": END, "rows": ROWS,
    "changes": [[t, pats, sw] for t, pats, sw in changes],
    "loop": [LOOP_START, LOOP_END], "drums": drum_hits,
    "strums": strums, "rec": [REC_TAP, REC_START, REC_END], "prog": PROG,
    "lead": lead, "send": SEND_TAP, "final": FINAL,
    "cold": [COLD_END, COLD_SHIFT], "taps": sorted(taps),
}
(HERE / "score.json").write_text(json.dumps(score))
(HERE / "score.js").write_text("window.SCORE = " + json.dumps(score) + ";\n")
print(f"{len(drum_hits)} drum hits, {len(strums)} strums, {len(lead)} lead notes, {len(taps)} taps, {END:.2f} s")
