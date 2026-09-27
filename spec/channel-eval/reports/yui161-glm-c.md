# Channel eval: yui161-glm-c

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
Here are three easy high-protein dinners — all peanut and shellfish free. Pick one and I'll build the meal with macros and a grocery list.

```yui
choose "What sounds good?" "Chicken & rice bowl"|"Salmon with sweet potato"|"Turkey tacos"
```
````
