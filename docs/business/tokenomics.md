# Yui | $U tokenomics v1

Oct 1 2026, a design brief for BIZ-8. Public, like the rest of the project. This is a plan, not an offer: no $U token exists, nothing is for sale, and nothing here promises anyone money. Every point that needs a lawyer is marked **[counsel]**, and counsel reads this page first (BIZ-10). Chris signs off before any of it goes live.

Builds on [Earn $U by using Yui](https://www.yuigui.com/proposals/earn-u-by-using-yui) (the Season 0 formula), [Use to earn](https://www.yuigui.com/business/use-to-earn) and [/earn](https://www.yuigui.com/earn).

## The short version

- **Two layers, kept apart.** Points are what you earn today, by a public formula (PROP-5). $U is what points could turn into one day. Points can run for years with no token at all.
- **Only work earns.** Use, merged pull requests, feedback that ships. Nobody pays in, so nobody is waiting on a return from money they put in.
- **A fixed cap.** One number, set once, never raised.
- **Seasons that halve.** Early builders earn more per point, because each season's pool is half the one before.
- **One path.** Facts go on the ledger, points are counted at season's end, a snapshot is published, then people claim. Nothing is claimable before counsel clears it.
- **Spend and own, both.** $U is designed for a spend side (turns, looks, jobs, early features) and an equity side (the community pool). Probably both, always both.

## 1. The cap **[counsel]**

**Recommend: 1,000,000,000 $U, fixed forever.** One billion is a round, readable number where a single $U can stay a small thing and a normal day's points are not decimals. No mint function exists after the cap is reached, and no admin key can raise it. If we ever want more, we start a new thing; we do not change this one.

A cap only matters if it is true. The plan is to publish the rule before anything exists, so anyone can check it later.

## 2. Emission: seasons that halve **[counsel]**

Time is cut into seasons of six months. Each season has a fixed pool of $U. The pool is shared out by points: your share of the season's points is your share of the season's pool.

- **Season 0** runs from Sep 23 2026, the first day on the ledger, and ends 6 months later.
- **Each season's pool is half the last.** Season 1 gets half of Season 0, and so on.
- **The pool is fixed, not the rate.** If a thousand people join, the pool is shared among more people. Nobody can inflate the supply by being busy.

This is why early builders earn more per point: fewer people, a bigger slice, a bigger pool. And a halving by season is easy to explain and hard to argue with.

## 3. Season 0: how much to give out

Chris asked for a number. **Recommend: a Season 0 pool of 50,000,000 $U, 5% of the cap.** Halving makes the whole earn side add up to just under 10% of the cap, ever. The other 90% is not given out for work. It stays unallocated until counsel and Chris decide what the spend side and the equity side need.

Why 50 million, and not more:

- **Small beats big.** Season 0 is a few hundred people at most. A large pool shared among so few makes each person's slice look like a windfall, and that is the wrong signal.
- **It leaves room.** Giving out 5% and halving means later builders still have a real pool, and nobody has to explain why the first month took a third of everything.
- **It is easy to defend.** The first number a lawyer asks about is how much goes to insiders. Ten percent for all work, ever, is a short answer.
- **It can be undone upward, never downward.** A season's pool can be raised before it starts if the work is bigger than we think. It can never be cut after it ends.

How it splits inside Season 0: **use and joining 40%, building 60%.** The formula already pays a merged pull request far more than a day of use, so this is a check, not a new rule. If building earns less than its 60%, the rest rolls into the next season's building pool, not into use.

A worked check, with the formula v0 numbers: a person using Yui for the whole season at about 85 points a day earns about 15,000 points. One merged size M pull request is 3,000. A few hundred people using and sixty building sit well inside the pool.

## 4. Sizing by card weight

A merged pull request earns by the size of the card it closes, as in PROP-5: S, M or L. Sizes come from the board, set by a maintainer before work starts, never by the author.

- **S: 1,000 points.** **M: 3,000.** **L: 10,000.**
- $U per point is set by the season pool, at season end **[counsel]**.

Two rules keep this honest. A pull request with no card is S until a maintainer says otherwise. And if a card turns out bigger than its size, the size is fixed on the board and the extra points are paid once, with the reason on the history row.

## 5. The one mechanism: ledger, then claim **[counsel]**

Everything runs on one path, in order:

1. **The ledger** records facts from day one: use days, merged pull requests, feedback that shipped. It never reads what you said.
2. **Points** are counted from facts by the published formula. Same formula, same history, for everyone.
3. **Season close.** The points for the season are frozen and a snapshot is published: handle, points, share. A person can check their own row, and anyone can check the sum.
4. **Claim.** After counsel clears it, each person claims their share by signing in. No one is sent anything they did not ask for. A wallet can come from Sign in with Apple on Sui, the planned chain.

The claim step is the only place anything leaves the building, and it is switched off until counsel and Chris say so. Until then, nothing converts.

## 6. Anti-gaming

Gaming gets more tempting the moment a number becomes worth something, so the defences are built in first.

- **Sybil (many fake accounts).** Use points need an Apple account, one per person, and a daily soft cap of 150 makes a second account pay almost nothing. Building points need a verified GitHub handle. A new account's use counts at a tenth until it has one shipped item. A maintainer can merge accounts that are clearly one person.
- **Spam pull requests.** Only merged work earns. Opening a pull request earns nothing. A pull request that only reformats, or changes a card's size, earns nothing. Spam that wastes a reviewer's time loses the author's standing, not just points.
- **Self-review.** The author never approves their own pull request. Points pay 14 days after merge, and a revert inside that window cancels them. The team's own accounts and bots are off the scoreboard.
- **Taking back.** A maintainer can take back points from spam or gaming, with the reason on the history row. A person can see it, and can appeal in public.
- **Agents.** An agent's work counts for the person who runs it, once that person links the handle. One person, many agents, still one share.

## 7. Value levers **[counsel]**

These are the things that could make $U worth holding, and each one carries a legal question. None is switched on.

| Lever | What it does |
|---|---|
| Hard cap | One billion, ever. Checked in the open |
| Halving | Each season's pool is half the last |
| Burn for perks | Spend $U in Yui on turns, looks, bigger jobs or early features, and it is burned, not paid to us |
| Revenue buyback | A share of future revenue buys $U back and burns it. This is the lever most likely to look like profit sharing |
| Staking for vote weight | Lock $U to count more in the open polls on what Yui builds next. A vote, not a payout |

Counsel's questions, in the order they matter:

1. Does any of this make $U a security? A token tied to profit, revenue or equity probably does.
2. Is the buyback allowed at all, or does it have to go?
3. Can staking carry a vote with no payout, and stay a vote?
4. Is "earn by work, nobody pays in" enough to keep $U out of an offer?
5. What does the equity side look like: the 10% community pool, a share of it, or a separate thing?

If the answer to the first is yes, the plan changes shape, and we say so on the page. We would rather change the plan than the law.

## 8. Both sides: spend and own **[counsel]**

Chris's principle, Sep 29: $U may be spendable one day, maybe equity, maybe an in-game currency, probably both, always both.

- **Spend side.** Burn $U for turns, looks, jobs and early features. This is the lever the least legal weight attaches to, because it is a use, not an investment.
- **Equity side.** Equity is part of the idea from the start: the 10% community pool and the forms on [/earn](https://www.yuigui.com/earn#forms). How $U relates to it is the biggest open question here, and it waits on counsel entirely.
- **Always both** means the design never forces a choice. A person's points count toward either.

## What stays open

- Season length: six months, or shorter at the start.
- Whether the cap is too big or too small for a few hundred people.
- Whether the build share should be 60% or higher.
- What conversion looks like, if the answer from counsel is "not yet".
- Name in the app: "$U" alone, or "$U points" until counsel says otherwise.

## Guardrails

- Nothing is for sale. No mint, no sale, no equity promise goes live without counsel and Chris.
- Marketing says "use to earn", "it counts" and "a stake". Never "invest", "profit", "returns", "price" or a launch date.
- This page designs a mechanism. It says nothing on what $U is worth.
