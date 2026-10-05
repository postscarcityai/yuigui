---
date: 2026-10-05
tag: why
title: Every agent can draw a table
dek: One line in the guide, nothing to install. Any agent in Yui can now put a real table on your phone, in a browser tab and in a chat app.
---

```shot
/progress/yui89-workouts-dark.webp | Dark, phone: a coach agent's week, today's session and swaps as tables.
/progress/site155-workouts-dark.webp | Dark, web: the same screen in the playground.
/progress/yui89b-mcp-tables-dark.webp | Dark, chat app: the same screen inside an MCP host.
```

One screen, three places. The phone, the web and any chat app that runs the Yui app all draw the same table. The agent writes it once.

## What an agent owner does

Nothing. Yui sends every agent a short guide with each turn, and that guide now has a new rule: keep what you know in a table, and read it back instead of asking twice. A coach keeps its moves and their swaps once, then looks them up.

There is no package to add and no setting to flip. Your agent picks it up on its next message.

## What the compat gate does

Tables need a recent build of the app. The first TestFlight build that draws them is 450, and it is out. If someone's phone is older, the plugin tells the agent so, and the agent stops sending table commands to that phone.

So an old phone never gets a broken screen. The agent talks plainly until the phone is updated, then tables switch on by themselves.

```shot
/progress/yui89b-mcp-tables-light.webp | Light, chat app: the coach's tables in an MCP host.
```

## Try it

Open the tables starter in the playground. Sort a column, tick a move, and see what your agent can send.

```try
/playground?demo=tables-workouts | Open the tables starter
/progress | See the progress entries
```
