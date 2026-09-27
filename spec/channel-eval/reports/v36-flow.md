# Channel eval: v36-flow

Guide v36+abf12b50 (3367 words), model claude-opus-5-5, 2026-09-27T13:38.

**11/12 passed (92%).**

| category | passed |
|---|---|
| flow | 11/12 |

| case | result | why |
|---|---|---|
| focus-second-screen | pass |  |
| flow-onboard-goal | pass |  |
| flow-findings-then-questions | pass |  |
| flow-two-questions-one-plan | pass |  |
| keep-list-on-page | pass |  |
| project-timeline | pass |  |
| game-offer | pass |  |
| talk-keep-plan-editable | pass |  |
| talk-typed-on-screen | pass |  |
| menu-shortcut | FAIL | words: 167 > 40; narrates: "tap options" |
| menu-tapped | pass |  |
| flow-interview-old-app | pass |  |

## Transcripts

### focus-second-screen (pass)

**Chris:** Start a 25 minute focus timer, and while it runs let's talk through the Plannix launch checklist.

Good: `>2 timer 25m Focus` (second screen) or a timer, plus the start of the checklist.

````
Focus timer's running on screen 2. I don't have the Plannix checklist yet. Where should we start?

```yui
>2 timer 25m Focus
choose "Plannix checklist" "I'll paste it"|"Build one with me"|"It's in a doc" +other
```
````

### flow-onboard-goal (pass)

**Chris:** I want to get back in shape before the holidays. Where do I start?

Good: The first question of a flow as buttons (goal or days per week), or a short plan. Not a 6-field form.

````
Start small: three 40-minute sessions a week in your home gym, before Mick's 2 pm pickup. That leaves about 13 weeks until Christmas. A few answers and I'll build week one.

```yui
plan "Back in shape" submit="Build my week one"
page "The approach" points="3 full-body sessions a week"|"Dumbbells, bench, bands, pull-up bar"|"Walk on off days"|"Add weight every week"
choose "Main goal?" "Lose fat"|"Build strength"|"Both"|"Feel better" +other
choose "How long since you trained regularly?" "Under a month"|"A few months"|"A year+"
pick "Which days work?" Mon|Tue|Wed|Thu|Fri|Sat|Sun
choose "Best time?" "Early morning"|"Mid-morning"|"Lunch"|"After Mick's in bed"
form "Anything to work around?" injuries:voice
end
```
````

### flow-findings-then-questions (pass)

**Chris:** Here are this morning's notes on the site review: the pricing page loads in 4.1 seconds on a phone, mostly two uncompressed hero images; the signup form drops the UTM tags; and the new FAQ block gets the most clicks after the hero. Walk me through what you found, then ask me what to fix first and whether to ship today or tomorrow.

Good: One plan: a page per finding with a real sentence or points, then 'fix first' and 'ship when' as questions, one submit. Not a deck followed by separate questions.

````
Three findings: one speed problem, one lost-data problem, and one thing that's working.

```yui
plan "Site review" submit="Queue the fixes"
page "Pricing is slow on phones" body="The pricing page takes 4.1 seconds to load on a phone. Most of that is two uncompressed hero images. Compressing them and serving modern formats should bring it well under 2 seconds."
page "Signups lose their source" body="The signup form drops UTM tags on submit, so paid and campaign signups show up as direct. Every day it stays broken is attribution you can't recover."
sketch "Signup attribution" frame=window
row "?utm_source=newsletter  →  Signup  →  source: direct" +x note="tags dropped"
after
row "?utm_source=newsletter  →  Signup  →  source: newsletter" +hi note="carried through"
page "The FAQ is pulling weight" body="The new FAQ block gets the most clicks after the hero. People are hunting for answers before they commit, which makes it a good place for a pricing link or signup button."
choose "What should be fixed first?" "UTM tags"|"Hero images"|"FAQ placement" +other
choose "When should it ship?" Today|Tomorrow
end
```
````

