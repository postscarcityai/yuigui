# Games in Yui Lines (draft)

**Draft. Nothing here is built.** It proposes how an agent could describe a whole new game in Yui Lines, and waits for a pick before any parser or app work starts. The fixed games that ship today (`game tictactoe`, `snake`, `memory`) are in the YL spec, section 4, game.

The question: how can an agent define a new game (board, pieces, rules, how you win, timing) in lines, without sending code, and without giving up the core bet that the app draws presets and settings, not generated UI?

## 1. Three ways to do it

We wrote the same game, connect four, three ways and counted tokens (o200k_base, the tokenizer in spec/BENCHMARK.md).

| | (a) Board kit | (b) State machine | (c) Sandboxed script |
|---|---|---|---|
| What the agent sends | a board, pieces and rule words picked from a fixed list | states, transitions and guard expressions as data | JavaScript the phone runs in a sandbox |
| Connect four | **41 tokens**, 5 lines | 234 tokens | 302 tokens |
| What it can express | grid games: drop, place, move, capture, collect, mazes, tower defense. Not card games, physics or word games | almost anything turn-based, once the guard language grows | anything |
| Wrong answers | a bad line is skipped, a bad move is refused; the rest still plays | a bad guard can loop, stall or make the game unwinnable | a bad script crashes or hangs its game |
| Safety | data only; every behavior ships in the app | data, but the guard language turns into a small programming language | code from a model on the phone, sandbox or not |
| App Store (section 2) | fits: like a puzzle game that downloads new levels | grey, and greyer as it grows | only as a 4.7 mini game, with duties Yui cannot meet per reply |
| Looks native, in the agent's theme | yes | yes, if the render part stays fixed | no, it draws itself in a web view |

The same game as (b), shortened:

```
{"state":{"grid":[[0,0,0,0,0,0,0], ...],"turn":"you"},
 "states":{"you":{"on":{"tap_column":{"guard":"lowest_empty(col) != null","do":["set(lowest_empty(col),1)"],"then":"check"}}},
           "check":{"always":[{"if":"line(4,last)","then":"won"},{"if":"full()","then":"draw"},{"then":"next_turn"}]}, ...}}
```

And as (c), shortened:

```
function drop(c,p){for(let r=H-1;r>=0;r--)if(!g[r][c]){g[r][c]=p;return r}return -1}
yui.onTap(({col})=>{if(turn!==1)return;const r=drop(col,1); ... })
```

And as (a), whole:

```
board "Connect four" size=7x6 turns=you|agent
piece red you glyph=🔴
piece yellow agent glyph=🟡
rule drop
win line=4
```

## 2. What Apple's rules say

App Store Review Guideline **2.5.2**, word for word:

> Apps should be self-contained in their bundles, and may not read or write data outside the designated container area, nor may they download, install, or execute code which introduces or changes features or functionality of the app, including other apps. Educational apps designed to teach, develop, or allow students to test executable code may, in limited circumstances, download code provided that such code is not used for other purposes. Such apps must make the source code provided by the app completely viewable and editable by the user.

Guideline **4.7** is the one door for code that is not in the binary:

> Apps may offer certain software that is not embedded in the binary, specifically HTML5 and JavaScript mini apps and mini games, streaming games, chatbots, and plug-ins. [...] You are responsible for all such software offered in your app, including ensuring that such software complies with these Guidelines and all applicable laws.

It comes with rules 4.7.1 to 4.7.5. Two of them rule out games written fresh in every reply: **4.7.4** "You must provide an index of software and metadata available in your app. It must include universal links that lead to all of the software offered in your app", and **4.7.1**, which asks for "a method for filtering objectionable material, a mechanism to report content and timely responses to concerns, and the ability to block abusive users". **4.7.5** adds an age check for software above the app's rating.

Our reading (not a ruling from Apple, which judges the whole app at review):

- **(c)** is code that "introduces or changes features" of the app, which is what 2.5.2 forbids. Yui is not an app that teaches code, so the exception does not apply. Under 4.7 it could only work as a catalog of fixed mini games with an index, reports and age checks: a different product, and not something an agent makes up mid-chat.
- **(b)** is data, but a guard language with conditions, arithmetic and `always` loops is a programming language written in JSON. The more games it can express, the closer it sits to 2.5.2.
- **(a)** is data in the plain sense: a map, names, numbers and words from a fixed list. Everything a board can do is code that shipped in the app and passed review with it. That is the same pattern as a puzzle game that downloads new levels.

## 3. Recommendation

**Build (a), the board kit**, and keep the one good idea from (b) inside it: the turn structure is a state machine, but a fixed one. `turns=` picks one of three machines the phone already has (take turns with the agent, play alone, real time). Agents choose; they never write the machine.

Why: it is 6 to 7 times cheaper than the other two on the same game, it fails one line at a time like the rest of YL, it draws natively in the agent's look, and it stays on the right side of 2.5.2. What it gives up (card games with hidden hands, physics, word games) can come later as named `game` kinds, the way `memory` did.

