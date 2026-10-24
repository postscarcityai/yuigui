# Plan: YL screens and yuicss (YUI-341)

Status: plan, Oct 24 2026. Nothing built yet. Owner: Yui. Scope calls: Chris.

## Problem

Chris, Oct 24, after the deck film: "beyond uninspiring. A simple Claude artifact would do better than this. I want something that can take full advantage of today's ability to create screens."

YL today is a menu of about 49 fixed presets. An agent can only pick from the menu and fill in a few args. Every new kind of screen waits on us to build a preset, in the web renderer and again in Swift. A Claude artifact has no menu: the model writes the whole screen. That is the ceiling we keep hitting.

## The idea in one breath

Give YL the reach of HTML and keep it short. A new kind of YL line describes a screen as a tree of elements, one element per line, nested by indent. Every line maps one to one onto an HTML element, so everything the model already knows about HTML and Tailwind carries over. **yuicss** styles all of it by default, so a bare `btn "Plan it"` already looks like Yui in the agent's colors, and the agent writes only what is different.

```yui
screen "Your week"
  col gap-4
    h1 "Your week"
    row gap-2 items-end h-32
      each d in days
        box w-8 rounded-t bg-accent h-[{d.load}%] @tap=pick(d)
    p muted "{picked.name}: {picked.load}% of your best"
    btn "Plan tomorrow" @tap=send("plan tomorrow")
  let days=[{name:"Mon",load:40},{name:"Tue",load:85},{name:"Wed",load:60}]
  let picked=days[1]
```

Ten lines. As HTML plus Tailwind plus a little script it is about 40 lines. As a Claude artifact it is a React file.

## Why this, not raw HTML

1. **Shorter means faster.** Every token is wait on a phone. Target: a screen in YL is at most 40% of the tokens of the same screen as HTML plus Tailwind (`bench/` measures it).
2. **Congruent by default.** yuicss decides type, spacing, color, radius, motion and dark mode. Agents cannot make Yui look like five different apps.
3. **Safe and allowed.** Agents send data, not code. The runtime that turns lines into a screen ships inside the app, so this is the pattern App Store guideline 2.5.2 accepts (the same reason presets were picked, ROADMAP "The core bet"). Raw JS stays off in v1.
4. **Everywhere at once.** One JS renderer draws it in the app (a web view on the stage), on yuigui.com, in the MCP App (Claude, ChatGPT) and as a picture plus buttons on Telegram.

## Part 1: yuicss, the foundation

yuicss is the one source of how Yui looks. It styles agent screens, and its tokens drive the app's own chrome too.

**Layer 1, tokens.** One JSON file (`site/lib/yuicss/tokens.json`), compiled to CSS variables and to Swift (`YuiTokens.swift`, generated, replaces the hand-written numbers in `YuiTheme.swift`). An agent's look (`AgentLook`) and the app look (`theme app`) set these tokens and nothing else, so a restyle reaches every screen and the chrome together.

- color: `paper`, `ink`, `muted`, `line`, `accent`, `accent-ink`, `good`, `warn`, `bad`, plus a 50 to 900 ramp of the accent, all with light and dark, all contrast-checked (the guardrails in `AgentLook.theme` move here)
- type: `font` (rounded, default, serif, mono), a 7-step scale `xs` to `4xl`, `weight` for headings
- space: a 4-point scale, one `gap` default per container
- shape: `radius` (round, soft, square), `shadow` (none, soft, lift), `glass`
- motion: `pace`, `ease`, `enter`, `pulse` from the motion look (YUI-123), as durations and curves

**Layer 2, classless defaults.** Every element looks finished with no class at all. `h1` to `h3`, `p`, `btn`, `input`, `list`, `card`, `img`, `table`, `stat` all have Yui's type, spacing and the agent's colors. Buttons are big tap targets, one primary per screen (the first `btn` is primary unless another says `primary`). Containers stagger their children in with the agent's `enter` motion, and `reduce motion` is respected. Most screens need no classes.

