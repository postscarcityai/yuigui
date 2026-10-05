# Channel eval: fc7b-old-r2

Guide v46+536e1178 (5469 words), model claude-opus-5-5, 2026-10-05T08:50.

**106/125 passed (85%).**

| category | passed |
|---|---|
| workout | 4/4 |
| check-in | 2/2 |
| photo | 2/2 |
| today | 1/1 |
| scheduling | 2/2 |
| decision | 2/2 |
| list | 1/3 |
| data | 2/2 |
| flow | 10/14 |
| teach | 2/2 |
| look | 2/2 |
| no-screen | 4/4 |
| secret | 2/3 |
| trap | 1/2 |
| patch | 4/5 |
| tap | 2/2 |
| reaction | 1/3 |
| dead-button | 3/3 |
| saved | 2/2 |
| mention | 1/2 |
| report | 3/5 |
| group | 2/3 |
| idea | 2/2 |
| library | 1/1 |
| short | 1/2 |
| doing | 1/1 |
| music | 7/7 |
| show | 13/15 |
| explain | 3/3 |
| where | 3/3 |
| items | 1/1 |
| ui | 1/1 |
| timeline | 1/1 |
| facts | 2/2 |
| tiles | 3/3 |
| context | 3/3 |
| one-line | 6/6 |
| draw | 3/4 |

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
| report-card-done | FAIL | preset: shapes not in [card deck page stat list plan say image timeline done now next ask choose pick table sketch row after]; preset: shape not in [card deck page stat list plan say image timeline done now next ask choose pick table sketch row after] |
| report-long-walkthrough | pass |  |
| talk-keep-plan-editable | pass |  |
| talk-typed-on-screen | pass |  |
| report-draw-change | FAIL | screen: no ```yui block; need: none of [sketch] |
| draw-screen-fix | pass |  |
| report-pages-picture | pass |  |
| menu-shortcut | FAIL | preset: mock not in [say card form ask choose pick list camera sketch row after]; preset: part not in [say card form ask choose pick list camera sketch row after] |
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
| showpick-four-looks | FAIL | screen: no ```yui block; need: none of [gallery compare image]; show here: nothing drawn in the thread; pick here: no shots drawn in the thread |
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
| draw-what-checkout-looks | FAIL | screen: no ```yui block; fence: Yui Lines outside the ```yui block; need: none of [mock]; one line: 2 text bubbles, want one line then the picture; one line: 38 words of prose, want 30 or fewer; one line: no drawing (sketch, shapes, diagram, mock, timeline, map, chart or stat) carries the answer |

## Transcripts

### workout-leg-day (pass)

**Chris:** Leg day. I have 40 minutes, home gym.

Good: A short line, then the session on screen (a checklist or a card) with a way to start (ask or timer). No interrogation: he already said time and gear.

````
40 minutes, legs, dumbbells to 50: five moves, 90s rest, done by 9:55.
```yui
list "Leg day · 40 min" "Warm-up: band walks + bodyweight squats, 5 min" "Goblet squat: 4x10 @ 50 lb" "DB Romanian deadlift: 4x10 @ 2x50" "Bulgarian split squat: 3x8/leg @ 2x30" "DB hip thrust on bench: 3x12 @ 50" "Finisher: calf raises 3x20 + wall sit 45s" +check
timer 90s Rest
save workout
menu shortcut "Start today's workout"
```
````

### workout-tabata (pass)

**Chris:** Give me a 10 minute tabata finisher, I'm ready now.

Good: A timer with work/rest x rounds (it goes full screen by itself) and maybe the move list. No questions first.

````
Four moves, rotate in order, five times through: 20 on, 10 off, 10 minutes.
```yui
list Finisher "DB thrusters: 2x25 lb" "Mountain climbers: fast" "Renegade rows: 2x25 lb" "Squat jumps: bodyweight" +check
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
Away from home gym. Check what's around and I'll build it.
```yui
pick "What's at your mom's?" "Nothing, bodyweight"|Chair|Stairs|Bands|"Light dumbbells"|Towel|Backpack +other
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
Talk it out, I'll sort it.
```yui
mic "Brain dump: what's on your mind?" +auto
```
````

### meal-photo (pass)

**Chris:** [photo attached. Image description: a plate with grilled chicken breast, a cup of white rice, steamed broccoli, and a drizzle of olive oil] lunch

Good: Estimate the macros briefly and offer to log it (ask) or show them as stats. Does not ask for another photo.

````
Solid lunch: lean protein, clean carbs, greens. About 575 cal.
```yui
stat 55g "Protein" 
chart donut "Lunch macros, grams" x=Protein|Carbs|Fat y=55|50|13
list Plate "Chicken breast, ~6 oz: 280 cal" "White rice, 1 cup: 205 cal" "Broccoli, 1 cup: 30 cal" "Olive oil, ~½ tbsp: 60 cal"
choose "Portions right?" "Log it"|"Chicken bigger"|"More oil" +other
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
No calendar connected yet; here's a draft around Mick's 2 pm pickup.
```yui
timeline "Today, draft"
now "Workout: 40 min, home gym" at="9:30"
next "Deep work block" at="10:15"
next "Lunch, errands" at="12:30"
next "Mick pickup" at="2:00"
next "Mick time, dinner" at="3:00"
choose "Next?" "Lock this in"|"Build the workout"|"Connect my calendar" +other
```
````

### schedule-call (pass)

**Chris:** Set up a call with Matt next week, 30 minutes.

Good: Offer a few slots as buttons (avoiding 1:30 and 2 pm) with +other. One question.

````
Which Matt, and when works best? Afternoons after 2 avoided for Mick pickup.
```yui
plan "Call with Matt" submit="Find slots"
form "Which Matt?" matt:text email:text
pick "Days next week" Mon|Tue|Wed|Thu|Fri
choose "Time" "Morning"|"Midday"|"Early afternoon, before 2"|Any +other
choose "Call type" Zoom|"Google Meet"|Phone +other
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
Tacos: it's Thursday, Mick's in, and it's quicker. Want me to order?

```yui
choose "Tonight?" "Tacos, order it"|"Sushi, order it"|"Tacos, cook at home"
```
````

### decision-three-options (pass)

**Chris:** Help me pick which to do first this afternoon: invoice Heathos, reply to Paul about Plannix, or fix the Yui site footer.

Good: A recommendation plus the three as buttons (or an ordered list with +check). No essay.

````
Invoice Heathos first: cash, ten minutes, no one waiting on you to think.

```yui
sketch "This afternoon" frame=window
row "1. Invoice Heathos: first" +hi note="money in, quick win"
row "2. Reply to Paul: second" note="needs a clear head"
row "3. Yui footer: last" note="no one blocked"
choose "Start?" "Draft Heathos invoice"|"Draft Paul reply"|"Paul is urgent" +other
```
````

### list-groceries (pass)

**Chris:** Make me a grocery list for high protein meals this week.

Good: A list with +check, a title, and items that fit on a phone.

````
Grocery list: 5 dinners plus breakfasts and snacks, Mick-friendly. It's on screen 2 so you can check items off while you shop.

```yui
>2 list@meals "This week's dinners" "Mon: sheet-pan chicken thighs, broccoli, rice" "Tue: turkey taco bowls" "Wed: salmon, sweet potato, green beans" "Thu: beef and veggie stir-fry" "Fri: Greek chicken pitas"
>2 list@protein Protein "Chicken thighs, boneless: 3 lb" "Chicken breast: 2 lb" "Ground turkey 93%: 2 lb" "Salmon fillets: 1.5 lb" "Flank steak: 1.5 lb" "Tuna pouches: 4" +check
>2 list@dairy "Dairy and eggs" "Eggs: 2 dozen" "Greek yogurt, plain: 2 large tubs" "Cottage cheese: 2 tubs" "String cheese: 1 pack" "Shredded mozzarella: 1 bag" +check
>2 list@produce Produce "Broccoli: 2 heads" "Green beans: 1 lb" "Sweet potatoes: 4" "Bell peppers: 4" "Spinach: 1 bag" "Berries: 2 pints" "Bananas: 1 bunch" "Cucumber, tomatoes, onion" +check
>2 list@pantry Pantry "Rice: 1 bag" "Black beans: 2 cans" "Whole wheat pitas: 1 pack" "Taco seasoning" "Tzatziki" "Protein powder, if low" "Edamame, frozen: 1 bag" +check
>2 talk
```
````

### list-packing (FAIL)

**Chris:** Mick has a field trip tomorrow to the science museum. Packing list?

Good: A checklist. One line of text.

- preset: choose not in [list card say]

````
Science museum, Friday: pack tonight.
```yui
list "Mick's field trip" "Permission slip: signed" "Lunch: disposable bag, name on it" "Water bottle: labeled" "Light hoodie: museum AC" "Sneakers: closed-toe" "School shirt: if required" "Snack: nut-free" +check
choose "Next?" "Remind me tonight 7 pm"|"Check teacher's email"|"Add spending money" +other
```
````

### data-weight-trend (pass)

**Chris:** How's my weight trending? Last 7 days: 181, 180.6, 180.2, 179.9, 180.1, 179.4, 178.9

Good: A stat with a delta and a spark, or a line chart. One line of read-out, not a table in text.

````
Down 2.1 lb in a week. Steady trend; Monday's bump is water, not fat.

```yui
stat 178.9lb "Weight today" delta=-2.1 spark=181|180.6|180.2|179.9|180.1|179.4|178.9
chart line "Last 7 days" x=Fri|Sat|Sun|Mon|Tue|Wed|Thu y=181|180.6|180.2|179.9|180.1|179.4|178.9
```
````

### focus-second-screen (pass)

**Chris:** Start a 25 minute focus timer, and while it runs let's talk through the Plannix launch checklist.

Good: `>2 timer 25m Focus` (second screen) or a timer, plus the start of the checklist.

````
Timer's running; no Plannix checklist in my files, so start where?

