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
| `end` | close the open group (section 4, Groups) | `end` |
| `theme [set] key=value...` | restyle this agent's look (section 4, theme) | `theme autumn radius=square` |
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

### list
`list [Title] items...`. The first token, if it is a bare word, is the title. Every token after it is an item: quoted tokens, each part of an options token, and each bare word on its own (`list Groceries milk eggs` has two items). Emits `{item, checked}` when `+check` is on.
Props: `title`, `items`, `+check` (checklist), `+num` (numbered).
```
list Today "Squat 5x5 @ 225" "Bench 5x5 @ 185" +check
list Warmup "Jumping jacks"|"Hip openers" +num
```

### table
Two forms. `table name` binds to the agent data table called `name` (Phase 3 makes these real on device). `table [Name] Col|Col|Col "cell|cell|cell" ...` is an inline table: the first options token is the header, each later token is a row split on `|`.
Props: `name`, `cols`, `rows`, `units` (one per column, `|` separated, empty for none: `units=|kcal|g`; shown under the header), `+sort` (tap a header to sort, tap again to reverse; emits `{sort: column, dir: "asc"|"desc"}`). Number columns align right. A table with an id (`table@wk ...`) is a live data source for `chart data=wk`; re-send it as a patch (`~wk Col|Col "row" ...`) and every chart bound to it redraws.
```
table meals
table Macros Food|Cal|Protein "Eggs|140|12" "Oats|300|10"
table Planets Planet|Mass|Radius "Earth|5.97|6371" "Mars|0.642|3390" units=|10^24kg|km +sort
```

### card
`card title [body...]`. Props: `title`, `body`, `sub`, `tag`, `img` (URL), `cta` (button label, emits `{cta}`), `url` (an `https:` or `itms-services:` link the button opens in the browser, Safari in the app; a button with a link shows an arrow and sends nothing to the chat; the button reads Open unless `cta` says otherwise; other schemes are ignored), `fold` (flag).
```
card "Leg day" "Squat, RDL, lunges." sub=Thursday img=/yl/legday.svg cta="Start workout"
```