**Layer 3, utilities.** A Tailwind-named subset for when the agent wants something specific: layout (`row`, `col`, `grid-3`, `items-*`, `justify-*`, `gap-*`, `p-*`, `w-*`, `h-*`), color (`bg-accent`, `text-muted`, `bg-accent-200`), type (`text-2xl`, `bold`), shape (`rounded-*`, `shadow-*`), motion (`spin`, `pulse`, `float`, `enter-pop`, `delay-*`). Same names as Tailwind so the model writes them right first time. Arbitrary values (`h-[62%]`) allowed, colors only from tokens so contrast holds.

**Layer 4, components.** Ready-made parts with Yui's defaults: `card`, `hero`, `chip`, `tabs`, `sheet`, `toast`, `progress`, `ring`, `avatar`, `badge`, `toggle`, `slider`, `stepper`, `segmented`, `field`, `empty`. And every existing preset becomes a component you can place anywhere in a screen: `timer`, `chart`, `map`, `shapes`, `sketch`, `math`, `calc`, `gallery`, `compare`, `game`. That turns 49 dead ends into 49 building blocks.

**A gallery page.** yuigui.com/yuicss shows every token, element and component, light and dark, in three agent looks. It is the visual contract the app is checked against.

## Part 2: YL screens, the syntax

Added to `spec/YL.md` as section 7. Everything older still parses.

- `screen "title"` opens a tree. Lines under it, indented two spaces, are its elements. Indent is nesting.
- An element line: `tag [classes] ["text"] [key=value] [@event=action]`. Tags are HTML with short names: `col`, `row`, `grid`, `stack` (layers), `box`, `h1`..`h3`, `p`, `span`, `img`, `icon`, `btn`, `input`, `area`, `link`, `svg` with `circle`, `rect`, `path`, `line`, `text`. Any other HTML tag name works as itself.
- State: `let name=value` (JSON-ish, no quotes needed on keys). `{expr}` in any text or class. `each x in list`, `if expr`, `else`. Expressions extend `site/lib/yl/expr.mjs` (no eval, no globals) with comparisons, `&&`, `||`, `? :`, member access, array `len`, `sum`, `map`, `filter`.
- Events: `@tap`, `@hold`, `@change`, `@drag`, `@every=1s`. Actions: assign (`x=x+1`), `send("words")` (a message to the agent as the person), `submit` (all named inputs as one answer, like a `form`), `save`, `speak("words")`, `haptic`, `go(n)` (page n of the screen), `open(url)`.
- Patches: `~screen@id let x=5` updates live state without resending the tree (same idea as `~timer rounds=10`).
- Escape hatch: `html` followed by an indented block of HTML, sanitized, no script. Raw `js` is not in v1.
- Fallback: a host that cannot draw screens gets the screen's text plus its `btn`s as buttons (Telegram), and an old app gets the same as a `card`.

## Part 3: where it runs

- **Renderer.** One renderer in `site/lib/yl/screen.mjs` (parse to a tree, then to DOM), React-free so it bundles small. The same bundle runs in the playground, the MCP App (`mcp-app/`, already an esbuild bundle of the site renderer) and the app.
- **The app.** `ScreenStage.swift`: a `WKWebView` full bleed on the stage, loading the bundled renderer from the app (nothing downloaded). Tokens come from the agent's look. A bridge carries actions back as the usual YL events. Mic, camera, haptics, Live Activities and speech stay native, called through the bridge. First paint target: under 150 ms from the line arriving.
- **The plugin.** `hermes-plugin/yui/compat.py` sends `screen` only to builds that draw it (`SCREEN_BUILD`), and the fallback to older ones.
- **The guide.** `spec/CHANNEL.md` is rewritten to one page: the screen syntax, yuicss in ten lines, five example screens, and one rule: "for anything visual, write a screen". The 10k tokens of "never" go.

