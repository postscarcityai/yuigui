# Channel eval: v36-where

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
The route runs north first, from Lisbon to Porto. From there it crosses into Spain at Vigo, then heads east to Madrid and Barcelona. There's no direct Porto–Madrid train, so Galicia is the link.

```yui
>full
deck "Lisbon to Barcelona by rail"
page "North, then east" body="Porto sits north of Lisbon, so the line climbs the coast first. It crosses into Spain at Vigo and cuts inland to Madrid, then runs northeast to Barcelona."
shapes caption="Four legs: up the Portuguese coast, into Galicia, across to Madrid, on to Barcelona."
shape@li circle Lisbon at=1,5 +fill tone=butter
shape@po circle Porto at=1,2 +fill tone=butter
shape@vi dot Vigo at=2,1 tone=mute
shape@ma circle Madrid at=5,3 +fill tone=butter
shape@ba circle Barcelona at=9,2 +grow +fill tone=mint
shape arrow from=li to=po +draw
shape arrow from=po to=vi +draw
shape arrow from=vi to=ma +draw
shape arrow from=ma to=ba +draw
page "Time on the train" body="Rough times on the fastest trains. Madrid to Barcelona is the easy leg, with AVE, Ouigo and Iryo all running it many times a day."
chart bar "Hours per leg" x=Lisbon-Porto|Porto-Vigo|Vigo-Madrid|Madrid-Barcelona y=3|2.3|4.3|2.7
page "The tricky leg: Porto to Madrid" body="The Celta train runs Porto to Vigo only about twice a day, so book it first and plan the day around it. It arrives at Vigo Guixar, but Madrid trains leave from Vigo Urzáiz, about a 15-minute walk away."
shapes caption="Catch the Celta, walk across Vigo, then take the high-speed train via Ourense."
shape circle Porto
shape arrow
shape box "Vigo Guixar"
shape arrow +dash
shape box "Vigo Urzáiz" +pulse
shape arrow
shape circle Madrid
page "About 12 hours of riding" body="Each stop breaks up the trip. Portugal's CP and Spain's Renfe sell their tickets separately, so check current schedules before you lock in dates."
stat "~12h" "Total train time, Lisbon to Barcelona"
end
```
````

### where-delivery-area (FAIL)

**Chris:** Our farm delivers CSA boxes across Vermont, New Hampshire and western Massachusetts. Can you show a new customer what that covers?

Good: One line, then a map with the delivery area filled in (VT and NH by code, western Massachusetts as lat,lon points) and the farm or the big towns as pins. Not a list of states and counties.

- need: none of [map area]
- map: a where answer with no map

````
Three states' worth of farm country: all of Vermont and New Hampshire, plus Massachusetts west of Worcester.

```yui
>full
deck "Where your box can go"
page "Our delivery area" body="All of Vermont and New Hampshire, plus the four western Massachusetts counties: Berkshire, Franklin, Hampshire and Hampden."
shapes caption="Anywhere in the green, from Burlington to Portsmouth to Springfield."
shape@vt blob Vermont at=2,2 +grow +fill tone=mint
shape@nh blob "New Hampshire" at=5,2 +grow +fill tone=mint
shape@ma blob "Western MA" at=3,5 +grow +fill tone=mint
shape dot Burlington at=1,1 tone=mute
shape dot Portsmouth at=7,3 tone=mute
shape dot Springfield at=4,5 tone=mute
page "Where we stop" body="Eastern Massachusetts, including Boston and Worcester, is outside the route for now."
shapes caption="Delivery ends at the eastern edge of Hampden and Franklin counties."
shape blob "Western MA" at=2,3 +fill tone=mint
shape arrow
shape circle Boston at=8,3 +dash tone=mute
page "How big that is"
chart bar "Square miles we cover" x=Vermont|"New Hampshire"|"Western MA" y=9616|9349|2850
end
```
````

### where-quick-country (FAIL)

**Chris:** Where exactly is Kyrgyzstan?

Good: One line (Central Asia, between Kazakhstan and China) and a map in the chat: KG as an area with a pulse on Bishkek, neighbors faint. No deck for a quick where.

- need: none of [map area pin]
- map: a where answer with no map
- pages: 3 > 1

````
Central Asia: a landlocked, mountainous country wedged between Kazakhstan and China, just west of Xinjiang.

```yui
>full
deck "Kyrgyzstan, by the map"
page "Its neighbors" body="Kazakhstan to the north, China to the east, Tajikistan to the south, Uzbekistan to the west."
shapes caption="Landlocked, deep in Central Asia, about 2,000 miles from any ocean."
shape@kz dot Kazakhstan at=5,0 tone=mute
shape@uz dot Uzbekistan at=0,3 tone=mute
shape@kg circle Kyrgyzstan at=5,3 +grow +fill tone=butter
shape@cn dot China at=9,3 tone=mute
shape@tj dot Tajikistan at=3,5 tone=mute
page "Inside the country" body="Bishkek, the capital, is in the north near Kazakhstan. The big lake Issyk-Kul sits in the northeast. Osh and the Fergana Valley are in the southwest."
shapes caption="The Tian Shan mountains run through nearly all of it."
shape@bk circle Bishkek at=3,1 +pulse +fill tone=mint
shape@ik blob Issyk-Kul at=7,2 tone=lavender +fill
shape text "Tian Shan" at=5,3 tone=mute
shape@os circle Osh at=2,5 tone=mute
shape text Fergana at=0,5 tone=mute
page "How big, how high" body="About the size of Nebraska, a bit bigger than Florida. Around 7 million people. Over 90% of the land sits above 1,500 m."
stat "200K km²" "Roughly Nebraska-sized"
end
```
````
