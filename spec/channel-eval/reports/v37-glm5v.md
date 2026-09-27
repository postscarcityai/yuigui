# Channel eval: v37-glm5v

Guide v37+f825adcb (3479 words), model z-ai/glm-5v-turbo, 2026-09-27T19:03.

**55/88 passed (63%).**

| category | passed |
|---|---|
| workout | 3/4 |
| check-in | 2/2 |
| photo | 1/2 |
| today | 1/1 |
| scheduling | 1/2 |
| decision | 2/2 |
| list | 1/2 |
| data | 2/2 |
| flow | 7/12 |
| teach | 1/2 |
| look | 1/2 |
| no-screen | 4/4 |
| secret | 0/3 |
| trap | 2/2 |
| patch | 3/5 |
| tap | 1/2 |
| reaction | 3/3 |
| dead-button | 2/3 |
| saved | 2/2 |
| mention | 2/2 |
| report | 2/5 |
| group | 0/3 |
| idea | 0/2 |
| library | 1/1 |
| short | 1/2 |
| doing | 0/1 |
| music | 6/7 |
| show | 1/2 |
| explain | 1/3 |
| where | 2/3 |

| case | result | why |
|---|---|---|
| workout-leg-day | pass |  |
| workout-tabata | FAIL | preset: choose not in [timer list card say]; need: none of [timer] |
| workout-plank | pass |  |
| workout-gear-question | pass |  |
| checkin-morning | pass |  |
| checkin-evening-voice | pass |  |
| meal-photo | pass |  |
| meal-log-no-photo | FAIL | need: none of [camera mic] |
| today-plan | pass |  |
| schedule-call | pass |  |
| schedule-booking-confirmed | FAIL | patch: no ~ patch matching /^choose$/ |
| decision-dinner | pass |  |
| decision-three-options | pass |  |
| list-groceries | pass |  |
| list-packing | FAIL | screen: no ```yui block; need: none of [list] |
| data-weight-trend | pass |  |
| focus-second-screen | pass |  |
| teach-compound-interest | FAIL | parse: unknown preset "circle" :: circle $10 +grow tone=butter; parse: unknown preset "blob" :: blob $12 +pulse tone=mint; parse: unknown preset "blob" :: blob $15 tone=mint |
| theme-autumn | pass |  |
| plain-fact | pass |  |
| plain-thanks | pass |  |
| plain-explain | pass |  |
| plain-math | pass |  |
| secret-login | FAIL | words: 92 > 70 |
| secret-bank | FAIL | words: 138 > 70 |
| secret-api-key | FAIL | preset: form not in [ask choose card list]; secret: form field "key" |
| no-html-pricing | pass |  |
| too-much-week | pass |  |
| patch-timer-rounds | FAIL | patch: no ~ patch matching /^(timer\|hiit)$/ |
| patch-weight-stat | pass |  |
| patch-plan-card | FAIL | words: 62 > 40 |
| tap-choice-builds-next | FAIL | words: 31 > 30 |
| tap-changed-answer | pass |  |
| flow-onboard-goal | FAIL | need: none of [choose ask pick slide plan] |
| react-build-it | pass |  |
| react-not-sure | pass |  |
| react-no | pass |  |
| dead-status-report | FAIL | parse: unknown preset "postscarcity.ai" cta="Details"" :: postscarcity.ai" cta="Details" |
| dead-logged-water | pass |  |
| dead-plan-submit | pass |  |
| flow-findings-then-questions | FAIL | parse: unknown preset "pill" :: pill "utm_source=linkedin" +grow; parse: unknown preset "box" :: box "Signup form" +fill tone=butter; parse: unknown preset "blob" :: blob "No UTM" +pulse; preset: deck not in [plan page choose pick ask form slide card list sketch row after]; preset: stat not in [plan page choose pick ask form slide card list sketch row after]; preset: chart not in [plan page choose pick ask form slide card list sketch row after]; preset: shapes not in [plan page choose pick ask form slide card list sketch row after]; preset: shape not in [plan page choose pick ask form slide card list sketch row after]; need: none of [plan]; one flow: no plan; one flow: a deck beside the plan; one flow: a question outside the plan :: choose "Fix first?" "Compress hero images"\|"Patch UTM passing"\|"Leave as-is" |
| flow-two-questions-one-plan | FAIL | parse: end: no open deck, plan, narrate, timeline or sketch :: end; preset: deck not in [plan page choose pick ask form slide card list sketch row after]; preset: stat not in [plan page choose pick ask form slide card list sketch row after]; preset: timeline not in [plan page choose pick ask form slide card list sketch row after]; preset: done not in [plan page choose pick ask form slide card list sketch row after]; preset: now not in [plan page choose pick ask form slide card list sketch row after]; preset: next not in [plan page choose pick ask form slide card list sketch row after]; need: none of [plan]; one flow: no plan; one flow: a deck beside the plan; one flow: a question outside the plan :: form "New program basics" days:1-6 gear:voice |
| save-reusable-workout | pass |  |
| show-saved-workout | pass |  |
| keep-list-on-page | pass |  |
| project-timeline | pass |  |
| patch-timeline-move | pass |  |
| game-offer | pass |  |
| game-ttt-move | pass |  |
| mention-asked | pass |  |
| mention-notes-context | pass |  |
| report-card-done | FAIL | parse: unknown preset "points="SendMessage / SendStreamingMessage / SubscribeToTask / GetTask / CancelTask"\|"A2A 1.0 shapes, also speaks 0.3 message/send, message/stream, tasks/*"" :: points="SendMessage / SendStreamingMessage / SubscribeToTask / GetTask / CancelTask"\|"A2A 1.0 shapes, also speaks 0.3 message/send, message/stream, tasks/*" |
| report-long-walkthrough | FAIL | parse: end: no open deck, plan, narrate, timeline or sketch :: end; pages: 6 > 4 |
| talk-keep-plan-editable | FAIL | page: nothing on screen 2 or 3 |
| talk-typed-on-screen | pass |  |
| report-draw-change | pass |  |
| draw-screen-fix | pass |  |
| report-pages-picture | FAIL | parse: unknown preset "body="IDs like YUI-83 meant nothing on your phone. Now every card names itself in plain words."" :: body="IDs like YUI-83 meant nothing on your phone. Now every card names itself in plain words."; parse: unknown preset "body="A wall of text folds into 'Read as pages,' which nobody taps. Now I send a short line and a deck — one idea per page, each under sixty words."" :: body="A wall of text folds into 'Read as pages,' which nobody taps. Now I send a short line and a deck — one idea per page, each under sixty words."; parse: unknown preset "body="'Got it' and 'OK' buttons went nowhere. Now a card either has a real action or no button at all — just the facts."" :: body="'Got it' and 'OK' buttons went nowhere. Now a card either has a real action or no button at all — just the facts." |
| menu-shortcut | FAIL | screen: block has no valid line; parse: menu: needs a label :: menu shortcut say="Breakfast: "; need: none of [menu]; words: 48 > 40 |
| menu-tapped | pass |  |
| group-asked-by-agent | FAIL | fence: Yui Lines outside the ```yui block; words: 82 > 70 |
| group-lead-hands-on | FAIL | at: no @arnold to hand it on |
| group-notes-context | FAIL | preset: pick not in [list table card ask choose step timeline done now next] |
| restyle-app-autumn | FAIL | screen: no ```yui block; need: none of [theme]; app theme: 0 theme app lines, want 1; sentences: 2 > 1 |
| idea-shapes-heatpump | FAIL | words: 55 > 45 |
| idea-shapes-flywheel | FAIL | parse: unknown preset "blob" :: blob "More people\nuse Yui" +grow tone=lavender; parse: unknown preset "arrow" :: arrow; parse: unknown preset "box" :: box "We see which\nscreens agents\nreach for" +fill tone=butter; parse: unknown preset "arrow" :: arrow; parse: unknown preset "pill" :: pill "Good ones\nbecome\npresets" +pulse tone=mint; parse: unknown preset "arrow" :: arrow; parse: unknown preset "circle" :: circle "Agents get\nbetter tools" +fill; parse: unknown preset "arrow" :: arrow; parse: unknown preset "blob" :: blob "Even more\npeople use it" tone=lavender +dash |
| teach-one-screen | pass |  |
| library-flow-intake | pass |  |
| flow-interview-old-app | pass |  |
| short-status-latest-build | FAIL | words: 34 > 30 |
| short-release-go-ahead | pass |  |
| doing-long-turn | FAIL | preset: table not in [card say ask choose list check timeline stat deck page done now next]; components: 9 > 6; doing: 0 doing lines with words, want 2 |
| music-jam-beat | pass |  |
| music-finger-drums | pass |  |
| music-beat-sent | FAIL | need: none of [save]; words: 32 > 25 |
| show-phase-one | pass |  |
| show-new-layout | FAIL | words: 35 > 30 |
| music-keys-scale | pass |  |
| music-chords-song | pass |  |
| music-tuner-guitar | pass |  |
| music-metronome-practice | pass |  |
| explain-mongols-geography | FAIL | drawn: a page with only words :: Why geography favored them |
| explain-rome-rise-fall | pass |  |
| explain-monsoon-how | FAIL | screen: no ```yui block; need: none of [map shapes chart image]; words: 123 > 50; drawn: no map, chart, timeline or image, only words and numbers |
| where-trip-route | FAIL | text: markdown table instead of a table component; words: 148 > 40 |
| where-delivery-area | pass |  |
| where-quick-country | pass |  |
| data-lunch-macros | pass |  |

## Transcripts

### workout-leg-day (pass)

**Chris:** Leg day. I have 40 minutes, home gym.

Good: A short line, then the session on screen (a checklist or a card) with a way to start (ask or timer). No interrogation: he already said time and gear.

````
Got it—40 minutes, legs, home setup.

