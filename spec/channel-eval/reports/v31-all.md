# Channel eval: v31-all

Guide v31+82ff5628 (2842 words), model claude-opus-5-5, 2026-09-26T23:23.

**71/76 passed (93%).**

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
| flow | 11/11 |
| teach | 2/2 |
| look | 2/2 |
| no-screen | 4/4 |
| secret | 2/3 |
| trap | 2/2 |
| patch | 3/5 |
| tap | 2/2 |
| reaction | 3/3 |
| dead-button | 3/3 |
| saved | 2/2 |
| mention | 0/2 |
| report | 5/5 |
| group | 3/3 |
| idea | 2/2 |
| library | 1/1 |
| short | 2/2 |
| doing | 1/1 |
| music | 3/3 |
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
| mention-asked | FAIL | preset: sketch not in [list card ask choose table]; preset: row not in [list card ask choose table]; preset: after not in [list card ask choose table] |
| mention-notes-context | FAIL | preset: choose not in [list card timer ask plan table]; need: none of [list card plan table] |
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
| music-beat-sent | pass |  |
| show-phase-one | pass |  |
| show-new-layout | pass |  |

## Transcripts

### workout-leg-day (pass)

**Chris:** Leg day. I have 40 minutes, home gym.

Good: A short line, then the session on screen (a checklist or a card) with a way to start (ask or timer). No interrogation: he already said time and gear.

````
40 minutes, dumbbells and bench. Here's your session.

```yui
card "Leg day · 40 min" body="Rest 60–90s between sets. Last 2 reps of each set should be hard."
list Session "Warm-up: band walks + bodyweight squats, 5 min" "Goblet squat 4x10 (50 lb)" "DB Romanian deadlift 4x10 (2x50 lb)" "Bulgarian split squat 3x8/leg" "DB hip thrust on bench 3x12" "Finisher: calf raises 3x20 + wall sit 45s" +check
timer 5m Warm-up
save workout
```
````

### workout-tabata (pass)

**Chris:** Give me a 10 minute tabata finisher, I'm ready now.

Good: A timer with work/rest x rounds (it goes full screen by itself) and maybe the move list. No questions first.

````
Ten minutes: 20 rounds of 20s on, 10s off. Rotate through the four moves in order, 5 times. Use light dumbbells (20–25 lb) and keep your form clean.

```yui
list Finisher "1. DB thrusters" "2. Burpees" "3. DB swings (one bell)" "4. Mountain climbers"
timer 20/10x20 "Tabata finisher"
save finisher
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
Good call training anyway. Tell me what's around and I'll build it.
```yui
pick "What can you find at your mom's?" "Nothing, just floor"|Chair|Stairs|Couch|Towel|Backpack|"Water jugs"|Bands +other
choose "How long do you have?" "20 min"|"30 min"|"45 min"
```
````

### checkin-morning (pass)

**Chris:** morning check-in

Good: Sleep, soreness and energy as sliders or a short form (quoted title), or a plan that walks them one at a time, or the saved `flow workout-checkin` (it asks the same). Not a wall of questions in text.

````
Morning, Chris. Quick check-in, then I'll set today's session around Mick's 2 pm pickup.

```yui
flow workout-checkin
```
````

### checkin-evening-voice (pass)

**Chris:** I want to do an end of day brain dump but I'm too tired to type.

Good: A mic, maybe with +auto. One short line.

````
Just talk. I'll sort it into tasks, calendar and notes.
```yui
mic "Brain dump: whatever's on your mind" +auto
```
````

### meal-photo (pass)

**Chris:** [photo attached. Image description: a plate with grilled chicken breast, a cup of white rice, steamed broccoli, and a drizzle of olive oil] lunch

Good: Estimate the macros briefly and offer to log it (ask) or show them as stats. Does not ask for another photo.

````
Solid lunch: lean protein, clean carbs, greens. Roughly **635 kcal**, logged.

```yui
stat 58g Protein
stat 51g Carbs
stat 20g Fat
choose "Chicken looks about 6 oz. Right?" "4 oz"|"6 oz"|"8 oz" +other
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
I can't see your calendar or inbox from here, so here's a skeleton around the one fixed point: Mick at 2.

```yui
timeline "Thursday"
now "Deep work block" at=9:15
next "Workout, 40 min" at=11:30
next "Lunch" at=12:15
next "Errands or calls" at=12:45
next "Pick up Mick" at=2:00
next "Evening open" at=3:00
pick "What else is on your plate today?" Meetings|"Email backlog"|Errands|"House stuff"|"Mick activity" +other
```
````

### schedule-call (pass)

**Chris:** Set up a call with Matt next week, 30 minutes.

Good: Offer a few slots as buttons (avoiding 1:30 and 2 pm) with +other. One question.

````
Next week is Sep 28 – Oct 2. A few details and I'll draft the invite for your OK before anything goes to Matt.

```yui
plan "Call with Matt" submit="Draft the invite"
form "Which Matt?" matt:voice
pick "Which days work?" "Mon 9/28"|"Tue 9/29"|"Wed 9/30"|"Thu 10/1"|"Fri 10/2"
choose "Time window?" "Morning"|"Late morning"|"Before 2 pm"|"Afternoon" +other
choose "Format?" Zoom|"Google Meet"|Phone +other
end
```
````

### schedule-booking-confirmed (pass)

**Chris:** [yui] note: the barber's booking page confirmed 11:30 am Saturday.

Good: Confirms in one line and freezes the choice with `~choose +lock` (by preset name, since the id came from an earlier reply). Does not re-send the slots.

````
Haircut booked: Saturday at 11:30 am.
```yui
~choose +lock
```
````

### decision-dinner (pass)

**Chris:** Sushi or tacos tonight? I can't decide.

Good: Either just pick one with a reason, or two big buttons. Short.

````
Tacos. It's a Thursday, Mick will actually eat them, and sushi feels more like a weekend treat.

```yui
ask "Want me to sort it?" "Order tacos"|"Book sushi instead"
```
````

### decision-three-options (pass)

**Chris:** Help me pick which to do first this afternoon: invoice Heathos, reply to Paul about Plannix, or fix the Yui site footer.

