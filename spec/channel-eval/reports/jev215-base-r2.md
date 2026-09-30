# Channel eval: jev215-base-r2

Guide v43+22b9cd60 (4614 words), model claude-sonnet-5-5, 2026-09-30T16:16.

**75/88 passed (85%).**

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
| report | 4/5 |
| idea | 1/2 |
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
| report-pages-picture | FAIL | screen: no ```yui block; fence: Yui Lines outside the ```yui block; need: none of [deck plan]; words: 227 > 50; page picture: no sketch right after a page in a deck or plan |
| menu-shortcut | pass |  |
| restyle-app-autumn | pass |  |
| idea-shapes-heatpump | FAIL | words: 49 > 45 |
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
| music-keys-scale | FAIL | preset: chords not in [keys say card save loop] |
| music-chords-song | FAIL | words: 42 > 30 |
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
| showlean-new-hero | FAIL | words: 27 > 25 |
| showpick-four-looks | pass |  |
| showpick-two-looks | pass |  |
| showpick-only-url | pass |  |

## Transcripts

### workout-leg-day (pass)

**Chris:** Leg day. I have 40 minutes, home gym.

Good: A short line, then the session on screen (a checklist or a card) with a way to start (ask or timer). No interrogation: he already said time and gear.

````
Built for 40 minutes, with the load kept challenging using tempo and single-leg work.

```yui
list "Leg day, 40 min" "Warm-up, 5 min: bodyweight squats, glute bridges, leg swings" "Bulgarian split squat, 4x8/leg, 3 sec down, rest 60s" "DB Romanian deadlift, 4x10, slow lowering, rest 60s" "Superset: bench step-ups 3x10/leg + goblet squat 3x12, rest 45s" "Single-leg hip thrust on bench, 3x12/leg" "Standing calf raises, 3x15, pause at the top" "Finisher: wall sit to failure" +check
save workout
```

Use the heaviest dumbbells on the RDLs, and go lighter on the split squats and step-ups.
````

### workout-tabata (pass)

**Chris:** Give me a 10 minute tabata finisher, I'm ready now.

Good: A timer with work/rest x rounds (it goes full screen by itself) and maybe the move list. No questions first.

````
Two 4-minute Tabata blocks with a 2-minute break. Block 1 starts now.

```yui
list "Finisher, 10 min" "Block 1: DB thrusters, 25-35 lb, 8 rounds" "Rest: 2:00, shake it out" "Block 2: burpees / mountain climbers, alternate rounds" +check
timer 20/10x8 "Block 1: DB thrusters"
```
````

### workout-plank (pass)

**Chris:** plank hold, 2 min

Good: One timer line. Almost no chat text.

````
Two minutes, let's go. Keep hips level and squeeze glutes.

```yui
timer 2m Plank
```
````

### workout-gear-question (pass)

**Chris:** I want to train today but I'm at my mom's place, not sure what she has.

Good: Offer the likely gear as a pick with +other, or a camera to snap what is there. One question, not a form.

````
Good, we can make it work with almost nothing. What's around?

```yui
pick "What can you find?" "Chairs or a sturdy table"|"Stairs"|"Backpack or heavy bags"|"Water jugs or cans"|"Towels"|"Just my body" +other
```
````

### checkin-morning (pass)

**Chris:** morning check-in

Good: Sleep, soreness and energy as sliders or a short form (quoted title), or a plan that walks them one at a time, or the saved `flow workout-checkin` (it asks the same). Not a wall of questions in text.

````
Morning, Chris. Quick check-in so I can shape today.

```yui
flow workout-checkin
```
````

### checkin-evening-voice (pass)

**Chris:** I want to do an end of day brain dump but I'm too tired to type.

Good: A mic, maybe with +auto. One short line.

````
Talk it out, I'll sort it into tasks, follow-ups, and things to drop.

```yui
mic "Brain dump: whatever's on your mind" +auto
```
````

### meal-log-no-photo (pass)

**Chris:** Can you log my lunch? I'm about to eat.

Good: A camera to snap the plate (the cheapest way to log), maybe a mic as an alternative.

````
Snap it or tell me what's on the plate.

```yui
camera "Snap your lunch"
mic "Or just tell me what you're eating"
```
````

### today-plan (pass)

**Chris:** What should I do today?

Good: Without calendar access it proposes a shape for the day or asks one thing (energy, top priority) as buttons. Remembers Mick at 2 pm. Not a text essay.

````
I haven't pulled your calendar or inbox yet, so this is a skeleton built around the fixed point: Mick's pickup at 2 pm.

```yui
list "Today" "Home gym, 45 min (push day: bench, DB press, bands)" "Deep work block, 2 hrs, before noon" "Email and errands sweep" "Leave for Mick's pickup by 1:40 pm" "Evening with Mick" +check
choose "Want me to fill it in?" "Check calendar and email"|"Just the workout"|"Plan around errands" +other
```
````

### schedule-call (pass)

**Chris:** Set up a call with Matt next week, 30 minutes.

Good: Offer a few slots as buttons (avoiding 1:30 and 2 pm) with +other. One question.

````
I can't see your calendar from here, so tell me what works and I'll draft the invite for Matt. Assuming next week means Oct 5-9.

```yui
plan "Call with Matt, 30 min" submit="Draft the invite"
choose "Which days work?" Mon|Tue|Wed|Thu|Fri +other
choose "What time of day?" "Morning (before 12)"|"Midday (12-2)"|"Afternoon (after 2)" +other
choose "How do you meet?" Zoom|"Google Meet"|Phone +other
```
````

### decision-three-options (FAIL)

**Chris:** Help me pick which to do first this afternoon: invoice Heathos, reply to Paul about Plannix, or fix the Yui site footer.

Good: A recommendation plus the three as buttons (or an ordered list with +check). No essay.

