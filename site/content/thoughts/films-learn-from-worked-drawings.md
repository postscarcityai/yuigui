---
date: 2026-10-07
tag: release
title: "Films shown worked drawings: the model read them and drew a blob anyway"
dek: Three rule tries did not move plain and off-subject frames. So we showed the film four finished part drawings to copy. Nothing moved. We reverted it and kept what we learned.
---

```shot
/demo/motion/look/m14-chicken.jpg | Same ask, a roast chicken, the same film twice. Left of each pair: before. Right: after the worked drawings. Scenes 3 and 6. Still a blob with legs. All four frames failed the check.
```

Ask for a roast chicken and you get an orange oval with two stubs. We have now tried to fix that four times. This is the fourth.

## The problem

Plain and off-subject frames are the top failure. Plain means a box, a ring or a blob. Off-subject means a picture that is not the thing you named. On our 40 films (20 asks, twice each) there are 27 plain and 34 off-subject frames. That is 61. The goal was 46 or fewer.

## Three rules that did not work

- A parts helper and a stronger subject rule: it got worse. The film barely used the helper.
- A parts line before the first scene: the model wrote the list and drew each part as the same oval.
- Plus the first pass, which asked for real objects instead of labelled boxes.

All three were rules. A rule says what to do. It does not show a shape.

## What a worked drawing is

A worked drawing is a tiny finished example. Not "draw a leg". The actual path for a leg, drawn well, that the film can copy and move. We put four in the prompt: a leg, a wing, a column and a wheel.

The idea: a small model copies better than it follows instructions.

## What happened

The film read them. Nothing got worse, and 4 of 232 scenes reused an example. But it did not carry the idea to parts the examples do not show. A chicken drumstick is not a leg path, so it drew an oval.

The chicken passed 2 of 12 frames before and 0 of 12 after. We reverted the change. Nothing shipped in the kit or the app plugin. The patch and the sheet are kept.

## The numbers

- Same 40 films, before then after.
- Plain frames: 27, then 27.
- Off-subject frames: 34, then 34.
- Plain plus off-subject: 61, then 61. Goal: 46 or fewer.
- Frame pass rate: 65.2%, then 66.4%.
- Films with 80% or more passing: 47.5%, then 45%.
- First scene, median: 4.7 s, then 5.1 s.

The judge agrees with a person 95% of the time on 60 hand-labelled frames (57 of 60), so we trust the count.

## What we learned

Four tries in the prompt, four flat results. The prompt route is spent. The model can know the parts and see good drawings and still not draw the part.

So the next lever is not words. Either the kit draws the part: a library of silhouettes the film picks by name. Or when the first scene is judged plain, the film redraws its hero in scene 2.

See films on [the motion page](/motion), and the try before this one in [films plan the hero first](/thoughts/films-plan-the-hero-first).
