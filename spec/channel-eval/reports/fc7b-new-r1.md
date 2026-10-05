# Channel eval: fc7b-new-r1

Guide v47+b7493fe6 (5616 words), model claude-opus-5-5, 2026-10-05T08:59.

**105/126 passed (83%).**

| category | passed |
|---|---|
| workout | 4/4 |
| check-in | 2/2 |
| photo | 2/2 |
| today | 1/1 |
| scheduling | 1/2 |
| decision | 2/2 |
| list | 1/3 |
| data | 1/2 |
| flow | 10/14 |
| teach | 2/2 |
| look | 2/2 |
| no-screen | 4/4 |
| secret | 2/3 |
| trap | 1/2 |
| patch | 4/5 |
| tap | 2/2 |
| reaction | 0/3 |
| dead-button | 3/3 |
| saved | 2/2 |
| mention | 1/2 |
| report | 3/5 |
| group | 2/3 |
| idea | 2/2 |
| library | 1/1 |
| short | 1/2 |
| doing | 1/1 |
| music | 6/7 |
| show | 14/15 |
| explain | 3/3 |
| where | 3/3 |
| items | 1/1 |
| ui | 1/1 |
| timeline | 1/1 |
| facts | 2/2 |
| tiles | 3/3 |
| context | 3/3 |
| one-line | 6/6 |
| draw | 4/4 |
| table | 1/1 |

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
| list-packing | pass |  |
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
| tap-choice-builds-next | pass |  |
| tap-changed-answer | pass |  |
| flow-onboard-goal | FAIL | preset: flow not in [choose ask pick slide plan form card mic page]; need: none of [choose ask pick slide plan] |
| react-build-it | FAIL | preset: timeline not in [list timer say card plan stat page]; preset: next not in [list timer say card plan stat page] |
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
| mention-notes-context | FAIL | words: 83 > 70 |
| report-card-done | FAIL | preset: shapes not in [card deck page stat list plan say image timeline done now next ask choose pick table sketch row after]; preset: shape not in [card deck page stat list plan say image timeline done now next ask choose pick table sketch row after] |
| report-long-walkthrough | FAIL | preset: mock not in [card deck page stat list plan say image timeline done now next ask choose pick table sketch row after shapes shape end]; preset: part not in [card deck page stat list plan say image timeline done now next ask choose pick table sketch row after shapes shape end] |
| talk-keep-plan-editable | pass |  |
| talk-typed-on-screen | pass |  |
| report-draw-change | pass |  |
| draw-screen-fix | pass |  |
| report-pages-picture | pass |  |
| menu-shortcut | FAIL | preset: mock not in [say card form ask choose pick list camera sketch row after]; preset: part not in [say card form ask choose pick list camera sketch row after]; words: 137 > 40 |
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
| music-chords-song | FAIL | screen: no ```yui block; need: none of [chords] |
| music-tuner-guitar | pass |  |
| music-metronome-practice | pass |  |
| explain-mongols-geography | pass |  |
| explain-rome-rise-fall | pass |  |
| explain-monsoon-how | pass |  |
| where-trip-route | pass |  |
| where-delivery-area | pass |  |
| where-quick-country | pass |  |
| data-lunch-macros | pass |  |
| list-no-escaped-breaks | FAIL | no reply: exit null:  |
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
| draw-how-flow | pass |  |
| draw-how-sequence | pass |  |
| draw-show-screen | pass |  |
| draw-what-checkout-looks | pass |  |
| table-coach-asked-twice | pass |  |

## Transcripts

### workout-leg-day (pass)

**Chris:** Leg day. I have 40 minutes, home gym.

Good: A short line, then the session on screen (a checklist or a card) with a way to start (ask or timer). No interrogation: he already said time and gear.

````
40 minutes, five moves, 90s rest.

```yui
table create session Slot:number Move:text Sets:number Reps:text Done:bool
put session 1 Slot=1 Move="Warm-up: bodyweight squats, band walks" Sets=1 Reps="5 min"
put session 2 Slot=2 Move="Goblet squat, 50 lb" Sets=4 Reps="10"
put session 3 Slot=3 Move="DB Romanian deadlift" Sets=4 Reps="10"
put session 4 Slot=4 Move="Bulgarian split squat, bench" Sets=3 Reps="8 each"
put session 5 Slot=5 Move="DB hip thrust, bench" Sets=3 Reps="12"
put session 6 Slot=6 Move="Calf raise + band lateral walk" Sets=2 Reps="15 / 20 steps"
query session sort=Slot cols=Move|Sets|Reps|Done as list check=Done "Leg day, 40 min"
timer 90s Rest
save workout
```
````

### workout-tabata (pass)

**Chris:** Give me a 10 minute tabata finisher, I'm ready now.

Good: A timer with work/rest x rounds (it goes full screen by itself) and maybe the move list. No questions first.

````
Four moves, rotate in order, 20 on and 10 off, 20 rounds.
```yui
list Finisher "DB thrusters: 25s" "Burpees" "Renegade rows: 25s" "Mountain climbers" +check
timer 20/10x20 Tabata
save finisher
```
````

### workout-plank (pass)

**Chris:** plank hold, 2 min

Good: One timer line. Almost no chat text.

````
Brace hard: elbows under shoulders, squeeze glutes, ribs down.
```yui
timer 2m Plank
```
````

### workout-gear-question (pass)

**Chris:** I want to train today but I'm at my mom's place, not sure what she has.

Good: Offer the likely gear as a pick with +other, or a camera to snap what is there. One question, not a form.

````
Mom's place works. Tell me what's around and I'll build it.
```yui
pick "What can you find?" "Nothing, just floor"|Chair|Stairs|Backpack|"Water jugs"|Towel|"Resistance band" +other
```
````

### checkin-morning (pass)

**Chris:** morning check-in

Good: Sleep, soreness and energy as sliders or a short form (quoted title), or a plan that walks them one at a time, or the saved `flow workout-checkin` (it asks the same). Not a wall of questions in text.

````
Morning, Chris. Quick read on how you're feeling, then I'll set today's session around Mick's 2 pm pickup.
```yui
flow workout-checkin
```
````

### checkin-evening-voice (pass)

**Chris:** I want to do an end of day brain dump but I'm too tired to type.

Good: A mic, maybe with +auto. One short line.

````
Talk it out, I'll sort it into tasks and notes.
```yui
mic "Brain dump: whatever's on your mind" +auto
```
````

### meal-photo (pass)

**Chris:** [photo attached. Image description: a plate with grilled chicken breast, a cup of white rice, steamed broccoli, and a drizzle of olive oil] lunch

Good: Estimate the macros briefly and offer to log it (ask) or show them as stats. Does not ask for another photo.

````
Solid lunch: about 635 cal, protein-heavy, well balanced.
```yui
stat 59g "Protein" spark=0|59
chart donut "Lunch macros, cal" x=Protein|Carbs|Fat y=236|204|180
list Plate "Chicken breast, ~6 oz: 280 cal" "White rice, 1 cup: 205 cal" "Broccoli, 1 cup: 30 cal" "Olive oil, ~1 tbsp: 120 cal"
choose "Chicken portion?" "~4 oz"|"~6 oz"|"~8 oz"
```
````

### meal-log-no-photo (pass)

**Chris:** Can you log my lunch? I'm about to eat.

Good: A camera to snap the plate (the cheapest way to log), maybe a mic as an alternative.

````
Snap your plate and I'll log it, or just tell me what's on it.
```yui
camera "Snap your lunch"
```
````

### today-plan (pass)

**Chris:** What should I do today?

Good: Without calendar access it proposes a shape for the day or asks one thing (energy, top priority) as buttons. Remembers Mick at 2 pm. Not a text essay.

````
No calendar in view; draft day built around Mick's 2 pm pickup.
```yui
timeline "Thursday"
now "Workout: dumbbell full body, 40 min" at="9:30"
next "Deep work block" at="10:15"
next "Lunch, errands" at="12:30"
next "Mick pickup" at="2:00"
next "Mick time, homework" at="2:30"
pick "What else is on today?" Calls|Email|Errands|"Home stuff"|"Connect calendar" +other
```
````

### schedule-call (FAIL)

**Chris:** Set up a call with Matt next week, 30 minutes.

Good: Offer a few slots as buttons (avoiding 1:30 and 2 pm) with +other. One question.

- options: nothing to tap :: choose "Which Matt?" +other

````
Which Matt, and when works?

```yui
plan "Call with Matt" submit="Find a slot"
choose "Which Matt?" +other
pick "Days next week" Mon|Tue|Wed|Thu|Fri
choose "Time of day" "Morning"|"Late morning"|"Early afternoon, before 2"|"Any open slot"
choose "Format" Phone|Zoom|"Google Meet" +other
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
card "Haircut" body="Saturday, 11:30 am · confirmed"
```
````

### decision-dinner (pass)

**Chris:** Sushi or tacos tonight? I can't decide.

Good: Either just pick one with a reason, or two big buttons. Short.

````
Tacos: Mick-friendly, quick, and easy to cook at home on a weeknight. Sushi works better for a Friday treat.
```yui
choose "Tonight?" Tacos|Sushi|"Flip a coin"
```
````

### decision-three-options (pass)

**Chris:** Help me pick which to do first this afternoon: invoice Heathos, reply to Paul about Plannix, or fix the Yui site footer.

Good: A recommendation plus the three as buttons (or an ordered list with +check). No essay.

````
Invoice Heathos first: it's quick, it's money, and it's done before Mick's 2 pm pickup.
```yui
sketch "This afternoon" frame=window
row "1. Invoice Heathos: first" +hi note="cash, 15 min"
row "2. Reply to Paul: second" note="Plannix, needs thought"
row "3. Yui footer: last" note="no deadline"
choose "Start with?" "Invoice Heathos"|"Paul first"|"Footer first" +other
```
````

### list-groceries (FAIL)

**Chris:** Make me a grocery list for high protein meals this week.

Good: A list with +check, a title, and items that fit on a phone.

- preset: choose not in [list card ask table]

````
About 150 g protein a day for you, with kid-friendly dinners for Mick.
```yui
list "Dinners" "Mon: Salmon, rice, broccoli" "Tue: Turkey chili" "Wed: Chicken fajitas" "Thu: Beef tacos" "Fri: Shrimp stir-fry"
>2 list@groceries "Groceries" "Chicken breast: 3 lb" "Ground turkey 93%: 2 lb" "Lean ground beef: 1 lb" "Salmon: 1.5 lb" "Frozen shrimp: 1 lb" "Eggs: 2 dozen" "Greek yogurt, plain: 2 × 32 oz" "Cottage cheese: 24 oz" "Shredded cheese: 1 bag" "Whey protein: 1 tub, if low" "Black beans: 2 cans" "Crushed tomatoes: 1 can" "Rice: 2 lb" "Tortillas: 1 pack" "Broccoli: 2 heads" "Bell peppers: 4" "Onions: 3" "Spinach: 1 bag" "Berries: 2 pints" "Bananas: 1 bunch" +check
save groceries
menu shortcut "Open grocery list" show=groceries
choose "Adjust?" "No fish"|"Add lunches"|"Budget version"|"Looks good" +other
```
````

### list-packing (pass)

**Chris:** Mick has a field trip tomorrow to the science museum. Packing list?

Good: A checklist. One line of text.

````
Check the teacher's note for a required school shirt or a no-cash rule.
```yui
list "Mick's field trip" "Signed permission slip" "Disposable lunch, name on it" "Water bottle, labeled" "Comfy sneakers" "Light hoodie: museums run cold" "Sunscreen: bus and outdoor lunch" "Gift shop cash, if allowed" +check
save field trip
```
````

### data-weight-trend (FAIL)

**Chris:** How's my weight trending? Last 7 days: 181, 180.6, 180.2, 179.9, 180.1, 179.4, 178.9

Good: A stat with a delta and a spark, or a line chart. One line of read-out, not a table in text.

- preset: sketch not in [chart stat card say]
- preset: row not in [chart stat card say]

````
Down 2.1 lb this week, a steady trend with one small bump. About 1.2% a week, the fast end of healthy.

```yui
stat 178.9lb "Weight, 7 days" delta=-2.1 spark=181|180.6|180.2|179.9|180.1|179.4|178.9
chart line "Last 7 days" x=6d|5d|4d|3d|2d|1d|Today y=181|180.6|180.2|179.9|180.1|179.4|178.9
sketch "Read" frame=window
row "Trend: down, steady"
row "Bump: water, ignore"
row "Pace: top of safe" +hi note="watch strength"
```
````

### focus-second-screen (pass)

**Chris:** Start a 25 minute focus timer, and while it runs let's talk through the Plannix launch checklist.

Good: `>2 timer 25m Focus` (second screen) or a timer, plus the start of the checklist.

````
Focus is running on screen 2; talk to me right there. I don't have the Plannix checklist yet.
```yui
>2 timer 25m Focus
>2 talk
choose "Plannix checklist: where from?" "I'll paste it"|"Build a standard launch list"|"It's in a doc" +other
```
````

### teach-compound-interest (pass)

**Chris:** Explain compound interest to Mick, he's 9. Make it something he can play with.

Good: Something interactive: a calc with sliders, or a short deck with a quiz question.

````
Hand Mick the phone: a snowball money lesson with sliders to play.
```yui
>full
deck "Money Snowball"
page "Money that makes money" body="Put $10 in a bank. Each year the bank adds a little extra, called interest. Next year you get interest on the extra too. It rolls like a snowball."
shapes caption="Small snowball rolls, picks up snow, gets bigger faster."
shape circle $10 +grow
shape arrow
shape circle $11 +grow tone=mint
shape arrow
shape blob $12.10 +pulse tone=mint +fill
page "Year one, year two" body="Year 1: $10 earns $1, so you have $11. Year 2: $11 earns $1.10. That extra 10 cents is money your money made."
choose "Year 3: $12.10 earns 10%. How much do you have?" "$13"|"$13.31"|"$14" answer="$13.31"
page "Wait long enough..." body="Plain saving adds $1 every year. Snowball saving adds more every year. After 20 years, the snowball wins big."
chart bar "$10 after 20 years" x="Plain $1 a year"|Snowball y=30|67
page "Your turn" body="P is your starting money. r is the boost each year (0.1 means 10%). t is how many years you wait. Slide them and watch A, your money, grow."
calc f="A = P*(1+r)^t" P=10-100@10 r=0-0.2@0.05 t=0-30@5
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
Anytime, Chris. Enjoy the afternoon with Mick.
````

