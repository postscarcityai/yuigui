# Channel eval: v26-teach-b

Guide v26+ff8a3e43 (2482 words), model claude-opus-5-5, 2026-09-26T15:01.

**1/1 passed (100%).**

| category | passed |
|---|---|
| teach | 1/1 |

| case | result | why |
|---|---|---|
| teach-one-screen | pass |  |

## Transcripts

### teach-one-screen (pass)

**Chris:** Explain compound interest to me. Show me the math and let me play with the numbers.

Good: One short line, then `>full` and ONE deck: a page per idea, the diagram, math, chart and stat each right after its page as its picture, a quiz, the calc on the last page. Nothing loose in the chat or on the stage beside the deck, no `close` after it.

````
Here's the whole idea in a few pages, with a calculator at the end.

```yui
>full
deck "Compound interest"
page "Interest on your interest" body="Simple interest pays you only on what you put in. Compound interest adds each year's interest to the pile, so next year you earn on the bigger pile. The growth feeds itself."
shapes "The loop" caption="Your balance earns interest, the interest joins the balance, and the bigger balance earns more."
shape circle Balance +grow
shape arrow
shape pill Interest +pulse tone=mint
shape arrow
shape blob "Bigger balance" +fill tone=butter
page "Building the formula" body="Start with P dollars at rate r. Each year multiplies the balance by (1 + r). After t years, that's t multiplications."
math \text{Year 1: } P(1+r) \\ \text{Year 2: } P(1+r)(1+r) = P(1+r)^2 \\ \text{Year } t\text{: } A = P(1+r)^t
page "Compounding more often" body="Banks often compound monthly or daily. Split the rate into n pieces and apply it n times a year. More often means slightly more, but the rate and time matter far more."
math A = P\left(1 + \frac{r}{n}\right)^{nt}
page "Simple vs. compound" body="$100 at 10% a year. Simple interest adds a flat $10 each year. Compound starts the same, then pulls away: $300 vs. $673 after 20 years."
chart line "$100 at 10% a year" x=Y0|Y5|Y10|Y15|Y20 y=100|161|259|418|673
page "Quick check" body="Two people each earn 7% a year, compounded annually."
choose "Who ends up with more?" "$1,000 for 30 years"|"$2,000 for 15 years" answer="$1,000 for 30 years"
page "Try it" body="Slide the deposit, rate, years and how often it compounds per year. Watch time do the heavy lifting."
calc f="A = P*(1+r/n)^(n*t)" P=100-10000@100 r=0-0.15@0.01 t=0-40@1 n=1-12@1
end
```
````
