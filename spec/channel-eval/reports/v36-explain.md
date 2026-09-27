# Channel eval: v36-explain

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
The Mongols came from the grassland north of China and rode the steppe that runs all the way to Europe.

```yui
>full
deck "The Mongols, by the map"
page "Home: the Mongolian plateau" body="High, cold grassland between Siberia's forests and the Gobi. Herders moved with horses and sheep, so the whole people could ride."
shapes caption="Temujin rose on the Onon and Kherlen rivers; Karakorum became the capital."
shape text Siberia at=6,0 tone=mute
shape@ka circle Karakorum at=5,2 +grow +fill tone=butter
shape blob Onon at=7,1 tone=mint
shape text Gobi at=6,4 tone=mute
shape box China at=8,5 tone=mute
page "A highway of grass" body="The steppe runs from Manchuria to Hungary with few barriers. Horse armies could cross it in months and reach every settled empire on its edges."
shapes caption="From the middle, they rode out east, west and south."
shape@hu dot Hungary at=0,1 tone=mute
shape@ka circle Karakorum at=6,1 +fill tone=butter
shape@ch dot China at=9,4 tone=mute
shape@pe dot Persia at=3,5 tone=mute
shape arrow from=ka to=hu +draw
shape arrow from=ka to=ch +draw
shape arrow from=ka to=pe +draw
page "Split into four" body="After 1260 the empire broke into four khanates, each ruling a different region."
shapes caption="Golden Horde north-west, Chagatai in the middle, Ilkhanate south-west, Yuan in the east."
shape pill "Golden Horde" at=1,1 tone=lavender
shape pill Chagatai at=4,3 tone=mint
shape pill Ilkhanate at=1,5 tone=butter
shape pill Yuan at=8,3 +fill tone=mint
page "The biggest land empire" body="At its peak around 1279, it covered roughly a sixth of Earth's land."
chart bar "Land empires, million km²" x=Mongol|Russian|Qing|Roman y=24|22.8|14.7|5
end
```
````

### explain-rome-rise-fall (FAIL)

**Chris:** Give me the quick version of how the Roman Empire rose and fell.

Good: A line, then a picture per part: the empire at its peak as a `map` around the Mediterranean, its size over the centuries as a `chart` (or a `timeline` on the stage), the split as an east and west area. No page that is only a heading and a paragraph.

- map: a where answer with no map

````
Rome grew from a city-state into a Mediterranean empire, peaked around AD 117, split in two, and the West fell in 476 while the East lasted until 1453.

```yui
>full
deck "Rome, rise to fall"
page "A city takes the sea" body="From 509 BC, the Republic conquered Italy, then beat Carthage in three wars. By 146 BC it also held Greece. The Mediterranean became a Roman lake."
shapes caption="Rome rode out in every direction and made the sea its own."
shape@ga dot Gaul at=3,1 tone=mute
shape@ro circle Rome at=5,2 +grow +fill tone=butter
shape@gr dot Greece at=8,3 tone=mute
shape@ca dot Carthage at=4,4 tone=mute
shape arrow from=ro to=ca +draw
shape arrow from=ro to=gr +draw
shape arrow from=ro to=ga +draw
page "Republic to emperors" body="Rich generals like Caesar used their armies against Rome. After the civil wars, Augustus became the first emperor in 27 BC. Two centuries of relative peace followed, and the empire hit its peak under Trajan."
chart area "Roman territory, million km² (rough)" x=250BC|100BC|50BC|AD117|AD390 y=0.4|1.2|2|5|4.4
page "Pressure from every side" body="From AD 235, the empire had 26 emperors in 50 years. Debased coins, plagues and raids across the frontiers weakened it. Diocletian split the job in two, and Constantine built a new capital in the East."
shapes caption="The strains piled onto an empire too big to run from one place."
shape box "Civil wars" at=1,1 tone=mute
shape box Plague at=1,5 tone=mute
shape box Inflation at=9,1 tone=mute
shape box Migrations at=9,5 tone=mute
shape circle Empire at=5,3 +pulse +fill tone=lavender
page "The West falls, the East holds" body="Goths sacked Rome in 410. The last western emperor was deposed in 476. The eastern half, called the Byzantine Empire, ruled from Constantinople until the Ottomans took it in 1453."
chart bar "How long each half lasted after the split, years" x=West|East y=81|1058
end
```
````

### explain-monsoon-how (pass)

**Chris:** Why does India get monsoons? Keep it short.

Good: One line and a picture: land heats, air rises, wet air off the ocean moves in, as a diagram in `shapes` with arrows or a `map` with the winds as routes, maybe a rainfall `chart` by month. Not a paragraph of weather words.

````
In summer the land heats up faster than the ocean. Hot air rises over India and pulls in wet sea air from the southwest, which rains out when it hits the mountains. In winter the land cools, and the wind reverses and turns dry.

```yui
shapes "The summer monsoon" caption="Hot land draws wet ocean air north; the Ghats and Himalaya wring out the rain."
shape@hi box Himalaya at=5,0 tone=mute +fill
shape@in circle "Hot India" at=5,2 +grow +fill tone=butter
shape@gh pill Ghats at=3,3 tone=mint
shape@oc blob "Indian Ocean" at=3,5 tone=lavender +fill
shape arrow from=oc to=gh +draw
shape arrow from=gh to=in +draw
```
````
