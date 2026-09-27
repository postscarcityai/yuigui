# Brag plan: tune up, keep time, send a take (11-tune-up, Yui 0.4.1)

## Angle

One real moment: a guitarist about to practice. Most people open three apps first: a tuner, a metronome, a voice memo. In Yui they talk to their agent once and the tools arrive in the chat. The film follows one practice session from the first word to the take going back to the agent: tune up on the mic, a click at 90, a beat under the click, Record, Stop and send, then a MIDI keyboard playing the keys.

03 Jam already sold loops and chords. This one is about the four new things in 0.4.1 and the one idea behind them: what you play goes back to the agent.

Dark theme, Wizard's look (violet, New York serif), because the 0.4.1 screenshots of the music tools are Wizard's.

## Facts used (all shipped in Yui 0.4.1, build 208)

- **Release.** Yui 0.4.1, build 208, on TestFlight since Sep 27 2026 (ROADMAP.md "Where Yui is now", `site/content/builds.json` build 208 "Yui 0.4.1: tuner, metronome, record a take, MIDI keyboard", the Thought `docs/thoughts/yui-0-4-1-tune-up-keep-time-send-a-take.md`).
- **Tuner.** `tuner guitar`. It listens on the mic, lights the string you play, a needle from -50 to +50 cents, green within 3 cents; guitar, ukulele, bass or any note (spec/MUSIC.md "tuner", showcase `tuner-in-app`, `tuner`). When every string has held within 3 cents it sends one event, `{"id":"n1","preset":"tuner","tuned":true,"instrument":"guitar",…}` (spec/MUSIC.md). Screens rebuilt from `yui116r-tuner-tuned-light`, `yui116s4-tuner-dark`.
- **Metronome.** `metronome 90`. Sits in the chat: a big tempo, minus and plus, Tap tempo, a dot per beat with the first accented, Start and Stop. It shares the engine's clock, so a loop under it plays on its beat. Stop after 10 s or more sends the practice time to the agent (spec/MUSIC.md "metronome", "One clock"; showcase `metronome`; `yui116s4-metronome-light`, `yui116r-metronome-loop-light`).
- **Record a take.** Record on the looper, pads, keys and chords records what Yui plays, not the mic. Stop and send gives the agent the sound as an .m4a and the notes as a .mid (showcase `take`; spec/MUSIC.md take links `audio` + `midi`; `yui116s5-take-recording-light`, `yui116s5-take-sent-*`: "Stop and send" with a red timer, then "Record again", "Take sent, 0:04").
- **MIDI keyboard.** A USB or Bluetooth keyboard plays the keys on screen, each note lights up (showcase `midi-keys`, `yui116s5-midi-keys-light`: a card titled MIDI with the sound chips and a keyboard chip).
- **Talk to start.** The 0.4.0 face: "Hi. Tap the mic and talk." with +, T and a big mic bottom right (YUI-121, `yui122-stage-light`).

## Storyboard (90 BPM, a bar is 2.67 s, 18 bars is 48 s)

| Time | Scene | Left | Right | Line |
|---|---|---|---|---|
| 0 to 5.3 | Wizard's empty stage. Tap the mic (1.9), the words come in: "Tune me up. Guitar, standard." Getting your tuner ready | Three apps before you practice? | Just ask. | |
| 5.3 to 10.7 | The tuner slides up. Each string plucked and heard: E2, A2, D3, G3 as the needle swings in and turns green | A tuner on the mic. | Green within 3 cents. | `> tuner guitar` |
| 10.7 to 16 | B3, E4, All strings in tune. Poster frame (13.6). Tap close (15.5) | All six in tune. | Your agent hears it. | `→ agent {"tuned":true,…}` |
| 16 to 21.3 | The chat: "Now a click at 90." A metronome card, tap Start (18.3), clicks from bar 7, a dot per beat | A metronome in the chat. | One dot a beat. | `> metronome 90` |
| 21.3 to 26.7 | "Give me a beat to record over." Take one, a loop, drops in on bar 9 under the click | Put a beat under it. | They play in time. | `> loop 90 "Take one" p=x…` |
| 26.7 to 32 | Tap Record on bar 10: Stop and send, a red timer 0:00 to 0:05 | Press Record. | It records what Yui plays. | |
| 32 to 37.3 | Tap Stop and send on bar 12. Take sent, 0:05; the take lands in the chat (.m4a, .mid), Wizard answers | Stop and send. | The sound and the notes. | `→ agent take.m4a + take.mid` |
| 37.3 to 42.7 | The MIDI card slides up, G major, a keyboard plays a line and each key lights | Plug in a keyboard. | It plays the keys. | `> keys G major` |
| 42.7 to 48 | Outro: Tune up. Keep time. Send a take. yuigui.com. Yui 0.4.1, on TestFlight now | | | |

## Beyond the spec, or approximated (told to Chris)

- **The take in the chat.** The film shows the sent take as a bubble with a waveform and `.m4a` `.mid` chips. The app sends the files to the agent; how the take draws in the chat record is not captured in a screenshot, so that bubble is approximated. Wizard's answer ("Got it: 5 seconds at 90…") is scripted demo content.
- **"Getting your tuner ready"** under the spoken words stands in for the working row; the words the agent shows there vary.
- **Loop and metronome together in the chat** follow `yui116r-metronome-loop-light`. The looper's playhead, grid colors and six rows (the app shows eight) are drawn by eye from the screenshots.
- **The MIDI keyboard** is not shown as hardware; the chip reads "MIDI keyboard" where the app shows the connected device's name. G major and the line it plays are demo content.
- **The hook** ("Three apps before you practice?") is a framing line, not a claim about any other app.
- **Left out on purpose:** MIDI clock out to a drum machine (true, but hard to show without hardware), ukulele and bass tuners, the metronome's practice-time event.

## Sound

`music.py` with `kit/sound.py`: dub at 90 BPM, Em C G D, one chord a bar. Level 1 under the hook and the tuner so each plucked open string rings through on the time the tuner hears it, a bell when all six are in. The metronome's clicks (the high one on beat 1) run from bar 7, the one drop comes in with them, a siren and the drop land on the loop at bar 9, full groove through Record and Send (a two-note bell as the take goes). The MIDI line plays on the keys sound, note for note with the lit keys. Outro C to G, a G strum and a bell. Taps on the five finger taps. Mastered by `kit/mux.sh` to about -14 LUFS.
