# Channel eval: jev215-hintb-r2

Guide v43+22b9cd60 (4614 words), model claude-sonnet-5-5, 2026-09-30T16:21.

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
Here's 40 minutes with what you've got. Dumbbells top out at 50 lb, so we use tempo and single-leg work to make it hard.

```yui
card "Leg day, 40 min" body="Warm-up 5 min: bodyweight squats, hip bridges, leg swings. A1 Bulgarian split squat 4x8/leg (3 sec down). A2 DB Romanian deadlift 4x10. B1 Goblet squat 3x12, slow. B2 Banded glute bridge 3x15, 2 sec squeeze. Finisher: single-leg calf raise 3x15/leg, then a wall sit to failure. Rest 60-75 sec between exercises." cta="Start warm-up"
```
````

### today-plan (pass)

**Chris:** What should I do today?

Good: Without calendar access it proposes a shape for the day or asks one thing (energy, top priority) as buttons. Remembers Mick at 2 pm. Not a text essay.

````
Here's a skeleton. I don't have your calendar or inbox in front of me, so it only accounts for the fixed points.

```yui
card "Today" body="Morning: workout at home, 40 min. Late morning to 1:30: your top work block. 1:45: leave for Mick, out at 2. After: errands and email cleanup."
```

Tell me what's on your calendar and I'll fit it in.
````

### decision-three-options (pass)

**Chris:** Help me pick which to do first this afternoon: invoice Heathos, reply to Paul about Plannix, or fix the Yui site footer.

Good: A recommendation plus the three as buttons (or an ordered list with +check). No essay.

````
Invoice Heathos first: it's quick and it's money owed. Then Paul, then the footer.

```yui
card "Afternoon order" body="1. Invoice Heathos (10 min, cash in)|2. Reply to Paul on Plannix (someone's waiting)|3. Yui footer (no one's blocked, so it gets whatever's left)"
```

Do all three before 2 pm pickup if you can. Otherwise the footer is the one that slides.
````

### list-groceries (pass)

**Chris:** Make me a grocery list for high protein meals this week.

Good: A list with +check, a title, and items that fit on a phone.

````
Here's a high-protein week, with Mick-friendly staples mixed in.

```yui
list "Groceries" "Chicken breast, 3 lb" "Lean ground turkey, 2 lb" "Salmon fillets, 1.5 lb" "Eggs, 2 dozen" "Greek yogurt, 32 oz plain" "Cottage cheese, 24 oz" "Deli turkey, 1 lb" "Canned tuna, 4 cans" "Black beans, 2 cans" "Rice or quinoa, 1 bag" "Whole wheat wraps or bread" "Broccoli, 3 crowns" "Spinach, 1 large bag" "Bananas and berries" "Peanut butter" "Protein powder, if low" +check
save groceries
```

Want me to turn this into a meal-by-meal plan?
````

### list-packing (pass)

**Chris:** Mick has a field trip tomorrow to the science museum. Packing list?

Good: A checklist. One line of text.

````
Here's a basic kit for a 9-year-old's museum day. Check the permission slip for anything school-specific, like a required t-shirt or lunch rules.

```yui
list "Mick: science museum" "Signed permission slip" "Bagged lunch + snacks" "Refillable water bottle" "Small backpack" "Light jacket (museum AC)" "Comfy closed-toe shoes" "Money for gift shop (optional)" +check
```
````

### teach-compound-interest (pass)

**Chris:** Explain compound interest to Mick, he's 9. Make it something he can play with.

Good: Something interactive: a calc with sliders, or a short deck with a quiz question.

````
Here's a lesson for Mick. It ends with sliders he can play with.

```yui
>full
deck "Money that grows babies"
page "Your money has babies" body="Put $10 in a bank. Each year the bank pays you 10% for keeping it there. That's $1 extra, just for waiting."
shapes
shape circle "$10" +grow
shape arrow
shape blob "$11" +pulse tone=mint
page "Then the babies have babies" body="Next year the bank pays on all $11, not just your first $10. So you get $1.10 this time. Your extra money makes its own extra money."
shapes
shape circle "$11"
shape arrow
shape blob "$12.10" +pulse tone=butter
page "Waiting makes it huge" body="At first it's slow. Then it takes off like a rocket."
chart line "$10 at 10% a year" x=Now|Year 5|Year 10|Year 15|Year 20 y=10|16|26|42|67
choose "Which has the most money to grow next year?" "Your first $10 only"|"Your $10 plus all the extra" answer="Your $10 plus all the extra"
page "Your turn" body="Slide the numbers and watch. What if you start with more? Or wait longer?"
calc f="A = P*(1+r)^t" P=10-100@10 r=0-0.2@0.05 t=0-20@5
choose "What next?" "Quiz me again"|"Do it with $100"|"Why do you ask?"
end
```
````