## 4. The board kit

`board` is a group head (YL section 4, Groups). Its members are `map`, `tile`, `piece`, `rule`, `win` and `lose`, one per line, and the group ends where any group ends. Like `game`, a board opens on the stage unless it says `+inline`, and can go to a page, be saved and shown.

### board
`board [title...] size=WxH turns=... [+inline]`.
- `size` [7x6]: columns x rows, 3 to 12 a side (16 for `turns=live`).
- `turns` [you|agent]: who plays.
  - `you|agent` or `agent|you`: take turns with the agent, the first one moves first. The person taps; the agent answers with a patch (Events, below).
  - `you`: a solo puzzle. The phone plays it out and tells the agent how it went at the end.
  - `live`: real time on the phone, like `snake`. `tick` [0.5s] is one step of the clock.
- `sight`: how many cells around the person's piece are visible (fog, for mazes). No `sight` shows the whole board.
- `coins`, `lives`: starting counters for `live` games. `lives` [3].
Props: `title`, `size`, `turns`, `tick`, `sight`, `coins`, `lives`, `+inline`, and one list per piece name for the board's contents (`red=d6|c6`).

### Cells
A cell is a column letter and a row number, `a1` top left, `d6` the bottom of the fourth column on a 7x6 board. Letters run `a` to `p`, rows `1` to `16`. Cell lists are options: `at=a1|b2`.

### map
`map ROW|ROW|...`. The board drawn as text, one row per option, one character per cell. `.` is plain floor unless a tile claims it. A row shorter than `size` is padded with floor, a longer one is cut. Any character works except space, `#`, `"`, `|`, `=` and a leading `+` (those mean something else in a YL line: `#` followed by a space starts a comment).

### tile
`tile NAME CHAR [+solid] [+path] [+spawn] [+goal] [glyph=]`. Gives the cells of `map` that hold `CHAR` a name and a look. `+solid` blocks movement. In `live` games, foes walk the `+path` tiles from a `+spawn` tile to a `+goal` tile, by the shortest route. `glyph` is an emoji or one or two letters; with none the app draws the tile in the theme's colors.

### piece
`piece NAME OWNER [at=] [glyph=] [stats...]`. A kind of piece. `OWNER` is `you`, `agent`, `foe` (the phone moves it in a live game) or `none` (things to pick up). `at` is a cell list or one map character, which means every cell that holds it (`at=S`). A piece with no `at` starts off the board, ready to drop, place or build.
Stats, all optional: `hp`, `speed` (cells per second), `range` (cells), `hit` (damage), `every` (a duration, how often it hits), `cost` and `reward` (coins), `score` (points when collected), `max` (how many may be on the board).

### rule
`rule VERB [PIECE] [props]`. What moves are legal. A rule without a piece applies to every piece its verb fits. The first cut has seven verbs:

| Verb | What the person (or agent) does |
|---|---|
| `drop` | tap a column; the piece lands in its lowest empty cell |
| `place [on=TILE]` | tap an empty cell to put a new piece there |
| `move step=orth\|diag\|king\|knight\|line [dist=1] [+forward]` | tap one of your pieces, then where it goes. `line` slides until blocked |
| `capture jump\|flank\|land` | `jump` over an enemy piece takes it (checkers), `flank` turns a line of enemy pieces caught between two of yours (reversi), `land` takes the piece you move onto |
| `collect PIECE` | stepping onto it picks it up and adds its `score` |
| `build PIECE on=TILE` | live: tap a tile to build for its `cost`; it hits the foe nearest the goal within `range` |
| `wave PIECE[\|PIECE] count= every=` | live: foes enter at the spawn, one `every` apart, in the order written; the next wave starts when this one is gone |

### win and lose
`win WORD` and `lose WORD`, checked after every move or tick. In a turn game the side whose move makes a `win` true wins it.

| Word | True when |
|---|---|
| `line=N` | N of one side's pieces in a row, across, down or diagonal |
| `reach=TILE` | the person's piece stands on that tile |
| `clear[=PIECE]` | none of that piece (or of the other side) is left |
| `most` | the board is full; most pieces wins |
| `score=N` | the score gets to N |
| `stuck` | the side to move has no legal move |
| `waves` | live: every wave is gone and lives are left |
| `survive=DURATION` | live: the clock gets there |
| `time=DURATION` | (for `lose`) the clock runs out |

A turn game with a full board and no winner is a draw. A live game is lost when `lives` reaches 0: a foe that reaches the goal costs one.

### Events
Every event carries the board's piece lists by name, so the agent always has the whole board.

