# Channel eval: v24-timeline-move

Guide v24+ca8d207d (2296 words), model claude-opus-5-5, 2026-09-26T12:03.

**2/2 passed (100%).**

| category | passed |
|---|---|
| patch | 1/1 |
| flow | 1/1 |

| case | result | why |
|---|---|---|
| patch-timeline-move | pass |  |
| project-timeline | pass |  |

## Transcripts

### patch-timeline-move (pass)

**Chris:** Blog migration just finished.

Good: A patch that turns the running row done in place (`>2 ~now kind=done at=Fri` or `~blog kind=done`), not the timeline sent again. Starting the contact form is optional; if it does, it patches that row by its id.

````
Blog migration is marked done. Contact form is next.
```yui
>2 ~now kind=done at=Thu
```
````

### project-timeline (pass)

**Chris:** Where are we on the site rebuild? We shipped the new hero Monday and the pricing page Tuesday, the blog migration is running now, and the contact form and analytics are next. Show me.

Good: One `timeline` with the two shipped items as `done` rows (at=Mon, at=Tue), the blog migration as `now`, then the contact form and analytics as `next`, in that order. At most a short line of chat and maybe one question about what to pull next.

````
Two shipped, the blog is moving now, two left.
```yui
timeline "Site rebuild"
done "New hero" at=Mon
done "Pricing page" at=Tue
now "Blog migration"
next "Contact form"
next "Analytics"
```
````
