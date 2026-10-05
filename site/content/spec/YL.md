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
| `>full` alone | open the stage: the lines that follow fill the whole screen (section 5, The stage) | `>full` |
| `>chat` alone, or `close` | close the stage; the lines that follow go back to screen 1 | `close` |
| `say text` | plain text bubble | `say Nice work.` |
| `save name` | save the current screen | `save workout` |
| `show name` | restore a saved screen | `show workout` |
| `forget name` | take a saved screen off the shelf | `forget workout` |
| `menu section[@id] label...` | put an item in the agent's drawer (section 5, The drawer) | `menu shortcut "Start today's workout"` |
| `clear` | empty the current screen | `clear` |
| `talk` or `talk off` | keep the composer on this page, or take it away (section 5, Pages) | `>2 talk` |
| `doing words [n/m]` or `doing off` | say what the agent is doing, in the working row (section 5, The working row) | `doing "Reading your calendar" 2/5` |
| `visual [look] tone= react=` or `visual off` | a live shader behind the stage (section 5, The visual) | `visual aurora react=voice` |
| `end` | close the open group (section 4, Groups) | `end` |
| `theme [set] key=value...` | restyle this agent's look (section 4, theme) | `theme autumn radius=square` |
| `theme app [set] key=value...` | offer a new look for all of Yui; the person previews it and taps Apply (section 4, theme app) | `theme app autumn` |
| `table create name col:type...` | make or change a table of this agent's data on the phone (section 4, Agent tables) | `table create meals Day:date Cal:number` |
| `put table [key] col=value...` | write one row of an agent table, by key (section 4, Agent tables) | `put meals Day=today Cal=640` |
| `custom {json}` | escape hatch, rest of line is JSON | `custom {"type":"text","text":"hi"}` |

Screens are named by `[A-Za-z0-9_-]+`. The app starts on screen `1`. Chat is its own channel and is not a screen. Two screen names are reserved: `full` is the stage, and `chat` means screen `1` (`>chat ask Ready?` sends one line back to screen 1). Screens `2` to `12` are pages beside the chat in the app (section 5, Pages).

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
| quantity | a number with its unit stuck on, or a leading currency sign | `72.5kg`, `9.81m/s^2`, `37.2degC`, `12%`, `3e8m/s`, `$40` |

**Quantities (units-aware numbers).** Where a preset takes a quantity (`stat`, `calc`), the number is `-?digits[.digits][e-?digits]` and the unit is whatever non-space text follows it, starting with a non-digit (`72.5kg`, `3e8m/s`; a space is not allowed between them). `$ € £ ¥` may lead instead of a unit (`$40`). The number goes out as a number and the unit as text, so `72.5kg` is `value: 72.5, unit: "kg"`. Units are written in ASCII and the app draws them properly: `^2` and `^-1` become superscripts, `deg` °, `degC` °C, `degF` °F, `ohm` Ω, `uL`/`ug`/`um`/`us`/`umol` µ, `*` a middle dot. The app may offer a converted reading when the person taps a unit (kg/lb, g/oz, km/mi, m/ft, cm/in, degC/degF, L/gal, kcal/kJ, km/h/mph); that is display only, and events keep the unit the agent sent.

## 4. Presets

Defaults in brackets. Only what the line says is sent; the app fills in the rest.

### timer
`timer TIMESPEC [label...]`. Work/rest interval timer with rounds, a progress ring, beeps on the last 3 seconds and on phase changes. Emits `{started}` and `{done, rounds}`.
Props: `work` [60], `rest` [0], `rounds` [1], `label`, `+up` (count up, stopwatch), `+auto` (start on arrival), `sound` [on], `+inline` (stay in the chat instead of opening on the stage; workouts ignore it, section 5).
```
timer 40/20x8 Tabata
timer 5m Plank hold
timer 0 +up Run
```

### ask
`ask question... [options]`. Yes/no, or any two to four big buttons. Emits `{answer}`. Answers can change (section 7).
Props: `q` ["Continue?"], `options` [Yes|No], `+lock`.
```
ask "Log this set?"
ask "Send the invite now?" "Yes, send"|"Not yet"
```
**Loose options.** Options are one `|`-joined token, but agents often write them as separate quoted strings. So in `ask`, `choose` and `pick`, when the line has no options token, two or more quoted tokens at the end of the positionals, after at least one question token, are read as the options: `choose "Where?" "Camera roll" "Drafts"` is the same line as `choose "Where?" "Camera roll"|Drafts`. One trailing quoted token is still question text, a bare word after the quotes ends the run (`choose "Pick" "Red" "Blue" please` is all question), and an options token anywhere on the line wins, leaving the quoted tokens as question text.

### choose
`choose question... options [+other]`. Single choice. `+other` adds "Type your own". Emits `{choice}` (plus `other: true` for typed answers). Tapping another option changes the answer (section 7). Props: `+lock`, and `tag`, `title`, `body` to put the context in the same card as the question: a tag pill, a heading and a paragraph above it, so the answer sits under what it is about instead of in a card of its own. With `title`, the question reads as the smaller line under the context. An app without them shows the question and options only.
```
choose "Split?" Push|Pull|Legs +other
choose@need-int7 "How did it go?" Works|"Not yet"|"You decide" tag=INT-7 title="Claude connector" body="In claude.ai add Yui as a custom connector, then ask for a 5 minute timer."
```

### pick
`pick question... options [+other]`. Multi-select with a submit button. Emits `{picked: [...]}`. After a submit the picks stay open: change them and submit again (section 7).
Props: `max` (cap selections), `submit` [Done], `+lock`, and `tag`, `title`, `body` as in `choose`.
```
pick "Gear" Dumbbells|Bench|Bands +other
```

### slide
`slide label... RANGE [lo|hi]`. Slider. The first options token with exactly two parts labels the two ends; any other options token is label text. Emits `{value}` on release, and again on each later release with a new value (section 7).
Props: `min` [1], `max` [5], `step` [1], `value` [midpoint], `unit`, `lo`, `hi`, `+lock`.
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
**Said, not typed.** The phone can fill a form from speech: one mic, the person says each label and its answer, the words land in the fields marked with a mic, and they check them before Send. It happens on the phone, and what the agent receives is the same `{form: {...}}` as a typed answer, with no flag (live demo: `/yl#people-can-say-their-answers`). Nothing to do differently, except label fields the way a person says them.

### list
`list [Title] items...`. The first token, if it is a bare word, is the title. Every token after it is an item: quoted tokens, each part of an options token, and each bare word on its own (`list Groceries milk eggs` has two items). Emits `{item, checked}` when `+check` is on.
Props: `title`, `items`, `+check` (checklist), `+num` (numbered).
A tick is a quiet event (section 7): the phone keeps it and the agent is not asked. A checklist with an `@id` keeps its ticks per agent across replies. On a page (`>2` to `>12`) of a native agent (spec `RELAY.md`, Events), a tick on a named checklist also goes to its runtime, still quiet: no echo, no working row. The runtime marks the row in its tables and patches the page (`~today`, `~wk-3 kind=done`), so Penny's Today and This week follow a tick and another device reads the same list. The reference function is `quietToAgent(event, {screen, native})` in `yl.mjs`.
```
list Today "Squat 5x5 @ 225" "Bench 5x5 @ 185" +check
list Warmup "Jumping jacks"|"Hip openers" +num
```

### table
Two forms. `table name` binds to the agent table called `name` (section 4, Agent tables). `table [Name] Col|Col|Col "cell|cell|cell" ...` is an inline table: the first options token is the header, each later token is a row split on `|`.
Props: `name`, `cols`, `rows`, `units` (one per column, `|` separated, empty for none: `units=|kcal|g`; shown under the header), `+sort` (tap a header to sort, tap again to reverse; emits `{sort: column, dir: "asc"|"desc"}`). Number columns align right. A table with an id (`table@wk ...`) is a live data source for `chart data=wk`; re-send it as a patch (`~wk Col|Col "row" ...`) and every chart bound to it redraws.
```
table meals
table Macros Food|Cal|Protein "Eggs|140|12" "Oats|300|10"
table Planets Planet|Mass|Radius "Earth|5.97|6371" "Mars|0.642|3390" units=|10^24kg|km +sort
```

