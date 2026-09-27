"""The soundtrack: music and effects written as one piece, 120 BPM in C major,
cut to the storyboard in brag-plan.md. Writes music.wav (48 kHz stereo)."""
import wave
from pathlib import Path

import numpy as np

SR = 48000
DUR = 21.5
N = int(SR * DUR)
rng = np.random.default_rng(7)
HERE = Path(__file__).resolve().parent


def hz(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def buf():
    return np.zeros((2, N))


def place(dst, sig, t, gain=1.0, pan=0.0):
    """Add a mono signal at time t (seconds) with a constant-power pan (-1 left, 1 right)."""
    i = int(round(t * SR))
    if i >= N:
        return
    sig = sig[: N - i]
    a = (pan + 1) * np.pi / 4
    dst[0, i:i + len(sig)] += sig * gain * np.cos(a)
    dst[1, i:i + len(sig)] += sig * gain * np.sin(a)


def tt(d):
    return np.arange(int(d * SR)) / SR


def fft_filter(x, lo=None, hi=None, order=2):
    """Zero-phase Butterworth-shaped filter in the frequency domain (x: 1D or 2D)."""
    n = x.shape[-1]
    f = np.fft.rfftfreq(n, 1 / SR)
    h = np.ones_like(f)
    if hi:
        h *= 1 / np.sqrt(1 + (f / hi) ** (2 * order))
    if lo:
        h *= 1 / np.sqrt(1 + (lo / np.maximum(f, 1e-6)) ** (2 * order))
    return np.fft.irfft(np.fft.rfft(x, axis=-1) * h, n=n, axis=-1)


def onepole_lp(x, cut):
    """Time-varying one-pole lowpass (cut: array of Hz). For short sounds only."""
    y = np.zeros_like(x)
    z = 0.0
    k = 1 - np.exp(-2 * np.pi * np.asarray(cut) / SR)
    k = np.broadcast_to(k, x.shape)
    for i in range(len(x)):
        z += k[i] * (x[i] - z)
        y[i] = z
    return y


# ---------------------------------------------------------------- instruments
def pluck(m, d=0.35, bright=1.0):
    t = tt(d)
    f = hz(m)
    env = np.exp(-t / (0.09 + 0.05 * bright)) * np.minimum(1, t / 0.003)
    s = np.sin(2 * np.pi * f * t) + 0.35 * bright * np.sin(4 * np.pi * f * t) * np.exp(-t / 0.05)
    s += 0.12 * bright * np.sin(6 * np.pi * f * t) * np.exp(-t / 0.03)
    s += 0.06 * bright * np.sin(10 * np.pi * f * t) * np.exp(-t / 0.015)
    return s * env


def bell(m, d=1.6, idx=2.2):
    """Small FM bell: bright attack, soft tail."""
    t = tt(d)
    f = hz(m)
    mod = idx * np.exp(-t / 0.25) * np.sin(2 * np.pi * f * 3.5 * t)
    s = np.sin(2 * np.pi * f * t + mod) * np.exp(-t / 0.55)
    s += 0.25 * np.sin(2 * np.pi * f * 2 * t) * np.exp(-t / 0.3)
    return s * np.minimum(1, t / 0.002)


def pad_voice(m, d, att=0.35, rel=0.5):
    t = tt(d)
    f = hz(m)
    s = np.zeros_like(t)
    for det in (-0.07, 0.0, 0.06):  # three soft detuned triangles
        ph = 2 * np.pi * f * (2 ** (det / 12)) * t + rng.uniform(0, 6.28)
        s += (2 / np.pi) * np.arcsin(np.sin(ph))
    env = np.minimum(1, t / att) * np.minimum(1, np.maximum(0, (d - t) / rel))
    return s / 3 * env


def kick(hard=1.0):
    t = tt(0.45)
    f = 44 + 90 * np.exp(-t / 0.045)
    ph = 2 * np.pi * np.cumsum(f) / SR
    s = np.sin(ph) * np.exp(-t / (0.2 + 0.08 * hard))
    click = rng.standard_normal(len(t)) * np.exp(-t / 0.002) * 0.25
    return np.tanh((s + click) * 1.6) * 0.9


def clap():
    t = tt(0.3)
    n = rng.standard_normal(len(t))
    env = np.zeros_like(t)
    for o in (0, 0.011, 0.022):  # three quick bursts, then a tail
        env += np.exp(-np.maximum(0, t - o) / 0.008) * (t >= o)
    env += 0.6 * np.exp(-t / 0.09)
    return fft_filter(n * env, lo=900, hi=4200)


def hat(open_=False):
    t = tt(0.25 if open_ else 0.06)
    n = rng.standard_normal(len(t)) * np.exp(-t / (0.08 if open_ else 0.018))
    return fft_filter(n, lo=7000)


def tick(pitch=3000, d=0.02):
    t = tt(d)
    return (np.sin(2 * np.pi * pitch * t) * 0.6 + rng.standard_normal(len(t)) * 0.4) * np.exp(-t / 0.004)


def pop(m):
    """A tuned bubble pop: quick upward glide, short body."""
    t = tt(0.16)
    f = hz(m) * (0.7 + 0.3 * np.minimum(1, t / 0.025))
    ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * np.exp(-t / 0.05) * np.minimum(1, t / 0.002)


def sweep(f0, f1, d, tau=None):
    t = tt(d)
    f = f0 * (f1 / f0) ** (t / d)
    ph = 2 * np.pi * np.cumsum(f) / SR
    env = np.exp(-t / tau) if tau else np.sin(np.pi * t / d)
    return np.sin(ph) * env


def whoosh(d, c0, c1, peak=0.6):
    """Filtered noise swell with a moving cutoff."""
    t = tt(d)
    n = rng.standard_normal(len(t))
    cut = c0 * (c1 / c0) ** (t / d)
    s = onepole_lp(n, cut) - onepole_lp(n, cut * 0.25)
    env = np.where(t < peak * d, (t / (peak * d)) ** 2, np.exp(-(t - peak * d) / (0.12 * d)))
    return s * env


# ---------------------------------------------------------------- the score
CHORDS = {  # bass root, pad voicing
    "Am7": (45, [57, 60, 64, 67]), "Fmaj7": (41, [53, 57, 60, 64]), "C": (48, [60, 64, 67, 72]),
    "G": (43, [55, 59, 62, 67]), "Am": (45, [57, 60, 64, 69]), "F": (41, [53, 57, 60, 65]),
    "Cadd9": (48, [60, 64, 67, 74]),
}
SEGS = [(0, 3, "Am7"), (3, 5, "Fmaj7"), (5, 7, "C"), (7, 9, "G"), (9, 11, "Am"), (11, 13, "F"),
        (13, 15, "C"), (15, 16, "G"), (16, 17, "Am"), (17, 18.5, "F"), (18.5, 21.5, "Cadd9")]
BEAT = 0.5


def chord_at(t):
    for a, b, c in SEGS:
        if a <= t < b:
            return CHORDS[c]
    return CHORDS["Cadd9"]


pad, arp, bass, drums, bells, sfx = buf(), buf(), buf(), buf(), buf(), buf()
kicks = []

# Pad: every chord, the tail chord rings out
for a, b, c in SEGS:
    root, notes = CHORDS[c]
    d = (b - a) + (0.0 if c != "Cadd9" else 0.0)
    g = 0.5 if a < 5 else 0.75
    for i, m in enumerate(notes):
        place(pad, pad_voice(m, d + 0.35, att=0.25 if a else 0.05, rel=0.45 if c != "Cadd9" else 2.2), a, g, pan=(-0.5 + i / 3))

# Arp: 16ths over chord tones, soft in the hook, bright from the bloom
pattern = [0, 1, 2, 3, 2, 1, 3, 2]
step = 0
t = 0.0
while t < 18.5 - 1e-6:
    root, notes = chord_at(t + 1e-4)
    m = notes[pattern[step % 8]] + 12
    if t < 3:
        g, br = 0.35, 0.4
    elif t < 5:
        g, br = 0.4 + 0.25 * (t - 3) / 2, 0.6
    else:
        g, br = 0.62, 1.0
    if not (t < 5 and step % 2):  # 8ths before the bloom, 16ths after
        place(arp, pluck(m, bright=br), t, g * (1.0 if step % 4 == 0 else 0.72), pan=0.35 if step % 2 else -0.35)
    step += 1
    t += BEAT / 4

# Bass
place(bass, pad_voice(41, 2.0, att=0.5, rel=0.3), 3.0, 0.22)
t = 5.0
while t < 18.5 - 1e-6:
    root, _ = chord_at(t + 1e-4)
    for off, mm, d in ((0, root, 0.24), (0.25, root + 12, 0.16)):
        tb = tt(d)
        s = np.sin(2 * np.pi * hz(mm) * tb) + 0.3 * np.sin(4 * np.pi * hz(mm) * tb)
        s *= np.minimum(1, tb / 0.004) * np.minimum(1, (d - tb) / 0.03)
        place(bass, np.tanh(s * 1.4), t + off, 0.9 if off == 0 else 0.55)
    t += BEAT
tb = tt(3.0)
place(bass, np.sin(2 * np.pi * hz(48) * tb) * np.exp(-tb / 0.5) * np.minimum(1, tb / 0.005), 18.5, 0.6)

# The hook's pulse: soft bass on each beat, a soft kick on the half notes
for i in range(6):
    tb = tt(0.3)
    s_ = np.sin(2 * np.pi * hz(45) * tb) * np.exp(-tb / 0.12) * np.minimum(1, tb / 0.004)
    place(bass, s_, i * BEAT, 0.35 + 0.08 * i)
    if i % 2 == 0:
        place(drums, kick(0.6), i * BEAT, 0.42 + 0.1 * i); kicks.append(i * BEAT)

# Drums: a kick on 3.0, the groove from the bloom, a breath before the agents, a last hit on 18.5
place(drums, kick(1.3), 3.0, 1.0); kicks.append(3.0)
b = 0
t = 5.0
while t < 18.5 - 1e-6:
    breath = 15.5 <= t < 16.0
    if not breath:
        place(drums, kick(), t, 0.95); kicks.append(t)
        if b % 2 == 1:
            place(drums, clap(), t, 0.42, pan=0.05)
        place(drums, hat(), t + 0.25, 0.26, pan=0.3)
        if 13.0 <= t < 15.5:
            place(drums, hat(), t + 0.125, 0.14, pan=-0.25)
            place(drums, hat(), t + 0.375, 0.14, pan=-0.25)
    b += 1
    t += BEAT
for i in range(4):  # a small clap roll into the agents
    place(drums, clap(), 15.5 + i * 0.125, 0.16 + 0.07 * i, pan=0.05)
place(drums, kick(1.4), 18.5, 1.0); kicks.append(18.5)
crash = fft_filter(rng.standard_normal(int(1.8 * SR)) * np.exp(-tt(1.8) / 0.5), lo=5000)
place(drums, crash, 5.0, 0.11, pan=0.2)
place(drums, crash, 18.5, 0.13, pan=-0.2)

# Bells: the bloom, the name, the words, the outro
for i, m in enumerate((84, 88, 91)):
    place(bells, bell(m), 5.0 + i * 0.045, 0.34, pan=-0.2 + i * 0.2)
place(bells, bell(79), 7.0, 0.3, pan=-0.15)
place(bells, bell(84), 7.12, 0.3, pan=0.15)
for i, m in enumerate((84, 86, 88, 91)):  # Timers. Forms. Charts. Games.
    place(bells, bell(m, idx=1.6), 13.0 + i * 0.5, 0.26, pan=(-0.3 + i * 0.2))
for i, m in enumerate((72, 76, 79, 86)):  # the final chord, rolled
    place(bells, bell(m, d=3.0), 18.5 + i * 0.03, 0.3, pan=-0.3 + i * 0.2)
place(bells, bell(88, d=2.5, idx=1.2), 18.86, 0.16, pan=0.2)
place(bells, bell(91, d=2.5, idx=1.2), 19.22, 0.14, pan=-0.2)

# Effects, tuned and placed on the cuts
# the essay streaming: soft, fast ticks
t = 0.62
while t < 2.95:
    place(sfx, tick(rng.uniform(2600, 3600)), t, 0.05 + 0.05 * (t - 0.62) / 2.3, pan=rng.uniform(-0.5, 0.5))
    t += rng.uniform(0.028, 0.06) * (1.25 - 0.4 * (t - 0.62) / 2.3)
# the build as it floods
place(sfx, whoosh(1.45, 300, 6000, peak=0.97), 1.55, 0.22)
place(sfx, sweep(hz(57), hz(81), 1.4, tau=None) * np.linspace(0, 1, int(1.4 * SR)) ** 2, 1.6, 0.05)
# the delete: a quick downward zip
place(sfx, sweep(hz(93), hz(57), 0.5, tau=0.25), 3.0, 0.12)
place(sfx, whoosh(0.5, 5000, 400, peak=0.15), 3.0, 0.18)
# the line types: one key per character
for i in range(20):
    place(sfx, tick(2200 + (i % 4) * 180, 0.03), 3.72 + i * 0.05, 0.14, pan=-0.4)
# the bloom: a pop in key
place(sfx, pop(79), 4.98, 0.35)
# into the tap: a whoosh; the tap; the answer going out
place(sfx, whoosh(0.4, 600, 5000, peak=0.7), 9.2, 0.14)
tp = tt(0.06)
place(sfx, np.sin(2 * np.pi * hz(83) * tp) * np.exp(-tp / 0.012), 11.0, 0.22, pan=0.25)
place(sfx, pop(88), 11.04, 0.14, pan=0.25)
place(sfx, sweep(hz(76), hz(88), 0.12, tau=0.06), 11.36, 0.14, pan=0.25)
# the phone leaves, the wall arrives; the wall leaves
place(sfx, whoosh(0.5, 400, 7000, peak=0.6), 12.62, 0.2, pan=0.3)
place(sfx, whoosh(0.4, 7000, 600, peak=0.2), 15.72, 0.14, pan=-0.3)
# the agents pop in, up the pentatonic
for i, m in enumerate((72, 74, 76, 79, 81, 84, 86, 88, 91)):
    place(sfx, pop(m), 16.5 + i * 0.125, 0.22, pan=-0.6 + i * 0.15)

# ---------------------------------------------------------------- mix
# duck the pad and bass under the kick a little, so the groove breathes
tk = np.arange(N) / SR
duck = np.ones(N)
for k in kicks:
    i = int(k * SR)
    seg = tk[i:] - k
    duck[i:] = np.minimum(duck[i:], 1 - 0.3 * np.exp(-seg / 0.11))
pad *= duck
bass *= duck

pad = fft_filter(pad, hi=3200)
arp = fft_filter(arp, lo=180, hi=11000)
bass = fft_filter(bass, hi=900)

# one room for everything: a short, soft stereo reverb
ir_t = tt(1.8)
ir = np.stack([rng.standard_normal(len(ir_t)), rng.standard_normal(len(ir_t))]) * np.exp(-ir_t / 0.38)
ir[:, : int(0.012 * SR)] = 0
ir = fft_filter(ir, lo=200, hi=5500)
ir /= np.sqrt((ir ** 2).sum(axis=1, keepdims=True))

send = pad * 0.35 + arp * 0.35 + bells * 0.55 + sfx * 0.35 + drums * 0.08
L = N + ir.shape[1]
nfft = 1 << int(np.ceil(np.log2(L)))
wet = np.fft.irfft(np.fft.rfft(send, nfft, axis=1) * np.fft.rfft(ir, nfft, axis=1), nfft, axis=1)[:, :N]

mix = pad * 0.3 + arp * 0.52 + bass * 0.55 + drums * 0.66 + bells * 0.5 + sfx * 0.8 + wet * 0.2
mix = fft_filter(mix, lo=28)
fq = np.fft.rfftfreq(N, 1 / SR)
shelf = 1 + (10 ** (4 / 20) - 1) * (fq / 4000) ** 2 / (1 + (fq / 4000) ** 2)
mix = np.fft.irfft(np.fft.rfft(mix, axis=-1) * shelf, n=N, axis=-1)

# gentle glue: scale so the loudest moment only just touches the soft clipper
for name, x in (("pad", pad), ("arp", arp), ("bass", bass), ("drums", drums), ("bells", bells), ("sfx", sfx), ("wet", wet)):
    print(f"{name:6s} peak {np.abs(x).max():6.2f}  rms {np.sqrt((x ** 2).mean()):.3f}")
print("mix peak before glue", round(float(np.abs(mix).max()), 2))
mix /= np.abs(mix).max()
mix = np.tanh(mix * 1.3) / np.tanh(1.3)
fade = np.ones(N)
fi = int(0.01 * SR)
fade[:fi] = np.linspace(0, 1, fi)
fo0 = int(20.2 * SR)
fade[fo0:] = np.linspace(1, 0, N - fo0) ** 1.6
mix *= fade
mix *= 10 ** (-1 / 20) / np.abs(mix).max()

pcm = (np.clip(mix.T, -1, 1) * 32767).astype("<i2")
with wave.open(str(HERE / "music.wav"), "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(pcm.tobytes())
print("wrote music.wav", DUR, "s")
