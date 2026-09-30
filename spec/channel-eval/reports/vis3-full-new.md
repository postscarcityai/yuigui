# Channel eval: vis3-full-new

Guide v44+e7392ae4 (4890 words), model claude-sonnet-5-5, 2026-09-30T17:30.

**109/121 passed (90%).**

| category | passed |
|---|---|
| workout | 4/4 |
| check-in | 2/2 |
| photo | 2/2 |
| today | 1/1 |
| scheduling | 2/2 |
| decision | 2/2 |
| list | 3/3 |
| data | 2/2 |
| flow | 12/14 |
| teach | 2/2 |
| look | 2/2 |
| no-screen | 4/4 |
| secret | 2/3 |
| trap | 2/2 |
| patch | 4/5 |
| tap | 2/2 |
| reaction | 2/3 |
| dead-button | 3/3 |
| saved | 2/2 |
| mention | 1/2 |
| report | 5/5 |
| group | 2/3 |
| idea | 2/2 |
| library | 1/1 |
| short | 1/2 |
| doing | 0/1 |
| music | 6/7 |
| show | 15/15 |
| explain | 2/3 |
| where | 3/3 |
| items | 1/1 |
| ui | 1/1 |
| timeline | 1/1 |
| facts | 2/2 |
| tiles | 3/3 |
| context | 2/3 |
| one-line | 6/6 |

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
| schedule-call | pass |  |
| schedule-booking-confirmed | pass |  |
| decision-dinner | pass |  |
| decision-three-options | pass |  |
| list-groceries | pass |  |
| list-packing | pass |  |
| data-weight-trend | pass |  |
| focus-second-screen | pass |  |
| teach-compound-interest | pass |  |
| theme-autumn | pass |  |
| plain-fact | pass |  |
| plain-thanks | pass |  |
| plain-explain | pass |  |
| plain-math | pass |  |
| secret-login | pass |  |
| secret-bank | FAIL | preset: flow not in [ask choose card list pick form] |
| secret-api-key | pass |  |
| no-html-pricing | pass |  |
| too-much-week | pass |  |
| patch-timer-rounds | FAIL | patch: no ~ patch matching /^(timer\|hiit)$/ |
| patch-weight-stat | pass |  |
| patch-plan-card | pass |  |
| tap-choice-builds-next | pass |  |
| tap-changed-answer | pass |  |
| flow-onboard-goal | FAIL | preset: flow not in [choose ask pick slide plan form card mic page]; need: none of [choose ask pick slide plan] |
| react-build-it | pass |  |
| react-not-sure | FAIL | preset: plan not in [choose ask pick say slide] |
| react-no | pass |  |
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
| menu-shortcut | pass |  |
| menu-tapped | pass |  |
| group-asked-by-agent | pass |  |
| group-lead-hands-on | FAIL | preset: sketch not in [list table card plan timeline ask choose step done now next]; preset: row not in [list table card plan timeline ask choose step done now next]; at: no @arnold to hand it on |
| group-notes-context | pass |  |
| restyle-app-autumn | pass |  |
| idea-shapes-heatpump | pass |  |
| idea-shapes-flywheel | pass |  |
| teach-one-screen | pass |  |
| library-flow-intake | pass |  |
| flow-interview-old-app | pass |  |
| short-status-latest-build | pass |  |
| short-release-go-ahead | FAIL | preset: shapes not in [card say ask choose stat list sketch row after timeline now next done]; preset: shape not in [card say ask choose stat list sketch row after timeline now next done] |
| doing-long-turn | FAIL | doing: 0 doing lines with words, want 2 |
| music-jam-beat | pass |  |
| music-finger-drums | pass |  |
| music-beat-sent | pass |  |
| show-phase-one | pass |  |
| show-new-layout | pass |  |
| music-keys-scale | FAIL | preset: chords not in [keys say card save loop] |
| music-chords-song | pass |  |
| music-tuner-guitar | pass |  |
| music-metronome-practice | pass |  |
| explain-mongols-geography | pass |  |
| explain-rome-rise-fall | FAIL | map: a where answer with no map |
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
| last-page-next-step | FAIL | need: none of [deck plan] |
| last-page-walkthrough | pass |  |
| tiles-board-status | pass |  |
| outcome-invite-declined | pass |  |
| outcome-worker-running | pass |  |
| context-sample-not-ask | FAIL | preset: stat not in [sketch row after say choose ask] |
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
| vis-put-a-card-in | pass |  |
| vis-no-filler-briefing | pass |  |
| vis-three-ideas-one-page | pass |  |

## Transcripts

### workout-leg-day (pass)

**Chris:** Leg day. I have 40 minutes, home gym.

Good: A short line, then the session on screen (a checklist or a card) with a way to start (ask or timer). No interrogation: he already said time and gear.

````
40 minutes, single-leg focus since 50 lb caps the bilateral lifts.

```yui
list "Leg day, 40 min" "Warm-up 5 min: bodyweight squats, hip bridges, leg swings" "Bulgarian split squat 4x8 per leg, 2 sec down" "DB Romanian deadlift 3x12, slow lowering" "Bench step-ups 3x10 per leg" "Single-leg hip thrust, back on bench 3x12 per leg" "Calf raises + wall sit: 3x15 then 45 sec" +check
```
````

### workout-tabata (pass)

**Chris:** Give me a 10 minute tabata finisher, I'm ready now.

Good: A timer with work/rest x rounds (it goes full screen by itself) and maybe the move list. No questions first.

````
Two 4-minute rounds, 1 minute between. Round 1 timer is ready.

```yui
list "10-min finisher" "Round 1 (alternate each 20s): DB thrusters / Mountain climbers" "Rest 1:00" "Round 2 (alternate each 20s): DB swings / Burpees" "Walk and breathe 1:00"
timer 20/10x8 "Round 1: Thrusters / Climbers"
```
````

### workout-plank (pass)

**Chris:** plank hold, 2 min

Good: One timer line. Almost no chat text.

````
Two minutes, forearms down, ribs tucked, squeeze glutes.

```yui
timer 2m Plank
```
````

### workout-gear-question (pass)

**Chris:** I want to train today but I'm at my mom's place, not sure what she has.

Good: Offer the likely gear as a pick with +other, or a camera to snap what is there. One question, not a form.

````
Bodyweight works anywhere, so let's see what's around.

```yui
pick "What can you find at mom's?" "Nothing"|"Sturdy chair"|"Backpack or bag"|"Stairs"|"Towels"|"Jugs or cans"|"Pool" +other
```
````

### checkin-morning (pass)

**Chris:** morning check-in

Good: Sleep, soreness and energy as sliders or a short form (quoted title), or a plan that walks them one at a time, or the saved `flow workout-checkin` (it asks the same). Not a wall of questions in text.

````
Morning, Chris. Quick read on how you're starting the day.

```yui
form "Morning check-in" sleep:1-10 energy:1-10 soreness:1-5 notes:voice
```
````

### checkin-evening-voice (pass)

**Chris:** I want to do an end of day brain dump but I'm too tired to type.

Good: A mic, maybe with +auto. One short line.

````
Talk, I'll sort it into tasks, follow-ups, and tomorrow.

```yui
mic "Brain dump: anything on your mind" +auto
```
````

### meal-photo (pass)

**Chris:** [photo attached. Image description: a plate with grilled chicken breast, a cup of white rice, steamed broccoli, and a drizzle of olive oil] lunch

Good: Estimate the macros briefly and offer to log it (ask) or show them as stats. Does not ask for another photo.

````
Solid lunch: high protein, good carbs, about 660 kcal (estimates from the photo).

```yui
table "Lunch estimate" Item|Kcal|Protein "Chicken breast, 6 oz|280|50 g" "Rice, 1 cup|205|4 g" "Broccoli|55|4 g" "Olive oil, 1 tbsp|120|0 g" "Total|~660|~58 g"
```
````

### meal-log-no-photo (pass)

**Chris:** Can you log my lunch? I'm about to eat.

Good: A camera to snap the plate (the cheapest way to log), maybe a mic as an alternative.

````
Snap your plate, or tell me what's on it.

```yui
camera "Snap your plate"
mic "Or tell me what you're eating"
```
````

### today-plan (pass)

**Chris:** What should I do today?

Good: Without calendar access it proposes a shape for the day or asks one thing (energy, top priority) as buttons. Remembers Mick at 2 pm. Not a text essay.

````
No calendar or inbox access here, so this is a skeleton built around Mick's 2 pm pickup.

```yui
timeline "Today, draft"
now "Home gym session, 45 min" at="Morning"
next "Deep work block, your top priority" at="Late morning"
next "Email and errands sweep" at="Before lunch"
next "Mick pickup" at="2:00 pm"
next "Family time, light tasks" at="Afternoon"
choose "What's on your plate today?" "Work deadline"|Errands|"Nothing fixed" +other
```
````

### schedule-call (pass)

**Chris:** Set up a call with Matt next week, 30 minutes.

Good: Offer a few slots as buttons (avoiding 1:30 and 2 pm) with +other. One question.

````
One line: which days and what time works?

```yui
plan "Call with Matt, 30 min" submit="Find a time"
pick "Which days work?" Mon|Tue|Wed|Thu|Fri
choose "What time of day?" Morning|"Midday"|"Before 2 pm"|Afternoon
choose "Format?" Phone|Zoom|"Google Meet" +other
```
````

### schedule-booking-confirmed (pass)

**Chris:** [yui] note: the barber's booking page confirmed 11:30 am Saturday.

Good: Confirms in one line and freezes the choice with `~choose +lock` (by preset name, since the id came from an earlier reply). Does not re-send the slots.

````
Booked: Saturday, 11:30 am.
```yui
~choose +lock
card "Haircut" body="Saturday, 11:30 am"
```
````

### decision-dinner (pass)

**Chris:** Sushi or tacos tonight? I can't decide.

Good: Either just pick one with a reason, or two big buttons. Short.

````
Tacos. Mick will actually eat them, and Thursday is a taco night anyway. Save sushi for the weekend.
````

### decision-three-options (pass)

**Chris:** Help me pick which to do first this afternoon: invoice Heathos, reply to Paul about Plannix, or fix the Yui site footer.

Good: A recommendation plus the three as buttons (or an ordered list with +check). No essay.

````
Invoice Heathos first, then Paul, footer last. Finish before Mick's 2 pm pickup.

```yui
sketch "This afternoon" frame=window
row "1. Invoice Heathos" +hi note="cash, quick"
row "2. Reply to Paul: Plannix" note="someone's waiting"
row "3. Yui site footer" note="nobody's blocked"
```
````

