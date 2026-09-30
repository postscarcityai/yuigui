# Channel eval: jev215-hintb-r1

Guide v43+22b9cd60 (4614 words), model claude-sonnet-5-5, 2026-09-30T16:20.

**25/25 passed (100%).**

| category | passed |
|---|---|
| workout | 1/1 |
| today | 1/1 |
| decision | 1/1 |
| list | 3/3 |
| teach | 1/1 |
| trap | 1/1 |
| dead-button | 1/1 |
| flow | 6/6 |
| saved | 2/2 |
| report | 3/3 |
| show | 3/3 |
| music | 1/1 |
| context | 1/1 |

| case | result | why |
|---|---|---|
| workout-leg-day | pass |  |
| today-plan | pass |  |
| decision-three-options | pass |  |
| list-groceries | pass |  |
| list-packing | pass |  |
| teach-compound-interest | pass |  |
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
| show-phase-one | pass |  |
| music-chords-song | pass |  |
| list-no-escaped-breaks | pass |  |
| last-page-walkthrough | pass |  |
| context-sample-not-ask | pass |  |
| showhere-after-linkout | pass |  |
| showpick-two-looks | pass |  |

## Transcripts

### workout-leg-day (pass)

**Chris:** Leg day. I have 40 minutes, home gym.

Good: A short line, then the session on screen (a checklist or a card) with a way to start (ask or timer). No interrogation: he already said time and gear.

````
Built for 50 lb dumbbells: slow tempo and single-leg work make up for the light load. About 40 minutes.

```yui
list "Leg day, 40 min" "Warm-up 5 min: bodyweight squats, hip hinges, leg swings" "Goblet squat 3x12, 3 sec down" "Bulgarian split squat 3x10 per leg" "DB Romanian deadlift 3x12" "Reverse lunge 3x10 per leg" "Single-leg calf raise 3x15 per leg" "Finisher: banded glute bridge 2x20" +check
save workout
```

Rest 60 to 75 seconds between sets. If the split squats feel easy, slow the lowering to 4 seconds.
````

### today-plan (pass)

**Chris:** What should I do today?

Good: Without calendar access it proposes a shape for the day or asks one thing (energy, top priority) as buttons. Remembers Mick at 2 pm. Not a text essay.

````
Here's a skeleton for the day. I haven't pulled your calendar or inbox, so tell me what's fixed and I'll rework it.

```yui
card "Thursday, Sep 24" body="9:30 Workout, 40 min at home. 10:30 to 12:30 Deep work, phone off. 12:30 Lunch and inbox sweep. 1:30 Leave for Mick's 2 pm pickup. Afternoon: Mick time, then errands."
```
````

### decision-three-options (pass)

**Chris:** Help me pick which to do first this afternoon: invoice Heathos, reply to Paul about Plannix, or fix the Yui site footer.

Good: A recommendation plus the three as buttons (or an ordered list with +check). No essay.

````
Invoice Heathos first. It's quick, it's money, and it stops being a loose end. Mick's 2 pm pickup is a hard stop, so clear the things that cost you when they slip.

```yui
card "Do first: invoice Heathos" body="Then Paul on Plannix (someone's waiting on you). Footer last, since nobody's blocked on it."
```
````

### list-groceries (pass)

**Chris:** Make me a grocery list for high protein meals this week.

Good: A list with +check, a title, and items that fit on a phone.

````
Here's a week of high-protein meals, sized for you and Mick.

```yui
list "Groceries" "Chicken breast, 3 lb" "Ground turkey 93%, 2 lb" "Salmon fillets, 1.5 lb" "Flank steak, 1.5 lb" "Eggs, 18 count" "Plain Greek yogurt, 32 oz" "Cottage cheese, 24 oz" "Canned tuna, 4" "Black beans, 2 cans" "Brown rice or quinoa" "Rolled oats" "Whole wheat tortillas" "Broccoli, 2 crowns" "Spinach, large bag" "Sweet potatoes, 4" "Berries and bananas" +check
```
````

### list-packing (pass)

