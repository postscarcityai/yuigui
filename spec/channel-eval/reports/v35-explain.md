# Channel eval: v35-explain

Guide v35+a49e80ac (3343 words), model claude-opus-5-5, 2026-09-27T13:11.

**3/3 passed (100%).**

| category | passed |
|---|---|
| explain | 3/3 |

| case | result | why |
|---|---|---|
| explain-mongols-geography | pass |  |
| explain-rome-rise-fall | pass |  |
| explain-monsoon-how | pass |  |

## Transcripts

### explain-mongols-geography (pass)

**Chris:** All right, can you give me a brief geographic explanation of the Mongols?

Good: One line with the answer, then one deck on `>full` where every page has its picture: the steppe as a rough map in `shapes` with `at=x,y` (Karakorum, Korea, Hungary), the spread over time as a `chart`, the size as a `stat`. Not pages of text, then a stat and bullets (TestFlight feedback AJIE1_1Ru1V4EMgmpWZtniI: 'It's just a text bomb').

````
The Mongols came from a high grassland plateau north of the Gobi, and they used the Eurasian steppe as a highway to build the largest land empire in history.

```yui
>full
deck "The Mongols, by the map"
page "A high plateau of grass" body="Mongolia sits about 1,500 m up, between Siberian forest to the north and the Gobi Desert to the south. The grass fed horses, and horses meant every herder was also a cavalry rider."
shapes caption="Forest above, desert below, grass in between."
shape text "Siberian forest" at=5,1 tone=mute
shape blob Steppe at=5,3 +grow +fill tone=mint
shape text Gobi at=5,5 tone=butter
page "The grass highway" body="The steppe runs unbroken from Manchuria to Hungary. From Karakorum, riders could cross it end to end with little in the way, taking remounts from the land as they went."
shapes caption="Karakorum sat at the eastern end and rode out both ways."
shape@hu dot Hungary at=1,2 tone=mute
shape@ka circle Karakorum at=7,2 +grow +fill tone=butter
shape@ko dot Korea at=9,3 tone=mute
shape@ch dot China at=8,4 tone=mute
shape arrow from=ka to=hu +draw
shape arrow from=ka to=ko +draw
shape arrow from=ka to=ch +draw
page "Four khanates" body="After 1260 the empire split into four: the Golden Horde on the Russian steppe, the Ilkhanate in Persia, the Chagatai Khanate in Central Asia, and the Yuan dynasty in China."
shapes caption="Each piece ruled a different edge of the steppe."
shape box "Golden Horde" at=2,1 +fill tone=butter
shape box Ilkhanate at=2,4 +fill tone=lavender
shape box Chagatai at=5,3 +fill tone=mint
shape box Yuan at=8,4 +fill tone=butter
shape dot Karakorum at=7,1 +pulse
page "The biggest one on land" body="At its peak around 1279, it covered about 24 million km², roughly a sixth of Earth's land."
chart bar "Land empires, million km²" x=Mongol|Russian|Qing|Roman y=24|22.8|14.7|5
end
```
````

### explain-rome-rise-fall (pass)

**Chris:** Give me the quick version of how the Roman Empire rose and fell.

Good: A line, then a picture per part: a rough map of the empire at its peak in `shapes`, its size over the centuries as a `chart` (or a `timeline` on the stage), the split as two shapes. No page that is only a heading and a paragraph.

````
Rome grew from a city-state into a Mediterranean empire over roughly 500 years. The West fell in 476 AD, and the East lasted until 1453.
```yui
>full
deck "Rome, rise to fall"
page "A city takes the sea" body="From 509 BC the Republic conquered Italy, then beat Carthage in three wars, then took Greece, Gaul and Egypt."
shapes caption="Rome pushed outward in every direction from the middle of the Mediterranean."
shape@ga dot Gaul at=3,1 tone=mute
shape@ro circle Rome at=5,2 +grow +fill tone=butter
shape@gr dot Greece at=7,3 tone=mute
shape@ca dot Carthage at=4,4 tone=mute
shape@eg dot Egypt at=8,5 tone=mute
shape arrow from=ro to=ga +draw
shape arrow from=ro to=ca +draw
shape arrow from=ro to=gr +draw
shape arrow from=ro to=eg +draw
page "Republic becomes empire" body="Conquest made generals richer than the Senate. Caesar took power and was killed in 44 BC. His heir Augustus became the first emperor in 27 BC."
shapes caption="Rich generals ended the Republic."
shape pill Republic
shape arrow
shape box Caesar +pulse
shape arrow
shape circle Augustus +grow +fill tone=lavender
page "Peak, then slow shrink" body="Two centuries of Pax Romana followed. The empire was largest under Trajan in 117 AD, with about 60 million people."
chart line "Territory, million km²" x=200BC|50BC|117AD|390AD y=0.4|2|5|4.4
page "Why the West fell" body="Civil wars, a debased currency and pressure on the borders wore it down. The empire split in 395. The West fell to Germanic kings in 476, and the East, Byzantium, lasted until 1453."
shapes caption="The empire split in two. The West fell, and the East lasted another thousand years."
shape pill "Split 395"
shape arrow
shape box "West 476" +dash tone=mute
shape box "East 1453" +fill tone=mint +pulse
end
```
````

### explain-monsoon-how (pass)

**Chris:** Why does India get monsoons? Keep it short.

Good: One line and a diagram: land heats, air rises, wet air off the ocean moves in (`shapes` with arrows, placed with `at=`), maybe a rainfall `chart` by month. Not a paragraph of weather words.

````
In summer, land heats up faster than the sea, so warm air rises over India and pulls wet ocean winds inland. The Himalayas trap that air and it falls as rain. In winter, the pattern reverses and the winds blow dry from land to sea.

```yui
shapes "Summer monsoon" caption="Hot land draws in wet sea air; the mountains wring it out."
shape@hi box Himalayas at=5,1 tone=mute +fill
shape@in circle "Hot India" at=5,3 tone=butter +fill +pulse
shape@oc blob "Indian Ocean" at=4,5 tone=mint +fill
shape arrow from=oc to=in +draw
shape arrow from=in to=hi +draw
shape text Rain at=7,2 tone=lavender +grow
```
````
