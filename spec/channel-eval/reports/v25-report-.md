# Channel eval: v25-report-

Guide v25+f1a8a28f (2423 words), model claude-opus-5-5, 2026-09-26T14:38.

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
The A2A bridge is done: any A2A agent can join Yui now.

```yui
card "A2A bridge" body="Add any A2A agent to Yui by its Agent Card. No app update needed."
deck "What shipped" +inline
page "Adding an agent" body="Pair once with the bridge and point it at the agent's card. Adding another card puts more agents on the same machine, all under one bridge."
page "Speaks both versions" body="The client handles A2A 1.0 and the older 0.3. Callers see one shape, whichever version the agent speaks. Sending, streaming, resuming, checking and cancelling tasks all work."
page "Same rules as the relay" points="Delivered on pickup, handled after the answer"|"Outbox kept on disk"|"One turn at a time per agent"
page "Ready for hosting" body="The client uses only fetch and a small stream parser. The hosted version can run the same code in the cloud with no rewrite."
page "Tested" points="Client 42/42"|"Official A2A servers, 1.1.5 and 0.3.26: 4/4"|"Live end to end 66/66"|"Killed mid-task: resumes and answers once"|"Phone run on the simulator 6/6"
end
```
````

### report-long-walkthrough (pass)

**Chris:** Walk me through everything that changed in how Yui delivers messages this week: replies are exactly-once both ways with acks, a reply outbox on disk, presence reads online/asleep/offline per agent, pushes skip a phone already watching the thread, agents can be muted, and a paired agent whose gateway never started now says 'not listening yet' with the restart command.

Good: A deck (or plan) of short pages, one change per page, under one short chat line. Not a long bulleted or prose message.

````
Six delivery changes this week.

```yui
card "Yui delivery, this week" body="Exactly-once replies, a disk outbox, per-agent presence, smarter pushes, mute, and a clear message when an agent isn't running"
shapes "How a reply travels now" caption="The agent writes the reply to disk, sends it, and clears it only when the phone acks."
shape box Agent
shape arrow
shape pill Outbox +fill
shape arrow
shape circle Phone +pulse
shape arrow
shape dot Ack tone=mint +grow
deck "What changed" +inline
page "Exactly-once, both ways" body="Every message, yours and the agent's, is acknowledged on arrival. Anything not acked is resent, and a repeat is recognized and dropped, so nothing is lost or doubled."
page "Reply outbox on disk" body="Agent replies are written to disk before sending. A crash, restart or dropped connection no longer loses a reply; it goes out when the link returns."
page "Presence per agent" points="Online: connected and listening"|"Asleep: reachable, not active"|"Offline: not connected"
page "Quieter pushes" body="If the phone is already open on that thread, no push is sent. Notifications arrive only when you'd otherwise miss the message."
page "Mute an agent" body="Any agent can be muted. Its messages still arrive in the thread, without pushes."
page "Not listening yet" body="A paired agent whose gateway never started now says so plainly, with the command to restart it, instead of leaving messages unanswered."
sketch frame=bubble
row "Not listening yet" +hi
row "Restart command shown here" note="copy, run, done"
end
end
```
````

### report-draw-change (pass)

**Chris:** What changed in how you word your updates to me? You used to write things like "Parked YUI-83, feedback #2291 attached". Now you just say what the card is, like "Parked the drawing card, your note is on it". Show me the difference, don't describe it.

Good: One short line and a `sketch` (a bubble fits) with the old wording struck out (+x) and the new wording highlighted (+hi), ideally split with `after`, a note or two. No paragraph explaining it.

````
Ids became plain words.

```yui
sketch "How updates read" frame=bubble
row "Parked YUI-83, feedback #2291 attached" +x note="ids you'd have to look up"
after
row "Parked the drawing card, your note is on it" +hi note="says what it is"
```
````

### report-pages-picture (pass)

**Chris:** Walk me through the three changes to how you write updates to me this week, one at a time: you name cards in plain words instead of ids like YUI-83, a long update comes as pages instead of a wall of text, and cards no longer end in a 'Got it' button that does nothing. For each one, show me what it looked like before and after.

Good: One short line and a deck of three pages, one change each, and each page's picture a sketch right after it: the old wording or button struck out (+x), the new one highlighted (+hi), ideally split with `after`. No paragraph.

````
Three changes, one page each.

```yui
deck "How updates changed this week"
page "1. Plain words, not ids" body="Cards used to be named by tracker ids like YUI-83, which meant nothing without looking them up. Now each card says what it is, so an update reads on its own."
sketch "Card names" frame=bubble
row "Parked YUI-83 in the backlog" +x note="an id means nothing"
after
row "Parked the drawing card in the backlog" +hi note="says what it is"
end
page "2. Pages, not walls" body="Long updates used to arrive as one dense bubble with every detail packed in. Now there is one short line, a card with the headline, and pages you swipe through, one idea each."
sketch "A build report" frame=phone
row "Build 82 is ready. Latest change: A2A bridge: add any A2A agent by its Agent Card. node yui-a2a.ts pair ... Tests: client 42/42, interop 4/4, e2e 66/66 ..." +x note="one wall"
after
row "Build 82 is ready." +hi
row "Card: Add any A2A agent by its Agent Card" +hi
row "Page: A2A agents" note="one idea per page"
row "Page: Tested, 42/42, 4/4, 66/66"
end
page "3. No dead buttons" body="Cards used to end in a Got it button that sent nothing and did nothing. Now a card only has a button when there is something to do, like Open TestFlight. A plain note stays a note."
sketch "An update card" frame=phone
row "Calendar synced for next week"
row "Got it" +button +x note="does nothing"
after
row "Calendar synced for next week" +hi note="no button needed"
row "Build 82 ready"
row "Open TestFlight" +button +hi note="a real action"
end
end
```
````
