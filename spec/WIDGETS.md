# Widgets and Siri | spec v1 (YUI-40 steps 1 to 4, Sep 26 and Sep 30 2026)

Today an agent's screen lives in its thread. To see your weight trend or tick off today's list you open Yui, pick the agent and find the screen. Widgets and Siri take Yui out of the app: a saved screen pinned to the home screen or the lock screen, kept current by the agent, with buttons that work without opening anything, and three things you can say to Siri or put on the Action button.

Status: built, riding the next daily build. Steps 2 to 4 landed in the app on Sep 30: widget buttons, three Siri intents, the Talk to Yui control and the widget push relay. The playground mock still runs at [/playground?demo=widgets](/playground?demo=widgets).

| | State |
|---|---|
| Widget on the home screen and lock screen: small, medium, rectangular, circular, inline | **Live** |
| `+check` ticks and `cta` buttons on the widget | **Live** |
| Timer Start and Pause on the widget, as a Live Activity | **Live** |
| Offline queue: a tap with no signal goes out later, in order | **Live** |
| Siri and Shortcuts: Ask an agent, Show a saved screen, Start a timer, Log my food, Tell Basil what I ate, Start my workout | **Live** |
| Talk to Yui control: Control Center, lock screen, Action button | **Live** |
| Spotlight finds agents and saved screens by name | **Live** |
| Widget push relay (`yui_widgets`, `yui-widgets`, 15 minute coalescing) | **Live** |
| Large widget size, the StandBy layout | Later |
| Pin as widget on the shelf (step 1) | **Live** |
| A channel guide sentence about widgets | Later |

What it looks like in the app, from the simulator. Tick Walk 30 min and Start the timer, straight from the widget: Start becomes Pause and the event reaches the agent with `via=widget`.

<p class="shot"><img class="shot-light" src="/demo/widgets-buttons-light.webp" alt="Two saved screens as widgets: Today with Walk 30 min ticked, and a Tabata timer counting 0:19 with a Pause button" loading="lazy"><img class="shot-dark" src="/demo/widgets-buttons-dark.webp" alt="The same widgets in dark mode: the Today list and a Tabata timer at 0:19 with a Pause button" loading="lazy"></p>

```
 agent  --lines-->  relay (yui_messages)  --widget push-->  iPhone  -->  WidgetKit asks Yui's widget for a new timeline
                                                                     widget reads the new rows, applies the patches, draws
 widget button  --App Intent-->  event row on the relay  -->  agent (same event as a tap in the thread, plus "via":"widget")
 Siri / Shortcuts / Action button  --App Intent-->  ask an agent, show a saved screen, start a timer
```

The relay, as built:

