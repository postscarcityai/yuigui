---
date: 2026-10-08
tag: release
title: "Point at a part and it redraws"
dek: Hold one bar or one row on the living canvas and the agent redraws just that part, in place. The rest of the answer stays where it is.
---

```shot
/progress/yui330-bars-wipe-dark.jpg | The Thursday bar held and wiping out while the other bars stay.
```

You ask about one bar. Only that bar changes.

Hold a mark on the canvas. It pulses. The old part wipes out and the new one writes in. Everything else stays put, like pointing at a whiteboard.

This is a web prototype. It runs on the site, not on your phone yet. The phone version waits on Chris's call on the canvas.

## Why it matters

Today a follow-up usually means a whole new answer. You lose your place. Here the answer you were reading stays, and only the part you pointed at moves.

## What changed

- Hold a bar, a list row, a stat, a sketch row or a shape. It pulses, then redraws.
- In a mixed answer, you can redraw one part and leave the others alone.
- If the reply adds a table row, the table grows and the slider under it eases down to make room.
- Scrub and replay play the answer as patched. The keyboard walks the new marks.
- Reset puts the first drawing back.
- A hold with no reply shows a quiet "no answer in the demo" note on that mark.

[Hold a bar](/playground/canvas.html?yl=bars)

```shot
/progress/yui330-bars-after-dark.jpg | The Thursday bar redrawn at 138 g with the answer line under it.
```

[Try the dinner table](/playground/canvas.html?yl=mix-dinner)

## What landed

- 7 samples with a canned reply: bars, today, stat, ui, venn, mix-protein and mix-dinner.
- The Yui Lines test passes with 0 bad of 70.
- The film test still passes 42 of 42.
- The keyboard test still passes 42 of 42.

## What missed

- Web only. Nothing ships to the phone from this.
- The replies are canned. A live agent patching a mark is not wired in.
