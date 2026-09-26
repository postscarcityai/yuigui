# Channel eval: v26-teach

Guide v26+ff8a3e43 (2482 words), model claude-opus-5-5, 2026-09-26T15:01.

**2/2 passed (100%).**

| category | passed |
|---|---|
| teach | 2/2 |

| case | result | why |
|---|---|---|
| teach-compound-interest | pass |  |
| teach-one-screen | pass |  |

## Transcripts

### teach-compound-interest (pass)

**Chris:** Explain compound interest to Mick, he's 9. Make it something he can play with.

Good: Something interactive: a calc with sliders, or a short deck with a quiz question.

````
Here's a lesson for Mick, with a slider page at the end he can play with.

```yui
>full
deck "The Magic Piggy Bank"
page "A piggy bank that pays you" body="Imagine a piggy bank that adds a little extra money every year, just for keeping your money inside. That extra is called interest."
shapes caption="Put in $10, and after a year it's $11."
shape circle $10 +grow
shape arrow
shape blob $11 +pulse tone=mint
page "The secret trick" body="Next year, the bank gives you extra on the whole $11, not just your first $10. Your extra money earns extra money too. That's compound interest."
shapes caption="Every year the pile gets bigger, so the extra gets bigger too."
shape circle $10
shape arrow
shape circle $11
shape arrow
shape circle $12.10
shape arrow
shape blob $13.31 +pulse tone=mint
page "Slow, then WHOOSH" body="At first it grows slowly. The longer you wait, the faster it grows. Your $10 turns into $67 in 20 years without you adding anything."
chart line "$10 growing 10% a year" x=Start|5yrs|10yrs|15yrs|20yrs|30yrs y=10|16|26|42|67|174
page "Quiz time" body="Two piggy banks each start with $10."
choose "Which one has more after 20 years?" "Adds $1 every year"|"Adds 10% of what's inside" answer="Adds 10% of what's inside"
page "Your turn!" body="Move the sliders. P is the money you put in, r is how much extra it adds each year (0.1 means 10%), and t is how many years you wait. Try making t really big!"
calc f="A = P*(1+r)^t" P=10-100@10 r=0-0.2@0.05 t=0-30@5
end
save piggybank
```
````

### teach-one-screen (pass)

**Chris:** Explain compound interest to me. Show me the math and let me play with the numbers.

Good: One short line, then `>full` and ONE deck: a page per idea, the diagram, math, chart and stat each right after its page as its picture, a quiz, the calc on the last page. Nothing loose in the chat or on the stage beside the deck, no `close` after it.

````
Here's the whole idea in a few pages, with numbers you can play with at the end.
```yui
>full
deck "Compound interest"
page "Interest on your interest" body="With simple interest, you earn only on what you put in. With compound interest, each year's interest joins the pile, and next year you earn on that bigger pile."
shapes "The snowball" caption="$100 at 10% becomes $110, then $121: the extra $1 is interest on last year's interest."
shape circle $100 +grow
shape arrow
shape blob $110 tone=mint
shape arrow
shape blob $121 +pulse tone=mint +fill
page "Where the formula comes from" body="Each year multiplies the balance by (1 + r). After t years, you've multiplied t times."
math A_1 = P(1+r) \\ A_2 = P(1+r)(1+r) = P(1+r)^2 \\ A_t = P(1+r)^t
page "Time does the heavy lifting" body="$100 at 10%: simple interest reaches $300 in 20 years. Compounding reaches $673. The curve bends upward because the growth itself keeps growing."
chart line "$100 at 10% a year" x=Y0|Y5|Y10|Y15|Y20 y=100|161|259|418|673
page "A handy shortcut" body="The Rule of 72: divide 72 by the rate to get roughly how many years it takes to double. At 8%, about 9 years. At 6%, about 12."
choose "At 9% a year, about how long until your money doubles?" "4 years"|"8 years"|"12 years" answer="8 years"
page "Try it" body="Slide the deposit, rate and years. Watch how much more the years move the result than the deposit does."
calc f="A = P*(1+r)^t" P=100-10000@100 r=0-0.15@0.01 t=0-40@1
```
````
