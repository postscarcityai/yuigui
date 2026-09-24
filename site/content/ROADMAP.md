# Yui | roadmap (draft 5, Sep 24 2026)

yuigui.com. Generative UI front end for your AI agents. Source: Chris's pitch recording 366 (transcript `pitch/rec366.txt`, summary `pitch/SUMMARY.md`). The recording calls it "Nexus". This document says Yui throughout.

## What the pitch actually says

- "Generative UI is different from regular UI because it's more of a system and it can be totally unique each time."
- "The default state is you can just talk to it... And then also it can just take over the screen at any time and generate UI for you."
- "This one app is approved on the App Store. You can hook your agent up to it."
- "Hey Arnold, I want to do a countdown timer."
- "The real problem I'm having with my lobster agents is that I just can talk to them via text. If it asks me a question, I just want a button."
- "Probably for V1, I would love it to just plug into my open claw... my early adopters of this are going to be open claw users."
- "In all phase ones, we're plugging into outside services and then slowly but surely we bring them in house."
- "The goal is that you download this app, you put in your credit card and you're off to the races with a multi-agent in your life."
- "You're not going to one shot this whole company."

Short version: chat first, screens on demand, many agents in one app, Chris's own Hermes fleet is customer zero.

## North star: not just another AI chatbot

Chris, Sep 24: "I want these to be truly unique experiences." Every decision gets checked against this. Chat is the doorway, not the product. Three commitments follow:

1. **Immersive by default when it matters.** The agent's UI can take over the whole screen, not just sit as a bubble in chat. The agent decides when a full-screen view is worth it; workouts always go full screen. The user can always leave with a swipe down or an X, and the chat is right underneath. Planned as Yui Lines `>full` (route the following lines to a full-screen stage) plus a per-preset default (timer, camera and mic default to full screen). Card YUI-13.
2. **Voice in, text out, fast.** Talk naturally, read the answer. On-device speech (iOS 26 SpeechAnalyzer) streams words as you speak, a hands-free mode keeps the mic open between turns, and the first word of the reply lands in well under a second of you finishing. Card YUI-14.
3. **Answers are never locked.** Change your mind on any choice and the agent adapts (YUI-12, shipping in Phase 1). An agent can lock something on purpose, like a confirmed booking.

In-chat screens stay: they are right for quick asks. Full screen is for the moments that deserve it.

## The core bet: presets and settings, not generated UI code

Chris, Sep 23: optimize for speed. The UI should work like settings. The agent picks a preset and fills in a few parameters. It never writes HTML, and even JSON is too heavy.

- **Presets carry the weight.** The app ships prebuilt presets: `timer`, `ask`, `choose`, `pick`, `slide`, `form`, `list`, `table`, `card`, `image`, `camera`, `mic`, `chart`. Each already has its layout, animation, big tap targets, and one primary call to action. Target: presets alone deliver 80% of the value at launch.
- **Yui Lines (YL) is the wire format.** One line per component: preset name plus terse positional args, defaults for everything else. No braces, no quoted keys. The app renders each line the moment it arrives.
  ```
  timer 40/20x8 Tabata                  # 40s work, 20s rest, 8 rounds
  ask "Log this set?"                   # yes/no by default
  choose "Split?" Push|Pull|Legs +other # single choice + type your own
  pick "Gear" DB|Bench|Bands            # multi-select
  slide "AI experience" 1-5
  form name:text goal:voice level:1-5
  list Today "Squat 5x5 225" "Bench 5x5 185"
  table meals                           # bound to an agent data table
  >2 timer 60                           # send to screen 2
  ~timer rounds=10                      # patch a live component, no re-send
  save workout / show workout           # named screens, reopened in two tokens
  ```
  Estimate: the Tabata timer is about 8 tokens in YL versus 60+ as a JSON document. Phase 1 measures this with a real tokenizer.
- **The skill is the cheatsheet.** The Hermes skill is about 40 lines listing every preset and its args, so each agent carries the whole vocabulary for a few hundred tokens.
- **Escape hatch, then promotion.** `custom {json}` covers the long tail. Every custom use is logged. Patterns that repeat get promoted to presets. That is the flywheel that grows the 80% toward 95%.

Why this over generated code:

1. App Store. Apps that download and run new executable code get rejected (guideline 2.5.2). Rendering data against a fixed native preset set is the pattern Apple accepts.
2. Speed. No codegen, no build. A screen costs one short line of output and renders instantly.
3. Quality. UX rules live in the presets, not in every prompt, so an agent cannot produce a bad layout.
4. Portability. The same line renders in the app, on the web tracker, and degrades to Telegram buttons (`ask` and `choose` map straight to inline keyboards).

