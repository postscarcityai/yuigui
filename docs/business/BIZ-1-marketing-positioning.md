# Yui | marketing and positioning brief

Draft 1, Sep 24 2026. Card BIZ-1. Public, like the rest of the project (Chris, Sep 24: "everything can be totally visible"). Google Doc: https://docs.google.com/document/d/1U3taIXMIGeRRqX3N6ACcz_rrjtmKNgmrsH-FrKos86s/edit

Companion docs: [BIZ-3 revenue models and mission principles](https://www.yuigui.com/business/biz-3-revenue-models), [competitor research notes](https://www.yuigui.com/business/biz-1-competitors). Outreach (BIZ-2) and the content plan (BIZ-4) build on this one.

## The short version

- **One line:** Meet Yui, a generative user interface. (Chris picked it Sep 24 2026; it leads the site.)
- **The line under it:** your agent stops describing things and starts showing them. A question becomes two buttons, a workout becomes a timer, a plan becomes a screen you can tap.
- **Who first:** people who already run Hermes. Then OpenClaw and other self-hosted agent people. Then anyone with an AI subscription.
- **What sets it apart:** your agent draws native iPhone screens, not web pages in a frame, and Hermes agents get a screen for the first time. Phone apps for self-hosted agents already exist (OpenClaw's own app, Hermex); agent-drawn native screens do not.
- **What we are not:** another AI chatbot. Chat is the doorway, not the product.
- **The promise we keep:** free and open source for anyone who brings their own agent. It genuinely helps, no matter who you are.
- **Launch path:** private beta with Hermes users, open source launch, Show HN and Product Hunt, then the App Store. Each step has a gate we must pass before the next.

## Mission guardrail

Chris, Sep 24: genuinely help people. A great way to interact with your agents, no matter who you are.

Every line of copy, every launch post and every metric below gets checked against that. In practice it means:

- We say what Yui does today, not what the roadmap hopes for. A screenshot beats a claim.
- We never inflate numbers. The Yui Lines token saving is 1.6x against lean JSON and 3.9x against a component tree ([benchmark](https://www.yuigui.com/yl)). We quote the split, never one big multiplier.
- We never talk down to people who do not run agents yet. "No matter who you are" includes them; they are just not first in line.
- No growth hacks: no fake scarcity, no invite-count leaderboards, no engagement bait (BIZ-3 principle 3).

## Part 1 | The story

### One line

**Meet Yui, a generative user interface.**

Chris picked this line on Sep 24 2026, and the site hero uses it. The first draft pitched Yui as a nicer place to talk to the agents you already run. The competitor notes show why that lost: phone apps for self-hosted agents already exist, so a place to talk to agents is not what sets Yui apart. The screens are.

Alternates, for testing in posts:

- "Your agents, on a screen that fits them."
- "Stop reading your agent. Start using it."
- "Your agent can show you, not just tell you."

### The story in three sentences

You already have an agent. It lives on your computer or a server and you talk to it through Telegram, Discord or a terminal, which means every answer is a wall of text and every question is "reply 1, 2 or 3." Yui is a native iPhone app your agents plug into, where they can answer with real screens: buttons, timers, forms, charts, galleries, full-screen when it matters.

### The origin (true, and the best hook we have)

Chris runs a small fleet of Hermes agents. One of them, Arnold, is his trainer. Mid-workout he asked Arnold for intervals, 40 on, 20 off, eight rounds, and got back a paragraph. His words: "If it asks me a question, I just want a button." Yui started there. Arnold now answers that request with a one-line message that renders as a full interval timer.

### What makes it not a chatbot

- **The agent can take the whole screen.** Workouts go full screen. Swipe down and the chat is right underneath.
- **Answers are never locked.** Tap a choice, change your mind, the agent adapts.
- **Every agent looks like itself.** Open Arnold and the whole app is Arnold's colors. In most agent tools the only tell is a small name in a corner.
- **Voice in, text out.** Talk naturally, read the answer.
- **Your agent, not ours.** Yui does not replace your agent, its memory or its model. It gives it a screen.

## Part 2 | Audiences, in order

### 1. Hermes users (first)

**Who:** people running Hermes Agent by Nous Research on their own machine or server. Technical, opinionated, already paying for models or running local ones.

**What they have:** an agent with memory, skills and tools, reached through Telegram, Discord or the terminal.

**What they lack:** a screen built for an agent. Telegram buttons are the ceiling today.

**Why first:** Yui is built as a Hermes platform plugin, the same way Telegram is, so one agent keeps one brain across Telegram and Yui. Chris's own fleet is customer zero, so every rough edge gets hit here first.

**The ask we make of them:** install the plugin, pair with a 6-digit code, try one screen. Tell us what broke.

**Watch out:** Hermex already gives Hermes users a good free native chat client. We do not pitch "a phone app for Hermes." We pitch what Hermex cannot do: the agent draws the screen.

**Message:** "Your Hermes agent already knows you. Now it can show you things: buttons, timers, galleries, full screen. Two commands, one pairing code."

### 2. OpenClaw and other self-hosted agent people

**Who:** OpenClaw users (Chris's original early-adopter call in the pitch), plus people running other agent frameworks and MCP-capable agents.

**Watch out:** OpenClaw has its own official app with agent-drawn widgets (in a webview). For this group the pitch is native quality and one app for all their agents, and it only lands once the adapter ships.

**Why second:** the connector for non-Hermes agents (generic adapter, MCP server) is roadmap Phase 5. Promising it before it works would break the guardrail.

**Message:** "Yui Lines is an open spec. Any agent that can write a line of text can drive a native screen."

### 3. Anyone with an AI subscription

**Who:** people who pay for ChatGPT, Claude or Gemini and have never run an agent.

**Why third:** they need a hosted agent and an onboarding interview (Phase 4). Until then Yui has nothing for them to talk to.

**Message (later):** "A team of agents that know you, with screens that make sense on a phone."

**What we do now:** let them request an invite and watch the build. Do not market to them yet.

### Who we are not chasing

- Enterprises and team buyers. That is BIZ-3 Model D, after public launch.
- Developers who want a generative UI SDK for their own app. Yui Lines is open and they are welcome, but the product is the app.

## Part 3 | Competitors

Checked Sep 24 2026. Star counts from the GitHub API that day. Anything not confirmed from a primary source says "unverified". Full research notes with every source: [competitors.md](https://www.yuigui.com/business/biz-1-competitors).

### The honest headline

"A phone app for your self-hosted agent" is already taken, and so is "agents that draw interactive UI on a phone." What nobody ships is **native** agent-drawn UI, and nobody at all gives **Hermes** agents a screen they can draw on. That is the gap, and it will not stay open forever.

### The two that matter most

- **OpenClaw's official iPhone and Android apps.** Free, MIT, native Swift shell, on the App Store since about Jun 29 2026 ([App Store](https://apps.apple.com/us/app/openclaw-ai-that-does-things/id6780396132), [MacRumors](https://www.macrumors.com/2026/06/29/openclaw-ios-app/)). Since Jul 17 2026 the agent can put widgets in chat and open full-screen dashboards. We read the source: both are HTML in a WKWebView served by the gateway (`ChatInlineWidgetView.swift`, [repo](https://github.com/openclaw/openclaw)). OpenClaw only, no Hermes. 390,349 stars, a foundation behind it, and the gateway already speaks A2UI. **This is the fast follower to watch.**
- **Hermex.** A free, MIT, native SwiftUI iPhone client for self-hosted Hermes by an independent developer, 1,373 stars, 4.6 stars from 93 ratings ([GitHub](https://github.com/uzairansaruzi/hermex), [App Store](https://apps.apple.com/us/app/hermex/id6767006319)). Chat, tool cards, cron, skills, kanban, files. Fixed screens only: the agent cannot draw UI. It could add rendering.

### Agent frontends and phone clients

| Product | What it is | Open source | Agent-drawn UI | Source |
|---|---|---|---|---|
| Hermes Agent's own surfaces | TUI, messaging gateway (Telegram, Discord, Slack and more), web dashboard, Electron desktop app. No iOS app | MIT, 248,463 stars | None found | [repo](https://github.com/NousResearch/hermes-agent) |
| Conduit | Native Flutter iOS/Android client for Open WebUI and Hermes | GPL-3.0, 2,173 stars | Charts and Mermaid; agent-drawn screens unverified (none found) | [repo](https://github.com/cogwheel0/conduit) |
| hermes-webui | Community web UI for Hermes, works on phones as a PWA | MIT, 18,549 stars | No | [repo](https://github.com/nesquena/hermes-webui) |
| Onepilot | Paid native iPhone app that deploys and supervises Hermes and OpenClaw over SSH, $7.99 a month | Closed | No | [site](https://onepilotapp.com/agents/hermes/app) |
| Open WebUI | Self-hosted web chat, no native app. Hermes documents it as a frontend | Custom license, 152,950 stars | Rich UI embeds in iframes | [docs](https://docs.openwebui.com/features/extensibility/plugin/development/rich-ui/) |
| LibreChat | Web only, acquired by ClickHouse Nov 2025 | MIT, 44,811 stars | Artifacts; MCP Apps merged to canary Sep 24 2026 | [PR](https://github.com/danny-avila/LibreChat/pull/13831) |
| LobeHub | Web, desktop and native mobile apps, cloud from $9.9 a month | Community license, 82,793 stars | Artifacts on web; mobile unverified | [pricing](https://lobehub.com/pricing) |
| Chatbox, Pal Chat, TypingMind, Msty | BYO-key chat clients | Mixed | HTML previews at most | [Chatbox](https://chatboxai.app/en/pricing), [Pal](https://apps.apple.com/us/app/pal-chat-ai-chat-client/id6447545085) |
| Happy | React Native app for Claude Code and Codex (OpenClaw listed), 4.9 stars from about 1K ratings | MIT, 23,881 stars | Chat and diffs | [repo](https://github.com/slopus/happy) |
| Claude Code Remote Control, Codex in ChatGPT, Cursor iOS | Drive a coding agent from your phone | Closed | Chat, diffs, approvals | [Claude](https://code.claude.com/docs/en/remote-control), [Cursor](https://cursor.com/changelog/ios-mobile-app) |
| Jaz | 2026 "personal AI on machines you own, any agent". Desktop only so far | Apache-2.0, 73 stars | None verified | [repo](https://github.com/gluonfield/jaz) |

### Generative UI formats and tools

| Project | Idea | Native iOS? | Source |
|---|---|---|---|
| A2UI (Google, now multi-party) | JSON messages against a component catalog. The standard with momentum | Official SwiftUI package in the repo, still pre-release; docs list SwiftUI as planned for v1.0 | [repo](https://github.com/a2ui-project/a2ui) |
| Thesys OpenUI Lang / C1 | A compact streaming UI language, marketed as "up to 67% fewer tokens than JSON" | No, web frameworks | [repo](https://github.com/thesysdev/openui) |
| MCP Apps, MCP-UI, OpenAI Apps SDK | HTML UI served by a tool, shown in a sandboxed iframe | Webview | [MCP Apps](https://modelcontextprotocol.io/extensions/apps/overview) |
| Vercel json-render, AI SDK, CopilotKit / AG-UI, Tambo | Developer SDKs for web apps (json-render also targets React Native) | No Swift | [json-render](https://github.com/vercel-labs/json-render), [CopilotKit](https://github.com/CopilotKit/CopilotKit) |
| Claude visuals, Gemini dynamic view | The model writes HTML inside the vendor's app | Webview | [Claude](https://claude.com/blog/claude-builds-visuals), [Google](https://research.google/blog/generative-ui-a-rich-custom-visual-interactive-user-experience-for-any-prompt/) |
| Adaptive Cards (Microsoft) | JSON cards rendered natively | Yes, but fixed templates, not screens an agent composes | [site](https://adaptivecards.io/) |

### The real incumbent: Telegram

Most Hermes and OpenClaw users reach their agent through Telegram today. It is free, already installed, and the Hermes README leads with it. Mini Apps can show full-screen interactive UI ([docs](https://core.telegram.org/bots/webapps)). The catch: it is a web page inside someone else's app, and the agent has to host a web app to use it. Discord's components are the same story with less room. We do not beat Telegram on reach. We beat it on what the screen can do, and we keep working with it (a Telegram conversation can hand off to Yui).

### What we must not claim

1. "The first phone app for your self-hosted agent." OpenClaw, Hermex, Conduit and Onepilot exist.
2. "The first app where agents draw UI on your phone." OpenClaw has done it since July, in a webview.
3. "The most compact UI format." OpenUI Lang already sells on this and nobody has compared the two. Our own number is 1.6x against lean JSON.
4. "Works with any agent." Today it is Hermes. OpenClaw and generic adapters are roadmap.
5. "Open source" as a differentiator. The repos went public on Sep 24 (Apache-2.0), but Hermex, OpenClaw, Happy and Conduit are open too.

### Risks from competitors

- OpenClaw goes native: it already speaks A2UI, and A2UI's SwiftUI renderer is coming. Our lead on native rendering is months, not years.
- Hermex adds rendering. It is SwiftUI, Hermes-native and active.
- Nous ships an official iOS app. Hermes Desktop shows they build first-party surfaces.
- The category launches badly. Most "another mobile agent client" and "another generative UI spec" Show HNs scored 1 to 14 points. What did well was a first-in-category product (Omnara, 310 points) or a strong opinionated product on top of OpenClaw (Klaus 160, DenchClaw 147). [HN Algolia results in the research notes.]

## Part 4 | Differentiators

Only what survived the competitor check. In order of strength.

1. **Native screens, not web pages.** Every product that ships agent-drawn UI on a phone today renders HTML in a webview: OpenClaw's widgets and dashboards, MCP Apps, ChatGPT apps, Claude and Gemini visuals, Telegram Mini Apps. Yui renders real SwiftUI: iOS navigation, haptics, Dynamic Type, VoiceOver, light and dark, streaming line by line as the agent writes. That is the claim we lead with. It has a clock on it (A2UI Swift), so we use the lead to win Hermes users, not to rest.
2. **The only screen a Hermes agent can draw on.** Hermes has no generative UI of its own and no Hermes client lets the agent draw. Hermes is the largest agent community without an official phone app (248K GitHub stars). Yui plugs in as a Hermes platform, the same way Telegram does, so the agent keeps one brain and one memory across both.
3. **The agent never writes UI code.** One short line picks a preset and fills it in. No HTML, no JS, nothing to host. That makes it cheap enough for small and local models, safe by design, and within App Store rules. Honest framing: A2UI and OpenUI share the catalog idea. We pitch "native and tiny," not "first."
4. **Moments, not dashboards.** The agent takes the whole screen for a task (a workout, a choice, a gallery, a before and after) and hands it back. OpenClaw's dashboards are boards for operators. Nobody has made this a consumer experience yet. It is positioning, not a moat, so it has to be felt in the product, not just said.
5. **Every agent looks like itself.** Per-agent color schemes and feel, agents that can restyle themselves. Most agent tools show every agent in the same interface.
6. **Open and built in public, with honest numbers.** Open source under Apache-2.0 since Sep 24, an open spec with a conformance suite, a dated ship log, published business docs, a benchmark that shows the small number next to the big one. Hermex and OpenClaw are open too, so this is table stakes plus a trust signal, not a differentiator on its own.

## Part 5 | Messaging pillars

Four pillars. Every post, page and pitch leads with one of them and backs it with a proof point from Part 6.

1. **Your agent, a real screen.** Agents answer with buttons, timers, forms, charts and galleries, full screen when it matters. Proof: the playground, TestFlight screenshots, the Tabata timer in one line.
2. **Bring the agent you already have.** Yui does not replace your agent, memory or model. It plugs into Hermes as a platform, the same way Telegram does. Proof: the plugin, the pairing flow, the agents spec.
3. **Every agent looks like itself.** Per-agent colors, light and dark, its own feel. Agents can restyle themselves. Proof: the agents screen, per-agent themes as they ship.
4. **Open, and built in public.** Open source, open spec, a dated log of every ship, a public TestFlight. Proof: the repos, yuigui.com/progress, the conformance suite.

Words we use: show, screen, tap, your agent, native, open, plug in.
Words we avoid: revolutionary, seamless, AI-powered, next-generation, supercharge, "the future of", chatbot (except to say what we are not).

## Part 6 | Proof points we can show today

Everything here exists as of Sep 24 2026. Nothing on this list is a promise.

| Proof | Where | Status |
|---|---|---|
| Native SwiftUI app on TestFlight, 14 builds in two days | TestFlight (internal group today; public link planned, card SITE-4) | Live, internal |
| Agents screen: add your own agents with a 6-digit pairing code, per-agent avatar and online dot | App build 14 | Live |
| Yui Lines spec, open | [yuigui.com/yl](https://www.yuigui.com/yl) | Live |
| Web playground: every preset clickable in the browser | [yuigui.com/playground](https://www.yuigui.com/playground) | Live |
| Media presets: gallery, video, before/after compare, storyboard, image mark-up edit | Playground | Live on web, app next |
| Token benchmark with the honest split (1.6x vs lean JSON, 3.9x vs tree) | [yuigui.com/yl](https://www.yuigui.com/yl), `spec/BENCHMARK.md` | Live |
| 198 parser test cases, shared conformance suite for web and Swift | `spec/conformance` | Live |
| Dated build log, weekly update every Friday | [yuigui.com/progress](https://www.yuigui.com/progress) | Live |
| Roadmap, business plan, business docs in the open | [yuigui.com/roadmap](https://www.yuigui.com/roadmap), [/business](https://www.yuigui.com/business) | Live |
| Privacy page listing every table we hold | [yuigui.com/privacy](https://www.yuigui.com/privacy) | Live |
| Real beta feedback acted on in hours (the debug screen removed the same day) | Progress log, Sep 23 | Live |
| Open source repos, Apache-2.0 | [postscarcityai/yuigui](https://github.com/postscarcityai/yuigui), [postscarcityai/yui](https://github.com/postscarcityai/yui) | Public since Sep 24 |

Screenshot shot list for the site, App Store and launch posts (owner: SITE-3):

1. Chat with an `ask` answered as two big buttons.
2. Full-screen Tabata timer in the agent's colors.
3. Agents screen with three agents, each in its own color.
4. Gallery in coverflow, and a before/after compare with the slider mid-drag.
5. The same agent in light and dark.
6. Pairing: the 6-digit code on the phone next to the terminal command.

## Part 7 | Launch sequence

Four stages. Each has a gate. We do not move on because a date arrived; we move on because the gate is met.

### Stage 1 | Private beta (now to Phase 1 end, late Nov 2026)

- **Who:** Chris's fleet, then 10 to 20 Hermes users invited by hand from public channels (BIZ-2 builds the list, Chris approves every message).
- **What they get:** TestFlight plus the Hermes `yui` plugin (YUI-7).
- **Gate to Stage 2:** a stranger goes from nothing to a rendered screen from their own agent in under 10 minutes without help, three times in a row. Crash-free sessions above 99%.

### Stage 2 | Open source launch (repos public, alongside Stage 1)

- Repos went public on Sep 24 after the secret scan (OSS-1), with Chris's approval. What is left: a README that leads with the demo video.
- README leads with a 20-second screen recording, not text.
- Public TestFlight link on yuigui.com (SITE-4).
- Posts in the Hermes and self-hosted communities, drafted in BIZ-2, each one Chris-approved before it goes out.
- **Gate to Stage 3:** the plugin installs in two commands on a clean machine, the README quickstart works as written, and at least five outside users have run it.

### Stage 3 | Show HN and Product Hunt (target Dec 2026, only if the gate is met)

- **Show HN first.** Mobile agent clients and generative UI specs mostly scored 1 to 14 points on Show HN in 2026; first-in-category and strongly opinionated products did well. So lead with one concrete thing: "Show HN: Yui, native iPhone screens your Hermes agent draws with one line of text." Link the repo, put the playground (runs in the browser, no signup, which Show HN rules require) and a 20-second video at the top of the README. Chris posts it himself and answers comments for the first few hours; builders replying beats any copy.
- **Product Hunt a week or two later,** once HN feedback is fixed. Gallery = the shot list above plus a 30-second video.
- Launch-day checklist: public TestFlight has room (Apple caps external testers at 10,000), the relay is load-tested, the quickstart is timed on a clean machine, a known-issues list is in the README.
- **Gate to Stage 4:** App Store review notes drafted, privacy labels done, a demo account that shows screens without the reviewer running an agent.

### Stage 4 | App Store (Phase 5 to 6, Mar to Jun 2027)

- Public listing once review prep is done and a person without an agent has something to do (hosted default agent, Phase 4). Until then Yui stays on TestFlight, which suits the audience.
- Store name is "Yui Gui" (changed from the placeholder "Yui Bot" on Sep 26, 2026, Chris's call). The home screen name stays "Yui".
- Store copy reuses the four pillars. Screenshots from the shot list.

### Every stage

- Ship log entry for each release, weekly Friday update, never skip.
- Every public post, reply or message to a third party is drafted and Chris-approved first. The open source grant covers publishing code, docs and progress, not outreach.

## Part 8 | Metrics to watch

Few, honest, and tied to the guardrail. Track weekly in the Friday update where they are public-safe.

### Is it helping people? (the ones that matter most)

- **Time to first screen:** minutes from install to the first rendered screen from the user's own agent. Target under 10, then under 5.
- **Weekly active pairs:** users with at least one agent that sent a screen this week.
- **Screens per conversation:** how often agents answer with UI instead of text. If this is near zero, Yui is a chatbot and we failed the north star.
- **Change-of-mind rate:** how often people revise an answer. Healthy means the "never locked" promise is used.
- **D7 and D30 retention** of paired users.
- **Feedback items acted on** and median time to act.

### Is the product healthy?

- Crash-free sessions (TestFlight), target 99%+.
- Yui Lines parse failures per 1,000 lines from real agents, and `custom` escape-hatch use (the promotion queue for new presets).
- Reply latency: first word on screen after the user finishes speaking.

### Is the word spreading?

- Invite requests, and yuigui.com to invite request conversion.
- GitHub stars, forks, outside issues and outside pull requests. Outside PRs are the real signal; stars are vanity.
- Plugin installs (pairings started vs completed).
- Show HN points and comment count, Product Hunt rank, mentions in Hermes and OpenClaw channels.

### What we will not track

- Time in app as a goal. An agent that finishes your task fast is doing its job.
- Anything that needs reading users' messages. Counts only, on our side.

## Open questions for Chris

1. The one line: answered Sep 24 2026. "Meet Yui, a generative user interface." The site hero follows it (SITE-12).
2. Show HN timing: wait for the Stage 2 gate (my recommendation), or go earlier with Hermes-only support?
3. Who posts: launch posts under Chris's name (best for Show HN) or the yuiguiai handles?
