---
date: 2026-09-24
title: Why Yui is open source, business docs included
tag: why
dek: Both repos are public under Apache-2.0, and so is the plan for making money. Here is why, and what it does and does not buy us.
---

# Why Yui is open source, business docs included

```shot
/progress/site22-business.webp | The Business page: the plan, the go-to-market plan and the beta list, all public
/progress/site15-spec-index.webp | Every spec, readable on the site
```

On September 24, 2026 we made both Yui repos public. The license is Apache-2.0. That covers the iPhone app, the Hermes plugin, the Yui Lines spec, this website and the business plan.

That last part surprises people. So this note explains the whole choice, including the part that is not code.

```shot
/progress/site23-privacy.webp | Even the Privacy page names every table Yui keeps
```

## What is public

Two repos, both on GitHub:

- [postscarcityai/yui](https://github.com/postscarcityai/yui) is the iPhone app and the Hermes plugin that connects an agent to it.
- [postscarcityai/yuigui](https://github.com/postscarcityai/yuigui) is the hub: the roadmap, the Yui Lines spec, the conformance tests, this site and the business docs.

Inside the hub you can read:

- **The spec.** Yui Lines is the tiny format an agent uses to draw a screen. One line per component, like `timer 40/20x8 Tabata`. The full grammar is in the open.
- **The conformance suite.** Twenty files of test vectors that every Yui Lines parser must pass. The JavaScript parser on this site and the Swift parser in the app both run against the same set.
- **The adapters plan.** How Yui should reach agents beyond Hermes: a channel plugin, a hosted connector, a model connector, an MCP server and a plain webhook. It is a plan, not a shipped feature. Work on it starts once the first version, the MVP, is done.
- **The business docs.** Who Yui is for, who else is building something close, how it might earn money and how we plan to find our first testers. They live at [/business](/business), rendered straight from the repo.
- **The ship log.** Every change that ships gets a dated entry on [/progress](/progress), with screenshots.

```phone
caption: The spec in one line. This screen is drawn live by the open JavaScript parser.
timer 40/20x8 Tabata
```

## Why the code is open

Yui brings no brain of its own. You bring the agent, and Yui gives it a screen to draw on. That means Yui sits between you and something you care about: your agent, its memory, the things you ask it.

You should be able to read what sits there. Open code lets you check what the app sends, where it goes and what it keeps. It lets you build it yourself instead of trusting a download.

It also helps the thing spread. A format for drawing screens only matters if more than one app and more than one agent speak it. A closed format asks everyone to wait on us. An open one lets someone write a parser in Python or Kotlin this weekend and check it against the same tests we use.

```shot
/progress/oss5-gallery.webp | The community gallery: screens anyone drew, each checked against the same spec
```

## Why the spec comes with tests

A spec on its own is a promise. A spec with a conformance suite is a promise you can check.

The rule is simple. A parser passes a test when it reads the input whole, and again one character at a time as if a model were typing it, and both give the expected result. If our own parsers ever disagree with the suite, that is our bug, and anyone can see it.

This matters most for people who want to build their own Yui renderer, or teach a different agent to speak Yui Lines. They do not need our permission or our help. They need the tests.

```shot
/progress/site15-yl-quickstart.webp | The Yui Lines quick start: copy a line, see the screen
```

## Why the business docs are open too

Most companies keep the plan private. We publish ours for three reasons.

**Trust.** Yui is free and open source for anyone who brings their own agent and keys. The plan says that core stays free forever, and that we charge only where we carry a real cost, like hosted models or image generation. Writing that in public makes it harder for us to quietly break it later.

**Feedback.** A plan that only its authors read has blind spots. Our competitor notes, pricing ideas and launch gates are all open to challenge. If we got something wrong, you can tell us, and point at the line.

**Honesty about where we stand.** The docs say what is not built yet. The adapters are a plan. The first outside testers have not been invited yet. The positioning notes even say that open source is not our edge on its own, because other agent apps are open too.

```shot
/progress/site15-home-band.webp | The edge is the screens: one line, a live phone, and the token counts
```

## What open source does not buy us

It would be easy to oversell this, so here are the limits.

- Open source is not a moat. Other agent apps are open too. What we think sets Yui apart is the screens: the agent draws a real, native one instead of sending a paragraph.
- Open does not mean finished. Yui is early. Some of what the docs describe is still on the board.
- Open does not mean anything goes. Secrets, keys, user data and other people's private details never go in the repos. Everything else is fair game.

## How the big apps fit in

The large companies will ship agent apps with rich screens. We cannot outspend them.

What we can do is be the one you can read. You can see how the app works, how the format works, what we plan to charge for and why. You can fork it if we get it wrong. That is a different kind of product, and we think some people want exactly that.

```shot
/progress/oss5-challenge-phone.webp | The open challenge on the community page: draw your best screen in 3 lines
```

## How to get involved

- Read the spec on [/yl](/yl), then try it in the [playground](/playground). Edit a line and watch the phone change.
- Write a Yui Lines parser in another language and run it against the conformance suite. That is one of the most useful things anyone could build right now.
- Read the [business docs](/business) and open an issue where you think we are wrong.
- Follow the [ship log](/progress) to see what lands each day.

Issues and pull requests are welcome on both repos.

```try
https://github.com/postscarcityai/yuigui | The hub repo
https://github.com/postscarcityai/yui | The app repo
```
