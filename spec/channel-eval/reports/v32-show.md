# Channel eval: v32-show

Guide v32+2d385519 (2999 words), model claude-opus-5-5, 2026-09-26T23:15.

**3/3 passed (100%).**

| category | passed |
|---|---|
| saved | 1/1 |
| show | 2/2 |

| case | result | why |
|---|---|---|
| show-saved-workout | pass |  |
| show-phase-one | pass |  |
| show-new-layout | pass |  |

## Transcripts

### show-saved-workout (pass)

**Chris:** Slammed again today. Pull up my busy day workout.

Good: `show busy-day` (the name it saved), one short line, no re-sent timer.

````
Here's your busy-day Tabata. Twenty minutes, go.
```yui
show busy-day
```
````

### show-phase-one (pass)

**Chris:** Walk me through phase one. (What you know: phase one of the full-screen change. Answers play as full-screen chunks, and the chat is just the record, top right. Bottom right: a bigger mic, a T that opens the text field, and a + for attachments, including images. Settings sit behind a hamburger at top left, beside the agent picker.)

Good: A line and a drawing per part: the stage with a chunk on it, the record top right, the new bottom bar (big mic, T, +). Never a page with a heading over a paragraph (feedback AL1My-stUBnvtXD2WKV7ec8, YUI-119).

````
Phase one, in three parts.

```yui
say "Answers take the whole screen, chunk by chunk."
sketch "Answers" frame=phone
row "Chat" +button note="the record, top right"
row "Yes. Build 160, the newest." +hi note="one chunk, full screen"
say "Talk first. Type or attach when you want."
sketch "Bottom bar" frame=phone before=Now
row "+  Say something nice  Mic" +button +x note="a field always open"
after New
row "+   T   Mic" +button +hi note="+ attaches images; T opens the field; big mic"
say "Settings move behind a menu, top left."
sketch "Top bar" frame=phone
row "☰  Agent ▾                    Chat" +button +hi note="hamburger sits beside the agent picker"
```
````

### show-new-layout (pass)

**Chris:** Show me the bigger microphone. Does the text field look better? I want to see the new layout of big microphone, T for text and + to attach. Remember, I want you to show me this. (What you know: phase one of the full-screen change. Answers play as full-screen chunks, and the chat is just the record, top right. Bottom right: a bigger mic, a T that opens the text field, and a + for attachments, including images. Settings sit behind a hamburger at top left, beside the agent picker.)

Good: The bottom bar drawn: `sketch frame=phone` with `+button` rows for +, T and the big mic, ideally before and after (the old always-there field struck out). Not a description of it (feedback AL1My-stUBnvtXD2WKV7ec8).

````
Yes. The field stays hidden until you tap T, so the mic gets the room.
```yui
say "The bottom bar, before and after."
sketch "Bottom bar" frame=phone before=Now
row "+  Say something nice  Mic" +button +x note="a field always open, small mic"
after New
row "+     T     MIC" +button +hi note="big mic; T opens the field; + attaches images"
say "Tap T and the field slides up."
sketch "After tapping T" frame=phone
row "Say something nice" +hi note="the field, only when you want it"
row "+     T     MIC" +button
say "The whole screen in phase one."
sketch "Phase one layout" frame=phone
row "☰  Agent ▾            Chat" +button note="settings left, the record top right"
row "Yes. Build 160, the newest." +hi note="the answer takes the screen"
row "+     T     MIC" +button +hi note="talk first"
```
````
