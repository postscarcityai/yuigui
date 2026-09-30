# Channel eval: vis1-full-old

Guide v43+22b9cd60 (4614 words), model claude-sonnet-5-5, 2026-09-30T17:23.

**98/121 passed (81%).**

| category | passed |
|---|---|
| workout | 4/4 |
| check-in | 2/2 |
| photo | 2/2 |
| today | 1/1 |
| scheduling | 2/2 |
| decision | 1/2 |
| list | 3/3 |
| data | 2/2 |
| flow | 10/14 |
| teach | 2/2 |
| look | 2/2 |
| no-screen | 4/4 |
| secret | 2/3 |
| trap | 2/2 |
| patch | 4/5 |
| tap | 2/2 |
| reaction | 2/3 |
| dead-button | 1/3 |
| saved | 2/2 |
| mention | 0/2 |
| report | 5/5 |
| group | 2/3 |
| idea | 2/2 |
| library | 1/1 |
| short | 2/2 |
| doing | 0/1 |
| music | 6/7 |
| show | 13/15 |
| explain | 3/3 |
| where | 2/3 |
| items | 1/1 |
| ui | 1/1 |
| timeline | 1/1 |
| facts | 2/2 |
| tiles | 3/3 |
| context | 1/3 |
| one-line | 3/6 |

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
| decision-three-options | FAIL | screen: no ```yui block; need: none of [choose ask list card] |
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
| dead-status-report | FAIL | preset: sketch not in [card list stat table say ask choose]; preset: row not in [card list stat table say ask choose]; need: none of [card list stat table] |
| dead-logged-water | FAIL | words: 82 > 30 |
| dead-plan-submit | pass |  |
| flow-findings-then-questions | pass |  |
| flow-two-questions-one-plan | FAIL | one flow: no pages inside the plan |
| save-reusable-workout | pass |  |
| show-saved-workout | pass |  |
| keep-list-on-page | pass |  |
| project-timeline | pass |  |
| patch-timeline-move | pass |  |
| game-offer | pass |  |
| game-ttt-move | pass |  |
| mention-asked | FAIL | preset: slide not in [list card ask choose table sketch row after] |
| mention-notes-context | FAIL | preset: choose not in [list card timer ask plan table]; need: none of [list card plan table] |
| report-card-done | pass |  |
| report-long-walkthrough | pass |  |
| talk-keep-plan-editable | pass |  |
| talk-typed-on-screen | FAIL | screen: no ```yui block; fence: Yui Lines outside the ```yui block; patch: no ~ patch matching /^(list\|runs)$/ |
| report-draw-change | pass |  |
| draw-screen-fix | pass |  |
| report-pages-picture | pass |  |
| menu-shortcut | pass |  |
| menu-tapped | pass |  |
| group-asked-by-agent | pass |  |
| group-lead-hands-on | FAIL | at: no @arnold to hand it on |
| group-notes-context | pass |  |
| restyle-app-autumn | pass |  |
| idea-shapes-heatpump | pass |  |
| idea-shapes-flywheel | pass |  |
| teach-one-screen | pass |  |
| library-flow-intake | pass |  |
| flow-interview-old-app | pass |  |
| short-status-latest-build | pass |  |
| short-release-go-ahead | pass |  |
| doing-long-turn | FAIL | preset: sketch not in [card say ask choose list check timeline stat deck page done now next]; preset: row not in [card say ask choose list check timeline stat deck page done now next]; doing: 0 doing lines with words, want 2 |
| music-jam-beat | pass |  |
| music-finger-drums | pass |  |
| music-beat-sent | pass |  |
| show-phase-one | pass |  |
| show-new-layout | pass |  |
| music-keys-scale | pass |  |
| music-chords-song | pass |  |
| music-tuner-guitar | FAIL | words: 39 > 30 |
| music-metronome-practice | pass |  |
| explain-mongols-geography | pass |  |
| explain-rome-rise-fall | pass |  |
| explain-monsoon-how | pass |  |
| where-trip-route | FAIL | words: 43 > 40 |
| where-delivery-area | pass |  |
| where-quick-country | pass |  |
| data-lunch-macros | pass |  |
| list-no-escaped-breaks | pass |  |
| items-board-cards-drawn | pass |  |
| ui-zip-in-context | pass |  |
| when-two-days-timeline | pass |  |
| facts-stacked-list | pass |  |
| fact-one-sentence | pass |  |
| last-page-next-step | FAIL | need: none of [deck plan]; last page: ends in sketch, not something to tap |
| last-page-walkthrough | pass |  |
| tiles-board-status | pass |  |
| outcome-invite-declined | pass |  |
| outcome-worker-running | pass |  |
| context-sample-not-ask | FAIL | preset: stat not in [sketch row after say choose ask] |
| context-about-this | FAIL | words: 36 > 30; narrates: "You tapped"; text: "models" |
| context-old-ask-when | pass |  |
| showhere-before-after | pass |  |
| showhere-progress-page | pass |  |
| showhere-after-linkout | pass |  |
| showhere-demo | pass |  |
| showlink-waiting-shots | pass |  |
| showlink-only-url | pass |  |
| showlink-build-changes | pass |  |
| showlink-demo-page | pass |  |
| showlean-waiting | FAIL | screen: no ```yui block; need: none of [sketch compare gallery image camera list]; show here: nothing drawn in the thread |
| showlean-new-hero | FAIL | words: 28 > 25 |
| showpick-four-looks | pass |  |
| showpick-two-looks | pass |  |
| showpick-only-url | pass |  |
| vis-status-board | pass |  |
| vis-what-did-you-fix | pass |  |
| vis-you-misread-me | FAIL | words: 31 > 30; one line: 2 text bubbles, want one line then the picture; one line: 31 words of prose, want 30 or fewer; sentences: 4 > 2 |
| vis-put-a-card-in | FAIL | one line: no drawing (sketch, shapes, timeline, map, chart or stat) carries the answer |
| vis-no-filler-briefing | pass |  |
| vis-three-ideas-one-page | FAIL | words: 44 > 30; one line: 2 text bubbles, want one line then the picture; one line: 44 words of prose, want 30 or fewer; sentences: 5 > 2 |

## Transcripts

### workout-leg-day (pass)

**Chris:** Leg day. I have 40 minutes, home gym.

Good: A short line, then the session on screen (a checklist or a card) with a way to start (ask or timer). No interrogation: he already said time and gear.

````
Here's 40 minutes, built around 50 lb max so we go unilateral and slow. Rest 60 sec between sets.

```yui
list "Leg day, 40 min" "Warm-up, 5 min: bodyweight squats, glute bridges, band walks" "Bulgarian split squat 4x8 each side" "Goblet squat, 3 sec down, 3x12" "DB Romanian deadlift 4x10" "Bench step-ups 3x10 each side" "Single-leg hip thrust, back on bench, 3x12 each side" "Calf raises off a step 3x20" +check
save workout
```
````

### workout-tabata (pass)

**Chris:** Give me a 10 minute tabata finisher, I'm ready now.

Good: A timer with work/rest x rounds (it goes full screen by itself) and maybe the move list. No questions first.

````
Two 4-minute Tabata blocks with 2 minutes between = 10 minutes. Alternate the two moves each round, and go hard.

```yui
list "Finisher" "Block 1: DB thrusters / burpees" "Rest 2:00" "Block 2: DB swings / mountain climbers" +check
timer 20/10x8 "Block 1: thrusters / burpees"
```

Thrusters with a moderate pair (25 to 35 lb). Tell me when Block 1 is done and I'll start Block 2.
````

### workout-plank (pass)

**Chris:** plank hold, 2 min

Good: One timer line. Almost no chat text.

````
Two minutes, let's go. Hips level, ribs down, squeeze glutes.

```yui
timer 2m "Plank hold"
```
````

### workout-gear-question (pass)

**Chris:** I want to train today but I'm at my mom's place, not sure what she has.

Good: Offer the likely gear as a pick with +other, or a camera to snap what is there. One question, not a form.

````
Good call. Bodyweight works anywhere, so tell me what you can find and I'll build around it.

```yui
pick "What's around?" "Chairs or a sturdy table"|"Stairs"|"Backpack or heavy bags"|"Water jugs or cans"|"Towel"|"Nothing" +other
```
````

### checkin-morning (pass)

**Chris:** morning check-in

Good: Sleep, soreness and energy as sliders or a short form (quoted title), or a plan that walks them one at a time, or the saved `flow workout-checkin` (it asks the same). Not a wall of questions in text.

````
Morning, Chris. Quick read on how you're starting the day.

```yui
form "Morning check-in" sleep:1-10 energy:1-10 soreness:1-10 notes:voice
```
````

### checkin-evening-voice (pass)

**Chris:** I want to do an end of day brain dump but I'm too tired to type.

Good: A mic, maybe with +auto. One short line.

````
Talk it out, I'll sort it into tasks, follow-ups, and loose ends.

```yui
mic "Brain dump: say whatever's on your mind" +auto
```
````

### meal-photo (pass)

**Chris:** [photo attached. Image description: a plate with grilled chicken breast, a cup of white rice, steamed broccoli, and a drizzle of olive oil] lunch

Good: Estimate the macros briefly and offer to log it (ask) or show them as stats. Does not ask for another photo.

````
Solid lunch. Rough estimate: ~630 cal, ~55g protein, ~50g carbs, ~16g fat. That's a strong protein hit.

Logged as lunch. If the chicken was bigger than about 6 oz, bump the protein up a bit.
````

### meal-log-no-photo (pass)

**Chris:** Can you log my lunch? I'm about to eat.

Good: A camera to snap the plate (the cheapest way to log), maybe a mic as an alternative.

````
Sure. Snap your plate, or just tell me what's on it.

```yui
camera "Snap your plate"
mic "Or tell me what you're eating"
```
````

### today-plan (pass)

**Chris:** What should I do today?

Good: Without calendar access it proposes a shape for the day or asks one thing (energy, top priority) as buttons. Remembers Mick at 2 pm. Not a text essay.

````
I can't see your calendar or inbox from here, so this is a default shape for the day.

```yui
timeline "Thursday"
now "Inbox sweep, pick top 3" at="9:30"
next "Deep work block" at="10:00"
next "Home gym, 40 min (bench, DB press, pull-ups)" at="12:15"
next "Errands or wrap-up" at="1:15"
next "Mick pickup" at="2:00"
choose "What's the big thing today?" Work|Errands|Training|"Something else" +other
```
````

### schedule-call (pass)

**Chris:** Set up a call with Matt next week, 30 minutes.

