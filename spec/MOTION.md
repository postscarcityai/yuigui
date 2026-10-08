# Motion explainers | spec v1 (decided: streamed A)

Chris, Oct 5: "I want this to look like a professionally designed explainer video more than these boring slide by slide explanations. Some camera movements, some shapes that transform, some motion, the ability to make something totally unique every time even if I ask for the same thing. I'm about to give up on this app and I need you to save it." He also asked whether YL is the wrong layer and the agent should just write code.

Decision: Chris picked A (free code) as the default, with B's camera and morph as helpers, and C only where a turn needs a tap. Section 2 says what that means and measures the streamed version. The three-way comparison that led to it stays below.

This is the design answer. Three working prototypes of the same ask ("ELI5 string theory"), what each costs, how each fails, and one recommendation. No app code changed and the live guide is untouched. Try them: [A](/playground?demo=motion-free), [B](/playground?demo=motion-yl), [C](/playground?demo=motion-hybrid). Each also plays a second model run of the same prompt with `&v=run2`, so you can see that the same ask gives a different piece.

## 0. The motion system (MOTION-1, Oct 5 to 6): draw anything, any agent, mid-anything

Chris, Oct 5: "Don't ship until you have a fully revamped motion system. It needs to be able to generate all types of different animations for any concept." And: "I want a really flexible system for drawing. It's not necessarily all teaching, it's just explaining something. We could be working together on a project and you're trying to explain visually what you're doing, or it could be a concept."

So the goal is SHOWING. An agent, in the middle of anything, can draw what it means: a concept, or the work itself (what changed and where, a plan and where we are in it, how two parts connect, a bug and its fix, a status, a quick sketch, a mood). Flexibility is the first requirement. There are no templates and no kinds the model has to pick from. The model gets primitives and helpers and composes freely.

### 0.1 What exists

- **The kit** (`site/public/demo/motion/kit.js`, no dependencies, about 60 KB). A scene is `function (t, c, api)`, a pure function of time, so a film can be scrubbed, replayed and sampled headless. The kit is what the model draws with:
  - Primitives that draw on: line, arrow, curve, rect, box, circle, ellipse, arc, poly, dot, glow, and `path` for any SVG path string. Every one takes `k` (draw-on 0..1), colour, width, fill, dash, glow and a hand-drawn wobble.
  - 30 stock shapes (heart, gear, person, house, cup, flask, bulb, phone, lock, tree and more), text, kinetic type (rise, pop, drop, wave, scatter, type, slide), labels, captions.
  - Explaining tools: `callout` (a dot on a part, a line, a label), `pin`, `dim`, `brace`, `scribble`, `underline`, `highlight`, `node` and `link` (boxes that return anchors, arrows between them with dots flowing), `compare` (a before/after wipe), `lens` (a magnifier that redraws zoomed), `clipRect`, `timeline`, `grid`.
  - Data that animates: `counter`, `bars`, `lineChart`, `donut`, `progress`.
  - Motion: a camera (`cam`, `focus`, `layer` for parallax, `shake`), easing and springs, an analytic orbit and wave, a cached physics step (`sim`), stateless particles (`swarm` in seven modes, `along` a path, `stars`), morphing between point lists.
  - Looks: `look('agent'|'paper'|'sketch'|'blueprint'|'chalk'|'neon'|'noir')` sets the background, palette and wobble for the film. `agent` and no call keep the agent's own colours (the palette comes from the theme the host passes in).
  - 3D without a library: a small software renderer (camera, box, sphere, torus, cylinder, cone, helix, plane, shaded solids or wire).
  - Maps: Natural Earth 110m countries, orthographic globe or flat, highlight a country, great-circle routes, pins.
- **The player** (`player.html`): one canvas, one film clock, two homes with the same file. In an iframe on the site it takes `postMessage`; in the app's web view it takes `window.yui.scene/end/pause/seek/replay/still/theme` and reports through one message handler (`ready`, `first-frame`, `error`, `stall`, `slow`, `ended`, `time`, `timeline`, `cues`, `tap`). Scenes stream in as they are written; the clock holds at the end of what is known. A scene that throws is cut short and the film goes on. `api.say` cues are probed per scene so a narrator (YUI-310) can speak them ahead of the clock. No network, no storage.
- **The generator** (`prompt-kit.md`, `scripts/motion/film.py`): the model gets a two page reference (the kit, the output format, the direction) and the ask, and writes `=== scene <name> <seconds> ===` blocks. `film.py` streams it and logs the second each scene lands.
- **The checks** (`scripts/motion/check.py`): the real player renders every film frame by frame in headless Chrome. A film fails on a scene that throws or does not parse, or on a stretch of 1.2 s or more that draws nothing. It writes a contact sheet and a report.
- **The test set** (`asks.json`, `scripts/motion/run_set.py`): 20 asks, each run twice, half work and half concepts. Results in 0.3 and on [/motion](/motion).

### 0.2 How a film is written

- Scene 1 is small (25 lines at most) and already shows the subject, so it can play within seconds. The rest is decided while it plays.
- Every scene is the same few moves: `k = api.seg(t, from, to)` gives each part its own window, so a drawing builds one part after another; a callout points at a part; the camera pushes in; a lens magnifies a detail; a compare wipes before to after.
- Few words on screen. Captions are `api.say` cues of six words or fewer, because a voice will speak them.
- Unique every time: the prompt asks for the model's own metaphor, look and camera plan, and forbids slide layouts.

### 0.3 Results

- **Range.** 20 asks, each run twice, 40 films, all made by Sonnet 5.5 at low effort through the same prompt. Half are work between a person and their agent (a settings change, a plan and where we are, how five parts fit, a bug and its fix, a launch status, a sketch of a robot, two services talking, a day), half are concepts (a heart, an engine, Rome, a roast chicken, a workout, a dog-toy business, anxiety, a jump start, rent or buy, tax brackets, a quiet Sunday, population). The tiles on [/motion](/motion) play every one.
- **Checked.** Every film renders in headless Chrome through the real player. On the first try 57 of 60 films passed (the 40 of the set plus the 20 timing films); the three that did not were one scene that used an undefined variable twice and one whose last scene header the harvester could not read, and the set holds regenerated runs of them. At runtime the player cuts a scene that throws and the film goes on. All 40 published films pass: no scene throws, none fails to parse, no stretch of 1.2 s or more draws nothing. (The checker earned its keep: it caught a scene that referenced an undefined variable and a film whose last scene header the harvester could not read, so the harvester now accepts `=== name 6 ===` as well as `=== scene name 6 ===`.)
- **Unique.** The two runs of an ask never match: different look, different metaphor, different layout. A Sunday morning is a rain-streaked window over a steaming cup in one run and a cup with three columns of steam in the other; the engine is a blueprint cutaway in one and a labelled stroke wheel in the other.
- **Fast.** One at a time on an idle machine, scene 1 is complete 5.25 s after the request (median, worst 10.2 s over 20 films), through the `claude` CLI, which adds about 3 to 5 s of process start. The player boots in about a second. A film is 27.25 s long and takes about 17 s to write, so the player never waits after scene 1. Median cost to make one: $0.076. Five films at once is slower (median 5.9 s to scene 1), which is the number to expect when many people ask together.

