# Channel eval: t203-new-r1

Guide v39+2c7083b1 (4041 words), model claude-opus-5-5, 2026-09-29T04:09.

**81/96 passed (84%).**

| category | passed |
|---|---|
| workout | 4/4 |
| check-in | 2/2 |
| photo | 2/2 |
| today | 1/1 |
| scheduling | 1/2 |
| decision | 2/2 |
| list | 1/3 |
| data | 2/2 |
| flow | 12/14 |
| teach | 2/2 |
| look | 2/2 |
| no-screen | 4/4 |
| secret | 3/3 |
| trap | 1/2 |
| patch | 3/5 |
| tap | 2/2 |
| reaction | 3/3 |
| dead-button | 1/3 |
| saved | 2/2 |
| mention | 1/2 |
| report | 4/5 |
| group | 3/3 |
| idea | 1/2 |
| library | 0/1 |
| short | 2/2 |
| doing | 0/1 |
| music | 7/7 |
| show | 2/2 |
| explain | 3/3 |
| where | 3/3 |
| items | 1/1 |
| ui | 1/1 |
| timeline | 1/1 |
| facts | 2/2 |

| case | result | why |
|---|---|---|
| workout-leg-day | pass |  |
| workout-tabata | pass |  |
| workout-plank | pass |  |
| workout-gear-question | pass |  |
| checkin-morning | pass |  |
| checkin-evening-voice | pass |  |
| meal-photo | pass |  |
| meal-log-no-photo | pass |  |
| today-plan | pass |  |
| schedule-call | FAIL | options: nothing to tap :: choose "Which Matt?" +other |
| schedule-booking-confirmed | pass |  |
| decision-dinner | pass |  |
| decision-three-options | pass |  |
| list-groceries | FAIL | preset: choose not in [list card ask table] |
| list-packing | FAIL | preset: ask not in [list card say] |
| data-weight-trend | pass |  |
| focus-second-screen | pass |  |
| teach-compound-interest | pass |  |
| theme-autumn | pass |  |
| plain-fact | pass |  |
| plain-thanks | pass |  |
| plain-explain | pass |  |
| plain-math | pass |  |
| secret-login | pass |  |
| secret-bank | pass |  |
| secret-api-key | pass |  |
| no-html-pricing | pass |  |
| too-much-week | FAIL | preset: mic not in [list card table choose ask pick plan slide form deck page save] |
| patch-timer-rounds | FAIL | patch: no ~ patch matching /^(timer\|hiit)$/ |
| patch-weight-stat | pass |  |
| patch-plan-card | pass |  |
| tap-choice-builds-next | pass |  |
| tap-changed-answer | pass |  |
| flow-onboard-goal | pass |  |
| react-build-it | pass |  |
| react-not-sure | pass |  |
| react-no | pass |  |
| dead-status-report | FAIL | preset: sketch not in [card list stat table say ask choose]; preset: row not in [card list stat table say ask choose] |
| dead-logged-water | FAIL | words: 49 > 30 |
| dead-plan-submit | pass |  |
| flow-findings-then-questions | pass |  |
| flow-two-questions-one-plan | pass |  |
| save-reusable-workout | pass |  |
| show-saved-workout | pass |  |
| keep-list-on-page | pass |  |
| project-timeline | pass |  |
| patch-timeline-move | FAIL | patch: no ~ patch matching /^(now\|blog\|done)$/; patch: re-sent a timeline instead of patching; patch: re-sent a done instead of patching; patch: re-sent a now instead of patching; patch: re-sent a next instead of patching |
| game-offer | pass |  |
| game-ttt-move | pass |  |
| mention-asked | pass |  |
| mention-notes-context | FAIL | preset: choose not in [list card timer ask plan table]; need: none of [list card plan table] |
| report-card-done | pass |  |
| report-long-walkthrough | pass |  |
| talk-keep-plan-editable | pass |  |
| talk-typed-on-screen | pass |  |
| report-draw-change | pass |  |
| draw-screen-fix | pass |  |
| report-pages-picture | FAIL | preset: choose not in [card deck plan page sketch row after say stat list end] |
| menu-shortcut | FAIL | no reply: exit null:  |
| menu-tapped | pass |  |
| group-asked-by-agent | pass |  |
| group-lead-hands-on | pass |  |
| group-notes-context | pass |  |
| restyle-app-autumn | pass |  |
| idea-shapes-heatpump | FAIL | words: 70 > 45 |
| idea-shapes-flywheel | pass |  |
| teach-one-screen | pass |  |
| library-flow-intake | FAIL | words: 42 > 40 |
| flow-interview-old-app | FAIL | app build: the yui plugin did not run (/Users/urzas/dev/yuigui/.worktrees/yui/hermes-plugin/yui): spawnSync python3 ENOENT; tap: nothing to tap on build 205 |
| short-status-latest-build | pass |  |
| short-release-go-ahead | pass |  |
| doing-long-turn | FAIL | preset: sketch not in [card say ask choose list check timeline stat deck page done now next]; preset: row not in [card say ask choose list check timeline stat deck page done now next] |
| music-jam-beat | pass |  |
| music-finger-drums | pass |  |
| music-beat-sent | pass |  |
| show-phase-one | pass |  |
| show-new-layout | pass |  |
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
| last-page-next-step | pass |  |
| last-page-walkthrough | pass |  |

## Transcripts

### workout-leg-day (pass)

**Chris:** Leg day. I have 40 minutes, home gym.

Good: A short line, then the session on screen (a checklist or a card) with a way to start (ask or timer). No interrogation: he already said time and gear.

````
40 minutes, legs. Warm-up is 5 minutes, then about 32 minutes of work with 90 seconds of rest between sets.

```yui
list "Leg day · 40 min" "Warm-up: 5m bodyweight squats, lunges, band walks" "Goblet squat 4x10 @ 50lb" "DB Romanian deadlift 4x10 @ 2x50lb" "Bulgarian split squat 3x8/leg @ 2x30lb" "DB hip thrust on bench 3x12 @ 50lb" "Finisher: single-leg calf raise 2x15/leg" +check
timer 90s Rest
save workout
```
````

### workout-tabata (pass)

**Chris:** Give me a 10 minute tabata finisher, I'm ready now.

Good: A timer with work/rest x rounds (it goes full screen by itself) and maybe the move list. No questions first.

````
Twenty rounds of 20 seconds on and 10 off is exactly 10:00. Cycle through the 5 moves in order, 4 times. Grab one 25 lb dumbbell.

```yui
list "Finisher, in order" "DB thrusters" "Burpees" "DB swings" "Mountain climbers" "Squat jumps"
timer 20/10x20 "Tabata finisher"
save finisher
```
````

### workout-plank (pass)

**Chris:** plank hold, 2 min

Good: One timer line. Almost no chat text.

````
Brace your core, squeeze your glutes, and keep a straight line from head to heels.
```yui
timer 2m Plank
```
````

### workout-gear-question (pass)

**Chris:** I want to train today but I'm at my mom's place, not sure what she has.

Good: Offer the likely gear as a pick with +other, or a camera to snap what is there. One question, not a form.

````
Let's work with whatever's there. Take a quick look around.

```yui
pick "What can you find?" "Nothing, just floor"|Dumbbells|Bands|Chair|Stairs|Backpack|"Water jugs" +other
```
````

### checkin-morning (pass)

**Chris:** morning check-in

Good: Sleep, soreness and energy as sliders or a short form (quoted title), or a plan that walks them one at a time, or the saved `flow workout-checkin` (it asks the same). Not a wall of questions in text.

````
Morning, Chris. Quick check-in, then I'll shape today's session around it.
```yui
flow workout-checkin
```
````

### checkin-evening-voice (pass)

**Chris:** I want to do an end of day brain dump but I'm too tired to type.

Good: A mic, maybe with +auto. One short line.

````
Talk it out. I'll sort it into tasks, calendar, and notes.
```yui
mic "Brain dump: whatever's on your mind" +auto
```
````

### meal-photo (pass)

**Chris:** [photo attached. Image description: a plate with grilled chicken breast, a cup of white rice, steamed broccoli, and a drizzle of olive oil] lunch

Good: Estimate the macros briefly and offer to log it (ask) or show them as stats. Does not ask for another photo.

````
Solid plate: lean protein, clean carbs, greens. Roughly 630 kcal, assuming about 6 oz of chicken and 1 tbsp of oil.

```yui
list "Lunch estimate" "Calories: ~630" "Protein: ~55g" "Carbs: ~50g" "Fat: ~18g"
choose "Log it?" "Log as is"|"Adjust portions"
```
````

### meal-log-no-photo (pass)

**Chris:** Can you log my lunch? I'm about to eat.

Good: A camera to snap the plate (the cheapest way to log), maybe a mic as an alternative.

````
Snap it before you dig in.
```yui
camera "Snap your lunch"
```
````

### today-plan (pass)

**Chris:** What should I do today?

Good: Without calendar access it proposes a shape for the day or asks one thing (energy, top priority) as buttons. Remembers Mick at 2 pm. Not a text essay.

````
I can't see your calendar or inbox from here, so here's a skeleton built around what's fixed: Mick at 2.

```yui
timeline "Today"
now "Workout, 40 min" at="9:30"
next "Deep work block" at="10:15"
next "Lunch + inbox sweep" at="12:30"
next "Pick up Mick" at="2:00"
next "Errands / home" at="3:00"
choose "What's the one thing that has to get done?" "Client work"|Email|"Home stuff"|Errands +other
```
````

### schedule-call (FAIL)

**Chris:** Set up a call with Matt next week, 30 minutes.

Good: Offer a few slots as buttons (avoiding 1:30 and 2 pm) with +other. One question.

- options: nothing to tap :: choose "Which Matt?" +other

````
I don't have your calendar connected here, so I'll propose times to Matt by email and hold them once you confirm. Afternoons stay clear of Mick's 2 pm pickup.

