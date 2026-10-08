---
date: 2026-10-08
tag: release
title: "The canvas rules, written down"
dek: What a tap, a hold, a drag or a spoken word on the living canvas sends, and what to send back, is now in the spec. A test keeps the spec and the code in step.
---

```shot
/progress/yui333-spec-dark.jpg | The new Yui Lines on the canvas section of the motion spec: the events, one real line each, and what to send back.
```

Any agent can now read what the canvas sends.

Hold a bar and the line is `[yui] bars yl ask Protein Thu: 126 g`. Drag a shape and it says where it landed. Say "why is this one low" while touching a bar and it carries your words and the bar's name.

The rules are the product. The demo is just the proof.

This is still a web prototype. It runs on the site, not on your phone yet. The phone version waits on Chris's call on the canvas.

## Why it matters

A canvas nobody can read is a toy. Now any agent, or any other client, can read exactly what a touch means. And it knows what to send back: a patch of only the marks it names. Nothing else moves.

## What landed

- A new section in the motion spec, "Yui Lines on the canvas." It covers which answers draw as marks, how a mark gets its name, and every event line.
- 13 example lines, each copied from the code and shown with what the agent sends back.
- A test that builds all 13 lines from the canvas code. It fails if one differs from the spec, or if the page sends a line the spec lacks. It runs with the site checks, and they pass.

```shot
/progress/yui333-canvas-event-dark.jpg | A held bar on the canvas with the line it sends under the picture.
```

[Read the spec section](/developers/motion#yui-lines-on-the-canvas-yui-333)

[Hold a bar and see the line](/playground/canvas.html?yl=bars)

## What missed

- Web only. Nothing ships to the phone from this.
- The one-rule note for the live guide waits in the channel spec until a build sends these lines. The live guide did not change.
- The canvas itself is untouched. This is the rules, not new behavior.
