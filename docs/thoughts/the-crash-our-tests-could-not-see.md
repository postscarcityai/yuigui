---
date: 2026-09-28
tag: why
title: The crash our tests could not see
dek: Yui 0.5.0 crashed when you switched agents, then every time you opened it. Every test passed. Here is the one line that did it, why the tests missed it, and what we test now.
---

```compare
before: UserDefaults.standard.set(\n  Array(met).suffix(200),\n  forKey: "yuiHelloSeen"\n) | 0.5.0: crashes
after: UserDefaults.standard.set(\n  Array(met.sorted().suffix(200)),\n  forKey: "yuiHelloSeen"\n) | 0.5.1: fixed
```

Yui 0.5.0 went out last night. Its big idea: the first time you open an agent, it says hello and shows you what it can do. To play that hello only once, the app keeps a short list of the agents you have met.

```shot
/progress/yui167-hello-light.webp | Arnold's hello on the stage the first time you open him: a line about what he does and the questions to build your week.
```

Within an hour our first tester sent two crash reports from TestFlight. "I tried to switch agents and it crashed." Then: "now I can't open it again."

## One line

The list was saved with `suffix(200)`, to keep only the last 200. In Swift that gives back a slice of the list, not a new list. The phone's settings store only takes plain lists, words and numbers. Hand it a slice and the app stops on the spot.

So switching to a new agent crashed. And since Yui opens on the last agent you used, it met that agent again on launch, tried to save again, and crashed again. Every time.

The fix wraps the slice in a plain list. One line.

```shot
/progress/yui167-picker-dark.webp | The agent picker at the top of the stage: each crew agent with a line under its name. Switching here is what crashed 0.5.0.
```

## Why every test passed

Yui runs its tests on a demo account, so every run starts fresh and no test waits on a network. On that account the "agents you've met" list lives in memory and is never saved to the phone. The one line that crashed never ran in a test.

That is the part worth writing down. The tests were green because they tested a slightly different app from the one on your phone.

```phone
caption: The check every release now runs before it uploads.
list "Before every upload" "Sign in on a real account, not the demo" "Open, kill, open again" "Switch agents back and forth" "Everything saved is a plain list, word or number" +check
```

## What we test now

- The new test turns the demo shortcut off and saves to the phone's real settings store, the way your phone does. It crashed on the old line and passes on the new one.
- Every release now runs a pass on a real account before it uploads: open the app, kill it, open it again, and switch agents back and forth. That is exactly what our tester did.
- Anything the app saves has to be a plain list, word, number or date. We check the rest of the app for the same mistake as part of this fix.

Yui 0.5.1 carries the fix, and it is on its way to TestFlight now. If Yui crashed on you, update it and it opens again. Nothing you said to your agents was lost.

```try
/roadmap | See what's next
/changelog | Every build
```
