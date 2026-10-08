---
date: 2026-10-07
tag: release
title: "Lists you can tick"
dek: The living canvas now draws lists, tables, timelines and cards. Rows write in one after another, a checklist ticks in place and tells the agent, and every row, cell and step is a mark you can touch.
---

```shot
/progress/yui327-today-tick-dark.jpg | A to-do list drawn on the living canvas, with one row ticked in place.
```

Ask an agent for a to-do list and you get a block of text. Now the canvas draws it, and you can tick it.

This is a web prototype. It runs on the site, not on your phone yet. The phone version waits on Chris's call.

## Why it matters

The everyday answer, a to-do list or a plan for the week, becomes something you tick and ask about where it sits. Tick a row and it stays ticked, and the agent is told. Touch a cell and the agent hears which one you meant.

## What changed

- Rows write in one after another. A table draws its rules first, then the cells.
- A checklist draws its boxes. A tap ticks the row in place and sends it to the agent.
- The timeline spine draws, the done steps tick, and the Now step pulses.
- Every row, cell and step is a mark named by its words. Tab reaches them too.
- A choose can sit under a timeline as part of the picture.

[See the to-do list](/playground/canvas.html?yl=today)

```shot
/progress/yui327-week-dark.jpg | A plan for the week drawn as a table on the living canvas, one row per day.
```

[See the week](/playground/canvas.html?yl=week)

## What landed

- 7 new samples: today, steps, macros, week, card, release and dinner.
- The Yui Lines test passes 27 of 27.
- The film test still passes 42 of 42.
- The keyboard test still passes 42 of 42.

## What missed

- Web only. Nothing ships to the phone from this.
- Seven samples, not every list an agent can send.
