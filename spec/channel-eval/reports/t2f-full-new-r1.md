# Channel eval: t2f-full-new-r1

Guide v40+66c6c017 (4315 words), model claude-opus-5-5, 2026-09-29T23:07.

**85/99 passed (86%).**

| category | passed |
|---|---|
| workout | 4/4 |
| check-in | 2/2 |
| photo | 1/2 |
| today | 1/1 |
| scheduling | 2/2 |
| decision | 1/2 |
| list | 1/3 |
| data | 2/2 |
| flow | 12/14 |
| teach | 2/2 |
| look | 2/2 |
| no-screen | 4/4 |
| secret | 3/3 |
| trap | 2/2 |
| patch | 3/5 |
| tap | 2/2 |
| reaction | 3/3 |
| dead-button | 2/3 |
| saved | 2/2 |
| mention | 1/2 |
| report | 5/5 |
| group | 2/3 |
| idea | 2/2 |
| library | 1/1 |
| short | 1/2 |
| doing | 0/1 |
| music | 7/7 |
| show | 2/2 |
| explain | 3/3 |
| where | 2/3 |
| items | 1/1 |
| ui | 1/1 |
| timeline | 1/1 |
| facts | 2/2 |
| tiles | 3/3 |

| case | result | why |
|---|---|---|
| workout-leg-day | pass |  |
| workout-tabata | pass |  |
| workout-plank | pass |  |
| workout-gear-question | pass |  |
| checkin-morning | pass |  |
| checkin-evening-voice | pass |  |
| meal-photo | pass |  |
| meal-log-no-photo | FAIL | options: nothing to tap :: ask "Rather describe it?" "Tell you instead" |
| today-plan | pass |  |
| schedule-call | pass |  |
| schedule-booking-confirmed | pass |  |
| decision-dinner | pass |  |
| decision-three-options | FAIL | preset: sketch not in [choose ask list card pick]; preset: row not in [choose ask list card pick] |
| list-groceries | pass |  |
| list-packing | FAIL | preset: choose not in [list card say] |
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
| too-much-week | pass |  |
| patch-timer-rounds | FAIL | patch: no ~ patch matching /^(timer\|hiit)$/ |
| patch-weight-stat | pass |  |
| patch-plan-card | pass |  |
| tap-choice-builds-next | pass |  |
| tap-changed-answer | pass |  |
| flow-onboard-goal | pass |  |
| react-build-it | pass |  |
| react-not-sure | pass |  |
| react-no | pass |  |
| dead-status-report | FAIL | preset: sketch not in [card list stat table say ask choose]; preset: row not in [card list stat table say ask choose]; need: none of [card list stat table] |
| dead-logged-water | pass |  |
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
| mention-notes-context | FAIL | preset: sketch not in [list card timer ask plan table]; preset: row not in [list card timer ask plan table]; preset: after not in [list card timer ask plan table]; preset: choose not in [list card timer ask plan table]; need: none of [list card plan table] |
| report-card-done | pass |  |
| report-long-walkthrough | pass |  |
| talk-keep-plan-editable | pass |  |
| talk-typed-on-screen | pass |  |
| report-draw-change | pass |  |
| draw-screen-fix | pass |  |
| report-pages-picture | pass |  |
| menu-shortcut | FAIL | no reply: exit null:  |
| menu-tapped | pass |  |
| group-asked-by-agent | pass |  |
| group-lead-hands-on | FAIL | preset: sketch not in [list table card plan timeline ask choose step done now next]; preset: row not in [list table card plan timeline ask choose step done now next] |
| group-notes-context | pass |  |
| restyle-app-autumn | pass |  |
| idea-shapes-heatpump | pass |  |
| idea-shapes-flywheel | pass |  |
| teach-one-screen | pass |  |
| library-flow-intake | pass |  |
| flow-interview-old-app | FAIL | app build: the yui plugin did not run (/Users/urzas/dev/yuigui/.worktrees/yui/hermes-plugin/yui): spawnSync python3 ENOENT; tap: nothing to tap on build 205 |
| short-status-latest-build | pass |  |
| short-release-go-ahead | FAIL | preset: shapes not in [card say ask choose stat list]; preset: shape not in [card say ask choose stat list] |
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
| where-trip-route | FAIL | words: 65 > 40 |
| where-delivery-area | pass |  |
| where-quick-country | pass |  |
| data-lunch-macros | pass |  |
| list-no-escaped-breaks | FAIL | no reply: exit null:  |
| items-board-cards-drawn | pass |  |
| ui-zip-in-context | pass |  |
| when-two-days-timeline | pass |  |
| facts-stacked-list | pass |  |
| fact-one-sentence | pass |  |
| last-page-next-step | pass |  |
| last-page-walkthrough | pass |  |
| tiles-board-status | pass |  |
| outcome-invite-declined | pass |  |
| outcome-worker-running | pass |  |

## Transcripts

### workout-leg-day (pass)

**Chris:** Leg day. I have 40 minutes, home gym.

Good: A short line, then the session on screen (a checklist or a card) with a way to start (ask or timer). No interrogation: he already said time and gear.

````
Dumbbells and bench, 40 minutes. Warm up first, then work down the list.

```yui
timer 5m "Warm-up: air squats, lunges, leg swings"
list "Leg day" "Goblet squat 4x10 (50 lb)" "DB Romanian deadlift 4x10" "Bulgarian split squat 3x8/leg" "Bench step-ups 3x10/leg" "DB hip thrust 3x12" "Wall sit finisher 60s" +check
timer 90s Rest
save workout
```
````

### workout-tabata (pass)

**Chris:** Give me a 10 minute tabata finisher, I'm ready now.

Good: A timer with work/rest x rounds (it goes full screen by itself) and maybe the move list. No questions first.

````
20 rounds of 20/10, 10 minutes flat. Rotate four moves in order, five times through. Grab a pair of 25s.

```yui
>2 list Finisher "1. DB thrusters" "2. Burpees" "3. Renegade rows" "4. Mountain climbers"
timer 20/10x20 "Tabata finisher"
```
````

### workout-plank (pass)

**Chris:** plank hold, 2 min

Good: One timer line. Almost no chat text.

````
Elbows under shoulders, squeeze glutes, breathe.
```yui
timer 2m Plank
```
````

### workout-gear-question (pass)

**Chris:** I want to train today but I'm at my mom's place, not sure what she has.

Good: Offer the likely gear as a pick with +other, or a camera to snap what is there. One question, not a form.

````
No problem, we'll build around whatever's there. Take a quick look around.

```yui
pick "What's at your mom's?" "Nothing, just floor"|"Sturdy chair"|Stairs|"Backpack to load"|"Water jugs"|"Door frame or towel"|Bands|Dumbbells +other
```
````

### checkin-morning (pass)

**Chris:** morning check-in

Good: Sleep, soreness and energy as sliders or a short form (quoted title), or a plan that walks them one at a time, or the saved `flow workout-checkin` (it asks the same). Not a wall of questions in text.

````
Morning, Chris. Quick check-in, then I'll shape today around it.
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
Solid plate: lean protein, clean carbs, greens. About 635 cal, assuming a palm-and-a-half of chicken (~6 oz).

```yui
list Lunch "Protein: 58 g" "Carbs: 51 g" "Fat: 20 g" "Calories: ~635"
choose "Chicken portion?" "About 4 oz"|"About 6 oz"|"8 oz or more" +other
```
````

### meal-log-no-photo (FAIL)

**Chris:** Can you log my lunch? I'm about to eat.

Good: A camera to snap the plate (the cheapest way to log), maybe a mic as an alternative.

- options: nothing to tap :: ask "Rather describe it?" "Tell you instead"

````
Snap it before you dig in, or just tell me what's on the plate.

```yui
camera "Snap your lunch"
ask "Rather describe it?" "Tell you instead"
```
````

### today-plan (pass)

**Chris:** What should I do today?

Good: Without calendar access it proposes a shape for the day or asks one thing (energy, top priority) as buttons. Remembers Mick at 2 pm. Not a text essay.

````
I can't see your calendar or inbox from here, so this is built around what I know: Mick's 2 pm pickup and your gym.

```yui
timeline "Thursday"
now "Workout, 40 min" at="9:30"
next "Deep work block" at="10:30"
next "Lunch, clear inbox" at="12:30"
next "Leave for Mick" at="1:45"
next "Mick time" at="2:00"
choose "What's the priority today?" "Deep work"|"Errands"|"Home stuff"|"Easy day" +other
```
````

### schedule-call (pass)

**Chris:** Set up a call with Matt next week, 30 minutes.

Good: Offer a few slots as buttons (avoiding 1:30 and 2 pm) with +other. One question.

````
I don't have your calendar or email connected in this session, so I can't check your openings or send the invite yet. Give me the details and I'll have it ready to go.

```yui
plan "Call with Matt" submit="Draft the invite"
form "Which Matt?" name:text email:text
choose "Which week?" "Sep 28 – Oct 2"|"Oct 5 – 9"
pick "Good days" Mon|Tue|Wed|Thu|Fri
choose "Time of day" "Morning, 9–12"|"Early afternoon, 12–2"|"After pickup, 3–5" +other
choose "How?" Zoom|"Google Meet"|Phone +other
end
```
````

