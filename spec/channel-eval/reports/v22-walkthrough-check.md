# Channel eval: y85-v22-walk

Guide v22+d24d1f04 (2236 words), model claude-opus-5-5, 2026-09-26T08:36.

**0/1 passed (0%).**

| category | passed |
|---|---|
| report | 0/1 |

| case | result | why |
|---|---|---|
| report-long-walkthrough | FAIL | preset: shapes not in [card deck page stat list plan say image timeline done now next ask choose pick table sketch row after]; preset: shape not in [card deck page stat list plan say image timeline done now next ask choose pick table sketch row after] |

## Transcripts

### report-long-walkthrough (FAIL)

**Chris:** Walk me through everything that changed in how Yui delivers messages this week: replies are exactly-once both ways with acks, a reply outbox on disk, presence reads online/asleep/offline per agent, pushes skip a phone already watching the thread, agents can be muted, and a paired agent whose gateway never started now says 'not listening yet' with the restart command.

Good: A deck (or plan) of short pages, one change per page, under one short chat line. Not a long bulleted or prose message.

- preset: shapes not in [card deck page stat list plan say image timeline done now next ask choose pick table sketch row after]
- preset: shape not in [card deck page stat list plan say image timeline done now next ask choose pick table sketch row after]

````
Six delivery changes this week, one page each.

```yui
card "Yui delivery, this week" body="Every reply lands once, survives a restart, and only buzzes you when it should."
shapes "How a reply travels now" caption="The agent writes to its outbox, the phone acks, and only then is the reply cleared."
shape box Agent
shape arrow
shape box Outbox +fill
shape arrow
shape circle Phone +grow
shape arrow
shape pill Ack +pulse tone=mint
deck "What changed in delivery" +inline
page "Exactly once, both ways" body="Every message carries an id and is acknowledged on arrival, from you to the agent and back. Retries reuse that id, so a flaky connection resends without doubling a reply or dropping one."
page "Reply outbox on disk" body="Replies are written to disk before they are sent and stay there until the phone acks. A gateway crash or restart no longer loses what the agent already wrote; the outbox drains when it comes back."
page "Presence per agent" points="Online: listening now"|"Asleep: will pick up on wake"|"Offline: not reachable"
page "Quieter pushes" body="If the phone already has that thread open, the push is skipped. The message just appears on screen, with no buzz for something already being read."
page "Mute an agent" body="Any agent can be muted. Its messages still arrive and wait in the thread, but they stop pushing notifications to the phone."
page "Not listening yet" body="A paired agent whose gateway never started used to look silent. It now shows 'not listening yet' with the exact restart command, so the fix is one copy and paste."
end
```
````
