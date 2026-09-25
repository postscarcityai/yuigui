# Feature: Yui in the browser
Who it is for: anyone who uses Yui on an iPhone and also sits at a computer, and people who want to try Yui before they have the app.
The moment: at a desk, an agent sends a screen, and the person answers it in a tab instead of picking up the phone.
What the screen shows: the agent list, then a thread drawn exactly like the phone draws it: the same Yui Lines presets, the stage as a full-window layer, pages 2 to 12, reactions. The spec: https://www.yuigui.com/developers/browser
Done when: an agent's reply shows in the tab, a tap in the tab reaches the agent as the same `[yui] ...` line the phone sends, and nothing the browser cannot do breaks: it says "Open on your iPhone".
Not in scope: adding or pairing agents, invites, account settings, push (v2).

Status: open for contributors, humans or agents. Build to earn (https://www.yuigui.com/earn). Card YUI-71. Size of the whole feature: L, in four pull requests. Only the first is open now.

## The plan, in pull requests

1. **The thread, offline** (open now, below). A thread page drawn from a recorded thread, no sign-in, no network.
2. **Live** (after 1 merges). Sign in with Apple JS and the relay. Needs two server changes the maintainers make first: a second Apple audience in `yui-auth` and CORS on the edge functions (spec, Security).
3. **The outbox** (after 2). Messages and taps survive a closed tab or a dropped network (spec/RELAY.md, Delivery).
4. **Push** (v2). Web Push through `yui-push`.

## First pull request: the thread, offline

Goal: a page at `/web` in the hub site (`site/app/web/`) that draws a thread from a fixture and shows, for every tap, the event row it would send. It proves the renderer, the stage, the pages and the event lines in a browser before any account or server is involved.

Build:

- `site/app/web/fixtures/` with one or more recorded threads: JSON arrays of `yui_messages` rows (`id, sender, kind, body, meta, created_at`, shape in spec/RELAY.md, Messages). Use the playground samples in `site/lib/yl/samples.mjs` as the agent replies; write the fixtures by hand, no real messages.
- The thread: text outside ```` ```yui ```` fences as chat bubbles, each fence parsed with `yl.mjs` and drawn with `Render` from `site/app/playground/presets.js`. Follow `site/app/tg/TgApp.js`, which already does this for Telegram.
- The stage and pages: `>full` as a full-window layer with the Fullscreen API behind a button; lines routed to `2` to `12` as pages with a dot row, arrow keys and swipe (spec/YL.md section 5, `pageOf`).
- Taps: each event becomes a new `sender='user', kind='event'` row built with `eventLine` and `echoFor` from `mcp-app/src/events.mjs`, appended to the thread (the echo shows as the person's reply, quiet events stay hidden), and printed in a small "would send" panel under the thread.
- Reactions: hold or right-click an agent message, six emoji, and the `[yui] react ...` row (spec/REACTIONS.md).
- The browser column of the translation table in the spec: timers from a timestamp, camera and mic through `getUserMedia` with their fallbacks, no haptics.

Acceptance:

- Every playground sample renders in `/web?demo=<sample>` with no error line that the playground does not show too.
- For the same tap, the row in the "would send" panel is byte for byte the line the playground's wire log shows.
- A thread with lines on `>2` and `>3` gets two pages, arrow keys move between them, and a later patch (`~timer`) updates the page without moving the person.
- A workout timer (`timer 40/20x8`) opens on the stage, keeps the right time after the tab sat in the background for a minute, and closing the stage leaves a pill in the thread.
- Light and dark follow the system; `prefers-reduced-motion` swaps motion for fades.
- `cd site && npm run build` passes, and `node bench/test.mjs` and `cd spec/conformance && node run.mjs` still pass.
- No sign-in, no network call, no token, no real message anywhere in the change.

How to test against the playground:

1. `cd site && npm install && npm run sync && npm run dev`.
2. Open `/playground`, pick a sample, tap through it, and keep the wire log open.
3. Open `/web?demo=<the same sample>` in a second window, make the same taps, and compare the "would send" panel with the wire log.
4. Try it at 390 px wide and at desktop width, in Safari, Chrome and Firefox, light and dark.
5. Put screenshots of both windows in the pull request.

Rules: CONTRIBUTING.md in the hub repo. Plain words in the UI, no em dashes, no developer tooling in what a person sees (the "would send" panel is for `?demo=` only). Say in the pull request if an agent made it, and show the test output.
