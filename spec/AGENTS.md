# Agents in Yui | registry spec v1 (YUI-15)

Agents are added by the user. Nothing is hardcoded in the app. This file is the source of truth for the agent registry; the Hermes platform plugin (YUI-7) implements the host side of it.

Code: `~/dev/yui` (app repo). Migration `supabase/migrations/20260924000000_yui_agent_registry.sql`, edge functions `supabase/functions/yui-agents` and `supabase/functions/yui-connect`, host client `hermes-plugin/yui_connect.py`, tests `supabase/tests/agents_test.py`.

## What it takes to connect an agent

Three things, nothing else:

1. **The user's Yui account.** Sign in with Apple (YUI-6). Every row below belongs to one `yui_users` row.
2. **A connector on the host.** A connector is one machine that runs agents, for example a Mac running Hermes. It is paired once per machine and serves every agent on that machine. It holds one secret, the connector token.
3. **Which agent on that host.** For Hermes, the profile name (`remote_ref`, e.g. `yui`, `monk`).

Name and color are optional. They default from the profile name (`monk` becomes "Monk", color is a stable pastel picked from the name).

## Data model

All tables live in PROOF, `public` schema, and cascade from `yui_users` (`ON DELETE CASCADE`). Deleting the account leaves zero rows (tested).

### yui_connectors: one per agent host