**Chris:** Mick has a field trip tomorrow to the science museum. Packing list?

Good: A checklist. One line of text.

````
Here's a starter list for Mick. Check the school's permission slip for anything specific, like a required shirt or lunch rules.

```yui
list "Mick: science museum" "Sack lunch + snack" "Refillable water bottle" "Signed permission slip" "Backpack (small)" "Light jacket (museum AC)" "Closed-toe sneakers" "Sunscreen on before leaving" "$ for gift shop, if allowed" +check
```
````

### teach-compound-interest (pass)

**Chris:** Explain compound interest to Mick, he's 9. Make it something he can play with.

Good: Something interactive: a calc with sliders, or a short deck with a quiz question.

````
Here's one for Mick: money that has babies, and the babies have babies.

```yui
>full
deck "Money that has babies"
page "Your money can grow" body="Put $100 in a bank. The bank pays you extra just for keeping it there. That extra is called interest."
shapes
shape circle $100 +grow
shape arrow
shape blob $110 +pulse tone=mint
page "The baby money has babies" body="Next year you get interest on $110, not just the first $100. So the baby money earns its own baby money. That's compound interest."
shapes
shape box "$100"
shape arrow
shape box "$110"
shape arrow
shape box "$121" +pulse tone=butter
page "It bends upward" body="Money that only earns on the first $100 grows in a straight line. Compound money curves up and up."
chart line "$100 at 10% a year" x=Now|5 yrs|10 yrs|20 yrs y=100|161|259|673
choose "Which grows more?" "Interest on the first $100 only"|"Interest on the interest too" answer="Interest on the interest too"
page "Now you play" body="Slide the deposit, the interest rate, and the years. Watch how much time changes."
calc f="A = P*(1+r)^t" P=10-100@10 r=0-0.2@0.05 t=0-30@5
choose "What next?" "Quiz me again"|"Explain it with rabbits"|"Why do you ask?"
end
```
````

### no-html-pricing (pass)

**Chris:** Show me a clean pricing table for my three coaching tiers: Starter $500/mo 2 calls, Growth $1,500/mo weekly calls, Partner $4,000/mo unlimited.

Good: A YL table (header row then one row per tier) or three cards. No HTML, no markdown table, no JSON.

````
Your three tiers:

```yui
table "Coaching tiers" Tier|Price|Calls "Starter|$500/mo|2 calls" "Growth|$1,500/mo|Weekly calls" "Partner|$4,000/mo|Unlimited"
```
````

### dead-plan-submit (pass)

**Chris:** Walk me through planning a weekend trip: where, budget, and dates. I'll answer on screen.

Good: A plan with one step per question, ending in a submit named for what happens ("Send", "Plan it", "Find trips"), not "Create project".

````
Three quick questions and I'll build the trip.

```yui
plan "Weekend trip" submit="Plan it"
choose "Where to?" "Keys"|"Orlando"|"Savannah"|"Charleston"|"Nassau" +other
choose "Budget for the weekend?" "Under $500"|"$500-1,000"|"$1,000-2,000"|"$2,000+"
choose "Which weekend?" "This one"|"Next one"|"In two weeks"|"In a month" +other
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
page "Pricing page is slow" body="It loads in 4.1 seconds on a phone, mostly from two uncompressed hero images. Compressing them is the biggest speed win on the page."
page "Signup drops UTM tags" body="The signup form loses the UTM tags, so campaign attribution breaks at the exact moment someone converts. Every signup since this started is unattributed."
page "FAQ block is working" body="The new FAQ block gets the most clicks after the hero. It's earning its spot, so leave it alone."
choose "What do we fix first?" "Hero images"|"UTM tags"|"Both together" +other
choose "When do we ship?" Today|Tomorrow
end
```
````

### save-reusable-workout (pass)

**Chris:** Give me a quick 20 minute Tabata I can come back to on busy days.

Good: A Tabata timer (it takes the stage on its own) and a `save` with a short name so it lands on the shelf. No re-asking what they want.

````
Five 4-minute blocks, no rest between. Each block alternates two moves, 20 sec on and 10 off, 8 rounds.

