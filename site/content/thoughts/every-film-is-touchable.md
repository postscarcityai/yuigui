---
date: 2026-10-07
tag: release
title: "Every film is touchable"
dek: The living canvas now plays all 41 ready-made films. Tap any text or shape and it rings and names itself. Hold it and you ask the agent about that part.
---

```shot
/progress/yui323-sheet.jpg | Six phone shots of the canvas: engine, Rome and tax films, dark on top and light below, each with one part ringed and named.
```

A film used to be a video. You watched it and that was it. Now you can poke it and question it.

This is a web prototype. It runs on the site, not on your phone yet. The phone version waits on Chris's call.

## What changed

- The canvas plays every ready-made film, not only the heart. Open it with `?film=<id>`, or pick one from the strip at the top.
- Every text and every shape in a film is a touch target. The films did not need to change.
- Tap one: the film pauses, a ring and a name pill sit on it, and the line the film says at that moment shows under it.
- Hold one: you see the exact line the agent would get, for example an ask about Compress in the engine film.
- Drag scrubs. Tap on nothing plays or pauses. The last frame stays.

[Try the engine film](/playground/canvas.html?film=engine-r2)

```shot
/progress/yui323-tax-hold-light.jpg | The tax film paused, one part ringed and named, with the ask shown under it.
```

## What landed

A browser test loads the heart and all 41 films, samples 14 frames of each, and looks for touch targets.

- 42 of 42 films pass.
- Every film has at least one touch target.
- No scene errors in any of them.
- One film needs three.js, which the host now loads on request.

## What missed

- Web only. Nothing ships to the phone from this.
- No live model calls. Only films already on the site, and holds show the ask instead of sending it.