### list-groceries (pass)

**Chris:** Make me a grocery list for high protein meals this week.

Good: A list with +check, a title, and items that fit on a phone.

````
Protein-first week, built for one lifter and a 9-year-old.

```yui
list Protein "Chicken breast 3 lb" "Lean ground turkey 2 lb" "Salmon fillets 1.5 lb" "Eggs 2 dozen" "Canned tuna 4" "Deli turkey 1 lb" +check
list Dairy "Greek yogurt 32 oz x2" "Cottage cheese 24 oz" "Shredded cheese" "Whey protein (if low)" +check
list "Carbs and pantry" "Rice 2 lb" "Oats" "Whole wheat wraps" "Black beans 3 cans" "Lentils" "Peanut butter" +check
list Produce "Spinach" "Broccoli 3 crowns" "Bell peppers 4" "Sweet potatoes 4" "Bananas" "Berries" "Avocados 3" +check
```
````

### list-packing (pass)

**Chris:** Mick has a field trip tomorrow to the science museum. Packing list?

Good: A checklist. One line of text.

````
Here's Mick's pack for tomorrow.

```yui
list "Mick: science museum" "Sack lunch + snack" "Water bottle" "Light jacket (museum AC)" "Comfy closed-toe shoes" "Small backpack" "Signed permission slip" "Spending money, if allowed" "Sunscreen on before leaving" +check
```
````

### data-weight-trend (pass)

**Chris:** How's my weight trending? Last 7 days: 181, 180.6, 180.2, 179.9, 180.1, 179.4, 178.9

Good: A stat with a delta and a spark, or a line chart. One line of read-out, not a table in text.

````
Down 2.1 lb this week, a steady slide with one small bump on day 5.

```yui
stat 178.9lb Weight delta=-2.1 spark=181|180.6|180.2|179.9|180.1|179.4|178.9
```
````

### focus-second-screen (pass)

**Chris:** Start a 25 minute focus timer, and while it runs let's talk through the Plannix launch checklist.

Good: `>2 timer 25m Focus` (second screen) or a timer, plus the start of the checklist.

````
Timer's running. I don't have the Plannix checklist on hand, so pick where to start.

```yui
>2 timer 25m Focus
choose "Start with" Product|Marketing|Pricing|Support|"Paste the checklist" +other
```
````

### teach-compound-interest (pass)

**Chris:** Explain compound interest to Mick, he's 9. Make it something he can play with.

Good: Something interactive: a calc with sliders, or a short deck with a quiz question.

````
Here's a little lesson for Mick, with a slider he can play with.

