# Channel eval: jev215-base-r1

Guide v43+22b9cd60 (4614 words), model claude-sonnet-5-5, 2026-09-30T16:13.

**77/88 passed (88%).**

| category | passed |
|---|---|
| workout | 4/4 |
| check-in | 2/2 |
| photo | 1/1 |
| today | 1/1 |
| scheduling | 1/1 |
| decision | 0/1 |
| list | 3/3 |
| data | 2/2 |
| flow | 10/12 |
| teach | 2/2 |
| look | 2/2 |
| no-screen | 4/4 |
| trap | 2/2 |
| dead-button | 2/3 |
| saved | 2/2 |
| report | 5/5 |
| idea | 2/2 |
| library | 1/1 |
| short | 1/2 |
| doing | 0/1 |
| music | 4/6 |
| show | 14/15 |
| explain | 2/3 |
| where | 3/3 |
| items | 1/1 |
| timeline | 1/1 |
| facts | 2/2 |
| tiles | 3/3 |
| context | 0/1 |

| case | result | why |
|---|---|---|
| workout-leg-day | pass |  |
| workout-tabata | pass |  |
| workout-plank | pass |  |
| workout-gear-question | pass |  |
| checkin-morning | pass |  |
| checkin-evening-voice | pass |  |
| meal-log-no-photo | pass |  |
| today-plan | pass |  |
| schedule-call | pass |  |
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
| no-html-pricing | pass |  |
| too-much-week | pass |  |
| flow-onboard-goal | FAIL | preset: flow not in [choose ask pick slide plan form card mic page]; need: none of [choose ask pick slide plan] |
| dead-status-report | FAIL | preset: sketch not in [card list stat table say ask choose]; preset: row not in [card list stat table say ask choose]; need: none of [card list stat table] |
| dead-logged-water | pass |  |
| dead-plan-submit | pass |  |
| flow-findings-then-questions | pass |  |
| flow-two-questions-one-plan | pass |  |
| save-reusable-workout | pass |  |
| show-saved-workout | pass |  |
| keep-list-on-page | pass |  |
| project-timeline | pass |  |
| game-offer | pass |  |
| report-card-done | pass |  |
| report-long-walkthrough | pass |  |
| talk-keep-plan-editable | pass |  |
| report-draw-change | pass |  |
| draw-screen-fix | pass |  |
| report-pages-picture | pass |  |
| menu-shortcut | pass |  |
| restyle-app-autumn | pass |  |
| idea-shapes-heatpump | pass |  |
| idea-shapes-flywheel | pass |  |
| teach-one-screen | pass |  |
| library-flow-intake | pass |  |
| flow-interview-old-app | pass |  |
| short-status-latest-build | FAIL | preset: sketch not in [card say ask choose stat list]; preset: row not in [card say ask choose stat list] |
| short-release-go-ahead | pass |  |
| doing-long-turn | FAIL | preset: sketch not in [card say ask choose list check timeline stat deck page done now next]; preset: row not in [card say ask choose list check timeline stat deck page done now next]; doing: 0 doing lines with words, want 2 |
| music-jam-beat | pass |  |
| music-finger-drums | pass |  |
| show-phase-one | pass |  |
| show-new-layout | pass |  |
| music-keys-scale | FAIL | preset: chords not in [keys say card save loop]; words: 35 > 30 |
| music-chords-song | FAIL | preset: tuner not in [chords say card save loop] |
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
| when-two-days-timeline | pass |  |
| facts-stacked-list | pass |  |
| fact-one-sentence | pass |  |
| last-page-next-step | FAIL | need: none of [deck plan]; last page: ends in sketch, not something to tap |
| last-page-walkthrough | pass |  |
| tiles-board-status | pass |  |
| outcome-invite-declined | pass |  |
| outcome-worker-running | pass |  |
| context-sample-not-ask | FAIL | preset: stat not in [sketch row after say choose ask] |
| showhere-before-after | pass |  |
| showhere-progress-page | pass |  |
| showhere-after-linkout | pass |  |
| showhere-demo | pass |  |
| showlink-waiting-shots | pass |  |
| showlink-only-url | pass |  |
| showlink-build-changes | pass |  |
| showlink-demo-page | pass |  |
| showlean-waiting | pass |  |
| showlean-new-hero | FAIL | words: 33 > 25 |
| showpick-four-looks | pass |  |
| showpick-two-looks | pass |  |
| showpick-only-url | pass |  |

## Transcripts

### workout-leg-day (pass)

**Chris:** Leg day. I have 40 minutes, home gym.

Good: A short line, then the session on screen (a checklist or a card) with a way to start (ask or timer). No interrogation: he already said time and gear.

````
Here's a 40-minute leg session built around 50 lb dumbbells, so tempo and single-leg work carry the load.

```yui
list "Leg day, 40 min" "Warm-up, 5 min: bodyweight squats, hip hinges, band walks" "Bulgarian split squat: 4x8 each, 3 sec down" "DB Romanian deadlift: 3x12, 3 sec down" "Bench step-ups: 3x10 each, hold the DBs" "Single-leg hip thrust, back on bench: 3x12 each" "Calf raises off a step: 3x20" "Finisher: goblet squat pulses, 1 min" +check
timer 90s Rest between sets
save workout
```

Rest 90 seconds between sets and superset the calves with the hip thrusts if you're running short on time.
````

### workout-tabata (pass)

**Chris:** Give me a 10 minute tabata finisher, I'm ready now.

Good: A timer with work/rest x rounds (it goes full screen by itself) and maybe the move list. No questions first.

````
Two 4-minute Tabatas, 1 minute rest between, 20 on / 10 off, alternating moves. Block 1 is ready to go.

```yui
list "10-min finisher" "Block 1: DB thrusters / mountain climbers" "Rest 1:00" "Block 2: DB swings / push-ups" "Last minute: walk it off, breathe"
timer 20/10x8 "Block 1: thrusters / climbers"
```

Go about 25-30 lb on the thrusters. Tell me when Block 1 is done and I'll start Block 2.
````

### workout-plank (pass)

**Chris:** plank hold, 2 min

Good: One timer line. Almost no chat text.

````
Two minutes, brace tight. Squeeze glutes, ribs down, breathe steady.

```yui
timer 2m Plank
```
````

### workout-gear-question (pass)

**Chris:** I want to train today but I'm at my mom's place, not sure what she has.

Good: Offer the likely gear as a pick with +other, or a camera to snap what is there. One question, not a form.

````
No problem, we can build it from whatever's around. What can you find there?

