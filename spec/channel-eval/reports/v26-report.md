# Channel eval: v26-report

Guide v26+ff8a3e43 (2482 words), model claude-opus-5-5, 2026-09-26T15:01.

**5/5 passed (100%).**

| category | passed |
|---|---|
| report | 5/5 |

| case | result | why |
|---|---|---|
| report-card-done | pass |  |
| report-long-walkthrough | pass |  |
| report-draw-change | pass |  |
| draw-screen-fix | pass |  |
| report-pages-picture | pass |  |

## Transcripts

### report-card-done (pass)

**Chris:** The worker just finished card INT-18 on the board. Its handoff summary: "A2A bridge: add any A2A agent to Yui by its Agent Card. node adapters/a2a/yui-a2a.ts pair <code> --card <url>, then run; add --card <url> puts more agents on the same machine. Runtime-neutral TypeScript client (src/a2a.ts + src/sse.ts, fetch and an SSE parser only, so the hosted step runs the same code in a Durable Object): A2A 1.0 SendMessage / SendStreamingMessage / SubscribeToTask / GetTask / CancelTask and 0.3 message/send, message/stream, tasks/resubscribe, tasks/get, one version-free shape for callers. The bridge keeps the relay's rules (delivered on pickup, handled after the answer, outbox on disk, one turn at a time per agent). Tests: client.test.ts 42/42; sdk_interop.test.ts 4/4 against the official a2a-sdk servers (1.1.5 and 0.3.26); a2a_e2e.py 66/66 live on throwaway accounts (kill -9 mid-task resumes the same task and answers once) plus the phone run 6/6 on the iPhone 18 Pro sim. No app binary change (INT-18)" Tell me what shipped.

Good: One short line, a card with the headline (A2A agents can join Yui), and the detail as a deck of short pages (what it does, how to add one, the test counts as points). No paragraph relaying the summary.

````
The A2A bridge shipped: any A2A agent can now join Yui by its Agent Card.

```yui
card "A2A bridge" body="Add any A2A agent to Yui by its Agent Card. No app update needed."
deck "What shipped" +inline
page "Add an agent" body="Pair once with the bridge, pointing it at the agent's card URL, then run it. More agents can go on the same machine by adding their cards."
page "Works with both versions" body="The client speaks A2A 1.0 and 0.3: send, stream, resubscribe, get and cancel a task. Callers see one shape either way."
page "Built to run anywhere" body="It uses only fetch and a small stream parser, so the hosted version runs the same code in the cloud."
page "Same rules as the relay" points="Delivered when picked up"|"Handled after the answer"|"Outbox kept on disk"|"One turn at a time per agent"
page "Tested" points="Client 42/42"|"Official A2A servers 1.1.5 and 0.3.26: 4/4"|"Live end to end 66/66"|"Phone run on iPhone 18 Pro sim 6/6"|"Killed mid-task, it resumed and answered once"
end
```
````

### report-long-walkthrough (pass)

**Chris:** Walk me through everything that changed in how Yui delivers messages this week: replies are exactly-once both ways with acks, a reply outbox on disk, presence reads online/asleep/offline per agent, pushes skip a phone already watching the thread, agents can be muted, and a paired agent whose gateway never started now says 'not listening yet' with the restart command.

Good: A deck (or plan) of short pages, one change per page, under one short chat line. Not a long bulleted or prose message.

````
Six delivery changes landed in Yui this week.

```yui
card "Delivery this week" body="Exactly-once replies, a disk outbox, per-agent presence, quieter pushes, mute, and a clear 'not listening yet'"
deck "How Yui delivers now" +inline
page "Exactly once, both ways" body="Every message now gets an ack. The sender holds it until the other side confirms, so nothing drops, and repeats are ignored on arrival, so nothing lands twice. This works from phone to agent and agent to phone."
shapes caption="Send, hold, ack, then let go."
shape circle Sender +grow
shape arrow
shape box Message +fill
shape arrow
shape circle Receiver
shape arrow
shape pill Ack +pulse tone=mint
page "Reply outbox on disk" body="Replies are written to disk before they go out. A crash, restart or dropped connection no longer loses a reply: it sits in the outbox and sends once the link is back, then clears on ack."
page "Presence per agent" points="Online: connected and listening"|"Asleep: reachable, not active"|"Offline: not connected"
page "Quieter pushes" body="If the phone already has the thread open, Yui skips the push. You see the message on screen instead of a buzz for something you're already reading."
page "Mute an agent" body="Any agent can be muted. Its messages still arrive in its thread; it just stops pushing to the phone."
page "Not listening yet" body="A paired agent whose gateway never started used to look silently dead. It now says so and shows the command that restarts it."
sketch frame=bubble
row "Message sent" +x note="no reply, no reason"
after
row "Not listening yet" +hi note="says why"
row "Restart the gateway" +button
end
end
```
````