### 0.4 What is left, and where it lives

The kit, player, generator and checks are the system. Three connections remain before a person gets it from their phone: (1) the channel guide teaches agents to ask for motion, (2) the plugin turns that ask into a streamed film, (3) the app plays it full screen. The design for (2) and (3), decided here and built under MOTION-1:

- **One line from the agent.** `motion "<what to show, with the facts>"`. The agent does not write scenes and the guide does not carry the kit: a weak model and a strong one both get a film, and the guide stays small. The ask carries the facts the film needs ("I moved Log out to the bottom, added Dark mode, removed Help"), because the maker sees only the line.
- **The plugin makes the film.** It runs the generator on the same prompt and the agent's own colours (`THEME`), sends each scene the moment it is complete as its own row, then a closing row, so a phone that polls shows scene 1 in seconds. A film that fails the same checks in the plugin (a scene that does not parse) is dropped from the row; the player already cuts a scene that throws.
- **The app.** `MotionView` plays the film full bleed on the stage, with no card; Reduce Motion shows the last frame; a failure falls back to the agent's `shapes` drawing and tells the agent. Older phones get the words (compat gate).

Status (MOTION-1e, Oct 6): the first two are done. The channel guide (v49, `spec/CHANNEL.md`) teaches the one-line `motion "<ask>"` and when to use it (any explain-by-picture, the work itself included; a plain fact stays a line); `spec/YL.md` has the `motion` preset; the yui plugin (`motion.py`, `adapter.py`) makes the film and streams each scene as its own row; `compat.py` gates it behind `MOTION_BUILD`, now 545 (YUI-316, Oct 7: the first VALID build with `MotionView`, f65d54d), and draws it as a sketch on older phones. The eval holds eight `motion-*` cases.

Status (YUI-311, Oct 6): the web plays it. /web draws a film full screen on the stage (`site/app/web/MotionStage.js`, the one `player.html` in a sandboxed iframe, `site/lib/web/film.mjs` joins the rows of a film and hands scenes to the player as they land). Scene 1 plays at once, later scenes append to the running player, Close, Esc or a tap after the end goes back, the record keeps one line and a Watch again chip, an ask with no film is drawn as a sketch, and Reduce Motion shows a still per scene. `frame-src 'self'` was added to /web's CSP for the player. Test: `site/e2e/web/film.test.mjs`.

### 0.5 The wire (so the app and the plugin can be built apart)

A film travels in Yui Lines as a raw block, the way `draw` carries SVG:

````
motion "How a heart pumps blood" film=m7 part=1
=== scene hook 4 ===
<JavaScript body of (t, c, api)>
=== scene dive 6 ===
<...>
end
````

- `motion [title...] film=<id> part=<n> [last]`, then scene blocks up to a line that is only `end` (or the end of the reply). The head is an add with preset `motion` (props `title`, `film`, `part`, `last`); the reply gives one patch with `source`, the scene text as written. A line after the head that is not a `=== scene` header leaves the block empty and is read as YL. Cut at 40 scenes or 120,000 characters.
- A film is one or more parts. The plugin sends part 1 with scene 1 the moment it is complete, then each next scene as its own row (`part=2`, ...); when the maker is done a closing row with no scene (`motion film=m7 part=5 +last`) says the film is whole. The app joins parts with the same `film` into one player, so the film starts at scene 1 while the rest is written. A part with no earlier part (a phone that missed it) starts the film from there.
- Scene header: `=== scene <name> <seconds> ===` (the word `scene` may be left out). Name: one word. Seconds: 0.5 to 20.
- The agent never writes this. It writes `motion "<ask>"` in the channel guide's plain form, and the plugin replaces that line with the block above (the way table words are expanded before a reply is saved).
- Phones that cannot play it (compat gate): the title and the scenes' `say` lines in order, as words.
- Sends no events, except taps on `api.hit` targets, which come back as `[yui] n1 motion tap=<id>`; a failure comes back as `[yui] n1 motion error=<reason>`.

## 0b. The canvas (YUI-321, Oct 7): one living canvas, every mark is a live object

Chris, Oct 7: "I'm trying to build the next generation of user interface." So there is no app chrome with content inside it. There is one canvas and the agent draws on it. Text, drawings, buttons, charts, a film: all of it is marks, and a mark is not a picture, it is an object the person can touch.

Rules the guide and every agent can draw for:

- **Touch answers.** A tap on a mark pauses the canvas, lights the mark, names it and plays its line. The agent hears nothing yet.
- **Hold asks.** A long press on a mark sends `[yui] <film> motion ask <part>` and the agent works on just that part, in place, while the rest stays. A hold on nothing asks about the moment (`ask moment @4.2s`): the person stopped it half drawn and asked.
- **Time is direct.** The scene is pure in `t`, so a drag sideways scrubs it, a tap on nothing pauses and plays it, and it ends on its last frame and stays. No end screen, no player.
- **The answer and the UI are one thing.** A question is drawn into the picture: the choices are marks (the chambers of a heart, each a hit target), and the tap on one is the answer. The scene reads the touch (`api.marked`) and redraws.
- **Nothing opens on top.** No cover, sheet or player. The canvas changes; it never stacks. The only chrome is the stage's own bar: pause, mute, a hairline of progress, and the chip row (Another take, Change it).
- **Name the parts.** A thing's parts carry a name (`"n"` in the parts call, a 5th item in `defineThing`). A named part is its own target `part:<thing>:<name>`; an unnamed thing is one target.

Live prototype: `/playground/canvas.html` (same harness as the phone, `canvas/player.html`). The host page is under 250 lines: it adds the progress hairline, mute, the chips and the in-place answer line. The words an agent writes back for a held part are canned there; the hold, the tap and the line the agent would receive are real.

### Yui Lines on the canvas (YUI-333)

A Yui Lines answer (`spec/YL.md`) does not open a screen. It draws on the canvas, and every part of it is a mark. This is what the canvas sends back, copied from `site/public/playground/canvas/`. `site/public/playground/canvas/test-spec.mjs` builds each line below from the code and fails when one differs.

Which presets draw as marks: `shapes` and `sketch` drawings, `map` (YUI-336), `chart` and `stat`, `list`, `table`, `timeline` and `card`, and the answers `choose`, `pick`, `ask`, `slide` and `form`. A `choose` under a picture is drawn into it. Several in one answer share one canvas.

