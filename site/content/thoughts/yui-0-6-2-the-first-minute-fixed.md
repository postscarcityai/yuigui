---
date: 2026-09-30
tag: release
title: "Yui 0.6.2: the first minute, fixed"
dek: A stranger opens Yui for the first time and gets to a plan without a wrong turn. Build 392 is on TestFlight.
---

```shot
/progress/ship062-first-question-dark.webp | Dark mode: Your first plan, step 1 of 5, asking what you are training for
/progress/ship062-nudge-dark.webp | Dark mode: the week is built, and one line asks about a nudge
/progress/ship062-add-agent-dark.webp | Dark mode: the drawer with Add an agent
```

Build 392 is on TestFlight. It is Yui 0.6.2, and it is about one thing: the first minute.

We ran the app as a stranger would. A fresh phone, a real new account, no demo data. It found snags. Here is what you see now, in order.

## Open lands on the first question

Tap Open on a crew card and you land on the first question. It stays on screen. Before, it showed for a second and then dropped back to a small chip.

## The week builds right after Send

Answer the five questions and tap Send. Your week is built then and there. You do not wait, and you do not ask for it again.

```shot
/progress/yui228-send-dark.webp | Dark mode: the last question, with one Send
/progress/yui228-built-week-dark.webp | Dark mode: the week, built right after Send
```

## The notifications ask comes once

After your plan, Yui asks if you want a nudge when your trainer checks in. One line. You say yes or not now. It does not ask again.

```shot
/progress/yui230-nudge-dark.webp | Dark mode: the nudge line after the first plan
/progress/yui230-nudge-light.webp | Light mode: the same line
```

## Add an agent is in the drawer

Open the drawer and Add an agent is there, with one command to copy. Every screen has a menu button and a chat button now, so the drawer is one tap away, even on the last screen of a plan.

```shot
/progress/yui229-after-drawer-dark.webp | Dark mode: the drawer with Add an agent
/progress/yui229-after-pairing-dark.webp | Dark mode: one pairing command to copy
```

## How we checked

The whole path ran on a fresh simulator with a throwaway account, in dark and light: pick a crew, Open, answer, Send, allow notifications, add an agent, pair it, delete the account. It passed.

Something broken or confusing? The feedback button in TestFlight goes straight onto the board.

```try
/mockups#release-062 | See each change with its screens
/progress | Every change, with the shots
```
