# Channel eval: v17-talk-cases

Guide v17+15855203 (1666 words), model claude-opus-5-5, 2026-09-25T17:41.

**2/2 passed (100%).**

| category | passed |
|---|---|
| flow | 2/2 |

| case | result | why |
|---|---|---|
| talk-keep-plan-editable | pass |  |
| talk-typed-on-screen | pass |  |

## Transcripts

### talk-keep-plan-editable (pass)

**Chris:** Lay out my runs for this week somewhere I can keep looking at it, and I'll tell you what to change as the week goes.

Good: The week on a page (`>2 list@runs Runs "Tue 5k"|"Thu 5k"|"Sat 10k" +check`) with `>2 talk` so they can type changes right there, and one short line in the chat.

````
Here's a starting week, pinned on its own screen. Early starts to beat the heat. Type there anytime to change it.

```yui
>2 list "Runs this week" "Thu: Easy 30 min, conversational pace" "Fri: Rest, or 20 min strength" "Sat: Long run 60 min, out by 6:30 am" "Sun: Easy 25 min + 4 strides" +check
>2 talk
save runs
```
````

### talk-typed-on-screen (pass)

**Chris:** [yui] screen=2
Make Thursday a swim instead.

Good: Patches the list on screen 2 by preset name (`~list "Tue 5k easy" "Thu swim" "Sat 10k long" +check`), at most a short line. Does not re-send the list or explain the tag.

````
```yui
>2 ~list Runs "Tue 5k easy"|"Thu swim"|"Sat 10k long" +check
>2 say Thursday's a swim now. Easy pace keeps your legs fresh for Saturday's 10k.
```
````
