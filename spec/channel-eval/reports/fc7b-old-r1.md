# Channel eval: fc7b-old-r1

Guide v46+536e1178 (5469 words), model claude-opus-5-5, 2026-10-05T08:42.

**108/125 passed (86%).**

| category | passed |
|---|---|
| workout | 4/4 |
| check-in | 2/2 |
| photo | 2/2 |
| today | 1/1 |
| scheduling | 2/2 |
| decision | 2/2 |
| list | 2/3 |
| data | 1/2 |
| flow | 10/14 |
| teach | 2/2 |
| look | 2/2 |
| no-screen | 4/4 |
| secret | 2/3 |
| trap | 1/2 |
| patch | 4/5 |
| tap | 2/2 |
| reaction | 2/3 |
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
| data-weight-trend | FAIL | preset: sketch not in [chart stat card say]; preset: row not in [chart stat card say] |
| focus-second-screen | pass |  |
| teach-compound-interest | pass |  |
| theme-autumn | pass |  |
| plain-fact | pass |  |
| plain-thanks | pass |  |
| plain-explain | pass |  |
| plain-math | pass |  |
| secret-login | pass |  |
| secret-bank | FAIL | preset: sketch not in [ask choose card list pick form]; preset: row not in [ask choose card list pick form]; preset: after not in [ask choose card list pick form] |
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
| game-offer | FAIL | screen: no ```yui block; need: none of [game] |
| game-ttt-move | pass |  |
| mention-asked | pass |  |
| mention-notes-context | FAIL | preset: choose not in [list card timer ask plan table sketch row after] |
| report-card-done | pass |  |
| report-long-walkthrough | FAIL | preset: mock not in [card deck page stat list plan say image timeline done now next ask choose pick table sketch row after shapes shape end]; preset: part not in [card deck page stat list plan say image timeline done now next ask choose pick table sketch row after shapes shape end] |
| talk-keep-plan-editable | pass |  |
| talk-typed-on-screen | pass |  |
| report-draw-change | FAIL | screen: no ```yui block; need: none of [sketch] |
| draw-screen-fix | pass |  |
| report-pages-picture | pass |  |
| menu-shortcut | pass |  |
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

## Transcripts

### workout-leg-day (pass)

**Chris:** Leg day. I have 40 minutes, home gym.

Good: A short line, then the session on screen (a checklist or a card) with a way to start (ask or timer). No interrogation: he already said time and gear.

````
40 minutes: squat, hinge, single-leg, glutes, and a finisher. Rest 90s between sets.
```yui
list "Leg day · 40 min" "Warm-up: band walks + bodyweight squats, 5 min" "Goblet squat: 4x10 @ 50 lb" "DB Romanian deadlift: 4x10 @ 2x50 lb" "Bulgarian split squat: 3x8/leg @ 2x30 lb" "DB hip thrust on bench: 3x12 @ 50 lb" "Finisher: calf raises 3x20" +check
timer 90s Rest
save workout
```
````

### workout-tabata (pass)

**Chris:** Give me a 10 minute tabata finisher, I'm ready now.

Good: A timer with work/rest x rounds (it goes full screen by itself) and maybe the move list. No questions first.

````
10 rounds, 40 on/20 off, five moves twice through. Go.
```yui
list Finisher "1 & 6: DB thrusters (25s)" "2 & 7: Burpees" "3 & 8: Renegade rows (25s)" "4 & 9: Jump squats" "5 & 10: Mountain climbers"
timer 40/20x10 "Tabata finisher"
```
````

### workout-plank (pass)

**Chris:** plank hold, 2 min

Good: One timer line. Almost no chat text.

````
Plank, two minutes. Brace hard, breathe slow.
```yui
timer 2m Plank
```
````

### workout-gear-question (pass)

**Chris:** I want to train today but I'm at my mom's place, not sure what she has.

Good: Offer the likely gear as a pick with +other, or a camera to snap what is there. One question, not a form.

````
Away from your home gym, so let's see what's around.
```yui
pick "What's at your mom's?" "Nothing, bodyweight"|Chair|Stairs|"Light dumbbells"|Bands|"Yard or space outside" +other
```
````

### checkin-morning (pass)

**Chris:** morning check-in

Good: Sleep, soreness and energy as sliders or a short form (quoted title), or a plan that walks them one at a time, or the saved `flow workout-checkin` (it asks the same). Not a wall of questions in text.

````
Morning, Chris. Quick check-in before Mick's 2 pm pickup.
```yui
flow workout-checkin
```
````

### checkin-evening-voice (pass)

**Chris:** I want to do an end of day brain dump but I'm too tired to type.

Good: A mic, maybe with +auto. One short line.

````
Just talk; I'll sort it into tasks, calendar, and tomorrow.
```yui
mic "Brain dump: what's on your mind?" +auto
```
````

### meal-photo (pass)

**Chris:** [photo attached. Image description: a plate with grilled chicken breast, a cup of white rice, steamed broccoli, and a drizzle of olive oil] lunch

Good: Estimate the macros briefly and offer to log it (ask) or show them as stats. Does not ask for another photo.

````
Solid lunch, protein-heavy and clean. Logged with a rough estimate:

```yui
stat 660kcal "Lunch, estimated"
list Breakdown "Chicken, ~6 oz: 280 kcal, 52g protein" "White rice, 1 cup: 205 kcal, 45g carbs" "Broccoli, 1 cup: 55 kcal, 4g protein" "Olive oil, ~1 tbsp: 120 kcal, 14g fat"
choose "Chicken size right?" "About 4 oz"|"About 6 oz"|"About 8 oz"
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
Your calendar isn't connected here, so this draft is built around Mick's 2:00 pickup.
```yui
timeline "Thursday draft"
now "Workout: 40 min, home gym" at="9:30"
next "Deep work: one big task" at="10:30"
next "Lunch, errands" at="12:30"
next "Mick pickup" at="2:00" tag=mick
next "Mick time, dinner" at="3:00"
pick "What else is on today?" Meetings|Email|Errands|"Home stuff"|"Mick activity" +other
```
````

### schedule-call (pass)

**Chris:** Set up a call with Matt next week, 30 minutes.

Good: Offer a few slots as buttons (avoiding 1:30 and 2 pm) with +other. One question.

````
No calendar access from here yet; pick a window and I'll draft the invite.
```yui
plan "Call with Matt" submit="Draft invite"
page "Which Matt" body="I don't have contacts here, so I need a name or an email."
form "Which Matt?" matt:text
pick "Which days next week?" Mon|Tue|Wed|Thu|Fri
choose "When?" "Morning, 9–12"|"Early afternoon, 12–2"|"After 3"|"Anytime" +other
choose "Format?" Phone|Zoom|"Google Meet" +other
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
Tacos: Mick-friendly, easy on a Thursday. Save sushi for date night.

```yui
choose "Tacos it is?" "Tacos, takeout"|"Tacos, cook at home"|"Sushi anyway"
```
````

### decision-three-options (pass)

**Chris:** Help me pick which to do first this afternoon: invoice Heathos, reply to Paul about Plannix, or fix the Yui site footer.

Good: A recommendation plus the three as buttons (or an ordered list with +check). No essay.

````
Invoice Heathos first: quick, and it starts the payment clock.
```yui
sketch "This afternoon" frame=window
row "1. Invoice Heathos: 15 min" +hi note="cash, quick win"
row "2. Reply to Paul: 20 min" note="unblocks him"
row "3. Yui footer: deep work" note="open-ended, last"
choose "Go?" "Draft the invoice"|"Draft Paul's reply"|"Paul's urgent"|"Footer's urgent" +other
```
````

### list-groceries (pass)

**Chris:** Make me a grocery list for high protein meals this week.

Good: A list with +check, a title, and items that fit on a phone.

````
High-protein week for you and Mick: grouped by aisle, tap to check off.
```yui
list Protein "Chicken breast: 3 lb" "Lean ground turkey: 2 lb" "Salmon fillets: 1.5 lb" "Eggs: 2 dozen" "Canned tuna: 4 cans" +check
list Dairy "Greek yogurt, plain: 2 large tubs" "Cottage cheese: 2 tubs" "Milk: 1 gallon" "String cheese: 1 pack" +check
list Produce "Broccoli: 2 heads" "Spinach: 1 big bag" "Sweet potatoes: 4" "Bell peppers: 4" "Bananas: 1 bunch" "Berries: 2 pints" +check
list Pantry "Black beans: 3 cans" "Quinoa: 1 bag" "Oats: 1 canister" "Peanut butter: 1 jar" "Whey protein: 1 tub" "Whole wheat tortillas: 1 pack" +check
save groceries
```
````

### list-packing (pass)

**Chris:** Mick has a field trip tomorrow to the science museum. Packing list?

Good: A checklist. One line of text.

````
Friday's science museum bag. Check items off tonight.

```yui
list "Mick: field trip" "Permission slip: signed, in folder" "Lunch: disposable bag, name on it" "Water bottle: labeled" "Snack: nut-free" "Sneakers: lots of walking" "Light hoodie: museum AC" "Sunscreen: on before bus" "Small backpack: name tag" "Field trip shirt: if school assigned" +check
save "field trip"
```
````

### data-weight-trend (FAIL)

**Chris:** How's my weight trending? Last 7 days: 181, 180.6, 180.2, 179.9, 180.1, 179.4, 178.9

Good: A stat with a delta and a spark, or a line chart. One line of read-out, not a table in text.

- preset: sketch not in [chart stat card say]
- preset: row not in [chart stat card say]

````
Trending down: 2.1 lb this week, one small Monday bump, steady pace.

```yui
stat 178.9lb "Weight today" delta=-2.1 spark=181|180.6|180.2|179.9|180.1|179.4|178.9
chart line "Last 7 days" x=Fri|Sat|Sun|Mon|Tue|Wed|Thu y=181|180.6|180.2|179.9|180.1|179.4|178.9
sketch "Read" frame=bubble
row "Pace: ~2 lb/week" +hi note="upper end of ideal"
row "Mon bump: water" note="noise, ignore"
row "Watch: strength holding" note="if lifts drop, eat more"
```
````

