# Jev at two decision points: the measured results (YUI-215)

Written 2026-09-30. Fourth after SITE-91 (`jev.md`), SITE-92 (`jev-in-yui.md`) and the PROP-2 proposal. Those were paper. This one ran real calls: about 770 Jev calls in all, for about two cents of OpenRouter spend, against `typesafe/jev-1.13`.

Chris, 2026-09-29: "we should be using this at multiple decision points... make our first couple implementations of this model and see if we can improve performance." Two decision points were built, both shadow first:

1. **Reply shape**, in the Hermes plugin. Before the agent's turn, one Jev call picks line, yes/no, card, pages or full screen (and asks how many things, map, camera). Logged next to the shape the agent really sent. Behind a flag, off by default, a sure answer becomes one hint line in the turn.
2. **Tool router** for the native crew (Penny, Basil, Arnold, Gouda, Quill). Jev picks among the agent's tools for a message the hand-written patterns missed. Shadow only.

Code: `hermes-plugin/yui/jev.py`, `runtime/src/jev.ts` and the harness in `hermes-plugin/jev_eval/` in the app repo. Raw numbers: `hermes-plugin/jev_eval/results/`.

## The short version

- **The tool router is a clear win.** Today's patterns catch 65 of 124 ways to ask for a tool (52%). Jev alone catches 114 (92%). Patterns first and Jev on a miss catches 120 (97%). It reaches 55 of the 59 asks the patterns miss. "Could you get my week into some kind of order" goes to plan my week.
- **The shape hint is mixed, and the answer depends on the shape.** On every shape it made the channel eval worse (the cases that got a hint passed 91% without it, 82% with it). Limited to card, pages and full screen it did not lose a single case in two runs (86% to 100% on those 25 cases). A `line` hint is what hurts.
- **Speed and cost are as claimed.** Median 248 ms, 95th percentile 323 ms (a second run: 263 and 392). About 800 tokens in, $0.034 per 1,000 turns for the shape call, $0.018 per 1,000 for the router.
- **Confidence means something.** Jev's stated confidence is close to how often it was right on real messages (0.9 and up: 96% right). On the eval's cases it was overconfident in the middle (0.8 to 0.9: right 56% of the time).
- **Nothing is live yet.** Both paths sit in the code, dormant until a key is in the gateway's environment. Every number here is offline.

The ask to Chris: turn the shape hint on for card, pages and full screen, or keep watching. See the end.

## What was measured, and against what

Three labeled sets. The labels are mine, hand-made by the Yui agent, not an independent judge. Where that limits a number it says so.

| set | what | size | where it lives |
|---|---|---|---|
| Channel eval | The eval's own messages (`spec/channel-eval/cases.json`) that are a person's typed words. Taps, reactions and notes were left out. Each is labeled with the shape that fits: `hermes-plugin/jev_eval/labels_eval.json` | 88 messages: 59 card, 13 pages, 8 full, 7 line, 1 yes/no | In the repo |
| Real messages | Messages actually typed into Yui threads, from the yui profile's session log (145 raw, 141 labeled, duplicates and unclear ones dropped). Each labeled by hand with the shape that fits | 141 messages: 72 line, 26 card, 22 pages, 13 yes/no, 8 full | Kept out of the repo. The results file holds indexes and numbers, never the words |
| Router phrasings | Written for this: for each crew tool, 6 to 10 ways to ask, from plain to loose, plus chat that needs no tool. Labeled with the right tool: `router_set.json` | 174 phrasings (124 asks, 50 chat) plus the 141 real messages as chat that must reach no tool | Phrasings in the repo, real messages out |

"Today" for the router is the runtime's real code: `router_today.mjs` runs `planAsks`, `mealAsks`, `musicAsks`, `studyAsks` and `workoutAsks` on each message, no copy of the patterns. "Today" for the shape is the shape the agent actually sent (read from its reply) for the real messages, and the channel eval's pass rate for the eval.

## Point 1: reply shape

### Does Jev pick the right shape?

| | Jev, every answer | Jev, 0.8 and up | Jev, 0.9 and up | Agent today |
|---|---|---|---|---|
| Real messages (141) | 64% right (second run 67%) | acts on 28%, right 95% | acts on 18%, right 96% | 29% |
| Channel eval (88) | 62% right (second run 62%) | acts on 43%, right 76% | acts on 25%, right 91% | not comparable |

The agent-today number needs care. It is the shape of the replies the agent sent to those real messages under older guide versions, classified from the reply text by a simple rule (`jev.sent_shape`), against my labels. Most of those messages are Chris telling his project agent something ("keep pushing", "update the timeline") and my label for them is one line. The agent often answered with a screen. Read it as "the agent over-builds on chatty messages", not as a precise score. Jev's shape hardly moved between two runs: 221 of 229 top picks were identical, and confidence differed by 0.025 on average.

