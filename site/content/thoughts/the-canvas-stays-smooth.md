---
date: 2026-10-08
tag: release
title: "The canvas stays smooth on a phone"
dek: A frame budget and a test that holds it. Hold, drag and Back no longer drop a frame, even with the CPU four times slower.
---

```shot
/progress/yui335-frames-dark.webp | Longest frame per sample on a CPU four times slower, before and after. Hold, drag, Back drops from 67 and 50 ms to 33 ms. The films stay at 17 ms.
```

The living canvas now has a frame budget, and a test that keeps it.

The test plays the heart film, the bars, the steps and a mixed answer start to end. Then it holds a bar, drags one and presses Back. It runs in headless Chrome at phone size, 390x844, and records every frame.

The budget at normal speed: 95 in 100 frames under 20 ms, and none over 50 ms. With the CPU slowed four times, like an older phone: 95 in 100 under 33 ms.

## What the test found

The films were fine. Every one played at one frame per 16.7 ms.

The misses were in the redraw after a hold or a Back. To redraw only what changed, the canvas compared the old and new picture. That read two full canvases and ran a pixel loop in a single frame. On the slowed CPU it took 67 ms.

## What changed

- The redraw now takes one frame per step.
- The pixel compare skips what did not change.
- A number formatter is made once, not on every frame.

On the slowed CPU, the longest frame in the bars sequence went from 67 to 33 ms. In the steps sequence it went from 50 to 33 ms.

```shot
/progress/yui335-frames-light.webp | The same chart, light.
```

[Hold, drag a bar, then step back](/playground/canvas.html?yl=bars)

## What missed

- Web only. This is a headless browser with a slowed CPU, not a real phone.
- At normal speed, one frame in the bars sequence took 33 ms where it took 17 before. It is inside the budget.
- Nothing ships to the phone from this. The native port waits on Chris's call.
- The heart film, the first design and every event line are unchanged.