A mark's id is the preset's own id plus its place. The id is `<preset>:<block id>:<place>`: a chart bar is `chart:n1:s0:3` (series 0, point 3), a list row `list:n2:3`, a timeline row `tl:n2:3`, a stat `stat:n1`, a spark point `spark:n2:0`, an input `in:<block id>:o0` (option 0), `:knob`, `:send`, or the field key. A shape is `yl:<name>`, the name from `shape@name`. A map part is `map:<block id>:<area|pin|route>:<slug of its label>`: `map:n1:pin:karakorum`, `map:n1:route:east`; a part with no label is named by what it holds (an area by its countries, a route by its stops). A tap names it (`Karakorum. The one to look at. 47.2°N, 102.8°E.`), a hold asks about it, and a pin drags. A heading or caption is `mark:text:<slug>`. The block id is the `@id` you wrote, or `n<position>` in the answer (the second block is `n2`). The mark's name is the words on it (`Protein Thu: 126 g`, `Calf raises 4x15`); the event line carries the name, not the id.

Events. `<ask>` is the answer's id: the sample name here, the block's own id in the app.

- **Tap** on a mark pauses, lights it and names it. Nothing is sent. A tap on an answer is the answer and is sent: a `choose`/`ask` pill, a `pick` option then its Send, a slider end, a form's Send, a choice drawn into the picture, a `+check` row.
- **Hold** on a mark asks about that one part: `[yui] <ask> yl ask <name>`. A hold on nothing asks about the moment: `yl ask moment @<seconds>s`.
- **Drag** a mark and let go. The line says where it landed: `yl move <name> to=<place>`. Place is the 1-based slot for a list row, a queue row or a bar, `x,y` in the drawing's grid for a shape, and `lat,lon` (one decimal, north and east positive) for a pin on a map: the pin's row in the answer takes the new place, a route that stops at it follows, and the canvas says where it landed (`Karakorum, now in Mongolia (44.4°N, 102.8°E)`). A drag on nothing scrubs and sends nothing. Arrow keys move a focused mark one step and send the same line.
- **Say** while touching a mark: `yl say "<words>" touched=<name>`. Nothing touched: `touched=@<seconds>s`, the moment on the clock.
- **Back** (YUI-334) steps the picture back. Every hold redraw, drag answer and say+touch patch is one step; Back (two-finger tap, the Back mark in the corner, Cmd/Ctrl+Z) returns to the picture before the last step and redraws only the marks that step changed, on the same clock. Redo (the forward mark, Shift+Cmd/Ctrl+Z) goes forward the same way. The agent gets one line so it knows the picture changed under it: `[yui] <ask> canvas undo step=<n> marks=<ids>`, `n` the 1-based step undone and `ids` the marks that step changed, comma separated (`redo` the same going forward). The Back mark is named, and each step is announced in plain words: "Back to before the bar moved."

```canvas-events
tap | bars | chart:n1:s0:3 | => (nothing sent)
hold | bars | chart:n1:s0:3 | => [yui] bars yl ask Protein Thu: 126 g
tap | map | map:n1:pin:karakorum | => (nothing sent)
hold | map | map:n1:area:raided | => [yui] map yl ask Raided
hold | route | map:n1:route:the_trip | => [yui] route yl ask The trip
hold-moment | bars | | 4.2 => [yui] bars yl ask moment @4.2s
move | queue | tl:n2:3 | dy=-1 => [yui] queue yl move Charts on the canvas to=3
move | parts | yl:build | dx=1 => [yui] parts yl move Build to=5.5,4.4
move | map | map:n1:pin:karakorum | dy=1 => [yui] map yl move Karakorum to=44.4,102.8
move | route | map:n1:pin:paris | dx=1 => [yui] route yl move Paris to=48.9,3.7
say | map | map:n1:pin:karakorum | "Why here?" => [yui] map yl say "Why here?" touched=Karakorum
say | bars | chart:n1:s0:3 | "Why is this one low?" => [yui] bars yl say "Why is this one low?" touched=Protein Thu: 126 g
say-moment | bars | | 3.4 "what is this" => [yui] bars yl say "what is this" touched=@3.4s
check | today | list:n2:0 | => [yui] today yl check Squat 5x5
choose-in-picture | sketch-choose | | Later => [yui] move choose choice=Later
answer | choose-other | in:next:o0 | => [yui] next choose choice=Legs
answer | ask-ship | in:ship:o1 | => [yui] ship ask answer="Not yet"
nudge | slide-sore | in:sore:knob | 1 => [yui] sore slide value=4
form | form-checkin | in:checkin:send | goal="get strong" => [yui] checkin form form.sleep=6 form.goal="get strong"
undo | bars | chart:n1:s0:3 | 2 => [yui] bars canvas undo step=2 marks=chart:n1:s0:3
redo | bars | chart:n1:s0:1,chart:n1:s0:3 | 1 => [yui] bars canvas redo step=1 marks=chart:n1:s0:1,chart:n1:s0:3
```

What to send back: a patch of only the marks you name, and nothing else moves. A held or said mark gets `~chart y=118|132|141|138`, `~list ...` or `~stat ...` (the `spec/CHANNEL.md` patch rules), plus one line of words. A drop gets a patch only if you change something because of it (a bar moved first, so the chart is retitled); the mark already sits where it landed. A choice drawn into a picture arrives as `choose choice=<name>` with the name as written, spaces and all, so read to the end of the line. Do not re-send the answer, and do not echo the person's own words or tap.

## 1. The three prototypes

| | A. Free code | B. YL grows motion | C. Hybrid |
|---|---|---|---|
| Who draws | the model writes a whole HTML page | our renderer draws a scene written in a small YL layer | the model writes only the scene function; a fixed harness plays it |
| Native parts | none, the page owns the screen | none in the piece; the caption and buttons are ours | title, line and buttons stay native and tappable around it |
| Look ceiling | highest: its own metaphor, type, particles, glow | capped by our vocabulary (camera, morph, hum modes) | high, close to A |
| Unique each time | yes (run 1 and run 2 differ completely) | only as much as the vocabulary allows | yes (run 1 and run 2 differ completely) |
| Output of the model | 19 KB of HTML, 48 to 53k tokens | ~3.4 KB, 90 lines; the model wrote the same size, 5.5k tokens with thinking (see 1.3) | 6 to 7 KB of JS, 15 to 22k tokens |
| Time to first frame once the code exists (live page) | 2.7 s (iframe boot) | 1.3 s | 2.3 s |
| Time until the model has made it | 473 to 527 s | 56 s | 155 to 217 s |
| Cost per piece (Opus 5.5) | $1.0 to $2.4 | $0.13 | $0.33 to $0.47 |
| Runs natively on iPhone | WKWebView only | SwiftUI Canvas, or JavaScriptCore + Canvas | WKWebView harness |
| Tap back to the agent | no (a sandboxed page, no bridge) | yes, native | yes: `api.hit(id,x,y,r)` posts `[yui] motion tap=<id>` |

