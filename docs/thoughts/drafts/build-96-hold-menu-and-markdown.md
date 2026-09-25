---
date: 2026-09-25
tag: release
title: "Build 96: a hold menu you can tap, and answers that read clean"
dek: Hold any message, even a long one, and the reactions, the message and the menu all fit and never overlap. Agent answers draw their markdown instead of showing the stars. Here is what to try.
---

```shot
/progress/yui78-long-light.webp | A checklist taller than the screen, held: reactions on top, the list fading out, the menu below
```

Build 96 is on TestFlight. The first fix came straight from the TestFlight feedback button: "the copy button and the emojis are competing, I can't select the emojis."

## The hold menu fits any message

Hold a long message and it used to run up under the header, with the reactions at the bottom and the menu sitting right on top of them. Now it is always one column: reactions above, the message, the menu below, all on screen and apart. A message too tall for the room shows its top with a soft fade. Copy and Select text still take every word, and there is a new Share row.

```shot
/progress/yui78-card-dark.webp | A tall card held in dark mode: reactions above, the card fading out, the menu below
/progress/yui78-small-ax3.webp | A smaller iPhone at large text: every piece still on screen and apart
```

## Answers read clean

Agents often answer in markdown, and Yui used to show the raw marks. A /status answer read as **Model:** with the stars in it. Now agent bubbles draw bold, code, code blocks, lists, headings and links. Copy and VoiceOver still get the plain words.

```shot
/progress/yui76-markdown-light.webp | A /status answer with bold labels and the model name in code, then bullets, a numbered list, a code block and a link
/progress/yui76-markdown-dark.webp | The same answers in dark mode
```

## What to try

This list is a real Yui screen. Tap the rows as you go.

```phone
caption: The build 96 checklist, drawn from one line.
list "Try build 96" "Hold a long message: emojis on top, menu below, all tappable" "Tap an emoji on a long message, then hold it again to remove it" "Ask Yui for /status: bold, code and lists render" +check
```

Found something off? Use the feedback button in TestFlight. It lands on the board, and half of this release started there.

```try
/changelog | Every build, change by change
/progress | The ship log, with more shots
```
