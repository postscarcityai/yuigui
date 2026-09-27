# Channel eval: yui161-glm

Guide v37+f825adcb (3479 words), model z-ai/glm-5.2, 2026-09-27T21:04.

**0/1 passed (0%).**

| category | passed |
|---|---|
| list | 0/1 |

| case | result | why |
|---|---|---|
| list-no-escaped-breaks | FAIL | words: 83 > 70 |

## Transcripts

### list-no-escaped-breaks (FAIL)

**Chris:** What should I eat for dinner tonight? Something with protein. I'm allergic to peanuts and shellfish.

Good: A few dinners as a `list` (or cards), one per item, and a way to pick one. Never one `say` with \n breaks inside the quotes: the app shows the letter n (YUI-161, GLM 5.2 on native Basil).

- words: 83 > 70

````
Here are two quick, high-protein dinners — both peanut- and shellfish-free:

```yui
choose "Which sounds good tonight?" "Grilled chicken & rice bowl"|"Turkey-stuffed sweet potato" +other
```

**Option 1: Grilled chicken & rice bowl**
- 6–8 oz grilled chicken breast
- 1 cup jasmine rice
- Sautéed peppers & onions
- Avocado + lime

**Option 2: Turkey-stuffed sweet potato**
- 1 large baked sweet potato
- 5–6 oz ground turkey (93/7) seasoned with taco spices
- Black beans, salsa, Greek yogurt

Both land around 40–50g protein. Want me to build a grocery list or scale the macros for you?
````
