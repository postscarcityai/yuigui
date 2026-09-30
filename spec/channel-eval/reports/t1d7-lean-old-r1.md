# Channel eval: t1d7-lean-old-r1

Guide v41+365fd76d (4419 words), model claude-opus-5-5, 2026-09-30T01:07.

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
Just the before and after shots of the hero for the progress page. Everything else on the site refresh is done.

```yui
sketch "Site refresh" frame=window
row "Refresh: done"
row "Hero before/after shots: open" +hi note="for /progress"
choose "The hero shots?" "You capture them"|"I'll send them"|"Skip the shots" +other
```
````

### showlean-new-hero (pass)

**Chris:** What does the new hero look like? (What you just looked up: it is on https://www.yuigui.com, top of the page. It has a bigger headline and one button, Get Yui, where there were three buttons.)

Good: The hero drawn in a sketch phone, before and after. At most a small link under it.

````
Bigger headline, one button.
```yui
sketch "yuigui.com hero" frame=phone before=Was
row "Headline" note="smaller"
row "Button 1   Button 2   Button 3" +button +x note="three choices"
after Now
row "Headline" +hi note="bigger"
row "Get Yui" +button +hi note="one button"
```
```yui
card "yuigui.com" body="The new hero is at the top of the page" cta="Open site" url=https://www.yuigui.com
```
````
