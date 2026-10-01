# The private ledger | spec v1 (OSS-7, Oct 1 2026)

Use to earn needs a record, and the record starts on day one. This spec is that record: a private ledger of facts about how people use Yui and what they help build, and the formula that turns those facts into $U. It never stores what anyone said. Why we keep it, and what it could turn into, is in [Use to earn](/business/use-to-earn) and the proposal [Earn $U by using Yui](/proposals/earn-u-by-using-yui).

Status: on. The SQL was applied to Yui's own database on Oct 1 2026 and the backfill filled in every day from Sep 23, the first day. A recorder runs once a day (section 5). $U is a score. **No cash value. Not a token yet.**

## 1. Facts, then points

The ledger holds facts: "this person answered 12 messages on Sep 24", "this pull request merged on Sep 25". It holds no points and no balances. A formula, one row in the database with a version number, turns the facts into $U, and it scores every fact on the ledger the same way, back to day one. A new formula is a new version row. Everyone's history is scored again with it, and the old version can still be asked for. Nothing recorded today promises a rate we cannot change in the open.

## 2. What it records

| Kind | The fact | Where it comes from |
|---|---|---|
| `joined` | An account was made that day | `yui_users.created_at` |
| `founding` | The account was made before Yui leaves TestFlight | Same, while `founding_until` in the formula is empty |
| `message` | How many messages the person sent that an agent answered, a repeat the same day counted once | `yui_messages`: counts only |
| `screen` | How many taps, picks and forms the person sent that an agent took, a repeat counted once | `yui_messages` rows of kind `event`: counts only |
| `job_done` | How many jobs an agent finished for the person | `yui_native_jobs` finished that day |
| `use_day` | The person had at least one answered message or screen | Derived from the two above |
| `feedback_sent` | The person sent feedback | The feedback log, added with its id |
| `feedback_shipped` | That feedback became a change that shipped | The ship log |
| `issue_accepted` | A maintainer accepted a GitHub issue, or turned it into a card | GitHub, by handle |
| `issue_shipped` | The change an accepted issue asked for is live | The ship log |
| `pr_merged` | A pull request merged into `postscarcityai/yuigui` or `postscarcityai/yui` | GitHub, by handle, with the card size (S, M, L) read from the `[KEY]` in the title against the board, else unsized |
| `clawback` | A maintainer took back $U earned by spam or gaming | A fact with a reason, never a delete |

A day is UTC. A message counts once an agent answers it: the host marked it handled, or an agent reply follows within ten minutes. Streak days are `use_day` facts; the streak itself is worked out by the formula, so it follows whichever version is asked for.

## 3. Private

- **Counts only.** The recorder reads `user_id`, `sender`, `kind`, `created_at` and `handled_at` from `yui_messages`. It never reads a message into anything it keeps. To tell a repeat from a new message, the database compares a one-way fingerprint (an md5 of the body) inside the counting query. The fingerprint is not stored and not returned.
- **Nobody else sees your rows.** The table has no grants for `anon` or `authenticated`. The app's role can read only rows where `user_id` is the signed-in person's own (row level security), and call `yui_my_u()`, which returns the caller's own total, today and recent days and takes no user as input. Everything else, including the scorers, is for the service role only.
- **Nothing public.** No names, handles or totals by person are published. If a total is ever shown ("N people have earned"), it is a count with no names.
- **Deleting your account deletes your rows.** `user_id` cascades on delete, as everything else Yui holds does. Whether a person can keep a copy first is an open question (section 7).
- **Bots and the team are off the scoreboard.** `ledger/excluded.json` lists Yui account ids and GitHub logins that earn nothing. The recorder copies it into the database on every run.
- **The privacy page says so.** [yuigui.com/privacy](/privacy#ledger) describes what is recorded, and the date it started.

## 4. The tables and functions

`ledger/yui_ledger.sql`, in full, safe to run again:

- `yui_ledger`: `id`, `user_id` (or `github` for a handle not linked to an account yet), `kind`, `day`, `amount` (a count for `message`, `screen` and `job_done`, 1 for the rest, $U for a `clawback`), `ref` (a pull request as `repo#number`, or a feedback or issue id, never content), `size`, `reason`, `created_at`.
- A unique index on (kind, person, day, ref): the same fact is stored once, and running the recorder twice adds nothing. A trigger refuses any update: rows are only added.
- `yui_ledger_formula`: one row per formula version, with its parameters as JSON. The newest version scores everyone.
- `yui_ledger_excluded`: the bots and team accounts.
- `yui_ledger_day_facts(day)`, `yui_ledger_preview_day(day)`, `yui_ledger_record_day(day)`: what a day would add, what recording it would add by kind (the dry run), and recording it.
- `yui_ledger_add(rows)`: adds the facts the database cannot see (pull requests, feedback, issues, clawbacks).
- `yui_u_days(user, version)` and `yui_u_balance(user, version)`: the formula. Per day: use, streak, bonus, building, clawback and the total. The balance never goes below zero.
- `yui_my_u(days)`: the live read path for the app and the site, the caller's own rows only.

## 5. The formula, v0

On the site as tables at [/earn#formula](/earn#formula); the numbers live in the `yui_ledger_formula` row and a test checks the page against it.

- **Use.** A message 1, a screen 2, a job done 5, and 10 for the first visit of a day. Full speed up to 150 a day, then a tenth.
- **Streaks.** A run of days with an answered message or a screen. 3 days: x1.1. 7 days: x1.25 and +50 that day. 30 days: x1.5 and +300 that day. One missed day in any seven is forgiven and does not add to the length. Streaks speed up use only.
- **Joining.** 100 once, and +400 for a founding user.
- **Building.** Feedback sent 10, shipped +500. An issue accepted 200, shipped +500. A merged pull request by card size: S 1,000, M 3,000, L 10,000, no card 1,000.
- **Clawback.** A fact that subtracts, with a reason in the person's history.

## 6. The recorder

`node ledger/record.mjs` records yesterday (UTC). `--from 2026-09-23` fills in every day up to yesterday. `--prs` adds merged pull requests from both public repos, skipping bots and the excluded list, with card sizes. `--facts file.json` adds facts by hand. `--dry` asks the database what it would add and writes nothing. It needs `YUI_SUPABASE_URL` and `YUI_SUPABASE_SERVICE_ROLE_KEY` for the Yui project. A yui cron runs it once a day beside the media sweep; the key is fetched at run time and never written down.

The live path: the app reads `yui_my_u()` with each turn, and today's counts are read live, so the number moves the moment an agent answers. The ledger settles each day overnight. The relay keeps messages for 90 days, and the nightly recorder keeps up well inside that.

Tested on Postgres (not on Supabase itself; Supabase was applied by hand and checked afterward): each kind, the formula, the soft cap, streaks and the forgiven day, clawbacks, exclusions, a dry run that matches the backfill, a second run that adds nothing, and row level security.

## 7. Not in v1

- Linking a GitHub handle to a Yui account (OSS-9). Until then a pull request from a handle sits on the ledger by handle and earns nothing in a balance.
- Showing your own $U in the app (YUI-210) and on the site.
- Keeping a copy of your record when you delete your account.
- Tokens, distributions, airdrops and NFTs. All of them wait on counsel ([Build to earn](/earn)).
