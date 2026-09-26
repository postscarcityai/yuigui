---
date: 2026-09-26
tag: why
title: Designed in the open
dek: A new Yui feature starts as a spec and a mock you can tap on this site, before any app code. Today five of them went up. Here is how that works, and the rules they share.
---

```phone
caption: Every design starts here. Spec first, a mock you can tap, app code last.
say "New idea? It gets a spec and a mock before the app changes."
card "Five designs, one day" "A starter agent, widgets and Siri, the model on the phone, a key vault, a lesson as one deck."
```

Most apps show you a feature when it ships. By then the choices are made. Yui does it the other way round.

A feature starts as a spec page under /developers: what it is, where it runs, what it costs, what it must never do. Next to it goes a mock in the playground, drawn with the same pieces the app uses. You can tap it today. The app code comes after, once the design holds up.

That order is cheap to change. A mock takes an afternoon. A shipped screen takes a TestFlight build and a week of feedback. So the arguing happens where it costs least.

## A starter agent

```shot
/thoughts/designed-in-the-open-starter.webp | The playground mock of Yui's first launch: an empty agent list, then Yui asking who you want first, with Coach, Basil, Penny and Quill as buttons.
```

Download Yui today and your agent list is empty, because every agent so far runs on its owner's own computer. The starter agent fixes that. Pick Coach, Basil, Penny or Quill on first launch and it answers right away. Nothing to install.

```try
/developers/starter | Read the starter spec
/playground?demo=starter | Tap the mock
```

## Widgets and Siri

```shot
/thoughts/designed-in-the-open-widgets.webp | The playground mock of an iPhone home screen with three Yui widgets from Coach: a stretch timer, a weight tile with a trend line, and today's checklist.
```

A widget is a saved screen, pinned to your home screen or lock screen. The agent keeps it fresh with the same small patches it already sends. No new words for agents to learn. You pin it, not the agent.

```try
/developers/widgets | Read the widgets spec
/playground?demo=widgets | Tap the mock
```

## The model on the phone

```shot
/thoughts/designed-in-the-open-on-device.webp | The playground mock of a chat with Coach. Under Coach's question sit three reply chips marked "on this phone": Rest day, Light 3k and Why?
```

Newer iPhones carry a small language model of their own. Yui gives it four small jobs: suggest a reply, send a group ask to the right agent, sum up a reply for its notification, and draft a screen when you are offline.

The rule: it never answers as an agent, and nothing it reads leaves the phone.

```try
/developers/on-device | Read the on-device spec
/playground?demo=on-device | Tap the mock
```

## The key vault

```shot
/thoughts/designed-in-the-open-vault.webp | The playground mock of Settings, Keys: two saved keys with their monthly spend bars, an Add a key button, and the line "Your keys stay on this iPhone. Agents ask to use one; they never see it."
```

Some things an agent does cost money at someone else's company, like an image or a model call. The vault keeps your keys on your iPhone. You decide which agent may use which key, with a monthly cap.

The rule behind it is older than the vault: an agent never asks for a password or a key, in a form or in chat. A key only goes in through Settings, and the agent never sees it.

```try
/developers/vault | Read the vault spec
/playground?demo=vault | Tap the mock
```

## A lesson as one deck

```shot
/thoughts/designed-in-the-open-lesson.webp | The playground mock of a lesson on compound interest as one swipeable deck. Page one shows $100 growing by 10% to $110, with six page dots below.
```

This one came from a tester: a lesson in many loose cards felt scattered. The fix went up as a mock first. Now a lesson is one deck you swipe, with a diagram, a formula, a chart and a calculator as its pages. It reaches the app with the next build.

```try
/playground?demo=lesson-one-screen | Swipe the lesson
```

## Pick one up

Every design here is open. The spec says what done looks like, and the mock shows it. If you run an agent, it can take one and send a pull request.

```try
/contribute | Pick up a design
```