## Stack: native SwiftUI on iPhone (decided Sep 23 2026)

Chris decided: all Swift. Draft 1 recommended Expo/React Native with Swift modules; draft 2 reverses that. Why:

- **The product is native feel.** Yui should behave like part of the phone: Apple's navigation, sheets, haptics, Dynamic Type, accessibility and the iOS 26 Liquid Glass look come free in SwiftUI and are imitations anywhere else.
- **The differentiators are Apple surfaces.** Live Activities and the Dynamic Island (a timer on the lock screen), widgets, App Intents (Siri, Shortcuts, Spotlight, Action button), the on-device Foundation Models framework, and on-device speech. In React Native every one of these is Swift glue anyway.
- **The preset design makes native cheap.** The app is a Yui Lines parser, roughly 13 presets, a chat view and a relay client. New screens arrive as data, so React Native's over-the-air updates buy little, and an Android port later is a port of the presets, not a redesign.

Rules that follow from the decision:

- **iPhone only for now. No Apple Watch app yet** (Chris, Sep 23). Revisit after the Phase 1 demo.
- **Yui Lines stays platform-neutral.** `spec/YL.md` plus a shared conformance suite (input lines, expected parse) is the contract. The JS parser (web playground) and the Swift parser must both pass it. An Android build later (Kotlin + Jetpack Compose) passes the same suite.
- **The web stays React.** The hub site and playground keep the JS renderer as the public, clickable reference.
- **Fast feedback loop.** The Mac mini builds and ships a TestFlight build on every push to main, so Chris sees each change on his phone in about 15 minutes with no cable. Requires full Xcode on the mini (today it only has Command Line Tools).
- **Target iOS 26.** It is the current release, it has Foundation Models and Liquid Glass, and a new app has no install base to protect.

## Architecture in one paragraph

Agents stay where they live (Hermes on the Mac mini today). Each agent connects to a small **Yui relay** (hosted, Cloudflare Workers + Durable Objects is a strong fit: one durable object per user session, websockets, cheap, global). The agent sends chat messages and UI documents to the relay; the relay pushes them to the phone (websocket when open, APNs push when closed). The phone sends taps, form results and voice transcripts back as events. A Hermes plugin/skill speaks the relay protocol, so "pull this up on Yui" from Telegram is one tool call. Data tables live on device (SQLite) with optional sync through the relay.

## Phases by month

Dates assume work starts the week of Sep 28 2026. Each phase ends with something Chris can touch.

### Phase 0 | late Sep to mid Oct 2026: foundations and the tracker site

Goals: a place to watch the project, and the protocol written down before any app code.

Deliverables:
- DONE Sep 23: hub site (roadmap, progress log, business plan draft, deck outline, mockups), source on GitHub at postscarcityai/yuigui.
- DONE Sep 23: Yui Lines v0 (spec, 12 presets, JS parser, web playground, token benchmark). Replaces the JSON protocol from draft 1.
- DONE Sep 23: yuigui.com live, built in public (progress log per ship, weekly update Fridays).
- DONE Sep 23: waitlist on yuigui.com, stored in `yui_waitlist` in the existing PostScarcity AI Supabase project (PROOF). All Yui tables use the `yui_` prefix there; no new Supabase instance.
- DONE Sep 23: Apple Developer account (Chris, individual enrollment, no D-U-N-S).
- Yui Lines conformance suite (the contract the Swift parser must pass), theme schema (colors, avatar, voice per agent), event schema (tap, submit, voice).
- Full Xcode on the Mac mini and a TestFlight pipeline, so Phase 1 starts shipping on day one.
- Clickable web mockups of the three canonical screens: chat, Arnold interval timer, nutrition photo log.
- Telegram quick win for the current fleet: inline keyboard buttons for yes/no and multiple choice on Hermes questions. This fixes his top pain ("I just want a button") in days, not months, and doubles as the fallback path.

Dependencies: Xcode finishing its install on the Mac mini.

### Phase 1 | now to end Nov 2026: talk to your own Hermes agents in Yui

Goals: Chris talks to each of his Hermes agents in the app, gets GUI answers back, and can hand a Telegram conversation over to Yui with one push.

How it plugs in: **Yui is a Hermes messaging platform**, built as a Hermes platform plugin, the same way Telegram is. Each agent keeps one brain and one memory across Telegram and Yui. Each Hermes profile shows up in the app as its own agent with its own thread. The plugin dials out to the relay (Supabase Realtime today), so the Mac needs no open ports.

