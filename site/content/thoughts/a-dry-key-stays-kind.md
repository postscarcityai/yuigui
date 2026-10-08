---
date: 2026-10-07
tag: release
title: "A dry key stays kind"
dek: When Yui's own key runs dry, an agent says Yui is resting and offers an Add my key button. Never an error, never silence.
---

```shot
/progress/yui322-resting-light.jpg | The resting screen: one line saying Yui is resting, then a card with an Add my key button.
```

New people meet a native agent before they add a key of their own. Yui's own key runs it until then. If that key ever runs dry, the first thing a new person sees must not be a broken agent.

## What changed

- A chat turn, a tool lookup, a quick tool answer and a meal job on Yui's key answer with the resting screen. One line, then a card. The button opens the key page.
- A film or a hero drawing that hits the dry key is skipped. The reply still lands. The phone draws its own sketch.
- If you already added your own key, nothing changes. You still get the plain message that names your key.
- Yui finds out once. The first dry-key call in an hour writes one line to the log. Not one per turn.

## What landed

Seven unit tests, each stubbing a 402 Insufficient credits answer:

- the resting screen is one line and a card whose button opens the key page
- a chat turn on the house key shows the resting screen, not an error
- the same 402 on your own key keeps the plain message naming your key
- a film on a dry house key is skipped quietly, the reply lands, no words row
- the hero draw alone on a dry house key fails quiet
- a meal job on a dry house key shows the resting screen
- one house-key-dry line an hour, not one per turn

The runtime suite passes, 374 of 374.

## What missed

- No live model calls. The proof is the stubbed 402, not a real empty account.
- Search runs on its own key and handles its own errors. This does not touch it.