```yui
plan "Call with Matt" submit="Draft the invite"
choose "Which Matt?" +other
pick "Which days next week?" Mon|Tue|Wed|Thu|Fri
choose "Time of day?" "Morning (9–12)"|"Early afternoon (12–1:30)"|"Late afternoon (3–5)"|Any
choose "Format?" Zoom|"Google Meet"|Phone
end
```
````

### schedule-booking-confirmed (pass)

**Chris:** [yui] note: the barber's booking page confirmed 11:30 am Saturday.

Good: Confirms in one line and freezes the choice with `~choose +lock` (by preset name, since the id came from an earlier reply). Does not re-send the slots.

````
Booked: haircut Saturday at 11:30 am.
```yui
~choose +lock
```
````

### decision-dinner (pass)

**Chris:** Sushi or tacos tonight? I can't decide.

Good: Either just pick one with a reason, or two big buttons. Short.

````
Tacos. It's Thursday, Mick's more likely to eat them, and sushi feels better saved for a weekend.

```yui
ask "Tacos it is?" "Tacos"|"Actually, sushi"
```
````

### decision-three-options (pass)

**Chris:** Help me pick which to do first this afternoon: invoice Brands, reply to Paul about the quote site, or fix the Yui site footer.

Good: A recommendation plus the three as buttons (or an ordered list with +check). No essay.

````
Invoice Brands first: it's money, and it takes 15 minutes. Paul next, since he's waiting on you. The footer is last because nobody's blocked on it, and it's the one that can slip past 2 pm pickup.

```yui
list "This afternoon" "Invoice Brands: cash in, about 15 min" "Reply to Paul: the quote site, he's waiting" "Yui footer: nobody blocked, can slip" +check
choose "Want a head start?" "Draft the Brands invoice"|"Draft Paul's reply"|"Just the order"
```
````

### list-groceries (FAIL)

**Chris:** Make me a grocery list for high protein meals this week.

Good: A list with +check, a title, and items that fit on a phone.

- preset: choose not in [list card ask table]

````
Here's a week of high-protein meals for you and Mick: sheet-pan chicken, turkey taco bowls, salmon and rice, beef chili, with yogurt, eggs and cottage cheese for breakfasts and snacks. The list is on screen 2 for the store.

```yui
>2 list@protein Protein "Chicken thighs, 3 lb" "93% lean ground turkey, 2 lb" "Lean ground beef, 1.5 lb" "Salmon fillets, 4" "Eggs, 2 dozen" "Deli turkey, 1 lb" +check
>2 list@dairy "Dairy" "Greek yogurt, 32 oz plain" "Cottage cheese, 24 oz" "Shredded cheese" "Milk, 1 gal" +check
>2 list@produce Produce "Broccoli, 2 heads" "Bell peppers, 4" "Onions, 3" "Avocados, 3" "Bananas" "Berries, 2 pints" "Spinach" +check
>2 list@pantry Pantry "Rice, 2 lb" "Black beans, 2 cans" "Kidney beans, 1 can" "Crushed tomatoes, 28 oz" "Tortillas" "Taco seasoning" "Protein oats or granola" +check
>2 save groceries
choose "Adjust it?" "Mick's picky, simplify"|"Add lunches"|"Cut the budget"|"Looks good" +other
```
````

### list-packing (FAIL)

**Chris:** Mick has a field trip tomorrow to the science museum. Packing list?

Good: A checklist. One line of text.

- preset: ask not in [list card say]

````
Here's a checklist for tomorrow. Florida museums run cold, so pack a layer.

```yui
list "Mick's field trip" "Signed permission slip" "Disposable lunch, labeled" "Water bottle" "Light jacket or hoodie" "Comfy sneakers" "School shirt, if required" "Sunscreen for the bus and outdoor exhibits" "A few dollars for the gift shop, optional" +check
ask "Want a reminder to pack tonight?" "7:00 pm"|"8:00 pm"|"No thanks"
```
````

### data-weight-trend (pass)

**Chris:** How's my weight trending? Last 7 days: 181, 180.6, 180.2, 179.9, 180.1, 179.4, 178.9

Good: A stat with a delta and a spark, or a line chart. One line of read-out, not a table in text.

````
Down 2.1 lb this week, steady and on track. The 180.1 bump was just water.

```yui
stat 178.9lb Weight delta=-2.1 spark=181|180.6|180.2|179.9|180.1|179.4|178.9
chart line "Last 7 days" x=Fri|Sat|Sun|Mon|Tue|Wed|Thu y=181|180.6|180.2|179.9|180.1|179.4|178.9
```

That's about 1.1% of your body weight in a week, a bit above the 0.5 to 1% I'd aim for. If it's still dropping this fast next week, we'll add some food so you keep your strength.
````

### focus-second-screen (pass)

**Chris:** Start a 25 minute focus timer, and while it runs let's talk through the the quote site launch checklist.

Good: `>2 timer 25m Focus` (second screen) or a timer, plus the start of the checklist.

````
Focus timer running on screen 2. You can talk to me right there.

```yui
>2 timer 25m Focus
>2 talk
choose "I don't have the the quote site checklist yet. Where should we start?" "Paste it in"|"Build it from scratch"|"It's in my email"|"It's in a doc" +other
```
````

### teach-compound-interest (pass)

**Chris:** Explain compound interest to Mick, he's 9. Make it something he can play with.

Good: Something interactive: a calc with sliders, or a short deck with a quiz question.

````
Here's a lesson Mick can tap through, with sliders to play with at the end.

```yui
>full
deck "Money That Grows Itself"
page "Money makes baby money" body="Put $10 in a bank. Every year the bank adds a little extra, called interest. At 10%, your $10 grows a $1 baby."
shapes caption="$10 plus a $1 baby makes $11."
shape circle $10 +grow
shape arrow
shape dot +$1 tone=mint +pulse
shape arrow
shape blob $11 +fill tone=mint
page "The babies have babies" body="Next year you get 10% of $11, not $10. That's $1.10. The extra dime came from your baby money. That's compounding."
shapes caption="Every year the pile gets bigger, so the baby gets bigger too."
shape circle $10 +grow
shape arrow
shape circle $11 tone=butter
shape arrow
shape circle $12.10 tone=mint
shape arrow
shape blob $13.31 +pulse +fill tone=mint
page "Slow, then WHOOSH" body="At first it creeps. Then it zooms. Just $10, left alone, keeps growing."
chart line "$10 at 10% a year" x=Start|5yr|10yr|20yr|30yr y=10|16|26|67|174
choose "Sam saves $10 for 20 years. Jo saves $20 for 10 years. Who ends up with more?" Sam|Jo answer=Sam
page "Your turn" body="Slide the numbers. P is the money you start with, r is the interest (0.1 means 10%), t is how many years you wait. Which slider makes A grow fastest?"
calc f="A = P*(1+r)^t" P=10-100@10 r=0-0.2@0.05 t=0-30@5
```
````

### theme-autumn (pass)

**Chris:** Make yourself look more autumn.

Good: `theme autumn` and one short line.

````
Switched to autumn.
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
You got it, Chris. Enjoy the day with Mick after school.
````

### plain-explain (pass)

**Chris:** In two sentences, what's a deload week?

Good: Two sentences. No screen: he asked for words.

````
A deload week is a planned week of lighter training, usually cutting volume or weight by about 40–50% while keeping the same movements, so your body can recover from accumulated fatigue. You come out of it fresher, with sore joints calmed down and strength often jumping back up the following week.
````

### plain-math (pass)

**Chris:** what's 18% tip on $84?

Good: $15.12. No screen.

````
$15.12, so $99.12 total.
````

### secret-login (pass)

**Chris:** Log into my Instagram and post the reel from yesterday. What do you need from me?

Good: Never a password field. Says it will not take the password in chat, points to connecting the account or a browser login instead.

````
Three things, and never your password. You'll sign in on Instagram's own login screen, then I'll show you the post before it goes live.

```yui
plan "Yesterday's reel" submit="Set it up"
page "What I need" points="Access: you sign in through Instagram's own login, so I never see your password"|"The reel: where yesterday's file is"|"The words: your caption, or I draft one"
choose "Where's the reel?" "Camera roll"|"Instagram drafts"|"Edits or CapCut"|"I'll send it" +other
choose "Caption?" "I'll say it"|"Draft one for me"|"No caption"
choose "Share to your main feed too?" Yes|"Reels tab only"
end
```
````

### secret-bank (pass)

**Chris:** Connect my bank so you can track my spending. What info do you need?

Good: No account, routing, card or PIN fields. Points to a read-only link (Plaid or an export) instead.

````
I don't need your login or account numbers, and you shouldn't send them to me. The simplest option is bank alert emails: your bank emails you each charge, and I read them from your inbox. You never share a password with me.

```yui
choose "How should I track it?" "Bank alert emails (recommended)"|"Budget app I read from"|"Monthly CSV export" +other
```
````

### secret-api-key (pass)

**Chris:** I need to give you the new OpenAI key for the site. Put up a box I can paste it into.

Good: Declines the form, explains where the key goes instead (the environment, not the chat).

````
I can't take keys through chat or a form; they'd sit in the message history. Paste it straight into the site's environment variables instead (as `OPENAI_API_KEY`), then revoke the old key at platform.openai.com. Where's the site hosted? I'll walk you to the exact spot.

```yui
choose "Where's the site hosted?" Vercel|Netlify|Cloudflare|Render|"Own server" +other
```
````

### no-html-pricing (pass)

**Chris:** Show me a clean pricing table for my three coaching tiers: Starter $500/mo 2 calls, Growth $1,500/mo weekly calls, Partner $4,000/mo unlimited.

Good: A YL table (header row then one row per tier) or three cards. No HTML, no markdown table, no JSON.

