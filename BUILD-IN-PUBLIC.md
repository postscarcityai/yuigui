# Build in public | how yuigui.com stays current

Chris, Sep 23 2026: Yui is a build-in-public app. yuigui.com is the public record.

## Two update paths

1. **Ship log (every card).** Any card that ships Yui work adds one entry to the top of `site/content/progress.json` in the same commit, then deploys. No ship without a log line.
2. **Weekly update (Fridays 17:00 ET, cron `yui-weekly-update`).** Reads the week's commits in `~/dev/yuigui` and `~/dev/yui` (app repo, once it exists) plus Yui cards on the board. Adds one entry titled `Week of <Mon date>: <headline>`: what shipped, what is next, one honest problem or open question. If nothing shipped, say so in one line and name what is blocking. Never skip a week.

## Entry rules

- `{ "date": "YYYY-MM-DD", "title": "...", "card": "YUI-7", "body": "...", "images": [{ "src": "/progress/yui7-chat.webp", "alt": "..." }] }`, newest first.
- Add `"card": "YUI-7"` (the board key) so the card's tile on yuigui.com/board links to the entry, and so /changelog can place it under the right build.
- Add `"build": 4` only for an entry about a build that has no card (it then tells that build's story on /changelog).
- **Screenshots on every card (Chris, Sep 24 2026: he loves them).** Anything visual ships with 1 to 4 real screenshots in `images`: the new screen in the app (simulator, light and dark when both matter), the web preset in the playground, the page on the site. No mockups passed off as the product. The progress page shows them as thumbnails that open full size; /changelog shows them under their build. A card with nothing to see (a spec, a script) says so in its body and skips `images`.
- Plain words, short sentences, no em dashes, no hype vocabulary. Written for a curious outsider, not the fleet.
- Update the `phases` pills in `site/app/progress/page.js` when a phase starts or ships.
- Never publish: credentials, costs or spend, client names, Chris's personal details, other agents' private data, anything from AMC.

## Screenshots

- Keep the full-size originals in the card's artifacts (`~/.hermes/kanban/artifacts/<task id>/`). Publish optimized copies to `site/public/progress/<card>-<what>.webp`, for example `yui16-compare.webp`.
- Optimize: webp, quality about 78, phone shots 720 wide, pages 1400 wide at most and cropped to the part that matters, each file under about 100 KB. `cwebp -q 78 -resize 720 0 in.png -o out.webp` works, and so does `sharp` from `site/node_modules`.
- Look at every image before it goes out. Crop or skip anything showing a private name (the web renderer's header shows the agent's name, crop it), an email, a token, a real person's data, a notification from someone else, or a cost.
- `alt` says what the screen shows, in plain words, for someone who cannot see it.
- App commits end with the card key, `Drop the cat (YUI-9)`, so the build that shipped them links to their entry.

## Deploy

```
cd ~/dev/yuigui/site && npm run sync && npm run build && vercel --prod --yes
cd ~/dev/yuigui && git add BUILD-IN-PUBLIC.md ROADMAP.md spec site && git commit -m "..." && git push
```
Commit author must be `CJohnDesign <cjohndesign@gmail.com>` (Vercel blocks other authors). Verify: `curl -sL https://www.yuigui.com/progress` contains the new title.

## Live board

yuigui.com/board and the MVP bar are built from the kanban DB by `site/scripts/export-board.mjs` (titles and one-line summaries only; it refuses to write if it sees ids, paths, costs or private names). Cron `yui-board-sync` (urza, no-agent, every 30 min) runs `~/.hermes/profiles/urza/scripts/yui_board_sync.sh`: re-export in a dedicated clean worktree, and only when `board.json` or `mvp.json` changed, commit, push and `vercel --prod`. The MVP card list itself is the keys in `site/content/mvp.json`; edit them by hand when ROADMAP.md's MVP changes.

## Changelog

yuigui.com/changelog groups the log by TestFlight build: build number, date, what changed, screenshots. `site/scripts/export-builds.mjs` writes `site/content/builds.json` from App Store Connect (`~/dev/yui/scripts/asc.py`, the key never leaves this machine) and the app repo's git log: a build number is the app repo's commit count, so build N ships the commits after the previous build up to N. The page joins each change to its progress entry by card key. The `yui-board-sync` cron runs the export with the board and deploys when a new build appears. Run it by hand with `cd ~/dev/yuigui/site && node scripts/export-builds.mjs`. Early commits without a card key are mapped in its `KEYS` table.
