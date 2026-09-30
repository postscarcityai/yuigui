# Channel eval: t1d7-focus-new-r1

Guide v42+fb0f7a60 (4552 words), model claude-opus-5-5, 2026-09-30T01:04.

**3/4 passed (75%).**

| category | passed |
|---|---|
| show | 3/4 |

| case | result | why |
|---|---|---|
| showhere-before-after | pass |  |
| showhere-progress-page | pass |  |
| showhere-after-linkout | FAIL | screen: no ```yui block; fence: Yui Lines outside the ```yui block; need: none of [compare gallery image sketch]; show here: nothing drawn in the thread |
| showhere-demo | pass |  |

## Transcripts

### showhere-before-after (pass)

**Chris:** Show me the before and after of the hero on the site. (What you just looked up: the old hero is /demo/site_before_hero.jpg and the new one is /demo/site_after_hero.jpg. The change: a bigger headline and one button instead of three.)

Good: A compare of the two shots, or a sketch with after. One short line. Not a card that only says Open.

````
Bigger headline, one button instead of three.
```yui
compare /demo/site_before_hero.jpg /demo/site_after_hero.jpg "Hero"
sketch "The change" frame=phone before=Old
row "Headline" note="small"
row "Start" +button +x
row "Pricing" +button +x
row "Demo" +button +x note="three competing"
after New
row "Headline" +hi note="bigger"
row "Start" +button +hi note="one clear ask"
```
````

### showhere-progress-page (pass)

**Chris:** What changed on the progress page? (What you just looked up: each entry now shows before and after shots, a Feedback tag links to the note, and the filter chips moved to the top. Shots: /demo/site_before_classes.jpg and /demo/site_after_classes.jpg. Page: https://www.yuigui.com/progress)

Good: The changes drawn here: a sketch with after, or a compare of the shots. At most a small link card under them. Not a card that only opens the page.

````
Three changes: shots on every entry, a Feedback tag, and filters on top.

```yui
compare /demo/site_before_classes.jpg /demo/site_after_classes.jpg "Classes entry"
sketch "Progress page" frame=phone before=Before
row "Entry: text only" +x note="no shots"
row "Filter chips" +button +x note="at the bottom"
after After
row "All  Shipped  Feedback" +button +hi note="chips moved to top"
row "Entry: before and after shots" +hi note="every entry"
row "Feedback" +button +hi note="links to the note"
card "Progress page" body="See it live" cta="Open" url=https://www.yuigui.com/progress
```
````

### showhere-after-linkout (FAIL)

**Chris:** Just show me here. (Shots: /demo/site_before_classes.jpg and /demo/site_after_classes.jpg.)

Good: A compare of the two shots in the thread. No second link-out card.

- screen: no ```yui block
- fence: Yui Lines outside the ```yui block
- need: none of [compare gallery image sketch]
- show here: nothing drawn in the thread

````
````
Classes page, before and after.
```yui
compare /demo/site_before_classes.jpg /demo/site_after_classes.jpg "Classes page"
choose "Ship the new one?" "Ship it"|"Keep the old"|"Needs changes" +other
```
````
````

### showhere-demo (pass)

**Chris:** Can I see the reply cards demo? (What you just looked up: it is the /playground demo cards. It shows a card, a stat and a list. A card has a title, a body and one button. The stat shows a number with a small trend line.)

Good: The demo's parts drawn right here (a card sketch, a stat). Not a card that only links to /playground.

````
Here are the reply cards, with sample content:

```yui
card "Leg day" body="5 moves, about 40 min" cta="Start"
stat 178.9lb "Weight (example)" delta=-2.3 spark=182|181|180.2|179.5|178.9
list "Today (example)" "Goblet squat 4x10" "DB Romanian deadlift 3x10" "Split squat 3x8" "Calf raise 3x15" +check
```
````