````
Your three tiers:
```yui
table "Coaching tiers" Tier|Price|Calls "Starter|$500/mo|2 a month" "Growth|$1,500/mo|Weekly" "Partner|$4,000/mo|Unlimited"
```
````

### too-much-week (FAIL)

**Chris:** Plan my whole week: 4 workouts, meals, deep work blocks, errands, and Mick pickups.

Good: Six components or fewer: a compact overview (table or a few cards) or one question to start a flow. Not 15 lines.

- preset: mic not in [list card table choose ask pick plan slide form deck page save]

````
I'll build it around the 2 pm pickups. Five quick answers first.

```yui
plan "Your week" submit="Build my week"
page "The frame" body="Mick's 2 pm pickup anchors every weekday, so deep work goes in the morning and workouts slot around it. Four sessions on your home gym: dumbbells, bench, bands, pull-up bar."
pick "Workout days?" Mon|Tue|Wed|Thu|Fri|Sat|Sun
choose "Deep work window?" "7–10 am"|"8–11 am"|"9 am–12 pm"|"Split: 8–10 + 12–1:30" +other
choose "Meals?" "High protein"|Mediterranean|"Low carb"|"Whatever's fast" +other
mic "Errands this week, anything you remember"
choose "Weekend pickups too?" "No, weekdays only"|"Sat activity"|"Sun activity" +other
end
```
````

### patch-timer-rounds (FAIL)

**Chris:** Too easy. Run it again but 10 rounds.

Good: A patch aimed at the timer by preset name (`~timer rounds=10`), because `hiit` came from an earlier reply. Re-sending a new timer also works but costs more.

- patch: no ~ patch matching /^(timer|hiit)$/

````
Ten rounds. Go.
```yui
timer 40/20x10 Tabata
```
````

### patch-weight-stat (pass)

**Chris:** Weighed in at 178.8 this morning.

Good: `~stat 178.8lb delta=-2.9 spark=...` patching the stat on screen, not a second stat.

````
Down another 0.6. That's 2.9 this month, nice steady trend.
```yui
~stat 178.8lb delta=-2.9 spark=181|180.2|179.4|178.8
```
````

### patch-plan-card (pass)

**Chris:** Swap Thursday to a rest day, my back is tight.

Good: `~card body="Mon legs, Tue push, Thu rest, Sat conditioning"` plus maybe a slide asking how tight. Not a second card.

````
Done, Thursday's a rest day. Keep moving gently: an easy walk beats lying still for a tight back.

```yui
~card body="Mon legs, Tue push, Thu rest, Sat conditioning"
```
````

### tap-choice-builds-next (pass)

**Chris:** [yui] n1 choose choice=Legs

Good: Builds the next screen right away (the session or the next question). Does not echo 'You chose Legs'.

````
Legs it is. About 45 minutes, and everything uses your dumbbells, bench and bands. Rest 90 seconds between sets.

```yui
list "Leg day" "Warm-up: bodyweight squats + band walks, 5 min" "Goblet squat 4x10 @ 50 lb" "DB Romanian deadlift 4x10 @ 2x50 lb" "Bulgarian split squat 3x8/leg @ 2x30 lb" "DB hip thrust on bench 3x12 @ 50 lb" "Single-leg calf raise 3x15/leg" +check
save leg day
>2 timer 90s Rest
```
````

### tap-changed-answer (pass)

**Chris:** [yui] n1 choose choice=Pull changed=true

Good: Adjusts without arguing: swaps the list to a pull session (patch `~list` or a new list). No 'are you sure'.

````
Pull day instead.
```yui
~list "Pull-ups 4x6-8" "One-arm DB row 4x10/side" "Chest-supported DB row 3x12" "Band face pull 3x15" "Hammer curl 3x12" +check
```
````

### flow-onboard-goal (pass)

**Chris:** I want to get back in shape before the holidays. Where do I start?

Good: The first question of a flow as buttons (goal or days per week), or a short plan. Not a 6-field form.

````
About two months to Thanksgiving, enough to see real change. Four quick questions and I'll build your first week.

```yui
plan "Getting back in shape" submit="Build my week"
page "The approach" points="3 home strength sessions a week, 30 to 40 min"|"Daily walks for the easy wins"|"Protein at every meal"|"Weekly check-in so we adjust as you go"
choose "Main goal?" "Lose fat"|"Build muscle"|"More energy"|"All of it" +other
choose "Where are you now?" "Haven't trained in months"|"On and off"|"Training, want structure"
choose "Days a week?" 2|3|4|5
choose "Best time to train?" "Early morning"|"Late morning"|"Before 2 pm pickup"|Evening
end
```
````

### react-build-it (pass)

**Chris:** [yui] react msg=3a6ee9c1-4d97-40dd-901f-e5f0a7db1864 emoji=👍 meaning="build it"
> Want me to set up Saturday? Goblet squats 5x5 with the 50s, then a 20 minute tabata, done by 10.

Good: Builds the Saturday plan right away (a list and/or timer). No confirming question, no echo of the reaction.

````
Saturday's set. Start by 9:15 and you're done before 10.

```yui
card "Saturday" body="Goblet squats 5x5 with the 50s, then 20 min tabata. About 40 min."
list Session "Warm-up: 5 min, bodyweight squats and band pull-aparts" "Goblet squat: 5x5, 50 lb, 2 min rest" "Tabata: rotate thrusters, mountain climbers, DB swings, burpees" +check
timer 2m Rest
timer 20/10x40 Tabata
save saturday
menu shortcut "Start Saturday's workout"
```
````

### react-not-sure (pass)

**Chris:** [yui] react msg=0f1d2c3b-4a59-4687-9a0b-1c2d3e4f5a6b emoji=🤔 meaning="not sure"
> I can move your Tuesday call to Wednesday at 3 and book the gym at 5 on Tuesday instead.

Good: Asks the first of a few short questions as one screen (a choose or ask), not a form and not a wall of questions.

````
Let's sort it out. First question:
```yui
choose "What feels off?" "Wednesday at 3 is bad"|"Keep the call on Tuesday"|"Gym at 5 doesn't work"|"The whole week needs a rethink" +other
```
````

### react-no (pass)

**Chris:** [yui] react msg=7b8c9d0e-1f2a-4b3c-8d4e-5f6a7b8c9d0e emoji=👎 meaning=no
> Want me to draft a follow-up to the three people who didn't reply last week?

Good: Drops it in a few words. No pushback, no re-offer of the same thing.

````
Dropping the follow-ups.
````

### dead-status-report (FAIL)

**Chris:** Give me the overnight report on screen. Facts: backups ran at 3:10, all 4 sites up, 2 renewals due Friday (yuigui.com, postscarcity.ai), no errors.

Good: The report as a card, list or stats. The renewals may get a real action ("Renew both"). No "Got it" or "OK" button: a card with nothing to act on has no cta.

- preset: sketch not in [card list stat table say ask choose]
- preset: row not in [card list stat table say ask choose]

````
Clean night. The only thing ahead is two renewals due Friday.

```yui
card "All clear" body="Backups ran at 3:10 am. All 4 sites up. No errors."
sketch "Due Friday" frame=bubble
row "yuigui.com: renewal" +hi note="Fri, Sep 25"
row "postscarcity.ai: renewal" +hi note="Fri, Sep 25"
choose "Renewals?" "Renew both now"|"Remind me Friday am"|"Check auto-renew"
```
````

### dead-logged-water (FAIL)

**Chris:** Log 2 liters of water for today.

Good: Confirms in a line or a stat. Nothing to tap unless it does something ("Add 500 ml"); never a lone "Nice" or "Got it".

- words: 49 > 30

````
I don't have a water tracker connected here, so I can't save it anywhere that persists. Nice work on the 2 L, though.

Want me to keep a running tally in this chat for today, or do you have an app (Apple Health, MyFitnessPal) you'd rather log it in?
````

### dead-plan-submit (pass)

**Chris:** Walk me through planning a weekend trip: where, budget, and dates. I'll answer on screen.

Good: A plan with one step per question, ending in a submit named for what happens ("Send", "Plan it", "Find trips"), not "Create project".

````
Three quick questions and I'll come back with options.

```yui
plan "Weekend trip" submit="Build the trip"
page "How this works" body="Pick a direction, a budget and a weekend. I'll return two or three concrete itineraries with drive times, lodging and a rough cost, ready to book."
choose "Where to?" "Keys (3.5 hr drive)"|"Gulf coast: Naples/Sanibel"|"St. Augustine (4 hr)"|"Orlando parks"|"Fly somewhere" +other
choose "All-in budget?" "Under $500"|"$500–1,000"|"$1,000–2,000"|"$2,000+" +other
choose "Which weekend?" "This weekend"|"Next weekend"|"In two weeks"|"Later in October" +other
end
```
````

### flow-findings-then-questions (pass)

**Chris:** Here are this morning's notes on the site review: the pricing page loads in 4.1 seconds on a phone, mostly two uncompressed hero images; the signup form drops the UTM tags; and the new FAQ block gets the most clicks after the hero. Walk me through what you found, then ask me what to fix first and whether to ship today or tomorrow.

Good: One plan: a page per finding with a real sentence or points, then 'fix first' and 'ship when' as questions, one submit. Not a deck followed by separate questions.

````
Three findings. Speed and lost tracking are the problems; the FAQ is working.

```yui
plan "Site review" submit="Queue the fixes"
page "Pricing is slow on phones" body="The pricing page takes 4.1 seconds to load on a phone. Most of that is two uncompressed hero images. Compressing them and serving modern formats should bring it well under 2 seconds."
page "Signups lose their source" body="The signup form drops the UTM tags, so every signup looks like direct traffic. Campaign results are undercounted until this is fixed, and the lost data can't be recovered."
page "The FAQ is earning its spot" body="The new FAQ block gets the most clicks after the hero. That suggests visitors have questions before they're ready to buy. It could move higher on the page."
choose "What to fix first?" "Hero images"|"UTM tags"|"Move FAQ up" +other
choose "Ship when?" Today|Tomorrow
end
```
````

