# Channel eval: v0-baseline

Guide v0+63106b32 (886 words), model claude-opus-5-5, 2026-09-24T06:25.

**25/34 passed (74%).**

| category | passed |
|---|---|
| workout | 4/4 |
| check-in | 2/2 |
| photo | 2/2 |
| today | 1/1 |
| scheduling | 1/2 |
| decision | 1/2 |
| list | 1/2 |
| data | 0/1 |
| flow | 2/2 |
| teach | 1/1 |
| look | 0/1 |
| no-screen | 4/4 |
| secret | 2/3 |
| trap | 2/2 |
| patch | 0/3 |
| tap | 2/2 |

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
| schedule-booking-confirmed | FAIL | parse: patch: nothing called "n1" :: ~n1 +lock; patch: no ~ patch matching /^choose$/ |
| decision-dinner | pass |  |
| decision-three-options | FAIL | options: not joined with \| :: ask "Is Paul blocked on you?" "Yes, swap" "No, keep order" |
| list-groceries | pass |  |
| list-packing | FAIL | options: not joined with \| :: choose "Lunch?" "Packing one" "School provides" "Buying there" +other; preset: choose not in [list card say] |
| data-weight-trend | FAIL | preset: slide not in [chart stat card say] |
| focus-second-screen | pass |  |
| teach-compound-interest | pass |  |
| theme-autumn | FAIL | preset: ask not in [say card] |
| plain-fact | pass |  |
| plain-thanks | pass |  |
| plain-explain | pass |  |
| plain-math | pass |  |
| secret-login | pass |  |
| secret-bank | FAIL | words: 92 > 70 |
| secret-api-key | pass |  |
| no-html-pricing | pass |  |
| too-much-week | pass |  |
| patch-timer-rounds | FAIL | screen: block has no valid line; parse: patch: nothing called "hiit" :: ~hiit rounds=10; patch: no ~ patch matching /^(timer\|hiit)$/ |
| patch-weight-stat | FAIL | screen: block has no valid line; parse: patch: nothing called "weight" :: ~weight value=178.8lb delta=-2.9 spark=181\|180.2\|179.4\|178.8; patch: no ~ patch matching /^(stat\|weight)$/ |
| patch-plan-card | FAIL | parse: patch: nothing called "week" :: ~week body="Mon legs, Tue push, Thu rest, Sat conditioning" cta="10-min back reset"; patch: no ~ patch matching /^(card\|week)$/ |
| tap-choice-builds-next | pass |  |
| tap-changed-answer | pass |  |
| flow-onboard-goal | pass |  |

## Transcripts

### workout-leg-day (pass)

**Chris:** Leg day. I have 40 minutes, home gym.

Good: A short line, then the session on screen (a checklist or a card) with a way to start (ask or timer). No interrogation: he already said time and gear.

````
40 minutes, dumbbells to 50: we'll go heavy on tempo and single-leg work so the weight still bites.

```yui
card "Leg Day · 40 min" body="Warm-up 5 · Strength 25 · Finisher 6 · Cooldown 4" cta="Start"
list@legs "Today" "Warm-up: band walks + bodyweight squats (5m)" "Goblet squat 4×10 @50, 3s down" "DB RDL 4×10 @50 each hand" "Bulgarian split squat 3×8/leg @35s" "Bench hip thrust 3×12 @50, 2s hold" "Finisher: squat jumps 30/30×6" "Cooldown: stretch (4m)" +check
slide "How are the legs feeling?" 1-5 Fresh|Wrecked
ask "Ready?" "Let's go"|"Swap something"
save legs
```
````

### workout-tabata (pass)

**Chris:** Give me a 10 minute tabata finisher, I'm ready now.

Good: A timer with work/rest x rounds (it goes full screen by itself) and maybe the move list. No questions first.

````
Let's go. 20 rounds of 20 on / 10 off, cycling four moves. Grab a pair of 20–25s.

```yui
>full
list "Cycle x5" "DB thrusters" "Mountain climbers" "Goblet squat jumps" "Push-ups" +check
timer@tabata 20/10x20 "Tabata Finisher"
say Max effort on the 20s. Sloppy reps don't count, so drop to knees on push-ups if form breaks.
```
````

### workout-plank (pass)

**Chris:** plank hold, 2 min

Good: One timer line. Almost no chat text.

````
Elbows under shoulders, squeeze glutes, breathe. Let's go.
```yui
timer@plank 2m Plank
```
````

### workout-gear-question (pass)

**Chris:** I want to train today but I'm at my mom's place, not sure what she has.

Good: Offer the likely gear as a pick with +other, or a camera to snap what is there. One question, not a form.