### report-draw-change (pass)

**Chris:** What changed in how you word your updates to me? You used to write things like "Parked YUI-83, feedback #2291 attached". Now you just say what the card is, like "Parked the drawing card, your note is on it". Show me the difference, don't describe it.

Good: One short line and a `sketch` (a bubble fits) with the old wording struck out (+x) and the new wording highlighted (+hi), ideally split with `after`, a note or two. No paragraph explaining it.

````
Ids out, plain words in.
```yui
sketch "How I report a parked card" frame=bubble
row "Parked YUI-83, feedback #2291 attached" +x note="two ids you'd have to look up"
after
row "Parked the drawing card, your note is on it" +hi note="says what it is and what's on it"
```
````

### draw-screen-fix (pass)

**Chris:** The build-ready screen shows the headline, two lines of notes, then a Got it button and an Install button. Which of those should go, and why? Show me on the screen itself.

Good: A `sketch` of the screen (frame=phone) with the headline and notes as rows, Got it as a +button row struck out (+x) with a short note (it does nothing), Install as a +button row highlighted. At most a line of chat.

````
"Got it" goes. It only acknowledges, so tapping it does nothing. Install stays because it's the one action on the screen.

```yui
sketch "Build ready" frame=phone
row "Build 82 is ready"
row "A2A bridge: add any agent by its card"
row "Tests all green"
row "Got it" +button +x note="does nothing; dismissing is free"
row "Install" +button
after
row "Build 82 is ready"
row "A2A bridge: add any agent by its card"
row "Tests all green"
row "Install" +button +hi note="the one real action"
```
````

### report-pages-picture (pass)

**Chris:** Walk me through the three changes to how you write updates to me this week, one at a time: you name cards in plain words instead of ids like YUI-83, a long update comes as pages instead of a wall of text, and cards no longer end in a 'Got it' button that does nothing. For each one, show me what it looked like before and after.

Good: One short line and a deck of three pages, one change each, and each page's picture a sketch right after it: the old wording or button struck out (+x), the new one highlighted (+hi), ideally split with `after`. No paragraph.

````
Three changes, one page each.

```yui
>full
deck "How updates changed this week"
page "Plain names, not ids" body="Cards are named for what they are. An id like YUI-83 meant looking something up; the name tells you at a glance."
sketch frame=bubble
row "Parked YUI-83 in the backlog" +x note="an id means nothing"
after
row "Parked the drawing card in the backlog" +hi note="plain words"
end
page "Pages, not walls" body="A long update now opens with one line and a card holding the headline. The details follow as short pages, one idea each, so nothing reads as a block of text."
sketch frame=bubble
row "Build 82 is ready. Latest change: A2A bridge: add any A2A agent by its Agent Card. node yui-a2a.ts pair ... Tests: client 42/42, interop 4/4, e2e 66/66 ..." +x note="one long wall"
after
row "Build 82 is ready." +hi
row "Card: Add any A2A agent by its Agent Card" +hi
row "Page: A2A agents · Page: Tested 42/42, 4/4, 66/66" +hi note="one idea per page"
end
page "No do-nothing buttons" body="A card only carries a button when the button does something. A plain note stays a note, and real actions get a name for what they do."
sketch frame=bubble
row "Parked the drawing card in the backlog"
row "Got it" +button +x note="tapping did nothing"
after
row "Parked the drawing card in the backlog"
row "Open TestFlight" +button +hi note="only when there's a real action"
end
end
```
````