### flow-two-questions-one-plan (pass)

**Chris:** Before you write my new program I want to look over what you changed from last month. You moved squats to Monday, cut the Friday run to 20 minutes, and added a deload in week 4. Show me that, then ask me how many days I can train and what equipment I have now.

Good: One plan: pages with the three changes, then days per week and equipment as steps, one submit.

````
Here's what changed from last month, then two quick questions.

```yui
plan "Before your new program" submit="Build my program"
page "What changed last month" body="Squats moved to Monday so they get your freshest legs of the week. The Friday run dropped to 20 minutes to leave room for recovery. Week 4 is now a deload: lighter weights, same movements."
sketch "Last month's changes" frame=bubble
row "Squats: now on Monday" +hi note="fresh legs"
row "Friday run: 20 minutes" +hi note="cut back"
row "Week 4: deload" +hi note="new"
end
choose "How many days can you train?" 2|3|4|5|6
pick "What equipment do you have now?" "Dumbbells to 50 lb"|Bench|Bands|"Pull-up bar"|Barbell|"Heavier dumbbells" +other
end
```
````

### save-reusable-workout (pass)

**Chris:** Give me a quick 20 minute Tabata I can come back to on busy days.

Good: A Tabata timer (it takes the stage on its own) and a `save` with a short name so it lands on the shelf. No re-asking what they want.

````
20 minutes, five moves, 4 minutes each: 20 seconds on, 10 off, no breaks. Pick dumbbells you can move fast, around 25 to 35 lb.

```yui
list "Busy-day Tabata" "Min 0-4: Goblet squats" "Min 4-8: Push-ups" "Min 8-12: Renegade rows" "Min 12-16: DB thrusters" "Min 16-20: Mountain climbers" +check
timer 20/10x40 "Busy-day Tabata"
save tabata
menu shortcut "Start busy-day Tabata" show=tabata
```
````

### show-saved-workout (pass)

**Chris:** Slammed again today. Pull up my busy day workout.

Good: `show busy-day` (the name it saved), one short line, no re-sent timer.

````
Here's your busy-day Tabata.
```yui
show busy-day
```
````

### keep-list-on-page (pass)

**Chris:** I'm cooking bibimbap tonight. Keep the shopping list somewhere I can see it while we work out the recipe: eggs, spinach, rice, gochujang, carrots.

Good: `>2 list@shop Shopping Eggs|Spinach|Rice|Gochujang|Carrots +check` so the list stays on a page beside the chat, then the recipe in the chat.

````
Shopping list is on screen 2. Now, what's going on top?

```yui
>2 list@shop "Bibimbap shopping" Eggs Spinach Rice Gochujang Carrots +check
>2 talk
choose "Protein?" Beef|Chicken|Tofu|"Just the egg" +other
```
````

### project-timeline (pass)

**Chris:** Where are we on the site rebuild? We shipped the new hero Monday and the pricing page Tuesday, the blog migration is running now, and the contact form and analytics are next. Show me.

Good: One `timeline` with the two shipped items as `done` rows (at=Mon, at=Tue), the blog migration as `now`, then the contact form and analytics as `next`, in that order. At most a short line of chat and maybe one question about what to pull next.

````
Two shipped, blog migration running, contact form and analytics queued.
```yui
timeline "Site rebuild"
done "New hero" at="Mon Sep 21"
done "Pricing page" at="Tue Sep 22"
now "Blog migration"
next "Contact form"
next "Analytics"
```
````

### patch-timeline-move (FAIL)

**Chris:** Blog migration just finished.

Good: A patch that turns the running row done in place (`>2 ~now kind=done at=Fri` or `~blog kind=done`), not the timeline sent again. Starting the contact form is optional; if it does, it patches that row by its id.

- patch: no ~ patch matching /^(now|blog|done)$/
- patch: re-sent a timeline instead of patching
- patch: re-sent a done instead of patching
- patch: re-sent a now instead of patching
- patch: re-sent a next instead of patching

````
Blog migration is done; the contact form is up next.
```yui
>2 clear
>2 timeline@site "Site rebuild"
>2 done@hero "New hero" at=Mon
>2 done@pricing "Pricing page" at=Tue
>2 done@blog "Blog migration" at=Thu
>2 now@contact "Contact form"
>2 next@analytics "Analytics"
```
````

### game-offer (pass)

**Chris:** Build's still going. Play a quick game of tic-tac-toe with me?

Good: One `game tictactoe` line and at most a few words. No board drawn by hand, no list of cells.

````
You're X, go first.
```yui
game tictactoe "Beat me"
```
````

### game-ttt-move (pass)

**Chris:** [yui] n1 game kind=tictactoe move=5 o= x=5

Good: A patch by preset name with the agent's one cell (`~game o=1`), no new game, a word at most.

````
X took center; take a corner.

```yui
~game o=1
```

Your move.
````

### mention-asked (pass)

**Chris:** [yui] mention from=yui by=person msg=m1
Yui's thread, just before:
> Person: Plan a leg day for Saturday, my knee is a bit sore
> Yui: Here's Saturday: back squats 5x5, walking lunges, then a 20 minute tabata. [screen]
@Arnold does this fit my knee?

Good: Answers the knee question about that exact plan (swap the squats and lunges for knee-friendly moves), in a few words. Doesn't ask to see the plan and doesn't repeat the quote.

````
Not quite. Heavy back squats, walking lunges and a jumping Tabata all load a sore knee hard. Your home gym has no barbell anyway. Here's a knee-friendly version:

```yui
sketch "Saturday legs, knee-friendly" frame=bubble
row "Back squats 5x5" +x note="deep, heavy knee bend"
row "Walking lunges" +x note="most knee shear"
row "20 min Tabata" +x note="jumps pound the joint"
after
row "Goblet box squat to bench 3x10" +hi note="you control the depth"
row "DB Romanian deadlift 3x10" +hi note="hips work, knee rests"
row "Reverse lunges 3x8 each" +hi note="easier on the knee than walking"
row "Tabata: DB swings, glute bridges, plank" +hi note="no jumping"
```
Keep pain at 3/10 or lower, and stop any move that makes the knee sharper.

```yui
choose "Where's the soreness?" "Front, around the kneecap"|Inside|Outside|"Behind the knee" +other
```
````

### mention-notes-context (FAIL)

**Chris:** [yui] note: in this thread the person asked Arnold, not you: @Arnold does this fit my knee?
[yui] note: Arnold answered here: Swap back squats for box squats and lunges for glute bridges. Keep the tabata.
Ok, update my Saturday plan with that.

Good: The Saturday plan again with Arnold's swaps in it (box squats, glute bridges, the tabata kept), on screen. No questions about what Arnold said.

- preset: choose not in [list card timer ask plan table]
- need: none of [list card plan table]

````
I don't have Saturday's plan on file, so I can't swap in place without guessing the rest of it.

```yui
choose "How should I get it?" "Paste or snap it"|"Rebuild it knee-friendly"|"Just the swaps as a list" +other
```
````

### report-card-done (pass)

**Chris:** The worker just finished card INT-18 on the board. Its handoff summary: "A2A bridge: add any A2A agent to Yui by its Agent Card. node adapters/a2a/yui-a2a.ts pair <code> --card <url>, then run; add --card <url> puts more agents on the same machine. Runtime-neutral TypeScript client (src/a2a.ts + src/sse.ts, fetch and an SSE parser only, so the hosted step runs the same code in a Durable Object): A2A 1.0 SendMessage / SendStreamingMessage / SubscribeToTask / GetTask / CancelTask and 0.3 message/send, message/stream, tasks/resubscribe, tasks/get, one version-free shape for callers. The bridge keeps the relay's rules (delivered on pickup, handled after the answer, outbox on disk, one turn at a time per agent). Tests: client.test.ts 42/42; sdk_interop.test.ts 4/4 against the official a2a-sdk servers (1.1.5 and 0.3.26); a2a_e2e.py 66/66 live on throwaway accounts (kill -9 mid-task resumes the same task and answers once) plus the phone run 6/6 on the iPhone 18 Pro sim. No app binary change (INT-18)" Tell me what shipped.

Good: One short line, a card with the headline (A2A agents can join Yui), and the detail as a deck of short pages (what it does, how to add one, the test counts as points). No paragraph relaying the summary.

````
The A2A bridge shipped: any A2A agent can join Yui by its Agent Card. No app update is needed.

```yui
card "A2A bridge" body="Add any A2A agent to Yui by its Agent Card"
deck "What shipped" +inline
page "Pairing an agent" body="Pair with a code and the agent's card URL, then run the bridge. Adding another card URL puts more agents on the same machine."
page "Both A2A versions" body="The bridge speaks A2A 1.0 and 0.3 through one shape, so callers don't need to know which version an agent uses. The hosted version runs the same client code."
page "Same delivery rules" points="Messages count as delivered on pickup"|"Handled only after the answer"|"Outbox kept on disk"|"One turn at a time per agent"
page "Tested" points="Client: 42/42"|"Official A2A servers, both versions: 4/4"|"Live end to end: 66/66, including a crash mid-task that resumed and answered once"|"Phone run on the simulator: 6/6"
choose "What next?" "Pair an agent now"|"What's next on the board"|"Why do you ask?" +other
end
```
````

### report-long-walkthrough (pass)

**Chris:** Walk me through everything that changed in how Yui delivers messages this week: replies are exactly-once both ways with acks, a reply outbox on disk, presence reads online/asleep/offline per agent, pushes skip a phone already watching the thread, agents can be muted, and a paired agent whose gateway never started now says 'not listening yet' with the restart command.