```yui
card "20-min Tabata" body="1. Goblet squat / Push-up\n2. DB row / Reverse lunge\n3. DB swing / Band pull-apart\n4. DB floor press / Mountain climber\n5. Plank / Burpee" cta="Start block 1"
save workout
```
````

### show-saved-workout (pass)

**Chris:** Slammed again today. Pull up my busy day workout.

Good: `show busy-day` (the name it saved), one short line, no re-sent timer.

````
Here's your busy-day Tabata. Twenty minutes, then done.
```yui
show busy-day
```
````

### game-offer (pass)

**Chris:** Build's still going. Play a quick game of tic-tac-toe with me?

Good: One `game tictactoe` line and at most a few words. No board drawn by hand, no list of cells.

````
Sure, you're X, so you go first.
```yui
game tictactoe "Beat me"
```
````

### report-long-walkthrough (pass)

**Chris:** Walk me through everything that changed in how Yui delivers messages this week: replies are exactly-once both ways with acks, a reply outbox on disk, presence reads online/asleep/offline per agent, pushes skip a phone already watching the thread, agents can be muted, and a paired agent whose gateway never started now says 'not listening yet' with the restart command.

Good: A deck (or plan) of short pages, one change per page, under one short chat line. Not a long bulleted or prose message.

````
Six changes, four screens.

```yui
>full
deck "Yui delivery, this week"
page "Exactly once, both ways" body="Every message and reply carries an ack. Nothing is shown twice, and nothing is dropped."
shapes "Acks" caption="Each side confirms before the other stops resending."
shape circle Phone
shape arrow
shape box Agent +fill
shape arrow
shape pill Ack +pulse
page "Replies wait on disk" body="An agent's reply lands in an outbox on disk first. If the gateway dies mid-send, it goes out after restart."
shapes "Outbox" caption="Saved first, sent second, cleared on ack."
shape pill Reply
shape arrow
shape box "Disk outbox" +fill
shape arrow
shape circle Phone +pulse
page "Presence, per agent" body="Each agent reads online, asleep or offline. A paired agent whose gateway never started says 'not listening yet' and shows the restart command."
sketch "Agent list" frame=phone
row "Agent A: online" note="example"
row "Agent B: asleep" note="example"
row "Agent C: offline" note="example"
row "Agent D: not listening yet" +hi note="restart command"
page "Fewer pushes" body="A push is skipped when your phone is already watching that thread. Mute an agent and it stops pushing at all."
sketch "Push rules" frame=bubble
row "Thread open on phone: no push" +x note="already watching"
row "Muted agent: no push" +x note="your call"
row "Thread closed: push" +hi
choose "What next?" "Mute an agent"|"Check agent presence"|"Why do you ask?"
end
```
````

### talk-keep-plan-editable (pass)

**Chris:** Lay out my runs for this week somewhere I can keep looking at it, and I'll tell you what to change as the week goes.

Good: The week on a page (`>2 list@runs Runs "Tue 5k"|"Thu 5k"|"Sat 10k" +check`) with `>2 talk` so they can type changes right there, and one short line in the chat.

````
Here's a starting week, built around Mick's 2 pm pickup, so runs are in the morning. Typing on that screen changes it.

```yui
>2 timeline "Runs this week" +reorder
>2 now "Thu: easy 30 min, conversational" tag=thu
>2 next "Sat: long run, 50 min easy" tag=sat
>2 next "Sun: easy 25 min or rest" tag=sun
>2 talk
save runs
```
````

### draw-screen-fix (pass)

**Chris:** The build-ready screen shows the headline, two lines of notes, then a Got it button and an Install button. Which of those should go, and why? Show me on the screen itself.

Good: A `sketch` of the screen (frame=phone) with the headline and notes as rows, Got it as a +button row struck out (+x) with a short note (it does nothing), Install as a +button row highlighted. At most a line of chat.

````
Cut Got it: it only acknowledges, and Install is the one action.

