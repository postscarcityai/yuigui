# Yui for macOS | spec v0 (YUI-58)

Yui on a Mac, as a native app. The same threads, the same agents, the same screens. Nothing new on the agent's side: a Mac is one more place the person reads a thread, like a second phone.

Status: draft, open for contributors (build to earn). The brief with the four pull requests is `docs/specs/macos.md` in the hub repo. Siblings: YUI-47 (Apple Watch), YUI-71 (browser, `spec/BROWSER.md`).

## What it is

A macOS target in the app repo's `project.yml` (xcodegen), next to the iPhone target, that:

1. **Ships under the same app record.** The bundle id `com.yuigui.app` is registered as universal, so the Mac app is the same purchase, the same Sign in with Apple and the same account as the phone.
2. **Shares the SwiftUI sources** (`Yui/Sources`, `Shared`) and the `YuiLines` package, which already builds for macOS 15. iOS-only code sits behind `#if os(iOS)` or a small platform shim, never in a copy of the file.
3. **Talks to the same relay** (`spec/RELAY.md`): rows in `yui_messages`, written as `sender='user'` rows. No server of its own.

Native, not Catalyst, and not the "iPhone app on a Mac" mode. It should feel like a Mac app: a sidebar, a keyboard, windows, menus, drag and drop.

An agent cannot tell the Mac from the phone. Its taps arrive as the same event rows, its replies are the same rows, and the channel guide does not change.

## Layout

One window with a `NavigationSplitView`: the sidebar on the left, the thread on the right.

- **The sidebar is the agent drawer** (YUI-54). On the phone the drawer slides in from the left and the switcher springs up from the agent at its bottom. On the Mac both stay open. At the top, the agents: face, name, honest presence (`yui_agent_list.presence`), an unread dot. Under them, the selected agent's home with the drawer's four tabs as a segmented control: Home (pinned screens, what's next, the agent's screens, shortcuts), Review (what's waiting on you, answered in place), Controls and About.
- **The detail column is the thread**: bubbles, Yui Lines screens, the composer at the bottom. Each agent's look (`spec/AGENTS.md`, Look) colors the thread, and the same `YuiTheme` tokens drive light and dark.
- **The stage** (`>full`) opens in its own window, sized to the content, that can go full screen with the green button or Control-Command-F. Closing it leaves the pill in the thread, as a swipe down does on the phone.
- **Pages** `2` to `12` stay in the thread window: one page at a time with the same dot row.
- The sidebar collapses with Control-Command-S, the standard shortcut. A narrow window shows the thread only, like the phone.

## Keyboard

| Keys | What they do |
| --- | --- |
| Return | send |
| Shift-Return, Option-Return | a new line in the composer |
| Command-K | switch agent: a small palette, type to filter, Return opens the thread |
| Command-1 to Command-9 | the agent in that place in the sidebar |
| Command-Shift-R | the Review tab: what's waiting on you |
| Command-[ and Command-] | the previous and next page |
| Left and Right arrows | the previous and next page, when the composer is empty or not focused |
| Escape | close the stage, a sheet or the reaction menu |
| Control-Command-F | the stage full screen |
| Command-, | Settings |
| Space, arrows | play a `game` (the game has focus) |

Every command is in the menu bar too (Agent, Thread, View), so it can be found without the shortcut.

## Translation table

Every preset in `site/lib/yl/yl.mjs` (`PRESETS`), and what it does on a Mac.

- **Native**: the same view as the phone, drawn by the shared SwiftUI code.
- **Adapted**: the same event on the wire, a Mac way to answer it.
- **Open on your iPhone**: the block says so in one line, with a `yui://agent/<id>/thread` link. It never breaks.

| YL | On the Mac |
| --- | --- |
| `ask` | native. Return submits. |
| `choose`, `pick` | native. Also the number keys 1 to 9 when the block has focus. |
| `slide` | native `Slider`, arrow keys step it |
| `form` | native. Tab moves between fields, Return on the last field submits. Field `photo`: adapted (below, `camera`). Field `voice`: adapted (below, `mic`). |
| `list`, `table`, `card` | native. Tables scroll sideways with the trackpad. |
| `image` | native |
| `image +edit` | adapted: draw with the mouse, the trackpad or a tablet pen |
| `camera` | adapted: the Mac's camera or Continuity Camera (the iPhone as the Mac's camera) through AVFoundation, `facing` ignored when there is one camera. No camera or no permission: a file picker and drag and drop, the fallback YL already names. `+scan`: Continuity Camera's Scan Documents from a nearby iPhone, else a file picker. |
| `mic` | adapted: the Speech framework, which macOS has. Hold the mic button, or press Command-Shift-M to start and again to stop. `+auto` starts only after a click, like a browser. |
| `gallery`, `storyboard` | native. Arrow keys move, Space opens Quick Look. |
| `video` | native (AVKit), picture in picture works |
| `compare` | native, drag the handle |
| `chart`, `stat` | native (Swift Charts) |
| `math`, `step`, `calc` | native (SwiftMath draws on macOS) |
| `deck`, `page` | native pages, arrow keys and swipe |
| `plan` | native |
| `project` | native |
| `narrate` | native, the voice plays through the Mac's speakers |
| `timeline`, `done`, `now`, `next` | native |
| `sketch`, `row`, `after` | native |
| `game` | adapted: arrow keys and Space, the pointer for taps. Haptics dropped. |
| `flow` | native, runs on the stage window |
| `timer` | adapted. It keeps running while the app runs, window open or closed. Time is kept from a start timestamp. No Live Activity and no lock screen: a running timer shows in the menu bar instead (PR 4), and a round's end rings and posts a notification when Yui is in the background. Quitting stops it, and the pill says so when the thread opens again. |
| the stage, `>full` | adapted: its own window, full screen on request |
| pages `2` to `12` | adapted: arrow keys, Command-[ and Command-], a two-finger swipe, a click on a dot |
| `talk` on a page | adapted, as `mic` |
| reactions | adapted: right-click a message for the six emoji and Reply (`spec/REACTIONS.md`) |
| haptics (games, taps, timers) | dropped, silently |
| Live Activity, Dynamic Island | the menu bar timer instead |
| anything that needs the phone | Open on your iPhone |