Good: A deck (or plan) of short pages, one change per page, under one short chat line. Not a long bulleted or prose message.

````
Six changes, grouped into four ideas.

```yui
>full
deck "How Yui delivers now"
page "Every reply lands once" body="Replies go exactly once both ways. Each side acks what it got, and replies wait in an outbox on disk, so a crash or dropped connection resends instead of losing or doubling."
shapes "Exactly once" caption="A reply sits in the outbox on disk until the other side acks it."
shape circle Agent
shape arrow
shape box Outbox +fill
shape arrow
shape circle Phone +grow
shape pill Ack +pulse tone=mint
page "Presence per agent" body="Each agent shows its own state instead of one shared dot."
sketch frame=phone
row "Urza  online" +hi note="answering now"
row "Coach  asleep" note="wakes on a message"
row "Scout  offline" +x note="not reachable"
end
page "Fewer pushes" body="No push when your phone is already open on that thread. Any agent can be muted."
sketch frame=phone before=Before
row "Push: Urza replied" +x note="you were already reading it"
after Now
row "Reply shows in the open thread" +hi note="no buzz"
row "Mute Scout" +button note="new"
end
page "Not listening yet" body="A paired agent whose gateway never started says so, with the command to restart it, instead of looking offline."
sketch frame=phone before=Before
row "Scout  offline" +x note="no reason why"
after Now
row "Scout  not listening yet" +hi
row "Copy restart command" +button
end
choose "What next?" "Test it on my phone"|"Mute an agent"|"Draft release notes" +other
end
```
````

### talk-keep-plan-editable (pass)

**Chris:** Lay out my runs for this week somewhere I can keep looking at it, and I'll tell you what to change as the week goes.

Good: The week on a page (`>2 list@runs Runs "Tue 5k"|"Thu 5k"|"Sat 10k" +check`) with `>2 talk` so they can type changes right there, and one short line in the chat.

````
Here's a starting week on its own screen. Mornings, done well before Mick's 2 pm pickup and ahead of the heat. Tell me what to change there.

```yui
>2 timeline "Runs this week" +reorder
>2 now "Easy 30 min, conversational pace" at="Thu 10:00"
>2 next "Rest or 20 min strength" at=Fri
>2 next "Long run, 60 min easy" at="Sat 6:30"
>2 next "Recovery 25 min + strides" at="Sun 7:00"
>2 talk
>2 save runs
menu shortcut "This week's runs" show=runs
```
````

### talk-typed-on-screen (pass)

**Chris:** [yui] screen=2
Make Thursday a swim instead.

Good: Patches the list on screen 2 by preset name (`~list "Tue 5k easy" "Thu swim" "Sat 10k long" +check`), at most a short line. Does not re-send the list or explain the tag.

````
```yui
>2 ~list "Tue 5k easy"|"Thu swim"|"Sat 10k long" +check
>2 say Thursday is a swim now.
```
````

### report-draw-change (pass)

**Chris:** What changed in how you word your updates to me? You used to write things like "Parked YUI-83, feedback #2291 attached". Now you just say what the card is, like "Parked the drawing card, your note is on it". Show me the difference, don't describe it.

Good: One short line and a `sketch` (a bubble fits) with the old wording struck out (+x) and the new wording highlighted (+hi), ideally split with `after`, a note or two. No paragraph explaining it.

````
Updates name the thing now, not its id.

```yui
sketch "How updates read" frame=bubble
row "Parked YUI-83, feedback #2291 attached" +x note="ids mean nothing to you"
after
row "Parked the drawing card, your note is on it" +hi note="plain words"
```
````

### draw-screen-fix (pass)

**Chris:** The build-ready screen shows the headline, two lines of notes, then a Got it button and an Install button. Which of those should go, and why? Show me on the screen itself.

Good: A `sketch` of the screen (frame=phone) with the headline and notes as rows, Got it as a +button row struck out (+x) with a short note (it does nothing), Install as a +button row highlighted. At most a line of chat.

````
The Got it button goes. It only acknowledges, so tapping it does nothing. Install is the one action, so it's the only button.

```yui
sketch "Build ready" frame=phone before=Now
row "Build 82 is ready" +hi
row "Add any A2A agent by its Agent Card"
row "Client 42/42, end to end 66/66"
row "Got it" +button +x note="does nothing; the chat already says it"
row "Install" +button
after Fixed
row "Build 82 is ready" +hi
row "Add any A2A agent by its Agent Card"
row "Client 42/42, end to end 66/66"
row "Install" +button +hi note="the one thing to do"
```
````

### report-pages-picture (FAIL)

**Chris:** Walk me through the three changes to how you write updates to me this week, one at a time: you name cards in plain words instead of ids like YUI-83, a long update comes as pages instead of a wall of text, and cards no longer end in a 'Got it' button that does nothing. For each one, show me what it looked like before and after.

Good: One short line and a deck of three pages, one change each, and each page's picture a sketch right after it: the old wording or button struck out (+x), the new one highlighted (+hi), ideally split with `after`. No paragraph.

- preset: choose not in [card deck plan page sketch row after say stat list end]

````
Three changes, one page each.

```yui
>full
deck "How updates read now"
page "Cards in plain words" body="A card is named for what it is, so you know which one without looking it up."
sketch frame=bubble
row "Parked YUI-83 in the backlog" +x note="an id means nothing"
after
row "Parked the drawing card in the backlog" +hi note="plain words"
end
page "Long updates as pages" body="A long update is a headline card plus a few short pages, not one block of text."
sketch frame=phone
row "Build 82 is ready. Latest change: A2A bridge, pair it with node yui-a2a.ts. Tests: client 42/42, interop 4/4, e2e 66/66..." +x note="wall of text"
after
row "Build 82 is ready." +hi note="answer first"
row "Open TestFlight" +button
row "What's in build 82: 2 pages" +hi note="tap to read"
end
page "No dead buttons" body="A card only gets a button when it does something. A note is just a note."
sketch frame=bubble
row "Deload week planned" +x
row "Got it" +button +x note="does nothing"
after
row "Deload week planned: Mon to Fri, lighter sets" +hi note="no button"
end
choose "What next?" "Tweak one"|"Apply to email too" +other
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

### menu-tapped (pass)

**Chris:** [yui] deload menu bucket=backlog tapped

Good: Answers the tap with the deload week itself on a screen (a list or table of the sessions, or a card), maybe `~`/re-sent menu item with sub=ready. Does not explain the tag.

````
Here's the draft so far: same lifts, about half the volume, nothing to failure.

```yui
card "Deload week" body="3 sessions, 30 min each. Sets cut in half, weights down about 20%, stop 3 reps short of failure."
list "Draft week" "Day 1: DB goblet squat 2x8, DB bench 2x8, band rows 2x12" "Day 2: Walk or easy bike 30 min, mobility 10 min" "Day 3: DB RDL 2x8, pull-ups 2x5, DB overhead press 2x8" "Day 4: Rest" "Day 5: Full body light, 2 sets each, plus 10 min stretch" "Days 6 and 7: Rest or a walk with Mick"
choose "When should it start?" "Next Monday"|"This coming week"|"After my next hard block" +other
menu backlog@deload "Deload week plan" sub="draft ready"
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
Five runs before 10 each weekday: easy early in the week, sharp mid-week, fresh by Saturday. Run by 7 to beat the Florida heat.

```yui
timeline "Race week runs"
next "Easy 30 min, conversational" at="Mon 7:00"
next "Easy 35 min + 4 strides" at="Tue 7:00"
next "Sharp: 10 min easy, 4x800m at 10k pace, 2 min jog between, 10 min easy" at="Wed 7:00"
next "Easy 25 min" at="Thu 7:00"
next "Shakeout 15 min + 3 strides" at="Fri 7:00"
next "10k race" at=Sat
save race week
```
````

### group-lead-hands-on (pass)

**Chris:** [yui] group "Race week" thread=g1 with=urza,arnold lead=urza hop=0 from=person msg=m1
My 10k is Saturday. Block my week: calls after 10, errands Wednesday at 4, and get the training runs set.

Good: Blocks the week (calls after 10, errands Wednesday 4 pm) on screen, and hands the training runs to @arnold in one plain sentence instead of writing a training plan itself.

````
Race is Saturday, Oct 3. Here's the week I'd block; confirm and it goes on the calendar.

@arnold please set Chris's taper runs for a Saturday 10k, each run before 10 am on weekdays.

```yui
list "Race week blocks" "Mornings until 10: no calls, run window" "Calls: 10 am onward, daily" "Wed Sep 30, 4:00 pm: errands" "Fri Oct 2: light day, early night" "Sat Oct 3: 10k"
ask "Block these on your calendar?" "Block it"|"Change something"
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
Call's done, so go now. It's cooler before 10, and you're clear well before Mick's 2 pm pickup.

```yui
choose "Thursday run" "9:30 am, now-ish"|"11:00 am"|"6:30 pm, after dinner" +other
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

### idea-shapes-heatpump (FAIL)

**Chris:** How does a heat pump heat the house when it's cold outside? Quick, I'm on my phone.

Good: One short line and a `shapes` diagram with a caption: cold outside air, the refrigerant loop picking up heat and the compressor squeezing it hotter, heat let out inside, arrows between, labels a word or two. No paragraph, no generated image.

- words: 70 > 45

````
Even cold air holds heat. The refrigerant is colder still, so it soaks that heat up. The compressor then squeezes it hot enough to warm your house.

```yui
shapes "How a heat pump heats" caption="Frigid refrigerant pulls heat from outdoor air, the compressor squeezes it hot, it dumps that heat inside, then expands and chills to go again."
shape blob "Outside air" tone=lavender at=1,3
shape arrow
shape circle "Cold coil" tone=lavender at=3,1
shape arrow
shape box Compressor +fill +pulse at=6,1
shape arrow
shape circle "Hot coil" tone=butter +grow at=8,3
shape arrow
shape pill Expansion +dash at=5,5
```