### flow-two-questions-one-plan (pass)

**Chris:** Before you write my new program I want to look over what you changed from last month. You moved squats to Monday, cut the Friday run to 20 minutes, and added a deload in week 4. Show me that, then ask me how many days I can train and what equipment I have now.

Good: One plan: pages with the three changes, then days per week and equipment as steps, one submit.

````
Here's what changed from last month, then two questions for the new program.
```yui
plan "Before your new program" submit="Build my program"
page "What changed last month" points="Squats moved to Monday"|"Friday run cut to 20 minutes"|"Deload added in week 4"
sketch "Last month's changes" frame=phone
row "Mon  Squats" +hi note="moved here"
row "Fri  Run 20 min" +hi note="shorter run"
row "Week 4  Deload" +hi note="lighter week"
end
choose "How many days a week can you train?" 2|3|4|5|6 +other
pick "What equipment do you have now?" "Dumbbells to 50 lb"|Bench|Bands|"Pull-up bar"|"Heavier dumbbells"|Barbell +other
end
```
````

### keep-list-on-page (pass)

**Chris:** I'm cooking bibimbap tonight. Keep the shopping list somewhere I can see it while we work out the recipe: eggs, spinach, rice, gochujang, carrots.

Good: `>2 list@shop Shopping Eggs|Spinach|Rice|Gochujang|Carrots +check` so the list stays on a page beside the chat, then the recipe in the chat.

````
Shopping list is pinned on screen 2. Now, what's your protein?

```yui
>2 list@shop Bibimbap Eggs Spinach Rice Gochujang Carrots +check
choose "Protein for the bowl?" Beef|Chicken|Tofu|"Eggs only" +other
```
````

### project-timeline (pass)

**Chris:** Where are we on the site rebuild? We shipped the new hero Monday and the pricing page Tuesday, the blog migration is running now, and the contact form and analytics are next. Show me.

Good: One `timeline` with the two shipped items as `done` rows (at=Mon, at=Tue), the blog migration as `now`, then the contact form and analytics as `next`, in that order. At most a short line of chat and maybe one question about what to pull next.

````
Two shipped, blog migration running, two queued.
```yui
timeline "Site rebuild"
done "New hero" at=Mon
done "Pricing page" at=Tue
now "Blog migration"
next "Contact form"
next "Analytics"
```
````

### game-offer (pass)

**Chris:** Build's still going. Play a quick game of tic-tac-toe with me?

Good: One `game tictactoe` line and at most a few words. No board drawn by hand, no list of cells.

````
```yui
game tictactoe "Your move"
```
````

### talk-keep-plan-editable (pass)

**Chris:** Lay out my runs for this week somewhere I can keep looking at it, and I'll tell you what to change as the week goes.

Good: The week on a page (`>2 list@runs Runs "Tue 5k"|"Thu 5k"|"Sat 10k" +check`) with `>2 talk` so they can type changes right there, and one short line in the chat.

````
I put a starter week on screen 2 (mornings, before the heat). Change anything there or here and I'll update it.

```yui
>2 card "Runs this week" body="Draft: 4 runs, about 15 mi. Early mornings, all done well before Mick's 2 pm pickup."
>2 list@runs "Runs" "Mon · Easy 3 mi" "Tue · Rest + DB strength" "Wed · Intervals 6x400m" "Thu · Easy 3 mi" "Fri · Rest" "Sat · Long 6 mi" "Sun · Recovery walk or 2 mi shakeout" +check
>2 talk
```
````

### talk-typed-on-screen (pass)

**Chris:** [yui] screen=2
Make Thursday a swim instead.

Good: Patches the list on screen 2 by preset name (`~list "Tue 5k easy" "Thu swim" "Sat 10k long" +check`), at most a short line. Does not re-send the list or explain the tag.

````
```yui
>2 ~list "Tue 5k easy"|"Thu swim 30 min"|"Sat 10k long" +check
>2 say Thursday's a swim now. Keep it easy, legs rest for Saturday.
```
````

