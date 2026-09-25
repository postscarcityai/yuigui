---
card: INT-15
repo: postscarcityai/yuigui
title: "Adapter: CrewAI agents in Yui through A2A"
labels: good first issue, help wanted, area:adapters
---
CrewAI can serve a crew as an A2A agent. Yui already has an A2A bridge, so a CrewAI crew should be able to talk in Yui with no new bridge code. We want that proved and written down.

## Context

- The A2A bridge: `spec/A2A.md` in this repo, code in [postscarcityai/yui `adapters/a2a/`](https://github.com/postscarcityai/yui/tree/main/adapters/a2a).
- The adapter plan, section "CrewAI": `spec/ADAPTERS.md`.
- The channel guide agents read to draw screens: `spec/CHANNEL.md`.

## What to do

1. Serve a small CrewAI crew over A2A (any model you have).
2. Add it to Yui with the bridge's five-minute steps (you need the Yui TestFlight app and your own account).
3. Chat with it. Check plain answers, a long task, and a question the crew asks back.
4. Write what you found as a "CrewAI" section in `spec/A2A.md`: the smallest crew that works, what maps well, what does not.

## Done when

- The section is in `spec/A2A.md`, with the exact CrewAI version you used.
- The example crew is in the pull request, small and runnable, with no keys in it.
- Anything that broke is listed, even if you did not fix it.
