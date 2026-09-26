# Channel eval: v22-page-picture

Guide v22+d24d1f04 (2236 words), model claude-opus-5-5, 2026-09-26T08:35.

**0/1 passed (0%).**

| category | passed |
|---|---|
| report | 0/1 |

| case | result | why |
|---|---|---|
| report-pages-picture | FAIL | need: none of [deck plan]; page picture: no sketch right after a page in a deck or plan |

## Transcripts

### report-pages-picture (FAIL)

**Chris:** Walk me through the three changes to how you write updates to me this week, one at a time: you name cards in plain words instead of ids like YUI-83, a long update comes as pages instead of a wall of text, and cards no longer end in a 'Got it' button that does nothing. For each one, show me what it looked like before and after.

Good: One short line and a deck of three pages, one change each, and each page's picture a sketch right after it: the old wording or button struck out (+x), the new one highlighted (+hi), ideally split with `after`. No paragraph.

- need: none of [deck plan]
- page picture: no sketch right after a page in a deck or plan

````
Three changes this week, before and after:

```yui
sketch "1. Plain names, not ids" frame=bubble
row "Parked YUI-83 in the backlog" +x note="an id means nothing to you"
after
row "Parked the drawing card in the backlog" +hi note="says what it is"
sketch "2. Pages, not a wall" frame=phone
row "Build 82 is ready. Latest change: A2A bridge: add any A2A agent by its Agent Card. node yui-a2a.ts pair ... Tests: client 42/42, interop 4/4, e2e 66/66 ..." +x note="one long bubble to dig through"
after
row "Build 82 is ready." +hi note="one short line"
row "Card: Add any A2A agent" +button
row "Page: A2A agents"
row "Page: Tested · 42/42 · 4/4 · 66/66" note="one idea per page, counts as points"
sketch "3. No dead buttons" frame=phone
row "Card: Workout logged"
row "Got it" +button +x note="tapping it did nothing"
after
row "Card: Workout logged" +hi
row "Plan tomorrow" +button note="a button only when it does something"
```
````
