# Contributing to Yui

Thanks for looking. Yui is built in public, and help is welcome at any size: a typo, a bug report, a new preset idea, or a Yui Lines parser in a language we do not have yet.

This repo is the hub: the Yui Lines spec, the conformance vectors, the reference parser and the site. App and plugin code live in [postscarcityai/yui](https://github.com/postscarcityai/yui).

New here? The [community page](https://www.yuigui.com/developers/community) shows who builds with Yui Lines and every way to join in.

## Good first contributions

- **Pick an issue.** Cards from our board that suit a first pull request are open as [good first issues](https://github.com/postscarcityai/yuigui/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22), with what to build and when it is done. The app repo has [its own list](https://github.com/postscarcityai/yui/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22). Say you are taking one in a comment first.
- **The three lines challenge.** Draw your best screen in three lines of Yui Lines or fewer and add it to `community/gallery.json`. `node community/check.mjs` checks it, and merged entries show up live in the [gallery](https://www.yuigui.com/developers/community#gallery). How to enter: [community/README.md](community/README.md).
- **A parser in a new language.** We have JavaScript, Swift, Python and Kotlin (see `parsers/`). Rust is next on our list, but any language helps. Make it pass every file in `spec/conformance/`, add it to `spec/conformance/run-all.sh`, then open a pull request.
- **Conformance vectors.** Found an edge case the spec is vague about? Add a vector and say what you think the answer should be.
- **Preset ideas.** Open an issue with the screen you wish an agent could put up, written as Yui Lines.
- **Site fixes.** Anything in `site/`.

## Setup

Node 20 or newer.

```sh
cd bench && npm install && npm test     # parser + conformance tests
cd site && npm install && npm run sync && npm run dev
```

`npm run sync` copies `ROADMAP.md`, `spec/YL.md` and the benchmark into `site/content/`. Edit the source files, not the copies.

## Changing the spec

`spec/YL.md` is the contract between agents and the app, so changes there go slower than code changes.

1. Open an issue first and describe the change with a before and after.
2. Update `spec/YL.md`, the reference parser in `site/lib/yl/yl.mjs`, the ports in `parsers/`, and add or change vectors in `spec/conformance/` in the same pull request. `spec/conformance/run-all.sh` must pass.
3. Keep lines short. Every token an agent writes costs money on every turn. If a change makes common screens longer, it needs a strong reason. Rerun `npm run bench` in `bench/` and paste the numbers.

## Pull requests

- One change per pull request. Small is easier to review.
- Tests pass: `cd bench && npm test`.
- Anything visual comes with a screenshot.
- Never include keys, tokens or anyone's personal data.
- By opening a pull request you agree your work is licensed under Apache-2.0, the same as the rest of the repo.

## Writing style

Docs and site copy use plain words and short sentences. No hype. Write for a curious outsider.

## Conduct

Everyone here follows the [Code of Conduct](CODE_OF_CONDUCT.md).
