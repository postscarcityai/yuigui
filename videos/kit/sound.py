"""Yui video kit: the sound. The voices are Yui's sound bank (site/app/playground/music/engine.js,
spec/MUSIC.md section 4), rendered offline with numpy. No samples, no services.

A video's music.py makes a Song, lays out sections with groove(), adds accents and taps on the
storyboard's times, and calls write(). Everything lands on the same clock the picture uses.
"""
import wave
from pathlib import Path

import numpy as np

SR = 48000
rng = np.random.default_rng(7)


def tt(d):
    return np.arange(max(1, int(d * SR))) / SR


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


# ---------------------------------------------------------------- drums
def kick(v=1.0):
    t = tt(0.7)
    f = 44 + (134 - 44) * np.exp(-t / 0.045)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * hit(t, v, 0.28)
    return drive(body + noise(len(t)) * hit(t, 0.25 * v, 0.002, 0.0005), 1.6) * 0.9


def snare(v=1.0):
    t = tt(0.6)
    n = fft_filter(noise(len(t)), lo=1200, hi=7500) * hit(t, 1.4 * v, 0.12)
    return drive(n + np.sin(2 * np.pi * 190 * t) * hit(t, 0.8 * v, 0.06), 1.3) * 0.8


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
    return (np.sin(2 * np.pi * 820 * t) * 0.7 + fft_filter(noise(len(t)), lo=400) * 0.3) * hit(t, v, 0.012, 0.0005)


def shaker(v=1.0):
    t = tt(0.2)
    return fft_filter(noise(len(t)), lo=5500) * hit(t, 1.4 * v, 0.035, 0.012)


def crash(v=1.0, d=2.6):
    t = tt(d)
    return fft_filter(noise(len(t)), lo=3500, hi=14000) * hit(t, 0.55 * v, 0.7)


# ---------------------------------------------------------------- pitched
def plucked(m, dur, v=0.8, tau=0.14, slow=1.0):
    t = tt(dur + 1.2)
    f = hz(m)
    s = np.sin(2 * np.pi * f * t)
    for k, a, dk in ((2, 0.35, 0.05), (3, 0.12, 0.03), (5, 0.06, 0.015)):
        s += np.sin(2 * np.pi * f * k * t) * hit(t, a, dk * slow, 0.001)
    rel = np.where(t > dur, np.exp(-(t - dur) / 0.05), 1.0)
    return s * hit(t, 0.45 * v, tau, 0.003) * rel


def keys(m, dur, v=0.8):
    return plucked(m, dur, v, tau=0.7, slow=1.8)


def pluck(m, dur, v=0.8):
    return plucked(m, dur, v, tau=0.14, slow=1.0)


def bell(m, dur=1.6, v=0.8):
    t = tt(max(dur, 1.6))
    f = hz(m)
    car = np.sin(2 * np.pi * f * t + 2.2 * np.exp(-t / 0.25) * np.sin(2 * np.pi * f * 3.5 * t))
    return (car * hit(t, 0.4 * v, 0.55) + np.sin(2 * np.pi * f * 2 * t) * hit(t, 0.1 * v, 0.3))


def pad(m, dur, v=0.8, att=0.35, rel=0.5):
    t = tt(dur + rel)
    f = hz(m)
    s = sum((2 / np.pi) * np.arcsin(np.sin(2 * np.pi * f * 2 ** (d / 1200) * t + rng.uniform(0, 6.28))) for d in (-7, 0, 6)) / 3
    env = 0.3 * v * np.minimum(1, t / att) * np.where(t > dur, np.exp(-(t - dur) / (rel / 3)), 1.0)
    return fft_filter(s * env, hi=3200)


def bass(m, dur, v=0.9):
    t = tt(dur + 0.1)
    f = hz(m)
    s = drive(np.sin(2 * np.pi * f * t) + 0.3 * np.sin(4 * np.pi * f * t), 1.4)
    return s * 0.55 * v * np.minimum(1, t / 0.01) * np.where(t > dur, np.exp(-(t - dur) / 0.027), 1.0)


def lead(m, dur, v=0.9):
    t = tt(dur + 0.3)
    f = hz(m)
    vib = 0.004 * f * np.minimum(1, t / 0.25) * np.sin(2 * np.pi * 5.2 * t)
    ph = np.cumsum(f + vib) / SR
    s = (2 * (ph % 1) - 1) * 0.5 + np.sign(np.sin(2 * np.pi * ph)) * 0.3
    env = 0.28 * v * np.minimum(1, t / 0.04) * np.where(t > dur, np.exp(-(t - dur) / 0.027), 1.0)
    return fft_filter(s * env, lo=250, hi=2400)


