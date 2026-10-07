---
date: 2026-10-07
tag: release
title: "Ask what string theory is, get a film"
dek: Yui answered "what is string theory" with a deck of shape pages and no film. Two guide rules were fighting. Now an explainer is one line and one film.
---

```shot
/demo/motion/look/m26-pair.jpg | Before: a deck page, "Strings, not dots", in big type on an empty screen. After: the first frame of the film made for the same ask, one vibrating string.
```

Chris asked Yui to take him through string theory. He got shape pages. No film. He said so in the TestFlight note.

## What went wrong

The guide had two rules. One said: explain by picture, and the picture moves. The other said: explainers draw every page of a deck. The model picked the deck.

## What changed

Any how-it-works, what-is, why or walk-me-through ask is now one line and one film, with at most one question after it. The deck stays for where (a map) and how big (a chart). Shapes stay a small still drawing and never stand in for a film.

## The numbers

Four new asks: string theory, how a black hole forms, photosynthesis, how the stock market works. Full suite of 144 cases, run twice on each guide, on Opus 5.5.

- New guide: 122 and 121 of 144.
- Old guide: 120 and 115 of 144.
- String theory: films 2 of 2 with the new guide, 0 of 2 with the old.
- The other three asks already got a film on both guides.
- The suite swings by about 5 cases between runs, so the overall gain is small. The string theory case is the real change.
- Map and chart explainers did not regress. One case missed once on the new guide (Rome), and passed on the other run.

## Shipped

The guide is live on the site and synced to the Yui agent. The agent loads it after its gateway restarts. Until then, the old rule can still answer. One ask, one run: this is an eval, not yet a phone test.
