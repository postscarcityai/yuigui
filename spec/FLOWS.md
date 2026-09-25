# Flows

A flow is a saved series of Yui screens that any agent can run: a client website intake, scoping a project, a workout check-in. It is written in Mermaid, so the same text is a chart anyone can read (GitHub draws it as is) and a script the phone runs, one screen at a time, with branches.

Plan mode (YL.md, section 4, plan) is the first flow, and it is linear. A flow is plan mode with a map: Next follows the edge your answers pick.

Status: step 1 (FLOW-1). The spec, the JavaScript parser and the web runtime in the playground. The app runs flows in a later step; until then an older app shows the flow line as unknown and skips it.

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

A step is one of `page`, `ask`, `choose`, `pick`, `slide`, `form`, `mic`, `camera`, the same as a plan's members, and means the same: a page is a step to read (not answered, not keyed), a question sends what it would send on its own (`choose` its choice, `pick` a list, `slide` a number, `form` an object, `mic` a transcript, `camera` a photo). Any other preset in a step comment is an error line and the node gets no step. A comment that is not a step (`%% ask Chris first`) is just a comment.

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

Flows do not loop: an edge back to a step already on the path ends the flow there.

## 4. Running it

The runtime is plan mode with branches (YL.md, section 4, plan), and everything plan mode promises holds: one step at a time on the stage, `ask` and `choose` move on by themselves after a tap, pages are read and Next moves on, Back and Next at the bottom.

- **Progress.** "Step 4 of 9": the steps so far on the path, this one, and what lies ahead. Ahead follows the answers already given and, where a branch is still open, the edge that earlier answers already decide, else the default one. The count changes when an answer picks a branch, and that is fine: it is an honest guess.
- **Back** walks the path taken, not the source order. From a step on the Shop branch, Back goes to the step before it on that branch.
- **Changing an answer** that picks another branch drops the steps of the old branch from the path. Their answers are kept on the phone in case the person switches back, but they are never sent.
- **The review** lists only the answered questions on the path, in path order, each with Edit. Edit opens that step; once the path from the start has every answer again, Next goes straight back to the review. If the new answer opened a branch with questions not answered yet, Next goes through them first.
- **Folding back** is the same as a plan's: the flow's spot in the chat becomes a summary chip (its title, pages and answers on the path) that reopens it, and the answers land as the person's message, one `<question>: <answer>` line per answered question on the path.

## 5. The event

A flow sends one event, when the person submits the review:

```
{"id":"intake","preset":"flow","flow":{"kind":"Shop","products":120,"pay":["Stripe"],"goal":"Buy"},"path":["hi","biz","kind","products","pay","goal"]}
```

`flow` has the same shape as a plan's `{plan}`: answers keyed by step id, only for questions on the path. `path` is every step on the path in order, pages included, so the agent knows which branch the person took. Steps send no events of their own. Submitting again after Edit answers sends a new `{flow}`.

## 6. What the parser gives

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

Conformance: `spec/conformance/js-26-flow.json`, run by the JavaScript runner only until the other parsers carry flows. Its `route` vectors pin the runtime too: for a set of answers, the path, the first open question and the event.

## 7. Starter flows

Every Yui has five: three from real work, the first run, and connecting your tools. Each is under a dozen steps with at least one branch, and each runs in the playground: pick it under "Decks, plans, flows and walkthroughs".

- **`website-intake`**, client website intake. Sit with a client and get everything out of them: the business, what we are building (a redesign asks about the site today, a shop about products and payments, a landing page skips the page list), the first action, brand, budget (15k and up offers a call).
- **`self-scope`**, scope a project yourself. What done looks like, the kind of work (software asks where it runs), how big it feels (months or no idea get a page on cutting it down and ask for the smallest version), who does it (hiring out asks the budget), timing, the biggest worry.
- **`workout-checkin`**, before a session. Sleep and energy (a bad night or low energy gets an easy-day page), anything sore (sore or does it hurt; a real hurt gets a rest-it page), today's session (a rest day skips the time), a note for the coach.
- **`onboarding`**, meet Yui (YUI-38). Your name, how much you know about AI (brand new gets a page on what an agent is, 4 and up asks if you run one), what you want help with, in taps and then your own words. Suggests two starter agents from those answers, lets you pick, and ends on how to connect them today. The whole interview: [Onboarding](ONBOARDING.md).
- **`connect`**, connect your tools (YUI-39). Pick Google Calendar, Gmail or HubSpot; each one picked gets its own consent step with its scopes in plain words, Allow or Not now; then what the agent sees, and what comes next: a sign-in button per tool allowed, or nothing connected. The sign-in buttons come from the agent after the event, never from the flow: [Connectors](CONNECTORS.md).

To tailor one to a person, the agent sends it inline with its own wording and keeps the ids and edges, so the answers still line up.

## 8. Next

- The app runs flows (native runtime, the Swift parser and the other parsers carry the vectors).
- My flows: the person's own saved flows, listed, duplicated, edited with the agent ("add a question about brand colors after the pages"), shared.
- FLOW-2: a public library of flows on yuigui.com that people browse and agents can search.
