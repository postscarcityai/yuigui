# Channel eval: v33-tuner

Guide v33+2141ab40 (3080 words), model claude-opus-5-5, 2026-09-27T08:32.

**5/7 passed (71%).**

| category | passed |
|---|---|
| music | 5/7 |

| case | result | why |
|---|---|---|
| music-jam-beat | pass |  |
| music-finger-drums | pass |  |
| music-beat-sent | pass |  |
| music-keys-scale | pass |  |
| music-chords-song | pass |  |
| music-tuner-guitar | FAIL | preset: keys not in [tuner say card save]; preset: list not in [tuner say card save]; need: none of [tuner]; words: 39 > 30 |
| music-metronome-practice | FAIL | need: none of [metronome] |

## Transcripts

### music-jam-beat (pass)

**Chris:** Trying to get back into drumming. Give me a simple boom bap beat around 90 I can mess with.

Good: One `loop` line near 90 BPM with a boom bap pattern in `p=` that plays (`+play`), a short line at most. No pattern written out in words, no drum tab, no advice paragraph.

````
Classic boom bap at 90. Tap steps to change it while it plays.
```yui
loop 90 "Boom bap" p=x..x.x..|....x...|........|x.x.x.x. rows=kick|snare|clap|hat +play
```
````

### music-finger-drums (pass)

**Chris:** Waiting on a call. Let me just tap out some drums on my phone for a minute.

Good: One `drums` line (2x2 or 4x4), a few words at most.

````
Pads are up. Go.
```yui
drums 2x2
```
````

### music-beat-sent (pass)

**Chris:** [yui] n1 loop bpm=94 swing=25 steps=8 rows=kick|snare|clap|hat|open|rim|tom|shaker p=x..xx.x.|....x...|..x...x.|xxxxxxxx||||
Sent my beat, 94 BPM

Good: The person's version patched in by preset name (`~loop p=... bpm=94 swing=25`) and a `save` with a short name, a line at most. No re-sent loop, no critique of the beat.

````
Patch it in and save, nothing else.

```yui
~loop bpm=94 swing=25 p=x..xx.x.|....x...|..x...x.|xxxxxxxx
save beat
```
````

### music-keys-scale (pass)

**Chris:** Learning piano again. Give me something to noodle around A minor pentatonic on.

Good: One `keys Am pentatonic` line (a title or +send is fine), a short line at most. No list of note names, no fingering advice paragraph.

````
Wrong notes are locked out, so everything you hit fits. Start low on A, climb up, land back on A.

```yui
keys Am pentatonic
```
````

### music-chords-song (pass)

**Chris:** I want to strum along to one of those four chord pop songs on my uke. G is a good key for me.

Good: One `chords` line in G (`chords G I-V-vi-IV` or `chords G|D|Em|C`), a short line at most. No chord names in a paragraph, no chord diagrams in text.

````
The four chords in G: G, D, Em, C. Down, down-up, up-down-up.
```yui
chords G I-V-vi-IV
```
````

### music-tuner-guitar (FAIL)

**Chris:** Just restrung my acoustic and it sounds awful. Help me get it in tune.

Good: One `tuner guitar` line, a short line at most. No list of string notes and frequencies, no advice on tuning by ear.

- preset: keys not in [tuner say card save]
- preset: list not in [tuner say card save]
- need: none of [tuner]
- words: 39 > 30

````
New strings stretch and go flat fast. Tune up to pitch, gently pull each string away from the fretboard, then retune. Repeat 2–3 times. Match each string to these notes, low to high: **E A D G B E**.

```yui
keys Em pentatonic
list "Tune in order" "6th: low E" "5th: A" "4th: D" "3rd: G" "2nd: B" "1st: high E" +check
```
````

### music-metronome-practice (FAIL)

**Chris:** Working on my strumming timing. I want to practice slow, like 70 bpm in 4/4.

Good: One `metronome 70` line (beats=4 is fine), a short line at most. No paragraph of practice tips, no counting in words.

- need: none of [metronome]

````
70 bpm, kick on the one, hat on every beat. Strum along with the chords.
```yui
loop 70 "Strum click" rows=kick|hat p=x.......|x.x.x.x. +play
chords G I-V-vi-IV +send
save strum
```
````
