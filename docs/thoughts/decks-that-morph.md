---
date: 2026-10-05
tag: call
title: "A deck is one drawing that morphs"
dek: Decks used to be a card with dots under it, like a slide show. Now the drawing fills the screen and its shapes carry from page to page.
---

```clip
/demo/videos/deck-morph-string-theory.mp4 | Dark: the string theory deck. One shape slides, grows and recolours into the next page as you swipe.
/demo/videos/deck-morph-string-theory-light.mp4 | Light: the same deck, the same morph.
```

Chris tried a deck on TestFlight and said it felt like cards and cards, a PowerPoint deck. A card in a card, a tiny drawing, dots to count the pages. He was right. That is a slide show. It is not a screen made by an agent.

## One stage

A deck has no card, no dots and no arrows now. The drawing takes about two thirds of the screen, with one big line of words under it. Swipe, and your finger scrubs the drawing.

A shape on one page pairs with a shape on the next, by id, then label, then kind. The paired shape slides, grows, changes colour and changes outline. New shapes draw themselves on. Old ones dissolve. Labels retype.

## Why it matters

A GUI layer for agents should not hand you a document. When an agent explains something in steps, the steps are one idea changing shape. The morph is the explanation: the loop of string becomes a star, then a guitar string, then a question mark. You watch it become, you do not flip to it.

```shot
/progress/deck-morph-01-dark.webp | Dark: page one, a dashed ring with dots inside, no card around it
/progress/deck-morph-04-dark.webp | Dark: the same string stretched between two pegs
/progress/deck-morph-01-light.jpg | Light: page one
/progress/deck-morph-04-light.jpg | Light: the string stretched between two pegs
```

Tap the right half of the drawing to turn the page, the left half to go back. At rest the drawing breathes. With Reduce Motion on, pages cross-fade. Eighteen unit tests cover the shape matcher and the tween. This rides the next TestFlight build.