```yui
pick "What's around?" "Just my body"|"Sturdy chair"|Stairs|"Backpack or heavy bags"|"Towel"|"Dumbbells or weights" +other
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
Talk it out, I'll sort it into tasks, follow-ups, and tomorrow's plan.

```yui
mic "Brain dump: anything on your mind" +auto
```
````

### meal-log-no-photo (pass)

**Chris:** Can you log my lunch? I'm about to eat.

Good: A camera to snap the plate (the cheapest way to log), maybe a mic as an alternative.

````
Snap your plate and I'll log it, or just tell me what's on it.

```yui
camera "Snap your plate"
mic "Or tell me what you're eating"
```
````

### today-plan (pass)

**Chris:** What should I do today?

Good: Without calendar access it proposes a shape for the day or asks one thing (energy, top priority) as buttons. Remembers Mick at 2 pm. Not a text essay.

````
I can't see your calendar or inbox from here, so this is a skeleton around what I know.

```yui
list "Today" "Workout, home gym, 45 min" "Deep work block before noon" "Inbox and errands after lunch" "Mick pickup, 2:00 pm" "Family time after school" +check
choose "What should I fill in first?" "Build the workout"|"Plan errands"|"Dinner ideas" +other
```
````

### schedule-call (pass)

**Chris:** Set up a call with Matt next week, 30 minutes.

Good: Offer a few slots as buttons (avoiding 1:30 and 2 pm) with +other. One question.

````
Two quick picks and I'll draft the invite for Matt. I'll confirm with you before it goes out.

```yui
plan "Call with Matt" submit="Draft invite"
choose "Which day next week?" Mon|Tue|Wed|Thu|Fri +other
choose "What time?" "Morning"|"Midday"|"Afternoon" +other
form "Matt" email:voice
end
```
````

### decision-three-options (FAIL)

**Chris:** Help me pick which to do first this afternoon: invoice Heathos, reply to Paul about Plannix, or fix the Yui site footer.

Good: A recommendation plus the three as buttons (or an ordered list with +check). No essay.

- screen: no ```yui block
- need: none of [choose ask list card]

````
Invoice Heathos first. It's quick, it's money, and it's the one that quietly slips.

Then reply to Paul, since someone's waiting on you. Footer last, since nobody's blocked by it.

Do the first two before Mick's 2 pm pickup and save the footer for after.
````

### list-groceries (pass)

**Chris:** Make me a grocery list for high protein meals this week.

Good: A list with +check, a title, and items that fit on a phone.

````
Here's a week of high-protein staples, built for simple meals like chicken bowls, egg scrambles, and Greek yogurt breakfasts.

```yui
list Protein "Chicken breast, 3 lb" "Lean ground turkey, 2 lb" "Salmon fillets, 1.5 lb" "Flank steak, 1 lb" "Canned tuna, 4 cans" +check
list "Dairy & eggs" "Eggs, 18 count" "Greek yogurt, 32 oz" "Cottage cheese, 16 oz" "Shredded cheese, 1 bag" "Whey protein, if low" +check
list "Carbs & pantry" "Brown rice or quinoa" "Rolled oats" "Whole wheat wraps" "Black beans, 2 cans" "Peanut butter" +check
list Produce "Broccoli, 2 heads" "Spinach, 1 large bag" "Bell peppers, 4" "Sweet potatoes, 3 lb" "Bananas" "Berries" +check
save groceries
```
````

### list-packing (pass)

**Chris:** Mick has a field trip tomorrow to the science museum. Packing list?

Good: A checklist. One line of text.

````
Here's a starter list for Mick. Check the permission slip for anything school-specific, like a trip T-shirt or a required lunch.

```yui
list "Mick: museum trip" "Signed permission slip" "Lunch in a disposable bag" "Refillable water bottle" "Light backpack" "Comfortable closed-toe shoes" "Light jacket (museums run cold)" "Small notebook and pencil" "Snack" "Hand sanitizer" +check
```
````

### data-weight-trend (pass)

**Chris:** How's my weight trending? Last 7 days: 181, 180.6, 180.2, 179.9, 180.1, 179.4, 178.9

Good: A stat with a delta and a spark, or a line chart. One line of read-out, not a table in text.

````
Down 2.1 lb this week, a steady drop with one small bump on day 5.

```yui
stat 178.9lb Weight delta=-2.1 spark=181|180.6|180.2|179.9|180.1|179.4|178.9
```

That's a quick pace, and some of it is likely water. Hold your protein up and keep lifting so it comes off fat, not muscle.
````

### focus-second-screen (pass)

**Chris:** Start a 25 minute focus timer, and while it runs let's talk through the Plannix launch checklist.

Good: `>2 timer 25m Focus` (second screen) or a timer, plus the start of the checklist.

````
Timer's running on screen 2, so the chat stays here.

```yui
>2 timer 25m Focus
>2 talk
choose "Plannix launch checklist: where do we start?" "I'll paste it"|"Dictate it"|"Build one from scratch" +other
```
````

### teach-compound-interest (pass)

**Chris:** Explain compound interest to Mick, he's 9. Make it something he can play with.

Good: Something interactive: a calc with sliders, or a short deck with a quiz question.

````
Here's a playable one for Mick.
```yui
>full
deck "Money that has babies"
page "Coins that make coins" body="Put $10 in a bank. Every year the bank pays you extra money, called interest. Say it's 10%, so you get $1 for every $10."
shapes
shape circle "$10" +grow
shape arrow
shape blob "$11" +pulse tone=mint
page "Here's the trick" body="Next year you earn on $11, not $10. Your extra money earns extra money. That's compound interest."
shapes
shape circle "$10"
shape arrow
shape blob "$11"
shape arrow
shape blob "$12.10" +pulse tone=mint
page "Waiting is the superpower" body="Same $10, same 10%. Look what happens as the years pass."
chart line "$10 growing 10% a year" x=Year0|Year5|Year10|Year15|Year20 y=10|16.11|25.94|41.77|67.27
choose "Which gives you the most after 20 years?" "$10 in a jar"|"$10 growing 10% a year" answer="$10 growing 10% a year"
page "Your turn" body="Slide the money, the percent and the years. Watch how the years matter most."
calc f="A = P*(1+r)^t" P=10-100@10 r=0-0.2@0.05 t=0-30@5
choose "What next?" "Quiz me again"|"Use my allowance"|"Why do you ask?"
```
````

### theme-autumn (pass)

**Chris:** Make yourself look more autumn.

Good: `theme autumn` and one short line.

````
Here's my look in autumn.

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
A deload week is a planned lighter week of training, usually cutting weight or volume by about 40-50% while keeping the movements the same, so your body can recover from accumulated fatigue. You come back stronger and fresher rather than grinding into a plateau or injury.
````

### plain-math (pass)

**Chris:** what's 18% tip on $84?

Good: $15.12. No screen.

````
$15.12, so $99.12 total.
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
Need a few inputs, then I'll build the full week.

```yui
plan "Your week" submit="Build my week"
page "What I'm working with" body="Home gym: dumbbells to 50 lb, bench, bands, pull-up bar. Mick pickups at 2 pm, so I'll block you at school by 1:50 each school day. Deep work fits best before 1:30."
choose "Start from" Today|"Next Monday"
pick "Workout days (pick 4)" Mon|Tue|Wed|Thu|Fri|Sat|Sun
choose "Deep work per day" 2h|3h|4h
choose "Meals" "Dinners only"|"Lunch and dinner"|"All meals"
pick "Errands" Groceries|Pharmacy|"Dry cleaning"|"Post office" +other
form "Fixed commitments" "meetings and pickups I can't cover":voice
end
```
````

### flow-onboard-goal (FAIL)

**Chris:** I want to get back in shape before the holidays. Where do I start?

Good: The first question of a flow as buttons (goal or days per week), or a short plan. Not a 6-field form.

- preset: flow not in [choose ask pick slide plan form card mic page]
- need: none of [choose ask pick slide plan]

````
Good timing, you've got about 12 weeks. A few quick questions and I'll build your first plan around your home gym and school-run schedule.

```yui
flow first-plan
```
````

### dead-status-report (FAIL)

**Chris:** Give me the overnight report on screen. Facts: backups ran at 3:10, all 4 sites up, 2 renewals due Friday (yuigui.com, postscarcity.ai), no errors.

