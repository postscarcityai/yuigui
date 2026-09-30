# Channel eval: jev215-hint-r2

Guide v43+22b9cd60 (4614 words), model claude-sonnet-5-5, 2026-09-30T16:18.

**30/37 passed (81%).**

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
| show | 2/4 |
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
| show-phase-one | FAIL | screen: no ```yui block; fence: Yui Lines outside the ```yui block; need: none of [sketch shapes]; words: 148 > 40; show: nothing drawn |
| music-chords-song | pass |  |
| explain-monsoon-how | FAIL | screen: no ```yui block; need: none of [map shapes chart image]; drawn: no map, chart, timeline or image, only words and numbers |
| where-delivery-area | pass |  |
| list-no-escaped-breaks | pass |  |
| last-page-walkthrough | pass |  |
| outcome-invite-declined | FAIL | screen: no ```yui block; need: none of [sketch]; words: 32 > 15; text: "so"; struck: nothing struck out for the outcome |
| outcome-worker-running | FAIL | screen: no ```yui block; need: none of [shapes sketch timeline]; words: 29 > 20; worker: no pulsing shape or sketch of the worker at work |
| context-sample-not-ask | pass |  |
| showhere-after-linkout | pass |  |
| showlean-waiting | FAIL | screen: no ```yui block; need: none of [sketch compare gallery image camera list]; words: 31 > 30; show here: nothing drawn in the thread |
| showpick-two-looks | pass |  |

## Transcripts

### workout-leg-day (pass)

**Chris:** Leg day. I have 40 minutes, home gym.

Good: A short line, then the session on screen (a checklist or a card) with a way to start (ask or timer). No interrogation: he already said time and gear.

````
Here's a 40-minute session built around 50 lb max, so we go unilateral and slow.

```yui
card "Leg day, 40 min" body="Warm-up 5 min: bodyweight squats, hip bridges, leg swings. Bulgarian split squat 4x8/leg, 3-sec lowering. DB Romanian deadlift 4x10. Goblet squat 3x12, 1-sec pause at the bottom. Band-resisted glute bridge 3x15. Single-leg calf raise 3x15/leg. Rest 60-90s between sets." cta="Start" +fold
```
````

### checkin-morning (FAIL)

**Chris:** morning check-in

Good: Sleep, soreness and energy as sliders or a short form (quoted title), or a plan that walks them one at a time, or the saved `flow workout-checkin` (it asks the same). Not a wall of questions in text.

