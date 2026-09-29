# Channel eval: t2f-old-tiles

Guide v39+2c7083b1 (4041 words), model claude-opus-5-5, 2026-09-29T23:06.

**0/3 passed (0%).**

| category | passed |
|---|---|
| tiles | 0/3 |

| case | result | why |
|---|---|---|
| tiles-board-status | FAIL | tiles: a verdict over three words :: row "Quote calculator: blocked on your design pick" +hi note="waiting on you"; tiles: a verdict over three words :: row "SEO: last audit fixes shipped yesterday, scores 94" |
| outcome-invite-declined | FAIL | preset: list not in [sketch row after say choose ask card]; need: none of [sketch]; words: 18 > 15; struck: nothing struck out for the outcome |
| outcome-worker-running | FAIL | screen: no ```yui block; need: none of [shapes sketch timeline]; words: 25 > 20; text: "now"; worker: no pulsing shape or sketch of the worker at work |

## Transcripts

### tiles-board-status (FAIL)

**Chris:** ok, is the board up to date? (What you just looked up: site lane is clean, nothing open. The new feature lane, the quote calculator, has one card blocked waiting on a design pick from Chris. SEO lane shipped its last audit fixes yesterday and scores 94.)

Good: One sketch, three Label: verdict rows (Site: good, New feature: needs help with +hi, SEO: strong), a line of a few words at most. No sentences, no deck, no 'One question' screen.

- tiles: a verdict over three words :: row "Quote calculator: blocked on your design pick" +hi note="waiting on you"
- tiles: a verdict over three words :: row "SEO: last audit fixes shipped yesterday, scores 94"

````
Yes, it's current. One card is waiting on you.
```yui
sketch "The board" frame=bubble
row "Site: clean, nothing open"
row "Quote calculator: blocked on your design pick" +hi note="waiting on you"
row "SEO: last audit fixes shipped yesterday, scores 94"
ask "Pick the calculator design now?" "Show me the options"|Later
menu review@calc "Quote calculator design pick" sub="blocking the lane"
```
````

### outcome-invite-declined (FAIL)

**Chris:** I declined the Friday 3 pm team sync invite from Dana like you said. What's the state? (What you just did: declined it on the calendar, no reply message sent to Dana.)

Good: A sketch of the invite row struck out (+x) with note=declined. A few words. If it asks about Dana it is one choose on the same screen, never 'do you want to do what the previous page said'.

- preset: list not in [sketch row after say choose ask card]
- need: none of [sketch]
- words: 18 > 15
- struck: nothing struck out for the outcome

````
Declined on your calendar. Dana gets the standard decline notice, but no note from you went with it.

```yui
list "Friday team sync" "Invite: declined" "Calendar: 3 pm is free" "Note to Dana: not sent"
choose "Send Dana a note?" "Short apology"|"Ask for notes after"|"Propose another time"|"Leave it" +other
```
````

### outcome-worker-running (FAIL)

**Chris:** What's happening on the quote calculator card right now? (What you just looked up: a worker picked it up 4 minutes ago and is editing the calculator labels. Nothing has failed. Expect it done in about 20 minutes.)

Good: A small drawing of the worker at its task: shapes with the busy part +pulse (Worker, arrow, the card), or a one-row sketch or timeline. A few words. No paragraph.

- screen: no ```yui block
- need: none of [shapes sketch timeline]
- words: 25 > 20
- text: "now"
- worker: no pulsing shape or sketch of the worker at work

````
A worker picked it up 4 minutes ago and is editing the calculator labels now. Nothing has failed, and it should be done around 9:30.
````
