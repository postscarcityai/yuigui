---
date: 2026-09-29
tag: why
title: "Show me, don't tell me"
dek: "Chris sent five TestFlight notes in one day, and they all said the same thing. Answers were wordy, counted things in sentences, and took four screens to say yes. Now Yui draws the answer."
---

```phone
caption: Is the board up to date? This is the whole answer. Tap it, it is live.
sketch "Board" frame=window
row "Site: good"
row "New feature: needs help" +hi note="design pick"
row "SEO: strong"
```

Before, that question got five screens. Chris counted.

## Five notes, one complaint

On Sep 29 Chris sent five notes from TestFlight. Answers ran long. Items were counted in sentences. Four screens said yes. A sample row was read as a real ask.

He did not ask for a nicer tone. He asked for less.

```phone
caption: Am I on the latest build? Drag nothing, just read both.
sketch "Am I on the latest build?" frame=bubble
row "Yes. Your phone is on build 160, the newest on TestFlight. A few things to know..." +x note="4 pages to say yes"
after
row "Yes, build 160, the newest. Your iPad is on 135." +hi note="one line"
```

## Status is a grid, not a paragraph

A status answer is one row per thing, `Label: verdict`, in one to three words. A short note says why. No intro, no "overall", no count in words.

```phone
caption: Same news, no sentences.
sketch "Status" frame=window
row "Site: good"
row "Build: shipping" +hi note="waiting on Apple"
row "SEO: strong"
```

## An outcome is drawn

A declined invite is the invite, struck out, with its result beside it. A worker at work is a small picture of the worker, pulsing.

```phone
caption: Declined, drawn.
sketch "Invite" frame=bubble
row "Team sync, Friday 3 pm" +x note="declined"
```

```phone
caption: Working, drawn.
shapes "Working"
shape circle Worker +pulse
shape arrow
shape box "Site fix"
```

## The answer and its question share a screen

Chris's second complaint was a page titled One question that asked whether to do what the last page had just offered. Now the drawing and the one question sit on the same screen. If Yui can just do it, it says so and does it.

## An example is not an ask

The first draft of these rules taught a new lesson. Yui showed a sample board with `New feature: needs help, waiting on you`. Chris asked what it was waiting on him for. Yui named an old, unrelated ask.

Two faults. The sample looked real. And the question was about the screen just shown, but the answer was not.

```phone
caption: Ask about a screen, get an answer about that screen.
sketch "What are you waiting on me for with this?" frame=bubble
row "One thing: OK the spend to test the four new models before they go live in Yui." +x note="an old ask, not this screen"
after
row "Nothing. That board was a sample." +hi note="answers what he asked"
sketch "A sample board" frame=window
row "Site: good"
row "New feature: needs help" +hi note="example"
row "SEO: strong"
```

Samples now say they are samples. A question about a screen answers about that screen first. An old ask only comes back if it is still open, with when Chris last saw it and what he answered.

## Did it work

Each rule shipped with test prompts the guide is scored on, and the numbers are here as they came out.

```phone
caption: The new cases, old guide against new.
stat "0 of 3" "Old guide: status, invite, worker" sub="the three prompts Chris hit"
stat "3 of 3" "New guide: same three" sub="drawn, short, one screen"
stat "3 of 3" "New guide: answer about this screen" sub="the context cases"
```

The full suite swings by about five cases run to run. The old guide scored 90 and 84 on two runs, the new one 83. When Yui reran the ten cases flagged, nine cleared, and the tenth fails on the old guide too. So the new rules cost nothing, and they fixed what Chris hit.

## Try it

Ask Yui a status question and count the screens. Then open the sample that started the last note.

```try
/s/try-context-this-screen | The screen that answers about itself
/playground?demo=status-tiles | Status as tiles
```