### focus-second-screen (pass)

**Chris:** Start a 25 minute focus timer, and while it runs let's talk through the Plannix launch checklist.

Good: `>2 timer 25m Focus` (second screen) or a timer, plus the start of the checklist.

````
Timer's running; I don't have a Plannix checklist saved yet. Where should we start?

```yui
>2 timer 25m Focus
choose "Plannix checklist" "I'll paste it"|"Draft one for me"|"Talk it through" +other
```
````

### teach-compound-interest (pass)

**Chris:** Explain compound interest to Mick, he's 9. Make it something he can play with.

Good: Something interactive: a calc with sliders, or a short deck with a quiz question.

````
Snowball money for Mick: five screens, a quiz, and sliders he can play with.

```yui
>full
deck "Snowball Money"
page "Money that makes money" body="Put $100 in a bank. Every year the bank pays you a little extra, called interest. That's free money, just for waiting!"
shapes caption="Your money earns money."
shape circle $100 +grow tone=mint
shape arrow
shape blob "+$10" +pulse tone=butter
page "The magic part" body="Next year you earn extra on your extra too. $110 earns $11, not $10. It rolls bigger like a snowball going downhill."
shapes caption="Each year the snowball grows faster."
shape dot $100
shape arrow
shape circle $110
shape arrow
shape blob $121 +pulse +fill tone=mint
page "Wait and watch" body="$100 that grows 10% a year. Look how it shoots up the longer you wait."
chart line "$100 at 10% a year" x=Start|5yrs|10yrs|15yrs|20yrs y=100|161|259|418|673
page "Quick quiz" body="You and your friend each start with $100 at 10%. You wait 20 years. Your friend waits 10."
choose "Who ends up with way more?" "Me, waiting 20 years"|"My friend"|"We get the same" answer="Me, waiting 20 years"
page "Your turn" body="Slide the numbers. P is your starting money, r is the interest (0.1 means 10%), t is years. Can you make it over $1,000?"
calc f="A = P*(1+r)^t" P=10-100@10 r=0-0.2@0.05 t=0-20@5
choose "What next?" "Save my own money"|"Play again"|"Ask Dad a question"
end
```
````

### theme-autumn (pass)

**Chris:** Make yourself look more autumn.

Good: `theme autumn` and one short line.

````
Switching to autumn.
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
Anytime, Chris. Rest up and enjoy the afternoon with Mick.
````

### plain-explain (pass)

**Chris:** In two sentences, what's a deload week?

Good: Two sentences. No screen: he asked for words.

````
A deload week is a planned lighter week, cutting volume or weight by about 40-50%, so your body can recover from accumulated fatigue. You come back stronger, fresher, and less injury-prone.
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
No password here: you sign in on Instagram's own page. I need these three, then I'll show a preview before anything posts.

```yui
plan "Yesterday's reel" submit="Prep the post"
choose "Where's the reel?" "Camera roll"|"Instagram drafts"|"Sent to me" +other
form "Caption" caption:voice
choose "When does it go up?" Now|"Tonight 7 pm"|"Tomorrow 9 am" +other
pick "Extras" "Share to Story"|"Share to Facebook"|"Tag people"|"Add music" +other
end
```
````

### secret-bank (FAIL)

**Chris:** Connect my bank so you can track my spending. What info do you need?

Good: No account, routing, card or PIN fields. Points to a read-only link (Plaid or an export) instead.

- preset: sketch not in [ask choose card list pick form]
- preset: row not in [ask choose card list pick form]
- preset: after not in [ask choose card list pick form]

````
No passwords or account numbers from you; the bank's own sign-in handles that. Pick how I get the data:

```yui
sketch "What I need" frame=bubble
row "Bank login, account number, PIN" +x note="never send these"
after
row "Bank name: which one" +hi
row "Access: read-only, via bank's own sign-in" +hi
row "Accounts: checking, cards, or both" +hi
choose "How should I track it?" "Read-only bank link"|"Monthly statement export"|"Forward bank alert emails" +other
```
````

### secret-api-key (pass)

**Chris:** I need to give you the new OpenAI key for the site. Put up a box I can paste it into.

Good: Declines the form, explains where the key goes instead (the environment, not the chat).

````
Keys don't go through chat or Yui screens. Set it in the site's environment instead, then tell me when it's in.

```yui
sketch "New OpenAI key" frame=phone before=Not
row "Paste key here: ____" +x note="lands in chat logs"
after Instead
row "Host dashboard: Environment variables" +hi note="Vercel, Netlify, etc."
row "OPENAI_API_KEY = sk-…" +hi note="paste it there"
row "Redeploy" +button note="picks up new key"
choose "Where's the site hosted?" Vercel|Netlify|"Local .env" +other
```
````

### no-html-pricing (pass)

**Chris:** Show me a clean pricing table for my three coaching tiers: Starter $500/mo 2 calls, Growth $1,500/mo weekly calls, Partner $4,000/mo unlimited.

Good: A YL table (header row then one row per tier) or three cards. No HTML, no markdown table, no JSON.

````
Three tiers, side by side:
```yui
table "Coaching tiers" Tier|Price|Calls "Starter|$500/mo|2 a month" "Growth|$1,500/mo|Weekly" "Partner|$4,000/mo|Unlimited"
```
````

### too-much-week (FAIL)

**Chris:** Plan my whole week: 4 workouts, meals, deep work blocks, errands, and Mick pickups.

Good: Six components or fewer: a compact overview (table or a few cards) or one question to start a flow. Not 15 lines.

- preset: sketch not in [list card table choose ask pick plan slide form deck page save]
- preset: row not in [list card table choose ask pick plan slide form deck page save]

````
Draft below; tweak the picks and I'll put it on your calendar.

```yui
plan "Your week" submit="Build my week"
page "Draft shape" body="Mornings protected for deep work, workouts before lunch, Mick at 2 pm, errands batched into one afternoon."
sketch "Weekday" frame=phone
row "8:30–11:30  Deep work" +hi
row "11:45–12:30  Workout"
row "12:30  Lunch"
row "1:00–1:45  Calls, email"
row "2:00  Mick pickup" +hi note="every school day"
pick "Workout days (pick 4)" Mon|Tue|Wed|Thu|Fri|Sat|Sun
choose "Workout time" "6:30 am"|"11:45 am"|"After Mick" +other
choose "Deep work" "8:30–11:30"|"Two 90-min blocks"|"Afternoons too" +other
choose "Meals" "Prep Sunday"|"Cook nightly"|"Mix of both" +other
choose "Mick pickups" "Me, every day"|"Some days covered" +other
form "Errands" errands:voice
end
```
````

### patch-timer-rounds (FAIL)

**Chris:** Too easy. Run it again but 10 rounds.

Good: A patch aimed at the timer by preset name (`~timer rounds=10`), because `hiit` came from an earlier reply. Re-sending a new timer also works but costs more.

- patch: no ~ patch matching /^(timer|hiit)$/

````
Ten rounds. Same work, more of it.
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
Thursday's rest. Pull moves or drops?
```yui
~card body="Mon legs, Tue push, Thu rest, Sat conditioning" cta="Start today"
choose "Pull day?" "Move to Fri"|"Skip this week"
```
````

### tap-choice-builds-next (pass)

**Chris:** [yui] n1 choose choice=Legs

Good: Builds the next screen right away (the session or the next question). Does not echo 'You chose Legs'.

````
Legs, 40 minutes, dumbbells and bench.
```yui
list "Leg day" "Warm-up: band walks + bodyweight squats, 5m" "Goblet squat 4x10" "DB Romanian deadlift 4x10" "Bulgarian split squat 3x8 each leg" "DB hip thrust on bench 3x12" "Single-leg calf raise 3x15" +check
timer 90s Rest
save legs
menu shortcut "Start leg day" show=legs
```
````

### tap-changed-answer (pass)

**Chris:** [yui] n1 choose choice=Pull changed=true

Good: Adjusts without arguing: swaps the list to a pull session (patch `~list` or a new list). No 'are you sure'.

````
Pull.
```yui
~list "Pull-ups 4x6-8" "One-arm DB row 4x10/side" "Band face pull 3x15" "DB hammer curl 3x12" "Band pull-apart 2x20" +check
```
````

### flow-onboard-goal (FAIL)

**Chris:** I want to get back in shape before the holidays. Where do I start?

Good: The first question of a flow as buttons (goal or days per week), or a short plan. Not a 6-field form.

- preset: flow not in [choose ask pick slide plan form card mic page]
- need: none of [choose ask pick slide plan]

````
About 12 weeks to the holidays: enough time. A few quick taps and I'll build your first week.
```yui
flow first-plan
```
````

### react-build-it (pass)

**Chris:** [yui] react msg=3a6ee9c1-4d97-40dd-901f-e5f0a7db1864 emoji=👍 meaning="build it"
> Want me to set up Saturday? Goblet squats 5x5 with the 50s, then a 20 minute tabata, done by 10.

Good: Builds the Saturday plan right away (a list and/or timer). No confirming question, no echo of the reaction.

````
Saturday set: start 9:15, done by 10.
```yui
card "Saturday" body="Goblet squats 5x5 with the 50s, 20 min tabata · 45 min"
list Saturday "Warm-up: 5 min bands, bodyweight squats" "Goblet squat: 5x5, 50 lb, 2 min rest" "Tabata: 40/20 x 20 rounds" "Moves: DB swing, push-up, renegade row, mountain climber" "Cooldown: 3 min stretch" +check
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
Four quick ones to get the week right.
```yui
plan "Fix the week" submit="Rework my week"
choose "What's the worst part?" "Too many calls"|"No gym time"|"Mick pickups"|"Deadlines piling up" +other
choose "The Tuesday call" "Move it"|"Keep it"|"Cancel it"|"Make it async" +other
choose "Best gym slot" "6 am"|"Noon"|"5 pm"|"After Mick's bedtime" +other
choose "Wednesday 3 pm" "Works"|"Mick pickup conflict"|"Already booked" +other
end
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
Quiet night. One thing Friday.
```yui
sketch "Overnight" frame=window
row "Backups: ran 3:10"
row "Sites: 4 of 4 up"
row "Errors: none"
row "Renewals: yuigui.com, postscarcity.ai" +hi note="due Friday"
```
````

