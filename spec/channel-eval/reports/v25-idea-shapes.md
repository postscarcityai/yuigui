# Channel eval: v25-idea-shapes

Guide v25+f1a8a28f (2423 words), model claude-opus-5-5, 2026-09-26T14:38.

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
Even cold air holds heat. The refrigerant runs colder than the outside air, so it soaks heat up, and the compressor concentrates it indoors.

```yui
shapes "Heat pump in winter" caption="Refrigerant grabs heat outside, gets squeezed hot, dumps it inside, then expands cold again."
shape blob "Outside air" tone=mute
shape arrow
shape box "Outdoor coil" tone=lavender
shape arrow
shape circle Compressor +pulse +fill
shape arrow
shape box "Indoor coil" tone=butter +fill
shape arrow
shape pill "Warm house" +grow
```
````

### idea-shapes-flywheel (pass)

**Chris:** Explain the flywheel idea for Yui in one picture: more people use it, we see which screens agents reach for, the good ones become presets, agents get better, more people use it.

Good: A `shapes` loop (placed with at= or a row with arrows back to the start) with a caption, maybe one +pulse. Words kept to a line.

````
```yui
shapes "The Yui flywheel" caption="More people use Yui, we see which screens agents reach for, the good ones become presets, agents get better, and more people use it."
shape circle People at=5,1 +grow
shape arrow
shape box "Screens used" at=8.5,3 +fill tone=lavender
shape arrow
shape pill Presets at=5,5 +fill tone=mint
shape arrow
shape blob "Better agents" at=1.5,3 tone=butter
shape arrow
shape circle "More people" at=5,1 +pulse
```
````
