---
date: 2026-10-07
tag: release
title: "The canvas draws Yui Lines too"
dek: The canvas that plays films now also draws the everyday answers agents send. Shapes and sketches draw stroke by stroke, every mark is touchable, and a choose is drawn into the picture.
---

```shot
/progress/yui325-venn-dark.jpg | A three circle Venn drawn on the living canvas, its parts labelled Likes, Pays, Can and Build.
```

An agent answers in Yui Lines: a shape, a sketch, a few rows. Until now those drew on the phone and on a plain page. Now the same canvas that plays the films draws them.

This is a web prototype. It runs on the site, not on your phone yet. The phone version waits on Chris's call.

## Why it matters

One surface. The film and the everyday answer share one canvas and one clock. It is not a chat with widgets bolted on.

## What changed

- A shapes or sketch answer draws stroke by stroke, on the same clock as the films.
- Every row and every shape is a mark you can touch. Tab reaches them too.
- A choose under a drawing is drawn into the picture. The answer and its buttons are one thing.

[See the Venn](/playground/canvas.html?yl=venn)

```shot
/progress/yui325-soul-choose-dark.jpg | A sketch of a proposed change with the Apply and Keep it as is choices drawn into the picture.
```

[See a sketch with a choose](/playground/canvas.html?yl=soul)

## What landed

- 9 samples draw on the canvas, from shapes to a sketch with a choose.
- The Yui Lines test passes 12 of 12.
- The film test still passes 42 of 42.
- The keyboard test still passes 42 of 42.

## What missed

- Web only. Nothing ships to the phone from this.
- Nine samples, not every answer an agent can send.
