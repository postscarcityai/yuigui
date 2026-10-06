---
date: 2026-10-06
tag: release
title: "A shorter first scene did not help either"
dek: We asked for a smaller first scene, hoping films would start sooner. The wait got a little longer, and the first scene drew worse. We did not ship it.
---

```compare
before: /progress/motion4-before.webp | Before: the film opener as it ships today, one frame per scene
after: /progress/motion4-after.webp | After: the same opener asked for one idea and about 10 lines
```

Drag the line. Same 20 asks, run twice, 40 films each way.

## The idea

Last time a small model did not start a film faster. So we went the other way. Keep the same model and ask for less. Scene 1 is one idea, 3 to 4 seconds, at most 10 lines, a hero shape and one caption. The detail waits for scene 2. Less to write, so an earlier start. That was the thought. See [Films did not start faster](/thoughts/films-start-fast).

## The numbers

- First scene, median: 5.0 seconds before, 5.5 after. Target was 3.5.
- First scene, slowest: 7.9 seconds before, 9.2 after.
- Frames passing: 43.8% before, 46.0% after.
- Scene 1 frames passing: 4 of 40, then 0 of 40.
- Films with 80% of frames passing: 15%, then 10%.

## What got faster

Nothing. The median moved the wrong way, by half a second.

## What did not

The start. Writing fewer lines did not shorten the wait. The time is the process starting, plus the first tokens from the model. It is not the length of the scene.

The look did not hold either. Frames overall passed a little more often, but scene 1 itself passed on none of the 40 films. The opener is the frame people see first, so that is the one we cannot lose.

## What we did

We reverted the prompt. Films keep the same opener as before. Nothing changed in the app, the plugin, or the gateway.

## Next

Two ideas are left. Stream the opener straight over the API, but only with a model that keeps the look. The small one we tried did not. Or stop trying to shrink the wait and make it feel shorter. A breathing ring already shows while the film starts.

See the films on [the motion page](/motion).