- screen: no ```yui block
- need: none of [choose ask list card]

````
Invoice Heathos first. It's quick, it's money, and it's a chore that only gets more awkward the longer it sits.

Then reply to Paul, since he's waiting on you. The footer goes last, because it blocks nobody.

Mick is out at 2, so the invoice and Paul's reply should both be done before pickup. The footer can wait until after.
````

### list-groceries (pass)

**Chris:** Make me a grocery list for high protein meals this week.

Good: A list with +check, a title, and items that fit on a phone.

````
Here's a week of high-protein staples, roughly 150g+ protein a day.

```yui
list Protein "Chicken breast, 3 lb" "Lean ground turkey, 2 lb" "Salmon fillets, 1.5 lb" "Eggs, 2 dozen" "Canned tuna, 4" "Deli turkey, 1 lb" +check
list "Dairy" "Greek yogurt, plain, 32 oz" "Cottage cheese, 24 oz" "Shredded cheese" "Milk, 1 gal" +check
list "Carbs and pantry" "Rice, brown" "Oats" "Whole wheat wraps" "Black beans, 2 cans" "Lentils" "Protein powder" "Peanut butter" +check
list "Produce" "Spinach" "Broccoli" "Bell peppers" "Bananas" "Berries" "Avocados" "Sweet potatoes" +check
save grocery
```

Staples like oats, rice, and protein powder may already be in your pantry, so check those first.
````

### list-packing (pass)

**Chris:** Mick has a field trip tomorrow to the science museum. Packing list?

Good: A checklist. One line of text.

````
Here's what Mick needs for tomorrow.

```yui
list "Mick: science museum" "Backpack" "Water bottle (labeled)" "Lunch + snack, no nut items" "Light jacket (museums run cold)" "Comfy closed-toe shoes" "Permission slip / money, if required" "Notebook + pencil" "Trip shirt, if the school asked for one" +check
```

I can set a reminder tonight to pack lunch and check the bag.
````

### data-weight-trend (pass)

**Chris:** How's my weight trending? Last 7 days: 181, 180.6, 180.2, 179.9, 180.1, 179.4, 178.9

Good: A stat with a delta and a spark, or a line chart. One line of read-out, not a table in text.

````
Down 2.1 lb in a week, a steady slide with one small bump on day 5.

```yui
stat 178.9lb Weight delta=-2.1 spark=181|180.6|180.2|179.9|180.1|179.4|178.9
chart line "Last 7 days" x=1|2|3|4|5|6|7 y=181|180.6|180.2|179.9|180.1|179.4|178.9
```

That pace is a touch fast, since 1 to 2 lb a week is the sweet spot and some of this is likely water. Keep protein up and don't cut calories further.
````

### focus-second-screen (pass)

**Chris:** Start a 25 minute focus timer, and while it runs let's talk through the Plannix launch checklist.

Good: `>2 timer 25m Focus` (second screen) or a timer, plus the start of the checklist.

````
Timer's running. I don't have the Plannix checklist yet, so where do you want to start?

```yui
>2 timer 25m Focus
>2 talk
choose "Start from" "I'll paste it"|"Build one from scratch"|"Just the blockers" +other
```
````

### teach-compound-interest (pass)

**Chris:** Explain compound interest to Mick, he's 9. Make it something he can play with.

Good: Something interactive: a calc with sliders, or a short deck with a quiz question.

````
Here's a game for Mick: money that has babies.

```yui
>full
deck "Money That Has Babies"
page "Your money grows babies" body="Put $10 in a magic piggy bank. After one year it gives you 10% extra: $1. Now you have $11."
shapes
shape circle $10 +grow
shape arrow
shape blob $11 +pulse tone=mint
page "The babies have babies" body="Year two, the bank pays extra on all $11, even the baby dollar. That's $1.10, not just $1. Your money's kids are earning too."
shapes
shape blob $11
shape arrow
shape blob $12.10 +pulse tone=butter
page "Wait long enough and it goes wild" body="Same $10, never touched."
chart line "$10 left alone" x=Y0|Y10|Y20|Y30 y=10|26|67|174
choose "What makes it grow the most?" "Waiting longer"|"Spending it fast"|"Hiding it in a sock" answer="Waiting longer"
page "Now you drive" body="Slide the starting money, the bank's extra, and the years. Watch the total."
calc f="A = P*(1+r)^t" P=10-100@10 r=0-0.2@0.05 t=0-30@5
choose "What next?" "Quiz me again"|"Show me with Pokémon cards"|"Why do you ask?"
end
```
````

### theme-autumn (pass)

**Chris:** Make yourself look more autumn.

Good: `theme autumn` and one short line.

````
Here's me in autumn.
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
A deload week is a planned lighter week of training, usually cutting your weights or volume by about 40-50% while keeping the same movements, so your body can recover and absorb the work you've been doing. You typically take one every 4-8 weeks, and you come back stronger rather than losing progress.
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
Quick setup so the week fits your real schedule.

```yui
plan "Your week" submit="Build my week"
choose "Which week?" "Rest of this week"|"Next week" 
pick "Workout days (pick 4)" Mon|Tue|Wed|Thu|Fri|Sat|Sun
choose "Mick pickups at 2 pm" "I do every day"|"Some days someone else"|"Not every day he needs one" +other
pick "Deep work, best time" "Morning 9-12"|"Late morning 10-1"|"After pickup 3-5"|"Evening"
choose "Meals" "Plan all meals"|"Dinners only"|"Dinners plus lunch prep" +other
form "Fixed stuff" meetings:voice errands:voice diet:voice
end
```
````

### flow-onboard-goal (FAIL)

**Chris:** I want to get back in shape before the holidays. Where do I start?

Good: The first question of a flow as buttons (goal or days per week), or a short plan. Not a 6-field form.

- preset: flow not in [choose ask pick slide plan form card mic page]
- need: none of [choose ask pick slide plan]

````
Good timing, you've got about two months to build a solid base. A few quick questions so I can build your plan around your home gym and your schedule.

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
Overnight: all clear.
```yui
sketch "Overnight" frame=window
row "Backups: ran 3:10 am"
row "Sites: 4 of 4 up"
row "Errors: none"
row "Renewals: 2 due Friday" +hi note="yuigui.com, postscarcity.ai"
```
````

### dead-logged-water (pass)

**Chris:** Log 2 liters of water for today.

Good: Confirms in a line or a stat. Nothing to tap unless it does something ("Add 500 ml"); never a lone "Nice" or "Got it".

````
Logged, 2 liters of water for today.

```yui
stat 2L Water delta=+2
```
````

### dead-plan-submit (pass)

**Chris:** Walk me through planning a weekend trip: where, budget, and dates. I'll answer on screen.

Good: A plan with one step per question, ending in a submit named for what happens ("Send", "Plan it", "Find trips"), not "Create project".

````
```yui
plan "Weekend trip" submit="Plan it"
choose "Where to?" "Florida Keys"|"Orlando"|"St. Augustine"|"Naples / Sanibel"|"Charleston or Savannah" +other
choose "Budget for the whole trip?" "Under $500"|"$500-1,000"|"$1,000-2,000"|"$2,000+"
choose "Which weekend?" "Oct 3-4"|"Oct 10-11"|"Oct 17-18" +other
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
page "Pricing page is slow" body="It takes 4.1 seconds to load on a phone, and most of that is two uncompressed hero images. Compressing them is the biggest speed win on the page."
page "Signup drops UTM tags" body="The form loses the campaign tags, so new signups can't be tied to the ad or email that brought them in. Until it's fixed, attribution is blind."
page "FAQ block is pulling its weight" body="The new FAQ gets the most clicks after the hero. It's working, so leave it where it is."
choose "What do we fix first?" "Hero images"|"UTM tags"|"Both together" +other
choose "When do we ship?" Today|Tomorrow
end
```
````

### flow-two-questions-one-plan (pass)

**Chris:** Before you write my new program I want to look over what you changed from last month. You moved squats to Monday, cut the Friday run to 20 minutes, and added a deload in week 4. Show me that, then ask me how many days I can train and what equipment I have now.

Good: One plan: pages with the three changes, then days per week and equipment as steps, one submit.

````
Here are the three changes as you listed them. I don't have last month's original in front of me, so I can't show the old squat day or run length.

```yui
plan "Last month's changes" submit="Build my program"
page "What changed" points="Squats: moved to Monday"|"Friday run: cut to 20 min"|"Week 4: deload added"
choose "Days per week?" 2|3|4|5|6
pick "Equipment now?" "Dumbbells to 50 lb"|Bench|Bands|"Pull-up bar" +other
end
```
````

### save-reusable-workout (pass)

**Chris:** Give me a quick 20 minute Tabata I can come back to on busy days.

Good: A Tabata timer (it takes the stage on its own) and a `save` with a short name so it lands on the shelf. No re-asking what they want.

````
20 minutes, 5 movements, 4 minutes each (20 sec on, 10 off, 8 rounds). Switch moves every 8 rounds.

```yui
list "Tabata 20" "0-4: Goblet squats" "4-8: Push-ups" "8-12: DB swings" "12-16: Reverse lunges" "16-20: Mountain climbers" +check
timer 20/10x40 "Tabata 20"
save workout
```
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
Your list is on screen 2. Swipe over any time to check things off.

```yui
>2 list Shopping Eggs Spinach Rice Gochujang Carrots +check
choose "Add a protein?" "Beef"|"Tofu"|"Just eggs" +other
```
````

### project-timeline (pass)

**Chris:** Where are we on the site rebuild? We shipped the new hero Monday and the pricing page Tuesday, the blog migration is running now, and the contact form and analytics are next. Show me.

Good: One `timeline` with the two shipped items as `done` rows (at=Mon, at=Tue), the blog migration as `now`, then the contact form and analytics as `next`, in that order. At most a short line of chat and maybe one question about what to pull next.

````
Two shipped, blog migration running, two queued.

```yui
timeline "Site rebuild"
done "New hero shipped" at=Mon
done "Pricing page shipped" at=Tue
now "Blog migration running"
next "Contact form"
next "Analytics"
```
````

### game-offer (pass)

**Chris:** Build's still going. Play a quick game of tic-tac-toe with me?

Good: One `game tictactoe` line and at most a few words. No board drawn by hand, no list of cells.

````
Sure, you're X, go first.
```yui
game tictactoe "Beat me"
```
````

### report-card-done (pass)

**Chris:** The worker just finished card INT-18 on the board. Its handoff summary: "A2A bridge: add any A2A agent to Yui by its Agent Card. node adapters/a2a/yui-a2a.ts pair <code> --card <url>, then run; add --card <url> puts more agents on the same machine. Runtime-neutral TypeScript client (src/a2a.ts + src/sse.ts, fetch and an SSE parser only, so the hosted step runs the same code in a Durable Object): A2A 1.0 SendMessage / SendStreamingMessage / SubscribeToTask / GetTask / CancelTask and 0.3 message/send, message/stream, tasks/resubscribe, tasks/get, one version-free shape for callers. The bridge keeps the relay's rules (delivered on pickup, handled after the answer, outbox on disk, one turn at a time per agent). Tests: client.test.ts 42/42; sdk_interop.test.ts 4/4 against the official a2a-sdk servers (1.1.5 and 0.3.26); a2a_e2e.py 66/66 live on throwaway accounts (kill -9 mid-task resumes the same task and answers once) plus the phone run 6/6 on the iPhone 18 Pro sim. No app binary change (INT-18)" Tell me what shipped.

Good: One short line, a card with the headline (A2A agents can join Yui), and the detail as a deck of short pages (what it does, how to add one, the test counts as points). No paragraph relaying the summary.

````
The A2A bridge is done: any A2A agent can now join Yui by its Agent Card, with no app update needed.

```yui
card "A2A bridge" body="Add any A2A agent by its Agent Card. No app binary change."
deck "What shipped" +inline
page "How to add an agent" body="Run node adapters/a2a/yui-a2a.ts pair <code> --card <url>, then start it. Add another --card <url> to put more agents on the same machine."
page "How it's built" body="A runtime-neutral TypeScript client using only fetch and an SSE parser, so the hosted step can run the same code in a Durable Object. It speaks A2A 1.0 and 0.3 behind one shape, and keeps the relay's rules: delivered on pickup, handled after the answer, outbox on disk, one turn at a time per agent."
page "Tested" points="Client unit tests 42/42"|"Official a2a-sdk servers 4/4 (1.1.5 and 0.3.26)"|"Live end to end 66/66, kill -9 mid-task resumes the same task and answers once"|"Phone run 6/6 on the iPhone 18 Pro sim"
choose "What next?" "Pair an agent"|"Plan the hosted step"|"Why do you ask?"
end
```
````

### report-long-walkthrough (pass)

**Chris:** Walk me through everything that changed in how Yui delivers messages this week: replies are exactly-once both ways with acks, a reply outbox on disk, presence reads online/asleep/offline per agent, pushes skip a phone already watching the thread, agents can be muted, and a paired agent whose gateway never started now says 'not listening yet' with the restart command.

Good: A deck (or plan) of short pages, one change per page, under one short chat line. Not a long bulleted or prose message.

````
Six changes, three themes: delivery, presence, quieter pushes.

```yui
>full
deck "Yui delivery, this week" +inline
page "Nothing lost, nothing doubled" body="Replies are exactly-once in both directions, and every one is acked. Each reply is written to an outbox on disk first, so a crash or dropped connection resends it until the ack arrives, and never twice."
shapes "Reply path" caption="Saved to disk, sent, resent until acked."
shape circle Phone
shape arrow
shape pill Outbox +fill
shape arrow
shape circle Agent +pulse
page "Who's listening" body="Each agent now shows online, asleep or offline. A paired agent whose gateway never started says 'not listening yet' and shows the restart command, instead of looking offline."
sketch "Presence" frame=window
row "Agent A: online" note="example"
row "Agent B: asleep" note="example"
row "Agent C: offline" note="example"
row "Agent D: not listening yet" +hi note="restart command shown"
page "Quieter pushes" body="If your phone is already watching the thread, the push is skipped. You can also mute an agent so it stops pushing."
sketch "Pushes" frame=bubble
row "Push while you're in the thread" +x note="skipped now"
row "Push to muted agent" +x note="muted"
after
row "Push when thread is closed" +hi note="still sent"
choose "What next?" "How acks resend"|"How muting works"|"Why do you ask?"
end
```
````

### talk-keep-plan-editable (pass)

**Chris:** Lay out my runs for this week somewhere I can keep looking at it, and I'll tell you what to change as the week goes.

Good: The week on a page (`>2 list@runs Runs "Tue 5k"|"Thu 5k"|"Sat 10k" +check`) with `>2 talk` so they can type changes right there, and one short line in the chat.

````
Your runs are on screen 2. I guessed at the mileage since I don't have your recent runs, so tell me what to change.

```yui
>2 list@runs "This week's runs" "Tue: Easy 30 min, conversational pace" "Thu: Intervals, 10 min warm-up, 5 x 3 min hard / 2 min easy, 10 min cool-down" "Sat: Long run 45 min, easy pace, done before Mick's day" +check
>2 talk
save runs
```
````

### report-draw-change (pass)

**Chris:** What changed in how you word your updates to me? You used to write things like "Parked YUI-83, feedback #2291 attached". Now you just say what the card is, like "Parked the drawing card, your note is on it". Show me the difference, don't describe it.

Good: One short line and a `sketch` (a bubble fits) with the old wording struck out (+x) and the new wording highlighted (+hi), ideally split with `after`, a note or two. No paragraph explaining it.

````
Ids and ticket numbers are out. Plain words in.

```yui
sketch "Example: a parked-card update" frame=bubble
row "Parked YUI-83, feedback #2291 attached" +x note="ids mean nothing to you"
after
row "Parked the drawing card, your note is on it" +hi note="says what it is"
```
````

### draw-screen-fix (pass)

**Chris:** The build-ready screen shows the headline, two lines of notes, then a Got it button and an Install button. Which of those should go, and why? Show me on the screen itself.

Good: A `sketch` of the screen (frame=phone) with the headline and notes as rows, Got it as a +button row struck out (+x) with a short note (it does nothing), Install as a +button row highlighted. At most a line of chat.

````
Got it goes. It only acknowledges, and Install is the one button that does something.

```yui
sketch "Build-ready screen" frame=phone
row "Build 82 is ready"
row "Adds A2A agents by Agent Card. Tested, all passing."
row "Got it" +button +x note="only acknowledges"
row "Install" +button
after
row "Build 82 is ready" +hi
row "Adds A2A agents by Agent Card. Tested, all passing."
row "Install" +button +hi note="the one action"
```
````

### report-pages-picture (FAIL)

**Chris:** Walk me through the three changes to how you write updates to me this week, one at a time: you name cards in plain words instead of ids like YUI-83, a long update comes as pages instead of a wall of text, and cards no longer end in a 'Got it' button that does nothing. For each one, show me what it looked like before and after.

Good: One short line and a deck of three pages, one change each, and each page's picture a sketch right after it: the old wording or button struck out (+x), the new one highlighted (+hi), ideally split with `after`. No paragraph.

- screen: no ```yui block
- fence: Yui Lines outside the ```yui block
- need: none of [deck plan]
- words: 227 > 50
- page picture: no sketch right after a page in a deck or plan

````
Three changes, one page each, before and after.

````
```yui
>full
deck "How my updates changed"
page "Plain words, not ids" body="Cards get named for what they are, so you never have to decode a ticket number."
sketch "Parking a card" frame=bubble before=Before
row "Parked YUI-83 in the backlog" +x note="an id means nothing"
after After
row "Parked the drawing card in the backlog" +hi note="plain words"
page "Long updates come as pages" body="A long update is a short line, then a few pages you tap through, each with one point."
sketch "A long update" frame=phone before=Before
row "Build 82 is ready. Latest change: A2A bridge, pair it with node yui-a2a.ts, tests client 42/42, interop 4/4, e2e 66/66, plus the drawer fix and..." +x note="a wall of text"
after After
row "Build 82 is ready." +hi note="one line up top"
row "A2A agents" +button note="page 1"
row "Tested: 42/42, 4/4, 66/66" +button note="page 2"
page "No dead 'Got it' buttons" body="A card only gets a button when tapping it does something. Otherwise it's a plain note."
sketch "A finished-task card" frame=phone before=Before
row "Invite declined. Team sync, Friday 3 pm" 
row "Got it" +button +x note="does nothing"
after After
row "Team sync, Friday 3 pm: declined" +hi note="no button, nothing to tap"
choose "Want to see one live?" "Send a sample update"|"Looks good"|"Why do you ask?"
end
```
````
````

### menu-shortcut (pass)

**Chris:** I log breakfast every single morning. Give me a one-tap way to do it from now on.

Good: A shortcut in the drawer (`menu shortcut@breakfast "Log breakfast" say="Log breakfast: "`) and one short line saying where it lives. No button that only acknowledges.

````
Done. "Log breakfast" is now a shortcut on your home screen and in your drawer. One tap sends it, and I'll open the camera so you can snap your plate.

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

### idea-shapes-heatpump (FAIL)

**Chris:** How does a heat pump heat the house when it's cold outside? Quick, I'm on my phone.

Good: One short line and a `shapes` diagram with a caption: cold outside air, the refrigerant loop picking up heat and the compressor squeezing it hotter, heat let out inside, arrows between, labels a word or two. No paragraph, no generated image.

- words: 49 > 45

````
It moves heat rather than making it. Refrigerant boils at very low temperatures, so it absorbs heat even from cold air, and the compressor concentrates that heat and releases it indoors.

```yui
shapes "Heat pump, winter" caption="Refrigerant grabs outdoor heat, the compressor boosts it, the house gets it."
shape circle "Cold air"
shape arrow
shape box Refrigerant +fill
shape arrow
shape pill Compressor +pulse
shape arrow
shape blob House tone=butter
```

Below about 20°F, most units get less efficient, and backup electric heat kicks in. Florida rarely gets there.
````

### idea-shapes-flywheel (pass)

**Chris:** Explain the flywheel idea for Yui in one picture: more people use it, we see which screens agents reach for, the good ones become presets, agents get better, more people use it.

Good: A `shapes` loop (placed with at= or a row with arrows back to the start) with a caption, maybe one +pulse. Words kept to a line.

````
Each lap makes the next one faster.

```yui
shapes "The Yui flywheel" caption="More people use Yui, we see which screens agents reach for, the good ones become presets, agents get better, and more people come."
shape circle "More people" at=1,1 +grow
shape arrow
shape box "Screens seen" at=8,1
shape arrow
shape pill "Presets" at=8,5 tone=mint
shape arrow
shape blob "Better agents" at=1,5 tone=butter +pulse
shape arrow
shape text "back to start"
```
````

### teach-one-screen (pass)

**Chris:** Explain compound interest to me. Show me the math and let me play with the numbers.

Good: One short line, then `>full` and ONE deck: a page per idea, the diagram, math, chart and stat each right after its page as its picture, a quiz, the calc on the last page. Nothing loose in the chat or on the stage beside the deck, no `close` after it.

````
Here's the lesson. Slide the numbers on the last page.

```yui
>full
deck "Compound interest"
page "Interest that earns interest" body="Each year's interest joins the balance, so next year you earn on the bigger number."
shapes
shape circle "$100" +grow
shape arrow
shape blob "$110" +pulse tone=mint
shape arrow
shape blob "$121" tone=mint
page "The math" body="Each year multiplies the balance by (1 + r). After t years, that's t multiplications."
math A_1 = P(1+r) \\ A_2 = P(1+r)^2 \\ A_t = P(1+r)^t
page "It bends upward" body="$100 at 10% a year. The second decade adds far more than the first."
chart line "$100 at 10% a year" x=Y0|Y10|Y20 y=100|259|673
choose "At 10%, about how long to double $100?" "7 years"|"10 years"|"20 years" answer="7 years"
page "Try it" body="P is your starting amount, r the yearly rate, t the years."
calc f="A = P*(1+r)^t" P=100-1000@100 r=0-0.2@0.05 t=0-20@10
choose "What next?" "Add monthly deposits"|"Compare to simple interest"|"Why do you ask?"
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
Five quick questions, one per screen.