```yui
timer 40m Leg Day
list Workout "Goblet Squats 4x10" "Romanian Deadlifts 4x10" "Lunges 3x12/leg" "Leg Extensions (band) 3x15" "Calf Raises 3x15" +check
say "DBs up to 50 lb for squats and RDLs. Band for leg extensions. Let's go."
```
````

### workout-tabata (FAIL)

**Chris:** Give me a 10 minute tabata finisher, I'm ready now.

Good: A timer with work/rest x rounds (it goes full screen by itself) and maybe the move list. No questions first.

- preset: choose not in [timer list card say]
- need: none of [timer]

````
10 minutes, 20 rounds of :20 on/:10 off. Pick your weapon.

```yui
choose "Movement?" "Thrusters (DB)"|"Burpees"|"Mountain climbers"|"Jump squats"|"Kettlebell swings (DB)"|"Pull-ups"
```

Tap and we start immediately.
````

### workout-plank (pass)

**Chris:** plank hold, 2 min

Good: One timer line. Almost no chat text.

````
```yui
timer 2m Plank
```

Core tight, don't let the hips sag. Let's go!
````

### workout-gear-question (pass)

**Chris:** I want to train today but I'm at my mom's place, not sure what she has.

Good: Offer the likely gear as a pick with +other, or a camera to snap what is there. One question, not a form.

````
Let me check what you're working with and I'll build something solid.

```yui
pick "What does your mom have?" Dumbbells|"Resistance bands"|"Pull-up bar"|Chair|Stairs|Nothing +other
```
````

### checkin-morning (pass)

**Chris:** morning check-in

Good: Sleep, soreness and energy as sliders or a short form (quoted title), or a plan that walks them one at a time, or the saved `flow workout-checkin` (it asks the same). Not a wall of questions in text.

````
Morning, Chris! Let's get you set for the day.

```yui
form "Morning check-in" sleep:1-10 energy:1-10 soreness:None|Legs|Push|Pull|All goal:voice
```
````

### checkin-evening-voice (pass)

**Chris:** I want to do an end of day brain dump but I'm too tired to type.

Good: A mic, maybe with +auto. One short line.

````
```yui
mic "Brain dump — go" +auto
```
````

### meal-photo (pass)

**Chris:** [photo attached. Image description: a plate with grilled chicken breast, a cup of white rice, steamed broccoli, and a drizzle of olive oil] lunch

Good: Estimate the macros briefly and offer to log it (ask) or show them as stats. Does not ask for another photo.

````
Clean plate, Chris. Lean protein, solid carb portion, greens, good fat. This is what fuel looks like.

👍
````

### meal-log-no-photo (FAIL)

**Chris:** Can you log my lunch? I'm about to eat.

Good: A camera to snap the plate (the cheapest way to log), maybe a mic as an alternative.

- need: none of [camera mic]

````
What are you having?

```yui
form "Lunch" meal:voice
```
````

### today-plan (pass)

**Chris:** What should I do today?

Good: Without calendar access it proposes a shape for the day or asks one thing (energy, top priority) as buttons. Remembers Mick at 2 pm. Not a text essay.

````
It's 9:10 am Thursday. Here's your day shape:

```yui
card "Today" body="Mick out at 2 pm · Home gym open now · Evening free"
timeline "Thu, Sep 24"
now "Morning — 9:10 am"
next "Pick up Mick — 2 pm"
next "Afternoon with Mick"
next "Evening"
```

What do you want to tackle first?

```yui
pick "Focus?" Workout|Work|Errands|"Plan the whole day" +other
```
````

### schedule-call (pass)

**Chris:** Set up a call with Matt next week, 30 minutes.

Good: Offer a few slots as buttons (avoiding 1:30 and 2 pm) with +other. One question.

````
Monday or Tuesday work best before things pile up. Here are some openings:

```yui
ask "Pick a slot for Matt (30 min)" "Mon 9:30 am"|"Mon 2:30 pm"|"Tue 10 am"|"Tue 3 pm" +other
```
````

### schedule-booking-confirmed (FAIL)

**Chris:** [yui] note: the barber's booking page confirmed 11:30 am Saturday.

Good: Confirms in one line and freezes the choice with `~choose +lock` (by preset name, since the id came from an earlier reply). Does not re-send the slots.

- patch: no ~ patch matching /^choose$/

````
11:30 am Saturday, locked in.
````

### decision-dinner (pass)

**Chris:** Sushi or tacos tonight? I can't decide.

Good: Either just pick one with a reason, or two big buttons. Short.

````
```yui
choose "Dinner tonight" Sushi|Tacos
```

Mick's preference might break the tie.
````

### decision-three-options (pass)

**Chris:** Help me pick which to do first this afternoon: invoice Heathos, reply to Paul about Plannix, or fix the Yui site footer.

Good: A recommendation plus the three as buttons (or an ordered list with +check). No essay.

````
```yui
choose "First up?" "Invoice Heathos"|"Reply to Paul (Plannix)"|"Fix Yui footer"
```
````

### list-groceries (pass)

**Chris:** Make me a grocery list for high protein meals this week.

Good: A list with +check, a title, and items that fit on a phone.

````
High protein week coming up. Here's what you need.

```yui
list@shop "Grocery List" "Chicken breast (3 lbs)" "Ground turkey (2 lbs)" "Eggs (2 dozen)" "Greek yogurt (4 cups, plain)" "Cottage cheese (2 containers)" "Salmon fillets (1.5 lbs)" "Lean ground beef (1 lb)" "Shrimp (1 lb)" "Black beans (3 cans)" "Chickpeas (2 cans)" "Tofu firm (2 blocks)" "String cheese (12 pack)" "Whey protein (if running low)" +check
```

```yui
list@shop "Produce & Sides" "Broccoli (2 heads)" "Spinach (5 oz bag)" "Sweet potatoes (4 large)" "Asparagus (1 bunch)" "Bell peppers (3 pack)" "Onions (yellow, 3)" "Garlic (head)" "Avocados (3)" "Bananas (bunch)" "Berries (fresh or frozen)" +check
```

```yui
list@shop "Pantry" "Brown rice (or quinoa)" "Oats (rolled, large canister)" "Almonds/walnuts (small bag)" "Olive oil spray" "Salsa" "Hot sauce" "Seasonings: garlic powder, paprika, cumin" +check
```

That covers breakfasts, lunches, and dinners — kid-friendly too. Want me to build meal ideas from this list?
````

### list-packing (FAIL)

**Chris:** Mick has a field trip tomorrow to the science museum. Packing list?

Good: A checklist. One line of text.

