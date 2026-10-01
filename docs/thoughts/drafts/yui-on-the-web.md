---
date: 2026-10-01
tag: release
title: "Yui is on the web"
dek: Everything the app does, in a browser. Sign in with Apple, your agents, the stage, the shelf, your keys, notifications. Open yuigui.com/web on a laptop or in Safari on your phone and pick up where you left off.
---

```shot
/progress/web250-thread-desktop-light.webp | Yui in a browser on a laptop: the drawer with chats on the left and a thread on the right
```

You asked for it, so here it is. Yui runs in the browser now, at [yuigui.com/web](https://www.yuigui.com/web). Sign in with Apple, the same account as the phone, and your agents are there with their own looks and their own threads.

The goal was one to one with the iPhone app. Where the web and the phone have to do a thing differently (no Face ID, no Keychain, no haptics), the map says how, row by row, in the open: [the parity map](https://github.com/postscarcityai/yuigui/blob/main/docs/specs/web-parity.md).

## The same conversation, on both

A thread is the same rows on the phone and in the browser. Ask on the laptop, read the answer on the phone. A draft you half typed follows you, and reading on one clears the dot on the other.

```shot
/progress/web250-thread-390-light.webp | The same thread in Safari at phone width: the answer as a screen, the composer under it
/progress/web250-thread-390-dark.webp | The same thread in dark mode at phone width
```

## It feels like the app

Answers play on the full stage, the picture behind them listens to your voice and the beat, pages swipe (or take the arrow keys), and the shelf keeps the screens you saved. Hold the mic or tap it for hands-free. Photos shrink to 2048 px like the app's. A page that keeps talking sends what you type there to the agent, tagged with the page.

```shot
/progress/web250-crew-pick-390-light.webp | The first run at phone width: pick your crew
```

## Yours to restyle

Ask any agent to restyle Yui and the card shows your look beside the new one. Use it, or keep yours. Undo is one tap.

```shot
/progress/web250-restyle-offer-390-light.webp | The restyle card in the thread: Now on the left, Autumn on the right, Use autumn and Keep mine
```

## Your keys stay off the page

A key you add on the web is sealed to the hosted connector in the page and put on the relay, then forgotten. The browser keeps the last four. Face ID has no web twin, so every add, replace and grant asks first in Yui's own sheet.

## Notifications and install

Web Push for the same replies the phone gets, with a mute per agent. A click opens that agent's thread. Add Yui to your Dock or your home screen and it opens like an app.

## How we know it works

There is a test suite for it now: a real browser, the demo account, phone width and laptop width, light and dark, on every pull request. No sign in, no network, no secrets. It lives in `site/e2e/web/`, and CI runs it on every change.

## What is not here

Haptics, widgets, Live Activities and the on-device model stay on the iPhone. The web says so in a line and links to the app, never a broken block.

Try it: [yuigui.com/web](https://www.yuigui.com/web). Tell us what felt off with the TestFlight feedback button, or open an issue.