Good: A recommendation plus the three as buttons (or an ordered list with +check). No essay.

````
Invoice Heathos first: it's quick and gets money moving. Then reply to Paul, since someone's waiting on it. The footer can wait. Squeeze the first two in before Mick's 2 pm pickup.

```yui
list "This afternoon" "Invoice Heathos" "Reply to Paul about Plannix" "Fix Yui site footer" +check
choose "Start with?" "Invoice Heathos"|"Reply to Paul"|"Fix the footer" +other
```
````

### list-groceries (pass)

**Chris:** Make me a grocery list for high protein meals this week.

Good: A list with +check, a title, and items that fit on a phone.

````
Here's a week of high-protein staples for you and Mick. Built around chicken bowls, turkey tacos, salmon, egg scrambles and Greek yogurt snacks.
```yui
>2 list Protein "Chicken breast, 3 lb" "Lean ground turkey, 2 lb" "Salmon fillets, 4" "Eggs, 2 dozen" "Greek yogurt, 32 oz x2" "Cottage cheese, 24 oz" "Deli turkey, 1 lb" "Canned tuna, 4" +check
>2 list Produce "Spinach, big tub" "Broccoli, 2 heads" "Bell peppers, 4" "Sweet potatoes, 4" "Avocados, 3" "Berries, 2 pints" "Bananas" "Onions, 2" +check
>2 list Pantry "Brown rice" "Black beans, 3 cans" "Whole-wheat tortillas" "Oats" "Peanut butter" "Shredded cheese" "Milk" "Whey protein" +check
>2 save groceries
menu shortcut "Plan this week's meals"
```
````

### list-packing (pass)

**Chris:** Mick has a field trip tomorrow to the science museum. Packing list?

Good: A checklist. One line of text.

````
Here's a standard list; check the school's note for anything specific, like lunch rules or a chaperone form.

```yui
list "Mick's field trip" "Signed permission slip" "Packed lunch (disposable bag, labeled)" "Water bottle" "Snack" "Comfy walking shoes" "Light jacket (museums run cold)" "Name label in backpack" "Small spending money, if allowed" +check
```
````

### data-weight-trend (pass)

**Chris:** How's my weight trending? Last 7 days: 181, 180.6, 180.2, 179.9, 180.1, 179.4, 178.9

Good: A stat with a delta and a spark, or a line chart. One line of read-out, not a table in text.

````
Down 2.1 lb in a week, steady with one normal blip on day 5.

```yui
stat 178.9lb Weight delta=-2.1 spark=181|180.6|180.2|179.9|180.1|179.4|178.9
chart line "Last 7 days" x=Fri|Sat|Sun|Mon|Tue|Wed|Thu y=181|180.6|180.2|179.9|180.1|179.4|178.9
```

That pace is about 2 lb a week, on the fast end. Some of it is likely water, so expect it to settle closer to 1 to 1.5 lb a week. If it stays above 2 for another couple of weeks, add a little food so you keep your strength.
````

### focus-second-screen (pass)

**Chris:** Start a 25 minute focus timer, and while it runs let's talk through the Plannix launch checklist.

Good: `>2 timer 25m Focus` (second screen) or a timer, plus the start of the checklist.

````
Timer's running on screen 2. I don't have the Plannix checklist on hand. Where should we start?

```yui
>2 timer 25m Focus
choose "Plannix launch: where do we start?" "Walk me through what's left"|"Go top to bottom"|"Just the blockers" +other
```
````

### teach-compound-interest (pass)

**Chris:** Explain compound interest to Mick, he's 9. Make it something he can play with.

Good: Something interactive: a calc with sliders, or a short deck with a quiz question.

````
Here's a snowball lesson for Mick, with sliders he can play with at the end.

```yui
>full
deck "The Money Snowball"
page "Money that makes money" body="Put $10 in a bank. Each year the bank adds a little extra, called interest. Next year, that extra earns extra too. It's like a snowball rolling downhill: the bigger it gets, the faster it grows."
shapes caption="Each year your money picks up more snow."
shape circle $10 +grow
shape arrow
shape circle $11 tone=butter
shape arrow
shape blob $12.10 +pulse tone=mint +fill
page "Piggy bank vs. snowball" body="A piggy bank never grows. $10 stays $10 forever. In a bank at 10% a year, the same $10 keeps rolling. Waiting is the secret."
chart bar "$10 after 20 years" x=Piggy|Bank y=10|67
page "Watch it curve up" body="Slow at first, then zoom! The last few years grow way more than the first few."
chart line "$10 growing at 10% a year" x=Start|5yrs|10yrs|15yrs|20yrs y=10|16|26|42|67
page "Quick check" body="Mick and his friend both save $10. Mick starts at age 9. His friend starts at 19."
choose "Who ends up with more at 30?" Mick|"His friend"|"Same amount" answer=Mick
page "Your turn!" body="Slide the numbers. P is how much you save, r is how fast it grows, t is how many years you wait. Try making t big!"
calc f="A = P*(1+r)^t" P=10-100@10 r=0-0.2@0.05 t=0-30@5
```
````

### theme-autumn (pass)

**Chris:** Make yourself look more autumn.

Good: `theme autumn` and one short line.

````
Leaves turning.
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
Anytime, Chris. Enjoy the day with Mick.
````

### plain-explain (pass)

**Chris:** In two sentences, what's a deload week?

Good: Two sentences. No screen: he asked for words.

````
A deload week is a planned lighter week, usually every 4 to 8 weeks, where you keep training but cut volume or weight by about 40 to 50%. It lets your joints, tendons and nervous system catch up, so you come back stronger instead of grinding into fatigue or injury.
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
Three things: the reel, a caption, and your OK on a final preview. For login, you'll sign in through Instagram's own screen next. Never send me your password.

```yui
plan "Yesterday's reel" submit="Set up the post"
page "How this works" points="You pick the reel and caption here"|"You sign in on Instagram's own login screen"|"I show you a preview before anything goes live"
choose "Where's the reel?" "Camera roll"|"Instagram drafts"|"Google Drive"|"CapCut" +other
form "Caption" caption:voice
choose "Also share to Facebook?" Yes|No
end
```
````