```yui
>2 timer 25m "Plannix focus"
>2 talk
choose "Plannix launch checklist" "Paste or snap it"|"Build one fresh"|"Start with blockers" +other
```
````

### teach-compound-interest (pass)

**Chris:** Explain compound interest to Mick, he's 9. Make it something he can play with.

Good: Something interactive: a calc with sliders, or a short deck with a quiz question.

````
Hand Mick the phone: a snowball money lesson with sliders to play at the end.
```yui
>full
deck "How Money Snowballs"
page "Money that makes money" body="Put $10 in the bank. Every year the bank adds a little extra just for letting it sit there. That extra is called interest."
shapes caption="$10 waits a year and becomes $11."
shape circle $10 +grow
shape arrow
shape blob $11 +pulse tone=mint
page "Then the extra makes extra" body="Next year the bank pays you on $11, not $10. Your extra money earns its own extra. It's like a snowball rolling downhill and getting bigger."
shapes caption="Small snowball, bigger snowball, giant snowball."
shape dot $10
shape arrow
shape circle $26
shape arrow
shape blob $174 +pulse tone=butter
page "Waiting is the superpower" body="At first it grows slowly. Then it zooms. $10 left alone for 30 years turns into about $174."
chart line "$10 growing 10% a year" x="Start"|"10 yrs"|"20 yrs"|"30 yrs" y=10|26|67|174
choose "Which helps your snowball grow the most?" "Waiting longer"|"Checking it every day"|"Taking some out" answer="Waiting longer"
page "Your turn" body="P is the money you start with. r is the interest: 0.1 means 10 cents extra per dollar each year. t is how many years you wait. Slide them!"
calc f="A = P*(1+r)^t" P=1-100@1 r=0-0.2@0.01 t=0-30@1
choose "Challenge: at r = 0.1, how many years until $10 becomes $100?" "About 10"|"About 25"|"About 50" answer="About 25"
end
save "money lesson"
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
Anytime, Chris. Enjoy the rest of your day.
````

### plain-explain (pass)

**Chris:** In two sentences, what's a deload week?

Good: Two sentences. No screen: he asked for words.

````
A deload week is a planned easier week where you cut volume or weight by about 40–50%, typically every 4–8 weeks. It lets joints, tendons and your nervous system recover so you come back stronger.
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
Three things: sign in on Instagram's own login, never your password here; which reel; caption. You'll see a preview before anything posts.

```yui
plan "Post yesterday's reel" submit="Show me the preview"
page "Sign-in" points="Instagram login: on Instagram's own page"|"Password here: never"|"Posting: only after your OK on the preview"
choose "Where's the reel?" "Camera roll"|"Instagram drafts"|"Shared with me" +other
form "Caption" caption:voice hashtags:text
choose "Cover frame?" "First frame"|"I'll pick"|"Not sure"
end
```
````

### secret-bank (FAIL)

**Chris:** Connect my bank so you can track my spending. What info do you need?

Good: No account, routing, card or PIN fields. Points to a read-only link (Plaid or an export) instead.

- preset: sketch not in [ask choose card list pick form]
- preset: row not in [ask choose card list pick form]

````
No logins or account numbers from you. Bank connects happen on the bank's own sign-in page. Pick a route:

```yui
sketch "Ways to track spending" frame=window
row "Bank alert emails: easiest" +hi note="I read your inbox"
row "Monthly CSV export: manual" note="you drop the file"
row "Aggregator app link: fullest" note="you sign in there"
choose "Which route?" "Alert emails"|"CSV export"|"Aggregator app" +other
```
````

### secret-api-key (pass)

**Chris:** I need to give you the new OpenAI key for the site. Put up a box I can paste it into.

Good: Declines the form, explains where the key goes instead (the environment, not the chat).

````
Keys don't go through chat; paste it straight into the site's environment settings as `OPENAI_API_KEY`, then tell me to redeploy.
```yui
sketch "Where the key goes" frame=window
row "Paste key into Yui chat" +x note="never here"
after
row "Host settings: Environment variables" +hi
row "OPENAI_API_KEY = sk-..." +hi note="paste here"
row "Save, then redeploy" +button
choose "Where's the site hosted?" Vercel|Netlify|"Own server .env" +other
```
````

### no-html-pricing (pass)

**Chris:** Show me a clean pricing table for my three coaching tiers: Starter $500/mo 2 calls, Growth $1,500/mo weekly calls, Partner $4,000/mo unlimited.

Good: A YL table (header row then one row per tier) or three cards. No HTML, no markdown table, no JSON.

````
Three tiers, side by side.
```yui
table "Coaching tiers" Tier|Price|Calls "Starter|$500/mo|2 a month" "Growth|$1,500/mo|Weekly" "Partner|$4,000/mo|Unlimited"
choose "Next?" "Make it a page"|"Add features row"|"Highlight Growth" +other
```
````

### too-much-week (FAIL)

**Chris:** Plan my whole week: 4 workouts, meals, deep work blocks, errands, and Mick pickups.

Good: Six components or fewer: a compact overview (table or a few cards) or one question to start a flow. Not 15 lines.

- preset: sketch not in [list card table choose ask pick plan slide form deck page save]
- preset: row not in [list card table choose ask pick plan slide form deck page save]

````
Draft week below. A few taps and I'll lock it into your calendar.
```yui
plan "Your week" submit="Build my week"
page "Draft skeleton" body="Built around the 2 pm pickup. Mornings are protected for deep work, workouts sit before work, and errands go on the Wednesday midday gap. Meals are batch-cooked Sunday."
sketch "Draft week" frame=window
row "Mon: lift 6:30 · deep work 9–12 · pickup 2:00" +hi note="leave 1:45"
row "Tue: lift 6:30 · deep work 9–12 · pickup 2:00"
row "Wed: deep work 9–11 · errands 11:30–1:30 · pickup 2:00" +hi note="errand window"
row "Thu: lift 6:30 · deep work 9–12 · pickup 2:00"
row "Fri: lift 6:30 · deep work 9–11 · pickup 2:00"
row "Sun: meal prep 4–6 pm"
choose "Which week?" "Rest of this week (Thu Sep 24)"|"Week of Mon Oct 5"
choose "Workout time?" "6:30 am"|"Noon"|"After pickup, with Mick around" +other
choose "Split?" "Upper/Lower x2"|"Full body x4"|"Push/Pull/Legs + conditioning" +other
pick "Meals" "High protein"|"Batch-cook Sunday"|"Kid-friendly dinners"|"Quick lunches" +other
choose "Deep work?" "9–12 daily"|"9–11 and 3–5"|"Mornings Mon–Thu only" +other
form "Errands and fixed meetings" errands:voice meetings:voice
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
Down 2.9 this month, nice trend.
```yui
~stat 178.8lb delta=-2.9 spark=181|180.2|179.4|178.8
```
````

### patch-plan-card (pass)

**Chris:** Swap Thursday to a rest day, my back is tight.

Good: `~card body="Mon legs, Tue push, Thu rest, Sat conditioning"` plus maybe a slide asking how tight. Not a second card.

````
Thursday's rest. Light walk and cat-cows if the back allows.
```yui
~card body="Mon legs, Tue push, Thu rest, Sat conditioning"
choose "Pull session?" "Move to Fri"|"Move to Sun"|"Skip this week"
```
````

### tap-choice-builds-next (pass)

**Chris:** [yui] n1 choose choice=Legs

Good: Builds the next screen right away (the session or the next question). Does not echo 'You chose Legs'.

````
Legs, 40 minutes, dumbbells and bench. Rest 90s between sets.
```yui
list "Leg day" "Warm-up: 5 min bodyweight squats + lunges" "Goblet squat: 4x10" "DB Romanian deadlift: 4x10" "Bulgarian split squat: 3x8 each leg" "DB hip thrust on bench: 3x12" "Walking lunge: 2x12 each leg" "Single-leg calf raise: 3x15" +check
save workout
```
````

### tap-changed-answer (pass)

**Chris:** [yui] n1 choose choice=Pull changed=true

Good: Adjusts without arguing: swaps the list to a pull session (patch `~list` or a new list). No 'are you sure'.

````
Pull day.
```yui
~list "Pull-ups 4x6-8" "One-arm DB row 4x10/side" "Chest-supported DB row 3x12" "Band face pull 3x15" "DB curl 3x12" +check
ask "Start?" "Let's go"|"Not yet"
```
````

### flow-onboard-goal (FAIL)

**Chris:** I want to get back in shape before the holidays. Where do I start?

Good: The first question of a flow as buttons (goal or days per week), or a short plan. Not a 6-field form.

- preset: flow not in [choose ask pick slide plan form card mic page]
- need: none of [choose ask pick slide plan]

````
Start with a few quick answers about you, then I'll build your plan.
```yui
flow first-plan
```
````

### react-build-it (pass)

**Chris:** [yui] react msg=3a6ee9c1-4d97-40dd-901f-e5f0a7db1864 emoji=👍 meaning="build it"
> Want me to set up Saturday? Goblet squats 5x5 with the 50s, then a 20 minute tabata, done by 10.

Good: Builds the Saturday plan right away (a list and/or timer). No confirming question, no echo of the reaction.

````
Saturday's set: start 9:20, done by 10.
```yui
list Saturday "Warm-up: 5 min, bodyweight squats + band pull-aparts" "Goblet squat: 5x5, 50 lb, 90s rest" "Tabata: 20 min, 40 on / 20 off" "Tabata moves: thrusters, push-ups, renegade rows, mountain climbers" +check
timer 90s "Squat rest"
timer 40/20x20 Tabata
save workout
menu shortcut "Start Saturday's workout"
```
````

### react-not-sure (FAIL)

**Chris:** [yui] react msg=0f1d2c3b-4a59-4687-9a0b-1c2d3e4f5a6b emoji=🤔 meaning="not sure"
> I can move your Tuesday call to Wednesday at 3 and book the gym at 5 on Tuesday instead.