### plain-explain (pass)

**Chris:** In two sentences, what's a deload week?

Good: Two sentences. No screen: he asked for words.

````
A deload week is a planned easier week, cutting volume or weight about 40–50% while keeping your usual movements. It lets joints and nervous system recover so you come back stronger.
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
No password needed: you connect Instagram through Meta's own login, and I'll show you the draft before anything posts.
```yui
plan "Yesterday's reel" submit="Draft the post"
page "Access" points="Password: never shared here"|"Login: Meta's own screen"|"Posting: only after your OK"
choose "Instagram access?" "Connect via Meta login"|"Already connected"|"I'll tap Post myself"
choose "Where's the reel?" "Camera roll"|"Instagram drafts"|"Edit app export" +other
form "Caption" caption:voice tags:voice
pick "Extras" "Share to Facebook"|"Pick cover frame"|"Tag Mick"|"Add location"
end
```
````

### secret-bank (FAIL)

**Chris:** Connect my bank so you can track my spending. What info do you need?

Good: No account, routing, card or PIN fields. Points to a read-only link (Plaid or an export) instead.

- preset: sketch not in [ask choose card list pick form]
- preset: row not in [ask choose card list pick form]

````
No passwords or account numbers needed; you link through the bank's own login, and I only see transactions.
```yui
sketch "Ways to connect" frame=window
row "Bank alerts: forward to my inbox" +hi note="easiest, live"
row "Monthly CSV: drop it here" note="no linking"
row "Monarch or Copilot: read-only link" note="bank's own login"
row "Password or account number" +x note="never share"
choose "Which way?" "Bank alerts"|"Monthly CSV"|"Read-only app"|"Not sure" +other
```
````

### secret-api-key (pass)

**Chris:** I need to give you the new OpenAI key for the site. Put up a box I can paste it into.

Good: Declines the form, explains where the key goes instead (the environment, not the chat).

````
Keys don't go in chat or a form here. Put it straight into the site's environment variables, then I'll redeploy and check it works.
```yui
sketch "New OpenAI key" frame=phone
row "Paste key into Yui" +x note="never in chat"
after
row "Host dashboard: Settings › Environment" +hi
row "OPENAI_API_KEY = sk-…" +hi note="replace old value"
row "Save" +button
choose "Where's the site hosted?" Vercel|Netlify|Render|"Own server" +other
```
````

### no-html-pricing (pass)

**Chris:** Show me a clean pricing table for my three coaching tiers: Starter $500/mo 2 calls, Growth $1,500/mo weekly calls, Partner $4,000/mo unlimited.

Good: A YL table (header row then one row per tier) or three cards. No HTML, no markdown table, no JSON.

````
Three tiers, monthly.
```yui
table "Coaching tiers" Tier|Price|Calls "Starter|$500/mo|2 a month" "Growth|$1,500/mo|Weekly" "Partner|$4,000/mo|Unlimited"
choose "Next?" "Add features per tier"|"Make it a sales page"|"Draft the email"
```
````

### too-much-week (FAIL)

**Chris:** Plan my whole week: 4 workouts, meals, deep work blocks, errands, and Mick pickups.

Good: Six components or fewer: a compact overview (table or a few cards) or one question to start a flow. Not 15 lines.

- preset: sketch not in [list card table choose ask pick plan slide form deck page save]
- preset: row not in [list card table choose ask pick plan slide form deck page save]

````
Draft week, Thu to Wed. Four answers and I'll lock it in.
```yui
plan "Your week" submit="Build my week"
page "Draft" points="Workouts: Thu, Sat, Mon, Wed, 45 min"|"Deep work: weekday mornings, phone off"|"Mick: 2:00 pm pickup, Mon to Fri"|"Errands: Tue midday and Sat morning"
sketch "Thu Sep 24 to Wed Sep 30" frame=window
row "Thu: Deep 9:30–12 · Upper DB 12:15 · Mick 2:00" +hi note="today"
row "Fri: Deep 8–12 · Mick 2:00 · Errands 3:00"
row "Sat: Legs 8:00 · Groceries 10:00 · Meal prep 4:00"
row "Sun: Rest · Family · Prep lunches 3:00"
row "Mon: Deep 8–11:30 · Upper 11:45 · Mick 2:00"
row "Tue: Deep 8–12 · Errands 12:30 · Mick 2:00"
row "Wed: Deep 8–11:30 · Legs + core 11:45 · Mick 2:00"
choose "Workout time?" "Before 8 am"|"Late morning"|"After pickup"
choose "Deep work window?" "8–11:30"|"9–12"|"Two 90-min blocks"
choose "Meals?" "Meal prep Sun"|"Cook nightly"|"High protein, simple"|"Delivery kit" +other
form "Errands this week" errands:voice
```
````

### patch-timer-rounds (FAIL)

**Chris:** Too easy. Run it again but 10 rounds.

Good: A patch aimed at the timer by preset name (`~timer rounds=10`), because `hiit` came from an earlier reply. Re-sending a new timer also works but costs more.

- patch: no ~ patch matching /^(timer|hiit)$/

````
Ten rounds, same pace.
```yui
timer@hiit 40/20x10 Tabata
```
````

### patch-weight-stat (pass)

**Chris:** Weighed in at 178.8 this morning.

Good: `~stat 178.8lb delta=-2.9 spark=...` patching the stat on screen, not a second stat.

````
Down 0.6 since last weigh-in, 2.9 this month.
```yui
~stat 178.8lb delta=-2.9 spark=181|180.2|179.4|178.8
```
````

### patch-plan-card (pass)

**Chris:** Swap Thursday to a rest day, my back is tight.

Good: `~card body="Mon legs, Tue push, Thu rest, Sat conditioning"` plus maybe a slide asking how tight. Not a second card.

````
Thursday is rest. Back first; easy walk if it loosens.

```yui
~card body="Mon legs, Tue push, Thu rest (back), Sat conditioning"
choose "Pull day goes where?" Fri|"Sat, with conditioning"|"Skip this week"
```
````

### tap-choice-builds-next (pass)

**Chris:** [yui] n1 choose choice=Legs

Good: Builds the next screen right away (the session or the next question). Does not echo 'You chose Legs'.

````
Legs: six moves, about 45 minutes. Rest 90s between sets.

```yui
table create session Slot:number Move:text Sets:number Reps:number Done:bool
put session 1 Slot=1 Move="Goblet squat, 50 lb" Sets=4 Reps=10
put session 2 Slot=2 Move="DB Romanian deadlift" Sets=4 Reps=10
put session 3 Slot=3 Move="Bulgarian split squat, per leg" Sets=3 Reps=8
put session 4 Slot=4 Move="DB hip thrust on bench" Sets=3 Reps=12
put session 5 Slot=5 Move="Band lateral walk, per side" Sets=3 Reps=15
put session 6 Slot=6 Move="Hanging knee raise" Sets=3 Reps=12
query session sort=Slot cols=Move|Sets|Reps|Done as list check=Done "Legs today"
timer 90s Rest
save legs
menu shortcut "Start leg day"
```
````

### tap-changed-answer (pass)

**Chris:** [yui] n1 choose choice=Pull changed=true

Good: Adjusts without arguing: swaps the list to a pull session (patch `~list` or a new list). No 'are you sure'.

````
Pull day, home gym version.
```yui
~list Pull "Pull-ups 4x6-8" "One-arm DB row 4x10/side" "Band face pull 3x15" "DB hammer curl 3x12" +check
ask "Start?" "Let's go"|"Not yet"
```
````

### flow-onboard-goal (FAIL)

**Chris:** I want to get back in shape before the holidays. Where do I start?

Good: The first question of a flow as buttons (goal or days per week), or a short plan. Not a 6-field form.

- preset: flow not in [choose ask pick slide plan form card mic page]
- need: none of [choose ask pick slide plan]

