---
date: 2026-09-27
tag: release
title: "Yui 0.4.2: one Send per screen"
dek: A small release from the feedback button. When Yui asks you a few things on one screen, there is one Send at the end, and nothing else that looks like one. Build 216 is on TestFlight.
---

```shot
/progress/yui156-before-after.webp | Before and after on the same questions screen: before, the About you form had its own Sent button; after, it is just Name, Role and Oneliner
/progress/yui159-review.webp | The plan review: Pages you want, About, Contact; Who is it for, Clients; one Send
```

Build 216 is on TestFlight. It is Yui 0.4.2.

It comes from one note Chris sent with the TestFlight feedback button: "I don't see a reason to have a send button on about you section." Yui had asked six questions on one screen with one Send. The form in the middle drew its own button anyway. Tapping it said Sent and sent nothing.

A screen that asks you things should have one way to answer. Now it does.

## Forms are just fields

A form inside a plan, or on the full screen's questions, draws no button of its own. You type, and what you typed rides along with the screen's one Send.

```shot
/progress/yui156-stage-dark.webp | The full screen questions in dark mode: the About you fields with no button under them
/progress/yui156-answered-dark.webp | The answer that went back: name, role and one-liner inside the plan's reply
```

## Picks too

A pick had the same problem: a Done under its options, next to the screen's Send. Now a pick inside a plan is just its options. In a plan that asks one thing at a time, Next moves on and the review lists what you picked. A pick on its own in the chat keeps its Done.

```shot
/progress/yui159-pager.webp | A plan step, Pages you want, with About and Contact ticked and only Back and Next below
/progress/yui159-stage.webp | Pages you want on the full screen questions: About and Work ticked, no Done button under the options
```

## Also live

Two fixes on the agent's side reach every build, not only this one. A flow the phone can't run yet arrives as a plan with the same questions, so an interview never dead-ends. And an explainer draws every page: a rough map, a chart or a big number, never a page of text.

```shot
/progress/yui155-plan-kind.webp | A client website intake as a plan, step 3 of 7: What are we building, with Back and Next
/progress/yui157-explainer-page1.webp | The Mongols, by the map: page 1 of 3, a rough map from Korea to Hungary with Karakorum in the middle
```

## What to try

This list is a real Yui screen. Tap the rows as you go.

```phone
caption: The 0.4.2 checklist, drawn from one line.
say "Try Yui 0.4.2. Tick each one as you go."
list "Ask Yui to interview you for a personal site" "Fill the form on the questions screen" "Tick a few pages, then look for one Send" "Send it and see every answer in the reply" +check
```

Something feel off? Use the feedback button in TestFlight. It goes straight onto the board.

```try
/s/form-one-send | One Send per screen, forms too
/s/pick-one-send | One Send per screen, picks too
/changelog#build-216 | Build 216, change by change
```