```
 agent patches a pinned id
        |
        v
 yui-push (15 min coalescing, timer at once)
        |  widget push
        v
 iPhone widget  --reads new rows-->  yui-widgets (read)  -->  redraws from its app group copy
        |
 tick / Start / cta  --App Intent-->  yui-widgets (event)  -->  agent gets the tap, "via":"widget"
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
- **Timers (live):** the Start intent is a `LiveActivityIntent`, so it runs in the app's process and can start the Live Activity the timer already has; the lock screen and the Dynamic Island then carry the running clock, and the widget shows Pause.

## 6. Siri, Shortcuts and the Action button (live)

Eight App Intents. The first three each take an entity so one intent covers every agent and every saved screen ([App Intents](https://developer.apple.com/documentation/appintents)):

| Intent | Say it | What happens |
|---|---|---|
| Ask an agent | "Ask Coach in Yui" or "Message Coach in Yui" | Siri asks "What do you want to ask?", sends the words to that agent's thread as a normal message, and answers "Sent to Coach". The reply comes as a push, screens and all. |
| Show a saved screen | "Show workout in Yui" or "Open workout in Yui" | Opens Yui on that agent's thread with the saved screen on the stage. (A widget-sized view in Siri's sheet first is later.) |
| Start a timer | "Start Tabata in Yui" | Starts the saved timer's Live Activity without opening the app (a `LiveActivityIntent`), and sends `started` like the widget button. |
| Log my food (YUI-253) | "Log my food in Yui", "Log a meal in Yui" or "Snap my food in Yui" | Opens Yui straight on Basil's camera (`yui://snap?agent=basil`), from any thread. No chat first. Hold to say what it is, let go to send. |
| Tell Basil what I ate (YUI-253) | "Tell Yui what I ate" or "I ate something in Yui", then say "a bacon cheeseburger with fries" | Sends `Log a meal: <your words>` to Basil through the outbox and answers "Logged" without opening the app. Basil's answer, the meal and today's calories, arrives as a push. |
| Talk to an agent (YUI-40 step 5) | "Talk to Yui" or "Start talking in Yui", or the Action button | Opens the thread of the agent you pick, or your default agent when you pick none (Yui's own thread when none is marked), with hands-free voice on. |
| Open an agent (YUI-40 step 5) | "Open Coach in Yui" | Opens that agent's thread. It is also what a Spotlight tap on an agent runs. |
| Start my workout (YUI-253) | "Start my workout in Yui" | Opens Arnold's thread (`yui://agent/arnold/thread?workout=1`) and asks for today's workout, the same as the drawer's Start a workout. Start on that card runs the coached session (YUI-220). |

- **App Shortcuts.** An app can have at most 10 ([AppShortcutsProvider](https://developer.apple.com/documentation/appintents/appshortcutsprovider)). Yui ships eight (the build's metadata lists eight App Shortcuts, two under the cap), each phrase with the app's name in it, and lets the entity (the agent, the screen, the timer) fill the rest. They show in the Shortcuts app and in Spotlight with no setup.
- **Entities.** `AgentEntity` (the person's agents, by name), `ScreenEntity` (saved screens, by agent and name) and `TimerEntity` (saved timers) come from the app group's copy, so Siri can list them without the network.
- **Action button.** The person can put any App Shortcut on it. Talk to an agent is an App Shortcut, so it can sit on the Action button with no extra step. Yui also ships one control, "Talk to Yui" (a `ControlWidget`, iOS 18: Control Center, the lock screen and the Action button, [ControlWidget](https://developer.apple.com/documentation/widgetkit/controlwidget)), which opens the thread of the agent the person picked (the default agent when none) with hands-free voice on (YUI-14).
- **The app icon (YUI-191, shipped).** Drawer shortcuts go on the icon too. Hold the Yui icon and the shortcuts your agents put in their drawers show as home screen quick actions, up to four, newest used first and one per agent before any agent gets a second. An agent sends nothing new: `menu shortcut@log-food "Log food" say="Log food: "` is the same line as before, and Basil's now shows as "Log food, Basil". A tap opens that agent's thread and does what the drawer tap does (a `say=` ending in a space fills the composer, anything else is sent). The person picks in Settings > Home screen actions: toggle up to four, drag to order, and their picks win over the default. A shared agent's shortcuts show only for the person it is shared with, and a revoke removes them. No app group and no extension: the app sets them at runtime.
- **Hands off the red lines.** Siri only asks, shows and starts. None of the intents confirms a purchase, sends to anyone but the person's own agent, or deletes.

## 7. Spotlight

`AgentEntity` and `ScreenEntity` adopt `IndexedEntity` ([IndexedEntity](https://developer.apple.com/documentation/appintents/indexedentity)), so typing "workout" in Spotlight finds Coach's saved workout, and "Coach" finds the thread. Every agent is indexed, with or without a saved screen (the app writes the agent list into the app group each time it loads), and a tap runs Open an agent or Open a saved screen. Only names are indexed: agent names and saved screen names. Message text never goes into the index.

## 8. Privacy

- **The lock screen shows what the person pins.** Each widget has a "Hide on the lock screen until unlocked" switch in its edit sheet, on by default for lock screen sizes. Hidden, the value draws as dots (`privacySensitive()`), and the label stays.
- **The copy stays on the phone.** The app group holds parsed nodes of pinned screens only, protected until first unlock, and is deleted with the widget. It never holds the thread, keys or the channel guide.
- **The widget's token reads, never writes rows other than events.** It can read the person's own threads and insert event rows, the same two things a tap in the app does. It cannot send messages as the person; asking an agent goes through the app's own session, from the intent.
- **No developer tooling on screen:** no raw lines, ids or JSON on any widget, Siri sheet or Spotlight row.

## 9. What the channel guide gains

One sentence, added when step 2 ships (not before, so no agent tells people about a widget their build does not have): "A saved screen can be pinned as a widget. Keep it current with patches to its ids, not by sending it again."

## 10. Steps 2 to 4, the build

Shipped Sep 30 (YUI-40 steps 2 to 4), riding the next daily build:

- The app group copy of each pinned screen, the widget kind `YuiSavedScreen` beside `TimerLiveActivity`, and the parser compiled into the extension. Sizes: small, medium and the three lock screen forms. Large is not built.
- Buttons: `WidgetTickIntent` (`+check`), `WidgetCtaIntent` (`cta`) and `WidgetTimerStartIntent` (a Live Activity intent), with an offline queue.
- The relay: the `yui_widgets` table, the `yui-widgets` function (register, event, push_token, read) and the widget push in `yui-push`, 15 minutes per pinned screen, a timer at once.
- Siri: `AskAgentIntent`, `ShowScreenIntent`, `StartTimerIntent` as App Shortcuts, the Talk to Yui control, and `AgentEntity`, `ScreenEntity` and `TimerEntity` indexed for Spotlight.
- Tests: `WidgetRelayTests` in the app, a widget gallery in the app that draws every pinned size, and a live relay test.

Step 5 (YUI-40, Oct 1 2026): `AgentRoster` in the app group (names, ids and which agent is the default, written whenever the agent list loads) feeds the Shortcuts picker and the Spotlight index, so an agent with no saved screen is still found. New intents: `TalkIntent` (the Action button; default agent when none picked), `OpenAgentIntent` and `OpenScreenIntent` (Spotlight taps). Tests: `WidgetRelayTests`.

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
