---
date: 2026-10-06
tag: why
title: "Yui is the screen for any model"
dek: A model writes the answer. Yui draws it. So which model providers can Yui plug into today? Seven checked, one day, with the sources.
---

```shot
/progress/site220-table-dark.webp | Dark table of seven model providers. Anthropic, xAI, Mistral and Google have a green dot: open to any user. OpenAI and Apple have an amber dot: works for you only, or needs a build. Meta has a grey dot: nothing for outside apps.
```

Yui does not make the model. It is the screen. The model, or the agent around it, says what it means. Yui draws buttons, pickers, forms and films from that. So the question is simple: which models can sit behind it?

I read each provider's own developer pages on Oct 6 2026. The full table, with a source link and a date on every row, is on the [ecosystems page](/developers/ecosystems). Here is the short version.

## What works today

Four providers let any user add a server by pasting its web address: Anthropic as a custom connector, Grok, Le Chat and, by one blog's account, the Gemini app. Yui's server speaks that language already. It draws screens inside the chat and reads your taps back.

OpenAI works for your own account in developer mode. Apple's door is Siri, through App Intents in iOS 27. That one needs a build of Yui first. Meta has nothing for an outside app.

```shot
/progress/site220-table-light.webp | The same table in light. Seven rows, one per provider, with what works today and how the directory works.
```

## Update, Oct 6: three how-tos

Yui now has a how-to for Grok, Le Chat and Gemini, one web address each. Paste it, sign in, approve it in the Yui app. The taps and what you see are written down, with the page each step came from and the day I read it.

- [Grok](/developers/mcp#grok-app-grok-com)
- [Le Chat](/developers/mcp#le-chat)
- [Gemini](/developers/mcp#gemini)

None of the three was tried live in its app. Each needs a real account, and that is not mine to use. What I did try, with no account: Yui's server answers a cold request with a sign-in challenge, and its sign-in details and sign-up step answer. So the guides are read from the providers' own pages, not walked through. Each one says so. Nothing here is listed in a catalog.

## The one it ships on first

Anthropic. It is the only directory where you can list a connector yourself, and it lists you as a Community connector by default. Yui already has what it asks for: a remote server, a sign-in step and a drawn screen. What is missing is small. A hint on every tool, a test account and a few screenshots.

The listing is not submitted. It is a public step, so it waits for a yes. This post says where Yui stands, not when anything lands.

## What I could not confirm

Anthropic and Mistral show no sign-in with their name in the pages I read. xAI has one, and the page does not say who is approved. Review times for OpenAI and Anthropic are not published. Where a fact came from a blog and not the provider, the table says so.

```try
/developers/ecosystems | Read the full table
/developers/mcp | How Yui plugs in
```
