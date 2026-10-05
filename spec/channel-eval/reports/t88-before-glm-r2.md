# Channel eval: t88-before-glm-r2

Guide v47+b7493fe6 (5616 words), model z-ai/glm-5.2, 2026-10-05T15:27.

**5/8 passed (63%).**

| category | passed |
|---|---|
| explain | 5/8 |

| case | result | why |
|---|---|---|
| explain-mongols-geography | pass |  |
| explain-rome-rise-fall | FAIL | components: 8 > 6 |
| explain-monsoon-how | pass |  |
| explain-eli5-string-theory | pass |  |
| explain-eli5-black-holes | pass |  |
| explain-eli5-inflation | FAIL | explain: a page with no picture :: page "What helps" body="People invest or earn more so their money grows faster than prices rise. That keeps them ahead." |
| explain-how-vaccines-work | pass |  |
| explain-what-is-a-mortgage | FAIL | screen: no ```yui block; words: 43 > 40; explain: no deck; explain: 0 pages, want 2 to 4 |

## Transcripts

### explain-mongols-geography (pass)

**Chris:** All right, can you give me a brief geographic explanation of the Mongols?

Good: One line with the answer, then one deck on `>full` where every page has its picture: the empire as a `map` (its outline in lat,lon points, Karakorum as a pin, routes east and west), the size as a `chart` or a `stat`. Not pages of text, and not the steppe drawn as dots in `shapes` (TestFlight feedback AJIE1_1Ru1V4EMgmpWZtniI: 'It's just a text bomb'; feedback AL2nKEYo on the shapes version: 'Again, not bad but this should be a Map').

````
The Mongols built the largest land empire ever, from Korea to Hungary.

```yui
>full
deck "The Mongols, by the map"
page "How far it reached" body="Korea to Hungary, the Siberian forest to Persia, all from the steppe."
map caption="Karakorum sat in the middle and rode out every way."
area "Mongol Empire" 53,140|43,131|34.7,126.5|22.3,114|24,98|34,70|25.5,57|33,44|41,31|46,30.5|54,23|60,56|55,95 tone=butter
area Raided PL|HU +dash
pin@ka Karakorum 47.2,102.8 +pulse
route East ka|37.6,127 +arrow
route West ka|50.4,30.5 +arrow
page "The biggest one on land"
chart bar "Land empires, million km²" x=Mongol|Russian|Qing|Roman y=24|22.8|14.7|5
page "At its peak, 1279"
stat "24M km²" "A sixth of the land on Earth"
choose "What next?" "How they ruled it"|"Why it stopped"|"Why do you ask?" +other
end
```
````

### explain-rome-rise-fall (FAIL)

**Chris:** Give me the quick version of how the Roman Empire rose and fell.

Good: A line, then a picture per part: the empire at its peak as a `map` around the Mediterranean, its size over the centuries as a `chart` (or a `timeline` on the stage), the split as an east and west area. No page that is only a heading and a paragraph.

- components: 8 > 6

````
Rome rose by conquest and alliance, peaked under Trajan, then split and crumbled in the West under pressure from within and without.
```yui
>full
deck "Rise and fall of Rome"
page "The rise" body="From a small kingdom to a republic that conquered Italy, then Carthage, then the Mediterranean. By 27 BC, Augustus turned the republic into an empire ruled by emperors."
timeline "Rise"
done "Kingdom founded" at="753 BC"
done "Republic begins" at="509 BC"
done "Punic Wars win the Mediterranean" at="264-146 BC"
now "Augustus, first emperor" at="27 BC"
page "The peak" body="Under Trajan the empire stretched from Britain to Persia, 5 million km², 60-70 million people. Rome was the largest city on Earth."
map caption="At its largest, 117 AD, Rome ringed the entire Mediterranean."
area "Roman Empire" 51.5,-10|51,12|48,20|55,38|37,38|35,55|30,55|20,37|10,35|10,20|36,10|43,3 tone=butter
pin@rome Rome 41.9,12.5 +pulse
page "The decline" body="Civil wars, plagues, economic strain, and pressure on the frontiers. Diocletian split it in two in 285 to make it governable. The West never recovered."
sketch "Why it weakened" frame=bubble
row "Civil wars: frequent" +x note="legions fought each other"
row "Plagues: depopulated cities" +x note="Antonine, Cyprian"
row "Taxes and inflation: crushed the economy" +x
row "Frontiers: Goths, Huns pressed hard" +x note="and kept coming"
page "The fall" body="The West fell in 476 when Odoacer deposed the last emperor. The East survived as the Byzantine Empire for nearly 1,000 more years, until 1453."
timeline "Fall"
done "West splits off" at="285 AD"
done "Rome sacked by Visigoths" at="410 AD"
done "West falls to Odoacer" at="476 AD"
now "Byzantium falls to the Turks" at="1453 AD"
end
```
```remember
note: interested in Roman history
```
````

### explain-monsoon-how (pass)

**Chris:** Why does India get monsoons? Keep it short.

Good: One line and a picture: land heats, air rises, wet air off the ocean moves in, as a diagram in `shapes` with arrows or a `map` with the winds as routes, maybe a rainfall `chart` by month. Not a paragraph of weather words.

````
Land heats faster than the sea. Warm air rises over India, pulling wet ocean winds in. In winter it flips.

```yui
shapes "Monsoon cycle" caption="Land and sea take turns heating, so the wind reverses twice a year."
shape box "India" +pulse
shape arrow
shape box "Indian Ocean"
shape text "Summer: sea breeze in, wet"
shape arrow
shape box "India" +fill
shape text "Winter: land breeze out, dry"
```
````

### explain-eli5-string-theory (pass)

**Chris:** Eli5 string theory

Good: One line, then one deck on the stage: 2 to 4 pages, each a few words and its own drawing (shapes of a string vibrating into notes, a sketch of the extra rooms). Never a page of plain text.

````
Everything is made of tiny wiggly strings. Let me show you.

```yui
>full
deck "String theory, simply"
page "Tiny strings" body="If you zoom in super deep on anything, you do not find dots. You find tiny strings that wiggle."
shapes
shape line "~~~" +draw tone=mint
page "Wiggle makes stuff" body="One wiggle is light. Another wiggle is an electron. The string's dance decides what it is."
shapes
shape line "~~~" tone=mint +pulse
shape arrow
shape dot Light
shape line "---" tone=lavender +pulse
shape arrow
shape dot Electron
page "Hidden dimensions" body="Strings need extra room to wiggle in, so the universe has tiny curled-up dimensions we cannot see."
shapes
shape circle "tiny curled-up space" +fill tone=butter +grow
page "One big idea" body="Instead of many rules for many particles, one kind of string explains everything."
shapes
shape circle "String" +grow tone=mint
shape arrow
shape box "All particles"
shape arrow
shape box "All forces"
choose "Want more?" "Show me the extra dimensions"|"How small are strings?"|"I'm good"
end
```
````

### explain-eli5-black-holes (pass)

**Chris:** ELI5 black holes

Good: One line, then a deck: each page has a drawing (shapes of mass pulling in, a sketch of the point of no return). No page that is only words.

````
Space has a trap called a black hole. Let me show you how it works.
```yui
>full
deck "Black holes, super simple"
page "What is it?" body="A black hole is a spot in space where gravity is so strong nothing can escape it. Not light, not rockets, not even the fastest thing in the universe."
shapes
shape circle Star +grow
shape arrow
shape dot Tiny +pulse tone=mute
page "How does one form?" body="A giant star runs out of fuel and collapses. All that stuff squeezes into a tiny point. More mass in less space means stronger gravity."
shapes
shape circle "Big star" +grow
shape arrow
shape dot "Tiny point" +pulse tone=mute
page "The event horizon" body="There is an invisible line around it called the event horizon. Cross it and you can never come back. It is the point of no return."
shapes
shape circle "Black hole" +fill tone=mute
shape contour at=1,3 size=4,4 rings=3 +dash
shape callout "No way back" at=5,3 to=3,3
page "Why is it black?" body="Light goes in but never comes out. So it looks like a hole in space, totally black. That is why we call it a black hole."
shapes
shape box Light +grow
shape arrow tone=mute
shape circle "Gone" +fill tone=mute
end
```
````

### explain-eli5-inflation (FAIL)

**Chris:** Explain inflation to me like I'm five.

Good: One line, then a deck with a chart or shapes on each page (a price that creeps up, a dollar that buys less). No text-only page.

- explain: a page with no picture :: page "What helps" body="People invest or earn more so their money grows faster than prices rise. That keeps them ahead."

````
Money buys less over time. That's inflation. Let me show you with a story.

```yui
>full
deck "Inflation, simple"
page "The candy bar" body="One dollar buys a candy bar today. Next year, the same candy bar costs one dollar and ten cents. Your dollar didn't change. The price did."
shapes
shape box "$1" +grow
shape arrow
shape box "🍫" +pulse tone=butter
page "Why prices rise" body="More people want candy. Or it costs more to make candy. Either way, the store charges more."
shapes
shape circle "Want ↑" +grow tone=mint
shape arrow
shape circle "Price ↑" +pulse tone=butter
page "Your money shrinks" body="If you keep that dollar under your pillow, it buys less candy every year. That is inflation: your money slowly loses its power."
shapes
shape box "$1 today" +grow
shape arrow
shape box "🍫 × 1" +x
shape arrow
shape box "🍬 × 0.9" +pulse tone=butter
page "What helps" body="People invest or earn more so their money grows faster than prices rise. That keeps them ahead."
choose "Want to go deeper?" "Show me an example"|"How do I protect my money"|"Got it, thanks"
end
```
````

### explain-how-vaccines-work (pass)

**Chris:** How do vaccines work?

Good: Asked how something works: a short line, then a deck, a drawing on every page (shapes or a diagram of the practice run for the body).

````
Your immune system learns the enemy before the real fight. Here's how.
```yui
>full
deck "How vaccines work"
page "Show the body a fake enemy" body="A vaccine carries a harmless piece of the germ, or a blueprint for it. Not the real threat, just enough for the immune system to recognize."
shapes caption="A harmless lookalike teaches the body."
shape circle Germ +grow
shape arrow
shape box Body +fill
page "The immune system builds weapons" body="Special cells called B cells make antibodies, proteins that lock onto the germ and mark it for destruction. T cells learn to destroy infected cells."
shapes caption="B cells make antibodies that tag the germ."
shape box "B cell" +grow
shape arrow
shape pill Antibody +pulse tone=mint
shape arrow
shape circle Germ +fill
page "Memory stays for years" body="Some B and T cells become memory cells. If the real germ shows up later, the body makes antibodies fast, often before you feel sick."
shapes caption="Memory cells respond fast next time."
shape circle "Memory cell" +pulse
shape arrow
shape pill Antibody +grow tone=mint
shape arrow
shape circle "Real germ" +fill
shape text "Stopped!" tone=mint
page "Not all germs, but many" body="Vaccines work for viruses like measles, polio, flu and COVID. Some need boosters because the germ changes or immunity fades over time."
chart bar "How well vaccines prevent disease" x=Measles|Polio|Flu|COVID y=97|99|40|60
choose "Want to go deeper?" "Types of vaccines"|"Are they safe?"|"Why boosters?" +other
end
```
````

### explain-what-is-a-mortgage (FAIL)

**Chris:** Simple terms: what is a mortgage?

Good: A line, then a deck with a drawing per page (a house, a loan paid down over time). No page is a paragraph.

- screen: no ```yui block
- words: 43 > 40
- explain: no deck
- explain: 0 pages, want 2 to 4

````
A mortgage is a loan from a bank that lets you buy a home without paying the full price up front. You pay it back in monthly chunks over many years, and if you stop paying, the bank can take the house back.
````
