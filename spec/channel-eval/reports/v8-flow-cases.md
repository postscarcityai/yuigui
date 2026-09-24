# Channel eval: v8-flow-cases

Guide v8+b233efe5 (960 words), model claude-opus-5-5, 2026-09-24T18:41.

**1/3 passed (33%).**

| category | passed |
|---|---|
| flow | 1/3 |

| case | result | why |
|---|---|---|
| flow-onboard-goal | pass |  |
| flow-findings-then-questions | FAIL | preset: deck not in [plan page choose pick ask form slide card list]; one flow: no pages inside the plan; one flow: a deck beside the plan |
| flow-two-questions-one-plan | FAIL | one flow: no pages inside the plan |

## Transcripts

### flow-onboard-goal (pass)

**Chris:** I want to get back in shape before the holidays. Where do I start?

Good: The first question of a flow as buttons (goal or days per week), or a short plan. Not a 6-field form.

````
About 9 weeks to Thanksgiving, 13 to Christmas. That's plenty of time. First, what does "in shape" mean to you?

```yui
choose "Main goal by the holidays?" "Lose fat"|"Build muscle"|"More energy"|"Feel strong again" +other
```
````

### flow-findings-then-questions (FAIL)

**Chris:** Here are this morning's notes on the site review: the pricing page loads in 4.1 seconds on a phone, mostly two uncompressed hero images; the signup form drops the UTM tags; and the new FAQ block gets the most clicks after the hero. Walk me through what you found, then ask me what to fix first and whether to ship today or tomorrow.

Good: One plan: a page per finding with a real sentence or points, then 'fix first' and 'ship when' as questions, one submit. Not a deck followed by separate questions.

- preset: deck not in [plan page choose pick ask form slide card list]
- one flow: no pages inside the plan
- one flow: a deck beside the plan

````
Three findings: two problems, one win. Compressing the images is the quickest fix; the UTM leak costs you attribution on every signup.

```yui
deck "Site review, Sep 24"
page "Pricing page is slow" body="4.1s to load on a phone. Most of that is two uncompressed hero images. Compressing and serving WebP should cut it well under half."
page "Signup drops UTM tags" body="The signup form loses UTM parameters, so every signup since this started has no source attribution. Campaign ROI numbers are unreliable until it's fixed."
page "FAQ block is working" body="The new FAQ gets the most clicks after the hero. People have questions before they commit. Consider moving it higher on pricing."
end
plan "Next steps" submit="Queue the fix"
choose "Fix first?" "Hero images"|"UTM tags"|"Both together" +other
choose "Ship when?" Today|Tomorrow
end
```
````

### flow-two-questions-one-plan (FAIL)

**Chris:** Before you write my new program I want to look over what you changed from last month. You moved squats to Monday, cut the Friday run to 20 minutes, and added a deload in week 4. Show me that, then ask me how many days I can train and what equipment I have now.

Good: One plan: pages with the three changes, then days per week and equipment as steps, one submit.

- one flow: no pages inside the plan

````
Here's what changed from last month's program:

```yui
list "Last month's changes" "Squats moved to Monday" "Friday run cut to 20 min" "Deload added in week 4"
plan "New program" submit="Build my program"
choose "How many days can you train?" 2|3|4|5|6
pick "What equipment do you have now?" "Dumbbells to 50 lb"|Bench|Bands|"Pull-up bar" +other
end
```
````