| column | notes |
| --- | --- |
| id, user_id | owner; `unique (id, user_id)` so agents can only point at their owner's connector |
| name | host name, e.g. "Chris's Mac mini" (the Mac's ComputerName by default) |
| kind | `hermes` now; `http`, `mcp`, `hosted` reserved |
| token_hash | SHA-256 of the connector token `yui_ct_...`. The token itself is never stored |
| created_at, last_seen_at | `last_seen_at` is the heartbeat |
| revoked_at | set when the user unpairs the host; the token stops working |

### yui_agents: one per agent

| column | notes |
| --- | --- |
| id, user_id | owner |
| name | 1 to 40 chars, what the app shows |
| handle | slug, unique per user (`yui`, `monk`, `monk-2`) |
| color | palette token: `lavender`, `mint`, `butter`, `brand` |
| avatar | null = initial chip in `color`; `yui` = Yui's own mark |
| theme | jsonb, empty now; reserved for per-agent themes |
| kind | same set as connectors |
| connector_id | null until a host claims the agent; `ON DELETE SET NULL` |
| remote_ref | Hermes profile name; unique per connector |
| is_default | at most one per user (partial unique index). Setting it clears the old default in the same write; deleting the default hands it to the first remaining agent (triggers) |
| sort | display order |
| created_at, updated_at | |

**status** is derived, never stored. The view `yui_agent_list` (security invoker, so RLS applies) adds it:

- `pending`: no connector yet.
- `connected`: the connector sent a heartbeat in the last 2 minutes and is not revoked.
- `offline`: bound, but the host is silent or revoked.

Deleting an agent deletes its thread: `yui_messages` and `yui_pairings` cascade on `(agent_id, user_id)`.

### yui_pairings: 6-digit codes

One row per code: `agent_id`, `code_hash` (SHA-256), `expires_at` (10 minutes), `used_at` (single use), `connector_id` (who claimed it). An unused code hash is unique across all users, because the host looks it up without knowing whose it is. Minting a new code for an agent deletes that agent's unused ones.

### yui_mgmt_tokens: Settings > Agent access

`name`, `token_hash`, `scope` (only `agents:manage`), `created_at`, `last_used_at`, `revoked_at`. The token `yui_mt_...` is shown once in the app and stored only as a hash.

### yui_pair_attempts

Failed code claims per client address, used for throttling. No user data.

## Who may do what

| caller | how it authenticates | may | may not |
| --- | --- | --- | --- |
| App | Yui access token (role `yui_user`, 15 min) | read own agents, connectors, pairing status and `yui_agent_list`; edit an agent's name, color, avatar, theme, sort, is_default; delete own agents; everything in `yui-agents` | insert agents, set `connector_id`/`remote_ref`, write pairing rows, read any hash, see another user's rows |
| Management token | `yui_mt_...` to `yui-agents` only | list, create, update, delete, reorder agents, mint pairing codes, bind an agent to one of the user's existing connectors | read messages (it is not a database credential: PostgREST answers 401), manage tokens, revoke hosts, delete the account, touch another user |
| Host (connector) | `yui_ct_...` to `yui-connect` only | heartbeat, register more of its own profiles | anything in `yui-agents`, anything of another user |

## Three ways to add an agent

All three end in the same `yui_agents` row.

### a. In the app, with a code

1. Agents sheet (the nav's agents button) > Add agent > name it, pick a color > Get a pairing code.
2. The app creates a pending agent and shows a 6-digit code (10 minutes, single use) plus the command.
3. On the host: `hermes -p <profile> yui pair <code>`. That binds that profile to the agent. If the machine already has a connector for this user, it is reused; otherwise a new connector is created and its token saved on the machine.
4. The app polls and flips to "Monk is connected!".

An agent left pending (sheet closed early) shows "Waiting to connect"; its edit sheet offers a fresh code.

### b. From the host, no code

A paired machine may register more of its own profiles for its user:

```
hermes -p monk yui add            # name "Monk", default color
hermes -p monk yui add --name "Brother Monk" --color mint
```

Adding a profile that is already registered returns the existing agent. The app's Agents sheet refreshes every 4 seconds while open, so the new agent appears live.

### c. By asking an agent (e.g. "add Monk to my Yui")

1. Settings > Agent access > Create access token. Copy it; the app never shows it again. Revoke it there any time.
2. Hand it to the managing agent, which keeps it in its own profile `.env` (e.g. `YUI_MGMT_TOKEN`).
3. The agent calls the API:

```
POST https://ewzzaoperdpxqxkshynx.supabase.co/functions/v1/yui-agents
apikey: <publishable key>
Authorization: Bearer yui_mt_...

{"action":"list"}                                   -> {agents:[...], connectors:[...]}
{"action":"create","remote_ref":"monk","connector_id":"<from list>"}   -> bound at once
{"action":"create","name":"Monk","pair":true}       -> {agent, pairing:{code, expires_at}}
{"action":"update","id":"...","name":"...","color":"mint","sort":2,"is_default":true}
{"action":"reorder","ids":["...","..."]}
{"action":"pair_code","agent_id":"..."}
{"action":"delete","id":"..."}                      -> also deletes that agent's thread
```

If the agent lives on an already-paired host, `create` with `connector_id` and `remote_ref` is all it takes. App-only actions (not allowed with a management token): `token_create`, `token_list`, `token_revoke`, `connector_revoke`.

Errors are `{"error": "<code>"}`: `unauthorized` 401, `forbidden` 403, `not_found`/`connector_not_found` 404, `already_added`/`connector_revoked` 409, `invalid_*` 400.

## Host API (`yui-connect`)

```
{"action":"pair","code":"123456","remote_ref":"monk","host_name":"Mac mini","kind":"hermes"}
    Authorization optional: send the machine's connector token to reuse its connector.
    -> {connector:{id,name,kind}, connector_token: "yui_ct_..." | null, agent}
    401 invalid_or_expired_code, 409 profile_already_added, 429 too_many_attempts
{"action":"add","remote_ref":"monk","name"?,"color"?}      Bearer yui_ct_...
    -> {created: bool, agent}
{"action":"heartbeat"}                                     Bearer yui_ct_...
    -> {connector, seen_at, agents:[{id,name,handle,remote_ref}]}
```

Heartbeat at least every 60 seconds while the gateway runs; the app shows offline after 2 minutes of silence. The heartbeat reply is how the plugin learns which of its profiles are registered.

Code guessing: 10 wrong codes per client address per 10 minutes, then 429. With at most a handful of live codes among 1,000,000, that is roughly a 1 in 100,000 chance per 10-minute window of hitting someone's code, and a hit only lets the guesser's own machine serve an agent the victim named. The victim sees it bound to a host name they don't know and can remove it.

## Host credential

One connector per machine, shared by all its profiles: `~/.hermes/yui/connector.json`, mode 600, `{token, connector_id, name}`. `hermes-plugin/yui_connect.py` reads and writes it today (`pair`, `add`, `heartbeat`, `status`); the YUI-7 plugin wraps the same calls as `hermes -p <profile> yui pair|add` via `ctx.register_cli_command` and runs the heartbeat inside the gateway.

The connector token authenticates the registry calls above. Message transport (Realtime on `yui_messages`) needs a scoped database credential; YUI-7 defines it (a `yui_connector` role minted from this token), not this spec.

## Default agent while testing

Chris's account holds one agent: **Yui**, `remote_ref` `yui` (the Hermes profile at `~/.hermes/profiles/yui`), default, Yui's own mark as avatar, bound to the Mac mini's connector. Everything else Chris adds himself through the flows above.

## Not yet

- Per-agent themes (`theme` is stored, not rendered).
- `http`, `mcp`, `hosted` connectors: the kinds exist, no host code yet.
- Realtime push of registry changes; the app polls while the Agents sheet is open.
