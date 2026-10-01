---
date: 2026-10-01
tag: why
title: Yui comes to the web
dek: Yui is opening in a browser tab at www.yuigui.com/web, one to one with the iPhone app. Why we are doing it, what is live today, and what comes next.
---

```phone
caption: The plan in one screen. Tap it, it is live.
sketch "Yui on the web" frame=window
row "iPhone app: today"
row "A browser tab: the same Yui" +hi note="in progress"
```

Chris, Oct 1: "Let's bring Yui to the web!" So we are. The app stays the home of Yui. The web is a second door into the same account, the same agents and the same threads.

## Why parity

```compare
before: A new person needs an iPhone.\nA link from a friend opens a page that asks them to install something.\nOn a computer, no Yui. | Today
after: Open www.yuigui.com/web.\nSign in with Apple.\nYour agents and your threads are there. | In a browser tab
```

A web Yui that does half of what the app does is a demo. People would learn the demo, then meet the real thing and find it different. So the rule is one to one. Every feature in the app has a row in the parity map, 124 of them, and each row says what the web does.

```shot
/progress/yui240-parity-390-light.webp | Light mode, phone width: the parity summary table, one row per area of the app with its row count and how many are the same, a web way or iPhone.
/progress/yui240-parity-390-dark.webp | Dark mode, phone width: the same parity summary table.
```

## What the web does differently

Some things only a phone can do. A browser has no lock screen, no widgets and no keychain. The map does not hide that. Each row gets one of three answers.

```phone
caption: The three answers in the parity map.
list "Same, or a web way, or iPhone" "Same: the web does exactly what the app does" "Web way: the same result by a different road" "iPhone: the web says Open on your iPhone, with one line of why" +check
```

Examples. Push becomes Web Push. The lock screen timer becomes a timer that counts from a start time. Haptics are gone. Widgets and Live Activities say "Open on your iPhone". Never a broken block.

```shot
/progress/yui240-differs-desktop-light.webp | Light mode, desktop: where the web differs from the phone: haptics, keychain, Face ID, push, Live Activity, widgets, each with its web way.
/progress/yui240-differs-desktop-dark.webp | Dark mode, desktop: the same differences table.
```

## What landed

Three pieces are live. Sign in, the thread and the stage.

```phone
caption: The web epic so far.
timeline "Yui on the web" fold=0
done "The parity map and the plan" at="Oct 1"
done "Sign in with Apple, and a session that stays" at="Oct 1"
done "The live thread, every screen drawn" at="Oct 1"
done "The stage, screens 2 to 12, talk on a screen" at="Oct 1"
```

Sign in with Apple opens in a popup, and it is the same Apple ID as the app. Close the tab, come back, and you are still signed in.

```shot
/progress/yui241-signin-390-light.webp | Light mode, phone width: Yui on the web with a Sign in with Apple button.
/progress/yui241-account-390-dark.webp | Dark mode, phone width: signed in, with a Sign out button.
```

The thread reads and writes the same rows the app does. A tap sends the same line the phone sends. Try it with no sign in: the demo runs a recorded thread with a scripted agent, and nothing leaves your tab.

```shot
/progress/yui242-thread-390-light.webp | Light mode, phone width: Penny's thread with a stat and a choice screen drawn in the thread.
/progress/yui242-thread-390-dark.webp | Dark mode, phone width: the same thread.
```

The stage comes first, as on the phone. The agent's home, its shortcuts, and a reply that plays one picture and a line at a time.

```shot
/progress/yui243-home-390-light.webp | Light mode, phone width: Penny's home with the face, what waits on you, two shortcut chips and the composer.
/progress/yui243-home-390-dark.webp | Dark mode, phone width: the same home.
```

```try
/web?demo=penny | Try the web thread
```

## What is next

```phone
caption: The queue, in order.
timeline "Next on the web" fold=0
next "The composer: photos, voice, mentions, reactions" at="YUI-244"
next "Agents: the drawer, add, rename, connect" at="YUI-245"
next "Every preset at parity" at="YUI-246"
next "Settings and account" at="YUI-247"
next "Notifications with Web Push" at="YUI-248"
next "One Yui across phone and web" at="YUI-249"
next "The parity sweep and the launch" at="YUI-250"
```

Two honest limits today. The demo is the way in until one Apple setting, the web Services ID, is registered for the real sign in button. And some rows are marked open in the map. Those are the next stories, not forgotten ones.

Every story lands on the site with a demo, in light and dark, the day it is done.

```try
/developers/browser | Read the plan
/progress | Every change, with the shots
```
