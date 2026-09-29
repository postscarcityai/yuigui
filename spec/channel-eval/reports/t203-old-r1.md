# Channel eval: t203-old-r1

Guide v38+aaf80eae (3687 words), model claude-opus-5-5, 2026-09-29T04:09.

**83/96 passed (86%).**

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
| flow | 10/14 |
| teach | 2/2 |
| look | 2/2 |
| no-screen | 4/4 |
| secret | 2/3 |
| trap | 2/2 |
| patch | 3/5 |
| tap | 2/2 |
| reaction | 3/3 |
| dead-button | 2/3 |
| saved | 2/2 |
| mention | 1/2 |
| report | 4/5 |
| group | 3/3 |
| idea | 2/2 |
| library | 1/1 |
| short | 2/2 |
| doing | 0/1 |
| music | 6/7 |
| show | 2/2 |
| explain | 3/3 |
| where | 3/3 |
| items | 1/1 |
| ui | 1/1 |
| timeline | 0/1 |
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
| secret-login | FAIL | preset: flow not in [ask choose card list gallery video pick form plan page] |
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
| dead-status-report | FAIL | preset: sketch not in [card list stat table say ask choose]; preset: row not in [card list stat table say ask choose] |
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
| mention-notes-context | FAIL | preset: pick not in [list card timer ask plan table] |
| report-card-done | FAIL | preset: shapes not in [card deck page stat list plan say image timeline done now next ask choose pick table sketch row after]; preset: shape not in [card deck page stat list plan say image timeline done now next ask choose pick table sketch row after] |
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
| music-chords-song | FAIL | preset: tuner not in [chords say card save loop] |
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
| when-two-days-timeline | FAIL | need: none of [timeline] |
| facts-stacked-list | pass |  |
| fact-one-sentence | pass |  |
| last-page-next-step | FAIL | last page: ends in sketch, not something to tap |
| last-page-walkthrough | FAIL | last page: ends in sketch, not something to tap |

## Transcripts

### workout-leg-day (pass)

**Chris:** Leg day. I have 40 minutes, home gym.

Good: A short line, then the session on screen (a checklist or a card) with a way to start (ask or timer). No interrogation: he already said time and gear.

````
40 minutes, dumbbells and bench. Rest 60–90s between sets.

```yui
list "Leg day · 40 min" "Warm-up: 5 min bodyweight squats, lunges, glute bridges" "Goblet squat 4x10 (50 lb)" "DB Romanian deadlift 4x10 (2x40–50)" "Bulgarian split squat 3x8/side" "DB hip thrust on bench 3x12" "Finisher: wall sit 2x45s" +check
timer 90s Rest
save legs
menu shortcut "Start leg day" show=legs
```
````

### workout-tabata (pass)

**Chris:** Give me a 10 minute tabata finisher, I'm ready now.

Good: A timer with work/rest x rounds (it goes full screen by itself) and maybe the move list. No questions first.

````
20 rounds of 20s on, 10s off. Cycle the four moves in order, 5 times through. Grab a pair of 20–25s.

```yui
list Finisher "1. DB thrusters" "2. Mountain climbers" "3. Renegade rows" "4. Jump squats" +check
timer 20/10x20 "Tabata finisher"
save finisher
```
````

### workout-plank (pass)

**Chris:** plank hold, 2 min

Good: One timer line. Almost no chat text.

````
Brace, squeeze glutes, breathe. Go.
```yui
timer 2m Plank
```
````

### workout-gear-question (pass)

**Chris:** I want to train today but I'm at my mom's place, not sure what she has.

Good: Offer the likely gear as a pick with +other, or a camera to snap what is there. One question, not a form.

````
No problem, we can build a solid session with almost anything. Take a quick look around and tell me what's there.

```yui
pick "What's at your mom's?" "Nothing, just floor"|Chair|Stairs|"Towel or backpack"|"Some weights"|Bands|"Open space outside" +other
```
````

### checkin-morning (pass)

**Chris:** morning check-in

Good: Sleep, soreness and energy as sliders or a short form (quoted title), or a plan that walks them one at a time, or the saved `flow workout-checkin` (it asks the same). Not a wall of questions in text.

