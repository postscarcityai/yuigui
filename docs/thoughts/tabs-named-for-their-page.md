---
date: 2026-10-05
tag: call
title: "A page is named for what is on it"
dek: The tabs beside your chat used to read Screen 2. Now each one reads what it holds, like Workouts this week or Timer.
---

```compare
before: /progress/fb-ahcav8vw-tabs-before-dark.webp | Before: Home, Screen 2, Today's workout
after: /progress/fb-ahcav8vw-tabs-after-dark.webp | After: Workouts this week, Timer
```

A tester wrote in from the feedback button on Oct 5: "I don't like that this just says screen 2 in the top." They were right. A number tells you where a page sits. It does not tell you what is on it.

## The rule

A page takes its name from its content. The name it was saved under comes first. If it has none, the title of its first card, stat, list or sketch. If that is empty too, a plain word for what it holds, like Timer, List or Chart.

```phone
caption: Same page, two names.
sketch "Tabs" frame=phone before=Before
row "Home  Screen 2  Today's workout" +x note="a number"
after After
row "Home  Workouts this week  Timer" +hi note="what is on it"
```

"Screen N" never shows. Not in the tabs, not in the drawer, and not to VoiceOver, which reads the same name out loud.

## Light and dark

```shot
/progress/fb-ahcav8vw-tabs-after-dark.webp | Dark mode: the tab row reads Home, Workouts this week, Timer
/progress/fb-ahcav8vw-tabs-after-light.webp | Light mode: the same tab row, Workouts this week and Timer
```

Five unit tests cover the name picker. A UI test checks that no tab reads Screen, in both looks. This rides the next TestFlight build.
