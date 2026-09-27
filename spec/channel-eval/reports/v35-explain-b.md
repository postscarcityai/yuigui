# Channel eval: v35-explain-b

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
The Mongols rode out from the middle of Asia's great grass belt and, at their peak in 1279, held the largest land empire ever.

```yui
>full
deck "The Mongols, by the map"
page "Born on the steppe" body="Mongolia sits in the heart of Eurasia: high grassland, the Gobi to the south, forest to the north. Herding horses, not farming, fit this land."
shapes caption="The steppe is a grass highway from Manchuria to Hungary."
shape@hu dot Hungary at=1,2 tone=mute
shape@mo circle Mongolia at=6,2 +grow +fill tone=butter
shape@ma dot Manchuria at=9,2 tone=mute
shape arrow from=mo to=hu +draw
shape arrow from=mo to=ma +draw
shape text Gobi at=6,4 tone=mute
page "Riding out, 1206 to 1279" body="Genghis Khan united the tribes in 1206. His heirs pushed west into Russia and Persia, and south into China."
shapes caption="From Karakorum, armies used the open grass to strike in every direction."
shape@ka circle Karakorum at=6,2 +pulse +fill tone=butter
shape@ru box Russia at=2,1 tone=lavender
shape@pe box Persia at=2,4 tone=lavender
shape@ch box China at=8,4 tone=mint
shape arrow from=ka to=ru +draw
shape arrow from=ka to=pe +draw
shape arrow from=ka to=ch +draw
page "The biggest on land"
chart bar "Land empires at peak, million km²" x=Mongol|Russian|Qing|Roman y=24|22.8|14.7|5
page "Split into four" body="Too big for one ruler, it broke into four khanates by the 1260s: the Golden Horde, the Chagatai, the Ilkhanate and the Yuan."
shapes caption="Each khanate took one region of the old empire."
shape box "Golden Horde" at=2,1 tone=lavender
shape box Chagatai at=5,2 tone=butter
shape box Ilkhanate at=3,4 tone=mute
shape box Yuan at=8,3 tone=mint +fill
end
```
````

### explain-rome-rise-fall (pass)

**Chris:** Give me the quick version of how the Roman Empire rose and fell.

Good: A line, then a picture per part: a rough map of the empire at its peak in `shapes`, its size over the centuries as a `chart` (or a `timeline` on the stage), the split as two shapes. No page that is only a heading and a paragraph.

````
Rome grew from a city-state into a Mediterranean superpower. Civil wars turned it into an empire, and the West fell in 476 while the East lasted until 1453.

```yui
>full
deck "Rome, rise and fall"
page "A city conquers the sea" body="Rome took Italy by 264 BC, then crushed Carthage in the Punic Wars (264–146 BC) and swept up Spain, Greece and North Africa."
shapes caption="From one city, Rome spread across the whole Mediterranean."
shape@sp dot Spain at=1,2 tone=mute
shape@ro circle Rome at=4,2 +grow +fill tone=butter
shape@gr dot Greece at=7,3 tone=mute
shape@ca dot Carthage at=3,4 tone=mute
shape@eg dot Egypt at=8,5 tone=mute
shape arrow from=ro to=sp +draw
shape arrow from=ro to=ca +draw
shape arrow from=ro to=gr +draw
shape arrow from=ro to=eg +draw
page "Republic becomes empire" body="Conquest made generals richer than the Senate. Caesar won a civil war and was killed in 44 BC. His heir Augustus became the first emperor in 27 BC."
shapes caption="Wealth from conquest broke the republic; one man took control."
shape box Republic
shape arrow
shape pill Caesar +pulse
shape arrow
shape circle Augustus +grow +fill tone=lavender
page "The peak, AD 117" body="Under Trajan the empire reached from Britain to Mesopotamia, followed by two centuries of the Pax Romana."
stat "5M km²" "About 60 million people"
page "The fall" body="Civil wars, inflation, plague and overstretched borders weakened it. It split in 395. Germanic kingdoms took the West in 476, while the East, Byzantium, held on for another thousand years."
shapes caption="One empire split in two, and the halves fell a millennium apart."
shape@r box Rome at=5,1 +fill
shape@w circle "West, 476" at=2,4 tone=mute +dash
shape@e circle "East, 1453" at=8,4 +grow tone=mint
shape arrow from=r to=w +draw
shape arrow from=r to=e +draw
end
```
````

### explain-monsoon-how (pass)

**Chris:** Why does India get monsoons? Keep it short.

Good: One line and a diagram: land heats, air rises, wet air off the ocean moves in (`shapes` with arrows, placed with `at=`), maybe a rainfall `chart` by month. Not a paragraph of weather words.

````
In summer, land heats faster than the sea, so hot air rises over India and pulls wet ocean wind in, which rains out as it's forced up the mountains. In winter it flips and the wind blows dry off the land.

```yui
shapes "The summer monsoon" caption="Hot land draws wet sea air north; the Himalayas trap it, so it rains."
shape@oc blob "Indian Ocean" at=5,5 tone=mint +fill
shape@in circle "Hot India" at=5,3 tone=butter +fill +pulse
shape@hi box Himalayas at=5,1 tone=mute
shape arrow from=oc to=in +draw
shape arrow from=in to=hi +draw
shape text "Rain" at=7,2 tone=lavender +grow
```
````