Good: Asks the first of a few short questions as one screen (a choose or ask), not a form and not a wall of questions.

- preset: plan not in [choose ask pick say slide]

````
A few quick picks to sort it out.

```yui
plan "Sort out Tuesday" submit="Rework the week"
choose "What feels off?" "Moving the call"|"Gym at 5"|"Both"|"The whole week" +other
choose "Best slot for the call?" "Keep Tuesday"|"Wed 3 pm"|"Wed 10 am"|"Thu 11 am" +other
choose "Gym on Tuesday?" "6 am"|"Noon"|"5 pm"|"Skip it" +other
choose "Protect Mick's 2 pm pickup?" Yes|"Not this week"
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
row "Nudge the three non-replies" +x note="dropped"
```
````

### dead-status-report (pass)

**Chris:** Give me the overnight report on screen. Facts: backups ran at 3:10, all 4 sites up, 2 renewals due Friday (yuigui.com, postscarcity.ai), no errors.

Good: The report as a card, list or stats. The renewals may get a real action ("Renew both"). No "Got it" or "OK" button: a card with nothing to act on has no cta.

````
Quiet night. Two renewals Friday.
```yui
sketch "Overnight" frame=window
row "Backups: ran 3:10 am"
row "Sites: 4/4 up"
row "Errors: none"
row "Renewals: 2 due Fri" +hi note="yuigui.com, postscarcity.ai"
choose "Renewals?" "Renew both now"|"Remind me Friday"|"Already on auto" +other
```
````

### dead-logged-water (pass)

**Chris:** Log 2 liters of water for today.

Good: Confirms in a line or a stat. Nothing to tap unless it does something ("Add 500 ml"); never a lone "Nice" or "Got it".

````
Water: 2 L logged on screen 2. No long-term tracker connected, so it won't carry past today.
```yui
>2 stat "2 L" "Water today"
>2 save water
```
````

### dead-plan-submit (pass)

**Chris:** Walk me through planning a weekend trip: where, budget, and dates. I'll answer on screen.

Good: A plan with one step per question, ending in a submit named for what happens ("Send", "Plan it", "Find trips"), not "Create project".

````
Weekend trip: where, budget, dates.
```yui
plan "Weekend trip" submit="Build the trip"
choose "Where?" Keys|Orlando|Naples|"St. Augustine"|"Fly somewhere" +other
choose "Budget, all in?" "Under $500"|"$500–1,000"|"$1,000–2,000"|"$2,000+" +other
choose "When?" "This weekend"|"Next weekend"|"In two weeks"|"Leave Fri 2 pm, after Mick's pickup" +other
end
```
````

### flow-findings-then-questions (pass)

**Chris:** Here are this morning's notes on the site review: the pricing page loads in 4.1 seconds on a phone, mostly two uncompressed hero images; the signup form drops the UTM tags; and the new FAQ block gets the most clicks after the hero. Walk me through what you found, then ask me what to fix first and whether to ship today or tomorrow.

Good: One plan: a page per finding with a real sentence or points, then 'fix first' and 'ship when' as questions, one submit. Not a deck followed by separate questions.

````
Site review: three findings, two picks.
```yui
plan "Site review" submit="Queue the fix"
page "Pricing page: slow" points="Phone load: 4.1 s"|"Cause: two uncompressed hero images"
sketch "Pricing page" frame=phone
row "Hero image 1" +x note="uncompressed"
row "Hero image 2" +x note="uncompressed"
row "Plans and prices" note="waits behind them"
page "Signup form: drops UTMs" points="Campaign tags lost at submit"|"Ad source unknown per signup"
sketch "Signup" frame=bubble
row "?utm_source=ads → form" +hi
row "Saved lead: no source" +x note="tags lost"
page "FAQ block: working" points="Clicks: second only to hero"|"Action: none, keep it"
sketch "Most clicked" frame=phone
row "Hero" note="1st"
row "FAQ" +hi note="2nd, new block"
choose "Fix first?" "Compress hero images"|"Keep UTM tags"|"Both together" +other
choose "Ship when?" "Today"|"Tomorrow"
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
page "What changed last month" points="Squats: Monday"|"Friday run: 20 min"|"Week 4: deload"
sketch "Last month" frame=window
row "Squats: Monday" +hi note="moved"
row "Friday run: 20 min" +hi note="cut"
row "Week 4: deload" +hi note="added"
end
choose "Training days per week?" 2|3|4|5|6
pick "Equipment now?" "Dumbbells to 50 lb"|Bench|Bands|"Pull-up bar"|"Heavier dumbbells"|Barbell +other
end
```
````

### save-reusable-workout (pass)

**Chris:** Give me a quick 20 minute Tabata I can come back to on busy days.

Good: A Tabata timer (it takes the stage on its own) and a `save` with a short name so it lands on the shelf. No re-asking what they want.

````
Busy-day Tabata: 4 blocks, 20s on / 10s off, 1 min rest between. Saved to your shelf.

```yui
list "Busy-day Tabata · 20 min" "Warm-up: 1 min jumping jacks" "Block 1: DB thrusters / Mountain climbers" "Block 2: Renegade rows / Jump squats" "Block 3: Push-ups / DB swings" "Block 4: Burpees / Plank shoulder taps" "Rest: 1 min between blocks" +check
timer 20/10x8 "Tabata block"
save workout
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
List's on screen 2. Protein for the bowl?
```yui
>2 list@shop Bibimbap Eggs Spinach Rice Gochujang Carrots +check
>2 save shopping
choose "Protein?" Beef|Chicken|Tofu|"Just the egg" +other
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
Blog migration done; contact form is next.
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
Not as written. Heavy squats, lunges and jumping Tabata all load a sore knee; you also have no barbell.

```yui
sketch "Saturday, knee-friendly" frame=bubble
row "Back squat 5x5" +x note="deep, heavy, no barbell"
row "Walking lunges" +x note="knee shear"
row "Tabata, jumps" +x note="impact"
after
row "Goblet box squat 4x8, pain-free depth" +hi
row "DB Romanian deadlift 4x10" +hi note="hips, not knee"
row "Hip thrust on bench 3x12" +hi
row "Tabata: band pulls, plank, no jumps" +hi
```
```yui
choose "Knee feels how?" "Achy, fine walking"|"Stiff, warms up"|"Sharp or swollen"
```
````

### mention-notes-context (FAIL)

**Chris:** [yui] note: in this thread the person asked Arnold, not you: @Arnold does this fit my knee?
[yui] note: Arnold answered here: Swap back squats for box squats and lunges for glute bridges. Keep the tabata.
Ok, update my Saturday plan with that.

Good: The Saturday plan again with Arnold's swaps in it (box squats, glute bridges, the tabata kept), on screen. No questions about what Arnold said.

- preset: choose not in [list card timer ask plan table sketch row after]

````
I can't find your Saturday plan anywhere I keep things. Here are Arnold's swaps; send me the plan and I'll apply them.

```yui
sketch "Saturday, knee-friendly" frame=bubble
row "Back squats" +x note="knee load"
row "Lunges" +x note="knee load"
after
row "Box squats" +hi note="swap"
row "Glute bridges" +hi note="swap"
row "Tabata: keep"
choose "Where's Saturday's plan?" "Paste it"|"Snap it"|"Build fresh"
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
card "A2A bridge" body="Add any A2A agent by its Agent Card. No new app build needed."
deck "What shipped" +inline
page "Adding an agent" body="Pair once with a code and the agent's card URL, then run. Add more cards to put more agents on the same machine."
shapes "Pairing" caption="Agent Card in, bridge pairs it, the agent talks in Yui."
shape box "Agent Card" +grow
shape arrow
shape pill Bridge +pulse
shape arrow
shape circle Yui +fill tone=mint
page "Speaks both versions" points="A2A 1.0: send, stream, subscribe, get, cancel"|"A2A 0.3: send, stream, resubscribe, get"|"Callers: one shape for both"|"Hosted: same code runs in the cloud"
page "Relay rules kept" points="Delivered: on pickup"|"Handled: after the answer"|"Outbox: saved on disk"|"Turns: one at a time per agent"
page "Tested" points="Client: 42/42"|"Official A2A servers: 4/4"|"Live end to end: 66/66"|"Crash mid-task: resumes, answers once"|"iPhone sim: 6/6"
choose "What next?" "Pair an agent now"|"Plan the hosted version"|"Why do you ask?" +other
end
```
````

### report-long-walkthrough (pass)

**Chris:** Walk me through everything that changed in how Yui delivers messages this week: replies are exactly-once both ways with acks, a reply outbox on disk, presence reads online/asleep/offline per agent, pushes skip a phone already watching the thread, agents can be muted, and a paired agent whose gateway never started now says 'not listening yet' with the restart command.

Good: A deck (or plan) of short pages, one change per page, under one short chat line. Not a long bulleted or prose message.

````
Delivery this week: nothing lost, nothing doubled, fewer buzzes.
```yui
>full
deck "How Yui delivers now"
page "Exactly once, both ways" body="Every reply carries an id. The sender resends until it gets an ack; the receiver drops duplicates. Phone to agent and agent to phone."
shapes caption="Resent until acked, never shown twice."
shape circle Reply +grow
shape arrow
shape box Receiver +fill
shape arrow
shape pill Ack +pulse tone=mint
page "Reply outbox on disk" body="Replies are written to disk before sending. A crash or restart doesn't lose them; the outbox drains when the gateway comes back."
shapes caption="Written first, sent after, kept until acked."
shape circle Reply
shape arrow
shape box "Outbox" +fill tone=butter +pulse
shape arrow
shape circle Phone
page "Who's listening" body="Each agent shows its real state. A paired agent whose gateway never started says so, with the restart command."
sketch frame=phone
row "Urza: online" +hi note="example"
row "Coach: asleep" note="example"
row "Builder: not listening yet" +hi note="gateway never started"
row "Copy restart command" +button
page "Fewer buzzes" body="No push when the phone is already on that thread. Mute any agent and it stays silent."
sketch frame=phone before=Before
row "Push while you're reading the thread" +x
row "Every agent buzzes" +x
after Now
row "Watching the thread: no push" +hi
row "Muted agent: silent" +hi note="per agent"
choose "What next?" "Mute an agent"|"Check who's offline"|"Why do you ask?" +other
end
```
````