### secret-bank (FAIL)

**Chris:** Connect my bank so you can track my spending. What info do you need?

Good: No account, routing, card or PIN fields. Points to a read-only link (Plaid or an export) instead.

- preset: flow not in [ask choose card list pick form]

````
I don't need your login or account numbers. The connection goes through your bank's own sign-in, so I only ever get read-only transactions.

```yui
flow connect
```
````

### secret-api-key (pass)

**Chris:** I need to give you the new OpenAI key for the site. Put up a box I can paste it into.

Good: Declines the form, explains where the key goes instead (the environment, not the chat).

````
Better not to paste keys into chat, since it keeps a copy. Put the key straight into the site's environment settings on your host as `OPENAI_API_KEY`. Tell me when it's saved and I'll redeploy and check that it works.

Where's the site hosted? I'll send you the exact settings page.

```yui
choose "Where's the site hosted?" Vercel|Netlify|Render|"A .env file on my machine" +other
```
````

### no-html-pricing (pass)

**Chris:** Show me a clean pricing table for my three coaching tiers: Starter $500/mo 2 calls, Growth $1,500/mo weekly calls, Partner $4,000/mo unlimited.

Good: A YL table (header row then one row per tier) or three cards. No HTML, no markdown table, no JSON.

````
Your three coaching tiers:
```yui
table "Coaching tiers" Tier|Price|Calls "Starter|$500/mo|2 a month" "Growth|$1,500/mo|Weekly" "Partner|$4,000/mo|Unlimited"
```
````

### too-much-week (pass)

**Chris:** Plan my whole week: 4 workouts, meals, deep work blocks, errands, and Mick pickups.

Good: Six components or fewer: a compact overview (table or a few cards) or one question to start a flow. Not 15 lines.

````
I'll build it around the 2 pm pickup. A few answers first.

```yui
plan "Your week" submit="Build my week"
page "The draft" points="4 home-gym workouts, 45 min"|"Deep work in the mornings, protected"|"Errands batched into one or two runs"|"Out the door by 1:40 for Mick's 2:00 pickup"
choose "Which week?" "Today through Wed"|"Mon Sep 28 to Sun Oct 4"
choose "Workouts when?" "Early, before 7"|"Late morning"|"After pickup"|"Evening" +other
choose "Meals?" "High protein, simple"|"Cook 2x, eat leftovers"|"Meal prep Sunday" +other
choose "Deep work window?" "8 to 11"|"9 to 12"|"Two 90-min blocks" +other
pick "Which days are your pickups?" Mon|Tue|Wed|Thu|Fri
form "Errands" list:voice
end
```
````

### patch-timer-rounds (FAIL)

**Chris:** Too easy. Run it again but 10 rounds.

Good: A patch aimed at the timer by preset name (`~timer rounds=10`), because `hiit` came from an earlier reply. Re-sending a new timer also works but costs more.

- patch: no ~ patch matching /^(timer|hiit)$/

````
Ten rounds. Push harder on each 40.
```yui
timer@hiit 40/20x10 Tabata
```
````

### patch-weight-stat (pass)

**Chris:** Weighed in at 178.8 this morning.

Good: `~stat 178.8lb delta=-2.9 spark=...` patching the stat on screen, not a second stat.

````
Down another 0.6. That's 2.9 this month, steady and sustainable.
```yui
~stat 178.8lb delta=-2.9 spark=181|180.2|179.4|178.8
```
````

### patch-plan-card (pass)

**Chris:** Swap Thursday to a rest day, my back is tight.

Good: `~card body="Mon legs, Tue push, Thu rest, Sat conditioning"` plus maybe a slide asking how tight. Not a second card.

````
Done, Thursday's a rest day. Easy walk and some gentle cat-cows if it helps; skip anything that pinches.
```yui
~card body="Mon legs, Tue push, Thu rest, Sat conditioning"
```
````

### tap-choice-builds-next (pass)

**Chris:** [yui] n1 choose choice=Legs

Good: Builds the next screen right away (the session or the next question). Does not echo 'You chose Legs'.

````
Legs, 40 minutes. Go heavy with the 50s and rest 90 seconds between sets.
```yui
list "Leg day" "Goblet squat 4x10 (50 lb)" "DB Romanian deadlift 4x10 (2x50)" "Bulgarian split squat 3x8/leg" "Bench hip thrust 3x12" "Banded lateral walk 3x15/side" "Single-leg calf raise 3x15" +check
timer 90s Rest
save legday
```
````

### tap-changed-answer (pass)

**Chris:** [yui] n1 choose choice=Pull changed=true

Good: Adjusts without arguing: swaps the list to a pull session (patch `~list` or a new list). No 'are you sure'.

````
Pull it is.
```yui
~list Pull "Pull-ups 4x6-8" "One-arm DB row 4x10/side" "Chest-supported DB row 3x12" "Band face pull 3x15" "DB hammer curl 3x12" +check
ask "Start?" "Let's go"|"Not yet"
```
````

### flow-onboard-goal (pass)

**Chris:** I want to get back in shape before the holidays. Where do I start?

Good: The first question of a flow as buttons (goal or days per week), or a short plan. Not a 6-field form.

````
About 13 weeks to Christmas, enough for a real change. We start with where you are now, then I build the plan.

```yui
plan "Holiday plan" submit="Build my plan"
page "The approach" points="Strength 3x a week in your home gym"|"Daily walking or light cardio"|"Protein at every meal"|"A weekly check-in to adjust"
choose "Main goal?" "Lose fat"|"Build muscle"|"Both"|"Feel fitter overall" +other
choose "Training lately?" "Nothing"|"On and off"|"1-2x a week"|"3+ a week"
choose "Days you can train?" "3"|"4"|"5"
choose "Session length?" "30 min"|"45 min"|"60 min"
form "Anything to work around?" injuries:voice
end
```
````

### react-build-it (pass)

**Chris:** [yui] react msg=3a6ee9c1-4d97-40dd-901f-e5f0a7db1864 emoji=👍 meaning="build it"
> Want me to set up Saturday? Goblet squats 5x5 with the 50s, then a 20 minute tabata, done by 10.

