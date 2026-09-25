# Channel eval: v15-report-cases

Guide v15+de4291f8 (1445 words), model claude-opus-5-5, 2026-09-25T12:56.

**1/2 passed (50%).**

| category | passed |
|---|---|
| report | 1/2 |

| case | result | why |
|---|---|---|
| report-card-done | FAIL | need: none of [deck plan] |
| report-long-walkthrough | pass |  |

## Transcripts

### report-card-done (FAIL)

**Chris:** The worker just finished card INT-18 on the board. Its handoff summary: "A2A bridge: add any A2A agent to Yui by its Agent Card. node adapters/a2a/yui-a2a.ts pair <code> --card <url>, then run; add --card <url> puts more agents on the same machine. Runtime-neutral TypeScript client (src/a2a.ts + src/sse.ts, fetch and an SSE parser only, so the hosted step runs the same code in a Durable Object): A2A 1.0 SendMessage / SendStreamingMessage / SubscribeToTask / GetTask / CancelTask and 0.3 message/send, message/stream, tasks/resubscribe, tasks/get, one version-free shape for callers. The bridge keeps the relay's rules (delivered on pickup, handled after the answer, outbox on disk, one turn at a time per agent). Tests: client.test.ts 42/42; sdk_interop.test.ts 4/4 against the official a2a-sdk servers (1.1.5 and 0.3.26); a2a_e2e.py 66/66 live on throwaway accounts (kill -9 mid-task resumes the same task and answers once) plus the phone run 6/6 on the iPhone 18 Pro sim. No app binary change (INT-18)" Tell me what shipped.

Good: One short line, a card with the headline (A2A agents can join Yui), and the detail as a deck of short pages (what it does, how to add one, the test counts as points). No paragraph relaying the summary.

- need: none of [deck plan]

````
INT-18 shipped, per the worker's report: any A2A agent can now join Yui through its Agent Card. No app update is needed.

```yui
list "What shipped" "Pair any A2A agent: yui-a2a.ts pair <code> --card <url>, then run" "Several agents on one machine: add --card <url>" "One client for A2A 1.0 and 0.3" "Same client runs in the hosted Durable Object" "Relay rules kept: disk outbox, one turn per agent"
table Tests Suite|Result "Client unit|42/42" "Official a2a-sdk 1.1.5 + 0.3.26|4/4" "Live e2e (kill -9 resumes, answers once)|66/66" "iPhone 18 Pro sim|6/6"
```
````

### report-long-walkthrough (pass)

**Chris:** Walk me through everything that changed in how Yui delivers messages this week: replies are exactly-once both ways with acks, a reply outbox on disk, presence reads online/asleep/offline per agent, pushes skip a phone already watching the thread, agents can be muted, and a paired agent whose gateway never started now says 'not listening yet' with the restart command.

Good: A deck (or plan) of short pages, one change per page, under one short chat line. Not a long bulleted or prose message.

````
Six delivery changes this week, one per page.

```yui
deck "Yui delivery: this week"
page "Exactly-once replies, backed by disk" body="Replies now go exactly once in both directions. Each side acks what it received, so nothing is lost or doubled on a retry. Outgoing replies sit in an outbox on disk until acked, so they survive a crash or restart."
page "Presence per agent" body="Each agent now shows its own state: online, asleep or offline. You can see which agent is reachable before you message it."
page "Smarter pushes" body="If your phone already has the thread open, no push fires. You only get buzzed for messages you aren't already watching."
page "Mute an agent" body="Any agent can be muted. It keeps working, it just stops pinging you."
page "'Not listening yet'" body="A paired agent whose gateway never started used to look silently broken. It now says 'not listening yet' and shows the exact restart command to bring it up."
```
````