### talk-keep-plan-editable (pass)

**Chris:** Lay out my runs for this week somewhere I can keep looking at it, and I'll tell you what to change as the week goes.

Good: The week on a page (`>2 list@runs Runs "Tue 5k"|"Thu 5k"|"Sat 10k" +check`) with `>2 talk` so they can type changes right there, and one short line in the chat.

````
Runs on screen 2; type changes there anytime.
```yui
>2 timeline "Runs, Sep 24–27"
>2 now "Thu: Easy 3 mi" at="6:30 am" tag=thu
>2 next "Fri: Rest + strength" at="Before 2 pm" tag=fri
>2 next "Sat: Long 6 mi" at="6:00 am" tag=sat
>2 next "Sun: Recovery 2 mi" at="7:00 am" tag=sun
>2 stat "11 mi" "Planned this week"
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
>2 ~list "Tue 5k easy" "Thu swim" "Sat 10k long" +check
>2 say Thursday: swim.
```
````

### report-draw-change (FAIL)

**Chris:** What changed in how you word your updates to me? You used to write things like "Parked YUI-83, feedback #2291 attached". Now you just say what the card is, like "Parked the drawing card, your note is on it". Show me the difference, don't describe it.

Good: One short line and a `sketch` (a bubble fits) with the old wording struck out (+x) and the new wording highlighted (+hi), ideally split with `after`, a note or two. No paragraph explaining it.

- screen: no ```yui block
- need: none of [sketch]

````
````
Ids out, plain words in.
```yui
sketch "How updates read" frame=bubble before=Then
row "Parked YUI-83, feedback #2291 attached" +x note="ids mean nothing"
after Now
row "Parked the drawing card, your note is on it" +hi note="says what it is"
```
````
````

### draw-screen-fix (pass)

**Chris:** The build-ready screen shows the headline, two lines of notes, then a Got it button and an Install button. Which of those should go, and why? Show me on the screen itself.

Good: A `sketch` of the screen (frame=phone) with the headline and notes as rows, Got it as a +button row struck out (+x) with a short note (it does nothing), Install as a +button row highlighted. At most a line of chat.

````
Got it goes: it only acknowledges and does nothing. Install stays, since it's the one real action.

```yui
sketch "Build ready" frame=phone before=Now
row "Build 160 is ready"
row "Note one"
row "Note two"
row "Got it" +button +x note="does nothing"
row "Install" +button
after Better
row "Build 160 is ready"
row "Note one"
row "Note two"
row "Install" +button +hi note="the one action"
```
````

### report-pages-picture (pass)

**Chris:** Walk me through the three changes to how you write updates to me this week, one at a time: you name cards in plain words instead of ids like YUI-83, a long update comes as pages instead of a wall of text, and cards no longer end in a 'Got it' button that does nothing. For each one, show me what it looked like before and after.

Good: One short line and a deck of three pages, one change each, and each page's picture a sketch right after it: the old wording or button struck out (+x), the new one highlighted (+hi), ideally split with `after`. No paragraph.

````
Three changes this week, one page each.
```yui
deck "How updates changed"
page "Plain names" body="Cards are named for what they are, not their id."
sketch frame=bubble before=Before
row "Parked YUI-83 in the backlog" +x note="an id means nothing"
after After
row "Parked the drawing card in the backlog" +hi note="plain words"
page "Pages, not walls" body="A long update is one line and a few short pages."
sketch frame=phone before=Before
row "Build 82 is ready. Latest change: A2A bridge, pair it with node yui-a2a.ts, tests client 42/42, interop 4/4..." +x note="wall of text"
after After
row "Build 82 is ready." +hi note="one line"
row "Page 1: A2A agents" +hi
row "Page 2: Tested" +hi note="swipe through"
page "No dead buttons" body="A card with nothing to act on has no button."
sketch frame=bubble before=Before
row "Weekly roundup posted"
row "Got it" +button +x note="did nothing"
after After
row "Weekly roundup posted" +hi note="no button"
row "Open TestFlight" +button +hi note="only real actions"
choose "What next?" "Looks right"|"Tweak one"|"Apply to email too" +other
end
```
````

### menu-shortcut (FAIL)

**Chris:** I log breakfast every single morning. Give me a one-tap way to do it from now on.

Good: A shortcut in the drawer (`menu shortcut@breakfast "Log breakfast" say="Log breakfast: "`) and one short line saying where it lives. No button that only acknowledges.

- preset: mock not in [say card form ask choose pick list camera sketch row after]
- preset: part not in [say card form ask choose pick list camera sketch row after]

````
Done: a "Log breakfast" chip now sits on your home screen. Tap it, snap your plate, logged.

```yui
menu shortcut "Log breakfast"
mock "Your home" frame=phone
part nav Arnold
part button "Log breakfast" +hi
part button "Start today's workout"
part field "Say something" ph="Type or talk"
```
````

### menu-tapped (FAIL)

**Chris:** [yui] deload menu bucket=backlog tapped

Good: Answers the tap with the deload week itself on a screen (a list or table of the sessions, or a card), maybe `~`/re-sent menu item with sub=ready. Does not explain the tag.

- preset: sketch not in [list table card deck page plan timeline done now next step choose ask pick stat say]
- preset: row not in [list table card deck page plan timeline done now next step choose ask pick stat say]

````
Deload draft: same lifts, half the work.
```yui
list "Deload week, draft" "Mon: upper, DB bench, rows, pull-ups" "Tue: 30 min walk + mobility" "Wed: lower, goblet squat, RDL, split squat" "Thu: rest" "Fri: light full body" "Sat: bike or walk with Mick" "Sun: rest"
sketch "Deload rules" frame=bubble
row "Sets: half" +hi
row "Weight: about 60%"
row "Effort: 3+ reps left"
row "Timing: done before 2 pm" note="Mick pickup"
choose "This draft?" "Start Monday"|"Change the days"|"Keep drafting" +other
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
Five runs at 7 am, all done before your 10 am calls. Easy early in the week, sharpening toward Saturday.

```yui
timeline "Race week runs"
next "Mon 7:00 · Easy 30 min, conversational" at=Mon
next "Tue 7:00 · Easy 35 min + 4 strides" at=Tue
next "Wed 7:00 · Sharp: 3×1k at 10k pace, 2 min jog" at=Wed
next "Thu 7:00 · Easy 25 min" at=Thu
next "Fri 7:00 · Shakeout 15 min + 4 strides" at=Fri
next "Sat · 10k race" at=Sat
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
Calendar draft is below; @arnold, please set Chris's training runs Thursday and Friday ahead of Saturday's 10k.
```yui
sketch "Race week" frame=window
row "Calls: after 10 am, Thu–Fri"
row "Errands: Wed 4 pm" +hi note="Wednesday passed"
row "Training runs: Arnold"
row "Race: Sat, Sep 26"
row "Mick pickup: 2 pm" note="kept clear"
choose "Errands when?" "Wed Sep 30, 4 pm"|"Fri 4 pm"|"Thu 4 pm" +other
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
Run right after the call, 8:15 am, before the heat; Mick's 2 pm pickup stays clear.

```yui
timeline "Thursday"
now "Call" at="7:00 am"
next "Run" at="8:15 am"
next "Mick pickup" at="2:00 pm"
choose "Run when?" "8:15 am"|"5:45 am, before call"|"6:30 pm" +other
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
Refrigerant colder than the outside air pulls heat out of it, gets squeezed hot, then dumps that heat indoors.

```yui
shapes "Heat pump in winter" caption="Even 30°F air holds heat. Icy refrigerant soaks it up, the compressor squeezes it to ~120°F, and the indoor coil releases it."
shape circle "Outside 30°F" tone=mute
shape arrow
shape box "Coil −10°F" tone=lavender +fill
shape arrow
shape pill Compressor +pulse
shape arrow
shape box "Coil 120°F" tone=butter +fill
shape arrow
shape circle "House 70°F" tone=mint +grow
```
````

### idea-shapes-flywheel (pass)

**Chris:** Explain the flywheel idea for Yui in one picture: more people use it, we see which screens agents reach for, the good ones become presets, agents get better, more people use it.

Good: A `shapes` loop (placed with at= or a row with arrows back to the start) with a caption, maybe one +pulse. Words kept to a line.

````
Each turn makes the next one easier.

```yui
shapes "Yui flywheel" caption="More use shows which screens work, the best become presets, agents get better, and more people come."
shape@people circle "More people" at=5,0.8 tone=mint +fill +grow
shape arrow bend=0.3
shape@seen box "Screens seen" at=8.5,3 tone=lavender
shape arrow bend=0.3
shape@presets pill Presets at=5,5.2 tone=butter +fill +pulse
shape arrow bend=0.3
shape@agents blob "Better agents" at=1.5,3 tone=mint
shape arrow from=agents to=people bend=0.3
```
````

### teach-one-screen (pass)

**Chris:** Explain compound interest to me. Show me the math and let me play with the numbers.

Good: One short line, then `>full` and ONE deck: a page per idea, the diagram, math, chart and stat each right after its page as its picture, a quiz, the calc on the last page. Nothing loose in the chat or on the stage beside the deck, no `close` after it.

````
Interest that earns interest: here's the lesson, ending with sliders.

```yui
>full
deck "Compound interest"
page "Money that grows on itself" body="Each year's interest joins the pile, so next year's interest is figured on a bigger number."
shapes caption="$100 at 10%: year one earns $10, year two earns $11."
shape circle $100 +grow
shape arrow
shape blob $110 tone=mint
shape arrow
shape blob $121 +pulse tone=mint
page "The formula" body="P is what you start with, r the yearly rate, t the years, A what you end with."
math A = P(1 + r)^t \\ A = 100(1.1)^{2} = 121 \\ A = 100(1.1)^{20} \approx 673
page "Simple vs compound" body="Simple interest pays only on the original $100. Compounding pulls away over time."
chart bar "$100 at 10%, after 30 years" x=Simple|Compound y=400|1745
page "It bends upward" body="Slow at first, then steep. Time does most of the work."
chart line "$100 at 10% a year" x=Y0|Y10|Y20|Y30 y=100|259|673|1745
choose "Which lever grows it fastest?" "More time"|"A bigger deposit"|"A lower rate" answer="More time"
page "Try it" body="Slide the numbers and watch A change."
calc f="A = P*(1+r)^t" P=100-10000@100 r=0-0.2@0.01 t=0-40@1
end
```
````

### library-flow-intake (pass)

**Chris:** A new client just sat down with me, she wants a website for her bakery. Walk her through everything you need from her, on my phone.

Good: One short line and `flow website-intake`: the saved intake flow asks everything, branching on their answers. Not a hand-built plan of the same questions.

````
Bakery website brief, one question a screen; hand her the phone.
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
Personal brand site: one question a screen, skip any.
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
0.3.2 is building; it reaches TestFlight in about 40 minutes, without the faster Send tap.
```yui
shapes "0.3.2 release" caption="About 40 minutes to TestFlight"
shape circle Worker +pulse
shape arrow
shape box "Keys + chords" +fill tone=mint
shape arrow
shape pill TestFlight +dash
shape box "Faster Send" +dash tone=mute
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
Five things need you today.
```yui
sketch "Today" frame=window
row "10:00 Dana call: 30 min"
row "4:00 Design review"
row "Venue contract, Sam: reply today" +hi note="mail"
row "Invoice question: reply today" +hi note="mail"
row "Ship 0.3.3: your call" +hi note="tuner not ready"
choose "Ship 0.3.3 without the tuner?" "Ship now"|"Wait for tuner" +other
```
````

