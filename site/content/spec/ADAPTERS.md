# Yui adapters | every agent framework, Hermes first (INT-0, Sep 24 2026)

Chris, Sep 24: Yui should work with any agent. Hermes first, then OpenClaw, Meta, Grok, Claude, ChatGPT, Gemini, open-source models, Flue, and whatever comes next.

This is the plan for getting there. It is backlog: nothing here starts until the MVP passes (YUI-29). Each framework has a parked card on the board, named in its section.

Read first: `spec/RELAY.md` (how messages move), `spec/AGENTS.md` (connectors and agents), `spec/CHANNEL.md` (what an agent is told about Yui).

## The short version

There are only five ways an agent can reach Yui. Every framework below uses one of them, so five pieces of code cover the whole list.

| # | Path | Who runs the agent | Who holds the conversation | Covers |
| --- | --- | --- | --- | --- |
| A | **Channel plugin** inside the agent's own runtime | the user | the agent's host | Hermes and OpenClaw (shipped), Flue |
| B | **Hosted connector** that speaks a standard protocol | the user or a vendor | the agent | Hermes via relay contract, A2A agents (Gemini, LangGraph, CrewAI, Microsoft Agent Framework) |
| C | **Model connector**: Yui calls a chat API for you | Yui | Yui | any OpenAI-compatible endpoint: Meta Muse Spark, Grok, Gemini, Ollama, LM Studio, vLLM, OpenRouter |
| D | **Yui MCP server**: the agent calls Yui as a tool, and its screens draw inside MCP App hosts (shipped, INT-3, INT-7) | the user's AI app | the AI app | Claude, ChatGPT, Grok, n8n, Cursor, anything MCP |
| E | **Webhook**: plain HTTP both ways (shipped, INT-2) | the user | the user's code | n8n, Zapier-style tools, scripts, everything else |

Two rules hold for all of them:

1. **Rows in `yui_messages` are the contract.** Every adapter ends in the same table, the same RLS, the same event lines (`[yui] id preset k=v`). The app never learns which framework is on the other end.
2. **The agent must get the channel guide.** An agent that has not read CHANNEL.md sends plain text and never a screen. Each path below says how the guide gets in.

## What each path needs from Yui

