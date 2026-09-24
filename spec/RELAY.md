# Yui relay | spec v1 (YUI-7)

How an agent talks to someone in the Yui app. Yui is a messaging platform, like Telegram: the agent keeps one brain and one memory across every channel, and Yui is one more place to reach it. Each agent gets its own thread in the app.

This builds on `spec/AGENTS.md` (who the agents are, how a host is paired) and `spec/CHANNEL.md` (what the agent is told about the channel). Code lives in the app repo `postscarcityai/yui`: migration `supabase/migrations/20260924010000_yui_relay.sql`, host plugin `hermes-plugin/`, tests `supabase/tests/relay_test.py`, app side `Yui/Sources/Chat/Thread.swift`.

## Shape

```
 Yui app  --REST insert/poll-->  PROOF: yui_messages  <--Realtime + REST--  agent host (Hermes gateway, yui plugin)
 (yui_user token)                 RLS on every row                          (yui_connector token)
```

- Everything is rows in one table, `yui_messages`. No server of our own sits in the middle.
- The host **dials out**. No inbound ports on the machine that runs the agent.
- Nobody holds the service key except edge functions.

## Messages

`yui_messages(id, user_id, agent_id, sender, body, kind, meta, created_at)`

| sender | kind | body | meta |
| --- | --- | --- | --- |
| `user` | `text` | what the person typed | `{}` |
| `user` | `event` | `[yui] <id> <preset> key=value ...`, the line the agent reads | `{id, preset, value, echo?}` |
| `agent` | `text` | chat text with Yui Lines inside ```` ```yui ```` fences | `{}` |

Body is 1 to 32,000 characters. A thread is `(user_id, agent_id)`; deleting the agent deletes its thread.

### Agent to app

Text outside ```` ```yui ```` fences is a chat bubble. Each fenced block is Yui Lines, parsed on the phone by YuiLines and drawn as presets. Unfenced text is never parsed as YL. An unclosed fence still renders (a reply cut short keeps its screen). The host never rewrites the agent's text, and a reply is never split mid-fence: the host sends one row per reply.

### App to agent: events

A tap or submit becomes one `event` row. The body is written by the app:

- `[yui] <id> <preset>` then the event's values, keys sorted.
- `true` flags are bare: `[yui] hiit timer done rounds=8`.
- strings are quoted when they hold spaces, `|`, `=` or quotes: `[yui] n1 ask answer="Not now"`.
- lists join with `|`: `[yui] n3 pick picked=Dumbbells|Bands`.
- objects flatten with dots: `[yui] n1 form form.mood=4 form.notes="slept badly"`.

`meta` carries the same event as JSON (`{id, preset, value, echo}`, spec YL section 7), for hosts that want structure. The app shows `echo` as the person's reply; events without one stay hidden.

Quiet events stay on the phone: a timer starting, a checklist tick. An event goes to the agent when the person answered something (it has an echo) or something finished (`done`). That keeps every checkbox from costing an agent turn.

## Credentials

| who | token | may |
| --- | --- | --- |
| App | `yui_user` JWT (15 min, from `yui-auth`) | read its own threads; insert `sender='user'` rows (text or event) into its own agents' threads; delete its messages. No updates. |
| Host | `yui_connector` JWT (60 min, from `yui-connect` `session`) | read the user's rows and insert `sender='agent'`, `kind='text'` rows, **only** in threads of agents bound to its own connector; see those agents (id, name, handle, remote_ref). Nothing else: no other user, no unbound agent, no registry tables, no edits, no deletes. |

The host's JWT: `role=yui_connector`, `sub` = the paired user, `cid` = the connector. It is minted from the connector token (`yui_ct_...`, AGENTS.md) and signed like the app's token. Every policy calls `yui_connector_serves(agent_id)`, which also checks the connector is not revoked, so removing a host in the app cuts it off at once, even with an unexpired JWT. Realtime applies the same RLS: a host only hears inserts it could read.

