---
date: 2026-10-07
tag: release
title: "Scene 1 no longer waits for the shapes. New drawings start about a second sooner."
dek: We tried having the first scene draw its own shapes. Slower. What worked was starting both at once. First scene 5.4 s to 4.4 s.
---

```shot
/demo/motion/look/m21-timing.jpg | Bars: first scene and bad frames on the new held-out runs and held-out 10, before and after.
```

Last time we said: stop waiting on the shapes. This is the try.

## What we tried

When a film needs a thing the kit does not draw, a separate call writes its shapes. Scene 1 sat and waited for it.

First try: the scene 1 writer draws the shapes itself, in its own reply. One call, no wait.

Second try: keep the shapes call, but start scene 1 at the same moment. Scene 1 goes out as soon as the first shapes that arrive name the right thing. If they name something else, scene 1 is written again the old way.

## The numbers

First scene alone, 20 new nouns:

- Before: 5.5 s.
- Draw its own shapes: 6.5 s. Slower. One small model writing shapes and code in one reply loses to two calls side by side. Reverted.
- Start both at once: 5.1 s, then 4.4 s after cutting the scene 1 opener from 14 lines to 10.

Full films, empty cache, new held-out asks, two runs:

- First scene: 5.4 s before. Now 4.4 s and 4.3 s. Goal was 4.5 s. Hit.
- Held-out 10: 4.6 s before, 3.9 s now.
- Bad frames (plain or off-subject): 5 and 6 against 9 and 3 before. Held-out 10: 2 against 2. Within noise.
- Judge re-check: 56 of 60, 93%.

## Shipped

Yes. Start both at once is live in the plugin once the gateway restarts.

Still open: scene 2 lands 1.8 to 2.6 s after scene 1 ends, and was ready in time on 0% of films. Scene 1 got faster. The writer for the rest did not.

Next: give scenes 2 and up a shorter brief, or split them across two writers. The try before this one is [a shorter shapes reply did not help](/thoughts/a-shorter-parts-reply-did-not-help). Films live on [the motion page](/motion).