Recordings (phone width, dark first) are on [/progress](/progress) and in the card's artifacts: `motion-free.mp4`, `motion-yl.mp4`, `motion-hybrid.mp4`, and the second runs `motion-free-run2.mp4`, `motion-yl-run2.mp4`, `motion-hybrid-run2.mp4`.

### 1.1 What the model made

- **A** is the most designed: a cocoa cup with steam, a zoom counter ("ZOOM x10^34"), a nucleus of colored balls, word by word captions with a hot accent, a string plucked like a guitar, a closing field of tiny loops ("Everything is music"). It is a title sequence, not a flow chart.
- **C** reaches almost the same look in a third of the tokens, because the harness already owns the canvas, clock, camera, captions and taps. Run 1 draws a cup in outline, zooms to an atom, a nucleus, a glowing dot that turns into a loop, then three loops you can tap (electron, photon, graviton). Run 2 chose a different language: tilted orbits, a ring that holds a white string, a five-lobed hum.
- **B** is cleaner and calmer. One camera dive through six scales (cup, atom, nucleus, proton, quark, string) with a dot that hollows into a loop, hums in three modes and opens into a wave. It is exact and cheap and runs anywhere, but it looks like our shapes, because it can only draw what the language has words for. That is the cookie-cutter risk again, one level up.

### 1.2 How each one fails

- **A.** Slow: 8 minutes of generation (about 40k of the 53k tokens are thinking) before one frame exists. Heavy: a 19 to 25 KB page. Unsafe by nature: arbitrary script, so it must sit in a sandboxed iframe with no same-origin and a CSP that allows no network (the prototype does this). A page can still spin the CPU; the sandbox does not stop an infinite loop. No native taps, no native buttons, no way to ask the person a question inside it. Quality swings: a missed layout runs off the screen and nothing catches it.
- **B.** The language is the limit. A scene is exact and tiny, but every new idea (a cup with steam, a particle field, a title card with type) is a new keyword, and the guide grows with it. The model has to learn the language from the guide. What happens when the model writes it: section 1.3.
- **C.** The contract has to be right. Run 1 was laid out for a 390 pt wide piece and the first harness was narrower, so the strings sat off the edge; the fix was to give the harness a fixed 390 x 420 stage scaled to fit. A scene that throws shows an error and stops (the harness reports it). Like A it can be slow when the model thinks long: 155 to 217 s, almost all of it thinking.

### 1.3 B written by the model

The scene in prototype B was written by hand for this spike. To check that a model can write the language, the same prompt (the language reference, a four-line example and the ask) went to Opus 5.5:

- It parsed on the first try and plays (`?demo=motion-yl&v=run2`). 56 s, 5.5k output tokens (about 2k of them the scene), $0.13.
- It is flatter than the hand-written scene and it fails the way B was always going to: the model has to do the coordinate arithmetic of nested frames and fades, and it got some of it wrong. The cup, atom and nucleus read, then the camera lands in a frame it had already faded out and the screen is blank around 26 s.
- So B is fast and cheap to generate, and the language is learnable, but it needs checking (the same 60-frame, non-blank eval as in 2.1) and it does not reach the look of A or C.

## 2. Decision (Chris, Oct 5): A is the default, a little B, C only where taps are needed

Chris's pick: "I like A, a little B, not a fan of C but it might have a place." So:

- **A is the default explainer.** The model writes the motion as code, full screen, no card and no box around it.
- **A has to be fast.** It is written scene by scene and streamed, so the first scene plays within seconds while the rest is made. Target: first frame under 10 s.
- **B becomes helpers A can call**, plus a cheap fast tier for small asks. The camera, morph and path helpers are now `api.cam`, `api.morph`, `api.pts` and `api.path` in A's player.
- **C only where the turn needs a tap mid-piece** (a quiz, a pick). Even then the motion stays full bleed and the buttons float over it at the end. Never a card under a box.
- **Room for voice-over.** Few words on screen. Every caption is an `api.say` cue, so a narrator can speak the same lines.

### 2.1 Streamed A: what was built and measured

Prototype: `?demo=motion-free` (the old one-page version is at `&v=old`). Same ask, "ELI5 string theory", the model told to write scene 1 first and small, then the rest.

| | Old A (one page) | Streamed A, Sonnet 5.5 low effort | Streamed A, Opus 5.5 low effort |
|---|---|---|---|
| First scene complete | 473 to 527 s | **6.6 s** | 16.8 s |
| Whole film written | 473 to 527 s | 21.2 s (7 scenes, 40 s of film) | 40.1 s (7 scenes, 40 s of film) |
| Output tokens | 48 to 53k | 2.7k | 3.9k (0.5k thinking) |
| Cost per film | $1.0 to $2.4 | $0.70 | $0.44 |
| Time to first frame | 8 minutes | about 7 s | about 17 s |

Measured through the `claude` CLI, which adds about 3 to 5 s of process start to every call (a plain "say hi" on Haiku takes 5.7 s). A direct API stream would start about 3 s sooner. Haiku 4.5 with thinking on took 97 s to the first scene: it thinks first. Thinking is the cost, so the prompt asks for no planning and the effort is low. The film is written faster than it plays (21 s to write, 40 s to watch), so the player never waits after scene 1.

How it works:

- The prompt (`public/demo/motion/prompt-stream.md`) asks for `=== scene <name> <seconds> ===` blocks of a JavaScript body, `(t, c, api)`, each 4 to 8 s, scene 1 at most 25 lines.
- `scripts/motion/stream.py` streams the model and marks each scene complete when the next marker arrives, logging the second it landed.
- `harness-stream.html` is a full-bleed player in a sandboxed iframe (opaque origin, CSP with no network). It plays scene 1 at once, queues the rest, dissolves between scenes over 0.6 s, holds the last frame if a scene is late, and shows a breathing ring before scene 1.
- It reports `ready`, `first-frame`, `stall`, `error` (scene name and message) and `ended` to the parent. A scene that throws is cut short and the film goes on.
- The playground replays a recorded run on its own clock: scene i is posted at its landing second. What plays is what a live stream does. It is not a live model call; the site has no model key.

Recordings: `motion-stream-sonnet.mp4` and `motion-stream-opus.mp4` on /progress and in the card's artifacts.

How it fails (seen in the two runs): Sonnet's film is the plainer one, with strings that sit half off the centre line in one scene, which is a layout the model did not check. Opus is richer (a hex-to-atom dive, a glowing loop that changes note) but its first scene lands at 16.8 s. Neither run has a camera move as bold as old A, because the scene function is short. A film is only as good as the checks on it, so the eval below matters.

### 2.2 What changes in the guide (not yet, no live guide change)

