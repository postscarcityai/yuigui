# Where Jev fits in Yui (SITE-92)

Written 2026-09-28. Second of four after SITE-91 (`docs/research/jev.md`, read it first for what Jev is, its speed, cost and limits). No app or plugin code changed. No Jev key, no signup, no spend, no live call: every schema below is a proposal built from the request shape in SITE-91, and none of it has been run against Jev.

Paths are in the app repo (`~/dev/yui`, read at origin/main 58c325e) unless they start with `spec/` (this repo). Line numbers are for that commit and will drift.

## The short version

Yui already makes about twenty small decisions on a turn. Three ways of deciding exist today:

- **The LLM reads the guide.** Reply shape, map, camera, deck or line, all of it. `spec/CHANNEL.md` v37 is injected on every turn (`hermes-plugin/yui/adapter.py:213`) and the model picks. This is where text bombs and "eight screens of basically nothing" come from.
- **A regex or a counter.** The native runtime routes "plan my week", "add X to my groceries" and "is this photo a log or a question" with hand-written patterns (`runtime/src/meals.ts:92`, `mealplan.ts:693-699`, `planner.ts:695-699`, `study.ts:584-590`, `music.ts:631-635`, `workouts.ts:300-301`). Cheap and fast, and they break on the first phrasing nobody wrote.
- **The person.** A tap, an @name, the app's switch.

Jev fits the first two. Those are small closed questions on a short text, and Jev returns a choice or a yes/no probability with a confidence, in about a tenth of a second. It does not fit anything that writes prose, sees an image, or must never be wrong.

The plan is one Jev call per turn on the host, before the LLM. It adds one plain line to the turn ("shape: one line, no screen") and never blocks. Below the confidence line it says nothing, and the guide decides as today.

## How a turn runs today

1. The app writes a row. The plugin polls and queues it (`adapter.py:632` `_pump`).
2. `_dispatch` (`adapter.py:935`) builds one message: notes about mentions and groups (`:1035`, `:1059`), photos localized (`media.py:198`), taps rewritten. It attaches the per-turn prompt (`channel_prompt`, `:995`), which today holds only the agent's look and the restyle sentence.
3. The agent's LLM runs with the guide as its platform hint.
4. The reply comes back through `_insert` (`adapter.py:1140`): `doing` lines split out, `theme app` gated, text bomb counted (`textbomb.py`, log only), downgraded for old phones (`compat.py:589`), media hosted, @mentions and hand-off cards found, push sent unless the reply is only patches (`connector.py:154`).
5. On the phone, the stage decides what opens full screen (`Packages/YuiLines/Sources/YuiLines/Stage.swift:16`).
6. On native agents (Basil, Penny, Quill and others) the runtime answers some turns itself before any model runs (`runtime/src/turn.ts:221-282`).

Jev's slots are between steps 2 and 3 (a hint, before) and after step 3 (a check, before step 4 writes the row).

## Decision points and where Jev fits

"Today" says who decides now. Schema names are Jev question names; each is a `choice` (pick one from a list), `noul` (yes/no probability) or `score`. "Pre" means the plugin or runtime calls Jev before the LLM and adds a hint line. "Post" means it checks the finished reply before the row is written. Fallback is always what happens now.

