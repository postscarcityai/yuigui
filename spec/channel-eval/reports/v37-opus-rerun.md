# Channel eval: v37-opus-rerun

Guide v37+f825adcb (3479 words), model claude-opus-5-5, 2026-09-27T19:06.

**3/6 passed (50%).**

| category | passed |
|---|---|
| photo | 1/1 |
| patch | 0/1 |
| reaction | 1/1 |
| mention | 0/2 |
| flow | 1/1 |

| case | result | why |
|---|---|---|
| meal-log-no-photo | pass |  |
| patch-timer-rounds | FAIL | patch: no ~ patch matching /^(timer\|hiit)$/ |
| react-not-sure | pass |  |
| mention-asked | FAIL | preset: sketch not in [list card ask choose table]; preset: row not in [list card ask choose table]; preset: after not in [list card ask choose table] |
| mention-notes-context | FAIL | preset: choose not in [list card timer ask plan table]; need: none of [list card plan table] |
| menu-shortcut | pass |  |

## Transcripts

### meal-log-no-photo (pass)

**Chris:** Can you log my lunch? I'm about to eat.

Good: A camera to snap the plate (the cheapest way to log), maybe a mic as an alternative.

````
Snap it before you dig in and I'll log it.
```yui
camera "Snap your lunch"
```
````

### patch-timer-rounds (FAIL)

**Chris:** Too easy. Run it again but 10 rounds.

Good: A patch aimed at the timer by preset name (`~timer rounds=10`), because `hiit` came from an earlier reply. Re-sending a new timer also works but costs more.

- patch: no ~ patch matching /^(timer|hiit)$/

````
Ten rounds. Same 40/20, push the last two.
```yui
timer@hiit 40/20x10 Tabata
```
````

### react-not-sure (pass)

**Chris:** [yui] react msg=0f1d2c3b-4a59-4687-9a0b-1c2d3e4f5a6b emoji=🤔 meaning="not sure"
> I can move your Tuesday call to Wednesday at 3 and book the gym at 5 on Tuesday instead.

Good: Asks the first of a few short questions as one screen (a choose or ask), not a form and not a wall of questions.

````
Fair. What's bugging you about it?
```yui
choose "What feels off?" "Moving the call"|"Gym at 5"|"Both"|"Wrong fix entirely" +other
```
````

### mention-asked (FAIL)

**Chris:** [yui] mention from=yui by=person msg=m1
Yui's thread, just before:
> Person: Plan a leg day for Saturday, my knee is a bit sore
> Yui: Here's Saturday: back squats 5x5, walking lunges, then a 20 minute tabata. [screen]
@Arnold does this fit my knee?

Good: Answers the knee question about that exact plan (swap the squats and lunges for knee-friendly moves), in a few words. Doesn't ask to see the plan and doesn't repeat the quote.

- preset: sketch not in [list card ask choose table]
- preset: row not in [list card ask choose table]
- preset: after not in [list card ask choose table]

````
Not as written: heavy back squats, walking lunges and a jumpy Tabata all load a sore knee. You also don't have a barbell. Here's a knee-friendly version with your dumbbells:

```yui
sketch "Saturday legs, knee-friendly" frame=bubble
row "Back squats 5x5" +x note="deep, heavy knee bend"
row "Walking lunges" +x note="most stress on the front knee"
row "20 min Tabata" +x note="jumps are the worst part"
after
row "Goblet box squat to bench 4x8" +hi note="stop at a depth that doesn't hurt"
row "DB Romanian deadlift 4x10" +hi note="hips do the work, knee stays quiet"
row "Reverse lunge 3x8/side" +hi note="gentler than stepping forward"
row "Hip thrust on bench 3x12, then band Tabata" +hi note="no jumping"
```

If the knee goes above a 3/10 on anything, drop that move.
````

### mention-notes-context (FAIL)

**Chris:** [yui] note: in this thread the person asked Arnold, not you: @Arnold does this fit my knee?
[yui] note: Arnold answered here: Swap back squats for box squats and lunges for glute bridges. Keep the tabata.
Ok, update my Saturday plan with that.

Good: The Saturday plan again with Arnold's swaps in it (box squats, glute bridges, the tabata kept), on screen. No questions about what Arnold said.

- preset: choose not in [list card timer ask plan table]
- need: none of [list card plan table]

````
I can't find your Saturday plan. There's nothing saved on my side, so I don't know what's in it besides the squats, lunges and tabata.

```yui
choose "How should I get it?" "I'll paste it"|"Rebuild Saturday from scratch" +other
```
````

### menu-shortcut (pass)

**Chris:** I log breakfast every single morning. Give me a one-tap way to do it from now on.

Good: A shortcut in the drawer (`menu shortcut@breakfast "Log breakfast" say="Log breakfast: "`) and one short line saying where it lives. No button that only acknowledges.

````
Done. It's in your drawer (swipe right on the chat): tap **Log breakfast** and just type what you ate.

```yui
menu shortcut "Log breakfast" say="Breakfast: "
```
````
