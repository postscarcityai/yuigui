# AGENTS.md

Notes for AI coding agents working in this repo.

- **Contributing?** Read [CONTRIBUTING-AGENTS.md](CONTRIBUTING-AGENTS.md) first. Take one open card from https://www.yuigui.com/contribute/backlog.json, claim it with a draft pull request titled `[KEY] ...`, and follow the card's tests.
- What this repo is: the hub. The Yui Lines spec (`spec/YL.md`), conformance vectors (`spec/conformance/`), parsers (`site/lib/yl/yl.mjs` is the reference, ports in `parsers/`), and the site at yuigui.com (`site/`). The iPhone app lives in [postscarcityai/yui](https://github.com/postscarcityai/yui).
- Before every push: `scripts/check.sh` runs what CI runs (conformance, bench, og-check, site build) in about 20 s; `--fast` skips the build. Install the pre-push hook once per clone with `scripts/install-hooks.sh` (sets `core.hooksPath` to `.githooks`), so a red check stops on your machine and not on main. Adding a share link or a showcase entry? Capture its preview too (`site/scripts/capture-og.py --missing`, see BUILD-IN-PUBLIC.md, "Share links"), and never put a private name (Arnold, Hank, ...) in a share link's agent or title.
- Tests: `cd bench && npm test`, `cd spec/conformance && node run.mjs`, `cd site && npm run sync && npm run build`.
- Edit source files, not `site/content/` (generated). Never touch `.github/`, keys or release scripts.
- Style: plain words, short sentences, no em dashes.
- Videos: `videos/README.md` is how Yui's launch and explainer videos are made (the look, the dub sound, the story shape, the kit). Renders stay out of git.
- Note: `spec/AGENTS.md` is a different file, the spec for how agents connect to Yui.
