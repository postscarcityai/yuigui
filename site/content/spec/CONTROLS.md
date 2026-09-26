# Agent controls | spec v1 (YUI-70, draft)

The drawer (YUI-54) has four tabs: Home, Review, Controls and About. Controls is where you look after what the agent you are talking to is made of: its personality, what it remembers, its skills, its schedules, and which model and tools it runs on. Plain create, read, update and delete, one tap from the chat.

A change goes straight to the machine the agent runs on. There is no chat turn in between: nothing is typed to the agent, no model is called, the change lands in a second and the screen shows the new state. The agent hears about it afterwards in one short line.

Step 1 (this page) is the design: what each area does, how a change travels, what the host refuses. The mock is in the playground: [/playground?demo=controls](/playground?demo=controls). To change an item by talking to the agent instead, see [Talk about this](/developers/talk-about) (YUI-69). Step 2 builds it in the app and the Hermes plugin; its acceptance is at the end.

## 1. What Controls shows

Each area is one screen. Text is shown rendered, with an Edit toggle; nobody sees raw JSON, a config file or a log. Every delete asks first.

| Area | Read | Write | Delete |
| --- | --- | --- | --- |
| Personality | the agent's SOUL.md, rendered | edit in a markdown editor, Save | no (an agent always has one) |
| Memory | its memory entries and its notes about you, newest first | edit one entry | Forget one, after a confirm |
| Skills | every skill: name, one-line description, on or off | open SKILL.md, edit, Save; switch on or off | Delete, after a confirm (skills you added only) |
| Schedules | every scheduled job: name, when, next run, paused or not | edit the prompt and the time; Pause, Resume, Run now | Delete, after a confirm |
| Model and tools | model and provider, toolsets on or off | not in step 2 (read first) | no |
| Channels | where else the agent lives (Telegram and so on) | no | no |

### Personality

- Shows SOUL.md rendered, with its headings as a small outline at the top.
- Edit opens the markdown text in a full-screen editor. Save sends it; Cancel drops it. The editor keeps a draft on the phone if the app closes mid-edit.
- The file has a size cap (32 KB). An empty save is refused: an agent needs a personality.

### Memory