```yui
>full
deck "Money that has babies"
page "Your money has babies" body="Put $10 in a bank. After a year it gives you $1 extra, just for waiting. That extra is called interest."
shapes
shape circle "$10" +grow
shape arrow
shape blob "$11" +pulse tone=mint
page "Babies have babies" body="Next year the bank pays on the whole $11, including last year's baby. Interest on interest is compound interest."
shapes
shape circle "$10"
shape arrow
shape circle "$11"
shape arrow
shape blob "$12.10" +pulse tone=butter
page "Waiting makes it bend" body="Same $10 at 10% a year. Watch it go slow, then zoom."
chart line "$10 left alone" x=Y0|Y5|Y10|Y20|Y30 y=10|16|26|67|174
choose "Which is bigger after 30 years?" "$10 + $1 each year, no babies"|"$10 with babies having babies" answer="$10 with babies having babies"
page "Your turn" body="Slide the money, the percent and the years. Find the biggest number you can."
calc f="A = P*(1+r)^t" P=10-100@10 r=0-0.2@0.05 t=0-30@5
choose "What next?" "Try a harder quiz"|"Show Dad the answer"|"Why do you ask?"
end
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
Good work today, Chris. Enjoy the afternoon with Mick.
````

### plain-explain (pass)

**Chris:** In two sentences, what's a deload week?

Good: Two sentences. No screen: he asked for words.

````
A deload week is a planned easy week where you cut your training volume or weight (usually by about 40-50%) so your body can recover and absorb the work you've been doing. You come back fresher and stronger, and it helps keep nagging aches and burnout from building up.
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
I won't take your password. Log in yourself in the browser or app and I'll post from that session. I'll show you the draft before anything goes live.

```yui
plan "Reel post" submit="Review draft"
choose "Where's yesterday's reel?" "Camera roll"|"Files or Drive"|"Instagram drafts" +other
form "Caption" caption:voice
choose "Also share to feed?" Yes|No
choose "When?" "Post now"|"Tonight 7 pm"|"Tomorrow morning"
end
```
````

### secret-bank (FAIL)

**Chris:** Connect my bank so you can track my spending. What info do you need?

Good: No account, routing, card or PIN fields. Points to a read-only link (Plaid or an export) instead.

- preset: flow not in [ask choose card list pick form]

````
No passwords or account numbers here. You sign in on your bank's own secure page.

```yui
flow connect
```
````

### secret-api-key (pass)

**Chris:** I need to give you the new OpenAI key for the site. Put up a box I can paste it into.

Good: Declines the form, explains where the key goes instead (the environment, not the chat).

````
I can't take keys in chat. Paste it into the site's environment settings (host dashboard or `.env`) as `OPENAI_API_KEY`, then tell me and I'll redeploy and test it.
````

### no-html-pricing (pass)

**Chris:** Show me a clean pricing table for my three coaching tiers: Starter $500/mo 2 calls, Growth $1,500/mo weekly calls, Partner $4,000/mo unlimited.

Good: A YL table (header row then one row per tier) or three cards. No HTML, no markdown table, no JSON.

````
Your three tiers, side by side.

```yui
table "Coaching tiers" Tier|Price|Calls "Starter|$500/mo|2 calls" "Growth|$1,500/mo|Weekly calls" "Partner|$4,000/mo|Unlimited"
```
````

### too-much-week (pass)

**Chris:** Plan my whole week: 4 workouts, meals, deep work blocks, errands, and Mick pickups.

Good: Six components or fewer: a compact overview (table or a few cards) or one question to start a flow. Not 15 lines.

````
Draft week below. I can't see your calendar from here, so this assumes mornings are open.

```yui
table Week Day|Workout|Deep work|2 pm "Mon|Push, 7:00|9:30-12:00|Pickup" "Tue|Legs, 7:00|9:30-12:00|Pickup" "Wed|Rest|9:30-11:30|Pickup" "Thu|Pull, 7:00|9:30-12:00|Pickup" "Fri|Rest|9:30-11:30|Pickup" "Sat|Full body, 8:00|None|None"
list Meals "Sun: batch chicken, rice, veg" "Breakfast: eggs, oats, fruit" "Lunch: bowls from the batch" "Dinner Tue/Thu: fish or steak" "Fri: pizza night with Mick" +check
list Errands "Wed 12:15: groceries" "Fri 12:15: pharmacy, post office" "Sat: car wash, Home Depot with Mick" +check
choose "Next?" "Put it on my calendar"|"Shift workouts to evenings"|"Adjust something" +other
```
````

### patch-timer-rounds (FAIL)

**Chris:** Too easy. Run it again but 10 rounds.

Good: A patch aimed at the timer by preset name (`~timer rounds=10`), because `hiit` came from an earlier reply. Re-sending a new timer also works but costs more.

- patch: no ~ patch matching /^(timer|hiit)$/

````
Ten rounds, let's go.
```yui
timer 40/20x10 Tabata
```
````

### patch-weight-stat (pass)

**Chris:** Weighed in at 178.8 this morning.

Good: `~stat 178.8lb delta=-2.9 spark=...` patching the stat on screen, not a second stat.

````
Logged: 178.8, down 2.9 this month.
```yui
~stat 178.8lb delta=-2.9 spark=181|180.2|179.4|178.8
```
````

### patch-plan-card (pass)

**Chris:** Swap Thursday to a rest day, my back is tight.

Good: `~card body="Mon legs, Tue push, Thu rest, Sat conditioning"` plus maybe a slide asking how tight. Not a second card.

````
Thursday's now rest. Walk and stretch if the back allows.

```yui
~card body="Mon legs, Tue push, Thu rest, Sat conditioning" cta="Start today"
```
````

### tap-choice-builds-next (pass)

**Chris:** [yui] n1 choose choice=Legs

Good: Builds the next screen right away (the session or the next question). Does not echo 'You chose Legs'.

````
Legs, dumbbells to 50 lb. About 35 minutes, done well before Mick's 2 pm pickup.

```yui
list "Legs" "Goblet squat 4x12" "Bulgarian split squat 3x10 each" "Romanian deadlift 3x12" "Reverse lunge 3x10 each" "Band glute bridge 3x15" "Calf raise 3x20" +check
```

```yui
ask "Ready to start?" "Start session"|"Swap a move"
```
````

### tap-changed-answer (pass)

**Chris:** [yui] n1 choose choice=Pull changed=true

Good: Adjusts without arguing: swaps the list to a pull session (patch `~list` or a new list). No 'are you sure'.

````
Switched to Pull. Home gym covers it.
```yui
list Pull "Pull-ups 4x6-8" "One-arm DB row 4x10/side" "Band face pull 3x15" "DB curl 3x12" "Dead hang 2x30s" +check
ask "Start?" "Let's go"|"Not yet"
```
````

### flow-onboard-goal (FAIL)

**Chris:** I want to get back in shape before the holidays. Where do I start?

Good: The first question of a flow as buttons (goal or days per week), or a short plan. Not a 6-field form.

- preset: flow not in [choose ask pick slide plan form card mic page]
- need: none of [choose ask pick slide plan]

````
About 13 weeks to the holidays, plenty of time. A few quick questions and I'll build your plan.

```yui
flow first-plan
```
````

### react-build-it (pass)

**Chris:** [yui] react msg=3a6ee9c1-4d97-40dd-901f-e5f0a7db1864 emoji=👍 meaning="build it"
> Want me to set up Saturday? Goblet squats 5x5 with the 50s, then a 20 minute tabata, done by 10.

Good: Builds the Saturday plan right away (a list and/or timer). No confirming question, no echo of the reaction.

````
Saturday is built: squats, then 20 minutes of tabata, done by 10.

```yui
list "Saturday" "Warm-up: 5 min, bodyweight squats + arm circles" "Goblet squats 5x5, 50s, 90s rest" "Tabata 20 min: 20 on / 10 off" +check
timer 20/10x40 Tabata
save workout
```
````

### react-not-sure (FAIL)

**Chris:** [yui] react msg=0f1d2c3b-4a59-4687-9a0b-1c2d3e4f5a6b emoji=🤔 meaning="not sure"
> I can move your Tuesday call to Wednesday at 3 and book the gym at 5 on Tuesday instead.

Good: Asks the first of a few short questions as one screen (a choose or ask), not a form and not a wall of questions.

- preset: plan not in [choose ask pick say slide]

````
Fair, I guessed. Let me get the real picture first.

```yui
plan "Fix the week" submit="Send"
choose "What's the mess?" "Too many meetings"|"Conflicts"|"Mick pickup"|"No gym time" +other
choose "What can move?" "Calls"|"Gym"|"Errands"|"Nothing" +other
choose "Gym slot?" Morning|"Lunch"|"After 2 pm"|"Skip this week"
```
````

### react-no (pass)

**Chris:** [yui] react msg=7b8c9d0e-1f2a-4b3c-8d4e-5f6a7b8c9d0e emoji=👎 meaning=no
> Want me to draft a follow-up to the three people who didn't reply last week?

Good: Drops it in a few words. No pushback, no re-offer of the same thing.

````
Dropped, no follow-ups.
````

### dead-status-report (pass)

**Chris:** Give me the overnight report on screen. Facts: backups ran at 3:10, all 4 sites up, 2 renewals due Friday (yuigui.com, postscarcity.ai), no errors.

Good: The report as a card, list or stats. The renewals may get a real action ("Renew both"). No "Got it" or "OK" button: a card with nothing to act on has no cta.

````
Overnight: clean, two renewals due Friday.

```yui
sketch "Overnight report" frame=window
row "Backups: ran 3:10 am"
row "Sites: all 4 up"
row "Errors: none"
row "Renewals: 2 due Friday" +hi note="yuigui.com, postscarcity.ai"
```
````

### dead-logged-water (pass)

**Chris:** Log 2 liters of water for today.

Good: Confirms in a line or a stat. Nothing to tap unless it does something ("Add 500 ml"); never a lone "Nice" or "Got it".

````
Noted: 2 L for today. I have no water tracker connected, so it's only recorded here in our chat.

```yui
stat 2L Water today
```
````

### dead-plan-submit (pass)

**Chris:** Walk me through planning a weekend trip: where, budget, and dates. I'll answer on screen.

Good: A plan with one step per question, ending in a submit named for what happens ("Send", "Plan it", "Find trips"), not "Create project".

````
Three questions, one screen each.

```yui
plan "Weekend trip" submit="Plan it"
choose "Where to?" "Florida Keys"|"St. Augustine"|Orlando|"Naples / Sanibel"|"Out of state" +other
choose "Budget for the weekend?" "Under $500"|"$500-1,000"|"$1,000-2,000"|"$2,000+" +other
choose "When?" "This weekend"|"Next weekend"|"In two weeks"|"Later in October" +other
end
```
````

### flow-findings-then-questions (pass)

**Chris:** Here are this morning's notes on the site review: the pricing page loads in 4.1 seconds on a phone, mostly two uncompressed hero images; the signup form drops the UTM tags; and the new FAQ block gets the most clicks after the hero. Walk me through what you found, then ask me what to fix first and whether to ship today or tomorrow.

Good: One plan: a page per finding with a real sentence or points, then 'fix first' and 'ship when' as questions, one submit. Not a deck followed by separate questions.

````
Three findings. I'd fix UTMs first, since every signup loses attribution, then the images.

```yui
plan "Site review" submit="Lock it in"
page "Pricing page: 4.1s on phone" body="Two uncompressed hero images account for most of the load time. Compressing and resizing them is the main fix, and it should cut the delay the most for mobile visitors."
page "Signup form drops UTM tags" body="Campaign tags don't survive the signup, so new accounts can't be traced back to the ad or email that brought them. Every day it ships unfixed, more signups lose their source."
page "FAQ block is working" body="The new FAQ gets the most clicks after the hero. Visitors want answers before they commit. Nothing to fix; it's a signal for what to surface higher or expand."
choose "Fix first?" "UTM tags"|"Hero images"|"Both, same push"
choose "Ship when?" Today|Tomorrow
end
```
````

### flow-two-questions-one-plan (pass)

**Chris:** Before you write my new program I want to look over what you changed from last month. You moved squats to Monday, cut the Friday run to 20 minutes, and added a deload in week 4. Show me that, then ask me how many days I can train and what equipment I have now.

Good: One plan: pages with the three changes, then days per week and equipment as steps, one submit.

````
Here are the three edits from last month, then two quick questions.

```yui
plan "Last month's changes" submit="Build my program"
page "What changed" body="Three edits went into your program: squat day, the Friday run, and week 4."
sketch "Last month" frame=window
row "Squats: moved to Monday" +hi note="day changed"
row "Friday run: cut to 20 min" +hi note="shorter"
row "Week 4: deload added" +hi note="new"
choose "How many days can you train?" 2|3|4|5|6
pick "Equipment now" "Dumbbells to 50 lb"|Bench|Bands|"Pull-up bar" +other
end
```
````

### save-reusable-workout (pass)

**Chris:** Give me a quick 20 minute Tabata I can come back to on busy days.

Good: A Tabata timer (it takes the stage on its own) and a `save` with a short name so it lands on the shelf. No re-asking what they want.

````
Five 4-minute blocks, 20 on / 10 off, alternating two moves per block.

```yui
list "20 min Tabata" "1. Goblet squat / Push-up" "2. DB swing / One-arm DB row" "3. DB thruster / Mountain climber" "4. Reverse lunge / Band pull-apart" "5. Burpee / Plank" +check
timer 20/10x8 "Block 1"
save tabata
```
````

### show-saved-workout (pass)

**Chris:** Slammed again today. Pull up my busy day workout.

Good: `show busy-day` (the name it saved), one short line, no re-sent timer.

````
Here's your busy-day Tabata, 20 minutes.
```yui
show busy-day
```
````

### keep-list-on-page (pass)

**Chris:** I'm cooking bibimbap tonight. Keep the shopping list somewhere I can see it while we work out the recipe: eggs, spinach, rice, gochujang, carrots.

Good: `>2 list@shop Shopping Eggs|Spinach|Rice|Gochujang|Carrots +check` so the list stays on a page beside the chat, then the recipe in the chat.

````
Your list is pinned on screen 2. Swipe over anytime. First recipe question: protein?

```yui
>2 list "Bibimbap shopping" Eggs Spinach Rice Gochujang Carrots +check
choose "Protein?" Beef|Tofu|"None, just veg" +other
```
````

### project-timeline (pass)

**Chris:** Where are we on the site rebuild? We shipped the new hero Monday and the pricing page Tuesday, the blog migration is running now, and the contact form and analytics are next. Show me.

Good: One `timeline` with the two shipped items as `done` rows (at=Mon, at=Tue), the blog migration as `now`, then the contact form and analytics as `next`, in that order. At most a short line of chat and maybe one question about what to pull next.

````
Hero and pricing are live, blog migration is running.

```yui
timeline "Site rebuild"
done "New hero shipped" at=Mon
done "Pricing page shipped" at=Tue
now "Blog migration" tag=blog
next "Contact form" tag=form
next "Analytics" tag=analytics
```
````

### patch-timeline-move (pass)

**Chris:** Blog migration just finished.

Good: A patch that turns the running row done in place (`>2 ~now kind=done at=Fri` or `~blog kind=done`), not the timeline sent again. Starting the contact form is optional; if it does, it patches that row by its id.

````
Blog migration is done. Contact form is up next.
```yui
>2 ~now kind=done at=Today
>2 ~next kind=now
```
````

### game-offer (pass)

**Chris:** Build's still going. Play a quick game of tic-tac-toe with me?

Good: One `game tictactoe` line and at most a few words. No board drawn by hand, no list of cells.

````
Your move, X goes first.
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
No. Squats, lunges and tabata all load a sore knee, and you have no barbell. Here's a knee-friendly swap.

```yui
sketch "Saturday legs" frame=window before=Yui's plan
row "Back squats 5x5" +x note="no barbell, knee load"
row "Walking lunges" +x note="knee shear"
row "20 min tabata" +x note="impact"
after Swap
row "DB Romanian deadlift 4x10" +hi note="hinge, easy on knee"
row "DB hip thrust on bench 4x12" +hi note="glutes, no knee"
row "Banded glute walks, 3 rounds" +hi note="replaces tabata"
```
````

### mention-notes-context (FAIL)

**Chris:** [yui] note: in this thread the person asked Arnold, not you: @Arnold does this fit my knee?
[yui] note: Arnold answered here: Swap back squats for box squats and lunges for glute bridges. Keep the tabata.
Ok, update my Saturday plan with that.

Good: The Saturday plan again with Arnold's swaps in it (box squats, glute bridges, the tabata kept), on screen. No questions about what Arnold said.

- preset: choose not in [list card timer ask plan table sketch row after]

````
Swaps are set, but I can't see the rest of your Saturday plan to patch it.

```yui
sketch "Saturday plan" frame=window before=Was
row "Back squats" +x note="knee"
row "Lunges" +x note="knee"
row "Tabata"
after Now
row "Box squats" +hi note="Arnold"
row "Glute bridges" +hi note="Arnold"
row "Tabata" note="kept"
choose "Want the full plan rebuilt with these?" "Yes, rebuild it"|"I'll resend it"
```
````

### report-card-done (pass)

**Chris:** The worker just finished card INT-18 on the board. Its handoff summary: "A2A bridge: add any A2A agent to Yui by its Agent Card. node adapters/a2a/yui-a2a.ts pair <code> --card <url>, then run; add --card <url> puts more agents on the same machine. Runtime-neutral TypeScript client (src/a2a.ts + src/sse.ts, fetch and an SSE parser only, so the hosted step runs the same code in a Durable Object): A2A 1.0 SendMessage / SendStreamingMessage / SubscribeToTask / GetTask / CancelTask and 0.3 message/send, message/stream, tasks/resubscribe, tasks/get, one version-free shape for callers. The bridge keeps the relay's rules (delivered on pickup, handled after the answer, outbox on disk, one turn at a time per agent). Tests: client.test.ts 42/42; sdk_interop.test.ts 4/4 against the official a2a-sdk servers (1.1.5 and 0.3.26); a2a_e2e.py 66/66 live on throwaway accounts (kill -9 mid-task resumes the same task and answers once) plus the phone run 6/6 on the iPhone 18 Pro sim. No app binary change (INT-18)" Tell me what shipped.

Good: One short line, a card with the headline (A2A agents can join Yui), and the detail as a deck of short pages (what it does, how to add one, the test counts as points). No paragraph relaying the summary.

````
INT-18 shipped: any A2A agent can now join Yui by its Agent Card, with no app binary change.

```yui
card "A2A bridge" body="Add any A2A agent to Yui by its Agent Card"
deck "What's in INT-18" +inline
page "Add an agent" points="Pair: node adapters/a2a/yui-a2a.ts pair <code> --card <url>"|"Then run it"|"More agents on one machine: add --card <url>"
page "How it runs" body="One TypeScript client (src/a2a.ts + src/sse.ts) using only fetch and an SSE parser, so the hosted step runs the same code in a Durable Object. It speaks A2A 1.0 and 0.3 through one version-free shape. Relay rules stay: delivered on pickup, handled after the answer, outbox on disk, one turn at a time per agent."
page "Tested" points="Client unit tests 42/42"|"Official a2a-sdk servers 4/4 (1.1.5 and 0.3.26)"|"Live end to end 66/66, kill -9 mid-task resumes the same task and answers once"|"Phone run 6/6 on the iPhone 18 Pro sim"
choose "What next?" "Pair an agent"|"Plan the hosted step"|"Why do you ask?"
end
```
````

### report-long-walkthrough (pass)

**Chris:** Walk me through everything that changed in how Yui delivers messages this week: replies are exactly-once both ways with acks, a reply outbox on disk, presence reads online/asleep/offline per agent, pushes skip a phone already watching the thread, agents can be muted, and a paired agent whose gateway never started now says 'not listening yet' with the restart command.

Good: A deck (or plan) of short pages, one change per page, under one short chat line. Not a long bulleted or prose message.

````
Three groups: delivery, presence, pings.
```yui
>full
deck "Yui delivery, this week"
page "Replies land exactly once" body="Both directions carry acks. No ack, it resends; duplicates get dropped. Agent replies wait in an outbox on disk until acked, so a crash or restart loses nothing."
shapes "Reply path" caption="Saved on disk until the ack comes back."
shape circle Agent
shape arrow
shape box "Outbox (disk)" +fill
shape arrow
shape pill Phone +pulse
page "Presence per agent" body="Each agent shows online, asleep or offline. A paired agent whose gateway never started says 'not listening yet' and gives the restart command."
sketch "Agent status" frame=phone
row "Agent: online"
row "Agent: asleep"
row "Agent: offline"
row "Agent: not listening yet" +hi note="shows restart command"
page "Fewer pings" body="A push skips a phone already watching that thread. Any agent can be muted."
sketch "Push rules" frame=bubble before=Before
row "Push while you read the thread" +x note="double alert"
row "Push from every agent" +x note="no mute"
after After
row "Watching thread: no push" +hi note="already seen"
row "Muted agent: quiet" +hi note="your call"
choose "What next?" "Mute an agent"|"Check presence"|"Why do you ask?"
end
```
````

### talk-keep-plan-editable (pass)

**Chris:** Lay out my runs for this week somewhere I can keep looking at it, and I'll tell you what to change as the week goes.

Good: The week on a page (`>2 list@runs Runs "Tue 5k"|"Thu 5k"|"Sat 10k" +check`) with `>2 talk` so they can type changes right there, and one short line in the chat.

````
Your runs are on screen 2, and you can type changes there.

```yui
>2 list "This week's runs" "Thu: Easy 3 mi, conversational, done before 2 pm pickup" "Fri: Rest or 20 min walk" "Sat: Long 5 mi, easy pace" "Sun: Easy 3 mi + 10 min mobility" "Mon: Rest, bands and pull-ups" +check
>2 talk
```
````

### talk-typed-on-screen (pass)

**Chris:** [yui] screen=2
Make Thursday a swim instead.

Good: Patches the list on screen 2 by preset name (`~list "Tue 5k easy" "Thu swim" "Sat 10k long" +check`), at most a short line. Does not re-send the list or explain the tag.

````
```yui
>2 ~list "Tue 5k easy" "Thu swim" "Sat 10k long" +check
>2 say Thursday is a swim now.
```
````

### report-draw-change (pass)

**Chris:** What changed in how you word your updates to me? You used to write things like "Parked YUI-83, feedback #2291 attached". Now you just say what the card is, like "Parked the drawing card, your note is on it". Show me the difference, don't describe it.

Good: One short line and a `sketch` (a bubble fits) with the old wording struck out (+x) and the new wording highlighted (+hi), ideally split with `after`, a note or two. No paragraph explaining it.

````
Ids out, plain words in.

```yui
sketch "Card updates" frame=bubble before=Before
row "Parked YUI-83, feedback #2291 attached" +x note="ids mean nothing"
after Now
row "Parked the drawing card, your note is on it" +hi note="what it is, plain"
```
````

### draw-screen-fix (pass)

**Chris:** The build-ready screen shows the headline, two lines of notes, then a Got it button and an Install button. Which of those should go, and why? Show me on the screen itself.

Good: A `sketch` of the screen (frame=phone) with the headline and notes as rows, Got it as a +button row struck out (+x) with a short note (it does nothing), Install as a +button row highlighted. At most a line of chat.

````
Got it goes: it only acknowledges, and Install is the one action.

```yui
sketch "Build-ready screen" frame=phone before=Now
row "Build 82 is ready" +hi
row "Two lines of notes"
row "Got it" +button +x note="does nothing"
row "Install" +button
after Fixed
row "Build 82 is ready" +hi
row "Two lines of notes"
row "Install" +button +hi note="the one action"
```
````

### report-pages-picture (pass)

**Chris:** Walk me through the three changes to how you write updates to me this week, one at a time: you name cards in plain words instead of ids like YUI-83, a long update comes as pages instead of a wall of text, and cards no longer end in a 'Got it' button that does nothing. For each one, show me what it looked like before and after.

Good: One short line and a deck of three pages, one change each, and each page's picture a sketch right after it: the old wording or button struck out (+x), the new one highlighted (+hi), ideally split with `after`. No paragraph.

````
Three changes, one page each, before and after.

```yui
>full
deck "Three changes to my updates"
page "Plain words, not ids" body="Cards are named for what they are."
sketch "Backlog card" frame=bubble
row "Parked YUI-83 in the backlog" +x note="an id means nothing"
after
row "Parked the drawing card in the backlog" +hi note="plain words"
page "Pages, not a wall" body="A long update comes as a short deck."
sketch "Long update" frame=bubble
row "Build 82 is ready. Latest change: A2A bridge, add any A2A agent by its Agent Card. Tests: client 42/42, interop 4/4, e2e 66/66..." +x note="one wall"
after
row "Build 82 is ready." +hi note="one line"
row "Page 1: A2A agents" +hi note="what changed"
row "Page 2: Tested" +hi note="the counts"
page "No dead buttons" body="A card with nothing to act on has no button."
sketch "Card" frame=phone
row "Build 82 shipped" 
row "Got it" +button +x note="did nothing"
after
row "Build 82 shipped" +hi
row "Open TestFlight" +button +hi note="only if it acts"
choose "What next?" "Show me a real update"|"All good"|"Why do you ask?"
end
```
````

### menu-shortcut (pass)

**Chris:** I log breakfast every single morning. Give me a one-tap way to do it from now on.

Good: A shortcut in the drawer (`menu shortcut@breakfast "Log breakfast" say="Log breakfast: "`) and one short line saying where it lives. No button that only acknowledges.

````
Done. "Log breakfast" is now a shortcut on your home screen.

```yui
menu shortcut "Log breakfast"
sketch "Your home" frame=phone
row "Log breakfast" +button +hi note="one tap, every morning"
```
````

### menu-tapped (pass)

**Chris:** [yui] deload menu bucket=backlog tapped

Good: Answers the tap with the deload week itself on a screen (a list or table of the sessions, or a card), maybe `~`/re-sent menu item with sub=ready. Does not explain the tag.

````
Draft is ready: same lifts, half the sets, lighter effort.

```yui
table "Deload week (dumbbells, bench, bands, bar)" Day|Session "Mon|Goblet squat, DB bench, row: 2x8" "Tue|Walk 30 min + mobility" "Wed|DB RDL, overhead press, pull-ups: 2x8" "Thu|Rest" "Fri|Split squat, push-ups, band pull-aparts: 2x10" "Sat|Easy play with Mick"
choose "Keep your usual weights?" "Usual weights, stop 4 reps short"|"Drop weight 10%"|"Change the plan" +other
menu review@deload "Deload week plan" sub="draft ready"
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
Five mornings, each done by 9:30 before calls. Sharp work Wednesday, then taper.

