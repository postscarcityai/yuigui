---
date: 2026-09-26
tag: why
title: Why iPhone first
dek: Yui runs on one platform today, on purpose. A screen your agent draws should feel like part of the phone it lands on, and one phone done well beats four done halfway. Here is the reasoning, and what we have for everyone else.
---

```shot
/progress/yui30-lock.webp | A Tabata timer an agent started, still counting on the iPhone lock screen
/app/chat-light.webp | An agent answers a Tabata request with a live interval timer and Yes or No buttons
```

Yui is an iPhone app, and only an iPhone app, for now. People ask why not the web, or Android, or all of them at once. The short answer: a screen your agent draws should feel like part of your phone. That takes one platform, done properly.

We decided this on the first day of the build, Sep 23, and wrote the reasons down on the [roadmap](/roadmap). Here they are.

## 1. Native, not a web page in a frame

Most of the agent phone apps we [checked](/business/biz-1-competitors) draw the agent's screen as a web page inside the app. Yui draws real SwiftUI. Apple's navigation, sheets, haptics, Dynamic Type, VoiceOver, light and dark come with every preset. The agent never writes any of that. It sends a line, and the phone does the rest.

```phone
caption: Two lines from an agent. Drawn live on this page, native on the phone.
choose "Client call, Thursday" "3:00 pm"|"4:00 pm" +other
ask "Send the invite now?" "Yes, send"|"Not yet"
```

## 2. The best parts of a phone are not in a browser

A timer your agent starts keeps counting on the lock screen. When your agent answers while the app is closed, you get a push. You hold to talk, and let go to send. None of that works well from a browser tab.

Next, and [designed in the open](/thoughts/designed-in-the-open) before any app code: widgets and Siri, Apple's on-device model for quick replies that never leave the phone, and a key vault in the Keychain. Each one has a spec and a mock you can tap.

```shot
/progress/talk-waveform-dark.webp | Hold to talk: a voice note with its waveform, under the timer and buttons the agent sent
```

## 3. The App Store is the front door

Most people get apps from the App Store, not a terminal. Apple rejects apps that download and run new code (guideline 2.5.2). So Yui never runs code from an agent. It draws data against a fixed set of native presets, the pattern Apple accepts. That rule shaped the whole design, and it turned out cheaper and faster anyway. The long version is [Why presets, not generated code](/thoughts/why-presets-not-generated-code).

## 4. Small team, one app finished

Yui is built by a small crew of agents and one person who checks the work. One app we can finish beats four we cannot. Every change reaches a real iPhone, through TestFlight or a test build by link, usually the same day. What people say on those phones comes back as the next card on the [board](/board).

## Not on an iPhone?

```shot
/progress/int4-open-in-yui-dark.webp | Yui in Telegram: a question as buttons, and an Open in Yui button for the rest of the screen
```

Being iPhone only is the biggest gap we have, and we say so in the SWOT on [Where Yui stands](/developers/where-yui-stands). Here is what exists for everyone else:

- **Telegram:** the same lines have a Telegram renderer. Questions become buttons, and a timer or a chart opens in a Mini App. The bot that runs it comes next.
- **The browser:** every preset draws on this site and in the playground today. A signed-in Yui in the browser is a spec, open for contributors.
- **Android and Mac:** Yui Lines is not tied to Swift. Five parsers (JavaScript, Swift, Python, Kotlin, Rust) pass one shared test suite, and the Kotlin one is ready for an Android app. The Mac app is a spec, also open for contributors.

So: iPhone first, not iPhone only. The language is portable on purpose. The iPhone is where we prove it.

```try
/start | Get the iPhone beta
/developers/telegram | Yui in Telegram
/developers/where-yui-stands | Where Yui stands
```
