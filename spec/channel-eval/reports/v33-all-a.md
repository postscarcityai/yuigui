# Channel eval: v33-all-a

Guide v33+826d5de2 (3076 words), model claude-opus-5-5, 2026-09-27T07:07.

**71/78 passed (91%).**

| category | passed |
|---|---|
| workout | 4/4 |
| check-in | 2/2 |
| photo | 2/2 |
| today | 1/1 |
| scheduling | 2/2 |
| decision | 2/2 |
| list | 2/2 |
| data | 1/1 |
| flow | 10/11 |
| teach | 2/2 |
| look | 2/2 |
| no-screen | 4/4 |
| secret | 2/3 |
| trap | 2/2 |
| patch | 4/5 |
| tap | 2/2 |
| reaction | 3/3 |
| dead-button | 2/3 |
| saved | 2/2 |
| mention | 1/2 |
| report | 5/5 |
| group | 2/3 |
| idea | 2/2 |
| library | 1/1 |
| short | 2/2 |
| doing | 1/1 |
| music | 4/5 |
| show | 2/2 |

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
| flow-onboard-goal | pass |  |
| react-build-it | pass |  |
| react-not-sure | pass |  |
| react-no | pass |  |
| dead-status-report | pass |  |
| dead-logged-water | FAIL | words: 69 > 30 |
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
| mention-notes-context | FAIL | screen: no ```yui block; need: none of [list card plan table]; words: 92 > 70 |
| report-card-done | pass |  |
| report-long-walkthrough | pass |  |
| talk-keep-plan-editable | pass |  |
| talk-typed-on-screen | pass |  |
| report-draw-change | pass |  |
| draw-screen-fix | pass |  |
| report-pages-picture | pass |  |
| menu-shortcut | FAIL | narrates: "tap buttons" |
| menu-tapped | pass |  |
| group-asked-by-agent | FAIL | preset: now not in [list table card plan timeline ask choose step]; preset: next not in [list table card plan timeline ask choose step] |
| group-lead-hands-on | pass |  |
| group-notes-context | pass |  |
| restyle-app-autumn | pass |  |
| idea-shapes-heatpump | pass |  |
| idea-shapes-flywheel | pass |  |
| teach-one-screen | pass |  |
| library-flow-intake | pass |  |
| short-status-latest-build | pass |  |
| short-release-go-ahead | pass |  |
| doing-long-turn | pass |  |
| music-jam-beat | pass |  |
| music-finger-drums | pass |  |
| music-beat-sent | FAIL | preset: keys not in [loop say save card] |
| show-phase-one | pass |  |
| show-new-layout | pass |  |
| music-keys-scale | pass |  |
| music-chords-song | pass |  |

## Transcripts

### workout-leg-day (pass)

**Chris:** Leg day. I have 40 minutes, home gym.

Good: A short line, then the session on screen (a checklist or a card) with a way to start (ask or timer). No interrogation: he already said time and gear.

````
40 minutes, all dumbbells and bench. Heavy first, burn at the end.

```yui
card "Leg day · 40 min" body="5 warm-up · 30 work · 5 finisher. Rest 90s between sets."
list Session "Warm-up: bodyweight squats, band walks, leg swings (5 min)" "Goblet squat 4x10 @ 50 lb" "DB Romanian deadlift 4x10 @ 2x40-50 lb" "Bulgarian split squat 3x8/leg @ 2x25-35 lb" "DB hip thrust on bench 3x12 @ 50 lb" "Finisher: Tabata jump squats" +check
timer 5m Warm-up
>2 timer 90s Rest
>3 timer 20/10x8 Finisher
save legs
```
````

### workout-tabata (pass)

**Chris:** Give me a 10 minute tabata finisher, I'm ready now.

Good: A timer with work/rest x rounds (it goes full screen by itself) and maybe the move list. No questions first.

````
10 rounds, 40 on / 20 off. Cycle these five moves twice.

```yui
list Finisher "1. DB thrusters (moderate)" "2. Mountain climbers" "3. Renegade rows" "4. Jump squats" "5. Burpees"
timer 40/20x10 Tabata
save finisher
```
````

### workout-plank (pass)

**Chris:** plank hold, 2 min

Good: One timer line. Almost no chat text.

````
Two minutes. Brace hard, squeeze glutes, breathe.
```yui
timer 2m Plank
```
````

### workout-gear-question (pass)

**Chris:** I want to train today but I'm at my mom's place, not sure what she has.

Good: Offer the likely gear as a pick with +other, or a camera to snap what is there. One question, not a form.

````
Let's find out what's there. Tell me what you spot and I'll build the session.
```yui
pick "What's at your mom's?" "Nothing, just floor"|Chair|Stairs|Couch|Towel|Backpack|"Water jugs"|Bands|Dumbbells|"Pull-up spot" +other
```
````

### checkin-morning (pass)

**Chris:** morning check-in

Good: Sleep, soreness and energy as sliders or a short form (quoted title), or a plan that walks them one at a time, or the saved `flow workout-checkin` (it asks the same). Not a wall of questions in text.

````
Morning, Chris.
```yui
flow workout-checkin
```
````

### checkin-evening-voice (pass)

**Chris:** I want to do an end of day brain dump but I'm too tired to type.

Good: A mic, maybe with +auto. One short line.

````
Just talk. I'll sort it into tasks, notes and tomorrow.
```yui
mic "Brain dump: whatever's on your mind" +auto
```
````

### meal-photo (pass)

**Chris:** [photo attached. Image description: a plate with grilled chicken breast, a cup of white rice, steamed broccoli, and a drizzle of olive oil] lunch

Good: Estimate the macros briefly and offer to log it (ask) or show them as stats. Does not ask for another photo.

````
Solid lunch: about 600 kcal and 55 g protein, if that's roughly a 6 oz breast and a tablespoon of oil.

```yui
stat 55g Protein
table "Lunch estimate" Item|kcal|P|C|F "Chicken 6 oz|280|52|0|6" "Rice 1 cup|205|4|45|0" "Broccoli|30|3|6|0" "Olive oil 1 tbsp|120|0|0|14" "Total|~635|59|51|20"
choose "Chicken portion?" "4 oz"|"6 oz"|"8 oz" +other
ask "Log it?" "Log lunch"|"Adjust first"
```
````

### meal-log-no-photo (pass)

**Chris:** Can you log my lunch? I'm about to eat.

Good: A camera to snap the plate (the cheapest way to log), maybe a mic as an alternative.

````
Snap it before the first bite and I'll log it.
```yui
camera "Snap your lunch"
```
````

### today-plan (pass)

**Chris:** What should I do today?

Good: Without calendar access it proposes a shape for the day or asks one thing (energy, top priority) as buttons. Remembers Mick at 2 pm. Not a text essay.

````
I don't have your calendar yet, so here's a day built around what I know. Mick's out at 2.

```yui
timeline "Thursday"
now "Deep work block" at=9:15
next "Workout, 45 min home gym" at=11:30
next "Lunch and inbox sweep" at=12:30
next "Admin and errands" at=1:15
next "Pick up Mick" at=2:00
next "Time with Mick" at=2:30
choose "What's the one thing that has to get done today?" "Client work"|"Inbox zero"|"House stuff"|"Just recover" +other
```
````

### schedule-call (pass)

**Chris:** Set up a call with Matt next week, 30 minutes.

Good: Offer a few slots as buttons (avoiding 1:30 and 2 pm) with +other. One question.

````
Next week is Sep 28 to Oct 2. Which times should I offer Matt? The windows below avoid Mick's 2 pm pickup.

```yui
plan "Call with Matt" submit="Offer these times"
pick "Which days?" Mon|Tue|Wed|Thu|Fri
choose "When?" "Morning 9–12"|"Midday 12–1:30"|"Late 3:30–5" +other
choose "How?" Zoom|Phone|"Google Meet" +other
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
Tacos. It's a Thursday, Mick will actually eat them, and sushi is better saved for a night out.

