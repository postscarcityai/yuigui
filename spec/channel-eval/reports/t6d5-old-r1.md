# Channel eval: t6d5-old-r1

Guide v47+b7493fe6 (5616 words), model claude-opus-5-5, 2026-10-05T18:44.

**4/5 passed (80%).**

| category | passed |
|---|---|
| workout | 4/5 |

| case | result | why |
|---|---|---|
| workout-leg-day | pass |  |
| workout-start-runner | FAIL | preset: query not in [plan page pick slide choose end save]; need: none of [plan]; text: none of /Set 1.{0,6}Set 2/ |
| workout-tabata | pass |  |
| workout-plank | pass |  |
| workout-gear-question | pass |  |

## Transcripts

### workout-leg-day (pass)

**Chris:** Leg day. I have 40 minutes, home gym.

Good: A short line, then the session to do: the runner `plan` (a page, then per move a sets pick with its reps and weight slides), or a checklist or card with a way to start. No interrogation: he already said time and gear.

````
Legs, 40 min: 5 moves, 90s rest between sets.

```yui
table create session Slot:number Move:text Sets:number Reps:number Done:bool
put session 1 Slot=1 Move="Warm-up: banded walks + bodyweight squats" Sets=1 Reps=5
put session 2 Slot=2 Move="Goblet squat, 50 lb" Sets=4 Reps=10
put session 3 Slot=3 Move="DB Romanian deadlift" Sets=4 Reps=10
put session 4 Slot=4 Move="Bulgarian split squat, per leg" Sets=3 Reps=8
put session 5 Slot=5 Move="Bench hip thrust, DB on hips" Sets=3 Reps=12
put session 6 Slot=6 Move="Single-leg calf raise, per leg" Sets=3 Reps=15
query session sort=Slot cols=Move|Sets|Reps|Done as list check=Done "Leg day"
>2 timer 90s Rest
save workout
```
````

### workout-start-runner (FAIL)

**Chris:** Start my workout.

Good: One line, then the runner plan: a page with the rest, per move a `pick@eN-sets` of Set 1..N and Skip with title= and work=, its reps (or secs) and weight slides, `choose@feel` last. Not the moves as a list, not a deck, not questions about sets.

- preset: query not in [plan page pick slide choose end save]
- need: none of [plan]
- text: none of /Set 1.{0,6}Set 2/

````
Full body A: goblet squat first, 3x10 at 20 lb. Tick each move as you finish it.
```yui
table create session Slot:number Move:text Sets:number Reps:text Load:text Done:bool
put session 1 Slot=1 Move="Goblet squat" Sets=3 Reps="10" Load="20 lb"
put session 2 Slot=2 Move="Push-up" Sets=3 Reps="8" Load="Body"
put session 3 Slot=3 Move="Dumbbell row" Sets=3 Reps="10" Load="20 lb"
put session 4 Slot=4 Move="Plank" Sets=3 Reps="30s" Load="Body"
query session sort=Slot cols=Move|Sets|Reps|Load|Done as list check=Done "Full body A"
save workout
menu shortcut "Rest 90s"
```
````

### workout-tabata (pass)

**Chris:** Give me a 10 minute tabata finisher, I'm ready now.

Good: A timer with work/rest x rounds (it goes full screen by itself) and maybe the move list. No questions first.

````
Four moves, five cycles, 20 on/10 off: thrusters with light 20s, go hard.
```yui
list Finisher "1. DB thrusters" "2. Burpees" "3. Renegade rows" "4. Mountain climbers" +check
timer 20/10x20 "Tabata finisher"
save tabata
```
````

### workout-plank (pass)

**Chris:** plank hold, 2 min

Good: One timer line. Almost no chat text.

````
Elbows under shoulders, squeeze glutes, breathe.
```yui
timer 2m Plank
```
````

### workout-gear-question (pass)

**Chris:** I want to train today but I'm at my mom's place, not sure what she has.

Good: Offer the likely gear as a pick with +other, or a camera to snap what is there. One question, not a form.

````
Bodyweight works fine. Tell me what's there and I'll build it.
```yui
pick "What's at your mom's?" "Nothing, just floor"|Chair|Stairs|Couch|Towel|Backpack|"Light dumbbells"|Bands +other
```
````
