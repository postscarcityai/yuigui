# Channel eval: v17-values-link

Guide v17+fc4f3447 (1684 words), model claude-opus-5-5, 2026-09-25T18:04.

**2/2 passed (100%).**

| category | passed |
|---|---|
| report | 2/2 |

| case | result | why |
|---|---|---|
| report-card-done | pass |  |
| report-long-walkthrough | pass |  |

## Transcripts

### report-card-done (pass)

**Chris:** The worker just finished card INT-18 on the board. Its handoff summary: "A2A bridge: add any A2A agent to Yui by its Agent Card. node adapters/a2a/yui-a2a.ts pair <code> --card <url>, then run; add --card <url> puts more agents on the same machine. Runtime-neutral TypeScript client (src/a2a.ts + src/sse.ts, fetch and an SSE parser only, so the hosted step runs the same code in a Durable Object): A2A 1.0 SendMessage / SendStreamingMessage / SubscribeToTask / GetTask / CancelTask and 0.3 message/send, message/stream, tasks/resubscribe, tasks/get, one version-free shape for callers. The bridge keeps the relay's rules (delivered on pickup, handled after the answer, outbox on disk, one turn at a time per agent). Tests: client.test.ts 42/42; sdk_interop.test.ts 4/4 against the official a2a-sdk servers (1.1.5 and 0.3.26); a2a_e2e.py 66/66 live on throwaway accounts (kill -9 mid-task resumes the same task and answers once) plus the phone run 6/6 on the iPhone 18 Pro sim. No app binary change (INT-18)" Tell me what shipped.

Good: One short line, a card with the headline (A2A agents can join Yui), and the detail as a deck of short pages (what it does, how to add one, the test counts as points). No paragraph relaying the summary.

````
INT-18 shipped: any A2A agent can join Yui by its Agent Card.

```yui
card "INT-18: A2A bridge" body="Pair any A2A agent by its Agent Card. No app binary change."
deck "What shipped in INT-18" +inline
page "Adding an agent" body="Pair with node adapters/a2a/yui-a2a.ts pair <code> --card <url>, then run. Each extra --card <url> adds another agent on the same machine."
page "One client, both versions" body="The client speaks A2A 1.0 and 0.3 (send, stream, resubscribe, get, cancel) and gives callers one version-free shape. It uses only fetch and an SSE parser, so the hosted version can run the same code in a Durable Object."
page "Relay rules kept" points="Delivered on pickup"|"Handled after the answer"|"Outbox on disk"|"One turn at a time per agent"
page "Tested" points="Client 42/42"|"SDK interop 4/4 (a2a-sdk 1.1.5, 0.3.26)"|"Live end to end 66/66"|"Phone run 6/6, iPhone 18 Pro sim"
page "Crash recovery" body="In the live run, a kill -9 mid-task resumed the same task and answered once. There were no duplicates and no lost turns."
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
page "Exactly-once, both ways" body="Replies now travel with acks in both directions. The phone confirms what it got and the agent confirms what it got, so a message lands once: no drops on a flaky connection, no duplicates on retry."
page "Reply outbox on disk" body="Outgoing replies are written to an outbox on disk before sending and cleared only once acked. A crash, restart or dropped connection no longer loses a reply; it goes out when the link comes back."
page "Presence per agent" points="Online: connected and listening"|"Asleep: reachable, not active"|"Offline: not reachable"|"Shown separately for each agent"
page "Pushes skip a watching phone" body="When the phone already has the thread open, no push notification is sent for new messages there. The message just appears, so there is no buzz for something already on screen."
page "Mute an agent" body="Any agent can be muted. Its messages still arrive in its thread, but it stops interrupting with notifications."
page "Not listening yet" body="A paired agent whose gateway never started used to look silent or broken. It now shows 'not listening yet' along with the exact command to restart the gateway, so the fix is one copy-paste away."
end
```
````