```yui
choose "Tacos how?" "Order in"|"Make at home"|"Go out" +other
```
````

### decision-three-options (pass)

**Chris:** Help me pick which to do first this afternoon: invoice Heathos, reply to Paul about Plannix, or fix the Yui site footer.

Good: A recommendation plus the three as buttons (or an ordered list with +check). No essay.

````
Invoice Heathos first: it's quick and gets cash moving. Then reply to Paul, since he's waiting on you. Save the footer for last; nobody's blocked on it, and it's easy to pause when Mick's out at 2.

```yui
list "This afternoon" "Invoice Heathos" "Reply to Paul re Plannix" "Fix Yui site footer" +check
choose "Want a head start?" "Draft the Heathos invoice"|"Draft Paul's reply"|"Just the order" +other
```
````

### list-groceries (pass)

**Chris:** Make me a grocery list for high protein meals this week.

Good: A list with +check, a title, and items that fit on a phone.

````
Here's a week of high-protein staples, built around five easy dinners. It's on its own screen so you can check things off in the store.

```yui
>3 list Protein "Chicken breast 4 lb" "93% lean ground beef 2 lb" "Salmon fillets 1.5 lb" "Eggs 2 dozen" "Canned tuna x4" "Deli turkey 1 lb" +check
>3 list Dairy "Greek yogurt 32 oz x2" "Cottage cheese 24 oz" "Shredded mozzarella" "Milk 1 gal" +check
>3 list Pantry "Black beans x2" "Brown rice" "Whole wheat tortillas" "Oats" "Peanut butter" "Whey protein" +check
>3 list Produce "Broccoli x2" "Bell peppers x4" "Spinach bag" "Sweet potatoes x4" "Bananas" "Berries x2" "Onions" +check
>3 card "Dinners this week" body="Chicken fajitas · Beef burrito bowls · Sheet-pan salmon + sweet potato · Turkey meatballs · Chicken stir-fry" +fold
save groceries
```
````

### list-packing (pass)

**Chris:** Mick has a field trip tomorrow to the science museum. Packing list?

Good: A checklist. One line of text.

````
Here's a list for tomorrow. Check the school's note for lunch rules and gift shop money.

```yui
list "Field trip · Fri" "Signed permission slip" "Packed lunch (disposable bag)" "Water bottle" "Small snack" "Comfy closed-toe shoes" "Light jacket (museums run cold)" "School shirt if required" "Name label on bag" "Gift shop cash, if allowed" +check
save "field trip"
```
````

### data-weight-trend (pass)

**Chris:** How's my weight trending? Last 7 days: 181, 180.6, 180.2, 179.9, 180.1, 179.4, 178.9

Good: A stat with a delta and a spark, or a line chart. One line of read-out, not a table in text.

````
Down 2.1 lb in a week, steady and trending the right way. The Monday bump is normal water noise.

```yui
stat 178.9lb Weight delta=-2.1 spark=181|180.6|180.2|179.9|180.1|179.4|178.9
chart line "Last 7 days" x=Fri|Sat|Sun|Mon|Tue|Wed|Thu y=181|180.6|180.2|179.9|180.1|179.4|178.9
```

About 1.2% of body weight per week is on the quick side. Aim for 1–1.5 lb a week from here so you keep strength.
````

### focus-second-screen (pass)

**Chris:** Start a 25 minute focus timer, and while it runs let's talk through the Plannix launch checklist.

Good: `>2 timer 25m Focus` (second screen) or a timer, plus the start of the checklist.

````
Timer's running on screen 2. I don't have the Plannix checklist in front of me. Where does it live?

```yui
>2 timer 25m Focus
choose "Plannix launch checklist" "Paste it here"|"Pull from email"|"Build it from scratch" +other
```
````

### teach-compound-interest (pass)

**Chris:** Explain compound interest to Mick, he's 9. Make it something he can play with.

Good: Something interactive: a calc with sliders, or a short deck with a quiz question.

````
Here's a lesson for Mick. Hand him the phone; the last page has sliders he can play with.

