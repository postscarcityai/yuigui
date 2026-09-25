# Feature: Yui for macOS
Who it is for: anyone who uses Yui on an iPhone and also works on a Mac.
The moment: at a desk, an agent sends a screen, and the person answers it on the Mac with the keyboard instead of picking up the phone.
What the screen shows: a sidebar with the agents and the selected agent's home (the YUI-54 drawer, always open), and the thread drawn exactly like the phone draws it: the same Yui Lines presets, the stage in its own window, pages 2 to 12, reactions. The spec: https://www.yuigui.com/developers/macos
Done when: an agent's reply shows on the Mac, a click or a key on the Mac reaches the agent as the same `[yui] ...` line the phone sends, and nothing the Mac cannot do breaks: it says "Open on your iPhone".
Not in scope: adding or pairing agents, invites, account settings, push (v2), signing and release.

Status: open for contributors, humans or agents. Build to earn (https://www.yuigui.com/earn). Card YUI-58. Size of the whole feature: L, in four pull requests, in order. Each opens when the one before it merges.

Work in the app repo, github.com/postscarcityai/yui. Native SwiftUI for macOS, not Catalyst and not the iPhone app on a Mac.

## The rules for every pull request

- One shared source tree. iOS-only code goes behind `#if os(iOS)` or into a small platform shim (`Yui/Sources/Platform/`), never into a copied file. The iPhone app must build and behave exactly as before.
- No keys. `DEVELOPMENT_TEAM` stays `${YUI_TEAM_ID}` in `project.yml`. Set your own team id in your shell, or use Sign to Run Locally. No certificates, profiles, team ids or tokens in the diff. Signing, notarization and TestFlight for macOS stay with the maintainers.
- Tests on macOS. Every pull request runs, and pastes the output of:

```
cd Packages/YuiLines && swift test                                    # parser + conformance vectors
xcodegen generate
xcodebuild test -scheme YuiMac -destination 'platform=macOS' -only-testing:YuiTests
xcodebuild test -scheme Yui -destination 'platform=iOS Simulator,name=<any iPhone simulator>' -only-testing:YuiTests
```

  The hub repo's conformance suite (`cd spec/conformance && node run.mjs`) must still pass if the change touches a vector.
- Screenshots of the Mac window in light and dark in the pull request. Say in it if an agent made it.
- Plain words in the UI, no em dashes, no developer tooling in what a person sees.

## 1. The target builds and signs in (open now)

Goal: a `YuiMac` target that builds, launches, shows the sign-in screen, and opens the local demo chat.

Build:

- `project.yml`: a `YuiMac` application target, `platform: macOS`, deployment target macOS 26.0, `PRODUCT_BUNDLE_IDENTIFIER: com.yuigui.app`, sources `Yui/Sources`, `Yui/Resources` and `Shared`, packages `YuiLines` and `SwiftMath`. No widget extension. Entitlements: App Sandbox, outgoing network, camera, microphone, user-selected files read only, and Sign in with Apple. A `YuiMac` scheme that runs `YuiTests` on macOS (make `YuiTests` a multiplatform bundle, or add a `YuiMacTests` target with the same sources).
- Make it compile: wrap UIKit use (`UIImage`, `UIPasteboard`, `UIApplication`, the pan gesture recognizers, `UIImagePickerController`, `UITextView`), ActivityKit and the widget code in `#if os(iOS)`, and give the few shared needs a shim: an image type, the pasteboard, opening a URL. Views that only make sense on the phone may show a placeholder on the Mac in this PR.
- Sign in: the existing Sign in with Apple flow through AuthenticationServices, the refresh token in the Keychain.
- `-yuiDemo`: a Debug-only launch argument that skips sign-in and opens the local demo chat (`ChatStore.demo`), so anyone can run it without an account.

Acceptance:

- `xcodebuild -scheme YuiMac -destination 'platform=macOS' build` passes on a clean checkout with `YUI_TEAM_ID` unset (Sign to Run Locally).
- The app launches to the sign-in screen, in light and dark. With `-yuiDemo` it opens the demo chat and the thread draws.
- The iPhone target builds, and the iOS `YuiTests` pass, unchanged.
- `-yuiDemo` does nothing in a Release build.
- A maintainer signs in for real on the signed build before merge.

## 2. The thread and the composer

Goal: the Mac layout from the spec, with a real thread.

Build:

- `NavigationSplitView`: the sidebar holds the agents (face, name, presence, unread) and, under them, the selected agent's home with Home, Review, Controls and About (the YUI-54 drawer, always open). The detail column is the thread.
- The composer: Return sends, Shift-Return and Option-Return make a new line, drag and drop files (the same attachment path as the phone's picker).
- Command-K switch agent palette, Command-1 to Command-9, Command-Shift-R for Review. Menu bar commands for each (Agent, Thread, View).
- Right-click a message for the six reactions and Reply (`spec/REACTIONS.md`).

Acceptance:

- Sending, receiving, reactions and replies write the same rows as the phone: compare `ReactionFormatTests`, `ReplyFormatTests` and `MentionFormatTests`, which now also run on macOS.
- The keyboard map in the spec works, and each command is findable in the menu bar.
- The window resizes from 700 px wide to full screen with nothing clipped; narrow shows the thread only.

## 3. The presets

Goal: every preset in `PRESETS` (`site/lib/yl/yl.mjs`) draws on the Mac as the translation table says: native, adapted, or "Open on your iPhone".

Build:

- Turn on the preset views for macOS one group at a time: questions (`ask`, `choose`, `pick`, `slide`, `form`), content (`list`, `table`, `card`, `timeline`, `sketch`), media (`image`, `gallery`, `video`, `compare`, `storyboard`), science (`chart`, `stat`, `math`, `step`, `calc`), groups (`deck`, `plan`, `project`, `narrate`, `flow`), then `timer`, `camera`, `mic` and `game`.
- The stage (`>full`) as its own window that can go full screen; closing it leaves the pill. Pages `2` to `12` with the dot row, arrow keys and Command-[ and Command-].
- `camera` through AVFoundation and Continuity Camera, with the file picker fallback. `mic` through the Speech framework. `timer` kept from a start timestamp.

Acceptance:

- Every playground sample (`site/lib/yl/samples.mjs` in the hub repo) pasted into the demo chat renders with no error line that the playground does not show too.
- For the same tap, the event line is byte for byte the line the playground's wire log shows. `LastingIdsTests`, `ReopenAnswersTests`, `StageShowingTests`, `ShelfTests`, `SketchStepsTests` and `LiveTimerTests` pass on macOS.
- A thread with lines on `>2` and `>3` gets two pages, and a later patch (`~timer`) updates the page without moving the person.
- `timer 40/20x8` opens on the stage window and keeps the right time after the app sat in the background for a minute.
- No preset shows a blank or broken block: what the Mac cannot do says "Open on your iPhone".

## 4. Mac affordances

Goal: the parts that make it feel like a Mac app.

Build:

- A menu bar extra that shows a running timer (the Live Activity's job on the phone), with pause and stop.
- A local notification when a timer round ends and Yui is in the background.
- Settings as a Mac Settings window (Command-,): sign out, the look, notifications. The rest says "Open on your iPhone".
- Quick Look (Space) on gallery and image items, picture in picture on video.
- Reduce Motion and Increase Contrast from System Settings.

Acceptance:

- A timer started in a thread keeps counting in the menu bar with the window closed, and pausing it there pauses it in the thread.
- Settings opens with Command-, and every row does something.
- All the tests above pass, and the pull request shows light and dark screenshots of the sidebar, a thread, the stage window and the menu bar timer.

How to test against the playground:

1. In the hub repo: `cd site && npm install && npm run sync && npm run dev`, open `/playground`, pick a sample, tap through it, and keep the wire log open.
2. In the app repo: run the `YuiMac` scheme with `-yuiDemo`, paste the same sample into the demo chat, make the same taps, and compare the event lines.
3. Try light and dark, a narrow and a full screen window, and the keyboard only.

Rules: CONTRIBUTING.md in the app repo. Say in the pull request if an agent made it, and show the test output.