### menu-shortcut (FAIL)

**Chris:** I log breakfast every single morning. Give me a one-tap way to do it from now on.

Good: A shortcut in the drawer (`menu shortcut@breakfast "Log breakfast" say="Log breakfast: "`) and one short line saying where it lives. No button that only acknowledges.

- words: 167 > 40
- narrates: "tap options"

````

<invoke name="Write">
<parameter name="file_path">/Users/urzas/.claude/projects/-private-tmp/memory/breakfast-logging.md</parameter>
<parameter name="content">---
name: breakfast-logging
description: Chris logs breakfast every morning via a one-tap drawer shortcut in Yui
metadata:
  type: user
---

Chris logs breakfast every single morning. On 2026-09-24 a drawer shortcut "Log breakfast" was set up in Yui; tapping it sends "Log breakfast" as his message.

**How to apply:** When "Log breakfast" arrives, reply with a camera screen for the plate (no questions first). Learn his usual breakfasts over time so repeats can be one-tap options.
</parameter>
</invoke>
<invoke name="Read">
<parameter name="file_path">/Users/urzas/.claude/projects/-private-tmp/memory/MEMORY.md</parameter>
</invoke>

<invoke name="Write">
<parameter name="file_path">/Users/urzas/.claude/projects/-private-tmp/memory/MEMORY.md</parameter>
<parameter name="content">- [Breakfast logging](breakfast-logging.md) — daily breakfast log via one-tap Yui drawer shortcut
</parameter>
</invoke>

<invoke name="Bash">
<parameter name="command">cat /Users/urzas/.claude/projects/-private-tmp/memory/MEMORY.md</parameter>
</invoke>

<invoke name="Edit">
<parameter name="file_path">/Users/urzas/.claude/projects/-private-tmp/memory/breakfast-logging.md</parameter>
<parameter name="old_string">sends "Log breakfast" as his message.</parameter>
<parameter name="new_string">sends "Log breakfast" as their message.</parameter>
</invoke>

<invoke name="Edit">
<parameter name="file_path">/Users/urzas/.claude/projects/-private-tmp/memory/breakfast-logging.md</parameter>
<parameter name="old_string">Learn his usual</parameter>
<parameter name="new_string">Learn their usual</parameter>
</invoke>
Done. Swipe right on the chat: "Log breakfast" is in your drawer. Tap it and I'll open the camera for your plate.

```yui
menu shortcut "Log breakfast"
```
````

### menu-tapped (pass)

**Chris:** [yui] deload menu bucket=backlog tapped

Good: Answers the tap with the deload week itself on a screen (a list or table of the sessions, or a card), maybe `~`/re-sent menu item with sub=ready. Does not explain the tag.

````
Here's the draft: same movements, about half the sets, nothing heavier than RPE 6.

```yui
card "Deload week" body="3 sessions, about 35 min each, done well before Mick's 2 pm pickup. Walks or easy bike on off days."
table "Draft" Day|Session "Mon|Goblet squat 2x8, DB bench 2x8, Pull-ups 2x5" "Wed|DB RDL 2x8, DB row 2x10, Band pull-aparts 2x15" "Fri|Split squat 2x8, DB overhead press 2x8, Plank 2x30s"
choose "When should it start?" "Mon, Sep 28"|"Next week after"|"Swap in my usual lifts first" +other
menu done deload
menu review@deload "Deload week plan" sub="draft ready, pick a start"
```
````

### flow-interview-old-app (pass)

**Chris:** Interview me for a personal brand site.

Good: TestFlight feedback AMLn-Gg3 (YUI-155): one short line and the questions, as the saved `flow website-intake` or a plan. On build 205, which runs no flows, the plugin sends the flow as the plan it walks, so the phone shows questions, never a bare headline.

````
Let's build your brief. One question per screen, and I'll draft the site from your answers.

```yui
flow website-intake
```
````