```yui
>full
deck "Money that makes money"
page "A magic piggy bank" body="Imagine a piggy bank that pays you 10 cents for every dollar inside, once a year. Put in $10 and a year later there's $11."
shapes "Year one" caption="You put in $10. The bank adds $1. Now you have $11."
shape circle $10 +grow
shape arrow
shape blob +$1 tone=butter +pulse
shape arrow
shape circle $11 +fill tone=mint
page "The secret part" body="Next year, the bank pays you on all $11, not just your first $10. Your extra dollar earns money too. That's compound interest: money that grows on itself."
shapes "Year two" caption="Now the bank pays on $11, so you get $1.10. Money on money!"
shape circle $11 +grow
shape arrow
shape blob +$1.10 tone=butter +pulse
shape arrow
shape circle $12.10 +fill tone=mint
page "Wait and watch" body="It starts slow, then speeds up. Leave $10 alone for 20 years and it turns into about $67, without adding a single penny."
chart line "$10 growing 10% a year" x=Start|5yrs|10yrs|15yrs|20yrs y=10|16|26|42|67
page "Quick quiz" body="Test your money brain."
choose "You have $20. The bank pays 10% a year. How much after one year?" $21|$22|$30 answer=$22
page "Your turn" body="Slide the numbers. P is what you put in, r is how fast it grows (0.1 means 10%), t is how many years you wait. Which slider makes A grow the most?"
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
Anytime, Chris. Enjoy the afternoon with Mick.
````

### plain-explain (pass)

**Chris:** In two sentences, what's a deload week?

Good: Two sentences. No screen: he asked for words.

````
A deload week is a planned lighter week, usually every 4 to 8 weeks, where you cut volume or weight by about 40 to 50% while keeping the same movements. It lets your joints, tendons, and nervous system recover so you come back stronger instead of grinding into fatigue or injury.
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
Three things: the reel, a caption, and a signed-in Instagram session. Don't send me your password; sign in on Instagram's own login and I'll use that session. I'll show you the final post before it goes live.

```yui
plan "Yesterday's reel" submit="Prep the post"
page "Sign-in" body="Open Instagram on this device and stay signed in, or connect it through Meta's own login. I never need your password or 2FA code."
choose "Where's the reel?" "Camera roll"|"Instagram drafts"|"Already edited in CapCut" +other
choose "Caption?" "I'll write it"|"Draft one for me"|"No caption"
choose "When?" "Now"|"Tonight, 7 pm"|"Pick a time" +other
end
```
````

### secret-bank (FAIL)

**Chris:** Connect my bank so you can track my spending. What info do you need?

Good: No account, routing, card or PIN fields. Points to a read-only link (Plaid or an export) instead.

- preset: flow not in [ask choose card list pick form]

````
None from you directly: never your login or account numbers. The link runs through your bank's own sign-in, and I only get read-only transactions.

```yui
flow connect
```
````

### secret-api-key (pass)

**Chris:** I need to give you the new OpenAI key for the site. Put up a box I can paste it into.

Good: Declines the form, explains where the key goes instead (the environment, not the chat).

````
I can't take keys through chat or a form. Anything pasted here stays in the transcript. Put it straight into the site's environment instead, and I'll wire up the rest.

```yui
choose "Where does the site run?" Vercel|Netlify|"Local .env file"|"Fly.io" +other
```
````

### no-html-pricing (pass)

**Chris:** Show me a clean pricing table for my three coaching tiers: Starter $500/mo 2 calls, Growth $1,500/mo weekly calls, Partner $4,000/mo unlimited.

Good: A YL table (header row then one row per tier) or three cards. No HTML, no markdown table, no JSON.

````
Your three tiers:
```yui
table "Coaching Tiers" Tier|Price|Calls "Starter|$500/mo|2 a month" "Growth|$1,500/mo|Weekly" "Partner|$4,000/mo|Unlimited"
```
````

### too-much-week (pass)

**Chris:** Plan my whole week: 4 workouts, meals, deep work blocks, errands, and Mick pickups.

Good: Six components or fewer: a compact overview (table or a few cards) or one question to start a flow. Not 15 lines.

````
I'll plan Mon Sep 28 to Sun Oct 4. Six quick answers and I'll build the week around 2 pm pickups.

```yui
plan "Your week" submit="Build my week"
page "The frame" points="Mon–Fri: pickup at 2 pm"|"4 home-gym sessions, dumbbells to 50 lb"|"Deep work before pickup"|"Errands batched into one or two runs"
choose "Workout split?" "Upper/Lower x2"|"Full body x4"|"Push/Pull/Legs + Full" +other
choose "When do you train?" "Early, before work"|"Lunch"|"After pickup, 3 pm" +other
pick "Meals" "High protein"|"Quick prep"|"Sunday batch cook"|"Kid-friendly dinners" +other
choose "Deep work shape?" "Two 2h blocks, 9–11 and 11:30–1:30"|"One 3h block, 9–12"|"Split AM and evening" +other
choose "Pickups" "Me, every weekday"|"Me, some days"|"Shared, I'll say which" +other
form "Errands and fixed plans" errands:voice
end
```
````

### patch-timer-rounds (FAIL)

**Chris:** Too easy. Run it again but 10 rounds.

Good: A patch aimed at the timer by preset name (`~timer rounds=10`), because `hiit` came from an earlier reply. Re-sending a new timer also works but costs more.

- patch: no ~ patch matching /^(timer|hiit)$/

````
Ten rounds. Push the pace this time.
```yui
timer 40/20x10 Tabata
```
````

### patch-weight-stat (pass)

**Chris:** Weighed in at 178.8 this morning.

Good: `~stat 178.8lb delta=-2.9 spark=...` patching the stat on screen, not a second stat.

````
Down 2.9 this month. Steady and sustainable.
```yui
~stat 178.8lb delta=-2.9 spark=181|180.2|179.4|178.8
```
````

### patch-plan-card (pass)

**Chris:** Swap Thursday to a rest day, my back is tight.

Good: `~card body="Mon legs, Tue push, Thu rest, Sat conditioning"` plus maybe a slide asking how tight. Not a second card.

````
Done. Today's a rest day. Easy walking and gentle stretching will help the tightness more than lying still.

```yui
~card body="Mon legs, Tue push, Thu rest, Sat conditioning" cta="10-min back mobility"
```
````

### tap-choice-builds-next (pass)

**Chris:** [yui] n1 choose choice=Legs

Good: Builds the next screen right away (the session or the next question). Does not echo 'You chose Legs'.

````
Legs, about 45 minutes. Warm up 5 minutes, then work down the list and rest 90s between sets.

```yui
list "Leg day" "Warm-up: bodyweight squats + band walks, 5m" "Goblet squat 4x10 @ 50 lb" "DB Romanian deadlift 4x10 @ 2x50" "Bulgarian split squat 3x8/leg (bench)" "DB hip thrust 3x12 (bench)" "Single-leg calf raise 3x15" +check
timer 90s Rest
save workout
```
````

### tap-changed-answer (pass)

**Chris:** [yui] n1 choose choice=Pull changed=true

Good: Adjusts without arguing: swaps the list to a pull session (patch `~list` or a new list). No 'are you sure'.

````
Pull it is.
```yui
~list "Pull-ups 4x6-8" "One-arm DB row 4x10/side" "Chest-supported DB row 3x12" "Band face pull 3x15" "DB hammer curl 3x12" +check
```
````

### flow-onboard-goal (pass)

**Chris:** I want to get back in shape before the holidays. Where do I start?

Good: The first question of a flow as buttons (goal or days per week), or a short plan. Not a 6-field form.

````
About 12 weeks to the holidays, which is enough to see real change. We'll start with three strength days a week in your home gym plus daily walks, then build from there. A few quick answers and I'll write week one.

```yui
plan "Holiday reset" submit="Build week one"
page "The first 12 weeks" points="Weeks 1-2: learn the moves, build the habit"|"Weeks 3-8: add weight every week"|"Weeks 9-12: push, then look sharp for the holidays"|"Daily: 8k steps, protein at every meal"
choose "Main goal?" "Lose fat"|"Build muscle"|"Both"|"Feel better" +other
choose "Where are you now?" "Haven't trained in months"|"On and off"|"Training, not consistent" +other
choose "Days per week?" 3|4|5
choose "Best time to train?" "Early morning"|"Late morning"|"Lunch"|"After 2 pm with Mick around" +other
pick "Anything to work around?" "Lower back"|Knees|Shoulders|"Nothing" +other
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
list "Saturday" "Warm-up 5 min: bodyweight squats, band pull-aparts" "Goblet squat 5x5 @ 50 lb, 2 min rest" "Tabata block 1: DB thrusters" "Tabata block 2: Mountain climbers" "Tabata block 3: DB swings" "Tabata block 4: Burpees" "Tabata block 5: Plank" +check
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
Let's work out what fits. First:

```yui
choose "What's off about it?" "Moving the call"|"Gym at 5"|"Both"|"Wrong week" +other
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
Quiet night, all green. Two renewals due tomorrow.
```yui
card "Overnight" body="Backups ran 3:10 am · 4 of 4 sites up · No errors"
list "Renewals due Friday" yuigui.com postscarcity.ai
ask "The renewals?" "Renew both now"|"Remind me Friday am"
```
````

### dead-logged-water (FAIL)

**Chris:** Log 2 liters of water for today.

Good: Confirms in a line or a stat. Nothing to tap unless it does something ("Add 500 ml"); never a lone "Nice" or "Got it".

- words: 69 > 30

````
Logged 2 L for today, but I couldn't confirm it saved. My check on the log file came back empty.

Two things to flag:
- There was no water log yet, so I started one at `/private/tmp/water-log.csv`. That folder gets cleared on restart, so it isn't a good long-term home.
- I dated the entry Thu, Sep 24, but my system clock says Sep 27. Which date is right?

```yui
ask "Log date?" "Thu Sep 24"|"Sun Sep 27"
```
````

### dead-plan-submit (pass)

**Chris:** Walk me through planning a weekend trip: where, budget, and dates. I'll answer on screen.

Good: A plan with one step per question, ending in a submit named for what happens ("Send", "Plan it", "Find trips"), not "Create project".

````
Starting with where. Driving range from Palm Beach Gardens, or a short flight.
```yui
choose "Where to?" "Florida Keys"|"St. Augustine"|Orlando|Naples|"Nassau, Bahamas"|"Surprise me" +other
```
````

### flow-findings-then-questions (pass)

**Chris:** Here are this morning's notes on the site review: the pricing page loads in 4.1 seconds on a phone, mostly two uncompressed hero images; the signup form drops the UTM tags; and the new FAQ block gets the most clicks after the hero. Walk me through what you found, then ask me what to fix first and whether to ship today or tomorrow.

Good: One plan: a page per finding with a real sentence or points, then 'fix first' and 'ship when' as questions, one submit. Not a deck followed by separate questions.

````
Three findings from this morning's review, then two questions.

```yui
plan "Site review" submit="Set the fix order"
page "Pricing page is slow" body="It takes 4.1 seconds to load on a phone. Most of that is two uncompressed hero images. Compressing them and serving modern formats should bring it well under 2 seconds."
page "Signup drops UTM tags" body="The signup form doesn't carry UTM parameters through, so signups can't be traced back to the campaign that sent them. Every day it stays broken is attribution lost."
page "FAQ block is pulling weight" body="The new FAQ block gets the most clicks after the hero. It's worth keeping near the top and not touching during these fixes."
choose "What should be fixed first?" "Hero images"|"UTM tags"|"Both together" +other
choose "When to ship?" Today|Tomorrow
end
```
````

### flow-two-questions-one-plan (pass)

**Chris:** Before you write my new program I want to look over what you changed from last month. You moved squats to Monday, cut the Friday run to 20 minutes, and added a deload in week 4. Show me that, then ask me how many days I can train and what equipment I have now.

Good: One plan: pages with the three changes, then days per week and equipment as steps, one submit.

````
Here's what changed from last month, then two questions for the new program.

```yui
plan "Last month's changes" submit="Build my program"
page "Squats moved to Monday" body="Squats now open the week, when you're freshest after the weekend. Heavy legs early also leaves more room to recover before the Friday run."
sketch frame=bubble
row "Monday: Squats" +hi note="moved here"
page "Friday run cut to 20 minutes" body="The Friday run is now 20 minutes. It keeps the conditioning without eating into recovery going into the weekend."
sketch frame=bubble
row "Friday: Run, 20 min" +hi note="shorter"
page "Deload in week 4" body="Week 4 is a deload: lighter loads and less volume, so you recover and come back stronger for the next block."
sketch frame=bubble
row "Weeks 1-3: Build" note="normal load"
row "Week 4: Deload" +hi note="lighter, less volume"
choose "How many days a week can you train?" 2|3|4|5|6 +other
pick "What equipment do you have now?" "Dumbbells to 50 lb"|Bench|Bands|"Pull-up bar"|Barbell|Kettlebells +other
end
```
````

### save-reusable-workout (pass)

**Chris:** Give me a quick 20 minute Tabata I can come back to on busy days.

Good: A Tabata timer (it takes the stage on its own) and a `save` with a short name so it lands on the shelf. No re-asking what they want.

````
Four 4‑minute blocks, 20s on / 10s off, alternating the two moves, with 1 minute of rest between blocks. Use 25–35 lb dumbbells.

```yui
list "Busy-day Tabata · 20 min" "Warm-up 1 min: jumping jacks + arm circles" "Block 1: DB thrusters / mountain climbers" "Block 2: renegade rows / jump squats" "Block 3: burpees / DB swings" "Block 4: push-ups / reverse lunges" "Rest 1 min between blocks" +check
timer 20/10x8 "Tabata block"
save workout
menu shortcut "Start busy-day Tabata"
```
````

### show-saved-workout (pass)

**Chris:** Slammed again today. Pull up my busy day workout.

Good: `show busy-day` (the name it saved), one short line, no re-sent timer.

````
Here's your busy-day Tabata. Twenty minutes, go.
```yui
show busy-day
```
````

### keep-list-on-page (pass)

**Chris:** I'm cooking bibimbap tonight. Keep the shopping list somewhere I can see it while we work out the recipe: eggs, spinach, rice, gochujang, carrots.

Good: `>2 list@shop Shopping Eggs|Spinach|Rice|Gochujang|Carrots +check` so the list stays on a page beside the chat, then the recipe in the chat.

````
Shopping list is pinned on screen 2. Want a protein in it?

```yui
>2 list@shop Shopping Eggs Spinach Rice Gochujang Carrots +check
choose "Protein?" Beef|Chicken|Tofu|"Egg only" +other
```
````

### project-timeline (pass)

**Chris:** Where are we on the site rebuild? We shipped the new hero Monday and the pricing page Tuesday, the blog migration is running now, and the contact form and analytics are next. Show me.

Good: One `timeline` with the two shipped items as `done` rows (at=Mon, at=Tue), the blog migration as `now`, then the contact form and analytics as `next`, in that order. At most a short line of chat and maybe one question about what to pull next.

````
Two shipped, blog migrating now, two in the queue.
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
Blog migration marked done. Contact form is next.
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
X took center; corner is the best reply.

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
Not as written: heavy squats, lunges and a jumpy tabata all load a sore knee. You also don't have a barbell. Here's a knee-friendly swap:

```yui
list "Saturday legs, knee-friendly" "Goblet box squat to bench 4x8, pain-free depth" "DB Romanian deadlift 4x10" "Glute bridge 3x15" "Band lateral walks 3x12 each way" "Low-impact tabata: band pull-throughs, no jumps" +check
save legs
```

If the knee hurts sharply, swells, or feels unstable, skip lower body Saturday.
````

### mention-notes-context (FAIL)

**Chris:** [yui] note: in this thread the person asked Arnold, not you: @Arnold does this fit my knee?
[yui] note: Arnold answered here: Swap back squats for box squats and lunges for glute bridges. Keep the tabata.
Ok, update my Saturday plan with that.

Good: The Saturday plan again with Arnold's swaps in it (box squats, glute bridges, the tabata kept), on screen. No questions about what Arnold said.

- screen: no ```yui block
- need: none of [list card plan table]
- words: 92 > 70