| # | Decision point | Today | With Jev | Schema | Runs | Fallback |
|---|---|---|---|---|---|---|
| 1 | Reply shape: one line, yes/no, card, pages, full screen (guide "Answer first", `CHANNEL.md` Use it well; `adapter.py:213`) | LLM reads the guide. Wrong when a status question gets a deck (build 160 case, `spec/channel-eval/RESULTS.md` v29) | Jev picks the shape and the LLM is told | `shape`: choice `line`, `yesno`, `card`, `pages`, `full` | Pre, `_dispatch` `:995` | Below the line: no hint, guide decides |
| 2 | How many pages (deck 3 to 4 things, "at most 4") | LLM counts; `compat.py` and `textbomb.py` never cap it | Jev scores how many separate things the answer needs | `things`: score 1, 2, 3, 4, 5+ | Pre (with 1) | Guide's rule |
| 3 | Needs a map (guide "Where is a map") | LLM reads one bullet; sometimes describes places in words | Yes/no on a where question | `map`: noul | Pre | Guide's rule |
| 4 | Open the camera (`camera` line, `YL.md` camera, `Stage.swift:16` opens it full screen) | LLM decides to ask for a photo; the person taps | Yes/no on whether the ask needs a photo | `camera`: noul | Pre | Guide's rule |
| 5 | Which camera: plain, meal, document (`+scan`), barcode, tuner mic | Only `camera`, `+scan`, `+say` exist in the spec (`YL.md:174`); meal is Basil's own prompt (`runtime/src/crew.gen.ts`). No barcode or tuner-camera preset in the app that I found | Jev picks the kind from the words; the LLM writes the matching line | `camera_kind`: choice `plain`, `meal`, `document`, `barcode`, `mic_tuner`, `none` | Pre, only when #4 is yes | Plain `camera`. Barcode and document do not exist yet, so do not offer them until the app has them |
| 6 | Photo of a meal: log it or answer a question (`runtime/src/meals.ts:110-117`, `ASKING` regex `:92`) | Regex. "Plan" or "menu" anywhere sends a logging photo to the model; a question with no `?` or keyword gets logged as a meal | Jev reads the words with the photo | `photo_intent`: choice `log`, `question`, `unclear` | Pre, in `mealTurn` | Today's regex |
| 7 | Native intent routers: plan my week, add to groceries, teach me, quiz me, review (`mealplan.ts:693-699`, `planner.ts:695-699`, `study.ts:584-590`, `music.ts:631-635`, `workouts.ts:300-301`) | Anchored regexes; "could you sort my week out" misses | One choice over the agent's own tools | `tool`: choice, per agent (`plan_week`, `add_grocery`, `none`, ...) | Pre, in `runtime/src/turn.ts` before `:221` | Regex first (fast, free); Jev only when no regex matched and the agent has tools |
| 8 | Text bomb after the fact (`textbomb.py:CAP=60`, `adapter.py:1189`) | Counts words, writes a log row, warns. The reply is already sent | Jev checks the drafted reply against the shape it should have had | `reply_ok`: choice `fine`, `too_long`, `should_be_screen`, `deck_for_yes_no` | Post, before `_write_row` | Log only. Never rewrite or drop a reply |
| 9 | Needs a Chris gate: outbound email, posts, spend, deletes (Yui SOUL red lines, `needs.py` for the answer path) | The agent's own judgment; nothing checks the reply | Advisory flag on a drafted reply that acts outward | `outward`: noul | Post | No flag. Never the only gate |
| 10 | Which agent answers in a group (YUI-77; `groups.py`, `spec/GROUPS.md`) | An @name wins, else the lead (`GROUPS.md:19`). On-device guess planned in YUI-41 (`spec/ON-DEVICE.md` section 3) | Same job, but hosted | `to`: choice over member handles plus `lead` | Pre, app or plugin | Lead, as today. See open question 3 |
| 11 | Push or stay quiet (`connector.py:154` `quiet`, `adapter.py:1220`) | Rule: patches only means silent; everything else pushes | Score how much it needs the person now | `urgency`: score `none`, `low`, `normal`, `high` | Post | Rule as today. Jev could only make a push quieter, never louder |
| 12 | Can the on-device model answer alone (YUI-41, `spec/ON-DEVICE.md`) | Design only; today every turn goes to an agent | Would need Jev on the phone; hosted Jev cannot help | `alone`: noul | n/a | n/a. Not a Jev job |
| 13 | Which saved flow or library preset fits (FLOW-2, `/api/library`, `CHANNEL.md` saved flows) | LLM reads a list of five flow names in the guide; the library is a search API | Choice over flow ids | `flow`: choice `website-intake`, `self-scope`, `workout-checkin`, `onboarding`, `connect`, `none` | Pre | Guide's rule |
| 14 | Hand-off to another agent (YUI-144, `mentions.py`, `turn.ts:477`) | LLM writes the card | Yes/no that this belongs to another agent | `handoff`: noul | Pre | Guide's rule |
| 15 | Whether a photo turn is even a photo ask (`media.py`, `compat.py`) | Rule: any photo | Not Jev: it is a fact, not a judgment | | | Keep the rule |
| 16 | Old phone cannot draw a preset (`compat.py:589`) | Rule by build number | Not Jev: a fact | | | Keep the rule |
| 17 | Owner-only taps, stop, sandbox pause (`adapter.py:660`, `:766`, `:943`) | Rules with a security meaning | Not Jev, on purpose | | | Keep the rule |
| 18 | Suggested reply chips (YUI-41 job 1) | Design only | On-device job; the words would leave the phone | | | Not Jev |

