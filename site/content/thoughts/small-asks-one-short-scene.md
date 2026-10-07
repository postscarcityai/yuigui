---
date: 2026-10-06
tag: release
title: "We tried one short scene for small asks"
dek: A small ask like "Build 548 is live" draws a whole film today. We gave it one scene instead. It was much faster and much worse. We did not ship it.
---

```compare
before: /demo/motion/look/m7-before.jpg | Before: the full film made for each small ask
after: /demo/motion/look/m7-after.jpg | After: the one-scene film for the same asks
```

Drag the line. Quick, yes. Good, no.

## The problem

Ask for "Build 548 is live on TestFlight" on [the web page](/web) and you get a film of five scenes. It takes about 22 seconds to make and plays for 25. That is a lot of film for one line.

## What we tried

A plain rule, read from the ask alone. One sentence. Twelve words or fewer. None of the words that ask for a process, a comparison or a feeling, like how, why, steps, compare, mood or week.

An ask that passes gets one scene of about 6 seconds from the fast model. No stream behind it. Same drawing kit, same checks.

We ran the 20 asks of the look pass, plus 5 small asks we added, twice each.

## What happened

The rule sent all 5 added asks the small way. It sent none of the 20 old ones. The old set had almost no small asks in it.

For the small asks, time to a whole film fell from 21.7 seconds to 6.3. Scenes went from 5 to 1.

But frames that passed the look check fell from 34% to 0%. A second prompt asking for a big hero drawing got 10%. One run made no scene at all.

Full asks did not change. Frame pass was 41.7% before and after. We reverted the tier.

## What we learned

The single scene from the fast model is the weak scene. In every full film, the frames that passed came from the later scenes by the bigger model. The opener alone is plain, cramped, small, or does not move in the first 0.6 seconds.

So a small ask is cheap to make. It is not cheap to make well. Asking the fast model for more detail did not close the gap.

We could not read the cost of the small film, because the call closes the moment the scene lands. So cost never decided this.

## Next

Give the same one scene to the big model. About 15 seconds, one call. Check the pass rate again. The rule that picks small asks is fine, so we keep it.

See films on [the web page](/web), the work on [the motion page](/motion), and the last try in [films draw the real thing](/thoughts/films-draw-the-real-thing).
