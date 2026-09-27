"""The v2 soundtrack: dub at 140 BPM in half-time, F minor, heavy sub, a little
womp. Cut to the storyboard in brag-plan.md. Writes music.wav (48 kHz stereo)."""
import wave
from pathlib import Path

import numpy as np

SR = 48000
BEAT = 3 / 7          # 140 BPM
BAR = 4 * BEAT        # 12/7 s
DUR = 35 * BAR        # 60 s
N = int(round(SR * DUR))
rng = np.random.default_rng(11)
HERE = Path(__file__).resolve().parent


def hz(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def tt(d):
    return np.arange(int(d * SR)) / SR


def buf():
    return np.zeros((2, N))


def place(dst, sig, t, gain=1.0, pan=0.0):
    i = int(round(t * SR))
    if i >= N or i < 0:
        return
    sig = sig[: N - i]
    a = (pan + 1) * np.pi / 4
    dst[0, i:i + len(sig)] += sig * gain * np.cos(a)
    dst[1, i:i + len(sig)] += sig * gain * np.sin(a)


def fft_filter(x, lo=None, hi=None, order=2):
    n = x.shape[-1]
    f = np.fft.rfftfreq(n, 1 / SR)
    h = np.ones_like(f)
    if hi:
        h *= 1 / np.sqrt(1 + (f / hi) ** (2 * order))
    if lo:
        h *= 1 / np.sqrt(1 + (lo / np.maximum(f, 1e-6)) ** (2 * order))
    return np.fft.irfft(np.fft.rfft(x, axis=-1) * h, n=n, axis=-1)


def saw(ph):
    return 2 * (ph % 1.0) - 1


def at(bar, beat=0.0):
    return bar * BAR + beat * BEAT


# ---------------------------------------------------------------- harmony
# a four-bar loop: Fm, Fm, Ab, Eb. Sub roots sit low on purpose.
LOOP = [(29, [53, 56, 60]), (29, [53, 56, 60]), (32, [56, 60, 63]), (27, [55, 58, 63])]


def chord(bar):
    return LOOP[int(bar) % 4]


# ---------------------------------------------------------------- instruments
def kick(power=1.0):
    t = tt(0.6)
    f = 46 + 110 * np.exp(-t / 0.035)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / (0.32 * power))
    click = rng.standard_normal(len(t)) * np.exp(-t / 0.0015) * 0.3
    return np.tanh((s + click) * 2.0) * 0.85


def snare(big=1.0):
    t = tt(0.5)
    n = fft_filter(rng.standard_normal(len(t)), lo=1200, hi=7500) * np.exp(-t / (0.12 * big))
    body = np.sin(2 * np.pi * 190 * t) * np.exp(-t / 0.06) * 0.8
    return np.tanh((n * 1.4 + body) * 1.3) * 0.8


def rim():
    t = tt(0.08)
    return (np.sin(2 * np.pi * 820 * t) * 0.7 + rng.standard_normal(len(t)) * 0.3) * np.exp(-t / 0.012)


def hat(open_=False):
    t = tt(0.3 if open_ else 0.05)
    return fft_filter(rng.standard_normal(len(t)), lo=7500) * np.exp(-t / (0.09 if open_ else 0.014))


def crash(d=2.4):
    t = tt(d)
    return fft_filter(rng.standard_normal(len(t)), lo=3500, hi=14000) * np.exp(-t / 0.7)


def skank(notes, d=0.16):
    """An offbeat chord stab: bright, short, meant for the echo."""
    t = tt(d)
    s = np.zeros_like(t)
    for m in notes:
        f = hz(m)
        s += saw(f * t + rng.uniform()) * 0.5 + np.sign(np.sin(2 * np.pi * f * 1.003 * t)) * 0.25
    s *= np.exp(-t / 0.055) * np.minimum(1, t / 0.002)
    s = fft_filter(s, lo=450, hi=2600)
    return s / (np.abs(s).max() + 1e-9)


def sub_note(m, d, att=0.01, rel=0.08):
    t = tt(d)
    env = np.minimum(1, t / att) * np.minimum(1, np.maximum(0, (d - t) / rel))
    s = np.sin(2 * np.pi * hz(m) * t)
    return np.tanh(s * 1.3) / np.tanh(1.3) * env


