# Group threads

Two or more of your agents in one conversation. You talk to the group, @ the one you mean, and they hand work to each other where you can see it.

Status: step 1 (YUI-77), this spec and a playground mock (pick "Group thread: three agents, one handoff", or open `/playground?demo=group-thread`). Nothing here runs yet. Step 2 is the migration, the Hermes plugin and the native app. It builds on [Mentions](RELAY.md) (YUI-44 step 1, in the app since build 82): one row the app writes, triggers that route it, `meta.mentioned` and `meta.mention_reply`, depth 1.

The examples use three agents, each in its own look ([Agents](AGENTS.md), "Look"): **Coach** (the `coach` set), **Quill** (`wizard`) and **Sage** (`zen`).

## 1. Who answers

One rule: **the agent you address answers, and only that agent.**

| You write | Who takes a turn | Everyone else |
| --- | --- | --- |
| `@Sage what should I eat tonight?` | Sage | reads it as context on its next turn |
| `@Coach @Sage plan Saturday` | Coach, then Sage, each once (three at most) | as above |
| `how did I sleep?` (no @) | the thread's **lead** | as above |

- **The lead** is the agent the group was started from. It shows first in the header, with a small crown. Hold another face in the header and tap Make lead to change it. The lead answers anything not addressed, so a group never goes quiet and never gets three answers to one question.
- **Nobody jumps in.** An agent is never asked about a message that did not name it. The others see it on their next turn, the way a host agent sees a mention today (`[yui] note: in this group the person asked Sage, not you: ...`).
- **Replies to a message go to its author.** Swipe to reply on Sage's bubble and the reply goes to Sage, @ or not.
- **Taps go to the sender.** A screen in the group belongs to the agent that sent it. A tap, a submit or a reaction on it is that agent's turn, nobody else's.

## 2. How a handoff shows

A handoff is one agent asking another inside a turn you started. It is never hidden: the thread shows it as its own row, between the two bubbles.

```
You        @Coach plan my week before Saturday's 10k
Coach      Five days, easy then sharp. [screen: the week]
           @Sage can you fit a wind-down before bed each night?
  ── Coach → Sage · "fit a wind-down before bed each night" ──
Sage       Four minutes each night, after the run days. [screen: the routine]
```

- **The handoff row** is the app's, not an agent's: both faces with an arrow, "Coach asked Sage", and the words of the ask in one line. Tap it to jump to the bubble that asked.
- **Each agent keeps its own look** (YUI-20): face, bubble colors and name over the bubble. The thread's background stays the person's default, so no agent's look takes the group over.
- **One working row per agent** (YUI-63). While Sage works on the handoff its row shows Sage's face: `Sage · Pondering · 8s`. Two agents working show two rows, lead first.
- **Screens.** Inline screens (the chat, screen 1) draw in the group in the sender's look. Pages 2 to 12 stay per agent: a `>2` from Sage lands on Sage's own screen 2 in Sage's thread, and the group shows "Sage put a screen on its page 2" with Open. Full-screen flows (`>full`, `plan`) open over the group and fold back into it.
- **Status lines, as for mentions.** A handoff to an agent that is asleep, offline, not connected, not listening or muted gets the same one line in that agent's look ([Mentions](RELAY.md), the table), and the ask waits for it.

## 3. How deep, and the loop guard

In a solo thread a mention stays depth 1. In a group, agents may keep handing off, on a budget you can see.

- **Hops.** Your message is hop 0. An agent answering it may @ up to three others: hop 1. An agent answering a hop 1 ask may @ again: hop 2. And so on, up to the thread's **max hops**, 3 by default, 1 to 5 in the group's settings.
- **Turns.** Besides hops, one message of yours buys at most **8 agent turns** in total, so three agents all @ing each other cannot fan out.
- **The guard.** When a reply would go past either budget, the ask is not delivered. The thread shows a guard row in the asking agent's look, with the ask and two buttons:

  ```
  Coach wants to ask Quill: "turn the plan into flash cards"
  That's 3 handoffs since you last said something.
  [Let it]  [Stop here]
  ```

  **Let it** sends the held ask and starts a fresh budget, as if you had written it. **Stop here** ends the chain; the agents that already answered keep their answers.
- **Stop, any time.** While any agent in the group is working, the working rows carry a Stop button. Stop cancels every handoff not picked up yet, and a turn already running finishes but its @s go nowhere. The thread says so in one line: "Stopped. Quill won't pick up Coach's ask."
- **No ping-pong.** The same two agents asking each other back and forth count toward the same budget; there is no special case to game.
- **Each agent's red lines stay.** A handoff is just a message to the other agent. It gets no new powers from being asked by an agent instead of by you, and its host can still refuse.

## 4. Storage

Today a thread is `(user, agent)`: every row in `yui_messages` has one `agent_id`, and the app loads a thread by it. A group needs an id of its own. Proposed for step 2, as SQL; **not applied anywhere yet**.

