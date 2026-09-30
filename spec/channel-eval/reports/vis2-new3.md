# Channel eval: vis2-new3

Guide v44+e7392ae4 (4890 words), model claude-sonnet-5-5, 2026-09-30T17:24.

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
Almost. Two cards wait on you.

```yui
sketch "Status" frame=window
row "Site deploy: green, live"
row "Board: 3 running"
row "Blocked: 2 need your pick" +hi note="waiting on you"
row "TestFlight: build 392, newest" note="your phone is on it"
row "Cron: none failed today"
```
````

### vis-what-did-you-fix (pass)

**Chris:** What did you fix? (What you just did: the left drawer kept a finished card under Now because one card with badly saved text crashed every refresh. You fixed the crash. A new card makes closed cards leave the drawer within seconds; it is on the board, not built.)

Good: One line, then a before and after `sketch` (drawer showed the done card under Now, now it is gone) with the new card as a `+hi` row. No fix report in prose (VIS-1).

````
Fixed the refresh crash. The finished card no longer sticks under Now.

```yui
sketch "Left drawer" frame=phone before=Then
row "Done card under Now" +x note="stuck"
row "Refresh crashed" +x note="one card, bad text"
after Now
row "Refresh works" +hi note="crash fixed"
row "Closed cards leave in seconds" +hi note="on board, not built"
```
````

### vis-you-misread-me (pass)

**Chris:** No. You misread me. I meant the left drawer, not TestFlight. (What you found: the drawer still lists a finished card under Now.)

Good: One short line owning it, then a `sketch` of the left drawer with the stale row struck out. No apology paragraph, no restating what he said (VIS-1).

````
Sorry, I read that as TestFlight. The bug is the drawer listing a finished card under Now.

```yui
sketch "Left drawer" frame=phone before=Now
row "Done card  ·  Now" +x note="stuck"
after Fixed
row "Done card leaves Now" +hi note="moves to Done"
row "Now: only open cards" +hi note="the rule"
```
````

### vis-put-a-card-in (pass)

**Chris:** Put a card in for a daily morning release instead of ad hoc builds. (What you just did: created the card, parked in the backlog under the release lane, first in the queue. It has not been started.)

Good: One line: it is on the board, first in the queue. Then one drawing of the card in its place (a `sketch` of the queue with the new row `+hi`, or a `timeline`). No paragraph about what the card will do (VIS-1).

````
Card parked in the backlog, first in the release lane queue.

```yui
menu backlog@daily-release "Daily morning release" sub="release lane, first in queue, not started"
sketch "Release lane" frame=window
row "Ad hoc builds" +x note="replaced"
row "Daily morning release" +hi note="first in queue"
row "Status: not started"
```
````

### vis-no-filler-briefing (pass)

**Chris:** What shipped overnight? (What you just looked up: build 392 reached TestFlight at 6:12 am with the drawer fix and the one-build-a-day guard. The site deploy of the progress page is live. Two cards are still blocked on a pick from Chris: the tuner and the onboarding copy.)

Good: A line of nouns and verdicts (no so, now, however, intro), then one sketch: Build 392: on TestFlight, Drawer fix: shipped, Progress page: live, Tuner and onboarding copy: need your pick +hi. No 'a few things', no paragraph (VIS-1, caveman).

````
Two shipped, two need your pick.

```yui
sketch "Overnight" frame=window
row "Build 392: on TestFlight" note="6:12 am"
row "Drawer fix: in" note="build 392"
row "One-build-a-day guard: in" note="build 392"
row "Progress page: live" note="site deploy"
row "Tuner: blocked" +hi note="needs your pick"
row "Onboarding copy: blocked" +hi note="needs your pick"
```
````

### vis-three-ideas-one-page (pass)

**Chris:** How will you stop the text slides? (What you did: three changes. The plugin rewrites any reply over 30 words before it sends. The channel guide now says one line and a drawing. The eval fails a reply with more than one text bubble.)

Good: One line, then ONE drawing that holds all three ideas (a sketch with three rows, or a shapes chain of three), not three pages and not a paragraph each. No deck of one page per idea (VIS-1, Chris: up to 3 ideas on a card as long as we show them).

````
Write one line, then draw the rest. I count bubbles before sending, so the plugin never has to rewrite me.

```yui
sketch "Stopping text slides" frame=window
row "Me: one line, 30 words max" +hi note="write time"
row "Me: rest as rows, never prose" +hi note="write time"
row "Guide: says it" note="rule"
row "Plugin: rewrites overflow" note="backstop"
row "Eval: fails 2+ bubbles" note="catches misses"
```
````
