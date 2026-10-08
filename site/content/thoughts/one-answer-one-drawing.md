---
date: 2026-10-07
tag: release
title: "One answer, one drawing"
dek: A real answer mixes things, a line, a chart, a list and a question. The living canvas now draws all of it as one picture on one clock, and every part is still touchable.
---

```shot
/progress/yui329-mix-protein-dark.jpg | A line, a stat, a bar chart and a two-button question drawn together on the living canvas.
```

Ask an agent a real question and the answer is rarely one kind of thing. It says a line, shows a number, draws a chart, then asks you what next. Until now that was a stack of separate widgets.

Now it is one picture. It draws itself top to bottom, one part after the other, on one clock.

This is a web prototype. It runs on the site, not on your phone yet. The phone version waits on Chris's call on the canvas.

## Why it matters

The answer stops being a pile of cards. You watch it come together, you can scrub it back and forward, and you touch any part of it. The question at the end sits on the same picture as the chart it is about.

## What changed

- The parts draw in order. Nothing starts until the part above it has finished.
- One exception: a question written above its picture waits. The picture draws first.
- Every part keeps what it could already do. Tap a bar and it names itself. Tick a list row. Answer a question and it locks. Drag a knob.
- Hold any mark and it asks the agent about that mark.
- Scrub plays the whole answer back and forward. The keyboard walks the marks in the order they were drawn.
- An agent writes the same Yui Lines as before. A mix just draws as a mix.

[Try the protein answer](/playground/canvas.html?yl=mix-protein)

```shot
/progress/yui329-mix-ship-dark.jpg | A timeline, a card and a question drawn in one flow.
```

[Try the ship answer](/playground/canvas.html?yl=mix-ship)

## What landed

- 6 new mixed samples: mix-protein, mix-settings, mix-ship, mix-hour, mix-first and mix-dinner.
- The Yui Lines test now covers 36 samples, with real pointer and key events.
- The film test still passes 42 of 42.
- The keyboard test still passes 42 of 42.

## What missed

- Web only. Nothing ships to the phone from this.
- Six mixes, not every answer an agent can write.
