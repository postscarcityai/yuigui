# Yui | outreach plan, Hermes users first

Draft 1, Sep 24 2026. Card BIZ-2. Public, like the rest of the project. Google Doc: https://docs.google.com/document/d/1Xrexbd49OUzgn7mxDG5upprUZX7Wnz1AJGWV59n3In4/edit

Companion docs: [BIZ-1 marketing and positioning](https://www.yuigui.com/business/biz-1-marketing-positioning) (who, what we say, launch stages), [BIZ-3 revenue models and mission principles](https://www.yuigui.com/business/biz-3-revenue-models) (what stays free, no dark patterns).

**Nothing in this doc has been sent or posted.** Every message below is a draft. Each one goes out only after Chris approves it, one by one. The open source grant covers publishing code, docs and progress. It does not cover messages to other people or posts in other people's communities.

## The short version

- **Who first:** people who already run Hermes Agent. They have an agent, memory and tools, and today their best screen is Telegram buttons.
- **Where they are:** the Nous Research Discord (about 140K members, a `#plugins-skills-and-skins` channel that Hermes' own contributing guide names for promoting plugins), the official Hermes plugin catalog (294 entries, submitted by pull request), GitHub, X, and a few Reddit subs we could not verify from here.
- **The offer:** a free beta, fully open source (Apache-2.0), a Hermes platform plugin that installs in two commands and pairs with a 6-digit code. Nothing to pay, nothing to host.
- **The gate:** we reach out to nobody until the plugin (YUI-7) installs cleanly on a machine that is not Chris's and the public TestFlight link (YUI-22) works. Our first impression is the only one we get in a community this size.
- **The order:** catalog listing and one Discord post first, then 10 to 20 hand-picked Hermes builders, then awesome lists and directories, then OpenClaw and the other frameworks once the non-Hermes adapter ships, then Show HN.
- **The cadence:** at most two new public posts a week, replies within a day, one Friday update that links everything. We never post the same text in two places.

## Part 1 | The offer

What a Hermes user gets, in the words we will use:

- **Free beta.** TestFlight, no account fee, no credit card.
- **Open source.** App, plugin, spec and the business docs are all public ([postscarcityai/yui](https://github.com/postscarcityai/yui), [postscarcityai/yuigui](https://github.com/postscarcityai/yuigui)).
- **Two commands and a code.** Install the `yui` plugin, run the pair command, type the 6-digit code into the app. Target: first rendered screen from your own agent in under 10 minutes. We say "about two minutes" only after we have timed it on a clean machine three times.
- **Your agent stays yours.** Yui is a platform, like Telegram. Same agent, same memory, same model. Keep Telegram running alongside.
- **What we ask back:** try one screen, tell us what broke. A GitHub issue or a reply in the thread is enough.

What we never say in outreach (from BIZ-1 and the competitor check):

- Not "the first", not "most compact", not "any agent". Today it is Hermes only.
- Not "a phone app for Hermes". Hermex already is one, and a good one. Our line is that the agent draws the screen.
- Not "native, unlike everyone else" as a blanket claim. A2UI now has an official SwiftUI renderer in its repo and community Swift renderers exist. What is true: Yui is a finished iPhone app where Hermes agents draw native screens today. We say that.
- The token numbers only as the split: 1.6x against lean JSON, 3.9x against a component tree.

## Part 2 | Where Hermes users gather

Checked Sep 24 2026 with the GitHub API, the Discord invite API and page fetches. Reddit returns 403 to every tool on this machine, so every Reddit row is marked unverified and needs a check from a logged-in browser before we post.

| Venue | Link | Verified | Why it matters |
|---|---|---|---|
| Hermes plugin catalog | [plugin-catalog/](https://github.com/NousResearch/hermes-agent/tree/main/plugin-catalog) | Yes, 294 entries | The official way users find plugins. "platform" is a category. PR adds one yaml file; plugin repo needs tagged releases; entry pins a commit; a validation check runs. |
| Catalog rules | [docs: plugin catalog](https://hermes-agent.nousresearch.com/docs/user-guide/features/plugin-catalog) | Yes | Author must own the plugin. |
| Nous Research Discord | [discord.gg/NousResearch](https://discord.gg/NousResearch) | Yes, ~140K members | Hermes CONTRIBUTING.md: promote third-party plugins in `#plugins-skills-and-skins`. Also `#community-projects-showcase` and `#hermes-agent`. |
| Hermes repo | [NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent) | Yes, 248K stars | Discussions are off. Issues labelled [comp/plugins](https://github.com/NousResearch/hermes-agent/labels/comp%2Fplugins) are active. Third-party plugins must not be PR'd into core `plugins/`; those PRs get closed. |
| Hermes user stories | [docs: user stories](https://hermes-agent.nousresearch.com/docs/user-stories) | Yes | 326 stories pulled from Reddit, X and Discord. No submission form; a good story gets picked up. |
| @NousResearch on X | [x.com/NousResearch](https://x.com/NousResearch) | Yes | Posts Hermes launches. No Hermes-only account exists. |
| @Teknium on X | [x.com/Teknium](https://x.com/Teknium) | Yes | Nous cofounder, Hermes lead, top committer. |
| r/hermesagent | reddit.com/r/hermesagent | No | Cited as a source on the user stories page. |
| r/LocalLLaMA | reddit.com/r/LocalLLaMA | No | Third-party guides say roughly 1 post in 10 may be self-promotion, with affiliation disclosed. Confirm the rules on the sub first. |
| r/selfhosted, r/AI_Agents | reddit.com | No | Size and rules unchecked. |

## Part 3 | Message drafts

Plain, short, first person from Chris. Each one leads with the thing you can see, admits what does not work yet, and ends with a small ask. Every draft carries the same three links: the repo, the 20-second video (not made yet, owner SITE-3) and the TestFlight link. `[VIDEO]` and `[TESTFLIGHT]` are placeholders until those exist.

### 3.1 Hermes plugin catalog (pull request)

Title: `catalog: add yui (platform)`

> Adds `yui`, a platform plugin that connects a Hermes profile to the Yui iPhone app. Same agent and memory as your other platforms. The agent can answer with native screens (buttons, timers, forms, charts, galleries) by writing one line of Yui Lines, an open spec. Apache-2.0, I maintain it. Tagged release [TAG], pinned commit [SHA]. Validation passes locally.

Gate: the plugin repo has a tagged release and passes the catalog check. This is the one outreach step that is a code contribution, but it is still a post in someone else's repo, so Chris approves it.

### 3.2 Nous Discord, `#plugins-skills-and-skins`

> Built a platform plugin for Hermes: Yui, an iPhone app where your agent answers with real screens instead of text. Ask for intervals and you get a timer. Ask it to choose and you get two buttons you can change your mind on.
>
> It plugs in like Telegram does, so it is the same agent and memory. Two commands and a 6-digit pairing code. Free beta on TestFlight, everything Apache-2.0.
>
> Repo: https://github.com/postscarcityai/yui
> 20-second demo: [VIDEO]
> TestFlight: [TESTFLIGHT]
>
> It started because my trainer agent kept sending me paragraphs mid-workout. Tell me what breaks, that is the most useful thing right now.

One post. We answer every reply in the thread. We do not also post it in `#community-projects-showcase` the same week.

### 3.3 X, from Chris's account (and later @yuiguiai)

Post 1, the demo:

> My Hermes agent used to send me a paragraph when I asked for 40/20 intervals. Now it sends one line and my phone shows a timer.
>
> Yui: an open source iPhone app where Hermes agents draw native screens. Free beta. [VIDEO]

Reply under it: repo link, TestFlight link, "Hermes only for now, others later."

We tag @NousResearch only if the plugin is in the catalog by then. No tag storms, no "RT to get access".

### 3.4 Reddit (r/hermesagent first, r/LocalLLaMA only as a build write-up)

Title for r/hermesagent: `I made my Hermes agent draw screens on my phone (open source platform plugin)`

> I run a few Hermes agents. The trainer one kept answering workout questions with paragraphs, so I built a platform plugin and an iPhone app where the agent can answer with a native screen instead. One line of text becomes a timer, two buttons, a chart, a gallery.
>
> How it works: the plugin is a normal Hermes platform like Telegram. The agent writes a short line in an open spec (Yui Lines) and the app renders it natively. No HTML, nothing to host. Token cost is about a third less than lean JSON, more against a full component tree. Numbers and method are in the repo.
>
> What does not work yet: iPhone only, Hermes only, voice is basic. Free on TestFlight, Apache-2.0. Disclosure: I made it.
>
> [VIDEO] | [REPO] | [TESTFLIGHT]

For r/LocalLLaMA the post is a write-up about making small local models drive UI with one line of text, with the benchmark, and the app mentioned once at the end. Only if the sub's current rules allow it.

### 3.5 One-to-one, Hermes builders (GitHub issue or discussion, or a public X reply)

Only through public channels the person already uses for their project: their repo's Discussions or issues, or a reply on X. No personal email, no cold DMs to people who have not opened DMs.

Template for a builder whose project touches ours (edit per person, never send the template as-is):

> Hi [name], I like what you did with [their project, one specific thing]. I am building Yui, an open source iPhone app where Hermes agents draw native screens through a platform plugin. [One sentence on why it relates to their work.] If you ever want to try it, the beta is free: [TESTFLIGHT]. No ask beyond that, and happy to hear if something in the plugin design looks wrong to you.

Special case, Hermex ([@uzairansar](https://github.com/uzairansaruzi/hermex)): treat as a peer, not a target. The honest offer is the open spec: Yui Lines is Apache-2.0 and has a conformance suite, so Hermex could render it too. Chris decides whether to open with that.

### 3.6 Awesome lists

Issue or PR, following each list's own format. Example for [awesome-hermes-agent](https://github.com/0xNyk/awesome-hermes-agent) (issues only, needs a "why now" line):

> **Yui** ([repo](https://github.com/postscarcityai/yui)): open source iPhone app and Hermes platform plugin; the agent answers with native screens (timers, choices, charts, galleries). Apache-2.0. Why now: Hermes has no screen an agent can draw on, and the plugin catalog opened platform plugins to third parties.

## Part 4 | Target list

Public channels only. "How to reach" names the channel the person or project already uses. Star counts from the GitHub API on Sep 24 2026. Nobody on this list has been contacted.

### Wave 1 | Hermes (after the gate)

| # | Target | Link | How to reach | Why |
|---|---|---|---|---|
| 1 | Hermes plugin catalog | [plugin-catalog/](https://github.com/NousResearch/hermes-agent/tree/main/plugin-catalog) | Pull request | Official discovery path |
| 2 | Nous Discord `#plugins-skills-and-skins` | [discord.gg/NousResearch](https://discord.gg/NousResearch) | Channel post | Named for this in CONTRIBUTING.md |
| 3 | Nous Discord `#community-projects-showcase` | same | Channel post, a later week | Has a "Native UI for Hermes Agent / Mobile Access" thread |
| 4 | r/hermesagent | reddit.com/r/hermesagent | Post (unverified sub) | Hermes-only audience |
| 5 | awesome-hermes-agent (5.7K stars) | [0xNyk/awesome-hermes-agent](https://github.com/0xNyk/awesome-hermes-agent) | Issue | Main Hermes list; Hermex and Conduit not listed yet |
| 6 | Hermes Atlas (1.3K) | [ksimback/hermes-ecosystem](https://github.com/ksimback/hermes-ecosystem), hermesatlas.com | Issue or PR | Ecosystem directory |
| 7 | awesome-hermes-usecases (239) | [aliaihub/awesome-hermes-usecases](https://github.com/aliaihub/awesome-hermes-usecases) | Issue | The workout story is a use case |
| 8 | awesome-hermes-skills (565) | [ZeroPointRepo/awesome-hermes-skills](https://github.com/ZeroPointRepo/awesome-hermes-skills) | Issue, only if we ship a Yui skill | Skill list, not a plugin list |
| 9 | Hermex (1.4K) | [uzairansaruzi/hermex](https://github.com/uzairansaruzi/hermex) | Discussions | Closest peer; open spec offer |
| 10 | hermes-webui (18.5K) | [nesquena/hermes-webui](https://github.com/nesquena/hermes-webui) | Discussions | Biggest Hermes surface; could render Yui Lines on the web |
| 11 | hermes-desktop (14.3K) | [fathah/hermes-desktop](https://github.com/fathah/hermes-desktop) | Discussions | Desktop surface, same question |
| 12 | Conduit (2.2K) | [cogwheel0/conduit](https://github.com/cogwheel0/conduit) | Discussions | Mobile client for Hermes and Open WebUI |
| 13 | Hermes Conduit (142) | [kaishi00/hermes-conduit](https://github.com/kaishi00/hermes-conduit) | Issues | iOS Hermes client |
| 14 | Hermes-iOS (84) | [dylan-buck/Hermes-iOS](https://github.com/dylan-buck/Hermes-iOS) | Issues | Gives Hermes camera, mic, health data; overlaps with our roadmap |
| 15 | hermes-ios-channel | [Milztopia/hermes-ios-channel](https://github.com/Milztopia/hermes-ios-channel) | Issues | Also a native iOS channel for Hermes; compare notes |
| 16 | hermes-browser-extension (1.6K) | [abundantbeing/hermes-browser-extension](https://github.com/abundantbeing/hermes-browser-extension) | Issues or @jonkomet | Another new Hermes surface |
| 17 | hermes-workspace (6.7K) | [outsourc-e/hermes-workspace](https://github.com/outsourc-e/hermes-workspace) | @outsource_ on X | Large Hermes UI project |
| 18 | oh-my-hermes (2.9K) | [rlaope/oh-my-hermes](https://github.com/rlaope/oh-my-hermes) | Issues or @rlaope | All-in-one plugin, big install base |
| 19 | hermes-plugins (522) | [42-evey/hermes-plugins](https://github.com/42-evey/hermes-plugins) | Issues or @ai_evey | Frequent core contributor, plugin author |
| 20 | inkbox platform plugin | [inkbox-ai/hermes-agent-plugin](https://github.com/inkbox-ai/hermes-agent-plugin) | Issues | Another third-party platform plugin; share lessons |
| 21 | Hermify blog | [Hermes on your phone roundup](https://www.hermify.io/en/blog/hermes-agent-on-phone-mobile) | @hermifyAGI on X | Their mobile roundup lists Hermex and webui; ask to be included |
| 22 | Beomsu Koh (YouTube) | ["Hermes Agent First Look"](https://www.youtube.com/watch?v=UEszjeHEeSo) | @beomsuKoh | Made a Hermes intro video |
| 23 | Metics Media (YouTube) | [Hermes setup playlist](https://www.youtube.com/playlist?list=PLZppeoE5S1u1V5f9ZJLGlt-oylTCHSnXX) | YouTube comments or channel links | Hermes setup tutorials |
| 24 | @NousResearch / @Teknium | [x.com/NousResearch](https://x.com/NousResearch) | Tag once, after the catalog merge | Only with something real to show |

Not on the list on purpose: Nous staff or maintainers by DM, anyone whose only contact is a personal email, and the Discord archive (read-only logs).

### Wave 2 | OpenClaw and other frameworks (after the non-Hermes adapter works)

BIZ-1 puts this audience second because the generic adapter is roadmap Phase 5. Posting here before it works would promise something we do not ship. The exceptions are venues about the spec itself (A2UI, generative UI lists), where Yui Lines is the topic and Hermes-only is fine.

| # | Target | Link | How to reach | Note |
|---|---|---|---|---|
| 25 | OpenClaw Discord `#self-promotion` | [discord.gg/clawd](https://discord.gg/clawd) | Channel post | ~177K members. Also the route onto the [OpenClaw showcase](https://docs.openclaw.ai/start/showcase) |
| 26 | ClawHub | [clawhub.ai](https://clawhub.ai) | Listing | Needs an OpenClaw skill or plugin first |
| 27 | r/openclaw | reddit.com/r/openclaw | Post (unverified) | Showcase posts reportedly welcome |
| 28 | OpenClaw channel builders | [openclaw-channel-dingtalk](https://github.com/soimy/openclaw-channel-dingtalk), [openclaw-channel-zulip](https://github.com/FtlC-ian/openclaw-channel-zulip) | Issues | People who already built a channel; ask about the adapter design |
| 29 | A2UI Show and tell | [a2ui-project/a2ui Discussions](https://github.com/a2ui-project/a2ui/discussions) | Discussion with a demo under 4 minutes | Spec-to-spec conversation; they ship a SwiftUI renderer too, so lead with questions, not claims |
| 30 | AG-UI | [ag-ui Discussions](https://github.com/ag-ui-protocol/ag-ui/discussions), [Discord](https://discord.gg/Jd3FzfdJa8) | Show and tell | Protocol people |
| 31 | goose | [Discussions](https://github.com/aaif-goose/goose/discussions) | Show and tell (294 posts) | Once an adapter exists |
| 32 | Agno | [Discussions](https://github.com/agno-agi/agno/discussions) | Show and tell | Once an adapter exists |
| 33 | Letta | [discord.gg/letta](https://discord.gg/letta) | Discord | Memory-first agents fit "an agent that knows you" |
| 34 | CrewAI | [community showcase](https://community.crewai.com/c/showcase/12) | Forum post | Small but on topic |
| 35 | n8n | [Built with n8n](https://community.n8n.io/c/built-with-n8n/15) | Forum post | Needs an n8n node first |
| 36 | open-source-ios-apps (52K) | [dkhamsing/open-source-ios-apps](https://github.com/dkhamsing/open-source-ios-apps) | PR | Best list fit for an open SwiftUI app; can go in Wave 1 once the app is public on TestFlight |
| 37 | awesome-generative-ui | [narrowin/awesome-generative-ui](https://github.com/narrowin/awesome-generative-ui) | PR | Small, exactly on topic; Wave 1 is fine |
| 38 | awesome-agents | [kyrolabs/awesome-agents](https://github.com/kyrolabs/awesome-agents) | PR | Responsive maintainers |
| 39 | MCP client directories | [glama.ai/mcp/clients](https://glama.ai/mcp/clients), [mcp.so](https://mcp.so) | Listing | Only once Yui speaks MCP |

Skipped: awesome-mcp-clients, e2b awesome-ai-agents and awesome-openclaw (hundreds of open PRs, no merges since August); the MCP contributor Discord (bans product marketing); TLDR AI (paid placement only).

### Wave 3 | Launch venues (BIZ-1 Stage 3, Dec 2026 target)

- **Show HN** ([rules](https://news.ycombinator.com/showhn.html)): must be tryable without signup. The web playground qualifies. Chris posts it himself and answers comments. No asking anyone for upvotes.
- **Product Hunt**, one to two weeks later.
- **Changelog News** ([submit](https://changelog.com/news/submit)): accepts your own open source work.
- **Lobsters:** invite-only and new accounts cannot use `show` for 70 days. Skip unless someone already on it wants to post it.

## Part 5 | Sequence and cadence

Dates are targets. Each step waits on its gate, not the calendar.

| Step | When | Gate | What goes out | Chris approves |
|---|---|---|---|---|
| 0. Readiness | Now | None | No outreach. Timed install on a clean machine, 20-second video, README leads with the video, Reddit rules checked from a browser | Nothing to approve |
| 1. Catalog | Week of YUI-7 + YUI-22 | Plugin tagged release, catalog check passes, public TestFlight live | Catalog PR (#1) | The PR text |
| 2. Discord | Same week | Step 1 opened | `#plugins-skills-and-skins` post (#2) | The post |
| 3. X | 2 to 3 days later | Video exists | Demo post from Chris | The post |
| 4. Builders | Weeks 2 to 3 | 5 outside installs worked | 5 to 8 one-to-one notes a week from #9 to #23, each personalised | Each note |
| 5. Lists | Week 3 | README and quickstart hold up | #5 to #8, #36, #37 | The batch |
| 6. Reddit | Week 3 or 4 | Rules confirmed, 5+ outside users | r/hermesagent (#4), then a LocalLLaMA write-up | Each post |
| 7. Showcase | Week 4 | Something new to show (not a repost) | `#community-projects-showcase` (#3), tag @NousResearch (#24) | Each post |
| 8. Wave 2 | When the non-Hermes adapter works | Adapter installs cleanly | #25 to #35, #38, #39 | Each post |
| 9. Launch | BIZ-1 Stage 3 gate met | 5+ outside users, quickstart timed | Show HN, then Product Hunt, Changelog | Each post |

Standing rules for every step:

- **Two new public posts a week, at most.** Replies are not capped and are the real work.
- **Reply within a day** to every comment, issue and thread we start. An unanswered launch post is worse than none.
- **Never the same text twice.** Each venue gets its own draft.
- **Every post links back to** [yuigui.com/progress](https://www.yuigui.com/progress), so anyone can check the claims against the dated log.
- **Friday update** (existing cron `yui-weekly-update`) lists what went out that week and what came back.
- **Stop rule:** if a community tells us a post is unwelcome, we delete it, apologise once, and do not post there again without an invitation.

## Part 6 | What we track

Kept small, and in the Friday update where it is public-safe:

- Posts and notes sent, by venue.
- Outside installs, and how many reached a first rendered screen (the BIZ-1 metric that matters most).
- Issues and replies from outside people, and how many we acted on.
- Where each outside user came from (ask in the pairing flow or the first issue, never track silently).

## Part 7 | Open items before anything goes out

| Item | Owner | Status |
|---|---|---|
| Hermes `yui` plugin installable by strangers | YUI-7 | In progress |
| Public TestFlight link | YUI-22 | Not started |
| 20-second demo video and README lead | SITE-3 | Not started |
| Timed clean-machine install, three runs under 10 minutes | Whoever closes YUI-7 | Not started |
| Reddit subs checked from a logged-in browser (existence, size, self-promo rules) | Chris or a browser session | Not started; blocked on this machine |
| Plugin repo layout for the catalog (own repo with tagged releases, or a subdirectory of postscarcityai/yui) | YUI-7 | Decide before step 1 |
| Social handles @yuiguiai ready to post | BIZ-5 | Not started |
