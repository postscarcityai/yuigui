# ledger

The private ledger behind use to earn (OSS-7), and the $U formula. The spec is [spec/LEDGER.md](../spec/LEDGER.md), on the site at [yuigui.com/developers/ledger](https://www.yuigui.com/developers/ledger). The formula tables are at [yuigui.com/earn#formula](https://www.yuigui.com/earn#formula). The thinking is [Use to earn](https://www.yuigui.com/business/use-to-earn) and [Earn $U by using Yui](https://www.yuigui.com/proposals/earn-u-by-using-yui).

- `yui_ledger.sql`: the tables, the formula row and the functions. Safe to run again. Apply it by hand to Yui's own Supabase project (yuigui, ref `txuibjxyfpalzvpneqgp`), never PROOF, never `supabase db push`.
- `record.mjs`: the daily recorder. Node 22, no dependencies.
- `excluded.json`: bots and team accounts that earn nothing.
- `test/`: the tests, on Postgres in process (PGlite). `cd ledger/test && npm i && npm test`.

```
node ledger/record.mjs --from 2026-09-23 --prs --dry   # what the backfill would record, writes nothing
node ledger/record.mjs --from 2026-09-23 --prs         # the backfill, once
node ledger/record.mjs --prs                           # yesterday, once a day
```

It needs `YUI_SUPABASE_URL` and `YUI_SUPABASE_SERVICE_ROLE_KEY` (the Yui project). `GITHUB_TOKEN` is optional.

Status: on since Oct 1 2026, filled in from Sep 23. A yui cron (`yui-ledger-record`) runs the recorder daily at 04:30 ET, after the media sweep. $U is a score. No cash value. Not a token yet.

Changing the formula: add a row to `yui_ledger_formula` with the next version and the new parameters, update `site/lib/earn-formula.mjs` and the tables on `/earn`, and publish the date. The test in `test/` checks that the page and the v0 row agree.
