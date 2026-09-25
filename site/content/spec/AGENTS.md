# Agents in Yui | registry spec v1 (YUI-15)

Agents are added by the user. Nothing is hardcoded in the app. This file is the source of truth for the agent registry; the Hermes platform plugin (YUI-7) implements the host side of it.

Code: the app repo, `postscarcityai/yui`. Migration `supabase/migrations/20260924000000_yui_agent_registry.sql`, edge functions `supabase/functions/yui-agents` and `supabase/functions/yui-connect`, host side: the Hermes plugin `hermes-plugin/yui/` (see `spec/RELAY.md`), tests `supabase/tests/agents_test.py`.

## What it takes to connect an agent

Three things, nothing else:

1. **The user's Yui account.** Sign in with Apple (YUI-6). Every row below belongs to one `yui_users` row.
2. **A connector on the host.** A connector is one machine that runs agents, for example a Mac running Hermes. It is paired once per machine and serves every agent on that machine. It holds one secret, the connector token.
3. **Which agent on that host.** For Hermes, the profile name (`remote_ref`, e.g. `yui`, `coach`).

Name and color are optional. They default from the profile name (`coach` becomes "Coach", color is a stable pastel picked from the name).

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
| handle | slug, unique per user (`yui`, `coach`, `coach-2`) |
| color | palette token: `lavender`, `mint`, `butter`, `brand`. Legacy since YUI-20: the chip wears the agent's look |
| avatar | null = initial chip in the agent's accent; `yui` = Yui's own mark |
| theme | jsonb, the agent's look (see Look below). `{}` = its own default, seeded from its name. Object only, at most 2 KB (check constraint) |
| push_muted | boolean, default false. True: this agent's answers never push to the person's phones (YUI-24, RELAY.md "Push") |
| kind | same set as connectors |
| connector_id | null until a host claims the agent; `ON DELETE SET NULL` |
| remote_ref | Hermes profile name; unique per connector |
| is_default | at most one per user (partial unique index). Setting it clears the old default in the same write; deleting the default hands it to the first remaining agent (triggers) |
| sort | display order |
| commands, commands_at | jsonb, the /commands its host accepts, and when it last reported them. Null = no registry, no suggestions (see Commands below) |
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
| App | Yui access token (role `yui_user`, 15 min) | read own agents, connectors, pairing status and `yui_agent_list`; edit an agent's name, color, avatar, theme, sort, is_default, push_muted; delete own agents; everything in `yui-agents` | insert agents, set `connector_id`/`remote_ref`, write pairing rows, read any hash, see another user's rows |
| Management token | `yui_mt_...` to `yui-agents` only | list, create, update, delete, reorder agents, mint pairing codes, bind an agent to one of the user's existing connectors | read messages (it is not a database credential: PostgREST answers 401), manage tokens, revoke hosts, delete the account, touch another user |
| Host (connector) | `yui_ct_...` to `yui-connect` only | heartbeat, register more of its own profiles | anything in `yui-agents`, anything of another user |

## Three ways to add an agent

All three end in the same `yui_agents` row.

### a. In the app, with a code

