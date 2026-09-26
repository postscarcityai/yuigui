# The starter agent | spec v0 (YUI-37 step 1, Sep 26 2026)

Today a stranger who downloads Yui gets an empty agent list. Yui draws screens, and every agent so far runs on its owner's own computer. The starter agent fixes that: pick Coach, Basil, Penny or Quill on first launch and it answers right away, no computer, nothing to install.

Status: design only. Nothing is built, no account was made, nothing was spent. The mock runs in the playground: [/playground?demo=starter](/playground?demo=starter). Building it is step 2, and it needs a Cloudflare account and money, so Chris signs off first (🔴, section 8).

```
 Yui app  <-->  Yui relay (Supabase, rows in yui_messages)  <--nudge / REST-->  hosted connector (Cloudflare)  --/chat/completions-->  OpenRouter  -->  the model
```

## 1. Where it runs

On Yui's hosted connector, the one [Hosting](/developers/hosting) already picked: Cloudflare Workers and Durable Objects, beside the Supabase relay. Never on anyone's own machine.

- **One connector per person.** A `yui_connectors` row of kind `hosted`, and one Durable Object for it. The starters that person picked are agents on that connector, like profiles on a Hermes install.
- **The same host contract.** It reads and writes rows through REST with a connector token, as role `yui_connector`, the same way the Hermes plugin and the bridges do. Limits, the kill switch and push work on day one, unchanged.
- **The code already exists.** A starter is the model bridge ([Model bridge](/developers/models), INT-12) running inside the object: the channel guide as the system message, the thread from the agent's own rows, a `/v1/chat/completions` call. INT-12's step 3 moves that client onto the hosted connector; the starter is its first user.
- **Why not an owner's computer.** An agent on someone's computer has a shell, files and that person's keys. None of that may reach a stranger. That is why the App Review demo agent is a script with no model at all, and why [Agents](/developers/agents) only lets an owner share an agent that passes five rules (its own profile, no shell or files outside a sandbox, no reach, memory off, an API model). A starter passes all five by design: it has no shell, no files and no tools to begin with.

## 2. The model

Two paths. The first is the plan; the second is Chris's call (question 1).

1. **The person's own OpenRouter account.** One tap: Yui opens OpenRouter's sign-in (OAuth with PKCE), the person logs in or signs up there, and OpenRouter hands back a key made for Yui. Nobody types or pastes a key. The key goes into the key vault (YUI-34), is stored in the connector's object encrypted with a Worker secret, and is only ever sent to OpenRouter. The person pays OpenRouter for what they use and can cap or revoke the key on OpenRouter any time. Yui pays for hosting only.
2. **A free tier Yui pays for (option).** A set number of turns a month on a cheap model, so the first minute needs no account at all. When it runs out, the starter says so in one card and offers the OpenRouter sign-in. Section 6 prices it.

Why OpenRouter: one key reaches every tier below, and the person can switch models without Yui adding a provider. The model bridge already speaks it (`--server openrouter`).

Whichever model runs a starter has to pass the channel eval first (YUI-10, [Channel guide](/channel)): a model that cannot draw screens reliably is not a starter. Only Opus 5.5 and Sonnet 5 have scores today. The cheap and mid models in section 5 need a run before either is the default.

The app never sells OpenRouter credit and never links to buying it. Paying Yui for model use inside the app is in-app purchase credits, YUI-45, later.

## 3. What it can do

The four starters from [Onboarding](/developers/onboarding), section 2, each a persona on top of the channel guide:

| Starter | Job, in one line | First answer |
|---|---|---|
| Coach | A trainer: plans your workouts and runs the timer. | asks how many days a week, then a week you tick off |
| Basil | A nutritionist: turns a photo of a meal into macros. | asks the goal, then a camera ([Meal photo to macros](/developers/meal)) |
| Penny | A personal assistant: keeps your lists and plans. | asks what is on this week, then a checklist |
| Quill | A study buddy: quizzes you with cards and slides. | asks a topic, then a graded question |

What a starter has:

- **Screens.** Every preset in [Yui Lines](/yl): timers, forms, pickers, decks, charts, games.
- **Agent tables.** Rows kept on the person's own phone ([Agent tables](/developers/tables)): a workout log, a meals table, a list. They never leave the phone.
- **Photos in.** Basil reads a meal photo when the model can see images.
- **The thread.** Yui holds it, as with the model bridge: each turn sends the guide, the persona and the newest rows that fit.

What a starter does not have: no tools with side effects. No web, no email, no calendar, no shell, no files, no purchases, no messages to anyone. It cannot schedule a push, so Penny's "reminders" are lists and timers on the phone, not alarms. It keeps no memory beyond the thread and the phone's tables. Connecting real tools is [Connectors](/developers/connectors) (YUI-39), after this.

With the starter live, the [onboarding](/developers/onboarding) flow's last page changes: the agents picked in `team` answer at once instead of "bring an agent".

## 4. Safety

- **Nothing to reach.** The person's own words and photos are the only input. With no tools, a prompt injection has nothing to call, send or read. What is left is the model saying something it should not, or someone running up turns. The rules below are for those.
- **The persona holds.** The guide and persona go first, as the system message, every turn. The starter never shows them, never says it is a different agent, and never asks for a password, a card or a key (the guide already says so).
- **Caps per turn.** Input trimmed to the newest rows that fit 8,000 tokens; output capped at 1,200 tokens; one photo per turn, at most 2 MB after the phone shrinks it.
- **Caps per person.** New `yui_limits` buckets, read by the connector on every wake: starter turns per person per day (100 on your own key, the free tier's size on Yui's), turns per minute (10), and open turns per person (1, so a second message waits for the first answer).
- **Caps for the whole host.** A monthly spend ceiling on Yui's own OpenRouter key, set on OpenRouter itself, so a bug cannot run up more than that. The free tier stops when it is reached; your-own-key starters keep going.
- **Kill switches.** One person: `kill_switch.py suspend connector <id>`, as today. Every starter: `hosted_enabled` off in `yui_limits` (Hosting, "Limits and the kill switch"), no deploy needed. One model: the default model is a row in `yui_limits`, so a bad model is swapped in a minute.
- **Reports (new in step 2).** A hold on any starter message offers Report. The message and its thread go to a review table; a pattern of reports suspends the connector until someone looks.
- **Privacy.** Threads live in the relay as they do now. The model provider sees each turn; Every call sets OpenRouter's `data_collection: "deny"`, so only providers that do not store prompts get the turn. Nothing from a starter thread goes into the preset flywheel.

## 5. Cost of one turn

Prices are OpenRouter's list prices per million tokens, read from `openrouter.ai/api/v1/models` on Sep 26 2026. They change; the table is an estimate, not a bill.

| Tier | Model | Input | Cached input | Output |
|---|---|---|---|---|
| Cheap | Gemini 3.1 Flash-Lite | $0.25 | $0.025 | $1.50 |
| Mid | Gemini 3.8 Flash | $0.75 | $0.075 | $3.75 |
| Frontier | Claude Sonnet 5 | $2.00 | $0.20 | $10.00 |

What one turn sends and gets back:

| Part | Tokens | Where the number comes from |
|---|---|---|
| Channel guide | 3,800 | v23 of the guide, measured by the channel eval |
| Starter persona | 300 | a paragraph per starter |
| Thread history | 2,900 | an average; the cap is 8,000 |
| New message | 50 | a line, or the event line from a tap |
| **Input** | **about 7,000** | the guide and persona (4,100) are the same every turn, so providers cache them |
| **Output** | **about 300** | a reply with a screen ([Benchmark](/developers/benchmark): screens are tens of tokens) |

Cost of one turn, with the guide and persona cached:

| Tier | No caching | With caching |
|---|---|---|
| Cheap | $0.0022 | $0.0013 |
| Mid | $0.0064 | $0.0036 |
| Frontier | $0.0170 | $0.0096 |

## 6. Cost a month

