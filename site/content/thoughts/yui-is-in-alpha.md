---
date: 2026-09-26
tag: release
title: Yui is in alpha
dek: The MVP is done. Anyone with an iPhone on iOS 26 can install Yui from TestFlight, connect their own agent and get screens back. Here is what the MVP promised, how four days got it there, and what comes next.
---

```shot
/progress/alpha-home-phone-light.webp | The yuigui.com home page on a phone: MVP done, alpha on TestFlight, the headline, Download on TestFlight and Star on GitHub stacked, and the video below.
```

Today the MVP is done. Yui is in alpha, open to anyone with an iPhone on iOS 26 through TestFlight.

The MVP was one promise, in six steps. Someone outside our team, with an agent of their own, can do all six without help from us. Each one works today. Here they are, on a phone.

## 1 and 2: install it, sign in

```shot
/progress/yui27-signin.webp | The Yui sign-in screen: the coral wordmark, Sign in with Apple, and three small links under it: How it works, Your privacy and Help.
```

Yui installs from a public TestFlight link. No invite, no waitlist. Apple approved the beta on Sep 24.

Then Sign in with Apple. No password to make up, no email to confirm.

```try
https://testflight.apple.com/join/ykrYHwet | Get Yui on TestFlight
```

## 3: connect your agent in minutes

```shot
/progress/site46-code-light.webp | Add agent in Yui: the new agent Nova with a 6-digit pairing code and the commands to run on your computer.
/progress/site46-connected-light.webp | Nova is connected: a green check, Running on your Mac, and a Say hi to Nova button.
```

Add an agent in the app and you get a six-digit code. One command installs the Yui plugin where your agent runs. The code pairs it. That is the whole setup.

## 4: screens back, and you can change your mind

```phone
caption: A real screen. Tap one, then tap another. The agent hears the change.
say "Morning. What are we training?"
choose "Which split today?" Push|Pull|Legs
```

Your agent answers with buttons, choices, forms and timers, not walls of text. Tap the wrong one and tap again: the agent gets your new answer, marked as a change.

## 5: a buzz when it answers

```shot
/progress/yui24-push.webp | An iPhone home screen with a Yui notification from Coach: Your plan for tomorrow is ready.
```

Close the app and walk away. When your agent finishes, you get a push, and a tap opens the thread where it answered.

## 6: delete it, and it is gone

```shot
/thoughts/yui-is-in-alpha-delete.webp | Yui settings with the delete sheet up: Delete your Yui account? This permanently removes your account, your paired agents and devices, and every message stored on Yui's servers. Yui is also removed from your Apple ID. A red Delete my account button and Keep my account under it.
```

Settings, Delete account, one more tap. Your account, your paired agents and devices, and every message on our servers go. So does Yui's link to your Apple ID.

## Four days

```phone
caption: From the first TestFlight build to alpha.
stat 4 "Days from first build to alpha" sub="Sep 23 to Sep 26"
stat 34 "TestFlight builds"
timeline "How it got here" fold=0
done "First build on TestFlight" at="Sep 23"
done "Sign in with Apple, and delete in the app" at="Sep 23"
done "The first six screens in chat" at="Sep 23"
done "Apple approves the public beta" at="Sep 24"
done "One-command install, and push" at="Sep 24"
done "Yui 0.2.0: each agent gets a home" at="Sep 25"
done "Yui 0.3.0: fast like a messenger" at="Sep 26"
done "The MVP is done" at="Sep 26"
```

The first build went to TestFlight on the evening of Sep 23. Apple approved the public beta the next day. Two releases later, the MVP is done.

Every step is on the record. Every commit, build and screenshot is public.

```try
/timeline | Watch it grow, day by day
/progress | Every change, with pictures
```

## What alpha means for you

```shot
/progress/site46-start-desktop-dark.webp | yuigui.com/start in dark mode: the other ways in, two cards per row, each with its own command.
/progress/site46-first-dark.webp | After pairing: Nova says hi and sends its first screen, a choice of three buttons, dark mode.
```

Yui is the screen. The brains are yours. Yui does not answer on its own yet, and there is no hosted agent. You bring one.

Hermes pairs in one command. OpenClaw has its own plugin. Anything that speaks MCP or A2A can join, a webhook works for the rest, and a local model on your own machine counts.

Alpha means it works, and it will change. Things will break. The feedback button in TestFlight goes straight onto our board, and a lot of what shipped this week started there.

```try
/start | Connect your agent
https://testflight.apple.com/join/ykrYHwet | Get Yui on TestFlight
```

## What comes next

```phone
caption: The queue after the MVP, in order.
timeline "Next" fold=0
done "The MVP" at="Sep 26"
next "A stranger runs the whole path, with a stopwatch"
next "The app runs flows, then My flows"
next "Group threads"
next "The working row says what your agent is doing"
```

First, the real test. Someone we have never met installs Yui, connects their agent and runs all six steps with a stopwatch. That runs during the alpha, and whatever trips them up comes first.

Then the backlog, in the roadmap's order. Flows in the app, group threads, and a working row that tells you what your agent is doing.

Using Yui early counts. [Here is how we think about that](/business/use-to-earn).

```try
/roadmap | See the whole roadmap
/thoughts/flows-and-the-library | Read about flows
```
