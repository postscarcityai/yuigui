---
date: 2026-09-25
tag: release
title: Build 64: screens get the whole phone, and you can hold to talk
dek: Up to 12 screens per agent, each one full screen, and a mic that works like WhatsApp. Here is what shipped and what to try.
---

```shot
/progress/screens-full-screen.webp | Screen 2 full screen: a plan, no top bar, no composer
/progress/screens-dynamic-five.webp | Five pages: the chat icon and four dots above the composer
/progress/talk-waveform-dark.webp | Holding the mic: a clock, a waveform and a trash can
```

Build 64 is on TestFlight. It came straight out of Chris's feedback on build 57. He sent something to screen 2 and asked for more screens. He looked at that screen and said it should get the whole phone. He held the mic and wanted it to feel like WhatsApp.

So that is the release. Three things, all of them things you can feel in ten seconds.

## Screens, 2 to 12

Your agent can now put things on screens 2 through 12. A screen only exists once something is on it. Send to screen 5 alone and you get the chat plus one page, not four empty ones.

```shot
/progress/screens-dynamic-chat-only.webp | Only the chat: no switcher at all
/progress/screens-dynamic-two.webp | Two pages: a chat icon and one dot
/progress/screens-dynamic-twelve.webp | Twelve pages, the most there is
```

The switcher is a small chat icon and one dot per screen. With only the chat, it is gone. Screen 13 and up stay in the chat, on purpose.

## Full screen

Off the chat, the top bar and the composer go away. A screen is for reading and tapping. Swipe back to the chat and they return. Drag the line to see both.

```compare
before: /progress/screens-full-chat.webp | The chat, with the top bar and composer
after: /progress/screens-full-screen.webp | Screen 2, with the whole phone
```

## Hold to talk

Hold the mic. A waveform moves with your voice next to a clock. Let go and it sends. Slide left to the trash and let go, and nothing sends.

```shot
/progress/talk-cancel-light.webp | Slid to the trash: it turns coral and says Let go to cancel
/progress/talk-sent-light.webp | Let go: the words send and the keyboard stays down
/progress/talk-reduce-motion-light.webp | With Reduce Motion: one still bar instead of the wave
```

Build 61 already fixed the crash when you held the mic. Build 64 makes it feel right.

## What to try

This list is a real Yui screen. Tap the rows as you go.

```phone
caption: The build 64 checklist, drawn from one line.
list "Try build 64" "Ask your agent for something on screen 5" "Swipe to it: the bars are gone" "Swipe back to type" "Hold the mic and say a sentence" "Slide to the trash once" +check
```

Found something off? Use the feedback button in TestFlight. It lands on the board, and most of this release started there.

```try
/changelog | Every build, change by change
/progress | The ship log, with more shots
```