### card
`card title [body...]`. Props: `title`, `body`, `sub`, `tag`, `img` (URL), `cta` (button label, emits `{cta}`), `url` (an `https:` or `itms-services:` link the button opens in the browser, Safari in the app; a button with a link shows an arrow and sends nothing to the chat; the button reads Open unless `cta` says otherwise; `yui://settings` or `yui://settings/search` opens the app's own Settings at that section (the web has no Settings, so there the button sends `{cta}` like a card without a link); `yui://agent/<handle>` is a hand-off, below; `yui://agent/<id>/thread` just opens that agent's thread, no jump (Yui's crew page, spec HOME.md; on the web it sends `{cta}`); other schemes are ignored), `fold` (flag).

A hand-off (YUI-144) is a card whose `url=` is `yui://agent/<handle>`: `card "Basil" body="She just finished leg day, wants dinner ideas" url=yui://agent/basil cta="Open Basil"`. The title names the agent, the body is the note. When the card arrives live in the thread on screen, the app takes the person to that agent's thread about a second and a half later, so they read who and why first; the button does the same from history, and a card loaded with old rows never jumps. The agent handed to gets the note and answers there first: a native agent from its runtime, a connected one as a mention (RELAY.md, Mentions), through its host. One hand-off a reply, never out of a turn another agent started, never inside a group. Apps before 0.5.0 show the card and send `{cta}`; the web sends `{cta}`.
```
card "Leg day" "Squat, RDL, lunges." sub=Thursday img=/yl/legday.svg cta="Start workout"
```

`+fold` makes a card that opens in place. Folded, it shows its tag, title and sub, the first line of its body and a chevron. A tap opens it: the whole body, the picture and the button, with a spring (a cross-fade under Reduce Motion). Another tap folds it again. Opening and folding stay on the phone and send nothing, so the agent can hand over a long ask, its mocks and its proof in one card without filling the chat. Use it for context the person may want, not for the question itself: the answer buttons go on a `choose` under it, which stays in view. Where a renderer cannot fold (Telegram), the card shows open.
```
card "Invite Dana?" "She asked for the beta yesterday. Two mocks attached, proof on the board." sub="requested yesterday" +fold
choose "Invite her?" Approve|Decline
```

### image
`image URL [caption...]`, or `image prompt...` with no URL (a URL is a token starting `http://`, `https://`, `/` or `data:`; the first one found is `src` wherever it sits, and the other text is the caption), which shows a "to generate" placeholder until the image pipeline fills it (Phase 3). Props: `src`, `caption`, `prompt`, `alt`, `fit` (default: the whole picture in a box its own shape, never cropped; `fit=cover` fills the box and crops), `+edit`.
```
image /yl/meal.svg Last night's dinner
image "a calm blue avatar with a wizard hat"
```
**`+edit`** turns the image into an edit request. The person circles (freehand) or boxes an area and types what should change. Emits `{edit: {box, path?, instruction}}`: `box` is `[x, y, w, h]` in percent of the image, `path` is the freehand outline as `[[x, y], ...]` percent points (at most about 24, only when circled), so the agent can build a mask. The agent runs the edit and answers with a `compare` of the two.
```
image /demo/room.jpg +edit "Circle what to change"
```

### camera
`camera [prompt...] [front|back] [+scan] [+say]`. Opens the camera, captures one photo, emits `{photo}`. Falls back to a file picker. Props: `prompt` ["Take a photo"], `facing` [back], `+scan` (document mode), `+say` (hold to snap and say: the press takes the photo, the mic listens while the finger holds, letting go sends `{photo, words}`, sliding left to the trash throws both away; for when a picture alone can't tell, like how much butter went in). Where there is no mic, `+say` is a plain camera.
```
camera "Snap your plate"
camera "Scan the receipt" +scan
camera "Snap it and say what's in it" +say
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

### Data and science: chart, stat, math, step, calc

Numbers, charts and equations as presets, so an agent can teach, track and explain with one line each. They take the theme's colors, and look right in light and dark: the app ships one categorical palette per theme, each checked for color-blind separation and contrast against its own surface. Every chart has a Table view of the same data.

#### chart
`chart [type] [title...] x=a|b|c y=1|2|3 [y2=...] [names=a|b] [unit=lb]`. The first bare word that is a chart type sets `type`: `line` [default], `bar`, `area`, `scatter`, `pie`, `donut`. Other positional text is the title.
- **Series.** `y` is the first series, `y2`, `y3` ... the next ones (any `y` followed by digits; drawn in number order), all on one shared axis. There is never a second y-axis: two measures on different scales go in two charts. `names` labels the series in order; a legend shows when there are two or more. `x` holds the labels (or numbers) along the bottom; with no `x` the points are numbered from 1. `x` and every `y` are always lists, even with one value.
- **Error bars.** Write a point as `12.5±0.4` (or ASCII `12.5+-0.4`) and it goes out as `12.5` with `0.4` in the matching error list: `err` for `y`, `err2` for `y2`, and so on (points with no error get `0`). Or send the list yourself: `err=0.4|0.3|0.5`, and a single value (`err=0.3`) applies to every point. An explicit `err` wins over inline `±`. Drawn as whiskers on line, bar and scatter.
- **Live data.** `data=<id>` charts a table instead: an inline `table@id` on the same screen (newest wins), or an agent table by name (`data=meals`). Then `x` names one column and `y` names one or more (`data=meals x=Meal y=Cal|Protein`). With no `y`, every all-number column is a series. The unit comes from the table's `units` when one column is charted. When the table is patched, the chart follows.
- **Scales.** `bar` and `area` start at zero; `line` and `scatter` fit the data. `min=` and `max=` fix the y-axis. `scatter`, and a `line`/`area` whose `x` is all numbers, use a true number axis. `+stack` stacks `bar` and `area` series. `xlabel` names the x-axis.
- **Colors.** Series take the theme palette in fixed order. `color=` overrides per series with a theme name (`accent`, `accent2`, `c1`..`c6`) or any CSS color.
- **Pie and donut** chart the first series against the `x` labels; the donut shows the total in the middle.
Tapping a point, bar or slice emits `{point: {series, index, x, y}}` (plus `name` when there are two or more series). Mouse hover shows a tooltip; nothing is emitted for hover.
Props: `type` [line], `title`, `x`, `y`, `y2`..., `err`, `err2`..., `names`, `unit`, `xlabel`, `data`, `min`, `max`, `color`, `+stack`, `+dots` (always draw point dots; they are on by default up to 24 points).
```
chart line "Weight" x=Mon|Tue|Wed y=180|179|178.5
chart bar "Yield" x=None|Low|High y=2.1±0.3|3.4±0.4|4.8±0.7 y2=2.0|3.1|4.0 names=Tomato|Pepper unit=kg
chart scatter "Rate vs substrate" x=0.5|1|2|4|8 y=0.9|1.6|2.6|3.7|4.5 err=0.2 xlabel="Substrate (mM)"
chart donut "Where the week went" x="Deep work"|Meetings|Email y=14|9|6 unit=h
table@wk Weigh-ins Day|Weight "Mon|181.2" "Tue|180.6"
chart line data=wk x=Day y=Weight
```

#### stat
`stat VALUE [label...] [delta=N] [spark=a|b|c] [good=up|down]`. One big number: the promoted form of the `custom` `stat` primitive. The first quantity among the positionals is `value` (and its unit, `unit`); if no positional is a quantity, the first one is the value as text (`stat A+ Grade`). The rest is the label.
- `delta` is the change, shown as ▲/▼ with its size. `good` [up] says which way is good, so a falling weight with `good=down` is green. A delta may carry its own unit (`delta=-2%`); otherwise it uses the value's unit.
- `spark` is a small trend line ending at the latest point.
- `sub` is a short note next to the delta. `cta` makes the whole tile a button that emits `{cta}`.
Tapping a convertible unit shows the other system (section 3); no event. Props: `value`, `unit`, `label`, `delta`, `good` [up], `spark`, `sub`, `cta`.
```
stat 178.9lb Weight delta=-2.3 spark=181.2|180.6|179.8|178.9 good=down sub="this week"
stat 37.4degC Incubator delta=0.2 sub="target 37.0"
stat $1840 "Grant left" delta=-420
```

#### math
`math TEX`. An equation, typeset (KaTeX on the web, the platform's math renderer in the app). **The rest of the line is TeX, verbatim**: backslashes, quotes, `|`, `=` and `#` are all TeX, never escapes, options, key/values or comments, so `math \frac{a}{b}` works as written. A leading `caption=` and/or `size=` (`sm`, `md` [default], `lg`) are props; the first token that is neither starts the TeX. One wrapping pair of double quotes is dropped, so `math "E = mc^2"` and `math E = mc^2` are the same line. TeX that does not parse shows as its source text. Use `\\` for line breaks and `\begin{aligned}` for aligned steps. No events.
A patch follows the same rule: `~eq caption="Now with c"` changes the caption, `~eq E^2 = (pc)^2 + (mc^2)^2` replaces the TeX.
Props: `tex`, `caption`, `size` [md].
```
math E = mc^2
math caption="Bayes' rule" P(A \mid B) = \frac{P(B \mid A)\,P(A)}{P(B)}
math size=lg x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}
```

#### step
`step [text...] [URL] [$ TEX]`. One step of a derivation or a protocol. **Consecutive `step` lines on a screen are one stepper** (anything else between them starts a new one), so steps stream in one line each. By default the stepper shows one step at a time, earlier ones stay above as done, with Back and Next and a progress bar; `+all` on the first step shows every step at once and each is tapped to check it off.
- A lone `$` token starts the TeX part: everything after it, to the end of the line, is TeX, verbatim (as in `math`). Text before it is tokenized normally.
- `title` (on the first step) heads the stepper. A URL token is `img`. `time` (a duration, sent in seconds) adds a small countdown for protocol steps.
Passing a step (Next, Done on the last one, or a tap in `+all`) emits `{done: true, index}` from that step's own id, with `last: true` on the final step. `index` is the step's 0-based position in its stepper.
Props: `text`, `tex`, `title`, `img`, `time`, `+all`.
```
step title="Solve for t" "Start from rest" $ d = \tfrac{1}{2} g t^2
step "Divide by g/2" $ t^2 = \frac{2d}{g}
step "Take the positive root" $ t = \sqrt{2d/g}
step title="Gram stain" "Flood with crystal violet" time=1m
step "Rinse, then iodine" time=1m
```

#### calc
`calc [title...] f="out = expr" name=min-max[@value][unit] ... [plot=name] [unit=u]`. A formula whose inputs are sliders; the result and a chart of it update live as the person drags. Good for teaching: "slide the angle and watch the range peak at 45°".
- `f` is the formula, `out = expr` or just `expr`. Quote it when it has spaces.
- **Every other key is a variable.** `v=0-40@20m/s` is a slider from 0 to 40 starting at 20, unit `m/s` (the start defaults to the midpoint). `g=9.81m/s^2` or `g=9.81` is a constant, shown under the sliders. Each variable goes out as an object: `v: {min: 0, max: 40, value: 20, unit: "m/s"}`, `g: {value: 9.81, unit: "m/s^2"}`. The reserved keys `title`, `f`, `plot`, `unit` and `digits` are never variables; any other value that is not a range or a quantity is kept as written.
- A variable with unit `deg` (or `°`) is shown in degrees and enters the formula in radians.
- `plot` names the slider to sweep along the x-axis of the result chart [the first slider]; `plot=off` hides the chart. `unit` is the result's unit, `digits` [3] its significant digits.
- Patching a variable replaces its whole definition: `~c v=0-60@30m/s`.
**Expressions.** Numbers (`3`, `0.5`, `6.02e23`), variable names, `+ - * / ^` (and `**`), unary minus, parentheses. `^` binds tighter than unary minus and is right associative (`-x^2` is `-(x^2)`, `2^3^2` is `2^9`). There is no implicit multiplication: write `2*a`. Functions: `sin cos tan asin acos atan sqrt abs exp ln log` (log is base 10) `min max floor ceil round`. Constants `pi` and `e`, unless a variable has that name. A formula that does not parse shows its error; a variable it uses that the line never gave shows as "needs x".
Releasing a slider emits `{values: {name: value, ...}, result}` (values as shown, degrees stay degrees; `result` is `null` when undefined).
Props: `title`, `f`, `plot`, `unit`, `digits` [3], plus one per variable.
```
calc "How far does it fly?" f="R = v^2*sin(2*a)/g" v=5-40@20m/s a=0-90@30deg g=9.81m/s^2 plot=a unit=m
calc Pendulum f="T = 2*pi*sqrt(L/g)" L=0.1-3@1m g=1.6-25@9.81m/s^2 unit=s
calc "Carbon-14 left" f="N = N0*exp(-ln(2)*t/h)" t=0-30000@5730yr N0=100% h=5730yr unit=%
```

### Groups: deck, plan, narrate, timeline, sketch, shapes, mock, map

Eight presets are **group heads**. A group head collects the lines that follow it on the same screen, one member per line, so a whole presentation or questionnaire still streams in one short line at a time. A member line is an ordinary preset line; the parser marks it with the group's id (`in`, section 7 and 12).

| Head | Members | What the group is |
|---|---|---|
| `deck` | `page`, `ask`, `choose`, `pick`, `sketch`, `shapes`, `diagram`, `mock`, `map`, `math`, `chart`, `stat`, `calc` | a swipeable presentation |
| `plan` | `page`, `ask`, `choose`, `pick`, `slide`, `form`, `mic`, `camera`, `sketch`, `diagram`, `mock`, `map` | one full-screen flow: pages to read, then questions, one answer at the end |
| `narrate` | `page`, `compare`, `image`, `video`, `card`, `stat`, `chart`, `math`, `storyboard`, `gallery`, `deck` | a spoken walkthrough |
| `timeline` | `done`, `now`, `next` | what has shipped, what is running, what is queued |
| `sketch` | `row`, `after` | a small drawn picture: rows struck out, highlighted, called out |
| `shapes` | `shape` | a small moving diagram: shapes, labels and arrows that come on one by one |
| `mock` | `part` | a UI recreated from parts: a frame with nav, rows, fields, buttons, tabs and sheets |
| `map` | `area`, `pin`, `route` | a small map: countries or drawn areas, pins and routes that come on one by one |

**Where a group ends.** At the first line that is not one of its members (a patch, `save` or `say` included), at a line for another screen, or at `end`. Blank lines, comments and error lines do not end a group, so one bad line inside a deck is skipped and the pages after it stay in the deck. A new head of the same kind ends the old group and starts a new one. `end` closes the innermost open group; `end` with nothing open is an error. Groups nest in two places: a `narrate` can hold one `deck` at a time (its pages join the deck, and the deck is a step of the narrate); the first line that is not a page ends the deck and is then checked against the narrate. A `deck` or a `plan` can hold a `sketch`, a `mock` or a `map` the same way, and a `deck` a `shapes`: its `row` and `after` lines (or `part` lines, `shape` lines, or `area`, `pin` and `route` lines) join it, and the first line that is not one ends it and is then checked against the deck or plan. The sketch or diagram is the picture of the page right before it (see A page's picture under deck). Since a deck takes `stat`, `chart` and `math`, a deck inside a `narrate` takes them too, as its pages' pictures: write `end` first to make one a step of the narrate.

To put a question *after* a deck rather than inside it, write `end` first:
```
deck "Warm-up" ...
page ...
end
ask "Ready for the real thing?"
```

#### deck
`deck [title...] [layout=slides|scroll] [+full] [+notes]`, then one `page` line per slide. Swipe, arrows or dots move between pages; a Full screen button (or `+full`, which opens that way) puts the deck over the whole screen, where arrow keys also work. Each page's `notes` are speaker notes behind a Notes toggle (`+notes` shows them open).
- `layout`: `slides` [default] one page at a time, `scroll` every page in a vertical feed.
- **Quiz pages.** An `ask`, `choose` or `pick` inside a deck is a page of its own. Give it `answer=` and it is graded (see Quiz below), which is how an agent ends a lesson with a check.
- **A page's picture.** A `sketch`, `shapes`, `diagram`, `mock`, `map`, `math`, `chart`, `stat` or `calc` right after a `page` is that page's picture: it draws where the page's `img` would go, above the words (a page with both draws the picture). One with no page right before it (first in the deck, after a question, or after a page that already has one) is a page of its own, just the picture. So a whole lesson is one deck: the diagram, the formula, the chart and the number each on their page, a quiz, and the calculator on the last page. A calc's sliders still send their events; a drag on a slider is never a swipe.
- When the person has seen every page and answered every question, the deck emits `{done: true, pages}`, plus `score` and `of` when some questions were graded. Quiz pages also send their own events as they are answered.
Props: `title`, `layout` [slides], `+full`, `+notes`.
A lesson as one deck:
```
deck "Compound interest"
page "Money that grows on itself" body="Your interest joins the pile."
shapes
shape circle $100 +grow
shape arrow
shape blob $110 +pulse tone=mint
page "The formula"
math A = P(1 + r)^t
page "Twenty years later"
stat $673 "After 20 years" delta=+573
choose "Which lever grows the pile fastest?" "More time"|"A bigger deposit" answer="More time"
page "Try it" body="Slide the numbers."
calc f="A = P*(1+r)^t" P=100-1000@100 r=0-0.2@0.05 t=0-20@10
```

#### page
`page title [body...] [URL] [body=] [points=a|b] [notes=] [img=]`. One slide. The first URL is `img` (an image, or a video when it ends in a video extension), the first text token is the title, the rest is the body, as in `card`. `points` is a bullet list (always a list, split on `|`). `layout` picks the look: `cover` (the picture full bleed, title over it; the default when a page has a picture and no body or points), `split` (picture on top, text under it; the default when it has both) and `text` (the default with no picture). A `page` outside a deck is a single slide. No events of its own.
Props: `title`, `body`, `img`, `points`, `notes`, `layout`, `say` (in a narrate).
```
deck "How mRNA vaccines work"
page "How mRNA vaccines work" /demo/mrna1.jpg notes="A set of instructions wrapped in a tiny bubble of fat."
page "1. Delivery" /demo/mrna2.jpg body="Lipid nanoparticles carry the mRNA into arm muscle cells."
page "2. The immune system learns" points="Spike pieces show on the cell|B cells make antibodies|T cells learn the shape"
choose "Where is the mRNA read?" Nucleus|Cytoplasm|"The blood" answer=Cytoplasm why="Ribosomes in the cytoplasm read it."
```

**Quiz.** `ask`, `choose` and `pick` take `answer=` anywhere, inside a deck or not. `answer` is the right option's text (for `pick`, a list: `answer=A|C`; it is always text, so `answer=4` matches the option `4`). A graded question marks the right option once the person answers, shows `why` (a short explanation) or the right answer, and adds `correct: true|false` to its event: `{choice: "Nucleus", correct: false}`. For `pick`, `correct` means the exact set. Answers stay open, so the person can try again; each try is an event.

#### plan
`plan [title...] [submit=] [review=off]`, then one line per step: `page` lines to read, question lines to answer. Plan mode: the steps become one flow with a progress bar, Back and Next, and a final review screen that lists every answer with an Edit link; `ask` and `choose` move on by themselves after a tap. Members do **not** send their own events. The plan emits once, when the person submits the review: `{plan: {id: answer, ...}}`, keyed by each step's id (so name them: `choose@kind ...`), where each answer is what that step would have sent (`ask` answer, `choose` choice, `pick` list, `slide` value, `form` object, `mic` transcript, `camera` photo). After submitting, the plan folds into a project summary with an Edit answers button; submitting again sends a new `{plan}` (answers are never locked).
- **Pages in a plan.** A `page` inside a plan is a step to read: it shows full size, has no answer, and Next moves on. Put what the agent found first and what it needs to know after, in one plan, so the person reads and answers without leaving the flow and sends everything with one button. Pages are not keyed in `{plan}`; the review lists only the questions. A page with nothing but a title is a weak step: give it a `body` paragraph or `points`.
- **Full screen.** A plan opens on the stage (section 5) unless it says `+inline`. Submitting closes the stage.
- **Folding back into the chat.** When the person submits, the flow leaves a record in the thread: (1) the plan's own spot becomes a summary chip, its title and what it held (`Build review · 2 pages, 2 answers`), which expands to the page titles and reopens the flow; (2) the answers land as the person's own message, as if they had typed them: one line per answered question, `<question>: <answer>`, in step order (no colon after a question that already ends in `?` or `:`, so `Launch before the holidays? No rush`). The answer text is what the step would have echoed on its own: a `choose` or `ask` option, a `pick` joined with `, `, a `slide` number, a `form` as `field: value` pairs joined with `, `, a `mic` transcript, `Photo` for a camera. Unanswered questions are left out; with none answered the message is `Sent`. The agent still gets exactly one event, the `{plan}` above; the text is for the person's history, not a second event.
- `submit` [Send] labels the last button. `review=off` skips the review; the last answer submits.
Props: `title`, `submit` [Send], `review` [on].
Plan mode is the first workflow, and it is linear: every step shows, in line order. A plan is a flow with no branches.

#### Answers are kept
A half-filled `plan`, `flow` or `form` is not lost when the person leaves. The client keeps what they did, per message, until they press Send: typed fields, taps, a slider, a mic transcript and the page they were on. A reload, a relaunch, another agent and back all come back to the same place. Send clears it, and a plan or flow that changed shape starts clean. Fields named like a secret (key, password, code, PIN, token) are never kept; they come back empty. An agent never re-sends a plan to restore answers: the screen is still there, and a second copy asks the person to start over. Wait for the `{plan}` event.
- **Web** keeps a plan, flow, form or mic in the browser, per agent and component id, through a reload or another agent and back. A named id (`plan@intake`) is kept; an auto id like `n3` is only a place in one reply, so it is not.
- **Phone** keeps flows, plans, forms and mics through Back, a kill and a relaunch. The stage questions screen (loose answers on the full-screen questions) does not survive a relaunch yet; until it lands, an answer there is lost on a relaunch.

#### flow
`flow [title or name] [submit=] [review=off]`, then a Mermaid flowchart up to `end`: plan mode with branches. Each node carries one step (`%% kind: choose "What are we building?" Website|Shop`), edge labels are conditions on earlier answers (`kind -->|Shop| products`, `-->|budget>=15| meet`), Back walks the path taken and the review lists only the answered steps on it. One event at submit: `{flow: {id: answer, ...}, path: [...]}`, the same shape as `{plan}` plus the path. `flow website-intake` alone runs a saved flow by name. The head is an add; the flow's `end` gives one patch with the graph. Everything else is in its own spec: [FLOWS.md](FLOWS.md).
```
plan@site "New website"
choose@kind "What kind of site?" Portfolio|Shop|"Local business" +other
pick@pages "Which pages?" Home|About|Pricing|Contact
slide@budget "Budget, in thousands of dollars" 1-20 value=5
form@brand "About the brand" name:text! vibe:Calm|Bold|Playful
ask@launch "Launch before the holidays?" "Yes, Dec 1"|"No rush"
```
emits `{"id":"site","preset":"plan","plan":{"kind":"Shop","pages":["Home","Contact"],"budget":5,"brand":{"name":"Kiln & Co.","vibe":"Calm"},"launch":"No rush"}}`.

Findings first, then questions, in one flow:
```
plan@review "Weekly review" submit="Send picks"
page "What broke" "Two buttons took taps on the glyph only, so the gallery X felt dead." points="Gallery X: fixed, 44pt target|Done pill: fixed, no longer covered"
page "What is new" "Hold any reply to react. The reaction goes to the agent as one turn, with the message quoted." points="Six reactions|Badge stays on the bubble"
choose@next "What should the composer get next?" Files|"Voice notes as audio" +other
pick@ship "Ship it where?" TestFlight|Site
```
emits `{"id":"review","preset":"plan","plan":{"next":"Files","ship":["TestFlight","Site"]}}`, and the thread shows the person's message:
```
What should the composer get next? Files
Ship it where? TestFlight, Site
```

#### project
`project title [body...] [status=] [progress=N] [facts="Label: value|..."] [next=a|b] [img=URL] [open=name] [cta=]`. A project card the agent can show any time to pick work back up. `facts` is a list of `Label: value` rows, `next` a list of next steps, `progress` a percent bar, `status` a pill. The button emits `{cta}`. With `open=name` the button reopens the saved screen `name` on the device at once, the same as the agent sending `show name`, and emits `{open: name}`; the button reads Open unless `cta` says otherwise. The usual pattern: run a `plan`, `save` its screen, and later show a `project` with `open=` pointing at it.
Props: `title`, `body`, `status`, `progress`, `facts`, `next`, `img`, `open`, `cta`.
```
>plan
plan@site "Kiln & Co. website"
...
save site-plan
>1
project "Kiln & Co. website" status=Planning progress=40 facts="Pages: Home, Classes, Visit|Launch: Dec 1" next="Pick a template" open=site-plan cta="Reopen the plan"
```

#### narrate
`narrate [title...] [voice=agent] [rate=1] [lang=] [+auto] [captions=off]`, then the things to walk through. A text-to-speech walkthrough: each step is shown while its line is spoken, with the words lighting up in a caption as they are said, and the walkthrough moves on by itself when the line ends. Play and pause, back and next, a progress bar per step, and a Full screen button.
- **Steps.** Each member is one step, except a `deck` (one step per page, the deck turns as it speaks), a `storyboard` (one per frame) and a `gallery` (one per item).
- **What is said.** A member's `say=` line. Without one, the step speaks what it shows: a page's `notes` (else its title and body), a compare's title and notes, a card's title and body, a caption, a frame's note.
- **Voice.** `voice=agent` [default] uses the speaking agent's own voice, so every agent can sound like itself (the app keeps one voice per agent). Any other value asks for a voice by name (`voice=Samantha`) or language (`voice=en-GB`), falling back to the agent voice. `rate` [1] is the speed, `lang` the language. The web renderer uses the Web Speech API; with no speech engine the captions run on their own timing.
- A question step (a quiz page) is read, then waits for the answer before the walkthrough goes on. `+auto` starts playing on arrival (a browser may hold speech until the first tap).
Emits `{played: true}` the first time it plays and `{done: true, steps}` after the last step.
Props: `title`, `voice` [agent], `rate` [1], `lang`, `+auto`, `captions` [on].
```
narrate "What changed on the site" voice=agent
compare /demo/site_before_hero.jpg /demo/site_after_hero.jpg "1. The hero" hl=3,28,50,46 say="The new headline says what you will make, and when."
compare /demo/site_before_classes.jpg /demo/site_after_classes.jpg "2. Classes" say="A wall of text became three cards with prices."
end
ask "Publish the update?" "Yes, publish"|"Not yet"
```

#### timeline
`timeline [title...] [mark=Now] [fold=5] [+reorder] [board=]`, then one row per line: `done` for what has happened, `now` for what is running, `next` for what is queued. A vertical track the person reads top to bottom: done rows (oldest first), then the **now marker**, a line across the track labelled `mark` [Now], then the running rows lit up on it, then the queued rows in the order they will happen. Rows keep their line order; the marker sits before the first `now` or `next` row. Good for a project board, a build log, a trip, a treatment plan: anything with a past and a queue.
- **Folding.** Only the last `fold` [5] done rows show; the older ones fold behind an "N earlier" button that opens them in place (no event). `fold=0` shows every row.
- **A timeline with no `now` row** still draws the marker between the last done row and the first queued one, so "nothing running" reads as a gap, not a missing piece. With no `next` row the marker ends the track.
- **Reordering the queue.** `+reorder` adds an Edit order button. In edit mode each `next` row gets a drag handle and the person drags the queue into a new order; `done` and `now` rows stay where they are. Save emits `{order: [key, ...]}`, the queued rows in their new order, where a row's key is its `key`, else its `tag`, else its `text`. Cancel puts the rows back and sends nothing. The saved order stays on screen until the timeline is sent again. VoiceOver gets Move up and Move down on each queued row.
- **Board order, no turn.** `board=name` names the task board the queue belongs to (the Hermes kanban assignee, `board=yui`), and the event carries it: `{order: [...], board: "yui"}`. The agent's own gateway applies that order to the board's priority for those cards directly, with no agent turn, and only for the person who owns the agent. The agent sees a note that the order changed on its next turn. Without `board` the order is an ordinary event the agent answers.
Props: `title`, `mark` [Now], `fold` [5], `+reorder`, `board`.

#### done, now, next
`done text... [https://link] [at=] [tag=] [sub=] [url=] [key=]` (and the same for `now` and `next`). One row. The first bare token starting `https://` is `url`, and the rest of the positional text is the row's `text`. `at` is when, shown in the row's gutter (`Sep 24`, `2h ago`, `Fri`); `tag` a short chip, like a card id (`YUI-65`); `sub` a second, smaller line; `key` is never shown, it names the row in a reorder event (a task id when two rows share a tag). A row with `url` opens the link in the browser when tapped (Safari in the app) and sends nothing to the chat, like a `card` link; the row shows an arrow. A quoted `"https://..."` stays text, and so does a relative path. A row outside a timeline stands alone as a one-row timeline. Rows send no events of their own.
Props: `text`, `at`, `tag`, `sub`, `url`, `key`.
```
timeline "Yui this week" fold=3
done "Saved screens" at="Sep 24" tag=YUI-32
done "Screens 2 to 12" at="Sep 25" tag=YUI-62
done "Links open Safari" at="Sep 25" tag=YUI-67 https://www.yuigui.com/progress
now "The war room timeline" tag=YUI-65 sub="web renderer done, native view next"
next "Drag to reorder" tag=YUI-66
next "War room panels" tag=YUI-73
```
To refresh a live row later, give it an id and patch it: `now@w65 ...`, then `~w65 sub="native view done"`.

**Moving a row.** A row's kind is its preset, and a patch can change it: `kind=` with `done`, `now` or `next`. `~w65 kind=done at="Sep 26"` turns the running row into a done one in place, with its other props merged as usual. The row keeps its id and its place in line order; the now marker is drawn from the rows as they are, so it moves (before the first row that is not done, as above). Nothing else on the page moves, and a reply of only such patches is quiet like any other patch (section 5). From that line on the id is its new kind: `~done@w65` reaches it and `~now@w65` is an error. `kind=` with anything else is an error, and on a preset that is not a row (`shape`, `game`) `kind` keeps its own meaning. Since rows keep their order, move them in the order they happen: the oldest running row turns done first, the next queued row starts running. A row that should jump the queue is a reorder (`+reorder`) or the timeline sent again. The reference function is `markAt(rows)` in `yl.mjs`, the index the marker sits before.

#### sketch
`sketch [title...] [frame=window] [before=Before]`, then one `row` per line, and at most one `after` line. A small drawn picture, so an agent can show instead of tell: how a screen should read, what changed, what to cut. A frame with rows inside it, some struck out, some highlighted, each with an optional short callout and an arrow pointing at it. No picture to generate, no screenshot to take, and nothing to tap: a sketch sends no events.
- **Frames.** `frame=window` [window] is a small app window, three dots and the `title` in its bar. `frame=phone` is a phone outline with the title at the top. `frame=bubble` is a chat bubble whose rows are its lines, with the title above it. Any other frame draws as `window`, so frames can be added without a new YL version.
- **Before and after.** An `after` line splits the sketch into two frames of the same kind: the rows above it in the first, labelled `before` [Before], the rows below it in the second, labelled with the `after` line's text [After]. Side by side when there is room, before on top on a phone. Only the first `after` splits; a later one is ignored. With no `after`, one frame and no labels.
- **On a page.** Inside a `deck` or a `plan`, a sketch right after a `page` is that page's picture (a deck's page can also take `shapes`, `math`, `chart`, `stat` or `calc`, see deck): it draws where the page's `img` would go (a page with both draws the sketch). A sketch with no page right before it (first in the group, after a question, or after a page that already has one) is a page of its own, just the drawing. On a phone's full screen the rows come on one after another with the page; a plan's sketch pages are steps to read, never keyed in `{plan}`.
Props: `title`, `frame` [window], `before` [Before].

#### row, after
`row [text...] [+x] [+hi] [+dim] [+button] [note=]`. One line of the drawing. `+x` strikes it through (the thing to drop), `+hi` puts a highlighter swipe behind it (the thing to look at), `+dim` greys it (context that does not matter here); they can combine. `+button` draws the text as a button instead of a line, for drawing a screen's controls. `note` is a callout of a few words beside the frame, with an arrow to the row. A row with no text is a blank placeholder bar, for the parts of the picture that are only filler. A row outside a sketch stands alone as a one-row sketch.
Props: `text`, `x`, `hi`, `dim`, `button`, `note`.

`after [label...]` splits a sketch (above). Outside a sketch it draws nothing.
Props: `label` [After].
```
sketch "Card ids" frame=bubble
row "Parked YUI-83 in the backlog" +x note="an id means nothing to you"
after
row "Parked the drawing card in the backlog" +hi note="plain words"
```
```
sketch "Build ready" frame=phone
row "Build 97 is ready"
row +dim
row "Got it" +button +x note="does nothing"
row "Install" +button +hi note="does the thing"
```
A story page with its picture:
```
deck "Read as pages"
page "No card ids" body="Plain words say what the card is."
sketch frame=bubble
row "Parked YUI-83 in the backlog" +x note="an id"
row "Parked the drawing card in the backlog" +hi note="plain words"
page "One idea per page"
```
Why this shape: the pictures agents need to explain Yui (and most apps) are a frame with a few lines in it and marks on some of them. `image +edit` and `compare` need a real picture first; a `list` has no per-row marks; `custom` would make every agent draw its own. Marks are flags because they read as what they are (`+x`, `+hi`), cost one token and combine. The pair is one `after` line inside the group, not a second sketch, so the two frames always share a frame kind and sit together.

#### shapes
`shapes [title...] [caption=] [w=10] [h=6]`, then one `shape` per line. A small diagram that moves, so an agent can explain an idea in a few lines instead of a paragraph or a generated picture: circles, boxes, blobs and arrows that come on one after another, with a caption under them. It is drawn on the phone from the lines (no picture, no network, no compute), it sits in the chat at the width of a bubble, and it sends no events.
- **The canvas** is `w` units wide and `h` tall [10 by 6], `0,0` at the top left; it draws at the width of the chat and keeps its shape. `w` runs 4 to 24 and `h` 2 to 16 (outside that is clamped).
- **Title and caption.** The `title` is a small heading above the drawing; the `caption` is a line or two under it, the sentence that says what the picture means. Both optional; a diagram should nearly always have a caption.
- **Colors** come from the agent's own look (section 4, theme), so a diagram matches the agent that sent it in light and dark.
- **Order is the story.** Parts come on in line order, a beat apart (about a third of a second), each in its own way (motion, below). A diagram of eight parts is done in about three seconds; then it rests, apart from anything that pulses.
- **Reduce Motion** (and anywhere that cannot animate: a printout, the Telegram picture) shows the finished drawing at once: every part in its last place, nothing pulsing.
Props: `title`, `caption`, `w` [10], `h` [6].

#### shape
`shape KIND [label...] [at=x,y] [size=] [tone=] [+fill] [+dash] [motion]`. One part of the drawing. The first bare word is the `kind`, wherever it sits (as in `game`); the rest of the positional text is its `label`. An id goes on the head as always: `shape@you circle You`.
- **Kinds.** Closed shapes sit somewhere: `circle`, `box` (rounded corners), `pill`, `dot` (small and always filled), `blob` (a soft organic outline, the same blob every time for the same line) and `text` (just the label). Connectors join two places: `line` and `arrow`. `path` is a free curve through points. Any other kind draws as a `box`, so kinds can be added later.
- **Where closed shapes go.** `at=x,y` puts the shape's centre there. With no `at`, the closed shapes that have none share one row across the middle of the canvas, evenly spaced in line order, and shrink to fit if the row is crowded. So a diagram of three boxes and two arrows needs no numbers at all.
- **Size.** `size=3,2` is 3 wide and 2 tall; `size=2` is a circle's diameter or a box's width (the height keeps the kind's proportions). Defaults: circle 2, box 3 by 2, pill 3 by 1.2, dot 0.5, blob 2.6 by 2.2.
- **Labels** sit inside circles, boxes, pills and blobs, under a dot, and above the middle of a line, arrow or path. They are a few words; the caption carries the sentence.
- **Connectors.** `from=` and `to=` are each a shape's id or a point `x,y`; an arrow starts and ends at the outlines of the shapes it joins, and follows them when they move. `at=` also works as the start point. With no `from` (or no `to`), a connector joins the closed shape written before it (or after it), so `shape box A`, `shape arrow`, `shape box B` is A to B. A connector with an end it cannot find is not drawn.
- **Paths.** `pts=x,y|x,y|...` is a smooth curve through two or more points, open at both ends: a trend, a road, a loop the eye can follow.
- **Tone** is `accent` [the default], `mint`, `lavender`, `butter`, `ink` or `mute`, all from the agent's look (`text` defaults to `ink`). `+fill` fills a closed shape with a soft wash of its tone; `+dash` draws the outline or line dashed (what is planned, optional, not there yet).
- **Motion** is one of three flags plus a move. No flag: the shape fades in (lines, arrows and paths trace themselves on instead). `+draw` traces the outline on, then fills. `+grow` springs up from its centre. `+pulse` comes on, then breathes gently for as long as it is on screen: the one thing to look at, at most one or two per diagram. `move=x,y` glides the shape from `at` (or its place in the row) to `x,y` after it comes on, and its connectors follow.
Props: `kind` [box], `label`, `at`, `size`, `from`, `to`, `pts`, `tone`, `fill`, `dash`, `draw`, `grow`, `pulse`, `move`. `pts` is always a list. `at`, `size`, `move`, `from` and `to` go out as written (`"2,3"`); renderers read the numbers.

A `shape` outside a `shapes` group stands alone as a one-part drawing.
```
shapes "How an ask reaches the app" caption="You ask, it lands on the board, a lane builds it, and it ships to your phone."
shape@you circle You +grow
shape arrow
shape box Board +fill
shape arrow
shape pill Lane +pulse
shape arrow label=ships
shape circle Phone tone=mint
```
```
shapes "Where the time goes" w=10 h=5 caption="Most of a reply is the model thinking. The phone draws in a blink."
shape@think blob Thinking at=3,2.5 size=4,3 tone=lavender +fill +grow
shape@draw dot at=8,2.5 tone=mint
shape text "drawing" at=8,3.4
shape arrow from=think to=draw +dash
shape path pts=1,4.6|3,4|5,4.4|7,3.8|9,4.2 tone=mute
```
Why this shape: agents need a picture of an idea (a flow, a loop, parts and how they join) more often than a picture of a thing, and a generated image costs a render, a wait and a network round trip for every small idea. A handful of shapes, one row by default and arrows that find their ends cover most of those pictures in a few short lines, and the order of the lines is the order the idea unfolds. `sketch` draws a screen, `chart` draws numbers, `flow` draws a branching form; `shapes` draws a thought. `custom` would make every agent invent its own, and SVG in a line would be long, fragile and unsafe.

#### diagram
`diagram [title...] [caption=]`, then Mermaid up to `end`. A flowchart, a sequence or a state diagram, drawn static and in the agent's look, so "how does it flow" is a picture and not a paragraph. The same Mermaid that renders on GitHub: the agent writes what it already knows, and the phone draws it with no image, no network and no Mermaid library. A `diagram` sends no events (for a chart you answer questions in, see `flow`).
- **The block.** The head is an add; every line after it, up to `end`, is Mermaid and not YL, so a node called `timer` or `ask` is a node. A nested block's own `end` (a `subgraph`, a `loop`) closes that block first, then the diagram. The `end` (or the end of the reply) gives one patch on the diagram with what was read. The first Mermaid line says which kind; `%%` comments may come before it. If the line after the head is not a Mermaid header, the diagram stays empty and that line is read as YL.
- **Flowchart** (`flowchart` or `graph`, `TD` [default], `TB`, `BT`, `LR`, `RL`). Nodes with a shape by their brackets: `[box]` [default], `(round)`, `([stadium])`, `[[subroutine]]`, `[(cylinder)]`, `((circle))`, `(((double)))`, `{diamond}`, `{{hexagon}}`, `[/slant/]`, `>flag]`. Links `-->`, `---`, `-.->` (dashed), `==>` (thick), `<-->` (both ends), each with a label (`-->|yes|` or `-- yes -->`), chained (`a --> b --> c`) and joined (`a & b --> c`). `subgraph id [Label]` … `end` draws a box round its nodes; they nest. `style`, `classDef`, `click` and the rest are kept in `source` and not drawn.
- **Sequence** (`sequenceDiagram`). `participant A as Alice` and `actor U as You` set the order and the names; one not declared comes in where it first speaks. Messages `A->>B: text` (arrow), `A-->>B` (dashed reply), `A->B` (plain line), `A-)B` (async), `A-xB` (lost); `+` and `-` after the arrow (activation) are read and not drawn. `Note right of A: text`, `Note left of A`, `Note over A,B: text`. `loop`, `alt`, `opt`, `par`, `critical`, `break` and `rect` open a labelled box that `end` closes, `else` / `and` / `option` divide it. `autonumber` numbers the messages.
- **State** (`stateDiagram-v2`). `A --> B: event`, `[*]` as the start when a transition leaves it and as the end when one reaches it, `state "Long name" as id`, `id : description`, `state id <<choice>>` (also `<<fork>>`, `<<join>>`), and a composite `state id { … }` drawn as a box. `note` blocks are skipped.
- **Anything else** (`pie`, `gantt`, `classDiagram`, `erDiagram`, `mindmap`, `journey`, `gitGraph`, ...) is kept: the patch has `type: other` and the `source`, and a renderer shows the source as text. A `pie` is better as a `chart`, a `gantt` as a `timeline`.
- **Layout.** Ranks run along the direction (longest path, a cycle's closing edge drawn round the back), nodes in a rank are ordered to cross less, a label gets room on its line, and a `subgraph` wraps its nodes. A left-to-right chart wider than a phone (360 px at the label size) draws top down instead, so the words stay readable; write `TD` for a phone. A self link loops. `lib/yl/diagram.mjs` is the reference; other renderers port it.
- **Order is the story.** Nodes come on in the order they were written, about a fifth of a second apart, each edge right after the later of its two ends; a sequence comes on message by message. **Reduce Motion** (and a printout, the Telegram picture) shows it finished.
- **Colors** come from the agent's look (section 4, theme): nodes in its accent, lines in its ink, notes in its butter, so a diagram matches the agent that sent it in light and dark.
- **On a page.** Inside a `deck` or a `plan`, a diagram right after a `page` is that page's picture (see A page's picture under deck).
Props on the add: `title`, `caption`. Props the patch adds (the drawing):
- `type`: `flow`, `sequence`, `state` or `other`; `source`: the Mermaid as written (comments and unread lines included).
- `flow` and `state`: `dir`, `nodes` (`{id, label?, shape?}`; state shapes are `start`, `end`, `choice`, `fork`, `join`), `edges` (`{from, to, label?, line?: dash|thick, plain?, both?}`; `plain` is no arrowhead), `groups` (`{id, label?, nodes, in?}`).
- `sequence`: `actors` (`{id, label?, actor?}`), `steps`, in order: `{type: msg, from, to, text, line?: dash, head?: none|async|cross, both?}`, `{type: note, side: left|right|over, on: [ids], text}`, `{type: open, block, text?}`, `{type: else, text?}`, `{type: close}`; `numbered`.
Empty lists and unset options are left out. A node without a label is drawn with its id.
```
diagram "How an ask ships" caption="You ask. A lane builds it. It rides the next build."
flowchart LR
  you([You]) --> board[Board]
  subgraph fleet [The fleet]
    board --> lane[Lane]
    lane --> check{Checks green?}
  end
  check -->|yes| ship((TestFlight))
  check -.->|no| lane
end
```
```
diagram "What happens when you send a message"
sequenceDiagram
  autonumber
  actor U as You
  participant A as Yui app
  participant G as Agent
  U->>A: type and send
  A->>G: your words
  loop while it thinks
    A-->>U: working row
  end
  G-->>A: yl lines
  A-->>U: the screen
end
```
```
diagram "A TestFlight build"
stateDiagram-v2
  [*] --> Uploaded
  Uploaded --> Processing: Apple receives it
  Processing --> Valid: passes
  Processing --> Invalid: fails
  Valid --> [*]
end
```
Why this shape: the agent already writes Mermaid (a model has seen a million of them), `flow` already reads the flowchart subset, and Mermaid is the one diagram language that stays a readable fence on GitHub, in Telegram and in a log. The drawing is the phone's job, so it takes the agent's look and the phone's width; the agent never places a box. `shapes` stays for a picture that moves or is not a graph.

#### mock
`mock [title...] [frame=phone] [url=]`, then one `part` per line. A UI recreated from parts, so an agent can redraw a Yui screen, a screen it is proposing or a client's page instead of describing it: a frame (`phone`, `window`, `watch` or `browser`) with a nav bar, content, tabs and sheets in it, marked up like a `sketch`. It is drawn on the phone from the lines, in the agent's look, and sends no events; nothing in it can be tapped.
- **Frames.** `phone` [default] is a phone outline with the title at the top (left off when there is a `nav`). `window` is an app window, three dots and the `title` in its bar. `watch` is a small rounded screen, the `title` above it. `browser` is a window whose bar holds `url=` (or the `title`). Any other frame draws as `phone`, so frames can be added without a new YL version.
- **Order.** Parts stack top to bottom in line order, with three exceptions: a `nav` is always at the top, a `tabs` always at the bottom of the screen, and a `sheet`, `alert` or `keyboard` after them, whatever the order of the lines. Only the first `nav` and the first `tabs` count.
- **Marks and notes** as in `sketch`: `+hi` puts a highlighter swipe behind the part, `+x` strikes it out (the thing to drop), `+dim` greys it, and `note=` is a callout beside the frame with an arrow to it.
- **On a page.** Inside a `deck` or a `plan`, a mock right after a `page` is that page's picture (see A page's picture under deck).
Props: `title`, `frame` [phone], `url`.

#### part
`part KIND [text...] [options] [+hi] [+x] [+dim] [note=]`. One part of the screen. The first bare word is the `kind`, wherever it sits (as in `shape`); the rest of the positional text is its `text`. An unknown kind draws as `text`, so kinds can be added later.

| Kind | `text` is | Options |
|---|---|---|
| `nav` | the title | `back=` (the back label, `‹ Back`), `action=` (the right-hand button) |
| `tabs` | | `items=` (the tab names), `tab=` the selected one, by name or number from 1 |
| `text` | the words | `size=h1`, `h2`, `large` or `small` [body] |
| `row` | the title | `sub=`, `value=` (right side), `icon=` (a glyph in a tile), `+chev` |
| `field` | the label | `value=`, `ph=` (placeholder, greyed) |
| `button` | the label | `+ghost` (outline, not filled) |
| `toggle` | the label | `+on` |
| `slider` | the label | `value=` 0 to 1 [0.5] |
| `segmented` | | `items=` (the options), `tab=` |
| `card` | the title | `sub=`, `body=` |
| `image` | the caption | `ratio=16:9` |
| `avatar` | the initials | |
| `grid` | | `items=` (one cell each), `cols=` [3] (1 to 6); with no items, six empty cells |
| `divider`, `space` | | |
| `sheet` | the title | `items=` (its rows), a panel rising from the bottom |
| `alert` | the title | `body=`, `items=` (its buttons, the last one is the main one), a box over the screen |
| `keyboard` | | |

Props: `kind` [text], `text`, `sub`, `value`, `ph`, `icon`, `back`, `action`, `size`, `tab`, `ratio`, `cols`, `body`, `items`, `chev`, `ghost`, `on`, `hi`, `x`, `dim`, `note`. `items` is always a list. A `part` outside a `mock` stands alone as a one-part mock.
```
mock "Agents" frame=phone
part nav Agents action=Edit
part text "Who do you want to talk to?" size=h2
part row Basil sub="Groceries and meals" icon=B +chev +hi note="new badge goes here"
part row Penny sub="Budget" icon=P +chev
part button "New agent" +hi note="the one thing to tap"
part tabs items=Home|Agents|Me tab=Agents
```
```
mock "Sign in" frame=phone
part nav "Sign in" back=Back
part field Email value="chris@example.com"
part field Password ph="at least 8 characters" +hi note="show a meter here"
part toggle "Keep me signed in" +on
part button Continue
part keyboard
```
```
mock frame=browser url=yuigui.com/pricing
part text "Pricing" size=h1
part segmented items=Monthly|Yearly tab=Yearly
part card Crew sub="$12 a month" body="Every agent, every device" +hi note="the one we sell"
part grid items=Voice|Drawings|Timers|Games cols=2
part button "Start free"
```
Why this shape: twelve of the twenty drawings Chris asked for in the threads were a screen (docs/research/yl-visual-gaps.md), and a screen is a short list of the same few parts. The kinds are the parts every UI toolkit has, so an agent can redraw a foreign UI it has only seen in a screenshot. Marks are the ones `sketch` taught (flags that read as what they are), so a mock doubles as a review: strike what goes, light what stays. What it leaves out on purpose is listed, ranked, in the gap audit: parts side by side, gesture marks, board columns.

#### map
`map [title...] [caption=] [fit=auto] [center=lat,lon zoom=]`, then one `area`, `pin` or `route` per line. A small map, so an agent answers "where" with the place, not a list of compass points: countries or a drawn outline filled in, pins on the cities, routes between them, a caption under it. It is drawn on the device from a bundled world outline (Natural Earth 110m, public domain): no map tiles, no key, no network. It sits in the chat at the width of a bubble and sends no events.
- **The view.** `fit=auto` [default] frames everything the map holds, padded, never closer than about 8 degrees across, and crosses the date line when that is the shorter way (Russia with Alaska next to it, not the whole world between). `fit=world` shows the whole world. `center=lat,lon` with `zoom=` (1 the whole world, each step twice as close) sets the view by hand. The drawing keeps between square and twice as wide as tall; the short side grows to fit.
- **Title and caption** as in `shapes`: a small heading above, the sentence that says what the map means under it.
- **Colors** come from the agent's look: the land is its ink at a whisper, areas, pins and routes take `tone` (as in `shape`), so the map matches the agent in light and dark.
- **Order is the story.** Parts come on in line order, a beat apart: areas fill in, pins spring up, routes trace themselves on. `+pulse` on a pin keeps it breathing, the one place to look. Reduce Motion (and the Telegram picture) shows the finished map at once.
- **Labels** find room on their own: beside a pin, past a route's last stop (or over its middle), on an area's biggest piece, each moved to the next spot when an earlier label or a pin is there.
- **On a page.** Inside a `deck` or a `plan`, a map right after a `page` is that page's picture (see A page's picture under deck).
Props: `title`, `caption`, `fit` [auto], `center`, `zoom`.

#### area, pin, route
`area [label...] [CODES] [lat,lon|lat,lon|...] [codes=] [pts=] [tone=] [+dash]`. A filled region. Bare words of two or three capital letters, or options that all are (`CN|MN|KR`), are country codes (ISO 3166 alpha-2 or alpha-3, any mix): they go in `codes`, wherever they sit. Options that are all `lat,lon` places are a drawn outline, `pts`, for borders that are not today's (an empire, a flood zone, a delivery area). An area can have both. The rest is the `label`; quote a label that looks like a code (`area "EU"`). A code the map does not know is left out. `+dash` draws a dashed edge and a fainter fill: raided, planned, disputed, not quite there; its tone defaults to `mute`.
Props: `label`, `codes`, `pts`, `tone`, `dash`. `codes` and `pts` are always lists.

`pin [label...] [lat,lon] [at=] [tone=] [+pulse]`. A place. The first bare `lat,lon` is `at` (decimal degrees, north and east positive); the rest is the label. A pin with no place is not drawn. Give it an id (`pin@ka ...`) and routes can stop at it by name.
Props: `label`, `at`, `tone`, `pulse`.

`route [label...] [STOPS] [pts=] [tone=] [+dash] [+arrow]`. A path over the map. The first options are its stops, `pts`, each a `lat,lon` or a pin's id: `route "Silk Road" 34.3,108.9|ka|41,28.9`. It is a smooth curve through its stops (two stops bow a little, like a road over the curve of the earth); `+arrow` puts a head on the last one, `+dash` dashes it. A stop it cannot place is skipped; a route with fewer than two is not drawn.
Props: `label`, `pts`, `tone`, `dash`, `arrow`. `pts` is always a list.

An `area`, `pin` or `route` outside a `map` stands alone as a map of just that part. Places go out as written (`"47.2,102.8"`); renderers read the numbers. The reference scene (fit, projection, labels, clock, the words) is `site/lib/yl/map.mjs`.
```
map "The Mongol Empire, 1279" caption="24M km². The biggest land empire there has been."
area "Mongol Empire" 53,140|43,131|34.7,126.5|22.3,114|24,98|34,70|25.5,57|33,44|41,31|46,30.5|54,23|60,56|55,95 tone=butter
area Raided PL|HU +dash
pin@ka Karakorum 47.2,102.8 +pulse
route East ka|37.6,127 +arrow
route West ka|50.4,30.5 +arrow
```
A lesson page with its map:
```
deck "The Mongols, by the map"
page "How far it reached" body="Korea to Hungary, the Siberian forest to Persia."
map caption="Karakorum sat in the middle and rode out every way."
area Empire MN|CN|KR tone=butter
pin@ka Karakorum 47.2,102.8 +pulse
page "The biggest one on land"
chart bar "Land empires, million km²" x=Mongol|Russian|Qing|Roman y=24|22.8|14.7|5
```
Why this shape: "where" questions (history, travel, a delivery area, a storm) kept coming back as compass-point bullets, and a map says them at a glance. Country codes are words every model already knows, `lat,lon` is how every model already writes a place, and a drawn outline covers the borders that are not today's. No tiles and no key, so it costs nothing, works offline and never leaks where someone is looking. `shapes` draws an idea, `map` draws a place.

### game
`game KIND [title...]`. A small game the person plays on the phone, so an agent can put something playable on screen in one line. The first bare word (not quoted, not options, starting with a letter) is the `kind`, wherever it sits; the rest of the positional text is the `title`. Kinds are matched without case. A game opens on the stage (section 5) unless it says `+inline`, and like any component it can go to a page (`>2 game snake`), be saved and shown, and sit on the shelf. Every game event carries `kind`.

v0 kinds:

- **`tictactoe`**, turn-based against the agent. Cells are numbered 1 to 9 in reading order (1 top left, 5 the middle, 9 bottom right). The board is two lists of cells, `x` and `o`: `x=5|1 o=9`. `you` [x] is the person's mark, `first` [you] (or `agent`) who moves first. The person taps an empty cell on their turn and the game emits `{kind, move, x, o}`: the cell and the whole board after the move, plus `winner` (`x`, `o` or `draw`) when that move ends the game. The agent answers in its next reply with a patch of **its own list only**, its old cells plus the new one: `~game o=1|7`. It aims at the preset name because ids only resolve inside the reply that made them (section 7, Locking), and the newest game on any screen takes it. The person's cells stay as they are, since a patch only changes the props it names. While it is the agent's turn the board waits and the cells do nothing. When the agent's patch ends the game the app shows it and sends nothing. A finished game shows the winning line and Play again, which clears the board on the phone and emits `{kind, again: true}`; the agent's next patch starts the new round's list (with `first=agent`, that patch is its opening move). A cell outside 1 to 9 is ignored, and a cell in both lists is `x`'s. To start over from the agent's side, send the `game` line again.
- **`snake`**, real time, runs on the phone. `speed` [2] from 1 (slow) to 5, `size` [15] cells a side, from 10 to 20, `best` a score to beat, shown on the board. Swipe on the board or use the arrow pad. Nothing is sent while playing. At game over it emits `{kind, over: true, score}`. Play again restarts on the phone and sends nothing until the next game over.
- **`memory`**, match the pairs. `pairs` [6] from 2 to 12; `items` the faces, emoji or short words (a list, like `items=🍎|🍌|🍇`, numbers stay text); with no `items` the app picks emoji. Cards are shuffled on the phone. Finding every pair emits `{kind, over: true, moves, seconds}`. Play again reshuffles.

Any other kind still parses, and the app shows "This game isn't in this version of Yui" in its place, so kinds can be added without a new YL version. Reduce Motion swaps card flips, the winning line and snake easing for plain fades and steps. Haptics: a light tap on a move, success on a win, a match or food, a warning on a loss or a crash.
Props: `kind`, `title`, `you` [x], `first` [you], `x`, `o`, `speed` [2], `size` [15], `best`, `pairs` [6], `items`, `+inline`. `x` and `o` are always lists of numbers (`x=5` is `[5]`, a part that is not a number is dropped); `items` is always a list of text.
```
game tictactoe "Beat me"
~game o=1
game snake speed=3 best=41
game memory "Fruit pairs" pairs=4 items=🍎|🍌|🍇|🍓
```

### Music: loop, drums, keys, chords, tuner, metronome (draft)
Six instruments on one sound engine, designed in [Music tools](/developers/music) (spec `MUSIC.md`, YUI-116). The parsers read them today and the playground plays them; the app draws them from its step 2. Until then an agent should not send them to a phone. Each takes one special positional, wherever it sits, and the rest is the title: `loop [BPM]`, `drums [RxC]`, `keys [KEY] [SCALE]`, `chords [KEY] [I-V-vi-IV | C|G|Am|F]`, `tuner [guitar|ukulele|bass|chromatic]`, `metronome [BPM]`. The instruments open on the stage unless `+inline`; the metronome sits in the chat. Props, events and the sound words are in the music spec.
```
loop 96 "Boom bap" p=x...x.x.|....x...|..x...x.|xxxxxxxx +play
chords G I-V-vi-IV
~chords key=D
```

### say (core, not a preset)
`say text...`. A plain text bubble inside a screen.

### Body text (renderers)
How every renderer draws words: `say`, a `page` or `card` body, a question's `body=`, chat text on the stage. The site does it in `site/lib/yl/readtext.mjs` (with `readtext.test.mjs`); the app copies the rules in Swift (YUI-196).

1. **Body is the default.** Regular weight, about 15 to 17 points on a phone, line height 1.5, a measure of about 70 characters (`54ch` in Nunito). Display type (large, bold) is only for words that fit on one or two lines: a page title, a card title, or a `say` or stage line of 60 characters or fewer with no list or second paragraph.
2. **Longer text is body, never all bold.** A `say`, page body, card body or text under a chart over 60 characters reads as body. A stage line over 60 characters drops from display to body size.
3. **A small markdown reader.** `#`, `##`, `###` headings (drawn at most 1.3 times body, bold), `**bold**`, `*italic*` or `_italic_`, `` `inline code` ``, `[links](url)`, `-` and `1.` lists. A raw `**`, `#` or backtick never shows: a marker that does not close is plain text.
4. **`Label: value` lead-ins.** A line that starts with a short label (up to 4 words, capitalised) and a colon reads as a lead-in: the label takes the accent colour and bold, the value stays body. `**Label:** value` reads the same. A leading ✅, ❌, ⚠️, ➡️ or • sits before the label. A time like "Meet at 9:30" or a sentence with a colon is prose, not a lead-in.
5. **Whole thoughts stay together.** On the stage, a paragraph of up to 3 sentences and 70 words is one page. Longer splits after every second sentence. A list, a heading or a lead-in paragraph is never split or flattened, so the reader sees its line breaks.
6. **One line per say.** A YL line has no newline, so a list in a `say` is one `say` per point. Multi-line text (the chat reply, a page `body` from a form) goes through the reader whole.

Playground: `/playground?demo=body-text`.

### theme (core, not a preset)
`theme [set] key=value...`. Restyles the agent's own look in the app: background, bubbles, accent, avatar chip, corner radius, type and motion, in light and dark, for every screen of its thread and its row in the agent list. Nothing renders on screen except a one-line note; the look is saved on the agent (`yui_agents.theme`, spec `AGENTS.md`) until the next theme line or the person changes it.

- A **set name** starts fresh from that set: `theme autumn`. Sets, by hue: `yui candy berry cherry coral sunset peach autumn honey lemon lime matcha forest mint teal sky ocean midnight lavender grape slate mono`, plus the personality sets `wizard coach zen studio night counsel`. `theme reset` goes back to the agent's own default (seeded from its name, so every agent looks different out of the box).
- **Keys alone** change only what they say: `theme accent=#7B5CFF bg=cream radius=round`.
- `accent=` a `#RRGGBB` hex or a set name used as a color. `bg=` a hex or `cream|paper|white|mist|sand|blush` (the light-mode paper; dark mode is derived from the accent).
- `radius=round|soft|square`, `font=rounded|default|serif|mono`, `weight=regular|bold|heavy` (headings and names), `motion=bouncy|calm|snappy`.
- **Motion look**, how this agent moves, in the person's words (YUI-123): `pace=slow|even|quick`, `ease=float|spring|sharp|heavy`, `enter=rise|pop|slide|drop|fade`, `pulse=soft|beat|tick|still`. Each one changes that part of the `motion=` character and nothing else: "make it feel heavy and punchy" is `theme pace=quick ease=heavy enter=drop pulse=beat`, "drifts like water" is `theme pace=slow ease=float enter=rise pulse=soft`. What each value does is section 5, Stage motion. The look is saved on the agent with its colors; `motion=` alone starts the four keys fresh from that character (`theme motion=calm` undoes the words), and a set name starts everything fresh.
- **Style profile**, the screens this agent prefers: `screen=chat|full` (whether components open on the stage by default, section 5), `gallery=row|feed|row3d|grid`, `chart=line|bar|area|scatter|pie|donut`, `buttons=row|stack`. The agent is told its profile every turn, and renderers use it as their default.

Guardrails: the app never lets a theme make text unreadable. Colors are adjusted until body text reaches 4.5:1 against its background and controls 3:1 (WCAG AA). Sizes and tap targets never change, radii and type come from fixed scales, and unknown names or values are ignored. The op is `{op: "theme", screen, props}`, with the set name in `props.name`. It takes no `@id`, advances no counter, sends no event, and leaves an open group open.

### theme app (core, not a preset)
`theme app [set] key=value...`. Offers a new look for Yui itself: the agent list, the tab bar, Settings and Yui's own thread, not this agent's thread. It never applies on its own: the app draws a preview card (Now beside the new look, light and dark) with **Use autumn** and **Keep mine**, and only the person's tap changes anything. `theme app reset` offers Yui's own look back.

Same sets and look keys as `theme` (`accent bg radius font weight motion pace ease enter pulse`), but strict: an unknown set, key or value, a style profile key, a number radius, a short hex or any flag is an error line, because the preview must be exactly what Apply does. The op is the theme op with `props.scope: "app"`. Only agents the person owns may send it. Full spec: `RESTYLE.md` (yuigui.com/developers/restyle). Vectors: `31-theme-app.json`, run by every parser.

### Agent tables: table create, put, query
An agent keeps data on the phone, per agent, across replies: a workout log, macros, a small CRM. The full spec is `spec/TABLES.md` (yuigui.com/developers/tables); this is the grammar.

- `table create name col:type...` (core) makes a table or changes its columns. Types are `text`, `number` (a unit may follow: `Cal:number:kcal`), `date` and `bool`; 12 columns at most. The op is `{op: "table", screen, name, cols: [{name, type, unit?}]}`.
- `put table [key] col=value... [+delete]` (core) upserts one row by key: only the named columns change. With no key the row is appended. `+Col` sets a bool column, `col=` empties a cell, `+delete` takes the keyed row out. The op is `{op: "put", screen, table, key?, values, delete?}`. A put that does not fit its table is refused whole on the phone, and the agent is told.
- Neither core word takes an `@id`, advances the counter, draws anything or ends an open group. Dates may be written `today`, `today-7` or `now`; the phone reads them in its own time zone.
- `query table [where=] [sort=] [limit=] [cols=] [group= sum= avg= min= max= +count] [as table|list|chart|stat|send] [title...]` is a preset: a live view of the rows, drawn with `table`, `list`, `chart` or `stat`, or a card that sends the rows to the agent when the person taps Send. `where` clauses (`Day>=today-6|Cal>100`), `sort` (`-Cal` high to low), `cols` and the totals are lists. It takes an `@id` and patches like any preset (`~today where=Day=today-1`), and redraws when a `put` lands.
```
table create meals Day:date Food:text Cal:number:kcal Protein:number:g
put meals Day=today Food="Chicken bowl" Cal=640 Protein=52
query meals where=Day=today sum=Cal|Protein as stat y=Cal label="Today"
query meals group=Day sum=Cal sort=Day as chart bar x=Day y=Cal
```

## 5. Screens, patches, saved screens

**Routing.** `>2 timer 90` sends one line to screen 2 and brings screen 2 forward. `>2` alone moves focus: every following line goes to screen 2 until the next bare `>S`.

**Patching.** `~target args` updates a component already on screen without re-sending it. `target` is an id (`timer@hiit` gives id `hiit`) or a preset name. The newest matching component on any screen wins. Args are parsed with the target's preset rules, so `~hiit 30/10` and `~hiit rounds=10` both work. `~preset@id` (the add's head with a `~` in front, a common slip) aims at the id when this reply made it and it is that preset, and otherwise at the preset name: `~card@week` in a later reply patches the newest `card`. An id this reply gave to another preset makes it an error. A live timer keeps running through a patch; the time left is clamped to the new phase length.

**Ids that last.** Most ids only resolve inside the reply that made them. Two kinds last, so a later reply can reach one component among many by name: an `@id` on a page (screens `2` to `12`), and an `@id` on a component that came back from a saved screen (`show`). `~need-t_x +lock` locks that one `choose` on page 2, and `~lane-app "Build 106 is VALID"` rewrites that one `now` row, where `~choose` or `~now` would hit the newest of the preset. The patch parses its args with the lasting id's preset, as in the same reply, and a timeline row's `kind=` moves it in place (`~rel-YUI-54 kind=done`, section 4, timeline). An id this reply makes shadows a lasting one of the same name, a preset name still means the preset (`~timer` is the newest timer, whatever ids say), `~preset@id` aims at a lasting id when it is that preset, and a lasting id of another preset makes it an error, as above. Auto ids (`n1`, `c2`, and any id that looks like one) never last: every reply counts from 1 again. Nor do `custom` blocks, which are replaced, not patched. An id stops lasting when its page is cleared (`>2 clear`) or its component leaves the screen.

The renderer knows which ids last; the parser does not. So before it parses a reply, the renderer hands the parser those ids with their presets (`known`: `{"need-t_x": "choose", "lane-app": "now"}`), and a patch to one of them is a normal patch op. A patch that only touches a page does not bring the page forward (Pages, below), and a reply of nothing but patches sends no push notification, so an agent keeping a page current, a dashboard or a list of asks, patches the parts that changed and never re-sends the page. The patch also reaches the saved screens that hold that id, unless the name was saved again after it, so a page kept current this way reopens current from the shelf. The reference function is `lastingIds(state)` in `yl.mjs`, fed to `parse(text, known)` or `new StreamParser(known)`; the app builds the same map from its thread (`ChatStore.lastingIds`) for `YuiLines.parse(_:known:)`. Python and Kotlin take `known` on `parse` and the parser constructors, Rust on `parse_with` and `Parser::with_known`. Conformance vectors may carry `known` (section 12).

**The stage.** Some moments deserve the whole phone. The stage is a full-screen layer over the chat, in the agent's own look, with the chat right underneath.

- `>full` alone opens the stage and routes the lines that follow onto it; `>full timer 40/20x8 Tabata` sends one line there. `close`, or `>chat` alone, closes it and sends the lines that follow back to screen 1. `close` takes nothing else. The op is `{op: "close", screen: "full"}`.
- Some components on screen 1 open on the stage by themselves: `timer`, `camera`, `mic`, `deck`, `plan`, `game`, and a `gallery` laid out as `row3d`. `+inline` keeps one in the chat: `timer 5m Plank hold +inline`.
- **Workouts are always full screen.** A `timer` with rounds or rest (`40/20x8`, `90/30`) is a workout. It opens on the stage even with `+inline` and even when the agent prefers the chat.
- The agent's style profile sets the default for everything else (section 4, theme): `screen=full` opens every component on the stage unless it says `+inline`, and `screen=chat` keeps everything in the chat unless it is routed with `>full` or is a workout.
- A member of a group (a `page` under a `deck`) goes wherever its group went. Patches never move a component.
- The person closes the stage with a swipe down or the X. Nothing is lost: a running timer keeps running and shows as a small pill in the chat, and tapping any pill brings the stage back. Opening and closing sends no event.
- Where the renderer has no room for a stage (Telegram, a watch), staged components render in line as usual.

The reference function is `onStage(op, style)` in `yl.mjs` (and `YuiLines.opensOnStage` in the app). Conformance vectors may carry `stage`, the ids of the adds that open on the stage, and `style`, the agent's style profile for that vector.

**Stage first (YUI-119).** Yui lives on the stage. The chat stays, as the record of what was said and shown, one tap away. Nothing changes on the wire: any reply an agent sends today plays this way, and the same lines still draw as a thread wherever there is no stage.

- **The first send opens the stage.** The person talks or types, and the stage is up at once, before the reply: their words small at the top, a mark in the agent's color breathing in the middle, and the working row's words under it (`Checking TestFlight · 3s`, with the `doing` bar, The working row below). No typing dots in a chat. How the mark moves is Stage motion, below.
- **The reply plays as chunks.** A chunk is one line to read and one picture: a `say` (or a line of chat text) and the first component after it that is not a question. A picture with no line before it is a chunk of its own; so is anything else that takes the whole phone (a `timer`, a `game`). Inside a `deck` or a `plan`, each `page` is a chunk, its title the line, its body or points under it, and its picture (the `sketch` or `shapes` right after it) above. Plain chat text with no lines plays one chunk per paragraph, a long paragraph split after every second sentence. Segments at the top show how many there are; a tap goes on, a tap on the left third goes back.
- **Questions come last, all at once.** Every question in the reply (`ask`, `choose`, `pick`, `slide`, `form`, `mic`, `camera`, in a `plan` or not) waits until the last chunk, then all of them show on one screen with one Send. When they came from a `plan`, Send answers as that plan: one `{plan: {...}}` event, and the answers land in the record as the person's message, as the plan's fold rules say. Loose questions send their own events, in line order, on the same Send.
- **A titled question in a deck is a page (YUI-183).** Inside a `deck` (not a `plan`), a `choose` or `pick` with its own `title=` is a page of the deck: it plays in turn as its own chunk, its title and body on the card, and a tap on it goes at once, as its own event. Basil's week is a deck of this kind, a day a card and each meal a swap; gathered at the end under one Send, a swap would never go. A question with no title (a lesson's quiz) still waits for the end.
- **A reply of one chunk and nothing to ask is one screen**: the answer, with no arrows. That is most replies (`Am I on the latest build?` gets `Yes. Build 160, the newest.` and a picture of the two devices).
- **The chat is the record.** Everything the stage showed is written to the thread as it plays: the person's words, each chunk as its line with its picture small beside it, the plan's chip and the answers. A tap on a chunk in the record opens the stage at that chunk. Nothing is lost when the stage moves on.
- **The bars.** Top left: a settings button, then the agent picker (face and name). Top right: the chat record, with a count of what is new there. Bottom right: a big mic (66 pt), tap and talk, the words appear as they are heard and the message sends when the person stops; beside it `T`, which opens the text field full width only when asked for, and `+`, which attaches (photos sit in the field while the person types). Settings turn each of mic, `T` and `+` on or off; one of mic and `T` always stays.
- **A way home (YUI-195, SITE-98).** Every full-screen answer (plan, deck, flow, timer, `>full`, and a chat answer on the stage) can be put away, and it is always local: no turn, no model call, no event to the agent. Nothing is lost, the answer stays in the record and comes back from its chip (Reopen, Play on the stage). Three ways, all landing on the chat home: (1) a close, a round × at the top left of the stage; (2) **Back home** on the last page of a deck, plan or flow, and after a plan or flow is sent, in the primary spot (the mic's place, the same size and weight as the Stop button), never a "Got it" or "OK"; while questions are still unanswered the primary spot stays the submit; (3) pulling the stage down on touch: the card follows the finger at about half speed (a small rubber-band), a pull of 110 points closes it, a shorter one springs back; a pull that starts sideways, on a slider or field, or while the content is scrolled down is not a dismiss. The site does it in `site/app/playground/dragdown.js` (`useDragDown`), `BackHome` in `flows.js` and the Back home button in `ChatFab`; the app copies the rule (YUI-195).
- **Sound keeps playing across screens (YUI-200, SITE-100).** A loop, a metronome and held (latched) keys belong to the chat, not to the screen they were started on. Swiping to another screen of the same chat, or from the stage to the chat and back, stops none of them, and they layer: a loop on screen 2 and keys on screen 3 sound together. Coming back to the screen shows the same state (the playhead, the tempo and grid as edited, the held keys). What stops sound: its own stop, the person closing the chat (or the app going to the background without audio), leaving the page (a site page or a new thread), or a new answer replacing that same node id. There is one audio engine for the whole app, never one per screen, and it can list what is sounding (the site: `window.yuiMusic.active()`, one `{id, kind}` per voice; `stopAll()` ends them). The site does it with `KeepCtx` (`site/app/playground/music/keep.js`), the engine's voice list (`music/engine.js`) and the loop, metronome and keys in `music.js`; the app copies the rule (YUI-200). Try it: [/playground?demo=layered-loops](/playground?demo=layered-loops).
- **A saved screen opens with no turn (YUI-200, SITE-100).** A tap whose only job is to open a saved screen is local: a shortcut, chip, review or backlog row with `show=`, a project card with `open=`, a shelf chip. The screen swaps in (or the pager swipes to the page that holds it) and nothing goes to the agent: no request, no model call, no `[yui]` event, so no working row and no tokens. Only a tap that answers something or asks for something new is a turn. A shortcut with both `show=` and `say=` opens the screen and sends nothing; the `say=` is for a host that has no saved screen by that name (the name is missing or was forgotten), where it goes as usual. The site checks it in `site/scripts/layer-e2e.mjs` (zero `/api/chat` requests after the tap); the app copies the rule (YUI-200).
- **Message times (YUI-202, SITE-99).** Every message the chat keeps carries the moment it was sent, and the thread says so in the person's own time zone. (1) A **day divider** sits centered above the first message of each day: `Today`, `Yesterday`, then `Mon 28 Sep` (the year joins it when it is not this year). The first dated message always gets one. (2) A **quiet time** (`9:41 AM`, the person's own 12 or 24 hour clock) sits under each group of messages, a group being a run from the same side (the person, or the agent) with no message from the other side between; it shows the time of the last message in the run. Small, muted, regular weight, on the sender's side. Cards like "Opened" and "Stopped" carry no time and never break a run. (3) The **stage** shows the current answer's own time in small type above it: `9:41 AM` when it is from today, `Yesterday 9:41 PM`, then `Mon 28 Sep, 9:41 PM`, so an old answer never reads as new. (4) A message from before times were kept has none: no divider, no time, no break in a group. The site does it in `site/lib/chat/when.mjs` (`stamps`, `stageTime`, with `when.test.mjs`); the app copies the rule (YUI-202).
- **How agents write for it**: a line and a picture per point, never a heading over a paragraph; questions in one `plan` after the findings. The guide teaches this (`CHANNEL.md`, Use it well: Show, don't say).

The reference function is `stageChunks(nodes)` in `site/lib/yl/chunks.mjs` (plus `textChunks(text)` for plain text): a reply's nodes in, `{chunks, questions, plan}` out. The playground demos are `/playground?demo=stage-first` and `/playground?demo=week-deck` (Basil's week, a swap on one tap). The app (YUI-119 step 2, bars YUI-121 and YUI-122) follows it; until that build the app keeps the chat first.

