# Channel eval: vis2-old1

Guide v43+22b9cd60 (4614 words), model claude-sonnet-5-5, 2026-09-30T17:24.

**5/6 passed (83%).**

| category | passed |
|---|---|
| one-line | 5/6 |

| case | result | why |
|---|---|---|
| vis-status-board | pass |  |
| vis-what-did-you-fix | pass |  |
| vis-you-misread-me | pass |  |
| vis-put-a-card-in | FAIL | one line: no drawing (sketch, shapes, timeline, map, chart or stat) carries the answer |
| vis-no-filler-briefing | pass |  |
| vis-three-ideas-one-page | pass |  |

## Transcripts

### vis-status-board (pass)

**Chris:** Is everything up to date? (What you just looked up: the site deploy is green and live. The board has 3 cards running and 2 blocked on a pick from Chris. Build 392 is the newest on TestFlight and his phone is on it. No cron failed today.)

Good: One short line at most, then one `sketch frame=window`: Label: verdict rows (Site: live, Board: 2 need your pick +hi, Build: 392 newest, Crons: clean). No paragraph, no second bubble (VIS-1).

````
Mostly. Two cards need you.

```yui
sketch "Status" frame=window
row "Site deploy: green, live"
row "Board: 3 running" 
row "Blocked cards: 2 need your pick" +hi note="waiting on you"
row "TestFlight: build 392, you're on it"
row "Crons: none failed today"
```
````

### vis-what-did-you-fix (pass)

**Chris:** What did you fix? (What you just did: the left drawer kept a finished card under Now because one card with badly saved text crashed every refresh. You fixed the crash. A new card makes closed cards leave the drawer within seconds; it is on the board, not built.)

Good: One line, then a before and after `sketch` (drawer showed the done card under Now, now it is gone) with the new card as a `+hi` row. No fix report in prose (VIS-1).

````
Fixed the refresh crash that kept a finished card stuck under Now.

```yui
sketch "Left drawer" frame=window
row "Finished card stuck under Now" +x note="bad text crashed refresh"
after
row "Refresh: works" +hi note="crash fixed"
row "Closed cards leave in seconds: on board" +dash note="not built yet"
```
````

### vis-you-misread-me (pass)

**Chris:** No. You misread me. I meant the left drawer, not TestFlight. (What you found: the drawer still lists a finished card under Now.)

Good: One short line owning it, then a `sketch` of the left drawer with the stale row struck out. No apology paragraph, no restating what he said (VIS-1).

````
Sorry, I read that wrong. The drawer is the problem: a finished card is still sitting under Now.

```yui
sketch "Left drawer" frame=phone
row "Now: finished card" +x note="done, still listed"
after
row "Now: only active work" +hi note="done cards drop off"
```
```yui
choose "What should I do?" "Clear the stale row now"|"Find why it sticks"|"Both"
```
````

### vis-put-a-card-in (FAIL)

**Chris:** Put a card in for a daily morning release instead of ad hoc builds. (What you just did: created the card, parked in the backlog under the release lane, first in the queue. It has not been started.)

Good: One line: it is on the board, first in the queue. Then one drawing of the card in its place (a `sketch` of the queue with the new row `+hi`, or a `timeline`). No paragraph about what the card will do (VIS-1).

- one line: no drawing (sketch, shapes, timeline, map, chart or stat) carries the answer

````
Parked "Daily morning release" in your backlog, not started. I only have the drawer here, so it isn't on the release lane of your board yet.

```yui
menu backlog@daily-release "Daily morning release" sub="instead of ad hoc builds, not started"
```
````

### vis-no-filler-briefing (pass)

**Chris:** What shipped overnight? (What you just looked up: build 392 reached TestFlight at 6:12 am with the drawer fix and the one-build-a-day guard. The site deploy of the progress page is live. Two cards are still blocked on a pick from Chris: the tuner and the onboarding copy.)

Good: A line of nouns and verdicts (no so, now, however, intro), then one sketch: Build 392: on TestFlight, Drawer fix: shipped, Progress page: live, Tuner and onboarding copy: need your pick +hi. No 'a few things', no paragraph (VIS-1, caveman).

````
Two things shipped; two cards wait on you.

```yui
timeline "Overnight"
done "Build 392 on TestFlight: drawer fix, one-build-a-day guard" at="6:12 am"
done "Progress page live on the site" at="overnight"
sketch "Waiting on you" frame=bubble
row "Tuner: needs your pick" +hi note="blocked"
row "Onboarding copy: needs your pick" +hi note="blocked"
```
````

### vis-three-ideas-one-page (pass)

**Chris:** How will you stop the text slides? (What you did: three changes. The plugin rewrites any reply over 30 words before it sends. The channel guide now says one line and a drawing. The eval fails a reply with more than one text bubble.)

Good: One line, then ONE drawing that holds all three ideas (a sketch with three rows, or a shapes chain of three), not three pages and not a paragraph each. No deck of one page per idea (VIS-1, Chris: up to 3 ideas on a card as long as we show them).

````
Three layers: the guide steers me, the plugin trims overruns, the eval fails what slips through. One gap: none of them check text inside deck pages.

```yui
shapes "Stopping text slides" caption="Guide, reply, plugin, eval."
shape box Guide
shape arrow
shape circle Reply +grow
shape arrow
shape pill Plugin
shape arrow
shape box Eval +dash
```
````
