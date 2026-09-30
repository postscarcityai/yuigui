# Channel eval: t1d7-link-new-r2

Guide v42+fb0f7a60 (4552 words), model claude-opus-5-5, 2026-09-30T01:06.

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
compare /demo/site_before_hero.jpg /demo/site_after_hero.jpg "Hero: three buttons → one"
choose "Use these on the progress page?" "Use both"|"Retake before"|"Retake after" +other
```
````

### showlink-only-url (pass)

**Chris:** Where is the new hero? (What you just looked up: it is live on the site, https://www.yuigui.com/progress, in the Site refresh entry. Old hero: one headline and three buttons. New hero: a bigger headline and one button.)

Good: The change drawn: a sketch with before and after. At most one small link card under it.

````
It's live, in the Site refresh entry on the progress page.
```yui
sketch "Site hero" frame=phone before=Old
row "Headline" +x
row "Button" +button +x
row "Button" +button +x
row "Button" +button +x note="three buttons"
after New
row "Bigger headline" +hi note="bigger"
row "One button" +button +hi note="one call to act"
card "Progress page" body="Site refresh entry" cta="Open" url=https://www.yuigui.com/progress
```
````

### showlink-build-changes (pass)

**Chris:** What changed in the last build? (What you just looked up: build 332 opens a notification on page one, the mic stays on the last page, and a reply quotes the screen. Full notes: https://www.yuigui.com/progress)

Good: The three changes shown here (a list, timeline or sketch). The link, if any, is a small follow-up.

````
Build 332: three fixes for reading answers.

```yui
card "Build 332" body="Notifications open on page one, the mic stays, replies quote the screen" cta="Full notes" url=https://www.yuigui.com/progress
deck "What's in build 332" +inline
page "Notifications start at the top" body="Tapping a notification opens the answer on page one."
sketch frame=phone
row "New reply from Yui" +button
row "Page 1 of 3" +hi note="opens here"
page "The mic stays on the last page" body="Reaching the end of an answer keeps the mic ready to talk back."
sketch frame=phone
row "Page 3 of 3"
row "Mic" +button +hi note="stays put"
page "Replies quote the screen" body="A reply carries the screen it answers."
sketch frame=bubble
row "Replying to: Page 2, the plan" +hi note="quotes the screen"
row "Swap Thursday for Friday"
choose "What next?" "Try it now"|"What's next on the board?"|"Why do you ask?" +other
end
```
````

### showlink-demo-page (pass)

**Chris:** Is there a demo of the compare card? (What you just looked up: yes, https://www.yuigui.com/playground?demo=show-here. It shows a slider between a before and an after shot, with Side and Toggle modes. Shots: /demo/before_room.jpg and /demo/after_room.jpg.)

Good: The demo itself: a compare of the two shots. Not a card that only links to the playground.

````
Yes, here it is: drag the slider, or switch to Side or Toggle.

```yui
compare /demo/before_room.jpg /demo/after_room.jpg "Room makeover" note="example"
card "Compare demo" body="Same card in the playground" cta="Open" url=https://www.yuigui.com/playground?demo=show-here
```
````
