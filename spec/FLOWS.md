# Flows

A flow is a saved series of Yui screens that any agent can run: a client website intake, scoping a project, a workout check-in. It is written in Mermaid, so the same text is a chart anyone can read (GitHub draws it as is) and a script the phone runs, one screen at a time, with branches.

Plan mode (YL.md, section 4, plan) is the first flow, and it is linear. A flow is plan mode with a map: Next follows the edge your answers pick.

Status: step 3 (FLOW-1). Step 1 shipped the spec, the JavaScript parser and the web runtime in the playground. Step 2 gave every parser in the hub (JavaScript, Python, Kotlin, Rust) the same flow vectors, pinned what a native runner keeps on the phone (section 5), and mocked My flows in the playground. Step 3 lets an agent make its own version of a saved flow, a variant (section 9). The app runs flows in its own step. Until then the yui plugin sends a flow to the phone as the plan it walks by default (the same questions, keyed by step id, one submit, a `{plan}` event), so a flow never lands as nothing (YUI-155); a host without the plugin shows the flow line as unknown.

## 1. A flow in Yui Lines

Inline, the agent sends the whole chart between `flow` and `end`:

```
flow@checkin "Workout check-in" submit="Send to my coach"
flowchart TD
  %% sleep: slide "How did you sleep?" 1-10 Awful|Great
  sleep[Sleep] --> energy
  %% energy: choose "Energy right now?" Low|OK|High
  energy[Energy] --> check{Rough day?}
  check -->|sleep<5 or energy=Low| easy
  check --> today
  %% easy: page "Take it easy today" body="A lighter session still counts."
  easy[Easy day] --> today
  %% today: choose "Today's session?" "Full session"|"Lighter version"|"Rest day"
  today --> note
  %% note: mic "Anything your coach should know?"
  note[Note]
end
```

