---
date: 2026-09-27
tag: release
title: "Yui 0.4.0: the new face of Yui"
dek: The answer plays on the full screen, a big mic sits bottom right, the stage moves the way each agent moves, and a live picture behind the words listens. Build 204 is on TestFlight.
---

```shot
/progress/yui119-app-answer-light.webp | The answer on the full screen: one short line and a picture, the big mic bottom right
/progress/yui125-voice-orb-dark.webp | Talking to Yui: the words show as you say them over a glowing picture that moves with your voice
```

Build 204 is on TestFlight. It is Yui 0.4.0.

This is the biggest change since the first build. Yui used to open on a chat. Now it opens on a stage. You talk, and the whole screen is the answer.

## The stage

Ask something and a working line says what the agent is doing. Then the answer plays in short parts, a line and a picture each. If the agent needs something from you, it asks at the end, all on one page, with one Send.

```shot
/progress/yui119-app-working-dark.webp | The working line on the stage while the agent looks
/progress/yui119-app-questions-light.webp | The questions at the end, on one page, with one Send
/progress/yui119-app-record-light.webp | The record: every part as one row, a small picture and its line
```

The chat did not go away. It is the record now, behind the button top right. Every part you saw sits there as one row.

## A big mic, and your agents top left

The mic is big and sits bottom right. Tap it and talk. T opens the text field, + attaches a picture or a file.

```shot
/progress/yui121-talking-light.webp | Talking: the words show as you say them above the big mic
/progress/yui121-typing-light.webp | T opens the text field, with the mic still close
/progress/yui122-switch-light.webp | Top left: tap the agent's name to switch to another one
```

Top left is the menu with settings, then the agent you are talking to. Tap the name to switch.

## Each agent moves its own way

Looking, making, found it, the answer: each moment moves in the agent's own way. Coach is snappy. Wizard is heavy and punchy. You can say how an agent should move, in a few words, and it keeps that look.

```shot
/progress/yui120s2-coach-found-light.webp | Coach found a dry window: a quick, bright pulse in coral
/progress/yui120s2-wizard-looking-light.webp | Wizard checking the forecast: a slow, heavy ring in purple
```

Reduce Motion holds it all still.

## A picture that listens

An agent can put a live picture behind the stage: aurora, orb, waves, grain or bloom, in its own colors. The phone's graphics chip draws it. It moves with your voice while you talk, with the agent's voice while it reads, and with the music when a beat plays.

```shot
/progress/yui124s2-aurora-dark.webp | Aurora in dark mode, soft pink light behind the words Tuesday at 10 is dry
/progress/yui125-agent-bloom-dark.webp | Bloom opens behind the answer while the agent reads it out
/progress/yui125-music-waves-dark.webp | Waves move with a boom bap loop playing on the stage
/progress/yui124s2-bloom-light.webp | Bloom in light mode, behind a short answer
```

## It rides along

Keys and chords now play in the app, and so does every drum name, as a real drum. Instruments play with the ringer on silent. Send answers in about 70 ms. Pictures show whole, never cropped.

```shot
/progress/yui116s3-keys-light.webp | Keys with a scale lock in the app: keys outside the scale are dimmed
/progress/yui116s3-chords-dark.webp | Chord pads in dark mode, one chord each
```

## What to try

This list is a real Yui screen. Tap the rows as you go.

```phone
caption: The 0.4.0 checklist, drawn from one line.
say "Try Yui 0.4.0. Tick each one as you go."
list "Tap the big mic and ask a question" "Tap T and type one instead" "Switch agents from the name top left" "Open the record top right" "Tell an agent how to move, in a few words" "Ask for a beat and watch the picture move" +check
```

Something feel off? Use the feedback button in TestFlight. It goes straight onto the board.

```try
/playground?demo=visualizer | Play with the live picture on the web
/mockups#release-040 | See 0.4.0, screen by screen
/changelog#build-204 | Build 204, change by change
```
