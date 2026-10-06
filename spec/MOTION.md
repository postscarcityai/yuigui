# Motion explainers | spec v0 (proposal)

Chris, Oct 5: "I want this to look like a professionally designed explainer video more than these boring slide by slide explanations. Some camera movements, some shapes that transform, some motion, the ability to make something totally unique every time even if I ask for the same thing. I'm about to give up on this app and I need you to save it." He also asked whether YL is the wrong layer and the agent should just write code.

This is the design answer. Three working prototypes of the same ask ("ELI5 string theory"), what each costs, how each fails, and one recommendation. No app code changed and the live guide is untouched. Try them: [A](/playground?demo=motion-free), [B](/playground?demo=motion-yl), [C](/playground?demo=motion-hybrid). Each also plays a second model run of the same prompt with `&v=run2`, so you can see that the same ask gives a different piece.

## 1. The three prototypes

| | A. Free code | B. YL grows motion | C. Hybrid |
|---|---|---|---|
| Who draws | the model writes a whole HTML page | our renderer draws a scene written in a small YL layer | the model writes only the scene function; a fixed harness plays it |
| Native parts | none, the page owns the screen | none in the piece; the caption and buttons are ours | title, line and buttons stay native and tappable around it |
| Look ceiling | highest: its own metaphor, type, particles, glow | capped by our vocabulary (camera, morph, hum modes) | high, close to A |
| Unique each time | yes (run 1 and run 2 differ completely) | only as much as the vocabulary allows | yes (run 1 and run 2 differ completely) |
| Output of the model | 19 KB of HTML, 48 to 53k tokens | ~3.4 KB, 90 lines; the model wrote the same size, 5.5k tokens with thinking (see 1.3) | 6 to 7 KB of JS, 15 to 22k tokens |
| Time to first frame in the page | ~1 s after load | ~1 s after load | ~1 s after load |
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

## 2. The recommendation: C, with B's primitives inside it, and A as the escape hatch

**Make the motion piece a first-class screen part, written by the agent as code, played in a sandboxed harness, framed by native YL.**

Why C:

1. It answers Chris's ask head on: camera moves, shapes that transform, a different piece every time, no flow charts. The agent gets a canvas and an API, not a menu.
2. It keeps what is good about Yui. The line, the question and the buttons stay native, so the person still taps, the answer still comes back as an event, and the same turn works on a phone, in Telegram's fallback and in the MCP app (which shows the sketch instead).
3. It is a third of the cost and time of A, because the harness owns everything that is the same each time.
4. It is the safer of the two code options: one fixed page, a message handler with one verb, and a scene function that only sees a canvas.

What B gives C: the camera (`cam at zoom roll`, log-space zoom with a dolly), morphing between outlines, nested scale frames, hum modes. They go into the harness API as helpers (`api.cam`, `api.morph`, `api.frame`), so a model that wants them writes one line instead of 40. B's own renderer stays as the **fallback**: when the code fails or the phone is in Low Power, the agent's `shapes`/`sketch` drawing plays instead.

What A is for: a single hero explainer the person asks for by name ("make a movie of it"). One full page, in the same sandbox, behind a "this takes a few minutes" working row. It is not the default.

### 2.1 What changes in the guide

One new component and one rule. The piece is a block, like `diagram`, because code is many lines:

````
Here is string theory in motion.
```yui
motion "ELI5 string theory" caption="One string, many notes."
...the scene function body...
end
choose "Which particle was a hum?" Electron|Photon|Graviton
```
````

- `motion "Title" [caption=] [+full] [+loop]` takes the lines up to `end` as the scene function body. A tap target the scene registers (`api.hit`) comes back as `[yui] n1 motion tap=graviton`.
- The rule, in **Use it well**: an explainer, a "how does X work" with a story, a "show me" about scale or change is one line, one `motion` and one `choose`. A fact, a status or a plan stays a line and a sketch. Never both: no `deck` of the same idea.
- `motion` replaces the "Explainers draw every page" rule for stories. The `deck` of `map`/`chart`/`shapes` pages stays for facts and figures.
- The harness contract (the same as `public/demo/motion/prompt-hybrid.md`): `scene(t, c, api)`, `api.w x api.h` fixed at 390 x 420, `ease`, `lerp`, `seg`, `cam`, `noise`, `caption`, `hit`. Nothing else exists: no window, document, fetch or import.
- Eval cases: a scene parses, runs 60 frames headless without throwing, stays inside a time budget per frame, draws something non-blank, and uses no forbidden global.

