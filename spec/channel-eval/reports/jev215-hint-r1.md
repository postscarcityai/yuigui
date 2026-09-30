# Channel eval: jev215-hint-r1

Guide v43+22b9cd60 (4614 words), model claude-sonnet-5-5, 2026-09-30T16:15.

**31/37 passed (84%).**

| category | passed |
|---|---|
| workout | 1/1 |
| check-in | 0/1 |
| today | 1/1 |
| decision | 1/1 |
| list | 3/3 |
| teach | 1/1 |
| no-screen | 3/4 |
| trap | 1/1 |
| dead-button | 1/1 |
| flow | 6/6 |
| saved | 2/2 |
| report | 3/3 |
| short | 1/1 |
| music | 2/2 |
| show | 3/4 |
| explain | 0/1 |
| where | 1/1 |
| tiles | 0/2 |
| context | 1/1 |

| case | result | why |
|---|---|---|
| workout-leg-day | pass |  |
| checkin-morning | FAIL | screen: no ```yui block; need: none of [slide form plan choose flow] |
| today-plan | pass |  |
| decision-three-options | pass |  |
| list-groceries | pass |  |
| list-packing | pass |  |
| teach-compound-interest | pass |  |
| plain-fact | FAIL | screen: sent a screen for a plain answer |
| plain-thanks | pass |  |
| plain-explain | pass |  |
| plain-math | pass |  |
| no-html-pricing | pass |  |
| dead-plan-submit | pass |  |
| flow-findings-then-questions | pass |  |
| save-reusable-workout | pass |  |
| show-saved-workout | pass |  |
| game-offer | pass |  |
| report-long-walkthrough | pass |  |
| talk-keep-plan-editable | pass |  |
| draw-screen-fix | pass |  |
| report-pages-picture | pass |  |
| menu-shortcut | pass |  |
| flow-interview-old-app | pass |  |
| short-release-go-ahead | pass |  |
| music-finger-drums | pass |  |
| show-phase-one | pass |  |
| music-chords-song | pass |  |
| explain-monsoon-how | FAIL | screen: no ```yui block; need: none of [map shapes chart image]; drawn: no map, chart, timeline or image, only words and numbers |
| where-delivery-area | pass |  |
| list-no-escaped-breaks | pass |  |
| last-page-walkthrough | pass |  |
| outcome-invite-declined | FAIL | screen: no ```yui block; need: none of [sketch]; words: 34 > 15; text: "so"; struck: nothing struck out for the outcome |
| outcome-worker-running | FAIL | screen: no ```yui block; need: none of [shapes sketch timeline]; words: 29 > 20; worker: no pulsing shape or sketch of the worker at work |
| context-sample-not-ask | pass |  |
| showhere-after-linkout | pass |  |
| showlean-waiting | FAIL | screen: no ```yui block; need: none of [sketch compare gallery image camera list]; show here: nothing drawn in the thread |
| showpick-two-looks | pass |  |

## Transcripts

### workout-leg-day (pass)

**Chris:** Leg day. I have 40 minutes, home gym.

Good: A short line, then the session on screen (a checklist or a card) with a way to start (ask or timer). No interrogation: he already said time and gear.

````
Here's a 40-minute leg session built around 50 lb dumbbells, so the load comes from single-leg work and slow tempo.

```yui
card "Leg day, 40 min" body="Warm-up 5 min: bodyweight squats, hip bridges. Bulgarian split squat 4x8/leg. DB Romanian deadlift 4x10. Goblet squat 3x12, 3 sec down. Walking lunge 3x10/leg. Single-leg calf raise 3x15. Rest 60 to 90 sec." cta="Start"
```
````

### checkin-morning (FAIL)

**Chris:** morning check-in

Good: Sleep, soreness and energy as sliders or a short form (quoted title), or a plan that walks them one at a time, or the saved `flow workout-checkin` (it asks the same). Not a wall of questions in text.

- screen: no ```yui block
- need: none of [slide form plan choose flow]

