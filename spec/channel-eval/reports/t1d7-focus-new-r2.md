# Channel eval: t1d7-focus-new-r2

Guide v42+fb0f7a60 (4552 words), model claude-opus-5-5, 2026-09-30T01:04.

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
compare /demo/site_before_hero.jpg /demo/site_after_hero.jpg "Hero"
sketch "Hero" frame=phone
row "Headline" note="small"
row "Start  |  Learn more  |  Contact" +button +x note="three buttons"
after
row "HEADLINE" +hi note="bigger"
row "Start" +button +hi note="one button"
```
````

### showhere-progress-page (pass)

**Chris:** What changed on the progress page? (What you just looked up: each entry now shows before and after shots, a Feedback tag links to the note, and the filter chips moved to the top. Shots: /demo/site_before_classes.jpg and /demo/site_after_classes.jpg. Page: https://www.yuigui.com/progress)

Good: The changes drawn here: a sketch with after, or a compare of the shots. At most a small link card under them. Not a card that only opens the page.

````
Three changes: shots on each entry, Feedback tags, chips on top.

```yui
compare /demo/site_before_classes.jpg /demo/site_after_classes.jpg "Classes entry"
sketch "Progress page" frame=phone
row "Classes page redesign" +x note="text only"
row "Filter: All  Site  App" +button +x note="chips at the bottom"
after
row "All  Site  App" +button +hi note="chips on top"
row "Classes page redesign  [before | after]" +hi note="shots on each entry"
row "Feedback" +button +hi note="opens the note"
card "Progress page" body="See it live" cta="Open" url=https://www.yuigui.com/progress
```
````

### showhere-after-linkout (pass)

**Chris:** Just show me here. (Shots: /demo/site_before_classes.jpg and /demo/site_after_classes.jpg.)

Good: A compare of the two shots in the thread. No second link-out card.

````
Here's the classes page, before and after.
```yui
compare /demo/site_before_classes.jpg /demo/site_after_classes.jpg "Classes page"
choose "Ship the new classes page?" "Ship it"|"Needs changes" +other
```
````

### showhere-demo (pass)

**Chris:** Can I see the reply cards demo? (What you just looked up: it is the /playground demo cards. It shows a card, a stat and a list. A card has a title, a body and one button. The stat shows a number with a small trend line.)

Good: The demo's parts drawn right here (a card sketch, a stat). Not a card that only links to /playground.

````
Here's the demo, with sample content.
```yui
card "Example: Thursday session" body="Upper body, 40 min, dumbbells and bench" cta="Start"
stat 178.9lb "Example: Weight" delta=-2.3 spark=181|180.2|179.5|178.9
list "Example: Today" "DB bench 4x8" "One-arm row 4x10" "Pull-ups 3x8" +check
choose "What next?" "Use these for real"|"See other parts"|"Why do you ask?" +other
```
````
