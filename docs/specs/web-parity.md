# Yui on the web: the parity map (YUI-240)

Chris, 2026-10-01: "Let's bring Yui to the web!" One to one feature parity with the iPhone app, Sign in with Apple in the browser, take as long as it needs. Web and phone may handle ins and outs a little differently; get as close as we can.

This is the map of the whole epic (YUI-240 to YUI-250): every app feature, the web twin it gets, and the story that builds it. The spec it hangs from is [spec/BROWSER.md](../../spec/BROWSER.md) (rendered at https://www.yuigui.com/developers/browser). The brief for contributors is [browser.md](browser.md). Built by us, not by contributors.

Reference for every behavior is the app: `~/dev/yui/Yui/Sources` (paths below are relative to it) and `spec/YL.md` for every preset.

## How to read the table

**Rule when the app lags the web.** The playground and the site already draw `flow`, `diagram`, `mock` and agent tables, which the app does not yet. The web keeps what it draws and never removes a preset to match the phone. Those rows say `web is ahead`, and the app catches up on its own cards (YUI-115 for `flow`). Parity means no app feature is missing on the web; it does not mean the web holds back.

- **Web twin**: `same` = the web does exactly what the app does. `web way` = the same result by a different road, said in the row. `iPhone` = the web says "Open on your iPhone" with a `yui://` link and one line of why, never a broken block.
- **Status**: `open` = nothing built. `draws` = the playground renderer already draws it from a recorded line, but nothing live is wired. `done` = this story closed the row.
- A row is closed by the story in its last column, and that story updates this file in the same commit.

## 1. The places the web must differ

Every one is a row below too. This is the short list, with the web way for each.

| App has | Why the browser cannot | The web way | Story |
| --- | --- | --- | --- |
| Haptics (15 files use them: games, taps, timers, reactions) | No haptics API on desktop; Vibration API is Android-only | Dropped, silently. A short sound or a visual pulse stands in only where the haptic carried meaning (a timer phase change already beeps). | 246 |
| Keychain (session, vault keys, `Account/Keychain.swift`) | No secure enclave for pages | Access token in memory. Refresh token in IndexedDB under a strict CSP. Keys: never in the browser; the web adds a key through `yui-vault` sealed on the server, or says "Add it on your iPhone" (decision in section 4, story 247). | 241, 247 |
| Face ID on keys (`Vault/VaultStore.swift`, LocalAuthentication) | No biometric prompt for pages | WebAuthn user verification (passkey or Touch ID) on add, replace, remove and grant, where the browser has it. Where not: a fresh Sign in with Apple popup. | 247 |
| APNs push (`Push/Push.swift`) | Different protocol | Web Push with VAPID through `yui-push`. A reply read on one device clears the others where the platform allows. | 248 |
| Live Activity and Dynamic Island (`Presets/LiveTimer.swift`, `YuiWidgets/TimerLiveActivity.swift`) | iOS only | Timer keeps true time from a start timestamp while the tab is open; a pill in the thread; the tab title and favicon show the time left. A closed tab stops the timer and the pill says so on return. | 246 |
| Home and lock screen widgets (`YuiWidgets/YuiWidgets.swift`) | iOS only | iPhone. The saved screens a widget would show are on the shelf and pinned rows in the web drawer. | 248 |
| Siri, Shortcuts, Action button (spec/WIDGETS.md, not shipped in the app yet) | iOS only | iPhone. Nothing in the app today either. | none |
| Home screen quick actions (`Agents/QuickActions.swift`) | iOS only | The same `menu shortcut` rows, as the agent's chips and a command palette (Cmd/Ctrl+K) in the web. | 245 |
| `yui://` deep links, Universal links (`Push/Push.swift`) | The app owns the scheme | `/web/agent/<id>` and `/web/agent/<id>/chat/<chat>` routes, and a notification click opens them. `yui://` links in screens become "Open on your iPhone" unless the person is on the web already, when they route inside it. | 242, 248 |
| Speech recognition (`Chat/PushToTalk.swift`, `Chat/HandsFree.swift`, `Presets/MicPreset.swift`, Speech framework) | Web Speech API exists only in Chromium and Safari, with different quality | The Web Speech API for the words (shown as heard, sent as text, the app's own rule: voice in, text out), `getUserMedia` and an `AnalyserNode` for the waveform. No `MediaRecorder` and no audio upload: the app uploads none either, so there is no transcript path to share, and nothing would read it. Typing is the way in where the API is missing (Firefox), and the field says so. Built in `lib/web/voice.mjs`, `handsfree.mjs` and `app/web/useVoice.js` (YUI-244). | 244 |
| Camera and photo library (`Chat/Attachments.swift`, `Chat/SnapSay.swift`, `Presets/MediaPresets.swift`) | No library; permission per site | A file picker (a phone's offers the camera and the library), drag and drop and paste, in the composer. Every photo is shrunk to 2048 px and sent as JPEG like the app's. The in-page camera preview is the `camera` preset (246). | 244, 246 |
| MIDI over USB and Bluetooth (`Presets/MIDIFeed.swift`, `Presets/MusicTake.swift`) | Web MIDI is Chromium only; no MIDI clock out on Safari | Web MIDI in for the keys where it exists; Record sends the take as `.m4a` and `.mid` (MediaRecorder and a small writer). Safari: "Open on your iPhone" for the keyboard and clock, everything else plays. | 246 |
| Metal shaders for the visual (`Stage/Visual.metal`, `Stage/StageVisual.swift`) | No Metal | WebGL fragment shaders from the same plan (spec/VISUAL.md); `site/app/playground/visualizer.js` and `shaderlook.js` already draw it. 2D canvas below a budget, a still above it when reduced motion is on. | 243 |
| Local notifications for reminders (`Presets/Reminders.swift`) | A closed tab cannot fire one | While the tab is open: the Notifications API at the time. Closed: Web Push, scheduled by `yui-push` from the same `meta.native.reminders` set. | 246, 248 |
| Share sheet (`Chat/ReactionViews.swift`, `Presets/Pages.swift`) | No system sheet on desktop | Web Share API where it exists, else copy link. | 242 |
| MetricKit and speed reports (`Perf/`) | iOS only | The same seven intervals from `performance.mark`, sent as `yui_perf` with `client=web`. Dev switch only, as in the app. | 250 |
| On-device model (spec/ON-DEVICE.md, Apple Foundation Models) | iOS only | iPhone. Nothing leaves the phone; the web does not run it. | none |
| Feedback mail (`Account/YuiBackend.swift` feedbackMail) | TestFlight button | A "Send feedback" form that goes to the same feedback card path, plus a mailto fallback. | 247 |

## 2. Account and session

| Feature | App file | Web twin | Story | Status |
| --- | --- | --- | --- | --- |
| Sign in with Apple (nonce, identity token, `yui-auth` apple grant) | `Account/Account.swift`, `Account/SignInView.swift` | web way: Sign in with Apple JS in a popup, `sha256(nonce)` to Apple, raw nonce to `yui-auth`, a web Services ID (`com.yuigui.web`) as a second audience, sessions marked `client=web`. Live once the Services ID exists at Apple (a browser step). | 241 | done |
| Session (userID, access token, refresh token, expiry) | `Account/Account.swift` | web way: access token in memory, refresh token in IndexedDB (section 4) | 241 | done |
| One refresh in flight (a refresh token spent twice ends every session) | `Account/Account.swift` | web way: Web Locks plus BroadcastChannel across tabs | 241 | done |
| Invite code, claim after sign in | `Account/SignInView.swift`, `Account/Account.swift` | same: `/i/<code>` hands to `/web`, claim grant after sign in | 241 | done |
| App Review code path | `Account/Account.swift` (review grant) | same: the `review` grant, for demo access on the site | 241 | done |
| Sign out (revokes the session) | `Account/Account.swift` | same: `sign_out` grant, clears IndexedDB, ends only this session (built in 241, the Settings screen that holds the button is 247) | 247 | open |
| Delete account | `Account/Account.swift`, `supabase/functions/yui-delete` | same: asks first, then `yui-delete`; says what is deleted | 247 | open |
| First run, pick your crew (Arnold, Basil, Gouda, Penny, Quill, bring your own) | `Agents/CrewPick.swift` | same: the same flow on full screens | 245 | open |
| Build info (version, build, commit, guide) | `Account/BuildInfo.swift` | web way: the web build's commit and the guide it speaks, in About | 247 | open |
| Backend host, publishable key | `Account/YuiBackend.swift` | same: the same project (yuigui), same anon key; CORS answers for the web origin | 241 | done |

## 3. The thread

| Feature | App file | Web twin | Story | Status |
| --- | --- | --- | --- | --- |
| One thread per agent over the relay (`yui_messages`, REST plus Realtime, ordering, dedupe) | `Chat/Thread.swift`, `Presets/ChatStore.swift` | same: `lib/web/relay.mjs` and `sync.mjs`, the same query, ordering, 10 s overlap and dedupe, an outbox, Realtime as a faster path. Built and proved on the demo relay; the live smoke waits on 241's session | 242 | open |
| Chats: several conversations per agent, New chat, titles, rename, delete | `Chat/Chats.swift`, `Agents/DrawerChats.swift` | same | 245 | open |
| Text bubbles, agent bubble shapes and colors, the agent's look | `Chat/ReactionViews.swift`, `Theme/AgentLook.swift` | same: the look's accent from `look.mjs` (bubble shapes per look: 247) | 242 | done |
| Markdown in agent words | `Chat/BubbleMarkdown.swift` | same: `marked`, sanitized | 242 | done |
| Long answers fold | `Chat/LongText.swift` | same: fold past 60 words, "Read it all" in place (`lib/web/thread.mjs`); the deck "Read as pages" comes with the stage (243) | 242 | done |
| Reading text style (headline or one liner, body) | `Theme/ReadingText.swift` | same: `readtext.mjs` | 242 | done |
| Sent times and day dividers | `Chat/SentTimes.swift` | same: `site/lib/chat/when.mjs` | 242 | done |
| A reply in Yui Lines drawn as presets, not a bubble | `Presets/PresetViews.swift`, `Presets/YLScreen.swift` | same: `Render` from `presets.js` | 242 | done |
| Taps send the same `[yui] ...` event rows; changed answers too | `Presets/ChatStore.swift` | same: `eventLine`, `echoFor`, `relays` from `mcp-app/src/events.mjs`, byte for byte | 242 | done |
| Patches (`~id`), lasting ids, `known` | `Presets/ChatStore.swift` lastingIds | same: `lastingIds(state)` in `yl.mjs` | 242 | done |
| Presence (`yui_agent_list.presence`), paused, handoff | `Agents/AgentStore.swift`, `Agents/GatewayWait.swift` | same | 242 | open |
| Working row (`doing`), Stop | `ChatView.swift`, `Chat/Thread.swift` | same: `site/lib/chat/stop.mjs`, `stage.mjs` | 242 | done |
| Reply to one message | `Chat/Reply.swift` | same: hold (touch) or right-click, or the button on a focused bubble; the `[yui] reply ...` line and `meta.reply_to`, byte for byte (`lib/web/compose.mjs`); a sent reply wears the quote chip, a tap goes back to the message | 244 | done |
| Reactions (six) | `Chat/Reactions.swift`, `Chat/ReactionViews.swift` | same: the hold menu, the six in `spec/REACTIONS.md` (a test reads the table), `[yui] react ...` with `meta.react`, one per message, the same again takes it back, the badge at once and on reload (`yui_messages.reaction`). Your own messages take none | 244 | done |
| @mention other agents | `Chat/Mentions.swift` | same: `@` suggests the other agents with their presence, "Goes to Penny" over the field, `[yui] mention to=<handle>` and `meta.mention`, the answer comes back with the agent's name and "Open its thread" | 244 | done |
| Slash commands and suggestions | `Chat/Suggestions.swift` | same: the popover over the composer, arrow keys, Enter or Tab, Escape; the agent's own `/commands` from its host | 244 | done |
| Photos and files in a message | `Chat/Attachments.swift`, `Chat/Media.swift`, `Chat/Pictures.swift` | web way: picker, drag and drop, paste (up to 12); the same `yui-media` upload under `<user>/<agent>/user/<uuid>.jpg`, one text row with `meta.photos`, the host hands them to the agent as media. The bucket takes pictures and mp4 or mov only and the app attaches photos only, so another kind of file is refused with a line saying so | 244 | done |
| Hold to talk, waveform, slide to cancel | `Chat/PushToTalk.swift`, `Chat/TalkWaveform.swift` | web way: hold the mic button (touch or mouse), slide left to cancel, let go to send; a waveform and the words as heard. A keyboard cannot hold, so Enter or Space on the mic is a tap | 244 | done |
| Hands free | `Chat/HandsFree.swift` | same rules (`lib/web/handsfree.mjs`, the app's state machine and tests ported): tap once, a 0.7 s quiet sends, the reply lands, a beat, it opens again; 30 s of quiet pauses it. A tap per page load: the browser asks for the mic once | 244 | done |
| Snap and say | `Chat/SnapSay.swift` | web way: pick or take a photo, then say or type, one message (the tray is over the field). The live camera preview is the `camera` preset (246) | 244 | done |
| Talk about this | `Chat/TalkAbout.swift` | same: the button on a Controls item | 245 | open |
| Chat with a screen (`>N talk`, `[yui] screen=N`) | `Chat/ScreenTalk.swift` | same | 243 | open |
| Outbox (kept until the server has it; a 409 resend counts as sent) | `Chat/Outbox.swift` | web way: IndexedDB (`lib/web/outbox.mjs`), the app's rules: written before the first try, oldest first, the row id is the primary key, 1 s to 30 s backoff, a refusal that never passes is dropped. A photo's bytes wait in it too. Several tabs: one Web Lock flusher and every pass re-reads the disk, so a row goes out once. Survives a closed tab and a killed browser | 244 | done |
| Typing stays fast (draft kept off the thread view) | `Chat/Composer.swift` | same: the words live in a store (`lib/web/composer.mjs`) only the field reads, kept per agent in `localStorage`, never a pasted key | 244 | done |
| Draft shared between devices | none today | web way: new on both, see story | 249 | open |
| Mixed chat plus cards inside one reply | `Presets/PresetViews.swift` | same | 242 | draws |
| `theme app` restyle card (Use or keep) | `Chat/RestyleCard.swift` | same: `restyle.js` draws it | 247 | draws |

## 4. The stage, pages and home

| Feature | App file | Web twin | Story | Status |
| --- | --- | --- | --- | --- |
| Stage first: first send opens the stage, reply plays as chunks, questions last under one Send | `Stage/StageFirst.swift`, `Stage/StageChunks.swift` | same: `chunks.mjs`, `stagefirst.js` | 243 | done |
| The chat is the record, a chunk chip reopens the stage there | `Stage/StageFirst.swift` | same | 243 | done |
| `>full` as a full-window layer, close returns to chat | `Presets/Stage.swift` | same: a layer over the window; Fullscreen API behind a button | 243 | draws |
| Components that open on the stage by themselves (`timer`, `camera`, `mic`, `deck`, `plan`, `game`, row3d gallery) | `Presets/Stage.swift` | same: `onStage` in `yl.mjs` | 243 | draws |
| A way home (X, Back home, pull down 110 points) | `Presets/FullScreenExit.swift` | same: `dragdown.js` (`useDragDown`), Esc | 243 | draws |
| Stage motion (the mark breathes, thinking, speaking) | `Stage/StageMotion.swift` | same: `stagemotion.js`; `prefers-reduced-motion` swaps motion for fades | 243 | done |
| The visual and what it hears | `Stage/StageVisual.swift`, `Stage/VisualPlan.swift`, `Stage/VisualSound.swift`, `Stage/VisualDefault.swift` | web way: WebGL, `AnalyserNode` for sound, the same plan and budget | 243 | draws |
| Pages 2 to 12: swipe, arrow keys, dots, kept across replies | `Presets/Pages.swift` | same: `pages.mjs` | 243 | draws |
| Agent home: shortcut chips, review rows, show saved screen | `Stage/StageHome.swift` | same | 243 | done |
| Top bar (settings, agent picker, chat record with new count) | `Stage/TopBar.swift` | same | 243 | done |
| Bottom bar (big mic, T, +; settings toggle each) | `Stage/BottomBar.swift` | same: mic (hold or tap), text field, attach, with the tray, reply and mention bars over it | 243, 244 | done |
| Story pages full screen | `Presets/StoryPage.swift` | same | 243 | draws |
| Time under the stage answer (Yesterday 9:41 PM) | `Stage/StageFirst.swift` | same: `stageTime` in `when.mjs` | 243 | draws |
| Sound keeps playing across screens | `Presets/MusicPresets.swift` | same: `music/keep.js` | 246 | draws |
| A saved screen opens with no turn | `Presets/Shelf.swift` | same: zero requests (site/scripts/layer-e2e.mjs) | 243 | draws |
| Saved screens and the shelf (`save`, `show`, `forget`) | `Presets/Shelf.swift` | same: shelf chips at the top of the thread | 246 | open |

## 5. Agents and the drawer

| Feature | App file | Web twin | Story | Status |
| --- | --- | --- | --- | --- |
| Your agents, honest presence, pick one | `AgentsView.swift`, `Agents/AgentStore.swift` | same: a column on desktop, a drawer at 390 px | 242 | open |
| The agent drawer: Chats, Menu (review, backlog, shortcut rows), About | `Agents/AgentDrawer.swift`, `Agents/AgentMenu.swift` | same: `menu` lines draw nothing in the chat; taps send the same bucket lines | 245 | open |
| Add an agent (pairing code, from the host, by asking an agent) | `AgentsView.swift`, `Agents/GatewayWait.swift` | same: the code on screen, wait for the gateway, then the thread | 245 | open |
| Rename, remove (with the app's confirm) | `AgentsView.swift`, `Agents/AgentStore.swift` | same | 245 | open |
| Connect approval (an MCP client asks through OAuth) | `Agents/ConnectApproval.swift` | same: `/connect/<id>` hands to `/web` | 245 | open |
| Group threads (hop lines, notes, loop guard) | `Agents/AgentStore.swift`, `ChatView.swift` | same | 245 | open |
| Controls: personality, memory, skills, schedules, with Edit and ask-before-delete | `Agents/Controls.swift`, `Agents/ControlsViews.swift` | same | 245 | open |
| Shared agents (Hi Maya, Shared by Sam, Paused by its owner, a revoke closes the thread) | `Agents/AgentStore.swift` | same | 245 | open |
| Safe to share indicator | `Agents/AgentStore.swift` | same | 245 | open |
| Home screen quick actions | `Agents/QuickActions.swift` | web way: the same rows as chips and a command palette (Cmd/Ctrl+K) | 245 | open |
| Starter crew and the native Yui in the browser | `Agents/CrewPick.swift`, spec/NATIVE.md | same: needs no agent code of its own | 249 | open |

## 6. Settings and account

| Feature | App file | Web twin | Story | Status |
| --- | --- | --- | --- | --- |
| Appearance (system, light, dark) | `SettingsView.swift` | same: follows `prefers-color-scheme`, a toggle overrides | 247 | open |
| Stage first section (which of mic, T, + show) | `SettingsView.swift` | same | 247 | open |
| Home actions section | `SettingsView.swift` | same | 247 | open |
| Look: Yui's own look and each agent's | `Theme/AppLook.swift`, `Theme/AppLookStore.swift`, `Theme/AgentLook.swift`, `Theme/YuiTheme.swift` | same: synced through the account where the app syncs it | 247 | open |
| Agent access (management tokens) | `SettingsView.swift`, spec/AGENTS.md | same: create, show once, revoke | 247 | open |
| Keys vault (fal, Replicate, OpenRouter, Anthropic, OpenAI; caps; grants) | `Vault/*.swift`, `Vault/VaultViews.swift` | web way: no key stored in the browser, ever. A key is sealed to the hosted connector in the page (HPKE, same format as `Vault/VaultSeal.swift`) and handed to `yui-vault`; the page keeps only the handle. Where WebCrypto lacks the cipher, or the browser has no user verification: "Add it on your iPhone". | 247 | open |
| Vault ask sheet (an agent asks to use a key) | `Vault/VaultAskViews.swift` | same: Yui's own chrome, never drawn from an agent's screen | 247 | open |
| Your model key | `ModelKeyForm.swift`, `Account/Account.swift` | web way: sealed the same way as above | 247 | open |
| Web search key (Firecrawl) | `SettingsView.swift` | web way: sealed the same way | 247 | open |
| Help and feedback | `SettingsView.swift`, `Account/YuiBackend.swift` | web way: form into the feedback path, mailto fallback | 247 | open |
| About this build | `Account/BuildInfo.swift` | web way | 247 | open |
| Speed switch (dev builds only) | `Perf/*.swift` | web way: `?perf=1`, never visible to a person | 250 | open |
| Invites (requests, approve, template) | spec/AGENTS.md, `supabase/scripts/invite.py` | same: owner screens only | 247 | open |

## 7. Presets (every one in spec/YL.md section 4)

Status `draws` means the playground draws the preset from a line today. The live story checks it behaves like the phone: taps, patches, stage, time.

| YL preset | App file | Web twin | Story | Status |
| --- | --- | --- | --- | --- |
| `timer` (rounds, rest, `+up`, beeps on the last 3 seconds) | `Presets/TimerPreset.swift`, `Presets/LiveTimer.swift` | web way: start timestamp, tab-title countdown, no lock screen | 246 | draws |
| Workouts and Arnold's runner | `Presets/WorkoutRunner.swift` | web way: same runner, true time in a background tab, a Wake Lock while it runs | 246 | draws |
| `ask`, `choose`, `pick`, `slide` | `Presets/PresetViews.swift` | same | 242 | draws |
| `form` (fields, photo, voice, one Send inside a plan) | `Presets/FormPreset.swift` | same: photo is a file picker, voice is the mic button | 242 | draws |
| `list` (ticks kept on the device) | `Presets/ListTicks.swift` | same: ticks kept in IndexedDB, the same marks | 246 | draws |
| `table` (units, sort) | `Presets/SciencePresets.swift` | same | 246 | draws |
| Agent tables (`table create`, `put`, `query`, spec/TABLES.md) | not in the app yet | web way once the app has it: rows kept in IndexedDB, never leave the browser; a phone's rows reach the web only through the sync of YUI-249 | 249 | open |
| `card` (links open a new tab) | `Presets/PresetViews.swift` | same | 242 | draws |
| `image`, `image +edit` | `Presets/MediaPresets.swift` | web way: pointer events draw with a mouse, pen or finger | 246 | draws |
| `camera` | `Presets/MediaPresets.swift` | web way: `getUserMedia`, a file picker with no camera or permission | 246 | draws |
| `mic` (`+auto`, `{transcript}`) | `Presets/MicPreset.swift` | web way: Web Speech or MediaRecorder; `+auto` waits for a tap | 246 | draws |
| `gallery`, `video`, `compare`, `storyboard` | `Presets/MediaSetPresets.swift`, `Presets/MediaPresets.swift` | same | 246 | draws |
| `chart`, `stat`, `math`, `step`, `calc` | `Presets/SciencePresets.swift` | same: `science.js`, KaTeX | 246 | draws |
| `deck`, `page`, quiz members | `Presets/FlowPresets.swift` | same | 246 | draws |
| `plan` with its questions | `Presets/FlowPresets.swift` | same: one Send, one `{plan: ...}` event, answers land in the record | 243 | draws |
| `flow` and starter flows | not in the app yet (YUI-115; `compat.py` runs a flow as a plan on phones until then) | web is ahead: `flow-run.mjs` and `starter-flows.mjs` already run it. The web keeps it; the app catches up on YUI-115 | 246 | draws |
| `project` | `Presets/FlowPresets.swift` | same | 246 | draws |
| `narrate` | `Presets/FlowPresets.swift` (`NarratePreset`) | web way: speech synthesis where the browser has it | 246 | draws |
| `timeline`, `done`, `now`, `next`, reorder | `Presets/TimelinePreset.swift` | same: drag to reorder with a pointer | 246 | draws |
| `sketch`, `row`, `after` | `Presets/SketchPreset.swift` | same | 246 | draws |
| `shapes`, `shape` | `Presets/ShapesPreset.swift`, `Presets/ShapesScene.swift` | same: `shapes.mjs` is the line-for-line source | 246 | draws |
| `diagram` | not in the app yet (no case in `Presets/PresetViews.swift`) | web is ahead: `diagram.mjs` is the reference and draws it | 246 | draws |
| `mock`, `part` | not in the app yet (no case in `Presets/PresetViews.swift`) | web is ahead: the playground draws it | 246 | draws |
| `map`, `area`, `pin`, `route` (world scale) | `Presets/MapPreset.swift`, `Presets/MapScene.swift` | same: `map.mjs` is the line-for-line source | 246 | draws |
| `game` (tictactoe and the rest) | `Presets/GamePreset.swift` | web way: pointer and arrow keys, no haptics | 246 | draws |
| `loop`, `drums` | `Presets/MusicPresets.swift`, `Packages/YuiSound` | same: Web Audio, the same sound bank, one engine, one clock | 246 | draws |
| `keys`, `chords` (scale lock, glide, several fingers) | `Presets/MusicKeys.swift` | same: pointer events and the computer keyboard; Web MIDI in where it exists | 246 | draws |
| `tuner` | `Presets/MusicTools.swift` | web way: `getUserMedia` and a pitch detector | 246 | draws |
| `metronome` | `Presets/MusicTools.swift` | same | 246 | draws |
| Record on the looper, drums, keys, chords (`.m4a`, `.mid`) | `Presets/MusicTake.swift` | web way: MediaRecorder and a small MIDI writer | 246 | open |
| MIDI clock out | `Presets/MusicTake.swift` | iPhone on Safari; Chrome and Edge via Web MIDI | 246 | open |
| Loop drafts (a beat kept until sent) | `Presets/LoopDrafts.swift` | same | 246 | open |
| `say` (words on the stage, not a bubble) | `Presets/PresetViews.swift`, `Stage/StageChunks.swift` | same | 243 | draws |
| Body text renderers | `Theme/ReadingText.swift` | same: `readtext.mjs` | 242 | draws |
| `theme`, `theme app` | `Theme/AgentLook.swift`, `Theme/AppLook.swift` | same: `look.mjs` | 247 | draws |
| Reminders (`meta.native.reminders`) | `Presets/Reminders.swift` | web way: Notifications API while open; Web Push closed (section 1) | 246, 248 | open |
| `custom {json}` | `Presets/PresetViews.swift` | same: replaced, not patched | 242 | draws |
| Errors in a line (the error row) | `Presets/YLScreen.swift` | same: the playground shows the same error row | 242 | draws |
| Telegram fallback text | spec/YL.md section 10 | not needed in the browser | none | n/a |

## 8. Push, links, system

| Feature | App file | Web twin | Story | Status |
| --- | --- | --- | --- | --- |
| Register a device, mute per agent, `presence` suppresses a push for the open thread | `Push/Push.swift`, `supabase/functions/yui-push` | web way: Web Push subscription (endpoint and keys, `environment: "web"`), same rules | 248 | open |
| A tap opens the thread; deep link `yui://agent/<id>/thread` | `Push/Push.swift` | web way: a notification click opens `/web/agent/<id>` | 248 | open |
| Silent push on revoke (an agent leaves the list at once) | `Push/Push.swift` | same: a push with no notification, the page reloads the list | 248 | open |
| Badge | `Push/Push.swift` | web way: Badging API where it exists | 248 | open |
| Install to the home screen or dock | none | web way: manifest and service worker | 248 | open |
| Continue on the phone or the web | none today | web way: thread, open screens, shelf, drawer, read state and drafts in sync | 249 | open |
| Widgets, Live Activity, Siri | `YuiWidgets/`, `Shared/TimerActivity.swift` | iPhone | none | n/a |
| On-device model, reply chips | spec/ON-DEVICE.md | iPhone | none | n/a |

## 9. The stories

| Story | Card | What it closes |
| --- | --- | --- |
| YUI-240 | the map, this file | the decisions in section 10, the spec and roadmap rewrite |
| YUI-241 | Sign in with Apple on the web | account, session, CORS |
| YUI-242 | the thread, live in the browser | thread rows, bubbles, presets drawn live, taps. Folds YUI-109 (the offline thread) in |
| YUI-243 | the stage on the web | stage first, pages, home, top and bottom bar |
| YUI-244 | the composer on the web | photos, voice, mentions, replies, reactions, suggestions, the outbox |
| YUI-245 | agents on the web | the drawer, add, rename, remove, connect, groups, controls |
| YUI-246 | every preset at parity | music, tuner, games, maps, diagrams, flows, workouts, the shelf |
| YUI-247 | settings and account | look, keys, web search, invites, help, sign out, delete |
| YUI-248 | notifications | Web Push, the click opens the thread, install |
| YUI-249 | one Yui across phone and web | continue, read state, drafts. Folds YUI-146 in |
| YUI-250 | ships | parity sweep, the e2e suite in CI, the launch demo, the release post draft |

## 10. Decisions

### The URL

`https://www.yuigui.com/web`, the path `docs/specs/browser.md` already named. The spec's older plan for `app.yuigui.com` is dropped: one origin means no second DNS record, no second Vercel project, and the web client ships in the same build as the playground, the renderer and the specs. Routes:

- `/web` the app (the agent list, or the sign in screen)
- `/web/agent/<id>` and `/web/agent/<id>/chat/<chat>` a thread (what a notification click and a `yui://` link open)
- `/web/auth/apple` the return URL registered with Apple
- `/web?demo=<sample>` the offline fixture mode (no sign in, no network), the harness and the playground twin

The cost of one origin is that the page shares an origin with the rest of the site, so `/web` gets its own headers (below) and no page of the site may carry a script that handles tokens.

### The session model

- **Access token** (the `yui_user` JWT from `yui-auth`, short lived): in memory only. Never in `localStorage`, `sessionStorage`, a cookie or the URL.
- **Refresh token**: the one thing stored, in IndexedDB under the `/web` origin, so a closed tab stays signed in for the 60 days the app's session has. Not `localStorage`: IndexedDB is not readable by an extension that reads `localStorage`, and it keeps the exact record shape the app keeps in the keychain (`YuiSession`).
- **Why not an HttpOnly cookie**: it would put a server in the middle (the relay has none) and bring cookie CSRF with it. A bearer token in an `Authorization` header is not sent by the browser on its own, so a forged cross-site request carries no credential. The edge functions never read cookies.
- **XSS story (as built in 241)**: `/web` is served with a Content Security Policy from `site/next.config.mjs`: `default-src 'self'`, `script-src 'self' 'unsafe-inline' https://appleid.cdn-apple.com`, `connect-src` the yuigui Supabase project, its realtime socket and Apple only, `frame-src` Apple, `frame-ancestors 'none'`, `object-src 'none'`, `base-uri 'self'`, `form-action 'self' https://appleid.apple.com`, plus `Referrer-Policy: no-referrer` and `Cross-Origin-Opener-Policy: same-origin-allow-popups` (Apple's popup needs its opener). Honest limit: `script-src` carries `'unsafe-inline'`, not a nonce, because Next writes its hydration data into inline scripts and a nonce would make every page dynamic. So the policy stops a third party script, a remote frame and a data leak to another host, but not an injected inline script on our own page. What shuts that door instead: React escapes every string, agent words are markdown through a sanitizer and never `dangerouslySetInnerHTML`, presets are our own components, no third party script loads on `/web` (analytics is off there, `app/components/Analytics.js`). The refresh token in IndexedDB is readable by script on the page, like a `localStorage` token and like any non HttpOnly cookie: an XSS on `/web` could take it, and a rotated token that is used twice ends every session, so a stolen copy shows itself on the next refresh. A nonce policy (a middleware, dynamic pages) is a follow-up for YUI-250's sweep.
- **Refresh across tabs (as built)**: one refresh at a time. A tab takes a Web Lock (`yui-web-refresh`) and, inside it, reads the stored token (another tab may have rotated it, and a sign out in another tab may have removed it). When the stored record is newer than the moment the tab started to wait, a peer just refreshed: the tab waits up to 300 ms for the peer's fresh access token on the `BroadcastChannel` instead of spending the refresh token again. Otherwise it refreshes, stores the new refresh token, and posts the new access token to the other tabs. A browser without Web Locks skips the lock and relies on `yui-auth`'s two minute reuse grace (YUI-239) for the rare double spend. The tests are `site/lib/web/auth.test.mjs` (a fake server that ends every session on a double spend, four tabs, five rounds) and `site/e2e/web/signin.test.mjs` (two real tabs opened at once). Code: `site/lib/web/auth.mjs`.
- **Sign in CSRF (as built)**: `state` and the nonce are made per attempt, ahead of the tap (Apple's popup must open straight from the click), and kept in the page's memory, not `sessionStorage`; the result is accepted only if the `state` matches, and the raw nonce goes to `yui-auth`, which compares it with the token's hashed one. Apple JS runs in popup mode, so `/web/auth/apple` (a route that answers a GET and Apple's form POST) is the registered return URL and nothing else.
- **Sign out** calls the `sign_out` grant for this refresh token, clears IndexedDB and the in-memory token, and tells the other tabs of this browser (they share the session). It ends this session only. Session rows carry `client` (`app` or `web`, migration `20261001120000_yui_sessions_client.sql`; a web sign in is told by the token's audience, the web Services ID, a refresh keeps its parent's client), so the phone's sessions are never touched.
- **CORS**: the edge functions the web calls (`yui-auth`, `yui-agents`, `yui-native`, `yui-push`, `yui-account`, `yui-delete`, `yui-connect`, `yui-vault`) answer `Access-Control-Allow-Origin` for `https://www.yuigui.com` and the yui project's Vercel previews only, with `Authorization` allowed and no credentials mode. Built as `supabase/functions/_shared/cors.ts` (`withCors`, wrapped round every one of the eight handlers; a request with no `Origin`, the app and the plugins, passes through unchanged; a preflight from any other origin is a 403). Previews match `yui-<hash or git-branch>-cjohndesigns-projects.vercel.app`.
- **Invites gate it the same way**: an account the phone could not open, the browser cannot open.

### Reuse (nothing is redrawn)

- Parse: `site/lib/yl/yl.mjs` (`parse`, `StreamParser`, `lastingIds`, `onStage`), plus `chunks.mjs`, `pages` in `site/lib/chat/pages.mjs`, `motion.mjs`, `look.mjs`, `readtext.mjs`, `flow-run.mjs`, `map.mjs`, `shapes.mjs`, `diagram.mjs`, `tables.mjs`, `visual.mjs`.
- Draw: `Render` from `site/app/playground/presets.js` and the files beside it (`stage.js`, `stagefirst.js`, `stagemotion.js`, `flows.js`, `timeline.js`, `science.js`, `games.js`, `music/engine.js`, `music/keep.js`, `visualizer.js`, `dragdown.js`). The Telegram Mini App `site/app/tg/TgApp.js` is the nearest pattern, and the site's own chat (`site/app/components/ChatFab.js`, `ChatStage.js`, `ChatPages.js`) already runs the stage, the pages and the day dividers (`site/lib/chat/when.mjs`) for a visitor.
- Wire: `mcp-app/src/events.mjs` (`eventLine`, `echoFor`, `relays`). A tap produces the same `[yui] ...` row the phone sends, byte for byte, checked against the playground's wire log.
- New, because no site code does it: the relay client (REST, Realtime, ordering, dedupe), the session, the outbox, the account screens, the drawer and the agent management screens.
- After any change to `mcp-app/src/events.mjs`, the playground presets or `site/lib/yl`: rebuild the MCP app and run the syncs the yui-project skill names (`sync_mcp_app.py`, `sync_yl.py`), or the yui CI job goes red.

### The e2e harness

- **Playwright** in `site/e2e/web/`, in the style of `site/scripts/layer-e2e.mjs` (`BASE`, `PLAYWRIGHT`, `SHOTS`; light and dark at 390 px and at desktop).
- **Demo mode is a fake relay in the page**: `/web?demo=<sample>` and a recorded thread in `site/app/web/fixtures/`, no sign in, no network. CI runs on this mode only, on every site build. It is the web twin of the app's `-yuiDemoAccount`, and it is the only thing that touches a person's screen in a test run.
- **Never Chris's real thread.** A live smoke run uses a dedicated test user (an `@example.com` account with its own test agent) whose `yui_sessions` row is made server-side, injected through `WEB_E2E_REFRESH_TOKEN`, the same trick the simulator runs use (`-yuiRefreshToken`). It runs by hand and on request, never in CI, never on a real account, and never spends the same refresh token twice in parallel.
- **Real-path traps the demo hides**: the app's demo account once masked a crash on the real path. So each story that adds a live call also adds one live smoke step, and the demo fixture is checked against the real row shape in `spec/RELAY.md`.
- Proof per story: shots at 390 px and desktop, light and dark, in `~/.hermes/kanban/artifacts/<card id>/`.

### Where the work lives

`site/app/web/` (the client), `site/lib/web/` (the relay client, session, outbox), `spec/BROWSER.md` and `docs/specs/browser.md` (the spec), this file, and `~/dev/yui/supabase/functions` (CORS, the web audience, Web Push). Edge function changes: redeploy `yui-native`, `yui-agents` and `yui-mcp` first when `_native` changes.

The separate repo `postscarcityai/yui-web` (opened Sep 27 as a place for outside contributors, still only its README and the conformance copy) is not where the client is built: this epic builds it in the hub, so the renderer, the stage and the e2e harness are one checkout and one Vercel deploy. `yui-web` stays an entry point; its README should point at this map (a follow-up, not part of YUI-240).

## 11. Open questions, with the answer the map takes

| Question | Taken answer | Where it can change |
| --- | --- | --- |
| Keys on the web (the app keeps them in the keychain) | Sealed to the hosted connector and handed to `yui-vault`; the page keeps only a handle. "Add it on your iPhone" where the browser cannot seal or verify. | 247. If it changes where keys live, it is a 🔴 ask to Chris. |
| A Services ID is an Apple developer site step | Story 241 builds everything else first and blocks with an ASK naming the clicks for Chris | 241 |
| iPhone Safari Web Push | Only for a web app added to the home screen; the app stays the way to get Yui on a phone | 248 |
| What "one to one" means where the browser lacks a feature | The row says `web way` or `iPhone` and the web names it in one line | each story |