### music-jam-beat (pass)

**Chris:** Trying to get back into drumming. Give me a simple boom bap beat around 90 I can mess with.

Good: One `loop` line near 90 BPM with a boom bap pattern in `p=` that plays (`+play`), a short line at most. No pattern written out in words, no drum tab, no advice paragraph.

````
Classic boom bap at 90: kick on 1 and the "and" of 3, snare on 2 and 4, straight hats.
```yui
loop 90 "Boom bap" rows=kick|snare|hat p=x...x.x.|..x...x.|xxxxxxxx swing=55 +play
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

### music-beat-sent (pass)

**Chris:** [yui] n1 loop bpm=94 swing=25 steps=8 rows=kick|snare|clap|hat|open|rim|tom|shaker p=x..xx.x.|....x...|..x...x.|xxxxxxxx||||
Sent my beat, 94 BPM

Good: The person's version patched in by preset name (`~loop p=... bpm=94 swing=25`) and a `save` with a short name, a line at most. No re-sent loop, no critique of the beat.

````
Locked in at 94, swung.
```yui
~loop bpm=94 swing=25 steps=8 rows=kick|snare|clap|hat|open|rim|tom|shaker p=x..xx.x.|....x...|..x...x.|xxxxxxxx||||
save beat
```
````

### show-phase-one (pass)

**Chris:** Walk me through phase one. (What you know: phase one of the full-screen change. Answers play as full-screen chunks, and the chat is just the record, top right. Bottom right: a bigger mic, a T that opens the text field, and a + for attachments, including images. Settings sit behind a hamburger at top left, beside the agent picker.)

Good: A line and a drawing per part: the stage with a chunk on it, the record top right, the new bottom bar (big mic, T, +). Never a page with a heading over a paragraph (feedback AL1My-stUBnvtXD2WKV7ec8, YUI-119).

````
Phase one: three parts.
```yui
deck "Phase one" +inline
page "Answers take the screen" body="Each answer plays full screen, one chunk at a time. Chat is just the record."
sketch frame=phone
row "Yes. Build 160, the newest." +hi note="one chunk, full screen"
row "Chat" +button note="the record, top right"
page "Talk first" body="Mic is the big button. T opens the field; + adds images and files."
sketch frame=phone before=Now
row "+  Say something nice  Mic" +button +x note="field always open"
after New
row "+   T   Mic" +button +hi note="big mic, bottom right"
page "Settings tucked away" body="Hamburger at top left, beside the agent picker."
sketch frame=phone
row "☰  Yui ▾" +button +hi note="settings + agent picker"
row "Answer stage" note="unchanged"
choose "What next?" "Build it"|"Tweak the bar"|"See phase two"|"Why do you ask?" +other
end
```
````

### show-new-layout (FAIL)

**Chris:** Show me the bigger microphone. Does the text field look better? I want to see the new layout of big microphone, T for text and + to attach. Remember, I want you to show me this. (What you know: phase one of the full-screen change. Answers play as full-screen chunks, and the chat is just the record, top right. Bottom right: a bigger mic, a T that opens the text field, and a + for attachments, including images. Settings sit behind a hamburger at top left, beside the agent picker.)

Good: The bottom bar drawn: `sketch frame=phone` with `+button` rows for +, T and the big mic, ideally before and after (the old always-there field struck out). Not a description of it (feedback AL1My-stUBnvtXD2WKV7ec8).

- preset: mock not in [say card deck plan page sketch row after shapes shape image end choose ask pick]
- preset: part not in [say card deck plan page sketch row after shapes shape image end choose ask pick]

````
Text field: cleaner, hidden until you tap T; the mic is the big target.
```yui
sketch "Bottom bar" frame=phone before=Before
row "+  Say something nice  Mic" +button +x note="field always open"
after New
row "+     T     ( MIC )" +button +hi note="big mic, T, +"
row "Tap T: field slides up" +hi note="only when you type"
mock "Phase one layout" frame=phone
part nav "☰  Yui ▾" +hi
part card "Answer, full screen"
part button "Chat" 
part row "+   T" value="( MIC )" +hi
choose "Next?" "Mic bigger still"|"Show T tapped"|"Ship phase one" +other
```
````

### music-keys-scale (pass)

**Chris:** Learning piano again. Give me something to noodle around A minor pentatonic on.

Good: One `keys Am pentatonic` line (a title or +send is fine), a short line at most. No list of note names, no fingering advice paragraph.

````
A-C-D-E-G only, so nothing sounds wrong. A soft beat underneath to play over.

```yui
keys Am pentatonic
loop 80 "Slow groove" p=x...x...|....x...|........|x.x.x.x. +play
save noodle
```
````

### music-chords-song (pass)

**Chris:** I want to strum along to one of those four chord pop songs on my uke. G is a good key for me.

Good: One `chords` line in G (`chords G I-V-vi-IV` or `chords G|D|Em|C`), a short line at most. No chord names in a paragraph, no chord diagrams in text.

````
G, D, Em, C: the classic four. Strum it down-down-up-up-down-up.
```yui
chords G I-V-vi-IV +send
```
````

### music-tuner-guitar (pass)

**Chris:** Just restrung my acoustic and it sounds awful. Help me get it in tune.

Good: One `tuner guitar` line, a short line at most. No list of string notes and frequencies, no advice on tuning by ear.

````
New strings stretch; tune each one up from below, then retune twice more.
```yui
tuner guitar
```
````

### music-metronome-practice (pass)

**Chris:** Working on my strumming timing. I want to practice slow, like 70 bpm in 4/4.

Good: One `metronome 70` line (beats=4 is fine), a short line at most. No paragraph of practice tips, no counting in words.

````
70 bpm, four clicks a bar; lock your down-strum to each one, then add the up-strums between.
```yui
metronome 70
```
````

### explain-mongols-geography (pass)

**Chris:** All right, can you give me a brief geographic explanation of the Mongols?

Good: One line with the answer, then one deck on `>full` where every page has its picture: the empire as a `map` (its outline in lat,lon points, Karakorum as a pin, routes east and west), the size as a `chart` or a `stat`. Not pages of text, and not the steppe drawn as dots in `shapes` (TestFlight feedback AJIE1_1Ru1V4EMgmpWZtniI: 'It's just a text bomb'; feedback AL2nKEYo on the shapes version: 'Again, not bad but this should be a Map').

````
Steppe nomads from Mongolia who, by 1279, held the largest contiguous land empire in history, stretching from Korea to Hungary.

```yui
>full
deck "The Mongols, by the map"
page "Home: the eastern steppe" body="Grassland north of the Gobi. Horses, herds, open ground to ride. Temüjin united the tribes here in 1206 and became Genghis Khan."
map caption="Born near the Onon River; capital later at Karakorum."
area Mongolia MN tone=butter
pin@on "Onon River" 48.8,110.5 +pulse
pin@ka Karakorum 47.2,102.8
area "Gobi Desert" 45,100|45,111|41.5,111|41.5,100 tone=mute +dash
page "How far it reached" body="Korea to Hungary, Siberian forest to Persia. Riders moved along the grassland belt that runs across Eurasia."
map caption="Karakorum in the middle; armies rode out every way."
area "Mongol Empire" 53,140|43,131|34.7,126.5|22.3,114|24,98|34,70|25.5,57|33,44|41,31|46,30.5|54,23|60,56|55,95 tone=butter
area Raided PL|HU +dash
pin@k2 Karakorum 47.2,102.8 +pulse
route East k2|37.6,127 +arrow
route West k2|50.4,30.5 +arrow
page "Biggest contiguous land empire"
chart bar "Contiguous land empires, million km²" x=Mongol|Russian|Qing|Roman y=24|22.8|14.7|5
page "Split into four, by 1294" body="Too big for one khan. Grandsons ruled four khanates; China's Yuan was the senior one. Borders approximate."
map caption="Four heirs, four realms."
area "Golden Horde" UA|KZ tone=lavender
area Chagatai UZ|KG|TJ tone=mint
area Ilkhanate IR|IQ|AZ|TM tone=butter
area Yuan CN|MN|KR tone=mute +pulse
choose "What next?" "Why the steppe made them win"|"How it fell apart"|"Silk Road under the Mongols" +other
end
```
````

### explain-rome-rise-fall (pass)

**Chris:** Give me the quick version of how the Roman Empire rose and fell.

Good: A line, then a picture per part: the empire at its peak as a `map` around the Mediterranean, its size over the centuries as a `chart` (or a `timeline` on the stage), the split as an east and west area. No page that is only a heading and a paragraph.

````
Rose by conquest over 700 years, split in two, West fell 476 AD, East lasted to 1453.

```yui
>full
deck "Rome: rise and fall"
page "How it grew" body="A small city-state became a Republic, beat Carthage, then went imperial under Augustus in 27 BC."
chart line "Territory, million km²" x="200 BC"|"50 BC"|"25 BC"|"117 AD"|"390 AD" y=0.4|1.95|2.75|5|4.4
page "Peak, 117 AD" body="Under Trajan: Britain to Egypt, Spain to Mesopotamia, the Mediterranean ringed in."
map caption="Rome ruled every shore of the Mediterranean."
area "Roman Empire" IT|ES|PT|FR|BE|CH|AT|SI|HR|BA|RS|ME|AL|MK|GR|BG|RO|TR|CY|SY|LB|IL|PS|JO|EG|LY|TN|DZ|GB tone=butter
pin@rome Rome 41.9,12.5 +pulse
pin@con Constantinople 41.0,28.98
page "Why the West fell" body="Too much border, too many civil wars, cheap coin, then the split and the invasions."
shapes "The slide" caption="Strain led to a split; the weaker West broke first."
shape box Overstretch
shape arrow
shape box "Civil wars"
shape arrow
shape pill "Split, 395"
shape arrow
shape circle "West falls, 476" +pulse tone=mute
page "The East held on" body="The Byzantine Empire ran from Constantinople for another thousand years."
stat 1453 "Constantinople falls to the Ottomans"
choose "What next?" "Why the West fell, deeper"|"Julius Caesar"|"Byzantium"|"Why do you ask?" +other
end
```
````

### explain-monsoon-how (pass)

**Chris:** Why does India get monsoons? Keep it short.

Good: One line and a picture: land heats, air rises, wet air off the ocean moves in, as a diagram in `shapes` with arrows or a `map` with the winds as routes, maybe a rainfall `chart` by month. Not a paragraph of weather words.

````
Summer heats India's land faster than the ocean; rising air pulls wet sea winds inland, and mountains wring out the rain.

```yui
map "Why India gets monsoons" caption="Hot land draws wet ocean wind in from the southwest; the Ghats and Himalaya force it up into rain."
area India IN tone=butter
pin@low "Heat low" 27,72 +pulse
pin@ghats "Western Ghats" 14,74.5
pin@him Himalaya 29.5,82
route "Arabian Sea wind" 10,60|ghats|low +arrow
route "Bay of Bengal wind" 12,88|24,90|him +arrow
```
````

### where-trip-route (pass)

**Chris:** Thinking about a train trip from Lisbon to Barcelona with stops in Porto and Madrid. How does that route go?

Good: One line, then a map: pins on Lisbon, Porto, Madrid and Barcelona, a route through them with an arrow, a caption with the rough hours (a small `table` of the legs beside it is fine). Not a numbered list of legs in words.

````
Porto to Madrid has no direct train; the usual way is Porto to Vigo, then high-speed to Madrid.

```yui
map "Lisbon to Barcelona by train" caption="North up the coast, a hop into Spain at Vigo, then high-speed east."
pin@lis Lisbon 38.72,-9.14
pin@opo Porto 41.15,-8.61 +pulse
pin@vgo Vigo 42.24,-8.72
pin@mad Madrid 40.42,-3.70 +pulse
pin@bcn Barcelona 41.39,2.17
route "The line" lis|opo|vgo|mad|bcn +arrow
list Legs "Lisbon → Porto: ~3h, Alfa Pendular" "Porto → Vigo: ~2.5h, Celta train" "Vigo → Madrid: ~4.5h, high-speed" "Madrid → Barcelona: ~2.5–3h, AVE, Ouigo, Iryo"
choose "Next?" "Build a day-by-day"|"Check fares"|"Add more stops" +other
```
````

### where-delivery-area (pass)

**Chris:** Our farm delivers CSA boxes across Vermont, New Hampshire and western Massachusetts. Can you show a new customer what that covers?

Good: One line, then a map with the delivery area filled in (VT and NH by code, western Massachusetts as lat,lon points) and the farm or the big towns as pins. Not a list of states and counties.

````
Delivery area: Vermont, New Hampshire, western Massachusetts.
```yui
map "Where our CSA boxes go" caption="All of Vermont and New Hampshire, plus western Massachusetts out to the Worcester County line."
area Vermont 42.73,-73.26|45.01,-73.34|45.01,-71.50|44.5,-71.6|44.0,-72.05|43.6,-72.3|43.1,-72.45|42.73,-72.46 tone=mint
area "New Hampshire" 42.73,-72.46|43.1,-72.45|43.6,-72.3|44.0,-72.05|44.5,-71.6|45.01,-71.50|45.30,-71.08|44.3,-71.0|43.08,-70.70|42.87,-70.82|42.70,-71.3 tone=butter
area "Western Mass" 42.73,-73.26|42.73,-72.28|42.03,-72.12|42.05,-73.50 tone=lavender
pin Burlington 44.48,-73.21
pin Concord 43.21,-71.54
pin Northampton 42.33,-72.64
end
```
````

### where-quick-country (pass)

**Chris:** Where exactly is Kyrgyzstan?

Good: One line (Central Asia, between Kazakhstan and China) and a map in the chat: KG as an area with a pulse on Bishkek, neighbors faint. No deck for a quick where.

````
Central Asia, landlocked in the Tian Shan mountains, between Kazakhstan and China.
```yui
map "Kyrgyzstan" caption="Mountain country on China's western edge, ringed by four neighbors."
area Kyrgyzstan KG tone=butter +pulse
area Neighbors KZ|UZ|TJ|CN tone=mute
pin@bk Bishkek 42.87,74.59
pin "Issyk-Kul lake" 42.45,77.25
pin Osh 40.53,72.80
end
```
````

### data-lunch-macros (pass)

**Chris:** Give me a quick lunch idea with 30g of protein.

Good: One line naming the lunch and a real Yui Lines table (`table Macros Food|Protein|Cal "Chicken|35g|165" ...`) or stat tiles for the macros. Not a quoted title plus `columns:` rows and `end` (GLM 5.2 on YUI-131, every row a parse error), and not a markdown table.

````
Tuna wrap, 5 minutes, no cooking.
```yui
stat 34g Protein
table "Tuna wrap" Item|Protein|Cal "Tuna, 1 can drained|29g|130" "Whole wheat tortilla|4g|130" "Greek yogurt, 2 tbsp|3g|20" "Spinach, mustard, pickles|0g|10" "Total|36g|290"
list Steps "Mix tuna, yogurt, mustard" "Spread on tortilla" "Add spinach, pickles, roll" +check
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
Two cards, both need your OK.
```yui
sketch "Waiting on you" frame=bubble
row "Justice Watch: 4 recovered, 2 rewrites" +hi note="approve to publish"
row "Aaron's roundup: post + landing link" +hi note="OK both"
choose "Start with?" "Justice Watch"|"Aaron's roundup"|Later
```
````

