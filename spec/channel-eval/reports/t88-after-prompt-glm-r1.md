# Channel eval: t88-after-prompt-glm-r1

Guide v47+b7493fe6 (5616 words), model z-ai/glm-5.2, 2026-10-05T15:28.

**7/8 passed (88%).**

| category | passed |
|---|---|
| explain | 7/8 |

| case | result | why |
|---|---|---|
| explain-mongols-geography | pass |  |
| explain-rome-rise-fall | FAIL | parse: end: no open deck, plan, narrate, timeline or sketch :: end |
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
Mongols ruled the largest land empire ever, from Korea to Hungary.

```yui
>full
deck "The Mongols, by the map"
page "Where they came from" body="Nomads on the cold grassland north of China, between forest and desert."
map caption="The steppe: open grass they rode across."
area "Mongol heartland" 47,110|42,120|44,100|50,105 tone=butter
pin@ka Karakorum 47.2,102.8 +pulse
page "How far it reached" body="Korea to Hungary, Siberia to Persia. A sixth of all land."
map caption="The empire at its peak, 1279."
area "Mongol Empire" 53,140|43,131|34.7,126.5|22.3,114|24,98|34,70|25.5,57|33,44|41,31|46,30.5|54,23|60,56|55,95 tone=butter
area Raided PL|HU +dash
pin@ka Karakorum 47.2,102.8
page "The biggest one on land"
chart bar "Land empires, million km²" x=Mongol|Russian|Qing|Roman y=24|22.8|14.7|5
page "Why the steppe mattered" body="Open grass meant horses everywhere. Horses meant speed, range and the biggest army on Earth."
shapes caption="Grass feeds horses, horses feed the army."
shape blob "Steppe grass" tone=mint +grow
shape arrow
shape circle Horses +pulse
shape arrow
shape box Army
choose "Where next?" "How did they rule it?"|"What ended it?"|"Why do you ask?"
end
```

```remember
me: name = Chris
```
````

### explain-rome-rise-fall (FAIL)

**Chris:** Give me the quick version of how the Roman Empire rose and fell.

Good: A line, then a picture per part: the empire at its peak as a `map` around the Mediterranean, its size over the centuries as a `chart` (or a `timeline` on the stage), the split as an east and west area. No page that is only a heading and a paragraph.

- parse: end: no open deck, plan, narrate, timeline or sketch :: end

````
Roman rose by conquest and law, then split and crumbled under pressure from outside and in.
```yui
>full
deck "Rome, quick version"
page "Built on conquest" body="Rome grew from a small Italian city into a giant by fighting its rivals and absorbing their people."
map caption="From one city to the whole Mediterranean."
area "Roman Empire" 41,12|44,10|51,3|42,8|36,6|30,3|24,10|10,30|10,35|30,35|35,40|38,40 tone=butter
pin Rome 41.9,12.5 +pulse
page "Law and roads held it" body="Roads, aqueducts, and a shared legal system kept distant provinces loyal for centuries."
shapes caption="Roads and law tied the empire together."
shape circle Rome +pulse
shape arrow
shape box Roads tone=mint
shape arrow
shape box Provinces
page "It split in two" body="By the 300s it was too big. Emperors split it into West and East. The West fell first."
map caption="Two halves, two fates."
area "Western Rome" 41,12|44,10|51,3|42,8|36,6|30,10|10,30|10,35|30,35|35,40 tone=mute
area "Eastern Rome" 30,10|36,6|24,10|10,30|10,35|30,35|35,40|38,40 tone=butter
page "Barbarians, debt, and decay" body="Invasions, economic strain, and weak leadership brought the West down in 476. The East lasted nearly 1,000 more years."
timeline "The fall"
done "Empire splits" at="285"
done "West sacked by Visigoths" at="410"
done "West falls" at="476"
now "East (Byzantium) holds on"
choose "Where next?" "Why did the East last longer?"|"What was life like in Rome?"|"How did Roman law shape us?"
end
```
````

### explain-monsoon-how (pass)

**Chris:** Why does India get monsoons? Keep it short.

Good: One line and a picture: land heats, air rises, wet air off the ocean moves in, as a diagram in `shapes` with arrows or a `map` with the winds as routes, maybe a rainfall `chart` by month. Not a paragraph of weather words.

````
Warm wet air from the ocean rushes inland when the land heats up and pulls it in. Then it reverses in winter.
```yui
>full
deck "Why India gets monsoons"
page "Land heats faster" body="In summer, India's land gets hotter than the sea around it. Hot air rises off the land."
shapes caption="Sun bakes the land, air rises."
shape circle Land +pulse tone=butter
shape arrow
shape blob "Air rises"
page "Ocean air rushes in" body="Warm wet air from the Indian Ocean flows in to replace the rising air. That moisture becomes heavy rain."
shapes caption="Wet ocean air flows in, rain falls."
shape circle Ocean +pulse tone=mint
shape arrow
shape circle Land
shape arrow up
shape blob Rain
page "Winter flips it" body="Land cools faster than the sea. Air sinks over land and dry winds blow back out to the ocean."
shapes caption="Reversed winds, dry season."
shape circle Land tone=mute
shape arrow
shape circle Sea +pulse tone=mint
choose "Where next?" "How strong can it get?"|"What if the monsoon fails?"|"Do other places get monsoons?"
end
```
````

### explain-eli5-string-theory (pass)

**Chris:** Eli5 string theory

Good: One line, then one deck on the stage: 2 to 4 pages, each a few words and its own drawing (shapes of a string vibrating into notes, a sketch of the extra rooms). Never a page of plain text.

