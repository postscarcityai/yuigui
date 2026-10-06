---
date: 2026-10-06
tag: release
title: "Every small model draws"
dek: One small model drawing a Yui screen is a sample of one. So we asked two more families, on the same stock Ollama. All three drew it, nine runs out of nine.
---

```shot
/progress/site214-chart-dark.webp | Three models, qwen2.5:7b at 4.7 GB, gemma4:e4b at 9.6 GB and llama3.2:3b at 2.0 GB, each with three green checks for three live runs that drew a screen. A note says the smallest, llama, is the roughest.
```

Last time, one model on a laptop learned to draw. Fair question: was that the model, or the idea? So I asked a Google model and a Meta model the same thing.

The ask: "Show me a choose screen titled Drink with exactly two options, Tea and Coffee." Stock Ollama, nothing tuned, three live runs each.

```shot
/progress/site214-screens-light.webp | The same Drink screen with Tea and Coffee buttons, drawn by qwen2.5:7b, gemma4:e4b and llama3.2:3b side by side. The llama thread also shows a stray text bubble that starts with Response.
```

## Where it was rough

The 3B llama is the smallest and the roughest. Look at its screen: it drew the buttons, then added a bubble that starts with `[Response:]`. After a tap it sometimes makes up a follow-up screen nobody asked for. It also finished one answer before the test could kill the bridge, so that check missed on timing. Four reruns were clean.

Gemma and qwen were tidy.

```shot
/progress/site214-remembers-dark.webp | Dark threads for all three models. After the tap on Tea, each one answers TEA when asked which drink was picked.
```

## What changed in the bridge

A few small repairs, the same for every model:

- An empty answer is asked once more.
- A bare Yui Line gets its fence.
- An unclosed fence is closed.
- A stray `[yui]` marker is dropped.

No model-by-model hacks.

Nine live runs, nine screens. If a model misses, we will show you that too.

```try
/developers#models | Bring your own model
```
