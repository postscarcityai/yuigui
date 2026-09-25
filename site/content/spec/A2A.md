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

- **The channel guide is a context part.** On the first message of each new task, Yui's channel guide goes in as a text part before the person's words, marked `metadata: {"yui": "channel_guide", "version": "..."}`. A LangGraph server gets it as a data part instead (see LangGraph agents below). Yui cannot touch a remote agent's system prompt, so this is how it learns it can answer with [Yui Lines](/yl). An agent that hands it to its model can draw screens: put the lines in a ```` ```yui ```` fence. One that ignores it still works; its answers show as chat.
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

## Gemini and ADK agents

Agents built with Google's [Agent Development Kit](https://google.github.io/adk-docs/) (ADK), the kit behind Gemini Enterprise agents, speak A2A: ADK's `to_a2a` serves any agent with an Agent Card at `/.well-known/agent-card.json` (A2A 1.0, JSON-RPC, streaming). Pair it like any other (INT-9):

```
uv run --with google-adk --with litellm --with 'a2a-sdk[http-server]' --with uvicorn \
  adapters/a2a/tests/sdk/adk_agent.py 8765
node yui-a2a.ts card http://127.0.0.1:8765
node yui-a2a.ts pair 123456 --card http://127.0.0.1:8765
node yui-a2a.ts run
```

`adk_agent.py` is a working example: an `LlmAgent` on local Ollama qwen2.5:7b through LiteLLM, so it needs no key. Set `ADK_MODEL=gemini-2.5-flash` and `GEMINI_API_KEY` to run the same agent on Gemini.

To answer with screens, an ADK agent passes Yui's guide to its model. ADK keeps each A2A part's metadata, so a `before_model_callback` finds the part marked `{"yui": "channel_guide"}`, adds it to the model's instructions and takes every copy out of the conversation:

```python
def use_yui_guide(callback_context, llm_request):
    for c in llm_request.contents:
        guide = [p for p in c.parts if (p.part_metadata or {}).get("yui") == "channel_guide"]
        if guide:
            llm_request.append_instructions([guide[-1].text])
            c.parts = [p for p in c.parts if p not in guide]
```

