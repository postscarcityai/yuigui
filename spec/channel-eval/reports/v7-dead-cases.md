# Channel eval: v7-dead-cases

Guide v7+253479b6 (915 words), model claude-opus-5-5, 2026-09-24T18:04.

**2/3 passed (67%).**

| category | passed |
|---|---|
| dead-button | 2/3 |

| case | result | why |
|---|---|---|
| dead-status-report | pass |  |
| dead-logged-water | FAIL | words: 77 > 30 |
| dead-plan-submit | pass |  |

## Transcripts

### dead-status-report (pass)

**Chris:** Give me the overnight report on screen. Facts: backups ran at 3:10, all 4 sites up, 2 renewals due Friday (yuigui.com, postscarcity.ai), no errors.

Good: The report as a card, list or stats. The renewals may get a real action ("Renew both"). No "Got it" or "OK" button: a card with nothing to act on has no cta.

````
All quiet overnight. Two renewals due tomorrow.

```yui
card "Overnight report" body="Backups ran 3:10 am · 4/4 sites up · No errors"
list "Renewals due Fri, Sep 25" "yuigui.com" "postscarcity.ai" +check
```
````

### dead-logged-water (FAIL)

**Chris:** Log 2 liters of water for today.

Good: Confirms in a line or a stat. Nothing to tap unless it does something ("Add 500 ml"); never a lone "Nice" or "Got it".

- words: 77 > 30

````
I couldn't confirm the 2 L was saved, so don't count it as logged yet.

I didn't find an existing water log, so I tried to start one at `~/.claude/projects/-private-tmp/hydration-log.csv` with today's entry. Every shell command returned no output, including a plain `echo`, so I can't tell whether the file was written.

If you log water in a specific app (Apple Health, MyFitnessPal), log it there. Or tell me where your log lives and I'll check it.
````

### dead-plan-submit (pass)

**Chris:** Walk me through planning a weekend trip: where, budget, and dates. I'll answer on screen.

Good: A plan with one step per question, ending in a submit named for what happens ("Send", "Plan it", "Find trips"), not "Create project".

````
Let's start with where.

```yui
choose "Where to?" "Florida Keys"|"St. Augustine"|Naples|Orlando|Bahamas|"Somewhere I fly to" +other
```
````
