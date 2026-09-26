# Speed budget (PERF-1, YUI-98)

Status: built (YUI-102, Sep 25). Step 1 was this page: the budget, what the phone measures, where the numbers go, the daily report and the Speed panel, drawn in the playground (`/playground?demo=speed`). Step 2 built it: MetricKit and signposts in the app, the `yui_perf` table, the report script and the war room panel. Section 10 says what the build taught. YUI-99, YUI-100 and YUI-101 are measured against the numbers on this page, before and after.

Chris, Sep 25: "Optimize for pure user experience... we need to be very efficient like Telegram... put some reporting in place that you can monitor." The design stays as it is. This page says what fast means, in numbers, so every fix has a before and an after and Yui can see when a build gets slower.

## 1. What fast means

Three facts set the budget.

- **One frame.** Every iPhone Yui supports draws at 60 Hz, and ProMotion phones at up to 120 Hz. A frame is 16.7 ms at 60 Hz and 8.3 ms at 120 Hz. When the main thread misses a frame, the old picture stays up one more frame: Apple calls that a hitch. Telegram feels instant because a tap, a key or a new message changes the screen in the next frame, and scrolling never drops one. Its iOS client lays out and draws message cells off the main thread (it is built on its own fork of Texture, formerly AsyncDisplayKit), so the main thread only puts finished pictures on screen.
- **100 ms is instant, 250 ms is a hang.** People read a response under about 100 ms as caused by their own tap, with nothing in between (Nielsen's first limit). Apple counts a main thread that is busy for 250 ms or more as a hang.
- **Hitch time ratio.** Apple measures scroll and animation smoothness as milliseconds of hitch per second of motion: under 5 ms/s is good, 5 to 10 is noticeable, over 10 is bad. MetricKit reports it for scrolling as `scrollHitchTimeRatio`.

Notes is the typing yardstick: a held backspace deletes as fast as the key repeats, and a double space turns into a period before the next key. Yui's composer has to match it on a 500-message thread (YUI-99).

## 2. The intervals

Each interval starts at the person's action (or the network's delivery) and ends at the **first frame that shows the response**, not at the end of an animation. The end is taken from the display link: the first frame presented after the view that answers has been committed. Numbers are milliseconds, per phone, over the build's samples.

| Interval | Starts | Ends | p50 | p95 | Card that moves it |
|---|---|---|---|---|---|
| `keystroke_render` | a key changes the composer text (held keys count each repeat) | the frame showing the new text | 16 | 33 | YUI-99 |
| `send_bubble` | the Send tap | the frame showing the person's bubble in the thread | 16 | 50 | YUI-101 |
| `arrive_drawn` | an agent message arrives on the realtime socket | the frame showing it drawn, Yui Lines parsed and laid out | 50 | 150 | YUI-101 |
| `swipe` | the finger lifts on a page swipe | the page settled (the spring is 350 ms of that) | 380 | 420 | YUI-101 |
| `fullscreen_open` | a tap (or a line) that opens the stage | the first frame of the stage content | 50 | 100 | YUI-101 |
| `thread_open` | a tap on an agent in the list | the frame showing the thread's newest messages | 150 | 300 | YUI-101 |
| `launch` | the process starts | the first frame of the last open thread, cold | 400 | 1000 | YUI-100, YUI-101 |

Why these numbers:

- **Keystroke and send are one frame at p50.** That is what Notes and Telegram do. A p95 of two frames at 60 Hz (33 ms) still reads as instant; more than that and a fast typist sees the text trail the keys.
- **Arrive is looser** because a reply may carry a whole screen of lines. Parsing and layout go off the main thread (step 2 moves them if they are not), so p95 stays under Nielsen's 100 ms plus the one frame it takes to show.
- **Swipe** is the spring's own 350 ms plus at most two frames at p50 and nine at p95. The spring is design and stays; any time past it is ours.
- **Full screen** is a tap, so it gets the 100 ms rule at p95, and the first frame of the transition at p50.
- **Thread open** under 300 ms warm is YUI-101's target. The first open after launch (nothing cached) is reported apart as `thread_open_cold`, with a p95 of 800 ms.
- **Launch** at 400 ms is Apple's goal for the first frame (it matches the launch animation). Warm resume from the background is reported as `resume`, p95 200 ms.

## 3. Hangs, hitches, memory, CPU

