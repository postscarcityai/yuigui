# Channel eval: vis2-new1

Guide v44+e7392ae4 (4890 words), model claude-sonnet-5-5, 2026-09-30T17:23.

**6/6 passed (100%).**

| category | passed |
|---|---|
| one-line | 6/6 |

| case | result | why |
|---|---|---|
| vis-status-board | pass |  |
| vis-what-did-you-fix | pass |  |
| vis-you-misread-me | pass |  |
| vis-put-a-card-in | pass |  |
| vis-no-filler-briefing | pass |  |
| vis-three-ideas-one-page | pass |  |

## Transcripts

### vis-status-board (pass)

**Chris:** Is everything up to date? (What you just looked up: the site deploy is green and live. The board has 3 cards running and 2 blocked on a pick from Chris. Build 392 is the newest on TestFlight and his phone is on it. No cron failed today.)

Good: One short line at most, then one `sketch frame=window`: Label: verdict rows (Site: live, Board: 2 need your pick +hi, Build: 392 newest, Crons: clean). No paragraph, no second bubble (VIS-1).

````
Yes, except two picks wait on you.

```yui
sketch "Status" frame=window
row "Site deploy: green, live"
row "Board: 3 running"
row "Blocked cards: 2" +hi note="need your pick"
row "Build 392: newest, on your phone"
row "Crons: none failed today"
```
````

### vis-what-did-you-fix (pass)

**Chris:** What did you fix? (What you just did: the left drawer kept a finished card under Now because one card with badly saved text crashed every refresh. You fixed the crash. A new card makes closed cards leave the drawer within seconds; it is on the board, not built.)

Good: One line, then a before and after `sketch` (drawer showed the done card under Now, now it is gone) with the new card as a `+hi` row. No fix report in prose (VIS-1).

````
Crash fixed; the closed-card cleanup is only on the board.

```yui
sketch "Left drawer" frame=phone before=Then
row "Done card  ·  Now" +x note="stuck"
row "One card's bad text crashed refresh" +x note="every refresh"
after Now
row "Crash fixed, refresh works" +hi note="done"
row "Closed cards leave in seconds" +hi note="new card, not built"
```
````

### vis-you-misread-me (pass)

**Chris:** No. You misread me. I meant the left drawer, not TestFlight. (What you found: the drawer still lists a finished card under Now.)

Good: One short line owning it, then a `sketch` of the left drawer with the stale row struck out. No apology paragraph, no restating what he said (VIS-1).

````
Left drawer, not TestFlight. Found the bug.

```yui
sketch "Left drawer" frame=phone before=Now
row "Now: finished card still listed" +x note="stuck"
after Should be
row "Finished card moves to Done" +hi note="leaves Now"
row "Now: open cards only" +hi note="nothing finished"
```
````

### vis-put-a-card-in (pass)

**Chris:** Put a card in for a daily morning release instead of ad hoc builds. (What you just did: created the card, parked in the backlog under the release lane, first in the queue. It has not been started.)

Good: One line: it is on the board, first in the queue. Then one drawing of the card in its place (a `sketch` of the queue with the new row `+hi`, or a `timeline`). No paragraph about what the card will do (VIS-1).

````
Card is in your drawer backlog, not started. I have no board tool here, so the release lane and first-in-queue order aren't set.

```yui
menu backlog@daily-release "Daily morning release" sub="not started"
sketch "Release" frame=bubble before=Now
row "Ad hoc builds" +x note="whenever"
after Planned
row "Daily morning release" +hi note="backlog, not started"
```
````

### vis-no-filler-briefing (pass)

**Chris:** What shipped overnight? (What you just looked up: build 392 reached TestFlight at 6:12 am with the drawer fix and the one-build-a-day guard. The site deploy of the progress page is live. Two cards are still blocked on a pick from Chris: the tuner and the onboarding copy.)

Good: A line of nouns and verdicts (no so, now, however, intro), then one sketch: Build 392: on TestFlight, Drawer fix: shipped, Progress page: live, Tuner and onboarding copy: need your pick +hi. No 'a few things', no paragraph (VIS-1, caveman).

````
Four things shipped; two wait on you.

```yui
sketch "Overnight" frame=window
row "Build 392: on TestFlight" note="6:12 am"
row "Drawer fix: in 392"
row "One-build-a-day guard: in 392"
row "Progress page: live"
row "Tuner: needs your pick" +hi note="blocked"
row "Onboarding copy: needs your pick" +hi note="blocked"
```
````

### vis-three-ideas-one-page (pass)

**Chris:** How will you stop the text slides? (What you did: three changes. The plugin rewrites any reply over 30 words before it sends. The channel guide now says one line and a drawing. The eval fails a reply with more than one text bubble.)

Good: One line, then ONE drawing that holds all three ideas (a sketch with three rows, or a shapes chain of three), not three pages and not a paragraph each. No deck of one page per idea (VIS-1, Chris: up to 3 ideas on a card as long as we show them).

````
I write one line and a drawing, and the plugin and eval catch any slip.

```yui
sketch "Stopping text slides" frame=window
row "Guide: one line, then a drawing" +hi note="I follow it"
row "Plugin: over 30 words, rewritten" note="safety net"
row "Eval: 2+ bubbles, fails" note="catches regressions"
```
````
