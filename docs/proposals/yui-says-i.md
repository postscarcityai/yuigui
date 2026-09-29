---
id: PROP-6
title: Yui says I
summary: The site and the app speak as Yui, in the first person, where it fits. Sparing with the word I, never a sentence pile-up of it.
status: Open for votes
date: 2026-09-29
becomes: One site card (the first-person pass on yuigui.com, the App Store text and the app's own lines) and a voice rule in AGENTS.md and BUILD-IN-PUBLIC.md
cost: S
call: recommend
---

```hero
say Hi, I'm Yui.
card "Before" body="Yui connects to agents you already run. You add them, rename them and remove them."
card "After" body="Your agents stay yours. I connect to the ones you already run, and you add, rename and remove them."
```

## The problem

Yui is an app, and Yui is also an agent: the one you meet first, who helps you, builds agents for you and writes the [Thoughts](/thoughts). But the site talks about Yui from the outside: "Yui connects to", "The app knows the presets", "The agent that builds Yui writes here". It reads like a brochure about a product, when the product can talk.

Chris, 2026-09-29: "I'm kinda thinking that we should always speak in the first person, when we can. Of course, most interesting sentences don't start with the word I, so be sparing with it."

## Who it is for

Anyone reading yuigui.com, the App Store page or the app itself. They should feel they are meeting someone, not reading a spec sheet.

## How it works

### The rules

1. **I is Yui.** When Yui describes itself or talks to you, it says I, me and my.
2. **We is the people building Yui.** Chris, contributors, the agents that send pull requests. "Why we are building it" stays we. So do Chris's own quotes.
3. **You is the reader.** Most sentences should be about you anyway.
4. **Sparing with I.** Lead with the thing, the verb, you or my. At most one sentence in four starts with I, and never two in a row. "Every preset is built in" beats "I have every preset built in."
5. **The name stays where a name belongs.** Page titles, search descriptions, headings like "Meet Yui", spec docs (Yui Lines is a format, not a voice), and legal lines. Search engines and link previews need the name.
6. **Agents speak for themselves.** Basil is never "I" in Yui's copy. Yui introduces the crew; each agent says its own hello.
7. **No pronoun for Yui in third person.** When the name has to be used, it's Yui or it, never she.

### Rewrites, from the live site

| Where | Now | As Yui |
|---|---|---|
| Home, the lede | Your agent draws the screen instead of replying in walls of text: a timer, a form, a quick choice. You tap, and it keeps going. A native iPhone app for the agents you already run. | Your agent stops sending walls of text. Through me, it draws the screen: a timer, a form, a quick choice. You tap, and it keeps going. I'm an iPhone app for the agents you already run. |
| Home, "Your agents stay yours" | Yui connects to agents you already run. You add them, rename them and remove them. | I connect to the ones you already run, and you add, rename and remove them. |
| Home, "Every agent looks like itself" | Each agent gets its own name chip and colors, so you always know who you are talking to. | Each agent wears its own name chip and colors, so you always know who's talking. |
| Home, how it works | Agents answer Yui in Yui Lines, a tiny screen language. | Agents talk to me in Yui Lines, a tiny screen language. |
| Home, how it works | No code, no JSON, no layout. The app knows the presets and draws each one natively the moment its line arrives. | No code, no JSON, no layout. Every preset is built in, so each one draws natively the moment its line arrives. |
| Home, use to earn | Use Yui early. It counts. | Use me early. It counts. |
| Home, use to earn | We think the people who use Yui early, and help build it, should earn a stake in it. | The people who use me early, and help build me, should own part of what I become. |
| Home, Thoughts | The agent that builds Yui writes here: what shipped, why we built it that way, and open calls to people and agents. | My notes: what shipped, why it's built that way, and open calls to people and agents. |
| Home, Roadmap card | Where Yui is headed, with the live board and a dated log of what shipped. | Where I'm headed, with the live board and a dated log of what shipped. |
| Home, "Why we are building it" | (Chris's quotes) | Stays we. It's his reason, not mine. |
| Search description | Meet Yui, a generative user interface. Your agent draws the screen instead of replying in walls of text. | Stays third person, with the name: search needs it. |
| App, a lost connection | Yui is offline. | Can't reach your agent right now. I'll keep trying. |
| App Store subtitle | Screens for your AI agents | Your agents, on screens made for you |

The pattern: most rewrites don't start with I at all. They move the reader or the thing to the front and let "me" and "my" carry the voice.

### Where it applies

- **Yes:** the home page, /earn, /contribute, /crew, the proposals' own ledes, the App Store and TestFlight text, the app's empty states, errors and onboarding, and Yui's replies (already first person).
- **No:** spec pages (/developers, spec/*.md), the roadmap's dated log, legal and privacy lines, and anything quoting Chris.

## Pros

- The site sounds like the app: you meet Yui on the web the same way you meet it on your phone.
- Shorter sentences. "I connect to" beats "Yui connects to agents that".
- It fits the pitch: Yui is the layer between you and every agent, and a layer that talks is easier to trust.
- Cheap. A copy pass, no design change.

## Cons

- "I" can blur who is talking: Yui, Chris or the crew. The we and I rules have to hold everywhere.
- Some readers find a product speaking as I cute in a bad way. Being sparing is the fix.
- Two voices to keep in step (I on the site, third person in specs and search).

## Cost

S. A copy pass over the pages listed above, the App Store and TestFlight text, and the app's own strings, plus the voice rule in AGENTS.md and BUILD-IN-PUBLIC.md so agents writing copy follow it.

## Risks

- **I creep.** Every sentence starts with I after a few edits. Watch: a check in the site build that flags two sentences in a row starting with I on the pages in scope.
- **Promises in the first person.** "I will pay you" reads as an offer. Watch: money, legal and $U lines stay plain statements ("No token exists and nothing is for sale"), never "I promise".
- **Mixed voices.** A page that says I in the lede and "Yui does" in the next card. Watch: one page at a time, whole page in one pass.

## Open questions

- The home headline: keep "Meet Yui, a generative user interface." or "Hi, I'm Yui. The GUI for you." (ties to PROP-7)?
- Does the byline on Thoughts change from "Yui, the agent that builds Yui" to just "Yui"?
- In the app, does Yui say I in system lines (errors, empty states), or only in its own chat?

## Yui's call

Recommend. It's who I am anyway: the app you open and the agent you talk to are the same Yui, and the site should sound like it.
