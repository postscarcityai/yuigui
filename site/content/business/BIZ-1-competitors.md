# Yui | competitor research notes (BIZ-1)

Checked Sep 24 2026. Raw research behind the [marketing and positioning brief](https://www.yuigui.com/business/biz-1-marketing-positioning). Blunt on purpose.

This covers Yui (yuigui.com): a native SwiftUI iPhone app that hosts agents the user already runs (Hermes first, then OpenClaw and others). The agent draws full-screen interactive UI through a compact line format ("Yui Lines"), and the app connects through a plugin on the user's own machine.

How to read it:
- **Star counts** come from `gh api repos/...` on 2026-09-24.
- **"Unverified"** means no primary source confirmed the claim.
- **GenUI** means the agent can put interactive UI (widgets, charts, forms, screens) on the screen, as opposed to markdown or fixed app screens.
- **Note:** at the start of this check the Yui repos were private. They went public later on Sep 24 under Apache-2.0.

---

## 0. The two that matter most (read first)

### OpenClaw official iOS + Android apps
Closest overall. This is the product that already does most of what Yui claims.

**Basics**
- **What it is:** the OpenClaw Foundation's official phone apps. They pair to your own OpenClaw Gateway over WebSocket (LAN or tailnet) by QR code, and add chat, realtime voice, approvals, camera, location, Health and a Watch app.
  - Sources: https://github.com/openclaw/openclaw/blob/main/apps/ios/README.md, https://github.com/openclaw/openclaw/blob/main/docs/platforms/ios.md
- **App Store:** "OpenClaw – AI that does things", id6780396132. Free. 3.2 stars from 53 ratings, v2026.9.20. Launched about Jun 29 2026.
  - Sources: https://apps.apple.com/us/app/openclaw-ai-that-does-things/id6780396132, https://www.macrumors.com/2026/06/29/openclaw-ios-app/
- **Stack:** native Swift/SwiftUI on iOS, with Live Activity widget and Watch app targets. Kotlin on Android.
- **Open source:** MIT (OpenClaw Foundation), in the main repo, which has **390,349 stars**.

**GenUI: yes, it already ships agent-drawn interactive UI on iPhone.**
- **Inline chat widgets:** added in "feat: add native inline widget support" (#109212, Jul 17 2026). The file is `apps/shared/OpenClawKit/Sources/OpenClawChatUI/ChatInlineWidgetView.swift`.
- **Session dashboards:** agent-built boards of widgets, opened full-screen from chat through `apps/ios/Sources/Chat/SessionDashboardScreen.swift`.
  - Web docs: https://github.com/openclaw/openclaw/blob/main/docs/web/dashboards.md
- **Canvas and A2UI:** the gateway has a Canvas plugin that renders A2UI.
  - Source: https://github.com/openclaw/openclaw/tree/main/extensions/canvas

**The key difference (verified in source):** both the inline widgets and the dashboards are **HTML documents in a WKWebView**, served from the gateway at `/__openclaw__/canvas/documents/...`.
- The chat, settings and navigation around them are native.
- The agent-generated UI is not native SwiftUI.

**Other points**
- **Scope:** OpenClaw only. No Hermes.

### Hermex (community iPhone client for Hermes)
Closest on the Hermes side.

- **What it is:** a native SwiftUI iPhone app (iOS 18+) for your self-hosted Hermes, by indie developer Uzair Ansar. It is not affiliated with Nous Research. It talks to `hermes-webui`, a community server on port 8787.
  - Sources: https://github.com/uzairansaruzi/hermex, https://lumadock.com/blog/hermex-hermes-mobile-app
- **Open source:** MIT, **1,373 stars**.
- **App Store:** free, no in-app purchases. 4.6 stars from 93 ratings, v1.6 on Sep 6 2026, first release Jun 2 2026.
  - Source: https://apps.apple.com/us/app/hermex/id6767006319
- **Features:**
  - streamed chat
  - tool-call cards
  - sessions
  - cron tasks
  - skills
  - kanban
  - workspace and file browser
  - git review
  - Live Activity
  - share extension
- **GenUI: none.** These are fixed screens designed by the developer, not UI the agent draws.
- **Android sibling:** `ComputerByte/hermex-android`, 81 stars.

---

## 1. Agent frontends / self-hosted chat UIs

### Hermes Agent's own surfaces (NousResearch/hermes-agent, MIT, **248,460 stars**)
- **TUI:** full terminal UI (`hermes`).
- **Messaging gateway:**
  - The README lists Telegram, Discord, Slack, WhatsApp, Signal and Email.
  - The docs add many more channels: Matrix, Teams, SMS, iMessage through BlueBubbles or Photon, WeChat, and others.
  - Sources: https://github.com/NousResearch/hermes-agent, `website/docs/user-guide/messaging/`
- **Web dashboard:** `hermes dashboard` on port 9119, for configuration, keys and session monitoring. Source: `web/README.md`.
- **Hermes Desktop:** Electron app for macOS, Windows and Linux. Streaming chat, side-by-side previews of web pages and files, file browser, voice, and a "Bot Screen" that streams a live remote desktop. Source: `apps/desktop/README.md`.
- **OpenAI-compatible API server:** Nous officially documents Open WebUI as a frontend over it.
  - Source: https://github.com/NousResearch/hermes-agent/blob/main/website/docs/user-guide/messaging/open-webui.md
- **No official iOS app:**
  - The repo has no iOS target.
  - Searching the repo for `a2ui`, `generative ui` and `show_widget` returns nothing: Hermes has **no generative-UI feature of its own**.

### Community Hermes surfaces
| Project | What | Stars | Mobile? |
|---|---|---|---|
| nesquena/hermes-webui | Web UI "from the web or from your phone". Mermaid, HTML-safe rendering, PWA. MIT | 18,549 | Responsive web and PWA |
| fathah/hermes-desktop | Desktop companion | 14,291 | No |
| outsourc-e/hermes-workspace | Web workspace: chat, terminal, memory, inspector | 6,661 | Web |
| filipj9/Hermes-Control-Deck | Mobile PWA control deck | 118 | PWA |
| 0xNyk/awesome-hermes-agent | Directory of skills, plugins and surfaces | 5,736 | n/a |

Small Hermes iOS repos also exist (Bourbon24k/hermes-agent-ios, tinyleed/hermes-agent-ios, given33/hermes-ios). Each has 0 to 2 stars. They show demand, not competition.

### Conduit (cogwheel0/conduit): Flutter iOS/Android
- **What it is:** a native client (not a webview) for **Open WebUI, direct OpenAI-compatible endpoints and Hermes Agent**.
- **Hermes support:** shows live tools, approvals and scheduled agents.
- **Rendering:** native Mermaid, Chart.js embeds, and home-screen widgets.
- **License and stars:** GPL-3.0, **2,173 stars**. v4.1.7 released Sep 22 2026.
- **Price and GenUI:** price unverified. Agent-drawn interactive screens: unverified (none found).
- **Sources:** https://github.com/cogwheel0/conduit, https://apps.apple.com/us/app/conduit-open-webui-client/id6749840287
- **Takeaway:** a real, maintained, native, multi-backend phone app that already lists Hermes.

### Open WebUI (open-webui/open-webui, **152,950 stars**)
- **Platforms:** self-hosted web app plus PWA. No official native app.
- **License:** custom "Open WebUI License" since v0.6.6, with a branding-retention clause above 50 users per 30 days. Free to self-host; enterprise license available.
  - Source: https://docs.openwebui.com/license/
- **Connecting your agent:** through OpenAI-compatible endpoints; this is how Hermes plugs in. MCP is Streamable HTTP only, and only admins can add servers.
- **GenUI:** artifacts, HTML previews, and "Rich UI" embeds from Tools/Actions, all in sandboxed iframes.
  - Source: https://docs.openwebui.com/features/extensibility/plugin/development/rich-ui/
- **MCP Apps:** declined for now. Issue #20995 was closed, and PR #21639 was closed unmerged in Feb 2026.
  - Source: https://github.com/open-webui/open-webui/issues/20995
- **On phones:** mobile browser only.

### LibreChat (LibreChat-AI/LibreChat, MIT, **44,811 stars**)
- **Status:** web only. Acquired by ClickHouse on Nov 4 2025 and stays open source.
  - Source: https://clickhouse.com/blog/clickhouse-acquires-librechat
- **Connecting your agent:** custom endpoints, MCP, and its own Agents.
- **GenUI:**
  - Artifacts: React, HTML, SVG and Mermaid through Sandpack.
  - MCP-UI resources work.
  - **MCP Apps support was merged to `canary` on 2026-09-24** (PR #13831), behind a flag.
  - Source: https://github.com/danny-avila/LibreChat/pull/13831
- **Native app:** none.

### LobeHub, formerly LobeChat (lobehub/lobehub, **82,793 stars**)
- **License:** LobeHub Community License (Apache-2.0 plus commercial terms).
- **Platforms:** web, desktop, and **native iOS/Android apps**. Since May 2026 the apps can reach a self-hosted server through a hidden Developer Mode.
  - Source: https://apps.apple.com/us/app/lobehub-multi-model-chat/id6749615954
- **Price (Cloud):** Free / $9.9 / $19.9 / $39.9 per month.
  - Source: https://lobehub.com/pricing
- **Connecting your agent:** MCP and custom providers.
- **GenUI:** artifacts (HTML, SVG, Mermaid) on web. On mobile: unverified.
- **Positioning:** now pitches itself as an "agent operator".

### Chatbox (chatboxai/chatbox, **41,851 stars**)
- **License:** the Community Edition is GPL-3.0. The official apps are a separate commercial product.
- **Platforms:** native iOS/Android plus desktop and web.
- **Price:** Free / $3.99 / $19.99 / $39.99 per month.
  - Source: https://chatboxai.app/en/pricing
- **Connecting your agent:** custom providers; Agent Mode with MCP.
- **GenUI:** HTML "Artifact Preview" and Mermaid. On mobile: unverified.

### TypingMind
- **What it is:** closed-source BYOK web app and PWA.
- **Price:** one-time $39 / $79 / $99.
  - Source: https://www.typingmind.com/buy
- **Features:** artifacts and canvas, MCP.
- **Native app:** none.

### Msty
- **What it is:** closed source.
- **Studio:** desktop app. Free tier; Aurum is $149/yr or $349 lifetime.
  - Source: https://msty.ai/pricing
- **Msty Go:** agent manager with iOS/Android apps plus Discord, Telegram and WhatsApp. Free beta.
- **GenUI:** unverified.

### Jan (janhq/jan, **44,630 stars**)
- **What it is:** offline local-LLM desktop app. LICENSE file says Apache-2.0.
- **Mobile:** none. Epic #133 is still open.

### AnythingLLM (Mintplex-Labs/anything-llm, MIT, **66,385 stars**)
- **What it is:** desktop and Docker RAG and agent app with MCP.
- **Mobile:** **Android only**; no iOS app.
  - Source: https://docs.anythingllm.com/mobile/overview

### Enchanted (gluonfield/enchanted, Apache-2.0, 6,002 stars): **effectively abandoned**
- The last code commit was Mar 2025.
- The README now points to its successor, **Jaz**.

### Jaz (gluonfield/jaz, Apache-2.0, 73 stars): 2026 entrant
- **Pitch:** "a personal AI on machines you own: any agent… client/server split".
- **Platforms:** Go, Bun and Electron. macOS download.
- **Mobile:** none verified.
- **Source:** https://github.com/gluonfield/jaz
- **Why it matters:** its positioning overlaps Yui's first "place for your agents" pitch, since dropped.

### Pal Chat (iOS)
- **What it is:** closed-source native Apple client.
- **Price:** free; Pro is $6.99/mo or $68.99/yr.
- **Connecting your agent:** MCP and custom OpenAI endpoints.
- **GenUI:** markdown and LaTeX only.
- **Source:** https://apps.apple.com/us/app/pal-chat-ai-chat-client/id6447545085

---

## 2. Mobile clients for coding / "control your agent from your phone"

### Happy (slopus/happy, MIT, **23,881 stars**)
- **What it is:** Expo/React Native app for iOS, Android and web, fronting Claude Code and Codex. The latest release also lists OpenClaw.
- **Connection:** end-to-end encrypted relay, which you can self-host.
- **App Store:** free with in-app purchases, 4.9 stars from about 1K ratings.
- **GenUI:** chat and diffs only.
- **Sources:** https://github.com/slopus/happy, https://apps.apple.com/us/app/happy-claude-code-client/id6748571505

### Omnara (omnara-ai/omnara, Apache-2.0, 2,864 stars): **pivoted**
- **Now:** a managed-agents platform ("open-source alternative to Claude Managed Agents"), reached through web, Slack and API.
- **Old mobile app:** last updated Apr 7 2026. Looks like maintenance mode (unverified).
- **Sources:** https://github.com/omnara-ai/omnara, https://apps.apple.com/us/app/omnara-claude-codex-mobile/id6748426727

### Onepilot (closed source)
- **What it is:** native iPhone app that deploys and supervises Hermes and OpenClaw on your host over SSH. Also covers Claude Code, Codex and OpenCode.
- **Features:** terminal, git, cron, fleet monitoring.
- **Price:** $7.99/mo, $44.99/yr, or $59.99/yr for Pro. 4.1 stars from 14 ratings.
- **GenUI:** none.
- **Sources:** https://onepilotapp.com/agents/hermes/app, https://apps.apple.com/us/app/id6759485908

### "Hermes AI: Personal Agent" (App Store id6759341434)
- **Listing:** claims to connect to your Hermes. Free with $19.99 and $199.99 in-app purchases, 1.0 stars from 1 rating.
- **Red flags:** the only review says it is a paid service, not a client. The listing dates look recycled. Treat as dubious or unverified.

### Claude Code Remote Control (Claude iOS/Android app)
- **What it is:** `claude --remote-control` drives a local Claude Code session from the phone, relayed through Anthropic. Pro, Max, Team and Enterprise plans.
- **Limits:** Claude Code only.
- **Source:** https://code.claude.com/docs/en/remote-control

### Codex in the ChatGPT mobile app
- **What it is:** preview since May 14 2026. Scan a QR code from Codex for Mac to approve commands and see diffs, screenshots and terminal output.
- **Sources:** secondary only (9to5Mac: https://9to5mac.com/2026/05/14/openai-brings-codex-control-to-chatgpt-for-iphone-and-android/). OpenAI's own post returned a 403.

### Cursor for iOS
- **What it is:** public beta since Jun 29 2026, for paid plans. Cloud Agents plus Remote Control of local agents.
- **Features:** Live Activities, push, voice.
- **Source:** https://cursor.com/changelog/ios-mobile-app

### GitHub Copilot coding agent
- **What it is:** you can assign issues to it from GitHub Mobile; it opens a cloud PR.
- **Source:** https://docs.github.com/en/copilot/how-tos/use-copilot-agents/cloud-agent/start-copilot-sessions

### Pattern across this category
- These apps offer chat, diffs and approvals, plus fixed dashboards.
- Among third-party clients, none lets the agent draw UI. Only OpenClaw's own app does.

---

## 3. Generative UI tools / protocols

| Project | Maker | License / stars | Wire format | Renderers | Native iOS? |
|---|---|---|---|---|---|
| **A2UI** (a2ui-project/a2ui) | Google, now a multi-party project | Apache-2.0, **16,493** | Declarative JSON messages against a component catalog, streamed as JSONL. Rides on MCP, A2A, AG-UI or WebSocket. v0.9.1 production, v1.0 RC | React, Lit, Angular, Flutter (GenUI SDK). **Official `swift/` folder with `swiftui` and `sample`** since about Jun 2026 | **Yes, but pre-release.** The docs still list SwiftUI as "Planned (v1.0)". Community: BBC6BAE9/a2ui-swift (60 stars), AGenUI (1,170 stars, C++ core for iOS and Android) |
| **json-render** (vercel-labs) | Vercel Labs | Apache-2.0, **18,200** | Its own JSON spec with Zod catalogs; streaming | React, Vue, Svelte, Solid, **React Native** and more | No Swift |
| **Vercel AI SDK** (vercel/ai) | Vercel | 26,922, license unverified | RSC `streamUI` (experimental, not deprecated) and tool parts | React | No |
| **CopilotKit** | CopilotKit | MIT, **37,517** | Uses AG-UI; supports A2UI | React, Angular, Vue, React Native | No official Swift |
| **AG-UI** (ag-ui-protocol/ag-ui) | CopilotKit-led | MIT, **16,017** | Event stream between agent and frontend (a transport, not a UI format) | TS, Python and .NET official; Kotlin, Dart and others community | Community Swift only (about 20 stars) |
| **Thesys C1 + OpenUI** (thesysdev/openui) | Thesys | MIT, **9,824** | **"OpenUI Lang", a compact streaming language; Thesys claims up to 67% fewer tokens than JSON** | React, plus Angular, Vue and Svelte packages | No. C1 pricing: Free, $49/mo, $499/mo, custom (https://www.thesys.dev/pricing) |
| **MCP Apps** (modelcontextprotocol/ext-apps) | MCP project | 2,866, license unverified | `ui://` HTML resource in a sandboxed iframe, JSON-RPC over postMessage. First official MCP extension, 2026-01-26 | Hosts: Claude, VS Code Copilot, M365 Copilot, Goose, Postman, ChatGPT, and others | HTML in a webview on mobile |
| **MCP-UI** (MCP-UI-Org/mcp-ui) | Community | Apache-2.0, 5,177 | HTML UI resources | `@mcp-ui/client` (React) | No. Largely folded into MCP Apps |
| **OpenAI Apps SDK** | OpenAI | examples repo MIT, 2,339 | MCP Apps plus an optional `window.openai` layer | ChatGPT | Webview. A dev-forum report says widgets fail to render on mobile (unverified whether fixed) |
| **Tambo** (tambo-ai/tambo) | Tambo | MIT, 11,186 | React components chosen by the agent | React only | No. Cloud: free, $25/mo, enterprise |
| **Claude visuals / artifacts** | Anthropic | Closed | HTML/SVG (inline interactive visuals shipped Mar 12 2026) | Claude apps | Webview |
| **Gemini dynamic view / visual layout** | Google | Closed | Generated HTML/CSS/JS | Gemini app and Search AI Mode | On iOS per secondary sources; not native |
| **Adaptive Cards** | Microsoft | MIT, about 2K | JSON cards rendered natively | Android, iOS, .NET and more | **Yes, native**, but these are fixed templates, not screens the agent composes |

Sources for the protocol entries:
- A2UI: https://github.com/a2ui-project/a2ui (see `/swift`) and https://www.infoq.com/news/2026/07/google-a2ui-genui/
- json-render: https://github.com/vercel-labs/json-render
- OpenUI: https://github.com/thesysdev/openui
- MCP Apps: https://blog.modelcontextprotocol.io/posts/2026-01-26-mcp-apps/ and https://modelcontextprotocol.io/extensions/apps/overview
- OpenAI Apps SDK: https://developers.openai.com/apps-sdk/mcp-apps-in-chatgpt
- Claude visuals: https://claude.com/blog/claude-builds-visuals
- Gemini generative UI: https://research.google/blog/generative-ui-a-rich-custom-visual-interactive-user-experience-for-any-prompt/
- Tambo: https://tambo.co/

### What this means for Yui Lines
- **"Compact wire format" is not unique.** Thesys already markets OpenUI Lang on token savings ("up to 67% fewer than JSON"). A2UI owns the "standard" narrative and now has an official SwiftUI renderer in the works.
- **Yui's own numbers are narrower than the headline:**
  - The benchmark claims 2.6x to 3.9x against JSON as models usually write it, but only about 1.5x (about a third fewer tokens) against lean JSON. The benchmark file records 1.6x against minified JSON.
  - Nobody has benchmarked Yui Lines against OpenUI Lang.
  - **Do not claim "most compact"** without that comparison.

---

## 4. Mainstream chat apps as the default agent surface

| Surface | Connect your own self-hosted agent? | Interactive UI | Price | Source |
|---|---|---|---|---|
| **ChatGPT iOS** | Only as an MCP connector in Developer Mode, set up on the web | Apps SDK / MCP Apps widgets. Mobile rendering reported flaky (unverified) | Free / Go $8 / Plus $20 / Pro (secondary) | https://help.openai.com/en/articles/12584461-developer-mode-and-mcp-apps-in-chatgpt |
| **Claude iOS** | Remote MCP custom connectors. Remote Control works only for Claude Code | Interactive connectors (MCP Apps) listed for iOS and Android. Whether custom connectors render on mobile: unverified | Free / Pro / Max | https://support.claude.com/en/articles/13454812-use-interactive-connectors-in-claude |
| **Gemini app** | No | Dynamic view and visual layout; Gemini Agent; Gemini Spark 24/7 agent (announced May 19 2026, limited rollout) | AI Plus / Pro / Ultra | https://blog.google/innovation-and-ai/products/gemini-app/next-evolution-gemini-app/ |
| **Telegram** | **Yes (any bot)**. This is how most Hermes and OpenClaw users reach their agent today | **Mini Apps: full-screen web apps inside Telegram**, plus inline keyboards | Free | https://core.telegram.org/bots/webapps |
| **Discord** | Yes (any bot) | Components v2: sections, galleries, buttons, selects | Free | https://docs.discord.com/developers/components/overview |
| **iMessage** | Not officially. Business Chat requires an Apple-approved business; Hermes reaches it through BlueBubbles or Photon | Business Chat rich cards and list pickers | n/a | https://appleinsider.com/articles/26/06/04/first-ai-agent-for-messages-business-chat-approved-by-apple |
| **WhatsApp** | General-purpose AI bots banned on the Business API since Jan 15 2026 (EEA and Brazil exempt). Third-party agent beta on iOS | Flows and templates | per message | https://techcrunch.com/2026/01/15/after-italy-whatsapp-excludes-brazil-from-rival-chatbot-ban |
| **Poke** (Interaction Company) | No | iMessage text agent. **Acquired by Cognition Jul 23 2026** | Free / $19 / $199 | https://cognition.com/blog/interaction, https://poke.com/pricing |
| **Meta Muse** | No | Personal-agent app launched Sep 8 2026, US only | $20 / $100 (secondary) | https://www.cnn.com/2026/09/23/tech/meta-muse-ai-agent |
| **Siri, iOS 27 "Extensions"** | Only through apps that ship an Extension | Siri UI | Free | https://www.macrumors.com/2026/05/05/ios-27-third-party-chatbots-apple-intelligence/ |

**Telegram is the real incumbent for "talk to my own agent from my phone".**
- It is free and already set up.
- The Hermes README leads with "talk to it from Telegram".
- Mini Apps can render arbitrary interactive UI.
- Its weaknesses: the UI is a web view inside someone else's app, and the agent has to host and serve a web app.

---

## 5. Community size and where users gather

| | Hermes Agent | OpenClaw |
|---|---|---|
| GitHub stars | **248,460** (created Jul 2025) | **390,349** (created Nov 2025) |
| Discord (invite API) | discord.gg/NousResearch: **140,066** members, about 14.4K online. This is the whole Nous server, not Hermes-only | discord.gg/clawd: **176,652** members, about 18.9K online |
| Reddit | No dedicated sub found (unverified; Reddit blocked fetches) | r/openclaw at about 103K (secondary: https://kilo.ai/openclaw/vs-hermes) |
| Official phone app | **None.** Community fills the gap: Hermex, Conduit, Onepilot, hermes-webui PWA | **Yes**, iOS, Android and Watch |

Ecosystem signal: `nesquena/hermes-webui` has 18.5K stars, which shows Hermes users want a non-terminal, phone-reachable surface.

---

## 6. Launch norms and comparable launches

**Show HN rules** (https://news.ycombinator.com/showhn.html):
- It must be something people can run or try, and your own work.
- No landing pages or signup walls.
- Don't ask for upvotes.
- Be present to answer comments.

**Product Hunt 2026** (secondary; PH was not fetchable):
- Editors hand-pick Featured launches.
- Ranking weighs engagement and vote velocity; vote bursts get flagged.
- Relaunches require a 6-month gap per domain.
- Sources: https://getlaunchlist.com/blog/how-to-launch-on-product-hunt-2026, https://www.producthunt.com/p/producthunt/introducing-randomized-leaderboard-day-on-product-hunt

**Comparable Show HN results** (HN Algolia):

| Launch | Date | Points / comments |
|---|---|---|
| Omnara, "Run Claude Code from anywhere" | 2025-08-12 | 310 / 168: https://news.ycombinator.com/item?id=44878650 |
| Klaus, OpenClaw on a VM | 2026-03-11 | 160 / 91: https://news.ycombinator.com/item?id=47337249 |
| DenchClaw, local CRM on OpenClaw | 2026-03-09 | 147 / 124: https://news.ycombinator.com/item?id=47309953 |
| Eve, managed OpenClaw | 2026-04-10 | 72 / 40: https://news.ycombinator.com/item?id=47721255 |
| Happy Coder | 2025-08-14 | 30 / 8: https://news.ycombinator.com/item?id=44904039 |
| Happy Coder relaunch | 2026-02-12 | 2 / 0 |
| Grafana observability for Hermes | 2026-08-16 | 28 / 0 |
| Paseo, open-source agent UI | 2026-03-26 | 14 / 0 |
| OpenUI, generative UI spec | 2026-03-11 | 8 / 0 |
| A2UI-pattern Show HNs | 2026 | all 2 points or fewer |

Other results:
- Several mobile agent clients (Kirikiri, Detach, MuxPod, TapTap) got 1 to 3 points.
- No Hermex Show HN was found.
- Product Hunt numbers for these launches could not be retrieved.

**What the numbers suggest:**
- Being first to a category (Omnara in Aug 2025) or making a strong, opinionated product on top of OpenClaw (Klaus, DenchClaw) did well.
- "Another mobile client" and "another generative UI spec" posts mostly got nowhere.
- Relaunching the same product did not work.

---

## Gaps nobody fills (blunt read)

**Where Yui is NOT differentiated. Don't claim these:**
1. **"A phone app for your self-hosted agent."**
   - OpenClaw has an official, free, native iOS/Android/Watch app.
   - Hermes already has Hermex (free, MIT, native SwiftUI, 93 ratings), Conduit (Flutter, lists Hermes), Onepilot (paid) and the hermes-webui PWA.
   - Telegram is the default, and it works.
2. **"Agents draw interactive UI on your phone, not just chat bubbles."**
   - OpenClaw's iPhone app has done this since Jul 2026, through inline chat widgets and full-screen session dashboards (HTML in WKWebView).
   - Telegram Mini Apps, Claude interactive connectors (MCP Apps) and Gemini dynamic view also put interactive UI on phones.
3. **"Open source."**
   - Hermex, Conduit, Happy and OpenClaw are all open source.
   - The Yui repos only went public on Sep 24, so this is table stakes, not an edge.
4. **"Compact wire format."**
   - Thesys OpenUI Lang already sells on token savings.
   - A2UI is the standard with momentum, and it is adding an official SwiftUI renderer.
   - Yui's honest margin over *lean* JSON is about 1.5x, not the 2.6x to 3.9x headline.
5. **"Works with many agents."**
   - For now Yui is Hermes-only, and OpenClaw support is future work.
   - Happy already spans Claude Code, Codex and OpenClaw.
   - Conduit spans Open WebUI and Hermes.

**Where Yui appears genuinely differentiated (verified as of today):**
1. **Native SwiftUI rendering of agent-drawn UI on iPhone, in production.**
   - Every shipped competitor renders agent UI as HTML in a webview: OpenClaw widgets and dashboards, MCP Apps, the Apps SDK, Claude and Gemini visuals, Telegram Mini Apps.
   - The only native-SwiftUI generative UI effort is A2UI's official Swift package, which is pre-release, plus small community renderers. None is a consumer app.
   - What this buys: presets that feel like iOS, stream as the agent types, work offline, and need no HTML/JS/CSS from the agent.
   - This is the defensible claim. **It is time-limited:** once A2UI ships Swift v1.0, OpenClaw (which already speaks A2UI) could go native.
2. **Generative UI for Hermes specifically.**
   - Hermes has no generative-UI feature.
   - No Hermes client (Hermex, Conduit, hermes-webui, Onepilot, Hermes Desktop) lets the agent draw screens.
   - Among Hermes users (about 248K stars, the largest agent community without an official phone app), this slot is empty.
3. **The agent never writes UI code.**
   - Short lines map to prebuilt presets, which is cheap for small or local models and safe because there is no arbitrary HTML.
   - OpenClaw and MCP Apps have the agent author or serve HTML documents.
   - This is a real design difference. But A2UI's catalog model and OpenUI Lang are the same idea, so pitch it as "native plus tiny", not "first".
4. **Full-screen, task-shaped moments on a phone**, like a workout timer, pick-one choices, or a gallery.
   - OpenClaw's dashboards are persistent boards built for ops.
   - Telegram Mini Apps need a hosted web app.
   - Nobody has positioned "the agent takes over the screen for a moment, then hands it back" as a consumer experience. This is positioning, not tech. It is unproven and easy to copy.

**Risks to name in the brief:**
- **OpenClaw is the obvious fast-follower.** It has the official app, A2UI, a canvas host, 390K stars and a foundation behind it.
- **Hermex could add rendering.** It is MIT, SwiftUI and Hermes-native, with an active solo developer and an existing user base.
- **Nous could ship an official iOS app.** Hermes Desktop shows they build first-party surfaces.
- **Launch history is weak for this category:** mobile-client and generative-UI-spec Show HNs mostly scored 1 to 14 points. A launch that leads with a runnable demo (the playground) and one specific Hermes use case fits the pattern of what worked better than "another agent client".
