# Channel eval: v37-glm52-rerun

Guide v37+f825adcb (3479 words), model z-ai/glm-5.2, 2026-09-27T19:05.

**9/21 passed (43%).**

| category | passed |
|---|---|
| scheduling | 0/1 |
| decision | 1/1 |
| secret | 0/1 |
| trap | 1/1 |
| tap | 0/1 |
| dead-button | 1/1 |
| flow | 2/6 |
| mention | 1/1 |
| report | 1/1 |
| group | 0/1 |
| look | 0/1 |
| short | 1/1 |
| doing | 0/1 |
| explain | 1/2 |
| where | 0/1 |

| case | result | why |
|---|---|---|
| schedule-booking-confirmed | FAIL | patch: no ~ patch matching /^choose$/ |
| decision-dinner | pass |  |
| secret-login | FAIL | words: 73 > 70 |
| too-much-week | pass |  |
| tap-choice-builds-next | FAIL | words: 36 > 30 |
| dead-plan-submit | pass |  |
| flow-findings-then-questions | pass |  |
| mention-notes-context | pass |  |
| report-card-done | pass |  |
| talk-keep-plan-editable | FAIL | page: nothing on screen 2 or 3 |
| talk-typed-on-screen | pass |  |
| menu-shortcut | FAIL | words: 58 > 40 |
| menu-tapped | FAIL | preset: slide not in [list table card deck page plan timeline done now next step choose ask pick stat say] |
| group-lead-hands-on | FAIL | no reply: empty answer (finish length) |
| restyle-app-autumn | FAIL | sentences: 2 > 1 |
| flow-interview-old-app | FAIL | need: none of [flow plan]; words: 41 > 40 |
| short-status-latest-build | pass |  |
| doing-long-turn | FAIL | words: 49 > 45; doing: 0 doing lines with words, want 2 |
| explain-rome-rise-fall | FAIL | no reply: empty answer (finish length) |
| explain-monsoon-how | pass |  |
| where-trip-route | FAIL | words: 75 > 40 |

## Transcripts

### schedule-booking-confirmed (FAIL)

**Chris:** [yui] note: the barber's booking page confirmed 11:30 am Saturday.

Good: Confirms in one line and freezes the choice with `~choose +lock` (by preset name, since the id came from an earlier reply). Does not re-send the slots.

- patch: no ~ patch matching /^choose$/

````
Done — haircut Saturday 9/27 at 11:30 am.
````

### decision-dinner (pass)

**Chris:** Sushi or tacos tonight? I can't decide.

Good: Either just pick one with a reason, or two big buttons. Short.

````
Tacos. It's Thursday — taco night is practically law. 🌮

Want me to find a good spot nearby?
````

### secret-login (FAIL)

**Chris:** Log into my Instagram and post the reel from yesterday. What do you need from me?

Good: Never a password field. Says it will not take the password in chat, points to connecting the account or a browser login instead.

- words: 73 > 70

````
I can't log into Instagram for you — I won't handle passwords or credentials. What I *can* do is post through Instagram's API if you connect your account securely in Yui's settings.

Two things from you:

1. **Connect Instagram** — link it under Settings → Connections (I'll never see your password).
2. **Send me the reel file** — drop the video here or tell me where it is (Camera Roll, Files, a link).

```yui
pick "Where's the reel?" "Camera Roll"|Files|"A link"|"Drafts on IG"
```
````

### too-much-week (pass)

**Chris:** Plan my whole week: 4 workouts, meals, deep work blocks, errands, and Mick pickups.

Good: Six components or fewer: a compact overview (table or a few cards) or one question to start a flow. Not 15 lines.

````
I need a few things to make this real rather than guess.

```yui
plan "Week of Sept 24–30" submit="Build my week"
page "Errands" body="What needs running this week? Tap all that apply."
pick "Errands" Groceries|"Dry cleaning"|"Post office"|Pharmacy|"Car wash" +other
page "Day start" body="When do you usually get going? I'll block deep work around it."
choose "Start time" "6 am"|"7 am"|"8 am"|"9 am" +other
page "Meals" body="Anything I should avoid or lean toward?"
choose "Diet" Anything|Low-carb|Paleo|Vegetarian|Keto +other
page "Mick's weekend" body="Any activities Saturday or Sunday I should plan around?"
choose "Weekend" "Free both days"|Sports|"Birthday party"|"Other plans" +other
end
```
````

### tap-choice-builds-next (FAIL)

**Chris:** [yui] n1 choose choice=Legs

Good: Builds the next screen right away (the session or the next question). Does not echo 'You chose Legs'.

- words: 36 > 30

````
Leg day. Here's your session.
```yui
list@legs "Leg day" "Goblet squat 4x10" "RDL 4x10" "Bulgarian split squat 3x8/leg" "Walking lunge 3x12/leg" "Banded glute bridge 3x15" "Calf raise 4x15" +check
```
```yui
timer 60s Rest
```

Grab your dumbbells and start with goblet squats. Tap each exercise when you finish the set. Rest 60 seconds between sets — hit the timer. Let me know when you're rolling.
````

### dead-plan-submit (pass)

**Chris:** Walk me through planning a weekend trip: where, budget, and dates. I'll answer on screen.

Good: A plan with one step per question, ending in a submit named for what happens ("Send", "Plan it", "Find trips"), not "Create project".

````
```yui
plan "Weekend trip" submit="Find options"
page "Where" body="Pick a vibe or name a specific place you have in mind."
choose "Destination" "Beach"|"City break"|"Mountains"|"Stay local" +other
page "Budget" body="Your total spend for the trip — travel, stay, food, fun."
slide "Total budget" 200-2000@100 $200|$2K
page "Dates" body="Which weekend works?"
choose "Weekend" "Sep 26–27"|"Oct 3–4"|"Oct 10–11" +other
```

Three quick questions — tap through and I'll line up options when you submit.
````

### flow-findings-then-questions (pass)

**Chris:** Here are this morning's notes on the site review: the pricing page loads in 4.1 seconds on a phone, mostly two uncompressed hero images; the signup form drops the UTM tags; and the new FAQ block gets the most clicks after the hero. Walk me through what you found, then ask me what to fix first and whether to ship today or tomorrow.

Good: One plan: a page per finding with a real sentence or points, then 'fix first' and 'ship when' as questions, one submit. Not a deck followed by separate questions.

````
Here's what the review turned up — three findings, then your call on priority and timing.

```yui
plan "Site review: findings & next steps" submit="Set the plan"
page "Pricing page — 4.1s on phone" body="Two uncompressed hero images account for most of the load time. Compressing them should roughly halve it."
page "Signup form — UTMs dropped" body="The form strips UTM tags before submission, so every signup loses its campaign attribution."
page "FAQ block — high engagement" body="The new FAQ gets the most clicks after the hero. It's pulling weight — worth keeping and maybe expanding."
page "What to fix first, and when to ship" body="Pick the priority and your ship window."
choose "Fix first?" "Pricing images"|"UTM tags"|"FAQ block" +other
choose "Ship when?" "Today"|"Tomorrow"
end
```
````

### mention-notes-context (pass)

**Chris:** [yui] note: in this thread the person asked Arnold, not you: @Arnold does this fit my knee?
[yui] note: Arnold answered here: Swap back squats for box squats and lunges for glute bridges. Keep the tabata.
Ok, update my Saturday plan with that.

Good: The Saturday plan again with Arnold's swaps in it (box squats, glute bridges, the tabata kept), on screen. No questions about what Arnold said.

````
Saturday plan updated with Arnold's swaps:

- Back squats → **Box squats**
- Lunges → **Glute bridges**
- Tabata stays as-is

```yui
list "Saturday — Updated" "Box squats" "Glute bridges" "Tabata (keep)" +check
```

Want me to set a start time or leave it open?
````

### report-card-done (pass)

**Chris:** The worker just finished card INT-18 on the board. Its handoff summary: "A2A bridge: add any A2A agent to Yui by its Agent Card. node adapters/a2a/yui-a2a.ts pair <code> --card <url>, then run; add --card <url> puts more agents on the same machine. Runtime-neutral TypeScript client (src/a2a.ts + src/sse.ts, fetch and an SSE parser only, so the hosted step runs the same code in a Durable Object): A2A 1.0 SendMessage / SendStreamingMessage / SubscribeToTask / GetTask / CancelTask and 0.3 message/send, message/stream, tasks/resubscribe, tasks/get, one version-free shape for callers. The bridge keeps the relay's rules (delivered on pickup, handled after the answer, outbox on disk, one turn at a time per agent). Tests: client.test.ts 42/42; sdk_interop.test.ts 4/4 against the official a2a-sdk servers (1.1.5 and 0.3.26); a2a_e2e.py 66/66 live on throwaway accounts (kill -9 mid-task resumes the same task and answers once) plus the phone run 6/6 on the iPhone 18 Pro sim. No app binary change (INT-18)" Tell me what shipped.

Good: One short line, a card with the headline (A2A agents can join Yui), and the detail as a deck of short pages (what it does, how to add one, the test counts as points). No paragraph relaying the summary.

````
INT-18 shipped. The A2A bridge lets you add any A2A agent to Yui by its Agent Card — pair it with `node adapters/a2a/yui-a2a.ts pair <code> --card <url>`, and it runs.

```yui
card "INT-18 shipped" body="Add any A2A agent by its Agent Card. No app binary change." cta="Open the board"
deck "What shipped" +inline
page "The bridge" body="Pair an agent by its card URL and it talks in Yui. Multiple agents can share one machine. The relay's rules carry over: delivered on pickup, handled after the answer, outbox on disk, one turn at a time per agent."
page "Runtime-neutral client" body="A TypeScript client (src/a2a.ts + src/sse.ts) using only fetch and an SSE parser. Same code runs in a Durable Object. Covers A2A 1.0 (SendMessage, SendStreamingMessage, SubscribeToTask, GetTask, CancelTask) and 0.3 (message/send, message/stream, tasks/resubscribe, tasks/get) behind one version-free shape."
page "Tested" points="Client 42/42"|"SDK interop 4/4 (a2a-sdk 1.1.5 + 0.3.26)"|"Live e2e 66/66 (kill -9 resumes, answers once)"|"iPhone 18 Pro sim 6/6"
end
```
````

### talk-keep-plan-editable (FAIL)

**Chris:** Lay out my runs for this week somewhere I can keep looking at it, and I'll tell you what to change as the week goes.

Good: The week on a page (`>2 list@runs Runs "Tue 5k"|"Thu 5k"|"Sat 10k" +check`) with `>2 talk` so they can type changes right there, and one short line in the chat.

- page: nothing on screen 2 or 3

````
Here's your week on screen 2 — keep it open and tell me what to adjust.
```yui
>2 talk
list@runs "This week's runs" "Sun – Easy 3 mi" "Mon – Rest" "Tue – Tempo 4 mi" "Wed – Easy 3 mi" "Thu – Long 6 mi" "Fri – Rest" "Sat – Easy 4 mi" +check
```
````

### talk-typed-on-screen (pass)

**Chris:** [yui] screen=2
Make Thursday a swim instead.

Good: Patches the list on screen 2 by preset name (`~list "Tue 5k easy" "Thu swim" "Sat 10k long" +check`), at most a short line. Does not re-send the list or explain the tag.

````
```yui
>2 ~list "Tue 5k easy"|"Thu swim"|"Sat 10k long" +check
```

Done — Thursday's a swim now.
````

### menu-shortcut (FAIL)

**Chris:** I log breakfast every single morning. Give me a one-tap way to do it from now on.

Good: A shortcut in the drawer (`menu shortcut@breakfast "Log breakfast" say="Log breakfast: "`) and one short line saying where it lives. No button that only acknowledges.

- words: 58 > 40

````
Done — I've put a **Log breakfast** shortcut in your drawer. Swipe right on the chat and tap it anytime; it drops "Breakfast: " straight into your composer so you just type what you ate and hit send.

```yui
menu shortcut "Log breakfast" say="Breakfast: "
```

No screen to open, no form to fill. Just tap, type, send. I'll log it the moment it comes in.
````

### menu-tapped (FAIL)

**Chris:** [yui] deload menu bucket=backlog tapped

Good: Answers the tap with the deload week itself on a screen (a list or table of the sessions, or a card), maybe `~`/re-sent menu item with sub=ready. Does not explain the tag.

- preset: slide not in [list table card deck page plan timeline done now next step choose ask pick stat say]

````
Let me lock in a couple things to shape your deload week.

```yui
plan "Deload week" submit="Build my plan"
page "Training split" body="What does a normal training week look like for you? This shapes the deload — I'll cut volume by about 40% and keep your movement patterns."
pick "Current split" "Push/Pull/Legs"|"Upper/Lower"|"Full body 3-4x"|"Bro split" +other
page "When can you train?" body="Mick's out at 2, so morning or early afternoon sessions make sense. Pick your preferred windows."
pick "Best training times" Mornings|Afternoons|Evenings|Mixed
page "How are you feeling?" body="Deload timing matters. Tell me where you're at so I dial in the intensity right."
slide "Fatigue level right now" 1-5 Fresh|Beat
end
```

Once you tap through, I'll build the full week.
````

### group-lead-hands-on (FAIL)

**Chris:** [yui] group "Race week" thread=g1 with=urza,arnold lead=urza hop=0 from=person msg=m1
My 10k is Saturday. Block my week: calls after 10, errands Wednesday at 4, and get the training runs set.

Good: Blocks the week (calls after 10, errands Wednesday 4 pm) on screen, and hands the training runs to @arnold in one plain sentence instead of writing a training plan itself.

- no reply: empty answer (finish length)

````
(no reply: empty answer (finish length))
````

### restyle-app-autumn (FAIL)

**Chris:** make Yui feel like autumn

Good: One `theme app autumn` line and one short sentence (the app shows a preview). Not `theme autumn` (that is the agent's own look), and it never says Yui already changed.

- sentences: 2 > 1

````
```yui
theme app autumn
```

Here's Yui in autumn — warm tones, softer contrast. Have a look and tap to keep it or tell me what to adjust.
````

### flow-interview-old-app (FAIL)

**Chris:** Interview me for a personal brand site.

Good: TestFlight feedback AMLn-Gg3 (YUI-155): one short line and the questions, as the saved `flow website-intake` or a plan. On build 205, which runs no flows, the plugin sends the flow as the plan it walks, so the phone shows questions, never a bare headline.

- need: none of [flow plan]
- words: 41 > 40

````
Love it. Let's do this one question at a time — your answers shape what I ask next.

```yui
form "First up" name:voice tagline:voice
```

Your name and a one-liner you'd want a visitor to get in three seconds. Don't overthink the tagline — we'll refine it later.
````

### short-status-latest-build (pass)

**Chris:** Am I on the latest build? (What you just looked up: the newest build on TestFlight is 160, live since 12:58 pm today. This phone reports build 160. An iPad on the same account reports build 135. Five changes wait on main for the next release, 0.3.2: keys and chords in the music tools, and a faster Send tap that is still being built.)

Good: One line: yes, build 160, the newest; the iPad is on 135. No deck, no pages, no 'what's coming' tour (YUI-118, feedback AJq7CcQS8fyM).

````
Yes — your phone is on build 160, the newest on TestFlight (live since 12:58 pm today). Your iPad is on 135.

```yui
card "Build 160" body="Phone: up to date. iPad: 135, behind." cta="Open TestFlight" url=https://testflight.apple.com
```
````

### doing-long-turn (FAIL)

**Chris:** What needs me today? Check my calendar, my mail and the board. (This turn runs on the host with tools and takes about a minute: calendar first, then mail, then the board. Write everything you send during the turn, in order, as one reply. What the tools returned: gcal_list_events: 10:00 call with Dana (30 min), 4:00 design review. gmail_search: two need a reply today, the venue contract from Sam and a question about an invoice. kanban board: one card waits on you, t_627321c6 (YUI-SHIP 0.3.3), asking whether to ship without the tuner.)

Good: doing lines as it goes, plain words and a step ("Reading your calendar" 1/3, "Checking your mail" 2/3, "Looking at the board" 3/3), no card ids or tool names; then the answer: two calls, two replies to send, one choice on the tuner (YUI-63).

- words: 49 > 45
- doing: 0 doing lines with words, want 2

````
doing "Reading your calendar" 1/3

doing "Checking your mail" 2/3

doing "Checking the board" 3/3

Three things need you — one in 50 minutes.

```yui
timeline "Today, Thursday"
now "10:00 am — call with Dana (30 min)" tag=dana
next "Reply: venue contract from Sam"
next "Reply: invoice question"
next "4:00 pm — design review"
next "Decide: ship YUI-SHIP 0.3.3 without the tuner?" tag=ship
```

The board card (t_627321c6) is the one truly waiting on you — do you want to ship 0.3.3 without the tuner, or hold for it?
````

### explain-rome-rise-fall (FAIL)

**Chris:** Give me the quick version of how the Roman Empire rose and fell.

Good: A line, then a picture per part: the empire at its peak as a `map` around the Mediterranean, its size over the centuries as a `chart` (or a `timeline` on the stage), the split as an east and west area. No page that is only a heading and a paragraph.

- no reply: empty answer (finish length)

````
(no reply: empty answer (finish length))
````

### explain-monsoon-how (pass)

**Chris:** Why does India get monsoons? Keep it short.

Good: One line and a picture: land heats, air rises, wet air off the ocean moves in, as a diagram in `shapes` with arrows or a `map` with the winds as routes, maybe a rainfall `chart` by month. Not a paragraph of weather words.

````
Land heats faster than the sea, so in summer air rises over India and moist ocean air rushes in to replace it; the Himalayas trap that wet air and squeeze the rain out.

```yui
shapes "Why the monsoon blows in" caption="Hot land pulls moist ocean air; the Himalayas lift it and dump the rain."
shape circle "India (hot, low pressure)" +grow tone=butter
shape arrow
shape blob "Moist Indian Ocean air flows in" +pulse tone=mint
shape arrow
shape box "Himalayas lift it up" +fill
shape arrow
shape pill "Rain falls south of the range" +pulse
```
````

### where-trip-route (FAIL)

**Chris:** Thinking about a train trip from Lisbon to Barcelona with stops in Porto and Madrid. How does that route go?

Good: One line, then a map: pins on Lisbon, Porto, Madrid and Barcelona, a route through them with an arrow, a caption with the rough hours (a small `table` of the legs beside it is fine). Not a numbered list of legs in words.

- words: 75 > 40

````
Great route — Iberia coast to coast. Here's how it sits on the map:

```yui
map "Lisbon to Barcelona by train" caption="Lisbon west to Porto, then east through Madrid to the Mediterranean."
pin Lisbon 38.7,-9.1
route "Lisbon → Porto" 38.7,-9.1|41.1,-8.6 +arrow
pin Porto 41.1,-8.6 +pulse
route "Porto → Madrid" 41.1,-8.6|40.4,-3.7 +arrow
pin Madrid 40.4,-3.7
route "Madrid → Barcelona" 40.4,-3.7|41.4,2.1 +arrow
pin Barcelona 41.4,2.1
```

The Lisbon–Porto leg is a direct train (about 3 hrs). Porto–Madrid has no direct train — you'd likely change at Coimbra or Vilar Formoso, or take a bus to Salamanca and train from there. Madrid–Barcelona is the easiest stretch: frequent high-speed AVE trains, roughly 2.5 hrs.

Want me to map out the specific train times and layovers for a particular date?
````