````
Morning, Chris. How'd you sleep, and what's the plan before Mick's 2 pm pickup: a session now, or later?
````

### today-plan (pass)

**Chris:** What should I do today?

Good: Without calendar access it proposes a shape for the day or asks one thing (energy, top priority) as buttons. Remembers Mick at 2 pm. Not a text essay.

````
Here's a skeleton for the day. I haven't checked your calendar or inbox, so meetings could change it.

```yui
card "Today" body="Now to noon: 40-min home gym session, then your most important work. Noon: lunch, clear email. 1:40 pm: leave for Mick, school's out at 2. After: errands or family time." 
```

Want me to check your calendar and inbox and fit the real commitments in?
````

### decision-three-options (pass)

**Chris:** Help me pick which to do first this afternoon: invoice Heathos, reply to Paul about Plannix, or fix the Yui site footer.

Good: A recommendation plus the three as buttons (or an ordered list with +check). No essay.

````
Invoice Heathos first. It's quick and it starts the payment clock.

```yui
card "Order for this afternoon" body="1. Invoice Heathos. 2. Reply to Paul about Plannix. 3. Yui site footer. Get the first two done before Mick's 2 pm pickup."
```
````

### list-groceries (pass)

**Chris:** Make me a grocery list for high protein meals this week.

Good: A list with +check, a title, and items that fit on a phone.

````
Here's a high-protein week, built around simple meals Mick will eat too.

```yui
list "Grocery list" "Chicken breast, 3 lb" "Ground turkey 93%, 2 lb" "Salmon fillets, 1.5 lb" "Eggs, 18 count" "Greek yogurt plain, 32 oz" "Cottage cheese, 16 oz" "Canned tuna, 4 cans" "Black beans, 2 cans" "Shredded cheese, 8 oz" "Whole wheat tortillas" "Brown rice" "Rolled oats" "Peanut butter" "Broccoli, 2 crowns" "Spinach, 1 bag" "Bell peppers, 3" "Bananas" "Frozen berries" +check
```
````

### list-packing (pass)

**Chris:** Mick has a field trip tomorrow to the science museum. Packing list?

Good: A checklist. One line of text.

````
Here's the standard kit. Check it against the teacher's note for lunch and any required shirt.

```yui
list "Mick: science museum" "Backpack" "Lunch and a snack" "Water bottle" "Light jacket (museum AC)" "Comfy sneakers" "Signed permission slip or money, if asked" "Notebook and pencil" +check
```
````

### teach-compound-interest (pass)

**Chris:** Explain compound interest to Mick, he's 9. Make it something he can play with.

Good: Something interactive: a calc with sliders, or a short deck with a quiz question.

````
Here's a short lesson for Mick, with a slider game at the end.

```yui
>full
deck "Money that has babies"
page "Your money has babies" body="Put $100 in a bank. The bank pays you a little extra every year, like a thank-you. Say 10 extra dollars."
shapes
shape circle "$100" +grow
shape arrow
shape blob "$110" +pulse tone=mint
page "Then the babies have babies" body="Year 2, the bank pays you on all $110, including the extra $10 it gave you. So the extra gets bigger each year, like a snowball rolling downhill."
shapes
shape circle "$100"
shape arrow
shape blob "$110"
shape arrow
shape blob "$121" +pulse tone=butter
page "Wait long enough. Whoa." body="Same $100, and you never add a penny. Look what waiting does."
chart bar "Your $100 at 10% a year" x=Now|10yrs|20yrs|30yrs y=100|259|673|1745
choose "Where does most of the money come from?" "Your first $100"|"The babies having babies" answer="The babies having babies"
page "Now you drive" body="Slide the money, the yearly extra, and the years. Try 30 years, then try 5."
calc f="A = P*(1+r)^t" P=10-100@10 r=0-0.2@0.05 t=0-30@5
choose "What next?" "Make me a harder quiz"|"Use his real allowance"|"Why do you ask?"
```
````

### plain-fact (FAIL)

**Chris:** What's the capital of Portugal?