| Measure | Source | Budget | Warn |
|---|---|---|---|
| Hang rate | MetricKit `hangTimeHistogram`, per foreground hour | under 1 s of hang per hour | 1 to 5 s/h |
| Long hangs | MetricKit hang diagnostics | none of 1 s or more in normal use | any |
| Scroll hitch ratio | MetricKit `scrollHitchTimeRatio` | under 5 ms/s | 5 to 10 ms/s |
| Memory peak | MetricKit `peakMemoryUsage`, plus our `phys_footprint` samples | under 300 MB | 300 to 450 MB |
| Memory, steady | median of the 30 s `phys_footprint` samples in the foreground | under 150 MB | 150 to 250 MB |
| Memory growth | `phys_footprint` after 30 min idle with realtime connected, minus the start | under 10 MB | 10 to 30 MB |
| Memory warnings | `didReceiveMemoryWarning` count | 0 per day | any |
| CPU, idle foreground | MetricKit `cumulativeCPUTime` over foreground time, realtime connected, nothing moving | under 2% | 2 to 5% |
| Launch | MetricKit `histogrammedTimeToFirstDraw` | as in section 2 | |
| Crashes | MetricKit crash diagnostics | 0 | any |

The memory numbers are a start. YUI-100 sets the real ceiling from the first week of numbers (its scripted session must end within X MB of where it started), and this table takes that number when it lands.

## 4. What the phone collects

**Numbers only.** Nothing a person wrote or an agent sent ever leaves the phone through this path: no message text, no Yui Lines, no agent names, no screen titles, no image or file names. A row says "keystroke_render took 12 ms on build 125", never what was typed.

1. **MetricKit.** A `MXMetricManagerSubscriber` registered at launch. iOS delivers a metrics payload about once a day (the previous 24 hours) and diagnostics as they happen. From metrics: the hang histogram, scroll hitch ratio, launch and resume histograms, peak and average memory, CPU time, foreground and background time. From diagnostics: hangs, crashes, CPU and disk-write exceptions, each with its call stack. A stack is frames as binary name, image UUID and offset; symbols are resolved on the Mac against the build's dSYM (step 2), so a stack carries no strings from the app's data. iOS only delivers MetricKit to people who share analytics with app developers, so this half is sparse on purpose.
2. **Signposts.** An `OSSignposter` interval around each hot path in section 2, so Instruments shows them by name, and alongside it a monotonic clock that measures the same interval in the app. The end is the first display-link frame after the answering view commits. This half works for every tester, whatever their analytics setting.
3. **Memory samples.** `phys_footprint` (what iOS counts against the app, from `task_vm_info`) every 30 s in the foreground, and once on every memory warning.
4. **Context on every row.** App build and version, iOS version, device model (`iPhone16,2`), whether the phone was on low power mode or thermally throttled, and ProMotion or not. No device name, no identifier beyond the account.

**Off the main thread, batched.** Samples go into an in-memory buffer owned by a background actor. Each interval is kept as a histogram with fixed bucket edges (below), not as raw samples, so an hour of typing is one small row. Every hour in the foreground, on going to the background, and when a MetricKit payload lands, the actor sends what it has in one request. A failed send keeps the rows (at most 7 days, 500 rows) and tries on the next batch. A signpost costs one clock read and one buffer write on the main thread; nothing else runs there.

Bucket edges, ms: `2, 4, 8, 12, 16, 24, 33, 50, 75, 100, 150, 250, 400, 600, 1000, 2000, 5000`, plus one bucket above. Merging hours, phones and days is adding the counts, and p50/p95 come from the merged histogram (the bucket where the rank lands, interpolated inside it).

**Dev builds get a verbose mode.** On a test build (the Yui Dev bundle) Settings > About this build has a Speed switch: every sample is also logged to the console with its signpost name, and a small overlay shows the last `keystroke_render` and the frame rate. TestFlight and App Store builds have no switch and no overlay: no developer tooling in the app people use.

## 5. Where the numbers go: `yui_perf`

Proposed SQL (step 2 migrates it in the app repo):

