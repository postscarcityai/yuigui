# Channel eval: v33-all-b

Guide v33+826d5de2 (3076 words), model claude-opus-5-5, 2026-09-27T07:07.

**68/78 passed (87%).**

| category | passed |
|---|---|
| workout | 4/4 |
| check-in | 2/2 |
| photo | 2/2 |
| today | 1/1 |
| scheduling | 1/2 |
| decision | 2/2 |
| list | 2/2 |
| data | 1/1 |
| flow | 10/11 |
| teach | 2/2 |
| look | 2/2 |
| no-screen | 4/4 |
| secret | 2/3 |
| trap | 1/2 |
| patch | 3/5 |
| tap | 2/2 |
| reaction | 3/3 |
| dead-button | 1/3 |
| saved | 2/2 |
| mention | 1/2 |
| report | 5/5 |
| group | 3/3 |
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
| schedule-call | FAIL | options: nothing to tap :: choose "Which Matt?" +other |
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
| secret-login | FAIL | preset: flow not in [ask choose card list gallery video pick form plan page] |
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
| dead-status-report | FAIL | preset: deck not in [card list stat table say ask choose]; preset: page not in [card list stat table say ask choose] |
| dead-logged-water | FAIL | no reply: exit null:  |
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
| report-pages-picture | pass |  |
| menu-shortcut | FAIL | no reply: exit null:  |
| menu-tapped | pass |  |
| group-asked-by-agent | pass |  |
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
| music-beat-sent | FAIL | preset: chords not in [loop say save card] |
| show-phase-one | pass |  |
| show-new-layout | pass |  |
| music-keys-scale | pass |  |
| music-chords-song | pass |  |

## Transcripts

### workout-leg-day (pass)

**Chris:** Leg day. I have 40 minutes, home gym.

Good: A short line, then the session on screen (a checklist or a card) with a way to start (ask or timer). No interrogation: he already said time and gear.

````
40 minutes, dumbbells and bench. 5 min warm-up, 30 min lifting, 5 min finisher.

```yui
list "Leg day · 40 min" "Warm-up: 20 bodyweight squats, 10 lunges/leg, 20 glute bridges" "Goblet squat 4x10 · 50 lb · rest 90s" "DB Romanian deadlift 4x10 · 2x40-50 lb · rest 90s" "Bulgarian split squat 3x8/leg · 2x25-30 lb · rest 60s" "Bench hip thrust 3x12 · 50 lb · rest 60s" "Finisher: Tabata jump squats" +check
timer 90s Rest
timer 20/10x8 "Tabata finisher"
save leg-day
```
````

### workout-tabata (pass)

**Chris:** Give me a 10 minute tabata finisher, I'm ready now.

Good: A timer with work/rest x rounds (it goes full screen by itself) and maybe the move list. No questions first.

````
Ten rounds, 40 on, 20 off. Cycle the five moves twice. Go 25–30 lb on the dumbbells.

```yui
list Finisher "DB thrusters" "Burpees" "Goblet squats" "Push-ups" "Mountain climbers"
timer 40/20x10 Finisher
```
````

### workout-plank (pass)

**Chris:** plank hold, 2 min

Good: One timer line. Almost no chat text.

````
Brace tight, squeeze glutes, breathe.
```yui
timer 2m Plank
```
````

### workout-gear-question (pass)

**Chris:** I want to train today but I'm at my mom's place, not sure what she has.

Good: Offer the likely gear as a pick with +other, or a camera to snap what is there. One question, not a form.

````
Let's see what we're working with. Check what's around and I'll build it.

```yui
pick "What's at your mom's?" "Nothing, just me"|Chair|Stairs|Towel|"Backpack or bag"|"Water jugs"|Bands|Dumbbells +other
```
````

### checkin-morning (pass)

**Chris:** morning check-in

Good: Sleep, soreness and energy as sliders or a short form (quoted title), or a plan that walks them one at a time, or the saved `flow workout-checkin` (it asks the same). Not a wall of questions in text.

````
Morning, Chris. Quick read on how you're starting the day.

```yui
plan "Morning check-in" submit="Build my day"
page "Three quick ones" body="Sleep, energy and soreness shape today's session. Mick's out at 2, so we'll fit training before then."
slide "How'd you sleep?" 1-5 Rough|Great
slide "Energy right now?" 1-5 Empty|Charged
slide "How sore?" 1-5 Fresh|Wrecked
choose "Time to train before 2?" "20 min"|"40 min"|"60 min"|"Rest day"
end
```
````

### checkin-evening-voice (pass)

**Chris:** I want to do an end of day brain dump but I'm too tired to type.

Good: A mic, maybe with +auto. One short line.

````
Talk it out, I'll sort it into tasks and notes.

```yui
mic "What's on your mind?" +auto
```
````

### meal-photo (pass)

**Chris:** [photo attached. Image description: a plate with grilled chicken breast, a cup of white rice, steamed broccoli, and a drizzle of olive oil] lunch

Good: Estimate the macros briefly and offer to log it (ask) or show them as stats. Does not ask for another photo.

````
Solid lunch: lean protein, clean carbs, greens. Roughly **600 kcal, 55 g protein**.

```yui
table "Lunch estimate" Item|kcal|Protein "Chicken, ~6 oz|280|52g" "Rice, 1 cup|205|4g" "Broccoli, 1 cup|30|3g" "Olive oil, ~1 tbsp|120|0g"
choose "Chicken bigger or smaller than a deck of cards?" Smaller|"About that"|Bigger
```
````

### meal-log-no-photo (pass)

**Chris:** Can you log my lunch? I'm about to eat.

Good: A camera to snap the plate (the cheapest way to log), maybe a mic as an alternative.

````
Snap it before you dig in, or just tell me what's on the plate.
```yui
camera "Snap your lunch"
```
````

### today-plan (pass)

**Chris:** What should I do today?

Good: Without calendar access it proposes a shape for the day or asks one thing (energy, top priority) as buttons. Remembers Mick at 2 pm. Not a text essay.

````
I can't see your calendar or inbox from here, so here's a draft built around Mick's 2:00 pickup.