By label on real messages: line 48 of 72, yes/no 11 of 13, card 17 of 26, full 5 of 8, pages 10 of 22. Jev under-calls pages: of the 22, it said card for 5, full for 3 and line for 3. On the eval: card 38 of 59, pages 6 of 13, full 4 of 8, line 6 of 7.

### Is the confidence honest?

Right when it said it was:

| Jev's confidence | Real messages: how many, right | Channel eval: how many, right |
|---|---|---|
| 0.9 and up | 25, 96% | 22, 91% |
| 0.8 to 0.9 | 15, 93% | 16, 56% |
| 0.7 to 0.8 | 14, 86% | 9, 78% |
| 0.5 to 0.7 | 27, 78% | 20, 55% |
| under 0.5 | 60, 33% | 21, 38% |

On real messages the numbers line up: 0.96 said, 96% right. On the eval's cases they do not in the middle: the eval's messages are richer asks where a short line and a screen are both defensible, and Jev leans to `line` on them with 0.8 to 0.97 confidence. So 0.8 is a fine line on chatty messages and a weak one on asks that want a screen. Under 0.5 it is nearly a coin flip, as the docs say, so it does not act there.

Map: at 0.85 it caught 3 of 5 map asks on the eval, missed 2 and called one plain fact (the capital of Portugal) a map. Camera: one camera ask in the whole set (log my lunch), missed. Too few to judge, and the map hint made a plain fact a screen (below), so the map hint is off by default.

### Does the hint improve the agent?

The channel eval, with the same guide the plugin sends, run through `run.mjs --hints` so each case gets the hint line the plugin would add. Model Sonnet 5.5 (what cards run on). Baseline run twice; the hint arm run twice on the cases Jev was sure about (cases it is not sure about get the same turn either way, so they cannot change).

| Hint policy | Cases that get a hint | Passed without the hint (2 runs) | Passed with it (2 runs) | Lost / gained |
|---|---|---|---|---|
| Every shape at 0.8 and up | 37 of 88 | 34 and 33 | 31 and 30 | lost 6 and 7, gained 3 and 4 |
| Card, pages and full only, no map hint | 25 of 88 | 22 and 21 | 25 and 25 | lost 0 and 0, gained 3 and 4 |

Noise: the two baseline runs differ by one case on the 37, so the swings above are not noise. The whole 88-case suite passed 77 then 75 with no hints (Sonnet 5.5 on guide v43).

The six cases the every-shape hint lost, in both runs: a `line` hint on cases that want a screen (check-in morning, why India gets monsoons, the declined invite, the worker running, "show me here"), and the map hint turning "what's the capital of Portugal" into a map. A seventh, show-phase-one, lost once. The three to four the shape-limited hint gained are cases where the guide alone under-builds (a card for the sample status board, the three-option decision, uke chords, and once a walkthrough with its pictures).

The catch, plainly: I picked "card, pages and full only" after seeing the every-shape run lose on those same cases. The 25 of 25 is tuned on the set it is measured on. It is a good reason to try that policy, not proof it holds.