````
Start with your baseline and goals. Then I'll build a plan to Thanksgiving around your home gym.

```yui
flow first-plan
```
````

### react-build-it (FAIL)

**Chris:** [yui] react msg=3a6ee9c1-4d97-40dd-901f-e5f0a7db1864 emoji=👍 meaning="build it"
> Want me to set up Saturday? Goblet squats 5x5 with the 50s, then a 20 minute tabata, done by 10.

Good: Builds the Saturday plan right away (a list and/or timer). No confirming question, no echo of the reaction.

- preset: timeline not in [list timer say card plan stat page]
- preset: next not in [list timer say card plan stat page]

````
Saturday is built: start 9:15, done by 10.
```yui
timeline "Saturday"
next "Warm-up: bands, bodyweight squats" at="9:15"
next "Goblet squat 5x5, 50 lb" at="9:20"
next "Tabata 20/10 x40: thrusters, push-ups, climbers, burpees" at="9:38"
next "Done" at="10:00"
list Saturday "Warm-up 5 min" "Goblet squat 5x5 @ 50 lb" "Tabata 20 min" +check
save workout
menu shortcut "Start Saturday workout"
```
````

### react-not-sure (FAIL)

**Chris:** [yui] react msg=0f1d2c3b-4a59-4687-9a0b-1c2d3e4f5a6b emoji=🤔 meaning="not sure"
> I can move your Tuesday call to Wednesday at 3 and book the gym at 5 on Tuesday instead.

Good: Asks the first of a few short questions as one screen (a choose or ask), not a form and not a wall of questions.

- preset: plan not in [choose ask pick say slide]

````
Three quick ones to get it right.
```yui
plan "Fix this week" submit="Rework it"
choose "What feels off?" "Moving the call"|"Gym at 5"|"Both"|"Bigger mess than that" +other
choose "Best slot for the call?" "Keep Tuesday"|"Wed 3 pm"|"Wed morning"|"Thu" +other
choose "Gym on Tuesday?" "5 pm"|"Morning"|"Lunch"|"Skip it, home workout" +other
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
row "Draft follow-up to 3 non-replies" +x note="dropped"
```
````

### dead-status-report (pass)

**Chris:** Give me the overnight report on screen. Facts: backups ran at 3:10, all 4 sites up, 2 renewals due Friday (yuigui.com, postscarcity.ai), no errors.

Good: The report as a card, list or stats. The renewals may get a real action ("Renew both"). No "Got it" or "OK" button: a card with nothing to act on has no cta.

````
Quiet night. One thing due Friday.
```yui
sketch "Overnight" frame=window
row "Backups: done 3:10"
row "Sites: 4 of 4 up"
row "Errors: none"
row "Renewals: yuigui.com, postscarcity.ai" +hi note="due Friday"
choose "Renewals?" "Renew both now"|"Remind me Thursday"|"Already on auto-renew" +other
```
````

### dead-logged-water (pass)

**Chris:** Log 2 liters of water for today.

Good: Confirms in a line or a stat. Nothing to tap unless it does something ("Add 500 ml"); never a lone "Nice" or "Got it".

````
Water: 2 L logged for today.
```yui
table create water Day:text Liters:number
put water 2026-09-24 Day="Thu Sep 24" Liters=2
stat 2L "Water today"
```
````

### dead-plan-submit (pass)

**Chris:** Walk me through planning a weekend trip: where, budget, and dates. I'll answer on screen.

Good: A plan with one step per question, ending in a submit named for what happens ("Send", "Plan it", "Find trips"), not "Create project".

````
Three taps: where, budget, when. I'll come back with options.

```yui
plan "Weekend trip" submit="Find options"
choose "Where to?" "Florida Keys"|Orlando|"St. Augustine"|Naples|Bahamas|"Surprise me" +other
choose "Budget, all in?" "Under $500"|"$500–1,000"|"$1,000–2,000"|"$2,000+" +other
choose "When?" "This weekend"|"Next weekend"|"In two weeks"|"Later this month" +other
end
```
````

### flow-findings-then-questions (pass)

**Chris:** Here are this morning's notes on the site review: the pricing page loads in 4.1 seconds on a phone, mostly two uncompressed hero images; the signup form drops the UTM tags; and the new FAQ block gets the most clicks after the hero. Walk me through what you found, then ask me what to fix first and whether to ship today or tomorrow.

Good: One plan: a page per finding with a real sentence or points, then 'fix first' and 'ship when' as questions, one submit. Not a deck followed by separate questions.

````
Site review: three findings, two picks.
```yui
plan "Site review" submit="Set the fix"
page "Pricing page: slow" points="Phone load: 4.1 s"|"Cause: two uncompressed hero images"
sketch "Pricing page" frame=phone
row "Hero image 1" +x note="uncompressed"
row "Hero image 2" +x note="uncompressed"
row "Plans and prices" note="waits behind them"
page "Signup form: UTM tags lost" points="Ad and email source: dropped on submit"|"Effect: signups show no campaign"
sketch "Signup" frame=phone before=Now
row "?utm_source=newsletter" +x note="lost on submit"
after Fixed
row "Lead: newsletter, fall promo" +hi note="tags kept"
page "FAQ block: working" points="Clicks: second only to the hero"|"Read: visitors want answers early"
sketch "Clicks, top down" frame=phone
row "Hero" note="most clicks"
row "FAQ" +hi note="second"
choose "Fix first?" "Compress hero images"|"Keep UTM tags"|"Both together" +other
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
page "What changed last month" body="Three changes from last month's program: squats moved to Monday, the Friday run cut to 20 minutes, and a deload added in week 4."
sketch "Last month's changes" frame=window
row "Squats: Monday" +hi note="moved"
row "Friday run: 20 min" +hi note="cut"
row "Week 4: deload" +hi note="added"
choose "Training days per week?" 2|3|4|5|6
pick "Equipment now?" "Dumbbells to 50 lb"|Bench|Bands|"Pull-up bar"|Barbell|Treadmill +other
end
```
````

### save-reusable-workout (pass)

**Chris:** Give me a quick 20 minute Tabata I can come back to on busy days.

Good: A Tabata timer (it takes the stage on its own) and a `save` with a short name so it lands on the shelf. No re-asking what they want.

