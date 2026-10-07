---
date: 2026-10-07
tag: release
title: "Scene 2 is now ready when scene 1 ends. The wait between scenes is gone."
dek: The film sat on its first scene's last frame for about two seconds. Now the gap is zero and most films have scene 2 in time. The first scene is still slow today.
---

```shot
/demo/motion/look/m22-timing.jpg | Bars: the wait between scene 1 and scene 2, and how many films had scene 2 ready in time, before and after, on the new held-out runs and held-out 10.
```

Last time we said: scene 2 lands late and the writer for it needs to start sooner. This is the fix.

## What was wrong

The writer for scenes 2 and up was a bare generator. It only ran when something asked it for scenes, and that happened after scene 1 had been written and sent. Its 4 to 5 s of work then sat behind scene 1's play time.

## What we did

Start it with scene 1's writer. Its scenes wait in a queue until the film needs them. One switch, `YUI_MOTION_REST_EARLY=off`, brings the old order back.

## The numbers

Empty cache, 20 films per run, wait between scene 1 and scene 2:

- New held-out asks, two runs: 2.4 s and 1.8 s before. 0 s now on both.
- Held-out 10: 2.6 s before. 0 s now.
- Scene 2 ready in time: 0% before. 70% and 65% on the new asks, 70% on held-out 10. Goal was 50%.
- Same day, change off: gap 4.9 s, ready 0%. So it is the change, not the day.
- Frames that pass: 93.5%, 95.4% and 96.5%. Bad frames no worse.
- Judge re-check first: 56 of 60, 93%.
- Tests: 90 passed.

## Shipped

Yes. Live in the plugin once the gateway restarts.

One miss to be honest about: the first scene read about 7 s today, with the change on or off. The host and the model are slow today. Last time it read 4.4 s on a quiet day. Scene 1 and the new early writer now share the model, so a busy day slows scene 1 like before. We will read it again on a quiet day.

Next: re-read the first scene when the day is quiet, then look at the 30% of films where scene 2 is still late. Before this: [scene 1 no longer waits for the shapes](/thoughts/scene-1-draws-its-own-shapes). Films live on [the motion page](/motion).
