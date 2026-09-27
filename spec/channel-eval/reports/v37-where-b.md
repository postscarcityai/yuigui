# Channel eval: v37-where-b

Guide v37+f825adcb (3479 words), model claude-opus-5-5, 2026-09-27T18:08.

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
North from Lisbon to Porto, then into Spain via Vigo and Ourense. There's no direct Porto–Madrid train, so Galicia is the practical link. Then high-speed trains carry you to Madrid and Barcelona.

```yui
map "Lisbon to Barcelona by rail" caption="Up the coast to Porto, across Galicia, then fast trains east."
pin@li Lisbon 38.72,-9.14
pin@po Porto 41.15,-8.61 +pulse
pin@vi Vigo 42.24,-8.72
pin@ou Ourense 42.34,-7.86
pin@ma Madrid 40.42,-3.70 +pulse
pin@ba Barcelona 41.39,2.17
route "Alfa Pendular ~3h" li|po +arrow
route "Celta ~2.5h" po|vi +arrow
route "High-speed ~4.5h" vi|ou|ma +arrow
route "AVE ~2.5h" ma|ba +arrow
```
````

### where-delivery-area (pass)

**Chris:** Our farm delivers CSA boxes across Vermont, New Hampshire and western Massachusetts. Can you show a new customer what that covers?

Good: One line, then a map with the delivery area filled in (VT and NH by code, western Massachusetts as lat,lon points) and the farm or the big towns as pins. Not a list of states and counties.

````
Your delivery area covers all of Vermont and New Hampshire, plus Massachusetts west of Worcester.

```yui
map "Where we deliver" caption="All of Vermont and New Hampshire, plus the Berkshires and Pioneer Valley in western Massachusetts."
area Vermont 45.01,-73.34|45.01,-71.50|44.25,-71.55|43.00,-72.45|42.73,-72.46|42.73,-73.26 tone=mint
area "New Hampshire" 45.30,-71.08|45.01,-71.50|44.25,-71.55|43.00,-72.45|42.70,-72.46|42.70,-71.25|42.87,-70.82|43.10,-70.70|43.56,-70.97 tone=lavender
area "Western Mass" 42.73,-73.26|42.73,-72.10|42.03,-72.10|42.05,-73.49 tone=butter
pin Burlington 44.48,-73.21
pin Concord 43.21,-71.54
pin Springfield 42.10,-72.59 +pulse
```
````

### where-quick-country (pass)

**Chris:** Where exactly is Kyrgyzstan?

Good: One line (Central Asia, between Kazakhstan and China) and a map in the chat: KG as an area with a pulse on Bishkek, neighbors faint. No deck for a quick where.

````
Central Asia, landlocked between Kazakhstan, Uzbekistan, Tajikistan and China, and mostly Tian Shan mountains.

```yui
map "Kyrgyzstan" caption="North of Tajikistan, west of China, with Bishkek near the Kazakh border."
area Kyrgyzstan KG tone=mint +pulse
area Neighbors KZ|UZ|TJ|CN tone=mute
pin Bishkek 42.87,74.59
pin "Issyk-Kul" 42.45,77.25
```
````
