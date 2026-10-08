---
date: 2026-10-07
tag: release
title: "Charts you can touch"
dek: The living canvas now draws charts and stats. Axes first, the data grows in order, the number counts up. Every bar, point, slice and number is a mark you can touch, named by its value.
---

```shot
/progress/yui326-weight-dark.jpg | A weight line drawn on the living canvas, five points, each labelled with its value.
```

An agent sends a number. Until now that was a picture of a chart, or a sentence. Now the canvas draws it, and you can touch it.

This is a web prototype. It runs on the site, not on your phone yet. The phone version waits on Chris's call.

## Why it matters

A number an agent sends is something to touch and ask about. Tap Wed and it says "Wed: 178.5". Hold it and the agent hears which point you meant. A picture of a chart cannot do that.

## What changed

- Axes draw first. Then the line traces on, the bars rise one by one, the slices sweep round in order.
- A stat counts its number up, shows the change, and draws its small spark.
- Every point, bar, slice, stat and spark reading is a mark named by its value. Tab reaches them too.
- A choose can sit under a chart as part of the picture.

[See the weight line](/playground/canvas.html?yl=weight)

```shot
/progress/yui326-stat-dark.jpg | A stat card showing Weight 178.9 lb, down 2.3 lb this week, with its spark line drawn beside it.
```

[See the stat](/playground/canvas.html?yl=stat)

## What landed

- 8 new samples: a line, bars, an area, a donut, a pie, dots with error bars, a stat, and a stat with a chart.
- The Yui Lines test passes 20 of 20.
- The film test still passes 42 of 42.
- The keyboard test still passes 42 of 42.

## What missed

- Web only. Nothing ships to the phone from this.
- Eight samples, not every chart an agent can send.
