---
id: PROP-1
title: Pick your crew
summary: A new user picks which agents join, instead of getting all six at once.
status: Exploring
date: 2026-09-28
becomes: An onboarding epic in the app (first-run flow), cards to follow
cost: M
call: recommend
---

```hero
say Hi, I'm Yui. Let's pick your crew.
pick "Who joins your crew?" "Yui, helper and maker"|"Arnold, trainer"|"Basil, nutritionist"|"Gouda, musician"|"Penny, planner"|"Quill, study buddy"|"Bring my own agent" submit="Start" title="Pick your crew" body="Tap to add. Change it any time."
```

## The problem

Today a new user gets every starter agent at once. Six threads before they have said a word. It reads like a demo, not like their app, and it hides the one agent they came for.

## Who it is for

Someone who just installed Yui from TestFlight and wants one thing: to get fit, eat better, make music, plan the week or learn.

## How it works

1. Install from TestFlight, then Sign in with Apple.
2. Yui says hi, in one line.
3. Pick your crew: one row per starter agent (Yui, Arnold the trainer, Basil, Gouda, Penny, Quill), each with its color, name and one line. Tap to add.
4. Dig deeper on any row: what the agent does, its tools and a few of its real screens. Add it from there.
5. Or bring your own agent: Hermes, OpenClaw, Claude Code or something else. Yui shows the pairing code and the one command for that choice.
6. Done: the home shows only the crew they picked. More can join later from Add agent.

## Pros

- The first minute is about them, not about us.
- Fewer threads means a cleaner home and fewer pushes.
- Each agent gets a proper introduction instead of an empty thread.
- Bring your own agent sits in the first run, not buried in settings.

## Cons

- One more step before the first real screen.
- People who would have liked an agent may never meet it.
- Two paths to test: starter agents and your own.

## Cost

M. The picker, the agent pages and the pairing branch are new screens. The starter agents, their looks and their first screens already exist.

## Risks

- A long first run. We would watch how many people finish it.
- Dig deeper pages go stale when an agent's tools change. They should read the same data as /crew.
- Picking no one. The picker needs at least one, or a gentle "start with Yui".

## Open questions

- Is Yui always on the crew, or can you leave Yui out?
- Should the picker suggest a crew from one question ("What brings you here?")?
- Can you remove a starter agent later and get it back?
- Does bring your own agent finish pairing inside the flow, or hand off to Add agent?

## Yui's call

Recommend. It makes the first minute personal and puts bring your own agent where people look for it.
