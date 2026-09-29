# Channel eval: t2f-new-tiles

Guide v40+69145298 (4288 words), model claude-opus-5-5, 2026-09-29T23:06.

**2/3 passed (67%).**

| category | passed |
|---|---|
| tiles | 2/3 |

| case | result | why |
|---|---|---|
| tiles-board-status | pass |  |
| outcome-invite-declined | pass |  |
| outcome-worker-running | FAIL | text: "now" |

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
row "SEO: 94" note="shipped yesterday"
```
````

### outcome-invite-declined (pass)

**Chris:** I declined the Friday 3 pm team sync invite from Dana like you said. What's the state? (What you just did: declined it on the calendar, no reply message sent to Dana.)

Good: A sketch of the invite row struck out (+x) with note=declined. A few words. If it asks about Dana it is one choose on the same screen, never 'do you want to do what the previous page said'.

````
Declined on your calendar. Dana hasn't gotten a note from you.

```yui
sketch "Team sync" frame=window
row "Team sync, Friday 3 pm" +x note="declined"
row "Note to Dana: not sent" +hi note="waiting on you"
choose "Send Dana a note?" "Short apology"|"Suggest another time"|"No note" +other
```
````

### outcome-worker-running (FAIL)

**Chris:** What's happening on the quote calculator card right now? (What you just looked up: a worker picked it up 4 minutes ago and is editing the calculator labels. Nothing has failed. Expect it done in about 20 minutes.)

Good: A small drawing of the worker at its task: shapes with the busy part +pulse (Worker, arrow, the card), or a one-row sketch or timeline. A few words. No paragraph.

- text: "now"

````
A worker is editing the calculator labels now. Nothing has failed, and it should be done around 9:30.

```yui
shapes "Quote calculator" caption="Picked up 4 minutes ago, about 20 minutes to go."
shape circle Worker +pulse
shape arrow
shape box "Calculator labels"
```
````
