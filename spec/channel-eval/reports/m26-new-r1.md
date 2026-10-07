# Channel eval: m26-new-r1

Guide v50+195d36e7 (6323 words), model claude-opus-5-5, 2026-10-07T19:44.

**122/144 passed (85%).**

| category | passed |
|---|---|
| workout | 5/5 |
| check-in | 2/2 |
| photo | 2/2 |
| today | 1/1 |
| scheduling | 2/2 |
| decision | 2/2 |
| list | 2/3 |
| data | 1/2 |
| flow | 9/14 |
| teach | 2/2 |
| look | 2/2 |
| no-screen | 4/4 |
| secret | 2/3 |
| trap | 2/2 |
| patch | 4/5 |
| tap | 1/2 |
| reaction | 0/3 |
| dead-button | 3/3 |
| saved | 2/2 |
| mention | 1/2 |
| report | 5/5 |
| group | 2/3 |
| idea | 2/2 |
| library | 1/1 |
| short | 1/2 |
| doing | 1/1 |
| music | 6/7 |
| show | 14/15 |
| explain | 7/8 |
| where | 3/3 |
| items | 1/1 |
| ui | 1/1 |
| timeline | 1/1 |
| facts | 2/2 |
| tiles | 3/3 |
| context | 3/3 |
| one-line | 6/6 |
| draw | 3/4 |
| table | 1/1 |
| motion | 10/12 |

| case | result | why |
|---|---|---|
| workout-leg-day | pass |  |
| workout-start-runner | pass |  |
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
| secret-bank | FAIL | preset: sketch not in [ask choose card list pick form]; preset: row not in [ask choose card list pick form]; preset: plan not in [ask choose card list pick form] |
| secret-api-key | pass |  |
| no-html-pricing | pass |  |
| too-much-week | pass |  |
| patch-timer-rounds | FAIL | patch: no ~ patch matching /^(timer\|hiit)$/ |
| patch-weight-stat | pass |  |
| patch-plan-card | pass |  |
| tap-choice-builds-next | FAIL | preset: plan not in [list card timer ask choose pick slide table query put]; preset: page not in [list card timer ask choose pick slide table query put] |
| tap-changed-answer | pass |  |
| flow-onboard-goal | FAIL | preset: flow not in [choose ask pick slide plan form card mic page]; need: none of [choose ask pick slide plan] |
| react-build-it | FAIL | preset: pick not in [list timer say card plan stat page]; preset: slide not in [list timer say card plan stat page]; preset: choose not in [list timer say card plan stat page] |
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
| menu-tapped | pass |  |
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
| music-chords-song | FAIL | preset: tuner not in [chords say card save loop] |
| music-tuner-guitar | pass |  |
| music-metronome-practice | pass |  |
| explain-mongols-geography | pass |  |
| explain-rome-rise-fall | FAIL | drawn: a page with only words :: The fall |
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
| last-page-next-step | FAIL | preset: motion not in [deck page plan choose ask pick form card list sketch row after timeline done now next shapes shape stat say]; need: none of [deck plan] |
| last-page-walkthrough | FAIL | preset: motion not in [deck page plan choose ask pick form card list sketch row after timeline done now next shapes shape stat say]; need: none of [deck plan] |
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
| vis-put-a-card-in | pass |  |
| vis-no-filler-briefing | pass |  |
| vis-three-ideas-one-page | pass |  |
| draw-how-flow | FAIL | preset: motion not in [diagram mock shapes sketch row after card say stat choose ask end part]; need: none of [diagram] |
| draw-how-sequence | pass |  |
| draw-show-screen | pass |  |
| draw-what-checkout-looks | pass |  |
| table-coach-asked-twice | pass |  |
| motion-concept | pass |  |
| motion-work-change | pass |  |
| motion-how-connect | pass |  |
| motion-bug-fix | pass |  |
| motion-plain-fact | pass |  |
| motion-status-line | FAIL | no reply: exit null:  |
| motion-with-quiz | pass |  |
| motion-old-phone | FAIL | app build: the yui plugin did not run (/private/tmp/yui/hermes-plugin/yui): spawnSync python3 ENOENT; need: none of [sketch say card stat timeline shapes] |
| explain-eli5-string-theory | pass |  |
| explain-eli5-black-holes | pass |  |
| explain-eli5-inflation | pass |  |
| explain-how-vaccines-work | pass |  |
| explain-what-is-a-mortgage | pass |  |
| motion-explain-string-theory | pass |  |
| motion-explain-black-hole-forms | pass |  |
| motion-explain-photosynthesis | pass |  |
| motion-explain-stock-market | pass |  |

## Transcripts

### workout-leg-day (pass)

**Chris:** Leg day. I have 40 minutes, home gym.

Good: A short line, then the session to do: the runner `plan` (a page, then per move a sets pick with its reps and weight slides), or a checklist or card with a way to start. No interrogation: he already said time and gear.

````
Five moves, three sets each, done in 40 with warm-up.
```yui
plan "Leg day, 40 min" submit="Log session"
page "Warm up, then go" body="Five minutes: bodyweight squats, band walks, leg swings. Rest about 90 seconds between sets. Dumbbell weights are per hand unless noted."
pick@e1-sets "Goblet squat: sets done" "Set 1"|"Set 2"|"Set 3"|Skip title="Goblet squat" work=40
slide@e1-reps "Goblet squat: reps per set" 1-30 value=10
slide@e1-lb "Goblet squat: weight in lb" 0-50 value=50 step=5 unit=lb
pick@e2-sets "DB Romanian deadlift: sets done" "Set 1"|"Set 2"|"Set 3"|Skip title="DB Romanian deadlift" work=40
slide@e2-reps "DB Romanian deadlift: reps per set" 1-30 value=10
slide@e2-lb "DB Romanian deadlift: weight in lb" 0-50 value=40 step=5 unit=lb
pick@e3-sets "Bulgarian split squat: sets done" "Set 1"|"Set 2"|"Set 3"|Skip title="Bulgarian split squat" work=50
slide@e3-reps "Bulgarian split squat: reps per leg" 1-20 value=8
slide@e3-lb "Bulgarian split squat: weight in lb" 0-50 value=25 step=5 unit=lb
pick@e4-sets "DB hip thrust: sets done" "Set 1"|"Set 2"|"Set 3"|Skip title="DB hip thrust" work=40
slide@e4-reps "DB hip thrust: reps per set" 1-30 value=12
slide@e4-lb "DB hip thrust: weight in lb (one bell)" 0-50 value=50 step=5 unit=lb
pick@e5-sets "Single-leg calf raise: sets done" "Set 1"|"Set 2"|"Set 3"|Skip title="Single-leg calf raise" work=30
slide@e5-reps "Single-leg calf raise: reps per leg" 1-30 value=15
slide@e5-lb "Single-leg calf raise: weight in lb" 0-50 value=25 step=5 unit=lb
choose@feel "Legs after that?" Easy|Solid|Hard|Wrecked
end
save leg day
```
````

### workout-start-runner (pass)

**Chris:** Start my workout.

Good: One line, then the runner plan: a page with the rest, per move a `pick@eN-sets` of Set 1..N and Skip with title= and work=, its reps (or secs) and weight slides, `choose@feel` last. Not the moves as a list, not a deck, not questions about sets.

````
Full body A, 4 moves, about 25 minutes.
```yui
plan "Full body A" submit="Log workout"
page "Full body A" body="Rest about 90 seconds between sets. Brace on every rep."
pick@e1-sets "Goblet squat: sets done" "Set 1"|"Set 2"|"Set 3"|Skip title="Goblet squat" work=40
slide@e1-reps "Goblet squat: reps per set" 1-30 value=10
slide@e1-lb "Goblet squat: weight in lb" 0-50 value=20 step=5 unit=lb
pick@e2-sets "Push-up: sets done" "Set 1"|"Set 2"|"Set 3"|Skip title=Push-up work=30
slide@e2-reps "Push-up: reps per set" 1-30 value=8
pick@e3-sets "Dumbbell row: sets done" "Set 1"|"Set 2"|"Set 3"|Skip title="Dumbbell row" work=40
slide@e3-reps "Dumbbell row: reps per set" 1-30 value=10
slide@e3-lb "Dumbbell row: weight in lb" 0-50 value=20 step=5 unit=lb
pick@e4-sets "Plank: sets done" "Set 1"|"Set 2"|"Set 3"|Skip title=Plank work=30
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
10 minutes, 20 rounds: 20s work, 10s rest, four moves on rotation.

```yui
list "Rotate, 5 laps" "1 DB thrusters, 25 lb" "2 Burpees" "3 Mountain climbers" "4 DB swings, 40 lb"
timer 20/10x20 "Tabata finisher"
save tabata
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
Mom's place works fine; tell me what's around and I'll build it.

```yui
pick "What's at your mom's?" "Nothing, bodyweight"|Dumbbells|Bands|Chair|Stairs|Backpack|"Yard space" +other
```
````

### checkin-morning (pass)

**Chris:** morning check-in

Good: Sleep, soreness and energy as sliders or a short form (quoted title), or a plan that walks them one at a time, or the saved `flow workout-checkin` (it asks the same). Not a wall of questions in text.

````
Morning, Chris. Quick check-in, then I'll shape today's session around school pickup at 2.
```yui
flow workout-checkin
```
````

### checkin-evening-voice (pass)

**Chris:** I want to do an end of day brain dump but I'm too tired to type.

Good: A mic, maybe with +auto. One short line.

````
Talk it out, I'll sort it into tasks, calendar, and notes.
```yui
mic "Brain dump: whatever's on your mind" +auto
```
````

### meal-photo (pass)

**Chris:** [photo attached. Image description: a plate with grilled chicken breast, a cup of white rice, steamed broccoli, and a drizzle of olive oil] lunch

Good: Estimate the macros briefly and offer to log it (ask) or show them as stats. Does not ask for another photo.

````
Solid lunch: lean protein, clean carbs, greens. Logged as an estimate, roughly 6 oz chicken.

```yui
stat 575 "Calories, lunch" 
list Macros "Protein: 58 g" "Carbs: 51 g" "Fat: 14 g"
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
```
````

### today-plan (pass)

**Chris:** What should I do today?

Good: Without calendar access it proposes a shape for the day or asks one thing (energy, top priority) as buttons. Remembers Mick at 2 pm. Not a text essay.

````
No calendar here yet. Draft day built around Mick's 2 pm pickup:

```yui
timeline "Thursday"
now "Workout: 40 min, home gym" at="9:30"
next "Deep work: your top priority" at="10:30"
next "Lunch" at="12:30"
next "Email and errands" at="1:15"
next "Mick out of school" at="2:00"
next "Evening: open" at="5:00"
```
```yui
pick "Also on today?" Calls|"Big project"|Errands|"Home stuff"|"Light day" +other
```
````

### schedule-call (pass)

**Chris:** Set up a call with Matt next week, 30 minutes.

Good: Offer a few slots as buttons (avoiding 1:30 and 2 pm) with +other. One question.

````
I can't see your calendar from here. Pick the Matt and a window, and I'll draft the invite for your OK before it goes out.

```yui
plan "Call with Matt" submit="Draft invite"
form "Which Matt?" name:text email:text
choose "Best days next week?" "Mon–Tue"|"Wed–Thu"|Friday|"Any day" +other
choose "Time of day?" "Morning"|"Early afternoon (before 2)"|"Late afternoon" +other
choose "Format?" Zoom|"Google Meet"|Phone +other
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
card "Haircut" body="Saturday · 11:30 am · confirmed"
```
````

### decision-dinner (pass)

**Chris:** Sushi or tacos tonight? I can't decide.

Good: Either just pick one with a reason, or two big buttons. Short.

````
Tacos: Mick-friendly, quick, and sushi's better saved for a weekend.
```yui
choose "Tonight?" "Tacos, order in"|"Tacos, cook at home"|"Sushi anyway"
```
````

### decision-three-options (pass)

**Chris:** Help me pick which to do first this afternoon: invoice Heathos, reply to Paul about Plannix, or fix the Yui site footer.

Good: A recommendation plus the three as buttons (or an ordered list with +check). No essay.