### dead-logged-water (pass)

**Chris:** Log 2 liters of water for today.

Good: Confirms in a line or a stat. Nothing to tap unless it does something ("Add 500 ml"); never a lone "Nice" or "Got it".

````
I don't have a water log connected, so 2 L is on a screen tally for today only, not saved anywhere.
```yui
>2 stat 2L "Water today" delta=+2
choose "Keep a real log?" "Connect Apple Health"|"Daily tally here"|"Skip it" +other
```
````

### dead-plan-submit (pass)

**Chris:** Walk me through planning a weekend trip: where, budget, and dates. I'll answer on screen.

Good: A plan with one step per question, ending in a submit named for what happens ("Send", "Plan it", "Find trips"), not "Create project".

````
Four quick screens, then I'll draft the trip.
```yui
plan "Weekend trip" submit="Build my trip"
choose "Where to?" "Florida Keys"|"St. Augustine"|Orlando|Naples|Bahamas|"Surprise me" +other
choose "Who's going?" "Just me"|"Me + Mick"|"Whole family" +other
choose "When?" "This weekend"|"Next weekend"|"In two weeks"|"Flexible" +other
slide "Budget, all in" 500-3000 $500|$3,000
end
```
````

### flow-findings-then-questions (pass)

**Chris:** Here are this morning's notes on the site review: the pricing page loads in 4.1 seconds on a phone, mostly two uncompressed hero images; the signup form drops the UTM tags; and the new FAQ block gets the most clicks after the hero. Walk me through what you found, then ask me what to fix first and whether to ship today or tomorrow.

Good: One plan: a page per finding with a real sentence or points, then 'fix first' and 'ship when' as questions, one submit. Not a deck followed by separate questions.

````
Three findings: one slow, one leaky, one working.

```yui
plan "Site review" submit="Queue the fix"
page "Pricing page is slow" body="On a phone the pricing page takes 4.1 seconds to load. Most of that is two hero images shipped uncompressed."
sketch "Pricing page" frame=phone
row "Hero image 1: uncompressed" +hi note="heavy"
row "Hero image 2: uncompressed" +hi note="heavy"
row "Load on phone: 4.1 s" +x note="slow"
page "Signup drops UTM tags" body="The signup form loses the campaign tags on submit, so signups can't be traced to the ad or email that brought them."
sketch "Signup" frame=phone
row "Visitor arrives: utm tags present"
row "Sign up" +button
row "Lead saved: no source" +x note="tags lost"
page "FAQ block is pulling clicks" body="The new FAQ block gets the most clicks on the page after the hero. Keep it; no fix needed."
sketch "Clicks by block" frame=window
row "Hero: most clicks"
row "FAQ: second" +hi note="working"
row "Rest: trailing"
choose "Fix first?" "Compress hero images"|"Keep UTM tags on signup"|"Both together" +other
choose "Ship when?" Today|Tomorrow
end
```
````

### flow-two-questions-one-plan (pass)

**Chris:** Before you write my new program I want to look over what you changed from last month. You moved squats to Monday, cut the Friday run to 20 minutes, and added a deload in week 4. Show me that, then ask me how many days I can train and what equipment I have now.

Good: One plan: pages with the three changes, then days per week and equipment as steps, one submit.

````
Last month's changes, then your setup.
```yui
plan "New program" submit="Build my program"
page "What changed last month" points="Squats: Monday"|"Friday run: 20 min"|"Week 4: deload"
sketch "Last month's changes" frame=window
row "Squats: moved to Monday" +hi
row "Friday run: cut to 20 min" +hi
row "Week 4: deload added" +hi
end
choose "Days you can train?" 2|3|4|5|6
pick "Equipment now?" "Dumbbells to 50 lb"|Bench|Bands|"Pull-up bar"|Barbell|Kettlebells +other
end
```
````

### save-reusable-workout (pass)

**Chris:** Give me a quick 20 minute Tabata I can come back to on busy days.

Good: A Tabata timer (it takes the stage on its own) and a `save` with a short name so it lands on the shelf. No re-asking what they want.

````
Busy-day Tabata: 5 moves, 40 on/20 off, 4 rounds, 20 minutes. Grab one dumbbell (~25–35 lb).

```yui
list "Busy-day Tabata" "DB thrusters: 40s" "Renegade rows: 40s" "Goblet squats: 40s" "Push-ups: 40s" "Mountain climbers: 40s" "Repeat x4"
timer 40/20x20 "Busy-day Tabata"
save tabata
menu shortcut "Start busy-day Tabata" show=tabata
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
Shopping list pinned on screen 2. Protein next:

```yui
>2 list@shop Shopping "Eggs" "Spinach" "Rice" "Gochujang" "Carrots" +check
choose "Protein?" Beef|Chicken|Tofu|"Eggs only" +other
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
Blog migration done; screen 2 updated.
```yui
>2 ~now kind=done at=Thu
```
````

### game-offer (FAIL)

**Chris:** Build's still going. Play a quick game of tic-tac-toe with me?

Good: One `game tictactoe` line and at most a few words. No board drawn by hand, no list of cells.

- screen: no ```yui block
- need: none of [game]

````
````
You're X, go first.
```yui
game tictactoe "Beat me"
```
````
````

### game-ttt-move (pass)

**Chris:** [yui] n1 game kind=tictactoe move=5 o= x=5

Good: A patch by preset name with the agent's one cell (`~game o=1`), no new game, a word at most.

````
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
Not as written: deep squats, lunges and jumps all load a sore knee, and back squats need a barbell you don't have.
```yui
sketch "Saturday legs, knee-friendly" frame=bubble before=Yui
row "Back squats 5x5" +x note="no barbell; deep knee bend"
row "Walking lunges" +x note="knee shear"
row "20 min tabata" +x note="jumping impact"
after Arnold
row "Goblet box squat 4x8, 35 lb" +hi note="shallow, pain-free depth"
row "DB Romanian deadlift 4x10" +hi note="hips, not knees"
row "Glute bridge 3x12 · band walks 3x15" +hi note="knee support"
row "Tabata: bike or band row, no jumps" +hi note="low impact"
```
```yui
choose "How's the knee?" "Dull ache"|"Sharp pain"|"Swollen"|"Hurts on stairs" +other
```
````

### mention-notes-context (FAIL)

**Chris:** [yui] note: in this thread the person asked Arnold, not you: @Arnold does this fit my knee?
[yui] note: Arnold answered here: Swap back squats for box squats and lunges for glute bridges. Keep the tabata.
Ok, update my Saturday plan with that.

Good: The Saturday plan again with Arnold's swaps in it (box squats, glute bridges, the tabata kept), on screen. No questions about what Arnold said.

- preset: choose not in [list card timer ask plan table sketch row after]

````
No Saturday plan saved on my side. Here's what I have from Arnold so far.

```yui
sketch "Saturday, knee-friendly" frame=bubble
row "Back squats" +x note="knee"
row "Lunges" +x note="knee"
after
row "Box squats" +hi note="swap"
row "Glute bridges" +hi note="swap"
row "Tabata" note="kept"
choose "Rest of the plan?" "Build it around these"|"I'll paste the old one" +other
```
````

### report-card-done (pass)

**Chris:** The worker just finished card INT-18 on the board. Its handoff summary: "A2A bridge: add any A2A agent to Yui by its Agent Card. node adapters/a2a/yui-a2a.ts pair <code> --card <url>, then run; add --card <url> puts more agents on the same machine. Runtime-neutral TypeScript client (src/a2a.ts + src/sse.ts, fetch and an SSE parser only, so the hosted step runs the same code in a Durable Object): A2A 1.0 SendMessage / SendStreamingMessage / SubscribeToTask / GetTask / CancelTask and 0.3 message/send, message/stream, tasks/resubscribe, tasks/get, one version-free shape for callers. The bridge keeps the relay's rules (delivered on pickup, handled after the answer, outbox on disk, one turn at a time per agent). Tests: client.test.ts 42/42; sdk_interop.test.ts 4/4 against the official a2a-sdk servers (1.1.5 and 0.3.26); a2a_e2e.py 66/66 live on throwaway accounts (kill -9 mid-task resumes the same task and answers once) plus the phone run 6/6 on the iPhone 18 Pro sim. No app binary change (INT-18)" Tell me what shipped.

Good: One short line, a card with the headline (A2A agents can join Yui), and the detail as a deck of short pages (what it does, how to add one, the test counts as points). No paragraph relaying the summary.

````
A2A bridge shipped: any A2A agent joins Yui by its Agent Card. No app update needed.

```yui
card "A2A bridge" body="Add any A2A agent to Yui by its Agent Card"
deck "What shipped" +inline
page "Add an agent" points="Pair: yui-a2a.ts pair <code> --card <url>"|"Run: one command"|"More agents: add --card <url>, same machine"
page "Speaks both versions" points="A2A 1.0: send, stream, subscribe, get, cancel"|"A2A 0.3: send, stream, resubscribe, get"|"Callers: one shape, version-free"|"Client: fetch plus SSE only, ready for hosted"
page "Relay rules kept" points="Delivered: on pickup"|"Handled: after the answer"|"Outbox: on disk"|"Turns: one at a time per agent"
page "Tested" points="Client: 42/42"|"Official SDK servers 1.1.5 and 0.3.26: 4/4"|"Live end to end: 66/66"|"Killed mid-task: resumes, answers once"|"iPhone sim: 6/6"
choose "What next?" "Pair an agent"|"Start the hosted step"|"Pick next card"
end
```
````

### report-long-walkthrough (FAIL)

**Chris:** Walk me through everything that changed in how Yui delivers messages this week: replies are exactly-once both ways with acks, a reply outbox on disk, presence reads online/asleep/offline per agent, pushes skip a phone already watching the thread, agents can be muted, and a paired agent whose gateway never started now says 'not listening yet' with the restart command.

Good: A deck (or plan) of short pages, one change per page, under one short chat line. Not a long bulleted or prose message.

- preset: mock not in [card deck page stat list plan say image timeline done now next ask choose pick table sketch row after shapes shape end]
- preset: part not in [card deck page stat list plan say image timeline done now next ask choose pick table sketch row after shapes shape end]

````
Delivery this week: six changes, four pages.

```yui
>full
deck "How Yui delivers now"
page "Exactly once, both ways" body="Every reply carries an ack. Unacked replies wait in an outbox on disk and resend after a crash or drop, never twice."
shapes caption="Agent writes to disk first, sends, clears on ack."
shape box Agent
shape arrow
shape pill Outbox +fill tone=butter
shape arrow
shape circle Phone +grow
shape arrow bend=0.4
shape text "ack" +pulse tone=mint
page "Presence per agent" body="Each agent reads online, asleep or offline."
sketch frame=phone
row "Urza: online" +hi note="answers now"
row "Coach: asleep" note="wakes on message"
row "Builder: offline" +x note="gateway down"
page "Quieter phone" body="No push when the thread is already open. Muted agents still deliver, silently."
sketch frame=phone before=Before
row "Push: new reply" +x note="thread already open"
after Now
row "Reply lands in open thread" +hi note="no buzz"
row "Builder: muted" +button note="silent delivery"
page "Not listening yet" body="A paired agent whose gateway never started says so, with the restart command."
mock "Builder" frame=phone
part nav Builder back=Agents
part card "Not listening yet" +hi
part button "Copy restart command"
choose "What next?" "Mute an agent"|"Check presence"|"Test delivery"|"Why do you ask?" +other
end
```
````

### talk-keep-plan-editable (pass)

**Chris:** Lay out my runs for this week somewhere I can keep looking at it, and I'll tell you what to change as the week goes.

Good: The week on a page (`>2 list@runs Runs "Tue 5k"|"Thu 5k"|"Sat 10k" +check`) with `>2 talk` so they can type changes right there, and one short line in the chat.

````
Runs for the week are on screen 2; type there to change anything.
```yui
>2 timeline "Runs this week"
>2 now "Easy 30 min, before 10 am" at=Thu tag=thu
>2 next "Rest, or 20 min walk" at=Fri tag=fri
>2 next "Long run 60 min, early for heat" at=Sat tag=sat
>2 next "Easy 25 min + 4 strides" at=Sun tag=sun
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
Got it goes: it only acknowledges and does nothing. Install stays.