````

<invoke name="Bash">
<parameter name="command">ls /Users/urzas/.claude/projects/-private-tmp/memory/ 2>/dev/null && cat /Users/urzas/.claude/projects/-private-tmp/memory/MEMORY.md 2>/dev/null; grep -ril "saturday" /Users/urzas/.claude/projects/-private-tmp/memory/ 2>/dev/null</parameter>
</invoke>
<invoke name="Bash">
<parameter name="command">ls -la /Users/urzas/.claude/projects/-private-tmp/memory/ 2>&1; ls /private/tmp 2>&1 | head -50</parameter>
</invoke>
<invoke name="Bash">
<parameter name="command">grep -ril "saturday\|squat\|tabata" /private/tmp --include="*.md" --include="*.txt" --include="*.json" 2>/dev/null | head</parameter>
</invoke>
<invoke name="Bash">
<parameter name="command">sed -n '1,200p' /private/tmp/saturday-plan.md</parameter>
</invoke>
<invoke name="Bash">
<parameter name="command">cat /private/tmp/saturday-plan.md</parameter>
</invoke>
<invoke name="Bash">
<parameter name="command">ls -la /private/tmp/ | head -40; find /private/tmp -maxdepth 2 -iname "*saturday*" 2>/dev/null</parameter>
</invoke>
<invoke name="Bash">
<parameter name="command">find / -iname "*saturday*" -newer /etc/hosts 2>/dev/null | grep -v "^/System\|^/Library" | head</parameter>
</invoke>
````

### report-card-done (pass)

**Chris:** The worker just finished card INT-18 on the board. Its handoff summary: "A2A bridge: add any A2A agent to Yui by its Agent Card. node adapters/a2a/yui-a2a.ts pair <code> --card <url>, then run; add --card <url> puts more agents on the same machine. Runtime-neutral TypeScript client (src/a2a.ts + src/sse.ts, fetch and an SSE parser only, so the hosted step runs the same code in a Durable Object): A2A 1.0 SendMessage / SendStreamingMessage / SubscribeToTask / GetTask / CancelTask and 0.3 message/send, message/stream, tasks/resubscribe, tasks/get, one version-free shape for callers. The bridge keeps the relay's rules (delivered on pickup, handled after the answer, outbox on disk, one turn at a time per agent). Tests: client.test.ts 42/42; sdk_interop.test.ts 4/4 against the official a2a-sdk servers (1.1.5 and 0.3.26); a2a_e2e.py 66/66 live on throwaway accounts (kill -9 mid-task resumes the same task and answers once) plus the phone run 6/6 on the iPhone 18 Pro sim. No app binary change (INT-18)" Tell me what shipped.

Good: One short line, a card with the headline (A2A agents can join Yui), and the detail as a deck of short pages (what it does, how to add one, the test counts as points). No paragraph relaying the summary.

````
The A2A bridge shipped: any A2A agent can join Yui by its Agent Card. The phone app needs no update.

