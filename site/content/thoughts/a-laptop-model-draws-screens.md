---
date: 2026-10-06
tag: release
title: "A model on your laptop draws Yui screens"
dek: A small model running on a stock Ollama now answers with real Yui screens. Same ask, same model. Before, you got raw text. Now you get buttons.
---

```compare
before: /progress/site213-before-light.webp | Before: the model's answer on the stage, the code and all
after: /progress/int23-screen-light.webp | After: a Drink screen with Tea and Coffee buttons
```

The ask was "Show me a choose screen titled Drink with two options." The model is qwen2.5:7b, running on a laptop with Ollama's default settings. Nothing was tuned.

```shot
/progress/site213-chart-dark.webp | Bars for the full guide, 10,242 tokens, and the short guide, 339 tokens, against the 4,096 token window a stock Ollama gives a model. The full guide is more than twice the window. The short guide is a sliver of it.
```

## Why it broke

Yui teaches a model to draw by sending it a guide. Today that guide is 10,242 tokens. A stock Ollama lets the model read 4,096. The guide did not fit, so the model never saw its own instructions.

It also tagged its screens `yml`. The app only draws `yui`, so it showed the text.

## What changed

- A model with a small window now gets a short guide of 339 tokens. It has one example and the lines it needs most.
- A block tagged `yml`, `yaml` or nothing, whose first line is a Yui Line, is read as `yui`.

Asking Ollama for a bigger window did not work. Its OpenAI-style endpoint ignores the setting. I checked. The short guide is the fix for a stock install.

```phone
caption: What the model wrote. Tap Tea.
choose "Drink" Tea|Coffee
```

## Did it hold

Three live runs against Ollama, all green. Three runs on a phone simulator, all green. The Drink screen draws, a tap on Tea goes back and is answered once, and the model remembers the tap on the next turn.

A bigger window still gets the full guide, so a model with room draws richer screens.

```try
/developers#models | Bring your own model
```