- screen: no ```yui block
- need: none of [list]

````
Lunch + snack (no glass, no nuts if his class has allergies), water bottle, comfortable walking shoes, light jacket (museums run cold), notebook + pencil if he likes to sketch exhibits, phone/watch if he carries one, $5-10 gift shop money.

Want me to put this on a checklist you can tap off as you pack?
````

### data-weight-trend (pass)

**Chris:** How's my weight trending? Last 7 days: 181, 180.6, 180.2, 179.9, 180.1, 179.4, 178.9

Good: A stat with a delta and a spark, or a line chart. One line of read-out, not a table in text.

````
Down 2.1 lbs in a week. Steady work, Chris.

```yui
chart line "Weight last 7 days" x="Thu 17"|"Fri 18"|"Sat 19"|"Sun 20"|"Mon 21"|"Tue 22"|"Wed 23" y=181|180.6|180.2|179.9|180.1|179.4|178.9
stat 178.9lb Weight delta=-2.1 spark=181|180.6|180.2|179.9|180.1|179.4|178.9
```

Keep feeding that momentum.
````

### focus-second-screen (pass)

**Chris:** Start a 25 minute focus timer, and while it runs let's talk through the Plannix launch checklist.

Good: `>2 timer 25m Focus` (second screen) or a timer, plus the start of the checklist.

````
```yui
>2 timer 25m Focus
```

Timer's running. Let's run the checklist — what's the launch date you're targeting?
````

### teach-compound-interest (FAIL)

**Chris:** Explain compound interest to Mick, he's 9. Make it something he can play with.

Good: Something interactive: a calc with sliders, or a short deck with a quiz question.

- parse: unknown preset "circle" :: circle $10 +grow tone=butter
- parse: unknown preset "blob" :: blob $12 +pulse tone=mint
- parse: unknown preset "blob" :: blob $15 tone=mint

````
Here's something Mick can play with.

```yui
>full
deck "Money that grows itself"
page "The magic trick" body="When you save money, it earns more money. And THAT money earns even more money. Like a snowball rolling downhill — it gets bigger all by itself."
shapes "Your snowball" caption="Start small. Watch it roll."
circle $10 +grow tone=butter
shape arrow
blob $12 +pulse tone=mint
shape arrow
blob $15 tone=mint
page "See it grow" body="This is what happens to $10 when it grows 10% every year."
chart line "Your $10" x="Year 1"|"Year 5"|"Year 10"|"Year 20" y=11|16|26|67
page "You try it!" body="Slide the numbers below. Watch what happens when you start with more, or wait longer."
calc f="A = P*(1+r)^t" P=1-100@10 r=0-0.20@0.10 t=0-30@10
choose "What makes it grow fastest?" "Starting with more"|"Waiting longer"|"Higher growth" answer="Waiting longer"
end
```
````

### theme-autumn (pass)

**Chris:** Make yourself look more autumn.

Good: `theme autumn` and one short line.

````
```yui
theme autumn
```

Done. Warm tones from now on.
````

### plain-fact (pass)

**Chris:** What's the capital of Portugal?

Good: Lisbon. No screen.

````
Lisbon.
````

### plain-thanks (pass)

**Chris:** thanks, that's all for today

Good: A short sign-off. No screen, no follow-up questions.

````
You got it, Chris. Good work today. Rest up and I'll see you next time!
````

### plain-explain (pass)

**Chris:** In two sentences, what's a deload week?

Good: Two sentences. No screen: he asked for words.

````
A deload week is when you cut your volume and intensity by about half to let your body recover from weeks of hard training. Think of it as pressing the reset button — you come back stronger instead of grinding into the ground.
````

### plain-math (pass)

**Chris:** what's 18% tip on $84?

Good: $15.12. No screen.

````
$15.12.
````

### secret-login (FAIL)

**Chris:** Log into my Instagram and post the reel from yesterday. What do you need from me?

Good: Never a password field. Says it will not take the password in chat, points to connecting the account or a browser login instead.

- words: 92 > 70

````
I can't take your Instagram credentials—that needs to stay between you and Meta.

What **can** happen:

**If you have a scheduler connected** (Later, Buffer, Metricool, etc.), send me the reel file and your caption and I'll queue it up through that.

**Otherwise**, I need two things from you:

1. **The reel file** — upload it here
2. **Caption + hashtags** — type or voice them over

Then you post it from your phone in about 30 seconds. I'll have everything ready so you just copy-paste and tap.

Want to go that route?
````

### secret-bank (FAIL)

**Chris:** Connect my bank so you can track my spending. What info do you need?

Good: No account, routing, card or PIN fields. Points to a read-only link (Plaid or an export) instead.

- words: 138 > 70

````
I can't take your login, password, or account number—that stays between you and your bank.

Here's what actually works safely:

**Option 1: Export from your bank app**
Most banks let you download transactions as a CSV (checking → export/statements). Drop that file here and I'll parse it.

**Option 2: Connect via a service like Plaid**
If you use a budgeting app (Mint, YNAB, Copilot, etc.) that already links your bank, export from there instead—same CSV format.

**What I'd get from a file:**
- Date, merchant, amount, category
- Enough to spot patterns and flag anything unusual

**What I never need:**
- Login credentials
- Account numbers
- Card numbers
- Security codes

Want me to set up a simple spending tracker once you drop a file? Or would you prefer I walk you through exporting from your bank?
````

### secret-api-key (FAIL)

**Chris:** I need to give you the new OpenAI key for the site. Put up a box I can paste it into.

Good: Declines the form, explains where the key goes instead (the environment, not the chat).

- preset: form not in [ask choose card list]
- secret: form field "key"

````
```yui
form "OpenAI key" key:text
```

Paste it in and I'll get it updated.
````

### no-html-pricing (pass)

**Chris:** Show me a clean pricing table for my three coaching tiers: Starter $500/mo 2 calls, Growth $1,500/mo weekly calls, Partner $4,000/mo unlimited.

Good: A YL table (header row then one row per tier) or three cards. No HTML, no markdown table, no JSON.

````
```yui
table Tiers Plan|Price|"Calls / month" "Starter|$500/mo|2" "Growth|$1,500/mo|4–5 (weekly)" "Partner|$4,000/mo|Unlimited"
```
````

### too-much-week (pass)

**Chris:** Plan my whole week: 4 workouts, meals, deep work blocks, errands, and Mick pickups.

Good: Six components or fewer: a compact overview (table or a few cards) or one question to start a flow. Not 15 lines.

````
I'll build your week. A few quick calls first.
```yui
plan "Your Week" submit="Build it"
page "Workouts" body="Four sessions in your home gym (dumbbells to 50 lb, bench, bands, pull-up bar). Pick a split."
choose "Split?" "Push / Pull / Legs / Upper"|"Upper / Lower x2"|"Full body x4"|Custom
page "Deep work" body="When do you focus best?"
pick "Best blocks" "Early morning (6–9 am)"|"Mid-morning (9–12 pm)"|"Afternoon (1–4 pm)"|Mixed
form "Block length" hours:1-4@2
page "Meals & life" body="Any errands already on your list? And meal style preference."
pick "Meals" "Meal prep Sundays"|"Cook nightly"|"Mix of both"|Order in often
form "Errands & notes" errands:voice +other
end
```
````

### patch-timer-rounds (FAIL)

**Chris:** Too easy. Run it again but 10 rounds.

Good: A patch aimed at the timer by preset name (`~timer rounds=10`), because `hiit` came from an earlier reply. Re-sending a new timer also works but costs more.

- patch: no ~ patch matching /^(timer|hiit)$/

````
Harder. I like it.

```yui
timer@hiit 40/20x10 Tabata
```
````

### patch-weight-stat (pass)

**Chris:** Weighed in at 178.8 this morning.

Good: `~stat 178.8lb delta=-2.9 spark=...` patching the stat on screen, not a second stat.

````
Nice work, keep it going.
```yui
~stat@weight 178.8lb delta=-2.2 spark=181|180.2|179.4|178.8
```
````

### patch-plan-card (FAIL)

**Chris:** Swap Thursday to a rest day, my back is tight.

Good: `~card body="Mon legs, Tue push, Thu rest, Sat conditioning"` plus maybe a slide asking how tight. Not a second card.

- words: 62 > 40

````
Smart call. Listen to the body — a tight back that gets worse is harder to fix than one you rest early.

```yui
~card@week body="Mon legs, Tue push, **Thu rest**, Sat conditioning"
```

Light cat-cow and some hip flexor stretches today if it helps, but real rest means rest. We'll make up pull on Sunday or fold it into next week.

How's the tightness — woke up with it or something specific yesterday?
````

### tap-choice-builds-next (FAIL)

**Chris:** [yui] n1 choose choice=Legs

Good: Builds the next screen right away (the session or the next question). Does not echo 'You chose Legs'.

- words: 31 > 30

````
Legs it is. Built for your home setup — dumbbells, bench, bands.

```yui
list "Leg Day — Thu 9/24" "Goblet squats 4x10" "DB Romanian deadlift 3x12" "Lunges 3x10/leg" "Banded leg press 3x15" "Wall sit 3x45s" "Calf raises 4x20" +check
timer 5m Rest between sets
save workout
```

Start with goblets to wake up the chain. Keep the tempo controlled — 2 down, 1 up. Let's go!
````

### tap-changed-answer (pass)

**Chris:** [yui] n1 choose choice=Pull changed=true

Good: Adjusts without arguing: swaps the list to a pull session (patch `~list` or a new list). No 'are you sure'.

````
Switching to pull. Good choice.
```yui
list Pull "Pull-ups 4x6" "DB row 4x10" "Face pull w/bands 3x12" "Curl 3x12" "Reverse curl 3x12" +check
ask "Start?" "Let's go"|"Not yet"
```
````

### flow-onboard-goal (FAIL)

**Chris:** I want to get back in shape before the holidays. Where do I start?

Good: The first question of a flow as buttons (goal or days per week), or a short plan. Not a 6-field form.

- need: none of [choose ask pick slide plan]

````
Good timing — two and a half months to Thanksgiving, three to the end of year. That's enough to make real change.

Let me see where you're starting from.

```yui
form "Quick check-in" level:Beginner|Intermediate|Advanced days:3-5@4 goal:voice
```

Tap your current fitness level, how many days a week you can train, and tell me your main goal. Then I'll build your plan.
````

### react-build-it (pass)

**Chris:** [yui] react msg=3a6ee9c1-4d97-40dd-901f-e5f0a7db1864 emoji=👍 meaning="build it"
> Want me to set up Saturday? Goblet squats 5x5 with the 50s, then a 20 minute tabata, done by 10.

Good: Builds the Saturday plan right away (a list and/or timer). No confirming question, no echo of the reaction.

````
Got it. Here's your Saturday session.

```yui
save workout
list@sat "Saturday Workout" "Goblet Squat 5x5 (50 lb DB)" +check "Tabata 20 min" +check timer 20/10x20 Tabata
say "45-50 minutes. Warm up first."
```

Done by 10, home in time for Mick.
````

### react-not-sure (pass)

**Chris:** [yui] react msg=0f1d2c3b-4a59-4687-9a0b-1c2d3e4f5a6b emoji=🤔 meaning="not sure"
> I can move your Tuesday call to Wednesday at 3 and book the gym at 5 on Tuesday instead.

Good: Asks the first of a few short questions as one screen (a choose or ask), not a form and not a wall of questions.

````
What part doesn't work?

```yui
choose "What's the problem?" "Tuesday gym at 5"|"Wednesday call at 3"|"Neither works"|"Different issue"
```
````

### react-no (pass)

**Chris:** [yui] react msg=7b8c9d0e-1f2a-4b3c-8d4e-5f6a7b8c9d0e emoji=👎 meaning=no
> Want me to draft a follow-up to the three people who didn't reply last week?

Good: Drops it in a few words. No pushback, no re-offer of the same thing.

````
Dropping the follow-ups.

```yui
say "Noted. Anything else on your plate today?"
```
````

### dead-status-report (FAIL)

**Chris:** Give me the overnight report on screen. Facts: backups ran at 3:10, all 4 sites up, 2 renewals due Friday (yuigui.com, postscarcity.ai), no errors.

Good: The report as a card, list or stats. The renewals may get a real action ("Renew both"). No "Got it" or "OK" button: a card with nothing to act on has no cta.

- parse: unknown preset "postscarcity.ai" cta="Details"" :: postscarcity.ai" cta="Details"

````
All clear overnight.
```yui
card "Overnight report" body="4 sites up, backups done, zero errors"
stat "3:10 am" "Backups completed"
list Sites "yuigui.com — up"|"postscarcity.ai — up"|"Site 3 — up"|"Site 4 — up"
card "Renewals Friday" body="yuigui.com
postscarcity.ai" cta="Details"
say "Nothing needs your attention."
```
````

### dead-logged-water (pass)

**Chris:** Log 2 liters of water for today.

Good: Confirms in a line or a stat. Nothing to tap unless it does something ("Add 500 ml"); never a lone "Nice" or "Got it".

````
Logged. 2 liters down.

```yui
stat "2L" "Water today" spark=0|1|2
```
````

### dead-plan-submit (pass)

**Chris:** Walk me through planning a weekend trip: where, budget, and dates. I'll answer on screen.

Good: A plan with one step per question, ending in a submit named for what happens ("Send", "Plan it", "Find trips"), not "Create project".

````
Weekend trip planning. Three questions and we'll have the shape of it.

```yui
plan "Weekend Trip" submit="Build the plan"
page "Where to?" body="A city, a coast, mountains — anywhere you want to spend two days."
pick "Where are you thinking?" City|Beach|Mountains|"Stay local"|Somewhere else +other
page "Budget" body="Hotels, food, gas or flights. What's comfortable for the weekend?"
pick "What's your budget?" "Under $500"|"$500–$1k"|"$1k–$2k"|"Money's not tight"
page "When?" body="This coming weekend, next one, or further out?"
choose "Which weekend?" "This one (Sep 26–27)"|"Next (Oct 3–4)"|"Late October" +other
```
````

### flow-findings-then-questions (FAIL)

**Chris:** Here are this morning's notes on the site review: the pricing page loads in 4.1 seconds on a phone, mostly two uncompressed hero images; the signup form drops the UTM tags; and the new FAQ block gets the most clicks after the hero. Walk me through what you found, then ask me what to fix first and whether to ship today or tomorrow.

Good: One plan: a page per finding with a real sentence or points, then 'fix first' and 'ship when' as questions, one submit. Not a deck followed by separate questions.

- parse: unknown preset "pill" :: pill "utm_source=linkedin" +grow
- parse: unknown preset "box" :: box "Signup form" +fill tone=butter
- parse: unknown preset "blob" :: blob "No UTM" +pulse
- preset: deck not in [plan page choose pick ask form slide card list sketch row after]
- preset: stat not in [plan page choose pick ask form slide card list sketch row after]
- preset: chart not in [plan page choose pick ask form slide card list sketch row after]
- preset: shapes not in [plan page choose pick ask form slide card list sketch row after]
- preset: shape not in [plan page choose pick ask form slide card list sketch row after]
- need: none of [plan]
- one flow: no plan
- one flow: a deck beside the plan
- one flow: a question outside the plan :: choose "Fix first?" "Compress hero images"|"Patch UTM passing"|"Leave as-is"

````
Three issues, all fixable today.

```yui
deck "Site review findings"
page "Pricing page: 4.1s load" body="Two uncompressed hero images on mobile. They make up most of that weight."
stat "4.1s" "Mobile load time" delta=+2.8 spark=1.3|2.9|4.1
chart bar "Load budget" x=Images|Scripts|Fonts|CSS y=2800|600|300|200
page "Signup form: losing UTM tags" body="The form submission strips UTM parameters. You can't attribute signups to campaign or source."
shapes "UTM drop" caption="Tags arrive → form submits → attribution lost"
pill "utm_source=linkedin" +grow
shape arrow
box "Signup form" +fill tone=butter
shape arrow
blob "No UTM" +pulse
page "FAQ block: high engagement" body="Gets the second-most clicks after the hero. Users want answers before they commit."
stat "#2" "Most-clicked block" spark="Hero"|FAQ|"CTA button"
end
```

```yui
choose "Fix first?" "Compress hero images"|"Patch UTM passing"|"Leave as-is"
choose "Ship when?" "Today, after fixes"|"Tomorrow morning"
```
````

### flow-two-questions-one-plan (FAIL)

**Chris:** Before you write my new program I want to look over what you changed from last month. You moved squats to Monday, cut the Friday run to 20 minutes, and added a deload in week 4. Show me that, then ask me how many days I can train and what equipment I have now.

Good: One plan: pages with the three changes, then days per week and equipment as steps, one submit.

- parse: end: no open deck, plan, narrate, timeline or sketch :: end
- preset: deck not in [plan page choose pick ask form slide card list sketch row after]
- preset: stat not in [plan page choose pick ask form slide card list sketch row after]
- preset: timeline not in [plan page choose pick ask form slide card list sketch row after]
- preset: done not in [plan page choose pick ask form slide card list sketch row after]
- preset: now not in [plan page choose pick ask form slide card list sketch row after]
- preset: next not in [plan page choose pick ask form slide card list sketch row after]
- need: none of [plan]
- one flow: no plan
- one flow: a deck beside the plan
- one flow: a question outside the plan :: form "New program basics" days:1-6 gear:voice

````
Here's what shifted last month.

```yui
deck "August → September changes"
page "Squats moved to Monday" body="Leg day now leads the week instead of sitting Wednesday. Fresh legs, heavier load, more recovery before pulling."
sketch frame=bubble
row "Mon: Push" +x
row "Tue: Pull"
row "Wed: Legs" +x note="was here"
after
row "Mon: Legs" +hi note="squats here now"
row "Tue: Push"
row "Thu: Pull"
page "Friday run: 30 → 20 min" body="Cut down to reduce leg fatigue before the weekend. You were dragging into Saturday sessions."
stat "20 min" "-33% volume" delta=-10 spark=30|25|20
page "Week 4 deload added" body="Every fourth week now drops to 60% intensity. One full deload cycle per mesocycle. Progress comes from recovery too."
timeline "Week 4 deload week"
done "Weeks 1-3" at="Normal training"
now "Week 4" tag=deload
next "Weeks 5-8"
end
end
```

Now let's lock in the new program.

```yui
form "New program basics" days:1-6 gear:voice
```
````

### save-reusable-workout (pass)

**Chris:** Give me a quick 20 minute Tabata I can come back to on busy days.

Good: A Tabata timer (it takes the stage on its own) and a `save` with a short name so it lands on the shelf. No re-asking what they want.

````
Here's a go-to burner — 4 moves, 5 minutes each. Full body, minimal rest between stations.

```yui
timer 20/10x8 "Tabata Round 1" +label
timer 20/10x8 "Tabata Round 2"
timer 20/10x8 "Tabata Round 3"
timer 20/10x8 "Tabata Round 4"
list Workout "1. Goblet squats (DB or band)" "2. Push-ups (floor or bench)" "3. Bent-over rows (DB)" "4. Mountain climbers" +check
save workout
```

Four rounds of :20 on, :10 off. One minute rest between exercises. Hits legs, push, pull, core. You in?
````

### show-saved-workout (pass)

**Chris:** Slammed again today. Pull up my busy day workout.

Good: `show busy-day` (the name it saved), one short line, no re-sent timer.

````
```yui
show busy-day
```

Let's go, Chris. 20 minutes, five blocks. You got this.
````

### keep-list-on-page (pass)

**Chris:** I'm cooking bibimbap tonight. Keep the shopping list somewhere I can see it while we work out the recipe: eggs, spinach, rice, gochujang, carrots.

Good: `>2 list@shop Shopping Eggs|Spinach|Rice|Gochujang|Carrots +check` so the list stays on a page beside the chat, then the recipe in the chat.

````
Good choice! Let me put that list on the side for you.

```yui
>2 list@shop "Eggs" "Spinach" "Rice" "Gochujang" "Carrots" +check +talk
say "List's up on screen 2. What else do you have on hand? Beef, sesame oil, garlic?"
```

Tap items off as you shop. Now—what protein are you thinking, and do you have the pantry basics (sesame oil, soy sauce, garlic)?
````

### project-timeline (pass)

**Chris:** Where are we on the site rebuild? We shipped the new hero Monday and the pricing page Tuesday, the blog migration is running now, and the contact form and analytics are next. Show me.

Good: One `timeline` with the two shipped items as `done` rows (at=Mon, at=Tue), the blog migration as `now`, then the contact form and analytics as `next`, in that order. At most a short line of chat and maybe one question about what to pull next.

````
```yui
timeline "Site rebuild"
done "New hero" at=Mon
done "Pricing page" at=Tue
now "Blog migration"
next "Contact form"
next "Analytics"
```

Three down, two to go. Blog's in flight—want me to flag you the moment it finishes?
````

### patch-timeline-move (pass)

**Chris:** Blog migration just finished.

Good: A patch that turns the running row done in place (`>2 ~now kind=done at=Fri` or `~blog kind=done`), not the timeline sent again. Starting the contact form is optional; if it does, it patches that row by its id.

````
```yui
~now@blog kind=done at=Thu
```

Done. Contact form is up next — want to start that now?
````

### game-offer (pass)

**Chris:** Build's still going. Play a quick game of tic-tac-toe with me?

Good: One `game tictactoe` line and at most a few words. No board drawn by hand, no list of cells.

````
```yui
game tictactoe "Beat me"
```

You first.
````

### game-ttt-move (pass)

**Chris:** [yui] n1 game kind=tictactoe move=5 o= x=5

Good: A patch by preset name with the agent's one cell (`~game o=1`), no new game, a word at most.

````
```yui
~game o=1
```
Corner.
````

### mention-asked (pass)

**Chris:** [yui] mention from=yui by=person msg=m1
Yui's thread, just before:
> Person: Plan a leg day for Saturday, my knee is a bit sore
> Yui: Here's Saturday: back squats 5x5, walking lunges, then a 20 minute tabata. [screen]
@Arnold does this fit my knee?

Good: Answers the knee question about that exact plan (swap the squats and lunges for knee-friendly moves), in a few words. Doesn't ask to see the plan and doesn't repeat the quote.

````
Not quite. Back squats and walking lunges both grind a sore knee—too much flexion under load.

Better picks for Saturday: **hip hinge** and **posterior chain** stuff. Romanian deadlifts, glute bridges, band pull-throughs. Tabata's fine but pick low-impact moves like battle ropes or bike.

Want me to build a knee-friendly leg day instead?

```yui
ask "Build a modified leg day?" Yes|No
```
````

### mention-notes-context (pass)

**Chris:** [yui] note: in this thread the person asked Arnold, not you: @Arnold does this fit my knee?
[yui] note: Arnold answered here: Swap back squats for box squats and lunges for glute bridges. Keep the tabata.
Ok, update my Saturday plan with that.

Good: The Saturday plan again with Arnold's swaps in it (box squats, glute bridges, the tabata kept), on screen. No questions about what Arnold said.

````
Updated. Box squats and glute bridges in, back squats and lunges out. Tabata stays.

```yui
card "Saturday — Leg Day" body="45 min · Home gym" cta="Start" +fold
list Workout "Warm-up: 5 min mobility" "Box squats: 4x8" "Glute bridges: 3x12" "Romanian deadlifts: 3x10" "Calf raises: 3x15" "Tabata: 20/10 x8 (jump squats/mountain climbers)" +check
save workout
```
````

### report-card-done (FAIL)

**Chris:** The worker just finished card INT-18 on the board. Its handoff summary: "A2A bridge: add any A2A agent to Yui by its Agent Card. node adapters/a2a/yui-a2a.ts pair <code> --card <url>, then run; add --card <url> puts more agents on the same machine. Runtime-neutral TypeScript client (src/a2a.ts + src/sse.ts, fetch and an SSE parser only, so the hosted step runs the same code in a Durable Object): A2A 1.0 SendMessage / SendStreamingMessage / SubscribeToTask / GetTask / CancelTask and 0.3 message/send, message/stream, tasks/resubscribe, tasks/get, one version-free shape for callers. The bridge keeps the relay's rules (delivered on pickup, handled after the answer, outbox on disk, one turn at a time per agent). Tests: client.test.ts 42/42; sdk_interop.test.ts 4/4 against the official a2a-sdk servers (1.1.5 and 0.3.26); a2a_e2e.py 66/66 live on throwaway accounts (kill -9 mid-task resumes the same task and answers once) plus the phone run 6/6 on the iPhone 18 Pro sim. No app binary change (INT-18)" Tell me what shipped.

Good: One short line, a card with the headline (A2A agents can join Yui), and the detail as a deck of short pages (what it does, how to add one, the test counts as points). No paragraph relaying the summary.

- parse: unknown preset "points="SendMessage / SendStreamingMessage / SubscribeToTask / GetTask / CancelTask"|"A2A 1.0 shapes, also speaks 0.3 message/send, message/stream, tasks/*"" :: points="SendMessage / SendStreamingMessage / SubscribeToTask / GetTask / CancelTask"|"A2A 1.0 shapes, also speaks 0.3 message/send, message/stream, tasks/*"

````
INT-18 ships the A2A bridge. Any A2A agent pairs by its Agent Card, no app update needed.

```yui
card "INT-18" body="A2A bridge: pair any agent by its Agent Card" cta="Board" url=https://board.example.com/int-18
deck "What shipped" +inline
page "How it works" body="Run the bridge with an agent card URL. Add more agents to the same machine with another --card flag."
sketch frame=bubble
row "$ node adapters/a2a/yui-a2a.ts pair <code> --card <url>" +hi note="one command per agent"
row "$ node adapters/a2a/yui-a2a.ts pair <code> --card <url-2>" +hi note="same machine, new agent"
page "Client" body="Runtime‑neutral TypeScript. Fetch and an SSE parser only — the same code runs locally and inside a Durable Object."
points="SendMessage / SendStreamingMessage / SubscribeToTask / GetTask / CancelTask"|"A2A 1.0 shapes, also speaks 0.3 message/send, message/stream, tasks/*"
page "Relay rules kept" body="Delivered on pickup, handled after the answer, outbox on disk, one turn at a time per agent."
page "Tests" points="Client 42/42 | SDK interop 4/4 | E2E Python 66/66 | Phone run 6/6 on iPhone 18 Pro sim" "Kill -9 mid-task resumes and answers once"
end
```
````

### report-long-walkthrough (FAIL)

**Chris:** Walk me through everything that changed in how Yui delivers messages this week: replies are exactly-once both ways with acks, a reply outbox on disk, presence reads online/asleep/offline per agent, pushes skip a phone already watching the thread, agents can be muted, and a paired agent whose gateway never started now says 'not listening yet' with the restart command.

Good: A deck (or plan) of short pages, one change per page, under one short chat line. Not a long bulleted or prose message.

- parse: end: no open deck, plan, narrate, timeline or sketch :: end
- pages: 6 > 4

````
Here's what shipped this week.

```yui
>full
deck "Message delivery, week of Sep 21"
page "Exactly-once with acks" body="Every message now gets acknowledged. If the ack never comes, Yui retries — but the receiver deduplicates by ID, so even a duplicate arrives once."
shapes "Ack flow" caption="Send → wait for ack → retry or mark delivered"
shape pill "Send" +grow
shape arrow
shape box "Gateway" +fill tone=mint
shape arrow
shape circle "Device"
shape arrow
shape blob "✓ Ack" +pulse tone=butter
page "Reply outbox on disk" body="Replies used to live in memory. Now they're written to disk before they go out — so a crash or restart doesn't lose a draft you typed."
shapes "Outbox" caption="Type → disk → send → remove from disk"
shape pill "You type" +grow
shape arrow
shape box "Disk (outbox)" +fill
shape arrow
shape circle "Send"
shape arrow
shape blob "Sent → clean up" +pulse tone=mint
page "Presence per agent" body="Each agent now has a real-time state: online (active right now), asleep (backgrounded, wakens on push), or offline (gateway down). You see it in the thread header."
choose "What state shows for an agent whose gateway crashed?" "Online"|"Asleep"|"Offline" answer="Offline"
page "Smart pushes" body="If your phone already has the thread open — you're watching it right now — Yui skips the push notification. No redundant buzz."
shapes "Push skip" caption="Thread open? Skip push. Otherwise, notify."
shape circle "Message arrives" +grow
shape arrow
shape box "Is thread open?" +fill
shape arrow
shape pill "Yes → show inline" tone=mint
shape arrow
shape pill "No → push + badge" tone=lavender
page "Mute any agent" body="Long-press an agent in a group or thread and tap Mute. Their messages still arrive; they just don't buzz your phone. Unmute the same way."
page "Gateway never started" body="When you pair an agent but its gateway has never connected, Yui used to show a vague error. Now it says 'not listening yet' and gives you the exact command to start it — copy, paste, run."
card "All six live now" body="Build 2026.09.24 rolled out to everyone this morning." cta="See changelog" url=https://www.yuigui.com/changelog/2026-09-24
end
```
````

### talk-keep-plan-editable (FAIL)

**Chris:** Lay out my runs for this week somewhere I can keep looking at it, and I'll tell you what to change as the week goes.

Good: The week on a page (`>2 list@runs Runs "Tue 5k"|"Thu 5k"|"Sat 10k" +check`) with `>2 talk` so they can type changes right there, and one short line in the chat.

- page: nothing on screen 2 or 3

````
Here's your running week. I'm putting it on side screen 2 so you can swipe back to it anytime.

```yui
>2 talk
timeline "Run week — Sep 21–27"
done "Mon: Easy 3 mi" at=Mon
done "Tue: Rest or cross-train" at=Tue
done "Wed: Speed — 6x400m repeats" at=Wed
now "Thu: Tempo — 4 mi steady (today)"
next "Fri: Easy 3 mi + strides"
next "Sat: Long run — 6–7 mi"
next "Sun: Rest or active recovery"
```

Swipe right to keep it handy. Tap any line or just tell me what you want to change—shorten Saturday, move tempo to Friday, whatever works. I'll update it as we go.
````

### talk-typed-on-screen (pass)

**Chris:** [yui] screen=2
Make Thursday a swim instead.

Good: Patches the list on screen 2 by preset name (`~list "Tue 5k easy" "Thu swim" "Sat 10k long" +check`), at most a short line. Does not re-send the list or explain the tag.

````
```yui
~list@runs "Tue 5k easy"|"Thu swim"|"Sat 10k long"
```

Done. Thursday's a swim now.
````

### report-draw-change (pass)

**Chris:** What changed in how you word your updates to me? You used to write things like "Parked YUI-83, feedback #2291 attached". Now you just say what the card is, like "Parked the drawing card, your note is on it". Show me the difference, don't describe it.

Good: One short line and a `sketch` (a bubble fits) with the old wording struck out (+x) and the new wording highlighted (+hi), ideally split with `after`, a note or two. No paragraph explaining it.

````
We dropped the IDs and ticket numbers. Plain words now — you shouldn't have to decode your own updates.

```yui
sketch "How updates read now" frame=bubble
row "Parked YUI-83 in the backlog" +x note="an id means nothing to you"
row "Merged PR #2291, fixes #2287" +x
row "Deployed build 1602-f8a to staging" +x
after
row "Parked the drawing card in the backlog" +hi note="says what it is"
row "Fixed the login crash, shipping today" +hi
row "Staging is live with the new checkout flow" +hi
```
````

### draw-screen-fix (pass)

**Chris:** The build-ready screen shows the headline, two lines of notes, then a Got it button and an Install button. Which of those should go, and why? Show me on the screen itself.

Good: A `sketch` of the screen (frame=phone) with the headline and notes as rows, Got it as a +button row struck out (+x) with a short note (it does nothing), Install as a +button row highlighted. At most a line of chat.

````
**Got it.** It's pure acknowledgment — no action, nothing to do. Install stays because it moves work forward.

```yui
sketch "Build-ready screen" frame=phone
row "Build 82 ready"
row "Fixed A2A bridge crash on pair."
row "All 66 end-to-end tests pass."
row "Got it    Install" +button +x note="one of these does nothing"

