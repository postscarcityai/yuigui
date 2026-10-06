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

Status (MOTION-1e, Oct 6): the first two are done. The channel guide (v49, `spec/CHANNEL.md`) teaches the one-line `motion "<ask>"` and when to use it (any explain-by-picture, the work itself included; a plain fact stays a line); `spec/YL.md` has the `motion` preset; the yui plugin (`motion.py`, `adapter.py`) makes the film and streams each scene as its own row; `compat.py` gates it behind `MOTION_BUILD` (a sentinel until the build that plays films is VALID) and draws it as a sketch on older phones. The eval holds eight `motion-*` cases.

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
- Gateway arm: the gateway's plugin still carries the MOTION_BUILD sentinel, so the same ask draws as a sketch, never raw text. Streaming films there needs the gateway restarted onto the lifted sentinel.

## 4. Cards

**Look pass (MOTION-2, Oct 6).** `site/scripts/motion/look.py` renders one frame per scene (mid-scene) from the player and scores it on plain checks (blank, text off screen or cut, overlapping labels, under 3 colors, nothing moved between two frames) plus one vision-model look per frame; `look_set.py` runs the 20-ask set twice (40 films) and writes a contact sheet with the verdict under each frame. Frame pass rate, 230 frames: **34.5% before (229 frames), 47.4% after (230)**. Films with 80% or more frames passing: 12.5% to 17.5%. Top two failure classes before: plain or stand-in drawings (44 frames) and nothing moving (35); after: 29 and 11. Overlapping labels went 3 to 16 across runs (an earlier try had 1), so that check is noisy and still open. Generic fixes: the helper library places a text clear of any text already placed in the scene and keeps it out of the caption band (`kit.js`), and `motion_prompt.md` gains a LAYOUT block (safe band, label spacing, one counter instead of stacked values) and a SUBJECT block (draw the real noun from 3 or more parts, big, something moving all the way through). Time to first scene: **median 4.0 s before, 5.3 s after** (max 7.2 to 10.3). That is slower than the 1 s allowed; model latency swings run to run, and a bigger scene-1 opener cut overlaps to 1 frame but pushed the median to 8.0 s, so it was reverted. Plugin change needs no gateway restart beyond the next plugin reload. Still open: plain and off-subject hero drawings (about 29 frames each).

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
