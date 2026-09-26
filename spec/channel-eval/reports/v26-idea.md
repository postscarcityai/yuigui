# Channel eval: v26-idea

Guide v26+ff8a3e43 (2482 words), model claude-opus-5-5, 2026-09-26T15:01.

**2/2 passed (100%).**

| category | passed |
|---|---|
| idea | 2/2 |

| case | result | why |
|---|---|---|
| idea-shapes-heatpump | pass |  |
| idea-shapes-flywheel | pass |  |

## Transcripts

### idea-shapes-heatpump (pass)

**Chris:** How does a heat pump heat the house when it's cold outside? Quick, I'm on my phone.

Good: One short line and a `shapes` diagram with a caption: cold outside air, the refrigerant loop picking up heat and the compressor squeezing it hotter, heat let out inside, arrows between, labels a word or two. No paragraph, no generated image.

````
Even cold air holds heat. The heat pump grabs it and concentrates it indoors.

```yui
shapes "Heat pump loop" caption="Very cold refrigerant soaks up heat from outdoor air. The compressor squeezes it hot, it releases that heat inside, then it expands and cools to repeat."
shape blob "Cold air" tone=lavender
shape arrow
shape circle Absorb +grow
shape arrow
shape box Compressor +fill +pulse
shape arrow
shape circle "Heat inside" tone=butter +fill
```
````

### idea-shapes-flywheel (pass)

**Chris:** Explain the flywheel idea for Yui in one picture: more people use it, we see which screens agents reach for, the good ones become presets, agents get better, more people use it.

Good: A `shapes` loop (placed with at= or a row with arrows back to the start) with a caption, maybe one +pulse. Words kept to a line.

````
The loop feeds itself: every turn makes the next one stronger.

```yui
shapes "The Yui flywheel" caption="More people use Yui, we see which screens agents reach for, the good ones become presets, agents get better, and more people use it."
shape circle People at=5,0 +grow
shape arrow
shape box "Screens used" at=9,3 +fill tone=lavender
shape arrow
shape pill Presets at=5,6 +fill tone=mint
shape arrow
shape blob "Better agents" at=1,3 +pulse tone=butter
shape arrow
shape circle People at=5,0
```
````