````
Invoice Heathos first: cash in, quick, before Mick at 2.
```yui
sketch "This afternoon" frame=window
row "1. Invoice Heathos: first" +hi note="money, ~15 min"
row "2. Reply Paul re Plannix: second" note="someone waiting"
row "3. Yui site footer: last" note="nobody blocked"
choose "Order?" "Go with this"|"Paul first"|"Footer first" +other
```
````

### list-groceries (pass)

**Chris:** Make me a grocery list for high protein meals this week.

Good: A list with +check, a title, and items that fit on a phone.

````
High-protein week: roughly 150 g a day, five dinners, plus breakfasts and snacks.

```yui
list Protein "Chicken breast: 3 lb" "Lean ground beef 93%: 2 lb" "Salmon fillets: 4" "Eggs: 2 dozen" "Canned tuna: 4 cans" "Turkey deli slices: 1 lb" +check
list Dairy "Greek yogurt, plain: 2 large tubs" "Cottage cheese: 2 tubs" "Milk: 1 gal" "String cheese: 1 pack" +check
list Produce "Broccoli: 2 heads" "Spinach: 1 bag" "Bell peppers: 4" "Sweet potatoes: 4" "Bananas: 1 bunch" "Berries: 2 boxes" +check
list Pantry "Rice: 2 lb" "Oats: 1 canister" "Black beans: 3 cans" "Whey protein: 1 tub" "Almonds: 1 bag" "Whole-wheat tortillas: 1 pack" +check
save groceries
```
````

### list-packing (FAIL)

**Chris:** Mick has a field trip tomorrow to the science museum. Packing list?

Good: A checklist. One line of text.

- preset: choose not in [list card say]

````
Here's tomorrow's pack for Mick's science museum trip. Check the teacher's note for rules on lunch, money, or shirts.

```yui
list "Mick: field trip" "Permission slip, signed" "Packed lunch, disposable, name on it" "Water bottle" "Snack" "Comfy closed-toe shoes" "School shirt or name tag" "Light hoodie for museum AC" "Labeled backpack" "Any meds, handed to the teacher" +check
choose "Add to tonight?" "Remind me at 7 pm"|"Add lunch to grocery list"|"Neither"
```
````

### data-weight-trend (FAIL)

**Chris:** How's my weight trending? Last 7 days: 181, 180.6, 180.2, 179.9, 180.1, 179.4, 178.9

Good: A stat with a delta and a spark, or a line chart. One line of read-out, not a table in text.

- preset: sketch not in [chart stat card say]
- preset: row not in [chart stat card say]

````
Down 2.1 lb this week, steady drop, one small bump Tuesday.

```yui
stat 178.9lb "Weight today" delta=-2.1 spark=181|180.6|180.2|179.9|180.1|179.4|178.9
chart line "Last 7 days, lb" x=Fri|Sat|Sun|Mon|Tue|Wed|Thu y=181|180.6|180.2|179.9|180.1|179.4|178.9
sketch "Verdict" frame=bubble
row "Pace: about 2 lb a week" +hi note="upper end of healthy"
row "Tuesday bump: water, not fat"
row "Keep: protein high, lifts heavy"
```
````

### focus-second-screen (pass)

**Chris:** Start a 25 minute focus timer, and while it runs let's talk through the Plannix launch checklist.

Good: `>2 timer 25m Focus` (second screen) or a timer, plus the start of the checklist.

````
Focus timer running on screen 2; I don't have the Plannix checklist yet.

```yui
>2 timer 25m Focus
choose "Plannix checklist: where is it?" "I'll paste it"|"Draft one with me"|"In my email"|Notion +other
```
````

### teach-compound-interest (pass)

**Chris:** Explain compound interest to Mick, he's 9. Make it something he can play with.

Good: Something interactive: a calc with sliders, or a short deck with a quiz question.

````
Money that grows babies, and the babies grow babies too. Film first, then sliders Mick can drag.

```yui
motion "Mick, age 9, puts $10 in a piggy bank that pays 10% a year. Year 1: the bank adds $1, now $11. Year 2: it adds 10% of $11, so $1.10, now $12.10. The new money earns money too, like a snowball rolling downhill getting bigger faster. After 20 years, $10 becomes $67 without adding a penny."
calc f="A = P*(1+r)^t" P=1-100@1 r=0-0.5@0.05 t=0-30@1
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
Anytime, Chris. Enjoy the rest of your day with Mick.
````

### plain-explain (pass)

**Chris:** In two sentences, what's a deload week?

Good: Two sentences. No screen: he asked for words.

````
A deload week is a planned easy week, usually every 4–8 weeks, where you cut volume or weight by about 40–50%. It lets joints and nervous system recover so you come back stronger.
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
Three things: Instagram connected through its own login (never your password here), the reel, the caption. You'll see the post before it goes live.

```yui
plan "Yesterday's reel" submit="Draft the post"
page "What happens" points="Connect: Instagram's own login screen"|"Reel: you point me to it"|"Caption: yours or my draft"|"Post: only after you approve"
choose "Where's the reel?" "Camera roll"|"Instagram drafts"|"Google Drive"|"Edit app export" +other
choose "Caption?" "I'll dictate it"|"Draft one for me"|"No caption" +other
choose "When to post?" "Right after I approve"|"Tonight 7 pm"|"Tomorrow morning" +other
end
```
````

### secret-bank (FAIL)

**Chris:** Connect my bank so you can track my spending. What info do you need?

Good: No account, routing, card or PIN fields. Points to a read-only link (Plaid or an export) instead.

- preset: sketch not in [ask choose card list pick form]
- preset: row not in [ask choose card list pick form]
- preset: plan not in [ask choose card list pick form]

````
No passwords or account numbers. You sign in on your bank's own login, and I only get read access to transactions.

```yui
sketch "Ways to connect" frame=window
row "Bank alert emails: forwarded to me" +hi note="easiest, live"
row "Aggregator (Monarch, Copilot): read-only link" note="your bank's login"
row "Monthly CSV export: you drop it in" note="no link at all"
plan "Bank tracking" submit="Set it up"
choose "Which bank?" Chase|"Bank of America"|Wells|Amex +other
choose "How should I see transactions?" "Alert emails"|Aggregator|"Monthly CSV"|"Not sure"
pick "What to track?" "Budget by category"|"Big charges"|Subscriptions|"Weekly summary"
end
```
````

### secret-api-key (pass)

**Chris:** I need to give you the new OpenAI key for the site. Put up a box I can paste it into.

Good: Declines the form, explains where the key goes instead (the environment, not the chat).

````
No paste box for keys: put it straight into the site's environment as `OPENAI_API_KEY`, and I'll handle the rest.

```yui
sketch "New OpenAI key" frame=phone
row "Paste key here: sk-..." +x note="keys never in chat"
after
row "Host settings → Environment → OPENAI_API_KEY" +hi note="safe spot"
row "Redeploy" +button
choose "Where is the site hosted?" Vercel|Netlify|"Server .env" +other
```
````

### no-html-pricing (pass)

**Chris:** Show me a clean pricing table for my three coaching tiers: Starter $500/mo 2 calls, Growth $1,500/mo weekly calls, Partner $4,000/mo unlimited.

Good: A YL table (header row then one row per tier) or three cards. No HTML, no markdown table, no JSON.

````
Three tiers, side by side.
```yui
table "Coaching tiers" Tier|Price|Calls "Starter|$500/mo|2 calls" "Growth|$1,500/mo|Weekly" "Partner|$4,000/mo|Unlimited"
choose "Next for the table?" "Add features per tier"|"Mark Growth as popular"|"Use as is" +other
```
````

### too-much-week (pass)

**Chris:** Plan my whole week: 4 workouts, meals, deep work blocks, errands, and Mick pickups.

Good: Six components or fewer: a compact overview (table or a few cards) or one question to start a flow. Not 15 lines.

````
Pickups locked at 2 pm weekdays; five answers and I'll build the full week.
```yui
plan "Your week" submit="Build my week"
page "Already set" points="Mick pickup: 2 pm, Mon–Fri"|"Gym: dumbbells to 50 lb, bench, bands, pull-up bar"|"Workouts: 4 this week"
pick "Workout days" Mon|Tue|Wed|Thu|Fri|Sat|Sun
choose "Workout time" "6:30 am"|"Noon"|"After pickup" +other
choose "Deep work blocks" "8–11 am"|"9 am–12 pm"|"Two 90-min blocks" +other
choose "Meals" "Sunday prep"|"Cook nightly"|"Mostly delivery" +other
form "Errands" errands:voice
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
Down 2.9 this month. Nice trend.
```yui
~stat 178.8lb delta=-2.9 spark=181|180.2|179.4|178.8
```
````

### patch-plan-card (pass)

**Chris:** Swap Thursday to a rest day, my back is tight.

Good: `~card body="Mon legs, Tue push, Thu rest, Sat conditioning"` plus maybe a slide asking how tight. Not a second card.

````
Thursday's rest. Back first.
```yui
~card body="Mon legs, Tue push, Thu rest, Sat conditioning"
choose "Pull session: where to?" Fri|Sun|"Drop it this week"
```
````

### tap-choice-builds-next (FAIL)

**Chris:** [yui] n1 choose choice=Legs

Good: Builds the next screen right away (the session or the next question). Does not echo 'You chose Legs'.

- preset: plan not in [list card timer ask choose pick slide table query put]
- preset: page not in [list card timer ask choose pick slide table query put]

````
Legs, dumbbells and bench. Five moves, about 40 minutes.
```yui
plan "Leg day" submit="Log session"
page "Warm up, then go" body="Five minutes of bodyweight squats, lunges and leg swings first. Rest about 90 seconds between sets, 2 minutes on split squats."
pick@e1-sets "Goblet squat: sets done" "Set 1"|"Set 2"|"Set 3"|"Set 4"|Skip title="Goblet squat" work=40
slide@e1-reps "Goblet squat: reps per set" 1-30 value=10
slide@e1-lb "Goblet squat: weight in lb" 0-50 value=40 step=5 unit=lb
pick@e2-sets "DB Romanian deadlift: sets done" "Set 1"|"Set 2"|"Set 3"|Skip title="DB Romanian deadlift" work=40
slide@e2-reps "DB Romanian deadlift: reps per set" 1-30 value=10
slide@e2-lb "DB Romanian deadlift: weight per hand in lb" 0-50 value=35 step=5 unit=lb
pick@e3-sets "Bulgarian split squat: sets done" "Set 1"|"Set 2"|"Set 3"|Skip title="Bulgarian split squat" work=45
slide@e3-reps "Bulgarian split squat: reps per leg" 1-20 value=8
slide@e3-lb "Bulgarian split squat: weight per hand in lb" 0-50 value=25 step=5 unit=lb
pick@e4-sets "DB hip thrust: sets done" "Set 1"|"Set 2"|"Set 3"|Skip title="DB hip thrust" work=40
slide@e4-reps "DB hip thrust: reps per set" 1-30 value=12
slide@e4-lb "DB hip thrust: weight in lb" 0-50 value=50 step=5 unit=lb
pick@e5-sets "Single-leg calf raise: sets done" "Set 1"|"Set 2"|"Set 3"|Skip title="Single-leg calf raise" work=30
slide@e5-reps "Single-leg calf raise: reps per leg" 1-30 value=15
choose@feel "How did legs feel?" "Too easy"|"Just right"|"Too hard"|"Something hurt"
end
save workout
```
````

### tap-changed-answer (pass)

**Chris:** [yui] n1 choose choice=Pull changed=true

Good: Adjusts without arguing: swaps the list to a pull session (patch `~list` or a new list). No 'are you sure'.

````
Pull it is, built for your bar and dumbbells.
```yui
~list Pull "Pull-ups 4x6-8" "One-arm DB row 4x10/side" "Band face pull 3x15" "DB rear delt fly 3x12" "Hammer curl 3x12" +check
```
````

### flow-onboard-goal (FAIL)

**Chris:** I want to get back in shape before the holidays. Where do I start?

Good: The first question of a flow as buttons (goal or days per week), or a short plan. Not a 6-field form.

- preset: flow not in [choose ask pick slide plan form card mic page]
- need: none of [choose ask pick slide plan]

````
Start with a quick check-in: about ten weeks to the holidays, so this sets your baseline and fits the training around Mick's 2 pm pickup.
```yui
flow first-plan
```
````

