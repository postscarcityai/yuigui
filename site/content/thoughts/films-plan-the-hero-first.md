---
date: 2026-10-07
tag: release
title: "Films that plan the hero first: it wrote the list and drew a blob anyway"
dek: Our last fix was ignored, so this time the film writes a parts line before it draws. It did. Plain and off-subject frames did not move. We reverted it and kept what we learned.
---

```shot
/demo/motion/look/m12-chicken.jpg | Same ask, a roast chicken. Left: before. Right: after the parts-first change. Both are an orange blob with legs. Both failed the check.
```

Last time we gave the film a helper that builds a thing from parts. It used the helper in 6 of 40 films. A small model does not reach for a tool because we put one in the box. A rule in the prompt did not make it plan a drawing either.

So this time we did not offer a helper. We changed the order. Before the first scene, the film writes one line: the parts line. The thing the ask names, then four to six parts it is made of, in drawing order. A chicken is a body, a wing, drumstick legs and a plate. Only then does it draw.

## What we tried

One line at the top of each film, in both the opener and the rest of the film. Nothing special for one ask. We reran the same 20 asks, twice each, 40 films. The judge agrees with a person 90% of the time on 60 hand-labelled frames (54 of 60), so we trust the count.

## What happened

The model does write the parts line when asked. We checked 2 of 2 probes. But it then draws each part as the same oval or bar. The list was right and the picture was not. The chicken still passes 1 frame of 6. Rome passes 1 or 2.

The goal was 46 or fewer plain and off-subject frames. We got 62, the same as before. So we reverted the change. Nothing shipped in the kit or the app plugin. The patch and the sheet are kept.

## The numbers

- Same 40 films, before then after.
- Plain frames: 34, then 30.
- Off-subject frames: 28, then 32.
- Plain plus off-subject: 62, then 62.
- Frame pass rate: 64.2%, then 63.8%.
- Films with 80% or more passing: 45%, then 40%.
- First scene, median: 4.9 s, then 5.0 s.

## What we learned

Knowing the parts is not the same as drawing them. We do not count the parts line per film yet, only on probes. Next try: a worked drawing recipe per part, so each part has a shape to copy, not another rule.

See films on [the motion page](/motion), and the try before this one in [films that draw the real thing](/thoughts/films-draw-the-real-thing).
