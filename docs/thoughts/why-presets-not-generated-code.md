---
date: 2026-09-25
tag: why
title: Why presets, not generated code
dek: Your agent could write a screen as code. In Yui it sends one short line instead, and the app draws a native screen from a fixed set of presets. Here is why.
---

```clip
/demo/clips/timer-9x16.mp4 | One line from your agent. A Tabata timer on your phone.
```

That timer is one line: `timer 40/20x8 Tabata`. Nine tokens. The app knows what a timer is, so the agent only says which one.

The other way is to let the model write the screen as code, send it over and run it. It is a fun demo. We said no, for four reasons.

```compare
before: struct TabataView: View {\n  @State var round = 1\n  @State var left = 40\n  @State var working = true\n  let timer = Timer.publish(every: 1, on: .main, in: .common).autoconnect()\n  var body: some View {\n    VStack(spacing: 16) {\n      Text("Tabata").font(.headline)\n      Text("\(left)").font(.system(size: 72, weight: .bold))\n      Text("Round \(round)/8")\n    }\n    .onReceive(timer) { _ in ... }\n  }\n} | Generated code, shortened. Every reply, every time.
after: timer 40/20x8 Tabata | A preset. One line, drawn native.
```

## 1. It has to pass the App Store

Apple rejects apps that download and run new code (guideline 2.5.2). An app that draws data against a fixed set of native screens is the pattern it accepts. Yui wants to be one app on the App Store that any agent can talk through. Code from a model would end that before it starts.

## 2. It is fast and cheap

No code to write, no build, nothing to compile on your phone. A screen costs a line and shows up at once. That also makes it cheap enough for small and local models, not only the big ones.

Measured across ten screens, Yui Lines is 1.6 times smaller than lean JSON and 3.9 times smaller than a component tree. The timer alone is 9 tokens against 25 and 75.

```phone
caption: Tap it. This is the same line, drawn live on this page.
timer 40/20x8 Tabata
```

## 3. The good taste lives in the app

Spacing, tap sizes, dark mode, Dynamic Type and haptics are built into each preset once. An agent cannot make a bad layout, because it never makes a layout at all. It picks one and fills it in.

## 4. One line, many places

The same line draws in the app, on this site and in the playground. `ask` and `choose` even fall back to plain buttons in Telegram. A block of Swift only runs in one place.

## What about the long tail?

Some screens will not fit a preset. For those there is `custom {json}`, an escape hatch. Every custom use is logged, and shapes that keep coming back get promoted to real presets. So the set grows from what agents actually send.

```try
/playground | Write a line, see the screen
/yl | Read the Yui Lines spec
```