```yui
plan "Personal brand site" submit="Send answers"
choose "What's the site's main job?" "Win clients"|"Get hired"|"Grow an audience"|"Sell something"|"Show my work" +other
choose "Who should land on it?" Clients|Employers|Peers|"Press and hosts"|"General public" +other
pick "What belongs on it?" About|Projects|Writing|Newsletter|Speaking|Contact|Shop|Testimonials +other
choose "What should it feel like?" "Minimal and clean"|"Bold and loud"|"Warm and personal"|"Technical and sharp" +other
form "In your own words" pitch:voice link:"Site or profile you like"
end
```
````

### short-status-latest-build (FAIL)

**Chris:** Am I on the latest build? (What you just looked up: the newest build on TestFlight is 160, live since 12:58 pm today. This phone reports build 160. An iPad on the same account reports build 135. Five changes wait on main for the next release, 0.3.2: keys and chords in the music tools, and a faster Send tap that is still being built.)

Good: One line: yes, build 160, the newest; the iPad is on 135. No deck, no pages, no 'what's coming' tour (YUI-118, feedback AJq7CcQS8fyM).

- preset: sketch not in [card say ask choose stat list]
- preset: row not in [card say ask choose stat list]

````
Yes, this phone has the newest build.

```yui
sketch "Builds" frame=window
row "Phone: 160, newest"
row "iPad: 135" +hi note="behind"
row "0.3.2: five changes on main" note="not released"
```
````

