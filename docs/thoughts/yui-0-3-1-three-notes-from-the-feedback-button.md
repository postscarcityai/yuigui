---
date: 2026-09-26
tag: release
title: "Yui 0.3.1: three notes from the feedback button"
dek: What you were typing stays put, a lesson is one deck you swipe, and an ask you answered leaves the war room at once. Build 160 is on TestFlight.
---

```shot
/progress/fb-ak9fnezu-3-back.webp | Back in the chat after a full screen, the half-typed question still in the box
/progress/yui-113-1-shapes.webp | Page one of a lesson deck: a small diagram over the words Money that grows on itself
```

Build 160 is on TestFlight. It is Yui 0.3.1, a small release.

Every change in it started as a note from the feedback button on Sep 26. Each one names something that got in the way. Each one is fixed.

## What you were typing stays put

Chris, Sep 26: "I was writing in the text box and then a new answer came in and took over the screen with a full screen. But then when I came back my query was lost."

Now each agent's thread keeps its own unsent words, saved as you type and cleared when you send. A full screen, another agent, leaving the app or closing it all leave them where they were.

```shot
/progress/fb-ak9fnezu-3-back.webp | After the agent's Tabata full screen, the question is still in the composer
/progress/fb-ak9fnezu-4-relaunch.webp | Close the app and open it again: the thread still holds its unsent note
```

## A lesson is one deck

Chris, on a compound interest lesson: "I want all that to be in one experience." The diagram, the formula and the chart had come as loose cards before the lesson itself.

Now a deck page can hold a diagram, a formula, a chart, a big number or a calculator as its picture. A lesson is one deck: an idea per page, a quiz, and the sliders at the end.

```shot
/progress/yui-113-1-shapes.webp | Page one: $100, plus 10%, makes $110
/progress/yui-113-2-chart.webp | Page three: $100 at 10% a year, bending upward over twenty years
/progress/yui-113-3-calc.webp | The last page: the formula with sliders for the start, the rate and the years
```

This is the same lesson as Yui Lines, drawn live. Swipe it.

```phone
caption: One deck, five pictures, one quiz, one calculator.
deck "Compound interest"
page "Money that grows on itself" body="Your interest joins the pile. Next year the pile earns interest too."
shapes
shape circle $100 +grow
shape arrow
shape box "+10%" +fill tone=butter
shape arrow
shape blob $110 +pulse tone=mint
page "The formula" body="P is what you put in, r the rate, t the years. A is what you end with."
math A = P(1 + r)^t
page "It bends upward" body="The same 10% adds more every year, because the pile keeps growing."
chart line "$100 at 10% a year" x=Y0|Y5|Y10|Y15|Y20 y=100|161|259|418|673
page "Twenty years later" body="You put in $100. Time did the rest."
stat $673 "After 20 years" delta=+573 spark=100|161|259|418|673
choose "Which lever grows the pile fastest?" "More time"|"Checking daily"|"A bigger first deposit only" answer="More time"
page "Try it" body="Slide the start, the rate and the years."
calc f="A = P*(1+r)^t" P=100-1000@100 r=0-0.2@0.05 t=0-20@10
```

A phone on an older build still gets every piece, laid out on one full screen.

## An answered ask leaves

Chris, on the war room: "I respond to cards and they don't go away." Now a tap on an answer redraws the war room right away, and the ask is gone.

```compare
before: /progress/fb-war-room-before.webp | Before: a checklist and a list of commits on top
after: /progress/fb-war-room-after.webp | After: one status line, then the asks
```

That part runs on the computer your agent lives on, so it worked before the build did. The war room went from 56 lines to 15 on the same day.

## What to try

This list is a real Yui screen. Tap the rows as you go.

```phone
caption: The 0.3.1 checklist, drawn from one line.
say "Try Yui 0.3.1. Tick each one as you go."
list "Start a message, let a full screen open, come back" "Switch agents mid-sentence" "Ask for a lesson on anything" "Answer an ask in the war room" +check
```

Something still in your way? Use the feedback button in TestFlight. This whole release came from it.

```try
/mockups#release-031 | See 0.3.1, screen by screen
/changelog#build-160 | Build 160, change by change
```
