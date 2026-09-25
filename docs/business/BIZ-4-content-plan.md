# Yui | content plan, built in public

Draft 1, Sep 24 2026. Card BIZ-4. Public, like the rest of the project. Google Doc: https://docs.google.com/document/d/18RkaUzHQTy8FhnKnEGP0sqE7KLfBhJFkaxLbl5_KAaY/edit

**Current plan:** the [go-to-market plan](https://www.yuigui.com/business/gtm) (SITE-20, Sep 24) pulls this doc and BIZ-5 (social accounts) into one page with the first 30 days. This doc stays as the detail. Where they differ, the GTM plan wins.

Companion docs: [BIZ-1 marketing and positioning](https://www.yuigui.com/business/biz-1-marketing-positioning) (what we say, what we never claim), [BIZ-2 outreach plan](https://www.yuigui.com/business/biz-2-outreach-plan) (where Hermes users are, message drafts), [BIZ-3 revenue models](https://www.yuigui.com/business/biz-3-revenue-models) (no dark patterns). Per-account bios and voice are BIZ-5.

**Nothing in this doc has been posted.** Every social post below is a draft. The open source grant covers publishing code, docs and progress on yuigui.com and GitHub. It does not cover posts on social accounts or in other people's communities. Those go out only after Chris approves them.

## The short version

- **The engine:** real progress in, drafts out. Every shipped card already writes a line to `site/content/progress.json`. That line, plus the screenshot or screen recording that proves it, becomes the raw material for every post. We never write content about something that has not shipped.
- **Modeled on Justice Watch:** one source of truth, an agent that drafts from it, a validator that hard-fails bad copy, and a runway of scheduled posts days ahead. The difference: Justice Watch runs on pre-approved drafts. Yui social posts are Chris-approved one by one until he says otherwise.
- **Four kinds of content:** ship posts (every TestFlight build, every new preset), the Friday weekly update (already running), long-form pieces (one every week or two), and demo videos (short clips per preset, one hero video, one walkthrough).
- **Who does what:** the agent drafts, records, validates and queues. Chris approves, and posts himself from his own accounts. Nobody posts in someone else's community without Chris.
- **Cadence:** a steady trickle beats a launch-day dump. About one post a day on @yuiguiai at most, one founder post a week from Chris, one long-form piece every week or two, the weekly update every Friday, never skipped.
- **Gates:** social posting starts when the @yuiguiai handles exist (BIZ-5, Chris creates them). Community posts wait for the BIZ-2 gate: the plugin installs on a machine that is not Chris's and the public TestFlight link works (YUI-22). Video-led posts wait for the recording pipeline.

## Part 1 | What we learned from Justice Watch (and Vibe Jam)

Justice Watch has published one post a day on the AMC Defense Law site for months with almost no human time. What makes it work, and what we copy:

| Justice Watch | What it does | Yui version |
|---|---|---|
| Aaron's drafts | One trusted source of content | `progress.json` entries, commits, screenshots. Only things that shipped |
| One card per post | Each piece is tracked, retried, proven | One draft file per post in a queue, one card per long-form piece |
| Layout contract + validator | A script hard-fails a bad post before it can reach a commit | `social/validate.mjs` hard-fails banned words, em dashes, claims from BIZ-1's "must not claim" list, a token multiplier without the split, missing media, over-length posts |
| Future-dated runway | One post per day, always scheduled ahead, never a same-day dump | The queue keeps a week of approved posts ahead, like Vibe Jam's 8-day view |
| High-water mark | A missed run cannot silently drop source material | The drafter tracks the last `progress.json` entry it used, not a time window |
| Silent on success | Chris hears only about failures | One review message a day, only when there is something to approve |

Two lessons from Vibe Jam's social pipeline (the fleet's other content engine):

- **Carousels that explain beat one image and a long caption.** Chris called a single-image post "very uninspiring." On Instagram and LinkedIn, every Yui explainer is a 5 to 8 slide carousel, one idea per slide, a hook on slide 1, a one-line caption, no hashtags.
- **Build ahead and use the infra we already have.** Vibe Jam posts through its own site's queue and scheduler, with a week always visible. Yui should reuse that code, not invent a second system.

## Part 2 | The four kinds of content

### 2.1 Ship posts (from real progress)

Triggered by a new `progress.json` entry. One entry can make zero to three posts. Most small ships make one.

| Trigger | What to show | Format |
|---|---|---|
| New TestFlight build | What changed, one screenshot of it on a real phone frame | X post with 1 image; build number in the text |
| New preset (a Yui Lines type) | The line of text next to the screen it draws | X post: the line as code + a 5 to 10 second clip. Short video for YouTube Shorts, TikTok, Reels |
| Before and after | Old screen next to new, or the text reply next to the Yui screen | X image pair; IG/LinkedIn carousel with the compare slider |
| Beta feedback acted on | The feedback (paraphrased, no names) and the fix, with the time between them | X post; good weekly-update material |
| Spec or benchmark change | The number, always with the split (1.6x vs lean JSON, 2.7x vs pretty JSON, 3.9x vs component tree) | X thread; link to /yl |
| Open source milestone | First outside issue, first outside PR, a new parser in another language | X post thanking the contributor by GitHub handle, if they are fine with it |

The hook for most ship posts is the same shape as the origin story: **what the agent used to send, and what it sends now.** "Asked for 40/20 intervals, got a paragraph. Now it's a timer."

### 2.2 The weekly update (already running)

Cron `yui-weekly-update`, Fridays 17:00 ET, writes one entry on [yuigui.com/progress](https://www.yuigui.com/progress): what shipped, what is next, one honest problem. That entry stays the anchor of the week. What this plan adds:

- A Friday X thread that links it: 3 to 5 posts, one per shipped thing, each with its image.
- A Friday LinkedIn post from Chris (founder voice, one paragraph, one image).
- If nothing shipped, the thread is one post that says so and names what is blocking. The build-in-public promise is that we say the slow weeks out loud too.

### 2.3 Long-form pieces

Published on yuigui.com first (the site is the public record), then shared. 800 to 1,500 words, plain words, a screenshot or diagram every few paragraphs, honest numbers. Each gets its own card so it has a proof trail.

| # | Working title | The point | Needs first |
|---|---|---|---|
| L1 | My trainer agent sent me a paragraph | The origin. Chris mid-workout, Arnold's wall of text, "If it asks me a question, I just want a button." Ends with the one line that draws a timer now | Screenshot of the old Telegram reply + the Yui timer |
| L2 | Why presets beat generated code | Agents should pick a screen and fill it in, not write HTML. Cheaper, safe by design, works with small local models, allowed on the App Store. Honest: A2UI and OpenUI share the catalog idea; our bet is native and tiny | ROADMAP "core bet" section, playground links |
| L3 | Yui Lines: one line, one screen | The spec in plain words, the benchmark with all three numbers, how to write a parser, the conformance suite | spec/YL.md, spec/BENCHMARK.md |
| L4 | Why Yui is open source, business docs included | Adoption, trust, and competing with big-company agent apps by being the one you can read. Links to /business | Nothing, can go first |
| L5 | Building an iPhone app with a team of agents | How the build actually runs: a kanban board, agent workers, 14 TestFlight builds in two days, what broke. The most interesting piece for Hacker News | A clear, honest account of the process, no secrets or costs |
| L6 | Every agent looks like itself | Per-agent colors and feel, why a fleet should not look like one chat app | YUI-20 shipped |
| L7 | What we measure, and what we won't | Time to first screen, screens per conversation; never time in app, never reading messages (BIZ-1 Part 8) | First real numbers from beta |

Rule from BUILD-IN-PUBLIC.md applies to all of it: no credentials, costs or spend, client names, Chris's personal details, other agents' private data, or anything from AMC.

### 2.4 Demo videos

| Video | Length | Where | Status |
|---|---|---|---|
| Hero: the agent draws a screen | 20 s | README, site hero, pinned on X, Show HN | Owner SITE-3, not made yet |
| One clip per preset (timer, choose, form, chart, gallery, compare, storyboard...) | 5 to 15 s | X, YouTube Shorts, TikTok, Reels | From the recording pipeline (Part 5) |
| Pairing: terminal command next to the phone | 45 to 60 s | README quickstart, YouTube, Discord post | Needs YUI-22 public TestFlight |
| Walkthrough: a day with three agents | 3 min | YouTube, site | After per-agent themes (YUI-20) |

Rules: real app, real agent, no mockups passed off as the app. Captions burned in (most people watch muted). No music that needs a license. Vertical 9:16 for shorts, 16:9 for YouTube and the site.

## Part 3 | Formats per platform

Handles are `yuiguiai` everywhere (BIZ-5 writes the bios and per-account voice). "Chris" means his personal account.

| Platform | Account | What goes there | Format | Cadence (max) |
|---|---|---|---|---|
| yuigui.com | site | Ship log, weekly update, long-form, business docs | Page | Every ship, every Friday |
| GitHub | postscarcityai | Releases with notes, README hero video, good-first-issues | Release notes, markdown | Every tagged release |
| X | @yuiguiai | Ship posts, Friday thread, benchmark posts, replies | 1 image or 5 to 15 s clip; code line as text | 1 a day |
| X | Chris | Origin story, founder notes, launch posts | Plain text + 1 image | 1 a week |
| YouTube | @yuiguiai | Shorts per preset, pairing video, walkthrough | 9:16 shorts, 16:9 long | 2 shorts a week once recording works |
| TikTok, Instagram Reels | @yuiguiai | Same clips as Shorts, captions rewritten per app | 9:16 | 2 a week |
| Instagram feed | @yuiguiai | Explainer carousels (how Yui Lines works, before/after) | 5 to 8 slides, 4:5, no hashtags | 1 a week |
| LinkedIn | Chris | Founder voice: open source, building with agents, the long-form pieces | Text + 1 image or carousel (PDF) | 1 a week |
| Threads, Bluesky | @yuiguiai | Same as X, rewritten, not pasted | Text + image | Mirrors X, lower priority |
| Nous Discord | Chris | One post per real milestone (plugin, public TestFlight) | Per BIZ-2 3.2 | At most 1 a month |
| Reddit | Chris | One build write-up, disclosure included | Per BIZ-2 3.4 | 1 in these six weeks |
| Hacker News | Chris | Show HN only, at BIZ-1 Stage 3 | Per BIZ-1 | Once, when the gate is met |
| Product Hunt | Chris + @yuiguiai | After Show HN | Gallery + 30 s video | Once |

Never the same text in two places. Every platform gets its own cut.

## Part 4 | Who drafts, who approves

| Step | Who | Notes |
|---|---|---|
| Ship log entry on the site | The card that shipped the work | Already the rule. No sign-off needed (open source grant) |
| Weekly update on the site | Cron `yui-weekly-update` (urza) | Already running. No sign-off needed |
| Long-form piece on the site | urza, one card per piece | Published on the site under the grant. Chris gets the link, not a review request |
| Screenshots and recordings | urza, from the app and the playground | Real app only |
| Social post drafts | urza, the drafter cron (Part 5) | Validated before Chris sees them |
| Approving social posts | Chris | One review message a day, only when new drafts exist, opening with 🔴 because it is a publishing ask |
| Posting on @yuiguiai | The scheduler, after approval | Only approved rows go out |
| Posting on Chris's accounts | Chris | His voice, his account, he presses the button |
| Posts in other communities (Discord, Reddit, HN, PH, awesome lists) | Chris, from BIZ-2 drafts | Always Chris-gated |
| Replies and comments | Chris for his accounts; urza drafts replies for @yuiguiai, Chris approves | No auto-replies |

Worth deciding after two weeks: Chris lifted the approval step for Hank's Vibe Jam brand once the posts were consistently good. The same could apply to @yuiguiai ship posts (not to Chris's accounts or other communities). My recommendation: keep the gate for the first two weeks, then look at how many drafts he changed. If it is close to none, lift it for ship posts only.

## Part 5 | Automation proposal

Proposed, not built. Each piece is its own card.

### 5.1 The drafter (cron `yui-social-drafter`, urza, daily 18:30 ET)

1. Read `site/content/progress.json` from `~/dev/yuigui` main. Take every entry newer than the high-water mark in `social/state.json`. Not "the last 24 hours": Justice Watch lost documents to a time window once, and a high-water mark cannot.
2. For each entry, pick the post types from the table in 2.1 and write one draft file per platform to `social/queue/<date>-<slug>-<platform>.md`:
   ```
   ---
   platform: x
   account: yuiguiai
   source: progress.json 2026-09-24 "Talk to your agent in Yui"
   media: [site/public/demo/<file>.jpg]
   slot: 2026-09-29T09:00:00-04:00
   status: draft
   ---
   <post text>
   ```
3. Media comes from `site/public/demo/`, the app's UI test screenshots, and the recordings in 5.3. A draft with no real media is dropped, not posted as text-only filler.
4. Run the validator. Anything that fails is fixed or dropped before Chris sees it.
5. Advance the high-water mark. Commit the queue (it is public like everything else; drafts are marked `status: draft` so nobody mistakes them for posts).
6. If there are new drafts, send Chris one Telegram message: 🔴 first line, "Asking to publish N posts on @yuiguiai", then each draft numbered with its text and slot. He answers "ok 1 3", "edit 2: ..." or "no". Silent when there is nothing new.

### 5.2 The validator (`social/validate.mjs`)

Hard fails, like Justice Watch's `validate-blog-mdx.py`:

- Em dashes. Banned words: revolutionary, seamless, AI-powered, next-generation, supercharge, "the future of", and the fleet's list (leverage, delve, additionally, furthermore, crucial, pivotal, landscape, notably, vital).
- BIZ-1's must-not-claim list: "first", "most compact", "any agent" / "every agent framework", "native, unlike everyone".
- A token multiplier that is not 1.6x, 2.7x or 3.9x, or one of those quoted without naming what it is against.
- Email addresses, phone numbers, API keys, dollar amounts (no costs or spend), client names, anything AMC.
- Over the platform limit (X 280 unless it is a thread; captions per BIZ-5).
- A media path that does not exist on disk.
- Two posts on the same account in the same slot.

### 5.3 The recording pipeline

Clips need to be cheap or they will not happen. Proposal: a `YuiDemo` UI test in the app repo that plays a scripted Yui Lines conversation per preset in the simulator while `xcrun simctl io booted recordVideo` captures it, then trims to 9:16 and 16:9 with `ffmpeg` and burns in one caption. Output to `yuigui/site/public/demo/clips/`. Run on demand and after any card that adds a preset. Real device recordings from Chris's phone beat simulator clips for the hero video, so SITE-3 stays a human-in-the-loop piece.

### 5.4 The scheduler (reuse Vibe Jam's)

Vibe Jam already has a working queue: a posts table, an admin page that shows a week ahead, and a Vercel cron that posts to Instagram and X, with the double-post and token-refresh bugs fixed on Sep 23. Port that code into the yuigui.com site with a `yui_social_posts` table in the PostScarcity AI Supabase project (PROOF, every table prefixed `yui_`). Approved drafts move from `social/queue/` into the table with their slot. Until the handles exist and Chris approves the first batch, this stays unbuilt and nothing posts.

### 5.5 Long-form route

Long-form pieces need a home. Proposal: `/notes`, rendered from `docs/notes/*.md` the same way `/business` renders `docs/business/`. Linked from the site nav and from each weekly update.

## Part 6 | The first six weeks

Weeks start Monday. "Ship slot" means whatever actually shipped that week becomes the post; if nothing shipped, the slot stays empty. Posts that need something not ready yet say so in brackets and slide a week if it is late.

### Week 1 | Sep 28 to Oct 4: the record and the story

- Site: long-form **L4 Why Yui is open source**. Everything it needs exists.
- Site: build `/notes` (5.5) so L4 has a home.
- Chris, X and LinkedIn: the origin story, short version of L1, with the Telegram-paragraph screenshot next to the Yui timer.
- @yuiguiai: nothing yet unless the handles exist [needs BIZ-5, Chris creates the pages]. If they do: one pinned post linking yuigui.com/progress.
- Friday: weekly update (cron) + Chris's LinkedIn note.
- Automation: validator (5.2) and drafter (5.1) built and dry-run against the last two weeks of `progress.json`, drafts only.

### Week 2 | Oct 5 to Oct 11: the drafter goes live

- Drafter runs daily; Chris approves the first real batch.
- @yuiguiai: 3 to 5 ship posts from the week's `progress.json` [needs handles].
- Site: long-form **L1 My trainer agent sent me a paragraph**, full version.
- Recording pipeline (5.3) built; first clips: timer, choose, form.
- Friday: weekly update + first Friday X thread.

### Week 3 | Oct 12 to Oct 18: show the presets

- Shorts: 2 preset clips (timer, gallery or compare) on YouTube, TikTok and Reels [needs recording pipeline].
- Instagram: first carousel, "How one line of text becomes a screen," 6 slides.
- Site: long-form **L2 Why presets beat generated code**.
- Ship slots on @yuiguiai.
- Review point: how many drafts did Chris edit? Decide on the gate for @yuiguiai ship posts (Part 4).

### Week 4 | Oct 19 to Oct 25: the spec and the numbers

- Site: long-form **L3 Yui Lines: one line, one screen**, with the full benchmark split.
- X thread: the benchmark, all three numbers, method linked. Invite someone to write a parser in a language we lack (a good-first-issue on GitHub).
- Shorts: 2 more preset clips (chart, storyboard).
- Pairing video, if the public TestFlight link is live [needs YUI-22].
- Ship slots.

### Week 5 | Oct 26 to Nov 1: first outside users

- If the BIZ-2 gate is met (plugin installs cleanly on someone else's machine, public TestFlight works): Chris posts the Nous Discord message and the plugin catalog PR from BIZ-2. Content this week supports that: the pairing video pinned, README hero video [needs SITE-3].
- If the gate is not met: say so in the weekly update and keep shipping posts. Do not post in communities early.
- Site: long-form **L5 Building an iPhone app with a team of agents**.
- Shorts: 2 clips.

### Week 6 | Nov 2 to Nov 8: listen and write it down

- Chris, Reddit: one build write-up in r/hermesagent per BIZ-2 3.4, only if the gate was met in week 5 and someone checked the sub's rules from a logged-in browser.
- @yuiguiai: posts built from beta feedback acted on (fix, and how long it took).
- Instagram: second carousel, before and after (Telegram reply vs Yui screen).
- Site: **L6** if per-agent themes shipped, otherwise **L7** with whatever beta numbers exist, or skip it and say why.
- Retro in the weekly update: what posts worked, what got ignored, what changes for weeks 7 to 12.

## Part 7 | How we know it is working

Few numbers, reported honestly in the Friday update where they are public-safe:

- Invite requests and TestFlight installs per week, and which post or page they came from.
- Outside GitHub issues and PRs. This matters more than stars.
- Plays and completion on the preset clips (do people watch a 10-second clip to the end?).
- Drafts approved unchanged vs edited vs rejected. This is the agent's report card.
- Posts skipped because nothing shipped. Zero is not the goal; honesty is.

Not tracked: follower counts as a goal, engagement bait, anything that needs reading users' messages.

## Open questions for Chris

1. Handles: when will the @yuiguiai pages exist? Week 1 social posts wait on them.
2. Approval: one Telegram review message a day (my recommendation), or a weekly batch on Sunday?
3. The gate on @yuiguiai ship posts: keep it, or lift it after two clean weeks like Vibe Jam?
4. Founder posts: are you willing to post the origin story on your own X and LinkedIn in week 1? It is the best hook we have and it lands better from you than from a brand account.
5. Scheduler: OK to port the Vibe Jam scheduler code into yuigui.com rather than build a new one?
