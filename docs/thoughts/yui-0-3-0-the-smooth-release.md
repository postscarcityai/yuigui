---
date: 2026-09-26
tag: release
title: "Yui 0.3.0: the smooth release"
dek: Taps answer at once, a long thread opens in about a third of a second, and typing keeps up. Plus shapes that move and two deck fixes. Build 138 is on TestFlight.
---

```shot
/progress/yui101-thread-light.webp | A 500-message thread, open at the newest message, the frame counter at 60 fps
/progress/yui99-typing-long-thread-light.webp | Typing on a long thread, the Speed readout showing the last key time
/progress/yui104-app-heat-light.webp | Asked how a heat pump works, the agent draws it
```

Build 138 is on TestFlight. It is Yui 0.3.0, and it started with one line from Chris on Sep 25: "I am not getting ultra smoothness when I click around. Things feel delayed. Very efficient like Telegram."

So we measured first. Then we fixed what the numbers pointed at. Nothing looks different. It just answers.

## Taps and a long thread

On a 500-message thread in the simulator, opening it took over three seconds. A tap on a choice took more than a second to show. Every change redrew all 500 rows.

Now a row that hasn't changed skips its redraw, and a long thread draws its newest 60 rows and adds more as you scroll up.

```compare
before: Open a long thread: about 3 s\nTap a choice: 1.4 s\nA reaction: 300 ms\nSend a message: 2.4 s\nScroll hitches: 63 ms per second | Before
after: Open a long thread: under 350 ms\nTap a choice: 58 ms\nA reaction: 29 ms\nSend a message: 145 ms\nScroll hitches: under 2 ms per second | 0.3.0
```

Same look, light and dark. The difference is in your thumb.

```shot
/progress/yui101-scrolled-dark.webp | The same long thread in dark mode, scrolled up past a timer and a question, still at 60 fps
```

## Typing keeps up

Holding backspace went slow, because every key made the whole chat redraw, every message above included. Now the words you type belong to the composer alone.

```compare
before: /progress/yui99-before-4fps-light.webp | Before: 4 fps after a run of backspaces
after: /progress/yui99-typing-long-thread-light.webp | After: a key shows on the next frame
```

On a 241-message thread, a key used to take 177 ms to show, and a fast run of backspaces lost 34 of 49 presses. Now a key shows on the next frame most of the time, and every press lands.

## Yui times itself

Those numbers came from the simulator. Real phones tell the rest. Yui now times nine moments on your phone, from your tap to the frame that shows the answer: a key, your bubble after Send, a thread opening and more.

It travels as numbers only. No message text, no names, nothing you wrote. A test build has a Speed switch in Settings if you want to watch it yourself.

```shot
/progress/yui102-overlay-dark.webp | Speed on: a small key ms and fps readout while typing hello
/progress/yui102-switch-light.webp | Settings on a test build: the Speed switch
```

## Shapes that move

An agent can now draw a small diagram in a few lines: boxes, circles, arrows, labels. They come on one after another, then a caption says what it means. It is drawn on the phone, so there is no picture to wait for.

```shot
/progress/yui104-app-heat-light.webp | A heat pump, drawn as a loop of four shapes with a caption
/progress/yui104-app-heat-dark.webp | The same diagram in dark mode
```

## Two deck fixes

Both came from the feedback button. A deck in the chat had half a card of nothing above its arrows. Now it is as tall as the page showing.

```compare
before: /progress/fb-ak2rjfq9-before-short-dark.webp | Before: a short page in a tall card
after: /progress/fb-ak2rjfq9-after-short-dark.webp | After: the card fits the page
```

And a full-screen page could come up blank when you opened it again. The page showing always has its words now.

```shot
/progress/fb-aksr0ha8-reopen-last-light.webp | A deck reopened full screen on its last page, words on screen
```

## What to try

This list is a real Yui screen. Tap the rows as you go.

```phone
caption: The 0.3.0 checklist, drawn from one line.
list "Try Yui 0.3.0" "Open your longest thread" "Tap a choice and watch it answer" "Hold backspace on a long sentence" "Ask an agent how something works" "Page through a deck in the chat" +check
```

Something still feel slow? Use the feedback button in TestFlight. It lands on the board, and this whole release started there.

```try
/mockups#release-030 | See 0.3.0, screen by screen
/changelog#build-138 | Build 138, change by change
```