### schedule-booking-confirmed (pass)

**Chris:** [yui] note: the barber's booking page confirmed 11:30 am Saturday.

Good: Confirms in one line and freezes the choice with `~choose +lock` (by preset name, since the id came from an earlier reply). Does not re-send the slots.

````
Booked: Saturday 11:30 am.
```yui
~choose +lock
card "Haircut" body="Sat, Sep 26 · 11:30 am"
```
````

### decision-dinner (pass)

**Chris:** Sushi or tacos tonight? I can't decide.

Good: Either just pick one with a reason, or two big buttons. Short.

````
Tacos. Easier win with Mick, and sushi can be your Friday treat.

```yui
choose "Tonight?" Tacos|Sushi|"Cook at home"
```
````

### decision-three-options (FAIL)

**Chris:** Help me pick which to do first this afternoon: invoice Heathos, reply to Paul about Plannix, or fix the Yui site footer.

Good: A recommendation plus the three as buttons (or an ordered list with +check). No essay.

- preset: sketch not in [choose ask list card pick]
- preset: row not in [choose ask list card pick]

````
Invoice Heathos first. It's quick, it gets cash moving, and it's done before Mick's 2 pm pickup.

```yui
sketch "This afternoon" frame=window
row "1. Invoice Heathos: 15 min" +hi note="cash in, quick win"
row "2. Reply to Paul: 20 min" note="unblocks him today"
row "3. Yui footer: open-ended" note="no one waiting"
choose "Start with?" "Invoice Heathos"|"Paul first"|"Footer first" +other
```
````

### list-groceries (pass)

**Chris:** Make me a grocery list for high protein meals this week.

Good: A list with +check, a title, and items that fit on a phone.

````
Here's a week for you and Mick: roughly 150g+ protein a day for you, kid-friendly meals.

```yui
>2 list Protein "Chicken breast 4 lb" "Lean ground beef 2 lb" "Salmon fillets 1.5 lb" "Eggs 2 dozen" "Deli turkey 1 lb" "Canned tuna 4" +check
>2 list Dairy "Greek yogurt 32 oz x2" "Cottage cheese 24 oz" "Milk 1 gal" "String cheese 12" "Shredded cheese" +check
>2 list Produce "Broccoli 2 heads" "Spinach 1 bag" "Bell peppers 4" "Sweet potatoes 4" "Bananas" "Berries 2 pints" +check
>2 list Pantry "Rice" "Whole wheat tortillas" "Black beans 3 cans" "Oats" "Peanut butter" "Protein powder" +check
>2 save groceries
```
````

### list-packing (FAIL)

**Chris:** Mick has a field trip tomorrow to the science museum. Packing list?

Good: A checklist. One line of text.

- preset: choose not in [list card say]

````
Here's Mick's list for tomorrow. Check with the teacher on lunch and spending money.

```yui
list "Field trip: science museum" "Signed permission slip" "Lunch in a disposable, labeled bag" "Refillable water bottle, labeled" "Comfy sneakers" "School shirt, if required" "Light jacket for museum AC" "Sunscreen on before the bus" "Small snack" "Emergency contact card in backpack" +check
save "field trip"
choose "Want a reminder?" "Tonight 7 pm to pack"|"Tomorrow before drop-off"|Both
```
````

### data-weight-trend (pass)

**Chris:** How's my weight trending? Last 7 days: 181, 180.6, 180.2, 179.9, 180.1, 179.4, 178.9

Good: A stat with a delta and a spark, or a line chart. One line of read-out, not a table in text.

````
Down 2.1 lb in a week, a steady trend. The 180.1 bump is just water noise.

```yui
stat 178.9lb Weight delta=-2.1 spark=181|180.6|180.2|179.9|180.1|179.4|178.9
```

That's about 2 lb a week, on the fast end. Fine for now, but if it holds past 2–3 weeks, add ~150 calories to protect muscle.
````

### focus-second-screen (pass)

**Chris:** Start a 25 minute focus timer, and while it runs let's talk through the Plannix launch checklist.

Good: `>2 timer 25m Focus` (second screen) or a timer, plus the start of the checklist.

````
Timer's running on screen 2. I don't have the Plannix checklist yet. Where does it live?

```yui
>2 timer 25m Focus
choose "Plannix checklist" "I'll paste it"|"It's in Notion"|"It's in a doc"|"Build one from scratch" +other
```
````

### teach-compound-interest (pass)

**Chris:** Explain compound interest to Mick, he's 9. Make it something he can play with.

Good: Something interactive: a calc with sliders, or a short deck with a quiz question.

````
Here's a lesson Mick can tap through, with sliders at the end to grow his own money.

```yui
>full
deck "Money That Grows Itself"
page "Your money gets a helper" body="Put $10 in a bank. Every year, the bank adds a little extra, called interest. Here it's 10%, so $1 for every $10."
shapes caption="Your $10 earns $1. Now you have $11."
shape circle $10 +grow
shape arrow
shape blob $11 +pulse tone=mint
page "The helper gets a helper" body="Next year, the bank adds 10% of $11, not $10. Your extra money earns extra money too. It's like a snowball rolling downhill and getting bigger."
shapes caption="Each year the snowball picks up more snow."
shape dot $10
shape arrow
shape circle $11
shape arrow
shape circle $12.10
shape arrow
shape blob $13.31 +pulse tone=mint
page "Wait, and it zooms" body="At first it grows slowly. Then it speeds up. Leave $10 alone for 20 years and it turns into about $67, without adding a penny."
chart line "$10 growing 10% a year" x=Start|5yr|10yr|15yr|20yr y=10|16|26|42|67
choose "You have $10 and it grows 10% a year. How much after 1 year?" "$11"|"$20"|"$10.10" answer="$11"
page "Try it yourself" body="Slide the numbers. P is the money you start with, r is how fast it grows, t is how many years you wait. Which slider makes the biggest pile?"
calc f="A = P*(1+r)^t" P=10-100@10 r=0-0.2@0.05 t=0-30@5
```
````

### theme-autumn (pass)

**Chris:** Make yourself look more autumn.

Good: `theme autumn` and one short line.

````
Autumn it is.
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
Anytime, Chris. Enjoy the day, and have fun with Mick after school. 💪
````

### plain-explain (pass)

**Chris:** In two sentences, what's a deload week?

Good: Two sentences. No screen: he asked for words.

````
A deload week is a planned lighter week, usually every 4 to 8 weeks of hard training, where you cut volume or weight by roughly 40 to 50% while keeping the same movements. It lets your joints, tendons and nervous system catch up so you come back stronger instead of grinding into fatigue or injury.
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
I don't take your password; you'll sign in on Instagram's own page next. Before that I need the reel and a caption. I'll show you a preview before anything goes live.

```yui
plan "Yesterday's reel" submit="Find my reel"
page "What I need" points="The reel: where it lives"|"Caption: your words or my draft"|"Login: Instagram's own sign-in, next step"
choose "Where's the reel?" "Camera roll"|"Instagram drafts"|"Sent to you"|"Shared folder" +other
choose "Caption?" "I'll dictate it"|"You draft it"|"No caption"
form "Caption" caption:voice
end
```
````

### secret-bank (pass)

**Chris:** Connect my bank so you can track my spending. What info do you need?

Good: No account, routing, card or PIN fields. Points to a read-only link (Plaid or an export) instead.

````
I don't need your bank login, and don't send it to me. You sign in on the bank's own page, and I only read transactions.

```yui
choose "How should I see your transactions?" "Bank alert emails"|"Budgeting app (Monarch, Copilot)"|"Monthly CSV exports" +other
```

**Alert emails** is the fastest option. You turn on per-transaction alerts in your bank's app, and I read them from your inbox. The other two are read-only as well.
````

### secret-api-key (pass)

**Chris:** I need to give you the new OpenAI key for the site. Put up a box I can paste it into.

Good: Declines the form, explains where the key goes instead (the environment, not the chat).

````
I can't take keys through chat or a form, since both keep a copy. Put it straight into the site's environment as `OPENAI_API_KEY`, and I'll handle the rest once it's there. Where does the site run?

```yui
choose "Where does the site run?" Vercel|Netlify|Render|"Local .env" +other
```
````

### no-html-pricing (pass)

**Chris:** Show me a clean pricing table for my three coaching tiers: Starter $500/mo 2 calls, Growth $1,500/mo weekly calls, Partner $4,000/mo unlimited.

Good: A YL table (header row then one row per tier) or three cards. No HTML, no markdown table, no JSON.

````
```yui
table "Coaching tiers" Tier|Price|Calls "Starter|$500/mo|2 a month" "Growth|$1,500/mo|Weekly" "Partner|$4,000/mo|Unlimited"
```
````

### too-much-week (pass)

**Chris:** Plan my whole week: 4 workouts, meals, deep work blocks, errands, and Mick pickups.

