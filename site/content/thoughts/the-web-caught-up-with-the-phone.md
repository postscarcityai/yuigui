---
date: 2026-10-04
tag: release
title: The web caught up with the phone
dek: Four fixes that landed on the phone first, now in your browser tab too. Each one in a picture.
---

```shot
/progress/web-tapback-light-after-back.webp | Light mode, phone width: the web stage back on the first part after a tap on the left side.
/progress/web-kept-flow-dark-after.webp | Dark mode, phone width: a flow after a reload, the fields still filled in.
/progress/web-noanswer-thread-after-light.webp | Light mode, phone width: a row reading No answer came back with Try again.
```

The phone got four small fixes this week. The web copied each one. Same rules, same feel.

## A question sits on the page it asks about

No more picture on one screen and the question on the next. The options draw right under what they ask about.

```shot
/progress/yui277-before-question-dark.jpg | Before, dark: the question alone on its own screen, with nothing to compare.
/progress/yui277-after-dark.jpg | After, dark: the pictures, the question and its options, all on one screen.
/progress/yui277-after-light.jpg | After, light: the same screen in the light theme.
```

## Tap the left side to go back a page

A tap on the left quarter goes back one part. The rest of the screen goes forward, as before.

```shot
/progress/web-tapback-light-after-next.webp | Light mode, phone width: the second part, after a right tap.
/progress/web-tapback-light-after-back.webp | Light mode, phone width: back on the first part, after a left tap.
/progress/web-tapback-dark-after-next.webp | Dark mode, phone width: the second part, after a right tap.
/progress/web-tapback-dark-after-back.webp | Dark mode, phone width: back on the first part, after a left tap.
```

## A flow keeps what you typed until you send

Reload, switch agent, come back. Your words and your step are still there. Send clears them.

```shot
/progress/web-kept-flow-light-before.webp | Before, light mode, phone width: a flow after a reload, the fields empty.
/progress/web-kept-flow-light-after.webp | After, light mode, phone width: the same step after a reload, the fields still filled in.
/progress/web-kept-flow-dark-before.webp | Before, dark mode, phone width: a flow after a reload, the fields empty.
/progress/web-kept-flow-dark-after.webp | After, dark mode, phone width: the same step after a reload, the fields still filled in.
```

## It says when no answer came back

If a turn ends with nothing said, you see it. A quiet row, and a Try again button that sends your last message again.

```shot
/progress/web-noanswer-thread-before-light.webp | Before, light mode, phone width: the message sent and nothing below it.
/progress/web-noanswer-thread-after-light.webp | After, light mode, phone width: No answer came back, with Try again.
/progress/web-noanswer-thread-before-dark.webp | Before, dark mode, phone width: the message sent and nothing below it.
/progress/web-noanswer-thread-after-dark.webp | After, dark mode, phone width: No answer came back, with Try again.
```

```try
/web | Open Yui on the web
/progress | Every change, with the shots
```