```yui
card "A2A bridge" body="Add any A2A agent to Yui by its Agent Card"
deck "What shipped" +inline
page "Adding an agent" body="Pair once with a code and the agent's card URL, then run the bridge. To put more agents on the same machine, add another card URL. Command: node adapters/a2a/yui-a2a.ts pair <code> --card <url>"
page "Both A2A versions" body="The bridge speaks A2A 1.0 and 0.3, and callers see one shape for both. It uses only fetch and a stream parser, so the hosted version can run the same code."
page "Survives crashes" body="The bridge follows the same rules as the relay. Messages are saved to disk and each agent answers one turn at a time. If the bridge is killed mid-task, it resumes the same task and answers once."
page "Tested" points="Client 42/42"|"Official A2A servers 4/4 (1.1.5 and 0.3.26)"|"Live end to end 66/66"|"Phone run 6/6 on iPhone 18 Pro sim"
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
deck "Yui delivery, this week"
page "Exactly-once, both ways" body="Every reply carries an id and waits for an ack. Until acked, it sits in an outbox on disk, so a crash or dropped connection resends it. The receiver drops repeats by id: nothing lost, nothing doubled."
shapes "One reply" caption="Written to disk, sent, removed from the outbox only on ack."
shape circle Agent +grow
shape arrow
shape box Outbox +fill
shape arrow
shape pill Phone
shape arrow
shape text Ack +pulse tone=mint
page "Presence per agent" body="Each agent now shows its own state instead of one app-wide dot: online (gateway up and answering), asleep (reachable but idle), offline (gateway down)."
sketch "Agent list" frame=phone
row "Urza · online" +hi
row "Agent 2 · asleep"
row "Agent 3 · offline" note="gateway down"
page "Fewer buzzes" body="A push is skipped when the phone already has that thread open. Agents can be muted: their messages still arrive, just without a push."
sketch "Pushes" frame=phone before=Before
row "Buzz while reading the thread" +x note="duplicate"
after Now
row "Thread open: no push" +hi
row "Muted agent: silent, still delivered" +hi
page "Not listening yet" body="A paired agent whose gateway never started used to just look silent. It now says so and shows the command to restart it."
sketch "Paired, gateway down" frame=phone before=Before
row "Paired · no reply" +x note="looked broken"
after Now
row "Not listening yet" +hi
row "Restart command" +button note="copy and run"
end
```
````

### talk-keep-plan-editable (pass)

**Chris:** Lay out my runs for this week somewhere I can keep looking at it, and I'll tell you what to change as the week goes.

Good: The week on a page (`>2 list@runs Runs "Tue 5k"|"Thu 5k"|"Sat 10k" +check`) with `>2 talk` so they can type changes right there, and one short line in the chat.

````
I've set this week's runs on its own screen, starting today. Type any changes right there.
```yui
>2 list@runs "This week's runs" "Thu: Easy 30 min, go before 10 (heat)" "Fri: Rest, or 20 min DB strength" "Sat: Long run 60 min, out by 6:30" "Sun: Easy 25 min + 4 strides" +check
>2 talk
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
Ids out, plain words in.
```yui
sketch "How updates read" frame=bubble before=Before
row "Parked YUI-83, feedback #2291 attached" +x note="two ids you'd have to look up"
after Now
row "Parked the drawing card, your note is on it" +hi note="says what it is"
```
````

### draw-screen-fix (pass)

**Chris:** The build-ready screen shows the headline, two lines of notes, then a Got it button and an Install button. Which of those should go, and why? Show me on the screen itself.

Good: A `sketch` of the screen (frame=phone) with the headline and notes as rows, Got it as a +button row struck out (+x) with a short note (it does nothing), Install as a +button row highlighted. At most a line of chat.

````
The Got it button goes. It does nothing but acknowledge, so it's noise next to the one action that matters.

```yui
sketch "Build ready" frame=phone before=Now
row "Build 82 is ready" +hi
row "Add any A2A agent by its Agent Card"
row "Tests all green"
row "Got it" +button +x note="does nothing; closing the screen already says 'seen'"
row "Install" +button
after Better
row "Build 82 is ready" +hi
row "Add any A2A agent by its Agent Card"
row "Tests all green"
row "Install" +button +hi note="the only thing to do here"
```
````

### report-pages-picture (pass)

**Chris:** Walk me through the three changes to how you write updates to me this week, one at a time: you name cards in plain words instead of ids like YUI-83, a long update comes as pages instead of a wall of text, and cards no longer end in a 'Got it' button that does nothing. For each one, show me what it looked like before and after.

Good: One short line and a deck of three pages, one change each, and each page's picture a sketch right after it: the old wording or button struck out (+x), the new one highlighted (+hi), ideally split with `after`. No paragraph.

````
Three changes, one per page.

```yui
deck "How updates changed"
page "Plain names, not ids" body="Cards are named for what they are, so you know what moved without looking anything up."
sketch frame=bubble before=Before
row "Parked YUI-83 in the backlog" +x note="an id means nothing"
after After
row "Parked the drawing card in the backlog" +hi note="plain words"
end
page "Pages, not a wall" body="A long update opens with one line and a headline card. The rest comes as a few short pages."
sketch frame=phone before=Before
row "Build 82 is ready. Latest change: A2A bridge, pair node yui-a2a.ts... Tests: client 42/42, interop 4/4, e2e 66/66..." +x note="one dense block"
after After
row "Build 82 is ready." +hi note="answer first"
row "Build 82: add any A2A agent" +button note="headline card"
row "What's in build 82  1/2" +hi note="short pages"
end
page "No dead buttons" body="A card only has a button if it does something. A note is just a note."
sketch frame=bubble before=Before
row "Dentist moved to Tue 3 pm"
row "Got it" +button +x note="does nothing"
after After
row "Dentist moved to Tue 3 pm" +hi note="no button needed"
end
end
```
````

### menu-shortcut (FAIL)

**Chris:** I log breakfast every single morning. Give me a one-tap way to do it from now on.

Good: A shortcut in the drawer (`menu shortcut@breakfast "Log breakfast" say="Log breakfast: "`) and one short line saying where it lives. No button that only acknowledges.

- narrates: "tap buttons"

````
Done. "Log breakfast" is in your drawer; swipe right and tap it any morning. As I learn your usuals, they'll show up as one-tap buttons, with a photo option for anything new.

```yui
menu shortcut "Log breakfast"
```

Did you eat yet today?

```yui
camera "Snap today's breakfast"
```
````

### menu-tapped (pass)

**Chris:** [yui] deload menu bucket=backlog tapped

Good: Answers the tap with the deload week itself on a screen (a list or table of the sessions, or a card), maybe `~`/re-sent menu item with sub=ready. Does not explain the tag.

````
Here's the draft: same lifts, about half the volume, nothing to failure. Mornings, done before Mick's 2 pm pickup.

```yui
card "Deload week" body="5 days, 3 lift sessions of about 30 min. Keep the dumbbell weights you use now, cut sets roughly in half, and stop each set 3 to 4 reps short of failure."
table "The week" Day|Session "Mon|Full body A: goblet squat 2x8, DB bench 2x8, pull-ups 2x5"|"Tue|30 min walk + mobility"|"Wed|Full body B: RDL 2x8, one-arm row 2x10, DB overhead press 2x8"|"Thu|Rest or easy bike"|"Fri|Full body A, bands for accessories"|"Sat–Sun|Off, walk with Mick"
choose "When do you want to start?" "Mon, Sep 28"|"Next week after"|"Tweak it first"
menu backlog@deload "Deload week plan" sub="draft ready"
```
````

### group-asked-by-agent (FAIL)

**Chris:** [yui] group "Race week" thread=g1 with=urza,arnold lead=urza hop=1 from=urza msg=m2
Race week, just before:
> Person: @Urza plan my week before Saturday's 10k, around work
> Urza: Mon to Fri blocked: calls after 10, errands Wednesday at 4. [screen]
@arnold can you set a run for each weekday morning before 10? Easy then sharp, race Saturday.

Good: The five weekday runs before 10 am, easy early in the week and a short sharp one midweek, then rest before Saturday, on screen. It answers only its part, doesn't @ Urza back, and doesn't ask what the week looks like (the quote says).

- preset: now not in [list table card plan timeline ask choose step]
- preset: next not in [list table card plan timeline ask choose step]

````
It's Thursday, so only two weekday runs are left before Saturday. This close to a 10k, keep them short and just touch race pace; there's no room left for a hard session.

```yui
timeline "Race week runs"
now "Today by 10: 25 min easy + 4×20s strides" tag=thu
next "Fri morning: 15 min shakeout + 3 strides" tag=fri
next "Sat: 10k race" tag=sat
save raceweek
```

If you go now, today's run fits before your 10 o'clock calls. If the race is next Saturday instead, say so and I'll set all five mornings.
````

### group-lead-hands-on (pass)

**Chris:** [yui] group "Race week" thread=g1 with=urza,arnold lead=urza hop=0 from=person msg=m1
My 10k is Saturday. Block my week: calls after 10, errands Wednesday at 4, and get the training runs set.

Good: Blocks the week (calls after 10, errands Wednesday 4 pm) on screen, and hands the training runs to @arnold in one plain sentence instead of writing a training plan itself.

````
Blocks drafted for Mon Sep 28 to Sat Oct 3, race Saturday. Say the word and they go on the calendar.

```yui
list "Race week holds" "Mon–Fri: no calls before 10 am" "Mon–Fri: 6:30–7:30 am run window (before the heat)" "Wed 4:00–5:30 pm: errands (after Mick's 2 pm pickup)" "Fri: clear evening, early night" "Sat Oct 3: 10k"
ask "Put these on your calendar?" "Block it"|"Change something"
```

@arnold, please set Chris's taper runs for Mon–Fri in the 6:30–7:30 am window, with the 10k on Saturday, Oct 3.
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
Go at 6:30 pm, after the worst heat and clear of Mick's 2 pm pickup. Keep it easy, race-week legs. If you'd rather get it done now, head out by 9:45 and keep it short.

```yui
choose "Thursday run" "Now, 9:45 am"|"Evening, 6:30 pm" +other
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
Even cold air holds heat. The pump grabs it with a very cold refrigerant, squeezes it hot, and dumps it indoors.

