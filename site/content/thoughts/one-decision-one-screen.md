---
date: 2026-10-02
tag: why
title: One decision, one screen
dek: A question and the pictures it is about now share a screen. Why Yui never asks you to pick from memory, and what changed on the web app today.
---

```compare
before: /progress/site176-split-question-light.webp | Split: the question, with nothing to look at
after: /progress/site176-one-screen-light.webp | One screen: the look, the three to compare, the question
```

Chris, on TestFlight, Oct 2: "We should never split a decision where it shows the context on one and the answer options on the next. For a machine that is logical, for humans it doesn't work."

He is right, and the proof is one question: which drawing look should Yui use?

## How it was split

```shot
/progress/site176-split-page-light.webp | Light, phone width: the last look, Chalk, on a screen with a Next button and no question
/progress/site176-split-question-light.webp | Light, phone width: the next screen asks Which drawing look should Yui use, with buttons A, B, C and nothing to look at
/progress/site176-split-page-dark.webp | Dark: the same look screen
/progress/site176-split-question-dark.webp | Dark: the same question screen
```

Three looks, one per screen. Then a fourth screen with the question and three buttons: A, B, C.

By then the looks are gone. You are asked to choose between things you can no longer see.

## How it reads now

```shot
/progress/site176-one-screen-light.webp | Light, phone width: look C, then looks A, B and C as small pictures, then the question and its options, all on one screen
/progress/site176-one-screen-dark.webp | Dark: the same screen
```

The question sits under the look it follows. The earlier looks show small above the buttons, and a tap on one is the answer. You choose with the pictures in front of you.

Questions with no page before them stay one per screen. There is still one Send at the end.

## Why a machine splits it anyway

For a machine, order is enough. It sent the pictures, then it sent the question. Both arrived. Nothing was lost.

A person does not keep a picture in mind while a screen changes. So what you decide and the buttons to decide it go on the same screen. It is value nine on the [values page](/developers/values#9-one-decision-one-screen).

Today the web app follows it. The phone app gets the same rule on its own card.

```try
/web | Open the web app
/developers/values#9-one-decision-one-screen | Read the value
```