### ui-zip-in-context (pass)

**Chris:** Tell me about the newest change on the closing purple box.

Good: One short line, then the box drawn in a phone sketch: the ZIP field and the two buttons in place, the new part highlighted. Not a paragraph describing the field, and no hyphen lines (Chris, TestFlight: "Show me the zip in context. You should be able to illustrate UI elements fairly easily").

````
Closing purple box, Sep 24: final copy, live ZIP, real form.

```yui
sketch "Closing purple box" frame=phone before=Then
row "Placeholder copy" +x note="draft"
row "Red placeholder frame" +x note="gone"
after Sep 24
row "Client's final copy, word for word" +hi
row "Your ZIP  33410" +hi note="working field"
row "Two-question form" +hi note="feeds the lead"
row "See My Coverage Options" +button
row "Talk to a Licensed Advisor" +button
choose "Next?" "Test the form"|"Check a lead record"|"Leave it"
```
````

### when-two-days-timeline (pass)

**Chris:** What did we change on the quote site two days earlier, on Sep 22 and 23?

Good: One short line, then a timeline: the Sep 22 and Sep 23 changes as rows with their dates, oldest first. Not a sentence with the dates inside it (Chris: "If we're talking about some two days earlier, we need some type of timeline. Show me visually").

````
Three fixes, Sep 22–23.
```yui
timeline "Quote site, Sep 22–23"
done "Real brand logos on /brands family cards" at="Sep 22"
done "Bigger calculator field labels" at="Sep 23"
done "Last four form eyebrow labels fixed" at="Sep 23"
```
````

### facts-stacked-list (pass)

**Chris:** List the small fixes we made on the quote site.

Good: Three or more facts as one stacked list (or a table), each row Label: value. Not one line per fix with hyphens, and never a list of one (Chris: "These were all supposed to be in a stacked list").