def pop(m=72, v=0.8):
    t = tt(0.35)
    f = hz(m) * (0.7 + 0.3 * np.minimum(1, t / 0.025))
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * hit(t, 0.8 * v, 0.05)


def tick(v=0.6, pitch=3000):
    t = tt(0.05)
    return (np.sin(2 * np.pi * pitch * t) * 0.6 + noise(len(t)) * 0.4) * hit(t, v, 0.004, 0.0005)


def tap(v=0.5):
    """A soft UI tap: a short tuned tock."""
    t = tt(0.07)
    return (np.sin(2 * np.pi * hz(84) * t) * 0.6 + fft_filter(noise(len(t)), lo=2500) * 0.25) * hit(t, v, 0.014)


def swell(d, v=0.5):
    """A soft noise rise into a cut."""
    t = tt(d)
    return fft_filter(noise(len(t)), lo=1500, hi=9000) * v * (t / d) ** 3


# ---------------------------------------------------------------- chords (theory.mjs chordNotes)
PC = {"C": 0, "D": 2, "E": 4, "F": 5, "G": 7, "A": 9, "B": 11}
QUALITY = {"": [0, 4, 7], "m": [0, 3, 7], "7": [0, 4, 7, 10], "maj7": [0, 4, 7, 11], "m7": [0, 3, 7, 10],
           "sus2": [0, 2, 7], "sus4": [0, 5, 7], "add9": [0, 4, 7, 14], "6": [0, 4, 7, 9], "m9": [0, 3, 7, 10, 14], "9": [0, 4, 7, 10, 14]}


def chord_notes(name):
    """The bass note (E2 to D#3) and the chord, root between G3 and F#4."""
    root = PC[name[0]] + (1 if name[1:2] == "#" else -1 if name[1:2] == "b" else 0)
    q = name[1 + (name[1:2] in ("#", "b")):]
    root %= 12
    top = 55 + (root - 7) % 12
    bass_ = 40 + (root - 4) % 12
    return [bass_] + [top + s for s in QUALITY[q]]


# ---------------------------------------------------------------- the song
class Song:
    def __init__(self, bpm, bars, swing=0):
        self.bpm, self.swing = bpm, swing
        self.step = 60 / bpm / 4
        self.bar = 16 * self.step
        self.dur = bars * self.bar
        self.N = int(round(self.dur * SR))
        self.stems = {k: np.zeros((2, self.N)) for k in ("drums", "bass", "keys", "pad", "lead", "fx", "taps")}

    def at(self, bar, step=0, swing=None):
        sw = self.swing if swing is None else swing
        return bar * self.bar + step * self.step + ((sw / 100) * self.step * 0.5 if step % 2 else 0)

    def add(self, stem, sig, t, g=1.0, pan=0.0):
        i = int(round(t * SR))
        if i >= self.N or i < 0:
            return
        sig = sig[: self.N - i]
        a = (pan + 1) * np.pi / 4
        self.stems[stem][0, i:i + len(sig)] += sig * g * np.cos(a)
        self.stems[stem][1, i:i + len(sig)] += sig * g * np.sin(a)

    def strum(self, t, name, dur=1.1, v=0.8, voice=keys, stem="keys", spread=0.025):
        for k, m in enumerate(chord_notes(name)):
            self.add(stem, voice(m, dur, v), t + k * spread, 1.2 if k == 0 else 0.9, pan=-0.3 + 0.15 * k)

    def taps(self, times, g=0.35):
        for t in times:
            self.add("taps", tap(), t, g, pan=0.1)

    def write(self, path, levels=None, fade=1.5):
        L = {"drums": 0.72, "bass": 0.8, "keys": 0.9, "pad": 0.55, "lead": 0.8, "fx": 0.6, "taps": 0.8,
             "sub": 0.34, "wob": 0.85, "skank": 0.62, "throw": 0.0}
        L.update(levels or {})
        s = self.stems
        if "skank" in s:  # the dub: a tape echo on the stabs, rims and melodica, the sub ducked under each kick
            s["echo"] = dub_delay(s["skank"] * 0.9 + s["throw"], 0.75 * 4 * self.step)
            L.setdefault("echo", 0.55)
            tk = np.arange(self.N) / SR
            duck = np.ones(self.N)
            for k in getattr(self, "kicks", []):
                i = int(k * SR)
                duck[i:] = np.minimum(duck[i:], 1 - 0.55 * np.exp(-(tk[i:] - k) / 0.13))
            s["sub"] = fft_filter(s["sub"] * duck, hi=160)
            s["wob"] = fft_filter(s["wob"] * (0.35 + 0.65 * duck), lo=55, hi=3200)
        room_in = s["keys"] * 0.9 + s["pad"] * 0.7 + s["lead"] * 0.8 + s["fx"] * 0.6 + s.get("skank", 0) * 0.35 + s.get("echo", 0) * 0.25
        ir_t = tt(1.6)
        ir = np.stack([noise(len(ir_t)), noise(len(ir_t))]) * np.exp(-ir_t / 0.33)
        ir[:, : int(0.012 * SR)] = 0
        ir = fft_filter(ir, lo=250, hi=5000)
        ir /= np.sqrt((ir ** 2).sum(axis=1, keepdims=True))
        n = self.N + ir.shape[1]
        nfft = 1 << int(np.ceil(np.log2(n)))
        wet = np.fft.irfft(np.fft.rfft(room_in, nfft, axis=1) * np.fft.rfft(ir, nfft, axis=1), nfft, axis=1)[:, : self.N]
        mix = sum(s[k] * L[k] for k in s) + wet * 0.28
        mix = fft_filter(mix, lo=30)
        mix = limit(mix)
        env = np.ones(self.N)
        fo = int((self.dur - fade) * SR)
        env[fo:] = np.linspace(1, 0, self.N - fo) ** 1.5
        mix = np.clip(mix * env, -10 ** (-1.5 / 20), 10 ** (-1.5 / 20))
        pcm = (mix.T * 32767).astype("<i2")
        Path(path).parent.mkdir(parents=True, exist_ok=True)
        with wave.open(str(path), "wb") as w:
            w.setnchannels(2)
            w.setsampwidth(2)
            w.setframerate(SR)
            w.writeframes(pcm.tobytes())
        print(f"wrote {path} ({self.dur:.2f} s)")