def siren(d, f0=520, f1=1250, rate=2.2):
    """The dub siren: a sine that keeps sweeping up, faster as it goes."""
    t = tt(d)
    r = rate * (1 + t / d)
    ph = (np.cumsum(r) / SR) % 1.0
    f = f0 * (f1 / f0) ** ph
    s = np.sin(2 * np.pi * np.cumsum(f) / SR)
    return s * np.minimum(1, t / 0.3) * np.minimum(1, (d - t) / 0.2)


def melodica(m, d):
    t = tt(d)
    f = hz(m) * (1 + 0.004 * np.sin(2 * np.pi * 5.2 * t) * np.minimum(1, t / 0.25))
    ph = np.cumsum(f) / SR
    s = saw(ph) * 0.5 + np.sign(np.sin(2 * np.pi * ph)) * 0.3 + rng.standard_normal(len(t)) * 0.03
    env = np.minimum(1, t / 0.04) * np.minimum(1, np.maximum(0, (d - t) / 0.08))
    s = fft_filter(s * env, lo=250, hi=2400)
    return s / (np.abs(s).max() + 1e-9)


def svf_lowpass(x, cut, damp=0.35):
    """Chamberlin state-variable lowpass with a moving cutoff (Hz array)."""
    fcoef = 2 * np.sin(np.pi * np.minimum(cut, SR / 7) / SR)
    low = band = 0.0
    y = np.empty_like(x)
    for i in range(len(x)):
        f = fcoef[i]
        high = x[i] - low - damp * band
        band += f * high
        low += f * band
        y[i] = low
    return y


def wobble(root, d, segs, cmin=110.0, cmax=1100.0):
    """The womp: detuned saws and a square through a resonant lowpass that an LFO
    opens and closes. segs: (start beat, beats, cycles per beat)."""
    t = tt(d)
    f = hz(root + 12)
    x = saw(f * t) * 0.55 + saw(f * 1.006 * t + 0.3) * 0.55 + np.sign(np.sin(np.pi * f * t)) * 0.45
    lfo = np.zeros_like(t)
    amp = np.zeros_like(t)
    for sb, nb, rate in segs:
        a, z = int(sb * BEAT * SR), min(len(t), int((sb + nb) * BEAT * SR))
        tl = (np.arange(z - a)) / SR
        ph = (tl / BEAT * rate) % 1.0
        lfo[a:z] = 0.5 - 0.5 * np.cos(2 * np.pi * ph)
        seg_d = (z - a) / SR
        amp[a:z] = np.minimum(1, tl / 0.006) * np.minimum(1, np.maximum(0, (seg_d - tl) / 0.025))
    cut = cmin * (cmax / cmin) ** lfo
    y = svf_lowpass(x * amp, cut)
    return np.tanh(y * 2.4) * 0.8


def tap_sfx(m=84):
    t = tt(0.07)
    return (np.sin(2 * np.pi * hz(m) * t) * 0.6 + fft_filter(rng.standard_normal(len(t)), lo=2500) * 0.25) * np.exp(-t / 0.014)


# ---------------------------------------------------------------- stems
drums, sub, wob, skk, lead, fx, taps = buf(), buf(), buf(), buf(), buf(), buf(), buf()
kicks = []

# Groove sections: where the full half-time beat plays
GROOVE = [(4, 20), (24, 32)]
WOB = {  # bar ranges and their patterns
    "reveal": ((4, 6), [(0, 4, 0.5)], 900.0),
    "plan": ((6, 13), None, 1000.0),
    "feedback": ((13, 20), None, 1150.0),
    "drop2": ((24, 28), None, 1700.0),
    "byo": ((28, 32), None, 1000.0),
}
P_A = [(0, 1.5, 1.0), (1.5, 0.5, 2.0), (2, 2, 1.0)]
P_B = [(0, 1, 1.0), (1, 1, 1.0), (2, 1, 1.5), (3, 1, 3.0)]
P_C = [(0, 1, 2.0), (1, 1, 1.0), (2, 0.5, 4.0), (2.5, 0.5, 4.0), (3, 1, 3.0)]


def in_groove(bar):
    return any(a <= bar < z for a, z in GROOVE)