````
Morning, Chris. Quick read on how you're coming in.

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
mic "Brain dump: what's on your mind?" +auto
```
````

### meal-photo (pass)

**Chris:** [photo attached. Image description: a plate with grilled chicken breast, a cup of white rice, steamed broccoli, and a drizzle of olive oil] lunch

Good: Estimate the macros briefly and offer to log it (ask) or show them as stats. Does not ask for another photo.

````
Solid plate. Roughly 600 cal, heavy on protein. My estimate assumes about 6 oz chicken and 1 tbsp oil.

```yui
stat 55g Protein
table Lunch Item|Est "Chicken, ~6 oz|280 cal · 52g P" "Rice, 1 cup|205 cal · 45g C" "Broccoli|30 cal · 3g P" "Olive oil, ~1 tbsp|120 cal · 14g F"
ask "Log it?" "Log as is"|"Chicken was bigger"|"Less oil"
```
````

### meal-log-no-photo (pass)

**Chris:** Can you log my lunch? I'm about to eat.

Good: A camera to snap the plate (the cheapest way to log), maybe a mic as an alternative.

````
Snap it before you dig in and I'll log it.
```yui
camera "Snap your lunch"
```
````

### today-plan (pass)

**Chris:** What should I do today?

Good: Without calendar access it proposes a shape for the day or asks one thing (energy, top priority) as buttons. Remembers Mick at 2 pm. Not a text essay.

````
I can't see your calendar or inbox from here, so here's the day built around what I know. Mick is out at 2.

```yui
timeline "Today"
now "Deep work block" at=9:15
next "Workout, 45 min, home gym" at=11:30
next "Lunch" at=12:30
next "Errands or calls" at=1:15
next "Pick up Mick" at=2:00 +pulse
next "Evening open" at=3:00
end
pick "What else needs to land today?" Email|Calls|Errands|"Home stuff"|Admin +other
```
````

### schedule-call (pass)

**Chris:** Set up a call with Matt next week, 30 minutes.

Good: Offer a few slots as buttons (avoiding 1:30 and 2 pm) with +other. One question.

````
I can't reach your calendar or email from here, so I'll draft the invite for you to send. Two dates here disagree: today shows as both Thu Sep 24 and Tue Sep 29, so pick the week.

```yui
plan "Call with Matt" submit="Draft the invite"
form "Which Matt?" matt:text
choose "Next week is" "Sep 28 – Oct 2"|"Oct 5 – 9"
pick "Good windows (avoids Mick's 2 pm pickup)" "Morning 9–12"|"Early afternoon 12–1:30"|"Late afternoon 3–5" +other
choose "Format" "Phone"|"Zoom"|"Google Meet" +other
end
```
````

### schedule-booking-confirmed (pass)

**Chris:** [yui] note: the barber's booking page confirmed 11:30 am Saturday.

Good: Confirms in one line and freezes the choice with `~choose +lock` (by preset name, since the id came from an earlier reply). Does not re-send the slots.

````
Booked: haircut Saturday, 11:30 am.
```yui
~choose +lock
```
````

### decision-dinner (pass)

**Chris:** Sushi or tacos tonight? I can't decide.

Good: Either just pick one with a reason, or two big buttons. Short.

````
Tacos. Mick will actually eat them, and a Thursday school night calls for easy. Save sushi for the weekend.

```yui
choose "Tacos how?" "Order in"|"Cook at home"|"Go out" +other
```
````

### decision-three-options (pass)

**Chris:** Help me pick which to do first this afternoon: invoice Brands, reply to Paul about the quote site, or fix the Yui site footer.

Good: A recommendation plus the three as buttons (or an ordered list with +check). No essay.

````
Invoice Brands first: it's quick, it gets money moving, and it's fully in your hands. Paul next, since someone is waiting on you. The footer can take whatever time is left, since nobody is blocked on it.

```yui
list "This afternoon" "Invoice Brands" "Reply to Paul re: the quote site" "Fix Yui site footer" +check
ask "Start with the invoice?" "Draft it for me"|"I'll do it"|"Different order"
```
````

### list-groceries (pass)

**Chris:** Make me a grocery list for high protein meals this week.

Good: A list with +check, a title, and items that fit on a phone.

````
Here's a week of high-protein staples, sized for you and Mick. It's on its own screen so you can check things off in the store.

```yui
>2 list@meat Protein "Chicken breast 3 lb" "93% lean ground beef 2 lb" "Salmon fillets 1.5 lb" "Ground turkey 1 lb" "Eggs 2 dozen" "Deli turkey 1 lb" +check
>2 list@dairy Dairy "Greek yogurt 32 oz x2" "Cottage cheese 24 oz" "Milk 1 gal" "String cheese 12-pack" +check
>2 list@produce Produce "Broccoli 2 heads" "Bagged spinach" "Bell peppers 4" "Sweet potatoes 4" "Bananas" "Berries 2 pints" +check
>2 list@pantry Pantry "Rice 2 lb" "Black beans 3 cans" "Tuna 4 cans" "Oats" "Whey protein" "Whole-grain tortillas" +check
>2 save groceries
menu shortcut "Show my grocery list" show=groceries
```
````

### list-packing (pass)

**Chris:** Mick has a field trip tomorrow to the science museum. Packing list?

Good: A checklist. One line of text.

````
Here's a packing list for tomorrow. Check the permission slip first; it's the one that can keep him home.

```yui
list "Mick's field trip" "Signed permission slip (and fee, if any)" "Bag lunch, disposable, name on it" "Water bottle, labeled" "Small snack" "School shirt, if the class is wearing matching ones" "Closed-toe sneakers" "Light hoodie for museum AC" "Backpack he can carry all day" "Leave electronics and toys at home" +check
save "field trip"
```
````

### data-weight-trend (pass)

**Chris:** How's my weight trending? Last 7 days: 181, 180.6, 180.2, 179.9, 180.1, 179.4, 178.9

Good: A stat with a delta and a spark, or a line chart. One line of read-out, not a table in text.

````
Down 2.1 lb in a week, steady with one normal water blip. That's about 1.2% of bodyweight, the top end of sustainable. Keep protein high and lifting heavy so it's fat coming off, not muscle.

```yui
stat 178.9lb Weight delta=-2.1 spark=181|180.6|180.2|179.9|180.1|179.4|178.9
chart line "Last 7 days" x=Fri|Sat|Sun|Mon|Tue|Wed|Thu y=181|180.6|180.2|179.9|180.1|179.4|178.9
```
````

### focus-second-screen (pass)

**Chris:** Start a 25 minute focus timer, and while it runs let's talk through the the quote site launch checklist.

Good: `>2 timer 25m Focus` (second screen) or a timer, plus the start of the checklist.

````
Focus timer is running on screen 2. I don't have the the quote site checklist yet. Where should we start?

```yui
>2 timer 25m Focus
choose "the quote site checklist" "Paste it"|"Build it from scratch"|"It's in a doc" +other
```
````

### teach-compound-interest (pass)

**Chris:** Explain compound interest to Mick, he's 9. Make it something he can play with.

Good: Something interactive: a calc with sliders, or a short deck with a quiz question.

````
Here's a snowball-money lesson for Mick, with a quiz and sliders at the end.

```yui
>full
deck "The Snowball Piggy Bank"
page "A magic piggy bank" body="Put in $100. Every year, the bank adds 10% of whatever is inside. That's like a bonus of $10 for every $100."
shapes caption="Your money earns money, then that money earns money too."
shape circle $100 +grow
shape arrow
shape blob $110 +pulse tone=mint
shape arrow
shape blob $121 +pulse tone=butter
page "Like a snowball" body="Year 1, the bonus is $10. Year 2, it's $11, because the bonus counts the bonus from last year. The snowball rolls, gets bigger, and picks up more snow."
math 100 \to 110 \to 121 \to 133 \to 146
page "Wait longer, grow faster" body="At first it's slow. Then it zooms. Waiting is the superpower."
chart bar "$100 at 10% a year" x=Start|5yrs|10yrs|20yrs|30yrs y=100|161|259|673|1745
choose "Which one grows your money the most?" "Waiting longer"|"Checking it every day" answer="Waiting longer"
page "Your turn" body="P is the money you put in. r is the bonus (0.1 means 10%). t is the years. Slide them and watch it grow."
calc f="A = P*(1+r)^t" P=10-100@10 r=0-0.2@0.05 t=0-30@5
end
save snowball
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
Anytime, Chris. Enjoy the rest of your day, and have fun with Mick this afternoon.
````

### plain-explain (pass)

**Chris:** In two sentences, what's a deload week?

Good: Two sentences. No screen: he asked for words.

````
A deload week is a planned lighter week, usually every 4 to 8 weeks, where you cut volume or weight by about 40 to 50% while keeping the same movements. It lets your joints, tendons and nervous system catch up so you come back stronger instead of grinding into fatigue or injury.
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
Three things: a connected Instagram account (not your password), the reel file, and the caption. Link Instagram through its own sign-in first. Where's the reel?

```yui
flow connect
choose "Where's yesterday's reel?" "Camera roll"|"Instagram drafts"|"Edit app export" +other
```

I'll show you the post before it goes live.
````

### secret-bank (pass)

**Chris:** Connect my bank so you can track my spending. What info do you need?

Good: No account, routing, card or PIN fields. Points to a read-only link (Plaid or an export) instead.

````
I don't need your login or account numbers. Never send those to me. Connecting happens on your bank's own page. Which route do you want?

```yui
choose "How should I see your spending?" "Bank alert emails"|"Monthly CSV export"|"Aggregator app (Monarch, Copilot)" +other
card "What each takes" body="Alert emails: turn on transaction alerts in your bank app, and I read them from your inbox. Nothing to share. CSV: you drop a statement export here monthly. Aggregator: you log in on its own screen and I read its reports." +fold
```
````

### secret-api-key (pass)

**Chris:** I need to give you the new OpenAI key for the site. Put up a box I can paste it into.

Good: Declines the form, explains where the key goes instead (the environment, not the chat).

````
I can't take keys through chat or a form, since they'd sit in the transcript. Paste it straight into the site's environment instead. Once it's saved there as `OPENAI_API_KEY`, I'll handle the redeploy and check that it works.