def limit(x, ceiling_db=-1.5, push_db=4.0, block=120, look=3, release=0.08):
    """Look-ahead peak limiter: clean waveform, so the AAC encode stays under the ceiling."""
    x = x / (np.abs(x).max() + 1e-12) * 10 ** ((ceiling_db + push_db) / 20)
    thr = 10 ** (ceiling_db / 20)
    nb = int(np.ceil(x.shape[1] / block))
    pad_ = np.zeros((2, nb * block))
    pad_[:, : x.shape[1]] = x
    peak = np.abs(pad_).reshape(2, nb, block).max(axis=(0, 2))
    g = np.minimum(1.0, thr / np.maximum(peak, 1e-9))
    g = np.array([g[max(0, i - 1): i + look + 1].min() for i in range(nb)])
    a = np.exp(-block / SR / release)
    out, cur = np.empty_like(g), 1.0
    for i, v in enumerate(g):
        cur = v if v < cur else a * cur + (1 - a) * v
        out[i] = cur
    gs = np.interp(np.arange(nb * block), np.arange(nb) * block + block / 2, out)[: x.shape[1]]
    return x * gs


# ---------------------------------------------------------------- the arranger
KICK = "x.......x.x....."
KICK_B = "x......x..x....."
SNARE = "....x.......x..."
HATS = "x.x.x.x.x.x.x.x."
COMP = [(0, 1.1), (6, 0.6), (10, 1.3)]


