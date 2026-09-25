# The preset flywheel

Presets cover what agents usually want to show: a timer, a form, a choice, a chart. For everything else there is `custom {json}` (YL.md section 6). The flywheel is how the long tail turns into presets: note which custom screens agents actually send, and when the same one keeps coming back, give it a real preset with a short line, a native renderer and a test.

This page is the whole loop: what gets logged, the weekly report, the bar a shape has to clear, and the checklist for promoting it.

## 1. What gets logged

The Yui plugin for Hermes (`hermes-plugin/yui/flywheel.py` in the app repo) looks at every reply an agent sends to Yui. Inside each ```` ```yui ```` fence it notes two things:

- **Custom shapes.** For every `custom` line, the shape of its JSON: the type tree, the key names and the `type` names. Never a value. Every string becomes `s`, every number `n`, every boolean `b`. So `custom {"type":"ticket","seat":"14C","gate":"B22"}` is logged as `ticket{gate:s,seat:s}`, plus a 12-character hash of that shape.
- **Unknown words.** A line that starts with a word that is not a preset or a core word (`poll Lunch? Tacos|Sushi`) is an agent reaching for a preset that does not exist yet. Only the word is kept: `poll`.

A row looks like this:

```
{"date":"2026-09-24","profile":"yui","kind":"custom","hash":"2c8eb9dfb25e","shape":"ticket{flight:s,gate:s,seat:s}"}
{"date":"2026-09-24","profile":"yui","kind":"word","word":"poll"}
```

Rules that keep the log free of anyone's data:

- No text, number, URL, id or file path from the screen is ever written. Tests in `hermes-plugin/tests/test_flywheel.py` feed real custom lines, every conformance vector and 400 random screens full of marked values through it and check that none of them reach the log.
- Keys that look like data rather than field names (capitalised, spaced, numbers, `{"Alice": 3}`) are written as `*`, and an object with more than 16 keys is logged as a map, `{*:n}`. A `type` name that does not look like a name becomes `?`.
- Bad JSON is logged as the shape `!json`, which never qualifies for promotion.
- The log stays on the machine that runs the agent, in `<profile home>/yui/flywheel.jsonl`. Nothing is uploaded, and there is no Yui table for it.
- It is off unless the profile's `config.yaml` turns it on:

```
yui:
  flywheel: true
```

## 2. The weekly report

`python3 hermes-plugin/flywheel_report.py` reads the log and prints markdown: the shapes that crossed the bar, the top shapes by distinct days and then by uses, and the unknown words. `--since 7` limits it to the last week, `--min-uses` and `--min-days` move the bar, `--out` writes a file.

A weekly job runs it with `--only-qualified`, which prints nothing unless a shape crossed the bar. When one did, the owner gets a short message in Yui naming the shape and linking this page. A quiet week sends nothing.

## 3. The bar

A shape qualifies for promotion when it shows up **at least 5 times on at least 3 different days**. Days matter more than raw uses: one long conversation can send the same screen ten times, but a shape that comes back on three separate days is a habit.

Qualifying is a prompt to look, not an automatic yes. Before promoting, check:

- It is one idea a person would name (a boarding pass, a receipt, a scoreboard), not a layout trick.
- No existing preset already covers it with a prop or two. If one does, add the prop instead and tell agents in the channel guide.
- It would be shorter as a line than as JSON. Write the line you would want; if it is not clearly shorter, leave it as custom.

## 4. Promoting a shape: the checklist

One card on the board per promotion, in the WEB lane. It ships when every box is ticked.

1. **Name and line.** Pick a short lowercase preset name and its positionals, keys and flags. Add it to YL.md section 4 with a one-line example, the event it sends (section 7) and how it falls back on Telegram (section 10).
2. **Conformance vectors.** Add a file or vectors to `spec/conformance/` covering the plain line, every key, an error case and a streamed case. The spec change lands with its vectors.
3. **All five parsers pass.** JavaScript (`site/lib/yl/yl.mjs`, add it to `PRESETS`), Swift (`Packages/YuiLines` in the app repo), Python (`parsers/python`), Kotlin (`parsers/kotlin`) and Rust (`parsers/rust`). Each runs the full suite, and every vector passes on every parser. Update the preset list in the plugin's `flywheel.py` too, so the new word stops showing up as unknown.
4. **Playground renderer.** Draw it on the web in `site/app/playground/presets.js`, and add a sample to `site/lib/yl/samples.mjs` so the playground can show it.
5. **Native renderer.** A SwiftUI view in the app (`Yui/Sources/Presets`), light and dark, in the agent's own look, with its event wired back. Screenshots of both modes.
6. **Channel guide.** Teach agents the new line in `spec/CHANNEL.md` with one example, publish it to the plugin (`hermes-plugin/sync_channel.py --publish`), and add a case to the channel eval so the guide is scored on it.
7. **Benchmark.** If it replaces a common custom screen, add that screen to the benchmark and rerun it (`cd bench && npm run bench`), so the saving is measured, not guessed.
8. **Close the loop.** Link the shape's hash in the card, and a progress entry on yuigui.com. After it ships, the shape should fade from the next reports as agents switch to the preset.

## 5. Why

YL starts with presets that cover most of what agents want to show, and `custom` for the rest. The flywheel is how that coverage grows toward everything, driven by what agents actually send, not by guesses about what they might want. See the roadmap, "Escape hatch, then promotion".
