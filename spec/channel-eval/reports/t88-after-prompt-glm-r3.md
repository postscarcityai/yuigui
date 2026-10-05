# Channel eval: t88-after-prompt-glm-r3

Guide v47+b7493fe6 (5616 words), model z-ai/glm-5.2, 2026-10-05T15:28.

**8/8 passed (100%).**

| category | passed |
|---|---|
| explain | 8/8 |

| case | result | why |
|---|---|---|
| explain-mongols-geography | pass |  |
| explain-rome-rise-fall | pass |  |
| explain-monsoon-how | pass |  |
| explain-eli5-string-theory | pass |  |
| explain-eli5-black-holes | pass |  |
| explain-eli5-inflation | pass |  |
| explain-how-vaccines-work | pass |  |
| explain-what-is-a-mortgage | pass |  |

## Transcripts

### explain-mongols-geography (pass)

**Chris:** All right, can you give me a brief geographic explanation of the Mongols?

Good: One line with the answer, then one deck on `>full` where every page has its picture: the empire as a `map` (its outline in lat,lon points, Karakorum as a pin, routes east and west), the size as a `chart` or a `stat`. Not pages of text, and not the steppe drawn as dots in `shapes` (TestFlight feedback AJIE1_1Ru1V4EMgmpWZtniI: 'It's just a text bomb'; feedback AL2nKEYo on the shapes version: 'Again, not bad but this should be a Map').

````
The Mongols built the largest land empire ever, from Korea to Hungary.

```yui
>full
deck "The Mongols, by the map"
page "How far it reached" body="Korea to Hungary, the Siberian forest to Persia. One empire across the whole grassland belt."
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
choose "Where next?" "Why the grassland?"|"How did they ride so far?"|"What broke it apart?"
end
```

```remember
me: name = Chris
note: interested in history, asked about Mongols
```
````

### explain-rome-rise-fall (pass)

**Chris:** Give me the quick version of how the Roman Empire rose and fell.

Good: A line, then a picture per part: the empire at its peak as a `map` around the Mediterranean, its size over the centuries as a `chart` (or a `timeline` on the stage), the split as an east and west area. No page that is only a heading and a paragraph.

````
Rome rose on armies, roads and borrowed ideas, then buckled under its own size, debt and border wars.
```yui
>full
deck "Rome: rise and fall"
page "Built on conquest" body="Rome started as a hill town. Legions and roads turned it into an empire ringing the Mediterranean."
map caption="At its peak, Rome encircled the whole sea."
area "Roman Empire" 55,-10|36,-10|30,30|48,35|55,25 tone=butter
pin Rome 41.9,12.5 +pulse
page "Republic to empire" body="Generals got too powerful. Caesar crossed a river, and his heir Augustus took the title emperor. The republic died quietly."
sketch "Power" frame=bubble before=Republic
row "Senate and citizens" +x
after Empire
row "One emperor, one army" +hi
page "Too big to hold" body="Plagues, inflation and civil wars hollowed Rome out. The army hired foreigners it could not pay. Borders cracked."
shapes caption="The empire split in two to survive."
shape circle West tone=mute
shape text Rome
shape arrow
shape circle East +pulse tone=mint
shape text Constantinople
page "The fall" body="In 476 the last western emperor was pushed aside by Germanic chiefs. The eastern half lasted 1,000 more years as Byzantium."
stat 476 "Western Rome ends" spark=27BC|200|400|476
choose "Where next?" "Why did it split?"|"What was the republic?"|"What survived in the east?"
end
```
````

### explain-monsoon-how (pass)

**Chris:** Why does India get monsoons? Keep it short.

Good: One line and a picture: land heats, air rises, wet air off the ocean moves in, as a diagram in `shapes` with arrows or a `map` with the winds as routes, maybe a rainfall `chart` by month. Not a paragraph of weather words.

````
```yui
>full
deck "Why India gets monsoons"
page "Land heats up fast" body="Summer sun bakes the land far quicker than the ocean. Hot air over land rises, pulling moist ocean air in."
shapes caption="Ocean air rushes in toward hot land."
shape circle Ocean +pulse tone=mint
shape arrow
shape box "Hot land"
page "Wet winds hit mountains" body="The moisture-laden winds slam into the Himalayas and Western Ghats. Forced upward, they cool and dump rain."
shapes caption="Wind rises over mountains, cools, rains."
shape box Wind +pulse
shape arrow
shape blob Mountains
shape arrow
shape blob Rain tone=mint
page "Then it reverses" body="In winter the land cools faster than the sea. Dry air sinks over land and blows back out to ocean. Sunny season returns."
shapes caption="Dry air flows back to sea."
shape box "Cool land" tone=mute
shape arrow
shape circle Ocean
choose "Where next?" "What is a monsoon?"|"Why are they hard to predict?"|"How do people prepare?"
end
```
````

### explain-eli5-string-theory (pass)

**Chris:** Eli5 string theory

Good: One line, then one deck on the stage: 2 to 4 pages, each a few words and its own drawing (shapes of a string vibrating into notes, a sketch of the extra rooms). Never a page of plain text.

````
Everything is made of tiny wiggling strings, not dots.

```yui
>full
deck "String theory, ELI5"
page "What stuff is made of" body="You are made of atoms. Atoms are made of smaller dots called particles. But string theory says those dots are actually tiny strings."
shapes caption="Dots are tiny strings in disguise."
shape dot Particle +pulse
shape arrow
shape curve String tone=mint
page "Wiggles make everything" body="One string can wiggle many ways. Each wiggle is a different particle. A fast wiggle is light, a slow wiggle is a pebble."
shapes caption="Same string, different wiggle, different thing."
shape curve String +pulse tone=mint
shape arrow
shape dot Light
shape arrow
shape dot "Pebble" tone=mute
page "Too small to see" body="The strings are way, way smaller than an atom. If an atom were the whole Earth, one string would be a single tree."
stat "100 quintillion" "Strings in one atom" spark=1|1|1|1
choose "Where next?" "Why do we need it?"|"What are dimensions?"|"Is it proven?"
end
```

```remember
note: asked for ELI5 explanations, prefers simple visual teaching
```
````

### explain-eli5-black-holes (pass)

**Chris:** ELI5 black holes

Good: One line, then a deck: each page has a drawing (shapes of mass pulling in, a sketch of the point of no return). No page that is only words.

````
A black hole is a place where gravity got so strong that nothing, not even light, can escape it.
```yui
>full
deck "What a black hole is"
page "Gravity wins" body="When a giant star runs out of fuel, it falls in on itself. The stuff packs tighter and tighter until gravity wins everything."
shapes caption="Star collapses, gravity crushes it."
shape circle Star +pulse
shape arrow
shape dot "Crushed core" tone=mute
page "The point of no return" body="Around the crushed core is an invisible line. Cross it and you can never get back out, even if you are light."
shapes caption="Inside the line, no way out."
shape circle "Core" +fill tone=mute
shape contour at=5,3 size=4,3 rings=4
shape callout "No escape" at=2,1 to=4,2
page "Light bends" body="A black hole pulls so hard it bends light around it. That is why it looks like a dark hole in space."
sketch "What you see" frame=bubble
row "Stars behind look bent" +hi note="lens"
row "Center is pure black" note="no light out"
page "Not a vacuum cleaner" body="It does not suck things in from far away. You can orbit one safely, like Earth orbits the sun, as long as you stay outside the line."
shapes caption="Orbit is fine. Too close is not."
shape circle "Black hole" +fill tone=mute
shape circle Ship +pulse tone=mint
shape path pts=3,3|4,4|3,5|2,4 +close +dash
choose "Where next?" "What is inside?"|"Are they dangerous?"|"How do we see them?"
end
```
````

### explain-eli5-inflation (pass)

**Chris:** Explain inflation to me like I'm five.

Good: One line, then a deck with a chart or shapes on each page (a price that creeps up, a dollar that buys less). No text-only page.

````
Inflation means prices go up over time, so the same dollar buys less.

```yui
>full
deck "What is inflation?"
page "Your dollar shrinks" body="Imagine you have one dollar. Last year it bought a whole candy bar. Today the same candy bar costs two dollars."
shapes caption="Same candy bar, bigger price tag."
shape box "$1 last year" tone=mint
shape arrow
shape box "$2 today" +pulse tone=butter
page "Why prices climb" body="When a lot of people want something and there is not much of it, sellers raise the price. More money chasing the same stuff."
sketch "Bakery" frame=bubble
row "One cake, ten people want it" +hi note="price goes up"
row "Seller says: pay more"
page "A little is good" body="Prices going up slowly is normal. It keeps the wheels turning. Too much too fast is bad for everyone."
chart line "Prices over time" x=2020|2021|2022|2023 y=1|1.03|1.14|1.17
choose "Where next?" "What makes it speed up?"|"How does the government slow it?"|"Why are wages connected?"
end
```
````

### explain-how-vaccines-work (pass)

**Chris:** How do vaccines work?

Good: Asked how something works: a short line, then a deck, a drawing on every page (shapes or a diagram of the practice run for the body).

````
Your immune system learns the shape of a germ without the danger, so it's ready next time.
```yui
>full
deck "How vaccines work"
page "A practice run" body="A vaccine shows your body a harmless piece of a germ. Your immune system studies it like a mugshot."
shapes caption="Germs are things your body learns to fight."
shape circle Germ +pulse tone=mute
shape arrow
shape box "Immune cells" +grow
page "Making the match" body="Special cells make antibodies that lock onto that exact germ shape. They stick around for years."
sketch "Antibodies" frame=bubble
row "Antibody: fits the germ like a key" +hi note="locks on"
row "Germs that match: tagged for removal" +x note="destroyed"
page "Ready next time" body="If the real germ shows up later, your body makes antibodies fast and clears it before you get sick."
chart bar "Antibody speed" x="First meeting"|"Second meeting" y=2|10
page "Booster shots" body="Some germs need a reminder. A booster wakes the immune memory back up so protection stays strong."
shapes caption="A refresher keeps the memory sharp."
shape circle "Memory cell" +pulse tone=mint
shape arrow
shape blob "More antibodies"
choose "Where next?" "Are vaccines safe?"|"What is herd immunity?"|"How were vaccines invented?"
end
```
````

### explain-what-is-a-mortgage (pass)

**Chris:** Simple terms: what is a mortgage?

Good: A line, then a deck with a drawing per page (a house, a loan paid down over time). No page is a paragraph.

````
A mortgage is a loan from a bank that pays for a house when you can't pay all at once. You pay it back slowly over many years, plus a fee called interest.

```yui
>full
deck "What a mortgage is"
page "A loan for a house" body="A house costs a lot. A bank pays the seller now, and you pay the bank back slowly."
shapes caption="The bank pays first. You pay back."
shape box Bank
shape arrow
shape box House +pulse tone=mint
shape arrow
shape circle You
page "Paying it back" body="Each month you pay a bit of the loan plus a fee called interest. Early on the fee is most of it."
chart bar "Where one early payment goes" x=Loan|Interest y=700|1300
page "How long it takes" body="Most mortgages last 30 years. The loan shrinks slowly, then faster near the end."
stat 30y "A common mortgage" spark=100|85|65|35|0
choose "Where next?" "What is interest?"|"Is renting cheaper?"|"What if I miss a payment?"
end
```
````