def groove(song, sections, prog, motif=None):
    """sections: [(first bar, bar after last, level)]. prog: chord names, one a bar, cycled.
    Levels: 1 a pad; 2 keys, a soft beat and bass; 3 the full groove; 4 the full groove and the motif.
    motif: {bar offset in a 4-bar cycle: [(step, steps long, midi)]} for the lead."""
    for a, z, level in sections:
        for b in range(a, z):
            ch = prog[b % len(prog)]
            notes = chord_notes(ch)
            if level >= 1:
                for m in notes[1:]:
                    song.add("pad", pad(m, song.bar * 0.98, 0.7 if level == 1 else 0.45), song.at(b), 1.0, pan=0.0)
            if level >= 2:
                for k, d in COMP:
                    song.strum(song.at(b, k), ch, d, 0.62 if k else 0.75)
                song.add("bass", bass(notes[0] - 12, song.bar * 0.55), song.at(b), 1.0)
                song.add("bass", bass(notes[0] - 12, song.step * 3), song.at(b, 10), 0.8)
                for k in range(16):
                    if HATS[k] == "x":
                        song.add("drums", hat(0.45 if k % 4 else 0.6), song.at(b, k), 0.5 if level >= 3 else 0.32, pan=0.25)
                if level == 2:
                    song.add("drums", rim(), song.at(b, 4), 0.45)
                    song.add("drums", rim(), song.at(b, 12), 0.45)
            if level >= 3:
                kp = KICK if b % 2 == 0 else KICK_B
                for k in range(16):
                    if kp[k] == "x":
                        song.add("drums", kick(), song.at(b, k), 0.62)
                    if SNARE[k] == "x":
                        song.add("drums", snare(), song.at(b, k), 0.9)
                song.add("drums", shaker(0.6), song.at(b, 14), 0.4, pan=-0.3)
            if level >= 4 and motif:
                for k, n, m in motif.get((b - a) % 4, []):
                    t0 = song.at(b, k)
                    t1 = song.at(b, k + n) if k + n < 16 else song.at(b + 1)
                    song.add("lead", lead(m, t1 - t0 - 0.03), t0, 1.0, pan=0.15)


def accent(song, t, kind="crash"):
    if kind == "crash":
        song.add("fx", crash(), t, 0.25, pan=0.2)
    elif kind == "swell":
        song.add("fx", swell(song.bar / 2), t - song.bar / 2, 0.35)
    elif kind == "kick":
        song.add("drums", kick(1.2), t, 0.75)


# ---------------------------------------------------------------- the house sound: dub
# Every Yui video is scored in dub: a heavy sub under each chord, a wobble bass that opens and
# closes on the beat ("womp"), offbeat chord stabs thrown into a tape echo, a one-drop beat
# (kick and snare on 3), a siren into the drops, a melodica line. From 02 Plan to launch.

def sub_note(m, d, att=0.01, rel=0.08):
    t = tt(d)
    env = np.minimum(1, t / att) * np.minimum(1, np.maximum(0, (d - t) / rel))
    return drive(np.sin(2 * np.pi * hz(m) * t), 1.3) * env


def svf_lowpass(x, cut, damp=0.35):
    fcoef = 2 * np.sin(np.pi * np.minimum(cut, SR / 7) / SR)
    low = band = 0.0
    y = np.empty_like(x)
    for i in range(len(x)):
        high = x[i] - low - damp * band
        band += fcoef[i] * high
        low += fcoef[i] * band
        y[i] = low
    return y


def wobble(m, d, step, segs, cmin=110.0, cmax=1100.0):
    """Detuned saws and a square through a resonant lowpass an LFO opens and closes.
    segs: (start step, steps, LFO cycles per beat)."""
    t = tt(d)
    f = hz(m)
    saw_ = lambda ph: 2 * (ph % 1.0) - 1
    x = saw_(f * t) * 0.55 + saw_(f * 1.006 * t + 0.3) * 0.55 + np.sign(np.sin(np.pi * f * t)) * 0.45
    lfo, amp = np.zeros_like(t), np.zeros_like(t)
    beat = 4 * step
    for sb, nb, rate in segs:
        a, z = int(sb * step * SR), min(len(t), int((sb + nb) * step * SR))
        if z <= a:
            continue
        tl = np.arange(z - a) / SR
        lfo[a:z] = 0.5 - 0.5 * np.cos(2 * np.pi * ((tl / beat * rate) % 1.0))
        amp[a:z] = np.minimum(1, tl / 0.006) * np.minimum(1, np.maximum(0, ((z - a) / SR - tl) / 0.025))
    return np.tanh(svf_lowpass(x * amp, cmin * (cmax / cmin) ** lfo) * 2.4) * 0.8


def skank(notes, d=0.16):
    t = tt(d)
    s = np.zeros_like(t)
    for m in notes:
        f = hz(m)
        s += (2 * ((f * t + rng.uniform()) % 1) - 1) * 0.5 + np.sign(np.sin(2 * np.pi * f * 1.003 * t)) * 0.25
    s = fft_filter(s * np.exp(-t / 0.055) * np.minimum(1, t / 0.002), lo=450, hi=2600)
    return s / (np.abs(s).max() + 1e-9)