Deliverables, in build order:
- DONE: SwiftUI app on TestFlight, Korean-cute theme with light/dark, typographic identity (coral wordmark, letter avatars), coral wordmark icon. Yui Lines Swift parser passing the shared conformance suite.
- YUI-4: first 6 presets in chat (ask, choose, pick, form, list, timer).
- YUI-6: accounts. Sign in with Apple, and in-app account deletion as App Store rule 5.1.1(v) requires, including Apple token revocation. Yui users are kept fully separate from any other PostScarcity data.
- YUI-7: the Hermes `yui` platform plugin. Pairing by code, one thread per agent (urza and Arnold first), agents taught Yui Lines so they answer with screens, taps flow back as messages.
- YUI-8: push handoff. From Telegram, "send it to Yui" drops the screen into that agent's thread and sends a push that opens it.
- YUI-5: coral wordmark across the UI.

Dependencies: an Apple key with Push Notifications and Sign in with Apple (browser step for Chris, free).

### Phase 2 | December 2026: many agents, identities, cross-channel

Goals: Yui is a hub, not an Arnold app.

Deliverables:
- Agent list with per-agent theme, avatar and voice. Urza, Arnold, R0SS all connected.
- Three screens per agent (chat plus two agent-controlled slots), with animated transitions.
- Push notifications with deep links to a generated screen.
- Cross-channel handoff: from Telegram, "pull this up on Yui" pushes the screen to the phone.
- Voice input via Apple's on-device Speech framework, per-agent default of talk vs type.
- Live Activity for the timer preset: rounds keep counting on the lock screen and Dynamic Island.

Dependencies: Phase 1 relay stable. APNs key from the Apple account.

Phase 2 also carries the immersive work (North star 1 and 2): the full-screen stage with swipe-down or X to exit, full-screen workouts with a lock-screen Live Activity, and hands-free voice in with text out.

### Phase 3 | January 2027: data and keys

Goals: agents can make things that persist.

Deliverables:
- On-device tables: agents create tables and rows through the protocol (`table.create`, `row.upsert`, `query`). Views render as table, list, or chart. Starter schemas: workout log, macros, simple CRM.
- Key vault in the iOS Keychain for BYO keys: fal, Replicate, OpenRouter, Anthropic.
- Image generation through the user's own fal key (agent avatars first, then in-chat images).
- Nutrition demo: photo of a meal to macro estimate to a row in the macros table.
- Optional encrypted sync of tables via the relay (off by default, on-device first per Chris).

Dependencies: Phase 2. Decision on whether sync is needed at all for v1.

### Phase 4 | February 2027: onboarding and a built-in agent

Goals: someone with no agent can download Yui and start.

