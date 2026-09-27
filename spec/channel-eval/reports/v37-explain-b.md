# Channel eval: v37-explain-b

Guide v37+f825adcb (3479 words), model claude-opus-5-5, 2026-09-27T18:08.

**2/3 passed (67%).**

| category | passed |
|---|---|
| explain | 2/3 |

| case | result | why |
|---|---|---|
| explain-mongols-geography | pass |  |
| explain-rome-rise-fall | pass |  |
| explain-monsoon-how | FAIL | words: 52 > 50 |

## Transcripts

### explain-mongols-geography (pass)

**Chris:** All right, can you give me a brief geographic explanation of the Mongols?

Good: One line with the answer, then one deck on `>full` where every page has its picture: the empire as a `map` (its outline in lat,lon points, Karakorum as a pin, routes east and west), the size as a `chart` or a `stat`. Not pages of text, and not the steppe drawn as dots in `shapes` (TestFlight feedback AJIE1_1Ru1V4EMgmpWZtniI: 'It's just a text bomb'; feedback AL2nKEYo on the shapes version: 'Again, not bad but this should be a Map').

````
The Mongols came from the grasslands of Mongolia and, in about 70 years, rode out to build the largest land empire in history.

```yui
>full
deck "The Mongols, by the map"
page "Where they started" body="Horse herders on the high, dry steppe between the Siberian forest and the Gobi Desert. Open grass meant fast riders and no walls to stop them."
map caption="Temüjin, later Genghis Khan, rose near the Onon River and united the tribes in 1206."
area Homeland MN tone=mint
pin@on "Onon River" 48.8,110.5 +pulse
pin@ka Karakorum 47.2,102.8
page "How far it reached" body="The grassland belt runs across Eurasia, and the Mongols used it like a highway, from Korea to Hungary and from Siberia to Persia."
map caption="Karakorum sat in the middle; armies rode out east to China and west to Europe and the Middle East."
area "Mongol Empire" 53,140|43,131|34.7,126.5|22.3,114|24,98|34,70|25.5,57|33,44|41,31|46,30.5|54,23|60,56|55,95 tone=butter
area Raided PL|HU +dash
pin@k2 Karakorum 47.2,102.8 +pulse
route East k2|39.9,116.4 +arrow
route West k2|50.4,30.5 +arrow
page "Four khanates" body="By the 1260s it split into four realms run by Genghis's grandsons: the Yuan in China, the Golden Horde over the Russian steppe, the Chagatai in Central Asia, the Ilkhanate in Persia."
map caption="One family, four kingdoms, each drifting apart."
area Yuan CN|MN tone=butter
area "Golden Horde" 56,30|57,50|55,68|46,72|43,55|45,35 tone=lavender
area Chagatai UZ|KG|TJ tone=mint
area Ilkhanate IR|IQ tone=mute
page "At its peak, 1279"
stat "24M km²" "About a sixth of the land on Earth"
end
```
````

### explain-rome-rise-fall (pass)

**Chris:** Give me the quick version of how the Roman Empire rose and fell.

Good: A line, then a picture per part: the empire at its peak as a `map` around the Mediterranean, its size over the centuries as a `chart` (or a `timeline` on the stage), the split as an east and west area. No page that is only a heading and a paragraph.

````
Rome grew from one city into a Mediterranean empire, split in two, and the West fell in AD 476. The East held on until 1453.

```yui
>full
deck "Rome, rise and fall"
page "From city to empire" body="A republic from 509 BC. Rome beat Carthage in the Punic Wars (264–146 BC) and took the whole Mediterranean. Augustus made it an empire in 27 BC. It peaked under Trajan in AD 117."
map caption="At its height in AD 117, every shore of the Mediterranean was Roman."
area "Empire, AD 117" IT|ES|PT|FR|BE|GB|CH|AT|SI|HR|BA|RS|ME|AL|MK|GR|BG|RO|TR|CY|SY|LB|IL|JO|EG|LY|TN|DZ|MA tone=butter
pin@rome Rome 41.9,12.5 +pulse
page "Growth, then shrinking" body="Rome grew for three centuries, held steady for two, then lost the West fast."
chart area "Land ruled, million km² (approx.)" x="200 BC"|"50 BC"|"AD 117"|"AD 390"|"AD 476" y=0.8|2|5|4.4|1.5
page "Why the West fell" body="Emperors were killed and replaced constantly. Coins lost their silver and taxes crushed farmers. Goths, Vandals and Huns pushed across long borders the army couldn't hold."
shapes caption="Too big to defend, the empire fought itself while outsiders pushed in, until the West gave way."
shape box "Civil wars"
shape arrow
shape box "Weak money"
shape arrow
shape box "Border pressure"
shape arrow
shape blob "AD 476" +pulse tone=lavender
page "The East lived on" body="The empire split for good in 395. In 476 Odoacer deposed the last western emperor. The East, later called Byzantium, ruled from Constantinople until the Ottomans took it in 1453."
map caption="The West fell in 476; the East lasted almost a thousand years more."
area "West, fell 476" IT|ES|FR|GB|TN +dash tone=mute
area "East, fell 1453" GR|TR|BG|SY|EG tone=mint
pin Constantinople 41,29 +pulse
end
```
````

### explain-monsoon-how (FAIL)

**Chris:** Why does India get monsoons? Keep it short.

Good: One line and a picture: land heats, air rises, wet air off the ocean moves in, as a diagram in `shapes` with arrows or a `map` with the winds as routes, maybe a rainfall `chart` by month. Not a paragraph of weather words.

- words: 52 > 50

````
In summer, India's land heats up faster than the ocean. The hot air rises, and moist sea winds rush in from the southwest. When those winds hit the Western Ghats and the Himalayas, they rise, cool and dump rain. In winter the land cools and the winds flip, so it goes dry.

```yui
map "Summer monsoon" caption="Hot land pulls wet ocean air inland; the mountains wring it out."
area India IN tone=butter
pin@sea "Indian Ocean" 5,72
pin@hi Himalayas 29,82 +pulse
route "Wet southwest winds" sea|19,76|hi +arrow
```
````
