---
date: 2026-10-05
tag: why
title: "Explain it like I'm five, with real motion"
dek: Ask for string theory and you used to get text slides. Now the agent writes a short film, full screen, and the first scene plays in about seven seconds.
---

```clip
/demo/videos/motion-stream-sonnet.mp4 | A film the agent wrote for "explain string theory like I'm five". Dark, full screen, no card around it.
```

The ask was simple. Explain string theory like I'm five. The answer was a stack of slides with words on them. It was correct and it was boring.

The fix is to let the agent draw. It writes the scene as code and Yui plays it full screen. A dot of light, a camera that falls in, a string that wiggles into a note.

## Three ways, one pick

We built the same piece three ways and watched them side by side.

```shot
/progress/motion-free-dark.webp | Free code: the agent writes the whole page, its own look every time
/progress/motion-yl-dark.webp | Yui Lines with motion: tidy and cheap, but it only draws what the language has words for
/progress/motion-hybrid-dark.webp | Mixed: the agent writes the scene, Yui keeps the buttons
```

Free code looked best, so that is the one. Camera moves and shape morphs from the second try are helpers it can call. Taps float over the film at the end, never in a box.

## First scene in seconds

The first version took eight minutes to make before a single frame showed. Now the agent streams it scene by scene.

```shot
/progress/motion-stream-sonnet-dark.webp | Scene four of the streamed film: three strings, each one a note
/progress/motion-stream-opus-dark.webp | The same ask on a bigger model: a different film
```

The first scene was written in 6.6 seconds. The whole film took 21. Ask twice and you get two different films.

```try
/playground?demo=motion-free | Play the film
/developers/values | Why a few paragraphs between pictures
```