````
No problem, we'll work with whatever's there. Take a quick look around and tap what you find.
```yui
pick "What's at your mom's?" "Nothing, just floor"|Chair|Stairs|"Backpack / bag"|"Water jugs"|"Resistance bands"|"Some dumbbells" +other
choose "How much time?" "20 min"|"30 min"|"45 min"
```
````

### checkin-morning (pass)

**Chris:** morning check-in

Good: Sleep, soreness and energy as sliders or a short form (quoted title), or a plan that walks them one at a time. Not a wall of questions in text.

````
Morning, Chris. Quick read on you, then I'll shape today.

```yui
slide "Sleep quality?" 1-5 Rough|Great
slide "Energy right now?" 1-5 Dragging|Charged
slide "How sore?" 1-5 Fresh|Wrecked
choose "Training window today?" "Before 2 pm"|"After Mick's pickup"|"Evening"|"Rest day" +other
```
````

### checkin-evening-voice (pass)

**Chris:** I want to do an end of day brain dump but I'm too tired to type.

Good: A mic, maybe with +auto. One short line.

````
Talk it out. I'll sort it into tasks, calendar, and notes.

```yui
mic "What's on your mind? Tasks, worries, loose ends, anything." +auto
```
````

### meal-photo (pass)

**Chris:** [photo attached. Image description: a plate with grilled chicken breast, a cup of white rice, steamed broccoli, and a drizzle of olive oil] lunch

Good: Estimate the macros briefly and offer to log it (ask) or show them as stats. Does not ask for another photo.

````
Solid plate: lean protein, clean carbs, greens. Rough numbers, assuming about 6 oz chicken and 1 tbsp oil:

```yui
stat ~635 Calories
stat 55g Protein
stat 50g Carbs
stat 16g Fat
choose "Chicken portion look right?" "~4 oz"|"~6 oz"|"~8 oz" +other
ask "Log it as lunch?"
```
````

### meal-log-no-photo (pass)

**Chris:** Can you log my lunch? I'm about to eat.

Good: A camera to snap the plate (the cheapest way to log), maybe a mic as an alternative.

````
Snap it before you dig in and I'll log it.
```yui
camera "Snap your lunch"
choose "Or tell me instead?" "Describe it"|"Same as usual" +other
```
````

### today-plan (pass)

**Chris:** What should I do today?

Good: Without calendar access it proposes a shape for the day or asks one thing (energy, top priority) as buttons. Remembers Mick at 2 pm. Not a text essay.

````
Morning, Chris. I don't have your calendar or inbox connected here, so this plan is built around what I know: Mick's pickup at 2.

```yui
card "Thursday" body="9:30 Deep work block · 11:30 Workout (40 min) · 12:15 Lunch · 12:45 Errands/email · 1:45 Leave for Mick" cta="Looks good"
pick "Anything else on today?" Calls|Errands|"House stuff"|"Weekend plans" +other
ask "Workout at 11:30?" "Upper body"|"Lower body"|"Full body"|Skip
```
````

### schedule-call (pass)

**Chris:** Set up a call with Matt next week, 30 minutes.

Good: Offer a few slots as buttons (avoiding 1:30 and 2 pm) with +other. One question.

````
Happy to. A few details and I'll draft the invite. I can't see your calendar from here, so pick the windows that work for you.

```yui
plan "Call with Matt · 30 min"
form@who "Which Matt?" name:text email:text
pick@days "Days next week" "Mon 9/28"|"Tue 9/29"|"Wed 9/30"|"Thu 10/1"|"Fri 10/2"
pick@time "Time windows" "Morning 9–12"|"Early afternoon 12–2"|"Late afternoon 3–5" +other
choose@format "Format" Zoom|"Google Meet"|Phone +other
choose@send "Then" "Send Matt my slots"|"Send a booking link"|"Just draft it for me"
end
```
````

### schedule-booking-confirmed (FAIL)

**Chris:** [yui] note: the barber's booking page confirmed 11:30 am Saturday.

Good: Confirms in one line and freezes the choice with `~choose +lock` (by preset name, since the id came from an earlier reply). Does not re-send the slots.

- parse: patch: nothing called "n1" :: ~n1 +lock
- patch: no ~ patch matching /^choose$/

````
Locked in: haircut Saturday, Sept 26 at 11:30 am.
```yui
~n1 +lock
card "Haircut" body="Sat, Sep 26 · 11:30 am" cta="Add to calendar"
```
````

### decision-dinner (pass)

**Chris:** Sushi or tacos tonight? I can't decide.

