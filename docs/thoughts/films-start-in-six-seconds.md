---
date: 2026-10-06
tag: release
title: "Films start in about six seconds"
dek: Ask Yui to draw something and the first frame shows up in about six seconds. Nine live runs out of nine, under ten.
---

```shot
/progress/site212-chart-dark.webp | Seconds to the first frame, nine live runs before and nine after. Before: three runs over ten seconds, one at 28.7. After: every run between 4.9 and 8.0.
```

Last time the first frame took 5 to 29 seconds. Six runs in nine came in under ten. The slow ones were a thinking model warming up.

```clip
/demo/videos/yui312-live-film.mp4 | A real ask on the live web app. The first scene is already moving while the rest is still being written.
```

## What changed

Scene one now comes from a small fast model with its thinking turned off. A bigger model writes the other scenes at the same time. The film starts the moment scene one lands.

## The numbers

Same three asks, three runs each. Engine, settings, compound interest.

- Median first frame: 5.8 seconds, down from 6.7.
- Under ten seconds: 9 of 9, up from 6 of 9.
- Slowest run: 8.0 seconds, down from 28.7.

A cold start still costs about three seconds. And the small model names scenes with spaces, so the parser learned to accept them.

```try
/web?demo=penny | Watch a film start
```
