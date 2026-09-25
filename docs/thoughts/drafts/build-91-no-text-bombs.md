---
date: 2026-09-25
tag: release
title: "Build 91: no more text bombs, and a chat that never gets stuck small"
dek: Long answers fold into pages you swipe, the chat always comes back to full size, and a photo send lands where you can see it. Three fixes from TestFlight feedback. Here is what to try.
---

```compare
before: /progress/yui79-before-dark.webp | A long answer, before: one wall of text
after: /progress/yui79-after-dark.webp | Build 91: the first lines and Read as pages
```

Build 91 is on TestFlight. It is a fix release. All three fixes started as feedback from the TestFlight button, and one of them was a blocker.

## No text bombs

"The whole reason of this app is I don't want these text bombs." Fair. A long agent answer now folds to its first lines and a Read as pages button. Tap it and the whole thing opens as pages you swipe through, one idea per page. Agents are told to keep chat text short too, and reports from the board come as one line and a card.

```shot
/progress/yui79-pages-dark.webp | The long answer as pages, dark
/progress/yui79-pages-middle-light.webp | Swiping through the middle page, light
```

## The chat never gets stuck small

When a screen opened, the chat stepped back: a little smaller, with a rounded border. Sometimes it stayed that way after the screen was gone, and there was no way out. Now the chat only steps back while a screen is really up. Switch agents, reload, close the screen: it comes back full size. And if it ever looks stepped back, one tap on it brings it home.

```shot
/progress/yui80-full-size-light.webp | Back from a screen: the chat at full size
/progress/yui80-back-in-chat-dark.webp | Dark, after a trip to the agents sheet
```

## A photo lands where you can see it

Send a photo with the keyboard up and the thread used to stop short of it. Now it rests on the newest message.

```shot
/progress/yui74-photo-sent-light.webp | A photo just sent, at the bottom of the thread
```

## What to try

This list is a real Yui screen. Tap the rows as you go.

```phone
caption: The build 91 checklist, drawn from one line.
list "Try build 91" "Ask for something long and tap Read as pages" "Open a screen, switch agent, come back: the chat is full size" "Send a photo with the keyboard up: the thread rests on it" +check
```

Found something off? Use the feedback button in TestFlight. It lands on the board, and this whole release started there.

```try
/changelog | Every build, change by change
/progress | The ship log, with more shots
```