Out of v1, each says "Open on your iPhone" with the reason in one line: adding or pairing an agent, Settings > Agent access, invites, and deleting the account. Settings on the Mac has sign out, the look, and notifications.

## Signing and release

Signing, notarization, the App Store Connect record and TestFlight for macOS stay with the maintainers (the yui agent). No keys, certificates, team ids or provisioning profiles go into a pull request.

- `project.yml` keeps `DEVELOPMENT_TEAM: ${YUI_TEAM_ID}`. Contributors build with their own team id in their environment, or with Sign to Run Locally, and never commit it.
- Sign in with Apple needs the real team and bundle id, so a contributor's build cannot sign in against the live service. It opens the local demo chat instead (`-yuiDemo`, Debug only, brief PR 1), which is enough to build and test PRs 2 to 4. A maintainer checks the real sign-in on the signed build before each merge.
- The Mac target is sandboxed (App Sandbox) with only what it uses: outgoing network, camera, microphone, and files the person picks.

## Security

No new roles and no new tokens. The Mac is a `yui_user` client with exactly the rights in `spec/AGENTS.md` (Who may do what) and `spec/RELAY.md` (Credentials): its own threads, `sender='user'` rows, nothing else.

- Sign in with Apple through AuthenticationServices, with the same nonce flow as the phone. The Mac app's identity token carries the same audience as the phone's, because the bundle id is the same, so `yui-auth` does not change.
- The refresh token lives in the Keychain (the data protection keychain, this device only), the access token in memory. Sign out calls the `sign_out` grant, which revokes it.
- No service key, no connector token and no management token ever reach the Mac app.
- Invites gate the Mac the same way: an account the phone could not open, the Mac cannot open.

## Push (v2)

Remote notifications through APNs, the same `yui-push` and the same rules as the phone: muted agents stay quiet, and a thread open on the Mac (the `presence` call) is skipped. It needs a macOS push entitlement and a device row per Mac, which the maintainers add. v1 has none; an open app shows new messages as they land.

## Not yet

- Quick replies from the menu bar (a small popover with the newest ask). The menu bar timer in PR 4 is the start.
- Several windows on one thread, a thread in its own window, and a Share extension.
- Adding agents from the Mac. It needs its own brief.
