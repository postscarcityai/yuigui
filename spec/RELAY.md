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

## Push and handoff (YUI-8)

The phone gets a push for every agent message, so "send it to Yui" from Telegram (or any channel) is one step: the agent writes into a thread, the phone buzzes, the tap opens that thread with the screen rendered.

```
yui-push  (edge function)
{"action":"register","token","environment","name"}   Bearer app access token
  the phone's APNs device token; "sandbox" for Xcode builds, "production" for TestFlight/App Store.
  One row per phone in yui_devices: a token that was on another account moves to this one.
{"action":"unregister","token"}                      Bearer app access token   (sign out)
{"action":"presence","token","active","agent_id"?}   Bearer app access token   (YUI-24)
  the app is open on agent_id's thread (active: true, repeated every 60 s) or just went to
  the background (active: false). Stale after 90 s, so a killed app counts as closed.
  -> {tracked}  (false when this phone is not registered to the caller)
{"action":"notify","message_id","from"?,"handoff"?}  Bearer yui_ct_...
  push agent message `message_id` to every phone of its user. Only for threads of agents
  bound to this connector, written in the last 10 minutes.
  -> {devices, delivered, skipped, muted?, results:[{status, reason}]}
```

- **When it pushes (YUI-24).** Not for an agent the person muted (`yui_agents.push_muted`, the Notifications switch in that agent's settings): `{muted: true, devices: 0}`, handoffs included. Not to a phone that is open on that agent's thread right now (presence younger than 90 s): the answer is already on screen, so it would ring twice; those count in `skipped`. A phone open on another agent's thread still gets it and shows the banner.

- Alert: title is the thread's agent; body is "<from or agent> has something for you in Yui" for a handoff, otherwise a preview of the text outside the ```yui fences. Payload carries `agent_id`, `message_id` and `url: yui://agent/<agent id>/thread`.
- The app opens `yui://agent/<id>/thread` from a tap or any link, and shows no banner for the thread already on screen.
- APNs token auth (ES256), HTTP/2 straight to Apple from the function. The key never leaves the function's secrets; hosts never see device tokens (the connector role has no grant on `yui_devices`). A 410 from Apple deletes the row.
- The plugin calls `notify` after every insert. In-gateway, a send is a handoff when it comes from another profile or the thread had no inbound for 15 minutes; out-of-process sends (cron, `hermes send`, another channel's session) are always handoffs.
- **Any profile can hand off**, even one with no Yui agent of its own: install the plugin on it. `send_message(target="yui")`, `hermes -p <profile> send --to yui`, and cron `--deliver yui` resolve to the profile's own agent, else the user's first agent, and the push names the sender ("Urza has something for you in Yui"). Taps on that screen go to the thread's own agent, so for two-way flows add the profile as its own agent in the app.
- The fast trigger on other channels: the plugin's `pre_llm_call` hook adds the how-to plus the channel guide to any turn that mentions Yui ("send it to Yui", "pull this up on Yui"), and nothing otherwise. `/yui [note]` is rewritten by `pre_gateway_dispatch` into the same request before the gateway looks for commands.
- Tests: `python3 supabase/tests/push_test.py` (live; a fake token must come back BadDeviceToken, which proves Apple accepted the provider token). `YuiUITests/PushHandoffTests` is the full simulator round trip; `python3 supabase/tests/push_killed_e2e.py --sim <udid>` drives its killed-app case (open thread: no push; app killed: push, tap opens the right thread) on a throwaway account. Never pass a real phone's token to `push_test.py --device`: the test account is deleted at the end and takes the row with it.

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
- The profile's Yui thread is its home channel (`YUI_HOME_CHANNEL` and `platforms.yui.home_channel` default to the profile name), so cron and cross-channel sends can target `yui`.
- Pictures from tools become a YL `image` line, and local files and generator URLs are re-hosted (see Media).

On the reference host the `yui` profile serves the Yui agent; `urza` has the plugin for handoffs only (no agent of its own). Other profiles get a thread when the user adds them from the app.

## Media (YUI-21)

Pictures and videos travel as URLs, never inside a message row. They live in one private Storage bucket in PROOF, `yui-media`, at `<user>/<agent>/<from>/<uuid>.<ext>` (`from` is `agent` or `user`). Migration: `supabase/migrations/20260924040000_yui_media.sql` in the app repo.

- **Who can do what.** The same two roles as the tables, never `authenticated` or anon. `yui_user` reads and deletes its own media and uploads under `from=user` into its own agents' threads. `yui_connector` reads media in threads it serves and uploads under `from=agent`. Nobody updates or overwrites: a new picture is a new path. Tests: `supabase/tests/media_test.py` (49 live checks, most of them refusals).
- **Agent to app.** The plugin walks the ```yui fences of every reply. A local media file (absolute path, `~/...`, `file://`) anywhere in a line, and a remote media URL on a media line (`image`, `gallery`, `video`, `compare`, `storyboard`, `page`, `card`), is uploaded and swapped for a signed URL. A `list` or `card` link to a web page stays a link. The bytes decide the type (jpg, png, webp, gif, heic, mp4, mov), not the extension; anything else stays as written. `send_image`, `send_image_file`, `send_video`, `hermes send --to yui` with media and cron deliveries go the same way.
- **One step from an agent.** `hermes -p <profile> yui media <file|URL> [caption]` sends a picture or video; `--prompt "..." [--aspect 16:9]` renders one first with fal `nano-banana-2` on the owner's own `FAL_KEY` (env or the profile's `.env`), `--prompt ... <file>` edits that picture instead.
- **App to agent.** The app uploads the person's photo (camera, library, a form's `photo` field) as JPEG, 2048 px on the long side, and the event carries the bucket path: `[yui] c1 camera photo=<user>/<agent>/user/<uuid>.jpg`. The plugin downloads it to `~/.hermes/cache/yui/` (mode 600), puts that local path in the line the agent reads, and hands the file to Hermes as vision media.
- **Signed links.** The host signs for 7 days. The app re-signs an expired link with the person's own token, so old threads keep their pictures. A signed link is a bearer link while it lives; revoking a host stops it signing at once, though Storage's CDN may replay an object that host already downloaded until its 60-minute token ends.
- **Limits.** 50 MB per object (the bucket's cap). Video is stored and played as sent: no transcoding yet, so send mp4 (H.264) or mov; webm will not play on iPhone and is refused. Transcoding waits until someone needs it.
- **Deletion and cleanup.** Account deletion (`yui-delete`) removes every object under the user before the user row. `supabase/scripts/media_sweep.py --delete` removes orphans: media whose owner or agent is gone, and uploads older than a day that no message references (a send that failed, or a message the person deleted). The rule lives in SQL, `yui_media_orphans(grace)`. Run the sweep daily.

## Not yet

- The app polls its open thread every 1.5 s. Realtime on the app side comes later; when the app is closed, pushes (YUI-8) cover it.
- Typing indicator is app-side: dots from the moment the person sends until the agent's next row (or 3 minutes).
- No streaming of partial replies: the agent's reply lands whole.

## Later: other people's Hermes

Hermes ships an experimental relay connector contract (`hermes-agent/docs/relay-connector-contract.md`, `hermes gateway enroll`): a gateway dials out over WebSocket to a hosted connector, receives a capability descriptor at handshake (message limits, edit support, platform hint), then exchanges normalized message events and actions. That is the path for a **hosted** Yui: instead of installing our plugin, someone else's Hermes enrolls with a Yui-run connector that fronts the same `yui_messages` rows, with the connector kind `hosted` from AGENTS.md. The channel guide would travel as the descriptor's `platform_hint`. We don't build it until the contract leaves experimental status and the app has users outside this Mac.
