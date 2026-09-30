# Channel eval: t1d7-link-old-r1

Guide v41+365fd76d (4419 words), model claude-opus-5-5, 2026-09-30T01:06.

**4/4 passed (100%).**

| category | passed |
|---|---|
| show | 4/4 |

| case | result | why |
|---|---|---|
| showlink-waiting-shots | pass |  |
| showlink-only-url | pass |  |
| showlink-build-changes | pass |  |
| showlink-demo-page | pass |  |

## Transcripts

### showlink-waiting-shots (pass)

**Chris:** What are you waiting on me for with this? (What you just looked up: the site refresh card needs your pick of before and after shots for the progress page, https://www.yuigui.com/progress. Old hero: one headline, three buttons. New hero: a bigger headline, one button. Shots on file: /demo/site_before_hero.jpg and /demo/site_after_hero.jpg.)

Good: The two shots in a compare, or a sketch with after, plus the one thing needed. Not a card that only says Open.

````
Your pick of the before and after shots for the progress page.

```yui
compare /demo/site_before_hero.jpg /demo/site_after_hero.jpg
choose "Use these two on the progress page?" "Use both"|"Different before"|"Different after"|"Take new shots" +other
```
````

### showlink-only-url (pass)

**Chris:** Where is the new hero? (What you just looked up: it is live on the site, https://www.yuigui.com/progress, in the Site refresh entry. Old hero: one headline and three buttons. New hero: a bigger headline and one button.)

Good: The change drawn: a sketch with before and after. At most one small link card under it.

````
It's live on the site, in the Site refresh entry on the progress page.
```yui
sketch "The hero" frame=phone before=Old
row "One headline" +x
row "Button 1" +button +x
row "Button 2" +button +x
row "Button 3" +button +x note="three choices"
after New
row "A bigger headline" +hi note="bigger"
row "One button" +button +hi note="one clear action"
card "Site refresh" body="The new hero, live on yuigui.com/progress" cta="Open the page" url=https://www.yuigui.com/progress
```
````

### showlink-build-changes (pass)

**Chris:** What changed in the last build? (What you just looked up: build 332 opens a notification on page one, the mic stays on the last page, and a reply quotes the screen. Full notes: https://www.yuigui.com/progress)

Good: The three changes shown here (a list, timeline or sketch). The link, if any, is a small follow-up.

````
Build 332: three fixes to where things land.

```yui
card "Build 332" body="Notifications open on page one, the mic stays put, replies quote the screen" cta="Full notes" url=https://www.yuigui.com/progress
deck "What's in build 332" +inline
page "Notifications open on page one" body="Tapping a notification starts the answer at its first page, not partway in."
sketch frame=phone before=Before
row "Page 3 of 4" +x note="opened mid-answer"
after After
row "Page 1 of 4" +hi note="starts at the top"
page "The mic stays on the last page" body="Reaching the end of an answer keeps the mic ready, so a spoken reply is one tap."
sketch frame=phone
row "Last page"
row "Mic" +button +hi note="still there"
page "Replies quote the screen" body="Replying to a screen carries a quote of it, so the answer ties to what was shown."
sketch frame=bubble
row "Replying to: Leg day plan" +hi note="the screen, quoted"
row "Swap squats for lunges"
choose "What next?" "Open TestFlight"|"Try a reply"|"Why do you ask?" +other
end
```
````

### showlink-demo-page (pass)

**Chris:** Is there a demo of the compare card? (What you just looked up: yes, https://www.yuigui.com/playground?demo=show-here. It shows a slider between a before and an after shot, with Side and Toggle modes. Shots: /demo/before_room.jpg and /demo/after_room.jpg.)

Good: The demo itself: a compare of the two shots. Not a card that only links to the playground.

````
Yes, a before/after room with a slider, plus Side and Toggle modes.
```yui
compare https://www.yuigui.com/demo/before_room.jpg https://www.yuigui.com/demo/after_room.jpg
card "Compare demo" body="Slider, Side and Toggle modes" cta="Open playground" url=https://www.yuigui.com/playground?demo=show-here
```
````
