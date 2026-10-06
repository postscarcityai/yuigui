---
date: 2026-10-06
tag: why
title: "Explainers draw every page"
dek: Chris asked for an ELI5 and got pages of text. Now every page of an explainer comes with its drawing, and a page of only words is sent back to be drawn.
---

Chris, on Oct 5: "I asked for an eli5 for string theory. I got a bunch of text on multiple screens. No drawings, no charts, no nothing."

```shot
/progress/eli5-before-after.webp | Dark mode, before and after: a title over a struck-out paragraph with no drawing, then the same ask with shapes on the page
/progress/eli5-every-page-drawn.webp | Dark mode: five pages of the string theory deck, each with its own drawing
```

## What changed

Same ask, same five pages. Now each one has a picture: a dot becoming a loop, a list of wiggles, an arrow to the hidden dimensions, a big zero.

```shot
/progress/eli5-page-light.webp | Light mode: page one of the string theory deck, a dot with an arrow to a string
```

```try
/playground?demo=explainer-eli5 | Play the ELI5 deck
```

## Why it holds

The agent now has three worked decks with a picture on every page, so it copies the shape. Then a guard checks the deck before it sends. A page with no picture sends the whole deck back for one redraw, and the redraw is kept only if it is better.

On the eval with GLM 5.2, 3 of 5 cases drew every page before. Now 5 of 5.

Still see a page of only words? The feedback button in TestFlight goes straight onto the board.
