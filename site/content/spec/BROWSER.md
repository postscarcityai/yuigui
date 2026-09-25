# Yui in the browser | spec v0 (YUI-71)

Yui on any computer, in a browser tab. The same threads, the same agents, the same screens. Nothing new on the agent's side: a browser is one more place the person reads a thread, like a second phone.

Status: draft, open for contributors (build to earn). The brief with the first pull request is `docs/specs/browser.md` in the hub repo. Siblings: YUI-47 (Apple Watch), YUI-58 (macOS).

## What it is

A web app, planned at `app.yuigui.com`, that:

1. **Signs in with Apple** (Sign in with Apple JS). Same Apple ID, same Yui account, same agents as the phone.
2. **Talks to the same relay** (`spec/RELAY.md`): rows in `yui_messages`, read with REST and Realtime, written as `sender='user'` rows. No server of its own in the middle.
3. **Draws with the playground's renderer**: `site/lib/yl/yl.mjs` parses, `site/app/playground/presets.js` draws, and `mcp-app/src/events.mjs` writes the `[yui] ...` event lines. The Telegram Mini App (`spec/TELEGRAM.md`) and the MCP App already reuse them the same way.

An agent cannot tell the browser from the phone. Its taps arrive as the same event rows, its replies are the same rows, and the channel guide does not change.

## v1 scope

In:

- Sign in with Apple, sign out.
- The agent list with honest presence (`yui_agent_list.presence`), and each agent's thread.
- Send text. Every Yui Lines preset drawn in the thread, taps and submits sent as event rows, changed answers too (YL section 7).
- The stage (`>full`) as a full-window layer, pages `2` to `12` as screens the person swipes or arrows to, the saved-screen shelf, `talk` on a page.
- Reactions (hold or right-click a message, `spec/REACTIONS.md`) and replies (the `[yui] reply ...` line).
- Light and dark from the system, Reduce Motion from `prefers-reduced-motion`, each agent's look (`spec/AGENTS.md`, Look).
- An outbox like the phone's (RELAY.md, Delivery): each message is stored in IndexedDB with its id before the first try, and a resend that hits 409 counts as sent.

Out of v1, each says "Open on your iPhone" with the reason in one line: adding or pairing an agent, Settings > Agent access, invites, deleting the account, and push (v2, below).

## Translation table

What each preset does in a browser. A row not listed renders as it does in the playground.

| YL | In the browser |
| --- | --- |
| haptics (games, taps, timers) | dropped, silently |
| `timer` | keeps running while the tab is open. Time is kept from a start timestamp, so a background tab that throttles `setInterval` still shows the right time when it comes back. Beeps need one tap first (browsers block sound until then). No Live Activity and no lock screen: a closed tab stops the timer, and the pill says so when the thread opens again. |
| `camera` | `getUserMedia`, `facing` as `facingMode`. With no camera or no permission: a file picker (the fallback YL already names). `+scan` takes a plain photo. |
| `mic` | the Web Speech API where the browser has it, microphone through `getUserMedia`. Where it has neither: typing, as YL already says. `+auto` waits for a tap, because browsers need one. |
| `form` fields `photo`, `voice` | a file picker, and the mic button as in `mic` |
| `image +edit` | pointer events: draw with a mouse, pen or finger |
| the stage, `>full` | a layer over the whole window. A full screen button asks for the Fullscreen API; Esc and the X close it, like a swipe down on the phone. |
| pages `2` to `12` | one page at a time with the same dot row; swipe, arrow keys or a tap on a dot |
| reactions | hold, or right-click, a message |
| push | v2: Web Push, below. v1 has none; an open tab shows new messages as they land. |
| `game` | playable with a pointer and the arrow keys |
| anything that needs the phone | "Open on your iPhone" with a `yui://agent/<id>/thread` link, never a broken block |

## Push (v2)

Web Push with VAPID. `yui-push` gains `register` for a web subscription (endpoint and keys, `environment: "web"`), one row per browser in `yui_devices`, and sends through the Web Push protocol next to APNs. The same rules as the phone: muted agents stay quiet, and a browser open on that thread (the `presence` call) is skipped. On iPhone, Safari only allows Web Push for a web app added to the home screen, so the app stays the way to get Yui on a phone.

## Security

No new roles and no new tokens. The browser is a `yui_user` client with exactly the rights in `spec/AGENTS.md` (Who may do what) and `spec/RELAY.md` (Credentials): its own threads, `sender='user'` rows, nothing else.

- `yui-auth` accepts a second Apple audience, the web Services ID, next to the app's bundle id. The nonce works as it does on the phone: the page gives Apple `sha256(nonce)` and sends `yui-auth` the raw nonce.
- The access token lives in memory only. The refresh token is the one thing stored (IndexedDB), under a strict Content Security Policy that loads no script but the page's own and Apple's sign-in script. Sign out calls the `sign_out` grant, which revokes it.
- No service key, no connector token and no management token ever reach the browser.
- The edge functions it calls (`yui-auth`, `yui-agents`, later `yui-push`) answer CORS for the web app's origin only.
- Invites gate the browser the same way: an account the phone could not open, the browser cannot open.

## Not yet

- Desktop notifications without Web Push, an offline reading mode, and several windows on one thread.
- Adding agents from the browser. It is the natural next step after v1, and needs its own brief.