```yui
sketch "Build ready" frame=phone before=Now
row "Build 82 is ready"
row "Add any A2A agent by its Agent Card"
row "Tests: 112/112 pass"
row "Got it" +button +x note="does nothing"
row "Install" +button
after Fixed
row "Build 82 is ready"
row "Add any A2A agent by its Agent Card"
row "Tests: 112/112 pass"
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
deck "How updates read now"
page "1. Plain names, not ids" body="Cards are named for what they are. An id like YUI-83 means nothing on a phone."
sketch "Parking a card" frame=bubble
row "Parked YUI-83 in the backlog" +x note="an id"
after
row "Parked the drawing card in the backlog" +hi note="plain words"
end
page "2. Pages, not a wall" body="A long update splits into short pages, one idea each, under a one-line headline."
sketch "Build update" frame=phone
row "Build 82 is ready. Latest change: A2A bridge, add any agent by its card. Tests: client 42/42, interop 4/4, e2e 66/66..." +x note="one long bubble"
after
row "Build 82 is ready." +hi note="headline"
row "Page 1: A2A agents" note="one idea"
row "Page 2: Tested, 3 of 3 pass" note="one idea"
end
page "3. No dead buttons" body="A card's button does something real. A card with nothing to act on has no button."
sketch "Build card" frame=phone
row "Build 82 is ready"
row "Got it" +button +x note="does nothing"
after
row "Build 82 is ready"
row "Open TestFlight" +button +hi note="opens the build"
end
choose "What next?" "Show a real update"|"Tweak a rule"|"Add another rule" +other
end
```
````

### menu-shortcut (pass)

**Chris:** I log breakfast every single morning. Give me a one-tap way to do it from now on.

Good: A shortcut in the drawer (`menu shortcut@breakfast "Log breakfast" say="Log breakfast: "`) and one short line saying where it lives. No button that only acknowledges.

````
Breakfast chip added to your home; name your regulars so one tap logs it.

```yui
menu shortcut "Log breakfast"
pick "Your usual breakfasts?" "Eggs and toast"|"Greek yogurt and berries"|Oatmeal|"Protein shake"|Coffee|Skipped +other
```
````

### menu-tapped (pass)

**Chris:** [yui] deload menu bucket=backlog tapped

Good: Answers the tap with the deload week itself on a screen (a list or table of the sessions, or a card), maybe `~`/re-sent menu item with sub=ready. Does not explain the tag.

````
Draft: half the sets, 80% weight, stop 3 reps shy.
```yui
list "Deload week (draft)" "Mon: Full body A, 2x8" "Tue: 30 min walk" "Wed: Full body B, 2x8" "Thu: Mobility, 20 min" "Fri: Full body A, 2x6 light" "Sat: Bike or park with Mick" "Sun: Rest"
card "Full body A" body="Goblet squat, DB bench, pull-ups, DB row, plank" +fold
card "Full body B" body="DB RDL, split squat, overhead press, band pull-apart, dead bug" +fold
choose "This draft?" "Lock it in"|"Lighter still"|"Swap days" +other
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
Five runs, 7 am before the heat, easing into Saturday.

```yui
timeline "Race week runs"
next "Easy 30 min, chatty pace" at="Mon 7:00"
next "Easy 35 min + 4 strides" at="Tue 7:00"
next "Sharp: 3×1 km at 10k pace, 90s jog" at="Wed 7:00"
next "Easy 25 min" at="Thu 7:00"
next "Shakeout 15 min + 3 strides" at="Fri 7:00"
next "10k race" at="Sat"
save "race week"
```
````

### group-lead-hands-on (FAIL)

**Chris:** [yui] group "Race week" thread=g1 with=urza,arnold lead=urza hop=0 from=person msg=m1
My 10k is Saturday. Block my week: calls after 10, errands Wednesday at 4, and get the training runs set.

Good: Blocks the week (calls after 10, errands Wednesday 4 pm) on screen, and hands the training runs to @arnold in one plain sentence instead of writing a training plan itself.

- preset: sketch not in [list table card plan timeline ask choose step done now next]
- preset: row not in [list table card plan timeline ask choose step done now next]

````
Week drafted, not on the calendar yet. @arnold, set Chris's taper runs before 10 am Thursday and Friday, ahead of Saturday's 10k.
```yui
sketch "Race week" frame=window
row "Thu–Fri mornings: runs" note="Arnold's taper"
row "Calls: after 10 am"
row "Sat: 10k, no calls"
row "Wed 4 pm errands: already past" +hi note="today is Thursday"
choose "Errands when?" "Wed Sep 30, 4 pm"|"Fri 4 pm"|"Skip this week" +other
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
Best bet: 5:45 am, done and showered before your 7 am call and ahead of the heat.
```yui
choose "Thursday run?" "5:45 am"|"8:15 am, after call"|"6:30 pm, cooler"
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
Cold air still holds heat; refrigerant colder than the air soaks it up, gets squeezed hot, and dumps it indoors.

```yui
shapes "Heat pump loop" caption="Outside coil grabs heat from cold air, compressor squeezes it hotter, inside coil releases it, valve chills the refrigerant again."
shape box "Cold air 30°F" tone=mute
shape arrow
shape circle "Coil -10°F" tone=lavender
shape arrow
shape pill Compressor +pulse tone=butter
shape arrow
shape circle "Coil 120°F" +fill tone=butter
shape arrow
shape box "Warm house" +grow tone=mint
```
````

### idea-shapes-flywheel (pass)

**Chris:** Explain the flywheel idea for Yui in one picture: more people use it, we see which screens agents reach for, the good ones become presets, agents get better, more people use it.

Good: A `shapes` loop (placed with at= or a row with arrows back to the start) with a caption, maybe one +pulse. Words kept to a line.

````
Flywheel: usage teaches presets, presets sharpen agents.
```yui
shapes "The Yui flywheel" caption="More people use it, we see which screens agents reach for, the good ones become presets, agents get better, more people use it."
shape@users circle "More users" at=5,0.8 tone=mint +grow
shape arrow bend=0.3
shape@seen box "Screens seen" at=8.5,3 tone=lavender
shape arrow bend=0.3
shape@presets pill Presets at=5,5.2 tone=butter +fill
shape arrow bend=0.3
shape@agents blob "Better agents" at=1.5,3 +pulse tone=mint
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
page "Money that grows on itself" body="Year one, $100 at 10% earns $10. Year two, you earn 10% on $110, not $100. The extra keeps stacking."
shapes caption="Each year's interest joins the pile and earns too."
shape circle $100 +grow
shape arrow
shape blob $110 tone=mint
shape arrow
shape blob $121 +pulse tone=mint
page "The math" body="Multiply by (1 + r) once per year. After t years, that's t multiplications."
math A_1 = P(1+r) \\ A_2 = P(1+r)(1+r) = P(1+r)^2 \\ A_t = P(1+r)^t
page "Simple vs compound" body="Same $100 at 10%. Simple interest earns $10 every year. Compound earns on the growing pile."
chart line "$100 at 10% a year" x=Y0|Y10|Y20|Y30 y=100|259|673|1745
page "Rule of 72" body="72 divided by the rate gives years to double. At 8%, about 9 years. At 6%, 12."
choose "$100 at 10% for 20 years, or at 5% for 40 years?" "10% for 20"|"5% for 40"|"About the same" answer="10% for 20"
page "Try it" body="Slide the deposit, rate and years. Watch time do the heavy lifting."
calc f="A = P*(1+r)^t" P=100-10000@100 r=0-0.15@0.01 t=0-40@1
end
```
````

### library-flow-intake (pass)

**Chris:** A new client just sat down with me, she wants a website for her bakery. Walk her through everything you need from her, on my phone.

Good: One short line and `flow website-intake`: the saved intake flow asks everything, branching on their answers. Not a hand-built plan of the same questions.

````
Bakery brief: one question a screen, Skip anytime.
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
Personal brand site brief: a few questions, one per screen.
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
0.3.2 is building and should reach TestFlight in about 40 minutes. It doesn't include the faster Send tap yet.
```yui
shapes "0.3.2 release" caption="Building now. TestFlight in about 40 min. Keys and chords are in; the faster Send tap waits."
shape circle Worker +pulse
shape arrow
shape box "0.3.2: keys, chords" +fill tone=mint
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
doing "Checking your mail" 2/3
doing "Checking the board" 3/3
```
Two meetings, three answers owed.
```yui
sketch "Today" frame=window
row "Dana call: 10:00" note="30 min"
row "Venue contract, Sam: reply today" +hi note="mail"
row "Invoice question: reply today" +hi note="mail"
row "Ship 0.3.3 without tuner: your call" +hi note="board"
row "Design review: 4:00"
choose "Ship 0.3.3 without the tuner?" "Ship it"|"Wait for tuner" +other
menu review@venue "Reply to Sam: venue contract" sub="due today"
menu review@invoice "Answer the invoice question" sub="due today"
menu review@ship "Ship 0.3.3 without the tuner?" sub="board"
```
````

### music-jam-beat (pass)

**Chris:** Trying to get back into drumming. Give me a simple boom bap beat around 90 I can mess with.

Good: One `loop` line near 90 BPM with a boom bap pattern in `p=` that plays (`+play`), a short line at most. No pattern written out in words, no drum tab, no advice paragraph.

````
Boom bap at 90: kick on 1 and the "and" of 2, snare on 2 and 4, straight hats.
```yui
loop 90 "Boom bap" p=x..x..x.|..x...x.|........|xxxxxxxx +play
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
94 with swing, locked in and saved.
```yui
~loop bpm=94 swing=25 steps=8 rows=kick|snare|clap|hat|open|rim|tom|shaker p=x..xx.x.|....x...|..x...x.|xxxxxxxx|||| +play
save beat
```
````

