# Yui | private beta list: 20 to 50 Hermes and OpenClaw users

Draft 1, Sep 24 2026. Card BIZ-6. Public, like the rest of the project. Google Doc: https://docs.google.com/document/d/1p5J80hOqhBSQLDT5AiiwwXSYW8vkphIp1LBgMmtW8ks/edit

Companion docs: [BIZ-2 outreach plan](https://www.yuigui.com/business/biz-2-outreach-plan) (message drafts, waves, cadence), [BIZ-1 marketing and positioning](https://www.yuigui.com/business/biz-1-marketing-positioning) (launch stages, what we never claim), [BIZ-5 social accounts](https://www.yuigui.com/business/biz-5-social-accounts) (who posts).

**This is a plan. Nobody has been contacted, nothing has been posted, no community has been joined.** Every invite below is a draft marked DRAFT. Each one goes out only after Chris approves it, one by one. BIZ-2 decides the order of all outreach; this doc narrows it to one job: find the first 20 to 50 outside testers and get them through the MVP path.

## The short version

- **Goal:** 20 to 50 people outside PostScarcity who run their own agent, install Yui from the public TestFlight link, pair it and tell us what broke. The first one of them is the YUI-29 acceptance run, the MVP exit gate.
- **Who:** Hermes users first, because the Hermes plugin is the only one that ships today. OpenClaw users second: they can try it now through `hermes claw migrate` (Hermes' own OpenClaw import), and natively once the OpenClaw adapter (INT-1) exists.
- **Where:** 32 public venues below. Two Discords hold most of the audience: Nous Research (140K members) and OpenClaw (177K). Both have a channel made for exactly this kind of post.
- **How many at a time:** 5, then 20, then 50. Each step waits for the one before it to go well. We would rather have 20 testers we answer within a day than 200 we ignore.
- **The link:** [testflight.apple.com/join/ykrYHwet](https://testflight.apple.com/join/ykrYHwet). Apple approved the public beta on Sep 24 (YUI-22), so the link is open. Invites still go out only after Chris says yes to each one.

## Part 1 | Who we want

### Tester criteria (what YUI-29 needs)

YUI-29 is the MVP exit gate: someone outside PostScarcity does the whole path unaided while we time every step. Its tester must have all of these:

| Must have | Why |
|---|---|
| An iPhone on iOS 26 or later | The app's minimum. No iPad, no Android yet |
| A fresh Apple ID for Yui, or one that has never signed in to Yui | The run starts at sign-in and ends at account deletion |
| Their own Hermes install, already working on some platform (Telegram, Discord, CLI) | The public beta is bring-your-own-agent. A new account has zero agents, and we never claim Yui answers out of the box |
| A host that can run `hermes plugins install` and a gateway restart (Mac, Linux box, VPS) | That is the install path on yuigui.com/start |
| Willing to be timed and to say what confused them, in writing | The proof is a timed checklist and every snag filed as a card |
| Not a friend, client or employee of PostScarcity | "Unaided" means we have not walked them through it before |

Chris picks the YUI-29 tester. Recruiting them is outbound, so it stays Chris-gated like every other message here.

### Tester criteria for the wider 20 to 50

Everyone in the beta needs the first four rows above. On top of that we pick for spread, not for fans:

- **Hosts:** a mix of Mac, Linux desktop, VPS and container installs. Containers matter because `gateway restart` behaves differently there.
- **Models:** at least a few on local models (Ollama, llama.cpp, LM Studio). Small models writing Yui Lines is a claim we want tested by strangers.
- **Use:** people who already use their agent daily for one real thing (training, cooking, budgeting, study, home). A daily habit shows us which screens earn their place.
- **OpenClaw:** a handful who came from OpenClaw via `hermes claw migrate`, so we learn what they miss before we build INT-1.
- **Builders:** a few who write their own Hermes plugins or skills. They find plugin bugs fastest and some may write presets.

What we do not screen for: follower counts, company size, or how much they like the idea.

### How many, in what order

| Cohort | Size | Where they come from | Gate to open it | Gate to close it |
|---|---|---|---|---|
| 0. Acceptance | 1 | Chris picks | Public TestFlight link accepts testers | YUI-29 checklist passes |
| 1. First five | 5 | Nous Discord `#plugins-skills-and-skins`, the Hermes plugin catalog | YUI-29 passed | 3 of 5 reach a first rendered screen unaided |
| 2. Twenty | 20 | Hermes lists, GitHub peers, r/hermesagent if it checks out | Snags from cohort 1 fixed and shipped | Median install under 10 minutes |
| 3. Fifty | 50 | OpenClaw venues, broader Reddit, X | Cohort 2 stable for a week, reply time holding under a day | Hand-off to BIZ-1 Stage 2 |

## Part 2 | Where they are: 32 public venues

Checked Sep 24 2026. Discord sizes come from Discord's public invite API (members, and people online at the time). GitHub numbers come from the GitHub API. Reddit blocks every tool on this machine, so subreddit sizes come from a third-party index (reddapi.dev) and the rules from third-party summaries. Every Reddit row is marked "check" and needs a look from a logged-in browser before anything is posted.

"Angle" is what we would lead with in that venue. "Wave" is the cohort in Part 1 that uses it.

### Hermes (cohorts 1 and 2)

| # | Venue | Link | Size and activity | Self-promotion rules | Angle | Wave |
|---|---|---|---|---|---|---|
| 1 | Nous Research Discord, `#plugins-skills-and-skins` | [discord.gg/NousResearch](https://discord.gg/NousResearch) | 140,180 members, 17,114 online | Hermes' own CONTRIBUTING.md names this channel for promoting third-party plugins | A platform plugin: your agent answers with native screens. Same agent, same memory as Telegram | 1 |
| 2 | Nous Research Discord, `#community-projects-showcase` | same | same | Showcase of finished work, one post, a later week than #1 | A real use: a workout timer the agent drew, with video | 2 |
| 3 | Nous Research Discord, `#hermes-agent` | same | same | Help and discussion, not promotion. Answer questions, do not post the link unasked | Only when someone asks about a phone UI or rich replies | 2 |
| 4 | Hermes plugin catalog | [plugin-catalog/](https://github.com/NousResearch/hermes-agent/tree/main/plugin-catalog) | 294 entries (BIZ-2 count); "platform" is a category | Pull request with one yaml file; author must own the plugin; tagged release, pinned commit, validation check | The listing itself. People browsing the catalog are the right people | 1 |
| 5 | Hermes repo issues, label `comp/plugins` | [NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent/labels/comp%2Fplugins) | 248,651 stars, very active; Discussions are off | Third-party plugins must not be PR'd into core; those get closed. Issues are for bugs in Hermes | Only file real plugin-API bugs we hit. Never an ad | 1 to 3 |
| 6 | Hermes user stories page | [docs: user stories](https://hermes-agent.nousresearch.com/docs/user-stories) | 326 stories collected from Reddit, X and Discord | No form; good stories get picked up | Earned, not asked for: a tester's own story | 3 |
| 7 | @NousResearch on X | [x.com/NousResearch](https://x.com/NousResearch) | Project account, posts Hermes launches | Tag once, only after the catalog listing exists | Reply-level only | 2 |
| 8 | awesome-hermes-agent | [0xNyk/awesome-hermes-agent](https://github.com/0xNyk/awesome-hermes-agent) | 5,739 stars, 93 open issues, updated Sep 22 | Additions by issue, needs a "why now" line | "Surfaces" section: an iPhone surface the agent draws on | 2 |
| 9 | Hermes Atlas | [ksimback/hermes-ecosystem](https://github.com/ksimback/hermes-ecosystem) | 1,291 stars, updated Sep 24 | Issue or PR | Ecosystem directory listing | 2 |
| 10 | awesome-hermes-usecases | [aliaihub/awesome-hermes-usecases](https://github.com/aliaihub/awesome-hermes-usecases) | 239 stars, Discussions on | Issue or Discussion | The use case, not the app: "interval timer from one line" | 2 |
| 11 | Hermex (Discussions) | [hermex](https://github.com/uzairansaruzi/hermex) | 1,377 stars, Discussions on, active today | Their space: ask before pitching | Peer, not target. Offer the open spec so Hermex can render Yui Lines | 2 |
| 12 | Scarf (Discussions) | [scarf](https://github.com/awizemann/scarf) | 862 stars, Discussions on, native macOS and iOS app for Hermes | Their space: ask before pitching | Same open-spec offer as Hermex | 2 |
| 13 | hermes-webui (Discussions) | [hermes-webui](https://github.com/nesquena/hermes-webui) | 18,565 stars, 870 open issues | Their space: ask before pitching | The web could render Yui Lines too; ask if they want it | 2 |
| 14 | hermes-desktop (Discussions) | [hermes-desktop](https://github.com/fathah/hermes-desktop) | 14,293 stars, 402 open issues | Their space: ask before pitching | Same as #13 | 2 |
| 15 | Conduit (Discussions) | [conduit](https://github.com/cogwheel0/conduit) | 2,175 stars, native iOS and Android client | Their space: ask before pitching | Mobile peer; spec offer | 3 |
| 16 | hermes-agent-template (Discussions) | [hermes-agent-template](https://github.com/praveen-ks-2001/hermes-agent-template) | 313 stars, one-click Railway deploy | Their space | Railway-hosted Hermes users are exactly the "host that is not a Mac" testers we want | 2 |
| 17 | Other Hermes platform-plugin authors (Rocket.Chat, Zalo, Inkbox, OpenMail, AgentChat plugins) | GitHub search "Hermes platform plugin" | 14 to 42 stars each | Their repos: only through issues or Discussions they already use | Builders who know the platform-plugin API. Swap notes on the plugin contract | 2 |
| 18 | r/hermesagent | reddit.com/r/hermesagent | Check. Cited as a source on the Hermes user stories page; no size found | Check the sidebar first | "I made my Hermes agent draw screens on my phone" (BIZ-2 draft 3.4) | 2 |

### OpenClaw (cohort 3, earlier for anyone who runs Hermes too)

Today an OpenClaw user can try Yui one way: import their setup into Hermes with `hermes claw migrate` and pair that. We say so plainly. We do not imply Yui plugs into OpenClaw itself until INT-1 ships.

| # | Venue | Link | Size and activity | Self-promotion rules | Angle | Wave |
|---|---|---|---|---|---|---|
| 19 | OpenClaw Discord, `#self-promotion` | [discord.gg/clawd](https://discord.gg/clawd) | 176,668 members, 21,954 online | The OpenClaw docs name `#self-promotion` as the place to share projects. Their Feb 2026 rule: `#showcase` is for what you and your agent actually do, not for "shilling your skill, dropping socials, or soft-pitching". First offense a mute, second loses both channels | Once INT-1 ships: a Yui channel plugin for OpenClaw. Before that: one post only if it is honest about the Hermes route | 3 |
| 20 | OpenClaw Discord, `#showcase` | same | same | Real use only, no pitch (see #19) | A tester's own screen, posted by them if they want | 3 |
| 21 | OpenClaw Discord, `#help` and `#users-helping-users` | same | same | Support channels, not promotion | Never post there about Yui. Listed so nobody does | none |
| 22 | OpenClaw showcase (site and docs) | [openclaw.ai/showcase](https://openclaw.ai/showcase/) | Curated list; has a mobile apps category | "Post in #self-promotion or tweet @openclaw", standout projects get added | Earned after INT-1 | 3 |
| 23 | ClawHub | [clawhub.ai](https://clawhub.ai) ([repo](https://github.com/openclaw/clawhub), 9,451 stars) | OpenClaw's official skill and plugin registry | Publish with the `clawhub` CLI; code plugins need compat metadata; mods curate | List the INT-1 channel plugin here, the way #4 lists the Hermes one | 3 |
| 24 | OpenClaw repo issues | [openclaw/openclaw](https://github.com/openclaw/openclaw) | 390,378 stars, 8,521 open issues; Discussions off | CONTRIBUTING.md: most new features belong in third-party plugins; setup questions go to Discord, not issues | Only real channel-SDK bugs we hit building INT-1 | 3 |
| 25 | @openclaw on X | [x.com/openclaw](https://x.com/openclaw) | Project account | Named as a submission route for the showcase | One tagged demo post after INT-1 | 3 |
| 26 | r/openclaw | reddit.com/r/openclaw | About 133K members (third-party index) | Check the sidebar first | Setup-heavy crowd. Lead with "two commands and a code" | 3 |
| 27 | awesome-openclaw-skills | [VoltAgent/awesome-openclaw-skills](https://github.com/VoltAgent/awesome-openclaw-skills) | 52,771 stars, updated Sep 22 | Skills list; follow its format | Only if we ship a Yui skill for OpenClaw | 3 |
| 28 | awesome-openclaw-usecases | [hesamsheikh/awesome-openclaw-usecases](https://github.com/hesamsheikh/awesome-openclaw-usecases) | 31,677 stars, last push March 2026 | PR; may be unmaintained | Low priority. Try only if a merge happened recently | 3 |
| 29 | Kai (Discussions) | [Kai](https://github.com/SimonSchubert/Kai) | 1,260 stars, "OpenClaw alternative in your pocket", Discussions on | Their space: ask before pitching | Mobile peer; spec offer | 3 |

### Wider, both audiences (cohort 3)

| # | Venue | Link | Size and activity | Self-promotion rules | Angle | Wave |
|---|---|---|---|---|---|---|
| 30 | r/LocalLLaMA | reddit.com/r/LocalLLaMA | About 817K members (third-party index) | Third-party summaries: self-promotion at most 1 in 10 of your activity, affiliation disclosed, open source welcome. Check | A build write-up: small local models driving native UI with one line, with the benchmark. The app is mentioned once at the end | 3 |
| 31 | r/selfhosted | reddit.com/r/selfhosted | About 832K members (third-party index) | Check; rules on new projects change often | "Your agent, your host, a phone screen it can draw on" | 3 |
| 32 | r/AI_Agents | reddit.com/r/AI_Agents | About 432K members (third-party index) | Check | The generative-UI idea, Hermes as the working example | 3 |

Considered and left off: r/ClaudeAI (1.1M, but not our audience yet), r/iOSBeta (Apple betas, not third-party apps), r/TestFlight (about 28K, a link board with no context, attracts people with no agent), r/SideProject (founders, not agent users), the Chinese-language Hermes and OpenClaw guides (worth it once the app has a Chinese locale, not before), and every venue BIZ-2 already skipped.

## Part 3 | The invite (DRAFT, Chris-gated)

**DRAFT. Not sent. Chris approves each use, venue by venue, and edits the words.** These are the beta-specific versions. BIZ-2 Part 3 holds the general announcement drafts; do not post both in the same place.

Every draft carries the same links: the public TestFlight link [testflight.apple.com/join/ykrYHwet](https://testflight.apple.com/join/ykrYHwet), the guide [yuigui.com/start](https://www.yuigui.com/start), and the app repo [postscarcityai/yui](https://github.com/postscarcityai/yui).

### 3.1 DRAFT | Beta call, Nous Discord `#plugins-skills-and-skins`

> Looking for 5 Hermes users to break a beta.
>
> Yui is an iPhone app and a Hermes platform plugin. Your agent answers with native screens instead of text: a timer, two buttons you can change your mind on, a chart. It plugs in like Telegram, so it is the same agent and memory.
>
> What you need: an iPhone on iOS 26, a Hermes that already works, and 15 minutes. Install is two commands and a 6-digit code: yuigui.com/start
>
> What I ask back: tell me where you got stuck and how long it took. A reply here or a GitHub issue is plenty.
>
> TestFlight: testflight.apple.com/join/ykrYHwet
> Everything is Apache-2.0: github.com/postscarcityai/yui
>
> Hermes only for now, iPhone only for now. Disclosure: I built it.

### 3.2 DRAFT | Reply to someone asking about a phone UI or richer replies (any Hermes venue)

> I have been building exactly that: a Hermes platform plugin plus an iPhone app where the agent draws native screens. It is in a small free beta. If you want to try it: yuigui.com/start. Happy to hear what is missing.

Used only as a reply to a question someone asked in public. Never as a cold message.

### 3.3 DRAFT | OpenClaw, before INT-1 (only if Chris wants OpenClaw testers early)

> For OpenClaw users who also run Hermes, or want to try it: Yui is an iPhone app where your agent answers with native screens. Today it connects through Hermes, and `hermes claw migrate` brings your OpenClaw setup across. A native OpenClaw channel plugin is on the roadmap, not built yet. Free beta, Apache-2.0: yuigui.com/start

Venue: OpenClaw Discord `#self-promotion` only. Never `#showcase`, never the help channels.

### 3.4 DRAFT | Welcome note, after someone joins

Posted as a reply in the thread they came from, or as a pinned GitHub issue that testers comment on. No email list, no DMs unless they open one.

> Thanks for trying Yui. Three things help most:
>
> 1. How long from opening TestFlight to your agent's first screen, roughly.
> 2. The first place you got stuck, even if you figured it out.
> 3. One screen you wish your agent could draw.
>
> Bugs go to github.com/postscarcityai/yui/issues, or TestFlight's own feedback (take a screenshot in the app and tap Share Beta Feedback). We answer within a day. When you are done, you can delete your account from inside the app.

### 3.5 DRAFT | YUI-29 ask (Chris picks the person)

> Would you do a 30-minute test of a beta for me? You would install Yui from TestFlight, connect your own Hermes and use it a bit, and I would time each step. Then you delete the account. I am not allowed to help you during it, that is the point. You get a say in what gets fixed first.

## Part 4 | How testers get in, and how we keep track

- **Door:** the public TestFlight link. Anyone who already runs Hermes can use it. Everyone else asks through Request an invite on yuigui.com (SITE-26, Sep 24), and Chris approves each one.
- **Where they come from:** each post uses the UTM scheme in `docs/UTM-LINKS.md` on the yuigui.com/start link, so we can count which venue sent people without tracking anyone. We also ask once, in the welcome note, where they heard about it.
- **Count:** TestFlight's external group shows installs and sessions. The backend shows paired connectors. We publish only totals in the Friday update: installs, first rendered screens, issues opened, issues fixed. No names, handles or emails anywhere public.
- **Cap:** stop inviting when the active cohort hits its size in Part 1, even if a post is still getting replies. Say so in the thread.
- **Every snag is a card.** Same rule as YUI-29: anything a tester trips on gets filed, and the fix goes in the progress log with a thanks (no names unless the tester asks for one).

## Part 5 | Rules for every post

These come from BIZ-2 and apply here unchanged.

- Chris approves every message before it goes out. This doc approves nothing.
- One new public post a week while recruiting a cohort, tighter than BIZ-2's two. Replies are not capped.
- Reply within a day to everything in a thread we started.
- Never the same text in two venues. Never cross-post the same week.
- Say what does not work: iPhone only, Hermes only, the beta is small.
- Never say "the first", "any agent" or "works out of the box". A new account has no agents until you pair your own.
- Stop rule: if a community says a post is unwelcome, delete it, apologise once, and do not post there again without an invitation.

## Part 6 | Open items before cohort 1

| Item | Owner | Status Sep 24 |
|---|---|---|
| Public TestFlight link accepting testers (Beta App Review) | YUI-22 | Done Sep 24. The link is open |
| `testflight` set in site links.json so every beta button turns on | YUI-22 | Not set |
| YUI-29 tester picked | Chris | Not started |
| YUI-29 acceptance run passes | YUI-29 | Not started |
| Hermes plugin catalog PR (venue #4) | YUI-7 and BIZ-2 step 1 | Not started |
| 20-second demo video for the posts | SITE-3 | Not started |
| Reddit rows checked from a logged-in browser: r/hermesagent exists, sizes, current self-promotion rules | Chris or a browser session | Blocked on this machine |
| OpenClaw channel plugin | INT-1 | Parked until after the MVP |