**Stage motion (YUI-120).** The stage moves with the agent: what it is doing sets the move, who it is sets the character. Nothing changes on the wire and the agent does nothing extra. The motion sits on the stage's layout (the bars, the chunks, the questions screen) and never replaces it.

- **Moods**, read from the turn in this order, the first true one wins: `error` (the turn failed, or the reply was nothing but error lines), `listen` (the mic is open), `ask` (the questions screen is up), `done` (a chunk is on the stage), `found` (the reply just came in: one beat before the first chunk), `work` (a `doing` line is showing), `think` (sent, no `doing` yet), `idle`.
- **What each mood does.** The mark in the agent's color is the one thing that moves. `idle` breathes. `listen` shrinks toward the mic, and the mic's ring beats with the voice. `think` turns its layers slowly over each other. `work` depends on the `doing` words: looking (`Checking`, `Reading`, `Searching`...) sweeps a light round the mark; making (`Drafting`, `Building`, `Writing`...) stacks its layers up one after another; other words morph it. `found` bursts once and settles. `done` hands the stage to the chunk. `ask` brings the questions one by one. `error` gives a small shake, goes grey and offers Try again.
- **The doing line is the lever.** The first verb in a `doing` picks looking or making; a `doing` that starts with `Found`, `Got`, `There's`, `Spotted`, `Ready` or `Done` is the found beat (`doing "Found a dry window" 3/3`). An agent that sends no `doing` still gets think, found and done.
- **Moves between chunks.** The stage opens from the mic, a wash of the agent's color growing out of the bottom right. A chunk comes on in the look's enter (below); going back comes on from the other side. The questions arrive a stagger apart. The mic's ring, the segments and the `doing` bar move in the same timing.
- **Character, from the look.** `theme motion=` (section 4) sets it, and an agent whose look names none moves `bouncy`. A look is four things: pace (`slow`, `even`, `quick`: how long every move takes), ease (`float`, `spring`, `sharp`, `heavy`), enter (`rise`, `pop`, `slide`, `drop`, `fade`: how a chunk and a question come on) and pulse (`soft`, `beat`, `tick`: how the mark breathes and the mic ring beats). `calm` is slow, float, rise, soft. `bouncy` is even, spring, pop, beat. `snappy` is quick, sharp, slide, tick. The same turn looks different on two agents; the agent's events land at the same times, only the moves differ.
- **A look in words (YUI-123).** The person says how an agent moves ("make it heavy and punchy", "it drifts like water") and the agent writes those four keys on one `theme` line (section 4): `theme pace=quick ease=heavy enter=drop pulse=beat`. The app saves them with the agent's colors, and every stage after that moves that way. Each key overrides the character's; an unknown value is dropped. `pulse=still` is a mark that does not breathe, which is not Reduce Motion: chunks still come on. The reference for words to keys is `wordsLook(words)` in `motion.mjs`, a small rule table (heavy is ease heavy and enter drop, punchy is pace quick and pulse beat, drift is slow, float, rise and soft; a word with a no in front is skipped; the first word to set a key keeps it). An agent uses its own judgment and may pick any keys; the table is what a host with no model at hand does.
- **Reduce Motion wins.** It gives the still look: no movement, no breathing, no sweep or burst, every part in its last place; moods still change what is written (`Reading your calendar`, `That didn't go through.`). Anywhere that cannot animate draws the same still stage.