### short-release-go-ahead (pass)

**Chris:** OK, yeah go ahead and release that. I want to play with the music tools. (What you just did: started the 0.3.2 release; a worker is building it now and it reaches TestFlight in about 40 minutes. It leaves out the faster Send tap, which is not done yet.)

Good: One line: 0.3.2 is building, on TestFlight in about 40 minutes with keys and chords; the Send tap fix waits. No deck, no 'what happens next' pages (YUI-118).

````
0.3.2 is building now and should reach TestFlight in about 40 minutes, with keys and chords included. The faster Send tap isn't done, so it's not in this one.
````

### doing-long-turn (FAIL)

**Chris:** What needs me today? Check my calendar, my mail and the board. (This turn runs on the host with tools and takes about a minute: calendar first, then mail, then the board. Write everything you send during the turn, in order, as one reply. What the tools returned: gcal_list_events: 10:00 call with Dana (30 min), 4:00 design review. gmail_search: two need a reply today, the venue contract from Sam and a question about an invoice. kanban board: one card waits on you, t_627321c6 (YUI-SHIP 0.3.3), asking whether to ship without the tuner.)

Good: doing lines as it goes, plain words and a step ("Reading your calendar" 1/3, "Checking your mail" 2/3, "Looking at the board" 3/3), no card ids or tool names; then the answer: two calls, two replies to send, one choice on the tuner (YUI-63).

