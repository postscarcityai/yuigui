# Jev research brief (SITE-91)

Written 2026-09-28. Jev is days old. Most numbers below are TypeSafe's own claims. Where I could only find a third-party blog, I say so. Unknown means unknown.

## The short version

Jev does not write text. You give it a piece of state and a list of typed questions. It answers each one with a choice, a score or a yes/no probability, plus how sure it is. It is hosted, text only, and TypeSafe says it answers in 70 to 500 ms for $0.042 per million input tokens.

That shape fits one job in Yui well: deciding what kind of reply to send back, before the big model writes anything.

## What it is

- Made by TypeSafe AI (San Francisco, founded 2024). Limited early access started 2026-09-15. Announced with a $40M seed. [1][2][3]
- TypeSafe calls it a "System One model": fast, single-pass decisions, not reasoning in prose. [1][4]
- It cannot generate free text. TypeSafe says outputs "are defined in advance" and "the model never makes type errors." [1]
- Current model id in the docs response: `jev-1.13.0`, route `jev-latest`. [5]

## What goes in

- `state`: a string, a JSON object, or an array of text. [4][5]
- `questions`: a named map of typed questions. Each has `type`, `instructions`, and `criteria` (the options or levels) for choice and score. [5]
- Text only. Image input is not supported ("not on images (yet...)"). [1]
- Context size: not stated in TypeSafe docs. One review says 32,000 tokens. Treat as unverified. [8]
- Docs advise many small questions, run in parallel, combined in your own code ("atomic questions, composed in code"). [6]
- Parallel questions per call: one review says up to 13 in the docs. Unverified. [9]
- Choice questions take up to 255 options. Above that, a two-stage scoring step is needed. [1]

## What comes out

Three question types. The output type is set by the question type you declare. [4][5][6]

- Choice: pick one option from a list. Returns the choice, per-option probabilities and a confidence.
- Score: rate the state on ordered levels. Returns the score, per-level probabilities and a confidence.
- Noul: a yes/no question. Returns one probability from 0 to 1. Noul answers carry no confidence field. [7]

Response shape from the quickstart: `answers.<name>.{type, choice|score|noul, confidence, probabilities}`, plus `model` and `usage` (input and output tokens). [5]

## How fast

- 70 to 500 ms end to end, TypeSafe's claim. No separate p50 or p95 is published. [1]
- "40x to 200x faster" than frontier models, TypeSafe's claim. [1]
- A launch demo showed 0.114 s against 8.566 s for a frontier model. [10]
- Community reports say 70 to 300 ms is typical. That comes from a search summary of third-party posts, not a measurement I could verify. [11]
- A Vercel engineer reported 5x to 18x faster than another LLM used as a safety classifier. [3]
- Cost of more questions: the docs push parallel questions in one call. A review quotes TypeSafe saying a 13-question call is 10x faster than 13 separate calls. Unverified. [9]

## What it costs

- Input: $0.042 per million tokens. Output: free. [1]
- No pricing page, no tiers. [8][11]
- TypeSafe says it cannot prove the price is not subsidized. It may change. [8][9]
- One TechCrunch anecdote: for email classification, Jev was 10 to 20 times more expensive than Gemini. So "cheapest" is not guaranteed against small models. [3]
- Yui math: a routing call of about 800 input tokens is about $0.00003. A thousand turns is about three cents.

## Access

- Hosted only. No weights, no on-device option found. [1]
- Signup is at console.typesafe.ai. Keys come from console.typesafe.ai/keys. [5] The waitlist was reported removed 2026-09-27. [9] This is a Chris browser step (account plus key). I did not sign up.
- Other routes reported: Cloudflare Workers AI (`typesafe/jev`), Vercel AI Gateway, Pydantic AI. [9] Unverified by me.
- SDKs: `typesafe-sdk` (Python 3.10+), a JavaScript SDK. Plain HTTP works: `POST https://api.typesafe.ai/v1/systemone` with a Bearer key. [5][9]
- Rate limits: unknown. Not in the docs I could read. [6][8]
- The API went down for a while at launch from demand. [3]

