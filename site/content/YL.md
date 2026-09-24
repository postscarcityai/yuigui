# Yui Lines (YL) v0

The wire format between an agent and the Yui app. The agent never writes UI code or a JSON document. It picks a preset and fills in a few arguments, one line per component. The app renders each line the moment its newline arrives.

```
timer 40/20x8 Tabata
ask "Log this set?"
choose "What are we training?" Push|Pull|Legs +other
```

Reference implementation: `site/lib/yl/yl.mjs` (parser, stream parser, defaults, screen state). Conformance suite: `spec/conformance/` (section 12). Tests: `bench/test.mjs`. Playground: `/playground` on the hub site. Token numbers: `spec/BENCHMARK.md`.

## 1. Lines

A document is a sequence of lines. Each line is parsed on its own and becomes one op. A bad line becomes an error op and is skipped; every other line still renders.

| Line | Op | Example |
|---|---|---|
| blank, `#` alone, or starts with `# ` | none | `# rest block` |
| `preset args...` | add a component | `timer 60` |
| `preset@id args...` | add with a name you can patch later | `timer@hiit 40/20x8` |
| `~target args...` | patch a live component | `~hiit rounds=10` |
| `>S line` | send one line to screen S | `>2 timer 90 Rest` |
| `>S` alone | focus screen S for the lines that follow | `>2` |
| `say text` | plain text bubble | `say Nice work.` |
| `save name` | save the current screen | `save workout` |
| `show name` | restore a saved screen | `show workout` |
| `clear` | empty the current screen | `clear` |
| `custom {json}` | escape hatch, rest of line is JSON | `custom {"type":"text","text":"hi"}` |

Screens are named by `[A-Za-z0-9_-]+`. The app starts on screen `1`. Chat is its own channel and is not a screen.

Lines end at `\n`; a trailing `\r` is dropped, so CRLF works. Leading and trailing whitespace is ignored. Preset names and core words are lowercase (`Timer 60` is an unknown preset). Ids are `[A-Za-z0-9_-]+`. `> 2` (space after `>`) is not a route.

## 2. Tokens

After the head word, a line is split on whitespace into tokens.

- **Bare word**: `Tabata`, `1-5`, `40/20x8`.
- **Quoted string**: `"Log this set?"`. Double quotes only. Inside quotes a backslash escapes the next character (`\"`, `\\`); outside quotes a backslash is literal. Quotes may sit inside a token: `"Pull-up bar"|Bands` is one token, and `pre"fix and"post` is the text `prefix andpost`. An unterminated quote runs to the end of the line.
- **Options**: a token containing `|` outside quotes is split into options: `Push|Pull|Legs`, `"3:00 pm"|"4:00 pm"`.
- **Key/value**: `key=value` where key is an identifier (`[A-Za-z_][\w-]*`). The value may be quoted (`cta="Start workout"`) or options (`cols=Food|Cal`). Unquoted values that look like `-?digits[.digits]` become numbers (`1e5` and `.5` stay text); `on`/`true` and `off`/`false` become booleans. A quoted value always stays text: `cta="5"` is the string `"5"`, and in options each part is judged on its own (`tags=1|"2"` is `[1, "2"]`). Only the first `=` splits: `sub=a=b` is `"a=b"`. `key=` is the empty string.
- **Flag**: `+name` sets `name` to true: `+other`, `+check`, `+auto`. The name starts with a letter, so `+1` is text.
- **Comment**: a `#` that starts a token and is followed by a space or the end of the line ends the line. `color=#ff6b3d` and `#hashtag` are not comments. `custom` lines take no comments.

Everything that is not a key/value or a flag is **positional**. Each preset decides what its positionals mean (section 4). Any prop can also be set by key/value, which wins over positionals and flags: `timer 60 rounds=3`. For a repeated key the last one wins.

Whitespace means ASCII space and tab. Other Unicode spaces are undefined in v0; agents should not send them between tokens.

Quotes are only needed when a positional would otherwise be misread, and they always force text: `timer "60" Rest` has no work time and the label `60 Rest`. Consecutive bare words used as text are joined with spaces, so `ask Log this set?` and `ask "Log this set?"` are the same line.

## 3. Values

| Form | Meaning | Examples |
|---|---|---|
| duration | seconds, `Ns`, `Nm`, `Nh`, or `m:ss` | `45`, `90s`, `5m`, `1:30` |
| timespec | `work[/rest][xRounds]`, durations as above | `60`, `40/20x8`, `1:00/30x5` |
| range | `min-max` | `1-5`, `0-200` |
| options | `a|b|c` | `Yes|No` |

## 4. Presets

Defaults in brackets. Only what the line says is sent; the app fills in the rest.