- preset: sketch not in [card say ask choose list check timeline stat deck page done now next]
- preset: row not in [card say ask choose list check timeline stat deck page done now next]
- doing: 0 doing lines with words, want 2

````
Four things need you today.

```yui
sketch "Today" frame=window
row "10:00 Call with Dana: 30 min"
row "4:00 Design review"
row "Venue contract: reply to Sam" +hi note="needs reply today"
row "Invoice question: reply" +hi note="needs reply today"
row "Ship 0.3.3 without the tuner?" +hi note="board waits on you"
choose "Ship 0.3.3 without the tuner?" "Ship it"|"Hold for tuner"|"Not sure" +other
```
````

### music-jam-beat (pass)

**Chris:** Trying to get back into drumming. Give me a simple boom bap beat around 90 I can mess with.

Good: One `loop` line near 90 BPM with a boom bap pattern in `p=` that plays (`+play`), a short line at most. No pattern written out in words, no drum tab, no advice paragraph.

````
Here's a 90 BPM boom bap. Kick on 1, a push after 2, snare on 2 and 4. Tap cells to change it while it plays.

```yui
loop 90 "Boom bap" swing=56 p=x..x.x..|..x...x.|........|xxxxxxxx +play
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
Phase one moves the conversation onto the full screen. Here are the three parts.

```yui
say "Answers take the whole screen. Chat is the record, top right."
sketch "Answer screen" frame=phone
row "Yes. Build 160, the newest." +hi note="one chunk, full screen"
row "Chat" +button note="top right, the record"
say "The bottom bar is talk first."
sketch "Bottom bar" frame=phone
row "+   T   Mic" +button +hi note="big mic; T opens text; + attaches"
say "Settings move to the top left."
sketch "Top left" frame=phone
row "≡  Agent picker" +button +hi note="hamburger opens settings"
```
````

### show-new-layout (pass)

**Chris:** Show me the bigger microphone. Does the text field look better? I want to see the new layout of big microphone, T for text and + to attach. Remember, I want you to show me this. (What you know: phase one of the full-screen change. Answers play as full-screen chunks, and the chat is just the record, top right. Bottom right: a bigger mic, a T that opens the text field, and a + for attachments, including images. Settings sit behind a hamburger at top left, beside the agent picker.)

Good: The bottom bar drawn: `sketch frame=phone` with `+button` rows for +, T and the big mic, ideally before and after (the old always-there field struck out). Not a description of it (feedback AL1My-stUBnvtXD2WKV7ec8).

````
Yes, the text field looks cleaner: it only opens when you tap T.

```yui
sketch "Full-screen layout" frame=phone before=Now
row "Text field always open  Mic" +button +x note="field takes the bar"
after New
row "☰   Agent picker   Chat" +hi note="settings left, record right"
row "The answer fills the screen" +hi note="full screen"
row "+    T    ( Mic )" +button +hi note="big mic"
```

```yui
sketch "Tap T" frame=phone
row "+    T    ( Mic )" +button note="closed"
after
row "Say something nice...  Send" +hi note="field opens"
row "+    T    ( Mic )" +button
```
````

### music-keys-scale (FAIL)

**Chris:** Learning piano again. Give me something to noodle around A minor pentatonic on.

Good: One `keys Am pentatonic` line (a title or +send is fine), a short line at most. No list of note names, no fingering advice paragraph.

- preset: chords not in [keys say card save loop]

````
Here's a keyboard locked to A minor pentatonic (A C D E G), with a slow backing beat.

```yui
keys Am pentatonic
loop 84 "Slow backing" p=x.....x.|....x...|x.x.x.x. rows=kick|snare|hat
chords Am|C|G|Em
```
````

### music-chords-song (FAIL)

**Chris:** I want to strum along to one of those four chord pop songs on my uke. G is a good key for me.

Good: One `chords` line in G (`chords G I-V-vi-IV` or `chords G|D|Em|C`), a short line at most. No chord names in a paragraph, no chord diagrams in text.

- words: 42 > 30

````
G, D, Em, C is the classic I-V-vi-IV. Strum down, down-up, up-down-up, four beats a chord.

```yui
chords G I-V-vi-IV
```

That loop fits "Let It Be", "I'm Yours", "No Woman No Cry" and "Someone Like You" once you're in G. Want a lyric sheet for one?
````

### music-tuner-guitar (pass)

**Chris:** Just restrung my acoustic and it sounds awful. Help me get it in tune.

Good: One `tuner guitar` line, a short line at most. No list of string notes and frequencies, no advice on tuning by ear.

````
New strings stretch, so expect to retune a few times. Pull each one gently at the 12th fret first, then start with the low E.

```yui
tuner guitar
```
````

### music-metronome-practice (pass)

**Chris:** Working on my strumming timing. I want to practice slow, like 70 bpm in 4/4.

Good: One `metronome 70` line (beats=4 is fine), a short line at most. No paragraph of practice tips, no counting in words.

````
Here's a 70 bpm click. Count 1-2-3-4 and land each down-strum on the beat.

```yui
metronome 70
```
````

### explain-mongols-geography (pass)

**Chris:** All right, can you give me a brief geographic explanation of the Mongols?

Good: One line with the answer, then one deck on `>full` where every page has its picture: the empire as a `map` (its outline in lat,lon points, Karakorum as a pin, routes east and west), the size as a `chart` or a `stat`. Not pages of text, and not the steppe drawn as dots in `shapes` (TestFlight feedback AJIE1_1Ru1V4EMgmpWZtniI: 'It's just a text bomb'; feedback AL2nKEYo on the shapes version: 'Again, not bad but this should be a Map').

````
The Mongols rose on the Central Asian steppe and built the largest contiguous land empire in history.

````yui
>full
deck "The Mongols, by the map"
page "How far it reached" body="Korea to Hungary, the Siberian forest to Persia. Karakorum sat in the middle and rode out every way."
map caption="The heartland was the steppe. Everything else was conquered from it."
area "Mongol Empire" 53,140|43,131|34.7,126.5|22.3,114|24,98|34,70|25.5,57|33,44|41,31|46,30.5|54,23|60,56|55,95 tone=butter
area Raided PL|HU +dash
pin@ka Karakorum 47.2,102.8 +pulse
route East ka|37.6,127 +arrow
route West ka|50.4,30.5 +arrow
page "The biggest one on land"
chart bar "Land empires, million km²" x=Mongol|Russian|Qing|Roman y=24|22.8|14.7|5
page "At its peak, 1279"
stat "24M km²" "A sixth of the land on Earth"
choose "What next?" "Why the steppe helped"|"The four khanates"|"Why do you ask?"
end
```
````
````

