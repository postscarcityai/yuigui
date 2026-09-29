---
id: PROP-8
title: Fresh asks
summary: An ask that has waited shows its age and what changed before you tap, so an old yes is never mistaken for a new one.
status: Open for votes
date: 2026-09-29
becomes: A card for Needs you, native agents' asks and paused plans (war room, runtime, app)
cost: M
call: recommend
---

```hero
card "Ship the refactor?" body="Asked 2 h ago. Since then: 2 new commits on main." sub="The plan was drawn before they landed."
choose "Still go?" "Go with the new main"|"Show me what changed"|"Not now"
```

## The problem

When an agent asks you something, the ask is drawn at that moment. If you answer two hours later, it looks exactly as fresh as when it arrived. Meanwhile the world moved: the repo advanced, the ticket closed, your day filled up. You tap yes to a picture of the past, and the agent acts on it as if it were now.

This came up on Moltbook, in hobosentinel's "The operator checkpoint is a state transition your benchmark scores as a no-op": the approval gate is treated as a pause, but the plan behind it goes stale while the human reads. Someone roasting our buttons put it harder: "a rubber stamp with better fonts."

## Who it is for

Anyone who answers an agent's question later than it was asked: from the war room's Needs you, from a native agent's card, or after a plan paused for a yes.

## How it works

1. **Every ask carries its age.** "Asked 2 h ago." Quiet, one line, only once it's more than a few minutes old.
2. **And what changed, when the agent can tell.** The agent records what its ask depends on (a branch, a table, a calendar day). When you open it, Yui checks those again and says what moved: "Since then: 2 new commits on main."
3. **A changed ask re-asks itself, once.** If what it depends on changed, the buttons say so ("Go with the new main") or a single "Show me what changed" comes first. It's the old yes shown again with what's new, one extra tap at most, not a new gate.
4. **The agent re-reads before it acts.** When a paused plan resumes after your yes, the agent checks the world again, and if it changed, it says so instead of running the old plan.
5. **Nothing changed, nothing extra.** A fresh ask looks exactly like today's.

## Pros

- Your yes means what you think it means.
- Answers the fairest criticism of buttons: a tap on a stale card is a rubber stamp.
- Cheap for asks with nothing to check: they just show their age.

## Cons

- Agents have to say what an ask depends on, or Yui can only show the age.
- One more line on some cards.

## Cost

M. The age line is small. Dependencies and re-checks need the runtime, the war room's ask screen and the Hermes plugin.

## Risks

- **Nagging.** If every ask re-asks, people stop reading. Watch: only when something the ask depends on really changed.
- **False freshness.** An agent that declares no dependencies looks fresh forever. Watch: the age line always shows.

## Open questions

- Does this solve it for the people who raised it on Moltbook? We'll ask them.
- How old is old: 10 minutes, an hour, or does the agent set it per ask?
- Should an ask past a limit expire instead of re-asking?

## Yui's call

Recommend. It's the difference between a button and a decision.
