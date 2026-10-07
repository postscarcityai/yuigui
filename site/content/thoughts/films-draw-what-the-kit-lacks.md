---
date: 2026-10-07
tag: release
title: "Films learn to draw what the kit does not have"
dek: The kit draws 69 things. Ask for an octopus, an elephant or a submarine and the film still painted a blob. Now one cheap call sketches the new thing from kit shapes, then remembers it.
---

```shot
/demo/motion/look/m15-octopus.jpg | Same ask, an octopus, the same film twice. Top, before: only the kit, 1 of 6 frames pass. Bottom, after: the film draws the octopus from kit parts, 6 of 6 pass. First four scenes of each.
```

Ask how an octopus changes colour and the old film gave you a dome, then grey circles. The kit has no octopus, so nothing drew one.

## The problem

Our last fix gave films a kit: 69 finished objects the film can name and place. On asks the kit covers, it worked. Bad frames on the held-out kit asks went from 28 to 0.

An elephant, a telescope or a submarine was not in the kit. Those stayed as bad as before. A kit can only draw what is in it.

## What we tried

When the ask names something the kit cannot draw, one short model call sketches it. It takes about 4 to 6 seconds. It names the thing and returns 7 to 12 parts, built from five plain shapes.

We check every number and shape before the film sees it. The film then draws the thing big in every scene. Numbers, plans and feelings get no call. If the call fails, the film is made the old way.

## It remembers

The sketch is saved by name. The second octopus costs nothing. In our test the saved copy was used 10 times out of 10.

## The numbers

- Ten new asks we never used while building: giraffe, windmill, volcano, microscope, guitar, tractor, helicopter, piano, octopus, cactus.
- Plain plus off-subject frames: 37, then 9.
- Frame pass rate: 64%, then 90%.
- Films with 80% or more passing: 30%, then 85%.
- The elephant, telescope and submarine films: pass rate 62.5%, then 94.1%. Plain plus off-subject frames 11, then 0.
- Every ask with no kit object, across three sets: 68 bad frames, then 24.

The hero is also a little smaller now. Cramped frames on our 20-ask set fell from 16 to 0.

## What it costs

A thing seen for the first time makes the first scene slower. On the new asks the median first scene went from 4.9 s to 9.2 s. Every one of those was a new noun, and the same ask is quick after that. On asks the kit already covers it did not move much: 4.5 s to 4.9 s.

Not solved: 24 bad frames remain, and the first scene of a brand new thing is slow. A bigger kit would fix the slow part for common things.

The judge agrees with a person 92% of the time on a fresh check of hand-labelled frames. See films on [the motion page](/motion), and the try before this one in [films learn from worked drawings](/thoughts/films-learn-from-worked-drawings).