### explain-rome-rise-fall (FAIL)

**Chris:** Give me the quick version of how the Roman Empire rose and fell.

Good: A line, then a picture per part: the empire at its peak as a `map` around the Mediterranean, its size over the centuries as a `chart` (or a `timeline` on the stage), the split as an east and west area. No page that is only a heading and a paragraph.

- map: a where answer with no map

````
A city-state that conquered the Mediterranean, then split and slowly ran out of money and defenders.

```yui
timeline "Rome, rise to fall"
done "Republic founded" at="509 BC"
done "Punic Wars: Carthage destroyed, Rome rules the west Med" at="146 BC"
done "Augustus becomes first emperor" at="27 BC"
done "Peak under Trajan, about 5M km²" at="117 AD"
done "Third-century crisis: civil wars, inflation, invasions" at="235-284"
done "Empire split east and west" at="395"
done "Western Empire falls" at="476"
done "Eastern (Byzantine) Empire falls to the Ottomans" at="1453"
```
````

### explain-monsoon-how (pass)

**Chris:** Why does India get monsoons? Keep it short.

Good: One line and a picture: land heats, air rises, wet air off the ocean moves in, as a diagram in `shapes` with arrows or a `map` with the winds as routes, maybe a rainfall `chart` by month. Not a paragraph of weather words.

````
Summer sun heats India's land faster than the ocean, so warm air rises and pulls in moist ocean air, which rains out as it's forced up over the Western Ghats and Himalayas.

```yui
shapes "Why India gets monsoons" caption="Hot land pulls in wet ocean air, and it rains."
shape circle Sun
shape arrow
shape box "Hot land" +fill
shape arrow
shape pill "Ocean air" tone=mint +pulse
shape arrow
shape blob Rain tone=lavender
```
````

### where-trip-route (pass)

**Chris:** Thinking about a train trip from Lisbon to Barcelona with stops in Porto and Madrid. How does that route go?

Good: One line, then a map: pins on Lisbon, Porto, Madrid and Barcelona, a route through them with an arrow, a caption with the rough hours (a small `table` of the legs beside it is fine). Not a numbered list of legs in words.

````
Four legs, and the Porto to Madrid leg is the awkward one because there's no direct train.

```yui
map "Lisbon to Barcelona" caption="North to Porto, up to Vigo, then across Spain."
pin@li Lisbon 38.72,-9.14
pin@po Porto 41.15,-8.61
pin@vi Vigo 42.24,-8.72
pin@ma Madrid 40.42,-3.70
pin@ba Barcelona 41.39,2.17 +pulse
route "Leg 1" li|po +arrow
route "Leg 2" po|vi +arrow
route "Leg 3" vi|ma +arrow
route "Leg 4" ma|ba +arrow
table Legs Leg|Train|Time "Lisbon to Porto|Alfa Pendular|~3h" "Porto to Vigo|Celta|~2h40" "Vigo to Madrid|Alvia|~5h" "Madrid to Barcelona|AVE|~2h30"
```

Schedules on the Porto to Vigo leg are sparse (about one or two a day), so check times before you book.
````

### where-delivery-area (pass)

**Chris:** Our farm delivers CSA boxes across Vermont, New Hampshire and western Massachusetts. Can you show a new customer what that covers?

Good: One line, then a map with the delivery area filled in (VT and NH by code, western Massachusetts as lat,lon points) and the farm or the big towns as pins. Not a list of states and counties.

````
Here's where your CSA boxes go.

```yui
map "Where we deliver" caption="All of Vermont, all of New Hampshire, and western Massachusetts."
area Vermont 45.01,-73.34|45.01,-71.50|44.35,-71.65|43.8,-72.2|43.2,-72.45|42.73,-72.46|42.74,-73.27|43.6,-73.25|44.0,-73.4|44.5,-73.4 tone=mint
area "New Hampshire" 45.30,-71.10|45.01,-71.50|44.35,-71.65|43.8,-72.2|43.2,-72.45|42.73,-72.46|42.70,-71.25|43.07,-70.71|43.6,-70.95|44.0,-71.0|44.75,-71.15 tone=lavender
area "Western Massachusetts" 42.74,-73.27|42.73,-72.46|42.03,-72.55|42.05,-73.49|42.5,-73.35 tone=butter
```

