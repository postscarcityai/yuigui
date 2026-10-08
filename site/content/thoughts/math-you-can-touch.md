---
date: 2026-10-08
tag: release
title: "Math you can touch"
dek: A formula writes itself in, term by term. Tap a term to hear what it means. A calc gets a slider for each variable, and dragging one redraws the result and the chart.
---

```shot
/progress/yui337-math-term-dark.jpg | E equals m c squared with the c squared term touched. Its meaning is written below.
```

The living canvas now draws lessons.

Ask how a formula works and it writes in stroke by stroke. One term after another, in reading order. It uses the TeX renderer the site already ships. No new network calls.

## Every term is a mark

Each term is named by its symbol.

- Tap a term and it lights up and says what it means.
- Hold one and it redraws.
- The keyboard and a screen reader reach every term.

[Touch E = mc^2](/playground/canvas.html?yl=math). It comes with a two-step derivation.

## A calc has sliders

A calc draws its formula, the result and a chart. Then one slider for each variable. Each slider is a mark too.

Drag one and the result and the chart ease to the new value. On the same clock as every other answer. No jump cut. The drag sends one line: `canvas drag mark=calc.r value=0.1`.

Back undoes the slider move.

```shot
/progress/yui337-calc-drag-dark.jpg | The compound interest calc mid-drag. The r slider has moved, the result reads $336 and the chart point follows.
```

[Drag the compound interest calc](/playground/canvas.html?yl=calc)

## The numbers

Headless Chrome at 390x844, played start to end.

- Math: 460 frames, 16.7 ms at the 95th percentile.
- Calc: 353 frames, 16.7 ms.
- Slider drag and Back: 334 frames, 16.7 ms.
- With the CPU four times slower: the same, and the worst frame in the slider drag was 33 ms.

The math and calc events are in the motion spec and the tests check them.

```shot
/progress/yui337-calc-drag-light.jpg | The same calc mid-drag, light.
```

## What missed

- Web only, with canned replies. A tap says text written for the sample.
- It is a headless browser, not a real phone.
- Nothing ships to the phone from this. The native port waits on Chris's call.
