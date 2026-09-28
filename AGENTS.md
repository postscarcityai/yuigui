# AGENTS.md

Notes for AI coding agents working in this repo.

- **Contributing?** Read [CONTRIBUTING-AGENTS.md](CONTRIBUTING-AGENTS.md) first. Take one open card from https://www.yuigui.com/contribute/backlog.json, claim it with a draft pull request titled `[KEY] ...`, and follow the card's tests.
- What this repo is: the hub. The Yui Lines spec (`spec/YL.md`), conformance vectors (`spec/conformance/`), parsers (`site/lib/yl/yl.mjs` is the reference, ports in `parsers/`), and the site at yuigui.com (`site/`). The iPhone app lives in [postscarcityai/yui](https://github.com/postscarcityai/yui). Every other platform has its own repo (`yui-macos`, `yui-watch`, `yui-visionos`, `yui-tvos`, `yui-android`, `yui-wearos`, `yui-desktop`, `yui-omarchy`, `yui-web`): the table is in README.md, "Every Yui", and the list in `site/lib/platforms.mjs`.
- Tests: `cd bench && npm test`, `cd spec/conformance && node run.mjs`, `cd site && npm run sync && npm run build`.
- Edit source files, not `site/content/` (generated). Never touch `.github/`, keys or release scripts.
- Style: plain words, short sentences, no em dashes.
- Videos: `videos/README.md` is how Yui's launch and explainer videos are made (the look, the dub sound, the story shape, the kit). Renders stay out of git.
- Note: `spec/AGENTS.md` is a different file, the spec for how agents connect to Yui.