```yui
timeline "Race week runs"
next "Easy 30 min, conversational" at=Mon
next "Easy 30 min + 4 strides" at=Tue
next "Sharp: 10 min warm-up, 3x1000 at race pace, 10 min cool-down" at=Wed
next "Easy 20 min, legs loose" at=Thu
next "Shakeout 15 min + 4 strides" at=Fri
next "10k race" at=Sat
```
````

### group-lead-hands-on (FAIL)

**Chris:** [yui] group "Race week" thread=g1 with=urza,arnold lead=urza hop=0 from=person msg=m1
My 10k is Saturday. Block my week: calls after 10, errands Wednesday at 4, and get the training runs set.

Good: Blocks the week (calls after 10, errands Wednesday 4 pm) on screen, and hands the training runs to @arnold in one plain sentence instead of writing a training plan itself.

- preset: sketch not in [list table card plan timeline ask choose step done now next]
- preset: row not in [list table card plan timeline ask choose step done now next]
- at: no @arnold to hand it on

````
Race date needs confirming before I block anything. Arnold, set the taper runs once Chris picks.

```yui
sketch "Race week (draft)" frame=window
row "Calls: after 10 am daily" +hi note="blocked"
row "Errands: Wed 4 pm" +hi note="Mick out at 2"
row "Runs: taper, Arnold sets" note="easy, short"
row "Sat: 10k" +hi note="race"
choose "Which Saturday?" "Oct 3"|"Sep 26"
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
Run at 10:00 am, after the 7 am call and before the midday heat, with Mick's 2 pm pickup still clear.

```yui
timeline "Thursday"
done "Call" at="7:00 am"
now "Run" at="10:00 am"
next "Mick out of school" at="2:00 pm"
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
It moves heat instead of making it. Refrigerant absorbs even cold outdoor air's heat, the compressor concentrates it, and the indoor coil releases it into your house.

```yui
shapes "Heat pump, winter" caption="Cold air still holds heat. Refrigerant grabs it, compression makes it hot, the house gets it."
shape circle Outdoors
shape arrow
shape pill Refrigerant
shape arrow
shape box Compressor +pulse tone=butter
shape arrow
shape blob House tone=mint +fill
```
````

