# Channel eval: v37-where

Guide v37+f825adcb (3479 words), model claude-opus-5-5, 2026-09-27T18:08.

**1/3 passed (33%).**

| category | passed |
|---|---|
| where | 1/3 |

| case | result | why |
|---|---|---|
| where-trip-route | FAIL | words: 41 > 40 |
| where-delivery-area | FAIL | words: 46 > 40 |
| where-quick-country | pass |  |

## Transcripts

### where-trip-route (FAIL)

**Chris:** Thinking about a train trip from Lisbon to Barcelona with stops in Porto and Madrid. How does that route go?

Good: One line, then a map: pins on Lisbon, Porto, Madrid and Barcelona, a route through them with an arrow, a caption with the rough hours (a small `table` of the legs beside it is fine). Not a numbered list of legs in words.

- words: 41 > 40

````
It's a loop north, then east. There's no direct Porto–Madrid train, so you'd cross into Spain through Galicia.

```yui
map "Lisbon to Barcelona by rail" caption="North to Porto, over the border to Vigo, high speed through Ourense to Madrid, then on to Barcelona."
pin@li Lisbon 38.72,-9.14
pin@po Porto 41.15,-8.61 +pulse
pin@vi Vigo 42.24,-8.72
pin@ou Ourense 42.34,-7.86
pin@ma Madrid 40.42,-3.70 +pulse
pin@ba Barcelona 41.39,2.17
route "Alfa Pendular" li|po +arrow
route "Celta" po|vi +arrow
route "High speed" vi|ou|ma +arrow
route "AVE" ma|ba +arrow
table "Legs, roughly" Leg|Train|Time "Lisbon → Porto|Alfa Pendular|~3h" "Porto → Vigo|Celta|~2.5h" "Vigo → Madrid|Alvia/AVE via Ourense|~4.5h" "Madrid → Barcelona|AVE, Ouigo, Iryo|~2.5–3h"
```

That's about 12–13 hours of riding. The Porto–Vigo Celta runs only a couple of times a day, so that leg sets your schedule.
````

### where-delivery-area (FAIL)

**Chris:** Our farm delivers CSA boxes across Vermont, New Hampshire and western Massachusetts. Can you show a new customer what that covers?

Good: One line, then a map with the delivery area filled in (VT and NH by code, western Massachusetts as lat,lon points) and the farm or the big towns as pins. Not a list of states and counties.

- words: 46 > 40

````
Here's the delivery area: all of Vermont and New Hampshire, plus Massachusetts west of Worcester County.

```yui
map "Where we deliver" caption="Every town in Vermont and New Hampshire, plus the Berkshires and Pioneer Valley in Massachusetts."
area Vermont 42.73,-73.26|43.6,-73.4|45.01,-73.34|45.01,-71.5|44.0,-72.05|43.0,-72.45|42.73,-72.46 tone=mint
area "New Hampshire" 42.73,-72.46|43.0,-72.45|44.0,-72.05|45.01,-71.5|45.3,-71.08|43.1,-70.7|42.87,-70.82|42.7,-71.3 tone=mint
area "Western Mass" 42.73,-73.26|42.73,-72.28|42.03,-72.28|42.05,-73.5 tone=butter +pulse
pin Burlington 44.48,-73.21
pin Concord 43.21,-71.54
pin Northampton 42.33,-72.64
```

I drew western Mass as Berkshire, Franklin, Hampshire and Hampden counties. If your line is somewhere else, like Worcester or the I-91 corridor only, tell me and I'll move it.
````

### where-quick-country (pass)

**Chris:** Where exactly is Kyrgyzstan?

Good: One line (Central Asia, between Kazakhstan and China) and a map in the chat: KG as an area with a pulse on Bishkek, neighbors faint. No deck for a quick where.

````
Central Asia: a mountainous, landlocked country wedged between Kazakhstan to the north and China to the east, with Uzbekistan and Tajikistan to the west and south. Mostly the Tian Shan range.

```yui
map "Kyrgyzstan" caption="Landlocked in the Tian Shan, west of China and south of Kazakhstan."
area Kyrgyzstan KG tone=butter +pulse
area Neighbors KZ|CN|UZ|TJ tone=mute
pin@bk Bishkek 42.87,74.59
pin@ik "Issyk-Kul" 42.45,77.25
```
````
