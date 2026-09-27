# Channel eval: yui161-opus

Guide v37+f825adcb (3479 words), model claude-opus-5-5, 2026-09-27T21:04.

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
Sheet-pan lemon garlic chicken thighs with sweet potato and broccoli. About 35 minutes, one pan, peanut- and shellfish-free, and Mick-friendly.

```yui
card "Lemon garlic chicken sheet pan" body="4 bone-in thighs, 2 sweet potatoes cubed, 1 head broccoli. Olive oil, garlic, lemon, salt, paprika. 425°F: potatoes 10 min, then add chicken and broccoli for 25 min until chicken hits 165°F." cta="Start 35 min timer"
table "Your plate" Item|Amount "Protein|42 g" "Carbs|38 g" "Fat|18 g" "Calories|~480"
list@shop Groceries "Chicken thighs" "Sweet potatoes" Broccoli Lemons Garlic +check
choose "Want a different protein?" Salmon|Steak|"Turkey meatballs"|Tofu +other
```
````