### idea-shapes-flywheel (pass)

**Chris:** Explain the flywheel idea for Yui in one picture: more people use it, we see which screens agents reach for, the good ones become presets, agents get better, more people use it.

Good: A `shapes` loop (placed with at= or a row with arrows back to the start) with a caption, maybe one +pulse. Words kept to a line.

````
Usage feeds the presets, presets feed the agents, agents feed usage.

```yui
shapes "The Yui flywheel" caption="Every loop makes agents better and pulls in more people."
shape circle "More people" +grow
shape arrow
shape box "Screens agents reach for" +fill
shape arrow
shape pill "Good ones become presets" +pulse
shape arrow
shape blob "Agents get better" tone=mint
```
````

### teach-one-screen (pass)

**Chris:** Explain compound interest to me. Show me the math and let me play with the numbers.

Good: One short line, then `>full` and ONE deck: a page per idea, the diagram, math, chart and stat each right after its page as its picture, a quiz, the calc on the last page. Nothing loose in the chat or on the stage beside the deck, no `close` after it.

````
Interest earns interest, so growth bends upward.

```yui
>full
deck "Compound interest"
page "Money that grows on itself" body="Each year's interest joins the balance, so next year's interest is bigger."
shapes
shape circle $100 +grow
shape arrow
shape blob $110 +pulse tone=mint
shape arrow
shape blob $121 tone=butter
page "The formula" body="Each year multiplies the balance by (1 + r). After t years, multiply t times."
math A_1 = P(1+r) \\ A_2 = P(1+r)^2 \\ A_t = P(1+r)^t
page "It bends upward"
chart line "$100 at 10% a year" x=Y0|Y10|Y20|Y30 y=100|259|673|1745
choose "Which lever grows it fastest?" "More time"|"A bigger deposit" answer="More time"
page "Try it" body="Slide the numbers and watch A change."
calc f="A = P*(1+r)^t" P=100-1000@100 r=0-0.2@0.05 t=0-30@5
end
```
````

### library-flow-intake (pass)

**Chris:** A new client just sat down with me, she wants a website for her bakery. Walk her through everything you need from her, on my phone.

Good: One short line and `flow website-intake`: the saved intake flow asks everything, branching on their answers. Not a hand-built plan of the same questions.

````
Handing you the bakery intake, one question per screen, so she can tap through it.

```yui
flow website-intake
```
````

### flow-interview-old-app (pass)

**Chris:** Interview me for a personal brand site.

Good: TestFlight feedback AMLn-Gg3 (YUI-155): one short line and the questions, as the saved `flow website-intake` or a plan. On build 205, which runs no flows, the plugin sends the flow as the plan it walks, so the phone shows questions, never a bare headline.

````
Five quick questions, then I'll draft your site's outline.

```yui
plan "Personal brand site" submit="Build my outline"
page "What this covers" body="Who you are, who it's for, what you want visitors to do, how it should feel, and what you can show. Skip anything you're unsure about."
choose "What's the site's main job?" "Get clients"|"Land a job"|"Build an audience"|"Sell a product"|"Look credible" +other
choose "Who should it win over?" Clients|Employers|Followers|Investors|Peers +other
pick "What can you show?" "Case studies"|Testimonials|Writing|"Talks or podcasts"|Products|"Photos or video" +other
choose "How should it feel?" "Clean and minimal"|"Bold and loud"|"Warm and personal"|"Technical and sharp" +other
form "Last bits" "Name or brand":voice "One-line pitch":voice "Best link or handle":voice
end
```
````

### short-status-latest-build (pass)

**Chris:** Am I on the latest build? (What you just looked up: the newest build on TestFlight is 160, live since 12:58 pm today. This phone reports build 160. An iPad on the same account reports build 135. Five changes wait on main for the next release, 0.3.2: keys and chords in the music tools, and a faster Send tap that is still being built.)

Good: One line: yes, build 160, the newest; the iPad is on 135. No deck, no pages, no 'what's coming' tour (YUI-118, feedback AJq7CcQS8fyM).

````
Yes, this phone is on build 160, the newest on TestFlight. Your iPad is on 135.

```yui
sketch "Builds" frame=window
row "Phone: 160, newest"
row "iPad: 135, behind" +hi note="update in TestFlight"
row "Next, 0.3.2: 5 changes on main" note="not released"
```
````

### short-release-go-ahead (FAIL)

**Chris:** OK, yeah go ahead and release that. I want to play with the music tools. (What you just did: started the 0.3.2 release; a worker is building it now and it reaches TestFlight in about 40 minutes. It leaves out the faster Send tap, which is not done yet.)

Good: One line: 0.3.2 is building, on TestFlight in about 40 minutes with keys and chords; the Send tap fix waits. No deck, no 'what happens next' pages (YUI-118).

- preset: shapes not in [card say ask choose stat list sketch row after timeline now next done]
- preset: shape not in [card say ask choose stat list sketch row after timeline now next done]

````
0.3.2 is building, on TestFlight in about 40 minutes. The faster Send tap isn't in it.

```yui
shapes "0.3.2 release" caption="Keys and chords ship in about 40 min."
shape circle Worker +pulse
shape arrow
shape box "Build 0.3.2"
shape arrow
shape pill TestFlight +dash
```
````

### doing-long-turn (FAIL)

**Chris:** What needs me today? Check my calendar, my mail and the board. (This turn runs on the host with tools and takes about a minute: calendar first, then mail, then the board. Write everything you send during the turn, in order, as one reply. What the tools returned: gcal_list_events: 10:00 call with Dana (30 min), 4:00 design review. gmail_search: two need a reply today, the venue contract from Sam and a question about an invoice. kanban board: one card waits on you, t_627321c6 (YUI-SHIP 0.3.3), asking whether to ship without the tuner.)

Good: doing lines as it goes, plain words and a step ("Reading your calendar" 1/3, "Checking your mail" 2/3, "Looking at the board" 3/3), no card ids or tool names; then the answer: two calls, two replies to send, one choice on the tuner (YUI-63).

- doing: 0 doing lines with words, want 2

````
Five things need you today.

```yui
sketch "Today" frame=window
row "10:00 Call with Dana: 30 min"
row "4:00 Design review"
row "Sam: venue contract" +hi note="reply today"
row "Invoice question" +hi note="reply today"
row "YUI-SHIP 0.3.3: no tuner?" +hi note="waiting on you"
choose "Ship 0.3.3 without the tuner?" "Ship it"|"Hold for tuner" +other
```
````

### music-jam-beat (pass)

**Chris:** Trying to get back into drumming. Give me a simple boom bap beat around 90 I can mess with.

Good: One `loop` line near 90 BPM with a boom bap pattern in `p=` that plays (`+play`), a short line at most. No pattern written out in words, no drum tab, no advice paragraph.

````
Classic boom bap at 90: kick on 1 and the "a" of 2, snare on 2 and 4, swung hats.

```yui
loop 90 "Boom bap" p=x.....x.|....x...|........|x.x.x.x. swing=56 +play
```
````

### music-finger-drums (pass)

**Chris:** Waiting on a call. Let me just tap out some drums on my phone for a minute.

Good: One `drums` line (2x2 or 4x4), a few words at most.

````
Pads are up. Tap away.
```yui
drums 2x2 +record
```
````

### music-beat-sent (pass)

**Chris:** [yui] n1 loop bpm=94 swing=25 steps=8 rows=kick|snare|clap|hat|open|rim|tom|shaker p=x..xx.x.|....x...|..x...x.|xxxxxxxx||||
Sent my beat, 94 BPM

Good: The person's version patched in by preset name (`~loop p=... bpm=94 swing=25`) and a `save` with a short name, a line at most. No re-sent loop, no critique of the beat.

````
Locked in at 94.
```yui
~loop bpm=94 swing=25 p=x..xx.x.|....x...|..x...x.|xxxxxxxx||||
save beat
```
````

### show-phase-one (pass)

**Chris:** Walk me through phase one. (What you know: phase one of the full-screen change. Answers play as full-screen chunks, and the chat is just the record, top right. Bottom right: a bigger mic, a T that opens the text field, and a + for attachments, including images. Settings sit behind a hamburger at top left, beside the agent picker.)

Good: A line and a drawing per part: the stage with a chunk on it, the record top right, the new bottom bar (big mic, T, +). Never a page with a heading over a paragraph (feedback AL1My-stUBnvtXD2WKV7ec8, YUI-119).

````
Phase one: answers take the whole screen, controls move to the corners.

```yui
sketch "Answers" frame=phone before=Now
row "Answer as a chat bubble, in a scroll" +x note="buried in chat"
after Phase one
row "Answer fills the screen, one chunk at a time" +hi note="full screen"
row "Chat" +button note="top right, the record"
```
```yui
sketch "Bottom right" frame=phone before=Now
row "Text field always open" +x note="takes space"
after Phase one
row "Mic" +button +hi note="bigger, main way to talk"
row "T" +button note="opens the text field"
row "+" +button note="attach, images too"
```
```yui
sketch "Top left" frame=phone before=Now
row "Settings scattered" +x
after Phase one
row "Menu  ·  Agent picker" +button +hi note="settings behind the hamburger"
```
````

### show-new-layout (pass)

**Chris:** Show me the bigger microphone. Does the text field look better? I want to see the new layout of big microphone, T for text and + to attach. Remember, I want you to show me this. (What you know: phase one of the full-screen change. Answers play as full-screen chunks, and the chat is just the record, top right. Bottom right: a bigger mic, a T that opens the text field, and a + for attachments, including images. Settings sit behind a hamburger at top left, beside the agent picker.)

Good: The bottom bar drawn: `sketch frame=phone` with `+button` rows for +, T and the big mic, ideally before and after (the old always-there field struck out). Not a description of it (feedback AL1My-stUBnvtXD2WKV7ec8).

````
Text field is tucked behind T, so the bottom bar is cleaner. Here's the new layout.

```yui
sketch "Phase one layout" frame=phone before=Now
row "+  Say something nice...  Mic" +button +x note="field always open"
after New
row "☰  Agent picker  ·  Chat" +hi note="settings left, record right"
row "Full-screen answer" +hi note="fills the stage"
row "+" +button note="attach, images too"
row "T" +button note="opens text field"
row "Mic" +button +hi note="big, bottom right"
```
````

### music-keys-scale (FAIL)

**Chris:** Learning piano again. Give me something to noodle around A minor pentatonic on.

