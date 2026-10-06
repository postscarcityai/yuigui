# Channel eval: motion1e-new-r3

Guide v49+b5a477c0 (6155 words), model claude-opus-5-5, 2026-10-06T05:05.

**112/135 passed (83%).**

| category | passed |
|---|---|
| workout | 4/5 |
| check-in | 2/2 |
| photo | 2/2 |
| today | 1/1 |
| scheduling | 2/2 |
| decision | 2/2 |
| list | 1/3 |
| data | 1/2 |
| flow | 8/14 |
| teach | 2/2 |
| look | 2/2 |
| no-screen | 4/4 |
| secret | 2/3 |
| trap | 1/2 |
| patch | 4/5 |
| tap | 1/2 |
| reaction | 1/3 |
| dead-button | 3/3 |
| saved | 2/2 |
| mention | 1/2 |
| report | 5/5 |
| group | 2/3 |
| idea | 2/2 |
| library | 1/1 |
| short | 1/2 |
| doing | 1/1 |
| music | 7/7 |
| show | 14/15 |
| explain | 3/3 |
| where | 3/3 |
| items | 1/1 |
| ui | 1/1 |
| timeline | 1/1 |
| facts | 2/2 |
| tiles | 3/3 |
| context | 3/3 |
| one-line | 5/6 |
| draw | 4/4 |
| table | 1/1 |
| motion | 6/8 |

| case | result | why |
|---|---|---|
| workout-leg-day | pass |  |
| workout-start-runner | pass |  |
| workout-tabata | pass |  |
| workout-plank | pass |  |
| workout-gear-question | FAIL | preset: plan not in [pick choose ask camera list card slide form] |
| checkin-morning | pass |  |
| checkin-evening-voice | pass |  |
| meal-photo | pass |  |
| meal-log-no-photo | pass |  |
| today-plan | pass |  |
| schedule-call | pass |  |
| schedule-booking-confirmed | pass |  |
| decision-dinner | pass |  |
| decision-three-options | pass |  |
| list-groceries | FAIL | preset: choose not in [list card ask table] |
| list-packing | FAIL | preset: choose not in [list card say] |
| data-weight-trend | FAIL | preset: sketch not in [chart stat card say]; preset: row not in [chart stat card say] |
| focus-second-screen | pass |  |
| teach-compound-interest | pass |  |
| theme-autumn | pass |  |
| plain-fact | pass |  |
| plain-thanks | pass |  |
| plain-explain | pass |  |
| plain-math | pass |  |
| secret-login | pass |  |
| secret-bank | FAIL | preset: sketch not in [ask choose card list pick form]; preset: row not in [ask choose card list pick form] |
| secret-api-key | pass |  |
| no-html-pricing | pass |  |
| too-much-week | FAIL | preset: sketch not in [list card table choose ask pick plan slide form deck page save]; preset: row not in [list card table choose ask pick plan slide form deck page save] |
| patch-timer-rounds | FAIL | patch: no ~ patch matching /^(timer\|hiit)$/ |
| patch-weight-stat | pass |  |
| patch-plan-card | pass |  |
| tap-choice-builds-next | FAIL | preset: plan not in [list card timer ask choose pick slide table query put]; preset: page not in [list card timer ask choose pick slide table query put] |
| tap-changed-answer | pass |  |
| flow-onboard-goal | FAIL | preset: flow not in [choose ask pick slide plan form card mic page]; need: none of [choose ask pick slide plan] |
| react-build-it | pass |  |
| react-not-sure | FAIL | preset: plan not in [choose ask pick say slide] |
| react-no | FAIL | preset: sketch not in [say ask choose]; preset: row not in [say ask choose] |
| dead-status-report | pass |  |
| dead-logged-water | pass |  |
| dead-plan-submit | pass |  |
| flow-findings-then-questions | pass |  |
| flow-two-questions-one-plan | pass |  |
| save-reusable-workout | pass |  |
| show-saved-workout | pass |  |
| keep-list-on-page | pass |  |
| project-timeline | pass |  |
| patch-timeline-move | pass |  |
| game-offer | pass |  |
| game-ttt-move | pass |  |
| mention-asked | pass |  |
| mention-notes-context | FAIL | preset: choose not in [list card timer ask plan table sketch row after] |
| report-card-done | pass |  |
| report-long-walkthrough | pass |  |
| talk-keep-plan-editable | pass |  |
| talk-typed-on-screen | pass |  |
| report-draw-change | pass |  |
| draw-screen-fix | pass |  |
| report-pages-picture | pass |  |
| menu-shortcut | FAIL | no reply: exit null:  |
| menu-tapped | FAIL | preset: sketch not in [list table card deck page plan timeline done now next step choose ask pick stat say]; preset: row not in [list table card deck page plan timeline done now next step choose ask pick stat say] |
| group-asked-by-agent | pass |  |
| group-lead-hands-on | FAIL | preset: sketch not in [list table card plan timeline ask choose step done now next]; preset: row not in [list table card plan timeline ask choose step done now next] |
| group-notes-context | pass |  |
| restyle-app-autumn | pass |  |
| idea-shapes-heatpump | pass |  |
| idea-shapes-flywheel | pass |  |
| teach-one-screen | pass |  |
| library-flow-intake | pass |  |
| flow-interview-old-app | FAIL | app build: the yui plugin did not run (/private/tmp/yui/hermes-plugin/yui): spawnSync python3 ENOENT; tap: nothing to tap on build 205 |
| short-status-latest-build | pass |  |
| short-release-go-ahead | FAIL | preset: shapes not in [card say ask choose stat list sketch row after timeline now next done]; preset: shape not in [card say ask choose stat list sketch row after timeline now next done] |
| doing-long-turn | pass |  |
| music-jam-beat | pass |  |
| music-finger-drums | pass |  |
| music-beat-sent | pass |  |
| show-phase-one | pass |  |
| show-new-layout | FAIL | preset: mock not in [say card deck plan page sketch row after shapes shape image end choose ask pick]; preset: part not in [say card deck plan page sketch row after shapes shape image end choose ask pick] |
| music-keys-scale | pass |  |
| music-chords-song | pass |  |
| music-tuner-guitar | pass |  |
| music-metronome-practice | pass |  |
| explain-mongols-geography | pass |  |
| explain-rome-rise-fall | pass |  |
| explain-monsoon-how | pass |  |
| where-trip-route | pass |  |
| where-delivery-area | pass |  |
| where-quick-country | pass |  |
| data-lunch-macros | pass |  |
| list-no-escaped-breaks | pass |  |
| items-board-cards-drawn | pass |  |
| ui-zip-in-context | pass |  |
| when-two-days-timeline | pass |  |
| facts-stacked-list | pass |  |
| fact-one-sentence | pass |  |
| last-page-next-step | FAIL | need: none of [deck plan]; last page: ends in sketch, not something to tap |
| last-page-walkthrough | FAIL | need: none of [deck plan]; last page: ends in sketch, not something to tap |
| tiles-board-status | pass |  |
| outcome-invite-declined | pass |  |
| outcome-worker-running | pass |  |
| context-sample-not-ask | pass |  |
| context-about-this | pass |  |
| context-old-ask-when | pass |  |
| showhere-before-after | pass |  |
| showhere-progress-page | pass |  |
| showhere-after-linkout | pass |  |
| showhere-demo | pass |  |
| showlink-waiting-shots | pass |  |
| showlink-only-url | pass |  |
| showlink-build-changes | pass |  |
| showlink-demo-page | pass |  |
| showlean-waiting | pass |  |
| showlean-new-hero | pass |  |
| showpick-four-looks | pass |  |
| showpick-two-looks | pass |  |
| showpick-only-url | pass |  |
| vis-status-board | pass |  |
| vis-what-did-you-fix | pass |  |
| vis-you-misread-me | pass |  |
| vis-put-a-card-in | FAIL | one line: no drawing (sketch, shapes, diagram, mock, timeline, map, chart or stat) carries the answer |
| vis-no-filler-briefing | pass |  |
| vis-three-ideas-one-page | pass |  |
| draw-how-flow | pass |  |
| draw-how-sequence | pass |  |
| draw-show-screen | pass |  |
| draw-what-checkout-looks | pass |  |
| table-coach-asked-twice | pass |  |
| motion-concept | pass |  |
| motion-work-change | pass |  |
| motion-how-connect | FAIL | preset: diagram not in [motion say choose ask card stat sketch row after timeline done now next shapes shape chart end pick]; need: none of [motion] |
| motion-bug-fix | pass |  |
| motion-plain-fact | pass |  |
| motion-status-line | pass |  |
| motion-with-quiz | pass |  |
| motion-old-phone | FAIL | app build: the yui plugin did not run (/private/tmp/yui/hermes-plugin/yui): spawnSync python3 ENOENT; need: none of [sketch say card stat timeline shapes] |

## Transcripts

### workout-leg-day (pass)

**Chris:** Leg day. I have 40 minutes, home gym.

Good: A short line, then the session to do: the runner `plan` (a page, then per move a sets pick with its reps and weight slides), or a checklist or card with a way to start. No interrogation: he already said time and gear.

````
40 min legs: squat, hinge, single-leg, glutes. Dumbbells and bench.
```yui
plan "Leg day, 40 min" submit="Log session"
page "Warm up, then go" points="Warm-up: 3 min bodyweight squats, lunges"|"Rest: ~90s between sets"|"Weight: leave 2 reps in the tank"
pick@e1-sets "Goblet squat: sets done" "Set 1"|"Set 2"|"Set 3"|"Set 4"|Skip title="Goblet squat" work=45
slide@e1-reps "Goblet squat: reps per set" 1-30 value=10
slide@e1-lb "Goblet squat: weight in lb" 0-50 value=45 step=5 unit=lb
pick@e2-sets "DB Romanian deadlift: sets done" "Set 1"|"Set 2"|"Set 3"|Skip title="DB Romanian deadlift" work=45
slide@e2-reps "DB Romanian deadlift: reps per set" 1-30 value=10
slide@e2-lb "DB Romanian deadlift: weight per hand in lb" 0-50 value=40 step=5 unit=lb
pick@e3-sets "Bulgarian split squat: sets done" "Set 1"|"Set 2"|"Set 3"|Skip title="Bulgarian split squat" work=60
slide@e3-reps "Bulgarian split squat: reps per leg" 1-20 value=8
slide@e3-lb "Bulgarian split squat: weight per hand in lb" 0-50 value=25 step=5 unit=lb
pick@e4-sets "DB hip thrust: sets done" "Set 1"|"Set 2"|"Set 3"|Skip title="DB hip thrust" work=45
slide@e4-reps "DB hip thrust: reps per set" 1-30 value=12
slide@e4-lb "DB hip thrust: weight in lb" 0-50 value=50 step=5 unit=lb
choose@feel "Legs: how'd that feel?" Easy|"Just right"|Brutal
end
save workout
```
````

### workout-start-runner (pass)

**Chris:** Start my workout.

Good: One line, then the runner plan: a page with the rest, per move a `pick@eN-sets` of Set 1..N and Skip with title= and work=, its reps (or secs) and weight slides, `choose@feel` last. Not the moves as a list, not a deck, not questions about sets.

````
Full body A. Go.
```yui
plan "Full body A" submit="Log workout"
page "Rest" body="Rest about 90 seconds between sets. Brace before every rep, control the way down."
pick@e1-sets "Goblet squat: sets done" "Set 1"|"Set 2"|"Set 3"|Skip title="Goblet squat" work=40
slide@e1-reps "Goblet squat: reps per set" 1-30 value=10
slide@e1-lb "Goblet squat: weight in lb" 0-50 value=20 step=5 unit=lb
pick@e2-sets "Push-up: sets done" "Set 1"|"Set 2"|"Set 3"|Skip title="Push-up" work=30
slide@e2-reps "Push-up: reps per set" 1-30 value=8
pick@e3-sets "Dumbbell row: sets done" "Set 1"|"Set 2"|"Set 3"|Skip title="Dumbbell row" work=40
slide@e3-reps "Dumbbell row: reps per set" 1-30 value=10
slide@e3-lb "Dumbbell row: weight in lb" 0-50 value=20 step=5 unit=lb
pick@e4-sets "Plank: sets done" "Set 1"|"Set 2"|"Set 3"|Skip title="Plank" work=30
slide@e4-secs "Plank: seconds per hold" 10-120 value=30 step=5 unit=s
choose@feel "How did it feel?" Easy|"Just right"|Hard|Wrecked
end
save workout
```
````

### workout-tabata (pass)

**Chris:** Give me a 10 minute tabata finisher, I'm ready now.

Good: A timer with work/rest x rounds (it goes full screen by itself) and maybe the move list. No questions first.

````
20s work, 10s rest, 20 rounds: rotate these four, five times through.
```yui
list Finisher "1. DB thrusters, 20s" "2. Burpees, 20s" "3. DB swings, 20s" "4. Mountain climbers, 20s"
timer 20/10x20 "Tabata finisher"
save finisher
```
````

### workout-plank (pass)

**Chris:** plank hold, 2 min

Good: One timer line. Almost no chat text.

````
Two minutes. Elbows under shoulders, squeeze glutes, breathe.
```yui
timer 2m Plank
```
````

### workout-gear-question (FAIL)

**Chris:** I want to train today but I'm at my mom's place, not sure what she has.

Good: Offer the likely gear as a pick with +other, or a camera to snap what is there. One question, not a form.

- preset: plan not in [pick choose ask camera list card slide form]

````
Bodyweight works anywhere; take a quick look around and tell me what's there.
```yui
plan "Mom's place" submit="Build my session"
pick "What's around?" "Nothing, bodyweight"|"Sturdy chair"|Stairs|"Light dumbbells"|Bands|"Yard space" +other
choose "How long do you have?" "20 min"|"30 min"|"45 min" +other
end
```
````

### checkin-morning (pass)

**Chris:** morning check-in

Good: Sleep, soreness and energy as sliders or a short form (quoted title), or a plan that walks them one at a time, or the saved `flow workout-checkin` (it asks the same). Not a wall of questions in text.