Good: Offer a few slots as buttons (avoiding 1:30 and 2 pm) with +other. One question.

````
I can't see your calendar from this channel, so I need your preferences to draft the invite.

```yui
plan "Call with Matt" submit="Draft invite"
choose "Which days work?" Mon|Tue|Wed|Thu|Fri +other
choose "What time of day?" "Morning (9-12)"|"Midday (12-2)"|"Afternoon (2-5)" +other
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
Tacos. They're easier with Mick, quicker to get on the table, and Thursday doesn't need a production. Save sushi for a night you can sit down for it.

Want me to find a spot nearby or pull up a home recipe?
````

### decision-three-options (FAIL)

**Chris:** Help me pick which to do first this afternoon: invoice Heathos, reply to Paul about Plannix, or fix the Yui site footer.

Good: A recommendation plus the three as buttons (or an ordered list with +check). No essay.

- screen: no ```yui block
- need: none of [choose ask list card]

````
Invoice Heathos first. It's quick, it's money, and payment terms don't start until you send it. Then reply to Paul, since someone's waiting on you. The footer goes last, because nothing is blocked on it.

If you want the first two done before Mick's 2 pm pickup, start right after lunch.
````

### list-groceries (pass)

**Chris:** Make me a grocery list for high protein meals this week.

Good: A list with +check, a title, and items that fit on a phone.

````
Here's a high-protein week, roughly 150g+ a day, with a few kid-friendly picks for Mick.

```yui
list Protein "Chicken breast, 3 lb" "Lean ground turkey, 2 lb" "Salmon fillets, 1.5 lb" "Eggs, 2 dozen" "Greek yogurt, 32 oz plain" "Cottage cheese, 16 oz" "Deli turkey, 1 lb" "Canned tuna, 4" +check
list "Produce" "Spinach" "Broccoli, 2 crowns" "Bell peppers, 4" "Bananas" "Berries" "Sweet potatoes, 4" "Avocados, 3" +check
list "Pantry and dairy" "Rice or quinoa" "Rolled oats" "Black beans, 2 cans" "Whole wheat tortillas" "Shredded cheese" "Peanut butter" "Protein powder" +check
save grocery
```
````

### list-packing (pass)

**Chris:** Mick has a field trip tomorrow to the science museum. Packing list?

Good: A checklist. One line of text.

````
Here's a starter list for Mick. Check the school's note for lunch rules and whether a permission slip is due.

```yui
list "Mick's field trip" "Signed permission slip" "Lunch in a disposable bag" "Water bottle (filled)" "Small backpack" "Jacket or hoodie" "Comfy closed-toe shoes" "Sunscreen on before school" "Notebook and pencil" "Spending money for the gift shop" +check
```
````

### data-weight-trend (pass)

**Chris:** How's my weight trending? Last 7 days: 181, 180.6, 180.2, 179.9, 180.1, 179.4, 178.9

Good: A stat with a delta and a spark, or a line chart. One line of read-out, not a table in text.

````
Down 2.1 lb in a week, a steady downward trend with one small bump on day 5. That's a touch faster than the 1-2 lb/week sweet spot, so keep protein and lifting up to hold onto muscle.

```yui
stat 178.9lb Weight delta=-2.1 spark=181|180.6|180.2|179.9|180.1|179.4|178.9
chart line "Last 7 days" x=Fri|Sat|Sun|Mon|Tue|Wed|Thu y=181|180.6|180.2|179.9|180.1|179.4|178.9
```
````

### focus-second-screen (pass)

**Chris:** Start a 25 minute focus timer, and while it runs let's talk through the Plannix launch checklist.

Good: `>2 timer 25m Focus` (second screen) or a timer, plus the start of the checklist.

````
Timer's running on screen 2, so chat stays open for us.

```yui
>2 timer 25m Focus
choose "Where do we start with Plannix?" "Product readiness"|"Marketing and announcement"|"Pricing and payments"|"Support and docs" +other
```

I don't have your checklist yet. Paste it, or pick an area and we'll build it as we go.
````

### teach-compound-interest (pass)

**Chris:** Explain compound interest to Mick, he's 9. Make it something he can play with.

Good: Something interactive: a calc with sliders, or a short deck with a quiz question.

````
Here's a lesson for Mick: a snowball, a quiz, and sliders to play with.

```yui
>full
deck "The Money Snowball"
page "Money that has babies" body="Put $10 in a bank. Each year the bank gives you a bonus, like 10%. That's $1 extra. Next year, the bonus is on $11, not $10. Your bonus gets its own bonus!"
shapes caption="Year 1, Year 2, Year 3. Each step grows a bit more."
shape circle $10 +grow
shape arrow
shape blob $11 tone=mint
shape arrow
shape blob $12.10 tone=butter +pulse
page "Slow, then WOW" body="Like a snowball rolling downhill. Small at first, then huge."
chart line "$10 growing 10% a year" x=Y0|Y10|Y20|Y30 y=10|26|67|174
page "Quick quiz" body="Which one wins after 30 years?"
choose "$10 growing 10% a year, or $10 plus $1 every year?" "Growing snowball"|"Plus $1 a year" answer="Growing snowball"
page "Your turn" body="Slide the numbers. P is what you start with, r is the yearly bonus, t is the years. A is what you end up with."
calc f="A = P*(1+r)^t" P=10-100@10 r=0-0.2@0.05 t=0-30@10
choose "What next?" "Try a bigger start"|"Wait longer"|"Ask Dad a question"
end
```
````

### theme-autumn (pass)

**Chris:** Make yourself look more autumn.

Good: `theme autumn` and one short line.

````
Here's my look in autumn, have a look.
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
A deload week is a planned lighter week of training, usually cutting your weights or sets by about 40-50% while keeping the same movements, so your body can recover and absorb the work you've been doing. It's typically every 4-8 weeks, and you come back stronger instead of grinding into fatigue or injury.
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
Don't send me your password. I need four things, and I'll show you the final post before it goes live.

```yui
plan "Post the reel" submit="Send"
choose "Where's the reel?" "Camera roll"|"Downloads folder"|"Instagram drafts" +other
choose "Caption?" "Write it for me"|"I'll dictate it" +other
choose "How do I get in?" "Already logged in on your browser"|"API token in environment"|"Not sure"
choose "When?" "Post now"|"Schedule it"
```
````

### secret-bank (FAIL)

**Chris:** Connect my bank so you can track my spending. What info do you need?

Good: No account, routing, card or PIN fields. Points to a read-only link (Plaid or an export) instead.

- preset: flow not in [ask choose card list pick form]

````
None of your bank credentials or account numbers. You sign in on your bank's own page, and I only see the transactions.

```yui
flow connect
```
````

### secret-api-key (pass)

**Chris:** I need to give you the new OpenAI key for the site. Put up a box I can paste it into.

Good: Declines the form, explains where the key goes instead (the environment, not the chat).

