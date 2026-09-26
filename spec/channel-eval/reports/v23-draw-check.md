# Channel eval: v23-draw-check

Guide v23+c0b1a25b (2287 words), model claude-opus-5-5, 2026-09-26T08:38.

**1/1 passed (100%).**

| category | passed |
|---|---|
| report | 1/1 |

| case | result | why |
|---|---|---|
| draw-screen-fix | pass |  |

## Transcripts

### draw-screen-fix (pass)

**Chris:** The build-ready screen shows the headline, two lines of notes, then a Got it button and an Install button. Which of those should go, and why? Show me on the screen itself.

Good: A `sketch` of the screen (frame=phone) with the headline and notes as rows, Got it as a +button row struck out (+x) with a short note (it does nothing), Install as a +button row highlighted. At most a line of chat.

````
The Got it button goes. It only acknowledges and does nothing, and leaving the screen already means "got it." Install stays because it's the one action on that screen.

```yui
sketch "Build ready" frame=phone
row "Build 82 is ready"
row "Add any A2A agent by its Agent Card"
row "Tests: client 42/42, e2e 66/66"
row "Got it" +button +x note="does nothing"
row "Install" +button
after
row "Build 82 is ready"
row "Add any A2A agent by its Agent Card"
row "Tests: client 42/42, e2e 66/66"
row "Install" +button +hi note="the one real action"
```
````
