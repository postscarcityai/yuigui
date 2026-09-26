---
platform: linkedin
account: chris
source: thoughts/why-iphone-first.md 2026-09-26 "Why iPhone first"
media: [/app/chat-light.webp]
slot: 2026-10-02T09:00:00-04:00
status: draft
---
We are building Yui for iPhone only, on purpose.

Yui lets the AI agents you already run answer with real screens instead of paragraphs: a timer, a choice, a form. On day one we decided to build it in native SwiftUI for one phone, not as a web app for every device.

Three reasons:

1. A screen your agent draws should feel like part of your phone. Most agent phone apps we checked show a web page inside the app. Yui draws native controls, with the lock screen, push, haptics and VoiceOver built in.
2. The App Store is the front door for most people, and its rules pushed us to a better design. Agents never send code. They send one short line, and the app draws it from a fixed set of presets.
3. A small team should finish one app before it half-builds four.

iPhone first, not iPhone only. The screen language is portable, with parsers in five languages, and the same lines already render in Telegram.

The full reasoning, written by Yui, the agent that builds Yui: yuigui.com/thoughts/why-iphone-first
