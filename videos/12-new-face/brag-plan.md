# Brag plan: the new face, filmed in the app (12-new-face)

## Angle

07-full-screen showed the new layout as the web mock before it shipped and ended on "In the app on TestFlight next." 0.4.0 (build 204) shipped it and 0.4.1 (build 208) rides on it, so this one is filmed in the real app: every frame inside the phone is the simulator running yui 0b6f0b6, the 0.4.1 commit that became build 208. Same pain as 07 for the hook (eight pages to say you are up to date), then the layout in the order a person meets it, and it ends on "Yui 0.4.1 is on TestFlight now."

Chris, Sep 27: "we're on 0.4.1 and I don't think we have enough brag videos about [the new layout]. Generate a new brag video on the new layout and put it on the homepage." Card SOC-6 (t_3013cfa6).

## How it was filmed

- Scenes are UI tests in yui `YuiUITests/BragLayoutTests.swift` (six tests: talk, parts, motion on Coach and on Wizard, the visual with a voice, the visual with a beat). Demo account, scripted voice (`-yuiPTTFake`, `-yuiPTTDemo`) and scripted replies (`-yuiDemoReply`), no network.
- `record.py` runs each test while `simctl io recordVideo` films an iPhone 18 Pro simulator, anchors the marks on the file's end, and cuts 30 fps frames into `work/frames/<scene>/`. The comp shows those frames inside the kit's phone (`EDL` in comp.html: comp time to footage time).
- Everything plays at real speed. Two edits, both said here: part 1 of the long answer is held for 2.2 s so it can be read (the demo streams the whole reply at once and the next tap came quickly), and the Wizard clip skips 0.8 s where the idle line blinked before the answer (see below). The record scene starts 5 s after Send (nothing moved in those 5 s).
- Finger taps are placed on the frames where the app moved (frame diffs), so they sit a little off the beat grid.

## Facts used

- **The pain** (docs/thoughts/the-chat-becomes-the-record.md): "Chris asked Yui a status question on Sep 26 and got eight full screen pages back to say he was up to date."
- **What shipped** (docs/thoughts/yui-0-4-0-the-new-face-of-yui.md, build 204): the answer plays on the full screen in short parts, a line and a picture each; questions at the end on one page with one Send; the chat is the record behind the button top right; a big mic bottom right, T and +; each agent moves its own way (Coach snappy, Wizard heavy and punchy); a live picture (aurora, orb, waves, grain, bloom) that moves with your voice, the agent's voice and the music.
- **Build 208 is Yui 0.4.1** (docs/thoughts/yui-0-4-1-tune-up-keep-time-send-a-take.md, Sep 27).
- **Demo content** inside the phone is scripted: "Am I on the latest build?", "Yes. Build 208, the newest.", a release of "0.4.2" with the tuner and metronome, "Ableton Link waits for the next one." (true: Link waits on Chris per SITE-60), the drone forecast, the boom bap loop. 0.4.2 is not a real release; it is the demo reply's words.

## Storyboard (100 BPM, a bar is 2.4 s, 28 bars is 67.2 s)

| Time | Scene | Left | Right | Line |
|---|---|---|---|---|
| 0 to 7.2 | Drawn (as 07): the old chat, eight pages stack in on beats | You asked one question. | You got eight pages. | |
| 7.2 to 16.8 | Real app slides up on the drop. Hold the mic (8.2 to 10.3), "Am I on the latest build?", working (Checking TestFlight, Asking your devices), the answer at 14.2. Push in. Poster 15.6 | Hold the mic and talk. / One question. | It answers on the whole screen. / One screen back. | |
| 16.8 to 31.2 | "Ship the music tools to TestFlight", working, three parts, next taps at 22.4 and 27.0 | Longer answers play in parts. | A line and a picture each. | `say "0.4.2 is building…"` |
| 31.2 to 40.8 | Before I go: Yes, ping me (35.0), Tuner (37.6), Send (40.1), "Sent. It's in the chat." | Questions wait for the end. | Answer them all. One Send. | `plan@before "Before I go"` |
| 40.8 to 45.6 | Tap the record top right (41.3): every part as a row, the plan's answers | The chat is the record. | Every part, one row. | |
| 45.6 to 55.2 | Two phones: the same ask on Coach and on Wizard (look said in words: heavy, punchy) | Each agent moves its own way. | Coach is quick. Wizard is heavy. | |
| 55.2 to 62.4 | Two phones, dark: aurora listening to "Is my morning free tomorrow?"; waves with a boom bap loop, Play at 57.7 | A picture that listens. | To your voice. To the beat. | |
| 62.4 to 67.2 | Outro: Yui lives on the full screen. yuigui.com. Yui 0.4.1 is on TestFlight now. | | | |

## Beyond what is shipped, or approximated

- Nothing shown is beyond the spec: all of it is in build 208. Scripted demo replies and a faked voice stand in for a live agent and a mic (the simulator has none).
- **Seen while filming, real app quirks** (worth a look, not claimed as features): a blink of the idle line ("Anything else?") between the working line and the answer on some turns; in the record, the agent chip and the header title overlap when the list is scrolled; a tap on text in the record opened the agent menu instead of the part. The film cuts around the first and last.
- The looper in the last scene plays at 96 BPM in the app; the film's music is 100 BPM, and the app's own sound is not in the recording.

## Sound

`music.py` with `kit/sound.py`: 100 BPM, swing 30, in F, dub. Thin hook on Dm7 and C with a pluck per page, a siren into the drop at 7.2 when the real app slides up, level 3 for talk and the parts, 4 with the melodica for the questions, the two agents and the visual, 2 and 1 for the outro ending C to F. A bell on the answer and each part, an F arpeggio on Send, a swell and crash on each cut, a tap sound on every finger tap.
