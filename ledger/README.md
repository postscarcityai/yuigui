# ledger

The private ledger behind use to earn (OSS-7). The spec is [spec/LEDGER.md](../spec/LEDGER.md), on the site at [yuigui.com/developers/ledger](https://www.yuigui.com/developers/ledger). The thinking is [Use to earn](https://www.yuigui.com/business/use-to-earn).

- `yui_ledger.sql`: the table and two functions. Apply by hand in the SQL editor of the shared Supabase project. Never `supabase db push`.
- `record.mjs`: the daily recorder. Node 22, no dependencies.

```
node ledger/record.mjs --from 2026-09-23 --prs --dry   # what the backfill would record, writes nothing
node ledger/record.mjs --from 2026-09-23 --prs         # the backfill, once
node ledger/record.mjs --prs                           # yesterday, once a day
```

It needs `YUI_SUPABASE_URL` and `YUI_SUPABASE_SERVICE_ROLE_KEY`, the same two the site uses. `GITHUB_TOKEN` is optional.

Status: designed and tested, not switched on. Nothing is recorded until Chris applies the SQL and schedules the recorder.
