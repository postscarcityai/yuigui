# Channel eval: v22-shapes-cases

Guide v22+d24d1f04 (2236 words), model claude-opus-5-5, 2026-09-26T00:32.

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
Cold air still holds heat. The pump grabs it with very cold refrigerant, squeezes it hot, and dumps it indoors.

```yui
shapes "Heat pump loop" caption="Refrigerant colder than the outdoor air soaks up heat, the compressor squeezes it hot, and the indoor coil releases it into the house."
shape blob "Outside air" tone=mute
shape arrow
shape box "Outdoor coil" tone=lavender +fill
shape arrow
shape pill Compressor +pulse
shape arrow
shape box "Indoor coil" tone=butter +fill
```
````

### idea-shapes-flywheel (pass)

**Chris:** Explain the flywheel idea for Yui in one picture: more people use it, we see which screens agents reach for, the good ones become presets, agents get better, more people use it.

Good: A `shapes` loop (placed with at= or a row with arrows back to the start) with a caption, maybe one +pulse. Words kept to a line.

````
Each turn of the loop makes the next one easier.

```yui
shapes "The Yui flywheel" caption="More people use Yui, we see which screens agents reach for, the best become presets, agents get better, and more people use it."
shape circle People at=5,0 +grow tone=mint +fill
shape arrow
shape box "Screens used" at=8,2 tone=lavender
shape arrow
shape pill Presets at=5,5 +pulse tone=butter +fill
shape arrow
shape box "Better agents" at=2,2 tone=lavender
shape arrow
shape circle People at=5,0 tone=mint +fill
```
````
