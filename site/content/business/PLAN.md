# Yui | business plan in one page

Draft 3, Sep 24 2026. This page replaces the old /plan and /deck pages (SITE-13). The detail lives in the BIZ docs on the business page; where they differ, the BIZ doc wins. What is built and when lives on the [roadmap](https://www.yuigui.com/roadmap).

## Problem

People who run personal AI agents talk to them through text channels like Telegram. Text is fine for conversation and bad for everything else. A yes or no question should be two buttons. A workout should be a timer. A pipeline should be a table. Today the agent can only describe these things.

## Solution

Yui is one iPhone app that an agent plugs into. Chat is the home screen. The agent can draw a screen at any time, in the chat or full screen: buttons, choices, forms, timers, lists, charts, pictures.

The agent sends Yui Lines, one short line per screen element, never code. The app is native SwiftUI and draws each line with a built-in preset. That keeps it safe, fast and native, and lets every agent carry its own colors and feel.

## Who it is for, in order

1. People who already run Hermes. They have the agent and lack the screen. This works today.
2. People who run other agents (OpenClaw, MCP agents, anything that can send an HTTP request). Adapters come after the MVP.
3. Everyone else, later: download the app and get a starter agent through a guided interview.

## Business model

The full reasoning, with comparables and Apple's rules, is [BIZ-3 revenue models](https://www.yuigui.com/business/biz-3-revenue-models). The short version:

- The open core is free forever for anyone who brings their own agent and keys.
- Money comes only from things that cost real money to run: image and voice generation, hosted agents, hosting other people's agents, with a published margin.
- Nothing is priced until the beta measures real cost per user.

## Why now

- Personal agents moved from demos to daily tools in 2026. Their owners hit the text ceiling every day.
- Models reliably emit short structured lines, and iOS 26 gives a native app on-device models, speech, Live Activities and Siri hooks that a web wrapper cannot reach.
- Hosted realtime databases make an always-on relay between agent and phone cheap to run. Yui's runs on Supabase Realtime today.

## Edge

- Native, not a web view: the screens are SwiftUI, with the phone's own feel.
- Agent-agnostic: any agent can drive it, so nobody has to switch frameworks.
- Generative by default: screens are built for one person in the moment, not picked from a gallery.
- Open source (Apache-2.0), built in public.

Competitors and how Yui is different: [BIZ-1 competitors](https://www.yuigui.com/business/biz-1-competitors).

## Milestones

The first draft planned twelve weeks to a TestFlight build. It took two days. Sep 23: this hub, Yui Lines, the native app on TestFlight. Sep 24: the Hermes plugin, pushes, a first run with no guessing, safety limits, and the public beta sent to Apple's review.

Next: an outside tester runs the whole path alone (the MVP test), then voice and adapters for other agent frameworks. After that: starter agents, the data layer and connectors, then the App Store. Those have no dates yet. The [roadmap](https://www.yuigui.com/roadmap) has the current order.

## Risks

The current list, with what we do about each, is in the roadmap's Risks section: App Store review of an app with no built-in agent, bad screens, a shared backend open to strangers, and nobody outside having run the whole path yet.
