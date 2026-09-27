---
date: 2026-09-27
tag: release
title: "Yui 0.4.1: tune up, keep time, send a take"
dek: A tuner on the mic, a metronome in the chat, a Record button on every instrument, and a MIDI keyboard that plays the keys. Build 208 is on TestFlight.
---

```shot
/progress/yui116r-tuner-tuned-light.webp | A guitar tuner in the app: every string ticked green, the needle straight up on E4, All strings in tune
/progress/yui116r-take-chords-dark.webp | Chord pads recording a take in dark mode: G, D, Em and C, with Stop and send at 0:02
```

Build 208 is on TestFlight. It is Yui 0.4.1.

Yui 0.4.0 changed how the app looks. This one is for musicians. Four things you can ask any agent for, and they play for real on your phone.

## A tuner

Ask for a tuner. The app listens on the mic, lights the string you play, and the needle turns green within 3 cents. Guitar, ukulele, bass or any note. Tap a string to hear it.

```shot
/progress/yui116s4-tuner-dark.webp | The guitar tuner in dark mode, listening for a string
/progress/yui116s4-ukulele-light.webp | The ukulele tuner in light mode, four strings: G, C, E, A
```

## A metronome

Ask for a metronome. It clicks in the chat, with tap tempo and a dot per beat. Start a beat under it and they stay in time. When you stop, the agent hears how long you practiced.

```shot
/progress/yui116r-metronome-loop-light.webp | A metronome at 96 BPM sitting above a playing loop, the two in time
/progress/yui116s4-metronome-light.webp | The metronome in the chat, light mode
```

## Record a take

Record sits on the looper, the drum pads, the keys and the chords. It records what Yui plays, not the mic. Stop and send gives the agent the sound and the notes, like a photo you took.

```clip
/demo/clips/take-9x16.mp4 | A boom bap loop recorded and sent to the agent
```

## Plug in a keyboard

Plug in a USB keyboard or pair one over Bluetooth. It plays the keys on the screen, and each note lights up. While a beat plays, Yui sends MIDI clock, so a drum machine keeps time with it.

```clip
/demo/clips/midi-keys-9x16.mp4 | A MIDI keyboard playing the keys on the screen
```

## What to try

This list is a real Yui screen. Tap the rows as you go.

```phone
caption: The 0.4.1 checklist, drawn from one line.
say "Try Yui 0.4.1. Tick each one as you go."
list "Ask an agent for a tuner and tune up" "Ask for a metronome and play along" "Ask for a beat, press Record, send the take" "Record some chords and send them" "Plug in a MIDI keyboard and play the keys" +check
```

Something feel off? Use the feedback button in TestFlight. It goes straight onto the board.

```try
/playground?demo=music | Play all six instruments in your browser
/mockups#music-tools | See the music tools, one by one
/changelog#build-208 | Build 208, change by change
```