Assumptions, to be replaced by beta numbers: an active person uses a starter on 12 days a month, 10 turns a day, so **120 turns a month**. A heavy user, the worst case [Hosting](/developers/hosting) uses, sends 40 a day every day, 1,200 a month.

Model cost a month, typical use, cached:

| Users | Cheap | Mid | Frontier |
|---|---|---|---|
| 100 | $15 | $43 | $115 |
| 1,000 | $153 | $433 | $1,154 |
| 10,000 | $1,533 | $4,329 | $11,544 |

Everyone heavy is ten times that: $1.53, $4.33 and $11.54 a person a month.

On the person's own OpenRouter key, all of that is theirs, not Yui's. What Yui pays either way is hosting. 120 turns a month is 12,000 turns for 100 people, 120,000 for 1,000 and 1.2 million for 10,000. From Hosting's tables that is the $5 Workers Paid plan up to about 1,000 people, and about $11 (Workflow steps) to $57 (keep-alive) a month at 10,000, plus about $1 of Supabase Edge Function calls.

The free tier, if Chris wants one, costs its size times the cheap model's turn price. At 50 free turns a month (about four days of use):

| Users on the free tier | Cheap | Mid |
|---|---|---|
| 100 | $6 | $18 |
| 1,000 | $64 | $180 |
| 10,000 | $639 | $1,804 |

Every free user who connects OpenRouter stops costing Yui model money. A spend ceiling (section 4) caps the free tier whatever happens.

## 7. The first launch

What the [mock](/playground?demo=starter) shows, and what step 2 builds natively:

1. **No agents yet.** The agent list shows Yui and nothing else. Yui says one line and offers the four starters.
2. **Pick one.** One tap. The app asks the relay to create a hosted connector for this person (once) and the starter as an agent on it, with its look.
3. **It answers.** The starter's first message is its first answer, not a greeting: a real question on a screen that shapes the next reply.
4. **Free tier or account.** On the free tier it just runs. Without one, the first answer comes after the OpenRouter sign-in (one sheet, then back).

## 8. Step 2, the build (🔴 Chris first)

What building it needs, none of it started:

- A Cloudflare account for Yui, then Workers Paid at $5 a month plus use (the Hosting ask).
- INT-12 step 3, the model client on the hosted connector, which the starter rides.
- YUI-34's key vault, for the OpenRouter key.
- An OpenRouter app registration for the sign-in, and, only if there is a free tier, a Yui OpenRouter key with a spend ceiling and money on it.
- The channel eval on the cheap and mid models.
- The native first launch in the app (with YUI-38 step 2, the onboarding interview).

## Open questions for Chris

1. **Who pays for the model?** (a) the person, always, on their own OpenRouter account; (b) a small free tier Yui pays, then their account; (c) Yui pays for everyone until in-app credits (YUI-45) exist.
2. **Which model by default?** Cheap (Gemini 3.1 Flash-Lite), mid (Gemini 3.8 Flash) or frontier (Claude Sonnet 5)? The default is what someone meets first; the person can switch on their own key.
3. **If there is a free tier, how big?** 20, 50 or 100 turns a month, and a monthly spend ceiling on Yui's key to match.
4. **All four starters, or three?** The roadmap names a trainer, a nutritionist and an assistant; onboarding added Quill.
5. **Cloudflare now or later?** The build waits on the account. It could start as soon as INT-12 step 3 is picked, or wait for the MVP gate.

## Sources (read Sep 26 2026)

- OpenRouter models and prices: https://openrouter.ai/api/v1/models (the `pricing` of `google/gemini-3.1-flash-lite`, `google/gemini-3.8-flash`, `anthropic/claude-sonnet-5`)
- OpenRouter OAuth PKCE: https://openrouter.ai/docs/guides/overview/auth/oauth
- OpenRouter data policy routing (`data_collection`): https://openrouter.ai/docs/guides/routing/provider-selection
- Hosting costs and limits: [Hosting](/developers/hosting) (Cloudflare and Supabase list prices read Sep 25 2026)
- Channel guide size: [Channel guide](/channel) eval results, v23