````
Morning, Chris. Four quick taps and I'll build today's session around Mick's 2 pm pickup.
```yui
plan "Morning check-in" submit="Build my day"
slide@sleep "Sleep last night" 1-10 Rough|Great
slide@energy "Energy right now" 1-5 Flat|Fired up
pick@sore "Anything sore?" Legs|Back|Shoulders|Chest|Arms|"All good" +other
choose@time "Training window before 2 pm?" "20 min"|"40 min"|"60 min"|"Rest day"
end
```
````

### checkin-evening-voice (pass)

**Chris:** I want to do an end of day brain dump but I'm too tired to type.

Good: A mic, maybe with +auto. One short line.

````
Talk it out. I'll sort it into tasks, calendar and notes.
```yui
mic "End of day brain dump" +auto
```
````

### meal-photo (pass)

**Chris:** [photo attached. Image description: a plate with grilled chicken breast, a cup of white rice, steamed broccoli, and a drizzle of olive oil] lunch

Good: Estimate the macros briefly and offer to log it (ask) or show them as stats. Does not ask for another photo.

````
Solid lunch: about 635 cal, 55 g protein.
```yui
stat 635 "Calories, estimated"
chart donut "Macros, g" x=Protein|Carbs|Fat y=55|51|20
list Plate "Chicken breast, ~6 oz: 280 cal, 52 g protein" "White rice, 1 cup: 205 cal, 45 g carbs" "Broccoli, 1 cup: 30 cal" "Olive oil, ~1 tbsp: 120 cal, 14 g fat"
choose "Chicken portion?" "4 oz"|"6 oz"|"8 oz" +other
```
````

### meal-log-no-photo (pass)

**Chris:** Can you log my lunch? I'm about to eat.

Good: A camera to snap the plate (the cheapest way to log), maybe a mic as an alternative.

````
Snap it before the first bite.
```yui
camera "Snap your lunch"
mic "Or just tell me what's on the plate"
```
````

### today-plan (pass)

**Chris:** What should I do today?

Good: Without calendar access it proposes a shape for the day or asks one thing (energy, top priority) as buttons. Remembers Mick at 2 pm. Not a text essay.

````
Calendar's not loaded yet; here's a skeleton built around Mick's 2 pm pickup.
```yui
timeline "Today: draft"
done "Gym: 40 min, dumbbells + pull-ups" at="9:30"
now "Deep work: one big thing" at="10:15"
next "Lunch + email sweep" at="12:30"
next "Mick pickup" at="2:00"
next "Errands / home" at="3:00"
choose "Today's one big thing?" "Work project"|"Inbox zero"|"Home stuff"|"Pull my calendar" +other
```
````

### schedule-call (pass)

**Chris:** Set up a call with Matt next week, 30 minutes.

Good: Offer a few slots as buttons (avoiding 1:30 and 2 pm) with +other. One question.

````
Next week, 30 minutes with Matt. Mornings or early afternoon, clear of Mick's 2 pm pickup.
```yui
plan "Call with Matt" submit="Find slots"
pick "Which days work?" Mon|Tue|Wed|Thu|Fri|Any
choose "Time of day?" "Morning"|"Late morning"|"Before 1:30"|"After 3"
choose "How?" Zoom|"Google Meet"|Phone +other
choose "Which Matt?" "Usual Matt"|"Someone new" +other
end
```
````

### schedule-booking-confirmed (pass)

**Chris:** [yui] note: the barber's booking page confirmed 11:30 am Saturday.

Good: Confirms in one line and freezes the choice with `~choose +lock` (by preset name, since the id came from an earlier reply). Does not re-send the slots.

````
Haircut booked: Saturday, 11:30 am.
```yui
~choose +lock
card "Haircut" body="Saturday, 11:30 am"
```
````

### decision-dinner (pass)

**Chris:** Sushi or tacos tonight? I can't decide.

Good: Either just pick one with a reason, or two big buttons. Short.

````
Tacos: easier with Mick, and good for a weeknight. Want me to set it up?
```yui
choose "Tacos tonight: how?" "Order in"|"Cook at home"|"Go out"|"Sushi after all"
```
````

### decision-three-options (pass)

**Chris:** Help me pick which to do first this afternoon: invoice Heathos, reply to Paul about Plannix, or fix the Yui site footer.

Good: A recommendation plus the three as buttons (or an ordered list with +check). No essay.

````
Invoice Heathos first: quick, and it gets money moving. Paul next, footer last.
```yui
sketch "This afternoon" frame=window
row "1. Invoice Heathos: 15 min" +hi note="cash, unblocks"
row "2. Reply Paul: 20 min" note="someone waiting"
row "3. Yui footer: open-ended" note="nobody blocked"
row "Mick pickup: 2 pm" note="hard stop"
choose "Start with?" "Invoice Heathos"|"Paul's waiting longer"|"Footer is urgent" +other
```
````

### list-groceries (FAIL)

**Chris:** Make me a grocery list for high protein meals this week.

Good: A list with +check, a title, and items that fit on a phone.

- preset: choose not in [list card ask table]

````
Week of high-protein meals, about 180 g a day, sized for you and Mick.
```yui
list Protein "Chicken thighs 4 lb" "Lean ground beef 2 lb" "Salmon fillets 1.5 lb" "Eggs 3 dozen" "Greek yogurt 2 tubs" "Cottage cheese 2 tubs" "Deli turkey 1 lb" "Whey protein" +check
list Produce "Spinach 2 bags" "Broccoli 3 heads" "Bell peppers 6" "Sweet potatoes 5" "Bananas 2 bunches" "Berries 3 pints" "Avocados 4" +check
list Pantry "Rice 2 lb" "Oats" "Black beans 4 cans" "Tuna 6 cans" "Whole wheat wraps" "Peanut butter" "Shredded cheese" +check
save groceries
choose "Meals for this list?" "Plan the week"|"Kid-friendly swaps"|"Just the list" +other
```
````

### list-packing (FAIL)

**Chris:** Mick has a field trip tomorrow to the science museum. Packing list?

Good: A checklist. One line of text.

- preset: choose not in [list card say]

````
Science museum list for Mick; check off as you pack tonight.
```yui
list "Mick's field trip" "Signed permission slip" "Bag lunch, disposable, name on it" "Water bottle" "Small snack" "Comfy sneakers" "Light hoodie: museums run cold" "School or trip shirt, if required" "Small backpack, labeled" "Sunscreen for the bus and outdoor exhibits" "Leave at home: toys, electronics, cash" +check
choose "Anything else?" "Remind me tonight"|"Check trip email"|"Done" +other
```
````

### data-weight-trend (FAIL)

**Chris:** How's my weight trending? Last 7 days: 181, 180.6, 180.2, 179.9, 180.1, 179.4, 178.9

Good: A stat with a delta and a spark, or a line chart. One line of read-out, not a table in text.

- preset: sketch not in [chart stat card say]
- preset: row not in [chart stat card say]

````
Trending down: 2.1 lb in 7 days, about 2 lb a week. Steady loss, one small blip.

```yui
stat 178.9lb Weight delta=-2.1 spark=181|180.6|180.2|179.9|180.1|179.4|178.9
chart line "Last 7 days, lb" x=D1|D2|D3|D4|D5|D6|D7 y=181|180.6|180.2|179.9|180.1|179.4|178.9
sketch "Read" frame=bubble
row "Pace: ~2 lb/week" +hi note="upper end of ideal"
row "Day 5 bump: water" note="noise, ignore"
row "Hold course" note="no changes"
```
````

### focus-second-screen (pass)

**Chris:** Start a 25 minute focus timer, and while it runs let's talk through the Plannix launch checklist.

Good: `>2 timer 25m Focus` (second screen) or a timer, plus the start of the checklist.

````
Focus timer running on screen 2. Where's the checklist?

```yui
>2 timer 25m Focus
choose "Plannix launch checklist: start from?" "I'll paste it"|"Pull from my docs"|"Build one fresh" +other
```
````

### teach-compound-interest (pass)

**Chris:** Explain compound interest to Mick, he's 9. Make it something he can play with.

Good: Something interactive: a calc with sliders, or a short deck with a quiz question.

````
Mick's version: money that makes baby money, and the babies make money too.
```yui
>full
deck "Money that grows on itself"
page "Your money has babies" body="Put $100 in the bank. Each year the bank adds 10% for letting them keep it. That's $10 the first year."
shapes caption="$100 earns $10. Now you have $110."
shape circle $100 +grow
shape arrow
shape blob $110 +pulse tone=mint
page "The babies have babies" body="Year two, the bank pays 10% on all $110, not just the first $100. Your $10 earns money too."
shapes caption="Every year the pile is bigger, so it grows by more."
shape circle $100
shape arrow
shape blob $110 tone=mint
shape arrow
shape blob $121 +pulse tone=butter
choose "After year 2, how much do you have?" "$120"|"$121" answer="$121"
page "Wait long enough and it zooms" body="Same $100, same 10%. It starts slow, then shoots up."
chart line "$100 at 10% a year" x=Start|5yrs|10yrs|15yrs|20yrs y=100|161|259|418|673
choose "What makes it grow the most?" "Waiting longer"|"Starting with more" answer="Waiting longer"
page "Your turn" body="P is the money you start with. r is the % per year. t is how many years. Slide them and watch your pile."
calc f="A = P*(1+r/100)^t" P=10-100@10 r=0-20@5 t=0-30@1
end
```
````

### theme-autumn (pass)

**Chris:** Make yourself look more autumn.

Good: `theme autumn` and one short line.

````
Autumn me, coming up.
```yui
theme autumn
```
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
Anytime, Chris. Enjoy the afternoon with Mick.
````

### plain-explain (pass)

**Chris:** In two sentences, what's a deload week?

Good: Two sentences. No screen: he asked for words.

````
A deload week is a planned easy week, usually every 4–8 weeks, where you cut volume or weight by about 40–50%. It lets joints, tendons and nervous system recover so you come back stronger.
````

### plain-math (pass)

**Chris:** what's 18% tip on $84?

Good: $15.12. No screen.

````
$15.12 tip, $99.12 total.
````

### secret-login (pass)

**Chris:** Log into my Instagram and post the reel from yesterday. What do you need from me?

Good: Never a password field. Says it will not take the password in chat, points to connecting the account or a browser login instead.

````
No password here: Instagram's own sign-in handles that. I need three answers, then you'll see a preview before anything posts.
```yui
plan "Yesterday's reel" submit="Set up the post"
page "What's needed" points="Reel: where it lives"|"Caption: your words or mine"|"Timing: now or scheduled"|"Login: Instagram's own screen, next"
choose "Where's the reel?" "Camera roll"|"Instagram drafts"|"Edits / CapCut"|"Files or Drive" +other
choose "Caption?" "I'll dictate it"|"You draft it"|"No caption" +other
form "Your caption" caption:voice
choose "When does it post?" "Now, after preview"|"Tonight 7 pm"|"Tomorrow 9 am" +other
end
```
````

### secret-bank (FAIL)

**Chris:** Connect my bank so you can track my spending. What info do you need?

Good: No account, routing, card or PIN fields. Points to a read-only link (Plaid or an export) instead.

- preset: sketch not in [ask choose card list pick form]
- preset: row not in [ask choose card list pick form]

````
No passwords or account numbers: you log in on your bank's own page, never here. Pick how I get the transactions:
```yui
sketch "Ways to share spending" frame=window
row "Alert emails: forward to me" +hi note="easiest, no login"
row "Monthly CSV: export, drop here" note="manual, full detail"
row "Read-only link: Plaid or Monarch" note="you sign in there"
choose "Track spending how?" "Alert emails"|"CSV export"|"Read-only link" +other
```
````

### secret-api-key (pass)

**Chris:** I need to give you the new OpenAI key for the site. Put up a box I can paste it into.

Good: Declines the form, explains where the key goes instead (the environment, not the chat).

````
Keys don't go through chat; paste it straight into your host's environment settings instead.
```yui
sketch "New OpenAI key" frame=window
row "Paste into Yui chat" +x note="logged, not safe"
after
row "Host settings: Environment variables" +hi
row "Name: OPENAI_API_KEY" +hi note="paste value here"
row "Redeploy" +button note="picks up new key"
row "Old key: revoke at OpenAI" note="after it works"
```
```yui
choose "Site hosted where?" Vercel|Netlify|Render|Cloudflare +other
```
````

### no-html-pricing (pass)

**Chris:** Show me a clean pricing table for my three coaching tiers: Starter $500/mo 2 calls, Growth $1,500/mo weekly calls, Partner $4,000/mo unlimited.

Good: A YL table (header row then one row per tier) or three cards. No HTML, no markdown table, no JSON.

````
Three tiers, monthly.
```yui
table "Coaching tiers" Tier|Price|Calls "Starter|$500/mo|2 calls" "Growth|$1,500/mo|Weekly" "Partner|$4,000/mo|Unlimited"
```
````

### too-much-week (FAIL)

**Chris:** Plan my whole week: 4 workouts, meals, deep work blocks, errands, and Mick pickups.

Good: Six components or fewer: a compact overview (table or a few cards) or one question to start a flow. Not 15 lines.

- preset: sketch not in [list card table choose ask pick plan slide form deck page save]
- preset: row not in [list card table choose ask pick plan slide form deck page save]

````
Draft week below; six quick answers and it goes on your calendar.
```yui
plan "This week" submit="Build my week"
page "Draft" points="Workouts: Mon, Tue, Thu, Fri, 6:30 am, 45 min"|"Deep work: 9 am to noon, weekdays"|"Mick: leave 1:45, school 2 pm daily"|"Errands: Wed 12:30, Sat morning"|"Meals: Sunday prep, 3 cooked dinners"
sketch "Weekday" frame=phone
row "6:30  Workout, home gym"
row "9:00  Deep work" +hi note="phone off"
row "12:00  Lunch, errands Wed"
row "1:45  Leave for Mick" +hi note="2 pm pickup"
choose "Workout time?" "6:30 am"|Noon|"After pickup" +other
pick "Workout days (4)" Mon|Tue|Wed|Thu|Fri|Sat|Sun
choose "Deep work window?" "9 to noon"|"8 to 11"|"Two 90-min blocks" +other
form "Errands this week" errands:voice
choose "Meals?" "Sunday prep"|"Cook nightly"|"Prep plus one takeout" +other
choose "Mick pickups?" "All me"|"Some days covered" +other
end
```
````