Rows 15 to 18 are here so nobody re-asks. Anything that is a fact or a permission stays a rule.

## The Jev call, drawn once

One call, one state, up to five questions. TypeSafe's docs say to ask atomic questions in parallel and combine them in code (SITE-91), so the plan is one call with several named questions, not several calls.

State sent (the least that works, cut to about 800 tokens):

```
{
  "message": "<the person's words, first 400 characters>",
  "last_agent_shape": "line|card|pages|full|none",
  "has_photo": true,
  "agent": "coach",
  "tools": ["plan_week", "add_grocery"]
}
```

Questions for the shape call (`questions` map, each with `type`, `instructions`, `criteria`; the exact `criteria` syntax is from the quickstart summary in SITE-91 and is unverified by me):

```
shape        choice  "How should the agent answer on a phone?"
                     line | yesno | card | pages | full
things       score   "How many separate things must be read?" 1 | 2 | 3 | 4 | 5+
map          noul    "Is this a question about where something is?"
camera       noul    "Does this need the person to take a photo?"
camera_kind  choice  "Which camera?" plain | meal | document | barcode | mic_tuner | none
```

What the plugin does with the answers (one line, added to `channel_prompt`, never a command):

```
[yui] hint: shape=line (0.91). No screen, one sentence.
```

Confidence rules, mine, to tune on the eval set:

- `choice` and `score`: act at 0.80 or better, say nothing under it. Jev's own docs suggest three tiers (high acts, medium asks, low does not act), thresholds yours to tune (SITE-91). I use two: hint or nothing.
- `noul` carries no confidence field (SITE-91). Act only at p at or above 0.85 or at or below 0.15; the middle is "no hint".
- Two hints that clash (`shape=line` with `things=4`): drop both.
- Jev is down or over 600 ms: skip, no retry. The turn never waits longer than that on Jev.

Why a hint and not a rule: Jev "cannot pick outside the list, but can pick the wrong one" (SITE-91). A hint the LLM can overrule keeps a wrong answer from being a wrong screen.

## Speed and cost per turn

From SITE-91: 70 to 500 ms claimed, 70 to 300 ms typical per community reports (unverified), $0.042 per million input tokens, output free, about $0.00003 for an 800-token call, about three cents per thousand turns. One review quotes 13 questions in one call as 10 times faster than 13 calls (unverified). I have not measured any of this.

- **Added wait:** the hint must land before the LLM starts, so it cannot fully overlap the LLM. It can overlap the work `_dispatch` already does before the model: the mention and group notes are network calls (`adapter.py:1035`, `:1059`) and photos are fetched (`media.py:198`). Run Jev with `asyncio.gather` beside them. Budget 100 to 500 ms of added wait worst case, against turns that take seconds.
- **The check (row 8) runs after the reply** and before the row is written, so it adds its own 100 to 500 ms to every reply. Run it only when the reply has more than about 40 words or a `deck`; short replies skip it.
- **Cost:** one pre call and, on long replies, one post call. At most two calls a turn, under $0.0001 a turn. Cost is not the constraint. Privacy and reliability are.

