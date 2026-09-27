# Channel eval: v33-music-2b

Guide v33+2141ab40 (3080 words), model claude-opus-5-5, 2026-09-27T07:22.

**5/5 passed (100%).**

| category | passed |
|---|---|
| music | 5/5 |

| case | result | why |
|---|---|---|
| music-jam-beat | pass |  |
| music-finger-drums | pass |  |
| music-beat-sent | pass |  |
| music-keys-scale | pass |  |
| music-chords-song | pass |  |

## Transcripts

### music-jam-beat (pass)

**Chris:** Trying to get back into drumming. Give me a simple boom bap beat around 90 I can mess with.

Good: One `loop` line near 90 BPM with a boom bap pattern in `p=` that plays (`+play`), a short line at most. No pattern written out in words, no drum tab, no advice paragraph.

````
Classic boom bap at 90. Tap steps to change it while it plays.

```yui
loop 90 "Boom bap" rows=kick|snare|hat p=x.....x.|..x...x.|x.x.x.x. +play
save beat
```
````

### music-finger-drums (pass)

**Chris:** Waiting on a call. Let me just tap out some drums on my phone for a minute.

Good: One `drums` line (2x2 or 4x4), a few words at most.

````
Pads are up. Have fun.
```yui
drums 2x2
```
````

### music-beat-sent (pass)

**Chris:** [yui] n1 loop bpm=94 swing=25 steps=8 rows=kick|snare|clap|hat|open|rim|tom|shaker p=x..xx.x.|....x...|..x...x.|xxxxxxxx||||
Sent my beat, 94 BPM

Good: The person's version patched in by preset name (`~loop p=... bpm=94 swing=25`) and a `save` with a short name, a line at most. No re-sent loop, no critique of the beat.

````
Patch it in, save it, nothing else.

```yui
~loop bpm=94 swing=25 steps=8 rows=kick|snare|clap|hat|open|rim|tom|shaker p=x..xx.x.|....x...|..x...x.|xxxxxxxx||||
save beat
```
````

### music-keys-scale (pass)

**Chris:** Learning piano again. Give me something to noodle around A minor pentatonic on.

Good: One `keys Am pentatonic` line (a title or +send is fine), a short line at most. No list of note names, no fingering advice paragraph.

````
Only the A minor pentatonic notes are live, so nothing you play will clash. Start on A and wander.
```yui
keys Am pentatonic
```
````

### music-chords-song (pass)

**Chris:** I want to strum along to one of those four chord pop songs on my uke. G is a good key for me.

Good: One `chords` line in G (`chords G I-V-vi-IV` or `chords G|D|Em|C`), a short line at most. No chord names in a paragraph, no chord diagrams in text.

````
G, C, D, Em: the four-chord loop behind hundreds of pop songs.
```yui
chords G I-V-vi-IV
```
````