# Drums
for bar in range(35):
    if in_groove(bar):
        place(drums, kick(), at(bar), 1.0); kicks.append(at(bar))
        if bar % 2 == 1:
            place(drums, kick(0.7), at(bar, 2.5), 0.55); kicks.append(at(bar, 2.5))
        place(drums, snare(), at(bar, 2), 0.72)
        for e in range(8):
            place(drums, hat(), at(bar, e / 2), 0.2 if e % 2 else 0.12, pan=0.3)
        if 13 <= bar < 20 or 24 <= bar < 28:
            for e in range(16):
                if e % 4 == 2:
                    place(drums, hat(True), at(bar, e / 4), 0.05, pan=-0.3)
    elif bar < 4 or 20 <= bar < 24:
        place(drums, rim(), at(bar, 2), 0.5, pan=-0.2)
        if bar >= 2 and bar < 4 or bar >= 22:
            for e in range(8):
                place(drums, hat(), at(bar, e / 2 + 0.25), 0.05, pan=0.3)
# drops and the last hit
for t0 in (at(4), at(24)):
    place(drums, crash(), t0, 0.22, pan=0.15)
    place(drums, snare(1.6), t0, 0.5)
place(drums, kick(1.6), at(32), 1.0); kicks.append(at(32))
place(drums, snare(2.0), at(32), 0.7)
place(drums, crash(3.5), at(32), 0.26)
# a snare roll into drop two, and a shorter one into the reveal
for i in range(16):
    tr = at(23) + i * BEAT / 4
    place(drums, snare(0.5), tr, 0.1 + 0.4 * (i / 15) ** 2, pan=0.1 * (-1) ** i)
for i in range(8):
    place(drums, snare(0.5), at(3, 2) + i * BEAT / 4, 0.08 + 0.25 * (i / 7) ** 2)

# Sub: long notes in the intro and the breakdown, locked to the bar in the grooves
for bar in range(32):
    root, _ = chord(bar)
    if in_groove(bar):
        place(sub, sub_note(root, BAR * 0.98, att=0.004), at(bar), 0.9)
    else:
        swell = sub_note(root, BAR, att=0.35, rel=0.3)
        place(sub, swell, at(bar), 0.78 if bar < 4 else 0.8)
place(sub, sub_note(29, 4.2, att=0.004, rel=2.8), at(32), 1.0)

# Wobble
for name, ((a, z), pat, cmax) in WOB.items():
    for bar in range(a, z):
        root, _ = chord(bar)
        if pat is not None:
            segs = pat
        elif name == "drop2":
            segs = P_C
        else:
            segs = P_B if bar % 4 == 3 else P_A
        w = wobble(root, BAR, segs, cmax=cmax)
        place(wob, w, at(bar), 0.5 if name != "drop2" else 0.58)

# Skanks on the offbeats, everywhere but the last bars
for bar in range(32):
    _, notes = chord(bar)
    g = 0.85 if (bar < 4 or 20 <= bar < 24) else 0.42
    for beat in (1, 3):
        place(skk, skank(notes), at(bar, beat), g, pan=-0.25 if beat == 1 else 0.25)
_, notes = chord(0)
place(skk, skank(notes, 0.3), at(32), 0.8)

# Melodica: a short phrase in the intro and over the outro
PHRASE = [(0, 72, 1.5), (1.5, 68, 0.5), (2, 65, 1.5), (3.5, 63, 0.5), (4, 65, 3.0)]
for sb, m, nb in PHRASE:
    place(lead, melodica(m, nb * BEAT * 0.95), at(1) + sb * BEAT, 0.42, pan=0.1)
for sb, m, nb in PHRASE:
    place(lead, melodica(m, nb * BEAT * 0.95), at(32, 1) + sb * BEAT, 0.26, pan=-0.1)

# Sirens into each drop
place(fx, siren(at(4) - at(2, 2)), at(2, 2), 0.12, pan=0.35)
place(fx, siren(at(24) - at(22)), at(22), 0.12, pan=-0.35)
# a reverse swell into both drops
for t0 in (at(4), at(24)):
    d = BAR
    sw = fft_filter(rng.standard_normal(int(d * SR)), lo=2500) * np.linspace(0, 1, int(d * SR)) ** 3
    place(fx, sw, t0 - d, 0.1)

