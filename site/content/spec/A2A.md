# Yui A2A bridge | spec v1 (INT-18 step 1, Sep 25 2026)

Path B of `spec/ADAPTERS.md`, run on your own machine for now. The code lives in the app repo, [postscarcityai/yui `adapters/a2a/`](https://github.com/postscarcityai/yui/tree/main/adapters/a2a); this page is what an A2A agent's owner needs to know.

Add any [A2A](https://a2a-protocol.org) agent to Yui by its Agent Card: agents built with Google's ADK, LangGraph, CrewAI, Microsoft Agent Framework, or anything else that serves `/.well-known/agent-card.json`. The agent needs no Yui code.

```
 Yui app  <-->  Yui (rows in yui_messages)  <--dials out--  bridge  --A2A-->  the agent (its card URL)
```

The bridge is one small process. It dials out to Yui and to the agent, so nothing listens on a port. Step 2 of INT-18 runs the same client inside Yui's hosted connector (`spec/HOSTING.md`), so nobody has to run anything; that step waits on a Cloudflare account.

## Five minutes

Needs Node 22.18 or newer. No dependencies.

1. In the Yui app: **Agents > Add agent**. It shows a 6-digit code.
2. On your computer:
   ```
   git clone https://github.com/postscarcityai/yui && cd yui/adapters/a2a
   node yui-a2a.ts card https://your-agent.example.com
   node yui-a2a.ts pair 123456 --card https://your-agent.example.com
   node yui-a2a.ts run
   ```
   `card` shows what the agent says about itself: name, protocol version, skills. An agent that wants a key takes `--header "authorization: Bearer <key>"` on `pair`; it stays in the bridge's state file on your machine (mode 600).
3. Say hi in the app.

`node yui-a2a.ts add --card <url>` adds another agent on the same machine, no code needed.

## How a conversation maps

| Yui | A2A |
| --- | --- |
| an agent | one remote agent, found by its card |
| its thread | one context: `contextId` is the Yui agent's id |
| a turn (what the person sent since the last answer) | one message; its `messageId` is fixed by the rows it carries |
| the working row in the app | the task is `submitted` or `working` |
| the answer | the task's text artifacts, then its final status message if it adds something |
| the agent asks something back | `input-required`: the question lands, and the person's next message continues that task |
| a tap on a screen | the tap's line (`[yui] <id> <preset> key=value`) as text, and its JSON as a data part |

- **The channel guide is a context part.** On the first message of each new task, Yui's channel guide goes in as a text part before the person's words, marked `metadata: {"yui": "channel_guide", "version": "..."}`. Yui cannot touch a remote agent's system prompt, so this is how it learns it can answer with [Yui Lines](/yl). An agent that hands it to its model can draw screens: put the lines in a ```` ```yui ```` fence. One that ignores it still works; its answers show as chat.
- **Text parts become the message.** A file part shows as its link. Data parts are skipped for now.
- **Failed, rejected or canceled:** the person reads one line saying so, then the agent's reason.
- **`auth-required`:** the person reads that the agent needs a sign-in first. Keys per agent, kept by Yui, are YUI-34.

## Streams, drops and restarts

- If the card says `streaming`, the bridge sends with `SendStreamingMessage` and reads the Server-Sent Events. If not, it sends and follows the task with `GetTask`, backing off to every 30 seconds.
- A dropped stream is picked back up with `SubscribeToTask`, then `GetTask` if the agent will not stream it.
- **A restart never sends a turn twice.** The task id is on disk as soon as the agent names it; after a crash the bridge resubscribes to that task and writes its answer once. In the short gap between sending and hearing the id, a crash means the same message goes again with the same `messageId`.
- **Exactly once into Yui**, with the relay's delivery rules (`spec/RELAY.md`): rows are marked delivered when the turn starts and handled once the answer is written, each answer names its rows in `meta.turn`, and answers wait in an outbox on disk until Yui has them.
- One turn at a time per agent; anything sent meanwhile goes in together as the next turn. Several agents run side by side.

## Versions

The JSON-RPC binding of both versions agents run today:

| | A2A 1.0 | A2A 0.3 |
| --- | --- | --- |
| send | `SendMessage` | `message/send` |
| stream | `SendStreamingMessage` | `message/stream` |
| pick a task back up | `SubscribeToTask` | `tasks/resubscribe` |
| read a task | `GetTask` | `tasks/get` |
| card | `supportedInterfaces[]` | `url`, `preferredTransport`, `additionalInterfaces` |

A card that lists both gets 1.0, and 1.0 calls carry `A2A-Version: 1.0`. The gRPC and HTTP+JSON bindings are not supported yet: `pair` refuses such a card and says why.

## The client module

`adapters/a2a/src/a2a.ts` is the client, `src/sse.ts` its event stream parser. They use only `fetch`, `TextDecoder` and streams, so the same code runs in Node, a Cloudflare Worker and a browser. That is the piece step 2 moves into the hosted connector.

## Tested

- The client, 42 unit tests: event stream parsing, both versions' shapes, errors, and live calls against a scripted agent in 1.0 and 0.3, including picking a task back up.
- Against the official A2A SDK (`a2a-sdk` for Python, 1.x and 0.3): card, send, stream, `GetTask`.
- End to end on live Yui, 66 checks on throwaway accounts: A2A 1.0, 0.3, and 1.0 without streaming. A long task shows the working row, then its whole answer lands once. A bridge killed mid-task resumes the same task after a restart and answers once. The agent's question continues the same task. And on the iPhone simulator: the working row, the long answer, a screen from the A2A agent, a tap on it, and a question, light and dark.

The test agent is scripted, with fixed answers and no model.

## Not yet

- Push notifications from the agent back to Yui (step 2, the hosted connector gets a URL to receive them).
- Keys kept by Yui per agent (YUI-34), and OAuth sign-in flows from `auth-required`.
- Files and images from the agent drawn as media, and data parts as screens.
- `CancelTask` from the app.