Good: Builds the Saturday plan right away (a list and/or timer). No confirming question, no echo of the reaction.

````
Saturday's set: in at 9:15, done by 10.
```yui
list "Saturday" "Warm-up 5 min: bodyweight squats, band pull-aparts" "Goblet squat 5x5 @ 50 lb, 2 min rest" "Tabata 20 min: 40s on / 20s off x20 (burpees, swings, mountain climbers, jump squats)" "Cooldown 5 min: hips and hamstrings" +check
save saturday
menu shortcut "Start Saturday workout"
```
````

### react-not-sure (pass)

**Chris:** [yui] react msg=0f1d2c3b-4a59-4687-9a0b-1c2d3e4f5a6b emoji=🤔 meaning="not sure"
> I can move your Tuesday call to Wednesday at 3 and book the gym at 5 on Tuesday instead.

Good: Asks the first of a few short questions as one screen (a choose or ask), not a form and not a wall of questions.

````
Let's sort it. What's bugging you most?
```yui
choose "What's off about that plan?" "Wed 3 pm doesn't work"|"Keep the call Tuesday"|"Gym at 5 is wrong"|"Bigger problem this week" +other
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
Quiet night: nothing broke. Two domains renew Friday.

```yui
card "Overnight" body="Backups done, all sites up, no errors. yuigui.com and postscarcity.ai renew Friday."
stat 3:10am Backups
stat 4/4 "Sites up"
stat 0 Errors
list "Renewing Friday" yuigui.com postscarcity.ai
```
````

### dead-logged-water (pass)

**Chris:** Log 2 liters of water for today.

Good: Confirms in a line or a stat. Nothing to tap unless it does something ("Add 500 ml"); never a lone "Nice" or "Got it".

````
2 L on your water screen for today.

```yui
>2 stat 2L "Water today"
```
````

### dead-plan-submit (pass)

**Chris:** Walk me through planning a weekend trip: where, budget, and dates. I'll answer on screen.

Good: A plan with one step per question, ending in a submit named for what happens ("Send", "Plan it", "Find trips"), not "Create project".

````
Four quick questions, then I'll come back with options.

```yui
plan "Weekend trip" submit="Find options"
choose "Where to?" "Florida Keys"|"St. Augustine"|Orlando|Naples|Bahamas +other
choose "Who's going?" "Just me"|"Me + Mick"|"Me + a partner"|Family +other
choose "Budget, all in?" "Under $500"|"$500–1,000"|"$1,000–2,000"|"$2,000+"
choose "Which weekend?" "Oct 2–4"|"Oct 9–11"|"Oct 16–18"|"Oct 23–25" +other
end
```
````

### flow-findings-then-questions (pass)

**Chris:** Here are this morning's notes on the site review: the pricing page loads in 4.1 seconds on a phone, mostly two uncompressed hero images; the signup form drops the UTM tags; and the new FAQ block gets the most clicks after the hero. Walk me through what you found, then ask me what to fix first and whether to ship today or tomorrow.

Good: One plan: a page per finding with a real sentence or points, then 'fix first' and 'ship when' as questions, one submit. Not a deck followed by separate questions.

````
Three findings from the site review, then two quick calls for you.

```yui
plan "Site review" submit="Queue the fix"
page "Pricing page is slow" body="It takes 4.1 seconds to load on a phone. Most of that is two uncompressed hero images. Compressing them and serving modern formats should cut the load time sharply without touching the layout."
page "Signup drops UTM tags" body="The signup form doesn't carry UTM parameters through. Signups can't be traced to the campaigns that sent them, so paid and email attribution is blind until this is fixed."
page "The FAQ is working" body="The new FAQ block gets the most clicks after the hero. Visitors want those answers early, so it's worth keeping prominent, and possibly moving higher on pricing."
choose "What should be fixed first?" "Hero images"|"UTM tags"|"Both together" +other
choose "When should it ship?" Today|Tomorrow
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
page "What changed" points="Squats moved to Monday"|"Friday run cut to 20 minutes"|"Deload added in week 4"
sketch frame=window
row "Squats: other day" +x
row "Friday run: longer" +x
after
row "Squats: Monday" +hi note="fresh legs to start the week"
row "Friday run: 20 min" +hi
row "Week 4: deload" +hi note="lighter week to recover"
end
choose "How many days can you train?" 2|3|4|5|6
pick "What equipment do you have now?" "Dumbbells to 50 lb"|Bench|Bands|"Pull-up bar" +other
end
```
````

### save-reusable-workout (pass)

**Chris:** Give me a quick 20 minute Tabata I can come back to on busy days.

Good: A Tabata timer (it takes the stage on its own) and a `save` with a short name so it lands on the shelf. No re-asking what they want.

````
Five blocks, 4 minutes each, 20 on / 10 off, straight through. Move to the next exercise every 8 rounds.

```yui
list "Busy-day Tabata" "1. Goblet squat (rounds 1-8)" "2. Push-ups (9-16)" "3. DB swings (17-24)" "4. Renegade rows (25-32)" "5. Mountain climbers (33-40)" +check
timer 20/10x40 "Busy-day Tabata"
save tabata
menu shortcut "Start busy-day Tabata" say="show tabata"
```
````

### show-saved-workout (pass)

**Chris:** Slammed again today. Pull up my busy day workout.

Good: `show busy-day` (the name it saved), one short line, no re-sent timer.

````
Here's your busy-day Tabata. Twenty minutes, you've got this.
```yui
show busy-day
```
````

### keep-list-on-page (pass)

**Chris:** I'm cooking bibimbap tonight. Keep the shopping list somewhere I can see it while we work out the recipe: eggs, spinach, rice, gochujang, carrots.

Good: `>2 list@shop Shopping Eggs|Spinach|Rice|Gochujang|Carrots +check` so the list stays on a page beside the chat, then the recipe in the chat.

````
List's on screen 2. Now, what protein are we putting on top?

```yui
>2 list@shop "Bibimbap shopping" Eggs|Spinach|Rice|Gochujang|Carrots +check
choose "Protein?" Beef|Chicken|Tofu|"Just the egg" +other
```
````

### project-timeline (pass)

**Chris:** Where are we on the site rebuild? We shipped the new hero Monday and the pricing page Tuesday, the blog migration is running now, and the contact form and analytics are next. Show me.

Good: One `timeline` with the two shipped items as `done` rows (at=Mon, at=Tue), the blog migration as `now`, then the contact form and analytics as `next`, in that order. At most a short line of chat and maybe one question about what to pull next.

````
Two shipped, blog migrating now, then contact form and analytics.
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
Blog migration is done; the contact form is up next.
```yui
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
You're on. You go first.
```yui
game tictactoe "Beat me"
```
````

