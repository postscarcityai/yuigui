---
date: 2026-09-26
tag: why
title: "The chat becomes the record"
dek: "You talk, and the answer plays full screen in short parts with a picture each. Questions come last, one Send. The chat moves top right and keeps the record. The mock is live; the app build is next."
---

```shot
/progress/yui119-answer-light.webp | Am I on the latest build? The stage answers in one line, Yes. Build 160, the newest, over a picture of the iPhone and the iPad
/progress/yui119-record-dark.webp | The chat, top right: every part as one row with its picture, and the answers under them
```

Chris asked Yui a status question on Sep 26 and got eight full screen pages back to say he was up to date. He sent it through the feedback button with a bigger idea attached.

"I don't want this thing to just be a chat with some things that pop out. How can we like live more in the pop-up and then always have the chat just a reference?"

```shot
/progress/yui119-ask-light.webp | The stage waiting for you: your agent top left, the record top right, a big mic bottom right
```

So the full screen stops being something that pops out of the chat. It is where you live. The chat is still there, it just stops being the main thing.

## You talk, the stage answers

"As I send my first chat, instead of seeing the stupid three dots, I'm just immediately taken into a full screen experience." That is the first thing the mock does. The stage opens on your first send and says what the agent is doing while it works.

The answer comes as short parts. Each one is a line you can read in a second and a picture that shows it. A status question gets one part, not eight.

```shot
/progress/yui119-working-light.webp | The stage right after you send: a working line while Yui checks
/progress/yui119-release-light.webp | A part of a longer answer: Build, Checks, TestFlight drawn as a row, and 0.3.2 is building under it
```

## Questions last, one Send

Chris wanted the agent to ask for everything it needs at the end, all at once. When the agent needs you, it waits for the last page and asks everything there. You pick, you tap Send once.

```shot
/progress/yui119-questions-answered-light.webp | Before I go: two quick questions with the answers picked, and one Send button
```

## The chat is the record

Chris: "The chat is just a record." It moves behind a button top right. Every part you saw sits there as one row with its picture, so you can scroll back. Your agents sit top left with the menu beside them. A big mic sits bottom right, with T to type and + to attach.

```shot
/progress/yui119-bars-1-dark.webp | The bars: menu and agent top left, the record top right, the big mic with T and + bottom right
```

## What happens next

This is a web mock, drawn by the same renderer the app uses for Yui Lines. Chris looked at it on Sep 26, asked for the bottom buttons a notch smaller, and said go. Tap through it yourself.

```try
/playground?demo=stage-first | Try the full screen stage
/mockups#stage-1 | Every shot, light and dark
```

Next is the app. Your first send goes straight to the stage, then the new bottom bar and top bar. After that the stage learns to move with what the agent is doing, and last, a visualizer that listens. Each of those is its own release on TestFlight, and each starts as a mock here first.
