---
card: INT-16
repo: postscarcityai/yuigui
title: "Spike: can Yui be an AG-UI client? (Microsoft Agent Framework)"
labels: help wanted, area:adapters
---
Microsoft Agent Framework (the successor to AutoGen) speaks A2A and AG-UI. A2A already works through Yui's bridge. AG-UI is an event stream from an agent to a front end, which is close to what Yui is. Several frameworks emit it. We want to know if Yui can be an AG-UI client, and what it would take.

## Context

- The adapter plan, section "AutoGen, now Microsoft Agent Framework": `spec/ADAPTERS.md`.
- How Yui turns an agent's reply into rows: `spec/A2A.md` "How a conversation maps", and `spec/RELAY.md`.
- Yui's screen language: `spec/YL.md`.

## What to do

A written spike, not production code.

1. Map AG-UI's events to Yui: text, tool calls, state, and anything that could become a Yui screen.
2. Try it: a small script that reads an AG-UI stream from a sample agent and prints what Yui would show.
3. Write it up as `docs/specs/ag-ui-spike.md`: what maps, what does not, and a recommendation (AG-UI adapter, A2A only, or both).

## Done when

- The write-up exists, cites the AG-UI and Agent Framework versions, and includes the script.
- Bonus: a line on Microsoft Agent Framework over A2A through the existing bridge.
