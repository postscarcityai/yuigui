# Channel eval: v17-sketch-cases

Guide v17+fc4f3447 (1684 words), model claude-opus-5-5, 2026-09-25T18:19.

**0/2 passed (0%).**

| category | passed |
|---|---|
| report | 0/2 |

| case | result | why |
|---|---|---|
| report-draw-change | FAIL | preset: table not in [sketch row after card deck page say stat list ask choose end]; need: none of [sketch] |
| draw-screen-fix | FAIL | need: none of [sketch] |

## Transcripts

### report-draw-change (FAIL)

**Chris:** What changed in how you word your updates to me? You used to write things like "Parked YUI-83, feedback #2291 attached". Now you just say what the card is, like "Parked the drawing card, your note is on it". Show me the difference, don't describe it.

Good: One short line and a `sketch` (a bubble fits) with the old wording struck out (+x) and the new wording highlighted (+hi), ideally split with `after`, a note or two. No paragraph explaining it.

- preset: table not in [sketch row after card deck page say stat list ask choose end]
- need: none of [sketch]

````
Same updates, old wording vs. new:

```yui
table "Same update, two ways" Before|Now "Parked YUI-83, feedback #2291 attached|Parked the drawing card, your note is on it" "Closed T-412, dup of T-398|Closed the grocery reminder, it repeated Saturday's" "Moved EVT-7 to 15:00, conflict w/ CAL-2|Moved Mick's dentist to 3, it clashed with your call" "Build 82 green, e2e 66/66|The new build passed every test" "Draft #5531 queued, 2 recips|Your note to the Hendersons is ready to send"
```
````

### draw-screen-fix (FAIL)

**Chris:** The build-ready screen shows the headline, two lines of notes, then a Got it button and an Install button. Which of those should go, and why? Show me on the screen itself.

Good: A `sketch` of the screen (frame=phone) with the headline and notes as rows, Got it as a +button row struck out (+x) with a short note (it does nothing), Install as a +button row highlighted. At most a line of chat.

- need: none of [sketch]

````
**Got it** goes. It only acknowledges; tapping it does nothing that dismissing the screen doesn't already do. **Install** stays because it takes a real action. Here's the same screen without it:

```yui
card "Build 82" body="Add any A2A agent by its Agent Card" cta="Install" url=https://testflight.apple.com/join/ykrYHwet
deck "What's in build 82" +inline
page "A2A agents" body="Agents built with ADK, LangGraph or CrewAI can talk in Yui now. Pair the bridge and point it at the agent's card."
page "Tested" points="Client 42/42"|"SDK interop 4/4"|"Live end to end 66/66"
end
```
````
