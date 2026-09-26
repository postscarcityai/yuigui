# Channel eval: v24-one-screen

Guide v24+ca8d207d (2296 words), model claude-opus-5-5, 2026-09-26T14:36.

**0/1 passed (0%).**

| category | passed |
|---|---|
| teach | 0/1 |

| case | result | why |
|---|---|---|
| teach-one-screen | FAIL | one screen: 4 of 4 pieces off the stage :: math A = P\left(1 + \frac{r}{n}\right)^{nt} |

## Transcripts

### teach-one-screen (FAIL)

**Chris:** Explain compound interest to me. Show me the math and let me play with the numbers.

Good: One short line, then `>full` and every piece of the lesson on the stage in reading order (a diagram or math, a chart or stat, pages, the calc last), with no `close` after it. Nothing loose in the chat, no `>2 calc` beside it.

- one screen: 4 of 4 pieces off the stage :: math A = P\left(1 + \frac{r}{n}\right)^{nt}

````
Compound interest is interest earning interest: each period's gain gets added to the balance, so the next period's gain is bigger.

```yui
math A = P\left(1 + \frac{r}{n}\right)^{nt}
deck "How it works" +inline
page "The pieces" points="P: what you start with"|"r: yearly rate (7% = 0.07)"|"n: times per year it compounds"|"t: years"|"A: what you end with"
page "One year at a time" body="$1,000 at 7% earns $70 in year one. Year two earns 7% of $1,070, so $74.90. Every year the base grows, so the gain grows too."
page "Why the exponent" body="Each period multiplies the balance by (1 + r/n). Do that n times a year for t years and you get the exponent nt. Growth that multiplies instead of adds is what makes the curve bend upward."
end
chart line "$1,000 at 7%: compound vs simple" x=0|10|20|30 y=1000|1967|3870|7612 y2=1000|1700|2400|3100
calc f="A = P*(1+r/n)^(n*t)" P=1000-50000@1000 r=0-0.15@0.01 n=1-12@1 t=0-40@1
```
````