def siren(d, f0=520, f1=1250, rate=2.2):
    t = tt(d)
    ph = (np.cumsum(rate * (1 + t / d)) / SR) % 1.0
    return np.sin(2 * np.pi * np.cumsum(f0 * (f1 / f0) ** ph) / SR) * np.minimum(1, t / 0.3) * np.minimum(1, (d - t) / 0.2)


def dub_delay(x, delay, fb=0.58, lo=300, hi=2200, repeats=10):
    """Tape echo: each repeat darker and thinner, bouncing left and right."""
    D = int(round(delay * SR))
    out, e = np.zeros_like(x), x.copy()
    for k in range(1, repeats + 1):
        e = np.roll(e, D, axis=1)
        e[:, :D] = 0
        e = fft_filter(e, lo=lo, hi=hi, order=1) * fb
        if k % 2:
            e = e[::-1]
        out += e
    return out


WOB_A = [(0, 6, 1.0), (6, 2, 2.0), (8, 8, 1.0)]
WOB_B = [(0, 4, 1.0), (4, 4, 1.0), (8, 4, 1.5), (12, 4, 3.0)]
WOB_HEAVY = [(0, 4, 2.0), (4, 4, 1.0), (8, 2, 4.0), (10, 2, 4.0), (12, 4, 3.0)]


def dub(song, sections, prog, motif=None):
    """The house arranger. sections: [(first bar, bar after last, level)], prog: one chord a bar.
    1 sub swells, skank and echo; 2 adds a soft one-drop and the sub on the bar; 3 the full groove
    with the wobble; 4 heavier wobble and the melodica motif. motif as in groove()."""
    for key in ("sub", "wob", "skank", "throw"):
        song.stems.setdefault(key, np.zeros((2, song.N)))
    song.kicks = getattr(song, "kicks", [])
    for a, z, level in sections:
        for b in range(a, z):
            ch = prog[b % len(prog)]
            notes = chord_notes(ch)
            root = notes[0] - 12
            t0 = song.at(b, swing=0)
            if level >= 1:
                for beat in (1, 3):
                    song.add("skank", skank(notes[1:]), song.at(b, beat * 4, 0), 0.85 if level < 3 else 0.5, pan=-0.25 if beat == 1 else 0.25)
            if level == 1:
                song.add("sub", sub_note(root, song.bar, att=0.35, rel=0.3), t0, 0.8)
                song.add("drums", rim(), song.at(b, 8, 0), 0.5, pan=-0.2)
                song.add("throw", rim(), song.at(b, 8, 0), 0.35)
            if level >= 2:
                song.add("sub", sub_note(root, song.bar * 0.98, att=0.004), t0, 0.9)
                song.add("drums", kick(), song.at(b, 8, 0), 0.9); song.kicks.append(song.at(b, 8, 0))
                song.add("drums", snare(), song.at(b, 8, 0), 0.62 if level == 2 else 0.75)
                for k in range(0, 16, 2):
                    song.add("drums", hat(), song.at(b, k), 0.2 if k % 4 else 0.12, pan=0.3)
            if level >= 3:
                song.add("drums", kick(), t0, 0.95); song.kicks.append(t0)
                if b % 2:
                    song.add("drums", kick(0.7), song.at(b, 10, 0), 0.55); song.kicks.append(song.at(b, 10, 0))
                segs = WOB_HEAVY if level >= 4 else (WOB_B if b % 4 == 3 else WOB_A)
                song.add("wob", wobble(notes[0], song.bar, song.step, segs, cmax=1700 if level >= 4 else 1050), t0, 0.55)
            if level >= 4:
                for k in range(2, 16, 4):
                    song.add("drums", hat(True), song.at(b, k), 0.05, pan=-0.3)
                if motif:
                    for k, n, m in motif.get((b - a) % 4, []):
                        t1 = song.at(b, k + n) if k + n < 16 else song.at(b + 1)
                        song.add("lead", lead(m, t1 - song.at(b, k) - 0.03), song.at(b, k), 1.0, pan=0.15)
                        song.add("throw", lead(m, t1 - song.at(b, k) - 0.03), song.at(b, k), 0.3)


def drop(song, t, bars_before=1.5):
    """A siren and a reverse swell into a drop at t, and the hit on it."""
    d = bars_before * song.bar
    song.add("fx", siren(d), t - d, 0.12, pan=0.35)
    song.add("fx", swell(song.bar), t - song.bar, 0.3)
    song.add("fx", crash(), t, 0.22, pan=0.15)
    song.add("drums", snare(1.6), t, 0.5)
