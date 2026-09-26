# Widgets and Siri | spec v0 (YUI-40 step 1, Sep 26 2026)

Today an agent's screen lives in its thread. To see your weight trend or tick off today's list you open Yui, pick the agent and find the screen. Widgets and Siri take Yui out of the app: a saved screen pinned to the home screen or the lock screen, kept current by the agent, with buttons that work without opening anything, and three things you can say to Siri or put on the Action button.

Status: design only. Nothing in the app changed, no account was made, nothing was spent. The mock runs in the playground: [/playground?demo=widgets](/playground?demo=widgets). Building it natively is step 2.

```
 agent  --lines-->  relay (yui_messages)  --widget push-->  iPhone  -->  WidgetKit asks Yui's widget for a new timeline
                                                                     widget reads the new rows, applies the patches, draws
 widget button  --App Intent-->  event row on the relay  -->  agent (same event as a tap in the thread, plus "via":"widget")
 Siri / Shortcuts / Action button  --App Intent-->  ask an agent, show a saved screen, start a timer
```

## 1. A widget is a pinned saved screen

The grammar already has the piece a widget needs. `save today` puts a screen on the agent's shelf ([Yui Lines](/yl), section 5), and an `@id` on a saved screen lasts, so a later reply can patch it: `~weight 178.4lb delta=-2.8`. A widget is one of those saved screens, pinned outside the app.

- **The person pins, not the agent.** iOS only lets a person add a widget, from the home screen's widget gallery. They add "Yui", then pick the agent and one of its saved screens in the widget's edit sheet (an `AppIntentConfiguration` whose parameter is the saved screen). The shelf gets a shortcut too: hold a saved screen, **Pin as widget**, and Yui shows the two steps with the screen already chosen.
- **No new line.** Pinning is the person's choice, the content is the saved screen, and freshness is the patches the agent already sends. So there is no `widget` word, no parser change and no new conformance vectors. An agent that thinks a screen deserves a widget says so with a `card`; the person does the rest. (Question 6 asks whether a hint like `save today +widget` is worth a word later.)
- **What it draws.** The first components of the saved screen that fit the size, top to bottom, in the agent's look (the same palette the timer's Live Activity already wears). A screen with more than fits ends in a quiet "2 more in Yui" row, never a clipped line.

## 2. Which presets, which sizes