### react-build-it (FAIL)

**Chris:** [yui] react msg=3a6ee9c1-4d97-40dd-901f-e5f0a7db1864 emoji=👍 meaning="build it"
> Want me to set up Saturday? Goblet squats 5x5 with the 50s, then a 20 minute tabata, done by 10.

Good: Builds the Saturday plan right away (a list and/or timer). No confirming question, no echo of the reaction.

- preset: pick not in [list timer say card plan stat page]
- preset: slide not in [list timer say card plan stat page]
- preset: choose not in [list timer say card plan stat page]

````
Saturday's set: goblet squats 5x5 at 50 lb, then a 20-minute tabata, done by 10.
```yui
plan "Saturday legs" submit="Log it"
page "Squats, then tabata" body="Warm up 5 minutes. Rest about 90 seconds between squat sets. Tabata follows: 20 seconds on, 10 off, 40 rounds."
pick@e1-sets "Goblet squat: sets done" "Set 1"|"Set 2"|"Set 3"|"Set 4"|"Set 5"|Skip title="Goblet squat" work=40
slide@e1-reps "Goblet squat: reps per set" 1-30 value=5
slide@e1-lb "Goblet squat: weight in lb" 0-100 value=50 step=5 unit=lb
choose@feel "Saturday legs: how did it feel?" Easy|Solid|Hard|Wrecked
end
save saturday
timer 20/10x40 "Saturday tabata"
save tabata
menu shortcut "Start Saturday's workout"
```
````

### react-not-sure (FAIL)

**Chris:** [yui] react msg=0f1d2c3b-4a59-4687-9a0b-1c2d3e4f5a6b emoji=🤔 meaning="not sure"
> I can move your Tuesday call to Wednesday at 3 and book the gym at 5 on Tuesday instead.

Good: Asks the first of a few short questions as one screen (a choose or ask), not a form and not a wall of questions.

- preset: plan not in [choose ask pick say slide]

````
Three quick ones, then I'll rebuild the week.
```yui
plan "Sort the week" submit="Fix my week"
pick "What's making it a mess?" Calls|Workouts|"Mick pickup at 2"|Errands +other
choose "Tuesday call: where?" "Wed 3 pm"|"Keep Tue"|"Another day" +other
choose "Gym: best slot?" "Early morning"|Midday|"Tue 5 pm"|"Skip this week" +other
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
Dropped.
```yui
sketch "Follow-ups" frame=bubble
row "Nudge the 3 silent contacts" +x note="dropped"
```
````

### dead-status-report (pass)

**Chris:** Give me the overnight report on screen. Facts: backups ran at 3:10, all 4 sites up, 2 renewals due Friday (yuigui.com, postscarcity.ai), no errors.

Good: The report as a card, list or stats. The renewals may get a real action ("Renew both"). No "Got it" or "OK" button: a card with nothing to act on has no cta.

````
Quiet night. One thing due Friday.
```yui
sketch "Overnight" frame=window
row "Backups: ran 3:10"
row "Sites: 4 of 4 up"
row "Errors: none"
row "Renewals: 2 due Friday" +hi note="yuigui.com, postscarcity.ai"
choose "Renew both domains?" "Renew now"|"Remind Thursday"|"Leave it"
```
````

### dead-logged-water (pass)

**Chris:** Log 2 liters of water for today.

Good: Confirms in a line or a stat. Nothing to tap unless it does something ("Add 500 ml"); never a lone "Nice" or "Got it".

````
Water logged: 2 L today.
```yui
table create water Date:text Liters:number
put water 2026-09-24 Date="Sep 24" Liters=2
stat 2L "Water today"
```
````

### dead-plan-submit (pass)

**Chris:** Walk me through planning a weekend trip: where, budget, and dates. I'll answer on screen.

Good: A plan with one step per question, ending in a submit named for what happens ("Send", "Plan it", "Find trips"), not "Create project".

````
Three questions, one screen each; I'll draft the trip from your answers.
```yui
plan "Weekend trip" submit="Draft the trip"
choose "Where to?" "Florida Keys"|Orlando|"St. Augustine"|Naples|Bahamas +other
slide "Budget, all in" 300-3000 value=1000 step=100 unit=$
choose "Which weekend?" "This weekend"|"Next weekend"|"In two weeks" +other
choose "Leave when?" "Fri after 2 pm pickup"|"Sat morning" +other
end
```
````

### flow-findings-then-questions (pass)

**Chris:** Here are this morning's notes on the site review: the pricing page loads in 4.1 seconds on a phone, mostly two uncompressed hero images; the signup form drops the UTM tags; and the new FAQ block gets the most clicks after the hero. Walk me through what you found, then ask me what to fix first and whether to ship today or tomorrow.

Good: One plan: a page per finding with a real sentence or points, then 'fix first' and 'ship when' as questions, one submit. Not a deck followed by separate questions.

````
Site review: slow pricing page, lost UTMs, FAQ is a winner.

```yui
plan "Site review" submit="Queue the fix"
page "Pricing page: 4.1 s on a phone" body="Most of the wait is two uncompressed hero images. Compressing them is the quickest win on the list."
sketch "Pricing page" frame=phone
row "Hero image 1: uncompressed" +x note="slow"
row "Hero image 2: uncompressed" +x note="slow"
row "Load on phone: 4.1 s" +hi note="too long"
page "Signup form: UTM tags dropped" body="Visitors arrive with campaign tags, but the form loses them on submit. Signups can't be traced back to the campaign that brought them."
sketch "Signup form" frame=phone
row "Arrives: ?utm_source=newsletter" +hi
row "Submit" +button
row "Saved lead: no source" +x note="tags lost"
page "FAQ block: second most clicked" body="After the hero, the new FAQ block gets the most clicks. It's working and could sit higher on the page."
sketch "Click ranking" frame=phone
row "1. Hero"
row "2. FAQ block" +hi note="new, pulling"
row "3. Everything else"
choose "Fix first?" "Compress hero images"|"Keep UTM tags"|"Move FAQ higher" +other
choose "Site fixes: ship when?" Today|Tomorrow
end
```
````

### flow-two-questions-one-plan (pass)

**Chris:** Before you write my new program I want to look over what you changed from last month. You moved squats to Monday, cut the Friday run to 20 minutes, and added a deload in week 4. Show me that, then ask me how many days I can train and what equipment I have now.

Good: One plan: pages with the three changes, then days per week and equipment as steps, one submit.

````
Last month's three changes, then two questions for the new program.

```yui
plan "New program" submit="Build my program"
page "What changed last month" body="Three changes from the month before: squats on Monday, a shorter Friday run, and a lighter week 4."
sketch "Last month" frame=window
row "Squats: Monday" +hi note="moved"
row "Friday run: 20 min" +hi note="cut"
row "Week 4: deload" +hi note="added"
choose "Training days per week?" 2|3|4|5|6
pick "Equipment now" "Dumbbells to 50 lb"|Bench|Bands|"Pull-up bar" +other
end
```
````

### save-reusable-workout (pass)

**Chris:** Give me a quick 20 minute Tabata I can come back to on busy days.

Good: A Tabata timer (it takes the stage on its own) and a `save` with a short name so it lands on the shelf. No re-asking what they want.

````
Busy-day Tabata: four 4-minute blocks, 1 min rest between, about 19 minutes. Run the timer once per block.

```yui
list "Busy-day Tabata" "Goblet squat: 35–50 lb" "Push-ups: knees after round 5 if needed" "Renegade rows: 20–25 lb" "Burpees: full pace" +check
timer 20/10x8 Tabata
save tabata
menu shortcut "Start busy-day Tabata"
```
````

### show-saved-workout (pass)

**Chris:** Slammed again today. Pull up my busy day workout.

Good: `show busy-day` (the name it saved), one short line, no re-sent timer.

````
Busy-day Tabata, 20 minutes, ready when you are.
```yui
show busy-day
```
````

### keep-list-on-page (pass)

**Chris:** I'm cooking bibimbap tonight. Keep the shopping list somewhere I can see it while we work out the recipe: eggs, spinach, rice, gochujang, carrots.

Good: `>2 list@shop Shopping Eggs|Spinach|Rice|Gochujang|Carrots +check` so the list stays on a page beside the chat, then the recipe in the chat.

````
Shopping list is pinned on screen 2; protein shapes the rest.
```yui
>2 list@shop Shopping Eggs Spinach Rice Gochujang Carrots +check
choose "Bibimbap protein?" Beef|Tofu|Mushrooms|"Egg only" +other
```
````

### project-timeline (pass)

**Chris:** Where are we on the site rebuild? We shipped the new hero Monday and the pricing page Tuesday, the blog migration is running now, and the contact form and analytics are next. Show me.

Good: One `timeline` with the two shipped items as `done` rows (at=Mon, at=Tue), the blog migration as `now`, then the contact form and analytics as `next`, in that order. At most a short line of chat and maybe one question about what to pull next.

````
Two shipped, blog migrating, two queued.
```yui
timeline "Site rebuild"
done "New hero" at="Mon Sep 21"
done "Pricing page" at="Tue Sep 22"
now "Blog migration"
next "Contact form"
next "Analytics"
```
````

### patch-timeline-move (pass)

**Chris:** Blog migration just finished.

Good: A patch that turns the running row done in place (`>2 ~now kind=done at=Fri` or `~blog kind=done`), not the timeline sent again. Starting the contact form is optional; if it does, it patches that row by its id.

````
Blog migration: done.
```yui
>2 ~now kind=done at=Thu
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
````

### mention-asked (pass)

**Chris:** [yui] mention from=yui by=person msg=m1
Yui's thread, just before:
> Person: Plan a leg day for Saturday, my knee is a bit sore
> Yui: Here's Saturday: back squats 5x5, walking lunges, then a 20 minute tabata. [screen]
@Arnold does this fit my knee?

Good: Answers the knee question about that exact plan (swap the squats and lunges for knee-friendly moves), in a few words. Doesn't ask to see the plan and doesn't repeat the quote.

````
Not quite. Squats and lunges load a sore knee, and you have no barbell. Swap in hip-led moves and stop at pain 3 of 10.
```yui
sketch "Saturday legs, knee-friendly" frame=bubble
row "Back squat 5x5" +x note="no barbell, deep bend"
row "Walking lunges" +x note="knee shear"
row "Tabata with jumps" +x note="impact"
after
row "Goblet box squat 3x10" +hi note="depth you control"
row "DB Romanian deadlift 3x10" +hi note="hips, not knees"
row "Tabata: band rows, planks, glute bridges" +hi note="no jumping"
```
```yui
choose "Saturday legs: use the knee-friendly version?" "Swap all"|"Keep goblet squats only"|"Keep Yui's plan" +other
```
````

### mention-notes-context (FAIL)

**Chris:** [yui] note: in this thread the person asked Arnold, not you: @Arnold does this fit my knee?
[yui] note: Arnold answered here: Swap back squats for box squats and lunges for glute bridges. Keep the tabata.
Ok, update my Saturday plan with that.

Good: The Saturday plan again with Arnold's swaps in it (box squats, glute bridges, the tabata kept), on screen. No questions about what Arnold said.

- preset: choose not in [list card timer ask plan table sketch row after]

````
I can't find your Saturday plan in my notes. These are Arnold's swaps, ready to apply:

```yui
sketch "Saturday, knee-friendly" frame=bubble
row "Back squats" +x note="knee load"
row "Lunges" +x note="knee load"
after
row "Box squats" +hi note="swap in"
row "Glute bridges" +hi note="swap in"
row "Tabata: kept"
choose "Saturday plan: where is it?" "Rebuild it with these"|"I'll paste it"|"Saved on Yui" +other
```
````

### report-card-done (pass)