Good: Lisbon. No screen.

- screen: sent a screen for a plain answer

````
Lisbon.

```yui
map "Portugal" caption="Lisbon sits on the Tagus estuary, on the Atlantic coast."
area Portugal PT tone=mint
pin@li Lisbon 38.72,-9.14 +pulse
```
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
A deload week is a planned lighter week where you cut your training volume or intensity, usually by about 40 to 50 percent, so your body can recover and absorb the work you've been doing. It's typically scheduled every 4 to 8 weeks, and you come back fresher and stronger instead of waiting for fatigue or an injury to force a break.
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

### dead-plan-submit (pass)

**Chris:** Walk me through planning a weekend trip: where, budget, and dates. I'll answer on screen.

Good: A plan with one step per question, ending in a submit named for what happens ("Send", "Plan it", "Find trips"), not "Create project".

````
Three quick questions, then I'll build it.

```yui
plan "Weekend trip" submit="Plan it"
choose "Where to?" "Key West"|Orlando|Savannah|Charleston|Nassau +other
choose "Budget for the weekend?" "Under $500"|"$500-1,000"|"$1,000-2,000"|"$2,000+" +other
choose "When?" "This weekend"|"Next weekend"|"In two weeks"|"Next month" +other
end
```
````

### flow-findings-then-questions (pass)

**Chris:** Here are this morning's notes on the site review: the pricing page loads in 4.1 seconds on a phone, mostly two uncompressed hero images; the signup form drops the UTM tags; and the new FAQ block gets the most clicks after the hero. Walk me through what you found, then ask me what to fix first and whether to ship today or tomorrow.

Good: One plan: a page per finding with a real sentence or points, then 'fix first' and 'ship when' as questions, one submit. Not a deck followed by separate questions.

````
Three findings, one fast fix each. Your call on order and timing.

```yui
plan "Site review" submit="Lock it in"
page "Pricing page is slow" body="It takes 4.1 seconds to load on a phone. Most of that is two uncompressed hero images. Compressing them is the biggest speed win and touches nothing else."
page "Signup drops UTM tags" body="The form loses the UTM tags on the way through, so signups can't be traced to a campaign. Every signup until this is fixed is attribution you can't recover."
page "FAQ block is working" body="The new FAQ block gets the most clicks after the hero. Leave it alone. It may deserve a higher spot later, but that's a test, not a fix."
choose "What should we fix first?" "Hero images"|"UTM tags"|"Both, images first"|"Both, UTM first"
choose "When do we ship?" Today|Tomorrow
end
```
````

### save-reusable-workout (pass)

**Chris:** Give me a quick 20 minute Tabata I can come back to on busy days.

Good: A Tabata timer (it takes the stage on its own) and a `save` with a short name so it lands on the shelf. No re-asking what they want.

````
Five 4-minute Tabata blocks, alternating two moves in each (20s on, 10s off).

```yui
card "20-Min Tabata" body="1: Goblet squat / Push-up. 2: DB row / Reverse lunge. 3: DB swing / Bench dip. 4: Pull-up or band pulldown / Mountain climber. 5: DB thruster / Plank. Moderate weight, no break between blocks." cta="Start block 1"
save workout
```
````

### show-saved-workout (pass)

**Chris:** Slammed again today. Pull up my busy day workout.

Good: `show busy-day` (the name it saved), one short line, no re-sent timer.

````
Here's your busy-day Tabata. Twenty minutes, all yours.
```yui
show busy-day
```
````

### game-offer (pass)

**Chris:** Build's still going. Play a quick game of tic-tac-toe with me?

Good: One `game tictactoe` line and at most a few words. No board drawn by hand, no list of cells.

````
Sure. You're X, you go first.

```yui
game tictactoe "Beat me"
```
````

### report-long-walkthrough (pass)

**Chris:** Walk me through everything that changed in how Yui delivers messages this week: replies are exactly-once both ways with acks, a reply outbox on disk, presence reads online/asleep/offline per agent, pushes skip a phone already watching the thread, agents can be muted, and a paired agent whose gateway never started now says 'not listening yet' with the restart command.