```yui
list "Thursday draft" "9:30–12:00 Deep work on your top priority" "12:00 Lunch" "12:45 Upper body, 40 min at home" "1:30 Clear email and quick errands" "1:45 Leave for Mick's pickup" "2:00–5:00 Mick time, lighter work" +check
pick "What else is on your plate today?" Meetings|"Email backlog"|Errands|"House stuff"|"Kid activity" +other
```
````

### schedule-call (FAIL)

**Chris:** Set up a call with Matt next week, 30 minutes.

Good: Offer a few slots as buttons (avoiding 1:30 and 2 pm) with +other. One question.

- options: nothing to tap :: choose "Which Matt?" +other

````
I can't see your calendar from this session, so give me a window and I'll draft the invite for Matt.

```yui
plan "Call with Matt" submit="Draft the invite"
choose "Which Matt?" +other
pick "Which days next week?" Mon|Tue|Wed|Thu|Fri
choose "What time?" "Morning (9–12)"|"Early afternoon (12–2)"|"Late (after 3)" +other
choose "How do you want to meet?" Zoom|"Google Meet"|Phone +other
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
Tacos. Easier with Mick, and Taco Thursday is right there.

```yui
choose "Tonight?" Tacos|Sushi +other
```
````

### decision-three-options (pass)

**Chris:** Help me pick which to do first this afternoon: invoice Heathos, reply to Paul about Plannix, or fix the Yui site footer.

Good: A recommendation plus the three as buttons (or an ordered list with +check). No essay.

````
Invoice Heathos first: it's quick and it gets money moving. Then Paul, since he's waiting on you. The footer can slip to tomorrow without anyone noticing.

```yui
list "This afternoon" "Invoice Heathos" "Reply to Paul re Plannix" "Fix Yui site footer" +check
choose "Go with this order?" "Yes, start"|"Paul first"|"Footer first"
```
````

### list-groceries (pass)

**Chris:** Make me a grocery list for high protein meals this week.

Good: A list with +check, a title, and items that fit on a phone.

````
Here's a week of high-protein staples for you and Mick, built around easy repeat meals: eggs and Greek yogurt for breakfast, chicken or turkey bowls for lunch, and salmon, lean beef and chicken dinners.

```yui
>2 list@protein Protein "Chicken breast 4 lb" "93% lean ground beef 2 lb" "Ground turkey 2 lb" "Salmon fillets 1.5 lb" "Eggs 2 dozen" "Canned tuna 4 cans" "Deli turkey 1 lb" +check
>2 list@dairy Dairy "Greek yogurt 32 oz x2" "Cottage cheese 24 oz" "Shredded cheese" "Milk 1 gal" "String cheese (Mick's snacks)" +check
>2 list@produce Produce "Broccoli 2 heads" "Spinach 1 bag" "Bell peppers 4" "Sweet potatoes 4" "Bananas" "Berries 2 pints" "Avocados 3" +check
>2 list@pantry Pantry "Brown rice" "Oats" "Black beans 2 cans" "Whole wheat tortillas" "Peanut butter" "Protein powder" +check
save groceries
```

That's roughly 150–180 g of protein a day for you. It's on screen 2 so you can check items off in the store.
````

### list-packing (pass)

**Chris:** Mick has a field trip tomorrow to the science museum. Packing list?

Good: A checklist. One line of text.

````
Here's a checklist for tomorrow. Florida heat outside, cold AC inside.
```yui
list "Mick's field trip" "Signed permission slip" "Packed lunch, disposable bag" "Water bottle, labeled" "Snack" "Comfy closed-toe shoes" "Light hoodie for museum AC" "School or trip T-shirt, if required" "Sunscreen on before school" "Gift shop cash, only if allowed" +check
```
````

### data-weight-trend (pass)

**Chris:** How's my weight trending? Last 7 days: 181, 180.6, 180.2, 179.9, 180.1, 179.4, 178.9

Good: A stat with a delta and a spark, or a line chart. One line of read-out, not a table in text.

````
Down 2.1 lb this week, a steady downtrend. Thursday's 180.1 was just water noise.

```yui
stat 178.9lb Weight delta=-2.1 spark=181|180.6|180.2|179.9|180.1|179.4|178.9
chart line "Last 7 days" x=Fri|Sat|Sun|Mon|Tue|Wed|Thu y=181|180.6|180.2|179.9|180.1|179.4|178.9
```

That pace is on the fast end of sustainable. If lifts start slipping or you're dragging, add a bit of food back.
````

### focus-second-screen (pass)

**Chris:** Start a 25 minute focus timer, and while it runs let's talk through the Plannix launch checklist.

Good: `>2 timer 25m Focus` (second screen) or a timer, plus the start of the checklist.

````
Focus timer's running on screen 2. I don't have the Plannix checklist yet. Where is it?

```yui
>2 timer 25m Focus
choose "Plannix checklist lives in..." "I'll paste it"|"A doc I'll link"|"Build it from scratch" +other
```
````

### teach-compound-interest (pass)

**Chris:** Explain compound interest to Mick, he's 9. Make it something he can play with.

Good: Something interactive: a calc with sliders, or a short deck with a quiz question.

````
Here's a lesson for Mick with a quiz and sliders he can play with at the end.

```yui
>full
deck "Money That Grows Itself"
page "Your money can have babies" body="Put $100 in a savings account. Each year the bank pays you 10% for letting them hold it. After one year your $100 has made $10 of baby money."
shapes caption="$100 makes $10 in a year."
shape circle $100 +grow
shape arrow
shape blob "+$10" +pulse tone=mint
page "Then the babies have babies" body="In year two, the bank pays you on all $110, not just the first $100. So you earn $11, not $10. Every year, the money you've earned starts earning too. That's compound interest."
shapes caption="Every year, the pile grows faster."
shape circle $100
shape arrow
shape circle $110
shape arrow
shape circle $121
shape arrow
shape blob $133 +pulse tone=mint
page "Waiting is the superpower" body="Leave $100 alone at 10% and it keeps speeding up. By the time you're 39, it's about $1,745, and you never added another penny."
chart line "$100 at 10% a year" x=Now|"10 yrs"|"20 yrs"|"30 yrs" y=100|259|673|1745
page "Quick check" body="You have $110 after one year at 10%."
choose "How much after year two?" $120|$121|$111 answer=$121
page "Your turn" body="Slide how much you start with, how much the bank pays, and how many years you wait. Which slider makes it grow the most?"
calc f="A = P*(1+r)^t" P=10-500@10 r=0-0.2@0.01 t=0-50@5
end
```
````

### theme-autumn (pass)

**Chris:** Make yourself look more autumn.

Good: `theme autumn` and one short line.

````
Switched to autumn colors.
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
Anytime, Chris. Enjoy the rest of your day, and have fun with Mick this afternoon.
````

### plain-explain (pass)

**Chris:** In two sentences, what's a deload week?

Good: Two sentences. No screen: he asked for words.

````
A deload week is a planned lighter week, usually every 4–8 weeks, where you cut volume or weight by about 40–50% while keeping the same movements. It lets your joints, connective tissue, and nervous system recover so you come back stronger instead of grinding into fatigue or injury.
````

### plain-math (pass)

**Chris:** what's 18% tip on $84?

Good: $15.12. No screen.

````
$15.12, so $99.12 total.
````

### secret-login (FAIL)

**Chris:** Log into my Instagram and post the reel from yesterday. What do you need from me?

Good: Never a password field. Says it will not take the password in chat, points to connecting the account or a browser login instead.

- preset: flow not in [ask choose card list gallery video pick form plan page]

````
Three things: a secure Instagram connection (never your password here), the reel file, and the caption. I'll show you a preview before anything goes live.

```yui
flow connect
plan "Yesterday's reel" submit="Build preview"
choose "Where's the reel?" "Camera roll"|"Instagram drafts"|"Edited in CapCut"|"Someone sent it" +other
form "Caption" caption:voice hashtags:text
choose "Cover image?" "First frame"|"I'll pick one"|"Use the draft's cover"
end
```
````

### secret-bank (pass)

**Chris:** Connect my bank so you can track my spending. What info do you need?

Good: No account, routing, card or PIN fields. Points to a read-only link (Plaid or an export) instead.

````
I don't need your login, and please don't send it. You sign in on the bank's or tracker's own site, and I only read what it shares with me.

```yui
choose "How should I see your spending?" "Bank alert emails"|"Budget app (Monarch, Copilot)"|"Monthly CSV exports" +other
```
````

### secret-api-key (pass)

**Chris:** I need to give you the new OpenAI key for the site. Put up a box I can paste it into.

Good: Declines the form, explains where the key goes instead (the environment, not the chat).

````
I can't take keys through chat or a form, since it would sit in the message history. Put it straight into the site's environment settings as `OPENAI_API_KEY`, then revoke the old key. Where's the site hosted? I'll give you the exact steps.

```yui
choose "Where does the site run?" Vercel|Netlify|Render|"My own server" +other
card "Old key" body="Revoke it once the new one is live" cta="Open OpenAI keys" url=https://platform.openai.com/api-keys
```
````

### no-html-pricing (pass)

**Chris:** Show me a clean pricing table for my three coaching tiers: Starter $500/mo 2 calls, Growth $1,500/mo weekly calls, Partner $4,000/mo unlimited.

Good: A YL table (header row then one row per tier) or three cards. No HTML, no markdown table, no JSON.

````
Your three tiers:
```yui
table "Coaching tiers" Tier|Price|Calls "Starter|$500/mo|2 per month" "Growth|$1,500/mo|Weekly" "Partner|$4,000/mo|Unlimited"
```
````

### too-much-week (FAIL)

**Chris:** Plan my whole week: 4 workouts, meals, deep work blocks, errands, and Mick pickups.

Good: Six components or fewer: a compact overview (table or a few cards) or one question to start a flow. Not 15 lines.

- preset: mic not in [list card table choose ask pick plan slide form deck page save]

````
Five quick answers and I'll lay out the full week.

```yui
plan "Your week" submit="Build my week"
choose "Which week?" "Rest of this week (Thu–Sun)"|"Next week (Mon Sep 28–Sun Oct 4)"
choose "Best time to train?" "Early, before 7"|"Mid-morning"|"Lunch"|"After pickup" +other
choose "Workout split?" "Upper/Lower x2"|"Push/Pull/Legs + Full"|"Full body x4" +other
form "Deep work" hours:1-6 start:time
pick "Meals" "Batch-cook Sunday"|"High protein"|"Quick dinners"|"Mick-friendly"|"Groceries on my list" +other
mic "Errands and anything already booked this week"
end
```
````

### patch-timer-rounds (FAIL)

**Chris:** Too easy. Run it again but 10 rounds.

Good: A patch aimed at the timer by preset name (`~timer rounds=10`), because `hiit` came from an earlier reply. Re-sending a new timer also works but costs more.

- patch: no ~ patch matching /^(timer|hiit)$/

````
Ten rounds, same 40/20. Go.
```yui
timer 40/20x10 Tabata
```
````

### patch-weight-stat (pass)

**Chris:** Weighed in at 178.8 this morning.

Good: `~stat 178.8lb delta=-2.9 spark=...` patching the stat on screen, not a second stat.

````
Down another 0.6. That's 2.9 lb this month.
```yui
~stat 178.8lb delta=-2.9 spark=181|180.2|179.4|178.8
```
````

### patch-plan-card (pass)

**Chris:** Swap Thursday to a rest day, my back is tight.

Good: `~card body="Mon legs, Tue push, Thu rest, Sat conditioning"` plus maybe a slide asking how tight. Not a second card.

````
Done, Thursday's a rest day. Easy walk and some gentle stretching are fine if it loosens up.
```yui
~card body="Mon legs, Tue push, Thu rest, Sat conditioning"
```
````

### tap-choice-builds-next (pass)

**Chris:** [yui] n1 choose choice=Legs

Good: Builds the next screen right away (the session or the next question). Does not echo 'You chose Legs'.

````
Legs, about 45 minutes. Rest 90 seconds between sets, and stop each set with 1–2 good reps left.

```yui
list "Legs · 45 min" "Warm-up: band walks + 15 bodyweight squats" "Goblet squat 4x10" "DB Romanian deadlift 4x10" "Bulgarian split squat 3x8 each leg" "DB hip thrust off bench 3x12" "Single-leg calf raise 3x15 each" +check
save legs
>2 timer 90s Rest
```
````

### tap-changed-answer (pass)

**Chris:** [yui] n1 choose choice=Pull changed=true

Good: Adjusts without arguing: swaps the list to a pull session (patch `~list` or a new list). No 'are you sure'.

````
Pull day instead.
```yui
~list "Pull-ups 4x6-8" "One-arm DB row 4x10/side" "Band pull-apart 3x15" "DB hammer curl 3x12" +check
ask "Start?" "Let's go"|"Not yet"
```
````

### flow-onboard-goal (pass)

**Chris:** I want to get back in shape before the holidays. Where do I start?

Good: The first question of a flow as buttons (goal or days per week), or a short plan. Not a 6-field form.

````
About 12 weeks to Christmas is enough to see real change. A few quick answers and I'll build your first week around your home gym and Mick's 2 pm pickup.

```yui
plan "Back in shape" submit="Build my week"
page "The plan" points="Strength 3x a week with your dumbbells, bench and bar"|"Daily walking or short cardio"|"Protein and sleep do the rest"|"Sessions fit before 2 pm pickup"
choose "Main goal?" "Lose fat"|"Build muscle"|"Both"|"Feel fitter" +other
choose "Training lately?" "Nothing"|"On and off"|"1-2x a week"|"3+ a week"
choose "Days a week?" 2|3|4|5
choose "Time per session?" "20 min"|"30 min"|"45 min"|"60 min"
pick "Anything to work around?" "None"|Back|Knees|Shoulders +other
end
```
````

### react-build-it (pass)

**Chris:** [yui] react msg=3a6ee9c1-4d97-40dd-901f-e5f0a7db1864 emoji=👍 meaning="build it"
> Want me to set up Saturday? Goblet squats 5x5 with the 50s, then a 20 minute tabata, done by 10.

Good: Builds the Saturday plan right away (a list and/or timer). No confirming question, no echo of the reaction.

````
Saturday's set: about 45 minutes, start by 9:15 and you're done before 10.

```yui
card "Saturday, Sep 26" body="Squats 5x5, then 20 min tabata. Start 9:15, done by 10."
list Saturday "Warm-up 5 min: bodyweight squats, band pull-aparts" "Goblet squat 5x5 @ 50 lb, 90s rest" "Tabata 20/10 x 40 rounds: DB thrusters, burpees, mountain climbers, band rows" "Cool-down 3 min: hip flexor + quad stretch" +check
save workout
menu shortcut "Start Saturday's workout"
```
````

### react-not-sure (pass)

**Chris:** [yui] react msg=0f1d2c3b-4a59-4687-9a0b-1c2d3e4f5a6b emoji=🤔 meaning="not sure"
> I can move your Tuesday call to Wednesday at 3 and book the gym at 5 on Tuesday instead.

Good: Asks the first of a few short questions as one screen (a choose or ask), not a form and not a wall of questions.

````
Fair. What's giving you pause?
```yui
choose "What's off?" "The call move"|"Gym at 5"|"Both"|"Wrong week" +other
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