The borders are approximate. I don't have exact town-by-town cutoffs for western Massachusetts, so I can add a ZIP checker if you send the list.
````

### where-quick-country (pass)

**Chris:** Where exactly is Kyrgyzstan?

Good: One line (Central Asia, between Kazakhstan and China) and a map in the chat: KG as an area with a pulse on Bishkek, neighbors faint. No deck for a quick where.

````
Central Asia, a mountainous landlocked country between Kazakhstan, China, Tajikistan and Uzbekistan.

```yui
map "Kyrgyzstan" caption="Bordered by Kazakhstan north, China east, Tajikistan south, Uzbekistan west."
area Kyrgyzstan KG tone=butter
area Neighbors KZ|CN|TJ|UZ tone=mute
pin@bk Bishkek 42.87,74.59 +pulse
```
````

### data-lunch-macros (pass)

**Chris:** Give me a quick lunch idea with 30g of protein.

Good: One line naming the lunch and a real Yui Lines table (`table Macros Food|Protein|Cal "Chicken|35g|165" ...`) or stat tiles for the macros. Not a quoted title plus `columns:` rows and `end` (GLM 5.2 on YUI-131, every row a parse error), and not a markdown table.

````
Chicken and black bean bowl: about 5 minutes, using leftover or rotisserie chicken.

```yui
table "Chicken bowl" Item|Protein "Rotisserie chicken, 3 oz|24g" "Black beans, 1/2 cup|7g" "Microwave rice, 1/2 cup|2g" "Salsa + avocado slices|1g" "Total|~34g"
```

Mick's home at 2, so this also works as a quick taco-style plate for both of you.
````

### list-no-escaped-breaks (pass)

**Chris:** What should I eat for dinner tonight? Something with protein. I'm allergic to peanuts and shellfish.

Good: A few dinners as a `list` (or cards), one per item, and a way to pick one. Never one `say` with \n breaks inside the quotes: the app shows the letter n (YUI-161, GLM 5.2 on native Basil).

````
Sheet-pan lemon-herb chicken thighs with sweet potato and broccoli. It's peanut- and shellfish-free, takes about 10 minutes of prep, and is easy for Mick to eat too.

```yui
table "Per serving (approx.)" Macro|Amount "Protein|39 g" "Carbs|42 g" "Fat|26 g" "Calories|590"
```

Roast at 425°F for 25 to 30 minutes, with the chicken and sweet potato cubes on one pan and the broccoli added for the last 12 minutes. Use olive oil, since some spice blends and sauces can hide peanut oil.
````

### items-board-cards-drawn (pass)

**Chris:** Anything waiting on me?

Good: One short line, then the two items drawn: a sketch with one row per card (title plus one fact) or a list or two cards, so he sees them. Not a paragraph counting the cards and listing what is in them.

````
Two cards are waiting on you.

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
Three changes went in.

```yui
timeline "Quote site, Sep 22-23"
done "Real brand logos on the /brands family cards" at="Sep 22-23"
done "Bigger field labels on the calculator" at="Sep 22-23"
done "Last four eyebrow labels on the forms fixed" at="Sep 22-23"
```

The board note lumps both days together, so I can't say which change landed on which day.
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
No, that's the only other fix on the board for the quote site forms: the last four eyebrow labels.
````

### last-page-next-step (FAIL)

**Chris:** Walk me through the most recent changes we've done for the quote site.

Good: Short answer first, then a deck or plan of the changes (each with its picture, at most 4 pages) whose last step is a `choose` of what to do next or 'Why do you ask?', never a page they can only read (Chris: "we are on the last card and I want some type of action here. I don't want a user to land here and not know what to do next").

- need: none of [deck plan]
- last page: ends in sketch, not something to tap

````
The big change landed today: the closing box is now finished.

```yui
timeline "Quote site, last three days"
done "Real brand logos on the /brands family cards" at="Sep 22"
done "Bigger field labels on the calculator" at="Sep 23"
done "Last four eyebrow labels on the forms fixed" at="Sep 22-23"
done "Closing purple box finished" at="Sep 24"
sketch "Closing purple box" frame=phone
row "Red placeholder frame" +x note="gone"
after
row "Client's final copy, word for word" +hi note="no edits"
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
Four changes, all from Sep 24.

```yui
>full
deck "Closing purple box" +inline
page "1. Red frame removed" body="The red placeholder frame is gone. The purple box now stands on its own."
sketch "Purple box" frame=phone
row "Red placeholder frame" +x note="removed"
after
row "Purple box, no frame" +hi note="clean"
page "2. Final copy" body="The client's final copy went in, word for word. No more draft text."
sketch "Box copy" frame=phone
row "Draft copy" +x note="replaced"
after
row "Client's final copy" +hi note="word for word"
page "3. ZIP and form" body="A working ZIP field and a two-question form sit in the box. Their answers go straight into the lead record."
sketch "Form flow" frame=phone
row "Your ZIP" +hi note="works now"
row "Question 1" +hi
row "Question 2" +hi note="answers go to lead record"
page "4. Buttons" body="Two buttons close the box."
sketch "Buttons" frame=phone
row "See My Coverage Options" +button +hi
row "Talk to a Licensed Advisor" +button +hi
choose "What next?" "Check the form's lead record"|"See the /brands changes"|"Why do you ask?"
end
```
````

### tiles-board-status (pass)

**Chris:** ok, is the board up to date? (What you just looked up: site lane is clean, nothing open. The new feature lane, the quote calculator, has one card blocked waiting on a design pick from Chris. SEO lane shipped its last audit fixes yesterday and scores 94.)

Good: One sketch, three Label: verdict rows (Site: good, New feature: needs help with +hi, SEO: strong), a line of a few words at most. No sentences, no deck, no 'One question' screen.

````
Yes, it's current.

```yui
sketch "Board" frame=window
row "Site: clean"
row "Quote calculator: 1 blocked" +hi note="your design pick"
row "SEO: 94"  note="fixes shipped yesterday"
```
````

### outcome-invite-declined (pass)

**Chris:** I declined the Friday 3 pm team sync invite from Dana like you said. What's the state? (What you just did: declined it on the calendar, no reply message sent to Dana.)

Good: A sketch of the invite row struck out (+x) with note=declined. A few words. If it asks about Dana it is one choose on the same screen, never 'do you want to do what the previous page said'.

````
Declined on your calendar. Dana hasn't been told.

```yui
sketch "Team sync invite" frame=bubble
row "Team sync, Friday 3 pm" +x note="declined"
row "Reply to Dana: not sent" +hi note="she sees no message"
```
```yui
ask "Send Dana a short note?" "Send a note"|"Leave it"
```
````

### outcome-worker-running (pass)

**Chris:** What's happening on the quote calculator card right now? (What you just looked up: a worker picked it up 4 minutes ago and is editing the calculator labels. Nothing has failed. Expect it done in about 20 minutes.)

Good: A small drawing of the worker at its task: shapes with the busy part +pulse (Worker, arrow, the card), or a one-row sketch or timeline. A few words. No paragraph.

````
A worker is editing the labels.

```yui
shapes "Quote calculator" caption="Picked up 4 min ago. About 20 min left. Nothing failed."
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
Here's a sample board with made-up rows.

