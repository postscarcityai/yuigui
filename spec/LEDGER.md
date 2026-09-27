# The private ledger | spec v0 (OSS-7, Sep 26 2026)

Use to earn needs a record, and the record has to start on day one. This spec is that record: a private ledger of facts about how people use Yui and what they help build. It never stores what anyone said. Why we keep it, and what it could turn into, is in [Use to earn](/business/use-to-earn).

Status: designed and tested, not switched on. The SQL and the recorder are in `ledger/` in the hub repo. Nothing is recorded until Chris applies the SQL to the shared database by hand and schedules the recorder (section 6). The relay keeps messages for 90 days, so a ledger switched on before about Dec 22 2026 still fills in from day one, Sep 23.

## 1. Facts, not points

The ledger holds facts: "this person used Yui on Sep 24", "this pull request merged on Sep 25". It holds no points, no balances and no prices. A formula that turns facts into points is published before anything is ever distributed, and it applies to every fact on the ledger the same way, back to day one. So nothing we record today promises a rate we might have to change.

## 2. What it records

| Kind | The fact | Where it comes from |
|---|---|---|
| `joined` | An account was made that day | `yui_users.created_at` |
| `use_day` | The person sent a message or answered a screen that day (UTC) | `yui_messages` rows with `sender = 'user'`: `user_id` and `created_at` only |
| `pr_merged` | A pull request merged into `postscarcityai/yuigui` or `postscarcityai/yui` | GitHub, by handle. An agent's pull request counts for the person who runs it once they link the handle |
| `feedback_shipped` | A TestFlight note became a change that shipped | The ship log, added by hand with the feedback id |

A day is the unit of use on purpose. The ledger does not count messages, minutes, streaks or time in the app, so nobody is nudged to spend more time than helps them (the same rule as [BIZ-1](/business/biz-1-marketing-positioning), "What we will not track").

## 3. Private

- **Counts only.** The recorder reads `user_id`, `sender` and `created_at` from `yui_messages`. It never reads `body`.
- **Nobody else sees your rows.** The table has no grants for `anon`, `authenticated` or the app's role, and RLS is on with no policy. Only the service role writes. A view that shows a person their own rows comes in a later phase, with the app.
- **Nothing public.** No names, handles or totals are published. If a total is ever shown ("N people have earned"), it is a count with no names.
- **Deleting your account deletes your rows.** `user_id` cascades on delete, as everything else Yui holds does. Whether a person can keep a copy first is an open question (section 7).
- **The privacy page says so the day it starts.** Until then it says the ledger is planned and not recording.

## 4. The table

`ledger/yui_ledger.sql`, in full:

- `yui_ledger`: `id`, `user_id` (or `github` for a handle not linked to an account yet), `kind`, `day`, `amount` (1 today), `ref` (a pull request as `repo#number`, or a feedback id, never content), `created_at`.
- A unique index on (kind, person, day, ref): the same fact is stored once, and running the recorder twice adds nothing.
- `yui_ledger_record_day(day)`: adds that day's `joined` and `use_day` facts from the database itself.
- `yui_ledger_add(rows)`: adds `pr_merged` and `feedback_shipped` facts from outside. Any other kind is ignored.
- Both functions are for the service role only.

Tested Sep 26 on Postgres 16 with stand-in `yui_users` and `yui_messages` tables: the first run of a day adds its facts and a second adds none, a day splits at midnight UTC, agent messages do not count, the same pull request under two spellings of a handle is stored once, deleting an account removes its rows, and `anon` and `authenticated` can neither read the table nor call the functions.

## 5. The recorder

`node ledger/record.mjs` records yesterday (UTC). `--from 2026-09-23` fills in every day up to yesterday. `--prs` adds merged pull requests from both public repos, skipping bots. `--dry` prints what it would record and writes nothing. It needs `YUI_SUPABASE_URL` and `YUI_SUPABASE_SERVICE_ROLE_KEY`, the same two the site uses; `GITHUB_TOKEN` is optional.

## 6. Switching it on

1. Read this spec and `ledger/yui_ledger.sql`.
2. Apply the SQL by hand in the SQL editor of the yuigui Supabase project. Never `supabase db push`.
3. Fill in from day one: `node ledger/record.mjs --from 2026-09-23 --prs`.
4. Run `node ledger/record.mjs --prs` once a day, beside the media sweep.
5. Publish the privacy paragraph (section 3), and change the home page line from "we are starting a private ledger" to "a private ledger counts".

## 7. Not in v0

- The points formula, weights (a day of use against a merged pull request) and daily caps.
- Linking a GitHub handle to a Yui account. Opt-in, from the person's side.
- A view of your own rows, in the app or on the site.
- Keeping a copy of your record when you delete your account.
- Tokens, distributions, airdrops and NFTs. All of them wait on counsel ([Build to earn](/earn)).
