# Channel eval: t53-full-new-r2

Guide v41+365fd76d (4419 words), model claude-opus-5-5, 2026-09-30T00:14.

**9/11 passed (82%).**

| category | passed |
|---|---|
| list | 1/2 |
| reaction | 1/2 |
| dead-button | 1/1 |
| patch | 1/1 |
| flow | 1/1 |
| idea | 1/1 |
| music | 1/1 |
| where | 2/2 |

| case | result | why |
|---|---|---|
| list-groceries | pass |  |
| react-not-sure | pass |  |
| react-no | FAIL | preset: sketch not in [say ask choose]; preset: row not in [say ask choose] |
| dead-logged-water | pass |  |
| patch-timeline-move | pass |  |
| menu-shortcut | pass |  |
| idea-shapes-heatpump | pass |  |
| music-jam-beat | pass |  |
| where-trip-route | pass |  |
| where-delivery-area | pass |  |
| list-no-escaped-breaks | FAIL | no reply: exit null:  |

## Transcripts

### list-groceries (pass)

**Chris:** Make me a grocery list for high protein meals this week.

Good: A list with +check, a title, and items that fit on a phone.

````
Here's the week, built around five dinners plus easy protein breakfasts and snacks (Mick included).

```yui
>2
list Protein "Chicken thighs, 3 lb" "Lean ground beef, 2 lb" "Salmon, 1.5 lb" "Frozen shrimp, 1 lb" "Eggs, 2 dozen" "Greek yogurt, 2 tubs" "Cottage cheese, 24 oz" "Deli turkey, 1 lb" +check
list Produce "Broccoli, 2 heads" "Spinach, big tub" "Bell peppers, 4" "Sweet potatoes, 4" "Onions, 3" "Avocados, 3" "Bananas" "Berries, 2 packs" +check
list Pantry "Rice" "Black beans, 2 cans" "Oats" "Tortillas" "Peanut butter" "Whey protein" "Frozen edamame" "String cheese" +check
save groceries
```

Rough dinner plan: chicken rice bowls, beef tacos, sheet-pan salmon with sweet potato, shrimp stir-fry, and a leftovers night.
````

### react-not-sure (pass)

**Chris:** [yui] react msg=0f1d2c3b-4a59-4687-9a0b-1c2d3e4f5a6b emoji=🤔 meaning="not sure"
> I can move your Tuesday call to Wednesday at 3 and book the gym at 5 on Tuesday instead.

Good: Asks the first of a few short questions as one screen (a choose or ask), not a form and not a wall of questions.

````
Let's find what fits better.
```yui
choose "What feels off?" "Moving the call"|"Gym at 5"|"Both"|"Tuesday isn't the problem" +other
```
````

### react-no (FAIL)

**Chris:** [yui] react msg=7b8c9d0e-1f2a-4b3c-8d4e-5f6a7b8c9d0e emoji=👎 meaning=no
> Want me to draft a follow-up to the three people who didn't reply last week?

Good: Drops it in a few words. No pushback, no re-offer of the same thing.

- preset: sketch not in [say ask choose]
- preset: row not in [say ask choose]

````
Dropped.
```yui
sketch "Follow-ups" frame=bubble
row "Draft follow-up to 3 non-replies" +x note="dropped"
```
````

### dead-logged-water (pass)

**Chris:** Log 2 liters of water for today.

Good: Confirms in a line or a stat. Nothing to tap unless it does something ("Add 500 ml"); never a lone "Nice" or "Got it".

````
I don't have a water tracker connected, so 2 L for today (Sep 24) isn't saved anywhere yet. I can start a simple log with today as the first entry.

```yui
choose "Start a water log?" "Yes, start one"|"I use another app"|"Skip it"
```
````

### patch-timeline-move (pass)

**Chris:** Blog migration just finished.

Good: A patch that turns the running row done in place (`>2 ~now kind=done at=Fri` or `~blog kind=done`), not the timeline sent again. Starting the contact form is optional; if it does, it patches that row by its id.

````
Blog migration is marked done.

```yui
>2 ~now kind=done at=Thu
```
````

### menu-shortcut (pass)

**Chris:** I log breakfast every single morning. Give me a one-tap way to do it from now on.

Good: A shortcut in the drawer (`menu shortcut@breakfast "Log breakfast" say="Log breakfast: "`) and one short line saying where it lives. No button that only acknowledges.

