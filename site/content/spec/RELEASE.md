# Release timeline (WAR-1, YUI-90)

Status: steps 1 and 2 shipped (Sep 25, Sep 26). This page says what the release panel shows and where each row comes from. The web draws it from the board's own exports: `/playground?demo=release`. On the phone it is the top of the war room, kept current with no agent turn.

Chris, Sep 25: "make this a totally dynamic, live update of the harness. This timeline should have really good real estate in the war room." Until now the release timeline was typed by hand in chat, and it was out of date by the next card that moved.

## 1. Which release

A release is one card on the board, titled `YUI-SHIP <version>: ...` (for example `YUI-SHIP 0.2.0`). It holds every TestFlight upload until its scope lands. Its scope is its parent cards: the cards it waits on.

- The panel shows the **open** ship card: the newest `YUI-SHIP` card that has not landed.
- When none is open, it shows the **newest one that landed**, marked shipped, with one row under it: the scope for the next release, not picked yet.
- The version comes from the ship card's title (`0.2.0`). A ship card with no version is "The next build".
- Epics (ROADMAP.md, "Epics") explain why a release exists. The ship card is what the panel reads, because only the board knows what is done right now.

## 2. What the panel shows

Two numbers, then two timelines, top to bottom.

| Line | Id | From |
|---|---|---|
| Cards landed, `3/3` | `rel-scope` | the ship card's parents |
| On main, not on TestFlight, `6` | `rel-main` | builds.json `next`, since the newest VALID build |
| The release timeline, titled `Yui 0.2.0` | `rel` | the ship card |
| One row per scope card | `rel-<card key>` (`rel-YUI-54`) | the parent card |
| The four ship steps | `rel-tests`, `rel-upload`, `rel-valid`, `rel-link` | the ship card and builds.json |
| The next release, once this one shipped | `rel-pick` | nothing open on the board |
| What is on main since build N | `relmain`, rows `relmain-0`... | builds.json `next` |

### Scope rows

Each parent card is a row in the `timeline` preset, tagged with its key:

- **done** when the card landed (done, or archived after a completion), with the day it landed and a link to its progress entry.
- **now** when it is running or blocked.
- **next** when it is queued.

Done rows come first, in the order they landed, then now, then next. The timeline's marker sits at the first row that is not done.

### Ship steps

The same timeline goes on past the scope, so one rail runs from the first card to the link. The steps, in order:

1. **Tests pass on the simulator.** The full UI test pass from a clean worktree of the app's main branch.
2. **One upload to TestFlight.** Done when a build uploaded while the ship card was open shows up in builds.json. The row then reads "Uploaded as build 122", with the day.
3. **Apple says VALID.** Done when that build's state is VALID (builds.json only keeps VALID builds, as `live`).
4. **What to try goes out.** Done when the ship card lands. The row links to the build on /changelog.

A step is done or not from the data. The first step that is not done is **now** only while the ship card is running and its scope has landed; otherwise every open step waits as **next**.

### On main since build N

Commits on the app's main branch after the newest VALID build, from builds.json `next`, one row each: the commit's opening words and the card it names. All of them are **next**: they ride whichever build uploads next. When that build goes VALID, the export empties `next` and the timeline disappears until the next commit lands.

## 3. Where the data comes from

Nothing in this panel is typed by an agent. Two exports, both written by the board sync (every few minutes, committed only when something changed):

- `board.json` gains a `release` block (`scripts/export-board.mjs`): the version, `open`, `shipping` or `shipped`, when the ship card started and landed, and its parent cards with their public board titles, status, landed day and progress link. The ship card's own title and body are never published.
- `builds.json` (`scripts/export-builds.mjs`): VALID builds with upload time, and `next`, the commits since the newest one.

`lib/release.mjs` turns the two into Yui Lines (`releaseLines(board, builds)`). The site and the phone use the same lines: the playground draws them at build time, and step 2 sends them from the war room script.

## 4. Updating in place

Every line carries an id that lasts (YUI-75, YL.md section 5). When a card moves, the war room script builds the lines again and compares them to the page the phone has:

- Only a line's props changed (a count went up, a card's title or a commit's words changed, a step's day or link filled in): it sends `~rel-scope ...` or `~rel-YUI-54 ...` patches. No page jump, no push, no agent turn. The plugin marks a patch-only reply quiet.
- A row changed kind (a card went from next to now to done, a step turned done): one patch per row, `~rel-YUI-54 kind=done at="Sep 26"` or `~rel-upload kind=done "Uploaded as build 131"`. The row keeps its place and the now marker moves (YL.md, timeline, Moving a row). Quiet like any patch. Only when the phone's build knows `kind=`: build 143 or newer (app 6a64a35, `ROWKIND_BUILD` in the war room script). An older build gets the whole page again, since it would merge `kind` as a prop and leave the row where it was. A row that would lose a prop on the way (a done row going back to the queue drops its day) is the whole page too, since a patch only sets props.
- The layout changed (a card was added to the scope or left it, a new ship card opened, the on-main list grew or emptied): the whole page again, saved as `war room`.

The board sync (`yui_board_sync.sh`, every 30 minutes) runs the refresh after an export that changed `release` or `next`, so a card moving on the board is on the phone within half an hour, with no model call. Between 23:00 and 08:00 ET only patches go out: a full send pushes and brings the page forward, so it waits for the first sync after 08:00.

## 5. What the phone needs

- The `timeline` preset with done, now and next rows: build 74 and later. Older builds drop those lines as unknown.
- Ids that last across replies, so patches land: build 111 and later. Older builds get the full page on every change.
- `stat` with a fraction value (`3/3`): every build.

Where it sits: the war room is screen 2 of Yui's thread. The release panel goes first, above Needs you, because it is the question asked most: where does the next version stand.

## 6. Steps

- **Step 1 (YUI-90, Sep 25):** this page, the `release` block in the board export, `lib/release.mjs`, the live demo in the playground and See it, a link from /changelog.
- **Step 2 (YUI-105, Sep 26):** `yui_war_room.py` puts the release panel first on screen 2, above Needs you. It runs `lib/release.mjs` itself, on a fresh board export (`export-board.mjs --stdout`, which writes nothing) and the newest builds.json, so the phone and the site draw the same lines. The board sync calls `--refresh --quiet-hours` when the release or `next` changed. Phones older than build 74 get no panel; older than 111, a full page on every change. Tests: `test_yui_war_room.py` (full send + patches lands on the same page as a fresh full send, through `yl.mjs`).
