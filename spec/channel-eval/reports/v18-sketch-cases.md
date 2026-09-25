# Channel eval: v18-sketch-cases

Guide v18+72cc8da2 (1773 words), model claude-opus-5-5, 2026-09-25T18:19.

**4/4 passed (100%).**

| category | passed |
|---|---|
| report | 4/4 |

| case | result | why |
|---|---|---|
| report-card-done | pass |  |
| report-long-walkthrough | pass |  |
| report-draw-change | pass |  |
| draw-screen-fix | pass |  |

## Transcripts

### report-card-done (pass)

**Chris:** The worker just finished card INT-18 on the board. Its handoff summary: "A2A bridge: add any A2A agent to Yui by its Agent Card. node adapters/a2a/yui-a2a.ts pair <code> --card <url>, then run; add --card <url> puts more agents on the same machine. Runtime-neutral TypeScript client (src/a2a.ts + src/sse.ts, fetch and an SSE parser only, so the hosted step runs the same code in a Durable Object): A2A 1.0 SendMessage / SendStreamingMessage / SubscribeToTask / GetTask / CancelTask and 0.3 message/send, message/stream, tasks/resubscribe, tasks/get, one version-free shape for callers. The bridge keeps the relay's rules (delivered on pickup, handled after the answer, outbox on disk, one turn at a time per agent). Tests: client.test.ts 42/42; sdk_interop.test.ts 4/4 against the official a2a-sdk servers (1.1.5 and 0.3.26); a2a_e2e.py 66/66 live on throwaway accounts (kill -9 mid-task resumes the same task and answers once) plus the phone run 6/6 on the iPhone 18 Pro sim. No app binary change (INT-18)" Tell me what shipped.

Good: One short line, a card with the headline (A2A agents can join Yui), and the detail as a deck of short pages (what it does, how to add one, the test counts as points). No paragraph relaying the summary.

````
The A2A bridge shipped: any A2A agent can now join Yui through its Agent Card, with no app update needed.

```yui
card "A2A bridge" body="Add any A2A agent to Yui by its Agent Card. No app update needed."
deck "What shipped" +inline
page "Adding an agent" body="Pair the bridge with a code and the agent's card URL, then run it. Each extra --card URL adds another agent to the same machine. Agents built with ADK, LangGraph, CrewAI or any other A2A framework can join."
page "One client, two versions" body="A small TypeScript client speaks both A2A 1.0 and 0.3 (send, stream, resubscribe, get, cancel) and hands callers one shape either way. It uses only fetch and an SSE parser, so the hosted version can run the same code."
page "Same delivery rules" points="Delivered when picked up"|"Marked handled only after the answer"|"Outbox kept on disk"|"One turn at a time per agent"
page "Tested" points="Client 42/42"|"Official a2a-sdk servers 4/4 (1.1.5 and 0.3.26)"|"Live end to end 66/66"|"Phone run 6/6 on iPhone 18 Pro sim"
page "Survives a crash" body="Killing the bridge mid-task and restarting it resumes the same task, and the agent answers once, not twice."
end
```
````

### report-long-walkthrough (pass)

**Chris:** Walk me through everything that changed in how Yui delivers messages this week: replies are exactly-once both ways with acks, a reply outbox on disk, presence reads online/asleep/offline per agent, pushes skip a phone already watching the thread, agents can be muted, and a paired agent whose gateway never started now says 'not listening yet' with the restart command.

Good: A deck (or plan) of short pages, one change per page, under one short chat line. Not a long bulleted or prose message.

````
Six delivery changes this week.

```yui
card "Yui delivery, this week" body="Exactly-once replies, a disk outbox, per-agent presence, smarter pushes, mute, and a clear 'not listening yet' state"
deck "What changed in delivery" +inline
page "Exactly-once, both ways" body="Every message in either direction is acknowledged by the other side. Nothing is dropped and nothing arrives twice, even across reconnects."
page "Reply outbox on disk" body="Agent replies are written to disk before sending and cleared only when acked. A crash or network drop no longer loses a reply; it goes out once the link is back."
page "Presence per agent" points="Online: gateway connected and answering"|"Asleep: paired but idle"|"Offline: unreachable"
page "Quieter pushes" body="If your phone already has the thread open, no push notification is sent for it. Pushes only arrive when you aren't watching."
page "Mute an agent" body="Any agent can be muted. Its messages still arrive in the thread; they just stop notifying you."
page "Not listening yet" body="A paired agent whose gateway never started used to look silent. It now says 'not listening yet' and shows the exact command to restart it."
end
sketch "Paired agent, gateway never started" frame=bubble
row "Message sent… (no reply, no status)" +x note="looked broken"
after
row "Not listening yet" +hi
row "Restart command shown" +button note="one step to fix"
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

### draw-screen-fix (pass)

**Chris:** The build-ready screen shows the headline, two lines of notes, then a Got it button and an Install button. Which of those should go, and why? Show me on the screen itself.

Good: A `sketch` of the screen (frame=phone) with the headline and notes as rows, Got it as a +button row struck out (+x) with a short note (it does nothing), Install as a +button row highlighted. At most a line of chat.

````
**Got it** goes. It only acknowledges and does nothing. **Install** stays because it opens TestFlight. A card with nothing left to act on would have no button at all.

```yui
sketch "Build ready" frame=bubble
row "Build 82 is ready"
row "Add any A2A agent by its Agent Card"
row "Tested: client 42/42, e2e 66/66"
row "Got it" +button +x note="acknowledges, does nothing"
row "Install" +button
after
row "Build 82 is ready"
row "Add any A2A agent by its Agent Card"
row "Tested: client 42/42, e2e 66/66"
row "Install" +button +hi note="the one action that matters"
```
````