```sql
create table if not exists public.yui_perf (
  id           bigint generated always as identity primary key,
  user_id      uuid not null references public.yui_users(id) on delete cascade,
  kind         text not null check (kind in ('interval', 'memory', 'metrics', 'diagnostic')),
  name         text not null check (name ~ '^[a-z][a-z0-9_]{1,40}$'),
  app_build    int  not null,
  app_version  text not null,
  os           text not null,
  device       text not null,           -- model identifier, e.g. iPhone16,2
  promotion    boolean not null default false,
  low_power    boolean not null default false,
  thermal      smallint not null default 0,   -- ProcessInfo.ThermalState raw value
  period_start timestamptz not null,
  period_end   timestamptz not null,
  n            int not null default 0,  -- samples in the period
  buckets      int[],                   -- counts per bucket edge (section 4), intervals only
  p50          real,
  p95          real,
  max          real,
  value        real,                    -- a single number: memory MB, hang s/h, hitch ms/s
  stack        jsonb,                   -- diagnostics only: frames as {image, uuid, offset}
  created_at   timestamptz not null default now(),
  check (period_end >= period_start)
);
create index if not exists yui_perf_user_idx on public.yui_perf(user_id, app_build, name);

alter table public.yui_perf enable row level security;

-- The phone writes its own rows and reads nothing else.
grant insert (user_id, kind, name, app_build, app_version, os, device, promotion, low_power,
              thermal, period_start, period_end, n, buckets, p50, p95, max, value, stack)
  on public.yui_perf to yui_user;
grant select on public.yui_perf to yui_user;
create policy yui_perf_owner on public.yui_perf for all to yui_user
  using (user_id = public.yui_uid()) with check (user_id = public.yui_uid());

-- The owner's own agents (their connector) read the numbers; nobody else's.
grant select on public.yui_perf to yui_connector;
create policy yui_perf_connector_read on public.yui_perf for select to yui_connector
  using (user_id = public.yui_uid());
```

- **Only numbers fit.** `name` is a snake_case identifier, `stack` holds frames only, and there is no free-text column. A before-insert trigger drops rows over 500 per account per day (the same pattern as the limits in `yui_limits`), so a stuck loop cannot flood the table.
- **Owner only.** A person's rows are theirs. The phone writes as `yui_user`; the owner's agents read through `yui_connector`, so Yui (the agent) sees its owner's phones and a shared agent never sees a client's. No role can update or delete a row, and PROOF Auth and the `authenticated` role get nothing.
- **Retention: 90 days.** A daily job deletes rows older than 90 days; the report keeps its own summary per build (below), so older builds stay comparable after their rows are gone. Deleting the account deletes the rows (`on delete cascade`).

## 6. The daily report

`~/.hermes/profiles/yui/scripts/yui_perf_report.py` reads the owner's `yui_perf` rows as Yui's connector and prints plain text. It keeps one summary per build in `~/.yui-perf-builds.json` (p50, p95 and n per interval, the rest of section 3) so a build can be compared after its rows age out. Flags: `--days N` [1], `--build B` [newest with enough data], `--json`, `--yl` (the Speed panel lines, section 8).

```
Yui speed, build 125 vs 124 (last 24 h, 3 phones, 11.2 foreground hours)

interval            n      p50    p95   budget p95   vs 124
keystroke_render    8412   11     22    33           p95 -6
send_bubble          214   14     41    50           p95 +3
arrive_drawn         198   38     172   150  OVER    p95 +44  WORSE
swipe                321   371    402   420          p95 -8
fullscreen_open       37   44     96    100          p95 +2
thread_open          143   128    281   300          p95 -12
thread_open_cold       9   512    744   800          p95 -60
launch                 6   388    910   1000         p95 +20

hangs          0.8 s/h (124: 1.9)    long hangs 0
scroll hitches 3.1 ms/s (124: 4.5)
memory peak    212 MB (124: 238)     steady 131 MB   30-min growth 6 MB   warnings 0
cpu idle       1.4%
crashes        0

worst stacks (build 125)
  1. hang 1.2 s x3   YuiLines.parse <- ChatStore.apply <- ThreadView.body
  2. hang 0.4 s x2   JSONDecoder.decode <- RealtimeClient.receive
```

- **p50 and p95 per interval** from the merged histograms, with n. An interval with fewer than 20 samples prints `-` instead of numbers.
- **Budget and OVER.** OVER when p95 is past section 2's budget.
- **vs previous build.** The delta of p95 against the previous build that has enough data.
- **WORSE** marks a regression by the rule below.
- **Worst stacks.** The three heaviest hang or crash signatures (a signature is the top five app frames), weighted by total hang time, symbolicated on the Mac.

## 7. The briefing line: only when something got worse

yui-daily-briefing runs the report with `--json` and adds one line to the morning briefing **only** when the newest build is worse than the one before it. No line on a good or unchanged day; the report is there for anyone who asks.

A number is worse when both builds have enough data (20 samples per interval, 2 foreground hours for rates) and:

- an interval's p95 rose by 10% or more and by at least 8 ms (one frame at 120 Hz), or it crossed its budget;
- hangs rose by 0.5 s/h or more, or a long hang (1 s+) appeared;
- scroll hitches rose by 2 ms/s or more, or crossed 5 ms/s;
- memory peak rose by 10% and 20 MB or more, or steady memory crossed its budget;
- a crash signature appeared that the previous build did not have.