```yui
choose "Where does the site run?" Vercel|Netlify|"Own server (.env)" +other
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

### too-much-week (pass)

**Chris:** Plan my whole week: 4 workouts, meals, deep work blocks, errands, and Mick pickups.

Good: Six components or fewer: a compact overview (table or a few cards) or one question to start a flow. Not 15 lines.

````
A few answers and I'll lay out the full week.

```yui
plan "Your week" submit="Build my week"
page "What I'm working with" points="Mick out at 2:00 pm on school days"|"Home gym: dumbbells to 50 lb, bench, bands, pull-up bar"|"4 workouts, deep work, meals, errands"
choose "Which week?" "Rest of this week (Thu–Sun)"|"Next week (Mon–Sun)"|"Both"
pick "Workout days" Mon|Tue|Wed|Thu|Fri|Sat|Sun
choose "Workout time" "6:00 am"|"7:00 am"|"Noon"|"5:00 pm" +other
choose "Deep work" "Mornings, 9–12"|"Two 90-min blocks"|"Afternoons after pickup" +other
choose "Meals" "Plan all three"|"Dinners only"|"Dinners + meal prep day" +other
form "Errands and pickups" errands:voice pickups:"Which days are yours?"
end
```
````

### patch-timer-rounds (FAIL)

**Chris:** Too easy. Run it again but 10 rounds.

Good: A patch aimed at the timer by preset name (`~timer rounds=10`), because `hiit` came from an earlier reply. Re-sending a new timer also works but costs more.

- patch: no ~ patch matching /^(timer|hiit)$/

````
Ten rounds. Push the pace on every one.
```yui
timer 40/20x10 Tabata
```
````

### patch-weight-stat (pass)

**Chris:** Weighed in at 178.8 this morning.

Good: `~stat 178.8lb delta=-2.9 spark=...` patching the stat on screen, not a second stat.

````
Another 0.6 down. That's 2.9 this month.
```yui
~stat 178.8lb delta=-2.9 spark=181|180.2|179.4|178.8
```
````

### patch-plan-card (pass)

**Chris:** Swap Thursday to a rest day, my back is tight.

Good: `~card body="Mon legs, Tue push, Thu rest, Sat conditioning"` plus maybe a slide asking how tight. Not a second card.

````
Thursday's now rest. Keep it easy: a 20-minute walk and some gentle cat-cows beat lying still for a tight back.

```yui
~card body="Mon legs, Tue push, Thu rest, Sat conditioning"
```
````

### tap-choice-builds-next (pass)

**Chris:** [yui] n1 choose choice=Legs

Good: Builds the next screen right away (the session or the next question). Does not echo 'You chose Legs'.

````
Legs it is. About 40 minutes, dumbbells and bench. Warm up first, then check off each move.

```yui
list "Leg day" "Warm-up: 20 bodyweight squats, 10 lunges/side" "Goblet squat 4x10 (50 lb)" "DB Romanian deadlift 4x10" "Bulgarian split squat 3x8/leg" "Bench hip thrust 3x12" "Single-leg calf raise 3x15/leg" +check
timer 90s Rest
save legs
```
````

### tap-changed-answer (pass)

**Chris:** [yui] n1 choose choice=Pull changed=true

Good: Adjusts without arguing: swaps the list to a pull session (patch `~list` or a new list). No 'are you sure'.

````
Pull, then.
```yui
~list Pull "Pull-ups 4x6-8" "One-arm DB row 4x10/side" "Band face pull 3x15" "DB hammer curl 3x12" +check
```
````

### flow-onboard-goal (pass)

**Chris:** I want to get back in shape before the holidays. Where do I start?

Good: The first question of a flow as buttons (goal or days per week), or a short plan. Not a 6-field form.

````
You've got about 13 weeks to Christmas. That's enough for a real change. Start with three sessions a week in your home gym and one daily habit. A few answers and I'll build week one.
```yui
plan "Back in shape by the holidays" submit="Build my week one"
page "The approach" points="3 full-body sessions a week, 40 min"|"Dumbbells, bench, bands, pull-up bar"|"Walk daily, protein at every meal"|"Check in weekly, adjust as you go"
choose "Main goal?" "Lose fat"|"Build strength"|"Both"|"More energy" +other
choose "How active are you right now?" "Not at all"|"Now and then"|"Fairly regular"
pick "Best days?" Mon|Tue|Wed|Thu|Fri|Sat|Sun
choose "Best time, before Mick's 2 pm pickup?" "Early morning"|"Mid-morning"|"Lunch"|"Evening"
form "Anything to work around?" notes:voice
end
```
````

### react-build-it (pass)

**Chris:** [yui] react msg=3a6ee9c1-4d97-40dd-901f-e5f0a7db1864 emoji=👍 meaning="build it"
> Want me to set up Saturday? Goblet squats 5x5 with the 50s, then a 20 minute tabata, done by 10.

Good: Builds the Saturday plan right away (a list and/or timer). No confirming question, no echo of the reaction.

````
Saturday's set. Start by 9:10 and you're done by 10.

```yui
card "Saturday" body="Legs, then conditioning. About 50 minutes, start by 9:10."
list Saturday "Warm-up: 10 min, bodyweight squats, hip openers, band pull-aparts" "Goblet squat 5x5 with the 50s, 2 min rest" "Tabata 20 min: 40s on, 20s off, 20 rounds" "Rotate: push-ups, renegade rows, mountain climbers, DB swings" "Cool-down: 5 min stretch" +check
save workout
menu shortcut "Start Saturday's workout"
menu shortcut "Start the tabata timer"
```
````

### react-not-sure (pass)

**Chris:** [yui] react msg=0f1d2c3b-4a59-4687-9a0b-1c2d3e4f5a6b emoji=🤔 meaning="not sure"
> I can move your Tuesday call to Wednesday at 3 and book the gym at 5 on Tuesday instead.

Good: Asks the first of a few short questions as one screen (a choose or ask), not a form and not a wall of questions.

````
Let's sort out what's off.
```yui
choose "What feels wrong?" "The call move"|"Gym at 5"|"Both"|"Tuesday itself" +other
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

````
Quiet night. Two renewals need you by Friday.

```yui
card "Overnight, Sep 24" body="Backups ran at 3:10. All 4 sites up. No errors."
stat 4/4 "Sites up"
sketch "Renewals due Friday" frame=bubble
row "yuigui.com, due Fri Sep 25" +hi note="needs renewing"
row "postscarcity.ai, due Fri Sep 25" +hi note="needs renewing"
ask "Renew both today?" "Renew both"|"Remind me Friday"
```
````

### dead-logged-water (pass)

**Chris:** Log 2 liters of water for today.

Good: Confirms in a line or a stat. Nothing to tap unless it does something ("Add 500 ml"); never a lone "Nice" or "Got it".

````
I can't log that yet. There's no water tracker connected here, and my shell checks came back empty, so nothing was saved.

```yui
stat 2L Water note="today, not saved"
choose "Where should I keep your water log?" "A log file I keep"|"Apple Health"|"Just track it in chat" +other
```
````

### dead-plan-submit (pass)

**Chris:** Walk me through planning a weekend trip: where, budget, and dates. I'll answer on screen.

Good: A plan with one step per question, ending in a submit named for what happens ("Send", "Plan it", "Find trips"), not "Create project".

````
Four quick questions, then I'll put together options.

```yui
plan "Weekend trip" submit="Plan it"
choose "Who's going?" Just me|"Me + Mick"|"Me + a partner"|"The whole family" +other
choose "Where to?" "Florida Keys"|"St. Augustine"|Orlando|Naples|"Bahamas (fly)"|"Asheville (fly)" +other
choose "Budget, all in?" "Under $500"|"$500–1,000"|"$1,000–2,000"|"$2,000+"
choose "Which weekend?" "Sep 26–27"|"Oct 3–4"|"Oct 10–11"|"Oct 17–18" +other
end
```
````

### flow-findings-then-questions (pass)

**Chris:** Here are this morning's notes on the site review: the pricing page loads in 4.1 seconds on a phone, mostly two uncompressed hero images; the signup form drops the UTM tags; and the new FAQ block gets the most clicks after the hero. Walk me through what you found, then ask me what to fix first and whether to ship today or tomorrow.

Good: One plan: a page per finding with a real sentence or points, then 'fix first' and 'ship when' as questions, one submit. Not a deck followed by separate questions.

````
Three findings from the site review, then two calls for you.
```yui
plan "Site review" submit="Lock the plan"
page "Pricing page is slow" body="It takes 4.1 seconds to load on a phone, and most of that is two uncompressed hero images. Compressing them and serving WebP should cut the load time sharply. It's a small change with little risk."
sketch frame=phone
row "Pricing: 4.1s on mobile" +x note="two uncompressed hero images"
after
row "Pricing: compressed WebP heroes" +hi note="most of the weight gone"
page "Signup form drops UTM tags" body="The campaign parameters are lost on submit, so signups can't be traced back to the ad, email or post that sent them. Every day it stays broken is attribution you can't recover."
sketch frame=window
row "?utm_source=newsletter → signup → (lost)" +x note="source lost on submit"
after
row "?utm_source=newsletter → signup → newsletter" +hi note="carried into the record"
page "FAQ block is working" points="Most-clicked element after the hero"|"People are looking for answers before they buy"|"Worth keeping, and possibly moving higher on pricing"
choose "Fix first?" "UTM tags"|"Hero images"|"Both together" +other
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
plan "Last month's changes, then your new program" submit="Build my program"
page "Squats moved to Monday" body="Squats now open the week, when you're freshest after the weekend. Heavy legs go first so they don't get squeezed by fatigue later on."
sketch frame=bubble
row "Monday: Squats" +hi note="leads the week"
end
page "Friday run cut to 20 minutes" body="The Friday run is shorter now, so you head into the weekend recovered instead of drained. It's still enough to keep your conditioning up."
sketch frame=bubble
row "Friday: Run, 20 min" +hi note="shorter"
end
page "Deload added in week 4" body="Week 4 drops the load so your body can absorb the first three weeks. You come back to week 5 stronger instead of beat up."
sketch frame=bubble
row "Weeks 1–3: Build" note="progressive load"
row "Week 4: Deload" +hi note="lighter, recover"
end
choose "How many days can you train now?" "2"|"3"|"4"|"5"|"6" +other
pick "What equipment do you have now?" "Dumbbells to 50 lb"|Bench|Bands|"Pull-up bar"|Barbell|"Squat rack"|Kettlebells +other
end
```
````

### save-reusable-workout (pass)

