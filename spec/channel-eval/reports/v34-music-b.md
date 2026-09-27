# Channel eval: v34-music-b

Guide v34+85efb8bc (3122 words), model claude-opus-5-5, 2026-09-27T08:33.

**5/7 passed (71%).**

| category | passed |
|---|---|
| music | 5/7 |

| case | result | why |
|---|---|---|
| music-jam-beat | FAIL | screen: no ```yui block; need: none of [loop] |
| music-finger-drums | pass |  |
| music-beat-sent | pass |  |
| music-keys-scale | pass |  |
| music-chords-song | FAIL | preset: metronome not in [chords say card save loop] |
| music-tuner-guitar | pass |  |
| music-metronome-practice | pass |  |

## Transcripts

### music-jam-beat (FAIL)

**Chris:** Trying to get back into drumming. Give me a simple boom bap beat around 90 I can mess with.

Good: One `loop` line near 90 BPM with a boom bap pattern in `p=` that plays (`+play`), a short line at most. No pattern written out in words, no drum tab, no advice paragraph.

- screen: no ```yui block
- need: none of [loop]

````
````
Classic boom bap at 90. Tweak the hits while it plays.
```yui
loop 90 "Boom bap" p=x..x.x..|..x...x.|........|x.x.x.x. rows=kick|snare|clap|hat +play
```
````
````

### music-finger-drums (pass)

**Chris:** Waiting on a call. Let me just tap out some drums on my phone for a minute.

Good: One `drums` line (2x2 or 4x4), a few words at most.

````
Pads are up.
```yui
drums 2x2
```
````

### music-beat-sent (pass)

**Chris:** [yui] n1 loop bpm=94 swing=25 steps=8 rows=kick|snare|clap|hat|open|rim|tom|shaker p=x..xx.x.|....x...|..x...x.|xxxxxxxx||||
Sent my beat, 94 BPM

Good: The person's version patched in by preset name (`~loop p=... bpm=94 swing=25`) and a `save` with a short name, a line at most. No re-sent loop, no critique of the beat.

````
Locked in at 94.
```yui
~loop bpm=94 swing=25 rows=kick|snare|clap|hat|open|rim|tom|shaker p=x..xx.x.|....x...|..x...x.|xxxxxxxx||||
save beat
```
````

### music-keys-scale (pass)

**Chris:** Learning piano again. Give me something to noodle around A minor pentatonic on.

Good: One `keys Am pentatonic` line (a title or +send is fine), a short line at most. No list of note names, no fingering advice paragraph.

````
Here's a keyboard locked to A minor pentatonic, with a slow beat underneath. Nothing you hit can sound wrong.
```yui
loop 80 "Slow groove" p=x...x...|....x...|........|x.x.x.x. +play
keys Am pentatonic +send
```
````

### music-chords-song (FAIL)

**Chris:** I want to strum along to one of those four chord pop songs on my uke. G is a good key for me.

Good: One `chords` line in G (`chords G I-V-vi-IV` or `chords G|D|Em|C`), a short line at most. No chord names in a paragraph, no chord diagrams in text.

- preset: metronome not in [chords say card save loop]

````
The four-chord pop progression in G: G, D, Em, C.
```yui
chords G I-V-vi-IV
metronome 90
```
````

### music-tuner-guitar (pass)

**Chris:** Just restrung my acoustic and it sounds awful. Help me get it in tune.

Good: One `tuner guitar` line, a short line at most. No list of string notes and frequencies, no advice on tuning by ear.

````
New strings stretch for a day or two, so expect to retune a few times. Pull each one up gently, then tune again.
```yui
tuner guitar
```
````

### music-metronome-practice (pass)

**Chris:** Working on my strumming timing. I want to practice slow, like 70 bpm in 4/4.

Good: One `metronome 70` line (beats=4 is fine), a short line at most. No paragraph of practice tips, no counting in words.

````
Click's at 70. Strum on every beat first, then add the upstrokes between.
```yui
metronome 70
```
````
