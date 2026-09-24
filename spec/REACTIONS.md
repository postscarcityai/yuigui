# Yui reactions v1

Long-press a message from your agent and react to it, the way you would on Telegram or Instagram. Every reaction is an instruction: the agent reads it as your answer to that message and acts on it. This file is the single source for what each one means. The app's reaction bar, the database check, the agent's channel guide (`spec/CHANNEL.md`, section "Reactions") and the page at yuigui.com/reactions all follow this table.

## The six

<!-- reactions:table (spec/reactions.mjs reads this table; keep one row per reaction) -->
| Emoji | Meaning | What the agent does |
|---|---|---|
| 👍 | build it | Go ahead with what you proposed, now. Don't ask to confirm. |
| 👎 | no | Drop it. Say so in a few words; offer one other way only if it is obvious. |
| 🤔 | not sure | Ask two to four short questions, one screen each, to work out what they want. |
| ❤️ | love it | Keep it, and remember it as their preference. At most a short thanks. |
| ⏳ | later | Park it (a backlog card, note or reminder), say where, don't do it now. |
| 🔥 | priority | Do this next, ahead of other work. |
<!-- /reactions:table -->

`Meaning` is the short label the app shows under the bar and sends on the wire. `What the agent does` is the instruction the agent gets in its channel guide.

## Rules

- One reaction per message. Tapping the same one again takes it back; tapping another replaces it.
- Reactions are for the agent's messages (text bubbles). Your own messages take none in v1.
- The newest reaction wins, the same as a changed tap.
- Every reaction is a turn: the agent answers it like any other message.

## On the wire

A reaction reaches the agent as one message from the person (`kind: "event"` in `yui_messages`, spec `RELAY.md`). The first line is the event; the next lines quote the start of the message they reacted to (up to 200 characters, each line prefixed `> `), so the agent knows what it refers to:

```
[yui] react msg=3a6ee9c1-4d97-40dd-901f-e5f0a7db1864 emoji=👍 meaning="build it"
> Want me to set up the Tuesday plan? Squats, then a 20 minute tabata.
```

- `msg` is the id of the agent's message row.
- Changing a reaction sends the new one with `changed=true`: `[yui] react msg=<id> emoji=🔥 meaning=priority changed=true`.
- Taking it back sends `[yui] react msg=<id> emoji=none` (plus the quote).
- `meta` carries the same thing structured: `{"react": {"msg": "<id>", "emoji": "👍"}}`, with `"emoji": null` for a take-back.

The database copies the emoji onto the reacted agent row (`yui_messages.reaction`, migration `20260924080000_yui_reactions.sql` in the app repo), so a reopened thread shows the badge. Only the six emoji are accepted, only on the person's own agent's messages. The event and the reaction are both messages, so they follow the 90-day retention rule. Tests: `python3 supabase/tests/reactions_test.py`.

## Your own meanings (later)

Settings will let you rewrite what a reaction means ("🤔 = give me three options, not questions"), stored per person in a `yui_` table. The hook is already on the wire: the agent is told to follow the `meaning=` text when it differs from this table, so a custom definition only changes what the app sends. Nothing on the agent side changes.

## Changing this table

1. Edit the table above.
2. `node spec/reactions.mjs` rewrites the "Reactions" section of `spec/CHANNEL.md` from it (`--check` exits 1 when it is stale).
3. Score the guide (`spec/channel-eval`), then publish it: `hermes-plugin/sync_channel.py --publish` in the app repo and restart the Yui gateways.
4. The emoji set is also in the app (`Yui/Sources/Chat/Reactions.swift`) and in the database check; a new emoji needs both.
