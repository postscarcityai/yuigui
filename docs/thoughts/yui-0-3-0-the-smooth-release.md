---
date: 2026-09-26
tag: release
title: "Yui 0.3.0: the smooth release"
dek: One ask for this release. Make Yui feel as quick as Telegram. Taps answer at once, a long thread opens fast and scrolls smooth, and typing keeps up. Here is what to try.
---

```compare
before: Open a long thread: about 3 s\nTap a choice: 1.4 s\nSend a message: 2.4 s\nScroll hitches: 63 ms per second | Before
after: Open a long thread: under 350 ms\nTap a choice: 58 ms\nSend a message: 145 ms\nScroll hitches: under 2 ms per second | 0.3.0
```

Yui 0.3.0 is on TestFlight as build 138. It has one job: make the app feel quick. Same look, light and dark. The difference is in your thumb.

## Taps answer at once

We measured first, on a 500-message thread. Every change redrew all 500 rows, so a tap on a choice took more than a second to show. Now a row that has not changed skips its redraw, the thread works things out once per change instead of once per row, and a long thread draws its newest 60 messages and adds more as you scroll up.

## Typing keeps up

Holding backspace used to drop presses on a long thread, and a double space was slow to turn into a period. Each key now redraws only the box you type in: about one frame, down from 177 ms.

```shot
/progress/yui99-typing-long-thread-light.webp | A long thread in light mode with a sentence in the composer and the speed readout showing the last key time
/progress/yui99-before-4fps-light.webp | The same thread before the fix, the readout at 4 frames a second after a run of backspaces
```

## Pages that fit

Two fixes from beta feedback. A full-screen page never comes up blank now. And a deck inside the chat is as tall as the page showing, so no more half-empty card.

```shot
/progress/fb-ak2rjfq9-after-short-dark.webp | A short deck page in dark mode, the arrows right under the words
/progress/fb-aksr0ha8-reopen-last-light.webp | A full-screen deck reopened on its last page, words on screen
```

## What to try

This list is a real Yui screen. Tap the rows as you go.

```phone
caption: The 0.3.0 checklist, drawn from one line.
list "Try 0.3.0" "Flick up and down your longest thread" "Tap choices and buttons and watch them answer" "Switch into a big thread and time it" "Type a line, then hold backspace" "Swipe a full-screen answer to the end and back" +check
```

Your phone now sends speed numbers too, numbers only, so the next release can say how fast it feels on real hands, not just in the simulator.

Found something off? Use the feedback button in TestFlight. It lands on the board.

```try
/changelog | Every change in 0.3.0
/roadmap | What comes next
```
