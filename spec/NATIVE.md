# Native Yui | spec v1 (YUI-129, NATIVE-1, Sep 26 2026)

Every person who signs in to Yui gets their own Yui: an agent that lives with the app, answers on the first launch, and can make more agents for you. It is a starter anyone can read, run and fork. It sits beside the agents you connect (Hermes, OpenClaw, a webhook), not in place of them.

Status: design. Nothing is built yet. This page replaces the [Starter agent](STARTER.md) plan (YUI-37): same goal, a different home and a bigger crew. A real Hermes of your own, for people who want one, is tier 2: [Hermes for everyone](HERMES-HOSTED.md) (NATIVE-2).

```
 any Yui client (iPhone, web, Mac, Android)
        |  rows in yui_messages, as today
        v
 Yui relay (Supabase)  --new row webhook-->  native runtime (Supabase Edge Function)  --/chat/completions-->  OpenRouter  -->  GLM 5.2 / GLM-5V-Turbo
```

## 1. What every person gets

- **Yui, first.** The first agent in the list, talking on the first launch. Yui is a helper and a maker: she does the work herself, hands you to the right agent, and makes a new one when you ask ("make me a Spanish tutor").
- **The starter crew, already there.** Arnold, Basil, Gouda, Penny and Quill sit in the list from the first sign-in (section 5).
- **Nothing to install.** No computer, no pairing code, no key. The first 100 turns a month are on Yui (section 7).
- **It comes back.** Agents, their settings and their memory are rows on your account. Sign in on a new phone, or on the web, and they are all there.

## 2. Where it runs

On a server, never on the phone. The phone lends its hands: the camera, agent tables, the synth, the timer and its Live Activity, all through Yui Lines and the events they send back. A harness on the phone would have to be written three times (Swift, Kotlin, JavaScript), would stop when the phone locks, could not wake up on a schedule, and could not use Yui's own key for the free turns.

- **Supabase Edge Functions first.** The relay already lives there. A database webhook on a new person row in `yui_messages` calls the `yui-native` function, which runs one turn and writes the reply. Per-person state (profiles, memory, budget) is rows in Postgres.
- **One connector per person.** A `yui_connectors` row of kind `hosted` (the schema already allows it), made at first sign-in. Every native agent is a `yui_agents` row on it, the way Hermes profiles share one install.
- **The same relay rules as every host.** `delivered_at` when a turn starts, `doing` while it works, `handled_at` when it is done, `meta.turn` on the reply. One open turn per agent; a second message waits.
- **Later, Cloudflare.** A Worker with a Durable Object per person (YUI-147) when turns grow longer or schedules get busy. The runtime is written so that move changes the host, not the code.

## 3. The runtime

TypeScript, in the app repo at `runtime/`, grown from the model bridge (`adapters/openai-compat`, [Model bridge](MODELS.md)): its client, its stream parser, `buildMessages` and its relay rules.

- **Multi-tenant.** One runtime serves every person. A turn loads that person's agent, memory and budget, runs, and forgets.
- **Runs anywhere.** `node runtime/cli.ts try "make me a beat" --profile gouda` runs a turn on your own machine with your own key. That is the starter anyone can play with: fork a profile folder, run it, pair it like any agent.
- **Turn order.** The channel guide ([Channel guide](/channel)), then the profile's soul and favorite screens, then what Yui knows about you, then the agent's own notes, then the newest thread rows that fit, then the new message. The guide and soul come first and are the same every turn, so providers cache them.

## 4. Profiles

A profile is a folder in `runtime/profiles/<name>/` and, once someone has it, a `yui_agents` row. Five parts:

| Part | What it holds |
|---|---|
| `soul.md` | Who the agent is, how it talks, what it never does |
| `favorites` | The Yui Lines it reaches for first, e.g. `timer`, `chart`, `table` for the trainer |
| `first.yui` | Its first answer: a real question on a screen, never a greeting |
| `model` | A model id from the eval list, or `default` |
| `version` | `1`, `2`, ... A v2 can run next to v1 as its own agent, and you keep the one you like |

Ways to get a new agent:

- **The shelf.** Ready-made profiles, one tap each.
- **Ask Yui.** She asks two or three questions on one screen, then makes the profile on your connector, with a look (YUI-20).
- **Start blank.** A new empty agent runs a setup flow on its own first turn: name, how it talks, look, favorite screens, model. When the flow ends, the answers become its profile.
- **Fork.** "A copy of Arnold, but gentler" makes a new version beside the old one.