### timer
`timer TIMESPEC [label...]`. Work/rest interval timer with rounds, a progress ring, beeps on the last 3 seconds and on phase changes. Emits `{started}` and `{done, rounds}`.
Props: `work` [60], `rest` [0], `rounds` [1], `label`, `+up` (count up, stopwatch), `+auto` (start on arrival), `sound` [on].
```
timer 40/20x8 Tabata
timer 5m Plank hold
timer 0 +up Run
```

### ask
`ask question... [options]`. Yes/no, or any two to four big buttons. Emits `{answer}`.
Props: `q` ["Continue?"], `options` [Yes|No].
```
ask "Log this set?"
ask "Send the invite now?" "Yes, send"|"Not yet"
```

### choose
`choose question... options [+other]`. Single choice. `+other` adds "Type your own". Emits `{choice}` (plus `other: true` for typed answers).
```
choose "Split?" Push|Pull|Legs +other
```

### pick
`pick question... options [+other]`. Multi-select with a submit button. Emits `{picked: [...]}`.
Props: `max` (cap selections), `submit` [Done].
```
pick "Gear" Dumbbells|Bench|Bands +other
```

### slide
`slide label... RANGE [lo|hi]`. Slider. The first options token with exactly two parts labels the two ends; any other options token is label text. Emits `{value}` on release.
Props: `min` [1], `max` [5], `step` [1], `value` [midpoint], `unit`, `lo`, `hi`.
```
slide "AI experience" 1-5 "Brand new"|"I run agents"
slide "Protein left (g)" 0-200 value=85 step=5
```

### form
`form [title...] field field ...`. Emits `{form: {key: value}}` on submit.
Field syntax: `key[:type][!]` or `"Label":type[!]`. `!` means required. No type means `text`. Labels default to the key with `_` as spaces.
Types: `text`, `long`, `voice` (text box plus mic), `number`, `email`, `phone`, `date`, `time`, `url`, `yes` (toggle), `photo`, a range (`1-5`, sent as `type: "range", min, max`), or options (`Beginner|Mid|Pro`, sent as `type: "choice", options`). Any other type is kept as written and renders as `text`, so a field type added later degrades on an older app.
Any bare identifier is a field, so a title must be quoted unless it cannot be read as one: `form "Daily check-in" mood:1-5`, not `form Daily check-in` (two text fields). A quoted label with no type (`"Check-in"`) is title text, and so is anything else that is not a field (`Re:`).
Props: `title`, `fields`, `submit` [Submit].
```
form name:text! goal:voice level:1-5 submit="Next"
form "Check-in" sleep:1-10 "Home gym":yes split:Push|Pull|Legs
```

### list
`list [Title] items...`. The first token, if it is a bare word, is the title. Every token after it is an item: quoted tokens, each part of an options token, and each bare word on its own (`list Groceries milk eggs` has two items). Emits `{item, checked}` when `+check` is on.
Props: `title`, `items`, `+check` (checklist), `+num` (numbered).
```
list Today "Squat 5x5 @ 225" "Bench 5x5 @ 185" +check
list Warmup "Jumping jacks"|"Hip openers" +num
```

### table
Two forms. `table name` binds to the agent data table called `name` (Phase 3 makes these real on device). `table [Name] Col|Col|Col "cell|cell|cell" ...` is an inline table: the first options token is the header, each later token is a row split on `|`.
```
table meals
table Macros Food|Cal|Protein "Eggs|140|12" "Oats|300|10"
```

### card
`card title [body...]`. Props: `title`, `body`, `sub`, `tag`, `img` (URL), `cta` (button label, emits `{cta}`).
```
card "Leg day" "Squat, RDL, lunges." sub=Thursday img=/yl/legday.svg cta="Start workout"
```

### image
`image URL [caption...]`, or `image prompt...` with no URL (a URL is a token starting `http://`, `https://`, `/` or `data:`; the first one found is `src` wherever it sits, and the other text is the caption), which shows a "to generate" placeholder until the image pipeline fills it (Phase 3). Props: `src`, `caption`, `prompt`, `alt`, `fit` [cover], `+edit`.
```
image /yl/meal.svg Last night's dinner
image "a calm blue avatar with a wizard hat"
```
**`+edit`** turns the image into an edit request. The person circles (freehand) or boxes an area and types what should change. Emits `{edit: {box, path?, instruction}}`: `box` is `[x, y, w, h]` in percent of the image, `path` is the freehand outline as `[[x, y], ...]` percent points (at most about 24, only when circled), so the agent can build a mask. The agent runs the edit and answers with a `compare` of the two.
```
image /demo/room.jpg +edit "Circle what to change"
```

### camera
`camera [prompt...] [front|back] [+scan]`. Opens the camera, captures one photo, emits `{photo}`. Falls back to a file picker. Props: `prompt` ["Take a photo"], `facing` [back], `+scan` (document mode).
```
camera "Snap your plate"
camera "Scan the receipt" +scan
```

