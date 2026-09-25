# Yui AG-UI bridge | spec v1 (INT-21 step 1, Sep 25 2026)

Path B of `spec/ADAPTERS.md`, beside the A2A bridge, run on your own machine for now. The code lives in the app repo, [postscarcityai/yui `adapters/agui/`](https://github.com/postscarcityai/yui/tree/main/adapters/agui); this page is what an agent's owner needs to know.

Add any agent served over [AG-UI](https://docs.ag-ui.com) to Yui by its endpoint URL: Microsoft Agent Framework (`add_agent_framework_fastapi_endpoint`), CopilotKit runtimes, Mastra, Pydantic AI, LangGraph's AG-UI adapter, or anything else that takes a `RunAgentInput` and streams AG-UI events back. The agent needs no Yui code.

```
 Yui app  <-->  Yui (rows in yui_messages)  <--dials out--  bridge  --AG-UI run-->  the agent (its endpoint URL)
```

AG-UI is an agent-to-frontend protocol, and a frontend is what Yui is. Where A2A treats Yui as another agent handing over a task, AG-UI treats it as the app the agent draws in: the client sends the thread and the tools it offers, and the agent streams its words and tool calls back. So Yui screens become a tool.

## Five minutes

Needs Node 22.18 or newer. No dependencies.

1. In the Yui app: **Agents > Add agent**. It shows a 6-digit code.
2. On your computer:
   ```
   git clone https://github.com/postscarcityai/yui && cd yui/adapters/agui
   node yui-agui.ts check http://127.0.0.1:8000/
   node yui-agui.ts pair 123456 --url http://127.0.0.1:8000/ --name "My agent"
   node yui-agui.ts run
   ```
   `check` runs the agent once and lists the events it sends. `pair` does the same first, so a wrong URL fails before the code is spent. An agent that wants a key takes `--header "authorization: Bearer <key>"`; it stays in the bridge's state file on your machine (mode 600).
3. Say hi in the app.

`node yui-agui.ts add --url <url> --name <name>` adds another agent on the same machine, no code needed.

## How a conversation maps

| Yui | AG-UI |
| --- | --- |
| an agent | one endpoint URL |
| its thread | one thread, `threadId` = the Yui agent's id. AG-UI servers keep nothing between runs, so the bridge keeps the thread (the last 60 messages) and sends it with every run |
| a turn (the person's messages since the last answer) | one run, `runId` fixed by the rows it carries |
| the answer | the assistant's text, then any screens |
| a screen | a call to the frontend tool `yui_show(lines)`: the run ends there, and the lines reach the phone as a ` ```yui ` fence |
| a tap on that screen | the result of that call, in the next run: `[yui] n1 pick choice=Tea` |
| typing instead of tapping | the call's result says the screen was shown and they wrote back instead; their words follow as a user message |
| the agent pauses for the person (`RUN_FINISHED`, outcome `interrupt`) | the interrupt's message lands; the person's next message goes back in `resume` (and as words) |
| `RUN_ERROR`, or the server refuses the request (4xx) | the person reads one line saying so, then the reason. No retry loop |
| `STATE_SNAPSHOT` | kept, and sent back as `state` on the next run |

### Screens are a frontend tool

The bridge offers one tool on every run:

```json
{ "name": "yui_show",
  "description": "Show a screen on the person's phone in Yui. `lines` is Yui Lines, one element per line, no code fence ... The run ends here: what the person taps comes back as this tool's result.",
  "parameters": { "type": "object", "properties": { "lines": { "type": "string" } }, "required": ["lines"] } }
```

A tool the client offers is declaration-only on an AG-UI server: when the model calls it the run ends and the client does the work. That is AG-UI's own human-in-the-loop pattern, and it is exactly a Yui screen. The tap goes back as a `tool` message with the call's id, so the model reads it as the answer to its question, not as something the person typed. `lines` may be a string, a list of lines, or wrapped in a fence; the bridge normalises it.

An agent that writes a ` ```yui ` fence in its text instead (what the channel guide teaches everywhere) still works; its taps come back as the person's words, as on every other channel.

### Where the guide rides

| `--guide` | the channel guide goes | notes |
| --- | --- | --- |
| `system` (default) | a system message at the top of every run | never stored in the thread. Agent Framework passes client system messages to the model |
| `tool` | `yui_show`'s description | the one part every AG-UI server is sure to hand the model |
| `context` | AG-UI's `context` array | Agent Framework drops `context` unless A2UI is on, so not the default |
| `off` | nowhere | `yui_show`'s own description still explains the tool |

### Exactly once, drops and restarts

- The relay rules are the A2A bridge's, from the same shared code (`adapters/a2a/src/relay.ts`): the person's rows are marked delivered when a turn starts and handled once its answer is written; every answer names its rows in `meta.turn`; replies wait in an outbox on disk until Yui has them.
- An AG-UI run can't be rejoined, so a dropped stream, a 5xx or a crash runs the turn again. The turn is on disk before the run starts, and the thread only moves on when a run settles, in the same save as the reply. The second run has the same `runId` and the same messages.
- A stream silent for 5 minutes counts as dropped. One turn at a time per agent; anything sent meanwhile goes in together as the next turn.

## Tested

- **Unit, 18 tests, no network:** folding runs (text and chunk events, tool calls with and without a parent message, a server tool with its result, state, interrupts, errors), the wire (a recorded Agent Framework stream in 37-byte pieces, 4xx, 5xx, a cut stream, a silent stream) and the bridge's turns against a scripted AG-UI server replaying Agent Framework's recorded events: the screen, the tap as the tool's result, typing instead of tapping, each guide mode, the same run after a drop, errors told once, interrupts and resume.
- **Live, 16 of 16 (Sep 25):** Microsoft Agent Framework's own AG-UI endpoint (agent-framework-ag-ui 1.4.0, ag-ui-protocol 0.1.22), one agent on local Ollama qwen2.5:7b whose instructions never mention Yui, through live Yui on a throwaway account. A wrong URL failed before the code was spent; it paired; answered a turn once; asked for a drink, the model called `yui_show` with `pick "Afternoon drink?" Tea|Coffee` on the first try and the run ended there; the tap went back as the tool's result and was answered once; the next turn remembered Tea; a `kill -9` mid-turn was answered once after the restart; a clean stop read offline; the account was deleted.

Not tested yet: CopilotKit, Mastra, Pydantic AI and LangGraph's AG-UI adapter. They speak the same events; each gets a live run when its card comes up.

## Open question for Chris: A2UI

A2UI is Google's declarative UI format: the agent sends a JSON tree of components (cards, buttons, text fields) plus a data model, and the client renders it from its own catalog. Agent Framework can inject it over AG-UI (`a2ui_config`), and it is the only way Agent Framework hands AG-UI's `context` to the model.

Should Yui accept A2UI as a second input format beside Yui Lines?

- **For:** agents that already emit A2UI (Agent Framework with A2UI on, Google's samples, some CopilotKit apps) would draw in Yui with no guide at all. It is a published spec with its own component catalog, so it is not something we invent.
- **Against:** it is the component-tree JSON that Yui Lines exists to replace. Our benchmark (`spec/BENCHMARK.md`) has tree JSON at about 3.9 times the tokens of YL for the same screens. Two input formats means two renderers to keep in step, or a translator whose gaps show up as broken screens. And YL's one-line-per-element shape is what makes screens stream, patch (`~stat`) and reach Telegram and the MCP App.
- **Middle way:** a one-way translator in the bridge, A2UI to YL, for the components that map cleanly (text, button, choice, text field, card, list), with anything else shown as plain text. Yui itself keeps one format.

Recommendation: not now. YL stays the only format the app reads. If agents that emit A2UI start asking to join, the translator in the bridge is the cheap step, and it stays out of the app. Nothing is built for A2UI in step 1.

## Step 2

The same client (`src/agui.ts` is runtime-neutral: fetch and the SSE parser) runs inside Yui's hosted connector with the A2A client, so nobody runs a bridge. That waits on INT-20 and a Cloudflare account.
