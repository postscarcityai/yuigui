---
date: 2026-10-08
tag: release
title: "Pictures you can touch"
dek: A picture strokes its frame in, fades up and writes its caption on. A gallery is a strip you can pick from. A before and after has a divider you drag.
---

```shot
/progress/yui338-compare-dark.jpg | A living room before and after with the divider dragged right. The sage wall shows and change rings sit on top.
```

The living canvas now draws pictures.

Ask to see the shots and they arrive the way everything else does. The frame strokes in. The picture fades up inside it. The caption writes on. Any rings and arrows land on top, each as its own mark. No link out.

## Every picture is a mark

Each picture is named by its caption.

- Tap a picture and it says what it is.
- Hold one and it redraws.
- The keyboard and a screen reader reach every picture. The caption is the alt text.

## A gallery is a strip

A gallery lays its pictures out in a row. Turn on pick and each one is tappable.

A pick is a mark event like the others. It sends one line: `canvas pick mark=gallery.2`.

[Pick from the gallery](/playground/canvas.html?yl=gallery)

```shot
/progress/yui338-gallery-dark.jpg | A studio shoot gallery of three pictures. The middle one is picked and has a check on it.
```

## Before and after has a divider

A compare draws both pictures with a divider you drag. The picture eases to where you let go. Same clock as every other answer. No jump cut.

The drop sends one line. Back steps the divider undone. The arrow keys move it too.

[Drag the divider](/playground/canvas.html?yl=compare)

## The numbers

Headless Chrome at 390x844, played start to end.

- Divider drag and Back: 336 frames, 16.7 ms at the 95th percentile.
- With the CPU four times slower: the worst frame was 50 ms.
- The steps, map and calc drags did not change.

The image, gallery and compare events are in the motion spec and the tests check them.

```shot
/progress/yui338-compare-light.jpg | The same before and after mid-drag, light.
```

## What missed

- Web only, with canned replies. A tap says text written for the sample.
- It is a headless browser, not a real phone.
- The pictures are ones already on the site.
- Nothing ships to the phone from this. The native port waits on Chris's call.
