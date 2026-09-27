# An agent's home

What you see when you open an agent: its own shortcuts, what is waiting on you, and its starter screens one swipe away. Every agent's home is different, because every agent does something different.

Status: draft, step 1 of YUI-168 (this spec and a [tappable mock](/mockups/home)). Nothing here is in the app yet. Step 2 builds the home stage in the app; step 3 seeds the starter crew. It came from TestFlight notes on build 244: "when I go to one of these agent screens, I should see a unique set of shortcuts. Basil should have shortcuts for logging a meal or seeing my grocery list. Arnold should have start a workout or look at my split." And: "Gouda should have a couple of these already set up. When I scroll the other way I should get the looper, the chord machine, and maybe some type of piano to jam along."

## 1. What a home is

The home is screen 1 when the chat has nothing new on it: a fresh thread, or a thread the person comes back to after the agent went quiet. Three things sit on it, top to bottom:

```
 [ face + one line: what this agent does ]
 [ Waiting on you: up to 3 asks and notes ]
 [ shortcut ] [ shortcut ]
 [ shortcut ] [ shortcut ]           <- 2 to 4 big chips, above the bar
 [ +  T  mic ]                        <- the bar, as today
                    swipe left ->  screen 2, screen 3 ...  (starter screens)
```

- **Shortcuts.** Two to four big chips just above the bar. Each one says a thing or opens a screen. They are the things you do with this agent most: Arnold's "Start a workout", Basil's "Log a meal".
- **Waiting on you.** The agent's asks and notes that have no answer yet, up to three, newest first, with "See all" opening the drawer's Review tab. Chris: "Notifications should really just be right on this home screen." They are the same items as Review (the thread's open asks, then `menu review` items), so answering one here clears it there.
- **Starter screens.** Pages 2 and up (the swipe-left pages from YL.md section 5, Pages), seeded the first time the agent is opened and kept current by the agent after that. Arnold's are This week, then Today's workout.

When the agent answers, the answer takes screen 1 as it does today and the chips step down to one row of small chips over the bar, so they are always a thumb away. The chips never show on pages 2 and up: a page is full screen, for reading and tapping.

## 2. How an agent sets its home

No new Yui Lines word. Everything a home needs is already in the language:

| Part | Line | Why this one |
|---|---|---|
| Shortcuts | `menu shortcut` | It already means "things the person asks for often", already carries `say=` (send, or fill the composer) and `show=` (open a saved screen), and the drawer already keeps and rebuilds it from the thread. A new `home` word would be a second list of the same things. |
| Waiting on you | the thread's open asks, then `menu review` | Already what Review shows. The home is a second view of it, not a new list. |
| Starter screens | `>2 ...`, `>3 ...` with `@id`s | Pages already last across replies, and a page's `@id`s already last, so the agent patches a number and never re-sends the page. |

```
menu shortcut@split "My split" show="this week"
menu shortcut@workout "Start a workout" say="Start today's workout"
>2
card@week "This week" "3 of 4 done" sub="Legs left, Saturday"
list@days Mon|Tue|Thu|Sat +check
save this week
>3
list@today Pull "Deadlift 3x5 @ 275" "Pull-ups 4x8" "Row 3x10" +check
save today
```

Rules the app follows, and nothing else changes:

- **Which chips.** The first four items of `menuOf(...).shortcut` (newest first), laid out in that order, left to right and top to bottom. With none, the home shows no chips. An agent that wants its most important chip first sends it last.
- **A chip that opens a page.** A `show=` whose saved screen was saved from a page (2 to 12) that is still there swipes to that page instead of opening a fresh copy on the stage, with no turn. That page is the live one, patched and current; the stage copy would start fresh. This is a rule for the renderer, not the grammar: the line and its op are the same as today.
- **A chip that talks.** `say=` sends as if typed; one ending in a space fills the composer to finish (`say="Log a meal: "`). Same as the drawer.
- **Once, then patches.** Starter screens are sent once, on first open. After that the agent keeps them current with patches (`~week "4 of 4 done"`), which never move the person and never push. `>2 clear` removes a page the person no longer wants.

The chips, the asks and the pages live on the phone and are rebuilt from the thread, like the drawer and the shelf, so they follow the person to a new install.

## 3. Where the home comes from

**Native agents** (NATIVE.md, section 4) get a sixth profile part: `home.yui`, the lines above. The runtime plays it once, before `first.yui`, when the agent's row is made. It is Yui Lines, so a forked profile edits its home like any other screen, and Ask Yui or Start blank can write one from the answers.

**Hermes and other agents** send the same lines themselves, once. The Hermes plugin sends a profile's `home.yui` (beside its SOUL.md) on first pair, so an owner can hand-write a home. Any agent can change its shortcuts later with `menu shortcut` and `menu done`, the same as the drawer. The channel guide gets one line about this when step 2 lands in the app, not before: telling agents about chips the app does not draw yet would only cost tokens.

## 4. The starter sets

Two to four shortcuts each, and two or three starter screens. The chips are in the order they show.

| Agent | Shortcuts | Starter screens |
|---|---|---|
| Arnold | Start a workout · My split | 2 This week (days done, what is left) · 3 Today's workout (the list to tick, and a Start button) |
| Basil | Log a meal · Grocery list | 2 Today (calories and macros against the goal) · 3 Grocery list (tick as you shop) |
| Gouda | Jam · Tune up | 2 Looper · 3 Chords · 4 Keys, all ready to play |
| Penny | Add a to-do · Plan my week | 2 Today (the list) · 3 This week (a timeline) |
| Quill | Quiz me · What's next | 2 What you're studying (topic, cards left) · 3 Next review (when, and how many) |
| Yui | Add an agent · What's new | 2 Your crew (every agent, what it does, one tap to open) |

- **Arnold.** "Start a workout" says `Start today's workout` (the timer takes the stage, as workouts always do). "My split" opens This week. Today's workout is patched as sets get ticked.
- **Basil.** "Log a meal" fills the composer with `Log a meal: ` so the person says or types what they ate, or holds to snap (YUI-166). "Grocery list" opens page 3. Today's numbers are patched after every meal.
- **Gouda.** The instruments are `loop`, `chords` and `keys` with `+inline`, so they sit on their pages ready to play instead of opening the stage. "Jam" says `Make me a beat to jam on`; "Tune up" says `Tune my guitar` (the tuner, YUI-136).
- **Penny, Quill, Yui.** Their pages start nearly empty and fill as the person uses them. An empty page shows one line saying what will go there, never a blank screen.

## 5. What is not in this step

- No app code, no runtime code, no plugin change. This page and the mock only.
- No new Yui Lines word, key or op, so no parser, conformance or channel guide change.
- Chats (CHATS.md, YUI-169) do not change the home: shortcuts, asks and pages belong to the agent, so every chat opens on the same home.

## 6. Build order

1. This spec and the mock (YUI-168 step 1).
2. The app: the home stage on screen 1 (chips, Waiting on you), the small chip row over an answer, and the `show=` to a page rule. UI tests per starter agent: Arnold swipes to This week, then Today's workout; Gouda's looper plays.
3. The runtime and the plugin: `home.yui` for the six starters, played once; the Hermes plugin sends a profile's `home.yui` on first pair; the channel guide line.