The reference functions are `stageMood(turn)`, `doingMood(doing)` and `motionLook(theme, custom, reduced)` in `site/lib/yl/motion.mjs`, with `motionTimings(look)` for the numbers, `wordsLook(words)` and `lookLine(look)` for a look in words, and `mergeTheme(saved, props)` in `look.mjs` for how theme lines stack (tests: `motion.test.mjs`, vectors `19-theme.json` and `31-theme-app.json`). The playground demos are `/playground?demo=stage-motion` (the same turn on two agents side by side, every mood, the hand-offs, and the look) and `/playground?demo=motion-looks` (two agents whose looks were said in words, and a box to say a new one). The app (YUI-120 step 2) follows it.

**Pages.** Beside the chat, the app gives every agent up to eleven more screens, `2` through `12`. Screen `1` lines render in the chat as usual; a screen from `2` to `12` becomes a page the person swipes to, left to right, as soon as something lands on it. Pages run in number order and a number can be skipped (`>5` alone makes the chat and one page). A small row of dots above the bar shows how many there are and which is on show; the pages and the dots slide with the finger, and a tap on a dot jumps there (YUI-187). A sideways swipe anywhere on the phone changes pages, and a control that needs a sideways drag (keys, pads, a map, a slider) owns it only inside its own frame, never at the screen's edges. Screen readers hear the dots as one control ("Screen 2, 2 of 4") and page with its adjustable action. A page is full screen: the top bar (agents, settings) and the composer stay with the chat, so a page is for reading and tapping, and a swipe back to the chat is the way back to type, unless the agent keeps the composer on it with `talk` (below).