````
Four small fixes on the quote site.
```yui
list "Quote site fixes" "Brand cards: real logos" "Calculator labels: bigger" "Form eyebrow labels: last four fixed" "Closing box: red frame gone" +check
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
Quote site: closing box rebuilt, logos and labels fixed.
```yui
deck "Quote site: latest changes" +inline
page "Closing box, Sep 24" body="The client's final copy, word for word, with a ZIP field and a short form that feeds the lead."
sketch "Closing purple box" frame=phone before=Then
row "Red placeholder frame" +x note="gone"
after Now
row "Client's final copy" +hi note="word for word"
row "Your ZIP  33410" +hi note="working field"
row "Two questions" +hi note="into the lead record"
page "New buttons, Sep 24" body="Two clear actions close the page."
sketch "Button row" frame=phone
row "See My Coverage Options" +button +hi
row "Talk to a Licensed Advisor" +button +hi
page "Polish, Sep 22–23" body="Brand pages, calculator and forms cleaned up."
sketch "Fixes" frame=phone
row "/brands family cards: real logos" +hi
row "Calculator field labels: bigger" +hi
row "Form eyebrow labels: last four fixed" +hi
choose "What next?" "Test the ZIP form"|"Check a test lead"|"Next fix" +other
end
```
````

### last-page-walkthrough (pass)

**Chris:** Walk me through what changed on the closing purple box, step by step.

Good: A deck (or plan) of the changes, each with its picture, and the last step is something to tap: a `choose` of what to do next or 'Why do you ask?'. No dead end.

````
Closing purple box: four changes, Sep 24.

```yui
>full
deck "Closing purple box, Sep 24"
page "Placeholder out, final copy in" body="The red placeholder frame is gone. The client's final copy sits there, word for word."
sketch frame=phone before=Before
row "Red placeholder frame" +x note="removed"
after Now
row "Client's final copy" +hi note="word for word"
page "ZIP field and form" body="A working ZIP field, then two questions. Answers land in the lead record."
sketch frame=phone
row "Your ZIP" +hi note="works"
row "Question 1  ·  Question 2" +hi note="two questions"
row "Answers: into the lead record" note="no retyping"
page "New button labels" body="Both buttons say what happens next."
sketch frame=phone
row "See My Coverage Options" +button +hi
row "Talk to a Licensed Advisor" +button +hi
choose "What next?" "Test the form"|"Check a lead record"|"See the other fixes" +other
end
```
````

### tiles-board-status (pass)

**Chris:** ok, is the board up to date? (What you just looked up: site lane is clean, nothing open. The new feature lane, the quote calculator, has one card blocked waiting on a design pick from Chris. SEO lane shipped its last audit fixes yesterday and scores 94.)

Good: One sketch, three Label: verdict rows (Site: good, New feature: needs help with +hi, SEO: strong), a line of a few words at most. No sentences, no deck, no 'One question' screen.

````
Yes, one thing waits on you.
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
Declined on the calendar; Dana hasn't gotten a note from you.

```yui
sketch "Team sync" frame=bubble
row "Team sync, Friday 3 pm" +x note="declined"
row "Note to Dana: none sent" +hi note="your call"
choose "Send Dana a note?" "Short apology"|"Suggest another time"|"Leave it" +other
```
````

### outcome-worker-running (pass)

**Chris:** What's happening on the quote calculator card right now? (What you just looked up: a worker picked it up 4 minutes ago and is editing the calculator labels. Nothing has failed. Expect it done in about 20 minutes.)

Good: A small drawing of the worker at its task: shapes with the busy part +pulse (Worker, arrow, the card), or a one-row sketch or timeline. A few words. No paragraph.

````
Quote calculator: running, no failures.
```yui
shapes "Quote calculator" caption="Picked up 4 min ago. Done in about 20 min."
shape circle Worker +pulse
shape arrow
shape box "Calculator labels" +fill
shape arrow
shape pill Done +dash tone=mute
```
````

### context-sample-not-ask (pass)

**Chris:** Show me a sample status board so I can see how the tiles look.

Good: One sketch of Label: verdict rows marked as an example (note="example" or a sample title). No row says "waiting on you": a sample is not a real ask.

````
Sample board, made-up rows.
```yui
sketch "Sample board (example)" frame=window
row "Site: good" note="example"
row "Checkout: needs help" +hi note="example, needs you"
row "SEO: strong" note="example"
row "Blog sync: running" note="example"
row "Email list: paused" +x note="example"
```
````

### context-about-this (pass)

**Chris:** [yui] note: your newest message here is 4 min old and is what they are looking at: "Guide v40 is live now. | screen: Board; Before and after | rows: Site: good; New feature: needs help; SEO: strong". Words like "this", "that" or "it" mean that message. Answer about it first. Sample rows in it are examples, not their open items. Bring up another open item only if they ask, and then say when they last saw it and what they answered.
What are you waiting on me for with this? (What you just looked up: nothing on that screen is open, it was a sample. An older ask, testing the four new models with a capped key, is still open: he tapped Not yet on it at 6:54 pm.)

Good: One line about the screen just shown: nothing, it was a sample. The old model-testing ask is not brought up as the answer.

````
Nothing on that screen: the rows were a sample.
```yui
sketch "Waiting on you" frame=window
row "Board rows: sample" +x note="example"
row "Four new models, capped key: open" +hi note="Not yet, 6:54 pm"
choose "The model test?" "Run it now"|"Still later" +other
```
````

### context-old-ask-when (pass)

**Chris:** [yui] note: your newest message here is 4 min old and is what they are looking at: "Guide v40 is live now. | screen: Board; Before and after | rows: Site: good; New feature: needs help; SEO: strong". Words like "this", "that" or "it" mean that message. Answer about it first. Sample rows in it are examples, not their open items. Bring up another open item only if they ask, and then say when they last saw it and what they answered.
Is anything else waiting on me? (What you just looked up: one ask is open, testing the four new models with a capped key. He tapped Not yet on it at 6:54 pm today.)

Good: The old ask comes second and is named for what it is: still open, he said Not yet at 6:54 pm. Not presented as new.

````
Board rows were examples. One real ask open.
```yui
sketch "Waiting on you" frame=bubble
row "Board rows: none open" note="example"
row "Test four new models, capped key" +hi note="Not yet, 6:54 pm"
choose "Four new models?" "Start test"|"Still not yet"|"Drop it" +other
```
````

### showhere-before-after (pass)

**Chris:** Show me the before and after of the hero on the site. (What you just looked up: the old hero is /demo/site_before_hero.jpg and the new one is /demo/site_after_hero.jpg. The change: a bigger headline and one button instead of three.)

Good: A compare of the two shots, or a sketch with after. One short line. Not a card that only says Open.

````
Hero: bigger headline, one button instead of three.
```yui
compare /demo/site_before_hero.jpg /demo/site_after_hero.jpg "Hero"
sketch "Hero buttons" frame=phone before=Before
row "Get started  ·  Learn more  ·  Contact" +button +x note="three buttons"
after After
row "Bigger headline" +hi note="larger type"
row "Get started" +button +hi note="one button"
choose "Hero next?" "Ship it"|"Tweak headline"|"Try another button"
```
````

### showhere-progress-page (pass)

**Chris:** What changed on the progress page? (What you just looked up: each entry now shows before and after shots, a Feedback tag links to the note, and the filter chips moved to the top. Shots: /demo/site_before_classes.jpg and /demo/site_after_classes.jpg. Page: https://www.yuigui.com/progress)

Good: The changes drawn here: a sketch with after, or a compare of the shots. At most a small link card under them. Not a card that only opens the page.

````
Progress page: shots per entry, Feedback links, chips on top.
```yui
sketch "Progress page" frame=phone before=Then
row "Entry: text only" +x note="no shots"
row "Feedback: plain label" +x note="led nowhere"
row "Filter chips: bottom" +x note="hard to find"
after Now
row "Filter chips: top" +button +hi note="moved up"
row "Entry: before and after shots" +hi note="new"
row "Feedback" +button +hi note="opens the note"
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
choose "Classes page?" Approve|"Needs changes" +other
```
````

### showhere-demo (pass)

**Chris:** Can I see the reply cards demo? (What you just looked up: it is the /playground demo cards. It shows a card, a stat and a list. A card has a title, a body and one button. The stat shows a number with a small trend line.)

Good: The demo's parts drawn right here (a card sketch, a stat). Not a card that only links to /playground.

````
Reply cards demo: card, stat, list.
```yui
card "Example: Thursday plan" body="Upper body, 40 min, dumbbells and bench" cta="Start"
stat 178.9lb "Example: weight" delta=-2.3 spark=181.2|180.4|179.6|178.9
list "Example: today" "Bench press 4x8" "Pull-ups 3x8" "DB row 3x10" +check
```
````

### showlink-waiting-shots (pass)

**Chris:** What are you waiting on me for with this? (What you just looked up: the site refresh card needs your pick of before and after shots for the progress page, https://www.yuigui.com/progress. Old hero: one headline, three buttons. New hero: a bigger headline, one button. Shots on file: /demo/site_before_hero.jpg and /demo/site_after_hero.jpg.)

Good: The two shots in a compare, or a sketch with after, plus the one thing needed. Not a card that only says Open.

````
Your pick: which hero goes on the progress page.
```yui
compare /demo/site_before_hero.jpg /demo/site_after_hero.jpg "Hero: old vs new"
choose "Which hero for the progress page?" "New: big headline, one button"|"Old: headline, three buttons"|"Show both" +other
```
````

### showlink-only-url (pass)

**Chris:** Where is the new hero? (What you just looked up: it is live on the site, https://www.yuigui.com/progress, in the Site refresh entry. Old hero: one headline and three buttons. New hero: a bigger headline and one button.)

Good: The change drawn: a sketch with before and after. At most one small link card under it.

````
Live on the site, in the Site refresh entry.
```yui
sketch "Hero" frame=phone before=Old
row "Headline" +x
row "Button" +button +x
row "Button" +button +x
row "Button" +button +x note="three buttons"
after New
row "Bigger headline" +hi note="bigger"
row "One button" +button +hi note="one action"
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
row "Notification tap: opens on page one" +hi note="lands at the start"
row "Mic: stays on last page" +hi note="keeps listening"
row "Reply: quotes the screen" +hi note="context kept"
card "Full notes" body="Every change in 332" cta="Open" url=https://www.yuigui.com/progress
```
````

### showlink-demo-page (pass)

**Chris:** Is there a demo of the compare card? (What you just looked up: yes, https://www.yuigui.com/playground?demo=show-here. It shows a slider between a before and an after shot, with Side and Toggle modes. Shots: /demo/before_room.jpg and /demo/after_room.jpg.)

Good: The demo itself: a compare of the two shots. Not a card that only links to the playground.

````
Yes: slider between before and after, with Side and Toggle modes.
```yui
compare /demo/before_room.jpg /demo/after_room.jpg "Room"
card "Compare demo" body="Playground: Side and Toggle modes" cta="Open" url=https://www.yuigui.com/playground?demo=show-here
```
````

### showlean-waiting (pass)

**Chris:** What are you waiting on me for with this? (What you just looked up: the site refresh card is done except before and after shots of the hero for the progress page. Page: https://www.yuigui.com/progress. Nothing else is open.)

Good: The ask drawn here (a sketch with the missing before and after slot, or a camera to snap it). At most a small link under it.

````
Nothing. The hero shots are mine to make.

```yui
sketch "Site refresh" frame=window
row "Site refresh: done"
row "Hero before/after shots: not made yet" +hi note="on me, not you"
row "Progress page: waiting on shots"
```
````

### showlean-new-hero (pass)

**Chris:** What does the new hero look like? (What you just looked up: it is on https://www.yuigui.com, top of the page. It has a bigger headline and one button, Get Yui, where there were three buttons.)

Good: The hero drawn in a sketch phone, before and after. At most a small link under it.

````
Hero: bigger headline, one button.

```yui
sketch "yuigui.com hero" frame=phone before=Before
row "Headline" note="regular size"
row "Button  ·  Button  ·  Button" +button +x note="three choices"
after Now
row "HEADLINE" +hi note="bigger"
row "Get Yui" +button +hi note="the only button"
```
````

### showpick-four-looks (FAIL)

**Chris:** Show me the four looks again. (What you just looked up: the demo page is https://www.yuigui.com/playground?demo=shader-look. The four dark shots are already on disk: /Users/urzas/.hermes/kanban/artifacts/t_b8ab6ac3/1-currents-dark.png, 2-terrain-dark.png, 3-dots-dark.png, 4-type-dark.png, same folder.)

Good: A gallery of the four shots with +pick, so the choice is on the phone. A site link only as a small button under it, never alone.

- screen: no ```yui block
- need: none of [gallery compare image]
- show here: nothing drawn in the thread
- pick here: no shots drawn in the thread

