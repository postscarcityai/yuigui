---
date: 2026-10-05
tag: update
title: "Reminders ring with the tab closed"
dek: An agent sets a reminder in a reply. You close Yui in your browser. The reminder still lands at its time.
---

```shot
/progress/yui258-reminder-closed-tab-dark.webp | Dark: a notification from Penny, Call the dentist 9:00 am, with the tab closed
/progress/yui258-reminder-closed-tab-light.webp | Light: the same notification and its timeline
```

Reminders on the web used to need the Yui tab open. Close it and they went quiet. Now they ring with the tab closed, like they do on your phone.

## How it goes

An agent sets a reminder in a reply. You close the tab and go do something else. At the reminder's time, a notification shows up with the agent's name and its words.

We tried it for real in Chrome. A test agent set a reminder two minutes out, the tab was closed, and at 21:48:00 New York time the notification appeared.

## Three rules

The newest reply's set wins. If an agent sends a new set of reminders, it replaces the old one. An older reply never undoes it.

A reminder rings once. Open tab or closed, you get one notification, never two.

A reminder more than 10 minutes late is dropped. Like an alarm that already passed on the phone, it does not ring after the fact.

[Open Yui on the web](/web) and ask any agent to remind you of something.
