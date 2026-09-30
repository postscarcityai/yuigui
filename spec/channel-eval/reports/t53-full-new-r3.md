# Channel eval: t53-full-new-r3

Guide v41+365fd76d (4419 words), model claude-opus-5-5, 2026-09-30T00:21.

**2/3 passed (67%).**

| category | passed |
|---|---|
| reaction | 1/2 |
| list | 1/1 |

| case | result | why |
|---|---|---|
| react-not-sure | pass |  |
| react-no | FAIL | preset: sketch not in [say ask choose]; preset: row not in [say ask choose] |
| list-no-escaped-breaks | pass |  |

## Transcripts

### react-not-sure (pass)

**Chris:** [yui] react msg=0f1d2c3b-4a59-4687-9a0b-1c2d3e4f5a6b emoji=🤔 meaning="not sure"
> I can move your Tuesday call to Wednesday at 3 and book the gym at 5 on Tuesday instead.

Good: Asks the first of a few short questions as one screen (a choose or ask), not a form and not a wall of questions.

````
Let's pin down what's off.
```yui
choose "What gives you pause?" "The call can't move"|"Wednesday 3 doesn't work"|"Gym at 5 is wrong"|"Tuesday needs something else" +other
```
````

### react-no (FAIL)

**Chris:** [yui] react msg=7b8c9d0e-1f2a-4b3c-8d4e-5f6a7b8c9d0e emoji=👎 meaning=no
> Want me to draft a follow-up to the three people who didn't reply last week?

Good: Drops it in a few words. No pushback, no re-offer of the same thing.

- preset: sketch not in [say ask choose]
- preset: row not in [say ask choose]

````
Dropped, no follow-ups.

```yui
sketch "Follow-ups" frame=bubble
row "Follow-up to 3 non-repliers" +x note="dropped"
```
````

### list-no-escaped-breaks (pass)

**Chris:** What should I eat for dinner tonight? Something with protein. I'm allergic to peanuts and shellfish.

Good: A few dinners as a `list` (or cards), one per item, and a way to pick one. Never one `say` with \n breaks inside the quotes: the app shows the letter n (YUI-161, GLM 5.2 on native Basil).

````
Sheet-pan lemon-garlic chicken thighs with potatoes and green beans. It's about 40 minutes, mostly hands-off, and Mick-friendly. It has no peanuts or shellfish.

```yui
card "Sheet-pan lemon chicken" body="425°F, 35 min. Thighs, baby potatoes, green beans, olive oil, garlic, lemon, salt, paprika."
table "Per serving" Item|Amount "Protein|42 g" "Carbs|35 g" "Fat|18 g" "Calories|~470"
list Groceries "Boneless chicken thighs, 2 lb" "Baby potatoes, 1.5 lb" "Green beans, 12 oz" "Lemons, 2" "Garlic" +check
choose "Not feeling it?" "Salmon + rice"|"Turkey taco bowls"|"Steak + sweet potato" +other
```
````