**Chris:** The worker just finished card INT-18 on the board. Its handoff summary: "A2A bridge: add any A2A agent to Yui by its Agent Card. node adapters/a2a/yui-a2a.ts pair <code> --card <url>, then run; add --card <url> puts more agents on the same machine. Runtime-neutral TypeScript client (src/a2a.ts + src/sse.ts, fetch and an SSE parser only, so the hosted step runs the same code in a Durable Object): A2A 1.0 SendMessage / SendStreamingMessage / SubscribeToTask / GetTask / CancelTask and 0.3 message/send, message/stream, tasks/resubscribe, tasks/get, one version-free shape for callers. The bridge keeps the relay's rules (delivered on pickup, handled after the answer, outbox on disk, one turn at a time per agent). Tests: client.test.ts 42/42; sdk_interop.test.ts 4/4 against the official a2a-sdk servers (1.1.5 and 0.3.26); a2a_e2e.py 66/66 live on throwaway accounts (kill -9 mid-task resumes the same task and answers once) plus the phone run 6/6 on the iPhone 18 Pro sim. No app binary change (INT-18)" Tell me what shipped.

Good: One short line, a card with the headline (A2A agents can join Yui), and the detail as a deck of short pages (what it does, how to add one, the test counts as points). No paragraph relaying the summary.

````
The A2A bridge shipped: any A2A agent joins Yui from its Agent Card.
```yui
card "A2A bridge" body="Add any A2A agent to Yui by its Agent Card. No app update needed."
deck "What shipped" +inline
page "Adding an agent" body="Pair the bridge with a code and point it at the agent's card, then run it. Each extra card adds one more agent on the same machine."
page "One client, both versions" points="A2A 1.0: send, stream, resume, get, cancel"|"A2A 0.3: same calls, older names"|"Callers see one shape for both"|"Same code runs hosted"
page "Same rules as the relay" points="Delivered on pickup"|"Handled after the answer"|"Outbox saved on disk"|"One turn at a time per agent"
page "Tested" points="Client: 42/42"|"Official A2A servers: 4/4"|"Live end to end: 66/66"|"Phone run: 6/6"|"Crash mid-task: resumes, answers once"
choose "What next?" "Pair an agent now"|"Run it hosted"|"Next card"
end
```
````

### report-long-walkthrough (pass)

**Chris:** Walk me through everything that changed in how Yui delivers messages this week: replies are exactly-once both ways with acks, a reply outbox on disk, presence reads online/asleep/offline per agent, pushes skip a phone already watching the thread, agents can be muted, and a paired agent whose gateway never started now says 'not listening yet' with the restart command.

Good: A deck (or plan) of short pages, one change per page, under one short chat line. Not a long bulleted or prose message.

````
Six delivery changes this week, in one film.

```yui
motion "Yui message delivery, six changes this week. Replies now arrive exactly once in both directions: each side acks, and unacked replies wait in an outbox on disk until delivered. Each agent shows presence: online, asleep or offline; pushes skip a phone already watching that thread, and any agent can be muted. A paired agent whose gateway never started now reads 'not listening yet' with the restart command."
choose "Next?" "Test exactly-once"|"Mute an agent"|"See the restart command" +other
```
````

### talk-keep-plan-editable (pass)

**Chris:** Lay out my runs for this week somewhere I can keep looking at it, and I'll tell you what to change as the week goes.

Good: The week on a page (`>2 list@runs Runs "Tue 5k"|"Thu 5k"|"Sat 10k" +check`) with `>2 talk` so they can type changes right there, and one short line in the chat.

````
Runs on screen 2. Mornings before the heat, done before Mick's 2 pm pickup. Type changes there anytime.

```yui
>2 timeline "Runs this week"
>2 now "Easy 30 min, conversational" at="Thu 6:30a"
>2 next "Rest: 10 min mobility" at=Fri
>2 next "Long run 60 min, slow" at="Sat 6:00a"
>2 next "Easy 25 min + 4 strides" at="Sun 6:30a"
>2 save this week
>2 talk
menu shortcut "This week's runs" show="this week"
```
````

### talk-typed-on-screen (pass)

**Chris:** [yui] screen=2
Make Thursday a swim instead.

Good: Patches the list on screen 2 by preset name (`~list "Tue 5k easy" "Thu swim" "Sat 10k long" +check`), at most a short line. Does not re-send the list or explain the tag.

````
```yui
>2 ~list Week "Tue 5k easy"|"Thu 30 min swim"|"Sat 10k long" +check
>2 say Thursday: swim.
```
````

### report-draw-change (pass)

**Chris:** What changed in how you word your updates to me? You used to write things like "Parked YUI-83, feedback #2291 attached". Now you just say what the card is, like "Parked the drawing card, your note is on it". Show me the difference, don't describe it.

Good: One short line and a `sketch` (a bubble fits) with the old wording struck out (+x) and the new wording highlighted (+hi), ideally split with `after`, a note or two. No paragraph explaining it.

````
Plain words now: what the card is, not its id.
```yui
sketch "Updates to you" frame=bubble before=Then
row "Parked YUI-83, feedback #2291 attached" +x note="ids mean nothing"
after Now
row "Parked the drawing card, your note is on it" +hi note="says what it is"
```
````

### draw-screen-fix (pass)

**Chris:** The build-ready screen shows the headline, two lines of notes, then a Got it button and an Install button. Which of those should go, and why? Show me on the screen itself.

Good: A `sketch` of the screen (frame=phone) with the headline and notes as rows, Got it as a +button row struck out (+x) with a short note (it does nothing), Install as a +button row highlighted. At most a line of chat.

````
Got it goes: it only acknowledges, so the tap does nothing. Install stays.

```yui
sketch "Build ready" frame=phone before=Now
row "Build 82 is ready"
row "A2A agents can join"
row "Tests: 66/66 pass"
row "Got it" +button +x note="does nothing"
row "Install" +button
after Fixed
row "Build 82 is ready"
row "A2A agents can join"
row "Tests: 66/66 pass"
row "Install" +button +hi note="the one real action"
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
page "Cards in plain words" body="A card is named for what it is, so nothing needs decoding."
sketch frame=bubble before=Before
row "Parked YUI-83 in the backlog" +x note="an id means nothing"
after After
row "Parked the drawing card in the backlog" +hi note="plain words"
page "Long updates as pages" body="A big update is a headline, then short pages you swipe."
sketch frame=phone before=Before
row "Build 82 is ready. A2A bridge added, pair it with node yui-a2a.ts, client tests 42/42, interop 4/4, e2e 66/66..." +x note="wall of text"
after After
row "Build 82: Add any A2A agent" +hi note="headline card"
row "Page 1: A2A agents  ·  Page 2: Tested" +button note="swipe through"
page "No 'Got it' buttons" body="Every button does something; a card with nothing to act on has none."
sketch frame=bubble before=Before
row "Build 82 is ready" 
row "Got it" +button +x note="does nothing"
after After
row "Build 82 is ready" 
row "Open TestFlight" +button +hi note="real action"
choose "What next?" "See a real update"|"Tweak one rule"|"Why do you ask?" +other
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
Draft ready: same moves, half the sets, lighter weights, every session done before Mick's 2 pm pickup.
```yui
card "Deload rules" body="Half the sets · 60% of usual weight · stop 3 reps shy · 30 min max"
list "Deload week" "Mon: full body, light" "Tue: walk 30 min" "Wed: upper, light" "Thu: mobility 20 min" "Fri: lower, light" "Sat: easy walk or bike" "Sun: rest"
choose "Deload start?" "Next Monday"|"This Monday"|"Tweak first" +other
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
Five mornings at 7:00, done by 8: easy early, sharp Tuesday, taper to race.
```yui
timeline "Race week runs"
next "Easy 30 min, chatty pace" at="Mon 7:00"
next "Sharp: 4x3 min at 10k pace, 2 min jog" at="Tue 7:00"
next "Easy 25 min" at="Wed 7:00"
next "Easy 20 min + 4 strides" at="Thu 7:00"
next "Shakeout 15 min or rest" at="Fri 7:00"
next "10k race" at=Sat
```
````

### group-lead-hands-on (FAIL)

**Chris:** [yui] group "Race week" thread=g1 with=urza,arnold lead=urza hop=0 from=person msg=m1
My 10k is Saturday. Block my week: calls after 10, errands Wednesday at 4, and get the training runs set.

Good: Blocks the week (calls after 10, errands Wednesday 4 pm) on screen, and hands the training runs to @arnold in one plain sentence instead of writing a training plan itself.

- preset: sketch not in [list table card plan timeline ask choose step done now next]
- preset: row not in [list table card plan timeline ask choose step done now next]

````
Week drafted, not booked yet; @arnold, please set Chris's training runs for Thu–Fri mornings before 10, tapering into Saturday's 10k.
```yui
sketch "Race week, Sep 24–30" frame=window
row "Mornings: runs before 10" note="Arnold's plan"
row "Calls: after 10 am, daily"
row "Mick pickup: 2 pm, school days"
row "10k: Sat Sep 26" +hi note="race day"
row "Errands: Wed Sep 30, 4 pm"
row "Calendar: not connected" +hi note="nothing booked yet"
choose "Calendar to book into?" Google|iCloud|Outlook +other
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
Right after the call, around 8:15 am, before the Florida heat; evening works if the call runs long.
```yui
choose "Thursday run: when?" "8:15 am, after call"|"6:30 pm, after school"|"5:45 am, before call" +other
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
Cold air still holds heat; the pump squeezes it out and concentrates it indoors.
```yui
motion "A heat pump moves heat, it doesn't make it. Outside, refrigerant colder than the winter air (even at 20°F) soaks up heat and evaporates. The compressor squeezes that vapor, raising it to about 120°F. Indoors it releases that heat into the house and condenses, then an expansion valve drops its pressure and it flows back outside to repeat. One unit of electricity moves about three units of heat."
```
````

### idea-shapes-flywheel (pass)

**Chris:** Explain the flywheel idea for Yui in one picture: more people use it, we see which screens agents reach for, the good ones become presets, agents get better, more people use it.

Good: A `shapes` loop (placed with at= or a row with arrows back to the start) with a caption, maybe one +pulse. Words kept to a line.

````
The loop: usage teaches us which screens matter, and presets make every agent better.

```yui
shapes "Yui flywheel" caption="More people use it, we see which screens agents reach for, the best become presets, agents get better, more people use it."
shape@users circle "More people" at=5,1 +grow
shape arrow bend=0.3
shape@seen box "Screens agents use" at=8,3 tone=lavender
shape arrow bend=0.3
shape@presets pill "Best become presets" at=5,5 +fill tone=mint +pulse
shape arrow bend=0.3
shape@agents box "Agents get better" at=2,3 tone=butter
shape arrow from=agents to=users bend=0.3
```
````

### teach-one-screen (pass)

**Chris:** Explain compound interest to me. Show me the math and let me play with the numbers.

Good: One short line, then `>full` and ONE deck: a page per idea, the diagram, math, chart and stat each right after its page as its picture, a quiz, the calc on the last page. Nothing loose in the chat or on the stage beside the deck, no `close` after it.

````
Your interest earns interest. Here it is, then slide the numbers yourself.

```yui
>full
deck "Compound interest"
page "Money that grows on itself" body="Year one, $100 earns $10. Year two, you earn on $110, not $100. The extra keeps stacking."
shapes caption="Each year's interest joins the pile and earns too."
shape circle $100 +grow
shape arrow
shape blob $110 tone=mint
shape arrow
shape blob $121 +pulse tone=mint
page "The formula" body="A is what you end with. P is what you put in. r is the yearly rate. t is the years."
math A = P(1 + r)^t \\ A = 100(1 + 0.10)^2 \\ A = 100 \times 1.21 = 121
page "It bends upward" body="Simple interest climbs in a straight line. Compound curves away from it."
chart line "$100 at 10% a year" x=Y0|Y10|Y20|Y30 y=100|259|673|1745
choose "Which lever grows it fastest?" "More time"|"A bigger deposit"|"A tiny bit more rate" answer="More time"
page "Try it" body="Slide the deposit, rate and years. Watch A move."
calc f="A = P*(1+r)^t" P=100-10000@100 r=0-0.2@0.01 t=0-40@1
end
```
````

### library-flow-intake (pass)

**Chris:** A new client just sat down with me, she wants a website for her bakery. Walk her through everything you need from her, on my phone.

Good: One short line and `flow website-intake`: the saved intake flow asks everything, branching on their answers. Not a hand-built plan of the same questions.

