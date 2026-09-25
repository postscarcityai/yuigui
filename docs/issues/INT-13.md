---
card: INT-13
repo: postscarcityai/yuigui
title: "Adapter: a Yui channel for Flue"
labels: help wanted, area:adapters
---
Flue (the open TypeScript agent framework from the Astro team) adds channels with `flue add channel <name>`. That writes a markdown blueprint the developer's coding agent merges in. A Yui channel would let any Flue agent talk in Yui.

## Context

- The adapter plan, section "Flue and Cloudflare Agents": `spec/ADAPTERS.md`. Hosting notes in `spec/HOSTING.md`.
- How a channel talks to Yui: `spec/RELAY.md`.
- A TypeScript client that already does this: the OpenClaw channel, [postscarcityai/yui `adapters/openclaw/`](https://github.com/postscarcityai/yui/tree/main/adapters/openclaw).
- What the agent needs to know to draw screens: `spec/CHANNEL.md`.

## What to do

1. Write the Yui channel blueprint in Flue's format. It should reuse the OpenClaw client's TypeScript where it can.
2. Run a Flue agent on Node with it, paired to your own Yui account (TestFlight app).
3. Add a "Flue" section to `spec/ADAPTERS.md` or a new `spec/FLUE.md` with the steps.

## Done when

- A Flue agent answers in Yui and can draw a screen.
- The blueprint and client are in a pull request with tests.
- The Flue version is written down. Running on Cloudflare is a later step, not needed here.