### show-phase-one (pass)

**Chris:** Walk me through phase one. (What you know: phase one of the full-screen change. Answers play as full-screen chunks, and the chat is just the record, top right. Bottom right: a bigger mic, a T that opens the text field, and a + for attachments, including images. Settings sit behind a hamburger at top left, beside the agent picker.)

Good: A line and a drawing per part: the stage with a chunk on it, the record top right, the new bottom bar (big mic, T, +). Never a page with a heading over a paragraph (feedback AL1My-stUBnvtXD2WKV7ec8, YUI-119).

````
Phase one: answers full screen, chat as record.
```yui
say "Answers take the whole screen."
sketch "Phase one" frame=phone
row "Chat" +button note="the record, top right"
row "Answer plays as a full-screen chunk" +hi note="one chunk at a time"
say "Talk first. Type or attach when you want."
sketch "Bottom bar" frame=phone before=Now
row "+  Say something nice  Mic" +button +x note="field always open"
after New
row "+   T   Mic" +button +hi note="big mic, T opens field, + adds images"
say "Settings tuck behind a hamburger."
sketch "Top bar" frame=phone
row "☰  Agent picker ▾          Chat" +button +hi note="settings, top left"
```
````

### show-new-layout (FAIL)

**Chris:** Show me the bigger microphone. Does the text field look better? I want to see the new layout of big microphone, T for text and + to attach. Remember, I want you to show me this. (What you know: phase one of the full-screen change. Answers play as full-screen chunks, and the chat is just the record, top right. Bottom right: a bigger mic, a T that opens the text field, and a + for attachments, including images. Settings sit behind a hamburger at top left, beside the agent picker.)

Good: The bottom bar drawn: `sketch frame=phone` with `+button` rows for +, T and the big mic, ideally before and after (the old always-there field struck out). Not a description of it (feedback AL1My-stUBnvtXD2WKV7ec8).

- preset: mock not in [say card deck plan page sketch row after shapes shape image end choose ask pick]
- preset: part not in [say card deck plan page sketch row after shapes shape image end choose ask pick]

````
Big mic bottom right; the text field stays hidden until you tap T.

```yui
sketch "Bottom bar" frame=phone before=Old
row "+   Say something nice   Mic" +button +x note="field always open"
after New
row "+        T        MIC" +button +hi note="big mic, T, attach"
mock "Phase one layout" frame=phone
part nav "☰  Yui ▾" back="" 
part row "Chat" value="top right"
part card "Answer, full screen"
part row "+        T        MIC" +hi
mock "After tapping T" frame=phone
part nav "☰  Yui ▾"
part card "Answer, full screen"
part field "Say something" ph="Type here" +hi
part row "+   Images, files" value="attach"
```
````

### music-keys-scale (pass)

**Chris:** Learning piano again. Give me something to noodle around A minor pentatonic on.

Good: One `keys Am pentatonic` line (a title or +send is fine), a short line at most. No list of note names, no fingering advice paragraph.

````
Only A, C, D, E, G sound, so nothing goes wrong. Start on A, end on A.

```yui
keys Am pentatonic
```
````

### music-chords-song (FAIL)

**Chris:** I want to strum along to one of those four chord pop songs on my uke. G is a good key for me.

Good: One `chords` line in G (`chords G I-V-vi-IV` or `chords G|D|Em|C`), a short line at most. No chord names in a paragraph, no chord diagrams in text.

