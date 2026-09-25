---
card: INT-9
repo: postscarcityai/yuigui
title: "Adapter: Gemini agents built with Google's ADK, through A2A"
labels: help wanted, area:adapters
---
Agents built with Google's Agent Development Kit (ADK) can serve A2A. Yui has an A2A bridge. We want an ADK agent talking in Yui, proved and written down.

## Context

- The A2A bridge: `spec/A2A.md` in this repo, code in [postscarcityai/yui `adapters/a2a/`](https://github.com/postscarcityai/yui/tree/main/adapters/a2a).
- The adapter plan, section "Gemini": `spec/ADAPTERS.md`. Plain Gemini models (no agent) go through a model connector instead; that is a separate card.

## What to do

1. Build the smallest ADK agent that serves an Agent Card.
2. Add it to Yui with the bridge's five-minute steps (Yui TestFlight app, your own account).
3. Try plain answers, a long task, and a question back. Try asking it to draw a screen using `spec/CHANNEL.md`.
4. Add a "Gemini and ADK" section to `spec/A2A.md`.

## Done when

- The section is in `spec/A2A.md`, with the ADK version.
- The example agent is in the pull request, with no keys in it.
- What broke is listed.
