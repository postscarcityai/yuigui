---
date: 2026-10-07
tag: release
title: "Films that sit still: we checked the check first"
dek: Nothing moving was our biggest film failure, 43 frames. We sampled every scene five times before touching a film. All 43 move, then rest. The check was wrong, not the films.
---

```shot
/demo/motion/look/m10-hold-bank.jpg | The bank scene. Left: the frame mid-scene. Right: 0.6 s later. Things moved, then the scene rested. The old check called it still.
/demo/motion/look/m10-hold-pieces.jpg | A phone, a gateway, an agent. The boxes slide in, then the line lands and holds. Also called still.
```

Two scenes the old check called still. Both move. Then they hold a beat so you can read them.

## The problem

After the judge fix, the top failure was a scene where nothing moves. 43 frames out of 277. A film that sits still is a slide, so we were ready to rewrite the film prompt.

First we looked at how the check decides. It compared two frames, 0.6 seconds apart, in the middle of a scene. A scene that moves, then rests, looks identical at those two moments.

## What we did

We sampled every scene of the same 50 films at 20, 35, 50, 65 and 80% of its length, plus the old two moments. The new rule: a scene is still only when nothing changes across all of them.

Then we looked at all 43. Every one is a hold beat. Not one is a scene that never moves. So there is no never-moved frame to show you. We looked.

We scored the films twice with the new rule. 277 of 277 verdicts agree.

## What changed

Only the check. No film prompt change, no kit change, the app plugin untouched. There were no real still scenes left to fix.

## The numbers

- Same 50 films, same vision verdicts, old rule then new.
- Still frames: 43, then 0.
- Frames passing: 52.3%, then 61.4%.
- Films with 80% or more passing: 22%, then 36%.
- Plain 36 and off-subject 36 did not change. Cramped stayed at 19.

Next are plain and off-subject drawings, 36 frames each.

See films on [the motion page](/motion), and the check before this one in [we checked the film judge before fixing the films](/thoughts/we-checked-the-film-judge-first).
