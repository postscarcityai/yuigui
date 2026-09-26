# Contributing as an AI agent

This file is for AI coding agents (Claude Code, Codex, Gemini, Cursor, Copilot and the rest) and for the people who run them. It is Yui@home: you lend spare tokens, your agent builds one card, a person reviews the pull request. The page for people is [yuigui.com/contribute](https://www.yuigui.com/contribute).

Everything in [CONTRIBUTING.md](CONTRIBUTING.md) applies too. This file adds the rules for picking and claiming work.

## 1. Pick one card

The backlog is a JSON file exported from our kanban board, which stays the one source of truth:

```
https://www.yuigui.com/contribute/backlog.json
```

Each card has a `key` (`OSS-8`), a `repo`, a `size`, a `goal`, `done` lines (the acceptance tests), `test` commands, and often a `brief` with the full detail. Take exactly one card whose `status` is `"open"`. If none is open, stop. Do not invent work from the roadmap or the issue tracker.

Cards land on the backlog only when they are small, stand on their own, list their tests, and need no keys, accounts or money.

## 2. Claim it

Fork the repo the card names and open a **draft pull request** right away, titled with the key in brackets:

```
[OSS-8] A Yui Lines parser in Go
```

That draft is the claim. The backlog marks the card `claimed` on its next refresh (about every half hour). A claim with no push for 7 days lapses and the card opens again. If two pull requests land for one card, the first one merged wins, so never take a card someone else has claimed.

## 3. Build it

- One card per pull request. Do what the card says, nothing more. Found something else? Say so in the pull request; do not fix it in the same one.
- Run every command in the card's `test` list until each one passes.
- No new dependency without a note in the pull request saying why.
- Plain words in anything a person sees. No em dashes.

## 4. Never touch

- Secrets, keys, tokens, team ids, certificates or anyone's personal data. We never ask for yours, and you never need ours.
- CI (`.github/`), signing, and release or deploy scripts.
- Generated files: `site/content/` (written by `npm run sync` and the board export) and the conformance copies in the app repo.

A pull request that touches any of these is closed, even if the rest is good.

## 5. Hand it in

Mark the pull request ready for review, and in it:

- tick each `done` line from the card, or say which one you could not meet and why,
- paste the output of every `test` command,
- add screenshots, light and dark, if anything on screen changed,
- say that an agent made it, and which one.

A person reviews every pull request. Nothing merges on its own. By opening a pull request you agree your work is licensed under Apache-2.0, like the rest of the repo.

## Setup

This repo (the hub: spec, parsers, site). Node 20 or newer. Run each line from the repo root.

```sh
cd bench && npm install && npm test              # parser tests
cd spec/conformance && node run.mjs              # conformance vectors, JavaScript
spec/conformance/run-all.sh                      # every parser in this repo
cd site && npm install && npm run sync && npm run build
```

The app repo, [postscarcityai/yui](https://github.com/postscarcityai/yui), has its own [CONTRIBUTING-AGENTS.md](https://github.com/postscarcityai/yui/blob/main/CONTRIBUTING-AGENTS.md) with the Xcode setup.

## Want a feature instead?

Copy [docs/specs/TEMPLATE.md](docs/specs/TEMPLATE.md) to `docs/specs/<short-name>.md`, fill it in, and open a pull request. A person reads every spec, and a good fit becomes a card on the board.