A second check, on real messages. The 39 real messages Jev was sure about went to the agent (Urza's persona, no project context, Sonnet 5.5) with and without the hint, and I compared the reply's shape to my label: 20 and 21 matched with no hint, 27 with it. The gain is mostly lines: 13 of 19 to 18 of 19 (the hint stops a screen for "keep pushing"), and cards 3 to 5 of 10. Yes/no never matched either way (my rule for a yes/no reply is strict), full and pages did not move. So on real chatter the line hint does what Chris wants. On the eval's richer asks it does the opposite. Both are true, and I cannot tell from here which one his day looks like. The live shadow log will (below).

### The default that ships

`jev.py` hints only card, pages and full (`HINT_SHAPES`), never the map, never the camera, and drops a hint when it clashes with the how-many answer. Lines and yes/no are still asked and logged, just not told to the agent. `yui.jev_hint_shapes` widens it. The whole hint is behind `yui.jev_hint: true` (or `YUI_JEV_HINT=1`) and is off.

## Point 2: tool router for the crew

Rule under test: patterns first (free and instant), Jev only when no pattern matched, acting at 0.8 confidence.

| 124 asks for a tool | Caught | False routes on the 191 chat messages |
|---|---|---|
| Today's patterns | 65 (52%) | 0 |
| Jev alone at 0.8 | 114 (92%) | 2 |
| Patterns, then Jev | 120 (97%) | 2 |

Jev reached 55 of the 59 asks that today's patterns miss. Its raw top pick was right on 97.5% of all 315 items. Confidence: 0.9 and up covered 284 items and was right 99.6% of the time. The cut sweep: at 0.9, 116 of 124 caught with 1 false route; at 0.5 to 0.7, 122 caught with 3.

What today misses, by kind: almost anything that is not the exact phrase. "Get my week in order", "put pick up dry cleaning on my list", "we're out of butter, add it to my list", "I practiced for 30 minutes" on a slightly different verb, "help me get stronger, I have three days". The four Jev still misses: "I need to buy a birthday gift for Mick by Thursday" (a to-do, 0.46), "I'd like to work on a new tune" (0.66), and two under the line ("how many flashcards are waiting", "can you log what I did today").

The two false routes were among the 141 real messages sent to Penny: "where are we at this morning, what's to be done next" and "what's queued up on the board currently" went to "what's next" at 0.89 and 0.98. They are not really Penny's questions, but a person could mean them so. Nothing is routed in shadow, so no turn went wrong.

Limits. The 124 phrasings are mine, written to be loose but written by the same hand that wrote the tool descriptions Jev reads, so this is likely the optimistic end. No real crew traffic is labeled: those turns sit in the yuigui database and I did not pull them. Treat "52% to 97%" as the ceiling of the win and "a real jump" as the sure part.

## Speed and cost

229 shape calls (about 800 tokens in) and 315 router calls (about 440 in), from the Mac mini to OpenRouter:

| | Median | 95th percentile | Slowest | Over 600 ms |
|---|---|---|---|---|
| Shape call, run 1 | 248 ms | 323 ms | 480 ms | 0 of 229 |
| Shape call, run 2 | 263 ms | 392 ms | 1,241 ms | 2 of 229 |
| Router call | 246 ms | 356 ms | 1,832 ms | 2 of 315 |

The plugin waits 600 ms and moves on, so between none and 1 turn in 100 goes without a decision. Cost: $0.0337 per 1,000 shape calls, $0.0183 per 1,000 router calls (output is free). The shape call runs beside the network work the plugin already does before the model (mentions, group notes), so on a normal turn it adds well under 250 ms. The whole job cost about two cents of Jev. The cap was $5.

## What was built

- `hermes-plugin/yui/jev.py`: the questions, the call (600 ms, no retry, never raises), the spend cap (`JEV_SPEND_CAP`, default $1 a day), the hint rules, the log (`<profile home>/yui/jev.jsonl`: numbers and the shape sent, never the words) and the tool router function used by the harness.
- `hermes-plugin/yui/adapter.py`: starts the call when a plain owner message arrives (not a tap, not a slash command, not a shared agent), overlaps it with the mention and group work, and adds at most one hint line. After the reply is written it logs the decision next to the shape sent.
- `runtime/src/jev.ts` and one block in `runtime/src/turn.ts`: when no pattern caught a crew agent's message, ask Jev in parallel with the model and log one line (`jev shadow plan_week 0.93 (would route)`). Nothing is routed. The yui-native function reads `YUI_JEV_KEY`; unset, it makes no call. Not deployed.
- `hermes-plugin/jev_eval/`: the labels, the harness (`run_shape.py`, `run_router.py`, `router_today.mjs`, `compare_eval.py`, `chart.py`) and the results.
- `spec/channel-eval/run.mjs`: `--hints` (a hint line per case, as the plugin adds it) and `--cases` (another suite file).
- Tests: `hermes-plugin/tests/test_jev.py` (14, no network), `test_jev_turn.py` (9: shadow adds nothing, the hint is one line, a slow Jev never holds a turn, taps get no call), `runtime/tests/jev.test.ts` (5).

## Where this could be wrong

- **My labels.** One labeler, the same agent that wrote the guide. A different person would disagree on the line versus card boundary, and that boundary is where the shape results turn.
- **The real set is thin and lopsided.** 141 messages, mostly Chris to the project agent, half of them "one line". Crew traffic and other users' messages are not in it.
- **The shape-limited hint was tuned on the eval it is scored on.**
- **The real-message hint check has no project context.** The agent that answered had no board or build facts, so what it wrote is generic. It shows the shape, not the quality.
- **Latency is from one machine.** The edge function would run from another region.
- **Nothing measured live.** The shadow log exists to measure that.

## What is next

Neither path runs live. To watch real turns (Chris's own, owner only): put the OpenRouter key in the yui gateway's environment as `OPENROUTER_API_KEY` and restart it, after the app repo checkout the gateway reads has these commits. That sends each of his typed messages, cut to 400 characters, to TypeSafe through OpenRouter. It is his message and his call (PROP-2, open question 1). After a week of `jev.jsonl`, `python3 hermes-plugin/jev_eval/` can score the live agreement between what Jev picked and what the agent sent.

The decision Chris has to make: turn the shape hint on for card, pages and full screen.