- screen: no ```yui block
- need: none of [slide form plan choose flow]

````
Morning, Chris. How'd you sleep, and what's your energy like for a session before Mick gets out at 2?
````

### today-plan (pass)

**Chris:** What should I do today?

Good: Without calendar access it proposes a shape for the day or asks one thing (energy, top priority) as buttons. Remembers Mick at 2 pm. Not a text essay.

````
I can't see your calendar or inbox from here, so this is a skeleton built around what I know.

```yui
card "Today" body="Morning: home gym session, then your top priority while you're fresh. Midday: email and errands. 1:45 pm: leave for Mick, out at 2. Afternoon: light tasks and homework time with him."
```

Tell me what's on your calendar and I'll fit it in.
````

### decision-three-options (pass)

**Chris:** Help me pick which to do first this afternoon: invoice Heathos, reply to Paul about Plannix, or fix the Yui site footer.

Good: A recommendation plus the three as buttons (or an ordered list with +check). No essay.

````
Invoice Heathos first: it's quick and it's money. Then Paul, then the footer. Mick is out at 2, so get the two short ones done before pickup and save the footer for after.

```yui
card "Order for this afternoon" body="1. Invoice Heathos (money, quick)\n2. Reply to Paul about Plannix\n3. Yui site footer (after 2 pm pickup)"
```
````

### list-groceries (pass)

**Chris:** Make me a grocery list for high protein meals this week.

Good: A list with +check, a title, and items that fit on a phone.

````
Here's a week of high-protein staples, with enough for Mick to eat along.

```yui
list Groceries "Chicken breast, 3 lb" "Ground turkey, 2 lb" "Salmon fillets, 1.5 lb" "Eggs, 18 count" "Greek yogurt, 32 oz" "Cottage cheese, 16 oz" "Canned tuna, 4" "Black beans, 2 cans" "Rice, 2 lb" "Oats, 1 canister" "Sweet potatoes, 4" "Broccoli, 2 heads" "Spinach, 1 large bag" "Bananas, 1 bunch" +check
save grocery list
```
````

### list-packing (pass)

**Chris:** Mick has a field trip tomorrow to the science museum. Packing list?

Good: A checklist. One line of text.

````
Here's a starter list for tomorrow. Check the teacher's email for a required shirt or lunch rule.

```yui
list "Mick's museum trip" "Sack lunch, labeled" "Water bottle" "Light jacket (museum AC)" "Closed-toe sneakers" "Notebook and pencil" "Signed permission slip / money if needed" "Sunscreen on before the bus" "Small backpack" +check
```
````

### teach-compound-interest (pass)

**Chris:** Explain compound interest to Mick, he's 9. Make it something he can play with.

Good: Something interactive: a calc with sliders, or a short deck with a quiz question.

````
Here's a little lesson for Mick. The last page has sliders he can play with.

```yui
>full
deck "Money that has babies"
page "Your money can grow by itself" body="Put $10 in a bank. The bank pays you a little extra, called interest. Say 10% a year: that's $1 for every $10."
shapes
shape circle "$10" +grow
shape arrow
shape blob "$11" +pulse tone=mint
page "The magic part" body="Next year the bank pays on all $11, including last year's extra dollar. Your extra money gets its own extra money."
shapes
shape circle "$11"
shape arrow
shape blob "$12.10" +pulse tone=mint
shape arrow
shape blob "$13.31" tone=butter
page "Waiting makes it bend" body="At first it's slow. Then it takes off, like a snowball rolling downhill."
chart line "$10 growing 10% a year" x=Now|10yrs|20yrs|30yrs y=10|26|67|174
choose "Why does it grow faster and faster?" "Interest earns interest"|"The bank adds more each day"|"Magic" answer="Interest earns interest"
page "Your turn" body="Slide the money, the rate and the years. What's the biggest number you can make?"
calc f="A = P*(1+r)^t" P=10-100@10 r=0-0.2@0.05 t=0-30@5
choose "What next?" "Quiz me again"|"Make it a game"|"Why do you ask?"
end
```
````

### plain-fact (FAIL)

**Chris:** What's the capital of Portugal?

Good: Lisbon. No screen.

- screen: sent a screen for a plain answer

````
Lisbon is the capital of Portugal.

```yui
map "Portugal" caption="Lisbon sits on the Tagus estuary, by the Atlantic."
area Portugal PT tone=mint
pin@li Lisbon 38.72,-9.14 +pulse
```
````

### plain-thanks (pass)

**Chris:** thanks, that's all for today

Good: A short sign-off. No screen, no follow-up questions.

````
Nice work today, Chris. Go enjoy pickup with Mick at 2.
````

### plain-explain (pass)

**Chris:** In two sentences, what's a deload week?

Good: Two sentences. No screen: he asked for words.

````
A deload week is a planned easy week where you cut your training volume or intensity (usually by about 40 to 50 percent) so your body can recover and absorb the past few weeks of hard work. You typically take one every 4 to 8 weeks, keeping the same movements but using lighter weights or fewer sets so you come back stronger instead of run down.
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
table "Coaching tiers" Tier|Price|Calls "Starter|$500/mo|2 per month" "Growth|$1,500/mo|Weekly" "Partner|$4,000/mo|Unlimited"
```
````

### dead-plan-submit (pass)

**Chris:** Walk me through planning a weekend trip: where, budget, and dates. I'll answer on screen.

