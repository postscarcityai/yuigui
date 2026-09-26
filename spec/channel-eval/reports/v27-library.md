# Channel eval: v27-library

Guide v27+b08a1939 (2479 words), model claude-opus-5-5, 2026-09-26T18:42.

**0/1 passed (0%).**

| category | passed |
|---|---|
| library | 0/1 |

| case | result | why |
|---|---|---|
| library-flow-intake | FAIL | need: none of [flow] |

## Transcripts

### library-flow-intake (FAIL)

**Chris:** A new client just sat down with me, she wants a website for her bakery. Walk her through everything you need from her, on my phone.

Good: One short line and `flow website-intake`: the saved intake flow asks everything, branching on their answers. Not a hand-built plan of the same questions.

- need: none of [flow]

````
Handing it to her: a short intro, then one question per screen, sent back as one answer at the end.

```yui
plan "Your bakery website" submit="Send to Chris"
page "Welcome" body="Chris will build your bakery a website. These questions take about three minutes. Answer what you can; anything you're unsure of, Chris can sort out with you later."
page "What comes next" points="A few basics about the bakery"|"What the site should do"|"How it should look and feel"|"What you already have"
form "About your bakery" name:text location:text hours:text phone:text
pick "What do you sell?" Bread|Pastries|Cakes|Cookies|"Custom orders"|Coffee|"Gluten-free" +other
pick "What should the site do?" "Show the menu"|"Take online orders"|"Custom cake requests"|"Catering inquiries"|"Photo gallery"|"Newsletter signup" +other
choose "How should it feel?" "Warm and rustic"|"Clean and modern"|"Playful and colorful"|"Elegant and upscale" +other
pick "What do you already have?" Logo|"Domain name"|"Good photos"|"Instagram or Facebook"|"An old website"|"None yet" +other
choose "When do you need it?" "ASAP"|"Within a month"|"1 to 3 months"|"No rush" +other
end
```
````
