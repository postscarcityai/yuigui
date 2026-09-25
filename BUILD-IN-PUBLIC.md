# Build in public | how yuigui.com stays current

Chris, Sep 23 2026: Yui is a build-in-public app. yuigui.com is the public record.

## Two update paths

1. **Ship log (every card).** Any card that ships Yui work adds one entry to the top of `site/content/progress.json` in the same commit, then deploys. No ship without a log line.
2. **Weekly update (Fridays 17:00 ET, cron `yui-weekly-update`).** Reads the week's commits in `~/dev/yuigui` and `~/dev/yui` (app repo, once it exists) plus Yui cards on the board. Adds one entry titled `Week of <Mon date>: <headline>`: what shipped, what is next, one honest problem or open question. If nothing shipped, say so in one line and name what is blocking. Never skip a week.

3. **Thoughts (SITE-30), Yui's blog at /thoughts.** Written by the yui agent, in its own voice. Three tags: `release` (one per epic: what shipped, what to try, the shots), `why` (a decision and its reasons) and `call` (open calls, like agents earning by sending pull requests). The weekly update and every epic release **draft** one: write `docs/thoughts/drafts/<slug>.md` and say so in the reply. Drafts never reach the site. Publishing is a normal site deploy: move the file up to `docs/thoughts/`, make its share jpg, sync, build, push. Social posts about a Thought stay 🔴 Chris-gated.

## Writing a Thought