Good: Six components or fewer: a compact overview (table or a few cards) or one question to start a flow. Not 15 lines.

````
Five answers and I'll lay out Mon Sep 28 through Sun Oct 4.

```yui
plan "Your week" submit="Build my week"
page "Fixed anchors" points="Mick pickup: 2:00 pm, Mon–Fri"|"Workouts: home gym, 45 min"|"Deep work: before pickup"
choose "Best workout time?" "6:00 am"|"Mid-morning"|"Lunch"|"Evening" +other
pick "Workout days" Mon|Tue|Wed|Thu|Fri|Sat|Sun
choose "Deep work shape?" "9–12 daily"|"Two 90-min blocks"|"Mornings Mon–Thu" +other
choose "Meals?" "Full plan + grocery list"|"Dinners only"|"Protein target, I'll improvise" +other
form "Errands this week" errands:voice
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
timer@hiit 40/20x10 Tabata
```
````

### patch-weight-stat (pass)

**Chris:** Weighed in at 178.8 this morning.

Good: `~stat 178.8lb delta=-2.9 spark=...` patching the stat on screen, not a second stat.

````
Nice, another 0.6 down. That's 2.9 this month.
```yui
~stat 178.8lb delta=-2.9 spark=181|180.2|179.4|178.8
```
````

### patch-plan-card (pass)

**Chris:** Swap Thursday to a rest day, my back is tight.

Good: `~card body="Mon legs, Tue push, Thu rest, Sat conditioning"` plus maybe a slide asking how tight. Not a second card.

````
Done. Thursday's rest; take a walk if you're up for it.
```yui
~card body="Mon legs, Tue push, Thu rest, Sat conditioning" cta="10-min back mobility"
```
````

### tap-choice-builds-next (pass)

**Chris:** [yui] n1 choose choice=Legs

Good: Builds the next screen right away (the session or the next question). Does not echo 'You chose Legs'.

````
Legs, about 45 minutes. Warm up first, then work down the list.

```yui
card "Leg day" body="6 moves · ~45 min · dumbbells, bench, bands"
list "Warm-up" "Band lateral walks 2x15 steps each way" "Bodyweight squats 2x10" "Hip hinges 1x10" +check
list "Workout" "Goblet squat 4x10 (50 lb)" "DB Romanian deadlift 4x10 (2x40 lb)" "Bulgarian split squat 3x8/leg (2x25 lb)" "Bench step-ups 3x10/leg (2x20 lb)" "Single-leg calf raise 3x15/leg (1x40 lb)" +check
timer 90s Rest
save workout
```
````

### tap-changed-answer (pass)

**Chris:** [yui] n1 choose choice=Pull changed=true

Good: Adjusts without arguing: swaps the list to a pull session (patch `~list` or a new list). No 'are you sure'.

````
Pull day, then.
```yui
list Pull "Pull-ups 4x6-8" "One-arm DB row 4x10/side" "Chest-supported DB row 3x12" "Band face pull 3x15" "DB hammer curl 3x12" +check
ask "Start?" "Let's go"|"Not yet"
```
````

### flow-onboard-goal (pass)

**Chris:** I want to get back in shape before the holidays. Where do I start?

Good: The first question of a flow as buttons (goal or days per week), or a short plan. Not a 6-field form.

````
About 12 weeks to the holidays, enough to see real change. A few answers and I'll build your first week around your home gym and Mick's 2 pm pickup.

```yui
plan "Back in shape" submit="Build my plan"
page "The approach" points="Strength 3x a week with your dumbbells and pull-up bar"|"Daily walking or easy cardio"|"Protein at every meal"|"Weekly check-in to adjust"
choose "Main goal?" "Lose fat"|"Build muscle"|"Both"|"More energy" +other
choose "Where are you now?" "Not training"|"On and off"|"Training, lost the thread"
choose "Days a week?" 2|3|4|5
choose "Best window?" "Early morning"|"Late morning"|"After 2 pm with Mick"|Evening
form "Anything to work around?" injuries:voice
end
```
````

### react-build-it (pass)

**Chris:** [yui] react msg=3a6ee9c1-4d97-40dd-901f-e5f0a7db1864 emoji=👍 meaning="build it"
> Want me to set up Saturday? Goblet squats 5x5 with the 50s, then a 20 minute tabata, done by 10.

Good: Builds the Saturday plan right away (a list and/or timer). No confirming question, no echo of the reaction.

````
Saturday's set: start at 9:15, done by 10.

```yui
list "Saturday, 9:15 am" "Warm-up: 5 min band pull-aparts, bodyweight squats" "Goblet squat: 5x5 @ 50 lb, 2 min rest" "Tabata: 40/20 x 20 rounds (20 min)" "Rotate: DB thrusters, renegade rows, mountain climbers, burpees" +check
save saturday
menu shortcut "Start Saturday's workout"
```
````

### react-not-sure (pass)

**Chris:** [yui] react msg=0f1d2c3b-4a59-4687-9a0b-1c2d3e4f5a6b emoji=🤔 meaning="not sure"
> I can move your Tuesday call to Wednesday at 3 and book the gym at 5 on Tuesday instead.

Good: Asks the first of a few short questions as one screen (a choose or ask), not a form and not a wall of questions.

````
```yui
choose "What's off about it?" "Keep the call Tuesday"|"Wed 3 pm doesn't work"|"Gym at another time"|"Bigger problem this week" +other
```
````

### react-no (pass)

**Chris:** [yui] react msg=7b8c9d0e-1f2a-4b3c-8d4e-5f6a7b8c9d0e emoji=👎 meaning=no
> Want me to draft a follow-up to the three people who didn't reply last week?

Good: Drops it in a few words. No pushback, no re-offer of the same thing.

````
Dropped, no follow-ups.
````

### dead-status-report (FAIL)

**Chris:** Give me the overnight report on screen. Facts: backups ran at 3:10, all 4 sites up, 2 renewals due Friday (yuigui.com, postscarcity.ai), no errors.

Good: The report as a card, list or stats. The renewals may get a real action ("Renew both"). No "Got it" or "OK" button: a card with nothing to act on has no cta.

- preset: sketch not in [card list stat table say ask choose]
- preset: row not in [card list stat table say ask choose]
- need: none of [card list stat table]

````
All clear, two renewals Friday.
```yui
sketch "Overnight" frame=window
row "Backups: done 3:10 am"
row "Sites: 4 of 4 up"
row "Errors: none"
row "yuigui.com: renews Friday" +hi note="needs you"
row "postscarcity.ai: renews Friday" +hi note="needs you"
choose "Renewals?" "Renew both now"|"Remind me Thursday"|"Check auto-renew" +other
```
````

### dead-logged-water (pass)

**Chris:** Log 2 liters of water for today.

Good: Confirms in a line or a stat. Nothing to tap unless it does something ("Add 500 ml"); never a lone "Nice" or "Got it".

````
I couldn't find a water log to add this to, so the 2 L isn't recorded anywhere yet. Want me to start one?

```yui
ask "Start a water log?" "Yes, log 2 L today"|"I track it elsewhere"
```
````

### dead-plan-submit (pass)

**Chris:** Walk me through planning a weekend trip: where, budget, and dates. I'll answer on screen.

Good: A plan with one step per question, ending in a submit named for what happens ("Send", "Plan it", "Find trips"), not "Create project".

````
Starting with where. Easy drives from home, plus one quick flight.

```yui
choose "Where to?" "Florida Keys"|Orlando|"St. Augustine"|Naples|"Bahamas (short flight)" +other
```
````

### flow-findings-then-questions (pass)

**Chris:** Here are this morning's notes on the site review: the pricing page loads in 4.1 seconds on a phone, mostly two uncompressed hero images; the signup form drops the UTM tags; and the new FAQ block gets the most clicks after the hero. Walk me through what you found, then ask me what to fix first and whether to ship today or tomorrow.

Good: One plan: a page per finding with a real sentence or points, then 'fix first' and 'ship when' as questions, one submit. Not a deck followed by separate questions.

````
Three findings: one slow, one broken, one working.

```yui
plan "Site review" submit="Queue the fix"
page "Pricing page: slow" body="Loads in 4.1 seconds on a phone. Two uncompressed hero images carry most of the weight, so compressing them is the quickest win."
sketch "Pricing page, phone" frame=phone
row "Hero image 1: uncompressed" +hi note="heavy"
row "Hero image 2: uncompressed" +hi note="heavy"
row "Load time: 4.1 s" +x note="too slow"
page "Signup form: drops UTMs" body="The form strips UTM tags on submit, so ad and email signups land as direct traffic. Attribution is blind until this is fixed."
sketch "Signup source" frame=window
row "utm_source=newsletter" +x note="lost on submit"
after
row "Source: newsletter" +hi note="kept"
page "FAQ block: working" body="The new FAQ gets the most clicks after the hero. Visitors want answers before they commit, so it has earned a spot higher on the page."
sketch "Clicks by block" frame=phone
row "Hero: most"
row "FAQ: second" +hi note="new, pulling weight"
row "Pricing table: behind"
choose "Fix first?" "Compress hero images"|"Keep UTM tags"|"Move FAQ higher" +other
choose "Ship when?" Today|Tomorrow
end
```
````