Good: A plan with one step per question, ending in a submit named for what happens ("Send", "Plan it", "Find trips"), not "Create project".

````
Three quick questions, then I'll build options.

```yui
plan "Weekend trip" submit="Find options"
choose "Where to?" "Florida Keys"|"St. Augustine"|"Orlando"|"Savannah"|"Charleston" +other
choose "Budget for the whole trip?" "Under $500"|"$500-1,000"|"$1,000-2,000"|"$2,000+" +other
choose "When?" "This weekend"|"Next weekend"|"In two weeks"|"Later this fall" +other
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
page "Pricing page is slow" body="It loads in 4.1 seconds on a phone. Most of that is two uncompressed hero images. Compressing them is the biggest speed win and a small change."
page "Signup drops UTM tags" body="The signup form loses the UTM tags, so signups can't be traced to a campaign. Every signup until this is fixed is lost attribution that can't be recovered."
page "FAQ block is working" body="The new FAQ block gets the most clicks after the hero. Nothing is broken there. It's worth keeping prominent, and it's a candidate to move higher on the page."
choose "What should be fixed first?" "Hero image compression"|"UTM tags on signup"|"FAQ placement" +other
choose "When should it ship?" Today|Tomorrow
end
```
````

### save-reusable-workout (pass)

**Chris:** Give me a quick 20 minute Tabata I can come back to on busy days.

Good: A Tabata timer (it takes the stage on its own) and a `save` with a short name so it lands on the shelf. No re-asking what they want.

````
Five 4-minute blocks, 20 sec on / 10 sec off x8, back to back. Saved to your shelf as "workout".

```yui
card "20-min Tabata" body="1 Goblet squat (50 lb) | 2 Push-ups | 3 One-arm DB row (switch each round) | 4 DB swings | 5 Mountain climbers. Swap in pull-ups for rows if you feel good."
save workout
```
````

### show-saved-workout (pass)

**Chris:** Slammed again today. Pull up my busy day workout.

Good: `show busy-day` (the name it saved), one short line, no re-sent timer.

````
Here's your busy day Tabata. Mick's out at 2, so this fits before pickup.
```yui
show busy-day
```
````

### game-offer (pass)

**Chris:** Build's still going. Play a quick game of tic-tac-toe with me?

Good: One `game tictactoe` line and at most a few words. No board drawn by hand, no list of cells.