**Chris:** Give me a quick 20 minute Tabata I can come back to on busy days.

Good: A Tabata timer (it takes the stage on its own) and a `save` with a short name so it lands on the shelf. No re-asking what they want.

````
Five blocks, eight rounds each, switching moves every 4 minutes. Alternate the two moves each round.

```yui
list "Busy-day Tabata · 20 min" "1. DB thrusters / Squat jumps" "2. Push-ups / Renegade rows" "3. Goblet squats / Alternating lunges" "4. DB swings / Mountain climbers" "5. Burpees / Plank shoulder taps" +check
timer 20/10x40 "Busy-day Tabata"
save tabata
menu shortcut "Busy-day Tabata" say="show tabata"
```

Pick a DB weight you can move fast for 20 seconds, around 20 to 30 lb.
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
Shopping list is on screen 2. Now the recipe: what's going on top?

```yui
>2 list@shop Shop Eggs Spinach Rice Gochujang Carrots +check
choose "Protein?" "Beef bulgogi"|"Ground beef"|Tofu|Chicken|"Just the egg" +other
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
Not quite. Heavy squats, walking lunges and a jumping tabata all load a sore knee, and you don't have a barbell for back squats. Here's a knee-friendly version:

```yui
sketch "Saturday legs, knee-friendly" frame=bubble
row "Back squat 5x5" +x note="no barbell, heavy knee load"
row "Walking lunges" +x note="most knee shear"
row "20 min tabata" +x note="jumps pound the knee"
after
row "Goblet box squat to bench, 4x8" +hi note="stop at a pain-free depth"
row "DB Romanian deadlift, 4x10" +hi note="hips do the work"
row "Glute bridge on bench, 3x12" +hi
row "Band side walks, 3x15 each way" +hi note="steadies the knee"
row "Tabata: band pull-aparts, plank, bridges" +hi note="no jumping"
```

Keep pain at 3/10 or lower during and after. If it's sharp, swollen, or still sore next week, get it checked.
````

### mention-notes-context (FAIL)

**Chris:** [yui] note: in this thread the person asked Arnold, not you: @Arnold does this fit my knee?
[yui] note: Arnold answered here: Swap back squats for box squats and lunges for glute bridges. Keep the tabata.
Ok, update my Saturday plan with that.

Good: The Saturday plan again with Arnold's swaps in it (box squats, glute bridges, the tabata kept), on screen. No questions about what Arnold said.

- preset: pick not in [list card timer ask plan table]

````
I can't see your Saturday plan from here, so these are just Arnold's swaps. What else was on it?

```yui
list Saturday "Box squats" "Glute bridges" "Tabata" +check
pick "What else was on Saturday?" "DB bench"|"DB rows"|"Pull-ups"|RDLs|"Overhead press" +other
```
````

### report-card-done (FAIL)

**Chris:** The worker just finished card INT-18 on the board. Its handoff summary: "A2A bridge: add any A2A agent to Yui by its Agent Card. node adapters/a2a/yui-a2a.ts pair <code> --card <url>, then run; add --card <url> puts more agents on the same machine. Runtime-neutral TypeScript client (src/a2a.ts + src/sse.ts, fetch and an SSE parser only, so the hosted step runs the same code in a Durable Object): A2A 1.0 SendMessage / SendStreamingMessage / SubscribeToTask / GetTask / CancelTask and 0.3 message/send, message/stream, tasks/resubscribe, tasks/get, one version-free shape for callers. The bridge keeps the relay's rules (delivered on pickup, handled after the answer, outbox on disk, one turn at a time per agent). Tests: client.test.ts 42/42; sdk_interop.test.ts 4/4 against the official a2a-sdk servers (1.1.5 and 0.3.26); a2a_e2e.py 66/66 live on throwaway accounts (kill -9 mid-task resumes the same task and answers once) plus the phone run 6/6 on the iPhone 18 Pro sim. No app binary change (INT-18)" Tell me what shipped.

Good: One short line, a card with the headline (A2A agents can join Yui), and the detail as a deck of short pages (what it does, how to add one, the test counts as points). No paragraph relaying the summary.

- preset: shapes not in [card deck page stat list plan say image timeline done now next ask choose pick table sketch row after]
- preset: shape not in [card deck page stat list plan say image timeline done now next ask choose pick table sketch row after]

````
The A2A bridge shipped: any A2A agent can join Yui by its Agent Card, with no app update needed.

```yui
card "A2A bridge" body="Add any A2A agent to Yui by its Agent Card. Works on the current app."
deck "What shipped" +inline
page "Add an agent" body="Pair once with the bridge and point it at the agent's card, then run it. Adding more cards puts more agents on the same machine."
shapes caption="The bridge reads the agent's card and relays turns between it and your phone."
shape box Agent
shape arrow
shape pill Bridge +pulse
shape arrow
shape circle Yui +fill tone=mint
page "Same rules as the relay" points="Marked delivered on pickup, handled after the answer"|"Outbox saved on disk"|"One turn at a time per agent"|"Speaks A2A 1.0 and 0.3"|"Same client runs hosted later"
page "Tested" points="Client 42/42"|"Official A2A servers, both versions 4/4"|"Live end to end 66/66, including a crash mid-task that resumed and answered once"|"Phone run 6/6 on the simulator"
end
```
````

### report-long-walkthrough (pass)

**Chris:** Walk me through everything that changed in how Yui delivers messages this week: replies are exactly-once both ways with acks, a reply outbox on disk, presence reads online/asleep/offline per agent, pushes skip a phone already watching the thread, agents can be muted, and a paired agent whose gateway never started now says 'not listening yet' with the restart command.

Good: A deck (or plan) of short pages, one change per page, under one short chat line. Not a long bulleted or prose message.

````
Delivery is sturdier and quieter now: each reply lands once, and each agent's status is clear.
```yui
>full
deck "How Yui delivers now"
page "Every reply lands exactly once" body="Both directions now ack. The phone confirms each reply it gets, and the agent confirms each message it gets. Anything unconfirmed is resent, and repeats are dropped, so you get no gaps and no doubles."
shapes caption="Send, confirm, done. No ack means it goes again."
shape circle Phone +grow
shape arrow
shape pill Reply +pulse tone=mint
shape arrow
shape circle Agent +grow
shape text "ack ↩" tone=lavender
page "Replies wait on disk" body="An agent's replies now go to an outbox on disk before they're sent. If the gateway restarts or the phone is offline, the outbox holds each reply until it's acked."
shapes caption="A crash mid-send no longer loses the reply."
shape box Agent
shape arrow
shape box Outbox +fill tone=butter +pulse
shape arrow +dash
shape circle Phone +dash
page "See who's actually there" body="Each agent now shows as online, asleep or offline. An agent that's paired but whose gateway never started says 'Not listening yet' and shows the command to restart it."
sketch frame=phone
row "Urza · online" +hi
row "Coach · asleep" note="wakes on your message"
row "Research · offline"
row "New agent · not listening yet" +hi note="was silent before"
row "Copy restart command" +button
page "Fewer buzzes" body="There's no push when your phone already has that thread open. You can also mute an agent: its messages still arrive, just without a push."
sketch frame=bubble
row "Push while you're reading the thread" +x note="now skipped"
row "Coach muted · messages arrive silently" +hi note="per agent"
end
```
````

### talk-keep-plan-editable (pass)

**Chris:** Lay out my runs for this week somewhere I can keep looking at it, and I'll tell you what to change as the week goes.

Good: The week on a page (`>2 list@runs Runs "Tue 5k"|"Thu 5k"|"Sat 10k" +check`) with `>2 talk` so they can type changes right there, and one short line in the chat.

````
Here's the rest of the week on its own screen. It's a starting draft, so type changes right there.

```yui
>2 timeline "Runs this week"
now "Easy 30 min" at=Thu
next "Rest or strength 30 min" at=Fri
next "Long run 60 min, out by 6:30 am" at=Sat
next "Easy 25 min + strides" at=Sun
>2 talk
>2 save this week
menu shortcut "This week's runs" show="this week"
```
````

### talk-typed-on-screen (pass)

**Chris:** [yui] screen=2
Make Thursday a swim instead.

Good: Patches the list on screen 2 by preset name (`~list "Tue 5k easy" "Thu swim" "Sat 10k long" +check`), at most a short line. Does not re-send the list or explain the tag.

````
```yui
>2 ~list "Tue 5k easy"|"Thu swim 30 min"|"Sat 10k long" +check
>2 say Thursday's a swim now. Keep it steady so your legs are fresh for Saturday.
```
````

### report-draw-change (pass)

**Chris:** What changed in how you word your updates to me? You used to write things like "Parked YUI-83, feedback #2291 attached". Now you just say what the card is, like "Parked the drawing card, your note is on it". Show me the difference, don't describe it.

Good: One short line and a `sketch` (a bubble fits) with the old wording struck out (+x) and the new wording highlighted (+hi), ideally split with `after`, a note or two. No paragraph explaining it.

````
Ids are out, plain words are in.
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
The Got it button goes: it only acknowledges, so tapping it does nothing. Install is the one thing to act on.

```yui
sketch "Build ready" frame=phone before=Now
row "Build 82 is ready" +hi
row "Add any A2A agent by its Agent Card"
row "Tests: client 42/42, e2e 66/66"
row "Got it" +button +x note="only acknowledges, does nothing"
row "Install" +button
after Fixed
row "Build 82 is ready" +hi
row "Add any A2A agent by its Agent Card"
row "Tests: client 42/42, e2e 66/66"
row "Install" +button +hi note="the one action left"
```
````

### report-pages-picture (pass)

**Chris:** Walk me through the three changes to how you write updates to me this week, one at a time: you name cards in plain words instead of ids like YUI-83, a long update comes as pages instead of a wall of text, and cards no longer end in a 'Got it' button that does nothing. For each one, show me what it looked like before and after.

Good: One short line and a deck of three pages, one change each, and each page's picture a sketch right after it: the old wording or button struck out (+x), the new one highlighted (+hi), ideally split with `after`. No paragraph.

````
Three changes, one page each.

```yui
>full
deck "How updates read now"
page "Cards get plain names" body="A card is named for what it is, so you know it without looking it up."
sketch frame=bubble
row "Parked YUI-83 in the backlog" +x note="an id means nothing"
after
row "Parked the drawing card in the backlog" +hi note="says what it is"
end
page "Long updates come as pages" body="A long update is a headline card, then a few short pages, instead of one long bubble to scroll."
sketch frame=phone
row "Build 82 is ready. Latest change: A2A bridge, add any A2A agent by its Agent Card. Tests: client 42/42, interop 4/4, e2e 66/66..." +x note="a wall of text"
after
row "Build 82: add any A2A agent" +button +hi note="headline card"
row "Page 1: A2A agents" +hi
row "Page 2: Tested, 42/42, 4/4, 66/66" +hi note="short pages"
end
page "No dead buttons" body="A button now does something real. A card with nothing to act on has no button at all."
sketch frame=bubble
row "Invoice sent to the landscaper" +x
row "Got it" +button +x note="did nothing"
after
row "Invoice sent to the landscaper" +hi note="just the note"
row "Build 82 is ready" +hi
row "Open TestFlight" +button +hi note="goes somewhere"
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
Here's the draft: same lifts, about half the volume, nothing past RPE 6. Sessions fit before Mick's 2 pm pickup.