```yui
sketch "Build ready" frame=phone
row "Build 82 is ready" 
row "Adds A2A agents. Tested end to end."
row "Got it" +button +x note="does nothing"
row "Install" +button
after
row "Build 82 is ready"
row "Adds A2A agents. Tested end to end."
row "Install" +button +hi note="the only action"
```
````

### report-pages-picture (pass)

**Chris:** Walk me through the three changes to how you write updates to me this week, one at a time: you name cards in plain words instead of ids like YUI-83, a long update comes as pages instead of a wall of text, and cards no longer end in a 'Got it' button that does nothing. For each one, show me what it looked like before and after.

Good: One short line and a deck of three pages, one change each, and each page's picture a sketch right after it: the old wording or button struck out (+x), the new one highlighted (+hi), ideally split with `after`. No paragraph.

````
Three changes, each with before and after.

```yui
>full
deck "Three changes to my updates"
page "Plain names on cards" body="Cards used to carry ticket ids. Now they say what the card is, so you never have to decode a number."
sketch "Parking a card" frame=bubble
row "Parked YUI-83 in the backlog" +x note="an id means nothing"
after
row "Parked the drawing card in the backlog" +hi note="plain words"
page "Long updates come as pages" body="A long report used to arrive as one block. Now it's a short line, a headline card, and a few pages you swipe through."
sketch "A long update" frame=phone
row "Build 82 is ready. Latest change: A2A bridge, pair with node yui-a2a.ts, tests client 42/42, interop 4/4, e2e 66/66, plus notes on..." +x note="a wall of text"
after
row "Build 82 is ready." +hi note="one line"
row "Build 82: Add any A2A agent" +hi note="headline card"
row "A2A agents | Tested" +button note="swipe pages"
page "No dead-end buttons" body="Cards used to end in a Got it button that only closed them. Now a card has a button only if tapping it does something."
sketch "A status card" frame=bubble
row "Board is up to date  [Got it]" +x note="button does nothing"
after
row "Board is up to date" +hi note="no button, nothing to do"
row "Install build 82" +button note="only real actions"
choose "What next?" "See a real long update"|"Change how I write these"|"Why do you ask?"
end
```
````

### menu-shortcut (pass)

**Chris:** I log breakfast every single morning. Give me a one-tap way to do it from now on.

Good: A shortcut in the drawer (`menu shortcut@breakfast "Log breakfast" say="Log breakfast: "`) and one short line saying where it lives. No button that only acknowledges.

````
Added a "Log breakfast" shortcut to your home chips. Tap it and I'll take it from there.

```yui
menu shortcut "Log breakfast"
card "Log breakfast" body="One tap on your home screen. I'll ask what you ate."
```
````

### flow-interview-old-app (pass)

**Chris:** Interview me for a personal brand site.

Good: TestFlight feedback AMLn-Gg3 (YUI-155): one short line and the questions, as the saved `flow website-intake` or a plan. On build 205, which runs no flows, the plugin sends the flow as the plan it walks, so the phone shows questions, never a bare headline.

````
Let's start with a short interview.

```yui
flow website-intake
```
````

### show-phase-one (pass)

**Chris:** Walk me through phase one. (What you know: phase one of the full-screen change. Answers play as full-screen chunks, and the chat is just the record, top right. Bottom right: a bigger mic, a T that opens the text field, and a + for attachments, including images. Settings sit behind a hamburger at top left, beside the agent picker.)

Good: A line and a drawing per part: the stage with a chunk on it, the record top right, the new bottom bar (big mic, T, +). Never a page with a heading over a paragraph (feedback AL1My-stUBnvtXD2WKV7ec8, YUI-119).

````
Phase one puts the answer on the whole screen and moves everything else to the edges.

