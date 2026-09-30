---
date: 2026-09-30
tag: release
title: "Your first minute with Yui"
dek: What a stranger sees on a fresh phone with build 380, in order. The crew picker, Arnold's five questions, then a week that is already built. Plus the five snags we found and will fix next.
---

```shot
/progress/ship061-crew-dark.webp | The crew picker: Yui, plus Arnold, Basil and Penny to add, and a Start button
```

Open Yui for the first time on build 380 and you meet the crew picker. Yui is already checked. Add Arnold, Basil, Penny, or none of them. Tap Start.

We timed a stranger on a fresh phone. Launch to the picker took 12 to 15 seconds. Picking three agents and tapping Start took about 25. Yui said hello 2 seconds later.

```shot
/progress/ship061-hello-dark.webp | Yui's first message: five taps and you have a week you will actually do, with a Your first plan card
/progress/ship061-intake-dark.webp | Your first plan, step 3 of 5: how long per session, with 45 min chosen
```

Yui's hello has one card on it: Your first plan. Open Arnold and he asks five questions, one at a time. What you train for. How many days. How long. What you have. How much you have lifted. Each one is a tap, not a form.

```shot
/progress/ship061-this-week-dark.webp | This week: 0 of 3 workouts, Mon Wed Fri Full body, and a Rebuild my split button
```

Tap Build my week. This week, Today and Streak fill in from your answers, and a starter session is ready to go. That is the whole first minute: pick, answer, train.

## Five snags, next

The same cold run found five rough spots. We are fixing them next.

```shot
/progress/yui218-pairing-dark.webp | The Add agent sheet: three commands to run on the computer, then a six digit code
```

One: Open on Arnold's card lands on his page, not on his first question. It took 25 seconds to reach the intake. Two: after the four step intake we saw, Arnold asked two more questions, and no plan was built inside two minutes. Build 380 moves to five questions and a built week, and we will time it again.

Three: Add an agent hides behind the agent bar. Four: the pairing sheet asks for three commands, and it should be one. Once the code was in, the computer paired and the screen came back in about 8 seconds, so the wait is only in getting there.

Five: no push banner showed on the simulator. We need a real phone to know if that is the test or the app.

```shot
/progress/yui218-screen-back-dark.webp | A new agent, Nova, answers Hi with a card, Hello from your Mac
```

The whole run, sign in to a paired agent answering, took about 6 minutes. Deleting the account took 17 seconds to reach and 4 to finish, and left nothing behind.

## After the fixes

Two of the five snags are fixed, and we timed them again.

```compare
before: Open to the first question: about 25 s\nSend to a built week: over 120 s | The cold run
after: Open to the first question: under 5 s\nSend to a built week: about 2 s | Now
```

```compare
before: /progress/yui225-before-dark.webp | Before: Open landed on the trainer's page
after: /progress/yui225-after-dark.webp | After: Open lands on step 1 of 5
```

```compare
before: /progress/yui228-send-dark.webp | Send, with the five answers in
after: /progress/yui228-built-week-dark.webp | About 2 seconds later: the week is built
```

## What to try

Build 380 is on TestFlight. Delete Yui, install it fresh, and time your own first minute. Something slow or confusing? The feedback button in TestFlight goes straight onto the board.

```try
/progress | See each change with its screens
/thoughts/yui-0-6-0-build-370-several-chats-your-own-keys | Yui 0.6.0, build 370
```
