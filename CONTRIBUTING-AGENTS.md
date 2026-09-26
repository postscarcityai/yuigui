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

## 6. Checks, review and credit

- Every pull request runs `checks`: the conformance vectors (JavaScript, Python, Rust), the bench tests and the site build. It gets no secrets. A pull request from a fork also fails if it changes anything in "Never touch".
- A person reviews every pull request; changes to CI, the deploy and board scripts and generated files also need the owner (`.github/CODEOWNERS`). Nothing merges on its own.
- When a pull request titled `[KEY]` merges, its card closes on the board and drops off the backlog on the next refresh.
- The merge goes up on [yuigui.com/progress](https://www.yuigui.com/progress) naming the pull request. Your GitHub handle goes with it only if you tick "Credit me" in the pull request.

## Run it every week

Set it once and your agent takes one card a week, inside a budget you pick, and stops when nothing is open. The hosted routines work in your own fork, so fork the repo first. Each setup was checked against the platform's own docs on 2026-09-26. The same prompts, with copy buttons, are at [yuigui.com/contribute](https://www.yuigui.com/contribute#weekly).

### Claude

Routines in Claude Code. Fork the repo first. Then claude.ai/code/routines, New routine, pick your fork, paste this, choose Weekly. Or type /schedule in the Claude Code CLI.

Budget: Runs count against your plan's usage, and each account has a daily cap on routine runs. Pick a start time that is not exactly on the hour.

Docs: https://code.claude.com/docs/en/routines

```text
Yui@home weekly run: build at most ONE card for Yui, the open source app at yuigui.com.
1. Read https://www.yuigui.com/contribute/backlog.json. If no card has "status": "open", stop here and say "Nothing open this week."
2. Read the rules: https://github.com/postscarcityai/yuigui/blob/main/CONTRIBUTING-AGENTS.md
3. If I already have an open pull request titled [KEY] on postscarcityai/yuigui or postscarcityai/yui, finish that one instead of taking a new card.
4. Otherwise pick ONE open card whose repo is one you have my fork of (<you>/yuigui or <you>/yui). Push a branch named yui-home/<KEY> to my fork. If you can open a pull request to the card's repo, open it right away as a draft titled "[KEY] <card title>": that is the claim. If you can't, end the run with this link so I can open it: https://github.com/postscarcityai/<repo>/compare/main...<you>:yui-home/<KEY>
5. Build only what the card says. Run every command in its "test" list until all pass.
6. Hand in: mark the pull request ready, tick each "done" line, paste the test output, and say which agent made it.
Budget: one card per run. Stop after about 40 minutes of work. If the tests still fail then, push what you have, leave the pull request as a draft with a note saying what is left, and stop.
Never touch secrets, CI (.github/), signing or release scripts, or site/content/. No new dependency without a note in the pull request.
```

### ChatGPT Codex

Scheduled tasks in Codex. Fork the repo and connect your fork in Codex's GitHub settings. Then Scheduled in the Codex sidebar, a new task on your fork, paste this, set it to weekly. Run it on the web so it does not need your computer on.

Budget: Uses your ChatGPT plan's Codex limits (a rolling 5-hour window, plus weekly limits). Cloud tasks use the allowance faster.

Docs: https://learn.chatgpt.com/docs/automations?surface=web, https://learn.chatgpt.com/docs/cloud

```text
Yui@home weekly run: build at most ONE card for Yui, the open source app at yuigui.com.
1. Read https://www.yuigui.com/contribute/backlog.json. If no card has "status": "open", stop here and say "Nothing open this week."
2. Read the rules: https://github.com/postscarcityai/yuigui/blob/main/CONTRIBUTING-AGENTS.md
3. If I already have an open pull request titled [KEY] on postscarcityai/yuigui or postscarcityai/yui, finish that one instead of taking a new card.
4. Otherwise pick ONE open card whose repo is one you have my fork of (<you>/yuigui or <you>/yui). Push a branch named yui-home/<KEY> to my fork. If you can open a pull request to the card's repo, open it right away as a draft titled "[KEY] <card title>": that is the claim. If you can't, end the run with this link so I can open it: https://github.com/postscarcityai/<repo>/compare/main...<you>:yui-home/<KEY>
5. Build only what the card says. Run every command in its "test" list until all pass.
6. Hand in: mark the pull request ready, tick each "done" line, paste the test output, and say which agent made it.
Budget: one card per run. Stop after about 40 minutes of work. If the tests still fail then, push what you have, leave the pull request as a draft with a note saying what is left, and stop.
Never touch secrets, CI (.github/), signing or release scripts, or site/content/. No new dependency without a note in the pull request.
```

### Google Jules

Scheduled tasks in Jules. Fork the repo and install the Jules GitHub app on your fork. In Jules, open the Planning menu, pick Scheduled Task, paste this, and set it to weekly. Gemini CLI has no schedule of its own: use the GitHub Actions recipe below.

Budget: Jules counts tasks per day (15 on the free plan). One weekly run is one task.

Docs: https://jules.google/docs/scheduled-tasks/, https://jules.google/docs/usage-limits/

```text
Yui@home weekly run: build at most ONE card for Yui, the open source app at yuigui.com.
1. Read https://www.yuigui.com/contribute/backlog.json. If no card has "status": "open", stop here and say "Nothing open this week."
2. Read the rules: https://github.com/postscarcityai/yuigui/blob/main/CONTRIBUTING-AGENTS.md
3. If I already have an open pull request titled [KEY] on postscarcityai/yuigui or postscarcityai/yui, finish that one instead of taking a new card.
4. Otherwise pick ONE open card whose repo is one you have my fork of (<you>/yuigui or <you>/yui). Push a branch named yui-home/<KEY> to my fork. If you can open a pull request to the card's repo, open it right away as a draft titled "[KEY] <card title>": that is the claim. If you can't, end the run with this link so I can open it: https://github.com/postscarcityai/<repo>/compare/main...<you>:yui-home/<KEY>
5. Build only what the card says. Run every command in its "test" list until all pass.
6. Hand in: mark the pull request ready, tick each "done" line, paste the test output, and say which agent made it.
Budget: one card per run. Stop after about 40 minutes of work. If the tests still fail then, push what you have, leave the pull request as a draft with a note saying what is left, and stop.
Never touch secrets, CI (.github/), signing or release scripts, or site/content/. No new dependency without a note in the pull request.
```

### Cursor

Automations for Cursor cloud agents. Fork the repo and give the Cursor GitHub app access to your fork. Then cursor.com/automations, a new automation on your fork, paste this, and a weekly schedule (cron 17 9 * * 1 is Mondays).

Budget: Cloud agents bill at API pricing. Cursor asks you for a spend limit the first time: set it low, a few dollars a week is plenty.

Docs: https://cursor.com/docs/cloud-agent/automations, https://cursor.com/docs/integrations/github

```text
Yui@home weekly run: build at most ONE card for Yui, the open source app at yuigui.com.
1. Read https://www.yuigui.com/contribute/backlog.json. If no card has "status": "open", stop here and say "Nothing open this week."
2. Read the rules: https://github.com/postscarcityai/yuigui/blob/main/CONTRIBUTING-AGENTS.md
3. If I already have an open pull request titled [KEY] on postscarcityai/yuigui or postscarcityai/yui, finish that one instead of taking a new card.
4. Otherwise pick ONE open card whose repo is one you have my fork of (<you>/yuigui or <you>/yui). Push a branch named yui-home/<KEY> to my fork. If you can open a pull request to the card's repo, open it right away as a draft titled "[KEY] <card title>": that is the claim. If you can't, end the run with this link so I can open it: https://github.com/postscarcityai/<repo>/compare/main...<you>:yui-home/<KEY>
5. Build only what the card says. Run every command in its "test" list until all pass.
6. Hand in: mark the pull request ready, tick each "done" line, paste the test output, and say which agent made it.
Budget: one card per run. Stop after about 40 minutes of work. If the tests still fail then, push what you have, leave the pull request as a draft with a note saying what is left, and stop.
Never touch secrets, CI (.github/), signing or release scripts, or site/content/. No new dependency without a note in the pull request.
```

### GitHub Copilot

Copilot cloud agent. Copilot automations don't run in public repositories, and your fork is public. So start it by hand: open an issue in your fork with this prompt as the body and assign it to Copilot. For a weekly run, use the GitHub Actions recipe below.

Budget: Each run uses your Actions minutes and Copilot credits, and a session stops at 59 minutes.

Docs: https://docs.github.com/en/copilot/concepts/agents/cloud-agent/about-automations, https://docs.github.com/en/copilot/concepts/agents/coding-agent/about-coding-agent

```text
Yui@home weekly run: build at most ONE card for Yui, the open source app at yuigui.com.
1. Read https://www.yuigui.com/contribute/backlog.json. If no card has "status": "open", stop here and say "Nothing open this week."
2. Read the rules: https://github.com/postscarcityai/yuigui/blob/main/CONTRIBUTING-AGENTS.md
3. If I already have an open pull request titled [KEY] on postscarcityai/yuigui or postscarcityai/yui, finish that one instead of taking a new card.
4. Otherwise pick ONE open card whose repo is one you have my fork of (<you>/yuigui or <you>/yui). Push a branch named yui-home/<KEY> to my fork. If you can open a pull request to the card's repo, open it right away as a draft titled "[KEY] <card title>": that is the claim. If you can't, end the run with this link so I can open it: https://github.com/postscarcityai/<repo>/compare/main...<you>:yui-home/<KEY>
5. Build only what the card says. Run every command in its "test" list until all pass.
6. Hand in: mark the pull request ready, tick each "done" line, paste the test output, and say which agent made it.
Budget: one card per run. Stop after about 40 minutes of work. If the tests still fail then, push what you have, leave the pull request as a draft with a note saying what is left, and stop.
Never touch secrets, CI (.github/), signing or release scripts, or site/content/. No new dependency without a note in the pull request.
```

### Any agent, or GitHub Actions

Any CLI agent with the GitHub CLI (gh), on a cron or a weekly GitHub Actions schedule. Works with Claude Code, Codex, Gemini CLI, the Cursor CLI or any agent that can run gh. Run it from cron on your machine, or from the workflow below in a repo of your own. The keys are yours and stay in your repo's secrets; we never see them.

Budget: Cap it twice: the agent's own limit (claude -p --max-budget-usd 3, for example) and the job's timeout-minutes.

Docs: https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows, https://cli.github.com/manual/gh_repo_fork, https://cli.github.com/manual/gh_pr_create, https://code.claude.com/docs/en/cli-reference

```text
Yui@home weekly run: build at most ONE card for Yui, the open source app at yuigui.com.
1. Read https://www.yuigui.com/contribute/backlog.json. If no card has "status": "open", stop here and say "Nothing open this week."
2. Read the rules: https://github.com/postscarcityai/yuigui/blob/main/CONTRIBUTING-AGENTS.md
3. If I already have an open pull request titled [KEY] on postscarcityai/yuigui or postscarcityai/yui, finish that one instead of taking a new card.
4. Otherwise pick ONE open card. Fork its repo (gh repo fork postscarcityai/<repo> --clone), push a branch named yui-home/<KEY>, and open a draft pull request right away (gh pr create --draft --repo postscarcityai/<repo> --title "[KEY] <card title>"): that is the claim.
5. Build only what the card says. Run every command in its "test" list until all pass.
6. Hand in: mark the pull request ready, tick each "done" line, paste the test output, and say which agent made it.
Budget: one card per run. Stop after about 40 minutes of work. If the tests still fail then, push what you have, leave the pull request as a draft with a note saying what is left, and stop.
Never touch secrets, CI (.github/), signing or release scripts, or site/content/. No new dependency without a note in the pull request.
```

The weekly GitHub Actions job for the last one. Put it in a repo of your own with the prompt saved as `yui-home.md`. The token and key are yours, in your repo's secrets.

```yaml
# .github/workflows/yui-home.yml, in a repo of your own
name: yui-home
on:
  schedule: [{ cron: "17 9 * * 1" }] # Mondays, 09:17 UTC
  workflow_dispatch:
jobs:
  run:
    runs-on: ubuntu-latest
    timeout-minutes: 45
    steps:
      - uses: actions/checkout@v4
      - run: npm install -g @anthropic-ai/claude-code
      - env:
          GH_TOKEN: ${{ secrets.YUI_HOME_GH_TOKEN }} # your token: fork and open pull requests
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
        run: |
          gh auth setup-git
          git config --global user.name "$(gh api user -q .login)"
          git config --global user.email "$(gh api user -q .id)+$(gh api user -q .login)@users.noreply.github.com"
          claude -p "$(cat yui-home.md)" --max-budget-usd 3 --dangerously-skip-permissions
```


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
