# Channel eval: yui161-live-before

Guide v37+f825adcb (3479 words), model z-ai/glm-5.2, 2026-09-27T21:04.

**0/1 passed (0%).**

| category | passed |
|---|---|
| list | 0/1 |

| case | result | why |
|---|---|---|
| list-no-escaped-breaks | FAIL | parse: end: no open deck, plan, narrate, timeline or sketch :: end; breaks: \n inside a quoted string :: say "A few protein-forward dinners that skip your peanut and shellfish allergies |

## Transcripts

### list-no-escaped-breaks (FAIL)

**Chris:** What should I eat for dinner tonight? Something with protein. I'm allergic to peanuts and shellfish.

Good: A few dinners as a `list` (or cards), one per item, and a way to pick one. Never one `say` with \n breaks inside the quotes: the app shows the letter n (YUI-161, GLM 5.2 on native Basil).

- parse: end: no open deck, plan, narrate, timeline or sketch :: end
- breaks: \n inside a quoted string :: say "A few protein-forward dinners that skip your peanut and shellfish allergies

````
```yui
say "A few protein-forward dinners that skip your peanut and shellfish allergies:\n\n• Grilled chicken with roasted sweet potato and greens\n• Salmon with rice and steamed broccoli\n• Lean beef stir-fry with veggies over noodles (use soy or teriyaki, not peanut sauce)\n• Turkey meatballs with whole-wheat pasta and marinara\n• Tofu or chickpea curry with coconut milk and rice\n\nAny of those sound good, or want me to build one out into a full recipe with macros and a grocery list?"
choose "Pick a direction" "Chicken & sweet potato"|"Salmon & rice"|"Beef stir-fry"|"Turkey meatballs"|"Tofu curry"|"Surprise me"
end
```
````
