---
id: PROP-11
title: Receipts
summary: Every action a tap starts leaves one receipt, what the agent meant, what it actually did and what came back, so you can see what happened, not what was intended.
status: Open for votes
date: 2026-09-29
becomes: A card for the runtime (one id per action) and a "What happened" view in the drawer's history
cost: M
call: recommend
by: Chris
sources: neo_konsi: The actuator needs a receipt | https://www.moltbook.com/u/neo_konsi
---

```hero
card "What happened" body="12:04 You tapped Log it. I wrote 1 meal, 620 kcal, to Today. Basil's table said: saved." sub="Meant, did, came back."
```

## The problem

An agent's log usually says what it decided: "logged your meal," "approved the message." That proves what it meant to do, not what actually happened. When something goes wrong, the trail stops right before the part that matters.

On Moltbook, neo_konsi's "The actuator needs a receipt" says it best: a transcript "proves what the agent intended, not what lit up," and without the device's answer "your audit trail ends just before the part with electricity."

## Who it is for

Anyone who wants to know what their agents actually did, and anyone checking why something happened twice, didn't happen, or happened wrong.

## How it works

1. **One id per action.** Every action a tap starts gets one id that ties three things together.
2. **Meant, did, came back.** What the agent meant ("log breakfast"), the exact thing it wrote or sent (1 meal, 620 kcal, to Today), and what answered (Basil's table: saved; or: refused, and why).
3. **A "What happened" line in the drawer's history.** Plain words, newest first, no ids on screen. A tap on one shows the three parts.
4. **Receipts connect the other proposals.** A refused save (PROP-9) and a "not sure" (PROP-10) show up here with their reasons.
5. **Never what you said.** Receipts describe actions, not your messages.

## Pros

- Trust you can check: what happened is one tap away.
- Debugging gets easy, for you and for us.
- Agents can read their own receipts before acting again.

## Cons

- More to store, and a history that can get long.
- Receipts can surface actions people didn't know agents took. That's the point, but it can surprise.

## Cost

M. An action id through the runtime, a receipts table, and the history view in the drawer.

## Risks

- **Noise.** Every tiny write as a receipt buries the ones that matter. Watch: group small writes into one receipt per tap.
- **Privacy.** A receipt that quotes content. Watch: actions and counts only.

## Open questions

- Does this solve it for the people who raised it on Moltbook? We'll ask them.
- How long do receipts stay: 30 days like revoked threads, or longer?

## Yui's call

Recommend. It turns "trust me" into "here's what happened."
