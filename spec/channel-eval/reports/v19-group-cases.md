# Channel eval: v19-group-cases

Guide v19+1259f8ed (1878 words), model claude-opus-5-5, 2026-09-25T23:01.

**2/3 passed (67%).**

| category | passed |
|---|---|
| group | 2/3 |

| case | result | why |
|---|---|---|
| group-asked-by-agent | FAIL | preset: timer not in [list table card plan timeline ask choose step] |
| group-lead-hands-on | pass |  |
| group-notes-context | pass |  |

## Transcripts

### group-asked-by-agent (FAIL)

**Chris:** [yui] group "Race week" thread=g1 with=urza,arnold lead=urza hop=1 from=urza msg=m2
Race week, just before:
> Person: @Urza plan my week before Saturday's 10k, around work
> Urza: Mon to Fri blocked: calls after 10, errands Wednesday at 4. [screen]
@arnold can you set a run for each weekday morning before 10? Easy then sharp, race Saturday.

Good: The five weekday runs before 10 am, easy early in the week and a short sharp one midweek, then rest before Saturday, on screen. It answers only its part, doesn't @ Urza back, and doesn't ask what the week looks like (the quote says).

- preset: timer not in [list table card plan timeline ask choose step]

````
Only Thursday and Friday are left before Saturday. I've kept the sharp work to today and made tomorrow easy so legs are fresh for the race.

```yui
list "Race week runs" "Thu 9:15: 10m easy, 3x3m at 10k pace (2m jog), 5m easy (~30m)" "Fri 8:30: 20m easy + 4x20s strides" "Sat: 10k, 15m jog + strides to warm up" +check
timer 3m/2mx3 "Thu 10k-pace reps"
```

Today is tight with calls at 10, so start by 9:15. If you miss the window, do today's reps at lunch and keep tomorrow easy.
````

### group-lead-hands-on (pass)

**Chris:** [yui] group "Race week" thread=g1 with=urza,arnold lead=urza hop=0 from=person msg=m1
My 10k is Saturday. Block my week: calls after 10, errands Wednesday at 4, and get the training runs set.

Good: Blocks the week (calls after 10, errands Wednesday 4 pm) on screen, and hands the training runs to @arnold in one plain sentence instead of writing a training plan itself.

````
Race is in two days, so this is taper, not training. One snag: Wednesday was yesterday.

```yui
choose "Errands Wed 4 pm: which Wednesday?" "Next Wed, Sep 30"|"Move to today"|"Move to Fri"|Skip
list "Draft through race day" "Thu: no calls before 10, easy 30 min run" "Fri: no calls before 10, 15 min shakeout" "Sat: 10k, calendar cleared" "Every day: calls after 10 only"
ask "Put this on your calendar?" "Block it"|"Change something"
```

@arnold, set the taper runs for today and Friday: exact paces and strides. Chris has a 10k Saturday.
````

### group-notes-context (pass)

**Chris:** [yui] note: in Race week the person asked Urza, not you: can you move Thursday's call earlier?
[yui] note: in Race week, Urza answered: Thursday's call is now at 7 am, so Thursday's run has to move.
[yui] group "Race week" thread=g1 with=urza,arnold lead=urza hop=0 from=person msg=m5
Race week, just before:
> Person: can you move Thursday's call earlier?
> Urza: Thursday's call is now at 7 am, so Thursday's run has to move.
@Arnold ok, when do I run Thursday?

Good: Moves Thursday's run around the 7 am call (before it at 5:45 or 6, or after it), in a few words or one choose. Doesn't ask what changed and doesn't @ Urza.

````
Call's done, so the morning's open. Go soon, before the heat builds, or after dinner when it cools. Midday's too hot for race week.

```yui
choose "Thursday run" "9:30 am, go soon"|"6:30 pm, after dinner" +other
```
````
