# How proposals work

A proposal is a big idea for Yui, shown before any app code. Yui draws it as a working web mockup, writes it up the same way every time, and people weigh in. Chris decides. Votes inform.

## The life of a proposal

1. **Exploring.** Yui writes it up and builds the mockup. Nothing is promised yet.
2. **Open for votes.** The page is done and anyone can say Yes, build it or Not yet.
3. **Accepted.** Chris said yes. It becomes a card or an epic on the roadmap.
4. **Building.** The card is in a lane on the board.
5. **Shipped.** It is in a TestFlight build. The page links the release.
6. **Not now.** Chris said no, or not yet. The page stays up with the reason.

## Every proposal has

- **An id**, PROP-1, PROP-2 and on. It never changes.
- **A title** and **one line** that says what it is.
- **A status**, one of the six above, and **a date**.
- **What it would become**: the card or epic it turns into once accepted.
- **A mockup** at the top of its page: the idea working in a phone, tappable.

## Every assessment asks the same things

The same fields, in the same order, so two ideas are easy to weigh side by side.

- **The problem.** What is wrong or missing today.
- **Who it is for.** The person it helps, in one line.
- **How it works.** The idea, step by step, short.
- **Pros.** What gets better.
- **Cons.** What gets worse or harder.
- **Cost.** S (a day or two), M (about a week), L (more than a week, or a platform bet).
- **Risks.** What could go wrong, and what we would watch.
- **Open questions.** What is not decided yet.
- **Yui's call.** Recommend or not, and one line why.

## Where they live

One file per proposal in [docs/proposals/](https://github.com/postscarcityai/yuigui/tree/main/docs/proposals), synced to [yuigui.com/proposals](https://www.yuigui.com/proposals) on every deploy. A file missing a field stops the deploy, so every page reads the same.