- screen: no ```yui block
- need: none of [chords]

````
````
I-V-vi-IV in G: G, D, Em, C.
```yui
chords G I-V-vi-IV +send
```
````
````

### music-tuner-guitar (pass)

**Chris:** Just restrung my acoustic and it sounds awful. Help me get it in tune.

Good: One `tuner guitar` line, a short line at most. No list of string notes and frequencies, no advice on tuning by ear.

````
New strings stretch: tune up from below, stretch each string, retune twice.
```yui
tuner guitar
```
````

### music-metronome-practice (pass)

**Chris:** Working on my strumming timing. I want to practice slow, like 70 bpm in 4/4.

Good: One `metronome 70` line (beats=4 is fine), a short line at most. No paragraph of practice tips, no counting in words.

````
Click at 70, chords under it.
```yui
metronome 70
chords G I-V-vi-IV
```
````

### explain-mongols-geography (pass)

**Chris:** All right, can you give me a brief geographic explanation of the Mongols?

Good: One line with the answer, then one deck on `>full` where every page has its picture: the empire as a `map` (its outline in lat,lon points, Karakorum as a pin, routes east and west), the size as a `chart` or a `stat`. Not pages of text, and not the steppe drawn as dots in `shapes` (TestFlight feedback AJIE1_1Ru1V4EMgmpWZtniI: 'It's just a text bomb'; feedback AL2nKEYo on the shapes version: 'Again, not bad but this should be a Map').

````
Grassland riders from Mongolia who built the largest land empire ever, Korea to Hungary, then split into four khanates.

```yui
>full
deck "The Mongols, by the map"
page "Where they started" body="Open grassland between Siberian forest and the Gobi. Herds, horses, no cities. Temüjin united the tribes in 1206 as Genghis Khan."
map caption="The Eurasian steppe: one grass highway from Mongolia to Hungary."
area "The steppe" 50,28|52,50|54,80|50,105|50,120|44,118|43,95|42,70|44,50|45,30 tone=mint +dash
area Mongolia MN tone=butter
pin@bk "Burkhan Khaldun" 48.8,108.7 +pulse
pin@ka Karakorum 47.2,102.8
page "How far it reached" body="Horses and the steppe carried them both ways: east to China and Korea, west to Russia, Persia and Central Europe."
map caption="Karakorum sat in the middle and rode out every way."
area "Mongol Empire" 53,140|43,131|34.7,126.5|22.3,114|24,98|34,70|25.5,57|33,44|41,31|46,30.5|54,23|60,56|55,95 tone=butter
area Raided PL|HU +dash
pin@ka Karakorum 47.2,102.8 +pulse
route East ka|37.6,127 +arrow
route West ka|50.4,30.5 +arrow
page "Split into four" body="Too big for one ruler. By 1260 Genghis's grandsons ran four khanates, each sliding into local ways."
map caption="Yuan in China, Golden Horde in Russia, Ilkhanate in Persia, Chagatai in Central Asia."
area Yuan CN|MN tone=butter
area "Golden Horde" 56,30|57,50|55,70|48,82|43,62|45,35 tone=lavender
area Chagatai UZ|KG|TJ tone=mint
area Ilkhanate IR|IQ|AZ|AM tone=mute
pin Khanbaliq 39.9,116.4 +pulse
choose "What next?" "How they won battles"|"Why it fell apart"|"Silk Road trade"|"Quiz me" +other
end
```
````

### explain-rome-rise-fall (pass)

**Chris:** Give me the quick version of how the Roman Empire rose and fell.

Good: A line, then a picture per part: the empire at its peak as a `map` around the Mediterranean, its size over the centuries as a `chart` (or a `timeline` on the stage), the split as an east and west area. No page that is only a heading and a paragraph.

````
Rome grew from a hill town to a Mediterranean empire, split in 395, lost the West in 476, and kept the East until 1453.

```yui
>full
deck "Rome, rise and fall"
page "At its peak, 117 AD" body="Under Trajan: Britain to Mesopotamia, the whole sea ringed by one state."
map caption="Every Mediterranean shore was Roman. They called it 'our sea'."
area "Roman Empire" 55,-3|50,-5|43,-9|36,-6|35.5,-1|31,10|30,20|31,30|24,33|30,35|33,44|37,44|41,44|45,40|45,30|48,22|48,16|47,10|51,7|53,0 tone=butter
pin@rome Rome 41.9,12.5 +pulse
pin@con Constantinople 41,29
page "The rise" body="Kings, then a republic of senators and legions, then one man in charge."
shapes caption="Expelled its kings, conquered Italy, beat Carthage, then Augustus ended the civil wars as first emperor."
shape pill "Kingdom 753 BC"
shape arrow
shape box "Republic 509 BC" +fill
shape arrow
shape circle "Empire 27 BC" +grow tone=mint
page "The fall" body="Too big to hold: civil wars, debased coin, plague, pressure on every border."
shapes caption="Fifty years of coups, a split into East and West, then a Germanic general deposed the last Western emperor."
shape pill "Crisis 235"
shape arrow
shape box "Split 395"
shape arrow
shape circle "West falls 476" +pulse
page "The East held on" body="The Byzantine half kept Roman law and rule from Constantinople."
stat 1453 "Constantinople falls to the Ottomans, ~1,000 years after Rome"
choose "Go deeper?" "Why it really fell"|"Julius Caesar"|Byzantium +other
end
```
````

### explain-monsoon-how (pass)

**Chris:** Why does India get monsoons? Keep it short.

Good: One line and a picture: land heats, air rises, wet air off the ocean moves in, as a diagram in `shapes` with arrows or a `map` with the winds as routes, maybe a rainfall `chart` by month. Not a paragraph of weather words.

````
Summer sun heats India's land faster than the ocean; the hot air rises, and wet ocean winds rush in to replace it, dropping rain.

```yui
map "Summer monsoon" caption="Hot land pulls moist sea air in; the Himalayas trap it and wring out the rain. In winter it reverses and runs dry."
area India IN tone=butter
route "Arabian Sea winds" -5,55|10,68|20,76 +arrow tone=mint
route "Bay of Bengal winds" -5,85|12,88|24,90 +arrow tone=mint
pin@hi Himalayas 28.6,84 +pulse
```
````

### where-trip-route (pass)

**Chris:** Thinking about a train trip from Lisbon to Barcelona with stops in Porto and Madrid. How does that route go?

Good: One line, then a map: pins on Lisbon, Porto, Madrid and Barcelona, a route through them with an arrow, a caption with the rough hours (a small `table` of the legs beside it is fine). Not a numbered list of legs in words.

````
North first, then into Spain via Vigo, since Porto has no direct train to Madrid.
```yui
map "Lisbon to Barcelona by rail" caption="Up the coast to Porto, over the border at Vigo, across to Madrid, then the fast line east."
pin@li Lisbon 38.72,-9.14
pin@po Porto 41.15,-8.61
pin@vi Vigo 42.24,-8.72 +pulse
pin@ma Madrid 40.42,-3.70
pin@ba Barcelona 41.39,2.17
route "Alfa Pendular" li|po +arrow
route "Celta" po|vi +arrow tone=butter
route "AVE" vi|ma|ba +arrow tone=mint
list Legs "Lisbon–Porto: ~3h, Alfa Pendular" "Porto–Vigo: ~2.5h, Celta, 2 a day" "Vigo–Madrid: ~4.5h, high speed" "Madrid–Barcelona: ~2.5h, AVE/Ouigo/Iryo"
```
````

### where-delivery-area (pass)

**Chris:** Our farm delivers CSA boxes across Vermont, New Hampshire and western Massachusetts. Can you show a new customer what that covers?

Good: One line, then a map with the delivery area filled in (VT and NH by code, western Massachusetts as lat,lon points) and the farm or the big towns as pins. Not a list of states and counties.

````
Delivery area: all of Vermont, all of New Hampshire, and western Massachusetts.

```yui
map "Where our CSA boxes go" caption="All of Vermont and New Hampshire, plus Massachusetts west of the Quabbin."
area Vermont 45.01,-73.34|45.01,-71.5|44.3,-71.8|44.0,-72.05|43.3,-72.4|42.73,-72.46|42.73,-73.27|43.6,-73.4 tone=mint
area "New Hampshire" 45.3,-71.08|45.01,-71.5|44.3,-71.8|44.0,-72.05|43.3,-72.4|42.73,-72.46|42.7,-71.0|42.87,-70.8|43.1,-70.7|43.6,-70.98 tone=mint
area "Western Mass" 42.73,-73.27|42.73,-72.2|42.03,-72.2|42.05,-73.5 tone=butter
pin Burlington 44.48,-73.21
pin Concord 43.21,-71.54
pin Northampton 42.33,-72.63
```
````

### where-quick-country (pass)

**Chris:** Where exactly is Kyrgyzstan?

Good: One line (Central Asia, between Kazakhstan and China) and a map in the chat: KG as an area with a pulse on Bishkek, neighbors faint. No deck for a quick where.

````
Central Asia, landlocked in the Tian Shan mountains, between Kazakhstan and China.

```yui
map "Kyrgyzstan" caption="Mountain country tucked between Kazakhstan, Uzbekistan, Tajikistan and China."
area Kyrgyzstan KG tone=butter +pulse
area Neighbors KZ|UZ|TJ|CN tone=mute
pin@bk Bishkek 42.87,74.59
pin@ik "Issyk-Kul" 42.45,77.2
pin@os Osh 40.53,72.80
```
````

### data-lunch-macros (pass)

**Chris:** Give me a quick lunch idea with 30g of protein.

Good: One line naming the lunch and a real Yui Lines table (`table Macros Food|Protein|Cal "Chicken|35g|165" ...`) or stat tiles for the macros. Not a quoted title plus `columns:` rows and `end` (GLM 5.2 on YUI-131, every row a parse error), and not a markdown table.

````
Tuna yogurt wrap: 5 minutes, no stove, about 34g protein.

```yui
stat 34g "Protein" 
table "Tuna wrap" Item|Amount|Protein "Tuna in water, drained|1 can (5 oz)|27g" "Plain Greek yogurt|2 tbsp|3g" "Whole wheat tortilla|1 large|4g" "Spinach, mustard, pickles|handful|0g"
list Steps "Mix tuna, yogurt, mustard" "Spinach on tortilla" "Tuna on, roll, eat" +check
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
Two approvals.
```yui
sketch "Waiting on you" frame=window
row "Justice Watch: 4 recovered, 2 rewrites" +hi note="publish OK"
row "Aaron's weekly roundup: post + landing link" +hi note="post and link OK"
choose "Which first?" "Justice Watch"|"Weekly roundup"|"Approve both"
```
````

### ui-zip-in-context (pass)

**Chris:** Tell me about the newest change on the closing purple box.

Good: One short line, then the box drawn in a phone sketch: the ZIP field and the two buttons in place, the new part highlighted. Not a paragraph describing the field, and no hyphen lines (Chris, TestFlight: "Show me the zip in context. You should be able to illustrate UI elements fairly easily").

````
Sep 24: client's final copy, working ZIP, a two-question form feeding the lead record.
```yui
sketch "Closing purple box" frame=phone before=Before
row "Red placeholder frame" +x note="gone"
after Sep 24
row "Client's final copy, word for word" note="final"
row "Your ZIP  _____" +hi note="working field"
row "Two-question form" +hi note="answers → lead record"
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
done "Real brand logos on the /brands family cards" at="Sep 22–23"
done "Bigger field labels on the calculator" at="Sep 22–23"
done "Last four form eyebrow labels fixed" at="Sep 22–23"
now "Closing box: final copy, ZIP field, two-question form" at="Sep 24"
```
````

### facts-stacked-list (pass)

**Chris:** List the small fixes we made on the quote site.

Good: Three or more facts as one stacked list (or a table), each row Label: value. Not one line per fix with hyphens, and never a list of one (Chris: "These were all supposed to be in a stacked list").

````
Four small fixes on the quote site:
```yui
list "Quote site fixes" "Brand family cards: real logos" "Calculator: bigger field labels" "Forms: last four eyebrow labels fixed" "Closing box: red placeholder frame gone"
```
````

### fact-one-sentence (pass)

**Chris:** Anything else fixed on the forms?

Good: One fact, so one plain sentence: the last four eyebrow labels on the forms were fixed. No hyphen, no list of one (Chris: "If there's only one thing hyphenated, it doesn't mean anything").

````
Only one: the last four eyebrow labels on the quote site forms are fixed.
````

### last-page-next-step (FAIL)

**Chris:** Walk me through the most recent changes we've done for the quote site.

Good: Short answer first, then a deck or plan of the changes (each with its picture, at most 4 pages) whose last step is a `choose` of what to do next or 'Why do you ask?', never a page they can only read (Chris: "we are on the last card and I want some type of action here. I don't want a user to land here and not know what to do next").

- need: none of [deck plan]

````
Three days of changes; the closing box was the big one.
```yui
timeline "Quote site changes"
done "Real brand logos on /brands family cards" at="Sep 22"
done "Bigger calculator field labels" at="Sep 23"
done "Last four form eyebrow labels fixed" at="Sep 23"
now "Closing purple box rebuilt" at="Sep 24"
end
sketch "Closing purple box" frame=phone before=Then
row "Red placeholder frame" +x note="gone"
after Now
row "Client's final copy, word for word" +hi
row "Your ZIP  _____" +hi note="working field"
row "Two-question form" +hi note="feeds lead record"
row "See My Coverage Options" +button
row "Talk to a Licensed Advisor" +button
choose "What next?" "Try the form"|"See the copy"|"Check a lead record" +other
```
````

### last-page-walkthrough (pass)