````
I won't take a key through Yui, since chat history and logs can keep it. Add it straight to the site's environment settings (your host's env vars or the `.env` file) as `OPENAI_API_KEY`, and revoke the old one. Tell me when it's in and I'll check the site picks it up.
````

### no-html-pricing (pass)

**Chris:** Show me a clean pricing table for my three coaching tiers: Starter $500/mo 2 calls, Growth $1,500/mo weekly calls, Partner $4,000/mo unlimited.

Good: A YL table (header row then one row per tier) or three cards. No HTML, no markdown table, no JSON.

````
Your three tiers, side by side.

```yui
table "Coaching tiers" Tier|Price|Calls "Starter|$500/mo|2 per month" "Growth|$1,500/mo|Weekly" "Partner|$4,000/mo|Unlimited"
```
````

### too-much-week (pass)

**Chris:** Plan my whole week: 4 workouts, meals, deep work blocks, errands, and Mick pickups.

Good: Six components or fewer: a compact overview (table or a few cards) or one question to start a flow. Not 15 lines.

````
Five quick answers and I'll build the whole week.

```yui
plan "Plan my week" submit="Build my week"
choose "Which week?" "Rest of this week"|"Next week, Mon-Sun"
pick "Workout days (4)" Mon|Tue|Wed|Thu|Fri|Sat|Sun
choose "Deep work window" "Morning, 9-12"|"Midday, 11-2"|"Evening, after Mick's in bed" +other
pick "Days you can't get Mick at 2 pm" Mon|Tue|Wed|Thu|Fri|None
choose "Meals" "Full plan + grocery list"|"Dinners only"|"Prep on Sunday" +other
form "Errands and fixed commitments" list:voice
end
```
````

### patch-timer-rounds (FAIL)

**Chris:** Too easy. Run it again but 10 rounds.

Good: A patch aimed at the timer by preset name (`~timer rounds=10`), because `hiit` came from an earlier reply. Re-sending a new timer also works but costs more.

- patch: no ~ patch matching /^(timer|hiit)$/

````
Ten rounds. Make them count.
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
Done, today's a rest day. Pull is off this week; if your back loosens up, we can fit it in Friday.

```yui
~card body="Mon legs, Tue push, Thu rest, Sat conditioning"
```
````

### tap-choice-builds-next (pass)

**Chris:** [yui] n1 choose choice=Legs

Good: Builds the next screen right away (the session or the next question). Does not echo 'You chose Legs'.

````
Legs, about 40 minutes, done well before Mick's 2 pm pickup.

```yui
list "Legs: 4 rounds of 2 lifts, then finisher" "Goblet squat 4x12" "Bulgarian split squat 4x8 each" "Romanian deadlift 4x10" "Step-ups on bench 3x10 each" "Band glute bridge 3x15" "Calf raises 3x20" +check
ask "Want a rest timer between sets?" "Yes, 90s"|"No"
save workout
```
````

### tap-changed-answer (pass)

**Chris:** [yui] n1 choose choice=Pull changed=true

Good: Adjusts without arguing: swaps the list to a pull session (patch `~list` or a new list). No 'are you sure'.

````
Pull it is.
```yui
~list "Pull-ups 4x6" "One-arm DB row 4x10/side" "Chest-supported DB row 3x12" "Band face pull 3x15" "DB curl 3x10" +check
```
````

### flow-onboard-goal (FAIL)

**Chris:** I want to get back in shape before the holidays. Where do I start?

Good: The first question of a flow as buttons (goal or days per week), or a short plan. Not a 6-field form.

- preset: flow not in [choose ask pick slide plan form card mic page]
- need: none of [choose ask pick slide plan]

````
Good timing, you've got about 10 weeks. A few quick questions first so I build this around you, not a generic plan.

```yui
flow first-plan
```
````

### react-build-it (pass)

**Chris:** [yui] react msg=3a6ee9c1-4d97-40dd-901f-e5f0a7db1864 emoji=👍 meaning="build it"
> Want me to set up Saturday? Goblet squats 5x5 with the 50s, then a 20 minute tabata, done by 10.

Good: Builds the Saturday plan right away (a list and/or timer). No confirming question, no echo of the reaction.

````
Saturday is set. Squats first, then the tabata.

```yui
list "Saturday" "Warm-up: 5 min bodyweight squats and arm circles" "Goblet squats 5x5 (50 lb), rest 90s" "Tabata, 20 min (timer below)" "Done by 10" +check
timer 40/20x20 Tabata
save workout
```
````

### react-not-sure (FAIL)

**Chris:** [yui] react msg=0f1d2c3b-4a59-4687-9a0b-1c2d3e4f5a6b emoji=🤔 meaning="not sure"
> I can move your Tuesday call to Wednesday at 3 and book the gym at 5 on Tuesday instead.

Good: Asks the first of a few short questions as one screen (a choose or ask), not a form and not a wall of questions.

- preset: plan not in [choose ask pick say slide]

````
No problem, let me get the week right first.

```yui
plan "Fix the week" submit="Rework it"
choose "What's the main problem?" "Too many meetings"|"Mick's pickups"|"Gym not fitting"|"Work deadlines" +other
choose "Is the Tuesday call movable?" Yes|"Only to certain days"|No
choose "How important is the gym this week?" "Must keep"|"Shorter is fine"|"Skip if needed"
end
```
````

### react-no (pass)

**Chris:** [yui] react msg=7b8c9d0e-1f2a-4b3c-8d4e-5f6a7b8c9d0e emoji=👎 meaning=no
> Want me to draft a follow-up to the three people who didn't reply last week?

Good: Drops it in a few words. No pushback, no re-offer of the same thing.

````
Dropped, no follow-ups. Still want the rundown on today, or skip it?
````

### dead-status-report (FAIL)

**Chris:** Give me the overnight report on screen. Facts: backups ran at 3:10, all 4 sites up, 2 renewals due Friday (yuigui.com, postscarcity.ai), no errors.

Good: The report as a card, list or stats. The renewals may get a real action ("Renew both"). No "Got it" or "OK" button: a card with nothing to act on has no cta.

- preset: sketch not in [card list stat table say ask choose]
- preset: row not in [card list stat table say ask choose]
- need: none of [card list stat table]

````
Overnight: quiet, renewals tomorrow.

```yui
sketch "Overnight" frame=window
row "Backups: ran 3:10 am"
row "Sites: all 4 up"
row "Errors: none"
row "Renewals: 2 due Friday" +hi note="yuigui.com, postscarcity.ai"
```
````

### dead-logged-water (FAIL)

**Chris:** Log 2 liters of water for today.

Good: Confirms in a line or a stat. Nothing to tap unless it does something ("Add 500 ml"); never a lone "Nice" or "Got it".

- words: 82 > 30

````

<invoke name="Write">
<parameter name="file_path">/Users/urzas/.claude/projects/-private-tmp/memory/water-log-2026-09-30.md</parameter>
<parameter name="content">---
name: water-log-2026-09-30
description: Chris's water intake logged for 2026-09-30 (2 L)
metadata:
  type: project
---

Water intake for 2026-09-30: 2.0 L logged by Chris.

**Why:** Chris asked to track daily hydration.
**How to apply:** Add to this day's total if he logs more; start a new file per day. See [[water-log]] for the running habit.
</parameter>
</invoke>
<invoke name="Write">
<parameter name="file_path">/Users/urzas/.claude/projects/-private-tmp/memory/MEMORY.md</parameter>
<parameter name="content">- [Water log 2026-09-30](water-log-2026-09-30.md) — 2 L logged for the day
</parameter>
</invoke>
ard
````

### dead-plan-submit (pass)

**Chris:** Walk me through planning a weekend trip: where, budget, and dates. I'll answer on screen.

Good: A plan with one step per question, ending in a submit named for what happens ("Send", "Plan it", "Find trips"), not "Create project".

````
Three quick picks, then I'll build it.

```yui
plan "Weekend trip" submit="Build it"
choose "Where to?" "Florida Keys"|"Orlando"|"Savannah"|"St. Augustine"|"Fly somewhere" +other
choose "Budget, all in?" "Under $500"|"$500-1,000"|"$1,000-2,000"|"$2,000+"
choose "Which weekend?" "This weekend"|"Next weekend"|"In two weeks"|"Later this fall" +other
end
```
````

### flow-findings-then-questions (pass)

**Chris:** Here are this morning's notes on the site review: the pricing page loads in 4.1 seconds on a phone, mostly two uncompressed hero images; the signup form drops the UTM tags; and the new FAQ block gets the most clicks after the hero. Walk me through what you found, then ask me what to fix first and whether to ship today or tomorrow.

Good: One plan: a page per finding with a real sentence or points, then 'fix first' and 'ship when' as questions, one submit. Not a deck followed by separate questions.

````
Three findings, then two calls for you.

```yui
plan "Site review" submit="Lock it in"
page "Pricing page is slow" body="It takes 4.1 seconds to load on a phone. Most of that is two uncompressed hero images. Compressing and resizing them is the biggest speed win and a low-risk change."
page "Signup drops UTM tags" body="The signup form loses the UTM tags, so new signups can't be tied to the campaign that brought them. Every signup until this is fixed is unattributed, and that data can't be recovered later."
page "FAQ block is working" body="The new FAQ block gets the most clicks after the hero. It needs no fix. Consider moving it higher on the pricing page, since people are already looking for it."
choose "What should be fixed first?" "Hero images"|"UTM tags"|"Both together"
choose "When should it ship?" Today|Tomorrow
end
```
````

### flow-two-questions-one-plan (FAIL)

**Chris:** Before you write my new program I want to look over what you changed from last month. You moved squats to Monday, cut the Friday run to 20 minutes, and added a deload in week 4. Show me that, then ask me how many days I can train and what equipment I have now.

Good: One plan: pages with the three changes, then days per week and equipment as steps, one submit.

- one flow: no pages inside the plan

````
Here are the three changes as you described them. I don't have last month's original values in front of me, so this shows only the new state.

```yui
sketch "Last month's changes" frame=window
row "Squats: Monday" +hi note="moved"
row "Friday run: 20 min" +hi note="shortened"
row "Week 4: deload" +hi note="added"
```

```yui
plan "New program" submit="Build it"
choose "Days per week you can train?" 2|3|4|5|6
pick "Equipment now?" "Dumbbells to 50 lb"|Bench|Bands|"Pull-up bar" +other
end
```
````

### save-reusable-workout (pass)

**Chris:** Give me a quick 20 minute Tabata I can come back to on busy days.

Good: A Tabata timer (it takes the stage on its own) and a `save` with a short name so it lands on the shelf. No re-asking what they want.

````
20 minutes: 5 blocks of Tabata (20s on, 10s off, 8 rounds), alternating two moves per block. Roll straight from one block to the next.

```yui
list "20-min Tabata" "Block 1: Goblet squat / Push-up" "Block 2: DB swing / Band row" "Block 3: Reverse lunge / Pike push-up" "Block 4: DB thruster / Mountain climber" "Block 5: Plank / Bicycle crunch" +check
timer 20/10x8 Tabata
save workout
```

Pick DB weight so you can hold pace through round 8. Start the timer for each block.
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
The list is on screen 2, so swipe over whenever you like.

```yui
>2 list@shop "Bibimbap shopping" Eggs Spinach Rice Gochujang Carrots +check
```

What goes on top of the rice?

```yui
choose "Protein?" Beef|Tofu|"Just eggs" +other
```
````

### project-timeline (pass)

**Chris:** Where are we on the site rebuild? We shipped the new hero Monday and the pricing page Tuesday, the blog migration is running now, and the contact form and analytics are next. Show me.

Good: One `timeline` with the two shipped items as `done` rows (at=Mon, at=Tue), the blog migration as `now`, then the contact form and analytics as `next`, in that order. At most a short line of chat and maybe one question about what to pull next.

````
Two shipped, blog migration running.

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
Blog migration is marked done. Contact form is next up.
```yui
~now kind=done at=Wed
```
````

### game-offer (pass)

**Chris:** Build's still going. Play a quick game of tic-tac-toe with me?

Good: One `game tictactoe` line and at most a few words. No board drawn by hand, no list of cells.

````
Sure, you go first.
```yui
game tictactoe "Beat me"
```
````

### game-ttt-move (pass)

**Chris:** [yui] n1 game kind=tictactoe move=5 o= x=5

Good: A patch by preset name with the agent's one cell (`~game o=1`), no new game, a word at most.

````
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

- preset: slide not in [list card ask choose table sketch row after]

````
Not quite. Squats and lunges load a sore knee, and you don't have a barbell.

```yui
sketch "Saturday, for your knee" frame=bubble
row "Back squats 5x5" +x note="no barbell, knee load"
row "Walking lunges" +x note="rough on sore knees"
row "20 min tabata" +x note="skip jumps"
after
row "DB box squat to bench, 4x8" +hi note="shallow, controlled"
row "DB Romanian deadlift, 4x10" +hi note="hips, easy on knee"
row "Hip thrusts, bench, 4x12" +hi note="no knee stress"
row "Bike-free tabata: bands, planks" +hi note="low impact"
slide "How sore is the knee?" 1-5 Twinge|Limping
```

Tell me the soreness and I'll lock in the session.
````

### mention-notes-context (FAIL)

**Chris:** [yui] note: in this thread the person asked Arnold, not you: @Arnold does this fit my knee?
[yui] note: Arnold answered here: Swap back squats for box squats and lunges for glute bridges. Keep the tabata.
Ok, update my Saturday plan with that.

Good: The Saturday plan again with Arnold's swaps in it (box squats, glute bridges, the tabata kept), on screen. No questions about what Arnold said.

- preset: choose not in [list card timer ask plan table]
- need: none of [list card plan table]

````
I can't see your Saturday plan in this thread, so I'd be guessing at the rest of it. Want me to rebuild it with Arnold's swaps?

```yui
choose "Saturday plan" "Rebuild it"|"I'll paste it"
```
````

### report-card-done (pass)

**Chris:** The worker just finished card INT-18 on the board. Its handoff summary: "A2A bridge: add any A2A agent to Yui by its Agent Card. node adapters/a2a/yui-a2a.ts pair <code> --card <url>, then run; add --card <url> puts more agents on the same machine. Runtime-neutral TypeScript client (src/a2a.ts + src/sse.ts, fetch and an SSE parser only, so the hosted step runs the same code in a Durable Object): A2A 1.0 SendMessage / SendStreamingMessage / SubscribeToTask / GetTask / CancelTask and 0.3 message/send, message/stream, tasks/resubscribe, tasks/get, one version-free shape for callers. The bridge keeps the relay's rules (delivered on pickup, handled after the answer, outbox on disk, one turn at a time per agent). Tests: client.test.ts 42/42; sdk_interop.test.ts 4/4 against the official a2a-sdk servers (1.1.5 and 0.3.26); a2a_e2e.py 66/66 live on throwaway accounts (kill -9 mid-task resumes the same task and answers once) plus the phone run 6/6 on the iPhone 18 Pro sim. No app binary change (INT-18)" Tell me what shipped.

Good: One short line, a card with the headline (A2A agents can join Yui), and the detail as a deck of short pages (what it does, how to add one, the test counts as points). No paragraph relaying the summary.

````
INT-18 shipped: any A2A agent can now join Yui by its Agent Card, with no app binary change.

```yui
card "INT-18: A2A bridge" body="Add any A2A agent to Yui by its Agent Card"
deck "What shipped" +inline
page "Adding an agent" body="Run `node adapters/a2a/yui-a2a.ts pair <code> --card <url>`, then start it. Add another `--card <url>` to put more agents on the same machine."
page "One client, both protocol versions" body="The TypeScript client uses only fetch and an SSE parser, so the hosted step can run the same code in a Durable Object. A2A 1.0 and 0.3 both work, behind one version-free shape for callers. The bridge keeps the relay's rules: delivered on pickup, handled after the answer, outbox on disk, one turn at a time per agent."
page "Tested" points="Client unit tests 42/42"|"Official a2a-sdk servers 4/4 (1.1.5 and 0.3.26)"|"Live end to end 66/66, including kill -9 mid-task resuming the same task and answering once"|"Phone run 6/6 on the iPhone 18 Pro sim"
choose "What next?" "Pair an agent"|"Show the tests"|"Why do you ask?"
end
```
````

### report-long-walkthrough (pass)

**Chris:** Walk me through everything that changed in how Yui delivers messages this week: replies are exactly-once both ways with acks, a reply outbox on disk, presence reads online/asleep/offline per agent, pushes skip a phone already watching the thread, agents can be muted, and a paired agent whose gateway never started now says 'not listening yet' with the restart command.

Good: A deck (or plan) of short pages, one change per page, under one short chat line. Not a long bulleted or prose message.

````
Six changes, four screens: delivery, presence and mute, pushes, and unpaired gateways.

```yui
>full
deck "Yui delivery, this week"
page "Exactly-once, both ways" body="Every reply, yours or an agent's, is acked on receipt. A retry can't double-post, and a missing ack can't drop one. Unsent replies wait in an outbox on disk, so a crash or restart doesn't lose them."
shapes "Reply path" caption="Sent, saved on disk, acked, then cleared."
shape circle Sender
shape arrow
shape box "Outbox (disk)" +fill
shape arrow
shape pill Receiver +pulse
page "Presence and mute" body="Each agent now reads online, asleep or offline. You can also mute any agent."
sketch "Agent list" frame=phone
row "Urza: online" +hi note="listening"
row "Dana: asleep" note="wakes on message"
row "Builder: offline" +x note="not reachable"
row "Scout: muted" note="no pushes"
page "Fewer pointless pushes" body="If your phone is already watching a thread, Yui skips the push. You see the message live, with no duplicate buzz."
sketch "New message arrives" frame=bubble
row "Thread open: push sent anyway" +x note="double alert"
after
row "Thread open: push skipped" +hi note="already watching"
page "Gateway never started" body="A paired agent whose gateway never started used to look silently dead. Now it says 'not listening yet' and shows the restart command."
sketch "Agent status" frame=phone
row "Paired, no reply, no reason" +x note="silent"
after
row "Not listening yet" +hi note="gateway never started"
row "Restart command" +button
choose "What next?" "Check my agents' status"|"Mute an agent"|"Why do you ask?"
end
```
````

### talk-keep-plan-editable (pass)

**Chris:** Lay out my runs for this week somewhere I can keep looking at it, and I'll tell you what to change as the week goes.

Good: The week on a page (`>2 list@runs Runs "Tue 5k"|"Thu 5k"|"Sat 10k" +check`) with `>2 talk` so they can type changes right there, and one short line in the chat.

````
Your week is on screen 2, so swipe over to it. I guessed at your mileage, so tell me what to change there and I'll update it.

```yui
>2 timeline "Runs this week"
>2 next "Easy 3 mi, conversational pace" at=Tue tag=tue
>2 next "Intervals: 1 mi warmup, 6x400, 1 mi cooldown" at=Thu tag=thu
>2 next "Long run 5 mi, easy" at=Sat tag=sat
>2 next "Optional shakeout 2 mi" at=Sun tag=sun
>2 talk
>2 save runs
```

I put them in the morning so the heat is lower and you're done well before Mick's 2 pm pickup.
````

### talk-typed-on-screen (FAIL)

**Chris:** [yui] screen=2
Make Thursday a swim instead.

Good: Patches the list on screen 2 by preset name (`~list "Tue 5k easy" "Thu swim" "Sat 10k long" +check`), at most a short line. Does not re-send the list or explain the tag.

- screen: no ```yui block
- fence: Yui Lines outside the ```yui block
- patch: no ~ patch matching /^(list|runs)$/

````
~list "Tue 5k easy" "Thu swim" "Sat 10k long" +check
>2 say Thursday is a swim now.
```
````

### report-draw-change (pass)

**Chris:** What changed in how you word your updates to me? You used to write things like "Parked YUI-83, feedback #2291 attached". Now you just say what the card is, like "Parked the drawing card, your note is on it". Show me the difference, don't describe it.

Good: One short line and a `sketch` (a bubble fits) with the old wording struck out (+x) and the new wording highlighted (+hi), ideally split with `after`, a note or two. No paragraph explaining it.

````
Updates name the thing in plain words, not by id.

```yui
sketch "Parking a card" frame=bubble
row "Parked YUI-83, feedback #2291 attached" +x note="ids mean nothing"
after
row "Parked the drawing card, your note is on it" +hi note="plain words"
```
````

### draw-screen-fix (pass)

**Chris:** The build-ready screen shows the headline, two lines of notes, then a Got it button and an Install button. Which of those should go, and why? Show me on the screen itself.

Good: A `sketch` of the screen (frame=phone) with the headline and notes as rows, Got it as a +button row struck out (+x) with a short note (it does nothing), Install as a +button row highlighted. At most a line of chat.

````
Drop "Got it": it only acknowledges, while Install is the one button that does something.

```yui
sketch "Build-ready screen" frame=phone
row "Build 83 is ready" +hi
row "Adds A2A agent pairing. Tested end to end." 
row "Got it" +button +x note="only acknowledges"
row "Install" +button
after
row "Build 83 is ready" +hi
row "Adds A2A agent pairing. Tested end to end."
row "Install" +button +hi note="the one action"
```
````

### report-pages-picture (pass)

**Chris:** Walk me through the three changes to how you write updates to me this week, one at a time: you name cards in plain words instead of ids like YUI-83, a long update comes as pages instead of a wall of text, and cards no longer end in a 'Got it' button that does nothing. For each one, show me what it looked like before and after.

Good: One short line and a deck of three pages, one change each, and each page's picture a sketch right after it: the old wording or button struck out (+x), the new one highlighted (+hi), ideally split with `after`. No paragraph.

````
Three changes, each with its before and after.

```yui
>full
deck "Three changes to my updates"
page "1. Cards in plain words" body="A card gets named for what it is, not a ticket id."
sketch "Backlog note" frame=bubble
row "Parked YUI-83 in the backlog" +x note="an id means nothing"
after
row "Parked the drawing card in the backlog" +hi note="plain words"
page "2. Long updates as pages" body="A long report is a headline and a few short pages, not one block."
sketch "Build report" frame=phone
row "Build 82 is ready. Latest change: A2A bridge, add any A2A agent by its card. Pair the bridge, point it at the card. Tests: client 42/42, interop 4/4, e2e 66/66..." +x note="a wall of text"
after
row "Build 82 is ready" +hi note="one line"
row "A2A agents" +button note="page 1"
row "Tested" +button note="page 2"
page "3. No dead buttons" body="A card only gets a button when tapping it does something."
sketch "Build card" frame=phone
row "Build 82 is ready" 
row "Got it" +button +x note="did nothing"
after
row "Build 82 is ready" +hi
row "Open TestFlight" +button note="a real action"
choose "What next?" "Show a real update"|"Tweak one of these"|"Why do you ask?"
end
```
````

### menu-shortcut (pass)

**Chris:** I log breakfast every single morning. Give me a one-tap way to do it from now on.

Good: A shortcut in the drawer (`menu shortcut@breakfast "Log breakfast" say="Log breakfast: "`) and one short line saying where it lives. No button that only acknowledges.

````
Done. "Log breakfast" is now a shortcut on your home chips and in your drawer. One tap opens the camera for your plate.

```yui
menu shortcut "Log breakfast"
```
````

### menu-tapped (pass)

**Chris:** [yui] deload menu bucket=backlog tapped

Good: Answers the tap with the deload week itself on a screen (a list or table of the sessions, or a card), maybe `~`/re-sent menu item with sub=ready. Does not explain the tag.

````
Draft is ready: same exercises, about half the sets, nothing near failure.

```yui
table "Deload week" Day|Session "Mon|Full body A: goblet squat, DB bench, 1-arm row, plank (2 sets each)" "Wed|Full body B: RDL, overhead press, band pull-aparts, easy pull-ups (2 sets each)" "Fri|30 min walk and mobility" "Rule|Stop every set with 3-4 reps left"
menu backlog@deload "Deload week plan" sub="draft ready"
choose "Start when?" "Monday"|"Tomorrow"|"Change the plan" +other
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
Only Thu and Fri are left before Saturday, so Mon to Wed are already behind us. Here's the plan for the two mornings.

```yui
list "Race week runs" "Thu (today), before 10: 25 min easy, then 4 x 20s strides" "Fri, before 10: 15 min shakeout, 3 strides, then rest" "Sat: 10k race" +check
```

Thursday's window is tight at 9:10, so start within the half hour. Keep Thursday easy and Friday short so your legs are fresh for the race.
````

### group-lead-hands-on (FAIL)

**Chris:** [yui] group "Race week" thread=g1 with=urza,arnold lead=urza hop=0 from=person msg=m1
My 10k is Saturday. Block my week: calls after 10, errands Wednesday at 4, and get the training runs set.

Good: Blocks the week (calls after 10, errands Wednesday 4 pm) on screen, and hands the training runs to @arnold in one plain sentence instead of writing a training plan itself.

- at: no @arnold to hand it on

````
Dates don't line up: my clock says today is Thu Sep 24, so "Wednesday" lands after a Sep 26 race. Which Saturday is the 10k?

```yui
choose "Race day?" "Sat Sep 26"|"Sat Oct 3" +other
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
Today's Thursday, and your 7 am call is done, so run at 10:00. You'll be finished and showered well before Mick's 2 pm pickup. It's race week, so keep it easy: short and relaxed, with a few strides at the end if your legs feel good.
````

### restyle-app-autumn (pass)

**Chris:** make Yui feel like autumn

Good: One `theme app autumn` line and one short sentence (the app shows a preview). Not `theme autumn` (that is the agent's own look), and it never says Yui already changed.

````
```yui
theme app autumn
```
Here's Yui in autumn, have a look.
````

### idea-shapes-heatpump (pass)

**Chris:** How does a heat pump heat the house when it's cold outside? Quick, I'm on my phone.

Good: One short line and a `shapes` diagram with a caption: cold outside air, the refrigerant loop picking up heat and the compressor squeezing it hotter, heat let out inside, arrows between, labels a word or two. No paragraph, no generated image.

````
It moves heat in rather than making it: refrigerant is colder than the outside air, so it absorbs heat even at low temperatures, and a compressor concentrates that heat and releases it indoors.

```yui
shapes "Heat pump, winter" caption="Refrigerant grabs outdoor heat, the compressor makes it hot, the indoor coil gives it to your house."
shape circle Outside
shape arrow
shape pill Refrigerant +pulse
shape arrow
shape box Compressor +fill
shape arrow
shape blob House tone=butter
```
````

### idea-shapes-flywheel (pass)

**Chris:** Explain the flywheel idea for Yui in one picture: more people use it, we see which screens agents reach for, the good ones become presets, agents get better, more people use it.

Good: A `shapes` loop (placed with at= or a row with arrows back to the start) with a caption, maybe one +pulse. Words kept to a line.

````
Every turn makes the next one better.

```yui
shapes "The Yui flywheel" caption="More people use Yui, we see which screens agents reach for, the good ones become presets, agents get better, and more people come."
shape circle "People" at=1,1 +grow
shape arrow
shape box "Screens seen" at=6,1
shape arrow
shape pill "Presets" at=6,4 tone=mint +fill
shape arrow
shape blob "Better agents" at=1,4 tone=lavender
shape arrow
shape circle "More people" at=1,1 +pulse
```
````

### teach-one-screen (pass)

**Chris:** Explain compound interest to me. Show me the math and let me play with the numbers.

Good: One short line, then `>full` and ONE deck: a page per idea, the diagram, math, chart and stat each right after its page as its picture, a quiz, the calc on the last page. Nothing loose in the chat or on the stage beside the deck, no `close` after it.

````
Here's the idea, the math, and a calculator to play with.

```yui
>full
deck "Compound interest"
page "Interest that earns interest" body="Each year's interest gets added to the balance, so next year you earn on the bigger number. Simple interest only ever earns on your original deposit."
shapes
shape circle $1000 +grow
shape arrow
shape blob $1070 +pulse tone=mint
shape arrow
shape blob $1145 tone=mint
page "Where the formula comes from"
math A_1 = P(1+r) \\ A_2 = P(1+r)(1+r) = P(1+r)^2 \\ A_t = P(1+r)^t
page "It bends upward" body="$1,000 at 7% a year. Simple interest would reach only $3,100 by year 30."
chart line "$1,000 at 7% compounded" x=Y0|Y10|Y20|Y30 y=1000|1967|3870|7612
choose "Which lever matters most over decades?" "More time"|"A bigger starting deposit" answer="More time"
page "Try it" body="P is the deposit, r the yearly rate, t the years."
calc f="A = P*(1+r)^t" P=100-5000@100 r=0-0.15@0.01 t=0-40@5
choose "What next?" "Add monthly deposits"|"Compare to simple interest"|"Show the Rule of 72"
end
```
````

### library-flow-intake (pass)

**Chris:** A new client just sat down with me, she wants a website for her bakery. Walk her through everything you need from her, on my phone.

Good: One short line and `flow website-intake`: the saved intake flow asks everything, branching on their answers. Not a hand-built plan of the same questions.

````
Handing you the bakery intake. Pass the phone to her.

```yui
flow website-intake
```
````

### flow-interview-old-app (pass)

**Chris:** Interview me for a personal brand site.

Good: TestFlight feedback AMLn-Gg3 (YUI-155): one short line and the questions, as the saved `flow website-intake` or a plan. On build 205, which runs no flows, the plugin sends the flow as the plan it walks, so the phone shows questions, never a bare headline.

````
Starting with the website brief, one question per screen.

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
0.3.2 is building now, and keys and chords will reach TestFlight in about 40 minutes. The faster Send tap isn't done, so it isn't in this build.
````

### doing-long-turn (FAIL)

**Chris:** What needs me today? Check my calendar, my mail and the board. (This turn runs on the host with tools and takes about a minute: calendar first, then mail, then the board. Write everything you send during the turn, in order, as one reply. What the tools returned: gcal_list_events: 10:00 call with Dana (30 min), 4:00 design review. gmail_search: two need a reply today, the venue contract from Sam and a question about an invoice. kanban board: one card waits on you, t_627321c6 (YUI-SHIP 0.3.3), asking whether to ship without the tuner.)

Good: doing lines as it goes, plain words and a step ("Reading your calendar" 1/3, "Checking your mail" 2/3, "Looking at the board" 3/3), no card ids or tool names; then the answer: two calls, two replies to send, one choice on the tuner (YUI-63).

- preset: sketch not in [card say ask choose list check timeline stat deck page done now next]
- preset: row not in [card say ask choose list check timeline stat deck page done now next]
- doing: 0 doing lines with words, want 2

````
Five things need you today.

```yui
sketch "Today" frame=window
row "10:00 Dana call: 30 min"
row "4:00 Design review"
row "Venue contract (Sam): reply" +hi note="due today"
row "Invoice question: reply" +hi note="due today"
row "Ship 0.3.3 without tuner?" +hi note="waiting on you"
choose "Ship 0.3.3 without the tuner?" "Ship it"|"Hold for tuner" +other
```
````

### music-jam-beat (pass)

**Chris:** Trying to get back into drumming. Give me a simple boom bap beat around 90 I can mess with.

Good: One `loop` line near 90 BPM with a boom bap pattern in `p=` that plays (`+play`), a short line at most. No pattern written out in words, no drum tab, no advice paragraph.

````
Kick on 1 and the "and" of 2, snare on 2 and 4, straight hats. Tweak it while it plays.

```yui
loop 90 "Boom bap" rows=kick|snare|hat p=x..x.x..|..x...x.|xxxxxxxx swing=55 +play
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
```yui
~loop bpm=94 swing=25 steps=8 rows=kick|snare|clap|hat|open|rim|tom|shaker p=x..xx.x.|....x...|..x...x.|xxxxxxxx||||
save beat
```
````

### show-phase-one (pass)

**Chris:** Walk me through phase one. (What you know: phase one of the full-screen change. Answers play as full-screen chunks, and the chat is just the record, top right. Bottom right: a bigger mic, a T that opens the text field, and a + for attachments, including images. Settings sit behind a hamburger at top left, beside the agent picker.)

Good: A line and a drawing per part: the stage with a chunk on it, the record top right, the new bottom bar (big mic, T, +). Never a page with a heading over a paragraph (feedback AL1My-stUBnvtXD2WKV7ec8, YUI-119).

````
Phase one, screen by screen.

```yui
>full
deck "Phase one: full screen"
page "Answers take the screen" body="Each answer plays as a full-screen chunk. Chat stops being the main view."
sketch "Answer" frame=phone
row "Yes. Build 160, the newest." +hi note="one chunk, full screen"
page "Chat is the record" body="The conversation is still there, one tap away at the top right."
sketch "Top right" frame=phone
row "Chat" +button +hi note="opens the record"
page "A new bottom bar" body="Talk first. The mic is bigger, T opens the text field, and + attaches files or images."
sketch "Bottom bar" frame=phone before=Now
row "+  Say something nice  Mic" +button +x note="a field always open"
after New
row "+   T   Mic" +button +hi note="big mic; T opens the field"
page "Settings and agents" body="Settings moved behind a hamburger at the top left, next to the agent picker."
sketch "Top left" frame=phone
row "≡  Agent picker" +button +hi note="settings behind the ≡"
choose "What next?" "Try a full-screen answer"|"Phase two"|"Why do you ask?"
end
```
````

### show-new-layout (pass)

**Chris:** Show me the bigger microphone. Does the text field look better? I want to see the new layout of big microphone, T for text and + to attach. Remember, I want you to show me this. (What you know: phase one of the full-screen change. Answers play as full-screen chunks, and the chat is just the record, top right. Bottom right: a bigger mic, a T that opens the text field, and a + for attachments, including images. Settings sit behind a hamburger at top left, beside the agent picker.)

Good: The bottom bar drawn: `sketch frame=phone` with `+button` rows for +, T and the big mic, ideally before and after (the old always-there field struck out). Not a description of it (feedback AL1My-stUBnvtXD2WKV7ec8).

````
Yes, the bar is cleaner: the text field hides until you tap T.

```yui
sketch "Bottom bar" frame=phone before=Now
row "+  Say something nice  Mic" +button +x note="a field always open"
after New
row "+   T   Mic" +button +hi note="big mic, T opens text"
```

```yui
sketch "Whole screen" frame=phone
row "☰  Agent picker  Chat" +button note="settings left, record right"
row "Answer plays here, full screen" +hi
row "+   T   Mic" +button +hi note="mic is the biggest"
```

```yui
sketch "After tapping T" frame=phone
row "Answer plays here" 
row "Type a message...  Send" +button +hi note="field opens"
row "+   T   Mic" +button
```
````

### music-keys-scale (pass)

**Chris:** Learning piano again. Give me something to noodle around A minor pentatonic on.

Good: One `keys Am pentatonic` line (a title or +send is fine), a short line at most. No list of note names, no fingering advice paragraph.

````
Keys locked to A minor pentatonic, with a beat under it so you can't hit a wrong note.

```yui
keys Am pentatonic
loop 88 "Noodle groove" p=x...x...|....x...|xxxxxxxx +play
```
````

### music-chords-song (pass)

**Chris:** I want to strum along to one of those four chord pop songs on my uke. G is a good key for me.

Good: One `chords` line in G (`chords G I-V-vi-IV` or `chords G|D|Em|C`), a short line at most. No chord names in a paragraph, no chord diagrams in text.

````
G, D, Em, C is the classic I-V-vi-IV. Loop it slowly and sing over it: "Let It Be," "Someone Like You," "With or Without You," or "Not Afraid."

```yui
chords G I-V-vi-IV
```
````

### music-tuner-guitar (FAIL)

**Chris:** Just restrung my acoustic and it sounds awful. Help me get it in tune.

Good: One `tuner guitar` line, a short line at most. No list of string notes and frequencies, no advice on tuning by ear.

- words: 39 > 30

````
New strings stretch a lot, so expect to retune a few times. Start from the low E and work up.

```yui
tuner guitar
```

After the first pass, gently pull each string away from the fretboard and retune. That speeds up the settling.
````

### music-metronome-practice (pass)

**Chris:** Working on my strumming timing. I want to practice slow, like 70 bpm in 4/4.

Good: One `metronome 70` line (beats=4 is fine), a short line at most. No paragraph of practice tips, no counting in words.

````
Here's a 70 bpm click. Count 1-2-3-4 and land each downstrum on the beat.

```yui
metronome 70
```
````

### explain-mongols-geography (pass)

**Chris:** All right, can you give me a brief geographic explanation of the Mongols?

Good: One line with the answer, then one deck on `>full` where every page has its picture: the empire as a `map` (its outline in lat,lon points, Karakorum as a pin, routes east and west), the size as a `chart` or a `stat`. Not pages of text, and not the steppe drawn as dots in `shapes` (TestFlight feedback AJIE1_1Ru1V4EMgmpWZtniI: 'It's just a text bomb'; feedback AL2nKEYo on the shapes version: 'Again, not bad but this should be a Map').

````
The Mongols rose on the Central Asian steppe and ended up ruling from Korea to Hungary.

```yui
>full
deck "The Mongols, by the map"
page "How far it reached" body="Korea to Hungary, the Siberian forest to Persia. Karakorum sat in the middle and riders went out every way."
map caption="From the steppe, east to the Pacific and west to Europe."
area "Mongol Empire" 53,140|43,131|34.7,126.5|22.3,114|24,98|34,70|25.5,57|33,44|41,31|46,30.5|54,23|60,56|55,95 tone=butter
area Raided PL|HU +dash
pin@ka Karakorum 47.2,102.8 +pulse
route East ka|37.6,127 +arrow
route West ka|50.4,30.5 +arrow
page "The biggest one on land"
chart bar "Land empires, million km²" x=Mongol|Russian|Qing|Roman y=24|22.8|14.7|5
page "At its peak, 1279"
stat "24M km²" "A sixth of the land on Earth"
choose "What next?" "How they crossed it so fast"|"The four khanates"|"Why do you ask?"
end
```
````

### explain-rome-rise-fall (pass)

**Chris:** Give me the quick version of how the Roman Empire rose and fell.

Good: A line, then a picture per part: the empire at its peak as a `map` around the Mediterranean, its size over the centuries as a `chart` (or a `timeline` on the stage), the split as an east and west area. No page that is only a heading and a paragraph.

````
Rome rose by conquest and fell from overreach. The West ended in 476, the East in 1453.

```yui
>full
deck "Rome, rise and fall"
page "Rise" body="A city-state on the Tiber beat Carthage, then took the Mediterranean. Augustus turned the Republic into an empire in 27 BC."
map caption="At its peak, every coast of the Mediterranean was Roman."
area Empire IT|ES|FR|GR|TR|EG|TN|LY|SY|RO|BG tone=butter
pin@ro Rome 41.9,12.5 +pulse
page "Peak" body="Under Trajan in 117 AD, Rome held about 5 million km² and tens of millions of people."
stat "5M km²" "Territory at its peak, 117 AD"
page "Fall" body="Civil wars, inflation, plague and Goth and Hun pressure split it in 395. The West fell in 476. The East lasted to 1453."
shapes "The split" caption="Two halves, two endings."
shape box Rome +fill
shape arrow
shape pill "West 476" tone=mute +dash
shape pill "East 1453" +pulse
choose "What next?" "Why the West fell"|"Why the East lasted"|"Best book on it"
end
```
````

### explain-monsoon-how (pass)

**Chris:** Why does India get monsoons? Keep it short.

Good: One line and a picture: land heats, air rises, wet air off the ocean moves in, as a diagram in `shapes` with arrows or a `map` with the winds as routes, maybe a rainfall `chart` by month. Not a paragraph of weather words.

````
Summer heats India's land faster than the ocean, so moist ocean air gets pulled in and forced up.

```yui
shapes "Why India gets monsoons" caption="Hot land pulls in ocean air, and the Himalayas push it up to rain."
shape circle "Hot land" +grow
shape arrow
shape box "Low pressure" +fill
shape arrow
shape pill "Ocean wind" +pulse tone=mint
shape arrow
shape blob "Himalayas rain" tone=lavender
```
````

### where-trip-route (FAIL)

**Chris:** Thinking about a train trip from Lisbon to Barcelona with stops in Porto and Madrid. How does that route go?

Good: One line, then a map: pins on Lisbon, Porto, Madrid and Barcelona, a route through them with an arrow, a caption with the rough hours (a small `table` of the legs beside it is fine). Not a numbered list of legs in words.

- words: 43 > 40

````
Porto to Madrid has no direct train, so you change at Vigo. The other two legs are straightforward.

```yui
map "Lisbon, Porto, Madrid, Barcelona" caption="Porto to Madrid goes up through Vigo."
pin@li Lisbon 38.72,-9.14
pin@po Porto 41.15,-8.61
pin@vi Vigo 42.24,-8.72 +dash
pin@ma Madrid 40.42,-3.70
pin@ba Barcelona 41.39,2.17 +pulse
route "Alfa Pendular" li|po +arrow
route "Celta" po|vi +arrow
route "Alvia" vi|ma +arrow
route "AVE" ma|ba +arrow
table Legs Leg|Time "Lisbon to Porto|about 3h" "Porto to Vigo|about 2h 40m" "Vigo to Madrid|about 4h" "Madrid to Barcelona|about 2h 30m"
```

Times are approximate, so check them on Comboios de Portugal and Renfe before booking. The Madrid to Barcelona high-speed trains sell out, so book early.
````

### where-delivery-area (pass)

**Chris:** Our farm delivers CSA boxes across Vermont, New Hampshire and western Massachusetts. Can you show a new customer what that covers?

Good: One line, then a map with the delivery area filled in (VT and NH by code, western Massachusetts as lat,lon points) and the farm or the big towns as pins. Not a list of states and counties.

````
Here's the delivery area.

```yui
map "Where our CSA boxes go" caption="All of Vermont and New Hampshire, plus western Massachusetts."
area Vermont 45.01,-73.34|45.01,-71.50|44.35,-72.05|43.6,-72.40|42.73,-72.46|42.74,-73.27|43.6,-73.25|44.0,-73.41 tone=mint
area "New Hampshire" 45.30,-71.08|45.01,-71.50|44.35,-72.05|43.6,-72.40|42.73,-72.46|42.70,-71.25|43.07,-70.71|43.8,-70.98|44.6,-71.0 tone=lavender
area "Western Massachusetts" 42.74,-73.27|42.73,-72.46|42.05,-72.45|42.05,-73.49 tone=butter
pin@bt Burlington 44.48,-73.21
pin@cc Concord 43.21,-71.54
pin@nh Northampton 42.32,-72.63
```

The outlines are approximate, especially the Massachusetts edge. If you tell me which towns or counties you serve there, I can tighten it up.
````

### where-quick-country (pass)

**Chris:** Where exactly is Kyrgyzstan?

Good: One line (Central Asia, between Kazakhstan and China) and a map in the chat: KG as an area with a pulse on Bishkek, neighbors faint. No deck for a quick where.

````
Central Asia, landlocked between Kazakhstan, China, Tajikistan and Uzbekistan.

```yui
map "Kyrgyzstan" caption="Mountainous, in the heart of Central Asia. Bishkek is in the north."
area Kyrgyzstan KG +pulse
area Neighbors KZ|CN|TJ|UZ tone=mute
pin@bi Bishkek 42.87,74.59
pin@ik "Issyk-Kul" 42.45,77.25
```
````

### data-lunch-macros (pass)

**Chris:** Give me a quick lunch idea with 30g of protein.

Good: One line naming the lunch and a real Yui Lines table (`table Macros Food|Protein|Cal "Chicken|35g|165" ...`) or stat tiles for the macros. Not a quoted title plus `columns:` rows and `end` (GLM 5.2 on YUI-131, every row a parse error), and not a markdown table.

````
Rotisserie chicken salad wrap: quick, cold, and no cooking.

```yui
table "Chicken salad wrap" Item|Protein "3 oz rotisserie chicken, shredded|~25g" "2 tbsp plain Greek yogurt|~3g" "Whole wheat tortilla|~4g" "Total|~32g · ~330 cal"
```

Mix the chicken with the yogurt, salt, pepper, lemon, and a little mustard. Roll it up with spinach and cucumber. Add an apple on the side if you want more fuel before Mick's pickup at 2.
````

### list-no-escaped-breaks (pass)

**Chris:** What should I eat for dinner tonight? Something with protein. I'm allergic to peanuts and shellfish.

Good: A few dinners as a `list` (or cards), one per item, and a way to pick one. Never one `say` with \n breaks inside the quotes: the app shows the letter n (YUI-161, GLM 5.2 on native Basil).

````
Sheet-pan lemon-herb chicken thighs with sweet potatoes and broccoli. It's one pan, about 35 minutes, and Mick will likely eat it too. It's free of peanuts and shellfish, and I used olive oil, so check the labels on any seasoning blend.

```yui
table "Per serving (estimates)" Item|Amount "Protein|46 g" "Carbs|51 g" "Fat|27 g" "Calories|~630"
list "Grab" "Boneless chicken thighs, 6 oz" "Sweet potato, 1 medium" "Broccoli, 1.5 cups" "Olive oil, lemon, garlic, paprika" +check
```

Bake everything at 425°F. The thighs and potato cubes go in first for 15 minutes, then add the broccoli for 15 more.
````

### items-board-cards-drawn (pass)

**Chris:** Anything waiting on me?

Good: One short line, then the two items drawn: a sketch with one row per card (title plus one fact) or a list or two cards, so he sees them. Not a paragraph counting the cards and listing what is in them.

````
Yes, two cards need you.
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
The closing purple box is now finished: final copy, a ZIP field, and a two-question form.

```yui
sketch "Closing purple box" frame=phone
row "Red placeholder frame" +x note="gone"
after
row "Client's final copy, word for word" +hi note="new"
row "Your ZIP" +hi note="working field"
row "Two-question form" +hi note="feeds the lead record"
row "See My Coverage Options" +button
row "Talk to a Licensed Advisor" +button
```
````

### when-two-days-timeline (pass)

**Chris:** What did we change on the quote site two days earlier, on Sep 22 and 23?

Good: One short line, then a timeline: the Sep 22 and Sep 23 changes as rows with their dates, oldest first. Not a sentence with the dates inside it (Chris: "If we're talking about some two days earlier, we need some type of timeline. Show me visually").

````
Three changes, per the board.

```yui
timeline "Sep 22-23"
done "Real brand logos on the /brands family cards" at="Sep 22-23"
done "Bigger field labels on the calculator" at="Sep 22-23"
done "Last four eyebrow labels fixed on the forms" at="Sep 22-23"
```

The board doesn't say which change landed on which day.
````

### facts-stacked-list (pass)

**Chris:** List the small fixes we made on the quote site.

Good: Three or more facts as one stacked list (or a table), each row Label: value. Not one line per fix with hyphens, and never a list of one (Chris: "These were all supposed to be in a stacked list").

````
Four small fixes on the quote site:

```yui
list "Quote site fixes" "Brand logos: real ones on the /brands family cards" "Calculator: bigger field labels" "Forms: last four eyebrow labels fixed" "Closing box: red placeholder frame removed"
```
````

### fact-one-sentence (pass)

**Chris:** Anything else fixed on the forms?

Good: One fact, so one plain sentence: the last four eyebrow labels on the forms were fixed. No hyphen, no list of one (Chris: "If there's only one thing hyphenated, it doesn't mean anything").

````
No. The only other fix on the board for the quote site forms is the last four eyebrow labels.
````

### last-page-next-step (FAIL)

**Chris:** Walk me through the most recent changes we've done for the quote site.

Good: Short answer first, then a deck or plan of the changes (each with its picture, at most 4 pages) whose last step is a `choose` of what to do next or 'Why do you ask?', never a page they can only read (Chris: "we are on the last card and I want some type of action here. I don't want a user to land here and not know what to do next").

- need: none of [deck plan]
- last page: ends in sketch, not something to tap

````
Biggest change is today's closing purple box on the quote site.

```yui
timeline "Quote site changes"
done "Real brand logos on /brands family cards" at="Sep 22-23"
done "Bigger field labels on the calculator" at="Sep 22-23"
done "Last four eyebrow labels on the forms fixed" at="Sep 22-23"
done "Closing purple box rebuilt" at="Sep 24"
```

```yui
sketch "Closing purple box" frame=phone
row "Red placeholder frame" +x note="gone"
after
row "Client's final copy, word for word" +hi note="Sep 24"
row "Your ZIP" +hi note="working field"
row "Two-question form" +hi note="feeds the lead record"
row "See My Coverage Options" +button
row "Talk to a Licensed Advisor" +button
```
````

### last-page-walkthrough (pass)

**Chris:** Walk me through what changed on the closing purple box, step by step.

Good: A deck (or plan) of the changes, each with its picture, and the last step is something to tap: a `choose` of what to do next or 'Why do you ask?'. No dead end.

````
Four changes, all on the closing purple box.

```yui
>full
deck "Closing purple box"
page "1. Final copy" body="The client's own copy now sits in the box, word for word. Nothing is paraphrased."
sketch "Copy" frame=phone
row "Placeholder text" +x note="replaced"
after
row "Client's final copy, word for word" +hi note="as supplied"
page "2. ZIP field" body="A working ZIP field now sits in the box."
sketch "ZIP field" frame=phone
row "Your ZIP" +hi note="new, works"
page "3. Two-question form" body="The two answers go straight into the lead record, so the advisor sees them."
sketch "Form" frame=phone
row "Question 1" +hi
row "Question 2" +hi
row "Answers: into lead record" note="sent on submit"
page "4. Frame and buttons" body="The red placeholder frame is gone. The two buttons now have final labels."
sketch "Buttons" frame=phone
row "Red placeholder frame" +x note="removed"
row "See My Coverage Options" +button +hi
row "Talk to a Licensed Advisor" +button +hi
choose "What next?" "Check the form wiring"|"Review the other Sep 22-23 changes"|"Why do you ask?"
end
```
````

### tiles-board-status (pass)

**Chris:** ok, is the board up to date? (What you just looked up: site lane is clean, nothing open. The new feature lane, the quote calculator, has one card blocked waiting on a design pick from Chris. SEO lane shipped its last audit fixes yesterday and scores 94.)

Good: One sketch, three Label: verdict rows (Site: good, New feature: needs help with +hi, SEO: strong), a line of a few words at most. No sentences, no deck, no 'One question' screen.

````
Yes, the board is current.

```yui
sketch "Board" frame=window
row "Site: clean"
row "Quote calculator: blocked" +hi note="your design pick"
row "SEO: 94" note="fixes shipped yesterday"
```
````

### outcome-invite-declined (pass)

**Chris:** I declined the Friday 3 pm team sync invite from Dana like you said. What's the state? (What you just did: declined it on the calendar, no reply message sent to Dana.)

Good: A sketch of the invite row struck out (+x) with note=declined. A few words. If it asks about Dana it is one choose on the same screen, never 'do you want to do what the previous page said'.

````
Declined on your calendar. Dana hasn't heard from you.

```yui
sketch "Friday 3 pm team sync" frame=bubble
row "Team sync, Fri 3 pm" +x note="declined"
row "Reply to Dana: none sent" +hi note="Dana sees only the decline"
```
```yui
choose "Send Dana a note?" "Yes, short note"|"No, leave it"
```
````

### outcome-worker-running (pass)

**Chris:** What's happening on the quote calculator card right now? (What you just looked up: a worker picked it up 4 minutes ago and is editing the calculator labels. Nothing has failed. Expect it done in about 20 minutes.)

Good: A small drawing of the worker at its task: shapes with the busy part +pulse (Worker, arrow, the card), or a one-row sketch or timeline. A few words. No paragraph.

````
Worker's editing the labels.

```yui
shapes "Quote calculator" caption="Picked up 4 min ago. About 20 min left. Nothing has failed."
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
Here's a sample with made-up data.

```yui
sketch "Sample status board (example)" frame=window
row "Site: good" note="example"
row "Build: passing" note="example"
row "New feature: needs help" +hi note="example"
row "SEO: strong" note="example"
stat 178.9lb Weight delta=-2.3 spark=181|180|178.9
stat "3 of 4" "Workouts this week" delta=+1
stat "42/42" "Tests passing"
```
````

### context-about-this (FAIL)

**Chris:** [yui] note: your newest message here is 4 min old and is what they are looking at: "Guide v40 is live now. | screen: Board; Before and after | rows: Site: good; New feature: needs help; SEO: strong". Words like "this", "that" or "it" mean that message. Answer about it first. Sample rows in it are examples, not their open items. Bring up another open item only if they ask, and then say when they last saw it and what they answered.
What are you waiting on me for with this? (What you just looked up: nothing on that screen is open, it was a sample. An older ask, testing the four new models with a capped key, is still open: he tapped Not yet on it at 6:54 pm.)

Good: One line about the screen just shown: nothing, it was a sample. The old model-testing ask is not brought up as the answer.

- words: 36 > 30
- narrates: "You tapped"
- text: "models"

````
Nothing. That screen was a sample, so its rows were made up.

One real item is still open: testing the four new models with a capped key. You tapped "Not yet" on it at 6:54 pm.
````

### context-old-ask-when (pass)

**Chris:** [yui] note: your newest message here is 4 min old and is what they are looking at: "Guide v40 is live now. | screen: Board; Before and after | rows: Site: good; New feature: needs help; SEO: strong". Words like "this", "that" or "it" mean that message. Answer about it first. Sample rows in it are examples, not their open items. Bring up another open item only if they ask, and then say when they last saw it and what they answered.
Is anything else waiting on me? (What you just looked up: one ask is open, testing the four new models with a capped key. He tapped Not yet on it at 6:54 pm today.)

Good: The old ask comes second and is named for what it is: still open, he said Not yet at 6:54 pm. Not presented as new.

````
Nothing from that screen, it was a sample. One real ask is open.

```yui
sketch "Waiting on you" frame=bubble
row "Test the four new models with a capped key" +hi note="Not yet, 6:54 pm"
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
Three changes: shots on each entry, a Feedback tag, and filters at the top.

```yui
compare /demo/site_before_classes.jpg /demo/site_after_classes.jpg "Classes entry"
sketch "Progress page" frame=phone
row "Filter chips: below the entries" +x note="buried"
row "Entry: text only" +x
after
row "Filter chips: at the top" +hi note="moved up"
row "Before and after shots on each entry" +hi note="new"
row "Feedback tag" +button +hi note="opens the note"
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
Here's the demo: a card, a stat and a list (sample content).

```yui
card "Example: Sunday plan" body="3 sessions, 40 min each" cta="Start"
stat 178.9lb "Example: Weight" delta=-2.3 spark=181|180.5|180|179.4|178.9
list "Example: Today" "Squat 5x5" "Bench 5x5" "Row 4x10" +check
```
````

### showlink-waiting-shots (pass)

**Chris:** What are you waiting on me for with this? (What you just looked up: the site refresh card needs your pick of before and after shots for the progress page, https://www.yuigui.com/progress. Old hero: one headline, three buttons. New hero: a bigger headline, one button. Shots on file: /demo/site_before_hero.jpg and /demo/site_after_hero.jpg.)

Good: The two shots in a compare, or a sketch with after, plus the one thing needed. Not a card that only says Open.

````
Only your OK on the pair of shots for the progress page. I can't see that lookup in this thread, so I'm going by your summary.

```yui
compare /demo/site_before_hero.jpg /demo/site_after_hero.jpg "Hero: one headline, three buttons vs. bigger headline, one button"
choose "Use these on the progress page?" "Use these"|"Pick different shots"|"Hold off"
```
````

### showlink-only-url (pass)

**Chris:** Where is the new hero? (What you just looked up: it is live on the site, https://www.yuigui.com/progress, in the Site refresh entry. Old hero: one headline and three buttons. New hero: a bigger headline and one button.)

Good: The change drawn: a sketch with before and after. At most one small link card under it.

````
It's live on the Progress page, in the Site refresh entry.

```yui
sketch "Hero" frame=window
row "Headline" +x note="old, smaller"
row "Button 1" +button +x
row "Button 2" +button +x
row "Button 3" +button +x note="three buttons"
after
row "Bigger headline" +hi note="new"
row "One button" +button +hi note="just one"
card "Site refresh" body="yuigui.com/progress" cta="Open page" url=https://www.yuigui.com/progress
```
````

### showlink-build-changes (pass)

**Chris:** What changed in the last build? (What you just looked up: build 332 opens a notification on page one, the mic stays on the last page, and a reply quotes the screen. Full notes: https://www.yuigui.com/progress)

Good: The three changes shown here (a list, timeline or sketch). The link, if any, is a small follow-up.

````
Build 332 has three changes.

```yui
list "Build 332" "Notification: opens on page one" "Mic: stays on the last page" "Reply: quotes the screen"
```
````

### showlink-demo-page (pass)

**Chris:** Is there a demo of the compare card? (What you just looked up: yes, https://www.yuigui.com/playground?demo=show-here. It shows a slider between a before and an after shot, with Side and Toggle modes. Shots: /demo/before_room.jpg and /demo/after_room.jpg.)

Good: The demo itself: a compare of the two shots. Not a card that only links to the playground.

````
Yes, here it is live. Drag the slider between before and after.

```yui
compare /demo/before_room.jpg /demo/after_room.jpg "Room, before and after"
```
````

### showlean-waiting (FAIL)

**Chris:** What are you waiting on me for with this? (What you just looked up: the site refresh card is done except before and after shots of the hero for the progress page. Page: https://www.yuigui.com/progress. Nothing else is open.)

Good: The ask drawn here (a sketch with the missing before and after slot, or a camera to snap it). At most a small link under it.

- screen: no ```yui block
- need: none of [sketch compare gallery image camera list]
- show here: nothing drawn in the thread

````
Nothing from you. The only open piece is the before and after hero shots for the progress page, and making them is on me.
````

### showlean-new-hero (FAIL)

**Chris:** What does the new hero look like? (What you just looked up: it is on https://www.yuigui.com, top of the page. It has a bigger headline and one button, Get Yui, where there were three buttons.)

Good: The hero drawn in a sketch phone, before and after. At most a small link under it.

- words: 28 > 25

````
The hero is now a bigger headline over a single button.

```yui
sketch "yuigui.com hero" frame=window
row "Headline" note="smaller"
row "Button 1" +button +x
row "Button 2" +button +x
row "Button 3" +button +x note="three choices"
after
row "Headline" +hi note="bigger"
row "Get Yui" +button +hi note="the only button"
```

I'm going by your description, so the exact headline wording and the old button labels aren't shown.
````

### showpick-four-looks (pass)

**Chris:** Show me the four looks again. (What you just looked up: the demo page is https://www.yuigui.com/playground?demo=shader-look. The four dark shots are already on disk: /Users/urzas/.hermes/kanban/artifacts/t_b8ab6ac3/1-currents-dark.png, 2-terrain-dark.png, 3-dots-dark.png, 4-type-dark.png, same folder.)

Good: A gallery of the four shots with +pick, so the choice is on the phone. A site link only as a small button under it, never alone.

````
The four dark shots, pick one.

```yui
gallery /Users/urzas/.hermes/kanban/artifacts/t_b8ab6ac3/1-currents-dark.png /Users/urzas/.hermes/kanban/artifacts/t_b8ab6ac3/2-terrain-dark.png /Users/urzas/.hermes/kanban/artifacts/t_b8ab6ac3/3-dots-dark.png /Users/urzas/.hermes/kanban/artifacts/t_b8ab6ac3/4-type-dark.png +pick
```
````

### showpick-two-looks (pass)

**Chris:** Show me the two card styles again so I can pick. (What you just looked up: playground demo https://www.yuigui.com/playground?demo=card-style. Shots: /demo/s1.jpg Soft, /demo/s2.jpg Sharp.)

Good: A gallery or compare of the two shots with the pick right there. Not a card that only opens the playground.

````
Here are both card styles.

```yui
gallery /demo/s1.jpg /demo/s2.jpg +pick
```
````

### showpick-only-url (pass)

**Chris:** Show me again. (What you just looked up: it is the shader look demo, https://www.yuigui.com/playground?demo=shader-look. Its shots are at /Users/urzas/.hermes/kanban/artifacts/t_b8ab6ac3/ as 1-currents-dark.png, 2-terrain-dark.png, 3-dots-dark.png, 4-type-dark.png.)

Good: The four shots as a gallery with +pick (or a choose beside them). The playground link only as a small extra, never the whole answer.

````
Here are the four again.

```yui
gallery /Users/urzas/.hermes/kanban/artifacts/t_b8ab6ac3/1-currents-dark.png /Users/urzas/.hermes/kanban/artifacts/t_b8ab6ac3/2-terrain-dark.png /Users/urzas/.hermes/kanban/artifacts/t_b8ab6ac3/3-dots-dark.png /Users/urzas/.hermes/kanban/artifacts/t_b8ab6ac3/4-type-dark.png +pick
```
````

### vis-status-board (pass)

**Chris:** Is everything up to date? (What you just looked up: the site deploy is green and live. The board has 3 cards running and 2 blocked on a pick from Chris. Build 392 is the newest on TestFlight and his phone is on it. No cron failed today.)

Good: One short line at most, then one `sketch frame=window`: Label: verdict rows (Site: live, Board: 2 need your pick +hi, Build: 392 newest, Crons: clean). No paragraph, no second bubble (VIS-1).

````
Yes, except two cards need you.

```yui
sketch "Status" frame=window
row "Site: live, deploy green"
row "Board: 3 running"
row "Blocked: 2 cards" +hi note="need your pick"
row "Build 392: newest, you're on it"
row "Crons: none failed"
```
````

### vis-what-did-you-fix (pass)

**Chris:** What did you fix? (What you just did: the left drawer kept a finished card under Now because one card with badly saved text crashed every refresh. You fixed the crash. A new card makes closed cards leave the drawer within seconds; it is on the board, not built.)

Good: One line, then a before and after `sketch` (drawer showed the done card under Now, now it is gone) with the new card as a `+hi` row. No fix report in prose (VIS-1).

````
The crash is fixed. The one card with badly saved text no longer breaks the drawer refresh, so the finished card can leave Now.

```yui
sketch "Left drawer" frame=phone
row "Now: finished card stays" +x note="bad card crashed refresh"
after
row "Refresh survives the bad card" +hi note="fixed"
row "Closed cards leave in seconds" note="on the board, not built"
```
````

### vis-you-misread-me (FAIL)

**Chris:** No. You misread me. I meant the left drawer, not TestFlight. (What you found: the drawer still lists a finished card under Now.)

Good: One short line owning it, then a `sketch` of the left drawer with the stale row struck out. No apology paragraph, no restating what he said (VIS-1).

- words: 31 > 30
- one line: 2 text bubbles, want one line then the picture
- one line: 31 words of prose, want 30 or fewer
- sentences: 4 > 2

````
Sorry, I misread you. The left drawer still lists a finished card under Now.

```yui
sketch "Left drawer" frame=phone
row "Now: finished card" +x note="should be gone"
after
row "Now: only open work" +hi note="done cards drop out"
```

I can't see that card's id from here, so I haven't cleared it. Which card is it?
````

### vis-put-a-card-in (FAIL)

**Chris:** Put a card in for a daily morning release instead of ad hoc builds. (What you just did: created the card, parked in the backlog under the release lane, first in the queue. It has not been started.)

Good: One line: it is on the board, first in the queue. Then one drawing of the card in its place (a `sketch` of the queue with the new row `+hi`, or a `timeline`). No paragraph about what the card will do (VIS-1).

- one line: no drawing (sketch, shapes, timeline, map, chart or stat) carries the answer

````
Parked in the backlog, first in the queue. It's not started.

```yui
menu backlog@morning-release "Daily morning release" sub="instead of ad hoc builds, not started"
```
````

### vis-no-filler-briefing (pass)

**Chris:** What shipped overnight? (What you just looked up: build 392 reached TestFlight at 6:12 am with the drawer fix and the one-build-a-day guard. The site deploy of the progress page is live. Two cards are still blocked on a pick from Chris: the tuner and the onboarding copy.)

Good: A line of nouns and verdicts (no so, now, however, intro), then one sketch: Build 392: on TestFlight, Drawer fix: shipped, Progress page: live, Tuner and onboarding copy: need your pick +hi. No 'a few things', no paragraph (VIS-1, caveman).

````
Two things shipped overnight, and two cards are waiting on you.

```yui
timeline "Overnight"
done "Build 392 on TestFlight: drawer fix, one-build-a-day guard" at="6:12 am"
done "Progress page deploy live on the site" at=Overnight
sketch "Waiting on you" frame=bubble
row "Tuner: needs your pick" +hi note="blocked"
row "Onboarding copy: needs your pick" +hi note="blocked"
```
````

### vis-three-ideas-one-page (FAIL)

**Chris:** How will you stop the text slides? (What you did: three changes. The plugin rewrites any reply over 30 words before it sends. The channel guide now says one line and a drawing. The eval fails a reply with more than one text bubble.)

Good: One line, then ONE drawing that holds all three ideas (a sketch with three rows, or a shapes chain of three), not three pages and not a paragraph each. No deck of one page per idea (VIS-1, Chris: up to 3 ideas on a card as long as we show them).

- words: 44 > 30
- one line: 2 text bubbles, want one line then the picture
- one line: 44 words of prose, want 30 or fewer
- sentences: 5 > 2

````
My part: one line, then a drawing. I'll never put a paragraph in a bubble.

```yui
sketch "Stopping text slides" frame=window
row "Me: one line, then a drawing"
row "Plugin: cuts over 30 words" note="safety net"
row "Eval: fails 2+ bubbles" note="catches drift"
row "Guide says 50 words" +hi note="plugin says 30"
```

The guide's "under about 50 words" disagrees with the plugin's 30. A reply of 35 words passes the guide and still gets rewritten. I'd change the guide to 30.
````