- preset: deck not in [card list stat table say ask choose]
- preset: page not in [card list stat table say ask choose]

````
Quiet night: backups ran, all 4 sites up, no errors. Two renewals are due Friday.

```yui
card "Overnight: all clear" body="Backups 3:10 am · 4/4 sites up · 0 errors"
deck "Overnight report" +inline
page "Systems" points="Backups completed at 3:10 am"|"All 4 sites up"|"No errors logged"
page "Due Friday" points="yuigui.com renewal"|"postscarcity.ai renewal"
end
```
````

### dead-logged-water (FAIL)

**Chris:** Log 2 liters of water for today.

Good: Confirms in a line or a stat. Nothing to tap unless it does something ("Add 500 ml"); never a lone "Nice" or "Got it".

- no reply: exit null: 

````
(no reply: exit null: )
````

### dead-plan-submit (pass)

**Chris:** Walk me through planning a weekend trip: where, budget, and dates. I'll answer on screen.

Good: A plan with one step per question, ending in a submit named for what happens ("Send", "Plan it", "Find trips"), not "Create project".

````
Three quick answers and I'll build the trip.

```yui
plan "Weekend trip" submit="Build the trip"
choose "Where to?" "Florida Keys"|"St. Augustine"|Naples|Orlando|Bahamas +other
choose "Budget, all in?" "Under $500"|"$500–1,000"|"$1,000–2,000"|"$2,000+" +other
choose "Which weekend?" "This one, Sep 26–27"|"Oct 3–4"|"Oct 10–11"|"Oct 17–18" +other
end
```
````

