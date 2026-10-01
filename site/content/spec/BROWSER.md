# Yui on the web | spec v1 (YUI-240 to YUI-250)

Yui in a browser tab, at https://www.yuigui.com/web. The same account, the same agents, the same threads, the same screens as the iPhone app, with Sign in with Apple. Nothing new on the agent's side: the web is one more place the person reads a thread, like a second phone.

Chris, 2026-10-01: "Let's bring Yui to the web!" One to one feature parity with the iPhone app. Web and phone may handle ins and outs a little differently; the web gets as close as it can.

Status: building. YUI-241 landed: sign in, the session, sign out and CORS (live, signed in with a real Apple ID). Scope is full parity, built by us (it was a build-to-earn contributor card, YUI-71; YUI-109, the first pull request, is folded into YUI-242). The map of every app feature and its web twin is [docs/specs/web-parity.md](https://github.com/postscarcityai/yuigui/blob/main/docs/specs/web-parity.md); this page carries its summary. Siblings: YUI-47 (Apple Watch), YUI-58 (macOS).

## What it is

A web app at `www.yuigui.com/web` (the same origin as the site, not a second domain) that:

1. **Signs in with Apple** (Sign in with Apple JS, a popup). Same Apple ID, same Yui account, same agents as the phone.
2. **Talks to the same relay** (`spec/RELAY.md`): rows in `yui_messages`, read with REST and Realtime, written as `sender='user'` rows. No server of its own in the middle.
3. **Draws with the playground's renderer**: `site/lib/yl/yl.mjs` parses, `site/app/playground/presets.js` draws, and `mcp-app/src/events.mjs` writes the `[yui] ...` event lines. The Telegram Mini App (`spec/TELEGRAM.md`) and the MCP App already reuse them the same way.

An agent cannot tell the browser from the phone. Its taps arrive as the same event rows, its replies are the same rows, and the channel guide does not change.

## Scope: everything the app does

Every feature in the app has a row in the parity map, and each row says one of three things:

- **same**: the web does exactly what the app does.
- **web way**: the same result by a different road, said in the row (a start timestamp for a timer instead of a Live Activity, Web Push instead of APNs).
- **iPhone**: the web says "Open on your iPhone" with one line of why, and a `yui://` link. Never a broken block.

Where the app lags the web (`flow`, `diagram`, `mock`, agent tables are drawn on the site and not yet in the app), the web keeps them. Parity means no app feature is missing on the web; it does not mean the web holds back.

| Area | Rows | How the rows map | Stories |
| --- | --- | --- | --- |
| Account and session | 10 | 6 same, 4 web way | YUI-241, 245, 247 |
| The thread | 27 | 22 same, 5 web way | YUI-242, 243, 244, 245 |
| The stage, pages and home | 16 | 15 same, 1 web way | YUI-243, 246 |
| Agents and the drawer | 11 | 10 same, 1 web way | YUI-242, 245, 249 |
| Settings and account | 13 | 7 same, 6 web way | YUI-247, 250 |
| Presets (every one in YL section 4) | 39 | 23 same, 11 web way, 1 iPhone, 3 web is ahead | YUI-242, 243, 246, 248, 249 |
| Push, links, system | 8 | 1 same, 5 web way, 2 iPhone | YUI-248, 249 |

## Where the web differs from the phone

| The app has | The web way |
| --- | --- |
| Haptics | Dropped, silently. |
| Keychain | Access token in memory, refresh token in IndexedDB. Keys are never stored in the browser: sealed to the hosted connector and handed to the vault, or "Add it on your iPhone". |
| Face ID on keys | WebAuthn user verification where the browser has it, else a fresh Sign in with Apple. |
| APNs push | Web Push (VAPID) through `yui-push`. |
| Live Activity, Dynamic Island, lock screen timer | The timer keeps true time from a start timestamp; the tab title shows the time left. A closed tab stops it and the pill says so. |
| Widgets | iPhone. The shelf and pinned rows in the drawer carry the same saved screens. |
| Siri, Shortcuts, Action button | iPhone. The app has none yet. |
| Home screen quick actions | The same `menu shortcut` rows as chips and a command palette (Cmd or Ctrl and K). |
| `yui://` deep links | `/web/agent/<id>` routes; a notification click opens them. |
| Speech recognition | The Web Speech API for the words, `getUserMedia` and an `AnalyserNode` for the waveform; only the words are sent, as text, like the app (no audio is uploaded, so no `MediaRecorder` here); typing where the browser has no recognizer. Hold the mic to talk, tap it for hands-free (YUI-244). |
| Camera and photo library | `getUserMedia`, a file picker, drag and drop, paste. |
| MIDI | Web MIDI in where the browser has it (Chromium); Safari says "Open on your iPhone" for the keyboard and clock. |
| Metal shaders for the visual | WebGL from the same plan, a 2D canvas under a budget, a still with reduced motion. |
| Local notifications for reminders | The Notifications API while the tab is open, Web Push when it is closed. |
| On-device model | iPhone. |

## The translation table

What each preset does in a browser. A row not listed renders as it does in the playground.

| YL | In the browser |
| --- | --- |
| haptics (games, taps, timers) | dropped, silently |
| `timer` | keeps running while the tab is open and counts the time that really passed between two looks, so a background tab that throttles `setInterval` lands where the clock says, across every phase it missed (`lib/web/timer-clock.mjs`). The tab title shows the time left and the round, and a Wake Lock keeps the screen on while it runs. A closed tab stops it; there is no lock-screen pill. Beeps need one tap first (browsers block sound until then). |
| a plan shaped like a workout (set `pick`s with rep and weight `slide`s) | Arnold's runner, rule for rule as the app's `WorkoutRunner`: one move per page, sets to tick, Skip, reps and weight with - and +, a rest that starts by itself after a set (+15s, Skip rest, rings on the wall clock in a background tab), "done" said out loud where the browser has Web Speech, a Wake Lock, and the place kept per plan on the device. The answers go as the plan's one line. |
| `camera` | `getUserMedia`, `facing` as `facingMode`. With no camera or no permission: a file picker (the fallback YL already names). One photo, shrunk to 2048 px as JPEG, uploaded to the thread's media and sent as `{photo: path}` with the echo `Photo`, like the phone. |
| `mic` | MediaRecorder, and the Web Speech API where the browser has it. Where it has neither: typing, as YL already says. `+auto` waits for a tap, because browsers need one. |
| `form` fields `photo`, `voice` | a file picker, and the mic button as in `mic` |
| `image +edit` | pointer events: draw with a mouse, pen or finger |
| the stage, `>full` | a layer over the whole window. A full screen button asks for the Fullscreen API; Esc and the X close it, like a swipe down on the phone. |
| pages `2` to `12` | one page at a time with the same dot row; swipe, arrow keys or a tap on a dot |
| reactions, reply | hold, or right-click, a message |
| `loop`, `drums`, `keys`, `chords`, `metronome` | Web Audio, the same sound bank, one engine and one clock for the whole page, so sound keeps playing across screens |
| Record on `loop`, `drums`, `keys`, `chords` | records what the engine plays (the master chain, never the mic) with MediaRecorder: `.m4a` where the browser writes AAC, else `.webm`. The notes of the same take become a `.mid` (type 1, 480 ticks a beat, drums on channel 10, one named track per pitched sound, `lib/music/take.mjs`). Stop and send uploads both to the thread's media and sends `{audio, midi, seconds}` as signed links. |
| a MIDI keyboard on `keys` | Web MIDI in, where the browser has it (Chrome, Edge); a chip names the keyboard. The computer keyboard plays too (A to ; white, W to P black). MIDI clock out is not sent. Safari has no Web MIDI: the keys play with a finger or the keyboard. |
| `list@id` ticks, `loop@id` drafts | kept per agent on the device until sent (`lib/web/kept.mjs`), the twins of `ListTicks` and `LoopDrafts`. |
| `save`, `show`, `forget` | the shelf: chips at the top of the thread, newest first; a tap reopens the screen on the stage with no turn; a long press, a right click or Delete offers Remove (`lib/web/shelf.mjs`). |
| `meta.native.reminders` | the Notifications API at the time while the tab is open (`lib/web/reminders.mjs`); permission is asked once, on the first live reply that carries one. Closed: Web Push (YUI-248). |
| `tuner` | `getUserMedia` and a pitch detector |
| `game` | playable with a pointer and the arrow keys |
| anything that needs the phone | "Open on your iPhone" with a `yui://agent/<id>/thread` link, never a broken block |

## The stories

| Story | What it builds |
| --- | --- |
| YUI-240 | the parity map and the decisions on this page |
| YUI-241 | Sign in with Apple on the web: a Services ID, a web audience in `yui-auth`, CORS, a session that stays signed in |
| YUI-242 | the thread, live in the browser: agents, messages, screens, taps (folds in YUI-109, the offline thread) |
| YUI-243 | the stage: full screen answers, screens 2 to 12, talk on a screen, home, the top and bottom bar |
| YUI-244 | the composer: photos and files, voice, mentions, replies, reactions, suggestions, an outbox that survives a closed tab |
| YUI-245 | agents: the drawer, add, rename, remove, connect a new agent, groups, controls |
| YUI-246 | every preset at parity: music, tuner, games, maps, diagrams, flows, workouts, the shelf |
| YUI-247 | settings and account: look, keys, web search, invites, help, sign out, delete |
| YUI-248 | notifications: Web Push, the click opens the thread, install to the dock or home screen |
| YUI-249 | one Yui across phone and web: continue a conversation, read state, drafts (folds in YUI-146) |
| YUI-250 | ships: parity sweep, the e2e suite in CI, the launch demo, the release post draft |

## The URL

`https://www.yuigui.com/web`: `/web` the app, `/web/agent/<id>` and `/web/agent/<id>/chat/<chat>` a thread, `/web/auth/apple` the return URL registered with Apple, and `/web?demo=<sample>` an offline fixture with no sign in and no network, the twin of the playground and the harness's fixture. One origin: no second domain, and the client ships in the same build as the renderer.

## The session

- The access token (the short-lived `yui_user` JWT from `yui-auth`) lives in memory only.
- The refresh token is the one thing stored, in IndexedDB, so a closed tab stays signed in for the 60 days the app's session has. Each refresh rotates it, and `yui-auth`'s reuse check ends every session on a double spend, so a stolen token shows itself.
- One refresh at a time across tabs: a Web Lock around the refresh, the new access token passed on a `BroadcastChannel`. The browser twin of the app's single refresh in flight.
- No cookies, so there is no cookie CSRF: the edge functions read the `Authorization` header only, which a forged cross-site request does not carry. The Apple sign in uses a per attempt `state` and nonce kept in the page's memory.
- `/web` is served with a Content Security Policy: scripts from the page and Apple's sign in script only (inline scripts allowed, for Next's own; no nonce yet), `connect-src` the Yui backend and Apple only, no framing, no analytics on the page. Agent words are sanitized markdown, never raw HTML.
- Sign out calls the `sign_out` grant for this session only, and clears the stored token.