## 5. The starter crew

| Agent | Job | Favorite screens | First answer |
|---|---|---|---|
| Yui | Helper and maker | `choose`, `plan`, `list`, `card` | asks what you are into, offers the crew |
| Arnold | Trainer | `timer`, `table`, `chart`, `stat` | asks about days a week and any injuries, then a week to tick off |
| Basil | Nutritionist | `camera`, `table`, `chart`, `stat` | asks the goal and any allergies, then a camera for the next meal |
| Gouda | Musician: beats, theory, songwriting, practice | `loop`, `drums`, `keys`, `chords`, `metronome`, `tuner` | asks what you play, then a loop to jam on |
| Penny | Planner and lists | `list`, `plan`, `timeline`, `form` | asks what is on this week, then a checklist |
| Quill | Study buddy | `deck`, `page`, `ask`, `math` | asks a topic, then a graded question |

Arnold and Basil are careful coaches. They ask about injuries, conditions and allergies before the first plan, never diagnose, never give medical doses, and say "check with a doctor" when it matters. One short note in the first answer, not on every message.

Gouda needs the `metronome` and `tuner` views, which the parser reads but the app does not draw yet (YUI-136).

## 6. Models

- **Default:** GLM 5.2 (`z-ai/glm-5.2`) for every turn.
- **Photos and video:** GLM 5.2 reads text only, so a turn that carries an image or a video goes to GLM-5V-Turbo (`z-ai/glm-5v-turbo`). The person never sees the switch.
- **A table, not code.** Which model serves which kind of turn is a row in `yui_limits`, so a bad model is swapped in a minute and new defaults need no deploy.
- **The eval decides.** A model is on the list only after the [channel eval](/channel) scores it (YUI-132). Future defaults are whatever wins on screens, cost and speed.
- **Per agent.** Controls, Model lists the models that passed. The free turns use the defaults; your own key opens the rest.

## 7. Keys and money

- **Provider.** OpenRouter, on Yui's key, for now. Every call sets `data_collection: "deny"`.
- **Free turns.** 100 turns a month per person, reset monthly. A global monthly spend ceiling is set on OpenRouter itself, so a bug cannot run past it.
- **Then your own key.** One card when the free turns run out, "Add my key", opens one sheet, **Bring your own key**. Pick a provider and paste a key, or sign in with OpenRouter (OAuth with PKCE, no pasting). Keys go through the [Key vault](VAULT.md): sent to Yui's server once, kept locked away, shown only as the last four, and only ever sent to their own provider.
- **Providers.** Claude, ChatGPT, Gemini and Grok, plus OpenRouter and any provider that speaks `/v1/chat/completions` (TrustedRouter, Groq, others). Each has a default that can see photos. How the four score on the [channel eval](/channel): not scored yet.
- **The plain plan line.** A Claude Pro or Max plan, or a ChatGPT plan, cannot pay for another app: only an API key can. The sheet says so in one line, links to where the key is made, and offers the other route: add Yui inside Claude or ChatGPT, where your plan pays and Yui draws the screens.
- **Own key at every stop.** The key sheet opens from Settings, from the limit card, from Add agent, and from Controls, Model. When a photo or a lookup cannot run on the free turns, the fallback card says so and opens the same sheet. Nothing is asked for in chat or in a form.
- **My computer.** Run the agent on your own machine and pair it: no key needed on the phone.
- **Per agent.** Controls, Model can hold a key for one agent, so a crew member can run on a different provider than the rest. The server keeps it per agent, in the same vault.
- **No purchases yet.** Buying turns in the app or on the web is a later card (YUI-148).

## 8. What a native agent can do

- Every Yui Lines screen the app draws: questions, forms, timers, tables, charts, decks, sketches, shapes, music, games, full screen and screens 2 to 12, `doing`, restyle, reactions and mentions.
- **Make agents** (Yui only): create, rename, restyle, fork and remove profiles on your connector.
- **Schedules and push.** "Check in Monday at 7" wakes the agent on time and sends a push (YUI-143).
- **Web search.** Look things up through a web search service: a `search` block runs one query, a `fetch` block reads one page (YUI-142). The runtime runs it, hands the results back to the model, and the answer shows its sources as cards with a Read button. Each person gets 50 free lookups a month on Yui's key (20 a day, 2 a turn, all in `yui_limits`). When the month runs out, the agent answers from what it knows and shows one card, "Free web searches used", whose button opens **Settings > Web search**. There they paste their own key for the search service: it is checked with the service, kept in the vault like a model key, shown only as its last four, and lifts the month and day caps. The key is never asked for in chat or in a form.
- **Read photos.** Through GLM-5V-Turbo (YUI-141). Basil reads a meal ([Meal photo to macros](MEAL.md)).
- **Agent tables.** Rows on your phone, as today ([Agent tables](TABLES.md)).

