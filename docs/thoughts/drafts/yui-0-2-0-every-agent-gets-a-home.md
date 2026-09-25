---
date: 2026-09-25
tag: release
title: "Yui 0.2.0: every agent gets a home"
dek: The first real release after a week of hourly builds. Each agent has a drawer now, agents can draw, full-screen answers read like a story, and screens update where they sit. Here is what to try.
---

```shot
/progress/yui54-dark-1-home.webp | An agent's drawer open in dark mode: Home, Review, Controls and About, the chat peeking out on the right
```

Yui 0.2.0 is on TestFlight as build 122. It is the first build since we stopped shipping every hour, so it carries a whole week of work in one go.

## Each agent gets a drawer

Drag right on the chat and the agent's drawer follows your finger. Home has your pinned screens and what is next for you. Review holds everything waiting on you, and each ask opens right there with its buttons. The agent can fill it too: a card in Review, a Backlog of what it is working on, and one-tap Shortcuts.

```shot
/progress/yui86-dark-2-home.webp | Home in dark mode: an ask under Next up for you, a Backlog with two items, then Shortcuts
/progress/yui54-light-2-review-open.webp | Review in light mode: one ask opened in place with its buttons
```

## Full-screen pages tell a story

A long answer on the full screen is now one idea per page, set big, with no card in the way and nothing cut off mid-sentence.

```shot
/progress/yui82-after-dark.webp | One idea on the whole screen in big type, a bar per page across the top
```

## Agents can draw

Ask for a picture of what changed and the agent sends a sketch: a window, a phone or a chat bubble, with lines struck out, highlighted or drawn as buttons.

```shot
/progress/yui84-phone-light.webp | A drawn phone: a Got it button struck out, an Install button highlighted
```

## Talk about a screen, and screens that stay current

An agent can keep the composer on one of its screens, so you type about the plan in front of you without going back to the chat. And a timer, a score or a status line now updates where it sits instead of arriving again as a new screen. Those quiet updates don't buzz your phone.

```shot
/progress/yui62-screen-2-composer.webp | Screen 2 with a plan on it and a composer that reads About screen 2
```

## Smaller things

- Everything waiting on you is one block: the question on top, the buttons under it.
- Anything your Yui can't draw yet shows as plain words or one Update chip, never raw lines.
- Settings ends with About this build: version, build, channel, commit and date. Tap it to copy for feedback.
- Test links install as Yui Dev, beside the TestFlight copy, so you always know which one you are in.

## What to try

This list is a real Yui screen. Tap the rows as you go.

```phone
caption: The 0.2.0 checklist, drawn from one line.
list "Try 0.2.0" "Drag right on a chat to open the agent's drawer" "Open Review and answer an ask in place" "Ask Yui to draw what changed" "Ask for a long answer and swipe the pages" "Type on a screen that says About screen 2" +check
```

Found something off? Use the feedback button in TestFlight. It lands on the board.

```try
/changelog | Every change in 0.2.0
/roadmap | What comes next
```
