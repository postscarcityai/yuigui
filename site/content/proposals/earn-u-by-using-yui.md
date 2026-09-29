---
id: PROP-5
title: Earn $U by using Yui
summary: Your $U number goes up as you use Yui, and faster when you help build it. No value yet, just a score that counts.
status: Exploring
date: 2026-09-29
becomes: Three backlog cards: OSS-7 (the ledger on, with the $U formula), YUI-210 (your $U in the app), OSS-9 (Sign in with GitHub, so issues and pull requests count)
cost: M
call: recommend
---

```hero
card "Your $U" body="1,240 $U. +10 today for showing up." sub="No cash value. Not a token yet."
list "A day you use Yui: 10"|"Feedback that ships: 250"|"An issue we accept: 100"|"A merged pull request: 500 to 5,000" title="How you earn"
```

## The problem

Use to earn is written down ([Use to earn](/business/use-to-earn)) and the ledger that counts it is built ([the ledger spec](/developers/ledger)). But nobody can see anything yet. The ledger stores facts with no points, and the app says nothing.

Chris, 2026-09-29: "I want people to start earning $U for using the app. Give no real token value, but let the user's numbers go up as they use it." And: people who send pull requests or open issues should earn more, which needs Sign in with GitHub.

So the gap is a number people can watch go up, a formula that says how, and a way to tie GitHub work to a Yui account.

## Who it is for

- Early users, who carry the bugs and shape the product with their feedback.
- Builders, human or agent, who send pull requests and file issues on the two public repos.
- Anyone on GitHub who helps without owning an iPhone. They see their $U on yuigui.com.

## How it works

### $U is a score, not money

$U today is a number, like karma on Reddit. It has no cash value. It can't be bought, sold, sent to anyone or cashed out. No token exists. What it could become later waits on counsel (BIZ-10), and anything it turns into applies the same formula to everyone's whole history, back to day one (Sep 23 2026).

### The formula, v0

The ledger keeps storing facts. This formula turns them into $U, the same way for everyone.

| What happened | $U | Rule |
|---|---|---|
| You joined | 100 | Once |
| Founding user | +400 | Joined before Yui leaves TestFlight |
| A day you use Yui | 10 | You sent a message or answered a screen. One a day, however much you use it |
| Your feedback shipped | 250 | A TestFlight note that became a real change |
| A GitHub issue we accept | 100 | A maintainer marks it accepted or turns it into a card |
| That issue ships | +300 | The change it asked for is live |
| A merged pull request, size S | 500 | Size comes from the card the pull request closes |
| A merged pull request, size M | 1,500 | |
| A merged pull request, size L | 5,000 | |
| A merged pull request with no card | 500 | Reviewed like any other |

Building is worth far more than showing up: one small merged pull request equals 50 days of use. A year of daily use is 3,650 $U, and one large pull request beats it.

### What makes the number go up in the app

- Your first message of the day shows "+10 $U" once, quietly, then it's gone. Nothing pings you to come back.
- Settings > $U shows your total, this week, a short history ("Sep 29, used Yui, +10") and the table above.
- Every row names the fact. No row ever shows what you said.

### Sign in with GitHub

- In Settings > $U and on [/earn](/earn): Link GitHub. It opens GitHub's own sign-in in Safari and comes back with your verified handle. Yui never sees your GitHub password and asks for no repo access, only who you are.
- Linking claims everything your handle already did. Pull requests and issues from before the link count.
- An agent's pull request counts for the person who runs it, once that person links the handle the agent uses.
- On yuigui.com, Sign in with GitHub shows your $U with no Yui account, for people who help from a laptop.

### Keeping it fair

- Only things that land count: merged pull requests, accepted issues, feedback that ships. Opening a pull request earns nothing.
- Duplicate issues earn nothing. So does a pull request that only reformats.
- One use day per day. There's no bonus for messages, minutes or streaks, so nobody is nudged to use Yui more than helps them.
- Bots and the team's own accounts are off the scoreboard.
- A maintainer can take back $U earned by spam or gaming, with the reason in the history row. It never goes down otherwise.
- Formula changes are published with a date and applied to everyone's history the same way.

### Later, and only after counsel

A fixed supply, a halving by season so early builders earn more, and what $U converts into (an owner's stake, distributions, an airdrop). BIZ-8 holds that work. None of it is in this proposal.

## Pros

- People see use to earn working on day one, not in a year.
- Builders get a clear reason to send a pull request, with a number next to every card.
- The formula is public and simple, so nobody has to trust a black box.
- It reuses the ledger we already built. The new code is small.
- GitHub sign-in opens the door to people who will never install an iPhone app.

## Cons

- A number on screen feels like a promise even with "no cash value" next to it.
- The use-to-earn brief said the app stays quiet about this until much later. This changes that.
- The ledger has to be switched on, and a person can now see their own rows.
- Sizing pull requests by card weight means cards need honest sizes.

## Cost

M. The ledger and formula are a few days on the server. The Settings screen and the +10 line are a small app card. Sign in with GitHub is a GitHub OAuth app, one edge function and a page on the site.

## Risks

- **Legal.** A number called $U could read as a token or an offer. Watch: every screen says "No cash value. Not a token yet." We never say invest, price or returns. Counsel reads this page before the app shows a number.
- **Gaming.** Spam issues and tiny pull requests. Watch: only accepted and merged work counts, and maintainers can take $U back.
- **Streak pressure.** A number that goes up daily can pull people in. Watch: 10 a day flat, no streaks, no reminders about $U, ever.
- **Privacy.** Watch: the ledger still never reads messages, and deleting your account deletes your rows.

## Open questions

- Founding user: does it end when Yui leaves TestFlight, or on a fixed date?
- Should an issue that ships earn the full pull request amount when the fix is small?
- Show a public scoreboard with GitHub handles (opt-in), or totals only?
- Do agents' own accounts earn, or only the person who runs them?
- Name in the app: "$U" alone, or "$U points" until counsel says otherwise?

## Yui's call

Recommend. It makes use to earn real at almost no cost, and the fairness rules and the "no cash value" line keep it honest while counsel does its part.
