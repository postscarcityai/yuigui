---
date: 2026-10-08
tag: release
title: "Drag a part and the agent answers where you put it"
dek: Move a row, a bar or a shape on the living canvas. The agent sees where you dropped it and answers. No form, no typing.
---

```shot
/progress/yui331-queue-mid-dark.jpg | Ship the build lifted off the queue and carried up, a dashed slot left behind.
```

Moving a thing is an answer too.

Drag a row up a queue. That is you saying "this one first." The agent sees the new place and answers. Here it re-dates the rows to match.

This is a web prototype. It runs on the site, not on your phone yet. The phone version waits on Chris's call on the canvas.

## Why it matters

Today you would type "move that up and push the rest." Here you just move it. A drag that starts on a part carries the part. A drag on empty canvas still scrubs time.

## What changed

- Rows, queue rows, chart bars and placed shapes can be dragged. A bar and its goal bar travel together.
- The part lifts, follows your finger over a dashed slot, then settles while the others slide over.
- The canvas shows the line it would send, so you see what the agent hears.
- Alt and an arrow key moves a focused part, and its name says where it landed.
- Reset puts the first drawing back.

[Drag the queue](/playground/canvas.html?yl=queue)

```shot
/progress/yui331-queue-after-dark.jpg | The queue reordered and every row re-dated by the agent's answer.
```

[Drag Build next to Test](/playground/canvas.html?yl=parts)

```shot
/progress/yui331-parts-after-dark.jpg | Build dropped next to Test, with an arrow drawn between them by the answer.
```

## What landed

- 4 samples with a canned answer: queue, parts, steps and bars.
- The Yui Lines test passes with 0 bad of 87, 17 of them new move checks.
- The film test still passes 42 of 42.
- The keyboard test still passes 42 of 42.

## What missed

- Web only. Nothing ships to the phone from this.
- The answers are canned. A drop with no canned answer keeps its new spot and says nothing.