1. Agents sheet (the nav's agents button) > Add agent > name it, pick a color > Get a pairing code.
2. The app creates a pending agent and shows a 6-digit code (10 minutes, single use) plus the command.
3. On the host: `hermes -p <profile> yui pair <code>`. That binds that profile to the agent. If the machine already has a connector for this user, it is reused; otherwise a new connector is created and its token saved on the machine.
4. Paired, the sheet waits for the profile's gateway (YUI-64): "One step left", the exact `hermes -p <profile> gateway restart` with a copy button, and "Waiting for its gateway…". The first heartbeat that names the profile flips it to "Coach is connected!". A gateway already running with the plugin picks the new agent up on its next heartbeat, so nothing to do. Until then the agent reads "Not listening yet" in the list and in its edit sheet, which shows the same step.

An agent left pending (sheet closed early) shows "Waiting to connect"; its edit sheet offers a fresh code.

### b. From the host, no code

A paired machine may register more of its own profiles for its user:

```
hermes -p coach yui add            # name "Coach", default color
hermes -p coach yui add --name "Coach Kim" --color mint
```

Adding a profile that is already registered returns the existing agent. The app's Agents sheet refreshes every 4 seconds while open, so the new agent appears live.

### c. By asking an agent (e.g. "add Coach to my Yui")

1. Settings > Agent access > Create access token. Copy it; the app never shows it again. Revoke it there any time.
2. Hand it to the managing agent, which keeps it in its own profile `.env` (e.g. `YUI_MGMT_TOKEN`).
3. The agent calls the API:

```
POST https://ewzzaoperdpxqxkshynx.supabase.co/functions/v1/yui-agents
apikey: <publishable key>
Authorization: Bearer yui_mt_...

{"action":"list"}                                   -> {agents:[...], connectors:[...]}
{"action":"create","remote_ref":"coach","connector_id":"<from list>"}   -> bound at once
{"action":"create","name":"Coach","pair":true}       -> {agent, pairing:{code, expires_at}}
{"action":"update","id":"...","name":"...","color":"mint","sort":2,"is_default":true}
{"action":"reorder","ids":["...","..."]}
{"action":"pair_code","agent_id":"..."}
{"action":"delete","id":"..."}                      -> also deletes that agent's thread
```

If the agent lives on an already-paired host, `create` with `connector_id` and `remote_ref` is all it takes. App-only actions (not allowed with a management token): `token_create`, `token_list`, `token_revoke`, `connector_revoke`.

Errors are `{"error": "<code>"}`: `unauthorized` 401, `forbidden` 403, `not_found`/`connector_not_found` 404, `already_added`/`connector_revoked` 409, `invalid_*` 400.

## Host API (`yui-connect`)

```
{"action":"pair","code":"123456","remote_ref":"coach","host_name":"Mac mini","kind":"hermes"}
    Authorization optional: send the machine's connector token to reuse its connector.
    -> {connector:{id,name,kind}, connector_token: "yui_ct_..." | null, agent}
    401 invalid_or_expired_code, 409 profile_already_added, 429 too_many_attempts
{"action":"add","remote_ref":"coach","name"?,"color"?}      Bearer yui_ct_...
    -> {created: bool, agent}
{"action":"heartbeat"}                                     Bearer yui_ct_...
    -> {connector, seen_at, agents:[{id,name,handle,remote_ref}]}
{"action":"commands","remote_ref":"coach","commands":[{name,description,args?}] | null}   Bearer yui_ct_...
    -> {agents: <rows updated>, commands: <kept>, at}
    400 invalid_commands (not a list)
```

Heartbeat at least every 60 seconds while the gateway runs; the app shows offline after 2 minutes of silence. The heartbeat reply is how the plugin learns which of its profiles are registered.

Code guessing: 10 wrong codes per client address per 10 minutes, then 429. With at most a handful of live codes among 1,000,000, that is roughly a 1 in 100,000 chance per 10-minute window of hitting someone's code, and a hit only lets the guesser's own machine serve an agent the victim named. The victim sees it bound to a host name they don't know and can remove it.

## Host credential

One connector per machine, shared by all its profiles: `~/.hermes/yui/connector.json`, mode 600, `{token, connector_id, name}`. `hermes-plugin/yui/connector.py` reads and writes it (`pair`, `add`, `heartbeat`, `status`); the plugin exposes the same calls as `hermes -p <profile> yui pair|add|status` and runs the heartbeat inside the gateway.

The connector token authenticates the registry calls above. Message transport (Realtime on `yui_messages`) uses a scoped database credential minted from this token, role `yui_connector`: see `spec/RELAY.md`.

## Commands (YUI-61)

Typing `/` at the start of the composer shows the commands the agent's host already accepts, one line each, filtered as you type. A tap fills the composer (`/new ` with a space when the command takes arguments); Send passes it through bare, as the host expects.

```json
[{"name": "new", "description": "Start a new session (fresh session ID + history)", "args": "[name]"},
 {"name": "stop", "description": "Kill all running background processes"}]
```

- **Who reports it.** The host, per profile, with `yui-connect` `commands` (above). The Hermes plugin (`hermes-plugin/yui/commands.py`) sends it when the gateway starts, when `hermes yui pair` binds a profile, when the gateway starts serving a new agent, and whenever the list changes (checked on every heartbeat, sent only when it differs). `hermes -p <profile> yui commands [--send]` prints it and reports it by hand.
- **What Hermes lists.** Its own registry, gateway-available commands only (`hermes_cli/commands.py`: never the CLI/terminal-only ones), in registry order, then plugin commands, then skills by their real `/skill-name`, the same sources as the Telegram menu. Left out because they make no sense from a phone thread: `start`, `topic`, `sethome`, `platform`, `restart`, `update`, `debug`, `codex-runtime`, `footer`, `commands` (the popover replaces it), `yolo` (never one tap from off-for-everything), `yui`. Aliases are not listed twice.
- **Cleaning.** `yui-connect` keeps entries whose `name` matches `^[a-z0-9][a-z0-9_-]{0,31}$` (a leading `/` is dropped, lowercased), one per name, description one line up to 100 characters, `args` up to 60, at most 200 entries; anything else is dropped silently so one odd plugin command cannot cost the whole list. The column holds at most 32 KB. `commands: null` clears it.
- **Where it lives.** `yui_agents.commands`, written only by the service role through `yui-connect`; the app cannot write it. The app reads it with the agent list (`yui_agent_list`, `yui-agents` `list`), so it is cached per agent with the rest of the agent and refreshes when the list does.
- **No registry, no popover.** MCP, OpenClaw, webhook and pending agents have `commands: null` and the composer shows nothing for `/`.
- Next (FLOW-1, later): Yui's own `/commands` that run a skill or a saved flow, authored per agent. The popover is shared with @mentions (YUI-44).

## Look (YUI-20)

Every agent has its own look, so you always know who you are talking to. While an agent's thread is open the whole app wears it: background, bubbles, accent, avatar chip, corner radius, type, heading weight and motion, in light and dark. Its row in the agent list wears it too.

`theme` stores a recipe, not a token set. The app compiles it into full light and dark palettes (`Yui/Sources/Theme/AgentLook.swift`), and the guardrails run there: text 4.5:1 and controls 3:1 against their backgrounds (WCAG AA), fixed radius and type scales, tap targets untouched. `scripts/check_themes.sh` in the app repo checks every set, a spread of seeded names and hostile inputs.

```json
{"preset": "autumn", "accent": "#C8642B", "bg": "#F7F0E6", "radius": "square", "font": "serif",
 "weight": "bold", "motion": "calm", "style": {"screen": "full", "buttons": "stack"},
 "at": "2026-09-24T12:00:00.123+00:00", "by": "agent"}
```

- Every key is optional. `preset` names a set (list in `YL.md`, "theme"); the other keys override it. An empty look is seeded from the handle, and an agent whose handle matches a set name (`coach`, `wizard`, ...) starts in that set.
- `style` is the agent's style profile, the screens it prefers: `screen=chat|full`, `gallery=row|feed|row3d|grid`, `chart=line|bar|area|scatter|pie|donut`, `buttons=row|stack`. Renderers use it as their defaults, and the host plugin tells the agent its look and profile on every turn (Hermes `channel_prompt`).
- `at` / `by` say when and who. An agent restyles itself with a YL `theme` line; the app applies it and saves it here through `yui-agents` `update`. A theme line older than `at` never overrides a newer pick, so replaying a thread is safe. The person picks a look in the agent's settings (`by: "user"`).
- `yui-agents` cleans the object (known keys, known words, `#RRGGBB` hex) and drops the rest. `yui-connect` `session` and `heartbeat` return each agent's `theme`, so a restyle reaches the host within a heartbeat.

## Shared agents (YUI-57, draft)

Status: step 1, the spec and a playground mock (`/playground?demo=client-invite`). Nothing below is migrated or built yet. Step 2 is the migration, the grant script with tests and a simulator proof.

The goal: the owner invites a client, and the client opens Yui for the first time with the agents the owner picked already there, each in the look the owner picked, each with a first message waiting. No pairing, no host, nothing to set up on the client's side.

### Owned and shared

- **Owned agent.** What every section above describes: a `yui_agents` row in your account, bound to your connector, talking to you. You can rename it, restyle it, delete it.
- **Shared agent.** An owned agent that its owner lets someone else talk to. The row stays in the owner's account and the agent keeps running on the owner's host. The other person gets a **grant**: the right to have their own thread with it. They see it in their agent list with the look the owner picked, can mute it and move it in the list, and cannot rename, restyle, pair or delete it.

One agent, many threads. Every person who holds a grant has a separate thread with the agent, keyed by `(agent_id, user_id)` exactly as today. The host runs each thread as its own session, so one person's history never shows up in another's.

### Templates: what an invite carries

A template is a named set of the owner's agents to hand out together, for example `client-default`, or one per client.

| field | notes |
| --- | --- |
| name | slug, the same shape as `yui_invites.agent_template` (`^[a-z0-9][a-z0-9-]{0,39}$`), unique per owner |
| title | what the owner sees, "Client default" |
| items | one per agent: the agent, its look for this template (a `theme` object as in Look above, `{}` = the agent's own), its first message (Yui Lines allowed, at most 2,000 characters), its place in the list |

`yui_invites.agent_template` (YUI-56) already exists and names the template. When the invite is claimed (first Sign in with Apple, or the code), `yui-auth` applies the template in the same transaction as the claim: one grant per item, then each item's first message as an agent row at the top of the new thread. A template can be edited any time; that changes future claims only. Grants already made keep the look and first message they were made with.

A template may name only client-safe agents (below). Saving one that names any other agent is refused.

### Grants (proposed SQL, not migrated)

```sql
-- Templates: named sets of the owner's agents.
create table public.yui_agent_templates (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.yui_users(id) on delete cascade,
  name text not null check (name ~ '^[a-z0-9][a-z0-9-]{0,39}$'),
  title text not null check (char_length(title) between 1 and 60),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_id, name)
);
create table public.yui_agent_template_items (
  template_id uuid not null references public.yui_agent_templates(id) on delete cascade,
  agent_id uuid not null,
  owner_id uuid not null,
  theme jsonb not null default '{}' check (jsonb_typeof(theme) = 'object' and pg_column_size(theme) <= 2048),
  first_message text check (char_length(first_message) between 1 and 2000),
  sort int not null default 0,
  primary key (template_id, agent_id),
  foreign key (agent_id, owner_id) references public.yui_agents(id, user_id) on delete cascade
);

-- Grants: one person may talk to one of the owner's agents.
create table public.yui_agent_grants (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid not null,
  owner_id uuid not null,
  user_id uuid not null references public.yui_users(id) on delete cascade,
  role text not null default 'user' check (role in ('user')),
  theme jsonb not null default '{}' check (jsonb_typeof(theme) = 'object' and pg_column_size(theme) <= 2048),
  first_message text check (char_length(first_message) between 1 and 2000),
  template text check (template ~ '^[a-z0-9][a-z0-9-]{0,39}$'),
  invite_id uuid references public.yui_invites(id) on delete set null,
  push_muted boolean not null default false,
  sort int not null default 0,
  granted_at timestamptz not null default now(),
  revoked_at timestamptz,
  foreign key (agent_id, owner_id) references public.yui_agents(id, user_id) on delete cascade,
  check (user_id <> owner_id)
);
create unique index yui_agent_grants_live on public.yui_agent_grants (agent_id, user_id)
  where revoked_at is null;
create index yui_agent_grants_user on public.yui_agent_grants (user_id) where revoked_at is null;

revoke all on public.yui_agent_templates, public.yui_agent_template_items, public.yui_agent_grants
  from public, anon, authenticated;
alter table public.yui_agent_templates enable row level security;
alter table public.yui_agent_template_items enable row level security;
alter table public.yui_agent_grants enable row level security;

-- True while the user holds a live grant for the agent.
create function public.yui_granted(agent uuid, uid uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.yui_agent_grants g
                  where g.agent_id = agent and g.user_id = uid and g.revoked_at is null)
$$;

-- The app: a person reads their own live grants and may change only mute and order.
grant select on public.yui_agent_grants to yui_user;
grant update (push_muted, sort) on public.yui_agent_grants to yui_user;
create policy yui_grants_holder on public.yui_agent_grants for select to yui_user
  using (user_id = public.yui_uid() and revoked_at is null);
create policy yui_grants_holder_edit on public.yui_agent_grants for update to yui_user
  using (user_id = public.yui_uid() and revoked_at is null)
  with check (user_id = public.yui_uid() and revoked_at is null);
-- The owner reads the grants they gave (who has which agent), never the threads.
create policy yui_grants_owner on public.yui_agent_grants for select to yui_user
  using (owner_id = public.yui_uid());
-- Templates are read and written only by the service role (the grant script, yui-auth).

-- Messages: today a row's (agent_id, user_id) must be the agent's owner. It becomes
-- "the owner, or someone holding a live grant", checked by a trigger instead of the
-- composite foreign key, and every policy below adds the same test.
--   yui_user read/write/delete: user_id = yui_uid()
--     and (agent owned by yui_uid() or yui_granted(agent_id, yui_uid()))
--   yui_connector read/write: yui_connector_serves(agent_id)
--     and (user_id = yui_uid() or yui_granted(agent_id, user_id))
```

What the rules add up to:

- **A client reads only their own grants and their own thread.** `user_id = yui_uid()` stays on every message policy, so no client ever reads another client's messages, or the owner's, with the same agent.
- **The owner does not read client threads in the app.** The owner's policies see who holds a grant, not what they said. The agent's host does keep the conversation (it runs the agent), and the client is told so on the first screen (below).
- **The host serves a granted thread only while the grant is live.** `yui_granted` is checked on read and on write, so a revoked client's messages stop reaching the host and the agent can no longer write into that thread.
- **The list.** `yui_agent_list` gains the person's live grants: the owner's agent row with the grant's `theme` merged over the agent's own, the grant's `push_muted` and `sort`, `shared: true` and the owner's first name. `status` is derived from the owner's connector, as for an owned agent.
- **Deleting.** The client deleting their account cascades their grants and their threads. The owner deleting the agent cascades every grant and every thread with it. Revoking (below) keeps the rows hidden for 30 days, then deletes the thread.

### Revoke

Revoke sets `revoked_at`. From that moment the grant is gone from `yui_agent_list`, the thread is unreadable (the policies test a live grant) and the host cannot write to it. The app drops the agent from the list on its next list refresh, and a push (`kind: "revoked"`, no content) makes that refresh immediate. If the client has the thread open, it closes. The list shows one quiet line, "Basil is no longer shared with you." (with the agent's name), until the app is next opened. Nothing of the thread is shown again. Granting the same agent later starts a new, empty thread.

### Client-safe: required before anyone else gets an agent

A shared agent talks to someone who is not its owner, on the owner's machine. Agents on a developer's Mac usually run every turn with a full shell, the owner's files and the owner's keys. That is fine for the owner and never fine for a client: one prompt from a client could read the owner's data or another client's. It is also why the agent Apple's reviewers talk to is scripted.

So a grant needs an agent marked `client_safe`, and an agent earns the mark only if its host reports all of this for it:

1. **Its own profile.** A Hermes profile used for nothing else. No shared memory with the owner's own agents, no keys in its `.env` beyond its own model key.
2. **No shell, no files outside its sandbox.** Terminal and code execution are off, or run in a container or on a separate host (Hermes terminal backends `docker`, `modal` or `ssh` to a machine with nothing of the owner's on it). File tools are off, or confined to the sandbox. No browser session with the owner's logins, no computer use.
3. **No reach into the rest of the host.** No delegation, cron, kanban, skill editing, messaging to other platforms, or MCP servers holding the owner's accounts.
4. **Nothing carried between people.** An agent shared with more than one person keeps memory and session search off, or scoped per person, so one client's facts never reach another's thread.
5. **A model reached through an API.** Never a model runner that is itself an agent with a shell (a local CLI agent in bypass-permissions mode, for example the Claude Code shim), whatever the Hermes toolsets say.

How it is enforced, three times:

- **The host reports it.** The Hermes plugin sends each profile's `sandbox` summary with the heartbeat: `{terminal: "off"|"container"|"remote"|"local", files: "off"|"sandbox"|"host", reach: [...], memory: "off"|"per-user"|"shared", runner: "api"|"cli-agent"}`. `yui-connect` computes `safe` from it with the five rules; the owner's app shows it on the agent's settings as "Safe to share" or "Not safe to share: it has a shell on your computer".
- **The grant script refuses.** `grant.py` (app repo, `supabase/scripts/`, step 2) refuses to save a template or make a grant for an agent that is not client-safe right now, and says which rule failed: `refused: coach is not client-safe (terminal: local shell)`, exit code 3. There is no `--force`. The same check runs in the database: an insert into `yui_agent_grants` or `yui_agent_template_items` raises unless the agent's `client_safe` is true, so neither `yui-auth` nor a hand-written query can skip it.
- **The host checks again on every turn.** Before running a turn for anyone other than the owner, the plugin re-reads its own profile's sandbox. If it no longer passes (someone turned the shell back on), the turn does not run, the client sees "This agent is paused by its owner", the owner gets a card saying which rule broke, and `client_safe` is cleared on the next heartbeat, which pauses every grant of that agent until it passes again.

New columns on `yui_agents` (written only by the service role, from the heartbeat): `client_safe boolean not null default false`, `sandbox jsonb`, `client_safe_at timestamptz`.

Owner-only features stay owner-only. War room taps, invite approvals, board reorders and `choose@need-...` answers are acted on only when the sender is the agent's owner (`user_id` equals the agent's `user_id`); from a granted user they are ignored.

### The owner's side: invite from Yui

The owner makes templates and grants by asking Yui, not in a settings screen. Yui (the project agent) runs the grant script and answers with one plan, the owner fills it in once, and Invite sends it:

```yui
say "Two of your agents are safe to share. Pick who gets what."
plan@invite "New client invite" submit=Invite
page "Who can be shared" body="Only agents marked safe to share show up here. Each one runs in its own sandbox: no shell, none of your files, nothing from your other clients." points="Penny, an assistant. Safe to share|Basil, a nutritionist. Safe to share|Scout is hidden: it has a shell on your computer"
form@who "Who is it for?" first:text! last:text! "Apple ID email":email! phone:phone
pick@agents "Which agents do they get?" "Penny, assistant"|"Basil, nutritionist"
choose@look "How should they look?" "Each agent's own"|Candy|Ocean|Forest
form@hello "What does each one say first?" "Penny says":long! "Basil says":long!
choose@save "Save this as a template?" "Save as client-default"|"Just this once"
```

On Invite, Yui runs `grant.py template save` (when asked to save) and `invite.py add` then `approve --template`, and answers with the invite link card as it does for any invite (YUI-56). A later "take Basil away from Maya" is `grant.py revoke basil <email>`, confirmed in one line.

Script surface (step 2): `grant.py safe <agent>` (show the sandbox report and which rules pass), `template save|list|show|delete`, `grant <agent> <email|user> [--look] [--hello]`, `revoke <agent> <email|user>`, `list [--user]`. Tests: a non-client-safe agent is refused by the script and by the database; a claim applies the template; a client never reads another client's thread or the owner's; revoke hides the thread and stops the host at once.

### The client's side: first open

The client signs in with Apple, the invite is claimed, and the agent list is already filled:

- A short header: "Hi Maya. Sam set these up for you."
- One row per granted agent, in its look: face, name, what it does, and the first message as the preview with a New dot.
- One plain line under the list: "These agents run on Sam's computer, which keeps your conversations. Other people Sam invites never see them."
- Tap a row and the thread opens in that agent's look with the first message waiting.

No Add agent button until the client asks for one; an invited account starts with what it was given. The client can mute a shared agent and move it; its settings sheet says "Shared by Sam" instead of rename and delete.

## Default agent while testing

Chris's account holds one agent: **Yui**, `remote_ref` `yui` (the Hermes profile at `~/.hermes/profiles/yui`), default, Yui's own mark as avatar, bound to the Mac mini's connector. Everything else Chris adds himself through the flows above.

## Not yet

- `http`, `mcp`, `hosted` connectors: the kinds exist, no host code yet.
- Realtime push of registry changes; the app polls while the Agents sheet is open.
- Shared agents (above): templates, grants, the client-safe check and revoke are specced, not built (YUI-57 step 2).