````
Hand her the phone. One question a screen, she can skip anything.
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
Let's build your brief. One question a screen.
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
0.3.2 is building. Keys and chords hit TestFlight in about 40 minutes. Faster Send waits for the next one.
```yui
shapes "0.3.2" caption="On TestFlight in about 40 min"
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
doing "Looking at the board" 3/3
```
Two calls, two replies, one ship call.
```yui
sketch "Today" frame=window
row "10:00  Dana call, 30 min"
row "2:00  Mick out of school"
row "4:00  Design review"
row "Sam: venue contract" +hi note="reply today"
row "Invoice question" +hi note="reply today"
row "Ship 0.3.3 without the tuner?" +hi note="waiting on you"
```
```yui
choose "0.3.3: ship without the tuner?" "Ship it"|"Wait for tuner"|"Show me the diff" +other
```
````

### music-jam-beat (pass)

**Chris:** Trying to get back into drumming. Give me a simple boom bap beat around 90 I can mess with.

Good: One `loop` line near 90 BPM with a boom bap pattern in `p=` that plays (`+play`), a short line at most. No pattern written out in words, no drum tab, no advice paragraph.

````
Boom bap at 90, kick and snare plus eighth-note hats.

```yui
loop 90 "Boom bap" rows=kick|snare|hat p=x....x..|..x...x.|xxxxxxxx +play
```
````

### music-finger-drums (pass)

**Chris:** Waiting on a call. Let me just tap out some drums on my phone for a minute.

Good: One `drums` line (2x2 or 4x4), a few words at most.

````
Pads up. Tap away.
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
Phase one: answers go full screen, chat moves aside.
```yui
motion "Yui phase one, the full-screen change. Answers now play as full-screen chunks, one at a time. The chat becomes the record, opened from the top right. Bottom right: a bigger mic, a T that opens the text field, and a + for attachments, including images. Top left: a hamburger for settings, beside the agent picker."
choose "Phase one: next?" "Draw the screen"|"Change something"|"Phase two" +other
```
````

### show-new-layout (FAIL)

**Chris:** Show me the bigger microphone. Does the text field look better? I want to see the new layout of big microphone, T for text and + to attach. Remember, I want you to show me this. (What you know: phase one of the full-screen change. Answers play as full-screen chunks, and the chat is just the record, top right. Bottom right: a bigger mic, a T that opens the text field, and a + for attachments, including images. Settings sit behind a hamburger at top left, beside the agent picker.)

Good: The bottom bar drawn: `sketch frame=phone` with `+button` rows for +, T and the big mic, ideally before and after (the old always-there field struck out). Not a description of it (feedback AL1My-stUBnvtXD2WKV7ec8).

- preset: mock not in [say card deck plan page sketch row after shapes shape image end choose ask pick]
- preset: part not in [say card deck plan page sketch row after shapes shape image end choose ask pick]

````
Text field: hidden until T. Cleaner bar, bigger mic.

```yui
mock "Phase one: new layout" frame=phone
part nav "☰   Yui ▾" back="" 
part button Chat
part card "Answer plays here, full screen"
part row "+        T        🎤" +hi
sketch "Bottom bar" frame=phone before=Then
row "+   Say something nice...   Mic" +button +x note="field always open"
after Now
row "+      T      🎤 MIC" +button +hi note="big mic, T opens field"
row "Type here...   Send" +button note="only after T"
```
````

### music-keys-scale (pass)

**Chris:** Learning piano again. Give me something to noodle around A minor pentatonic on.

Good: One `keys Am pentatonic` line (a title or +send is fine), a short line at most. No list of note names, no fingering advice paragraph.

````
A minor pentatonic, locked to the scale: nothing sounds wrong.
```yui
keys Am pentatonic +send
loop 80 "Slow groove" p=x...x...|....x...|........|x.x.x.x. +play
```
````

### music-chords-song (FAIL)

**Chris:** I want to strum along to one of those four chord pop songs on my uke. G is a good key for me.

Good: One `chords` line in G (`chords G I-V-vi-IV` or `chords G|D|Em|C`), a short line at most. No chord names in a paragraph, no chord diagrams in text.

- preset: tuner not in [chords say card save loop]

````
G, I-V-vi-IV: G, D, Em, C. Strum down-down-up-up-down-up.

```yui
chords G I-V-vi-IV +send
tuner ukulele
```
````

### music-tuner-guitar (pass)

**Chris:** Just restrung my acoustic and it sounds awful. Help me get it in tune.

Good: One `tuner guitar` line, a short line at most. No list of string notes and frequencies, no advice on tuning by ear.

````
New strings stretch for a day or two, so tune, gently tug each string, then tune again.
```yui
tuner guitar
```
````

### music-metronome-practice (pass)

**Chris:** Working on my strumming timing. I want to practice slow, like 70 bpm in 4/4.

Good: One `metronome 70` line (beats=4 is fine), a short line at most. No paragraph of practice tips, no counting in words.

````
Click at 70; strum down on every beat, then add upstrokes between.

```yui
metronome 70
chords G I-V-vi-IV +send
```
````

### explain-mongols-geography (pass)

**Chris:** All right, can you give me a brief geographic explanation of the Mongols?