### flow-two-questions-one-plan (pass)

**Chris:** Before you write my new program I want to look over what you changed from last month. You moved squats to Monday, cut the Friday run to 20 minutes, and added a deload in week 4. Show me that, then ask me how many days I can train and what equipment I have now.

Good: One plan: pages with the three changes, then days per week and equipment as steps, one submit.

````
Here's what changed from last month.
```yui
plan "Before the new program" submit="Build my program"
page "What changed" body="Three changes from last month's program."
sketch "Last month's changes" frame=bubble
row "Squats: Monday" +hi note="moved"
row "Friday run: 20 min" +hi note="cut"
row "Week 4: deload" +hi note="added"
choose "How many days can you train?" "2 days"|"3 days"|"4 days"|"5 days" +other
pick "What equipment do you have now?" "Dumbbells to 50 lb"|Bench|Bands|"Pull-up bar"|Barbell|Rack +other
end
```
````

### save-reusable-workout (pass)

**Chris:** Give me a quick 20 minute Tabata I can come back to on busy days.

Good: A Tabata timer (it takes the stage on its own) and a `save` with a short name so it lands on the shelf. No re-asking what they want.

````
Five blocks, 8 rounds each, 20 on and 10 off. Stay on each move for 4 minutes, then switch.

```yui
list "Busy-day Tabata" "0–4 min: DB thrusters" "4–8 min: Push-ups" "8–12 min: DB swings" "12–16 min: Renegade rows" "16–20 min: Mountain climbers" +check
timer 20/10x40 Tabata
save workout
menu shortcut "Busy-day Tabata" say="show workout"
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
Shopping list is on its own screen. What's the protein?
```yui
>2 list@shop "Bibimbap shopping" Eggs Spinach Rice Gochujang Carrots +check
choose "Protein for the bowls?" Beef|Chicken|Tofu|"Just the egg" +other
```
````

### project-timeline (pass)

**Chris:** Where are we on the site rebuild? We shipped the new hero Monday and the pricing page Tuesday, the blog migration is running now, and the contact form and analytics are next. Show me.

Good: One `timeline` with the two shipped items as `done` rows (at=Mon, at=Tue), the blog migration as `now`, then the contact form and analytics as `next`, in that order. At most a short line of chat and maybe one question about what to pull next.

````
Blog migration is live now.
```yui
timeline "Site rebuild"
done "New hero" at=Mon
done "Pricing page" at=Tue
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
Blog's done; the contact form is up next.
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
You're on.
```yui
game tictactoe "Beat me"
```
````

### game-ttt-move (pass)

**Chris:** [yui] n1 game kind=tictactoe move=5 o= x=5

Good: A patch by preset name with the agent's one cell (`~game o=1`), no new game, a word at most.

````
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
Not quite. Heavy squats, lunges and jumping tabata all load a sore knee. Also, your gym has no barbell. Here's a knee-friendly version:

```yui
sketch "Saturday legs" frame=bubble
row "Back squats 5x5" +x note="heavy knee load, no barbell"
row "Walking lunges" +x note="deep bend, shear"
row "Tabata, jumping" +x note="impact"
after
row "Goblet box squat to bench: 3x8" +hi note="pain-free depth"
row "DB Romanian deadlift: 3x10" +hi note="hips, not knees"
row "Glute bridge: 3x12" +hi
row "Tabata: band walks, bridges, plank" +hi note="no jumps"
```

Keep pain at 3/10 or lower, and stop any move that sharpens it.

```yui
choose "Where's it sore?" "Front, kneecap"|"Inside"|"Outside"|"Behind" +other
```
````

### mention-notes-context (FAIL)

**Chris:** [yui] note: in this thread the person asked Arnold, not you: @Arnold does this fit my knee?
[yui] note: Arnold answered here: Swap back squats for box squats and lunges for glute bridges. Keep the tabata.
Ok, update my Saturday plan with that.

Good: The Saturday plan again with Arnold's swaps in it (box squats, glute bridges, the tabata kept), on screen. No questions about what Arnold said.

- preset: sketch not in [list card timer ask plan table]
- preset: row not in [list card timer ask plan table]
- preset: after not in [list card timer ask plan table]
- preset: choose not in [list card timer ask plan table]
- need: none of [list card plan table]

````
I can't find your Saturday plan in my notes, so I can't edit it in place. I can build a knee-safe one around Arnold's swaps, or you can send me the old one.

```yui
sketch "Saturday, knee swaps" frame=bubble
row "Back squats" +x note="knee"
row "Box squats" +hi
after
row "Lunges" +x note="knee"
row "Glute bridges" +hi
row "Tabata" note="kept"
choose "How should I update it?" "Build it fresh"|"Snap the old plan"|"I'll paste it" +other
```
````

### report-card-done (pass)

**Chris:** The worker just finished card INT-18 on the board. Its handoff summary: "A2A bridge: add any A2A agent to Yui by its Agent Card. node adapters/a2a/yui-a2a.ts pair <code> --card <url>, then run; add --card <url> puts more agents on the same machine. Runtime-neutral TypeScript client (src/a2a.ts + src/sse.ts, fetch and an SSE parser only, so the hosted step runs the same code in a Durable Object): A2A 1.0 SendMessage / SendStreamingMessage / SubscribeToTask / GetTask / CancelTask and 0.3 message/send, message/stream, tasks/resubscribe, tasks/get, one version-free shape for callers. The bridge keeps the relay's rules (delivered on pickup, handled after the answer, outbox on disk, one turn at a time per agent). Tests: client.test.ts 42/42; sdk_interop.test.ts 4/4 against the official a2a-sdk servers (1.1.5 and 0.3.26); a2a_e2e.py 66/66 live on throwaway accounts (kill -9 mid-task resumes the same task and answers once) plus the phone run 6/6 on the iPhone 18 Pro sim. No app binary change (INT-18)" Tell me what shipped.

Good: One short line, a card with the headline (A2A agents can join Yui), and the detail as a deck of short pages (what it does, how to add one, the test counts as points). No paragraph relaying the summary.

````
The A2A bridge shipped. No app update needed.

```yui
card "A2A bridge" body="Add any A2A agent to Yui by its Agent Card"
deck "What shipped" +inline
page "Pair an agent" body="Pair once with a code and the agent's card URL, then run. Adding another card puts more agents on the same machine."
page "Works everywhere" body="One small client speaks both A2A versions, 1.0 and 0.3. It uses nothing runtime-specific, so the hosted version can run the same code."
page "Same relay rules" points="Delivered: on pickup"|"Handled: after the answer"|"Outbox: saved on disk"|"Turns: one at a time per agent"
page "Tested" points="Client: 42/42"|"Official SDK servers: 4/4"|"Live end to end: 66/66"|"iPhone sim: 6/6"|"Killed mid-task: resumes, answers once"
choose "What next?" "Pair an agent now"|"Plan the hosted version"|"Show me the command" +other
end
```
````

### report-long-walkthrough (pass)

**Chris:** Walk me through everything that changed in how Yui delivers messages this week: replies are exactly-once both ways with acks, a reply outbox on disk, presence reads online/asleep/offline per agent, pushes skip a phone already watching the thread, agents can be muted, and a paired agent whose gateway never started now says 'not listening yet' with the restart command.

Good: A deck (or plan) of short pages, one change per page, under one short chat line. Not a long bulleted or prose message.

````
Six changes, grouped into four.

```yui
>full
deck "How Yui delivers now"
page "Exactly once, both ways" body="Every message carries an ack. Nothing is lost or doubled. Replies wait in an outbox on disk until the phone confirms, so a crash or dropped connection just resends."
shapes caption="Agent writes to the outbox, phone receives, the ack clears it."
shape box Agent
shape arrow
shape box "Disk outbox" +fill
shape arrow
shape circle Phone +pulse
shape pill Ack tone=mint +grow
page "Presence per agent" body="Each agent shows its own state. A paired agent whose gateway never started now says so, with the restart command beside it."
sketch "Agents" frame=phone
row "Urza: online" +hi
row "Coach: asleep"
row "Scout: offline"
row "Helper: not listening yet" +hi note="restart command shown"
page "No double buzz" body="If the phone is already open on that thread, the push is skipped. The message just appears."
shapes caption="Watching the thread means no push."
shape box Reply
shape arrow
shape circle "Phone on thread" tone=mint +fill
shape pill Push +dash tone=mute
page "Mute an agent" body="A muted agent still delivers to its thread, just without pushes."
sketch frame=phone
row "Scout  Muted" +hi note="no pushes"
row "Mute" +button
choose "What next?" "Check who's not listening"|"Mute an agent"|"Why do you ask?" +other
end
```
````

### talk-keep-plan-editable (pass)

**Chris:** Lay out my runs for this week somewhere I can keep looking at it, and I'll tell you what to change as the week goes.