````
Done. A **Log breakfast** chip now sits over your bar every time you open me. Tap it and I'll pop the camera. Snap your plate, or say what you ate.

```yui
menu shortcut "Log breakfast"
```
````

### idea-shapes-heatpump (pass)

**Chris:** How does a heat pump heat the house when it's cold outside? Quick, I'm on my phone.

Good: One short line and a `shapes` diagram with a caption: cold outside air, the refrigerant loop picking up heat and the compressor squeezing it hotter, heat let out inside, arrows between, labels a word or two. No paragraph, no generated image.

````
Even cold air holds heat. The pump squeezes it hotter and moves it inside.

```yui
shapes "Heat pump loop" caption="Cold refrigerant soaks up outdoor heat, the compressor squeezes it hot, it dumps that heat indoors, then expands cold again."
shape blob "Outside air" tone=lavender
shape arrow
shape circle Compressor +pulse
shape arrow
shape box "Warm house" +fill tone=butter
shape arrow
shape pill "Expands cold" +dash
```
````

### music-jam-beat (pass)

**Chris:** Trying to get back into drumming. Give me a simple boom bap beat around 90 I can mess with.

Good: One `loop` line near 90 BPM with a boom bap pattern in `p=` that plays (`+play`), a short line at most. No pattern written out in words, no drum tab, no advice paragraph.

````
Classic 90 bpm boom bap. Tap steps to change it while it plays.
```yui
loop 90 "Boom bap" rows=kick|snare|hat p=x..x.x..|..x...x.|xxxxxxxx +play
```
````

### where-trip-route (pass)

**Chris:** Thinking about a train trip from Lisbon to Barcelona with stops in Porto and Madrid. How does that route go?

Good: One line, then a map: pins on Lisbon, Porto, Madrid and Barcelona, a route through them with an arrow, a caption with the rough hours (a small `table` of the legs beside it is fine). Not a numbered list of legs in words.

````
North to Porto, up to Vigo to cross into Spain (no direct Porto–Madrid train), then high-speed east to Madrid and Barcelona.

```yui
map "Lisbon to Barcelona by rail" caption="Up the Portuguese coast, into Galicia, then fast trains across Spain."
pin@lis Lisbon 38.72,-9.14
pin@opo Porto 41.15,-8.61 +pulse
pin@vgo Vigo 42.24,-8.72
pin@mad Madrid 40.42,-3.70 +pulse
pin@bcn Barcelona 41.39,2.17
route "The line" lis|opo|vgo|mad|bcn +arrow
list Legs "Lisbon → Porto: ~3h, Alfa Pendular" "Porto → Vigo: ~2.5h, Celta" "Vigo → Madrid: ~4.5h, via Ourense" "Madrid → Barcelona: ~2.5–3h, AVE/Ouigo/Iryo"
```
````

### where-delivery-area (pass)

**Chris:** Our farm delivers CSA boxes across Vermont, New Hampshire and western Massachusetts. Can you show a new customer what that covers?

Good: One line, then a map with the delivery area filled in (VT and NH by code, western Massachusetts as lat,lon points) and the farm or the big towns as pins. Not a list of states and counties.

````
Here's your delivery area for a new customer.

```yui
map "Where our CSA boxes go" caption="All of Vermont and New Hampshire, plus western Massachusetts."
area Vermont 42.73,-73.26|43.60,-73.40|45.01,-73.34|45.01,-71.50|44.40,-71.60|43.50,-72.40|42.73,-72.46 tone=mint
area "New Hampshire" 42.70,-72.46|43.50,-72.40|44.40,-71.60|45.01,-71.50|45.30,-71.08|44.20,-71.00|43.10,-70.70|42.87,-70.81|42.70,-71.25 tone=butter
area "Western Mass" 42.73,-73.26|42.73,-72.25|42.03,-72.25|42.05,-73.49 tone=lavender
pin Burlington 44.48,-73.21
pin Concord 43.21,-71.54
pin Northampton 42.32,-72.63
```
````

### list-no-escaped-breaks (FAIL)

**Chris:** What should I eat for dinner tonight? Something with protein. I'm allergic to peanuts and shellfish.

Good: A few dinners as a `list` (or cards), one per item, and a way to pick one. Never one `say` with \n breaks inside the quotes: the app shows the letter n (YUI-161, GLM 5.2 on native Basil).

- no reply: exit null: 

````
(no reply: exit null: )
````