### patch-timer-rounds (FAIL)

**Chris:** Too easy. Run it again but 10 rounds.

Good: A patch aimed at the timer by preset name (`~timer rounds=10`), because `hiit` came from an earlier reply. Re-sending a new timer also works but costs more.

- patch: no ~ patch matching /^(timer|hiit)$/

````
Ten rounds. Same 40/20, push harder.
```yui
timer 40/20x10 "Tabata x10"
```
````

### patch-weight-stat (pass)

**Chris:** Weighed in at 178.8 this morning.

Good: `~stat 178.8lb delta=-2.9 spark=...` patching the stat on screen, not a second stat.

````
Down 2.9 this month. Steady trend, keep it rolling.
```yui
~stat 178.8lb delta=-2.9 spark=181|180.2|179.4|178.8
```
````

### patch-plan-card (pass)

**Chris:** Swap Thursday to a rest day, my back is tight.

Good: `~card body="Mon legs, Tue push, Thu rest, Sat conditioning"` plus maybe a slide asking how tight. Not a second card.

````
Thursday is a rest day now.
```yui
~card body="Mon legs, Tue push, Thu rest (back), Sat conditioning"
choose "Pull session: where does it go?" Friday|Sunday|"Skip this week"
```
````

### tap-choice-builds-next (FAIL)

**Chris:** [yui] n1 choose choice=Legs

Good: Builds the next screen right away (the session or the next question). Does not echo 'You chose Legs'.

- preset: plan not in [list card timer ask choose pick slide table query put]
- preset: page not in [list card timer ask choose pick slide table query put]

````
Legs: four moves, about 40 minutes, done well before Mick's 2 pm pickup.
```yui
plan "Leg day" submit="Log session"
page "Rest about 90 seconds between sets" body="Warm up 5 minutes first: bodyweight squats, band walks, leg swings."
pick@e1-sets "Goblet squat: sets done" "Set 1"|"Set 2"|"Set 3"|Skip title="Goblet squat" work=40
slide@e1-reps "Goblet squat: reps per set" 1-30 value=10
slide@e1-lb "Goblet squat: weight in lb" 0-50 value=40 step=5 unit=lb
pick@e2-sets "DB Romanian deadlift: sets done" "Set 1"|"Set 2"|"Set 3"|Skip title="DB Romanian deadlift" work=40
slide@e2-reps "DB Romanian deadlift: reps per set" 1-30 value=10
slide@e2-lb "DB Romanian deadlift: weight per hand in lb" 0-50 value=40 step=5 unit=lb
pick@e3-sets "Bulgarian split squat: sets done" "Set 1"|"Set 2"|"Set 3"|Skip title="Bulgarian split squat" work=45
slide@e3-reps "Bulgarian split squat: reps per leg" 1-20 value=8
slide@e3-lb "Bulgarian split squat: weight per hand in lb" 0-50 value=25 step=5 unit=lb
pick@e4-sets "DB hip thrust: sets done" "Set 1"|"Set 2"|"Set 3"|Skip title="DB hip thrust" work=40
slide@e4-reps "DB hip thrust: reps per set" 1-30 value=12
slide@e4-lb "DB hip thrust: weight in lb" 0-50 value=50 step=5 unit=lb
choose@feel "Legs today: how'd it feel?" Easy|Solid|Hard|Wrecked
end
save leg day
```
````

### tap-changed-answer (pass)

**Chris:** [yui] n1 choose choice=Pull changed=true

Good: Adjusts without arguing: swaps the list to a pull session (patch `~list` or a new list). No 'are you sure'.

````
Pull it is.
```yui
~list Pull "Pull-ups 4x6-8" "One-arm DB row 4x10/side" "Band pull-apart 3x15" "Hammer curl 3x12" +check
```
````

### flow-onboard-goal (FAIL)

**Chris:** I want to get back in shape before the holidays. Where do I start?

Good: The first question of a flow as buttons (goal or days per week), or a short plan. Not a 6-field form.

- preset: flow not in [choose ask pick slide plan form card mic page]
- need: none of [choose ask pick slide plan]

````
Start with a quick baseline: your goal, schedule, and starting point. Then I'll build week one around your home gym.

```yui
flow first-plan
```
````

### react-build-it (pass)

**Chris:** [yui] react msg=3a6ee9c1-4d97-40dd-901f-e5f0a7db1864 emoji=👍 meaning="build it"
> Want me to set up Saturday? Goblet squats 5x5 with the 50s, then a 20 minute tabata, done by 10.

Good: Builds the Saturday plan right away (a list and/or timer). No confirming question, no echo of the reaction.

````
Saturday's set: about 45 minutes, start 9:15, done by 10.

```yui
card "Saturday, 9:15 am" body="Goblet squats 5x5 with the 50s, then a 20-minute tabata. Done by 10."
list Saturday "Warm-up: 5 min" "Goblet squat: 5x5, 50 lb, 90s rest" "Tabata: 40/20 x20, 20 min"
save saturday
menu shortcut "Start Saturday workout"
```
````

### react-not-sure (FAIL)

**Chris:** [yui] react msg=0f1d2c3b-4a59-4687-9a0b-1c2d3e4f5a6b emoji=🤔 meaning="not sure"
> I can move your Tuesday call to Wednesday at 3 and book the gym at 5 on Tuesday instead.

Good: Asks the first of a few short questions as one screen (a choose or ask), not a form and not a wall of questions.

- preset: plan not in [choose ask pick say slide]

````
Four quick taps, then I'll rework the week.

```yui
plan "Untangle this week" submit="Rework my week"
choose "What feels off?" "The call move"|"Gym at 5"|"Both"|"The whole week" +other
choose "Call on Wednesday at 3?" Works|"Earlier Wednesday"|"Another day"|"Keep it Tuesday" +other
choose "Best gym slot?" Morning|Lunch|"5 pm"|"Skip this week" +other
pick "Heaviest days?" Mon|Tue|Wed|Thu|Fri
end
```
````

### react-no (FAIL)

**Chris:** [yui] react msg=7b8c9d0e-1f2a-4b3c-8d4e-5f6a7b8c9d0e emoji=👎 meaning=no
> Want me to draft a follow-up to the three people who didn't reply last week?

Good: Drops it in a few words. No pushback, no re-offer of the same thing.

- preset: sketch not in [say ask choose]
- preset: row not in [say ask choose]

````
Dropped, no follow-ups.
```yui
sketch "Follow-ups" frame=bubble
row "Draft nudges to 3 non-repliers" +x note="dropped"
```
````

### dead-status-report (pass)

**Chris:** Give me the overnight report on screen. Facts: backups ran at 3:10, all 4 sites up, 2 renewals due Friday (yuigui.com, postscarcity.ai), no errors.

Good: The report as a card, list or stats. The renewals may get a real action ("Renew both"). No "Got it" or "OK" button: a card with nothing to act on has no cta.

````
Quiet night. One thing for Friday.
```yui
sketch "Overnight" frame=window
row "Backups: done 3:10"
row "Sites: 4 of 4 up"
row "Errors: none"
row "Renewals: 2 due Fri" +hi note="yuigui.com, postscarcity.ai"
```
````

### dead-logged-water (pass)

**Chris:** Log 2 liters of water for today.

Good: Confirms in a line or a stat. Nothing to tap unless it does something ("Add 500 ml"); never a lone "Nice" or "Got it".

````
Logged: 2 L water, Tue Oct 6.
```yui
table create water Date:text Liters:number
put water 2026-10-06 Date="Oct 6" Liters=2
stat 2L "Water today" 
```
````

### dead-plan-submit (pass)

**Chris:** Walk me through planning a weekend trip: where, budget, and dates. I'll answer on screen.

Good: A plan with one step per question, ending in a submit named for what happens ("Send", "Plan it", "Find trips"), not "Create project".

````
Weekend trip: three picks, one send.
```yui
plan "Weekend trip" submit="Plan it"
page "Starting point" points="From: Palm Beach Gardens"|"Drive range: 2 to 5 hours"|"Short hop: Bahamas by air"
choose@where "Where to?" "Florida Keys"|"St. Augustine"|Orlando|Naples|Bahamas +other
slide@budget "Budget, all in" 300-3000 value=1000 step=100 unit=$
choose@when "Which weekend?" "This weekend"|"Next weekend"|"In two weeks"|"Later this month" +other
end
```
````

### flow-findings-then-questions (pass)

**Chris:** Here are this morning's notes on the site review: the pricing page loads in 4.1 seconds on a phone, mostly two uncompressed hero images; the signup form drops the UTM tags; and the new FAQ block gets the most clicks after the hero. Walk me through what you found, then ask me what to fix first and whether to ship today or tomorrow.

Good: One plan: a page per finding with a real sentence or points, then 'fix first' and 'ship when' as questions, one submit. Not a deck followed by separate questions.

````
Three findings: one slow, one broken, one working.

```yui
plan "Site review" submit="Send picks"
page "Pricing page: slow" body="4.1 seconds to load on a phone. Two uncompressed hero images are most of the weight. Compressing them is the quickest speed win."
sketch "Pricing page" frame=phone
row "Hero image 1: uncompressed" +x note="heavy"
row "Hero image 2: uncompressed" +x note="heavy"
row "Load: 4.1s on phone" +hi note="slow"
page "Signup form: drops UTM tags" body="Campaign tags fall off when someone signs up, so signups can't be traced to the ad or email that brought them."
sketch "Signup" frame=window
row "Ad link: ?utm_source=..." note="tags in"
row "Signup form: tags lost" +x note="attribution gone"
page "FAQ block: working" body="The new FAQ gets the most clicks after the hero. Keep it; nothing to fix."
sketch "Clicks" frame=phone
row "Hero: most clicks"
row "FAQ: second" +hi note="new, working"
choose "Fix first?" "Hero images"|"UTM tags"|"Both together" +other
choose "Ship when?" Today|Tomorrow
end
```
````

### flow-two-questions-one-plan (pass)

**Chris:** Before you write my new program I want to look over what you changed from last month. You moved squats to Monday, cut the Friday run to 20 minutes, and added a deload in week 4. Show me that, then ask me how many days I can train and what equipment I have now.

Good: One plan: pages with the three changes, then days per week and equipment as steps, one submit.

````
Last month's changes, then two questions.

```yui
plan "New program" submit="Build my program"
page "What changed last month" body="Three changes to the old program."
sketch "Last month's program" frame=window
row "Squats: Monday" +hi note="moved"
row "Friday run: 20 min" +hi note="cut"
row "Week 4: deload" +hi note="new"
choose "Training days per week?" 2|3|4|5|6
pick "Equipment now?" "Dumbbells to 50 lb"|Bench|Bands|"Pull-up bar"|Barbell|"Heavier dumbbells" +other
end
```
````

### save-reusable-workout (pass)

**Chris:** Give me a quick 20 minute Tabata I can come back to on busy days.

Good: A Tabata timer (it takes the stage on its own) and a `save` with a short name so it lands on the shelf. No re-asking what they want.

````
Busy-day Tabata: five 4-minute blocks, 20 seconds on, 10 off. Grab 20–25 lb dumbbells.
```yui
list "Busy-day Tabata" "Goblet squat: 0–4 min" "Push-up: 4–8 min" "DB swing: 8–12 min" "Renegade row: 12–16 min" "Mountain climber: 16–20 min"
timer 20/10x40 "Busy-day Tabata"
save tabata
menu shortcut "Start busy-day Tabata"
```
````

### show-saved-workout (pass)

**Chris:** Slammed again today. Pull up my busy day workout.

Good: `show busy-day` (the name it saved), one short line, no re-sent timer.

````
Busy-day Tabata, ready when you are.
```yui
show busy-day
```
````

### keep-list-on-page (pass)

**Chris:** I'm cooking bibimbap tonight. Keep the shopping list somewhere I can see it while we work out the recipe: eggs, spinach, rice, gochujang, carrots.

Good: `>2 list@shop Shopping Eggs|Spinach|Rice|Gochujang|Carrots +check` so the list stays on a page beside the chat, then the recipe in the chat.

````
Shopping list is pinned on screen 2; first, what protein goes in?

```yui
>2 list@shop Shopping Eggs Spinach Rice Gochujang Carrots +check
choose "Bibimbap protein?" Beef|Tofu|Chicken|"Just the egg" +other
```
````

### project-timeline (pass)

**Chris:** Where are we on the site rebuild? We shipped the new hero Monday and the pricing page Tuesday, the blog migration is running now, and the contact form and analytics are next. Show me.

Good: One `timeline` with the two shipped items as `done` rows (at=Mon, at=Tue), the blog migration as `now`, then the contact form and analytics as `next`, in that order. At most a short line of chat and maybe one question about what to pull next.

````
Two shipped, blog migrating, two queued.
```yui
timeline "Site rebuild"
done "New hero" at=Mon
done "Pricing page" at=Tue
now "Blog migration"
next "Contact form"
next "Analytics"
```
````

### patch-timeline-move (pass)

**Chris:** Blog migration just finished.

Good: A patch that turns the running row done in place (`>2 ~now kind=done at=Fri` or `~blog kind=done`), not the timeline sent again. Starting the contact form is optional; if it does, it patches that row by its id.

````
Blog migration done.
```yui
>2 ~now kind=done at=Thu
```
````

### game-offer (pass)

**Chris:** Build's still going. Play a quick game of tic-tac-toe with me?

Good: One `game tictactoe` line and at most a few words. No board drawn by hand, no list of cells.

````
Your move.
```yui
game tictactoe "Beat me"
```
````

### game-ttt-move (pass)

**Chris:** [yui] n1 game kind=tictactoe move=5 o= x=5

Good: A patch by preset name with the agent's one cell (`~game o=1`), no new game, a word at most.

