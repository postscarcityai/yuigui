# Brag plan: your agents, one app (05-agents)

## Angle

Yui is one app for all your agents, and every agent looks like itself. The film opens on one short chat that changes look five times in four seconds: Yui, Coach, Wizard, Zen, Studio, back to Yui. Then it tells the story in order: add an agent you already run and pair it with one code, talk to it in its own thread and look, ask a second agent from the first with @ and see it answer in its own colors, and restyle Yui itself by asking. It ends on the agents Yui works with today.

Light theme on purpose: the whole app changes its colors, so the chrome around the phone stays cream, ink and coral, and only the app wears the agents' looks.

## Facts used (all shipped)

- **Looks.** The named sets in `site/lib/yl/look.mjs` (SETS), compiled with `compile()` the way the app does, so every color on screen is the light palette the app draws (accent after the contrast guard: Coach `#FF4D27`, Wizard `#7352FF`, Zen `#407F58`, Studio `#1068FF`, Counsel `#1F3A68`, autumn `#B35A26`; Yui's own from `YUI`). Font per look (rounded, system, New York serif), heading weight and corner style (square, soft, round) as in the sets.
- **Home page copy.** "Every agent looks like itself. Each agent gets its own name chip and colors." "Yui connects to agents you already run. You add them, rename them and remove them."
- **Adding an agent** (spec/AGENTS.md, the yui-look-colors, yui25-pairing and yui25-connected screenshots): Add agent, a name, a look from the picker, Get a pairing code, a 6-digit code that works once for 10 minutes, `hermes yui pair 482913` on the computer, then "Coach is connected!".
- **The switcher** (YUI-54): your agents spring up from the bottom of the drawer with Add an agent and Edit list; Counsel shows offline.
- **@mention** (YUI-44, spec/RELAY.md): type @, the popover shows each agent's face, name, @handle and whether it is online; a tap puts "@Coach" in the draft and "Goes to Coach" over the composer; the sent bubble says "To Coach"; Coach answers in Wizard's thread in its own look, name over the bubble and "Open its thread". The working row "On its way" is YUI-63.
- **Restyle by asking** (Yui 0.3.0, yui96 screenshots): "Here's autumn, next to Yui as it is now.", a card with Now beside Autumn, Light and Dark, the note that autumn was adjusted so text stays readable, Use autumn and Keep mine. After the tap: "Yui is autumn now." with Undo and a "Use autumn" bubble. Wizard keeps its own look in its thread.
- **Works today with** (`site/app/page.js`): Hermes, OpenClaw, Claude Code, Cursor and other MCP clients, A2A and AG-UI agents, a model you run yourself, anything that answers a webhook. "If your agent can send a message, it can draw a screen."

## Storyboard (100 BPM, a bar is 2.4 s, 25 bars is 60 s)

| Time | Scene | Left | Right | Line |
|---|---|---|---|---|
| 0 to 4.8 | Hook: "Morning! What are we doing today?", "Let's plan the week.", a small card. The look sweeps out from the name chip on every beat: Coach 1.2, Wizard 1.8, Zen 2.4, Studio 3.0, Yui 3.6 | One app. | Every agent looks like itself. | |
| 4.8 to 14.4 | The switcher (Yui, Wizard, Counsel offline, Nova). Tap Add an agent (6.0), type Coach, pick the Coach look (8.4), Get a pairing code (9.6), 482 913, "Coach is connected!" (12.0), Say hi to Coach (13.8) | Add the agents you already run. | Pair with one code. | `hermes yui pair 482913` |
| 14.4 to 24 | Coach's thread in its look: "Leg day?" (send 15.0), a Today card, tick Back squat (17.4). The switcher again, tap Wizard (19.2): violet, serif, "This week" | Each one gets its own thread. | And its own look. | |
| 24 to 33.6 | In Wizard's thread: tap the composer (24.6), @, the popover (Coach online, Counsel offline, Nova), tap Coach (26.4), "Goes to Coach", send (28.2), "To Coach", On its way, Coach answers in its own look with Open its thread | Ask another agent with @. | It answers in its own colors. | |
| 33.6 to 43.2 | Tap Yui (33.6). "Make Yui feel like autumn." (send 34.8). The card, Now beside Autumn. Tap Use autumn (38.4): the whole app turns autumn, "Yui is autumn now. Undo". The switcher in autumn, tap Wizard (40.8): still violet | Restyle Yui by asking. | Nothing changes until you tap. | `theme app autumn`, then "Wizard keeps its own look." |
| 43.2 to 52.8 | The phone steps aside. "Bring your own agent." Nine chips pop in on eighth notes, then "If it can send a message, it can draw a screen." | | | |
| 52.8 to 60 | Outro: Your agents. One app. yuigui.com/start. Public beta on TestFlight | | | |

## Beyond what is shipped, or approximated

- **The hook's fast look changes** are a film device (a circle sweeps the new look out from the name chip). In the app a look changes when you open that agent's thread. Every look shown is a real set.
- **Opening the switcher.** In the app the menu button or a drag right opens the drawer, and a tap on the agent at its bottom springs the switcher up. The film cuts straight to the switcher, without showing that step.
- **The first list leaves out Coach**, so the pairing is what adds it. (The reference screenshot's list already has Coach.)
- **Thread changes** use the same circle sweep from the tapped row or button. Screens are rebuilt in HTML from the screenshots; corner radii, avatar shapes and spacing are measured by eye.
- **Content is demo content**: the Today card, the This week card, "Running on MacBook", the teal "Own" color the avatar has before a look is picked, Coach and Wizard in the restyle card's small previews (the screenshot has Coach and Luna). The empty-thread line "Same agent as everywhere else, now with buttons." comes from the Wizard screenshot.
- **No keyboard** is drawn while typing, to keep the phone readable.
- **Left out on purpose**: group threads (playground mock only) and agent controls (Hermes only).

## Sound

`music.py` with `kit/sound.py`: 100 BPM, swing 30, Abmaj7 Bb | Ebmaj7 Cm7 Abmaj7 Bb, arranged so every scene starts on Ebmaj7. Level 2 for the hook, 3 for pairing and threads, 4 with the lead motif for @mention, restyle and the chips, then 2 and 1 for the outro, ending Eb, Ab, Eb. Bells ring on each look change, on connected, on Use autumn and on each chip. A swell and a crash on each big cut. Every tap in `score.js` is a tap sound on the same time as the finger.
