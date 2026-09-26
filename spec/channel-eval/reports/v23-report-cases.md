# Channel eval: v23-report-cases

Guide v23+c0b1a25b (2287 words), model claude-opus-5-5, 2026-09-26T08:38.

**4/4 passed (100%).**

| category | passed |
|---|---|
| report | 4/4 |

| case | result | why |
|---|---|---|
| report-card-done | pass |  |
| report-long-walkthrough | pass |  |
| report-draw-change | pass |  |
| report-pages-picture | pass |  |

## Transcripts

### report-card-done (pass)

**Chris:** The worker just finished card INT-18 on the board. Its handoff summary: "A2A bridge: add any A2A agent to Yui by its Agent Card. node adapters/a2a/yui-a2a.ts pair <code> --card <url>, then run; add --card <url> puts more agents on the same machine. Runtime-neutral TypeScript client (src/a2a.ts + src/sse.ts, fetch and an SSE parser only, so the hosted step runs the same code in a Durable Object): A2A 1.0 SendMessage / SendStreamingMessage / SubscribeToTask / GetTask / CancelTask and 0.3 message/send, message/stream, tasks/resubscribe, tasks/get, one version-free shape for callers. The bridge keeps the relay's rules (delivered on pickup, handled after the answer, outbox on disk, one turn at a time per agent). Tests: client.test.ts 42/42; sdk_interop.test.ts 4/4 against the official a2a-sdk servers (1.1.5 and 0.3.26); a2a_e2e.py 66/66 live on throwaway accounts (kill -9 mid-task resumes the same task and answers once) plus the phone run 6/6 on the iPhone 18 Pro sim. No app binary change (INT-18)" Tell me what shipped.

Good: One short line, a card with the headline (A2A agents can join Yui), and the detail as a deck of short pages (what it does, how to add one, the test counts as points). No paragraph relaying the summary.

````
The A2A bridge shipped. No new app build is needed.

```yui
card "A2A bridge" body="Add any A2A agent to Yui by its Agent Card"
deck "What shipped in the A2A bridge" +inline
page "Pair any A2A agent" body="Run node adapters/a2a/yui-a2a.ts pair <code> --card <url>, then run. Each extra --card <url> puts another agent on the same machine."
page "One client, anywhere" body="The TypeScript client uses only fetch and an SSE parser. The hosted step can run the same code in a Durable Object."
page "Both protocol versions" points="A2A 1.0: send, stream, subscribe, get, cancel"|"A2A 0.3: send, stream, resubscribe, get"|"Callers see one version-free shape"
page "Same rules as the relay" points="Delivered on pickup"|"Handled after the answer"|"Outbox kept on disk"|"One turn at a time per agent"
page "Tested" points="Client 42/42"|"Official a2a-sdk servers 4/4 (1.1.5 and 0.3.26)"|"Live end to end 66/66"|"Phone run 6/6 on iPhone 18 Pro sim"
page "Survives crashes" body="A kill -9 in the middle of a task resumes that same task, and the agent answers only once."
end
```
````

### report-long-walkthrough (pass)

**Chris:** Walk me through everything that changed in how Yui delivers messages this week: replies are exactly-once both ways with acks, a reply outbox on disk, presence reads online/asleep/offline per agent, pushes skip a phone already watching the thread, agents can be muted, and a paired agent whose gateway never started now says 'not listening yet' with the restart command.

Good: A deck (or plan) of short pages, one change per page, under one short chat line. Not a long bulleted or prose message.

````
Six delivery changes this week.
```yui
card "Delivery this week" body="Exactly-once replies, a disk outbox, per-agent presence, quieter pushes, mute, and a clear not-listening state"
deck "How Yui delivers now" +inline
page "Exactly once, both ways" body="Every reply carries an ack in both directions. A message is resent until the other side confirms it, and a duplicate is dropped on arrival, so nothing is lost and nothing shows up twice."
page "Reply outbox on disk" body="Outgoing replies are written to disk before sending. If the gateway or the phone restarts mid-send, the outbox picks up where it stopped instead of dropping the reply."
page "Presence per agent" points="Online: listening now"|"Asleep: will pick it up later"|"Offline: not reachable"
page "Quieter pushes" body="When the phone already has that thread open, the push is skipped. The message just appears in the chat, with no buzz for something already on screen."
page "Mute an agent" body="Any agent can be muted. Its messages still arrive and stay in its thread, without pushes."
page "Not listening yet" body="A paired agent whose gateway never started no longer looks silently broken. Its thread says it is not listening yet and shows the command that starts it."
sketch frame=bubble
row "Agent paired, gateway down" +x note="used to look like silence"
after
row "Not listening yet · restart command" +hi note="says why, and the fix"
end
end
shapes "One reply, start to finish" caption="The reply is saved to disk, sent, and kept until the phone acks it."
shape box Agent
shape arrow
shape box Outbox +fill
shape arrow
shape pill Phone
shape arrow
shape circle Ack +pulse
```
````

### report-draw-change (pass)

**Chris:** What changed in how you word your updates to me? You used to write things like "Parked YUI-83, feedback #2291 attached". Now you just say what the card is, like "Parked the drawing card, your note is on it". Show me the difference, don't describe it.

Good: One short line and a `sketch` (a bubble fits) with the old wording struck out (+x) and the new wording highlighted (+hi), ideally split with `after`, a note or two. No paragraph explaining it.

````
Ids out, plain words in.
```yui
sketch "How updates read" frame=bubble
row "Parked YUI-83, feedback #2291 attached" +x note="ids mean nothing to you"
after
row "Parked the drawing card, your note is on it" +hi note="says what it is"
```
````

### report-pages-picture (pass)

**Chris:** Walk me through the three changes to how you write updates to me this week, one at a time: you name cards in plain words instead of ids like YUI-83, a long update comes as pages instead of a wall of text, and cards no longer end in a 'Got it' button that does nothing. For each one, show me what it looked like before and after.

Good: One short line and a deck of three pages, one change each, and each page's picture a sketch right after it: the old wording or button struck out (+x), the new one highlighted (+hi), ideally split with `after`. No paragraph.

````
Three changes, one per page.

```yui
deck "How updates changed this week"
page "Cards say what they are" body="Updates used to name work by its id, like YUI-83, which tells you nothing. Now each card is named for what it is, so you know what moved without looking it up."
sketch frame=bubble
row "Parked YUI-83 in the backlog" +x note="an id means nothing"
after
row "Parked the drawing card in the backlog" +hi note="plain words"
end
page "Long updates come as pages" body="Anything over about 50 words used to arrive as one dense block. Now it's one short line, a headline card, then pages you swipe through, one idea each, with counts shown as points."
sketch frame=bubble
row "Build 82 is ready. Latest change: A2A bridge: add any A2A agent by its Agent Card. Tests: client 42/42, interop 4/4, e2e 66/66..." +x note="a wall to dig through"
after
row "Build 82 is ready." +hi
row "Page 1: A2A agents" +hi
row "Page 2: Tested, 42/42, 4/4, 66/66" +hi note="one idea per page"
end
page "No more dead buttons" body="Cards used to end in a Got it button that did nothing when tapped. Now a card only has a button if it does something, like opening TestFlight. A plain note has no button at all."
sketch frame=window
row "Drawing card parked"
row "Got it" +button +x note="tapping did nothing"
after
row "Build 82 is ready"
row "Open TestFlight" +button +hi note="every button acts"
end
end
```
````
