# Music tools | spec v1 (YUI-116, draft)

Yui should be a musician's best friend. Any agent puts an instrument on the phone with one line: a looper to sketch a beat, drum pads, an easy keyboard, chord buttons, a tuner and a metronome. One sound engine in the app plays all of them, so they sound like one kit and stay in time with each other.

The agent writes the idea, the person plays with it, and what they made comes back as data the agent can keep, change and send again. An agent can write a beat, you fix the snare, it adds a bassline under your version.

Step 1 (this page) is the design: the research, the six presets, the sound bank and the engine. The mock plays in your browser: [/playground?demo=music](/playground?demo=music). The reference parser (`site/lib/yl/yl.mjs`) and the conformance vectors (`spec/conformance/37-music.json`) already read every line on this page. Steps 2 to 5 build it in the app; their acceptance is at the end.

## 1. What people already love

Ten apps musicians keep on their phones, and what makes each one easy with a thumb. Every fact links to its source; "not confirmed" means we could not find one.

**Koala Sampler.** It has 64 pads in four banks of 16, and you can record your playing into 32 sequences, then trigger those live ([Sound On Sound](https://www.soundonsound.com/reviews/elf-audio-koala-sampler)). The app splits work into three tabs: Sample, Sequence, Perform ([Sound On Sound](https://www.soundonsound.com/reviews/elf-audio-koala-sampler)). The reviewer calls the layout "logically laid out, simple to interact with". It costs $4.99 in the US ([Sound On Sound](https://www.soundonsound.com/reviews/elf-audio-koala-sampler)). Borrow: one 4x4 page of pads, with more banks behind a letter switch (A to D). Keep make, arrange, and perform as separate modes.

**Figure (Reason Studios, once Propellerhead).** Three parts: drums, bass, lead. You play by sliding a finger across a play pad. The app "keeps you in key, and on the beat" ([App Store](https://apps.apple.com/us/app/figure-make-music-beats/id511269223)). Loop length is 1, 2, 4, or 8 bars. It has swing, an arpeggiator, XY effects, and Ableton Link. It is free ([App Store](https://apps.apple.com/us/app/figure-make-music-beats/id511269223)). Sounds come from Reason's Thor synth and Kong drum machine ([KVR](https://www.kvraudio.com/product/figure-by-propellerhead-software)). Borrow: you cannot play a wrong note or land off the beat. Key and mode are a single setting. A swipe beats a tap for melody.

**Novation Launchpad app and Groovebox.** The Launchpad iOS app reached seven million downloads ([Sound On Sound](https://www.soundonsound.com/news/groovebox-new-studio-app-launchpad-makers)). Its core is a grid of loop pads. How each pad locks to the beat is not confirmed from a primary source. Groovebox ships three instruments: Drumbox, Retrobass, and the eight-voice Poly-8 synth. It has optional scale lock, draw-in pattern sequencing, preset patterns, and Ableton Link ([Sound On Sound](https://www.soundonsound.com/news/groovebox-new-studio-app-launchpad-makers)). It is free, with extra packs as in-app purchases ([App Store](https://apps.apple.com/us/app/groovebox-beat-synth-studio/id1242847278)). Borrow: a grid where each cell is a loop that starts on the next beat. Scale lock is a toggle, not a mode you must learn first.

**GarageBand for iOS: Live Loops, Smart Chords, Smart Instruments.** Live Loops is a grid of cells. You "start and stop playback of cells freely, while keeping everything in sync" ([Apple Support](https://support.apple.com/guide/garageband-iphone/live-loops-overview-chsca7ff9ced/ios)). A cell can hold a Touch Instrument take, a loop, or an audio file ([Apple Support](https://support.apple.com/guide/garageband-iphone/work-in-the-live-loops-grid-chsd95b06794/ios)). On the keyboard, chord strips split into five upper segments that play chords and three lower segments that play bass notes ([Apple Support](https://support.apple.com/guide/garageband-iphone/play-the-keyboard-chs39282dbe/ios)). Scale mode turns the keys into note bars, so you only see notes in the scale. An Autoplay knob plays comping patterns ([Apple Support](https://support.apple.com/guide/garageband-iphone/play-the-keyboard-chs39282dbe/ios)). You can add custom chords to the strips ([Apple Support](https://support.apple.com/guide/garageband-iphone/add-custom-chords-chsab9d1c4c/ios)). Borrow: one big button per chord. Where you tap inside it picks the voicing (upper part plays the chord, lower part plays bass). Scale lock hides wrong notes instead of warning about them.

**Teenage Engineering Pocket Operators.** A PO-12 pattern is 16 steps. There are 16 patterns, and you can chain up to 16 of them ([PO-12 guide](https://teenage.engineering/guides/po-12/en)). You press write and tap keys 1 to 16 to place sounds. You can also hold write during playback to punch in notes, with quantize on. You hold FX and press a key to punch in an effect ([PO-12 guide](https://teenage.engineering/guides/po-12/en)). It has 16 sounds ([PO-12 guide](https://teenage.engineering/guides/po-12/en)). Borrow: the step grid is the whole UI. Hold-to-punch effects work well for one thumb. Pattern chaining by tapping numbers in order (1, 1, 1, 4 plays pattern 1 three times, then pattern 4) is a good model ([PO-16 guide](https://teenage.engineering/guides/po-modular/16)).

**Endlesss.** Tim Exile's jam app launched in 2020, and its servers closed on 31 May 2024 ([MusicTech](https://musictech.com/news/gear/tim-exile-endlesss-app-shut-down/)). Its "Rifffs" let you lay down loops and share them. Others could add to a Rifff in real time ([MusicTech](https://musictech.com/news/gear/tim-exile-endlesss-app-shut-down/)). A later relaunch is not confirmed. The layer count per Rifff is not confirmed. Borrow: the loop is the unit you share. An agent could hand the user a running loop and ask them to add one layer.

**iReal Pro.** A chord chart book plus a backing band. It has 50 built-in styles, plus more as in-app purchases. It can loop sections, transpose to any key, and raise the tempo step by step. It shows guitar, ukulele, and piano fingerings for any chord ([App Store](https://apps.apple.com/us/app/ireal-pro/id298206806)). Borrow: tap a chord name to see how to play it. Transpose is one control. Style and tempo are the only knobs a beginner needs.

**GuitarTuna.** It supports 15 instruments, including guitar, 7- and 12-string guitar, ukulele, bass, 5-string bass, violin, and banjo. It has a metronome with custom time signatures. It is rated 4.8 from 148K ratings ([App Store](https://apps.apple.com/us/app/guitartuna-tune-play-guitar/id527588389)). The listing claims "noise cancellation" but gives no cents figure; accuracy in cents is not confirmed. Borrow: show a picture of the instrument head with the string that is sounding lit up. Put the metronome next to the tuner.

**Fender Tune.** Auto mode: "Pluck a string and the tuner listens," with a string-by-string diagram. Chromatic mode covers all 12 semitones. It has 26 preset tunings plus custom ones, and covers guitar, bass, and ukulele. It includes a metronome and 65 drum rhythms in 7 genres ([App Store](https://apps.apple.com/us/app/fender-tune-guitar-tuner-app/id1107017950)). Borrow: auto string detection as the default. Chromatic is one switch away ([Fender support](https://tune-support.fender.com/hc/en-us/articles/360002051712--What-s-a-chromatic-tuner)).

**Chordbot.** You build a progression, and the app plays it back in a style. It has 60+ chord types in all inversions and 70+ comping styles. It can pick the smoothest inversion for you. Songs split into sections like verse and chorus. It can export MIDI and WAV. A "Song-O-Matic" makes random progressions ([Chordbot](https://www.chordbot.com/)). Borrow: auto voice leading, so a chord button always picks a close inversion. Keep a "surprise me" button for progressions.

### Patterns to borrow

- Lock to key and beat by default. Wrong notes are hidden, not flagged (Figure, GarageBand scale mode).
- One grid is the whole screen: 16 steps (PO) or a cell grid (Live Loops). The 8x8 looper fits this.
- Chord buttons carry voicing by where you tap. Upper part plays chord plus bass, lower part plays bass (GarageBand chord strips).
- Hold-to-punch for effects and fills. Let go and it snaps back (PO).
- Loops launch on the next beat, so timing errors vanish (Live Loops, Launchpad).
- Auto voice leading on chord changes (Chordbot).
- Tuner shows the instrument, lights the string, and auto-detects it. Chromatic is one switch away (GuitarTuna, Fender Tune).
- Share or hand off a running loop as the unit of work (Endlesss).

## 2. The presets

Six presets, one line each. Every one follows the Yui Lines rules (spec/YL.md): positionals first, `key=value` for anything else, `+flag` to switch something on, `@id` to name it, `~preset` or `~id` to patch it live, `>2` to put it on a page, `save` to keep the screen. Each takes one special positional, wherever it sits; the rest of the positional text is the title. Quote a word to force it to be text: `loop "808" Dreams` has no tempo.

The instruments (`loop`, `drums`, `keys`, `chords`, `tuner`) open on the stage, full screen, like a game or a workout, unless the line says `+inline`. The `metronome` sits in the chat. On a page (`>2`) nothing opens on the stage.

Sounds are named by word, never by file: `sound=pluck`, `pads=kick|clap|hat|pop`, `rows=C4|E4|G4`. The words are in section 4.

| Preset | Line | Positionals | Props [default] |
| --- | --- | --- | --- |
| `loop` | `loop [BPM] [title]` | the first bare number (`96` or `96bpm`) is `bpm` | `bpm` [96], `swing` [0] (percent, 0 to 75), `steps` [8] (4 to 16), `rows` [the first 8 kit words], `p` (the pattern), `sound` [pluck] for note rows, `+play` |
| `drums` | `drums [RxC] [title]` | `2x2`, `4x4` (1 to 4 each way) is `grid` | `grid` [2x2], `pads` [the first R x C kit words], `bpm` [96], `+record` |
| `keys` | `keys [KEY] [SCALE] [title]` | a key (`C`, `F#`, `Bb`, `Am`), a scale word | `key` [C], `scale` [major, or minor for a key ending in m], `sound` [keys], `octave` [4], `+send` |
| `chords` | `chords [KEY] [PROGRESSION or CHORDS] [title]` | a key, a roman progression (`I-V-vi-IV`), or chord names as options (`C|G|Am|F`) | `key` [C], `prog` [I, V, vi, IV when no chords are given], `chords`, `strum` [down], `sound` [pluck], `+send` |
| `tuner` | `tuner [INSTRUMENT] [title]` | `guitar`, `ukulele`, `bass` or `chromatic` is `instrument` | `instrument` [guitar], `tuning` [standard], `a4` [440], `strings` (overrides the tuning) |
| `metronome` | `metronome [BPM] [title]` | the first bare number is `bpm` | `bpm` [100], `beats` [4] per bar, `sub` [1] clicks per beat (1 to 4), `+play` |

Scales: `major`, `minor`, `pentatonic` (major or minor from the key), `blues`, `dorian`, `mixolydian`, `chromatic` (the lock off). Tunings: guitar `standard` (E2 A2 D3 G3 B3 E4), `dropd` (D2 A2 D3 G3 B3 E4), `dadgad`; ukulele `standard` (G4 C4 E4 A4, the high G) and `lowg` (G3 C4 E4 A4); bass `standard` (E1 A1 D2 G2) and `five` (B0 E1 A1 D2 G2). A tuning the app does not know falls back to standard and says so.

### loop

`loop [BPM] [title]`. A step grid: rows are sounds (or notes), columns are steps, 8 x 8 by default. Tap a cell to turn it on. Play loops it; the column under the playhead lights up. Tempo and swing are one tap away, and every change plays at once, so the person edits while it runs.

The pattern is `p`, one string per row, top to bottom: `x` is a hit, `.` a rest. `p=x...x...|..x...x.|x.x.x.x.` is kick on 1 and 5, snare on 3 and 7, a hat on every other step. A row with no string is empty; a string shorter than `steps` is padded with rests, a longer one is cut. Rows that are notes (`C4`, `F#3`) play the looper's `sound`, so the same grid is a drum machine or a melody.

```
loop 96 "Boom bap" p=x...x.x.|....x...|..x...x.|xxxxxxxx +play
loop 100 sound=bell rows=C5|A4|G4|E4|D4|C4 steps=16
~loop bpm=110 swing=20
```

Send (always there) emits the pattern, in the same shape the agent writes, so it can go straight back into a line:

```
{"id":"beat","preset":"loop","bpm":96,"swing":20,"steps":8,"rows":["kick","snare","clap","hat","open","rim","tom","shaker"],"p":["x...x.x.","....x...","..x...x.","xxxxxxxx","","","",""]}
```

### drums

`drums [RxC] [title]`. Big pads, played on touch down (not on release, which costs a frame). A 2x2 gets kick, snare, clap and hat; a 4x4 gets the whole kit. `pads=` names them. Nothing is sent while the person plays.

With `+record`, a Record button counts in one bar on the tick, records two bars, snaps the hits to 16ths and sends the take in the loop's shape, so a take becomes a loop in one line:

```
drums 2x2
drums 4x4 "Finger drums" +record bpm=88
{"id":"n1","preset":"drums","take":true,"bpm":88,"steps":32,"rows":["kick","snare","hat"],"p":["x.......x.x.....x.......x.x.....","....x.......x.......x.......x...","x.x.x.x.x.x.x.x.x.x.x.x.x.x.x.x."]}
```

### keys

`keys [KEY] [SCALE] [title]`. An easy keyboard: one octave and a bit, with arrows to move up or down an octave. The scale lock is on by default: keys outside the scale are dimmed and do nothing, so nothing sounds wrong. `scale=chromatic` unlocks every key. A sound picker (keys, pluck, bell, pad, bass, lead) sits above it. More than one finger plays more than one note; sliding across keys plays each one.

```
keys C major "Warm up"
keys Am pentatonic sound=pad +send
~keys key=G
```

With `+send`, a Send button emits the last notes played (up to 32), with octaves: `{"id":"n1","preset":"keys","played":["A3","C4","E4","D4"],"key":"Am","scale":"pentatonic"}`.

### chords

`chords [KEY] [PROGRESSION or CHORDS] [title]`. One big button per chord. A tap strums it (`strum=down`, `up`, or `off` for all notes at once, about 25 ms between strings). A progression is written in roman numerals against the key: upper case is major, lower case minor, a `b` in front is flat, `7` adds the seventh, `dim` and `sus4` work too. The button shows the chord name, with the numeral small under it. Chord names given as options skip the theory: `chords C|G|Am|F`.

```
chords G I-V-vi-IV
chords Am i-bVII-bVI-V7 strum=up
chords C|G|Am|F "Campfire"
~chords key=D
```

`~chords key=D` moves every chord to D and keeps the progression, which is the main reason to write numerals. With `+send`, Send emits the chord names in the order they were played (up to 32): `{"id":"n1","preset":"chords","played":["G","D","Em","C"],"key":"G"}`.

### tuner

`tuner [INSTRUMENT] [title]`. Start asks for the microphone once. The screen shows the nearest string (or, for `chromatic`, the nearest note), a needle from -50 to +50 cents and the frequency. Within 3 cents the needle turns green. Each string is a button too: a tap plays its note, for tuning by ear or when the mic is off.

```
tuner
tuner ukulele
tuner guitar tuning=dropd a4=442
tuner strings=D2|A2|D3|G3|A3|D4 "DADGAD by hand"
```

When every string has held within 3 cents for a second, it sends one event: `{"id":"n1","preset":"tuner","tuned":true,"instrument":"guitar","tuning":"standard","strings":["E2","A2","D3","G3","B3","E4"],"cents":[-2,1,0,3,-1,2]}`. The chromatic tuner sends nothing. If the person says no to the mic, the tuner says "The mic is off. Tap a string to tune by ear." and the reference tones keep working.

### metronome

`metronome [BPM] [title]`. A big tempo, minus and plus, Tap tempo, a dot per beat with the first one accented, Start and Stop. `sub=2` clicks eighths, `sub=3` triplets, `sub=4` sixteenths.

```
metronome 72 beats=3
metronome 120 sub=2 +play
```

Stop, after at least 10 seconds of playing, sends the practice: `{"id":"n1","preset":"metronome","bpm":72,"beats":3,"sub":1,"seconds":184}`. Shorter runs send nothing.

### What an agent can patch live

Any prop, on any of the six, while it plays: `~loop bpm=110`, `~loop p=...`, `~drums pads=kick|snare|pop|sweep`, `~keys scale=blues`, `~chords key=G`, `~tuner tuning=dropd`, `~metronome bpm=80`. A patch never stops the music: the engine keeps its clock and the change lands on the next step. As with every preset, a patch from a later reply aims at the preset name (`~loop`), or at an `@id` on a page (spec/YL.md, section 5).

### How the work comes back

What the person made comes back as an event in the same words the agent writes. To keep it, the agent patches it in and saves the screen:

```
~beat p=x...x.x.|....x...|..x...x.|xxxxxxxx bpm=96 swing=20
save boom bap
```

`show boom bap` brings it back later, playing the person's version. A `project` card with `open=boom bap` puts it on the shelf.

### Ready-made screens in the library

Whole replies built from these presets, ready to copy or open in the playground. Agents find them at `/api/library?q=music` and with the `yui_library` MCP tool, marked `"app": "coming"` until the app draws them.

- [Practice session](/developers/library#practice-session): tune up, a click to warm up to, then a loop to play over.
- [Chord chart for a song](/developers/library#chord-chart): a song's chords to strum along, one patch to change the key.
- [A beat to jam over](/developers/library#jam-beat): a drum loop that plays at once; Send returns their version.
- [Songwriting check-in](/developers/library#songwriting-checkin): how the session went, the chorus on chord buttons, the melody as a voice note.
- [Scale warm-up](/developers/library#scale-warm-up): a slow click and a keyboard locked to one scale.

## 3. One engine

All six presets share one sound engine in the app, the way a groovebox shares one clock:

- **One clock.** The looper, a drum take, the metronome and a strummed chord all schedule on the same audio clock. Two instruments on screen play in time; a metronome under a loop clicks on its beat.
- **One voice bank.** A kick is the same kick in the looper and on a pad (section 4).
- **One mixer.** Master volume, a soft limiter so ten pads at once do not clip, and a small room reverb on the pitched voices.

`tuner` shares the engine's session and the reference tones, not the clock; it is the only one that listens.

### Recording and export (step 5)

A Record button on the looper, drums, keys and chords records what comes out of the engine, not the mic, to an AAC file (`.m4a`, 48 kHz). The file goes back to the agent the way a camera photo does: uploaded to the relay's media bucket, with the event carrying a signed link, `{"id":"beat","preset":"loop","audio":"https://...","seconds":16}`. The agent can keep it, send it back as a `video` or `card` link, or hand it to a mixing tool. MIDI export (`.mid`) of the same take comes with it.

### What stays out of v1

- Samples. Every voice is synthesized, so the app ships no sound files and an agent cannot load audio from a URL into an instrument.
- Recording the mic into a loop (a real sampler). A later card, after recording works.
- Effects racks, a mixer per track, automation.
- More than one loop playing at once, and song mode (chaining patterns).
- Plug-ins (AUv3), Inter-App Audio.
- Anything that plays in the background after the person leaves the app, except the metronome if research says it is worth the review risk (section 5).

## 4. The sound bank

Sixteen voices in the kit, six pitched voices, all made from oscillators, noise, filters and envelopes. The recipes come from the soundtrack of Yui's first film, written in Python with numpy (`synth.py` in the brag folder): each function there is a short, readable recipe for one sound. The engine rebuilds each one as a real-time voice.

The kit, in pad order (`KIT` in yl.mjs): a 2x2 gets the first four, a looper's rows the first eight, a 4x4 all sixteen.

| Word | Family | Recipe (synth.py) | Real time |
| --- | --- | --- | --- |
| `kick` | drum | `kick`: a sine that falls from 134 Hz to 44 Hz in 45 ms, a 2 ms noise click, soft clipped | oscillator with a frequency ramp, a gain envelope, a short noise burst, a waveshaper |
| `snare` | drum | `snare`: band-passed noise (1.2 to 7.5 kHz) plus a 190 Hz body, clipped | noise through a band-pass, a sine body, two envelopes |
| `clap` | drum | `clap`: three noise bursts 11 ms apart, then a tail, band-passed 0.9 to 4.2 kHz | one noise source, a gain envelope with three spikes and a decay |
| `hat` | drum | `hat`: high-passed noise above 7 kHz, 18 ms decay | noise through a high-pass, a fast envelope |
| `open` | drum | `hat(open_=True)`: the same, 80 ms decay | as hat, longer |
| `rim` | drum | `rim`: an 820 Hz sine with noise, 12 ms | a sine and noise, a very short envelope |
| `tom` | drum | the kick's shape, higher (from 220 Hz to 110 Hz) and longer | as kick |
| `shaker` | drum | hat noise with a slow attack | noise through a high-pass, a rounded envelope |
| `crash` | drum | `crash`: noise 3.5 to 14 kHz, 0.7 s decay | noise through a band-pass, a long envelope |
| `cow` | drum | two square waves at 540 and 800 Hz through a band-pass | two oscillators, a band-pass, a short envelope |
| `snap` | drum | a clap with one burst, brighter | noise through a high band-pass |
| `conga` | drum | a sine from 330 to 220 Hz, 150 ms | oscillator with a pitch ramp |
| `pop` | fx | `pop`: a tuned sine that glides up 30% in 25 ms | oscillator with a pitch ramp |
| `sweep` | fx | `sweep`: a sine that rises exponentially over its length | oscillator with an exponential ramp |
| `tick` | fx | `tick`: a 3 kHz sine with noise, 4 ms decay (the metronome) | a sine and noise, a very short envelope |
| `bell` | pitched and fx | `bell`: a small FM bell, bright attack, soft tail (C5 on a pad) | two oscillators, one modulating the other's frequency |

Pitched voices, for `keys`, `chords`, note rows and `sound=`:

| Word | Recipe (synth.py) | Real time |
| --- | --- | --- |
| `keys` | `pluck` with more body and a longer tail (the default for keys) | a sine and three harmonics, each with its own decay |
| `pluck` | `pluck`: a sine with fast-fading 2nd, 3rd and 5th harmonics, 90 to 140 ms decay | as above, shorter |
| `bell` | `bell`: FM, modulator at 3.5 times the note, index falling over 250 ms | two oscillators |
| `pad` | `pad_voice`: three detuned triangle waves, slow attack and release | three oscillators, a slow envelope, held while the key is down |
| `bass` | `sub_note`: a sine one or two octaves down, softly clipped | an oscillator and a waveshaper |
| `lead` | `melodica`: saw plus square with a slow vibrato, band-passed | two oscillators, a vibrato oscillator on their frequency, a band-pass |

An unknown word still parses (`sound=theremin`); the app plays the family default (`keys` for a pitched slot, `tick` for a pad) and the playground does the same.

**Row names.** A loop row can be named the way a musician would. Before lookup a word loses case, accents, spaces, `_` and `-` (`Ganzá` reads `ganza`, `hi-hat` reads `hihat`). Then it is a kit word or an alias (`ALIAS` in theory.mjs, `Words.alias` in the app, kept in step):

| Plays | Aliases |
| --- | --- |
| `kick` | bd, bassdrum, kickdrum, cajon |
| `snare` | sd, snaredrum, caixa, tarol |
| `clap` | clapping, handclap, palmas |
| `hat` | hh, hihat, hihats, closedhat |
| `open` | openhat, oh |
| `rim` | clave, claves, rimshot, sidestick, tamborim, woodblock |
| `tom` | surdo, repinique, repique, floortom, taiko, dhol |
| `shaker` | shake, maraca, maracas, tambourine, ganza, chocalho, guiro, cabasa, afuche, egg, pandeiro |
| `crash` | ride, cymbal, splash, china |
| `cow` | cowbell, agogo, gankogui |
| `snap` | finger |
| `conga` | bongo, bongos, cuica, timbal, timbale, timbales, djembe, tumba, quinto, tabla, darbuka |
| `bell` | chime, glock, marimba, triangle |
| `tick` | click |

Two rows the kit does not know never share a voice. In a loop each unknown drum row takes the next kit voice, in pad order, that no other row plays (`loopVoices` in theory.mjs, `Words.loop` in the app), so `rows=kick|zap|zing` plays kick, snare, clap. Only once all twelve drums are taken does a row fall back to `tick`. A pad or a single `play` of an unknown word still plays `tick`.

**In the app (AVAudioEngine).** One `AVAudioSourceNode` renders every voice in its render block, sample by sample, from the same recipes: a small voice pool (32 voices), each voice an oscillator phase, an envelope and a one-pole or state-variable filter, no allocation and no locks on the audio thread. Scheduled notes carry a sample time from the engine's clock, so the looper and the metronome land on the exact sample. A limiter and a small reverb (`AVAudioUnitReverb`) sit after it. The same recipe text drives both platforms, so a sound is fixed once.

**In the browser (Web Audio).** Each hit builds a few nodes (`OscillatorNode`, `AudioBufferSourceNode` over one shared noise buffer, `BiquadFilterNode`, `GainNode` envelopes, `WaveShaperNode` for the soft clip) and lets them go when the envelope ends. A `DynamicsCompressorNode` is the limiter. That is what the playground mock does today.

## 5. iOS audio

### AVAudioEngine vs AudioKit

AVAudioEngine is Apple's built-in node graph. It "manages a graph of audio nodes, controls playback, and configures real-time rendering constraints" ([Apple](https://developer.apple.com/documentation/avfaudio/avaudioengine)). Useful stock nodes: AVAudioSourceNode for custom synth code ([Apple](https://developer.apple.com/documentation/avfaudio/avaudiosourcenode)), and AVAudioUnitSampler for sample-based drums and keys ([Apple](https://developer.apple.com/documentation/avfaudio/avaudiounitsampler)).

AudioKit is MIT licensed ([LICENSE](https://github.com/audiokit/AudioKit/blob/main/LICENSE)). Its engine class is "AudioKit's wrapper for AVAudioEngine" ([source](https://github.com/AudioKit/AudioKit/blob/main/Sources/AudioKit/Internals/Engine/AudioEngine.swift)), so it sits on top of Apple's engine, not beside it. It adds split packages:
- SoundpipeAudioKit: oscillators, physical models, filters, reverbs ([README](https://github.com/AudioKit/SoundpipeAudioKit)). It also has a PitchTap for pitch tracking ([source](https://github.com/AudioKit/SoundpipeAudioKit/blob/main/Sources/SoundpipeAudioKit/PitchTap.swift)).
- AudioKitEX: "C-backed AudioKit DSP" ([GitHub](https://github.com/AudioKit/AudioKitEX)).
- Tonic: music theory ([GitHub](https://github.com/AudioKit/Tonic)).
- Keyboard: an on-screen keyboard view ([GitHub](https://github.com/AudioKit/Keyboard)).

All four are MIT per the GitHub API ([AudioKit](https://api.github.com/repos/AudioKit/AudioKit)).

Maintenance: the latest release is 5.7.2, published 2026-03-31 ([GitHub API](https://api.github.com/repos/AudioKit/AudioKit/releases/latest)). The last push to main was 2026-07-26 ([GitHub API](https://api.github.com/repos/AudioKit/AudioKit)). Releases are cut by one maintainer, @aure ([releases](https://github.com/audiokit/AudioKit/releases)). The README asks users to sponsor him ([README](https://github.com/AudioKit/AudioKit)). That makes AudioKit a bus-factor risk. Suggested path: use plain AVAudioEngine for the core. Pull in Tonic (theory) or SoundpipeAudioKit (DSP) only if they save real work.

### Latency

- Apple says the minimum IO buffer duration "is at least 0.005 seconds (256 frames) but might be lower depending on the hardware." The typical maximum is 0.093 s (4,096 frames at 44.1 kHz) ([Apple, setPreferredIOBufferDuration](https://developer.apple.com/documentation/avfaudio/avaudiosession/setpreferrediobufferduration(_:))). Read the value you actually got from `ioBufferDuration`, because the preferred value is only a hint ([Apple QA1631](https://developer.apple.com/library/archive/qa/qa1631/_index.html)).
- 256 frames at 48 kHz is 5.33 ms per buffer (computed). The render side can therefore hit the "under 10 ms from audio render" target with one or two buffers.
- Developers report that on iOS 18 the requested buffer is ignored when Sound Recognition or Vocal Shortcuts is on ([Apple forums](https://developer.apple.com/forums/thread/769245)). Log the real buffer size in debug builds.
- For mic apps, the default session mode adds about 30 ms on input from voice processing. Use the "measurement" mode for the tuner ([Superpowered](https://superpowered.com/latency)).
- Superpowered's target: instruments "feel natural" under 10 ms round trip ([Superpowered](https://superpowered.com/latency)).
- Touch latency is the bigger cost. Agawi measured 55 ms touch response on iPhone 5 and 85 ms on iPhone 4 ([iMore](https://www.imore.com/iphone-5-touchscreen-latency-measured-found-be-25-times-faster-closest-android-device)). Current iPhone touch-to-sound figures are not confirmed. Practical rule: trigger sound on touch down, never on touch up or on a SwiftUI tap gesture end.

### Audio session categories

| Category | Silenced by Ring/Silent switch | Mixes with other apps | Input |
|---|---|---|---|
| .ambient | Yes | Yes | No |
| .soloAmbient (default) | Yes | No | No |
| .playback | No | No by default | No |
| .playAndRecord | No | No by default | Yes |

Source: [Apple Audio Session Programming Guide](https://developer.apple.com/library/archive/documentation/Audio/Conceptual/AudioSessionProgrammingGuide/AudioSessionCategoriesandModes/AudioSessionCategoriesandModes.html), [ambient](https://developer.apple.com/documentation/avfaudio/avaudiosession/category-swift.struct/ambient), [playAndRecord](https://developer.apple.com/documentation/avfaudio/avaudiosession/category-swift.struct/playandrecord).

- Apple calls .ambient right for a "virtual piano that a user plays while the Music app is playing" ([Apple](https://developer.apple.com/documentation/avfaudio/avaudiosession/category-swift.struct/ambient)). It respects the silent switch.
- `.mixWithOthers` can be set on .playAndRecord, .playback, and .multiRoute. .ambient sets it automatically ([Apple](https://developer.apple.com/documentation/avfaudio/avaudiosession/categoryoptions-swift.struct/mixwithothers)).
- `.defaultToSpeaker` works only with .playAndRecord. It sends audio to the speaker rather than the ear receiver ([Apple](https://developer.apple.com/documentation/avfaudio/avaudiosession/categoryoptions-swift.struct/defaulttospeaker)). The tuner needs this, or the metronome click plays through the earpiece.
- `.allowBluetoothA2DP` lets .playAndRecord output to stereo Bluetooth. .ambient, .soloAmbient, and .playback route to A2DP on their own ([Apple](https://developer.apple.com/documentation/avfaudio/avaudiosession/categoryoptions-swift.struct/allowbluetootha2dp)).
- Suggestion: pads and keys use .ambient (respects the switch, mixes with music). The tuner uses .playAndRecord + .measurement + .defaultToSpeaker + .allowBluetoothA2DP. A "play through silent mode" toggle can switch to .playback.

### Bluetooth output latency

Stephen Coyle measured tap-to-ear delay: AirPods 1 at 274 ms, AirPods 2 at 178 ms, AirPods Pro at 144 ms ([MacRumors](https://www.macrumors.com/2019/12/23/airpods-pro-bluetooth-latency/)). Figures for current models from a first-party or lab source are not confirmed. Either way, that is 10x or more over the 10 ms target, so pads over AirPods will feel late. Show a small "Bluetooth adds delay" hint when the route is Bluetooth. Use output latency to shift visuals for the looper and metronome.

### Background audio

To keep playing when the screen locks, add `audio` to UIBackgroundModes in Info.plist, in addition to the right category ([Apple guide](https://developer.apple.com/library/archive/documentation/Audio/Conceptual/AudioSessionProgrammingGuide/AudioSessionCategoriesandModes/AudioSessionCategoriesandModes.html)). App Review 2.5.4: "Multitasking apps may only use background services for their intended purposes: VoIP, audio playback, location..." ([App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)). A metronome or looper that keeps playing counts as audio playback. Do not hold the audio background mode just to keep an agent alive.

### MIDI

Bluetooth LE MIDI has been supported since iOS 8. A paired device "appears as an ordinary MIDI device" ([Apple QA1831](https://developer.apple.com/library/archive/qa/qa1831/_index.html)). CABTMIDICentralViewController is a ready-made screen that finds and pairs nearby BLE MIDI devices, with no other setup needed ([Apple](https://developer.apple.com/documentation/coreaudiokit/cabtmidicentralviewcontroller)). CABTMIDILocalPeripheralViewController lets the iPhone act as the peripheral. CoreAudioKit is not available in the Simulator ([Apple QA1831](https://developer.apple.com/library/archive/qa/qa1831/_index.html)). The MIDI Association adopted Apple's BLE MIDI spec as the industry standard ([BLE-MIDI 1.0 spec](https://www.hangar42.nl/wp-content/uploads/2017/10/BLE-MIDI-spec.pdf)).

### Ableton Link (LinkKit)

- License: "a non-exclusive, worldwide, royalty-free, non-transferable license to use the Link SDK (a) to develop iOS applications" ([LinkKit LICENSE](https://github.com/Ableton/LinkKit/blob/master/LICENSE.md)).
- You must not violate the UI guidelines shipped with the SDK. You may only use the logos and trademarks delivered with it. You publish under your own brand. Ableton can delist apps it judges unusable with Link ([LinkKit LICENSE](https://github.com/Ableton/LinkKit/blob/master/LICENSE.md)).
- You must expose the stock `ABLLinkSettingsViewController` preference pane. Its look is not configurable ([LinkKit docs](https://ableton.github.io/linkkit/)).
- You must pass all test plan cases before App Store submission. The cases cover tempo sync, beat continuity, start/stop sync, latency compensation, and background behavior ([LinkKit docs](https://ableton.github.io/linkkit/)).
- iOS 14+ needs multicast entitlements, and iOS 17 enforces `com.apple.developer.multicast` strictly ([LinkKit README](https://github.com/Ableton/LinkKit)). That entitlement needs Apple approval; this is a lead time risk.
- Latest release: LinkKit-4.1.2, 2026-09-23 ([GitHub API](https://api.github.com/repos/Ableton/LinkKit/releases/latest)).

### What Yui does

- **AVAudioEngine, no AudioKit.** The engine is Apple's, with one `AVAudioSourceNode` for every voice (section 4). AudioKit is good and MIT, but it is a wrapper on the same engine with one maintainer, and the voices here are small enough to write. Tonic (AudioKit's theory package) is worth a look in step 3 if chord naming grows.
- **Buffer.** Ask for 5 ms (`setPreferredIOBufferDuration(0.005)`), read back what the phone gave, and log it. At 48 kHz that is 256 frames, 5.3 ms. The audio side of tap to sound stays under 10 ms; the touch is the bigger cost, so every pad, key and chord plays on touch down.
- **Session.** Instruments use `.playback` with `.mixWithOthers` by default: they play with the ringer on silent and still mix with the person's music (Chris, 2026-09-26: pressed Play on a silenced phone and heard nothing under `.ambient`). `.ambient`, which the silent switch mutes, stays available behind `playsOnSilent = false`. The tuner uses `.playAndRecord` with the `.measurement` mode (no voice processing), `.defaultToSpeaker` and `.allowBluetoothA2DP`, only while it is open.
- **Bluetooth.** When the route is Bluetooth, the instruments show one line: "Bluetooth adds a delay. Wired or the speaker feels tighter." The looper and metronome move their lights by the output latency so the light matches the sound.
- **Background.** Nothing plays after the person leaves Yui in step 2 and 3. The metronome may keep going with the phone locked (step 4), as real audio playback under guideline 2.5.4, never to keep an agent awake.
- **MIDI and Link (step 5).** Bluetooth MIDI through `CABTMIDICentralViewController`, no custom pairing screen. Link needs the multicast entitlement from Apple and has its own test plan, so step 5 asks for the entitlement first.

## 6. The tuner

### YIN vs McLeod (MPM)

- YIN (de Cheveigne and Kawahara, JASA 111(4), 2002) builds on autocorrelation. It uses a cumulative mean normalized difference and an absolute threshold. The paper claims error rates "about three times lower than the best competing methods" ([paper PDF](http://recherche.ircam.fr/equipes/pcm/cheveign/ps/2002_JASA_YIN_proof.pdf), [JASA](https://pubs.aip.org/asa/jasa/article/111/4/1917/547221/YIN-a-fundamental-frequency-estimator-for-speech)). The threshold used was 0.1, and "it does not require fine tuning" ([paper PDF](http://recherche.ircam.fr/equipes/pcm/cheveign/ps/2002_JASA_YIN_proof.pdf)).
- The YIN paper states the rule of thumb: "F0 estimation requires enough signal to cover twice the largest expected period." A larger window gives fewer errors but slower updates ([paper PDF](http://recherche.ircam.fr/equipes/pcm/cheveign/ps/2002_JASA_YIN_proof.pdf)).
- MPM (McLeod and Wyvill, ICMC 2005) uses a normalized squared difference function (NSDF). It picks the first key peak above k times the highest peak, with k usually 0.8 to 1.0. It uses parabolic interpolation, and the heavy part can be done with an FFT ([paper PDF](http://dl.icdst.org/pdfs/files4/b56e1f975f0b9b3fca904fb2a7778c15.pdf)). It works "with as little as two periods" and "can display pitch changes of one cent reliably." Typical windows at 44.1 kHz are 512 to 4096 samples, with 75% overlap ([paper PDF](http://dl.icdst.org/pdfs/files4/b56e1f975f0b9b3fca904fb2a7778c15.pdf)).
- Trade-off on a phone mic: both are time-domain and robust to strong harmonics. YIN's threshold is simple and well tested. MPM gives a "clarity" score, which is handy for ignoring room noise, and suits FFT speedups. Both can make octave errors on low strings. Clamp the search range to the chosen instrument. Also add a clarity or volume gate.

### Accuracy

- Human pitch discrimination is about 5 to 6 cents, with wide variation between people ([Wikipedia: Cent](https://en.wikipedia.org/wiki/Cent_(music))).
- Pedal tuners commonly claim plus or minus 1 cent. Strobe tuners claim 0.1 cent ([Carvin](https://carvinaudio.com/blogs/guitar-bass-education/guitar-tuner-accuracy-how-accurate-is-enough), [Peterson](https://www.petersontuners.com/products/stroboClipHD/)).
- Realistic phone target: plus or minus 1 to 2 cents on a steady note, based on MPM's 1 cent display claim above. A measured figure for iPhone mics is not confirmed. Suggested UI: call a string "in tune" inside plus or minus 3 cents, under the ~5 cent hearing limit.

### Window size for low notes (computed from two periods)

| Note | Hz | Period | 2 periods | Samples at 48 kHz | Power of 2 |
|---|---|---|---|---|---|
| E2 (guitar low E) | 82.41 | 12.13 ms | 24.3 ms | 1,165 | 2048 |
| D2 (drop D) | 73.42 | 13.62 ms | 27.2 ms | 1,308 | 2048 |
| E1 (bass low E) | 41.20 | 24.27 ms | 48.5 ms | 2,330 | 4096 |
| B0 (5-string low B) | 30.87 | 32.39 ms | 64.8 ms | 3,110 | 4096 |

Frequencies are from [Wikipedia: Piano key frequencies](https://en.wikipedia.org/wiki/Piano_key_frequencies). Note: 41.2 Hz is E1, not B0. B0 is 30.87 Hz. YIN's own tests used 25 ms windows for a 40 Hz floor ([paper PDF](http://recherche.ircam.fr/equipes/pcm/cheveign/ps/2002_JASA_YIN_proof.pdf)), so bass needs a longer window than guitar. Use 2048 for guitar and ukulele. Use 4096 for bass and chromatic, with 75% overlap.

### Standard tunings at A4 = 440 Hz

- Guitar standard, low to high: E2 82.41, A2 110.00, D3 146.83, G3 196.00, B3 246.94, E4 329.63 ([Wikipedia: Guitar tunings](https://en.wikipedia.org/wiki/Guitar_tunings)).
- Drop D: the low E goes down a whole step to D2 73.42; the rest stay standard ([Wikipedia: Guitar tunings](https://en.wikipedia.org/wiki/Guitar_tunings), [frequencies](https://en.wikipedia.org/wiki/Piano_key_frequencies)).
- Ukulele, re-entrant high G: G4 392.00, C4 261.63, E4 329.63, A4 440.00. The G is an octave up ([Wikipedia: Ukulele](https://en.wikipedia.org/wiki/Ukulele), [frequencies](https://en.wikipedia.org/wiki/Piano_key_frequencies)).
- Ukulele, low G: G3 196.00, C4, E4, A4 ([Wikipedia: Ukulele](https://en.wikipedia.org/wiki/Ukulele)).
- Bass 4-string: E1 41.20, A1 55.00, D2 73.42, G2 98.00 ([Wikipedia: Bass guitar](https://en.wikipedia.org/wiki/Bass_guitar), [frequencies](https://en.wikipedia.org/wiki/Piano_key_frequencies)).
- Bass 5-string adds a low B0 30.87 ([Wikipedia: Bass guitar](https://en.wikipedia.org/wiki/Bass_guitar)).

### Mic permission

- Info.plist must have `NSMicrophoneUsageDescription`. It "is required if your app uses APIs that access the device's microphone" ([Apple](https://developer.apple.com/documentation/bundleresources/information-property-list/nsmicrophoneusagedescription)). Without it, "the system terminates your app" ([Apple](https://developer.apple.com/documentation/avfoundation/requesting-authorization-to-capture-and-save-media)).
- Apple advises asking only when the user starts the feature that needs it ([Apple](https://developer.apple.com/documentation/avfoundation/requesting-authorization-to-capture-and-save-media)).
- App Review 5.1.1(ii): "Ensure your purpose strings clearly and completely describe your use of the data." 5.1.1(iv): do not force consent to unneeded access, and offer alternatives where you can ([App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)).
- Suggested string: "Yui listens through the microphone only while the tuner is open, to hear which note you play. Audio stays on your iPhone and is not recorded or sent anywhere." Only ship the last sentence if it is true.
- Ask for the mic when the tuner card first opens, not at app launch. If the user says no, keep a reference tone mode that plays each string so they can tune by ear.

### What Yui does

- **McLeod (MPM)**, for its clarity score: a frame with low clarity or low volume shows nothing instead of a jumping needle. The search range is clamped to the instrument (a guitar never looks below 70 Hz), which stops most octave jumps.
- **Windows.** 2048 samples for guitar and ukulele, 4096 for bass and chromatic, at 75% overlap.
- **In tune** is within 3 cents, under the 5 to 6 cents most people can hear. The needle turns green there, and the tuned event (section 2) fires when every string has held within 3 cents for a second.
- **The mic prompt** comes the first time Start is tapped, never at launch. Purpose string (`NSMicrophoneUsageDescription`): "Yui listens only while the tuner is open, to hear the note you play. Nothing is recorded or sent." Step 4 checks that sentence stays true. A no keeps the reference tones working.

## 7. Web Audio (the playground)

- Autoplay: "If an AudioContext is created before the document receives a user gesture, it will be created in the 'suspended' state, and you will need to call resume() after the user gesture" ([Chrome](https://developer.chrome.com/blog/autoplay)). Web Audio started outside a user input event is subject to autoplay rules ([MDN](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay)). Create or resume the context in the first pointerdown.
- Scheduling: Chris Wilson's "A Tale of Two Clocks" (2013) says setTimeout can drift "by tens of milliseconds or more". He suggests a 25 ms timer that schedules notes 100 ms ahead against `audioContext.currentTime` ([web.dev](https://web.dev/articles/audio-scheduling)). Use this for the metronome and step looper. Drive the playhead UI with requestAnimationFrame.
- AudioWorklet vs ScriptProcessor: ScriptProcessorNode is deprecated and "was replaced by AudioWorklets" ([MDN](https://developer.mozilla.org/en-US/docs/Web/API/ScriptProcessorNode)). It ran on the main thread, so the UI could cause audio glitches. Use AudioWorklet for any custom DSP, such as a YIN or MPM pitch tracker.
- Mic: getUserMedia needs a secure context (HTTPS or localhost) ([MDN](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia)). AnalyserNode fftSize is a power of 2 from 32 to 32768, default 2048 ([MDN](https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode/fftSize)). `getFloatTimeDomainData` gives the raw waveform for a time-domain pitch method ([MDN](https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode)). Set fftSize to 2048 for guitar and 4096 for bass (see the table above). Turning off echoCancellation, noiseSuppression, and autoGainControl for the tuner is suggested, since they can distort pitch; this is not confirmed from a primary source.
- iOS Safari silent switch: the default audio session type behaves as ambient, so the ringer switch mutes Web Audio ([nattog.dev](https://nattog.dev/blog/web-audio-ios-unmute)). Safari 16.4 added "a subset of the AudioSession Web API" ([WebKit](https://webkit.org/blog/13966/webkit-features-in-safari-16-4/)). Setting `navigator.audioSession.type = "playback"` before starting audio plays through silent mode. The older fallback is a looping silent `<audio>` element ([nattog.dev](https://nattog.dev/blog/web-audio-ios-unmute)). The spec is an Editor's Draft (13 Nov 2024) with types auto, playback, transient, transient-solo, ambient, and play-and-record ([W3C draft](https://w3c.github.io/audio-session/)). Use "play-and-record" for the tuner page. Feature-check before setting it.
- Latency hints: `latencyHint` takes "interactive" (the default, lowest glitch-free latency), "balanced", "playback", or a number in seconds ([MDN](https://developer.mozilla.org/en-US/docs/Web/API/AudioContext/AudioContext)). `baseLatency` is the processing latency from the graph to the OS, and is widely available since April 2021 ([MDN](https://developer.mozilla.org/en-US/docs/Web/API/AudioContext/baseLatency)). `outputLatency` covers the time from the OS to the device, and is Baseline since March 2025 ([MDN](https://developer.mozilla.org/en-US/docs/Web/API/AudioContext/outputLatency)). Add both to offset the visual playhead, which matters most over Bluetooth.

### What the mock does

The playground follows all of this: one `AudioContext` made on the first tap with `latencyHint: "interactive"`, a 25 ms timer that schedules 100 ms ahead for the looper, drum takes and the metronome, `navigator.audioSession.type` set where Safari has it, and the tuner on `getUserMedia` with echo cancellation, noise suppression and gain control off. The voices are node graphs built per hit (section 4).

## 8. Steps

Each step is its own card on the board and waits for the one before it.

### Step 2: the sound engine, loop and drums (native)

1. `YuiSound`, a small Swift package in the app: the engine (section 4), the audio session (section 5), the voice bank, one clock, a scheduler and a limiter.
2. `loop` and `drums` drawn in the app from the parser's ops, on the stage and inline, light and dark, in the agent's theme.
3. The Swift parser learns the six presets: `37-music.json` leaves the not-yet list in the app repo and passes.
4. Proof: a tap-to-sound measurement on a real iPhone (a recording of the tap and the sound, or a loopback), the looper's timing measured over 5 minutes (drift under 1 ms), no audio thread allocation in Instruments, screenshots, and a TestFlight build.

### Step 3: keys and chords

Keys with the scale lock, glide and more than one finger; chords from numerals and names with strum; the sound picker. Proof: a video of both, and a test that every numeral in section 2 names the right chord in every key.

### Step 4: tuner and metronome

Pitch detection on the mic (section 6), the tunings table, the mic prompt with the purpose string, the reference tones; the metronome on the shared clock with tap tempo. Proof: tuned against a reference tone at known offsets (within 2 cents), a guitar and a ukulele tuned on a real phone, the metronome against a click track for 5 minutes.

### Step 5: recording, export, MIDI and Link

Recording and export (section 3), Bluetooth and USB MIDI in (a MIDI keyboard plays `keys`), MIDI clock out, and Ableton Link so the looper plays in time with other apps on the same Wi-Fi. Proof: a take received by an agent as a link, a MIDI keyboard playing, two devices in time over Link.

## Sources

Every source is linked where it is used, in sections 1, 5, 6 and 7. The sound recipes are `synth.py` from the soundtrack of Yui's first film, in the yuigui repo's brag folder.
