---
date: 2026-10-06
tag: release
title: "Small models write films"
dek: Ask a small model on your own laptop how a rainbow forms. It now answers with one line and a film. The 3B llama went from nine misses out of nine to a film now and then.
---

```shot
/progress/site217-gemma-film-dark.webp | Dark thread. The question "how does a bill become law?" gets one short line from gemma4:e4b, then a film card with a play button and the words "Drawing it now".
```

An explain question is a good fit for a film. So I checked whether a small model on a stock Ollama would write one. Not the whole film, just the ask: one short line, then one `motion` line of two to four sentences.

Three asks, three live runs each, three models: how does a rainbow form, how does a bill become law, explain compound interest like I'm five.

```shot
/progress/site217-chart-dark.webp | Nine dots per model. qwen2.5:7b has eight green, gemma4:e4b has nine green, llama3.2:3b has five green and four grey, with a note that before the bridge fixes it had none.
```

## What it did before

The 3B llama never wrote a film. It drew a card, a form and a pick, all about rainbows, because it had a screen in mind and no film.

```compare
before: card "Rainbow Inside Sun" body="Sun shines through water droplets in air\n and light gets split into colors"\nask "Which colors make up a rainbow from there?" | Before: a card, a question and seven color buttons
after: motion "Sunlight enters a raindrop and bends. It splits into colors, bounces off the back, exits. We see the colors as a rainbow." | After: one motion line
```

Same model, same ask. That is a real before and after from the raw answers.

## The one bridge fix

Small models get the motion line nearly right. The quote is missing, or the sentence wraps onto a second line, or the fence is left open. The bridge now repairs those three shapes, and the short guide for small windows carries the film rule. A film reply also keeps one short line above it and drops the prose a small model adds below. Same rule for every model, no model-by-model hacks.

```shot
/progress/site217-gemma-film-light.webp | Light. The first frame of the film: a pale page, a small ring in the middle, and a play bar at the bottom. The film is just starting.
```

## What is still rough

gemma4:e4b hit nine of nine. qwen2.5:7b hit eight: once it chained its facts into a single sentence. llama3.2:3b hit five that day. Its misses are three plain lines with no fence, or a made-up line like `sign`. The next section is what happened when I fixed those.

## What the llama fix did

I went after the llama misses next. The repairs are generic, the same for every model. A card line whose `body=` landed alone on the next line now joins its preset. An unknown preset is never guessed into a film. A film opener the model dropped is put back, but only when you asked an explain question.

I replayed 90 saved llama replies through the bridge. Films went from 4 to 36. Then I ran it live: the llama made 1 or 2 films out of 9. gemma4:e4b and qwen2.5:7b made 9 of 9.

```shot
/progress/int29-llama-film-dark.webp | Dark thread. llama3.2:3b answers an explain question with one short line and a film card with a play button.
```

So the replay looks great and the live run barely moves. Most live llama replies are plain text, or a card or a pick. I left those alone on purpose. A 3B model's plain answer is still a fine answer, and turning it into a film would mangle it.

Nothing here makes a 3B model smart. It makes the bridge forgiving, so a small model's one good idea reaches the screen as a film.

```try
/developers#models | Bring your own model
/motion | Play all 40 films
```
