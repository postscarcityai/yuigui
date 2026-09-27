# Channel eval: v36-explain-b

Guide v36+abf12b50 (3367 words), model claude-opus-5-5, 2026-09-27T17:52.

**1/3 passed (33%).**

| category | passed |
|---|---|
| explain | 1/3 |

| case | result | why |
|---|---|---|
| explain-mongols-geography | FAIL | map: a where answer with no map |
| explain-rome-rise-fall | FAIL | map: a where answer with no map |
| explain-monsoon-how | pass |  |

## Transcripts

### explain-mongols-geography (FAIL)

**Chris:** All right, can you give me a brief geographic explanation of the Mongols?

Good: One line with the answer, then one deck on `>full` where every page has its picture: the empire as a `map` (its outline in lat,lon points, Karakorum as a pin, routes east and west), the size as a `chart` or a `stat`. Not pages of text, and not the steppe drawn as dots in `shapes` (TestFlight feedback AJIE1_1Ru1V4EMgmpWZtniI: 'It's just a text bomb'; feedback AL2nKEYo on the shapes version: 'Again, not bad but this should be a Map').

- map: a where answer with no map

````
The Mongols came from a grassland in the middle of Asia, and that same grass carried their horses from Korea to Hungary.

```yui
>full
deck "The Mongols, by the map"
page "A grassland homeland" body="Mongolia sits between Siberian forest to the north and the Gobi Desert to the south. The grass in between fed the horses, and the horses made everything else possible."
shapes caption="Forest above, desert below, horse country in the middle."
shape text Forest at=5,0 tone=mint
shape@st blob Steppe at=5,2 +grow +fill tone=butter
shape circle Karakorum at=5,3 +pulse
shape text Gobi at=5,5 tone=mute
page "One belt of grass" body="The Eurasian steppe runs almost unbroken from Manchuria to the plains of Hungary. Mongol armies rode it like a highway, west into Europe and east into China and Korea."
shapes caption="From Karakorum, the grass led both ways."
shape@hu dot Hungary at=1,2 tone=mute
shape@ka circle Karakorum at=6,2 +grow +fill tone=butter
shape@ch dot China at=8,4 tone=mute
shape@ko dot Korea at=9,2 tone=mute
shape arrow from=ka to=hu +draw
shape arrow from=ka to=ch +draw
page "The biggest land empire ever" body="At its peak around 1279 it covered about 24 million km², roughly a sixth of Earth's land."
chart bar "Land empires, million km²" x=Mongol|Russian|Qing|Roman y=24|22.8|14.7|5
page "Split four ways" body="After Kublai Khan, it broke into four khanates: the Golden Horde over Russia, the Ilkhanate in Persia, the Chagatai in Central Asia, and the Yuan dynasty in China."
shapes caption="West to east: Russia, Persia, Central Asia, China."
shape box "Golden Horde" at=2,1 +fill tone=butter
shape box Ilkhanate at=2,4 +fill tone=lavender
shape box Chagatai at=5,3 +fill tone=mint
shape box Yuan at=8,3 +fill +grow tone=butter
end
```
````

### explain-rome-rise-fall (FAIL)

**Chris:** Give me the quick version of how the Roman Empire rose and fell.

Good: A line, then a picture per part: the empire at its peak as a `map` around the Mediterranean, its size over the centuries as a `chart` (or a `timeline` on the stage), the split as an east and west area. No page that is only a heading and a paragraph.

- map: a where answer with no map

````
Rome grew from one city into a Mediterranean empire, split in two, and the West fell in 476 AD. The East lasted until 1453.

```yui
>full
deck "Rome, rise and fall"
page "City to superpower" body="A republic from 509 BC, Rome took Italy, then beat Carthage in the Punic Wars (264–146 BC). By then it held Spain, North Africa and Greece."
shapes caption="Rome sat in the middle and expanded outward."
shape@sp dot Spain at=1,3 tone=mute
shape@ga dot Gaul at=3,1 tone=mute
shape@ro circle Rome at=5,3 +grow +fill tone=butter
shape@ca dot Carthage at=4,5 tone=mute
shape@gr dot Greece at=7,4 tone=mute
shape@eg dot Egypt at=9,5 tone=mute
shape arrow from=ro to=sp +draw
shape arrow from=ro to=ga +draw
shape arrow from=ro to=ca +draw
shape arrow from=ro to=gr +draw
shape arrow from=ro to=eg +draw
page "Republic becomes empire" body="Generals with loyal armies broke the republic. Caesar crossed the Rubicon in 49 BC; Augustus became the first emperor in 27 BC. Two centuries of relative peace followed, and the empire peaked under Trajan."
stat "~5M km²" "Peak size under Trajan, 117 AD"
page "Crisis and split" body="In the 3rd century, 26 emperors in 50 years, inflation and border wars. Diocletian split the rule; Constantine built Constantinople. After 395 the halves never reunited."
shapes caption="The rich, defensible East outlasted the West by nearly a thousand years."
shape@w circle "West: Rome" at=2,3 tone=mute
shape@e circle "East: Constantinople" at=8,3 +fill tone=mint +pulse
shape text "395 AD" at=5,1
page "Why the West fell" body="Too much border, too little money, and constant civil war. Germanic peoples moved in, Rome was sacked in 410, and in 476 Odoacer deposed the last western emperor."
shapes caption="The causes compounded; there was no single blow."
shape box Overstretch
shape arrow
shape box "Civil wars"
shape arrow
shape box Invasions
shape arrow
shape pill "476 AD" +pulse tone=butter
end
```
````

### explain-monsoon-how (pass)

**Chris:** Why does India get monsoons? Keep it short.

Good: One line and a picture: land heats, air rises, wet air off the ocean moves in, as a diagram in `shapes` with arrows or a `map` with the winds as routes, maybe a rainfall `chart` by month. Not a paragraph of weather words.

````
In summer, the land heats up faster than the ocean. Hot air rises over India and pulls wet ocean air inland, where it rains out against the mountains. In winter the wind reverses and it turns dry.

```yui
shapes "Summer monsoon" caption="Hot land draws wet sea air in; mountains squeeze the rain out."
shape blob "Indian Ocean" tone=mint +fill
shape arrow +draw
shape circle "Hot land" tone=butter +pulse
shape arrow +draw
shape box "Ghats & Himalayas" tone=lavender
shape text Rain +grow
```
````
