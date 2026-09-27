# Channel eval: v37-where-c

Guide v37+f825adcb (3479 words), model claude-opus-5-5, 2026-09-27T18:10.

**3/3 passed (100%).**

| category | passed |
|---|---|
| where | 3/3 |

| case | result | why |
|---|---|---|
| where-trip-route | pass |  |
| where-delivery-area | pass |  |
| where-quick-country | pass |  |

## Transcripts

### where-trip-route (pass)

**Chris:** Thinking about a train trip from Lisbon to Barcelona with stops in Porto and Madrid. How does that route go?

Good: One line, then a map: pins on Lisbon, Porto, Madrid and Barcelona, a route through them with an arrow, a caption with the rough hours (a small `table` of the legs beside it is fine). Not a numbered list of legs in words.

````
North from Lisbon to Porto, then over the border to Vigo, since no direct train runs from Porto to Madrid. From Vigo it's high-speed east to Madrid, then on to Barcelona.

```yui
map "Lisbon to Barcelona by rail" caption="Up the Portuguese coast, across Galicia, then high-speed east through Madrid."
pin@lis Lisbon 38.72,-9.14
pin@opo Porto 41.15,-8.61
pin@vgo "Vigo (change)" 42.24,-8.72 +pulse
pin@mad Madrid 40.42,-3.70
pin@bcn Barcelona 41.39,2.17
route "The trip" lis|opo|vgo|mad|bcn +arrow
table "Legs" Leg|Train|Time "Lisbon → Porto|Alfa Pendular|~3h" "Porto → Vigo|Celta|~2.5h" "Vigo → Madrid|High-speed via Ourense|~4.5h" "Madrid → Barcelona|AVE/Ouigo/Iryo|~2.5h"
```
````

### where-delivery-area (pass)

**Chris:** Our farm delivers CSA boxes across Vermont, New Hampshire and western Massachusetts. Can you show a new customer what that covers?

Good: One line, then a map with the delivery area filled in (VT and NH by code, western Massachusetts as lat,lon points) and the farm or the big towns as pins. Not a list of states and counties.

````
Every box goes to Vermont, New Hampshire, or the four western Massachusetts counties: the Berkshires through the Pioneer Valley.

```yui
map "Where our CSA boxes go" caption="All of Vermont and New Hampshire, plus Massachusetts west of Worcester County."
area Vermont 42.73,-73.26|45.01,-73.34|45.01,-71.5|44.25,-71.9|43.3,-72.4|42.73,-72.46 tone=mint
area "New Hampshire" 42.73,-72.46|43.3,-72.4|44.25,-71.9|45.01,-71.5|45.3,-71.08|44.3,-71.0|43.1,-70.7|42.87,-70.82|42.7,-71.3 tone=lavender
area "Western Mass" 42.73,-73.26|42.73,-72.1|42.02,-72.1|42.05,-73.49 tone=butter +pulse
pin Burlington 44.48,-73.21
pin Concord 43.21,-71.54
pin Springfield 42.1,-72.59
```

I can mark your farm on the map if you tell me where it is.
````

### where-quick-country (pass)

**Chris:** Where exactly is Kyrgyzstan?

Good: One line (Central Asia, between Kazakhstan and China) and a map in the chat: KG as an area with a pulse on Bishkek, neighbors faint. No deck for a quick where.

````
Central Asia, landlocked in the Tian Shan mountains, wedged between Kazakhstan, China, Tajikistan and Uzbekistan.

```yui
map "Kyrgyzstan" caption="Kazakhstan to the north, China to the east, Tajikistan south, Uzbekistan west."
area Kyrgyzstan KG +pulse tone=mint
area Neighbors KZ|CN|TJ|UZ tone=mute
pin Bishkek 42.87,74.59
pin "Issyk-Kul" 42.4,77.3
```
````
