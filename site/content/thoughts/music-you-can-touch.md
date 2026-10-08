---
date: 2026-10-08
tag: release
title: "Music you can touch"
dek: A beat is a grid you tap. A keyboard locks the keys outside the scale. Chords are big buttons that strum. Every cell, key and chord is a mark.
---

```shot
/progress/yui339-loop-dark.jpg | A boom bap beat mid-play on the canvas. Kick, snare, clap and hat rows, a tapped kick cell lit, the playhead on step 4.
```

The living canvas now draws music.

Ask for a beat and it arrives the way everything else does. The rows stroke in under their kit names: kick, snare, clap, hat. The hits pop in. A playhead sweeps the columns on the canvas clock while it plays.

## A beat is a grid you tap

Every cell is a mark.

- Tap a cell and the hit toggles. The beat redraws in place.
- Each toggle sends one line: `canvas loop mark=loop.1.2 p=xx..x.x.|...`.
- Back steps it undone.

[Tap a beat](/playground/canvas.html?yl=loop)

## Keys stay in the key

A keyboard draws in its key. The keys outside the scale are drawn locked, so you cannot hit a wrong note. A tap plays a key and sends `canvas play`.

[Play the keys](/playground/canvas.html?yl=keys)

## Chords are big buttons

Each chord is a button you strum. Change the key with `~chords key=D` and the buttons redraw in the new key on the clock. No jump cut.

[Strum the chords](/playground/canvas.html?yl=chords)

```shot
/progress/yui339-chords-dark.jpg | Four big chord buttons in G, one just strummed.
```

## Every part is a mark

Each cell, key and chord has a name.

- Tap one and it says what it is.
- Hold one and it redraws.
- The keyboard and a screen reader reach every cell, key and chord.

The sound is the playground's own Web Audio. No sample files. Nothing plays until your first tap.

## The numbers

Headless Chrome at 390x844, played start to end.

- Loop playing, 8 cell taps and Back: 631 frames, 16.7 ms at the 95th percentile. The worst frame was 16.8 ms.
- Chords, 8 strums: 224 frames, 16.7 ms at the 95th percentile.

The loop, keys and chords events are in the motion spec and the tests check them.

```shot
/progress/yui339-loop-light.jpg | The same beat mid-play with the playhead sweeping, light.
```

## What missed

- Web only, with canned replies. A tap says text written for the sample.
- It is a headless browser, not a real phone. Audio timing there is not measured.
- Nothing ships to the phone from this. The native port waits on Chris's call.