Good: The report as a card, list or stats. The renewals may get a real action ("Renew both"). No "Got it" or "OK" button: a card with nothing to act on has no cta.

- preset: sketch not in [card list stat table say ask choose]
- preset: row not in [card list stat table say ask choose]
- need: none of [card list stat table]

````
Overnight is clean.

```yui
sketch "Overnight" frame=window
row "Backups: ran 3:10 am"
row "Sites: all 4 up"
row "Renewals: 2 due Friday" +hi note="yuigui.com, postscarcity.ai"
row "Errors: none"
```
````

### dead-logged-water (pass)

**Chris:** Log 2 liters of water for today.

Good: Confirms in a line or a stat. Nothing to tap unless it does something ("Add 500 ml"); never a lone "Nice" or "Got it".

````
Got it: 2 L of water for today. I don't have a separate tracker connected, so this log lives in our chat.

```yui
stat 2L Water today
```
````

### dead-plan-submit (pass)

**Chris:** Walk me through planning a weekend trip: where, budget, and dates. I'll answer on screen.

Good: A plan with one step per question, ending in a submit named for what happens ("Send", "Plan it", "Find trips"), not "Create project".

````
Three questions, one screen.

```yui
plan "Weekend trip" submit="Build the plan"
choose "Where to?" "Key West"|"St. Augustine"|"Orlando"|"Naples / Sanibel"|"Miami"|"Fly somewhere" +other
choose "Budget for the weekend?" "Under $500"|"$500-1,000"|"$1,000-2,000"|"$2,000+"
choose "Which weekend?" "This weekend"|"Next weekend"|"In two weeks"|"Later in October" +other
end
```
````

### flow-findings-then-questions (pass)

**Chris:** Here are this morning's notes on the site review: the pricing page loads in 4.1 seconds on a phone, mostly two uncompressed hero images; the signup form drops the UTM tags; and the new FAQ block gets the most clicks after the hero. Walk me through what you found, then ask me what to fix first and whether to ship today or tomorrow.

Good: One plan: a page per finding with a real sentence or points, then 'fix first' and 'ship when' as questions, one submit. Not a deck followed by separate questions.

````
Three findings, then two calls from you.

```yui
plan "Site review" submit="Lock it in"
page "Pricing page is slow" body="It loads in 4.1 seconds on a phone. Most of that is two uncompressed hero images. Compressing them is the biggest win available, and it touches nothing else on the page."
page "Signup drops UTM tags" body="The signup form loses the UTM parameters on the way through. Any signup from a campaign lands with no source attached, so attribution is blind until this is fixed."
page "FAQ block is working" body="The new FAQ block gets the most clicks after the hero. Nothing to fix. It's worth keeping prominent, and it's a candidate for a higher slot later."
choose "What do we fix first?" "Hero images"|"UTM tags"|"Both at once"
choose "When do we ship?" Today|Tomorrow
end
```
````

### flow-two-questions-one-plan (pass)

**Chris:** Before you write my new program I want to look over what you changed from last month. You moved squats to Monday, cut the Friday run to 20 minutes, and added a deload in week 4. Show me that, then ask me how many days I can train and what equipment I have now.

Good: One plan: pages with the three changes, then days per week and equipment as steps, one submit.

````
Here are the three changes as you listed them. I don't have last month's old values in front of me, so this shows only the new state.

```yui
plan "Before the new program" submit="Build it"
page "Last month's changes" body="Three edits to the old program, as you described them."
sketch "Last month" frame=window
row "Squats: Monday" +hi note="moved"
row "Friday run: 20 min" +hi note="cut"
row "Week 4: deload" +hi note="added"
choose "How many days can you train?" 2|3|4|5|6
pick "What equipment do you have now?" "Dumbbells to 50 lb"|Bench|Bands|"Pull-up bar" +other
end
```
````

### save-reusable-workout (pass)

**Chris:** Give me a quick 20 minute Tabata I can come back to on busy days.

Good: A Tabata timer (it takes the stage on its own) and a `save` with a short name so it lands on the shelf. No re-asking what they want.

````
Five 4-minute blocks, 20s on and 10s off for 8 rounds each. Run the timer once per block and swap the move.

```yui
list "20-min Tabata" "1. Goblet squat (DB)" "2. Push-up" "3. DB bent-over row" "4. DB swing" "5. Mountain climber" +check
timer 20/10x8 "Block 1: Goblet squat"
save workout
```

Drop the DB weight if form slips by round 6. Mick's out at 2, so this fits before pickup.
````

### show-saved-workout (pass)

**Chris:** Slammed again today. Pull up my busy day workout.

Good: `show busy-day` (the name it saved), one short line, no re-sent timer.

````
Here's your busy-day workout.
```yui
show busy-day
```
````

### keep-list-on-page (pass)

**Chris:** I'm cooking bibimbap tonight. Keep the shopping list somewhere I can see it while we work out the recipe: eggs, spinach, rice, gochujang, carrots.

Good: `>2 list@shop Shopping Eggs|Spinach|Rice|Gochujang|Carrots +check` so the list stays on a page beside the chat, then the recipe in the chat.

````
Your list is on screen 2, so swipe over anytime and check things off. Bibimbap needs a protein too, so what are we using?

```yui
>2 list Shopping Eggs Spinach Rice Gochujang Carrots +check
choose "Protein?" "Ground beef"|Tofu|Chicken|"Just eggs" +other
```
````

### project-timeline (pass)

**Chris:** Where are we on the site rebuild? We shipped the new hero Monday and the pricing page Tuesday, the blog migration is running now, and the contact form and analytics are next. Show me.

Good: One `timeline` with the two shipped items as `done` rows (at=Mon, at=Tue), the blog migration as `now`, then the contact form and analytics as `next`, in that order. At most a short line of chat and maybe one question about what to pull next.

````
Blog migration is the only thing in flight.

