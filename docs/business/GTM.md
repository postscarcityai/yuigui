# Yui | go-to-market plan: grassroots first

Current plan, Sep 24 2026. Card SITE-20, epic GTM-1. Public, like the rest of the project. Google Doc: https://docs.google.com/document/d/10ryLZe62wTWTrTCiYwSX83HPLfevLHrTPnUPJPcUnAw/edit

This is the one page for how Yui finds its people. It pulls the [content plan (BIZ-4)](https://www.yuigui.com/business/biz-4-content-plan) and the [social accounts plan (BIZ-5)](https://www.yuigui.com/business/biz-5-social-accounts) into a single current plan. Those two stay up as the detail: post formats, bios, example posts, art. Where they differ from this page, this page wins.

Companion docs: [BIZ-1 marketing and positioning](https://www.yuigui.com/business/biz-1-marketing-positioning) (what we say, what we never claim), [BIZ-2 outreach plan](https://www.yuigui.com/business/biz-2-outreach-plan) (where Hermes users are, message drafts), [BIZ-3 revenue models](https://www.yuigui.com/business/biz-3-revenue-models) (no dark patterns), [private beta list](https://www.yuigui.com/business/beta-list).

**Nothing in this plan has been posted, and no account has been created.** It is a plan, listed on the site first. Every social post, every community post and every message to another person goes out only after Chris says yes to it, one by one. What we publish without asking is our own record: this site and our GitHub repos.

## The short version

- **The line:** Meet Yui, a generative user interface. Your agent stops describing things and starts showing them.
- **Who first:** people who already run Hermes, then OpenClaw, then other agent builders. People who do not run an agent yet come later, when Yui can give them one.
- **What grassroots means for us:** an open screen language (Yui Lines) that anyone can write, parse and render; a real way to contribute; and a habit of showing real screens. We grow by people making things with Yui, not by us shouting about it.
- **The engine:** every shipped card already writes a dated line on [/progress](https://www.yuigui.com/progress). That line and its screenshot are the raw material for every post. We never post about something that has not shipped.
- **Channels, in order:** yuigui.com and GitHub (ours, live now), then X, YouTube Shorts and a few short-video apps, then Reddit and Hacker News once, when the gates are met. Where community talk lives (GitHub Discussions or a Discord) is an open question for Chris.
- **Cadence:** one post a day at most on the brand account, one founder post a week from Chris, the Friday update every week, never skipped.
- **The honest limit today:** the public beta is bring your own Hermes (or OpenClaw). A new account has no agent in it, so no copy says Yui answers out of the box.

## Part 1 | Who it is for, in order

| # | Who | What they have | What Yui gives them | Where they are |
|---|---|---|---|---|
| 1 | Hermes users | An agent with memory and tools. Their best screen today is chat buttons | A native iPhone screen their agent draws, through a plugin and a 6-digit code ([/start](https://www.yuigui.com/start)) | Nous Research Discord, the Hermes plugin catalog, GitHub, X |
| 2 | OpenClaw users | An agent and OpenClaw's own app, which draws web views | Native screens, one app for every agent they run. The OpenClaw plugin shipped Sep 24 | GitHub, X, OpenClaw community spaces |
| 3 | Agent builders on other stacks | An agent that can send a web request | The webhook path today, more adapters on the [roadmap](https://www.yuigui.com/roadmap#adapters) | GitHub, Hacker News, X, Bluesky |
| 4 | Spec people and tinkerers | Curiosity, a favorite language | Yui Lines: a small open format to parse, render or extend | GitHub, Hacker News, Bluesky |
| 5 | Everyone else | A phone and an AI subscription | Later. A starter agent comes with the hosted phase on the roadmap | Not yet. We do not market to them until it works for them |

Group 4 matters more than its size. People who write a parser or a renderer for fun are the ones who carry a format into places we will never reach ourselves.

## Part 2 | What we say, and what we never say

**Say:**

- Meet Yui, a generative user interface.
- Your agent sends one short line. Yui draws a native screen: a timer, a choice, a form, a chart, a gallery.
- Yui plugs into the agent you already run, as a channel, like Telegram. Same agent, same memory.
- Open source (Apache-2.0): the app, the spec, the site, and the business docs, this one included.

**Numbers, always as the split.** Yui Lines use 1.6x fewer tokens than minified JSON, 2.7x fewer than pretty JSON, and 3.9x fewer than a component tree, measured on ten screens ([benchmark](https://github.com/postscarcityai/yuigui/blob/main/spec/BENCHMARK.md)). The small number goes first. Never one big multiplier.

**Never say:**

- "The first", "the most compact", "works with any agent". Today it is Hermes, OpenClaw and the webhook.
- "Download it and it answers." The public beta needs your own agent.
- "Native, unlike everyone else" as a blanket claim. Other SwiftUI renderers exist. What is true: Yui is a finished iPhone app where your agent draws native screens today.
- Hype words: revolutionary, seamless, AI-powered, next-generation, supercharge, "the future of".

The social validator (`social/validate.mjs`) hard-fails every draft that breaks these rules before Chris sees it.

## Part 3 | Content pillars

Five pillars. Every post fits one of them, or it does not go out.

1. **One line, one screen.** The line of Yui Lines next to the screen it draws. This is the hook for most posts and all short video. Source: the preset clips on [See it](https://www.yuigui.com/mockups).
2. **Before and after.** What the agent used to send (a paragraph) and what it sends now (a screen). The origin story lives here: a trainer agent sent a wall of text mid-workout, and all Chris wanted was a button.
3. **Built in public.** Dated ships, the Friday update, the honest problem of the week, the board. Source: [/progress](https://www.yuigui.com/progress), [/board](https://www.yuigui.com/board), [/changelog](https://www.yuigui.com/changelog).
4. **The open spec.** Yui Lines, the benchmark with all three numbers, the conformance suite, parsers in four languages and one wanted. Source: [/yl](https://www.yuigui.com/yl), [/playground](https://www.yuigui.com/playground).
5. **Made by people.** Community lines, parsers, renderers and adapters written by someone who is not us, credited by GitHub handle when they are happy with that. Empty today. Filling it is the point of this plan.

## Part 4 | Channel by channel

Handles are `yuiguiai` everywhere (BIZ-5 checked them). Every link in a post carries the UTM tags from [docs/UTM-LINKS.md](https://github.com/postscarcityai/yuigui/blob/main/docs/UTM-LINKS.md): `utm_source` is the platform, `utm_medium` is `social`, `bio` or `community`, `utm_campaign` is `build-log`, `weekly-update`, `testflight`, `open-source` or `launch`. Links inside the site and straight to GitHub stay untagged.

### yuigui.com (ours, live)

- **Role:** the public record and the landing spot for every post. Every page ends with the beta, the repos and the waitlist.
- **What goes there:** the ship log, the Friday update, long-form [notes](https://www.yuigui.com/notes), the business docs, See it, the playground.
- **Cadence:** every ship, every Friday, a long-form note every week or two.
- **Gate:** none. Publishing our own record is covered by the open source grant.

### GitHub (ours, live)

- **Role:** where people decide the project is real, and where they join in. Outside issues and pull requests count for more than stars.
- **What goes there:** release notes, the README hero clip, good-first-issues (a Rust parser, an editor highlighter), the community challenge (Part 7), a gallery file that takes pull requests.
- **Cadence:** with every release and every spec change.
- **Gate:** none for our repos. Reserving the `yuiguiai` name is an account step for Chris.

### X (@yuiguiai, and Chris's own account)

- **Role:** the build log with a pulse. Builders, iOS developers and Hermes users already talk about agents here.
- **What goes there:** ship posts (one line, one screen, one clip), the Friday thread, the benchmark with the split. Chris posts the origin story and founder notes himself.
- **Cadence:** up to one post a day on @yuiguiai, one a week from Chris. No hashtags.
- **Gate:** 🔴 the handle has to exist (Chris creates it), and each post is approved.

### YouTube Shorts, TikTok, Instagram Reels

- **Role:** the moment a line of text becomes a screen, in 7 to 15 seconds, captions burned in, sound off.
- **What goes there:** one clip per preset (about a dozen exist already), the three GTM videos from SOC-3 (Yui in 15 seconds, Yui Lines in 30, your Hermes on your phone in 60). Captions rewritten per app, never pasted.
- **Cadence:** two short clips a week. YouTube also gets one long video a month at most: pairing, a full tour, how it is built.
- **Gate:** 🔴 handles, and per-post approval.

### Reddit (Chris's account, not a brand)

- **Role:** one honest build write-up where Hermes users read. Communities distrust brand accounts, so the brand name stays reserved and quiet.
- **What goes there:** one post, with a clear "I built this" disclosure, only after someone checks the sub's rules from a logged-in browser (Reddit blocks our tools).
- **Cadence:** once in the first 30 days at most, and only if the beta gate is met.
- **Gate:** 🔴 Chris writes or approves it and posts it himself.

### Hacker News (Chris's account)

- **Role:** the one big public moment for the open spec and the build story.
- **What goes there:** a single Show HN, linking the repo and the playground, once a stranger can install Yui and get a screen from their own agent without our help (the MVP exit test, YUI-29).
- **Cadence:** once. Not in the first 30 days unless that gate is met early.
- **Gate:** 🔴 Chris.

### Instagram, Threads, Bluesky, LinkedIn (lower priority)

- **Instagram:** explainer carousels, one idea per slide, no hashtags. One a week once there are handles.
- **Threads and Bluesky:** the X posts rewritten, not pasted. Bluesky leans technical: spec, parsers, receipts.
- **LinkedIn:** Chris's own voice, one post a week at most, usually the long-form note of the week.
- **Gate:** 🔴 handles and per-post approval. These wait until X and short video are running.

### Discord or GitHub Discussions: open question

People who try Yui will need one place to talk, show screens and ask for help. Two options:

- **GitHub Discussions** on the yuigui repo. One switch in the repo settings. It sits next to the code, is searchable by anyone, needs no new account, and fits "built in public". Weaker for quick chat.
- **A Yui Discord server.** Better for quick chat and show-and-tell. It needs moderation, and it splits attention from the Nous Research Discord, where Hermes users already are.

**Recommendation:** GitHub Discussions first, with a "Show and tell" category for screens and a "Q and A" category. Keep taking part in the Nous Discord's plugins channel as ourselves. Open our own Discord only when Discussions has steady traffic that wants to be faster. This is Chris's call (question 2 below). Nothing gets switched on until he answers.

### Product Hunt

A product page on launch day, after Show HN. Not a running account. Not in the first 30 days.

## Part 5 | Cadence

The weekly rhythm once handles exist. Before that, only the site and GitHub rows run.

| When | What | Who |
|---|---|---|
| Every ship | A dated entry on /progress with screenshots | The card that shipped it |
| Daily, 18:30 ET | The drafter turns new progress entries into post drafts, validated | The project agent |
| Daily, when drafts exist | One 🔴 review message: the drafts, numbered | Chris says yes, no or edit |
| Up to once a day | One ship post on @yuiguiai | Scheduler, after approval |
| Twice a week | One short clip (Shorts, TikTok, Reels) | Scheduler, after approval |
| Weekly | One founder post from Chris (X, then LinkedIn) | Chris |
| Every week or two | One long-form note on /notes | The project agent, one card each |
| Friday 17:00 ET | The weekly update on /progress, then a short X thread linking it | The project agent; thread after approval |

A slow week gets said out loud in the Friday update. We never post filler to fill a slot.

## Part 6 | The first 30 days

Day 1 is Monday Sep 28 2026, day 30 is Tuesday Oct 27. Anything marked 🔴 waits for Chris. Anything marked [needs X] slides a week if X is late, and we say so in the Friday update.

### Days 1 to 7 | Sep 28 to Oct 4: the record is ready

- **Site:** this plan live at /business/gtm. Share links and preview cards on every screen (SITE-19). The community page and the first challenge under Developers (OSS-5).
- **GitHub:** repo description, topics and social preview set. Two good-first-issues open: a Rust parser, an editor highlighter.
- **Video:** SOC-3 cuts the 15, 30 and 60 second videos from the clip pipeline, published on See it.
- 🔴 **Chris:** create @yuiguiai on X and YouTube first (BIZ-5 has bios and art ready). Say which community space we use (Discussions or Discord).
- **Friday Oct 2:** weekly update. If the handle exists, the first pinned X post links /progress.

### Days 8 to 14 | Oct 5 to Oct 11: the drafter goes live

- The drafter runs daily against real ships. Chris approves the first batch. [needs handles]
- **X:** 3 to 5 ship posts, pillar 1 and 3. **Shorts:** the 15 second video and one preset clip.
- 🔴 **Chris, X and LinkedIn:** the origin story (pillar 2), the chat paragraph next to the Yui timer.
- **Site:** long-form note "My agent sent me a paragraph".
- **Friday Oct 9:** weekly update, first Friday thread.

### Days 15 to 21 | Oct 12 to Oct 18: the open spec

- **Site:** long-form note "Yui Lines: one line, one screen", with all three benchmark numbers.
- **X and Bluesky:** the benchmark thread, the split, the method linked, an open call for a Rust parser. [needs handles]
- **GitHub:** the challenge gets its first outside entry, or we write down why it did not. Every entry is credited by handle.
- **Shorts:** the 30 second Yui Lines video, one more preset clip.
- **Review:** how many drafts did Chris change? If almost none, suggest lifting the per-post gate for @yuiguiai ship posts only (his call).

### Days 22 to 30 | Oct 19 to Oct 27: first outside users

- **The beta gate:** the plugin installs on a machine that is not ours, and the public TestFlight link works (Apple has the build in review). If both hold:
  - 🔴 Chris posts in the Nous Discord plugins channel and opens the Hermes plugin catalog pull request (drafts in BIZ-2).
  - The 60 second "your Hermes on your phone" video gets pinned.
- **If the gate is not met:** say so in the weekly update, keep shipping posts, and post in nobody's community early.
- **Show-and-tell:** the best community line of the month on the site and in a post, with credit.
- **Day 30:** a retro in the weekly update. What was seen, what was ignored, what changes for days 31 to 60.

Not in the first 30 days: Show HN, Product Hunt, paid anything, a brand Reddit account, investor material.

## Part 7 | What grassroots means for us

A movement is people making things with Yui because they want to. We cannot buy that. We can make it easy and make it visible.

1. **An open spec anyone can own a piece of.** Yui Lines is a public spec with a conformance suite. There are parsers in JavaScript, Python, Kotlin and Swift that all pass the same cases. A Rust parser is wanted (OSS-4). Anyone who writes one that passes the suite gets listed and credited.
2. **Real ways to contribute, at every size.** Five minutes: write a screen in the playground and share the link. An hour: a challenge entry. A weekend: a parser, a renderer, an editor highlighter. Longer: an adapter for another agent framework ([Adapters](https://www.yuigui.com/roadmap#adapters)). The community page under Developers lists them all (OSS-5).
3. **Show-and-tell as a habit.** The best screens people make get shown on the site and in posts, credited, with the line that drew them. "Made with Yui Lines" badges for READMEs (SITE-19).
4. **The Yui Lines challenge.** The first one: draw your best screen in three lines. Entries come in as pull requests to a gallery file. The parser checks them, the site draws them live, and each one opens in the playground. A new challenge every month or so, announced in the Friday update.
5. **Built in public, all of it.** The board, the ship log, the roadmap and this plan are public. People join what they can see.

What grassroots does not mean: fake scarcity, invite leaderboards, engagement bait, astroturfing, or posting in communities before we have something that works for their members (BIZ-3 principle 3).

## Part 8 | Gates and where they stand

| Gate | Unlocks | Owner | Status, Sep 24 |
|---|---|---|---|
| @yuiguiai handles exist | All brand posts, the scheduler | 🔴 Chris creates them | Not started. Bios, art and handle checks ready in BIZ-5 |
| Community space picked | Show-and-tell outside GitHub pull requests | 🔴 Chris | Open question 2 |
| Per-post approval | Every social post | 🔴 Chris | In place. Review after two weeks |
| Public TestFlight link | Beta posts, pairing video, community posts | Apple review | Build in Beta App Review |
| Plugin installs on a stranger's machine | Discord, plugin catalog, Reddit | Us | Install guide live at /start; outside test is YUI-29 |
| Stranger gets a screen alone (MVP exit test) | Show HN, Product Hunt | Us | YUI-29, the last MVP card |
| Recording pipeline | Short video | Us | Live, about a dozen preset clips on See it |
| Drafter and validator | Daily drafts | Us | Built, runs 18:30 daily, drafts only |

## Part 9 | How we know it is working

Few numbers, shared in the Friday update where they are safe to share:

- Waitlist signups and beta installs a week, and which post or page sent them (UTM tags).
- Outside issues, pull requests and challenge entries. The number we care about most.
- Parsers, renderers and adapters written by someone else.
- Short clip completion: do people watch 10 seconds to the end?
- Drafts approved as written, edited, or rejected. That is the drafting agent's report card.

Not goals: follower counts, time in app, anything that needs reading people's messages.

## Open questions for Chris

1. 🔴 **Handles.** Create @yuiguiai on X and YouTube in the first week? Instagram, TikTok, Threads, Bluesky and LinkedIn can follow later. BIZ-5 has the bios and art ready.
2. 🔴 **Where community talk lives.** GitHub Discussions first (my pick), or a Yui Discord now?
3. 🔴 **Founder posts.** Will you post the origin story on your own X and LinkedIn in week 2? It lands better from you than from a brand account.
4. 🔴 **The approval gate.** Keep per-post approval for @yuiguiai, or lift it for ship posts after two clean weeks?
5. 🔴 **Community posts.** When the beta gate is met, OK to put the Nous Discord post and the plugin catalog pull request in front of you as drafts?
