# Channel eval: v32-music

Guide v32+7f658247 (3024 words), model claude-opus-5-5, 2026-09-27T07:03.

**3/5 passed (60%).**

| category | passed |
|---|---|
| music | 3/5 |

| case | result | why |
|---|---|---|
| music-jam-beat | pass |  |
| music-finger-drums | pass |  |
| music-beat-sent | pass |  |
| music-keys-scale | FAIL | need: none of [keys] |
| music-chords-song | FAIL | need: none of [chords] |

## Transcripts

### music-jam-beat (pass)

**Chris:** Trying to get back into drumming. Give me a simple boom bap beat around 90 I can mess with.

Good: One `loop` line near 90 BPM with a boom bap pattern in `p=` that plays (`+play`), a short line at most. No pattern written out in words, no drum tab, no advice paragraph.

````
Classic boom bap at 90 with a little swing. Tap steps to change it while it plays.

```yui
loop 90 "Boom bap" rows=kick|snare|hat p=x..x.x..|..x...x.|xxxxxxxx swing=20 +play
drums 2x2
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
Locked in at 94 with that swing. Saved it to your shelf.
```yui
~loop bpm=94 swing=25 steps=8 rows=kick|snare|clap|hat|open|rim|tom|shaker p=x..xx.x.|....x...|..x...x.|xxxxxxxx||||
save beat
```
````

### music-keys-scale (FAIL)

**Chris:** Learning piano again. Give me something to noodle around A minor pentatonic on.

Good: One `keys Am pentatonic` line (a title or +send is fine), a short line at most. No list of note names, no fingering advice paragraph.

- need: none of [keys]

````
Groove's running. Stay on A, C, D, E and G, all white keys, and nothing clashes.

```yui
loop 84 "Am pentatonic jam" rows=kick|snare|hat|shaker p=x.....x.|....x...|x.x.x.x.|.x.x.x.x +play
save beat
```
````

### music-chords-song (FAIL)

**Chris:** I want to strum along to one of those four chord pop songs on my uke. G is a good key for me.

Good: One `chords` line in G (`chords G I-V-vi-IV` or `chords G|D|Em|C`), a short line at most. No chord names in a paragraph, no chord diagrams in text.

- need: none of [chords]

````
G, D, Em, C: one bar each, strum down, down-up, up-down-up.

```yui
loop 100 "Four chord pop" rows=kick|snare|hat p=x...x.x.|..x...x.|xxxxxxxx +play
card "G  D  Em  C" body="G 0232 · D 2220 · Em 0432 · C 0003 (strings G C E A)"
```
````