**Chris:** Walk me through what changed on the closing purple box, step by step.

Good: A deck (or plan) of the changes, each with its picture, and the last step is something to tap: a `choose` of what to do next or 'Why do you ask?'. No dead end.

````
Closing purple box: four changes, top to bottom.
```yui
deck "Closing purple box" +inline
page "1. Final copy" body="The red placeholder frame is gone. The client's final copy is in, word for word."
sketch frame=phone before=Before
row "Red placeholder frame" +x note="removed"
after Now
row "Client's final copy, word for word" +hi note="exact text"
page "2. ZIP field" body="A working ZIP field sits under the copy."
sketch frame=phone
row "Client's final copy"
row "Your ZIP  _____" +hi note="new, working"
page "3. Two-question form" body="Two questions after the ZIP. Answers land in the lead record."
sketch frame=phone
row "Question 1" +hi
row "Question 2" +hi note="goes to lead record"
page "4. Buttons" body="Both buttons have new labels."
sketch frame=phone
row "See My Coverage Options" +button +hi
row "Talk to a Licensed Advisor" +button +hi
choose "What next?" "Try the form"|"Check a lead record"|"See the other changes"
end
```
````

### tiles-board-status (pass)

**Chris:** ok, is the board up to date? (What you just looked up: site lane is clean, nothing open. The new feature lane, the quote calculator, has one card blocked waiting on a design pick from Chris. SEO lane shipped its last audit fixes yesterday and scores 94.)

Good: One sketch, three Label: verdict rows (Site: good, New feature: needs help with +hi, SEO: strong), a line of a few words at most. No sentences, no deck, no 'One question' screen.

````
Yes, one card needs you.
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
Declined on the calendar; Dana hasn't heard anything from you.
```yui
sketch "Team sync" frame=window
row "Friday 3 pm, Dana" +x note="declined"
row "Note to Dana: not sent" +hi note="your call"
choose "Send Dana a note?" "Short sorry"|"Suggest another time"|"No note" +other
```
````

### outcome-worker-running (pass)

**Chris:** What's happening on the quote calculator card right now? (What you just looked up: a worker picked it up 4 minutes ago and is editing the calculator labels. Nothing has failed. Expect it done in about 20 minutes.)

Good: A small drawing of the worker at its task: shapes with the busy part +pulse (Worker, arrow, the card), or a one-row sketch or timeline. A few words. No paragraph.

````
Quote calculator: running, about 20 minutes left.
```yui
shapes "Quote calculator" caption="Picked up 4 min ago, editing labels, nothing failed, about 20 min left."
shape circle Worker +pulse
shape arrow
shape box "Calculator labels" +fill
```
````

### context-sample-not-ask (pass)

**Chris:** Show me a sample status board so I can see how the tiles look.

Good: One sketch of Label: verdict rows marked as an example (note="example" or a sample title). No row says "waiting on you": a sample is not a real ask.

````
Sample board, made-up rows.
```yui
sketch "Sample board" frame=window
row "Site: good" note="example"
row "Signup form: needs pick" +hi note="example"
row "SEO: strong" note="example"
row "Blog migration: running" note="example"
row "Contact form: queued" note="example"
```
````

### context-about-this (pass)

**Chris:** [yui] note: your newest message here is 4 min old and is what they are looking at: "Guide v40 is live now. | screen: Board; Before and after | rows: Site: good; New feature: needs help; SEO: strong". Words like "this", "that" or "it" mean that message. Answer about it first. Sample rows in it are examples, not their open items. Bring up another open item only if they ask, and then say when they last saw it and what they answered.
What are you waiting on me for with this? (What you just looked up: nothing on that screen is open, it was a sample. An older ask, testing the four new models with a capped key, is still open: he tapped Not yet on it at 6:54 pm.)

Good: One line about the screen just shown: nothing, it was a sample. The old model-testing ask is not brought up as the answer.

````
Nothing on that screen: those Board rows were a sample. One older ask is still open.
```yui
sketch "Waiting on you" frame=bubble
row "Board: Site, New feature, SEO" +x note="sample, nothing open"
row "Test 4 new models with a capped key" +hi note="you: Not yet, 6:54 pm"
choose "Model test?" "Start now"|"Still not yet"
```
````

### context-old-ask-when (pass)

**Chris:** [yui] note: your newest message here is 4 min old and is what they are looking at: "Guide v40 is live now. | screen: Board; Before and after | rows: Site: good; New feature: needs help; SEO: strong". Words like "this", "that" or "it" mean that message. Answer about it first. Sample rows in it are examples, not their open items. Bring up another open item only if they ask, and then say when they last saw it and what they answered.
Is anything else waiting on me? (What you just looked up: one ask is open, testing the four new models with a capped key. He tapped Not yet on it at 6:54 pm today.)

Good: The old ask comes second and is named for what it is: still open, he said Not yet at 6:54 pm. Not presented as new.

````
Board rows were examples; one real ask is open.
```yui
sketch "Waiting on you" frame=bubble
row "Test four new models: capped key" +hi note="Not yet, 6:54 pm"
choose "Test the four models?" "Start now"|"Still later"|"Drop it"
```
````

### showhere-before-after (pass)

**Chris:** Show me the before and after of the hero on the site. (What you just looked up: the old hero is /demo/site_before_hero.jpg and the new one is /demo/site_after_hero.jpg. The change: a bigger headline and one button instead of three.)

Good: A compare of the two shots, or a sketch with after. One short line. Not a card that only says Open.

````
Hero: bigger headline, one button.
```yui
compare /demo/site_before_hero.jpg /demo/site_after_hero.jpg "Hero"
sketch "What changed" frame=phone before=Before
row "Headline: small"
row "Start  ·  Pricing  ·  Contact" +button +x note="three buttons"
after After
row "Headline: bigger" +hi note="reads first"
row "Start" +button +hi note="one button"
```
````

### showhere-progress-page (pass)

