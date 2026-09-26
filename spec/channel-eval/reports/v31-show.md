# Channel eval: v31-show

Guide v31+82ff5628 (2842 words), model claude-opus-5-5, 2026-09-26T23:14.

**2/3 passed (67%).**

| category | passed |
|---|---|
| saved | 1/1 |
| show | 1/2 |

| case | result | why |
|---|---|---|
| show-saved-workout | pass |  |
| show-phase-one | FAIL | show: a part with no picture :: Chat is the record; show: a heading over a paragraph :: Chat is the record; show: a heading over a paragraph :: Talking back, bottom right |
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

### show-phase-one (FAIL)

**Chris:** Walk me through phase one. (What you know: phase one of the full-screen change. Answers play as full-screen chunks, and the chat is just the record, top right. Bottom right: a bigger mic, a T that opens the text field, and a + for attachments, including images. Settings sit behind a hamburger at top left, beside the agent picker.)

Good: A line and a drawing per part: the stage with a chunk on it, the record top right, the new bottom bar (big mic, T, +). Never a page with a heading over a paragraph (feedback AL1My-stUBnvtXD2WKV7ec8, YUI-119).

- show: a part with no picture :: Chat is the record
- show: a heading over a paragraph :: Chat is the record
- show: a heading over a paragraph :: Talking back, bottom right

````
Phase one in four stops: answers take the screen, and the controls move to the corners.

```yui
deck "Phase one: full screen"
page "Answers take the screen" body="An answer plays as full-screen chunks, one after another, instead of stacking up as bubbles. What the agent says is the whole view while it plays."
sketch frame=phone
row "Bubble, bubble, bubble in a scrolling chat" +x note="before"
after
row "One answer chunk, full screen" +hi note="phase one"
end
page "Chat is the record" body="The chat stays, but it stops being the main view. It lives behind a button at the top right, as the history of what was said. It opens to look back and closes to return to the answer."
page "Talking back, bottom right" body="Three controls sit at the bottom right. The mic is bigger, so voice is the default. T opens the text field only when typing is wanted. + attaches files, including images."
sketch frame=phone
row "Bigger mic" +button +hi note="voice first"
row "T" +button note="opens the text field"
row "+" +button note="attachments and images"
end
page "Settings, top left" body="Settings go behind a hamburger at the top left, next to the agent picker. The top edge handles who you're talking to and how; the bottom handles what you say."
shapes "The corners" caption="Setup at the top left, the record at the top right, input at the bottom right."
shape pill Menu at=1,1
shape pill Agent at=3,1
shape box Record at=9,1
shape blob Answer at=5,3 +grow tone=mint
shape text T at=7,5
shape text + at=8,5
shape circle Mic at=9,5 +pulse +fill
end
```
````

### show-new-layout (pass)

**Chris:** Show me the bigger microphone. Does the text field look better? I want to see the new layout of big microphone, T for text and + to attach. Remember, I want you to show me this. (What you know: phase one of the full-screen change. Answers play as full-screen chunks, and the chat is just the record, top right. Bottom right: a bigger mic, a T that opens the text field, and a + for attachments, including images. Settings sit behind a hamburger at top left, beside the agent picker.)

Good: The bottom bar drawn: `sketch frame=phone` with `+button` rows for +, T and the big mic, ideally before and after (the old always-there field struck out). Not a description of it (feedback AL1My-stUBnvtXD2WKV7ec8).

````
Here's phase one: the old bottom bar, then the new layout.

```yui
sketch "Phase one layout" frame=phone
row "☰  Agent ▾                              💬" note="settings and agent picker left, chat record right"
row "Your answer fills the screen, one chunk at a time"
row "[ Type a message…              🎤 ]" +x note="today: full text field, small mic"
after
row "☰  Agent ▾                              💬" +hi note="chat is just the record now"
row "Your answer fills the screen, one chunk at a time" +hi
row "+" +button note="attach, images too"
row "T" +button note="opens the text field only when needed"
row "🎤" +button +hi note="bigger mic, the main way in"
```

The text field is hidden behind T now, so the screen stays clear for the answer.
````