`motion` becomes a full-screen part, like a `deck` on `>full`, written by the agent as scene blocks. One line says what it is, the film plays, and a `choose` appears over its last frame only when the turn needs an answer.

````
Here is string theory as a film.
```yui
motion "ELI5 string theory"
=== scene hook 4 ===
...body...
=== scene dive 6 ===
...body...
=== end ===
choose "Which one is light?" Electron|Photon|Graviton
```
````

- The rule: an explainer, a how-does-it-work story, a "show me" about scale or change is one line and one `motion`. A fact, a status or a plan stays a line and a sketch. Never both for one idea.
- Scenes stream: the plugin sends each scene as it is written, and the phone starts playing scene 1 at once.
- The contract is the one in `prompt-stream.md`: `t`, `c`, `api.w`, `api.h`, `ease`, `eout`, `lerp`, `clamp`, `seg`, `noise`, `rand`, `cam`, `pts`, `morph`, `path`, `say`. Nothing else exists.
- Eval cases for the channel eval: every scene parses, runs 60 frames headless without throwing, draws something non-blank, keeps its pixels on screen, stays inside a frame budget, and uses no forbidden global.
- A tap target is `api.hit(id, x, y, r)` as in the hybrid harness, used only by C turns.

### 2.3 What changes in the app

- `MotionView`: a WKWebView with a bundled `harness-stream.html`, no network (`WKContentRuleList` blocks every load, CSP `default-src 'none'`), non-persistent data store, one script message handler for `ready`, `first-frame`, `stall`, `error`, `ended` and `tap`. Scenes go in through `evaluateJavaScript` as they arrive.
- Full bleed on the stage, like a deck on `>full`. Native chrome only: pause, scrub, replay, close.
- Reduce Motion shows the last frame still. VoiceOver reads the `say` cues as one string.
- Watchdog: no `first-frame` in 3 s, an `error`, or frames over 50 ms for 2 s, and the app swaps in the agent's `shapes` drawing and tells the agent (`[yui] n1 motion error=...`).
- Voice-over: the `say` cues are the script. The player exposes `{text, from, to}` per scene so a narration track (YUI-310) can speak them and sync to the clock.
- Scenes save on the shelf, so a replay costs nothing.

### 2.4 Speed beyond this prototype

