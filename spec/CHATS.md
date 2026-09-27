# Chats

Several chats with one agent, listed in the drawer. Start a new one when the subject changes, come back to an old one when you want it.

Status: draft, step 1 of YUI-169 (this spec and a [clickable mock](/mockups/chats)). Nothing here is in the app yet. Step 2 is the relay, the database, the hosts and the app drawer. It came from a TestFlight note on build 244: "I think we might need to introduce the concept of multiple chats. Those should go in the left side bar." And about the drawer: "I think this should store more chats than screens."

## 1. What a chat is

A chat is one conversation with one agent. It has an id, a title and its own messages. Nothing else moves into it.

```
Agent (Basil)
├── Chats          one list, newest first
│   ├── Tuesday's groceries
│   ├── Protein on rest days
│   └── Hi Basil               the first chat, where everything before chats lives
├── Screens 2 to 12, pinned screens, the shelf (save / show)
├── The drawer rows (menu review, backlog, shortcut)
└── Memory (what the agent knows about you)
```

- **Every agent has at least one chat.** The first chat holds everything said before chats existed, so an update loses nothing.
- **A chat belongs to one agent.** A group (see [Group threads](/developers/groups)) is a different thing: several agents, one conversation. Groups keep their own place in the agent list.
- **The composer, the mic, the bar and full screen all work the same in every chat.** A chat changes what the thread shows, never what the app can do.

## 2. New chat

- **Where.** The drawer's Home tab starts with a New chat button, above the list. The round button at the top right of the chat (a pen on a page) starts one too. Today that button opens the chat record; with chats, the record is the chat you are in, so the button can take the new job.
- **The header** shows the agent's name with the chat's title under it. Tap it for the drawer.
- **What you see.** The same empty screen as today: the agent's face, "Hi. Tap the mic and talk." and the bar. No title yet.
- **Nothing is made until you say something.** A chat you open and leave empty is not saved, so the list never fills with blanks. Tapping New chat twice gives you the same empty chat.
- **The agent hears it.** The first row in a new chat starts `[yui] chat new` so the agent knows the thread is fresh and does not carry on the last one's subject. Its memory is still there (section 5).

## 3. The list in the drawer

Chris: the drawer "should store more chats than screens". So Home puts chats first.

- **Order.** Newest activity first: the chat you or the agent last wrote in is on top. A reply from the agent in an old chat moves it up.
- **Rows.** Title on the first line, then the last line said and when, in plain words: "You: how much protein on rest days · 2h". An unread agent reply shows a coral dot, the same dot as the agent list.
- **Title.** From your first ask, cut to about 32 characters at a word: "What should I eat before a 10k" becomes the title as is. The first chat is called "Hi <agent>" until you rename it. A first message that is only a tap or a photo gets the agent's first line instead. The agent does not pick titles.
- **The open chat** has a soft coral fill in the list.
- **Below the chats**, in this order: Next up for you (the review rows, as today) and Pinned screens as one row of small tiles you swipe sideways. Screens stay one tap away but no longer take the top of the drawer.
- **Many chats.** The list shows the 30 newest and loads more as you scroll. A search field shows once there are more than 10 (step 2 may land it later).

## 4. Rename and delete

- **Hold a row** (or swipe it left) for two actions: Rename and Delete.
- **Rename** edits the title in place, 1 to 60 characters. A renamed title never changes on its own again.
- **Delete asks first.** A sheet: "Delete 'Tuesday's groceries'? Its messages go. Basil still remembers what it learned." with Delete (red) and Keep. Nothing else in the app asks before a tap; this one does because it cannot be undone.
- **The last chat** cannot be deleted, only cleared: the sheet says "Clear this chat?" instead, and the chat stays with no messages.
- **Deleting the open chat** opens the next newest one.
- Deleting a chat removes its messages from the relay at once. Screens, pinned screens and memory are not touched.

## 5. What belongs to the agent, not the chat

| Thing | Where it lives | So in a new chat |
| --- | --- | --- |
| Messages, taps, reactions, replies | the chat | the thread starts empty |
| Screens 2 to 12 (`>2` and up) | the agent | still there, a swipe away |
| Pinned screens and the shelf (`save`, `show`, `forget`) | the agent | `show workout` works in any chat |
| Drawer rows (`menu review`, `backlog`, `shortcut`) | the agent | the same drawer |
| The agent's look, name, face | the agent | unchanged |
| Memory and the about-you card | the agent | it still knows you |
| What the agent is doing (`doing`) | the chat it is answering | the working row shows in that chat only |