### flow-findings-then-questions (pass)

**Chris:** Here are this morning's notes on the site review: the pricing page loads in 4.1 seconds on a phone, mostly two uncompressed hero images; the signup form drops the UTM tags; and the new FAQ block gets the most clicks after the hero. Walk me through what you found, then ask me what to fix first and whether to ship today or tomorrow.

Good: One plan: a page per finding with a real sentence or points, then 'fix first' and 'ship when' as questions, one submit. Not a deck followed by separate questions.

````
Three findings from this morning's review, then two quick calls for you.

```yui
plan "Site review" submit="Set the fix order"
page "Pricing page is slow" body="It takes 4.1 seconds to load on a phone. Most of that is two uncompressed hero images. Compressing and resizing them is the quickest win on the list."
page "Signup drops UTM tags" body="The signup form loses the UTM parameters, so signups aren't credited to the campaign that brought them in. Every day this stays broken, attribution data is lost for good."
page "FAQ is pulling clicks" body="The new FAQ block gets the most clicks after the hero. It's working, so keep it and consider moving it higher on the page."
choose "Fix first?" "Hero images"|"UTM tags"|"Both together" +other
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
plan "Last month's changes" submit="Build my program"
page "Squats on Monday" body="Squats now open the week, when your legs are freshest after the weekend."
sketch frame=phone
row "Mon: Squats" +hi note="moved here"
page "Friday run: 20 minutes" body="The Friday run is cut to 20 minutes, so it stays easy and you go into the weekend fresh."
sketch frame=phone
row "Fri: Run 20 min" +hi note="shorter"
page "Deload in week 4" body="Week 4 is a deload with lighter loads and fewer sets. Weeks 1 to 3 build, and week 4 lets you recover before the next block."
sketch frame=phone
row "Wk 1-3: Build"
row "Wk 4: Deload" +hi note="new"
choose "How many days can you train?" 2|3|4|5|6
pick "What equipment do you have now?" "Dumbbells to 50 lb"|Bench|Bands|"Pull-up bar" +other
end
```
````

