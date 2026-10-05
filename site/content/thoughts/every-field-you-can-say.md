---
date: 2026-10-04
tag: why
title: Every field you can type in, you can say
dek: Voice first is done on the phone and on the web. Every text field has a mic, and the few that do not are left out on purpose.
---

```shot
/progress/site186-voice-strip-390-dark.webp | Dark, phone width: four tiles of the phone app and the web side by side, each field with a small mic.
/progress/site187-say-it-pair.webp | The same form on the phone and on the web, a small mic on every field.
```

Yui's rule is short. If you can type in a field, you can say what goes in it. It holds on the phone and on the web.

## Before and after

Drag the line. Left is a field you had to type. Right is the same step with a mic on it.

```compare
before: /progress/site182-dark-1-before.webp | A form step, typing only
after: /progress/site182-dark-3-filled.webp | The same step, filled by voice
```

You check it, then you send it. Nothing goes out until you tap.

## What got a mic

Over a few days the last plain fields got one. Group chats on the phone and the web. Agent names, chat search and chat titles. The comment under a storyboard frame. The feedback box. Each one is the same small mic, so there is one way to talk, not six.

```shot
/progress/yui-group-bar-bar-dark.webp | Phone, dark: a group chat with plus, T and the big mic.
/progress/yui-naming-mic-1-add-agent-dark.webp | Phone, dark: the add-agent name filled by voice.
/progress/yui-media-comment-mic-dark.jpg | Phone, dark: a comment under a storyboard frame, with its mic.
/progress/yui284-web-group-bar-dark.jpg | Web, dark: the same group bar under the thread.
/progress/yui285-web-add-agent-dark.jpg | Web, dark: the add-agent name filled by voice.
/progress/yui286-web-feedback-390-dark.jpg | Web, dark: the feedback box with its mic.
```

If your browser has no speech recognition, like Firefox, you get the field and no mic. Never a broken one.

## What stays quiet

A few fields have no mic, and that is the point. You never say a secret out loud, and a code or a cron line is not words.

```phone
caption: The short list of fields with no mic, each with a reason.
sketch "Left out on purpose" frame=phone
row "Model and search keys" +x note="a secret is never spoken"
row "Pairing and sign in codes" +x note="not words"
row "Cron and time fields" +x note="not words"
row "The code editor" +x note="not words"
after "Everything else"
row "Names, searches, notes, feedback" +hi note="a mic on each"
```

## The check that keeps it

A rule nobody checks drifts. On the web, a check reads every text field and fails the build if one has neither a mic nor a place on that list. A new field cannot slip past it.

```shot
/progress/site186-voice-strip-desktop-dark.webp | Dark, desktop: the voice strip on the web page, phone and web side by side.
```

Read the strip on the web page, and the value it came from.

```try
/web | See the voice strip on /web
/developers/values | Value 10, say it, do not type it
/thoughts/the-web-fills-forms-by-voice-too | The web forms, in pictures
```
