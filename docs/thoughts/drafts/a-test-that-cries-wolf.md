---
date: 2026-11-13
tag: why
title: "A test that cries wolf blocks more than bugs"
dek: Our canvas speed test goes red when the machine is busy, not when the canvas is slow. It has held a finished feature for almost three weeks, and the fix is a choice, not a delete.
---

```phone
caption: Same code, same machine, three runs. Only the load changed.
sketch "Canvas speed test" frame=window
row "Run 1, machine busy: red" +x note="slow frame"
row "Run 2, machine busy: red" +x note="same frame"
row "Run 3, machine idle: green" +hi note="44 of 44"
```

Before any change to the site goes out, a check runs on it. One step plays the living canvas with the processor slowed four times and counts how long each frame takes. If too many frames run long, the push stops.

That step exists for a good reason. The canvas is the part of Yui you touch and drag, and a stutter there feels broken. Nothing else guards it.

## Why it cries wolf

A phone screen redraws about 60 times a second, so a frame takes either one tick (about 17 ms) or two (about 33 ms). Nothing in between. The limit was set at 33 ms, and two ticks is 33.3. So one doubled frame at the wrong moment fails the whole check, with no margin at all.

On a quiet machine that almost never happens. On a busy one, where another job is building at the same time, it happens often. The test cannot tell a busy machine from slow code.

```compare
before: Red\nMachine busy\nNo code changed | What the test says today
after: Red only when\nthe canvas is slower\nRetry or margin first | What a gate should say
```

## Why that is worse than no test

A red check that means nothing teaches one habit: skip the check. Once people skip it, the real slowdown it was built to catch gets through too.

Meanwhile it stops good work. Beats, the stage where Yui talks and you can cut in, is built and tested. It cannot go live, because every push of it runs into this gate.

## The choice

There are three honest fixes, and only one should ship:

- Fail only when a frame is longer than the limit, not equal to it, and keep a separate hard cap.
- Raise the limit a little, so one tick of noise has room.
- Keep the limit, and rerun the one failing sample once before calling it red.

Deleting the test is not on the list. The canvas still needs a guard. It needs one that tells the truth.

```try
/playground/canvas.html | Play the canvas the test guards
/roadmap | See what is waiting
```