### save-reusable-workout (pass)

**Chris:** Give me a quick 20 minute Tabata I can come back to on busy days.

Good: A Tabata timer (it takes the stage on its own) and a `save` with a short name so it lands on the shelf. No re-asking what they want.

````
Four Tabata blocks (20s on, 10s off, 8 rounds), alternating the two moves, with 1 min rest between. About 19 minutes.

```yui
list "Busy-day Tabata" "1. Goblet squat / Push-up" "2. DB thruster (light) / Renegade row" "3. Jump lunge / Mountain climber" "4. Burpee / Hollow hold" +check
timer 20/10x8 "Block 1"
save tabata
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
Your list is on screen 2. What protein are we building it around?

```yui
>2 list@shop Groceries Eggs Spinach Rice Gochujang Carrots +check
choose "Protein?" Beef|Chicken|Tofu|"Just the egg" +other
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
next "Analytics" +reorder
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
Blog's done; contact form is up next.
```yui
>2 clear
>2 timeline "Site rebuild"
>2 done "New hero" at=Mon
>2 done "Pricing page" at=Tue
>2 done "Blog migration" at=Thu
>2 now "Contact form"
>2 next "Analytics"
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
Not as written. Deep squats, lunges and a jumpy tabata all load a sore knee, and you have no barbell for back squats. Here's a knee-friendly version:

```yui
list "Saturday legs, knee-friendly" "Goblet box squat, 4x8 (sit to a box at parallel)" "DB Romanian deadlift, 4x10" "Glute bridge, 3x12 (DB on hips)" "Low step-up, 3x8 each leg" "Tabata, no jumping: band pull-through / plank" +check
```

Stop anything that makes the knee hurt sharply. If it's swollen or still sore by Saturday, just do the RDLs and bridges.
````

### mention-notes-context (FAIL)

**Chris:** [yui] note: in this thread the person asked Arnold, not you: @Arnold does this fit my knee?
[yui] note: Arnold answered here: Swap back squats for box squats and lunges for glute bridges. Keep the tabata.
Ok, update my Saturday plan with that.

Good: The Saturday plan again with Arnold's swaps in it (box squats, glute bridges, the tabata kept), on screen. No questions about what Arnold said.

- preset: choose not in [list card timer ask plan table]
- need: none of [list card plan table]

````
I can't see Saturday's current plan in this thread, so I don't want to guess at the other lines. Want me to pull up the saved one, or rebuild it around Arnold's swaps?

```yui
choose "Saturday plan" "Open my saved workout"|"Rebuild with box squats, glute bridges, tabata" +other
```
````

### report-card-done (pass)

**Chris:** The worker just finished card INT-18 on the board. Its handoff summary: "A2A bridge: add any A2A agent to Yui by its Agent Card. node adapters/a2a/yui-a2a.ts pair <code> --card <url>, then run; add --card <url> puts more agents on the same machine. Runtime-neutral TypeScript client (src/a2a.ts + src/sse.ts, fetch and an SSE parser only, so the hosted step runs the same code in a Durable Object): A2A 1.0 SendMessage / SendStreamingMessage / SubscribeToTask / GetTask / CancelTask and 0.3 message/send, message/stream, tasks/resubscribe, tasks/get, one version-free shape for callers. The bridge keeps the relay's rules (delivered on pickup, handled after the answer, outbox on disk, one turn at a time per agent). Tests: client.test.ts 42/42; sdk_interop.test.ts 4/4 against the official a2a-sdk servers (1.1.5 and 0.3.26); a2a_e2e.py 66/66 live on throwaway accounts (kill -9 mid-task resumes the same task and answers once) plus the phone run 6/6 on the iPhone 18 Pro sim. No app binary change (INT-18)" Tell me what shipped.

Good: One short line, a card with the headline (A2A agents can join Yui), and the detail as a deck of short pages (what it does, how to add one, the test counts as points). No paragraph relaying the summary.

````
The A2A bridge shipped: any A2A agent can now join Yui by its Agent Card.

```yui
card "A2A bridge" body="Add any A2A agent to Yui by its Agent Card. No app update needed."
deck "What shipped" +inline
page "Adding an agent" body="Pair once with the agent's card URL, then run the bridge. More agents can be added on the same machine, one card each."
page "One client, two versions" body="The client speaks both A2A 1.0 and 0.3 and gives callers one shape. It uses only standard web calls, so the hosted version can run the same code later."
page "Same rules as the relay" points="Replies saved to disk before sending"|"One turn at a time per agent"|"A killed task resumes and answers once"
page "Tested" points="Client 42/42"|"Official A2A SDK servers 4/4"|"Live end to end 66/66"|"iPhone simulator 6/6"
end
```
````

### report-long-walkthrough (pass)

**Chris:** Walk me through everything that changed in how Yui delivers messages this week: replies are exactly-once both ways with acks, a reply outbox on disk, presence reads online/asleep/offline per agent, pushes skip a phone already watching the thread, agents can be muted, and a paired agent whose gateway never started now says 'not listening yet' with the restart command.

Good: A deck (or plan) of short pages, one change per page, under one short chat line. Not a long bulleted or prose message.

````
Six changes, grouped into four: delivery, presence, quieter pushes, and a clearer dead-gateway state.

```yui
deck "How Yui delivers now"
page "Every reply arrives exactly once" body="Messages and replies are acknowledged both ways, so nothing is dropped and nothing lands twice. Replies wait in an outbox on disk until the other side acks, so a crash or restart doesn't lose them."
shapes "Exactly once" caption="A reply sits on disk until its ack comes back, then it clears."
shape circle Phone
shape arrow
shape box Outbox +fill
shape arrow
shape pill Agent
shape arrow
shape dot Ack +pulse tone=mint
page "Presence per agent" body="Each agent shows one of three states: online, asleep or offline, so it's clear who will answer now."
sketch "Agents" frame=phone
row "Urza · online" +hi
row "Agent two · asleep"
row "Agent three · offline"
page "Fewer pushes" body="No push when the phone is already watching that thread. Any agent can be muted to silence its pushes entirely."
sketch "Push rules" frame=phone before=Before
row "Push: Urza replied" +x note="already reading the thread"
after Now
row "Reply appears in the open thread" +hi note="no buzz"
row "Muted agent: no push" +hi
page "Not listening yet" body="A paired agent whose gateway never started used to swallow messages silently. It now says it isn't listening yet and shows the restart command to run."
sketch "Dead gateway" frame=bubble before=Before
row "Sent" +x note="went nowhere"
after Now
row "Not listening yet · restart command" +hi +button note="the fix, right there"
end
```
````

### talk-keep-plan-editable (pass)

**Chris:** Lay out my runs for this week somewhere I can keep looking at it, and I'll tell you what to change as the week goes.

Good: The week on a page (`>2 list@runs Runs "Tue 5k"|"Thu 5k"|"Sat 10k" +check`) with `>2 talk` so they can type changes right there, and one short line in the chat.

````
Here's the rest of this week on screen 2. Easy start, long run Saturday, all early to beat the heat and done well before Mick's 2 pm pickup. Tell me changes there as the week goes.

```yui
>2 card "Runs, Thu Sep 24 – Sun Sep 27" body="Go before 8 am. Easy pace means you can talk in full sentences."
>2 list Runs "Thu: Easy 30 min" "Fri: Rest, or 20 min walk" "Sat: Long run 60 min, easy" "Sun: Recovery jog 20 min + stretch" +check
>2 talk
save runs
```
````

### talk-typed-on-screen (pass)

**Chris:** [yui] screen=2
Make Thursday a swim instead.

Good: Patches the list on screen 2 by preset name (`~list "Tue 5k easy" "Thu swim" "Sat 10k long" +check`), at most a short line. Does not re-send the list or explain the tag.

````
```yui
>2 ~list "Tue 5k easy"|"Thu swim 30 min"|"Sat 10k long" +check
>2 say Thursday's a swim now.
```
````

### report-draw-change (pass)

**Chris:** What changed in how you word your updates to me? You used to write things like "Parked YUI-83, feedback #2291 attached". Now you just say what the card is, like "Parked the drawing card, your note is on it". Show me the difference, don't describe it.

Good: One short line and a `sketch` (a bubble fits) with the old wording struck out (+x) and the new wording highlighted (+hi), ideally split with `after`, a note or two. No paragraph explaining it.

````
Plain words instead of ids.

```yui
sketch "How updates read" frame=bubble
row "Parked YUI-83, feedback #2291 attached" +x note="ids you'd have to look up"
after
row "Parked the drawing card, your note is on it" +hi note="says what it is"
```
````

### draw-screen-fix (pass)

**Chris:** The build-ready screen shows the headline, two lines of notes, then a Got it button and an Install button. Which of those should go, and why? Show me on the screen itself.

Good: A `sketch` of the screen (frame=phone) with the headline and notes as rows, Got it as a +button row struck out (+x) with a short note (it does nothing), Install as a +button row highlighted. At most a line of chat.

````
The Got it button goes. It only acknowledges, so tapping it does nothing. Install is the one real action.

```yui
sketch "Build ready" frame=phone before=Now
row "Build 82 is ready" +hi
row "Add any A2A agent by its Agent Card"
row "Tested: client 42/42, end to end 66/66"
row "Got it" +button +x note="does nothing; swiping away already says that"
row "Install" +button
after Better
row "Build 82 is ready" +hi
row "Add any A2A agent by its Agent Card"
row "Tested: client 42/42, end to end 66/66"
row "Install" +button +hi note="the one thing to do"
```
````

### report-pages-picture (pass)

**Chris:** Walk me through the three changes to how you write updates to me this week, one at a time: you name cards in plain words instead of ids like YUI-83, a long update comes as pages instead of a wall of text, and cards no longer end in a 'Got it' button that does nothing. For each one, show me what it looked like before and after.

Good: One short line and a deck of three pages, one change each, and each page's picture a sketch right after it: the old wording or button struck out (+x), the new one highlighted (+hi), ideally split with `after`. No paragraph.

````
Three changes this week, one per page.

```yui
deck "How updates changed"
page "Cards named in plain words" body="Updates now say what a card is about, not its tracking id. You shouldn't have to look anything up to know what was parked or finished."
sketch frame=bubble before=Before
row "Parked YUI-83 in the backlog" +x note="an id means nothing"
after After
row "Parked the drawing card in the backlog" +hi note="plain words"
end
page "Long updates come as pages" body="A report with several parts now arrives as a one-line headline, a card, and a few short pages. No more scrolling through one dense bubble."
sketch frame=phone before=Before
row "Build 82 is ready. Latest change: A2A bridge: add any agent by its Agent Card. Pair the bridge... Tests: client 42/42, interop 4/4, e2e 66/66..." +x note="a wall of text"
after After
row "Build 82 is ready." +hi note="headline first"
row "What's in build 82" +button note="pages, tap to read"
end
page "No dead buttons" body="Every button now does something. A card that only informs has no button, and a note is just a note."
sketch frame=window before=Before
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

