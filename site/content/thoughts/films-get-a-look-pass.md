---
date: 2026-10-06
tag: release
title: "Films get a look pass"
dek: A film can run clean and still look bad. Now every scene gets one frame checked, and the prompt fixes what fails. Passing frames went from 34.5% to 47.4%.
---

```compare
before: /demo/motion/look/before-1.jpg | Before: one frame per scene, with a verdict under each
after: /demo/motion/look/after-1.jpg | After: the same asks, more frames passing
```

Drag the line. Same 20 asks, run twice, 40 films.

## The numbers

- Frames passing: 34.5% before, 47.4% after (229 and 230 frames).
- Films with 80% of frames passing: 12.5%, then 17.5%.
- Frames that just hold still: 35, then 11.
- Plain drawings: 44, then 29.
- First scene, median: 4.0 seconds, then 5.3. That is slower than the 1 second we allowed. Plainly: we paid for it.

## What failed

Films ran without errors and still looked bad. Tiny shapes in empty space. Labels on top of each other. Text under the caption. A drawing of the wrong thing.

## The fix

Two generic changes, no per-film patches. The drawing helper keeps labels apart and out of the caption band. The film prompt now spells out layout and how to draw the real thing.

Not fixed: plain and off-subject drawings are still the top failure, and overlapping labels went from 3 to 16, which looks like run noise. A bigger opener fixed overlap but pushed the first scene to 8 seconds, so we reverted it.

See the films on [the motion page](/motion).