```yui
table "Deload week" Day|Session "Mon|Full body A: Goblet squat 2x8, DB bench 2x8, Pull-ups 2x5 (35 min)" "Tue|Walk 30 min + mobility" "Wed|Full body B: DB RDL 2x8, Incline DB press 2x8, Band rows 2x12 (35 min)" "Thu|Rest" "Fri|Light circuit: Split squats, push-ups, band pull-aparts, 2 rounds (25 min)" "Sat|Long walk or bike with Mick" "Sun|Rest"
choose "Before I lock it in, why the deload?" "Beat up / sore"|"Joints nagging"|"Just scheduled"|"Busy week" +other
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
Five runs at 6:30 am, done by 7:15 and before the Florida heat and your 10 am calls. The early days are easy and the sharp work is midweek, so your legs are fresh for Saturday.
```yui
table "Race week runs" Day|6:30 am|Why "Mon|30 min easy|Shake out the weekend" "Tue|35 min easy + 4x20s strides|Wake up the legs" "Wed|3x1 km at 10k pace, 2 min jog between|Last sharp session" "Thu|25 min easy|Absorb Wednesday" "Fri|15 min + 3 strides|Stay loose"
card "Saturday: 10k" body="Start the first 2 km a little slower than goal pace, then settle in. Warm up 10 min easy plus 3 strides."
save race week
```
````

### group-lead-hands-on (pass)

**Chris:** [yui] group "Race week" thread=g1 with=urza,arnold lead=urza hop=0 from=person msg=m1
My 10k is Saturday. Block my week: calls after 10, errands Wednesday at 4, and get the training runs set.

Good: Blocks the week (calls after 10, errands Wednesday 4 pm) on screen, and hands the training runs to @arnold in one plain sentence instead of writing a training plan itself.

````
I've drafted the week around a Saturday, Oct 3 race (Wednesday is Sept 30). Mornings stay open for runs.

```yui
table "Race week blocks" Day|Block "Mon–Fri|No calls before 10 am" "Wed Sep 30|Errands 4:00–5:30 pm" "Mornings|Training runs (Arnold)" "Sat Oct 3|10k race, day cleared"
ask "Put these on your calendar?" "Block it"|"Change something"
```

@arnold please set Chris's taper runs for a 10k on Saturday, Oct 3. The runs need to fit in mornings before 10 am.
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
Go at 5:45 am: 30 minutes easy, back by 6:20 for a shower before the 7 am call. It's the coolest window, and you stay free when Mick gets out at 2.

```yui
choose "Thursday run" "5:45 am, before the call"|"6:30 pm, after sunset heat" +other
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
Even cold air holds heat. The heat pump's refrigerant runs colder than the outside air, so it soaks that heat up, then gets squeezed hot and dumps the heat indoors.

```yui
shapes "Heat pump in winter" caption="Cold refrigerant pulls heat from outdoor air, the compressor makes it hot, and it releases that heat inside."
shape circle "Outdoor air" tone=lavender
shape arrow
shape box "Evaporator" +fill
shape arrow
shape pill Compressor +pulse
shape arrow
shape box "Indoor coil" tone=butter +fill
shape arrow
shape blob "Warm house" tone=butter +grow
```
````

### idea-shapes-flywheel (pass)

**Chris:** Explain the flywheel idea for Yui in one picture: more people use it, we see which screens agents reach for, the good ones become presets, agents get better, more people use it.

Good: A `shapes` loop (placed with at= or a row with arrows back to the start) with a caption, maybe one +pulse. Words kept to a line.

````
It's a loop: every use makes the next one better.

```yui
shapes "The Yui flywheel" caption="More people use it, we see which screens agents reach for, the best become presets, agents get better, and more people use it."
shape circle "More people" at=5,0.8 +grow
shape arrow
shape box "Screens used" at=8.5,3 +fill tone=lavender
shape arrow
shape pill Presets at=5,5.2 +pulse tone=mint
shape arrow
shape blob "Better agents" at=1.5,3 tone=butter
shape arrow
shape dot again at=3.6,1.1
```
````

### teach-one-screen (pass)

**Chris:** Explain compound interest to me. Show me the math and let me play with the numbers.

Good: One short line, then `>full` and ONE deck: a page per idea, the diagram, math, chart and stat each right after its page as its picture, a quiz, the calc on the last page. Nothing loose in the chat or on the stage beside the deck, no `close` after it.

````
Compound interest is interest that earns interest, so money grows faster every year you leave it alone.

```yui
>full
deck "Compound interest"
page "Money that grows on itself" body="Put $100 in at 10%. Year one earns $10. Year two earns 10% of $110, so $11. Each year's interest joins the pile and starts earning too."
shapes caption="Interest joins the balance, then earns its own interest."
shape circle $100 +grow
shape arrow
shape box $110
shape arrow
shape blob $121 +pulse tone=mint
page "Where the formula comes from" body="Each year multiplies the balance by (1 + r). After t years, that's t multiplications."
math \text{Year 1: } P(1+r) \\ \text{Year 2: } P(1+r)(1+r) = P(1+r)^2 \\ \text{Year } t\text{: } A = P(1+r)^t
page "Simple vs compound" body="Simple interest pays only on the original $100: a straight line. Compound interest pays on the growing balance: a curve that bends upward."
chart line "$100 at 10%, compound" x=Y0|Y5|Y10|Y15|Y20 y=100|161|259|418|673
page "Quick check" body="Time sits in the exponent, so it multiplies growth rather than adding to it."
choose "Which lever grows it fastest over the long run?" "More time"|"A bigger deposit" answer="More time"
page "Try it" body="Slide principal, rate and years and watch the curve redraw."
calc f="A = P*(1+r)^t" P=100-1000@100 r=0-0.2@0.05 t=0-30@5
end
```
````