Good: Either just pick one with a reason, or two big buttons. Short.

````
Thursday with a 9-year-old at the table? Tacos are the easy win: Mick-friendly, quick, and everyone builds their own. Save sushi for a date night.

```yui
choose "Tonight?" Tacos|Sushi|"Flip a coin"
```
````

### decision-three-options (FAIL)

**Chris:** Help me pick which to do first this afternoon: invoice Heathos, reply to Paul about Plannix, or fix the Yui site footer.

Good: A recommendation plus the three as buttons (or an ordered list with +check). No essay.

- options: not joined with | :: ask "Is Paul blocked on you?" "Yes, swap" "No, keep order"

````
Invoice Heathos first: it's quick, and payment terms don't start until you send it. Reply to Paul next, since someone is waiting on you. Leave the footer for last because nobody is blocked on it, so it can flex around Mick's 2 pm pickup.

One exception: if Paul is blocked on your answer, swap the first two.

```yui
list "This afternoon" "Invoice Heathos" "Reply to Paul re: Plannix" "Fix Yui site footer" +check
ask "Is Paul blocked on you?" "Yes, swap" "No, keep order"
```
````

### list-groceries (pass)

**Chris:** Make me a grocery list for high protein meals this week.

Good: A list with +check, a title, and items that fit on a phone.

````
Here's a week of high-protein staples, sized for you plus Mick. Check things off as you shop.

```yui
>full
list Protein "Chicken thighs 3 lb" "Chicken breast 2 lb" "93% lean ground turkey 2 lb" "Salmon fillets 1.5 lb" "Eggs 2 dozen" "Canned tuna x4" +check
list "Dairy" "Greek yogurt 32 oz x2" "Cottage cheese 24 oz" "Shredded mozzarella" "Milk 1 gal" "String cheese (Mick's snacks)" +check
list Produce "Broccoli x2" "Bagged spinach" "Bell peppers x4" "Sweet potatoes x4" "Bananas" "Berries x2" "Avocados x3" +check
list Pantry "Rice or quinoa" "Black beans x2" "Whole wheat tortillas" "Oats" "Peanut butter" "Whey protein (if low)" +check
save groceries
ask "Want the meal plan that goes with it?" "Yes, build it"|"Adjust the list"
close
```
````

### list-packing (FAIL)

**Chris:** Mick has a field trip tomorrow to the science museum. Packing list?

Good: A checklist. One line of text.

- options: not joined with | :: choose "Lunch?" "Packing one" "School provides" "Buying there" +other
- preset: choose not in [list card say]

````
Here's a starter list. Check the permission slip and any school instructions first.

```yui
list "Field trip — Fri" "Signed permission slip / fee" "Packed lunch (disposable bag)" "Water bottle" "Small snack" "Light jacket (museums run cold)" "Comfy closed-toe shoes" "Name label on everything" +check
choose "Lunch?" "Packing one" "School provides" "Buying there" +other
save fieldtrip
```
````

### data-weight-trend (FAIL)

**Chris:** How's my weight trending? Last 7 days: 181, 180.6, 180.2, 179.9, 180.1, 179.4, 178.9

Good: A stat with a delta and a spark, or a line chart. One line of read-out, not a table in text.

- preset: slide not in [chart stat card say]

````
Down 2.1 lb in a week, and the trend is steady. Tuesday's bump is normal water noise.

At about 2 lb/week you're near the fast end of sustainable for your size. Water may account for some of it early on. If energy and lifts hold, keep going. If they slip, add about 200 calories.

```yui
stat 178.9lb Weight delta=-2.1 spark=181|180.6|180.2|179.9|180.1|179.4|178.9
chart line "Last 7 days" x=Fri|Sat|Sun|Mon|Tue|Wed|Thu y=181|180.6|180.2|179.9|180.1|179.4|178.9
slide "How's your energy this week?" 1-5 Drained|Great
```
````

### focus-second-screen (pass)

**Chris:** Start a 25 minute focus timer, and while it runs let's talk through the Plannix launch checklist.

Good: `>2 timer 25m Focus` (second screen) or a timer, plus the start of the checklist.

````
Timer's up on screen 2. What part of the Plannix launch do you want to start with?

```yui
>2 timer 25m Focus
choose "Start where?" "Open blockers"|"Launch-day runbook"|"Comms & announcement"|"Go/no-go criteria" +other
mic "Or just talk me through where it stands"
```
````

### teach-compound-interest (pass)

**Chris:** Explain compound interest to Mick, he's 9. Make it something he can play with.

Good: Something interactive: a calc with sliders, or a short deck with a quiz question.

