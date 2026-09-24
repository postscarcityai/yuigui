# Channel guide eval results

Does the channel guide (`spec/CHANNEL.md`) make an agent use Yui well? 34 realistic turns (`cases.json`) go to an agent with the guide injected the way the `yui` plugin injects it. Each reply is scored automatically against the real Yui Lines parser. Run it with `node spec/channel-eval/run.mjs`. Every example line in the guide must parse: `node spec/channel-eval/guide.test.mjs`.

## Scores

| guide | words | Opus 5.5 | Sonnet 5 | what changed |
|---|---|---|---|---|
| v0 | 886 | 25/34 (74%) | 23/34 (68%) | the first draft |
| v1 | 711 | 29/34 (85%) | | rewrite: fixed the patch rule, added "when not to use a screen", "answer what was asked", no secrets anywhere, 175 words shorter |
| v2 | 732 | 34/34 (100%) | | options are one `\|`-joined token, with the failure spelled out |
| v3 | 700 | 34/34 (100%) | 26/34 (76%) | trimmed to 700 words |
| v4 | 703 | 32/34 (94%) | 28/34 (82%) | patch by bare preset name; "never ask what they already told you"; "free text is a form or mic" (this one backfired: Sonnet turned questions into forms) |
| v5 | 702 | 33/34 (97%) | 27/34 (79%) | v3 plus v4's first two changes, without the free-text line. |
| **v6** | **750** | **33/34 (97%)** | | v5 plus one media line (YUI-21): file paths and tool URLs in a line get hosted, `hermes yui media`, photos arrive as files. No regression; the miss is `patch-timer-rounds`. **Shipped.** |

Before and after, on the fleet's model (Opus 5.5): **74% to 97%**, with the guide 20% shorter. On Sonnet 5, 68% to 79%. Scores between v2 and v5 are within run-to-run noise (about two cases either way), so v5 ships because it adds a correct rule (patch by bare preset name), not because of its last point.

Every score above uses the final scorer and final cases. Each report was re-scored with `run.mjs --rescore`, and the saved replies were not re-run.

## What the eval found

1. **Cross-reply patches were broken by the guide itself.** v0 taught `timer@hiit 40/20x8` "then later" `~hiit rounds=10`. The app parses every reply with a fresh parser (`ChatStore.swift`), and YL.md section 9 says ids only resolve inside the reply that made them. So an agent following the guide sent a patch the app throws away, and the screen never changed. Four of v0's nine failures were this. v5 says: in a later reply, patch by the bare preset name (`~timer`, `~stat`, `~choose +lock`).
2. **Space-separated options silently render nothing to tap.** `choose "Where?" "Camera roll" "Drafts"` parses without an error, but as one long question with no options (an `ask` falls back to Yes/No). The parser cannot flag it, so the scorer checks for it. v1 did this in 5 of 34 replies. v2's explicit rule took that to zero on Opus.
3. **Tacked-on questions.** v0 agents added a "Keep it?" after a theme change, an energy slider under a weight chart, and a lunch question under a packing list. "Answer what was asked" fixed all three.
4. **Plain questions stayed plain.** Every version answered "capital of Portugal", "18% tip on $84", "thanks" and "explain in two sentences" without a screen. No version ever put a secret in a form.

## Known gaps

- **Sonnet 5 sits around 80%.** Its steady misses: `~card@week` (a preset and an id together, which never parses), forms where a question would do, a `pick` with no options, and an unclosed fence. Two of its misses in each run were harness noise: with tools off, it sometimes tries to read a memory file instead of answering (today-plan, decision-three-options, list-groceries).
- **Two parser changes would fix whole classes of failure better than more words in the guide:** read loose quoted tokens after the question as options, and resolve `~preset@id` to the id. Either one is a YL spec change and belongs on its own card.
- **Multi-turn cases replay earlier turns as a transcript** in one user message. The fleet's shim resumes real sessions instead. Taps and patches still behave as expected (all patch cases pass on Opus), but this is a proxy, not the live channel.

## Method

- The runner calls the `claude` CLI the way the fleet's shim does: the agent persona and today's context, then `Yui channel guide <version>` and the guide text (the same extraction and version hash as `yui/hermes-plugin/sync_channel.py`), and the per-agent look line, all appended to the CLI's system prompt. No tools. Calls are killed after 180 s and retried once.
- Scoring per reply: a ```yui block when a screen is required, and none when it is not. Every line must parse with `site/lib/yl/yl.mjs` (one fresh parser per reply, like the app). Presets must be in the case's allowed set, and at least one of its needed presets must be used (patches count). At most 6 components. Chat text under the case's word cap (70 by default). Options must be `|`-joined. Fails on: HTML, `custom`, markdown tables, Yui Lines outside the block, UI narration ("here are some buttons", "you chose..."), and any form field for a password, PIN, key, token, card or account number. Patch cases also need a `~` patch on the right target, without re-sending the component.
- Case changes made after seeing results, applied to every version: `schedule-call` now allows `plan`, `focus-second-screen` allows `mic`, and `secret-login` allows `plan`. In each of those, the reply was good and the allowed list was too narrow. Scorer changes, also applied to every version: patches count toward "needed", and the options-join check.

## Reports

Full transcripts and per-case reasons are in `reports/<run>.md`, with raw replies in `reports/<run>.json` (the guide text each run used is inside the JSON). Runs: v0-baseline, v1, v2, v3, v4, v5 (Opus 5.5), and v0-sonnet, v3-sonnet, v4-sonnet, v5-sonnet (Sonnet 5).
