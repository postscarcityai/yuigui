---
card: INT-14
repo: postscarcityai/yuigui
title: "Adapter: LangGraph agents in Yui"
labels: help wanted, area:adapters
---
LangGraph agents should be able to talk in Yui. Most can already, through A2A. Deployments without A2A need a thin adapter over LangGraph's threads and runs API.

## Context

- The A2A bridge: `spec/A2A.md` in this repo, code in [postscarcityai/yui `adapters/a2a/`](https://github.com/postscarcityai/yui/tree/main/adapters/a2a).
- The adapter plan, section "LangGraph": `spec/ADAPTERS.md`.
- The webhook bridge, the simplest adapter to copy from: [postscarcityai/yui `adapters/webhook/`](https://github.com/postscarcityai/yui/tree/main/adapters/webhook).

## What to do

Step 1, small: prove a LangGraph agent served over A2A works with the bridge. Add a "LangGraph" section to `spec/A2A.md` with the setup and what you saw.

Step 2, bigger: for deployments without A2A, a small adapter that maps a Yui thread to a LangGraph thread and each turn to a run. Put it next to the other adapters in the app repo, same rules as the webhook bridge (dials out, no open ports, every message once, in order).

## Done when

- Step 1: the section exists, with the LangGraph version, and an example graph with no keys in it.
- Step 2: the adapter has tests that run against a local LangGraph server, and a README with five-minute steps.

Step 1 alone is a welcome pull request.
