# Channel eval: v21-shapes-cases

Guide v21+c8559a2b (2063 words), model claude-opus-5-5, 2026-09-26T00:31.

**0/2 passed (0%).**

| category | passed |
|---|---|
| idea | 0/2 |

| case | result | why |
|---|---|---|
| idea-shapes-heatpump | FAIL | screen: no ```yui block; need: none of [shapes]; words: 49 > 45 |
| idea-shapes-flywheel | FAIL | need: none of [shapes] |

## Transcripts

### idea-shapes-heatpump (FAIL)

**Chris:** How does a heat pump heat the house when it's cold outside? Quick, I'm on my phone.

Good: One short line and a `shapes` diagram with a caption: cold outside air, the refrigerant loop picking up heat and the compressor squeezing it hotter, heat let out inside, arrows between, labels a word or two. No paragraph, no generated image.

- screen: no ```yui block
- need: none of [shapes]
- words: 49 > 45

````
Even cold air holds heat. The pump runs refrigerant colder than the outside air, so it soaks up that heat. A compressor then squeezes the gas, making it much hotter, and that heat is released indoors. It moves heat rather than making it, which is why it's so efficient.
````

### idea-shapes-flywheel (FAIL)

**Chris:** Explain the flywheel idea for Yui in one picture: more people use it, we see which screens agents reach for, the good ones become presets, agents get better, more people use it.

Good: A `shapes` loop (placed with at= or a row with arrows back to the start) with a caption, maybe one +pulse. Words kept to a line.

- need: none of [shapes]

````
Each turn feeds the next, and the last feeds the first.

```yui
chart donut "The Yui flywheel" x="1 · More people use Yui"|"2 · We see which screens agents reach for"|"3 · The good ones become presets"|"4 · Agents get better" y=1|1|1|1
```
````