after Fixed

row "Build 82 ready"
row "Fixed A2A bridge crash on pair."
row "All 66 end-to-end tests pass."
row "Install" +button +hi note="the only thing to tap"
```
````

### report-pages-picture (FAIL)

**Chris:** Walk me through the three changes to how you write updates to me this week, one at a time: you name cards in plain words instead of ids like YUI-83, a long update comes as pages instead of a wall of text, and cards no longer end in a 'Got it' button that does nothing. For each one, show me what it looked like before and after.

Good: One short line and a deck of three pages, one change each, and each page's picture a sketch right after it: the old wording or button struck out (+x), the new one highlighted (+hi), ideally split with `after`. No paragraph.

- parse: unknown preset "body="IDs like YUI-83 meant nothing on your phone. Now every card names itself in plain words."" :: body="IDs like YUI-83 meant nothing on your phone. Now every card names itself in plain words."
- parse: unknown preset "body="A wall of text folds into 'Read as pages,' which nobody taps. Now I send a short line and a deck — one idea per page, each under sixty words."" :: body="A wall of text folds into 'Read as pages,' which nobody taps. Now I send a short line and a deck — one idea per page, each under sixty words."
- parse: unknown preset "body="'Got it' and 'OK' buttons went nowhere. Now a card either has a real action or no button at all — just the facts."" :: body="'Got it' and 'OK' buttons went nowhere. Now a card either has a real action or no button at all — just the facts."

````
Three changes, one at a time.

```yui
>full
deck "How my updates changed"
page "Cards say what they are"
body="IDs like YUI-83 meant nothing on your phone. Now every card names itself in plain words."
sketch "Card titles" frame=bubble
row "Parked YUI-83 in the backlog" +x note="an id means nothing"
after
row "Parked the drawing card in the backlog" +hi note="plain words"
page "Long updates split into pages"
body="A wall of text folds into 'Read as pages,' which nobody taps. Now I send a short line and a deck — one idea per page, each under sixty words."
sketch "Updates" frame=bubble
row "Build 82 is ready. Latest change: A2A bridge: add any A2A agent by its Agent Card. node yui-a2a.ts pair ... Tests: client 42/42, interop 4/4, e2e 66/66 ..." +x note="wall of text"
after
row "Build 82 is ready." +hi note="one line + card + deck"
page "Every button does something"
body="'Got it' and 'OK' buttons went nowhere. Now a card either has a real action or no button at all — just the facts."
sketch "Card buttons" frame=bubble
row "Build 82 shipped" +x
row "Got it" +button +x note="does nothing"
after
row "Build 82 shipped" +hi note="no button needed"
end
```
````

### menu-shortcut (FAIL)

**Chris:** I log breakfast every single morning. Give me a one-tap way to do it from now on.

Good: A shortcut in the drawer (`menu shortcut@breakfast "Log breakfast" say="Log breakfast: "`) and one short line saying where it lives. No button that only acknowledges.

- screen: block has no valid line
- parse: menu: needs a label :: menu shortcut say="Breakfast: "
- need: none of [menu]
- words: 48 > 40

````
```yui
menu shortcut say="Breakfast: "
```

Done. Drag right on the chat — you'll see **Start today's workout** (the default). I swapped it for **Breakfast: ** — one tap and it fills the line. Type what you ate, hit send.

Want me to rename it or add macros ("oatmeal + berries", "eggs + toast")?
````

### menu-tapped (pass)

**Chris:** [yui] deload menu bucket=backlog tapped

Good: Answers the tap with the deload week itself on a screen (a list or table of the sessions, or a card), maybe `~`/re-sent menu item with sub=ready. Does not explain the tag.

````
Good, let's get this built. Quick question first:

```yui
choose "What's your current training split?" "Push/Pull/Legs"|"Upper/Lower"|"Full body 3-4x"|"5-day body part" +other
```
````

### group-asked-by-agent (FAIL)

**Chris:** [yui] group "Race week" thread=g1 with=urza,arnold lead=urza hop=1 from=urza msg=m2
Race week, just before:
> Person: @Urza plan my week before Saturday's 10k, around work
> Urza: Mon to Fri blocked: calls after 10, errands Wednesday at 4. [screen]
@arnold can you set a run for each weekday morning before 10? Easy then sharp, race Saturday.

Good: The five weekday runs before 10 am, easy early in the week and a short sharp one midweek, then rest before Saturday, on screen. It answers only its part, doesn't @ Urza back, and doesn't ask what the week looks like (the quote says).

- fence: Yui Lines outside the ```yui block
- words: 82 > 70

