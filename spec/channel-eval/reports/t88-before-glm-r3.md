# Channel eval: t88-before-glm-r3

Guide v47+b7493fe6 (5616 words), model z-ai/glm-5.2, 2026-10-05T15:27.

**5/8 passed (63%).**

| category | passed |
|---|---|
| explain | 5/8 |

| case | result | why |
|---|---|---|
| explain-mongols-geography | pass |  |
| explain-rome-rise-fall | FAIL | parse: end: no open deck, plan, narrate, timeline or sketch :: end; drawn: a page with only words :: What survived |
| explain-monsoon-how | pass |  |
| explain-eli5-string-theory | FAIL | explain: a page with no picture :: page "Why it matters" body="If it is right, one theory explains all particles and forces together. That is the dream: one simple idea behind everything." |
| explain-eli5-black-holes | pass |  |
| explain-eli5-inflation | pass |  |
| explain-how-vaccines-work | pass |  |
| explain-what-is-a-mortgage | FAIL | screen: no ```yui block; explain: no deck; explain: 0 pages, want 2 to 4 |

## Transcripts

### explain-mongols-geography (pass)

**Chris:** All right, can you give me a brief geographic explanation of the Mongols?

Good: One line with the answer, then one deck on `>full` where every page has its picture: the empire as a `map` (its outline in lat,lon points, Karakorum as a pin, routes east and west), the size as a `chart` or a `stat`. Not pages of text, and not the steppe drawn as dots in `shapes` (TestFlight feedback AJIE1_1Ru1V4EMgmpWZtniI: 'It's just a text bomb'; feedback AL2nKEYo on the shapes version: 'Again, not bad but this should be a Map').

````
Sure thing. Here's the Mongol Empire by the map.

```yui
>full
deck "The Mongols, by the map"
page "How far it reached" body="Korea to Hungary, the Siberian forest to Persia. The largest land empire ever."
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
end
```

Want me to go deeper on any part?
````

### explain-rome-rise-fall (FAIL)

**Chris:** Give me the quick version of how the Roman Empire rose and fell.

Good: A line, then a picture per part: the empire at its peak as a `map` around the Mediterranean, its size over the centuries as a `chart` (or a `timeline` on the stage), the split as an east and west area. No page that is only a heading and a paragraph.

- parse: end: no open deck, plan, narrate, timeline or sketch :: end
- drawn: a page with only words :: What survived

````
```yui
>full
deck "Rome: rise and fall"
page "From republic to empire" body="Rome started as a kingdom, became a republic, and by 27 BC Octavian ruled as Augustus, first emperor. Conquest and roads held it together."
map caption="Rome grew from one city to the whole Mediterranean rim."
area "Roman Empire" 41.9,12.5|51.5,-3|36,-2|30,31|31,35|43,13 tone=butter
pin@rome Rome 41.9,12.5 +pulse
page "At its peak" body="By 117 AD Rome ruled 50 million people across three continents. Trade, law, and Latin spread everywhere."
stat "5M km²" "At its largest, under Trajan"
page "The long decline" body="Plague, inflation, and civil war weakened Rome from the 200s. The empire split into East and West in 395. The West could not defend itself."
timeline "Cracks"
done "Empire splits in two" at="395"
next "Sack of Rome by Visigoths" at="410"
done "Final fall of the West" at="476"
page "What survived" body="The Eastern half lived on as the Byzantine Empire for another 1,000 years. Roman law, language, and architecture still shape the world."
choose "Dig into one?" "How they built it"|"Why it fell"|"The split"|"Byzantine half"
end
```
````

### explain-monsoon-how (pass)

**Chris:** Why does India get monsoons? Keep it short.

Good: One line and a picture: land heats, air rises, wet air off the ocean moves in, as a diagram in `shapes` with arrows or a `map` with the winds as routes, maybe a rainfall `chart` by month. Not a paragraph of weather words.

````
```yui
shapes "Why India gets monsoons" caption="Land heats faster than the ocean, so air rises and pulls wet ocean air in."
shape box "Land heats" +grow
shape arrow
shape circle "Warm air rises"
shape arrow
shape pill "Wet ocean air pulled in" +pulse tone=mint
shape arrow
shape box "Heavy rain"
```

The land heats up fast in summer. Warm air rises and pulls in wet ocean air, which dumps rain.
````

### explain-eli5-string-theory (FAIL)

**Chris:** Eli5 string theory

Good: One line, then one deck on the stage: 2 to 4 pages, each a few words and its own drawing (shapes of a string vibrating into notes, a sketch of the extra rooms). Never a page of plain text.

- explain: a page with no picture :: page "Why it matters" body="If it is right, one theory explains all particles and forces together. That is the dream: one simple idea behind everything."

````
Everything you can touch is made of tiny wiggling strings. Like a guitar string playing different notes to make different stuff.

```yui
>full
deck "String theory, simply"
page "Tiny strings, not dots" body="We used to think the smallest bits of matter were tiny dots. String theory says no, they are little vibrating strings."
shapes
shape circle "Dot?" +x tone=mute
shape text "vs"
shape line "~~" label="String" +pulse tone=mint
page "One string, many notes" body="Pluck a guitar string one way, you get an electron. Pluck it another way, you get a quark or a photon. Same string, different vibration."
shapes
shape line "~~~" label="Electron" +grow tone=mint
shape line "—" label="Quark" +draw tone=butter
shape line "~~~~~~~~" label="Photon" +draw tone=lavender
page "Hidden dimensions" body="The math only works if space has extra tiny dimensions curled up so small you never notice them. Like a garden hose looks like a line from far away."
shapes
shape line "—" label="From far away" tone=mute
shape circle "tiny curled up dimensions" +fill +pulse tone=butter
page "Why it matters" body="If it is right, one theory explains all particles and forces together. That is the dream: one simple idea behind everything."
choose "Want to go deeper?" "How does vibration make matter?"|"What are the extra dimensions?"|"Why do scientists believe it?" +other
end
```
````

### explain-eli5-black-holes (pass)

**Chris:** ELI5 black holes

Good: One line, then a deck: each page has a drawing (shapes of mass pulling in, a sketch of the point of no return). No page that is only words.

````
Space has a drain with no bottom. Here's how it works.

```yui
>full
deck "Black holes, ELI5"
page "What it is" body="A black hole is a spot in space where stuff got squished so tight nothing can escape it. Not light, not rockets, not even the fastest thing you know."
shapes
shape circle Star +grow
shape arrow
shape dot "Squish" +pulse
page "Why black?" body="Light bounces off things so you see them. A black hole pulls all the light in and never lets it go. So it looks like a hole that's totally black."
shapes
shape circle "Light" +dash
shape arrow
shape blob "No light out" +fill
page "How big?" body="Most are tiny, smaller than a city, but some are billions of times bigger than our sun. The biggest one we found could swallow our whole solar system."
stat "One is bigger than our solar system"
page "Could it eat us?" body="Nope. The nearest one is far away, and they don't suck things in like a vacuum. You have to get really close to fall in."
shapes
shape circle "You" +grow
shape arrow
shape dot "Black hole"
shape text "Far away" tone=mute
choose "Want more?" "How they form"|"What's inside"|"I'm good"
end
```
````

### explain-eli5-inflation (pass)

**Chris:** Explain inflation to me like I'm five.

Good: One line, then a deck with a chart or shapes on each page (a price that creeps up, a dollar that buys less). No text-only page.

````
Money is like a magic ticket. Let me show you how it shrinks.

```yui
>full
deck "Inflation, super simple"
page "Money buys things" body="One dollar today gets you a candy bar."
shapes
shape box "$1" +grow
shape arrow
shape box "🍫" +pulse tone=mint
page "Prices go up" body="Next year the same candy bar costs two dollars."
shapes
shape box "$1" +x note="won't buy it"
shape arrow
shape box "$2" +grow tone=mint
shape arrow
shape box "🍫"
page "Your dollar shrinks" body="Same dollar, less candy. That slow change is inflation."
chart line "What $1 buys" x=Now|"Next year"|"In 10 years" y=1|0.97|0.78
choose "Want more?" "How fast is it now?"|"Why does it happen?"|"I'm good"
end
```
````

### explain-how-vaccines-work (pass)

**Chris:** How do vaccines work?

Good: Asked how something works: a short line, then a deck, a drawing on every page (shapes or a diagram of the practice run for the body).

````
Your immune system learns the enemy before the real fight.
```yui
>full
deck "How vaccines work"
page "The idea" body="A vaccine shows your body a safe preview of a germ so it learns to fight the real thing later."
shapes caption="Training before the battle"
shape circle You +grow
shape arrow
shape box Vaccine +fill
shape arrow
shape pill Immunity +pulse tone=mint
page "What happens inside" body="Your immune cells meet the harmless germ pieces, make antibodies, and remember them."
shapes caption="Cells learn, then remember"
shape dot Antigen +fill
shape arrow
shape box B-cell +draw
shape arrow
shape pill Antibodies +grow tone=mint
shape arrow
shape box Memory +pulse
page "Why it sticks" body="Memory cells stay in your body for years. If the real germ shows up, they respond fast."
chart line "Antibody level over time" x=Before|After|Booster y=5|80|95
choose "Want to go deeper?" "Types of vaccines"|"How boosters work"|"Are they safe?"
end
```
````

### explain-what-is-a-mortgage (FAIL)

**Chris:** Simple terms: what is a mortgage?

Good: A line, then a deck with a drawing per page (a house, a loan paid down over time). No page is a paragraph.

- screen: no ```yui block
- explain: no deck
- explain: 0 pages, want 2 to 4

````
A mortgage is a loan from a bank to buy a home. You pay it back monthly over many years, and the home itself is the collateral: if you stop paying, the bank can take it.
````
