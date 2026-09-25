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

`yui_messages(id, user_id, agent_id, sender, body, kind, meta, created_at, delivered_at, handled_at)`

| sender | kind | body | meta |
| --- | --- | --- | --- |
| `user` | `text` | what the person typed | `{}` |
| `user` | `event` | `[yui] <id> <preset> key=value ...`, the line the agent reads | `{id, preset, value, echo?}` |
| `agent` | `text` | chat text with Yui Lines inside ```` ```yui ```` fences | `{}`, or `{turn: [row ids]}` for a reply (see Delivery) |

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

A reaction (hold an agent's message, pick one of six) is also an `event` row: `[yui] react msg=<agent row id> emoji=👍 meaning="build it"`, then the start of the reacted message quoted with `> `, and `meta` `{react: {msg, emoji}}`. A trigger copies the emoji onto the reacted row's `reaction` column. Spec: `REACTIONS.md`.

A reply (swipe a message left, or hold it and tap Reply) is an ordinary `text` row whose body starts with one line the app writes, then the person's words: `[yui] reply to=<row id> from=agent quote="first line"`, `from=user` when they answer one of their own. `meta.reply_to` carries the same `{msg, from, quote}` (next to `photos` when there are any). The quote is the message's first line, or a card's title, at most 120 characters. The app draws the words with a chip for the quote and drops the line; hosts pass the body through, so every agent reads it.

## Mentions (YUI-44)

The person can @ another of their agents from any thread. Step 1 of group threads: one hop, one agent per message. Migration `supabase/migrations/20260925030000_yui_mentions.sql` in the app repo; the database does the routing, so every host kind (Hermes, OpenClaw, MCP, webhook) works unchanged.

**The app writes one row** in the thread it is in (agent A), an ordinary text row:

| field | value |
| --- | --- |
| body | `[yui] mention to=<handle>` then the person's words |
| meta | `{"mention": {"to": "<B's agent id>", "handle": "coach", "name": "Coach"}}` (next to `photos` when there are any) |

B must be another agent of the same person (`400 mention_agent_not_found` otherwise, `mention_needs_agent` without an id). A mention carries no reply quote: the quote would point at a row B can't see.

**Then, in the same transaction** (security definer triggers on `yui_messages`):

1. **A is not asked.** The row lands with `delivered_at` and `handled_at` already set, so A's host never runs a turn on it. A's plugin reads it as context on A's next turn (below).
2. **B gets a copy** in its own thread, as the person's row:
   ```
   [yui] mention from=<A handle> by=person msg=<A row id>
   Alpha's thread, just before:
   > Person: Plan a leg day for Saturday
   > Alpha: Here it is [screen]
   @Coach does this fit my knee?
   ```
   `meta.mentioned` = `{from, from_name, from_handle, msg, by, depth: 1}`. The quote is A's last six chat lines (screens as `[screen]`, 200 characters a line, status lines left out). B's host answers it like any message, and B's reply lands in B's own thread first, where its screens and taps work.
3. **B's answer comes back.** Every agent row in B's thread whose `meta.turn` names a `mentioned` row is copied into A's thread as an agent row: same body, `meta.mention_reply` = `{agent, name, handle, msg, to}` (`msg` B's row, `to` the person's mention). No `meta.turn`, so it never triggers anything. No push of its own: B's host already pushed its reply.
4. **Can't answer yet? One line, not silence.** If B is not online, or muted, A's thread gets a status row in B's name right away, `meta.mention_reply.status` set; the mention is still delivered and B answers when it can.

| B | line |
| --- | --- |
| asleep | "Coach is asleep. It gets this when its computer wakes." |
| offline | "Coach is offline. It gets this when it's back." |
| pending | "Coach isn't connected yet. It gets this once it is." |
| muted | "Coach is muted. It still gets this, and its answer lands here quietly." |

**In the app.** `@` anywhere in the composer opens the suggestion popover (the one `/` uses) with the person's other agents: face, name, `@handle`, presence. Typing filters (names that start with it first). A tap puts `@Name ` in the draft, and a "Goes to Coach" line shows above the composer while the draft names one. The sent bubble says "To Coach". B's answer shows in A's thread in B's own look (face, colors, name over the bubble) with "Open its thread"; B's screens stay in B's thread ("Sent a screen. It's in Coach's thread."). In B's thread the copy shows only the person's words, with "You, from Alpha's thread".

**What the host agent sees.** Nothing mid-conversation: A takes no turn on a mention or on B's answer. On A's next turn the Hermes plugin (`hermes-plugin/yui/mentions.py`) puts the thread's mention rows and answers since A's last turn first, one line each: `[yui] note: in this thread the person asked Coach, not you: <words>` and `[yui] note: Coach answered here: <words>` (600 characters, screens as `[screen]`; status lines are skipped). Other hosts can read the same rows: `meta ? 'mention'` or `meta ? 'mention_reply'`.

**Agents @ each other, only inside a turn the person started.** A reply may carry `meta.mentions: ["coach"]` (handles or names, at most three). The Hermes plugin fills it from `@handle`s in the reply's words, outside ```` ```yui ```` fences and code. Yui honours it only when the reply's `meta.turn` names a row the person wrote in that thread and no `mentioned` row. B's copy then says `by=agent` and quotes A's thread including the person's ask. Depth is 1: an agent answering a mention can never mention anyone, and copies and status lines never carry a turn, so nothing loops. Each agent's own red lines are untouched: a mention is just a message to it.