Good: One `keys Am pentatonic` line (a title or +send is fine), a short line at most. No list of note names, no fingering advice paragraph.

- preset: chords not in [keys say card save loop]

````
Keys are locked to A minor pentatonic, so nothing sounds wrong. Strum chords under it and add a beat.

```yui
keys Am pentatonic
chords Am|G|C|F
loop 88 "Easy groove" p=x...x...|....x...|x.x.x.x. +play
```
````

### music-chords-song (pass)

**Chris:** I want to strum along to one of those four chord pop songs on my uke. G is a good key for me.

Good: One `chords` line in G (`chords G I-V-vi-IV` or `chords G|D|Em|C`), a short line at most. No chord names in a paragraph, no chord diagrams in text.

````
G, D, Em, C is the classic. Strum each chord for one bar, then loop.

```yui
chords G I-V-vi-IV
```
````

### music-tuner-guitar (pass)

**Chris:** Just restrung my acoustic and it sounds awful. Help me get it in tune.

Good: One `tuner guitar` line, a short line at most. No list of string notes and frequencies, no advice on tuning by ear.

````
New strings drift flat for a while, so tune, then retune once.

```yui
tuner guitar
```
````

### music-metronome-practice (pass)

**Chris:** Working on my strumming timing. I want to practice slow, like 70 bpm in 4/4.

Good: One `metronome 70` line (beats=4 is fine), a short line at most. No paragraph of practice tips, no counting in words.

````
70 bpm, 4/4. Count "1 & 2 & 3 & 4 &", down on the numbers, up on the "&".

```yui
metronome 70
```
````

### explain-mongols-geography (pass)

**Chris:** All right, can you give me a brief geographic explanation of the Mongols?

