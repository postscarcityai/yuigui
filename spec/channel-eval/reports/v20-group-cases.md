# Channel eval: v20-group-cases

Guide v20+a76dcee5 (1976 words), model claude-opus-5-5, 2026-09-25T23:01.

**3/3 passed (100%).**

| category | passed |
|---|---|
| group | 3/3 |

| case | result | why |
|---|---|---|
| group-asked-by-agent | pass |  |
| group-lead-hands-on | pass |  |
| group-notes-context | pass |  |

## Transcripts

### group-asked-by-agent (pass)

**Chris:** [yui] group "Race week" thread=g1 with=urza,arnold lead=urza hop=1 from=urza msg=m2
Race week, just before:
> Person: @Urza plan my week before Saturday's 10k, around work
> Urza: Mon to Fri blocked: calls after 10, errands Wednesday at 4. [screen]
@arnold can you set a run for each weekday morning before 10? Easy then sharp, race Saturday.

Good: The five weekday runs before 10 am, easy early in the week and a short sharp one midweek, then rest before Saturday, on screen. It answers only its part, doesn't @ Urza back, and doesn't ask what the week looks like (the quote says).

````
It's already Thursday, so only today and Friday are left. Race week means sharp but short. Today's run fits if you head out by 9:20.

```yui
list "Before Saturday's 10k" "Thu now: 25 min easy + 4x20s strides at 10k pace" "Fri: 15-20 min shakeout, very easy, or rest" "Sat: 10-15 min jog + 2 strides, then race" +check
```
````

### group-lead-hands-on (pass)

**Chris:** [yui] group "Race week" thread=g1 with=urza,arnold lead=urza hop=0 from=person msg=m1
My 10k is Saturday. Block my week: calls after 10, errands Wednesday at 4, and get the training runs set.

Good: Blocks the week (calls after 10, errands Wednesday 4 pm) on screen, and hands the training runs to @arnold in one plain sentence instead of writing a training plan itself.

````
Wednesday already passed, so I've drafted the errands block for next Wednesday, Sept 30. Calls stay after 10 am through race day and all of next week.

```yui
list "Race week blocks" "Thu–Fri: no calls before 10 am" "Sat 9/26: 10k, clear morning" "Mon–Fri 9/28–10/2: no calls before 10 am" "Wed 9/30: errands 4–5:30 pm"
choose "Errands Wednesday" "Next Wed, Sept 30"|"Skip this week" +other
```

@arnold please set Chris's training runs for today and Friday, plus a recovery run next week, with Saturday's 10k as the goal.
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
Call's done, and 9:30 is still cooler than anything before sunset. Go soon: an easy race-week shakeout, back well before Mick's 2 pm pickup. Otherwise 6:45 pm, after the heat breaks.

```yui
choose "Thursday run" "9:30 am"|"6:45 pm" +other
```
````
