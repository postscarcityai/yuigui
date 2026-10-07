---
date: 2026-10-06
tag: release
title: "We tried to make films draw the real thing"
dek: Ask for an engine and you often get a box that says engine. We gave the film maker real objects to draw. It helped some films and not enough. We did not ship it.
---

```compare
before: /demo/motion/look/m6-before.jpg | Before: one frame per scene, with a verdict under each
after: /demo/motion/look/m6-after.jpg | After the objects: fewer plain frames, more cramped ones
```

Drag the line. Fewer boxes. Not fewer enough.

## The problem

Films on [the web page](/web) are drawn by a model that writes the scenes blind. Ask for an engine and it often draws a rectangle with the word engine on it. We saw this in the [look pass](/thoughts/films-get-a-look-pass). About 30 frames out of 228 were plain drawings, and 36 drew something other than the ask.

## Three causes

A heart, a chicken, a cup come out as a coloured blob. The model cannot build a shape it recognises from path strings it cannot see.

Asks about data or work (people, tax, a settings list) turn into a bar chart or boxes. There is no object under them.

Later scenes drift. Only the first scene shows the thing you asked for.

## What we tried

A set of 17 drawn objects in the film kit, built part by part: heart, chicken, mug, car, battery, plant, robot, watering can, engine, dog, box, coins and a few more. A phone that writes out its real rows. And one check before every scene: does this scene still draw the noun of the ask, big?

## What happened

Plain drawings fell from 30 to 19. Off-subject drawings only fell from 36 to 32. Together that is 66 to 51, down 23%. We needed down a third.

Frame pass rate moved 43.4% to 44.4%. First scene stayed near 4.5 seconds. Cramped frames went from 15 to 37, because big objects crowd the labels.

So we did not ship it. The patch is kept.

## What we learned

Films about a screen, a status or numbers got better. Settings, status, workout and people went from 8 plain frames to 1 or 2.

Hearts, chickens and Rome did not move. The model often ignores the object we hand it and paints its own blob. And the look check wants chambers and a map, not an icon.

## Next

Let the plugin pick the hero object from the ask, in a small step before the film, and place it in scene 1 itself. Cap its size so labels keep clear. Run the set three times, because the judge swings by about 5 frames.

See films on [the web page](/web) and [the motion page](/motion).