Good: A deck (or plan) of short pages, one change per page, under one short chat line. Not a long bulleted or prose message.

````
One line each: delivery is now exactly-once, presence is honest, and pushes are quieter.

```yui
>full
deck "Delivery changes this week"
page "Exactly-once, both ways" body="Replies now carry acks in both directions, so nothing arrives twice or goes missing. Each reply is written to an outbox on disk first, so a crash or dropped connection resends it instead of losing it."
shapes "Reply path" caption="Saved to disk, sent, and cleared only once acked."
shape box Agent
shape arrow
shape box "Outbox (disk)" +fill
shape arrow
shape circle Phone +pulse
page "Presence per agent" body="Each agent now reads online, asleep or offline, so you can tell a napping agent from a dead one."
sketch "Agent list" frame=phone
row "Urza: online" +hi
row "Research agent: asleep"
row "Build agent: offline" +x
page "Quieter pushes" body="If your phone is already watching a thread, the push is skipped, since you'd see the message anyway. Any agent can also be muted."
sketch "Notifications" frame=bubble
row "Thread open on phone" +x note="push skipped"
row "Muted agent" +x note="no push"
row "Thread closed" +hi note="push sent"
page "Paired but never started" body="If an agent's gateway never came up, Yui now says 'not listening yet' and shows the restart command. Before, it just looked silent."
sketch "Agent status" frame=phone
row "Old: silence, no explanation" +x
after
row "Not listening yet" +hi note="gateway never started"
row "Restart command shown" +button
choose "What next?" "Mute an agent"|"Check agent status"|"Why do you ask?"
end
```
````

### talk-keep-plan-editable (pass)

**Chris:** Lay out my runs for this week somewhere I can keep looking at it, and I'll tell you what to change as the week goes.

Good: The week on a page (`>2 list@runs Runs "Tue 5k"|"Thu 5k"|"Sat 10k" +check`) with `>2 talk` so they can type changes right there, and one short line in the chat.

````
Here's a starting week, on its own screen. Tell me there what to change.

```yui
>2 list "Runs this week" "Thu: 30 min easy, before the heat" "Fri: off, lift instead" "Sat: 45 min long and easy" "Sun: 25 min shakeout or rest" +check
>2 talk
save runs
```
````

### draw-screen-fix (pass)

**Chris:** The build-ready screen shows the headline, two lines of notes, then a Got it button and an Install button. Which of those should go, and why? Show me on the screen itself.

Good: A `sketch` of the screen (frame=phone) with the headline and notes as rows, Got it as a +button row struck out (+x) with a short note (it does nothing), Install as a +button row highlighted. At most a line of chat.

````
Cut "Got it": it only acknowledges, while Install is the one thing to act on.

```yui
sketch "Build-ready screen" frame=phone
row "Build is ready" +hi
row "Note line one"
row "Note line two"
row "Got it" +button +x note="only acknowledges"
row "Install" +button
after
row "Build is ready" +hi
row "Note line one"
row "Note line two"
row "Install" +button +hi note="the only action"
```

If they don't want to install now, they just swipe away, so a dismiss button adds nothing.
````

### report-pages-picture (pass)

**Chris:** Walk me through the three changes to how you write updates to me this week, one at a time: you name cards in plain words instead of ids like YUI-83, a long update comes as pages instead of a wall of text, and cards no longer end in a 'Got it' button that does nothing. For each one, show me what it looked like before and after.

Good: One short line and a deck of three pages, one change each, and each page's picture a sketch right after it: the old wording or button struck out (+x), the new one highlighted (+hi), ideally split with `after`. No paragraph.

````
Three changes, each with its before and after.