- **Take turns.** Each move by the person emits `{move: {piece, from, to}, <lists>}`, plus `winner` (`you`, `agent` or `draw`) when it ends the game. The agent answers in its next reply with a patch of **its own lists only**, the old cells plus the move: `~board yellow=d5|c6`. The phone finds the move by comparing, checks it against the rules and applies captures itself. A patch that is not one legal move changes nothing and emits `{illegal: true, why}` (`why` like "c is full"), and the board waits for another patch.
- **Solo and live.** Nothing is sent while playing. The end emits `{over: true, won, moves, seconds}`, plus `score`, `wave`, `lives` and `coins` where they apply.
- Play again resets on the phone and emits `{again: true}` in a turn game; solo and live games send nothing until their next end.

```
{"id":"n1","preset":"board","move":{"piece":"red","to":"d6"},"red":["d6"],"yellow":[]}
{"id":"n1","preset":"board","illegal":true,"why":"d is full"}
{"id":"n2","preset":"board","over":true,"won":true,"moves":31,"seconds":48}
{"id":"n3","preset":"board","over":true,"won":false,"wave":2,"lives":0,"coins":3,"seconds":71}
```

## 5. Three games

### Connect four, against the agent (41 tokens)
```
board "Connect four" size=7x6 turns=you|agent
piece red you glyph=🔴
piece yellow agent glyph=🟡
rule drop
win line=4
```
The person drops red into column d; the app sends `{move: {piece: "red", to: "d6"}, red: ["d6"], yellow: []}`. The agent answers `~board yellow=d5`. Swap `rule drop` for `rule place` and `size=15x15`, `line=5` and it is gomoku.

### Lost in Mazewood, a solo maze with fog (115 tokens)
```
board "Lost in Mazewood" size=9x9 turns=you sight=2
map TTTTTTTTT|TS..T...T|TT.TT.T.T|T..T..T.T|T.TT.TT.T|T....T..T|TTTT.T.TT|T......GT|TTTTTTTTT
tile tree T +solid glyph=🌲
tile home G glyph=🍄
piece fox you at=S glyph=🦊
rule move step=orth
win reach=home
```
The fox sees two cells around it. Swipes or the arrow pad move it. Finding the mushroom emits `{over: true, won: true, moves, seconds}`, and the agent can send a harder one.

### Mazewood, a tiny tower defense (187 tokens)
```
board Mazewood size=9x7 turns=live coins=12 lives=5
map S.......^|^^^^^^^.^|^.......^|^.^^^^^^^|^.......^|^^^^^^^.^|G.......^
tile road . +path
tile grass ^ glyph=🌿
tile den S +spawn glyph=🕳️
tile home G +goal glyph=🏡
piece acorn you glyph=🌰 cost=4 range=2 hit=1 every=1s
piece slime foe glyph=🟢 hp=3 speed=1 reward=1
piece beetle foe glyph=🪲 hp=8 speed=0.5 reward=3
rule build acorn on=grass
rule wave slime count=6 every=1.5s
rule wave slime|beetle count=10 every=1s
win waves
```
Slimes and beetles walk the road from the den to home. The person taps grass to plant acorn towers with their coins, and each kill pays a reward. Clear both waves with a life left to win. The agent hears the end, `{over, won, wave, lives, coins, seconds}`, and can answer with a harder map.

## 6. What the phone must build

- **Parser**: `board` as a group head and its six members, in `yl.mjs`, the Swift app and the Kotlin parser, pinned by conformance vectors like every preset.
- **Checker**: limits (size, 8 tiles, 8 pieces, 12 rules, 20 waves), unknown words skipped one line at a time, and a board that cannot be won is refused before it opens (a `reach` goal with no route, a wave with no path). It shows "This board can't be played" and emits `{broken: true, why}` so the agent can fix it.
- **Renderer**: one grid view for every board, tiles and glyphs in the agent's theme, fog, the winning line, the coin and life counters, Play again.
- **Rules engine**: the seven verbs, the win and lose words, the three turn machines, shortest routes for waves, and a fixed live clock. A second vector file pins it: a board plus a list of moves gives the same board and winner in JavaScript and Swift.
- **Access**: VoiceOver reads cells ("d6, red"), Reduce Motion turns drops and walks into fades, and the same haptics as `game`.
- **Elsewhere**: the web playground runs the same engine. Telegram sends the title and a link to play it in Yui, as with `game`.

## 7. What stays out

- Code of any kind, and anything that grows into it: expressions, formulas, variables beyond the fixed counters (score, coins, lives, moves, time), loops, user-defined verbs.
- Pictures by URL and sound files in the first cut. Glyphs and the theme only.
- Physics, randomness beyond the phone's own shuffle, hidden hands.
- People playing people over the network. A board is between one person and their agent.
- Device features (camera, location, contacts), purchases, and anything that leaves the game.
- A store or gallery of games as stand-alone software. A board is a screen, like a timer.

## 8. Where it goes from here

If this is picked, it lands in this order, each step its own card: the parse vectors and rule vectors, the web engine with connect four and the maze in the playground, the app view, then live mode with the tower defense as the largest step. A board shape agents keep sending can later become a named `game` kind through the preset flywheel (spec/FLYWHEEL.md). A push verb for box-pushing puzzles and promotion for checkers kings are the first candidates for new rule words.
