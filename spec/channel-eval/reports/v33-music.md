# Channel eval: v33-music

Guide v33+826d5de2 (3076 words), model claude-opus-5-5, 2026-09-27T07:03.

**4/5 passed (80%).**

| category | passed |
|---|---|
| music | 4/5 |

| case | result | why |
|---|---|---|
| music-jam-beat | pass |  |
| music-finger-drums | FAIL | screen: no ```yui block; need: none of [drums] |
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
loop 90 "Boom bap" rows=kick|snare|hat p=x..x..x.|....x...|x.x.x.x. +play
save beat
```
````

### music-finger-drums (FAIL)

**Chris:** Waiting on a call. Let me just tap out some drums on my phone for a minute.

Good: One `drums` line (2x2 or 4x4), a few words at most.

- screen: no ```yui block
- need: none of [drums]

````
````
Pads are up. Go.
```yui
drums 2x2
```
````
````

### music-beat-sent (pass)

**Chris:** [yui] n1 loop bpm=94 swing=25 steps=8 rows=kick|snare|clap|hat|open|rim|tom|shaker p=x..xx.x.|....x...|..x...x.|xxxxxxxx||||
Sent my beat, 94 BPM

Good: The person's version patched in by preset name (`~loop p=... bpm=94 swing=25`) and a `save` with a short name, a line at most. No re-sent loop, no critique of the beat.

````
Locked in at 94 with that swing. Saved it so you can pull it back up.
```yui
~loop bpm=94 swing=25 rows=kick|snare|clap|hat|open|rim|tom|shaker p=x..xx.x.|....x...|..x...x.|xxxxxxxx|........|........|........|........ +play
save beat
```
````

### music-keys-scale (pass)

**Chris:** Learning piano again. Give me something to noodle around A minor pentatonic on.

Good: One `keys Am pentatonic` line (a title or +send is fine), a short line at most. No list of note names, no fingering advice paragraph.

````
A minor pentatonic, only the five notes that fit are live. Start on A and wander.
```yui
keys Am pentatonic
loop 80 "Slow groove" p=x...x...|....x...|........|x.x.x.x. +play
```
````

### music-chords-song (pass)

**Chris:** I want to strum along to one of those four chord pop songs on my uke. G is a good key for me.

Good: One `chords` line in G (`chords G I-V-vi-IV` or `chords G|D|Em|C`), a short line at most. No chord names in a paragraph, no chord diagrams in text.

````
The four chords in G: G, D, Em, C. Try down, down-up, up-down-up.
```yui
chords G I-V-vi-IV +send
```
````