Tests: `supabase/tests/mention_test.py` (37 live checks: routing, refusals, resend 409, statuses, the depth guard), `hermes-plugin/tests/test_mentions.py` (11), `supabase/tests/mention_e2e.py` (two real Yui adapters on one Mac; `--sim <udid>` drives `YuiUITests/MentionTests` light then dark).

Next (step 2, later): group threads, several agents in one conversation handing work to each other.

## Credentials

| who | token | may |
| --- | --- | --- |
| App | `yui_user` JWT (15 min, from `yui-auth`) | read its own threads; insert `sender='user'` rows (text or event) into its own agents' threads; delete its messages. No updates. |
| Host | `yui_connector` JWT (60 min, from `yui-connect` `session`) | read the user's rows and insert `sender='agent'`, `kind='text'` rows (choosing their `id`), **only** in threads of agents bound to its own connector; set `delivered_at` and `handled_at` on the person's rows there, and nothing else on them; see those agents (id, name, handle, remote_ref). Nothing else: no other user, no unbound agent, no registry tables, no edits, no deletes. |

The host's JWT: `role=yui_connector`, `sub` = the paired user, `cid` = the connector. It is minted from the connector token (`yui_ct_...`, AGENTS.md) and signed like the app's token. Every policy calls `yui_connector_serves(agent_id)`, which also checks the connector is not revoked, so removing a host in the app cuts it off at once, even with an unexpired JWT. Realtime applies the same RLS: a host only hears inserts it could read.

All of this is tested live in `supabase/tests/relay_test.py` (51 checks, including Realtime isolation, a reply row, instant revoke, and the delivery acks).

## Host API additions (`yui-connect`)

```
{"action":"session"}     Bearer yui_ct_...
  -> {access_token, expires_at, user_id, connector:{id,name}, agents:[{id,name,handle,remote_ref}], guide:{version, body}}
{"action":"bye"}         Bearer yui_ct_...      (YUI-28)
  the host is stopping cleanly: its agents read offline at once, not asleep.
  The next heartbeat or session clears it.
  -> {stopped_at}
{"action":"guide"}       no auth
  -> {guide:{version, body}}
```

`session` also counts as a heartbeat.

## Delivery (YUI-28)

Messages survive a sleeping Mac, a dropped network and a killed app: every message arrives, in order, once. Migration `supabase/migrations/20260924060000_yui_delivery.sql`.

