# YL visual gaps (DRAW-1)

Chris, 2026-09-30: "I want it to be able to recreate different UIs. Maybe sketch a flow chart. Do we have mermaid in there? Let's round out some of the visual capabilities of the YL language." And a day earlier, about the same thing: "I don't want you to generate an image. I want you to draw on the screen using the YL framework."

Today YL draws with `sketch` (rows in a window, phone or bubble), `shapes` (a small moving picture on a canvas), `map`, `chart`, `timeline` and `compare`. Mermaid lives only inside `flow`, where it is a question flow, not a picture. So the two things he asks for, a flow chart and a redrawn UI, have no YL. This is what the threads show.

## 20 asks where a drawing was needed

Source: the yui agent's own threads (`state.db`, user messages). `#` is the message id. "Sent" is what the agent could send with the presets that existed.

| # | When | Chris asked for | Sent today | YL that draws it |
|---|---|---|---|---|
| 62 | Sep 24 | "Show me what a performing after looks like" | prose, then a `card` | `mock` phone with the state, `+hi` on the changed row |
| 88 | Sep 24 | feedback on an intake flow that "felt disjunct" | prose | `diagram` state: the steps and where it jumped |
| 181 | Sep 24 | waitlist becomes an invite to join the beta, email sent | prose | `diagram` sequence: visitor, site, Chris, email |
| 208 | Sep 24 | "a demo flow through a tower defense game design" | a `flow` of questions | `diagram` flowchart of the loop (spawn, path, tower, win or lose) |
| 230 | Sep 24 | `@` mentions and slash commands, "suggestions" in the composer | prose | `mock` phone: field, `sheet` of suggestions, `keyboard` |
| 282 | Sep 25 | war room "dashboard", timeline of done and queued, drag to reorder | prose, then `timeline` | `mock` window: rows with handles, `+hi` on the drag row |
| 542 | Sep 25 | "explain the evolution of man like to a fifth grader" | `sketch` rows | `diagram` flowchart TD: a branching line of descent |
| 545 | Sep 25 | "I want to see this in grey typography" (feedback on a card) | prose | `mock` of the card with the type marked `+hi note=` |
| 765 | Sep 25 | 8 slides, single cell to many cells | `deck` with `shapes` | `diagram` state: the stages, one per page |
| 1600 | Sep 27 | Firebase "Add Firebase to your iOS app" setup, pasted screenshot | prose description | `mock` browser: nav, fields, button, stepper |
| 1667 | Sep 27 | the hold-to-talk mockup on the site | playground screens | `mock` phone with the button and the lock spot |
| 1677 | Sep 28 | copy-link button "in a little box" at the top right | prose | `mock` phone: nav with an action, `note=` on it |
| 1827 | Sep 28 | how to market to the lobsters on Moltbook | a page of text | `diagram` flowchart: post, reply, click, try, own |
| 1841 | Sep 28 | web mockup of onboarding, "pick your crew", multiselect | a site page, built by hand | `mock` phone: `grid` of agent cards, `button` |
| 1885 | Sep 28 | "we can draw the screen and speak in short and visual language" | mixed | `mock` and `diagram`, one short line each |
| 2056 | Sep 29 | hold to record: slide left to cancel, drop above the button to lock | prose in the war room | `mock` phone + a gesture mark (gap, below) |
| 2140 | Sep 29 | "mock up how you earn: I watch my numbers go up as I use it" | prose | `mock` drawer with a counter part (gap, below) |
| 2147 | Sep 29 | drawer layout: profile on top, $U total where the gear was | prose | `mock` phone drawer: `nav`, `row`s, `+hi` on the total |
| 2150 | Sep 29 | "coming from the chat logs into the bank when I open the drawer" | prose | `diagram` sequence: chat, ledger, drawer |
| 2573 | Sep 30 | "the user will never know it is happening, it is part of the architecture" (a layer under the app) | prose | `diagram` flowchart: what the user sees and the layer under it (`subgraph`) |

Not counted: asks that were "show me the timeline" (#2048), "show me X" for pictures (#2460) and "show me my weight chart" (#19). Those are already drawn.

## What this says

- **12 of 20** are "what a screen looks like", a UI redrawn from parts, often a foreign one (Firebase, a client's page). `sketch` has rows and three frames; it has no nav bar, tabs, fields, toggles, grid or sheet. -> `mock`.
- **8 of 20** are "how it flows", a process, an exchange between parties or the states of a thing. `shapes` can fake a box-and-arrow chart, but the agent must place every shape and it cannot lay out a branch. `flow` reads Mermaid but asks questions, it does not draw. -> `diagram`.
- #1885 is the general ask for both (counted with the mocks).

## Still missing after diagram and mock, ranked

| Rank | Gap | Seen in | Note |
|---|---|---|---|
| 1 | Parts side by side inside a mock (a row of two buttons, an icon beside a title) | 1677, 1841, 2147 | Every real UI has them. `part` stacks. Next: a `stack` part that takes the next N parts across. |
| 2 | Gesture marks on a mock: a touch dot, a swipe arrow, a drop spot | 2056, 1667 | The hold-to-talk story is all motion. Next: `part touch` and `part swipe` over the screen. |
| 3 | Board columns (kanban) | 282 | `grid` has cells, not cards under headings. Next: `columns` in `mock`. |
| 4 | Callouts on a real image (pins and boxes on a screenshot) | 1600 | `compare hl=` boxes a region; nothing labels it. Next: `image` with `note=` pins. |
| 5 | A number that counts up inside a mock | 2140 | `stat` counts; a mock part cannot. Next: `part counter from= to=`. |
| 6 | The other Mermaid types drawn (class, ER, gantt, journey, mindmap) | none yet | `diagram` keeps their `source` and shows it as text. Wait for an ask. |

Trees need nothing new: a top-down flowchart with a `subgraph` is a tree (#542, #2573).

## Not on the list

Generating an image (Chris, Sep 30: "I don't want you to generate an image using nano banana or something"). Everything above is drawn on the phone from lines, in the agent's look, with no render and no network.
