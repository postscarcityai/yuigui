# Channel eval: v30-music

Guide v30+06701c19 (2710 words), model claude-opus-5-5, 2026-09-26T22:03.

**0/3 passed (0%).**

| category | passed |
|---|---|
| music | 0/3 |

| case | result | why |
|---|---|---|
| music-jam-beat | FAIL | preset: table not in [loop drums say card save]; preset: choose not in [loop drums say card save]; need: none of [loop] |
| music-finger-drums | FAIL | preset: game not in [drums loop say]; need: none of [drums] |
| music-beat-sent | FAIL | need: none of [save]; patch: no ~ patch matching /^loop$/; patch: re-sent a loop instead of patching |

## Transcripts

### music-jam-beat (FAIL)

**Chris:** Trying to get back into drumming. Give me a simple boom bap beat around 90 I can mess with.

Good: One `loop` line near 90 BPM with a boom bap pattern in `p=` that plays (`+play`), a short line at most. No pattern written out in words, no drum tab, no advice paragraph.

- preset: table not in [loop drums say card save]
- preset: choose not in [loop drums say card save]
- need: none of [loop]

````
Here's a 90 BPM boom bap groove in 16ths. Swing the hats a little (about 55–60%) and lay back on the snare.

```yui
table "Boom bap, 90 BPM" Voice|"Beats 1–2"|"Beats 3–4" "Count|1 e & a 2 e & a|3 e & a 4 e & a" "Hat|x . x . x . x .|x . x . x . x ." "Snare|. . . . x . . .|. . . . x . . ." "Kick|x . . . . . . x|. . x . . . . ."
choose "Next variation?" "Ghost snares"|"Busier kick"|"Open hat on 4&"|"Drop to 85" +other
save boombap
```
````

### music-finger-drums (FAIL)

**Chris:** Waiting on a call. Let me just tap out some drums on my phone for a minute.

Good: One `drums` line (2x2 or 4x4), a few words at most.

- preset: game not in [drums loop say]
- need: none of [drums]

````
No drum pad in Yui, sorry. Snake's the closest thing to idle tapping.

```yui
game snake
```
````

### music-beat-sent (FAIL)

**Chris:** [yui] n1 loop bpm=94 swing=25 steps=8 rows=kick|snare|clap|hat|open|rim|tom|shaker p=x..xx.x.|....x...|..x...x.|xxxxxxxx||||
Sent my beat, 94 BPM

Good: The person's version patched in by preset name (`~loop p=... bpm=94 swing=25`) and a `save` with a short name, a line at most. No re-sent loop, no critique of the beat.

- need: none of [save]
- patch: no ~ patch matching /^loop$/
- patch: re-sent a loop instead of patching

````
That syncopated kick against the steady hats grooves. Here's a B section to trade with, same tempo, with a tom fill at the end.
```yui
loop 94 "Jam B" p=x...x.x.|....x...|..x...xx|xx.xxx.x|..x...x.|.x......|.....xxx|x.x.x.x. +play
```
````
