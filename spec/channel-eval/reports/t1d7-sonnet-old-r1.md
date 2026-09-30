# Channel eval: t1d7-sonnet-old-r1

Guide v41+365fd76d (4419 words), model claude-sonnet-5-5, 2026-09-30T01:07.

**9/10 passed (90%).**

| category | passed |
|---|---|
| show | 9/10 |

| case | result | why |
|---|---|---|
| showhere-before-after | pass |  |
| showhere-progress-page | pass |  |
| showhere-after-linkout | pass |  |
| showhere-demo | pass |  |
| showlink-waiting-shots | pass |  |
| showlink-only-url | pass |  |
| showlink-build-changes | pass |  |
| showlink-demo-page | pass |  |
| showlean-waiting | pass |  |
| showlean-new-hero | FAIL | words: 39 > 25 |

## Transcripts

### showhere-before-after (pass)

**Chris:** Show me the before and after of the hero on the site. (What you just looked up: the old hero is /demo/site_before_hero.jpg and the new one is /demo/site_after_hero.jpg. The change: a bigger headline and one button instead of three.)

Good: A compare of the two shots, or a sketch with after. One short line. Not a card that only says Open.

````
Bigger headline, one button instead of three.

```yui
compare /demo/site_before_hero.jpg /demo/site_after_hero.jpg
```
````

### showhere-progress-page (pass)

**Chris:** What changed on the progress page? (What you just looked up: each entry now shows before and after shots, a Feedback tag links to the note, and the filter chips moved to the top. Shots: /demo/site_before_classes.jpg and /demo/site_after_classes.jpg. Page: https://www.yuigui.com/progress)

Good: The changes drawn here: a sketch with after, or a compare of the shots. At most a small link card under them. Not a card that only opens the page.

````
Three changes: before/after shots, a Feedback tag, and filters on top.

```yui
compare /demo/site_before_classes.jpg /demo/site_after_classes.jpg
sketch "Progress page" frame=window
row "Filter chips at the bottom" +x note="moved"
row "Entry text only" +x note="no shots"
after
row "Filter chips" +hi note="now at the top"
row "Before and after shots" +hi note="on each entry"
row "Feedback" +button note="links to the note"
card "Progress page" body="See it live" cta="Open" url=https://www.yuigui.com/progress
```
````

### showhere-after-linkout (pass)

**Chris:** Just show me here. (Shots: /demo/site_before_classes.jpg and /demo/site_after_classes.jpg.)

Good: A compare of the two shots in the thread. No second link-out card.

````
Here they are, side by side.
```yui
compare /demo/site_before_classes.jpg /demo/site_after_classes.jpg
```
````

### showhere-demo (pass)

**Chris:** Can I see the reply cards demo? (What you just looked up: it is the /playground demo cards. It shows a card, a stat and a list. A card has a title, a body and one button. The stat shows a number with a small trend line.)

Good: The demo's parts drawn right here (a card sketch, a stat). Not a card that only links to /playground.

````
Here are the three demo pieces. All the values are made-up examples.

```yui
card "Example card" body="A title, a body and one button." cta="Try the button"
stat 178.9lb "Example stat" delta=-2.3 spark=181|180|178.9
list "Example list" "Squat 5x5" "Bench 5x5" "Row 4x10" +check
```
````

### showlink-waiting-shots (pass)

**Chris:** What are you waiting on me for with this? (What you just looked up: the site refresh card needs your pick of before and after shots for the progress page, https://www.yuigui.com/progress. Old hero: one headline, three buttons. New hero: a bigger headline, one button. Shots on file: /demo/site_before_hero.jpg and /demo/site_after_hero.jpg.)

Good: The two shots in a compare, or a sketch with after, plus the one thing needed. Not a card that only says Open.

````
Only one thing: which before and after shots go on the progress page. One pair is on file.

```yui
sketch "Hero shots" frame=window
row "Old: one headline, three buttons" +x note="site_before_hero"
after
row "New: bigger headline, one button" +hi note="site_after_hero"
choose "Use this pair?" "Use this pair"|"Pick others"
```
````

### showlink-only-url (pass)

**Chris:** Where is the new hero? (What you just looked up: it is live on the site, https://www.yuigui.com/progress, in the Site refresh entry. Old hero: one headline and three buttons. New hero: a bigger headline and one button.)

Good: The change drawn: a sketch with before and after. At most one small link card under it.

````
The new hero is live on the progress page, in the Site refresh entry.

```yui
card "Site refresh" body="yuigui.com/progress" cta="Open the page" url=https://www.yuigui.com/progress
sketch "Hero" frame=window
row "One headline" +x note="old"
row "Button 1" +button +x
row "Button 2" +button +x
row "Button 3" +button +x
after
row "Bigger headline" +hi note="new"
row "One button" +button +hi
```
````

### showlink-build-changes (pass)

**Chris:** What changed in the last build? (What you just looked up: build 332 opens a notification on page one, the mic stays on the last page, and a reply quotes the screen. Full notes: https://www.yuigui.com/progress)

Good: The three changes shown here (a list, timeline or sketch). The link, if any, is a small follow-up.

````
Build 332 has three changes.

```yui
list "Build 332" "Notification: opens on page one" "Mic: stays on the last page" "Reply: quotes the screen"
card "Full notes" body="Everything in build 332" cta="Open progress" url=https://www.yuigui.com/progress
```
````

### showlink-demo-page (pass)

**Chris:** Is there a demo of the compare card? (What you just looked up: yes, https://www.yuigui.com/playground?demo=show-here. It shows a slider between a before and an after shot, with Side and Toggle modes. Shots: /demo/before_room.jpg and /demo/after_room.jpg.)

Good: The demo itself: a compare of the two shots. Not a card that only links to the playground.

````
Yes, and here it is live, using the same two room shots.

```yui
compare https://www.yuigui.com/demo/before_room.jpg https://www.yuigui.com/demo/after_room.jpg
card "Compare demo" body="Slider between before and after, with Side and Toggle modes" cta="Open playground" url=https://www.yuigui.com/playground?demo=show-here
```
````

### showlean-waiting (pass)

**Chris:** What are you waiting on me for with this? (What you just looked up: the site refresh card is done except before and after shots of the hero for the progress page. Page: https://www.yuigui.com/progress. Nothing else is open.)

Good: The ask drawn here (a sketch with the missing before and after slot, or a camera to snap it). At most a small link under it.

````
Only the hero before and after shots for the progress page.

```yui
sketch "Site refresh" frame=window
row "Card: done"
row "Hero before/after: missing" +hi note="for progress page"
row "Anything else: nothing open"
```

```yui
choose "How do you want to handle the shots?" "I'll send them"|"You grab them"|"Skip for now"
```
````

### showlean-new-hero (FAIL)

**Chris:** What does the new hero look like? (What you just looked up: it is on https://www.yuigui.com, top of the page. It has a bigger headline and one button, Get Yui, where there were three buttons.)

Good: The hero drawn in a sketch phone, before and after. At most a small link under it.

- words: 39 > 25

````
Drawn from your description, so the wording is a stand-in.

```yui
sketch "yuigui.com hero" frame=window before=Before
row "Headline" 
row "Button 1" +button
row "Button 2" +button
row "Button 3" +button +x note="three choices"
after After
row "Bigger headline" +hi note="larger type"
row "Get Yui" +button +hi note="the only button"
```

I don't have the headline's actual text or the old button labels, so those rows are placeholders. Send me the wording, or a screenshot, and I'll redraw it exactly.
````
