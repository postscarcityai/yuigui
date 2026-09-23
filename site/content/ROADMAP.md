# Yui | roadmap v1 (2026-09-23)

Source: pitch recording 366 (21.6 min), transcript at ~/dev/yui/pitch/rec366.txt.
Domain: yuigui.com. Working name in the recording was "Project Nexus".

## The product in one line
A mobile agent hub. Default state is a chat with your agent. The agent can take over the
screen at any time and generate UI for you: a timer, a form, a multi-select, a table, a dashboard.

## Core bets
- Generative UI is the value. Not templates. Two people should get wildly different screens.
- Guardrails come from a component kit + UX rules (shadcn-style primitives, big buttons, CTAs, smooth transitions).
- Bring your own agent first. Early adopters are Hermes/OpenClaw "lobster" users. Chris is user zero.
- Plug into outside services first (BYO API keys: OpenRouter, fal, Replicate), bring them in-house later.
- Any channel: app, Telegram, SMS, voice. "Pull this up on Yui" from Telegram pushes a notification that deep-links to the screen.

## Architecture (recommended)
1. **Yui UI protocol**: the agent emits a JSON UI spec (components + props + actions), not raw code. Safe, fast, renders natively, themeable per agent.
2. **Component kit**: text, buttons, single/multi-choice with "type your own", forms, slider, timer/intervals, list, table, image, chart, camera capture, mic button.
3. **Relay** (Cloudflare Workers + Durable Objects): holds sessions, routes agent to app, sends push. Evaluate Cloudflare's new agent stack ("Flue", name to confirm).
4. **Hermes connector**: a Hermes plugin that gives any agent a `yui_render` / `yui_push` tool plus a skill that teaches it the protocol and UX rules.
5. **App**: Expo (React Native). One codebase for iOS, Android, and the web preview. Swift native modules where Apple has the edge.

### React Native vs Swift (Chris asked)
- Pick Expo/React Native for V1. It renders a JSON spec into native views, ships to both stores, shares code with the web hub, and has OTA updates.
- Swift's edge: Apple Foundation Models (on-device LLM), App Intents/Siri, Live Activities (a workout timer on the lock screen), widgets, on-device speech. We get these as Expo native modules when needed, no rewrite.

## Phases
| # | When | Ship | Proof |
|---|---|---|---|
| 0 | Week 1 | Hub site on Vercel: roadmap, progress log, business plan, pitch deck, early mockups | Live URL |
| 1 | Weeks 1-3 | Yui UI protocol v0 + component kit + web renderer playground in the hub | Spec renders in the browser |
| 2 | Weeks 2-5 | Relay + Hermes connector. Arnold is first: "countdown timer", "intervals of 40/20 x 8", "list my workout" | Chris asks Arnold on Telegram, the screen appears |
| 3 | Weeks 4-8 | Expo app on TestFlight: chat default, 3 screens, mic button, push notifications with deep links, per-agent color + face | Chris's phone |
| 4 | Weeks 8-12 | Onboarding interview built in gen UI (name, AI-level slider, goals by voice). Starter agents: trainer, nutritionist (photo to macros). BYO keys in the keychain | New user from zero to first agent |
| 5 | Q1 2027 | Data layer: agent-created tables (on-device SQLite first, sync later). MCP connector library (HubSpot first). SMS channel | CRM + workout tables live |
| 6 | Q1-Q2 2027 | App Store submission, hosted agents for non-lobster users, credits/payments, on-device AI, context modes (at work = text only) | Public listing |

## Side tracks
- Telegram fallback: inline keyboards for yes/no and multiple choice now, Telegram Mini Apps as a no-App-Store path. Cheap win for the fleet today.
- White label: parked. Personal project first.
- Avatar/face per agent now, a real talking persona much later.

## Needs Chris (only these)
- Apple Developer account ($99/yr) before TestFlight in Phase 3.
- Sign-off on any spend (domains, paid APIs, Apple fee).
