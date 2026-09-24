# social | drafts for Yui's social accounts

**Nothing in this folder has been posted.** Every file in `queue/` is a draft until Chris approves it. Plan: [BIZ-4 Part 5](../docs/business/BIZ-4-content-plan.md).

## How it runs

Cron `yui-social-drafter` (urza, daily 18:30 ET):

1. `node social/pending.mjs` prints every `site/content/progress.json` entry not yet drafted. It tracks entries by key in `state.json`, not by time window, so a missed run drops nothing. Nothing new means no output, and the agent never wakes.
2. The agent writes one draft per platform per entry to `queue/<date>-<slug>-<platform>.md` (format below), using real screenshots from the entry.
3. `node social/validate.mjs` must pass. A draft that fails is fixed or deleted.
4. `node social/pending.mjs --advance "<key>"` marks the entry done. The queue and state are committed.
5. Chris gets one Telegram message, starting with 🔴, listing the new drafts. Silent when there are none.

Chris answers in chat with "ok 1 3", "edit 2: ..." or "no". Whoever handles the reply sets `status: approved` or `rejected` in each draft (applying edits and re-running the validator first) and commits the queue. Posting needs the @yuiguiai accounts and the scheduler (BIZ-4 5.4). Neither exists yet, so nothing posts.

## Draft format

```
---
platform: x            # x, bluesky, threads, linkedin, instagram, youtube, tiktok
account: yuiguiai
source: progress.json 2026-09-24 YUI-27 "<entry title>"
media: [/progress/yui27-demo.webp]
slot: 2026-09-29T09:00:00-04:00
status: draft          # draft, approved, rejected, posted
---
<post text>
---
<next post, threads on x, bluesky and threads only>
```

## What the validator fails

- Em dashes, hype words (seamless, revolutionary, AI-powered, the future of...) and the fleet's banned list.
- BIZ-1's must-not-claims: "the first", "first ever", "most compact", "any agent", "every agent framework", "unlike everyone". "The first outside PR" is a milestone, not a claim, and passes.
- A token multiplier other than 1.6x (vs lean JSON), 2.7x (vs pretty JSON) or 3.9x (vs a component tree), or one of those without what it is measured against.
- Emails, phone numbers, keys and tokens, costs, paths, task ids, and the private names in `site/lib/public-guard.mjs`.
- Over the platform limit (X 280 per post, links count 23), multi-line or hashtagged Instagram captions.
- Missing media, or a media path that is not on disk.
- Two posts on one account in one slot.

Tests: `node --test social/validate.test.mjs`.