Good: The week on a page (`>2 list@runs Runs "Tue 5k"|"Thu 5k"|"Sat 10k" +check`) with `>2 talk` so they can type changes right there, and one short line in the chat.

````
Here's Thursday through Sunday, mornings before Mick's 2 pm pickup and ahead of the heat. Distances are my starting guess; type on that screen to change anything.

```yui
>2 timeline "Runs this week"
>2 now "Easy 4 mi, 7 am" at=Thu
>2 next "Rest + 15 min mobility" at=Fri
>2 next "Long 7 mi, 6:30 am" at=Sat
>2 next "Recovery 3 mi, 7 am" at=Sun
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
>2 say Thursday's a swim now.
```
````

### report-draw-change (pass)

**Chris:** What changed in how you word your updates to me? You used to write things like "Parked YUI-83, feedback #2291 attached". Now you just say what the card is, like "Parked the drawing card, your note is on it". Show me the difference, don't describe it.

Good: One short line and a `sketch` (a bubble fits) with the old wording struck out (+x) and the new wording highlighted (+hi), ideally split with `after`, a note or two. No paragraph explaining it.

````
Ids out, plain words in.
```yui
sketch "How I word updates" frame=bubble
row "Parked YUI-83, feedback #2291 attached" +x note="ids mean nothing"
after
row "Parked the drawing card, your note is on it" +hi note="says what it is"
```
````

### draw-screen-fix (pass)

**Chris:** The build-ready screen shows the headline, two lines of notes, then a Got it button and an Install button. Which of those should go, and why? Show me on the screen itself.

Good: A `sketch` of the screen (frame=phone) with the headline and notes as rows, Got it as a +button row struck out (+x) with a short note (it does nothing), Install as a +button row highlighted. At most a line of chat.

````
The Got it button goes. It only acknowledges and does nothing, while Install is the one action that matters.

```yui
sketch "Build ready" frame=phone before=Now
row "Build 82 is ready" +hi
row "Add any A2A agent by its Agent Card"
row "Tested: client 42/42, e2e 66/66"
row "Got it" +button +x note="does nothing"
row "Install" +button
after Fixed
row "Build 82 is ready" +hi
row "Add any A2A agent by its Agent Card"
row "Tested: client 42/42, e2e 66/66"
row "Install" +button +hi note="the one action"
```
````

### report-pages-picture (pass)

**Chris:** Walk me through the three changes to how you write updates to me this week, one at a time: you name cards in plain words instead of ids like YUI-83, a long update comes as pages instead of a wall of text, and cards no longer end in a 'Got it' button that does nothing. For each one, show me what it looked like before and after.

Good: One short line and a deck of three pages, one change each, and each page's picture a sketch right after it: the old wording or button struck out (+x), the new one highlighted (+hi), ideally split with `after`. No paragraph.

````
Three changes, one page each.

```yui
>full
deck "How updates changed this week"
page "Plain names, not ids" body="Cards are named for what they are, so you know which one without looking it up."
sketch frame=bubble before=Before
row "Parked YUI-83 in the backlog" +x note="an id means nothing"
after After
row "Parked the drawing card in the backlog" +hi note="plain words"
end
page "Pages, not a wall" body="A long update comes as a headline card and a few short pages you swipe through."
sketch frame=phone before=Before
row "Build 82 is ready. Latest change: A2A bridge: add any A2A agent by its Agent Card. Tests: client 42/42, interop 4/4, e2e 66/66..." +x note="one long bubble"
after After
row "Build 82: add any A2A agent" +hi note="headline card"
row "A2A agents  ·  Tested" +button note="short pages"
end
page "No dead buttons" body="A card with nothing to act on has no button. When there is one, it does something."
sketch frame=bubble before=Before
row "Invoice sent to Dana" 
row "Got it" +button +x note="does nothing"
after After
row "Invoice sent to Dana" +hi note="no button needed"
row "Open TestFlight" +button note="real action, when there is one"
end
choose "What next?" "Keep all three"|"Tweak one"|"Why do you ask?" +other
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
Here's the draft: same lifts, half the sets, lighter weight.

```yui
card "Deload week" body="3 sessions, 30 min, mornings before Mick's 2 pm pickup. Weights about 60%, stop 4 reps short of failure."
table "The week" Day|Session "Mon|Goblet squat 2x8, DB bench 2x8, pull-ups 2x5" "Wed|DB RDL 2x8, one-arm row 2x10, band pull-aparts 2x15" "Fri|Split squat 2x8, DB press 2x8, plank 2x30s" "Tue/Thu|20-min walk, mobility"
choose "When should it start?" "Next Monday"|"This weekend"|"After one more hard week" +other
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
Taper week: easy early, sharp midweek, fresh legs Saturday. All runs at 7:00 am.

```yui
timeline "Runs before the 10k"
next "Easy 30 min, conversational" at="Mon 7:00"
next "Easy 35 min + 4 x 20s strides" at="Tue 7:00"
next "Sharp: 3 x 1 km at 10k pace, 2 min jog" at="Wed 7:00"
next "Easy 25 min" at="Thu 7:00"
next "Shakeout 20 min + 4 strides" at="Fri 7:00"
next "10k race" at=Sat
save race week
```
````

### group-lead-hands-on (FAIL)

**Chris:** [yui] group "Race week" thread=g1 with=urza,arnold lead=urza hop=0 from=person msg=m1
My 10k is Saturday. Block my week: calls after 10, errands Wednesday at 4, and get the training runs set.

Good: Blocks the week (calls after 10, errands Wednesday 4 pm) on screen, and hands the training runs to @arnold in one plain sentence instead of writing a training plan itself.

- preset: sketch not in [list table card plan timeline ask choose step done now next]
- preset: row not in [list table card plan timeline ask choose step done now next]

````
Drafted; nothing's on your calendar yet. Wednesday already passed, so which one do you mean?

```yui
sketch "Race week blocks" frame=window
row "Thu–Fri: no calls before 10" note="mornings held"
row "Sat Sep 26: 10k" +hi note="whole morning clear"
row "Wed errands, 4 pm" +hi note="which Wednesday?"
row "Mick pickup: 2 pm daily" note="kept clear"
choose "Errands on" "Wed Sep 30"|"Move to Fri 4 pm"|"Skip this week" +other
```

@arnold please set Chris's training runs for Thu–Fri before Saturday's 10k, in the morning slots before 10.
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
Run at 5:45 am, before the call. It's the coolest part of a Florida day, and you're done and showered by 6:45. If that's too early, 6:30 pm works after Mick's evening settles.