- Two lists: **What it remembers** (the agent's own memory entries) and **About you** (its notes on the person).
- Each row is one entry, its first line as the title. A tap opens it in full with Edit and Forget.
- Forget asks: "Forget this? Scout will not remember it next time." Forget | Keep it. The entry is removed on the host and kept in the host's trash for 30 days.
- Adding a memory by hand is not in step 2. Ask the agent to remember something instead.

### Skills

- One row per skill: name, description, a switch. The switch turns the skill off for this agent without deleting it (the host's disabled list).
- A tap opens SKILL.md rendered, with Edit. A save must keep the frontmatter (`name`, `description`) or the host refuses it.
- Delete is offered only for skills the person or the agent added. Skills that ship with the host can be switched off, never deleted, because the next update would bring them back.
- Delete asks: "Delete the skill tan-studio? Its folder goes to the trash for 30 days." Delete | Keep it.

### Schedules

- One row per job: name, when it runs in words ("weekdays 8:00"), next run, and a Paused chip when paused.
- A tap opens the job: its prompt (rendered), its time, where it delivers (read only), the last run and whether it worked.
- Pause, Resume and Run now are one tap each. Run now means on the next scheduler tick, usually within a minute; the row shows "Running soon".
- Edit changes the prompt and the time. The time is a picker (every N minutes, daily at, weekdays at, or a cron line for people who want one); the host checks it parses before saving.
- Delete asks: "Delete the schedule morning brief? It will stop running." Delete | Keep it.

### Model and tools (read first)

- Model and provider in words ("Claude on this Mac", "GPT through OpenRouter"), and each toolset with an on or off dot.
- Nothing here is editable in step 2. Switching a model can break an agent in ways the phone cannot see (a missing key, a model that cannot call tools). Editing waits until the host can test a model before it switches (later card).
- API keys never show here, not even masked. See section 4.

### Channels

- Read only: each place the agent also answers (Telegram, Discord, email), with the account's display name. No tokens, no chat ids.

## 2. How a change travels

```
app  ->  relay (yui_messages, kind=control)  ->  host plugin  ->  files and CLI on the host
app  <-  relay (yui_messages, kind=control)  <-  host plugin  <-  the new state
```

The host sits behind a home router, so the phone cannot call it directly. The relay is already the one path between them (spec/RELAY.md), so controls ride it too, as their own message kind. They never enter the thread and never start an agent turn, the same pattern the board reorder (YUI-66) and one-tap answers (YUI-73) use today.

### Capability report (what the host supports)

Before the app shows anything, it needs to know what this agent's host can do. The host says so once, through `yui-connect`, next to its commands (spec/AGENTS.md, Commands):

```
{"action":"controls","remote_ref":"scout","controls":{
   "v": 1,
   "sections": {"soul":"rw", "memory":"rwd", "skills":"rwd", "schedules":"rwd", "model":"r", "channels":"r"}
}}                                                        Bearer yui_ct_...
    -> {agents: <rows updated>, at}
```

- `r` read, `w` write, `d` delete. A section the host leaves out is not shown.
- Stored in `yui_agents.controls`, written only by the service role through `yui-connect`, read by the app with the agent list (`yui_agent_list`). `controls: null` clears it.
- The Hermes plugin sends it when the gateway starts and when a profile binds, like `commands`.
- **Hosts other than Hermes show only what they report.** An OpenClaw, webhook, A2A, MCP or model-bridge agent reports nothing today, so its Controls tab shows the About card and one line: "This agent's host doesn't share its settings yet."

### Control rows

A control is one row in `yui_messages` with `kind = 'control'`. The body is a short plain line for anyone reading the table (`controls: forget memory m-3`); `meta` carries the operation.

App to host (`sender = 'user'`):

```json
{"v": 1, "req": "c-8f2a", "op": "put", "section": "soul", "id": "SOUL.md",
 "rev": "b41c09", "value": {"text": "# Scout\n..."}}
```

| op | does | needs |
| --- | --- | --- |
| `list` | the section's rows, no bodies | `section` |
| `get` | one item in full, with its `rev` | `section`, `id` |
| `put` | replace one item | `section`, `id`, `rev`, `value` |
| `act` | one verb on one item: `pause`, `resume`, `run`, `enable`, `disable` | `section`, `id`, `verb` |
| `delete` | remove one item (to the host's trash) | `section`, `id`, `rev`, `confirmed: true` |

Host to app (`sender = 'agent'`), one answer per request, same `req`:

```json
{"v": 1, "req": "c-8f2a", "ok": true, "section": "soul", "id": "SOUL.md", "rev": "7d02e1",
 "item": {"text": "# Scout\n...", "updated": "2026-09-26T14:02:11Z"}}
```

```json
{"v": 1, "req": "c-8f2a", "ok": false, "error": "conflict",
 "message": "Changed on the host since you opened it.", "rev": "7d02e1", "item": {"text": "..."}}
```

- **Versioning, two ways.** `v` is the protocol version: a host that gets a `v` it does not know answers `{"ok": false, "error": "version"}` and the app shows "Update the Yui plugin on your Mac". `rev` is the item's version (the first 12 hex of a SHA-256 of what the host holds). A `put` or `delete` whose `rev` is not current is refused with `conflict` and the current item, so two edits (the phone and a terminal, or two phones) never clobber each other. The app shows both and lets the person pick.
- **Hidden.** The app never draws control rows in the thread. The plugin never hands them to the agent as a turn. Row retention: control rows are deleted after 7 days (they are not history).
- **Answer time.** The host answers within 5 seconds or the app shows "Your Mac didn't answer" with Try again. A host that is offline (no heartbeat for 2 minutes) greys out the Controls tab instead of queueing edits.
- **Afterwards.** On its next turn the agent gets one line, the way it hears about a board reorder: `[yui] Your settings changed in Controls: one memory forgotten, "morning brief" paused.`

### What the Hermes plugin maps each section to

| Section | On the host |
| --- | --- |
| soul | the profile's `SOUL.md` |
| memory | the profile's memory store (`memories/MEMORY.md`, `memories/USER.md`), one entry per item |
| skills | the profile's skills folders, and its disabled-skills list for on and off |
| schedules | `hermes cron list`, `edit`, `pause`, `resume`, `run`, `remove` for that profile |
| model | the profile's model and toolset settings, read only |
| channels | the profile's enabled platforms, names only |

Every write goes through the same code the CLI uses, so the host's own checks run. Before a write the plugin copies the old file into `<profile home>/yui/controls-trash/`; trash older than 30 days is swept.

## 3. What the host refuses

The host is the last line and does not trust the phone. It answers `ok: false` with a plain `message` for:

- **Not the owner.** Any control row from anyone but the agent's owner (`yui_agents.user_id`). A person an agent is shared with (spec/AGENTS.md, Shared agents, YUI-95 and YUI-97) never gets Controls: the app does not show the tab, the relay does not accept the row (section 5), and the host refuses it anyway.
- **Anything outside the section's files.** Ids are names from the host's own `list`, never paths. `..`, `/`, and names that are not in the last list are refused.
- **Secrets, always.** See section 4.
- **A stale `rev`** (`conflict`), a missing `confirmed: true` on a delete, an unknown `op`, `section` or `verb`, or a `v` it does not speak.
- **Deleting what cannot go:** SOUL.md, and skills that ship with the host (switch them off instead).
- **Bad content:** a SKILL.md without frontmatter, a schedule time that does not parse, an empty personality, any value over 32 KB.
- **Too fast:** more than 30 control writes a minute per agent.

Every accepted change is logged on the host, one JSON line in `<profile home>/yui/controls.log`: time, who (Yui user id), op, section, id, old and new `rev`. Nothing in the log leaves the host.

## 4. Secrets never leave the host

- `.env` files, `auth.json`, API keys, OAuth tokens, bot tokens, connector tokens and passwords are never listed, never sent, never editable from the phone. They are not masked either: they do not exist as far as Controls knows.
- The Model and tools screen names the provider, not the key. Channels names the account, not its token or chat id.
- Before any item goes out (a memory entry, a SKILL.md, a schedule prompt), the plugin runs it through the host's secret redaction. A line that looks like a key shows as `[hidden on your Mac]` and the item is marked read only, so a save cannot write the placeholder back over the real value.
- Changing a key stays a job for the host's own setup (`hermes setup`, `hermes config`), never the app.

## 5. Relay changes (applied: migration `20260926000000_yui_controls`)

```sql
alter table yui_messages drop constraint yui_messages_kind_check;
alter table yui_messages add constraint yui_messages_kind_check
  check (kind in ('text', 'event', 'control'));

-- A control row is only the owner's: a grantee can read and write the thread
-- of an agent shared with them, never its controls.
create policy yui_messages_control_owner on yui_messages as restrictive
  for insert to yui_user
  with check (kind <> 'control' or exists (
    select 1 from yui_agents a where a.id = agent_id and a.user_id = auth.uid()));

alter table yui_agents add column controls jsonb;  -- the capability report
```

Plus `yui_retention` deletes `kind = 'control'` rows older than 7 days, and push skips control rows (no notification for a settings answer).

## 6. Not yet

- Editing the model or toolsets (after the host can test a model before switching).
- Adding a memory or a new skill by hand in Controls.
- Talking about a setting in the chat and letting the agent propose the change (YUI-69): designed in [Talk about this](/developers/talk-about), built after step 2.
- Controls for hosts other than Hermes: each bridge reports the sections it can serve, starting with OpenClaw.
- Undo from the phone: the trash exists on the host in step 2; a Restore button comes later.

## Step 2 (native)

Done when all of this is true, with proof on the card:

1. **Capability report.** The Hermes plugin sends `controls` through `yui-connect` at gateway start and on bind; `yui_agents.controls` holds it; `yui_agent_list` returns it. A non-Hermes agent's Controls tab shows only the About card and the "doesn't share its settings yet" line.
2. **Migration applied** (section 5): the `control` kind, the owner-only insert policy, the `controls` column, retention and no push for control rows.
3. **Plugin.** `hermes-plugin/yui/controls.py` serves `list`, `get`, `put`, `act` and `delete` for soul, memory, skills and schedules, and `list` and `get` for model and channels. Control rows never reach the agent as a turn; the agent gets the one-line note on its next turn. Tests cover each op, a `conflict`, a grantee refused, a path id refused, a secret redacted and the redacted item read only, a bundled skill refused for delete, the trash copy and the log line.
4. **App.** The drawer's Controls tab for the current agent, one screen per area, light and dark, rendered markdown with an Edit toggle, a confirm on every delete, the conflict screen, the offline state. Only the owner sees the tab; a shared agent's drawer has no Controls.
5. **Round trips on a real phone,** each with a screenshot before and after: edit SOUL.md and see it on the host; forget one memory; switch a skill off and on; pause a schedule, resume it, run it now.
6. **No secrets.** A test profile with keys in `.env` and a token-shaped line in a memory entry: nothing key-shaped reaches `yui_messages` (checked with a query after the round trips).
7. Shipped in a VALID TestFlight build, with a progress entry and screenshots.

## As built (step 2, YUI-70)

- **Relay.** Migration `20260926000000_yui_controls` (in the app repo, applied to the database): the `control` kind; a restrictive insert policy so only the agent's owner writes one (a grantee gets a row-level-security refusal); the host may answer a control only into its owner's thread; `meta` may hold 64 KB on a control row (room for a 32 KB SOUL.md), 16 KB on every other kind; `yui_agents.controls` and `controls_at`; `yui_agent_list.controls` (null on a shared agent's row); `yui_retention` deletes control rows after 7 days (`control_rows`).
- **yui-connect** takes `{"action": "controls", "remote_ref", "controls"}`, keeps only the sections and modes above (a host cannot grant itself model writes), and refuses a `v` it does not know. **yui-push** refuses a control row (`control_row`).
- **Answers** carry `meta.for` (the request row's id), not `meta.turn`, so no mention or group trigger wakes on a settings answer. The app finds its answer by `meta->>req`.
- **Plugin.** `hermes-plugin/yui/controls.py`, wired in the adapter before any other routing. Ids: `SOUL.md`; `mem-<hash>` and `user-<hash>` for memory entries (the id follows the entry's text, so an edit answers with a new id); a skill's folder name; a cron job id; `model`; a platform name. Memory writes take the memory tool's lock and pass its injection scan and size limit. Switching a skill off writes `skills.disabled` through `hermes_cli.skills_config`. Schedules go through `cron.jobs` (update, pause, resume, trigger, remove). The capability report goes out on gateway start and when the gateway serves a new agent. Tests: `hermes-plugin/tests/test_controls.py`.
- **Secrets.** Each line of an outgoing text is checked with the host's redaction (`agent.redact`, forced) and a set of token shapes of its own; a matching line goes out whole as `[hidden on your Mac]` and the item is read only. The model screen names the provider in words and never the key or URL.
- **App.** The drawer's Controls tab lists the areas its host reports. Each opens its own screen; a pushed item has Edit (a full-screen editor with a draft kept on the phone), and every delete is an alert with the action and Keep it. A save on a stale rev opens the conflict screen: your version and the Mac's, Keep mine or Use the Mac's. The host not answering in 5 seconds reads "Your Mac didn't answer" with Try again. A host that is not online greys the rows out with one line. No report: the About card and "This agent's host doesn't share its settings yet." A shared agent's drawer has no Controls tab.
- **Proof.** `supabase/tests/controls_test.py` (live relay), `supabase/tests/controls_e2e.py --sim` (the simulator's round trips against a throwaway host served by the plugin's own code, then a query for anything key-shaped in `yui_messages`), `YuiUITests/ControlsTests` (every screen in light and dark on the demo host).