```yui
deck "Three changes to my updates"
page "Cards get plain names" body="I used to refer to cards by id, like YUI-83. An id tells you nothing without looking it up. Now I name the card by what it is."
sketch "Backlog note" frame=bubble
row "Parked YUI-83 in the backlog" +x note="an id means nothing"
after
row "Parked the drawing card in the backlog" +hi note="plain words"
page "Long updates come as pages" body="A long update used to arrive as one block. Now it's a short deck: a few pages, each with one idea and a real title."
sketch "Long update" frame=bubble
row "Build 82 is ready. Latest change: A2A bridge, add any A2A agent by its Agent Card. Tests: client 42/42, interop 4/4, e2e 66/66..." +x note="a wall of text"
after
row "Page 1, A2A agents: what changed" +hi note="one idea each"
row "Page 2, Tested: 42/42, 4/4, 66/66" +hi note="facts as points"
page "No more dead 'Got it' buttons" body="Cards used to end in a button that only acknowledged. Now a button appears only when it does something. Otherwise the card just ends."
sketch "Build card" frame=bubble
row "Build 82  |  Got it" +button +x note="does nothing"
after
row "Build 82  |  Open TestFlight" +button +hi note="does something"
choose "What next?" "Show me a real update"|"Change one of these"|"Why do you ask?"
end
```
````

### menu-shortcut (pass)

**Chris:** I log breakfast every single morning. Give me a one-tap way to do it from now on.

Good: A shortcut in the drawer (`menu shortcut@breakfast "Log breakfast" say="Log breakfast: "`) and one short line saying where it lives. No button that only acknowledges.

````
Done. "Log breakfast" is now a shortcut on your home screen, and one tap sends it to me.

```yui
menu shortcut "Log breakfast"
```
````

### flow-interview-old-app (pass)

**Chris:** Interview me for a personal brand site.

Good: TestFlight feedback AMLn-Gg3 (YUI-155): one short line and the questions, as the saved `flow website-intake` or a plan. On build 205, which runs no flows, the plugin sends the flow as the plan it walks, so the phone shows questions, never a bare headline.

````
Starting the site brief. One question per screen.

```yui
flow website-intake
```
````

### short-release-go-ahead (pass)

**Chris:** OK, yeah go ahead and release that. I want to play with the music tools. (What you just did: started the 0.3.2 release; a worker is building it now and it reaches TestFlight in about 40 minutes. It leaves out the faster Send tap, which is not done yet.)

Good: One line: 0.3.2 is building, on TestFlight in about 40 minutes with keys and chords; the Send tap fix waits. No deck, no 'what happens next' pages (YUI-118).

````
0.3.2 is building now and should reach TestFlight in about 40 minutes, with keys and chords included. The faster Send tap isn't in this one.
````

### music-finger-drums (pass)

**Chris:** Waiting on a call. Let me just tap out some drums on my phone for a minute.

Good: One `drums` line (2x2 or 4x4), a few words at most.

````
Pads are up, tap away.
```yui
drums 2x2
```
````

### show-phase-one (pass)

**Chris:** Walk me through phase one. (What you know: phase one of the full-screen change. Answers play as full-screen chunks, and the chat is just the record, top right. Bottom right: a bigger mic, a T that opens the text field, and a + for attachments, including images. Settings sit behind a hamburger at top left, beside the agent picker.)

Good: A line and a drawing per part: the stage with a chunk on it, the record top right, the new bottom bar (big mic, T, +). Never a page with a heading over a paragraph (feedback AL1My-stUBnvtXD2WKV7ec8, YUI-119).

````
Phase one, screen by screen.

```yui
>full
deck "Phase one: full-screen answers"
page "Answers take the whole screen" body="Each answer plays as a full-screen chunk. Chat becomes the record, opened from the top right."
sketch "Answer screen" frame=phone
row "Yes. Build 160, the newest." +hi note="one chunk, full screen"
row "Chat" +button note="the record, top right"
page "Talk first" body="A bigger mic sits bottom right. T opens the text field. + attaches files and images."
sketch "Bottom bar" frame=phone before=Now
row "+  Say something nice  Mic" +button +x note="field always open"
after New
row "+   T   Mic" +button +hi note="big mic; T opens the field"
page "Settings move up top" body="A hamburger at top left holds settings, right beside the agent picker."
sketch "Top bar" frame=phone
row "≡  Agent picker" +hi note="settings behind the hamburger"
row "Chat" +button note="top right"
choose "What next?" "Start phase two"|"Change something in phase one"|"Why do you ask?"
end
```
````

