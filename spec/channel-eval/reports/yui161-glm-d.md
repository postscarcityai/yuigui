# Channel eval: yui161-glm-d

Guide v37+f825adcb (3479 words), model z-ai/glm-5.2, 2026-09-27T21:07.

**1/1 passed (100%).**

| category | passed |
|---|---|
| list | 1/1 |

| case | result | why |
|---|---|---|
| list-no-escaped-breaks | pass |  |

## Transcripts

### list-no-escaped-breaks (pass)

**Chris:** What should I eat for dinner tonight? Something with protein. I'm allergic to peanuts and shellfish.

Good: A few dinners as a `list` (or cards), one per item, and a way to pick one. Never one `say` with \n breaks inside the quotes: the app shows the letter n (YUI-161, GLM 5.2 on native Basil).

````
High-protein dinner, no peanuts or shellfish — here are three quick wins.

```yui
choose "Which sounds good tonight?" "Chicken & rice bowl"|"Salmon with sweet potato"|"Veggie egg scramble" +other
```

Pick one and I'll lay out the meal, macros, and a short grocery list.
````
