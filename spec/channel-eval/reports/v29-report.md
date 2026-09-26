# Channel eval: v29-report

Guide v29+2f4f324b (2647 words), model claude-opus-5-5, 2026-09-26T21:50.

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
The A2A bridge shipped: any A2A agent can now join Yui by its Agent Card, with no app update needed.

```yui
card "A2A bridge" body="Add any A2A agent to Yui by its Agent Card. Works on your current build."
deck "What shipped" +inline
page "Any A2A agent joins" body="Agents built on A2A 1.0 or 0.3 can talk in Yui now. One client covers both versions, and the hosted service runs the same code, so it will behave the same there."
page "Adding one" points="Pair: node adapters/a2a/yui-a2a.ts pair <code> --card <url>"|"Then: run"|"More agents on the same machine: add --card <url>"
page "Survives crashes" body="The bridge follows the relay's rules: one turn at a time per agent, with an outbox on disk. When the bridge was killed mid-task, it resumed the same task and answered once."
page "Tested" points="Client 42/42"|"Official A2A SDK servers 4/4 (1.1.5 and 0.3.26)"|"Live end to end 66/66"|"Phone sim 6/6"
end
```
````

### report-long-walkthrough (pass)

**Chris:** Walk me through everything that changed in how Yui delivers messages this week: replies are exactly-once both ways with acks, a reply outbox on disk, presence reads online/asleep/offline per agent, pushes skip a phone already watching the thread, agents can be muted, and a paired agent whose gateway never started now says 'not listening yet' with the restart command.

Good: A deck (or plan) of short pages, one change per page, under one short chat line. Not a long bulleted or prose message.

````
Six delivery changes this week: replies land exactly once, presence is per agent, and notifications are quieter.

```yui
card "Yui delivery, this week" body="Exactly-once replies, per-agent presence, smarter pushes, mute, and a clear 'not listening yet'"
deck "What changed in delivery" +inline
page "Replies arrive exactly once" body="Every reply is acked in both directions, so nothing is lost and nothing shows twice. Outgoing replies wait in an outbox on disk until acked, so a crash or restart no longer drops them."
shapes caption="A reply sits in the outbox until the other side acks it."
shape box Outbox +fill
shape arrow
shape circle Phone +grow
shape arrow
shape pill Ack +pulse tone=mint
page "Presence per agent" points="Online: listening now"|"Asleep: reachable, will pick up"|"Offline: not reachable"|"Shown for each agent, not the app as a whole"
page "Fewer, better pushes" points="No push when your phone is already watching that thread"|"Any agent can be muted"
page "Not listening yet" body="A paired agent whose gateway never started now says so plainly, with the restart command right there, instead of looking silently broken."
sketch frame=bubble
row "Not listening yet. Restart its gateway:" +hi note="says what's wrong and the fix"
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
sketch "How updates read" frame=bubble
row "Parked YUI-83, feedback #2291 attached" +x note="two ids you'd have to look up"
after
row "Parked the drawing card, your note is on it" +hi note="says what it is"
```
````

### report-pages-picture (pass)

**Chris:** Walk me through the three changes to how you write updates to me this week, one at a time: you name cards in plain words instead of ids like YUI-83, a long update comes as pages instead of a wall of text, and cards no longer end in a 'Got it' button that does nothing. For each one, show me what it looked like before and after.

Good: One short line and a deck of three pages, one change each, and each page's picture a sketch right after it: the old wording or button struck out (+x), the new one highlighted (+hi), ideally split with `after`. No paragraph.

````
Three changes this week, one per page.

```yui
deck "How updates read now" +inline
page "Cards in plain words" body="Cards are named for what they are, not their tracker id. An id like YUI-83 means nothing at a glance, so the update says what the card holds."
sketch frame=bubble
row "Parked YUI-83 in the backlog" +x note="an id means nothing"
after
row "Parked the drawing card in the backlog" +hi note="plain words"
end
page "Long updates come as pages" body="A long update opens with one line, then short pages you can swipe through, each with a title and one idea. No more scrolling a block of text to find the point."
sketch frame=bubble
row "Build 82 is ready. Latest change: A2A bridge, add any A2A agent by its Agent Card. Tests: client 42/42, interop 4/4, e2e 66/66..." +x note="wall of text"
after
row "Build 82 is ready." +hi note="one line first"
row "Pages: A2A agents · Tested" +hi note="swipe for detail"
end
page "No dead buttons" body="A card only gets a button when the button does something: open a link, start a workout, book a slot. A plain note stays a note, with nothing to tap."
sketch frame=bubble
row "Dentist moved to Tue 3 pm"
row "Got it" +button +x note="does nothing"
after
row "Dentist moved to Tue 3 pm" +hi note="just the news"
row "Add to calendar" +button +hi note="only if it acts"
end
end
```
````