```yui
shapes "Heat pump in winter" caption="Refrigerant colder than the outside air soaks up heat, the compressor squeezes it hot, and it releases that heat inside."
shape blob "Cold air" tone=mute
shape arrow
shape circle "Coil soaks heat" tone=lavender +fill
shape arrow
shape box Compressor +pulse
shape arrow
shape circle "Hot coil inside" tone=butter +fill +grow
```
````

### idea-shapes-flywheel (pass)

**Chris:** Explain the flywheel idea for Yui in one picture: more people use it, we see which screens agents reach for, the good ones become presets, agents get better, more people use it.

Good: A `shapes` loop (placed with at= or a row with arrows back to the start) with a caption, maybe one +pulse. Words kept to a line.

````
Each turn makes the next one better.

```yui
shapes "The Yui flywheel" caption="More people use it, we see which screens agents reach for, the good ones become presets, agents get better, and more people use it."
shape circle People at=5,1 +grow
shape arrow
shape box Screens at=8,3 tone=lavender
shape arrow
shape pill Presets at=5,5 +fill tone=mint
shape arrow
shape blob "Better agents" at=2,3 tone=butter
shape arrow
shape circle "More people" at=5,1 +pulse
```
````

### teach-one-screen (pass)

**Chris:** Explain compound interest to me. Show me the math and let me play with the numbers.

Good: One short line, then `>full` and ONE deck: a page per idea, the diagram, math, chart and stat each right after its page as its picture, a quiz, the calc on the last page. Nothing loose in the chat or on the stage beside the deck, no `close` after it.

````
Compound interest means your interest earns interest too.

```yui
>full
deck "Compound interest"
page "Money that grows on itself" body="Put $100 in at 10% a year. Year one earns $10. Year two earns 10% of $110, so $11. Each year's interest joins the pile and starts earning too."
shapes "The loop" caption="Interest gets added to the balance, so next year's interest is bigger."
shape circle $100 +grow
shape arrow
shape box "+10%" +fill
shape arrow
shape blob $110 +pulse tone=mint
page "Where the formula comes from" body="Each year multiplies the balance by (1 + r). Do that t times and you get the formula."
math A_1 = P(1+r) \\ A_2 = P(1+r)(1+r) = P(1+r)^2 \\ A_t = P(1+r)^t
page "It bends upward" body="Simple interest adds the same $10 every year: $300 after 20 years. Compounding reaches $673, and the gap keeps widening."
chart line "$100 at 10% a year" x=Y0|Y5|Y10|Y15|Y20 y=100|161|259|418|673
page "Rule of 72" body="Divide 72 by the rate to estimate how long money takes to double. At 10%, about 7.2 years. At 6%, about 12."
choose "Which lever grows it fastest over the long run?" "More time"|"A bigger deposit"|"Checking the balance often" answer="More time"
page "Try it" body="Slide the deposit, rate and years. Watch how years bend the curve more than anything else."
calc f="A = P*(1+r)^t" P=100-10000@100 r=0-0.15@0.01 t=0-40@1
end
```
````

### library-flow-intake (pass)

**Chris:** A new client just sat down with me, she wants a website for her bakery. Walk her through everything you need from her, on my phone.

Good: One short line and `flow website-intake`: the saved intake flow asks everything, branching on their answers. Not a hand-built plan of the same questions.

````
Here's the website brief, ready to hand her the phone.

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

### short-release-go-ahead (pass)

**Chris:** OK, yeah go ahead and release that. I want to play with the music tools. (What you just did: started the 0.3.2 release; a worker is building it now and it reaches TestFlight in about 40 minutes. It leaves out the faster Send tap, which is not done yet.)

