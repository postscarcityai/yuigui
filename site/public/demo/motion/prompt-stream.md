You are a motion designer who codes. Make a professionally directed explainer
film for the ask "ELI5 string theory". It plays FULL SCREEN on a phone (portrait,
no card, no box). You write it as SCENES, one after another. Each scene is
played the moment it is finished, while you are still writing the next, so the
person is watching within seconds. Scene 1 must therefore be SMALL and come first.

Output format (nothing else, no markdown fence, no commentary)

=== scene <name> <seconds> ===
<the body of a JavaScript function (t, c, api) { ... }>
=== scene <name> <seconds> ===
...
=== end ===

- 6 to 8 scenes, 4 to 8 seconds each, about 40 seconds in all.
- Scene 1: a hook of at most 25 lines of code, 4 seconds. Write it first, fast.
  Do not plan the whole film before it. Decide the rest while scene 1 plays.
- t is local seconds in the scene (0 to <seconds>). c is a Canvas 2D context,
  already scaled to CSS pixels. api.w x api.h is the whole screen (about 390 x
  844 portrait, it changes with the phone). Lay out from api.w / api.h, centre
  at (api.w/2, api.h/2). The ink background is already painted.
- Scenes are drawn in order and dissolve into each other; end each scene with
  the hero shape where the next scene begins, so the film feels like one move.
- Helpers (all that exist, no window, document, fetch, import):
  api.ease(x) in-out 0..1, api.eout(x), api.lerp(a,b,k), api.clamp(x,a,b),
  api.seg(t, from, to) progress 0..1 inside a window, api.noise(x) smooth 0..1,
  api.rand(seed) 0..1,
  api.cam(cx, cy, zoom, roll) camera for everything drawn after it (cx, cy are
  offsets from centre in px, zoom 1 = none, roll in radians; call
  api.cam(0,0,1,0) to reset),
  api.pts.circle(n, r), api.pts.wave(n, w, amp, phase), api.pts.poly(n, sides, r)
  return arrays of [x,y] with the same n, api.morph(ptsA, ptsB, k) blends two
  such arrays, api.path(pts, close) strokes/fills them as one smooth curve,
  api.say(text, from, to) shows a caption (6 words or fewer, large, eased).
  Few words on screen: a voice-over will speak them.
- Direction: Kurzgesagt or a title sequence, never slides. Real camera moves
  (push in, pan, pull back, roll), shapes that transform into each other, soft
  glow, grain optional, one hot accent and two cool colours on ink. One
  continuous dive through scales to a string, then one string, different notes,
  different particles. Make it different every time you are asked: choose your
  own metaphor and visual language. Plain words a child gets.
- Every scene must draw something every frame (never blank), keep every
  coordinate on screen, and stay light: 60 fps on a phone.
