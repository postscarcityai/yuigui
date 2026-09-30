# Channel eval: t1d7-link-old-r2

Guide v41+365fd76d (4419 words), model claude-opus-5-5, 2026-09-30T01:06.

**3/4 passed (75%).**

| category | passed |
|---|---|
| show | 3/4 |

| case | result | why |
|---|---|---|
| showlink-waiting-shots | pass |  |
| showlink-only-url | pass |  |
| showlink-build-changes | pass |  |
| showlink-demo-page | FAIL | need: none of [compare gallery image]; show here: a link-out card is the whole answer :: card "Compare demo" body="Before and after room shots, slider plus Side and Togg; show here: nothing drawn in the thread |

## Transcripts

### showlink-waiting-shots (pass)

**Chris:** What are you waiting on me for with this? (What you just looked up: the site refresh card needs your pick of before and after shots for the progress page, https://www.yuigui.com/progress. Old hero: one headline, three buttons. New hero: a bigger headline, one button. Shots on file: /demo/site_before_hero.jpg and /demo/site_after_hero.jpg.)

Good: The two shots in a compare, or a sketch with after, plus the one thing needed. Not a card that only says Open.

````
Your pick of the before and after shots for the progress page.
```yui
compare /demo/site_before_hero.jpg /demo/site_after_hero.jpg
choose "Use these on the progress page?" "Use both"|"Retake before"|"Retake after" +other
```
````

### showlink-only-url (pass)

**Chris:** Where is the new hero? (What you just looked up: it is live on the site, https://www.yuigui.com/progress, in the Site refresh entry. Old hero: one headline and three buttons. New hero: a bigger headline and one button.)

Good: The change drawn: a sketch with before and after. At most one small link card under it.

````
It's live now, in the Site refresh entry on the progress page.

```yui
card "Site refresh" body="The new hero is live on yuigui.com/progress" cta="Open the page" url=https://www.yuigui.com/progress
sketch "The hero" frame=phone before=Old
row "Headline" +x
row "Button" +button +x
row "Button" +button +x
row "Button" +button +x note="three buttons"
after New
row "Bigger headline" +hi note="bigger"
row "One button" +button +hi note="one button"
```
````

### showlink-build-changes (pass)

**Chris:** What changed in the last build? (What you just looked up: build 332 opens a notification on page one, the mic stays on the last page, and a reply quotes the screen. Full notes: https://www.yuigui.com/progress)

Good: The three changes shown here (a list, timeline or sketch). The link, if any, is a small follow-up.

````
Build 332 has three fixes.
```yui
card "Build 332" body="Notifications open on page one, the mic stays put, replies quote the screen" cta="Full notes" url=https://www.yuigui.com/progress
deck "What's in build 332" +inline
page "Notifications land on page one" body="Tapping a notification opens the first page of the answer, not the middle."
sketch frame=phone before=Before
row "Page 3 of 4" +x note="opened mid-answer"
after After
row "Page 1 of 4" +hi note="starts at the top"
page "The mic stays on the last page" body="Reaching the last page no longer drops the mic, so talking back is one tap."
sketch frame=phone
row "Last page" 
row "Mic" +button +hi note="still there"
page "Replies quote the screen" body="Replying to an answer now quotes the screen it was on, so the context travels with it."
sketch frame=bubble
row "Re: Build 332 card" +hi note="the screen, quoted"
row "Looks good, ship it"
choose "What next?" "Try the notification fix"|"Test the mic"|"Why do you ask?" +other
end
```
````

### showlink-demo-page (FAIL)

**Chris:** Is there a demo of the compare card? (What you just looked up: yes, https://www.yuigui.com/playground?demo=show-here. It shows a slider between a before and an after shot, with Side and Toggle modes. Shots: /demo/before_room.jpg and /demo/after_room.jpg.)

Good: The demo itself: a compare of the two shots. Not a card that only links to the playground.

- need: none of [compare gallery image]
- show here: a link-out card is the whole answer :: card "Compare demo" body="Before and after room shots, slider plus Side and Togg
- show here: nothing drawn in the thread

````
Yes. The playground demo has a before/after slider, with Side and Toggle modes.

```yui
card "Compare demo" body="Before and after room shots, slider plus Side and Toggle modes" cta="Open demo" url=https://www.yuigui.com/playground?demo=show-here
```
````