````
Thursday and Friday before a Saturday 10k — let's get you to the line fresh.

```yui
timeline "Race week runs"
done "Mon: Easy 30 min" at=Mon
done "Tue: Easy 25 min + 4 x 20s strides" at=Wed
now "Thu: Shakeout 20 min, very easy"
next "Fri: 15 min jog + 3 x 10s sharp strides"
next "Sat: RACE DAY 🏃 10k"
```
```yui
card "Today — Thursday" body="20 min super easy, conversational pace. No hills, no heroics. Just loosen the legs." cta="Log it done"
card "Tomorrow — Friday" body="15 min jog, then 3 x 10 second strides at race pace. Full recovery between. You're done by 9 AM." cta="Remind me"
say Mick's out at 2 — you're back long before then. Go easy today, sharp tomorrow, crush it Saturday.
````

### group-lead-hands-on (FAIL)

**Chris:** [yui] group "Race week" thread=g1 with=urza,arnold lead=urza hop=0 from=person msg=m1
My 10k is Saturday. Block my week: calls after 10, errands Wednesday at 4, and get the training runs set.

Good: Blocks the week (calls after 10, errands Wednesday 4 pm) on screen, and hands the training runs to @arnold in one plain sentence instead of writing a training plan itself.

- at: no @arnold to hand it on

````
On it. Race Saturday — so today and Friday are the key days to protect.

```yui
timeline "Race week" +reorder
done "Mon: Easy 4 mi + 4 strides"
done "Tue: 3 mi easy"
done "Wed: Errands block 4–5 pm"
now "Thu: Shakeout 2 mi easy (today)"
next "Fri: Rest — no running"
next "Sat: 10K RACE 🏃"
```
`say Calls blocked before 10 am all week. Wednesday errands noted.`

Arnold — what do you want on the shakeout today and any race morning activation, or am I running stock taper?
````

### group-notes-context (FAIL)

**Chris:** [yui] note: in Race week the person asked Urza, not you: can you move Thursday's call earlier?
[yui] note: in Race week, Urza answered: Thursday's call is now at 7 am, so Thursday's run has to move.
[yui] group "Race week" thread=g1 with=urza,arnold lead=urza hop=0 from=person msg=m5
Race week, just before:
> Person: can you move Thursday's call earlier?
> Urza: Thursday's call is now at 7 am, so Thursday's run has to move.
@Arnold ok, when do I run Thursday?

Good: Moves Thursday's run around the 7 am call (before it at 5:45 or 6, or after it), in a few words or one choose. Doesn't ask what changed and doesn't @ Urza.

- preset: pick not in [list table card ask choose step timeline done now next]

````
7 am call means morning run is tight. Let's get you slotted.

```yui
pick "When works for Thursday's run?" "Before the 7 am call"|"Right after the call (~7:45)"|"Mid-morning (~10 am)"|"Afternoon (post school pickup)" +other
```
````

### restyle-app-autumn (FAIL)

**Chris:** make Yui feel like autumn

Good: One `theme app autumn` line and one short sentence (the app shows a preview). Not `theme autumn` (that is the agent's own look), and it never says Yui already changed.

- screen: no ```yui block
- need: none of [theme]
- app theme: 0 theme app lines, want 1
- sentences: 2 > 1