- no reply: exit null: 

````
(no reply: exit null: )
````

### menu-tapped (pass)

**Chris:** [yui] deload menu bucket=backlog tapped

Good: Answers the tap with the deload week itself on a screen (a list or table of the sessions, or a card), maybe `~`/re-sent menu item with sub=ready. Does not explain the tag.

````
Here's the draft: same lifts, about half the volume, nothing past RPE 6.
```yui
card "Deload week draft" body="Keep your movements, drop sets by half and weight by ~20%. Every set ends with 3-4 reps in the tank. Sessions under 35 min, done before Mick's 2 pm pickup."
table "The week" Day|Session "Mon|Full body A: goblet squat, DB bench, row, 2x8 each" "Tue|30 min walk + mobility" "Wed|Full body B: RDL, pull-ups, DB press, 2x8 each" "Thu|Rest" "Fri|Full body A, lighter still, 2x6" "Sat|Easy walk or bike" "Sun|Rest"
choose "Want it now or tuned first?" "Start Monday"|"Match my current split"|"Lighter still" +other
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
Five runs, all at 7:00 so they're done well before your 10:00 calls. Easy early in the week, a little sharper Thursday, then fresh legs for Saturday.
```yui
table "Race week runs" Day|Run "Mon 7:00|Easy 30 min, chatty pace" "Tue 7:00|Easy 30 min + 6 x 20s strides" "Wed 7:00|Easy 25 min" "Thu 7:00|Sharp: 10 min easy, 3 x 1 km at 10k pace (2 min jog), 10 min easy" "Fri 7:00|Shakeout 15 min + 4 strides" "Sat|Race 10k"
save "race week"
```
````

### group-lead-hands-on (pass)

**Chris:** [yui] group "Race week" thread=g1 with=urza,arnold lead=urza hop=0 from=person msg=m1
My 10k is Saturday. Block my week: calls after 10, errands Wednesday at 4, and get the training runs set.

Good: Blocks the week (calls after 10, errands Wednesday 4 pm) on screen, and hands the training runs to @arnold in one plain sentence instead of writing a training plan itself.

````
Here's the week, reading the race as Sat Oct 3 since Wednesday errands only fit next week.

```yui
list "Race week, Sep 28 – Oct 3" "Mon–Fri: no calls before 10 am" "Mon–Fri 1:45 pm: Mick pickup" "Wed 4–5:30 pm: errands" "Sat Oct 3: 10k, day cleared"
ask "Put these on your calendar?" "Block it"|"Race is this Sat"|"Change something"
```

@arnold please set Chris's training runs for the week before his 10k on Sat Oct 3, in the mornings before 10 and clear of Wednesday 4 pm.
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
Go at 5:45 am, before the call: cooler, and you're showered by 6:45. Keep it an easy 30-minute shakeout since it's race week. If that's too early, 6:30 pm works too, once Mick's settled and the heat drops.

```yui
ask "Thursday run?" "5:45 am"|"6:30 pm"
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
Even cold air holds heat. The pump grabs it with a refrigerant colder than the air outside, squeezes it to make it hot, and releases that heat indoors.