A patch (`~stat`, `~timer`) reaches the newest matching component **in the chat it was sent to**. A patch to screens 2 to 12 reaches them from any chat, because they belong to the agent.

## 6. What the agent sees across chats

- **Memory is shared.** Whatever the agent keeps about you (Hermes memory, a native agent's memory items, its own notes) is the agent's, so every chat sees it. That is the point of having one agent.
- **The conversation is not.** Each chat is its own session on the host: the agent gets that chat's history and nothing from the others. It cannot read another chat's messages.
- **Unless you point at it.** A reply to a message (hold and Reply) only reaches messages in the same chat. To bring something over, say it, or ask the agent to remember it.
- **Pushes name the chat.** A push from an agent opens the chat it came from, not the newest one.

## 7. Step 2: relay, database and hosts

### Database

One new table beside the ones the relay has today, same rules: every row belongs to a `user_id`, RLS lets `yui_user` see only its own, `yui_connector` gets no grant on it.

```sql
create table public.yui_chats (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.yui_users(id) on delete cascade,
  agent_id    uuid not null,
  title       text check (title is null or length(btrim(title)) between 1 and 60),
  titled_by   text not null default 'auto' check (titled_by in ('auto', 'person')),
  last_at     timestamptz not null default now(),
  created_at  timestamptz not null default now(),
  unique (id, user_id),
  foreign key (agent_id, user_id) references public.yui_agents(id, user_id) on delete cascade
);
create index yui_chats_list_idx on public.yui_chats(user_id, agent_id, last_at desc);

alter table public.yui_messages add column chat_id uuid;
-- foreign key (chat_id, user_id) references yui_chats(id, user_id) on delete cascade
```

- **The first chat** is made for every agent by the migration, and every existing message of that agent gets its `chat_id`. New agents get one when they are added.
- **Writes.** `yui_user` inserts a chat (id, agent_id, title null), updates `title` (which sets `titled_by = 'person'`) and deletes it. A trigger refuses deleting an agent's last chat (`last_chat`).
- **Messages.** The person's row carries `chat_id`, and a policy checks the chat is theirs and is for that `agent_id`. An agent's reply gets the `chat_id` of the row it answers from the turn stamp (the same way `meta.turn` works today), so a host never has to know about chats to reply in the right one. A row from a host with no turn (a cron, a push) goes to the agent's newest chat, or to the chat a `[yui] chat=<id>` line names.
- **last_at and title.** A trigger on `yui_messages` insert moves `yui_chats.last_at` and, for the first person row in a chat with `titled_by = 'auto'`, writes the title from its words.
- **Limits.** `chats_per_agent` in `yui_limits`, 500 to start. Past it, the oldest untouched chat is not deleted on its own: New chat says the list is full.
- **Old apps.** A phone on a build without chats sends rows with no `chat_id`: they go to the agent's newest chat and show there. `chats_min_build` in `yui_limits` gates New chat the way `group_min_build` gates groups.

### Hosts

- **Hermes plugin.** The session key is the agent id today. It becomes `<agent id>` for the first chat (so the session in progress carries on) and `<agent id>:<chat id>` for every other. The first row of a new chat starts `[yui] chat new`. Memory stays per profile, so it is shared as section 6 says.
- **Native agents.** The runtime reads history by `chat_id` instead of by agent. Memory items stay per agent.
- **Webhook, A2A, AG-UI, MCP, model bridges.** Each gets `chat_id` in the turn it receives and uses it as its conversation id (A2A `contextId`, AG-UI `threadId`). A bridge that ignores it still works: it sees one long conversation, as today.

### App

- The drawer's Home tab: New chat, the chat list, then Next up and pinned screens (section 3).
- The thread loads one chat. Switching chats keeps each chat's scroll place for the session.
- Deleted chats disappear on every phone through the same realtime channel messages use.

### Tests for step 2

- Migration on a local database first, then the live project: every agent has one chat, every message has a `chat_id`, and the counts match before and after.
- RLS: one person cannot see, write to or delete another's chat; a message cannot name a chat of a different agent; the last chat cannot be deleted.
- Plugin: two chats with one agent get two sessions; an agent reply lands in the chat it answers; an old app's row lands in the newest chat.
- App: UI test shots of the drawer with 3 chats, New chat, rename, the delete sheet, light and dark.

## 8. Not in this card

- Moving a message from one chat to another.
- Folders, pins or stars on chats.
- Sharing a chat with another person.
- The agent opening a new chat by itself. An agent that wants a fresh start says so and you tap New chat.
