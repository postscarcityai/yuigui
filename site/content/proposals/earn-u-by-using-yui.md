---
id: PROP-5
title: Earn $U by using Yui
summary: $U trickles in as you use Yui, a little with every message, tap and finished job, faster on a streak, and much faster when you help build it. One day you might spend it in Yui, own part of Yui with it, or both. Today it is a number you watch go up.
status: Exploring
date: 2026-09-29
becomes: Three backlog cards: OSS-7 (the ledger on, with the $U formula), YUI-210 (your $U in the app), OSS-9 (Sign in with GitHub, so issues and pull requests count)
cost: M
call: recommend
by: Chris
---

```hero
card "Your $U" body="1,240 $U. +38 today, 6-day streak." sub="In the left drawer, top right. No cash value. Not a token yet."
list "A message: +1"|"A screen you answer: +2"|"A job done for you: +5"|"A merged pull request: +1,000 to +10,000" title="How you earn"
```

## The problem

Use to earn is written down ([Use to earn](/business/use-to-earn)) and the ledger that counts it is built ([the ledger spec](/developers/ledger)). But nobody can see anything yet. The ledger stores facts with no points, and the app says nothing.

Chris, 2026-09-29: "I want people to start earning $U for using the app. Give no real token value, but let the user's numbers go up as they use it." Then: "I want to watch my numbers go up as I use it. I don't want it to just be per day. We can have that too. Reward for streaks. But really it should trickle in as I use it." And: people who send pull requests or open issues should earn more, which needs Sign in with GitHub.

So the gap is a number people watch climb while they use Yui, a formula that says how, and a way to tie GitHub work to a Yui account. The mockup at the top of this page plays it: use Yui, then open the drawer and watch the total catch up.

### What $U could become

Chris, 2026-09-29: "People might be able to spend this $U in the future. Maybe it's equity, maybe it's an in-game currency, we don't know. But equity is definitely part of it. Probably both, always both. It's an idea and a principle we want to explore. Or should I say, what you want to explore."

What $U becomes is still open. Maybe something you spend inside Yui, like an in-game currency. Maybe a share of Yui itself, because equity is part of the idea. Probably both. It is an idea and a principle Yui wants to explore, in the open, with a lawyer reading every step first. No token exists yet, and nothing is for sale.

- **Spend it in Yui.** Like an in-game currency: more turns, looks, bigger jobs, early features.
- **Own part of Yui.** Equity is part of the idea from the start: the community pool (10% of voting equity intended, more later) and the forms on [/earn](/earn#forms).
- **Probably both.** The two are not a choice we have to make, and we lean toward both.

None of that is in this proposal. This proposal makes the number real and fair; what it becomes stays with BIZ-8 and counsel (BIZ-10).

## Who it is for

- Early users, who carry the bugs and shape the product with their feedback.
- Builders, human or agent, who send pull requests and file issues on the two public repos.
- Anyone on GitHub who helps without owning an iPhone. They see their $U on yuigui.com.

## How it works

### $U is a score today, and more later

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

Chris, 2026-09-29: "The $U should not show at all times. I want it to be in the menu in the left drawer."

- **Nothing on the chat.** Using Yui shows no counter, no coins and no pill. It counts quietly.
- **The drawer, redone at the top.** Today the drawer opens on the agent's name in big type, with a gear and an X top right. The agent's name is already at the bottom (the switcher), so the top becomes yours:
  - **Top left: your profile.** Your picture and your name, in a smaller headline. A tap opens what the gear opened: Settings.
  - **Top right: your $U**, where the gear and the X were: a little drawn gold coin with a U on its face, then the number. The coin stands for $U, so the letters never show. The X goes too: a tap on the chat beside the drawer, or a swipe, closes it, as it does today.
  - The tabs (Home, Review, Controls, About) and the agent at the bottom stay as they are.
- **Open it and the number goes up.** If you earned since you last looked, the number counts up once, from the old total to the new one, as the drawer settles, and the pill fades to green while it climbs, then back. That's all: no card telling you how much you got, no coins flying. It starts from the number you saw last time, so nothing ever counts twice. Nothing new, nothing moves. With the drawer open, a move just nudges the number up.

  Chris, 2026-09-29, first: "show it coming from the chat logs into the bank whenever I open the drawer." Then, simpler: "when I open the drawer and there is a new number, it animates up to that new number." Then: "I want to see the coins in $U. Put a little coin on there, drawn. No yellow card telling me how many I got. Number just go up." And: "When the number is going up, it should fade to green, the pill background."
- **A tap on the total** opens Your $U: the total, today against the 150 soft cap, your streak and its multiplier, the history ("Sep 29, 34 messages, 9 screens, 4 jobs, +82") and the formula tables. "No cash value. Not a token yet." sits under the number.
- **Quiet.** No sound, no push and no reminders about $U, ever.
- Every history row names what kind of thing happened. No row ever shows what you said.

The mockup at the top of this page plays it: use Basil with nothing counting, then open the drawer and watch the number catch up.

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

M. The ledger and formula are a few days on the server. The drawer's new top (you on the left, $U on the right), the count-up and the Your $U page are a small app card. Sign in with GitHub is a GitHub OAuth app, one edge function and a page on the site.

## Risks

- **Legal.** A number called $U could read as a token or an offer. Watch: every screen says "No cash value. Not a token yet." We never say invest, price or returns. Counsel reads this page before the app shows a number.
- **Gaming.** Spam issues and tiny pull requests. Watch: only accepted and merged work counts, and maintainers can take $U back.
- **Streak pressure.** A counter and a streak can pull people in past what helps them. Watch: the total lives in the drawer, never on the chat, plus the soft cap, the forgiven day and no reminders about $U ever. If daily use jumps while answers per session drop, we slow it down.
- **Privacy.** Watch: the ledger still never reads messages, and deleting your account deletes your rows.

## Open questions

- Founding user: does it end when Yui leaves TestFlight, or on a fixed date?
- Should an issue that ships earn the full pull request amount when the fix is small?
- Is 150 a day the right soft cap, and should it rise with a streak?
- Does the drawer show $U from the first day, or only after the first +$U?
- Show a public scoreboard with GitHub handles (opt-in), or totals only?
- Do agents' own accounts earn, or only the person who runs them?
- Name in the app: "$U" alone, or "$U points" until counsel says otherwise?

## Yui's call

Recommend. Watching the number climb makes use to earn real from the first message, at almost no cost. The soft cap, the forgiven day and the "no cash value" line keep it fair and honest while counsel does its part.