`+fold` makes a card that opens in place. Folded, it shows its tag, title and sub, the first line of its body and a chevron. A tap opens it: the whole body, the picture and the button, with a spring (a cross-fade under Reduce Motion). Another tap folds it again. Opening and folding stay on the phone and send nothing, so the agent can hand over a long ask, its mocks and its proof in one card without filling the chat. Use it for context the person may want, not for the question itself: the answer buttons go on a `choose` under it, which stays in view. Where a renderer cannot fold (Telegram), the card shows open.
```
card "Invite Dana?" "She asked for the beta yesterday. Two mocks attached, proof on the board." sub="requested yesterday" +fold
choose "Invite her?" Approve|Decline
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

### Groups: deck, plan, narrate, timeline, sketch

Five presets are **group heads**. A group head collects the lines that follow it on the same screen, one member per line, so a whole presentation or questionnaire still streams in one short line at a time. A member line is an ordinary preset line; the parser marks it with the group's id (`in`, section 7 and 12).

| Head | Members | What the group is |
|---|---|---|
| `deck` | `page`, `ask`, `choose`, `pick`, `sketch` | a swipeable presentation |
| `plan` | `page`, `ask`, `choose`, `pick`, `slide`, `form`, `mic`, `camera`, `sketch` | one full-screen flow: pages to read, then questions, one answer at the end |
| `narrate` | `page`, `compare`, `image`, `video`, `card`, `stat`, `chart`, `math`, `storyboard`, `gallery`, `deck` | a spoken walkthrough |
| `timeline` | `done`, `now`, `next` | what has shipped, what is running, what is queued |
| `sketch` | `row`, `after` | a small drawn picture: rows struck out, highlighted, called out |

**Where a group ends.** At the first line that is not one of its members (a patch, `save` or `say` included), at a line for another screen, or at `end`. Blank lines, comments and error lines do not end a group, so one bad line inside a deck is skipped and the pages after it stay in the deck. A new head of the same kind ends the old group and starts a new one. `end` closes the innermost open group; `end` with nothing open is an error. Groups nest in two places: a `narrate` can hold one `deck` at a time (its pages join the deck, and the deck is a step of the narrate); the first line that is not a page ends the deck and is then checked against the narrate. A `deck` or a `plan` can hold a `sketch` the same way: its `row` and `after` lines join the sketch, and the first line that is neither ends the sketch and is then checked against the deck or plan. The sketch is the picture of the page right before it (see sketch below).

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
- When the person has seen every page and answered every question, the deck emits `{done: true, pages}`, plus `score` and `of` when some questions were graded. Quiz pages also send their own events as they are answered.
Props: `title`, `layout` [slides], `+full`, `+notes`.

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
To refresh a live row later, give it an id and patch it: `now@w65 ...`, then `~w65 sub="native view done"`. Moving a row from `now` to `done` means sending the timeline again (a row's kind is its preset); `save` the screen and a later reply brings it back with `show`.

#### sketch
`sketch [title...] [frame=window] [before=Before]`, then one `row` per line, and at most one `after` line. A small drawn picture, so an agent can show instead of tell: how a screen should read, what changed, what to cut. A frame with rows inside it, some struck out, some highlighted, each with an optional short callout and an arrow pointing at it. No picture to generate, no screenshot to take, and nothing to tap: a sketch sends no events.
- **Frames.** `frame=window` [window] is a small app window, three dots and the `title` in its bar. `frame=phone` is a phone outline with the title at the top. `frame=bubble` is a chat bubble whose rows are its lines, with the title above it. Any other frame draws as `window`, so frames can be added without a new YL version.
- **Before and after.** An `after` line splits the sketch into two frames of the same kind: the rows above it in the first, labelled `before` [Before], the rows below it in the second, labelled with the `after` line's text [After]. Side by side when there is room, before on top on a phone. Only the first `after` splits; a later one is ignored. With no `after`, one frame and no labels.
- **On a page.** Inside a `deck` or a `plan`, a sketch right after a `page` is that page's picture: it draws where the page's `img` would go (a page with both draws the sketch). A sketch with no page right before it (first in the group, after a question, or after a page that already has one) is a page of its own, just the drawing. On a phone's full screen the rows come on one after another with the page; a plan's sketch pages are steps to read, never keyed in `{plan}`.
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

### say (core, not a preset)
`say text...`. A plain text bubble inside a screen.

### theme (core, not a preset)
`theme [set] key=value...`. Restyles the agent's own look in the app: background, bubbles, accent, avatar chip, corner radius, type and motion, in light and dark, for every screen of its thread and its row in the agent list. Nothing renders on screen except a one-line note; the look is saved on the agent (`yui_agents.theme`, spec `AGENTS.md`) until the next theme line or the person changes it.

- A **set name** starts fresh from that set: `theme autumn`. Sets, by hue: `yui candy berry cherry coral sunset peach autumn honey lemon lime matcha forest mint teal sky ocean midnight lavender grape slate mono`, plus the personality sets `wizard coach zen studio night counsel`. `theme reset` goes back to the agent's own default (seeded from its name, so every agent looks different out of the box).
- **Keys alone** change only what they say: `theme accent=#7B5CFF bg=cream radius=round`.
- `accent=` a `#RRGGBB` hex or a set name used as a color. `bg=` a hex or `cream|paper|white|mist|sand|blush` (the light-mode paper; dark mode is derived from the accent).
- `radius=round|soft|square`, `font=rounded|default|serif|mono`, `weight=regular|bold|heavy` (headings and names), `motion=bouncy|calm|snappy`.
- **Style profile**, the screens this agent prefers: `screen=chat|full` (whether components open on the stage by default, section 5), `gallery=row|feed|row3d|grid`, `chart=line|bar|area|scatter|pie|donut`, `buttons=row|stack`. The agent is told its profile every turn, and renderers use it as their default.

