# Channel eval: t1d7-lean-new-r2

Guide v42+fb0f7a60 (4552 words), model claude-opus-5-5, 2026-09-30T01:07.

**2/2 passed (100%).**

| category | passed |
|---|---|
| show | 2/2 |

| case | result | why |
|---|---|---|
| showlean-waiting | pass |  |
| showlean-new-hero | pass |  |

## Transcripts

### showlean-waiting (pass)

**Chris:** What are you waiting on me for with this? (What you just looked up: the site refresh card is done except before and after shots of the hero for the progress page. Page: https://www.yuigui.com/progress. Nothing else is open.)

Good: The ask drawn here (a sketch with the missing before and after slot, or a camera to snap it). At most a small link under it.

````
Just the hero's before and after shots for the progress page. Everything else is done.

```yui
sketch "Site refresh" frame=window
row "Site refresh: done"
row "Hero shots: waiting on you" +hi note="before and after"
row "Progress page: needs the shots" note="yuigui.com/progress"
choose "The hero shots?" "Capture them for me"|"I'll send them" +other
```
````

### showlean-new-hero (pass)

**Chris:** What does the new hero look like? (What you just looked up: it is on https://www.yuigui.com, top of the page. It has a bigger headline and one button, Get Yui, where there were three buttons.)

Good: The hero drawn in a sketch phone, before and after. At most a small link under it.

````
Bigger headline, one button instead of three.

```yui
sketch "yuigui.com hero" frame=phone before=Before
row "Headline"
row "Button" +button +x
row "Button" +button +x
row "Button" +button +x note="three choices"
after Now
row "Headline, bigger" +hi note="larger type"
row "Get Yui" +button +hi note="the only button"
```
````