### mic
`mic [prompt...] [+auto]`. Big talk button, speech to text, emits `{transcript}`. Falls back to typing. Props: `prompt` ["Tap and talk"], `+auto` (start listening on arrival), `lang`.
```
mic "What did you eat today?"
```

### Media: gallery, video, compare, storyboard

Media is referenced by URL, never sent inline. A token starting `http://`, `https://`, `/` or `data:` is a URL. A URL ending in `.mp4`, `.webm`, `.mov` or `.m4v` (before any `?` or `#`) plays as video wherever media is shown; anything else is an image. Layout and behaviour are props, so the same few presets combine freely.

**Captions ride on the URL.** In `gallery` and `storyboard`, a media token may carry a caption after its first `|`: `/a.jpg|Wheel`, `"/a.jpg|Two words"` and `/a.jpg|"Two words"` are the same. Media with no caption gets `""` in the caption list only when some other item has one.

**List props split on `|`.** `caps`, `notes`, `labels`, `items` and `frames` are always lists. A plain value is split on `|` even when quoted, so `notes="Hook|Problem|CTA"` and `notes=Hook|Problem|CTA` are the same line. Numbers in these lists stay text.

#### gallery
`gallery [title...] URL URL ... [layout=row|feed|row3d|grid] [+pick]`. Images and/or videos. URLs become `items`, inline captions become `caps`, any other text is the title. Tap an item to open it full screen with swipe to the next. Emits `{open: true, index}` on open, and with `+pick` a check on each item plus a submit button that emits `{picked: [index, ...]}` (0-based, in tap order).
Props: `title`, `items`, `caps`, `layout` [row], `+pick`, `max` (cap picks), `submit` [Done].
Layouts: `row` flat horizontal swipe, `feed` vertical full width, `row3d` coverflow-style 3D stack, `grid` square tiles, three across.
```
gallery "Studio shoot" /demo/g1.jpg|"On the wheel" /demo/g2.jpg /demo/g3.jpg layout=row3d
gallery /demo/g1.jpg /demo/g2.jpg /demo/g3.jpg /demo/g4.jpg layout=grid +pick max=2 submit="Use these"
gallery "This week" /demo/reel.mp4|"First cut" /demo/g4.jpg layout=feed
```

#### video
`video URL [caption...] [+loop] [+auto] [+mute]`. One video with controls. With no URL it is a "to generate" placeholder and the text is the `prompt`, like `image`. `+auto` starts playing on arrival and implies muted (browsers only autoplay muted video). Emits `{played: true}` the first time it plays and `{ended: true}` at the end.
Props: `src`, `caption`, `prompt`, `poster` (URL), `+loop`, `+auto`, `+mute`.
```
video /demo/reel.mp4 "Launch reel, first cut" poster=/demo/reel-poster.jpg
video /demo/reel.mp4 +loop +auto
```

#### compare
`compare BEFORE AFTER [title...] [mode=slider|side|toggle] [notes=a|b] [hl=x,y,w,h|...]`. Before and after. The first URL is `before`, the second `after`; anything else, a third URL included, is the title. The person can switch modes on the card.
- `mode`: `slider` [default] drags a divider across the two, `side` puts them side by side, `toggle` shows one and taps between them.
- `hl`: highlight boxes on the after image so the agent can point at what changed. Each box is `x,y,w,h` in percent of the image; boxes are separated by `|`. A box that is not exactly four numbers is dropped. Sent as `[[x, y, w, h], ...]`.
- `notes`: one line per change, numbered to match the boxes. Notes without boxes are a plain numbered list.
- `labels` [Before|After] names the two sides. `+pick` adds one button per side for an A/B choice and emits `{choice: label}`.
Props: `before`, `after`, `title`, `mode` [slider], `labels`, `notes`, `hl`, `+pick`.
```
compare /demo/before_room.jpg /demo/after_room.jpg "Living room" notes="Sage wall|Bigger plant|Jute rug" hl=45,4,53,45|19,25,20,54|16,78,83,21
compare /demo/v1.jpg /demo/v2.jpg "Which shot?" mode=side labels=Studio|Window +pick
```