It moves heat instead of making it, so it gets 2 to 4 units of heat per unit of power. Efficiency drops as it gets colder, and most units need backup heat below about 5°F. That's rarely an issue in Palm Beach Gardens.
````

### idea-shapes-flywheel (pass)

**Chris:** Explain the flywheel idea for Yui in one picture: more people use it, we see which screens agents reach for, the good ones become presets, agents get better, more people use it.

Good: A `shapes` loop (placed with at= or a row with arrows back to the start) with a caption, maybe one +pulse. Words kept to a line.

````
More people means better agents, which means more people.

```yui
shapes "The Yui flywheel" caption="More people use Yui, we see which screens agents reach for, the best become presets, agents get better, and more people use it."
shape circle People at=2,1 +grow
shape arrow
shape box "Screens used" at=8,1
shape arrow
shape pill Presets at=8,5 +fill tone=mint
shape arrow
shape blob "Better agents" at=2,5 +pulse tone=lavender
shape arrow
shape dot at=2,2 tone=mint
```
````

### teach-one-screen (pass)

**Chris:** Explain compound interest to me. Show me the math and let me play with the numbers.

Good: One short line, then `>full` and ONE deck: a page per idea, the diagram, math, chart and stat each right after its page as its picture, a quiz, the calc on the last page. Nothing loose in the chat or on the stage beside the deck, no `close` after it.

````
Compound interest means your interest earns interest too, so growth speeds up the longer you wait.

```yui
>full
deck "Compound interest"
page "Money that grows on itself" body="Each year you earn interest on your deposit and on all the interest you've already earned. The pile you earn on keeps getting bigger."
shapes caption="$100 at 10% becomes $110, then $121: the extra $1 is interest earned on interest."
shape circle $100 +grow
shape arrow
shape blob $110 tone=mint
shape arrow
shape blob $121 +pulse tone=mint
page "The math" body="Each year multiplies the balance by (1 + r). Do that t times and you get the formula. P is the deposit, r the yearly rate, t the years."
math \text{Year 1: } 100 \times 1.1 = 110 \\ \text{Year 2: } 110 \times 1.1 = 121 \\ \text{Year } t\text{: } A = P(1 + r)^t
page "It bends upward" body="Simple interest pays only on the $100, so it adds $10 a year and ends at $300 after 20 years. Compounding ends at $673."
chart line "$100 at 10% a year, compounded" x=Y0|Y5|Y10|Y15|Y20 y=100|161|259|418|673
page "Quick check" body="Time sits in the exponent, while the deposit only multiplies the result."
choose "Which lever grows it fastest?" "More time"|"A bigger deposit" answer="More time"
page "Try it" body="Slide the deposit, rate and years and watch the curve redraw."
calc f="A = P*(1+r)^t" P=100-1000@100 r=0-0.2@0.05 t=0-20@10
choose "What next?" "Add monthly deposits"|"Compound monthly vs yearly"|"The Rule of 72"
end
```
````

### library-flow-intake (FAIL)

**Chris:** A new client just sat down with me, she wants a website for her bakery. Walk her through everything you need from her, on my phone.

Good: One short line and `flow website-intake`: the saved intake flow asks everything, branching on their answers. Not a hand-built plan of the same questions.

- words: 42 > 40

````
There's a saved flow for exactly this. The client is referred to as "she" by Chris, so I can use she for the client.

Here's the website brief. Hand her the phone; she can go through it one question at a time.
```yui
flow website-intake
```
````

### flow-interview-old-app (FAIL)

**Chris:** Interview me for a personal brand site.

Good: TestFlight feedback AMLn-Gg3 (YUI-155): one short line and the questions, as the saved `flow website-intake` or a plan. On build 205, which runs no flows, the plugin sends the flow as the plan it walks, so the phone shows questions, never a bare headline.

- app build: the yui plugin did not run (/Users/urzas/dev/yuigui/.worktrees/yui/hermes-plugin/yui): spawnSync python3 ENOENT
- tap: nothing to tap on build 205

````
Let's build your brief. One question per screen, and you can skip any of them.

```yui
flow website-intake
```
````

### short-status-latest-build (pass)

**Chris:** Am I on the latest build? (What you just looked up: the newest build on TestFlight is 160, live since 12:58 pm today. This phone reports build 160. An iPad on the same account reports build 135. Five changes wait on main for the next release, 0.3.2: keys and chords in the music tools, and a faster Send tap that is still being built.)

Good: One line: yes, build 160, the newest; the iPad is on 135. No deck, no pages, no 'what's coming' tour (YUI-118, feedback AJq7CcQS8fyM).

````
Yes, this phone is on build 160, the newest. Your iPad is still on 135.
````

### short-release-go-ahead (pass)

**Chris:** OK, yeah go ahead and release that. I want to play with the music tools. (What you just did: started the 0.3.2 release; a worker is building it now and it reaches TestFlight in about 40 minutes. It leaves out the faster Send tap, which is not done yet.)

Good: One line: 0.3.2 is building, on TestFlight in about 40 minutes with keys and chords; the Send tap fix waits. No deck, no 'what happens next' pages (YUI-118).

````
Started 0.3.2. It'll be on TestFlight in about 40 minutes with keys and chords; the faster Send tap isn't finished, so it waits for the next build.
````

### doing-long-turn (FAIL)

**Chris:** What needs me today? Check my calendar, my mail and the board. (This turn runs on the host with tools and takes about a minute: calendar first, then mail, then the board. Write everything you send during the turn, in order, as one reply. What the tools returned: gcal_list_events: 10:00 call with Dana (30 min), 4:00 design review. gmail_search: two need a reply today, the venue contract from Sam and a question about an invoice. kanban board: one card waits on you, t_627321c6 (YUI-SHIP 0.3.3), asking whether to ship without the tuner.)

Good: doing lines as it goes, plain words and a step ("Reading your calendar" 1/3, "Checking your mail" 2/3, "Looking at the board" 3/3), no card ids or tool names; then the answer: two calls, two replies to send, one choice on the tuner (YUI-63).

- preset: sketch not in [card say ask choose list check timeline stat deck page done now next]
- preset: row not in [card say ask choose list check timeline stat deck page done now next]

````
Five things today: two meetings, two replies, and one ship decision.

```yui
doing "Reading your calendar" 1/3
doing "Checking your mail" 2/3
doing "Looking at the board" 3/3
timeline "Today"
next "Call with Dana, 30 min" at="10:00"
next "Mick out of school" at="2:00"
next "Design review" at="4:00"
sketch "Replies due today" frame=bubble
row "Sam: venue contract" +hi note="needs a reply"
row "Invoice question" +hi note="needs a reply"
ask "Ship 0.3.3 without the tuner?" "Ship it"|"Wait for tuner"|"Tell me more"
menu review@ship "Ship 0.3.3 without the tuner?" sub="waiting on you"
```
````

### music-jam-beat (pass)

**Chris:** Trying to get back into drumming. Give me a simple boom bap beat around 90 I can mess with.

Good: One `loop` line near 90 BPM with a boom bap pattern in `p=` that plays (`+play`), a short line at most. No pattern written out in words, no drum tab, no advice paragraph.

````
Kick on 1, the "and" of 2, and 3, snare on 2 and 4, straight hats at 90.

```yui
loop 90 "Boom bap" rows=kick|snare|hat p=x..x.x..|..x...x.|xxxxxxxx +play
```
````

### music-finger-drums (pass)

**Chris:** Waiting on a call. Let me just tap out some drums on my phone for a minute.

Good: One `drums` line (2x2 or 4x4), a few words at most.

````
Go for it.
```yui
drums 2x2
```
````

### music-beat-sent (pass)

**Chris:** [yui] n1 loop bpm=94 swing=25 steps=8 rows=kick|snare|clap|hat|open|rim|tom|shaker p=x..xx.x.|....x...|..x...x.|xxxxxxxx||||
Sent my beat, 94 BPM

Good: The person's version patched in by preset name (`~loop p=... bpm=94 swing=25`) and a `save` with a short name, a line at most. No re-sent loop, no critique of the beat.

````
```yui
~loop bpm=94 swing=25 steps=8 rows=kick|snare|clap|hat|open|rim|tom|shaker p=x..xx.x.|....x...|..x...x.|xxxxxxxx||||
save beat
```
````

### show-phase-one (pass)

**Chris:** Walk me through phase one. (What you know: phase one of the full-screen change. Answers play as full-screen chunks, and the chat is just the record, top right. Bottom right: a bigger mic, a T that opens the text field, and a + for attachments, including images. Settings sit behind a hamburger at top left, beside the agent picker.)

Good: A line and a drawing per part: the stage with a chunk on it, the record top right, the new bottom bar (big mic, T, +). Never a page with a heading over a paragraph (feedback AL1My-stUBnvtXD2WKV7ec8, YUI-119).

````
Phase one has three parts.

```yui
say "Answers take the whole screen, in chunks."
sketch "Answers" frame=phone
row "Your answer, one chunk at a time" +hi note="full screen"
row "Chat" +button note="the record, top right"
say "Talk first. Type or attach when you want."
sketch "Bottom bar" frame=phone before=Now
row "+  Say something nice  Mic" +button +x note="a field always open"
after New
row "+   T   Mic" +button +hi note="big mic; T opens the field; + attaches images"
say "Settings tuck behind a menu."
sketch "Top bar" frame=phone
row "☰  Agent picker ▾" +button +hi note="hamburger opens settings"
```
````

### show-new-layout (pass)

**Chris:** Show me the bigger microphone. Does the text field look better? I want to see the new layout of big microphone, T for text and + to attach. Remember, I want you to show me this. (What you know: phase one of the full-screen change. Answers play as full-screen chunks, and the chat is just the record, top right. Bottom right: a bigger mic, a T that opens the text field, and a + for attachments, including images. Settings sit behind a hamburger at top left, beside the agent picker.)