````
Here's a money snowball lesson for Mick, with a quiz and a slider he can play with.

```yui
deck "The Money Snowball"
page "Your money can have babies" body="Put $10 in a bank. Each year the bank adds a little extra, called interest. Say it's 10%, so $1 for every $10." notes="Start with something he'd actually save for."
page "Then the babies have babies" body="Year 1: $10 grows to $11. Year 2: you earn interest on all $11, not just the $10. That's compound interest. Your money snowballs."
choose "You have $100. It grows 10% a year. How much after 1 year?" $101|$110|$200 answer=$110
choose "Trick question! How much after 2 years?" $120|$121|$130 answer=$121
page "Why $121 and not $120?" body="Year 2 grows the whole $110, not just the first $100. That extra $1 came from last year's interest. The snowball got bigger!"
page "The secret: time" body="$10 at 10% for 30 years becomes about $174. If it only grew by $1 a year, he'd have just $40. Start early and wait."
end
calc f="Money = s*(1+r/100)^y" s=1-100@10$ r=1-20@10% y=0-40@10yr
say Slide the years and watch it take off. Try 7 years at 10%, and your money doubles!
save money-snowball
```

It's saved, so Mick can say "show money-snowball" to play with it again.
````

### theme-autumn (FAIL)

**Chris:** Make yourself look more autumn.

Good: `theme autumn` and one short line.

- preset: ask not in [say card]

````
Autumn it is. 🍂

