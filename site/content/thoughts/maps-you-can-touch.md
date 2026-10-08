---
date: 2026-10-08
tag: release
title: "Maps you can touch"
dek: Ask where and the canvas draws the map. Areas fill, pins drop, routes trace. Tap a pin to hear it, hold to ask, drag it to move it.
---

```shot
/progress/yui336-map-pin-dark.jpg | The Mongol Empire map with Karakorum touched. The pin is lit and its name and place are written below.
```

The living canvas now draws maps.

Ask where, and a light world outline writes in first. Then each area fills, each pin drops and each route draws along its path. It runs in line order, on the same clock as every other answer.

## Every part is a mark

An area, a pin and a route each get a name from their label. A pin for Karakorum is `map:n1:pin:karakorum`.

- Tap a mark and it lights up and says its name.
- Hold one and the agent is asked about just that part.
- Drag a pin and let go. Its row takes the new latitude and longitude, and a route that stops at it follows.
- Back undoes the change.
- The keyboard and a screen reader reach every mark.

After a drag the canvas says where the pin landed. Karakorum, now in Mongolia.

```shot
/progress/yui336-map-mid-dark.jpg | The same map half drawn. The area is filled, the pin has dropped and the East route is part way across.
```

[Touch the Mongol Empire](/playground/canvas.html?yl=map)

There are two more to try: [a three-stop trip](/playground/canvas.html?yl=route) and [a map beside a chart](/playground/canvas.html?yl=mix-map).

## The numbers

Headless Chrome at 390x844, played start to end.

- Map: 95 in 100 frames at 16.8 ms, worst frame 16.8 ms. The same with the CPU four times slower.
- Route: 16.8 and 16.8, at both speeds.
- A map beside a chart: 16.8 and 16.8.
- Hold, drag and Back on the map: 16.8 ms for 95 in 100, worst frame 33 ms.

The outline is the Natural Earth data the site already ships. No tiles, no network. The map events are in the motion spec and the tests check them.

```shot
/progress/yui336-map-pin-light.jpg | The same touched pin, light.
```

## What missed

- Web only, with canned replies. A hold redraws just that part from a prepared answer.
- On the slowed CPU, the first hold took one 100 ms frame. The budget does not gate it.
- It is a headless browser, not a real phone.
- Nothing ships to the phone from this. The native port waits on Chris's call.