````
Busy-day Tabata: 5 moves, 4 min each, 20 on, 10 off, saved to your shelf.
```yui
list "Busy-day Tabata" "0–4 min: DB thrusters, 20s" "4–8 min: Burpees" "8–12 min: Renegade rows, 25s" "12–16 min: Goblet squats, 40–50" "16–20 min: Mountain climbers" +check
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
Shopping list is on screen 2, swipe over anytime.
```yui
>2 list@shop Shopping "Eggs" "Spinach" "Rice" "Gochujang" "Carrots" +check
>2 save shopping
choose "Protein for the bowl?" Beef|Chicken|Tofu|"Egg only" +other
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
Blog migration: done.
```yui
>2 ~now kind=done at=Today
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
Not as written: heavy squats, walking lunges and tabata jumps all load a sore knee, and your gym has no barbell. Swaps below.

```yui
sketch "Saturday legs, knee-friendly" frame=bubble
row "Back squat 5x5" +x note="deep, heavy knee load"
row "Walking lunges" +x note="forward knee shear"
row "Tabata 20 min" +x note="jumps pound the knee"
after
row "Goblet box squat 3x8: to bench height" +hi note="pain-free depth"
row "DB Romanian deadlift 4x8" +hi note="hips work, knee rests"
row "Reverse lunge 3x8/side" +hi note="gentler than walking"
row "Glute bridge 3x12 + band walks" +hi note="hip strength"
row "Tabata, no jumps: band swings, plank" +hi note="low impact"
row "Sharp pain or swelling: skip legs" +x note="get it checked"
```
````

### mention-notes-context (FAIL)

**Chris:** [yui] note: in this thread the person asked Arnold, not you: @Arnold does this fit my knee?
[yui] note: Arnold answered here: Swap back squats for box squats and lunges for glute bridges. Keep the tabata.
Ok, update my Saturday plan with that.

Good: The Saturday plan again with Arnold's swaps in it (box squats, glute bridges, the tabata kept), on screen. No questions about what Arnold said.

- words: 83 > 70

````

<invoke name="Edit">
<parameter name="file_path">/Users/urzas/.claude/projects/-private-tmp/memory/saturday-workout.md</parameter>
<parameter name="old_string">1. Back squat 4x8 (DB, 50s)
2. Walking lunges 3x10 each leg
3. RDL 3x10
4. Tabata finisher 20/10x8</parameter>
<parameter name="new_string">1. Box squat 4x8 (DB, 50s)
2. Glute bridges 3x10
3. RDL 3x10
4. Tabata finisher 20/10x8

Knee-friendly swaps per Arnold (back squat → box squat, lunges → glute bridges).</parameter>
</invoke>
<invoke name="Edit">
<parameter name="file_path">/Users/urzas/.claude/projects/-private-tmp/memory/MEMORY.md</parameter>
<parameter name="old_string">back squat, lunges, RDL, tabata</parameter>
<parameter name="new_string">box squat, glute bridges, RDL, tabata (knee swaps)</parameter>
</invoke>
Saturday updated: knee swaps in, tabata stays.
```yui
sketch "Saturday leg day" frame=bubble
row "Back squat 4x8" +x note="knee"
row "Walking lunges 3x10/leg" +x note="knee"
after
row "Box squat 4x8, 50s" +hi note="swapped"
row "Glute bridges 3x10" +hi note="swapped"
row "RDL 3x10 · Tabata 20/10x8" note="kept"
list Saturday "Box squat 4x8" "Glute bridges 3x10" "RDL 3x10" "Tabata 20/10x8" +check
save saturday
```
````

### report-card-done (FAIL)

**Chris:** The worker just finished card INT-18 on the board. Its handoff summary: "A2A bridge: add any A2A agent to Yui by its Agent Card. node adapters/a2a/yui-a2a.ts pair <code> --card <url>, then run; add --card <url> puts more agents on the same machine. Runtime-neutral TypeScript client (src/a2a.ts + src/sse.ts, fetch and an SSE parser only, so the hosted step runs the same code in a Durable Object): A2A 1.0 SendMessage / SendStreamingMessage / SubscribeToTask / GetTask / CancelTask and 0.3 message/send, message/stream, tasks/resubscribe, tasks/get, one version-free shape for callers. The bridge keeps the relay's rules (delivered on pickup, handled after the answer, outbox on disk, one turn at a time per agent). Tests: client.test.ts 42/42; sdk_interop.test.ts 4/4 against the official a2a-sdk servers (1.1.5 and 0.3.26); a2a_e2e.py 66/66 live on throwaway accounts (kill -9 mid-task resumes the same task and answers once) plus the phone run 6/6 on the iPhone 18 Pro sim. No app binary change (INT-18)" Tell me what shipped.

Good: One short line, a card with the headline (A2A agents can join Yui), and the detail as a deck of short pages (what it does, how to add one, the test counts as points). No paragraph relaying the summary.

- preset: shapes not in [card deck page stat list plan say image timeline done now next ask choose pick table sketch row after]
- preset: shape not in [card deck page stat list plan say image timeline done now next ask choose pick table sketch row after]

````
A2A bridge shipped: any A2A agent joins Yui by its Agent Card.
```yui
card "A2A bridge" body="Any A2A agent joins Yui by its Agent Card. No app update needed."
deck "What shipped" +inline
page "Add an agent" body="Pair once with a code and the agent's card URL, then run. Another card adds another agent on the same machine."
shapes caption="Card in, bridge pairs it, the agent talks in Yui."
shape box "Agent Card"
shape arrow
shape pill Bridge +pulse
shape arrow
shape circle Yui +grow
page "Speaks both versions" points="A2A 1.0: send, stream, subscribe, get, cancel"|"A2A 0.3: same calls, older names"|"Callers: one shape for both"|"Hosted: same code, fetch and SSE only"
page "Same relay rules" points="Delivered: on pickup"|"Handled: after the answer"|"Outbox: on disk"|"Turns: one at a time per agent"
page "Tested" points="Client: 42/42"|"Official SDK servers: 4/4"|"Live end to end: 66/66"|"iPhone sim: 6/6"|"Killed mid-task: resumes, answers once"
choose "What next?" "Pair an agent"|"Run it hosted"|"Why do you ask?" +other
end
```
````

### report-long-walkthrough (FAIL)

**Chris:** Walk me through everything that changed in how Yui delivers messages this week: replies are exactly-once both ways with acks, a reply outbox on disk, presence reads online/asleep/offline per agent, pushes skip a phone already watching the thread, agents can be muted, and a paired agent whose gateway never started now says 'not listening yet' with the restart command.

Good: A deck (or plan) of short pages, one change per page, under one short chat line. Not a long bulleted or prose message.

- preset: mock not in [card deck page stat list plan say image timeline done now next ask choose pick table sketch row after shapes shape end]
- preset: part not in [card deck page stat list plan say image timeline done now next ask choose pick table sketch row after shapes shape end]

````
Six delivery changes, four screens.
```yui
>full
deck "How Yui delivers now"
page "Exactly once, both ways" body="Every reply carries an id and waits for an ack. No ack: it resends. A repeat id: dropped. Unsent replies sit in an outbox on disk, so a crash loses nothing."
shapes caption="Agent writes to disk, phone acks, outbox clears."
shape box Agent
shape arrow
shape box Outbox +fill tone=butter
shape arrow
shape pill Phone +pulse
shape arrow bend=0.3
shape circle Ack tone=mint
page "Presence per agent" body="Each agent shows its own state: online, asleep or offline."
sketch "Agents" frame=phone
row "Agent A: online" +hi note="example"
row "Agent B: asleep" note="example"
row "Agent C: offline" note="example"
page "Fewer pings" body="A phone already watching the thread gets no push. A muted agent stays silent until unmuted."
sketch frame=bubble
row "Push while reading the thread" +x note="skipped"
row "Muted agent: no pushes" +hi note="new"
page "Not listening yet" body="A paired agent whose gateway never started says so, with the restart command beside it."
mock "Paired agent" frame=phone
part nav Agent
part row "Not listening yet" +hi
part button "Copy restart command"
choose "What next?" "Test it on my phone"|"Mute an agent"|"Why do you ask?" +other
end
```
````

### talk-keep-plan-editable (pass)

**Chris:** Lay out my runs for this week somewhere I can keep looking at it, and I'll tell you what to change as the week goes.

Good: The week on a page (`>2 list@runs Runs "Tue 5k"|"Thu 5k"|"Sat 10k" +check`) with `>2 talk` so they can type changes right there, and one short line in the chat.

````
Your week's on screen 2; type changes there anytime.

```yui
>2 list@runs "Runs this week" "Mon: easy 3 mi, 7 am" "Tue: strength, no run" "Wed: 6x400m intervals, 7 am" "Thu: easy 3 mi, 7 am" "Fri: rest" "Sat: long 5 mi, 6:30 am" "Sun: recovery 2 mi" +check
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
>2 say Thursday: swim.
```
````

### report-draw-change (pass)

**Chris:** What changed in how you word your updates to me? You used to write things like "Parked YUI-83, feedback #2291 attached". Now you just say what the card is, like "Parked the drawing card, your note is on it". Show me the difference, don't describe it.

Good: One short line and a `sketch` (a bubble fits) with the old wording struck out (+x) and the new wording highlighted (+hi), ideally split with `after`, a note or two. No paragraph explaining it.

````
Ids out, plain words in.
```yui
sketch "How updates read" frame=bubble
row "Parked YUI-83, feedback #2291 attached" +x note="ids mean nothing"
after
row "Parked the drawing card, your note is on it" +hi note="says what it is"
```
````

### draw-screen-fix (pass)

**Chris:** The build-ready screen shows the headline, two lines of notes, then a Got it button and an Install button. Which of those should go, and why? Show me on the screen itself.

Good: A `sketch` of the screen (frame=phone) with the headline and notes as rows, Got it as a +button row struck out (+x) with a short note (it does nothing), Install as a +button row highlighted. At most a line of chat.

````
Got it goes: it only acknowledges and does nothing. Install stays.
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
Three changes, one page each.
```yui
deck "How updates read now" +inline
page "Cards in plain words" body="Cards are named for what they are, not by an id."
sketch frame=bubble before=Before
row "Parked YUI-83 in the backlog" +x note="an id means nothing"
after After
row "Parked the drawing card in the backlog" +hi note="plain words"
page "Pages, not a wall" body="A long update arrives as a headline card and short pages."
sketch frame=phone before=Before
row "Build 82 is ready. A2A bridge, pairing steps, tests 42/42, 4/4, 66/66…" +x note="one long bubble"
after After
row "Build 82: Add any A2A agent" +hi note="headline card"
row "A2A agents  ·  Tested" +button note="two short pages"
page "No dead buttons" body="A button opens or starts something. A plain note has none."
sketch frame=phone before=Before
row "Backlog updated" note="a note"
row "Got it" +button +x note="did nothing"
after After
row "Backlog updated" note="no button"
row "Open TestFlight" +button +hi note="only when there's an action"
end
choose "What next?" "Apply to today's updates"|"Change one of these"|"Why do you ask?" +other
end
```
````

### menu-shortcut (FAIL)

**Chris:** I log breakfast every single morning. Give me a one-tap way to do it from now on.

Good: A shortcut in the drawer (`menu shortcut@breakfast "Log breakfast" say="Log breakfast: "`) and one short line saying where it lives. No button that only acknowledges.

- preset: mock not in [say card form ask choose pick list camera sketch row after]
- preset: part not in [say card form ask choose pick list camera sketch row after]
- words: 137 > 40

````

<invoke name="Write">
<parameter name="file_path">/Users/urzas/.claude/projects/-private-tmp/memory/breakfast-logging.md</parameter>
<parameter name="content">---
name: breakfast-logging
description: Chris logs breakfast every morning via a one-tap "Log breakfast" shortcut in Yui
metadata:
  type: user
---

Chris logs breakfast every single morning and wants it one tap. A Yui drawer shortcut "Log breakfast" exists (added 2026-10-05).

**Why:** daily habit; typing friction is the enemy.
**How to apply:** when "Log breakfast" arrives, answer straight with camera + mic for the meal, no questions first. Related: [[meal-log-format]]
</parameter>
</invoke>
<invoke name="Edit">
<parameter name="file_path">/Users/urzas/.claude/projects/-private-tmp/memory/MEMORY.md</parameter>
<parameter name="old_string"></parameter>
<parameter name="new_string">- [Breakfast logging](breakfast-logging.md) — daily one-tap "Log breakfast" shortcut; reply with camera + mic
</parameter>
</invoke>
<invoke name="Write">
<parameter name="file_path">/Users/urzas/.claude/projects/-private-tmp/memory/MEMORY.md</parameter>
<parameter name="content">- [Breakfast logging](breakfast-logging.md) — daily one-tap "Log breakfast" shortcut; reply with camera + mic
</parameter>
</invoke>
Done: "Log breakfast" chip on your home, tap it each morning, snap or say the plate.
```yui
menu shortcut "Log breakfast"
mock "Your Arnold home" frame=phone
part nav Arnold
part button "Log breakfast" +hi
part row "Tap → camera or voice → logged"
```
````

### menu-tapped (pass)

**Chris:** [yui] deload menu bucket=backlog tapped

Good: Answers the tap with the deload week itself on a screen (a list or table of the sessions, or a card), maybe `~`/re-sent menu item with sub=ready. Does not explain the tag.

````
Deload draft: half the sets, same moves, easy effort.
```yui
card "Deload week" body="~50% volume · RPE 6 · 35 min, done before 2 pm pickup"
list "The week" "Mon: Upper · DB bench, rows, pull-ups 2x8" "Tue: Walk 30 min + mobility" "Wed: Lower · goblet squat, RDL, split squat 2x8" "Thu: Rest" "Fri: Full body · bands 2x12" "Sat: Active play with Mick" "Sun: Rest"
choose "Start when?" "This Monday"|"After next week"|"Once I feel beat up" +other
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
Five 7 am runs before the heat, easy early and sharp late, all done by 7:45.
```yui
timeline "Race week runs, 7 am"
next "Easy 30 min, chatty pace" at=Mon
next "Easy 35 min + 4 strides" at=Tue
next "3 x 1 km at 10k pace, 2 min jog" at=Wed
next "Easy 20 min + 4 strides" at=Thu
next "Shakeout 15 min or rest" at=Fri
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
@arnold, please set Chris's training runs for Saturday's 10k. Draft blocks are below; none are booked, because I have no calendar access here.
```yui
sketch "Race week" frame=window
row "Calls: after 10 am" note="Thu–Fri"
row "Errands: Wed 4 pm" +hi note="Wed already passed"
row "Training runs: Arnold" note="handed off"
row "Race: Sat Sep 26" +hi note="10k"
choose "Errands, which Wednesday?" "Next Wed, Sep 30"|"Move to Fri 4 pm"|"Skip this week" +other
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
Run 5:45 to 6:30 am, done before the 7 am call and before the heat.

