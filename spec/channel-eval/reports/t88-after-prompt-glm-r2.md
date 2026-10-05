# Channel eval: t88-after-prompt-glm-r2

Guide v47+b7493fe6 (5616 words), model z-ai/glm-5.2, 2026-10-05T15:28.

**7/8 passed (88%).**

| category | passed |
|---|---|
| explain | 7/8 |

| case | result | why |
|---|---|---|
| explain-mongols-geography | pass |  |
| explain-rome-rise-fall | FAIL | parse: end: no open deck, plan, narrate, timeline or sketch :: end; map: a where answer with no map |
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
Largest land empire ever. Korea to Hungary, Siberia to Persia, all in one lifetime.

```yui
>full
deck "The Mongols, by the map"
page "How far it reached" body="From Korea to Hungary, Siberia to Persia. One empire, one century."
map caption="Karakorum in the center, armies rode out every way."
area "Mongol Empire" 53,140|43,131|34.7,126.5|22.3,114|24,98|34,70|25.5,57|33,44|41,31|46,30.5|54,23|60,56|55,95 tone=butter
area Raided PL|HU +dash
pin@ka Karakorum 47.2,102.8 +pulse
route East ka|37.6,127 +arrow
route West ka|50.4,30.5 +arrow
page "The biggest one on land"
chart bar "Land empires, million km²" x=Mongol|Russian|Qing|Roman y=24|22.8|14.7|5
page "At its peak, 1279"
stat "24M km²" "A sixth of all land on Earth" spark=0|12|20|24
choose "Where next?" "How did they move so fast?"|"What was the Silk Road?"|"Why did it split?"
end
```
````

### explain-rome-rise-fall (FAIL)

**Chris:** Give me the quick version of how the Roman Empire rose and fell.

Good: A line, then a picture per part: the empire at its peak as a `map` around the Mediterranean, its size over the centuries as a `chart` (or a `timeline` on the stage), the split as an east and west area. No page that is only a heading and a paragraph.

- parse: end: no open deck, plan, narrate, timeline or sketch :: end
- map: a where answer with no map

````
One line: Rome rose on military discipline and roads, fell when its borders outgrew its ability to defend them.
```yui
>full
deck "Rome: rise and fall"
page "Republic to empire" body="Rome started as a republic, then generals like Caesar took power. Augustus became the first emperor in 27 BC."
shapes caption="Republic becomes one-man rule."
shape circle Republic +pulse tone=mint
shape arrow
shape box Caesar
shape arrow
shape pill Empire tone=butter
page "What built it" body="Legions, roads and law. Rome moved troops fast, traded widely, and let conquered elites become Roman."
sketch "Why it grew" frame=bubble
row "Legions: discipline beats numbers" +hi note="military"
row "Roads: troops and trade move fast" note="infrastructure"
row "Law: conquered elites join in" note="integration"
page "What broke it" body="By the 300s, the empire was too big to defend. Corruption, inflation, and civil war weakened it from inside while pressure grew on the borders."
sketch "Why it cracked" frame=bubble
row "Borders too long to hold" +hi note="overstretched"
row "Civil wars drained the army" note="internal"
row "Inflation crushed the economy" note="money"
page "The end" body="In 476 AD, the western empire fell when Germanic kings deposed the last emperor. The eastern half survived as Byzantium for nearly 1,000 more years."
timeline "The split"
done "Empire splits, East and West" at="395 AD"
done "Western Rome falls" at="476 AD"
now "Byzantium continues"
choose "Where next?" "How did the army change?"|"What was life like under Rome?"|"Why did Byzantium last so long?"
end
```
````

### explain-monsoon-how (pass)

**Chris:** Why does India get monsoons? Keep it short.

Good: One line and a picture: land heats, air rises, wet air off the ocean moves in, as a diagram in `shapes` with arrows or a `map` with the winds as routes, maybe a rainfall `chart` by month. Not a paragraph of weather words.

````
Warm, wet air from the Indian Ocean rises over the land in summer, then rains itself out over India.

```yui
>full
deck "Why India gets monsoons"
page "The land heats up" body="In summer, India's land gets hotter than the ocean. Hot air rises."
shapes caption="Land hot, air rises up."
shape box Land +pulse tone=butter
shape arrow
shape blob "Hot air" tone=mute
page "Ocean air rushes in" body="Warm, wet air from the Indian Ocean flows in to fill the gap."
shapes caption="Wet ocean air moves toward hot land."
shape blob Ocean +pulse tone=mint
shape arrow
shape box Land tone=butter
page "It rains" body="The wet air rises over the land, cools, and dumps heavy rain."
chart bar "Monthly rainfall, mm" x=Jun|Jul|Aug|Sep y=170|320|280|170
choose "Where next?" "Why only in summer?"|"Do other places get monsoons?"|"What is a dry monsoon?"
end
```
````

### explain-eli5-string-theory (pass)

**Chris:** Eli5 string theory

Good: One line, then one deck on the stage: 2 to 4 pages, each a few words and its own drawing (shapes of a string vibrating into notes, a sketch of the extra rooms). Never a page of plain text.

````
Everything is made of tiny vibrating strings, not dots.

