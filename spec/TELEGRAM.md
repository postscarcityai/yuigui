# Yui in Telegram (INT-4)

The same Yui Lines, drawn in Telegram, for when the Yui app is not around. It is the insurance policy from the roadmap: if the app stalls in review, an agent's screens still reach people.

Two pieces:

- **The renderer** turns an agent reply into Telegram Bot API messages. Questions become buttons under the message, text becomes formatted text, and everything Telegram cannot draw goes behind one **Open in Yui** button. Code: `adapters/telegram` in the app repo (github.com/postscarcityai/yui).
- **The Mini App** at `yuigui.com/tg` draws the whole screen inside Telegram with the same renderers as the playground, in the chat's own theme colors, and sends taps back to the bot.

Status: step 1 shipped Sep 25. The renderer, the tap handler, the Mini App page and the checks that sit between them are done and tested. No bot runs it yet. Step 2 is a bot you run (or Yui hosts) that calls these functions, and that needs a Telegram bot of its own.

## What each preset becomes

| Yui Lines | In Telegram |
| --- | --- |
| `ask`, `choose` | the question in bold, one button per option. A tap answers in place: the chosen button gets a check, and a later tap on another option sends a changed answer. `+other` adds **Type your own**, which opens the Mini App. |
| `pick` | a box per option (☐ / ☑) that toggles in place, then **Done** (or the `submit=` label) sends the picks. `max=` stops at the limit. |
| `card` | bold title, sub line, body. `url=https://...` becomes a link button. `cta=` alone becomes a button that sends `cta`. |
| `say` | a message. |
| `list` | a message: bullets, numbers with `+num`, boxes with `+check` (ticks stay quiet, as in the app). |
| `stat` | its text: `Weight 178.9 lb, down 2.3 (this week)`. |
| `table` with rows | a monospaced table. A live data table (`table meals`) opens in the Mini App. |
| `step` | consecutive steps become one numbered message, equations in code. |
| `timeline` | ✓ done, ▶ now, ○ next. `+reorder` also lists it under Open in Yui, where dragging works. |
| `timer`, `slide`, `form`, `image`, `camera`, `mic`, `gallery`, `video`, `compare`, `storyboard`, `chart`, `math`, `calc`, `deck`, `plan`, `project`, `narrate`, `game`, `custom` | listed by name in one **Open in Yui** message, placed where the first of them was. Its button opens the whole screen in the Mini App. |

Text outside ```` ```yui ```` fences is sent as a plain message. Screens (`>2`) and the stage do not exist in Telegram, so everything goes in line order (YL.md section 10). `+lock` shows the question with no buttons. Every preset in `yl.mjs` is covered, and a test fails when a new preset has no mapping.

## Taps come back as the phone's line

Telegram limits a button's `callback_data` to 64 bytes, so a button carries only `y:<token>:<index>`, and the component (its YL id, options, quiz answer, what was sent last) is kept under the token in a store the bot supplies. A tap turns back into exactly the event the phone sends (RELAY.md, "App to agent: events"):

```
[yui] n2 choose choice=Legs
[yui] n2 choose changed choice=Pull
[yui] n1 pick picked=Bands|Dumbbells
[yui] n1 ask answer="Not yet"
[yui] n1 card cta="Start workout"
```

The app's rules hold: an answer can change and says `changed`, an identical answer is not sent twice, a graded quiz carries `correct`, a screen brought back with `show` carries `saved`. The event formatter is the one the MCP App uses, copied from yuigui, not rewritten.

## The Mini App

`yuigui.com/tg?yl=<code>[&agent=Name][&bridge=<url>]`. The code is the whole fence packed like a share link (base64url of raw deflate), so the page parses the same lines and every id matches. A `t.me/<bot>/<app>?startapp=<code>` link works too for short screens. `?demo=<playground sample>` shows a sample.

- **Theme.** It reads `Telegram.WebApp.colorScheme` and `themeParams`: the background, text, hint and button colors are Telegram's, the header and background are set to match, and it follows a theme change live.
- **Taps.** Quiet events (a timer starting, a checklist tick) stay on the page, as on the phone. An answer goes back one of two ways, both carrying the event line:
  1. **The bridge**, when the link has `bridge=https://...`: the page POSTs `{initData, line, event}` there. Works from inline buttons. The bot must check `initData` with its token before it trusts who sent the line (`verifyInitData`, Telegram's HMAC check).
  2. **`WebApp.sendData(line)`**, otherwise. Telegram only allows it when the Mini App was opened from a reply-keyboard button; the bot gets it as `web_app_data`.
  Outside Telegram the page still draws, and a tap says to open it in Telegram.
- **Privacy.** The page holds no secret and stores nothing. Analytics sees `/tg` without the screen code. Links over 4096 characters are not sent as buttons; the message says the screen waits in the Yui app.

## For a bot

```ts
import { MemoryStore, render } from "./src/render.ts";
import { replies, tap } from "./src/taps.ts";
import { readBridgePost, readWebAppData } from "./src/webapp.ts";

const store = new MemoryStore(); // or your KV
const { messages } = await render(agentReply, { store, agent: "Coach", bridge: "https://bot.example.com/yui" });
for (const m of messages) await telegram("sendMessage", { chat_id, ...m });

// callback_query
const t = await tap(cb.data, store);
for (const c of replies(cb, t)) await telegram(c.method, c.params);
if (t?.line) sendToAgent(t.line);
```

`node yui-telegram.ts render reply.md` prints the calls without a bot; `--tap 0,1` presses buttons and prints the lines they send.

## Tested

- `render.test.ts`: every preset in `yl.mjs` (plus `custom`) lands as buttons, text or in the Mini App, nothing dropped; all 61 playground samples render; text presets, escaping, card buttons, keyboard layout, the too-big case, the link holds the same ids, share codes match yuigui's decoder.
- `taps.test.ts`: round trips for ask, choose, pick, quiz, card, `show`, changed answers and repeats, `max=`, stale and foreign callback data, the 64-byte limit, the answerCallbackQuery and editMessageReplyMarkup calls.
- `webapp.test.ts`: initData checked against Telegram's algorithm, tampered, expired and wrong-token data refused, sendData and bridge payloads.
- `miniapp_e2e.mjs` (Playwright): every playground sample in Telegram's dark and light themes with no page error, the adapter's link opens the same screen, a tap through sendData and through the bridge arrives as the phone's line with initData the bot verifies.

## Not yet

- A running bot (step 2): the bot token is a BotFather step and stays with the owner. Then a live test against a throwaway bot and chat.
- Media as Telegram albums, charts as pictures, a plan asked one question at a time (YL.md section 10's longer list). Today those open in the Mini App.
- A listed public bot. That is public, so Chris signs off first.