```yui
timeline "Site rebuild"
done "New hero shipped" at=Mon
done "Pricing page shipped" at=Tue
now "Blog migration" tag=blog
next "Contact form" tag=form
next "Analytics" tag=analytics
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

### report-card-done (pass)

**Chris:** The worker just finished card INT-18 on the board. Its handoff summary: "A2A bridge: add any A2A agent to Yui by its Agent Card. node adapters/a2a/yui-a2a.ts pair <code> --card <url>, then run; add --card <url> puts more agents on the same machine. Runtime-neutral TypeScript client (src/a2a.ts + src/sse.ts, fetch and an SSE parser only, so the hosted step runs the same code in a Durable Object): A2A 1.0 SendMessage / SendStreamingMessage / SubscribeToTask / GetTask / CancelTask and 0.3 message/send, message/stream, tasks/resubscribe, tasks/get, one version-free shape for callers. The bridge keeps the relay's rules (delivered on pickup, handled after the answer, outbox on disk, one turn at a time per agent). Tests: client.test.ts 42/42; sdk_interop.test.ts 4/4 against the official a2a-sdk servers (1.1.5 and 0.3.26); a2a_e2e.py 66/66 live on throwaway accounts (kill -9 mid-task resumes the same task and answers once) plus the phone run 6/6 on the iPhone 18 Pro sim. No app binary change (INT-18)" Tell me what shipped.

Good: One short line, a card with the headline (A2A agents can join Yui), and the detail as a deck of short pages (what it does, how to add one, the test counts as points). No paragraph relaying the summary.

````
INT-18 shipped: any A2A agent can now join Yui by its Agent Card, with no app update needed.

```yui
card "INT-18: A2A bridge" body="Add any A2A agent by its Agent Card. No app binary change."
deck "What's in INT-18" +inline
page "Adding an agent" points="Pair: node adapters/a2a/yui-a2a.ts pair <code> --card <url>"|"Then run it"|"Add --card <url> again for more agents on the same machine"
page "Under the hood" body="A runtime-neutral TypeScript client (src/a2a.ts and src/sse.ts) using only fetch and an SSE parser, so the hosted step can run the same code in a Durable Object. It speaks A2A 1.0 and 0.3 behind one version-free shape."
page "Relay rules kept" points="Delivered on pickup"|"Handled after the answer"|"Outbox on disk"|"One turn at a time per agent"
page "Tested" points="Client 42/42"|"Official a2a-sdk servers 4/4 (1.1.5 and 0.3.26)"|"Live end to end 66/66, kill -9 mid-task resumes the same task and answers once"|"Phone run 6/6 on the iPhone 18 Pro sim"
choose "What next?" "Pair an agent"|"Plan the hosted step"|"Why do you ask?"
end
```
````

### report-long-walkthrough (pass)

**Chris:** Walk me through everything that changed in how Yui delivers messages this week: replies are exactly-once both ways with acks, a reply outbox on disk, presence reads online/asleep/offline per agent, pushes skip a phone already watching the thread, agents can be muted, and a paired agent whose gateway never started now says 'not listening yet' with the restart command.

Good: A deck (or plan) of short pages, one change per page, under one short chat line. Not a long bulleted or prose message.

````
Six changes, three themes: nothing lost or doubled, honest status, fewer needless pings.

```yui
>full
deck "How Yui delivers messages now"
page "Once, both ways" body="Replies are exactly-once in both directions, and every message gets an ack. Replies wait in an outbox on disk until they go out."
shapes caption="Agent to phone, then the ack comes back."
shape circle Agent
shape arrow
shape box Outbox +fill
shape arrow
shape circle Phone +pulse
page "Presence, per agent" body="Each agent reads online, asleep or offline. A paired agent whose gateway never started says 'not listening yet' and shows the restart command."
sketch "Presence (example)" frame=phone
row "Agent A: online"
row "Agent B: asleep"
row "Agent C: offline"
row "Agent D: not listening yet" +hi note="restart command shown"
page "Fewer pings" body="A push is skipped when your phone is already watching that thread. You can also mute an agent."
sketch "Push (example)" frame=bubble
row "Thread open on your phone" +x note="no push"
row "Muted agent" +x note="no push"
row "Thread closed, agent live" +hi note="push sent"
choose "What next?" "Mute an agent"|"Check agent presence"|"Why do you ask?"
end
```
````

### talk-keep-plan-editable (pass)

**Chris:** Lay out my runs for this week somewhere I can keep looking at it, and I'll tell you what to change as the week goes.

Good: The week on a page (`>2 list@runs Runs "Tue 5k"|"Thu 5k"|"Sat 10k" +check`) with `>2 talk` so they can type changes right there, and one short line in the chat.

````
Set up on screen 2: swipe over to it anytime. Type there to change it. I assumed easy effort and finishing before Mick's 2 pm pickup, so tell me your usual weekly mileage and I'll adjust.

```yui
>2 list@runs "This week's runs" "Thu: Easy 30 min, conversational, early before the heat" "Fri: Rest, or 20 min band and core" "Sat: Long easy 45 min" "Sun: Easy 25 min + 4x20s strides" +check
>2 talk
```
````

### report-draw-change (pass)

**Chris:** What changed in how you word your updates to me? You used to write things like "Parked YUI-83, feedback #2291 attached". Now you just say what the card is, like "Parked the drawing card, your note is on it". Show me the difference, don't describe it.

Good: One short line and a `sketch` (a bubble fits) with the old wording struck out (+x) and the new wording highlighted (+hi), ideally split with `after`, a note or two. No paragraph explaining it.

````
Ids and numbers out, plain words in.

```yui
sketch "Card updates (example)" frame=bubble
row "Parked YUI-83, feedback #2291 attached" +x note="ids mean nothing"
after
row "Parked the drawing card, your note is on it" +hi note="plain words"
```
````

### draw-screen-fix (pass)

**Chris:** The build-ready screen shows the headline, two lines of notes, then a Got it button and an Install button. Which of those should go, and why? Show me on the screen itself.

Good: A `sketch` of the screen (frame=phone) with the headline and notes as rows, Got it as a +button row struck out (+x) with a short note (it does nothing), Install as a +button row highlighted. At most a line of chat.

````
Cut "Got it": it only acknowledges, and Install is the one action.

```yui
sketch "Build-ready screen" frame=phone
row "Build 82 is ready" +hi
row "Adds A2A agents by Agent Card"
row "Pair the bridge, then point it at the card"
row "Got it" +button +x note="does nothing"
row "Install" +button
after
row "Build 82 is ready" +hi
row "Adds A2A agents by Agent Card"
row "Pair the bridge, then point it at the card"
row "Install" +button +hi note="the only action"
```
````

### report-pages-picture (pass)

**Chris:** Walk me through the three changes to how you write updates to me this week, one at a time: you name cards in plain words instead of ids like YUI-83, a long update comes as pages instead of a wall of text, and cards no longer end in a 'Got it' button that does nothing. For each one, show me what it looked like before and after.

Good: One short line and a deck of three pages, one change each, and each page's picture a sketch right after it: the old wording or button struck out (+x), the new one highlighted (+hi), ideally split with `after`. No paragraph.

````
Three changes, one page each.

```yui
>full
deck "Three changes to my updates"
page "1. Cards in plain words" body="A card gets named for what it is, not its ticket id."
sketch "Backlog note" frame=bubble
row "Parked YUI-83 in the backlog" +x note="an id means nothing"
after
row "Parked the drawing card in the backlog" +hi note="plain words"
page "2. Long updates as pages" body="A long update is one headline line, then short pages you swipe through."
sketch "Build update" frame=bubble
row "Build 82 is ready. Latest change: A2A bridge, add any A2A agent by its Agent Card. Pair it with node yui-a2a.ts pair. Tests: client 42/42, interop 4/4, e2e 66/66..." +x note="a wall of text"
after
row "Build 82 is ready." +hi note="one line first"
row "Page: A2A agents" note="what changed"
row "Page: Tested, 42/42, 4/4, 66/66" note="the numbers"
page "3. No empty buttons" body="A button has to do something. If nothing is left to act on, the card has no button."
sketch "Build 82 card" frame=phone
row "Build 82: Add any A2A agent" +hi
row "Got it" +button +x note="does nothing"
after
row "Build 82: Add any A2A agent" +hi
row "Open TestFlight" +button +hi note="acts, or no button"
choose "What next?" "Send me a real update"|"Change how I write them"|"Why do you ask?"
end
```
````

### menu-shortcut (pass)

**Chris:** I log breakfast every single morning. Give me a one-tap way to do it from now on.

Good: A shortcut in the drawer (`menu shortcut@breakfast "Log breakfast" say="Log breakfast: "`) and one short line saying where it lives. No button that only acknowledges.

````
Done. "Log breakfast" is now a shortcut in your drawer and on my home chips. One tap, and I'll bring up the log screen.

```yui
menu shortcut "Log breakfast"
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
It moves heat rather than making it. Even cold air holds heat, and refrigerant absorbs it outside, gets compressed so it's hot, and releases it indoors.

