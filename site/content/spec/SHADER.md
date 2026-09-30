# The shader look | spec v1 (draft, mock)

One blob, in the middle, for every agent. It shows what the agent is doing by how it moves. The app's vector line blob retires, because two looks on one stage clashed. Try it: [/playground?demo=shader-look](/playground?demo=shader-look). The states, the word rule and the per-agent numbers are in `site/lib/visual/action.mjs`, the WebGL shader in `site/lib/visual/actionshader.mjs`, and the tests in `site/lib/visual/action.test.mjs`. The app port (Metal, in `Visual.metal`) comes after the look is picked.

## 1. The base

The base is the soft blob in the middle of the stage: a body with a wandering edge, three of the agent's colors mixed inside it in a slow swirl, a halo, and a little film grain. It sits a little above the middle, where the stage's mark sits today. It is the `orb` look, with the grain of Gouda's look added. Chris's reference is the stage screenshot with the blob in the center; his words called it Gouda's, and Gouda's shipped default today is `grain`, so the mock takes the centered blob as the base and keeps Gouda's grain on it.

## 2. The action states

| state | what you see | picked by |
|---|---|---|
| idle | breathes slowly | nothing is happening |
| thinking | the inside turns over itself, the edge wanders more | the working word, or a `doing` with no clue |
| reading | a band of light sweeps down the blob, in fine lines | read, open, review, check, scan, look at |
| running | a steady beat sends rings outward, the blob tightens | run, build, deploy, test, send, install, write, save |
| searching | a small light circles the blob and the blob leans after it | search, find, look up, browse, fetch |
| done | one bright ring, then it settles | the reply arrives |

- **What drives it.** The `doing` line's words (YL.md section 5, the working row). `actionOf` reads them: searching first, then reading, then running, and anything else is thinking. Before any `doing`, the working word is thinking. When the reply lands, done plays once and the blob goes back to idle.
- **No snap.** Each state has a weight, 0 to 1, that eases toward its target (in 3.2 per second, out 2.2). Two states overlap for a moment, so the blob never jumps.
- **Reduce Motion, Low Power, heat.** One still frame, as in VISUAL.md section 5: idle, no ring.
- **Behind words.** Same dim and scrim as VISUAL.md, so the words stay AA.

## 3. Every agent, the same blob

Every agent is one row of the same five knobs, inside the same narrow ranges. A new agent is a row, and no new shader.

| knob | range | what it moves |
|---|---|---|
| size | 0.9 to 1.1 | the blob's radius |
| wobble | 0.6 to 1.4 | how far the edge wanders |
| pace | 0.75 to 1.2 | the clock (a default never runs quick) |
| grain | 0 to 0.1 | film grain over the body |
| glow | 0.7 to 1.3 | the halo |

The color comes from the agent's theme set, the way `visualColors` already gives three. The mock rows: Yui coral, Arnold honey (a little larger, steadier, brisker), Basil mint (slower, softer edge), Gouda lavender (most grain), Penny peach (small, calm), Quill sky. A test fails any row outside the ranges.

**Basil.** The bloom look goes. Basil is the same blob in mint, slower and with a softer edge, so its background matches the crew's. Its per-agent `visual` default becomes `orb`-family like the others. Arnold's waves, Penny's aurora and the rest go the same way once the look is picked; `visual` lines an agent sends still work.

## 4. Audio reactive, for later

Agents do not speak yet, so nothing is built. The hook is one uniform, `u_voice`, 0 to 1, from the agent's voice through the same follower as VISUAL.md section 4. It drives three things: the blob's size, its edge, and the inside's light. The mock sets it to 0. When an agent gets a voice, the port wires the level in and no state changes.

## 5. Next

Chris picks the states and the agent looks in the mock. Then the APP lane ports the shader to Metal, retires the line blob (`StageMark`) and moves the per-agent defaults; the site stage gets parity.