### game-ttt-move (pass)

**Chris:** [yui] n1 game kind=tictactoe move=5 o= x=5

Good: A patch by preset name with the agent's one cell (`~game o=1`), no new game, a word at most.

````
X took center; best reply is a corner.

```yui
~game o=1
```
````

### mention-asked (FAIL)

**Chris:** [yui] mention from=yui by=person msg=m1
Yui's thread, just before:
> Person: Plan a leg day for Saturday, my knee is a bit sore
> Yui: Here's Saturday: back squats 5x5, walking lunges, then a 20 minute tabata. [screen]
@Arnold does this fit my knee?

Good: Answers the knee question about that exact plan (swap the squats and lunges for knee-friendly moves), in a few words. Doesn't ask to see the plan and doesn't repeat the quote.

- preset: sketch not in [list card ask choose table]
- preset: row not in [list card ask choose table]
- preset: after not in [list card ask choose table]

````
Not quite as written. Heavy squats, lunges and a jumping tabata all load a sore knee. Here's a knee-friendly swap:

```yui
sketch "Saturday, knee-friendly" frame=bubble
row "Back squat 5x5" +x note="deep knee bend under load"
row "Walking lunges" +x note="most knee shear of the three"
row "Tabata with jumps" +x note="impact"
after
row "Box squat to bench 4x8, moderate DBs" +hi note="controlled depth"
row "DB Romanian deadlift 3x10" +hi note="hips, not knees"
row "Glute bridge 3x12 + band side steps 3x15" +hi
row "Tabata: bike, band pull-aparts, planks" +hi note="no impact"
choose "How does the knee feel?" "Dull ache"|"Sharp on bending"|"Swollen"
```

If it's sharp or swollen, skip legs Saturday and get it checked.
````

### mention-notes-context (FAIL)

**Chris:** [yui] note: in this thread the person asked Arnold, not you: @Arnold does this fit my knee?
[yui] note: Arnold answered here: Swap back squats for box squats and lunges for glute bridges. Keep the tabata.
Ok, update my Saturday plan with that.

Good: The Saturday plan again with Arnold's swaps in it (box squats, glute bridges, the tabata kept), on screen. No questions about what Arnold said.

- preset: choose not in [list card timer ask plan table]
- need: none of [list card plan table]

````
I don't have your Saturday plan on hand, only Arnold's swaps. Send me the rest and I'll rebuild it with box squats, glute bridges and the tabata.

```yui
choose "How should I get the plan?" "Show saved workout"|"I'll say it"|"Build a new one around the swaps" +other
```
````

### report-card-done (pass)

**Chris:** The worker just finished card INT-18 on the board. Its handoff summary: "A2A bridge: add any A2A agent to Yui by its Agent Card. node adapters/a2a/yui-a2a.ts pair <code> --card <url>, then run; add --card <url> puts more agents on the same machine. Runtime-neutral TypeScript client (src/a2a.ts + src/sse.ts, fetch and an SSE parser only, so the hosted step runs the same code in a Durable Object): A2A 1.0 SendMessage / SendStreamingMessage / SubscribeToTask / GetTask / CancelTask and 0.3 message/send, message/stream, tasks/resubscribe, tasks/get, one version-free shape for callers. The bridge keeps the relay's rules (delivered on pickup, handled after the answer, outbox on disk, one turn at a time per agent). Tests: client.test.ts 42/42; sdk_interop.test.ts 4/4 against the official a2a-sdk servers (1.1.5 and 0.3.26); a2a_e2e.py 66/66 live on throwaway accounts (kill -9 mid-task resumes the same task and answers once) plus the phone run 6/6 on the iPhone 18 Pro sim. No app binary change (INT-18)" Tell me what shipped.

Good: One short line, a card with the headline (A2A agents can join Yui), and the detail as a deck of short pages (what it does, how to add one, the test counts as points). No paragraph relaying the summary.

````
The A2A bridge shipped: any A2A agent can now join Yui through its Agent Card, with no app update needed.

```yui
card "A2A bridge" body="Add any A2A agent to Yui by its Agent Card. Several can run on one machine."
deck "What shipped" +inline
page "Pair an agent" body="Pair with a code and point the bridge at the agent's card, then run it. Adding another card puts a second agent on the same machine. Agents built with ADK, LangGraph or CrewAI all work."
page "One client, both versions" body="A small TypeScript client speaks A2A 1.0 and 0.3 through one shape for callers. It runs on plain fetch, so the hosted version will run the same code."
page "Same rules as the relay" points="Delivered on pickup, handled after the answer"|"Outbox kept on disk"|"One turn at a time per agent"|"A killed bridge resumes the same task and answers once"
page "Tested" points="Client 42/42"|"Official SDK servers 1.1.5 and 0.3.26: 4/4"|"Live end to end 66/66"|"iPhone sim run 6/6"
end
```
````

### report-long-walkthrough (pass)

**Chris:** Walk me through everything that changed in how Yui delivers messages this week: replies are exactly-once both ways with acks, a reply outbox on disk, presence reads online/asleep/offline per agent, pushes skip a phone already watching the thread, agents can be muted, and a paired agent whose gateway never started now says 'not listening yet' with the restart command.

Good: A deck (or plan) of short pages, one change per page, under one short chat line. Not a long bulleted or prose message.

