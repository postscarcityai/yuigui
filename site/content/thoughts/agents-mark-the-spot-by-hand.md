---
date: 2026-10-05
tag: why
title: Agents mark the spot by hand
dek: An agent can ring a price, underline a line and tick a box, loose and a little wobbly, like a pen. It works on the web now and lands on the phone in the next build.
---

```shot
/progress/yui298-web-dark.webp | Dark: a pricing box ringed by a loose scribble, an underlined line and a tick, drawn on the web.
/progress/yui299-phone-dark.webp | Dark: the same marks on the phone, a ringed Pricing page, Ship it today underlined and a green check by Fix login.
```

A good note points at the thing. So an agent can now circle it, underline it or tick it off. The strokes wobble a little, like a hand did it, and they draw on one after another.

## Marks that look like a pen

Add +hand to a box, circle, pill, line or arrow and the edge turns loose. Three marks sit on top of any picture: a scribble that rings a spot, an underline, and a check. The wobble is seeded, so the phone and the web draw the same one.

```compare
before: /progress/yui299-phone-dark.webp | Dark
after: /progress/yui299-phone-light.webp | Light
```

## Callouts, brackets and arcs

Point at a part with a callout. Span a group with a bracket. Bend an arrow into a loop. The agent writes all of it as plain shape lines, the same way it writes everything else.

```shot
/progress/yui297-p3-dark.webp | Dark: a feed screen with two callouts pointing at parts and a bracket labeled Feed.
/progress/yui297-p4-dark.webp | Dark: Ask, Build and Ship joined by three bent arrows in a loop.
```

## What is live

The marks are in the spec and the four parsers read them. Try them on the site now. The phone draws them in the next build.

```try
/playground?demo=handdrawn | Draw by hand in the playground
/progress | See the progress entry
```