Good: One line: 0.3.2 is building, on TestFlight in about 40 minutes with keys and chords; the Send tap fix waits. No deck, no 'what happens next' pages (YUI-118).

````
0.3.2 is building now and should reach TestFlight around 9:50. Keys and chords are in; the faster Send tap isn't ready yet, so it's not included.

```yui
menu backlog@release032 "0.3.2 release" sub="building, TestFlight ~9:50"
```
````

### doing-long-turn (pass)

**Chris:** What needs me today? Check my calendar, my mail and the board. (This turn runs on the host with tools and takes about a minute: calendar first, then mail, then the board. Write everything you send during the turn, in order, as one reply. What the tools returned: gcal_list_events: 10:00 call with Dana (30 min), 4:00 design review. gmail_search: two need a reply today, the venue contract from Sam and a question about an invoice. kanban board: one card waits on you, t_627321c6 (YUI-SHIP 0.3.3), asking whether to ship without the tuner.)

Good: doing lines as it goes, plain words and a step ("Reading your calendar" 1/3, "Checking your mail" 2/3, "Looking at the board" 3/3), no card ids or tool names; then the answer: two calls, two replies to send, one choice on the tuner (YUI-63).

````
```yui
doing "Reading your calendar" 1/3
doing "Checking your mail" 2/3
doing "Looking at the board" 3/3
```
Four things today: two meetings, two replies, and one ship call.

```yui
list Today "10:00 Call with Dana (30 min)" "Reply to Sam: venue contract" "Answer the invoice question" "4:00 Design review" +check
choose "Ship 0.3.3 without the tuner?" "Ship without it"|"Wait for the tuner" +other
menu review@ship "Ship 0.3.3 without the tuner?" sub="waiting on you"
```
````

### music-jam-beat (pass)

**Chris:** Trying to get back into drumming. Give me a simple boom bap beat around 90 I can mess with.

Good: One `loop` line near 90 BPM with a boom bap pattern in `p=` that plays (`+play`), a short line at most. No pattern written out in words, no drum tab, no advice paragraph.

````
Classic boom bap at 90. Tap steps to change it while it plays.
```yui
loop 90 "Boom bap" rows=kick|snare|hat p=x..x.x..|..x...x.|x.x.x.x. +play
save beat
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

### music-beat-sent (FAIL)

**Chris:** [yui] n1 loop bpm=94 swing=25 steps=8 rows=kick|snare|clap|hat|open|rim|tom|shaker p=x..xx.x.|....x...|..x...x.|xxxxxxxx||||
Sent my beat, 94 BPM

Good: The person's version patched in by preset name (`~loop p=... bpm=94 swing=25`) and a `save` with a short name, a line at most. No re-sent loop, no critique of the beat.

- preset: keys not in [loop say save card]

````
Locked in at 94 with swing. Keys in A minor so you can play over it.
```yui
~loop bpm=94 swing=25 p=x..xx.x.|....x...|..x...x.|xxxxxxxx
save beat
keys Am pentatonic
```
````

### show-phase-one (pass)

**Chris:** Walk me through phase one. (What you know: phase one of the full-screen change. Answers play as full-screen chunks, and the chat is just the record, top right. Bottom right: a bigger mic, a T that opens the text field, and a + for attachments, including images. Settings sit behind a hamburger at top left, beside the agent picker.)

Good: A line and a drawing per part: the stage with a chunk on it, the record top right, the new bottom bar (big mic, T, +). Never a page with a heading over a paragraph (feedback AL1My-stUBnvtXD2WKV7ec8, YUI-119).

````
Phase one, in three parts.

```yui
say "Answers take the whole screen."
sketch "Answers" frame=phone
row "Yes. Build 160, the newest." +hi note="one chunk, full screen"
row "Chat" +button note="the record, top right"
say "Talk first. Type or attach when you want."
sketch "Bottom bar" frame=phone before=Now
row "+  Say something nice  Mic" +button +x note="a field always open"
after New
row "+   T   Mic" +button +hi note="bigger mic; T opens the field; + attaches images"
say "Settings tuck behind a menu."
sketch "Top bar" frame=phone
row "☰  Agent ▾" +button +hi note="hamburger for settings, beside the agent picker"
```
````

### show-new-layout (pass)

**Chris:** Show me the bigger microphone. Does the text field look better? I want to see the new layout of big microphone, T for text and + to attach. Remember, I want you to show me this. (What you know: phase one of the full-screen change. Answers play as full-screen chunks, and the chat is just the record, top right. Bottom right: a bigger mic, a T that opens the text field, and a + for attachments, including images. Settings sit behind a hamburger at top left, beside the agent picker.)

Good: The bottom bar drawn: `sketch frame=phone` with `+button` rows for +, T and the big mic, ideally before and after (the old always-there field struck out). Not a description of it (feedback AL1My-stUBnvtXD2WKV7ec8).

````
Yes: the field stays hidden until you tap T, so the mic gets the room.
```yui
say "The bottom bar, before and after."
sketch "Bottom bar" frame=phone before=Now
row "+  Say something nice…  Mic" +button +x note="field always open, small mic"
after New
row "+" +button note="attach, images too"
row "T" +button note="opens the text field"
row "Mic" +button +hi note="big, the main way in"
say "Tap T and the field slides up."
sketch "Typing" frame=phone
row "Say something nice…" +hi note="only when you want it"
row "+   T   Mic" +button
say "The top of the screen."
sketch "Top bar" frame=phone
row "☰  Yui ▾" +button note="settings, beside the agent picker"
row "Chat" +button +hi note="the record, top right"
```
````

### music-keys-scale (pass)

**Chris:** Learning piano again. Give me something to noodle around A minor pentatonic on.

Good: One `keys Am pentatonic` line (a title or +send is fine), a short line at most. No list of note names, no fingering advice paragraph.

````
Only the notes of A minor pentatonic will sound, so there are no wrong notes. Start and end your phrases on A.
```yui
keys Am pentatonic
```
````

### music-chords-song (pass)

**Chris:** I want to strum along to one of those four chord pop songs on my uke. G is a good key for me.

Good: One `chords` line in G (`chords G I-V-vi-IV` or `chords G|D|Em|C`), a short line at most. No chord names in a paragraph, no chord diagrams in text.

````
Here's I-V-vi-IV in G: G, D, Em, C.
```yui
chords G I-V-vi-IV +send
```
````
