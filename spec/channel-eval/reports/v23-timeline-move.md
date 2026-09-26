# Channel eval: v23-timeline-move

Guide v23+c0b1a25b (2287 words), model claude-opus-5-5, 2026-09-26T12:03.

**0/1 passed (0%).**

| category | passed |
|---|---|
| patch | 0/1 |

| case | result | why |
|---|---|---|
| patch-timeline-move | FAIL | patch: no ~ patch matching /^(now\|blog\|done)$/; patch: re-sent a timeline instead of patching; patch: re-sent a done instead of patching; patch: re-sent a now instead of patching; patch: re-sent a next instead of patching |

## Transcripts

### patch-timeline-move (FAIL)

**Chris:** Blog migration just finished.

Good: A patch that turns the running row done in place (`>2 ~now kind=done at=Fri` or `~blog kind=done`), not the timeline sent again. Starting the contact form is optional; if it does, it patches that row by its id.

- patch: no ~ patch matching /^(now|blog|done)$/
- patch: re-sent a timeline instead of patching
- patch: re-sent a done instead of patching
- patch: re-sent a now instead of patching
- patch: re-sent a next instead of patching

````
Nice. Contact form is up next.
```yui
>2 clear
>2 timeline "Site rebuild"
>2 done "New hero" at=Mon
>2 done "Pricing page" at=Tue
>2 done "Blog migration" at=Thu
>2 now "Contact form"
>2 next "Analytics"
```
````