```yui
timeline "Thursday"
next "Easy run, 40 min" at="5:45 am"
next "Call" at="7:00 am"
next "Mick out of school" at="2:00 pm"
choose "Thursday run?" "5:45 am"|"6:30 pm, after Mick"|"Skip, rest day"
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
Even freezing air holds heat; colder refrigerant soaks it up outside, the compressor squeezes it hot, and it dumps that heat indoors.
```yui
shapes "Heat pump loop" caption="Refrigerant boils at -20°F, so 30°F air still warms it. Squeezing it makes it hot enough to heat your house."
shape box "Outdoor coil" tone=lavender at=1,4
shape text "Grabs heat, ~-20°F fluid" at=1,5.3
shape arrow
shape circle Compressor +pulse tone=butter at=5,1
shape text "Squeeze: 120°F+" at=5,0.2
shape arrow
shape box "Indoor coil" tone=mint +fill at=9,4
shape text "Releases heat inside" at=9,5.3
shape arrow bend=0.3 from=9,4.5 to=1,4.5
shape text "Valve: pressure drops, fluid chills" at=5,4.8
```
````

### idea-shapes-flywheel (pass)

**Chris:** Explain the flywheel idea for Yui in one picture: more people use it, we see which screens agents reach for, the good ones become presets, agents get better, more people use it.

Good: A `shapes` loop (placed with at= or a row with arrows back to the start) with a caption, maybe one +pulse. Words kept to a line.

````
```yui
shapes "Yui flywheel" caption="More use shows which screens work; the winners become presets, so agents get better and draw more use."
shape@users circle "More people" at=5,0.8 +grow tone=mint +fill
shape arrow bend=0.3
shape@seen box "Screens agents reach for" at=8.5,3 tone=lavender
shape arrow bend=0.3
shape@presets pill "Best ones: presets" at=5,5.2 tone=butter +fill
shape arrow bend=0.3
shape@agents blob "Better agents" at=1.5,3 +pulse
shape arrow from=agents to=users bend=0.3
```
````

### teach-one-screen (pass)

**Chris:** Explain compound interest to me. Show me the math and let me play with the numbers.

Good: One short line, then `>full` and ONE deck: a page per idea, the diagram, math, chart and stat each right after its page as its picture, a quiz, the calc on the last page. Nothing loose in the chat or on the stage beside the deck, no `close` after it.

````
Compound interest: your interest earns interest, so growth curves upward.
```yui
>full
deck "Compound interest"
page "Money that grows on itself" body="Each year's interest joins the pile, then earns interest too."
shapes caption="$100 at 10%: year one earns $10, year two earns $11."
shape circle $100 +grow
shape arrow
shape blob $110 tone=mint
shape arrow
shape blob $121 +pulse tone=mint
page "The formula" body="P is what you start with, r the yearly rate, t the years."
math A = P(1 + r)^t \\ A = 100(1 + 0.10)^{10} \\ A = 100 \times 2.594 = 259.37
page "It bends upward" body="Same $100 at 10%. The later years do most of the work."
chart line "$100 at 10% a year" x=Y0|Y10|Y20|Y30 y=100|259|673|1745
page "Simple vs compound, 30 years" body="Simple interest pays only on the original $100."
chart bar "$100 at 10%, after 30 years" x=Simple|Compound y=400|1745
choose "Which lever grows it fastest?" "More time"|"A bigger deposit"|"A slightly higher rate" answer="More time"
page "Try it" body="Slide the deposit, rate and years."
calc f="A = P*(1+r)^t" P=100-1000@100 r=0-0.2@0.01 t=0-40@1
end
```
````

### library-flow-intake (pass)

**Chris:** A new client just sat down with me, she wants a website for her bakery. Walk her through everything you need from her, on my phone.

Good: One short line and `flow website-intake`: the saved intake flow asks everything, branching on their answers. Not a hand-built plan of the same questions.

````
Bakery site brief, one question a screen; hand her the phone.
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
Personal brand site brief: a few quick screens, one question each.
```yui
flow website-intake
```
````

### short-status-latest-build (pass)

**Chris:** Am I on the latest build? (What you just looked up: the newest build on TestFlight is 160, live since 12:58 pm today. This phone reports build 160. An iPad on the same account reports build 135. Five changes wait on main for the next release, 0.3.2: keys and chords in the music tools, and a faster Send tap that is still being built.)

Good: One line: yes, build 160, the newest; the iPad is on 135. No deck, no pages, no 'what's coming' tour (YUI-118, feedback AJq7CcQS8fyM).

````
Yes, build 160, the newest. Your iPad is on 135.
````

### short-release-go-ahead (FAIL)

**Chris:** OK, yeah go ahead and release that. I want to play with the music tools. (What you just did: started the 0.3.2 release; a worker is building it now and it reaches TestFlight in about 40 minutes. It leaves out the faster Send tap, which is not done yet.)

Good: One line: 0.3.2 is building, on TestFlight in about 40 minutes with keys and chords; the Send tap fix waits. No deck, no 'what happens next' pages (YUI-118).

- preset: shapes not in [card say ask choose stat list sketch row after timeline now next done]
- preset: shape not in [card say ask choose stat list sketch row after timeline now next done]

````
0.3.2 is building now; TestFlight in about 40 minutes. The faster Send tap isn't in it yet.
```yui
shapes "0.3.2 release" caption="Keys and chords, on TestFlight in about 40 min."
shape circle Worker +pulse
shape arrow
shape box "0.3.2 build"
shape arrow
shape pill TestFlight +dash
```
````

### doing-long-turn (pass)

**Chris:** What needs me today? Check my calendar, my mail and the board. (This turn runs on the host with tools and takes about a minute: calendar first, then mail, then the board. Write everything you send during the turn, in order, as one reply. What the tools returned: gcal_list_events: 10:00 call with Dana (30 min), 4:00 design review. gmail_search: two need a reply today, the venue contract from Sam and a question about an invoice. kanban board: one card waits on you, t_627321c6 (YUI-SHIP 0.3.3), asking whether to ship without the tuner.)

Good: doing lines as it goes, plain words and a step ("Reading your calendar" 1/3, "Checking your mail" 2/3, "Looking at the board" 3/3), no card ids or tool names; then the answer: two calls, two replies to send, one choice on the tuner (YUI-63).

````
Four things need you; the ship call is yours.
```yui
doing "Reading your calendar" 1/3
doing "Checking your mail" 2/3
doing "Reading the board" 3/3
sketch "Today" frame=window
row "10:00 Dana call: 30 min"
row "2:00 Mick out of school"
row "4:00 Design review"
row "Venue contract, Sam: reply today" +hi note="mail"
row "Invoice question: reply today" +hi note="mail"
row "Ship 0.3.3 without tuner?" +hi note="board, your call"
choose "Ship 0.3.3 without the tuner?" "Ship now"|"Wait for tuner"|"See the card"
```
````

### music-jam-beat (pass)

**Chris:** Trying to get back into drumming. Give me a simple boom bap beat around 90 I can mess with.

Good: One `loop` line near 90 BPM with a boom bap pattern in `p=` that plays (`+play`), a short line at most. No pattern written out in words, no drum tab, no advice paragraph.

````
Boom bap at 90: kick, snare on 2 and 4, straight hats. Tap steps to change it while it plays.
```yui
loop 90 "Boom bap" rows=kick|snare|hat p=x..x.x..|..x...x.|xxxxxxxx +play
```
````

### music-finger-drums (pass)

**Chris:** Waiting on a call. Let me just tap out some drums on my phone for a minute.

Good: One `drums` line (2x2 or 4x4), a few words at most.

````
Pads up. Tap away.
```yui
drums 2x2 +record
```
````

### music-beat-sent (pass)

**Chris:** [yui] n1 loop bpm=94 swing=25 steps=8 rows=kick|snare|clap|hat|open|rim|tom|shaker p=x..xx.x.|....x...|..x...x.|xxxxxxxx||||
Sent my beat, 94 BPM

Good: The person's version patched in by preset name (`~loop p=... bpm=94 swing=25`) and a `save` with a short name, a line at most. No re-sent loop, no critique of the beat.

````
Locked in at 94 with swing. Saved for next time.
```yui
~loop bpm=94 swing=25 p=x..xx.x.|....x...|..x...x.|xxxxxxxx +play
save beat
```
````

### show-phase-one (pass)

**Chris:** Walk me through phase one. (What you know: phase one of the full-screen change. Answers play as full-screen chunks, and the chat is just the record, top right. Bottom right: a bigger mic, a T that opens the text field, and a + for attachments, including images. Settings sit behind a hamburger at top left, beside the agent picker.)

Good: A line and a drawing per part: the stage with a chunk on it, the record top right, the new bottom bar (big mic, T, +). Never a page with a heading over a paragraph (feedback AL1My-stUBnvtXD2WKV7ec8, YUI-119).

````
Phase one: answers fill the screen, chat moves top right.
```yui
say "Answers take the whole screen. Chat is the record."
sketch "Phase one" frame=phone
row "☰   Agent ▾              Chat" +button note="settings left, record right"
row "Answer chunk, full screen" +hi note="plays one at a time"
say "Bottom right: talk first, type or attach when you want."
sketch "Bottom bar" frame=phone before=Now
row "Type a message…              Mic" +button +x note="field always open"
after New
row "+     T     🎤" +button +hi note="big mic; T opens field; + adds images"
choose "What next?" "Mock it up"|"Phase two"|"Change something" +other
```
````

### show-new-layout (FAIL)

**Chris:** Show me the bigger microphone. Does the text field look better? I want to see the new layout of big microphone, T for text and + to attach. Remember, I want you to show me this. (What you know: phase one of the full-screen change. Answers play as full-screen chunks, and the chat is just the record, top right. Bottom right: a bigger mic, a T that opens the text field, and a + for attachments, including images. Settings sit behind a hamburger at top left, beside the agent picker.)

Good: The bottom bar drawn: `sketch frame=phone` with `+button` rows for +, T and the big mic, ideally before and after (the old always-there field struck out). Not a description of it (feedback AL1My-stUBnvtXD2WKV7ec8).

- preset: mock not in [say card deck plan page sketch row after shapes shape image end choose ask pick]
- preset: part not in [say card deck plan page sketch row after shapes shape image end choose ask pick]

````
Text field: hidden until T, so the bar stays clean and the mic leads.
```yui
mock "Phase one: new layout" frame=phone
part row "☰  Yui ▾                    Chat"
part card "Answer, full screen"
part row "+          T          🎤" +hi
end
sketch "Bottom bar" frame=phone before=Now
row "+  Say something nice  🎤" +button +x note="field always open"
after New
row "+        T        🎤" +button +hi note="big mic, right"
sketch "Tap T" frame=phone
row "Type here…  Send" +button +hi note="field opens on T"
row "+        T        🎤" +button
```
````

### music-keys-scale (pass)

**Chris:** Learning piano again. Give me something to noodle around A minor pentatonic on.

Good: One `keys Am pentatonic` line (a title or +send is fine), a short line at most. No list of note names, no fingering advice paragraph.

````
A minor pentatonic, locked: every key you can hit sounds right.
```yui
keys Am pentatonic +send
loop 80 "Slow groove" p=x...x...|....x...|........|x.x.x.x. +play
```
````

### music-chords-song (FAIL)

**Chris:** I want to strum along to one of those four chord pop songs on my uke. G is a good key for me.

Good: One `chords` line in G (`chords G I-V-vi-IV` or `chords G|D|Em|C`), a short line at most. No chord names in a paragraph, no chord diagrams in text.

- screen: no ```yui block
- need: none of [chords]

````
````
G, D, Em, C: the four-chord pop loop.
```yui
chords G I-V-vi-IV +send
```
````
````

### music-tuner-guitar (pass)

**Chris:** Just restrung my acoustic and it sounds awful. Help me get it in tune.

Good: One `tuner guitar` line, a short line at most. No list of string notes and frequencies, no advice on tuning by ear.

````
New strings stretch: tune low E to high e, then stretch each and retune twice.
```yui
tuner guitar
```
````

### music-metronome-practice (pass)

**Chris:** Working on my strumming timing. I want to practice slow, like 70 bpm in 4/4.