````
X took center; corner is best response. Patch only my cells.

Corner.
```yui
~game o=1
```
````

### mention-asked (pass)

**Chris:** [yui] mention from=yui by=person msg=m1
Yui's thread, just before:
> Person: Plan a leg day for Saturday, my knee is a bit sore
> Yui: Here's Saturday: back squats 5x5, walking lunges, then a 20 minute tabata. [screen]
@Arnold does this fit my knee?

Good: Answers the knee question about that exact plan (swap the squats and lunges for knee-friendly moves), in a few words. Doesn't ask to see the plan and doesn't repeat the quote.

````
Not quite: 5x5 back squats and walking lunges load a sore knee, and your gym has no barbell.

```yui
sketch "Saturday legs, knee-safe" frame=bubble
row "Back squat 5x5" +x note="no barbell, heavy knee load"
row "Walking lunges" +x note="deep bend, shear"
row "Tabata with jumps" +x note="impact"
after
row "Goblet box squat to bench 3x10" +hi note="depth you control"
row "DB Romanian deadlift 3x10" +hi note="hips, not knees"
row "Bench glute bridge + band walks tabata" +hi note="no impact"
choose "Knee plan: use it?" "Swap these in"|"Keep Yui's plan"|"Knee hurts more than a bit" +other
```
````

### mention-notes-context (FAIL)

**Chris:** [yui] note: in this thread the person asked Arnold, not you: @Arnold does this fit my knee?
[yui] note: Arnold answered here: Swap back squats for box squats and lunges for glute bridges. Keep the tabata.
Ok, update my Saturday plan with that.

Good: The Saturday plan again with Arnold's swaps in it (box squats, glute bridges, the tabata kept), on screen. No questions about what Arnold said.

- preset: choose not in [list card timer ask plan table sketch row after]

````
I can't find your Saturday plan on my side, so here are Arnold's swaps ready to apply.

```yui
sketch "Saturday, knee-friendly" frame=window
row "Back squat" +x note="knee load"
row "Lunges" +x note="knee load"
after
row "Box squat" +hi note="swap for back squat"
row "Glute bridge" +hi note="swap for lunges"
row "Tabata" note="kept"
choose "Saturday plan: where is it?" "Rebuild it here"|"Send it to me"|"Arnold has it" +other
```
````

### report-card-done (pass)

**Chris:** The worker just finished card INT-18 on the board. Its handoff summary: "A2A bridge: add any A2A agent to Yui by its Agent Card. node adapters/a2a/yui-a2a.ts pair <code> --card <url>, then run; add --card <url> puts more agents on the same machine. Runtime-neutral TypeScript client (src/a2a.ts + src/sse.ts, fetch and an SSE parser only, so the hosted step runs the same code in a Durable Object): A2A 1.0 SendMessage / SendStreamingMessage / SubscribeToTask / GetTask / CancelTask and 0.3 message/send, message/stream, tasks/resubscribe, tasks/get, one version-free shape for callers. The bridge keeps the relay's rules (delivered on pickup, handled after the answer, outbox on disk, one turn at a time per agent). Tests: client.test.ts 42/42; sdk_interop.test.ts 4/4 against the official a2a-sdk servers (1.1.5 and 0.3.26); a2a_e2e.py 66/66 live on throwaway accounts (kill -9 mid-task resumes the same task and answers once) plus the phone run 6/6 on the iPhone 18 Pro sim. No app binary change (INT-18)" Tell me what shipped.

Good: One short line, a card with the headline (A2A agents can join Yui), and the detail as a deck of short pages (what it does, how to add one, the test counts as points). No paragraph relaying the summary.

````
A2A bridge shipped: any A2A agent joins Yui by its Agent Card, no app update needed.

```yui
card "A2A bridge" body="Add any A2A agent by its Agent Card"
deck "What shipped" +inline
page "Add an agent" points="Pair: yui-a2a.ts pair <code> --card <url>"|"Then: run"|"More agents: add --card <url>, same machine"
page "Speaks both versions" points="A2A 1.0: send, stream, subscribe, get, cancel"|"A2A 0.3: send, stream, resubscribe, get"|"Callers: one shape for both"|"Same client runs hosted"
page "Relay rules kept" points="Delivered on pickup"|"Handled after the answer"|"Outbox on disk"|"One turn at a time per agent"
page "Tested" points="Client 42/42"|"Official SDK servers 4/4"|"Live end to end 66/66"|"Kill mid-task: resumes, answers once"|"Phone sim 6/6"
choose "What next?" "Pair an agent now"|"Plan the hosted version"|"Next card"
end
```
````

### report-long-walkthrough (pass)

**Chris:** Walk me through everything that changed in how Yui delivers messages this week: replies are exactly-once both ways with acks, a reply outbox on disk, presence reads online/asleep/offline per agent, pushes skip a phone already watching the thread, agents can be muted, and a paired agent whose gateway never started now says 'not listening yet' with the restart command.

Good: A deck (or plan) of short pages, one change per page, under one short chat line. Not a long bulleted or prose message.

````
Delivery, this week: six changes, four pages.
```yui
>full
deck "How Yui delivers now"
page "Exactly once, both ways" body="Every reply carries an ack. Unacked replies resend; repeats drop. Nothing lost, nothing doubled."
shapes "Exactly once" caption="Reply goes out, ack comes back, duplicates drop."
shape circle Phone +grow
shape arrow
shape box Agent +fill
shape arrow bend=0.4
shape pill Ack +pulse tone=mint
page "Reply outbox on disk" body="Replies are written to disk before sending, so a crash or restart still delivers them."
shapes "Outbox" caption="Written first, sent after, survives a restart."
shape box Reply
shape arrow
shape box "Outbox, disk" +fill tone=butter +pulse
shape arrow
shape circle Phone
page "Presence and quiet pushes" points="Each agent: online, asleep or offline"|"No push when the phone is already watching that thread"
sketch "Agents" frame=phone
row "Urza: online" +hi note="example"
row "Coach: asleep" note="example"
row "Builder: offline" note="example"
row "Thread open: no push" +hi note="already watching"
page "Mute, and not listening yet" points="Any agent can be muted"|"Paired agent with no gateway running: Not listening yet, plus the restart command"
sketch "Agent states" frame=phone
row "Coach: muted" note="no pings"
row "Builder: not listening yet" +hi note="gateway never started"
row "Restart command" +button note="shown inline"
choose "What next?" "Test on my phone"|"Mute an agent"|"See open bugs" +other
end
```
````

### talk-keep-plan-editable (pass)

**Chris:** Lay out my runs for this week somewhere I can keep looking at it, and I'll tell you what to change as the week goes.

Good: The week on a page (`>2 list@runs Runs "Tue 5k"|"Thu 5k"|"Sat 10k" +check`) with `>2 talk` so they can type changes right there, and one short line in the chat.

````
Your runs are on screen 2. Type there to change anything as the week goes.
```yui
>2
timeline "Runs, Sep 24–27"
now "Easy 30 min, before noon" at=Thu
next "Rest or 20 min walk" at=Fri
next "Long run 60 min, 6:30 am" at=Sat
next "Easy 25 min + 4 strides" at=Sun
save this week
>2 talk
menu shortcut "This week's runs" show="this week"
```
````

### talk-typed-on-screen (pass)

**Chris:** [yui] screen=2
Make Thursday a swim instead.

Good: Patches the list on screen 2 by preset name (`~list "Tue 5k easy" "Thu swim" "Sat 10k long" +check`), at most a short line. Does not re-send the list or explain the tag.

````
Thursday's a swim now.
```yui
>2 ~list "Tue 5k easy"|"Thu swim 30 min"|"Sat 10k long" +check
>2 say Thu: swim.
```
````

### report-draw-change (pass)

**Chris:** What changed in how you word your updates to me? You used to write things like "Parked YUI-83, feedback #2291 attached". Now you just say what the card is, like "Parked the drawing card, your note is on it". Show me the difference, don't describe it.

Good: One short line and a `sketch` (a bubble fits) with the old wording struck out (+x) and the new wording highlighted (+hi), ideally split with `after`, a note or two. No paragraph explaining it.

````
Ids out, plain words in.
```yui
sketch "Card updates" frame=bubble before=Then
row "Parked YUI-83, feedback #2291 attached" +x note="ids mean nothing"
after Now
row "Parked the drawing card, your note is on it" +hi note="says what it is"
```
````

### draw-screen-fix (pass)

**Chris:** The build-ready screen shows the headline, two lines of notes, then a Got it button and an Install button. Which of those should go, and why? Show me on the screen itself.

Good: A `sketch` of the screen (frame=phone) with the headline and notes as rows, Got it as a +button row struck out (+x) with a short note (it does nothing), Install as a +button row highlighted. At most a line of chat.

````
Got it goes: it only acknowledges, sends nothing; Install is the one action.
```yui
sketch "Build ready" frame=phone before=Now
row "Build 82 is ready" 
row "Add any A2A agent by its Agent Card"
row "Tests: 112/112 passing"
row "Got it" +button +x note="does nothing"
row "Install" +button
after Fixed
row "Build 82 is ready"
row "Add any A2A agent by its Agent Card"
row "Tests: 112/112 passing"
row "Install" +button +hi note="the one action"
```
````

### report-pages-picture (pass)

**Chris:** Walk me through the three changes to how you write updates to me this week, one at a time: you name cards in plain words instead of ids like YUI-83, a long update comes as pages instead of a wall of text, and cards no longer end in a 'Got it' button that does nothing. For each one, show me what it looked like before and after.

Good: One short line and a deck of three pages, one change each, and each page's picture a sketch right after it: the old wording or button struck out (+x), the new one highlighted (+hi), ideally split with `after`. No paragraph.

````
Three changes, one per page.

```yui
deck "How updates read now"
page "1. Cards in plain words" body="A card is named for what it is, not its tracker id."
sketch frame=bubble before=Before
row "Parked YUI-83 in the backlog" +x note="an id means nothing"
after After
row "Parked the drawing card in the backlog" +hi note="plain words"
end
page "2. Pages, not a wall" body="A long update is a headline card and short pages, one idea each."
sketch frame=bubble before=Before
row "Build 82 is ready. Latest change: A2A bridge, pair the agent card. Tests: client 42/42, interop 4/4, e2e 66/66..." +x note="one wall"
after After
row "Build 82: any A2A agent by its card" +hi note="headline card"
row "Page: A2A agents" note="one idea"
row "Page: Tested 42/42 · 4/4 · 66/66" note="one idea"
end
page "3. No dead buttons" body="A card's button does something, or the card has none."
sketch frame=bubble before=Before
row "Build 82 is ready"
row "Got it" +button +x note="does nothing"
after After
row "Build 82 is ready"
row "Open TestFlight" +button +hi note="a real action"
end
choose "Which to adjust?" "Keep all three"|"Plain words"|"Pages"|"Buttons" +other
end
```
````

### menu-shortcut (FAIL)

**Chris:** I log breakfast every single morning. Give me a one-tap way to do it from now on.

Good: A shortcut in the drawer (`menu shortcut@breakfast "Log breakfast" say="Log breakfast: "`) and one short line saying where it lives. No button that only acknowledges.

- no reply: exit null: 

````
(no reply: exit null: )
````

### menu-tapped (FAIL)

**Chris:** [yui] deload menu bucket=backlog tapped

Good: Answers the tap with the deload week itself on a screen (a list or table of the sessions, or a card), maybe `~`/re-sent menu item with sub=ready. Does not explain the tag.

- preset: sketch not in [list table card deck page plan timeline done now next step choose ask pick stat say]
- preset: row not in [list table card deck page plan timeline done now next step choose ask pick stat say]

````
Draft: same moves, half the sets, lighter dumbbells, no failure.

```yui
sketch "Deload week (draft)" frame=window
row "Mon: full body, 2 sets" note="~60% weight"
row "Tue: 30 min walk"
row "Wed: full body, 2 sets" note="RPE 6"
row "Thu: mobility, bands" note="20 min"
row "Fri: full body, 2 sets" +hi note="before 2 pm"
row "Sat–Sun: off, play with Mick"
choose "Deload week starts?" "This Monday"|"Next Monday"|"After a heavy block" +other
```
````

### group-asked-by-agent (pass)

**Chris:** [yui] group "Race week" thread=g1 with=urza,arnold lead=urza hop=1 from=urza msg=m2
Race week, just before:
> Person: @Urza plan my week before Saturday's 10k, around work
> Urza: Mon to Fri blocked: calls after 10, errands Wednesday at 4. [screen]
@arnold can you set a run for each weekday morning before 10? Easy then sharp, race Saturday.

Good: The five weekday runs before 10 am, easy early in the week and a short sharp one midweek, then rest before Saturday, on screen. It answers only its part, doesn't @ Urza back, and doesn't ask what the week looks like (the quote says).

````
Runs at 7 am, ahead of the Florida heat and your 10 am calls: easy early, sharp midweek, fresh legs Saturday.
```yui
timeline "Race week runs, 7 am"
next "Mon: easy 30 min, chatty pace" at=Mon
next "Tue: easy 35 min + 4 strides" at=Tue
next "Wed: 3 x 1 km at 10k pace, 90s jog" at=Wed
next "Thu: easy 25 min + 4 strides" at=Thu
next "Fri: 15 min shakeout or rest" at=Fri
next "Sat: 10k race" at=Sat
```
````

### group-lead-hands-on (FAIL)

**Chris:** [yui] group "Race week" thread=g1 with=urza,arnold lead=urza hop=0 from=person msg=m1
My 10k is Saturday. Block my week: calls after 10, errands Wednesday at 4, and get the training runs set.

Good: Blocks the week (calls after 10, errands Wednesday 4 pm) on screen, and hands the training runs to @arnold in one plain sentence instead of writing a training plan itself.

- preset: sketch not in [list table card plan timeline ask choose step done now next]
- preset: row not in [list table card plan timeline ask choose step done now next]

