---
date: 2026-10-02
tag: why
title: How the web app got fast
dek: A repeat visit to Yui on the web went from a 2 second wait to your last chat in under half a second. What we cut, what we kept on your device, and what still waits on the network.
---

```compare
before: /progress/site170-repeat-before-390-light.webp | A first visit: grey bubbles while it loads
after: /progress/site170-repeat-after-390-light.webp | A repeat visit: your last chat, already there
```

Chris, Oct 2: "Is the web app fast?" So we timed it the way a bad day feels. Phone width, a processor four times slower than a laptop, slow 4G, the page built for real. Same test every time, so a number means the same thing before and after.

A repeat visit used to show its first real message after 2057 ms. Now it takes 452 ms. Three small jobs got us there.

## Carry less

```shot
/progress/site169-speed-390-light.webp | Light, phone width: two bar charts. Script on the page after it settles, 466 KB before and 359 KB after. A repeat visit's first chat row, 2057 ms before and 452 ms after.
/progress/site169-speed-390-dark.webp | Dark, phone width: the same two bar charts.
```

The page was shipping 466 KB of script. 75 KB of it was math drawing that the chat loaded even when nobody had written a formula. Every settings sheet, the music kit, the games and the diagrams rode along too.

Now each piece loads the first time it is used, and the browser fetches them quietly when it is idle, so a tap still answers at once. The page settles at 359 KB. Nothing about the app changed.

## Have the last chat ready

```shot
/progress/yui273-web-repeat-visit-light.webp | Light: bars before and after. A repeat visit's first real row, 2057 to 452 ms. A first visit's first real row, 4025 to 4020 ms.
/progress/yui273-web-repeat-visit-dark.webp | Dark: the same bars.
```

The page used to wait on four trips to the server, one after another, before it drew a single row. Now it keeps your newest 40 messages of each chat you opened, on your own device, tied to your account. Next visit it draws those first and swaps in the live ones a moment later, in one pass, with no row showing twice.

Sign out wipes it. A tab that finds you signed out wipes it. Nothing is kept for anyone else.

## Stop waiting in line

```shot
/progress/yui274-web-cold-reads-light.webp | Light: bars before and after. A first visit's first real row, 4024 to 3013 ms.
/progress/yui274-web-cold-reads-dark.webp | Dark: the same bars.
```

A first visit has nothing kept, so it still has to ask. What we could change was the order. The four trips used to run one after another. Now they leave together, so a first visit drew its first row at 3013 ms instead of 4024 ms.

## What did not move

```shot
/progress/yui272-web-first-screen-light.webp | Light: bars before and after. Script before the first row 243 to 237 KB, first real row 2519 to 2517 ms, a screen that reads as a chat 2519 to 1005 ms.
```

The first real row on a first visit still waits on the network. About 100 KB of the page is the framework itself, and we cannot split that. On this connection every KB costs about 5 ms, so a lighter page buys milliseconds, not seconds. The profile says the same thing: the processor sat idle for 1.8 s of 2.5 s, waiting for bytes.

What we did change is what you see while you wait. The grey bubbles on the left of the first picture show up at about 1 s, so the page reads as a chat before it is one.

Next up, in order: the real host already sends smaller files than our test did, and a bare /web address could start its reads sooner by remembering your last agent.

```try
/web | Open the web app
/progress | See the speed log
```