(The example also drops the tap's JSON data part, whose text line says the same, and keeps the history short for a 4,096-token local model.) An agent in Gemini Enterprise is reached the same way, by its card URL, with its key as `--header "authorization: Bearer ..."`.

## LangGraph agents

LangGraph's own server, the Agent Server (what `langgraph dev` runs locally and what LangSmith deployments run, cloud or self-hosted), serves every graph over A2A at `/a2a/{assistant_id}`, with its card at `/.well-known/agent-card.json?assistant_id={assistant_id}` (A2A 1.0 JSON-RPC, 0.3 method names too, streaming). It needs `langgraph-api` 0.13 or later and a graph whose state has a `messages` key. LangChain's docs: [A2A endpoint in Agent Server](https://docs.langchain.com/langsmith/server-a2a). Pair by that card URL, quoted for the `?` (INT-14):

```
(cd tests/sdk && uv run --with 'langgraph-cli[inmem]' langgraph dev --port 8790 --no-browser)   # another terminal
curl -s -X POST localhost:8790/assistants/search -H 'content-type: application/json' -d '{"graph_id":"yui_helper"}'
node yui-a2a.ts card 'http://127.0.0.1:8790/.well-known/agent-card.json?assistant_id=<assistant_id>'
node yui-a2a.ts pair 123456 --card 'http://127.0.0.1:8790/.well-known/agent-card.json?assistant_id=<assistant_id>'
node yui-a2a.ts run
```

Yui's thread is the graph's thread: the bridge's `contextId` (the Yui agent's id) becomes LangGraph's `thread_id`, so the graph keeps its state across turns.

**How the guide gets in.** LangGraph's A2A endpoint turns each text part into its own human message under the message's one id, so a second text part replaces the first, and it drops part metadata. Data parts, though, become keys of the graph's input. So when a card lists LangChain's A2A extensions, the bridge sends one text part (the person's words) and one data part:

```json
{"yui_channel_guide": {"version": "v16+...", "body": "..."},
 "yui_events": [{"id": "n1", "preset": "choose", "value": {"choice": "Tea"}, "row": "..."}]}
```

`yui_channel_guide` comes when a task starts, `yui_events` with a tap. Declare them in the graph's state and read them in a node; a graph with a model puts the guide's body in its system prompt. The guide stays in the thread's state, and it never shows up as a chat message:

```python
class State(TypedDict, total=False):
    messages: Annotated[list, add_messages]
    yui_channel_guide: dict   # {"version", "body"}
    yui_events: list          # taps on a screen
```

`adapters/a2a/tests/sdk/langgraph_agent.py` is a working example with no model: plain-function nodes say hello, draw a Tea or Coffee `choose` screen (only when the guide says `choose` exists), and answer the tap from its data.

**Deployments without A2A.** A threads and runs adapter (create a thread, stream a run) is not built, because every Agent Server serves A2A by default. The gaps are a server older than 0.13 (upgrade it), one whose owner set `http.disable_a2a` (turn it back on), and a graph with no `messages` key, which a threads adapter could not talk to either without knowing its input.

## CrewAI agents

[CrewAI](https://docs.crewai.com/en/learn/a2a-agent-delegation) (1.15, `pip install 'crewai[a2a]'`) exposes an agent as an A2A server with an `A2AServerConfig` on the agent: `agent.to_agent_card(url)` makes its card, and `crewai.a2a.utils.task.execute` runs each A2A task as one CrewAI task. CrewAI does not ship a server process, so the official A2A SDK's Starlette app serves it (A2A 0.3, JSON-RPC, streaming). Pair it like any other (INT-15):

```
uv run --with 'crewai[a2a,litellm]' --with uvicorn adapters/a2a/tests/sdk/crewai_agent.py 8791
node yui-a2a.ts card http://127.0.0.1:8791
node yui-a2a.ts pair 123456 --card http://127.0.0.1:8791
node yui-a2a.ts run
```

`crewai_agent.py` is a working example on local Ollama qwen2.5:7b through LiteLLM, so it needs no key. `CREWAI_MODEL` (and that provider's key) runs it on another model.

**How the guide gets in.** CrewAI joins every text part of the message into the task's description and drops part metadata, so left alone Yui's guide reads as part of the person's words, and a tap's data part is added as "Structured Data". The example's executor fixes both before CrewAI sees the message: the part marked `{"yui": "channel_guide"}` goes into the agent's backstory, which is CrewAI's system prompt, and the tap's data part is dropped (its text line says the same). The bridge sends CrewAI the same parts as any other agent.

```python
class YuiCrewExecutor(AgentExecutor):
    async def execute(self, context, event_queue):
        guide = next((p.root.text for p in context.message.parts
                      if (p.root.metadata or {}).get("yui") == "channel_guide"), None)
        context.message.parts = [p for p in context.message.parts
                                 if p.root.kind == "text" and (p.root.metadata or {}).get("yui") != "channel_guide"]
        await execute(helper(guide), context, event_queue)  # an Agent with the guide in its backstory
```

Each A2A task is a fresh CrewAI task, so the agent keeps no memory between turns; the prompt holds the guide and the turn, which fits a 4,096-token local model.

**Crews run as scripts.** A crew you kick off from a script, not a server, comes in through the webhook bridge (path E). `adapters/webhook/python/crewai_crew.py` is a planner and a writer: as a webhook, each turn kicks off the crew with the guide in the writer's backstory; with `send "..."` it runs once, say from cron, and puts the answer in the thread.

## Tested

- The client, 45 unit tests: event stream parsing, both versions' shapes, errors, and live calls against a scripted agent in 1.0 and 0.3, including picking a task back up, and the LangGraph message shape.
- Against the official A2A SDK (`a2a-sdk` for Python, 1.x and 0.3): card, send, stream, `GetTask`.
- End to end on live Yui, 66 checks on throwaway accounts: A2A 1.0, 0.3, and 1.0 without streaming. A long task shows the working row, then its whole answer lands once. A bridge killed mid-task resumes the same task after a restart and answers once. The agent's question continues the same task. And on the iPhone simulator: the working row, the long answer, a screen from the A2A agent, a tap on it, and a question, light and dark.

The test agent is scripted, with fixed answers and no model. One more run uses a real one: a Google ADK agent served by ADK's own `to_a2a`, its model qwen2.5:7b on Ollama (`a2a_e2e.py --protocol adk`). It pairs by its card, answers a turn, draws a screen the Yui Lines parser reads (only because the guide reached its model: its own instruction never mentions Yui), and answers a tap on it. Another runs a scripted LangGraph graph on LangGraph's own Agent Server (`a2a_e2e.py --protocol langgraph`, 12 checks): it pairs by the `?assistant_id=` card, answers a turn, draws a screen only because the guide reached its state, reads the tap from its data, holds the guide in the thread's state without it ever becoming a chat message, and stops clean. And a CrewAI agent on the same local model (`a2a_e2e.py --protocol crewai`, 9 checks): it pairs by its A2A 0.3 card, answers a turn, draws a screen only because the guide reached its backstory, answers a tap on it, and stops clean.

## Not yet

- Push notifications from the agent back to Yui (step 2, the hosted connector gets a URL to receive them).
- Keys kept by Yui per agent (YUI-34), and OAuth sign-in flows from `auth-required`.
- Files and images from the agent drawn as media, and data parts as screens.
- `CancelTask` from the app.