```yui
>full
deck "String theory, simply"
page "Tiny strings, not dots" body="We thought the smallest bits were dots. String theory says they are tiny loops of string, wiggling like rubber bands."
shapes caption="A dot becomes a wiggly loop."
shape dot Dot +pulse
shape arrow
shape circle "String loop" tone=lavender
page "Wiggles make everything" body="One string wiggling one way is an electron. Wiggling another way, it is light. Different dances make different particles."
shapes caption="Same string, different wiggle, different particle."
shape circle "~" +pulse tone=butter
shape arrow
shape circle "e" tone=mint
page "More dimensions" body="Strings need extra room to wiggle, so the theory adds tiny hidden dimensions curled up too small to see."
shapes caption="Hidden dimensions curled everywhere."
shape box "Tiny curled space" +fill
shape arrow
shape box "Our big 3D world"
page "Still a guess" body="Nobody has seen a string. The math is beautiful but we have no proof yet."
stat "?" "No experiment has confirmed it"
choose "Where next?" "What is a dimension?"|"What is a particle?"|"Why do physicists like it?"
end
```
````

### explain-eli5-black-holes (pass)

**Chris:** ELI5 black holes

Good: One line, then a deck: each page has a drawing (shapes of mass pulling in, a sketch of the point of no return). No page that is only words.

````
Black holes are places where gravity got so strong that nothing, not even light, can escape.

```yui
>full
deck "What a black hole is"
page "A star falls in on itself" body="When a giant star runs out of fuel, it collapses. All its stuff squeezes into a tiny dot."
shapes caption="Star squeezes into a dot."
shape circle Star +pulse tone=butter
shape arrow
shape dot Core tone=mute
page "The pull is too strong" body="The dot is so heavy for its size that its pull wins over everything. Light goes in, nothing comes out."
sketch "Near the hole" frame=bubble
row "Light tries to leave" +x note="pulled back"
row "The edge: no return" +hi note="event horizon"
page "It looks like a dark hole" body="From far away you see a black circle where stars behind it bend and vanish. That circle is the event horizon."
shapes caption="Stars bend around the dark circle."
shape circle "Black circle" +fill tone=mute
shape circle "Stars" +dash
choose "Where next?" "What's inside?"|"Can one eat Earth?"|"What is a quasar?"
end
```
````

### explain-eli5-inflation (pass)

**Chris:** Explain inflation to me like I'm five.

Good: One line, then a deck with a chart or shapes on each page (a price that creeps up, a dollar that buys less). No text-only page.

````
Money buys less over time. Here's why.
```yui
>full
deck "What is inflation"
page "Money loses power" body="A dollar today buys less than it did a few years ago. Prices creep up, so the same bill covers less."
sketch "Same candy bar" frame=bubble before=Then
row "$1 buys a candy bar" +hi note="2020"
after Now
row "$1 buys less than a candy bar" +x note="2026"
page "Why prices climb" body="When lots of people want the same things and there aren't enough to go around, sellers raise prices."
shapes caption="Too many dollars chasing too few things."
shape circle People +pulse
shape arrow
shape box Things tone=butter
page "Wages try to keep up" body="When prices rise, people ask for more pay. More pay lets them spend more, which can push prices up again."
shapes caption="A loop that feeds itself."
shape circle Prices +grow tone=butter
shape arrow
shape circle Wages +pulse tone=mint
shape arrow
page "A little is normal" body="A small, steady rise is actually healthy. Too fast or too slow both cause problems."
chart line "Prices over 10 years" x=Y0|Y5|Y10 y=100|112|126
choose "Where next?" "What is a recession?"|"How do banks stop it?"|"Why are houses so expensive?"
end
```
```remember
note: asked for ELI5 inflation explanation on Oct 5
```
````

### explain-how-vaccines-work (pass)

**Chris:** How do vaccines work?

Good: Asked how something works: a short line, then a deck, a drawing on every page (shapes or a diagram of the practice run for the body).

````
Vaccines teach your body to fight a germ before it ever meets the real thing.

```yui
>full
deck "How vaccines work"
page "Your immune army" body="Your body has special cells that fight germs. They remember each germ they beat."
shapes caption="Germs invade. Fighter cells tag and destroy them."
shape circle Germ +pulse
shape arrow
shape box Fighters
shape arrow
shape circle Dead +fill tone=mute
page "A safe dress rehearsal" body="A vaccine shows your fighters a dead or weak germ. They learn its shape and make weapons, with no real danger."
sketch "Two ways to meet a germ" frame=bubble before="Real infection"
row "Live germ: you get sick" +x note="dangerous"
after "Vaccine"
row "Dead or weak germ: fighters learn" +hi note="safe practice"
page "Memory kicks in" body="If the real germ shows up later, your fighters recognize it fast. They attack before the germ can make you sick."
chart line "Fighter response over days" x=Day1|Day7|Day30 y=10|90|95
choose "Where next?" "Why booster shots?"|"Are vaccines safe?"|"How did they start?"
end
```

```remember
me: name = Chris
note: asked how vaccines work, ELI5 style
```
````

### explain-what-is-a-mortgage (pass)

**Chris:** Simple terms: what is a mortgage?

Good: A line, then a deck with a drawing per page (a house, a loan paid down over time). No page is a paragraph.

````
A mortgage is a loan from a bank to buy a house. The bank pays the seller, and you pay the bank back slowly over many years, plus a fee called interest.

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
page "Paying it back" body="Each month you pay a bit of the loan plus a fee called interest. Early on, the fee is most of it."
chart bar "Where one early payment goes" x=Loan|Interest y=700|1300
page "How long it takes" body="Most mortgages last 30 years. The loan shrinks slowly, then faster near the end."
stat 30y "A common mortgage" spark=100|85|65|35|0
choose "Where next?" "What is interest?"|"Is renting cheaper?"|"What if I miss a payment?"
end
```
````
