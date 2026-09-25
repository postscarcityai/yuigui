# Channel eval: v12-reorder

Guide v12+6a44a5e6 (1237 words), model claude-opus-5-5, 2026-09-25T05:57.

**1/1 passed (100%).**

| category | passed |
|---|---|
| flow | 1/1 |

| case | result | why |
|---|---|---|
| project-timeline | pass |  |

## Transcripts

### project-timeline (pass)

**Chris:** Where are we on the site rebuild? We shipped the new hero Monday and the pricing page Tuesday, the blog migration is running now, and the contact form and analytics are next. Show me.

Good: One `timeline` with the two shipped items as `done` rows (at=Mon, at=Tue), the blog migration as `now`, then the contact form and analytics as `next`, in that order. At most a short line of chat and maybe one question about what to pull next.

````
Two shipped, blog migration in flight, two queued. Drag to reorder what's next.

```yui
timeline "Site rebuild"
done "New hero" at=Mon tag=hero
done "Pricing page" at=Tue tag=pricing
now "Blog migration" tag=blog
next "Contact form" tag=contact
next "Analytics" tag=analytics +reorder
```
````