```sql
create table public.yui_threads (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.yui_users(id) on delete cascade,
  title       text not null check (length(title) between 1 and 60),
  lead        uuid not null,                       -- the agent that answers un-addressed messages
  max_hops    int  not null default 3 check (max_hops between 1 and 5),
  max_turns   int  not null default 8 check (max_turns between 1 and 12),
  stopped_at  timestamptz,                         -- last Stop; chains started before it deliver nothing
  created_at  timestamptz not null default now(),
  archived_at timestamptz,
  foreign key (lead, user_id) references public.yui_agents(id, user_id) on delete cascade
);

create table public.yui_thread_members (
  thread_id  uuid not null references public.yui_threads(id) on delete cascade,
  agent_id   uuid not null,
  user_id    uuid not null,
  joined_at  timestamptz not null default now(),
  left_at    timestamptz,
  primary key (thread_id, agent_id),
  foreign key (agent_id, user_id) references public.yui_agents(id, user_id) on delete cascade
);

alter table public.yui_messages add column thread_id uuid
  references public.yui_threads(id) on delete cascade;   -- null: the classic (user, agent) thread
create index yui_messages_group_idx on public.yui_messages(thread_id, created_at)
  where thread_id is not null;
```

**Rows stay per agent.** A group row still has an `agent_id`: the agent it is to or from. That is what keeps delivery unchanged.

| Row | agent_id | meta.group |
| --- | --- | --- |
| Your message | the first agent it addresses (or the lead) | `{thread, hop: 0, to: [ids]}` |
| A copy for the second and third addressee | that agent | `{thread, hop: 0, copy_of: <row>}`, hidden in the group view |
| An agent's reply | the agent | `{thread, hop}`, set by trigger from the row its `meta.turn` names |
| A handoff ask | the agent asked | `{thread, hop: n, from, msg}` |
| Guard, stop and status lines | the agent they are about | `{thread, guard}` or `{thread, status}`, no `meta.turn`, never trigger anything |

What an addressed agent's row says, above your words (the same shape as a mention, so a host that reads mentions reads this):

```
[yui] group "Race week" with=coach,sage,quill lead=coach hop=1 from=coach
Race week, just before:
> Person: @Coach plan my week before Saturday's 10k
> Coach: Five days, easy then sharp. [screen]
@Sage can you fit a wind-down before bed each night?
```

**Triggers** (security definer on `yui_messages`, like the mention ones): fan a person row out to its addressees; stamp `thread_id` and `hop` on agent replies from `meta.turn`; turn `meta.mentions` on a reply into handoff rows while the budget holds, a guard row when it doesn't, nothing after `stopped_at`; answer `[yui] group continue guard=<id>` (Let it) and `[yui] group stop` (Stop) from the app.

**RLS sketch.**

- `yui_user`: select, insert and update its own `yui_threads` and `yui_thread_members` (`user_id = yui_uid()`); members must be its own agents (the foreign keys hold that). Delete is archive, never a hard delete from the app. The existing `yui_messages` insert policy gets one more check: a row with `thread_id` must name a thread the user owns and an agent that is a member.
- `yui_connector`: **no grant on either table.** A connector still reads only rows whose `agent_id` it serves (`yui_connector_serves`), so an agent never reads another agent's rows directly, even in a group. What it knows of the others is what the quote in its own row tells it, the same boundary mentions keep. A connector's reply cannot set `thread_id`; the trigger does.

**What the Hermes plugin needs.** Almost nothing, by design:

- **Delivery and `handled_at` are unchanged.** Each addressed agent has its own row, so the plugin's poll (`agent_id`, `sender = user`, `handled_at is null`) picks it up and marks it handled after the turn, exactly as today. Two agents on the same Mac never race for one row.
- **`meta.turn` is unchanged.** The reply names the row it answers; the trigger reads the thread and hop from that row. An older plugin that knows nothing of groups still answers correctly in the right group.
- **`meta.mentions`**: the plugin already fills it from `@handles`. In a group the database routes it by the hop budget instead of refusing it at depth 1.
- **New: notes on the next turn.** Like `mentions.py`, the plugin puts group rows since the agent's last turn first, one line each (`[yui] note: in Race week, Coach answered: ...`). Until it does, the quote in the row carries the last six lines anyway.
- **New in the channel guide**: a short Groups section. In a group, answer only what you were asked, @ another member only when their part is needed, never @ yourself, and say it plainly when you hand off.

## 5. Old app builds

A group is made in the app, so a phone that is too old simply never makes one. The rest degrades without losing anything:

- **The group list is new-build only.** The app sends its build on connect (`yui-push` stores it); the create call refuses below the group's min build with `update_needed`, and the app shows the Update chip (YUI-87).
- **An old build on a second phone** loads threads by `agent_id`, so it shows each agent's part of a group in that agent's own thread, in order: your message where it was addressed, the agent's answer under it. The `[yui] group ...` line is stripped like every `[yui]` line. It reads as a normal chat with that agent.
- **Guard rows and handoff rows** are status lines with no `meta.turn`. An old build draws them as a plain line in the agent's look, with no buttons. Let it and Stop are only on the new build; a guard left alone costs nothing, the held ask just stays held.
- **Agents that know nothing of groups** still work: they get a normal-looking message with a quote above it, answer it, and their `@handles` route by the budget.

## 6. What step 2 builds

1. The migration above, plus its tests (routing, copies, hops, the turn cap, guard, Let it, Stop, RLS, a connector reading another agent's row and getting nothing).
2. The Hermes plugin's group notes and the channel guide's Groups section, with eval cases.
3. The app: a New group sheet (pick two or more agents, a name, the lead), the group in the agent list with stacked faces, the header, per-agent working rows with Stop, the handoff row, the guard row with Let it and Stop, and group settings (max hops, members, lead).
4. An end-to-end test with two real adapters on one Mac, like the mentions one, light and dark.