- **A, channel plugin.** A connector token (`yui_ct_...`) from pairing, `yui-connect session`, Realtime on `yui_messages`. Built for Hermes (kind `hermes`) and OpenClaw (kind `openclaw`, INT-1); other plugins reuse it with their own kind.
- **B, hosted connector.** A long-running service Yui owns, holding outbound sessions to many agents. Supabase edge functions cannot hold a socket open, so this needs a real host. Decided in INT-6 (`spec/HOSTING.md`): Cloudflare Workers + Durable Objects through the Agents SDK, beside Supabase, not replacing it. Connector kind `hosted`.
- **C, model connector.** Same hosted service, plus a key vault (YUI-34) for the user's own API keys, plus Yui-side memory of the thread. This is the only path where Yui is the agent's brain, not just its screen, so it overlaps Phase 4's built-in agent (YUI-37).
- **D, MCP server.** A public remote MCP server with OAuth (Sign in with Apple through Yui's account). Connector kind `mcp`.
- **E, webhook.** Shipped as a local bridge (INT-2): a small process next to the agent dials out like the Hermes plugin and POSTs each turn to the agent's own URL, so no server-side webhook delivery is needed. Connector kind `http`. A hosted inbound URL per agent (for code that cannot run a process, like Zapier) can come later on the INT-6 host.

## How the channel guide gets in

| Path | Where the guide goes |
| --- | --- |
| A | Injected by the plugin into the agent's system prompt, every Yui turn: Hermes through the platform hint, OpenClaw through the channel's `GroupSystemPrompt` (both done). |
| B | Relay contract: the descriptor's `platform_hint`. A2A: sent as a context part on the first message of each task, since Yui cannot touch a remote agent's system prompt. |
| C | Yui owns the prompt: the guide is the system message. |
| D | Short form in the tool descriptions, full text as an MCP prompt `yui_guide` and a resource `yui://guide`. |
| E | In every webhook POST (`guide.version`, `guide.body`), from `yui-connect session`; the developer puts it in the agent's prompt. |

The guide is written once. Paths D and E get a shorter cut (screens and events only, no Hermes tool names) as `CHANNEL-lite`, generated from the same file by `sync_channel.py`.

## Framework by framework

Effort is for one person and assumes the path's shared piece already exists. S = a day or two, M = about a week, L = two weeks or more.

### Hermes | shipped (YUI-7), hosted next (INT-5)

- **Connects:** path A today. The `yui` platform plugin in the app repo, one command to install, a code to pair. Next is path B through Hermes's relay connector contract (`hermes gateway enroll`), so other people's Hermes connects with nothing installed.
- **Learns:** the full CHANNEL.md, injected by the plugin.
- **Effort:** plugin done. Hosted connector L.
- **Depends on:** the relay contract leaving experimental status; the hosted service (INT-6).
- **Priority:** 1. It is the MVP.

### OpenClaw | INT-1, shipped Sep 24

- **Connects:** path A, as an OpenClaw channel plugin: `adapters/openclaw/` in the app repo, TypeScript with no dependencies, loaded by OpenClaw from source. `defineChannelPluginEntry` registers the channel (`api.registerChannel`) and a `channel-outbound` message adapter; `gateway.startAccount` runs the connector loop, each turn goes through OpenClaw's own inbound dispatch, so the agent's session, memory and tools are untouched. Install: clone, `openclaw plugins install ./yui/adapters/openclaw`, `openclaw yui pair <code> --agent main`, `openclaw config set channels.yui.enabled true`, restart the gateway. Connector kind `openclaw`. Guide: `spec/OPENCLAW.md`.
- **Delivery:** the relay rules from RELAY.md, the connector client ported from the webhook bridge: unfinished rows only, `delivered_at` then `handled_at`, one turn at a time per agent with the backlog folded in, an on-disk outbox, `meta.turn`, replay after a crash, `bye` on a clean stop. Cron and the `message` tool deliver to target `yui:<agent>` as a handoff with a push.
- **Learns:** the full CHANNEL.md, fresh from `yui-connect session`, in the trusted system prompt every turn (the channel's `GroupSystemPrompt`), under a plain note: on Yui, use Yui Lines, not A2UI; the canvas and A2UI tools do not reach the phone. The channel's formatting hints say the same.
- **Tests:** `adapters/openclaw/tests/openclaw_e2e.py` runs a real OpenClaw gateway in a throwaway home with a fake model that records its prompt, on a throwaway account: pairing, the guide and the A2UI note in the system prompt, a screen round trip, a tap, kill -9 mid-turn, a crash between answer and ack, a clean stop, a backlog, a handoff. 24 of 24 live checks passed on Sep 24.
- **Priority:** 2. The pitch names OpenClaw users as the early adopters.

### Generic webhook, Python and Node | INT-2, shipped Sep 24

- **Connects:** path E, as a bridge the developer runs next to their agent: `adapters/webhook/` in the app repo, `python/yui_webhook.py` (stdlib only) and `node/yui-webhook.mjs` (Node 20, no dependencies), same behaviour and the same state file. Pair with the app's code (connector kind `http`), then `run --webhook <url>`. The bridge dials out, so the agent's machine opens no ports and Yui needs no webhook delivery function.
- **The contract:** one POST per turn with the agent, the turn's row ids, the text (one line per message), each message with its event JSON for taps, and the channel guide. The agent answers `{"reply"}`, `{"replies"}`, plain text, or an empty 2xx for no reply; anything else is retried with backoff. `--secret` adds an HMAC-SHA256 signature over `<timestamp>.<body>`. Full contract: `spec/WEBHOOK.md`.
- **Delivery:** the relay's rules from RELAY.md: unfinished rows only, `delivered_at` then `handled_at`, one turn at a time per agent with the backlog folded into the next, replies written to an on-disk outbox first and tagged with `meta.turn`, a crash mid-turn replays it, an answered row is never sent twice, a clean stop says `bye`.
- **Learns:** the full channel guide, in every POST. CHANNEL-lite is still to do; the full text works today.
- **Examples:** a ten-line agent per language that answers with a `choose` screen and replies to the tap.
- **Tests:** `adapters/webhook/tests/webhook_e2e.py` runs both clients against a fake webhook on a throwaway account: pairing, a screen round trip, a tap, kill -9 mid-turn, a crash between answer and ack, a clean stop, a backlog, a handoff. 44 of 44 live checks passed on Sep 24.
- **Later:** a hosted inbound URL for tools that cannot run a process (Zapier-style), on the INT-6 host.

### Yui MCP server | INT-3

- **Status:** step 1 shipped Sep 25: the `yui-mcp` edge function, spec `spec/MCP.md`. Tools: `yui_show` (put a screen on the phone, returns a screen id), `yui_answers` (read taps for a screen, with a wait), `yui_say` (plain message), `yui_threads`. Remote, streamable HTTP, stateless. Auth is a connection token from the app's pairing code, so clients that take a header (Claude Code, Cursor, n8n) work today. Step 2 is OAuth (Sign in with Apple through Yui), INT-19, for the Claude and ChatGPT apps' one-click connectors.
- **Learns:** a short form in the tool descriptions, the full guide as the `yui_guide` prompt and the `yui://guide` resource.
- **Effort:** M.
- **Depends on:** rate limits from YUI-26 (its own `mcp` bucket). OAuth is INT-19.
- **Priority:** 2. One server serves every MCP client below.
- **Note:** here the conversation stays in the other app. Yui is the second screen: the agent pushes a timer or a form to your phone while you keep talking on your laptop.

### Claude | INT-7, shipped Sep 25

- **Connects:** path D. Claude's apps (web, desktop, mobile) add Yui as a custom connector by URL and sign in with OAuth; Claude Code does the same with `claude mcp add --transport http` (then `claude mcp get`, `claude mcp login`), or with a pasted token. Agents on the Claude Agent SDK load the same server in `mcpServers`, or use path E when they run as a service. Steps for each: `spec/MCP.md` "Claude", on /developers/mcp.
- **Learns:** from the MCP server (tool descriptions, instructions, the `yui_guide` prompt). Agent SDK builders append CHANNEL.md to the system prompt; the snippet in the guide does it.
- **Draws in the chat too:** the web renderer ships as an MCP App, `ui://yui/screen`, named by `yui_show`. Hosts that render MCP Apps (the `io.modelcontextprotocol/ui` extension) show the screen inline, and a tap there comes back as the same event a phone tap sends, through the app-only `yui_tap`. Same Yui Lines, a second renderer.
- **Checked:** the MCP Apps reference host draws the screen and a tap round-trips (dark and light); a real Claude Code on this Mac adds Yui over OAuth and puts a screen on the simulator. Inside claude.ai itself needs a person's browser session, one check left for Chris.
- **Not listed** in Claude's connector directory. A listing is public; Chris signs off first.
- **Depends on:** INT-3, INT-19.

### ChatGPT | INT-8

- **Connects:** path D. ChatGPT connects to MCP servers and fully supports MCP Apps; OpenAI's Apps SDK is built on the same standard. Custom connectors cover personal use; the ChatGPT app directory needs a review.
- **Learns:** from the MCP server.
- **Effort:** S for the connector, M for a listed app with a web-renderer MCP App.
- **Depends on:** INT-3. A directory listing is public outreach, so Chris signs off first.
- **Priority:** 3.
- **Status:** the connector shipped Sep 25: add Yui in ChatGPT developer mode by its URL (`spec/MCP.md` "ChatGPT"), OAuth approved in the app, the screen drawn in the chat as the same MCP App. yui-mcp 0.3.0 adds ChatGPT's own metadata and the view falls back to `window.openai`. Checked in a ChatGPT-shaped test host; one look inside chatgpt.com is still to come. Not listed in the directory.

### Gemini | INT-9

- **Connects:** two ways. The Gemini API has an OpenAI-compatible endpoint, so a plain Gemini model is path C. Agents built with Google's Agent Development Kit, or registered in Gemini Enterprise, speak A2A, so they are path B through the A2A client (INT-18).
- **Learns:** path C, the guide is the system message. A2A, a context part on each task.
- **Effort:** S on top of INT-12 or INT-18.
- **Depends on:** INT-12 or INT-18.
- **Priority:** 4.

### Grok | INT-10

- **Connects:** two ways. xAI's API is OpenAI-compatible (path C), and it accepts remote MCP servers as tools in the request, so a Grok agent can call the Yui MCP server directly (path D).
- **Learns:** path C system message, or the MCP tool descriptions.
- **Effort:** S.
- **Depends on:** INT-12 or INT-3.
- **Priority:** 4.

### Meta | INT-11

- **Name check:** Chris said "Meta Muse". The real names: **Muse Spark** is Meta's model (from Meta Superintelligence Labs), it runs the Meta AI app's Thinking mode, and developers reach it through the **Meta Model API**, which takes existing OpenAI SDK code. There is no public way for a third party to plug into the Meta AI app itself.
- **Connects:** path C, Muse Spark through the Meta Model API with the user's own key.
- **Learns:** the guide as system message. Muse Spark reads images, so it can also see screenshots of screens it drew.
- **Effort:** S.
- **Depends on:** INT-12, YUI-34 (key vault).
- **Priority:** 4.

### Open-source models: Ollama, LM Studio, vLLM | INT-12

- **Connects:** path C. All three serve an OpenAI-compatible `/v1/chat/completions`. One model connector with a base URL, a model name and an optional key covers them, plus Meta, xAI, Gemini's compatible endpoint and OpenRouter. Self-hosted servers sit on the user's own machine, so the connector runs there too (a small host process, like the Hermes plugin), not in our cloud. Cloud endpoints use the hosted connector.
- **Learns:** the guide as system message. Small local models may not follow it well: YUI-10's eval runs against each model we list as supported, and a model under the bar gets plain text only.
- **Effort:** M for the connector, then S per provider preset.
- **Depends on:** YUI-34 key vault, thread memory on the Yui side, YUI-10 eval.
- **Priority:** 3. One piece of code, many frameworks.

### Flue and Cloudflare Agents | INT-13 (research done in INT-6, `spec/HOSTING.md`)

- **Name check:** "Flue" is real. It is an open-source TypeScript agent framework from the team behind Astro (`withastro/flue`, 1.0 beta), announced with Cloudflare in June 2026. Flue is the framework, the Pi harness runs it, and on Cloudflare each agent is a Durable Object on the Agents SDK. It also runs on Node and GitHub Actions.
- **Connects:** path A. Flue has **channels** (Slack, GitHub, Linear, Discord) added with `flue add channel <name>`, which writes a markdown blueprint the developer's coding agent merges in. A Yui channel is that blueprint plus the connector client in TypeScript. On Cloudflare the Durable Object holds the socket, which is the same thing INT-6 wants for our own hosted connector.
- **Learns:** CHANNEL.md, from the channel blueprint's instructions.
- **Effort:** M, sharing the TypeScript client with INT-1.
- **Depends on:** INT-6 findings.
- **Priority:** 3.

### LangGraph | INT-14

- **Connects:** path B. LangGraph agents deployed on LangGraph Platform expose a threads and runs API, and LangGraph also speaks A2A. The A2A client covers most cases; a thin LangGraph threads adapter covers deployments without A2A.
- **Learns:** a context part per task, or the SDK pastes CHANNEL-lite into the graph's system prompt.
- **Effort:** S with INT-18, M without.
- **Depends on:** INT-18.
- **Priority:** 4.

### CrewAI | INT-15

- **Connects:** path B through A2A, which CrewAI supports; path E for crews run as scripts.
- **Learns:** as LangGraph.
- **Effort:** S.
- **Depends on:** INT-18 or INT-2.
- **Priority:** 5.

### AutoGen, now Microsoft Agent Framework | INT-16

- **Name check:** AutoGen went into maintenance in October 2025. Its successor is **Microsoft Agent Framework** (1.0 in April 2026), which merged AutoGen and Semantic Kernel and speaks MCP, A2A and AG-UI.
- **Connects:** path B through A2A. AG-UI is an agent-to-frontend event stream, which is close to what Yui is; worth a spike to see whether Yui can be an AG-UI client, since several frameworks emit it.
- **Learns:** as LangGraph.
- **Effort:** S with INT-18. AG-UI spike M.
- **Depends on:** INT-18.
- **Priority:** 5.

### n8n | INT-17

- **Connects:** two ways. n8n's AI Agent node calls MCP servers through its MCP Client Tool node (path D), and any workflow can call the webhook (path E). A small community node, "Yui: send screen / wait for answer", makes it drag and drop.
- **Learns:** the MCP tool descriptions, or the node's built-in prompt.
- **Effort:** S with INT-3, M for the community node.
- **Depends on:** INT-3 or INT-2.
- **Priority:** 4.

### A2A client | INT-18

- **Connects:** path B. You add an agent by its Agent Card URL; Yui's hosted connector sends your messages as A2A tasks and turns the agent's replies back into rows. One adapter covers Gemini Enterprise and ADK, LangGraph, CrewAI, Microsoft Agent Framework and anything else with an Agent Card.
- **Learns:** a context part carrying CHANNEL-lite on each task. Remote agents we do not control may ignore it; their replies still show as plain chat.
- **Effort:** L.
- **Depends on:** the hosted service (INT-6), auth for remote agents (per-agent keys in YUI-34).
- **Priority:** 3.

### Telegram fallback | INT-4

Not an agent framework, but the same idea in reverse: Yui Lines rendered as Telegram buttons and a Mini App, for when the app is not around. Already on the board.

## Order

1. Hermes plugin (done), then INT-5 hosted Hermes.
2. INT-1 OpenClaw (done Sep 24), INT-2 webhook (done Sep 24), INT-3 MCP server (done Sep 25, OAuth next in INT-19). These three open the door for everyone else.
3. INT-7 Claude and INT-8 ChatGPT (cheap once INT-3 exists), INT-12 model connector, INT-13 Flue, INT-18 A2A.
4. INT-9 Gemini, INT-10 Grok, INT-11 Meta, INT-14 LangGraph, INT-17 n8n: mostly presets on the pieces above.
5. INT-15 CrewAI, INT-16 Microsoft Agent Framework.

## Open questions

1. Where does the hosted connector live? Answered by INT-6 in `spec/HOSTING.md`: on Cloudflare, beside the Supabase relay. INT-12 and INT-18 each start with a local step that needs no host.
2. Path C makes Yui the agent, with thread memory and model spend. That is a product decision, not an adapter detail: it lines up with Phase 4's built-in agent and Phase 6's credits.
3. A listed ChatGPT app or Claude directory entry is public. Chris signs off before either.
