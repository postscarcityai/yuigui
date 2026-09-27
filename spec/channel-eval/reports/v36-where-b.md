# Channel eval: v36-where-b

Guide v36+abf12b50 (3367 words), model claude-opus-5-5, 2026-09-27T17:52.

**0/3 passed (0%).**

| category | passed |
|---|---|
| where | 0/3 |

| case | result | why |
|---|---|---|
| where-trip-route | FAIL | need: none of [map route pin]; map: a where answer with no map |
| where-delivery-area | FAIL | need: none of [map area]; map: a where answer with no map |
| where-quick-country | FAIL | need: none of [map area pin]; map: a where answer with no map; pages: 3 > 1 |

## Transcripts

### where-trip-route (FAIL)

**Chris:** Thinking about a train trip from Lisbon to Barcelona with stops in Porto and Madrid. How does that route go?

Good: One line, then a map: pins on Lisbon, Porto, Madrid and Barcelona, a route through them with an arrow, a caption with the rough hours (a small `table` of the legs beside it is fine). Not a numbered list of legs in words.

- need: none of [map route pin]
- map: a where answer with no map

````
It's a zigzag: north up Portugal to Porto, over to Vigo in Spain, then high-speed east to Madrid and Barcelona. No direct train crosses from Porto to Madrid.

```yui
>full
deck "Lisbon to Barcelona by rail"
page "North first, then east" body="Porto is north of Lisbon, so the trip starts in the wrong direction. From Porto, the rail link into Spain runs up the coast to Vigo. From there, high-speed lines carry you to Madrid and on to Barcelona."
shapes caption="Lisbon to Porto to Vigo, then fast trains east through Madrid."
shape@li circle Lisbon at=1,5 +grow +fill tone=butter
shape@po circle Porto at=1,2 +fill tone=mint
shape@vi dot Vigo at=1,1 tone=mute
shape@ma circle Madrid at=5,4 +fill tone=mint
shape@ba circle Barcelona at=9,2 +grow +fill tone=lavender
shape arrow from=li to=po +draw
shape arrow from=po to=vi +draw
shape arrow from=vi to=ma +draw
shape arrow from=ma to=ba +draw
page "Four legs, about 13 hours on trains" body="Lisbon to Porto: Alfa Pendular. Porto to Vigo: the Celta cross-border train, a couple a day. Vigo to Madrid: high-speed via Ourense. Madrid to Barcelona: AVE, Ouigo or Iryo, many a day."
chart bar "Rough hours per leg" x=Lisbon-Porto|Porto-Vigo|Vigo-Madrid|Madrid-Barcelona y=3|2.5|4.5|2.75
page "Worth knowing" points="Porto–Vigo runs only a few times a day, so plan around it"|"A bus or short flight Porto–Madrid can beat the train"|"Madrid–Barcelona is cheap if booked early"|"Check CP and Renfe for current times"
end
```
````

### where-delivery-area (FAIL)

**Chris:** Our farm delivers CSA boxes across Vermont, New Hampshire and western Massachusetts. Can you show a new customer what that covers?

Good: One line, then a map with the delivery area filled in (VT and NH by code, western Massachusetts as lat,lon points) and the farm or the big towns as pins. Not a list of states and counties.

- need: none of [map area]
- map: a where answer with no map

````
Your delivery area spans three states, about 22,000 square miles of northern New England.

```yui
>full
deck "Where your CSA box comes"
page "Three states, one route" body="Vermont and New Hampshire side by side, and western Massachusetts just below. Eastern Massachusetts and Boston are outside the route."
shapes caption="Vermont to the west, New Hampshire to the east, western Mass to the south."
shape@vt blob Vermont at=3,2 +grow +fill tone=mint
shape@nh blob "New Hampshire" at=6,2 +grow +fill tone=mint
shape@ma blob "Western Mass" at=3,4 +grow +fill tone=mint
shape@bos dot Boston at=8,5 +dash tone=mute
shape text "Not covered" at=8,4 tone=mute
page "How big that is" body="Vermont and New Hampshire are nearly the same size. Western Massachusetts adds a smaller strip along the southern edge."
chart bar "Land area, square miles" x=Vermont|"New Hampshire"|"Western Mass" y=9616|9349|2850
page "Western Mass, county by county" body="Western Massachusetts usually means these four counties, from the New York line east to the Quabbin area."
shapes caption="Berkshire on the New York border, then Franklin, Hampshire and Hampden."
shape@be box Berkshire at=1,3 +fill tone=mint
shape@fr box Franklin at=4,2 +fill tone=mint
shape@hs box Hampshire at=4,4 +fill tone=mint
shape@hd box Hampden at=4,5 +fill tone=mint
shape text "East: not covered" at=8,4 tone=mute
end
```

I assumed western Mass means those four counties. If your route stops somewhere else, tell me and I'll redraw it.
````

### where-quick-country (FAIL)

**Chris:** Where exactly is Kyrgyzstan?

Good: One line (Central Asia, between Kazakhstan and China) and a map in the chat: KG as an area with a pulse on Bishkek, neighbors faint. No deck for a quick where.

- need: none of [map area pin]
- map: a where answer with no map
- pages: 3 > 1

````
Central Asia: landlocked, wedged between Kazakhstan and China, just north of Tajikistan.

```yui
>full
deck "Kyrgyzstan, by the map"
page "Four neighbors" body="Kazakhstan to the north, China to the east, Tajikistan to the south, Uzbekistan to the west. No coastline anywhere."
shapes caption="It sits where the old Silk Road crossed into China."
shape dot Kazakhstan at=5,1 tone=mute
shape dot Uzbekistan at=1,4 tone=mute
shape circle Kyrgyzstan at=5,3 +grow +fill tone=butter
shape dot China at=9,3 tone=mute
shape dot Tajikistan at=4,5 tone=mute
page "Inside the borders" body="The capital, Bishkek, is up north near Kazakhstan. Issyk-Kul, a huge alpine lake, is in the northeast. Osh, the second city, is in the south by the Fergana Valley."
shapes caption="Cities on the edges, mountains in the middle."
shape circle Bishkek at=4,1 +fill tone=butter
shape blob Issyk-Kul at=7,2 +pulse tone=lavender
shape text "Tian Shan" at=5,3 tone=mute
shape circle Osh at=3,5 +fill tone=butter
shape text Fergana at=1,5 tone=mute
page "Almost all mountain" body="The Tian Shan and Pamir ranges cover most of the country. About the size of Nebraska, with roughly 7 million people."
stat "~90%" "Of the land above 1,500 m"
end
```
````