The line names the worst one or two, with the numbers and the build:

```
Speed: build 125 is slower where agent messages land (arrive p95 172 ms, was 128, budget 150).
```

## 8. The Speed panel in the war room

A panel on screen 2, under Builds, built from presets the app already draws: `stat` tiles with a spark per build and a `chart`. Every line has an id (`speed-*`, YL.md section 5), so the report patches the numbers in place when a new build's data comes in, with no page jump. `yui_war_room.py` takes the lines from `yui_perf_report.py --yl`.

```
stat@speed-keys 22ms "Typing, p95" delta=-6 spark=31|29|28|28|22 good=down sub="build 125 · budget 33"
stat@speed-arrive 172ms "Messages land, p95" delta=44 spark=131|126|130|128|172 good=down sub="build 125 · budget 150"
stat@speed-hitch 3.1ms/s "Scroll hitches" delta=-1.4 spark=6.2|5.8|5.1|4.5|3.1 good=down sub="under 5 is smooth"
stat@speed-hangs 0.8s/h "Hangs" delta=-1.1 spark=2.6|2.2|2.4|1.9|0.8 good=down sub="per foreground hour"
stat@speed-mem 212MB "Memory peak" delta=-26 spark=251|246|240|238|212 good=down sub="budget 300"
chart@speed-p95 line "p95 by build" x=121|122|123|124|125 y=31|29|28|28|22 y2=58|52|47|38|41 y3=131|126|130|128|172 names=Typing|Send|"Messages land" unit=ms
card@speed-worst "Worst hang: 1.2 s, 3 times" "YuiLines.parse <- ChatStore.apply <- ThreadView.body" sub="build 125 · main thread"
```

The tiles are the five numbers people feel: typing, messages landing, scrolling, hangs and memory. A tile goes red on its own when its delta is the bad way (`good=down`). The chart shows three intervals' p95 across the last five builds, so a fix shows as a step down and a regression as a step up (thread open and launch live in the report: on one axis with typing they would flatten it). The worst-stack card has no button: there is nothing to do from the phone, and the card that fixes it is on the board.

## 9. Steps

- **Step 1 (YUI-98, Sep 25):** this page, the report format, the briefing rule, the playground demo.
- **Step 2 (YUI-102, built Sep 25):** the app side (MetricKit subscriber, signposts on the seven intervals, memory samples, the batching actor, the Dev-build switch), the `yui_perf` migration and its tests, `yui_perf_report.py` with its tests, the war room panel and the briefing line. Proof: rows from a real phone build, the report output, a screenshot of the panel.
- **Then:** YUI-99 (typing), YUI-100 (memory) and YUI-101 (smoothness) each quote this page's numbers before and after.

## 10. As built (YUI-102)

Step 2 follows sections 2 to 8. What the build settled or taught:

- **Where it lives.** App: `Yui/Sources/Perf/` (Perf.swift the signposts, the frame clock and the Dev overlay; PerfStore.swift the histograms, the batch and the unsent rows; PerfMonitor.swift MetricKit, memory samples and the app's lifecycle). Table: migration `20260925120000_yui_perf.sql`. Report: `~/.hermes/profiles/yui/scripts/yui_perf_report.py`. Tests: `YuiTests/PerfTests`, `YuiUITests/SpeedSwitchTests`, `supabase/tests/perf_test.py` (live RLS), `supabase/tests/perf_e2e.py` (the simulator app's rows land), `test_yui_perf_report.py`, `test_yui_war_room.py`.
- **The end frame.** An interval ends at the first display-link callback whose `targetTimestamp` is after the moment the answering change was made. A callback that runs late (its target already past) can't carry the change, so it waits for the next one. Taking the first callback as it came read 0 ms keystrokes on a busy main thread.
- **Where each interval starts.** `keystroke_render`: the text field's binding is set. `send_bubble`: the Send tap, text sends only (a photo's bubble waits on its upload, so photo sends are not timed). `arrive_drawn`: Yui has no realtime socket yet; a thread polls every 1.5 s, so the interval starts when a poll's new agent rows are in hand, not when the server stored them. `swipe`: the pager's scroll phase leaves `interacting`, and ends at `idle`. `fullscreen_open`: `openStage`, ending when the stage view is up. `thread_open`: a change of the selected agent, ending when the thread's first load is in. The first thread shown after launch is `thread_open_cold`, and it also ends `launch`, timed from the process start time (sysctl).
- **Resume.** Under SwiftUI scenes a cold launch also posts `willEnterForeground`, which read as a slow resume. `resume` counts only after the app has been active once.
- **Percentiles.** Interpolating inside a wide bucket can land past the slowest sample (a single 1.1 s resume read p50 1500). The phone caps p50 and p95 at the period's max; the report does the same when merging.
- **Build numbers.** A test build is `130.1`; its rows count as build 130, so a test build and the TestFlight build from the same commit compare as one.
- **Rows.** Memory rows are `mem_footprint` (value and p50 the median MB of the period's 30 s samples, max the peak, n the samples) and `mem_warning` (value the count). MetricKit rows are `fg_time`, `hang_rate` (s/h), `hitch_ratio` (ms/s), `mem_peak`, `mem_avg`, `cpu_time`, `launch_mk` and `resume_mk` (histograms in the section 4 buckets, each MetricKit bucket counted at its midpoint), and diagnostics `hang` (value the seconds), `crash`, `cpu_exception` and `disk_write`. `mem_growth` (section 3) is YUI-100's scripted session; the report prints `-` until it sends one.
- **Stacks.** MetricKit often puts the image's load address in `offsetIntoBinaryTextSegment`; the offset is then the frame's `address` minus it. Frames keep only binary name (letters, digits, `_.+-`), UUID and offset, top 32. `devbuild.sh` and `testflight.sh` keep each build's dSYMs in `~/.yui-dsyms/<build>/`, where the report looks first.
- **The table.** Beyond section 5: `app_version`, `os` and `device` are held to digits-and-dots and model patterns (`iPhone17,2`, or `arm64` on the simulator), `buckets` is exactly 18 counts, `stack` is 1 to 100 frames on diagnostic rows only (16 KB at most). The connector reads only while it is live (`yui_connector_live()`: not revoked, not suspended, owner not suspended). Past 500 rows a day a row is dropped and the request still answers 201, so the phone never retries it. Every row in a batch carries every column (`null` when absent); PostgREST refuses a batch with mixed keys. Retention runs in the daily media sweep.
- **Enough data.** A build has enough data with any interval at n 20 or more, or 2 foreground hours. Foreground hours are the larger of MetricKit's foreground time and the memory samples times 30 s.
- **First phone rows (Sep 26).** TestFlight 135 on an iPhone17,2, iOS 26.6.2: 38 rows in 40 minutes, typing p95 70 ms (n 52, budget 33), memory 316 MB steady and 328 MB peak (budget 300), launch and cold thread open 2.4 to 2.7 s with one or two samples each. One batch arrived twice, 19 s apart, across a relaunch: the phone clears unsent rows only after the server answers, so a send that lands as iOS suspends the app goes again next launch. The report drops rows identical in every column but `id` and `created_at`; YUI-107 adds a row key so the table stores it once.

## Sources

- Apple, [Understanding hitches in your app](https://developer.apple.com/documentation/xcode/understanding-hitches-in-your-app) and the tech talk [Explore UI animation hitches and the render loop](https://developer.apple.com/videos/play/tech-talks/10855/): hitch time ratio, good under 5 ms/s, critical over 10.
- Apple, [Improving app responsiveness](https://developer.apple.com/documentation/xcode/improving-app-responsiveness): what counts as a hang (250 ms and more) and how to find one.
- Apple, [Optimizing App Launch](https://developer.apple.com/videos/play/wwdc2019/423/) (WWDC19): 400 ms to the first frame.
- Apple, [Optimizing ProMotion refresh rates](https://developer.apple.com/documentation/quartzcore/optimizing-promotion-refresh-rates-for-iphone-13-pro-and-ipad-pro): 120 Hz, 8.3 ms frames.
- Apple, [MetricKit](https://developer.apple.com/documentation/metrickit), [MXAnimationMetric](https://developer.apple.com/documentation/metrickit/mxanimationmetric), [OSSignposter](https://developer.apple.com/documentation/os/ossignposter), [Reducing your app's memory use](https://developer.apple.com/documentation/xcode/reducing-your-app-s-memory-use).
- Jakob Nielsen, [Response Times: The 3 Important Limits](https://www.nngroup.com/articles/response-times-3-important-limits/): 0.1 s feels instant, 1 s keeps the flow.
- [Telegram-iOS](https://github.com/TelegramMessenger/Telegram-iOS): the message list is built on its fork of Texture (AsyncDisplayKit), with layout and drawing off the main thread.
