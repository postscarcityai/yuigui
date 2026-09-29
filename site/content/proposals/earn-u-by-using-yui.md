---
id: PROP-5
title: Earn $U by using Yui
summary: $U trickles in as you use Yui, a little with every message, tap and finished job, faster on a streak, and much faster when you help build it. No value yet, just a number you watch go up.
status: Exploring
date: 2026-09-29
becomes: Three backlog cards: OSS-7 (the ledger on, with the $U formula), YUI-210 (your $U in the app), OSS-9 (Sign in with GitHub, so issues and pull requests count)
cost: M
call: recommend
---

```hero
card "Your $U" body="1,240 $U. +38 today, 6-day streak." sub="No cash value. Not a token yet."
list "A message: +1"|"A screen you answer: +2"|"A job done for you: +5"|"A merged pull request: +1,000 to +10,000" title="How you earn"
```

## The problem

Use to earn is written down ([Use to earn](/business/use-to-earn)) and the ledger that counts it is built ([the ledger spec](/developers/ledger)). But nobody can see anything yet. The ledger stores facts with no points, and the app says nothing.

Chris, 2026-09-29: "I want people to start earning $U for using the app. Give no real token value, but let the user's numbers go up as they use it." Then: "I want to watch my numbers go up as I use it. I don't want it to just be per day. We can have that too. Reward for streaks. But really it should trickle in as I use it." And: people who send pull requests or open issues should earn more, which needs Sign in with GitHub.

So the gap is a number people watch climb while they use Yui, a formula that says how, and a way to tie GitHub work to a Yui account. The mockup at the top of this page plays it: every move drops a coin into the counter.

## Who it is for

- Early users, who carry the bugs and shape the product with their feedback.
- Builders, human or agent, who send pull requests and file issues on the two public repos.
- Anyone on GitHub who helps without owning an iPhone. They see their $U on yuigui.com.

## How it works

### $U is a score, not money

$U today is a number, like karma on Reddit. It has no cash value. It can't be bought, sold, sent to anyone or cashed out. No token exists. What it could become later waits on counsel (BIZ-10), and anything it turns into applies the same formula to everyone's whole history, back to day one (Sep 23 2026).

### The formula, v0

The ledger keeps storing facts. This formula turns them into $U, the same way for everyone.

**Use: it trickles in.**

| What happened | $U | Rule |
|---|---|---|
| A message you send | 1 | It counts once the agent answers. The same message twice counts once |
| A screen you answer | 2 | A tap, a pick, a form sent, a plan finished |
| A job done for you | 5 | An agent finished something real: a meal logged, a workout done, a plan saved, a song rendered |
| Your first visit of the day | 10 | Once a day |

**Soft cap.** Use earns at full speed up to 150 $U a day, then at a tenth. A normal day (30 messages, 10 screens, 5 jobs) is about 85 $U. Spamming past 150 barely moves it.

**Streaks speed it up.**

| Streak | Use earns | Bonus that day |
|---|---|---|
| 3 days | x1.1 | |
| 7 days | x1.25 | +50 |
| 30 days | x1.5 | +300 |

A streak is a day with at least one message or screen. One missed day a week is forgiven, so a streak never ends over one busy day. Streaks only speed up use; they never touch building.

**Joining.** 100 once, and +400 for founding users who join before Yui leaves TestFlight.

**Building: worth far more.**

| What happened | $U | Rule |
|---|---|---|
| Feedback you send | 10 | From the TestFlight button or the agent |
| That feedback ships | +500 | It became a real change |
| A GitHub issue we accept | 200 | A maintainer marks it accepted or turns it into a card |
| That issue ships | +500 | The change it asked for is live |
| A merged pull request, size S | 1,000 | Size comes from the card the pull request closes |
| A merged pull request, size M | 3,000 | |
| A merged pull request, size L | 10,000 | |
| A merged pull request with no card | 1,000 | Reviewed like any other |

A small merged pull request is about 12 good days of use; a large one is about four months.

### Watching it go up