## Reuse and the harness

The parser, the renderer, the stage, the pages, the sent times, the sound engine and the event lines are the ones the playground, the site chat and the Telegram Mini App already use; the web adds the relay client, the session, the outbox and the account and agent screens. The tests are Playwright, in `site/e2e/web/`, on the `?demo=` fixture only, at 390 px and at desktop width, light and dark. A live smoke run uses a dedicated test account and its own test agent, by hand, never a real person's thread.

## Security

No new roles and no new tokens. The browser is a `yui_user` client with exactly the rights in `spec/AGENTS.md` (Who may do what) and `spec/RELAY.md` (Credentials): its own threads, `sender='user'` rows, nothing else.

- `yui-auth` accepts a second Apple audience, the web Services ID, next to the app's bundle id. The nonce works as it does on the phone: the page gives Apple `sha256(nonce)` and sends `yui-auth` the raw nonce. Web sessions are marked `client=web`.
- No service key, no connector token and no management token ever reach the browser. A vault key is sealed to the hosted connector's public key in the page and never kept.
- The edge functions it calls (`yui-auth`, `yui-agents`, `yui-native`, `yui-push`, `yui-account`, `yui-delete`, `yui-connect`, `yui-vault`) answer CORS for `https://www.yuigui.com` and the project's previews only, with no credentials mode.
- Invites gate the browser the same way: an account the phone could not open, the browser cannot open.

## Push

Web Push with VAPID. `yui-push` gains `register` for a web subscription (endpoint and keys, `environment: "web"`), one row per browser in `yui_devices`, and sends through the Web Push protocol next to APNs. The same rules as the phone: muted agents stay quiet, and a browser open on that thread (the `presence` call) is skipped. On iPhone, Safari only allows Web Push for a web app added to the home screen, so the app stays the way to get Yui on a phone.

## Not yet

- Several windows on one thread, and an offline reading mode.
- Anything the iPhone app does not do yet is not a parity row; it lands in both when its card does.
