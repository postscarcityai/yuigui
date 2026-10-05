# Channel eval: t88-before-glm

Guide v47+b7493fe6 (5616 words), model z-ai/glm-5.2, 2026-10-05T15:27.

**6/8 passed (75%).**

| category | passed |
|---|---|
| explain | 6/8 |

| case | result | why |
|---|---|---|
| explain-mongols-geography | pass |  |
| explain-rome-rise-fall | pass |  |
| explain-monsoon-how | pass |  |
| explain-eli5-string-theory | pass |  |
| explain-eli5-black-holes | pass |  |
| explain-eli5-inflation | FAIL | explain: a page with no picture :: page "Is it bad?" body="A little inflation is normal and okay. Too much is rough. If prices jump fast, your money loses value fast and saving gets harder." |
| explain-how-vaccines-work | pass |  |
| explain-what-is-a-mortgage | FAIL | screen: no ```yui block; words: 42 > 40; explain: no deck; explain: 0 pages, want 2 to 4 |

## Transcripts

### explain-mongols-geography (pass)

**Chris:** All right, can you give me a brief geographic explanation of the Mongols?

Good: One line with the answer, then one deck on `>full` where every page has its picture: the empire as a `map` (its outline in lat,lon points, Karakorum as a pin, routes east and west), the size as a `chart` or a `stat`. Not pages of text, and not the steppe drawn as dots in `shapes` (TestFlight feedback AJIE1_1Ru1V4EMgmpWZtniI: 'It's just a text bomb'; feedback AL2nKEYo on the shapes version: 'Again, not bad but this should be a Map').

````
One line, then the map and the story.

```yui
>full
deck "The Mongols, by the map"
page "How far it reached" body="Korea to Hungary, the Siberian forest to Persia. The largest land empire ever, built on horseback in under 80 years."
map caption="Karakorum sat in the center and rode out every way."
area "Mongol Empire" 53,140|43,131|34.7,126.5|22.3,114|24,98|34,70|25.5,57|33,44|41,31|46,30.5|54,23|60,56|55,95 tone=butter
area Raided PL|HU +dash
pin@ka Karakorum 47.2,102.8 +pulse
route East ka|37.6,127 +arrow
route West ka|50.4,30.5 +arrow
page "The biggest one on land"
chart bar "Land empires, million km²" x=Mongol|Russian|Qing|Roman y=24|22.8|14.7|5
page "At its peak, 1279"
stat "24M km²" "A sixth of the land on Earth"
choose "What next?" "How did they hold it?"|"What ended it?"|"Why do you ask?"
end
```

Want me to go deeper on any page?
````

### explain-rome-rise-fall (pass)

**Chris:** Give me the quick version of how the Roman Empire rose and fell.

Good: A line, then a picture per part: the empire at its peak as a `map` around the Mediterranean, its size over the centuries as a `chart` (or a `timeline` on the stage), the split as an east and west area. No page that is only a heading and a paragraph.

````
```yui
>full
deck "Rome, short version"
page "From a village to an empire" body="Rome started as a cluster of villages in central Italy around 800 BC. It grew through trade and war, becoming a republic ruled by elected senators. By 27 BC, Augustus made himself emperor and the empire was born."
map caption="Rome started in Italy and spread across the Mediterranean."
area "Roman Empire" 41.9,12.5|37,14|36,27|31,31|32,35|35,38|42,38|43,30|45,20|44,12 tone=butter
pin@rm Rome 41.9,12.5 +pulse
route Expansion rm|31.2,29.9 +arrow
page "At its peak" body="By AD 117, Rome ruled about 60 million people across Europe, North Africa and the Near East. Roads, aqueducts and law held it together for centuries."
chart bar "Largest empires, million km²" x=Rome|Han|Parthian y=5|6.5|2.5
page "How it fell" body="By the 200s, inflation, plagues and civil wars weakened it. In AD 395 it split into East and West. The West fell to invasions in AD 476. The East, as Byzantium, lasted nearly 1,000 more years."
shapes "The split" caption="Rome split in two; the West fell, the East endured."
shape circle "Rome" +grow
shape arrow
shape box "West" +fill
shape arrow
shape pill "Fell 476" +dash
shape box "East" +fill
shape arrow
shape pill "Lasted to 1453" tone=mint
end
```
````

### explain-monsoon-how (pass)

**Chris:** Why does India get monsoons? Keep it short.

Good: One line and a picture: land heats, air rises, wet air off the ocean moves in, as a diagram in `shapes` with arrows or a `map` with the winds as routes, maybe a rainfall `chart` by month. Not a paragraph of weather words.

````
```yui
shapes "Why India gets monsoons" caption="Land heats faster than the ocean, pulling wet air in."
shape circle Sun +grow
shape arrow
shape box "Land heats" +pulse
shape arrow
shape blob "Warm air rises" tone=butter
shape arrow
shape pill "Wet ocean air pulled in" tone=mint
shape arrow
shape box "Heavy rain" +fill
```

Hot land rises, wet ocean air rushes in to replace it, hits the Himalayas, dumps rain. June to September, every year.
````

### explain-eli5-string-theory (pass)

**Chris:** Eli5 string theory

Good: One line, then one deck on the stage: 2 to 4 pages, each a few words and its own drawing (shapes of a string vibrating into notes, a sketch of the extra rooms). Never a page of plain text.

````
Everything is made of tiny wiggling strings.

```yui
>full
deck "String theory, ELI5"
page "What's stuff made of?" body="You, me, the stars: all made of atoms. Atoms are made of smaller bits. But what are those bits made of?"
shapes caption="Tiny dots called particles were the old answer."
shape circle Particle +pulse
page "The big idea" body="Instead of tiny dots, imagine everything is made of even tinier strings. Not strings with ends tied: little loops of energy."
shapes caption="A string vibrates, and each vibration is a different particle."
shape box "~~~" +pulse tone=mint
shape text "vibrates"
shape arrow
shape circle "Particle" +grow
page "Like a guitar" body="Pluck a guitar string one way, you get one note. Pluck it another way, a different note. Strings work the same: each vibration makes a different particle. One wiggle is an electron, another is light."
shapes caption="Same string, different notes, different particles."
shape box "~~~" +pulse tone=mint
shape arrow
shape circle "Electron" +grow
shape arrow
shape circle "Light" +grow
page "Why do we care?" body="If it's right, one kind of string could explain everything: gravity, light, matter. One neat answer instead of many messy ones."
shapes caption="One string to explain it all."
shape box "String" +pulse tone=mint
shape arrow
shape circle "All of physics" +grow
choose "Want more?" "How small are they?"|"Why 10 dimensions?"|"Why is it controversial?" +other
end
```

```remember
me: interests = science, curious about physics
note: likes ELI5 explanations
```
````

### explain-eli5-black-holes (pass)

**Chris:** ELI5 black holes

Good: One line, then a deck: each page has a drawing (shapes of mass pulling in, a sketch of the point of no return). No page that is only words.

````
A black hole is a place in space where gravity is so strong nothing can escape, not even light.

```yui
>full
deck "Black holes, super simple"
page "What is it?" body="A black hole is what's left when a giant star runs out of fuel and collapses. Everything gets squished into a tiny, super heavy dot."
shapes
shape circle "Star" +grow
shape arrow
shape dot "Black hole" +pulse
page "Why is it black?" body="Gravity is so strong that even light gets pulled in. No light comes out, so it looks totally black."
shapes
shape box "Light" tone=butter
shape arrow tone=mute
shape circle "" +fill +pulse
page "Would it suck you in?" body="Not from far away. It pulls like anything else with the same weight. You'd only fall in if you got really close."
shapes
shape circle "You" +grow
shape arrow +dash
shape dot "Black hole" +pulse
page "The cool part" body="Time slows down near a black hole. If you watched someone fall in, they'd seem to freeze in place forever."
shapes
shape circle "Friend" +pulse
shape box "Time slows" tone=lavender
choose "What next?" "Tell me more"|"Quiz me"|"That's enough"
end
```

Want me to go deeper or quiz you on what you just learned?
````

### explain-eli5-inflation (FAIL)

**Chris:** Explain inflation to me like I'm five.

Good: One line, then a deck with a chart or shapes on each page (a price that creeps up, a dollar that buys less). No text-only page.

- explain: a page with no picture :: page "Is it bad?" body="A little inflation is normal and okay. Too much is rough. If prices jump fast, your money loses value fast and saving gets harder."

````
Inflation is when money buys less because prices go up over time. Let me show you with pictures.

```yui
>full
deck "Inflation, explained"
page "What is inflation?" body="Imagine you have one dollar. Today it buys one candy bar. Next year, the same candy bar costs two dollars. Your dollar buys less now. That is inflation."
shapes
shape box "Candy bar: $1"
shape arrow
shape box "Candy bar: $2" +pulse
end
page "Why it happens" body="Too many dollars chasing too few things. If everyone has more money but there are the same number of candy bars, the store raises prices."
shapes
shape circle "More dollars" +grow
shape arrow
shape box "Same candy bars"
shape arrow
shape box "Higher prices" +pulse tone=mint
end
page "Is it bad?" body="A little inflation is normal and okay. Too much is rough. If prices jump fast, your money loses value fast and saving gets harder."
choose "Want more?" "How to protect against it"|"Show me a real example"|"Got it, thanks"
end
```

```remember
me: name = Chris
```
````

### explain-how-vaccines-work (pass)

**Chris:** How do vaccines work?

Good: Asked how something works: a short line, then a deck, a drawing on every page (shapes or a diagram of the practice run for the body).

````
Your immune system learns to fight a germ before it ever meets the real thing.
```yui
>full
deck "How vaccines work"
page "The setup" body="A vaccine shows your body a safe piece of a germ, like a mugshot."
shapes
shape circle "Vaccine" +grow
shape arrow
shape box "Immune cells" +pulse
page "The response" body="Your immune system sees the piece, makes antibodies, and trains killer cells."
shapes
shape box "Immune cells" +fill
shape arrow
shape pill Antibodies +pulse tone=mint
page "The memory" body="Special memory cells stick around for years, ready to react fast."
shapes
shape pill Antibodies +fill tone=mint
shape arrow
shape circle "Memory cells" +pulse
page "Next time" body="If the real germ shows up, your body clears it before you get sick."
shapes
shape circle "Real germ" +grow
shape arrow
shape box "Fast response" +pulse tone=mint
choose "Want to go deeper?" "Types of vaccines"|"How long they last"|"Why boosters" +other
end
```
````

### explain-what-is-a-mortgage (FAIL)

**Chris:** Simple terms: what is a mortgage?

Good: A line, then a deck with a drawing per page (a house, a loan paid down over time). No page is a paragraph.

- screen: no ```yui block
- words: 42 > 40
- explain: no deck
- explain: 0 pages, want 2 to 4

````
A mortgage is a loan you take out to buy a home. The bank pays the seller, and you pay the bank back over time, usually 15 to 30 years, with interest. If you stop paying, the bank can take the house.
````
