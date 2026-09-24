# Contributing to Yui

Thanks for looking. Yui is built in public, and help is welcome at any size: a typo, a bug report, a new preset idea, or a Yui Lines parser in a language we do not have yet.

This repo is the hub: the Yui Lines spec, the conformance vectors, the reference parser and the site. App and plugin code live in [postscarcityai/yui](https://github.com/postscarcityai/yui).

## Good first contributions

- **A parser in a new language.** Kotlin is next on our list (for Android), but any language helps. Make it pass every file in `spec/conformance/`, then open an issue so we can link it.
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
2. Update `spec/YL.md`, the reference parser in `site/lib/yl/yl.mjs`, and add or change vectors in `spec/conformance/` in the same pull request.
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