## Part 4: proof it is better

- **The 50-screen test (bench).** Fifty asks across everyday use (a workout, a budget, explain a concept, a trip, a game, a tool). Each is written three ways by the same model: YL screen, HTML plus Tailwind, and today's presets. Scored on tokens, time to first paint, how often it breaks, and a blind judge on looks and usefulness.
- **The Claude artifact bar.** Ten of those asks, side by side with a Claude artifact made from the same prompt. Chris picks blind. We ship when Yui wins or ties most of them.
- **Channel eval.** `spec/channel-eval` gets screen cases so every guide change is scored.

## Cards

All `(backlog)`, in this order. Each step starts with a playground mock Chris can open on his phone.

| Card | Lane | Step | Model |
|---|---|---|---|
| YUI-341 | epic | YL screens and yuicss | |
| YUI-342 | WEB | yuicss: tokens, classless defaults, utilities, components, the /yuicss gallery | Fable 5.1 |
| YUI-343 | WEB | YL screens spec (YL.md section 7) + reference parser + renderer + conformance vectors + 5 playground screens | Fable 5.1 |
| YUI-344 | WEB | The 50-screen test and the Claude artifact bar | Fable 5.1 |
| YUI-345 | WEB | Parser ports (Python first for the plugin, then Rust, Kotlin, Swift) | Sonnet 5.5 |
| YUI-346 | APP | ScreenStage: the renderer in a web view on the stage, the bridge, tokens from the look, YuiTokens.swift generated | Fable 5.1 |
| YUI-347 | WEB | The guide rewrite to one page + compat + Telegram fallback | Fable 5.1 |
| YUI-348 | APP+WEB | Presets as components inside screens, app chrome on yuicss tokens | Sonnet 5.5 |

YUI-321 (the living canvas) builds on top of this: once a screen is a tree of live elements, every mark can be touched, held and asked about.

## Fable 5.1 section

The design-heavy cards (YUI-342, 343, 344, 346, 347) run on Fable 5.1 (`model_override = claude-fable-5-1`). Ports and plumbing stay on Sonnet 5.5. Brief for every Fable card:

- **The bar is a Claude artifact.** If the same prompt in Claude makes a better screen, the card is not done. Put the two side by side in the handoff.
- **Fable's last round missed.** The deck film (Oct 24, `dce555a`) fixed one case and Chris found nothing in it. Do not polish a preset. Build the thing that lets agents make anything.
- **Show before you build deep.** Each card opens with a playground link Chris can open on his phone, sent to him in Yui, before any native work.
- **Defaults do the work.** If an example screen needs more than two classes on a line, yuicss is missing a default. Fix yuicss, not the example.
- **Short is a feature.** Report tokens per screen in every handoff, against the HTML plus Tailwind version.
- **Taste.** Yui's values (spec/VALUES.md): one idea per page, type tells the story, every button does something, nothing cut off. Friendly Korean-app energy: soft, warm, a little playful, never childish. No slides, no deck look.
- **House rules.** Plain words, no em dashes. Commits as CJohnDesign. `scripts/check.sh` green before every push. Never `git add -A`.

## Open questions for Chris

1. **Name.** Keep "YL" and call the new part "screens"? Recommend yes: the name has a site, a spec and five parsers behind it.
2. **Raw JS.** Leave it out of v1? Recommend yes. App Store risk and safety, and state plus events cover nearly everything. Revisit after the 50-screen test.
3. **App chrome.** Rebuild the chrome as YL screens in a web view, or keep it SwiftUI reading yuicss tokens? Recommend tokens now, SwiftUI chrome (Liquid Glass, haptics, speed), and move a screen over only when it wins.
4. **Presets.** Keep the old preset lines working forever? Recommend yes, drawn by the new renderer as components, so nothing an agent sends today breaks.

## Not in scope

- Agents writing JavaScript.
- Downloading renderer code at runtime.
- Android and the Watch.