#### storyboard
`storyboard [title...] URL|note URL|note ... [+reorder]`, or with key/values `frames=URL|URL notes=a|b`. Ordered frames for a video, a site or a post. A storyboard can be all notes and no pictures yet (a script); the frame count is the longer of `frames` and `notes`. Tap a frame to see it full screen (`{open: true, index}`). Every frame takes a comment, which emits `{frame, comment}` (`frame` is the frame's original 0-based index); `comment=off` turns that off. `+reorder` adds up/down controls and a Save order button that emits `{order: [index, ...]}`, the original indices in their new order.
Props: `title`, `frames`, `notes`, `+reorder`, `comment` [on].
```
storyboard "Launch reel" /demo/s1.jpg|Hook /demo/s2.jpg|Problem /demo/s3.jpg|CTA +reorder
storyboard "Post: why handmade" notes="Hook|Problem|Proof|CTA"
```

### say (core, not a preset)
`say text...`. A plain text bubble inside a screen.

## 5. Screens, patches, saved screens

**Routing.** `>2 timer 90` sends one line to screen 2 and brings screen 2 forward. `>2` alone moves focus: every following line goes to screen 2 until the next bare `>S`.

**Patching.** `~target args` updates a component already on screen without re-sending it. `target` is an id (`timer@hiit` gives id `hiit`) or a preset name. The newest matching component on any screen wins. Args are parsed with the target's preset rules, so `~hiit 30/10` and `~hiit rounds=10` both work. A live timer keeps running through a patch; the time left is clamped to the new phase length.

**Saved screens.** `save workout` stores the current screen. `show workout` puts it back (on the current screen). Reopening a whole screen costs two tokens.

## 6. custom {json}

The long tail. Everything after `custom ` is one JSON value. v0 renders a fixed set of primitives:

| type | fields |
|---|---|
| `stack` / `row` | `children` |
| `text` | `text`, `size` (`lg`) |
| `badge` | `text` |
| `stat` | `value`, `label` |
| `image` | `src`, `alt` |
| `button` | `text`, `action` (emitted as `{action}`) |
| `divider` | none |

Unknown types render as raw JSON so the gap is visible. Bad JSON is an error line. Every `custom` line is logged. When the same custom shape shows up again and again, it gets promoted to a preset. That is how the preset set grows from 80% coverage toward 95%.

Custom blocks can take an id (`custom@countdown {...}`) but cannot be patched; send a new one.

## 7. Events back to the agent

Every interaction goes back as one small event: `{id, preset, ...value}`. Ids are the `@id` from the line, or `n1`, `n2`, ... in line order when none was given. `custom` blocks without an id get `c` plus the same counter, so `say`, `custom`, `say` gives `n1`, `c2`, `n3`. Only adds advance the counter; patches, errors and explicit ids do not. Examples:

```
{"id":"n1","preset":"ask","answer":"Yes"}
{"id":"n3","preset":"pick","picked":["Dumbbells","Bands"]}
{"id":"hiit","preset":"timer","done":true,"rounds":8}
{"id":"n2","preset":"gallery","picked":[0,2]}
{"id":"n1","preset":"storyboard","order":[1,0,2,3]}
{"id":"n1","preset":"image","edit":{"box":[48,10,44,40],"instruction":"Paint this wall sage green"}}
```

## 8. Streaming

The stream parser keeps a line buffer. Every time a newline arrives, that line is parsed and rendered. The first component shows up as soon as its own line is complete, not when the whole reply is done, and a slow model still paints the screen top to bottom. `flush()` parses a final line with no trailing newline.

## 9. Errors

A line that fails (unknown preset, bad JSON, patch target that does not exist, `show` of a name never saved) is skipped and reported. Nothing else on the screen is affected. The playground lists errors under the wire log.

Errors come from two layers. The **parser** rejects a line on its own: an unknown or malformed head, `custom` without valid JSON after it (comments are not stripped, so `custom {...} # note` is bad JSON), `save`/`show` without a name, a patch whose target is neither a preset name nor an id seen earlier in the reply, a patch aimed at a `custom` block. The **screen state** rejects what only it can know: `show` of a name never saved, `~ask` when no ask is on screen. The parser emits those as normal ops. Error wording is up to each implementation.

## 10. Telegram fallback

`ask`, `choose` and `pick` map straight onto Telegram inline keyboards: the question becomes the message, the options become buttons, the callback carries the same event. `list` and `say` become text. `gallery` and `storyboard` become a media album with the captions or notes as text, `video` and `image` send the file, `compare` sends both images. Everything else degrades to its text plus a link to open it in Yui.

## 11. Versioning

This is v0. Adding presets and props is non-breaking: an old app shows an error line for an unknown preset and renders the rest. Changing what a positional means is breaking and bumps the version, which the relay handshake will carry (Phase 1 relay).

## 12. Conformance

YL is platform neutral. Every parser (JS reference, Swift app, later Kotlin) must pass the shared vectors in `spec/conformance/`: one JSON file per area, each `{version, area, vectors: [{name, input, expected, error?, chunks?, emits?}]}`. `expected` is the op list for the whole `input`, minus each op's `line` and each error's `message`. A parser passes a vector when parsing `input` whole, and streaming it one character at a time, both give `expected`; when `chunks` is present, pushing those chunks then flushing must give `emits` (the ops returned by each push, then by the flush). Run the JS side with `cd spec/conformance && node run.mjs`. A change to this spec lands with the vectors that pin it.