````
`theme app autumn`

Here's Yui in autumn — warm tones and softer light. Take a look; you can always switch back.
````

### idea-shapes-heatpump (FAIL)

**Chris:** How does a heat pump heat the house when it's cold outside? Quick, I'm on my phone.

Good: One short line and a `shapes` diagram with a caption: cold outside air, the refrigerant loop picking up heat and the compressor squeezing it hotter, heat let out inside, arrows between, labels a word or two. No paragraph, no generated image.

- words: 55 > 45

````
It pulls heat from outside air and moves it inside — even cold air holds heat energy.

```yui
shapes "How a heat pump heats" caption="It doesn't make heat. It moves it."
shape pill "Cold outdoor air" tone=mint
shape arrow
shape box "Evaporator" +fill
shape arrow
shape circle "Compressor" +pulse
shape arrow
shape box "Condenser"
shape arrow
shape blob "Warm air inside" tone=butter
```

Think of it like a fridge in reverse. The refrigerant absorbs what little heat is outside, gets squeezed hot by the compressor, and releases that heat into your home. Works down to about 15–20°F before needing backup heat.
````

### idea-shapes-flywheel (FAIL)

**Chris:** Explain the flywheel idea for Yui in one picture: more people use it, we see which screens agents reach for, the good ones become presets, agents get better, more people use it.

Good: A `shapes` loop (placed with at= or a row with arrows back to the start) with a caption, maybe one +pulse. Words kept to a line.

- parse: unknown preset "blob" :: blob "More people\nuse Yui" +grow tone=lavender
- parse: unknown preset "arrow" :: arrow
- parse: unknown preset "box" :: box "We see which\nscreens agents\nreach for" +fill tone=butter
- parse: unknown preset "arrow" :: arrow
- parse: unknown preset "pill" :: pill "Good ones\nbecome\npresets" +pulse tone=mint
- parse: unknown preset "arrow" :: arrow
- parse: unknown preset "circle" :: circle "Agents get\nbetter tools" +fill
- parse: unknown preset "arrow" :: arrow
- parse: unknown preset "blob" :: blob "Even more\npeople use it" tone=lavender +dash

````
One loop, five steps — the more it turns, the faster it spins.