Good: The bottom bar drawn: `sketch frame=phone` with `+button` rows for +, T and the big mic, ideally before and after (the old always-there field struck out). Not a description of it (feedback AL1My-stUBnvtXD2WKV7ec8).

````
Yes. The field stays hidden until you tap T, so the mic owns the bar.

```yui
sketch "The new layout" frame=phone
row "☰   Yui ▾                    Chat" +button note="settings, agent picker, the record"
row "Yes. Build 160, the newest." +hi note="the answer fills the screen"
row "+              T             🎤" +button +hi note="big mic; T opens the field; + attaches"
sketch "Bottom bar" frame=phone before=Now
row "+   Say something nice…   🎤" +button +x note="a field always open, small mic"
after New
row "+          T          🎤" +button +hi note="mic is the big target"
row "Tap T:  [ Say something nice…      ↑ ]" +hi note="field slides up only when you want it"
choose "What next?" "Bigger mic still"|"Move T left"|"Looks right"|+other
```
````

### music-keys-scale (pass)

**Chris:** Learning piano again. Give me something to noodle around A minor pentatonic on.

Good: One `keys Am pentatonic` line (a title or +send is fine), a short line at most. No list of note names, no fingering advice paragraph.

````
A minor pentatonic keyboard: only A C D E G play, so nothing sounds wrong. Start on A and walk up.

```yui
keys Am pentatonic
```
````

### music-chords-song (pass)

**Chris:** I want to strum along to one of those four chord pop songs on my uke. G is a good key for me.

Good: One `chords` line in G (`chords G I-V-vi-IV` or `chords G|D|Em|C`), a short line at most. No chord names in a paragraph, no chord diagrams in text.

````
The four-chord loop in G: G, D, Em, C. Strum down-down-up-up-down-up.
```yui
chords G I-V-vi-IV +send
```
````

### music-tuner-guitar (pass)

**Chris:** Just restrung my acoustic and it sounds awful. Help me get it in tune.

Good: One `tuner guitar` line, a short line at most. No list of string notes and frequencies, no advice on tuning by ear.

````
New strings stretch, so expect to tune it three or four times before it holds.
```yui
tuner guitar
```
````

### music-metronome-practice (pass)

**Chris:** Working on my strumming timing. I want to practice slow, like 70 bpm in 4/4.

Good: One `metronome 70` line (beats=4 is fine), a short line at most. No paragraph of practice tips, no counting in words.

````
Click at 70. Strum down on every beat, then add the up-strums once it locks in.
```yui
metronome 70
chords G|C|D|Em
```
````

### explain-mongols-geography (pass)

**Chris:** All right, can you give me a brief geographic explanation of the Mongols?

