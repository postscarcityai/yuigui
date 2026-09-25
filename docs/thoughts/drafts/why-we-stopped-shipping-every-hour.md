---
date: 2026-09-25
tag: why
title: Why we stopped shipping every hour
dek: In three days Yui went from its first build to build 96, with five uploads on the last day alone. Then Apple started turning builds away. The next build is one real release, 0.2.0. Here is why that is the better way anyway.
---

```compare
before: Build 64\nBuild 74\nBuild 82\nBuild 91\nBuild 96\nfive uploads, one day | Before: a build every time a fix landed
after: 0.2.0\none release, when it is whole | After: one build that tells one story
```

Yui's first TestFlight build went out on Wednesday. By Friday afternoon we were on build 96. Every fix went out the moment it landed, often within the hour. It felt great. Feedback came in from the TestFlight button, a fix went in, a new build went out, and the person who asked saw it that day.

Then Apple said no. After enough uploads in one day, App Store Connect stops taking builds. Nothing broke, but the fast loop hit a wall.

```shot
/progress/site3-changelog.webp | The changelog on yuigui.com: one block per build, most of them from the same day
```

## A wall we needed

Looking at the changelog, the limit was pointing at something real. Five builds in a day is five times asking a tester to update, and five small stories nobody can hold in their head. A tester opening build 91 and then build 96 sees a scattered set of fixes, not an app that got better.

So TestFlight is paused. Crash fixes and lost data are the only exceptions. Everything else waits on main for 0.2.0: full-screen pages that tell a story, agents that can draw a sketch, a chat you can have with a screen, and the drawer as each agent's home.

```shot
/progress/yui54-dark-1-home.webp | An agent's drawer open in dark mode, the chat peeking out on the right
```

## Speed still happens, just earlier

Nothing slows down on the work itself. Test links still put a build on one phone without TestFlight, so a fix can be checked the same day. What changes is the moment a build goes to everyone: when the release is whole, not when the last commit landed.

The fast loop was right for week one. It got Yui from a pitch to a real app in three days. Week two is about making that app feel like one thing.

```try
/changelog | See every build so far
/roadmap | What goes into 0.2.0
```