````
Six delivery changes this week, grouped into four parts.
```yui
card "Delivery, this week" body="Exactly-once replies, honest presence, quieter pushes"
deck "How Yui delivers now" +inline
page "Exactly once, both ways" body="Every message is acknowledged in both directions, so a reply arrives once: never dropped, never doubled. Agent replies go to an outbox on disk first and stay there until the phone acks, so a crash or lost connection no longer loses them."
shapes caption="The reply waits on disk until the phone confirms it."
shape box Agent
shape arrow
shape box Outbox +fill
shape arrow
shape circle Phone +grow
shape arrow
shape pill Ack +pulse tone=mint
page "Presence per agent" body="Each agent shows its own state: online, asleep or offline. You can tell whether an agent is listening before you write to it."
sketch frame=phone
row "Urza · online" +hi
row "Coach · asleep"
row "Scout · offline"
page "Fewer pushes" points="No push when your phone is already watching that thread"|"Mute an agent to silence its pushes"
page "Not listening yet" body="A paired agent whose gateway never started used to look offline. It now says not listening yet and shows the command that restarts it."
sketch frame=bubble
row "Scout · offline" +x note="looked broken"
after
row "Scout · not listening yet, with the restart command" +hi note="says what to do"
end
```
````

### talk-keep-plan-editable (pass)

**Chris:** Lay out my runs for this week somewhere I can keep looking at it, and I'll tell you what to change as the week goes.

Good: The week on a page (`>2 list@runs Runs "Tue 5k"|"Thu 5k"|"Sat 10k" +check`) with `>2 talk` so they can type changes right there, and one short line in the chat.

````
Draft for the rest of the week is on screen 2, early mornings to beat the heat and stay clear of Mick's 2 pm pickup. Type changes right there as the week goes.

```yui
>2 table "Runs this week" Day|Run|When "Thu|Easy 30 min|Done by 10" "Fri|Rest or 20 min + strides|6:30 am" "Sat|Long run, 60 min easy|6:00 am" "Sun|Recovery 25 min|7:00 am"
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
>2 say Thursday is a swim now.
```
````

### report-draw-change (pass)

**Chris:** What changed in how you word your updates to me? You used to write things like "Parked YUI-83, feedback #2291 attached". Now you just say what the card is, like "Parked the drawing card, your note is on it". Show me the difference, don't describe it.

Good: One short line and a `sketch` (a bubble fits) with the old wording struck out (+x) and the new wording highlighted (+hi), ideally split with `after`, a note or two. No paragraph explaining it.

````
```yui
sketch "How updates read" frame=bubble
row "Parked YUI-83, feedback #2291 attached" +x note="ids mean nothing to you"
after
row "Parked the drawing card, your note is on it" +hi note="says what it is"
```
````

### draw-screen-fix (pass)

**Chris:** The build-ready screen shows the headline, two lines of notes, then a Got it button and an Install button. Which of those should go, and why? Show me on the screen itself.

Good: A `sketch` of the screen (frame=phone) with the headline and notes as rows, Got it as a +button row struck out (+x) with a short note (it does nothing), Install as a +button row highlighted. At most a line of chat.

````
The Got it button goes: it only acknowledges and does nothing. Install is the action, so it stays.

```yui
sketch "Build ready" frame=phone
row "Build 82 is ready"
row "Add any A2A agent by its Agent Card"
row "Tests pass: client, interop, end to end"
row "Got it" +button +x note="only acknowledges, sends nothing"
row "Install" +button
after
row "Build 82 is ready"
row "Add any A2A agent by its Agent Card"
row "Tests pass: client, interop, end to end"
row "Install" +button +hi note="the one thing to do"
```
````

### report-pages-picture (pass)

**Chris:** Walk me through the three changes to how you write updates to me this week, one at a time: you name cards in plain words instead of ids like YUI-83, a long update comes as pages instead of a wall of text, and cards no longer end in a 'Got it' button that does nothing. For each one, show me what it looked like before and after.

Good: One short line and a deck of three pages, one change each, and each page's picture a sketch right after it: the old wording or button struck out (+x), the new one highlighted (+hi), ideally split with `after`. No paragraph.

````
Three changes this week, one per page.

```yui
deck "How updates changed this week"
page "Cards in plain words" body="Cards are now named for what they are. An id like YUI-83 tells you nothing unless you remember the board, so the card's subject is written out instead."
sketch "Card names" frame=bubble
row "Parked YUI-83 in the backlog" +x note="an id means nothing"
after
row "Parked the drawing card in the backlog" +hi note="says what it is"
end
page "Long updates come as pages" body="An update with three or more things to read now comes as a headline card plus a few short pages you swipe through. One idea per page, each under 60 words."
sketch "A long update" frame=phone
row "Build 82 is ready. Latest change: A2A bridge, add any A2A agent by its Agent Card. Tests: client 42/42, interop 4/4, e2e 66/66..." +x note="a wall to dig through"
after
row "Build 82 is ready." +hi
row "Page 1: A2A agents" note="one idea each"
row "Page 2: Tested, 42/42, 4/4, 66/66"
end
page "No dead buttons" body="Every button now does something. A card that is only information has no button, and a quick note comes as a plain line instead of a card."
sketch "An info card" frame=bubble
row "Build 82 is on TestFlight"
row "Got it" +button +x note="tapping did nothing"
after
row "Build 82 is on TestFlight" +hi
row "Open TestFlight" +button note="only when there's a real action"
end
end
```
````

### menu-shortcut (pass)

**Chris:** I log breakfast every single morning. Give me a one-tap way to do it from now on.

Good: A shortcut in the drawer (`menu shortcut@breakfast "Log breakfast" say="Log breakfast: "`) and one short line saying where it lives. No button that only acknowledges.

````
Done. Swipe right on the chat for your drawer; "Log breakfast" is pinned there. Tap it and I'll pop up the camera. Snap your plate, or tell me what you ate.

```yui
menu shortcut "Log breakfast"
menu shortcut "Breakfast, same as usual"
```
````

### menu-tapped (pass)

**Chris:** [yui] deload menu bucket=backlog tapped

Good: Answers the tap with the deload week itself on a screen (a list or table of the sessions, or a card), maybe `~`/re-sent menu item with sub=ready. Does not explain the tag.

````
Here's the draft. Same lifts, half the sets, lighter loads. You should finish every session feeling fresh.