### no-html-pricing (pass)

**Chris:** Show me a clean pricing table for my three coaching tiers: Starter $500/mo 2 calls, Growth $1,500/mo weekly calls, Partner $4,000/mo unlimited.

Good: A YL table (header row then one row per tier) or three cards. No HTML, no markdown table, no JSON.

````
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
plan "Weekend trip" submit="Build it"
choose "Where to?" "Key West"|"St. Augustine"|Orlando|Savannah|"Surprise me" +other
choose "Budget for the whole trip?" "Under $500"|"$500-1,000"|"$1,000-2,000"|"$2,000+" +other
choose "Which weekend?" "This weekend"|"Next weekend"|"In two weeks"|"Later in October" +other
end
```
````

### flow-findings-then-questions (pass)

**Chris:** Here are this morning's notes on the site review: the pricing page loads in 4.1 seconds on a phone, mostly two uncompressed hero images; the signup form drops the UTM tags; and the new FAQ block gets the most clicks after the hero. Walk me through what you found, then ask me what to fix first and whether to ship today or tomorrow.

Good: One plan: a page per finding with a real sentence or points, then 'fix first' and 'ship when' as questions, one submit. Not a deck followed by separate questions.

````
Three findings from your notes, then two calls for you.

```yui
plan "Site review" submit="Set the plan"
page "Pricing page is slow" body="It takes 4.1 seconds to load on a phone. Two uncompressed hero images account for most of that. Compressing them is the biggest speed win and doesn't change the design."
page "Signup loses attribution" body="The signup form drops the UTM tags, so new signups can't be tied to the campaign that brought them. Paid and email results will look worse than they are until this is fixed."
page "The FAQ block is working" body="It gets the most clicks after the hero. Leave it alone. It's worth moving higher on the page later, once the speed and tracking fixes are in."
choose "What should be fixed first?" "Hero images"|"UTM tags"|"Both together"
choose "When should it ship?" Today|Tomorrow
end
```
````

### save-reusable-workout (pass)

**Chris:** Give me a quick 20 minute Tabata I can come back to on busy days.

Good: A Tabata timer (it takes the stage on its own) and a `save` with a short name so it lands on the shelf. No re-asking what they want.

````
Five 4-minute Tabata blocks, 20 seconds on and 10 off, eight rounds each. Go straight from one block to the next.

```yui
card "20-Min Tabata" body="1. Goblet squats (heavy DB)\n2. Push-ups\n3. One-arm DB rows (alternate sides)\n4. DB swings\n5. Mountain climbers\n\n20 on / 10 off x 8 per block. 5 blocks, 20 min." cta="Start block 1"
save workout
```
````

### show-saved-workout (pass)

**Chris:** Slammed again today. Pull up my busy day workout.

Good: `show busy-day` (the name it saved), one short line, no re-sent timer.

````
Here's your busy-day workout. Twenty minutes, go.
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
Six changes, grouped into four pages.

```yui
>full
deck "Delivery this week"
page "Exactly once, both ways" body="Replies to and from an agent now arrive one time, no more and no fewer. Each side acks what it received, so a retry can't double a message."
shapes caption="Every message waits for its ack."
shape circle Phone
shape arrow
shape pill Agent +pulse
shape arrow
shape dot Ack tone=mint
page "A reply outbox on disk" body="Agent replies are written to disk before they're sent, and removed once acked. If something drops mid-send, the reply is still there."
shapes caption="Saved first, sent second, cleared on ack."
shape box Reply
shape arrow
shape box Outbox +fill +pulse
shape arrow
shape circle Phone
page "Presence, quieter pushes, mute" body="Each agent reads online, asleep or offline. Pushes skip a phone already watching that thread. Muted agents stay silent."
sketch "Agent list" frame=phone
row "Urza: online" +hi note="per agent"
row "Research: asleep"
row "Builder: offline"
row "Push while thread is open" +x note="skipped"
row "Muted agent" +x note="no pushes"
page "Not listening yet" body="A paired agent whose gateway never started now says so, and shows the restart command, instead of looking offline."
sketch "Paired agent" frame=phone
row "Builder: not listening yet" +hi note="gateway never started"
row "Restart command shown here" +button
choose "What next?" "Mute an agent"|"Check presence now"|"Why do you ask?"
end
```
````

### talk-keep-plan-editable (pass)

**Chris:** Lay out my runs for this week somewhere I can keep looking at it, and I'll tell you what to change as the week goes.

Good: The week on a page (`>2 list@runs Runs "Tue 5k"|"Thu 5k"|"Sat 10k" +check`) with `>2 talk` so they can type changes right there, and one short line in the chat.

````
It's on screen 2, so swipe over. I guessed at your mileage, so tell me what to change and I'll patch it as the week goes.

```yui
>2 table "Runs this week" Day|Run|Effort "Mon|Rest|-" "Tue|Easy 3 mi|Conversational" "Wed|Strength at home|-" "Thu|4 x 4 min hard, 2 min jog|Hard but even" "Fri|Rest|-" "Sat|Long 5 mi|Easy" "Sun|Rest or walk|-"
>2 talk
```
````

### draw-screen-fix (pass)

**Chris:** The build-ready screen shows the headline, two lines of notes, then a Got it button and an Install button. Which of those should go, and why? Show me on the screen itself.

Good: A `sketch` of the screen (frame=phone) with the headline and notes as rows, Got it as a +button row struck out (+x) with a short note (it does nothing), Install as a +button row highlighted. At most a line of chat.

````
Got it goes. It only acknowledges, so it does nothing. Install is the one action.

```yui
sketch "Build-ready screen" frame=phone
row "Build 82 is ready" 
row "Adds A2A agent support. Pair the bridge to try it."
row "Got it" +button +x note="does nothing"
row "Install" +button
after
row "Build 82 is ready"
row "Adds A2A agent support. Pair the bridge to try it."
row "Install" +button +hi note="the only action"
```
````

### report-pages-picture (pass)

**Chris:** Walk me through the three changes to how you write updates to me this week, one at a time: you name cards in plain words instead of ids like YUI-83, a long update comes as pages instead of a wall of text, and cards no longer end in a 'Got it' button that does nothing. For each one, show me what it looked like before and after.

Good: One short line and a deck of three pages, one change each, and each page's picture a sketch right after it: the old wording or button struck out (+x), the new one highlighted (+hi), ideally split with `after`. No paragraph.

````
Three changes, before and after on each.

```yui
>full
deck "Three changes to my updates"
page "Cards get plain names" body="I say what a card is about, not its id. An id means nothing to you."
sketch "Parking a card" frame=bubble
row "Parked YUI-83 in the backlog" +x note="an id means nothing"
after
row "Parked the drawing card in the backlog" +hi note="plain words"
page "Long updates come as pages" body="Anything with several parts is short pages you swipe, one idea each."
sketch "A long update" frame=phone
row "Build 82 shipped, the A2A bridge works with ADK, LangGraph and CrewAI, tests passed 42/42, 4/4 and 66/66, and the invite flow was also reworked and..." +x note="a wall of text"
after
row "Build 82 is ready" +hi note="one line up top"
row "Page 1: A2A agents" note="what changed"
row "Page 2: Tested" note="the numbers"
page "No more empty buttons" body="A button now does something. If a card has nothing to act on, it has no button."
sketch "End of a card" frame=bubble
row "Build 82 is ready" 
row "Got it" +button +x note="does nothing"
after
row "Build 82 is ready"
row "Open TestFlight" +button +hi note="a real action"
choose "What next?" "Show a sample update"|"Why do you ask?" +other
end
```
````

### menu-shortcut (pass)

**Chris:** I log breakfast every single morning. Give me a one-tap way to do it from now on.

Good: A shortcut in the drawer (`menu shortcut@breakfast "Log breakfast" say="Log breakfast: "`) and one short line saying where it lives. No button that only acknowledges.

````
Done. "Log breakfast" is now a shortcut on your home screen and in the drawer.

```yui
menu shortcut "Log breakfast"
card "Log breakfast" body="One tap on your home screen. I'll ask for a photo or a quick description."
```
````

### flow-interview-old-app (pass)

**Chris:** Interview me for a personal brand site.

Good: TestFlight feedback AMLn-Gg3 (YUI-155): one short line and the questions, as the saved `flow website-intake` or a plan. On build 205, which runs no flows, the plugin sends the flow as the plan it walks, so the phone shows questions, never a bare headline.

````
Quick interview, one question per screen.

```yui
flow website-intake
```
````

### show-phase-one (pass)

**Chris:** Walk me through phase one. (What you know: phase one of the full-screen change. Answers play as full-screen chunks, and the chat is just the record, top right. Bottom right: a bigger mic, a T that opens the text field, and a + for attachments, including images. Settings sit behind a hamburger at top left, beside the agent picker.)

Good: A line and a drawing per part: the stage with a chunk on it, the record top right, the new bottom bar (big mic, T, +). Never a page with a heading over a paragraph (feedback AL1My-stUBnvtXD2WKV7ec8, YUI-119).

````
Phase one puts the answer first and moves everything else to the edges.

```yui
>full
deck "Phase one: full screen"
page "Answers take the screen" body="Each answer plays as a full-screen chunk. The chat stops being the main view."
sketch frame=phone
row "Yes. Build 160, the newest." +hi note="one chunk, full screen"
row "Next chunk plays after" note="then the next"
page "Top of the screen" body="Settings sit behind a hamburger at top left, beside the agent picker. Chat is the record, top right."
sketch frame=phone
row "≡  Agent picker" +button +hi note="settings behind ≡"
row "Chat" +button +hi note="the record, top right"
page "Bottom of the screen" body="A bigger mic, a T that opens the text field, and a + for attachments, images included."
sketch frame=phone before=Now
row "+  Say something  Mic" +button +x note="a field always open"
after New
row "+   T   Mic" +button +hi note="big mic; T types; + attaches"
choose "What next?" "Try the new bar"|"See the chat record"|"Why do you ask?"
end
```
````

### music-chords-song (pass)

**Chris:** I want to strum along to one of those four chord pop songs on my uke. G is a good key for me.

Good: One `chords` line in G (`chords G I-V-vi-IV` or `chords G|D|Em|C`), a short line at most. No chord names in a paragraph, no chord diagrams in text.

````
G, D, Em, C is the classic. It fits "Let It Be", "Don't Stop Believin'" and "Someone Like You".

```yui
chords G I-V-vi-IV
```
````

### list-no-escaped-breaks (pass)

**Chris:** What should I eat for dinner tonight? Something with protein. I'm allergic to peanuts and shellfish.

Good: A few dinners as a `list` (or cards), one per item, and a way to pick one. Never one `say` with \n breaks inside the quotes: the app shows the letter n (YUI-161, GLM 5.2 on native Basil).

````
Sheet-pan lemon-herb chicken with sweet potatoes and broccoli. It's one pan, peanut- and shellfish-free, and Mick will eat it.

```yui
card "Sheet-pan lemon chicken" body="6 oz chicken thighs, 1 sweet potato, 2 cups broccoli, olive oil, lemon, garlic. 425°F for 25 to 30 min. About 45 g protein, 550 cal."
```
````

### last-page-walkthrough (pass)

**Chris:** Walk me through what changed on the closing purple box, step by step.

Good: A deck (or plan) of the changes, each with its picture, and the last step is something to tap: a `choose` of what to do next or 'Why do you ask?'. No dead end.

````
Four changes, in the order they'd show on the page.

```yui
deck "Closing purple box" +inline
page "Red frame is gone" body="The red placeholder frame that sat in the box is removed. The box is now just the purple section."
sketch "Closing box" frame=window
row "Red placeholder frame" +x note="removed"
after
row "Purple box, no frame" +hi note="clean"
page "Client's final copy" body="The placeholder text is replaced with the client's final copy, word for word."
sketch "Box copy" frame=window
row "Placeholder text" +x note="replaced"
after
row "Client's final copy" +hi note="word for word"
page "ZIP field and two questions" body="The box has a working ZIP field and a two-question form. Their answers go straight into the lead record."
sketch "The form" frame=phone
row "Your ZIP" +hi note="new, working"
row "Question 1" +hi note="new"
row "Question 2" +hi note="new"
row "Answers: into lead record" note="no manual step"
page "Buttons" body="Two buttons now close the box, with the final labels."
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
sketch "Sample status board (example)" frame=window
row "Site: good"
row "Checkout: slow" +hi note="example"
row "Builds: passing"
row "Backups: overdue" +hi note="example"
row "SEO: strong"
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

### showpick-two-looks (pass)

**Chris:** Show me the two card styles again so I can pick. (What you just looked up: playground demo https://www.yuigui.com/playground?demo=card-style. Shots: /demo/s1.jpg Soft, /demo/s2.jpg Sharp.)

Good: A gallery or compare of the two shots with the pick right there. Not a card that only opens the playground.

````
Here are both card styles.

```yui
gallery /demo/s1.jpg /demo/s2.jpg +pick
```
````
