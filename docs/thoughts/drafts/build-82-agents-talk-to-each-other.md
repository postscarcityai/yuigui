---
date: 2026-09-25
tag: release
title: "Build 82: type / for commands, @ another agent, and a working row that tells you what is up"
dek: Slash commands, @mentions across agents, one calm working row, agents that say when they are not listening yet, and a sign-in sheet for Claude and ChatGPT. Here is what shipped and what to try.
---

```shot
/progress/yui44-mention-answer-light.webp | Asking Bravo from Alpha's thread: the answer lands here, in Bravo's own look
/progress/yui61-slash-filtered-dark.webp | Type / and the commands filter as you go
/progress/yui63-working-row-dark.webp | One working row: a word and the time, nothing else
```

Build 82 is on TestFlight. It is five small things that change how a thread feels. You can ask the agents around you, you can see what an agent is doing, and you always know if it can hear you.

## Type / for commands

Type a slash in the composer and a list of commands comes up. Keep typing and it narrows. Tap one and it fills in for you.

```shot
/progress/yui61-slash-light.webp | The command list, light
```

## @ another agent

In any thread, type @ and pick another of your agents. It gets your question with the thread around it. Its answer lands right there, in its own colors, with a way to open its own thread.

```shot
/progress/yui44-mention-popover-light.webp | Type @: your other agents, and who is online
/progress/yui44-mention-answer-light.webp | Bravo answers in Alpha's thread
```

This is step one. Group threads with several agents come next.

## One working row

Three dots plus a timer are gone. While an agent works you see one row: a working word and the seconds. Long jobs are fine. Leave and the answer still lands.

## Not listening yet

An agent can be paired and still not hear you, because its gateway has not restarted. Now it says so. The agent list reads Not listening yet. A message to it waits, with the one command that fixes it and a copy button. It goes the moment the gateway starts.

```compare
before: /progress/yui64-one-step-light.webp | One step left, right after pairing
after: /progress/yui64-waits-light.webp | A message that waits for the gateway
```

## Sign in from Claude and ChatGPT

The Claude and ChatGPT apps can add Yui by pasting one URL. You approve it in the app, on one sheet.

```shot
/progress/int19-allow.webp | The approval sheet
```

## What to try

This list is a real Yui screen. Tap the rows as you go.

```phone
caption: The build 82 checklist, drawn from one line.
list "Try build 82" "Type / in the composer and pick a command" "Type @ and ask another agent something" "Watch the working row on a long ask" "Pair a new agent and read Not listening yet" "Add Yui to Claude or ChatGPT and approve it" +check
```

Found something off? Use the feedback button in TestFlight. It lands on the board, and half of this release started there.

```try
/changelog | Every build, change by change
/progress | The ship log, with more shots
```