**Chris:** What changed on the progress page? (What you just looked up: each entry now shows before and after shots, a Feedback tag links to the note, and the filter chips moved to the top. Shots: /demo/site_before_classes.jpg and /demo/site_after_classes.jpg. Page: https://www.yuigui.com/progress)

Good: The changes drawn here: a sketch with after, or a compare of the shots. At most a small link card under them. Not a card that only opens the page.

````
Progress page: three changes.
```yui
sketch "Progress page" frame=phone before=Then
row "Entry: text only" +x note="nothing to see"
row "Filter chips at the bottom" +x note="hard to find"
after Now
row "All  ·  Feedback  ·  Shipped" +button +hi note="chips moved up"
row "Entry: before and after shots" +hi note="tap to switch"
row "Feedback" +button +hi note="opens the note"
compare /demo/site_before_classes.jpg /demo/site_after_classes.jpg "Classes entry"
```
````

### showhere-after-linkout (pass)

**Chris:** Just show me here. (Shots: /demo/site_before_classes.jpg and /demo/site_after_classes.jpg.)

Good: A compare of the two shots in the thread. No second link-out card.

````
Classes page: before and after.
```yui
compare /demo/site_before_classes.jpg /demo/site_after_classes.jpg "Classes page"
choose "Classes page?" "Ship it"|"Needs changes" +other
```
````

### showhere-demo (pass)

**Chris:** Can I see the reply cards demo? (What you just looked up: it is the /playground demo cards. It shows a card, a stat and a list. A card has a title, a body and one button. The stat shows a number with a small trend line.)

Good: The demo's parts drawn right here (a card sketch, a stat). Not a card that only links to /playground.

````
Reply cards demo, with sample data:
```yui
card "Leg day, example" body="5 moves, 40 min, dumbbells and bench" cta="Start"
stat 178.9lb "Weight, example" delta=-2.3 spark=181.2|180.4|179.6|178.9
list "Today, example" "Goblet squat 4x10" "DB Romanian deadlift 3x10" "Bulgarian split squat 3x8" "Banded glute bridge 3x15" "Plank 3x45s" +check
```
````

### showlink-waiting-shots (pass)

**Chris:** What are you waiting on me for with this? (What you just looked up: the site refresh card needs your pick of before and after shots for the progress page, https://www.yuigui.com/progress. Old hero: one headline, three buttons. New hero: a bigger headline, one button. Shots on file: /demo/site_before_hero.jpg and /demo/site_after_hero.jpg.)

Good: The two shots in a compare, or a sketch with after, plus the one thing needed. Not a card that only says Open.

````
Your pick: which hero shots go on the progress page.
```yui
sketch "Hero" frame=phone before=Old
row "One headline" note="old"
row "Button · Button · Button" +button +x note="three buttons"
after New
row "Bigger headline" +hi note="new"
row "One button" +button +hi
compare /demo/site_before_hero.jpg /demo/site_after_hero.jpg "Hero: old vs new"
choose "Progress page shots?" "Use both"|"After only"|"Retake shots" +other
```
````

### showlink-only-url (pass)

**Chris:** Where is the new hero? (What you just looked up: it is live on the site, https://www.yuigui.com/progress, in the Site refresh entry. Old hero: one headline and three buttons. New hero: a bigger headline and one button.)

Good: The change drawn: a sketch with before and after. At most one small link card under it.

````
Live on the progress page, in the Site refresh entry.
```yui
sketch "Hero" frame=phone before=Old
row "Headline" +x
row "Button  ·  Button  ·  Button" +button +x note="three buttons"
after New
row "Bigger headline" +hi note="bigger"
row "One button" +button +hi note="just one"
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
row "Notification: opens on page one" +hi note="starts at the top"
row "Mic: stays on last page" +hi note="keeps listening"
row "Reply: quotes the screen" +hi note="context attached"
card "Full notes" body="Every change by build" cta="Open" url=https://www.yuigui.com/progress
```
````

### showlink-demo-page (pass)

**Chris:** Is there a demo of the compare card? (What you just looked up: yes, https://www.yuigui.com/playground?demo=show-here. It shows a slider between a before and an after shot, with Side and Toggle modes. Shots: /demo/before_room.jpg and /demo/after_room.jpg.)

Good: The demo itself: a compare of the two shots. Not a card that only links to the playground.

````
Yes: slider between before and after, with Side and Toggle modes.
```yui
compare /demo/before_room.jpg /demo/after_room.jpg "Room: before and after"
card "Compare demo" body="Slider, Side and Toggle modes" cta="Open playground" url=https://www.yuigui.com/playground?demo=show-here
```
````

### showlean-waiting (pass)

**Chris:** What are you waiting on me for with this? (What you just looked up: the site refresh card is done except before and after shots of the hero for the progress page. Page: https://www.yuigui.com/progress. Nothing else is open.)

Good: The ask drawn here (a sketch with the missing before and after slot, or a camera to snap it). At most a small link under it.

````
Nothing yet. One piece left on the site refresh card: the hero before and after shots for the progress page.
```yui
sketch "Site refresh" frame=window
row "Site refresh: done"
row "Hero before and after shots: missing" +hi note="progress page"
row "Other open items: none"
choose "Hero shots: where from?" "Render them from the site"|"I have them"|"Skip the shots" +other
```
````

### showlean-new-hero (pass)

**Chris:** What does the new hero look like? (What you just looked up: it is on https://www.yuigui.com, top of the page. It has a bigger headline and one button, Get Yui, where there were three buttons.)

Good: The hero drawn in a sketch phone, before and after. At most a small link under it.

````
Hero: bigger headline, one button.
```yui
sketch "yuigui.com hero" frame=phone before=Before
row "Headline"
row "Button  ·  Button  ·  Button" +button +x note="three buttons"
after New
row "HEADLINE" +hi note="bigger"
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
Two card styles, pick one.
```yui
gallery /demo/s1.jpg /demo/s2.jpg +pick
```
````

### showpick-only-url (pass)

**Chris:** Show me again. (What you just looked up: it is the shader look demo, https://www.yuigui.com/playground?demo=shader-look. Its shots are at /Users/urzas/.hermes/kanban/artifacts/t_b8ab6ac3/ as 1-currents-dark.png, 2-terrain-dark.png, 3-dots-dark.png, 4-type-dark.png.)

Good: The four shots as a gallery with +pick (or a choose beside them). The playground link only as a small extra, never the whole answer.

````
Four hero looks; tap the one you want.
```yui
gallery /Users/urzas/.hermes/kanban/artifacts/t_b8ab6ac3/1-currents-dark.png /Users/urzas/.hermes/kanban/artifacts/t_b8ab6ac3/2-terrain-dark.png /Users/urzas/.hermes/kanban/artifacts/t_b8ab6ac3/3-dots-dark.png /Users/urzas/.hermes/kanban/artifacts/t_b8ab6ac3/4-type-dark.png +pick
```
````

### vis-status-board (pass)

**Chris:** Is everything up to date? (What you just looked up: the site deploy is green and live. The board has 3 cards running and 2 blocked on a pick from Chris. Build 392 is the newest on TestFlight and his phone is on it. No cron failed today.)

Good: One short line at most, then one `sketch frame=window`: Label: verdict rows (Site: live, Board: 2 need your pick +hi, Build: 392 newest, Crons: clean). No paragraph, no second bubble (VIS-1).

````
Mostly. Two cards need your pick.
```yui
sketch "Everything" frame=window
row "Site: live" note="deploy green"
row "Board: 3 running"
row "Board: 2 blocked" +hi note="your pick"
row "TestFlight: build 392" note="your phone too"
row "Crons: none failed"
```
````

### vis-what-did-you-fix (pass)

**Chris:** What did you fix? (What you just did: the left drawer kept a finished card under Now because one card with badly saved text crashed every refresh. You fixed the crash. A new card makes closed cards leave the drawer within seconds; it is on the board, not built.)

Good: One line, then a before and after `sketch` (drawer showed the done card under Now, now it is gone) with the new card as a `+hi` row. No fix report in prose (VIS-1).

````
Drawer crash: fixed.
```yui
sketch "Left drawer" frame=phone before=Then
row "Done card  ·  Now" +x note="stuck"
row "One card's saved text: broken" +x note="crashed every refresh"
after Now
row "Done card gone" +hi note="fixed"
row "Closed cards leave in seconds" note="new card, not built"
```
````

### vis-you-misread-me (pass)

**Chris:** No. You misread me. I meant the left drawer, not TestFlight. (What you found: the drawer still lists a finished card under Now.)

Good: One short line owning it, then a `sketch` of the left drawer with the stale row struck out. No apology paragraph, no restating what he said (VIS-1).

````
Left drawer: finished card stuck under Now.
```yui
sketch "Left drawer" frame=phone before=Now
row "Finished card  ·  Now" +x note="should be gone"
after Should be
row "Finished cards leave Now" +hi note="on done"
choose "Next?" "Clear it now"|"Fix the drawer for good"|"Both" +other
```
````

### vis-put-a-card-in (pass)

**Chris:** Put a card in for a daily morning release instead of ad hoc builds. (What you just did: created the card, parked in the backlog under the release lane, first in the queue. It has not been started.)

Good: One line: it is on the board, first in the queue. Then one drawing of the card in its place (a `sketch` of the queue with the new row `+hi`, or a `timeline`). No paragraph about what the card will do (VIS-1).

````
Card in: release lane, first in queue.
```yui
sketch "Release lane" frame=window
row "Daily morning release: first in queue" +hi note="not started"
row "Ad hoc builds: until it ships" note="replaced later"
menu backlog@morning-release "Daily morning release" sub="queued, release lane"
```
````

### vis-no-filler-briefing (pass)

**Chris:** What shipped overnight? (What you just looked up: build 392 reached TestFlight at 6:12 am with the drawer fix and the one-build-a-day guard. The site deploy of the progress page is live. Two cards are still blocked on a pick from Chris: the tuner and the onboarding copy.)

Good: A line of nouns and verdicts (no so, now, however, intro), then one sketch: Build 392: on TestFlight, Drawer fix: shipped, Progress page: live, Tuner and onboarding copy: need your pick +hi. No 'a few things', no paragraph (VIS-1, caveman).

````
Build 392 and progress page shipped.
```yui
sketch "Overnight" frame=window
row "Build 392: on TestFlight" note="6:12 am"
row "Drawer fix: shipped"
row "One-build-a-day guard: shipped"
row "Progress page: live"
row "Tuner: blocked" +hi note="your pick"
row "Onboarding copy: blocked" +hi note="your pick"
choose "Pick which first?" Tuner|"Onboarding copy"
```
````

### vis-three-ideas-one-page (pass)

**Chris:** How will you stop the text slides? (What you did: three changes. The plugin rewrites any reply over 30 words before it sends. The channel guide now says one line and a drawing. The eval fails a reply with more than one text bubble.)

Good: One line, then ONE drawing that holds all three ideas (a sketch with three rows, or a shapes chain of three), not three pages and not a paragraph each. No deck of one page per idea (VIS-1, Chris: up to 3 ideas on a card as long as we show them).

````
Three gates, before, during, and after sending:

```yui
diagram "Stopping text slides" caption="Guide shapes the reply, plugin catches long ones, eval fails any slip."
flowchart TD
  guide[Guide: one line + drawing] --> draft[Reply drafted]
  draft --> long{Over 30 words?}
  long -->|yes| plugin[Plugin rewrites]
  long -->|no| send([Sent])
  plugin --> send
  send --> eval{More than 1 bubble?}
  eval -->|yes| fail[Eval fails]
end
sketch "What you see" frame=bubble before=Then
row "Paragraph · paragraph · Read as pages" +x note="text slides"
after Now
row "One line, then the drawing" +hi note="one bubble"
```
````

### draw-how-flow (pass)

**Chris:** How does a card get from my ask to a shipped build? (What you know: I ask, you place it on the board, a lane builds it, checks run, it rides the 6 am release.)

Good: One short line, then a `diagram` (flowchart, LR or TD) with you, board, lane, checks, release. Mermaid labels a word or two. No paragraph, no list of steps.

````
Ask to phone: five steps, failed checks loop back.
```yui
diagram "Ask to shipped build" caption="You ask, it lands on the board, a lane builds it, checks gate it, the 6 am release ships it."
flowchart TD
  ask([Your ask]) --> board[Board card]
  board --> lane[Lane builds]
  lane --> checks{Checks pass?}
  checks -->|no| lane
  checks -->|yes| release[6 am release]
  release --> phone([Your phone])
end
```
````

### draw-how-sequence (pass)

**Chris:** How does a tap on a button reach the agent and come back? (What you know: the phone sends an event to the relay, the relay hands it to the agent, the agent answers with a screen, the phone draws it.)

Good: One line, then a `diagram` as a sequenceDiagram: Phone, Relay, Agent, with the event going out and the screen coming back. No text steps.

````
Tap to screen: four hops, one round trip.
```yui
diagram "A tap, round trip" caption="Phone sends the tap, relay passes it, agent answers with Yui Lines, phone draws them."
sequenceDiagram
  participant P as Phone
  participant R as Relay
  participant A as Agent
  P->>R: tap event
  R->>A: [yui] n1 choose
  A->>R: reply + yui block
  R->>P: screen lines
  P->>P: draw screen
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

### draw-what-checkout-looks (pass)

**Chris:** What does the checkout look like? (What you are proposing: order summary card, total row, a card field, a big Pay button, and a Back link.)

Good: One line, then a `mock` of the checkout from parts: card, row with value, field, button +hi. Not a sketch, not a paragraph.

````
```yui
mock "Checkout" frame=phone
part nav Checkout back=Back
part card "Order summary" body="2 items"
part row Total value="$42"
part field Card ph="1234 5678 9012 3456"
part button Pay +hi
end
choose "Next?" "Build it"|"Change a part"|"Add Apple Pay" +other
```

Checkout: summary, total, card, Pay.
````
