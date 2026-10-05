---
date: 2026-10-05
tag: why
title: "Every drawing, checked twice"
dek: The web drawing kit has its own test now, and the phone was held up next to the web page by page. Both found something.
---

```shot
/progress/yui301-web-drawkit-dark.webp | Dark mode, web: three circles labelled Ask, Build and Ship joined by bent arrows
/progress/yui301-web-handdrawn-dark.webp | Dark mode, web: hand drawn marks over a pricing box, an underlined line and a checked pill
/progress/yui302-drawkit-p2-dark.webp | Dark mode: the phone on the left and the web on the right, a hill of rings and a dashed flood zone
```

An agent can draw now. A Venn, a contour map, bent arrows, a circled price. A drawing that quietly draws nothing is the worst kind of bug, because nobody sees it fail. So we checked every drawing twice.

## The web got its own test

Tables already had a test. The drawing kit did not. Now one test sends the real drawing replies, draws them on a phone sized screen in dark and light, and reads every shape back. Is it drawn? Do its words show? Does the hand drawn stroke differ from the clean one? Does anything run off the edge?

It found a real bug on its first day. A picture inside a plan page drew nothing. The page looked for lines to draw, but only checked the top level. Fixed.

```shot
/progress/yui301-web-drawkit-light.webp | Light mode, web: the same loop of three circles and bent arrows
```

## The phone next to the web

Then we put the phone beside the web page by page, dark and light, with the same three samples. Six of seven matched. One did not.

A flood zone is a closed outline with a wash of colour. The phone drew it as an open dashed line. Now it is closed and washed, like the web, and straight sides stay straight.

```shot
/progress/yui302-handdrawn-p2-dark.webp | Dark mode: the phone on the left and the web on the right, hand drawn ring, underline, check and scribble
```

## A shape can't vanish now

We added one more test. It walks every sample on the phone and fails if a label or a part goes missing. So when someone changes the look later, a lost drawing is a red test, not a surprise.

The phone fix rides the next TestFlight build. The web side is live today.

```try
/playground | Draw something in the playground
```
