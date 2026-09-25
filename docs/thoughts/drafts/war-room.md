---
date: 2026-09-25
tag: release
title: Build 74: the war room, and replies
dek: Screen 2 becomes a war room: what needs you, what is running, what is next. You can reply to any message, copy any part of one, and play a game with your agent. Here is what to try.
---

```shot
/progress/yui73-needs-you-light.webp | The war room: Needs you, 3 cards waiting, each with its choices as buttons
/progress/yui65-timeline-light.webp | The timeline: done rows with a check, a Now line, the queue under it
/progress/yui68-quote-light.webp | Replying: the quoted message sits above the composer
```

Build 74 is on TestFlight. It is ten builds of work in one upload. The biggest part is screen 2, which is now a war room for the whole project.

It answers three questions at a glance. What needs me? What is running right now? What comes next? And you can act on all three without typing a word.

## Needs you, in one tap

When a card is waiting on a decision, it shows up at the top with its choices as buttons. Tap one and that is your answer. The card goes back to work. No chat turn, no typing.

```compare
before: /progress/yui73-needs-you-light.webp | A card waiting on a pick
after: /progress/yui73-answer-tapped.webp | Tapped Park it: the answer is in
```

## Running now, and the queue

Under that, one card per lane shows what is being built and the last thing it said. Then the timeline: what shipped, a Now line, and what is queued.

```shot
/progress/yui73-running-dark.webp | Running now per lane, then the timeline with shipped cards
/progress/yui66-reorder-drag-light.webp | Edit order: dragging a queued card to a new spot
/progress/yui66-reorder-saved.webp | Saved: the queue in its new order
```

Tap Edit order and drag the queue. Save, and the board follows. What you put first gets built first.

## Reply, copy, play

Swipe a message left to reply to it, or hold it and tap Reply. The reply wears a small chip. Tap the chip and the chat scrolls back to the original. Hold any message and you can also Copy it, or Select text to copy just a part.

```shot
/progress/yui68-menu-light.webp | Holding a message: reactions, then Reply, Copy, Select text
/progress/yui68-chip-dark.webp | A sent reply with its chip, in dark mode
/progress/select-text-sheet.webp | Select text: drag over the words you want and Copy
```

Your agent can now put a game on screen in one line. Tic-tac-toe against the agent, snake, and memory. And a card with a link now opens the page in Safari, instead of sending a tap to the chat.

```shot
/progress/yui59-ttt-light.webp | Tic-tac-toe against the agent
/progress/yui59-snake.webp | Snake, with an arrow pad
/progress/yui59-memory.webp | Memory: match the pairs
```

## What to try

This list is a real Yui screen. Tap the rows as you go.

```phone
caption: The build 74 checklist, drawn from one line.
list "Try build 74" "Swipe to screen 2: the war room" "Tap a choice under Needs you" "Tap Edit order and drag the queue" "Swipe a message left to reply" "Hold a message and tap Select text" "Ask your agent for a game of tic-tac-toe" "Tap a link card: it opens Safari" +check
```

Found something off? Use the feedback button in TestFlight. It lands on the board, and reply, copy and links all started there.

```try
/changelog | Every build, change by change
/progress | The ship log, with more shots
```