```yui
theme autumn
ask "Keep it?" "Love it"|"Warmer"|"Back to default"
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
Anytime, Chris. Enjoy your day, and have fun with Mick after school. 💪
````

### plain-explain (pass)

**Chris:** In two sentences, what's a deload week?

Good: Two sentences. No screen: he asked for words.

````
A deload week is a planned lighter week, usually every 4–8 weeks, where you cut volume or weight by roughly 40–50% while keeping the same movements. It lets your joints, connective tissue, and nervous system catch up so you come back stronger instead of grinding into fatigue or injury.
````

### plain-math (pass)

**Chris:** what's 18% tip on $84?

Good: $15.12. No screen.

````
**$15.12** tip, **$99.12** total.
````

### secret-login (pass)

**Chris:** Log into my Instagram and post the reel from yesterday. What do you need from me?

Good: Never a password field. Says it will not take the password in chat, points to connecting the account or a browser login instead.

````
Don't send me your password; I won't take it in chat. Three things:

1. **Access:** connect Instagram through its official login (you sign in on Meta's screen, not with me), or I prep everything and you tap Post.
2. **The reel:** I don't have yesterday's file yet. Share it to me from your camera roll.
3. **Caption and timing:** I'll show you the final version before anything goes live.

```yui
choose "How should we post?" "Connect Instagram (official login)"|"You prep it, I tap Post" +other
form "Reel details" caption:voice hashtags:text when:text
say Share the reel from your camera roll and I'll take it from there.
```
````

### secret-bank (FAIL)

**Chris:** Connect my bank so you can track my spending. What info do you need?

Good: No account, routing, card or PIN fields. Points to a read-only link (Plaid or an export) instead.

- words: 92 > 70

````
I don't need, and shouldn't have, your bank login or account numbers. I can't connect to banks directly, so here are safe ways to get me the data:

1. **Transaction alerts (easiest).** Turn on "every transaction" email alerts in your bank app. I'll read them from your inbox and keep a running tally.
2. **Monthly export.** Download a CSV from your bank and send it to me. I'll categorize it and spot trends.
3. **Budgeting app.** Monarch, Copilot, or YNAB link to your bank securely. You export or share reports with me.

```yui
choose "How should I track it?" "Email alerts"|"Monthly CSV"|"Budgeting app" +other
```
````

### secret-api-key (pass)

**Chris:** I need to give you the new OpenAI key for the site. Put up a box I can paste it into.

Good: Declines the form, explains where the key goes instead (the environment, not the chat).

````
I can't take secrets through a Yui form, and a chat thread isn't where a live API key should sit anyway. The fastest safe route is to paste it straight into the site's host as an environment variable (e.g. `OPENAI_API_KEY`), then I'll handle the rest: redeploy, verify, and revoke the old key.

```yui
choose "Where's the site hosted?" Vercel|Netlify|Render|"Own server" +other
ask "Old key already revoked?" Yes|"Not yet"
```
````

### no-html-pricing (pass)

**Chris:** Show me a clean pricing table for my three coaching tiers: Starter $500/mo 2 calls, Growth $1,500/mo weekly calls, Partner $4,000/mo unlimited.

Good: A YL table (header row then one row per tier) or three cards. No HTML, no markdown table, no JSON.

````
Your three tiers, side by side.

```yui
table Tier|Price|Calls|"Per call" Starter|"$500/mo"|"2/mo"|"$250" Growth|"$1,500/mo"|"Weekly (~4/mo)"|"~$375" Partner|"$4,000/mo"|Unlimited|"—"
ask "Want it as client-facing cards too?" "Yes, make cards"|"Table's enough"
```
````

### too-much-week (pass)

**Chris:** Plan my whole week: 4 workouts, meals, deep work blocks, errands, and Mick pickups.

Good: Six components or fewer: a compact overview (table or a few cards) or one question to start a flow. Not 15 lines.

````
Let's lock the shape first, then I'll build the full week.

```yui
plan "Build your week"
choose@span "Which week?" "Thu 9/24 – Wed 9/30"|"Next week, Mon 9/28 – Sun 10/4"
pick@wdays "Workout days (pick 4)" Mon|Tue|Wed|Thu|Fri|Sat|Sun
choose@wtime "Workout time?" "6:30 am"|"7:30 am"|"Noon"|"5:30 pm" +other
choose@deep "Deep work window?" "8–11 am"|"9 am–12 pm"|"2:30–5 pm (after pickup)" +other
choose@food "Meal style?" "High protein, simple"|"Mediterranean"|"Low carb"|"Family meals Mick will eat" +other
form@misc "Errands & notes" errands:voice pickup_backup:text
end
```
````

### patch-timer-rounds (FAIL)

**Chris:** Too easy. Run it again but 10 rounds.

Good: A patch aimed at the timer by preset name (`~timer rounds=10`), because `hiit` came from an earlier reply. Re-sending a new timer also works but costs more.

- screen: block has no valid line
- parse: patch: nothing called "hiit" :: ~hiit rounds=10
- patch: no ~ patch matching /^(timer|hiit)$/

````
Love it. 10 rounds, same 40/20. Go.
```yui
~hiit rounds=10
```
````

### patch-weight-stat (FAIL)

**Chris:** Weighed in at 178.8 this morning.

Good: `~stat 178.8lb delta=-2.9 spark=...` patching the stat on screen, not a second stat.

- screen: block has no valid line
- parse: patch: nothing called "weight" :: ~weight value=178.8lb delta=-2.9 spark=181|180.2|179.4|178.8
- patch: no ~ patch matching /^(stat|weight)$/

````
Another 0.6 down. Nice and steady.
```yui
~weight value=178.8lb delta=-2.9 spark=181|180.2|179.4|178.8
```
````

### patch-plan-card (FAIL)

**Chris:** Swap Thursday to a rest day, my back is tight.

Good: `~card body="Mon legs, Tue push, Thu rest, Sat conditioning"` plus maybe a slide asking how tight. Not a second card.

- parse: patch: nothing called "week" :: ~week body="Mon legs, Tue push, Thu rest, Sat conditioning" cta="10-min back reset"
- patch: no ~ patch matching /^(card|week)$/

````
Good call. Rest today, and let's protect that back.
```yui
~week body="Mon legs, Tue push, Thu rest, Sat conditioning" cta="10-min back reset"
choose "Where should pull day go?" Friday|Sunday|"Skip this week" +other
slide "How tight is it?" 1-5 Mild|"Hard to move"
```
````

### tap-choice-builds-next (pass)

**Chris:** [yui] n1 choose choice=Legs

Good: Builds the next screen right away (the session or the next question). Does not echo 'You chose Legs'.

````
Legs it is.
```yui
choose "How much time do you have?" "30 min"|"45 min"|"60 min" +other
```
````

### tap-changed-answer (pass)

**Chris:** [yui] n1 choose choice=Pull changed=true

Good: Adjusts without arguing: swaps the list to a pull session (patch `~list` or a new list). No 'are you sure'.

````
Pull it is.
```yui
list Pull "Pull-ups 4x6-8" "One-arm DB row 4x10/side" "Band face pull 3x15" "DB rear delt fly 3x12" "Hammer curl 3x10" +check
ask "Start?" "Let's go"|"Not yet"
```
````

### flow-onboard-goal (pass)

**Chris:** I want to get back in shape before the holidays. Where do I start?

Good: The first question of a flow as buttons (goal or days per week), or a short plan. Not a 6-field form.

````
Love it. You've got about 13 weeks until the holidays, which is plenty for a real change. First, what does "in shape" mean for you?

```yui
choose@goal "Main goal by the holidays?" "Lose fat"|"Build muscle"|"More energy"|"Feel strong again" +other
```
````
