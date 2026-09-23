# Yui Lines (YL) v0

The wire format between an agent and the Yui app. The agent never writes UI code or a JSON document. It picks a preset and fills in a few arguments, one line per component. The app renders each line the moment its newline arrives.

```
timer 40/20x8 Tabata
ask "Log this set?"
choose "What are we training?" Push|Pull|Legs +other
```

Reference implementation: `site/lib/yl/yl.mjs` (parser, stream parser, defaults, screen state). Tests: `bench/test.mjs`. Playground: `/playground` on the hub site. Token numbers: `spec/BENCHMARK.md`.

## 1. Lines

A document is a sequence of lines. Each line is parsed on its own and becomes one op. A bad line becomes an error op and is skipped; every other line still renders.

| Line | Op | Example |
|---|---|---|
| blank, or starts with `# ` | none | `# rest block` |
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

## 2. Tokens

After the head word, a line is split on whitespace into tokens.

- **Bare word**: `Tabata`, `1-5`, `40/20x8`.
- **Quoted string**: `"Log this set?"`. Double quotes only. `\"` and `\\` escape. Quotes may sit inside a token: `"Pull-up bar"|Bands` is one token.
- **Options**: a token containing `|` outside quotes is split into options: `Push|Pull|Legs`, `"3:00 pm"|"4:00 pm"`.
- **Key/value**: `key=value` where key is an identifier (`[A-Za-z_][\w-]*`). The value may be quoted (`cta="Start workout"`) or options (`cols=Food|Cal`). Numbers become numbers; `on`/`true` and `off`/`false` become booleans.
- **Flag**: `+name` sets `name` to true: `+other`, `+check`, `+auto`.
- **Comment**: a `#` that starts a token and is followed by a space or the end of the line ends the line. `color=#ff6b3d` and `#hashtag` are not comments. `custom` lines take no comments.

Everything that is not a key/value or a flag is **positional**. Each preset decides what its positionals mean (section 4). Any prop can also be set by key/value, which wins over positionals: `timer 60 rounds=3`.

Quotes are only needed when a positional would otherwise be misread. Consecutive bare words used as text are joined with spaces, so `ask Log this set?` and `ask "Log this set?"` are the same line.

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
`slide label... RANGE [lo|hi]`. Slider. The options token, if given, labels the two ends. Emits `{value}` on release.
Props: `min` [1], `max` [5], `step` [1], `value` [midpoint], `unit`, `lo`, `hi`.
```
slide "AI experience" 1-5 "Brand new"|"I run agents"
slide "Protein left (g)" 0-200 value=85 step=5
```

### form
`form [title...] field field ...`. Emits `{form: {key: value}}` on submit.
Field syntax: `key[:type][!]` or `"Label":type[!]`. `!` means required. No type means `text`. Labels default to the key with `_` as spaces.
Types: `text`, `long`, `voice` (text box plus mic), `number`, `email`, `phone`, `date`, `time`, `url`, `yes` (toggle), `photo`, a range (`1-5`), or options (`Beginner|Mid|Pro`).
Props: `title`, `fields`, `submit` [Submit].
```
form name:text! goal:voice level:1-5 submit="Next"
form "Check-in" sleep:1-10 "Home gym":yes split:Push|Pull|Legs
```

### list
`list [Title] items...`. The first bare word is the title; quoted tokens and options are items. Emits `{item, checked}` when `+check` is on.
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
`image URL [caption...]`, or `image prompt...` with no URL, which shows a "to generate" placeholder until the image pipeline fills it (Phase 3). Props: `src`, `caption`, `prompt`, `alt`, `fit` [cover].
```
image /yl/meal.svg Last night's dinner
image "a calm blue avatar with a wizard hat"
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

Every interaction goes back as one small event: `{id, preset, ...value}`. Ids are the `@id` from the line, or `n1`, `n2`, ... in line order when none was given. Examples:

```
{"id":"n1","preset":"ask","answer":"Yes"}
{"id":"n3","preset":"pick","picked":["Dumbbells","Bands"]}
{"id":"hiit","preset":"timer","done":true,"rounds":8}
```

## 8. Streaming

The stream parser keeps a line buffer. Every time a newline arrives, that line is parsed and rendered. The first component shows up as soon as its own line is complete, not when the whole reply is done, and a slow model still paints the screen top to bottom. `flush()` parses a final line with no trailing newline.

## 9. Errors

A line that fails (unknown preset, bad JSON, patch target that does not exist, `show` of a name never saved) is skipped and reported. Nothing else on the screen is affected. The playground lists errors under the wire log.

## 10. Telegram fallback

`ask`, `choose` and `pick` map straight onto Telegram inline keyboards: the question becomes the message, the options become buttons, the callback carries the same event. `list` and `say` become text. Everything else degrades to its text plus a link to open it in Yui.

## 11. Versioning

This is v0. Adding presets and props is non-breaking: an old app shows an error line for an unknown preset and renders the rest. Changing what a positional means is breaking and bumps the version, which the relay handshake will carry (Phase 1 relay).