```yui
choose "Thursday run" "5:45 am"|"6:30 pm" +other
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
Its refrigerant runs colder than the outdoor air, so it soaks up heat even at 20°F. The compressor squeezes that heat hotter and dumps it indoors.

```yui
shapes "Heat pump in winter" caption="Cold refrigerant pulls heat from outside air, the compressor squeezes it hot, indoor coil releases it, the valve cools it again."
shape blob "Outside air" tone=lavender
shape arrow
shape box "Cold coil" tone=mint
shape arrow
shape circle Compressor +pulse
shape arrow
shape box "Hot coil" tone=butter +fill
shape arrow
shape pill House +grow
```
````

### idea-shapes-flywheel (pass)

**Chris:** Explain the flywheel idea for Yui in one picture: more people use it, we see which screens agents reach for, the good ones become presets, agents get better, more people use it.

Good: A `shapes` loop (placed with at= or a row with arrows back to the start) with a caption, maybe one +pulse. Words kept to a line.

````
```yui
shapes "The Yui flywheel" caption="More people use Yui, we see which screens agents reach for, the good ones become presets, agents get better, and more people come."
shape circle "More people" at=5,1 +grow tone=mint
shape arrow
shape box "Screens seen" at=8,3 +fill tone=lavender
shape arrow
shape pill Presets at=5,5 +fill tone=butter
shape arrow
shape box "Better agents" at=2,3 +fill tone=mint
shape arrow
shape circle "More people" at=5,1 +pulse tone=mint
```
````

### teach-one-screen (pass)

**Chris:** Explain compound interest to me. Show me the math and let me play with the numbers.

Good: One short line, then `>full` and ONE deck: a page per idea, the diagram, math, chart and stat each right after its page as its picture, a quiz, the calc on the last page. Nothing loose in the chat or on the stage beside the deck, no `close` after it.

````
Compound interest is interest that earns its own interest, so your money grows faster every year.

```yui
>full
deck "Compound interest"
page "Money that grows on itself" body="Each year you earn interest on your deposit plus all the interest you already earned. The pile you earn on keeps getting bigger."
shapes caption="$100 at 10% becomes $110, then $121, because year two earns on $110."
shape circle $100 +grow
shape arrow
shape blob $110 tone=mint
shape arrow
shape blob $121 +pulse tone=mint
page "Where the formula comes from" body="Each year multiplies the balance by (1 + r). Do that t times and you get the formula."
math \text{Year 1: } P(1+r) \\ \text{Year 2: } P(1+r)(1+r) = P(1+r)^2 \\ \text{Year } t\text{: } A = P(1+r)^t
page "It bends upward" body="Simple interest adds the same $10 every year. Compound interest adds more each year, so the gap keeps widening."
chart line "$100 at 10% a year, compounded" x=Y0|Y5|Y10|Y15|Y20 y=100|161|259|418|673
page "Rule of 72" body="To estimate how long it takes to double your money, divide 72 by the rate. At 8% that's about 9 years. At 6% it's about 12."
choose "At 10% a year, about how long until $100 becomes $200?" "5 years"|"7 years"|"10 years" answer="7 years"
page "Try it" body="Slide the deposit, rate and years. Time is the strongest lever."
calc f="A = P*(1+r)^t" P=100-10000@100 r=0-0.15@0.01 t=0-40@1
end
```
````

### library-flow-intake (pass)

**Chris:** A new client just sat down with me, she wants a website for her bakery. Walk her through everything you need from her, on my phone.

Good: One short line and `flow website-intake`: the saved intake flow asks everything, branching on their answers. Not a hand-built plan of the same questions.

````
Here's the website brief for her. Hand her the phone.
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
Let's build your brief. Answer as briefly or deeply as you like.

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

- preset: shapes not in [card say ask choose stat list]
- preset: shape not in [card say ask choose stat list]

````
0.3.2 is building; TestFlight in about 40 minutes. The faster Send tap isn't in it yet.
```yui
shapes "0.3.2" caption="Building now, on TestFlight in about 40 min"
shape circle Worker +pulse
shape arrow
shape box "Keys + chords"
shape arrow
shape pill TestFlight +dash
```
````

### doing-long-turn (FAIL)

**Chris:** What needs me today? Check my calendar, my mail and the board. (This turn runs on the host with tools and takes about a minute: calendar first, then mail, then the board. Write everything you send during the turn, in order, as one reply. What the tools returned: gcal_list_events: 10:00 call with Dana (30 min), 4:00 design review. gmail_search: two need a reply today, the venue contract from Sam and a question about an invoice. kanban board: one card waits on you, t_627321c6 (YUI-SHIP 0.3.3), asking whether to ship without the tuner.)

Good: doing lines as it goes, plain words and a step ("Reading your calendar" 1/3, "Checking your mail" 2/3, "Looking at the board" 3/3), no card ids or tool names; then the answer: two calls, two replies to send, one choice on the tuner (YUI-63).

- preset: sketch not in [card say ask choose list check timeline stat deck page done now next]
- preset: row not in [card say ask choose list check timeline stat deck page done now next]

````
```yui
doing "Reading your calendar" 1/3
doing "Checking your mail" 2/3
doing "Looking at the board" 3/3
```
Five things today.
```yui
sketch "Today" frame=window
row "10:00 Call with Dana: 30 min"
row "4:00 Design review"
row "Venue contract from Sam: reply today" +hi note="waiting on you"
row "Invoice question: reply today" +hi note="waiting on you"
row "Ship 0.3.3 without the tuner?" +hi note="your call"
choose "Ship 0.3.3 without the tuner?" "Ship it"|"Wait for tuner"|"Tell me more"
```
````

### music-jam-beat (pass)

**Chris:** Trying to get back into drumming. Give me a simple boom bap beat around 90 I can mess with.

Good: One `loop` line near 90 BPM with a boom bap pattern in `p=` that plays (`+play`), a short line at most. No pattern written out in words, no drum tab, no advice paragraph.

````
Boom bap at 90. Edit it while it plays.
```yui
loop 90 "Boom bap" rows=kick|snare|hat p=x..xx...|..x...x.|xxxxxxxx +play
```
````

### music-finger-drums (pass)

**Chris:** Waiting on a call. Let me just tap out some drums on my phone for a minute.

Good: One `drums` line (2x2 or 4x4), a few words at most.

````
Pads are up.
```yui
drums 2x2
```
````

### music-beat-sent (pass)

**Chris:** [yui] n1 loop bpm=94 swing=25 steps=8 rows=kick|snare|clap|hat|open|rim|tom|shaker p=x..xx.x.|....x...|..x...x.|xxxxxxxx||||
Sent my beat, 94 BPM

Good: The person's version patched in by preset name (`~loop p=... bpm=94 swing=25`) and a `save` with a short name, a line at most. No re-sent loop, no critique of the beat.

````
Locked in at 94, swing 25.
```yui
~loop bpm=94 swing=25 p=x..xx.x.|....x...|..x...x.|xxxxxxxx||||
save beat
```
````

### show-phase-one (pass)

**Chris:** Walk me through phase one. (What you know: phase one of the full-screen change. Answers play as full-screen chunks, and the chat is just the record, top right. Bottom right: a bigger mic, a T that opens the text field, and a + for attachments, including images. Settings sit behind a hamburger at top left, beside the agent picker.)

Good: A line and a drawing per part: the stage with a chunk on it, the record top right, the new bottom bar (big mic, T, +). Never a page with a heading over a paragraph (feedback AL1My-stUBnvtXD2WKV7ec8, YUI-119).

````
Phase one, in three parts.

```yui
deck "Phase one" +inline
page "Answers take the whole screen" body="Each answer plays as a full-screen chunk. The chat stays as the record, one tap away at top right."
sketch "Answer" frame=phone
row "Chat" +button note="the record, top right"
row "Yes. Build 160, the newest." +hi note="one chunk, full screen"
end
page "Talk first" body="The bottom bar leads with a bigger mic. T opens the text field when they want to type, and + attaches files, images included."
sketch "Bottom bar" frame=phone before=Now
row "+  Say something nice  Mic" +button +x note="field always open"
after New
row "+   T   Mic" +button +hi note="big mic; T opens the field"
end
page "Settings tucked away" body="Settings move behind a hamburger at top left, beside the agent picker."
sketch "Top bar" frame=phone
row "☰  Yui ▾" +button +hi note="settings, then agent picker"
row "Chat" +button note="top right"
end
choose "What next?" "Plan phase two"|"Change a part"|"Why do you ask?" +other
end
```
````

### show-new-layout (pass)

**Chris:** Show me the bigger microphone. Does the text field look better? I want to see the new layout of big microphone, T for text and + to attach. Remember, I want you to show me this. (What you know: phase one of the full-screen change. Answers play as full-screen chunks, and the chat is just the record, top right. Bottom right: a bigger mic, a T that opens the text field, and a + for attachments, including images. Settings sit behind a hamburger at top left, beside the agent picker.)

Good: The bottom bar drawn: `sketch frame=phone` with `+button` rows for +, T and the big mic, ideally before and after (the old always-there field struck out). Not a description of it (feedback AL1My-stUBnvtXD2WKV7ec8).

````
The text field now stays tucked away until you tap T, so the bar is calmer.
```yui
sketch "The new layout" frame=phone
row "☰  Yui ▾" +button note="settings, agent picker"
row "Chat" +button note="the record, top right"
row "Yes. Build 160, the newest." +hi note="answer, full screen"
row "+        T        🎤" +button +hi note="big mic, bottom right"
sketch "Bottom bar" frame=phone before=Now
row "+  Say something nice  🎤" +button +x note="field always open, small mic"
after New
row "+        T        🎤" +button +hi note="T opens the field"
row "📷  🖼  📎" +button note="+ attaches, images too"
choose "What next?" "Tap T to see the field"|"Mic bigger still"|"Looks right"
```
````

### music-keys-scale (pass)

**Chris:** Learning piano again. Give me something to noodle around A minor pentatonic on.

Good: One `keys Am pentatonic` line (a title or +send is fine), a short line at most. No list of note names, no fingering advice paragraph.

````
Only A, C, D, E and G will sound, so nothing you hit is wrong.
```yui
keys Am pentatonic
loop 80 "Slow groove" p=x...x.x.|....x...|........|x.x.x.x. +play
```
````

### music-chords-song (pass)

**Chris:** I want to strum along to one of those four chord pop songs on my uke. G is a good key for me.

Good: One `chords` line in G (`chords G I-V-vi-IV` or `chords G|D|Em|C`), a short line at most. No chord names in a paragraph, no chord diagrams in text.

````
The four-chord classic in G: G, D, Em, C. Down-down-up-up-down-up.
```yui
chords G I-V-vi-IV
```
````

### music-tuner-guitar (pass)

**Chris:** Just restrung my acoustic and it sounds awful. Help me get it in tune.

Good: One `tuner guitar` line, a short line at most. No list of string notes and frequencies, no advice on tuning by ear.

````
New strings stretch, so expect a few passes. Low E to high E.

```yui
tuner guitar
```
````

### music-metronome-practice (pass)

**Chris:** Working on my strumming timing. I want to practice slow, like 70 bpm in 4/4.

Good: One `metronome 70` line (beats=4 is fine), a short line at most. No paragraph of practice tips, no counting in words.

````
Click's set. Strum down on every beat first, then add the ups.
```yui
metronome 70
```
````

### explain-mongols-geography (pass)

**Chris:** All right, can you give me a brief geographic explanation of the Mongols?

Good: One line with the answer, then one deck on `>full` where every page has its picture: the empire as a `map` (its outline in lat,lon points, Karakorum as a pin, routes east and west), the size as a `chart` or a `stat`. Not pages of text, and not the steppe drawn as dots in `shapes` (TestFlight feedback AJIE1_1Ru1V4EMgmpWZtniI: 'It's just a text bomb'; feedback AL2nKEYo on the shapes version: 'Again, not bad but this should be a Map').

````
From the Mongolian grassland, the Mongols built the largest land empire in history, reaching from Korea to Hungary in about 60 years.

```yui
>full
deck "The Mongols, by the map"
page "Where they started" body="Horse herders on the high steppe between the Siberian forest and the Gobi Desert. Temüjin united the tribes near the Onon River and became Genghis Khan in 1206."
map caption="Grassland to the north, desert to the south: good for horses, hard for farms."
area Mongolia MN tone=mint
pin@onon "Onon River" 48.8,110.5 +pulse
pin@ka Karakorum 47.2,102.8
page "How far they rode" body="The steppe was a highway for horsemen. It ran west through Central Asia to Persia and Russia, and south into China."
map caption="Karakorum sat in the middle and rode out every way."
area "Mongol Empire" 53,140|43,131|34.7,126.5|22.3,114|24,98|34,70|25.5,57|33,44|41,31|46,30.5|54,23|60,56|55,95 tone=butter
area Raided PL|HU +dash
pin@ka Karakorum 47.2,102.8 +pulse
route East ka|37.6,127 +arrow
route West ka|50.4,30.5 +arrow
page "The biggest on land" body="At its peak in 1279 it covered about a sixth of Earth's land."
chart bar "Land empires, million km²" x=Mongol|Russian|Qing|Roman y=24|22.8|14.7|5
page "Split in four" body="After 1260 the empire broke into four khanates, each ruled by a line of Genghis's descendants."
map caption="Four khanates, one family, often at war with each other."
area "Yuan (China)" CN|MN|KR tone=butter
area "Golden Horde" 57,30|57,60|48,75|42,55|44,35|47,28 tone=lavender
area "Chagatai" 48,75|45,90|37,80|37,62|42,55 tone=mint
area "Ilkhanate" IR|IQ|AZ|AM|TM tone=mute
choose "What next?" "How they conquered"|"The Silk Road"|"Why it fell"|"Quiz me" +other
end
```
````

### explain-rome-rise-fall (pass)

**Chris:** Give me the quick version of how the Roman Empire rose and fell.

Good: A line, then a picture per part: the empire at its peak as a `map` around the Mediterranean, its size over the centuries as a `chart` (or a `timeline` on the stage), the split as an east and west area. No page that is only a heading and a paragraph.

````
Rome grew from one city into a Mediterranean empire, split in two, and lost the West in 476. The East lasted until 1453.

```yui
>full
deck "Rome, rise and fall"
page "From city to sea" body="A republic from 509 BC. Wars with Carthage (264–146 BC) won the western Mediterranean, then Greece and the East. Caesar's civil war ended the republic; Augustus became the first emperor in 27 BC."
map caption="Rome took Italy first, then everything around the sea."
area Italy IT tone=butter
area "Won by 146 BC" ES|TN|GR|MK +dash
pin@rome Rome 41.9,12.5 +pulse
route Carthage rome|36.85,10.3 +arrow
route Greece rome|37.98,23.7 +arrow
page "The peak, 117 AD" body="Under Trajan it ran from Britain to Mesopotamia, about 60 million people around a sea Romans called 'our sea'."
map caption="At its height, every Mediterranean shore was Roman."
area "Roman Empire" GB|FR|BE|ES|PT|IT|CH|AT|SI|HR|BA|RS|ME|AL|MK|GR|BG|RO|TR|CY|SY|LB|IL|JO|EG|LY|TN|DZ|MA tone=butter
pin Rome 41.9,12.5 +pulse
pin Constantinople 41.0,28.98
page "How big, over time"
chart line "Roman land, million km²" x="200 BC"|"50 BC"|"117 AD"|"390 AD"|"476 AD" y=0.8|1.95|5|4.4|1.5
page "Why the West fell" body="Too much border, civil wars, a weak currency, then a split into East and West in 395. Germanic peoples pushed in; Rome was sacked in 410, and in 476 the last western emperor was deposed."
shapes caption="Strain from within, pressure from outside, then the West gave way."
shape box Overstretch
shape arrow
shape box "Split 395"
shape arrow
shape pill Invasions +pulse
shape arrow
shape circle "476" tone=mute +fill
choose "What next?" "Why the East survived"|"Rise of Caesar"|"Fall, in more depth" +other
end
```
````

### explain-monsoon-how (pass)

**Chris:** Why does India get monsoons? Keep it short.

Good: One line and a picture: land heats, air rises, wet air off the ocean moves in, as a diagram in `shapes` with arrows or a `map` with the winds as routes, maybe a rainfall `chart` by month. Not a paragraph of weather words.

````
Summer heats the land faster than the ocean, so warm air rises over India and pulls in moist ocean wind. The Himalayas force that wind up, and it rains.

```yui
shapes "The summer monsoon" caption="Hot land draws wet sea air north; mountains squeeze the rain out. In winter it reverses and turns dry."
shape blob "Indian Ocean" tone=mint
shape arrow
shape circle "Hot land" +pulse tone=butter
shape arrow
shape box Himalayas +fill tone=mute
shape arrow
shape pill Rain +grow tone=lavender
```
````

### where-trip-route (FAIL)

**Chris:** Thinking about a train trip from Lisbon to Barcelona with stops in Porto and Madrid. How does that route go?

Good: One line, then a map: pins on Lisbon, Porto, Madrid and Barcelona, a route through them with an arrow, a caption with the rough hours (a small `table` of the legs beside it is fine). Not a numbered list of legs in words.

- words: 65 > 40

````
It's a big loop: north up Portugal, across Galicia to Madrid, then east to Barcelona. Porto to Madrid has no direct train, so the usual link runs via Vigo and Ourense.

```yui
map "Lisbon to Barcelona by rail" caption="North to Porto, over the border through Galicia, down to Madrid, then east to the coast."
pin@li Lisbon 38.72,-9.14
pin@po Porto 41.15,-8.61 +pulse
pin@vi Vigo 42.24,-8.72
pin@ou Ourense 42.34,-7.86
pin@ma Madrid 40.42,-3.70 +pulse
pin@ba Barcelona 41.39,2.17
route "The trip" li|po|vi|ou|ma|ba +arrow
list Legs "Lisbon to Porto: about 3 hr, Alfa Pendular" "Porto to Vigo: about 2.5 hr, Celta train" "Vigo to Madrid: about 4.5 hr, high speed via Ourense" "Madrid to Barcelona: about 2.5 hr, AVE or Ouigo"
```

Porto to Madrid is the slow day, about 7 to 8 hours with a change, so it may be worth a night in Vigo. Times are approximate, so check current schedules before you book.
````

### where-delivery-area (pass)

**Chris:** Our farm delivers CSA boxes across Vermont, New Hampshire and western Massachusetts. Can you show a new customer what that covers?

Good: One line, then a map with the delivery area filled in (VT and NH by code, western Massachusetts as lat,lon points) and the farm or the big towns as pins. Not a list of states and counties.

````
Here's the delivery area for new customers.

```yui
map "Where our CSA boxes go" caption="All of Vermont and New Hampshire, plus western Massachusetts."
area Vermont 45.01,-73.34|45.01,-71.5|44.25,-72.05|43.6,-72.3|42.73,-72.46|42.73,-73.26|43.6,-73.3|44.5,-73.35 tone=mint
area "New Hampshire" 45.3,-71.08|43.08,-70.7|42.87,-70.82|42.7,-71.3|42.73,-72.46|43.6,-72.3|44.25,-72.05|45.01,-71.5 tone=lavender
area "Western Mass" 42.73,-73.26|42.72,-72.1|42.02,-72.1|42.05,-73.49 tone=butter
pin Burlington 44.48,-73.21
pin Concord 43.21,-71.54
pin Northampton 42.32,-72.63
```
````

### where-quick-country (pass)

**Chris:** Where exactly is Kyrgyzstan?

Good: One line (Central Asia, between Kazakhstan and China) and a map in the chat: KG as an area with a pulse on Bishkek, neighbors faint. No deck for a quick where.

````
Central Asia, landlocked in the Tian Shan mountains, wedged between Kazakhstan and China.

```yui
map "Kyrgyzstan" caption="North: Kazakhstan. East: China. South and west: Tajikistan and Uzbekistan."
area Kyrgyzstan KG tone=mint +pulse
area Neighbors KZ|CN|TJ|UZ tone=mute
pin Bishkek 42.87,74.59
pin "Issyk-Kul" 42.45,77.25
```
````

### data-lunch-macros (pass)

**Chris:** Give me a quick lunch idea with 30g of protein.

Good: One line naming the lunch and a real Yui Lines table (`table Macros Food|Protein|Cal "Chicken|35g|165" ...`) or stat tiles for the macros. Not a quoted title plus `columns:` rows and `end` (GLM 5.2 on YUI-131, every row a parse error), and not a markdown table.

````
Tuna wrap, about 5 minutes, about 32 g protein.

```yui
card "Greek yogurt tuna wrap" body="Mix 1 can tuna (drained) with 2 tbsp plain Greek yogurt, mustard and pepper. Roll in a whole wheat tortilla with spinach and sliced cucumber."
table "Macros" Item|Protein|Calories "Tuna, 5 oz can|25 g|120" "Greek yogurt, 2 tbsp|3 g|20" "Whole wheat tortilla|4 g|130" "Total|32 g|270"
```
````

### list-no-escaped-breaks (FAIL)

**Chris:** What should I eat for dinner tonight? Something with protein. I'm allergic to peanuts and shellfish.

Good: A few dinners as a `list` (or cards), one per item, and a way to pick one. Never one `say` with \n breaks inside the quotes: the app shows the letter n (YUI-161, GLM 5.2 on native Basil).

- no reply: exit null: 

````
(no reply: exit null: )
````

### items-board-cards-drawn (pass)

**Chris:** Anything waiting on me?

Good: One short line, then the two items drawn: a sketch with one row per card (title plus one fact) or a list or two cards, so he sees them. Not a paragraph counting the cards and listing what is in them.

````
Two cards.
```yui
sketch "Waiting on you" frame=bubble
row "Justice Watch: 4 articles, 2 rewrites" +hi note="approve to publish"
row "Aaron's roundup: post and landing link" +hi note="needs your OK"
choose "Open which?" "Justice Watch"|"Aaron's roundup"
```
````

### ui-zip-in-context (pass)

**Chris:** Tell me about the newest change on the closing purple box.

Good: One short line, then the box drawn in a phone sketch: the ZIP field and the two buttons in place, the new part highlighted. Not a paragraph describing the field, and no hyphen lines (Chris, TestFlight: "Show me the zip in context. You should be able to illustrate UI elements fairly easily").

````
The purple box got the client's final copy, a working ZIP field, and a two-question form that feeds the lead record (Sep 24).

```yui
sketch "Closing purple box" frame=phone before=Before
row "Red placeholder frame" +x note="removed"
after Sep 24
row "Client's final copy, word for word" +hi note="final copy"
row "Your ZIP  _____" +hi note="working field"
row "Two questions" +hi note="answers go to the lead"
row "See My Coverage Options" +button
row "Talk to a Licensed Advisor" +button
```
````

### when-two-days-timeline (pass)

**Chris:** What did we change on the quote site two days earlier, on Sep 22 and 23?

Good: One short line, then a timeline: the Sep 22 and Sep 23 changes as rows with their dates, oldest first. Not a sentence with the dates inside it (Chris: "If we're talking about some two days earlier, we need some type of timeline. Show me visually").

````
Three polish fixes, all live.
```yui
timeline "Quote site, Sep 22 to 23"
done "Real brand logos on the /brands family cards" at="Sep 22"
done "Bigger field labels on the calculator" at="Sep 23"
done "Last four form eyebrow labels fixed" at="Sep 23"
```
````

### facts-stacked-list (pass)

**Chris:** List the small fixes we made on the quote site.

Good: Three or more facts as one stacked list (or a table), each row Label: value. Not one line per fix with hyphens, and never a list of one (Chris: "These were all supposed to be in a stacked list").

````
Four small fixes on the quote site.
```yui
sketch "Quote site fixes" frame=window
row "Brand cards: real logos" note="/brands families"
row "Calculator: bigger field labels"
row "Form eyebrows: last four fixed"
row "Closing box: red placeholder gone"
```
````

### fact-one-sentence (pass)

**Chris:** Anything else fixed on the forms?

Good: One fact, so one plain sentence: the last four eyebrow labels on the forms were fixed. No hyphen, no list of one (Chris: "If there's only one thing hyphenated, it doesn't mean anything").

````
Just one: the last four eyebrow labels on the quote site forms are fixed.
````

### last-page-next-step (pass)

**Chris:** Walk me through the most recent changes we've done for the quote site.

Good: Short answer first, then a deck or plan of the changes (each with its picture, at most 4 pages) whose last step is a `choose` of what to do next or 'Why do you ask?', never a page they can only read (Chris: "we are on the last card and I want some type of action here. I don't want a user to land here and not know what to do next").

````
Latest first: the closing box on Sep 24, then three polish fixes on Sep 22–23.

```yui
>full
deck "Quote site: recent changes"
page "Closing box, final copy" body="Sep 24. The purple box at the bottom now has the client's copy, word for word, and the red placeholder frame is gone."
sketch "Closing box" frame=phone before=Before
row "Placeholder copy" +x note="red frame"
after After
row "Client's final copy, word for word" +hi note="exact"
page "ZIP and a two-question form" body="Sep 24. Visitors enter a ZIP and answer two questions. The answers go straight into the lead record."
sketch "Closing box" frame=phone
row "Your ZIP  33410" +hi note="working field"
row "Question 1  ·  Question 2" +hi note="saves to the lead"
row "See My Coverage Options" +button
row "Talk to a Licensed Advisor" +button
page "Polish, Sep 22–23" body="Real logos on the brand family cards, bigger calculator labels, and the last four form eyebrow labels fixed."
sketch "Before and after" frame=window
row "Placeholder logos on /brands cards" +x
row "Small calculator labels" +x
row "Four broken form eyebrows" +x
after
row "/brands: real brand logos" +hi
row "Calculator: bigger labels" +hi
row "Forms: eyebrows fixed" +hi
choose "What next?" "Open the site"|"Test the form"|"Queue the next change" +other
end
```
````

### last-page-walkthrough (pass)

**Chris:** Walk me through what changed on the closing purple box, step by step.

Good: A deck (or plan) of the changes, each with its picture, and the last step is something to tap: a `choose` of what to do next or 'Why do you ask?'. No dead end.

````
Four changes, one screen each.
```yui
>full
deck "The closing purple box"
page "1. Real copy" body="The red placeholder frame is gone. The client's final copy sits there now, word for word."
sketch frame=phone before=Before
row "Red placeholder frame" +x note="removed"
after After
row "Client's final copy, word for word" +hi note="exact wording"
end
page "2. A ZIP field" body="Visitors enter their ZIP right in the box, and the field works."
sketch frame=phone
row "Client's final copy"
row "Your ZIP  _____" +hi note="new, working"
end
page "3. Two questions, into the lead" body="A two-question form sits under the ZIP. The answers land in the lead record."
shapes caption="Answers go straight into the lead record."
shape box "Two questions" +grow
shape arrow
shape pill "Lead record" +pulse tone=mint
page "4. New buttons" body="Two buttons close the box."
sketch frame=phone
row "See My Coverage Options" +button +hi
row "Talk to a Licensed Advisor" +button +hi
end
choose "What next?" "Open the live page"|"Test the form"|"Change something"
end
```
````

### tiles-board-status (pass)

**Chris:** ok, is the board up to date? (What you just looked up: site lane is clean, nothing open. The new feature lane, the quote calculator, has one card blocked waiting on a design pick from Chris. SEO lane shipped its last audit fixes yesterday and scores 94.)

Good: One sketch, three Label: verdict rows (Site: good, New feature: needs help with +hi, SEO: strong), a line of a few words at most. No sentences, no deck, no 'One question' screen.

````
Yes, one thing needs you.
```yui
sketch "Board" frame=window
row "Site: clean"
row "Quote calculator: blocked" +hi note="needs your design pick"
row "SEO: shipped, 94"
```
````

### outcome-invite-declined (pass)

**Chris:** I declined the Friday 3 pm team sync invite from Dana like you said. What's the state? (What you just did: declined it on the calendar, no reply message sent to Dana.)

Good: A sketch of the invite row struck out (+x) with note=declined. A few words. If it asks about Dana it is one choose on the same screen, never 'do you want to do what the previous page said'.

````
Declined. Dana hasn't heard from you beyond the calendar notice.

```yui
sketch "Invite" frame=bubble
row "Team sync, Friday 3 pm" +x note="declined"
row "Note to Dana: none sent" +hi note="calendar notice only"
choose "Send Dana a line?" "Short note"|"Propose new time"|"Leave it"
```
````

### outcome-worker-running (pass)

**Chris:** What's happening on the quote calculator card right now? (What you just looked up: a worker picked it up 4 minutes ago and is editing the calculator labels. Nothing has failed. Expect it done in about 20 minutes.)

Good: A small drawing of the worker at its task: shapes with the busy part +pulse (Worker, arrow, the card), or a one-row sketch or timeline. A few words. No paragraph.

````
Running work gets a small shapes diagram, busy part pulsing, time in caption, no sentence.

```yui
shapes "Quote calculator" caption="Started 4 min ago, done in about 20 min. No failures."
shape circle Worker +pulse
shape arrow
shape box "Calculator labels"
```
````
