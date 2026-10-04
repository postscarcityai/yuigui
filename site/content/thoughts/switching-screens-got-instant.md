---
date: 2026-10-04
tag: release
title: Switching screens got instant
dek: A TestFlight note said moving between screens felt a little laggy. It was right. Here is the fix, in pictures.
---

```shot
/progress/site181-redraws-dark.webp | Dark mode: bar chart of redraws over 24 screen switches, the stage 461 before and 103 after, the screen page 675 before and 135 after.
/progress/site181-tap-dark.webp | Dark mode: bar chart of the time to turn after a pill tap, 42.7 and 46.6 ms before, 26.1 and 34.1 ms after.
/progress/site181-after-dark.webp | Dark mode: the Home screen after the fix, pills on top, nothing lost.
```

You said switching between screens felt a little laggy. Fair. The fix is in, and it reaches phones with the next TestFlight build. The newest one on TestFlight today is 451, and this fix is past it.

## A drag stopped redrawing everything

Dragging between screens used to redraw the whole stage on every frame. Now the slide moves on its own and the stage stays put. Over 24 switches the stage redrew 461 times before and 103 after.

```shot
/progress/site181-redraws-light.webp | Light mode: the same chart, 461 down to 103 and 675 down to 135.
```

## A tap on a pill turns at once

The pill tap used to wait a beat before it turned. That wait is gone. The turn starts as you lift your finger and lands in about 26 to 34 ms, down from 43 to 47.

```shot
/progress/site181-tap-light.webp | Light mode: the pill tap chart, shorter bars after.
```

## Same screens, nothing lost

It is the same Home, the same pills, light and dark. Only the work behind the swipe got smaller. There is a test now that fails if a switch ever costs more than it should.

```shot
/progress/site181-after-light.webp | Light mode: the Home screen after the fix.
```

Numbers are from the simulator, so a phone will vary. Something still feels slow? The feedback button in TestFlight goes straight onto the board.

```try
/progress | Every change, with the shots
/changelog | What reached each build
```
