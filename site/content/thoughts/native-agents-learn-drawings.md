---
date: 2026-10-07
tag: release
title: "Native agents now draw a new thing and keep it"
dek: Ask a native agent for something we never drew and it draws one beside the film. A second pass keeps the good ones, so the next ask starts faster. It works, and the first draw is still rough.
---

```shot
/demo/motion/look/m29-chart.jpg | Left: seconds to the first scene for 19 nouns, first ask then second ask. Green is a second ask that hit a kept drawing. Right: share of frames that pass, 22% on first asks, 79% on hits.
```

Native agents could only draw what the seed holds: 93 drawings. Ask for a trombone and you got a kit word instead.

## What changed

- A film about a thing the seed lacks now draws it, beside the film writer. One call, kit shapes only.
- After the answer, a background step draws it again and a judge checks it. A pass is kept and shared, so it is a seed hit for everyone. Only the noun is stored, never what you wrote.
- It never runs inside a turn. Two at a time, 20 a day, two tries per noun. One flag turns it off.

## What landed

Fresh account, a native agent, 19 nouns asked twice. 10 of them were unseeded and drew their own hero on the first ask.

- 7 of those 10 second asks hit a kept drawing.
- On those 7, the first scene went from 3.5 s to 2.9 s at the median. Frames that pass went from 26% to 79% (42 frames).
- Over all 10 drawn: 3.5 s to 3.1 s, and 22% to 63%.

## What missed

- Trombone was not kept. The second ask drew again and took 8.2 s.
- Ukulele and tuba failed the judge.
- In 3 asks a kit word answered, so nothing new was drawn.
- Over all 19 nouns, the second ask was not faster: 3.1 s then 3.6 s, with 31% then 46% of 108 frames passing.
- Native first asks pass 22% of frames. The Hermes plugin passes 80%. That gap is the next thing to close.
