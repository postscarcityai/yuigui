# Motion explainers | spec v1 (decided: streamed A)

Chris, Oct 5: "I want this to look like a professionally designed explainer video more than these boring slide by slide explanations. Some camera movements, some shapes that transform, some motion, the ability to make something totally unique every time even if I ask for the same thing. I'm about to give up on this app and I need you to save it." He also asked whether YL is the wrong layer and the agent should just write code.

Decision: Chris picked A (free code) as the default, with B's camera and morph as helpers, and C only where a turn needs a tap. Section 2 says what that means and measures the streamed version. The three-way comparison that led to it stays below.

This is the design answer. Three working prototypes of the same ask ("ELI5 string theory"), what each costs, how each fails, and one recommendation. No app code changed and the live guide is untouched. Try them: [A](/playground?demo=motion-free), [B](/playground?demo=motion-yl), [C](/playground?demo=motion-hybrid). Each also plays a second model run of the same prompt with `&v=run2`, so you can see that the same ask gives a different piece.

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
- A cheap tier for a small ask: one scene of 6 s, no stream.
- A working row (`doing "Drawing the next scene" 2/7`) while scenes arrive.

## 3. Risks

- **Safety of generated code.** The sandbox must be real: opaque origin, no network, no storage, one message verb. The prototype does this in an iframe. The app must do it in WKWebView. Left over: an infinite loop freezes the web process. Mitigation: the watchdog, and later a Worker with OffscreenCanvas.
- **Prompt injection into code.** A scene written from content the agent read is untrusted code. Only the person's own agents may send `motion`, and the app asks once per agent.
- **App Store 2.5.2.** Downloaded code that runs in Apple's WebKit, does not change the app's purpose and gets no new access is allowed. A film is a picture. Say so in the review notes.
- **Cost.** $0.44 to $0.70 a film in the CLI measurements, with no caching. A saved film replays free.
- **Quality swings.** A film can be plain or misplaced. The prompt carries the direction and the eval checks that each scene draws, moves and stays on screen. Next: a quick look pass on one frame per scene.
- **Accessibility.** Motion is large. Reduce Motion shows a still, captions are text.
- **Telegram, the MCP app or an old build.** `compat.py` rewrites `motion` into a `sketch` plus `shapes`.

## 4. Cards

Parked: the native `MotionView` player (APP). Then, in order: the `motion` component, streaming and eval in the guide and the site (WEB); the compat fallback (WEB); a fast first scene from a small model (WEB); voice-over sync (with the voice card). C stays as a harness mode with `api.hit` for turns that need a tap.

## 5. Files

- `site/public/demo/motion/prompt-stream.md`, `harness-stream.html`, `stream-sonnet.json`, `stream.json` (Opus): the streamed A prompt, player and the two recorded runs. `site/scripts/motion/stream.py` makes a run.

- `site/public/demo/motion/prompt-free.md`, `prompt-hybrid.md`, `prompt-yl.md`: the exact prompts.
- `site/public/demo/motion/free.html`, `hybrid.js`, `eli5-string.scene`, `harness.html`, `*.run2.*`: what the model made and the harness.
- `site/scripts/motion/generate.py` (runs the model and records time, tokens, cost), `record.py` (records a demo as a phone-sized mp4).
- `site/lib/motion/scene.mjs` and `scene.test.mjs`: the B language (parse, evaluate, camera, morph), 4 tests.
- `site/app/playground/motion.js`, `motion.css`: the three demos.