- A page keeps what lands on it across replies, so an agent can leave a focus timer on `2` and a running list on `3` while the chat goes on. Adds stack in order, a later reply patches them by preset name (`~timer`) or, when they have an `@id`, by that id (Ids that last, above), and `>2 clear` empties the page, which removes it; if it was showing, the person goes back to the chat.
- A route to a page beats the stage defaults: `>2 timer 25m Focus` sits on page 2, not on the stage, whatever the agent's style profile says. Workouts still always open on the stage.
- A reply that sends a line to a page brings that page forward with a spring (a cross-fade under Reduce Motion). A line that only patches a page does not move the person. Nor does a redraw beside an answer: a reply with something for the chat that also redraws a named page (`>4 clear`, its lines, `save groceries`) keeps the person on what it said, and the redraw keeps the page current, like a patch. A redraw alone still brings its page forward (YUI-183: Basil's week lands as a deck on the chat while This week and Groceries are drawn again).
- A page a reply names with `save` is a standing page, like the home's. Its pickers (Basil's swap buttons, a grocery list's ticks) are tools the person uses when they like, not asks: they never show under Waiting on you or in Review. The chat keeps a small "On screen 2" pill where the line was sent; tapping it goes to the page.
- Any other screen name (`>stats-view`, `>13`, `>0`, `>02`) has no page of its own and renders in the chat, in line order. The stage (`>full`, and the presets that open there) is a layer over whichever page is showing, the same as over the chat.
- Swiping between pages sends no event. The page an agent's thread was on is remembered per agent.
- **Chat with a screen.** `talk` keeps the composer on the page the line is on: `>2 talk`, or `talk` after `>2`. The page stays full screen, with the composer at the bottom. What the person types there goes to the agent as a normal message tagged with the page (section 7), and shows in the chat with a "From screen 2" mark that goes back to the page. `talk off` takes the composer away, and so does `>2 clear`, since the page goes with it. Like the page's content, it lasts across replies. `talk` is one word because it rides on the routing the page already has: a flag on `>2` would make `>2 +talk` a second grammar for routes. On any screen that is not a page (`1`, `full`, `13`) it does nothing; the chat always has its composer. It takes nothing but `on` or `off`. The op is `{op: "talk", screen, props: {on}}`; it takes no `@id`, advances no counter and sends no event.
- On the web (the site chat, SITE-83) pages work the same, with a trackpad's sideways swipe and the arrow keys as well as touch (on the chat, a playing answer takes the arrows first, then hands on to the pages); off a page that keeps talking, the bar holds only the dots. The playground's phone shows one screen at a time, picked by its tabs or the dots.
- Where there is no room for pages (Telegram, a watch), everything renders in one column in line order, as before.

The reference function is `pageOf(screen)` in `yl.mjs` (`YuiLines.page(of:)` in the app, `page_of` in Python, `pageOf` in Kotlin): the number for `2` to `12` (written plainly, no leading zero), `1` for everything else, `full`, `chat` and `13` included. `pageForward(ops, style)` gives the page a reply brings forward, or null to stay (the app's `ChatStore.pageUpdate`), and `standingPages(ops)` the pages it named with `save` (`YLScreen.namedScreens`); tests `pages.test.mjs`. Conformance vectors may carry `pages`, the page of each add in order. `talking(ops)` (`YuiLines.talking` in the app, `talking` in Python and Kotlin) gives the pages whose composer is on after a run of ops, in number order; vectors may carry it as `talk`.

**Saved screens and the shelf.** A screen the person will want again gets a name, and from then on it costs two tokens to bring back.

- `save workout` stores the screen the line is on: every component on it, as the agent wrote it with its patches. After `>full` that screen is the stage. The name is the rest of the line, words joined by single spaces (`save leg day` and `save "leg day"` are both `leg day`), and names match exactly. Saving a name again replaces it.
- `show workout` puts it back, fresh: timers start from the top, nothing is answered yet. It lands on the current screen, except that a screen saved from the stage opens on the stage again, and a workout goes to the stage as always. A `show` in a later reply works: saved screens outlive the reply that saved them.
- `forget workout` takes it off the shelf. Forgetting a name that was never saved does nothing.
- **The shelf.** Every agent has one in its thread: a row of its saved screens, newest first, at the top of the chat. Tapping one reopens it on the stage without a turn and without a token. The person can take one off the shelf too (hold it, Remove). The shelf lives on the phone and is rebuilt from the thread, so it follows the person to a new install.
- Events from a component that came back through `show` or the shelf carry the name: `{"id":"hiit","preset":"timer","done":true,"rounds":8,"saved":"workout"}`.

The ops are `{op: "save" | "show" | "forget", screen, name}`. None of them takes an `@id` or advances the counter. The reference functions are `apply()` in `yl.mjs` (with `state.saved`) and `ChatStore.shelf` in the app.

**The drawer.** Each agent has a drawer in the app: drag right on the chat and it slides out from the left. The app owns its sections, their order and their look. Most of it fills itself: pinned screens are the shelf, To review lists the asks in the thread that have no answer yet, and About comes from the host. `menu` lets the agent fill three more lists with plain items, and nothing else, so no agent can crowd the drawer or restyle it.

```
menu review@dana "Invite Dana?" sub="requested yesterday"
menu backlog@deload "Deload week plan" sub=drafting
menu shortcut "Start today's workout"
menu shortcut@log "Log a meal" say="Log a meal: "
menu done dana
```

- The word after `menu` is the section: `review` (things waiting on the person, under the thread's own asks in Review), `backlog` (what the agent is working on or has queued, on Home) and `shortcut` (things the person asks for often, on Home beside the host's commands). `@id` names the item; without one it is known by its label, lowercased, with every run of other characters as one `-` (`Start today's workout` is `start-today-s-workout`).
- The label is the rest of the line, words joined by single spaces. The keys are `sub` (a quieter line under it), `say` (what a shortcut sends), `show` (a saved screen's name) and `url` (an `https:` link, or on a shortcut `yui://snap`). Values stay text. Other keys and flags are dropped.
- An item with an id already in the drawer replaces it, in whichever section it now names. `menu done dana` takes it out; `menu done` takes an id or a label. Taking out an item that is not there does nothing.
- Each section shows its newest item first and keeps 20; the oldest falls off. Labels longer than 60 characters are cut to 59 and an ellipsis.
- A tap on a shortcut sends its `say=`, or its label, as the person's message, as if typed (a `say=` that ends in a space goes in the composer to finish instead). A shortcut with `url=yui://snap` opens hold to snap and say in that thread and sends nothing until the person lets go: `menu shortcut@meal "Log a meal" url=yui://snap`. A tap on a review or backlog item opens its `show=` screen on the stage, or its `url=` in the browser, with no turn; with neither, it goes back to the agent as an event (section 7) and the agent answers with the screen.
- The drawer lives on the phone, per agent, and is rebuilt from the thread like the shelf, so it follows the person to a new install.
- `menu` is a core word like `save`: no `@id` counter, no screen, and it leaves an open group alone. The op is `{op: "menu", screen, id, props: {bucket, label, sub?, say?, show?, url?}}`, and `menu done id` gives `{op: "menu", screen, id, props: {done: true}}`. Where there is no drawer (Telegram, the playground, a watch) the line does nothing.

The reference function is `menuOf(ops, menu)` in `yl.mjs` (`YuiLines.menu(_:into:)` in the app): the three sections after a run of ops, each newest first, labels cut. Conformance vectors may carry `menu`, the sections after the input.

**The working row.** While an agent works on a turn, the app shows one working row where its reply will land: the agent's face, a working word and the seconds, `Pondering · 12s` (YUI-63). `doing` lets the agent put a few plain words there instead, and a thin bar when it knows how many steps there are.

```
doing "Reading your calendar" 1/3
doing "Checking the weather" 2/3
doing "Drafting the plan" 3/3
```

- The words are the rest of the line, joined by single spaces. A last bare `n/m` is the step: step `n` of `m`, with `m` at least 1 and `n` from 0 to `m`, drawn as a thin bar under the words. `doing 2/5` alone keeps the working word and adds the bar. A quoted `"2/5"` is words, and so is an `n/m` anywhere but last (`doing Reading 24/7 news`).
- It never renders as a bubble and never lands on a screen. It replaces the working word in the row that is already there: `Reading your calendar · 12s`, with the bar under it. The seconds keep counting from the start of the turn. The app shows one line and cuts long words with an ellipsis.
- Each `doing` replaces the last, so there is nothing to patch: send a new one. `doing off` puts the working word back. The reply ends the working row as it always has, and the next turn starts at the working word again.
- A `doing` line can come alone, in a message the host sends mid-turn, or at the top of the reply while the rest streams in. It sends no push notification and no event.
- **About one a second.** An agent sends a `doing` when the step changes, not on a timer. The app keeps only the newest, and a host may drop updates that come faster than about one a second and send the last one.
- **Groups.** Each agent working in a group thread has its own working row (spec `GROUPS.md`, One working row per agent), so Sage's `doing` shows in Sage's row only: `Sage · Reading your notes · 8s`.
- **Older apps** keep `Pondering · 12s`. A host sends `doing` only to an app build that draws it; before that build an app would fold the line into an Update chip, so the host leaves it out.
- `doing` takes words and a step only: no `@id`, keys or flags. It advances no counter and leaves an open group open. The op is `{op: "doing", screen, props: {text?, step?, of?}}`, and `doing off` gives `{op: "doing", screen, props: {off: true}}`.

The reference function is `doingOf(ops)` in `yl.mjs` (`doing_of` in Python and Rust, `doingOf` in Kotlin): the newest `doing` props after a run of ops, or null when there is none or the last was `doing off`. Conformance vectors may carry `doing`, that value after the input.

**The visual.** A live shader behind the stage, in the agent's colors and motion look, that listens to a voice, the music tools or the room. The full design, the frame budget and the rules are in `spec/VISUAL.md` ([try it](/playground?demo=visualizer)).

```
visual aurora react=voice
visual orb tone=mint
visual off
```

- One look: `orb`, `aurora`, `waves`, `grain` or `bloom` (missing means `orb`). `tone=` is `accent` (the agent's color, the default), a theme set name or `#RRGGBB`. `react=` is `voice` (the default), `music`, `mic` or `off`. Anything else (a flag, another key, a word that is not a look, two looks) is an error.
- It sits behind the stage's chunks, or alone on it. Behind words it dims and lays a scrim so the ink keeps AA contrast. Reduce Motion and Low Power get one still frame.
- The newest `visual` wins and stays until `visual off`. It never renders as a bubble, sends no push and no event, advances no counter and leaves an open group alone. Where there is no stage the line does nothing, and a host sends it only to a build that draws it.
- The op is `{op: "visual", screen, props: {look?, tone?, react?}}`, and `visual off` gives `{op: "visual", screen, props: {off: true}}`.

The reference function is `visualOf(ops)` in `yl.mjs` (`visual_of` in Python and Rust, `visualOf` in Kotlin): the newest `visual` props after a run of ops, or null when there is none or the last was `visual off`. Conformance vectors may carry `visual`, that value after the input.

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

Unknown types render as raw JSON so the gap is visible. Bad JSON is an error line. Every `custom` line is logged by its shape only (the type tree and key names, never a value), on the agent's own machine and only when its owner turns it on. When the same custom shape shows up again and again, it gets promoted to a preset. That is how the preset set grows from 80% coverage toward 95%. The log, the weekly report, the bar a shape must clear and the promotion checklist are in `spec/FLYWHEEL.md`, rendered at https://www.yuigui.com/developers/flywheel.

Custom blocks can take an id (`custom@countdown {...}`) but cannot be patched; send a new one.

## 7. Events back to the agent

Every interaction goes back as one small event: `{id, preset, ...value}`. Ids are the `@id` from the line, or `n1`, `n2`, ... in line order when none was given. `custom` blocks without an id get `c` plus the same counter, so `say`, `custom`, `say` gives `n1`, `c2`, `n3`. Only adds advance the counter; patches, errors and explicit ids do not. Examples:

```
{"id":"n1","preset":"ask","answer":"Yes"}
{"id":"dana","preset":"menu","bucket":"review","tapped":true}
{"id":"n3","preset":"pick","picked":["Dumbbells","Bands"]}
{"id":"hiit","preset":"timer","done":true,"rounds":8}
{"id":"n2","preset":"gallery","picked":[0,2]}
{"id":"n1","preset":"storyboard","order":[1,0,2,3]}
{"id":"war","preset":"timeline","order":["YUI-73","YUI-66"],"board":"yui"}
{"id":"n1","preset":"image","edit":{"box":[48,10,44,40],"instruction":"Paint this wall sage green"}}
{"id":"n2","preset":"chart","point":{"series":1,"index":3,"x":"Thu","y":179.5,"name":"Plan"}}
{"id":"n1","preset":"calc","values":{"v":20,"a":45,"g":9.81},"result":40.7747}
{"id":"n3","preset":"step","done":true,"index":2}
{"id":"n1","preset":"table","sort":"Mass","dir":"desc"}
{"id":"n7","preset":"choose","choice":"Cytoplasm","correct":true}
{"id":"n1","preset":"deck","done":true,"pages":7,"score":2,"of":2}
{"id":"site","preset":"plan","plan":{"kind":"Shop","pages":["Home","Contact"],"launch":"No rush"}}
{"id":"n2","preset":"project","open":"site-plan"}
{"id":"n1","preset":"narrate","done":true,"steps":3}
{"id":"n1","preset":"game","kind":"tictactoe","move":5,"x":[5],"o":[]}
{"id":"n1","preset":"game","kind":"tictactoe","move":3,"x":[5,7,3],"o":[1,9],"winner":"x"}
{"id":"n2","preset":"game","kind":"snake","over":true,"score":41}
{"id":"n1","preset":"game","kind":"memory","over":true,"moves":14,"seconds":52}
{"id":"n2","preset":"query","op":"row","table":"todo","key":"t3","values":{"Done":true}}
{"id":"n4","preset":"query","op":"query","table":"meals","cols":["Day","Food","Cal"],"rows":[["2026-09-25","Oats",300]],"count":1}
```

Agent tables (spec `TABLES.md`) add one event with no component: a `put` the phone refused comes back once after the reply as `{"op":"row","table","key","error","line"}`.

**Answers can change.** `ask`, `choose`, `pick` and `slide` stay live after the first answer. The chosen option stays marked, and the person can tap another option, change their picks and submit again, or move the slider again. Every answer after the first goes back as a new event with `changed: true`; an answer identical to the last one sent is not sent again:

```
{"id":"n1","preset":"choose","choice":"Push"}
{"id":"n1","preset":"choose","choice":"Pull","changed":true}
{"id":"n2","preset":"pick","picked":["Bench","Bands"],"changed":true}
```

The newest event for an id is the answer. The agent adjusts to it rather than arguing with it. Graded questions (a quiz with `answer=`) stay open too, so the person can try again.

**Typed on a screen.** Words the person types on a page the agent keeps talking on (section 5, Pages) are not an event. They go as a normal message whose first line names the page, then the words:

```
[yui] screen=2
Make Thursday a swim instead.
```

The words are about what is on that page, so the agent answers there: a patch (`~list ...`) or a line sent to it (`>2 say Done.`). Typed in the chat, the words go as they are. A slash command is still a command and carries no tag. The reference functions are `typedBody(screen, words)` and `readTyped(body)` in `yl.mjs` (`YuiLines.typedBody`/`readTyped` in the app, `typed_body`/`read_typed` in Python, `typedBody`/`readTyped` in Kotlin). Conformance vectors may carry `typed: {screen, words, body}`: `typedBody` must give `body`, and `readTyped(body)` must give back the screen and words, or nothing when the screen has no page.

**About an item.** Words the person sends with a Controls item pinned above the composer (Talk about this, spec `TALK-ABOUT.md`) go as a normal message whose first line names the item, then the words:

```
[yui] attach section=soul id=SOUL.md rev=b41c09
Less playful when I'm working. Keep the warmth.
```

The line is a reference, not the content: the host puts the item's text in the agent's turn under it. The reference functions are `attachBody(item, words)` and `readAttach(body)` in `yl.mjs` (`YuiLines.attachBody`/`readAttach` in the app, `attach_body`/`read_attach` in Python). An item with an id that is not a Controls id (a space, `..`) or no `rev` sends the words as they are. Conformance vectors may carry `attach: {item, words, body}`.

**Locking.** `+lock` freezes a component on purpose: the answer shown stays, and taps, picks and the slider do nothing. It is off by default. Send it on the line (`choose "Table for" 2|4|6 +lock`) or, more often, patch it on once the answer is final, for example after the booking is confirmed. From a later reply, aim at the preset name: `~choose +lock` reaches the newest `choose` on any screen, including one from an earlier reply. When the component sits on a page with an `@id`, aim at the id instead and reach exactly that one: `~need-t_x +lock` (section 5, Ids that last). `~choose lock=off` opens it again.

A line that joins a group comes out of the parser with the group's id: `deck` then `page "Intro"` gives `{op: "add", preset: "page", id: "n2", in: "n1", ...}`. `end` gives `{op: "end", screen, target}` with the id of the group it closed. Members of a `plan` send no events of their own.

## 8. Streaming

The stream parser keeps a line buffer. Every time a newline arrives, that line is parsed and rendered. The first component shows up as soon as its own line is complete, not when the whole reply is done, and a slow model still paints the screen top to bottom. `flush()` parses a final line with no trailing newline.

## 9. Errors

A line that fails (unknown preset, bad JSON, patch target that does not exist, `show` of a name never saved) is skipped and reported. Nothing else on the screen is affected. The playground lists errors under the wire log.

Errors come from two layers. The **parser** rejects a line on its own: an unknown or malformed head, `custom` without valid JSON after it (comments are not stripped, so `custom {...} # note` is bad JSON), `save`/`show`/`forget` without a name, `close` with anything after it, `talk` with anything but `on` or `off`, `doing` with nothing after it, with a key, a flag or an `@id`, or with a step past its end (`6/5`, `0/0`), `menu` without a section, with a section other than `review`, `backlog`, `shortcut` or `done`, with an item that has no label or a `done` with nothing after it, a `table create` without a name or with a column that is not `col:type` of a known type, a `put` without a table or a value, with a second key, or with `+delete` and values or without a key, a patch whose target is neither a preset name, nor an id seen earlier in the reply, nor an id that lasts (section 5), a `~preset@id` with an unknown preset or an id that belongs to another preset, a patch aimed at a `custom` block. The **screen state** rejects what only it can know: `show` of a name never saved, `~ask` when no ask is on screen, a `put` that does not fit its table. The parser emits those as normal ops. Error wording is up to each implementation.

## 10. Telegram fallback

What ships today is in `spec/TELEGRAM.md` (INT-4): `ask`, `choose` and `pick` as inline keyboards, text presets as text, and the rest in a Telegram Mini App that draws the whole screen. The mapping below is where it goes next.

`ask`, `choose` and `pick` map straight onto Telegram inline keyboards: the question becomes the message, the options become buttons, the callback carries the same event. `list` and `say` become text. `gallery` and `storyboard` become a media album with the captions or notes as text, `video` and `image` send the file, `compare` sends both images. `chart`, `math` and `calc` send a rendered image, `stat` becomes its text (`Weight 178.9 lb, down 2.3`), and a stepper becomes a numbered list. A `deck` becomes an album of its page pictures with the titles as text and its quiz questions as keyboards, a `plan` sends its pages as text, asks its questions one message at a time and sends `{plan}` after the last, a `project` becomes its text with the button, a `narrate` sends a voice note per step with its picture, a `sketch` sends its rows as text (struck rows struck through, highlighted rows in bold, buttons in brackets, notes after an arrow), a `shapes` diagram sends its finished drawing as a picture with its title, its labels in order (connectors as arrows between them) and its caption as text, a `map` sends its finished drawing as a picture with its title, its place names in line order (an area's label with its countries, a pin's label, a route's label with the pins it stops at) and its caption as text (`describe()` in `map.mjs` gives the words), and a `game` sends its title with a link to play it in Yui. A `menu` line sends nothing: Telegram has no drawer. Nor does `doing`: the chat keeps its typing dots. Nor do `table create` and `put`, since the tables live on the phone; a `query` sends a link to open it in Yui. Everything else degrades to its text plus a link to open it in Yui.

**Browser.** Yui in a browser tab draws every preset with the playground's renderers and translates only what a tab cannot do like a phone (haptics, lock screen timers, push): `spec/BROWSER.md`.

**macOS.** Yui for macOS draws every preset with the shared SwiftUI views, answers them with the keyboard and the pointer, and says "Open on your iPhone" only for what needs the phone (Live Activities, adding agents): `spec/MACOS.md`.

## 11. Versioning

This is v0. Adding presets and props is non-breaking: an app that does not know a preset folds that line into one quiet "Update Yui to see this" chip (from Yui 0.2.0) and renders the rest. Today the phone's app build is the version signal: `yui-connect`'s `session` gives every host `app_build`, and a host leaves out what that build cannot draw (RELAY.md, Min builds). Changing what a positional means is breaking: it bumps this version, and `session` will carry it next to the build.

## 12. Conformance

YL is platform neutral. Every parser (JS reference, Swift app, later Kotlin) must pass the shared vectors in `spec/conformance/`: one JSON file per area, each `{version, area, vectors: [{name, input, expected, error?, chunks?, emits?}]}`. `expected` is the op list for the whole `input`, minus each op's `line` and each error's `message`. A parser passes a vector when parsing `input` whole, and streaming it one character at a time, both give `expected`; when `chunks` is present, pushing those chunks then flushing must give `emits` (the ops returned by each push, then by the flush). When `stage` is present, the adds that open on the stage under `style` (default `{}`) must be exactly those ids. When `pages` is present, `pageOf` of each add's screen, in order, must equal it. When `known` is present, it is the ids that last from earlier replies (section 5), id to preset, and every parse of the vector (whole, by character, by chunks) starts with them. When `doing` is present, `doingOf` of the input's ops must give it (section 5, The working row). When `visual` is present, `visualOf` of the input's ops must give it (section 5, The visual). When `rows` is present, the input's ops are applied to an empty screen and `rows` is every timeline row after it, `{rows: [{id, kind}], mark}`, in line order, with `mark` the index the now marker sits before (`markAt`). When `tables` is present, the input's `table create` and `put` lines are replayed onto an empty agent store (`today` and `now` fix the dates), `failed` lists the write lines the store refused, and `results` is each `query` add's result against the store the whole input left (`spec/TABLES.md`, section 6). Run the JS side with `cd spec/conformance && node run.mjs`. A change to this spec lands with the vectors that pin it.
