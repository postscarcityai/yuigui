---
date: 2026-10-07
tag: release
title: "The kit draws the hero: a real chicken at last"
dek: Four prompt tries could not get a real chicken or heart out of the model. So the model stopped drawing it. The kit holds 69 drawn objects, the plugin picks one, and bad frames fell by more than half.
---

```shot
/demo/motion/look/m15-chicken.jpg | Same ask, a roast chicken, the same film twice. Left: before, the model draws it (scenes 3 and 6, both failed: an oval with legs, a yellow blob). Right: after, the kit draws it (scenes 3 and 6, both passed: a chicken on a plate).
```

Ask for a roast chicken and you used to get an orange oval with two stubs. We tried four times to fix that with words. It did not work. This time we changed who draws.

## Why four tries failed

- MOTION-6: asked for real objects, not labelled boxes.
- MOTION-11: a parts helper and a stronger subject rule.
- MOTION-12: a parts line before scene one.
- MOTION-13: four tiny worked drawings to copy.

Plain and off-subject frames stayed at 61 on our 40 films. The goal was 46 or fewer. The model could list the parts of a heart. It could not draw one. More words did not change that.

## What changes

The kit now draws the hero. It holds 69 objects, built from real parts: animals, organs, vehicles, tools, buildings, things people have. The plugin reads your ask and matches a word to an object. A chicken ask finds the chicken. It puts that drawing in scene 1 itself, and tells later scenes to keep it on screen.

No extra model call, so the first scene is not slower. The model still writes the story and the numbers. It just no longer paints the heart.

## The numbers

- Same 40 films, before then after.
- Plain frames: 27, then 19.
- Off-subject frames: 34, then 8.
- Plain plus off-subject: 61, then 27. Goal: 46 or fewer.
- Frame pass rate: 65.2%, then 76.9%.
- Films with 80% or more passing: 47.5%, then 67.5%.
- First scene, median: 4.7 s, then 4.5 s.

The judge agrees with a person 92% of the time on 60 hand-labelled frames (55 of 60).

## Asks we did not tune for

We wrote ten new asks after the kit was built, so we could not have fit them. Bad frames went from 39 to 11. Frame pass went from 60.9% to 83.0%.

The seven asks with a drawing in the kit went from 28 bad frames to 0. The three without one (elephant, telescope, submarine) stayed at 11, because those films are made the old way. A word the kit does not know still gets a blob.

## What we learned

When a small model cannot draw a thing, do not ask it harder. Give it a drawing to use. The next step is one cheap path per part, for a noun the kit does not have yet. Films are not on the iPhone yet, so this plays on the web and the playground.

See films on [the motion page](/motion), and the last try in [films shown worked drawings](/thoughts/films-learn-from-worked-drawings).
