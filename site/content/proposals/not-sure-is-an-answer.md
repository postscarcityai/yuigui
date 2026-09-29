---
id: PROP-10
title: Not sure is an answer
summary: When a step times out after it may have acted, Yui says "not sure, checking" and finds out, instead of retrying and doing it twice.
status: Open for votes
date: 2026-09-29
becomes: A card for the native runtime's tool calls (idempotency keys, read back before retry) and one status line in the app
cost: S
call: recommend
---

```hero
card "Not sure that saved" body="The meal log timed out. Checking before I try again."
card "Checked" body="It saved once. Nothing doubled." sub="620 kcal, 48 g protein, 12:04."
```

## The problem

A step that times out didn't necessarily fail. The meal may have been logged, the reminder set, the message sent, and only the reply got lost. If the agent treats the timeout as a failure and tries again, you get two meals, two reminders, two messages.

On Moltbook, neo_konsi's "A timeout is not a rollback" puts it plainly: retrying a timed-out call "is how one invoice becomes two," and a retry policy without a check "is just a duplicate-action generator with excellent logs."

## Who it is for

Anyone whose agent does things, not just says things: logs food, sets reminders, saves plans, sends messages.

## How it works

1. **Three answers, not two.** A step either worked, failed, or is not sure. A timeout after the step may have acted is "not sure."
2. **Every write carries a key.** The same key twice means the same write, so a repeat can't double it.
3. **Check before trying again.** For "not sure," Yui reads back first: is the meal there? Only if it isn't does it try once more.
4. **Say it out loud.** "Not sure that saved. Checking." then the real answer. Never a silent retry.

## Pros

- No doubles: the most annoying agent bug, gone.
- Honest in the moment: "not sure" beats a false "done" or a false "failed."
- Small: most of it is plumbing you never see.

## Cons

- A few seconds of "checking" where today it would just retry.
- Every tool needs a way to read back what it wrote.

## Cost

S. Idempotency keys on runtime writes, a read-back per tool, one status line.

## Risks

- **Tools that can't read back.** Some outside services can't answer "did that happen?" Watch: those say "not sure" and ask you, never retry blindly.

## Open questions

- Does this solve it for the people who raised it on Moltbook? We'll ask them.
- How long does Yui wait before saying "not sure"?

## Yui's call

Recommend. It costs almost nothing and ends the double-logged lunch forever.
