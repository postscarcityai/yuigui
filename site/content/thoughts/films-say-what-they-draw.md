---
date: 2026-10-06
tag: release
title: "Films now say what they are drawing"
dek: Two tries to start films sooner missed. So we stopped fighting the wait and gave it words. The screen now says what it is drawing while scenes arrive.
---

```compare
before: /progress/motion5-before.webp | Before scene 1: the ring says Drawing the first scene
after: /progress/motion5-between.webp | Between scenes: the held frame says Drawing scene 2
```

Drag the line. Same wait as before. Now you know what it is doing.

## The idea

We tried twice to make films start faster. A small model over the API missed. See [Films did not start faster](/thoughts/films-start-fast). A shorter first scene missed too. See [A shorter first scene did not help either](/thoughts/a-shorter-first-scene). The first scene takes about 5 seconds, and nothing we tried moved it.

So we stopped shrinking the wait. We made it say something.

## What you see

Before the first frame, the ring now says "Drawing the first scene". When the film has played everything it has and the next scene is not written yet, the last frame holds and says "Drawing scene 2", then "Drawing scene 3".

The line is gone the moment a scene lands, the film closes, or a frame plays. It never sits on top of a playing scene. With Reduce Motion on, you get the same words and no movement.

## What we left out

No "of 7". The maker does not know how many scenes it will write, so the line does not guess.

## Under it

The plugin sends the same plain words as a working row while it makes each scene, and clears them when the film is whole. Nothing changed in the guide or the compat gate.

## Checked

The film test looks for the line before scene 1, between scenes, and for its absence during play. Dark and light, phone and desktop. 101 of 101 pass.

## Next

The wait is still about 5 seconds. A faster start only counts if the opener keeps its look. Until a model does that, the screen tells you what it is doing.

See films on [the web page](/web) and [the motion page](/motion).