Saved, the agent sends one line: `flow website-intake`. The name is looked up in the saved flows on the phone (the starter flows below today; the person's own flows once My flows lands). `flow "Website intake"` finds the same flow: names match on letters and digits, case and spacing aside. With no saved flow by that name the phone says so and nothing else happens.

`flow [@id] [title or name] [submit=] [review=off] [+inline]`

- The line after the head decides. A Mermaid header (`flowchart TD`, `graph LR`, any direction) starts an inline flow; anything else leaves it a saved flow by name, and that line is read as ordinary YL. Mermaid `%%` comments may sit between the head and the header.
- Inside an inline flow every line is Mermaid, not YL, up to `end`. A Mermaid `subgraph` has its own `end`; the parser counts them, so the flow's `end` is the one with no subgraph open. With no `end` the flow closes at the end of the reply.
- `submit` [Send] labels the last button, `review=off` skips the review (the last answer submits), `+inline` keeps it in the chat. Otherwise a flow opens on the stage, like a plan.
- Give the flow an id (`flow@checkin`) so its event is easy to match.

## 2. Steps

Each Mermaid node can carry one step, a YL line. The node's id is the step's id, the key its answer comes back under.

- **In a comment** (preferred): `%% energy: choose "Energy right now?" Low|OK|High`, anywhere in the chart. The node keeps a short label for the chart (`energy[Energy]`) and the chart stays clean on GitHub.
- **As the label**: `energy[choose Energy? Low|OK|High]`. Quick, but the chart shows the raw line, and a double quote inside a Mermaid label has to be written `#quot;`.

A step is one of `page`, `ask`, `choose`, `pick`, `slide`, `form`, `mic`, `camera`, the same as a plan's members, and means the same: a page is a step to read (not answered, not keyed), a question sends what it would send on its own (`choose` its choice, `pick` a list, `slide` a number, `form` an object, `mic` a transcript, `camera` a photo). Any other preset in a step comment is an error line and the node gets no step. A comment that is not a step (`%% ask Chris first`, `%% a: dance fast`: `dance` is no preset) is just a comment, and a label that is not a step is just a label. A step comment for a node the chart never draws is dropped.

A node with no step shows nothing. It routes: `check{Rough day?}` above reads its edges and moves straight on. Use such nodes for decisions that look at several answers, and for the end (`done((Done))`).

Node ids are letters, digits and `_`. Avoid Mermaid's own words as ids (`end`, `call`, `click`, `style`, `class`, `subgraph`, `graph`, `flowchart`, `default`): Mermaid will not draw the chart.

## 3. Edges and conditions

`a --> b` is a default edge. A label makes it a condition on earlier answers: `a -->|kind=Shop| b` or `a -- kind=Shop --> b`. Chains (`a --> b --> c`), `&` (`a & b --> c`) and the other arrow styles (`---`, `-.->`, `==>`) all make edges; the invisible `~~~` does not.

After a step, Next takes the **first labelled edge whose condition holds, in source order**, else the first default edge. With neither, the flow ends and the review comes next. The start is the first node in the source with no edge into it.

A condition is clauses joined by `and`, alternatives joined by `or` (`and` binds first):

| Clause | Holds when |
|---|---|
| `kind=Shop` | the answer is `Shop` (text compares without case or outer spaces; numbers as numbers) |
| `kind!=Shop` | it is not, or `kind` has no answer on the path |
| `budget>=20`, `>`, `<`, `<=` | the answer is a number and compares so |
| `note~back` | the answer contains `back` |
| `pages=Blog` | for a `pick`: the list has `Blog` (`!=`: does not; `>`, `<`: compares the count) |
| `brief.budget>10000` | a `form` field, by its key |
| `Shop` | a bare value: the answer of the step the edge leaves is `Shop`; from a node with no step, the question answered just before it |
| `else`, `default`, `otherwise`, empty | the default edge |

Quote a value that holds `and` or `or`: `kind="Rock or roll"`. A question with no answer on the path fails every clause but `!=`.

Flows do not loop: an edge back to a step already on the path ends the flow there. When every node has an edge into it (a ring), the first node in the source starts.

A step with no edge out, or whose labelled edges all fail and that has no default, ends the flow: the review comes next. There is no missing node in Mermaid: naming an id in an edge draws it. An edge to a node with no step and no edges out ends the flow the same way.

Lines the parser cannot read (an unclosed `a[Oops`, an arrow with nothing on one side) are kept in `source` and skipped, with no error line: Mermaid will flag them where the chart is drawn, and the steps that did read still run. A header and `end` with nothing between is a flow with no steps: the phone says so and sends nothing.

## 4. Running it

The runtime is plan mode with branches (YL.md, section 4, plan), and everything plan mode promises holds: one step at a time on the stage, `ask` and `choose` move on by themselves after a tap, pages are read and Next moves on, Back and Next at the bottom.

- **Progress.** "Step 4 of 9": the steps so far on the path, this one, and what lies ahead. Ahead follows the answers already given and, where a branch is still open, the edge that earlier answers already decide, else the default one. The count changes when an answer picks a branch, and that is fine: it is an honest guess.
- **Back** walks the path taken, not the source order. From a step on the Shop branch, Back goes to the step before it on that branch.
- **Changing an answer** that picks another branch drops the steps of the old branch from the path. Their answers are kept on the phone in case the person switches back, but they are never sent.
- **The review** lists only the answered questions on the path, in path order, each with Edit. Edit opens that step; once the path from the start has every answer again, Next goes straight back to the review. If the new answer opened a branch with questions not answered yet, Next goes through them first.
- **Folding back** is the same as a plan's: the flow's spot in the chat becomes a summary chip (its title, pages and answers on the path) that reopens it, and the answers land as the person's message, one `<question>: <answer>` line per answered question on the path.

## 5. On the phone

What a native runner keeps for each flow it shows, so a flow survives a killed app and never sends twice:

- **The graph.** For an inline flow, the patch's props as they came (`source` included). For a saved flow by name, the saved copy it ran, not a live link: editing that flow later in My flows does not change a run already started.
- **The run**, keyed by the message and the flow's id: every answer given (off-path answers too, section 4), the step on screen (a step id or `review`), and `sent` once the event is out.
- **Resume.** Reopening the flow, after a kill or days later, rebuilds the path with `flowPath` from the stored answers and opens the stored step if it is still on the path, else `open` (the first question with no answer), else the review. Nothing is asked twice.
- **Once.** The `{flow}` event goes into the app's outbox like any tap and is delivered exactly once (RELAY.md). `sent` makes the fold-back chip show at once; Edit and submit again sends a new event, as section 4 says.
- The run lives with the thread and goes when the thread is cleared or the message is gone.

## 6. The event

A flow sends one event, when the person submits the review:

```
{"id":"intake","preset":"flow","flow":{"kind":"Shop","products":120,"pay":["Stripe"],"goal":"Buy"},"path":["hi","biz","kind","products","pay","goal"]}
```

`flow` has the same shape as a plan's `{plan}`: answers keyed by step id, only for questions on the path. `path` is every step on the path in order, pages included, so the agent knows which branch the person took. Steps send no events of their own. Submitting again after Edit answers sends a new `{flow}`.

## 7. What the parser gives

The head is an add, as any preset line: `{op: "add", preset: "flow", id, props: {title, submit, ...}}`, so the phone can show the flow's spot at once while the chart streams in. The Mermaid lines give nothing (a bad step comment gives an error line). The flow's `end`, or the end of the reply, gives one patch on the flow with the graph:

```
{op: "patch", target: "checkin", props: {
  dir: "TD", start: "sleep",
  nodes: [{id: "sleep", label: "Sleep", preset: "slide", props: {...}}, {id: "check", label: "Rough day?"}, ...],
  edges: [{from: "check", to: "easy", label: "sleep<5 or energy=Low",
           when: [[{path: "sleep", op: "<", value: 5}], [{path: "energy", op: "=", value: "Low"}]]}, ...],
  source: "flowchart TD\n  ..."}}
```

`when` is the condition: a list of alternatives, each a list of clauses that must all hold. A bare value has no `path` when the edge leaves a node with no step. An edge with no `when` is a default edge. `source` is the Mermaid as sent, so the flow can be saved or shown as a chart. A saved flow by name gets no patch: the phone reads its own copy.

Conformance: `spec/conformance/26-flow.json`, run by the JavaScript, Python, Kotlin and Rust runners; the Swift parser skips it until the app runs flows. It carries the starter flows, conditions on edges, bad Mermaid, cycles, a flow among other lines, and streaming. Its `route` vectors pin the runtime too: for a set of answers, the path, the first open question and the event.

## 8. Starter flows

Every Yui has ten: three from real work, five first plans, the first run, and connecting your tools. Each is under a dozen steps with at least one branch, and each runs in the playground: pick it under "Decks, plans, flows and walkthroughs".

- **`website-intake`**, client website intake. Sit with a client and get everything out of them: the business, what we are building (a redesign asks about the site today, a shop about products and payments, a landing page skips the page list), the first action, brand, budget (15k and up offers a call).
- **`self-scope`**, scope a project yourself. What done looks like, the kind of work (software asks where it runs), how big it feels (months or no idea get a page on cutting it down and ask for the smallest version), who does it (hiring out asks the budget), timing, the biggest worry.
- **`workout-checkin`**, before a session. Sleep and energy (a bad night or low energy gets an easy-day page), anything sore (sore or does it hurt; a real hurt gets a rest-it page), today's session (a rest day skips the time), a note for the coach.
- **`first-plan`**, a first plan any agent can send (YUI-226). Goal, which days, how long a session, what gear, how much you have trained: one question a screen, and every one has Not sure and Skip. Submit is "Build my week". The `{flow}` event has plain keys, `{goal, days, time, gear, experience}`; days and gear are lists, the rest are the words tapped, and Not sure or Skip come back as exactly those words, so the agent picks a sensible default. It is Arnold's first plan (YUI-217) as a saved flow, so Gouda, Penny and outside agents send the same shape and answer with something built.
- **`first-meals`**, Basil's first meal plan (YUI-227). Goal, days, meals a day, what to leave out, cook time. Submit is "Plan my meals". The `{flow}` event has `{goal, days, meals, avoid, cook}`; days and avoid are lists, and Not sure or Skip come back as exactly those words.
- **`first-practice`**, Gouda's first practice plan (YUI-227). Instrument, level, minutes a day, what you want to play. Submit is "Build my practice". Keys: `{instrument, level, minutes, want}`, all single words tapped.
- **`first-week`**, Penny's first routine (YUI-227). Busy days, when you plan, how you want reminders. Submit is "Set my routine". Keys: `{busy, plan, remind}`; busy is a list.
- **`first-study`**, Quill's first study plan (YUI-227). What you are learning, how long you have, how you like to be quizzed. Submit is "Build my study plan". Keys: `{topic, time, quiz}`.
- **`onboarding`**, meet Yui (YUI-38). Your name, how much you know about AI (brand new gets a page on what an agent is, 4 and up asks if you run one), what you want help with, in taps and then your own words. Suggests two starter agents from those answers, lets you pick, and ends on how to connect them today. The whole interview: [Onboarding](ONBOARDING.md).
- **`connect`**, connect your tools (YUI-39). Pick Google Calendar, Gmail or HubSpot; each one picked gets its own consent step with its scopes in plain words, Allow or Not now; then what the agent sees, and what comes next: a sign-in button per tool allowed, or nothing connected. The sign-in buttons come from the agent after the event, never from the flow: [Connectors](CONNECTORS.md).

The crew brings its own (SITE-70 to SITE-74), each from a check-in to that member's tool:

- **`trainer-session`**, the trainer's session. Sleep, anything sore (a real hurt gets a work-around-it page), minutes free, gear. The answers pick the session page (a bad night gets an easy one, 15 minutes or less a quick hit, no gear a bodyweight circuit, else a strength circuit), then a warm-up if you want one. Its `{flow}` event is answered with the moves, minus any that hit a spot that hurts, and the interval timer on the stage (`sessionReply` in site/lib/yl/starter-flows.mjs; the site chat sends it with no model turn).
- **`nutritionist-plate`**, the nutritionist's plate to macros. Pick one of three sample plates; his guess comes on a page with the photo, the macros and how sure he is. How sure shapes the next step: sure (the salmon) goes straight on, fairly sure (pancakes) asks about the syrup, a rough guess (the poke bowl) asks how much rice was under it. Then how much you ate and which meal. Its `{flow}` event is answered with the row in his meals table (the app's schema) and Today, calories and macros against the goal (`plateReply` in site/lib/yl/starter-flows.mjs; the site chat sends it with no model turn).
- **`musician-jam`**, the musician's vibe to a beat. Pick a vibe; each gets its own beat page (kick on 1 and 3, snare on 2 and 4, then hats and one flavor row) and its own tempo range. Change one row (busier hats, an extra kick, a shaker, or leave it), then the chords under it: warm, jazzy or moody, and moody asks for a minor key; just drums skips the key. Its `{flow}` event is answered with the loop playing, the chords under it, and the row in his sessions table (the app's schema) (`jamReply` in site/lib/yl/starter-flows.mjs; the site chat sends it with no model turn).
- **`planner-week`**, the planner's busy week to a plan. Pick what's on this week; more than three things gets a page on putting one first. What matters most (a deadline asks when it's due), when you get things done and how many a day; anything with a time (an appointment, family dinner, workouts at a set hour) asks about reminders. Its `{flow}` event is answered with the week on a timeline by day (what matters most first, never more a day than the pace, fixed times kept, Edit order to drag), a checklist to keep, and the rows in her tasks and reminders tables (the app's schema) (`weekReply` in site/lib/yl/starter-flows.mjs; the site chat sends it with no model turn).
- **`study-quiz`**, the study buddy's topic to a quiz. Pick a topic (how vaccines work, how a ball flies, how money grows) and how much you know; the basics skip the first page. A short lesson, one idea and one picture a page, then one quiz question: a miss gets a page on why, with its picture; a right answer goes straight on. Then when to quiz you again. Its `{flow}` event is answered with a `calc` to play with for the topic (the half-life of the mRNA, the throw's angle, the rate and the years), and the lesson kept as his Learn a topic keeps one: the deck with the score, three cards in his review table due when you said, the quiz in his sessions (the app's schema) (`studyReply` in site/lib/yl/starter-flows.mjs; the site chat sends it with no model turn).

To tailor one to a person, the agent sends a variant with only what changes (section 9), or, for new branches, the whole flow inline with its own wording, keeping the ids and edges so the answers still line up.

### My flows | on main, in the next build (YUI-238)

Every saved flow in one list, in the agent's drawer. The starters come with every Yui and stay as they are. A variant an agent sends (section 9) lands under the flow it starts from, and a variant of that variant lands under it, up to five deep. Each row shows its title, how many steps its chart has, and `Starter` or `from <the flow it starts from>`.

![My flows in the app: ten starters, Restaurant intake nested under Client website intake](/demo/myflows-app-list.webp) ![The Remove confirm for Restaurant intake](/demo/myflows-app-confirm.webp)

- **Tap a row** to run it on the stage. A flow whose base is gone says so and cannot run; it stays listed so it can be removed.
- **Swipe a row, or hold it, to Remove.** A starter has no Remove: it ships in the app and stays.
- **Remove always asks first.** A variant alone says "Your agent can send it again any time." One with variants of its own says they go with it ("Its variant goes with it", or "Its 2 variants go with it"), and a run already started keeps going.
- **Removing is not deleting for good.** The agent can send the variant again by name and it comes back. A variant that shipped with the hub is hidden, not erased.

Try it on the web: [/playground?demo=myflows](/playground?demo=myflows) is the same list, with Run and Path tabs next to it. Hold Restaurant intake to see the base confirm, hold Brunch intake to remove a variant alone.

## 9. Variants

An agent often wants a saved flow with a few things changed: the website intake, but for a restaurant. It does not copy the whole chart. It names the flow it starts from, gives the new one a name with `as=`, and says only what changes, up to `end`:

```
flow website-intake as=restaurant-intake
%% kind: choose "What kind of place?" "Dine in"|Takeout|Both
drop today products pay pages
add menu after goal: pick "What goes on the menu page?" Breakfast|Lunch|Dinner|Drinks +other
end
```

Three kinds of line, applied in order to the base flow's graph:

- **`drop a b`** takes steps out. Edges into a dropped step go where it went (its default edge, else its first), keeping their conditions; its own edges go with it. Drop the start and its next step starts.
- **`%% id: <step>`** rewords a step: the same comment a flow uses, so the new line replaces the step on that node. The node keeps its place and its edges, so conditions that test other answers still hold. A `%%` line that is not a step is a comment.
- **`add new after id: <step>`** puts a new step in after a step. The new step takes over every edge out of `id` (conditions included), and `id` goes straight to it. `new` must be an id the flow does not have yet.

A change that names a step the base does not have (or adds one it already has) is skipped, so a variant keeps working when its base changes. A step line that cannot be a step, or any other line, is an error line and the rest of the variant still reads. `review=off`, `submit=` and `+inline` work on the head as on any flow. With no `end` the variant closes at the end of the reply.

**Why this and not a copy.** A variant is a few lines, so an agent can write one in a reply, a person can read what changed, and fixing the base fixes every variant made from it. A copy would be the whole chart, and the two would drift. Edits by line are also how people already talk about it ("drop the pages question, ask about the menu after the first action"). Branching changes, a new edge or condition, are not variant lines: an agent that needs them sends the whole flow inline, as section 8 says.

**Names.** `as` is the variant's name and title at once, matched like any saved flow's (letters and digits, case and spacing aside): `as=restaurant-intake` and `as="Restaurant intake"` are the same flow, titled "Restaurant intake". It cannot take a starter flow's name.

**What the parser gives.** The head is an add as usual, the base's name in `title` and the new name in `as`. The variant's `end` (or the end of the reply) gives one patch on it with the changes in order and the lines as sent:

```
{op: "patch", target: "n1", props: {changes: [
  {op: "step", id: "kind", preset: "choose", props: {...}},
  {op: "drop", id: "today"}, {op: "drop", id: "products"}, ...,
  {op: "add", id: "menu", after: "goal", preset: "pick", props: {...}}],
  source: "%% kind: choose ...\ndrop today products pay pages\n..."}}
```

`flowVariant(base, changes)` in every hub parser gives the graph the phone runs; `flowPath`, `flowNext` and `flowEvent` then work on it unchanged, and the event is an ordinary `{flow}` event.

**On the phone.** Sending a variant runs it and keeps it in My flows under its name, as the base's name plus its changes, not a copy of the graph, listed under its base with the agent that made it. `flow restaurant-intake` runs it again later. Sending a variant with the same name again replaces it: that is how an agent edits its own. A variant can start from another variant; the phone follows the names back, at most five deep, and a name that loops or goes missing is "no saved flow". A run keeps the graph it started with (section 5).

**In the library.** A variant is listed under its base on /developers/library and in /library.json, with `base` naming the flow it starts from and `yl` the lines to send. Search finds it like any flow.

Conformance: `spec/conformance/36-flow-variant.json`, run by the JavaScript, Python, Kotlin and Rust runners. Its `variant` vectors give the base as flow lines and pin the graph after the changes and the route through it.

## 10. Next

- The app runs flows: the Swift parser takes `26-flow.json` off its not-yet list, and a native runtime keeps runs as section 5 says.
- My flows: the person's own saved flows and the variants agents made, listed under their base, duplicated, edited with the agent ("add a question about brand colors after the pages" is a variant line), shared. The playground mocks it: `/playground?demo=myflows`.
- FLOW-2: a public library of flows on yuigui.com that people browse and agents can search.