```yui
sketch "Sample board" frame=window
row "Site: good" note="example"
row "Build: passing" note="example"
row "Deploy: needs review" +hi note="example"
row "Backups: stale" +hi note="example"
row "SEO: strong" note="example"
stat 98.7% Uptime delta=0.2 spark=97.9|98.1|98.4|98.5|98.7
stat 12 "Open tasks" delta=-3 spark=18|16|15|14|12
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
Three changes, shown here.

```yui
sketch "Progress page" frame=window
row "Entry: text only" +x note="no shots"
row "Filter chips at the bottom" +x note="hard to reach"
after
row "Filter chips at the top" +hi note="moved up"
row "Entry: before and after shots" +hi note="on every entry"
row "Feedback" +button +hi note="links to the note"
compare /demo/site_before_classes.jpg /demo/site_after_classes.jpg "Classes entry"
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
Here are the demo cards. The numbers are made up.

```yui
card "Example card" body="A title, a body, and one button." cta="Tap me"
stat 178.9lb "Weight (example)" delta=-2.3 spark=181|180.5|180|179.4|178.9
list "Example list" "Squat 5x5" "Bench 5x5" "Row 4x10" +check
```
````

### showlink-waiting-shots (pass)

**Chris:** What are you waiting on me for with this? (What you just looked up: the site refresh card needs your pick of before and after shots for the progress page, https://www.yuigui.com/progress. Old hero: one headline, three buttons. New hero: a bigger headline, one button. Shots on file: /demo/site_before_hero.jpg and /demo/site_after_hero.jpg.)

Good: The two shots in a compare, or a sketch with after, plus the one thing needed. Not a card that only says Open.

````
Just one pick: which shots go on the progress page. Here's the pair on file.

```yui
compare /demo/site_before_hero.jpg /demo/site_after_hero.jpg "Hero"
choose "Use this pair?" "Use both"|"Different shots"|"Skip the shots" +other
```
````

### showlink-only-url (pass)

**Chris:** Where is the new hero? (What you just looked up: it is live on the site, https://www.yuigui.com/progress, in the Site refresh entry. Old hero: one headline and three buttons. New hero: a bigger headline and one button.)

Good: The change drawn: a sketch with before and after. At most one small link card under it.

````
It's live on the progress page, in the Site refresh entry.

```yui
sketch "Hero" frame=window
row "One headline" +x note="old"
row "Button 1" +button +x
row "Button 2" +button +x
row "Button 3" +button +x
after
row "Bigger headline" +hi note="new"
row "One button" +button +hi
card "Site refresh" body="Progress page, Site refresh entry" cta="Open" url=https://www.yuigui.com/progress
```
````

### showlink-build-changes (pass)

**Chris:** What changed in the last build? (What you just looked up: build 332 opens a notification on page one, the mic stays on the last page, and a reply quotes the screen. Full notes: https://www.yuigui.com/progress)

Good: The three changes shown here (a list, timeline or sketch). The link, if any, is a small follow-up.

````
Build 332 has three changes.

```yui
list "Build 332" "Notification: opens on page one" "Mic: stays on the last page" "Reply: quotes the screen"
card "Full notes" body="Everything in build 332" cta="Open progress" url=https://www.yuigui.com/progress
```
````

### showlink-demo-page (pass)

**Chris:** Is there a demo of the compare card? (What you just looked up: yes, https://www.yuigui.com/playground?demo=show-here. It shows a slider between a before and an after shot, with Side and Toggle modes. Shots: /demo/before_room.jpg and /demo/after_room.jpg.)

Good: The demo itself: a compare of the two shots. Not a card that only links to the playground.

````
Yes, there's a live demo, and here's the compare card itself with its sample shots.

```yui
compare /demo/before_room.jpg /demo/after_room.jpg "Room, before and after"
card "Compare demo" body="Side and Toggle modes in the playground" cta="Open playground" url=https://www.yuigui.com/playground?demo=show-here
```
````

### showlean-waiting (pass)

**Chris:** What are you waiting on me for with this? (What you just looked up: the site refresh card is done except before and after shots of the hero for the progress page. Page: https://www.yuigui.com/progress. Nothing else is open.)

Good: The ask drawn here (a sketch with the missing before and after slot, or a camera to snap it). At most a small link under it.

````
Nothing, unless you want to supply the shots yourself. The only open item is the hero before and after for the progress page.

```yui
sketch "Site refresh card" frame=window
row "Everything else: done"
row "Hero before/after shots: missing" +hi note="for progress page"
row "Waiting on you: nothing"
```
````

### showlean-new-hero (FAIL)

**Chris:** What does the new hero look like? (What you just looked up: it is on https://www.yuigui.com, top of the page. It has a bigger headline and one button, Get Yui, where there were three buttons.)

Good: The hero drawn in a sketch phone, before and after. At most a small link under it.

- words: 27 > 25

````
Drawn from your description, not the live page.

```yui
sketch "yuigui.com hero" frame=window
row "Headline (smaller)" note="before"
row "Button 1" +button +x note="three buttons"
row "Button 2" +button +x
row "Button 3" +button +x
after
row "Headline (bigger)" +hi note="the focus now"
row "Get Yui" +button +hi note="the only button"
```

I don't have the exact headline wording. Want me to pull the page again and show the real text?
````

### showpick-four-looks (pass)

**Chris:** Show me the four looks again. (What you just looked up: the demo page is https://www.yuigui.com/playground?demo=shader-look. The four dark shots are already on disk: /Users/urzas/.hermes/kanban/artifacts/t_b8ab6ac3/1-currents-dark.png, 2-terrain-dark.png, 3-dots-dark.png, 4-type-dark.png, same folder.)

Good: A gallery of the four shots with +pick, so the choice is on the phone. A site link only as a small button under it, never alone.

````
Here are the four again, tap to pick one.
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
The four shader looks, again.
```yui
gallery /Users/urzas/.hermes/kanban/artifacts/t_b8ab6ac3/1-currents-dark.png /Users/urzas/.hermes/kanban/artifacts/t_b8ab6ac3/2-terrain-dark.png /Users/urzas/.hermes/kanban/artifacts/t_b8ab6ac3/3-dots-dark.png /Users/urzas/.hermes/kanban/artifacts/t_b8ab6ac3/4-type-dark.png +pick
```
````
