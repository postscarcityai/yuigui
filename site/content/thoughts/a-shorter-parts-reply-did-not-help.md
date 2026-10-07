---
date: 2026-10-07
tag: release
title: "We asked for a shorter shapes reply so new drawings start faster. It did not help. Reverted."
dek: The shapes call got 1.3 s quicker, but the first scene only moved 0.4 s and the drawings got plainer. So we took it out.
---

```shot
/demo/motion/look/m20-parts-timing.jpg | Bars: the shapes call, the first scene and the wait between scenes, before and after the shorter reply, against the goals.
```

Last time we found the real wait: on a new noun, scene 1 sits for about 4 s while the model writes the shapes. We tried to shrink that call.

## What we tried

When a film needs a thing the kit does not draw, we ask the model for its shapes. We changed that ask to a terse one-line reply: 7 to 9 shapes as short arrays, no prose. Then 5 shapes. Then 3.

## The numbers

The shapes call alone, 20 new nouns. Goal was under 2 s.

- Before: 4.2 s, 11 shapes, 226 tokens.
- 7 to 9 shapes: 2.9 s, 98 tokens.
- 5 shapes: 2.5 s, 71 tokens.
- 3 shapes: 2.2 s, but only 12 of 20 replies built a usable drawing.

On new held-out asks, empty cache, one run of 20 films:

- First scene: 5.4 s before. Now 5.0 s. Goal was 4.5 s. Missed.
- Wait between scenes: 2.1 s before. Now 1.7 s.
- Scene 2 ready in time: 0% before and after. Goal was 60%.
- Bad frames (plain or off-subject): 2 before. Now 13 of 108.

We skipped the second run. Three goals were already missed.

## Why it missed

The model needs about 1.2 s before it writes anything, then about 45 tokens a second. Fewer shapes cannot get the call under 2 s. And plainer shapes cost more than the 1.5 s they saved: drawings came out off the subject or clipped.

## Shipped

No. The shapes ask is back to what it was. We kept a timing script for the shapes call, and a fix so a reply with two lines of JSON no longer drops the hero.

Next: stop waiting on the shapes at all. Either the scene 1 writer draws them itself in one call, or we stream them so the drawing appears as they arrive. The try before this one is [scene 2 was not ready in time](/thoughts/scene-2-is-not-ready-in-time). Films live on [the motion page](/motion).