# Taps: soft, dry, only where the finger touches (times match comp.html)
b = lambda n: n * BEAT
TAPS = [12.0, b(30), b(31), b(32), b(33), b(37.5), b(40), b(55), b(56), b(57), b(59), b(71), b(76), b(78), b(84), b(90)]
for i, t0 in enumerate(TAPS):
    place(taps, tap_sfx(84 if i % 2 else 89), t0, 0.16, pan=0.1)
# Send: a small rising blip
tb = tt(0.14)
send = np.sin(2 * np.pi * np.cumsum(hz(77) * (1 + tb / 0.14)) / SR) * np.exp(-tb / 0.05)
place(taps, send, b(45), 0.18)

# ---------------------------------------------------------------- dub delay and room
def dub_delay(x, delay, fb=0.55, lo=300, hi=2200, repeats=9, pingpong=True):
    """Tape-style echo: each repeat darker and thinner, bouncing left and right."""
    D = int(round(delay * SR))
    out = np.zeros_like(x)
    e = x.copy()
    for k in range(1, repeats + 1):
        e = np.roll(e, D, axis=1)
        e[:, :D] = 0
        e = fft_filter(e, lo=lo, hi=hi, order=1) * fb
        if pingpong:
            e = e[::-1] if k % 2 else e
        out += e
    return out


DOTTED8 = 0.75 * BEAT
echo_send = skk * 0.9 + lead * 0.6 + drums * 0.0
# rims and the snare on the drops get thrown into the echo too
throw = buf()
for bar in list(range(0, 4)) + list(range(20, 24)):
    place(throw, rim(), at(bar, 2), 0.35)
place(throw, snare(2.0), at(32), 0.5)
place(throw, skank(chord(0)[1], 0.3), at(32), 0.6)
echoes = dub_delay(echo_send + throw, DOTTED8, fb=0.58, repeats=10)

ir_t = tt(2.6)
ir = np.stack([rng.standard_normal(len(ir_t)), rng.standard_normal(len(ir_t))]) * np.exp(-ir_t / 0.55)
ir[:, : int(0.02 * SR)] = 0
ir = fft_filter(ir, lo=250, hi=4500)
ir /= np.sqrt((ir ** 2).sum(axis=1, keepdims=True))
send = skk * 0.35 + lead * 0.4 + drums * 0.12 + fx * 0.5 + echoes * 0.25
L = N + ir.shape[1]
nfft = 1 << int(np.ceil(np.log2(L)))
wet = np.fft.irfft(np.fft.rfft(send, nfft, axis=1) * np.fft.rfft(ir, nfft, axis=1), nfft, axis=1)[:, :N]

# ---------------------------------------------------------------- mix
tk = np.arange(N) / SR
duck = np.ones(N)
for k in kicks:
    i = int(k * SR)
    duck[i:] = np.minimum(duck[i:], 1 - 0.55 * np.exp(-(tk[i:] - k) / 0.13))
sub *= duck
wob *= 0.35 + 0.65 * duck

sub = fft_filter(sub, hi=160)
wob = fft_filter(wob, lo=55, hi=3200)

mix = (drums * 0.8 + sub * 0.34 + wob * 0.85 + skk * 0.62 + echoes * 0.55 + lead * 0.75
       + fx * 0.55 + taps * 0.8 + wet * 0.3)
mix = fft_filter(mix, lo=24)

for name, x in (("drums", drums), ("sub", sub), ("wob", wob), ("skank", skk), ("echo", echoes), ("lead", lead), ("fx", fx), ("taps", taps), ("wet", wet)):
    print(f"{name:6s} peak {np.abs(x).max():5.2f}  rms {np.sqrt((x ** 2).mean()):.3f}")

mix /= np.abs(mix).max()
mix = np.tanh(mix * 1.4) / np.tanh(1.4)
fade = np.ones(N)
fade[: int(0.01 * SR)] = np.linspace(0, 1, int(0.01 * SR))
fo = int((DUR - 1.8) * SR)
fade[fo:] = np.linspace(1, 0, N - fo) ** 1.5
mix *= fade
mix *= 10 ** (-1 / 20) / np.abs(mix).max()

pcm = (np.clip(mix.T, -1, 1) * 32767).astype("<i2")
with wave.open(str(HERE / "music.wav"), "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(pcm.tobytes())
print("wrote music.wav", round(DUR, 3), "s")