```yui
shapes "Heat pump, winter" caption="Refrigerant grabs outdoor heat, the compressor makes it hotter, and the indoor coil releases it."
shape circle "Cold air"
shape arrow
shape box "Outdoor coil"
shape arrow
shape pill Compressor +pulse
shape arrow
shape blob House tone=butter +fill
```
````

### idea-shapes-flywheel (pass)

**Chris:** Explain the flywheel idea for Yui in one picture: more people use it, we see which screens agents reach for, the good ones become presets, agents get better, more people use it.

Good: A `shapes` loop (placed with at= or a row with arrows back to the start) with a caption, maybe one +pulse. Words kept to a line.

````
One loop: usage teaches us which screens matter, and those screens make agents better.

```yui
shapes "The Yui flywheel" caption="More people use Yui, we see which screens agents reach for, the good ones become presets, agents get better, and more people come."
shape circle People +grow
shape arrow
shape box "Screens used" +fill
shape arrow
shape pill Presets +pulse
shape arrow
shape blob "Better agents" tone=mint
shape arrow
shape circle "More people" +dash
```
````

### teach-one-screen (pass)

**Chris:** Explain compound interest to me. Show me the math and let me play with the numbers.

Good: One short line, then `>full` and ONE deck: a page per idea, the diagram, math, chart and stat each right after its page as its picture, a quiz, the calc on the last page. Nothing loose in the chat or on the stage beside the deck, no `close` after it.

````
Here's compound interest, step by step, with sliders on the last page.

```yui
>full
deck "Compound interest"
page "Money that grows on itself" body="Interest earns interest. Each year's gain gets added to the pile, so next year's gain is bigger."
shapes
shape circle $100 +grow
shape arrow
shape blob $110 +pulse tone=mint
shape arrow
shape blob $121 tone=mint
page "The formula" body="Each year multiplies your balance by (1 + r). After t years, you've multiplied t times."
math A_1 = P(1+r) \\ A_2 = P(1+r)(1+r) = P(1+r)^2 \\ A_t = P(1+r)^t
page "It bends upward" body="$100 at 10% a year. The first decade adds $159. The second adds $414."
chart line "$100 at 10% a year" x=Y0|Y10|Y20 y=100|259|673
choose "Which lever grows it fastest over decades?" "More time"|"A bigger deposit" answer="More time"
page "Try it" body="P is your deposit, r the yearly rate, t the years."
calc f="A = P*(1+r)^t" P=100-10000@100 r=0-0.2@0.01 t=0-40@1
choose "What next?" "Add monthly deposits"|"Compare two rates"|"Why do you ask?"
end
```
````

### library-flow-intake (pass)

**Chris:** A new client just sat down with me, she wants a website for her bakery. Walk her through everything you need from her, on my phone.

Good: One short line and `flow website-intake`: the saved intake flow asks everything, branching on their answers. Not a hand-built plan of the same questions.

````
Handing you the bakery intake; pass her the phone.

```yui
flow website-intake
```
````

### flow-interview-old-app (pass)

**Chris:** Interview me for a personal brand site.

Good: TestFlight feedback AMLn-Gg3 (YUI-155): one short line and the questions, as the saved `flow website-intake` or a plan. On build 205, which runs no flows, the plugin sends the flow as the plan it walks, so the phone shows questions, never a bare headline.

````
Let's start with the basics. One question per screen.

```yui
plan "Personal brand interview" submit="Send it"
page "What we're building" body="Five quick questions about who the site is for and what it should do. Answer loosely; I'll draft the structure and copy from what you say."
choose "What's the main job of the site?" "Land clients"|"Get hired"|"Build an audience"|"Sell a product"|"Be my home base" +other
choose "Who should land on it?" Clients|Employers|Investors|Peers|"Press and podcasts" +other
form "You in your own words" whatido:voice proof:voice
choose "What should it feel like?" "Clean and minimal"|"Bold and loud"|"Warm and personal"|"Technical and sharp" +other
pick "What goes on it?" About|Projects|Writing|Speaking|Services|Newsletter|Contact +other
end
```
````

### short-status-latest-build (FAIL)

**Chris:** Am I on the latest build? (What you just looked up: the newest build on TestFlight is 160, live since 12:58 pm today. This phone reports build 160. An iPad on the same account reports build 135. Five changes wait on main for the next release, 0.3.2: keys and chords in the music tools, and a faster Send tap that is still being built.)

Good: One line: yes, build 160, the newest; the iPad is on 135. No deck, no pages, no 'what's coming' tour (YUI-118, feedback AJq7CcQS8fyM).

- preset: sketch not in [card say ask choose stat list]
- preset: row not in [card say ask choose stat list]

````
Yes, this phone is on the newest.

```yui
sketch "Builds" frame=window
row "TestFlight newest: 160" note="live 12:58 pm"
row "This phone: 160"
row "iPad: 135" +hi note="25 builds behind"
row "Next, 0.3.2: 5 on main" note="not shipped"
```
````

### short-release-go-ahead (pass)

**Chris:** OK, yeah go ahead and release that. I want to play with the music tools. (What you just did: started the 0.3.2 release; a worker is building it now and it reaches TestFlight in about 40 minutes. It leaves out the faster Send tap, which is not done yet.)

Good: One line: 0.3.2 is building, on TestFlight in about 40 minutes with keys and chords; the Send tap fix waits. No deck, no 'what happens next' pages (YUI-118).

````
0.3.2 is building now and should reach TestFlight in about 40 minutes, with keys and chords included. The faster Send tap isn't done, so it's left out.
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
row "10:00 call with Dana: 30 min"
row "4:00 design review"
row "Venue contract from Sam: reply" +hi note="due today"
row "Invoice question: reply" +hi note="due today"
row "Ship 0.3.3 without tuner: decide" +hi note="board card"
choose "Ship 0.3.3 without the tuner?" "Ship it"|"Hold for tuner"|"Why do you ask?"
```
````

### music-jam-beat (pass)

**Chris:** Trying to get back into drumming. Give me a simple boom bap beat around 90 I can mess with.

Good: One `loop` line near 90 BPM with a boom bap pattern in `p=` that plays (`+play`), a short line at most. No pattern written out in words, no drum tab, no advice paragraph.

````
Here's a classic boom bap loop at 90. Tap steps to change it while it plays.

```yui
loop 90 "Boom bap" p=x.....x.|....x...|........|x.x.x.x. swing=55 +play
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

### show-phase-one (pass)

**Chris:** Walk me through phase one. (What you know: phase one of the full-screen change. Answers play as full-screen chunks, and the chat is just the record, top right. Bottom right: a bigger mic, a T that opens the text field, and a + for attachments, including images. Settings sit behind a hamburger at top left, beside the agent picker.)

Good: A line and a drawing per part: the stage with a chunk on it, the record top right, the new bottom bar (big mic, T, +). Never a page with a heading over a paragraph (feedback AL1My-stUBnvtXD2WKV7ec8, YUI-119).