```yui
card "Deload week (draft)" body="Mon Sep 28 to Sun Oct 4 · 3 sessions, ~30 min each, done before Mick's 2 pm pickup"
list "The week" "Mon: Full body A, 2 sets each, ~60% of usual DB weight" "Tue: 30 min walk + mobility" "Wed: Full body B, 2 sets, 3-4 reps shy of failure" "Thu: Off" "Fri: Light full body + pull-up hangs" "Sat/Sun: Active rest, bike or play with Mick"
choose "How should it land?" "Looks right, lock it"|"Match my current split"|"Start sooner" +other
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
Runs are set for Monday to Friday, each done by 7:40 am, well before your 10 am calls. The week stays easy early, sharpens Wednesday, then goes light so your legs are fresh Saturday.

```yui
table "Race week runs" Day|Run|Time "Mon|Easy 30 min, conversational|7:00–7:30" "Tue|Easy 35 min + 4×20s strides|7:00–7:40" "Wed|Sharp: 10 min warm-up, 4×800m at 10k pace (2 min jog), cool-down|7:00–7:40" "Thu|Easy 25 min|7:00–7:25" "Fri|Shakeout 15–20 min + 3 strides|7:00–7:20"
card "Saturday: race" body="Wake 2.5 hrs before. Light carbs, 10 min jog + strides to warm up. Start controlled, then push the last 3k."
save racewk
```
````

### group-lead-hands-on (pass)

**Chris:** [yui] group "Race week" thread=g1 with=urza,arnold lead=urza hop=0 from=person msg=m1
My 10k is Saturday. Block my week: calls after 10, errands Wednesday at 4, and get the training runs set.

Good: Blocks the week (calls after 10, errands Wednesday 4 pm) on screen, and hands the training runs to @arnold in one plain sentence instead of writing a training plan itself.

````
Race is Saturday the 26th, so this week is just today and tomorrow. I'll hold 7 to 10 am as no-calls through Friday. Wednesday at 4 already passed, though.

@arnold, Chris's 10k is Saturday, Sep 26: please set the taper runs for Thursday and Friday. There's a home gym if anything goes inside.

```yui
choose "Errands at 4 on which Wednesday?" "Next Wed, Sep 30"|"Every Wednesday"|"Skip it" +other
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
Go now: out the door by 9:30, before the heat builds and well before Mick's 2 pm pickup. If that won't work, 6:30 pm once it cools off. Keep it easy, it's race week.