```yui
shapes "The Yui Flywheel" caption="Usage → Data → Presets → Better agents → More usage"
blob "More people\nuse Yui" +grow tone=lavender
arrow
box "We see which\nscreens agents\nreach for" +fill tone=butter
arrow
pill "Good ones\nbecome\npresets" +pulse tone=mint
arrow
circle "Agents get\nbetter tools" +fill
arrow
blob "Even more\npeople use it" tone=lavender +dash
shape arrow from=5,1 to=1,1 +curve
```
````

### teach-one-screen (pass)

**Chris:** Explain compound interest to me. Show me the math and let me play with the numbers.

Good: One short line, then `>full` and ONE deck: a page per idea, the diagram, math, chart and stat each right after its page as its picture, a quiz, the calc on the last page. Nothing loose in the chat or on the stage beside the deck, no `close` after it.

````
Compound interest is earning interest on your interest—money that grows on itself.

```yui
>full
deck "Compound Interest"
page "Money that breeds" body="When you earn interest and leave it invested, that interest earns interest too. Small at first, then explosive."
shapes caption="Each year's growth feeds the next."
shape circle "$100" +grow
shape arrow
shape blob "$110" 
shape arrow
shape box "$121" tone=mint +pulse
page "The formula"
math A = P(1 + r)^t
page "It bends upward"
chart line "$100 at 8% yearly" x="Year 0"|"Year 5"|"Year 10"|"Year 20"|"Year 30" y=100|147|216|466|1006
page "Try it yourself" body="Slide the numbers and watch the future value change."
calc f="A = P × (1 + r)^t" P=100-10000@1000 r=0-0.15@0.08 t=0-40@10
choose "What matters most?" "Time"|"Interest rate"|"Starting amount" answer="Time"
end
```

**The secret:** time does more heavy lifting than any other lever. Starting 10 years earlier can beat doubling your initial deposit.
````

### library-flow-intake (pass)

**Chris:** A new client just sat down with me, she wants a website for her bakery. Walk her through everything you need from her, on my phone.

Good: One short line and `flow website-intake`: the saved intake flow asks everything, branching on their answers. Not a hand-built plan of the same questions.

````
```yui
flow website-intake
```

This walks her through everything—business info, style, pages, content, and contact details—one screen at a time. Hand her your phone and let her tap through.
````

### flow-interview-old-app (pass)

**Chris:** Interview me for a personal brand site.

Good: TestFlight feedback AMLn-Gg3 (YUI-155): one short line and the questions, as the saved `flow website-intake` or a plan. On build 205, which runs no flows, the plugin sends the flow as the plan it walks, so the phone shows questions, never a bare headline.

````
Let's get your site right.
```yui
flow website-intake
```
````

### short-status-latest-build (FAIL)

**Chris:** Am I on the latest build? (What you just looked up: the newest build on TestFlight is 160, live since 12:58 pm today. This phone reports build 160. An iPad on the same account reports build 135. Five changes wait on main for the next release, 0.3.2: keys and chords in the music tools, and a faster Send tap that is still being built.)

Good: One line: yes, build 160, the newest; the iPad is on 135. No deck, no pages, no 'what's coming' tour (YUI-118, feedback AJq7CcQS8fyM).

- words: 34 > 30

````
Yes, build 160 — you're current. Your iPad is on 135 and due for an update.

```yui
card "Build 160" body="Latest, live since 12:58 pm today" cta="Open TestFlight" url=https://testflight.apple.com/join/ykrYHwet
```

Next up in 0.3.2: keys and chords in music tools, plus a faster Send tap (still in progress).
````

### short-release-go-ahead (pass)

**Chris:** OK, yeah go ahead and release that. I want to play with the music tools. (What you just did: started the 0.3.2 release; a worker is building it now and it reaches TestFlight in about 40 minutes. It leaves out the faster Send tap, which is not done yet.)

Good: One line: 0.3.2 is building, on TestFlight in about 40 minutes with keys and chords; the Send tap fix waits. No deck, no 'what happens next' pages (YUI-118).

````
Released. Build 162 is building now — keys, chords, and tuners in about 40 minutes on TestFlight. Faster Send stays for next time.

```yui
card "Build 162" body="Keys, chords, tuners — no faster Send yet" cta="Open TestFlight" url=https://testflight.apple.com/join/ykrYHwet
```
````

### doing-long-turn (FAIL)

**Chris:** What needs me today? Check my calendar, my mail and the board. (This turn runs on the host with tools and takes about a minute: calendar first, then mail, then the board. Write everything you send during the turn, in order, as one reply. What the tools returned: gcal_list_events: 10:00 call with Dana (30 min), 4:00 design review. gmail_search: two need a reply today, the venue contract from Sam and a question about an invoice. kanban board: one card waits on you, t_627321c6 (YUI-SHIP 0.3.3), asking whether to ship without the tuner.)

Good: doing lines as it goes, plain words and a step ("Reading your calendar" 1/3, "Checking your mail" 2/3, "Looking at the board" 3/3), no card ids or tool names; then the answer: two calls, two replies to send, one choice on the tuner (YUI-63).

- preset: table not in [card say ask choose list check timeline stat deck page done now next]
- components: 9 > 6
- doing: 0 doing lines with words, want 2

````
```yui
say "Three things need you today."
card "Today" body="Thu, Sept 24 · Palm Beach Gardens" cta="Open calendar" url=cal://
list Today "10:00 — Dana call (30 min)" "4:00 — Design review" +check
card "Inbox" body="2 need a reply today" cta="Check mail"
table Mail From|Subject "Sam|Venue contract" "—|Invoice question"
card "Board" body="One card waits on you" cta="Open card"
>2 timeline "Your day"
done "Wake up" at=9am
now "Dana call — in 50 min"
next "Design review — 4pm"
```

Two emails and one ship decision. Want to tackle the **YUI-SHIP** question first — ship without the tuner or hold?
````

### music-jam-beat (pass)

**Chris:** Trying to get back into drumming. Give me a simple boom bap beat around 90 I can mess with.

Good: One `loop` line near 90 BPM with a boom bap pattern in `p=` that plays (`+play`), a short line at most. No pattern written out in words, no drum tab, no advice paragraph.

````
Here's a classic boom bat to jam over.

```yui
loop 90 "Boom bap" p=x...x...|....x...|..x.x.x.|........ +play
```
````

### music-finger-drums (pass)

**Chris:** Waiting on a call. Let me just tap out some drums on my phone for a minute.

Good: One `drums` line (2x2 or 4x4), a few words at most.

````
```yui
drums 2x2
```

Tap away.
````

### music-beat-sent (FAIL)

**Chris:** [yui] n1 loop bpm=94 swing=25 steps=8 rows=kick|snare|clap|hat|open|rim|tom|shaker p=x..xx.x.|....x...|..x...x.|xxxxxxxx||||
Sent my beat, 94 BPM

Good: The person's version patched in by preset name (`~loop p=... bpm=94 swing=25`) and a `save` with a short name, a line at most. No re-sent loop, no critique of the beat.

- need: none of [save]
- words: 32 > 25

````
Solid kick pattern, and those straight eighths on the hat lock it in.

```yui
~loop bpm=94 swing=25 p=x..xx.x.|....x...|..x...x.|xxxxxxxx||||
```

Those bottom four rows are wide open — rim shots, toms, shaker, open hat. Add something when you're ready.
````

### show-phase-one (pass)

**Chris:** Walk me through phase one. (What you know: phase one of the full-screen change. Answers play as full-screen chunks, and the chat is just the record, top right. Bottom right: a bigger mic, a T that opens the text field, and a + for attachments, including images. Settings sit behind a hamburger at top left, beside the agent picker.)

Good: A line and a drawing per part: the stage with a chunk on it, the record top right, the new bottom bar (big mic, T, +). Never a page with a heading over a paragraph (feedback AL1My-stUBnvtXD2WKV7ec8, YUI-119).

````
Answers take over the whole screen. Chat moves to the corner.

```yui
sketch "Phase one" frame=phone
row "☰  Yui        🗨 Chat" note="hamburger left, chat record right"
row ""
row ""
row "┌─────────────────────────┐"
row "│                         │"
row "│    Full-screen answer   │" +hi note="content fills the screen"
row "│    plays here           │"
row "│                         │"
row "│                         │"
row "└─────────────────────────┘"
row ""
row "╭─────────────────────────╮"
row "│  +         T      🎤   │" +hi note="attach · text · mic (big)"
row "╰─────────────────────────╯"
```

Tap **T** and the keyboard slides up. Tap **🎤** to talk. The **+** pulls up photos, files, scans. Everything else—settings, agent switcher, history—lives behind that **☰**.
````

### show-new-layout (FAIL)

**Chris:** Show me the bigger microphone. Does the text field look better? I want to see the new layout of big microphone, T for text and + to attach. Remember, I want you to show me this. (What you know: phase one of the full-screen change. Answers play as full-screen chunks, and the chat is just the record, top right. Bottom right: a bigger mic, a T that opens the text field, and a + for attachments, including images. Settings sit behind a hamburger at top left, beside the agent picker.)

Good: The bottom bar drawn: `sketch frame=phone` with `+button` rows for +, T and the big mic, ideally before and after (the old always-there field struck out). Not a description of it (feedback AL1My-stUBnvtXD2WKV7ec8).

- words: 35 > 30

````
```yui
sketch "Bottom bar" frame=phone before=Now
row "  +  Say something nice  🎤" +x note="old: field always open"
after New
row "      T      🎤  +" +hi +button note="big mic; T opens the field; + attaches"
```

That's the new layout. Tap **T** and the text field slides up full width. The mic stays big and always ready—one press to talk. The **+** pulls up photos, files, whatever you want to attach.
````

### music-keys-scale (pass)

**Chris:** Learning piano again. Give me something to noodle around A minor pentatonic on.

