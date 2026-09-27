# Brag plan: built in public (06)

## Angle

Yui is built where anyone can watch. Follow one real change the whole way: a note from the feedback button becomes a card on the public board, an agent builds it, it ships in the next TestFlight build, and the log, the timeline and the backlog are all open. The example is Chris's note from Sep 26, "my query was lost", which shipped as "What you were typing stays put" in build 160 (Yui 0.3.1) the same day.

Layout: words on the left, the screen on the right (landscape). The site pages are drawn as plain HTML in a desktop browser window, filled from the site's JSON by `data.py`. The phone (kit) carries the in-app moments. The reel stacks both lines above the screen and draws each page at 1.3x so it reads on a phone; its board scrolls sideways like the real site does on a phone.

## Facts and numbers (snapshot Sep 26, 2026)

| On screen | Value | Source |
|---|---|---|
| commits | 618 | `site/content/timeline.json` totals: app 177 + site 441 |
| TestFlight builds | 35 | `site/content/builds.json` (35 builds, first build 4 on Sep 23, newest 176 on Sep 26) |
| changes shipped | 233 | `site/content/progress.json` (233 ship log entries) |
| 4 days, Sep 23 to Sep 26 | first build to alpha | build 4 on Sep 23 (`builds.json`); alpha on Sep 26 (MVP done, 21 of 22 MVP cards) |
| The note | "I was writing in the text box and then a new answer came in and took over the screen with a full screen. But then when I came back my query was lost." Chris, Sep 26 | `progress.json`, entry "What you were typing stays put" |
| Feedback becomes a card | TestFlight feedback becomes a board card every 10 minutes | `spec/ADMIN.md` |
| /board | eyebrow, title, "Agents pick cards up and move them along; this page follows on its own.", columns Backlog, Up next, Building, Shipped (last 30 days), real tiles in board order | `site/app/board/page.js`, `site/content/board.json` |
| Shipped Sep 26 | the note's ship date | `progress.json` |
| /changelog, Build 160, Yui 0.3.1, Sep 26 | the other change lines are real | `builds.json`, `showcase.json` (Yui 0.3.1 is build 160) |
| The two screenshots | `fb-ak9fnezu-3-back.webp`, `fb-ak9fnezu-4-relaunch.webp` | `site/public/progress/` |
| Build 176, Yui 0.3.2 | scrolled past | `builds.json`, `board.json` release |
| /timeline counters | climb through timeline.json's real running totals for 30 of its 171 shipped screenshots (oldest first), then land on 177, 441, 35, 233 | `timeline.json`, `builds.json`, `progress.json` |
| /contribute | "Lend your agent to Yui.", the lede sentence, "A person reviews every pull request. Nothing merges on its own." | `site/app/contribute/page.js` |
| OSS-8 | "A Yui Lines parser in Go", size M, its two test commands, claimed Sep 26 by a draft pull request | `site/content/backlog.json` |

## Storyboard (92 BPM with swing, a bar is 2.61 s, 23 bars is 60 s; cuts on bars)

| Time | Bars | Scene | Left | Right |
|---|---|---|---|---|
| 0 to 5.2 | 0 to 2 | Hook: 618 commits, 35 TestFlight builds, 233 changes shipped count up, then 4 days, Sep 23 to Sep 26 | Yui went from first build to alpha in 4 days. | All of it in public. |
| 5.2 to 10.4 | 2 to 4 | The phone: the Wizard thread, a screenshot flash, the feedback sheet, Chris's note typed in, Send | A note from the feedback button | |
| 10.4 to 15.7 | 4 to 6 | yuigui.com/board: the note drops into Up next as "What you were typing stays put" | | becomes a card on the board. |
| 15.7 to 26.1 | 6 to 10 | The card moves to Building ("Agents pick cards up and move them along" lights up), then to Shipped: "Shipped Sep 26" | An agent builds it. | You can watch it move. |
| 26.1 to 36.5 | 10 to 14 | yuigui.com/changelog scrolls to Build 160, Yui 0.3.1, Sep 26; the line lights up above its two screenshots. Then the phone: a draft is typed, a Tabata full screen takes over, it closes, the words are still there | It ships in the next build. | The log says what changed. |
| 36.5 to 47.0 | 14 to 18 | yuigui.com/timeline, "Watch Yui grow.": shipped screenshots scroll by, the counters climb with them | The whole history is public. | Every commit, every build. |
| 47.0 to 52.2 | 18 to 20 | yuigui.com/contribute, "Lend your agent to Yui.": OSS-8 goes from Open to Claimed, the draft pull request [OSS-8], the review rule lights up | Your agent can help build it. | A person reviews every change. |
| 52.2 to 60 | 20 to 23 | Outro: Built in public. yuigui.com/board. Follow along: the board, the log, the builds. | | |

## Sound

`music.py`: Song(92 BPM, 23 bars, swing 45), C, Am7, Fmaj7, G. Levels follow the energy: 2 for the hook, 3 for the board, 4 with a lead motif for building and shipping, 3 for the timeline, 2 for contribute, 1 for the outro, which resolves F, G, C with a bell. Crashes on the cuts at bars 2, 6, 10, 14 and 20, swells into 6 and 10. The only effects are the three taps you see (Send, the composer, the close button), read from the comp's `window.SCORE`.

## Where the picture is drawn, not captured (say so, or fix the source)

- **Build 160's list.** The video shows the ship log title "What you were typing stays put" (key Feedback) with its two screenshots. On the live /changelog that line is plain text, "Half-typed words stay: each agent's thread keeps its own draft (feedback AK-9fNEZU)", because the app commit carries no card key, and the screenshots under build 160 are YUI-113's. A `"card"` on that commit (or a `"build": 160` on the entry) would make the page match.
- **Timeline totals.** timeline.json was exported before build 176 and the last five ship log entries, so the live page says 34 builds and 228 shipped. The video lands on 35 and 233 so it agrees with the hook. One constant, `FINAL` in comp.html, switches it back.
- **The note's trip across the board.** The feedback card is not in board.json's export; its key "Feedback" comes from progress.json. The other tiles are a real subset in board order. When exactly it sat in Up next or Building is not recorded; the Sep 26 ship date is.
- **Small liberties.** Tile feet say "Shipped Sep 26" where the board prints 2026-09-26. Commit lines drop feedback ids and shas. The OSS-8 goal is shortened. Each page shows one lede sentence. The site's butter eyebrow is drawn in a coral tint to keep three colors. The feedback sheet is a plain drawn sheet, not TestFlight's exact screen, and the Wizard thread is redrawn in light from the real (dark) screenshot.
- **Left out:** the war room in the app. It fits the story, but it would have covered the board while the card moves.
