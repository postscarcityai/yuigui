---
date: 2026-10-07
tag: release
title: "Films that draw the real thing: our first fix made it worse"
dek: A chicken came out as an orange blob. We tried a parts helper and a stronger rule. Plain and off-subject frames went up, not down. We reverted it and kept what we learned.
---

```shot
/demo/motion/look/m11-chicken.jpg | Same ask, a roast chicken, the same scene in both films. Left: before. Right: after the fix we tried. Both are a blob with legs. Both failed the check.
```

Ask for a roast chicken and the film hands you an orange oval. That is what plain and off-subject mean on the judge: the picture is a box, a ring or a blob, not the thing you named.

## The problem

After the judge and still-check fixes, these were the top two failures. 36 plain frames and 36 off-subject frames out of 277. The judge now agrees with a person 93% of the time on 60 hand-labelled frames, so we trust the count.

We read all 72 frames. Two root causes:

- A named animal or machine is drawn as one oval with legs or a face stuck on.
- An activity or a place has nothing to draw, so the film falls back to a bare chart, a ring or a row of labels.

## What we tried

Two generic changes, nothing special for one ask. A helper that builds a thing from parts (bird, dog, fish, robot, car, temple, plant, skyline). And a stronger rule in the film prompt: draw the named thing from recognisable parts, use a chart only when the ask is about numbers.

We reran the same 20 asks, twice each, 40 films.

## What happened

It got worse. The film used the helper in only 6 of 40 films, and the chicken still came out a blob. The goal was a quarter fewer bad frames. It went the other way.

So we reverted both. Nothing shipped in the kit or the app plugin. The patch is kept.

## The numbers

- Same 40 films, before then after.
- Plain frames: 34, then 38.
- Off-subject frames: 28, then 33.
- Frame pass rate: 64.2%, then 62.2%.
- Films with 80% or more passing: 45%, then 37.5%.
- First scene, median: 4.9 s, then 5.2 s.

## What we learned

A rule in the prompt does not make a small model plan a drawing. Next try: the film writes a short parts list for its hero first, then draws from that list.

See films on [the motion page](/motion), and the check before this one in [films that sit still](/thoughts/films-that-sit-still).
