# Where the hosted connector runs | decision memo (INT-6, Sep 25 2026)

Question: paths B and C in `spec/ADAPTERS.md` need a service Yui runs itself, one that holds long calls out to other people's agents and to model APIs. Where does it run, and should Cloudflare (Workers, Durable Objects, the Agents SDK, Flue) replace Supabase Realtime?

Research only. Nothing was built, no account was made, nothing was spent. Prices are list prices read on Sep 25 2026, so the cost tables are estimates, not a bill.

## Recommendation

1. **Keep the relay on Supabase.** Rows in `yui_messages` stay the contract, and Realtime stays the live path between phones and hosts. Everything that makes the relay safe lives in Postgres: RLS, `yui_limits`, the kill switch, exactly-once delivery, push. Moving it would mean rebuilding all of that for no gain. Cloudflare sits beside it, it does not replace it.
2. **Run the hosted connector on Cloudflare Workers + Durable Objects, through the Agents SDK.** It is just one more connector host. Each hosted connection is a `yui_connectors` row of kind `hosted`, and its own Durable Object holds that connection's token, its per-agent state and its turn queue. It reads and writes rows through the same REST API, with the same connector token, as the Hermes plugin. So limits and the kill switch work on day one, unchanged.
3. **Wake it with a nudge, not a socket.** A Postgres trigger sends a small POST ("agent X has new rows") to the Worker when a person writes to a hosted agent. A Durable Object alarm sweeps for anything a nudge missed. No object holds a Realtime socket open, so idle connections cost nothing.
4. **Long calls never trust one fetch.** On Cloudflare a plain `fetch` does not keep a Durable Object alive, even mid-stream. Model replies run inside `keepAliveWhile` (or a Workflow step once volume grows, see costs). A2A tasks use push notifications back to the Worker, `SubscribeToTask` to reconnect, and `GetTask` on a schedule as the backstop.
5. **Flue is not our host.** Flue is a framework for people building agents. Our connector does not run an agent loop, it moves messages. We use the Agents SDK directly and ship a Yui channel for Flue users separately (INT-13).
6. **Neither card needs Cloudflare to start.** INT-12 and INT-18 each have a first step that runs on a user's machine, below. The Cloudflare spike comes after, and needs an account (🔴 ask at the end).

## Why not stay all-Supabase

Supabase has no long-running worker. Edge Functions stop at 400 seconds of wall clock on paid plans (150 on free), background tasks share that cap, and a response that has not started by 150 seconds is a 504. Supabase Cron allows about 8 jobs at once, 10 minutes each. `pg_net` has a 2 second default timeout and no streaming.

That is enough for a short model reply, and cheaper than anything below. It is not enough for:

- an A2A task, which the spec says may run "potentially very" long and wait for a human,
- a reasoning model that thinks for more than a few minutes,
- one ordered turn at a time per agent, with the backlog folded in, which needs state that outlives a request.

So path C could start on Edge Functions for small replies, but path B cannot, and running two hosts for one feature is worse than one host that does both.

## Why not a small server

An always-on VM is the cheapest start: about $2 a month for Fly.io's smallest machine, about $5 to $10 on Railway. At 10,000 users one process still copes. What it lacks: one place that keeps each connection's state across crashes and deploys, isolation between connections, and scaling without us. We would own restarts, queues and a database for in-flight turns. It stays the fallback if Cloudflare is ruled out.

## The comparison

| | Supabase only (Edge Functions, Realtime, Cron) | Cloudflare beside Supabase | Small VM beside Supabase |
| --- | --- | --- | --- |
| Long outbound calls | 400 s cap per run, then cut | no wall-clock cap while kept alive; Workflow steps have none | none |
| Streaming model replies | yes, up to the cap | yes, inside `keepAliveWhile` | yes |
| A2A tasks (minutes to hours) | only by polling from Cron, 8 jobs at a time | alarms and `schedule()` (tens of thousands per object), push callbacks | yes, we build the scheduler |
| Per-agent state | Postgres rows only | SQLite inside each Durable Object, up to 10 GB each | our own database |
| One turn at a time per agent | hard: no lock that outlives a request | natural: one object per connection runs one thing at a time | we build it |
| Survives a crash or deploy | each run is short, so yes | a deploy restarts every object; `runFiber` checkpoints and resumes | we build it |
| Limits and kill switch | already enforced in Postgres | same, through the connector token, plus a global off switch | same |
| New accounts | none | a Cloudflare account (🔴) | a Fly or Railway account (🔴) |