````
Sure. You go first, X is yours.
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
deck "Yui delivery this week"
page "Exactly once, both ways" body="Every message and reply carries an ack. A send is retried until acked and never shown twice. Replies also wait in an outbox on disk, so a crash or dropped connection loses nothing."
shapes
shape circle Agent
shape arrow
shape box "Outbox on disk" +fill
shape arrow
shape pill Phone +pulse
page "Presence per agent" body="Each agent now reads online, asleep or offline, so you can tell whether it's about to answer."
sketch "Agent list" frame=phone
row "Urza: online" +hi
row "Coder: asleep" note="wakes on message"
row "Scout: offline" note="not reachable"
page "Quieter pushes" body="If your phone is already watching a thread, no push fires for it. You can also mute any agent."
sketch "Push rules" frame=bubble
row "Push while thread is open" +x note="skipped now"
row "Muted agent: no pushes" +hi note="per agent"
page "Not listening yet" body="A paired agent whose gateway never started used to look fine but stay silent. Now it says 'not listening yet' and shows the restart command."
sketch "Paired agent" frame=phone
row "Scout: not listening yet" +hi note="gateway never started"
row "Restart command shown" +button
choose "What next?" "Mute an agent"|"Check who's online"|"Why do you ask?"
end
```
````

### talk-keep-plan-editable (pass)

**Chris:** Lay out my runs for this week somewhere I can keep looking at it, and I'll tell you what to change as the week goes.

Good: The week on a page (`>2 list@runs Runs "Tue 5k"|"Thu 5k"|"Sat 10k" +check`) with `>2 talk` so they can type changes right there, and one short line in the chat.

````
Runs are on screen 2, swipe over to see them. I guessed at your base, so tell me what to change.

```yui
>2 table "Runs this week" Day|Run|Note "Thu|Easy 30 min|Done before 2 pm pickup" "Fri|Rest|Bands or walk" "Sat|Long 50 min|Easy pace, start early for the heat" "Sun|Easy 25 min|Loose legs" 
>2 talk
save run week
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
row "Note line one"
row "Note line two"
row "Got it" +button +x note="only acknowledges"
row "Install" +button
after
row "Build 82 is ready"
row "Note line one"
row "Note line two"
row "Install" +button +hi note="the one action"
```
````

### report-pages-picture (pass)

**Chris:** Walk me through the three changes to how you write updates to me this week, one at a time: you name cards in plain words instead of ids like YUI-83, a long update comes as pages instead of a wall of text, and cards no longer end in a 'Got it' button that does nothing. For each one, show me what it looked like before and after.

Good: One short line and a deck of three pages, one change each, and each page's picture a sketch right after it: the old wording or button struck out (+x), the new one highlighted (+hi), ideally split with `after`. No paragraph.

````
Three changes, one page each, with before and after.

```yui
>full
deck "Three changes to my updates"
page "1. Cards in plain words" body="I name a card by what it is, not by its id."
sketch "Example: card names" frame=bubble
row "Parked YUI-83 in the backlog" +x note="an id means nothing"
after
row "Parked the drawing card in the backlog" +hi note="plain words"
page "2. Long updates as pages" body="A long update is a headline and a few short pages you swipe through."
sketch "Example: a long update" frame=bubble
row "Build 82 is ready. Latest change: A2A bridge, add any A2A agent by its Agent Card. Pair the bridge, point it at the card. Tests: client 42/42, interop 4/4, e2e 66/66..." +x note="wall of text"
after
row "Build 82 is ready" +hi note="one line"
row "A2A agents" +hi note="page 1"
row "Tested: 42/42, 4/4, 66/66" +hi note="page 2"
page "3. No 'Got it' buttons" body="A button only shows up when tapping it does something."
sketch "Example: a card" frame=phone
row "Build 82 is ready" 
row "Got it" +button +x note="did nothing"
after
row "Build 82 is ready" +hi
row "Open TestFlight" +button +hi note="acts"
choose "What next?" "Show me a real update"|"Change how I write them"|"Why do you ask?"
end
```
````

### menu-shortcut (pass)

**Chris:** I log breakfast every single morning. Give me a one-tap way to do it from now on.

Good: A shortcut in the drawer (`menu shortcut@breakfast "Log breakfast" say="Log breakfast: "`) and one short line saying where it lives. No button that only acknowledges.

````
Done. "Log breakfast" is now a chip on your home screen. Tap it and I'll open the camera for your plate.

```yui
menu shortcut "Log breakfast"
card "Log breakfast" body="On your home screen. Tap, then snap your plate."
```
````

### flow-interview-old-app (pass)

**Chris:** Interview me for a personal brand site.

Good: TestFlight feedback AMLn-Gg3 (YUI-155): one short line and the questions, as the saved `flow website-intake` or a plan. On build 205, which runs no flows, the plugin sends the flow as the plan it walks, so the phone shows questions, never a bare headline.

````
Starting the website brief. One question per screen.

```yui
flow website-intake
```
````

### short-release-go-ahead (pass)

**Chris:** OK, yeah go ahead and release that. I want to play with the music tools. (What you just did: started the 0.3.2 release; a worker is building it now and it reaches TestFlight in about 40 minutes. It leaves out the faster Send tap, which is not done yet.)

Good: One line: 0.3.2 is building, on TestFlight in about 40 minutes with keys and chords; the Send tap fix waits. No deck, no 'what happens next' pages (YUI-118).

````
0.3.2 is building now and should reach TestFlight in about 40 minutes, with keys and chords included. The faster Send tap isn't done, so it's not in this one.
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

### show-phase-one (FAIL)

**Chris:** Walk me through phase one. (What you know: phase one of the full-screen change. Answers play as full-screen chunks, and the chat is just the record, top right. Bottom right: a bigger mic, a T that opens the text field, and a + for attachments, including images. Settings sit behind a hamburger at top left, beside the agent picker.)

Good: A line and a drawing per part: the stage with a chunk on it, the record top right, the new bottom bar (big mic, T, +). Never a page with a heading over a paragraph (feedback AL1My-stUBnvtXD2WKV7ec8, YUI-119).

- screen: no ```yui block
- fence: Yui Lines outside the ```yui block
- need: none of [sketch shapes]
- words: 148 > 40
- show: nothing drawn

````
Phase one puts the answer first and the chat behind it.

````
>full
```yui
deck "Phase one, full screen"
page "Answers take the screen" body="Each answer plays as its own full-screen chunk. The chat is still there as the record, top right."
sketch "Answer screen" frame=phone
row "Yes. Build 160, the newest." +hi note="one chunk, full screen"
row "Chat" +button note="the record, top right"
page "Talk first" body="The bottom right is a bigger mic. T opens the text field, and + attaches files or images."
sketch "Bottom bar" frame=phone
row "+   T   Mic" +button +hi note="big mic; T opens text"
row "+ adds photos and files" note="attachments"
page "Settings move up" body="A hamburger at top left holds settings, right beside the agent picker."
sketch "Top bar" frame=phone
row "☰  Agent picker         Chat" +button +hi note="settings behind ☰"
choose "What next?" "Try the mic"|"See phase two"|"Why do you ask?"
end
```
````
````

### music-chords-song (pass)

**Chris:** I want to strum along to one of those four chord pop songs on my uke. G is a good key for me.

Good: One `chords` line in G (`chords G I-V-vi-IV` or `chords G|D|Em|C`), a short line at most. No chord names in a paragraph, no chord diagrams in text.

````
G, D, Em, C is the classic four-chord loop (think "Let It Be" or "Someone Like You"). Strum down-down-up-up-down-up on each chord.

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
In summer, the land heats up faster than the Indian Ocean, so rising hot air over India pulls in cool, moisture-heavy wind from the ocean, and that wind drops its water as monsoon rain.
````

### where-delivery-area (pass)

**Chris:** Our farm delivers CSA boxes across Vermont, New Hampshire and western Massachusetts. Can you show a new customer what that covers?

Good: One line, then a map with the delivery area filled in (VT and NH by code, western Massachusetts as lat,lon points) and the farm or the big towns as pins. Not a list of states and counties.

````
Here's where your CSA boxes go.

```yui
map "Farm CSA delivery area" caption="Vermont, New Hampshire and western Massachusetts."
area Vermont 45.01,-73.34|45.01,-71.5|44.4,-71.6|43.7,-72.3|42.73,-72.46|42.73,-73.27|43.6,-73.4|44.2,-73.4 tone=mint +pulse
area "New Hampshire" 45.3,-71.08|44.3,-71.0|43.6,-70.98|43.07,-70.71|42.7,-71.17|42.73,-72.46|43.7,-72.3|44.4,-71.6|45.0,-71.5 tone=lavender
area "Western Mass" 42.74,-73.27|42.74,-72.46|42.03,-72.5|42.03,-73.49|42.5,-73.35 tone=butter
card "CSA box delivery" body="Vermont, New Hampshire and western Massachusetts"
```

The western Mass border is drawn roughly. If you tell me which counties or towns you actually cover, I'll tighten it.
````

### list-no-escaped-breaks (pass)

**Chris:** What should I eat for dinner tonight? Something with protein. I'm allergic to peanuts and shellfish.

Good: A few dinners as a `list` (or cards), one per item, and a way to pick one. Never one `say` with \n breaks inside the quotes: the app shows the letter n (YUI-161, GLM 5.2 on native Basil).

````
Sheet-pan lemon-garlic chicken with sweet potatoes and broccoli. It's one pan, and Mick will likely eat it too.

```yui
card "Lemon-garlic chicken sheet pan" body="Chicken thighs, cubed sweet potato and broccoli on one pan. Olive oil, lemon, garlic, paprika, salt. 425°F for 30 to 35 min. About 40 g protein and 550 cal per plate. No peanuts or shellfish, just check that your spice blend and oil don't contain peanut."
```
````

### last-page-walkthrough (pass)

**Chris:** Walk me through what changed on the closing purple box, step by step.

Good: A deck (or plan) of the changes, each with its picture, and the last step is something to tap: a `choose` of what to do next or 'Why do you ask?'. No dead end.

````
The closing purple box changed in four steps.

```yui
deck "Closing purple box" +inline
page "Final copy" body="The placeholder text is replaced with the client's final copy, word for word."
sketch "Purple box" frame=window
row "Placeholder text" +x note="draft"
after
row "Client's final copy" +hi note="word for word"
page "Red frame gone" body="The red placeholder frame that marked the unfinished spot is removed."
sketch "Purple box" frame=window
row "Red placeholder frame" +x note="removed"
after
row "Clean purple box" +hi
page "ZIP and two questions" body="The box has a working ZIP field and a two-question form. Their answers go straight into the lead record."
sketch "Form" frame=phone
row "Your ZIP" +hi note="works now"
row "Question 1" +hi
row "Question 2" +hi
row "Answers: lead record" note="sent on submit"
page "New buttons" body="The two buttons now read exactly as the client asked."
sketch "Buttons" frame=phone
row "See My Coverage Options" +button +hi
row "Talk to a Licensed Advisor" +button +hi
choose "What next?" "See the form fields"|"Check a lead record"|"Why do you ask?"
end
```
````

### outcome-invite-declined (FAIL)

**Chris:** I declined the Friday 3 pm team sync invite from Dana like you said. What's the state? (What you just did: declined it on the calendar, no reply message sent to Dana.)

Good: A sketch of the invite row struck out (+x) with note=declined. A few words. If it asks about Dana it is one choose on the same screen, never 'do you want to do what the previous page said'.

- screen: no ```yui block
- need: none of [sketch]
- words: 32 > 15
- text: "so"
- struck: nothing struck out for the outcome