```yui
>full
deck "Phase one, full screen"
page "Answers take the screen" body="Each answer plays as full-screen chunks. The chat is no longer the main view; it's the record you can open when you want it."
sketch "Answer" frame=phone
row "Yes. Build 160, the newest." +hi note="one chunk, full screen"
row "Chat" +button note="top right, the record"
page "The top bar" body="Settings moved behind a hamburger at top left, next to the agent picker. Chat sits opposite, top right."
sketch "Top bar" frame=phone
row "☰  Agent picker  Chat" +button +hi note="settings, agent, record"
page "The bottom bar" body="Talk first. The mic is bigger. T opens the text field when you want to type. + attaches files and images."
sketch "Bottom bar" frame=phone before=Before
row "Say something nice  Mic" +button +x note="field always open"
after After
row "+   T   Mic" +button +hi note="big mic; T types; + attaches"
choose "What next?" "Try the mic"|"Try attaching an image"|"Why do you ask?"
end
```
````

### music-chords-song (pass)

**Chris:** I want to strum along to one of those four chord pop songs on my uke. G is a good key for me.

Good: One `chords` line in G (`chords G I-V-vi-IV` or `chords G|D|Em|C`), a short line at most. No chord names in a paragraph, no chord diagrams in text.

````
G, D, Em, C: the classic I-V-vi-IV. It fits "Let It Be", "No Woman No Cry", "Someone Like You" and hundreds more.

```yui
chords G I-V-vi-IV
```
````

### list-no-escaped-breaks (pass)

**Chris:** What should I eat for dinner tonight? Something with protein. I'm allergic to peanuts and shellfish.

Good: A few dinners as a `list` (or cards), one per item, and a way to pick one. Never one `say` with \n breaks inside the quotes: the app shows the letter n (YUI-161, GLM 5.2 on native Basil).

````
Sheet-pan lemon-herb chicken with potatoes and broccoli: easy, and Mick will likely eat it too.

```yui
card "Sheet-pan lemon chicken" body="Chicken thighs (6 oz), baby potatoes, broccoli. About 45 g protein, 550 cal. 35 min at 425°F, one pan. Peanut and shellfish free."
```
````

### last-page-walkthrough (pass)

**Chris:** Walk me through what changed on the closing purple box, step by step.

Good: A deck (or plan) of the changes, each with its picture, and the last step is something to tap: a `choose` of what to do next or 'Why do you ask?'. No dead end.

````
Four changes, in the order you'd see them.

```yui
>full
deck "The closing purple box"
page "Red frame removed" body="The red placeholder frame that sat in the box is gone."
sketch "Closing box" frame=phone
row "Red placeholder frame" +x note="removed"
after
row "Purple box, clean" +hi note="no red frame"
page "Final copy in" body="The client's final copy is in, word for word."
sketch "Closing box" frame=phone
row "Placeholder text" +x note="replaced"
after
row "Client's final copy" +hi note="word for word"
page "ZIP field and form" body="A working ZIP field and a two-question form sit in the box. The answers go straight into the lead record."
sketch "Closing box" frame=phone
row "Your ZIP" +hi note="working field"
row "Question 1" +hi note="two-question form"
row "Question 2" +hi
row "Answers" +hi note="go to lead record"
page "Two buttons" body="The buttons now read See My Coverage Options and Talk to a Licensed Advisor."
sketch "Buttons" frame=phone
row "See My Coverage Options" +button +hi
row "Talk to a Licensed Advisor" +button +hi
choose "What next?" "Test the form"|"Check the lead record"|"Why do you ask?"
end
```
````

### context-sample-not-ask (pass)

**Chris:** Show me a sample status board so I can see how the tiles look.

Good: One sketch of Label: verdict rows marked as an example (note="example" or a sample title). No row says "waiting on you": a sample is not a real ask.

````
Here's a sample board.

```yui
sketch "Sample status board" frame=window
row "Site: good" note="example"
row "Checkout: slow" +hi note="example"
row "Email: sending" note="example"
row "Backups: failed" +x note="example"
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

### showpick-two-looks (pass)

**Chris:** Show me the two card styles again so I can pick. (What you just looked up: playground demo https://www.yuigui.com/playground?demo=card-style. Shots: /demo/s1.jpg Soft, /demo/s2.jpg Sharp.)

Good: A gallery or compare of the two shots with the pick right there. Not a card that only opens the playground.

````
Here are both card styles.

```yui
gallery /demo/s1.jpg /demo/s2.jpg +pick
```
````
