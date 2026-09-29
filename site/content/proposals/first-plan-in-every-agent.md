---
id: PROP-4
title: A first plan in every agent
summary: The first time you open an agent, it asks a few taps and builds your first plan. Arnold is the worked example.
status: Exploring
date: 2026-09-29
becomes: A first-open flow in the app for each crew agent (Arnold first, then Basil, Gouda, Penny, Quill), cards to follow. The dead Build my split button on Arnold's screen is fixed in YUI-182.
cost: M
call: recommend
by: Chris
---

```hero
say Hi, I'm Arnold. Four taps and you have a plan.
choose "How many days a week can you train?" 2|3|4|5|6 +other
```

## The problem

Yui's first run recruits the crew (PROP-1). Then you open an agent and it is empty. Arnold shows a template week with nothing checked, "0 of 4", and a Build my split button that does nothing. Chris, in TestFlight feedback: "Just as we have an onboarding flow for the whole app to recruit the agents, your agent should give you a flow to start too."

An agent that starts blank hands the work back to the person. The best moment to make it theirs is the first open, while they are curious.

## Who it is for

Someone who just added an agent and opened it for the first time. For Arnold: a person who wants a workout plan today and does not want to design one.

## How it works

Arnold is the worked example. Every crew agent gets the same shape with its own questions.

1. Open the agent for the first time. It says hi in one line and starts the flow. No blank screen.
2. **Days.** How many days a week can you train? One tap, 2 to 6.
3. **Kind of training.** Lift heavy is the first option and the default. Then lift and cardio, mostly cardio, just move more.
4. **Equipment.** Full gym, barbell, dumbbells, bands, bodyweight only. The split is built from what you have.
5. **Effort.** Arnold pushes heavy weight, and the last set of every lift goes to failure with a safe stop. One tap softens it: one rep short, or ease me in.
6. **Done.** The first split is saved as a table on the agent's screen, and today's session is ready with a Start button. The "0 of 4" counter fills in from it.
7. It is a starting point. Change any day or ask for a different split in a sentence, and the table follows.

The same shape for the others: Basil asks how you eat and what you are aiming for, then saves a week of meals. Gouda asks your instrument and your level, then saves a practice plan. Penny asks when your week is busy, then saves a planning routine. Quill asks what you are learning and how long you have, then saves a study plan.

## Pros

- The first open ends with something useful, not an empty screen.
- Tappable answers, not typing. A phone-sized flow of about four taps.
- It fixes the dead Build my split button by making it the flow's front door.
- Every agent teaches the same pattern, so a new agent is easy to add.
- Heavy to failure is the default, so Arnold has a point of view from minute one.

## Cons

- Another flow to build and keep in step with each agent's tools.
- Some people want to look around first. It needs a Skip.
- A plan from four taps is a rough draft. It has to say so and be easy to change.
- Pushing to failure is not right for everyone: new lifters, injuries, age.

## Cost

M. The flow is one plan screen with saved answers, and the result is a table the agent already knows how to draw. The work is the questions per agent, saving the table, and the first-open trigger in the app. Arnold ships first, the rest follow on the same pattern.

## Risks

- Failure training done badly hurts people. Arnold needs a safe-stop rule, a spotter line for barbell work and an easy way to soften it. We would watch how many pick the softer options.
- A flow nobody finishes. We would watch how many reach the saved split.
- Answers that come back as a plan may not match every agent's own saved data. The agent, not the app, should turn them into the table.

## Open questions

- Does it start on its own on first open, or does the agent ask "Build your first plan?" with a button?
- Is Skip always there, or only after the first question?
- Should heavy to failure be the default for everyone, or only when they say they have lifted before?
- Do we ask about injuries or limits in the flow, or leave it to Arnold's first chat?
- Does the same flow run again when someone wants a fresh split, from Build my split?

## Yui's call

Recommend. It turns the first open into a finished plan in four taps. Ship Arnold's flow first, with a Skip and a softer option next to failure, then copy the shape to the rest of the crew.
