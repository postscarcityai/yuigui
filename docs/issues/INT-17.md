---
card: INT-17
repo: postscarcityai/yuigui
title: "Adapter: n8n community node, Yui send screen and wait for answer"
labels: help wanted, area:adapters
---
n8n workflows can already reach Yui two ways: the AI Agent node through the MCP Client Tool (Yui MCP server), or any workflow through the webhook bridge. A community node would make it drag and drop: "Yui: send screen" and "Yui: wait for answer".

## Context

- The Yui MCP server: `spec/MCP.md`. The node can call its tools (`yui_show`, `yui_answers`, `yui_say`) over HTTP.
- The screen language: `spec/YL.md`, and the playground at yuigui.com/playground to try lines.
- The adapter plan, section "n8n": `spec/ADAPTERS.md`.

## What to do

1. Step 1, small: an n8n workflow (exported JSON) that uses the MCP Client Tool to show a choice on the phone and branch on the tap. Add an "n8n" section to `spec/MCP.md`.
2. Step 2: a community node package, `n8n-nodes-yui`, with two operations: send a screen (Yui Lines in, screen id out) and wait for the answer (screen id in, the tap out). Credentials hold the connection token.

## Done when

- Step 1: the section and the workflow JSON are in the pull request.
- Step 2: the node builds, has tests, and its README follows n8n's community node rules.
- No tokens in any file.