Widgets are drawn once and archived: no scrolling, no text fields, no gestures beyond a tap and a button ([WidgetKit](https://developer.apple.com/documentation/widgetkit)). So only presets that read at a glance get a widget form. Every other preset on a saved screen shows as its title with an Open button that opens the screen in Yui.

| Preset | Small | Medium | Large | Lock screen | Buttons on the widget |
|---|---|---|---|---|---|
| `stat` | value, delta, label | value, delta and the spark | stat above the rest of the screen | circular: value in a ring; rectangular: value, delta, label; inline: `Weight 178.9 lb ▼2.3` | `cta` if it has one |
| `chart` (line, bar, area) | the line alone, last value in the corner | title, line, last value | the chart with axes, no tooltips | rectangular: the line and the last value | none |
| `chart` (pie, donut) | the donut and its total | donut and legend | donut and legend | circular: the donut | none |
| `list` | title and the first 3 items | the first 4 items | the first 8 items | rectangular: the next unchecked item | `+check`: each row is a toggle |
| `timer` | label and the time, Start | ring, time, Start or Pause | same, bigger | circular: the ring | Start, Pause (a running timer is the Live Activity from YUI-30) |
| `card` | title and sub | title, body's first line, sub | title, body, picture | rectangular: title and sub | `cta` if it has one |
| `timeline`, `done`/`now`/`next` | the now row | now row and the next 2 | the last 2 done, now, next 3 | rectangular: the now row; inline: `Now: War room panels` | none |
| `table` (agent table) | row count | the last 3 rows | the last 8 rows | none | none |

**StandBy** (the phone on its side, charging) shows small widgets big. It is the small layout, redrawn at the system's own rate, which does not count against the budget below.

**Not on a widget, on purpose:** `ask`, `form`, `pick`, `slide`, `camera`, `mic`, `game`, `deck`, `plan`, `flow`, `gallery`, `video`, `math`, `calc`. They need a keyboard, a camera, a swipe or a sequence of taps. Their title and Open button stand in. `choose` is question 2.

## 3. Staying fresh: pushed, never polled

WidgetKit gives each widget a budget of reloads a day, typically **40 to 70** for a widget the person looks at often, spread over the day ([Keeping a widget up to date](https://developer.apple.com/documentation/widgetkit/keeping-a-widget-up-to-date)). Reloads while Yui is in the foreground, after a widget button's App Intent, and in StandBy do not count. Since iOS 26 a server can ask for a reload with a WidgetKit push ([Updating widgets with WidgetKit push notifications](https://developer.apple.com/documentation/widgetkit/updating-widgets-with-widgetkit-push-notifications), [WidgetPushHandler](https://developer.apple.com/documentation/widgetkit/widgetpushhandler)). Those are budgeted too and arrive when the system chooses, so they add to timelines and do not replace them.

So Yui's widget never polls. Its timeline policy is `.never`, and every reload has a reason:

1. **The app knows what is pinned.** On launch and when it comes forward, the app reads `WidgetCenter.getCurrentConfigurations` and tells the relay which saved screens this phone has pinned: a new table `yui_widgets` (device, agent, screen name, the lasting ids on it, the widget push token). Unpinned widgets are deleted from it the same way.
2. **The app leaves a copy.** Each pinned saved screen is written to the app group's container as the parsed nodes (not raw lines), with file protection until first unlock. The widget draws from that copy.
3. **An agent patches a lasting id on a pinned screen.** `yui-push` already sees every agent row. When a reply's patches hit an id listed in `yui_widgets`, it sends that phone a WidgetKit push (`apns-push-type: widgets`, topic `<bundle id>.push-type.widgets`, payload `{"aps": {"content-changed": true}}`). A reply of nothing but patches still sends no alert, as today; it sends only this silent reload. A reply that saves the same name again counts too.
4. **The widget catches up.** Its timeline provider reads the rows newer than its copy from the relay (REST, a read-only token for the person's own threads kept in the shared keychain), applies them with the same Swift parser the app uses (`YuiLines.parse(_:known:)`, compiled into the extension like `Shared/` is today), saves the new copy and returns one entry.
5. **Coalesced.** The relay sends at most one widget push per pinned screen per 15 minutes; a later patch in the window rides the next push. A timer starting or stopping is the exception and goes at once. An agent updating a dashboard every minute costs the phone at most four reloads an hour.
6. **Time moves on its own.** A running timer and a "2h ago" stamp count with `Text(timerInterval:)` and relative dates inside one entry, the way the timer's Live Activity already does, so a minute passing never costs a reload.

If the budget runs out, the widget shows its last copy with "as of 9:40" under it. It never shows a spinner and never a blank.

## 4. What a tap does

- **Tap the widget:** Yui opens on that agent's thread with the saved screen on the stage, exactly like tapping it on the shelf: no turn, no tokens (`widgetURL`, a `yui://` link with the agent and the screen name).
- **Tap a lock screen widget:** the same, after Face ID.
- **Tap a row with a link** (`done ... url=`): opens the thread, then the link, since a widget cannot open Safari straight away.
- A widget never opens anything the person did not pin: the link carries names, and the app checks both against its own shelf before it opens.

## 5. Buttons on the widget

Since iOS 17 widgets and Live Activities can hold buttons and toggles, and each runs an App Intent without opening the app ([Adding interactivity to widgets and Live Activities](https://developer.apple.com/documentation/widgetkit/adding-interactivity-to-widgets-and-live-activities)). Small, medium, large, and the circular and rectangular lock screen sizes can have them. On a locked phone they wait for Face ID. Apple's rule: a button must do more than open the app; opening is the tap in section 4.

Yui's widget buttons send the same event a tap in the thread sends, with two extra keys: `saved` (already on every event from a saved screen, [Yui Lines](/yl) section 7) and `"via": "widget"`.

| On the widget | Event the agent receives |
|---|---|
| A `+check` row toggled | `{"id":"today","preset":"list","item":"Walk 30 min","checked":true,"saved":"today","via":"widget"}` |
| Start on a timer | `{"id":"focus","preset":"timer","started":true,"saved":"focus","via":"widget"}`, and the timer's Live Activity starts (YUI-30) |
| A `cta` on a stat or card | `{"id":"weight","preset":"stat","cta":"Log today","saved":"weight","via":"widget"}` |

- **Right away on the widget.** The intent flips the row in the app group copy and reloads the widget (free: reloads after an intent do not count). Then it writes the event row to the relay.
- **Offline:** the event waits in the app group and goes out at the next widget intent or app launch, in order.
- **The agent answers as usual.** Its reply lands in the thread with a push, like any other. If it patches the pinned screen, section 3 brings the widget along.
- **Timers:** the Start intent is a `LiveActivityIntent`, so it runs in the app's process and can start the Live Activity the timer already has; the lock screen and the Dynamic Island then carry the running clock, and the widget shows Pause.

## 6. Siri, Shortcuts and the Action button

Three App Intents, each with an entity parameter so one intent covers every agent and every saved screen ([App Intents](https://developer.apple.com/documentation/appintents)):

| Intent | Say it | What happens |
|---|---|---|
| Ask an agent | "Ask Coach in Yui" | Siri asks "What do you want to ask?", sends the words to that agent's thread as a normal message, and answers "Sent to Coach". The reply comes as a push, screens and all. |
| Show a saved screen | "Show workout in Yui" | Opens Yui with that saved screen on the stage. In Siri's sheet first: the widget-sized view of the screen, so a glance may be enough. |
| Start a timer | "Start Tabata in Yui" | Starts the saved timer's Live Activity without opening the app (a `LiveActivityIntent`), and sends `started` like the widget button. |

- **App Shortcuts.** An app can have at most 10 ([AppShortcutsProvider](https://developer.apple.com/documentation/appintents/appshortcutsprovider)). Yui ships exactly these three, each phrase with the app's name in it, and lets the entity (the agent, the screen, the timer) fill the rest. They show in the Shortcuts app and in Spotlight with no setup.
- **Entities.** `AgentEntity` (the person's agents, by name) and `ScreenEntity` (saved screens, by agent and name) come from the app group's copy, so Siri can list them without the network.
- **Action button.** The person can put any App Shortcut on it. Yui also ships one control, "Talk to Yui" (a `ControlWidget`, iOS 18: Control Center, the lock screen and the Action button, [ControlWidget](https://developer.apple.com/documentation/widgetkit/controlwidget)), which opens the thread of the agent the person picked with hands-free voice on (YUI-14).
- **Hands off the red lines.** Siri only asks, shows and starts. None of the intents confirms a purchase, sends to anyone but the person's own agent, or deletes.

## 7. Spotlight

`AgentEntity` and `ScreenEntity` adopt `IndexedEntity` ([IndexedEntity](https://developer.apple.com/documentation/appintents/indexedentity)), so typing "workout" in Spotlight finds Coach's saved workout, and "Coach" finds the thread. Only names are indexed: agent names and saved screen names. Message text never goes into the index.

## 8. Privacy

- **The lock screen shows what the person pins.** Each widget has a "Hide on the lock screen until unlocked" switch in its edit sheet, on by default for lock screen sizes. Hidden, the value draws as dots (`privacySensitive()`), and the label stays.
- **The copy stays on the phone.** The app group holds parsed nodes of pinned screens only, protected until first unlock, and is deleted with the widget. It never holds the thread, keys or the channel guide.
- **The widget's token reads, never writes rows other than events.** It can read the person's own threads and insert event rows, the same two things a tap in the app does. It cannot send messages as the person; asking an agent goes through the app's own session, from the intent.
- **No developer tooling on screen:** no raw lines, ids or JSON on any widget, Siri sheet or Spotlight row.

## 9. What the channel guide gains

One sentence, added when step 2 ships (not before, so no agent tells people about a widget their build does not have): "A saved screen can be pinned as a widget. Keep it current with patches to its ids, not by sending it again."

## 10. Step 2, the build

None of it is started:

- An app group and a shared keychain group for the app and `YuiWidgets` (a provisioning change, no new account).
- The widget kind in `YuiWidgets`, beside `TimerLiveActivity`: the sizes in section 2, the parser compiled into the extension, the app group copy.
- The WidgetKit push token (`WidgetPushHandler`), the `yui_widgets` table and the widget push in `yui-push`, with the 15-minute coalescing.
- The three App Intents, the App Shortcuts, the "Talk to Yui" control and the two indexed entities.
- **Pin as widget** on the shelf's hold menu.
- Tests: a UI test that pins a saved screen in the simulator, a push test that proves Apple accepts a widget push, and a budget log in the Speed panel (reloads a day per widget).

## Open questions for Chris

1. **Which sizes in the first build?** (a) small, medium and the rectangular lock screen widget; (b) every size in section 2, StandBy included; (c) lock screen only, the smallest first step.
2. **Can a widget answer a question?** A `choose` with two or three short options could be buttons on a medium widget. (a) yes, send the answer from the widget; (b) no, a question opens Yui.
3. **"Ask Coach" in Siri: wait or send?** (a) send and say "Sent to Coach", the answer comes as a push (the plan); (b) wait a few seconds and read the first line of the answer aloud when it is quick.
4. **What goes on the Action button by default in Yui's own suggestion?** (a) hands-free voice with Yui; (b) the last agent you talked to; (c) nothing, the person picks.
5. **Lock screen privacy default:** hide values until unlocked (the plan) or show them?
6. **A hint word later?** `save today +widget` could show Pin as widget right under the screen. It is a grammar change in five parsers, so the plan is to wait for the flywheel to show agents asking for it.
7. **When?** It fits the release after 0.3.0 (its own epic), or the Phase 6 slot the roadmap has it in now.

## Sources (read Sep 26 2026)

- Refresh budget, 40 to 70 a day, and what does not count: https://developer.apple.com/documentation/widgetkit/keeping-a-widget-up-to-date
- WidgetKit push updates (iOS 26), budgeted and opportunistic: https://developer.apple.com/documentation/widgetkit/updating-widgets-with-widgetkit-push-notifications and https://developer.apple.com/documentation/widgetkit/widgetpushhandler
- Buttons and toggles, the sizes that allow them, "more than open the app": https://developer.apple.com/documentation/widgetkit/adding-interactivity-to-widgets-and-live-activities
- App Intents and App Shortcuts (at most 10 per app): https://developer.apple.com/documentation/appintents and https://developer.apple.com/documentation/appintents/appshortcutsprovider
- Controls for Control Center, the lock screen and the Action button: https://developer.apple.com/documentation/widgetkit/controlwidget
- Spotlight for app entities: https://developer.apple.com/documentation/appintents/indexedentity
- What's new in widgets, WWDC25: https://developer.apple.com/videos/play/wwdc2025/278/
