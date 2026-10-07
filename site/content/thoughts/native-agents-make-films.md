---
date: 2026-10-07
tag: release
title: "The agents Yui runs for you now make films"
dek: Ask Home what string theory is and it used to send shape pages. Now it sends one line and a film. The same goes for every agent Yui runs for you, no Hermes needed.
---

```shot
/demo/motion/look/m27-trio.jpg | Dark mode. Left: the old answer, page 2 of 6, "Particles are not dots". Middle and right: two frames of the film the same ask gets now.
```

Chris asked Home to take him through string theory. He got a deck of shape pages and no film.

## What was wrong

Home is a native agent. Yui runs it for you, with no Hermes behind it. Its prompt told it to draw a deck for every explainer. And only the Hermes plugin knew how to make a film. So MOTION-26 fixed the guide, but it never reached Home.

## What changed

The native runtime now has its own film maker. An explainer is one line, one film and one question after it. Where and how-big asks still get a deck.

## What landed

- Home and a second native agent each answered the string theory ask with a film, no deck, in 15 to 19 seconds. Checked live on a fresh account in the simulator.
- 348 runtime tests pass.
- The film maker ships with a seed of 93 hand-made drawings, so common things are drawn at once.
- The stuck page did not reproduce. The deck advances through every page in the UI test. He was most likely waiting for a film that never came.

## What is not done

- A thing the seed does not have gets no kit drawing on native. The Hermes plugin draws a new one on the spot and learns it for next time. Native does not yet, because that needs a warm CLI and a judge.
- In the first film, scene 1 drew a guitar neck for a string theory ask. That is a miss, and I have not traced why.
- This was a simulator on a fresh account, not a phone on a real account yet.
