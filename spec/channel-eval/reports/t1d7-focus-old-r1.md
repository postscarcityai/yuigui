# Channel eval: t1d7-focus-old-r1

Guide v41+365fd76d (4419 words), model claude-opus-5-5, 2026-09-30T01:04.

**4/4 passed (100%).**

| category | passed |
|---|---|
| show | 4/4 |

| case | result | why |
|---|---|---|
| showhere-before-after | pass |  |
| showhere-progress-page | pass |  |
| showhere-after-linkout | pass |  |
| showhere-demo | pass |  |

## Transcripts

### showhere-before-after (pass)

**Chris:** Show me the before and after of the hero on the site. (What you just looked up: the old hero is /demo/site_before_hero.jpg and the new one is /demo/site_after_hero.jpg. The change: a bigger headline and one button instead of three.)

Good: A compare of the two shots, or a sketch with after. One short line. Not a card that only says Open.

````
Bigger headline, one button instead of three.
```yui
compare /demo/site_before_hero.jpg /demo/site_after_hero.jpg
sketch "What changed" frame=phone before=Old
row "Headline" note="small"
row "Get started  Learn more  Contact" +button +x note="three buttons"
after New
row "HEADLINE" +hi note="bigger"
row "Get started" +button +hi note="one button"
```
````

### showhere-progress-page (pass)

**Chris:** What changed on the progress page? (What you just looked up: each entry now shows before and after shots, a Feedback tag links to the note, and the filter chips moved to the top. Shots: /demo/site_before_classes.jpg and /demo/site_after_classes.jpg. Page: https://www.yuigui.com/progress)

Good: The changes drawn here: a sketch with after, or a compare of the shots. At most a small link card under them. Not a card that only opens the page.

````
Three changes: before and after shots, Feedback tags, and filters on top.

```yui
compare /demo/site_before_classes.jpg /demo/site_after_classes.jpg
sketch "Progress page" frame=window before=Before
row "Entry: title and summary" note="no shots"
row "Filter chips" note="at the bottom"
after After
row "All  Shipped  Feedback" +button +hi note="filters on top"
row "Entry: before | after shots" +hi note="both shots"
row "Feedback" +button +hi note="links to the note"
card "Progress page" body="See it live" cta="Open" url=https://www.yuigui.com/progress
```
````

### showhere-after-linkout (pass)

**Chris:** Just show me here. (Shots: /demo/site_before_classes.jpg and /demo/site_after_classes.jpg.)

Good: A compare of the two shots in the thread. No second link-out card.

````
Classes page, before and after.
```yui
compare /demo/site_before_classes.jpg /demo/site_after_classes.jpg
choose "Ship the new classes page?" "Ship it"|"Needs changes"|"Keep the old one" +other
```
````

### showhere-demo (pass)

**Chris:** Can I see the reply cards demo? (What you just looked up: it is the /playground demo cards. It shows a card, a stat and a list. A card has a title, a body and one button. The stat shows a number with a small trend line.)

Good: The demo's parts drawn right here (a card sketch, a stat). Not a card that only links to /playground.

````
Here's the reply cards demo, with sample data.
```yui
card "Thursday session (example)" body="Dumbbell full body, 40 min, done before the 2 pm pickup" cta="Start"
stat 178.9lb "Weight (example)" delta=-2.3 spark=181.2|180.4|180|179.5|178.9
list "Today (example)" "Goblet squat 4x10" "DB bench 4x8" "Pull-ups 3x6" "Band row 3x12" +check
```
````
