# Context on a reply (t_53b06721)

Research spike, 2026-09-29. Trigger: Chris's TestFlight note, 7:42 pm, build with guide v40. He had been shown a status sketch ("New feature: needs help <- waiting on you") and typed "What are you waiting on me for with this?". The agent answered with an older, unrelated ask: 🔴 OK the spend to test four new models (YUI-139 step 2d). His words: it grabbed a random thing from the backlog and thinks he still owes it.

## What happened, in order

1. The agent sent "Before and after / Guide v40 is live now" with a sketch. Its three rows were the guide's own example from **Status is `Label: verdict`**, copied whole, including `note="waiting on you"`. The rows were sample data. Nothing on the screen said so.
2. Chris typed a plain line. No Reply gesture, no tap.
3. The plugin handed the agent that line and nothing else about the screen (see below). "this" pointed at nothing in the turn.
4. The agent did what a status question does everywhere else: it went looking for "what is waiting on Chris" and found the one open Needs-you ask. It answered with that.

## Fault A: a sample read as a real ask

The guide taught the row `New feature: needs help +hi note="waiting on you"` as its model answer, and the playground sample `try-status-tiles` (site/lib/yl/samples.mjs) carried the same row. An agent that draws a demo of the tiles reuses it, and the phone shows a demo row in the same style as a real one. The guide had no rule that a sample is marked as one, and its example put the real-ask phrase on made-up data.

## Fault B: the answer ignored the screen he was looking at

Where "waiting on you" comes from, all four sources:

- **Needs-you asks** (the war room Review tab, `yui_war_room.py`, needs.py): one row per blocked card whose reason names Chris. This is where 2d came from. It is a live list, so it is never "stale" in the plumbing.
- **The board** (`hermes kanban`), which the agent can read with its tools.
- **Agent memory**, which can hold "waiting on Chris" notes with no expiry (not checked for this turn; the answer matches the Needs-you ask exactly, so that is the likely source).
- **Menu review rows** the agent itself sent (`menu review@...`), which stay until `menu done`.

What a reply carries today:

- A tap: `[yui] n1 choose choice=Legs`, tied to a component the agent sent.
- The Reply gesture: `[yui] reply to=<row id> from=agent quote="first line"`. It quotes the first line only ("Guide v40 is live now"), not the sketch or the card. Chris did not use it here.
- `screen=N` talk on a second screen.
- Notes the plugin queues (board order, mentions, group notes, control changes). Nothing about the agent's own newest message.
- A plain typed line: no header at all. The agent only has its session history, and a card sent by `hermes send` (a cron or another process) may not be in that history at all: not checked, which is why the fix reads the table.

So a typed "this" carried no pointer to the screen, and even a quoted Reply carries only its first line.

## Was 2d wrong to surface?

No, but it was wrong as the answer. The ask is open: Chris tapped **Not yet** on it at 6:54 pm (48 minutes before he asked), and Not yet leaves the card blocked by design. His memory that he "cleared it up" is the tap: it is answered as "not yet", not resolved. The agent should have answered about the screen first, and if it named the old ask, said when he last saw it and what he answered, so it reads as a reminder of something he parked and not as a new demand.

## Fixes made here

1. Guide v41, new rule **Examples are not asks** (spec/CHANNEL.md): sample or demo rows say `example` and never `waiting on you`; a question about the screen just shown is answered about that screen first; any other open item is named with when he last saw it and what he answered. The guide's own status example now uses `note="design pick"`, and so does the playground sample.
2. Plugin (yui repo, hermes-plugin/yui/shown.py, adapter `_shown_note`): a plain typed line within 30 minutes of the agent's newest message gets a `[yui] note:` naming that message (its words, screen titles and first rows), so "this" and "that" have a target. It reads the table, so a card sent by `hermes send` counts. Python only, no app build. Tests: hermes-plugin/tests/test_shown.py.
3. Channel-eval: three `context` cases (sample is marked, "what are you waiting on me for with this?" answered about the screen, an old ask named with when he saw it). Results in spec/channel-eval/RESULTS.md.

## Left open

- The Reply gesture quotes one line. Quoting the card title and first rows too is an app change (Swift): parked as an APP card.
- The plugin note covers typed lines only. A reaction or a Reply already point at a row.
