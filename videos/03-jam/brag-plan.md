# Brag plan: jam with your agent (music tools, YUI-116)

## Angle

A live jam, built one message at a time. It opens on the finished jam, rewinds to an empty chat, then builds it back: a beat, your edits, the agent's patch, chords you record on a circle of fifths, and a solo where every key fits. Send hands it back and the agent saves it.

## How it is made

- `score.py` writes the whole jam once: every drum hit, chord strum and solo note, at 90 BPM with the looper's own swing rule (`stepTime` in `site/lib/music/theory.mjs`).
- `comp.html` draws the phone from `score.js`, so each lit cell, lit chord and pressed key is a hit you hear.
- `synth.py` plays `score.json` with Yui's sound bank: the recipes in `site/app/playground/music/engine.js` (spec/MUSIC.md section 4), rendered offline with numpy. It uses no samples and no library, and the voicings come from `chordNotes` in theory.mjs.
- The only effects that aren't the app's sound are the tape stop after the cold open and a quiet room tone before the first kick.

## Storyboard (90 BPM, a bar is 2.67s, 24 bars is 64s)

| Time | Scene | Left | Right | Line |
|---|---|---|---|---|
| 0 to 5.3 | Cold open: the solo over G and D, keys lighting, then a tape stop and a blur back to an empty chat | This jam started | with one message. | |
| 5.3 to 13.3 | "Make me a beat to jam over." The loop lands on screen 2 and starts on the next bar | Ask for a beat. | It starts on the next bar. | `>2 loop 90 "Late night" steps=16 +play …` |
| 13.3 to 18.7 | Two taps: a kick on step 16, an open hat on 15. It keeps playing | Tap to change it. | It never stops. | |
| 18.7 to 24 | "Swing it, and put a clap on the snare." The patch lands on bar 8: swing 50, a clap, rims | Ask for changes. | They land on the beat. | `~loop swing=50 p=…` |
| 24 to 37.3 | Chords on screen 3, a circle of fifths in G. Record, then G, D, Em, C, one a bar, three strums each. The take loops | Play chords on the circle. | Record a take. It loops. | `>3 chords G I-V-vi-IV +send` |
| 37.3 to 53.3 | "Let me solo over this." Keys in G pentatonic on screen 4, the lead sound, off-scale keys greyed. Five bars of solo | Now solo. | Every key fits. | `>4 keys G pentatonic sound=lead +send` |
| 53.3 to 57 | Send. The agent saves it: a Late night card with the beat, chords and solo | Send it back. | Your agent keeps it. | `save late night` |
| 57 to 64 | Outro: Jam with your agent. yuigui.com/playground. On the web now, in the iPhone app soon. Final G | | | |

## Beyond the spec today (say so, or spec them)

- **The circle-of-fifths wheel.** spec/MUSIC.md draws `chords` as big buttons in a grid. The wheel is new UI, a candidate `layout=wheel`.
- **Recording a chord take that loops with the beat.** The spec has recording in step 5 (it sends an audio file), and more than one loop at a time is out of v1.
- **The strip on screens 3 and 4** that shows the loop still playing. One clock is in the spec; the strip is new.
- **Everything else is in the spec:** `loop` with `+play`, patching `~loop swing=… p=…` live, `>2` to `>4` screens, `chords` with numerals and `+send`, `keys` with a scale lock and the `lead` sound, and `save`.
- **Where it runs:** the music tools play in the playground today (`/playground?demo=music`) and come to the iPhone app later.