````
Answers take the whole screen.
```yui
sketch "Answers" frame=phone
row "Your answer plays as full-screen chunks" +hi note="one at a time"
row "Chat" +button note="the record, top right"
```
Settings and agents sit up top.
```yui
sketch "Top bar" frame=phone
row "☰  Agent picker" +button +hi note="settings behind the hamburger"
row "Chat" +button note="top right"
```
Talk first. Type or attach when you want.
```yui
sketch "Bottom bar" frame=phone
row "+   T   Mic" +button +hi note="big mic, T opens text"
row "+ adds attachments and images" note="bottom left"
```
````

### show-new-layout (pass)

**Chris:** Show me the bigger microphone. Does the text field look better? I want to see the new layout of big microphone, T for text and + to attach. Remember, I want you to show me this. (What you know: phase one of the full-screen change. Answers play as full-screen chunks, and the chat is just the record, top right. Bottom right: a bigger mic, a T that opens the text field, and a + for attachments, including images. Settings sit behind a hamburger at top left, beside the agent picker.)

Good: The bottom bar drawn: `sketch frame=phone` with `+button` rows for +, T and the big mic, ideally before and after (the old always-there field struck out). Not a description of it (feedback AL1My-stUBnvtXD2WKV7ec8).

````
Here's the new layout, before and after.

```yui
sketch "Phone, phase one" frame=phone before=Now
row "+  Say something nice  Mic" +button +x note="a field always open"
after New
row "☰  Yui ▾                Chat" +hi note="settings and agent left, record right"
row "The answer fills the screen" note="full-screen chunks"
row "+" +button +hi note="attach, images too"
row "T" +button +hi note="opens the text field"
row "Mic" +button +hi note="big, bottom right"
```

The text field is hidden until you tap T, so the screen stays clear for the answer.
````

### music-keys-scale (FAIL)

**Chris:** Learning piano again. Give me something to noodle around A minor pentatonic on.

Good: One `keys Am pentatonic` line (a title or +send is fine), a short line at most. No list of note names, no fingering advice paragraph.

- preset: chords not in [keys say card save loop]
- words: 35 > 30

````
Here's a keyboard locked to A minor pentatonic, plus a slow groove to play over.

```yui
loop 80 "Slow groove" p=x.......|....x...|........|x.x.x.x. +play
keys Am pentatonic
chords Am|G|C|Em
```

Start on A and let the notes ring. Land on A, C or E when you want to sound settled.
````

### music-chords-song (FAIL)

**Chris:** I want to strum along to one of those four chord pop songs on my uke. G is a good key for me.

Good: One `chords` line in G (`chords G I-V-vi-IV` or `chords G|D|Em|C`), a short line at most. No chord names in a paragraph, no chord diagrams in text.

- preset: tuner not in [chords say card save loop]

````
G, D, Em, C: the classic I-V-vi-IV. Tap along; "Let It Be" and "No Woman No Cry" fit it too.

```yui
chords G I-V-vi-IV
tuner ukulele
```
````

### music-tuner-guitar (pass)

**Chris:** Just restrung my acoustic and it sounds awful. Help me get it in tune.

Good: One `tuner guitar` line, a short line at most. No list of string notes and frequencies, no advice on tuning by ear.

````
New strings drift flat for a while, so tune, stretch each one gently, and go around again.

```yui
tuner guitar
```
````

### music-metronome-practice (pass)

**Chris:** Working on my strumming timing. I want to practice slow, like 70 bpm in 4/4.

Good: One `metronome 70` line (beats=4 is fine), a short line at most. No paragraph of practice tips, no counting in words.

````
Click's set at 70. Count 1-2-3-4 and land each downstrum on the beat.

```yui
metronome 70
```
````

### explain-mongols-geography (pass)

**Chris:** All right, can you give me a brief geographic explanation of the Mongols?