### Limits and the kill switch on the new host

- **Nothing moves.** The hosted connector writes through REST as `yui_connector`, so every `yui_limits` bucket (replies per host, pushes per host, message size) and every trigger applies to it. Do not connect it to Postgres directly (Hyperdrive): a direct connection skips RLS unless it switches role, and that is easy to get wrong.
- **One connection:** `kill_switch.py suspend connector <id>` works as today. The next REST call gets `403 suspended`, and the object stops and sleeps until restored. The nudge trigger also skips suspended connectors.
- **The whole host:** a new row in `yui_limits`, `hosted_enabled`, read by the Worker on every wake (cached a minute). Off means every object stops at its next step, with no deploy. Cloudflare's own rollback is the last resort.
- **New limits it needs:** calls out per connection per minute, longest call, open A2A tasks per connection. They go in `yui_limits` like the rest.
- **Secrets:** connection tokens and (later) the user's model keys are stored in the object encrypted with a Worker secret. Keys come from the YUI-34 vault; nothing is typed into a chat.

## Costs at 10, 1,000 and 10,000 users

Assumptions, all of them guesses to be replaced with real numbers from the beta:

- every user is on a hosted connection (the worst case; most people today bring their own Hermes, which costs us nothing here),
- 40 turns per user per day, so 1,200 a month,
- a turn waits 30 seconds on the model or agent, with a 128 MB object,
- a turn is about 4 billed requests (nudge, object call, keep-alive alarms) and 10 ms of CPU.

**Cloudflare, Workers Paid plan ($5 a month).** Included: 10M Worker requests, 30M CPU ms, 1M object requests, 400,000 GB-s of object time, 50M SQLite rows written.

| Users | Turns a month | Object requests | Object time (GB-s) | Estimate, keep-alive | Estimate, Workflow steps |
| --- | --- | --- | --- | --- | --- |
| 10 | 12,000 | 48,000 | 45,000 | $0 on the free plan, $5 on paid | $5 |
| 1,000 | 1.2M | 4.8M | 4.5M | about $57 | about $11 |
| 10,000 | 12M | 48M | 45M | about $570 | about $100 |

Object time is billed on wall clock while an object is awake, so waiting on a slow model is what costs money. Moving the wait into a Workflow step changes the bill to CPU plus $0.80 per 100,000 steps (500,000 included), which is why the design starts with `keepAliveWhile` for simplicity and moves the long call into a Workflow step once there is volume.

**Supabase, both options.** These costs exist whichever host we pick, since the relay stays:

| Users | Edge Function calls (2M included, then $2 per million) | Realtime messages (5M included, then $2.50 per million) | Peak Realtime connections (500 included, then $10 per 1,000) |
| --- | --- | --- | --- |
| 10 | included | included | included |
| 1,000 | about $1 | included | included |
| 10,000 | about $45 | about $80 | about $15 |

At 10,000 users the bigger cost is not either host. It is database compute: every turn is a few row writes on a shared database. Watch that before the connector bill.

**All-Supabase path C** (short replies only) would add almost nothing to the table above, since Edge Functions bill per call, not per second. That is its real advantage, and why a stopgap there stays an option.

## First steps

### INT-12, model connector

Changes from the card: the first step needs no host.

1. **Local first.** A small process on the user's machine, forked from the webhook bridge (INT-2, same pairing, same delivery rules, same outbox), that calls any `/v1/chat/completions` URL with a model name. The channel guide is the system message; the thread history comes from the agent's own rows. Test against Ollama on a Mac. No Cloudflare, no key vault, since local servers need no key.
2. **YUI-10's eval** on each local model we name, so a model under the bar gets plain text only.
3. **Then hosted,** for cloud endpoints (Meta, xAI, Gemini, OpenRouter): the same code inside the Durable Object, after YUI-34 stores the user's key. This step waits on the Cloudflare account.