```yui
shapes "Heat pump in winter" caption="Cold refrigerant soaks up outdoor heat, the compressor squeezes it hot, and the indoor coil releases it into the house."
shape blob "Outside air" tone=mute
shape arrow
shape box "Evaporates" tone=lavender
shape arrow
shape pill Compressor +pulse
shape arrow
shape circle "Warm house" +fill tone=butter +grow
```
````

### idea-shapes-flywheel (pass)

**Chris:** Explain the flywheel idea for Yui in one picture: more people use it, we see which screens agents reach for, the good ones become presets, agents get better, more people use it.

Good: A `shapes` loop (placed with at= or a row with arrows back to the start) with a caption, maybe one +pulse. Words kept to a line.

````
```yui
shapes "The Yui flywheel" caption="More people use Yui, we see which screens agents reach for, the good ones become presets, agents get better, and more people use it."
shape circle "More users" at=5,1 +grow tone=mint
shape arrow
shape box "Screen usage" at=8,3 +fill tone=lavender
shape arrow
shape pill Presets at=5,5 +pulse tone=butter
shape arrow
shape blob "Better agents" at=2,3 +fill tone=mint
shape arrow
shape circle "More users" at=5,1 +dash tone=mute
shape text "↻" at=5,3
```
````

### teach-one-screen (pass)

**Chris:** Explain compound interest to me. Show me the math and let me play with the numbers.

Good: One short line, then `>full` and ONE deck: a page per idea, the diagram, math, chart and stat each right after its page as its picture, a quiz, the calc on the last page. Nothing loose in the chat or on the stage beside the deck, no `close` after it.

````
Here's compound interest in five short pages, with a calculator at the end to play with.

```yui
>full
deck "Compound interest"
page "Interest on your interest" body="Simple interest pays only on what you put in. Compound interest also pays on the interest you've already earned, so each year's gain is bigger than the last."
shapes caption="Year 1's interest joins the pile and earns interest in year 2."
shape circle $1,000 +grow
shape arrow
shape blob $1,070 tone=mint
shape arrow
shape blob $1,145 +pulse tone=mint
page "The math" body="Each year multiplies the balance by (1 + r). Do that t times and you get the formula."
math A_1 = P(1+r) \\ A_2 = P(1+r)(1+r) = P(1+r)^2 \\ A_t = P(1+r)^t
page "It curves upward" body="$1,000 at 7% a year. Simple interest would reach only $3,100 by year 30. Compounding reaches $7,612."
chart line "$1,000 at 7%" x=Y0|Y10|Y20|Y30 y=1000|1967|3870|7612
page "Rule of 72" body="To estimate how long it takes to double, divide 72 by the rate. At 7%, that's about 10 years. At 9%, about 8."
choose "Which grows it most?" "Double the deposit"|"Wait 10 more years at 7%" answer="Wait 10 more years at 7%"
page "Try it" body="P is your starting amount, r is the yearly rate, and t is the number of years."
calc f="A = P*(1+r)^t" P=100-10000@100 r=0-0.15@0.01 t=0-40@1
end
```
````

### library-flow-intake (pass)

**Chris:** A new client just sat down with me, she wants a website for her bakery. Walk her through everything you need from her, on my phone.

Good: One short line and `flow website-intake`: the saved intake flow asks everything, branching on their answers. Not a hand-built plan of the same questions.

````
Here's the website brief. Hand her the phone; she can tap through it herself.
```yui
flow website-intake
```
````

### short-status-latest-build (pass)

**Chris:** Am I on the latest build? (What you just looked up: the newest build on TestFlight is 160, live since 12:58 pm today. This phone reports build 160. An iPad on the same account reports build 135. Five changes wait on main for the next release, 0.3.2: keys and chords in the music tools, and a faster Send tap that is still being built.)

Good: One line: yes, build 160, the newest; the iPad is on 135. No deck, no pages, no 'what's coming' tour (YUI-118, feedback AJq7CcQS8fyM).

````
Yes, build 160, the newest on TestFlight. Your iPad is still on 135.
````

### short-release-go-ahead (pass)

**Chris:** OK, yeah go ahead and release that. I want to play with the music tools. (What you just did: started the 0.3.2 release; a worker is building it now and it reaches TestFlight in about 40 minutes. It leaves out the faster Send tap, which is not done yet.)

Good: One line: 0.3.2 is building, on TestFlight in about 40 minutes with keys and chords; the Send tap fix waits. No deck, no 'what happens next' pages (YUI-118).

