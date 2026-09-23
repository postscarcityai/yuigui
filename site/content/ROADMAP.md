# Yui | roadmap (draft 1, Sep 23 2026)

yuigui.com. Generative UI front end for your AI agents. Source: Chris's pitch recording 366 (transcript `~/dev/yui/pitch/rec366.txt`, summary `~/dev/yui/pitch/SUMMARY.md`). The recording calls it "Nexus". This document says Yui throughout.

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

## Stack recommendation: React Native (Expo) now, Swift modules where native wins

Chris asked for education here, so the short answer with reasons:

- **Expo / React Native for the app shell.** One codebase for iOS and later Android, over-the-air updates for JS changes, and component-catalog work maps closely to the shadcn/React mental model he already knows. Fastest path to TestFlight.
- **Swift native modules, added as needed**, for the things only native does well:
  - App Intents: Siri, Shortcuts, Spotlight and the Action button can call "Ask Arnold to start intervals" without opening the app.
  - Apple Foundation Models framework (on-device model, iOS 26): free, private, offline routing and short replies. Good for "is this a UI request or a chat message" before paying for a cloud call.
  - On-device speech-to-text and text-to-speech: covers the mic button with no per-minute cost.
  - Live Activities and Dynamic Island: a workout timer that keeps running on the lock screen. This is the Arnold demo's killer feature.
  - Widgets and push with deep links into a generated screen.
- **Pure Swift/SwiftUI** would give the best feel and the easiest access to all of the above, but costs Android and slows early iteration. Revisit at month 6 if Android is off the table.

Open question for Chris below: confirm iOS first, Android later.

## Architecture in one paragraph

Agents stay where they live (Hermes on the Mac mini today). Each agent connects to a small **Yui relay** (hosted, Cloudflare Workers + Durable Objects is a strong fit: one durable object per user session, websockets, cheap, global). The agent sends chat messages and UI documents to the relay; the relay pushes them to the phone (websocket when open, APNs push when closed). The phone sends taps, form results and voice transcripts back as events. A Hermes plugin/skill speaks the relay protocol, so "pull this up on Yui" from Telegram is one tool call. Data tables live on device (SQLite) with optional sync through the relay.

## Phases by month

Dates assume work starts the week of Sep 28 2026. Each phase ends with something Chris can touch.

### Phase 0 | late Sep to mid Oct 2026: foundations and the tracker site

Goals: a place to watch the project, and the protocol written down before any app code.

Deliverables:
- Vercel site (on a `*.vercel.app` URL until Chris approves pointing yuigui.com at it): project tracker, this roadmap, pitch summary, early mockups, business plan outline, pitch deck outline.
- Yui UI Protocol v0: component catalog, JSON schema, theme schema (colors, avatar, voice per agent), event schema (tap, submit, voice).
- Clickable web mockups of the three canonical screens: chat, Arnold interval timer, nutrition photo log.
- Telegram quick win for the current fleet: inline keyboard buttons for yes/no and multiple choice on Hermes questions. This fixes his top pain ("I just want a button") in days, not months, and doubles as the fallback path.

Dependencies: none. Decision from Chris on the site domain.

### Phase 1 | mid Oct to end Nov 2026: prototype app, one agent, one screen that matters

Goals: Chris talks to Arnold in Yui and Arnold puts a timer on the screen.

Deliverables:
- Expo app on TestFlight (Chris's device only).
- Chat screen (text in, text out, streaming).
- Renderer for the first 6 components: text, button, choice (single, multi, free-text escape), form, list, timer.
- Yui relay v0 on Cloudflare, with pairing by QR code or code.
- Hermes skill + plugin: `yui_show(document)`, `yui_ask(question, options)`. Arnold wired first.
- Demo: "Hey Arnold, intervals 40 on 20 off, 8 rounds" renders a working timer with sound.

Dependencies: Apple Developer account in Chris's name (enrollment is a browser action for Chris, $99/yr, needs his sign-off). Arnold's owner is Arnold, so the Arnold integration is a card for Arnold's lane, not urza's.

### Phase 2 | December 2026: many agents, identities, cross-channel

Goals: Yui is a hub, not an Arnold app.

Deliverables:
- Agent list with per-agent theme, avatar and voice. Urza, Arnold, R0SS all connected.
- Three screens per agent (chat plus two agent-controlled slots), with animated transitions.
- Push notifications with deep links to a generated screen.
- Cross-channel handoff: from Telegram, "pull this up on Yui" pushes the screen to the phone.
- Voice input via on-device speech, per-agent default of talk vs type.

Dependencies: Phase 1 relay stable. APNs key from the Apple account.

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
- Published Yui UI Protocol spec and adapters: Hermes (done), OpenClaw-style frameworks, a generic HTTP/webhook adapter, an MCP server so any MCP-capable agent can render to Yui.
- Private beta, 20 to 50 technical users from the Hermes/OpenClaw communities.
- App Store review prep: privacy labels, review notes explaining the component-catalog approach, demo account.
- SMS channel (text a number, get a push that opens the screen).

Dependencies: beta invite list, App Store submission sign-off from Chris.

### Phase 6 | April to June 2027: money, polish, on-device

Goals: the "put in your credit card and go" version.

Deliverables:
- In-app purchase credits for image generation and hosted model usage (keys stay optional for power users).
- On-device Foundation Models for routing and quick replies, cutting cloud cost and latency.
- Live Activities for timers, widgets for agent dashboards, App Intents for Siri.
- Design system v1 from beta feedback.
- Decision gate: Android build, public launch, or keep it personal.

Dependencies: beta learnings, payments setup (financial, needs Chris).

### Parallel track | Telegram fallback (any time)

If Apple rejects the app or it stalls, Telegram already supports most of what the pitch needs: inline keyboards with callback buttons, reply keyboards, and **Telegram Mini Apps** (full web apps inside Telegram, with theme colors, haptics, and cloud storage). The same Yui UI Protocol documents can render as a Mini App. This is the insurance policy, and Phase 0 already starts it.

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

1. iOS first with Expo, Android later. OK?
2. Point yuigui.com at the tracker site now, or keep it on a vercel.app URL until there is something to show?
3. Apple Developer enrollment in your name or PostScarcity AI's (the org route needs a D-U-N-S number)? Either is a browser step for you plus $99/yr.
4. Should R0SS's AMC agent be in Yui at all, given client confidentiality, or is Yui personal agents only (urza, Arnold) for now?
5. Is Yui a product you intend to sell, or a personal tool that might become one? It changes how much Phase 4 to 6 matters.

## Next actions (proposed cards, not yet created)

- Vercel tracker site with roadmap, summary and mockups (urza).
- Yui Lines v0 grammar, 12 presets, web playground, token benchmark vs JSON (urza).
- Telegram inline-keyboard buttons for Hermes yes/no and multiple-choice asks (urza, infra).
- Research: Cloudflare "Flue", Agents SDK pricing, Telegram Mini Apps limits (urza).
