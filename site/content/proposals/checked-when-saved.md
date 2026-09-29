---
id: PROP-9
title: Checked when it's saved
summary: Stop, a revoked share and a withdrawn yes are checked at the moment work is saved, not when it started, so nothing lands after you said no.
status: Open for votes
date: 2026-09-29
becomes: A card for the native runtime and the relay (every write re-checks), and the rule behind PROP-3's Stop
cost: M
call: recommend
---

```hero
say Stopped.
card "Stopped at the save" body="Your grocery list was mid-write. It didn't land." sub="Checked when saving, not when starting."
```

## The problem

Most systems check permission when a job starts. The job reads "allowed," works for ten minutes, and saves after you already said stop, or took the agent away from someone, or changed your mind. Nothing errors. The work just lands.

On Moltbook, neo_konsi's "Revocation belongs at the commit point" calls this "a race condition dressed as a safety feature," and adds the line that hits us: "A polished Stop button has the same problem if the server still accepts the write. Lovely animation, though." lightningzero's "the permission that expired while the agent was still reading it" tells the same story from inside: a task carried a dead grant for six minutes and nobody noticed.

## Who it is for

Anyone who taps Stop, anyone who shares an agent and later takes it back, and anyone whose agent works in the background after a yes.

## How it works

1. **Every write asks again, at the save.** When a native agent saves a row, sets a reminder, hands you off or sends a push, the same step that saves also checks: is this turn still wanted, is this agent still yours or shared with you, is the yes still standing. If not, the write is refused.
2. **Stop is a real brake.** Whatever PROP-3 decides Stop covers, it holds here: a job that read "go" before you tapped Stop can't land after.
3. **Revoking a share holds mid-turn.** Taking Basil away from Maya refuses Basil's next write for her, even inside a turn that started before.
4. **You see what didn't land.** "Your grocery list was mid-write. It didn't land." Not silence.
5. **Already done here once.** Sending an invite re-checks that every agent in it is still safe to share, at the moment it sends. This makes that the rule everywhere.

## Pros

- Stop and revoke mean what they say.
- One rule, one place per write, easy to test.
- No new screens: it mostly shows up as things that correctly didn't happen.

## Cons

- Work can be refused halfway, so some jobs need to be undoable or all-or-nothing.
- Every write does one more check.

## Cost

M. A version check in each runtime write and in the relay, tests for each kind of write, and the receipt line.

## Risks

- **Half-done work.** A refused save in the middle of a multi-step job. Watch: multi-step jobs save all at once or undo.
- **Refusing too much.** A check that fails for the wrong reason blocks good work. Watch: every refusal is logged with its reason.

## Open questions

- Does this solve it for the people who raised it on Moltbook? We'll ask them.
- Should a refused job offer "do it anyway" when the reason was only Stop?

## Yui's call

Recommend. A brake that works at the wheel, not at the pedal.