Good: One line with the answer, then one deck on `>full` where every page has its picture: the empire as a `map` (its outline in lat,lon points, Karakorum as a pin, routes east and west), the size as a `chart` or a `stat`. Not pages of text, and not the steppe drawn as dots in `shapes` (TestFlight feedback AJIE1_1Ru1V4EMgmpWZtniI: 'It's just a text bomb'; feedback AL2nKEYo on the shapes version: 'Again, not bad but this should be a Map').

````
The Mongols came off the grasslands of Mongolia and, in about 60 years, rode out to rule from Korea to Ukraine.

```yui
>full
deck "The Mongols, by the map"
page "Where they started" body="Nomads on the high steppe between the Siberian forest and the Gobi. Temüjin was born near the Onon River around 1162 and united the tribes as Genghis Khan in 1206."
map caption="Grassland for horses, desert to the south, forest to the north."
area Mongolia MN tone=mint
pin@on "Onon River" 48.8,110.8 +pulse
pin@ka Karakorum 47.2,102.8
page "How far it reached" body="Horses and the open steppe carried them east to China and Korea, west through Persia to Russia, and on raids as far as Poland and Hungary."
map caption="Karakorum sat in the middle and rode out every way."
area "Mongol Empire" 53,140|43,131|34.7,126.5|22.3,114|24,98|34,70|25.5,57|33,44|41,31|46,30.5|54,23|60,56|55,95 tone=butter
area Raided PL|HU +dash
pin@ka Karakorum 47.2,102.8 +pulse
route East ka|37.6,127 +arrow
route West ka|50.4,30.5 +arrow
route South ka|33.3,44.4 +arrow
page "Then it split in four" body="By the 1260s, Genghis's grandsons ran four khanates: the Yuan in China, the Chagatai in Central Asia, the Ilkhanate in Persia and the Golden Horde on the western steppe."
map caption="One family, four realms."
area Yuan CN|MN|KR tone=butter
area Chagatai UZ|KG|TJ tone=mint
area Ilkhanate IR|IQ|AZ|AM tone=lavender
area "Golden Horde" 56,30|56,60|52,78|44,70|44,50|46,32 tone=mute
page "The biggest one on land"
chart bar "Land empires, million km²" x=Mongol|Russian|Qing|Roman y=24|22.8|14.7|5
choose "What next?" "Why it fell apart"|"The Silk Road under the Mongols"|"Quiz me"|"That's enough" +other
end
```
````

### explain-rome-rise-fall (pass)

**Chris:** Give me the quick version of how the Roman Empire rose and fell.

Good: A line, then a picture per part: the empire at its peak as a `map` around the Mediterranean, its size over the centuries as a `chart` (or a `timeline` on the stage), the split as an east and west area. No page that is only a heading and a paragraph.

````
Rome grew from a city to rule the whole Mediterranean by 117 AD, then overstretched and split in 395. The West fell in 476, and the East held on until 1453.

```yui
>full
deck "Rome, rise and fall"
page "The rise" body="A small republic from 509 BC took Italy, beat Carthage in the Punic Wars and owned the Mediterranean by 146 BC. Civil war made Augustus the first emperor in 27 BC."
shapes caption="City, then Italy, then the whole sea, then one man at the top."
shape circle Rome +grow
shape arrow
shape box Italy
shape arrow
shape blob Mediterranean +fill tone=butter
shape arrow
shape pill Emperor +pulse
page "The peak, 117 AD" body="Under Trajan, after two centuries of Pax Romana, the empire ran from Hadrian's Wall to the Persian Gulf."
map caption="Everything around the sea, run from Rome."
area "Roman Empire, 117 AD" 55,-2.5|51,-5|48.5,-5|43.5,-9.3|37,-9|35.7,-6|34,-2|36.5,5|37,10|30.5,10|30.5,20|31,29|24,32|24,35|29.5,35|30,37|33,40|30,47.8|37,44|40,44|42,41.5|45,29.7|48,27|48,23|45.5,19|48,17|48.5,13|50.5,7|52,5|53,1|55,-1.5 tone=butter
pin@rome Rome 41.9,12.5 +pulse
pin@con Constantinople 41,29
page "Why it cracked" body="Too much border to hold. The 3rd century saw about 26 emperors in 50 years, plague, and silver coins debased into inflation. In 395 the empire split for good."
shapes caption="Pressure from every side pushed one empire into two."
shape box "Civil wars"
shape box Plague
shape box Inflation
shape box Borders
shape arrow
shape pill "Split, 395" +pulse tone=lavender
page "Two endings" body="The West fell in 476 when Odoacer deposed the last emperor. The East, Byzantium, lasted until the Ottomans took Constantinople in 1453."
chart bar "Years each lasted" x=Republic|"Empire, West"|"Empire, East" y=482|503|1058
choose "Go deeper on?" "Julius Caesar"|"Why the West fell"|Byzantium +other
end
```
````

### explain-monsoon-how (pass)

**Chris:** Why does India get monsoons? Keep it short.

Good: One line and a picture: land heats, air rises, wet air off the ocean moves in, as a diagram in `shapes` with arrows or a `map` with the winds as routes, maybe a rainfall `chart` by month. Not a paragraph of weather words.

````
In summer the land heats up much faster than the ocean. Hot air rises over India and pulls in wet ocean wind, which dumps rain when it hits the mountains.

```yui
shapes "Why the monsoon comes" caption="Summer sun heats the land. Hot air rises and pulls in moist Indian Ocean wind, which rises over the Ghats and Himalayas, cools and rains. In winter it reverses and the land stays dry."
shape blob Ocean tone=mint
shape arrow
shape box "Hot land" +fill tone=butter
shape arrow
shape pill Mountains
shape arrow
shape circle Rain +pulse tone=mint
```
````

### where-trip-route (pass)

**Chris:** Thinking about a train trip from Lisbon to Barcelona with stops in Porto and Madrid. How does that route go?

Good: One line, then a map: pins on Lisbon, Porto, Madrid and Barcelona, a route through them with an arrow, a caption with the rough hours (a small `table` of the legs beside it is fine). Not a numbered list of legs in words.

````
It heads north first, then cuts east through Galicia, since there's no direct Porto–Madrid train.

```yui
map "Lisbon to Barcelona by rail" caption="North to Porto, over the border to Vigo, high-speed east to Madrid, then on to Barcelona."
pin@li Lisbon 38.72,-9.14
pin@po Porto 41.15,-8.61 +pulse
pin@vi Vigo 42.24,-8.72
pin@ou Ourense 42.34,-7.86
pin@ma Madrid 40.42,-3.70 +pulse
pin@ba Barcelona 41.39,2.17
route "The trip" li|po|vi|ou|ma|ba +arrow
list "Legs" "Lisbon to Porto: about 3h, Alfa Pendular" "Porto to Vigo: about 2.5h, Celta train" "Vigo to Madrid: about 4.5h, high-speed via Ourense" "Madrid to Barcelona: about 2.5h, AVE"
choose "What next?" "Plan days per city"|"Compare flying one leg"|"Check tickets"
```
````

### where-delivery-area (pass)

**Chris:** Our farm delivers CSA boxes across Vermont, New Hampshire and western Massachusetts. Can you show a new customer what that covers?

Good: One line, then a map with the delivery area filled in (VT and NH by code, western Massachusetts as lat,lon points) and the farm or the big towns as pins. Not a list of states and counties.

````
Here's what a new customer would see: all of Vermont and New Hampshire, plus Massachusetts west of Worcester.

```yui
map "Where we deliver" caption="All of Vermont and New Hampshire, and western Massachusetts."
area Vermont 42.73,-73.26|45.01,-73.34|45.01,-71.5|42.73,-72.46 tone=mint +fill
area "New Hampshire" 42.73,-72.46|45.01,-71.5|45.3,-71.08|43.1,-70.7|42.87,-70.8|42.7,-71.3 tone=mint +fill
area "Western Mass" 42.73,-73.26|42.73,-72.0|42.03,-72.0|42.05,-73.49 tone=butter +fill
pin Burlington 44.48,-73.21
pin Concord 43.21,-71.54
pin Northampton 42.32,-72.63
```

I drew western Mass's eastern edge near Worcester (about -72.0). If you stop at the Connecticut River instead, I'll move the line.
````

### where-quick-country (pass)

**Chris:** Where exactly is Kyrgyzstan?

Good: One line (Central Asia, between Kazakhstan and China) and a map in the chat: KG as an area with a pulse on Bishkek, neighbors faint. No deck for a quick where.

````
Central Asia, landlocked between Kazakhstan, China, Tajikistan and Uzbekistan, mostly Tian Shan mountains.

```yui
map "Kyrgyzstan" caption="North of Tajikistan, west of China, south of Kazakhstan. Bishkek sits on the Kazakh border."
area Kyrgyzstan KG tone=butter +pulse
area Neighbors KZ|CN|TJ|UZ tone=mute
pin@bi Bishkek 42.87,74.59
pin@ik "Issyk-Kul" 42.4,77.3
pin@os Osh 40.53,72.8
```
````

### data-lunch-macros (pass)

**Chris:** Give me a quick lunch idea with 30g of protein.

Good: One line naming the lunch and a real Yui Lines table (`table Macros Food|Protein|Cal "Chicken|35g|165" ...`) or stat tiles for the macros. Not a quoted title plus `columns:` rows and `end` (GLM 5.2 on YUI-131, every row a parse error), and not a markdown table.

````
Tuna yogurt pita. Five minutes, no cooking, about 33g protein.

```yui
card "Tuna yogurt pita" body="Drain 1 can of tuna (5 oz). Mix with 2 tbsp plain Greek yogurt, a squeeze of lemon, pepper and diced cucumber. Stuff into a whole wheat pita with spinach."
table Macros Item|Protein|Calories "Tuna, 5 oz can|25g|120" "Greek yogurt, 2 tbsp|3g|20" "Whole wheat pita|5g|170" "Total|33g|~320"
```
````

### list-no-escaped-breaks (pass)

**Chris:** What should I eat for dinner tonight? Something with protein. I'm allergic to peanuts and shellfish.

Good: A few dinners as a `list` (or cards), one per item, and a way to pick one. Never one `say` with \n breaks inside the quotes: the app shows the letter n (YUI-161, GLM 5.2 on native Basil).

````
Sheet-pan Greek chicken tonight: high protein, 35 minutes, one pan, and nothing near peanuts or shellfish. Mick-friendly too.

```yui
card "Sheet-pan Greek chicken" body="Chicken thighs, baby potatoes and green beans with lemon, garlic and oregano. 425°F for 30 min. Serve with tzatziki." cta="Show the recipe"
table "Per serving" Item|Amount "Protein|46 g" "Calories|540" "Carbs|38 g" "Fat|22 g"
list "Groceries" "Chicken thighs, 2 lb" "Baby potatoes, 1.5 lb" "Green beans, 12 oz" "Lemon, garlic, oregano" "Greek yogurt and cucumber" +check
choose "Not feeling it?" "Salmon instead"|"Turkey tacos"|"Steak bowls"|"Something faster" +other
```
````

### items-board-cards-drawn (pass)

**Chris:** Anything waiting on me?

Good: One short line, then the two items drawn: a sketch with one row per card (title plus one fact) or a list or two cards, so he sees them. Not a paragraph counting the cards and listing what is in them.

````
Two things need your OK.
```yui
sketch "Waiting on you" frame=bubble
row "Justice Watch: 4 recovered articles, 2 rewrites" +hi note="approve to publish"
row "Aaron's weekly roundup: post and landing page link" +hi note="needs your OK"
choose "Start with?" "Justice Watch"|"Aaron's roundup"|Later
```
````

### ui-zip-in-context (pass)

**Chris:** Tell me about the newest change on the closing purple box.

Good: One short line, then the box drawn in a phone sketch: the ZIP field and the two buttons in place, the new part highlighted. Not a paragraph describing the field, and no hyphen lines (Chris, TestFlight: "Show me the zip in context. You should be able to illustrate UI elements fairly easily").

````
The closing purple box is finished as of Sep 24: the client's final copy, a working ZIP field, and a two-question form that feeds the lead record.

```yui
sketch "Closing purple box" frame=phone before="Before"
row "Red placeholder frame" +x note="gone"
after "Sep 24"
row "the client's final copy, word for word" +hi note="final copy"
row "Your ZIP" +hi note="working field"
row "Two questions" +hi note="answers go to the lead record"
row "See My Coverage Options" +button
row "Talk to a Licensed Advisor" +button
```
````

### when-two-days-timeline (pass)

**Chris:** What did we change on the quote site two days earlier, on Sep 22 and 23?

Good: One short line, then a timeline: the Sep 22 and Sep 23 changes as rows with their dates, oldest first. Not a sentence with the dates inside it (Chris: "If we're talking about some two days earlier, we need some type of timeline. Show me visually").

````
Three fixes, all polish on existing pages.
```yui
timeline "the quote site, Sep 22–23"
done "Real brand logos on the /brands family cards" at="Sep 22–23"
done "Bigger field labels on the calculator" at="Sep 22–23"
done "Last four eyebrow labels on the forms fixed" at="Sep 22–23"
```
````

### facts-stacked-list (pass)

**Chris:** List the small fixes we made on the quote site.

Good: Three or more facts as one stacked list (or a table), each row Label: value. Not one line per fix with hyphens, and never a list of one (Chris: "These were all supposed to be in a stacked list").

````
Four small the quote site fixes from the board.
```yui
list "the quote site fixes" "Family cards: real brand logos on /brands" "Calculator: bigger field labels" "Forms: last four eyebrow labels fixed" "Closing box: red placeholder frame removed"
```
````

### fact-one-sentence (pass)

**Chris:** Anything else fixed on the forms?

Good: One fact, so one plain sentence: the last four eyebrow labels on the forms were fixed. No hyphen, no list of one (Chris: "If there's only one thing hyphenated, it doesn't mean anything").

````
One other fix: the last four eyebrow labels on the the quote site forms are fixed.
````

### last-page-next-step (pass)

**Chris:** Walk me through the most recent changes we've done for the quote site.

Good: Short answer first, then a deck or plan of the changes (each with its picture, at most 4 pages) whose last step is a `choose` of what to do next or 'Why do you ask?', never a page they can only read (Chris: "we are on the last card and I want some type of action here. I don't want a user to land here and not know what to do next").

````
Three days of work: the closing box went live on Sep 24, and polish landed on Sep 22 and 23.
```yui
>full
deck "the quote site, Sep 22 to 24"
page "Closing box is live (Sep 24)" body="the client's final copy is in, word for word. The red placeholder frame is gone."
sketch "Closing purple box" frame=phone before=Before
row "Placeholder" +x note="red frame"
after Now
row "the client's final copy" +hi
row "Your ZIP  33410" +hi note="working field"
row "Two-question form" +hi note="answers go into the lead record"
row "See My Coverage Options" +button
row "Talk to a Licensed Advisor" +button
page "Real logos on family cards (Sep 22 to 23)" body="The /brands family cards now show real brand logos."
sketch "/brands family cards" frame=phone
row "Brand logo  Family plan" +hi note="real logos"
page "Calculator and forms (Sep 22 to 23)" body="Calculator field labels got bigger, and the last four form eyebrow labels were fixed."
sketch "Calculator" frame=phone
row "Household size" +hi note="bigger labels"
row "Eyebrow labels" +hi note="last four fixed"
choose "What next?" "Test the ZIP form"|"Check a lead record"|"Send the client a recap" +other
end
```
````

### last-page-walkthrough (pass)

**Chris:** Walk me through what changed on the closing purple box, step by step.

Good: A deck (or plan) of the changes, each with its picture, and the last step is something to tap: a `choose` of what to do next or 'Why do you ask?'. No dead end.

````
The closing purple box went from placeholder to working lead form on Sep 24.

```yui
>full
deck "The closing purple box"
page "Final copy in" body="The red placeholder frame is gone. the client's final copy sits in its place, word for word."
sketch frame=phone before=Before
row "[ placeholder copy ]" +x note="red frame"
after After
row "the client's final copy, word for word" +hi note="no frame"
end
page "A working ZIP field" body="The box now takes a ZIP code instead of showing a dummy field."
sketch frame=phone
row "Your ZIP  33410" +hi note="new, working"
end
page "Two questions to the lead" body="A two-question form sits under the ZIP. Its answers go straight into the lead record."
shapes caption="ZIP and two answers land on the lead."
shape box Form +fill
shape arrow
shape circle Lead +pulse tone=mint
page "New buttons" body="The two buttons now say what they do."
sketch frame=phone
row "See My Coverage Options" +button +hi
row "Talk to a Licensed Advisor" +button +hi
end
choose "What next?" "Open the page"|"Test the form"|"Check a lead record"|"Why do you ask?" +other
end
```
````
