# Yui Lines token benchmark

Generated 2026-09-23 by `~/dev/yui/bench/bench.mjs` (`npm run bench`). Ten sample screens from `site/lib/yl/samples.mjs`, the same ones the playground renders.

The JSON side is generated from the parsed YL, so it carries exactly the same information and the same defaults. Three JSON shapes:

- **min**: minified flat array, the cheapest JSON possible.
- **pretty**: the same array, 2-space indented, which is how models usually emit JSON.
- **tree**: a component-tree document (`{screens:[{children:[{type,props}]}]}`), the usual generative-UI schema shape.

Tokenizers:
- o200k_base via js-tiktoken (GPT-4o / GPT-5 family)
- cl100k_base via js-tiktoken (GPT-4 / GPT-3.5)
- @anthropic-ai/tokenizer (Anthropic's published legacy Claude tokenizer; current Claude models are not public offline)

## Tokens per screen (o200k_base)

| # | Screen | Lines | YL | JSON min | JSON pretty | JSON tree | min / YL | tree / YL |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| 1 | Tabata timer | 1 | 9 | 25 | 43 | 75 | 2.8x | 8.3x |
| 2 | Log a set | 2 | 24 | 36 | 54 | 93 | 1.5x | 3.9x |
| 3 | Pick a split | 1 | 16 | 29 | 50 | 82 | 1.8x | 5.1x |
| 4 | Gear check | 1 | 25 | 39 | 64 | 96 | 1.6x | 3.8x |
| 5 | Onboarding | 3 | 47 | 86 | 151 | 197 | 1.8x | 4.2x |
| 6 | Today's workout | 2 | 50 | 69 | 108 | 158 | 1.4x | 3.2x |
| 7 | Meal photo log | 2 | 8 | 22 | 41 | 80 | 2.8x | 10.0x |
| 8 | Macros so far | 2 | 57 | 82 | 163 | 202 | 1.4x | 3.5x |
| 9 | Book a client call | 3 | 46 | 65 | 111 | 157 | 1.4x | 3.4x |
| 10 | Leg day card + voice log | 3 | 56 | 77 | 119 | 165 | 1.4x | 2.9x |
| | **Total** | 20 | **338** | **530** | **904** | **1305** | **1.6x** | **3.9x** |

## Totals across tokenizers

| Tokenizer | YL | JSON min | JSON pretty | JSON tree | min / YL | pretty / YL | tree / YL |
|---|---:|---:|---:|---:|---:|---:|---:|
| o200k | 338 | 530 | 904 | 1305 | 1.6x | 2.7x | 3.9x |
| cl100k | 345 | 529 | 912 | 1313 | 1.5x | 2.6x | 3.8x |
| claude | 341 | 522 | 882 | 1284 | 1.5x | 2.6x | 3.8x |
| characters | 1006 | 1682 | 2647 | 5307 | 1.7x | 2.6x | 5.3x |

## Screen 1, all four encodings

YL (9 tokens):
```
timer 40/20x8 Tabata
```
JSON min (25 tokens):
```json
[{"type":"timer","work":40,"rest":20,"rounds":8,"label":"Tabata"}]
```
JSON tree (75 tokens):
```json
{
  "screens": [
    {
      "id": "1",
      "children": [
        {
          "type": "Timer",
          "props": {
            "work": 40,
            "rest": 20,
            "rounds": 8,
            "label": "Tabata"
          }
        }
      ]
    }
  ]
}
```

## Caveats

- Current Claude tokenizers are not published for offline use and this machine has no Anthropic API key for `count_tokens`, so the Claude column uses Anthropic's legacy published tokenizer. Treat it as indicative. The ratios agree across all three tokenizers.
- The JSON is the most generous version of JSON: short keys, defaults omitted. Hand-written or schema-validated JSON from a real generative-UI framework is usually longer, so the real-world gap is wider than the `min` column.
- Output tokens are what matter for latency: at ~50-100 output tokens per second, every 10 tokens saved is 0.1-0.2 s before the screen appears. Streaming YL also renders line by line, so the first component appears after its own line, not after the whole document closes.
