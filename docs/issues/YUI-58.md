---
card: YUI-58
repo: postscarcityai/yui
title: "Yui for macOS, step 1: a native Mac target that builds and signs in"
labels: help wanted, area:app
---
We want a matching Mac app. Not Catalyst and not the iPhone app on a Mac: a native macOS target that shares the SwiftUI code. This issue is only the first step.

## Context

- The project is generated with xcodegen: `project.yml`. The Yui Lines Swift package is in `Packages/`.
- The app's sources: `Yui/Sources/`. Theme tokens: `Yui/Sources/Theme/`.
- The bundle id is already set up for iPhone and Mac under one app record, so accounts and threads carry over.

## The whole plan, in small pull requests

1. **This issue:** a macOS target in `project.yml` that builds, shares the sources, and signs in.
2. Thread and composer (a sidebar of agents plus the thread, Return sends).
3. Presets render. Phone-only ones (camera, Live Activity) say "open on your iPhone" instead of breaking.
4. Mac touches: Cmd-K to switch agents, drag files into the composer, windows for full-screen screens.

## Done when (step 1)

- `xcodegen` makes a project with a macOS app target, and it builds.
- Unit tests and the Yui Lines conformance tests run on macOS.
- iPhone-only code is fenced off with `#if os(iOS)`, not deleted.
- Screenshot of the Mac app signed in.

Signing, notarization and TestFlight for Mac stay with us. Never add keys or team ids to the pull request.
