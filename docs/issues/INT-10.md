---
card: INT-10
repo: postscarcityai/yuigui
title: "Adapter: Grok calls the Yui MCP server as a remote tool"
labels: help wanted, area:adapters
---
xAI's API takes remote MCP servers as tools in the request. Yui has a remote MCP server that puts screens on a phone. So a Grok agent should be able to show a timer or a choice on your phone and read the tap back. We want that proved and written down.

## Context

- The Yui MCP server: `spec/MCP.md` (endpoint, auth with a connection token from the app, the four tools).
- The adapter plan, section "Grok": `spec/ADAPTERS.md`.

## What to do

1. Get a connection token from the Yui TestFlight app (your own account).
2. Call the xAI API with the Yui MCP server as a remote tool. Ask Grok to put a choice on your phone, tap it, and have Grok read the answer.
3. Add a "Grok" section to `spec/MCP.md` with the request shape and what you saw.

## Done when

- The section is in `spec/MCP.md`, with a minimal example in Python or Node.
- The example reads the key and token from the environment. No keys in the pull request.
- What broke is listed.
