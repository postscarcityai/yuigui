---
date: 2026-10-07
tag: release
title: "A new thing is drawn after its first ask. The second ask is quick."
dek: Ask for something we never drew and it still waits the first time. Now it gets drawn after the film, checked, and kept. Ask again and it starts at once.
---

```shot
/demo/motion/look/m25-chart.jpg | Bars: seconds to the first scene for the first and second ask of 12 things, and the share of frames that pass for the first ask, the second ask of a learned thing, and a seed hit.
```

Last time we said: any noun outside the list still waits. This is the fix for the second time it is asked.

## What waited every time

The kit draws 68 things. The seed adds 93 more. Anything else, a typewriter, a harp, a stapler, made the model sketch the shapes while you waited. About 4 to 7 s. The sketch sometimes came out wrong. Ask again tomorrow and it did the same again.

## What happens now

The first ask works as before. After the film ends, one background job draws the thing again with the same parts call as the seed, renders it, and runs the same judge. A pass is kept. A fail writes nothing. It never runs during a turn. Two at a time, 20 a day. `YUI_MOTION_LEARN=off` turns it off.

A drawing costs about 3 cents and takes 9 to 17 s.

## The numbers

12 things, each asked twice in different words, empty cache.

- Background drawings: 10 of 11 passed the judge. The typewriter did not.
- 9 of the 12 second asks found a kept drawing. First scene 4.0 s median, their first asks 4.6 s. Slowest 4.9 s, was 7.4 s.
- Those 9, frames that pass: 98%, was 80% on the first ask.
- That matches a seed hit: 4.0 s, 95%.
- The 3 that did not learn stayed on the old path: 4.0 s and 61% of frames. The kayak paddle was named as a paddle. The typewriter failed. The bulldozer was already a seed mountain.
- All 12 together: 88% of frames, was 78%.

## Shipped

Yes, with one catch. The background job finds its judge in a clean copy of the site code, and it needs the plugin to load it. That means a gateway restart first.

Honest notes. One run, 12 things, a quiet host. The first ask is not faster. Only the second one is. And a fail teaches nothing, so a thing the judge dislikes stays slow.

```shot
/demo/motion/look/m25-learned.jpg | The 11 drawings the background job made after a first ask. 10 were kept by the judge.
```

Next: retry a failed drawing once with the judge's note, or learn the word forms like "paddle" for "kayak paddle". Before this: [93 things drawn ahead](/thoughts/80-things-drawn-ahead). Films live on [the motion page](/motion).
