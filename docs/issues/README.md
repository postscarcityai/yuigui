# Issue drafts

Board cards picked for outside contributors, one file per card. The board stays the source of truth;
`node scripts/issues.mjs --apply` opens or updates the matching GitHub issue, found by the
`<!-- yui-card: KEY -->` line it adds to the body. Without `--apply` it only checks the drafts.

A draft is frontmatter and a markdown body:

```
---
card: OSS-4
repo: postscarcityai/yuigui
title: Yui Lines parser in Rust
labels: good first issue, help wanted, area:parsers
---
Context, what to do, done when.
```

Labels come from the list in `scripts/issues.mjs`. The script runs the site's leak check on every
draft and refuses to publish one that names a private project, a task id or a machine path.

Picking a card: small and self-contained, testable without our keys or machines, no spend, nothing
waiting on a decision. When a card ships or changes on the board, edit its draft and run the script again.
