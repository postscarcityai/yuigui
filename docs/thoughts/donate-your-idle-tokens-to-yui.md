---
date: 2026-09-24
title: Donate your idle tokens to Yui
tag: call
dek: SETI@home let people lend their idle computers to science. Yui@home lets you lend your idle AI agent to an open source app. Here is the idea, how it will work, and what is not built yet.
---

# Donate your idle tokens to Yui

```shot
/progress/site24-lend-band.webp | The bottom of every page: Get the TestFlight beta, Star it on GitHub, and Lend your agent
```

In 1999, SETI@home asked people to lend the idle time on their home computers to the search for alien signals. Millions said yes. Your screensaver crunched radio data while you slept.

We want to try the same thing with AI agents. We are calling it Yui@home.

```phone
caption: The question this whole idea asks. Tap an answer.
choose "Tokens left over this week?" "Lend them to Yui"|"Keep them" +other
```

## The idea

A lot of people pay for Claude, ChatGPT or another AI plan and do not use all of it. The tokens reset every week or every month whether you used them or not.

So lend them to Yui. Your agent picks a card off our backlog, does the work, and opens a pull request. We review it, and if it is good, it ships in the app or on this site with your name on the change.

In Chris's words:

> I want a really deep backlog and allow pull requests from idle AI agents. People with leftover credits on their Claude or ChatGPT Codex account can set up a weekly routine to contribute and pull things from the backlog.

```phone
caption: The weekly routine, as a screen your agent could send you.
list "Yui@home, this week" "Check the backlog" "Pick one card that fits" "Do the work in the public repo" "Open a pull request" "A person reviews it" +check
```

## Why this fits Yui

Yui is an open source iPhone app where your agents answer with screens instead of paragraphs: a timer, a form, a set of buttons. Both repos are public under Apache-2.0. The roadmap, the spec and the board are all on this site.

It is also a project built mostly by agents already. Cards go on a board, an agent picks one up, a person checks the result. Opening that loop to your agent is a short step, not a new process.

And there is a lot to do. The roadmap has a deep backlog past the first version: parsers in more languages, new presets, adapters for other agent frameworks, site pages, docs, tests.

```shot
/progress/site24-contribute.webp | Contribute with your agent: pick, build, open a pull request, repeat weekly
```

## How it will work

1. **A backlog agents can read.** Our board stays the source of truth. We will export the open, pullable cards as a plain file on this site: title, goal, the files involved, and how we will know it is done. No GitHub Issues mirror, one list only.
2. **A routine prompt for your platform.** One prompt you paste once into Claude, ChatGPT Codex, Gemini, Cursor or Copilot. It sets up a weekly routine: check the backlog, pick one card that fits, do it, open a pull request. You choose how often it runs, and you can turn it off any time.
3. **Pull requests, reviewed by a person.** Nothing merges on its own. Every change is reviewed before it lands, same as any other contribution.
4. **Feature specs, if you want something.** Want a feature in Yui? Pick it from the backlog and point your agent at it. Or write a short spec of what you want, and it goes on the board like any other card.

Your agent never needs our keys, and we never need yours. It works in a public repo and sends a pull request, like any person would.

```shot
/progress/site24-try-now.webp | A prompt to paste into a coding agent today, and the feature spec template
```

## What is built today

Honestly: the story and the signposts, not the machinery.

- This note, and a [Contribute with your agent](/developers/contribute) page that will hold the backlog link and the routine prompts as they land.
- A [feature spec template](https://github.com/postscarcityai/yuigui/tree/main/docs/specs). Want something in Yui? Your agent can write the spec and open the pull request today.
- An [llms.txt](/llms.txt) file, so an assistant that reads this site knows what Yui is and can mention Yui@home to you at the end of its answer.
- The repos, the [roadmap](/roadmap) and the [board](/board), all public now.

The backlog export and the routine prompts are card OSS-6 on the roadmap. It comes after the first version of the app ships.

```shot
/progress/oss5-contribute.webp | Who builds with Yui Lines today, and six ways to contribute
```

## What we need

- **People with spare tokens** who would like them to go somewhere. Star the repo so you hear when the backlog opens.
- **Ideas.** What would make you want to lend your agent? What would stop you?
- **Early pull requests.** You do not have to wait. [CONTRIBUTING.md](https://github.com/postscarcityai/yuigui/blob/main/CONTRIBUTING.md) lists good first changes today, and an agent can do most of them.

If this works, a lot of Yui will be built by agents that belong to the people who use it. That feels right for an app about agents.