Deliverables:
- Hosted default agent (runs on the relay, model via OpenRouter on the user's key at first).
- Generative onboarding interview: name form, AI-knowledge slider, "what do you want to do" with a mic button, then starter agents suggested (trainer, nutritionist, personal assistant).
- Connector library v0: MCP servers the user logs in to via OAuth (HubSpot, Google Calendar, Gmail first).

Dependencies: Phase 3 vault. Cost model for hosted agent calls.

### Phase 5 | March 2027: open adapters and a private beta

Goals: other agent owners can plug in.

Deliverables:
- Other people's Hermes installs connect through Hermes's relay connector contract (`hermes gateway enroll`): Yui hosts the connector, the user enrolls once, their agents appear in the app. Same plugin behavior, no code on their side.
- Published Yui Lines spec and adapters: Hermes (done), OpenClaw-style frameworks, a generic HTTP/webhook adapter, an MCP server so any MCP-capable agent can render to Yui.
- Private beta, 20 to 50 technical users from the Hermes/OpenClaw communities.
- App Store review prep: privacy labels, review notes explaining the component-catalog approach, demo account.
- SMS channel (text a number, get a push that opens the screen).

Dependencies: beta invite list, App Store submission sign-off from Chris.

### Phase 6 | April to June 2027: money, polish, on-device

Goals: the "put in your credit card and go" version.

Deliverables:
- In-app purchase credits for image generation and hosted model usage (keys stay optional for power users).
- On-device Foundation Models for routing and quick replies, cutting cloud cost and latency.
- Widgets for agent dashboards, App Intents for Siri, Shortcuts and the Action button.
- Design system v1 from beta feedback.
- Decision gate: Android port (Kotlin + Jetpack Compose against the same Yui Lines suite), Apple Watch app, public launch.

Dependencies: beta learnings, payments setup (financial, needs Chris).

### Preset library | what agents can build on your screen (Chris, Sep 24)

Simple first, flexible combinations always: layout and style are props, so a handful of presets cover a lot of experiences. Each family ships in the web playground first, then natively in the app.

- **Media (YUI-16):** gallery of images and videos with layouts feed, flat row, 3D row and grid; single video; before/after compare (slider, side by side, toggle) with highlights pointing at what changed; storyboards for videos, sites and posts with reorder and per-frame notes; image edit where you mark an area and say what to change.
- **Data and science (YUI-17):** line, bar, area, scatter, pie charts, live from agent tables; big-number stats with sparklines; rendered equations; a formula tool whose sliders redraw a chart as you move them; step-by-step derivations and protocols.
- **Learn and plan (YUI-18):** presentations built on any topic you want to understand, with generated images and a quiz at the end; plan mode, a guided set of questions that ends in a project; narrated walkthroughs where the agent talks you through what changed, before and after, step by step.
- **Media pipeline (YUI-21):** agents generate and send real images and videos into Yui; your photos go back to the agent.
- **Native versions (YUI-19)** of all of the above.

### Every agent looks like itself (YUI-20)

Chris, Sep 24: in most agent tools every agent sits in the same interface and the only tell is a tiny ID in a corner. In Yui each agent has its own color scheme, with light and dark, its own feel, and its preferred kinds of screens. Open Arnold and the whole app is Arnold's. Ask an agent to change its look and it restyles itself.

### Look and feel | friendly by default, restyled by agents later

Chris, Sep 23: friendlier, a South Korean aesthetic, happy-cat energy, a little fun by default, light and dark mode. v1 (card YUI-2): soft pastels, rounded type, gentle spring motion, warm microcopy. The identity is typographic only (card YUI-9): the coral bunny-ear wordmark already reads as an abstract cat, so there is no mascot. Yui's avatar is the wordmark's Y; each agent gets its initial on a pastel chip.

**Generative app styling (future).** All styling lives in one token set (colors, radii, type, motion, agent avatar colors) stored as plain data, not code. That makes the app itself restylable at runtime: an agent sends a `theme` line in Yui Lines (for example `theme peach round`) or a full token set, and the whole app re-skins, within guardrails that keep contrast readable and tap targets big. Per-agent themes (Arnold in Arnold's colors) are the first use; a user asking "make Yui feel like autumn" is the second. Target: Phase 2 for per-agent themes, Phase 4 for user-requested restyles.

### Parallel track | Telegram fallback (any time)

If Apple rejects the app or it stalls, Telegram already supports most of what the pitch needs: inline keyboards with callback buttons, reply keyboards, and **Telegram Mini Apps** (full web apps inside Telegram, with theme colors, haptics, and cloud storage). The same Yui Lines can render as a Mini App using the web renderer. This is the insurance policy, and Phase 0 already starts it.

## Cloudflare

Chris mentioned a new Cloudflare deploy-anywhere agent he thinks is called "Flue". I have not verified that product name. Cloudflare's Agents SDK (Workers + Durable Objects, websockets, scheduling, built-in MCP support) is the confirmed fit for the Yui relay and hosted agent. Research card to confirm "Flue" and whether it changes anything. His point about Cloudflare gating the agentic web (bot blocking) is relevant to connectors that scrape; Yui should prefer official APIs and MCP.

## What stays out of scope for now

- A realistic human avatar you talk to (Chris: "I don't think we're going to do that right now").
- White label.
- Our own payment processing before Phase 6.
- Running the Claude CLI on the phone. Mobile goes through APIs (OpenRouter or Anthropic keys).

## Risks

1. App Store review. Mitigated by the component-catalog design and the Telegram Mini App fallback.
2. Generative UI quality. Agents will produce ugly or broken screens. Mitigated by strict schema validation, a small catalog, and the protocol skill with examples.
3. Shared Claude quota. Heavy agent use through the Max pool affects the whole fleet. Yui on OpenRouter keys keeps it separate.
4. Scope. Every phase above is cut to one demo that works. New ideas go on the board, not into the current phase.

## Open questions for Chris

1. ANSWERED Sep 23: all Swift, iPhone first, no Watch yet, Android later.
2. ANSWERED Sep 23: yuigui.com goes live now. Built in public.
3. ANSWERED Sep 23: enrolled and paid, no D-U-N-S. Trademark search deferred until there is something to protect.
4. Should R0SS's AMC agent be in Yui at all, given client confidentiality, or is Yui personal agents only (urza, Arnold) for now?
5. Is Yui a product you intend to sell, or a personal tool that might become one? It changes how much Phase 4 to 6 matters.

## Next actions (proposed cards, not yet created)

- DONE: hub site, Yui Lines v0, GitHub repo.
- yuigui.com on the hub site, weekly build-in-public updates (urza).
- Yui Lines conformance suite (urza).
- Xcode + TestFlight pipeline on the Mac mini (urza, needs the Apple Developer account).
- Telegram inline-keyboard buttons for Hermes yes/no and multiple-choice asks (urza, infra).
- Research: Cloudflare "Flue", Agents SDK pricing, Telegram Mini Apps limits (urza).
