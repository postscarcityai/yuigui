# The shader blob | spec v2 (picked, YUI-232)

One blob in the middle of the stage, drawn by the shader behind it, for every agent. Its **shape** says what the agent is doing: a perfect circle when it waits, a football when it reads, and so on. The app's vector line blob is gone, because two looks on one stage clashed; only the shader draws the agent. Try it: [/playground?demo=shader-look](/playground?demo=shader-look). The states, the word rule and the per-agent numbers are in `site/lib/visual/action.mjs`, the WebGL shader in `site/lib/visual/actionshader.mjs`, the tests in `site/lib/visual/action.test.mjs`. The app draws the same math in `Visual.metal` (`visualOrb`).

Chris, Sep 30: "The blob sits in the center and changes shape with what the agent is doing: a perfect circle, a football, and so on." Currents, Type and Dots stay as alternate looks to try (the Look picker in the mock); Terrain is out.

## 1. The shapes

| state | shape | how it moves | picked by |
|---|---|---|---|
| idle | a perfect circle | breathes slowly | nothing is happening |
| thinking | a cloud of five puffs | turns slowly, the inside turns over | the working word, or a `doing` with no clue |
| reading | a football on its side | a band of light reads across it, left to right | read, open, review, check, scan, look at |
| running | a rounded square | turns a quarter on every beat | run, build, deploy, test, send, install, write, save |
| searching | a drop | its point sweeps round, the blob leans after it | search, find, look up, browse, fetch |
| talking | a tall pill | stretches and ripples with the voice | the voice is playing (the mic open, in the app) |
| done | the circle again | one pop and one ring, then idle | the reply arrives |

- **What drives it.** The `doing` line's words (YL.md section 5, the working row). `actionOf` reads them: searching first, then reading, then running, and anything else is thinking. Before any `doing`, the working word is thinking. When the reply lands, done plays once and the blob goes back to idle.
- **Morph, never snap.** Each shape is a distance to its edge. The shader blends the distances by the state weights, and each weight eases toward its target (in 3.2 per second, out 2.2), so the circle melts into a football and back.
- **Small edge.** The edge still lives a little (a slow noise), kept small so the shape reads at a glance on a phone.
- **Reduce Motion, Low Power, heat.** One still frame, as in VISUAL.md section 5, in the shape of the current state; it redraws when the state changes.
- **Behind words.** Same dim and scrim as VISUAL.md, so the words stay AA.
- **Cost.** One 4-octave noise and one noise a pixel, no loops over the screen: the same as the orb it replaces.

## 2. Uniforms

| uniform | what |
|---|---|
| `u_think u_read u_run u_search u_talk u_done` | state weights, 0 to 1; idle is what is left |
| `u_since` | seconds since the state changed (the done pop and ring) |
| `u_voice` | 0 to 1, the voice after a smooth follower (attack 180 ms, release 900 ms) |
| `u_size u_wobble u_grain u_glow` | the agent's knobs (section 3) |
| `u_a u_b u_c u_ground` | the agent's three colors and the stage ground |

In the app these ride `VisualUniforms` as `act` (think, read, run, search) and `act2` (talk, done, since); the voice is the `level` the visual already hears, through the look's envelope.

## 3. Every agent, the same blob

Every agent is one row of the same five knobs, inside the same narrow ranges. A new agent is a row, and no new shader.

| knob | range | what it moves |
|---|---|---|
| size | 0.9 to 1.1 | the blob's radius |
| wobble | 0.6 to 1.4 | how far the edge wanders |
| pace | 0.75 to 1.2 | the clock (a default never runs quick) |
| grain | 0 to 0.1 | film grain over the body |
| glow | 0.7 to 1.3 | the halo |

The color comes from the agent's theme set, the way `visualColors` already gives three. **Basil** loses the bloom: it is the same blob in mint. The crew's defaults (Yui, Arnold, Basil, Gouda, Penny, Quill) are all the blob now, each with its own hearing, strength and pace; a `visual` line an agent sends still works (the alternates and the other looks are one line away).

## 4. The voice

The voice is one number, `u_voice`, 0 to 1. It swells the blob, stretches the talking pill and brightens the inside, always through the smooth follower, so the blob moves with a phrase and never jitters with each syllable (Chris, build 370: "smoother and more abstract"). The mock plays a made-up voice on Talking.

## 5. What went

The app's `StageMark` (three circles of the agent's color, drawn per frame over the shader) is removed with its code: the working screen and the error screen draw no mark, and the shader behind the stage is the agent.