Guardrails: the app never lets a theme make text unreadable. Colors are adjusted until body text reaches 4.5:1 against its background and controls 3:1 (WCAG AA). Sizes and tap targets never change, radii and type come from fixed scales, and unknown names or values are ignored. The op is `{op: "theme", screen, props}`, with the set name in `props.name`. It takes no `@id`, advances no counter, sends no event, and leaves an open group open.

## 5. Screens, patches, saved screens

**Routing.** `>2 timer 90` sends one line to screen 2 and brings screen 2 forward. `>2` alone moves focus: every following line goes to screen 2 until the next bare `>S`.

**Patching.** `~target args` updates a component already on screen without re-sending it. `target` is an id (`timer@hiit` gives id `hiit`) or a preset name. The newest matching component on any screen wins. Args are parsed with the target's preset rules, so `~hiit 30/10` and `~hiit rounds=10` both work. `~preset@id` (the add's head with a `~` in front, a common slip) aims at the id when this reply made it and it is that preset, and otherwise at the preset name: `~card@week` in a later reply patches the newest `card`. An id this reply gave to another preset makes it an error. A live timer keeps running through a patch; the time left is clamped to the new phase length.

**Ids that last.** Most ids only resolve inside the reply that made them. Two kinds last, so a later reply can reach one component among many by name: an `@id` on a page (screens `2` to `12`), and an `@id` on a component that came back from a saved screen (`show`). `~need-t_x +lock` locks that one `choose` on page 2, and `~lane-app "Build 106 is VALID"` rewrites that one `now` row, where `~choose` or `~now` would hit the newest of the preset. The patch parses its args with the lasting id's preset, as in the same reply. An id this reply makes shadows a lasting one of the same name, a preset name still means the preset (`~timer` is the newest timer, whatever ids say), `~preset@id` aims at a lasting id when it is that preset, and a lasting id of another preset makes it an error, as above. Auto ids (`n1`, `c2`, and any id that looks like one) never last: every reply counts from 1 again. Nor do `custom` blocks, which are replaced, not patched. An id stops lasting when its page is cleared (`>2 clear`) or its component leaves the screen.

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

**Pages.** Beside the chat, the app gives every agent up to eleven more screens, `2` through `12`. Screen `1` lines render in the chat as usual; a screen from `2` to `12` becomes a page the person swipes to, left to right, as soon as something lands on it. Pages run in number order and a number can be skipped (`>5` alone makes the chat and one page). At the bottom a small indicator shows a chat glyph and one dot per page; with only the chat there is no indicator at all. A page is full screen: the top bar (agents, settings) and the composer stay with the chat, so a page is for reading and tapping, and the indicator's chat glyph is the way back to type, unless the agent keeps the composer on it with `talk` (below).