### library-flow-intake (pass)

**Chris:** A new client just sat down with me, she wants a website for her bakery. Walk her through everything you need from her, on my phone.

Good: One short line and `flow website-intake`: the saved intake flow asks everything, branching on their answers. Not a hand-built plan of the same questions.

````
There's a saved flow for exactly this: `flow website-intake`. The client is "she", as stated by Chris, so using she is fine. Keep it short.

Handing it over. This walks her through the whole brief, one question at a time.
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
Let's build your brief.
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
The 0.3.2 release is building now and should reach TestFlight in about 40 minutes, with keys and chords included. It leaves out the faster Send tap, which isn't finished yet.
````

### doing-long-turn (FAIL)

**Chris:** What needs me today? Check my calendar, my mail and the board. (This turn runs on the host with tools and takes about a minute: calendar first, then mail, then the board. Write everything you send during the turn, in order, as one reply. What the tools returned: gcal_list_events: 10:00 call with Dana (30 min), 4:00 design review. gmail_search: two need a reply today, the venue contract from Sam and a question about an invoice. kanban board: one card waits on you, t_627321c6 (YUI-SHIP 0.3.3), asking whether to ship without the tuner.)

Good: doing lines as it goes, plain words and a step ("Reading your calendar" 1/3, "Checking your mail" 2/3, "Looking at the board" 3/3), no card ids or tool names; then the answer: two calls, two replies to send, one choice on the tuner (YUI-63).

- preset: sketch not in [card say ask choose list check timeline stat deck page done now next]
- preset: row not in [card say ask choose list check timeline stat deck page done now next]

````
```yui
doing "Reading your calendar" 1/3
```
```yui
doing "Checking your mail" 2/3
```
```yui
doing "Looking at the board" 3/3
```
Five things need you today: two meetings, two replies and one ship call.
```yui
sketch "Today" frame=bubble
row "10:00  Call with Dana" note="30 min"
row "Venue contract from Sam" +hi note="reply today"
row "Invoice question" +hi note="reply today"
row "2:00  Mick out of school" note="pickup"
row "4:00  Design review"
choose "Ship 0.3.3 without the tuner?" "Ship it"|"Hold for the tuner" +other
menu review@venue "Reply to Sam: venue contract" sub="due today"
menu review@invoice "Answer the invoice question" sub="due today"
menu review@ship "Ship 0.3.3 without the tuner?" sub="waiting on you"
```
````

### music-jam-beat (pass)

**Chris:** Trying to get back into drumming. Give me a simple boom bap beat around 90 I can mess with.

Good: One `loop` line near 90 BPM with a boom bap pattern in `p=` that plays (`+play`), a short line at most. No pattern written out in words, no drum tab, no advice paragraph.

````
Classic boom bap at 90. Tap steps to change it while it plays.
```yui
loop 90 "Boom bap" rows=kick|snare|hat p=x..x.x..|..x...x.|xxxxxxxx +play
drums 2x2 +record
```
````

### music-finger-drums (pass)

**Chris:** Waiting on a call. Let me just tap out some drums on my phone for a minute.

Good: One `drums` line (2x2 or 4x4), a few words at most.

