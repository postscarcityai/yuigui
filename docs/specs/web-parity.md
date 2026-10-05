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
| Face ID on keys (`Vault/VaultStore.swift`, LocalAuthentication) | No biometric prompt for pages | web way: every add, replace, remove and grant asks first in Yui's own sheet (an explicit tap). A page cannot ask for Face ID, and a passkey check would need a credential store on the server; neither was built. The key never sits in the browser, so there is nothing for a biometric to unlock | 247 | done |
| APNs push (`Push/Push.swift`) | Different protocol | Web Push with VAPID through `yui-push`. A reply read on one device clears the others where the platform allows. | 248 |
| Live Activity and Dynamic Island (`Presets/LiveTimer.swift`, `YuiWidgets/TimerLiveActivity.swift`) | iOS only | Done (246): the timer counts the time that really passed between two looks, so a background tab lands where the clock says, across every phase it missed (`lib/web/timer-clock.mjs`). The tab title shows the time left and the round while it runs, a screen Wake Lock keeps the phone awake, and the rest between workout sets rings on the wall clock. A closed tab stops the timer; there is no lock-screen pill and no favicon countdown. | 246 |
| Home and lock screen widgets (`YuiWidgets/YuiWidgets.swift`) | iOS only | iPhone. The saved screens a widget would show are on the shelf and pinned rows in the web drawer. | 248 |
| Siri, Shortcuts, Action button (spec/WIDGETS.md, not shipped in the app yet) | iOS only | iPhone. Nothing in the app today either. | none |
| Home screen quick actions (`Agents/QuickActions.swift`) | iOS only | The same `menu shortcut` rows, as the agent's chips and a command palette (Cmd/Ctrl+K) in the web. | 245 |
| `yui://` deep links, Universal links (`Push/Push.swift`) | The app owns the scheme | `/web/agent/<id>` and `/web/agent/<id>/chat/<chat>` routes, and a notification click opens them. `yui://` links in screens become "Open on your iPhone" unless the person is on the web already, when they route inside it. | 242, 248 |
| Speech recognition (`Chat/PushToTalk.swift`, `Chat/HandsFree.swift`, `Presets/MicPreset.swift`, Speech framework) | Web Speech API exists only in Chromium and Safari, with different quality | The Web Speech API for the words (shown as heard, sent as text, the app's own rule: voice in, text out), `getUserMedia` and an `AnalyserNode` for the waveform. No `MediaRecorder` and no audio upload: the app uploads none either, so there is no transcript path to share, and nothing would read it. Typing is the way in where the API is missing (Firefox), and the field says so. Built in `lib/web/voice.mjs`, `handsfree.mjs` and `app/web/useVoice.js` (YUI-244). | 244 |
| Camera and photo library (`Chat/Attachments.swift`, `Chat/SnapSay.swift`, `Presets/MediaPresets.swift`) | No library; permission per site | A file picker (a phone's offers the camera and the library), drag and drop and paste, in the composer. Every photo is shrunk to 2048 px and sent as JPEG like the app's. The in-page camera preview is the `camera` preset (246). | 244, 246 |
| MIDI over USB and Bluetooth (`Presets/MIDIFeed.swift`, `Presets/MusicTake.swift`) | Web MIDI is Chromium only; no MIDI clock out on Safari | Done (246): Web MIDI in plays the keys where the browser has it (a chip names the keyboard, `lib/music/midi-in.mjs`); the computer keyboard plays them too (A to ; are the white keys, W to P the black). Record sends the take as `.m4a` (`.webm` where the browser cannot write AAC) and `.mid` (MediaRecorder and `lib/music/take.mjs`, the same writer as the app). Safari has no Web MIDI: the keys play with a finger or the keyboard, and the MIDI chip never shows. MIDI clock out is not sent (see the row below). | 246 |
| Metal shaders for the visual (`Stage/Visual.metal`, `Stage/StageVisual.swift`) | No Metal | WebGL fragment shaders from the same plan (spec/VISUAL.md); `site/app/playground/visualizer.js` and `shaderlook.js` already draw it. 2D canvas below a budget, a still above it when reduced motion is on. | 243 |
| Local notifications for reminders (`Presets/Reminders.swift`) | A closed tab cannot fire one | Done while the tab is open (246, `lib/web/reminders.mjs`): the same `meta.native.reminders` set, replaced by each newer reply and never undone by an older one, fires through the Notifications API at its time with the agent's name; permission is asked once, on the first live reply that carries a reminder. Closed tab: Web Push for the same set needs a scheduler in `yui-push`, which 248 did not build; it is its own backlog card. | 246, 248 |
| Share sheet (`Chat/ReactionViews.swift`, `Presets/Pages.swift`) | No system sheet on desktop | Web Share API where it exists, else copy link. | 242 |
| MetricKit and speed reports (`Perf/`) | iOS only | The same seven intervals from `performance.mark`, sent as `yui_perf` with `client=web`. Dev switch only, as in the app. | 250 |
| On-device model (spec/ON-DEVICE.md, Apple Foundation Models) | iOS only | iPhone. Nothing leaves the phone; the web does not run it. | none |
| Feedback mail (`Account/YuiBackend.swift` feedbackMail) | TestFlight button | web way: Settings > Help and feedback: a text box and "Email us", a mail draft that already names the web build and the guide (the app's own Email us). There is no web path into the TestFlight feedback card watcher, so a note reaches the board when someone reads the mail | 247 | done |

## 2. Account and session

| Feature | App file | Web twin | Story | Status |
| --- | --- | --- | --- | --- |
| Sign in with Apple (nonce, identity token, `yui-auth` apple grant) | `Account/Account.swift`, `Account/SignInView.swift` | web way: Sign in with Apple JS in a popup, `sha256(nonce)` to Apple, raw nonce to `yui-auth`, a web Services ID (`yuigui`, as registered at Apple) as a second audience, sessions marked `client=web`. Live once the Services ID exists at Apple (a browser step). | 241 | done |
| Session (userID, access token, refresh token, expiry) | `Account/Account.swift` | web way: access token in memory, refresh token in IndexedDB (section 4) | 241 | done |
| One refresh in flight (a refresh token spent twice ends every session) | `Account/Account.swift` | web way: Web Locks plus BroadcastChannel across tabs | 241 | done |
| Invite code, claim after sign in | `Account/SignInView.swift`, `Account/Account.swift` | same: `/i/<code>` hands to `/web`, claim grant after sign in | 241 | done |
| App Review code path | `Account/Account.swift` (review grant) | same: the `review` grant, for demo access on the site | 241 | done |
| Sign out (revokes the session) | `Account/Account.swift` | same: `sign_out` grant, clears IndexedDB, ends only this session; the button is in Settings > Account (and the drawer's foot), and it clears the outbox like the app | 247 | done |
| Delete account | `Account/Account.swift`, `supabase/functions/yui-delete` | same: Settings > Account > Delete account asks first with the app's words (account, paired agents and devices, every stored message, removed from your Apple ID, can't be undone), then `yui-delete` (it revokes the Apple token of the web Services ID too), then this browser forgets the session in every tab. A refusal or no network leaves you signed in and says nothing was removed | 247 | done |
| First run, pick your crew (Arnold, Basil, Gouda, Penny, Quill, bring your own) | `Agents/CrewPick.swift` | same: the same flow on full screens. Built in `app/web/CrewPick.js` and `lib/web/crewpick.mjs`: Yui is always on the crew, one tap and an info page per starter, Bring my own agent leads into pairing, one button saves the pick (`crew_choose`) so it never comes back. e2e: `site/e2e/web/restyle.test.mjs` | 245, 250 | done |
| Build info (version, build, commit, guide) | `Account/BuildInfo.swift` | web way: Settings > About this build: the web build's commit and date (Vercel's commit, else the local checkout; a plain local build says so), the channel guide version the site carries, and the browser. Tap to copy | 247 | done |
| Backend host, publishable key | `Account/YuiBackend.swift` | same: the same project (yuigui), same anon key; CORS answers for the web origin | 241 | done |

## 3. The thread

| Feature | App file | Web twin | Story | Status |
| --- | --- | --- | --- | --- |
| One thread per agent over the relay (`yui_messages`, REST plus Realtime, ordering, dedupe) | `Chat/Thread.swift`, `Presets/ChatStore.swift` | same: `lib/web/relay.mjs` and `sync.mjs`, the same query, ordering, 10 s overlap and dedupe, an outbox, Realtime as a faster path. Built and proved on the demo relay, then live on Oct 1 (YUI-250): `site/e2e/web/live/web_composer_live.py` ran the web client's own relay, thread, sync and outbox against a throwaway real account and the real Yui platform adapter, 18 of 18 checks (words, a reaction copied onto the agent's message, a reply with its quote, a photo to the private bucket and back, a resent row id is one row, the account deleted after) | 242, 250 | done |
| Chats: several conversations per agent, New chat, titles, rename, delete | `Chat/Chats.swift`, `Agents/DrawerChats.swift` | same: `lib/web/chats.mjs` is the app's `Chats` ported (titles, last lines, `when`, order, merge, search past ten, the only chat is cleared not deleted, the server's refusals in plain words). A chat is `/web/agent/<id>/chat/<chat>`; the thread opens on the newest. Rename and Delete sit behind the row's button (the app's hold and swipe have no mouse twin); New chat is a draft until a word is said, then the outbox makes the chat first. The server gates a second chat on the account's newest phone build (`chats_min_build`, 320 today) | 245 | done |
| Text bubbles, agent bubble shapes and colors, the agent's look | `Chat/ReactionViews.swift`, `Theme/AgentLook.swift` | same: the look's accent from `look.mjs` (bubble shapes per look: 247) | 242 | done |
| Markdown in agent words | `Chat/BubbleMarkdown.swift` | same: `marked`, sanitized | 242 | done |
| The trash in the composer sits flush left, mirroring the mic (YUI-251) | `Chat/Composer.swift`, `Chat/PushToTalk.swift` | same: `ys-trash` is the bar's left control while listening, the mic its right; the slide-left reach is the bar's width (`trashReach`). e2e `oct1-catchup.test.mjs` | 268 | done |
| Tune up goes straight to the Tuner, Gouda's last screen (YUI-252) | `Stage/StageHome.swift` (`show=` shortcuts) | already at parity, no code: a `shortcut` with `show=tuner` reopens that screen with no message sent. A Gouda fixture (`?demo=gouda`) and an e2e step prove it | 268 | done |
| Past chats list in the drawer on a real account, older ones on scroll (YUI-254) | `Agents/DrawerChats.swift` | same: `DrawerChats.js` lists them from `chats.mjs`; the relay's `fetchRows` takes `before`, and `ThreadSync.loadOlder` brings the next 100 rows in when the drawn ones run out | 268 | done |
| A push click lands on the reply it names; a reply that lands on the home comes up full screen (YUI-262) | `Push/Push.swift` (app commit 3a2c90e) | same: `?m=<message id>` is read once and taken off the address, the stage waits up to 8 s for that row (`isRow` accepts `<id>#<part>`), then plays it; something the agent says unprompted while the stage is on the home comes up full screen (`arrivalOf`). Unit tests in `stage.test.mjs`, e2e in `oct1-catchup.test.mjs` | 268 | done |
| A long chat scrolls back past the newest 100 rows, older ones fetched from the server (YUI-269) | `Chat/Thread.swift` `fetchOlder`, `Presets/ChatStore.swift` `loadOlder` | same: `relay.mjs` `threadQuery` adds `created_at=lt.<oldest>` with `limit 100`, `ThreadSync.loadOlder` asks when every held row is drawn and the top is near, `Thread.addOlder` puts the rows in front and leaves reactions, pages, the stage and the shelf alone. e2e `scrollback.test.mjs`: a 250-row demo chat scrolls back to row 1, no row twice, the reader moves under 1 px, the stage and shelf text are unchanged | 269 | done |
| A long chat draws older rows in batches as you scroll back (YUI-260) | `Chat/Thread.swift` (app commit ed89812) | same: the thread draws its newest 60 rows (`WINDOW_STEP`) and one older batch per arrival at the top, anchored so the reader stays put | 268 | done |
| Long answers fold | `Chat/LongText.swift` | same: fold past 60 words, "Read it all" in place (`lib/web/thread.mjs`); the deck "Read as pages" comes with the stage (243) | 242 | done |
| Reading text style (headline or one liner, body) | `Theme/ReadingText.swift` | same: `readtext.mjs` | 242 | done |
| Sent times and day dividers | `Chat/SentTimes.swift` | same: `site/lib/chat/when.mjs` | 242 | done |
| A reply in Yui Lines drawn as presets, not a bubble | `Presets/PresetViews.swift`, `Presets/YLScreen.swift` | same: `Render` from `presets.js` | 242 | done |
| Taps send the same `[yui] ...` event rows; changed answers too | `Presets/ChatStore.swift` | same: `eventLine`, `echoFor`, `relays` from `mcp-app/src/events.mjs`, byte for byte | 242 | done |
| Patches (`~id`), lasting ids, `known` | `Presets/ChatStore.swift` lastingIds | same: `lastingIds(state)` in `yl.mjs` | 242 | done |
| Presence (`yui_agent_list.presence`), paused, handoff | `Agents/AgentStore.swift`, `Agents/GatewayWait.swift` | same. Proved in `site/e2e/web/agents.test.mjs` (honest words on every row, Paused by its owner) | 242, 250 | done |
| Working row (`doing`), Stop | `ChatView.swift`, `Chat/Thread.swift` | same: `site/lib/chat/stop.mjs`, `stage.mjs` | 242 | done |
| Reply to one message | `Chat/Reply.swift` | same: hold (touch) or right-click, or the button on a focused bubble; the `[yui] reply ...` line and `meta.reply_to`, byte for byte (`lib/web/compose.mjs`); a sent reply wears the quote chip, a tap goes back to the message | 244 | done |
| Reactions (six) | `Chat/Reactions.swift`, `Chat/ReactionViews.swift` | same: the hold menu, the six in `spec/REACTIONS.md` (a test reads the table), `[yui] react ...` with `meta.react`, one per message, the same again takes it back, the badge at once and on reload (`yui_messages.reaction`). Your own messages take none | 244 | done |
| @mention other agents | `Chat/Mentions.swift` | same: `@` suggests the other agents with their presence, "Goes to Penny" over the field, `[yui] mention to=<handle>` and `meta.mention`, the answer comes back with the agent's name and "Open its thread" | 244 | done |
| Slash commands and suggestions | `Chat/Suggestions.swift` | same: the popover over the composer, arrow keys, Enter or Tab, Escape; the agent's own `/commands` from its host | 244 | done |
| Photos and files in a message | `Chat/Attachments.swift`, `Chat/Media.swift`, `Chat/Pictures.swift` | web way: picker, drag and drop, paste (up to 12); the same `yui-media` upload under `<user>/<agent>/user/<uuid>.jpg`, one text row with `meta.photos`, the host hands them to the agent as media. The bucket takes pictures and mp4 or mov only and the app attaches photos only, so another kind of file is refused with a line saying so | 244 | done |
| Hold to talk, waveform, slide to cancel | `Chat/PushToTalk.swift`, `Chat/TalkWaveform.swift` | web way: hold the mic button (touch or mouse), slide left to cancel, let go to send; a waveform and the words as heard. A keyboard cannot hold, so Enter or Space on the mic is a tap | 244 | done |
| Hands free | `Chat/HandsFree.swift` | same rules (`lib/web/handsfree.mjs`, the app's state machine and tests ported): tap once, a 0.7 s quiet sends, the reply lands, a beat, it opens again; 30 s of quiet pauses it. A tap per page load: the browser asks for the mic once | 244 | done |
| Snap and say | `Chat/SnapSay.swift` | web way: pick or take a photo, then say or type, one message (the tray is over the field). The live camera preview is the `camera` preset (246) | 244 | done |
| Talk about this | `Chat/TalkAbout.swift` | same: the button on a Controls item puts it on the composer as a chip (`[yui] attach section= id= rev=` first, `meta.about`, the bubble says "About SOUL.md"); x takes it off, it stays for the whole talk, another agent drops it. Sent from the record's composer | 245 | done |
| Chat with a screen (`>N talk`, `[yui] screen=N`) | `Chat/ScreenTalk.swift` | same. Proved in `site/e2e/web/sweep.test.mjs`: a page that keeps talking sends `[yui] screen=2` then the words | 243, 250 | done |
| Outbox (kept until the server has it; a 409 resend counts as sent) | `Chat/Outbox.swift` | web way: IndexedDB (`lib/web/outbox.mjs`), the app's rules: written before the first try, oldest first, the row id is the primary key, 1 s to 30 s backoff, a refusal that never passes is dropped. A photo's bytes wait in it too. Several tabs: one Web Lock flusher and every pass re-reads the disk, so a row goes out once. Survives a closed tab and a killed browser | 244 | done |
| Typing stays fast (draft kept off the thread view) | `Chat/Composer.swift` | same: the words live in a store (`lib/web/composer.mjs`) only the field reads, kept per agent in `localStorage`, never a pasted key | 244 | done |
| Draft shared between devices | `Chat/Composer.swift` Drafts, `Account/SyncState.swift` | same, new on both: the half-typed words of a thread ride `yui_sync_state` (`draft`, one row per person and agent, the server stamps the time). The phone and the browser poll every 5 s while open and on focus; a newer remote value wins unless words here are waiting to go up; sending clears both; a pasted key is never sent. `lib/web/state.mjs`, `app/web/ThreadView.js`; live check `site/e2e/web/live/web_sync_live.py` | 249 | done |
| Mixed chat plus cards inside one reply | `Presets/PresetViews.swift` | same. Proved in `site/e2e/web/sweep.test.mjs` | 242, 250 | done |
| `theme app` restyle card (Use or keep) | `Chat/RestyleCard.swift` | same: `app/web/RestyleOffer.js` draws it on the thread, Now beside the offered look in light or dark, then Use or Keep mine; Use wears the look through Settings > Look's own save (`takeOffer`), one line and Undo after, the outcome kept per reply in this browser, and the agent hears `[yui] restyle theme choice=apply scope=app name=<set>` like the app's tap. e2e: `site/e2e/web/restyle.test.mjs` | 247, 250 | done |

## 4. The stage, pages and home

| Feature | App file | Web twin | Story | Status |
| --- | --- | --- | --- | --- |
| Stage first: first send opens the stage, reply plays as chunks, questions last under one Send | `Stage/StageFirst.swift`, `Stage/StageChunks.swift` | same: `chunks.mjs`, `stagefirst.js` | 243 | done |
| The chat is the record, a chunk chip reopens the stage there | `Stage/StageFirst.swift` | same | 243 | done |
| `>full` as a full-window layer, close returns to chat | `Presets/Stage.swift` | same: a layer over the chat window (the whole window on a phone, the chat column beside the agent list on a computer); the browser's own full screen behind a button | 243 | done |
| Components that open on the stage by themselves (`timer`, `camera`, `mic`, `deck`, `plan`, `game`, row3d gallery) | `Presets/Stage.swift` | same: `onStage` in `yl.mjs`; a new answer opens it by itself, history waits as a pill | 243 | done |
| A way home (X, Back home, pull down 110 points) | `Presets/FullScreenExit.swift` | same: `dragdown.js` (`useDragDown`), the X, Esc | 243 | done |
| Stage motion (the mark breathes, thinking, speaking) | `Stage/StageMotion.swift` | same: `stagemotion.js`; `prefers-reduced-motion` swaps motion for fades | 243 | done |
| The visual and what it hears | `Stage/StageVisual.swift`, `Stage/VisualPlan.swift`, `Stage/VisualSound.swift`, `Stage/VisualDefault.swift` | web way: WebGL, `AnalyserNode` for sound, the same plan and budget. Drawn behind the stage and proved in `site/e2e/web/shader.test.mjs` (a WebGL canvas that fills the stage and moves, still under Reduce Motion) | 243, 250 | done |
| Pages 2 to 12: swipe, arrow keys, dots, kept across replies | `Presets/Pages.swift` | same: `pages.mjs`. Proved in `site/e2e/web/stage.test.mjs` (pills, arrow keys, a swipe back) | 243, 250 | done |
| Agent home: shortcut chips, review rows, show saved screen; Dismiss and Not yet on a Needs you row (`need-<task id>`) (YUI-265, YUI-270) | `Stage/StageHome.swift`, `Agents/AgentDrawer.swift`, `ChatStore.dismissMenu` | same: the stage home and the drawer Review list draw Not yet and Dismiss under a host ask. Dismiss sends the quiet `[yui] need-<id> menu bucket=review dismissed` (no echo, no agent turn, `ThreadSync.tap`), Not yet sends the ask screen's own `choose choice="Not yet"`; the row leaves at once and stays off after a refresh (`dismissed.mjs`, `homeOf` hides it until the host draws it again after the tap, so a new block brings it back). The host writes ASK-CLOSED or ASK-SNOOZED (7 days), so the phone drops it too. Unit tests in `stage.test.mjs`, e2e `dismiss.test.mjs` | 270 | done |
| Top bar (settings, agent picker, chat record with new count) | `Stage/TopBar.swift` | same | 243 | done |
| Menu button names the agent: one pill, menu icon left, the agent's name right, the whole pill opens the drawer; a long name truncates (TestFlight note, t_deedc5bc) | `Stage/TopBar.swift` | same: `.wb-stage-menu` in `StageLayer.js`, on a phone width. Proved in `site/e2e/web/menu-pill.test.mjs` | 266 | done |
| No end screen while a reply is coming ("Anything else?" waits for the turn to be over) (TestFlight note, t_043d8bb2) | `Stage/StageHome.swift` | same: the home line shows only when the played turn is the person's newest and nothing is in flight. Proved in `site/e2e/web/menu-pill.test.mjs` | 266 | done |
| Bottom bar (big mic, T, +; settings toggle each) | `Stage/BottomBar.swift` | same: mic (hold or tap), text field, attach, with the tray, reply and mention bars over it | 243, 244 | done |
| Tap the left third of a full-screen page to go back (YUI-288), t_46418aa4 | the app's page tap (TestFlight note) | same: on a stage page the left third goes back one page (nothing on page 1), the rest goes on (nothing on the last); buttons, options, fields, mics, links, sliders and a text selection keep their tap. Left and right arrows do the same on a computer. The zone rule is `lib/web/tapzone.mjs` (`tapzone.test.mjs`), e2e `site/e2e/web/pagetap.test.mjs` | 288 | done |
| Story pages full screen | `Presets/StoryPage.swift` | same. Proved in `site/e2e/web/stage.test.mjs` and the 390 px shots under /progress | 243, 250 | done |
| Time under the stage answer (Yesterday 9:41 PM) | `Stage/StageFirst.swift` | same: `stageTime` in `when.mjs`. Unit-tested in `site/lib/chat/when.test.mjs` | 243, 250 | done |
| Sound keeps playing across screens | `Presets/MusicPresets.swift` | same: `music/keep.js`; the thread provides the keep scope, so a loop, metronome or latched chord that loses its screen parks its voice and takes it back, and it stops when the person leaves the thread or the page goes | 246 | done |
| A saved screen opens with no turn | `Presets/Shelf.swift` | same: zero requests (site/scripts/layer-e2e.mjs). Proved in `site/e2e/web/presets.test.mjs` (the shelf opens a screen and sends nothing) | 243, 246 | done |
| Saved screens and the shelf (`save`, `show`, `forget`) | `Presets/Shelf.swift` | same: shelf chips at the top of the thread (`lib/web/shelf.mjs`, `ShelfBar.js`), newest save first, a tap reopens the screen on the stage with no turn, a long press (or a right click, or Delete on the focused chip) offers Remove. Removed names stay off on this device until the agent saves them again | 246 | done |

## 5. Agents and the drawer

| Feature | App file | Web twin | Story | Status |
| --- | --- | --- | --- | --- |
| Your agents, honest presence, pick one | `AgentsView.swift`, `Agents/AgentStore.swift` | same: the bar at the drawer's foot opens the list (the app's Switcher); presence words straight from the heartbeat; the check on the open one; order with Edit list; polled every 15 s | 242, 245 | done |
| The agent drawer: Chats, Menu (review, backlog, shortcut rows), About | `Agents/AgentDrawer.swift`, `Agents/AgentMenu.swift` | same: Home (Chats, Next up, Backlog, Screens, Shortcuts and the host's commands), Review, Agent (who it is, three things to ask it, where it runs). `menu` lines draw nothing in the chat; a tap sends the same bucket line the phone sends (`[yui] swap menu bucket=review tapped`). A column on a computer, a drawer at 390 px | 245 | done |
| Quiet drawer: no New chat button, no Add an agent bar (TestFlight notes t_8097918c, t_ad8b0e43) | `Agents/DrawerChats.swift`, `Agents/AgentDrawer.swift`, `ChatView.swift` (the pen on a page) | same: the drawer is the chats list and nothing above it. New chat is the pen in the stage top bar and in the chat header (`new-chat`, `head-new-chat`), same draft rule. "+ Add an agent" is the last, quiet row of the agents list (the foot bar opens it), same action; the no-agents empty state keeps its own Add agent. Proved in `site/e2e/web/agents.test.mjs` | 287 | done |
| Add an agent (pairing code, from the host, by asking an agent) | `AgentsView.swift`, `Agents/GatewayWait.swift` | same: the crew one tap each, or a name and a look, a six digit code with its ten minute clock, the one command to paste with Copy, "Get a new code" when it runs out, "Still waiting?" after 150 s; paired: the restart step with the profile's command, a minute of waiting, then an honest "Still nothing" and Try again; connected: Say hi. Proved against the live backend (`e2e/web/live/web_agents_live.py`) | 245 | done |
| Rename, remove (with the app's confirm) | `AgentsView.swift`, `Agents/AgentStore.swift` | same: Edit agent has name, look, notifications, Make default, Get a pairing code (a pending one), Remove with the app's words ("This deletes your whole conversation with Penny. The agent itself keeps running on your computer."). The phone-local "Start with typing or talking" and the visualizer switch are 247 | 245 | done |
| Connect approval (an MCP client asks through OAuth) | `Agents/ConnectApproval.swift` | same: `/connect/<id>` offers "Approve in Yui on the web" (a new tab on `/web/connect/<id>`, so the sign in page keeps polling and sends the client on); the choice of a new agent or one it already had, Allow, Don't allow, and the app's four endings | 245 | done |
| Group threads (hop lines, notes, loop guard) | `Groups/GroupViews.swift`, `Groups/GroupThreadView.swift`, `Groups/GroupClient.swift` (spec/GROUPS.md, YUI-94) | same: Groups in the agent list with stacked faces and the lead's crown, New group (two or more agents, a name, the lead), the thread (bubbles in each sender's look, @ suggests members and fills `meta.group.to`, a reply goes to its author, a tap on a screen to its sender, handoff row, guard row with Let it and Stop here, status lines, a working row per agent with Stop), Make lead from a face; errors in the app's words; `/web/group/<id>`; `?demo=penny` has a marked sample. Group settings sheet (gear in the header): name, max hops 1 to 5, make lead, add, leave, archive after a confirm; the same writes on the group row as the app | 162, 263 | done |
| Controls: personality, memory, skills, schedules, with Edit and ask-before-delete | `Agents/Controls.swift`, `Agents/ControlsViews.swift` | same: all six areas over the relay (`kind = control` rows, the host answers in 5 s), revs and the conflict screen, drafts that survive a closed tab, every delete asks, Controls greyed out while the computer is not online. The native agent's "Runs on" key pick is 247 (keys) | 245 | done |
| Shared agents (Hi Maya, Shared by Sam, Paused by its owner, a revoke closes the thread) | `Agents/AgentStore.swift` | same: the greeting, the footer, From Sam, a shared agent's sheet has only notifications, no Remove, no Controls, no Add agent on an invited account; a revoke says "X is no longer shared with you." and closes the thread | 245 | done |
| Safe to share indicator | `Agents/AgentStore.swift` | same: "Safe to share" or "Not safe to share: it has a shell on your computer" in Edit agent | 245 | done |
| Home screen quick actions | `Agents/QuickActions.swift` | web way: a command palette (Cmd or Ctrl + K, and a button in the drawer): every agent's `menu shortcut` rows (read from their rows), what you use leads, a jump to any agent, New chat, Add an agent, Edit, Controls areas, the look | 245 | done |
| Starter crew and the native Yui in the browser | `Agents/CrewPick.swift`, spec/NATIVE.md | same: the crew in Add agent (one tap each, Add all). The native agents answer through the relay like any agent, so the thread needs no code of its own | 245 | done |
| Your $U in the drawer, and the Your U screen | `Earn/EarnStore.swift`, `Earn/YourU.swift`, `Earn/UCoin.swift`, `Agents/AgentDrawer.swift` | same: your picture and name top left (a tap opens Settings), the U coin and your number top right (`app/web/YourU.js`, `lib/web/earn.mjs`). It reads `yui_my_u` and your own `yui_ledger` rows with your session (RLS, no service key in the browser), counts up once when the number grew since this browser last showed it (localStorage; not under reduced motion), and a tap on the number opens Your U: today against the cap, streak, speed, the days, what you helped build, how it adds up. The demo and `?demo=penny` show a sample marked as a sample, never a balance | 245 | done |

## 6. Settings and account

| Feature | App file | Web twin | Story | Status |
| --- | --- | --- | --- | --- |
| Appearance (system, light, dark) | `SettingsView.swift` | same: System follows `prefers-color-scheme` and changes with it, Light and Dark override, kept in `yui-web-appearance` (and the site's `yui-theme`); a link's `?theme=` wins until you pick one | 247 | done |
| Stage first section (which of mic, T, + show) | `SettingsView.swift` | same: Answers on the full screen, Mic, T for typing, + to attach; one of the mic and T always stays; with the first off the chat is where answers land. Kept on this device | 247 | done |
| Home actions section | `SettingsView.swift` | web way: the command palette (Cmd or Ctrl + K) has no icon to hold, so Settings > Home actions picks and orders up to four of your agents' shortcuts; they lead the palette. Back to the default. Kept on this device | 247 | done |
| Look: Yui's own look and each agent's | `Theme/AppLook.swift`, `Theme/AppLookStore.swift`, `Theme/AgentLook.swift`, `Theme/YuiTheme.swift` | same: the account's look (`yui-account`) is read at load, named (Yui's own, a set's name, Your own mix), worn by the chrome through the site's tokens in light and dark, and written back on the tap only; "Agents keep their own looks" off makes every thread wear Yui's look; Back to Yui's look keeps one step to undo | 247 | done |
| Agent access (management tokens) | `SettingsView.swift`, spec/AGENTS.md | same: create (shown once, copy, never stored by the page), list with last used, revoke | 247 | done |
| Keys vault (fal, Replicate, ElevenLabs, Anthropic, OpenAI; caps; grants) | `Vault/*.swift`, `Vault/VaultViews.swift` | web way: no key stored in the browser, ever. A key is sealed to the hosted connector in the page (HPKE, DHKEM X25519, ChaCha20-Poly1305, the format of `Vault/VaultSeal.swift`, via `@hpke/*`, loaded when you first add one), put on the relay as the app's `yui_vault_keys` row, and forgotten; the page keeps the last four. The list is what the relay holds sealed (keys added here, and keys the phone sealed when it made a grant); a key only on the iPhone stays there. Add, remove, grants (agent, what for, cap, once, the limit confirm for a provider without a price list), revoke, this month's spend, the lapse note | 247 | done |
| Vault ask sheet (an agent asks to use a key) | `Vault/VaultAskViews.swift` | same: Yui's own sheet over the app, from the host's `key_ask` control row (looked for every 8 s in the open thread, the same query as the app), never an agent's screen. Allow, Allow once, Don't allow answer with the `key_answer` row; a key-shaped or long reason is refused and answered no; a shared agent is answered no. No key for the provider: add one in the sheet | 247 | done |
| Your model key | `ModelKeyForm.swift`, `Account/Account.swift` | same as the app: the key goes once to `yui-native` over the session, which checks it with the provider and keeps it in Vault server-side; the page shows only the last four. The app does not keep it in the keychain either, so no change in where keys live | 247 | done |
| Web search key (Firecrawl) | `SettingsView.swift` | same as the app: `yui-native` `search_key_set`, free searches left, last four, Remove | 247 | done |
| Help and feedback | `SettingsView.swift`, `Account/YuiBackend.swift` | web way: Help and questions, Connect an agent, Privacy policy, and the feedback mail (see Feedback mail above) | 247 | done |
| About this build | `Account/BuildInfo.swift` | web way: see Build info above | 247 | done |
| Speed switch (dev builds only) | `Perf/*.swift` | web way: `?perf=1` shows the Speed switch in Settings (kept for this browser, `?perf=0` clears it); a person never sees it. The HUD (`app/web/PerfHud.js`, `lib/web/perf.mjs`) shows frames per second, the worst frame and the paint timings | 247, 250 | done |
| Invites (requests, approve, template) | spec/AGENTS.md, `supabase/scripts/invite.py` | same as the app: there is no invite screen in the app; the owner invites by asking Yui (spec/AGENTS.md, "The owner's side"). The claim side is on the web since 241 (`/i/<code>`, the invite code field). No owner screen on the web either | 247 | done |

## 7. Presets (every one in spec/YL.md section 4)

Status `draws` means the playground draws the preset from a line today. The live story checks it behaves like the phone: taps, patches, stage, time.

| YL preset | App file | Web twin | Story | Status |
| --- | --- | --- | --- | --- |
| `timer` (rounds, rest, `+up`, beeps on the last 3 seconds) | `Presets/TimerPreset.swift`, `Presets/LiveTimer.swift` | web way: the same rules on a timestamp clock (`timer-clock.mjs`); tab-title countdown and a Wake Lock while it runs; no lock-screen pill | 246 | done |
| Workouts and Arnold's runner | `Presets/WorkoutRunner.swift` | web way: the same runner (`lib/web/runner.mjs` is `WorkoutRunner.swift` rule for rule: sets, Skip, reps and weight nudges, rest 10 to 600 s from the plan's words, +15s, "done" by voice where the browser has Web Speech). The rest rings on the wall clock in a background tab, a Wake Lock holds the screen, the place is kept per plan on this device. The answers go as the plan's one line | 246 | done |
| `ask`, `choose`, `pick`, `slide` | `Presets/PresetViews.swift` | same. `site/e2e/web/presets.test.mjs` walks every sample in /library.json: it renders, a tap goes up and the line sent is the app's wire format | 242 | done |
| `form` (fields, photo, voice, one Send inside a plan) | `Presets/FormPreset.swift` | same: photo is a file picker, voice is the mic button. `site/e2e/web/presets.test.mjs` walks every sample in /library.json: it renders, a tap goes up and the line sent is the app's wire format | 242 | done |
| Speak to fill a form; plan and form pages keep the mic, T and + (t_0ab09ee7, t_7d424132) | `Presets/VoiceFill.swift`, `Presets/PageVoice.swift`, `Presets/FormPreset.swift` | same: the stage's mic fills the form on show by field name (words with no name go to the first empty field, a choice by its option, a yes by yes or no), each filled field carries a small mic until edited, nothing is sent until Next. The mapper is one module, `lib/web/voicefill.mjs` (the app's rules, tests in `lib/web/voicefill.test.mjs`), and `lib/web/pagevoice.mjs` hands the stage's words to the page; the form also keeps a slim mic of its own. No Web Speech (Firefox): no mic, the fields are the way in. On the stage the thread under it no longer opens its own full-window layer over a staged plan, so the bar stays beside Back and Next. e2e `site/e2e/web/voicefill.test.mjs` (speech faked) | 283 | done |
| Half-filled answers on a plan, form or flow survive a reload (the app's questions screen keeps typed answers across a relaunch, t_7e89c333) | `Presets/FlowPresets.swift` kept answers | same, one more step on YUI-279: a plan, form or slider the agent did not name (`n3`, only its place in one reply) is kept under its message, so two replies never share answers (`lib/web/stagekeep.mjs`, per agent + message + component, on top of `lib/web/kept.mjs`). Typed fields, choose / ask / pick taps, a slider's place and the page you were on come back; a kept slider counts as answered where it was left; Send drops them all. A field named or typed as a key, password, code or PIN is never kept. Private mode or a full store fails quietly. Unit `lib/web/stagekeep.test.mjs`, e2e `site/e2e/web/stagekept.test.mjs` (a 3-page plan, light and dark, 390 and desktop: type, tap, reload, lands on the same page restored, Send, reload, clear) | 289 | done |
| Group threads talk: the bar has +, T and the mic; the group name fields have a small mic (t_76b0a0cf) | `Groups/GroupThreadView.swift`, `Groups/GroupViews.swift` | same: the group thread keeps the agent thread's bar. T opens the field (@ suggests the members as before), hold the mic and the words go to the group, to the lead or to the member the words @, and tap for hands-free; + picks photos, which go up first and ride on the row as `meta.photos`. Spoken words reuse `useVoice` and the composer store, no second composer. The new-group and group-settings name fields get a small mic (`FieldMic.js`) that fills through `lib/web/voicefill.mjs`. No Web Speech (Firefox): no mic and no T, the field and + stay, no broken button. e2e `site/e2e/web/groupvoice.test.mjs` (speech faked) | 284 | done |
| Naming and search fields get a small mic: the agent name (Add and Edit agent), the chat rename and past-chats search in the drawer, the quick actions palette (t_0f34cc0e) | `Agents/AddAgentView.swift`, `Chats/ChatRows.swift`, `Search/` | same: the shared `FieldMic.js` (also on the group names) fills the field through `lib/web/voicefill.mjs`; nothing saves or searches until the person confirms as today. No Web Speech (Firefox): no mic, the field stays. Key and secret fields (`SettingsKeys.js`) have no mic on purpose. e2e `site/e2e/web/fieldmic.test.mjs` (speech faked) | 285 | done |
| The feedback box gets the mic (YUI-286) | `SettingsView.swift` (Help and feedback) | same: the shared `FieldMic.js` sits beside the box in Settings, saying appends to what is there, and nothing is sent until the person taps Email us as today. No Web Speech (Firefox): no mic, the box stays. e2e `site/e2e/web/feedbackmic.test.mjs` (speech faked) | 286 | done |
| `list` (ticks kept on the device) | `Presets/ListTicks.swift` | same: ticks kept per agent and list id in the browser's storage (`lib/web/kept.mjs`), pruned when the agent draws the list again without an item | 246 | done |
| `table` (units, sort) | `Presets/SciencePresets.swift` | same (library walk renders and taps it) | 246 | done |
| Agent tables (`table create`, `put`, `query`, spec/TABLES.md) | not in the app yet | web way once the app has it: rows kept in IndexedDB, never leave the browser; a phone's rows reach the web only through the sync of YUI-249 once the app has the tables (the sync table takes `draft` and `shelf-removed` today). The app has no tables yet, so there is nothing to match: the web draws a `table` reply from the reply's own state today. The IndexedDB store waits for the app (its own backlog card) | 249 | n/a |
| `card` (links open a new tab) | `Presets/PresetViews.swift` | same. `site/e2e/web/presets.test.mjs` walks every sample in /library.json: it renders, a tap goes up and the line sent is the app's wire format | 242 | done |
| `image`, `image +edit` | `Presets/MediaPresets.swift` | web way: pointer events draw with a mouse, pen or finger | 246 | done |
| `camera` | `Presets/MediaPresets.swift` | web way: `getUserMedia`; with no camera or permission a file picker (a phone's offers the camera and the library). The photo is shrunk to 2048 px as JPEG, uploaded to the thread's media and sent as `{photo: path}` with the echo `Photo`, like the phone. `+say` is the composer's snap and say | 246 | done |
| `mic` (`+auto`, `{transcript}`) | `Presets/MicPreset.swift` | web way: Web Speech where the browser has it, typing where it does not; `+auto` starts listening where the browser allows it, otherwise it waits for a tap | 246 | done |
| `gallery`, `video`, `compare`, `storyboard` | `Presets/MediaSetPresets.swift`, `Presets/MediaPresets.swift` | same (library walk renders and taps them) | 246 | done |
| `chart`, `stat`, `math`, `step`, `calc` | `Presets/SciencePresets.swift` | same: `science.js`, KaTeX | 246 | done |
| `deck`, `page`, quiz members | `Presets/FlowPresets.swift` | same | 246 | done |
| `plan` with its questions | `Presets/FlowPresets.swift` | same: one Send, one `{plan: ...}` event, answers land in the record. `site/e2e/web/presets.test.mjs` walks every sample in /library.json: it renders, a tap goes up and the line sent is the app's wire format | 243 | done |
| `flow` and starter flows | not in the app yet (YUI-115; `compat.py` runs a flow as a plan on phones until then) | web is ahead: `flow-run.mjs` and `starter-flows.mjs` already run it. The web keeps it; the app catches up on YUI-115 | 246 | done |
| `project` | `Presets/FlowPresets.swift` | same | 246 | done |
| `narrate` | `Presets/FlowPresets.swift` (`NarratePreset`) | web way: speech synthesis where the browser has it | 246 | done |
| `timeline`, `done`, `now`, `next`, reorder | `Presets/TimelinePreset.swift` | same: drag to reorder with a pointer | 246 | done |
| `sketch`, `row`, `after` | `Presets/SketchPreset.swift` | same | 246 | done |
| `shapes`, `shape` | `Presets/ShapesPreset.swift`, `Presets/ShapesScene.swift` | same: `shapes.mjs` is the line-for-line source | 246 | done |
| `shapes` drawing kit: `+close` regions, overlap blend, `contour`, `bend=`, `arc`, `bracket`, `callout`, `shapes` as a plan page's picture | not in the app yet (`Presets/ShapesScene.swift` has none of it; YUI-276 on t_501bc98e follows the look pick) | web is ahead: `shapes.mjs` and the playground draw it (YUI-291) | 246 | done |
| `diagram` | not in the app yet (no case in `Presets/PresetViews.swift`) | web is ahead: `diagram.mjs` is the reference and draws it | 246 | done |
| `mock`, `part` | not in the app yet (no case in `Presets/PresetViews.swift`) | web is ahead: the playground draws it | 246 | done |
| `map`, `area`, `pin`, `route` (world scale) | `Presets/MapPreset.swift`, `Presets/MapScene.swift` | same: `map.mjs` is the line-for-line source | 246 | done |
| `game` (tictactoe and the rest) | `Presets/GamePreset.swift` | web way: pointer and arrow keys, no haptics | 246 | done |
| `loop`, `drums` | `Presets/MusicPresets.swift`, `Packages/YuiSound` | same: Web Audio, the same sound bank, one engine, one clock. A beat on a looper the agent named is kept on this device until it is sent (`lib/web/kept.mjs`, `LoopDrafts.swift`) | 246 | done |
| `keys`, `chords` (scale lock, glide, several fingers) | `Presets/MusicKeys.swift` | same: pointer events, the computer keyboard and Web MIDI in where it exists; the scale lock still silences the wrong keys | 246 | done |
| `tuner` | `Presets/MusicTools.swift` | web way: `getUserMedia` and a pitch detector | 246 | done |
| `metronome` | `Presets/MusicTools.swift` | same: its clicks stay out of a take's MIDI file, like the app's | 246 | done |
| Record on the looper, drums, keys, chords (`.m4a`, `.mid`) | `Presets/MusicTake.swift` | web way: MediaRecorder on the master chain (never the mic) and `lib/music/take.mjs` for the `.mid` (type 1, 480 ticks a beat, drums on channel 10, one named track per pitched sound). Stop and send uploads both to the thread's media and sends `{audio, midi, seconds}` as signed links with the echo `Sent a take, N s`; `drums +record` carries the same fields on its pattern take. `.m4a` where the browser writes AAC, else `.webm`. Up to 2 minutes, one take at a time | 246 | done |
| MIDI clock out | `Presets/MusicTake.swift` | web way: not sent. Browsers have no MIDI clock out worth the name (Safari has no Web MIDI at all), so the tab plays the beat and does not drive other gear. On the iPhone it is there | 246 | done |
| Loop drafts (a beat kept until sent) | `Presets/LoopDrafts.swift` | same: `lib/web/kept.mjs`, per agent and looper id, on the loop the agent drew; a different loop from the agent drops the draft | 246 | done |
| `say` (words on the stage, not a bubble) | `Presets/PresetViews.swift`, `Stage/StageChunks.swift` | same. `site/e2e/web/presets.test.mjs` walks every sample in /library.json: it renders, a tap goes up and the line sent is the app's wire format | 243 | done |
| Body text renderers | `Theme/ReadingText.swift` | same: `readtext.mjs`. `site/e2e/web/presets.test.mjs` walks every sample in /library.json: it renders, a tap goes up and the line sent is the app's wire format | 242 | done |
| `theme`, `theme app` | `Theme/AgentLook.swift`, `Theme/AppLook.swift` | same: `look.mjs`. `site/e2e/web/presets.test.mjs` walks every sample in /library.json: it renders, a tap goes up and the line sent is the app's wire format | 247 | done |
| Reminders (`meta.native.reminders`) | `Presets/Reminders.swift` | web way: Notifications API while the tab is open (`lib/web/reminders.mjs`). A closed tab waits for a scheduled Web Push (backlog card, section 1) | 246 | done |
| `custom {json}` | `Presets/PresetViews.swift` | same: replaced, not patched. `site/e2e/web/presets.test.mjs` walks every sample in /library.json: it renders, a tap goes up and the line sent is the app's wire format | 242 | done |
| Errors in a line (the error row) | `Presets/YLScreen.swift` | same: the playground shows the same error row. `site/e2e/web/presets.test.mjs` walks every sample in /library.json: it renders, a tap goes up and the line sent is the app's wire format | 242, 250 | done |
| Telegram fallback text | spec/YL.md section 10 | not needed in the browser | none | n/a |

**Fields without a mic on purpose (YUI-286).** Never make people type: every text field on `/web` carries the shared `FieldMic.js` unless it is on this list. `lib/web/fieldmic-audit.mjs` holds the list in code (`WITH_MIC`, `EXEMPT`, a reason for each) and `lib/web/fieldmic-audit.test.mjs` (`node --test`) scans every `<input>` and `<textarea>` in `app/web` and in the preset renderers (`app/playground/presets.js`, `science.js`, YUI-290) and fails when a field has neither a FieldMic nor a spot on the list, so a new field cannot slip past by accident. The exempt fields:
- Preset renderers (YUI-290): the choose and pick "Type your own" box, the form's text and long fields, the sketch note and a frame comment carry the mic. Exempt: the voice field (draws its own mic), the mic preset's typing fallback (shown only where there is no speech recognition), sliders and file pickers.
- Secrets: the model key and web search key in Settings (`st-key`, `st-search`) and the vault key (`kv-secret`). A key is never spoken.
- The key vault forms (`SettingsKeys.js`: the key's name and the purpose of a grant): no mic anywhere on the vault pages.
- Not words: the server address and model name (`st-base`, `st-model`), the pairing and sign in code (`web-code`), the cron expression and the time picker in the controls, the hidden file picker.
- Code: the controls editor.
- The composers (thread, group, stage): the bar's own mic and hands free are the voice way in.


## 8. Push, links, system

| Feature | App file | Web twin | Story | Status |
| --- | --- | --- | --- | --- |
| Register a device, mute per agent, `presence` suppresses a push for the open thread | `Push/Push.swift`, `supabase/functions/yui-push` | web way: Web Push (VAPID) subscription, `register_web` stores endpoint and keys in `yui_devices` next to the APNs tokens (a row has one or the other); `notify` sends to both. Per agent mute is the same `push_muted`. `presence` takes the endpoint in place of the token, once a minute while a thread is open and visible. Settings > Notifications is the switch; permission is asked from that tap, and granting it for reminders alone subscribes nothing. Built in `lib/web/push.mjs`, `app/web/usePush.js`, `public/web-sw.js`, `yui-push/web.ts`. | 248 | done |
| A tap opens the thread; deep link `yui://agent/<id>/thread` | `Push/Push.swift` | web way: a notification click opens `/web/agent/<id>` (and `/chat/<chat>` when the reply is in one), in the window already open on it, else any /web window, else a new one. The address is checked to stay inside `/web`. | 248 | done |
| Silent push on revoke (an agent leaves the list at once) | `Push/Push.swift` | same: a quiet Web Push (`kind: "revoked"`), the worker closes that agent's notification and tells the open page, which reloads the list. Safari may drop a subscription that gets many pushes with no notification; the 15 s list poll stays the backstop. | 248 | done |
| Badge | `Push/Push.swift` | web way: the Badging API (installed Chrome, Edge, Safari 16.4 home screen apps): the badge is how many notifications are still showing, set by the worker on a push and fixed when one is read or clicked. A reply read on any device (APNs or web) sends a quiet `clear` push to the person's other browsers, which close that agent's notification. Where the API is missing there is no badge. | 248 | done |
| Install to the home screen or dock | none | web way: `/web/manifest.webmanifest` (standalone, scope `/web`, 192 and 512 icons, one maskable) and the service worker at `/web-sw.js` (scope `/web`, so /web itself, the install's start page, is under it), registered on every launch of /web. Chrome and Edge offer Install in the address bar, Safari on a Mac File > Add to Dock, iPhone Share > Add to Home Screen. Widgets stay on the iPhone (open on your iPhone). | 248 | done |
| Continue on the phone or the web | none before | web way: the thread, its chats, the screens on the stage and the shelf's saves were already the same rows on both (`yui_messages`, `yui_chats`); read state is `yui_chats.seen_at` (reading on either clears the dot on the other); drafts and the shelf's hand-removed names now ride `yui_sync_state`. The shelf's removed names sync from the web to the web (and any later phone build that reads `shelf-removed`); the phone keeps its own file for now. One conversation started on the phone and finished on the web is on the demo video | 249 | done |
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
- **XSS story (as built in 241, nonce on in 264)**: `/web` is served with a Content Security Policy that `site/middleware.js` sets per request from `site/lib/web/csp.mjs` (the one source; `next.config.mjs` carries only the other headers): `default-src 'self'`, `script-src 'self' 'nonce-<per request>' 'sha256-<theme script>' 'strict-dynamic' https://appleid.cdn-apple.com` with no `'unsafe-inline'`, `connect-src` the yuigui Supabase project, its realtime socket and Apple only, `frame-src` Apple, `frame-ancestors 'none'`, `object-src 'none'`, `base-uri 'self'`, `form-action 'self' https://appleid.apple.com`, plus `Referrer-Policy: no-referrer` and `Cross-Origin-Opener-Policy: same-origin-allow-popups` (Apple's popup needs its opener). The middleware also puts the policy on the request, Next reads the nonce from it and stamps its own inline scripts, and that is why `/web` renders on each request (`export const dynamic = "force-dynamic"` in `app/web/layout.js`); the rest of the site stays static (the build output lists only `/web` routes as newly dynamic). The one inline script on every page, the theme setup in the root layout, cannot carry a nonce in static HTML, so the policy allows that exact text by its sha256 (`lib/theme-init.mjs`). So an inline script injected into our own page has no nonce, matches no hash and is refused (the e2e injects one into the page's HTML and checks the console reports the violation). Honest limits: `'strict-dynamic'` trusts scripts that a nonced script creates (that is how Next's chunks and Apple's sign in script load), so code that already runs on the page is not stopped by the policy, and `style-src` still has `'unsafe-inline'`. What shuts the other doors: React escapes every string, agent words are markdown through a sanitizer and never `dangerouslySetInnerHTML`, presets are our own components, no third party script loads on `/web` (analytics is off there, `app/components/Analytics.js`). The refresh token in IndexedDB is readable by script on the page, like a `localStorage` token and like any non HttpOnly cookie: an XSS on `/web` could take it, and a rotated token that is used twice ends every session, so a stolen copy shows itself on the next refresh.
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
| iPhone Safari Web Push | Only for a web app added to the home screen; the app stays the way to get Yui on a phone. Settings says so in a tab (Share, Add to Home Screen) and offers the switch from the installed app. | 248, done |
| What "one to one" means where the browser lacks a feature | The row says `web way` or `iPhone` and the web names it in one line | each story |

## 12. Speed (YUI-271)

Timed on Oct 2 after the nine /web stories (262 to 270). `site/scripts/web-speed.mjs` drives one headless Chrome against a production build: the demo thread (`/web/agent/demo-penny?demo=penny&view=chat&demohistory=400`) at 390 wide, 4x CPU throttle, slow 4G (1.6 Mbps down, 150 ms round trip), cache off, median of 3 runs. JS is what the wire carried (gzip, a local server; Vercel sends brotli, so the real numbers are smaller).

| Number | Before | After |
| --- | --- | --- |
| First paint | 752 ms | 736 ms |
| First message row drawn | 2509 ms | 2506 ms |
| First tap that answers (open the drawer) | 195 ms | 199 ms |
| Open the drawer, open the agents list, switch agent | 308 ms | 313 ms |
| JS before the first row | 263 KB | 243 KB |
| JS on the page after 5 s (everything it warms) | 466 KB | 364 KB |
| JS files after 5 s | 18 | 25 |
| JS heap after scrolling back 300 rows | 10.0 MB | 8.9 MB |

What was worst: the page shipped 466 KB of script, 75 KB of it KaTeX that the thread loaded even when no reply had a formula, and every sheet (settings, controls, add agent, groups, palette, the key vault) plus the music kit, games, diagrams, flows and queries in the first bundle. Fixed, no feature change:

- KaTeX loads the first time a formula is drawn (`app/playground/science.js`).
- The sheets and panels a tap opens are their own chunks (`app/web/lazy.js`), warmed when the browser is idle so the first tap still answers at once.
- The music kit, games, diagrams, flows and queries load on the first reply that draws one (`later()` in `app/playground/presets.js`).

What did not move: first paint and the first row. They wait on the framework and the app shell (about 240 KB on a 200 KB/s link), not on the parts that were split off. Smaller next steps, if wanted: split the demo relay and its fixtures out of the signed-in bundle, and cut the shell's own size. The signed-in path loads the same bundle; its relay calls go to the live backend, which a throttle cannot make comparable, so only the demo thread is timed. The long task counter read 0 under the throttle and is not reported.

### YUI-272: a lighter first screen

Same rig, same URL, median of 3, run on a production build on Oct 2.

| Number | Before | After |
| --- | --- | --- |
| First paint | 736 ms | 720 ms |
| First message row drawn | 2519 ms | 2517 ms |
| Page draws as a chat (grey bubbles, from the server) | not there, "Opening Yui..." text | about 1000 ms |
| First tap that answers (open the drawer) | 199 ms | 204 ms |
| Open the drawer, open the agents list, switch agent | 313 ms | 314 ms |
| JS before the first row | 243 KB | 237 KB |
| JS on the page after 5 s | 364 KB | 359 KB |

What changed, no feature change:

- The demo relay, its sample group, its settings and controls fixtures are one chunk (`app/web/demoKit.js`). A signed-in tab never fetches it (15 KB gzip off its first screen). A `?demo=` link gets it as a preload in the first HTML, so the demo thread did not get slower.
- The server draws five grey bubbles under "Opening Yui..." (`.wb-skel`, `thread.css`), so the page reads as a chat from the first paint of its own CSS.

What did not move, and why: the first real row. A 3 run profile at 4x CPU shows the main thread idle for 1.8 s of the 2.5 s: the page waits for bytes. The 243 KB is about 100 KB of framework (React, Next) we cannot split, 62 KB of app shell, 21 KB of the Yui Lines parser the rows need, and a dozen small chunks. At 200 KB/s every KB costs about 5 ms, so a lighter shell buys milliseconds, not the second asked for. Tried and dropped: loading the drawer, the agents list and the crew pick after the first row. The first row stayed put and the agent switch got slower (316 to 579 ms), because the idle warm-up had not finished. Next levers, in order: Brotli on the real host (Vercel already sends it, so real numbers are lower than this local gzip run), and cached last rows per agent on a repeat visit so the real rows draw at hydration instead of after the relay call.

### YUI-273: a repeat visit opens on the last chat

The first real row on a repeat visit no longer waits on the network. `site/scripts/web-speed-signed.mjs` times the signed in page (the demo thread cannot show this): 390 wide, 4x CPU, slow 4G, a stored session, and a local HTTPS stand-in for the backend that answers the first call after 450 ms and every later one after 250 ms (the throttle does not reach localhost). Cold is a fresh browser profile with the HTTP cache off, like the rig above. Repeat is the same profile a moment later with the HTTP cache on (Next's chunks are immutable) and whatever the page kept. Median of 5, production build, Oct 2.

| Number | Before | After |
| --- | --- | --- |
| Cold visit: first real row | 4025 ms | 4020 ms |
| Repeat visit: first real row | 2057 ms | 452 ms |
| Repeat visit: first paint | 180 ms | 188 ms |
| Repeat visit: live rows answer at | 1604 ms | 1293 ms |

The repeat visit draws its rows 0.8 s before the live read lands, from IndexedDB (database `yui-web-cache`, `site/lib/web/cache.mjs`). Before, the rows waited for the session renewal, the agent list and the chat list, one after the other, then the rows (four round trips). What is kept, per signed in person (every record carries the user id, and a person never reads another's):

- the newest 40 rows of each thread the person opened, keyed by agent and chat, written when the live read or the socket brings something new;
- each agent's chat list (the first page), so the thread can mount before `yui_chat_list` answers;
- the agent list with the crew and first name (never `crew_pending`, so the first run screen cannot flash).

How it reconciles: the page opens on the stored session while the renewal is on the wire (`provisional` in the auth snapshot); the kept rows are drawn without starting a wait (a kept last row of yours never says the agent is working); when the live first read lands the thread is rebuilt from it in one pass (`Thread.swap`), so a row that changed shows as it is now, a gone row is gone, nothing shows twice, and there is one redraw. A refused session ends the provisional screen at once. If the network is down the kept rows stay.

Clearing: sign out clears it (and the instance stops writing, so a read in flight cannot put it back). A tab that finds itself signed out (another tab signed out, the session was refused) wipes it too. The demo never writes it. Group threads keep the same way since YUI-275 (below).

What did not move: the cold visit. A first visit has nothing kept, and its row waits on the same four trips and the same 240 KB of script as in YUI-272. Next levers: carry the first screen's rows in the server HTML for a signed in person (needs a cookie the server can read, a privacy decision), or start the agent and chat reads before the session renewal ends.

### YUI-275: a group chat opens already drawn

A repeat visit that landed on `/web/group/<id>` still waited on the network for its first row, while a one-agent chat opened from the cache. Group threads now keep the same way. Same rig as YUI-273 (`CASE=group node scripts/web-speed-signed.mjs 5`: 390 wide, 4x CPU, slow 4G, a stored session, the stand-in backend at 450 ms then 250 ms per call, production build, median of 5, Oct 2). The group case serves 100 rows and the group list (`yui_threads`).

| Number | Before | After |
| --- | --- | --- |
| Group, repeat visit: first real row | 1074 ms | 459 ms |
| Group, cold visit: first real row | 3515 ms | 3532 ms |
| One agent chat, repeat visit: first real row | 500 ms | 451 ms |
| Group, repeat visit: live rows answer at | 582 ms | 590 ms |

What is kept (same database, `yui-web-cache`, same person key): the newest 40 rows of each group the person opened, keyed by group id (`groupRows`, in the `rows` store under `<user>|group|<id>`), and the group list (`groups`, in the `agents` store), written when the live read or a poll brings something new. The kept list lets the thread mount before `yui_threads` answers; only the live list may say a group is gone.

Reconcile: kept rows draw at once; the first live read replaces them in one pass (a changed row shows as it is now, a gone row is gone, nothing shows twice); a kept last row of yours never shows as "working" (working rows come from live rows only).

Clearing: sign out and a tab that finds itself signed out wipe everything, group rows included. Archiving a group, a group missing from the live list, and the "That group is gone." screen drop that group's rows. The demo never writes.

### YUI-274: a first visit starts its reads while the session renews

The four trips of a cold visit (renew the session, agent list, chat list, rows) now overlap. Same rig as YUI-273 (`site/scripts/web-speed-signed.mjs`: 390 wide, 4x CPU, slow 4G, stand-in backend at 450 ms for the first call and 250 ms after, median of 5, production build, Oct 2). The rig's stored session now also carries the access token the last renewal left, still good for half an hour, which is what a person coming back within the hour has. Three runs of 5 after the change: 3015, 3013, 3011 ms.

| Number | Before | After |
| --- | --- | --- |
| Cold visit: first real row | 4024 ms | 3013 ms |
| Cold visit: live rows answer at | 3272 ms | 2227 ms |
| Repeat visit: first real row | 449 ms | 452 ms (448, 436 on two more runs) |
| Repeat visit: first paint | 180 ms | 188 ms |

What changed, in `lib/web/auth.mjs`, `relay.mjs`, `sync.mjs` and `app/web/ThreadApp.js`:

- The access token a renewal returns is stored beside the refresh token (IndexedDB, same record). On the next load `restore()` keeps it as `early` when it has more than 30 s left, and `accessToken()` hands it to reads at once. The renewal still runs and still rotates the refresh token (it never looks at `early`), so the 60 day session keeps sliding. An expired stored token is never used: the read waits for the renewal, as before.
- The chat list and the thread's first rows start from the agent in the address, not from the agent list's answer, so agents, chats and rows leave together. The rows go with the chat in the address, or the agent's own rows. A person with several chats and no chat in the address opens on the newest chat, so the early rows are not used for them and the thread reads its own as before (one wasted read, no wrong rows). A `/web` address that names no agent has nothing to start from; its first visit is unchanged.
- A 401 on a read (the stored token was revoked, or lapsed in transit) calls `auth.renewed(rejected)`: it waits for the renewal already on the wire, or starts exactly one, and the read goes once more on the new token. One refresh token spend either way (the in-flight promise, the Web Lock and the re-read of the stored token from YUI-239/242 are untouched). A second 401 is an error, no third try.

Trade-off: the access token (an hour old at most) now sits in IndexedDB next to the refresh token, which is the stronger secret and was already there. No cookie, no server change.

What did not move: the other 3 s. The page still waits for the framework and shell bytes (YUI-272), and the first call's 450 ms. With the reads overlapped, the first row now needs the script, one backend round, and the render. Next lever left: keep the last-open agent's id in the session record, so a bare `/web` address can start its reads too.

### YUI-281: a bare /web opens your last agent

The lever YUI-274 left. A plain `www.yuigui.com/web` names no agent, so it waited for the agent list to pick who to open, and the chat list and rows waited behind it. Now the id of the agent last open is kept beside the session (IndexedDB `yui-web`, same record as the tokens, `lastAgent` in `lib/web/auth.mjs`), and a bare `/web` starts that agent's reads at once, in parallel with the session renewal, exactly as `/web/agent/<id>` does. Same rig as YUI-273 (`CASE=bare node scripts/web-speed-signed.mjs 5`: 390 wide, 4x CPU, slow 4G, a stored session that names the last agent, stand-in backend at 450 ms then 250 ms per call, production build, median of 5, Oct 4).

| Number | Before | After |
| --- | --- | --- |
| Bare /web, cold visit: live rows answer at | 2537 ms | 2260, 2239 ms (two runs) |
| Bare /web, cold visit: first real row | 3028 ms | 3041, 3025 ms |
| Bare /web, repeat visit: first real row | 449 ms | 472, 468 ms |
| Bare /web, repeat visit: live rows answer at | 584 ms | 602, 582 ms |

What moved: the live read, by about 290 ms, because the agent and chat reads no longer wait for the list. What did not: the first real row of a cold visit (still the script bytes, as in YUI-274) and the repeat visit (it already drew from the cache). Before is one run of 5, after is two.

How it works:

- `auth.rememberAgent(id)` writes `lastAgent` into the session record inside the refresh lock, so a rotation landing at the same moment is never overwritten with the old refresh token; `auth.lastAgent()` reads it without waiting for the renewal. A renewal keeps it (and takes a newer one another tab wrote).
- `ThreadApp` asks for it only when the address names no agent. Until it is read no thread opens, so a kept agent list cannot draw the default and then swap. The open agent is the address's, else the kept one, else the default (`openAgent` in `lib/web/agents.mjs`).
- It is written only once the live list has said who is open, so a list kept from last time never writes. An agent that is gone from the live list opens the default and the default replaces the stored id; the early rows that were started for the gone agent are not used, and the default's reads start instead. No flash of the wrong thread.
- Sign out (and a refused session) clears the whole record, so the next person starts with none. The demo never reads or writes it. The address stays `/web`.

Proof: `lib/web/auth.test.mjs` (set, survives a renewal, never overwrites a rotation, cleared on sign out), `lib/web/agents.test.mjs` (a gone agent falls back), `e2e/web/lastagent.test.mjs` (on a prod build: the kept agent's rows leave before the list answers, the wrong thread never shows, gone falls back, sign out clears; 390 px light and dark).

## 13. Switching screens (YUI-282)

The web twin of the phone fix (t_e8223e6c). `site/e2e/web/switch-bench.mjs` times it: 390 wide, 4x CPU, production build, median of 5 runs of 20 switches.

| Number | Before | After |
| --- | --- | --- |
| Pill tap to commit (p50) | 3.8 ms | 3.6 ms |
| Pill tap to the frame that shows the new screen (p50, two frames) | 44 ms | 45 ms |
| Swipe lift to the frame that shows the new screen (p50) | 60 ms | 62 ms |
| One finger move, work until the last DOM change (p50) | 1.7 ms | 0.2 ms |

A pill tap already switched on the first frame (nothing waits; 45 ms is the two-frame floor the timer waits for). The cost was the drag: `usePager` set state on every touch move, so the whole stage rendered per move. With `live` on, the move writes `--drag` onto the pager and the stage renders once, on the lift. The site chat's dots keep the old path (they need `progress`).

Proof: `e2e/web/switch.test.mjs` (pill, swipe, drag cleared, light and dark), `stage.test.mjs` and `scrollback.test.mjs` green.
