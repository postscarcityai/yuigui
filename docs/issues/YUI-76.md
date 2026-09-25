---
card: YUI-76
repo: postscarcityai/yui
title: Agent bubbles render basic markdown (bold, code, lists)
labels: good first issue, help wanted, area:app
---
Some agents answer in markdown: `**bold**`, `inline code`, bullet lists. Yui's agent bubbles show the raw markers today, so an answer reads as `**Model:** ...` instead of **Model:** ....

## Context

- The chat thread and bubbles: `Yui/Sources/ChatView.swift` and `Yui/Sources/Chat/`.
- Theme tokens (fonts, colors): `Yui/Sources/Theme/YuiTheme.swift`.
- Yui Lines fences (```` ```yui ````) are screens, not text. Leave them alone.

## What to do

Render the markdown subset agents send, natively (`AttributedString(markdown:)` is fine): bold, italic, inline code, code blocks, bullet and numbered lists, links.

## Done when

- Agent text bubbles render that subset. Your own messages stay plain.
- Selecting text and Copy still work, on the rendered text.
- Looks right in light and dark mode, and at large Dynamic Type sizes. Screenshots of both in the pull request.
- A unit test covers the parsing, and Yui Lines fences are untouched.

See CONTRIBUTING.md in this repo for build setup.
