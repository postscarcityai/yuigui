# Yui | pitch summary (rec 366, Sep 23 2026)

Source: `~/dev/yui/pitch/rec366.txt` (whisper transcript of "New Recording 366.m4a", ~3,400 words). The recording calls the project "Nexus" / "Project Nexus". It is now **Yui** (yuigui.com).

## The idea in one line

A mobile app that is a front end for your AI agents: you talk or type to an agent, and the agent can take over the screen and generate UI on demand (timers, forms, lists, dashboards) inside a shared design framework.

## What Chris said, in his words

- "I'm obsessed with this idea of generative UI... it can be totally unique each time."
- "The default state is you can just talk to it and it's a vessel for communication. And then also it can just take over the screen at any time and generate UI for you."
- "Hey Arnold, I want to do a countdown timer."
- "If it asks me a question, I just want a button."
- "Our real value proposition is its ability to be able to just like show you whatever you want."
- "Probably for V1, I would love it to just plug into my open claw... my early adopters of this are going to be open claw users."
- "The goal is that you download this app, you put in your credit card and you're off to the races with a multi-agent in your life."
- "You're not going to one shot this whole company."

## Core requirements

1. Mobile app, one App Store listing, many agents hooked in (Hermes first, OpenClaw-style frameworks, later a built-in agent).
2. Chat is screen one. Agents can open and drive other screens (he suggests about three).
3. Generative UI within guidelines: a component toolkit like shadcn, UX rules baked in, smooth animation, big buttons. Two users should get wildly different apps.
4. Per-agent identity: color scheme, face/avatar, voice. Arnold looks and talks like Arnold.
5. Structured asks: yes/no buttons, multiple choice, multi-select, always a free-text escape hatch (modeled on Claude's plan mode).
6. Cross-channel: talk on Telegram, say "pull this up on Yui", get a push notification that deep links to the screen the agent built. SMS and voice too.
7. Agent-created data: tables/spreadsheets per user (CRM, workouts, macros), on device where possible.
8. Connectors: an MCP library you log in to (HubSpot is his example).
9. Bring-your-own keys first (fal, Replicate, OpenRouter, Claude). Credits and in-app purchase later. Plug into outside services first, bring them in house over time.
10. Onboarding for people with nothing set up: an interview that itself is generative UI (name form, AI-knowledge slider, mic button), then suggested starter agents (trainer, nutritionist with photo macro tracking).

## Questions he asked the plan to answer

- React Native vs Swift, and what native agent features Swift gives.
- How to do dynamic databasing.
- Cloudflare's new deploy-anywhere agent (he thinks it is "Flue") and how to use it.
- A Telegram fallback: what custom UI Telegram already supports if the app never gets approved.
- On-device AI (speech, TTS, models) down the road.
- Names (now settled: Yui).

## Asks for the build process

- A Vercel site first: project tracker, early mockups, business plan, pitch deck.
- Always have something small working. Work fast. Chris gets progress updates, not homework.
- Personal project first. White label is not a priority.

Full roadmap: `~/dev/yui/ROADMAP.md`.