## What goes wrong if we do this

- **Private text leaves the phone.** Today the person's words go to their own agent. A Jev call sends them to TypeSafe. TypeSafe says it will not train on inputs and keeps them "as long as reasonably necessary" with no fixed period (SITE-91). Send the message cut to 400 characters, no thread, no other agents' text. The on-device spec chose "nothing leaves the phone" (`spec/ON-DEVICE.md` section 9), so this is a real change of stance and it is Chris's call (open question 1).
- **Shared agents.** A shared agent's turns carry someone else's words (`adapter.py:943`, owner is `key == agent_id`). Start owner-only.
- **Vendor dependence.** Days-old model, early access, price unknown after (SITE-91). The design has no hard dependency: every row falls back to today's behavior.
- **Text only.** Jev cannot see a photo or a map. `has_photo` is a flag, and row 6 works from the words alone.
- **No labels yet.** There is no labelled set of "right shape" turns. `spec/channel-eval/cases.json` has scored cases with shape checks (short, report, plain) and can seed one. One review's 93% on 100 support tickets (SITE-91) says nothing about Yui.

## The five to do first

Order is by how much a wrong answer costs today, how fast we can tell if Jev is right, and how much it needs.

1. **Reply shape, one call (rows 1, 2, 3 in one call).** This is the problem Chris keeps naming: a deck for a yes/no, a text wall for a status. It runs pre-LLM as a hint, so a wrong answer cannot ship a wrong screen; the LLM can overrule. It is testable on cases we already have.
2. **The post check (row 8), log only.** `textbomb.py` already counts words after the fact. Jev adds "should this have been a screen" and "deck for a yes/no", the exact two failures. Log only means zero risk and gives the labelled data for row 1. Do this in the same build, since it measures whether row 1 works.
3. **Photo intent (row 6).** A small, closed, real bug: `ASKING` (`runtime/src/meals.ts:92`) sends a plain logging photo to the model when the words contain "plan" or "menu", and logs a question that has no `?` or keyword. Two clear options and a fallback that is the current regex. It only touches Basil.
4. **Camera and which camera (rows 4 and 5).** The person taps a camera; the LLM decides to offer it. Jev's yes/no on "needs a photo" is a cleaner trigger than a paragraph of guide. Hold row 5 back beyond `plain` and `meal` until the app has a document or barcode preset; the guide must not offer what the app cannot draw.
5. **Native tool router (row 7), after the regex.** Keep the regex as the fast path and let Jev catch what it misses, for agents with tools (Penny, Basil, Quill). Only run it when no regex matched, so cost and latency stay off the common path.

Not first, and why: the Chris gate (row 9) because a safety check should not rest on a model whose calibration is unproven; groups (row 10) because YUI-41 plans it on the phone for free and private; urgency (row 11) because the current rule is fine and Jev could only make things quieter.

## Open questions for Chris

1. **Is the person's message allowed to leave the phone for Jev?** (a) yes, owner turns only, 400 characters; (b) no, Jev only on our own eval traffic, never a real turn; (c) only on agents the person marks. I would start with (a), behind a switch in Settings.
2. **Who makes the Jev account and key?** A browser step at console.typesafe.ai (SITE-91). Nothing is built against a real key until then.
3. **Group routing: wait for the on-device model, or use Jev?** On-device keeps text on the phone (YUI-41). Jev works on every phone. I would wait.

## Next step

SITE-93 (third of four) turns this into the PROP-2 proposal on /proposals. Whatever gets built after that should start with an eval set: label 100 real Yui turns (shape, camera, map, photo intent) and score Jev against them before any hint reaches a person. The confidence lines above are guesses until that runs.
