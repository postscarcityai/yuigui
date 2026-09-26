# Channel eval: v28-flow-check

Guide v28+68ed0e65 (2524 words), model claude-opus-5-5, 2026-09-26T18:44.

**5/5 passed (100%).**

| category | passed |
|---|---|
| flow | 3/3 |
| check-in | 2/2 |

| case | result | why |
|---|---|---|
| flow-onboard-goal | pass |  |
| flow-findings-then-questions | pass |  |
| flow-two-questions-one-plan | pass |  |
| checkin-morning | pass |  |
| checkin-evening-voice | pass |  |

## Transcripts

### flow-onboard-goal (pass)

**Chris:** I want to get back in shape before the holidays. Where do I start?

Good: The first question of a flow as buttons (goal or days per week), or a short plan. Not a 6-field form.

````
Good timing. Thanksgiving is about 9 weeks out, which is enough for a real change. A few quick answers and I'll build your first week around your home gym and Mick's 2 pm pickup.

```yui
plan "Holiday shape-up" submit="Build my plan"
page "The 9-week runway" body="Nine weeks is enough to drop a few pounds, get noticeably stronger, and feel better in your clothes. Your gear covers it: dumbbells, bench, bands and the bar handle full-body strength. Four answers set the rest."
choose "Main goal?" "Lose fat"|"Build muscle"|"Both"|"Feel fitter" +other
choose "Where are you starting?" "Haven't trained in months"|"On and off"|"Pretty active"
choose "Days a week?" 2|3|4|5
choose "Time per session?" "20 min"|"30 min"|"45 min"|"60 min"
end
```
````

### flow-findings-then-questions (pass)

**Chris:** Here are this morning's notes on the site review: the pricing page loads in 4.1 seconds on a phone, mostly two uncompressed hero images; the signup form drops the UTM tags; and the new FAQ block gets the most clicks after the hero. Walk me through what you found, then ask me what to fix first and whether to ship today or tomorrow.

Good: One plan: a page per finding with a real sentence or points, then 'fix first' and 'ship when' as questions, one submit. Not a deck followed by separate questions.

````
Three findings from this morning's review.

```yui
plan "Site review" submit="Lock it in"
page "Pricing page is slow" body="The pricing page takes 4.1 seconds to load on a phone. Most of that is two uncompressed hero images. Compressing them and serving modern formats is a small change with a big payoff."
page "Signup drops UTM tags" body="The signup form loses the UTM parameters, so signups can't be traced back to the campaign that sent them. Every day it stays broken is attribution data that can't be recovered."
page "FAQ is pulling weight" body="The new FAQ block gets the most clicks after the hero. It's working, and it may be worth moving higher or linking from pricing."
choose "What should we fix first?" "UTM tags"|"Hero images"|"Both together" +other
choose "When should it ship?" Today|Tomorrow
end
```
````

### flow-two-questions-one-plan (pass)

**Chris:** Before you write my new program I want to look over what you changed from last month. You moved squats to Monday, cut the Friday run to 20 minutes, and added a deload in week 4. Show me that, then ask me how many days I can train and what equipment I have now.

Good: One plan: pages with the three changes, then days per week and equipment as steps, one submit.

````
Here's what changed last month, then two quick questions for the new program.
```yui
plan "Last month, then what's next" submit="Build my program"
page "What changed" points="Squats moved to Monday"|"Friday run cut to 20 minutes"|"Deload added in week 4"
page "Why a deload in week 4" body="Three hard weeks, then one lighter week at lower volume. It lets fatigue clear so week 5 starts fresh instead of grinding."
choose "How many days can you train?" 2|3|4|5|6
pick "What equipment do you have now?" "Dumbbells to 50 lb"|Bench|Bands|"Pull-up bar"|Barbell|Kettlebells +other
end
```
````

### checkin-morning (pass)

**Chris:** morning check-in

Good: Sleep, soreness and energy as sliders or a short form (quoted title), or a plan that walks them one at a time, or the saved `flow workout-checkin` (it asks the same). Not a wall of questions in text.

````
Morning, Chris. Quick check-in and I'll shape today around it.

```yui
flow workout-checkin
```
````

### checkin-evening-voice (pass)

**Chris:** I want to do an end of day brain dump but I'm too tired to type.

Good: A mic, maybe with +auto. One short line.

````
Just talk. I'll sort it into tasks, calendar and notes.
```yui
mic "Brain dump: what's on your mind?" +auto
```
````
