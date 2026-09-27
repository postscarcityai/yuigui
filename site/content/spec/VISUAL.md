# The visual | spec v1 (YUI-124, draft)

A live shader behind the stage. It moves in the agent's colors and its motion look, and it listens: to your voice while you talk, to the music tools while they play, or to the room. It is the layer that makes Yui feel like nothing else on the phone, and it stays simple: one line, five looks, and it never gets in the way of the words.

Step 1 (this page) is the web mock every app card starts from. Try it: [/playground?demo=visualizer](/playground?demo=visualizer). The reference parser (`site/lib/yl/yl.mjs`), the shared plan (`site/lib/yl/visual.mjs`), the WebGL shaders (`site/lib/visual/shaders.mjs`) and the conformance vectors (`spec/conformance/38-visual.json`) already do everything on this page. Step 2 ports the shaders to Metal in the app. YUI-125 wires the sound to the app's mic, the agent's voice and the music tools.

## 1. The line

```
visual aurora react=voice
visual orb tone=mint
visual waves tone=#4DA8FF react=music
visual off
```

- `visual` takes one look, `tone=` and `react=`, in any order. Nothing else: a flag, another key or a word that is not a look is an error, so the line never draws something half right.
- **look**: `orb`, `aurora`, `waves`, `grain` or `bloom` (section 2). Missing means `orb`.
- **tone**: `accent` (the agent's own color, the default), a theme set name (`mint`, `sky`, `lavender`, `sunset`...) or `#RRGGBB`.
- **react**: what it listens to. `voice` (the default: the person's voice while they talk, the agent's while it speaks), `music` (the music tools, spec/MUSIC.md), `mic` (the whole room) or `off` (it drifts on its own clock).
- The newest `visual` wins and stays until `visual off`, across turns, like a theme. It is not a screen: no `@id`, no counter, it leaves an open group alone and draws no bubble.
- The op is `{op: "visual", screen, props: {look?, tone?, react?}}`; `visual off` gives `{op: "visual", screen, props: {off: true}}`. `visualOf(ops)` in `yl.mjs` (`visual_of` in Python and Rust, `visualOf` in Kotlin) is the visual after a run of ops, or null.
- Where there is no stage (Telegram, a watch, an older app) the line does nothing. A host sends it only to a build that draws it (compat.py MIN_BUILD).

## 2. The five looks

| look | what you see | reach for it for |
|---|---|---|
| `orb` | a soft ball of light, a little above the middle, that swells when someone speaks | talking, a check-in, breathing |
| `aurora` | slow ribbons of color across the top, with fine curtains in them | calm, winding down, sleep |
| `waves` | layered lines low on the screen that ripple with the sound | music, a loop, a long talk |
| `grain` | a soft gradient of three slow lights with film grain; it barely moves | focus, reading, writing |
| `bloom` | petals of light that open on the beat | a win, a celebration, a beat |

`visual.mjs` `LOOKS` holds these words; the record's pill and VoiceOver read `visualLabel`: "Aurora, listening to your voice".

## 3. Colors and motion come from the agent

- **Colors.** The tone gives three colors: itself, a lighter neighbor warmer on the wheel, and a deeper one cooler (`visualColors`). The shader mixes them over the stage's ground, Yui's paper in light and its plum in dark. A mint agent's aurora is mint, sea and teal, never a rainbow. Saturation and lightness are clamped so every theme set shows on its ground in both appearances (tested for every set).
- **Motion.** The agent's motion look (YUI-123, `theme pace=... pulse=...`) sets how it moves. `pace` scales the clock (slow runs at 0.71x, quick faster). `pulse` is how the level follows the sound (`ENVELOPES`):

| pulse | attack | release | feel |
|---|---|---|---|
| `soft` | 180 ms | 900 ms | swells and lets go slowly, at 0.75 strength |
| `beat` | 25 ms | 260 ms | hits and falls fast (the default) |
| `tick` | 10 ms | 160 ms | moves in four steps |
| `still` | - | - | does not react; it drifts on its own clock |

Times scale with pace like every other move (`motion.mjs` PACES).

## 4. Sound

- The level is the RMS of a block of samples, in dB, mapped to 0..1 from -60 to -10 dBFS, so a speaking voice sits near the middle (`levelOf`).
- It is followed by a one-pole filter with its own time for going up and down (`follow`), from the envelope above. The web's shaders get one number, `u_level`; the app's also get `bands` (lows, mids, highs, below).
- The meter reads at 30 Hz (`BUDGET.meterHz`), not every frame.
- The playground designs it with a sample voice (a sawtooth through two moving formants, in syllables and pauses), a sample beat (kick, snare, hats at 96 bpm) and this browser's mic. A look that hears something else than what plays moves on its own clock, and says so.
- In the app (YUI-125) one feed carries the level and three bands, and `react=` picks the source:
  - `voice`: the push-to-talk mic while the person talks, and the agent's voice while it speaks (a `narrate` line), whichever is louder. The system speaks where no tap can hear, so the app writes the same line offline with the same voice and rate, measures it in 10 ms steps and reads the step under the clock from when the speech began.
  - `music`: the music engine's output (spec/MUSIC.md), measured on its render thread with no allocation.
  - `mic`: the whole room. The mic opens only while such a visual moves on screen and only when the mic is already allowed; a picture never asks. Push-to-talk takes the mic back while the person talks.
  - `off`: nothing.
- **Bands.** Two one-pole filters split each block: lows under 250 Hz (a kick, a bass, a voice's body), highs over 2.5 kHz (hats, s and t), mids between. Each band is mapped like the level and follows the same envelope. A reading older than 0.25 s is silence: its source stopped.
- **What each look does with them**, on top of what the level does. With the bands at 0 each look is the web's picture.

| look | lows | mids | highs |
|---|---|---|---|
| orb | pulses | ripples | glows |
| aurora | widens | shimmers | glows |
| waves | swell | ripple | glow |
| grain | spreads | - | sparkles |
| bloom | opens | flutters | its heart glows |

- Nothing is recorded, kept or sent. Each source holds four numbers, overwritten a block at a time; the level never leaves the phone.

## 5. Rules

**It never fights the words.** Behind a chunk with words the picture runs at 70% (`BUDGET.behindDim`), and a scrim of the ground color lies over the words' zone: full under 34% of the stage height from the bottom, fading to none at 58%. The scrim is the least alpha that keeps the stage's ink at 4.6:1 (AA with headroom) over the worst pixel the shader can make, any of its three colors at full strength (`scrimFor`, in steps of 0.02). Alone on the stage it runs at full strength with no scrim.

**Still for Reduce Motion, Low Power and heat.** Reduce Motion, Low Power Mode, a `serious` or `critical` thermal state, or a closed stage: the visual draws one still frame and stops (`visualPlan` `still`, with `why`). No clock, no level, no redraw until something changes. A `fair` thermal state drops to 30 fps.

**Frame and battery budget** (`BUDGET`, for the app's Metal port):

| | budget |
|---|---|
| alone on the stage | 60 fps |
| behind words, or thermal `fair` | 30 fps |
| still | 0 fps: one frame |
| resolution | half (grain three quarters: the grain needs it) |
| GPU time | 2 ms a frame at most on an iPhone 12 |
| shader | 4-octave noise at most, no loops over the screen |
| meter | 30 Hz |
| memory | one small drawable; inside the memory ceiling (YUI-100) |
| background | stops the moment the app leaves the screen or the stage closes |

A look that goes over 2 ms on the slowest supported phone gets simpler, not slower.

## 6. What the agent is told

The channel guide (spec/CHANNEL.md) gets one line when the app draws it: a mood behind your words, for a calm moment, a focus block or music, with the five looks and the three kinds of react; it stays until `visual off`; never for a plain answer. Until the build that draws it goes VALID, the line waits in CHANNEL.md's waiting list.

## 7. Where it lives

- `site/lib/yl/yl.mjs`: the `visual` line, `visualOf`, `VISUAL_LOOKS`, `VISUAL_REACT`.
- `site/lib/yl/visual.mjs`: colors, envelopes, the level follower, the scrim, the budget and `visualPlan`, the one object a renderer draws from. Tests: `node site/lib/yl/visual.test.mjs`.
- `site/lib/visual/shaders.mjs`: the five WebGL 1 fragment shaders. Uniforms `u_res`, `u_time` (already scaled by pace), `u_level`, `u_a u_b u_c u_ground`, `u_dim`, `u_scrim`, `u_zone`. The Metal ports keep the same uniforms and math.
- `site/app/playground/visualizer.js`: the demo. `?look=`, `?agent=`, `?words=off`, `?still=on` open a state directly.
- Parsers: Python, Kotlin and Rust read the line and pass `38-visual.json`. The Swift parser learns it in step 2; until then the file is on the app's not-yet list.

## 8. Next

- **Step 2 (app):** the Metal shaders behind the stage, reading `visualPlan`'s numbers, at the budget above and inside the memory ceiling. The Swift parser reads `visual`. Screenshots of each look in light and dark, a recording, and the still under Reduce Motion.
- **YUI-125 (app, built):** the sound, from the mic, the agent's voice and the music tools, as a level and three bands. VoiceOver reads what the look does with them as a hint.
- Later: people describe the look they want for each agent in words ("slow purple smoke"), and the agent picks the look and tone.
