# Brag plan: Yui (yuigui.com)

## The answers

- **What is it?** Yui is an iPhone app where your AI agent answers with a screen you can tap (a timer, a form, a quick choice) instead of a wall of text.
- **Who is it for?** People who already run an agent: Hermes first, plus OpenClaw, Claude Code, Cursor, MCP clients, A2A agents and anything behind a webhook.
- **What sets it apart?** The agent sends one short line of Yui Lines and the app draws a native screen from it. No code, no JSON. 1.6x fewer tokens than minified JSON.
- **Most impressive claim:** "One line of text. One whole screen." `timer 40/20x8 Tabata` is the whole timer.
- **Funniest claim:** Chris's own reason for building it: "If it asks me a question, I just want a button."
- **Visual hook:** you ask for a timer and the agent's reply floods the phone with an essay.
- **Real UI to show:** the app's chat (coral user bubble, white agent bubble, the Yui header, "Say something nice"), the Tabata timer card, the "Which split today?" choice card, and the playground's real screen renders.
- **Tone:** `default`. Playful, clean, pastel, matching the brand.
- **Share caption:** You asked your agent for a timer and got an essay. Yui makes it draw the timer instead.

## Angle

Walls of text versus a screen. Open on the pain everyone knows (ask for a simple thing, get an essay), then crush the essay into one line that blooms into a live timer.

## Visual identity

- Cream background `#FFF9F0` with the site's pink and lavender glow.
- Ink `#3A3340`, brand coral `#FF7E8A`, link red `#C23B4F`, mint `#BDEBD6`, lavender `#D9CCF7`, butter `#FFE8A3`.
- SF Pro Rounded (the app's font), SF Mono for Yui Lines.
- The coral Yui wordmark from `site/public/brand/`.
- Real screen renders from `site/public/og/screens/`.

## Storyboard (21.5s, 1920x1080, 30fps, 120 BPM)

| # | Time | Scene | On screen text | Sound |
|---|---|---|---|---|
| 1 | 0.0 to 3.0 | **Hook.** A phone, Yui chat. User bubble: "Can you set up a 20 minute tabata for me?" The agent's reply streams in as an essay that grows past the top of the phone. | "You asked for a timer." then "You got an essay." | Light plucks, soft typing ticks, a riser |
| 2 | 3.0 to 7.0 | **One line.** The essay collapses line by line. A Yui Lines chip types `timer 40/20x8 Tabata`. At 5.0 it blooms into the live Tabata timer card, ring sweeping, counting down. | "One line of text." then "One whole screen." | Hit on 3.0, key clicks, a bright pop on 5.0, groove starts |
| 3 | 7.0 to 9.5 | **Name.** Wordmark scales in on the left, timer keeps running. | "Meet Yui, a generative user interface." | Chime in key |
| 4 | 9.5 to 13.0 | **It asks. You tap.** Phone content swaps to "Which split today?" with Push, Pull, Legs, Type your own. A finger taps Legs at 11.0. "Legs" lands as the user's reply, and the wire line `→ agent {"value":"Legs"}` pops beside the phone. | "It asks. You tap." | Soft tap sound on 11.0 |
| 5 | 13.0 to 16.0 | **Everything else.** A tilted wall of real screens drifts past: chart, gallery, form, snake, tic-tac-toe, compare, deck, table, calc. | "Timers. Forms. Charts. Games." one word per beat | Full groove, a pluck per word |
| 6 | 16.0 to 18.5 | **Bring your own agent.** Chips pop in: Hermes, OpenClaw, Claude Code, Cursor, MCP, A2A, Webhooks. | "Bring your own agent." | Rising tuned pops per chip |
| 7 | 18.5 to 21.5 | **Outro.** Wordmark, URL, beta line. | "yuigui.com" and "Public beta on TestFlight. Open source." | Final chord, tail |

Scene sum: 3.0 + 4.0 + 2.5 + 3.5 + 3.0 + 2.5 + 3.0 = 21.5s.

## Poster

The settled Scene 2 frame: "One line of text. One whole screen." next to the live timer.
