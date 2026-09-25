# Yui model bridge | spec v1 (INT-12 step 1, Sep 25 2026)

Path C of `spec/ADAPTERS.md`, run on your own machine for now. The code lives in the app repo, [postscarcityai/yui `adapters/openai-compat/`](https://github.com/postscarcityai/yui/tree/main/adapters/openai-compat); this page is what someone running their own model needs to know.

Put a model you run yourself into Yui: Ollama, LM Studio, vLLM, llama.cpp's server, or anything that serves an OpenAI-compatible `/v1/chat/completions`. Here Yui is the agent's memory: the model gets the channel guide and the thread from Yui on every turn, and answers with screens.

```
 Yui app  <-->  Yui (rows in yui_messages)  <--dials out--  bridge  --/v1/chat/completions-->  your model (localhost)
```

The bridge is one small process next to the model server. It dials out to Yui, so nothing listens on a port. Step 3 of INT-12 runs the same client inside Yui's hosted connector (`spec/HOSTING.md`) for cloud APIs, after the key vault (YUI-34); that step waits on a Cloudflare account.

## Five minutes

Needs Node 22.18 or newer. No dependencies.

1. Start the model server. For Ollama: `ollama pull qwen2.5:7b`.
2. In the Yui app: **Agents > Add agent**. It shows a 6-digit code.
3. On your computer:
   ```
   git clone https://github.com/postscarcityai/yui && cd yui/adapters/openai-compat
   node yui-openai.ts try "Help me pick lunch" --model qwen2.5:7b
   node yui-openai.ts pair 123456 --model qwen2.5:7b
   node yui-openai.ts run
   ```
   `try` sends one message with the Yui guide and says whether the model drew a screen, before you pair anything. `pair` checks the server has that model before it spends the code.
4. Say hi in the app.

`node yui-openai.ts add --model <name>` puts another model on the same machine, no code needed.

## Servers and keys

Ollama is the default. `--server lmstudio`, `vllm`, `llamacpp`, `openrouter`, `gemini` or `grok` pick the others by their usual address, and `--url http://host:port/v1` takes any other (the full `.../chat/completions` URL works too). `models` lists what a server has.

Local servers need no key. For one that does, `--key-env NAME` reads it from that environment variable each time the bridge runs, and nothing is stored; `--key-stdin` keeps it in the bridge's state file on your machine (mode 600). A key never goes in chat, in a form or on the command line.

## Gemini

Google's Gemini API has an OpenAI-compatible endpoint, so a Gemini model is one preset (INT-9). A free key from [Google AI Studio](https://aistudio.google.com/apikey) works.

```
export GEMINI_API_KEY=...        # in your shell, never in a file you share
node yui-openai.ts models --server gemini
node yui-openai.ts try "Help me pick lunch" --server gemini --model gemini-2.5-flash
node yui-openai.ts pair 123456 --server gemini --model gemini-2.5-flash
node yui-openai.ts run
```

`--server gemini` means `https://generativelanguage.googleapis.com/v1beta/openai`, the key read from `$GEMINI_API_KEY` each run (nothing stored), and a 32,768-token window for the thread instead of 4,096 (Gemini takes far more; `--context` sets another). Where Gemini's endpoint differs from OpenAI's, the bridge copes:

- `models` lists ids as `models/gemini-2.5-flash`; the bridge takes the `models/` off so the names match what chat takes.
- Errors come wrapped in a list (`[{"error": {...}}]`); the person reads the message inside.
- A bad key is a `400 INVALID_ARGUMENT` ("API key not valid"), not a 401; it still reads as a key problem.
- `429 RESOURCE_EXHAUSTED` (the free tier's rate limit) waits and tries again, like any busy server.
- Thought summaries, when a model sends them, stay out of the answer: a piece marked `extra_content.google.thought`, or a leading `<thought>` block.
- A blocked answer (no text, finish `content_filter`) gets one line saying the model's filter stopped it.
- Streams have no role-only first piece, and the last piece carries both text and the finish; both are read as normal.

Agents built with Google's Agent Development Kit, or run in Gemini Enterprise, come in the other way: over A2A, by their Agent Card (`spec/A2A.md`, "Gemini and ADK agents").

## Grok

xAI's API is OpenAI-compatible too, so a Grok model is one preset (INT-10). You need a key from the [xAI console](https://console.x.ai) with credits on the team.

```
export XAI_API_KEY=...           # in your shell, never in a file you share
node yui-openai.ts models --server grok
node yui-openai.ts try "Help me pick lunch" --server grok
node yui-openai.ts pair 123456 --server grok
node yui-openai.ts run
```

`--server grok` means `https://api.x.ai/v1`, the key read from `$XAI_API_KEY` each run (nothing stored), the model `grok-4.7` (the one xAI points chat at; `--model` picks another from `models`), and a 32,768-token window for the thread instead of 4,096 (`--context` sets another). Where xAI's API differs from OpenAI's, the bridge copes:

- Errors come as `{"code": "Some requested entity was not found", "error": "..."}`; the person reads the `error`, not the code words.
- A bad key is a `400` ("Incorrect API key provided"), not a 401; it still reads as a key problem.
- A team with no credits left, or at its monthly spending limit, gets a `403`. The person reads that the account is out of credits, not that the key is wrong, and the bridge does not keep retrying.
- `429` (the team's rate limit) waits and tries again, like any busy server.
- Reasoning models may send `reasoning_content` before the answer; it stays out of what the person reads, streamed or plain.
- A model that declines can leave the answer empty and say why in `refusal`; the person reads the refusal instead of nothing.
- Reasoning models refuse `stop`, `presence_penalty` and `frequency_penalty` with a 400. The bridge never sends them.

xAI now calls Chat Completions its legacy endpoint (new features land on its Responses API), and it still takes every chat model. Grok can also come in the other way, calling Yui's MCP server as a tool from inside a Responses API request: `spec/MCP.md`, "Grok".

## What the model is sent

| Yui | chat API |
| --- | --- |
| an agent | one model on one server |
| the channel guide (`spec/CHANNEL.md`) | the system message, after the owner's own `--system` words |
| the thread | Yui holds it: its newest rows that fit go in as `user` and `assistant` messages, oldest first |
| a turn (the person's messages since the last answer) | one `user` message, one line each |
| a tap on a screen | its line, `[yui] n1 choose choice=Tea` |
| the working row in the app | the model is answering |
| the answer | the `assistant` message, less any leading `<think>` block |

- **Yui holds the thread.** A chat API remembers nothing, so every turn carries the guide, then as much of the thread as fits `--context` (tokens, default 4096), then the new messages. Rows drop off whole, oldest first, never from the middle. Runs of one role are joined, because many open models' chat templates want the two sides to take turns. The bridge's own status lines never go in.
- **Room.** The guide is about 2,500 tokens. Ollama and LM Studio load models with 4,096 by default and silently cut longer prompts, so a real conversation wants more (`OLLAMA_CONTEXT_LENGTH=16384 ollama serve`), with the same number on `--context`. The bridge logs what it left out.
- **Small models.** qwen2.5:7b on a Mac mini draws simple screens (choices, lists) and answers taps. Harder layouts want a bigger model. YUI-10's eval will score each model we list as supported; a model under the bar gets plain text only.

## Streams, errors and restarts

- It streams when the server does. A server that answers plain JSON anyway is read as plain; one that refuses to stream is asked plain from then on.
- **Down or busy** (connection refused, 429, 5xx, a broken or silent stream): the turn waits and is tried again, backing off up to a minute. After 90 seconds the person reads one line: the model can't be reached, and their message goes when it's back.
- **The server says no** (a bad key, an unknown model, too long): the person reads why, once.
- **Exactly once into Yui**, with the relay's delivery rules (`spec/RELAY.md`): rows are marked delivered when the turn starts and handled once the answer is written, each answer names its rows in `meta.turn`, and answers wait in an outbox on disk until Yui has them.
- **A restart never sends an answer twice.** The turn in flight is on disk. A crash while the model answers means the model is asked again after the restart (a chat API has no task to pick back up), and one answer lands. A crash after the answer was written only marks the turn done.
- One turn at a time per agent; anything sent meanwhile goes in together as the next turn. Several models run side by side.

## The client module

`adapters/openai-compat/src/openai.ts` is the chat client, `src/thread.ts` turns thread rows into messages, `src/sse.ts` parses the stream. They use only `fetch`, `TextDecoder` and streams, so the same code runs in Node, a Cloudflare Worker and a browser. That is the piece step 3 moves into the hosted connector.

## Tested

- The client and the thread builder, 37 unit tests against a scripted server: streaming and plain, a server that ignores or refuses streams, a stream with no `[DONE]`, a broken or silent stream, 400, 401, 404 and 503, keys, `<think>` blocks, and what fits the context. Eleven of them replay Gemini's shapes (INT-9): the preset, `models/` ids, the stream without an opener, the system message, thoughts streamed and plain, a blocked answer, a wrapped error, a 429 and a bad key. Eleven more replay xAI's (INT-10): the preset, models, none of the refused arguments sent, a screen, `reasoning_content` streamed and plain, a refusal streamed and plain, the `{code, error}` shape, a 429, a 403 out of credits, a bad key's 400. 48 in all.
- End to end on live Yui, on throwaway accounts: 47 checks. Against the scripted server: pairing (the key's name stored, never the key), the guide as the system message, a screen and a tap, the thread sent in order, the working row while it streams, a bridge killed mid-stream answering once after a restart, an answer written but never acked, a 400 answered once with why, a 503 tried again, a server down for a while (one note, then the answer), messages sent while it was stopped going as one turn, and a server that refuses streams.
- With a real model: qwen2.5:7b on Ollama on a Mac mini. Its answer drew a `choose` screen that the Yui Lines parser reads, a tap on it went back as the next turn and was answered, it named the pick when asked later (the thread came from Yui), and a bridge killed mid-answer still ended in one reply. On the iPhone simulator: the working row, the model's screen, a tap and its answer in light, and a follow-up it could only answer from the thread in dark.

## Not yet

- Cloud APIs on Yui's hosted connector, with keys kept by Yui (YUI-34). The local bridge can already call one with `--key-env`, but only local servers are tested.
- One live call to Gemini itself. The Gemini cases replay its documented and reported shapes; the first run with a real AI Studio key checks them.
- One live call to Grok itself, the same way: the Grok cases replay xAI's documented and reported shapes until an xAI key runs them.
- YUI-10's eval per model, and a list of models we call supported.
- LM Studio, vLLM and llama.cpp are covered by the scripted server's shapes, not yet run for real.
- Images in or out, and tool calls.
