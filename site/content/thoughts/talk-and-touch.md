---
date: 2026-10-08
tag: release
title: "Say it while you touch it: the agent gets both"
dek: Touch a bar or a row on the living canvas and talk. The agent hears what you said and sees what you touched. "This one" finally means something.
---

```shot
/progress/yui332-bars-after-dark.jpg | The Thursday bar touched, "why is it low" said, and a note on that bar from the agent's answer.
```

Point at a bar. Say "why is it low."

You never said which bar. You did not have to. The agent gets your words and the part you touched, together.

This is a web prototype. It runs on the site, not on your phone yet. The phone version waits on Chris's call on the canvas.

## Why it matters

"This one" has been a hard word for an agent. You had to describe where: the third row, the bar on the right. Now you point and speak. No describing.

## What changed

- Touch a mark, then hold the mic. The mark stays lit, and your words show live.
- On release the canvas shows the one line it would send: what you said, and what you touched.
- Touch nothing and it sends the moment on the clock instead.
- No speech in your browser? A small typed field opens in the bar. Same line, from the keyboard.
- Alt and Enter on a focused mark opens that field with the mark already touched.

[Touch Thursday and say why](/playground/canvas.html?yl=bars)

```shot
/progress/yui332-steps-after-dark.jpg | Bodyweight squats touched and "do this one later" said: the row moved to the end, struck soft, still there.
```

[Touch Bodyweight squats and say later](/playground/canvas.html?yl=steps)

[Touch Build and say split](/playground/canvas.html?yl=parts)

## What landed

- 3 samples with a canned answer: a note on a bar, a row moved to the end and struck soft, a shape split in two.
- The Yui Lines test passes with 0 bad of 100, 13 of them new say checks.
- The film test still passes 42 of 42.
- The keyboard test still passes 42 of 42.

## What missed

- Web only. Nothing ships to the phone from this.
- The answers are canned. A wrong mark or a word with no match shows the line and changes nothing.
- The mic path was tested with a stand-in listener. A real mic on a real phone is untested.
