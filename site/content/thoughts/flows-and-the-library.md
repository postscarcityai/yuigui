---
date: 2026-09-26
tag: why
title: Flows and the library
dek: A flow is a saved series of screens that any agent can run by name. The library is where an agent looks one up by what it wants to do. Both shipped on the web today. Here is how they work, and what comes next.
---

```phone
caption: One line from an agent runs a whole client intake, one screen at a time.
say "Let's get your site brief. About ten questions."
flow website-intake +inline
```

Some jobs take more than one screen. A client intake asks about the business, then what you are building, then the budget. A shop needs questions a landing page does not.

Yui already had plan mode: pages to read, questions to answer, one Send at the end. A flow is plan mode with a map. Your answers pick the next screen.

## A flow is a chart

```shot
/thoughts/flows-and-the-library-chart.webp | The website intake as a chart on the library page. Your business leads to a diamond, What are we building?, which splits three ways: Redesign goes to The site today, Shop goes to How many products? and Payments, and the rest go straight to First action.
```

A flow is written in Mermaid, the same text GitHub draws as a chart. Each box holds one screen. Each arrow can hold a rule, like `kind=Shop` or `budget>=15`.

So one file is two things. A person reads it as a chart. The phone runs it as screens. Nobody keeps the two in step, because there is only one.

```try
/playground?demo=flow-saved | Run the intake in the playground
/developers/flows | Read the flows spec
```

## Any agent can run one

```phone
caption: The whole message an agent sends to start the intake.
flow website-intake
```

Every Yui comes with five saved flows: a client website intake, scoping a project yourself, a workout check-in, meeting Yui, and connecting your tools. An agent does not rebuild them. It sends the name.

When the person taps Send at the end, the agent gets one answer: every reply keyed by step, plus the path they took. It knows a shop owner from a redesign without asking twice.

## Agents look one up by intent

```shot
/thoughts/flows-and-the-library-api.webp | The library answering the search "client intake": one match, the website intake flow, with its purpose, the phrases it answers to and the one line that runs it.
```

An agent rarely knows a flow's name. It knows the job: "I need a client's website brief." So the library answers by intent.

Ask `/api/library?q=client+intake` and the intake comes back first, with the line that runs it, the chart and a link to try it. Agents on MCP get the same search as the `yui_library` tool. The channel guide every Yui agent reads now names the saved flows too.

People get the same search, drawn. Type what you need, see the screens and flows that fit, and run one.

```try
/developers/library | Search the library
/api/library?q=client+intake | See what an agent gets
```

## Next: the app runs them

```shot
/thoughts/flows-and-the-library-myflows.webp | The playground mock of My flows: your own Workout check-in on top, then the five starter flows, each with the agent it goes to, when it last ran, and a Run button.
/thoughts/flows-and-the-library-path.webp | The playground mock of one run's path: nine answered steps in order, the branch each answer picked, one step skipped, and buttons to see what Coach got or run it again.
```

This part is not shipped yet. Today flows run in the playground, and every parser in the hub reads them the same way. The iPhone app is next: it runs flows on the phone, keeps a run through a closed app, and sends the answers once.

After that comes My flows. Your saved flows in one list, a starter you can copy and change with your agent ("add a question about brand colors after the pages"), and a map of every run. The mocks above are how it looks today.

```try
/playground?demo=myflows | Tap the My flows mock
/roadmap | See where it sits on the roadmap
/yl | Read the Yui Lines spec
```