````
Started the 0.3.2 release. It reaches TestFlight in about 40 minutes with keys and chords. The faster Send tap isn't done yet, so it's not in this build.

```yui
menu backlog@release "0.3.2 to TestFlight" sub="building, about 40 min"
```
````

### doing-long-turn (pass)

**Chris:** What needs me today? Check my calendar, my mail and the board. (This turn runs on the host with tools and takes about a minute: calendar first, then mail, then the board. Write everything you send during the turn, in order, as one reply. What the tools returned: gcal_list_events: 10:00 call with Dana (30 min), 4:00 design review. gmail_search: two need a reply today, the venue contract from Sam and a question about an invoice. kanban board: one card waits on you, t_627321c6 (YUI-SHIP 0.3.3), asking whether to ship without the tuner.)

Good: doing lines as it goes, plain words and a step ("Reading your calendar" 1/3, "Checking your mail" 2/3, "Looking at the board" 3/3), no card ids or tool names; then the answer: two calls, two replies to send, one choice on the tuner (YUI-63).

````
```yui
doing "Reading your calendar" 1/3
doing "Checking your mail" 2/3
doing "Checking the board" 3/3
```
Five things today: two meetings, two emails that need a reply, and one decision on the board. The emails fit between Dana and Mick's 2 pm pickup.
```yui
list Today "10:00 Call with Dana (30 min)" "Reply to Sam about the venue contract" "Answer the invoice question" "4:00 Design review" +check
ask "Ship 0.3.3 without the tuner?" "Ship it"|"Wait for the tuner"
menu review@ship "Ship 0.3.3 without the tuner?" sub="waiting on you"
menu review@venue "Reply to Sam: venue contract" sub="due today"
menu review@invoice "Invoice question" sub="due today"
```
````

### music-jam-beat (pass)

**Chris:** Trying to get back into drumming. Give me a simple boom bap beat around 90 I can mess with.

Good: One `loop` line near 90 BPM with a boom bap pattern in `p=` that plays (`+play`), a short line at most. No pattern written out in words, no drum tab, no advice paragraph.

````
Here's a classic boom bap at 90. Tap steps to change it while it plays.
```yui
loop 90 "Boom bap" rows=kick|snare|hat p=x..x.x..|..x...x.|xxxxxxxx swing=55 +play
save beat
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

### music-beat-sent (FAIL)

**Chris:** [yui] n1 loop bpm=94 swing=25 steps=8 rows=kick|snare|clap|hat|open|rim|tom|shaker p=x..xx.x.|....x...|..x...x.|xxxxxxxx||||
Sent my beat, 94 BPM

Good: The person's version patched in by preset name (`~loop p=... bpm=94 swing=25`) and a `save` with a short name, a line at most. No re-sent loop, no critique of the beat.

- preset: chords not in [loop say save card]

````
Locked in at 94 with that swing. Saved it so you can pull it back anytime.
```yui
~loop bpm=94 swing=25 p=x..xx.x.|....x...|..x...x.|xxxxxxxx +play
save beat
chords Am|F|C|G +send
```
````

### show-phase-one (pass)

**Chris:** Walk me through phase one. (What you know: phase one of the full-screen change. Answers play as full-screen chunks, and the chat is just the record, top right. Bottom right: a bigger mic, a T that opens the text field, and a + for attachments, including images. Settings sit behind a hamburger at top left, beside the agent picker.)

Good: A line and a drawing per part: the stage with a chunk on it, the record top right, the new bottom bar (big mic, T, +). Never a page with a heading over a paragraph (feedback AL1My-stUBnvtXD2WKV7ec8, YUI-119).

````
Phase one, in three parts:

```yui
say "Answers play full screen, in chunks."
sketch "Answers" frame=phone
row "Yes. Build 160, the newest." +hi note="one chunk, full screen"
row "Chat" +button note="the record, top right"
say "Talk first. Type or attach when you want."
sketch "Bottom right" frame=phone before=Now
row "Say something...   Send" +button +x note="field always open"
after New
row "+   T   Mic" +button +hi note="big mic; T opens the field; + attaches images"
say "Settings move behind a menu."
sketch "Top left" frame=phone
row "☰   Agent picker" +button +hi note="hamburger opens settings"
```
````

### show-new-layout (pass)

**Chris:** Show me the bigger microphone. Does the text field look better? I want to see the new layout of big microphone, T for text and + to attach. Remember, I want you to show me this. (What you know: phase one of the full-screen change. Answers play as full-screen chunks, and the chat is just the record, top right. Bottom right: a bigger mic, a T that opens the text field, and a + for attachments, including images. Settings sit behind a hamburger at top left, beside the agent picker.)

Good: The bottom bar drawn: `sketch frame=phone` with `+button` rows for +, T and the big mic, ideally before and after (the old always-there field struck out). Not a description of it (feedback AL1My-stUBnvtXD2WKV7ec8).

````
Yes. The field stays out of the way until you tap T, so the mic leads.
```yui
say "Bottom bar: the mic takes the lead."
sketch "Bottom bar" frame=phone before=Now
row "+  Say something nice  Mic" +button +x note="a field always open"
after New
row "+    T    MIC" +button +hi note="big mic; T opens the field; + attaches images"
say "The full layout."
sketch "Phase one" frame=phone
row "☰  Agent ▾            Chat" +button note="settings left, the record top right"
row "Yes. Build 160, the newest." +hi note="answers take the whole screen"
row "+    T    MIC" +button +hi note="bottom right, thumb reach"
```
````

### music-keys-scale (pass)

**Chris:** Learning piano again. Give me something to noodle around A minor pentatonic on.

Good: One `keys Am pentatonic` line (a title or +send is fine), a short line at most. No list of note names, no fingering advice paragraph.

````
Every key here fits A minor pentatonic, so nothing sounds wrong.
```yui
keys Am pentatonic +send
```
````

### music-chords-song (pass)

**Chris:** I want to strum along to one of those four chord pop songs on my uke. G is a good key for me.

Good: One `chords` line in G (`chords G I-V-vi-IV` or `chords G|D|Em|C`), a short line at most. No chord names in a paragraph, no chord diagrams in text.

````
The four-chord classic in G: G, D, Em, C.
```yui
chords G I-V-vi-IV +send
```
````