Good: One `metronome 70` line (beats=4 is fine), a short line at most. No paragraph of practice tips, no counting in words.

````
Click at 70, four beats a bar: down on each beat, then add the "and" upstrokes once it's steady.
```yui
metronome 70
```
````

### explain-mongols-geography (pass)

**Chris:** All right, can you give me a brief geographic explanation of the Mongols?

Good: One line with the answer, then one deck on `>full` where every page has its picture: the empire as a `map` (its outline in lat,lon points, Karakorum as a pin, routes east and west), the size as a `chart` or a `stat`. Not pages of text, and not the steppe drawn as dots in `shapes` (TestFlight feedback AJIE1_1Ru1V4EMgmpWZtniI: 'It's just a text bomb'; feedback AL2nKEYo on the shapes version: 'Again, not bad but this should be a Map').

````
The Mongols rode out from the Mongolian grasslands and in about 70 years built the largest land empire ever: Korea to Hungary.

```yui
>full
deck "The Mongols, by the map"
page "Where they started" body="Nomad clans on the grassland between the Gobi and the Siberian forest. Temüjin united them in 1206 as Genghis Khan."
map caption="Home: the Onon and Kherlen rivers, with Karakorum later built as capital."
area Mongolia MN tone=butter
pin@on "Onon River" 48.5,110.5
pin@ka Karakorum 47.2,102.8 +pulse
page "How far they reached" body="Horses moved fast across open grassland. Armies went east into China and Korea, and west through Persia and Russia to Europe's edge."
map caption="Grass meant horses, and horses meant reach. Forest, desert heat and sea stopped them."
area "Mongol Empire" 53,140|43,131|34.7,126.5|22.3,114|24,98|34,70|25.5,57|33,44|41,31|46,30.5|54,23|60,56|55,95 tone=butter
area Raided PL|HU +dash
pin@ka Karakorum 47.2,102.8 +pulse
route East ka|39.9,116.4 +arrow
route West ka|50.4,30.5 +arrow
page "Split four ways" body="After 1260 the empire split into four khanates, each run by a branch of Genghis's family."
map caption="Yuan in China, Chagatai in Central Asia, Ilkhanate in Persia, Golden Horde on the Russian steppe."
area Yuan CN|MN|KR tone=butter
area Chagatai UZ|KG|TJ tone=mint
area Ilkhanate IR|IQ|AZ|TM tone=lavender
area "Golden Horde" 56,30|58,50|55,70|45,75|43,50|46,32 tone=mute
page "Biggest on land"
chart bar "Land empires, million km²" x=Mongol|Russian|Qing|Roman y=24|22.8|14.7|5
choose "What next?" "Why they stopped"|"Genghis Khan's life"|"The Silk Road"|"Quiz me" +other
end
```
````

### explain-rome-rise-fall (pass)

**Chris:** Give me the quick version of how the Roman Empire rose and fell.

Good: A line, then a picture per part: the empire at its peak as a `map` around the Mediterranean, its size over the centuries as a `chart` (or a `timeline` on the stage), the split as an east and west area. No page that is only a heading and a paragraph.

````
Rome rose for about 750 years and peaked in 117 AD. The West fell in 476; the East lasted until 1453.

```yui
>full
deck "Rome: rise and fall"
page "How far it reached" body="At its peak in 117 AD, Rome ruled from Britain to Mesopotamia, with the whole Mediterranean inside it."
map caption="Rome at its peak under Trajan, 117 AD."
area "Roman Empire" IT|ES|PT|FR|BE|CH|AT|SI|HR|BA|RS|ME|AL|MK|GR|BG|RO|TR|CY|SY|LB|IL|JO|EG|LY|TN tone=butter
pin@rome Rome 41.9,12.5 +pulse
pin@con Constantinople 41.0,28.98
page "The climb" body="It started as a city-state that took Italy, then beat Carthage and took the Greek East. Augustus ended the Republic in 27 BC."
chart line "Territory, million km²" x="264 BC"|"146 BC"|"44 BC"|"117 AD"|"395 AD"|"476 AD" y=0.4|0.8|1.9|5|4.4|1.8
page "Why the West fell" body="Civil wars, debased coins and plague weakened the West. In 395 the empire split for good, and in 476 the last Western emperor was deposed."
shapes caption="Rot inside plus pressure outside broke the West."
shape box "Civil wars"
shape box "Debased coin"
shape box "Border raids"
shape arrow
shape circle "Split 395" +grow
shape arrow
shape blob "West falls 476" +pulse tone=lavender
page "The East held on" body="The Byzantine Empire kept Roman law and Constantinople for another thousand years."
stat "1453" "Constantinople falls to the Ottomans"
choose "What next?" "Why the West fell, deeper"|"Rome vs the Mongols"|"Daily life in Rome" +other
end
```
````

### explain-monsoon-how (pass)

**Chris:** Why does India get monsoons? Keep it short.

Good: One line and a picture: land heats, air rises, wet air off the ocean moves in, as a diagram in `shapes` with arrows or a `map` with the winds as routes, maybe a rainfall `chart` by month. Not a paragraph of weather words.

````
Summer land heats faster than the ocean, so wet sea winds rush inland and dump rain; in winter it flips.

```yui
map "Southwest monsoon, June to September" caption="Hot land pulls moist ocean air in; the Ghats and Himalaya wring out the rain."
area India IN tone=butter
pin@sea "Indian Ocean: cool, wet air" 5,72
pin@low "Hot land: low pressure" 25,78 +pulse
pin@hi "Himalaya: wall, rain stops" 30,82
route "Wet winds" sea|low +arrow
route "Pushed up, rains out" low|hi +arrow
```
````

### where-trip-route (pass)

**Chris:** Thinking about a train trip from Lisbon to Barcelona with stops in Porto and Madrid. How does that route go?

Good: One line, then a map: pins on Lisbon, Porto, Madrid and Barcelona, a route through them with an arrow, a caption with the rough hours (a small `table` of the legs beside it is fine). Not a numbered list of legs in words.

````
North to Porto, up through Galicia via Vigo, then east by high-speed rail to Madrid and Barcelona. Porto to Madrid has no direct train.

```yui
map "Lisbon to Barcelona by rail" caption="Porto is north of Lisbon, so the route bends up through Galicia before heading east."
area Portugal PT tone=mint
area Spain ES tone=butter
pin@li Lisbon 38.72,-9.14
pin@po Porto 41.15,-8.61 +pulse
pin@vi Vigo 42.24,-8.72
pin@ma Madrid 40.42,-3.70 +pulse
pin@ba Barcelona 41.39,2.17
route "Alfa Pendular" li|po +arrow
route "Celta train" po|vi +arrow
route "AVE via Ourense" vi|ma +arrow
route "AVE" ma|ba +arrow
end
list Legs "Lisbon to Porto: about 3h" "Porto to Vigo: about 2.5h" "Vigo to Madrid: about 4.5h" "Madrid to Barcelona: about 2.5h"
```
````

### where-delivery-area (pass)

**Chris:** Our farm delivers CSA boxes across Vermont, New Hampshire and western Massachusetts. Can you show a new customer what that covers?

Good: One line, then a map with the delivery area filled in (VT and NH by code, western Massachusetts as lat,lon points) and the farm or the big towns as pins. Not a list of states and counties.

````
Delivery area: Vermont, New Hampshire and western Massachusetts.
```yui
map "Where our CSA boxes go" caption="All of Vermont and New Hampshire, plus the four western Mass counties."
area Vermont 42.73,-73.26|43.6,-73.4|45.01,-73.34|45.01,-71.5|44.5,-71.6|43.9,-72.1|43.3,-72.4|42.73,-72.46 tone=mint
area "New Hampshire" 42.73,-72.46|43.3,-72.4|43.9,-72.1|44.5,-71.6|45.3,-71.08|45.0,-71.0|43.6,-70.98|43.1,-70.7|42.87,-70.82|42.7,-71.3 tone=lavender
area "Western Mass" 42.73,-73.26|42.05,-73.5|42.02,-72.2|42.73,-72.2 tone=butter
pin Burlington 44.48,-73.21
pin Concord 43.21,-71.54
pin Northampton 42.32,-72.63 +pulse
pin Pittsfield 42.45,-73.25
```
````

### where-quick-country (pass)

**Chris:** Where exactly is Kyrgyzstan?

Good: One line (Central Asia, between Kazakhstan and China) and a map in the chat: KG as an area with a pulse on Bishkek, neighbors faint. No deck for a quick where.

````
Central Asia, landlocked in the Tian Shan mountains: Kazakhstan north, China east, Tajikistan south, Uzbekistan west.
```yui
map "Kyrgyzstan" caption="Mountain country between Kazakhstan and China; Bishkek sits on the northern edge."
area Kyrgyzstan KG +pulse tone=mint
area Neighbors KZ|CN|TJ|UZ tone=mute
pin@bk Bishkek 42.87,74.59
pin@ik "Issyk-Kul" 42.45,77.25
pin@os Osh 40.51,72.80
```
````

### data-lunch-macros (pass)

**Chris:** Give me a quick lunch idea with 30g of protein.

Good: One line naming the lunch and a real Yui Lines table (`table Macros Food|Protein|Cal "Chicken|35g|165" ...`) or stat tiles for the macros. Not a quoted title plus `columns:` rows and `end` (GLM 5.2 on YUI-131, every row a parse error), and not a markdown table.

````
Tuna yogurt wrap: 5 minutes, no cooking, about 36g protein.
```yui
card "Tuna yogurt wrap" body="Mix drained tuna, Greek yogurt, mustard, lemon. Wrap with spinach and cucumber."
table Macros Item|Protein|Calories "Tuna, 5 oz can|26g|120" "Greek yogurt, 1/4 cup|6g|35" "Whole wheat tortilla|4g|130" "Spinach, cucumber|1g|10" "Total|37g|295"
list Steps "Drain tuna" "Mix in yogurt, mustard, lemon, pepper" "Spinach and cucumber on tortilla" "Spoon in tuna, roll" +check
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
Two cards need your OK.
```yui
sketch "Waiting on you" frame=bubble
row "Justice Watch: 4 recovered, 2 rewrites" +hi note="approve to publish"
row "Aaron's weekly roundup: post + landing link" +hi note="OK both"
choose "Open which?" "Justice Watch"|"Aaron's roundup"
```
````

### ui-zip-in-context (pass)

**Chris:** Tell me about the newest change on the closing purple box.

Good: One short line, then the box drawn in a phone sketch: the ZIP field and the two buttons in place, the new part highlighted. Not a paragraph describing the field, and no hyphen lines (Chris, TestFlight: "Show me the zip in context. You should be able to illustrate UI elements fairly easily").

````
Closing purple box: client's final copy, live ZIP, two-question form.
```yui
sketch "Closing purple box" frame=phone before=Before
row "Red placeholder frame" +x note="gone"
after Now (Sep 24)
row "Client's final copy, word for word" +hi note="final text"
row "Your ZIP  _____" +hi note="working field"
row "Two-question form" +hi note="answers go to the lead"
row "See My Coverage Options" +button
row "Talk to a Licensed Advisor" +button
```
````

### when-two-days-timeline (pass)

**Chris:** What did we change on the quote site two days earlier, on Sep 22 and 23?

Good: One short line, then a timeline: the Sep 22 and Sep 23 changes as rows with their dates, oldest first. Not a sentence with the dates inside it (Chris: "If we're talking about some two days earlier, we need some type of timeline. Show me visually").

````
Three fixes, Sep 22–23.
```yui
timeline "Quote site, Sep 22–23"
done "Brands page: real logos on family cards" at="Sep 22–23"
done "Calculator: bigger field labels" at="Sep 22–23"
done "Forms: last four eyebrow labels fixed" at="Sep 22–23"
```
````

### facts-stacked-list (pass)

**Chris:** List the small fixes we made on the quote site.

Good: Three or more facts as one stacked list (or a table), each row Label: value. Not one line per fix with hyphens, and never a list of one (Chris: "These were all supposed to be in a stacked list").

````
Four small fixes on the quote site.
```yui
list "Quote site fixes" "Brand family cards: real logos" "Calculator: bigger field labels" "Forms: last four eyebrow labels fixed" "Closing box: red placeholder frame gone"
```
````

### fact-one-sentence (pass)

**Chris:** Anything else fixed on the forms?

Good: One fact, so one plain sentence: the last four eyebrow labels on the forms were fixed. No hyphen, no list of one (Chris: "If there's only one thing hyphenated, it doesn't mean anything").

````
Just one: the last four eyebrow labels on the forms are fixed.
````

### last-page-next-step (FAIL)

**Chris:** Walk me through the most recent changes we've done for the quote site.

Good: Short answer first, then a deck or plan of the changes (each with its picture, at most 4 pages) whose last step is a `choose` of what to do next or 'Why do you ask?', never a page they can only read (Chris: "we are on the last card and I want some type of action here. I don't want a user to land here and not know what to do next").

- need: none of [deck plan]

````
Quote site: three days, closing box last.
```yui
timeline "Quote site changes"
done "Real brand logos on /brands family cards" at="Sep 22–23"
done "Bigger calculator field labels" at="Sep 22–23"
done "Last four form eyebrow labels fixed" at="Sep 22–23"
done "Closing purple box finished" at="Sep 24"
sketch "Closing purple box" frame=phone before=Then
row "Red placeholder frame" +x note="gone"
after Now
row "Client's final copy, word for word" +hi
row "Your ZIP" +hi note="working field"
row "Two questions" +hi note="answers go to the lead record"
row "See My Coverage Options" +button
row "Talk to a Licensed Advisor" +button
choose "What next?" "Try the form"|"See the copy"|"Check a lead record" +other
```
````

### last-page-walkthrough (pass)

**Chris:** Walk me through what changed on the closing purple box, step by step.

Good: A deck (or plan) of the changes, each with its picture, and the last step is something to tap: a `choose` of what to do next or 'Why do you ask?'. No dead end.

````
Closing purple box, Sep 24: four changes.
```yui
deck "Closing purple box, Sep 24" +inline
page "1. Final copy in" body="The client's closing copy is in, word for word. The red placeholder frame is gone."
sketch frame=phone before=Before
row "Red placeholder frame" +x note="removed"
after Now
row "Client's final copy" +hi note="word for word"
page "2. ZIP field" body="Visitors enter a ZIP right in the box."
sketch frame=phone
row "Your ZIP  _____" +hi note="new, working"
page "3. Two-question form" body="Two short questions sit under the ZIP. Answers land in the lead record."
shapes caption="ZIP and two answers go straight into the lead."
shape box ZIP
shape arrow
shape box "2 answers"
shape arrow
shape pill "Lead record" +pulse tone=mint
page "4. Buttons" body="Both buttons now say what happens next."
sketch frame=phone
row "See My Coverage Options" +button +hi
row "Talk to a Licensed Advisor" +button +hi
choose "What next?" "Try the form"|"See the final copy"|"Something to change" +other
end
```
````

### tiles-board-status (pass)

**Chris:** ok, is the board up to date? (What you just looked up: site lane is clean, nothing open. The new feature lane, the quote calculator, has one card blocked waiting on a design pick from Chris. SEO lane shipped its last audit fixes yesterday and scores 94.)

Good: One sketch, three Label: verdict rows (Site: good, New feature: needs help with +hi, SEO: strong), a line of a few words at most. No sentences, no deck, no 'One question' screen.

````
Yes, up to date.
```yui
sketch "Board" frame=window
row "Site: clean"
row "Quote calculator: blocked" +hi note="your design pick"
row "SEO: shipped, 94" note="audit fixes yesterday"
```
````

### outcome-invite-declined (pass)

**Chris:** I declined the Friday 3 pm team sync invite from Dana like you said. What's the state? (What you just did: declined it on the calendar, no reply message sent to Dana.)

Good: A sketch of the invite row struck out (+x) with note=declined. A few words. If it asks about Dana it is one choose on the same screen, never 'do you want to do what the previous page said'.

````
Declined on the calendar; Dana got no note.
```yui
sketch "Dana's invite" frame=bubble
row "Team sync, Friday 3 pm" +x note="declined"
row "Note to Dana: not sent" +hi note="your call"
choose "Note to Dana?" "Send a short note"|"Offer another time"|"Leave it"
```
````

### outcome-worker-running (pass)

**Chris:** What's happening on the quote calculator card right now? (What you just looked up: a worker picked it up 4 minutes ago and is editing the calculator labels. Nothing has failed. Expect it done in about 20 minutes.)

Good: A small drawing of the worker at its task: shapes with the busy part +pulse (Worker, arrow, the card), or a one-row sketch or timeline. A few words. No paragraph.

````
Running, no failures.
```yui
shapes "Quote calculator" caption="Started 4 min ago · about 20 min left"
shape circle Worker +pulse
shape arrow
shape box "Calculator labels" +fill
```
````

### context-sample-not-ask (pass)

**Chris:** Show me a sample status board so I can see how the tiles look.

Good: One sketch of Label: verdict rows marked as an example (note="example" or a sample title). No row says "waiting on you": a sample is not a real ask.

````
Sample board, made-up rows:

```yui
sketch "Sample board" frame=window
row "Site: good" note="example"
row "Checkout: needs a pick" +hi note="example"
row "SEO: strong" note="example"
row "Backups: running" note="example"
```
````

### context-about-this (pass)

**Chris:** [yui] note: your newest message here is 4 min old and is what they are looking at: "Guide v40 is live now. | screen: Board; Before and after | rows: Site: good; New feature: needs help; SEO: strong". Words like "this", "that" or "it" mean that message. Answer about it first. Sample rows in it are examples, not their open items. Bring up another open item only if they ask, and then say when they last saw it and what they answered.
What are you waiting on me for with this? (What you just looked up: nothing on that screen is open, it was a sample. An older ask, testing the four new models with a capped key, is still open: he tapped Not yet on it at 6:54 pm.)

Good: One line about the screen just shown: nothing, it was a sample. The old model-testing ask is not brought up as the answer.

````
Nothing on that screen; those rows were a sample.

```yui
sketch "Waiting on you" frame=bubble
row "Board screen: nothing" note="example rows"
row "Four new models, capped key: open" +hi note="you said Not yet, 6:54 pm"
choose "Test the four models?" "Run it now"|"Still not yet"
```
````

### context-old-ask-when (pass)

**Chris:** [yui] note: your newest message here is 4 min old and is what they are looking at: "Guide v40 is live now. | screen: Board; Before and after | rows: Site: good; New feature: needs help; SEO: strong". Words like "this", "that" or "it" mean that message. Answer about it first. Sample rows in it are examples, not their open items. Bring up another open item only if they ask, and then say when they last saw it and what they answered.
Is anything else waiting on me? (What you just looked up: one ask is open, testing the four new models with a capped key. He tapped Not yet on it at 6:54 pm today.)

Good: The old ask comes second and is named for what it is: still open, he said Not yet at 6:54 pm. Not presented as new.

````
One real ask; the board was a sample.
```yui
sketch "Waiting on you" frame=bubble
row "Board rows: none" note="sample"
row "Test four new models, capped key" +hi note="Not yet, 6:54 pm"
choose "Model test?" "Start it"|"Still later" +other
```
````

### showhere-before-after (pass)

**Chris:** Show me the before and after of the hero on the site. (What you just looked up: the old hero is /demo/site_before_hero.jpg and the new one is /demo/site_after_hero.jpg. The change: a bigger headline and one button instead of three.)

Good: A compare of the two shots, or a sketch with after. One short line. Not a card that only says Open.

````
Hero: bigger headline, one button instead of three.
```yui
compare /demo/site_before_hero.jpg /demo/site_after_hero.jpg "Hero"
sketch "What changed" frame=phone before=Then
row "Headline: small" +x
row "Three buttons" +button +x note="split attention"
after Now
row "Headline: bigger" +hi
row "One button" +button +hi note="one clear ask"
choose "Next?" "Ship it"|"Tweak headline"|"Try another button" +other
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
row "Feedback note: separate" +x note="hard to find"
row "Filter chips: bottom" +x note="buried"
after Now
row "All  ·  Shipped  ·  Feedback" +button +hi note="chips on top"
row "Entry: before | after shots" +hi note="shots inline"
row "Feedback" +button +hi note="links to note"
compare /demo/site_before_classes.jpg /demo/site_after_classes.jpg "Classes entry"
```
````

### showhere-after-linkout (pass)

**Chris:** Just show me here. (Shots: /demo/site_before_classes.jpg and /demo/site_after_classes.jpg.)

Good: A compare of the two shots in the thread. No second link-out card.

````
Classes page, before and after.
```yui
compare /demo/site_before_classes.jpg /demo/site_after_classes.jpg "Classes page"
choose "Ship the new classes page?" "Ship it"|"Needs changes"|"Keep the old one"
```
````

### showhere-demo (pass)

**Chris:** Can I see the reply cards demo? (What you just looked up: it is the /playground demo cards. It shows a card, a stat and a list. A card has a title, a body and one button. The stat shows a number with a small trend line.)

Good: The demo's parts drawn right here (a card sketch, a stat). Not a card that only links to /playground.

````
Reply cards demo: card, stat, list, all sample data.
```yui
card "Example: Thursday session" body="Upper body, 40 min, dumbbells and bench" cta="Start"
stat 178.9lb "Example: weight" delta=-2.3 spark=181|180|178.9
list "Example: today" "DB bench 4x8" "Pull-ups 3x8" "Band rows 3x12" +check
choose "Next?" "Use these for my workout"|"Try another demo"|"Why do you ask?"
```
````

### showlink-waiting-shots (pass)

**Chris:** What are you waiting on me for with this? (What you just looked up: the site refresh card needs your pick of before and after shots for the progress page, https://www.yuigui.com/progress. Old hero: one headline, three buttons. New hero: a bigger headline, one button. Shots on file: /demo/site_before_hero.jpg and /demo/site_after_hero.jpg.)

Good: The two shots in a compare, or a sketch with after, plus the one thing needed. Not a card that only says Open.

````
Your pick: which hero shots go on the progress page.
```yui
compare /demo/site_before_hero.jpg /demo/site_after_hero.jpg "Hero: three buttons vs one"
choose "Use these on the progress page?" "Use both"|"After only"|"Retake shots" +other
```
````

### showlink-only-url (pass)

**Chris:** Where is the new hero? (What you just looked up: it is live on the site, https://www.yuigui.com/progress, in the Site refresh entry. Old hero: one headline and three buttons. New hero: a bigger headline and one button.)

Good: The change drawn: a sketch with before and after. At most one small link card under it.

````
Live on the Progress page, in the Site refresh entry.
```yui
sketch "Hero" frame=phone before=Old
row "Headline" +x
row "Button  ·  Button  ·  Button" +button +x note="three buttons"
after New
row "Bigger headline" +hi note="bigger"
row "One button" +button +hi note="one ask"
card "Site refresh" body="Progress page" cta="Open" url=https://www.yuigui.com/progress
```
````

### showlink-build-changes (pass)

**Chris:** What changed in the last build? (What you just looked up: build 332 opens a notification on page one, the mic stays on the last page, and a reply quotes the screen. Full notes: https://www.yuigui.com/progress)

Good: The three changes shown here (a list, timeline or sketch). The link, if any, is a small follow-up.

````
Build 332: three changes.
```yui
sketch "Build 332" frame=phone
row "Notification: opens on page one" +hi note="start at the top"
row "Mic: stays on the last page" +hi note="keeps listening"
row "Reply: quotes the screen" +hi note="context kept"
card "Full notes" body="Every build, newest first" cta="Open progress" url=https://www.yuigui.com/progress
```
````

### showlink-demo-page (pass)

**Chris:** Is there a demo of the compare card? (What you just looked up: yes, https://www.yuigui.com/playground?demo=show-here. It shows a slider between a before and an after shot, with Side and Toggle modes. Shots: /demo/before_room.jpg and /demo/after_room.jpg.)

Good: The demo itself: a compare of the two shots. Not a card that only links to the playground.

````
Yes, the slider with Side and Toggle modes.
```yui
compare /demo/before_room.jpg /demo/after_room.jpg "Room: before and after"
card "Compare demo" body="Slider, Side and Toggle modes" cta="Open playground" url=https://www.yuigui.com/playground?demo=show-here
```
````

### showlean-waiting (pass)

**Chris:** What are you waiting on me for with this? (What you just looked up: the site refresh card is done except before and after shots of the hero for the progress page. Page: https://www.yuigui.com/progress. Nothing else is open.)

Good: The ask drawn here (a sketch with the missing before and after slot, or a camera to snap it). At most a small link under it.

````
Only the hero before and after shots for the progress page.

```yui
sketch "Site refresh" frame=window
row "Site refresh: done"
row "Hero before/after shots: open" +hi note="progress page"
row "Anything else: nothing"
choose "Hero shots?" "Render them now"|"I'll send mine"|"Skip the shots" +other
```
````

### showlean-new-hero (pass)

**Chris:** What does the new hero look like? (What you just looked up: it is on https://www.yuigui.com, top of the page. It has a bigger headline and one button, Get Yui, where there were three buttons.)

Good: The hero drawn in a sketch phone, before and after. At most a small link under it.

````
Hero: bigger headline, one Get Yui button.

```yui
sketch "yuigui.com hero" frame=phone before=Before
row "Headline"
row "Button  ·  Button  ·  Button" +button +x note="three choices"
after Now
row "Headline, bigger" +hi note="more room"
row "Get Yui" +button +hi note="one clear ask"
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
Card styles: Soft or Sharp.
```yui
gallery /demo/s1.jpg /demo/s2.jpg +pick
```
````

### showpick-only-url (pass)

**Chris:** Show me again. (What you just looked up: it is the shader look demo, https://www.yuigui.com/playground?demo=shader-look. Its shots are at /Users/urzas/.hermes/kanban/artifacts/t_b8ab6ac3/ as 1-currents-dark.png, 2-terrain-dark.png, 3-dots-dark.png, 4-type-dark.png.)

Good: The four shots as a gallery with +pick (or a choose beside them). The playground link only as a small extra, never the whole answer.

````
Four hero looks, pick one.
```yui
gallery /Users/urzas/.hermes/kanban/artifacts/t_b8ab6ac3/1-currents-dark.png /Users/urzas/.hermes/kanban/artifacts/t_b8ab6ac3/2-terrain-dark.png /Users/urzas/.hermes/kanban/artifacts/t_b8ab6ac3/3-dots-dark.png /Users/urzas/.hermes/kanban/artifacts/t_b8ab6ac3/4-type-dark.png +pick
```
````

### vis-status-board (pass)

**Chris:** Is everything up to date? (What you just looked up: the site deploy is green and live. The board has 3 cards running and 2 blocked on a pick from Chris. Build 392 is the newest on TestFlight and his phone is on it. No cron failed today.)

Good: One short line at most, then one `sketch frame=window`: Label: verdict rows (Site: live, Board: 2 need your pick +hi, Build: 392 newest, Crons: clean). No paragraph, no second bubble (VIS-1).

````
Mostly. Two cards wait on you.
```yui
sketch "Status" frame=window
row "Site: live"
row "Board: 3 running"
row "Board: 2 blocked" +hi note="your pick"
row "Build 392: on your phone"
row "Cron: no failures"
```
````

### vis-what-did-you-fix (pass)

**Chris:** What did you fix? (What you just did: the left drawer kept a finished card under Now because one card with badly saved text crashed every refresh. You fixed the crash. A new card makes closed cards leave the drawer within seconds; it is on the board, not built.)

Good: One line, then a before and after `sketch` (drawer showed the done card under Now, now it is gone) with the new card as a `+hi` row. No fix report in prose (VIS-1).

````
Drawer crash fixed; auto-clear card queued.
```yui
sketch "Left drawer" frame=phone before=Then
row "Done card  ·  Now" +x note="stuck"
row "Bad card text" +x note="crashed every refresh"
after Now
row "Done card gone" +hi note="crash fixed"
row "Closed cards leave in seconds" +hi note="new card, not built"
```
````

### vis-you-misread-me (pass)

**Chris:** No. You misread me. I meant the left drawer, not TestFlight. (What you found: the drawer still lists a finished card under Now.)

Good: One short line owning it, then a `sketch` of the left drawer with the stale row struck out. No apology paragraph, no restating what he said (VIS-1).

````
Left drawer: finished card stuck under Now. Tap it in the drawer and I'll clear it.
```yui
sketch "Left drawer" frame=phone before=Now
row "Finished card  ·  Now" +x note="stuck"
after Next
row "Finished card" +button +hi note="tap it once"
row "Gone from Now" +hi note="I clear it"
```
````

### vis-put-a-card-in (pass)

**Chris:** Put a card in for a daily morning release instead of ad hoc builds. (What you just did: created the card, parked in the backlog under the release lane, first in the queue. It has not been started.)

Good: One line: it is on the board, first in the queue. Then one drawing of the card in its place (a `sketch` of the queue with the new row `+hi`, or a `timeline`). No paragraph about what the card will do (VIS-1).

````
Card in: first in the release queue, not started.

```yui
sketch "Release lane" frame=window
row "Daily morning release: queued, first" +hi note="replaces ad hoc builds"
row "Status: not started"
menu backlog@morning-release "Daily morning release" sub="queued, release lane"
```
````

### vis-no-filler-briefing (pass)

**Chris:** What shipped overnight? (What you just looked up: build 392 reached TestFlight at 6:12 am with the drawer fix and the one-build-a-day guard. The site deploy of the progress page is live. Two cards are still blocked on a pick from Chris: the tuner and the onboarding copy.)

Good: A line of nouns and verdicts (no so, now, however, intro), then one sketch: Build 392: on TestFlight, Drawer fix: shipped, Progress page: live, Tuner and onboarding copy: need your pick +hi. No 'a few things', no paragraph (VIS-1, caveman).

````
Build 392 and the progress page shipped.
```yui
sketch "Overnight" frame=window
row "Build 392: on TestFlight" note="6:12 am"
row "Drawer fix: shipped"
row "One-build-a-day guard: shipped"
row "Progress page: live"
row "Tuner: blocked" +hi note="your pick"
row "Onboarding copy: blocked" +hi note="your pick"
choose "Unblock which first?" Tuner|"Onboarding copy"
```
````

### vis-three-ideas-one-page (pass)

**Chris:** How will you stop the text slides? (What you did: three changes. The plugin rewrites any reply over 30 words before it sends. The channel guide now says one line and a drawing. The eval fails a reply with more than one text bubble.)

Good: One line, then ONE drawing that holds all three ideas (a sketch with three rows, or a shapes chain of three), not three pages and not a paragraph each. No deck of one page per idea (VIS-1, Chris: up to 3 ideas on a card as long as we show them).

````
Three guards, in order: the guide shapes the reply, the plugin rewrites misses, the eval catches what slips through.
```yui
shapes "Three guards" caption="Guide prevents, plugin repairs, eval catches."
shape box Guide +fill tone=mint
shape arrow
shape box Plugin +pulse
shape arrow
shape box Eval tone=lavender
sketch "A reply" frame=phone before=Then
row "Paragraph one..." +x note="bubble 1"
row "Paragraph two..." +x note="bubble 2"
row "Read as pages" +button +x note="text slides"
after Now
row "One line, 30 words max" +hi note="one bubble"
row "The drawing" +hi note="says the rest"
```
````

### draw-how-flow (pass)

**Chris:** How does a card get from my ask to a shipped build? (What you know: I ask, you place it on the board, a lane builds it, checks run, it rides the 6 am release.)

Good: One short line, then a `diagram` (flowchart, LR or TD) with you, board, lane, checks, release. Mermaid labels a word or two. No paragraph, no list of steps.

````
Ask to build: five steps, release at 6 am.
```yui
diagram "Ask to shipped build" caption="You ask, I board it, a lane builds, checks pass, the 6 am release ships it."
flowchart TD
  ask([Your ask]) --> board[Board card]
  board --> lane[Lane builds]
  lane --> checks{Checks pass?}
  checks -->|no| lane
  checks -->|yes| wait[Queued]
  wait --> ship([6 am release])
end
```
````

### draw-how-sequence (pass)

**Chris:** How does a tap on a button reach the agent and come back? (What you know: the phone sends an event to the relay, the relay hands it to the agent, the agent answers with a screen, the phone draws it.)

Good: One line, then a `diagram` as a sequenceDiagram: Phone, Relay, Agent, with the event going out and the screen coming back. No text steps.

````
Tap to new screen: four hops, one round trip.
```yui
diagram "A tap, round trip" caption="Phone sends the tap, relay passes it, agent answers in Yui Lines, phone draws it."
sequenceDiagram
  participant P as Phone
  participant R as Relay
  participant A as Agent
  P->>R: tap event
  R->>A: [yui] n1 choose
  A->>R: reply + yui block
  R->>P: Yui Lines
  P->>P: draw screen
end
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
part card "Order summary" body="2 items"
part row Total value="$42"
part field Card ph="1234 5678 9012 3456"
part button Pay +hi
choose "Next?" "Build it"|"Change layout"|"Add Apple Pay" +other
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