### INT-18, A2A client

Changes from the card: the first step needs no host either.

1. **A TypeScript A2A client module** that only needs `fetch` and an SSE parser, so the same code runs in Node and in a Worker. It reads an Agent Card, sends a message, streams the task, reconnects with `SubscribeToTask`, falls back to `GetTask`, and speaks both A2A 1.0 (`SendMessage`, `SendStreamingMessage`) and the older 0.3 names (`message/send`, `message/stream`), since agents in the wild run both.
2. **Run it as a local bridge** on a user's machine against one sample A2A agent (Google's ADK samples), turning replies into rows with the relay's delivery rules. The channel guide goes in as a context part on each task's first message.
3. **Then hosted:** wrap the module in the Durable Object, add push notification callbacks to the Worker and the long-task limits above. This step waits on the Cloudflare account and on YUI-34 for per-agent keys.

## 🔴 One ask for Chris, when INT-12 or INT-18 reach their hosted step

A Cloudflare account for Yui. The free plan covers the spike (Durable Objects with SQLite are on the free plan; Workers free allows 10 ms of CPU a call, which may be tight). Going live needs Workers Paid at $5 a month plus usage, estimated above. Nothing is needed today.

## Sources (read Sep 25 2026)

- Workers pricing: https://developers.cloudflare.com/workers/platform/pricing/ (updated Aug 28 2026)
- Workers limits: https://developers.cloudflare.com/workers/platform/limits/ (Sep 5 2026). No wall-clock cap while the client is connected; `waitUntil` gets 30 s; CPU up to 5 min.
- Durable Objects pricing: https://developers.cloudflare.com/durable-objects/platform/pricing/ (Aug 25 2026)
- Durable Objects limits: https://developers.cloudflare.com/durable-objects/platform/limits/ (Jun 1 2026)
- Durable Object lifecycle: https://developers.cloudflare.com/durable-objects/concepts/durable-object-lifecycle/ (Jul 3 2026). Evicted after 70 to 140 s idle; outbound sockets keep it alive 15 min at most; `fetch` never does, even while streaming; a deploy restarts every object.
- Alarms: https://developers.cloudflare.com/durable-objects/api/alarms/ (Apr 21 2026)
- Agents SDK: https://developers.cloudflare.com/agents/ (Sep 18 2026); scheduling https://developers.cloudflare.com/agents/runtime/execution/schedule-tasks/ (Jun 3 2026); `keepAliveWhile` and `runFiber` https://developers.cloudflare.com/agents/runtime/execution/durable-execution/ (Aug 20 2026)
- Workflows limits and pricing: https://developers.cloudflare.com/workflows/reference/limits/ (Sep 21 2026), https://developers.cloudflare.com/workflows/reference/pricing/
- Outbound WebSockets from Workers: https://developers.cloudflare.com/workers/runtime-apis/websockets/ (Apr 23 2026)
- Hyperdrive with Supabase: https://developers.cloudflare.com/hyperdrive/examples/connect-to-postgres/postgres-database-providers/supabase/ (Apr 21 2026)
- Flue: https://blog.cloudflare.com/agents-platform-flue-sdk/ (Jun 17 2026), https://github.com/withastro/flue (Apache-2.0, 1.0 beta)
- Supabase Edge Function limits: https://supabase.com/docs/guides/functions/limits; background tasks https://supabase.com/blog/edge-functions-background-tasks-websockets
- Supabase pricing (Pro, Edge Functions, Realtime): https://supabase.com/pricing; Realtime limits https://supabase.com/docs/guides/realtime/limits
- Supabase Cron, Queues, pg_net: https://supabase.com/docs/guides/cron, https://supabase.com/docs/guides/queues, https://supabase.com/docs/guides/database/extensions/pg_net
- A2A 1.0: https://a2a-protocol.org/latest/specification/
- Fly.io pricing: https://fly.io/docs/about/pricing/; Railway pricing: https://railway.com/pricing
