---
date: 2026-10-08
tag: release
title: "Change your mind on the canvas"
dek: Back undoes a redraw or a drag, and only the marks that changed move. Redo goes forward. The agent hears one line.
---

```shot
/progress/yui334-drag-dark.jpg | The Thu bar dragged one place left, with the line it sends under the picture.
```

You can now step back on the living canvas.

Drag a bar. Hold another and let it redraw. Then change your mind. Back returns to the picture before the last step. Only the marks that step changed redraw, on the same clock.

Redo goes forward the same way.

This is still a web prototype with canned replies. It runs on the site, not on your phone yet.

## Why it matters

A canvas you can only push forward is stressful. If every touch can be undone, you can touch freely.

## What landed

- Every hold redraw, drag answer and say+touch patch is one step in a history.
- Back is a two-finger tap, the Back mark in the corner, or Cmd/Ctrl+Z. Redo is the forward mark, or Shift+Cmd/Ctrl+Z.
- Each step is announced in plain words, like "Back to before the bar moved."
- The agent gets one line so it knows the picture changed under it: `[yui] bars canvas undo step=2 marks=chart:n1:s0:3`.
- The line is written into the motion spec, and the spec test checks it against the code. A new test runs hold, drag and say+touch, undoes three times, redoes once, and repeats it in a real browser. It runs with the site checks, and they pass.

```shot
/progress/yui334-back-dark.jpg | After Back: the first picture again, with the line Back to before the bar moved.
```

[Drag a bar, then step back](/playground/canvas.html?yl=bars)

## What missed

- Web only. Nothing ships to the phone from this.
- The replies are canned. No live agent answers yet.
- The heart film, the first design and every earlier event are unchanged.