- A page keeps what lands on it across replies, so an agent can leave a focus timer on `2` and a running list on `3` while the chat goes on. Adds stack in order, a later reply patches them by preset name (`~timer`) or, when they have an `@id`, by that id (Ids that last, above), and `>2 clear` empties the page, which removes it; if it was showing, the person goes back to the chat.
- A route to a page beats the stage defaults: `>2 timer 25m Focus` sits on page 2, not on the stage, whatever the agent's style profile says. Workouts still always open on the stage.
- A reply that sends a line to a page brings that page forward with a spring (a cross-fade under Reduce Motion). A line that only patches a page does not move the person. The chat keeps a small "On screen 2" pill where the line was sent; tapping it goes to the page.
- Any other screen name (`>stats-view`, `>13`, `>0`, `>02`) has no page of its own and renders in the chat, in line order. The stage (`>full`, and the presets that open there) is a layer over whichever page is showing, the same as over the chat.
- Swiping between pages sends no event. The page an agent's thread was on is remembered per agent.
- **Chat with a screen.** `talk` keeps the composer on the page the line is on: `>2 talk`, or `talk` after `>2`. The page stays full screen, with the composer at the bottom. What the person types there goes to the agent as a normal message tagged with the page (section 7), and shows in the chat with a "From screen 2" mark that goes back to the page. `talk off` takes the composer away, and so does `>2 clear`, since the page goes with it. Like the page's content, it lasts across replies. `talk` is one word because it rides on the routing the page already has: a flag on `>2` would make `>2 +talk` a second grammar for routes. On any screen that is not a page (`1`, `full`, `13`) it does nothing; the chat always has its composer. It takes nothing but `on` or `off`. The op is `{op: "talk", screen, props: {on}}`; it takes no `@id`, advances no counter and sends no event.
- Where there is no room for pages (Telegram, a watch, the playground's single phone), everything renders in one column in line order, as before.

The reference function is `pageOf(screen)` in `yl.mjs` (`YuiLines.page(of:)` in the app, `page_of` in Python, `pageOf` in Kotlin): the number for `2` to `12` (written plainly, no leading zero), `1` for everything else, `full`, `chat` and `13` included. Conformance vectors may carry `pages`, the page of each add in order. `talking(ops)` (`YuiLines.talking` in the app, `talking` in Python and Kotlin) gives the pages whose composer is on after a run of ops, in number order; vectors may carry it as `talk`.

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
- The label is the rest of the line, words joined by single spaces. The keys are `sub` (a quieter line under it), `say` (what a shortcut sends), `show` (a saved screen's name) and `url` (an `https:` link). Values stay text. Other keys and flags are dropped.
- An item with an id already in the drawer replaces it, in whichever section it now names. `menu done dana` takes it out; `menu done` takes an id or a label. Taking out an item that is not there does nothing.
- Each section shows its newest item first and keeps 20; the oldest falls off. Labels longer than 60 characters are cut to 59 and an ellipsis.
- A tap on a shortcut sends its `say=`, or its label, as the person's message, as if typed (a `say=` that ends in a space goes in the composer to finish instead). A tap on a review or backlog item opens its `show=` screen on the stage, or its `url=` in the browser, with no turn; with neither, it goes back to the agent as an event (section 7) and the agent answers with the screen.
- The drawer lives on the phone, per agent, and is rebuilt from the thread like the shelf, so it follows the person to a new install.
- `menu` is a core word like `save`: no `@id` counter, no screen, and it leaves an open group alone. The op is `{op: "menu", screen, id, props: {bucket, label, sub?, say?, show?, url?}}`, and `menu done id` gives `{op: "menu", screen, id, props: {done: true}}`. Where there is no drawer (Telegram, the playground, a watch) the line does nothing.

The reference function is `menuOf(ops, menu)` in `yl.mjs` (`YuiLines.menu(_:into:)` in the app): the three sections after a run of ops, each newest first, labels cut. Conformance vectors may carry `menu`, the sections after the input.

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
```

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

**Locking.** `+lock` freezes a component on purpose: the answer shown stays, and taps, picks and the slider do nothing. It is off by default. Send it on the line (`choose "Table for" 2|4|6 +lock`) or, more often, patch it on once the answer is final, for example after the booking is confirmed. From a later reply, aim at the preset name: `~choose +lock` reaches the newest `choose` on any screen, including one from an earlier reply. When the component sits on a page with an `@id`, aim at the id instead and reach exactly that one: `~need-t_x +lock` (section 5, Ids that last). `~choose lock=off` opens it again.

A line that joins a group comes out of the parser with the group's id: `deck` then `page "Intro"` gives `{op: "add", preset: "page", id: "n2", in: "n1", ...}`. `end` gives `{op: "end", screen, target}` with the id of the group it closed. Members of a `plan` send no events of their own.

## 8. Streaming

The stream parser keeps a line buffer. Every time a newline arrives, that line is parsed and rendered. The first component shows up as soon as its own line is complete, not when the whole reply is done, and a slow model still paints the screen top to bottom. `flush()` parses a final line with no trailing newline.

## 9. Errors

A line that fails (unknown preset, bad JSON, patch target that does not exist, `show` of a name never saved) is skipped and reported. Nothing else on the screen is affected. The playground lists errors under the wire log.

Errors come from two layers. The **parser** rejects a line on its own: an unknown or malformed head, `custom` without valid JSON after it (comments are not stripped, so `custom {...} # note` is bad JSON), `save`/`show`/`forget` without a name, `close` with anything after it, `talk` with anything but `on` or `off`, `menu` without a section, with a section other than `review`, `backlog`, `shortcut` or `done`, with an item that has no label or a `done` with nothing after it, a patch whose target is neither a preset name, nor an id seen earlier in the reply, nor an id that lasts (section 5), a `~preset@id` with an unknown preset or an id that belongs to another preset, a patch aimed at a `custom` block. The **screen state** rejects what only it can know: `show` of a name never saved, `~ask` when no ask is on screen. The parser emits those as normal ops. Error wording is up to each implementation.

## 10. Telegram fallback

What ships today is in `spec/TELEGRAM.md` (INT-4): `ask`, `choose` and `pick` as inline keyboards, text presets as text, and the rest in a Telegram Mini App that draws the whole screen. The mapping below is where it goes next.

`ask`, `choose` and `pick` map straight onto Telegram inline keyboards: the question becomes the message, the options become buttons, the callback carries the same event. `list` and `say` become text. `gallery` and `storyboard` become a media album with the captions or notes as text, `video` and `image` send the file, `compare` sends both images. `chart`, `math` and `calc` send a rendered image, `stat` becomes its text (`Weight 178.9 lb, down 2.3`), and a stepper becomes a numbered list. A `deck` becomes an album of its page pictures with the titles as text and its quiz questions as keyboards, a `plan` sends its pages as text, asks its questions one message at a time and sends `{plan}` after the last, a `project` becomes its text with the button, a `narrate` sends a voice note per step with its picture, a `sketch` sends its rows as text (struck rows struck through, highlighted rows in bold, buttons in brackets, notes after an arrow), and a `game` sends its title with a link to play it in Yui. A `menu` line sends nothing: Telegram has no drawer. Everything else degrades to its text plus a link to open it in Yui.

**Browser.** Yui in a browser tab draws every preset with the playground's renderers and translates only what a tab cannot do like a phone (haptics, lock screen timers, push): `spec/BROWSER.md`.

**macOS.** Yui for macOS draws every preset with the shared SwiftUI views, answers them with the keyboard and the pointer, and says "Open on your iPhone" only for what needs the phone (Live Activities, adding agents): `spec/MACOS.md`.

## 11. Versioning

This is v0. Adding presets and props is non-breaking: an old app shows an error line for an unknown preset and renders the rest. Changing what a positional means is breaking and bumps the version, which the relay handshake will carry (Phase 1 relay).

## 12. Conformance

YL is platform neutral. Every parser (JS reference, Swift app, later Kotlin) must pass the shared vectors in `spec/conformance/`: one JSON file per area, each `{version, area, vectors: [{name, input, expected, error?, chunks?, emits?}]}`. `expected` is the op list for the whole `input`, minus each op's `line` and each error's `message`. A parser passes a vector when parsing `input` whole, and streaming it one character at a time, both give `expected`; when `chunks` is present, pushing those chunks then flushing must give `emits` (the ops returned by each push, then by the flush). When `stage` is present, the adds that open on the stage under `style` (default `{}`) must be exactly those ids. When `pages` is present, `pageOf` of each add's screen, in order, must equal it. When `known` is present, it is the ids that last from earlier replies (section 5), id to preset, and every parse of the vector (whole, by character, by chunks) starts with them. Run the JS side with `cd spec/conformance && node run.mjs`. A change to this spec lands with the vectors that pin it.
