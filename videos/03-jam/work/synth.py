"""The jam's sound, from score.json, with the voices of Yui's sound bank
(site/app/playground/music/engine.js, spec/MUSIC.md section 4): the same
recipes, rendered offline with numpy. Writes music.wav (48 kHz stereo)."""
import json
import wave
from pathlib import Path

import numpy as np

HERE = Path(__file__).resolve().parent
S = json.loads((HERE / "score.json").read_text())
SR = 48000
END = S["end"]
N = int(round(END * SR))
rng = np.random.default_rng(90)


def tt(d):
    return np.arange(int(d * SR)) / SR


def hz(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def fft_filter(x, lo=None, hi=None, order=2):
    n = x.shape[-1]
    f = np.fft.rfftfreq(n, 1 / SR)
    h = np.ones_like(f)
    if hi:
        h *= 1 / np.sqrt(1 + (f / hi) ** (2 * order))
    if lo:
        h *= 1 / np.sqrt(1 + (lo / np.maximum(f, 1e-6)) ** (2 * order))
    return np.fft.irfft(np.fft.rfft(x, axis=-1) * h, n=n, axis=-1)


def drive(x, k):
    return np.tanh(x * k) / np.tanh(k)


def hit(t, peak, tau, att=0.002):
    return peak * np.minimum(1, t / att) * np.exp(-t / tau)


def noise(n):
    return rng.standard_normal(n)


# ---------------------------------------------------------------- drums (engine.js DRUM)
def kick(v=1.0):
    t = tt(0.7)
    f = 44 + (134 - 44) * np.exp(-t / 0.045)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * hit(t, v, 0.28)
    click = noise(len(t)) * hit(t, 0.25 * v, 0.002, 0.0005)
    return drive(body + click, 1.6) * 0.9


def snare(v=1.0):
    t = tt(0.6)
    n = fft_filter(noise(len(t)), lo=1200, hi=7500) * hit(t, 1.4 * v, 0.12)
    body = np.sin(2 * np.pi * 190 * t) * hit(t, 0.8 * v, 0.06)
    return drive(n + body, 1.3) * 0.8


def clap(v=1.0):
    t = tt(0.45)
    n = fft_filter(noise(len(t)), lo=900, hi=4200)
    env = np.zeros_like(t)
    for o in (0, 0.011, 0.022):
        env = np.maximum(env, np.where(t >= o, 1.3 * v * np.exp(-(t - o) / 0.008), 0))
    return n * env + n * hit(t, 0.8 * v, 0.09)


def hat(v=1.0, open_=False):
    t = tt(0.5 if open_ else 0.1)
    return fft_filter(noise(len(t)), lo=7000) * hit(t, 0.9 * v, 0.08 if open_ else 0.018, 0.001)


def rim(v=1.0):
    t = tt(0.1)
    s = np.sin(2 * np.pi * 820 * t) * 0.7 + fft_filter(noise(len(t)), lo=400) * 0.3
    return s * hit(t, v, 0.012, 0.0005)


DRUM = {"kick": kick, "snare": snare, "clap": clap, "hat": hat, "open": lambda v=1.0: hat(v, True), "rim": rim}

# ---------------------------------------------------------------- pitched (engine.js TONE)
def keys(m, dur, v=0.75):
    """plucked(tau 0.7, slow 1.8): a sine and three harmonics, each with its own decay."""
    d = dur + 1.2
    t = tt(d)
    f = hz(m)
    s = np.sin(2 * np.pi * f * t)
    for k, a, dk in ((2, 0.35, 0.05), (3, 0.12, 0.03), (5, 0.06, 0.015)):
        s += np.sin(2 * np.pi * f * k * t) * hit(t, a, dk * 1.8, 0.001)
    env = hit(t, 0.45 * v, 0.7, 0.003)
    rel = np.where(t > dur, np.exp(-(t - dur) / 0.05), 1.0)  # a release shortens the tail
    return s * env * rel


def lead(m, dur, v=0.9):
    """saw and square with a slow vibrato, band-passed 250 to 2400 Hz, held."""
    d = dur + 0.3
    t = tt(d)
    f = hz(m)
    vib = 0.004 * f * np.minimum(1, t / 0.25) * np.sin(2 * np.pi * 5.2 * t)
    ph = np.cumsum(f + vib) / SR
    s = (2 * (ph % 1) - 1) * 0.5 + np.sign(np.sin(2 * np.pi * ph)) * 0.3
    env = 0.28 * v * np.minimum(1, t / 0.04) * np.where(t > dur, np.exp(-(t - dur) / (0.08 / 3)), 1.0)
    return fft_filter(s * env, lo=250, hi=2400)


# ---------------------------------------------------------------- render the main timeline
drums = np.zeros(N)
pitched = np.zeros((2, N))


def add(dst, sig, t, g=1.0, pan=0.0):
    i = int(round(t * SR))
    if i >= N:
        return
    sig = sig[: N - i]
    if dst.ndim == 1:
        dst[i:i + len(sig)] += sig * g
    else:
        a = (pan + 1) * np.pi / 4
        dst[0, i:i + len(sig)] += sig * g * np.cos(a)
        dst[1, i:i + len(sig)] += sig * g * np.sin(a)


LEVEL = {"kick": 0.62, "snare": 1.0, "clap": 0.75, "hat": 0.5, "open": 0.42, "rim": 0.55}
for t, r in S["drums"]:
    add(drums, DRUM[r](), t, LEVEL[r])
# the ending: one last kick under the final chord
add(drums, kick(1.1), S["final"], 1.0)

VOICING = {"G": [43, 55, 59, 62], "D": [50, 62, 66, 69], "Em": [40, 64, 67, 71], "C": [48, 60, 64, 67]}
for t, ch, d, rec in S["strums"]:
    for k, m in enumerate(VOICING[ch]):          # strum down, 25 ms a string
        add(pitched, keys(m, d), t + k * 0.025, 0.9 if k else 1.2, pan=-0.3 + 0.2 * k)
for t, m, d in S["lead"]:
    add(pitched, lead(m, d), t, 1.0, pan=0.15)

# One mixer (spec section 3): a small room on the pitched voices, then a soft limiter.
ir_t = tt(1.4)
ir = np.stack([noise(len(ir_t)), noise(len(ir_t))]) * np.exp(-ir_t / 0.3)
ir[:, : int(0.012 * SR)] = 0
ir = fft_filter(ir, lo=250, hi=5000)
ir /= np.sqrt((ir ** 2).sum(axis=1, keepdims=True))
L = N + ir.shape[1]
nfft = 1 << int(np.ceil(np.log2(L)))
wet = np.fft.irfft(np.fft.rfft(pitched, nfft, axis=1) * np.fft.rfft(ir, nfft, axis=1), nfft, axis=1)[:, :N]

main = np.stack([drums, drums]) * 0.72 + pitched + wet * 0.3

# ---------------------------------------------------------------- the cold open: bars 18 and 19, then a tape stop
cold_end, shift = S["cold"]
ce, sh = int(round(cold_end * SR)), int(round(shift * SR))
cold = main[:, sh:sh + ce].copy()
stop_d = 0.42
k0 = ce - int(stop_d * SR)
tau = np.arange(ce - k0) / SR
rate = (1 - tau / stop_d) ** 1.6                   # the tape slows to a halt
pos = k0 + np.cumsum(rate)
for ch in range(2):
    cold[ch, k0:] = np.interp(pos, np.arange(ce), cold[ch]) * (1 - (tau / stop_d) ** 3)
main[:, :ce] += cold
# a quiet room between the rewind and the first kick
room = fft_filter(noise(int((S["loop"][0] - cold_end) * SR)), lo=300, hi=3000) * 0.006
main[:, ce:ce + len(room)] += room

for name, x in (("drums", drums), ("pitched", pitched), ("wet", wet)):
    print(f"{name:8s} peak {np.abs(x).max():5.2f} rms {np.sqrt((x ** 2).mean()):.4f}")

mix = fft_filter(main, lo=30)


def limit(x, ceiling_db=-1.5, push_db=4.0, block=120, look=3, release=0.08):
    """A look-ahead peak limiter: gain from 2.5 ms block peaks, applied a few blocks
    early, released smoothly. Keeps the waveform clean, so the AAC encode stays under the ceiling."""
    x = x / np.abs(x).max() * 10 ** ((ceiling_db + push_db) / 20)
    thr = 10 ** (ceiling_db / 20)
    nb = int(np.ceil(x.shape[1] / block))
    pad = np.zeros((2, nb * block))
    pad[:, : x.shape[1]] = x
    peak = np.abs(pad).reshape(2, nb, block).max(axis=(0, 2))
    g = np.minimum(1.0, thr / np.maximum(peak, 1e-9))
    g = np.array([g[max(0, i - 1): i + look + 1].min() for i in range(nb)])   # look ahead
    a = np.exp(-block / SR / release)
    out = np.empty_like(g)
    cur = 1.0
    for i, v in enumerate(g):
        cur = v if v < cur else a * cur + (1 - a) * v                         # instant attack, smooth release
        out[i] = cur
    gs = np.interp(np.arange(nb * block), np.arange(nb) * block + block / 2, out)[: x.shape[1]]
    return x * gs


mix = limit(mix)
fade = np.ones(N)
fo = int((END - 1.5) * SR)
fade[fo:] = np.linspace(1, 0, N - fo) ** 1.5
mix *= fade
mix = np.clip(mix, -10 ** (-1.5 / 20), 10 ** (-1.5 / 20))
pcm = (np.clip(mix.T, -1, 1) * 32767).astype("<i2")
with wave.open(str(HERE / "music.wav"), "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(pcm.tobytes())
print("wrote music.wav", END, "s")