All of this is tested live in `supabase/tests/relay_test.py` (38 checks, including Realtime isolation and instant revoke).

## Host API additions (`yui-connect`)

```
{"action":"session"}     Bearer yui_ct_...
  -> {access_token, expires_at, user_id, connector:{id,name}, agents:[{id,name,handle,remote_ref}], guide:{version, body}}
{"action":"guide"}       no auth
  -> {guide:{version, body}}
```

`session` also counts as a heartbeat.

## Channel guide for any agent

The text every agent gets on the Yui channel is `spec/CHANNEL.md` from "## You are talking to someone in Yui" to the end, verbatim. Its version is the title's version plus the first 8 hex of the text's SHA-256 (`v0+433d13ff`), so any edit is a new version.

- Hermes: the plugin bundles a copy (`hermes-plugin/yui/CHANNEL.md`) and injects it as the `yui` platform's system-prompt hint, with its version line, on every Yui turn and no other.
- Any other agent: `yui-connect` returns the current guide in `session` and `guide`, from the `yui_channel_guides` table. A non-Hermes host prepends it to its agent's system prompt when it connects.
- After editing CHANNEL.md: `hermes-plugin/sync_channel.py --publish` rewrites the bundled copy and publishes the new version; `--check` fails when the copy is stale. Then restart the Yui-enabled gateways.

## The Hermes plugin

`hermes-plugin/yui/` in the app repo is a Hermes platform plugin (`plugin.yaml`, `adapter.py`, `connector.py`), no changes to Hermes core.

- Install per profile: `hermes-plugin/install.sh <profile>`. Hermes loads plugins from the profile's own home (`~/.hermes/profiles/<p>/plugins/`), not `~/.hermes/plugins/`, so each profile that talks in Yui needs it. The script symlinks the plugin (a git pull updates every profile), adds `yui` to `plugins.enabled` and sets `platforms.yui.enabled: true`. Nothing else in the profile changes.
- Pair: `hermes -p <profile> yui pair <code>` (code from the app's Add agent), or `hermes -p <profile> yui add` on an already-paired machine; `hermes -p <profile> yui status` shows the connector and its agents.
- Then `hermes -p <profile> gateway restart`. The gateway serves every agent whose `remote_ref` is that profile's name.
- Runtime: trades the connector token for a session, subscribes to Realtime, and on each insert (or every 20 s, every 3 s while Realtime is down) reads new user rows past a cursor saved in `<profile home>/yui/cursor.json`. A restart resumes where it stopped; a new agent starts from now, not from old history. Heartbeat every 45 s; the session refreshes 10 minutes before it expires.
- Inbound is authorized upstream (RLS already limits it to the paired user), so there is no `YUI_ALLOWED_USERS` list to keep.
- The profile's Yui thread is its home channel (`YUI_HOME_CHANNEL` defaults to the profile name), so cron and cross-channel sends can target `yui`.
- Pictures from tools become a YL `image` line.

On the reference host only the `yui` profile has the channel on. Other profiles get it when the user adds them from the app.

## Not yet

- The app polls its open thread every 1.5 s. Realtime on the app side (and push when it is closed, YUI-8) comes later.
- Typing indicator is app-side: dots from the moment the person sends until the agent's next row (or 3 minutes).
- No streaming of partial replies: the agent's reply lands whole.

## Later: other people's Hermes

Hermes ships an experimental relay connector contract (`hermes-agent/docs/relay-connector-contract.md`, `hermes gateway enroll`): a gateway dials out over WebSocket to a hosted connector, receives a capability descriptor at handshake (message limits, edit support, platform hint), then exchanges normalized message events and actions. That is the path for a **hosted** Yui: instead of installing our plugin, someone else's Hermes enrolls with a Yui-run connector that fronts the same `yui_messages` rows, with the connector kind `hosted` from AGENTS.md. The channel guide would travel as the descriptor's `platform_hint`. We don't build it until the contract leaves experimental status and the app has users outside this Mac.