- Frontmatter: `date`, `tag` (release, why or call), `title`, `dek` (one or two sentences, it is the card text and the preview).
- **Show, don't tell.** The body opens with a visual, and never runs more than 4 paragraphs (lists and quotes count) before the next one. `npm run sync` refuses a post that breaks either rule, and any private name, task id or machine path.
- Visuals are fenced blocks, one item per line, `a | b`:
  - ` ```shot ` `src | alt` lines: screenshots from `site/public/progress/`, open full size.
  - ` ```clip ` `src.mp4 | caption`: a clip from `site/public/demo/`; the poster is the same path as `.jpg`.
  - ` ```phone ` Yui Lines, drawn live on the page and tappable, with the lines under it; an optional first line `caption: ...`.
  - ` ```compare ` `before: <src or text> | label` and `after: ...`: two pictures get a drag-to-wipe slider, text (use `\n` for new lines) sits side by side.
  - ` ```try ` `href | label` lines: big buttons to the playground, /earn, a repo. Not a visual.
- Share preview: `sips -s format jpeg --resampleWidth 540 site/public<lead> --out site/public/og/thoughts/<slug>.jpg` (next/og cannot read webp). Without it the preview draws the lead phone's lines.
- RSS at /thoughts/feed.xml, the sitemap and llms.txt pick new posts up on their own.

## Entry rules

- `{ "date": "YYYY-MM-DD", "title": "...", "card": "YUI-7", "body": "...", "images": [{ "src": "/progress/yui7-chat.webp", "alt": "..." }] }`, newest first.
- Add `"card": "YUI-7"` (the board key) so the card's tile on yuigui.com/board links to the entry, and so /changelog can place it under the right build.
- Add `"build": 4` only for an entry about a build that has no card (it then tells that build's story on /changelog).
- Add `"short"` for an app change: one or two sentences, under 25 words, what a person can now do. No card ids, feedback ids, flags or URLs. The build-ready deck in Yui (yui_build_ping.py) shows it as the page; without it the deck picks the entry's first plain "now" sentence.
- **Screenshots on every card (Chris, Sep 24 2026: he loves them).** Anything visual ships with 1 to 4 real screenshots in `images`: the new screen in the app (simulator, light and dark when both matter), the web preset in the playground, the page on the site. No mockups passed off as the product. The progress page shows them as thumbnails that open full size; /changelog shows them under their build. A card with nothing to see (a spec, a script) says so in its body and skips `images`.
- **See it (SITE-14).** A card that ships something a person can see also adds it to `site/content/showcase.json`: the card (title, shipped date) under `cards`, and an entry with a Yui Line (`yl`, or `demo` naming a playground sample), its screenshots and any simulator clip. /mockups draws it, the board tile gets a See it link, and the card id on /roadmap links to it. A planned card may get a `planned` entry, drawn on the web and labelled not built.
- **Share links (SITE-19).** Every See it entry gets a link at `/s/<id>` on its own, with a preview card (the lines plus the real screen). The screen in that card is a capture: after adding entries, run `uv run --with playwright python scripts/capture-og.py --missing` from `site/` against a local `next start -p 3019`, then build again and commit the new `public/og/screens/*.jpg`. Without a capture the card draws a simpler screen, so nothing breaks. Never rename an entry id once it has shipped: people post those links.
- Plain words, short sentences, no em dashes, no hype vocabulary. Written for a curious outsider, not the fleet.
- Phases live in one place, the Phases section of `ROADMAP.md` (rendered at /roadmap). Update it when a phase starts or ships. No other page lists phases (SITE-13).
- Never publish: credentials, costs or spend, client names, Chris's personal details, other agents' private data, anything from AMC.

## Screenshots

- Keep the full-size originals in the card's artifacts (`~/.hermes/kanban/artifacts/<task id>/`). Publish optimized copies to `site/public/progress/<card>-<what>.webp`, for example `yui16-compare.webp`.
- Optimize: webp, quality about 78, phone shots 720 wide, pages 1400 wide at most and cropped to the part that matters, each file under about 100 KB. `cwebp -q 78 -resize 720 0 in.png -o out.webp` works, and so does `sharp` from `site/node_modules`.
- Look at every image before it goes out. Crop or skip anything showing a private name (the web renderer's header shows the agent's name, crop it), an email, a token, a real person's data, a notification from someone else, or a cost.
- `alt` says what the screen shows, in plain words, for someone who cannot see it.
- App commits end with the card key, `Drop the cat (YUI-9)`, so the build that shipped them links to their entry.

## Deploy

```
cd ~/dev/yuigui/site && npm run sync && npm run build
cd ~/dev/yuigui && git add BUILD-IN-PUBLIC.md ROADMAP.md spec site && git commit -m "..." && git push
```
A push to main deploys to production: the Vercel project's Root Directory is `site` (SITE-25). Vercel only runs `next build`, so run `npm run sync` and commit what it writes (site/content) before pushing. If a push deploy fails, deploy by hand from the repo root, never from `site/` (with the root set to `site`, the CLI looks for `site/site` and stops): `cd ~/dev/yuigui && vercel --prod --yes` (the root `.vercel/project.json` links project yui). Commit author must be `CJohnDesign <cjohndesign@gmail.com>` (Vercel blocks other authors). Verify: `curl -sL https://www.yuigui.com/progress` contains the new title.

## Live board

yuigui.com/board and the MVP bar are built from the kanban DB by `site/scripts/export-board.mjs` (titles and one-line summaries only; it refuses to write if it sees ids, paths, costs or private names). Cron `yui-board-sync` (urza, no-agent, every 30 min) runs `~/.hermes/profiles/urza/scripts/yui_board_sync.sh`: re-export in a dedicated clean worktree, and only when `board.json` or `mvp.json` changed, commit, push and `vercel --prod`. The MVP card list itself is the keys in `site/content/mvp.json`; edit them by hand when ROADMAP.md's MVP changes.

## Freshness check

`node site/scripts/freshness.mjs` (SITE-31) fails with file and line when ROADMAP.md, a page or See it says something the builds and the board moved past: a build at or below the newest VALID one called next or on its way, or a shipped card labelled next, building, NOT STARTED or IN THE NEXT BUILD. It reads the exported `board.json`, `mvp.json` and `builds.json`, so run it on a current tree. The lane driver runs it once a day; run it before any roadmap commit too.

## Changelog

yuigui.com/changelog groups the log by TestFlight build: build number, date, what changed, screenshots. `site/scripts/export-builds.mjs` writes `site/content/builds.json` from App Store Connect (`~/dev/yui/scripts/asc.py`, the key never leaves this machine) and the app repo's git log: a build number is the app repo's commit count, so build N ships the commits after the previous build up to N. The page joins each change to its progress entry by card key. The `yui-board-sync` cron runs the export with the board and deploys when a new build appears. Run it by hand with `cd ~/dev/yuigui/site && node scripts/export-builds.mjs`. Early commits without a card key are mapped in its `KEYS` table.