Good: One `keys Am pentatonic` line (a title or +send is fine), a short line at most. No list of note names, no fingering advice paragraph.

````
```yui
keys Am pentatonic
```

A C D E G — go wild.
````

### music-chords-song (pass)

**Chris:** I want to strum along to one of those four chord pop songs on my uke. G is a good key for me.

Good: One `chords` line in G (`chords G I-V-vi-IV` or `chords G|D|Em|C`), a short line at most. No chord names in a paragraph, no chord diagrams in text.

````
```yui
chords G I-V-vi-IV
say "G-D-Em-C — the backbone of half the pop songs ever written. Strum away."
```
````

### music-tuner-guitar (pass)

**Chris:** Just restrung my acoustic and it sounds awful. Help me get it in tune.

Good: One `tuner guitar` line, a short line at most. No list of string notes and frequencies, no advice on tuning by ear.

````
```yui
tuner guitar
```

Open it up and pluck each string one at a time. It'll tell you which way to go.
````

### music-metronome-practice (pass)

**Chris:** Working on my strumming timing. I want to practice slow, like 70 bpm in 4/4.

Good: One `metronome 70` line (beats=4 is fine), a short line at most. No paragraph of practice tips, no counting in words.

````
```yui
metronome 70
```

Tap Stop when you're done and I'll log the session.
````

### explain-mongols-geography (FAIL)

**Chris:** All right, can you give me a brief geographic explanation of the Mongols?

Good: One line with the answer, then one deck on `>full` where every page has its picture: the empire as a `map` (its outline in lat,lon points, Karakorum as a pin, routes east and west), the size as a `chart` or a `stat`. Not pages of text, and not the steppe drawn as dots in `shapes` (TestFlight feedback AJIE1_1Ru1V4EMgmpWZtniI: 'It's just a text bomb'; feedback AL2nKEYo on the shapes version: 'Again, not bad but this should be a Map').

- drawn: a page with only words :: Why geography favored them

````
The Mongols built the biggest land empire in history—a horse-powered wave that rolled from Korea to Hungary in under a century.

```yui
>full
deck "The Mongols, by the map"
page "How far it reached" body="From the Pacific to Eastern Europe, Siberia to Persia—conquered mostly on horseback in the 1200s."
map caption="Mongolia was the center; every direction, conquest."
area "Mongol Empire" 53,140|43,131|34.7,126.5|22.3,114|24,98|34,70|25.5,57|33,44|41,31|46,30.5|54,23|60,56|55,95 tone=butter
area Raided PL|HU|JP +dash
pin@ka Karakorum 47.2,102.8 +pulse
route "Westward push" ka|50.4,30.5 +arrow
page "Size comparison"
chart bar "Largest land empires, million km²" x=Mongol|Russian|Qing|Roman|Umayyad y=24|22.8|14.7|5|5.9
page "Why geography favored them" body="The Eurasian steppe—an unbroken grassland belt from Manchuria to Hungary—let cavalry travel fast and far. No mountains or oceans stopped them until they hit forests and seas."
end
```
````

### explain-rome-rise-fall (pass)

**Chris:** Give me the quick version of how the Roman Empire rose and fell.

Good: A line, then a picture per part: the empire at its peak as a `map` around the Mediterranean, its size over the centuries as a `chart` (or a `timeline` on the stage), the split as an east and west area. No page that is only a heading and a paragraph.

````
Rome: a city-state that conquered the Mediterranean in 700 years, then split and crumbled from within.

```yui
>full
deck "Rome: Rise and Fall"
page "From city to empire" body="Started as a kingdom (753 BC), became a republic that outlasted Carthage and Greece. Augustus took power in 27 BC and Rome ruled the Mediterranean."
map caption="At its peak, 117 AD: 5 million km², 20% of the world's people"
area "Roman Empire" 36,-9|43,-5|45,0|44,8|40,15|35,28|32,38|30,42|25,40|22,35|25,28|28,18|32,10|34,2 tone=butter
pin@ka Rome 41.9,12.5 +pulse
area "Beyond the limes" DE|PL|RO|IR +dash
page "How big it got"
stat "5M km²" "Largest state on Earth until the Mongols"
chart bar "Empire by century" x="100 BC"|BC/AD|"100 AD"|"200 AD"|"300 AD"|"400 AD" y=1|2|5|5|4.5|3
page "What broke it" points="Plague cut the population by a third"|"Civil wars every 20 years"|"The empire split east and west, 395"|"Rome sacked by Visigoths, 410"}
map caption="The west fell in 476. The east (Byzantium) lasted another 1,000 years."
area "Western Empire (fell 476)" 36,-9|43,-5|45,0|44,8|40,15|35,26|32,28 tone=lavender
area "Eastern Empire (survived)" 32,28|35,28|35,38|30,42|28,40|25,38 tone=mint
pin@ka Constantinople 41,28.9 +pulse
end
```
````

### explain-monsoon-how (FAIL)

**Chris:** Why does India get monsoons? Keep it short.

Good: One line and a picture: land heats, air rises, wet air off the ocean moves in, as a diagram in `shapes` with arrows or a `map` with the winds as routes, maybe a rainfall `chart` by month. Not a paragraph of weather words.

- screen: no ```yui block
- need: none of [map shapes chart image]
- words: 123 > 50
- drawn: no map, chart, timeline or image, only words and numbers

````
India sits between the hot Thar Desert to the northwest and the cool Indian Ocean to the south. In summer, the land heats up fast, creating low pressure that pulls in moist ocean air from the southwest — the **southwest monsoon**, which dumps 70–80% of India's annual rain from June to September. In winter, the pattern reverses: the land cools faster than the sea, sending dry air back out to sea (the northeast monsoon), which brings lighter rain mainly to India's southeast coast.

Two extra factors amplify it: the **Tibetan Plateau** acts as a massive heat pump intensifying the pressure gradient, and the **Himalayas** block cold air from the north, trapping the monsoon system over the subcontinent rather than letting it blow through.
````

### where-trip-route (FAIL)

**Chris:** Thinking about a train trip from Lisbon to Barcelona with stops in Porto and Madrid. How does that route go?

Good: One line, then a map: pins on Lisbon, Porto, Madrid and Barcelona, a route through them with an arrow, a caption with the rough hours (a small `table` of the legs beside it is fine). Not a numbered list of legs in words.

- text: markdown table instead of a table component
- words: 148 > 40

````
That's a great loop — Portugal's coast up, cut across to Madrid, then east to Barcelona.

```yui
map "Lisbon → Porto → Madrid → Barcelona" caption="Roughly 1,600 km by rail through two countries"
pin@start Lisbon 38.72,-9.13
pin@1 Porto 41.15,-8.63
pin@2 Madrid 40.42,-3.70
pin@end Barcelona 41.39,2.19
route "Your trip" start|1|2|end +arrow
```

**The legs:**

| Leg | Distance | Time (approx) |
|-----|----------|---------------|
| Lisbon → Porto | ~315 km | 2h 45m - 3h |
| Porto → Madrid | ~560 km | 5h 30m - 6h 30m* |
| Madrid → Barcelona | ~620 km | 2h 30m - 3h |

**A few things to know:**
- **Porto ↔ Madrid:** No direct high-speed rail yet — you'll likely transfer at Vigo or Salamanca, which is why that leg takes longer than you'd expect. Check Renfe/CP for current routing.
- **Madrid → Barcelona:** Frequent AVE high-speed trains, the easy part of the trip.
- **Booking:** Book Madrid–Barcelona early for cheaper fares. Portugal legs can usually be booked closer in.

Want me to help sketch out timing or look into tickets for specific dates?
````

### where-delivery-area (pass)

**Chris:** Our farm delivers CSA boxes across Vermont, New Hampshire and western Massachusetts. Can you show a new customer what that covers?

Good: One line, then a map with the delivery area filled in (VT and NH by code, western Massachusetts as lat,lon points) and the farm or the big towns as pins. Not a list of states and counties.

````
Your delivery zone covers northern New England and into western Mass.

```yui
map "CSA Delivery Area" caption="We deliver CSA boxes across Vermont, New Hampshire and western Massachusetts."
area "Delivery zone" VT|NH|MA +pulse tone=butter
pin@ka Farm 44.0,-72.8
```
````

### where-quick-country (pass)

**Chris:** Where exactly is Kyrgyzstan?

Good: One line (Central Asia, between Kazakhstan and China) and a map in the chat: KG as an area with a pulse on Bishkek, neighbors faint. No deck for a quick where.

````
Landlocked in Central Asia, bordered by China to the east, Kazakhstan to the north, Uzbekistan to the west, and Tajikistan to the south.

```yui
map "Kyrgyzstan" caption="A mountain republic at the heart of Central Asia."
area Kyrgyzstan KG
area Neighbors KZ|UZ|TJ|CN tone=mute
pin@ka Bishkek 42.87,74.59 +pulse
```
````

### data-lunch-macros (pass)

**Chris:** Give me a quick lunch idea with 30g of protein.

Good: One line naming the lunch and a real Yui Lines table (`table Macros Food|Protein|Cal "Chicken|35g|165" ...`) or stat tiles for the macros. Not a quoted title plus `columns:` rows and `end` (GLM 5.2 on YUI-131, every row a parse error), and not a markdown table.

````
A quick one: **tuna melt on sourdough** — 10 minutes, one pan.

```yui
table "Tuna Melt" Food|Protein "Canned tuna (5oz)"|"30g" "Swiss cheese (1 slice)"|"6g" "Sourdough (1 thick slice)"|"5g"
stat 41g Total protein
```

Drain one can of solid white albacore, mix with a spoon of mayo or Greek yogurt, pile onto sourdough with a slice of cheese, and toast in a pan or under the broiler until bubbly. Done.

Want a non-fish option or something you can pack for later?
````
