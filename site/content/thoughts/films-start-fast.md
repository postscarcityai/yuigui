---
date: 2026-10-06
tag: release
title: "Films did not start faster"
dek: We tried to start a film in 2.5 seconds. It still takes about 5. The small model we tried also drew worse, so we did not ship it.
---

```compare
before: /progress/motion3-before.webp | Before: the film opener from the claude CLI, one frame per scene
after: /progress/motion3-after.webp | After: scene 1 from a small model over the API, same 20 asks
```

Drag the line. Same 20 asks, run twice, 40 films each way.

## The idea

A film waits for its first scene. We thought the wait was the cost of starting the claude process. So we skipped it. A small, fast model wrote scene 1 straight over the API, and the big model wrote the rest at the same time.

## The numbers

- First scene, median: 5.1 seconds before, 4.9 after. Target was 2.5.
- First scene, slowest: 8.1 seconds before, 9.4 after.
- Frames passing: 47.6% before, 42.6% after.
- Films with 80% of frames passing: 15%, then 7.5%.
- Plain drawings: 18 frames, then 26.

## What got faster

Almost nothing. 0.2 seconds at the median is inside run noise.

## What did not

The start was never the problem. One full drawing scene takes about 4 seconds to write, on any small model we tried. And the small model drew worse: more plain frames, more off-subject ones.

## What we did

We had one rule: keep the fast path only if passing frames hold. They fell, so we did not ship it. Films keep the same opener as before.

## Next

A shorter first scene. One idea, few shapes, so there is less to write before the film starts.

See the films on [the motion page](/motion).