**Phone to agent.**
- The app writes each message (and each answered tap) to an outbox file on the phone **before** the first try, with an id it chose. It sends oldest first. A resend of a row that already landed hits the primary key (409) and counts as sent, so nothing is written twice. Failures back off quietly (1 s up to 30 s) and start over when the network returns or the app comes forward. A killed app sends what was waiting on its next launch.
- In the thread, a message still on the phone is dimmed; while the network is down one quiet line says "Not sent yet. It goes the moment you're back online." No red errors for a network blip.
- The host reads the person's rows it has **not finished** (`handled_at is null`), oldest first, not a moving cursor, so a restart or a row that committed late can't be skipped. It sets `delivered_at` when it hands a row to the agent and `handled_at` when the agent's turn on it completes.
- **One turn at a time per agent.** Rows that arrive while the agent works wait, then go in together as the next turn, one line each, in order. (Hermes' own busy handling would interrupt the turn and keep only the newest message.) Commands (`/stop`, `/new`) go straight in and are never replayed.
- A host killed mid-turn leaves `handled_at` empty: after the restart the row is replayed. A turn that already answered is not run twice: each reply carries `meta.turn`, the ids of the rows it answers, and a row whose answer is already written (or waiting in the host's outbox) is only marked handled. A failed or cancelled turn is marked handled only if the gateway is still running 5 seconds later, so shutting down replays it instead of dropping it. Hermes' "gateway shutting down, your task will be interrupted" notice is off on Yui for that reason.

**Agent to phone.**
- The host gives each reply its id. A reply it cannot write (network down, the Mac waking, Yui unreachable) goes to `<profile home>/yui/outbox.jsonl` and out again oldest first, with backoff up to 60 s; later replies queue behind it so they never overtake. 409 counts as sent. Out-of-process senders (cron, `hermes send --to yui`) append to the same file when Yui is unreachable, and the profile's gateway delivers them.
- The app polls with a 10-second overlap and drops ids it has already shown.

**Honest status.** `yui_agent_list.presence`, straight from the host's heartbeat (every 45 s), never guessed:

| presence | means | app says |
| --- | --- | --- |
| `online` | heartbeat in the last 2 minutes | Online; typing dots after you send |
| `asleep` | went quiet without saying goodbye: the computer slept or lost its network | "Asleep, seen 5 minutes ago"; after you send, "<Agent> is asleep. It gets this when its computer wakes." |
| `offline` | the gateway stopped (said `bye`) or the host was removed | "Offline, seen ..."; messages wait until it's back |
| `pending` | never paired | Waiting to connect |

`status` (`connected`/`offline`/`pending`) stays for older app builds.

**Tests.** `supabase/tests/offline_e2e.py` runs the real adapter under Hermes' real turn lifecycle with a scripted echo agent and kills it mid-turn, sends while it is dead, cuts its network while it answers, kills it with the reply only on disk, and checks every message is answered exactly once, in order. With `--sim <udid>` it also drives `YuiUITests/OfflineTests`: the phone goes offline, two messages wait, the app is killed and relaunched, the network returns, and the agent goes asleep (light and dark). Airplane mode on a real phone is a manual TestFlight check.

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
- **Any profile can hand off**, even one with no Yui agent of its own: install the plugin on it. `send_message(target="yui")`, `hermes -p <profile> send --to yui`, and cron `--deliver yui` resolve to the profile's own agent, else the user's first agent, and the push names the sender ("Coach has something for you in Yui"). Taps on that screen go to the thread's own agent, so for two-way flows add the profile as its own agent in the app.
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
- Runtime: trades the connector token for a session, subscribes to Realtime, and on each insert (or every 20 s, every 3 s while Realtime is down) reads the person's unfinished rows (see Delivery). `<profile home>/yui/cursor.json` only holds a floor per agent: a new agent starts from now, not from old history. Heartbeat every 45 s; a clean stop says `bye`; the session refreshes 10 minutes before it expires.
- Inbound is authorized upstream (RLS already limits it to the paired user), so there is no `YUI_ALLOWED_USERS` list to keep.
- The profile's Yui thread is its home channel (`YUI_HOME_CHANNEL` and `platforms.yui.home_channel` default to the profile name), so cron and cross-channel sends can target `yui`.
- Pictures from tools become a YL `image` line, and local files and generator URLs are re-hosted (see Media).

On the reference host the `yui` profile serves the Yui agent; `ops` has the plugin for handoffs only (no agent of its own). Other profiles get a thread when the user adds them from the app.

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
