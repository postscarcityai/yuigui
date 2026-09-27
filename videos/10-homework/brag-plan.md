# Brag plan: Homework rescue (10-homework)

## Angle

Marketing, not a tour. A real moment every parent knows: 8 pm, a fractions worksheet, a kid in tears. The parent asks the agent out loud and hands over the phone. Quill (a study agent, warm orange) answers on the whole screen: first a picture that moves (half a chocolate bar is two quarters), then a game made of her own fractions, then one quick check. The wow is the memory game: the agent turned the homework into something she wants to play. It ends on the agent's side: the score goes back, and Quill plans tomorrow.

Dark theme (evening homework). The chrome around the phone is plum, off-white and coral (`body.dark`), the glow pulses with the kick. Inside the phone the stage wears Quill's orange: `#FF9F43` for strokes, text on dark and glows; `#C2620D` behind white text and icons (the mic, Send, the face), since white on `#FF9F43` is only 2:1 and on `#C2620D` it is about 4:1.

## Facts used (all shipped in the app, `app: native` in site/content/showcase.json)

- **Shapes that move** (YUI-104, shipped Sep 25): "A small diagram that moves: circles, boxes, blobs, labels and arrows that come on one after another, with a caption under it." spec/YL.md `shapes`: boxes with `at=`, `size=`, `+fill`, `+grow`, `+dash`, `+pulse`, tones from the agent's look, parts a beat apart. The chocolate bar is only boxes and one dashed line, so an agent can send it today:
  ```
  shapes "Half a chocolate bar" w=10 h=6 caption="Two quarters cover the same as one half."
  shape box 1/4 at=2,1.8 size=2,1.4 +fill +grow
  shape box 1/4 at=4,1.8 size=2,1.4 +fill +grow
  shape box 1/4 at=6,1.8 size=2,1.4
  shape box 1/4 at=8,1.8 size=2,1.4
  shape box 1/2 at=3,4.2 size=4,1.4 tone=mint +fill +grow +pulse
  shape box 1/2 at=7,4.2 size=4,1.4 tone=mint
  shape line from=5,0.8 to=5,5.2 tone=mute +dash
  ```
- **Memory** (YUI-59, shipped Sep 25): "Match the pairs. The agent picks the faces: fruit, or the words you are learning." spec: `items` are emoji or short words, `pairs` 2 to 12, shuffled on the phone; finding every pair emits `{kind, over: true, moves, seconds}`. The faces here are six fractions, each twice: `game memory "Fraction pairs" pairs=6 items=1/2|1/3|1/4|2/3|3/4|1/8`. Matched cards turn mint and a line says how it went ("All 3 pairs in 4 moves, 5s." in `/progress/yui59-memory.webp`). A game opens on the stage.
- **A deck with a quiz at the end** (YUI-18, YUI-19, YUI-113): a `choose` with `answer=` is graded, marks the right option and shows `why`. When every page is seen and every question answered the deck emits `{done: true, pages, score, of}` (spec/YL.md deck). The pill shows `→ agent {"done":true,"score":3,"of":3}` with `pages` left out for length.
- **The stage** (YUI-119, shipped to phones in Yui 0.4.0, build 204, Sep 27): tap the mic and talk, the words stream in, the working row in the agent's color, parts with segments at the top and arrows bottom left, questions last with one Send, the record top right with a count. Built with `kit/stage.js`.
- **Demo content** inside the phone (Maya, the worksheet, the words Quill says, 8 moves and 46 s) is illustrative. No numbers or quotes are claimed.

## Storyboard (100 BPM, a bar is 2.4 s, 14 bars is 33.6 s)

| Time | Scene | Left (ink) | Right (coral) | Line |
|---|---|---|---|---|
| 0 to 4.8 | A worksheet under a lamp: "2/4 = ?/2" with a scribbled-out answer, "Which is bigger? 1/3 or 1/4" with a crossed-out guess, a tear drop on the paper. The phone rises over it (3.6) on Quill's idle stage | Homework at 8 pm? | Stuck on fractions. | |
| 4.8 to 9.6 | Tap the mic (4.8, the drop). "Maya's stuck on fractions. Can you help?" streams in. Working: Picking a way to show it · 1s, 2s | Ask out loud. | Then hand her the phone. | |
| 9.6 to 14.4 | Part 1 of 3, a shapes diagram: four pieces of a bar, two filled; a bar in two under it, one filled; a dashed line shows the edges meet. "2/4 is the same as 1/2." Push in | See it first. | A picture makes it click. | |
| 14.4 to 21.6 | Tap next. Part 2, the wow: memory, 12 cards with Q on the back. The camera pushes in. 1/2 and 1/2 (15.0, 15.6) match with a pop and a bell; 1/4 and 3/4 miss; 3/4 and 3/4 (18.0, 18.6) match. The rest flip in a quick ripple (19.2 to 20.4), every card turns mint: "All 6 pairs in 8 moves, 46s." | Then play it. | The cards are her fractions. | `game memory "Fraction pairs" items=1/2\|1/3\|…` |
| 21.6 to 24.0 | Tap next. Part 3, the quiz: "Which is bigger?" 1/3 or 1/4. Tap 1/3 (22.8): Right, with why | Then a quick check. | She gets it right. | |
| 24.0 to 28.8 | The deck's event goes back. Quill: "Reading Maya's score", then a 3 of 3 picture, "Maya got 3 of 3. Tomorrow: adding fractions." Before I go: "Same time tomorrow?" Yes, 8 pm (27.0), Send (27.6), Sent | Your agent sees the score. | And plans tomorrow. | `→ agent {"done":true,"score":3,"of":3}` |
| 28.8 to 33.6 | Outro: the wordmark, "Help you can see and play.", yuigui.com/start, "In Yui 0.4. Public beta on TestFlight." | | | |

Poster: 18.9 s, mid game after the second match, the camera in close.

## Beyond the spec, or approximated

- **Quill** is a name the parent gave their agent. Yui's starter agents (Quill among them, YUI-37) are `app: later`; nothing here says Yui hosts the agent.
- **The memory card back** (the agent's letter on its color) and the flip are drawn by eye; the only real capture is the finished board. The quick ripple at 19.2 stands for her finishing the board; the finger leaves while it plays.
- **Not a pizza.** `shapes` has no wedge, so a pizza with two lit slices is not something an agent can send today. The chocolate bar is made of boxes, which it can.
- **Two quiz questions** before the one shown are implied by "3 of 3" and the page count, not played.
- Voice: the words stream in as heard (stage spec), no real audio.

## Sound

`music.py`, `kit/sound.py` `dub()`, 100 BPM, swing 30, in C: Am7 Fmaj7 C G. The hook is thin (level 1, then 2), a siren drops into the ask on the mic tap (4.8). Level 3 for the ask and the picture, 4 with the melodica for the game, 3 for the quiz and the agent's side, 2 and 1 for the outro, ending on C. A bell as the picture lands; a bright two-note bell on each match, the board clear and the right answer; soft plucks on the ripple of flips; an arpeggio on Send; a swell and a crash on each big cut. Every tap in `score.js` sounds on the finger's time.
