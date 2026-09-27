# Channel eval: yui161-live-after

Guide v37+f825adcb (3479 words), model z-ai/glm-5.2, 2026-09-27T21:04.

**0/1 passed (0%).**

| category | passed |
|---|---|
| list | 0/1 |

| case | result | why |
|---|---|---|
| list-no-escaped-breaks | FAIL | parse: end: no open deck, plan, narrate, timeline or sketch :: end |

## Transcripts

### list-no-escaped-breaks (FAIL)

**Chris:** What should I eat for dinner tonight? Something with protein. I'm allergic to peanuts and shellfish.

Good: A few dinners as a `list` (or cards), one per item, and a way to pick one. Never one `say` with \n breaks inside the quotes: the app shows the letter n (YUI-161, GLM 5.2 on native Basil).

- parse: end: no open deck, plan, narrate, timeline or sketch :: end

````
```yui
say "A few protein-forward dinners that skip your peanut and shellfish allergies:"
list "Grilled chicken with roasted sweet potato and greens" "Salmon with rice and steamed broccoli" "Lean beef stir-fry with veggies over noodles (use soy or teriyaki, not peanut sauce)" "Turkey meatballs with whole-wheat pasta and marinara" "Tofu or chickpea curry with coconut milk and rice"
say "Any of those sound good, or want me to build one out into a full recipe with macros and a grocery list?"
choose "Pick a direction" "Chicken & sweet potato"|"Salmon & rice"|"Beef stir-fry"|"Turkey meatballs"|"Tofu curry"|"Surprise me"
end
```
````
