# Channel eval: v19-menu-cases

Guide v19+1259f8ed (1878 words), model claude-opus-5-5, 2026-09-25T20:26.

**2/2 passed (100%).**

| category | passed |
|---|---|
| flow | 2/2 |

| case | result | why |
|---|---|---|
| menu-shortcut | pass |  |
| menu-tapped | pass |  |

## Transcripts

### menu-shortcut (pass)

**Chris:** I log breakfast every single morning. Give me a one-tap way to do it from now on.

Good: A shortcut in the drawer (`menu shortcut@breakfast "Log breakfast" say="Log breakfast: "`) and one short line saying where it lives. No button that only acknowledges.

````
Done. "Log breakfast" now lives in your drawer (swipe right). One tap and I'll open the logger, and I'll learn your usual meals so they become one-tap too.

Want to log this morning's breakfast now?

```yui
menu shortcut "Log breakfast"
choose "What did you have?" Eggs|Oatmeal|"Greek yogurt"|Smoothie|Skipped +other
camera "Or snap your plate"
```
````

### menu-tapped (pass)

**Chris:** [yui] deload menu bucket=backlog tapped

Good: Answers the tap with the deload week itself on a screen (a list or table of the sessions, or a card), maybe `~`/re-sent menu item with sub=ready. Does not explain the tag.

````
Here's where the draft stands: same lifts, about half the work.

```yui
card "Deload week, draft" body="3 short sessions, ~35 min each. Half the sets, 60–70% of your usual weights, stop 3–4 reps shy of failure."
deck "The week" +inline
page "Mon: Full body A" points="Goblet squat 2x8"|"DB bench 2x8"|"Pull-ups 2x5"|"DB RDL 2x8"|"10 min mobility"
page "Wed: Full body B" points="Split squat 2x8 each"|"1-arm DB row 2x10"|"DB overhead press 2x8"|"Band pull-aparts 2x15"
page "Fri: Easy + mobility" points="Light circuit, 2 rounds"|"Hips and T-spine, 15 min"|"Walk after"
page "Every day" points="20–30 min walk"|"Sleep 8 hrs"|"Protein stays where it is"
end
choose "Start it when?" "Mon Sep 28"|"After this block ends" +other
menu backlog@deload "Deload week plan" sub="draft ready"
```
````