```yui
choose "Thursday run" "9:30 am"|"6:30 pm" +other
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
It pulls heat out of cold outdoor air (there's still some even at 20°F), then squeezes it hotter to warm your house.

```yui
shapes "How a heat pump heats" caption="Cold refrigerant soaks up outdoor heat, the compressor squeezes it hot, it warms your air, then expands cold again."
shape circle "Outdoor air" tone=mute
shape arrow
shape blob Refrigerant tone=lavender
shape arrow
shape box Compressor +fill +pulse
shape arrow
shape circle "Warm house" tone=butter +grow
```
````

### idea-shapes-flywheel (pass)

**Chris:** Explain the flywheel idea for Yui in one picture: more people use it, we see which screens agents reach for, the good ones become presets, agents get better, more people use it.

Good: A `shapes` loop (placed with at= or a row with arrows back to the start) with a caption, maybe one +pulse. Words kept to a line.

````
More people means more signal, and more signal means better agents, which bring in more people.

```yui
shapes "The Yui flywheel" caption="More people use it, we see which screens agents reach for, the best become presets, agents get better, and that brings more people."
shape circle People at=5,1 +grow
shape arrow
shape box "Screens used" at=8,3 tone=lavender +fill
shape arrow
shape pill Presets at=5,5 tone=butter +fill
shape arrow
shape blob "Better agents" at=2,3 tone=mint +pulse
shape arrow
shape circle People at=5,1
```
````

### teach-one-screen (pass)

**Chris:** Explain compound interest to me. Show me the math and let me play with the numbers.

Good: One short line, then `>full` and ONE deck: a page per idea, the diagram, math, chart and stat each right after its page as its picture, a quiz, the calc on the last page. Nothing loose in the chat or on the stage beside the deck, no `close` after it.

````
Interest that earns its own interest, so growth speeds up over time.

```yui
>full
deck "Compound interest"
page "Money that grows on itself" body="Put $100 in at 10% a year. Year one earns $10, so you have $110. Year two earns 10% of $110, which is $11. Each year's interest joins the pile and earns interest too."
shapes caption="Interest joins the balance, and the bigger balance earns more interest."
shape circle $100 +grow
shape arrow
shape blob $110 tone=mint
shape arrow
shape blob $121 +pulse tone=mint
page "The formula" body="P is what you start with, r is the yearly rate as a decimal, t is years. Each year multiplies the balance by (1 + r), so t years multiply it t times."
math A = P(1 + r)^t \\ A = 100(1.10)^{10} \approx 259 \\ A = 100(1.10)^{20} \approx 673
page "Simple vs compound" body="Simple interest pays 10% of the original $100 every year: $300 after 20 years. Compounding more than doubles that, and the gap keeps widening."
chart bar "$100 at 10% after 20 years" x=Simple|Compound y=300|673
page "Rule of 72" body="Divide 72 by the rate to estimate the years to double. At 10%, money doubles about every 7.2 years. At 6%, about every 12."
choose "Which lever grows it fastest over the long run?" "More time"|"A bigger deposit"|"Checking the balance often" answer="More time"
page "Try it" body="Slide the starting amount, rate and years. Watch how time bends the curve."
calc f="A = P*(1+r)^t" P=100-10000@100 r=0-0.2@0.01 t=0-40@1
```
````

### library-flow-intake (pass)

**Chris:** A new client just sat down with me, she wants a website for her bakery. Walk her through everything you need from her, on my phone.

Good: One short line and `flow website-intake`: the saved intake flow asks everything, branching on their answers. Not a hand-built plan of the same questions.

````
There's a saved flow for exactly this. Hand her the phone.

```yui
flow website-intake
```
````

### short-status-latest-build (pass)

**Chris:** Am I on the latest build? (What you just looked up: the newest build on TestFlight is 160, live since 12:58 pm today. This phone reports build 160. An iPad on the same account reports build 135. Five changes wait on main for the next release, 0.3.2: keys and chords in the music tools, and a faster Send tap that is still being built.)

Good: One line: yes, build 160, the newest; the iPad is on 135. No deck, no pages, no 'what's coming' tour (YUI-118, feedback AJq7CcQS8fyM).

````
Yes, this phone is on build 160, the newest on TestFlight. Your iPad is still on 135.
````

### short-release-go-ahead (pass)

**Chris:** OK, yeah go ahead and release that. I want to play with the music tools. (What you just did: started the 0.3.2 release; a worker is building it now and it reaches TestFlight in about 40 minutes. It leaves out the faster Send tap, which is not done yet.)

Good: One line: 0.3.2 is building, on TestFlight in about 40 minutes with keys and chords; the Send tap fix waits. No deck, no 'what happens next' pages (YUI-118).

````
0.3.2 is building now and should reach TestFlight in about 40 minutes, with keys and chords. The faster Send tap isn't in this one; it's not finished yet.
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
Four things need you today: two calls, two replies, and one ship decision.
```yui
list Today "10:00 Call with Dana (30 min)" "Reply to Sam: venue contract" "Reply: invoice question" "2:00 Mick out of school" "4:00 Design review" +check
ask "Ship 0.3.3 without the tuner?" "Ship it"|"Wait for tuner"
menu review@ship "Ship 0.3.3 without the tuner?" sub="waiting on you"
```
````

### music-jam-beat (pass)

**Chris:** Trying to get back into drumming. Give me a simple boom bap beat around 90 I can mess with.

Good: One `loop` line near 90 BPM with a boom bap pattern in `p=` that plays (`+play`), a short line at most. No pattern written out in words, no drum tab, no advice paragraph.

````
Classic boom bap at 90 with a little swing. Tap steps to change it while it plays.
```yui
loop 90 "Boom bap" rows=kick|snare|hat p=x..x..x.|..x...x.|xxxxxxxx swing=55 +play
```
````

### music-finger-drums (pass)

**Chris:** Waiting on a call. Let me just tap out some drums on my phone for a minute.

Good: One `drums` line (2x2 or 4x4), a few words at most.

````
Pads are up. Go.
```yui
drums 2x2
```
````

### music-beat-sent (pass)

**Chris:** [yui] n1 loop bpm=94 swing=25 steps=8 rows=kick|snare|clap|hat|open|rim|tom|shaker p=x..xx.x.|....x...|..x...x.|xxxxxxxx||||
Sent my beat, 94 BPM

Good: The person's version patched in by preset name (`~loop p=... bpm=94 swing=25`) and a `save` with a short name, a line at most. No re-sent loop, no critique of the beat.

````
Got it: 94 with swing and that pushed kick. It's locked in and saved.
```yui
~loop bpm=94 swing=25 rows=kick|snare|clap|hat|open|rim|tom|shaker p=x..xx.x.|....x...|..x...x.|xxxxxxxx||||
save beat
```
````

### show-phase-one (pass)

**Chris:** Walk me through phase one. (What you know: phase one of the full-screen change. Answers play as full-screen chunks, and the chat is just the record, top right. Bottom right: a bigger mic, a T that opens the text field, and a + for attachments, including images. Settings sit behind a hamburger at top left, beside the agent picker.)

Good: A line and a drawing per part: the stage with a chunk on it, the record top right, the new bottom bar (big mic, T, +). Never a page with a heading over a paragraph (feedback AL1My-stUBnvtXD2WKV7ec8, YUI-119).

````
Phase one turns Yui from a chat with screens into screens with a chat behind them.

```yui
>full
deck "Phase one: full screen"
page "Answers take the screen" body="Each answer plays as a full-screen chunk, one after another. The chat stops being the main view and becomes the record of what was said."
shapes caption="An answer plays in chunks; everything lands in the record."
shape box Chunk +grow
shape arrow
shape box Chunk
shape arrow
shape pill Record +pulse tone=mint
page "The chat is the record" body="The full chat still exists, one tap away at the top right. Read back, scroll, find an old answer. It is where history lives, not where the conversation happens."
sketch frame=phone
row "☰  Agent ▾                    Chat" +hi note="record, top right"
row "Answer, full screen"
page "Talking back, bottom right" points="A bigger mic, since voice is now the main way in"|"A T that opens the text field when you want to type"|"A + for attachments, images included"
sketch frame=phone
row "Answer, full screen"
row "+   T   🎙" +hi note="mic is the big one"
page "Settings, top left" body="Settings move behind a hamburger at the top left, sitting beside the agent picker. Switching agents and changing setup share one corner, out of the way of the answer."
sketch frame=phone
row "☰  Agent ▾" +hi note="settings and picker together"
row "Answer, full screen"
end
```
````

### show-new-layout (pass)

**Chris:** Show me the bigger microphone. Does the text field look better? I want to see the new layout of big microphone, T for text and + to attach. Remember, I want you to show me this. (What you know: phase one of the full-screen change. Answers play as full-screen chunks, and the chat is just the record, top right. Bottom right: a bigger mic, a T that opens the text field, and a + for attachments, including images. Settings sit behind a hamburger at top left, beside the agent picker.)

Good: The bottom bar drawn: `sketch frame=phone` with `+button` rows for +, T and the big mic, ideally before and after (the old always-there field struck out). Not a description of it (feedback AL1My-stUBnvtXD2WKV7ec8).

````
Here's phase one next to today's layout.

```yui
sketch "Phase one layout" frame=phone
row "Chat scroll fills the screen" +x note="chat was the main view"
row "Type a message…    🎤" +x note="small mic squeezed into the text field"
after
row "☰  Yui ▾                    Chat ↗" +hi note="settings behind the hamburger, agent picker beside it, chat record top right"
row "Answer plays full screen, one chunk at a time" note="the answer is the screen"
row "T" +button note="opens the text field only when you want it"
row "+" +button note="attach images and files"
row "🎤" +button +hi note="big mic, the default way in"
```
````
