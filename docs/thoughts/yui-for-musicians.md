---
date: 2026-09-26
tag: why
title: Yui for musicians
dek: Why a chat app grows a looper and a tuner. One line from an agent gets you an instrument you can play, and what you play goes back to it. It plays in your browser today; the app gets it next.
---

```shot
/progress/yui116-loop-dark.webp | A step looper on a dark phone: six rows of drum sounds, sixteen steps, the beat lit up where it hits
```

Chris, Sep 26: "It should be a musician's best friend." Music is now the main thing the app is building.

That sounds like a turn for a chat app. It isn't. Yui draws screens your agent asks for, and some of the best screens make a sound.

## Why a chat app needs a looper

Ask a chatbot for a boom bap beat and you get a paragraph about kicks on one and three. You can't hear a paragraph.

Ask your agent in Yui and it sends one line. The app draws a looper with the beat already in it, and it plays. Tap a cell to change it while it runs. Press Send and the agent gets your version back, in the same words it wrote.

```phone
caption: One line, a beat you can edit. Turn your sound on.
loop@beat 90 "Boom bap" steps=16 swing=25 rows=kick|snare|clap|hat|open|rim p=x......x..x.....|....x.......x...|............x...|x.x.x.x.x.x.x...|..............x.|...x.......x....
```

## What one line gets you

Six instruments, one line each:

- `loop` a step looper. Rows are sounds, columns are steps.
- `drums` big pads, 2x2 or 4x4. Record a take and it comes back as a loop.
- `keys` an easy keyboard with a scale lock, so nothing sounds wrong.
- `chords` one big button per chord, from a key and a progression.

```phone
caption: Chord buttons in G. Tap one to strum it.
chords G I-V-vi-IV +send
```

- `tuner` guitar, ukulele, bass or any note, on the mic.
- `metronome` a big tempo, tap tempo and a dot per beat.

An agent can change any of them while they play. `~chords key=D` moves every chord to D and keeps the song. The music never stops for it.

```shot
/progress/yui116-tuner-dark.webp | A guitar tuner: the six strings as buttons and a needle near the middle
/progress/yui116-keys-dark.webp | A keyboard in A minor pentatonic: the keys outside the scale are dimmed
```

## No sound files

Every sound is made on the spot, from recipes. The kick, the pluck and the bell come from the soundtrack of Yui's first film. Agents name a sound by word, `sound=pluck`, never by file.

So the app ships no samples, and an agent can't load audio from the web into an instrument. It stays small and it stays safe.

## What ships next

Each step waits for the one before it.

1. Done: the plan, the spec, and a mock that plays in your browser.
2. The sound engine in the app, with the looper and the drum pads. The goal is sound under 10 ms after your tap.
3. The keyboard with the scale lock, and chord buttons.
4. The tuner on the mic, and the metronome.
5. Recording and export back to your agent, a MIDI keyboard that plays the keys, and Ableton Link to stay in time with other apps.

```try
/playground?demo=music | Play all six in the playground
/developers/music | Read the spec
/mockups#music-tools | See each one
```