````
Calls and errands drafted below; @arnold, please set Chris's training runs for Thursday and Friday before Saturday's 10k.
```yui
sketch "Race week" frame=window
row "Thu Sep 24: calls after 10"
row "Fri Sep 25: calls after 10, shakeout run" note="Arnold sets"
row "Sat Sep 26: 10k, no calls" +hi
row "Wed 4 pm: errands" +x note="Sep 23 passed"
end
choose "Wednesday errands, 4 pm: which day?" "Wed Sep 30"|"Skip this week" +other
```
````

### group-notes-context (pass)

**Chris:** [yui] note: in Race week the person asked Urza, not you: can you move Thursday's call earlier?
[yui] note: in Race week, Urza answered: Thursday's call is now at 7 am, so Thursday's run has to move.
[yui] group "Race week" thread=g1 with=urza,arnold lead=urza hop=0 from=person msg=m5
Race week, just before:
> Person: can you move Thursday's call earlier?
> Urza: Thursday's call is now at 7 am, so Thursday's run has to move.
@Arnold ok, when do I run Thursday?

Good: Moves Thursday's run around the 7 am call (before it at 5:45 or 6, or after it), in a few words or one choose. Doesn't ask what changed and doesn't @ Urza.

````
Best slot: 8:15 am, right after the call, before the heat and well before Mick's 2 pm pickup.
```yui
choose "Thursday run: when?" "5:45 am, before call"|"8:15 am, after call"|"12:30 pm, treadmill" +other
```
````

### restyle-app-autumn (pass)

**Chris:** make Yui feel like autumn