````
The Friday 3 pm team sync is declined on your calendar, and no message went to Dana, so Dana will only see the decline status. Want me to draft a short note?
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
Here's a sample board with made-up rows.

```yui
sketch "Sample status board (example)" frame=window
row "Site: good"
row "Build: passing"
row "Inbox: 3 waiting" +hi note="needs reply"
row "Workout: done"
row "Mick pickup: 2 pm" +hi note="leave 1:45"
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

### showlean-waiting (FAIL)

**Chris:** What are you waiting on me for with this? (What you just looked up: the site refresh card is done except before and after shots of the hero for the progress page. Page: https://www.yuigui.com/progress. Nothing else is open.)

Good: The ask drawn here (a sketch with the missing before and after slot, or a camera to snap it). At most a small link under it.

- screen: no ```yui block
- need: none of [sketch compare gallery image camera list]
- words: 31 > 30
- show here: nothing drawn in the thread

````
Nothing from you. The only open piece is the before and after shots of the hero for the progress page, and that's on my side to capture. Nothing else is open.
````

### showpick-two-looks (pass)

**Chris:** Show me the two card styles again so I can pick. (What you just looked up: playground demo https://www.yuigui.com/playground?demo=card-style. Shots: /demo/s1.jpg Soft, /demo/s2.jpg Sharp.)

Good: A gallery or compare of the two shots with the pick right there. Not a card that only opens the playground.

````
Soft or Sharp, tap the one you want.

```yui
gallery /demo/s1.jpg /demo/s2.jpg +pick
```
````
