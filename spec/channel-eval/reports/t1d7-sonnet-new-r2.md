# Channel eval: t1d7-sonnet-new-r2

Guide v42+fb0f7a60 (4552 words), model claude-sonnet-5-5, 2026-09-30T01:07.

**10/10 passed (100%).**

| category | passed |
|---|---|
| show | 10/10 |

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
| showlean-new-hero | pass |  |

## Transcripts

### showhere-before-after (pass)

**Chris:** Show me the before and after of the hero on the site. (What you just looked up: the old hero is /demo/site_before_hero.jpg and the new one is /demo/site_after_hero.jpg. The change: a bigger headline and one button instead of three.)

Good: A compare of the two shots, or a sketch with after. One short line. Not a card that only says Open.

````
Bigger headline, one button instead of three.

```yui
compare /demo/site_before_hero.jpg /demo/site_after_hero.jpg "Hero"
```
````

### showhere-progress-page (pass)

**Chris:** What changed on the progress page? (What you just looked up: each entry now shows before and after shots, a Feedback tag links to the note, and the filter chips moved to the top. Shots: /demo/site_before_classes.jpg and /demo/site_after_classes.jpg. Page: https://www.yuigui.com/progress)

Good: The changes drawn here: a sketch with after, or a compare of the shots. At most a small link card under them. Not a card that only opens the page.

````
Three changes: before/after shots on each entry, a Feedback tag, and filter chips at the top.

```yui
sketch "Progress page" frame=window
row "Filters: All|Shipped|Feedback" +hi note="chips now at top"
row "Classes page update" +hi note="each entry"
row "Before and after shots" +hi note="on every entry"
row "Feedback" +button note="links to the note"
compare /demo/site_before_classes.jpg /demo/site_after_classes.jpg "Classes page"
card "Live page" body="yuigui.com/progress" cta="Open" url=https://www.yuigui.com/progress
```
````

### showhere-after-linkout (pass)

**Chris:** Just show me here. (Shots: /demo/site_before_classes.jpg and /demo/site_after_classes.jpg.)

Good: A compare of the two shots in the thread. No second link-out card.

````
Here they are, side by side.

```yui
compare /demo/site_before_classes.jpg /demo/site_after_classes.jpg "Classes page"
```
````

### showhere-demo (pass)

**Chris:** Can I see the reply cards demo? (What you just looked up: it is the /playground demo cards. It shows a card, a stat and a list. A card has a title, a body and one button. The stat shows a number with a small trend line.)

Good: The demo's parts drawn right here (a card sketch, a stat). Not a card that only links to /playground.

````
Here's the demo set: a card, a stat and a list, all sample data.

```yui
card "Example card" body="A title, a short body and one button." cta="Tap me"
stat 178.9lb "Example stat" delta=-2.3 spark=181|180|178.9
list "Example list" "Squat 5x5" "Bench 5x5" "Rows 3x10" +check
```
````

### showlink-waiting-shots (pass)

**Chris:** What are you waiting on me for with this? (What you just looked up: the site refresh card needs your pick of before and after shots for the progress page, https://www.yuigui.com/progress. Old hero: one headline, three buttons. New hero: a bigger headline, one button. Shots on file: /demo/site_before_hero.jpg and /demo/site_after_hero.jpg.)

Good: The two shots in a compare, or a sketch with after, plus the one thing needed. Not a card that only says Open.

````
Only your pick of the shots for the progress page. These two are on file.

```yui
compare /demo/site_before_hero.jpg /demo/site_after_hero.jpg "Hero: before and after"
choose "Use these two?" "Use these"|"Pick others" +other
```
````

### showlink-only-url (pass)

**Chris:** Where is the new hero? (What you just looked up: it is live on the site, https://www.yuigui.com/progress, in the Site refresh entry. Old hero: one headline and three buttons. New hero: a bigger headline and one button.)

Good: The change drawn: a sketch with before and after. At most one small link card under it.

````
It's live on the progress page, in the Site refresh entry.

```yui
sketch "Hero" frame=window
row "Headline" +x note="old, smaller"
row "Button 1" +button +x
row "Button 2" +button +x
row "Button 3" +button +x
after
row "Bigger headline" +hi note="new"
row "One button" +button +hi note="only one"
card "Site refresh" body="On the progress page" cta="Open" url=https://www.yuigui.com/progress
```
````

### showlink-build-changes (pass)

**Chris:** What changed in the last build? (What you just looked up: build 332 opens a notification on page one, the mic stays on the last page, and a reply quotes the screen. Full notes: https://www.yuigui.com/progress)

Good: The three changes shown here (a list, timeline or sketch). The link, if any, is a small follow-up.

````
Build 332 has three changes.

```yui
list "Build 332" "Notifications: open on page one" "Mic: stays on the last page" "Replies: quote the screen"
card "Full notes" body="Everything in build 332" cta="Open" url=https://www.yuigui.com/progress
```
````

### showlink-demo-page (pass)

**Chris:** Is there a demo of the compare card? (What you just looked up: yes, https://www.yuigui.com/playground?demo=show-here. It shows a slider between a before and an after shot, with Side and Toggle modes. Shots: /demo/before_room.jpg and /demo/after_room.jpg.)

Good: The demo itself: a compare of the two shots. Not a card that only links to the playground.

````
Yes. Here it is, right in the thread.

```yui
compare /demo/before_room.jpg /demo/after_room.jpg "Room, before and after"
card "Full playground" body="Side and Toggle modes" cta="Open" url=https://www.yuigui.com/playground?demo=show-here
```
````

### showlean-waiting (pass)

**Chris:** What are you waiting on me for with this? (What you just looked up: the site refresh card is done except before and after shots of the hero for the progress page. Page: https://www.yuigui.com/progress. Nothing else is open.)

Good: The ask drawn here (a sketch with the missing before and after slot, or a camera to snap it). At most a small link under it.

````
Just one open piece, the hero before and after shots.

```yui
sketch "Site refresh" frame=window
row "Card: done"
row "Hero before/after shots: missing" +hi note="progress page"
row "Everything else: nothing open"
```
````

### showlean-new-hero (pass)

**Chris:** What does the new hero look like? (What you just looked up: it is on https://www.yuigui.com, top of the page. It has a bigger headline and one button, Get Yui, where there were three buttons.)

Good: The hero drawn in a sketch phone, before and after. At most a small link under it.

````
Here's the hero, drawn from what I found. I don't have the exact headline wording or the old button labels, so those rows are placeholders.

```yui
sketch "yuigui.com hero" frame=window
row "Headline (smaller)" +x note="before"
row "Button 1" +button +x
row "Button 2" +button +x
row "Button 3" +button +x
after
row "Headline (bigger)" +hi note="larger type"
row "Get Yui" +button +hi note="the only button"
```
````
