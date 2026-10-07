---
date: 2026-10-07
tag: release
title: "We tried to have scene 2 ready before scene 1 ends. It was not. Reverted."
dek: On a new drawing, scene 2 still landed 1.4 s to 1.9 s after scene 1 ran out. Two early starts shaved the first scene and missed the goal, so we took them out.
---

```shot
/demo/motion/look/m19-scene-gap-timing.jpg | Left, first scene median in seconds, before and after, against the 4.5 s goal. Right, the wait between scene 1 and scene 2, before and after, against a goal of zero.
```

Last time a warm helper and an early start brought a new drawing's first scene to 5 s. The next gap is after it: the film plays scene 1, then sits on its last frame until scene 2 arrives. We wanted that wait gone.

## What we tried

Two things, both on new drawings.

- Start the scene 2 writer on the noun, next to the scene 1 writer, and hold its scenes in a queue.
- Take the scene 1 writer's call from a warm process, so it does not wait for a program to start.

## The numbers

New asks, empty cache, two runs of 20 films, against the code from last time.

- First scene: 5.4 s before. Now 4.7 s and 4.8 s. Goal was 4.5 s. Missed.
- Gap between scenes: 2.1 s before. Now 1.4 s and 1.9 s. Goal was 0 s.
- Scene 2 ready in time: 0% of films before. Now 5% and 0%. Goal was 90%.
- Bad frames (plain or off-subject): 8 and 6. Before, 9 and 3. No better, no worse.

On the ten held-out asks it worked. Those use things the kit already draws, so there is no wait for shapes. First scene 4.6 s to 3.9 s, gap 0 s, scene 2 ready in time on 60% of films.

## Why it missed

On a new noun, scene 1 still waits about 4 s for the shapes call before it can go out. A warm start cannot hide that. And scene 2 is a cold model writing 4 to 7 s of code. It needs about 8 s from the noun. Scene 1 only lasts 3 s.

## Shipped

No. Both early starts are out. We kept two small fixes: a closing helper no longer leaves a process running, and the early start now actually fires.

Next: shorten the shapes reply so it stops gating scene 1, then warm the scene 2 writer the same way. The try before this one is [films start without the warm-up](/thoughts/films-start-without-the-warm-up). Films live on [the motion page](/motion).
