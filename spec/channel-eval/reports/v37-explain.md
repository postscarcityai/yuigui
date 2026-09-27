# Channel eval: v37-explain

Guide v37+f825adcb (3479 words), model claude-opus-5-5, 2026-09-27T18:08.

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

Good: One line with the answer, then one deck on `>full` where every page has its picture: the empire as a `map` (its outline in lat,lon points, Karakorum as a pin, routes east and west), the size as a `chart` or a `stat`. Not pages of text, and not the steppe drawn as dots in `shapes` (TestFlight feedback AJIE1_1Ru1V4EMgmpWZtniI: 'It's just a text bomb'; feedback AL2nKEYo on the shapes version: 'Again, not bad but this should be a Map').

````
The Mongols came out of the grassland steppe of Mongolia and, within about 70 years, built the largest land empire in history, from Korea to Hungary.

```yui
>full
deck "The Mongols, by the map"
page "Born on the steppe" body="Open grassland between Siberia's forests and the Gobi. Horses and endless pasture made herders into fast-moving cavalry. Genghis Khan united the tribes in 1206."
map caption="Karakorum, the capital, sat in the Orkhon valley of central Mongolia."
area Homeland MN tone=mint
pin@ka Karakorum 47.2,102.8 +pulse
page "How far it reached" body="The steppe was a highway: riders crossed it east into China and Korea, west into Persia, Russia and Europe."
map caption="At its peak in 1279 it ran from the Pacific to the Danube."
area "Mongol Empire" 53,140|43,131|34.7,126.5|22.3,114|24,98|34,70|25.5,57|33,44|41,31|46,30.5|54,23|60,56|55,95 tone=butter
area Raided PL|HU|JP +dash
pin@ka2 Karakorum 47.2,102.8 +pulse
route East ka2|37.6,127 +arrow
route West ka2|50.4,30.5 +arrow
page "Split into four" body="Too big to rule from one tent. By the 1260s it broke into four khanates, each drawing on the lands it held."
map caption="Yuan in China, Chagatai in Central Asia, the Ilkhanate in Persia, the Golden Horde over the Russian steppe."
area Yuan CN|MN tone=butter
area Chagatai UZ|KG|TJ tone=mint
area Ilkhanate IR|IQ|AZ|AM tone=lavender
area "Golden Horde" 56,30|58,50|56,65|52,80|45,78|43,60|44,47|46,33
page "The biggest on land"
chart bar "Land empires, million km²" x=Mongol|Russian|Qing|Roman y=24|22.8|14.7|5
end
```
````

### explain-rome-rise-fall (pass)

**Chris:** Give me the quick version of how the Roman Empire rose and fell.

Good: A line, then a picture per part: the empire at its peak as a `map` around the Mediterranean, its size over the centuries as a `chart` (or a `timeline` on the stage), the split as an east and west area. No page that is only a heading and a paragraph.

````
Rome grew from a small city into a Mediterranean empire, peaked around 117 AD, split in two, lost the West in 476 AD, and held the East until 1453.

```yui
>full
deck "Rome, rise to fall"
page "From city to empire" body="753 BC: a kingdom on the Tiber. 509 BC: kings out, Republic in. Legions and alliances took Italy, then Carthage and Greece. Civil wars ended with Augustus as first emperor in 27 BC."
shapes caption="Each stage grew out of the last one's wars."
shape circle Kingdom
shape arrow
shape box Republic +fill
shape arrow
shape pill Empire +grow tone=butter
page "The peak, 117 AD" body="Under Trajan, Rome ran from Britain to Mesopotamia. The Mediterranean was a Roman lake, linked by roads, trade and law."
map caption="Everything around the sea answered to Rome."
area "Roman Empire" 55,-3|51,4|48,8|48.5,17|48,26|45,30|41,40|41,45|33,45|30,48|29,35|24,33|30,20|31,10|34,-6|36,-9|43,-9|48,-5|50,-5 tone=butter
pin Rome 41.9,12.5 +pulse
page "The cracks" body="Too much border to guard. Generals seized the throne; about 26 emperors in 50 years. Inflation, plague, and pressure from Goths, Huns and Persians."
shapes caption="Weak rulers, a broke treasury and a long border fed each other."
shape box "Civil wars" tone=mute
shape arrow
shape box "Broke treasury" tone=mute
shape arrow
shape blob Invasions +pulse tone=lavender
page "Split, then fall" body="395 AD: split for good into West and East. 476: the last Western emperor is deposed. The East, run from Constantinople, lasted until the Ottomans took it in 1453."
map caption="The West fell in 476; the East held nearly a thousand more years."
area West 55,-3|51,4|48,8|48.5,17|42,19|37,21|31,20|31,10|34,-6|36,-9|43,-9|48,-5|50,-5 +dash tone=mute
area East 42,19|48.5,17|48,26|45,30|41,40|41,45|33,45|29,35|24,33|31,20|37,21 tone=butter
pin Rome 41.9,12.5
pin Constantinople 41.0,29.0 +pulse
end
```
````

### explain-monsoon-how (pass)

**Chris:** Why does India get monsoons? Keep it short.

Good: One line and a picture: land heats, air rises, wet air off the ocean moves in, as a diagram in `shapes` with arrows or a `map` with the winds as routes, maybe a rainfall `chart` by month. Not a paragraph of weather words.

````
In summer, land heats faster than sea. Hot air rises over India and Tibet, and moist ocean air rushes in to replace it, dumping rain as it rises over the Ghats and Himalayas. In winter the flow reverses and it's dry.

```yui
map "Summer monsoon" caption="Low pressure over hot land pulls wet ocean winds in from the southwest."
area India IN tone=butter
pin@ti "Tibetan Plateau" 32,88 +pulse
pin@ar "Arabian Sea" 12,62
pin@bb "Bay of Bengal" 14,88
route "Wet winds" ar|15.5,74 +arrow
route "Wet winds" bb|25.5,91.5 +arrow
```
````