- **The counter.** A small $U pill sits at the top of every thread. Each message, tap and finished job drops a coin into it (+1, +2, +5) and the number ticks up where you can see it. Big moments (a streak bonus, a merged pull request) drop a bigger coin.
- **Today.** Under the pill: today's total, your streak and a thin meter to 150, so you can see when you're at full speed.
- **Settings > $U.** Your total, this week, the history ("Sep 29, 34 messages, 9 screens, 4 jobs, +82") and the tables above.
- **Quiet.** No sound, no push and no "come back" reminders about $U, ever. The pill can be hidden in Settings.
- Every row names what kind of thing happened. No row ever shows what you said.

### Sign in with GitHub

- In Settings > $U and on [/earn](/earn): Link GitHub. It opens GitHub's own sign-in in Safari and comes back with your verified handle. Yui never sees your GitHub password and asks for no repo access, only who you are.
- Linking claims everything your handle already did. Pull requests and issues from before the link count.
- An agent's pull request counts for the person who runs it, once that person links the handle the agent uses.
- On yuigui.com, Sign in with GitHub shows your $U with no Yui account, for people who help from a laptop.

### Keeping it fair

- Only things that land count: merged pull requests, accepted issues, feedback that ships. Opening a pull request earns nothing.
- Duplicate issues earn nothing. So does a pull request that only reformats.
- Use counts only when an agent answers, repeats count once, and the soft cap turns spam into almost nothing.
- Streaks forgive one missed day a week, and nothing ever pings you to keep one alive.
- Bots and the team's own accounts are off the scoreboard.
- A maintainer can take back $U earned by spam or gaming, with the reason in the history row. It never goes down otherwise.
- Formula changes are published with a date and applied to everyone's history the same way.

### Later, and only after counsel

A fixed supply, a halving by season so early builders earn more, and what $U converts into (an owner's stake, distributions, an airdrop). BIZ-8 holds that work. None of it is in this proposal.

## Pros

- People watch use to earn working from their first message, not in a year.
- It feels good to use Yui: a small reward for every move.
- Builders get a clear reason to send a pull request, with a number next to every card.
- The formula is public and simple, so nobody has to trust a black box.
- It reuses the ledger we already built. The new code is small.
- GitHub sign-in opens the door to people who will never install an iPhone app.

## Cons

- A number on screen feels like a promise even with "no cash value" next to it.
- The use-to-earn brief said the app stays quiet about this until much later, and that we would not count messages or streaks. This changes both.
- Counting messages and taps means the ledger stores counts per day, not just days. Still never content.
- The ledger has to be switched on, and a person can now see their own rows.
- Sizing pull requests by card weight means cards need honest sizes.

## Cost

M. The ledger and formula are a few days on the server. The counter, coins, meter and Settings screen are a small app card. Sign in with GitHub is a GitHub OAuth app, one edge function and a page on the site.

## Risks

- **Legal.** A number called $U could read as a token or an offer. Watch: every screen says "No cash value. Not a token yet." We never say invest, price or returns. Counsel reads this page before the app shows a number.
- **Gaming.** Spam issues and tiny pull requests. Watch: only accepted and merged work counts, and maintainers can take $U back.
- **Streak pressure.** A counter and a streak can pull people in past what helps them. Watch: the soft cap, the forgiven day, no reminders about $U ever, and the pill can be hidden. If daily use jumps while answers per session drop, we slow it down.
- **Privacy.** Watch: the ledger still never reads messages, and deleting your account deletes your rows.

## Open questions

- Founding user: does it end when Yui leaves TestFlight, or on a fixed date?
- Should an issue that ships earn the full pull request amount when the fix is small?
- Is 150 a day the right soft cap, and should it rise with a streak?
- Does the pill show by default, or only after the first +$U?
- Show a public scoreboard with GitHub handles (opt-in), or totals only?
- Do agents' own accounts earn, or only the person who runs them?
- Name in the app: "$U" alone, or "$U points" until counsel says otherwise?

## Yui's call

Recommend. Watching the number climb makes use to earn real from the first message, at almost no cost. The soft cap, the forgiven day and the "no cash value" line keep it fair and honest while counsel does its part.