### music-chords-song (pass)

**Chris:** I want to strum along to one of those four chord pop songs on my uke. G is a good key for me.

Good: One `chords` line in G (`chords G I-V-vi-IV` or `chords G|D|Em|C`), a short line at most. No chord names in a paragraph, no chord diagrams in text.

````
G, D, Em, C is the classic I-V-vi-IV in G. Think "Let It Be," "Someone Like You," "No Woman No Cry."

```yui
chords G I-V-vi-IV
```
````

### explain-monsoon-how (FAIL)

**Chris:** Why does India get monsoons? Keep it short.

Good: One line and a picture: land heats, air rises, wet air off the ocean moves in, as a diagram in `shapes` with arrows or a `map` with the winds as routes, maybe a rainfall `chart` by month. Not a paragraph of weather words.

- screen: no ```yui block
- need: none of [map shapes chart image]
- drawn: no map, chart, timeline or image, only words and numbers

````
In summer, the land heats faster than the Indian Ocean, so hot air rises over India and pulls in cool, moist ocean air that dumps its water as rain.
````

### where-delivery-area (pass)

**Chris:** Our farm delivers CSA boxes across Vermont, New Hampshire and western Massachusetts. Can you show a new customer what that covers?

Good: One line, then a map with the delivery area filled in (VT and NH by code, western Massachusetts as lat,lon points) and the farm or the big towns as pins. Not a list of states and counties.

````
Here's your delivery area.

```yui
map "Where we deliver" caption="Vermont, New Hampshire and western Massachusetts."
area Vermont 45.01,-73.35|45.01,-71.50|44.57,-71.57|44.2,-72.05|43.7,-72.3|42.85,-72.55|42.73,-73.27|43.63,-73.25|44.0,-73.42|44.5,-73.33 tone=mint
area "New Hampshire" 45.3,-71.08|45.01,-71.50|44.57,-71.57|44.2,-72.05|43.7,-72.3|42.85,-72.55|42.7,-71.15|43.07,-70.71|43.6,-70.98|44.3,-71.0 tone=lavender
area "Western Massachusetts" 42.74,-73.27|42.73,-72.46|42.04,-72.5|42.04,-73.49|42.5,-73.35 tone=butter
```
````

### list-no-escaped-breaks (pass)

**Chris:** What should I eat for dinner tonight? Something with protein. I'm allergic to peanuts and shellfish.

Good: A few dinners as a `list` (or cards), one per item, and a way to pick one. Never one `say` with \n breaks inside the quotes: the app shows the letter n (YUI-161, GLM 5.2 on native Basil).

````
Sheet-pan lemon-herb chicken with sweet potatoes and broccoli. It's one pan, about 35 minutes, and Mick will probably eat it too.

```yui
card "Lemon-herb chicken sheet pan" body="Chicken thighs, sweet potato, broccoli. Olive oil, lemon, garlic, oregano, 425°F for 30 min. About 45 g protein, 550 cal per serving. Peanut and shellfish free. Skip peanut oil and check any bottled marinade."
```
````

### last-page-walkthrough (pass)

**Chris:** Walk me through what changed on the closing purple box, step by step.

Good: A deck (or plan) of the changes, each with its picture, and the last step is something to tap: a `choose` of what to do next or 'Why do you ask?'. No dead end.

````
The closing purple box changed four ways, all on Sep 24.

```yui
>full
deck "The closing purple box" +inline
page "Red frame removed" body="The red placeholder frame is gone from the box."
sketch "Purple box" frame=window
row "Red placeholder frame" +x note="removed"
after
row "Clean purple box" +hi note="no frame"
page "Final copy in" body="The box now holds the client's final copy, word for word."
sketch "Purple box copy" frame=window
row "Placeholder text" +x note="replaced"
after
row "Client's final copy" +hi note="word for word"
page "ZIP field and form" body="The ZIP field works. Two questions sit under it, and their answers go straight into the lead record."
sketch "Purple box form" frame=phone
row "ZIP" +hi note="working field"
row "Question 1" +hi note="to lead record"
row "Question 2" +hi note="to lead record"
page "New button labels" body="The two buttons now read as below."
sketch "Purple box buttons" frame=phone
row "See My Coverage Options" +button +hi
row "Talk to a Licensed Advisor" +button +hi
choose "What next?" "Check the ZIP field"|"See the lead record"|"Why do you ask?"
end
```
````

### outcome-invite-declined (FAIL)

**Chris:** I declined the Friday 3 pm team sync invite from Dana like you said. What's the state? (What you just did: declined it on the calendar, no reply message sent to Dana.)

Good: A sketch of the invite row struck out (+x) with note=declined. A few words. If it asks about Dana it is one choose on the same screen, never 'do you want to do what the previous page said'.

- screen: no ```yui block
- need: none of [sketch]
- words: 34 > 15
- text: "so"
- struck: nothing struck out for the outcome

