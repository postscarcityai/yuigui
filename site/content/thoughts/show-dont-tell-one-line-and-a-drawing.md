---
date: 2026-09-30
tag: why
title: "Show, don't tell: one line and a drawing"
dek: Chris asked for pictures with short text. Yui replies are now one line and a drawing, and a reply can draw a diagram or a whole screen.
---

Chris, on Sep 30: "I want drawings and illustrations to show what we're talking about, in addition to short text."

He was getting paragraphs spread over several bubbles. So we scored the last 50 replies first.

```compare
before: 44% ran over 30 words\n32% drew more than one text bubble\n36% were one short line plus a drawing | The last 50 replies
after: One short line\nOne drawing\nUp to 3 ideas on one page | The rule now
```

## What changed

Three things.

The channel guide (v44) has a hard rule: one line of caveman words, 30 at most, then a drawing in Yui Lines. Never a generated image.

The Yui plugin now checks every reply before it sends. A reply over 30 words, with a second prose bubble, or opening with "so" or "got it" is cut to one line and its picture. It starts in shadow mode, which only logs counts.

The channel eval has six new cases that fail on prose. Old guide: 11 of 18 runs pass. New guide: 18 of 18.

## Before and after

Same asks. Each shot shows the old reply, then the new one.

```shot
/progress/vis1-card-dark.webp | Dark mode, before and after: put a card in for a daily morning release
/progress/vis1-misread-dark.webp | Dark mode, before and after: You misread me, I meant the left drawer
/progress/vis1-briefing-dark.webp | Dark mode, before and after: the morning briefing
/progress/vis1-warroom-dark.webp | Dark mode, before and after: a war room row in the left drawer
/progress/vis1-card-light.webp | Light mode, before and after: put a card in for a daily morning release
```

```try
/playground?demo=one-line | Play the two side by side
```

## What a reply can draw

A sketch of a screen, for when you ask about something on the phone.

```phone
caption: A sketch. Tap it, it is live.
sketch "Board" frame=window
row "Site: good"
row "New feature: needs help" +hi note="design pick"
```

Shapes, for an idea that is a loop or a flow of parts.

```phone
caption: Shapes.
shapes "Working"
shape circle Worker +pulse
shape arrow
shape box "Site fix"
```

A diagram, for a process. Yui writes Mermaid and it is drawn in the agent's look.

```shot
/progress/draw1-flowchart-dark.webp | Dark mode: a flowchart of how an ask ships
/progress/draw1-sequence-light.webp | Light mode: a sequence diagram of sending a message
```

```try
/playground?demo=diagram-flowchart | Play the flowchart
/playground?demo=diagram-sequence | Play who talks to whom
```

A mock, for a screen. Yui rebuilds it from parts: nav, rows, fields, cards, a keyboard.

```shot
/progress/draw1-mock-agents-dark.webp | Dark mode: a phone mock of the Agents screen
/progress/draw1-mock-browser-light.webp | Light mode: a browser mock of a pricing page
```

```try
/playground?demo=mock-agents | Play the Agents screen
/playground?demo=mock-browser | Play the pricing page
```

## Where it stands

The guide (v45) now teaches the rule: a flow is a diagram, a screen is a mock, a loose idea stays shapes. It has eval cases for each. The plugin check is still in shadow mode. Scored on the same 50 replies, it would leave 86% as one line plus a drawing. The rest are prose-only replies, which the guide has to fix, since the gate cannot invent a drawing.

Something still wordy? The feedback button in TestFlight goes straight onto the board.
