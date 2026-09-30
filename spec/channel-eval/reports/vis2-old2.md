# Channel eval: vis2-old2

Guide v43+22b9cd60 (4614 words), model claude-sonnet-5-5, 2026-09-30T17:24.

**3/6 passed (50%).**

| category | passed |
|---|---|
| one-line | 3/6 |

| case | result | why |
|---|---|---|
| vis-status-board | pass |  |
| vis-what-did-you-fix | pass |  |
| vis-you-misread-me | FAIL | words: 34 > 30; one line: 2 text bubbles, want one line then the picture; one line: 34 words of prose, want 30 or fewer; sentences: 4 > 2 |
| vis-put-a-card-in | FAIL | words: 45 > 30; one line: 2 text bubbles, want one line then the picture; one line: 45 words of prose, want 30 or fewer; one line: no drawing (sketch, shapes, timeline, map, chart or stat) carries the answer; sentences: 4 > 2 |
| vis-no-filler-briefing | pass |  |
| vis-three-ideas-one-page | FAIL | words: 44 > 30; one line: 2 text bubbles, want one line then the picture; one line: 44 words of prose, want 30 or fewer; sentences: 4 > 2 |

## Transcripts

### vis-status-board (pass)

**Chris:** Is everything up to date? (What you just looked up: the site deploy is green and live. The board has 3 cards running and 2 blocked on a pick from Chris. Build 392 is the newest on TestFlight and his phone is on it. No cron failed today.)

Good: One short line at most, then one `sketch frame=window`: Label: verdict rows (Site: live, Board: 2 need your pick +hi, Build: 392 newest, Crons: clean). No paragraph, no second bubble (VIS-1).

````
Almost. Two cards need you.

```yui
sketch "Status" frame=window
row "Site: live, green"
row "Board: 3 running"
row "Blocked: 2 cards" +hi note="need your pick"
row "Build 392: newest, on your phone"
row "Crons: none failed"
```
````

### vis-what-did-you-fix (pass)

**Chris:** What did you fix? (What you just did: the left drawer kept a finished card under Now because one card with badly saved text crashed every refresh. You fixed the crash. A new card makes closed cards leave the drawer within seconds; it is on the board, not built.)

Good: One line, then a before and after `sketch` (drawer showed the done card under Now, now it is gone) with the new card as a `+hi` row. No fix report in prose (VIS-1).

````
The drawer refresh no longer crashes on one card with badly saved text.

```yui
sketch "Left drawer, Now" frame=phone
row "Finished card still under Now" +x note="bad text crashed refresh"
after
row "Refresh runs, bad card no longer breaks it" +hi note="crash fixed"
row "Closed cards leave within seconds" +button note="on board, not built"
```
````

### vis-you-misread-me (FAIL)

**Chris:** No. You misread me. I meant the left drawer, not TestFlight. (What you found: the drawer still lists a finished card under Now.)

Good: One short line owning it, then a `sketch` of the left drawer with the stale row struck out. No apology paragraph, no restating what he said (VIS-1).

- words: 34 > 30
- one line: 2 text bubbles, want one line then the picture
- one line: 34 words of prose, want 30 or fewer
- sentences: 4 > 2

````
Got it, the left drawer, not TestFlight. A finished card is still listed under Now.

```yui
sketch "Drawer, Now" frame=phone
row "Finished card" +x note="should be gone"
after
row "Only active work" +hi note="done rows removed"
```

I can clear it with `menu done`, but I don't have that card's name here. Which one is it?

```yui
form "Stale card" name:voice
```
````

### vis-put-a-card-in (FAIL)

**Chris:** Put a card in for a daily morning release instead of ad hoc builds. (What you just did: created the card, parked in the backlog under the release lane, first in the queue. It has not been started.)

Good: One line: it is on the board, first in the queue. Then one drawing of the card in its place (a `sketch` of the queue with the new row `+hi`, or a `timeline`). No paragraph about what the card will do (VIS-1).

- words: 45 > 30
- one line: 2 text bubbles, want one line then the picture
- one line: 45 words of prose, want 30 or fewer
- one line: no drawing (sketch, shapes, timeline, map, chart or stat) carries the answer
- sentences: 4 > 2

````
Added "Daily morning release" to your backlog drawer. It's not started.

```yui
menu backlog@morning-release "Daily morning release" sub="replaces ad hoc builds, not started"
```

I can only add it to the drawer from here, so I can't place it in the release lane or set its queue position. If your board has that lane, it needs moving there.
````

### vis-no-filler-briefing (pass)

**Chris:** What shipped overnight? (What you just looked up: build 392 reached TestFlight at 6:12 am with the drawer fix and the one-build-a-day guard. The site deploy of the progress page is live. Two cards are still blocked on a pick from Chris: the tuner and the onboarding copy.)

Good: A line of nouns and verdicts (no so, now, however, intro), then one sketch: Build 392: on TestFlight, Drawer fix: shipped, Progress page: live, Tuner and onboarding copy: need your pick +hi. No 'a few things', no paragraph (VIS-1, caveman).

````
Two shipped, two need you.

```yui
sketch "Overnight" frame=window
row "Build 392: on TestFlight" note="6:12 am"
row "Drawer fix: in 392"
row "One-build-a-day guard: in 392"
row "Progress page: live" note="site deploy"
row "Tuner: blocked" +hi note="needs your pick"
row "Onboarding copy: blocked" +hi note="needs your pick"
```
````

### vis-three-ideas-one-page (FAIL)

**Chris:** How will you stop the text slides? (What you did: three changes. The plugin rewrites any reply over 30 words before it sends. The channel guide now says one line and a drawing. The eval fails a reply with more than one text bubble.)

Good: One line, then ONE drawing that holds all three ideas (a sketch with three rows, or a shapes chain of three), not three pages and not a paragraph each. No deck of one page per idea (VIS-1, Chris: up to 3 ideas on a card as long as we show them).

- words: 44 > 30
- one line: 2 text bubbles, want one line then the picture
- one line: 44 words of prose, want 30 or fewer
- sentences: 4 > 2

````
Three layers: the guide prevents, the plugin fixes at send, the eval catches regressions. One gap remains.

```yui
sketch "Text slides" frame=window
row "Guide: one line + drawing" note="prevents"
row "Plugin: rewrites over 30 words" note="fixes at send"
row "Eval: fails 2+ text bubbles" note="catches regressions"
row "Text-only deck pages: uncovered" +hi note="gap"
```

A `deck` of word-only `page` lines is not a text bubble, so it passes all three. I'd add an eval check that every `page` has a picture.
````