## Privacy and terms

- TypeSafe privacy policy: "We will not train or fine tune any artificial intelligence or machine learning models on your prompts or other Input." [12]
- Retention: "as long as reasonably necessary." No fixed period. [12]
- Zero data retention: not on the privacy page. A third-party summary says it is available to enterprise on request. Unverified. [11]
- Subprocessors: no dedicated list. Contact privacy@typesafe.ai. [12]
- License: proprietary, hosted service. [2]
- Yui note: what we send is the user's message and app state. Send the least we can. That is a real design constraint for the proposal.

## Where it will be wrong or slow

- "Cannot hallucinate" means it cannot pick an option outside your list. It can still pick the wrong option. TypeSafe's own launch coverage and Hacker News both say this. [10][13]
- Calibration is claimed, not independently proven. It is trained with "Reinforcement Learning for Calibrated Decisions" so that 0.9 means right about 90% of the time. No third-party validation is published. [2][8]
- Confidence is a number computed from the probability spread. With three options: (3 x top probability - 1) / 2. Even spread means low confidence. [7]
- What low confidence looks like: no option clearly wins, or the levels are ambiguous. The docs say do not act on it: ask, route to a human, or use another system. [7]
- Docs suggest three tiers: high acts alone, medium confirms with the user, low does not act. Thresholds are yours to tune per domain. [7]
- The vendor's own launch benchmarks were designed by its capabilities team and lean toward OpenAI and Anthropic references. TypeSafe says gains are at "the higher end of real world gains." [9]
- A hands-on review: 93% triage accuracy on 100 support tickets. One small trial, not a benchmark. [8]
- Text only. It cannot see a photo or a map. Anything visual has to be described in text first.
- The docs admit "Jev isn't perfect" and mention "jagged edges" in 1.13. [6]

## What this means for Yui (input to SITE-92)

- Good fit: pick a reply shape from a fixed list (one line, yes/no, card, full screen, map, camera). Ask a few yes/no questions in parallel (needs a map? needs the camera? is this a yes/no?).
- Use confidence as a gate. Low confidence falls back to the current path (the main agent decides), so Jev never blocks a turn.
- Latency is only a win if the call is fast. Budget 100 to 500 ms. Run it in parallel with the main model call where possible.
- Cannot judge image content. Camera decisions must come from the text of the user's ask.
- We need our own eval set. Vendor numbers are not enough. That is a card for SITE-92 or later.

## Open questions (unknown)

- Rate limits and quotas.
- Context window (official).
- p50 and p95 latency from a neutral source.
- Fixed retention period and a zero-retention option.
- Price after early access.
- Any on-device or self-host option.

## Sources

Primary (TypeSafe):
1. TypeSafe launch post: https://typesafe.ai/blog/introducing-system-one-models-and-jev
5. Quickstart (request, response, key): https://docs.typesafe.ai/introduction/quickstart
6. Docs home and index: https://docs.typesafe.ai/ and https://docs.typesafe.ai/llms.txt
7. Confidence page: https://docs.typesafe.ai/confidence
12. Privacy policy: https://typesafe.ai/privacy

Press and reference:
2. Wikipedia: https://en.wikipedia.org/wiki/Jev_(AI_model)
3. TechCrunch, 2026-09-18: https://techcrunch.com/2026/09/18/a-new-kind-of-ai-model-from-a-chatgpt-inventor-is-thrilling-developers/
10. The Register, 2026-09-16: https://www.theregister.com/ai-and-ml/2026/09/16/typesafe-ai-debuts-model-for-machines-that-plays-doom/5296711
13. Hacker News thread: https://news.ycombinator.com/item?id=49767192

Third-party (weaker, several look like SEO blogs; claims marked unverified above):
4. Wikipedia input description, same as [2].
8. eesel review: https://www.eesel.ai/blog/typesafe-jev-review
9. Developers Digest: https://www.developersdigest.tech/blog/typesafe-jev-system-one-models-release-guide-2026
11. Web search summary (jevapi.org, layer3labs.io, jevaiguide.com and similar): https://www.layer3labs.io/guides/jev-pricing