Good: One line with the answer, then one deck on `>full` where every page has its picture: the empire as a `map` (its outline in lat,lon points, Karakorum as a pin, routes east and west), the size as a `chart` or a `stat`. Not pages of text, and not the steppe drawn as dots in `shapes` (TestFlight feedback AJIE1_1Ru1V4EMgmpWZtniI: 'It's just a text bomb'; feedback AL2nKEYo on the shapes version: 'Again, not bad but this should be a Map').

````
The Mongols rose on the Central Asian steppe and, within about 70 years, ruled the largest contiguous land empire in history.

````yui
>full
deck "The Mongols, by the map"
page "Where they began" body="Herding clans on the grasslands of modern Mongolia, between the Siberian forest and the Gobi. Horses and open country made them fast."
map caption="Karakorum, the capital, sat in the middle of the steppe."
area Mongolia MN tone=butter
pin@ka Karakorum 47.2,102.8 +pulse
page "How far it reached" body="Korea to Hungary, Siberia to Persia. Armies rode out along the steppe corridor in every direction."
map caption="East to the Pacific, west to the edge of Europe."
area "Mongol Empire" 53,140|43,131|34.7,126.5|22.3,114|24,98|34,70|25.5,57|33,44|41,31|46,30.5|54,23|60,56|55,95 tone=butter
area Raided PL|HU +dash
pin@ka Karakorum 47.2,102.8 +pulse
route East ka|37.6,127 +arrow
route West ka|50.4,30.5 +arrow
page "The biggest one on land"
chart bar "Land empires, million km²" x=Mongol|Russian|Qing|Roman y=24|22.8|14.7|5
choose "What next?" "How they split up"|"The Silk Road"|"Why do you ask?"
end
````
````

### explain-rome-rise-fall (FAIL)

**Chris:** Give me the quick version of how the Roman Empire rose and fell.

Good: A line, then a picture per part: the empire at its peak as a `map` around the Mediterranean, its size over the centuries as a `chart` (or a `timeline` on the stage), the split as an east and west area. No page that is only a heading and a paragraph.

- map: a where answer with no map

````
Rome grew from a city-state into a Mediterranean power, then split and eroded under pressure from within and without.

```yui
timeline "Rome, start to finish"
done "Republic founded" at="509 BC"
done "Carthage destroyed, Mediterranean won" at="146 BC"
done "Augustus, first emperor" at="27 BC"
done "Peak size under Trajan" at="117 AD"
done "Civil wars, plague, inflation" at="235-284"
done "Empire split East/West" at="395"
done "Western Empire falls" at="476"
done "Eastern Empire falls to Ottomans" at="1453"
```
````

### explain-monsoon-how (pass)

**Chris:** Why does India get monsoons? Keep it short.

Good: One line and a picture: land heats, air rises, wet air off the ocean moves in, as a diagram in `shapes` with arrows or a `map` with the winds as routes, maybe a rainfall `chart` by month. Not a paragraph of weather words.

````
In summer, land heats faster than the ocean, so warm air rises over India and pulls in moist wind from the Indian Ocean, which drops rain as it climbs inland and up the Himalayas.

```yui
shapes "Why India gets monsoons" caption="Hot land pulls in wet ocean wind, and it rains."
shape circle Sun +grow
shape arrow
shape box "Hot land" +fill
shape arrow
shape pill "Ocean wind" tone=lavender
shape arrow
shape blob Rain +pulse tone=mint
```
````

### where-trip-route (pass)

**Chris:** Thinking about a train trip from Lisbon to Barcelona with stops in Porto and Madrid. How does that route go?

Good: One line, then a map: pins on Lisbon, Porto, Madrid and Barcelona, a route through them with an arrow, a caption with the rough hours (a small `table` of the legs beside it is fine). Not a numbered list of legs in words.

````
Lisbon to Porto is about 3 hrs and Madrid to Barcelona about 2.5 hrs, both direct. Porto to Madrid has no direct train, so you change at Vigo (roughly 7 to 8 hrs total). Check current schedules before booking.

```yui
map "Lisbon to Barcelona" caption="Two fast legs, with a Vigo change between Porto and Madrid."
pin@li Lisbon 38.72,-9.14 +pulse
pin@po Porto 41.15,-8.61
pin@vi Vigo 42.24,-8.72 tone=butter
pin@ma Madrid 40.42,-3.70
pin@ba Barcelona 41.39,2.17
route "Alfa Pendular, ~3h" li|po +arrow
route "Celta, ~2h45" po|vi +arrow
route "Alvia, ~4h" vi|ma +arrow
route "AVE, ~2h30" ma|ba +arrow
```
````

### where-delivery-area (pass)

**Chris:** Our farm delivers CSA boxes across Vermont, New Hampshire and western Massachusetts. Can you show a new customer what that covers?

Good: One line, then a map with the delivery area filled in (VT and NH by code, western Massachusetts as lat,lon points) and the farm or the big towns as pins. Not a list of states and counties.

````
Here's your delivery area.

```yui
map "Where we deliver" caption="Vermont, New Hampshire and western Massachusetts."
area Vermont 45.01,-73.35|45.01,-71.50|44.35,-71.55|43.6,-72.33|42.73,-72.46|42.75,-73.27|43.6,-73.25|44.2,-73.4 tone=mint +pulse
area "New Hampshire" 45.30,-71.08|44.9,-71.0|43.75,-70.98|43.07,-70.71|42.70,-71.25|42.73,-72.46|43.6,-72.33|44.35,-71.55|45.01,-71.50 tone=lavender
area "Western Massachusetts" 42.74,-73.27|42.73,-72.46|42.70,-72.05|42.03,-72.05|42.03,-73.49|42.50,-73.51 tone=butter
```

I drew western Mass as roughly the Berkshire, Franklin, Hampshire and Hampden county area. Tell me if your route reaches further east and I'll adjust it.
````

### where-quick-country (pass)

**Chris:** Where exactly is Kyrgyzstan?

Good: One line (Central Asia, between Kazakhstan and China) and a map in the chat: KG as an area with a pulse on Bishkek, neighbors faint. No deck for a quick where.

````
Central Asia, in the Tian Shan mountains, bordering Kazakhstan, Uzbekistan, Tajikistan and China.

```yui
map "Kyrgyzstan" caption="A mountainous, landlocked country in Central Asia."
area Kyrgyzstan KG +pulse tone=butter
area Kazakhstan KZ tone=mute
area Uzbekistan UZ tone=mute
area Tajikistan TJ tone=mute
area China CN tone=mute
pin@bk Bishkek 42.87,74.59
```
````

### data-lunch-macros (pass)

**Chris:** Give me a quick lunch idea with 30g of protein.

Good: One line naming the lunch and a real Yui Lines table (`table Macros Food|Protein|Cal "Chicken|35g|165" ...`) or stat tiles for the macros. Not a quoted title plus `columns:` rows and `end` (GLM 5.2 on YUI-131, every row a parse error), and not a markdown table.

````
Rotisserie chicken wrap, about 10 minutes and no cooking. Mick can have one after school too.

```yui
table "Chicken avocado wrap" Part|Protein "Rotisserie chicken breast, 4 oz|26g" "Whole-wheat tortilla|4g" "Plain Greek yogurt, 2 tbsp|2g" "Spinach, tomato, 1/4 avocado|1g" "Total|~33g"
```
````

### list-no-escaped-breaks (pass)

**Chris:** What should I eat for dinner tonight? Something with protein. I'm allergic to peanuts and shellfish.

Good: A few dinners as a `list` (or cards), one per item, and a way to pick one. Never one `say` with \n breaks inside the quotes: the app shows the letter n (YUI-161, GLM 5.2 on native Basil).

````
Sheet-pan lemon-herb chicken thighs with sweet potato and broccoli. It's about 40 minutes, mostly hands-off, and Mick will likely eat it too.

```yui
card "Sheet-pan chicken dinner" body="Toss thighs, cubed sweet potato and broccoli in olive oil, garlic, lemon, salt and pepper. Roast at 425°F for 30-35 min."
table "Macros (1 serving, approx.)" Nutrient|Amount "Protein|47 g" "Calories|670" "Carbs|53 g" "Fat|30 g"
```

Use olive oil, not peanut oil, and skip oyster sauce, since it's shellfish-based.
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

### when-two-days-timeline (pass)

**Chris:** What did we change on the quote site two days earlier, on Sep 22 and 23?

Good: One short line, then a timeline: the Sep 22 and Sep 23 changes as rows with their dates, oldest first. Not a sentence with the dates inside it (Chris: "If we're talking about some two days earlier, we need some type of timeline. Show me visually").

````
Three changes went in on Sep 22 and 23.

```yui
timeline "Quote site, Sep 22-23"
done "Real brand logos on the /brands family cards" at="Sep 22-23"
done "Bigger field labels on the calculator" at="Sep 22-23"
done "Last four eyebrow labels on the forms fixed" at="Sep 22-23"
```

The board note groups them under both days, so I can't say which landed on which.
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
The biggest change landed today: the closing box is now finished.

```yui
timeline "Quote site, latest changes"
done "Real brand logos on /brands family cards" at="Sep 22-23"
done "Bigger field labels on the calculator" at="Sep 22-23"
done "Last four form eyebrow labels fixed" at="Sep 22-23"
done "Closing purple box finished" at="Sep 24"
sketch "Closing purple box" frame=phone
row "Red placeholder frame" +x note="gone"
after
row "Client's final copy, word for word" +hi note="in place"
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
Four changes on the box, in order.

```yui
>full
deck "The closing purple box"
page "Placeholder out, real copy in" body="The red placeholder frame is gone. The box now carries the client's final copy, word for word."
sketch "Closing box" frame=phone
row "Red placeholder frame" +x note="removed"
after
row "Client's final copy, word for word" +hi note="now live"
page "A working ZIP field" body="Visitors can type their ZIP right in the box."
sketch "ZIP field" frame=phone
row "Your ZIP  _____" +hi note="new, working"
page "A two-question form" body="Two questions sit under the ZIP. Their answers go straight into the lead record."
sketch "Form to lead" frame=phone
row "ZIP" +hi
row "Question 1" +hi
row "Question 2" +hi note="answers go to the lead record"
page "New button labels" body="Both buttons now use the client's wording."
sketch "Buttons" frame=phone
row "See My Coverage Options" +button +hi
row "Talk to a Licensed Advisor" +button +hi
choose "What next?" "Test the form"|"See the copy"|"Why do you ask?"
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
row "Quote calculator: 1 blocked" +hi note="needs your design pick"
row "SEO: 94" note="fixes shipped yesterday"
```
````

### outcome-invite-declined (pass)

**Chris:** I declined the Friday 3 pm team sync invite from Dana like you said. What's the state? (What you just did: declined it on the calendar, no reply message sent to Dana.)

Good: A sketch of the invite row struck out (+x) with note=declined. A few words. If it asks about Dana it is one choose on the same screen, never 'do you want to do what the previous page said'.

````
Declined on your calendar. No note went to Dana.

```yui
sketch "Team sync" frame=bubble
row "Team sync, Friday 3 pm" +x note="declined"
row "Reply to Dana: none sent" +hi note="say if you want one"
```
````

### outcome-worker-running (pass)

**Chris:** What's happening on the quote calculator card right now? (What you just looked up: a worker picked it up 4 minutes ago and is editing the calculator labels. Nothing has failed. Expect it done in about 20 minutes.)

Good: A small drawing of the worker at its task: shapes with the busy part +pulse (Worker, arrow, the card), or a one-row sketch or timeline. A few words. No paragraph.

````
Being worked on, nothing failed.

```yui
shapes "Quote calculator" caption="Picked up 4 min ago. About 20 min left."
shape circle Worker +pulse
shape arrow
shape box "Calculator labels" +fill
```
````

### context-sample-not-ask (FAIL)

**Chris:** Show me a sample status board so I can see how the tiles look.

Good: One sketch of Label: verdict rows marked as an example (note="example" or a sample title). No row says "waiting on you": a sample is not a real ask.

- preset: stat not in [sketch row after say choose ask]

````
Here's a sample board, all made-up data.

```yui
sketch "Sample status board (example)" frame=window
row "Workout: done"
row "Mick pickup: 2 pm" +hi note="example"
row "Groceries: not started" note="example"
row "Inbox: clear"
stat 7.5h "Sleep (sample)" delta=+0.5 spark=6.5|7|7|7.5
stat 8,240 "Steps (sample)" delta=-1,100 spark=9300|9000|8700|8240
stat 3/4 "Workouts this week (sample)"
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
sketch "Progress page" frame=phone before=Before
row "Filter chips below the entries" +x note="hard to reach"
row "Entry: text only" +x note="no shots"
after After
row "All  Shipped  Feedback" +hi +button note="chips moved to top"
row "Entry: before and after shots" +hi note="shown on each entry"
row "Feedback" +button note="tag links to the note"
```
````

### showhere-after-linkout (pass)

**Chris:** Just show me here. (Shots: /demo/site_before_classes.jpg and /demo/site_after_classes.jpg.)

Good: A compare of the two shots in the thread. No second link-out card.

````
Here they are, right in the thread.

```yui
compare /demo/site_before_classes.jpg /demo/site_after_classes.jpg "Classes page"
```
````

### showhere-demo (pass)

**Chris:** Can I see the reply cards demo? (What you just looked up: it is the /playground demo cards. It shows a card, a stat and a list. A card has a title, a body and one button. The stat shows a number with a small trend line.)

Good: The demo's parts drawn right here (a card sketch, a stat). Not a card that only links to /playground.

````
Here's the demo: a card, a stat, and a list. The numbers are sample data.

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
Going by the note you pasted, only your OK on the hero shots for the progress page. I can't see when that ask was sent or whether you already answered it.

```yui
compare /demo/site_before_hero.jpg /demo/site_after_hero.jpg "Hero: before and after"
choose "Use these two shots?" "Use them"|"Pick different ones"
```
````

### showlink-only-url (pass)

**Chris:** Where is the new hero? (What you just looked up: it is live on the site, https://www.yuigui.com/progress, in the Site refresh entry. Old hero: one headline and three buttons. New hero: a bigger headline and one button.)

Good: The change drawn: a sketch with before and after. At most one small link card under it.

````
It's live on the progress page, in the Site refresh entry.

```yui
sketch "Hero" frame=window
row "Headline" +x note="old, smaller"
row "Button 1" +button +x
row "Button 2" +button +x
row "Button 3" +button +x
after
row "A bigger headline" +hi note="new"
row "One button" +button +hi note="only one"
card "Site refresh" body="On the progress page" cta="Open" url=https://www.yuigui.com/progress
```
````

### showlink-build-changes (pass)

**Chris:** What changed in the last build? (What you just looked up: build 332 opens a notification on page one, the mic stays on the last page, and a reply quotes the screen. Full notes: https://www.yuigui.com/progress)

Good: The three changes shown here (a list, timeline or sketch). The link, if any, is a small follow-up.

````
Build 332 has three changes.

```yui
list "Build 332" "Notification: opens on page one" "Mic: stays on the last page" "Reply: quotes the screen"
card "Full notes" body="Everything in build 332" cta="Open" url=https://www.yuigui.com/progress
```
````

### showlink-demo-page (pass)

**Chris:** Is there a demo of the compare card? (What you just looked up: yes, https://www.yuigui.com/playground?demo=show-here. It shows a slider between a before and an after shot, with Side and Toggle modes. Shots: /demo/before_room.jpg and /demo/after_room.jpg.)

Good: The demo itself: a compare of the two shots. Not a card that only links to the playground.

````
Yes, here it is live, using the demo room shots.

```yui
compare /demo/before_room.jpg /demo/after_room.jpg "Room"
card "Compare demo" body="Side and Toggle modes" cta="Open playground" url=https://www.yuigui.com/playground?demo=show-here
```
````

### showlean-waiting (pass)

**Chris:** What are you waiting on me for with this? (What you just looked up: the site refresh card is done except before and after shots of the hero for the progress page. Page: https://www.yuigui.com/progress. Nothing else is open.)

Good: The ask drawn here (a sketch with the missing before and after slot, or a camera to snap it). At most a small link under it.

````
Nothing from you.

```yui
sketch "Site refresh" frame=window
row "Card: done"
row "Hero before/after shots: mine" +hi note="not made yet"
row "Anything else: nothing open"
```
````

### showlean-new-hero (FAIL)

**Chris:** What does the new hero look like? (What you just looked up: it is on https://www.yuigui.com, top of the page. It has a bigger headline and one button, Get Yui, where there were three buttons.)

Good: The hero drawn in a sketch phone, before and after. At most a small link under it.

- words: 33 > 25

````
I don't have the page's exact wording in this thread, so this shows only what you described.

```yui
sketch "yuigui.com hero" frame=window
row "Headline" note="smaller"
row "Button 1" +button +x
row "Button 2" +button +x
row "Button 3" +button +x
after
row "Headline" +hi note="bigger"
row "Get Yui" +button +hi note="the only button"
```

If you want the real headline text and a screenshot, I can pull the page again.
````

### showpick-four-looks (pass)

**Chris:** Show me the four looks again. (What you just looked up: the demo page is https://www.yuigui.com/playground?demo=shader-look. The four dark shots are already on disk: /Users/urzas/.hermes/kanban/artifacts/t_b8ab6ac3/1-currents-dark.png, 2-terrain-dark.png, 3-dots-dark.png, 4-type-dark.png, same folder.)

Good: A gallery of the four shots with +pick, so the choice is on the phone. A site link only as a small button under it, never alone.

````
Here are the four again. Tap the one for the hero.

```yui
gallery /Users/urzas/.hermes/kanban/artifacts/t_b8ab6ac3/1-currents-dark.png /Users/urzas/.hermes/kanban/artifacts/t_b8ab6ac3/2-terrain-dark.png /Users/urzas/.hermes/kanban/artifacts/t_b8ab6ac3/3-dots-dark.png /Users/urzas/.hermes/kanban/artifacts/t_b8ab6ac3/4-type-dark.png +pick
```
````

### showpick-two-looks (pass)

**Chris:** Show me the two card styles again so I can pick. (What you just looked up: playground demo https://www.yuigui.com/playground?demo=card-style. Shots: /demo/s1.jpg Soft, /demo/s2.jpg Sharp.)

Good: A gallery or compare of the two shots with the pick right there. Not a card that only opens the playground.

````
Here are both card styles side by side.

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