- Direct API streaming instead of the CLI saves about 3 s.
- A fast first scene from a small model, the rest from a bigger one, is the next step if 7 s is not fast enough. Same prompt, scene 1 only, no thinking.
- **Tried (MOTION-3, Oct 6): both together, measured, not shipped.** Scene 1 streamed over the API (no process start) from Gemini 2.5 Flash Lite with thinking off, the rest from the big model in parallel. 20 asks x 2. First scene median 5.1 s before, 4.9 s after (max 8.1 to 9.4 s); target was 2.5 s. Frame pass rate 47.6% to 42.6%, films with 80% passing 15% to 7.5%, plain drawings 18 to 26. The process start is not the cost: one full scene is about 4 s of generation on any small model. Not kept. Next: MOTION-4 tried a shorter first scene.
- **Tried (MOTION-4, Oct 6): a shorter first scene, prompt only, not shipped.** Scene 1 asked for one idea, 3 to 4 s, at most 10 lines and a handful of draw calls (hero plus one caption; detail from scene 2), in `motion_prompt.md` and the opener line. Same CLI path and models, 20 asks x 2. First scene median 5.0 s before, 5.5 s after (max 7.9 to 9.2 s); target was 3.5 s. Frame pass rate 43.8% to 46.0% (226 and 237 frames), scene 1 frames passing 4 of 40 to 0 of 40, films with 80% passing 15% to 10%. Fewer lines did not make the opener faster: the time is the CLI start plus the first tokens of the model, not the length of the scene. Reverted. What is left: a direct API stream for the opener only if a model there holds quality (MOTION-3's did not), or hiding the wait (a breathing ring is already shown) rather than shrinking it.
- A cheap tier for a small ask: one scene of 6 s, no stream.
- **Done (MOTION-5, Oct 6): a working row while scenes arrive.** /web shows one plain line: `Drawing the first scene` with the ring before the first frame, and `Drawing scene N` on the held last frame when the player has played everything it was given and the film is not whole. It goes the moment a scene lands, the film closes or a frame plays, so it never covers a playing scene. `of N` is left off because the maker does not know the count. Reduce Motion: same words, no movement. The plugin sends the same words as `doing` rows (`motion.drawing`) while each scene is made, and clears them when the film is whole; the compat gate is untouched. A `doing` only lands while the turn that asked for the film is still running, so the web does not depend on it after that.

## 3. Risks

- **Safety of generated code.** The sandbox must be real: opaque origin, no network, no storage, one message verb. The prototype does this in an iframe. The app must do it in WKWebView. Left over: an infinite loop freezes the web process. Mitigation: the watchdog, and later a Worker with OffscreenCanvas.
- **Prompt injection into code.** A scene written from content the agent read is untrusted code. Only the person's own agents may send `motion`, and the app asks once per agent.
- **App Store 2.5.2.** Downloaded code that runs in Apple's WebKit, does not change the app's purpose and gets no new access is allowed. A film is a picture. Say so in the review notes.
- **Cost.** $0.44 to $0.70 a film in the CLI measurements, with no caching. A saved film replays free.
- **Quality swings.** A film can be plain or misplaced. The prompt carries the direction and the eval checks that each scene draws, moves and stays on screen. Next: a quick look pass on one frame per scene.
- **Accessibility.** Motion is large. Reduce Motion shows a still, captions are text.
- **Telegram, the MCP app or an old build.** `compat.py` rewrites `motion` into a `sketch` plus `shapes`.

## 3b. Live timing on production /web (YUI-312, Oct 6)

A real agent (the plugin's own film writer) behind a throwaway account, a real browser on www.yuigui.com/web, three runs per ask. Harness: `site/e2e/web/live/web_motion_live.py`. Seconds from ask sent to first frame.

| ask | run 1 | run 2 | run 3 | scenes | film ends |
|---|---|---|---|---|---|
| how a car engine works | 28.7 | 5.7 | 20.1 | 5 to 6 | 32 to 60 s |
| what changed on the settings screen | 5.6 | 5.7 | 7.1 | 6 | 39 s |
| how compound interest grows | 5.3 | 6.7 | 12.9 | 5 to 6 | 38 to 40 s |

- 6 of 9 first frames under 10 s (median 6.7 s). The goal was 8 of 9. The three misses are the plugin's claude-CLI writer on a busy host, not the site: the player starts the instant scene 1 arrives. Follow-up: a small fast model for scene 1.
- No raw motion text on any run. Close returns to the thread with one line and one Watch again chip per film, every run.
- YUI-313 re-run (Oct 6): scene 1 now comes from claude-haiku-4-5 with thinking off (it thought ~25 s before its first word otherwise), the other scenes from sonnet, both started at once. First frames 5.1, 5.9, 8.0 (engine), 5.6, 6.5, 7.3 (settings), 4.9, 5.7, 5.8 (interest): **9 of 9 under 10 s**, median 5.8 s. Films end 34 to 81 s. Two traps found on the way: haiku names scenes with spaces (the parser now accepts them) and a cold CLI start costs about 3 s.
- Gateway arm: films stream to phones on build 545 and up (YUI-316, Oct 7: `MOTION_BUILD = 545`). A phone below 545 gets the same ask as a sketch, never raw text. The gateway needs one restart to pick up the lifted line.

## 4. Cards

**Look pass (MOTION-2, Oct 6).** `site/scripts/motion/look.py` renders one frame per scene (mid-scene) from the player and scores it on plain checks (blank, text off screen or cut, overlapping labels, under 3 colors, nothing moved between two frames) plus one vision-model look per frame; `look_set.py` runs the 20-ask set twice (40 films) and writes a contact sheet with the verdict under each frame. Frame pass rate, 230 frames: **34.5% before (229 frames), 47.4% after (230)**. Films with 80% or more frames passing: 12.5% to 17.5%. Top two failure classes before: plain or stand-in drawings (44 frames) and nothing moving (35); after: 29 and 11. Overlapping labels went 3 to 16 across runs (an earlier try had 1); MOTION-8 (below) explains and closes that. Generic fixes: the helper library places a text clear of any text already placed in the scene and keeps it out of the caption band (`kit.js`), and `motion_prompt.md` gains a LAYOUT block (safe band, label spacing, one counter instead of stacked values) and a SUBJECT block (draw the real noun from 3 or more parts, big, something moving all the way through). Time to first scene: **median 4.0 s before, 5.3 s after** (max 7.2 to 10.3). That is slower than the 1 s allowed; model latency swings run to run, and a bigger scene-1 opener cut overlaps to 1 frame but pushed the median to 8.0 s, so it was reverted. Plugin change needs no gateway restart beyond the next plugin reload. Still open: plain and off-subject hero drawings (about 29 frames each).

**Overlap check made steady (MOTION-8, Oct 6).** The swing was never the scoring: scoring the same 50 saved films twice gives the same overlap frames both times (100%, checked on three film sets). The swing came from the films, which the model writes fresh every run, and from reading one frame per scene. The check now reads label boxes from the player (every text the scene drew, with its measured box in screen pixels), counts two different labels as overlapping when the boxes cross by more than 2 px each way and the crossing covers more than a quarter of the smaller box, and fails a scene only when that holds at 2 or more of 5 sampled times (20, 35, 50, 65, 80% of the scene), so a label passing through another mid-move does not count and a collision that stays does (`OV_*` in `look.py`). Real overlaps it found: the helper library's text placement only ran on a still camera and judged in drawing coordinates, so a moving camera, a pin digit (placed at 0,0 inside the pin) and a text pushed into the caption band all slipped through. `kit.js` now judges every text in screen pixels whatever the camera does, settles a caption-band push and an overlap together (up if down does not fit), and leaves pin digits alone. 50 films, 283 frames, same films before and after: overlap frames **5 to 1**, frame pass rate **48.4% to 48.1%** (one frame, inside the vision model's run-to-run swing; plain-check failures fell). The one left is a centred label drawn over a pin digit (a film placing text, not a helper bug). No plugin change.

**The judge, checked first (MOTION-9, Oct 6).** Before another film fix we checked the film judge itself. Rule, written in `look.py`: a frame is on subject when a visitor with no caption would recognise the thing the ask names (or the part this scene is about) in the drawing. A clear icon or simple drawing counts; a chart or timeline counts only when the ask itself is about numbers, status or a plan; parts joined by lines count. A blob, oval or flat polygon that tries to be an animal, object or continent is a stand-in (off-subject). Boxes, a bare bar, a ring, a timer, bare circles with a date or a list are plain. I labelled 60 saved frames by that rule (39 on subject, 15 plain, 6 off-subject) and the old judge agreed on 30 of 60 (50%), with the same frame getting a different answer 27% of the time. The judge prompt now asks the subject question first (drawn, stand-in, none) and scores craft separately, so size and taste cannot flip it. After: 56 of 60 (93%; off-subject 5/6, plain 13/15, on subject 38/39), rescore 97%. On 20 frames labelled before any verdict was seen: 17 of 20 (85%), rescore 95%. Honest limits: 6 off-subject frames is a small class, and I fixed five labels where my own rule contradicted itself (disclosed in the card). Same 50 films (277 frames) judged by both: frame pass rate 42.6% to 52.3%, films 80%+ passing 14% to 22%, plain 38 to 36, off-subject 29 to 36, cramped 33 to 19, clipped 23 to 10. Off-subject is not the top class on the new judge (nothing moved is, 43), so no film prompt fix was made. Use `judge_eval.py score` with `labels60.json` to re-check the judge before trusting any later number. The 60 labelled frames and the contact sheet are on the progress page.

**Still scenes, checked first (MOTION-10, Oct 7).** After the judge fix, nothing moved was the top class (43 of 277 frames), so we checked that check before touching films. Rule, written in `look.py`: a scene is still only when nothing changes anywhere in it. The frames at mid-scene, 0.6 s later, and 20, 35, 50, 65 and 80% of the scene are compared, and the scene is still only when no two differ (under 0.2% of pixels). The old rule compared only two frames 0.6 s apart at mid-scene, so a scene that moves and then holds a beat counted as still. On the same 50 films, 43 frames were called still; all 43 are hold beats and none is a scene that never moves. Rescored twice: 277 of 277 verdicts agree. Old rule to new on the same films and vision verdicts: still 43 to 0, frame pass rate 52.3% to 61.4%, films 80%+ passing 22% to 36%, plain 36, off-subject 36 and cramped 19 unchanged. No real still scenes remain, so no prompt or kit change was made. Next: plain and off-subject drawings (36 frames each). The contact sheet of the 43 hold beats is on the progress page.

**Plain and off-subject drawings (MOTION-11, Oct 7, tried and reverted).** Judge re-checked first: 93% agreement with the 60 hand labels (needs 90%). On 20 asks x 2 (40 films) the two top classes were plain (34 frames) and off-subject (28). Reading those frames gave two root causes: (1) a named animal, food or machine is drawn as one filled oval with legs, ears or a face stuck on (the chicken is an orange egg with feet, the dog a box with a head), and (2) when the ask names an activity or a place (a workout, Rome, anxiety) the film falls back to a bare chart, ring or row of labels. Fix tried, kept generic: `api.thing(name, x, y, size, o)` in `kit.js` (bird, dog, fish, robot, car, temple, plant, skyline built from 4 to 8 parts that draw on one after another) plus a stronger SUBJECT rule in `motion_prompt.md` (5 parts minimum, api.geo for places, draw the work being done). Same 40 asks, before to after: plain 34 to 38, off-subject 28 to 33, frame pass rate 64.2% to 62.2%, films 80%+ passing 45% to 37.5%, first-scene median 4.9 s to 5.2 s. The model called `api.thing` in only 6 of 40 films and still drew the chicken as a blob in both runs, since chicken is not in the list and nothing makes it reach for parts. Target was a quarter fewer plain and off-subject frames and no drop in pass rate; it went the other way, so both changes were reverted and nothing shipped. What it tells us: a helper list only covers the nouns on it, and a rule line is not read hard enough. Next try: have the film first write a one-line parts list for the hero (what it is made of) and draw from that list, so the thing is chosen before any code. Before and after contact sheet is on the progress page.

**Plan the hero first (MOTION-12, Oct 7, tried and reverted).** Judge re-checked first: 90% agreement with the 60 hand labels (54 of 60, rescore 98%). Prompt-only fix, kept generic: before any scene code the film writes one PARTS line for the thing the ask names (chicken: body, wing, drumstick legs, plate), draws every scene from that list, and an activity or place names a setting and one actor instead of a bare chart. Same 40 films (20 asks x 2), before to after: plain 34 to 30, off-subject 28 to 32 (together 62 to 62, target was 46 or fewer), frame pass rate 64.2% to 63.8%, films 80%+ passing 45% to 40%, still 2 to 2, first scene median 4.9 s to 5.0 s (max 6.8 to 6.1). Spot probe: haiku and sonnet both wrote the PARTS line when asked (2 of 2), so the line is read; the run did not keep it, so the per-film count is not measured. What it tells us: the model plans the parts and still draws them as the same ovals and bars, so the gap is in how it draws a part, not in choosing it. Chicken stayed at 1 of 6 frames passing in both films, rome at 1 and 2. Next try: a per-part drawing recipe (a filled silhouette plus detail strokes for each part, written as a worked example for an animal and for a place) in place of more rules. Prompt change reverted, nothing shipped. Before and after verdicts are on the progress page.

**Worked drawings (MOTION-13, Oct 7, tried and reverted).** Judge re-checked first: 95% agreement with the 60 hand labels (57 of 60, rescore 97%). Prompt-only fix, kept generic: a PART SHAPES block in `motion_prompt.md` with four tiny worked paths (a jointed leg, a swept wing, a column with capital and base, a wheel with turning spokes), each a filled silhouette plus strokes, and a line saying to copy the thinking, not the thing. None of the four is an eval ask. Same 40 films (20 asks x 2), before to after: plain 27 to 27, off-subject 34 to 34 (together 61 to 61, target was 46 or fewer), frame pass rate 65.2% to 66.4%, films 80%+ passing 47.5% to 45%, still 2 to 1, first scene median 4.7 s to 5.1 s (max 7.4 to 7.7). Chicken passed 2 of 12 frames before and 0 of 12 after, rome 3 of 12 and 3 of 12. What it tells us: the examples were read (frame pass rate and overlaps held), but the film did not carry the idea over to a part the examples do not show, so the bar and oval came back. Four rule tries and one example try on the prompt have now moved the two top classes by nothing, so the prompt route is spent. A different lever is needed: have the kit draw the part (a library of silhouettes the film picks by name for any noun, with a fallback that asks a second model for one path per part), or let scene 2 redraw the hero once scene 1 is judged plain. Prompt change reverted, nothing shipped. Before and after verdicts are on the progress page.

**The kit draws the hero (MOTION-14, Oct 7, shipped).** Judge re-checked first: 92% agreement with the 60 hand labels (55 of 60, rescore 95%). The baseline was reused: the film prompt and the kit had not changed since MOTION-13. The fix has two parts and no new model call. (a) `kit.js` gets `api.thing(name, x, y, size)`: 69 drawn objects built from real parts (animals: dog, cat, fish, bird, chicken, roast chicken, cow, turtle, butterfly, bee; organs: heart, lungs, brain, stomach, tooth, bone, eye; vehicles: car, bus, truck, plane, boat, bicycle, train, rocket; tools: hammer, wrench, scissors, saw, screwdriver, paintbrush, key, ladder; buildings: house, castle, skyscraper, city, colosseum, church, tent, bridge, lighthouse; things: mug, lemon, apple, pizza, bread, egg, cake, bottle, chair, bed, clock, book, laptop, camera, umbrella, battery, plant, coins, box, watering can, tank, robot, piston engine, newsletter, envelope, calendar, globe, and a few names for the same drawing). Each is fitted to its own bounding box, and the size is capped at 80% of the screen width so labels keep clear. (b) `hermes-plugin/yui/motion_hero.py` picks the hero from the ask by a word match against those names (the earliest strong word wins; a lemon in a chicken recipe does not beat the chicken; a 3D ask gets none), writes the `api.thing` call into scene 1 itself after its look call, and tells scenes 2 and up the hero's name: they must keep it on screen, and the plugin writes the call in when a scene leaves it out. When nothing fits, the film is made exactly as before. Setting `YUI_MOTION_HERO=off` turns it off. No time is added to the first scene. Same 40 films (20 asks x 2), before to after: plain 27 to 19, off-subject 34 to 8, together **61 to 27** (target was 46 or fewer), frame pass rate 65.2% to 76.9%, films 80%+ passing 47.5% to 67.5%, first scene median 4.7 s to 4.5 s (max 7.4 s to 13.6 s: two slow runs, model latency), still 2 to 1, cramped 9 to 16, one scene throws (anxiety, which has no hero, so it is the model's own). The 11 asks that got a hero went from 43 bad frames to 7 (heart, engine, dog box, jump-start, robot, Rome, sunday and rent-or-buy all to 0; the roast chicken 10 to 4); the 9 asks with no hero went 18 to 20, which is run noise. Held-out check, 10 new asks with a body written after the kit was built (cat, hammer, bus, brain, castle, bee, lungs, elephant, telescope, submarine; `asks-heldout.json`, run with `look_set.py --set heldout`): plain 9 to 2, off-subject 30 to 9, together **39 to 11**, frame pass rate 60.9% to 83.0%, films 80%+ 47.4% to 65.0%, first scene median 4.8 s to 4.5 s. The seven with a drawing in the kit went 28 to 0 bad frames; the three the kit has no drawing for (elephant, telescope, submarine) stayed at 11 to 11, as expected, because the film is made the old way when no hero fits. The held-out "before" has 19 films (one bee film's judge call failed). What it tells us: the model could not draw a body blind, but it uses one it is handed, and a cheap word match is enough to hand it the right one. The ceiling is now the size of the kit. Where the app stands: films are gated off the iPhone (`MOTION_BUILD`), so this plays on /web and the playground. The app's bundled `motion-player.html` is already older than the site kit, so before films open on the phone it must be re-bundled with `bundle_player.py`; until then the hero line is guarded (`if (api.thing)`) and an older kit skips it. Next lever: for a noun the kit has no drawing for, one cheap model call that returns a single filled path per part, cached by name, or grow the kit from the nouns people actually ask for. Before and after verdicts are on the progress page.

**Films draw nouns the kit lacks (MOTION-15, Oct 7, shipped).** Judge re-checked first: 92% agreement with the 60 hand labels (55 of 60, rescore 97%). The baseline was reused for the 20-ask set and the first held-out set (the prompt, kit and `motion_hero.py` had not changed since MOTION-14) and rerun for the new asks. When the word match finds no kit object, the plugin makes one cheap call (`motion_hero.draw_new`, Sonnet 5.5 with thinking off, about 4 to 6 s, 14 s limit) that names the one thing the ask is about and returns 7 to 12 parts built only from five shapes (ellipse, circle, rect, poly, line; never a path string). The plugin checks every number (clamped to the -70..70 box), the five shape names, the seven fill names, the part count, at least two fills and a body at least 60 units wide, then writes the kit's own part lists itself. The film registers them with the new `api.defineThing(name, parts)` in `kit.js` (it refuses a kit name, a bad path, an odd fill, more than 16 parts, and does nothing on the second call) and draws them through `api.thing`, in scene 1 and in every later scene. A kit name from the model (it says "fish") uses the kit's drawing. A plan, numbers, status, screens, software, a feeling or a place has no single body: the call says so and the film goes on as before. The result is cached on disk by name (`yui_motion_things.json` under HERMES_HOME, or `YUI_MOTION_THINGS_CACHE`): the ask by its words, the parts by the noun, so a repeated ask costs no call (0.0 s, first scene 3.9 s measured) and a new ask about a known noun reuses the parts after one short call for the name. A failed call is not cached and the film goes on without a hero. `YUI_MOTION_THINGS=off` turns it off. The hero is also capped smaller: 280 px in scene 1, 230 px after (was 300 everywhere). A first try at 260 and 200 took cramped frames to 0 but the judge then called the roast chicken small (off-subject 8 to 21 on the set), so 280 and 230 is the setting kept. Haiku drew loose bits for the same call; Sonnet draws one object in the same time. Results, before to after, plain + off-subject frames: asks with no kit object, all three sets together (9 + 3 + 10 asks) **68 to 24 (down 65%, needed one third)**. Set, 20 asks x 2: 27 to 23, frame pass 76.9% to 86.3%, films 80%+ 67.5% to 77.5%, cramped 16 to 0 (needed 12 or fewer), still 1 to 1, first scene median 4.5 s to 4.9 s. Held-out 10, x 2: 11 to 2 (elephant, telescope, submarine 11 to 0), pass 83.0% to 93.9%, films 80%+ 65% to 95%, first scene 4.5 s to 4.2 s. New held-out 10 (giraffe, windmill, volcano, microscope, guitar, tractor, helicopter, piano, octopus, cactus; `asks-heldout2.json`, `look_set.py --set heldout2`, never used while building): **37 to 9**, pass 64.0% to 90.0%, films 80%+ 30% to 85%. First scene, all 80 films of the three sets: median 4.6 s to 5.2 s (max 13.6 s to 15.0 s). The cost sits on a noun seen for the first time: on the new asks the median is 4.9 s to 9.2 s, because every ask there is a new noun (two runs of one ask start together, so both paid; a repeat does not). The 9 abstract asks in the set all came back "no single thing" (workout, anxiety, tax, settings, plan, pieces, bug, status, checkout), cost one call each and are remembered. What it tells us: a model that cannot draw a body in free SVG can place a dozen kit shapes into a recognisable one when it plans the outline first, and the cache means the cost is paid once per noun. Where it stands: the drawings are simple (a giraffe reads as one; a snowman or an anvil is loose), and a first ask about a new noun is about 4 s slower. Next lever: warm the cache with the nouns people actually ask for, or start the call while the opener runs and draw the hero in scene 2 so the first scene is not held. The kit changed (`api.defineThing`): the app's bundled player (YUI-317) needs a re-bundle on the next ship; until then the call is guarded (`if (api.defineThing)`) and an older kit skips the hero.

**Shorter first scene (MOTION-4, Oct 6).** Prompt only: scene 1 is one idea, at most 10 lines. Median first scene 5.0 s before, 5.5 s after (max 7.9 to 9.2), target 3.5 s. Frame pass 43.8% to 46.0%, scene 1 frames 4/40 to 0/40. Missed on speed and on scene 1 quality, so the prompt change is reverted. Contact sheets on /progress.

Parked: the native `MotionView` player (APP). Then, in order: the `motion` component, streaming and eval in the guide and the site (WEB); the compat fallback (WEB); a fast first scene from a small model (WEB); voice-over sync (with the voice card). C stays as a harness mode with `api.hit` for turns that need a tap.

## 5. Files

- `site/public/demo/motion/prompt-stream.md`, `harness-stream.html`, `stream-sonnet.json`, `stream.json` (Opus): the streamed A prompt, player and the two recorded runs. `site/scripts/motion/stream.py` makes a run.

- `site/public/demo/motion/prompt-free.md`, `prompt-hybrid.md`, `prompt-yl.md`: the exact prompts.
- `site/public/demo/motion/free.html`, `hybrid.js`, `eli5-string.scene`, `harness.html`, `*.run2.*`: what the model made and the harness.
- `site/scripts/motion/generate.py` (runs the model and records time, tokens, cost), `record.py` (records a demo as a phone-sized mp4).
- `site/lib/motion/scene.mjs` and `scene.test.mjs`: the B language (parse, evaluate, camera, morph), 4 tests.
- `site/app/playground/motion.js`, `motion.css`: the three demos.

### api.three() (real three.js, MOTION-1a)

A scene that contains `api.three(` gets real three.js. The player asks its host for the library only then:
it sends `need-three`; the site host (`MotionFilm.js`) fetches `/demo/motion/three.min.js` and posts `{three: src}`,
the app host answers `window.yui.three(src)` from a bundled resource. The film clock holds on the first scene that needs it
(breathing ring) until the source arrives. `api.three()` returns `{THREE, scene, camera, once(fn), color(name), draw()}`,
one `THREE.Scene` per film scene on a shared transparent WebGL canvas, composited into the 2D canvas at `T.draw()`
(auto at scene end if never called). Nothing is created for a film that never asks. Rebuild the library with
`site/scripts/motion/build_three.sh` (tree-shaken, v0.181.2, 579 KB, 150 KB gzipped). Heap in headless Chromium:
+1.2 MB with the library parsed, +1.5 MB more with a drawn scene; zero when unused.