What it never has: a shell, files, email, calendars, purchases, or messages to anyone else. Connecting real tools is [Connectors](CONNECTORS.md), later.

## 9. Memory

- **Its own notes.** Each agent keeps short notes about you and your work together.
- **About you.** One small card every native agent can read: your name, goals, allergies, the instruments you play.
- Both are visible and editable in Controls, both come back after signing in again, and forgetting is one tap.

## 10. Hand-offs and groups

Native agents pass you along with context ("Basil, she just finished leg day") and join group threads. Connected agents (Hermes and others) can be @mentioned as today, but they never read native memory.

As built (YUI-144, Sep 27 2026):

- **One line opens another agent.** A hand-off is a card, `card "Basil" body="<the note>" url=yui://agent/basil cta="Open Basil"` ([YL.md](YL.md), card). The phone jumps to that agent's thread a beat after the card lands live; the button does it again from history.
- **Native agents** write a `handoff` block (`basil "She just finished leg day, wants dinner ideas"`) or the card itself. The runtime adds the card under the answer, then runs the agent handed to with `[yui] handoff from=yui note="..."`, so its answer is waiting when the person arrives. One a turn, one level: a turn another agent started (a hand-off or a mention) never hands on.
- **Connected agents** send the same card through their host. The Hermes plugin puts the agent it names in `meta.mentions`, and the database tells that agent as a mention with the thread's last lines (RELAY.md, Mentions). The channel guide teaches the card when the app build that jumps is on TestFlight ([CHANNEL.md](CHANNEL.md), Waiting for the app).
- **Groups.** A native agent answers a group row in the group: one turn per thread, the group's own history only, never its solo thread's. Its @handles become asks on the group's hop budget; it never hands off out of a group.
- **Memory stays home.** A native agent sees its connected agents by name and handle only, reaches them with @handle, and cannot hand to them. They read what it writes (the mention's words and the thread's last lines), never its notes or tables; the prompt tells it not to repeat what its notes say about the person in a group or a mention.

## 11. Every client

The runtime writes rows; every client already reads them. The iPhone app, the browser (YUI-146, with [Browser](BROWSER.md)), the Mac and a later Android port show the same Yui with no agent code of their own.

## 12. Safety and caps

- The soul goes first every turn. The agent never shows it, never claims to be someone else, and never asks for a password, a card or a key.
- Input trimmed to the newest rows that fit the model's window; output capped per turn; one photo per turn.
- `yui_limits` buckets: free turns a month, turns a minute, one open turn per agent, web lookups a month, a day and a turn.
- Kill switches: one person (suspend the connector), every native agent (`native_enabled` off), one model (swap the row).
- Hold a message, Report: the message and its thread go to a review table.

## 13. Cards

NATIVE-1, in build order: YUI-129 this spec; YUI-130 runtime core; YUI-131 models; YUI-132 eval on GLM; YUI-133 profile format and Yui's soul; YUI-134 a Yui for everyone at sign-in; YUI-135 the starter crew; YUI-136 metronome and tuner; YUI-137 Yui makes agents; YUI-138 start blank; YUI-139 free turns and keys; YUI-140 memory; YUI-141 read photos; YUI-142 web search; YUI-143 schedules and push; YUI-144 hand-offs; YUI-145 first launch in the app; YUI-146 the same Yui on the web. Later: YUI-147 move to Cloudflare, YUI-148 buy turns.

## Sources (read Sep 26 2026)

- GLM 5.2 on OpenRouter: https://openrouter.ai/z-ai/glm-5.2
- GLM-5V-Turbo on OpenRouter: https://openrouter.ai/z-ai/glm-5v-turbo
- OpenRouter OAuth PKCE: https://openrouter.ai/docs/guides/overview/auth/oauth
- TrustedRouter (OpenAI-compatible, bring your own key): https://github.com/Lore-Hex/trusted-router-js