````
Friday's 3 pm team sync is declined on your calendar, and Dana hasn't gotten a note from you, so all she sees is the decline status. Want me to send her a quick line?
````

### outcome-worker-running (FAIL)

**Chris:** What's happening on the quote calculator card right now? (What you just looked up: a worker picked it up 4 minutes ago and is editing the calculator labels. Nothing has failed. Expect it done in about 20 minutes.)

Good: A small drawing of the worker at its task: shapes with the busy part +pulse (Worker, arrow, the card), or a one-row sketch or timeline. A few words. No paragraph.

- screen: no ```yui block
- need: none of [shapes sketch timeline]
- words: 29 > 20
- worker: no pulsing shape or sketch of the worker at work

````
A worker picked up the quote calculator card 4 minutes ago and is editing the calculator labels. Nothing has failed, and it should be done in about 20 minutes.
````

### context-sample-not-ask (pass)

**Chris:** Show me a sample status board so I can see how the tiles look.

Good: One sketch of Label: verdict rows marked as an example (note="example" or a sample title). No row says "waiting on you": a sample is not a real ask.

````
Here's a sample with made-up data.

```yui
sketch "Sample status board" frame=window
row "Site: good" note="example"
row "Deploy: running" note="example"
row "Backups: stale" +hi note="example, needs you"
row "Billing: paid" note="example"
```
````

### showhere-after-linkout (pass)

**Chris:** Just show me here. (Shots: /demo/site_before_classes.jpg and /demo/site_after_classes.jpg.)

Good: A compare of the two shots in the thread. No second link-out card.

````
Here they are, right here.

```yui
compare /demo/site_before_classes.jpg /demo/site_after_classes.jpg "Classes page"
```
````

### showlean-waiting (FAIL)

**Chris:** What are you waiting on me for with this? (What you just looked up: the site refresh card is done except before and after shots of the hero for the progress page. Page: https://www.yuigui.com/progress. Nothing else is open.)

Good: The ask drawn here (a sketch with the missing before and after slot, or a camera to snap it). At most a small link under it.

- screen: no ```yui block
- need: none of [sketch compare gallery image camera list]
- show here: nothing drawn in the thread

````
Nothing that I can see. The site refresh card is done except for the before and after hero shots for the progress page, and nothing else is open.
````

### showpick-two-looks (pass)

**Chris:** Show me the two card styles again so I can pick. (What you just looked up: playground demo https://www.yuigui.com/playground?demo=card-style. Shots: /demo/s1.jpg Soft, /demo/s2.jpg Sharp.)

Good: A gallery or compare of the two shots with the pick right there. Not a card that only opens the playground.

````
Here are both, tap one to pick.
```yui
gallery /demo/s1.jpg /demo/s2.jpg +pick
```
````