````
Pads are up. Have at it.
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
~loop bpm=94 swing=25 p=x..xx.x.|....x...|..x...x.|xxxxxxxx
save beat
```
````

### show-phase-one (pass)

**Chris:** Walk me through phase one. (What you know: phase one of the full-screen change. Answers play as full-screen chunks, and the chat is just the record, top right. Bottom right: a bigger mic, a T that opens the text field, and a + for attachments, including images. Settings sit behind a hamburger at top left, beside the agent picker.)

Good: A line and a drawing per part: the stage with a chunk on it, the record top right, the new bottom bar (big mic, T, +). Never a page with a heading over a paragraph (feedback AL1My-stUBnvtXD2WKV7ec8, YUI-119).

````
Phase one in three parts.
```yui
say "Answers play full screen, in chunks."
sketch "The stage" frame=phone
row "Yes. Build 160, the newest." +hi note="one chunk, full screen"
row "Chat" +button note="just the record, top right"
say "Talk first. Type or attach when you want."
sketch "Bottom bar" frame=phone before=Now
row "+  Say something nice  Mic" +button +x note="a field always open"
after New
row "+   T   Mic" +button +hi note="bigger mic; T opens the field; + attaches images"
say "Settings move behind a menu."
sketch "Top bar" frame=phone
row "☰  Agent ▾" +button +hi note="hamburger for settings, beside the agent picker"
```
````

### show-new-layout (pass)

**Chris:** Show me the bigger microphone. Does the text field look better? I want to see the new layout of big microphone, T for text and + to attach. Remember, I want you to show me this. (What you know: phase one of the full-screen change. Answers play as full-screen chunks, and the chat is just the record, top right. Bottom right: a bigger mic, a T that opens the text field, and a + for attachments, including images. Settings sit behind a hamburger at top left, beside the agent picker.)

Good: The bottom bar drawn: `sketch frame=phone` with `+button` rows for +, T and the big mic, ideally before and after (the old always-there field struck out). Not a description of it (feedback AL1My-stUBnvtXD2WKV7ec8).

````
Here's the bottom bar, before and after.
```yui
say "The mic gets big, and the text field waits until you want it."
sketch "Bottom bar" frame=phone before=Now
row "+   Say something nice   Mic" +button +x note="a field always open, small mic"
after New
row "+        T        ( MIC )" +button +hi note="big mic in the middle of your thumb"
say "Tap T and the field slides open. Tap + for photos and files."
sketch "Typing" frame=phone
row "Say something nice" +hi note="opens only when you tap T"
row "+   T   Send" +button note="mic tucks away while you type"
say "The whole screen."
sketch "Phase one" frame=phone
row "☰   Yui ▾                    Chat" +button note="settings and agent picker left, the record right"
row "Your answer, full screen" +hi note="one chunk at a time"
row "+        T        ( MIC )" +button +hi note="talk first"
```
````

### music-keys-scale (pass)

**Chris:** Learning piano again. Give me something to noodle around A minor pentatonic on.

Good: One `keys Am pentatonic` line (a title or +send is fine), a short line at most. No list of note names, no fingering advice paragraph.

````
A minor pentatonic, locked in, so every note works.
```yui
keys Am pentatonic
loop 80 "Slow groove" p=x...x...|....x...|........|x.x.x.x. +play
```
````

### music-chords-song (FAIL)

**Chris:** I want to strum along to one of those four chord pop songs on my uke. G is a good key for me.

Good: One `chords` line in G (`chords G I-V-vi-IV` or `chords G|D|Em|C`), a short line at most. No chord names in a paragraph, no chord diagrams in text.

- preset: tuner not in [chords say card save loop]

````
I–V–vi–IV in G: G, D, Em, C. Tune up first if you need to.

```yui
chords G I-V-vi-IV
tuner ukulele
```
````

### music-tuner-guitar (pass)

**Chris:** Just restrung my acoustic and it sounds awful. Help me get it in tune.

Good: One `tuner guitar` line, a short line at most. No list of string notes and frequencies, no advice on tuning by ear.

````
New strings stretch for a day or two, so expect to retune a few times. Start low E, work up to high e, then go through once more.

```yui
tuner guitar
```
````

### music-metronome-practice (pass)

**Chris:** Working on my strumming timing. I want to practice slow, like 70 bpm in 4/4.

Good: One `metronome 70` line (beats=4 is fine), a short line at most. No paragraph of practice tips, no counting in words.

````
Click's at 70. Strum down on every beat, then add the upstrokes once it locks in.
```yui
metronome 70
chords G I-V-vi-IV
```
````

### explain-mongols-geography (pass)

**Chris:** All right, can you give me a brief geographic explanation of the Mongols?

Good: One line with the answer, then one deck on `>full` where every page has its picture: the empire as a `map` (its outline in lat,lon points, Karakorum as a pin, routes east and west), the size as a `chart` or a `stat`. Not pages of text, and not the steppe drawn as dots in `shapes` (TestFlight feedback AJIE1_1Ru1V4EMgmpWZtniI: 'It's just a text bomb'; feedback AL2nKEYo on the shapes version: 'Again, not bad but this should be a Map').

````
From the grassland of today's Mongolia, the Mongols built the largest land empire in history, reaching from Korea to Hungary within about 70 years.

```yui
>full
deck "The Mongols, by the map"
page "Where they started" body="A strip of open grassland between the Siberian forest and the Gobi Desert. Horse herders moved with the seasons. Temüjin united the tribes and became Genghis Khan in 1206."
map caption="The Onon and Kherlen river valleys, with Karakorum later built as the capital."
area Homeland MN tone=mint
pin@ka Karakorum 47.2,102.8 +pulse
pin Burkhan Khaldun 48.8,108.7
page "How far it reached" body="By 1279 it ran from Korea to Poland and from Siberia to Persia. Grassland let horses carry armies quickly in every direction."
map caption="Karakorum sat near the middle, and armies rode out from it in every direction."
area "Mongol Empire" 53,140|43,131|34.7,126.5|22.3,114|24,98|34,70|25.5,57|33,44|41,31|46,30.5|54,23|60,56|55,95 tone=butter
area Raided PL|HU +dash
pin@ka Karakorum 47.2,102.8 +pulse
route East ka|37.6,127 +arrow
route West ka|50.4,30.5 +arrow
route "Baghdad 1258" ka|33.3,44.4 +arrow
page "Split into four" body="After 1260 the empire broke into four khanates, each ruled by a branch of Genghis's family."
map caption="Yuan in China, the Golden Horde on the western steppe, the Chagatai in Central Asia and the Ilkhanate in Persia."
area Yuan CN|MN|KR tone=butter
area "Golden Horde" 56,30|57,50|55,62|50,75|44,75|43,50|46,30 tone=lavender
area Chagatai UZ|TJ|KG tone=mint
area Ilkhanate IR|IQ|AZ|AM|TM tone=mute
page "The biggest one on land"
stat "24M km²" "About a sixth of Earth's land at its peak"
end
```
````

### explain-rome-rise-fall (pass)

**Chris:** Give me the quick version of how the Roman Empire rose and fell.

Good: A line, then a picture per part: the empire at its peak as a `map` around the Mediterranean, its size over the centuries as a `chart` (or a `timeline` on the stage), the split as an east and west area. No page that is only a heading and a paragraph.

````
Rome grew from one city into a Mediterranean empire over about 800 years. The West broke apart under money trouble, civil wars and invasions and fell in 476. The East lasted until 1453.

```yui
>full
deck "Rome, rise and fall"
page "From city to empire" body="Founded around 753 BC and a republic from 509 BC, Rome took Italy first. It crushed Carthage by 146 BC and ruled the whole Mediterranean. Trajan pushed it to its peak in 117 AD."
map caption="At its peak, one city ruled every shore of the Mediterranean."
area "Empire, 117 AD" 55,-3|51,4|48,10|48,17|48,24|47,28|45,30|42,41|37,44|33,47|30,48|29,35|24,33|31,20|32,11|36,0|35,-6|37,-9|43,-9|48,-5|50,-5 tone=butter
pin@ro Rome 41.9,12.5 +pulse
pin@ca Carthage 36.85,10.3
page "Up, then down" body="It took seven centuries to build and three to lose the West."
chart line "Territory, million km²" x=264BC|146BC|50BC|117AD|390AD|476AD y=0.13|0.8|1.95|5|4.4|0.5
page "Split and sacked" body="In 395 the empire split for good. Goths sacked Rome in 410, Vandals took Africa, and the last western emperor was deposed in 476. The East, ruled from Constantinople, carried on for another thousand years."
map caption="The West fell apart. The East held on until 1453."
area West 55,-3|51,4|48,10|48,17|45,19.5|40,19.5|32,19|32,11|36,0|35,-6|37,-9|43,-9|48,-5|50,-5 tone=mute
area East 45,19.5|44,28|45,30|42,41|37,44|33,41|29,35|24,33|31,20|32,19|40,19.5 tone=mint
pin@rm Rome 41.9,12.5
pin@cp Constantinople 41,29 +pulse
route Goths 46,30|rm +arrow +dash
route Vandals 37,-6|36.85,10.3 +arrow +dash
page "Why the West fell" body="No single cause. Pressures from inside and outside fed each other."
shapes caption="Overstretch and civil wars drained the money, so the frontiers gave way."
shape box "Civil wars"
shape box "Money trouble"
shape arrow
shape pill "Weak frontiers" +pulse
shape arrow
shape circle "476" +grow tone=lavender
end
```
````

### explain-monsoon-how (pass)

**Chris:** Why does India get monsoons? Keep it short.

Good: One line and a picture: land heats, air rises, wet air off the ocean moves in, as a diagram in `shapes` with arrows or a `map` with the winds as routes, maybe a rainfall `chart` by month. Not a paragraph of weather words.

````
In summer, India's land heats up much faster than the Indian Ocean. The hot air over land rises and pulls in wet ocean air, which rains out as it's pushed up the Western Ghats and Himalayas. In winter the flow reverses and it turns dry.

```yui
map "Summer monsoon" caption="June to September, wet southwest winds blow off the ocean onto hot land."
area India IN tone=butter
pin@ghats "Western Ghats" 12,75.5
pin@him Himalayas 28.5,84 +pulse
route "Arabian Sea branch" 5,62|ghats|22,78 +arrow tone=mint
route "Bay of Bengal branch" 8,88|22,90|him +arrow tone=mint
```
````

### where-trip-route (pass)

**Chris:** Thinking about a train trip from Lisbon to Barcelona with stops in Porto and Madrid. How does that route go?

Good: One line, then a map: pins on Lisbon, Porto, Madrid and Barcelona, a route through them with an arrow, a caption with the rough hours (a small `table` of the legs beside it is fine). Not a numbered list of legs in words.

````
Lisbon to Porto goes north, then you cut east through Galicia to Madrid, since there's no direct Porto–Madrid train.

```yui
map "Lisbon to Barcelona by rail" caption="Up the coast to Porto, into Spain via Vigo, across to Madrid, then the fast line to Barcelona."
pin@li Lisbon 38.72,-9.14
pin@po Porto 41.15,-8.61 +pulse
pin@vi Vigo 42.24,-8.72
pin@ma Madrid 40.42,-3.70 +pulse
pin@ba Barcelona 41.39,2.17
route "The trip" li|po|vi|42.34,-7.86|ma|ba +arrow
list "Legs, roughly" "Lisbon → Porto: Alfa Pendular, ~3h" "Porto → Vigo: Celta train, ~2.5h" "Vigo → Madrid: high-speed via Ourense, ~4.5h" "Madrid → Barcelona: AVE, ~2.5–3h"
```
````

### where-delivery-area (pass)

**Chris:** Our farm delivers CSA boxes across Vermont, New Hampshire and western Massachusetts. Can you show a new customer what that covers?

Good: One line, then a map with the delivery area filled in (VT and NH by code, western Massachusetts as lat,lon points) and the farm or the big towns as pins. Not a list of states and counties.

````
Here's the delivery area at a glance:

```yui
map "Where our CSA boxes go" caption="All of Vermont and New Hampshire, plus Massachusetts west of Worcester."
area Vermont 45.01,-73.34|45.01,-71.5|44.5,-71.6|43.9,-72.1|43.3,-72.4|42.73,-72.46|42.73,-73.26|43.6,-73.3 tone=mint +pulse
area "New Hampshire" 45.3,-71.08|45.01,-71.5|44.5,-71.6|43.9,-72.1|43.3,-72.4|42.73,-72.46|42.7,-71.3|42.87,-70.82|43.08,-70.7|43.5,-70.98 tone=lavender
area "Western Massachusetts" 42.73,-73.26|42.73,-72.1|42.05,-72.1|42.05,-73.49 tone=butter
pin Burlington 44.48,-73.21
pin Concord 43.21,-71.54
pin Springfield 42.1,-72.59
```
````

### where-quick-country (pass)

**Chris:** Where exactly is Kyrgyzstan?

Good: One line (Central Asia, between Kazakhstan and China) and a map in the chat: KG as an area with a pulse on Bishkek, neighbors faint. No deck for a quick where.

````
Central Asia, landlocked in the Tian Shan mountains: Kazakhstan to the north, China to the east, Tajikistan and Uzbekistan to the south and west.

```yui
map "Kyrgyzstan" caption="A mountain country tucked between Kazakhstan and China, just north of Tajikistan."
area Kazakhstan KZ tone=mute
area China CN tone=mute
area "Tajikistan & Uzbekistan" TJ|UZ tone=lavender
area Kyrgyzstan KG tone=butter +pulse
pin Bishkek 42.87,74.59
pin "Lake Issyk-Kul" 42.45,77.25
```
````

### data-lunch-macros (pass)

**Chris:** Give me a quick lunch idea with 30g of protein.

Good: One line naming the lunch and a real Yui Lines table (`table Macros Food|Protein|Cal "Chicken|35g|165" ...`) or stat tiles for the macros. Not a quoted title plus `columns:` rows and `end` (GLM 5.2 on YUI-131, every row a parse error), and not a markdown table.

````
A tuna and Greek yogurt wrap takes about 5 minutes and lands around 34g protein.

```yui
card "Tuna crunch wrap" body="Mash a drained can of tuna with Greek yogurt, lemon, salt and pepper. Pile on spinach and sliced cucumber, then roll it in a whole wheat tortilla."
table "What's in it" Item|Protein|Calories "Tuna, 5 oz can in water|27g|120" "Greek yogurt, 2 tbsp|3g|20" "Whole wheat tortilla|4g|130" "Spinach and cucumber|1g|10" "Total|35g|280"
```
````

### list-no-escaped-breaks (pass)

**Chris:** What should I eat for dinner tonight? Something with protein. I'm allergic to peanuts and shellfish.

Good: A few dinners as a `list` (or cards), one per item, and a way to pick one. Never one `say` with \n breaks inside the quotes: the app shows the letter n (YUI-161, GLM 5.2 on native Basil).

````
Sheet-pan lemon garlic chicken thighs with sweet potato and broccoli. About 30 minutes, one pan, no peanuts or shellfish, and Mick will probably eat it too.

```yui
card "Lemon garlic chicken sheet pan" body="Toss 1.5 lb boneless thighs, 2 cubed sweet potatoes and a head of broccoli with olive oil, garlic, lemon, salt and paprika. Roast at 425°F for 25 min."
table "Per serving (you)" Macro|Amount "Protein|45 g" "Carbs|40 g" "Fat|18 g" "Calories|~500"
choose "Rather have something else?" "Salmon rice bowl"|"Turkey taco bowls"|"Steak and potatoes" +other
list Groceries "Chicken thighs 1.5 lb" "Sweet potatoes x2" "Broccoli" "Lemon" "Garlic" +check
```

I tried to save your peanut and shellfish allergies to memory, but the write didn't go through. I'll keep them out of everything this chat, and you may need to remind me next time.
````

### items-board-cards-drawn (pass)

**Chris:** Anything waiting on me?

Good: One short line, then the two items drawn: a sketch with one row per card (title plus one fact) or a list or two cards, so he sees them. Not a paragraph counting the cards and listing what is in them.

````
Two approvals.
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
The closing purple box went live with the client's final copy on Sep 24, and it now captures leads.

```yui
sketch "Closing purple box" frame=phone before="Sep 23"
row "Red placeholder frame" +x note="gone"
after "Sep 24"
row "the client's final copy, word for word" +hi
row "ZIP code" +button note="working field"
row "Two-question form" +hi note="answers go into the lead record"
row "See My Coverage Options" +button
row "Talk to a Licensed Advisor" +button
```
````

### when-two-days-timeline (FAIL)

**Chris:** What did we change on the quote site two days earlier, on Sep 22 and 23?

Good: One short line, then a timeline: the Sep 22 and Sep 23 changes as rows with their dates, oldest first. Not a sentence with the dates inside it (Chris: "If we're talking about some two days earlier, we need some type of timeline. Show me visually").

- need: none of [timeline]

````
Three fixes on Sep 22–23:

```yui
list "the quote site, Sep 22–23" "Real brand logos on the /brands family cards" "Bigger field labels on the calculator" "Last four form eyebrow labels fixed"
```
````

### facts-stacked-list (pass)

**Chris:** List the small fixes we made on the quote site.

Good: Three or more facts as one stacked list (or a table), each row Label: value. Not one line per fix with hyphens, and never a list of one (Chris: "These were all supposed to be in a stacked list").

````
Four small the quote site fixes shipped.
```yui
list "the quote site fixes" "Real brand logos on the /brands family cards" "Bigger field labels on the calculator" "Last four eyebrow labels on the forms fixed" "Red placeholder frame removed from the closing box"
```
````

### fact-one-sentence (pass)

**Chris:** Anything else fixed on the forms?

Good: One fact, so one plain sentence: the last four eyebrow labels on the forms were fixed. No hyphen, no list of one (Chris: "If there's only one thing hyphenated, it doesn't mean anything").

````
One more: the last four eyebrow labels on the the quote site forms were fixed. That's the only other fix on the board.
````

### last-page-next-step (FAIL)

**Chris:** Walk me through the most recent changes we've done for the quote site.

Good: Short answer first, then a deck or plan of the changes (each with its picture, at most 4 pages) whose last step is a `choose` of what to do next or 'Why do you ask?', never a page they can only read (Chris: "we are on the last card and I want some type of action here. I don't want a user to land here and not know what to do next").

- last page: ends in sketch, not something to tap

````
The closing section of the page is finished, and the cards, calculator and forms were cleaned up before it.
```yui
card "the quote site, Sep 22 to 24" body="Closing box done: final copy, ZIP field, lead form"
deck "Recent the quote site changes" +inline
page "Closing purple box, Sep 24" points="the client's final copy, word for word"|"Working ZIP field"|"Two-question form, answers go to the lead record"|"Red placeholder frame removed"
sketch "Closing box" frame=window
row "Red placeholder frame" +x note="gone"
after
row "the client's final copy" +hi
row "ZIP code" note="works now"
row "Two questions" note="saved on the lead"
row "See My Coverage Options" +button
row "Talk to a Licensed Advisor" +button
page "Family cards, Sep 22 to 23" body="The family cards on /brands now show each brand's real logo."
sketch frame=window
row "Real brand logo + family card" +hi note="real logos"
page "Calculator and forms, Sep 22 to 23" points="Bigger field labels on the calculator"|"Last four eyebrow labels on the forms fixed"
sketch frame=window
row "Field label" +hi note="bigger, easier to read"
row "Eyebrow label" +hi note="last four fixed"
end
```
````

### last-page-walkthrough (FAIL)

**Chris:** Walk me through what changed on the closing purple box, step by step.

Good: A deck (or plan) of the changes, each with its picture, and the last step is something to tap: a `choose` of what to do next or 'Why do you ask?'. No dead end.

- last page: ends in sketch, not something to tap

````
Four changes landed on the closing purple box on Sep 24.

```yui
deck "Closing purple box, Sep 24" +inline
page "Final copy, red frame gone" body="the client's final copy is in, word for word, and the red placeholder frame around the box is removed."
sketch frame=window before=Before
row "Placeholder copy inside a red frame" +x note="draft state"
after Now
row "the client's final copy, no frame" +hi note="word for word"
end
page "ZIP field works" body="The ZIP field in the box now takes a real entry instead of sitting there as a mockup."
sketch frame=window before=Before
row "ZIP [        ]" +x note="didn't work"
after Now
row "ZIP [ 33410 ]" +hi note="working field"
end
page "Two questions into the lead" body="A short two-question form sits in the box. Its answers go straight into the lead record, so advisors see them before the first call."
shapes caption="Visitor answers two questions, the answers land on their lead."
shape circle Visitor +grow
shape arrow
shape box "2 questions" +fill
shape arrow
shape pill "Lead record" +pulse tone=mint
page "Buttons renamed" body="The two buttons now say exactly what happens next."
sketch frame=window
row "See My Coverage Options" +button +hi
row "Talk to a Licensed Advisor" +button +hi
end
end
```
````