### 2.2 What changes in the app

- `MotionView`: a WKWebView with a bundled `harness.html`, no network (`WKContentRuleList` blocks every load, CSP `default-src 'none'`), no cookies, a non-persistent data store, and a single script message handler (`motion`) for `ready`, `first-frame`, `tap` and `error`. The agent's code goes in through `evaluateJavaScript` after `ready`.
- Native chrome around it: pause, scrub, replay, Reduce Motion (the end frame, still), VoiceOver reads the captions as one string.
- Watchdog: no `first-frame` in 2 s, an `error` message, or a frame over 50 ms for 2 s, and `MotionView` swaps in the fallback drawing and tells the agent (`[yui] n1 motion error=...`) so it can retry.
- The full-screen stage plays a `motion` like it plays a `deck`.
- Scenes are saved on the shelf with `save`, so a replay costs nothing.
- The site playground and the MCP app render `motion` the way these prototypes do (an iframe with the same harness).

### 2.3 Speed: the hard part

Opus 5.5 took 155 to 217 s for a piece, nearly all of it thinking. That is too slow for a chat turn. Things that make it a turn:

- **Chapters.** The agent sends the first 8 to 10 seconds as one `motion` (about a quarter of the tokens), the next chapter appends while the first plays (`motion +next`), the harness stitches them on one clock. The person watches while the rest is written.
- **A faster model for the piece.** The harness contract is small and the helpers do the camera and morph work. Try Sonnet 5.5 and Haiku 4.5 on the same prompt before deciding; the eval above scores them.
- **A working row** with the real step (`doing "Drawing the zoom" 2/4`), as the guide already says.
- **Templates the agent edits** (the cup-to-quark dive is a scene the agent can reuse and re-skin), saved to the shelf like any screen.

## 3. Risks

- **Safety of generated code.** The sandbox must be real: opaque origin, no network, no storage, one message verb. The prototypes do the first three in an iframe; the app must do it in WKWebView (non-persistent data store, content rule list, no `WKUserScript` bridge beyond `motion`). Remaining: an infinite loop or a huge allocation freezes the web process. Mitigation: the watchdog above, and a long term move to a Worker with OffscreenCanvas so the main thread never runs the model's code.
- **Prompt injection into code.** A scene that came from content the agent read (a web page, an email) is untrusted code. Only the person's own agents may send `motion`, and the app asks once per agent the first time ("Yui can show motion pieces").
- **App Store 2.5.2.** Downloaded code may run when it is interpreted by Apple's WebKit, does not change the app's advertised purpose and gets no new access. A motion piece is a picture. Worth one line to App Review in the notes.
- **Cost.** $0.33 to $0.47 a piece on Opus 5.5 with no caching; a saved scene replays free.
- **Quality swings.** The model can write a dull piece. The prompt carries the direction (one camera move, shapes that transform, six word captions); the eval scores that a frame is non-blank and moves.
- **Accessibility.** Motion is large. Reduce Motion shows the end frame, captions are text, the question under it is native.
- **Fallback in Telegram, the MCP app, or an old build.** `compat.py` rewrites `motion` into the same `sketch` plus `shapes` it would have drawn (the agent writes both, the plugin keeps the one that fits).

## 4. If Chris picks C

Cards (parked, backlog, in this order): the `motion` component and harness in the guide and the site (WEB); `MotionView` in the app (APP); the compat fallback and eval cases (WEB); the chapters protocol (WEB + APP); a Sonnet and Haiku run of the same prompt (WEB). A: keep as a one-off `+hero` form later. B: its camera and morph become helpers in the harness; its renderer stays as the fallback and the Telegram and widget still.

## 5. Files

- `site/public/demo/motion/prompt-free.md`, `prompt-hybrid.md`, `prompt-yl.md`: the exact prompts.
- `site/public/demo/motion/free.html`, `hybrid.js`, `eli5-string.scene`, `harness.html`, `*.run2.*`: what the model made and the harness.
- `site/scripts/motion/generate.py` (runs the model and records time, tokens, cost), `record.py` (records a demo as a phone-sized mp4).
- `site/lib/motion/scene.mjs` and `scene.test.mjs`: the B language (parse, evaluate, camera, morph), 4 tests.
- `site/app/playground/motion.js`, `motion.css`: the three demos.
