# Channel eval: v25-teach

Guide v25+f1a8a28f (2423 words), model claude-opus-5-5, 2026-09-26T14:38.

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
Here's a lesson Mick can play with: a snowball picture, a quick quiz and sliders.

```yui
>full
shapes "The money snowball" caption="Your money earns a little extra, then the extra earns extra too, and it keeps rolling bigger."
shape circle "$100" +grow
shape arrow
shape blob "+ extra" tone=mint +pulse
shape arrow
shape circle "Bigger pile" +fill +grow
deck "How the snowball rolls"
page "Money that makes money" body="Put $100 in a bank that pays 10% a year. After one year, the bank gives you $10 extra. Now you have $110."
page "The magic part" body="Next year you get 10% of $110, not $100. That's $11. The extra money is earning extra money too. That's compound interest."
choose "After 2 years, how much do you have?" $120|$121|$200 answer=$121
end
chart line "$100 at 10% a year, left alone" x=Start|"5 yrs"|"10 yrs"|"15 yrs"|"20 yrs" y=100|161|259|418|673
calc f="Money = Start*(1+Rate)^Years" Start=10-100@10 Rate=0-0.2@0.05 Years=0-30@5
```
````

### teach-one-screen (pass)

**Chris:** Explain compound interest to me. Show me the math and let me play with the numbers.

Good: One short line, then `>full` and every piece of the lesson on the stage in reading order (a diagram or math, a chart or stat, pages, the calc last), with no `close` after it. Nothing loose in the chat, no `>2 calc` beside it.

````
Interest that earns its own interest. Here it is, with sliders at the end.

```yui
>full
shapes "Money that grows on itself" caption="Each year's interest joins the pile, so next year's interest is bigger."
shape circle Principal +grow
shape arrow
shape box Interest +fill tone=mint
shape arrow
shape blob "Bigger pile" +pulse
math A = P(1 + r)^t
step "Year 1: $100 at 10%" $ 100 \times 1.1 = 110
step "Year 2: interest on $110, not $100" $ 110 \times 1.1 = 121
chart line "$100 at 10% a year" x=Y0|Y10|Y20|Y30 y=100|259|673|1745
calc f="A = P*(1+r)^t" P=100-10000@100 r=0-0.2@0.01 t=0-40@1
```
````