Good: One line with the answer, then one deck on `>full` where every page has its picture: the empire as a `map` (its outline in lat,lon points, Karakorum as a pin, routes east and west), the size as a `chart` or a `stat`. Not pages of text, and not the steppe drawn as dots in `shapes` (TestFlight feedback AJIE1_1Ru1V4EMgmpWZtniI: 'It's just a text bomb'; feedback AL2nKEYo on the shapes version: 'Again, not bad but this should be a Map').

````
Steppe riders from Mongolia who built the biggest land empire ever, Korea to Hungary.

```yui
>full
deck "The Mongols, by the map"
page "Home: the steppe" body="Open grassland between the Siberian forest and the Gobi. Horses, herds, endless room to ride. Karakorum became the capital."
map caption="Grass for horses meant armies that moved fast and lived off the land."
area Homeland MN tone=mint
pin@ka Karakorum 47.2,102.8 +pulse
page "How far it reached" body="Under Genghis Khan and his heirs, Korea to Hungary, the Siberian forest to Persia."
map caption="Karakorum sat in the middle and rode out every way."
area "Mongol Empire" 53,140|43,131|34.7,126.5|22.3,114|24,98|34,70|25.5,57|33,44|41,31|46,30.5|54,23|60,56|55,95 tone=butter
area Raided PL|HU +dash
pin@ka Karakorum 47.2,102.8 +pulse
route East ka|37.6,127 +arrow
route West ka|50.4,30.5 +arrow
page "The biggest one on land" body="At its peak in 1279: 24M km², about a sixth of Earth's land."
chart bar "Land empires, million km²" x=Mongol|Russian|Qing|Roman y=24|22.8|14.7|5
page "Then it split in four" body="By the 1260s, four khanates, each run by a branch of Genghis's family."
map caption="China, Russia's steppe, Central Asia and Persia each went their own way."
area Yuan 53,125|40,130|34.7,126.5|22.3,114|21,100|28,97|36,90|45,88|50,100 tone=butter
area "Golden Horde" 58,50|56,60|52,70|45,70|42,55|43,45|46,35|48,28|54,32|58,40 tone=mint
area Chagatai 50,75|45,90|38,90|35,75|38,62|45,60 tone=lavender
area Ilkhanate 41,44|38,60|35,70|28,62|25.5,57|30,48|33,40|37,35|40,40 tone=mute
choose "What next?" "How they won so fast"|"Why it fell apart"|"Quiz me"|"Make it Mick-sized" +other
end
```
````

### explain-rome-rise-fall (FAIL)

**Chris:** Give me the quick version of how the Roman Empire rose and fell.

Good: A line, then a picture per part: the empire at its peak as a `map` around the Mediterranean, its size over the centuries as a `chart` (or a `timeline` on the stage), the split as an east and west area. No page that is only a heading and a paragraph.

- drawn: a page with only words :: The fall

````
Rome grew from one city to the whole Mediterranean, then split; the West fell in 476, the East lasted until 1453.
```yui
>full
deck "Rome, rise and fall"
page "The rise" body="A republic from 509 BC. It took Italy, beat Carthage by 146 BC, then Caesar's wars and Augustus made it an empire in 27 BC."
chart area "Roman land, million km² (approx.)" x="264 BC"|"146 BC"|"50 BC"|"AD 117"|"AD 390"|"AD 480" y=0.3|0.8|1.95|5|4.4|1.4
page "The peak, AD 117" body="Under Trajan it ran from Britain to Mesopotamia, with the Mediterranean as a Roman lake."
map caption="Rome at the center, Constantinople the later second capital."
area "Roman Empire, AD 117" 55,-4|55,-1|51,4|50,8|48,12|48,17|48,22|47,28|45,30|44,40|41,44|37,46|33,44|30,48|29,35|24,32|31,25|30,19|32,10|33,0|36,-6|37,-9|42,-9|43,-2|47,-3|50,-5 tone=butter
pin@rome Rome 41.9,12.5 +pulse
pin@con Constantinople 41,29
page "The fall" points="Overstretch: too much border to hold"|"Civil wars: 26 emperors in 50 years, AD 235-284"|"Money: debased coins, heavy taxes"|"Split: East and West, AD 395"|"West: Goths sack Rome 410, last emperor out 476"|"East: Byzantium, until 1453"
choose "What next?" "Why the East survived"|"Rome's best emperors"|"A kid version for Mick" +other
end
```
````

### explain-monsoon-how (pass)

**Chris:** Why does India get monsoons? Keep it short.

Good: One line, then one `motion` line whose ask carries the facts, and at most one `choose` after it. No deck, no shapes standing in for the film.

````
Land heats faster than sea, so summer winds flip and haul ocean moisture in.
```yui
motion "Summer: India's land heats far faster than the Indian Ocean, so hot air rises over land and low pressure forms. Moist ocean air rushes in from the southwest, hits the Western Ghats and Himalayas, rises, cools and drops heavy rain, June to September. Winter: land cools, winds reverse to the northeast, and it turns dry."
```
````

### where-trip-route (pass)

**Chris:** Thinking about a train trip from Lisbon to Barcelona with stops in Porto and Madrid. How does that route go?

Good: One line, then a map: pins on Lisbon, Porto, Madrid and Barcelona, a route through them with an arrow, a caption with the rough hours (a small `table` of the legs beside it is fine). Not a numbered list of legs in words.

````
Lisbon up to Porto, north to Vigo, east to Madrid, then Barcelona. No direct Porto to Madrid train, so Vigo is the hinge.

```yui
map "Lisbon to Barcelona by rail" caption="Porto sits north, so the line bends up through Galicia before Madrid."
area Iberia PT|ES tone=mute
pin@li Lisbon 38.72,-9.14
pin@po Porto 41.15,-8.61
pin@vi Vigo 42.24,-8.72 +pulse
pin@ma Madrid 40.42,-3.70
pin@ba Barcelona 41.39,2.17
route "The line" li|po|vi|ma|ba +arrow
list Legs "Lisbon to Porto: ~3h, Alfa Pendular" "Porto to Vigo: ~2.5h, Celta" "Vigo to Madrid: ~4.5h, high speed" "Madrid to Barcelona: ~2.5h, AVE/Ouigo/Iryo"
choose "Next for the trip?" "Plan the days"|"Rough fares"|"Skip Porto, faster way"
```
````

### where-delivery-area (pass)

**Chris:** Our farm delivers CSA boxes across Vermont, New Hampshire and western Massachusetts. Can you show a new customer what that covers?

Good: One line, then a map with the delivery area filled in (VT and NH by code, western Massachusetts as lat,lon points) and the farm or the big towns as pins. Not a list of states and counties.

````
Delivery zone: all of Vermont and New Hampshire, plus western Mass.
```yui
map "Where we deliver" caption="All of Vermont and New Hampshire, plus western Massachusetts."
area Vermont 45.01,-73.34|45.01,-71.50|44.3,-71.75|43.6,-72.3|42.73,-72.46|42.73,-73.26|43.6,-73.35 tone=mint +fill
area "New Hampshire" 45.30,-71.08|43.08,-70.70|42.87,-70.82|42.70,-71.25|42.73,-72.46|43.6,-72.3|44.3,-71.75|45.01,-71.50 tone=butter +fill
area "Western Mass" 42.73,-72.46|42.72,-72.25|42.03,-72.25|42.05,-73.49|42.73,-73.26 tone=lavender +fill
pin Burlington 44.48,-73.21
pin Concord 43.21,-71.54
pin Northampton 42.33,-72.64
choose "Delivery map: next?" "Add our farm pin"|"Add a ZIP check"|"Adjust borders" +other
```
````

### where-quick-country (pass)

**Chris:** Where exactly is Kyrgyzstan?

Good: One line (Central Asia, between Kazakhstan and China) and a map in the chat: KG as an area with a pulse on Bishkek, neighbors faint. No deck for a quick where.

````
Central Asia, landlocked in the Tian Shan mountains: Kazakhstan north, China east, Tajikistan south, Uzbekistan west.

```yui
map "Kyrgyzstan" caption="Mountain country between Kazakhstan and China; Bishkek sits on the northern edge."
area Kyrgyzstan KG +pulse tone=butter
area Neighbors KZ|UZ|TJ|CN tone=mute
pin@bk Bishkek 42.87,74.59
pin "Issyk-Kul lake" 42.45,77.3
pin Osh 40.53,72.8
```
````

### data-lunch-macros (pass)

**Chris:** Give me a quick lunch idea with 30g of protein.

Good: One line naming the lunch and a real Yui Lines table (`table Macros Food|Protein|Cal "Chicken|35g|165" ...`) or stat tiles for the macros. Not a quoted title plus `columns:` rows and `end` (GLM 5.2 on YUI-131, every row a parse error), and not a markdown table.

````
Tuna yogurt wrap: 5 minutes, about 32g protein.
```yui
stat 32g "Protein" spark=25|28|32
list "Tuna wrap" "Drain 1 can tuna (5 oz)" "Mix with 2 tbsp Greek yogurt, mustard, pepper" "Spread on a large whole-wheat tortilla" "Add spinach and cucumber, roll" +check
table Macros Item|Protein|Cal "Tuna, 5 oz can|25g|110" "Whole-wheat tortilla|4g|140" "Greek yogurt, 2 tbsp|3g|20" "Total|32g|270"
```
````

### list-no-escaped-breaks (pass)

**Chris:** What should I eat for dinner tonight? Something with protein. I'm allergic to peanuts and shellfish.

Good: A few dinners as a `list` (or cards), one per item, and a way to pick one. Never one `say` with \n breaks inside the quotes: the app shows the letter n (YUI-161, GLM 5.2 on native Basil).

````
Three peanut-free, shellfish-free dinners, Mick-friendly too. Skip oyster sauce and satay.

```yui
table "Dinner tonight" Meal|Protein|Time "Sheet-pan chicken thighs, potatoes, broccoli|42g|35 min" "Salmon rice bowl, cucumber, avocado|38g|25 min" "Turkey taco bowls, black beans, cheese|40g|20 min"
choose "Which one tonight?" "Sheet-pan chicken"|"Salmon bowl"|"Turkey tacos" +other
```
````

### items-board-cards-drawn (pass)

**Chris:** Anything waiting on me?

Good: One short line, then the two items drawn: a sketch with one row per card (title plus one fact) or a list or two cards, so he sees them. Not a paragraph counting the cards and listing what is in them.

````
Two cards, both need your OK.
```yui
sketch "Waiting on you" frame=bubble
row "Justice Watch: 4 recovered articles, 2 rewrites" +hi note="approve to publish"
row "Aaron's weekly roundup: post and landing page link" +hi note="needs your OK"
choose "Open which first?" "Justice Watch"|"Aaron's roundup"|Later
```
````

### ui-zip-in-context (pass)

**Chris:** Tell me about the newest change on the closing purple box.

Good: One short line, then the box drawn in a phone sketch: the ZIP field and the two buttons in place, the new part highlighted. Not a paragraph describing the field, and no hyphen lines (Chris, TestFlight: "Show me the zip in context. You should be able to illustrate UI elements fairly easily").

````
Sep 24: final copy, working ZIP, two-question form feeding the lead.

```yui
sketch "Closing purple box" frame=phone before=Before
row "Red placeholder frame" +x note="gone"
after Sep 24
row "Client's final copy, word for word" +hi
row "Your ZIP  33410" +hi note="works now"
row "Two questions" +hi note="answers go to the lead"
row "See My Coverage Options" +button
row "Talk to a Licensed Advisor" +button
```
````

### when-two-days-timeline (pass)

**Chris:** What did we change on the quote site two days earlier, on Sep 22 and 23?

Good: One short line, then a timeline: the Sep 22 and Sep 23 changes as rows with their dates, oldest first. Not a sentence with the dates inside it (Chris: "If we're talking about some two days earlier, we need some type of timeline. Show me visually").

````
Three fixes, Sep 22 and 23.
```yui
timeline "Quote site, two days earlier"
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
list "Quote site fixes" "Brand cards: real logos on /brands" "Calculator: bigger field labels" "Forms: last four eyebrow labels fixed" "Closing box: red placeholder frame gone"
```
````

### fact-one-sentence (pass)

**Chris:** Anything else fixed on the forms?

Good: One fact, so one plain sentence: the last four eyebrow labels on the forms were fixed. No hyphen, no list of one (Chris: "If there's only one thing hyphenated, it doesn't mean anything").

````
Only one: the last four eyebrow labels on the forms are fixed.
````

### last-page-next-step (FAIL)

**Chris:** Walk me through the most recent changes we've done for the quote site.

Good: Short answer first, then a deck or plan of the changes (each with its picture, at most 4 pages) whose last step is a `choose` of what to do next or 'Why do you ask?', never a page they can only read (Chris: "we are on the last card and I want some type of action here. I don't want a user to land here and not know what to do next").

- preset: motion not in [deck page plan choose ask pick form card list sketch row after timeline done now next shapes shape stat say]
- need: none of [deck plan]

````
Quote site: Sep 22–24 changes, start to finish.
```yui
motion "Quote site changes, oldest first. Sep 22 and 23: real brand logos land on the /brands family cards, calculator field labels grow bigger, the last four form eyebrow labels get fixed. Sep 24: the red placeholder frame leaves the closing purple box; the client's final copy fills it, then a working ZIP field and a two-question form whose answers flow into the lead record; buttons read See My Coverage Options and Talk to a Licensed Advisor."
choose "Next on the quote site?" "See the purple box"|"Test the form"|"Queue more fixes" +other
```
````

### last-page-walkthrough (FAIL)

**Chris:** Walk me through what changed on the closing purple box, step by step.

Good: A deck (or plan) of the changes, each with its picture, and the last step is something to tap: a `choose` of what to do next or 'Why do you ask?'. No dead end.

- preset: motion not in [deck page plan choose ask pick form card list sketch row after timeline done now next shapes shape stat say]
- need: none of [deck plan]

````
Closing purple box: four changes, Sep 24.
```yui
motion "Closing purple box on the quote site, Sep 24: first the red placeholder frame disappears. Then the client's final copy drops in, word for word. Next a ZIP field and a two-question form appear, and their answers flow into the lead record. Last, two buttons light up: See My Coverage Options and Talk to a Licensed Advisor."
choose "What next?" "Try the form"|"See the copy"|"Why do you ask?" +other
```
````

### tiles-board-status (pass)

**Chris:** ok, is the board up to date? (What you just looked up: site lane is clean, nothing open. The new feature lane, the quote calculator, has one card blocked waiting on a design pick from Chris. SEO lane shipped its last audit fixes yesterday and scores 94.)

Good: One sketch, three Label: verdict rows (Site: good, New feature: needs help with +hi, SEO: strong), a line of a few words at most. No sentences, no deck, no 'One question' screen.

````
Yes. One thing needs you.
```yui
sketch "Board" frame=window
row "Site: clean"
row "Quote calculator: blocked" +hi note="your design pick"
row "SEO: shipped, 94" note="fixes out yesterday"
```
````

### outcome-invite-declined (pass)

**Chris:** I declined the Friday 3 pm team sync invite from Dana like you said. What's the state? (What you just did: declined it on the calendar, no reply message sent to Dana.)

Good: A sketch of the invite row struck out (+x) with note=declined. A few words. If it asks about Dana it is one choose on the same screen, never 'do you want to do what the previous page said'.

````
Declined on the calendar; Dana got no note.
```yui
sketch "Team sync" frame=bubble
row "Team sync, Friday 3 pm" +x note="declined"
row "Note to Dana: not sent" +hi note="your call"
choose "Note to Dana?" "Send a short note"|"Leave it"|"Propose another time" +other
```
````

### outcome-worker-running (pass)

**Chris:** What's happening on the quote calculator card right now? (What you just looked up: a worker picked it up 4 minutes ago and is editing the calculator labels. Nothing has failed. Expect it done in about 20 minutes.)

Good: A small drawing of the worker at its task: shapes with the busy part +pulse (Worker, arrow, the card), or a one-row sketch or timeline. A few words. No paragraph.

````
Running fine, about 20 minutes left.
```yui
shapes "Quote calculator" caption="Picked up 4 min ago, editing labels, ~20 min left, no errors."
shape circle Worker +pulse
shape arrow
shape box "Calculator labels"
```
````

### context-sample-not-ask (pass)

**Chris:** Show me a sample status board so I can see how the tiles look.

Good: One sketch of Label: verdict rows marked as an example (note="example" or a sample title). No row says "waiting on you": a sample is not a real ask.

````
Sample board, made-up rows.
```yui
sketch "Sample board (example)" frame=window
row "Site: good"
row "Checkout: slow" +hi note="example: needs a look"
row "Email list: growing"
row "Backups: done"
row "New feature: design pick" +hi note="example: a decision"
choose "Tiles: keep this look?" Keep|"Bigger tiles"|"Add numbers" +other
```
````

### context-about-this (pass)

**Chris:** [yui] note: your newest message here is 4 min old and is what they are looking at: "Guide v40 is live now. | screen: Board; Before and after | rows: Site: good; New feature: needs help; SEO: strong". Words like "this", "that" or "it" mean that message. Answer about it first. Sample rows in it are examples, not their open items. Bring up another open item only if they ask, and then say when they last saw it and what they answered.
What are you waiting on me for with this? (What you just looked up: nothing on that screen is open, it was a sample. An older ask, testing the four new models with a capped key, is still open: he tapped Not yet on it at 6:54 pm.)

Good: One line about the screen just shown: nothing, it was a sample. The old model-testing ask is not brought up as the answer.

````
Nothing on that screen. It was a sample. One older ask is still open.
```yui
sketch "Waiting on you?" frame=bubble
row "Site: good" +x note="example"
row "New feature: needs help" +x note="example"
row "SEO: strong" +x note="example"
after Real
row "Test four new models, capped key: Not yet" +hi note="you tapped 6:54 pm"
```
````

### context-old-ask-when (pass)

**Chris:** [yui] note: your newest message here is 4 min old and is what they are looking at: "Guide v40 is live now. | screen: Board; Before and after | rows: Site: good; New feature: needs help; SEO: strong". Words like "this", "that" or "it" mean that message. Answer about it first. Sample rows in it are examples, not their open items. Bring up another open item only if they ask, and then say when they last saw it and what they answered.
Is anything else waiting on me? (What you just looked up: one ask is open, testing the four new models with a capped key. He tapped Not yet on it at 6:54 pm today.)

Good: The old ask comes second and is named for what it is: still open, he said Not yet at 6:54 pm. Not presented as new.

````
The board was a sample. One real ask is open.
```yui
sketch "Waiting on you" frame=bubble
row "Board rows: example only" +x note="nothing to do"
row "Test four new models: capped key" +hi note="Not yet, 6:54 pm"
choose "Four new models: test now?" "Start testing"|"Not yet"|"Drop it"
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
row "Headline, small" +x
row "Start  ·  Learn more  ·  Contact" +button +x note="three buttons"
after After
row "Headline, big" +hi note="bigger"
row "Start" +button +hi note="one button"
choose "New hero: ship it?" Ship|"Tweak headline"|"Keep old" +other
```
````

### showhere-progress-page (pass)

**Chris:** What changed on the progress page? (What you just looked up: each entry now shows before and after shots, a Feedback tag links to the note, and the filter chips moved to the top. Shots: /demo/site_before_classes.jpg and /demo/site_after_classes.jpg. Page: https://www.yuigui.com/progress)

Good: The changes drawn here: a sketch with after, or a compare of the shots. At most a small link card under them. Not a card that only opens the page.

````
Progress page: three changes.
```yui
sketch "Progress page" frame=phone before=Then
row "Entry: text only" +x
row "Filter chips at the bottom" +x
after Now
row "Filter chips" +button +hi note="moved to the top"
row "Entry: before and after shots" +hi note="every entry"
row "Feedback" +button +hi note="links to the note"
compare /demo/site_before_classes.jpg /demo/site_after_classes.jpg "Classes entry"
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
choose "Classes page refresh: ship it?" Ship|"Needs tweaks" +other
```
````

### showhere-demo (pass)

**Chris:** Can I see the reply cards demo? (What you just looked up: it is the /playground demo cards. It shows a card, a stat and a list. A card has a title, a body and one button. The stat shows a number with a small trend line.)

Good: The demo's parts drawn right here (a card sketch, a stat). Not a card that only links to /playground.

````
Reply cards, from the playground.
```yui
card "Sunday plan (example)" body="3 sessions, 40 min each" cta="Start"
stat 178.9lb "Weight (example)" delta=-2.3 spark=181|180.2|179.5|178.9
list "Today (example)" "Goblet squat 3x8" "DB bench 3x10" "Pull-ups 3x6" +check
```
````

### showlink-waiting-shots (pass)

**Chris:** What are you waiting on me for with this? (What you just looked up: the site refresh card needs your pick of before and after shots for the progress page, https://www.yuigui.com/progress. Old hero: one headline, three buttons. New hero: a bigger headline, one button. Shots on file: /demo/site_before_hero.jpg and /demo/site_after_hero.jpg.)

Good: The two shots in a compare, or a sketch with after, plus the one thing needed. Not a card that only says Open.

````
Your pick: which hero shots go on the progress page.
```yui
compare /demo/site_before_hero.jpg /demo/site_after_hero.jpg "Hero: three buttons vs one"
choose "Progress page shots: use these two?" "Use both"|"Before only"|"After only"|"Retake them" +other
```
````

### showlink-only-url (pass)

**Chris:** Where is the new hero? (What you just looked up: it is live on the site, https://www.yuigui.com/progress, in the Site refresh entry. Old hero: one headline and three buttons. New hero: a bigger headline and one button.)

Good: The change drawn: a sketch with before and after. At most one small link card under it.

````
Live on the progress page, in the Site refresh entry.
```yui
sketch "Hero" frame=phone before=Old
row "Headline" note="one line"
row "Button  ·  Button  ·  Button" +button +x note="three choices"
after New
row "Bigger headline" +hi note="the new size"
row "One button" +button +hi note="one choice"
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
row "Notification: opens on page one" +hi note="no digging"
row "Mic: stays on the last page" +hi note="keep talking"
row "Reply: quotes the screen" +hi note="context kept"
card "Full notes" body="Build 332 on the progress page" cta="Open" url=https://www.yuigui.com/progress
```
````

### showlink-demo-page (pass)

**Chris:** Is there a demo of the compare card? (What you just looked up: yes, https://www.yuigui.com/playground?demo=show-here. It shows a slider between a before and an after shot, with Side and Toggle modes. Shots: /demo/before_room.jpg and /demo/after_room.jpg.)

Good: The demo itself: a compare of the two shots. Not a card that only links to the playground.

````
Yes, here it is. Drag the slider.
```yui
compare /demo/before_room.jpg /demo/after_room.jpg "Room makeover"
card "Compare card demo" body="Slider, Side and Toggle modes" cta="Open playground" url=https://www.yuigui.com/playground?demo=show-here
```
````

### showlean-waiting (pass)

**Chris:** What are you waiting on me for with this? (What you just looked up: the site refresh card is done except before and after shots of the hero for the progress page. Page: https://www.yuigui.com/progress. Nothing else is open.)

Good: The ask drawn here (a sketch with the missing before and after slot, or a camera to snap it). At most a small link under it.

````
Nothing from you. The hero shots are mine to finish.

```yui
sketch "Site refresh" frame=window
row "Refresh: done"
row "Hero shots: on me" +hi note="before and after"
row "Progress page: waiting on shots"
row "Your input: none"
```
````

### showlean-new-hero (pass)

**Chris:** What does the new hero look like? (What you just looked up: it is on https://www.yuigui.com, top of the page. It has a bigger headline and one button, Get Yui, where there were three buttons.)

Good: The hero drawn in a sketch phone, before and after. At most a small link under it.

````
Hero on yuigui.com: bigger headline, one button.
```yui
sketch "yuigui.com hero" frame=phone before=Then
row "Headline" +x note="smaller"
row "Button  ·  Button  ·  Button" +button +x note="three buttons"
after Now
row "Headline" +hi note="bigger"
row "Get Yui" +button +hi note="the only button"
```
````

### showpick-four-looks (pass)

**Chris:** Show me the four looks again. (What you just looked up: the demo page is https://www.yuigui.com/playground?demo=shader-look. The four dark shots are already on disk: /Users/urzas/.hermes/kanban/artifacts/t_b8ab6ac3/1-currents-dark.png, 2-terrain-dark.png, 3-dots-dark.png, 4-type-dark.png, same folder.)

Good: A gallery of the four shots with +pick, so the choice is on the phone. A site link only as a small button under it, never alone.

````
Four hero looks, dark mode.
```yui
gallery /Users/urzas/.hermes/kanban/artifacts/t_b8ab6ac3/1-currents-dark.png /Users/urzas/.hermes/kanban/artifacts/t_b8ab6ac3/2-terrain-dark.png /Users/urzas/.hermes/kanban/artifacts/t_b8ab6ac3/3-dots-dark.png /Users/urzas/.hermes/kanban/artifacts/t_b8ab6ac3/4-type-dark.png +pick
```
````

### showpick-two-looks (pass)

**Chris:** Show me the two card styles again so I can pick. (What you just looked up: playground demo https://www.yuigui.com/playground?demo=card-style. Shots: /demo/s1.jpg Soft, /demo/s2.jpg Sharp.)

Good: A gallery or compare of the two shots with the pick right there. Not a card that only opens the playground.

````
Two card styles, side by side.
```yui
gallery /demo/s1.jpg /demo/s2.jpg +pick
```
````

### showpick-only-url (pass)

**Chris:** Show me again. (What you just looked up: it is the shader look demo, https://www.yuigui.com/playground?demo=shader-look. Its shots are at /Users/urzas/.hermes/kanban/artifacts/t_b8ab6ac3/ as 1-currents-dark.png, 2-terrain-dark.png, 3-dots-dark.png, 4-type-dark.png.)

Good: The four shots as a gallery with +pick (or a choose beside them). The playground link only as a small extra, never the whole answer.

````
The four hero looks, tap one to pick.
```yui
gallery /Users/urzas/.hermes/kanban/artifacts/t_b8ab6ac3/1-currents-dark.png /Users/urzas/.hermes/kanban/artifacts/t_b8ab6ac3/2-terrain-dark.png /Users/urzas/.hermes/kanban/artifacts/t_b8ab6ac3/3-dots-dark.png /Users/urzas/.hermes/kanban/artifacts/t_b8ab6ac3/4-type-dark.png +pick
card "Shader look demo" body="Try them live" cta="Open" url=https://www.yuigui.com/playground?demo=shader-look
```
````

### vis-status-board (pass)

**Chris:** Is everything up to date? (What you just looked up: the site deploy is green and live. The board has 3 cards running and 2 blocked on a pick from Chris. Build 392 is the newest on TestFlight and his phone is on it. No cron failed today.)

Good: One short line at most, then one `sketch frame=window`: Label: verdict rows (Site: live, Board: 2 need your pick +hi, Build: 392 newest, Crons: clean). No paragraph, no second bubble (VIS-1).

````
Mostly. Two picks wait on you.
```yui
sketch "Status" frame=window
row "Site: live" note="deploy green"
row "Board: 3 running"
row "Board: 2 blocked" +hi note="your pick"
row "Build 392: on your phone" note="newest"
row "Crons: no fails"
choose "The 2 blocked cards: pick now?" "Show the picks"|Later
```
````

### vis-what-did-you-fix (pass)

**Chris:** What did you fix? (What you just did: the left drawer kept a finished card under Now because one card with badly saved text crashed every refresh. You fixed the crash. A new card makes closed cards leave the drawer within seconds; it is on the board, not built.)

Good: One line, then a before and after `sketch` (drawer showed the done card under Now, now it is gone) with the new card as a `+hi` row. No fix report in prose (VIS-1).

````
Fixed the crash that froze the left drawer.
```yui
sketch "Left drawer" frame=phone before=Then
row "Done card  ·  Now" +x note="stuck"
row "One card's bad text crashed every refresh" +x note="the cause"
after Now
row "Done card gone" +hi note="fixed"
row "Closed cards leave in seconds" +dash note="on the board, not built"
```
````

### vis-you-misread-me (pass)

**Chris:** No. You misread me. I meant the left drawer, not TestFlight. (What you found: the drawer still lists a finished card under Now.)

Good: One short line owning it, then a `sketch` of the left drawer with the stale row struck out. No apology paragraph, no restating what he said (VIS-1).

````
Got it: left drawer, finished card stuck under Now.
```yui
sketch "Left drawer" frame=phone before=Now
row "Done card  ·  Now" +x note="stuck"
after Fix
row "Done card gone" +hi note="cleared"
row "Closed cards leave in seconds" +hi note="new card, not built"
choose "Drawer fix: which?" "Clear it now"|"Clear + build auto-clear"|"Just the card for auto-clear"
```
````

### vis-put-a-card-in (pass)

**Chris:** Put a card in for a daily morning release instead of ad hoc builds. (What you just did: created the card, parked in the backlog under the release lane, first in the queue. It has not been started.)

Good: One line: it is on the board, first in the queue. Then one drawing of the card in its place (a `sketch` of the queue with the new row `+hi`, or a `timeline`). No paragraph about what the card will do (VIS-1).

````
Card in. Release lane, first up, not started.
```yui
sketch "Release lane" frame=window
row "Daily morning release: queued" +hi note="first in line"
row "Ad hoc builds: until it ships" note="no change yet"
menu backlog@morning-release "Daily morning release" sub="queued, first"
```
````

### vis-no-filler-briefing (pass)

**Chris:** What shipped overnight? (What you just looked up: build 392 reached TestFlight at 6:12 am with the drawer fix and the one-build-a-day guard. The site deploy of the progress page is live. Two cards are still blocked on a pick from Chris: the tuner and the onboarding copy.)

Good: A line of nouns and verdicts (no so, now, however, intro), then one sketch: Build 392: on TestFlight, Drawer fix: shipped, Progress page: live, Tuner and onboarding copy: need your pick +hi. No 'a few things', no paragraph (VIS-1, caveman).

````
Two shipped. Two wait on you.
```yui
sketch "Overnight" frame=window
row "Build 392: on TestFlight" note="6:12 am"
row "Drawer fix: in 392"
row "One-build-a-day guard: in 392"
row "Progress page: live" note="site deploy"
row "Tuner: blocked" +hi note="needs your pick"
row "Onboarding copy: blocked" +hi note="needs your pick"
choose "Blocked cards: pick which first?" Tuner|"Onboarding copy"
```
````

### vis-three-ideas-one-page (pass)

**Chris:** How will you stop the text slides? (What you did: three changes. The plugin rewrites any reply over 30 words before it sends. The channel guide now says one line and a drawing. The eval fails a reply with more than one text bubble.)

Good: One line, then ONE drawing that holds all three ideas (a sketch with three rows, or a shapes chain of three), not three pages and not a paragraph each. No deck of one page per idea (VIS-1, Chris: up to 3 ideas on a card as long as we show them).

````
Three guards, in order: guide, plugin, eval.
```yui
motion "How text slides get stopped: a reply over 30 words used to fold into text slides. Now three guards catch it in order. First the channel guide tells the agent: one line, then a drawing. Second the plugin rewrites any reply over 30 words before it sends. Third the eval fails any reply with more than one text bubble."
choose "Next on text slides?" "Run the eval now"|"Show a rewrite"|"Tighten to 20 words" +other
```
````

### draw-how-flow (FAIL)

**Chris:** How does a card get from my ask to a shipped build? (What you know: I ask, you place it on the board, a lane builds it, checks run, it rides the 6 am release.)

Good: One short line, then a `diagram` (flowchart, LR or TD) with you, board, lane, checks, release. Mermaid labels a word or two. No paragraph, no list of steps.

- preset: motion not in [diagram mock shapes sketch row after card say stat choose ask end part]
- need: none of [diagram]

````
Ask to shipped: five hops, overnight.
```yui
motion "Your ask becomes a card on the board. A build lane picks the card up and builds it. Checks run on the build; a failed check sends it back to the lane. Passing cards ride the 6 am release to your phone."
```
````

### draw-how-sequence (pass)

**Chris:** How does a tap on a button reach the agent and come back? (What you know: the phone sends an event to the relay, the relay hands it to the agent, the agent answers with a screen, the phone draws it.)

Good: One line, then a `diagram` as a sequenceDiagram: Phone, Relay, Agent, with the event going out and the screen coming back. No text steps.

````
A tap's round trip: phone, relay, agent, relay, phone.
```yui
motion "A tap's round trip in Yui. Chris taps a button on his phone; the phone sends a tap event like [yui] n1 choose choice=Legs to the relay. The relay hands that event to the agent as its reply. The agent answers with a new screen in Yui Lines, the relay passes it back, and the phone draws it."
choose "Next?" "Where it can fail"|"Patches vs new screens"|"Why do you ask?" +other
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
part nav Checkout back=Cart
part card "Order summary" body="2 items"
part row Total value="$42"
part field Card ph="1234 5678 9012 3456"
part button Pay +hi
choose "Checkout layout: ship it?" Ship|"Tweak it" +other
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
Four rooms, two pumps, valves that only open one way.
```yui
motion "Heart: four chambers. Blue blood from the body enters the right atrium, drops to the right ventricle, gets squeezed to the lungs. Red blood returns to the left atrium, drops to the left ventricle, the thickest wall, squeezed out the aorta to the body. Valves snap shut behind each push, the lub-dub. About 70 beats a minute, 5 liters a minute."
choose "Next?" "Why the left side is stronger"|"What makes it beat"|"Quiz me" +other
```
````

### motion-work-change (pass)

**Chris:** What did you change on the settings screen? (What you did: moved Log out to the bottom, added Dark mode above it, removed the Help row, left Notifications where it was.)

Good: One line, then a `motion` whose ask names every change and where it went. Not a sketch, not a paragraph.

````
Settings: three moves, one stayed put.
```yui
motion "Settings screen change. Notifications stays at the top, untouched. The Help row is removed. Dark mode is added as a new row near the bottom. Log out moves to the very bottom, just below Dark mode."
```
````

### motion-how-connect (pass)

**Chris:** How do the app, the plugin and the backend connect? (What you know: the phone app polls the backend, the Hermes plugin writes agent replies to the backend, taps come back the same way.)

Good: One line, then a `motion` with the parts and the direction each message travels. Not a deck of pages.

````
Phone polls, plugin writes, backend in the middle.
```yui
motion "Three parts: the Yui phone app, the backend, the Hermes plugin. The plugin writes the agent's reply to the backend. The phone polls the backend, picks up the reply and draws it. A tap on the phone goes to the backend the same way, and the plugin reads it as the agent's next message."
choose "Next?" "Show it as a diagram"|"Where it's slow"|"Change something" +other
```
````

### motion-bug-fix (pass)

**Chris:** What was wrong with the drawer? (What happened: one card with badly saved text crashed every refresh, so a finished card stayed under Now. Fixed: the refresh skips a bad card and the finished card leaves.)

Good: One line, then the bug and its fix drawn: a `motion` with the facts (or a `sketch` before/after). Not paragraphs.

````
One bad card crashed every refresh. Fixed.
```yui
motion "Drawer bug: one card had badly saved text, and every drawer refresh crashed on it. The refresh stopped, so a finished card stayed stuck under Now. Fix: the refresh now skips the bad card and keeps going, and the finished card leaves Now in seconds."
```
````

### motion-plain-fact (pass)

**Chris:** What build am I on?

Good: One line or one card with the build. A plain fact is no film.

````
Can't see your phone's build from here. It's in Settings.

```yui
mock "Where your build lives" frame=phone
part nav Settings
part row About +hi
part row Version value="Yui 1.x (build ###)" +hi
choose "Your build number?" "Tell you mine"|"Check TestFlight"|+other
```
````

### motion-status-line (FAIL)

**Chris:** Is the board up to date?

Good: One line or a `Label: verdict` sketch. A status is no film.

- no reply: exit null: 

````
(no reply: exit null: )
````

### motion-with-quiz (pass)

**Chris:** Teach me how a heart pumps blood, then quiz me.

Good: One line, a `motion` with the facts, then one `choose` for the quiz question right after it. No scenes.

````
Four rooms, two loops, one squeeze at a time.
```yui
motion "The heart has four chambers: two atria on top, two ventricles below. Blood low on oxygen enters the right atrium, drops to the right ventricle, and is pushed to the lungs to pick up oxygen. Oxygen-rich blood returns to the left atrium, drops to the left ventricle, and the thick left wall squeezes it out the aorta to the body. One-way valves snap shut between each step, making the lub-dub sound."
choose "Quiz: which chamber pumps blood out to the whole body?" "Right atrium"|"Right ventricle"|"Left atrium"|"Left ventricle" answer="Left ventricle"
```
````

### motion-old-phone (FAIL)

**Chris:** How does a heart pump blood?

Good: The agent may send a `motion`; a phone that cannot play it gets the ask as a sketch. The reply must still leave a picture.

- app build: the yui plugin did not run (/private/tmp/yui/hermes-plugin/yui): spawnSync python3 ENOENT
- need: none of [sketch say card stat timeline shapes]

````
Four rooms, two pumps, one squeeze.
```yui
motion "The heart has four chambers: two atria on top, two ventricles below. Blue blood from the body fills the right side, which pumps it to the lungs for oxygen. Red blood returns to the left side, and the strong left ventricle squeezes it out the aorta to the whole body. One-way valves snap shut between beats, making the lub-dub sound, about 70 times a minute."
choose "Next?" "Why lub-dub?"|"What's blood pressure?"|"Kid version for Mick"
```
````

### explain-eli5-string-theory (pass)

**Chris:** Eli5 string theory

Good: One line, then one `motion` line whose ask carries the facts, and at most one `choose` after it. No deck, no shapes standing in for the film.

````
Everything might be made of tiny vibrating strings, like guitar strings.
```yui
motion "String theory for a kid: zoom into anything, past atoms, past electrons, and you might find tiny loops of string, far too small to ever see. Each string wiggles. Like a guitar string playing different notes, a string wiggling one way is an electron, another way is a photon of light. The theory also needs extra hidden dimensions, curled up too small to notice."
choose "Next?" "Grown-up take"|"Why can't we test it?"|"What are extra dimensions?"
```
````

### explain-eli5-black-holes (pass)

**Chris:** ELI5 black holes

Good: One line, then one `motion` line whose ask carries the facts, and at most one `choose` after it. No deck, no shapes standing in for the film.

````
A spot where gravity squeezes so hard even light can't climb out.
```yui
motion "A black hole, explained for a 5 year old. A giant star runs out of fuel and its own gravity crushes it into a tiny point. Near it, gravity pulls so hard that nothing, not even light, can climb back out. The edge where escape stops is the event horizon. It looks black because no light leaves it."
choose "Next?" "How big do they get?"|"Could one eat Earth?"|"Kid version for Mick" +other
```
````

### explain-eli5-inflation (pass)

**Chris:** Explain inflation to me like I'm five.

Good: One line, then one `motion` line whose ask carries the facts, and at most one `choose` after it. No deck, no shapes standing in for the film.

````
Same dollar, fewer cookies over time.
```yui
motion "Inflation for a five-year-old: last year one dollar bought two cookies. This year prices went up, so that same dollar buys one and a half cookies. The dollar did not shrink, but it buys less. Prices creep up a little most years, about 2 to 3 percent, so saved money slowly buys less."
choose "Next?" "Why do prices rise?"|"How to protect savings"|"Explain it to Mick"
```
````

### explain-how-vaccines-work (pass)

**Chris:** How do vaccines work?

Good: One line, then one `motion` line whose ask carries the facts, and at most one `choose` after it. No deck, no shapes standing in for the film.

````
A safe practice round teaches your body to beat the real germ.
```yui
motion "A vaccine shows the immune system a harmless piece or weakened copy of a germ, like a wanted poster. White blood cells study it and make antibodies that fit it. Memory cells stay behind for years. When the real germ arrives, they recognize it fast and clear it before you get sick."
choose "Go deeper?" "mRNA vaccines"|"Why boosters"|"Herd immunity" +other
```
````

### explain-what-is-a-mortgage (pass)

**Chris:** Simple terms: what is a mortgage?

Good: One line, then one `motion` line whose ask carries the facts, and at most one `choose` after it. No deck, no shapes standing in for the film.

````
A loan to buy a home, paid back monthly, with the house as the promise.
```yui
motion "A mortgage: you want a $400,000 house but have $80,000 saved. The bank lends the other $320,000. You repay it monthly over 30 years, plus interest, the bank's fee for lending. The house is the promise: miss too many payments and the bank can take it. Each payment chips away at the loan until the house is fully yours."
choose "Next?" "How interest adds up"|"Fixed vs adjustable"|"What I could afford"
```
````

### motion-explain-string-theory (pass)

**Chris:** Take me through what string theory is

Good: One line, one `motion` line whose ask carries the facts (tiny vibrating strings, notes as particles, extra dimensions curled up). No deck, no shapes pages.

````
Tiny vibrating strings, not dots, might be what everything is made of.
```yui
motion "String theory says the smallest things are not points but tiny loops and strands of energy, about 10^-35 meters long. Each string vibrates like a guitar string, and each pattern of vibration shows up as a different particle: one note is an electron, another a photon, one even gravity. The math only works with extra dimensions, 10 in total, curled up too small to see. No experiment has confirmed it yet."
choose "Next?" "Why extra dimensions?"|"Is it proven?"|"Kid version" +other
```
````

### motion-explain-black-hole-forms (pass)

**Chris:** How does a black hole form?

Good: One line, one `motion` line with the facts in order (a huge star runs out of fuel, the core collapses, gravity wins, light cannot leave past the horizon).

````
A giant star runs out of fuel and its own weight crushes it.
```yui
motion "A star over 20 times the Sun's mass burns hydrogen for millions of years, outward fusion pressure balancing inward gravity. Fuel runs out, fusion stops, gravity wins: the core collapses in under a second. Outer layers blast away in a supernova. The core shrinks past the event horizon, a boundary where escape speed exceeds light, and a black hole remains."
choose "Next?" "What's inside?"|"Can the Sun become one?"|"Kid version for Mick"
```
````

### motion-explain-photosynthesis (pass)

**Chris:** Walk me through photosynthesis

Good: One line, one `motion` line with the facts (light hits the leaf, water up the roots, CO2 in, sugar made, oxygen out).

````
Plants turn light, water and air into sugar.
```yui
motion "Photosynthesis: a leaf takes in sunlight, water from the roots and carbon dioxide from the air through tiny pores. Inside chloroplasts, green chlorophyll catches the light and splits water, releasing oxygen out of the leaf. That captured energy then builds carbon dioxide into glucose sugar, which feeds the plant. Formula: 6 CO2 + 6 H2O + light makes C6H12O6 + 6 O2."
choose "Where does the oxygen we breathe come from?" "Split water"|"Carbon dioxide"|"The soil" answer="Split water"
```
````

### motion-explain-stock-market (pass)

**Chris:** How does the stock market work?

Good: One line, one `motion` line with the facts (a company sells shares, buyers and sellers meet on an exchange, price moves with demand).

````
Companies sell slices of themselves. People trade the slices.
```yui
motion "A company splits ownership into shares and sells them at an IPO to raise cash. Investors then trade those shares with each other on an exchange like the NYSE or Nasdaq. Buyers bid, sellers ask, and the price moves to where they meet: more buyers pushes it up, more sellers pushes it down. Owners profit when the price rises or the company pays dividends."
choose "Next?" "How to buy one"|"What moves prices"|"Explain it to Mick" +other
```
````
