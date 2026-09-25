---
card: INT-12
repo: postscarcityai/yui
title: "Adapter: local model bridge for any OpenAI-compatible API (Ollama, LM Studio, vLLM)"
labels: help wanted, area:adapters
---
Ollama, LM Studio and vLLM all serve `/v1/chat/completions`. One small bridge, with a base URL, a model name and an optional key, would put any of them in Yui.

## Context

- Start from the webhook bridge: `adapters/webhook/` (Python and Node). It already does pairing, delivery rules and the outbox. Fork it, and swap the POST to your webhook for a chat completions call.
- The channel guide is the system message: `spec/CHANNEL.md` in [postscarcityai/yuigui](https://github.com/postscarcityai/yuigui). The bridge keeps the recent thread as the message list.
- The plan: yuigui `spec/ADAPTERS.md`, "Open-source models".

## What to do

1. `adapters/model/`: the bridge, stdlib or no dependencies, same state file rules as the webhook bridge.
2. `pair` and `run` commands like the webhook bridge, plus `--base-url`, `--model`, and a key read from an environment variable.
3. Tests against a fake chat completions server, and a manual run against Ollama.
4. A README with five-minute steps.

## Done when

- A local Ollama model answers in Yui, in order, once per message, across a restart.
- The guide goes in as the system message, and a model that follows it draws a screen.
- No keys in any file. Small models that cannot follow the guide still answer as plain text.
