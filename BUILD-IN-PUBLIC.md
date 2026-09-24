# Build in public | how yuigui.com stays current

Chris, Sep 23 2026: Yui is a build-in-public app. yuigui.com is the public record.

## Two update paths

1. **Ship log (every card).** Any card that ships Yui work adds one entry to the top of `site/content/progress.json` in the same commit, then deploys. No ship without a log line.
2. **Weekly update (Fridays 17:00 ET, cron `yui-weekly-update`).** Reads the week's commits in `~/dev/yuigui` and `~/dev/yui` (app repo, once it exists) plus Yui cards on the board. Adds one entry titled `Week of <Mon date>: <headline>`: what shipped, what is next, one honest problem or open question. If nothing shipped, say so in one line and name what is blocking. Never skip a week.

## Entry rules

- `{ "date": "YYYY-MM-DD", "title": "...", "body": "..." }`, newest first.
- Add `"card": "YUI-7"` (the board key) so the card's tile on yuigui.com/board links to the entry.
- Plain words, short sentences, no em dashes, no hype vocabulary. Written for a curious outsider, not the fleet.
- Update the `phases` pills in `site/app/progress/page.js` when a phase starts or ships.
- Never publish: credentials, costs or spend, client names, Chris's personal details, other agents' private data, anything from AMC.

## Deploy

```
cd ~/dev/yuigui/site && npm run sync && npm run build && vercel --prod --yes
cd ~/dev/yuigui && git add BUILD-IN-PUBLIC.md ROADMAP.md spec site && git commit -m "..." && git push
```
Commit author must be `CJohnDesign <cjohndesign@gmail.com>` (Vercel blocks other authors). Verify: `curl -sL https://www.yuigui.com/progress` contains the new title.

## Live board

yuigui.com/board and the MVP bar are built from the kanban DB by `site/scripts/export-board.mjs` (titles and one-line summaries only; it refuses to write if it sees ids, paths, costs or private names). Cron `yui-board-sync` (urza, no-agent, every 30 min) runs `~/.hermes/profiles/urza/scripts/yui_board_sync.sh`: re-export in a dedicated clean worktree, and only when `board.json` or `mvp.json` changed, commit, push and `vercel --prod`. The MVP card list itself is the keys in `site/content/mvp.json`; edit them by hand when ROADMAP.md's MVP changes.
