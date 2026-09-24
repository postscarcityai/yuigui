# Yui for OpenClaw | spec v1 (INT-1, Sep 24 2026)

Path A of `spec/ADAPTERS.md`, the same path as the Hermes plugin. The code lives in the app repo, [postscarcityai/yui `adapters/openclaw/`](https://github.com/postscarcityai/yui/tree/main/adapters/openclaw); this page is how to install it and what it does.

Your [OpenClaw](https://openclaw.ai) agent talks in Yui the way a Hermes agent does: it answers on your phone, draws real screens, and gets your taps back. Every message reaches it once, in order, even across crashes and restarts.

It is an OpenClaw channel plugin, so OpenClaw treats Yui like Telegram or Slack: the gateway runs it, the agent's normal session, memory and tools stay as they are, and cron jobs and the `message` tool can deliver to it. It dials out to Yui, so your machine opens no ports.

```
 Yui app  <-->  Yui (rows in yui_messages)  <--dials out--  OpenClaw gateway + Yui channel  -->  your agent
```

## Five minutes

Needs OpenClaw 2026.6.11 or later.

1. Get the plugin and install it:
   ```
   git clone https://github.com/postscarcityai/yui
   openclaw plugins install ./yui/adapters/openclaw
   ```
2. In the Yui app: **Agents > Add agent**. It shows a 6-digit code.
3. Pair. `--agent` is the OpenClaw agent that answers (default `main`):
   ```
   openclaw yui pair 123456 --agent main
   ```
4. Turn the channel on and restart the gateway:
   ```
   openclaw config set channels.yui.enabled true
   openclaw gateway restart
   ```
5. Say hi in the app. The agent reads online and answers there.

A second OpenClaw agent: add another agent in the app, pair again with its `--agent`.

## What the agent is told

An agent that has not read the channel guide sends plain text and never a screen. The plugin puts the guide (`spec/CHANNEL.md`, served by Yui, so a new version reaches the agent without an update) into OpenClaw's trusted system prompt on every turn, through the channel's `GroupSystemPrompt`. On top of it sits one plain note:

> On Yui, use Yui Lines, not A2UI. Do not use the canvas or A2UI tools here: the person cannot see them.

OpenClaw's own app draws A2UI widgets through its canvas tool. The Yui phone draws Yui Lines, in a ` ```yui ` fence in the reply. The channel's formatting hints say the same in OpenClaw's inbound metadata. Taps come back to the agent as event lines that start with `[yui]`, exactly as they do for Hermes.

## How a turn works

The relay contract from `spec/RELAY.md`, unchanged:

1. The channel reads the person's rows that are not handled yet and marks them `delivered_at`.
2. One turn per Yui agent at a time. The rows go in as one inbound message on a direct session (`yui:<agent id>`); whatever arrives meanwhile folds into the next turn.
3. The agent's answer is collected from OpenClaw's reply dispatcher, written to an outbox on disk, then into the thread as one row tagged `meta.turn` with the row ids it answers. The phone gets a push unless the thread is open.
4. The rows are marked `handled_at`.

A gateway killed mid-turn replays the turn after a restart. A row that was answered but not acked is acked without asking the agent again. A clean stop says `bye`, so the app shows the agent offline at once. The connector is kind `openclaw`.

## Commands

| | |
| --- | --- |
| `openclaw yui pair <code> [--agent ID] [--host-name NAME]` | claim a code from the app |
| `openclaw yui status` | the connector, the guide version, each Yui agent and its OpenClaw agent |
| `openclaw yui guide` | print the channel guide |
| `openclaw yui send "text" [--to AGENT]` | put a message in a thread, with a push |

Deliveries from cron or the `message` tool: channel `yui`, target `yui:<agent handle or id>`.

## Config

`channels.yui` in `openclaw.json`, all optional: `enabled` (default on), `agent` (the OpenClaw agent for a Yui agent whose ref names none), `stateFile` (default `<state dir>/yui/connector.json`), `interval` (seconds between checks, default 2).

The connector token lives only in the state file, mode 600. It is never written to `openclaw.json`, so config dumps and backups do not carry it. Only the paired Yui account can write to this channel, so its messages count as the owner's.

## Tested

`adapters/openclaw/tests/openclaw_e2e.py` runs a real `openclaw gateway` in a throwaway OpenClaw home against live Yui, on a throwaway account that is deleted at the end. The agent's model is a local fake that records what OpenClaw sent it, so the test also proves the guide and the A2UI note reach the system prompt. It covers pairing, a screen round trip, a tap, kill -9 mid-turn, a crash between answer and ack, a clean stop, a backlog sent while down, and a handoff.