````
Everything is made of tiny vibrating strings instead of dots.
```yui
>full
deck "String theory, ELI5"
page "Tiny strings, not dots" body="We used to think the smallest things were tiny dots. String theory says they are tiny wiggling strings."
sketch "What stuff is made of" frame=bubble before="Old idea"
row "Particle: a dot" +x note="a point"
after "String theory"
row "String: a wiggle" +hi note="a loop"
page "One string, many notes" body="A guitar string makes different notes when it wiggles. A cosmic string makes different particles when it wiggles differently."
shapes caption="Same string, different wiggles, different stuff."
shape text "Electron" tone=mint
shape text "Photon" tone=butter
shape text "Quark" tone=lavender
shape blob String +pulse
page "Hidden dimensions" body="Strings need extra room to wiggle. So the universe has tiny dimensions curled up that we cannot see."
shapes caption="Extra dimensions, too small to notice."
shape box "Our 3D world" +pulse
shape arrow
shape dot "Tiny curled-up dimensions" tone=mute
choose "Where next?" "What are particles?"|"What is a dimension?"|"Why do strings wiggle?"
end
```
````

### explain-eli5-black-holes (pass)

**Chris:** ELI5 black holes

Good: One line, then a deck: each page has a drawing (shapes of mass pulling in, a sketch of the point of no return). No page that is only words.

````
Black holes are places where gravity is so strong nothing can escape, not even light.

```yui
>full
deck "What a black hole is"
page "A star falls in on itself" body="When a giant star runs out of fuel, it collapses. Everything gets squeezed into a tiny dot."
shapes caption="Big star shrinks to a tiny, heavy dot."
shape circle "Giant star" +pulse
shape arrow
shape dot "Tiny dot" tone=mute
page "So much pull nothing escapes" body="The dot is so heavy for its size that its pull swallows everything nearby. Even light gets sucked in."
shapes caption="Light goes in, nothing comes out."
shape circle "Black hole" +fill tone=mute
shape arrow
shape blob "Light" tone=butter
page "The edge you can't come back from" body="Around it is a line called the event horizon. Cross it and you can never get back out."
sketch "Event horizon" frame=bubble
row "Outside: you can still escape" +hi note="safe"
row "Event horizon: the line" +x note="point of no return"
row "Inside: gone for good"
choose "Where next?" "What's inside?"|"How big are they?"|"Do they eat everything?"
end
```

```remember
note: asked for ELI5 black holes, enjoys space topics
```
````

### explain-eli5-inflation (pass)

**Chris:** Explain inflation to me like I'm five.

Good: One line, then a deck with a chart or shapes on each page (a price that creeps up, a dollar that buys less). No text-only page.

````
Inflation means prices go up over time, so the same dollar buys less.

```yui
>full
deck "Inflation, simply"
page "Money buys less" body="A dollar today buys a candy bar. A few years later, the same candy bar costs two dollars. The dollar didn't shrink. Prices grew."
shapes caption="Same candy bar, more dollars needed."
shape circle "$1" +pulse
shape arrow
shape box Candy
page "Why prices rise" body="When lots of people want the same thing and there's only so much of it, sellers charge more. More money chasing the same stuff means higher prices."
shapes caption="Too many dollars, not enough stuff."
shape circle People +grow
shape circle People
shape arrow
shape box Stuff tone=mint +pulse
page "A little is normal" body="A small bit of inflation every year is healthy. It means people are buying and making things. Too much too fast is the problem."
chart line "Prices over time" x=Y0|Y5|Y10|Y15 y=100|103|107|112
choose "Where next?" "What makes it stop?"|"Why do jobs matter?"|"What is a recession?"
end
```
````

### explain-how-vaccines-work (pass)

**Chris:** How do vaccines work?

Good: Asked how something works: a short line, then a deck, a drawing on every page (shapes or a diagram of the practice run for the body).

````
Your immune system learns the shape of a germ so it can fight the real thing later. Here's how.
```yui
>full
deck "How vaccines work"
page "A training dummy" body="A vaccine shows your body a harmless copy of a germ. It is like a wanted poster for something that has not attacked yet."
shapes caption="Harmless germ copy trains your immune system."
shape circle Vaccine +pulse tone=mint
shape arrow
shape box Body
page "Making antibodies" body="Your immune cells see the copy and make antibodies. Antibodies are little Y-shaped grabbers that stick to that germ."
shapes caption="Cells make Y-shaped grabbers that lock on."
shape box Cell
shape arrow
shape blob Antibodies +grow tone=lavender
page "Ready for the real thing" body="Later, if the real germ shows up, antibodies grab it fast and your body clears it before you get sick."
sketch "Immune response" frame=bubble before=Before
row "No antibodies: germ spreads" +x note="sick"
after After
row "Antibodies grab germ fast" +hi note="protected"
choose "Where next?" "What is in a vaccine?"|"Are they safe?"|"What is herd immunity?"
end
```
````

### explain-what-is-a-mortgage (pass)

**Chris:** Simple terms: what is a mortgage?

Good: A line, then a deck with a drawing per page (a house, a loan paid down over time). No page is a paragraph.

````
A mortgage is a loan from a bank that pays for a house, paid back slowly over many years.

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
page "Paying it back" body="Each month you pay a bit of the loan plus a fee, called interest. Early on the fee is most of it."
chart bar "Where one early payment goes" x=Loan|Interest y=700|1300
page "How long it takes" body="Most mortgages last 30 years. The loan shrinks slowly, then faster."
stat 30y "A common mortgage" spark=100|85|65|35|0
choose "Where next?" "What is interest?"|"Is renting cheaper?"|"What if I miss a payment?"
end
```
````