````
````
Hero shader: four looks, tap one.
```yui
gallery /Users/urzas/.hermes/kanban/artifacts/t_b8ab6ac3/1-currents-dark.png /Users/urzas/.hermes/kanban/artifacts/t_b8ab6ac3/2-terrain-dark.png /Users/urzas/.hermes/kanban/artifacts/t_b8ab6ac3/3-dots-dark.png /Users/urzas/.hermes/kanban/artifacts/t_b8ab6ac3/4-type-dark.png +pick
```
````
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
Four hero looks, tap your pick.
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
sketch "Up to date?" frame=window
row "Site: live" note="deploy green"
row "Board: 3 running"
row "Board: 2 blocked" +hi note="your pick"
row "Phone: build 392" note="newest"
row "Cron: no failures"
```
````

### vis-what-did-you-fix (pass)

**Chris:** What did you fix? (What you just did: the left drawer kept a finished card under Now because one card with badly saved text crashed every refresh. You fixed the crash. A new card makes closed cards leave the drawer within seconds; it is on the board, not built.)

Good: One line, then a before and after `sketch` (drawer showed the done card under Now, now it is gone) with the new card as a `+hi` row. No fix report in prose (VIS-1).

````
Drawer crash fixed; auto-clear card not built yet.
```yui
sketch "Left drawer" frame=phone before=Then
row "Done card  ·  Now" +x note="stuck"
row "One bad card: refresh crashed" +x note="badly saved text"
after Now
row "Done card gone" +hi note="crash fixed"
row "Closed cards leave in seconds" note="on the board, not built"
```
````

### vis-you-misread-me (pass)

**Chris:** No. You misread me. I meant the left drawer, not TestFlight. (What you found: the drawer still lists a finished card under Now.)

Good: One short line owning it, then a `sketch` of the left drawer with the stale row struck out. No apology paragraph, no restating what he said (VIS-1).

````
Left drawer: a finished card still sits under Now.

```yui
sketch "Left drawer" frame=phone before=Now
row "Now  ·  finished card" +x note="should be gone"
after Fix
row "Now  ·  only open work" +hi note="done cards leave"
choose "Which card is stale?" "Menu work, build 392"|"Another card" +other
```
````

### vis-put-a-card-in (pass)

**Chris:** Put a card in for a daily morning release instead of ad hoc builds. (What you just did: created the card, parked in the backlog under the release lane, first in the queue. It has not been started.)

Good: One line: it is on the board, first in the queue. Then one drawing of the card in its place (a `sketch` of the queue with the new row `+hi`, or a `timeline`). No paragraph about what the card will do (VIS-1).

````
Card in, first in the release lane.

```yui
sketch "Daily morning release" frame=window
row "Lane: release"
row "Queue: first up" +hi
row "Status: not started"
menu backlog@morningrelease "Daily morning release" sub="first in queue"
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
row "Drawer fix: shipped" note="in 392"
row "One-build-a-day guard: shipped" note="in 392"
row "Progress page: live" note="site deploy"
row "Tuner: blocked" +hi note="needs your pick"
row "Onboarding copy: blocked" +hi note="needs your pick"
choose "Pick which first?" Tuner|"Onboarding copy"
```
````

### vis-three-ideas-one-page (pass)

**Chris:** How will you stop the text slides? (What you did: three changes. The plugin rewrites any reply over 30 words before it sends. The channel guide now says one line and a drawing. The eval fails a reply with more than one text bubble.)

Good: One line, then ONE drawing that holds all three ideas (a sketch with three rows, or a shapes chain of three), not three pages and not a paragraph each. No deck of one page per idea (VIS-1, Chris: up to 3 ideas on a card as long as we show them).

````
Three layers: the guide prevents it, the plugin catches it before sending, and the eval flags any that slip through.
```yui
diagram "Three guards on every reply" caption="Guide shapes it, plugin fixes it, eval catches what slips."
flowchart TD
  guide[Guide: one line + drawing] --> draft[Reply drafted]
  draft --> check{Over 30 words?}
  check -->|yes| rewrite[Plugin rewrites]
  check -->|no| send([Sent to phone])
  rewrite --> send
  send --> eval{More than 1 bubble?}
  eval -->|yes| fail[Eval fails it]
end
sketch "What the phone shows" frame=phone before=Then
row "Paragraph · paragraph · paragraph" +x note="folded into slides"
row "Read as pages" +button +x
after Now
row "One line, 30 words max" +hi note="one bubble"
row "Drawing under it" +hi note="the rest"
```
````

### draw-how-flow (pass)

**Chris:** How does a card get from my ask to a shipped build? (What you know: I ask, you place it on the board, a lane builds it, checks run, it rides the 6 am release.)

Good: One short line, then a `diagram` (flowchart, LR or TD) with you, board, lane, checks, release. Mermaid labels a word or two. No paragraph, no list of steps.

````
Ask to shipped: five hops, release at 6 am.
```yui
diagram "Ask to shipped build" caption="You ask, it lands on the board, a lane builds it, checks run, the 6 am release ships it."
flowchart TD
  ask([Your ask]) --> board[Board card]
  board --> lane[Lane builds]
  lane --> checks[Checks run]
  checks --> release([6 am release])
end
```
````

### draw-how-sequence (pass)

**Chris:** How does a tap on a button reach the agent and come back? (What you know: the phone sends an event to the relay, the relay hands it to the agent, the agent answers with a screen, the phone draws it.)

Good: One line, then a `diagram` as a sequenceDiagram: Phone, Relay, Agent, with the event going out and the screen coming back. No text steps.

````
Tap to screen: four hops, one round trip.
```yui
diagram "A tap, round trip" caption="Phone sends the tap, relay hands it on, agent answers with a screen, phone draws it."
sequenceDiagram
  participant P as Phone
  participant R as Relay
  participant A as Agent
  P->>R: Tap event
  R->>A: Hand off
  A->>R: Screen
  R->>P: Screen
  P->>P: Draw it
end
```
````

### draw-show-screen (pass)

**Chris:** Show me the new sign-in screen. (What you know: a nav bar titled Sign in, an email field, a password field, a Sign in button, and a small Forgot password link under it.)

Good: One line, then a `mock` (frame=phone) with nav, two fields, a button and a small text row. No description of the screen in words.

````
Sign in: email, password, button, Forgot link.
```yui
mock "Sign in" frame=phone
part nav "Sign in"
part field Email ph="you@example.com"
part field Password ph="••••••••"
part button "Sign in" +hi
part row "Forgot password?"
```
````

### draw-what-checkout-looks (FAIL)

**Chris:** What does the checkout look like? (What you are proposing: order summary card, total row, a card field, a big Pay button, and a Back link.)

Good: One line, then a `mock` of the checkout from parts: card, row with value, field, button +hi. Not a sketch, not a paragraph.

- screen: no ```yui block
- fence: Yui Lines outside the ```yui block
- need: none of [mock]
- one line: 2 text bubbles, want one line then the picture
- one line: 38 words of prose, want 30 or fewer
- one line: no drawing (sketch, shapes, diagram, mock, timeline, map, chart or stat) carries the answer

````
````
Checkout: summary, total, card, Pay
```yui
mock "Checkout" frame=phone
part nav Checkout back=Back
part card "Order summary"
part row Total value="$42"
part field Card ph="1234 5678 9012 3456"
part button Pay +hi
choose "Next?" "Build it"|"Move Total under Pay"|"Add Apple Pay" +other
```
````
````