Good: One line with the answer, then one deck on `>full` where every page has its picture: the empire as a `map` (its outline in lat,lon points, Karakorum as a pin, routes east and west), the size as a `chart` or a `stat`. Not pages of text, and not the steppe drawn as dots in `shapes` (TestFlight feedback AJIE1_1Ru1V4EMgmpWZtniI: 'It's just a text bomb'; feedback AL2nKEYo on the shapes version: 'Again, not bad but this should be a Map').

````
Steppe horsemen from Mongolia built the largest land empire ever.

```yui
>full
deck "The Mongols, by the map"
page "How far it reached" body="Korea to Hungary, the Siberian forest to Persia."
map caption="Karakorum sat in the middle and rode out every way."
area "Mongol Empire" 53,140|43,131|34.7,126.5|22.3,114|24,98|34,70|25.5,57|33,44|41,31|46,30.5|54,23|60,56|55,95 tone=butter
area Raided PL|HU +dash
pin@ka Karakorum 47.2,102.8 +pulse
route East ka|37.6,127 +arrow
route West ka|50.4,30.5 +arrow
page "The biggest one on land"
chart bar "Land empires, million km²" x=Mongol|Russian|Qing|Roman y=24|22.8|14.7|5
page "At its peak, 1279"
stat "24M km²" "A sixth of the land on Earth"
choose "Go deeper?" "How they moved so fast"|"Why it split up"|"Why do you ask?"
end
```
````

### explain-rome-rise-fall (FAIL)

**Chris:** Give me the quick version of how the Roman Empire rose and fell.

Good: A line, then a picture per part: the empire at its peak as a `map` around the Mediterranean, its size over the centuries as a `chart` (or a `timeline` on the stage), the split as an east and west area. No page that is only a heading and a paragraph.

- map: a where answer with no map

````
Rome grew from a city-state into a Mediterranean empire, then overstretched, split, and lost its western half.

```yui
timeline "Rome, rise to fall"
done "Republic founded, kings out" at="509 BC"
done "Punic Wars: Carthage crushed, Mediterranean won" at="264-146 BC"
done "Augustus: Republic becomes empire" at="27 BC"
done "Peak under Trajan, 5 million km²" at="117 AD"
done "Crisis: civil wars, plague, inflation" at="235-284"
done "Empire split East and West" at="395"
done "Western Rome falls to Germanic kings" at="476"
done "Eastern Rome (Byzantium) falls to the Ottomans" at="1453"
```
````

### explain-monsoon-how (pass)

**Chris:** Why does India get monsoons? Keep it short.

Good: One line and a picture: land heats, air rises, wet air off the ocean moves in, as a diagram in `shapes` with arrows or a `map` with the winds as routes, maybe a rainfall `chart` by month. Not a paragraph of weather words.

````
Summer heats land faster than ocean, so moist ocean air gets pulled inland and dumps rain.

```yui
shapes "Why India gets monsoons" caption="Hot land pulls in cool, wet ocean wind; the Himalayas force it up into rain."
shape circle "Hot land" +grow tone=butter
shape arrow
shape pill "Wet wind" +pulse tone=mint
shape arrow
shape box "Himalayas" +fill
shape arrow
shape blob Rain tone=lavender
```
````

### where-trip-route (pass)

**Chris:** Thinking about a train trip from Lisbon to Barcelona with stops in Porto and Madrid. How does that route go?

Good: One line, then a map: pins on Lisbon, Porto, Madrid and Barcelona, a route through them with an arrow, a caption with the rough hours (a small `table` of the legs beside it is fine). Not a numbered list of legs in words.

````
Porto to Madrid has no direct train; you change in Vigo.

```yui
map "Lisbon to Barcelona" caption="Four legs, one change in Vigo."
pin@lis Lisbon 38.72,-9.14
pin@opo Porto 41.15,-8.61
pin@vgo Vigo 42.24,-8.72 +pulse
pin@mad Madrid 40.42,-3.70
pin@bcn Barcelona 41.39,2.17
route "Lisbon to Porto" lis|opo +arrow
route "Porto to Vigo" opo|vgo +arrow
route "Vigo to Madrid" vgo|mad +arrow
route "Madrid to Barcelona" mad|bcn +arrow
table Legs Leg|Train|Time "Lisbon to Porto|Alfa Pendular|~3h" "Porto to Vigo|Celta (few daily)|~2h40" "Vigo to Madrid|Alta Velocidad|~3h30" "Madrid to Barcelona|AVE, Ouigo or Iryo|~2h30"
```
````

### where-delivery-area (pass)

**Chris:** Our farm delivers CSA boxes across Vermont, New Hampshire and western Massachusetts. Can you show a new customer what that covers?

Good: One line, then a map with the delivery area filled in (VT and NH by code, western Massachusetts as lat,lon points) and the farm or the big towns as pins. Not a list of states and counties.

````
Here's our delivery area: all of Vermont, New Hampshire and western Massachusetts.

```yui
map "Where we deliver" caption="CSA boxes reach Vermont, New Hampshire and western Massachusetts."
area Vermont 45.01,-73.34|45.01,-71.50|43.6,-72.3|42.73,-72.46|42.73,-73.27|43.6,-73.25|44.2,-73.4 tone=mint
area "New Hampshire" 45.3,-71.08|45.01,-71.50|43.6,-72.3|42.73,-72.46|42.70,-71.2|43.07,-70.71|43.6,-70.98|44.3,-71.0 tone=lavender
area "Western Massachusetts" 42.74,-73.27|42.74,-72.46|42.03,-72.6|42.03,-73.49|42.5,-73.35 tone=butter
```
````

### where-quick-country (pass)

**Chris:** Where exactly is Kyrgyzstan?

Good: One line (Central Asia, between Kazakhstan and China) and a map in the chat: KG as an area with a pulse on Bishkek, neighbors faint. No deck for a quick where.

````
Central Asia, landlocked, between Kazakhstan, China, Tajikistan and Uzbekistan.

```yui
map "Kyrgyzstan" caption="Mountainous, with Bishkek in the north and Lake Issyk-Kul in the east."
area Kyrgyzstan KG tone=butter +pulse
area Neighbors KZ|UZ|TJ|CN tone=mute
pin@bi Bishkek 42.87,74.59 +pulse
pin@ik "Issyk-Kul" 42.45,77.25
```
````

### data-lunch-macros (pass)

**Chris:** Give me a quick lunch idea with 30g of protein.

Good: One line naming the lunch and a real Yui Lines table (`table Macros Food|Protein|Cal "Chicken|35g|165" ...`) or stat tiles for the macros. Not a quoted title plus `columns:` rows and `end` (GLM 5.2 on YUI-131, every row a parse error), and not a markdown table.

````
Chicken and avocado wrap: about 30g protein, 10 minutes, no cooking if you use rotisserie chicken.

```yui
table "Chicken avocado wrap" Item|Protein "Rotisserie chicken, 4 oz|26g" "Whole wheat tortilla|4g" "Avocado, lettuce, salsa|1g" "Total|~31g"
```
````

### list-no-escaped-breaks (pass)

**Chris:** What should I eat for dinner tonight? Something with protein. I'm allergic to peanuts and shellfish.

Good: A few dinners as a `list` (or cards), one per item, and a way to pick one. Never one `say` with \n breaks inside the quotes: the app shows the letter n (YUI-161, GLM 5.2 on native Basil).

````
Sheet-pan lemon-herb salmon with sweet potato and broccoli: one pan, about 30 minutes, no peanuts or shellfish.

```yui
table "Dinner, approx." Part|Amount|Protein "Salmon fillet|6 oz|34 g" "Sweet potato|1 medium|2 g" "Broccoli|2 cups|5 g" "Olive oil, lemon, herbs|1 tsp|0 g" "Total|~550 kcal|~41 g"
```
````

### items-board-cards-drawn (pass)

**Chris:** Anything waiting on me?

Good: One short line, then the two items drawn: a sketch with one row per card (title plus one fact) or a list or two cards, so he sees them. Not a paragraph counting the cards and listing what is in them.

````
Two cards need you.
```yui
sketch "Waiting on you" frame=bubble
row "Justice Watch: 4 recovered articles, 2 rewrites" +hi note="approve to publish"
row "Aaron's weekly roundup: post and landing page link" +hi note="needs your OK"
```
````

### ui-zip-in-context (pass)

**Chris:** Tell me about the newest change on the closing purple box.

Good: One short line, then the box drawn in a phone sketch: the ZIP field and the two buttons in place, the new part highlighted. Not a paragraph describing the field, and no hyphen lines (Chris, TestFlight: "Show me the zip in context. You should be able to illustrate UI elements fairly easily").

````
Sep 24: the closing purple box is now finished, with the client's final copy.

```yui
sketch "Closing purple box" frame=phone before=Before
row "Red placeholder frame" +x note="gone"
after Now
row "Client's final copy, word for word" +hi note="new copy"
row "Your ZIP  33410" +hi note="working field"
row "Two-question form" +hi note="feeds lead record"
row "See My Coverage Options" +button
row "Talk to a Licensed Advisor" +button
```
````

### when-two-days-timeline (pass)

**Chris:** What did we change on the quote site two days earlier, on Sep 22 and 23?

Good: One short line, then a timeline: the Sep 22 and Sep 23 changes as rows with their dates, oldest first. Not a sentence with the dates inside it (Chris: "If we're talking about some two days earlier, we need some type of timeline. Show me visually").

````
Three changes across Sep 22 and 23.

```yui
timeline "Quote site, Sep 22-23"
done "Real brand logos on /brands family cards" at="Sep 22"
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
list "Quote site fixes" "Brands page: real logos on family cards" "Calculator: bigger field labels" "Forms: last four eyebrow labels fixed" "Closing box: red placeholder frame gone"
```
````

### fact-one-sentence (pass)

**Chris:** Anything else fixed on the forms?

Good: One fact, so one plain sentence: the last four eyebrow labels on the forms were fixed. No hyphen, no list of one (Chris: "If there's only one thing hyphenated, it doesn't mean anything").

````
No. The only form fix on the board is the last four eyebrow labels.
````

### last-page-next-step (FAIL)

**Chris:** Walk me through the most recent changes we've done for the quote site.

Good: Short answer first, then a deck or plan of the changes (each with its picture, at most 4 pages) whose last step is a `choose` of what to do next or 'Why do you ask?', never a page they can only read (Chris: "we are on the last card and I want some type of action here. I don't want a user to land here and not know what to do next").

- need: none of [deck plan]

````
Sep 24 was the big one: the closing box is finished.

```yui
timeline "Quote site, recent"
done "Real logos on /brands family cards" at="Sep 22-23"
done "Bigger calculator field labels" at="Sep 22-23"
done "Last four form eyebrow labels fixed" at="Sep 22-23"
done "Closing purple box finished" at="Sep 24"
sketch "Closing purple box" frame=phone before=Before
row "Red placeholder frame" +x note="gone"
after After
row "Client's final copy, word for word" +hi note="exact text"
row "Your ZIP  33410" +hi note="working field"
row "Two-question form" +hi note="feeds lead record"
row "See My Coverage Options" +button
row "Talk to a Licensed Advisor" +button
choose "What next?" "Try the form"|"What's left?"|"Why do you ask?"
```
````

### last-page-walkthrough (pass)

**Chris:** Walk me through what changed on the closing purple box, step by step.

Good: A deck (or plan) of the changes, each with its picture, and the last step is something to tap: a `choose` of what to do next or 'Why do you ask?'. No dead end.

````
Four changes on the purple box, Sep 24, one step per page.

```yui
>full
deck "Closing purple box" +inline
page "1. Final copy, placeholder gone" body="The client's final copy went in word for word. The red placeholder frame was removed."
sketch "Purple box" frame=window before=Before
row "Red placeholder frame" +x note="removed"
after After
row "Client's final copy, word for word" +hi note="live"
page "2. ZIP field and two questions" body="The box now has a working ZIP field and a two-question form. Answers go straight into the lead record."
sketch "The form" frame=phone
row "Your ZIP" +hi note="working"
row "Question 1" +hi
row "Question 2" +hi note="to lead record"
page "3. Buttons renamed" body="Both calls to action now use the client's wording."
sketch "Buttons" frame=phone
row "See My Coverage Options" +button +hi
row "Talk to a Licensed Advisor" +button +hi
choose "What next?" "Review the live box"|"Test the form"|"Why do you ask?"
end
```
````

### tiles-board-status (pass)

**Chris:** ok, is the board up to date? (What you just looked up: site lane is clean, nothing open. The new feature lane, the quote calculator, has one card blocked waiting on a design pick from Chris. SEO lane shipped its last audit fixes yesterday and scores 94.)

Good: One sketch, three Label: verdict rows (Site: good, New feature: needs help with +hi, SEO: strong), a line of a few words at most. No sentences, no deck, no 'One question' screen.

````
Yes, board is current.

```yui
sketch "Board" frame=window
row "Site: clean" note="nothing open"
row "Quote calculator: 1 blocked" +hi note="needs your design pick"
row "SEO: 94" note="fixes shipped yesterday"
```
````

### outcome-invite-declined (pass)

**Chris:** I declined the Friday 3 pm team sync invite from Dana like you said. What's the state? (What you just did: declined it on the calendar, no reply message sent to Dana.)

Good: A sketch of the invite row struck out (+x) with note=declined. A few words. If it asks about Dana it is one choose on the same screen, never 'do you want to do what the previous page said'.

````
Declined on your calendar; Dana got no message.

```yui
sketch "Team sync, Dana" frame=bubble
row "Friday 3 pm" +x note="declined"
row "Reply to Dana: none sent" +hi note="she sees decline only"
```
````

### outcome-worker-running (pass)

**Chris:** What's happening on the quote calculator card right now? (What you just looked up: a worker picked it up 4 minutes ago and is editing the calculator labels. Nothing has failed. Expect it done in about 20 minutes.)

Good: A small drawing of the worker at its task: shapes with the busy part +pulse (Worker, arrow, the card), or a one-row sketch or timeline. A few words. No paragraph.

````
Worker is editing the calculator labels. Nothing failed.

```yui
shapes "Quote calculator" caption="Picked up 4 min ago. About 20 min left."
shape circle Worker
shape arrow
shape box "Calculator labels" +pulse
```
````

### context-sample-not-ask (FAIL)

**Chris:** Show me a sample status board so I can see how the tiles look.

Good: One sketch of Label: verdict rows marked as an example (note="example" or a sample title). No row says "waiting on you": a sample is not a real ask.

- preset: stat not in [sketch row after say choose ask]

````
Sample only, made-up rows.

```yui
sketch "Sample board" frame=window
row "Site: good" note="example"
row "New feature: needs help" +hi note="example"
row "SEO: strong" note="example"
row "Backups: late" +hi note="example"
stat 178.9lb Weight delta=-2.3 spark=181|180|178.9
stat "3 of 5" "Workouts this week"
```
````

### context-about-this (pass)

**Chris:** [yui] note: your newest message here is 4 min old and is what they are looking at: "Guide v40 is live now. | screen: Board; Before and after | rows: Site: good; New feature: needs help; SEO: strong". Words like "this", "that" or "it" mean that message. Answer about it first. Sample rows in it are examples, not their open items. Bring up another open item only if they ask, and then say when they last saw it and what they answered.
What are you waiting on me for with this? (What you just looked up: nothing on that screen is open, it was a sample. An older ask, testing the four new models with a capped key, is still open: he tapped Not yet on it at 6:54 pm.)

Good: One line about the screen just shown: nothing, it was a sample. The old model-testing ask is not brought up as the answer.

````
Nothing. That screen was a sample.

```yui
sketch "Waiting on you" frame=window
row "Guide v40 screen: nothing" note="example"
row "Test four new models, capped key: open" +hi note="you tapped Not yet, 6:54 pm"
```
````

### context-old-ask-when (pass)

**Chris:** [yui] note: your newest message here is 4 min old and is what they are looking at: "Guide v40 is live now. | screen: Board; Before and after | rows: Site: good; New feature: needs help; SEO: strong". Words like "this", "that" or "it" mean that message. Answer about it first. Sample rows in it are examples, not their open items. Bring up another open item only if they ask, and then say when they last saw it and what they answered.
Is anything else waiting on me? (What you just looked up: one ask is open, testing the four new models with a capped key. He tapped Not yet on it at 6:54 pm today.)

Good: The old ask comes second and is named for what it is: still open, he said Not yet at 6:54 pm. Not presented as new.

````
Nothing from that screen, it was a sample. One real ask is open.

```yui
sketch "Waiting on you" frame=window
row "Test the four new models: capped key" +hi note="you said Not yet, 6:54 pm"
```
````

### showhere-before-after (pass)

**Chris:** Show me the before and after of the hero on the site. (What you just looked up: the old hero is /demo/site_before_hero.jpg and the new one is /demo/site_after_hero.jpg. The change: a bigger headline and one button instead of three.)

Good: A compare of the two shots, or a sketch with after. One short line. Not a card that only says Open.

````
Bigger headline, one button instead of three.
```yui
compare /demo/site_before_hero.jpg /demo/site_after_hero.jpg "Hero"
```
````

### showhere-progress-page (pass)

**Chris:** What changed on the progress page? (What you just looked up: each entry now shows before and after shots, a Feedback tag links to the note, and the filter chips moved to the top. Shots: /demo/site_before_classes.jpg and /demo/site_after_classes.jpg. Page: https://www.yuigui.com/progress)

Good: The changes drawn here: a sketch with after, or a compare of the shots. At most a small link card under them. Not a card that only opens the page.

````
Three changes, shown here.

```yui
compare /demo/site_before_classes.jpg /demo/site_after_classes.jpg "Classes entry"
sketch "Progress page" frame=phone before=Before
row "Entry: text only" +x note="no shots"
row "Feedback: no link" +x note="note buried"
row "Filter chips: bottom" +x note="hard to reach"
after After
row "Entry: before and after shots" +hi note="tap to compare"
row "Feedback tag" +button +hi note="links to the note"
row "Filter chips: top" +hi note="moved up"
```
````

### showhere-after-linkout (pass)

**Chris:** Just show me here. (Shots: /demo/site_before_classes.jpg and /demo/site_after_classes.jpg.)

Good: A compare of the two shots in the thread. No second link-out card.

````
Here's the classes page, before and after.

```yui
compare /demo/site_before_classes.jpg /demo/site_after_classes.jpg "Classes page"
```
````

### showhere-demo (pass)

**Chris:** Can I see the reply cards demo? (What you just looked up: it is the /playground demo cards. It shows a card, a stat and a list. A card has a title, a body and one button. The stat shows a number with a small trend line.)

Good: The demo's parts drawn right here (a card sketch, a stat). Not a card that only links to /playground.

````
Here are the three demo cards, with made-up numbers.

```yui
card "Example: Sunday plan" body="3 sessions, 40 min each" cta="Start"
stat 178.9lb "Example: Weight" delta=-2.3 spark=181|180|178.9
list "Example: Today" "Squat 5x5" "Bench 5x5" "Rows 3x10" +check
```
````

### showlink-waiting-shots (pass)

**Chris:** What are you waiting on me for with this? (What you just looked up: the site refresh card needs your pick of before and after shots for the progress page, https://www.yuigui.com/progress. Old hero: one headline, three buttons. New hero: a bigger headline, one button. Shots on file: /demo/site_before_hero.jpg and /demo/site_after_hero.jpg.)

Good: The two shots in a compare, or a sketch with after, plus the one thing needed. Not a card that only says Open.

````
Only this: your OK on the hero shots for the progress page.

```yui
compare /demo/site_before_hero.jpg /demo/site_after_hero.jpg "Hero"
choose "Use these shots?" "Use them"|"Show other shots"|"Skip for now"
```
````

### showlink-only-url (pass)

**Chris:** Where is the new hero? (What you just looked up: it is live on the site, https://www.yuigui.com/progress, in the Site refresh entry. Old hero: one headline and three buttons. New hero: a bigger headline and one button.)

Good: The change drawn: a sketch with before and after. At most one small link card under it.

````
New hero: live on the progress page, in the Site refresh entry.

```yui
sketch "Old hero" frame=window before=Old
row "One headline" +x
row "Three buttons" +x note="too many"
after New
row "Bigger headline" +hi note="Site refresh entry"
row "One button" +button +hi
card "Progress page" body="Site refresh entry" cta="Open" url=https://www.yuigui.com/progress
```
````

### showlink-build-changes (pass)

**Chris:** What changed in the last build? (What you just looked up: build 332 opens a notification on page one, the mic stays on the last page, and a reply quotes the screen. Full notes: https://www.yuigui.com/progress)

Good: The three changes shown here (a list, timeline or sketch). The link, if any, is a small follow-up.

````
Build 332 has three changes.

```yui
sketch "Build 332" frame=phone
row "Notification opens on page one" +hi note="lands at the start"
row "Mic stays on the last page" +hi note="no more vanishing"
row "Reply quotes the screen" +hi note="shows what you meant"
```
````

### showlink-demo-page (pass)

**Chris:** Is there a demo of the compare card? (What you just looked up: yes, https://www.yuigui.com/playground?demo=show-here. It shows a slider between a before and an after shot, with Side and Toggle modes. Shots: /demo/before_room.jpg and /demo/after_room.jpg.)

Good: The demo itself: a compare of the two shots. Not a card that only links to the playground.

````
Yes, here it is, with the before and after shots.

```yui
compare /demo/before_room.jpg /demo/after_room.jpg "Room"
```
````

### showlean-waiting (pass)

**Chris:** What are you waiting on me for with this? (What you just looked up: the site refresh card is done except before and after shots of the hero for the progress page. Page: https://www.yuigui.com/progress. Nothing else is open.)

Good: The ask drawn here (a sketch with the missing before and after slot, or a camera to snap it). At most a small link under it.

````
Nothing. The hero shots are mine to make, and nothing else is open.

```yui
sketch "Site refresh card" frame=window
row "Card: done except one item"
row "Hero before and after shots: mine" +hi note="not waiting on you"
row "Progress page: needs the shots" note="yuigui.com/progress"
row "Anything from you: none"
```
````

### showlean-new-hero (pass)

**Chris:** What does the new hero look like? (What you just looked up: it is on https://www.yuigui.com, top of the page. It has a bigger headline and one button, Get Yui, where there were three buttons.)

Good: The hero drawn in a sketch phone, before and after. At most a small link under it.

````
Here's the hero as you described it; I don't have the exact headline wording.

```yui
sketch "yuigui.com hero" frame=window before=Before
row "Headline" +x note="smaller"
row "Button 1" +button +x
row "Button 2" +button +x
row "Button 3" +button +x note="three choices"
after After
row "Headline" +hi note="bigger"
row "Get Yui" +button +hi note="one button"
```
````

### showpick-four-looks (pass)

**Chris:** Show me the four looks again. (What you just looked up: the demo page is https://www.yuigui.com/playground?demo=shader-look. The four dark shots are already on disk: /Users/urzas/.hermes/kanban/artifacts/t_b8ab6ac3/1-currents-dark.png, 2-terrain-dark.png, 3-dots-dark.png, 4-type-dark.png, same folder.)

Good: A gallery of the four shots with +pick, so the choice is on the phone. A site link only as a small button under it, never alone.

````
Here are the four, tap one to pick.
```yui
gallery /Users/urzas/.hermes/kanban/artifacts/t_b8ab6ac3/1-currents-dark.png /Users/urzas/.hermes/kanban/artifacts/t_b8ab6ac3/2-terrain-dark.png /Users/urzas/.hermes/kanban/artifacts/t_b8ab6ac3/3-dots-dark.png /Users/urzas/.hermes/kanban/artifacts/t_b8ab6ac3/4-type-dark.png +pick
```
````

### showpick-two-looks (pass)

**Chris:** Show me the two card styles again so I can pick. (What you just looked up: playground demo https://www.yuigui.com/playground?demo=card-style. Shots: /demo/s1.jpg Soft, /demo/s2.jpg Sharp.)

Good: A gallery or compare of the two shots with the pick right there. Not a card that only opens the playground.

````
Two card styles, tap to pick.

```yui
gallery /demo/s1.jpg /demo/s2.jpg +pick
```
````

### showpick-only-url (pass)

**Chris:** Show me again. (What you just looked up: it is the shader look demo, https://www.yuigui.com/playground?demo=shader-look. Its shots are at /Users/urzas/.hermes/kanban/artifacts/t_b8ab6ac3/ as 1-currents-dark.png, 2-terrain-dark.png, 3-dots-dark.png, 4-type-dark.png.)

Good: The four shots as a gallery with +pick (or a choose beside them). The playground link only as a small extra, never the whole answer.

````
Here are the four again. Tap your pick.

```yui
gallery /Users/urzas/.hermes/kanban/artifacts/t_b8ab6ac3/1-currents-dark.png /Users/urzas/.hermes/kanban/artifacts/t_b8ab6ac3/2-terrain-dark.png /Users/urzas/.hermes/kanban/artifacts/t_b8ab6ac3/3-dots-dark.png /Users/urzas/.hermes/kanban/artifacts/t_b8ab6ac3/4-type-dark.png +pick
```
````

### vis-status-board (pass)

**Chris:** Is everything up to date? (What you just looked up: the site deploy is green and live. The board has 3 cards running and 2 blocked on a pick from Chris. Build 392 is the newest on TestFlight and his phone is on it. No cron failed today.)

Good: One short line at most, then one `sketch frame=window`: Label: verdict rows (Site: live, Board: 2 need your pick +hi, Build: 392 newest, Crons: clean). No paragraph, no second bubble (VIS-1).

````
Mostly. Two cards need you.

```yui
sketch "Status" frame=window
row "Site: green, live"
row "Board: 2 blocked" +hi note="need your pick"
row "Board: 3 running"
row "Build 392: newest, on your phone"
row "Crons: none failed today"
```
````

### vis-what-did-you-fix (pass)

**Chris:** What did you fix? (What you just did: the left drawer kept a finished card under Now because one card with badly saved text crashed every refresh. You fixed the crash. A new card makes closed cards leave the drawer within seconds; it is on the board, not built.)

Good: One line, then a before and after `sketch` (drawer showed the done card under Now, now it is gone) with the new card as a `+hi` row. No fix report in prose (VIS-1).

````
Crash fixed. The drawer refreshes again; the faster cleanup is only planned.

```yui
sketch "Left drawer" frame=phone before=Then
row "Done card still under Now" +x note="stuck"
row "One card, bad saved text" +x note="crashed every refresh"
after Now
row "Crash: fixed" +hi note="refresh works"
row "Closed cards leave in seconds" note="on board, not built"
```
````

### vis-you-misread-me (pass)

**Chris:** No. You misread me. I meant the left drawer, not TestFlight. (What you found: the drawer still lists a finished card under Now.)

Good: One short line owning it, then a `sketch` of the left drawer with the stale row struck out. No apology paragraph, no restating what he said (VIS-1).

````
Left drawer, my mistake. A finished card is stuck under Now.

```yui
sketch "Left drawer" frame=phone before=Now
row "Now: Menu work card" +x note="already done"
after Expected
row "Now: only open cards" +hi note="done card leaves"
```
````

### vis-put-a-card-in (pass)

**Chris:** Put a card in for a daily morning release instead of ad hoc builds. (What you just did: created the card, parked in the backlog under the release lane, first in the queue. It has not been started.)

Good: One line: it is on the board, first in the queue. Then one drawing of the card in its place (a `sketch` of the queue with the new row `+hi`, or a `timeline`). No paragraph about what the card will do (VIS-1).

````
Card parked in your backlog, first in the queue, not started.

```yui
menu backlog@daily-release "Daily morning release" sub="release lane, not started"
sketch "Backlog" frame=window
row "Daily morning release" +hi note="first, not started"
row "Ad hoc builds" +x note="replaced"
```
````

### vis-no-filler-briefing (pass)

**Chris:** What shipped overnight? (What you just looked up: build 392 reached TestFlight at 6:12 am with the drawer fix and the one-build-a-day guard. The site deploy of the progress page is live. Two cards are still blocked on a pick from Chris: the tuner and the onboarding copy.)

Good: A line of nouns and verdicts (no so, now, however, intro), then one sketch: Build 392: on TestFlight, Drawer fix: shipped, Progress page: live, Tuner and onboarding copy: need your pick +hi. No 'a few things', no paragraph (VIS-1, caveman).

````
Two shipped, two waiting on you.

```yui
sketch "Overnight" frame=window
row "Build 392: on TestFlight" note="6:12 am"
row "Drawer fix: in 392"
row "One-build-a-day guard: in 392"
row "Progress page: live" note="site deployed"
row "Tuner: blocked" +hi note="needs your pick"
row "Onboarding copy: blocked" +hi note="needs your pick"
```
````

### vis-three-ideas-one-page (pass)

**Chris:** How will you stop the text slides? (What you did: three changes. The plugin rewrites any reply over 30 words before it sends. The channel guide now says one line and a drawing. The eval fails a reply with more than one text bubble.)

Good: One line, then ONE drawing that holds all three ideas (a sketch with three rows, or a shapes chain of three), not three pages and not a paragraph each. No deck of one page per idea (VIS-1, Chris: up to 3 ideas on a card as long as we show them).

````
One line, then a drawing. I count the bubbles before I send.

```yui
sketch "Stopping text slides" frame=window
row "Me: one line, 30 words max" +hi note="the source fix"
row "Guide: one line and a picture" note="sets the rule"
row "Plugin: rewrites over 30 words" note="backstop, worse"
row "Eval: fails 2+ text bubbles" note="catches misses"
```
````