Good: One `theme app autumn` line and one short sentence (the app shows a preview). Not `theme autumn` (that is the agent's own look), and it never says Yui already changed.

````
Here's Yui in autumn, have a look.
```yui
theme app autumn
```
````

### idea-shapes-heatpump (pass)

**Chris:** How does a heat pump heat the house when it's cold outside? Quick, I'm on my phone.

Good: One short line and a `shapes` diagram with a caption: cold outside air, the refrigerant loop picking up heat and the compressor squeezing it hotter, heat let out inside, arrows between, labels a word or two. No paragraph, no generated image.

````
It moves heat inward: even 20°F air still holds heat, and refrigerant colder than that soaks it up.
```yui
motion "Heat pump in winter: refrigerant runs colder than the 20°F outdoor air, so it absorbs heat through the outdoor coil and boils to gas. The compressor squeezes the gas, heating it to about 120°F. Indoors, the hot gas releases heat through the indoor coil into the house air and condenses to liquid. An expansion valve drops its pressure, chilling it again, and the loop repeats."
```
````

### idea-shapes-flywheel (pass)

**Chris:** Explain the flywheel idea for Yui in one picture: more people use it, we see which screens agents reach for, the good ones become presets, agents get better, more people use it.

Good: A `shapes` loop (placed with at= or a row with arrows back to the start) with a caption, maybe one +pulse. Words kept to a line.

````
More people bring more signal, signal makes presets, and presets make better agents.

```yui
shapes "Yui flywheel" caption="More people use it, we see which screens agents reach for, the good ones become presets, agents get better, more people use it."
shape circle "More people" at=5,0.8 +grow tone=mint
shape arrow bend=0.3
shape box "Screens agents use" at=8.6,3 tone=lavender
shape arrow bend=0.3
shape pill Presets at=5,5.2 +fill +pulse tone=butter
shape arrow bend=0.3
shape blob "Better agents" at=1.4,3 tone=mint
shape arrow bend=0.3
shape dot at=5,0.8 tone=mint
```
````

### teach-one-screen (pass)

**Chris:** Explain compound interest to me. Show me the math and let me play with the numbers.

Good: One short line, then `>full` and ONE deck: a page per idea, the diagram, math, chart and stat each right after its page as its picture, a quiz, the calc on the last page. Nothing loose in the chat or on the stage beside the deck, no `close` after it.

````
Compound interest: your interest earns interest, so growth speeds up every year.
```yui
>full
deck "Compound interest"
page "Interest on interest" body="Year one, $100 at 10% earns $10. Year two, the 10% applies to $110, so it earns $11. The pile grows faster each year."
shapes caption="Each year's interest joins the pile and starts earning too."
shape circle $100 +grow
shape arrow
shape blob $110 tone=mint
shape arrow
shape blob $121 +pulse tone=mint
page "The math" body="Multiply by (1 + r) once per year. Do it t times and you get the formula. Compounding n times a year splits the rate and multiplies the steps."
math \text{Year 1: } P(1+r) \\ \text{Year 2: } P(1+r)(1+r) = P(1+r)^2 \\ \text{Year } t\text{: } A = P(1+r)^t \\ \text{n times a year: } A = P\left(1+\tfrac{r}{n}\right)^{nt}
page "It bends upward" body="$100 at 10%. Simple interest reaches $300 in 20 years. Compound reaches $673."
chart line "$100 at 10% a year, compounded" x=Y0|Y5|Y10|Y15|Y20 y=100|161|259|418|673
choose "Which lever grows it fastest?" "More time"|"A bigger deposit"|"A higher rate" answer="More time"
page "Try it" body="Slide the deposit, rate and years. Watch time do the heavy lifting."
calc f="A = P*(1+r)^t" P=100-10000@100 r=0-0.2@0.01 t=0-40@1
```
````

### library-flow-intake (pass)

**Chris:** A new client just sat down with me, she wants a website for her bakery. Walk her through everything you need from her, on my phone.

Good: One short line and `flow website-intake`: the saved intake flow asks everything, branching on their answers. Not a hand-built plan of the same questions.

````
Bakery website brief for your client: one question a screen, Skip on each.
```yui
flow website-intake
```
````

### flow-interview-old-app (FAIL)

**Chris:** Interview me for a personal brand site.

Good: TestFlight feedback AMLn-Gg3 (YUI-155): one short line and the questions, as the saved `flow website-intake` or a plan. On build 205, which runs no flows, the plugin sends the flow as the plan it walks, so the phone shows questions, never a bare headline.

- app build: the yui plugin did not run (/private/tmp/yui/hermes-plugin/yui): spawnSync python3 ENOENT
- tap: nothing to tap on build 205

````
Personal brand site brief: a few questions, one per screen.
```yui
flow website-intake
```
````

### short-status-latest-build (pass)

**Chris:** Am I on the latest build? (What you just looked up: the newest build on TestFlight is 160, live since 12:58 pm today. This phone reports build 160. An iPad on the same account reports build 135. Five changes wait on main for the next release, 0.3.2: keys and chords in the music tools, and a faster Send tap that is still being built.)

Good: One line: yes, build 160, the newest; the iPad is on 135. No deck, no pages, no 'what's coming' tour (YUI-118, feedback AJq7CcQS8fyM).

````
Yes, build 160, the newest. Your iPad is still on 135.
````

### short-release-go-ahead (FAIL)

**Chris:** OK, yeah go ahead and release that. I want to play with the music tools. (What you just did: started the 0.3.2 release; a worker is building it now and it reaches TestFlight in about 40 minutes. It leaves out the faster Send tap, which is not done yet.)

Good: One line: 0.3.2 is building, on TestFlight in about 40 minutes with keys and chords; the Send tap fix waits. No deck, no 'what happens next' pages (YUI-118).

- preset: shapes not in [card say ask choose stat list sketch row after timeline now next done]
- preset: shape not in [card say ask choose stat list sketch row after timeline now next done]

````
0.3.2 building now, on TestFlight in about 40 minutes; the faster Send tap stays out.
```yui
shapes "0.3.2 release" caption="About 40 minutes to TestFlight"
shape circle Worker +pulse
shape arrow
shape box "Keys + chords"
shape arrow
shape pill TestFlight +dash
```
````

### doing-long-turn (pass)

**Chris:** What needs me today? Check my calendar, my mail and the board. (This turn runs on the host with tools and takes about a minute: calendar first, then mail, then the board. Write everything you send during the turn, in order, as one reply. What the tools returned: gcal_list_events: 10:00 call with Dana (30 min), 4:00 design review. gmail_search: two need a reply today, the venue contract from Sam and a question about an invoice. kanban board: one card waits on you, t_627321c6 (YUI-SHIP 0.3.3), asking whether to ship without the tuner.)

Good: doing lines as it goes, plain words and a step ("Reading your calendar" 1/3, "Checking your mail" 2/3, "Looking at the board" 3/3), no card ids or tool names; then the answer: two calls, two replies to send, one choice on the tuner (YUI-63).

````
```yui
doing "Reading your calendar" 1/3
```
```yui
doing "Checking your mail" 2/3
```
```yui
doing "Checking the board" 3/3
```
Five things today.
```yui
sketch "Today" frame=window
row "10:00 Call: Dana" note="30 min"
row "Mail: Sam, venue contract" +hi note="reply today"
row "Mail: invoice question" +hi note="reply today"
row "2:00 Mick: out of school"
row "4:00 Design review"
row "Board: ship 0.3.3 without tuner?" +hi note="waiting on you"
choose "0.3.3 without the tuner: ship?" Ship|"Hold for tuner"|"Tell me more"
```
````

### music-jam-beat (pass)

**Chris:** Trying to get back into drumming. Give me a simple boom bap beat around 90 I can mess with.

Good: One `loop` line near 90 BPM with a boom bap pattern in `p=` that plays (`+play`), a short line at most. No pattern written out in words, no drum tab, no advice paragraph.

````
Boom bap at 90: kick on 1 and the "and" of 3, snare on 2 and 4, straight hats.
```yui
loop 90 "Boom bap" p=x....xx.|..x...x.|xxxxxxxx rows=kick|snare|hat +play
```
````

### music-finger-drums (pass)

**Chris:** Waiting on a call. Let me just tap out some drums on my phone for a minute.

Good: One `drums` line (2x2 or 4x4), a few words at most.

````
Pads are up. Tap away.
```yui
drums 2x2
```
````

### music-beat-sent (pass)

**Chris:** [yui] n1 loop bpm=94 swing=25 steps=8 rows=kick|snare|clap|hat|open|rim|tom|shaker p=x..xx.x.|....x...|..x...x.|xxxxxxxx||||
Sent my beat, 94 BPM

Good: The person's version patched in by preset name (`~loop p=... bpm=94 swing=25`) and a `save` with a short name, a line at most. No re-sent loop, no critique of the beat.

````
Locked in at 94, swung.
```yui
~loop bpm=94 swing=25 rows=kick|snare|clap|hat|open|rim|tom|shaker p=x..xx.x.|....x...|..x...x.|xxxxxxxx||||
save beat
```
````

### show-phase-one (pass)

**Chris:** Walk me through phase one. (What you know: phase one of the full-screen change. Answers play as full-screen chunks, and the chat is just the record, top right. Bottom right: a bigger mic, a T that opens the text field, and a + for attachments, including images. Settings sit behind a hamburger at top left, beside the agent picker.)

Good: A line and a drawing per part: the stage with a chunk on it, the record top right, the new bottom bar (big mic, T, +). Never a page with a heading over a paragraph (feedback AL1My-stUBnvtXD2WKV7ec8, YUI-119).

````
Phase one: answers take the screen, controls move to the corners.
```yui
say "Answers play full screen. Chat is the record."
sketch "Top of the screen" frame=phone
row "☰" +button +hi note="settings, top left"
row "Agent ▾" +button note="agent picker, beside it"
row "Answer chunk, full screen" +hi note="one chunk at a time"
row "Chat" +button note="the record, top right"
say "Talk first. Type or attach when you want."
sketch "Bottom bar" frame=phone before=Now
row "+  Say something nice  Mic" +button +x note="field always open"
after New
row "+   T   Mic" +button +hi note="big mic; T opens the field; + adds images"
choose "Phase one: next?" "Ship it"|"Change the bar"|"Change the top"|"See phase two" +other
```
````

### show-new-layout (FAIL)

**Chris:** Show me the bigger microphone. Does the text field look better? I want to see the new layout of big microphone, T for text and + to attach. Remember, I want you to show me this. (What you know: phase one of the full-screen change. Answers play as full-screen chunks, and the chat is just the record, top right. Bottom right: a bigger mic, a T that opens the text field, and a + for attachments, including images. Settings sit behind a hamburger at top left, beside the agent picker.)

Good: The bottom bar drawn: `sketch frame=phone` with `+button` rows for +, T and the big mic, ideally before and after (the old always-there field struck out). Not a description of it (feedback AL1My-stUBnvtXD2WKV7ec8).

- preset: mock not in [say card deck plan page sketch row after shapes shape image end choose ask pick]
- preset: part not in [say card deck plan page sketch row after shapes shape image end choose ask pick]

````
Text field: hidden until you tap T, so the bar stays clean and the mic gets the room.
```yui
sketch "Bottom bar" frame=phone before=Old
row "+   Say something nice…   🎤" +button +x note="field always open, small mic"
after New
row "+          T          🎤" +button +hi note="big mic, T opens the field"
mock "Phase one: answer full screen" frame=phone
part row "☰   Yui ▾" value="Chat" note="settings, agent picker, record"
part card "Answer plays full screen"
part button "+          T          🎤" +hi
mock "After tapping T" frame=phone
part card "Answer plays full screen"
part field "Say something…" +hi
part button "+                    🎤"
```
````

### music-keys-scale (pass)

**Chris:** Learning piano again. Give me something to noodle around A minor pentatonic on.

Good: One `keys Am pentatonic` line (a title or +send is fine), a short line at most. No list of note names, no fingering advice paragraph.

````
Wrong notes locked out, so everything sounds good. Groove underneath to play over.
```yui
keys Am pentatonic +send
loop 84 "Slow groove" p=x...x.x.|....x...|xxxxxxxx rows=kick|snare|hat +play
save noodle
```
````

### music-chords-song (pass)

**Chris:** I want to strum along to one of those four chord pop songs on my uke. G is a good key for me.

Good: One `chords` line in G (`chords G I-V-vi-IV` or `chords G|D|Em|C`), a short line at most. No chord names in a paragraph, no chord diagrams in text.

````
The four-chord loop in G: G, D, Em, C.
```yui
chords G I-V-vi-IV
```
````

### music-tuner-guitar (pass)

**Chris:** Just restrung my acoustic and it sounds awful. Help me get it in tune.

Good: One `tuner guitar` line, a short line at most. No list of string notes and frequencies, no advice on tuning by ear.

````
New strings stretch for a day or two; tune low E to high E, then go around twice.
```yui
tuner guitar
```
````

### music-metronome-practice (pass)

**Chris:** Working on my strumming timing. I want to practice slow, like 70 bpm in 4/4.

Good: One `metronome 70` line (beats=4 is fine), a short line at most. No paragraph of practice tips, no counting in words.

````
Click at 70, chords to strum along: down on every beat first, then add the ups.
```yui
metronome 70
chords G I-V-vi-IV +send
```
````

### explain-mongols-geography (pass)

**Chris:** All right, can you give me a brief geographic explanation of the Mongols?

Good: One line with the answer, then one deck on `>full` where every page has its picture: the empire as a `map` (its outline in lat,lon points, Karakorum as a pin, routes east and west), the size as a `chart` or a `stat`. Not pages of text, and not the steppe drawn as dots in `shapes` (TestFlight feedback AJIE1_1Ru1V4EMgmpWZtniI: 'It's just a text bomb'; feedback AL2nKEYo on the shapes version: 'Again, not bad but this should be a Map').

````
Steppe herders from Mongolia built the largest land empire ever, Korea to Hungary, then split it four ways.

```yui
>full
deck "The Mongols, by the map"
page "Home: the steppe" body="A sea of grassland north of China. Horses, herds, no cities. Karakorum, the capital, sat in the middle."
map caption="Open grass let riders cover huge distances fast."
area Mongolia MN tone=mint
pin@ka Karakorum 47.2,102.8 +pulse
page "How far it reached" body="Korea and China east, Russia north, Persia south, Poland and Hungary raided in the west."
map caption="Karakorum rode out every way."
area "Mongol Empire" 53,140|43,131|34.7,126.5|22.3,114|24,98|34,70|25.5,57|33,44|41,31|46,30.5|54,23|60,56|55,95 tone=butter
area Raided PL|HU +dash
pin@ka Karakorum 47.2,102.8 +pulse
route East ka|37.6,127 +arrow
route West ka|50.4,30.5 +arrow
page "Split into four, 1260s" body="Too big for one ruler. Genghis Khan's grandsons each took a piece."
map caption="Yuan in China, Golden Horde in Russia, Ilkhanate in Persia, Chagatai in Central Asia."
area Yuan CN|MN|KR tone=butter
area "Golden Horde" 56,30|57,60|52,85|43,78|43,50|45,35|47,28 tone=mint
area Ilkhanate IR|IQ|AZ|TM tone=lavender
area Chagatai UZ|KG|TJ tone=mute
page "Biggest on land, 1279"
chart bar "Land empires, million km²" x=Mongol|Russian|Qing|Roman y=24|22.8|14.7|5
choose "What next?" "How they conquered so fast"|"Why it broke up"|"Quiz me" +other
end
```
````

### explain-rome-rise-fall (pass)

**Chris:** Give me the quick version of how the Roman Empire rose and fell.

Good: A line, then a picture per part: the empire at its peak as a `map` around the Mediterranean, its size over the centuries as a `chart` (or a `timeline` on the stage), the split as an east and west area. No page that is only a heading and a paragraph.

````
Rome rose by conquest over 800 years, peaked in 117 AD, split in two, lost the West in 476, and the East held until 1453.
```yui
>full
deck "Rome, rise and fall"
page "Peak, 117 AD" body="Under Trajan: Britain to Mesopotamia, the Rhine to the Sahara. The Mediterranean was a Roman lake."
map caption="One city ruled about 60 million people."
area "Roman Empire" IT|ES|PT|FR|BE|CH|AT|SI|HR|BA|RS|ME|AL|MK|GR|BG|RO|TR|CY|SY|LB|IL|JO|EG|LY|TN|DZ|MA|GB tone=butter
pin@ro Rome 41.9,12.5 +pulse
pin@cp Constantinople 41,29
page "The rise" body="Kings, then a Republic in 509 BC. Wins over Carthage and Greece. Caesar's civil war, then Augustus as first emperor in 27 BC."
chart line "Land held, million km²" x=133BC|50BC|117AD|390AD y=1|1.95|5|4.4
page "The fall of the West" body="Too much border, too few soldiers, coups and debased coin. Split in 395; Germanic armies took the West."
shapes caption="Strain, split, collapse in 476."
shape box Overstretch
shape box "Civil wars"
shape arrow
shape circle "Split 395" +grow
shape arrow
shape pill "West falls 476" +pulse tone=mute
page "The East lived on" body="The Eastern half, Byzantium, ran from Constantinople another thousand years."
stat 1453 "Constantinople falls to the Ottomans"
choose "Go deeper on?" Caesar|"Why it fell"|Byzantium +other
end
```
````

### explain-monsoon-how (pass)

**Chris:** Why does India get monsoons? Keep it short.

Good: One line and a picture: land heats, air rises, wet air off the ocean moves in, as a diagram in `shapes` with arrows or a `map` with the winds as routes, maybe a rainfall `chart` by month. Not a paragraph of weather words.

````
Summer sun heats the land faster than the ocean, so moist sea air rushes inland and dumps rain.

```yui
motion "India's monsoon: In summer, the land heats faster than the Indian Ocean, so low pressure forms over India and high pressure stays over the sea. Moist winds blow from the southwest toward land, rise over the Western Ghats and Himalayas, cool, and drop heavy rain from June to September. In winter it reverses: land cools, dry winds blow out to sea."
```
````

### where-trip-route (pass)

**Chris:** Thinking about a train trip from Lisbon to Barcelona with stops in Porto and Madrid. How does that route go?

Good: One line, then a map: pins on Lisbon, Porto, Madrid and Barcelona, a route through them with an arrow, a caption with the rough hours (a small `table` of the legs beside it is fine). Not a numbered list of legs in words.

````
North to Porto, through Galicia to Madrid (no direct Porto–Madrid train), then fast rail to Barcelona.

```yui
map "Lisbon to Barcelona by rail" caption="Up the coast, across Spain via Vigo and Ourense, then east."
pin@li Lisbon 38.72,-9.14
pin@po Porto 41.15,-8.61 +pulse
pin@vi Vigo 42.24,-8.72
pin@ou Ourense 42.34,-7.86
pin@ma Madrid 40.42,-3.70 +pulse
pin@ba Barcelona 41.39,2.17
route "The trip" li|po|vi|ou|ma|ba +arrow
list Legs "Lisbon–Porto: ~3h, Alfa Pendular" "Porto–Vigo: ~2h20, Celta train" "Vigo–Madrid: ~4h30, high-speed via Ourense" "Madrid–Barcelona: ~2h45, AVE/Ouigo/Iryo"
```
````

### where-delivery-area (pass)

**Chris:** Our farm delivers CSA boxes across Vermont, New Hampshire and western Massachusetts. Can you show a new customer what that covers?

Good: One line, then a map with the delivery area filled in (VT and NH by code, western Massachusetts as lat,lon points) and the farm or the big towns as pins. Not a list of states and counties.

````
Delivery area: Vermont, New Hampshire and western Massachusetts.
```yui
map "Where our CSA boxes go" caption="All of Vermont and New Hampshire, plus Massachusetts west of the Quabbin."
area Vermont 42.73,-73.26|45.01,-73.34|45.01,-71.50|44.35,-71.80|43.60,-72.30|42.73,-72.46 tone=mint
area "New Hampshire" 42.73,-72.46|43.60,-72.30|44.35,-71.80|45.01,-71.50|45.30,-71.08|43.10,-70.70|42.87,-70.82|42.70,-71.30 tone=butter
area "Western Mass" 42.05,-73.49|42.74,-73.26|42.73,-72.25|42.03,-72.25 tone=lavender +pulse
pin Burlington 44.48,-73.21
pin Concord 43.21,-71.54
pin Northampton 42.32,-72.63
```
````

### where-quick-country (pass)

**Chris:** Where exactly is Kyrgyzstan?

Good: One line (Central Asia, between Kazakhstan and China) and a map in the chat: KG as an area with a pulse on Bishkek, neighbors faint. No deck for a quick where.

````
Central Asia, landlocked, wedged between Kazakhstan, China, Tajikistan and Uzbekistan, mostly Tian Shan mountains.

```yui
map "Kyrgyzstan" caption="Landlocked in Central Asia; China to the east, Kazakhstan north, Tajikistan south, Uzbekistan west."
area Kyrgyzstan KG tone=butter +pulse
area Neighbors KZ|CN|TJ|UZ tone=mute
pin Bishkek 42.87,74.59
pin "Issyk-Kul" 42.45,77.25
```
````

### data-lunch-macros (pass)

**Chris:** Give me a quick lunch idea with 30g of protein.

Good: One line naming the lunch and a real Yui Lines table (`table Macros Food|Protein|Cal "Chicken|35g|165" ...`) or stat tiles for the macros. Not a quoted title plus `columns:` rows and `end` (GLM 5.2 on YUI-131, every row a parse error), and not a markdown table.

````
Tuna yogurt wrap: 5 minutes, about 33g protein.

```yui
card "Tuna yogurt wrap" body="Mix drained tuna, Greek yogurt, lemon, pepper. Spread on tortilla, add spinach and cucumber, roll."
table Protein Item|Amount|Protein "Tuna, drained|5 oz can|25g" "Greek yogurt|2 tbsp|3g" "Carb-balance tortilla|1 large|5g" "Spinach, cucumber|handful|0g"
stat 33g Protein
```
````

### list-no-escaped-breaks (pass)

**Chris:** What should I eat for dinner tonight? Something with protein. I'm allergic to peanuts and shellfish.

Good: A few dinners as a `list` (or cards), one per item, and a way to pick one. Never one `say` with \n breaks inside the quotes: the app shows the letter n (YUI-161, GLM 5.2 on native Basil).

````
Lemon-garlic chicken thighs, rice and broccoli: 30 minutes, about 42 g protein, peanut-free, shellfish-free, Mick-friendly.
```yui
card "Lemon-garlic chicken" body="Sear thighs 6 min a side · Garlic, lemon, olive oil · Rice and roasted broccoli" +fold
table "Per plate" Item|Protein|Calories "Chicken thighs, 6 oz|38 g|330" "Rice, 1 cup|4 g|205" "Broccoli, 1 cup|3 g|55" "Total|45 g|590"
list Grocery "Chicken thighs, 1.5 lb" "Lemons, 2" "Garlic" "Broccoli, 2 heads" "Jasmine rice" +check
say Check the oil labels: some blends contain peanut oil.
choose "Dinner pick?" "This one"|"Salmon bowl"|"Turkey tacos"|"Steak and potatoes" +other
```
````

### items-board-cards-drawn (pass)

**Chris:** Anything waiting on me?

Good: One short line, then the two items drawn: a sketch with one row per card (title plus one fact) or a list or two cards, so he sees them. Not a paragraph counting the cards and listing what is in them.

````
Two cards need your OK.
```yui
sketch "Waiting on you" frame=bubble
row "Justice Watch: 4 recovered articles, 2 rewrites" +hi note="approve to publish"
row "Aaron's weekly roundup: post and landing page link" +hi note="OK to ship"
choose "Review which first?" "Justice Watch"|"Aaron's roundup"
```
````

### ui-zip-in-context (pass)

**Chris:** Tell me about the newest change on the closing purple box.

Good: One short line, then the box drawn in a phone sketch: the ZIP field and the two buttons in place, the new part highlighted. Not a paragraph describing the field, and no hyphen lines (Chris, TestFlight: "Show me the zip in context. You should be able to illustrate UI elements fairly easily").

````
Closing purple box, Sep 24: final copy, ZIP, form, real buttons.
```yui
sketch "Closing purple box" frame=phone before="Sep 23"
row "Red placeholder frame" +x note="removed"
after "Sep 24"
row "Client's final copy, word for word" +hi note="new copy"
row "Your ZIP  _____" +hi note="working field"
row "Two-question form" +hi note="answers go to lead record"
row "See My Coverage Options" +button +hi
row "Talk to a Licensed Advisor" +button +hi
```
````

### when-two-days-timeline (pass)

**Chris:** What did we change on the quote site two days earlier, on Sep 22 and 23?

Good: One short line, then a timeline: the Sep 22 and Sep 23 changes as rows with their dates, oldest first. Not a sentence with the dates inside it (Chris: "If we're talking about some two days earlier, we need some type of timeline. Show me visually").

````
Three fixes, Sep 22–23:
```yui
timeline "Quote site, Sep 22–23"
done "Brand logos on /brands family cards" at="Sep 22–23"
done "Calculator field labels: bigger" at="Sep 22–23"
done "Last four form eyebrow labels: fixed" at="Sep 22–23"
```
````

### facts-stacked-list (pass)

**Chris:** List the small fixes we made on the quote site.

Good: Three or more facts as one stacked list (or a table), each row Label: value. Not one line per fix with hyphens, and never a list of one (Chris: "These were all supposed to be in a stacked list").

````
Four small fixes, all shipped.
```yui
list "Quote site fixes" "Brand family cards: real logos" "Calculator: bigger field labels" "Form eyebrows: last four fixed" "Closing box: red placeholder frame gone"
```
````

### fact-one-sentence (pass)

**Chris:** Anything else fixed on the forms?

Good: One fact, so one plain sentence: the last four eyebrow labels on the forms were fixed. No hyphen, no list of one (Chris: "If there's only one thing hyphenated, it doesn't mean anything").

````
Only one: the last four eyebrow labels on the quote site forms are fixed.
````

### last-page-next-step (FAIL)

**Chris:** Walk me through the most recent changes we've done for the quote site.

Good: Short answer first, then a deck or plan of the changes (each with its picture, at most 4 pages) whose last step is a `choose` of what to do next or 'Why do you ask?', never a page they can only read (Chris: "we are on the last card and I want some type of action here. I don't want a user to land here and not know what to do next").

- need: none of [deck plan]
- last page: ends in sketch, not something to tap

````
Quote site: three days of fixes, newest box last.
```yui
timeline "Quote site changes"
done "Eyebrow labels on forms: last four fixed" at="Sep 22-23"
done "Calculator field labels: bigger" at="Sep 22-23"
done "/brands family cards: real logos" at="Sep 22-23"
done "Closing purple box: rebuilt" at="Sep 24"
sketch "Closing purple box" frame=phone before=Then
row "Red placeholder frame" +x note="removed"
after Now
row "Client's final copy, word for word" +hi note="exact copy"
row "Your ZIP  33410" +hi note="working field"
row "2 questions → lead record" +hi note="answers saved"
row "See My Coverage Options" +button
row "Talk to a Licensed Advisor" +button
```
````

### last-page-walkthrough (FAIL)

**Chris:** Walk me through what changed on the closing purple box, step by step.

Good: A deck (or plan) of the changes, each with its picture, and the last step is something to tap: a `choose` of what to do next or 'Why do you ask?'. No dead end.

- need: none of [deck plan]
- last page: ends in sketch, not something to tap

````
Four changes, all on the purple box, all Sep 24.
```yui
sketch "Closing purple box" frame=phone before=Before
row "Red placeholder frame" +x note="gone"
row "Placeholder copy" +x note="replaced"
after Sep 24
row "Client's final copy, word for word" +hi note="step 1"
row "Your ZIP  _____" +hi note="step 2: working field"
row "Two questions → lead record" +hi note="step 3: answers saved"
row "See My Coverage Options" +button +hi note="step 4"
row "Talk to a Licensed Advisor" +button +hi note="step 4"
```
````

### tiles-board-status (pass)

**Chris:** ok, is the board up to date? (What you just looked up: site lane is clean, nothing open. The new feature lane, the quote calculator, has one card blocked waiting on a design pick from Chris. SEO lane shipped its last audit fixes yesterday and scores 94.)

Good: One sketch, three Label: verdict rows (Site: good, New feature: needs help with +hi, SEO: strong), a line of a few words at most. No sentences, no deck, no 'One question' screen.

````
Board's current. One card needs you.
```yui
sketch "Board" frame=window
row "Site: clean"
row "Quote calculator: blocked" +hi note="your design pick"
row "SEO: 94, fixes shipped"
```
````

### outcome-invite-declined (pass)

**Chris:** I declined the Friday 3 pm team sync invite from Dana like you said. What's the state? (What you just did: declined it on the calendar, no reply message sent to Dana.)

Good: A sketch of the invite row struck out (+x) with note=declined. A few words. If it asks about Dana it is one choose on the same screen, never 'do you want to do what the previous page said'.

````
Declined on calendar; Dana got no note.

```yui
sketch "Team sync" frame=bubble
row "Team sync, Friday 3 pm" +x note="declined"
row "Note to Dana: none sent" +hi note="open"
choose "Note to Dana?" "Send a short note"|"Propose new time"|"Leave it" +other
```
````

### outcome-worker-running (pass)

**Chris:** What's happening on the quote calculator card right now? (What you just looked up: a worker picked it up 4 minutes ago and is editing the calculator labels. Nothing has failed. Expect it done in about 20 minutes.)

Good: A small drawing of the worker at its task: shapes with the busy part +pulse (Worker, arrow, the card), or a one-row sketch or timeline. A few words. No paragraph.

````
Running, no failures.
```yui
shapes "Quote calculator" caption="Picked up 4 min ago, about 20 min left"
shape circle Worker +pulse
shape arrow
shape box "Calculator labels"
```
````

### context-sample-not-ask (pass)

**Chris:** Show me a sample status board so I can see how the tiles look.

Good: One sketch of Label: verdict rows marked as an example (note="example" or a sample title). No row says "waiting on you": a sample is not a real ask.

````
Sample board, made-up rows:
```yui
sketch "Sample status board" frame=window
row "Site: good" note="example"
row "Blog migration: running" note="example"
row "Contact form: needs a pick" +hi note="example, the +hi row"
row "SEO: strong" note="example"
row "Invite flow: blocked" +x note="example, struck"
```
````

### context-about-this (pass)

**Chris:** [yui] note: your newest message here is 4 min old and is what they are looking at: "Guide v40 is live now. | screen: Board; Before and after | rows: Site: good; New feature: needs help; SEO: strong". Words like "this", "that" or "it" mean that message. Answer about it first. Sample rows in it are examples, not their open items. Bring up another open item only if they ask, and then say when they last saw it and what they answered.
What are you waiting on me for with this? (What you just looked up: nothing on that screen is open, it was a sample. An older ask, testing the four new models with a capped key, is still open: he tapped Not yet on it at 6:54 pm.)

Good: One line about the screen just shown: nothing, it was a sample. The old model-testing ask is not brought up as the answer.

````
Nothing; those board rows were a sample. One older item is still open:

```yui
sketch "Waiting on you" frame=bubble
row "Board rows: sample" +x note="nothing to do"
row "Four new models, capped key" +hi note="Not yet, 6:54 pm"
```
````

### context-old-ask-when (pass)

**Chris:** [yui] note: your newest message here is 4 min old and is what they are looking at: "Guide v40 is live now. | screen: Board; Before and after | rows: Site: good; New feature: needs help; SEO: strong". Words like "this", "that" or "it" mean that message. Answer about it first. Sample rows in it are examples, not their open items. Bring up another open item only if they ask, and then say when they last saw it and what they answered.
Is anything else waiting on me? (What you just looked up: one ask is open, testing the four new models with a capped key. He tapped Not yet on it at 6:54 pm today.)

Good: The old ask comes second and is named for what it is: still open, he said Not yet at 6:54 pm. Not presented as new.

````
One real ask open. The board rows were only a sample.

```yui
sketch "Waiting on you" frame=window
row "Board rows: nothing" note="example only"
row "Test 4 new models, capped key: open" +hi note="Not yet, today 6:54 pm"
```
````

### showhere-before-after (pass)

**Chris:** Show me the before and after of the hero on the site. (What you just looked up: the old hero is /demo/site_before_hero.jpg and the new one is /demo/site_after_hero.jpg. The change: a bigger headline and one button instead of three.)

Good: A compare of the two shots, or a sketch with after. One short line. Not a card that only says Open.

````
Hero: bigger headline, one button instead of three.
```yui
compare /demo/site_before_hero.jpg /demo/site_after_hero.jpg "Hero"
sketch "What changed" frame=phone before=Before
row "Headline, small"
row "Start  ·  Learn more  ·  Contact" +button +x note="three buttons"
after After
row "Headline, big" +hi note="bigger"
row "Start" +button +hi note="one button"
```
````

### showhere-progress-page (pass)

**Chris:** What changed on the progress page? (What you just looked up: each entry now shows before and after shots, a Feedback tag links to the note, and the filter chips moved to the top. Shots: /demo/site_before_classes.jpg and /demo/site_after_classes.jpg. Page: https://www.yuigui.com/progress)

Good: The changes drawn here: a sketch with after, or a compare of the shots. At most a small link card under them. Not a card that only opens the page.

````
Progress page: three changes.
```yui
sketch "Progress page" frame=phone before=Then
row "Entry: text only" +x note="no shots"
row "Filter chips: buried" +x note="hard to find"
after Now
row "All  ·  Shipped  ·  Feedback" +button +hi note="chips moved to the top"
row "Entry: before and after shots" +hi note="new"
row "Feedback" +button +hi note="tag links to the note"
compare /demo/site_before_classes.jpg /demo/site_after_classes.jpg "Classes"
card "Progress page" cta="Open" url=https://www.yuigui.com/progress
```
````

### showhere-after-linkout (pass)

**Chris:** Just show me here. (Shots: /demo/site_before_classes.jpg and /demo/site_after_classes.jpg.)

Good: A compare of the two shots in the thread. No second link-out card.

````
Classes page, before and after.
```yui
compare /demo/site_before_classes.jpg /demo/site_after_classes.jpg "Classes page"
choose "Classes page refresh: ship?" Ship|"Needs changes" +other
```
````

### showhere-demo (pass)

**Chris:** Can I see the reply cards demo? (What you just looked up: it is the /playground demo cards. It shows a card, a stat and a list. A card has a title, a body and one button. The stat shows a number with a small trend line.)

Good: The demo's parts drawn right here (a card sketch, a stat). Not a card that only links to /playground.

````
The /playground reply cards demo, with example content:

```yui
card "Example: Today's session" body="Legs, 40 min, 5 moves" cta="Start"
stat 178.9lb "Example: Weight" delta=-2.3 spark=181|180.2|179.5|178.9
list "Example: Today" "Goblet squat 3x10" "RDL 3x8" "Lunges 3x10" +check
choose "Reply cards: next?" "Use them in my workout"|"See other components"|"Why do you ask?" +other
```
````

### showlink-waiting-shots (pass)

**Chris:** What are you waiting on me for with this? (What you just looked up: the site refresh card needs your pick of before and after shots for the progress page, https://www.yuigui.com/progress. Old hero: one headline, three buttons. New hero: a bigger headline, one button. Shots on file: /demo/site_before_hero.jpg and /demo/site_after_hero.jpg.)

Good: The two shots in a compare, or a sketch with after, plus the one thing needed. Not a card that only says Open.

````
Your pick: these hero shots for the progress page. Old hero has one headline and three buttons; new has a bigger headline and one button.
```yui
compare /demo/site_before_hero.jpg /demo/site_after_hero.jpg "Hero: before and after"
choose "Progress page hero shots: use these?" "Use both"|"Retake after shot"|"Skip shots" +other
```
````

### showlink-only-url (pass)

**Chris:** Where is the new hero? (What you just looked up: it is live on the site, https://www.yuigui.com/progress, in the Site refresh entry. Old hero: one headline and three buttons. New hero: a bigger headline and one button.)

Good: The change drawn: a sketch with before and after. At most one small link card under it.

````
Live on yuigui.com/progress, in the Site refresh entry.
```yui
sketch "Hero" frame=phone before=Old
row "One headline" +x
row "Button  ·  Button  ·  Button" +button +x note="three buttons"
after New
row "Bigger headline" +hi note="larger type"
row "One button" +button +hi note="single action"
card "Site refresh" body="On the progress page" cta="Open" url=https://www.yuigui.com/progress
```
````

### showlink-build-changes (pass)

**Chris:** What changed in the last build? (What you just looked up: build 332 opens a notification on page one, the mic stays on the last page, and a reply quotes the screen. Full notes: https://www.yuigui.com/progress)

Good: The three changes shown here (a list, timeline or sketch). The link, if any, is a small follow-up.

````
Build 332: three fixes.
```yui
sketch "Build 332" frame=phone
row "Notification tap: opens page one" +hi note="lands at the start"
row "Mic: stays on last page" +button +hi note="no jump back"
row "Reply: quotes the screen" +hi note="context kept"
card "Full notes" body="Every change, build by build" cta="Open" url=https://www.yuigui.com/progress
```
````

### showlink-demo-page (pass)

**Chris:** Is there a demo of the compare card? (What you just looked up: yes, https://www.yuigui.com/playground?demo=show-here. It shows a slider between a before and an after shot, with Side and Toggle modes. Shots: /demo/before_room.jpg and /demo/after_room.jpg.)

Good: The demo itself: a compare of the two shots. Not a card that only links to the playground.

````
Yes: slider between before and after, with Side and Toggle modes.
```yui
compare /demo/before_room.jpg /demo/after_room.jpg "Room: before and after"
card "Compare demo" body="Slider, Side and Toggle modes" cta="Open playground" url=https://www.yuigui.com/playground?demo=show-here
```
````

### showlean-waiting (pass)

**Chris:** What are you waiting on me for with this? (What you just looked up: the site refresh card is done except before and after shots of the hero for the progress page. Page: https://www.yuigui.com/progress. Nothing else is open.)

Good: The ask drawn here (a sketch with the missing before and after slot, or a camera to snap it). At most a small link under it.

````
Just one thing: the hero before and after shots for the progress page.

```yui
sketch "Site refresh" frame=window
row "Refresh: done"
row "Hero before/after shots: open" +hi note="progress page"
row "Everything else: clear"
choose "Hero shots for progress page: who makes them?" "You render them"|"I'll send them"|"Skip the shots" +other
```
````

### showlean-new-hero (pass)

**Chris:** What does the new hero look like? (What you just looked up: it is on https://www.yuigui.com, top of the page. It has a bigger headline and one button, Get Yui, where there were three buttons.)

Good: The hero drawn in a sketch phone, before and after. At most a small link under it.

````
Hero: bigger headline, one button.
```yui
sketch "yuigui.com hero" frame=phone before=Then
row "Headline" note="smaller"
row "Button  ·  Button  ·  Button" +button +x note="three buttons"
after Now
row "Headline" +hi note="bigger"
row "Get Yui" +button +hi note="the one button"
```
````

### showpick-four-looks (pass)

**Chris:** Show me the four looks again. (What you just looked up: the demo page is https://www.yuigui.com/playground?demo=shader-look. The four dark shots are already on disk: /Users/urzas/.hermes/kanban/artifacts/t_b8ab6ac3/1-currents-dark.png, 2-terrain-dark.png, 3-dots-dark.png, 4-type-dark.png, same folder.)

Good: A gallery of the four shots with +pick, so the choice is on the phone. A site link only as a small button under it, never alone.

````
Four hero looks, dark mode. Tap one to pick.
```yui
gallery /Users/urzas/.hermes/kanban/artifacts/t_b8ab6ac3/1-currents-dark.png /Users/urzas/.hermes/kanban/artifacts/t_b8ab6ac3/2-terrain-dark.png /Users/urzas/.hermes/kanban/artifacts/t_b8ab6ac3/3-dots-dark.png /Users/urzas/.hermes/kanban/artifacts/t_b8ab6ac3/4-type-dark.png +pick
```
````

### showpick-two-looks (pass)

**Chris:** Show me the two card styles again so I can pick. (What you just looked up: playground demo https://www.yuigui.com/playground?demo=card-style. Shots: /demo/s1.jpg Soft, /demo/s2.jpg Sharp.)

Good: A gallery or compare of the two shots with the pick right there. Not a card that only opens the playground.

````
Two card styles: Soft or Sharp.
```yui
gallery /demo/s1.jpg /demo/s2.jpg +pick
```
````

### showpick-only-url (pass)

**Chris:** Show me again. (What you just looked up: it is the shader look demo, https://www.yuigui.com/playground?demo=shader-look. Its shots are at /Users/urzas/.hermes/kanban/artifacts/t_b8ab6ac3/ as 1-currents-dark.png, 2-terrain-dark.png, 3-dots-dark.png, 4-type-dark.png.)

Good: The four shots as a gallery with +pick (or a choose beside them). The playground link only as a small extra, never the whole answer.

````
Four hero looks; tap one to pick.
```yui
gallery /Users/urzas/.hermes/kanban/artifacts/t_b8ab6ac3/1-currents-dark.png /Users/urzas/.hermes/kanban/artifacts/t_b8ab6ac3/2-terrain-dark.png /Users/urzas/.hermes/kanban/artifacts/t_b8ab6ac3/3-dots-dark.png /Users/urzas/.hermes/kanban/artifacts/t_b8ab6ac3/4-type-dark.png +pick
card "Shader look demo" body="Live versions, all four" cta="Open" url=https://www.yuigui.com/playground?demo=shader-look
```
````

### vis-status-board (pass)

**Chris:** Is everything up to date? (What you just looked up: the site deploy is green and live. The board has 3 cards running and 2 blocked on a pick from Chris. Build 392 is the newest on TestFlight and his phone is on it. No cron failed today.)

Good: One short line at most, then one `sketch frame=window`: Label: verdict rows (Site: live, Board: 2 need your pick +hi, Build: 392 newest, Crons: clean). No paragraph, no second bubble (VIS-1).

````
Mostly. Two cards need your pick.
```yui
sketch "Status" frame=window
row "Site deploy: green, live"
row "Board: 3 running"
row "Board: 2 blocked" +hi note="your pick"
row "TestFlight: build 392, on your phone"
row "Crons: no failures today"
```
````

### vis-what-did-you-fix (pass)

**Chris:** What did you fix? (What you just did: the left drawer kept a finished card under Now because one card with badly saved text crashed every refresh. You fixed the crash. A new card makes closed cards leave the drawer within seconds; it is on the board, not built.)

Good: One line, then a before and after `sketch` (drawer showed the done card under Now, now it is gone) with the new card as a `+hi` row. No fix report in prose (VIS-1).

````
Drawer crash fixed; auto-clear card queued.
```yui
sketch "Left drawer" frame=phone before=Then
row "Finished card · Now" +x note="stuck"
row "One card's bad saved text" +x note="crashed every refresh"
after Now
row "Finished card gone" +hi note="fixed"
row "Closed cards leave in seconds" note="on the board, not built"
```
````

### vis-you-misread-me (pass)

**Chris:** No. You misread me. I meant the left drawer, not TestFlight. (What you found: the drawer still lists a finished card under Now.)

Good: One short line owning it, then a `sketch` of the left drawer with the stale row struck out. No apology paragraph, no restating what he said (VIS-1).

````
Left drawer: finished card stuck under Now.
```yui
sketch "Left drawer" frame=phone
row "Now" +hi
row "Finished card" +x note="done, still listed"
row "Backlog"
row "Waiting on you"
choose "Stuck drawer card: next?" "Clear it now"|"Find the cause"|"Both" +other
```
````

### vis-put-a-card-in (FAIL)

**Chris:** Put a card in for a daily morning release instead of ad hoc builds. (What you just did: created the card, parked in the backlog under the release lane, first in the queue. It has not been started.)

Good: One line: it is on the board, first in the queue. Then one drawing of the card in its place (a `sketch` of the queue with the new row `+hi`, or a `timeline`). No paragraph about what the card will do (VIS-1).

- one line: no drawing (sketch, shapes, diagram, mock, timeline, map, chart or stat) carries the answer

````
Card's in: daily morning release, first in the release lane.
```yui
list "Daily morning release" "Replaces: ad hoc builds" "Where: backlog, release lane" "Queue: first up" "Status: not started"
menu backlog@morning-release "Daily morning release" sub="parked, first up"
```
````

### vis-no-filler-briefing (pass)

**Chris:** What shipped overnight? (What you just looked up: build 392 reached TestFlight at 6:12 am with the drawer fix and the one-build-a-day guard. The site deploy of the progress page is live. Two cards are still blocked on a pick from Chris: the tuner and the onboarding copy.)

Good: A line of nouns and verdicts (no so, now, however, intro), then one sketch: Build 392: on TestFlight, Drawer fix: shipped, Progress page: live, Tuner and onboarding copy: need your pick +hi. No 'a few things', no paragraph (VIS-1, caveman).

````
Build 392 and the progress page shipped. Two cards are waiting on you.
```yui
sketch "Overnight" frame=window
row "Build 392: on TestFlight" note="6:12 am"
row "Drawer fix: shipped" note="in 392"
row "One-build-a-day guard: shipped" note="in 392"
row "Progress page: live" note="site deploy"
row "Tuner: blocked" +hi note="needs your pick"
row "Onboarding copy: blocked" +hi note="needs your pick"
```
````

### vis-three-ideas-one-page (pass)

**Chris:** How will you stop the text slides? (What you did: three changes. The plugin rewrites any reply over 30 words before it sends. The channel guide now says one line and a drawing. The eval fails a reply with more than one text bubble.)

Good: One line, then ONE drawing that holds all three ideas (a sketch with three rows, or a shapes chain of three), not three pages and not a paragraph each. No deck of one page per idea (VIS-1, Chris: up to 3 ideas on a card as long as we show them).

````
Three gates: the guide prevents it, the plugin catches it, the eval flags what slips through.
```yui
motion "Three gates stop text slides. Gate 1, the channel guide: every reply is one line of 30 words or fewer, then a drawing. Gate 2, the plugin: any reply over 30 words is rewritten into one line and a picture before it sends. Gate 3, the eval: a reply with more than one text bubble fails the test. Result: one bubble and a drawing, no Read as pages."
```
````

### draw-how-flow (pass)

**Chris:** How does a card get from my ask to a shipped build? (What you know: I ask, you place it on the board, a lane builds it, checks run, it rides the 6 am release.)

Good: One short line, then a `diagram` (flowchart, LR or TD) with you, board, lane, checks, release. Mermaid labels a word or two. No paragraph, no list of steps.

````
Ask to build: five stops, failed checks loop back.
```yui
diagram "Ask to shipped build" caption="You ask, it lands on the board, a lane builds it, checks gate it, the 6 am release ships it."
flowchart LR
  ask([Your ask]) --> board[Board card]
  board --> lane[Lane builds]
  lane --> checks{Checks pass?}
  checks -->|no| lane
  checks -->|yes| release[6 am release]
  release --> shipped([On your phone])
end
```
````

### draw-how-sequence (pass)

**Chris:** How does a tap on a button reach the agent and come back? (What you know: the phone sends an event to the relay, the relay hands it to the agent, the agent answers with a screen, the phone draws it.)

Good: One line, then a `diagram` as a sequenceDiagram: Phone, Relay, Agent, with the event going out and the screen coming back. No text steps.

````
Tap to screen: four hops, one round trip.
```yui
diagram "A tap's round trip" caption="Tap goes up as an event, the answer comes back as Yui Lines."
sequenceDiagram
  participant P as Phone
  participant R as Relay
  participant A as Agent
  P->>R: tap event
  R->>A: [yui] n1 choose
  A->>R: yui screen
  R->>P: screen
  P->>P: draws it
end
choose "Go deeper on?" "Event format"|"Relay hand-off"|"Patches vs new screen" +other
```
````

### draw-show-screen (pass)

**Chris:** Show me the new sign-in screen. (What you know: a nav bar titled Sign in, an email field, a password field, a Sign in button, and a small Forgot password link under it.)

Good: One line, then a `mock` (frame=phone) with nav, two fields, a button and a small text row. No description of the screen in words.

````
Sign in: email, password, button, forgot link.
```yui
mock "Sign in" frame=phone
part nav "Sign in"
part field Email ph="you@example.com"
part field Password ph="••••••••"
part button "Sign in" +hi
part row "Forgot password?"
```
````

### draw-what-checkout-looks (pass)

**Chris:** What does the checkout look like? (What you are proposing: order summary card, total row, a card field, a big Pay button, and a Back link.)

Good: One line, then a `mock` of the checkout from parts: card, row with value, field, button +hi. Not a sketch, not a paragraph.

````
Checkout: summary, total, card, Pay.
```yui
mock "Checkout" frame=phone
part nav Checkout back=Back
part card "Order summary" body="2 items · Shipping included"
part row Total value="$42"
part field Card ph="1234 5678 9012 3456"
part button Pay +hi
```
```yui
choose "Checkout layout: build it?" Build|"Move Total under Pay"|+other
```
````

### table-coach-asked-twice (pass)

**Chris:** Swap the goblet squats today, same swap as last time.

Good: One line. Reads the saved swap with `query variations ...` (a read, no screen) instead of asking which move to use, then puts it in the session on the next turn.

````
```yui
query variations where=Move="Goblet squat" cols=Swap
```
````

### motion-concept (pass)

**Chris:** How does a heart pump blood?

Good: One line, then one `motion` line whose ask carries the facts (two sides, valves, the path). No scenes, no code, no deck.

````
Two pumps side by side: the right sends blood to the lungs, the left sends it to the body, and valves keep it moving one way.
```yui
motion "Heart as two pumps. Oxygen-poor blue blood from the body fills the right atrium, drops through a valve into the right ventricle, which squeezes it to the lungs. Lungs turn it red with oxygen; it returns to the left atrium, then the left ventricle, the strongest chamber, squeezes it out the aorta to the body. Valves snap shut behind each squeeze so nothing flows back. About 70 beats a minute, roughly 5 liters pumped per minute."
```
````

### motion-work-change (pass)

**Chris:** What did you change on the settings screen? (What you did: moved Log out to the bottom, added Dark mode above it, removed the Help row, left Notifications where it was.)

Good: One line, then a `motion` whose ask names every change and where it went. Not a sketch, not a paragraph.

````
Settings: three moves, Notifications untouched.
```yui
motion "Settings screen change. Notifications stays at the top, unchanged. The Help row fades out and is removed. Log out slides down to the bottom of the list. Dark mode appears as a new toggle row just above Log out."
```
````

### motion-how-connect (FAIL)

**Chris:** How do the app, the plugin and the backend connect? (What you know: the phone app polls the backend, the Hermes plugin writes agent replies to the backend, taps come back the same way.)

Good: One line, then a `motion` with the parts and the direction each message travels. Not a deck of pages.

- preset: diagram not in [motion say choose ask card stat sketch row after timeline done now next shapes shape chart end pick]
- need: none of [motion]

````
Backend in the middle; app and plugin never talk directly.
```yui
diagram "App, backend, plugin" caption="The plugin writes replies to the backend, the app polls them, and taps travel back the same road."
sequenceDiagram
  participant P as Hermes plugin
  participant B as Backend
  participant A as Phone app
  P->>B: Write reply
  A->>B: Poll
  B-->>A: New reply
  A->>B: Send tap
  P->>B: Read tap
  B-->>P: Tap event
end
```
````

### motion-bug-fix (pass)

**Chris:** What was wrong with the drawer? (What happened: one card with badly saved text crashed every refresh, so a finished card stayed under Now. Fixed: the refresh skips a bad card and the finished card leaves.)

Good: One line, then the bug and its fix drawn: a `motion` with the facts (or a `sketch` before/after). Not paragraphs.

````
One bad card crashed every refresh; fixed.
```yui
motion "Drawer bug and fix. Before: the drawer refreshes its cards, hits one card with badly saved text, and the refresh crashes, so a finished card stays stuck under Now. After: the refresh skips the bad card, keeps going, and the finished card leaves Now."
```
````

### motion-plain-fact (pass)

**Chris:** What build am I on?

Good: One line or one card with the build. A plain fact is no film.

````
I can't see your phone's build from here. In TestFlight, tap Yui; the build number is under the app name.
````

### motion-status-line (pass)

**Chris:** Is the board up to date?

Good: One line or a `Label: verdict` sketch. A status is no film.

````
I can't see your board from here; no task board is connected to this thread.
```yui
choose "Which board?" "Yui backlog"|"Site board"|"Training plan" +other
```
````

### motion-with-quiz (pass)

**Chris:** Teach me how a heart pumps blood, then quiz me.

Good: One line, a `motion` with the facts, then one `choose` for the quiz question right after it. No scenes.

````
Two pumps side by side: right side to the lungs, left side to the body.

```yui
motion "How the heart pumps: oxygen-poor blood from the body enters the right atrium, drops into the right ventricle, which pumps it to the lungs. Oxygen-rich blood returns to the left atrium, drops into the left ventricle, the thickest wall, which pumps it out the aorta to the body. Valves snap shut behind each push, making the lub-dub sound. About 70 beats and 5 liters a minute."
choose "Quiz 1 of 3: which chamber pumps blood out to the body?" "Left ventricle"|"Right ventricle"|"Right atrium"|"Left atrium"
```
````

### motion-old-phone (FAIL)

**Chris:** How does a heart pump blood?

Good: The agent may send a `motion`; a phone that cannot play it gets the ask as a sketch. The reply must still leave a picture.

- app build: the yui plugin did not run (/private/tmp/yui/hermes-plugin/yui): spawnSync python3 ENOENT
- need: none of [sketch say card stat timeline shapes]

````
Two pumps side by side: the right sends blood to the lungs, the left sends it to the body.
```yui
motion "Heart as two pumps. Blue, oxygen-poor blood enters the right atrium, drops through a valve into the right ventricle, which squeezes it out to the lungs. Lungs turn it red with oxygen; it returns to the left atrium, then the left ventricle, the thickest wall, squeezes it out the aorta to the body. Valves snap shut behind each squeeze so blood only moves forward: that's the lub-dub. About 70 beats a minute."
```
````
