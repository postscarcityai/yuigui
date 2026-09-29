# Channel eval: t2f-new-tiles-r2

Guide v40+66c6c017 (4315 words), model claude-opus-5-5, 2026-09-29T23:06.

**3/3 passed (100%).**

| category | passed |
|---|---|
| tiles | 3/3 |

| case | result | why |
|---|---|---|
| tiles-board-status | pass |  |
| outcome-invite-declined | pass |  |
| outcome-worker-running | pass |  |

## Transcripts

### tiles-board-status (pass)

**Chris:** ok, is the board up to date? (What you just looked up: site lane is clean, nothing open. The new feature lane, the quote calculator, has one card blocked waiting on a design pick from Chris. SEO lane shipped its last audit fixes yesterday and scores 94.)

Good: One sketch, three Label: verdict rows (Site: good, New feature: needs help with +hi, SEO: strong), a line of a few words at most. No sentences, no deck, no 'One question' screen.

````
Mostly. One card needs you.
```yui
sketch "Board" frame=window
row "Site: clean"
row "Quote calculator: blocked" +hi note="needs your design pick"
row "SEO: 94, shipped"
```
````

### outcome-invite-declined (pass)

**Chris:** I declined the Friday 3 pm team sync invite from Dana like you said. What's the state? (What you just did: declined it on the calendar, no reply message sent to Dana.)

Good: A sketch of the invite row struck out (+x) with note=declined. A few words. If it asks about Dana it is one choose on the same screen, never 'do you want to do what the previous page said'.

````
Declined. Dana only sees the calendar decline.

```yui
sketch "Team sync" frame=bubble
row "Team sync, Friday 3 pm" +x note="declined"
row "Note to Dana: none sent" +hi note="your call"
choose "Send Dana a note?" "Draft one for me"|"No, leave it" +other
```
````

### outcome-worker-running (pass)

**Chris:** What's happening on the quote calculator card right now? (What you just looked up: a worker picked it up 4 minutes ago and is editing the calculator labels. Nothing has failed. Expect it done in about 20 minutes.)

Good: A small drawing of the worker at its task: shapes with the busy part +pulse (Worker, arrow, the card), or a one-row sketch or timeline. A few words. No paragraph.

````
```yui
shapes "Quote calculator" caption="Editing labels, started 4 min ago. About 20 min left."
shape circle Worker +pulse
shape arrow
shape box "Calculator labels"
```
````
